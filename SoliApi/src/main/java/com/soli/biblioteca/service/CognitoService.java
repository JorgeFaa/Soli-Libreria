package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.LoginResponseDTO;
import com.soli.biblioteca.config.SecretHashCalculator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

import java.util.Map;

@Slf4j
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
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    }

    public void registerUser(String username, String password) {
        String secretHash = SecretHashCalculator.calculateSecretHash(username, clientId, clientSecret);
        SignUpRequest signUpRequest = SignUpRequest.builder()
                .clientId(clientId)
                .username(username)
                .password(password)
                .secretHash(secretHash)
                .build();
        cognitoClient.signUp(signUpRequest);
        log.info("User {} registered successfully in Cognito", username);
    }

    public LoginResponseDTO login(String username, String password) {
        String secretHash = SecretHashCalculator.calculateSecretHash(username, clientId, clientSecret);
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

        return new LoginResponseDTO(
                result.accessToken(),
                result.idToken(),
                result.refreshToken(),
                result.tokenType(),
                result.expiresIn()
        );
    }

    public void resendConfirmationCode(String username) {
        String secretHash = SecretHashCalculator.calculateSecretHash(username, clientId, clientSecret);
        ResendConfirmationCodeRequest request = ResendConfirmationCodeRequest.builder()
                .clientId(clientId)
                .username(username)
                .secretHash(secretHash)
                .build();
        cognitoClient.resendConfirmationCode(request);
    }

    public void confirmSignUp(String username, String code) {
        String secretHash = SecretHashCalculator.calculateSecretHash(username, clientId, clientSecret);
        ConfirmSignUpRequest request = ConfirmSignUpRequest.builder()
                .clientId(clientId)
                .username(username)
                .confirmationCode(code)
                .secretHash(secretHash)
                .build();
        cognitoClient.confirmSignUp(request);
        addUserToReaderGroup(username);
    }

    public LoginResponseDTO refreshToken(String username, String refreshToken) {
        String secretHash = SecretHashCalculator.calculateSecretHash(username, clientId, clientSecret);
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

        // Cognito no devuelve un nuevo refresh token en este flujo, se reutiliza el anterior.
        return new LoginResponseDTO(
                result.accessToken(),
                result.idToken(),
                refreshToken, // Reutilizamos el refresh token existente
                result.tokenType(),
                result.expiresIn()
        );
    }

    public void addUserToReaderGroup(String username) {
        AdminAddUserToGroupRequest request = AdminAddUserToGroupRequest.builder()
                .userPoolId(userPoolId)
                .username(username)
                .groupName("READER")
                .build();
        cognitoClient.adminAddUserToGroup(request);
    }

    public boolean isUserConfirmed(String username) {
        try {
            AdminGetUserRequest request = AdminGetUserRequest.builder()
                    .userPoolId(userPoolId)
                    .username(username)
                    .build();
            AdminGetUserResponse response = cognitoClient.adminGetUser(request);
            return response.userStatus() == UserStatusType.CONFIRMED;
        } catch (UserNotFoundException e) {
            return false;
        }
    }

    public void revokeRefreshToken(String username, String refreshToken) {
        try {
            RevokeTokenRequest request = RevokeTokenRequest.builder()
                    .clientId(clientId)
                    .clientSecret(clientSecret)
                    .token(refreshToken)
                    .build();
            cognitoClient.revokeToken(request);
        } catch (CognitoIdentityProviderException e) {
            log.warn("Could not revoke token, may already be invalid: {}", e.getMessage());
        }
    }

    public void globalSignOut(String username) {
        AdminUserGlobalSignOutRequest req = AdminUserGlobalSignOutRequest.builder()
                .userPoolId(userPoolId)
                .username(username)
                .build();
        cognitoClient.adminUserGlobalSignOut(req);
    }

    public void adminDeleteUser(String username) {
        AdminDeleteUserRequest deleteUserRequest = AdminDeleteUserRequest.builder()
                .userPoolId(userPoolId)
                .username(username)
                .build();
        cognitoClient.adminDeleteUser(deleteUserRequest);
        log.info("User {} deleted successfully from Cognito", username);
    }
}
