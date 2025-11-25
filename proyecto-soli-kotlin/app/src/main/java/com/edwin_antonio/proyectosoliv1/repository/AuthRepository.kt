package com.edwin_antonio.proyectosoliv1.repository

import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.model.LoginRequest
import com.edwin_antonio.proyectosoliv1.model.User
import com.edwin_antonio.proyectosoliv1.network.ApiService
import com.edwin_antonio.proyectosoliv1.network.RetrofitClient
import kotlinx.coroutines.flow.StateFlow
import org.json.JSONObject
import retrofit2.HttpException
import java.util.Base64

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

    private fun decodeRoleFromToken(token: String): String {
        return try {
            val parts = token.split('.')
            if (parts.size < 2) return "READER" // Rol por defecto

            val payload = String(Base64.getUrlDecoder().decode(parts[1]), Charsets.UTF_8)
            val json = JSONObject(payload)

            if (json.has("cognito:groups")) {
                val groups = json.getJSONArray("cognito:groups")
                for (i in 0 until groups.length()) {
                    when (groups.getString(i)) {
                        "ADMIN" -> return "ADMIN"
                        "EDITOR" -> return "EDITOR"
                    }
                }
            }
            "READER" // Rol por defecto si no se encuentra un grupo superior
        } catch (e: Exception) {
            println("AuthRepository: Error decodificando el token: ${e.message}")
            "READER" // Rol por defecto en caso de error
        }
    }

    suspend fun login(email: String, password: String): Result<String> {
        return try {
            println("🚀 AuthRepository: Intentando login con email: $email")
            val request = LoginRequest(username = email, password = password)
            val response = publicApiService.login(request)

            println("📊 AuthRepository: Response code: ${response.code()}")

            if (response.isSuccessful) {
                val authResponse = response.body()
                println("AuthRepository: Login raw body: $authResponse")

                if (authResponse?.accessToken != null &&
                    authResponse.idToken != null &&
                    authResponse.refreshToken != null) {

                    tokenManager.saveTokens(
                        accessToken = authResponse.accessToken,
                        idToken = authResponse.idToken,
                        refreshToken = authResponse.refreshToken
                    )

                    val userRole = decodeRoleFromToken(authResponse.idToken)

                    tokenManager.saveUserInfo(
                        userId = email, 
                        email = email,
                        name = null,
                        role = userRole
                    )

                    println("AuthRepository: Login exitoso, rol '$userRole' guardado.")
                    Result.success(authResponse.accessToken)
                } else {
                    Result.failure(Exception("Respuesta de login incompleta del servidor"))
                }
            } else {
                val errorBody = response.errorBody()?.string()
                println("AuthRepository: Response NO exitosa. Código: ${response.code()}")
                println("AuthRepository: Error body: $errorBody")
                val errorMsg = when (response.code()) {
                    401 -> "Email o contraseña incorrectos"
                    400 -> "Datos de login inválidos"
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
            val response = apiService.logout()
            tokenManager.clearTokens()
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.success(Unit)
            }
        } catch (e: Exception) {
            tokenManager.clearTokens()
            Result.success(Unit)
        }
    }

    suspend fun getCurrentUser(): Result<User> {
        return try {
            val response = apiService.getCurrentUser()

            if (response.isSuccessful) {
                val user = response.body()!!

                // Usar role del response si existe, sino fallback al token guardado o "READER"
                val roleToSave = user.roleName ?: tokenManager.getUserRole() ?: "READER"

                tokenManager.saveUserInfo(
                    user.id.toString(),
                    tokenManager.getUserEmail() ?: "",
                    "${user.firstName} ${user.lastName}",
                    roleToSave
                )

                Result.success(user)
            } else {
                if (response.code() == 401) {
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
                User(
                    id = userId.toIntOrNull() ?: 0,
                    firstName = name ?: email.substringBefore("@"),
                    lastName = "",
                    prefferredGenreIds = emptyList(),
                    roleName = roleString,
                    favoriteBooks = emptyList()
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
                val needsSetup = user.firstName.isBlank() || user.lastName.isBlank()
                Result.success(needsSetup)
            } else {
                Result.failure(HttpException(response))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}