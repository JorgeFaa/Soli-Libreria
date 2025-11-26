import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './assets/components/Header'
import Hero from './assets/components/Hero'
import Catalogo from './assets/components/Catalogo'
import Nosotros from './assets/components/Nosotros'
import AppPromo from './assets/components/AppPromo'
import Libreria from './assets/components/Libreria'
import LibroDetalle from './assets/components/LibroDetalle'
import Login from './assets/components/Login'
import Registro from './assets/components/Registro'
import VerificarCodigo from './assets/components/VerificarCodigo'
import ForgotPassword from './assets/components/ForgotPassword'
import ResetPassword from './assets/components/ResetPassword'
import Perfil from './assets/components/Perfil'
import CuestionarioPerfil from './assets/components/CuestionarioPerfil'
import AdminDashboard from './assets/components/AdminDashboard'
import { ProtectedAdminRoute, ProtectedRoute } from './components/ProtectedRoute'

// Importar servicios de autenticación
import { isUserAuthenticated, logoutUser, needsProfileCompletionFromServer, isCurrentUserAdmin, } from './services/authService'

// Importar hook para refresh automático de tokens
import useAuthRefresh from './hooks/useAuthRefresh'

import './App.css'

// Página principal con Hero, Catálogo, Nosotros, AppPromo y Contacto
function HomePage() {
  return (
    <>
      <Hero />
      <Catalogo />
      <Nosotros />
      <AppPromo />
    </>
  );
}

function App() {
  // Estado global de autenticación
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showProfileQuestionnaire, setShowProfileQuestionnaire] = useState<boolean>(false);

  // Inicializar refresh automático de tokens
  useAuthRefresh();

  // Verificar sesión al cargar la app
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        
        // Verificar autenticación completa (incluye conectividad y validación server)
        const isLoggedIn = await isUserAuthenticated();
        
        if (isLoggedIn) {
          setIsUserLoggedIn(true);
          
          // Verificar si necesita completar el perfil
          const needsQuestionnaire = await needsProfileCompletionFromServer();
          if (needsQuestionnaire) {
            setShowProfileQuestionnaire(true);
          }
        } else {
          setIsUserLoggedIn(false);
        }
      } catch (error) {
        console.error('❌ [App] Error verificando autenticación:', error);
        await logoutUser();
        setIsUserLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
    
    // Cleanup del monitor cuando el componente se desmonte
    return () => {
      // cleanupMonitor(); // Se ejecutará cuando el componente se desmonte
    };
  }, []);

  // Listeners para eventos de conectividad
  useEffect(() => {
    const handleServerDisconnected = (event: CustomEvent) => {
      console.warn('🚨 [App] Servidor desconectado:', event.detail.message);
      // Aquí puedes mostrar una notificación al usuario
      // Por ejemplo: toast, modal, banner, etc.
    };

    const handleSessionInvalidated = (event: CustomEvent) => {
      console.warn('🚨 [App] Sesión invalidada:', event.detail.message);
      // TEMPORALMENTE DESHABILITADO para evitar loops de invalidación
      // setIsUserLoggedIn(false);
      // setShowProfileQuestionnaire(false);
      console.log('⚠️ [App] Invalidación de sesión ignorada temporalmente para evitar loops');
    };

    // Agregar listeners
    window.addEventListener('serverDisconnected', handleServerDisconnected as EventListener);
    window.addEventListener('sessionInvalidated', handleSessionInvalidated as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('serverDisconnected', handleServerDisconnected as EventListener);
      window.removeEventListener('sessionInvalidated', handleSessionInvalidated as EventListener);
    };
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
          {/* Rutas individuales para cada sección */}
          <Route path="/libreria" element={<Libreria />} />
          <Route path="/nosotros" element={<Nosotros />} />
          {/* Ruta para detalles de libro */}
          <Route path="/libro/:id" element={<LibroDetalle />} />
          {/* Rutas de autenticación */}
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
            path="/forgot-password" 
            element={<ForgotPassword />}
          />
          <Route 
            path="/reset-password" 
            element={<ResetPassword />}
          />
          {/* Rutas protegidas */}
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
