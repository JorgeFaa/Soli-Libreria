package com.edwin_antonio.proyectosoliv1.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.edwin_antonio.proyectosoliv1.R
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.ui.theme.*
import com.edwin_antonio.proyectosoliv1.viewmodel.RegisterViewModel

@Composable
fun RegisterScreen(
    onRegistered: () -> Unit,
    onBack: () -> Unit,
    tokenManager: TokenManager,
    viewModel: RegisterViewModel = viewModel { RegisterViewModel(tokenManager) }
) {
    val uiState by viewModel.uiState.collectAsState()
    
    // 🏁 Navegación cuando registro es exitoso
    LaunchedEffect(uiState.isRegisterSuccessful) {
        if (uiState.isRegisterSuccessful) {
            onRegistered()
            viewModel.resetRegisterSuccess()
        }
    }
    
    // ⚠️ Mostrar errores
    uiState.errorMessage?.let { errorMsg ->
        AlertDialog(
            onDismissRequest = { viewModel.clearError() },
            title = { Text("Error") },
            text = { Text(errorMsg) },
            confirmButton = {
                TextButton(onClick = { viewModel.clearError() }) { Text("OK") }
            }
        )
    }
    
    // 🎨 UI idéntica a React Native
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SandSoft)
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Header con logo
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(bottom = 20.dp)
        ) {
            Image(
                painter = painterResource(id = R.drawable.logo_soli),
                contentDescription = "Logo Soli",
                modifier = Modifier.size(100.dp)
            )
            Text("Soli", fontSize = 30.sp, fontWeight = FontWeight.Bold, color = CoffeeDark)
            Text("Librería Digital", fontSize = 15.sp, color = CoffeeDark)
        }
        
        // Caja del formulario
        Card(
            modifier = Modifier.fillMaxWidth().padding(bottom = 5.dp),
            colors = CardDefaults.cardColors(containerColor = HoneySoft),
            shape = RoundedCornerShape(10.dp)
        ) {
            Column(modifier = Modifier.padding(15.dp)) {
                Text("Crea una cuenta", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, 
                     modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp), 
                     textAlign = TextAlign.Center)
                
                // Nombre y Apellidos
                Row(modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp), 
                    horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = uiState.name, onValueChange = viewModel::updateName,
                        placeholder = { Text("Nombre") }, modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(20.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = YellowGolden, unfocusedContainerColor = YellowGolden,
                            focusedBorderColor = Color.Transparent, unfocusedBorderColor = Color.Transparent),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = uiState.lastname, onValueChange = viewModel::updateLastname,
                        placeholder = { Text("Apellidos") }, modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(20.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = YellowGolden, unfocusedContainerColor = YellowGolden,
                            focusedBorderColor = Color.Transparent, unfocusedBorderColor = Color.Transparent),
                        singleLine = true
                    )
                }
                
                // Label Género
                Text("Género:", fontSize = 14.sp, modifier = Modifier.padding(bottom = 5.dp))
                
                // Botones de género
                Row(modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp), 
                    horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    viewModel.genderOptions.forEach { gender ->
                        val isSelected = uiState.gender == gender
                        Box(
                            modifier = Modifier.weight(1f)
                                .background(
                                    color = if (isSelected) Color(0xFFFFCC00) else YellowGolden,
                                    shape = RoundedCornerShape(15.dp))
                                .clickable { viewModel.updateGender(gender) }
                                .padding(10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(gender, fontSize = 14.sp, color = CoffeeDark)
                        }
                    }
                }
                
                // Email
                OutlinedTextField(
                    value = uiState.username, onValueChange = viewModel::updateUsername,
                    placeholder = { Text("Email") }, modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp),
                    shape = RoundedCornerShape(20.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = YellowGolden, unfocusedContainerColor = YellowGolden,
                        focusedBorderColor = Color.Transparent, unfocusedBorderColor = Color.Transparent),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email), singleLine = true
                )
                
                // Contraseña
                OutlinedTextField(
                    value = uiState.password, onValueChange = viewModel::updatePassword,
                    placeholder = { Text("Contraseña") }, modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp),
                    shape = RoundedCornerShape(20.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = YellowGolden, unfocusedContainerColor = YellowGolden,
                        focusedBorderColor = Color.Transparent, unfocusedBorderColor = Color.Transparent),
                    visualTransformation = if (uiState.isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = viewModel::togglePasswordVisibility) {
                            Icon(
                                imageVector = if (uiState.isPasswordVisible) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                                contentDescription = null, tint = CoffeeDark
                            )
                        }
                    }, singleLine = true
                )
                
                // Botón Registrarse
                Button(
                    onClick = viewModel::register, modifier = Modifier.fillMaxWidth().padding(top = 10.dp),
                    shape = RoundedCornerShape(50.dp), colors = ButtonDefaults.buttonColors(containerColor = YellowGolden),
                    enabled = !uiState.isLoading
                ) {
                    if (uiState.isLoading) {
                        CircularProgressIndicator(color = CoffeeDark, modifier = Modifier.size(20.dp))
                    } else {
                        Text("Registrarse", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = CoffeeDark)
                    }
                }
            }
        }
        
        // Link a Login
        TextButton(onClick = onBack, modifier = Modifier.padding(top = 10.dp)) {
            Text("¿Ya tienes una cuenta?", color = CoffeeDark)
        }
    }
}
