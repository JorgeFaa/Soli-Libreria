package com.edwin_antonio.proyectosoli.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.edwin_antonio.proyectosoli.data.SampleData

@Composable
fun DetailsScreen(bookId: String, onBack: () -> Unit) {
    val book = SampleData.bookById(bookId)
    Column(Modifier.padding(16.dp)) {
        Text("Detalle", style = MaterialTheme.typography.headlineSmall)
        Spacer(Modifier.height(12.dp))
        if (book != null) {
            Text("Título: ${book.title}")
            Text("Autor: ${book.author}")
            Spacer(Modifier.height(8.dp))
            Text(book.description)
        } else {
            Text("Libro no encontrado")
        }
        Spacer(Modifier.height(12.dp))
        TextButton(onClick = onBack) { Text("Volver") }
    }
}
