import { useState, useEffect } from 'react';
import { 
  getAllAuthors, 
  updateAuthor, 
  deleteAuthor, 
  createAuthor,
  type Author,
  type CreateAuthorRequest,
  type UpdateAuthorRequest,
  getAllCountries,
  type Country
} from '../../services/adminService';

import Toast from './Toast';
import './AuthorsManager.css';

export default function AuthorsManager() {
  // Estados para manejo de datos
  const [authors, setAuthors] = useState<Author[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Estados para formularios
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<UpdateAuthorRequest>({
    name: '',
    middleName: '',
    lastName: '',
    countryId: 0
  });
  
  const [newAuthorForm, setNewAuthorForm] = useState<CreateAuthorRequest>({
    name: '',
    middleName: '',
    lastName: '',
    countryId: 0
  });
  
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

  // Cargar datos al inicializar
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('🔍 [AuthorsManager] Iniciando carga de datos...');
      
      // Cargar autores y países en paralelo
      const [authorsData, countriesData] = await Promise.all([
        getAllAuthors(),
        getAllCountries()
      ]);
      
      console.log('📦 [AuthorsManager] Datos recibidos:', {
        authors: authorsData.length,
        countries: countriesData.length
      });
      
      setAuthors(authorsData);
      setCountries(countriesData);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ [AuthorsManager] Error al cargar datos:', error);
      setError(errorMsg);
      showNotification(`Error al cargar datos: ${errorMsg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Crear nuevo autor
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAuthorForm.name.trim()) {
      showNotification('El nombre del autor es obligatorio', 'warning');
      return;
    }

    if (!newAuthorForm.lastName.trim()) {
      showNotification('El apellido del autor es obligatorio', 'warning');
      return;
    }

    if (!newAuthorForm.countryId || newAuthorForm.countryId === 0) {
      showNotification('Debe seleccionar un país', 'warning');
      return;
    }

    try {
      setLoadingOperation('create');
      
      const newAuthor = await createAuthor(newAuthorForm);
      
      setAuthors(prev => [...prev, newAuthor]);
      setNewAuthorForm({
        name: '',
        middleName: '',
        lastName: '',
        countryId: 0
      });
      setIsCreating(false);
      showNotification(`Autor "${newAuthor.name} ${newAuthor.lastName}" creado exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al crear autor: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };

  // Iniciar edición
  const handleStartEdit = (author: Author) => {
    setEditingId(author.id);
    
    // Encontrar el countryId basado en el nombre del país
    const country = countries.find(c => c.name === author.country);
    
    setEditForm({
      name: author.name,
      middleName: author.middleName || '',
      lastName: author.lastName,
      countryId: country?.id || 0
    });
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: '',
      middleName: '',
      lastName: '',
      countryId: 0
    });
  };

  // Guardar edición
  const handleSaveEdit = async (id: number) => {
    if (!editForm.name.trim()) {
      showNotification('El nombre del autor es obligatorio', 'warning');
      return;
    }

    if (!editForm.lastName.trim()) {
      showNotification('El apellido del autor es obligatorio', 'warning');
      return;
    }

    if (!editForm.countryId || editForm.countryId === 0) {
      showNotification('Debe seleccionar un país', 'warning');
      return;
    }

    try {
      setLoadingOperation(`update-${id}`);
      
      const updatedAuthor = await updateAuthor(id, editForm);
      
      setAuthors(prev => 
        prev.map(author => 
          author.id === id ? updatedAuthor : author
        )
      );
      
      setEditingId(null);
      setEditForm({
        name: '',
        middleName: '',
        lastName: '',
        countryId: 0
      });
      showNotification(`Autor actualizado exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al actualizar autor: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };

  // Eliminar autor
  const handleDelete = async (id: number, authorName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el autor "${authorName}"?\n\nEsto podría afectar libros asociados.`)) {
      return;
    }

    try {
      setLoadingOperation(`delete-${id}`);
      
      await deleteAuthor(id);
      
      setAuthors(prev => prev.filter(author => author.id !== id));
      showNotification(`Autor "${authorName}" eliminado exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al eliminar autor: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };

  // Formatear nombre completo del autor
  const formatFullName = (author: Author) => {
    const parts = [author.name, author.middleName, author.lastName].filter(Boolean);
    return parts.join(' ');
  };

  if (isLoading) {
    return (
      <div className="authors-loading">
        <div className="loading-spinner"></div>
        <p>Cargando autores y países...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="authors-error">
        <div className="authors-error-content">
          <h3>Error al cargar autores</h3>
          <p>{error}</p>
        </div>
        <button 
          onClick={loadAllData}
          className="btn-retry"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="authors-manager">
      <div className="authors-header">
        <h2>👤 Gestión de Autores</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className={`btn-new-author ${isCreating ? 'cancel' : ''}`}
        >
          {isCreating ? '❌ Cancelar' : '➕ Nuevo Autor'}
        </button>
      </div>

      {/* Formulario de creación */}
      {isCreating && (
        <form onSubmit={handleCreate} className="author-create-form">
          <h3>Crear Nuevo Autor</h3>
          <div className="form-grid">
            <div className="form-field">
              <label>
                Nombre *
              </label>
              <input
                type="text"
                value={newAuthorForm.name}
                onChange={(e) => setNewAuthorForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ej: Gabriel, Mario, Isabel..."
                disabled={loadingOperation === 'create'}
                required
              />
            </div>
            
            <div className="form-field">
              <label>
                Segundo Nombre
              </label>
              <input
                type="text"
                value={newAuthorForm.middleName}
                onChange={(e) => setNewAuthorForm(prev => ({ ...prev, middleName: e.target.value }))}
                placeholder="ej: García, de..."
                disabled={loadingOperation === 'create'}
              />
            </div>

            <div className="form-field">
              <label>
                Apellido *
              </label>
              <input
                type="text"
                value={newAuthorForm.lastName}
                onChange={(e) => setNewAuthorForm(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="ej: Márquez, Vargas Llosa..."
                disabled={loadingOperation === 'create'}
                required
              />
            </div>

            <div className="form-field">
              <label>
                País *
              </label>
              <select
                value={newAuthorForm.countryId}
                onChange={(e) => setNewAuthorForm(prev => ({ ...prev, countryId: parseInt(e.target.value) }))}
                disabled={loadingOperation === 'create'}
                required
              >
                <option value={0}>Seleccionar país...</option>
                {countries.map(country => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="btn-cancel"
              disabled={loadingOperation === 'create'}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loadingOperation === 'create'}
              className="btn-submit"
            >
              {loadingOperation === 'create' ? 'Creando...' : 'Crear Autor'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de autores */}
      <div className="authors-table">
        {authors.length === 0 ? (
          <div className="authors-empty">
            <p>👤 No hay autores registrados</p>
            <p>Crea el primer autor usando el botón "Nuevo Autor"</p>
          </div>
        ) : (
          <div>
            {/* Header de tabla */}
            <div className="table-header">
              <div>ID</div>
              <div>Nombre</div>
              <div>Segundo Nombre</div>
              <div>Apellido</div>
              <div>País</div>
              <div className="table-header-actions">Acciones</div>
            </div>

            {/* Filas de datos */}
            {authors.map((author) => (
              <div 
                key={author.id}
                className="table-row"
              >
                <div className="table-cell-id">
                  #{author.id}
                </div>
                
                <div>
                  {editingId === author.id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="edit-input"
                      disabled={loadingOperation === `update-${author.id}`}
                      autoFocus
                    />
                  ) : (
                    <div className="table-cell-name">{author.name}</div>
                  )}
                </div>

                <div>
                  {editingId === author.id ? (
                    <input
                      type="text"
                      value={editForm.middleName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, middleName: e.target.value }))}
                      className="edit-input"
                      disabled={loadingOperation === `update-${author.id}`}
                    />
                  ) : (
                    <div className={`table-cell-middle ${!author.middleName ? 'empty' : ''}`}>
                      {author.middleName || 'Sin segundo nombre'}
                    </div>
                  )}
                </div>

                <div>
                  {editingId === author.id ? (
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="edit-input"
                      disabled={loadingOperation === `update-${author.id}`}
                    />
                  ) : (
                    <div className="table-cell-name">{author.lastName}</div>
                  )}
                </div>

                <div>
                  {editingId === author.id ? (
                    <select
                      value={editForm.countryId}
                      onChange={(e) => setEditForm(prev => ({ ...prev, countryId: parseInt(e.target.value) }))}
                      className="edit-select"
                      disabled={loadingOperation === `update-${author.id}`}
                    >
                      <option value={0}>Seleccionar país...</option>
                      {countries.map(country => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="table-cell-country">{author.country}</div>
                  )}
                </div>
                
                <div className="table-actions">
                  {editingId === author.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(author.id)}
                        disabled={loadingOperation === `update-${author.id}`}
                        className="btn-action btn-save"
                      >
                        {loadingOperation === `update-${author.id}` ? '...' : '✅'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={loadingOperation === `update-${author.id}`}
                        className="btn-action btn-cancel-edit"
                      >
                        ❌
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(author)}
                        className="btn-action btn-edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(author.id, formatFullName(author))}
                        disabled={loadingOperation === `delete-${author.id}`}
                        className="btn-action btn-delete"
                      >
                        {loadingOperation === `delete-${author.id}` ? '...' : '🗑️'}
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