// ReviewsModal.tsx - Modal para ver y crear reseñas de libros

import { useState, useEffect } from 'react';
import './ReviewsModal.css';
import { createReview, getBookReviews, formatReviewDate, generateStars, updateReview, deleteReview } from '../../services/reviewsService';
import type { Review, CreateReviewRequest, ReviewsResponse, UpdateReviewRequest } from '../../services/reviewsService';
import { getCurrentUserId } from '../../services/authService';
import Toast from './Toast';

interface ReviewsModalProps {
  bookId: number;
  bookTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewsModal({ bookId, bookTitle, isOpen, onClose }: ReviewsModalProps) {
  // Estados para las reseñas
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [errorReviews, setErrorReviews] = useState<string>('');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageSize] = useState<number>(10);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);

  // Estados para crear nueva reseña
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newRating, setNewRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Estados para Toast
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [showToast, setShowToast] = useState<boolean>(false);

  // Estados para control de permisos
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loadingUserId, setLoadingUserId] = useState<boolean>(true);
  
  // Estados para edición inline
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState<number>(0);
  const [editComment, setEditComment] = useState<string>('');
  const [editHoverRating, setEditHoverRating] = useState<number>(0);
  const [updatingReview, setUpdatingReview] = useState<boolean>(false);
  
  // Estados para confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
  const [deletingReview, setDeletingReview] = useState<boolean>(false);

  // Función para mostrar notificaciones
  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Cargar reseñas y userId cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadReviews();
      loadCurrentUserId();
    }
  }, [isOpen, bookId]);

  // Cargar ID del usuario actual
  const loadCurrentUserId = async () => {
    try {
      setLoadingUserId(true);
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
      console.log('👤 [ReviewsModal] Usuario actual ID:', userId);
    } catch (error) {
      console.error('❌ [ReviewsModal] Error al obtener usuario actual:', error);
      setCurrentUserId(null);
    } finally {
      setLoadingUserId(false);
    }
  };

  // Cargar reseñas del libro
  const loadReviews = async (page: number = currentPage) => {
    try {
      setLoadingReviews(true);
      setErrorReviews('');
      
      console.log('📚 [ReviewsModal] Cargando reseñas - Página:', page);
      
      const reviewsData: ReviewsResponse = await getBookReviews(bookId, page, pageSize);
      
      setReviews(reviewsData.content || []);
      setTotalReviews(reviewsData.totalElements || 0);
      setAverageRating(reviewsData.averageRating || 0);
      setCurrentPage(reviewsData.page || 0);
      setTotalPages(reviewsData.totalPages || 0);
      setHasNext(reviewsData.hasNext || false);
      setHasPrevious(reviewsData.hasPrevious || false);
      
      console.log('✅ [ReviewsModal] Reseñas cargadas:', {
        total: reviewsData.totalElements,
        currentPage: reviewsData.page,
        totalPages: reviewsData.totalPages
      });
      
    } catch (error) {
      if (error instanceof Error) {
        setErrorReviews(error.message);
        showNotification(`Error al cargar reseñas: ${error.message}`, 'error');
      } else {
        setErrorReviews('Error desconocido al cargar reseñas');
        showNotification('Error desconocido al cargar reseñas', 'error');
      }
    } finally {
      setLoadingReviews(false);
    }
  };

  // Manejar envío de nueva reseña
  const handleSubmitReview = async () => {
    try {
      // Validaciones
      if (newRating === 0) {
        showNotification('Por favor, selecciona una calificación', 'warning');
        return;
      }

      if (!newComment.trim()) {
        showNotification('Por favor, escribe un comentario', 'warning');
        return;
      }

      if (newComment.length > 1000) {
        showNotification('El comentario no puede tener más de 1000 caracteres', 'warning');
        return;
      }

      setSubmittingReview(true);

      const reviewData: CreateReviewRequest = {
        rating: newRating,
        comment: newComment.trim()
      };

      await createReview(bookId, reviewData);

      // Recargar la primera página para incluir la nueva reseña
      await loadReviews(0);

      // Limpiar formulario
      setNewRating(0);
      setNewComment('');
      setShowCreateForm(false);

      showNotification('¡Reseña publicada exitosamente!', 'success');

    } catch (error) {
      if (error instanceof Error) {
        showNotification(`Error: ${error.message}`, 'error');
      } else {
        showNotification('Error desconocido al crear reseña', 'error');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  // Manejar click en estrella para rating
  const handleStarClick = (rating: number) => {
    setNewRating(rating);
  };

  // Manejar hover en estrellas
  const handleStarHover = (rating: number) => {
    setHoverRating(rating);
  };

  // Iniciar edición de una reseña
  const startEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditHoverRating(0);
  };

  // Cancelar edición
  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment('');
    setEditHoverRating(0);
  };

  // Guardar cambios en reseña
  const saveEditReview = async () => {
    if (!editingReviewId) return;
    
    try {
      // Validaciones
      if (editRating === 0) {
        showNotification('Por favor, selecciona una calificación', 'warning');
        return;
      }

      if (!editComment.trim()) {
        showNotification('Por favor, escribe un comentario', 'warning');
        return;
      }

      if (editComment.length > 1000) {
        showNotification('El comentario no puede tener más de 1000 caracteres', 'warning');
        return;
      }

      setUpdatingReview(true);

      const reviewData: UpdateReviewRequest = {
        rating: editRating,
        comment: editComment.trim()
      };

      await updateReview(editingReviewId, reviewData);

      // Recargar reseñas manteniendo la página actual
      await loadReviews(currentPage);

      // Limpiar estado de edición
      cancelEditReview();

      showNotification('¡Reseña actualizada exitosamente!', 'success');

    } catch (error) {
      if (error instanceof Error) {
        showNotification(`Error: ${error.message}`, 'error');
      } else {
        showNotification('Error desconocido al actualizar reseña', 'error');
      }
    } finally {
      setUpdatingReview(false);
    }
  };

  // Manejar eliminación con confirmación
  const handleDeleteReview = (reviewId: number) => {
    setReviewToDelete(reviewId);
    setShowDeleteConfirm(true);
  };

  // Confirmar eliminación
  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    
    try {
      setDeletingReview(true);
      
      await deleteReview(reviewToDelete);
      
      // Recargar reseñas, ajustar página si es necesario
      if (reviews.length === 1 && currentPage > 0) {
        // Si era la única reseña de la página y no es la primera página
        await loadReviews(currentPage - 1);
      } else {
        await loadReviews(currentPage);
      }
      
      showNotification('Reseña eliminada exitosamente', 'success');
      
    } catch (error) {
      if (error instanceof Error) {
        showNotification(`Error: ${error.message}`, 'error');
      } else {
        showNotification('Error desconocido al eliminar reseña', 'error');
      }
    } finally {
      setDeletingReview(false);
      setShowDeleteConfirm(false);
      setReviewToDelete(null);
    }
  };

  // Cancelar eliminación
  const cancelDeleteReview = () => {
    setShowDeleteConfirm(false);
    setReviewToDelete(null);
  };

  // Manejar clicks en estrellas para edición
  const handleEditStarClick = (rating: number) => {
    setEditRating(rating);
  };

  // Manejar hover en estrellas para edición
  const handleEditStarHover = (rating: number) => {
    setEditHoverRating(rating);
  };

  // Cerrar modal
  const handleClose = () => {
    setShowCreateForm(false);
    setNewRating(0);
    setNewComment('');
    setHoverRating(0);
    setCurrentPage(0);
    onClose();
  };

  // Renderizar estrellas interactivas para el formulario
  const renderInteractiveStars = () => {
    const displayRating = hoverRating || newRating;
    
    return (
      <div className="interactive-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-button ${star <= displayRating ? 'active' : ''}`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={() => handleStarHover(0)}
          >
            ⭐
          </button>
        ))}
        <span className="rating-text">
          {displayRating > 0 ? `${displayRating} estrella${displayRating > 1 ? 's' : ''}` : 'Selecciona tu calificación'}
        </span>
      </div>
    );
  };

  // Renderizar estrellas para edición
  const renderEditStars = () => {
    const displayRating = editHoverRating || editRating;
    
    return (
      <div className="interactive-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-button ${star <= displayRating ? 'active' : ''}`}
            onClick={() => handleEditStarClick(star)}
            onMouseEnter={() => handleEditStarHover(star)}
            onMouseLeave={() => handleEditStarHover(0)}
            disabled={updatingReview}
          >
            ⭐
          </button>
        ))}
        <span className="rating-text">
          {displayRating > 0 ? `${displayRating} estrella${displayRating > 1 ? 's' : ''}` : 'Selecciona tu calificación'}
        </span>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="reviews-modal-overlay" onClick={handleClose}>
        <div className="reviews-modal-content" onClick={(e) => e.stopPropagation()}>
          
          {/* Header del modal */}
          <div className="reviews-modal-header">
            <h2>📝 Reseñas de "{bookTitle}"</h2>
            <button 
              className="reviews-modal-close"
              onClick={handleClose}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          </div>

          {/* Resumen de reseñas */}
          <div className="reviews-summary">
            {totalReviews > 0 ? (
              <>
                <div className="average-rating">
                  <span className="rating-number">{averageRating.toFixed(1)}</span>
                  <span className="rating-stars">{generateStars(averageRating)}</span>
                  <span className="reviews-count">({totalReviews} reseña{totalReviews > 1 ? 's' : ''})</span>
                </div>
              </>
            ) : (
              <div className="no-reviews-summary">
                <span>Sin reseñas aún</span>
              </div>
            )}
          </div>

          {/* Botón para escribir nueva reseña */}
          {!showCreateForm && (
            <div className="reviews-actions">
              <button 
                className="btn-write-review"
                onClick={() => setShowCreateForm(true)}
              >
                ✍️ Escribir reseña
              </button>
            </div>
          )}

          {/* Formulario para nueva reseña */}
          {showCreateForm && (
            <div className="create-review-form">
              <h3>Escribir nueva reseña</h3>
              
              <div className="form-group">
                <label htmlFor="rating">Calificación:</label>
                {renderInteractiveStars()}
              </div>

              <div className="form-group">
                <label htmlFor="comment">Comentario:</label>
                <textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Comparte tu opinión sobre este libro..."
                  rows={4}
                  maxLength={1000}
                  disabled={submittingReview}
                />
                <div className="character-count">
                  {newComment.length}/1000 caracteres
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewRating(0);
                    setNewComment('');
                    setHoverRating(0);
                  }}
                  disabled={submittingReview}
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  className="btn-submit"
                  onClick={handleSubmitReview}
                  disabled={submittingReview || newRating === 0 || !newComment.trim()}
                >
                  {submittingReview ? 'Publicando...' : 'Publicar reseña'}
                </button>
              </div>
            </div>
          )}

          {/* Lista de reseñas */}
          <div className="reviews-list">
            {loadingReviews && (
              <div className="reviews-loading">
                <div className="loading-spinner"></div>
                <p>Cargando reseñas...</p>
              </div>
            )}

            {errorReviews && (
              <div className="reviews-error">
                <p>❌ {errorReviews}</p>
                <button onClick={() => loadReviews()} className="btn-retry">
                  🔄 Reintentar
                </button>
              </div>
            )}

            {!loadingReviews && !errorReviews && reviews.length === 0 && (
              <div className="no-reviews">
                <p>📝 Aún no hay reseñas para este libro.</p>
                <p>¡Sé el primero en escribir una!</p>
              </div>
            )}

            {!loadingReviews && !errorReviews && reviews.length > 0 && (
              <div className="reviews-container">
                {reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="review-user">
                        <span className="user-name">{review.userFirstName}</span>
                        {editingReviewId === review.id ? (
                          renderEditStars()
                        ) : (
                          <span className="review-rating">{generateStars(review.rating)}</span>
                        )}
                      </div>
                      <div className="review-meta">
                        <div className="review-date">
                          {formatReviewDate(review.createdAt)}
                        </div>
                        
                        {/* Botones de acción solo para el propietario */}
                        {!loadingUserId && currentUserId === review.userId && (
                          <div className="review-actions">
                            {editingReviewId === review.id ? (
                              <>
                                <button 
                                  className="review-btn save-btn"
                                  onClick={saveEditReview}
                                  disabled={updatingReview || editRating === 0 || !editComment.trim()}
                                  title="Guardar cambios"
                                >
                                  {updatingReview ? '⏳' : '✅'}
                                </button>
                                <button 
                                  className="review-btn cancel-btn"
                                  onClick={cancelEditReview}
                                  disabled={updatingReview}
                                  title="Cancelar edición"
                                >
                                  ❌
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  className="review-btn edit-btn"
                                  onClick={() => startEditReview(review)}
                                  title="Editar reseña"
                                >
                                  ✏️
                                </button>
                                <button 
                                  className="review-btn delete-btn"
                                  onClick={() => handleDeleteReview(review.id)}
                                  title="Eliminar reseña"
                                >
                                  🗑️
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Comentario - editable o solo lectura */}
                    <div className="review-comment">
                      {editingReviewId === review.id ? (
                        <div className="edit-comment-container">
                          <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            placeholder="Actualiza tu comentario..."
                            rows={4}
                            maxLength={1000}
                            disabled={updatingReview}
                            className="edit-comment-textarea"
                          />
                          <div className="character-count">
                            {editComment.length}/1000 caracteres
                          </div>
                        </div>
                      ) : (
                        review.comment
                      )}
                    </div>
                    
                    {review.updatedAt !== review.createdAt && editingReviewId !== review.id && (
                      <div className="review-edited">
                        <small>Editado el {formatReviewDate(review.updatedAt)}</small>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Paginación */}
            {!loadingReviews && !errorReviews && totalPages > 1 && (
              <div className="reviews-pagination">
                <button 
                  className="pagination-btn"
                  onClick={() => loadReviews(0)}
                  disabled={!hasPrevious}
                  title="Primera página"
                >
                  ⏮️
                </button>
                <button 
                  className="pagination-btn"
                  onClick={() => loadReviews(currentPage - 1)}
                  disabled={!hasPrevious}
                  title="Página anterior"
                >
                  ◀️
                </button>
                
                <span className="pagination-info">
                  Página {currentPage + 1} de {totalPages}
                </span>
                
                <button 
                  className="pagination-btn"
                  onClick={() => loadReviews(currentPage + 1)}
                  disabled={!hasNext}
                  title="Página siguiente"
                >
                  ▶️
                </button>
                <button 
                  className="pagination-btn"
                  onClick={() => loadReviews(totalPages - 1)}
                  disabled={!hasNext}
                  title="Última página"
                >
                  ⏭️
                </button>
              </div>
            )}
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
      
      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h3>🗑️ Confirmar eliminación</h3>
            <p>¿Estás seguro de que quieres eliminar esta reseña?</p>
            <p className="delete-warning">Esta acción no se puede deshacer.</p>
            
            <div className="delete-confirm-actions">
              <button 
                className="btn-cancel-delete"
                onClick={cancelDeleteReview}
                disabled={deletingReview}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm-delete"
                onClick={confirmDeleteReview}
                disabled={deletingReview}
              >
                {deletingReview ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}