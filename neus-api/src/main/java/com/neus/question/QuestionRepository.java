package com.neus.question;

import com.neus.exam.ExamType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question,Long>, JpaSpecificationExecutor<Question> {

    @Query("""
            SELECT q FROM Question q WHERE q.exam.id = :examId ORDER BY q.questionNumber
            """)
    List<Question> findByExamId(Long examId);

//    @Query("""
//            SELECT q FROM Question q WHERE q.exam.id = :examId ORDER BY q.questionNumber
//            """)
//    List<Question> findPreviewQuestions(Long examId, Pageable pageable);

    @Query("""
            SELECT q FROM Question q WHERE q.externalId = :externalId
            """)
    Optional<Question> findByExternalId(UUID externalId);

    @Query("""
            SELECT DISTINCT q.department
            FROM Question q
            JOIN q.exam e
            WHERE e.examType = :examType
            AND e.year = :year
            """)
    List<Department[]> findDepartmentsByExamTypeAndYear(ExamType examType, Integer year);

    @Query("""
            SELECT q.blockNumber
            FROM Question q
            JOIN q.exam e
            WHERE e.examType = :examType
            AND e.year = :year
            AND q.department = :department
    """)
    List<BlockNumber> findBlocksByExamTypeAndYearAndDepartment(
                ExamType examType, int year, Department department
    );

    @Query(value = """
            SELECT * FROM question q WHERE q.exam_id = :examId ORDER BY RANDOM()
            """,
            nativeQuery = true)
    List<Question> findRandomQuestion(Pageable page, Long examId);
}
