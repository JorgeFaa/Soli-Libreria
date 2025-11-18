package com.edwin_antonio.proyectosoliv1.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.edwin_antonio.proyectosoliv1.viewmodel.ProfileViewModel
import com.edwin_antonio.proyectosoliv1.ui.theme.CoffeeDark
import com.edwin_antonio.proyectosoliv1.ui.theme.OrangeSunset
import com.edwin_antonio.proyectosoliv1.ui.theme.SandSoft
import com.edwin_antonio.proyectosoliv1.ui.theme.YellowSolar
import com.edwin_antonio.proyectosoliv1.network.BookSection

@Composable
fun ProfileScreen(
    profileViewModel: ProfileViewModel,
    onNavigateBack: () -> Unit,
    onBookClick: (String) -> Unit
) {
    val user by profileViewModel.user.collectAsState()
    val favoriteBooks by profileViewModel.favoriteBooks.collectAsState()

    LaunchedEffect(Unit) {
        profileViewModel.fetchUserProfile()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SandSoft)
    ) {
        // Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(YellowSolar, OrangeSunset)
                    )
                )
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onNavigateBack) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Volver",
                        tint = CoffeeDark
                    )
                }
                Text(
                    text = "Mi Perfil",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = CoffeeDark
                )
                // Spacer to keep title centered
                Spacer(modifier = Modifier.size(48.dp))
            }
        }

        // Profile content
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            user?.let {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color.White
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // User name
                        Text(
                            text = "${it.firstName} ${it.lastName}",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = CoffeeDark,
                            modifier = Modifier.padding(bottom = 24.dp)
                        )

                        // Info Section
                        ProfileInfoSection("Géneros Preferidos", it.prefferredGenreIds.joinToString(", "))
                        Divider(modifier = Modifier.padding(vertical = 16.dp))
                        
                        if (favoriteBooks.isNotEmpty()) {
                            BookSectionComponent(
                                section = BookSection("Libros Favoritos", favoriteBooks),
                                onBookClick = onBookClick
                            )
                        }
                    }
                }
            } ?: run {
                // Loading or error state
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = YellowSolar)
                }
            }
        }
    }
}

@Composable
fun ProfileInfoSection(title: String, content: String) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.Start
    ) {
        Text(
            text = title,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = CoffeeDark,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        Text(
            text = content.ifEmpty { "No especificado" },
            fontSize = 16.sp,
            color = CoffeeDark.copy(alpha = 0.8f)
        )
    }
}
