package com.neus.keycloak;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
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
    private final RestTemplate restTemplate;

    //create user
    public String createUser(KeycloakUserRequest userRequest) {
        String url = keycloakAuthUrl + "/admin/realms/" + realm + "/users";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(keycloakClient.getClientAccessToken());

        Map<String, Object> payload = new HashMap<>();
        payload.put("username", userRequest.username());
        payload.put("email", userRequest.email());
        payload.put("enabled", userRequest.enabled());
        payload.put("credentials", List.of(Map.of(
                "type", "password",
                "value", userRequest.password(),
                "temporary", false
        )));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        ResponseEntity<Void> response = restTemplate.postForEntity(url, request, Void.class);

        if(response.getStatusCode() == HttpStatus.CREATED){
            String locationHeader = response.getHeaders().getLocation().toString();
            return locationHeader.substring(locationHeader.lastIndexOf("/") + 1);
        } else {
            throw new RuntimeException("Failed to create user in Keycloak");
        }
    }

    // delete user
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public void deleteUser(String userId) {
        String url = keycloakAuthUrl + "/admin/realms/" + realm + "/users/" + userId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(keycloakClient.getClientAccessToken());

        HttpEntity<Void> request = new HttpEntity<>(headers);

        restTemplate.exchange(url, HttpMethod.DELETE, request, Void.class);
    }

    // update profile
    public void updateProfile(String userId, KeycloakUserRequest userRequest) {
        String url = keycloakAuthUrl + "/admin/realms/" + realm + "/users/" + userId;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(keycloakClient.getClientAccessToken());

        Map<String, Object> payload = new HashMap<>();
        payload.put("username", userRequest.username());
        payload.put("email", userRequest.email());

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        restTemplate.exchange(url, HttpMethod.PUT, request, Void.class);
    }

    // Fetch role representation (id and name) from Keycloak
    private Map<String, String> getRoleRepresentation(String roleName) {
        String url = keycloakAuthUrl + "/admin/realms/" + realm + "/roles/" + roleName;
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(keycloakClient.getClientAccessToken());
        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);
        Map<String, Object> role = response.getBody();
        return Map.of(
                "id", role.get("id").toString(),
                "name", role.get("name").toString()
        );
    }

    // Assign a realm role to a user
    public void assignRole(String keycloakId, String roleName) {
        String url = keycloakAuthUrl + "/admin/realms/" + realm + "/users/" + keycloakId + "/role-mappings/realm";
        Map<String, String> roleRep = getRoleRepresentation(roleName);
        List<Map<String, String>> payload = List.of(roleRep);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(keycloakClient.getClientAccessToken());

        HttpEntity<List<Map<String, String>>> request = new HttpEntity<>(payload, headers);

        restTemplate.postForEntity(url, request, Void.class);
    }

    // Remove a realm role from a user
    public void removeRole(String keycloakId, String roleName) {
        String url = keycloakAuthUrl + "/admin/realms/" + realm + "/users/" + keycloakId + "/role-mappings/realm";
        Map<String, String> roleRep = getRoleRepresentation(roleName);
        List<Map<String, String>> payload = List.of(roleRep);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(keycloakClient.getClientAccessToken());
        HttpEntity<List<Map<String, String>>> request = new HttpEntity<>(payload, headers);

        restTemplate.exchange(url, HttpMethod.DELETE, request, Void.class);
    }


}
