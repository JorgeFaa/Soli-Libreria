import { useState, useEffect } from 'react';
import { 
  getAllEditorials, 
  updateEditorial, 
  deleteEditorial, 
  createEditorial,
  type Editorial
} from '../../services/adminService';

import Toast from './Toast';
import './EditorialsManager.css';

export default function EditorialsManager() {
  // Estados para manejo de datos
  const [editorials, setEditorials] = useState<Editorial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Estados para formularios
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ companyName: string; countryId: number }>({
    companyName: '',
    countryId: 0
  });
  const [newEditorialForm, setNewEditorialForm] = useState<{ companyName: string; countryId: number }>({
    companyName: '',
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

  // Cargar editoriales al inicializar
  useEffect(() => {
    loadEditorials();
  }, []);

  const loadEditorials = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('🔍 [EditorialsManager] Iniciando carga de editoriales...');
      const editorialsList = await getAllEditorials();
      console.log('📦 [EditorialsManager] Editoriales recibidas:', editorialsList);
      setEditorials(editorialsList);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ [EditorialsManager] Error al cargar editoriales:', error);
      setError(errorMsg);
      showNotification(`Error al cargar editoriales: ${errorMsg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Crear nueva editorial
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEditorialForm.companyName.trim()) {
      showNotification('El nombre de la editorial es obligatorio', 'warning');
      return;
    }

    if (newEditorialForm.countryId <= 0) {
      showNotification('Debe seleccionar un país válido', 'warning');
      return;
    }

    try {
      setLoadingOperation('create');
      
      const newEditorial = await createEditorial({
        companyName: newEditorialForm.companyName.trim(),
        countryId: newEditorialForm.countryId
      });
      
      setEditorials(prev => [...prev, newEditorial]);
      setNewEditorialForm({ companyName: '', countryId: 0 });
      setIsCreating(false);
      showNotification(`Editorial "${newEditorial.companyName}" creada exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al crear editorial: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };

  // Iniciar edición
  const handleStartEdit = (editorial: Editorial) => {
    setEditingId(editorial.id);
    setEditForm({
      companyName: editorial.companyName,
      countryId: 1 // Por ahora hardcodeado, ya que no tenemos endpoint de países
    });
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ companyName: '', countryId: 0 });
  };

  // Guardar edición
  const handleSaveEdit = async (id: number) => {
    if (!editForm.companyName.trim()) {
      showNotification('El nombre de la editorial es obligatorio', 'warning');
      return;
    }

    if (editForm.countryId <= 0) {
      showNotification('Debe seleccionar un país válido', 'warning');
      return;
    }

    try {
      setLoadingOperation(`update-${id}`);
      
      const updatedEditorial = await updateEditorial(id, {
        companyName: editForm.companyName.trim(),
        countryId: editForm.countryId
      });
      
      setEditorials(prev => 
        prev.map(editorial => 
          editorial.id === id ? updatedEditorial : editorial
        )
      );
      
      setEditingId(null);
      setEditForm({ companyName: '', countryId: 0 });
      showNotification(`Editorial actualizada exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al actualizar editorial: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };

  // Eliminar editorial
  const handleDelete = async (id: number, editorialName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la editorial "${editorialName}"?`)) {
      return;
    }

    try {
      setLoadingOperation(`delete-${id}`);
      
      await deleteEditorial(id);
      
      setEditorials(prev => prev.filter(editorial => editorial.id !== id));
      showNotification(`Editorial "${editorialName}" eliminada exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al eliminar editorial: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };

  if (isLoading) {
    return (
      <div className="editorials-loading">
        <div className="loading-spinner"></div>
        <p>Cargando editoriales...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="editorials-error">
        <div className="editorials-error-content">
          <h3>Error al cargar editoriales</h3>
          <p>{error}</p>
        </div>
        <button 
          onClick={loadEditorials}
          className="btn-retry"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="editorials-manager">
      <div className="editorials-header">
        <h2>🏢 Gestión de Editoriales</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className={`btn-new-editorial ${isCreating ? 'cancel' : ''}`}
        >
          {isCreating ? '❌ Cancelar' : '➕ Nueva Editorial'}
        </button>
      </div>

      {/* Formulario de creación */}
      {isCreating && (
        <form onSubmit={handleCreate} className="editorial-create-form">
          <h3>Crear Nueva Editorial</h3>
          <div className="editorial-form-row">
            <div className="editorial-form-field">
              <label>
                Nombre de la editorial:
              </label>
              <input
                type="text"
                value={newEditorialForm.companyName}
                onChange={(e) => setNewEditorialForm(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="ej: Penguin Random House, Editorial Planeta..."
                disabled={loadingOperation === 'create'}
                required
              />
            </div>
            <div className="editorial-form-field">
              <label>
                ID del País:
              </label>
              <input
                type="number"
                min="1"
                value={newEditorialForm.countryId || ''}
                onChange={(e) => setNewEditorialForm(prev => ({ ...prev, countryId: parseInt(e.target.value) || 0 }))}
                placeholder="ej: 1"
                disabled={loadingOperation === 'create'}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loadingOperation === 'create'}
              className="btn-editorial-submit"
            >
              {loadingOperation === 'create' ? 'Creando...' : 'Crear'}
            </button>
          </div>
          <small className="editorial-form-note">
            💡 Nota: Los IDs de países se implementarán en un futuro endpoint
          </small>
        </form>
      )}

      {/* Lista de editoriales */}
      <div className="editorials-table">
        {editorials.length === 0 ? (
          <div className="editorials-empty">
            <p>🏢 No hay editoriales registradas</p>
            <p>Crea la primera editorial usando el botón "Nueva Editorial"</p>
          </div>
        ) : (
          <div>
            {/* Header de tabla */}
            <div className="editorials-table-header">
              <div>ID</div>
              <div>Nombre de la Editorial</div>
              <div>Libros Publicados</div>
              <div className="editorials-table-header-actions">Acciones</div>
            </div>

            {/* Filas de datos */}
            {editorials.map((editorial) => (
              <div 
                key={editorial.id}
                className="editorials-table-row"
              >
                <div className="editorials-cell-id">
                  #{editorial.id}
                </div>
                
                <div>
                  {editingId === editorial.id ? (
                    <div className="editorials-edit-inputs">
                      <input
                        type="text"
                        value={editForm.companyName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, companyName: e.target.value }))}
                        disabled={loadingOperation === `update-${editorial.id}`}
                        autoFocus
                      />
                      <input
                        type="number"
                        min="1"
                        value={editForm.countryId || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, countryId: parseInt(e.target.value) || 0 }))}
                        placeholder="ID País"
                        disabled={loadingOperation === `update-${editorial.id}`}
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="editorials-cell-name">{editorial.companyName}</div>
                      <div className="editorials-cell-country">ID País: (sin endpoint)</div>
                    </div>
                  )}
                </div>

                <div className="editorials-cell-count">
                  {editorial.books && editorial.books.length > 0 ? (
                    <span>{editorial.books.length} libro{editorial.books.length !== 1 ? 's' : ''}</span>
                  ) : (
                    <span className="editorials-cell-empty">Sin libros</span>
                  )}
                </div>
                
                <div className="editorials-table-actions">
                  {editingId === editorial.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(editorial.id)}
                        disabled={loadingOperation === `update-${editorial.id}`}
                        className="btn-editorial-action btn-editorial-save"
                      >
                        {loadingOperation === `update-${editorial.id}` ? '...' : '✅'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={loadingOperation === `update-${editorial.id}`}
                        className="btn-editorial-action btn-editorial-cancel-edit"
                      >
                        ❌
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(editorial)}
                        className="btn-editorial-action btn-editorial-edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(editorial.id, editorial.companyName)}
                        disabled={loadingOperation === `delete-${editorial.id}`}
                        className="btn-editorial-action btn-editorial-delete"
                      >
                        {loadingOperation === `delete-${editorial.id}` ? '...' : '🗑️'}
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