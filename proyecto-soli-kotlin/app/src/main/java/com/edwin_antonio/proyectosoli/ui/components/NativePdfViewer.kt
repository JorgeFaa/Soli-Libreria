package com.edwin_antonio.proyectosoliv1.ui.components

import android.content.Context
import android.graphics.Bitmap
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ZoomIn
import androidx.compose.material.icons.filled.ZoomOut
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.edwin_antonio.proyectosoliv1.ui.theme.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

@Composable
fun NativePdfViewer(
    pdfFile: File,
    modifier: Modifier = Modifier
) {
    var pages by remember { mutableStateOf<List<Bitmap>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var currentZoom by remember { mutableFloatStateOf(1f) }
    val context = LocalContext.current

    LaunchedEffect(pdfFile) {
        try {
            isLoading = true
            errorMessage = null
            
            withContext(Dispatchers.IO) {
                val renderedPages = renderPdfPages(context, pdfFile, currentZoom)
                pages = renderedPages
            }
            
            isLoading = false
        } catch (e: Exception) {
            println("❌ Error renderizando PDF: ${e.message}")
            errorMessage = "Error al mostrar PDF: ${e.message}"
            isLoading = false
        }
    }

    LaunchedEffect(currentZoom) {
        if (pages.isNotEmpty()) {
            try {
                withContext(Dispatchers.IO) {
                    val renderedPages = renderPdfPages(context, pdfFile, currentZoom)
                    pages = renderedPages
                }
            } catch (e: Exception) {
                println("❌ Error re-renderizando PDF: ${e.message}")
            }
        }
    }

    Column(modifier = modifier.fillMaxSize()) {
        // Controles de zoom
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
                .background(
                    color = Color.Black.copy(alpha = 0.1f),
                    shape = RoundedCornerShape(8.dp)
                )
                .padding(8.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { 
                    if (currentZoom > 0.5f) currentZoom -= 0.25f 
                }
            ) {
                Icon(
                    imageVector = Icons.Default.ZoomOut,
                    contentDescription = "Zoom Out",
                    tint = CoffeeDark
                )
            }
            
            Text(
                text = "${(currentZoom * 100).toInt()}%",
                modifier = Modifier.padding(horizontal = 16.dp),
                color = CoffeeDark,
                fontWeight = FontWeight.Medium
            )
            
            IconButton(
                onClick = { 
                    if (currentZoom < 3f) currentZoom += 0.25f 
                }
            ) {
                Icon(
                    imageVector = Icons.Default.ZoomIn,
                    contentDescription = "Zoom In",
                    tint = CoffeeDark
                )
            }
        }

        // Contenido del PDF
        when {
            isLoading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator(color = YellowSolar)
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Renderizando PDF...",
                            color = CoffeeDark,
                            fontSize = 16.sp
                        )
                    }
                }
            }
            
            errorMessage != null -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(32.dp)
                    ) {
                        Text(
                            text = "Error al mostrar PDF",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.error,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        Text(
                            text = errorMessage!!,
                            color = CoffeeDark,
                            modifier = Modifier.padding(bottom = 16.dp)
                        )
                        Button(
                            onClick = { 
                                isLoading = true
                                errorMessage = null
                            }
                        ) {
                            Text("Reintentar")
                        }
                    }
                }
            }
            
            pages.isNotEmpty() -> {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(8.dp)
                ) {
                    itemsIndexed(pages) { index, bitmap ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .wrapContentHeight(),
                            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(8.dp)
                            ) {
                                Text(
                                    text = "Página ${index + 1}",
                                    fontSize = 12.sp,
                                    color = CoffeeDark.copy(alpha = 0.7f),
                                    modifier = Modifier.padding(bottom = 4.dp)
                                )
                                Image(
                                    bitmap = bitmap.asImageBitmap(),
                                    contentDescription = "Página ${index + 1}",
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .wrapContentHeight()
                                )
                            }
                        }
                    }
                }
            }
            
            else -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No se pudo cargar el PDF",
                        color = CoffeeDark,
                        fontSize = 16.sp
                    )
                }
            }
        }
    }
}

private suspend fun renderPdfPages(context: Context, pdfFile: File, zoom: Float): List<Bitmap> {
    return withContext(Dispatchers.IO) {
        val pages = mutableListOf<Bitmap>()
        
        try {
            val fileDescriptor = ParcelFileDescriptor.open(pdfFile, ParcelFileDescriptor.MODE_READ_ONLY)
            val pdfRenderer = PdfRenderer(fileDescriptor)
            
            for (i in 0 until pdfRenderer.pageCount) {
                val page = pdfRenderer.openPage(i)
                
                // Calcular dimensiones basadas en el zoom
                val width = (page.width * zoom).toInt()
                val height = (page.height * zoom).toInt()
                
                val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                bitmap.eraseColor(android.graphics.Color.WHITE)
                
                page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
                pages.add(bitmap)
                
                page.close()
                
                println("✅ Renderizada página ${i + 1}/${pdfRenderer.pageCount} - ${width}x${height}")
            }
            
            pdfRenderer.close()
            fileDescriptor.close()
            
        } catch (e: Exception) {
            println("❌ Error renderizando páginas: ${e.message}")
            throw e
        }
        
        pages
    }
}