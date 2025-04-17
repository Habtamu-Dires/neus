package com.neus.common;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;

public class ExtractUserRole {

    public static String getUserRoleFromJwt(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null; // Unauthenticated user
        }
        List<String> subLevels = List.of("ROLE_basic_subscriber","ROLE_advanced_subscriber","ROLE_premium_subscriber");
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(subLevels::contains)
                .findFirst()
                .orElse(null);
    }

    public static SubscriptionLevel mapRoleToSubscriptionLevel(String role) {
        if (role == null) {
            return null; // No subscription (e.g., guest)
        }
        return switch (role) {
            case "ROLE_basic_subscriber" -> SubscriptionLevel.BASIC;
            case "ROLE_advanced_subscriber" -> SubscriptionLevel.ADVANCED;
            case "ROLE_premium_subscriber" -> SubscriptionLevel.PREMIUM;
            default -> null; // No valid subscription
        };
    }

    public static String mapSubscriptionLevelToKeycloakRole(SubscriptionLevel level){
        if (level == null) {
            return null; // No subscription (e.g., guest)
        }
        return switch (level) {
            case SubscriptionLevel.BASIC -> "basic_subscriber";
            case  SubscriptionLevel.ADVANCED -> "advanced_subscriber";
            case  SubscriptionLevel.PREMIUM -> "premium_subscriber";
            default -> null; // No valid subscription
        };
    }
}
