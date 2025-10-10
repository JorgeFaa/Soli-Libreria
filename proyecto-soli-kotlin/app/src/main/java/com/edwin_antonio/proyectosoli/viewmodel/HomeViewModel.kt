package com.edwin_antonio.proyectosoliv1.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.model.Book
import com.edwin_antonio.proyectosoliv1.network.ApiService
import com.edwin_antonio.proyectosoliv1.network.BookSection
import com.edwin_antonio.proyectosoliv1.network.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class HomeUiState(
    val isLoading: Boolean = true,
    val books: List<Book> = emptyList(),
    val sections: List<BookSection> = emptyList(),
    val errorMessage: String? = null,
    val searchQuery: String = "",
    val isSearchActive: Boolean = false,
    val requiresAuth: Boolean = false
)

class HomeViewModel(
    private val tokenManager: TokenManager
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()
    
    private val apiService = RetrofitClient.getInstance(tokenManager)
    
    init {
        loadBooks()
    }
    
    fun loadBooks() {
        _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
        
        viewModelScope.launch {
            try {
                // Agregar timeout de 30 segundos
                kotlinx.coroutines.withTimeout(30000) {
                    println("📚 HomeViewModel: Cargando libros...")
                    val response = apiService.getAllBooks()
                    
                    if (response.isSuccessful) {
                        val books = response.body() ?: emptyList()
                        println("📚 HomeViewModel: ${books.size} libros cargados")
                        
                        val sections = createSections(books)
                        
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            books = books,
                            sections = sections,
                            errorMessage = null
                        )
                        
                        // Log de las URLs de portadas para debug
                        books.take(3).forEach { book ->
                            println("🖼️ Portada: ${book.title} -> ${book.coverUrl}")
                        }
                        
                    } else {
                        val errorMessage = when (response.code()) {
                            401 -> {
                                _uiState.value = _uiState.value.copy(requiresAuth = true)
                                "Sesión expirada. Por favor, inicia sesión nuevamente."
                            }
                            403 -> "No tienes permisos para acceder a este contenido"
                            else -> "Error al cargar libros: ${response.code()}"
                        }
                        
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = errorMessage
                        )
                    }
                }
            } catch (e: kotlinx.coroutines.TimeoutCancellationException) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Timeout: La carga de libros tomó demasiado tiempo. Intenta de nuevo."
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Error de conexión: ${e.message}"
                )
            }
        }
    }
    
    fun updateSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(
            searchQuery = query,
            sections = if (query.isBlank()) {
                createSections(_uiState.value.books)
            } else {
                filterSectionsBySearch(_uiState.value.sections, query)
            }
        )
    }
    
    fun toggleSearch() {
        val currentState = _uiState.value
        _uiState.value = currentState.copy(
            isSearchActive = !currentState.isSearchActive,
            searchQuery = if (currentState.isSearchActive) "" else currentState.searchQuery,
            sections = if (currentState.isSearchActive) {
                createSections(currentState.books) // Restaurar secciones originales
            } else {
                currentState.sections
            }
        )
    }
    
    private fun createSections(books: List<Book>): List<BookSection> {
        if (books.isEmpty()) return emptyList()
        
        return listOf(
            BookSection(
                title = "Todos los libros",
                books = books // Mostrar todos los libros
            )
        )
    }
    
    private fun filterSectionsBySearch(sections: List<BookSection>, query: String): List<BookSection> {
        return sections.map { section ->
            section.copy(
                books = section.books.filter { book ->
                    book.title.contains(query, ignoreCase = true) ||
                    book.authors.any { author -> 
                        author.name.contains(query, ignoreCase = true) ||
                        author.lastName.contains(query, ignoreCase = true)
                    } ||
                    book.genres.any { genre -> 
                        genre.name.contains(query, ignoreCase = true) 
                    }
                }
            )
        }.filter { it.books.isNotEmpty() }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
    
    fun clearAuthRequired() {
        _uiState.value = _uiState.value.copy(requiresAuth = false)
    }
}