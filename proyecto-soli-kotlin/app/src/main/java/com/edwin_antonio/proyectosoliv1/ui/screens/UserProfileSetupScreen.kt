package com.edwin_antonio.proyectosoliv1.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.model.Genre
import com.edwin_antonio.proyectosoliv1.ui.theme.*
import com.edwin_antonio.proyectosoliv1.viewmodel.UserProfileSetupViewModel

@Composable
fun UserProfileSetupScreen(
    onProfileSetupComplete: () -> Unit,
    tokenManager: TokenManager,
    viewModel: UserProfileSetupViewModel = viewModel { UserProfileSetupViewModel(tokenManager) }
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SandSoft)
            .padding(24.dp)
    ) {
        // Header
        Text(
            text = "¡Bienvenido a Soli Librería!",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = CoffeeDark,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp)
        )
        
        Text(
            text = "Verifica y actualiza tu perfil",
            fontSize = 16.sp,
            color = CoffeeDark.copy(alpha = 0.7f),
            textAlign = TextAlign.Center,
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 32.dp)
        )
        
        // Form Content
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                // First Name Field
                OutlinedTextField(
                    value = uiState.firstName,
                    onValueChange = { viewModel.updateFirstName(it) },
                    label = { Text("Nombre") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    ),
                    isError = uiState.firstNameError != null
                )
                
                uiState.firstNameError?.let { error ->
                    Text(
                        text = error,
                        color = MaterialTheme.colorScheme.error,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(start = 16.dp, top = 4.dp)
                    )
                }
            }
            
            item {
                // Last Name Field
                OutlinedTextField(
                    value = uiState.lastName,
                    onValueChange = { viewModel.updateLastName(it) },
                    label = { Text("Apellido") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    ),
                    isError = uiState.lastNameError != null
                )
                
                uiState.lastNameError?.let { error ->
                    Text(
                        text = error,
                        color = MaterialTheme.colorScheme.error,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(start = 16.dp, top = 4.dp)
                    )
                }
            }
            
            item {
                // Genres Section
                Text(
                    text = "Géneros favoritos (opcional)",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = CoffeeDark,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
                
                Text(
                    text = "Selecciona tus géneros literarios favoritos para recibir mejores recomendaciones",
                    fontSize = 14.sp,
                    color = CoffeeDark.copy(alpha = 0.7f),
                    modifier = Modifier.padding(bottom = 16.dp)
                )
            }
            
            // Loading state for genres
            if (uiState.isLoadingGenres) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = YellowSolar)
                    }
                }
            }
            
            // Error state for genres
            uiState.genresError?.let { error ->
                item {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Error al cargar géneros: $error",
                            color = MaterialTheme.colorScheme.error,
                            textAlign = TextAlign.Center
                        )
                        Button(
                            onClick = { viewModel.loadGenres() },
                            modifier = Modifier.padding(top = 8.dp)
                        ) {
                            Text("Reintentar")
                        }
                    }
                }
            }
            
            // Genre Selection Chips
            items(uiState.availableGenres.chunked(2)) { genreRow ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    genreRow.forEach { genre ->
                        GenreChip(
                            genre = genre,
                            isSelected = uiState.selectedGenreIds.contains(genre.id),
                            onToggle = { viewModel.toggleGenre(genre.id) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                    // Fill remaining space if odd number of items
                    repeat(2 - genreRow.size) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }
            
            item {
                Spacer(modifier = Modifier.height(32.dp))
                
                // Save Button
                Button(
                    onClick = { 
                        viewModel.saveProfile { success ->
                            if (success) {
                                onProfileSetupComplete()
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = YellowSolar,
                        contentColor = CoffeeDark
                    ),
                    enabled = !uiState.isSaving
                ) {
                    if (uiState.isSaving) {
                        CircularProgressIndicator(
                            color = CoffeeDark,
                            modifier = Modifier.size(20.dp)
                        )
                    } else {
                        Text(
                            text = "Continuar",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
                
                // Error message for saving
                uiState.saveError?.let { error ->
                    Text(
                        text = error,
                        color = MaterialTheme.colorScheme.error,
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp)
                    )
                }
                
                // Skip button
                TextButton(
                    onClick = { onProfileSetupComplete() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    enabled = !uiState.isSaving
                ) {
                    Text(
                        text = "Omitir por ahora",
                        fontSize = 14.sp,
                        color = CoffeeDark.copy(alpha = 0.7f)
                    )
                }
            }
        }
    }
}

@Composable
fun GenreChip(
    genre: Genre,
    isSelected: Boolean,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .clickable { onToggle() }
            .padding(2.dp),
        shape = RoundedCornerShape(20.dp),
        color = if (isSelected) YellowSolar else Color.White,
        border = androidx.compose.foundation.BorderStroke(
            width = 1.dp,
            color = if (isSelected) YellowSolar else CoffeeDark.copy(alpha = 0.3f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            if (isSelected) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = null,
                    tint = CoffeeDark,
                    modifier = Modifier
                        .size(16.dp)
                        .padding(end = 4.dp)
                )
            }
            
            Text(
                text = genre.name,
                fontSize = 14.sp,
                color = if (isSelected) CoffeeDark else CoffeeDark.copy(alpha = 0.8f),
                fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                textAlign = TextAlign.Center
            )
        }
    }
}