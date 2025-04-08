package com.neus.payment;

import com.neus.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(name = "payment")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private UUID externalId;
    private BigDecimal amount;
    private String transactionId;
    private String currency;
    private String paymentMethod;
    private String paymentStatus;
    private LocalDateTime createdAt;

    @ManyToOne
    private User user;
}
