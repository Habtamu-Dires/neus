package com.neus.question;

import com.neus.exam.Exam;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
@Entity
@Table(name = "question",
        uniqueConstraints = @UniqueConstraint(columnNames = {"questionNumber", "exam_id"})
)
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private UUID externalId;

    private int questionNumber;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<Choice> choice;
    @Column(columnDefinition = "TEXT")
    private String questionText;
    @Column(columnDefinition = "TEXT")
    private String explanation;
    private List<String> imageUrls = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private BlockNumber blockNumber;

    @Enumerated(EnumType.STRING)
    private Department department;

    @ManyToOne
    @JoinColumn(name = "exam_id")
    private Exam exam;

}
