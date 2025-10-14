package com.soli.biblioteca.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerVersioningConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Soli - Sistema de Biblioteca")
                        .version("2.0")
                        .description("API REST para el sistema de gestión de biblioteca con versionado")
                        .contact(new Contact()
                                .name("Equipo Soli")
                                .email("soporte@soli.com")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("bearerAuth", 
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT token obtenido del endpoint de login")));
    }

    @Bean
    public GroupedOpenApi apiV1() {
        return GroupedOpenApi.builder()
                .group("v1")
                .packagesToScan("com.soli.biblioteca.controller.v1")
                .pathsToMatch("/api/v1/**")
                .displayName("API V1 - Compatible")
                .build();
    }

    @Bean
    public GroupedOpenApi apiV2() {
        return GroupedOpenApi.builder()
                .group("v2")
                .packagesToScan("com.soli.biblioteca.controller.v2")
                .pathsToMatch("/api/v2/**")
                .displayName("API V2 - Avanzada")
                .build();
    }

    @Bean
    public GroupedOpenApi apiAll() {
        return GroupedOpenApi.builder()
                .group("all")
                .packagesToScan("com.soli.biblioteca.controller")
                .pathsToMatch("/api/**")
                .displayName("Todas las versiones")
                .build();
    }
}