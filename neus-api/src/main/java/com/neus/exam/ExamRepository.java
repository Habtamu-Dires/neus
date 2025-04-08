package com.neus.exam;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface ExamRepository extends JpaRepository<Exam,Long> {


    @Query("""
            SELECT e FROM Exam e WHERE e.id = :id
            """)
    Optional<Exam> findByResourceId(Long id);

    @Query("""
            SELECT e FROM Exam e WHERE e.externalId = :externalId
            """)
    Optional<Exam> findExternalId(UUID externalId);
}
