package com.neus.question.dto;

import com.neus.question.Department;
import com.neus.question.BlockNumber;
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
        List<CreateChoiceDto> choices,
        @NotEmpty(message = "Explanation is mandatory")
        String explanation,
        List<String> mediaUrls,
        Department department,
        BlockNumber blockNumber,
        String category
)
{ }
