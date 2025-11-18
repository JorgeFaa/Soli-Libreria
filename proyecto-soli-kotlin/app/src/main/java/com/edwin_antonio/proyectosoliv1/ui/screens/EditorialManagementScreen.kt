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
import com.edwin_antonio.proyectosoliv1.model.Country
import com.edwin_antonio.proyectosoliv1.model.Editorial
import com.edwin_antonio.proyectosoliv1.ui.theme.*
import com.edwin_antonio.proyectosoliv1.viewmodel.AdminViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditorialManagementScreen(
    tokenManager: TokenManager,
    onNavigateBack: () -> Unit
) {
    val viewModel: AdminViewModel = viewModel(factory = AdminViewModel.Factory(tokenManager))
    val uiState by viewModel.uiState.collectAsState()

    var companyName by remember { mutableStateOf("") }
    var selectedCountry by remember { mutableStateOf<Country?>(null) }
    var selectedEditorial by remember { mutableStateOf<Editorial?>(null) }
    var isDropdownExpanded by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        viewModel.loadEditorials()
        viewModel.loadCountries()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestionar Editoriales", color = CoffeeDark) },
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
            OutlinedTextField(value = companyName, onValueChange = { companyName = it }, label = { Text("Nombre de la Editorial") }, modifier = Modifier.fillMaxWidth())
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
                    if (companyName.isNotBlank() && selectedCountry != null) {
                        selectedEditorial?.let {
                            viewModel.updateEditorial(it.id, companyName, selectedCountry!!.id)
                        } ?: viewModel.createEditorial(companyName, selectedCountry!!.id)
                        // Reset fields
                        companyName = ""
                        selectedCountry = null
                        selectedEditorial = null
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = OrangeSunset),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (selectedEditorial == null) "Crear Editorial" else "Actualizar Editorial")
            }
            
            Spacer(modifier = Modifier.height(16.dp))

            if (uiState.isLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
            }

            LazyColumn(modifier = Modifier.fillMaxSize()) {
                items(uiState.editorials) { editorial ->
                    EditorialRow(
                        editorial = editorial,
                        onDelete = { viewModel.deleteEditorial(editorial.id) },
                        onEdit = {
                            selectedEditorial = editorial
                            companyName = editorial.companyName
                            selectedCountry = uiState.countries.find { it.name == editorial.countryName }
                        }
                    )
                    Divider(color = CoffeeDark.copy(alpha = 0.2f))
                }
            }
        }
    }
}

@Composable
private fun EditorialRow(editorial: Editorial, onDelete: () -> Unit, onEdit: () -> Unit) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(text = editorial.companyName, modifier = Modifier.weight(1f))
        Text(text = editorial.countryName ?: "", color = GrayBrown, style = MaterialTheme.typography.bodySmall)
        IconButton(onClick = onEdit) {
            Icon(Icons.Default.Edit, contentDescription = "Editar", tint = OrangeSunset)
        }
        IconButton(onClick = onDelete) {
            Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = TerracottaRed)
        }
    }
}
