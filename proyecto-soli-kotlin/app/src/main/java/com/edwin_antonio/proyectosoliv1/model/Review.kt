package com.edwin_antonio.proyectosoliv1.model

data class ReviewRequest(
    val rating: Int,
    val comment: String
)

data class Review(
    val id: Int,
    val rating: Int,
    val comment: String,
    val createdAt: String,
    val updatedAt: String,
    val userId: Int,
    val userFirstName: String,
    val bookId: Int
)

data class ReviewResponse(
    val content: List<Review>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
    val first: Boolean,
    val last: Boolean,
    val hasNext: Boolean,
    val hasPrevious: Boolean
)
