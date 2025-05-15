package com.neus.resource.dto;

import com.neus.common.SubscriptionLevel;
import com.neus.resource.ResourceType;
import lombok.Builder;

@Builder
public record ResourceDto(
        String id,
        String title,
        ResourceType type,
        SubscriptionLevel requiredSubLevel,
        String description,
        String parentResourceId,
        String parentResourceTitle,
        String contentPath,
        String previewContentPath
) {}
