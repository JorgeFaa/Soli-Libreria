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
    suspend fun register(@Body request: RegisterRequest): Response<RegisterResponse>
    
    @POST("api/v3/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthTokens>
    
    @POST("api/v3/users")
    suspend fun createUser(@Body request: CreateUserRequest): Response<UserCreatedResponse>
    
    @GET("api/v3/users/me")
    suspend fun getCurrentUser(): Response<User>
    
    @POST("api/v3/auth/resend-verification")
    suspend fun resendVerification(@Body request: ResendVerificationRequest): Response<ResendVerificationResponse>
    
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

    @GET("api/v3/books/by-ids")
    suspend fun getBooksByIds(@Query("ids") bookIds: String): Response<List<Book>>
    
    // ==== 👤 USER PROFILE ENDPOINTS  ====

    @GET("api/v3/users/me")
    suspend fun getCurrentUserProfile(): Response<User>
    
    // ==== ⭐ BOOK REVIEW ENDPOINTS ====

    @POST("api/v3/books/{bookId}/reviews")
    suspend fun addReview(
        @Path("bookId") bookId: Int,
        @Body review: ReviewRequest
    ): Response<Review>

    @GET("api/v3/books/{bookId}/reviews")
    suspend fun getReviews(
        @Path("bookId") bookId: Int,
        @Query("page") page: Int,
        @Query("size") size: Int
    ): Response<ReviewResponse>

    @PUT("api/v3/reviews/{reviewId}")
    suspend fun updateReview(
        @Path("reviewId") reviewId: Int,
        @Body review: ReviewRequest
    ): Response<Review>

    @DELETE("api/v3/reviews/{reviewId}")
    suspend fun deleteReview(@Path("reviewId") reviewId: Int): Response<Unit>

    // ==== RESEÑAS DE USUARIO ====
    @GET("api/v3/users/{userId}/reviews")
    suspend fun getReviewsByUser(@Path("userId") userId: Int): Response<ReviewResponse>

    // ==== 📝 ADMIN TEXT TYPE ENDPOINTS ====

    @POST("api/v3/admin/text-types")
    suspend fun createTextType(@Body request: TextTypeRequest): Response<TextType>

    @GET("api/v3/admin/text-types")
    suspend fun getAllTextTypes(): Response<List<TextType>>

    @GET("api/v3/admin/text-types/{id}")
    suspend fun getTextTypeById(@Path("id") id: Int): Response<TextType>

    @PUT("api/v3/admin/text-types/{id}")
    suspend fun updateTextType(@Path("id") id: Int, @Body request: TextTypeRequest): Response<TextType>

    @DELETE("api/v3/admin/text-types/{id}")
    suspend fun deleteTextType(@Path("id") id: Int): Response<Unit>

    // ==== 🎭 ADMIN GENRE ENDPOINTS ====

    @POST("api/v3/admin/genres")
    suspend fun createGenre(@Body request: GenreRequest): Response<Genre>

    @GET("api/v3/admin/genres")
    suspend fun getAllGenres(): Response<List<Genre>>

    @GET("api/v3/admin/genres/{id}")
    suspend fun getGenreById(@Path("id") id: Int): Response<Genre>

    @PUT("api/v3/admin/genres/{id}")
    suspend fun updateGenre(@Path("id") id: Int, @Body request: GenreRequest): Response<Genre>

    @DELETE("api/v3/admin/genres/{id}")
    suspend fun deleteGenre(@Path("id") id: Int): Response<Unit>

    // ==== 🏢 ADMIN EDITORIAL ENDPOINTS ====

    @POST("api/v3/admin/editorials")
    suspend fun createEditorial(@Body request: EditorialRequest): Response<Editorial>

    @GET("api/v3/admin/editorials")
    suspend fun getAllEditorials(): Response<List<Editorial>>

    @GET("api/v3/admin/editorials/{id}")
    suspend fun getEditorialById(@Path("id") id: Int): Response<Editorial>

    @PUT("api/v3/admin/editorials/{id}")
    suspend fun updateEditorial(@Path("id") id: Int, @Body request: EditorialRequest): Response<Editorial>

    @DELETE("api/v3/admin/editorials/{id}")
    suspend fun deleteEditorial(@Path("id") id: Int): Response<Unit>

    // ==== 🌍 ADMIN COUNTRY ENDPOINTS ====

    @POST("api/v3/admin/countries")
    suspend fun createCountry(@Body request: CountryRequest): Response<Country>

    @GET("api/v3/admin/countries")
    suspend fun getAllCountries(): Response<List<Country>>

    @GET("api/v3/admin/countries/{id}")
    suspend fun getCountryById(@Path("id") id: Int): Response<Country>

    @PUT("api/v3/admin/countries/{id}")
    suspend fun updateCountry(@Path("id") id: Int, @Body request: CountryRequest): Response<Country>

    @DELETE("api/v3/admin/countries/{id}")
    suspend fun deleteCountry(@Path("id") id: Int): Response<Unit>

    // ==== ✍️ ADMIN AUTHOR ENDPOINTS ====

    @POST("api/v3/admin/authors")
    suspend fun createAuthor(@Body request: AuthorRequest): Response<Author>

    @GET("api/v3/admin/authors")
    suspend fun getAllAuthors(): Response<List<Author>>

    @GET("api/v3/admin/authors/{id}")
    suspend fun getAuthorById(@Path("id") id: Int): Response<Author>

    @PUT("api/v3/admin/authors/{id}")
    suspend fun updateAuthor(@Path("id") id: Int, @Body request: AuthorRequest): Response<Author>

    @DELETE("api/v3/admin/authors/{id}")
    suspend fun deleteAuthor(@Path("id") id: Int): Response<Unit>

    // ==== 📚 ADMIN BOOK ENDPOINTS ====

    @POST("api/v3/admin/books")
    suspend fun createBook(@Body request: BookRequest): Response<Book>

    @POST("api/v3/admin/books/batch")
    suspend fun createBooksBatch(@Body request: List<BookRequest>): Response<List<Book>>

    @PUT("api/v3/admin/books/{id}")
    suspend fun updateBook(@Path("id") id: Int, @Body request: BookRequest): Response<Book>

    @DELETE("api/v3/admin/books/{id}")
    suspend fun deleteBook(@Path("id") id: Int): Response<Unit>

    // ==== 🧑‍💻 ADMIN USER ENDPOINTS ====

    @GET("api/v3/admin/users")
    suspend fun getAllUsers(): Response<List<AdminUser>>

    @GET("api/v3/admin/users/{id}")
    suspend fun getUserById(@Path("id") id: Int): Response<AdminUser>

    @DELETE("api/v3/admin/users/{id}")
    suspend fun deleteUser(@Path("id") id: Int): Response<Unit>


//    @PUT("api/v2/user/profile")
//    suspend fun updateUserProfile(@Body request: UserProfileSetupRequest): Response<User>

    // Agregar un libro a favoritos
    @POST("api/v3/users/me/favorites/{bookId}")
    suspend fun addFavorite(@Path("bookId") bookId: Int): Response<Unit>

    @DELETE("api/v3/users/me/favorites/{bookId}")
    suspend fun removeFavorite(@Path("bookId") bookId: Int): Response<Unit>
    }
