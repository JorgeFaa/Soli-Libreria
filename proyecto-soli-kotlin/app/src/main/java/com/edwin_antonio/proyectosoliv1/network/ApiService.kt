package com.edwin_antonio.proyectosoliv1.network

import com.edwin_antonio.proyectosoliv1.model.*
import retrofit2.Response
import retrofit2.http.*

/**
 * 🌐 API Service para "Soli" - Librería Digital
 * 
 * Base URL: https://x6au4w6374bk3ntf7wyo3wacmm0wwlaq.lambda-url.us-east-1.on.aws
 * 
 * Solo endpoints de User y Book para usuarios normales (no ADMIN)
 */
interface ApiService {
    
    // ==== 🔐 USER ENDPOINTS ====
    
    @POST("api/v1/user/register")
    suspend fun register(@Body request: RegisterRequest): Response<String>
    
    @POST("api/v1/user/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
    
    @POST("api/v1/user/createUser")
    suspend fun createUser(@Body request: RegisterRequest): Response<User>
    
    @GET("api/v1/user/me")
    suspend fun getCurrentUser(): Response<User>
    
    @PATCH("api/v1/user/{id}/active")
    suspend fun activateUser(@Path("id") userId: Int): Response<User>
    
    @POST("api/v1/user/resend-verification")
    suspend fun resendVerification(@Body request: ResendVerificationRequest): Response<String>
    
    @POST("api/v1/user/verify-account")
    suspend fun verifyAccount(@Body request: VerificationRequest): Response<VerificationResponse>
    
    @POST("api/v1/user/auth/refresh-token")
    suspend fun refreshToken(@Body request: RefreshTokenRequest): Response<RefreshTokenResponse>
    
    @POST("api/v1/user/auth/logout")
    suspend fun logout(): Response<LogoutResponse>
    
    @POST("api/v1/user/auth/logout-all")
    suspend fun logoutAll(): Response<LogoutResponse>
    
    @GET("api/v1/user/status")
    suspend fun getUserStatus(@Query("email") email: String): Response<StatusCheckResponse>
    
    // ==== 📚 BOOK ENDPOINTS ====
    
    @GET("api/v1/books")
    suspend fun getAllBooks(): Response<List<Book>>
    
    @GET("api/v1/books/{id}")
    suspend fun getBookById(@Path("id") bookId: Int): Response<Book>
}
