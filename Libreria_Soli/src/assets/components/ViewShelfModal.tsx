// ViewShelfModal.tsx - Modal para mostrar detalles completos de una estantería

import React, { useState, useEffect } from 'react';
import { getBookshelfById, removeBookFromBookshelf } from '../../services/shelvesService';
import type { Bookshelf } from '../../services/shelvesService';
import './ViewShelfModal.css';

interface ViewShelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  shelfId: number | null;
  shelfName?: string;
  onBookRemoved?: (bookTitle: string) => void;
}

export const ViewShelfModal: React.FC<ViewShelfModalProps> = ({
  isOpen,
  onClose,
  shelfId,
  shelfName,
  onBookRemoved
}) => {
  const [shelf, setShelf] = useState<Bookshelf | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingBookId, setRemovingBookId] = useState<number | null>(null);

  // Cargar datos de la estantería cuando se abre el modal
  useEffect(() => {
    if (isOpen && shelfId) {
      loadShelfDetails();
    } else if (!isOpen) {
      // Limpiar estado cuando se cierra el modal
      setShelf(null);
      setError(null);
    }
  }, [isOpen, shelfId]);

  const loadShelfDetails = async () => {
    if (!shelfId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📖 Cargando detalles de estantería:', shelfId);
      const shelfData = await getBookshelfById(shelfId);
      setShelf(shelfData);
      console.log('✅ Estantería cargada exitosamente');
    } catch (err) {
      console.error('❌ Error al cargar estantería:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar la estantería');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBook = async (bookId: number, bookTitle: string) => {
    if (!shelfId) return;

    setRemovingBookId(bookId);

    try {
      console.log('🗑️ Eliminando libro de estantería:', { shelfId, bookId });
      await removeBookFromBookshelf(shelfId, bookId);
      
      // Actualizar la estantería local eliminando el libro
      if (shelf) {
        const updatedBooks = shelf.books?.filter(book => book.id !== bookId) || [];
        setShelf({
          ...shelf,
          books: updatedBooks,
          bookCount: updatedBooks.length
        });
      }
      
      console.log('✅ Libro eliminado exitosamente');
      if (onBookRemoved) {
        onBookRemoved(bookTitle);
      }
    } catch (err) {
      console.error('❌ Error al eliminar libro:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al eliminar libro');
    } finally {
      setRemovingBookId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleBookClick = (bookId: number) => {
    // Solo navegar si no estamos eliminando este libro
    if (removingBookId !== bookId) {
      window.location.href = `/libro/${bookId}`;
    }
  };

  const formatPublishedDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short'
      });
    } catch {
      return dateString;
    }
  };

  const getAuthorFullName = (author: any) => {
    const parts = [author.name, author.middleName, author.lastName].filter(Boolean);
    return parts.join(' ');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="view-shelf-overlay" onClick={handleBackdropClick}>
      <div className="view-shelf-modal">
        {/* Header del Modal */}
        <div className="view-shelf-header">
          <div className="view-shelf-title-section">
            <h2>{shelf?.name || shelfName || 'Estantería'}</h2>
            <button 
              className="view-shelf-close"
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          </div>
          
          {shelf && (
            <div className="view-shelf-info">
              <p className="shelf-description">{shelf.description}</p>
              <div className="shelf-meta">
                <span className="book-count">{shelf.bookCount || 0} libros</span>
                <span className="created-date">Creada el {formatDate(shelf.createdAt)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Contenido del Modal */}
        <div className="view-shelf-content">
          {loading && (
            <div className="view-shelf-loading">
              <div className="loading-spinner"></div>
              <p>Cargando estantería...</p>
            </div>
          )}

          {error && (
            <div className="view-shelf-error">
              <p>❌ {error}</p>
              <button className="retry-btn" onClick={loadShelfDetails}>
                Intentar nuevamente
              </button>
            </div>
          )}

          {shelf && !loading && !error && (
            <div className="shelf-books-container">
              {(!shelf.books || shelf.books.length === 0) ? (
                <div className="empty-shelf">
                  <div className="empty-shelf-icon">📚</div>
                  <h3>Estantería vacía</h3>
                  <p>Aún no has agregado libros a esta estantería.</p>
                </div>
              ) : (
                <div className="books-grid">
                  {shelf.books.map((book) => (
                    <div 
                      key={book.id} 
                      className="book-card"
                    >
                      <div className="book-cover" onClick={() => handleBookClick(book.id)}>
                        {book.coverUrl ? (
                          <img 
                            src={book.coverUrl} 
                            alt={`Portada de ${book.title}`}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="book-cover-fallback" style={{display: book.coverUrl ? 'none' : 'flex'}}>
                          📖
                        </div>
                      </div>

                      <div className="book-info" onClick={() => handleBookClick(book.id)}>
                        <h4 className="book-title">{book.title}</h4>
                        
                        {book.authors && book.authors.length > 0 && (
                          <p className="book-authors">
                            {book.authors.map(author => getAuthorFullName(author)).join(', ')}
                          </p>
                        )}

                        <div className="book-details">
                          {book.publishedDate && (
                            <span className="book-date">{formatPublishedDate(book.publishedDate)}</span>
                          )}
                          
                          {book.type && (
                            <span className="book-type">{book.type.type}</span>
                          )}
                        </div>

                        {book.genres && book.genres.length > 0 && (
                          <div className="book-genres">
                            {book.genres.slice(0, 3).map((genre) => (
                              <span key={genre.id} className="genre-tag">
                                {genre.name}
                              </span>
                            ))}
                            {book.genres.length > 3 && (
                              <span className="genre-more">+{book.genres.length - 3}</span>
                            )}
                          </div>
                        )}

                        {book.editorials && book.editorials.length > 0 && (
                          <p className="book-editorial">
                            {book.editorials[0].companyName}
                          </p>
                        )}
                      </div>

                      {/* Botón de eliminar más prominente */}
                      <div className="book-actions">
                        <button
                          className="remove-book-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBook(book.id, book.title);
                          }}
                          disabled={removingBookId === book.id}
                          title="Eliminar de la estantería"
                        >
                          {removingBookId === book.id ? (
                            <>
                              <span className="btn-spinner">⏳</span>
                              <span>Eliminando...</span>
                            </>
                          ) : (
                            <>
                              <span className="btn-icon">🗑️</span>
                              <span>Eliminar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con acciones adicionales */}
        <div className="view-shelf-footer">
          <div className="shelf-actions">
            <button className="btn-secondary" onClick={onClose}>
              Cerrar
            </button>
            {shelf && (
              <button className="btn-primary" onClick={() => {
                console.log('🔗 Compartir estantería:', shelf.id);
                // TODO: Implementar compartir estantería
              }}>
                Compartir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewShelfModal;