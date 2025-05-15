package com.neus.user_exam;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface UserExamRepository extends JpaRepository<UserExam,Long> {

    @Query("""
            SELECT ue FROM UserExam ue 
            WHERE ue.user.externalId = :userId
            AND ue.exam.externalId = :examId
            """)
    Optional<UserExam> findByUserIdAndExamId(String userId, UUID examId);
}
