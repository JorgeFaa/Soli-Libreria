package com.soli.biblioteca.config;

import com.soli.biblioteca.service.CognitoService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AwsConfig {

    @Value("${spring.security.oauth2.client.registration.cognito.region}")
    private String region;

    @Value("${aws.accessKeyId}")
    private String accessKey;

    @Value("${aws.secretAccessKey}")
    private String secretKey;

    @Bean
    public CognitoService cognitoService() {
        return new CognitoService(region, accessKey, secretKey);
    }
}
