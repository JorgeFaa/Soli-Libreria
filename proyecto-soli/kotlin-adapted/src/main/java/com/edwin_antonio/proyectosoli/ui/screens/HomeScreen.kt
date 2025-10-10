package com.edwin_antonio.proyectosoli.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun HomeScreen(onOpenBooks: () -> Unit, onOpenFavorites: () -> Unit) {
    Column(Modifier.padding(16.dp)) {
        Text("Home", style = MaterialTheme.typography.headlineSmall)
        Spacer(Modifier.height(12.dp))
        Button(onClick = onOpenBooks, modifier = Modifier.fillMaxWidth()) { Text("Libros") }
        Button(onClick = onOpenFavorites, modifier = Modifier.fillMaxWidth()) { Text("Favoritos") }
    }
}
