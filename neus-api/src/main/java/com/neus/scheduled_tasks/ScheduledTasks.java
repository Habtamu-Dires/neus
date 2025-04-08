package com.neus.scheduled_tasks;

import com.neus.keycloak.KeycloakService;
import com.neus.subscription.Subscription;
import com.neus.subscription.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledTasks {

    private final SubscriptionRepository subscriptionRepository;
    private final KeycloakService keycloakService;

    @Scheduled(cron = "0 0 0 * * *")  // midnight
    @Async("cpuBoundExecutor")
    public void cleanExpiredSubscription(){
        log.info("Cleaning Expired Subscriptions");
        List<Subscription> expired = subscriptionRepository
                .findExpiredSubscription(LocalDateTime.now());
        for(Subscription sub : expired){
            String userId = sub.getUser().getExternalId();
            String role = sub.getLevel() + "_subscriber";
            keycloakService.removeRole(userId,role);
        }
    }

}
