package com.neus.question;

import com.neus.exam.Exam;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
@Entity
@Table(name = "question")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private UUID externalId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<Choice> choice;
    @Column(columnDefinition = "TEXT")
    private String questionText;
    @Column(columnDefinition = "TEXT")
    private String explanation;
    private List<String> imageUrls;

    @ManyToOne
    @JoinColumn(name = "exam_id")
    private Exam exam;
}
