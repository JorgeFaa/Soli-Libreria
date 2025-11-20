import { useState, useEffect } from 'react';
import { 
  getAllCountries, 
  updateCountry, 
  deleteCountry, 
  createCountry,
  type Country
} from '../../services/adminService';

import Toast from './Toast';
import './CountriesManager.css';

export default function CountriesManager() {
  // Estados para manejo de datos
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Estados para formularios
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<string>('');
  const [newCountryForm, setNewCountryForm] = useState<string>('');
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

  // Cargar países al inicializar
  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('🔍 [CountriesManager] Iniciando carga de países...');
      const countriesList = await getAllCountries();
      console.log('📦 [CountriesManager] Países recibidos:', countriesList);
      setCountries(countriesList);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ [CountriesManager] Error al cargar países:', error);
      setError(errorMsg);
      showNotification(`Error al cargar países: ${errorMsg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Crear nuevo país
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCountryForm.trim()) {
      showNotification('El nombre del país es obligatorio', 'warning');
      return;
    }

    try {
      setLoadingOperation('create');
      
      const newCountry = await createCountry({ countryname: newCountryForm.trim() });
      
      setCountries(prev => [...prev, newCountry]);
      setNewCountryForm('');
      setIsCreating(false);
      showNotification(`País "${newCountry.name}" creado exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al crear país: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };

  // Iniciar edición
  const handleStartEdit = (country: Country) => {
    setEditingId(country.id);
    setEditForm(country.name);
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm('');
  };

  // Guardar edición
  const handleSaveEdit = async (id: number) => {
    if (!editForm.trim()) {
      showNotification('El nombre del país es obligatorio', 'warning');
      return;
    }

    try {
      setLoadingOperation(`update-${id}`);
      
      const updatedCountry = await updateCountry(id, { countryname: editForm.trim() });
      
      setCountries(prev => 
        prev.map(country => 
          country.id === id ? updatedCountry : country
        )
      );
      
      setEditingId(null);
      setEditForm('');
      showNotification(`País actualizado exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al actualizar país: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };

  // Eliminar país
  const handleDelete = async (id: number, countryName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el país "${countryName}"?\n\nEsto podría afectar autores y editoriales asociadas.`)) {
      return;
    }

    try {
      setLoadingOperation(`delete-${id}`);
      
      await deleteCountry(id);
      
      setCountries(prev => prev.filter(country => country.id !== id));
      showNotification(`País "${countryName}" eliminado exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al eliminar país: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };

  if (isLoading) {
    return (
      <div className="countries-loading">
        <div className="loading-spinner"></div>
        <p>Cargando países...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="countries-error">
        <div className="countries-error-content">
          <h3>Error al cargar países</h3>
          <p>{error}</p>
        </div>
        <button 
          onClick={loadCountries}
          className="btn-retry"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="countries-manager">
      <div className="countries-header">
        <h2>🌍 Gestión de Países</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className={`btn-new-country ${isCreating ? 'cancel' : ''}`}
        >
          {isCreating ? '❌ Cancelar' : '➕ Nuevo País'}
        </button>
      </div>

      {/* Formulario de creación */}
      {isCreating && (
        <form onSubmit={handleCreate} className="country-create-form">
          <h3>Crear Nuevo País</h3>
          <div className="country-form-row">
            <div className="country-form-field">
              <label>
                Nombre del país:
              </label>
              <input
                type="text"
                value={newCountryForm}
                onChange={(e) => setNewCountryForm(e.target.value)}
                placeholder="ej: México, España, Argentina, Colombia..."
                disabled={loadingOperation === 'create'}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loadingOperation === 'create'}
              className="btn-country-submit"
            >
              {loadingOperation === 'create' ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de países */}
      <div className="countries-table">
        {countries.length === 0 ? (
          <div className="countries-empty">
            <p>🌍 No hay países registrados</p>
            <p>Crea el primer país usando el botón "Nuevo País"</p>
          </div>
        ) : (
          <div>
            {/* Header de tabla */}
            <div className="countries-table-header">
              <div>ID</div>
              <div>Nombre del País</div>
              <div>Autores</div>
              <div>Editoriales</div>
              <div className="countries-table-header-actions">Acciones</div>
            </div>

            {/* Filas de datos */}
            {countries.map((country) => (
              <div 
                key={country.id}
                className="countries-table-row"
              >
                <div className="countries-cell-id">
                  #{country.id}
                </div>
                
                <div>
                  {editingId === country.id ? (
                    <input
                      type="text"
                      value={editForm}
                      onChange={(e) => setEditForm(e.target.value)}
                      className="countries-edit-input"
                      disabled={loadingOperation === `update-${country.id}`}
                      autoFocus
                    />
                  ) : (
                    <div>
                      <div className="countries-cell-name">{country.name}</div>
                    </div>
                  )}
                </div>

                <div className="countries-cell-count">
                  {country.authors && country.authors.length > 0 ? (
                    <span>{country.authors.length} autor{country.authors.length !== 1 ? 'es' : ''}</span>
                  ) : (
                    <span className="countries-cell-empty">Sin autores</span>
                  )}
                </div>

                <div className="countries-cell-count">
                  {country.editorials && country.editorials.length > 0 ? (
                    <div>
                      <span>{country.editorials.length} editorial{country.editorials.length !== 1 ? 'es' : ''}</span>
                      {country.editorials.length > 0 && (
                        <div className="countries-cell-count-detail">
                          {country.editorials.slice(0, 2).map(ed => ed.companyName).join(', ')}
                          {country.editorials.length > 2 && '...'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="countries-cell-empty">Sin editoriales</span>
                  )}
                </div>
                
                <div className="countries-table-actions">
                  {editingId === country.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(country.id)}
                        disabled={loadingOperation === `update-${country.id}`}
                        className="btn-country-action btn-country-save"
                      >
                        {loadingOperation === `update-${country.id}` ? '...' : '✅'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={loadingOperation === `update-${country.id}`}
                        className="btn-country-action btn-country-cancel-edit"
                      >
                        ❌
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(country)}
                        className="btn-country-action btn-country-edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(country.id, country.name)}
                        disabled={loadingOperation === `delete-${country.id}`}
                        className="btn-country-action btn-country-delete"
                      >
                        {loadingOperation === `delete-${country.id}` ? '...' : '🗑️'}
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