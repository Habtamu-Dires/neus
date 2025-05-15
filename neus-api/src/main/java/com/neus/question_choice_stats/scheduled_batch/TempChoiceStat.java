package com.neus.question_choice_stats.scheduled_batch;

import jakarta.persistence.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@Entity //TODO : entity is not necessary once we use
@Table(name = "temp_choice_stats")
public class TempChoiceStat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private Long examId;
    private String questionId;
    private String choiceId;
    private Long userId;
    private int selectionCount;
}
