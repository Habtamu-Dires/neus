package com.neus.subscription_plan;

import com.neus.common.SubscriptionLevel;
import com.neus.resource.Resource;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Setter
@Getter
@Entity
@Table(name = "subscription_plan")
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private UUID externalId;
    @Column(unique = true, nullable = false)
    @Enumerated(EnumType.STRING)
    SubscriptionLevel level;
    private BigDecimal price;
    private int durationInMonth;
    private boolean enabled;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> benefits;

}
