package com.neus.exam.dto;

import com.neus.common.SubscriptionLevel;
import com.neus.question.dto.QuestionDto;
import lombok.Builder;

import java.time.Duration;
import java.util.List;

@Builder
public record ExamDto(
        String id,
        String title,
        String department,
        String description,
        int duration,
        int numberOfQuestions,
        SubscriptionLevel requiredSubLevel
) {}
