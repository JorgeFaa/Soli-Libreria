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
    
    @POST("api/v3/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<String>
    
    @POST("api/v3/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthTokens>
    
    @POST("api/v3/users")
    suspend fun createUser(@Body request: RegisterRequest): Response<UserCreatedResponse>
    
    @GET("api/v3/users/me")
    suspend fun getCurrentUser(): Response<User>
    
    @POST("api/v3/auth/resend-verification")
    suspend fun resendVerification(@Body request: ResendVerificationRequest): Response<String>
    
    @POST("api/v3/auth/verify-account")
    suspend fun verifyAccount(@Body request: VerificationRequest): Response<VerificationResponse>
    
    @POST("api/v3/auth/refresh-token")
    suspend fun refreshToken(@Body request: RefreshTokenRequest): Response<RefreshTokenResponse>
    
    @POST("api/v3/auth/logout")
    suspend fun logout(): Response<LogoutResponse>
    
    @POST("api/v3/auth/logout-all")
    suspend fun logoutAll(): Response<LogoutResponse>
    
    // ==== 📚 BOOK ENDPOINTS ====
    
    @GET("api/v3/books")
    suspend fun getAllBooks(): Response<BookResponse>
    
    @GET("api/v3/books/{id}")
    suspend fun getBookById(@Path("id") bookId: Int): Response<Book>
    
    // ==== 🎭 GENRE ENDPOINTS ====
    
    @GET("api/v3/admin/genres")
    suspend fun getAllGenres(): Response<List<Genre>>

    // ==== 👤 USER PROFILE UPDATE ====

//    @PUT("api/v2/user/profile")
//    suspend fun updateUserProfile(@Body request: UserProfileSetupRequest): Response<User>


    }
