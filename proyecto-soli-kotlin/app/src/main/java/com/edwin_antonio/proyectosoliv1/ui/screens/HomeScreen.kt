package com.edwin_antonio.proyectosoliv1.ui.screens

import android.util.Log
import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.BorderStroke
import coil.compose.AsyncImage
import com.edwin_antonio.proyectosoliv1.R
import com.edwin_antonio.proyectosoliv1.model.Book
import com.edwin_antonio.proyectosoliv1.network.BookSection
import com.edwin_antonio.proyectosoliv1.ui.theme.*
import com.edwin_antonio.proyectosoliv1.viewmodel.HomeViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import com.edwin_antonio.proyectosoliv1.auth.TokenManager

@Composable
fun HomeScreen(
    onOpenBooks: () -> Unit,
    onOpenFavorites: () -> Unit,
    onOpenUser: () -> Unit,
    onOpenAdmin: () -> Unit,
    onBookClick: (String) -> Unit = {},
    onLogout: () -> Unit = {},
    tokenManager: TokenManager,
    viewModel: HomeViewModel = viewModel { HomeViewModel(tokenManager) }
) {
    val uiState by viewModel.uiState.collectAsState()
    var menuOpen by remember { mutableStateOf(false) }
    val userRole by tokenManager.userRole.collectAsState()

    LaunchedEffect(userRole) {
        Log.d("HomeScreen", "User role observed: $userRole")
    }

    // 🎨 Animación del drawer
    val slideOffset by animateDpAsState(
        targetValue = if (menuOpen) 0.dp else (-240).dp,
        animationSpec = tween(300)
    )

    Box(modifier = Modifier.fillMaxSize()) {
        // 🎨 UI principal idéntica a React Native
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(SandSoft) // #F6EFD7 - fondo arena
        ) {
            // 🌅 Header con gradiente - más compacto
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        brush = Brush.horizontalGradient(
                            colors = listOf(YellowSolar, OrangeSunset) // FFD24C -> FF8C42
                        )
                    )
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Botón menú
                    IconButton(
                        onClick = { menuOpen = true },
                        modifier = Modifier.padding(2.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Menu,
                            contentDescription = "Menu",
                            modifier = Modifier.size(26.dp),
                            tint = CoffeeDark
                        )
                    }

                    // Logo/Título central
                    Text(
                        text = "Soli Libreria",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = CoffeeDark
                    )

                    // Botón búsqueda
                    IconButton(
                        onClick = { viewModel.toggleSearch() },
                        modifier = Modifier.padding(2.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            modifier = Modifier.size(26.dp),
                            tint = CoffeeDark
                        )
                    }
                }
            }

            // 🔍 Barra de búsqueda expandible
            if (uiState.isSearchActive) {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = Color.White
                ) {
                    OutlinedTextField(
                        value = uiState.searchQuery,
                        onValueChange = { viewModel.updateSearchQuery(it) },
                        placeholder = { Text("Buscar libro...") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Color.White,
                            unfocusedContainerColor = Color.White
                        ),
                        singleLine = true
                    )
                }
            }

            // 📚 Secciones scrolleables - datos reales de la API
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(bottom = 20.dp)
            ) {
                // Mostrar loading
                if (uiState.isLoading) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = YellowSolar)
                    }
                }

                // Mostrar error
                uiState.errorMessage?.let { errorMsg ->
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Error: $errorMsg",
                            color = MaterialTheme.colorScheme.error,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        Button(onClick = { viewModel.loadBooks() }) {
                            Text("Reintentar")
                        }
                    }
                }

                // Mostrar secciones de libros
                uiState.sections.forEach { section ->
                    BookSectionComponent(
                        section = section,
                        onBookClick = onBookClick
                    )
                }

                // Mensaje cuando no hay libros
                if (!uiState.isLoading && uiState.sections.isEmpty() && uiState.errorMessage == null) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No se encontraron libros",
                            color = CoffeeDark,
                            fontSize = 16.sp
                        )
                    }
                }
            }
        }

        // 🎨 Overlay del drawer
        if (menuOpen) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.3f))
                    .clickable { menuOpen = false }
                    .zIndex(1f)
            )
        }

        // 🗺️ Drawer lateral - idéntico a React Native
        Surface(
            modifier = Modifier
                .fillMaxHeight()
                .width(240.dp)
                .offset(x = slideOffset)
                .shadow(10.dp)
                .zIndex(2f),
            color = Color.White
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(top = 60.dp, start = 16.dp, end = 16.dp, bottom = 16.dp)
            ) {
                Text(
                    text = "Menú",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 20.dp)
                )

                DrawerMenuItem("Perfil") {
                    menuOpen = false
                    onOpenUser()
                }

                if (userRole == "ADMIN") {
                    DrawerMenuItem("Admin") {
                        menuOpen = false
                        onOpenAdmin()
                    }
                }

                // Solo botón de cerrar sesión por ahora
                Spacer(modifier = Modifier.weight(1f)) // Empujar el botón hacia abajo

                DrawerMenuItem("Cerrar Sesión") {
                    menuOpen = false
                    onLogout()
                }
            }
        }
    }
}

// 📚 Componente de sección de libros
@Composable
fun BookSectionComponent(
    section: BookSection,
    onBookClick: (String) -> Unit,
    showDeleteButton: Boolean = false,
    onDeleteBook: (String) -> Unit = {}
) {
    if (section.books.isNotEmpty()) {
        Column(modifier = Modifier.padding(vertical = 12.dp)) {
            // Título de sección
            Text(
                text = section.title,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = CoffeeDark,
                modifier = Modifier
                    .padding(horizontal = 12.dp)
                    .padding(bottom = 8.dp)
            )

            // Lista horizontal de libros
            LazyRow(
                contentPadding = PaddingValues(horizontal = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(section.books) { book ->
                    BookCard(
                        book = book,
                        onClick = { onBookClick(book.id.toString()) },
                        showDeleteButton = showDeleteButton,
                        onDelete = { onDeleteBook(book.id.toString()) }
                    )
                }
            }
        }
    }
}

// 📋 Card de libro - estilo mejorado con bordes y sombras
@Composable
fun BookCard(
    book: Book,
    onClick: () -> Unit,
    showDeleteButton: Boolean = false,
    onDelete: () -> Unit = {}
) {
    Card(
        modifier = Modifier
            .clickable { onClick() }
            .width(150.dp)
            .height(280.dp) // Altura fija para uniformidad
            .padding(4.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        border = BorderStroke(
            width = 1.dp,
            color = CoffeeDark.copy(alpha = 0.15f)
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 6.dp,
            pressedElevation = 10.dp
        )
    ) {
        Box(modifier = Modifier.fillMaxSize()) { 
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Sección superior: Portada del libro
                if (!book.coverUrl.isNullOrEmpty()) {
                    AsyncImage(
                        model = book.coverUrl,
                        contentDescription = "Portada de ${book.title}",
                        modifier = Modifier
                            .size(width = 110.dp, height = 165.dp) // Tamaño fijo
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                color = Color.LightGray.copy(alpha = 0.3f)
                            ),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    // Placeholder when no URL
                    Box(
                        modifier = Modifier
                            .size(width = 110.dp, height = 165.dp) // Tamaño fijo
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                brush = Brush.verticalGradient(
                                    colors = listOf(
                                        Color.LightGray.copy(alpha = 0.3f),
                                        Color.Gray.copy(alpha = 0.1f)
                                    )
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "📖",
                                fontSize = 36.sp,
                                color = CoffeeDark.copy(alpha = 0.6f)
                            )
                            Text(
                                text = "Sin portada",
                                fontSize = 9.sp,
                                color = CoffeeDark.copy(alpha = 0.5f),
                                fontWeight = FontWeight.Light
                            )
                        }
                    }
                }

                // Sección inferior: Información del libro (altura flexible)
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f), // Ocupa el espacio restante
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    // Título del libro con mejor estilo
                    Text(
                        text = book.title,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = CoffeeDark,
                        maxLines = 2,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        lineHeight = 16.sp,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            if (showDeleteButton) {
                IconButton(
                    onClick = onDelete,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                        .background(Color.Black.copy(alpha = 0.6f), shape = CircleShape)
                        .size(28.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Eliminar de Favoritos",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

// 🗺️ Item del drawer
@Composable
fun DrawerMenuItem(
    text: String,
    onClick: () -> Unit
) {
    Text(
        text = text,
        fontSize = 16.sp,
        color = Color(0xFF333333),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 12.dp)
    )
}
