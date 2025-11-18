package com.edwin_antonio.proyectosoliv1.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.model.*
import com.edwin_antonio.proyectosoliv1.ui.theme.*
import com.edwin_antonio.proyectosoliv1.viewmodel.AdminViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookManagementScreen(
    tokenManager: TokenManager,
    onNavigateBack: () -> Unit
) {
    val viewModel: AdminViewModel = viewModel(factory = AdminViewModel.Factory(tokenManager))
    val uiState by viewModel.uiState.collectAsState()

    // Form State
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var publishedDate by remember { mutableStateOf("") }
    var pdfUrl by remember { mutableStateOf("") }
    var epubUrl by remember { mutableStateOf("") }
    var coverUrl by remember { mutableStateOf("") }

    var selectedTextType by remember { mutableStateOf<TextType?>(null) }
    val selectedAuthors = remember { mutableStateListOf<Author>() }
    val selectedEditorials = remember { mutableStateListOf<Editorial>() }
    val selectedGenres = remember { mutableStateListOf<Genre>() }

    var selectedBook by remember { mutableStateOf<Book?>(null) }

    LaunchedEffect(Unit) {
        viewModel.loadAllBookFormData()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestionar Libros", color = CoffeeDark) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Volver", tint = CoffeeDark)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = YellowSolar)
            )
        }
    ) { padding ->
        Row(modifier = Modifier.fillMaxSize().padding(padding).background(SandSoft)) {
            // Form Column
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Título") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = description, onValueChange = { description = it }, label = { Text("Descripción") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = publishedDate, onValueChange = { publishedDate = it }, label = { Text("Fecha (YYYY-MM-DD)") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = pdfUrl, onValueChange = { pdfUrl = it }, label = { Text("URL PDF") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = epubUrl, onValueChange = { epubUrl = it }, label = { Text("URL EPUB") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = coverUrl, onValueChange = { coverUrl = it }, label = { Text("URL Portada") }, modifier = Modifier.fillMaxWidth())

                // TODO: Add dropdowns for selections

                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = {
                        val request = BookRequest(
                            title = title,
                            description = description,
                            publishedDate = publishedDate,
                            pdfUrl = pdfUrl.ifBlank { null },
                            epubUrl = epubUrl.ifBlank { null },
                            coverUrl = coverUrl.ifBlank { null },
                            typeId = selectedTextType?.id ?: 0,
                            authorIds = selectedAuthors.map { it.id },
                            editorialIds = selectedEditorials.map { it.id },
                            genreIds = selectedGenres.map { it.id }
                        )
                        selectedBook?.let {
                            viewModel.updateBook(it.id, request)
                        } ?: viewModel.createBook(request)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = OrangeSunset),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(if (selectedBook == null) "Crear Libro" else "Actualizar Libro")
                }
            }

            // List Column
            LazyColumn(modifier = Modifier.weight(1f).padding(top = 16.dp, end = 16.dp)) {
                if (uiState.isLoading) {
                    item { CircularProgressIndicator(modifier = Modifier.fillMaxWidth().wrapContentWidth(Alignment.CenterHorizontally)) }
                }
                items(uiState.books) { book ->
                    Row(modifier = Modifier.fillMaxWidth()) {
                        Text(book.title, modifier = Modifier.weight(1f).align(Alignment.CenterVertically))
                        IconButton(onClick = { viewModel.deleteBook(book.id) }) {
                            Icon(Icons.Default.Delete, "Eliminar", tint = TerracottaRed)
                        }
                    }
                    Divider(color = CoffeeDark.copy(alpha = 0.2f))
                }
            }
        }
    }
}
