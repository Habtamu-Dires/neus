package com.neus.exam.dto;

import java.util.UUID;

public record ExamNameDto(
        UUID id,
        String title,
        Integer year
) {
}
