package com.neus.subscription;

import com.neus.subscription.dto.SubscriptionResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription,Long> {


    @Query("""
            SELECT new com.neus.subscription.dto.SubscriptionResponse(
                s.externalId,
                s.level,
                s.startDate,
                s.endDate
            ) 
            FROM Subscription s
            WHERE s.user.id = :userId 
            """)
    SubscriptionResponse findByUserId(String userId);

    @Query("""
            SELECT s FROM Subscription s
            WHERE s.endDate > :now
            """)
    List<Subscription> findExpiredSubscription(LocalDateTime now);
}
