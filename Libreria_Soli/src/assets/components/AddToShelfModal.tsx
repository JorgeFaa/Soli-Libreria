// AddToShelfModal.tsx - Modal para agregar libros a estanterías

import React, { useState, useEffect } from 'react';
import { getUserBookshelves, addBookToBookshelf } from '../../services/shelvesService';
import type { Bookshelf } from '../../services/shelvesService';
import './AddToShelfModal.css';

interface AddToShelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: number;
  bookTitle: string;
  onBookAdded: (shelfName: string) => void;
}

export const AddToShelfModal: React.FC<AddToShelfModalProps> = ({
  isOpen,
  onClose,
  bookId,
  bookTitle,
  onBookAdded
}) => {
  const [shelves, setShelves] = useState<Bookshelf[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedShelfId, setSelectedShelfId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Cargar estanterías cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadUserShelves();
    } else {
      // Limpiar estado cuando se cierra el modal
      setShelves([]);
      setError(null);
      setSelectedShelfId(null);
    }
  }, [isOpen]);

  const loadUserShelves = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('📚 Cargando estanterías del usuario...');
      const userShelves = await getUserBookshelves();
      setShelves(userShelves);
      console.log('✅ Estanterías cargadas exitosamente:', userShelves.length);
    } catch (err) {
      console.error('❌ Error al cargar estanterías:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar estanterías');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToShelf = async () => {
    if (!selectedShelfId) {
      setError('Por favor selecciona una estantería');
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      console.log('📖 Agregando libro a estantería:', { bookId, shelfId: selectedShelfId });
      await addBookToBookshelf(selectedShelfId, bookId);
      
      const selectedShelf = shelves.find(shelf => shelf.id === selectedShelfId);
      const shelfName = selectedShelf?.name || 'estantería';
      
      console.log('✅ Libro agregado exitosamente');
      onBookAdded(shelfName);
      onClose();
    } catch (err) {
      console.error('❌ Error al agregar libro:', err);
      
      let userFriendlyError = 'Error desconocido al agregar libro';
      
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();
        
        if (errorMessage.includes('ya está agregado')) {
          userFriendlyError = 'Este libro ya está en la estantería seleccionada.';
        } else if (errorMessage.includes('token expirado') || errorMessage.includes('sesión expirada')) {
          userFriendlyError = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else if (errorMessage.includes('sin permisos')) {
          userFriendlyError = 'No tienes permisos para agregar libros a esta estantería.';
        } else if (errorMessage.includes('no existe')) {
          userFriendlyError = 'La estantería o el libro ya no están disponibles.';
        } else if (errorMessage.includes('error del servidor') || errorMessage.includes('error interno')) {
          userFriendlyError = 'Problema temporal del servidor. Por favor, intenta nuevamente en unos momentos.';
        } else {
          userFriendlyError = err.message;
        }
      }
      
      setError(userFriendlyError);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short'
      });
    } catch {
      return dateString;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="add-to-shelf-overlay" onClick={handleBackdropClick}>
      <div className="add-to-shelf-modal">
        {/* Header del Modal */}
        <div className="add-to-shelf-header">
          <h3>📚 Agregar a Estantería</h3>
          <button 
            className="add-to-shelf-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Información del libro */}
        <div className="book-info-section">
          <p className="book-title-info">
            <strong>Libro:</strong> {bookTitle}
          </p>
        </div>

        {/* Contenido del Modal */}
        <div className="add-to-shelf-content">
          {loading && (
            <div className="add-to-shelf-loading">
              <div className="loading-spinner"></div>
              <p>Cargando estanterías...</p>
            </div>
          )}

          {error && (
            <div className="add-to-shelf-error">
              <p>❌ {error}</p>
              <div className="error-actions">
                {error.toLowerCase().includes('servidor') || error.toLowerCase().includes('temporal') ? (
                  <button className="retry-btn" onClick={handleAddToShelf} disabled={isAdding}>
                    {isAdding ? 'Intentando...' : 'Reintentar agregado'}
                  </button>
                ) : null}
                <button className="retry-btn secondary" onClick={loadUserShelves}>
                  Recargar estanterías
                </button>
              </div>
            </div>
          )}

          {!loading && !error && shelves.length === 0 && (
            <div className="no-shelves">
              <div className="no-shelves-icon">📚</div>
              <h4>No tienes estanterías</h4>
              <p>Crea tu primera estantería en tu perfil para organizar tus libros.</p>
            </div>
          )}

          {!loading && !error && shelves.length > 0 && (
            <div className="shelves-list">
              <h4>Selecciona una estantería:</h4>
              <div className="shelves-options">
                {shelves.map((shelf) => (
                  <div 
                    key={shelf.id}
                    className={`shelf-option ${selectedShelfId === shelf.id ? 'selected' : ''}`}
                    onClick={() => setSelectedShelfId(shelf.id)}
                  >
                    <div className="shelf-option-header">
                      <div className="shelf-radio">
                        <input
                          type="radio"
                          id={`shelf-${shelf.id}`}
                          name="selectedShelf"
                          checked={selectedShelfId === shelf.id}
                          onChange={() => setSelectedShelfId(shelf.id)}
                        />
                        <label htmlFor={`shelf-${shelf.id}`} className="shelf-name">
                          {shelf.name}
                        </label>
                      </div>
                      <span className="shelf-count">
                        {shelf.bookCount || 0} libro{shelf.bookCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {shelf.description && (
                      <p className="shelf-description">{shelf.description}</p>
                    )}
                    
                    <p className="shelf-date">
                      Creada el {formatDate(shelf.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="add-to-shelf-footer">
          <div className="shelf-actions">
            <button 
              className="btn-cancel" 
              onClick={onClose}
              disabled={isAdding}
            >
              Cancelar
            </button>
            <button 
              className="btn-add-book"
              onClick={handleAddToShelf}
              disabled={!selectedShelfId || isAdding || loading}
            >
              {isAdding ? 'Agregando...' : 'Agregar Libro'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToShelfModal;