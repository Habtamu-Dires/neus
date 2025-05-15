package com.neus.resource.dto;

import com.neus.common.SubscriptionLevel;
import com.neus.resource.ResourceType;
import lombok.Builder;

import java.util.List;

@Builder
public record ResourceCollectionDto(
        ResourceType type,
        String title,
        SubscriptionLevel requiredSubLevel,
        String description,
        List<ResourceInfoDto> resourceList
) {}
