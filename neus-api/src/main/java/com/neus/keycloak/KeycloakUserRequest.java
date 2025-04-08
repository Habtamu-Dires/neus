package com.neus.keycloak;

import lombok.Builder;

@Builder
public record KeycloakUserRequest(
        String username,
        String email,
        String password,
        boolean enabled
) {
}
