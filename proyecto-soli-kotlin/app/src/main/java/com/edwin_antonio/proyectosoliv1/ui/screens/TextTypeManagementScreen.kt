package com.edwin_antonio.proyectosoliv1.ui.screens

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
import com.edwin_antonio.proyectosoliv1.model.TextType
import com.edwin_antonio.proyectosoliv1.viewmodel.AdminViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TextTypeManagementScreen(
    tokenManager: TokenManager,
    onNavigateBack: () -> Unit
) {
    val viewModel: AdminViewModel = viewModel(factory = AdminViewModel.Factory(tokenManager))
    val uiState by viewModel.uiState.collectAsState()
    var newTextType by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestionar Tipos de Texto") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Volver")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            // --- Formulario para crear --- //
            Row(verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(
                    value = newTextType,
                    onValueChange = { newTextType = it },
                    label = { Text("Nuevo tipo de texto") },
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Button(onClick = {
                    if (newTextType.isNotBlank()) {
                        viewModel.createTextType(newTextType)
                        newTextType = ""
                    }
                }) {
                    Text("Crear")
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))

            // --- Lista de tipos de texto --- //
            if (uiState.isLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
            }

            uiState.errorMessage?.let {
                Text(text = "Error: $it", color = MaterialTheme.colorScheme.error)
                Button(onClick = { viewModel.loadTextTypes() }) {
                    Text("Reintentar")
                }
            }

            LazyColumn(modifier = Modifier.fillMaxSize()) {
                items(uiState.textTypes) { textType ->
                    TextTypeRow(textType = textType, onDelete = {
                        viewModel.deleteTextType(textType.id)
                    })
                    Divider()
                }
            }
        }
    }
}

@Composable
private fun TextTypeRow(textType: TextType, onDelete: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = "${textType.id}: ${textType.type}")
        Button(onClick = onDelete, colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)) {
            Text("Eliminar")
        }
    }
}
