package com.soli.biblioteca.service;

import com.soli.biblioteca.model.User;
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

    // Registro de usuario - Método limpio sin verificaciones previas
    public void registerUser(String username, String password) {
        try {
            // Validación de entrada
            if (username == null || username.trim().isEmpty()) {
                throw new IllegalArgumentException("Username no puede estar vacío");
            }
            if (password == null || password.length() < 6) {
                throw new IllegalArgumentException("Password debe tener al menos 6 caracteres");
            }

            String secretHash = calculateSecretHash.calculateSecretHash(username, clientId, clientSecret);

            SignUpRequest signUpRequest = SignUpRequest.builder()
                    .clientId(clientId)
                    .username(username)
                    .password(password)
                    .secretHash(secretHash)
                    .build();

            // Registro directo en Cognito
            cognitoClient.signUp(signUpRequest);

        } catch (CognitoIdentityProviderException e) {
            // Agregar más detalles del error
            String errorCode = e.awsErrorDetails().errorCode();
            String errorMessage = e.awsErrorDetails().errorMessage();
            throw new RuntimeException("Error en registro Cognito [" + errorCode + "]: " + errorMessage, e);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Error de validación: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Error inesperado en registro: " + e.getMessage(), e);
        }
    }

    // Login con credenciales AWS explícitas
    public Map<String, String> login(String username, String password) {
        try {
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
                    "refreshToken", result.refreshToken(),
                    "expiresIn", result.expiresIn().toString()
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
            addUserToReaderGroup(username);
            return true; // si no lanza excepción, se confirma correctamente

        } catch (CognitoIdentityProviderException e) {
            // puedes capturar excepciones específicas si quieres
            return false;
        }
    }

    // Refrescar tokens usando Refresh Token
    public Map<String, String> refreshToken(String username, String refreshToken) {
        try {
            String secretHash = calculateSecretHash.calculateSecretHash(username, clientId, clientSecret);

            AdminInitiateAuthRequest refreshRequest = AdminInitiateAuthRequest.builder()
                    .userPoolId(userPoolId)
                    .clientId(clientId)
                    .authFlow(AuthFlowType.REFRESH_TOKEN_AUTH)
                    .authParameters(Map.of(
                            "REFRESH_TOKEN", refreshToken,
                            "SECRET_HASH", secretHash
                    ))
                    .build();

            AdminInitiateAuthResponse response = cognitoClient.adminInitiateAuth(refreshRequest);
            AuthenticationResultType result = response.authenticationResult();

            return Map.of(
                    "idToken", result.idToken(),
                    "accessToken", result.accessToken()
                    // refreshToken normalmente no cambia, así que no lo regresamos de nuevo
            );

        } catch (CognitoIdentityProviderException e) {
            throw new RuntimeException("Error al refrescar token: " + e.awsErrorDetails().errorMessage(), e);
        }
    }

    // Agregar usuario al grupo READER
    public void addUserToReaderGroup(String username) {
        try {
            AdminAddUserToGroupRequest request = AdminAddUserToGroupRequest.builder()
                    .userPoolId(userPoolId)
                    .username(username)
                    .groupName("READER")
                    .build();

            cognitoClient.adminAddUserToGroup(request);

        } catch (CognitoIdentityProviderException e) {
            throw new RuntimeException("Error al agregar usuario al grupo READER: " + e.awsErrorDetails().errorMessage(), e);
        }
    }


    public Boolean getUserStatus(String username) {
        try {
            AdminGetUserRequest request = AdminGetUserRequest.builder()
                    .userPoolId(userPoolId)
                    .username(username)
                    .build();

            AdminGetUserResponse response = cognitoClient.adminGetUser(request);
            if (response.userStatus() == UserStatusType.CONFIRMED){
                return true;
            }
            return false;
        } catch (UserNotFoundException e) {
            // Usuario no existe en Cognito
            return false;
        } catch (CognitoIdentityProviderException e) {
            throw new RuntimeException("Error al obtener estado del usuario: " + e.awsErrorDetails().errorMessage(), e);
        }
    }

    public Boolean getUserByUsername(String username) {
        try {
            AdminGetUserRequest request = AdminGetUserRequest.builder()
                    .userPoolId(userPoolId)
                    .username(username)
                    .build();

            AdminGetUserResponse response = cognitoClient.adminGetUser(request);
            if (response.username() != null){
                return true;
            }
            return false;
        } catch (UserNotFoundException e) {
            // Usuario no existe en Cognito
            return false;
        } catch (CognitoIdentityProviderException e) {
            throw new RuntimeException("Error al buscar usuario: " + e.awsErrorDetails().errorMessage(), e);
        }
    }
}
