package com.edwin_antonio.proyectosoli

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent

class KotlinMainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            App()
        }
    }
}
