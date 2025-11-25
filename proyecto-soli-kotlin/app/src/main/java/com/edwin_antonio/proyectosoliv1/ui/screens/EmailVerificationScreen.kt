package com.edwin_antonio.proyectosoliv1.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement.SpaceBetween
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.edwin_antonio.proyectosoliv1.viewmodel.EmailVerificationViewModel
import com.edwin_antonio.proyectosoliv1.viewmodel.EmailVerificationViewModelFactory
import androidx.compose.ui.graphics.Brush
import com.edwin_antonio.proyectosoliv1.ui.theme.YellowSolar
import com.edwin_antonio.proyectosoliv1.ui.theme.OrangeSunset
import com.edwin_antonio.proyectosoliv1.ui.theme.SandSoft
import com.edwin_antonio.proyectosoliv1.ui.theme.CoffeeDark
import androidx.compose.material3.Surface
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.ui.graphics.Color

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmailVerificationScreen(
    username: String,
    onVerificationSuccess: () -> Unit,
    onBack: () -> Unit
) {
    val viewModel: EmailVerificationViewModel = viewModel(factory = EmailVerificationViewModelFactory(username))
    val uiState by viewModel.uiState.collectAsState()

    if (uiState.isVerificationSuccessful) {
        LaunchedEffect(Unit) {
            onVerificationSuccess() // la navegación la controla AppNavHost (ahora irá a Login)
        }
    }

    Scaffold(
        topBar = {
            // Encabezado con gradiente usando la paleta de HomeScreen
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        brush = Brush.horizontalGradient(
                            colors = listOf(YellowSolar, OrangeSunset)
                        )
                    )
                    .padding(horizontal = 12.dp, vertical = 10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver", tint = CoffeeDark)
                    }
                    Text(
                        text = "Verificar Correo Electrónico",
                        color = CoffeeDark,
                        modifier = Modifier.align(Alignment.CenterVertically)
                    )
                    Spacer(modifier = Modifier.size(40.dp)) // espacio para balancear el Row
                }
            }
        },
        containerColor = SandSoft // fondo general
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "Se ha enviado un código de verificación a $username. Por favor, ingrésalo a continuación.",
                textAlign = TextAlign.Center,
                color = CoffeeDark,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = uiState.code,
                onValueChange = { viewModel.updateCode(it) },
                label = { Text("Código de 6 dígitos") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                isError = uiState.errorMessage != null,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White,
                    focusedBorderColor = YellowSolar,
                    cursorColor = CoffeeDark
                ),
                shape = RoundedCornerShape(8.dp)
            )

            uiState.errorMessage?.let {
                Text(text = it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 8.dp))
            }

            uiState.resendMessage?.let {
                Text(text = it, color = YellowSolar, modifier = Modifier.padding(top = 8.dp))
            }

            Spacer(modifier = Modifier.height(18.dp))

            Button(
                onClick = { viewModel.verifyCode() },
                modifier = Modifier.fillMaxWidth(),
                enabled = !uiState.isLoading,
                colors = ButtonDefaults.buttonColors(containerColor = YellowSolar, contentColor = CoffeeDark),
                shape = RoundedCornerShape(8.dp)
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = CoffeeDark)
                } else {
                    Text("Verificar")
                }
            }

            TextButton(
                onClick = { viewModel.resendVerificationCode() },
                modifier = Modifier.fillMaxWidth(),
                enabled = !uiState.isLoading
            ) {
                Text("Reenviar código", color = CoffeeDark)
            }
        }
    }
}
