// CreateShelfModal.tsx - Modal para crear nuevas estanterías

import { useState } from 'react';
import './CreateShelfModal.css';
import { createBookshelf } from '../../services/shelvesService';
import type { CreateBookshelfRequest } from '../../services/shelvesService';
import Toast from './Toast';

interface CreateShelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShelfCreated: () => void; // Simplificado - no necesita el objeto
}

export default function CreateShelfModal({ isOpen, onClose, onShelfCreated }: CreateShelfModalProps) {
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

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      const shelfData: CreateBookshelfRequest = {
        name: name.trim(),
        description: description.trim()
      };

      await createBookshelf(shelfData);

      // Notificar al componente padre que se creó exitosamente
      onShelfCreated();

      // Limpiar formulario
      setName('');
      setDescription('');
      
      showNotification('¡Estantería creada exitosamente!', 'success');
      
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      if (error instanceof Error) {
        showNotification(`Error: ${error.message}`, 'error');
      } else {
        showNotification('Error desconocido al crear estantería', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      setDescription('');
      setShowToast(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="create-shelf-overlay" onClick={handleClose}>
        <div className="create-shelf-content" onClick={(e) => e.stopPropagation()}>
          
          {/* Header del modal */}
          <div className="create-shelf-header">
            <h2>📚 Crear Nueva Estantería</h2>
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
              <label htmlFor="shelf-name">
                Nombre de la estantería <span className="required">*</span>
              </label>
              <input
                id="shelf-name"
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
              <label htmlFor="shelf-description">
                Descripción (opcional)
              </label>
              <textarea
                id="shelf-description"
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
                    Creando...
                  </>
                ) : (
                  <>
                    📚 Crear Estantería
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Información adicional */}
          <div className="shelf-info">
            <p className="info-text">
              💡 <strong>Consejo:</strong> Puedes crear estanterías temáticas como "Libros de aventura", 
              "Pendientes por leer" o "Recomendaciones favoritas".
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