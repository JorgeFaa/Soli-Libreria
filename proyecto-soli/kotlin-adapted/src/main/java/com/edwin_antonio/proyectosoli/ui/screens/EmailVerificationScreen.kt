package com.edwin_antonio.proyectosoli.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun EmailVerificationScreen(onVerified: () -> Unit, onBack: () -> Unit) {
    Column(Modifier.padding(16.dp)) {
        Text("Verificación de correo", style = MaterialTheme.typography.headlineSmall)
        Text("Te hemos enviado un correo. Haz clic en el enlace para verificar tu cuenta.")
        Spacer(Modifier.height(12.dp))
        Button(onClick = onVerified, modifier = Modifier.fillMaxWidth()) { Text("Ya verifiqué") }
        TextButton(onClick = onBack, modifier = Modifier.fillMaxWidth()) { Text("Volver") }
    }
}
