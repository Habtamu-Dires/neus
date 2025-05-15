package com.neus.resource.dto;

import com.neus.common.SubscriptionLevel;
import com.neus.resource.ResourceType;
import lombok.Builder;

import java.util.UUID;

@Builder
public record ResourceInfoDto(
        UUID resourceId,
        ResourceType type,
        String title,
        String description,
        SubscriptionLevel requiredSubLevel
) { }
