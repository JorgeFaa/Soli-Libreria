import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Perfil.css";

// Importar servicios de autenticación
import { getUserCompleteProfile, updateUserProfile, isCurrentUserAdmin } from '../../services/authService';
import type { UserCompleteProfile } from '../../services/authService';

// Importar servicios de libros para obtener géneros y favoritos
import { getFavoriteBooks, removeBookFromFavorites, getAllGenres } from '../../services/booksService';
import type { Genre, Book } from '../../services/booksService';

// Importar sistema de Toast
import Toast from "./Toast";

export default function Perfil() {
  // Estados para manejar la edición del perfil
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Estados para Toast
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");
  const [showToast, setShowToast] = useState<boolean>(false);
  
  // Datos del perfil del usuario
  const [userProfile, setUserProfile] = useState<UserCompleteProfile | null>(null);
  
  // Géneros resueltos (nombres completos)
  const [resolvedGenres, setResolvedGenres] = useState<Genre[]>([]);
  
  // Todos los géneros disponibles para seleccionar
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState<boolean>(false);
  
  // Libros favoritos del usuario
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState<boolean>(false);
  const [removingFavoriteId, setRemovingFavoriteId] = useState<number | null>(null);
  
  // Información básica del usuario extraída del perfil
  const [userInfo, setUserInfo] = useState({
    nombre: "",
    apellido: "",
  });
  
  // Datos temporales para edición
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    selectedGenreIds: [] as number[]
  });

  // Función para mostrar notificaciones
  const showNotification = (message: string, type: "success" | "error" | "warning") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Función para eliminar un libro de favoritos
  const handleRemoveFromFavorites = async (bookId: number, bookTitle: string) => {
    setRemovingFavoriteId(bookId);
    
    try {
      await removeBookFromFavorites(bookId);
      
      // Actualizar la lista local de favoritos
      setFavoriteBooks(prev => prev.filter(book => book.id !== bookId));
      
      showNotification(`"${bookTitle}" eliminado de favoritos`, "success");
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Token expirado') || error.message.includes('No hay token')) {
          showNotification("Sesión expirada. Por favor, inicia sesión nuevamente.", "error");
        } else {
          showNotification(`Error al eliminar de favoritos: ${error.message}`, "error");
        }
      } else {
        showNotification("Error desconocido al eliminar de favoritos.", "error");
      }
    } finally {
      setRemovingFavoriteId(null);
    }
  };

  // Función para iniciar edición
  const handleEditStart = async () => {
    const selectedIds = userProfile?.preferredGenreIds || userProfile?.prefferredGenreIds || [];
    
    setEditForm({
      firstName: userInfo.nombre,
      lastName: userInfo.apellido,
      selectedGenreIds: selectedIds
    });
    
    // Cargar todos los géneros disponibles si no los tenemos
    if (availableGenres.length === 0) {
      setLoadingGenres(true);
      try {
        const genres = await getAllGenres();
        setAvailableGenres(genres);
      } catch (error) {
        console.error('Error al cargar géneros:', error);
        showNotification('Error al cargar géneros disponibles', 'error');
      } finally {
        setLoadingGenres(false);
      }
    }
    
    setIsEditing(true);
  };

  // Función para cancelar edición
  const handleEditCancel = () => {
    setIsEditing(false);
    setEditForm({
      firstName: "",
      lastName: "",
      selectedGenreIds: []
    });
  };

  // Función para manejar selección de géneros
  const handleGenreToggle = (genreId: number) => {
    setEditForm(prev => ({
      ...prev,
      selectedGenreIds: prev.selectedGenreIds.includes(genreId)
        ? prev.selectedGenreIds.filter(id => id !== genreId)  // Deseleccionar
        : [...prev.selectedGenreIds, genreId]  // Seleccionar
    }));
  };

  // Función para guardar cambios
  const handleSave = async () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      showNotification("El nombre y apellido son obligatorios", "warning");
      return;
    }

    setIsSaving(true);
    
    try {
      const updateData = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        // Usar los géneros seleccionados por el usuario
        preferredGenreIds: editForm.selectedGenreIds
      };

      const response = await updateUserProfile(updateData);
      
      if (response.success) {
        // Actualizar estado local
        setUserInfo({
          nombre: updateData.firstName,
          apellido: updateData.lastName
        });

        // Actualizar géneros resueltos con los géneros seleccionados
        if (updateData.preferredGenreIds.length > 0) {
          // Buscar los nombres de los géneros desde availableGenres
          const updatedGenres = updateData.preferredGenreIds.map((id: number) => {
            const foundGenre = availableGenres.find(genre => genre.id === id);
            return foundGenre || { id: id, name: `Género ${id}` };
          });
          setResolvedGenres(updatedGenres);
        } else {
          setResolvedGenres([]);
        }

        setIsEditing(false);
        showNotification("Perfil actualizado exitosamente", "success");
        
      } else {
        showNotification(`Error: ${response.message}`, "error");
      }
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Token expirado') || error.message.includes('No hay token')) {
          showNotification("Sesión expirada. Por favor, inicia sesión nuevamente.", "error");
        } else {
          showNotification(`Error al actualizar perfil: ${error.message}`, "error");
        }
      } else {
        showNotification("Error desconocido al actualizar el perfil.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Cargar datos del perfil del usuario y favoritos
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        // Cargar géneros disponibles y perfil del usuario en paralelo
        const [profileResponse, availableGenresData] = await Promise.allSettled([
          getUserCompleteProfile(),
          getAllGenres()
        ]);
        
        // Procesar géneros disponibles
        if (availableGenresData.status === 'fulfilled') {
          setAvailableGenres(availableGenresData.value);
        } else {
          console.warn('No se pudieron cargar los géneros disponibles:', availableGenresData.reason);
        }
        
        // Procesar respuesta del perfil
        if (profileResponse.status === 'rejected') {
          throw profileResponse.reason;
        }
        
        const response = profileResponse.value;
        
        if (response.success && response.user) {
          // El servidor puede devolver estructura envuelta o directa
          let profileData: any = response.user;
          if (profileData.profile) {
            profileData = profileData.profile;
          }
          
          setUserProfile(profileData);

          const userGenres = profileData.preferredGenres || [];
          const genreIds = profileData.preferredGenreIds || profileData.prefferredGenreIds || [];
          
          // Si vienen géneros completos, usarlos directamente
          if (userGenres && userGenres.length > 0) {
            setResolvedGenres(userGenres);
          } else if (genreIds && genreIds.length > 0) {
            // Usar los géneros disponibles cargados para obtener nombres reales
            const userGenresList = genreIds.map((id: number) => {
              // Buscar el nombre real en los géneros disponibles
              const foundGenre = availableGenresData.status === 'fulfilled' 
                ? availableGenresData.value.find((genre: Genre) => genre.id === id)
                : null;
              
              return foundGenre || { id: id, name: `Género ${id}` };
            });
            

            setResolvedGenres(userGenresList);
          } else {
            setResolvedGenres([]);
          }
          
          // Inicializar datos de edición con los datos del servidor
          setUserInfo({
            nombre: profileData.firstName || "",
            apellido: profileData.lastName || ""
          });
          
          // Cargar favoritos automáticamente
          try {
            setLoadingFavorites(true);
            const favorites = await getFavoriteBooks();
            setFavoriteBooks(favorites);
          } catch (favError) {
            // No mostrar error crítico por favoritos, solo log
            console.warn('No se pudieron cargar los favoritos:', favError);
            setFavoriteBooks([]);
          } finally {
            setLoadingFavorites(false);
          }
          
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
            <p className="perfil-subtitle">Miembro de Soli Librería</p>
            {/* Mostrar badge de administrador si aplica */}
            {isCurrentUserAdmin() && (
              <div style={{ 
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #3498db, #2980b9)',
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600',
                display: 'inline-block'
              }}>
                🛠️ ADMINISTRADOR
              </div>
            )}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="perfil-content">
          
          {/* Panel de administración - Solo para administradores */}
          {isCurrentUserAdmin() && (
            <div className="perfil-card" style={{ 
              background: 'linear-gradient(135deg, #3498db, #2980b9)',
              color: 'white',
              marginBottom: '2rem'
            }}>
              <div className="perfil-card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                <h2 style={{ color: 'white', margin: 0 }}>🛠️ Panel de Administración</h2>
                <Link 
                  to="/admin"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    transition: 'background-color 0.2s ease',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                >
                  Ir al Dashboard
                </Link>
              </div>
              <div style={{ padding: '1rem 0' }}>
                <p style={{ margin: '0 0 1rem 0', opacity: 0.9 }}>
                  Accede al panel de administración para gestionar usuarios, libros, géneros y configuraciones del sistema.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem' 
                  }}>
                    👥 Gestión de usuarios
                  </span>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem' 
                  }}>
                    📚 Catálogo de libros
                  </span>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem' 
                  }}>
                    📊 Reportes y estadísticas
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Información personal */}
          <div className="perfil-card">
            <div className="perfil-card-header">
              <h2 className="perfil-card-title">Información Personal</h2>
              {!isEditing ? (
                <button 
                  onClick={handleEditStart}
                  className="perfil-edit-button"
                  title="Editar información personal"
                >
                  ✏️ Editar
                </button>
              ) : (
                <div className="perfil-edit-buttons">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="perfil-save-button"
                  >
                    {isSaving ? 'Guardando...' : '✅ Guardar'}
                  </button>
                  <button 
                    onClick={handleEditCancel}
                    disabled={isSaving}
                    className="perfil-cancel-button"
                  >
                    ❌ Cancelar
                  </button>
                </div>
              )}
            </div>
            
            <div className="perfil-form">
              {/* Nombres */}
              <div className="perfil-row">
                <div className="perfil-field">
                  <label className="perfil-label">Nombre</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="perfil-input"
                      placeholder="Ingresa tu nombre"
                    />
                  ) : (
                    <p className="perfil-value">{userInfo.nombre}</p>
                  )}
                </div>
                
                <div className="perfil-field">
                  <label className="perfil-label">Apellido</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="perfil-input"
                      placeholder="Ingresa tu apellido"
                    />
                  ) : (
                    <p className="perfil-value">{userInfo.apellido}</p>
                  )}
                </div>
              </div>

              {/* Géneros Preferidos */}
              <div className="perfil-field">
                <label className="perfil-label">Géneros Preferidos</label>
                <div className="perfil-value">
                  {isEditing ? (
                    <div className="perfil-genres-selector">
                      <p className="perfil-genres-title">
                        📚 Selecciona tus géneros favoritos
                      </p>
                      
                      {loadingGenres ? (
                        <div className="perfil-genres-loading">
                          <div className="loading-spinner"></div>
                          <p>Cargando géneros disponibles...</p>
                        </div>
                      ) : availableGenres.length > 0 ? (
                        <div className="perfil-genres-grid">
                          {availableGenres.map((genre) => (
                            <label 
                              key={genre.id}
                              className={`perfil-genre-option ${editForm.selectedGenreIds.includes(genre.id) ? 'selected' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={editForm.selectedGenreIds.includes(genre.id)}
                                onChange={() => handleGenreToggle(genre.id)}
                                className="perfil-genre-checkbox"
                              />
                              <span className="perfil-genre-name">
                                {genre.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="perfil-genres-error">
                          <p>No se pudieron cargar los géneros disponibles</p>
                        </div>
                      )}
                      
                      {editForm.selectedGenreIds.length > 0 && (
                        <div className="perfil-selected-genres">
                          <p className="perfil-selected-genres-title">
                            Géneros seleccionados ({editForm.selectedGenreIds.length}):
                          </p>
                          <div className="perfil-selected-genres-list">
                            {editForm.selectedGenreIds.map((genreId) => {
                              const genre = availableGenres.find(g => g.id === genreId);
                              return (
                                <span 
                                  key={genreId} 
                                  className="perfil-selected-genre-tag"
                                >
                                  {genre ? genre.name : `Género ${genreId}`}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    resolvedGenres && resolvedGenres.length > 0 ? (
                      <div className="perfil-genres">
                        {resolvedGenres.map((genre, index) => (
                          <span key={index} className="perfil-genre-tag">
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="perfil-no-data">No se han seleccionado géneros preferidos</p>
                    )
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Libros Favoritos */}
          <div className="perfil-card">
            <h2 className="perfil-card-title">
              Mis Libros Favoritos
              {loadingFavorites && <span className="perfil-loading-text">Cargando...</span>}
            </h2>
            
            <div className="perfil-books">
              {loadingFavorites ? (
                <div className="perfil-loading-favorites">
                  <div className="loading-spinner"></div>
                  <p>Cargando libros favoritos...</p>
                </div>
              ) : favoriteBooks.length > 0 ? (
                <div className="perfil-favorites-grid">
                  <div className="perfil-favorites-count">
                    <p>📚 <strong>{favoriteBooks.length} libro{favoriteBooks.length !== 1 ? 's' : ''} en tu lista</strong></p>
                  </div>
                  
                  <div className="perfil-favorites-list">
                    {favoriteBooks.map((book) => (
                      <div 
                        key={book.id} 
                        className="perfil-favorite-item"
                      >
                        <div className="favorite-book-cover">
                          {book.portada ? (
                            <img 
                              src={book.portada} 
                              alt={`Portada de ${book.titulo}`}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="favorite-book-placeholder">
                              📚
                            </div>
                          )}
                        </div>
                        
                        <div className="favorite-book-info">
                          <h3 className="favorite-book-title">
                            {book.titulo}
                          </h3>
                          <p className="favorite-book-author">
                            por {book.autor}
                          </p>
                          <div className="favorite-book-meta">
                            <span>📅 {book.año}</span>
                            <span>🏷️ {book.genero}</span>
                          </div>
                        </div>
                        
                        <div className="favorite-book-actions">
                          <Link 
                            to={`/libro/${book.id}`}
                            className="favorite-book-view-link"
                          >
                            Ver detalles
                          </Link>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromFavorites(book.id, book.titulo);
                            }}
                            disabled={removingFavoriteId === book.id}
                            className="favorite-book-remove-button"
                          >
                            {removingFavoriteId === book.id ? 'Eliminando...' : '🗑️ Eliminar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="perfil-no-favorites">
                  <div className="perfil-no-favorites-icon">📚</div>
                  <h3>No tienes libros favoritos aún</h3>
                  <p className="perfil-no-favorites-subtitle">
                    Explora nuestro catálogo y agrega libros a tu lista de favoritos
                  </p>
                </div>
              )}
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