package com.neus.subscription;

import com.neus.subscription.dto.SubscriptionResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/subscription")
@RequiredArgsConstructor
@Tag(name = "subscription")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    //create subscription
    @PostMapping("/{sub-plan-id}")
    public ResponseEntity<?> createSubscription(
            @PathVariable("sub-plan-id") String subPlanId,
            Authentication authentication){
        subscriptionService.createSubscription(subPlanId, authentication);
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/current/{user-id}")
    public ResponseEntity<SubscriptionResponse> getCurrentSubscription(
            @PathVariable("user-id") String userId
    ){
        var res = subscriptionService.getCurrentSubscription(userId);
        return ResponseEntity.ok(res);
    }
}
