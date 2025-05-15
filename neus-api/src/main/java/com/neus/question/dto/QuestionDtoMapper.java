package com.neus.question.dto;

import com.neus.question.Choice;
import com.neus.question.Question;
import com.neus.question_choice_stats.QuestionChoiceStats;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;


@Service
public class QuestionDtoMapper {
    private Long totalResponses = 0L;

    public  QuestionDto mapToQuestionDto(Question question){
        return QuestionDto.builder()
            .id(question.getExternalId().toString())
            .examId(question.getExam().getExternalId().toString())
            .questionNumber(question.getQuestionNumber())
            .questionText(question.getQuestionText())
            .choices(question.getChoice())
            .explanation(question.getExplanation())
            .imgUrls(question.getImageUrls())
            .department(question.getDepartment())
            .blockNumber(question.getBlockNumber())
            .build();
    }

    public  QuestionDetailDto mapToQuestionDetailDto(
            Question question,
            List<QuestionChoiceStats> choiceStatsByQuestionId
    ){
        return QuestionDetailDto.builder()
                .id(question.getExternalId().toString())
                .examId(question.getExam().getExternalId().toString())
                .questionNumber(question.getQuestionNumber())
                .questionText(question.getQuestionText())
                .choices(addChoiceStats(question.getChoice(), choiceStatsByQuestionId))
                .totalResponses(this.totalResponses)
                .explanation(question.getExplanation())
                .imgUrls(question.getImageUrls())
                .build();
    }

    public List<ChoiceDto> addChoiceStats(List<Choice> choices, List<QuestionChoiceStats> stats){

        if(stats == null || stats.isEmpty()){
            return choices.stream()
                    .map(c -> this.mapToChoiceDto(c,null))
                    .toList();
        }

        // map stats by choice id
        Map<String, QuestionChoiceStats> statsByChoiceId = stats.stream()
                .collect(Collectors.toMap(
                        stat -> stat.getId().getChoiceId(),
                        Function.identity()  // Value is the stat object itself
                ));

        return  choices.stream()
                .map(choice -> {
                    var stat = statsByChoiceId.get(choice.id().toString());
                    Double percentage = stat != null ? stat.getPercentage() : 0.0;
                    if(stat != null && this.totalResponses == 0){
                        this.totalResponses = stat.getTotalResponses();
                    }
                    return this.mapToChoiceDto(choice, percentage);
                })
                .toList();
    }

    // choice dto mapper
    private ChoiceDto mapToChoiceDto(Choice choice, Double percentage){
        return ChoiceDto.builder()
                .id(choice.id().toString())
                .text(choice.text())
                .isCorrect(choice.isCorrect())
                .percentage(percentage)
                .build();
    }
}


