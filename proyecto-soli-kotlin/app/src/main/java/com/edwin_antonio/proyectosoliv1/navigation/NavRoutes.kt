package com.edwin_antonio.proyectosoliv1.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Login : Screen("login")
    object Register : Screen("register")
    object EmailVerification : Screen("email_verification")
    object UserProfileSetup : Screen("user_profile_setup")
    object Profile : Screen("profile")
    object Home : Screen("home")
    object Favorite : Screen("favorite")
    object Books : Screen("books")
    object Details : Screen("details/{bookId}") {
        fun createRoute(bookId: String) = "details/$bookId"
    }
    
    object PdfViewer : Screen("pdfviewer/{pdfUrl}/{bookTitle}") {
        fun createRoute(pdfUrl: String, bookTitle: String): String {
            val encodedUrl = java.net.URLEncoder.encode(pdfUrl, "UTF-8")
            val encodedTitle = java.net.URLEncoder.encode(bookTitle, "UTF-8")
            return "pdfviewer/$encodedUrl/$encodedTitle"
        }
    }
}
