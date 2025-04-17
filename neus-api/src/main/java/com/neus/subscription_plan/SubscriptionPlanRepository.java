package com.neus.subscription_plan;

import com.neus.common.SubscriptionLevel;
import io.micrometer.common.KeyValues;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan,Long> {

    @Query("SELECT p FROM SubscriptionPlan p WHERE p.externalId = :externalId")
    SubscriptionPlan findByExternalId(UUID externalId);

    @Query("SELECT p FROM SubscriptionPlan p WHERE p.level = :level")
    Optional<SubscriptionPlan> getByLevel(SubscriptionLevel level);

    @Query("SELECT p FROM SubscriptionPlan p WHERE p.enabled = true")
    List<SubscriptionPlan> findEnabledSubPlans();
}
