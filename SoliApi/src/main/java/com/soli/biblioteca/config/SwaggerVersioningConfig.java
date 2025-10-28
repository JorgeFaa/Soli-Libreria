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
                        .version("3.0")
                        .description("API REST para el sistema de gestión de biblioteca. Esta es la versión 3, la única versión activa.")
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
    public GroupedOpenApi apiV3() {
        return GroupedOpenApi.builder()
                .group("v3")
                .packagesToScan("com.soli.biblioteca.controller.v3")
                .pathsToMatch("/api/v3/**")
                .displayName("API V3")
                .build();
    }
}
