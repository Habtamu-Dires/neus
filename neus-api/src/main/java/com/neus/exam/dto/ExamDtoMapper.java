package com.neus.exam.dto;

import com.neus.exam.Exam;
import com.neus.question.Question;
import com.neus.question.dto.QuestionDto;
import com.neus.question.dto.QuestionDtoMapper;
import com.neus.resource.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamDtoMapper {

    private final QuestionDtoMapper questionDtoMapper;

    public ExamDto mapToExamDto(Exam exam, Resource resource){
        return ExamDto.builder()
                .id(exam.getExternalId().toString())
                .title(resource.getTitle())
                .department(resource.getDepartment())
                .duration(exam.getDuration())
                .description(resource.getDescription())
                .requiredSubLevel(resource.getRequiredSubLevel())
                .numberOfQuestions(exam.getQuestions().size())
                .build();
    }

    public ExamDetailDto mapToExamDetailDto(Exam exam, Resource resource, List<QuestionDto> questionDtos){
        return ExamDetailDto.builder()
                .title(resource.getTitle())
                .duration(exam.getDuration())
                .description(resource.getDescription())
                .questions(questionDtos)
                .build();
    }
}
