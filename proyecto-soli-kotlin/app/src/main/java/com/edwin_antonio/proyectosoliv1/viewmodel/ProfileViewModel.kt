package com.edwin_antonio.proyectosoliv1.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.model.Book
import com.edwin_antonio.proyectosoliv1.model.Genre
import com.edwin_antonio.proyectosoliv1.model.Review
import com.edwin_antonio.proyectosoliv1.model.User
import com.edwin_antonio.proyectosoliv1.network.ApiService
import com.edwin_antonio.proyectosoliv1.network.RetrofitClient
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class ProfileViewModel(private val apiService: ApiService) : ViewModel() {

    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user

    private val _favoriteBooks = MutableStateFlow<List<Book>>(emptyList())
    val favoriteBooks: StateFlow<List<Book>> = _favoriteBooks

    private val _genres = MutableStateFlow<List<Genre>>(emptyList())
    private val _userReviews = MutableStateFlow<List<Pair<Review, Book?>>>(emptyList())
    val userReviews: StateFlow<List<Pair<Review, Book?>>> = _userReviews

    val preferredGenreNames: StateFlow<String> =
        _user.combine(_genres) { user, genres ->
            user?.prefferredGenreIds?.mapNotNull { id ->
                genres.find { it.id == id }?.name
            }?.joinToString(", ") ?: ""
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "")


    /**
     * Obtiene el perfil del usuario actual y sus libros favoritos.
     */
    fun fetchUserProfile() {
        viewModelScope.launch {
            try {
                fetchGenres()
                val response = apiService.getCurrentUserProfile()
                if (response.isSuccessful) {
                    val user = response.body()
                    _user.value = user

                    // Si el usuario tiene libros favoritos, cargarlos
                    user?.favoriteBooks?.let { ids ->
                        if (ids.isNotEmpty()) {
                            fetchFavoriteBooks(ids)
                        } else {
                            _favoriteBooks.value = emptyList()
                        }
                    }
                }
            } catch (e: Exception) {
                // Manejar error de conexión o parseo
                e.printStackTrace()
            }
        }
    }

    private fun fetchGenres() {
        viewModelScope.launch {
            try {
                val response = apiService.getAllGenres()
                if (response.isSuccessful) {
                    _genres.value = response.body() ?: emptyList()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    /**
     * Carga los detalles de los libros favoritos usando el endpoint bulk.
     */
    private fun fetchFavoriteBooks(ids: List<Int>) {
        viewModelScope.launch {
            try {
                val idsString = ids.joinToString(",")
                val response = apiService.getBooksByIds(idsString)
                if (response.isSuccessful) {
                    _favoriteBooks.value = response.body() ?: emptyList()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    /**
     * Obtiene las reseñas del usuario actual y los libros asociados.
     */
    fun fetchUserReviews() {
        viewModelScope.launch {
            try {
                val userId = _user.value?.id ?: return@launch
                val response = apiService.getReviewsByUser(userId)
                if (response.isSuccessful) {
                    val reviews = response.body()?.content ?: emptyList()
                    val bookIds = reviews.map { it.bookId }.distinct()
                    val booksResponse = apiService.getBooksByIds(bookIds.joinToString(","))
                    val books = if (booksResponse.isSuccessful) booksResponse.body() ?: emptyList() else emptyList()
                    val bookMap = books.associateBy { it.id }
                    _userReviews.value = reviews.map { it to bookMap[it.bookId] }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun removeFavoriteBook(bookId: Int) {
        viewModelScope.launch {
            try {
                val response = apiService.removeFavorite(bookId)
                if (response.isSuccessful) {
                    // Update UI
                    _favoriteBooks.value = _favoriteBooks.value.filter { it.id != bookId }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun deleteReview(reviewId: Int) {
        viewModelScope.launch {
            try {
                val response = apiService.deleteReview(reviewId)
                if (response.isSuccessful) {
                    fetchUserReviews()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun updateReview(reviewId: Int, rating: Int, comment: String) {
        viewModelScope.launch {
            try {
                val request = com.edwin_antonio.proyectosoliv1.model.ReviewRequest(rating, comment)
                val response = apiService.updateReview(reviewId, request)
                if (response.isSuccessful) {
                    fetchUserReviews()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    class Factory(private val tokenManager: TokenManager) : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(ProfileViewModel::class.java)) {
                val apiService = RetrofitClient.getInstance(tokenManager)
                @Suppress("UNCHECKED_CAST")
                return ProfileViewModel(apiService) as T
            }
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }
}
