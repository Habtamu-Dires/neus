package com.neus.user_exam.dto;

import com.neus.user_exam.CorrectAnswer;
import com.neus.user_exam.ExamMode;
import com.neus.user_exam.UserAnswer;
import com.neus.user_exam.UserExamStatus;
import lombok.Builder;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Map;

@Builder
@Validated
public record UpdateUserExamDto(
    String examId,
    ExamMode mode,
    UserExamStatus status,
    Integer timeLeftInMinutes,
    List<UserAnswer> userAnswers,
    List<CorrectAnswer> correctAnswers
) {}
