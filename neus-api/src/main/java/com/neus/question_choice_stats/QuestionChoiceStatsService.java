package com.neus.question_choice_stats;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionChoiceStatsService {

    private final QuestionChoiceStatsRepository statsRepository;

    // find by examId
    public List<QuestionChoiceStats> getChoiceStatsByExamId(Long questionId){
        return statsRepository.findByExamId(questionId);
    }

    // find by questionId list
    public List<QuestionChoiceStats> getChoiceStatsByQuestionIds(List<String> ids){
        return statsRepository.findByQuestionIds(ids);
    }

}
