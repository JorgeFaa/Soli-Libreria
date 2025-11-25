package com.edwin_antonio.proyectosoliv1.model

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    val username: String, // El email se envía como username para la API
    val password: String
)

data class AuthTokens(
    @SerializedName("accessToken") // Buenas práctica para evitar problemas con ofuscación de código
    val accessToken: String,

    @SerializedName("idToken")
    val idToken: String,

    @SerializedName("refreshToken")
    val refreshToken: String,

    @SerializedName("tokenType")
    val tokenType: String,

    @SerializedName("expiresIn")
    val expiresIn: Int
)

data class User(
    val id: Int = 0,
    val firstName: String = "",
    val lastName: String = "",
    val prefferredGenreIds: List<Int> = emptyList(),
    val favoriteBooks: List<Int> = emptyList(),
    val roleName: String? = null // ahora opcional, puede venir ausente en la respuesta
)

data class UserCreatedResponse(
    val id: Int,
    val firstName: String,
    val lastName: String,
    val activeMember: Boolean,
    val preferredGenreIds: List<Int>,
    val roleName: String
)

data class RegisterRequest(
    val username: String,
    val password: String
)

data class CreateUserRequest(
    val email: String,
    val firstName: String,
    val lastName: String,
    val preferredGenreIds: List<Int>
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
