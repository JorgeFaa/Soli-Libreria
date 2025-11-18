package com.edwin_antonio.proyectosoliv1.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.model.Author
import com.edwin_antonio.proyectosoliv1.model.AuthorRequest
import com.edwin_antonio.proyectosoliv1.model.Country
import com.edwin_antonio.proyectosoliv1.ui.theme.*
import com.edwin_antonio.proyectosoliv1.viewmodel.AdminViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthorManagementScreen(
    tokenManager: TokenManager,
    onNavigateBack: () -> Unit
) {
    val viewModel: AdminViewModel = viewModel(factory = AdminViewModel.Factory(tokenManager))
    val uiState by viewModel.uiState.collectAsState()

    var name by remember { mutableStateOf("") }
    var middleName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var selectedCountry by remember { mutableStateOf<Country?>(null) }
    var selectedAuthor by remember { mutableStateOf<Author?>(null) }
    var isDropdownExpanded by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        viewModel.loadAuthors()
        viewModel.loadCountries()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestionar Autores", color = CoffeeDark) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Volver", tint = CoffeeDark)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = YellowSolar)
            )
        },
        modifier = Modifier.background(SandSoft)
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .background(SandSoft)
        ) {
            OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Nombre") }, modifier = Modifier.fillMaxWidth())
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(value = middleName, onValueChange = { middleName = it }, label = { Text("Segundo Nombre (opcional)") }, modifier = Modifier.fillMaxWidth())
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(value = lastName, onValueChange = { lastName = it }, label = { Text("Apellido") }, modifier = Modifier.fillMaxWidth())
            Spacer(modifier = Modifier.height(8.dp))

            ExposedDropdownMenuBox(expanded = isDropdownExpanded, onExpandedChange = { isDropdownExpanded = !isDropdownExpanded }) {
                OutlinedTextField(
                    value = selectedCountry?.name ?: "",
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("País") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isDropdownExpanded) },
                    modifier = Modifier.menuAnchor().fillMaxWidth()
                )
                ExposedDropdownMenu(expanded = isDropdownExpanded, onDismissRequest = { isDropdownExpanded = false }) {
                    uiState.countries.forEach { country ->
                        DropdownMenuItem(
                            text = { Text(country.name) },
                            onClick = {
                                selectedCountry = country
                                isDropdownExpanded = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = {
                    if (name.isNotBlank() && lastName.isNotBlank() && selectedCountry != null) {
                        val request = AuthorRequest(name = name, middleName = middleName.ifBlank { null }, lastName = lastName, countryId = selectedCountry!!.id)
                        selectedAuthor?.let {
                            viewModel.updateAuthor(it.id, request)
                        } ?: viewModel.createAuthor(request)
                        // Reset fields
                        name = ""
                        middleName = ""
                        lastName = ""
                        selectedCountry = null
                        selectedAuthor = null
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = OrangeSunset),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (selectedAuthor == null) "Crear Autor" else "Actualizar Autor")
            }
            
            Spacer(modifier = Modifier.height(16.dp))

            if (uiState.isLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
            }

            LazyColumn(modifier = Modifier.fillMaxSize()) {
                items(uiState.authors) { author ->
                    AuthorRow(
                        author = author,
                        onDelete = { viewModel.deleteAuthor(author.id) },
                        onEdit = {
                            selectedAuthor = author
                            name = author.name
                            middleName = author.middleName ?: ""
                            lastName = author.lastName
                            selectedCountry = uiState.countries.find { it.name == author.countryName }
                        }
                    )
                    Divider(color = CoffeeDark.copy(alpha = 0.2f))
                }
            }
        }
    }
}

@Composable
private fun AuthorRow(author: Author, onDelete: () -> Unit, onEdit: () -> Unit) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(text = "${author.name} ${author.lastName}", modifier = Modifier.weight(1f))
        Text(text = author.countryName, color = CoffeeDark, style = MaterialTheme.typography.bodySmall)
        IconButton(onClick = onEdit) {
            Icon(Icons.Default.Edit, contentDescription = "Editar", tint = OrangeSunset)
        }
        IconButton(onClick = onDelete) {
            Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = TerracottaRed)
        }
    }
}
