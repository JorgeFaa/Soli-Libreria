package com.edwin_antonio.proyectosoli.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Login : Screen("login")
    object Register : Screen("register")
    object EmailVerification : Screen("email_verification")
    object Home : Screen("home")
    object Favorite : Screen("favorite")
    object Books : Screen("books")
    object Details : Screen("details/{bookId}") {
        fun createRoute(bookId: String) = "details/$bookId"
    }
}
