package com.neus.subscription;

import com.neus.subscription.dto.SubscriptionResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/subscription")
@RequiredArgsConstructor
@Tag(name = "subscription")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;


    @GetMapping("/current/{user-id}")
    public ResponseEntity<SubscriptionResponse> getCurrentSubscription(
            @PathVariable("user-id") String userId
    ){
        var res = subscriptionService.getCurrentSubscription(userId);
        return ResponseEntity.ok(res);
    }
}
