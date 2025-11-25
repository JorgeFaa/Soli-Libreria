package com.edwin_antonio.proyectosoliv1.network

import com.edwin_antonio.proyectosoliv1.auth.AuthInterceptor
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import okhttp3.Interceptor // { changed code }
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * 🔧 Cliente Retrofit para la API de Soli con soporte de autenticación
 */
object RetrofitClient {
    // 🌐 URL base exacta del proyecto
    const val BASE_URL = "https://soli-api.gentledesert-973b7428.westus2.azurecontainerapps.io/"
    
    fun getInstance(tokenManager: TokenManager): ApiService {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        
        val authInterceptor = AuthInterceptor(tokenManager, BASE_URL)
        
        // Interceptor responsable de añadir Authorization: Bearer <token>
        val headerInterceptor = Interceptor { chain ->
            val original = chain.request()
            // no sobrescribir si ya existe Authorization
            if (original.header("Authorization") != null) {
                return@Interceptor chain.proceed(original)
            }
            // intentar accessToken primero, si no existe usar idToken como fallback
            val token = tokenManager.getAccessToken() ?: tokenManager.getIdToken()
            val request = if (!token.isNullOrBlank()) {
                val headerValue = if (token.startsWith("Bearer ", ignoreCase = true)) token else "Bearer $token"
                original.newBuilder().header("Authorization", headerValue).build()
            } else {
                original
            }
            chain.proceed(request)
        } // { changed code }

        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(headerInterceptor)      // añade header si hay token (o idToken)
            .addInterceptor(authInterceptor)        // interceptor para refresh / manejo auth
            .addInterceptor(loggingInterceptor)     // logging al final para mostrar headers finales
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
        
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        return retrofit.create(ApiService::class.java)
    }
    
    // Cliente sin autenticación para endpoints públicos
    fun getPublicInstance(): ApiService {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        
        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
        
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        return retrofit.create(ApiService::class.java)
    }
}
