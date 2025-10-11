package com.edwin_antonio.proyectosoliv1.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.model.Book
import com.edwin_antonio.proyectosoliv1.network.ApiService
import com.edwin_antonio.proyectosoliv1.network.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class DetailsUiState(
    val isLoading: Boolean = true,
    val book: Book? = null,
    val errorMessage: String? = null,
    val isAddingToFavorites: Boolean = false,
    val requiresAuth: Boolean = false
)

class DetailsViewModel(
    private val tokenManager: TokenManager
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(DetailsUiState())
    val uiState: StateFlow<DetailsUiState> = _uiState.asStateFlow()
    
    private val apiService = RetrofitClient.getInstance(tokenManager)
    
    fun loadBook(bookId: String) {
        _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
        
        viewModelScope.launch {
            try {
                // Convertir String a Int para la API
                val bookIdInt = bookId.toIntOrNull() ?: return@launch
                val response = apiService.getBookById(bookIdInt)
                
                if (response.isSuccessful) {
                    val book = response.body()
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        book = book,
                        errorMessage = null
                    )
                } else {
                    val errorMessage = when (response.code()) {
                        401 -> {
                            _uiState.value = _uiState.value.copy(requiresAuth = true)
                            "Sesión expirada. Por favor, inicia sesión nuevamente."
                        }
                        403 -> "No tienes permisos para acceder a este contenido"
                        404 -> "Libro no encontrado"
                        else -> "Error al cargar libro: ${response.code()}"
                    }
                    
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = errorMessage
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Error de conexión: ${e.message}"
                )
            }
        }
    }
    
    fun addToFavorites() {
        // TODO: Implementar cuando se tenga el endpoint de favoritos
        _uiState.value = _uiState.value.copy(isAddingToFavorites = true)
        
        viewModelScope.launch {
            try {
                // Simulamos una operación por ahora
                kotlinx.coroutines.delay(1000)
                _uiState.value = _uiState.value.copy(isAddingToFavorites = false)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isAddingToFavorites = false,
                    errorMessage = "Error al agregar a favoritos"
                )
            }
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
    
    fun clearAuthRequired() {
        _uiState.value = _uiState.value.copy(requiresAuth = false)
    }
}