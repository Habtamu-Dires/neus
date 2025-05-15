package com.neus.question.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.validation.annotation.Validated;

@Validated
public record CreateChoiceDto(
        String id,
        @NotEmpty(message = "Choice text is mandatory")
        String text,
        @NotNull(message = "Is correct is mandatory")
        boolean isCorrect
) {}
