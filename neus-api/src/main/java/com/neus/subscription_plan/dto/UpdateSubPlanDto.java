package com.neus.subscription_plan.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;
import java.util.List;

@Validated
public record UpdateSubPlanDto(
        String id,
        String level,
        @NotNull(message = "Price is mandatory")
        BigDecimal price,
        @NotNull(message = "DurationInMonth is mandatory")
        Integer durationInMonth,
        @NotNull(message = "Enable Status is mandatory")
        boolean enabled,
        @NotNull(message = "Benefits is mandatory")
        List<String> benefits
) {
}
