package com.neus.question.dto;

import lombok.Builder;

@Builder
public record ChoiceDto(
        String id,
        String text,
        boolean isCorrect,
        Double percentage
) {
}
