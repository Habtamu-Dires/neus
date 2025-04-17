package com.neus.question.dto;

import com.neus.question.Choice;
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
        List<String> imgUrls
) {}
