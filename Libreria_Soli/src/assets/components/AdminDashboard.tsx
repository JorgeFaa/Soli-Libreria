import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

// Importar servicios de autenticación
import { getCurrentUserRoles, isCurrentUserAdmin, logoutUser } from '../../services/authService';
import { decodeJWT } from '../../utils/jwtUtils';

// Importar sistema de Toast
import Toast from "./Toast";

interface DashboardStats {
  totalUsers: number;
  totalBooks: number;
  totalGenres: number;
  activeReaders: number;
}

interface ActivityItem {
  id: string;
  icon: string;
  text: string;
  time: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // Estados para manejo del dashboard
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState({ name: "", roles: [] as string[] });
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBooks: 0,
    totalGenres: 0,
    activeReaders: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  
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
      
      // Datos simulados para el prototipo
      // En producción, estos vendrían de endpoints reales
      setStats({
        totalUsers: 245,
        totalBooks: 1892,
        totalGenres: 9,
        activeReaders: 78
      });

      setRecentActivity([
        {
          id: '1',
          icon: '👤',
          text: 'Nuevo usuario registrado: juan.perez@email.com',
          time: 'Hace 5 minutos'
        },
        {
          id: '2',
          icon: '📚',
          text: 'Libro "Cien años de soledad" añadido al catálogo',
          time: 'Hace 20 minutos'
        },
        {
          id: '3',
          icon: '⭐',
          text: 'María González agregó 3 libros a favoritos',
          time: 'Hace 1 hora'
        },
        {
          id: '4',
          icon: '🏷️',
          text: 'Nuevo género "Ciencia Ficción" creado',
          time: 'Hace 2 horas'
        }
      ]);

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

        {/* Estadísticas del sistema */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <h3>👥 Total de Usuarios</h3>
            <div className="admin-stat-value">{stats.totalUsers}</div>
            <p className="admin-stat-description">Usuarios registrados en el sistema</p>
          </div>
          
          <div className="admin-stat-card">
            <h3>📚 Total de Libros</h3>
            <div className="admin-stat-value">{stats.totalBooks}</div>
            <p className="admin-stat-description">Libros en el catálogo</p>
          </div>
          
          <div className="admin-stat-card">
            <h3>🏷️ Géneros Literarios</h3>
            <div className="admin-stat-value">{stats.totalGenres}</div>
            <p className="admin-stat-description">Categorías disponibles</p>
          </div>
          
          <div className="admin-stat-card">
            <h3>📖 Lectores Activos</h3>
            <div className="admin-stat-value">{stats.activeReaders}</div>
            <p className="admin-stat-description">Usuarios activos este mes</p>
          </div>
        </div>

        {/* Panel de acciones rápidas */}
        <div className="admin-actions-panel">
          <h2 className="admin-actions-title">Acciones Rápidas</h2>
          <div className="admin-actions-grid">
            
            <Link to="/admin/users" className="admin-action-btn">
              <span className="admin-action-icon">👥</span>
              <span className="admin-action-text">Gestionar Usuarios</span>
            </Link>
            
            <Link to="/admin/books" className="admin-action-btn">
              <span className="admin-action-icon">📚</span>
              <span className="admin-action-text">Gestionar Libros</span>
            </Link>
            
            <Link to="/admin/genres" className="admin-action-btn">
              <span className="admin-action-icon">🏷️</span>
              <span className="admin-action-text">Gestionar Géneros</span>
            </Link>
            
            <Link to="/admin/reports" className="admin-action-btn">
              <span className="admin-action-icon">📊</span>
              <span className="admin-action-text">Ver Reportes</span>
            </Link>
            
            <Link to="/admin/settings" className="admin-action-btn">
              <span className="admin-action-icon">⚙️</span>
              <span className="admin-action-text">Configuración</span>
            </Link>
            
            <Link to="/admin/backup" className="admin-action-btn">
              <span className="admin-action-icon">💾</span>
              <span className="admin-action-text">Respaldos</span>
            </Link>
            
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="admin-activity-panel">
          <h2 className="admin-activity-title">Actividad Reciente</h2>
          <div className="admin-activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="admin-activity-item">
                <span className="admin-activity-icon">{activity.icon}</span>
                <div className="admin-activity-content">
                  <p className="admin-activity-text">{activity.text}</p>
                  <p className="admin-activity-time">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

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