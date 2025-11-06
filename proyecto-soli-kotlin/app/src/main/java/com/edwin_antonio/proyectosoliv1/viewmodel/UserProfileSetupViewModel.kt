package com.edwin_antonio.proyectosoliv1.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.model.Genre
import com.edwin_antonio.proyectosoliv1.model.RegisterRequest
import com.edwin_antonio.proyectosoliv1.network.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class UserProfileSetupState(
    val firstName: String = "",
    val lastName: String = "",
    val firstNameError: String? = null,
    val lastNameError: String? = null,
    val availableGenres: List<Genre> = emptyList(),
    val selectedGenreIds: Set<Int> = emptySet(),
    val isLoadingGenres: Boolean = false,
    val genresError: String? = null,
    val isSaving: Boolean = false,
    val saveError: String? = null
)

class UserProfileSetupViewModel(private val tokenManager: TokenManager) : ViewModel() {
    
    private val _uiState = MutableStateFlow(UserProfileSetupState())
    val uiState: StateFlow<UserProfileSetupState> = _uiState.asStateFlow()
    
    private val apiService = RetrofitClient.getInstance(tokenManager)
    
    init {
        loadGenres()
        loadExistingUserData()
    }
    
    fun updateFirstName(firstName: String) {
        _uiState.value = _uiState.value.copy(
            firstName = firstName,
            firstNameError = null
        )
    }
    
    fun updateLastName(lastName: String) {
        _uiState.value = _uiState.value.copy(
            lastName = lastName,
            lastNameError = null
        )
    }
    
    fun toggleGenre(genreId: Int) {
        val currentSelected = _uiState.value.selectedGenreIds
        val newSelected = if (currentSelected.contains(genreId)) {
            currentSelected - genreId
        } else {
            currentSelected + genreId
        }
        
        _uiState.value = _uiState.value.copy(selectedGenreIds = newSelected)
    }
    
    fun loadGenres() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoadingGenres = true,
                genresError = null
            )
            
            try {
                val response = apiService.getAllGenres()
                if (response.isSuccessful) {
                    val genres = response.body() ?: emptyList()
                    _uiState.value = _uiState.value.copy(
                        availableGenres = genres,
                        isLoadingGenres = false
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        genresError = "Error al cargar géneros: ${response.code()}",
                        isLoadingGenres = false
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    genresError = "Error de conexión: ${e.message}",
                    isLoadingGenres = false
                )
            }
        }
    }
    
    private fun validateFields(): Boolean {
        var hasErrors = false
        val state = _uiState.value
        
        // Validate first name (only if not blank)
        val firstNameError = when {
            state.firstName.isNotBlank() && state.firstName.length < 2 -> {
                hasErrors = true
                "El nombre debe tener al menos 2 caracteres"
            }
            state.firstName.isNotBlank() && state.firstName.length > 50 -> {
                hasErrors = true
                "El nombre no debe exceder 50 caracteres"
            }
            state.firstName.isNotBlank() && !state.firstName.matches(Regex("^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\\s]+$")) -> {
                hasErrors = true
                "El nombre solo debe contener letras"
            }
            else -> null
        }
        
        // Validate last name (only if not blank)
        val lastNameError = when {
            state.lastName.isNotBlank() && state.lastName.length < 2 -> {
                hasErrors = true
                "El apellido debe tener al menos 2 caracteres"
            }
            state.lastName.isNotBlank() && state.lastName.length > 50 -> {
                hasErrors = true
                "El apellido no debe exceder 50 caracteres"
            }
            state.lastName.isNotBlank() && !state.lastName.matches(Regex("^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\\s]+$")) -> {
                hasErrors = true
                "El apellido solo debe contener letras"
            }
            else -> null
        }
        
        
        _uiState.value = _uiState.value.copy(
            firstNameError = firstNameError,
            lastNameError = lastNameError
        )
        
        return !hasErrors
    }
    
    private fun loadExistingUserData() {
        viewModelScope.launch {
            try {
                val response = apiService.getCurrentUser()
                if (response.isSuccessful) {
                    val user = response.body()
                    user?.let {
                        _uiState.value = _uiState.value.copy(
                            firstName = it.firstName,
                            lastName = it.lastName,
                            selectedGenreIds = it.prefferredGenreIds.toSet()
                        )
                    }
                }
                // If it fails, just keep empty fields for new users
            } catch (e: Exception) {
                // If it fails, just keep empty fields for new users
            }
        }
    }
    
    fun saveProfile(onComplete: (Boolean) -> Unit) {
        if (!validateFields()) {
            onComplete(false)
            return
        }
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isSaving = true,
                saveError = null
            )

            try {
                val state = _uiState.value
                val request = RegisterRequest(
                    firstName = state.firstName.trim(),
                    lastName = state.lastName.trim(),
                    preferredGenreIds = state.selectedGenreIds.toList(),
                    email = tokenManager.getUserEmail() ?: ""
                )
                
                val response = apiService.createUser(request)
                
                if (response.isSuccessful) {
                    val updatedUser = response.body()
                    
                    // Update local user info
                    updatedUser?.let { user ->
                        tokenManager.saveUserInfo(
                            userId = user.id.toString(),
                            email = tokenManager.getUserEmail() ?: "",
                            name = "${user.firstName} ${user.lastName}",
                            role = user.roleName
                        )
                    }
                    
                    _uiState.value = _uiState.value.copy(isSaving = false)
                    onComplete(true)
                } else {
                    val errorMessage = when (response.code()) {
                        400 -> "Datos inválidos. Por favor verifica la información."
                        401 -> "Sesión expirada. Por favor inicia sesión nuevamente."
                        500 -> "Error del servidor. Inténtalo más tarde."
                        else -> "Error al guardar el perfil: ${response.code()}"
                    }
                    
                    _uiState.value = _uiState.value.copy(
                        saveError = errorMessage,
                        isSaving = false
                    )
                    onComplete(false)
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    saveError = "Error de conexión: ${e.message}",
                    isSaving = false
                )
                onComplete(false)
            }
        }
    }
}