package com.neus.exam.dto;

import com.neus.common.SubscriptionLevel;
import com.neus.exam.ExamType;
import com.neus.question.BlockNumber;
import com.neus.question.Department;
import com.neus.question.dto.QuestionDto;
import lombok.Builder;

import java.time.Duration;
import java.util.List;

@Builder
public record ExamDto(
        String id,
        String title,
        String description,
        ExamType examType,
        Integer year,
        Integer duration,
        Integer numberOfQuestions,
        SubscriptionLevel requiredSubLevel,
        Integer randomQuestionCount
) {}
