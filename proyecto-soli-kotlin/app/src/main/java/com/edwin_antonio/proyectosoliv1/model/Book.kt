package com.edwin_antonio.proyectosoliv1.model

interface Nameable {
    val name: String
}

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
    override val name: String,
    val middleName: String?,
    val lastName: String,
    val countryName: String,
    val books: List<SimpleBook>? = null
): Nameable

data class Editorial(
    val id: Int,
    val companyName: String,
    val countryId: Int,
    val countryName: String
): Nameable {
    override val name: String
        get() = companyName
}

// Modelo para la lista de libros simplificada que viene en la respuesta de un género
data class SimpleBook(
    val id: Int,
    val title: String
)

data class Genre(
    val id: Int,
    override val name: String,
    val books: List<SimpleBook>? = null // La API devuelve una lista de libros
): Nameable

data class TextType(
    val id: Int,
    val type: String
): Nameable {
    override val name: String
        get() = type
}

data class TextTypeRequest(
    val type: String
)

// Modelo para las peticiones de creación y actualización de géneros
data class GenreRequest(
    val genrename: String
)

// Modelo para las peticiones de creación y actualización de editoriales
data class EditorialRequest(
    val companyName: String,
    val countryId: Int
)

// Modelo para las peticiones de creación y actualización de países
data class Country(
    val id: Int,
    val name: String
)

data class CountryRequest(
    val countryname: String
)

// Modelo para las peticiones de creación y actualización de autores
data class AuthorRequest(
    val name: String,
    val middleName: String?,
    val lastName: String,
    val countryId: Int
)

// Modelo para las peticiones de creación y actualización de libros
data class BookRequest(
    val title: String,
    val description: String,
    val publishedDate: String,
    val pdfUrl: String?,
    val epubUrl: String?,
    val coverUrl: String?,
    val typeId: Int,
    val authorIds: List<Int>,
    val editorialIds: List<Int>,
    val genreIds: List<Int>
)

// Modelo para la respuesta de usuarios en el panel de administrador
data class AdminUser(
    val id: Int,
    val firstName: String?,
    val lastName: String?,
    val prefferredGenreIds: List<Int>,
    val favoriteBooks: List<Int>
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
