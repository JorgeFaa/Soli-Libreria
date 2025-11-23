package com.edwin_antonio.proyectosoliv1.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.wrapContentWidth
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.edwin_antonio.proyectosoliv1.model.Book
import com.edwin_antonio.proyectosoliv1.ui.theme.CoffeeDark
import com.edwin_antonio.proyectosoliv1.ui.theme.SandSoft
import com.edwin_antonio.proyectosoliv1.ui.theme.TerracottaRed
import com.edwin_antonio.proyectosoliv1.ui.theme.YellowSolar
import com.edwin_antonio.proyectosoliv1.viewmodel.AdminViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookListScreen(
    viewModel: AdminViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToCreateBook: () -> Unit,
    onNavigateToEditBook: (Book) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestionar Libros", color = CoffeeDark) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver", tint = CoffeeDark)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = YellowSolar)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToCreateBook,
                containerColor = YellowSolar
            ) {
                Icon(Icons.Default.Add, contentDescription = "Crear Libro", tint = CoffeeDark)
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(SandSoft)
                .padding(16.dp)
        ) {
            if (uiState.isLoading) {
                item {
                    CircularProgressIndicator(
                        modifier = Modifier
                            .fillMaxWidth()
                            .wrapContentWidth(Alignment.CenterHorizontally)
                    )
                }
            }
            items(uiState.books) { book ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(book.title, modifier = Modifier.weight(1f))
                    IconButton(onClick = { onNavigateToEditBook(book) }) {
                        Icon(Icons.Default.Edit, "Editar", tint = CoffeeDark)
                    }
                    IconButton(onClick = { viewModel.deleteBook(book.id) }) {
                        Icon(Icons.Default.Delete, "Eliminar", tint = TerracottaRed)
                    }
                }
                HorizontalDivider(color = CoffeeDark.copy(alpha = 0.2f))
            }
        }
    }
}
