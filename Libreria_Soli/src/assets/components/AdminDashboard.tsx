import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

// Importar servicios de autenticación
import { getCurrentUserRoles, isCurrentUserAdmin, logoutUser } from '../../services/authService';
import { decodeJWT } from '../../utils/jwtUtils';

// Importar sistema de Toast
import Toast from "./Toast";

// Importar gestores específicos
import TextTypesManager from "./TextTypesManager";
import GenresManager from "./GenresManager";
import EditorialsManager from "./EditorialsManager";
import CountriesManager from "./CountriesManager";
import BooksManager from "./BooksManager";
import AuthorsManager from "./AuthorsManager";
import UsersManager from "./UsersManager";

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // Estados para manejo del dashboard
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<string>('dashboard'); // 'dashboard', 'text-types', 'genres', 'editorials', 'countries', 'books', 'authors', 'users'
  const [userInfo, setUserInfo] = useState({ name: "", roles: [] as string[] });
  
  // Estados para Toast
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");
  const [showToast, setShowToast] = useState<boolean>(false);

  // Función para mostrar notificaciones
  const showNotification = (message: string, type: "success" | "error" | "warning") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Verificar permisos de administrador
  useEffect(() => {
    const checkAdminAccess = () => {
      if (!isCurrentUserAdmin()) {
        showNotification("No tienes permisos de administrador", "error");
        setTimeout(() => navigate('/'), 2000);
        return false;
      }
      return true;
    };

    if (!checkAdminAccess()) {
      return;
    }

    // Obtener información del usuario
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = decodeJWT(token);
      if (decodedToken) {
        setUserInfo({
          name: decodedToken.username || 'Administrador',
          roles: getCurrentUserRoles()
        });
      }
    }

    loadDashboardData();
  }, [navigate]);

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      showNotification("Error al cargar datos del dashboard", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      showNotification("Sesión cerrada exitosamente", "success");
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      showNotification("Error al cerrar sesión", "error");
    }
  };

  if (isLoading) {
    return (
      <section className="admin-dashboard-section">
        <div className="admin-dashboard-container">
          <div className="admin-loading">
            <div className="loading-spinner"></div>
            <p>Cargando dashboard de administración...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-dashboard-section">
      <div className="admin-dashboard-container">
        
        {/* Header del dashboard */}
        <div className="admin-dashboard-header">
          <div className="admin-dashboard-title">
            <h1>🛠️ Panel de Administración</h1>
            <span className="admin-badge">ADMIN</span>
          </div>
          <div className="admin-user-info">
            <span>Bienvenido, {userInfo.name}</span>
            <button onClick={handleLogout} className="admin-logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Navegación entre vistas */}
        <div className="admin-nav-tabs">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`admin-nav-tab ${currentView === 'dashboard' ? 'active' : ''}`}
          >
            📊 Dashboard Principal
          </button>
          <button
            onClick={() => setCurrentView('text-types')}
            className={`admin-nav-tab ${currentView === 'text-types' ? 'active' : ''}`}
          >
            🏷️ Tipos de Texto
          </button>
          <button
            onClick={() => setCurrentView('genres')}
            className={`admin-nav-tab ${currentView === 'genres' ? 'active' : ''}`}
          >
            📚 Géneros
          </button>
          <button
            onClick={() => setCurrentView('editorials')}
            className={`admin-nav-tab ${currentView === 'editorials' ? 'active' : ''}`}
          >
            🏢 Editoriales
          </button>
          <button
            onClick={() => setCurrentView('countries')}
            className={`admin-nav-tab ${currentView === 'countries' ? 'active' : ''}`}
          >
            🌍 Países
          </button>
          <button
            onClick={() => setCurrentView('books')}
            className={`admin-nav-tab ${currentView === 'books' ? 'active' : ''}`}
          >
            📚 Libros
          </button>
          <button
            onClick={() => setCurrentView('authors')}
            className={`admin-nav-tab ${currentView === 'authors' ? 'active' : ''}`}
          >
            👤 Autores
          </button>
          <button
            onClick={() => setCurrentView('users')}
            className={`admin-nav-tab ${currentView === 'users' ? 'active' : ''}`}
          >
            👥 Usuarios
          </button>
        </div>

        {/* Contenido según vista seleccionada */}
        {currentView === 'dashboard' && (
          <>
            {/* Panel de acciones rápidas */}
            <div className="admin-actions-panel">
              <h2 className="admin-actions-title">Acciones Rápidas</h2>
              <div className="admin-actions-grid">
                
                <button 
                  onClick={() => setCurrentView('text-types')}
                  className="admin-action-btn"
                >
                  <span className="admin-action-icon">🏷️</span>
                  <span className="admin-action-text">Tipos de Texto</span>
                </button>
                
                <button 
                  onClick={() => setCurrentView('genres')}
                  className="admin-action-btn"
                >
                  <span className="admin-action-icon">📚</span>
                  <span className="admin-action-text">Gestionar Géneros</span>
                </button>
                
                <button 
                  onClick={() => setCurrentView('editorials')}
                  className="admin-action-btn"
                >
                  <span className="admin-action-icon">🏢</span>
                  <span className="admin-action-text">Gestionar Editoriales</span>
                </button>
                
                <button 
                  onClick={() => setCurrentView('countries')}
                  className="admin-action-btn"
                >
                  <span className="admin-action-icon">🌍</span>
                  <span className="admin-action-text">Gestionar Países</span>
                </button>
                
                <button 
                  onClick={() => setCurrentView('books')}
                  className="admin-action-btn"
                >
                  <span className="admin-action-icon">📚</span>
                  <span className="admin-action-text">Gestionar Libros</span>
                </button>
                
                <button 
                  onClick={() => setCurrentView('authors')}
                  className="admin-action-btn"
                >
                  <span className="admin-action-icon">👤</span>
                  <span className="admin-action-text">Gestionar Autores</span>
                </button>
                
                <button 
                  onClick={() => setCurrentView('users')}
                  className="admin-action-btn"
                >
                  <span className="admin-action-icon">👥</span>
                  <span className="admin-action-text">Gestionar Usuarios</span>
                </button>
                
              </div>
            </div>
          </>
        )}

        {/* Vista de gestión de tipos de texto */}
        {currentView === 'text-types' && (
          <TextTypesManager />
        )}

        {/* Vista de gestión de géneros */}
        {currentView === 'genres' && (
          <GenresManager />
        )}

        {/* Vista de gestión de editoriales */}
        {currentView === 'editorials' && (
          <EditorialsManager />
        )}

        {/* Vista de gestión de países */}
        {currentView === 'countries' && (
          <CountriesManager />
        )}

        {/* Vista de gestión de libros */}
        {currentView === 'books' && (
          <BooksManager />
        )}

        {/* Vista de gestión de autores */}
        {currentView === 'authors' && (
          <AuthorsManager />
        )}

        {/* Vista de gestión de usuarios */}
        {currentView === 'users' && (
          <UsersManager />
        )}

        {/* Navegación */}
        <div className="admin-navigation">
          <Link to="/perfil" className="admin-back-link">
            ← Volver a mi perfil
          </Link>
        </div>
      </div>

      {/* Toast de notificaciones */}
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          isVisible={showToast}
          onClose={() => setShowToast(false)} 
        />
      )}
    </section>
  );
}