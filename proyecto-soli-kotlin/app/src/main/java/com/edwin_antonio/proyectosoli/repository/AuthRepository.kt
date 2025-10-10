package com.edwin_antonio.proyectosoliv1.repository

import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.model.LoginRequest
import com.edwin_antonio.proyectosoliv1.model.User
import com.edwin_antonio.proyectosoliv1.network.ApiService
import com.edwin_antonio.proyectosoliv1.network.RetrofitClient
import kotlinx.coroutines.flow.StateFlow

class AuthRepository(
    private val tokenManager: TokenManager
) {
    
    private val apiService by lazy { 
        RetrofitClient.getInstance(tokenManager) 
    }
    
    private val publicApiService by lazy {
        RetrofitClient.getPublicInstance()
    }
    
    val isLoggedIn: StateFlow<Boolean> = tokenManager.isLoggedIn
    
    suspend fun login(email: String, password: String): Result<String> {
        return try {
            println("🚀 AuthRepository: Intentando login con email: $email")
            val request = LoginRequest(username = email, password = password) // Email se envía como username
            val response = publicApiService.login(request)
            
            println("📊 AuthRepository: Response code: ${response.code()}")
            
            if (response.isSuccessful) {
                val loginResponse = response.body()!!
                println("AuthRepository: Login Response: $loginResponse")
                
                // Verificar si la cuenta necesita verificación
                if (loginResponse.status == "UNCONFIRMED") {
                    return Result.failure(Exception("Cuenta no confirmada. Verifica tu email."))
                }
                
                // Verificar que tengamos los tokens necesarios
                if (loginResponse.accessToken != null && 
                    loginResponse.refreshToken != null &&
                    loginResponse.idToken != null) {
                    
                    println("AuthRepository: Access Token: ${loginResponse.accessToken}")
                    println("AuthRepository: ID Token: ${loginResponse.idToken}")
                    println("AuthRepository: Refresh Token: ${loginResponse.refreshToken}")
                    
                    // Guardar los tokens
                    tokenManager.saveTokens(
                        accessToken = loginResponse.accessToken,
                        idToken = loginResponse.idToken,
                        refreshToken = loginResponse.refreshToken
                    )
                    
                    // Guardar información básica del usuario (temporal)
                    tokenManager.saveUserInfo(
                        userId = email, // Usamos email como ID por ahora
                        email = email,
                        name = null,
                        role = "USER" // Rol por defecto
                    )
                    
                    println("AuthRepository: Login exitoso, tokens guardados")
                    Result.success(loginResponse.accessToken)
                } else {
                    Result.failure(Exception("Respuesta de login incompleta del servidor"))
                }
            } else {
                println("AuthRepository: Response NO exitosa. Código: ${response.code()}")
                println("AuthRepository: Error body: ${response.errorBody()?.string()}")
                val errorMsg = when (response.code()) {
                    401 -> "Email o contraseña incorrectos"
                    400 -> "Datos de login inválidos"
                    500 -> "Error del servidor"
                    else -> "Error de conexión: ${response.code()}"
                }
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            println("AuthRepository: Excepción durante login: ${e.message}")
            Result.failure(Exception("Error de conexión: ${e.message}"))
        }
    }
    
    suspend fun logout(): Result<Unit> {
        return try {
            // Intentar hacer logout en el servidor
            val response = apiService.logout()
            
            // Siempre limpiar tokens localmente, aunque falle el servidor
            tokenManager.clearTokens()
            
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                // Aunque falle el servidor, consideramos exitoso el logout local
                Result.success(Unit)
            }
        } catch (e: Exception) {
            // Aún en caso de error, limpiar tokens localmente
            tokenManager.clearTokens()
            Result.success(Unit)
        }
    }
    
    suspend fun getCurrentUser(): Result<User> {
        return try {
            val response = apiService.getCurrentUser()
            
            if (response.isSuccessful) {
                val user = response.body()!!
                
                // Actualizar información local del usuario
                tokenManager.saveUserInfo(
                    user.id.toString(),
                    "${user.firstName} ${user.lastName}", // No hay username, usar nombre completo
                    user.firstName,
                    user.roleName
                )
                
                Result.success(user)
            } else {
                if (response.code() == 401) {
                    // Token expirado, el interceptor debería manejarlo
                    Result.failure(Exception("Sesión expirada"))
                } else {
                    Result.failure(Exception("Error al obtener usuario: ${response.code()}"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun isUserLoggedIn(): Boolean {
        return tokenManager.hasValidTokens()
    }
    
    fun getUserRole(): String? {
        return tokenManager.getUserRole()
    }
    
    fun getLocalUserInfo(): User? {
        val userId = tokenManager.getUserId()
        val email = tokenManager.getUserEmail()
        val name = tokenManager.getUserName()
        val roleString = tokenManager.getUserRole()
        
        return if (userId != null && email != null && roleString != null) {
            try {
                // Crear usuario temporal con datos básicos
                User(
                    id = userId.toIntOrNull() ?: 0,
                    firstName = name ?: email.substringBefore("@"),
                    lastName = "",
                    activeMember = true,
                    prefferedGenreIds = emptyList(),
                    roleName = roleString
                )
            } catch (e: Exception) {
                null
            }
        } else {
            null
        }
    }
    
    fun hasReaderAccess(): Boolean {
        val userRole = getUserRole()
        return userRole == "USER" || userRole == "EDITOR" || userRole == "ADMIN"
    }
    
    fun hasEditorAccess(): Boolean {
        val userRole = getUserRole()
        return userRole == "EDITOR" || userRole == "ADMIN"
    }
    
    fun hasAdminAccess(): Boolean {
        return getUserRole() == "ADMIN"
    }
}