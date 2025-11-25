package com.edwin_antonio.proyectosoliv1.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.edwin_antonio.proyectosoliv1.model.User
import com.edwin_antonio.proyectosoliv1.repository.AuthRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import retrofit2.HttpException

data class AuthUiState(
    val isLoading: Boolean = false,
    val isLoggedIn: Boolean = false,
    val user: User? = null,
    val errorMessage: String? = null,
    val loginSuccess: Boolean = false,
    val needsProfileSetup: Boolean = false,
    val isCheckingProfile: Boolean = false
)

class AuthViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    // Observar el estado de login desde el repository
    init {
        viewModelScope.launch {
            authRepository.isLoggedIn.collect { isLoggedIn ->
                _uiState.value = _uiState.value.copy(
                    isLoggedIn = isLoggedIn,
                    user = if (isLoggedIn) authRepository.getLocalUserInfo() else null
                )
            }
        }
    }

    fun login(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "Por favor ingresa email y contraseña"
            )
            return
        }

        if (!isValidEmail(email)) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "Por favor ingresa un email válido"
            )
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                errorMessage = null
            )

            authRepository.login(email.trim(), password)
                .onSuccess {
                    authRepository.needsProfileSetup()
                        .onSuccess { needsSetup ->
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                loginSuccess = true,
                                user = authRepository.getLocalUserInfo(),
                                needsProfileSetup = needsSetup,
                                errorMessage = null
                            )
                        }
                        .onFailure { profileException ->
                            val needsSetup = profileException is HttpException && profileException.code() == 404
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                loginSuccess = true,
                                user = authRepository.getLocalUserInfo(),
                                needsProfileSetup = needsSetup,
                                errorMessage = if (needsSetup) null else "Error checking profile: ${profileException.message}"
                            )
                        }
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        loginSuccess = false,
                        errorMessage = exception.message ?: "Error desconocido al iniciar sesión"
                    )
                }
        }
    }

    fun logout() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            authRepository.logout()
                .onSuccess {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isLoggedIn = false,
                        user = null,
                        loginSuccess = false
                    )
                }
                .onFailure {
                    // Aunque falle, el logout local siempre se ejecuta
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isLoggedIn = false,
                        user = null,
                        loginSuccess = false
                    )
                }
        }
    }

    fun refreshUserData() {
        viewModelScope.launch {
            authRepository.getCurrentUser()
                .onSuccess { user ->
                    _uiState.value = _uiState.value.copy(user = user)
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        errorMessage = exception.message
                    )
                }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }

    fun clearLoginSuccess() {
        _uiState.value = _uiState.value.copy(loginSuccess = false, needsProfileSetup = false)
    }

    fun isUserLoggedIn(): Boolean {
        return authRepository.isUserLoggedIn()
    }

    fun hasReaderAccess(): Boolean {
        return authRepository.hasReaderAccess()
    }

    fun hasEditorAccess(): Boolean {
        return authRepository.hasEditorAccess()
    }

    fun hasAdminAccess(): Boolean {
        return authRepository.hasAdminAccess()
    }

    fun checkProfileSetup() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isCheckingProfile = true)

            authRepository.needsProfileSetup()
                .onSuccess { needsSetup ->
                    _uiState.value = _uiState.value.copy(
                        needsProfileSetup = needsSetup,
                        isCheckingProfile = false
                    )
                }
                .onFailure { exception ->
                    // If we can't check, assume no setup needed and let them proceed
                    _uiState.value = _uiState.value.copy(
                        needsProfileSetup = false,
                        isCheckingProfile = false,
                        errorMessage = "Error checking profile: ${exception.message}"
                    )
                }
        }
    }

    fun clearProfileSetupFlag() {
        _uiState.value = _uiState.value.copy(needsProfileSetup = false)
    }

    private fun isValidEmail(email: String): Boolean {
        return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
}
