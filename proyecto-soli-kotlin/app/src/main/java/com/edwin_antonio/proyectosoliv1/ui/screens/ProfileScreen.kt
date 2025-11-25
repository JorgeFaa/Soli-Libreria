package com.edwin_antonio.proyectosoliv1.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.WbSunny
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
import com.edwin_antonio.proyectosoliv1.model.Review
import com.edwin_antonio.proyectosoliv1.model.Book

@Composable
fun ProfileScreen(
    profileViewModel: ProfileViewModel,
    onNavigateBack: () -> Unit,
    onBookClick: (String) -> Unit
) {
    val user by profileViewModel.user.collectAsState()
    val favoriteBooks by profileViewModel.favoriteBooks.collectAsState()
    val preferredGenreNames by profileViewModel.preferredGenreNames.collectAsState()
    val userReviews by profileViewModel.userReviews.collectAsState()

    LaunchedEffect(Unit) {
        profileViewModel.fetchUserProfile()
    }
    LaunchedEffect(user?.id) {
        if (user != null) {
            profileViewModel.fetchUserReviews()
        }
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
                .padding(top = 20.dp)
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onNavigateBack) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
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
                        ProfileInfoSection("Géneros Preferidos:", preferredGenreNames)
                        HorizontalDivider(modifier = Modifier.padding(vertical = 16.dp))
                        
                        if (favoriteBooks.isNotEmpty()) {
                            BookSectionComponent(
                                section = BookSection("Libros Favoritos", favoriteBooks),
                                onBookClick = onBookClick,
                                showDeleteButton = true,
                                onDeleteBook = { bookId ->
                                    profileViewModel.removeFavoriteBook(bookId.toInt())
                                }
                            )
                        }
                        // Mostrar reseñas del usuario
                        if (userReviews.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(24.dp))
                            Text(
                                text = "Mis Reseñas",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = OrangeSunset,
                                modifier = Modifier.padding(bottom = 8.dp)
                            )
                            var editingReview by remember { mutableStateOf<Pair<Review, Book?>?>(null) }
                            var editRating by remember { mutableStateOf(5) }
                            var editComment by remember { mutableStateOf("") }
                            var showEditDialog by remember { mutableStateOf(false) }
                            var showDeleteDialogReviewId by remember { mutableStateOf<Int?>(null) }

                            userReviews.forEach { (review, book) ->
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 8.dp),
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(containerColor = OrangeSunset.copy(alpha = 0.12f))
                                ) {
                                    Column(modifier = Modifier.padding(16.dp)) {
                                        Text(
                                            text = book?.title ?: "Libro desconocido",
                                            fontWeight = FontWeight.Bold,
                                            color = OrangeSunset,
                                            fontSize = 18.sp
                                        )
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Text("Calificación:", color = CoffeeDark)
                                            Spacer(Modifier.width(8.dp))
                                            Row {
                                                (1..5).forEach { s ->
                                                    val selected = review.rating >= s
                                                    Icon(
                                                        imageVector = androidx.compose.material.icons.Icons.Filled.WbSunny,
                                                        contentDescription = "Cal $s",
                                                        tint = if (selected) YellowSolar else CoffeeDark.copy(alpha = 0.3f),
                                                        modifier = Modifier.size(25.dp)
                                                    )
                                                }
                                            }
                                        }
                                        Spacer(Modifier.height(4.dp))
                                        Text(
                                            text = review.comment,
                                            color = CoffeeDark.copy(alpha = 0.8f),
                                            fontSize = 15.sp
                                        )
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.End
                                        ) {
                                            IconButton(onClick = {
                                                editingReview = review to book
                                                editRating = review.rating
                                                editComment = review.comment
                                                showEditDialog = true
                                            }) {
                                                Icon(imageVector = androidx.compose.material.icons.Icons.Filled.Edit, contentDescription = "Editar", tint = OrangeSunset)
                                            }
                                            IconButton(onClick = {
                                                showDeleteDialogReviewId = review.id
                                            }) {
                                                Icon(imageVector = androidx.compose.material.icons.Icons.Filled.Delete, contentDescription = "Borrar", tint = Color.Red)
                                            }
                                        }
                                    }
                                }
                            }
                            // Diálogo de edición
                            if (showEditDialog && editingReview != null) {
                                AlertDialog(
                                    onDismissRequest = { showEditDialog = false },
                                    title = { Text("Editar reseña", color = OrangeSunset, fontWeight = FontWeight.Bold) },
                                    text = {
                                        Column {
                                            Text(text = editingReview!!.second?.title ?: "Libro desconocido", fontWeight = FontWeight.Bold, color = OrangeSunset)
                                            Spacer(modifier = Modifier.height(8.dp))
                                            Text(text = "Calificación:", color = CoffeeDark)
                                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                                (1..5).forEach { s ->
                                                    val selected = editRating >= s
                                                    IconButton(
                                                        onClick = { editRating = s },
                                                        modifier = Modifier
                                                            .size(50.dp)
                                                            .background(color = if (selected) YellowSolar else OrangeSunset.copy(alpha = 0.2f), shape = RoundedCornerShape(8.dp))
                                                    ) {
                                                        Icon(
                                                            imageVector = androidx.compose.material.icons.Icons.Filled.WbSunny,
                                                            contentDescription = "Cal $s",
                                                            tint = if (selected) CoffeeDark else CoffeeDark.copy(alpha = 0.6f)
                                                        )
                                                    }
                                                }
                                            }
                                            Spacer(Modifier.height(8.dp))
                                            OutlinedTextField(
                                                value = editComment,
                                                onValueChange = { editComment = it },
                                                label = { Text("Comentario") },
                                                modifier = Modifier.fillMaxWidth(),
                                                singleLine = false,
                                                maxLines = 4,
                                                colors = TextFieldDefaults.colors(
                                                    focusedIndicatorColor = OrangeSunset,
                                                    cursorColor = OrangeSunset
                                                )
                                            )
                                        }
                                    },
                                    confirmButton = {
                                        TextButton(onClick = {
                                            profileViewModel.updateReview(
                                                editingReview!!.first.id,
                                                editRating,
                                                editComment
                                            )
                                            showEditDialog = false
                                        }) {
                                            Text("Guardar", color = OrangeSunset)
                                        }
                                    },
                                    dismissButton = {
                                        TextButton(onClick = { showEditDialog = false }) {
                                            Text("Cancelar", color = CoffeeDark)
                                        }
                                    },
                                    containerColor = Color.White,
                                    shape = RoundedCornerShape(16.dp)
                                )
                            }
                            // Diálogo de confirmación de borrado
                            showDeleteDialogReviewId?.let { reviewIdToDelete ->
                                AlertDialog(
                                    onDismissRequest = { showDeleteDialogReviewId = null },
                                    title = { Text("Eliminar reseña", color = OrangeSunset, fontWeight = FontWeight.Bold) },
                                    text = { Text("¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer.", color = CoffeeDark) },
                                    confirmButton = {
                                        TextButton(onClick = {
                                            profileViewModel.deleteReview(reviewIdToDelete)
                                            showDeleteDialogReviewId = null
                                        }) {
                                            Text("Eliminar", color = Color.Red)
                                        }
                                    },
                                    dismissButton = {
                                        TextButton(onClick = { showDeleteDialogReviewId = null }) {
                                            Text("Cancelar", color = CoffeeDark)
                                        }
                                    },
                                    containerColor = Color.White,
                                    shape = RoundedCornerShape(16.dp)
                                )
                            }
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