package com.neus.subscription;

import com.neus.subscription.dto.SubscriptionDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription,Long> {


    @Query("""
            SELECT new com.neus.subscription.dto.SubscriptionDto(
                s.externalId,
                s.level,
                s.startDate,
                s.endDate
            ) 
            FROM Subscription s
            WHERE s.user.externalId = :userId 
            AND s.endDate > CURRENT_TIMESTAMP
            """)
    SubscriptionDto findActiveSubByUserId(String userId);

    @Query("SELECT s FROM Subscription s WHERE s.user.id = :userId")
    Optional<Subscription> findByUserId(Long userId);

    @Query("""
            SELECT s FROM Subscription s
            WHERE s.endDate < CURRENT_TIMESTAMP
            """)
    List<Subscription> findExpiredSubscription();
}
