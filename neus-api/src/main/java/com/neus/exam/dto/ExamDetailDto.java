package com.neus.exam.dto;

import com.neus.question.dto.QuestionDto;
import lombok.Builder;

import java.util.List;

@Builder
public record ExamDetailDto(
        String title,
        String description,
        int duration,
        List<QuestionDto> questions,        // Full access
        List<QuestionDto> previewQuestions //preview only
) {
}
