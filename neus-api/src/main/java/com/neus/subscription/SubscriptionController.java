package com.neus.subscription;

import com.neus.subscription.dto.SubscriptionDto;
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
    public ResponseEntity<SubscriptionDto> createSubscription(
            @PathVariable("sub-plan-id") String subPlanId,
            Authentication authentication){
        SubscriptionDto res = subscriptionService.createSubscription(subPlanId, authentication);
        return ResponseEntity.ok(res);
    }

    // get user
    @GetMapping("/{user-id}")
    public ResponseEntity<SubscriptionDto> getUserSubscription(
            @PathVariable("user-id") String userId
    ){
        var res = subscriptionService.getUserSubscription(userId);
        return ResponseEntity.ok(res);
    }
}
