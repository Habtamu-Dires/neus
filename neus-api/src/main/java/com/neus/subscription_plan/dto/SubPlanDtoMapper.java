package com.neus.subscription_plan.dto;

import com.neus.subscription_plan.SubscriptionPlan;

public class SubPlanDtoMapper {

    public static SubPlanDto mapToSubplanDto(SubscriptionPlan plan){
        return SubPlanDto.builder()
                .id(plan.getExternalId().toString())
                .level(plan.getLevel())
                .price(plan.getPrice())
                .durationInMonth(plan.getDurationInMonth())
                .enabled(plan.isEnabled())
                .benefits(plan.getBenefits())
                .build();
    }
}
