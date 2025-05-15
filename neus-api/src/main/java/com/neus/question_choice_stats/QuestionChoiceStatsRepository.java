package com.neus.question_choice_stats;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface QuestionChoiceStatsRepository extends JpaRepository<QuestionChoiceStats,QuestionChoiceStatsId> {

    @Query("SELECT qcs FROM QuestionChoiceStats qcs WHERE qcs.id.examId = :examId")
    List<QuestionChoiceStats> findByExamId(@Param("examId") Long examId);

    @Query("SELECT qcs FROM QuestionChoiceStats qcs WHERE qcs.id.questionId IN :ids")
    List<QuestionChoiceStats> findByQuestionIds(@Param("ids") List<String> ids);
}
