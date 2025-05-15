package com.neus.subscription.dto;

import com.neus.common.SubscriptionLevel;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record SubscriptionDto(
        UUID externalId,
        SubscriptionLevel level,
        LocalDateTime startDate,
        LocalDateTime endDate
) {}
