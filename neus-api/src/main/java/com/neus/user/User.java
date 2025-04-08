package com.neus.user;

import com.neus.payment.Payment;
import com.neus.subscription.Subscription;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
@Entity
@Table(name = "_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String externalId;
    @Column(unique = true)
    private String username;
    @Column(unique = true)
    private String email;
    private String name;
    private LocalDateTime registrationDate;
    private boolean enabled;

    @OneToOne(mappedBy = "user")
    private Subscription subscription;

    @OneToMany(mappedBy = "user")
    private List<Payment> paymentList;

}
