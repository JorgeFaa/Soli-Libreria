package com.edwin_antonio.proyectosoliv1.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider

class EmailVerificationViewModelFactory(private val username: String) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(EmailVerificationViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return EmailVerificationViewModel(username) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
