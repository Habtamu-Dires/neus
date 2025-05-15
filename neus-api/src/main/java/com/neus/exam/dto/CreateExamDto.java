package com.neus.exam.dto;

import com.neus.common.SubscriptionLevel;
import com.neus.exam.ExamType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import org.springframework.validation.annotation.Validated;

@Builder
@Validated
public record CreateExamDto(
    String id,
    @NotEmpty(message = "Title is mandatory")
    String title,
    @NotEmpty(message = "Description is mandatory")
    String description,
    @NotNull(message = "Subscription level is mandatory")
    SubscriptionLevel requiredSubLevel,
    @NotNull(message = "Exam Duration is mandatory")
    int duration,
    @NotNull(message = "Exam Type is mandatory")
    ExamType examType,
    @NotNull(message = "Year is mandatory")
    Integer year,
    Integer randomQuestionCount

) {}
