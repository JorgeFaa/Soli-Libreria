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
                println("AuthRepository: Login raw body: ${response.body()}")
                println("AuthRepository: Login raw JSON: ${response.errorBody()?.string()}")
                
                // Verificar si la cuenta necesita verificación
                if (loginResponse.status == "UNCONFIRMED") {
                    return Result.failure(Exception("Cuenta no confirmada. Verifica tu email."))
                }
                
                // Verificar que tengamos los tokens necesarios
                if (loginResponse.tokens?.accessToken != null &&
                    loginResponse.tokens.idToken != null &&
                    loginResponse.tokens.refreshToken != null) {

                    tokenManager.saveTokens(
                        accessToken = loginResponse.tokens.accessToken,
                        idToken = loginResponse.tokens.idToken,
                        refreshToken = loginResponse.tokens.refreshToken
                    )

                    // Guardar info básica del usuario
                    tokenManager.saveUserInfo(
                        userId = email,
                        email = email,
                        name = null,
                        role = "USER"
                    )
                    
                    println("AuthRepository: Login exitoso, tokens guardados")
                    Result.success(loginResponse.tokens.accessToken)
                } else {
                    Result.failure(Exception("Respuesta de login incompleta del servidor"))
                }
            } else { //CREO QUE ESTE ES EL TRY CATCH QUE FALLA
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
                    preferredGenreIds = emptyList(),
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
    
    suspend fun needsProfileSetup(): Result<Boolean> {
        return try {
            val response = apiService.getCurrentUser()
            
            if (response.isSuccessful) {
                val user = response.body()!!
                // Check if user has completed profile setup
                // A user needs profile setup if firstName is empty or they have no preferred genres
                val needsSetup = user.firstName.isBlank() || user.lastName.isBlank()
                Result.success(needsSetup)
            } else {
                if (response.code() == 401) {
                    Result.failure(Exception("Session expired"))
                } else {
                    Result.failure(Exception("Error checking profile: ${response.code()}"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}