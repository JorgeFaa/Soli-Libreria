import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Perfil.css";

// Importar servicios de autenticación
import { getUserCompleteProfile } from '../../services/authService';
import type { UserCompleteProfile } from '../../services/authService';

// Importar servicios de libros para obtener géneros
import { getGenres } from '../../services/booksService';
import type { Genre } from '../../services/booksService';

// Importar sistema de Toast
import Toast from "./Toast";

export default function Perfil() {
  // Estados para manejar la edición del perfil
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  
  // Estados para Toast
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");
  const [showToast, setShowToast] = useState<boolean>(false);
  
  // Datos del perfil del usuario
  const [userProfile, setUserProfile] = useState<UserCompleteProfile | null>(null);
  
  // Géneros resueltos (nombres completos)
  const [resolvedGenres, setResolvedGenres] = useState<Genre[]>([]);
  
  // Datos de edición local (se inicializan con los datos del servidor)
  const [userInfo, setUserInfo] = useState({
    nombre: "",
    apellido: "",
  });

  // Función para mostrar notificaciones
  const showNotification = (message: string, type: "success" | "error" | "warning") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Función para resolver nombres de géneros a partir de IDs
  const resolveGenreNames = async (genreIds: number[]): Promise<Genre[]> => {
    try {
      const allGenres = await getGenres();
      const userGenres = allGenres.filter(genre => genreIds.includes(genre.id));
      return userGenres;
    } catch (error) {
      return [];
    }
  };

  // Cargar datos del perfil del usuario
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        const response = await getUserCompleteProfile();
        
        if (response.success && response.user) {
          
          // El servidor puede devolver estructura envuelta o directa
          let profileData: any = response.user;
          if (profileData.profile) {
            profileData = profileData.profile;
          }
          
          setUserProfile(profileData);
          
          // Resolver géneros si hay IDs de géneros preferidos
          if (profileData.preferredGenreIds && profileData.preferredGenreIds.length > 0) {
            const genres = await resolveGenreNames(profileData.preferredGenreIds);
            setResolvedGenres(genres);
          } else {
            setResolvedGenres([]);
          }
          
          // Inicializar datos de edición con los datos del servidor
          setUserInfo({
            nombre: profileData.firstName || "",
            apellido: profileData.lastName || ""
          });
          
        } else {
          setError(response.message || "Error al cargar el perfil del usuario");
          showNotification(response.message || "Error al cargar el perfil", "error");
        }
        
      } catch (error) {
        setError("Error de conexión al cargar el perfil");
        showNotification("Error de conexión al cargar el perfil", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Datos simulados de estadísticas del usuario
  const estadisticas = {
    librosLeidos: 47,
    librosEnLectura: 3,
    librosDeseados: 12,
    reseñasEscritas: 23,
  };
  
  // Mostrar estado de carga
  if (isLoading) {
    return (
      <section className="perfil-section">
        <div className="perfil-container">
          <div className="perfil-loading">
            <div className="loading-spinner"></div>
            <p>Cargando perfil...</p>
          </div>
        </div>
      </section>
    );
  }

  // Mostrar error si no se pudieron cargar los datos
  if (error && !userProfile) {
    return (
      <section className="perfil-section">
        <div className="perfil-container">
          <div className="perfil-error">
            <h2>Error al cargar el perfil</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="perfil-retry-btn">
              Intentar nuevamente
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="perfil-section">
      <div className="perfil-container">
        
        {/* Header del perfil */}
        <div className="perfil-header">
          <div className="perfil-avatar">
            <div className="perfil-avatar-circle">
              <span className="perfil-avatar-initials">
                {userInfo.nombre ? userInfo.nombre[0] : 'U'}{userInfo.apellido ? userInfo.apellido[0] : 'S'}
              </span>
            </div>
          </div>
          
          <div className="perfil-header-info">
            <h1 className="perfil-title">
              {userInfo.nombre || 'Usuario'} {userInfo.apellido || 'Sin Apellido'}
            </h1>
            <p className="perfil-subtitle">
              {resolvedGenres && resolvedGenres.length > 0 
                ? `Géneros favoritos: ${resolvedGenres.slice(0, 3).map(genre => genre.name).join(', ')}${resolvedGenres.length > 3 ? '...' : ''}`
                : 'Miembro de Soli Librería'
              }
            </p>
            <div className="perfil-header-actions">
            </div>
          </div>
        </div>

        {/* Estadísticas del usuario */}
        <div className="perfil-stats">
          <div className="perfil-stat">
            <span className="perfil-stat-number">
              {estadisticas.librosLeidos}
            </span>
            <span className="perfil-stat-label">Libros leídos</span>
          </div>
          <div className="perfil-stat">
            <span className="perfil-stat-number">
              {estadisticas.librosEnLectura}
            </span>
            <span className="perfil-stat-label">Leyendo ahora</span>
          </div>
          <div className="perfil-stat">
            <span className="perfil-stat-number">
              {resolvedGenres?.length || estadisticas.librosDeseados}
            </span>
            <span className="perfil-stat-label">Géneros favoritos</span>
          </div>
          <div className="perfil-stat">
            <span className="perfil-stat-number">
              {estadisticas.reseñasEscritas}
            </span>
            <span className="perfil-stat-label">Reseñas escritas</span>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="perfil-content">
          
          {/* Información personal */}
          <div className="perfil-card">
            <h2 className="perfil-card-title">Información Personal</h2>
            <div className="perfil-form">
              {/* Aquí vamos a hacer divs dinámicos, que van a cambiar lo que tengan dentro dependiendo del valor de isEditing*/}
              <div className="perfil-row">
                <div className="perfil-field">
                  <label className="perfil-label">Nombre</label>
                    <p className="perfil-value">{userInfo.nombre}</p>
                </div>
                
                <div className="perfil-field">
                  <label className="perfil-label">Apellido</label>
                    <p className="perfil-value">{userInfo.apellido}</p>
                </div>
              </div>

              <div className="perfil-field">
                <label className="perfil-label">Géneros Preferidos</label>
                <div className="perfil-value">
                  {resolvedGenres && resolvedGenres.length > 0 ? (
                    <div className="perfil-genres">
                      {resolvedGenres.map((genre, index) => (
                        <span key={index} className="perfil-genre-tag">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="perfil-no-data">No se han seleccionado géneros preferidos</p>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Libros Favoritos */}
          <div className="perfil-card">
            <h2 className="perfil-card-title">Libros Favoritos</h2>
            <div className="perfil-books">
              {/* Aquí irán los libros favoritos del usuario */}
              <div className="perfil-no-favorites">
                <p>No hay libros favoritos aún</p>
                <p className="perfil-no-favorites-subtitle">
                  Agrega libros a tu lista de favoritos navegando por el catálogo
                </p>
              </div>
            </div>
            
            <div className="perfil-actions">
              <Link to="/libreria" className="perfil-action-link">
                Explorar catálogo →
              </Link>
            </div>
          </div>

        </div>

        {/* Navegación de regreso */}
        <div className="perfil-navigation">
          <Link to="/" className="perfil-back-link">
            ← Volver al inicio
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