package com.neus.user.dto;

import com.neus.common.SubscriptionLevel;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record UserDto(
        String id,
        String username,
        String email,
        SubscriptionLevel subscriptionLevel,
        LocalDateTime startDate,
        LocalDateTime endDate,
        LocalDateTime registeredDate,
        boolean enabled
) {}
