package com.edwin_antonio.proyectosoliv1.model

data class LoginRequest(
    val username: String, // El email se envía como username para la API
    val password: String
)

data class LoginResponse(
    val idToken: String? = null,
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val tokenType: String? = null,
    val expiresIn: Int? = null,
    val status: String? = null
)

data class User(
    val id: Int,
    val firstName: String,
    val lastName: String,
    val activeMember: Boolean,
    val prefferedGenreIds: List<Int>,
    val roleName: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val firstName: String,
    val lastName: String
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