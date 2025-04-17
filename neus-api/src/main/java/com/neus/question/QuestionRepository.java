package com.neus.question;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question,Long> {

    @Query("""
            SELECT q FROM Question q WHeRE q.exam.id = :examId
            """)
    List<Question> findByExamId(Long examId);

    @Query("""
            SELECT q FROM Question q WHERE q.exam.id = :examId
            """)
    List<Question> findPreviewQuestions(Long examId, Pageable pageable);

    @Query("""
            SELECT q FROM Question q WHERE q.externalId = :externalId
            """)
    Optional<Question> findByExternalId(UUID externalId);
}
