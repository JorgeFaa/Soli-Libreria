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
                        // Docs públicas
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        
                        // Endpoints públicos v3
                        .requestMatchers("/api/v3/auth/**").permitAll()

                        // Endpoints de usuario v3 (crear, ver y actualizar perfil)
                        .requestMatchers(HttpMethod.POST, "/api/v3/users").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v3/users/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v3/users/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v3/users/me/favorites").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v3/users/me/favorites/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/v3/users/me/favorites/**").authenticated()

                        // Endpoints de admin v3
                        .requestMatchers(HttpMethod.GET, "/api/v3/admin/**").hasAnyRole("ADMIN", "READER")
                        .requestMatchers("/api/v3/admin/**").hasRole("ADMIN")

                        // Endpoints de libros (aún por definir, pero podemos adelantar)
                        .requestMatchers(HttpMethod.GET, "/api/v3/books/**").hasAnyRole("ADMIN", "READER")
                        .requestMatchers("/api/v3/books/**").hasRole("ADMIN")

                        // Reglas para v1 y v2 (legado)
                        .requestMatchers("/api/v1/**", "/api/v2/**").permitAll() // O ajusta según necesites

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
        configuration.setAllowedOrigins(List.of("*")); // Cambia a tus dominios en producción
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
