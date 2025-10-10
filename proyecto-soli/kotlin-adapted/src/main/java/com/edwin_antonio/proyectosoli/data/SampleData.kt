package com.edwin_antonio.proyectosoli.data

import com.edwin_antonio.proyectosoli.model.Book

object SampleData {
    val books = listOf(
        Book("1", "Clean Code", "Robert C. Martin", "A Handbook of Agile Software Craftsmanship."),
        Book("2", "Effective Java", "Joshua Bloch", "Best practices for the Java platform."),
        Book("3", "Kotlin in Action", "Dmitry Jemerov", "Idiomatic Kotlin for JVM and Android.")
    )

    fun bookById(id: String) = books.firstOrNull { it.id == id }
}
