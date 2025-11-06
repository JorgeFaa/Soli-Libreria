package com.edwin_antonio.proyectosoliv1.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.model.Book
import com.edwin_antonio.proyectosoliv1.model.User
import com.edwin_antonio.proyectosoliv1.network.ApiService
import com.edwin_antonio.proyectosoliv1.network.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ProfileViewModel(private val apiService: ApiService) : ViewModel() {

    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user

    private val _favoriteBooks = MutableStateFlow<List<Book>>(emptyList())
    val favoriteBooks: StateFlow<List<Book>> = _favoriteBooks

    /**
     * Obtiene el perfil del usuario actual y sus libros favoritos.
     */
    fun fetchUserProfile() {
        viewModelScope.launch {
            try {
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
