package com.neus.user_exam.dto;

import com.neus.user_exam.CorrectAnswer;
import com.neus.user_exam.UserAnswer;
import com.neus.user_exam.UserExamStatus;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Builder
public record UserExamDto(
    String userId,
    String examId,
    String mode,
    UserExamStatus status,
    LocalDateTime lastModifiedDate,
    Integer timeLeftInMinutes,
    List<UserAnswer> studyModeUserAnswers,
    List<CorrectAnswer> studyModeCorrectAnswers,
    List<UserAnswer> testModeUserAnswers,
    List<CorrectAnswer> testModeCorrectAnswers
) {}
