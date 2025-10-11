package com.edwin_antonio.proyectosoliv1.auth

import com.edwin_antonio.proyectosoliv1.network.ApiService
import com.edwin_antonio.proyectosoliv1.model.RefreshTokenRequest
import com.edwin_antonio.proyectosoliv1.model.RefreshTokenResponse
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.net.HttpURLConnection

class AuthInterceptor(
    private val tokenManager: TokenManager,
    private val baseUrl: String
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        
        // Si es una request de login o refresh, no añadir token
        if (isAuthRequest(originalRequest)) {
            return chain.proceed(originalRequest)
        }
        
        // Añadir token de acceso a la request
        val token = tokenManager.getAccessToken()
        val authenticatedRequest = if (token != null) {
            originalRequest.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            originalRequest
        }
        
        val response = chain.proceed(authenticatedRequest)
        
        // Si recibimos 401 (Unauthorized), intentar refresh del token
        if (response.code == HttpURLConnection.HTTP_UNAUTHORIZED && token != null) {
            response.close()
            
            val refreshToken = tokenManager.getRefreshToken()
            if (refreshToken != null) {
                return handleTokenRefresh(chain, originalRequest, refreshToken)
            }
            
            // Si no hay refresh token, limpiar tokens y devolver respuesta 401
            tokenManager.clearTokens()
            return chain.proceed(originalRequest)
        }
        
        return response
    }
    
    private fun isAuthRequest(request: Request): Boolean {
        val url = request.url.toString()
        return url.contains("/api/v1/user/login") || 
               url.contains("/api/v1/user/register") || 
               url.contains("/api/v1/user/auth/refresh-token") ||
               url.contains("/api/v1/user/verify-account") ||
               url.contains("/api/v1/user/resend-verification") ||
               url.contains("/api/v1/user/status")
    }
    
    private fun handleTokenRefresh(
        chain: Interceptor.Chain, 
        originalRequest: Request, 
        refreshToken: String
    ): Response {
        return runBlocking {
            try {
                // Crear un nuevo cliente para el refresh sin este interceptor
                val refreshService = Retrofit.Builder()
                    .baseUrl(baseUrl)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build()
                    .create(ApiService::class.java)
                
                // Llamar al endpoint de refresh
                val refreshRequest = RefreshTokenRequest(refreshToken)
                val refreshResponse = refreshService.refreshToken(refreshRequest)
                
                if (refreshResponse.isSuccessful) {
                    val newTokens = refreshResponse.body()!!
                    
                    // Guardar los nuevos tokens
                    tokenManager.updateTokensAfterRefresh(
                        newTokens.accessToken,
                        newTokens.idToken,
                        newTokens.refreshToken
                    )
                    
                    // Rehacer la request original con el nuevo token
                    val newRequest = originalRequest.newBuilder()
                        .header("Authorization", "Bearer ${newTokens.accessToken}")
                        .build()
                    
                    chain.proceed(newRequest)
                } else {
                    // Si el refresh falló, limpiar tokens
                    tokenManager.clearTokens()
                    chain.proceed(originalRequest)
                }
            } catch (e: Exception) {
                // Si hay error en el refresh, limpiar tokens
                tokenManager.clearTokens()
                chain.proceed(originalRequest)
            }
        }
    }
}