package com.neus.resource.dto;

import com.neus.common.SubscriptionLevel;
import com.neus.resource.ResourceType;
import lombok.Builder;

@Builder
public record ResourceDetailDto(
        String id,
        String title,
        ResourceType type,
        SubscriptionLevel requiredSubLevel,
        String description,
        String parentResourceId,
        String parentResource,
        String contentPath
) {
}
