package com.neus.subscription;

import com.neus.common.SubscriptionLevel;
import com.neus.payment.Payment;
import com.neus.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
@Entity
@Table(name = "subscription")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private UUID externalId;
    @Enumerated(EnumType.STRING)
    private SubscriptionLevel level;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @OneToOne
    @JoinColumn(name = "user_id", updatable = true)
    private User user;

    @OneToOne
    @JoinColumn(name = "payment_id")
    private Payment payment;
}
