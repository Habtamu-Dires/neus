package com.neus.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.OAuthFlow;
import io.swagger.v3.oas.annotations.security.OAuthFlows;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;

@OpenAPIDefinition(
        info = @Info(
                contact = @Contact(
                        name = "Habtamu",
                        email = "habtamuadugna.d@gmail.com"
                ),
                description = "OpenApi Documentation for Alem Equb",
                title = "OpenApi Specification ",
                version = "1.0",
                license = @License(
                        name = "Licence name ",
                        url = "http://url licence"
                ),
                termsOfService = "term of service"
        ),
        servers = {
                @Server(
                        description = "Local ENV",
                        url = "http://localhost:8088/api"
                )
        },
        security = {
                @SecurityRequirement(
                        name = "keycloak"
                )
        }
)
@SecurityScheme(
        name = "keycloak",
        type = SecuritySchemeType.OAUTH2,
        bearerFormat = "JWT",
        scheme = "bearer",
        in = SecuritySchemeIn.HEADER,
        flows = @OAuthFlows(
                password = @OAuthFlow(
                        authorizationUrl = "http://localhost:9090/realms/neus/protocol/openid-connect/auth",
                        tokenUrl = "http://localhost:9090/realms/neus/protocol/openid-connect/token"
                )
        )
)
public class OpenApiConfig {
}
