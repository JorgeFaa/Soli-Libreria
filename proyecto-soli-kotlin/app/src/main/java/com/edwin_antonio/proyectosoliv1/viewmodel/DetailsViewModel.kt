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
        val book = _uiState.value.book ?: return

        _uiState.value = _uiState.value.copy(isAddingToFavorites = true)

        viewModelScope.launch {
            try {
                val response = apiService.addFavorite(book.id)

                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        isAddingToFavorites = false,
                        errorMessage = null
                    )
                } else {
                    val msg = when (response.code()) {
                        401 -> "Sesión expirada. Inicia sesión nuevamente."
                        403 -> "No tienes permiso para agregar favoritos."
                        404 -> "Libro no encontrado en el servidor."
                        else -> "Error al agregar a favoritos (${response.code()})"
                    }

                    _uiState.value = _uiState.value.copy(
                        isAddingToFavorites = false,
                        errorMessage = msg
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isAddingToFavorites = false,
                    errorMessage = "Error de conexión: ${e.message}"
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