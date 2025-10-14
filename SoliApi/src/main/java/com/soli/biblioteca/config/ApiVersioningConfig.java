package com.soli.biblioteca.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración para el versionado de la API
 * 
 * Maneja las versiones:
 * - /api/v1/* - Versión actual (compatible con frontend existente)
 * - /api/v2/* - Nueva versión con mejoras
 */
@Configuration
public class ApiVersioningConfig implements WebMvcConfigurer {
    
    public static final String API_V1_PREFIX = "/api/v1";
    public static final String API_V2_PREFIX = "/api/v2";
    
    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // Configuración adicional si es necesaria
    }
}