package com.neus.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.RequiredArgsConstructor;
import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManager;
import org.apache.hc.core5.util.Timeout;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Configuration
@RequiredArgsConstructor
public class BeanConfig {

    private final  AllowedOriginsConfigProp allowedOriginsConfigProp;

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
    String jwkSetUri;

    @Value("${keycloak.auth-server-url}")
    private String keycloakAuthUrl;

    private static final String JWKS_CACHE = "jwksCache";

    // cors filter
    @Bean
    public CorsFilter corsFilter() {
        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        final CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOriginsConfigProp.getOrigins());
        config.setAllowCredentials(true);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of(
                HttpHeaders.ORIGIN, HttpHeaders.CONTENT_TYPE,
                HttpHeaders.ACCEPT, HttpHeaders.AUTHORIZATION
        ));
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    public ClientHttpRequestFactory clientHttpRequestFactory() {
        // Configure connection pooling
        PoolingHttpClientConnectionManager connectionManager = new PoolingHttpClientConnectionManager();
        connectionManager.setMaxTotal(50); // Maximum total connections
        connectionManager.setDefaultMaxPerRoute(10); // Maximum connections per route

        // Configure timeouts using Java.time.Duration which is preferred
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(Timeout.ofMilliseconds(5000)) // Connection timeout
                .setResponseTimeout(Timeout.ofMilliseconds(10000)) // Read timeout
                .setConnectionRequestTimeout(Timeout.ofMilliseconds(5000)) // Time to get connection from pool
                .build();

        // Build HttpClient
        HttpClient httpClient = HttpClients.custom()
                .setConnectionManager(connectionManager)
                .setDefaultRequestConfig(requestConfig)
                .build();

        // Create and return the request factory
        return new HttpComponentsClientHttpRequestFactory(httpClient);
    }


    @Bean
    public RestClient keycloakRestClient(RestClient.Builder restClientBuilder, ClientHttpRequestFactory clientHttpRequestFactory) {
        // The RestClientCustomizer will also apply the factory, but setting it explicitly here ensures it.
        return restClientBuilder
                .baseUrl(keycloakAuthUrl)
                .requestFactory(clientHttpRequestFactory) // Explicitly set the factory
                .build();
    }

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(JWKS_CACHE);
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(60, TimeUnit.MINUTES)
                .maximumSize(100));
        return cacheManager;
    }


    // jwks call to keycloak using the configured http client
    @Bean
    public JwtDecoder jwtDecoder(ClientHttpRequestFactory clientHttpRequestFactory, CacheManager cacheManager) {
        RestTemplate restTemplate = new RestTemplate(clientHttpRequestFactory);
        Cache cache = cacheManager.getCache(JWKS_CACHE);
        if (cache == null) {
            throw new IllegalStateException("jwksCache not found!");
        }
        return NimbusJwtDecoder.withJwkSetUri(jwkSetUri)
                .restOperations(restTemplate) // Use t
                .cache(cache)
                .build();
    }


}
