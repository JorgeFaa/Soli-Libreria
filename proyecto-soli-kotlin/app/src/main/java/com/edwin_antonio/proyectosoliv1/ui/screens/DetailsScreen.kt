package com.edwin_antonio.proyectosoliv1.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.ui.theme.*
import com.edwin_antonio.proyectosoliv1.viewmodel.DetailsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DetailsScreen(
    bookId: String, 
    onBack: () -> Unit,
    onOpenPdf: (String, String) -> Unit = { _, _ -> },
    tokenManager: TokenManager,
    viewModel: DetailsViewModel = viewModel { DetailsViewModel(tokenManager) }
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LaunchedEffect(bookId) { viewModel.loadBook(bookId) }
    
    uiState.errorMessage?.let { errorMsg ->
        AlertDialog(
            onDismissRequest = { viewModel.clearError() },
            title = { Text("Error") },
            text = { Text(errorMsg) },
            confirmButton = { TextButton(onClick = { viewModel.clearError() }) { Text("OK") } }
        )
    }
    
    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text("Detalles", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = CoffeeDark) },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Volver", tint = CoffeeDark)
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent),
            modifier = Modifier.background(Brush.horizontalGradient(listOf(YellowSolar, OrangeSunset)))
        )
        
        if (uiState.isLoading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = YellowSolar)
                    Spacer(Modifier.height(16.dp))
                    Text("Cargando detalles...", color = CoffeeDark)
                }
            }
        } else {
            uiState.book?.let { book ->
                Column(
                    Modifier.fillMaxSize().background(SandSoft).verticalScroll(rememberScrollState()).padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Card(
                        Modifier.fillMaxWidth().padding(bottom = 24.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(16.dp),
                        elevation = CardDefaults.cardElevation(4.dp)
                    ) {
                        Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            if (!book.coverUrl.isNullOrEmpty()) {
                                AsyncImage(
                                    model = book.coverUrl,
                                    contentDescription = "Portada de ${book.title}",
                                    modifier = Modifier.width(200.dp).height(280.dp).shadow(8.dp, RoundedCornerShape(12.dp)),
                                    contentScale = ContentScale.Crop
                                )
                            } else {
                                Box(
                                    Modifier.width(200.dp).height(280.dp).background(Color.LightGray, RoundedCornerShape(12.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.MenuBook, null, Modifier.size(64.dp), tint = Color.Gray)
                                }
                            }
                            
                            Spacer(Modifier.height(18.dp))
                            Text(book.title, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = CoffeeDark, textAlign = TextAlign.Center, modifier = Modifier.padding(bottom = 6.dp))
                            
                            // Mostrar primer autor
                            if (book.authors.isNotEmpty()) {
                                val author = book.authors.first()
                                val fullName = listOfNotNull(author.name, author.middleName, author.lastName).joinToString(" ")
                                Text("Autor: $fullName", fontSize = 16.sp, color = OrangeSunset, modifier = Modifier.padding(bottom = 4.dp))
                            }
                            
                            // Mostrar primer género
                            if (book.genres.isNotEmpty()) {
                                Text("Género: ${book.genres.first().name}", fontSize = 15.sp, color = TerracottaRed, modifier = Modifier.padding(bottom = 4.dp))
                            }
                            
                            // Mostrar primera editorial
                            if (book.editorials.isNotEmpty()) {
                                Text("Editorial: ${book.editorials.first().companyName}", fontSize = 14.sp, color = CoffeeDark, modifier = Modifier.padding(bottom = 4.dp))
                            }
                            
                            Text("Publicado: ${book.publishedDate}", fontSize = 14.sp, color = CoffeeDark, modifier = Modifier.padding(bottom = 16.dp))
                            
                            if (book.description.isNotBlank()) {
                                Text("Descripción", fontSize = 18.sp, fontWeight = FontWeight.SemiBold, color = CoffeeDark, modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp))
                                Text(book.description, fontSize = 15.sp, color = CoffeeDark, textAlign = TextAlign.Justify, lineHeight = 22.sp)
                            }
                        }
                    }
                    
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        if (!book.pdfUrl.isNullOrEmpty()) {
                            Button(
                                onClick = { onOpenPdf(book.pdfUrl!!, book.title) },
                                Modifier.weight(1f).height(48.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = YellowSolar)
                            ) {
                                Icon(Icons.Default.MenuBook, null, Modifier.size(18.dp), tint = CoffeeDark)
                                Spacer(Modifier.width(6.dp))
                                Text("Leer Ahora", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = CoffeeDark)
                            }
                        }
                        
                        Button(
                            onClick = { viewModel.addToFavorites() },
                            Modifier.weight(1f).height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = OrangeSunset),
                            enabled = !uiState.isAddingToFavorites
                        ) {
                            if (uiState.isAddingToFavorites) {
                                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(18.dp))
                            } else {
                                Icon(Icons.Default.Favorite, null, Modifier.size(18.dp), tint = Color.White)
                                Spacer(Modifier.width(6.dp))
                                Text("Favoritos", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                            }
                        }
                    }
                }
            }
        }
    }
}
