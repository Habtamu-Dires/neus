package com.neus.subscription_plan.dto;



import com.neus.common.SubscriptionLevel;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Builder
public record SubPlanDto(
        String id,
        SubscriptionLevel level,
        BigDecimal price,
        Integer durationInMonth,
        boolean enabled,
        List<String> benefits
) {}
