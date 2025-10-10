package com.edwin_antonio.proyectosoli.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.edwin_antonio.proyectosoli.ui.screens.BooksScreen
import com.edwin_antonio.proyectosoli.ui.screens.DetailsScreen
import com.edwin_antonio.proyectosoli.ui.screens.EmailVerificationScreen
import com.edwin_antonio.proyectosoli.ui.screens.FavoriteScreen
import com.edwin_antonio.proyectosoli.ui.screens.HomeScreen
import com.edwin_antonio.proyectosoli.ui.screens.LoginScreen
import com.edwin_antonio.proyectosoli.ui.screens.RegisterScreen
import com.edwin_antonio.proyectosoli.ui.screens.SplashScreen

@Composable
fun AppNavHost() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = Screen.Splash.route) {
        composable(Screen.Splash.route) {
            SplashScreen(onDone = {
                navController.navigate(Screen.Login.route) {
                    popUpTo(Screen.Splash.route) { inclusive = true }
                }
            })
        }
        composable(Screen.Login.route) {
            LoginScreen(
                onLogin = { navController.navigate(Screen.Home.route) },
                onGoToRegister = { navController.navigate(Screen.Register.route) }
            )
        }
        composable(Screen.Register.route) {
            RegisterScreen(
                onRegistered = { navController.navigate(Screen.EmailVerification.route) },
                onBack = { navController.popBackStack() }
            )
        }
        composable(Screen.EmailVerification.route) {
            EmailVerificationScreen(
                onVerified = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }
        composable(Screen.Home.route) {
            HomeScreen(
                onOpenBooks = { navController.navigate(Screen.Books.route) },
                onOpenFavorites = { navController.navigate(Screen.Favorite.route) }
            )
        }
        composable(Screen.Favorite.route) {
            FavoriteScreen(onBack = { navController.popBackStack() })
        }
        composable(Screen.Books.route) {
            BooksScreen(
                onBookClick = { id -> navController.navigate(Screen.Details.createRoute(id)) },
                onBack = { navController.popBackStack() }
            )
        }
        composable(
            route = Screen.Details.route,
            arguments = listOf(navArgument("bookId") { type = NavType.StringType })
        ) {
            val id = it.arguments?.getString("bookId").orEmpty()
            DetailsScreen(bookId = id, onBack = { navController.popBackStack() })
        }
    }
}
