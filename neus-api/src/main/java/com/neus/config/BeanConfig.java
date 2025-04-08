package com.neus.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.time.Duration;
import java.util.List;
import java.util.Objects;

@Configuration
@RequiredArgsConstructor
public class BeanConfig {

    private final  AllowedOriginsConfigProp allowedOriginsConfigProp;

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
    String jwkSetUri;

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

    // rest template with connection time out
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .connectTimeout(Duration.ofSeconds(5)) // 5 second
                .readTimeout(Duration.ofSeconds(5))  // 5 second
                .build();
    }


    // jwks call to keycloak using custom rest template
    @Bean
    public JwtDecoder jwtDecoder(RestTemplate restTemplate /*CacheManager cacheManager*/) {
        return NimbusJwtDecoder.withJwkSetUri(jwkSetUri)
                .restOperations(restTemplate) // Use the timeout-enabled RestTemplate
//                .cache(Objects.requireNonNull(cacheManager.getCache("jwksCache"),
//                        "jwksCache not found!")
//                )
                .build();
    }
}
