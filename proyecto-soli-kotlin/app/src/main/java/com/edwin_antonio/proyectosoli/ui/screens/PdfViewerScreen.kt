package com.edwin_antonio.proyectosoliv1.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.Color
import com.edwin_antonio.proyectosoliv1.ui.theme.*
import com.edwin_antonio.proyectosoliv1.ui.components.NativePdfViewer
import java.io.File
import java.net.URL
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PdfViewerScreen(
    pdfUrl: String,
    bookTitle: String,
    onBack: () -> Unit
) {
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var pdfFile by remember { mutableStateOf<File?>(null) }
    val context = LocalContext.current
    
    // Log para debug
    LaunchedEffect(pdfUrl) {
        println("📝 PdfViewer: URL original: $pdfUrl")
        println("📝 PdfViewer: Título: $bookTitle")
    }
    
    // Descargar PDF desde URL
    LaunchedEffect(pdfUrl) {
        if (pdfUrl.isNotEmpty() && (pdfUrl.startsWith("http://") || pdfUrl.startsWith("https://"))) {
            try {
                isLoading = true
                errorMessage = null
                
                withContext(Dispatchers.IO) {
                    val url = URL(pdfUrl)
                    val fileName = "temp_pdf_${System.currentTimeMillis()}.pdf"
                    val file = File(context.cacheDir, fileName)
                    
                    println("📥 Descargando PDF desde: $pdfUrl")
                    url.openStream().use { input ->
                        file.outputStream().use { output ->
                            input.copyTo(output)
                        }
                    }
                    println("✅ PDF descargado: ${file.absolutePath} (${file.length()} bytes)")
                    pdfFile = file
                }
                
                isLoading = false
            } catch (e: Exception) {
                println("❌ Error descargando PDF: ${e.message}")
                isLoading = false
                errorMessage = "Error al cargar PDF: ${e.message}"
            }
        } else {
            println("❌ URL de PDF inválida: $pdfUrl")
            errorMessage = "URL de PDF inválida"
            isLoading = false
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        // 🌅 Header con gradiente - igual que DetailsScreen
        TopAppBar(
            title = { 
                Text(
                    text = bookTitle,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = CoffeeDark,
                    maxLines = 1
                )
            },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Volver",
                        tint = CoffeeDark
                    )
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = YellowSolar
            )
        )

        // 📄 Contenido principal - Visor PDF nativo personalizado
        pdfFile?.let { file ->
            NativePdfViewer(
                pdfFile = file,
                modifier = Modifier.fillMaxSize()
            )
        }
        
        if (pdfFile == null && errorMessage == null && !isLoading) {
            // Mostrar mensaje de carga si no hay archivo ni error
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Preparando PDF...",
                    color = CoffeeDark,
                    fontSize = 16.sp
                )
            }
        }
        
        // Overlay de loading
        if (isLoading) {
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
                        text = "Cargando PDF...",
                        color = CoffeeDark,
                        fontSize = 16.sp
                    )
                }
            }
        }
        
        // Overlay de error
        errorMessage?.let { error ->
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(32.dp)
                ) {
                    Text(
                        text = "Error al cargar PDF",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                    Text(
                        text = error,
                        color = CoffeeDark,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                    Button(
                        onClick = {
                            // Reintentar descarga del PDF
                            isLoading = true
                            errorMessage = null
                            pdfFile = null
                        }
                    ) {
                        Text("Reintentar")
                    }
                }
            }
        }
    }
}
