package com.edwin_antonio.proyectosoliv1.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.viewmodel.HomeViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BooksScreen(
    onBookClick: (String) -> Unit, 
    onBack: () -> Unit,
    tokenManager: TokenManager,
    viewModel: HomeViewModel = viewModel { HomeViewModel(tokenManager) }
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text("Todos los Libros") },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Volver")
                }
            }
        )
        
        if (uiState.isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else if (uiState.errorMessage != null) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Error: ${uiState.errorMessage}")
                Spacer(modifier = Modifier.height(8.dp))
                Button(onClick = { viewModel.loadBooks() }) {
                    Text("Reintentar")
                }
            }
        } else {
            LazyColumn {
                items(uiState.books) { book ->
                    ListItem(
                        headlineContent = { Text(book.title) },
                        supportingContent = { 
                            val authorName = if (book.authors.isNotEmpty()) {
                                val author = book.authors.first()
                                listOfNotNull(author.name, author.middleName, author.lastName).joinToString(" ")
                            } else {
                                "Autor desconocido"
                            }
                            Text(authorName)
                        },
                        modifier = Modifier.clickable { onBookClick(book.id.toString()) }
                    )
                    HorizontalDivider()
                }
            }
        }
    }
}
