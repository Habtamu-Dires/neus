package com.neus.keycloak;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class KeycloakClient {

    @Value("${keycloak.auth-server-url}")
    private String keycloakAuthUrl;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    @Value("${keycloak.realm}")
    private String realm;

    private final RestClient restClient;

    public String getClientAccessToken(){
        String uri ="/realms/" +realm + "/protocol/openid-connect/token";

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);

        Map responseBody = restClient.post()
                .uri(uri)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(body)
                .retrieve()
                .body(Map.class);

        // Extract the access_token from the response map
        if (responseBody != null && responseBody.containsKey("access_token")) {
            return responseBody.get("access_token").toString();
        } else {
            // Handle the case where the access token is not in the response
            throw new RuntimeException("Failed to get access token from Keycloak response");
        }
    }

}
