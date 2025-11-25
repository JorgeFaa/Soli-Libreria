package com.edwin_antonio.proyectosoliv1.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.WbSunny
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
import com.edwin_antonio.proyectosoliv1.model.Review
import com.edwin_antonio.proyectosoliv1.ui.theme.*
import com.edwin_antonio.proyectosoliv1.viewmodel.DetailsViewModel
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.rememberCoroutineScope
import kotlinx.coroutines.launch
import androidx.compose.material3.LocalContentColor

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
    // usar currentUserId provisto por el ViewModel (se inicializa desde TokenManager o desde la API)
    val currentUserId = uiState.currentUserId

    // estado para diálogo de confirmación de borrado
    var showDeleteDialogReviewId by remember { mutableStateOf<Int?>(null) }

    // estado para diálogo de edición
    var showEditDialogReview by remember { mutableStateOf<Review?>(null) }
    var editDialogRating by remember { mutableStateOf(5) }
    var editDialogComment by remember { mutableStateOf("") }

    // sincronizar valores cuando se abre el diálogo de edición
    LaunchedEffect(showEditDialogReview) {
        showEditDialogReview?.let { r ->
            editDialogRating = r.rating
            editDialogComment = r.comment
        }
    }

    // Snackbar host + scope para mensajes cuando el usuario no es propietario
    val snackbarHostState = remember { SnackbarHostState() }
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(bookId) {
        viewModel.loadBook(bookId)
        viewModel.loadReviews(bookId, 0, 10)
    }

    uiState.errorMessage?.let { errorMsg ->
        AlertDialog(
            onDismissRequest = { viewModel.clearError() },
            title = { Text("Error") },
            text = { Text(errorMsg) },
            confirmButton = { TextButton(onClick = { viewModel.clearError() }) { Text("OK") } }
        )
    }

    // Envolver en Scaffold para SnackbarHost
    Scaffold(snackbarHost = { SnackbarHost(hostState = snackbarHostState) }) { padding ->
        Column(modifier = Modifier
            .fillMaxSize()
            .padding(padding)) {
         TopAppBar(
             title = { Text("Detalles", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = CoffeeDark) },
             navigationIcon = {
                 IconButton(onClick = onBack) {
                     Icon(Icons.Filled.ArrowBack, contentDescription = "Volver", tint = CoffeeDark)
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
                 LazyColumn(
                     modifier = Modifier
                         .fillMaxSize()
                         .background(SandSoft)
                         .padding(20.dp),
                     verticalArrangement = Arrangement.spacedBy(12.dp)
                 ) {
                     // HEADER: tarjeta con detalles del libro
                     item {
                         Card(
                             Modifier.fillMaxWidth(),
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
                                         Icon(Icons.Filled.MenuBook, null, Modifier.size(64.dp), tint = Color.Gray)
                                     }
                                 }

                                 Spacer(Modifier.height(18.dp))
                                 Text(book.title, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = CoffeeDark, textAlign = TextAlign.Center, modifier = Modifier.padding(bottom = 6.dp))

                                 if (book.authors.isNotEmpty()) {
                                     val author = book.authors.first()
                                     val fullName = listOfNotNull(author.name, author.middleName, author.lastName).joinToString(" ")
                                     Text("Autor: $fullName", fontSize = 16.sp, color = OrangeSunset, modifier = Modifier.padding(bottom = 4.dp))
                                 }

                                 if (book.genres.isNotEmpty()) {
                                     Text("Género: ${book.genres.first().name}", fontSize = 15.sp, color = TerracottaRed, modifier = Modifier.padding(bottom = 4.dp))
                                 }

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
                     }

                     // ACCIONES: Leer / Favoritos
                     item {
                         Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                             if (!book.pdfUrl.isNullOrEmpty()) {
                                 Button(
                                     onClick = { onOpenPdf(book.pdfUrl!!, book.title) },
                                     Modifier.weight(1f).height(48.dp),
                                     shape = RoundedCornerShape(12.dp),
                                     colors = ButtonDefaults.buttonColors(containerColor = YellowSolar)
                                 ) {
                                     Icon(Icons.Filled.MenuBook, null, Modifier.size(18.dp), tint = CoffeeDark)
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
                                     Icon(Icons.Filled.Favorite, null, Modifier.size(18.dp), tint = Color.White)
                                     Spacer(Modifier.width(6.dp))
                                     Text("Favoritos", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                                 }
                             }
                         }
                     }

                     // FORMULARIO DE RESEÑAS
                     item {
                         Card(
                             modifier = Modifier.fillMaxWidth(),
                             colors = CardDefaults.cardColors(containerColor = Color.White),
                             shape = RoundedCornerShape(10.dp),
                             elevation = CardDefaults.cardElevation(2.dp)
                         ) {
                             Column(Modifier.padding(12.dp)) {
                                 Text("Tu calificación", color = CoffeeDark)
                                 Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                     (1..5).forEach { star ->
                                         val selected = uiState.reviewFormRating >= star
                                         IconButton(
                                             onClick = { viewModel.updateReviewFormRating(star) },
                                             modifier = Modifier
                                                 .size(50.dp)
                                                 .background(
                                                     color = if (selected) YellowSolar else HoneySoft,
                                                     shape = RoundedCornerShape(8.dp)
                                                 )
                                         ) {
                                             Icon(
                                                 imageVector = Icons.Filled.WbSunny,
                                                 contentDescription = "Calificación $star",
                                                 tint = if (selected) CoffeeDark else CoffeeDark.copy(alpha = 0.6f)
                                             )
                                         }
                                     }
                                 }
                                 Spacer(Modifier.height(8.dp))
                                 OutlinedTextField(
                                     value = uiState.reviewFormComment,
                                     onValueChange = { viewModel.updateReviewFormComment(it) },
                                     label = { Text("Comentario") },
                                     modifier = Modifier.fillMaxWidth(),
                                     singleLine = false,
                                     maxLines = 3
                                 )
                                 Spacer(Modifier.height(8.dp))
                                 Row(horizontalArrangement = Arrangement.End, modifier = Modifier.fillMaxWidth()) {
                                     if (uiState.isEditingReviewId != null) {
                                         TextButton(onClick = {
                                             // cancelar edición: restablecer formulario correctamente
                                             viewModel.cancelEditing()
                                             viewModel.clearError()
                                         }) {
                                             Text("Cancelar")
                                         }
                                     }
                                     Button(
                                         onClick = {
                                             val editingId = uiState.isEditingReviewId
                                             if (editingId != null) {
                                                 viewModel.updateReview(editingId, uiState.reviewFormRating, uiState.reviewFormComment)
                                             } else {
                                                 viewModel.postReview(bookId, uiState.reviewFormRating, uiState.reviewFormComment)
                                             }
                                         },
                                         enabled = !uiState.isPostingReview
                                     ) {
                                         if (uiState.isPostingReview) CircularProgressIndicator(modifier = Modifier.size(16.dp), color = Color.White)
                                         else Text(if (uiState.isEditingReviewId != null) "Actualizar reseña" else "Enviar reseña")
                                     }
                                 }
                             }
                         }
                     }

                     // LISTA DE RESEÑAS
                     if (uiState.isLoadingReviews) {
                         item {
                             Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                                 CircularProgressIndicator(color = YellowSolar)
                             }
                         }
                     } else {
                         if (uiState.reviews.isEmpty()) {
                             item {
                                 Text("Aún no hay reseñas. Sé el primero en escribir una.", color = GrayBrown)
                             }
                         } else {
                             items(uiState.reviews) { review ->
                                 Card(
                                     modifier = Modifier.fillMaxWidth(),
                                     colors = CardDefaults.cardColors(containerColor = Color.White),
                                     shape = RoundedCornerShape(8.dp)
                                 ) {
                                     Row(Modifier.padding(12.dp), verticalAlignment = Alignment.Top) {
                                         Column(Modifier.weight(1f)) {
                                             Text("${review.userFirstName}", fontWeight = FontWeight.SemiBold, color = CoffeeDark)
                                             Text("Calificación: ${review.rating}", color = OrangeSunset)
                                             Spacer(Modifier.height(4.dp))
                                             Text(review.comment, color = CoffeeDark)
                                             Spacer(Modifier.height(6.dp))
                                             Text(review.createdAt, color = GrayBrown, fontSize = 12.sp)
                                         }
                                         // Mostrar botones siempre; manejar permisos en onClick mostrando snackbar si no es propietario
                                         Column(horizontalAlignment = Alignment.End) {
                                             IconButton(
                                                 onClick = {
                                                     if (review.userId == currentUserId) {
                                                         showEditDialogReview = review
                                                     } else {
                                                         coroutineScope.launch { snackbarHostState.showSnackbar("No puedes editar reseñas de otros usuarios") }
                                                     }
                                                 }
                                             ) {
                                                 Icon(
                                                     Icons.Filled.Edit,
                                                     contentDescription = "Editar",
                                                     tint = if (review.userId == currentUserId) LocalContentColor.current else LocalContentColor.current.copy(alpha = 0.4f)
                                                 )
                                             }
                                             IconButton(
                                                 onClick = {
                                                     if (review.userId == currentUserId) {
                                                         showDeleteDialogReviewId = review.id
                                                     } else {
                                                         coroutineScope.launch { snackbarHostState.showSnackbar("No puedes eliminar reseñas de otros usuarios") }
                                                     }
                                                 }
                                             ) {
                                                 Icon(
                                                     Icons.Filled.Delete,
                                                     contentDescription = "Eliminar",
                                                     tint = if (review.userId == currentUserId) LocalContentColor.current else LocalContentColor.current.copy(alpha = 0.4f)
                                                 )
                                             }
                                         }
                                     }
                                 }
                             }
                         }

                         // Paginación simple
                         item {
                             if (uiState.reviewsPage + 1 < uiState.reviewsTotalPages) {
                                 Spacer(Modifier.height(8.dp))
                                 Button(onClick = {
                                     val next = uiState.reviewsPage + 1
                                     viewModel.loadReviews(bookId, next, uiState.reviewsSize)
                                 }, modifier = Modifier.fillMaxWidth()) {
                                     Text("Cargar más")
                                 }
                             }
                         }
                     }
                 } // end LazyColumn

                 // Dialogo de confirmación de borrado: debe estar fuera del LazyColumn
                 showDeleteDialogReviewId?.let { reviewIdToDelete ->
                     AlertDialog(
                         onDismissRequest = { showDeleteDialogReviewId = null },
                         title = { Text("Eliminar reseña") },
                         text = { Text("¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer.") },
                         confirmButton = {
                             TextButton(onClick = {
                                 viewModel.deleteReview(reviewIdToDelete)
                                 // recargar reseñas después de borrar
                                 viewModel.loadReviews(bookId, 0, uiState.reviewsSize)
                                 showDeleteDialogReviewId = null
                             }) { Text("Eliminar") }
                         },
                         dismissButton = {
                             TextButton(onClick = { showDeleteDialogReviewId = null }) { Text("Cancelar") }
                         }
                     )
                 }

                 // Diálogo de edición de reseña (abre al pulsar Editar)
                 showEditDialogReview?.let { editingReview ->
                     AlertDialog(
                         onDismissRequest = { showEditDialogReview = null },
                         title = { Text("Editar reseña") },
                         text = {
                             Column {
                                 Text("Calificación", color = CoffeeDark)
                                 Spacer(Modifier.height(6.dp))
                                 Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                     (1..5).forEach { s ->
                                         val selected = editDialogRating >= s
                                         IconButton(
                                             onClick = { editDialogRating = s },
                                             modifier = Modifier
                                                 .size(50.dp)
                                                 .background(color = if (selected) YellowSolar else HoneySoft, shape = RoundedCornerShape(8.dp))
                                         ) {
                                             Icon(Icons.Filled.WbSunny, contentDescription = "Cal $s", tint = if (selected) CoffeeDark else CoffeeDark.copy(alpha = 0.6f))
                                         }
                                     }
                                 }
                                 Spacer(Modifier.height(8.dp))
                                 OutlinedTextField(
                                     value = editDialogComment,
                                     onValueChange = { editDialogComment = it },
                                     label = { Text("Comentario") },
                                     modifier = Modifier.fillMaxWidth(),
                                     singleLine = false,
                                     maxLines = 4
                                 )
                             }
                         },
                         confirmButton = {
                             TextButton(onClick = {
                                 // llamar a viewModel.updateReview y recargar reseñas
                                 viewModel.updateReview(editingReview.id, editDialogRating, editDialogComment)
                                 // recargar página 0 para reflejar cambios
                                 viewModel.loadReviews(bookId, 0, uiState.reviewsSize)
                                 showEditDialogReview = null
                             }) { Text("Guardar") }
                         },
                         dismissButton = {
                             TextButton(onClick = { showEditDialogReview = null }) { Text("Cancelar") }
                         }
                     )
                 }
             } // end book?.let
         } // end else
    } // end Scaffold
 }
}
