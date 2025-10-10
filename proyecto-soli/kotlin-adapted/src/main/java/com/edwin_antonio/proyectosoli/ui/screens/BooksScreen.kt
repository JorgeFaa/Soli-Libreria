package com.edwin_antonio.proyectosoli.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Divider
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.edwin_antonio.proyectosoli.data.SampleData

@Composable
fun BooksScreen(onBookClick: (String) -> Unit, onBack: () -> Unit) {
    Column(Modifier.padding(16.dp)) {
        Text("Libros", style = MaterialTheme.typography.headlineSmall)
        Spacer(Modifier.height(12.dp))
        SampleData.books.forEach { book ->
            ListItem(
                headlineText = { Text(book.title) },
                supportingText = { Text(book.author) },
                modifier = Modifier.clickable { onBookClick(book.id) }
            )
            Divider()
        }
        Spacer(Modifier.height(12.dp))
        TextButton(onClick = onBack) { Text("Volver") }
    }
}
