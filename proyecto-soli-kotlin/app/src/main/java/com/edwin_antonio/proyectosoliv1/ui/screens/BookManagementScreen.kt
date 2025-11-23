package com.edwin_antonio.proyectosoliv1.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.edwin_antonio.proyectosoliv1.model.*
import com.edwin_antonio.proyectosoliv1.ui.theme.*
import com.edwin_antonio.proyectosoliv1.viewmodel.AdminViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookManagementScreen(
    viewModel: AdminViewModel,
    book: Book?,
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    var title by remember { mutableStateOf(book?.title ?: "") }
    var description by remember { mutableStateOf(book?.description ?: "") }
    var publishedDate by remember { mutableStateOf(book?.publishedDate ?: "") }
    var pdfUrl by remember { mutableStateOf(book?.pdfUrl ?: "") }
    var epubUrl by remember { mutableStateOf(book?.epubUrl ?: "") }
    var coverUrl by remember { mutableStateOf(book?.coverUrl ?: "") }

    var selectedTextType by remember { mutableStateOf(book?.type) }
    val selectedAuthors = remember { mutableStateListOf<Author>().also { it.addAll(book?.authors ?: emptyList()) } }
    val selectedEditorials = remember { mutableStateListOf<Editorial>().also { it.addAll(book?.editorials ?: emptyList()) } }
    val selectedGenres = remember { mutableStateListOf<Genre>().also { it.addAll(book?.genres ?: emptyList()) } }

    LaunchedEffect(Unit) {
        viewModel.loadAllBookFormData()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (book == null) "Crear Libro" else "Editar Libro", color = CoffeeDark) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver", tint = CoffeeDark)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = YellowSolar)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(SandSoft)
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Título") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = description, onValueChange = { description = it }, label = { Text("Descripción") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = publishedDate, onValueChange = { publishedDate = it }, label = { Text("Fecha (YYYY-MM-DD)") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = pdfUrl, onValueChange = { pdfUrl = it }, label = { Text("URL PDF") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = epubUrl, onValueChange = { epubUrl = it }, label = { Text("URL EPUB") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = coverUrl, onValueChange = { coverUrl = it }, label = { Text("URL Portada") }, modifier = Modifier.fillMaxWidth())

            MultiSelectMenu(label = "Autores", items = uiState.authors, selectedItems = selectedAuthors) { author ->
                if (selectedAuthors.contains(author)) selectedAuthors.remove(author) else selectedAuthors.add(author)
            }
            MultiSelectMenu(label = "Editoriales", items = uiState.editorials, selectedItems = selectedEditorials) { editorial ->
                if (selectedEditorials.contains(editorial)) selectedEditorials.remove(editorial) else selectedEditorials.add(editorial)
            }
            MultiSelectMenu(label = "Géneros", items = uiState.genres, selectedItems = selectedGenres) { genre ->
                if (selectedGenres.contains(genre)) selectedGenres.remove(genre) else selectedGenres.add(genre)
            }
            SingleSelectMenu(label = "Tipo de Texto", items = uiState.textTypes, selectedItem = selectedTextType) { textType ->
                selectedTextType = textType
            }

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
                    book?.let {
                        viewModel.updateBook(it.id, request)
                    } ?: viewModel.createBook(request)
                    onNavigateBack()
                },
                colors = ButtonDefaults.buttonColors(containerColor = OrangeSunset),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (book == null) "Crear Libro" else "Actualizar Libro")
            }
        }
    }
}

@Composable
fun <T> MultiSelectMenu(
    label: String,
    items: List<T>,
    selectedItems: List<T>,
    onItemSelected: (T) -> Unit
) where T : Nameable {
    var expanded by remember { mutableStateOf(false) }

    Box {
        OutlinedTextField(
            value = selectedItems.joinToString { it.name },
            onValueChange = {},
            label = { Text(label) },
            readOnly = true,
            modifier = Modifier
                .fillMaxWidth()
                .clickable { expanded = true }
        )

        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false },
            modifier = Modifier.fillMaxWidth()
        ) {
            items.forEach { item ->
                DropdownMenuItem(text = { Text(item.name) }, onClick = { onItemSelected(item) })
            }
        }
    }
}

@Composable
fun <T> SingleSelectMenu(
    label: String,
    items: List<T>,
    selectedItem: T?,
    onItemSelected: (T) -> Unit
) where T : Nameable {
    var expanded by remember { mutableStateOf(false) }

    Box {
        OutlinedTextField(
            value = selectedItem?.name ?: "",
            onValueChange = {},
            label = { Text(label) },
            readOnly = true,
            modifier = Modifier
                .fillMaxWidth()
                .clickable { expanded = true }
        )

        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false },
            modifier = Modifier.fillMaxWidth()
        ) {
            items.forEach { item ->
                DropdownMenuItem(text = { Text(item.name) },
                    onClick = {
                        onItemSelected(item)
                        expanded = false
                    })
            }
        }
    }
}
