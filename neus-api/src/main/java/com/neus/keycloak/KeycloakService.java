package com.neus.keycloak;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class KeycloakService {

    @Value("${keycloak.auth-server-url}")
    private String keycloakAuthUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    private final KeycloakClient keycloakClient;
    private final RestClient restClient;


    // create user
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public void createUser(KeycloakUserRequest userRequest) {
        String uri = "/admin/realms/" + realm + "/users";
        String token = keycloakClient.getClientAccessToken();

        Map<String, Object> payload = new HashMap<>();
        payload.put("username", userRequest.username());
        payload.put("email", userRequest.email());
        payload.put("enabled", userRequest.enabled());
        payload.put("credentials", List.of(Map.of(
                "type", "password",
                "value", userRequest.password(),
                "temporary", false
        )));

        ResponseEntity<Void> response = restClient.post()
                .uri(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + token)
                .body(payload)
                .retrieve()
                .toBodilessEntity();

        if(response.getStatusCode() == HttpStatus.CREATED){
            String locationHeader = response.getHeaders().getLocation().toString();
        } else {
            throw new RuntimeException("Failed to create user in Keycloak");
        }
    }

    // delte user
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public void deleteUser(String userId) {
        String uri = "/admin/realms/" + realm + "/users/" + userId;
        String token = keycloakClient.getClientAccessToken();

        ResponseEntity<Void> response = restClient.delete()
                .uri(uri)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .toBodilessEntity();

        if(response.getStatusCode() == HttpStatus.NO_CONTENT){
               log.info("User deleted successfully");
        } else {
            throw new RuntimeException("Failed to delete user in Keycloak");
        }
    }


    // update synchronized flag
    public void updateSynchronizedFlag(String userId, String email) {
        String uri = "/admin/realms/" + realm + "/users/" + userId;
        String token = keycloakClient.getClientAccessToken();

        Map<String, Object> payload = new HashMap<>();
        payload.put("email", email);
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("synchronized", List.of("true"));
        payload.put("attributes", attributes);

        ResponseEntity<Void> response = restClient.put()
                .uri(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + token)
                .body(payload)
                .retrieve()
                .toBodilessEntity();

        if (response.getStatusCode() == HttpStatus.NO_CONTENT) {
            log.info("User updated successfully");
        } else {
            throw new RuntimeException("Failed to update user in Keycloak");
        }
    }

    // Fetch role representation (id and name) from Keycloak
    private Map<String, String> getRoleRepresentation(String roleName) {
        String uri = "/admin/realms/" + realm + "/roles/" + roleName;
        String token = keycloakClient.getClientAccessToken();

        Map response = restClient.get()
                .uri(uri)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(Map.class);

        return Map.of(
                "id", response.get("id").toString(),
                "name", response.get("name").toString()
        );

    }

    // Assign a realm role to a user
    public void assignRole(String keycloakId, String roleName) {
        String uri = "/admin/realms/" + realm + "/users/" + keycloakId + "/role-mappings/realm";
        String token = keycloakClient.getClientAccessToken();

        Map<String, String> roleRep = getRoleRepresentation(roleName);
        List<Map<String, String>> payload = List.of(roleRep);

        restClient.post()
                .uri(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + token)
                .body(payload)
                .retrieve()
                .toBodilessEntity();
    }

    // Remove a realm role from a user
    public void removeRole(String keycloakId, String roleName) {
        String uri = "/admin/realms/" + realm + "/users/" + keycloakId + "/role-mappings/realm";
        Map<String, String> roleRep = getRoleRepresentation(roleName);
        List<Map<String, String>> payload = List.of(roleRep);

        restClient.method(HttpMethod.DELETE)
                .uri(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth(keycloakClient.getClientAccessToken()))
                .body(payload)
                .retrieve()
                .toBodilessEntity();

    }
}
