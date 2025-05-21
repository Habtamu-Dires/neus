package com.neus.user;

import com.neus.user.dto.UserAggregateData;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long>, JpaSpecificationExecutor<User> {

    @Query("SELECT u FROM User u WHERE u.externalId = :externalId")
    Optional<User> findByExternalId(String externalId);


    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(String email);

    @Query("""
            SELECT new com.neus.user.dto.UserAggregateData(
                COUNT(u),
                SUM(CASE WHEN u.subscription.level = 'BASIC' THEN 1 ELSE 0 END),
                SUM(CASE WHEN u.subscription.level = 'ADVANCED' THEN 1 ELSE 0 END),
                SUM(CASE WHEN u.subscription.level = 'PREMIUM' THEN 1 ELSE 0 END)
            )
            FROM User u
            """)
    UserAggregateData getUserAggregateData();
}
