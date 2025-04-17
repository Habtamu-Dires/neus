package com.neus.exam;

import com.neus.question.Question;
import com.neus.resource.Resource;
import jakarta.persistence.*;
import lombok.*;

import java.time.Duration;
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

    private int duration;

    @OneToMany(mappedBy = "exam", cascade = {CascadeType.REMOVE, CascadeType.DETACH})
    List<Question> questions;

}
