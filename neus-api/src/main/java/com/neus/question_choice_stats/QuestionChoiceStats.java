package com.neus.question_choice_stats;

import com.neus.question.Choice;
import com.neus.question.Question;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
@Entity
@Table(name = "question_choice_stats")
public class QuestionChoiceStats {

    @EmbeddedId
    private QuestionChoiceStatsId id;

    private Long selectionCount;
    private Long totalResponses;
    private Double percentage;
    private LocalDateTime lastUpdated;

//    @ManyToOne
//    @MapsId("questionId")
//    @JoinColumn(name = "question_id")
//    private Question question;
}
