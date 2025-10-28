package com.edwin_antonio.proyectosoliv1.model

data class LoginRequest(
    val username: String, // El email se envía como username para la API
    val password: String
)

data class LoginResponse(
    val message: String?,
    val success: Boolean?,
    val loginTime: String?,
    val userEmail: String?,
    val tokens: Tokens?,
    val status: String?
)

data class Tokens(
    val accessToken: String?,
    val idToken: String?,
    val refreshToken: String?,
    val expiresIn: String?
)

data class User(
    val id: Int,
    val firstName: String,
    val lastName: String,
    val activeMember: Boolean,
    val preferredGenreIds: List<Int>,
    val roleName: String
)

data class RegisterRequest(
    val email: String,
    val firstName: String,
    val lastName: String,
    val preferredGenreIds: List<Int>

)

data class VerificationRequest(
    val email: String,
    val verificationCode: String
)

data class VerificationResponse(
    val status: String
)

data class ResendVerificationRequest(
    val email: String
)

data class StatusCheckRequest(
    val email: String
)

data class StatusCheckResponse(
    val isConfirmed: Boolean
)

data class LogoutResponse(
    val ok: Boolean
)

data class RefreshTokenRequest(
    val refreshToken: String
)

data class RefreshTokenResponse(
    val accessToken: String,
    val idToken: String,
    val refreshToken: String
)

data class UserProfileSetupRequest(
    val firstName: String,
    val lastName: String,
    val preferredGenreIds: List<Int>
)
