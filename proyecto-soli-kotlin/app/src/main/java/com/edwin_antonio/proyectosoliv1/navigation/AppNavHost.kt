package com.edwin_antonio.proyectosoliv1.navigation

import android.content.Context
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.edwin_antonio.proyectosoliv1.auth.TokenManager
import com.edwin_antonio.proyectosoliv1.repository.AuthRepository
import com.edwin_antonio.proyectosoliv1.viewmodel.AuthViewModel
import com.edwin_antonio.proyectosoliv1.viewmodel.ProfileViewModel
import com.edwin_antonio.proyectosoliv1.ui.screens.BooksScreen
import com.edwin_antonio.proyectosoliv1.ui.screens.DetailsScreen
import com.edwin_antonio.proyectosoliv1.ui.screens.EmailVerificationScreen
import com.edwin_antonio.proyectosoliv1.ui.screens.FavoriteScreen
import com.edwin_antonio.proyectosoliv1.ui.screens.HomeScreen
import com.edwin_antonio.proyectosoliv1.ui.screens.LoginScreen
import com.edwin_antonio.proyectosoliv1.ui.screens.PdfViewerScreen
import com.edwin_antonio.proyectosoliv1.ui.screens.ProfileScreen
import com.edwin_antonio.proyectosoliv1.ui.screens.RegisterScreen
import com.edwin_antonio.proyectosoliv1.ui.screens.SplashScreen
import com.edwin_antonio.proyectosoliv1.ui.screens.UserProfileSetupScreen

@Composable
fun AppNavHost() {
    val context = LocalContext.current
    val navController = rememberNavController()
    
    // Inicializar dependencias de autenticación
    val tokenManager = remember { TokenManager(context) }
    val authRepository = remember { AuthRepository(tokenManager) }
    val authViewModel: AuthViewModel = viewModel { AuthViewModel(authRepository) }
    val profileViewModel: ProfileViewModel = viewModel(factory = ProfileViewModel.Factory(tokenManager))
    
    // Observar estado de autenticación
    val authState by authViewModel.uiState.collectAsState()
    val isLoggedIn = authState.isLoggedIn
    
    // Determinar la pantalla inicial basada en el estado de autenticación
    val startDestination = if (isLoggedIn) Screen.Home.route else Screen.Splash.route
    
    NavHost(navController = navController, startDestination = startDestination) {
        composable(Screen.Splash.route) {
            SplashScreen(onSplashFinished = {
                navController.navigate(Screen.Login.route) {
                    popUpTo(Screen.Splash.route) { inclusive = true }
                }
            })
        }
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = { 
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onGoToProfileSetup = {
                    navController.navigate(Screen.UserProfileSetup.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onGoToRegister = { navController.navigate(Screen.Register.route) },
                authViewModel = authViewModel
            )
        }
        composable(Screen.Register.route) {
            RegisterScreen(
                onRegistered = { navController.navigate(Screen.EmailVerification.route) },
                onBack = { navController.popBackStack() },
                tokenManager = tokenManager
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
        composable(Screen.UserProfileSetup.route) {
            UserProfileSetupScreen(
                onProfileSetupComplete = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.UserProfileSetup.route) { inclusive = true }
                    }
                },
                tokenManager = tokenManager
            )
        }
        composable(Screen.Home.route) {
            HomeScreen(
                onOpenBooks = { navController.navigate(Screen.Books.route) },
                onOpenFavorites = { navController.navigate(Screen.Favorite.route) },
                onOpenProfile = { navController.navigate(Screen.Profile.route) },
                onBookClick = { bookId -> navController.navigate(Screen.Details.createRoute(bookId)) },
                onLogout = { 
                    authViewModel.logout()
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                },
                tokenManager = tokenManager
            )
        }
        composable(Screen.Profile.route) {
            ProfileScreen(
                profileViewModel = profileViewModel,
                onNavigateBack = { navController.popBackStack() },
                onBookClick = { bookId -> navController.navigate(Screen.Details.createRoute(bookId)) }
            )
        }
        composable(Screen.Favorite.route) {
            FavoriteScreen(onBack = { navController.popBackStack() })
        }
        composable(Screen.Books.route) {
            BooksScreen(
                onBookClick = { id -> navController.navigate(Screen.Details.createRoute(id)) },
                onBack = { navController.popBackStack() },
                tokenManager = tokenManager
            )
        }
        composable(
            route = Screen.Details.route,
            arguments = listOf(navArgument("bookId") { type = NavType.StringType })
        ) {
            val id = it.arguments?.getString("bookId").orEmpty()
            DetailsScreen(
                bookId = id, 
                onBack = { navController.popBackStack() },
                onOpenPdf = { pdfUrl, bookTitle ->
                    navController.navigate(Screen.PdfViewer.createRoute(pdfUrl, bookTitle))
                },
                tokenManager = tokenManager
            )
        }
        
        composable(
            route = Screen.PdfViewer.route,
            arguments = listOf(
                navArgument("pdfUrl") { type = NavType.StringType },
                navArgument("bookTitle") { type = NavType.StringType }
            )
        ) {
            val pdfUrl = java.net.URLDecoder.decode(it.arguments?.getString("pdfUrl").orEmpty(), "UTF-8")
            val bookTitle = java.net.URLDecoder.decode(it.arguments?.getString("bookTitle").orEmpty(), "UTF-8")
            PdfViewerScreen(
                pdfUrl = pdfUrl,
                bookTitle = bookTitle,
                onBack = { navController.popBackStack() }
            )
        }
    }
}
