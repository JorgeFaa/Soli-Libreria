package com.edwin_antonio.proyectosoli

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import com.edwin_antonio.proyectosoli.navigation.AppNavHost

@Composable
fun App() {
    MaterialTheme {
        Surface {
            AppNavHost()
        }
    }
}
