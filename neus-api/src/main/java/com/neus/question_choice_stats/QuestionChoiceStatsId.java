package com.neus.question_choice_stats;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Embeddable
public class QuestionChoiceStatsId implements Serializable {
    private Long examId;
    private String questionId;
    private String choiceId;

}
