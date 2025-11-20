import { useState, useEffect } from 'react';
import { 
  getAllTextTypes, 
  updateTextType, 
  deleteTextType, 
  createTextType,
  type TextType
} from '../../services/adminService';

import Toast from './Toast';
import './TextTypesManager.css';

export default function TextTypesManager() {
  // Estados para manejo de datos
  const [textTypes, setTextTypes] = useState<TextType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Estados para formularios
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<string>('');
  const [newTypeForm, setNewTypeForm] = useState<string>('');
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

  // Cargar text types al inicializar
  useEffect(() => {
    loadTextTypes();
  }, []);

  const loadTextTypes = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('🔍 [TextTypesManager] Iniciando carga de text types...');
      const types = await getAllTextTypes();
      console.log('📦 [TextTypesManager] Text types recibidos:', types);
      setTextTypes(types);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ [TextTypesManager] Error al cargar text types:', error);
      setError(errorMsg);
      showNotification(`Error al cargar tipos de texto: ${errorMsg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Crear nuevo text type
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTypeForm.trim()) {
      showNotification('El tipo de texto es obligatorio', 'warning');
      return;
    }

    try {
      setLoadingOperation('create');
      
      const newType = await createTextType({ type: newTypeForm.trim() });
      
      setTextTypes(prev => [...prev, newType]);
      setNewTypeForm('');
      setIsCreating(false);
      showNotification(`Tipo de texto "${newType.type}" creado exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al crear tipo: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };

  // Iniciar edición
  const handleStartEdit = (textType: TextType) => {
    setEditingId(textType.id);
    setEditForm(textType.type);
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm('');
  };

  // Guardar edición
  const handleSaveEdit = async (id: number) => {
    if (!editForm.trim()) {
      showNotification('El tipo de texto es obligatorio', 'warning');
      return;
    }

    try {
      setLoadingOperation(`update-${id}`);
      
      const updatedType = await updateTextType(id, { type: editForm.trim() });
      
      setTextTypes(prev => 
        prev.map(type => 
          type.id === id ? updatedType : type
        )
      );
      
      setEditingId(null);
      setEditForm('');
      showNotification(`Tipo de texto actualizado exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al actualizar tipo: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };

  // Eliminar text type
  const handleDelete = async (id: number, typeName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el tipo "${typeName}"?`)) {
      return;
    }

    try {
      setLoadingOperation(`delete-${id}`);
      
      await deleteTextType(id);
      
      setTextTypes(prev => prev.filter(type => type.id !== id));
      showNotification(`Tipo de texto "${typeName}" eliminado exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al eliminar tipo: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };

  if (isLoading) {
    return (
      <div className="text-types-loading">
        <div className="loading-spinner"></div>
        <p>Cargando tipos de texto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-types-error">
        <div className="text-types-error-content">
          <h3>Error al cargar tipos de texto</h3>
          <p>{error}</p>
        </div>
        <button onClick={loadTextTypes} className="btn-retry">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="text-types-manager">
      <div className="text-types-header">
        <h2>🏷️ Gestión de Tipos de Texto</h2>
        <button onClick={() => setIsCreating(!isCreating)} className="btn-new-text-type">
          {isCreating ? '❌ Cancelar' : '➕ Nuevo Tipo'}
        </button>
      </div>

      {/* Formulario de creación */}
      {isCreating && (
        <form onSubmit={handleCreate} className="text-type-create-form">
          <h3>Crear Nuevo Tipo de Texto</h3>
          <div className="text-type-form-row">
            <div className="text-type-form-field">
              <label>
                Nombre del tipo:
              </label>
              <input
                type="text"
                value={newTypeForm}
                onChange={(e) => setNewTypeForm(e.target.value)}
                placeholder="ej: Artículo científico, Novela, Ensayo..."
                disabled={loadingOperation === 'create'}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loadingOperation === 'create'}
              className="btn-text-type-submit"
            >
              {loadingOperation === 'create' ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de text types */}
      <div className="text-types-table-container">
        {textTypes.length === 0 ? (
          <div className="text-types-empty">
            <p>📝 No hay tipos de texto registrados</p>
            <p>Crea el primer tipo de texto usando el botón "Nuevo Tipo"</p>
          </div>
        ) : (
          <div>
            {/* Header de tabla */}
            <div className="text-types-table-header">
              <div>ID</div>
              <div>Tipo de Texto</div>
              <div className="text-types-table-header-actions">Acciones</div>
            </div>

            {/* Filas de datos */}
            {textTypes.map((textType) => (
              <div key={textType.id} className="text-types-table-row">
                <div className="text-type-id">
                  #{textType.id}
                </div>
                
                <div>
                  {editingId === textType.id ? (
                    <input
                      type="text"
                      value={editForm}
                      onChange={(e) => setEditForm(e.target.value)}
                      className="text-type-edit-input"
                      disabled={loadingOperation === `update-${textType.id}`}
                      autoFocus
                    />
                  ) : (
                    <span className="text-type-name">{textType.type}</span>
                  )}
                </div>
                
                <div className="text-type-actions">
                  {editingId === textType.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(textType.id)}
                        disabled={loadingOperation === `update-${textType.id}`}
                        className="btn-text-type-action btn-text-type-save"
                      >
                        {loadingOperation === `update-${textType.id}` ? '...' : '✅'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={loadingOperation === `update-${textType.id}`}
                        className="btn-text-type-action btn-text-type-cancel"
                      >
                        ❌
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(textType)}
                        className="btn-text-type-action btn-text-type-edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(textType.id, textType.type)}
                        disabled={loadingOperation === `delete-${textType.id}`}
                        className="btn-text-type-action btn-text-type-delete"
                      >
                        {loadingOperation === `delete-${textType.id}` ? '...' : '🗑️'}
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