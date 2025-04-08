package com.neus.exam.dto;

import com.neus.question.dto.QuestionDto;
import lombok.Builder;

import java.time.Duration;
import java.util.List;

@Builder
public record ExamDto(
        String title,
        String description,
        Duration duration,
        List<QuestionDto> questions,        // Full access
        List<QuestionDto> previewQuestions //preview only
) {}
