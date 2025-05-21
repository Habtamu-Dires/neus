package com.neus.exam;

import com.neus.common.NumberDto;
import com.neus.exam.dto.ExamNameDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExamRepository extends JpaRepository<Exam,Long>, JpaSpecificationExecutor<Exam> {


    @Query("""
            SELECT e FROM Exam e WHERE e.id = :id
            """)
    Optional<Exam> findByResourceId(Long id);

    @Query("""
            SELECT e FROM Exam e WHERE e.externalId = :externalId
            """)
    Optional<Exam> findExternalId(UUID externalId);

    @Query("""
            SELECT DISTINCT new com.neus.common.NumberDto (
                e.year
            )
            FROM Exam e
            WHERE e.examType = :examType
            """)
    List<NumberDto> findYearsByExamType(ExamType examType);

    @Query("""
            SELECT new com.neus.exam.dto.ExamNameDto (
                e.externalId,
                e.resource.title,
                e.year
            )
            FROM Exam e
            WHERE e.examType = :examType
            AND e.year = :year
    """)
    List<ExamNameDto> findExamNamesByExamTypeAndYear(ExamType examType, int year);

    @Query("""
            SELECT new com.neus.exam.dto.ExamNameDto (
                e.externalId,
                e.resource.title,
                e.year
            )
            FROM Exam e
            WHERE e.examType = :examType
            """)
    List<ExamNameDto> findExamNamesByExamType(ExamType examType);
}
