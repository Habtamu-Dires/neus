package com.neus.question.dto;

import com.neus.question.BlockNumber;
import com.neus.question.Choice;
import com.neus.question.Department;
import lombok.Builder;
import java.util.List;

@Builder
public record QuestionDto(
        String id,
        String examId,
        Integer questionNumber,
        String questionText,
        List<Choice> choices,
        String explanation,
        List<String> imgUrls,
        Department department,
        BlockNumber blockNumber
) {}
