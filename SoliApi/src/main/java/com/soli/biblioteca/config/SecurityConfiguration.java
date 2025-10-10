package com.soli.biblioteca.config;

import com.soli.biblioteca.controller.CognitoLogoutHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration {

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
    public String jwkSetUri;

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationConverter jwtAuthenticationConverter) throws Exception {
        CognitoLogoutHandler cognitoLogoutHandler = new CognitoLogoutHandler();

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(authz -> authz
                        // Docs públicas: Swagger UI y OpenAPI JSON
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()
                        // Endpoints públicos: SOLO login y registro y verificación de correo
                        .requestMatchers(
                                "/user/register",
                                "/user/login",
                                "/user/verify-account",
                                "/user/resend-verification"
                        ).permitAll()
                        // Logout endpoints accesibles a cualquier usuario autenticado
                        .requestMatchers("/user/auth/logout", "/user/auth/logout-all").authenticated()
                        // GET requieren al menos rol READER o ADMIN
                        .requestMatchers(HttpMethod.GET, "/**").hasAnyRole("READER", "ADMIN")
                        // POST, PUT, PATCH, DELETE requieren ADMIN (salvo excepciones arriba)
                        .requestMatchers(HttpMethod.POST, "/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/**").hasRole("ADMIN")
                        // Todo lo demás requiere autenticación
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)))
                .logout(logout -> logout.logoutSuccessHandler(cognitoLogoutHandler));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
