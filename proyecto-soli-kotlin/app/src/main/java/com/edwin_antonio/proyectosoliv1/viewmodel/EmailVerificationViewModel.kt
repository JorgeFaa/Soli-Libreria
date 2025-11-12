package com.edwin_antonio.proyectosoliv1.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.edwin_antonio.proyectosoliv1.model.ResendVerificationRequest
import com.edwin_antonio.proyectosoliv1.model.VerificationRequest
import com.edwin_antonio.proyectosoliv1.network.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class EmailVerificationUiState(
    val code: String = "",
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val isVerificationSuccessful: Boolean = false,
    val resendMessage: String? = null
)

class EmailVerificationViewModel(private val username: String) : ViewModel() {

    private val _uiState = MutableStateFlow(EmailVerificationUiState())
    val uiState: StateFlow<EmailVerificationUiState> = _uiState.asStateFlow()

    private val apiService = RetrofitClient.getPublicInstance()

    fun updateCode(code: String) {
        if (code.length <= 6) {
            _uiState.value = _uiState.value.copy(code = code, errorMessage = null, resendMessage = null)
        }
    }

    fun verifyCode() {
        val currentState = _uiState.value
        if (currentState.code.length != 6) {
            _uiState.value = currentState.copy(errorMessage = "El código debe tener 6 dígitos.")
            return
        }

        _uiState.value = currentState.copy(isLoading = true, errorMessage = null, resendMessage = null)

        viewModelScope.launch {
            try {
                val response = apiService.verifyAccount(VerificationRequest(username = username, code = currentState.code))
                if (response.isSuccessful && response.body()?.success == true) {
                    _uiState.value = _uiState.value.copy(isLoading = false, isVerificationSuccessful = true)
                } else {
                    val error = response.body()?.message ?: "Código de verificación inválido."
                    _uiState.value = currentState.copy(isLoading = false, errorMessage = error)
                }
            } catch (e: Exception) {
                _uiState.value = currentState.copy(isLoading = false, errorMessage = "Error de conexión: ${e.message}")
            }
        }
    }

    fun resendVerificationCode() {
        val currentState = _uiState.value
        _uiState.value = currentState.copy(isLoading = true, errorMessage = null, resendMessage = null)

        viewModelScope.launch {
            try {
                val response = apiService.resendVerification(ResendVerificationRequest(username = username))
                if (response.isSuccessful && response.body()?.success == true) {
                    _uiState.value = _uiState.value.copy(isLoading = false, resendMessage = response.body()?.message)
                } else {
                     val error = response.body()?.message ?: "No se pudo reenviar el código."
                    _uiState.value = currentState.copy(isLoading = false, errorMessage = error)
                }
            } catch (e: Exception) {
                _uiState.value = currentState.copy(isLoading = false, errorMessage = "Error de conexión: ${e.message}")
            }
        }
    }

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(errorMessage = null, resendMessage = null)
    }
}
