package com.neus.user;

import com.neus.common.SubscriptionLevel;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class UserSpecification {

    public static Specification<User> filterUsers(
            String email, SubscriptionLevel subLevel
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (email != null && !email.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("email")), "%" + email.toLowerCase() + "%"));
            }
            if (subLevel != null) {
                predicates.add(cb.equal(root.get("subscription").get("level"), subLevel));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
