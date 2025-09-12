package com.soli.biblioteca.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

import com.soli.biblioteca.config.calculateSecretHash;

@Service
public class CognitoService {

    private final CognitoIdentityProviderClient cognitoClient;

    @Value("${spring.security.oauth2.client.registration.cognito.userPoolId}")
    private String userPoolId;

    @Value("${spring.security.oauth2.client.registration.cognito.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.cognito.client-secret}")
    private String clientSecret;

    public CognitoService(
            @Value("${spring.security.oauth2.client.registration.cognito.region}") String region,
            @Value("${aws.accessKeyId}") String accessKey,
            @Value("${aws.secretAccessKey}") String secretKey
    ) {
        this.cognitoClient = CognitoIdentityProviderClient.builder()
                .region(Region.of(region))
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(accessKey, secretKey)
                        )
                )
                .build();
    }

    // Registro de usuario (sin cambios)
    public void registerUser(String username, String password) {
        try {
            String secretHash = calculateSecretHash.calculateSecretHash(username, clientId, clientSecret);

            SignUpRequest signUpRequest = SignUpRequest.builder()
                    .clientId(clientId)
                    .username(username)
                    .password(password)
                    .secretHash(secretHash)
                    .build();

            cognitoClient.signUp(signUpRequest);

        } catch (CognitoIdentityProviderException e) {
            throw new RuntimeException("Error en registro: " + e.awsErrorDetails().errorMessage(), e);
        }
    }

    // Login con credenciales AWS explícitas
    public Map<String, String> login(String username, String password) {
        try {
            System.out.println("Login called with username=" + username + ", password=" + password);
            System.out.println("clientId=" + clientId + ", clientSecret=" + clientSecret + ", userPoolId=" + userPoolId);
            String secretHash = calculateSecretHash.calculateSecretHash(username, clientId, clientSecret);

            AdminInitiateAuthRequest authRequest = AdminInitiateAuthRequest.builder()
                    .userPoolId(userPoolId)
                    .clientId(clientId)
                    .authFlow(AuthFlowType.ADMIN_NO_SRP_AUTH)
                    .authParameters(Map.of(
                            "USERNAME", username,
                            "PASSWORD", password,
                            "SECRET_HASH", secretHash
                    ))
                    .build();

            AdminInitiateAuthResponse response = cognitoClient.adminInitiateAuth(authRequest);
            AuthenticationResultType result = response.authenticationResult();

            return Map.of(
                    "idToken", result.idToken(),
                    "accessToken", result.accessToken(),
                    "refreshToken", result.refreshToken()
            );

        } catch (CognitoIdentityProviderException e) {
            throw new RuntimeException("Error en login: " + e.awsErrorDetails().errorMessage(), e);
        }
    }

    // Reenviar código de confirmación
    public void resendConfirmationCode(String username) {
        try {
            String secretHash = calculateSecretHash.calculateSecretHash(username, clientId, clientSecret);

            ResendConfirmationCodeRequest request = ResendConfirmationCodeRequest.builder()
                    .clientId(clientId)
                    .username(username)
                    .secretHash(secretHash)
                    .build();

            cognitoClient.resendConfirmationCode(request);

        } catch (CognitoIdentityProviderException e) {
            throw new RuntimeException("Error al reenviar código: " + e.awsErrorDetails().errorMessage(), e);
        }
    }

    // Confirmar cuenta con código
    public boolean confirmSignUp(String username, String code) {
        try {
            String secretHash = calculateSecretHash.calculateSecretHash(username, clientId, clientSecret);

            ConfirmSignUpRequest request = ConfirmSignUpRequest.builder()
                    .clientId(clientId)
                    .username(username)
                    .confirmationCode(code)
                    .secretHash(secretHash)
                    .build();

            cognitoClient.confirmSignUp(request);
            return true; // si no lanza excepción, se confirma correctamente

        } catch (CognitoIdentityProviderException e) {
            // puedes capturar excepciones específicas si quieres
            return false;
        }
    }
}
