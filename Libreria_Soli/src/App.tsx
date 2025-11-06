import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './assets/components/Header'
import Hero from './assets/components/Hero'
import Catalogo from './assets/components/Catalogo'
import Nosotros from './assets/components/Nosotros'
import AppPromo from './assets/components/AppPromo'
import Contacto from './assets/components/Contacto'
import Libreria from './assets/components/Libreria'
import LibroDetalle from './assets/components/LibroDetalle'
import Login from './assets/components/Login'
import Registro from './assets/components/Registro'
import VerificarCodigo from './assets/components/VerificarCodigo'
import Perfil from './assets/components/Perfil'
import CuestionarioPerfil from './assets/components/CuestionarioPerfil'
import AdminDashboard from './assets/components/AdminDashboard'
import { ProtectedAdminRoute, ProtectedRoute } from './components/ProtectedRoute'

// Importar servicios de autenticación
import { isAuthenticated, logoutUser, verifyToken, needsProfileCompletionFromServer, isCurrentUserAdmin } from './services/authService'

import './App.css'

// Página principal con Hero, Catálogo, Nosotros, AppPromo y Contacto
function HomePage() {
  return (
    <>
      <Hero />
      <Catalogo />
      <Nosotros />
      <AppPromo />
      <Contacto />
    </>
  );
}

function App() {
  // Estado global de autenticación
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showProfileQuestionnaire, setShowProfileQuestionnaire] = useState<boolean>(false);

  // Verificar sesión al cargar la app
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Verificar si hay token guardado
        if (isAuthenticated()) {
          // Verificar que el token sea válido con el servidor
          const isValidToken = await verifyToken();
          
          if (isValidToken) {
            setIsUserLoggedIn(true);
            
            // Verificar si necesita completar el perfil
            const needsQuestionnaire = await needsProfileCompletionFromServer();
            if (needsQuestionnaire) {
              setShowProfileQuestionnaire(true);
            }
          } else {
            // Token inválido, limpiar storage
            await logoutUser();
            setIsUserLoggedIn(false);
          }
        }
      } catch (error) {
        await logoutUser();
        setIsUserLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Función para manejar el login exitoso
  const handleLoginSuccess = async () => {
    setIsUserLoggedIn(true);
    
    // Verificar si necesita completar el perfil después del login
    const needsQuestionnaire = await needsProfileCompletionFromServer();
    if (needsQuestionnaire) {
      setShowProfileQuestionnaire(true);
    } else {
      // Solo redireccionar a los administradores al dashboard
      // Los lectores permanecen en la página actual
      if (isCurrentUserAdmin()) {
        window.location.href = '/admin'; // Redirigir a dashboard admin
      }
      // Los usuarios READER se quedan donde están (comportamiento original)
    }
  };

  // Función para manejar el logout
  const handleLogout = async () => {
    try {
      await logoutUser(); // Llamar al logout de la API
      setIsUserLoggedIn(false);
      setShowProfileQuestionnaire(false); // Ocultar cuestionario al hacer logout
    } catch (error) {
      // Incluso si falla la API, cambiar el estado local
      setIsUserLoggedIn(false);
      setShowProfileQuestionnaire(false);
    }
  };

  // Función para manejar cuando el usuario completa o salta el cuestionario
  const handleQuestionnaireComplete = () => {
    setShowProfileQuestionnaire(false);
  };

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#2c3e50',
        background: 'linear-gradient(135deg, #f4f1e8 0%, #e8dcc6 100%)'
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <>
      <Router>
        <Header 
          isUserLoggedIn={isUserLoggedIn} 
          onLogout={handleLogout}
        />
        <Routes>
          {/* Página principal */}
          <Route path="/" element={<HomePage />} />
          <Route path="/libreria" element={<Libreria />} />
          <Route path="/libro/:id" element={<LibroDetalle />} />
          <Route 
            path="/login" 
            element={<Login onLoginSuccess={handleLoginSuccess} />} 
          />
          <Route 
            path="/registro" 
            element={<Registro />}
          />
          <Route 
            path="/verificar-codigo" 
            element={<VerificarCodigo />}
          />
          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </Router>
      
      {/* Cuestionario de perfil modal - se muestra sobre el contenido */}
      {showProfileQuestionnaire && (
        <CuestionarioPerfil 
          onComplete={handleQuestionnaireComplete}
          onSkip={handleQuestionnaireComplete}
        />
      )}
    </>
  )
}

export default App
