package com.edwin_antonio.proyectosoliv1.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.model.RegisterRequest
import com.edwin_antonio.proyectosoliv1.model.RegisterResponse
import com.edwin_antonio.proyectosoliv1.network.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class RegisterUiState(
    val username: String = "", // email usado como username
    val password: String = "",
    val isPasswordVisible: Boolean = false,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val isRegisterSuccessful: Boolean = false
)

class RegisterViewModel(
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(RegisterUiState())
    val uiState: StateFlow<RegisterUiState> = _uiState.asStateFlow()

    private val apiService = RetrofitClient.getPublicInstance() // Usar instancia pública para registro

    fun updateUsername(username: String) {
        _uiState.value = _uiState.value.copy(username = username, errorMessage = null)
    }

    fun updatePassword(password: String) {
        _uiState.value = _uiState.value.copy(password = password, errorMessage = null)
    }

    fun togglePasswordVisibility() {
        _uiState.value = _uiState.value.copy(
            isPasswordVisible = !_uiState.value.isPasswordVisible
        )
    }

    private fun isPasswordValid(password: String): Boolean {
        val passwordRegex = """^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$""".toRegex()
        return password.matches(passwordRegex)
    }

    fun register() {
        val currentState = _uiState.value

        if (currentState.username.isBlank() || currentState.password.isBlank()) {
            _uiState.value = currentState.copy(errorMessage = "Por favor completa todos los campos")
            return
        }

        if (!isPasswordValid(currentState.password)) {
            _uiState.value = currentState.copy(errorMessage = "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un caracter especial.")
            return
        }

        _uiState.value = currentState.copy(isLoading = true, errorMessage = null)

        viewModelScope.launch {
            try {
                val response = apiService.register(
                    RegisterRequest(
                        username = currentState.username,
                        password = currentState.password
                    )
                )

                if (response.isSuccessful && response.body()?.success == true) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRegisterSuccessful = true,
                        errorMessage = null
                    )
                } else {
                    val errorMessage = if (response.isSuccessful) {
                        response.body()?.message ?: "Error al registrar"
                    } else {
                        when (response.code()) {
                            400 -> "Datos inválidos. Verifica la información."
                            409 -> "Este email ya está registrado"
                            500 -> "Error del servidor. Inténtalo más tarde."
                            else -> "No se pudo registrar: ${response.code()}"
                        }
                    }
                    _uiState.value = currentState.copy(
                        isLoading = false,
                        errorMessage = errorMessage
                    )
                }
            } catch (e: Exception) {
                _uiState.value = currentState.copy(
                    isLoading = false,
                    errorMessage = "Error de conexión: ${e.message}"
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }

    fun resetRegisterSuccess() {
        _uiState.value = _uiState.value.copy(isRegisterSuccessful = false)
    }
}
