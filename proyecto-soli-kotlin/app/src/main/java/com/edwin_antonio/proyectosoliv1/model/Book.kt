package com.edwin_antonio.proyectosoliv1.model

data class Book(
    val id: Int,
    val title: String,
    val description: String,
    val publishedDate: String,
    val pdfUrl: String?,
    val epubUrl: String?,
    val coverUrl: String?,
    val authors: List<Author>,
    val editorials: List<Editorial>,
    val genres: List<Genre>,
    val type: TextType
)

data class Author(
    val id: Int,
    val name: String,
    val middleName: String?,
    val lastName: String,
    val countryName: String
)

data class Editorial(
    val id: Int,
    val companyName: String,
    val countryId: Int,
    val countryName: String
)

data class Genre(
    val id: Int,
    val name: String
)

data class TextType(
    val id: Int,
    val type: String
)

data class BookResponse(
    val content: List<Book>,
    val page: Int,
    val size: Int,
    val totalElements: Int,
    val totalPages: Int,
    val first: Boolean,
    val last: Boolean,
    val hasNext: Boolean,
    val hasPrevious: Boolean
)
