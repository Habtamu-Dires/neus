package com.neus.question.dto;

import com.neus.question.Choice;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Builder
@Validated
public record CreateQuestionDto(
        String id,
        @NotEmpty(message = "ExamId is mandatory")
        String examId,
        @NotNull(message = "Question number is mandatory")
        Integer questionNumber,
        @NotEmpty(message = "Question Text is mandatory")
        String questionText,
        @NotEmpty(message = "Choice is mandatory")
        List<Choice> choices,
        @NotEmpty(message = "Explanation is mandatory")
        String explanation,
        List<String> imgUrls
)
{ }
