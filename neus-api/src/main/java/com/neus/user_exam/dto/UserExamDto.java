package com.neus.user_exam.dto;

import com.neus.user_exam.CorrectAnswer;
import com.neus.user_exam.UserAnswer;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record UserExamDto(
    String userId,
    String examId,
    String mode,
    LocalDateTime lastModifiedDate,
    Integer timeLeftInMinutes,
    List<UserAnswer> studyModeUserAnswers,
    List<CorrectAnswer> studyModeCorrectAnswers,
    List<UserAnswer> testModeUserAnswers,
    List<CorrectAnswer> testModeCorrectAnswers
) {
}
