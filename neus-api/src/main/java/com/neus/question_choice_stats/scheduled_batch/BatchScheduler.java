package com.neus.question_choice_stats.scheduled_batch;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class BatchScheduler {

    private final JobLauncher jobLauncher;
    private final Job choiceStatsJob;
    private final JobExplorer jobExplorer;

    @Scheduled(cron = "0 */2 * * * ?")
    private void runQuestionChoiceStatsJob() throws Exception {
        log.info("Started running Question Choice Stats Job");
        JobParameters jobParameters = new JobParametersBuilder(jobExplorer)
                .addLong("startAt", System.currentTimeMillis())
                .toJobParameters();
        jobLauncher.run(choiceStatsJob, jobParameters);
        log.info("Question Choice Stats Job Done");
    }

}
