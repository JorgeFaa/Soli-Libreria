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
import com.edwin_antonio.proyectosoliv1.ui.theme.*
import com.edwin_antonio.proyectosoliv1.viewmodel.AdminViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CountryManagementScreen(
    tokenManager: TokenManager,
    onNavigateBack: () -> Unit
) {
    val viewModel: AdminViewModel = viewModel(factory = AdminViewModel.Factory(tokenManager))
    val uiState by viewModel.uiState.collectAsState()

    var countryName by remember { mutableStateOf("") }
    var selectedCountry by remember { mutableStateOf<Country?>(null) }

    LaunchedEffect(Unit) {
        viewModel.loadCountries()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestionar Países", color = CoffeeDark) },
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
            
            Row(verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(
                    value = countryName,
                    onValueChange = { countryName = it },
                    label = { Text("Nombre del País") },
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Button(
                    onClick = {
                        if (countryName.isNotBlank()) {
                            selectedCountry?.let {
                                viewModel.updateCountry(it.id, countryName)
                            } ?: viewModel.createCountry(countryName)
                            countryName = ""
                            selectedCountry = null
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = OrangeSunset)
                ) {
                    Text(if (selectedCountry == null) "Crear" else "Actualizar")
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))

            if (uiState.isLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
            }

            uiState.errorMessage?.let {
                Text(text = "Error: $it", color = MaterialTheme.colorScheme.error)
            }

            LazyColumn(modifier = Modifier.fillMaxSize()) {
                items(uiState.countries) { country ->
                    CountryRow(
                        country = country, 
                        onDelete = { viewModel.deleteCountry(country.id) },
                        onEdit = { 
                            selectedCountry = country
                            countryName = country.name
                        }
                    )
                    Divider(color = CoffeeDark.copy(alpha = 0.2f))
                }
            }
        }
    }
}

@Composable
private fun CountryRow(country: Country, onDelete: () -> Unit, onEdit: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(text = "${country.id}: ${country.name}", modifier = Modifier.weight(1f))
        IconButton(onClick = onEdit) {
            Icon(Icons.Default.Edit, contentDescription = "Editar", tint = OrangeSunset)
        }
        IconButton(onClick = onDelete) {
            Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = TerracottaRed)
        }
    }
}
