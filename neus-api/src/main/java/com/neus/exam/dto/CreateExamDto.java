package com.neus.exam.dto;

import com.neus.common.SubscriptionLevel;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Builder
@Validated
public record CreateExamDto(
    String id,
    @NotEmpty(message = "Title is mandatory")
    String title,
    String department,
    @NotEmpty(message = "Description is mandatory")
    String description,
    @NotNull(message = "Subscription level is mandatory")
    SubscriptionLevel requiredSubLevel,
    @NotNull(message = "Exam Duration is mandatory")
    int duration
) {}
