import { useState, useEffect } from 'react';
import { 
  getAllGenres, 
  updateGenre, 
  deleteGenre, 
  createGenre,
  type Genre
} from '../../services/adminService';

import Toast from './Toast';
import './GenresManager.css';

export default function GenresManager() {
  // Estados para manejo de datos
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Estados para formularios
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<string>('');
  const [newGenreForm, setNewGenreForm] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  
  // Estados para operaciones
  const [loadingOperation, setLoadingOperation] = useState<string>(''); // 'create', 'update-123', 'delete-456'
  
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

  // Cargar géneros al inicializar
  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('🔍 [GenresManager] Iniciando carga de géneros...');
      const genresList = await getAllGenres();
      console.log('📦 [GenresManager] Géneros recibidos:', genresList);
      setGenres(genresList);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ [GenresManager] Error al cargar géneros:', error);
      setError(errorMsg);
      showNotification(`Error al cargar géneros: ${errorMsg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Crear nuevo género
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGenreForm.trim()) {
      showNotification('El nombre del género es obligatorio', 'warning');
      return;
    }

    try {
      setLoadingOperation('create');
      
      const newGenre = await createGenre({ genrename: newGenreForm.trim() });
      
      setGenres(prev => [...prev, newGenre]);
      setNewGenreForm('');
      setIsCreating(false);
      showNotification(`Género "${newGenre.name}" creado exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al crear género: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };

  // Iniciar edición
  const handleStartEdit = (genre: Genre) => {
    setEditingId(genre.id);
    setEditForm(genre.name);
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm('');
  };

  // Guardar edición
  const handleSaveEdit = async (id: number) => {
    if (!editForm.trim()) {
      showNotification('El nombre del género es obligatorio', 'warning');
      return;
    }

    try {
      setLoadingOperation(`update-${id}`);
      
      const updatedGenre = await updateGenre(id, { genrename: editForm.trim() });
      
      setGenres(prev => 
        prev.map(genre => 
          genre.id === id ? updatedGenre : genre
        )
      );
      
      setEditingId(null);
      setEditForm('');
      showNotification(`Género actualizado exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al actualizar género: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };

  // Eliminar género
  const handleDelete = async (id: number, genreName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el género "${genreName}"?`)) {
      return;
    }

    try {
      setLoadingOperation(`delete-${id}`);
      
      await deleteGenre(id);
      
      setGenres(prev => prev.filter(genre => genre.id !== id));
      showNotification(`Género "${genreName}" eliminado exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al eliminar género: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };

  if (isLoading) {
    return (
      <div className="genres-loading">
        <div className="loading-spinner"></div>
        <p>Cargando géneros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="genres-error">
        <div className="genres-error-content">
          <h3>Error al cargar géneros</h3>
          <p>{error}</p>
        </div>
        <button onClick={loadGenres} className="btn-retry">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="genres-manager">
      <div className="genres-header">
        <h2>🏷️ Gestión de Géneros</h2>
        <button onClick={() => setIsCreating(!isCreating)} className="btn-new-genre">
          {isCreating ? '❌ Cancelar' : '➕ Nuevo Género'}
        </button>
      </div>

      {/* Formulario de creación */}
      {isCreating && (
        <form onSubmit={handleCreate} className="genre-create-form">
          <h3>Crear Nuevo Género</h3>
          <div className="genre-form-row">
            <div className="genre-form-field">
              <label>
                Nombre del género:
              </label>
              <input
                type="text"
                value={newGenreForm}
                onChange={(e) => setNewGenreForm(e.target.value)}
                placeholder="ej: Ficción, No ficción, Romance, Ciencia ficción..."
                disabled={loadingOperation === 'create'}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loadingOperation === 'create'}
              className="btn-genre-submit"
            >
              {loadingOperation === 'create' ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de géneros */}
      <div className="genres-table-container">
        {genres.length === 0 ? (
          <div className="genres-empty">
            <p>📚 No hay géneros registrados</p>
            <p>Crea el primer género usando el botón "Nuevo Género"</p>
          </div>
        ) : (
          <div>
            {/* Header de tabla */}
            <div className="genres-table-header">
              <div>ID</div>
              <div>Nombre del Género</div>
              <div className="genres-table-header-actions">Acciones</div>
            </div>

            {/* Filas de datos */}
            {genres.map((genre) => (
              <div key={genre.id} className="genres-table-row">
                <div className="genre-id">
                  #{genre.id}
                </div>
                
                <div>
                  {editingId === genre.id ? (
                    <input
                      type="text"
                      value={editForm}
                      onChange={(e) => setEditForm(e.target.value)}
                      className="genre-edit-input"
                      disabled={loadingOperation === `update-${genre.id}`}
                      autoFocus
                    />
                  ) : (
                    <span className="genre-name">{genre.name}</span>
                  )}
                </div>
                
                <div className="genre-actions">
                  {editingId === genre.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(genre.id)}
                        disabled={loadingOperation === `update-${genre.id}`}
                        className="btn-genre-action btn-genre-save"
                      >
                        {loadingOperation === `update-${genre.id}` ? '...' : '✅'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={loadingOperation === `update-${genre.id}`}
                        className="btn-genre-action btn-genre-cancel"
                      >
                        ❌
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(genre)}
                        className="btn-genre-action btn-genre-edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(genre.id, genre.name)}
                        disabled={loadingOperation === `delete-${genre.id}`}
                        className="btn-genre-action btn-genre-delete"
                      >
                        {loadingOperation === `delete-${genre.id}` ? '...' : '🗑️'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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