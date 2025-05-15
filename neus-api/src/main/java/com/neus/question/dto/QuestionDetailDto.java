package com.neus.question.dto;

import com.neus.question.BlockNumber;
import com.neus.question.Department;
import lombok.Builder;

import java.util.List;

@Builder
public record QuestionDetailDto(
        String id,
        String examId,
        Integer questionNumber,
        String questionText,
        List<ChoiceDto> choices,
        Long totalResponses,
        String explanation,
        List<String> imgUrls,
        Department department,
        BlockNumber blockNumber
) {
}
