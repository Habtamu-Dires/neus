package com.neus.exam.dto;

import com.neus.common.SubscriptionLevel;
import com.neus.question.dto.QuestionDetailDto;
import com.neus.question.dto.QuestionDto;
import lombok.Builder;

import java.util.List;

@Builder
public record ExamDetailDto(
        String title,
        String description,
        int duration,
        SubscriptionLevel requiredSubLevel,
        List<QuestionDetailDto> questions       // Full access
) {}
