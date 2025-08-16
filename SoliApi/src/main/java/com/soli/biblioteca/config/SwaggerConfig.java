package com.soli.biblioteca.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API de Aprendizaje de Inglés Técnico")
                        .version("1.0")
                        .description("Documentación de la API para la app de inglés técnico.")
                        .contact(new Contact()
                                .name("Soporte")
                                .email("soporte@miapp.com")));
    }
}