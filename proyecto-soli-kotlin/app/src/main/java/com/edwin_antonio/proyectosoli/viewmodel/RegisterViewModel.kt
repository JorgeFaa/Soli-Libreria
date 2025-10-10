package com.edwin_antonio.proyectosoliv1.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.edwin_antonio.proyectosoliv1.model.RegisterRequest
import com.edwin_antonio.proyectosoliv1.network.RetrofitClient
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class RegisterUiState(
    val name: String = "",
    val lastname: String = "",
    val gender: String = "",
    val username: String = "", // email
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
    
    // Lista de géneros exactamente como en React Native
    val genderOptions = listOf("Hombre", "Mujer", "No Binario")
    
    fun updateName(name: String) {
        _uiState.value = _uiState.value.copy(name = name, errorMessage = null)
    }
    
    fun updateLastname(lastname: String) {
        _uiState.value = _uiState.value.copy(lastname = lastname, errorMessage = null)
    }
    
    fun updateGender(gender: String) {
        _uiState.value = _uiState.value.copy(gender = gender, errorMessage = null)
    }
    
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
    
    fun register() {
        val currentState = _uiState.value
        
        // Validaciones igual que React Native
        if (currentState.name.isBlank() || 
            currentState.lastname.isBlank() || 
            currentState.gender.isBlank() || 
            currentState.username.isBlank() || 
            currentState.password.isBlank()) {
            _uiState.value = currentState.copy(
                errorMessage = "Por favor completa todos los campos"
            )
            return
        }
        
        _uiState.value = currentState.copy(isLoading = true, errorMessage = null)
        
        viewModelScope.launch {
            try {
                val response = apiService.register(
                    RegisterRequest(
                        email = currentState.username,
                        password = currentState.password,
                        firstName = currentState.name,
                        lastName = currentState.lastname
                    )
                )
                
                if (response.isSuccessful) {
                    _uiState.value = currentState.copy(
                        isLoading = false,
                        isRegisterSuccessful = true,
                        errorMessage = null
                    )
                } else {
                    val errorBody = response.errorBody()?.string()
                    _uiState.value = currentState.copy(
                        isLoading = false,
                        errorMessage = "No se pudo registrar"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = currentState.copy(
                    isLoading = false,
                    errorMessage = "Ocurrió un error al registrar"
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