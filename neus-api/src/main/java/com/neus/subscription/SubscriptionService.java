package com.neus.subscription;

import com.neus.subscription.dto.SubscriptionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionResponse getCurrentSubscription(String userId) {
       return subscriptionRepository.findByUserId(userId);
    }
}
