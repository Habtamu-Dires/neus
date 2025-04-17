package com.neus.subscription_plan;

import com.neus.subscription_plan.dto.UpdateSubPlanDto;
import com.neus.subscription_plan.dto.SubPlanDto;
import com.neus.subscription_plan.dto.SubPlanDtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionPlanService {

    private final SubscriptionPlanRepository subPlanRepository;

    // get sub plans
    public List<SubPlanDto> getSubPlans() {
        return subPlanRepository.findAll().stream()
                .sorted(Comparator.comparing(SubscriptionPlan::getPrice))
                .map(SubPlanDtoMapper::mapToSubplanDto)
                .toList();
    }

    // get enabled sub plans
    public List<SubPlanDto> getEnabledSubPlans() {
        return subPlanRepository.findEnabledSubPlans()
                .stream()
                .sorted(Comparator.comparing(SubscriptionPlan::getPrice))
                .map(SubPlanDtoMapper::mapToSubplanDto)
                .toList();
    }

    // get sub plan by id
    public SubPlanDto getSubPlanById(String planId) {
         return SubPlanDtoMapper.mapToSubplanDto( this.findByExternalId(planId));
    }

    // find sub plan by id
    public SubscriptionPlan findByExternalId(String externalId){
        return subPlanRepository.findByExternalId(UUID.fromString(externalId));
    }

    //update
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void updateSubPlan(@Valid UpdateSubPlanDto dto) {

        SubscriptionPlan plan = this.findByExternalId(dto.id());

        plan.setEnabled(dto.enabled());
        plan.setPrice(dto.price());
        plan.setBenefits(dto.benefits());
        plan.setDurationInMonth(dto.durationInMonth());

        subPlanRepository.save(plan);
    }
}
