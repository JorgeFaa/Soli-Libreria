package com.edwin_antonio.proyectosoliv1.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.model.*
import com.edwin_antonio.proyectosoliv1.repository.AdminRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AdminUiState(
    val isLoading: Boolean = false,
    val textTypes: List<TextType> = emptyList(),
    val genres: List<Genre> = emptyList(),
    val countries: List<Country> = emptyList(),
    val authors: List<Author> = emptyList(),
    val editorials: List<Editorial> = emptyList(),
    val users: List<AdminUser> = emptyList(),
    val books: List<Book> = emptyList(),
    val errorMessage: String? = null
)

class AdminViewModel(private val adminRepository: AdminRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminUiState())
    val uiState: StateFlow<AdminUiState> = _uiState.asStateFlow()

    // ==== GLOBAL ==== //
    fun loadAllBookFormData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            // Load all data in parallel
            val textTypesResult = adminRepository.getAllTextTypes()
            val genresResult = adminRepository.getAllGenres()
            val authorsResult = adminRepository.getAllAuthors()
            val editorialsResult = adminRepository.getAllEditorials()
            val booksResult = adminRepository.getAllBooks() // Assuming you add this to the repo

            _uiState.update { state ->
                state.copy(
                    isLoading = false,
                    textTypes = textTypesResult.getOrNull() ?: state.textTypes,
                    genres = genresResult.getOrNull() ?: state.genres,
                    authors = authorsResult.getOrNull() ?: state.authors,
                    editorials = editorialsResult.getOrNull() ?: state.editorials,
                    books = booksResult.getOrNull()?.content ?: state.books,
                    errorMessage = textTypesResult.exceptionOrNull()?.message
                )
            }
        }
    }

    // ==== TEXT TYPES ==== //
    fun loadTextTypes() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            adminRepository.getAllTextTypes().onSuccess { data ->
                _uiState.update { it.copy(isLoading = false, textTypes = data) }
            }.onFailure { e -> _uiState.update { it.copy(isLoading = false, errorMessage = e.message) } }
        }
    }

    fun createTextType(type: String) {
        viewModelScope.launch {
            adminRepository.createTextType(type).onSuccess { loadTextTypes() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    fun updateTextType(id: Int, type: String) {
        viewModelScope.launch {
            adminRepository.updateTextType(id, type).onSuccess { loadTextTypes() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    fun deleteTextType(id: Int) {
        viewModelScope.launch {
            adminRepository.deleteTextType(id).onSuccess { loadTextTypes() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    // ==== GENRES ==== //
    fun loadGenres() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            adminRepository.getAllGenres().onSuccess { data ->
                _uiState.update { it.copy(isLoading = false, genres = data) }
            }.onFailure { e -> _uiState.update { it.copy(isLoading = false, errorMessage = e.message) } }
        }
    }

    fun createGenre(name: String) {
        viewModelScope.launch {
            adminRepository.createGenre(name).onSuccess { loadGenres() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    fun updateGenre(id: Int, name: String) {
        viewModelScope.launch {
            adminRepository.updateGenre(id, name).onSuccess { loadGenres() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    fun deleteGenre(id: Int) {
        viewModelScope.launch {
            adminRepository.deleteGenre(id).onSuccess { loadGenres() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    // ==== COUNTRIES ==== //
    fun loadCountries() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            adminRepository.getAllCountries().onSuccess { data ->
                _uiState.update { it.copy(isLoading = false, countries = data) }
            }.onFailure { e -> _uiState.update { it.copy(isLoading = false, errorMessage = e.message) } }
        }
    }

    fun createCountry(name: String) {
        viewModelScope.launch {
            adminRepository.createCountry(name).onSuccess { loadCountries() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    fun updateCountry(id: Int, name: String) {
        viewModelScope.launch {
            adminRepository.updateCountry(id, name).onSuccess { loadCountries() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    fun deleteCountry(id: Int) {
        viewModelScope.launch {
            adminRepository.deleteCountry(id).onSuccess { loadCountries() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    // ==== AUTHORS ==== //
    fun loadAuthors() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            adminRepository.getAllAuthors().onSuccess { data ->
                _uiState.update { it.copy(isLoading = false, authors = data) }
            }.onFailure { e -> _uiState.update { it.copy(isLoading = false, errorMessage = e.message) } }
        }
    }

    fun createAuthor(request: AuthorRequest) {
        viewModelScope.launch {
            adminRepository.createAuthor(request).onSuccess { loadAuthors() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    fun updateAuthor(id: Int, request: AuthorRequest) {
        viewModelScope.launch {
            adminRepository.updateAuthor(id, request).onSuccess { loadAuthors() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    fun deleteAuthor(id: Int) {
        viewModelScope.launch {
            adminRepository.deleteAuthor(id).onSuccess { loadAuthors() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }
    
    // ==== EDITORIALS ==== //
    fun loadEditorials() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            adminRepository.getAllEditorials().onSuccess { data ->
                _uiState.update { it.copy(isLoading = false, editorials = data) }
            }.onFailure { e -> _uiState.update { it.copy(isLoading = false, errorMessage = e.message) } }
        }
    }

    fun createEditorial(companyName: String, countryId: Int) {
        viewModelScope.launch {
            adminRepository.createEditorial(companyName, countryId).onSuccess { loadEditorials() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    fun updateEditorial(id: Int, companyName: String, countryId: Int) {
        viewModelScope.launch {
            adminRepository.updateEditorial(id, companyName, countryId).onSuccess { loadEditorials() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    fun deleteEditorial(id: Int) {
        viewModelScope.launch {
            adminRepository.deleteEditorial(id).onSuccess { loadEditorials() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    // ==== USERS ==== //
    fun loadUsers() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            adminRepository.getAllUsers().onSuccess { data ->
                _uiState.update { it.copy(isLoading = false, users = data) }
            }.onFailure { e -> _uiState.update { it.copy(isLoading = false, errorMessage = e.message) } }
        }
    }

    fun deleteUser(id: Int) {
        viewModelScope.launch {
            adminRepository.deleteUser(id).onSuccess { loadUsers() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    // ==== BOOKS ==== //
    fun loadBooks() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            adminRepository.getAllBooks().onSuccess { data ->
                _uiState.update { it.copy(isLoading = false, books = data.content) }
            }.onFailure { e -> _uiState.update { it.copy(isLoading = false, errorMessage = e.message) } }
        }
    }

    fun createBook(request: BookRequest) {
        viewModelScope.launch {
            adminRepository.createBook(request).onSuccess { loadBooks() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    fun updateBook(id: Int, request: BookRequest) {
        viewModelScope.launch {
            adminRepository.updateBook(id, request).onSuccess { loadBooks() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    fun deleteBook(id: Int) {
        viewModelScope.launch {
            adminRepository.deleteBook(id).onSuccess { loadBooks() }.onFailure { e -> _uiState.update { it.copy(errorMessage = e.message) } }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }
    
    class Factory(private val tokenManager: TokenManager) : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(AdminViewModel::class.java)) {
                @Suppress("UNCHECKED_CAST")
                return AdminViewModel(AdminRepository(tokenManager)) as T
            }
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }
}
