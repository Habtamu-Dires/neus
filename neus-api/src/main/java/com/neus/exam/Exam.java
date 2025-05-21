package com.neus.exam;

import com.neus.question.Question;
import com.neus.resource.Resource;
import com.neus.user_exam.UserExam;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "exam")
public class Exam {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id", referencedColumnName = "id")
    private Resource resource;

    @Column(nullable = false,updatable = false,unique = true)
    private UUID externalId;

    private Integer year;
    @Enumerated(EnumType.STRING)
    private ExamType examType;
    private int duration;

    private Integer randomQuestionCount;

    @OneToMany(mappedBy = "exam", cascade = {CascadeType.REMOVE, CascadeType.DETACH})
    List<Question> questions;

    @OneToMany(mappedBy = "exam", cascade = {CascadeType.REMOVE, CascadeType.DETACH})
    List<UserExam> userExamList;

}
