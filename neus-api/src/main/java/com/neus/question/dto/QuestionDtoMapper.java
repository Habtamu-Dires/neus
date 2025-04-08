package com.neus.question.dto;

import com.neus.question.Question;
import org.springframework.stereotype.Service;

@Service
public class QuestionDtoMapper {

    public QuestionDto mapToQuestionDto(Question question){
        return QuestionDto.builder()
                .questionText(question.getQuestionText())
                .choices(question.getChoice())
                .explanation(question.getExplanation())
                .imgUrls(question.getImageUrls())
                .build();
    }
}
