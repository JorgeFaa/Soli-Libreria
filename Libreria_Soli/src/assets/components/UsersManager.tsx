import { useState, useEffect } from 'react';
import { 
  getAllUsers, 
  deleteUser,
  type User,
  getAllGenres,
  type Genre
} from '../../services/adminService';

import Toast from './Toast';
import './UsersManager.css';

export default function UsersManager() {
  // Estados para manejo de datos
  const [users, setUsers] = useState<User[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Estados para operaciones
  const [loadingOperation, setLoadingOperation] = useState<string>(''); // 'delete-456'
  
  // Estados para Toast
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");
  const [showToast, setShowToast] = useState<boolean>(false);

  // Función para mostrar notificaciones
  const showNotification = (message: string, type: "success" | "error" | "warning") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Cargar datos al inicializar
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('🔍 [UsersManager] Iniciando carga de datos...');
      
      // Cargar usuarios y géneros en paralelo
      const [usersData, genresData] = await Promise.all([
        getAllUsers(),
        getAllGenres()
      ]);
      
      console.log('📦 [UsersManager] Datos recibidos:', {
        users: usersData.length,
        genres: genresData.length
      });
      
      setUsers(usersData);
      setGenres(genresData);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ [UsersManager] Error al cargar datos:', error);
      setError(errorMsg);
      showNotification(`Error al cargar datos: ${errorMsg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar usuario
  const handleDelete = async (id: number, userName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el usuario "${userName}"?\n\n⚠️ ESTA ACCIÓN ES IRREVERSIBLE\n\nSe eliminarán:\n- Todos los datos del usuario\n- Sus libros favoritos\n- Su historial de actividad\n- Sus preferencias de géneros`)) {
      return;
    }

    try {
      setLoadingOperation(`delete-${id}`);
      
      await deleteUser(id);
      
      setUsers(prev => prev.filter(user => user.id !== id));
      showNotification(`Usuario "${userName}" eliminado exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al eliminar usuario: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };

  // Formatear nombre completo del usuario
  const formatFullName = (user: User) => {
    return `${user.firstName} ${user.lastName}`.trim();
  };

  // Obtener nombres de géneros preferidos
  const getPreferredGenresNames = (genreIds: number[]) => {
    if (genreIds.length === 0) return 'Sin preferencias';
    
    const genreNames = genreIds.map(id => {
      const genre = genres.find(g => g.id === id);
      return genre ? genre.name : `ID:${id}`;
    });
    
    return genreNames.join(', ');
  };

  if (isLoading) {
    return (
      <div className="users-loading">
        <div className="loading-spinner"></div>
        <p>Cargando usuarios y datos relacionados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-error">
        <div className="users-error-content">
          <h3>Error al cargar usuarios</h3>
          <p>{error}</p>
        </div>
        <button onClick={loadAllData} className="btn-retry">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="users-manager">
      <div className="users-header">
        <div className="users-header-content">
          <h2>👥 Gestión de Usuarios</h2>
          <p className="users-header-subtitle">
            Los usuarios se registran mediante el sistema de registro. Aquí puedes consultarlos y eliminarlos si es necesario.
          </p>
        </div>
        <div className="users-stats-badge">
          <span className="users-stats-text">
            📊 Total: {users.length} usuarios
          </span>
        </div>
      </div>

      {/* Advertencia sobre eliminación */}
      <div className="users-warning">
        <h4>⚠️ Advertencia sobre eliminación de usuarios</h4>
        <p>
          La eliminación de usuarios es <strong>irreversible</strong> y borrará todos sus datos, incluyendo favoritos, preferencias y historial. 
          Los usuarios pueden editar su perfil desde "Mi Perfil" en su cuenta.
        </p>
      </div>

      {/* Lista de usuarios */}
      <div className="users-table-container">
        {users.length === 0 ? (
          <div className="users-empty">
            <p>👥 No hay usuarios registrados</p>
            <p>Los usuarios aparecerán aquí cuando se registren en el sistema</p>
          </div>
        ) : (
          <div>
            {/* Header de tabla */}
            <div className="users-table-header">
              <div>ID</div>
              <div>Nombre Completo</div>
              <div>Libros Favoritos</div>
              <div>Géneros Preferidos</div>
              <div>Estado</div>
              <div className="users-table-header-actions">Acciones</div>
            </div>

            {/* Filas de datos */}
            {users.map((user) => (
              <div key={user.id} className="users-table-row">
                <div className="user-id">
                  #{user.id}
                </div>
                
                <div>
                  <div className="user-name-primary">
                    {formatFullName(user)}
                  </div>
                  <div className="user-name-secondary">
                    {user.firstName && user.lastName ? 
                      `${user.firstName} • ${user.lastName}` : 
                      'Nombre parcial'
                    }
                  </div>
                </div>

                <div className="user-favorites">
                  {user.favoriteBooks.length > 0 ? (
                    <span className="user-favorites-badge">
                      {user.favoriteBooks.length} libro{user.favoriteBooks.length !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="user-favorites-empty">Sin favoritos</span>
                  )}
                </div>

                <div className="user-genres">
                  {user.prefferredGenreIds.length > 0 ? (
                    <div>
                      <span className="user-genres-badge">
                        {user.prefferredGenreIds.length} género{user.prefferredGenreIds.length !== 1 ? 's' : ''}
                      </span>
                      <div className="user-genres-list">
                        {getPreferredGenresNames(user.prefferredGenreIds)}
                      </div>
                    </div>
                  ) : (
                    <span className="user-genres-empty">Sin preferencias</span>
                  )}
                </div>

                <div className="user-status">
                  <span className="user-status-badge">
                    Activo
                  </span>
                </div>
                
                <div className="user-actions">
                  <button
                    onClick={() => handleDelete(user.id, formatFullName(user))}
                    disabled={loadingOperation === `delete-${user.id}`}
                    className="btn-user-delete"
                    title="Eliminar usuario (irreversible)"
                  >
                    {loadingOperation === `delete-${user.id}` ? '...' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="users-info">
        <h4>📝 Información sobre gestión de usuarios</h4>
        <ul>
          <li><strong>Creación:</strong> Los usuarios se registran mediante el formulario de registro público</li>
          <li><strong>Edición:</strong> Los usuarios pueden editar su perfil desde "Mi Perfil" una vez autenticados</li>
          <li><strong>Eliminación:</strong> Solo los administradores pueden eliminar usuarios (acción irreversible)</li>
          <li><strong>Datos mostrados:</strong> ID, nombre, libros favoritos, géneros preferidos</li>
        </ul>
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
    </div>
  );
}