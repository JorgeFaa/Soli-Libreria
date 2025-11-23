package com.edwin_antonio.proyectosoliv1.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.model.TextType
import com.edwin_antonio.proyectosoliv1.viewmodel.AdminViewModel

// --- Paleta de colores Soli ---
val OrangeSoli = Color(0xFFE68A00) // Naranja principal
val SandySoli = Color(0xFFFFF8E1)   // Fondo arenoso claro
val DarkerSandySoli = Color(0xFFE0CBA8) // Para bordes y divisores

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TextTypeManagementScreen(
    tokenManager: TokenManager,
    onNavigateBack: () -> Unit
) {
    val viewModel: AdminViewModel = viewModel(factory = AdminViewModel.Factory(tokenManager))
    val uiState by viewModel.uiState.collectAsState()
    var newTextType by remember { mutableStateOf("") }
    var editingTextType by remember { mutableStateOf<TextType?>(null) }

    // Carga inicial de los datos
    LaunchedEffect(key1 = Unit) {
        viewModel.loadTextTypes()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestionar Tipos de Texto", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Volver", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = OrangeSoli
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(SandySoli)
                .padding(padding)
                .padding(16.dp)
        ) {
            // --- Formulario para crear --- //
            Row(verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(
                    value = newTextType,
                    onValueChange = { newTextType = it },
                    label = { Text("Nuevo tipo de texto") },
                    modifier = Modifier.weight(1f),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = OrangeSoli,
                        unfocusedBorderColor = DarkerSandySoli,
                        cursorColor = OrangeSoli
                    )
                )
                Spacer(modifier = Modifier.width(8.dp))
                Button(
                    onClick = {
                        if (newTextType.isNotBlank()) {
                            viewModel.createTextType(newTextType)
                            newTextType = ""
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = OrangeSoli)
                ) {
                    Text("Crear")
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))

            // --- Estado de carga y error --- //
            if (uiState.isLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally), color = OrangeSoli)
            }

            uiState.errorMessage?.let {
                Text(text = "Error: $it", color = MaterialTheme.colorScheme.error)
                Button(onClick = { viewModel.loadTextTypes() }, colors = ButtonDefaults.buttonColors(containerColor = OrangeSoli)) {
                    Text("Reintentar")
                }
            }

            // --- Lista de tipos de texto --- //
            LazyColumn(modifier = Modifier.fillMaxSize()) {
                items(uiState.textTypes) { textType ->
                    TextTypeRow(
                        textType = textType,
                        onEdit = { editingTextType = textType },
                        onDelete = { viewModel.deleteTextType(textType.id) }
                    )
                    Divider(color = DarkerSandySoli)
                }
            }
        }
    }

    // --- Dialogo de edición --- //
    editingTextType?.let { textType ->
        EditTextTypeDialog(
            textType = textType,
            onDismiss = { editingTextType = null },
            onConfirm = { updatedName ->
                viewModel.updateTextType(textType.id, updatedName)
                editingTextType = null
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun EditTextTypeDialog(
    textType: TextType,
    onDismiss: () -> Unit,
    onConfirm: (String) -> Unit
) {
    var text by remember { mutableStateOf(textType.type) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Editar Tipo de Texto") },
        text = {
            OutlinedTextField(
                value = text,
                onValueChange = { text = it },
                label = { Text("Nombre del tipo") },
                modifier = Modifier.fillMaxWidth(),
                 colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = OrangeSoli,
                    unfocusedBorderColor = DarkerSandySoli,
                    cursorColor = OrangeSoli
                )
            )
        },
        confirmButton = {
            Button(onClick = { onConfirm(text) }, colors = ButtonDefaults.buttonColors(containerColor = OrangeSoli)) {
                Text("Guardar")
            }
        },
        dismissButton = {
            Button(onClick = onDismiss, colors = ButtonDefaults.buttonColors(containerColor = DarkerSandySoli)) {
                Text("Cancelar", color = Color.Black)
            }
        }
    )
}

@Composable
private fun TextTypeRow(
    textType: TextType,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = "#${textType.id}: ${textType.type}")
        Row {
            Button(onClick = onEdit, colors = ButtonDefaults.buttonColors(containerColor = OrangeSoli)) {
                Text("Editar")
            }
            Spacer(modifier = Modifier.width(8.dp))
            Button(
                onClick = onDelete,
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
            ) {
                Text("Eliminar")
            }
        }
    }
}
