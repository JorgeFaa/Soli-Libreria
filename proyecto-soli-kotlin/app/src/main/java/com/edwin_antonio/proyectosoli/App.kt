package com.edwin_antonio.proyectosoliv1

import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import com.edwin_antonio.proyectosoliv1.navigation.AppNavHost
import com.edwin_antonio.proyectosoliv1.ui.theme.SoliPruebaTheme

@Composable
fun App() {
    SoliPruebaTheme {
        Surface {
            AppNavHost()
        }
    }
}
