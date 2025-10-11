package com.edwin_antonio.proyectosoliv1.network

// 📖 Sección de libros para HomeScreen
data class BookSection(
    val title: String, // "Tus libros", "Favoritos", "Recomendados"
    val books: List<com.edwin_antonio.proyectosoliv1.model.Book>
)
