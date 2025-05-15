package com.neus.question_choice_stats.scheduled_batch;

import com.neus.user_exam.UserAnswer;
import com.neus.user_exam.UserExam;
import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.database.JdbcBatchItemWriter;
import org.springframework.batch.item.database.JpaPagingItemReader;
import org.springframework.batch.item.database.builder.JdbcBatchItemWriterBuilder;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableBatchProcessing
@RequiredArgsConstructor
public class ChoiceStatsBatchConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager platformTransactionManager;
    private final EntityManagerFactory entityManagerFactory;
    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    /**
     * Defines the batch job with two steps: process (read/process/write to temp table) and aggregate (finalize stats).
     */
    @Bean
    public Job choiceStatsJob(Step processStep, Step aggregateStep) {
        return new JobBuilder("choiceStatsJob", jobRepository)
                .start(processStep)
                .next(aggregateStep)
                .build();
    }

    /**
     * Step 1: Reads UserExam records in chunks of 1000, processes them into TempChoiceStat objects,
     * and writes to temp_choice_stats.
     */
    @Bean
    public Step processStep() {
        return new StepBuilder("processStep", jobRepository)
                .<UserExam, List<TempChoiceStat>>chunk(100, platformTransactionManager)
                .reader(userExamReader())
                .processor(choiceStatsProcessor())
                .writer(tempStatsWriter())
                .build();
    }

    /**
     * Step 2: Aggregates temp_choice_stats into question_choice_stats and truncates the temp table.
     */
    @Bean
    public Step aggregateStep() {
        return new StepBuilder("aggregateStep", jobRepository)
                .tasklet(aggregateTasklet(), platformTransactionManager)
                .build();
    }

    /**
     * Tasklet to perform final aggregation and cleanup.
     * Executes two SQL queries: one to aggregate stats, one to truncate the temp table.
     */
    @Bean
    public Tasklet aggregateTasklet() {
        return (contribution, chunkContext) -> {
            // Truncate question_choice_stats to start fresh, removing outdated stats from previous exam attempts
            jdbcTemplate.update("TRUNCATE TABLE question_choice_stats");
            // update
            jdbcTemplate.update(
            """
                WITH question_responses AS (
                    SELECT
                        exam_id,
                        question_id,
                        COUNT(DISTINCT user_id) AS total_responses
                    FROM temp_choice_stats
                    GROUP BY exam_id, question_id
                )
                INSERT INTO question_choice_stats (exam_id, question_id, choice_id, selection_count, total_responses, percentage, last_updated)
                SELECT
                    t.exam_id,
                    t.question_id,
                    t.choice_id,
                    SUM(t.selection_count) AS selection_count,
                    qr.total_responses,
                    (SUM(t.selection_count)::FLOAT / NULLIF(qr.total_responses, 0) * 100) AS percentage,
                    CURRENT_TIMESTAMP
                FROM temp_choice_stats t
                JOIN question_responses qr
                    ON t.exam_id = qr.exam_id AND t.question_id = qr.question_id
                GROUP BY t.exam_id, t.question_id, t.choice_id, qr.total_responses
                ON CONFLICT (exam_id, question_id, choice_id)
                DO UPDATE SET
                    selection_count = EXCLUDED.selection_count,
                    total_responses = EXCLUDED.total_responses,
                    percentage = EXCLUDED.percentage,
                    last_updated = EXCLUDED.last_updated
                """
            );
            jdbcTemplate.update("TRUNCATE TABLE temp_choice_stats");
            return RepeatStatus.FINISHED;  // job is finished don't run it again
        };
    }

    /**
     * Reader: Fetches UserExam records in pages of 1000 using JPA.
     * Uses JPQL to filter completed exams.
     */
    @Bean
    public JpaPagingItemReader<UserExam> userExamReader() {
        JpaPagingItemReader<UserExam> reader = new JpaPagingItemReader<>();
        reader.setEntityManagerFactory(entityManagerFactory);
        reader.setQueryString("SELECT u FROM UserExam u WHERE u.status = 'COMPLETED'");
        reader.setPageSize(100);
        return reader;
    }

    /**
     * Processor: Converts each UserExam into a list of TempChoiceStat objects,
     * one per UserAnswer, including examId.
     */
    @Bean
    public ItemProcessor<UserExam, List<TempChoiceStat>> choiceStatsProcessor() {
        return userExam -> {
            List<TempChoiceStat> stats = new ArrayList<>();
            for (UserAnswer answer : userExam.getTestModeUserAnswers()) {
                stats.add(
                    TempChoiceStat.builder()
                        .examId(userExam.getExam().getId())
                        .questionId(answer.questionId())
                        .choiceId(answer.choiceId())
                        .userId(userExam.getUser().getId())
                        .selectionCount(1)
                        .build()
                    );
            }
            return stats;
        };
    }

    /**
     * Writer: Flattens List<TempChoiceStat> and writes to temp_choice_stats in batches.
     */
    @Bean
    public ItemWriter<List<TempChoiceStat>> tempStatsWriter() {
        JdbcBatchItemWriter<TempChoiceStat> jdbcWriter = new JdbcBatchItemWriterBuilder<TempChoiceStat>()
                .dataSource(dataSource)
                .sql("INSERT INTO temp_choice_stats (exam_id, question_id, choice_id, user_id, selection_count) VALUES (?, ?, ?, ?, ?)")
                .itemPreparedStatementSetter((item, ps) -> {
                    ps.setLong(1, item.getExamId());
                    ps.setString(2, item.getQuestionId());
                    ps.setString(3, item.getChoiceId());
                    ps.setLong(4, item.getUserId());
                    ps.setInt(5, item.getSelectionCount());
                })
                .build();

        return items -> {
            List<TempChoiceStat> flattened = items.getItems().stream()
                    .flatMap(List::stream)
                    .collect(Collectors.toList());
            jdbcWriter.write(new org.springframework.batch.item.Chunk<>(flattened));
        };
    }

}

