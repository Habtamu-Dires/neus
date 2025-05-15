package com.neus.subscription;

import com.neus.common.SubscriptionLevel;
import com.neus.keycloak.KeycloakService;
import com.neus.subscription.dto.SubscriptionDto;
import com.neus.subscription_plan.SubscriptionPlan;
import com.neus.subscription_plan.SubscriptionPlanService;
import com.neus.user.User;
import com.neus.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

import static com.neus.common.ExtractRoleFromJwt.mapSubscriptionLevelToKeycloakRole;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserService userService;
    private final SubscriptionPlanService subPlanService;
    private final KeycloakService keycloakService;

    // create subscription
    @Transactional
    public SubscriptionDto createSubscription(String subPlanId, Authentication authentication) {
        User user = userService.findByExternalId(authentication.getName());
        SubscriptionPlan plan = subPlanService.findByExternalId(subPlanId);
        SubscriptionLevel subscriptionLevel = plan.getLevel();
        String keycloakRole = mapSubscriptionLevelToKeycloakRole(subscriptionLevel);

        // payment

        // check if user has subscription
        Subscription oldSub = subscriptionRepository.findByUserId(user.getId()).orElse(null);
        if(oldSub != null  && oldSub.getEndDate().isAfter(LocalDateTime.now())
            && oldSub.getLevel().compareTo(subscriptionLevel) >= 0) {
            throw new RuntimeException("You have already subscribed to this plan");
        }

        //keycloak assign new sub
        keycloakService.assignRole(user.getExternalId(),keycloakRole);

        // create a new subscription
        Subscription subscription = null;

        if (oldSub != null) { // update existing subscription
            oldSub.setLevel(subscriptionLevel);
            oldSub.setStartDate(LocalDateTime.now());
            oldSub.setEndDate(LocalDateTime.now().plusMonths(plan.getDurationInMonth()));
            subscription = subscriptionRepository.save(oldSub);
        } else {  // create new
            subscription = subscriptionRepository.save(
                    Subscription.builder()
                            .externalId(UUID.randomUUID())
                            .level(subscriptionLevel)
                            .startDate(LocalDateTime.now())
                            .endDate(LocalDateTime.now().plusMonths(plan.getDurationInMonth()))
                            .user(user)
                            .build()
            );
        }

        return SubscriptionDto.builder()
                .externalId(subscription.getExternalId())
                .level(subscription.getLevel())
                .startDate(subscription.getStartDate())
                .endDate(subscription.getEndDate())
                .build();

    }

    // get user subscription
    public SubscriptionDto getUserSubscription(String userId) {
       return subscriptionRepository.findActiveSubByUserId(userId);
    }

}
