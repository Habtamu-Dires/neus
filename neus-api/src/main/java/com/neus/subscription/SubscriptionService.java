package com.neus.subscription;

import com.neus.common.ExtractUserRole;
import com.neus.common.SubscriptionLevel;
import com.neus.keycloak.KeycloakService;
import com.neus.subscription.dto.SubscriptionResponse;
import com.neus.subscription_plan.SubscriptionPlan;
import com.neus.subscription_plan.SubscriptionPlanService;
import com.neus.user.User;
import com.neus.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserService userService;
    private final SubscriptionPlanService subPlanService;
    private final KeycloakService keycloakService;

    // create subscription
    @Transactional
    public void createSubscription(String subPlanId, Authentication authentication) {
        User user = userService.findByExternalId(authentication.getName());
        SubscriptionPlan plan = subPlanService.findByExternalId(subPlanId);
        SubscriptionLevel subscriptionLevel = plan.getLevel();

        // payment

        //keycloak
        String role = ExtractUserRole.mapSubscriptionLevelToKeycloakRole(subscriptionLevel);
        keycloakService.assignRole(user.getExternalId(),role);

        // create subscription
        subscriptionRepository.save(
                Subscription.builder()
                        .externalId(UUID.randomUUID())
                        .level(subscriptionLevel)
                        .startDate(LocalDateTime.now())
                        .endDate(LocalDateTime.now().plusMonths(plan.getDurationInMonth()))
                        .user(user)
                        .build()
        );


    }

    public SubscriptionResponse getCurrentSubscription(String userId) {
       return subscriptionRepository.findByUserId(userId);
    }

}
