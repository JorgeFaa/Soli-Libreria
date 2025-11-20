// EditShelfModal.tsx - Modal para editar estanterías existentes

import { useState, useEffect } from 'react';
import './CreateShelfModal.css'; // Reutilizar los mismos estilos
import { updateBookshelf } from '../../services/shelvesService';
import type { UpdateBookshelfRequest, Bookshelf } from '../../services/shelvesService';
import Toast from './Toast';

interface EditShelfModalProps {
  isOpen: boolean;
  shelf: Bookshelf | null;
  onClose: () => void;
  onShelfUpdated: () => void;
}

export default function EditShelfModal({ isOpen, shelf, onClose, onShelfUpdated }: EditShelfModalProps) {
  // Estados del formulario
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Estados para Toast
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [showToast, setShowToast] = useState<boolean>(false);

  // Función para mostrar notificaciones
  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Cargar datos de la estantería cuando se abre el modal
  useEffect(() => {
    if (isOpen && shelf) {
      setName(shelf.name);
      setDescription(shelf.description || '');
    }
  }, [isOpen, shelf]);

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shelf) {
      showNotification('Error: No se pudo cargar la estantería', 'error');
      return;
    }

    try {
      // Validaciones
      if (!name.trim()) {
        showNotification('El nombre de la estantería es obligatorio', 'warning');
        return;
      }

      if (name.length > 100) {
        showNotification('El nombre no puede tener más de 100 caracteres', 'warning');
        return;
      }

      if (description.length > 500) {
        showNotification('La descripción no puede tener más de 500 caracteres', 'warning');
        return;
      }

      setIsSubmitting(true);

      const shelfData: UpdateBookshelfRequest = {
        name: name.trim(),
        description: description.trim()
      };

      await updateBookshelf(shelf.id, shelfData);

      // Notificar al componente padre
      onShelfUpdated();

      showNotification('¡Estantería actualizada exitosamente!', 'success');
      
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      if (error instanceof Error) {
        showNotification(`Error: ${error.message}`, 'error');
      } else {
        showNotification('Error desconocido al actualizar estantería', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if (!isSubmitting) {
      setShowToast(false);
      onClose();
    }
  };

  if (!isOpen || !shelf) return null;

  return (
    <>
      {/* Overlay */}
      <div className="create-shelf-overlay" onClick={handleClose}>
        <div className="create-shelf-content" onClick={(e) => e.stopPropagation()}>
          
          {/* Header del modal */}
          <div className="create-shelf-header">
            <h2>✏️ Editar Estantería</h2>
            <button 
              className="create-shelf-close"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="create-shelf-form">
            
            {/* Campo de nombre */}
            <div className="form-group">
              <label htmlFor="edit-shelf-name">
                Nombre de la estantería <span className="required">*</span>
              </label>
              <input
                id="edit-shelf-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Mis favoritos, Ciencia ficción, Para leer después..."
                maxLength={100}
                disabled={isSubmitting}
                className="form-input"
                autoFocus
              />
              <div className="character-count">
                {name.length}/100 caracteres
              </div>
            </div>

            {/* Campo de descripción */}
            <div className="form-group">
              <label htmlFor="edit-shelf-description">
                Descripción (opcional)
              </label>
              <textarea
                id="edit-shelf-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe qué tipo de libros planeas guardar en esta estantería..."
                maxLength={500}
                rows={4}
                disabled={isSubmitting}
                className="form-textarea"
              />
              <div className="character-count">
                {description.length}/500 caracteres
              </div>
            </div>

            {/* Acciones del formulario */}
            <div className="form-actions">
              <button 
                type="button"
                className="btn-cancel"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="btn-create"
                disabled={isSubmitting || !name.trim()}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    Actualizando...
                  </>
                ) : (
                  <>
                    ✏️ Guardar Cambios
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Información de la estantería */}
          <div className="shelf-info">
            <p className="info-text">
              📚 <strong>Estantería:</strong> {shelf.name}
            </p>
            <p className="info-text">
              📖 <strong>Libros:</strong> {shelf.bookCount || 0} libro{(shelf.bookCount || 0) !== 1 ? 's' : ''}
            </p>
            <p className="info-text">
              📅 <strong>Creada:</strong> {new Date(shelf.createdAt).toLocaleDateString('es-ES')}
            </p>
          </div>

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
    </>
  );
}