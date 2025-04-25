package com.neus.user_exam;

import com.neus.exam.Exam;
import com.neus.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
@Entity
@Table(name = "user_exam",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "exam_id",})
)
public class UserExam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    List<UserAnswer> testModeUserAnswers;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    List<CorrectAnswer> testModeCorrectAnswers;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    List<UserAnswer> studyModeUserAnswers;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    List<CorrectAnswer> studyModeCorrectAnswers;

    private LocalDateTime lastModifiedDate;
    private Integer timeLeftInMinutes;

    @ManyToOne
    private User user;

    @ManyToOne
    private Exam exam;

}
