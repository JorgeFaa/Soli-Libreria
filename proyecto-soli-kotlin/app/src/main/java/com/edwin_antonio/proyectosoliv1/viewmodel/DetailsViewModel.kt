package com.edwin_antonio.proyectosoliv1.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.model.Book
import com.edwin_antonio.proyectosoliv1.model.Review
import com.edwin_antonio.proyectosoliv1.model.ReviewRequest
import com.edwin_antonio.proyectosoliv1.model.ReviewResponse
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
    val requiresAuth: Boolean = false,
    // === reviews ===
    val reviews: List<Review> = emptyList(),
    val reviewsPage: Int = 0,
    val reviewsSize: Int = 10,
    val reviewsTotalPages: Int = 0,
    val isLoadingReviews: Boolean = false,
    val isPostingReview: Boolean = false,
    val reviewFormRating: Int = 5,
    val reviewFormComment: String = "",
    val isEditingReviewId: Int? = null,
    val currentUserId: Int? = null // { changed code } mantener id actual en el estado
)

class DetailsViewModel(
    private val tokenManager: TokenManager
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(DetailsUiState())
    val uiState: StateFlow<DetailsUiState> = _uiState.asStateFlow()
    
    fun loadBook(bookId: String) {
        _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
        
        viewModelScope.launch {
            try {
                val apiService = RetrofitClient.getInstance(tokenManager) // obtener aquí
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

    // Helper para asegurar currentUserId en estado: usa TokenManager o consulta la API si falta
    private suspend fun ensureCurrentUserId(apiService: ApiService) {
        val existing = tokenManager.getUserId()?.toIntOrNull()
        if (existing != null) {
            if (_uiState.value.currentUserId != existing) {
                _uiState.value = _uiState.value.copy(currentUserId = existing)
            }
            return
        }

        try {
            val resp = apiService.getCurrentUser()
            if (resp.isSuccessful) {
                val user = resp.body()
                user?.let {
                    val idStr = it.id.toString()
                    val email = tokenManager.getUserEmail() ?: ""
                    val name = listOfNotNull(it.firstName, it.lastName).joinToString(" ").ifBlank { null }
                    val role = tokenManager.getUserRole() ?: "READER"
                    tokenManager.saveUserInfo(idStr, email, name, role)
                    _uiState.value = _uiState.value.copy(currentUserId = it.id)
                }
            }
        } catch (_: Exception) {
            // no bloquear; si no se obtiene, currentUserId queda null
        }
    }

    // === REVIEWS ===
    fun loadReviews(bookId: String, page: Int = 0, size: Int = 10) {
        val bookIdInt = bookId.toIntOrNull() ?: return
        _uiState.value = _uiState.value.copy(isLoadingReviews = true, errorMessage = null)
        viewModelScope.launch {
            try {
                val apiService = RetrofitClient.getInstance(tokenManager) // obtener aquí
                // asegurar currentUserId antes de evaluar ownership en UI
                ensureCurrentUserId(apiService)

                val response = apiService.getReviews(bookIdInt, page, size)

                if (response.isSuccessful) {
                    val body = response.body()
                    val reviews = body?.content ?: emptyList()
                    _uiState.value = _uiState.value.copy(
                        isLoadingReviews = false,
                        reviews = reviews,
                        reviewsPage = body?.page ?: page,
                        reviewsSize = body?.size ?: size,
                        reviewsTotalPages = body?.totalPages ?: 0
                    )
                } else {
                    val wwwAuth = response.headers()["www-authenticate"] ?: ""
                    val msg = if (response.code() == 403) {
                        if (wwwAuth.contains("insufficient_scope", ignoreCase = true)) {
                            "No tienes permisos suficientes (insufficient_scope). Revisa el token o inicia sesión con una cuenta con permisos."
                        } else {
                            "No tienes permisos para ver reseñas (403). $wwwAuth"
                        }
                    } else {
                        "Error al cargar reseñas: ${response.code()}"
                    }
                    _uiState.value = _uiState.value.copy(
                        isLoadingReviews = false,
                        errorMessage = msg
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoadingReviews = false,
                    errorMessage = "Error de conexión: ${e.message}"
                )
            }
        }
    }

    fun postReview(bookId: String, rating: Int, comment: String) {
        val bookIdInt = bookId.toIntOrNull() ?: return
        _uiState.value = _uiState.value.copy(isPostingReview = true, errorMessage = null)
        viewModelScope.launch {
            try {
                val apiService = RetrofitClient.getInstance(tokenManager) // obtener aquí
                val request = ReviewRequest(rating = rating, comment = comment)
                val response = apiService.addReview(bookIdInt, request)

                if (response.isSuccessful) {
                    val newReview = response.body()
                    val updated = listOfNotNull(newReview) + _uiState.value.reviews
                    _uiState.value = _uiState.value.copy(
                        isPostingReview = false,
                        reviews = updated,
                        reviewFormComment = "",
                        reviewFormRating = 5,
                        isEditingReviewId = null
                    )
                    // asegurar currentUserId por si faltaba
                    ensureCurrentUserId(apiService)
                } else {
                    // Manejo específico de 400: usuario ya reseñó
                    val errorBody = response.errorBody()?.string() ?: ""
                    if (response.code() == 400 && errorBody.contains("reseñ", ignoreCase = true)) {
                        // Recargar reseñas directamente y poner el formulario en modo edición si encontramos la reseña del usuario
                        val reviewsResp = apiService.getReviews(bookIdInt, 0, _uiState.value.reviewsSize)
                        if (reviewsResp.isSuccessful) {
                            val body = reviewsResp.body()
                            val reviewsList = body?.content ?: emptyList()
                            // Buscar reseña del usuario actual (asegurar currentUserId antes)
                            ensureCurrentUserId(apiService)
                            val currentUserId = _uiState.value.currentUserId
                            val ownReview = reviewsList.find { it.userId == currentUserId }
                            if (ownReview != null) {
                                _uiState.value = _uiState.value.copy(
                                    isPostingReview = false,
                                    reviews = reviewsList,
                                    isEditingReviewId = ownReview.id,
                                    reviewFormRating = ownReview.rating,
                                    reviewFormComment = ownReview.comment,
                                    errorMessage = "Ya reseñaste este libro. Se cargó tu reseña para editarla."
                                )
                            } else {
                                // no encontramos la reseña del usuario, solo mostrar el mensaje del servidor
                                _uiState.value = _uiState.value.copy(
                                    isPostingReview = false,
                                    errorMessage = parseServerErrorMessage(errorBody, response.code())
                                )
                            }
                        } else {
                            _uiState.value = _uiState.value.copy(
                                isPostingReview = false,
                                errorMessage = "Ya reseñaste este libro. No se pudo recargar la reseña del servidor."
                            )
                        }
                    } else {
                        val msg = when (response.code()) {
                            401 -> "Debes iniciar sesión para publicar una reseña."
                            403 -> "No tienes permisos para publicar reseñas (insufficient_scope)."
                            else -> parseServerErrorMessage(errorBody, response.code())
                        }
                        _uiState.value = _uiState.value.copy(
                            isPostingReview = false,
                            errorMessage = msg
                        )
                    }
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isPostingReview = false,
                    errorMessage = "Error de conexión: ${e.message}"
                )
            }
        }
    }

    fun deleteReview(reviewId: Int) {
        _uiState.value = _uiState.value.copy(isLoadingReviews = true, errorMessage = null)
        viewModelScope.launch {
            try {
                val apiService = RetrofitClient.getInstance(tokenManager) // obtener aquí
                val response = apiService.deleteReview(reviewId)

                if (response.isSuccessful) {
                    // recargar reseñas desde servidor si conocemos el bookId
                    val bookId = _uiState.value.book?.id
                    if (bookId != null) {
                        // reload page 0
                        loadReviews(bookId.toString(), 0, _uiState.value.reviewsSize)
                        // asegurar currentUserId por si hace falta
                        ensureCurrentUserId(apiService)
                    } else {
                        val remaining = _uiState.value.reviews.filterNot { it.id == reviewId }
                        _uiState.value = _uiState.value.copy(isLoadingReviews = false, reviews = remaining)
                    }
                } else {
                    val wwwAuth = response.headers()["www-authenticate"] ?: ""
                    val msg = when (response.code()) {
                        401 -> "Debes iniciar sesión para eliminar una reseña."
                        403 -> if (wwwAuth.contains("insufficient_scope", ignoreCase = true)) {
                            "No tienes permiso para eliminar esta reseña (insufficient_scope)."
                        } else {
                            "No tienes permiso para eliminar esta reseña (403). $wwwAuth"
                        }
                        else -> "Error al eliminar reseña: ${response.code()}"
                    }
                    _uiState.value = _uiState.value.copy(isLoadingReviews = false, errorMessage = msg)
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoadingReviews = false, errorMessage = "Error de conexión: ${e.message}")
            }
        }
    }

    fun updateReview(reviewId: Int, rating: Int, comment: String) {
        _uiState.value = _uiState.value.copy(isPostingReview = true, errorMessage = null)
        viewModelScope.launch {
            try {
                val apiService = RetrofitClient.getInstance(tokenManager) // obtener aquí
                val request = ReviewRequest(rating = rating, comment = comment)
                val response = apiService.updateReview(reviewId, request)

                if (response.isSuccessful) {
                    // recargar reseñas desde servidor para asegurar sincronización
                    val bookId = _uiState.value.book?.id
                    if (bookId != null) {
                        loadReviews(bookId.toString(), 0, _uiState.value.reviewsSize)
                    }
                    _uiState.value = _uiState.value.copy(
                        isPostingReview = false,
                        reviewFormComment = "",
                        reviewFormRating = 5,
                        isEditingReviewId = null
                    )
                    // asegurar currentUserId
                    ensureCurrentUserId(apiService)
                } else {
                    val wwwAuth = response.headers()["www-authenticate"] ?: ""
                    val msg = when (response.code()) {
                        401 -> "Debes iniciar sesión para actualizar una reseña."
                        403 -> if (wwwAuth.contains("insufficient_scope", ignoreCase = true)) {
                            "No tienes permiso para actualizar esta reseña (insufficient_scope)."
                        } else {
                            "No tienes permiso para actualizar esta reseña (403). $wwwAuth"
                        }
                        else -> "Error al actualizar reseña: ${response.code()}"
                    }
                    _uiState.value = _uiState.value.copy(isPostingReview = false, errorMessage = msg)
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isPostingReview = false, errorMessage = "Error de conexión: ${e.message}")
            }
        }
    }

    // Helpers para UI form
    fun updateReviewFormRating(rating: Int) {
        _uiState.value = _uiState.value.copy(reviewFormRating = rating)
    }

    fun updateReviewFormComment(comment: String) {
        _uiState.value = _uiState.value.copy(reviewFormComment = comment)
    }

    fun startEditingReview(review: Review) {
        _uiState.value = _uiState.value.copy(
            isEditingReviewId = review.id,
            reviewFormRating = review.rating,
            reviewFormComment = review.comment
        )
    }

    // Cancelar edición y restablecer formulario
    fun cancelEditing() {
        _uiState.value = _uiState.value.copy(
            isEditingReviewId = null,
            reviewFormRating = 5,
            reviewFormComment = ""
        )
    }

    // Helper: intenta extraer mensaje legible del body si viene en JSON {"error":"..."} o {"message":"..."}
    private fun parseServerErrorMessage(body: String, code: Int): String {
        if (body.isBlank()) return "Error del servidor: $code"
        return try {
            // intentamos extraer "error"
            val regexError = """"error"\s*:\s*"([^"]+)"""".toRegex(RegexOption.IGNORE_CASE)
            regexError.find(body)?.groups?.get(1)?.value?.let { return it }

            // intentamos extraer "message"
            val regexMsg = """"message"\s*:\s*"([^"]+)"""".toRegex(RegexOption.IGNORE_CASE)
            regexMsg.find(body)?.groups?.get(1)?.value?.let { return it }

            // si no es JSON, devolvemos el body crudo (limpio)
            body.trim().trim('"')
        } catch (e: Exception) {
            "Error del servidor: $code"
        }
    }

    fun addToFavorites() {
        val book = _uiState.value.book ?: return

        _uiState.value = _uiState.value.copy(isAddingToFavorites = true)

        viewModelScope.launch {
            try {
                val apiService = RetrofitClient.getInstance(tokenManager) // obtener aquí
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