package com.edwin_antonio.proyectosoliv1.ui.screens

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

@Composable
fun FavoriteScreen(onBack: () -> Unit) {
    Column(Modifier.padding(16.dp)) {
        Text("Favoritos", style = MaterialTheme.typography.headlineSmall)
        Spacer(Modifier.height(12.dp))
        Text("Aquí verás tus libros favoritos.")
        Spacer(Modifier.height(12.dp))
        TextButton(onClick = onBack) { Text("Volver") }
    }
}