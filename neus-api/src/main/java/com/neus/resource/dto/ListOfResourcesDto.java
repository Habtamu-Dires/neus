package com.neus.resource.dto;

import com.neus.common.SubscriptionLevel;
import com.neus.resource.ResourceType;
import lombok.Builder;

import java.util.UUID;

@Builder
public record ListOfResourcesDto(
        UUID resourceId,
        ResourceType type,
        String title,
        String department,
        String description,
        SubscriptionLevel requiredSubLevel
) { }
