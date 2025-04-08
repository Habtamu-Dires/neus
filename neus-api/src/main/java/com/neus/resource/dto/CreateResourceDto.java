package com.neus.resource.dto;

import com.neus.common.SubscriptionLevel;
import com.neus.resource.ResourceType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import org.springframework.validation.annotation.Validated;

@Builder
@Validated
public record CreateResourceDto(
        String id,
        @NotNull(message = "Resource Type is Mandatory")
        ResourceType type,
        @NotEmpty(message = "Title is is Mandatory")
        String title,
        @NotNull(message = "Subscription Level is Mandatory")
        SubscriptionLevel requiredSubLevel,
        @NotEmpty(message = "Department is Mandatory")
        String department,
        @NotEmpty(message = "Description is Mandatory")
        String description,
        String contentPath,
        String previewResourceId,
        String parentResourceId
) {}
