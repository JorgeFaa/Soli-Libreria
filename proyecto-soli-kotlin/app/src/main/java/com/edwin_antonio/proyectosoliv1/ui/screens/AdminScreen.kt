package com.edwin_antonio.proyectosoliv1.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.edwin_antonio.proyectosoliv1.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminScreen(
    onNavigateToTextTypes: () -> Unit,
    onNavigateToGenres: () -> Unit,
    onNavigateToCountries: () -> Unit,
    onNavigateToAuthors: () -> Unit,
    onNavigateToEditorials: () -> Unit,
    onNavigateToUsers: () -> Unit,
    onNavigateToBooks: () -> Unit,
    onNavigateBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Panel de Administrador", color = CoffeeDark) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Volver", tint = CoffeeDark)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = YellowSolar
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(SandSoft)
                .padding(padding)
                .padding(16.dp),
            contentPadding = PaddingValues(vertical = 8.dp)
        ) {
            item { ManagementButton(label = "Gestionar Tipos de Texto", onClick = onNavigateToTextTypes) }
            item { ManagementButton(label = "Gestionar Géneros", onClick = onNavigateToGenres) }
            item { ManagementButton(label = "Gestionar Países", onClick = onNavigateToCountries) }
            item { ManagementButton(label = "Gestionar Autores", onClick = onNavigateToAuthors) }
            item { ManagementButton(label = "Gestionar Editoriales", onClick = onNavigateToEditorials) }
            item { ManagementButton(label = "Gestionar Usuarios", onClick = onNavigateToUsers) }
            item { ManagementButton(label = "Gestionar Libros", onClick = onNavigateToBooks) }
        }
    }
}

@Composable
private fun ManagementButton(label: String, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium,
        colors = ButtonDefaults.buttonColors(containerColor = Color.White),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp, pressedElevation = 4.dp)
    ) {
        Text(label, color = CoffeeDark, modifier = Modifier.padding(8.dp))
        Spacer(modifier = Modifier.weight(1f))
        Icon(Icons.Default.ArrowForward, contentDescription = null, tint = OrangeSunset)
    }
    Spacer(modifier = Modifier.height(12.dp))
}
