package com.neus.subscription_plan;

import com.neus.subscription_plan.dto.UpdateSubPlanDto;
import com.neus.subscription_plan.dto.SubPlanDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sub-plans")
@Tag(name = "sbu-plans")
public class SubscriptionPlanController {

    private final SubscriptionPlanService subPlanService;


    @GetMapping
    public ResponseEntity<List<SubPlanDto>> getSubPlans(){
        var res = subPlanService.getSubPlans();
        return ResponseEntity.ok(res);
    }

    @GetMapping("/enabled")
    public ResponseEntity<List<SubPlanDto>> getEnabledSubPlans(){
        var res = subPlanService.getEnabledSubPlans();
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{plan-id}")
    public ResponseEntity<SubPlanDto> getSubPlanById(
            @PathVariable("plan-id") String planId
    ){
       return ResponseEntity.ok(subPlanService.getSubPlanById(planId));
    }

    @PutMapping
    public ResponseEntity<?> updateSubPlan(@RequestBody @Valid UpdateSubPlanDto dto){
        subPlanService.updateSubPlan(dto);
        return ResponseEntity.accepted().build();
    }


}
