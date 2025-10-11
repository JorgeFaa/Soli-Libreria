package com.edwin_antonio.proyectosoliv1.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.edwin_antonio.proyectosoliv1.R
import com.edwin_antonio.proyectosoliv1.ui.theme.YellowSolar
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(onSplashFinished: () -> Unit) {
    // 🔄 Animación de rotación infinita (igual que React Native)
    val infiniteTransition = rememberInfiniteTransition(label = "rotation")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing), // 2 segundos por rotación
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )
    
    // ⏱️ Timer de 3 segundos como en React Native
    LaunchedEffect(Unit) {
        delay(3000) // 3 segundos
        onSplashFinished()
    }
    
    // 🎨 UI idéntica al React Native
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(YellowSolar), // Fondo #FFD24C exacto
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // 🖼️ Logo con rotación (reemplazar con logo real)
            Image(
                painter = painterResource(id = R.drawable.logo_soli),
                contentDescription = "Logo Soli",
                modifier = Modifier
                    .size(150.dp) // Mismo tamaño que React Native
                    .rotate(rotation)
            )
            
            Spacer(modifier = Modifier.height(20.dp))
            
            // 📝 Texto "Cargando..." exacto
            Text(
                text = "Cargando...",
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
