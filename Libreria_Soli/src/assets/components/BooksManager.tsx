import { useState, useEffect } from 'react';
import { 
  getAllBooks, 
  updateBook,
  deleteBook, 
  createBook,
  type Book,
  type CreateBookRequest,
  type UpdateBookRequest,
  getAllTextTypes,
  type TextType,
  getAllGenres,
  type Genre,
  getAllEditorials,
  type Editorial,
  getAllAuthors,
  type Author
} from '../../services/adminService';

import Toast from './Toast';
import './BooksManager.css';

export default function BooksManager() {
  // Estados para manejo de datos
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Estados para datos de formularios
  const [textTypes, setTextTypes] = useState<TextType[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [editorials, setEditorials] = useState<Editorial[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);

  
  // Estados para formularios
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<UpdateBookRequest>({
    title: '',
    description: '',
    publishedDate: '',
    pdfUrl: '',
    epubUrl: '',
    coverUrl: '',
    typeId: 0,
    authorIds: [],
    editorialIds: [],
    genreIds: []
  });
  const [newBookForm, setNewBookForm] = useState<CreateBookRequest>({
    title: '',
    description: '',
    publishedDate: '',
    pdfUrl: '',
    epubUrl: '',
    coverUrl: '',
    typeId: 0,
    authorIds: [],
    editorialIds: [],
    genreIds: []
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
      console.log('🔍 [BooksManager] Iniciando carga de datos...');
      
      // Cargar todos los datos en paralelo
      const [booksData, textTypesData, genresData, editorialsData, authorsData] = await Promise.all([
        getAllBooks(),
        getAllTextTypes(),
        getAllGenres(),
        getAllEditorials(),
        getAllAuthors()
      ]);
      
      console.log('📦 [BooksManager] Datos recibidos:', {
        books: booksData.length,
        textTypes: textTypesData.length,
        genres: genresData.length,
        editorials: editorialsData.length,
        authors: authorsData.length
      });
      
      setBooks(booksData);
      setTextTypes(textTypesData);
      setGenres(genresData);
      setEditorials(editorialsData);
      setAuthors(authorsData);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ [BooksManager] Error al cargar datos:', error);
      setError(errorMsg);
      showNotification(`Error al cargar datos: ${errorMsg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener fecha actual en formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Crear nuevo libro
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBookForm.title.trim()) {
      showNotification('El título del libro es obligatorio', 'warning');
      return;
    }

    if (!newBookForm.typeId || newBookForm.typeId === 0) {
      showNotification('Debe seleccionar un tipo de texto', 'warning');
      return;
    }

    if (newBookForm.authorIds.length === 0) {
      showNotification('Debe seleccionar al menos un autor', 'warning');
      return;
    }

    if (newBookForm.editorialIds.length === 0) {
      showNotification('Debe seleccionar al menos una editorial', 'warning');
      return;
    }

    if (newBookForm.genreIds.length === 0) {
      showNotification('Debe seleccionar al menos un género', 'warning');
      return;
    }

    try {
      setLoadingOperation('create');
      
      const newBook = await createBook(newBookForm);
      
      setBooks(prev => [...prev, newBook]);
      setNewBookForm({
        title: '',
        description: '',
        publishedDate: '',
        pdfUrl: '',
        epubUrl: '',
        coverUrl: '',
        typeId: 0,
        authorIds: [],
        editorialIds: [],
        genreIds: []
      });
      setIsCreating(false);
      showNotification(`Libro "${newBook.title}" creado exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al crear libro: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };
      
  // Iniciar edición de un libro
  const handleStartEdit = (book: Book) => {
    setEditingId(book.id);
    setEditForm({
      title: book.title,
      description: book.description,
      publishedDate: book.publishedDate,
      pdfUrl: book.pdfUrl,
      epubUrl: book.epubUrl,
      coverUrl: book.coverUrl,
      typeId: book.type.id,
      authorIds: book.authors.map(a => a.id),
      editorialIds: book.editorials.map(e => e.id),
      genreIds: book.genres.map(g => g.id)
    });
  };

  // Guardar edición
  const handleSaveEdit = async (id: number) => {
    try {
      setLoadingOperation(`update-${id}`);
      const updatedBook = await updateBook(id, editForm);
      setBooks(books.map(book => book.id === id ? updatedBook : book));
      setEditingId(null);
      setEditForm({
        title: '',
        description: '',
        publishedDate: '',
        pdfUrl: '',
        epubUrl: '',
        coverUrl: '',
        typeId: 0,
        authorIds: [],
        editorialIds: [],
        genreIds: []
      });
      showNotification('Libro actualizado correctamente', 'success');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al actualizar libro: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };


  // Eliminar libro
  const handleDelete = async (id: number, bookTitle: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el libro "${bookTitle}"?`)) {
      return;
    }

    try {
      setLoadingOperation(`delete-${id}`);
      
      await deleteBook(id);
      
      setBooks(prev => prev.filter(book => book.id !== id));
      showNotification(`Libro "${bookTitle}" eliminado exitosamente`, 'success');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showNotification(`Error al eliminar libro: ${errorMsg}`, 'error');
    } finally {
      setLoadingOperation('');
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  if (isLoading) {
    return (
      <div className="books-loading">
        <div className="loading-spinner"></div>
        <p>Cargando libros y datos relacionados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="books-error">
        <div className="books-error-content">
          <h3>Error al cargar libros</h3>
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
    <div className="books-manager">
      <div className="books-header">
        <h2>📚 Gestión de Libros</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className={`btn-new-book ${isCreating ? 'cancel' : ''}`}
        >
          {isCreating ? '❌ Cancelar' : '➕ Nuevo Libro'}
        </button>
      </div>

      {/* Formulario de creación */}
      {isCreating && (
        <div className="book-create-form">
          <h3>Crear Nuevo Libro</h3>
          <form onSubmit={handleCreate}>
            <div className="form-grid-2col">
              <div className="form-field">
                <label>
                  Título *
                </label>
                <input
                  type="text"
                  value={newBookForm.title}
                  onChange={(e) => setNewBookForm(prev => ({ ...prev, title: e.target.value }))}
                  disabled={loadingOperation === 'create'}
                  required
                />
              </div>
              
              <div className="form-field">
                <label>
                  Tipo de Texto *
                </label>
                <select
                  value={newBookForm.typeId}
                  onChange={(e) => setNewBookForm(prev => ({ ...prev, typeId: parseInt(e.target.value) }))}
                  disabled={loadingOperation === 'create'}
                  required
                >
                  <option value={0}>Seleccionar tipo...</option>
                  {textTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-field">
              <label>
                Descripción
              </label>
              <textarea
                value={newBookForm.description}
                onChange={(e) => setNewBookForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                disabled={loadingOperation === 'create'}
              />
            </div>

            <div className="form-grid-3col">
              <div className="form-field">
                <label>
                  Autores *
                </label>
                <select
                  multiple
                  value={newBookForm.authorIds.map(String)}
                  onChange={(e) => {
                    const selectedIds = Array.from(e.target.selectedOptions).map(opt => parseInt(opt.value));
                    setNewBookForm(prev => ({ ...prev, authorIds: selectedIds }));
                  }}
                  disabled={loadingOperation === 'create'}
                  size={4}
                  required
                >
                  {authors.map(author => (
                    <option key={author.id} value={author.id}>
                      {author.name} {author.middleName} {author.lastName}
                    </option>
                  ))}
                </select>
                <small>Mantén Ctrl/Cmd para seleccionar múltiples</small>
              </div>

              <div className="form-field">
                <label>
                  Editoriales *
                </label>
                <select
                  multiple
                  value={newBookForm.editorialIds.map(String)}
                  onChange={(e) => {
                    const selectedIds = Array.from(e.target.selectedOptions).map(opt => parseInt(opt.value));
                    setNewBookForm(prev => ({ ...prev, editorialIds: selectedIds }));
                  }}
                  disabled={loadingOperation === 'create'}
                  size={4}
                  required
                >
                  {editorials.map(editorial => (
                    <option key={editorial.id} value={editorial.id}>
                      {editorial.companyName}
                    </option>
                  ))}
                </select>
                <small>Mantén Ctrl/Cmd para seleccionar múltiples</small>
              </div>

              <div className="form-field">
                <label>
                  Géneros *
                </label>
                <select
                  multiple
                  value={newBookForm.genreIds.map(String)}
                  onChange={(e) => {
                    const selectedIds = Array.from(e.target.selectedOptions).map(opt => parseInt(opt.value));
                    setNewBookForm(prev => ({ ...prev, genreIds: selectedIds }));
                  }}
                  disabled={loadingOperation === 'create'}
                  size={4}
                  required
                >
                  {genres.map(genre => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
                </select>
                <small>Mantén Ctrl/Cmd para seleccionar múltiples</small>
              </div>
            </div>

            <div className="form-grid-3col">
              <div className="form-field">
                <label>
                  Fecha de Publicación
                </label>
                <input
                  type="date"
                  value={newBookForm.publishedDate}
                  onChange={(e) => setNewBookForm(prev => ({ ...prev, publishedDate: e.target.value }))}
                  max={getTodayDate()}
                  disabled={loadingOperation === 'create'}
                />
              </div>

              <div className="form-field">
                <label>
                  URL PDF
                </label>
                <input
                  type="url"
                  value={newBookForm.pdfUrl}
                  onChange={(e) => setNewBookForm(prev => ({ ...prev, pdfUrl: e.target.value }))}
                  placeholder="https://..."
                  disabled={loadingOperation === 'create'}
                />
              </div>

              <div className="form-field">
                <label>
                  URL EPUB
                </label>
                <input
                  type="url"
                  value={newBookForm.epubUrl}
                  onChange={(e) => setNewBookForm(prev => ({ ...prev, epubUrl: e.target.value }))}
                  placeholder="https://..."
                  disabled={loadingOperation === 'create'}
                />
              </div>
            </div>

            <div className="form-field">
              <label>
                URL de Portada
              </label>
              <input
                type="url"
                value={newBookForm.coverUrl}
                onChange={(e) => setNewBookForm(prev => ({ ...prev, coverUrl: e.target.value }))}
                placeholder="https://..."
                disabled={loadingOperation === 'create'}
              />
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
                {loadingOperation === 'create' ? 'Creando...' : 'Crear Libro'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de libros */}
      <div className="books-table">
        {books.length === 0 ? (
          <div className="books-empty">
            <p>📚 No hay libros registrados</p>
            <p>Crea el primer libro usando el botón "Nuevo Libro"</p>
          </div>
        ) : (
          <div>
            {/* Header de tabla */}
            <div className="books-table-header">
              <div>ID</div>
              <div>Título</div>
              <div>Tipo</div>
              <div>Autores</div>
              <div>Géneros</div>
              <div>Fecha Pub.</div>
              <div className="books-table-header-actions">Acciones</div>
            </div>

            {/* Filas de datos */}
            {books.map((book) => (
              <div 
                key={book.id}
                className="books-table-row"
              >
                <div className="books-cell-id">
                  #{book.id}
                </div>
                
                <div>
                  <div className="books-cell-title">
                    {book.title}
                  </div>
                  {book.description && (
                    <div className="books-cell-description">
                      {book.description.length > 60 
                        ? `${book.description.substring(0, 60)}...` 
                        : book.description
                      }
                    </div>
                  )}
                </div>

                <div className="books-cell-type">
                  {book.type.type}
                </div>

                <div className="books-cell-count">
                  {book.authors.length > 0 ? (
                    <div>
                      {book.authors.length} autor{book.authors.length !== 1 ? 'es' : ''}
                      {book.authors.length > 0 && (
                        <div className="books-cell-count-detail">
                          {book.authors.slice(0, 2).map(a => `${a.name} ${a.lastName}`).join(', ')}
                          {book.authors.length > 2 && '...'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="books-cell-empty">Sin autores</span>
                  )}
                </div>

                <div className="books-cell-count">
                  {book.genres.length > 0 ? (
                    <div>
                      {book.genres.length} género{book.genres.length !== 1 ? 's' : ''}
                      {book.genres.length > 0 && (
                        <div className="books-cell-count-detail">
                          {book.genres.slice(0, 2).map(g => g.name).join(', ')}
                          {book.genres.length > 2 && '...'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="books-cell-empty">Sin géneros</span>
                  )}
                </div>

                <div className="books-cell-date">
                  {formatDate(book.publishedDate)}
                </div>
                
                <div className="books-table-actions">
                  <button
                    onClick={() => handleStartEdit(book)}
                    className="btn-book-action btn-book-edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(book.id, book.title)}
                    disabled={loadingOperation === `delete-${book.id}`}
                    className="btn-book-action btn-book-delete"
                  >
                    {loadingOperation === `delete-${book.id}` ? '...' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {editingId !== null && (
        <div className="book-edit-modal-overlay">
          <div className="book-edit-modal">
            <h3>Editar Libro</h3>
            
            <div className="book-edit-form">
              {/* Título */}
              <div className="book-edit-field">
                <label>Título *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              {/* Descripción */}
              <div className="book-edit-field">
                <label>Descripción *</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Fecha de Publicación */}
              <div className="book-edit-field">
                <label>Fecha de Publicación *</label>
                <input
                  type="date"
                  value={editForm.publishedDate}
                  onChange={(e) => setEditForm({ ...editForm, publishedDate: e.target.value })}
                />
              </div>

              {/* Tipo de Texto */}
              <div className="book-edit-field">
                <label>Tipo de Texto *</label>
                <select
                  value={editForm.typeId}
                  onChange={(e) => setEditForm({ ...editForm, typeId: Number(e.target.value) })}
                >
                  <option value={0}>Seleccionar tipo</option>
                  {textTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.type}</option>
                  ))}
                </select>
              </div>

              {/* Autores (multi-select) */}
              <div className="book-edit-field authors-field">
                <label>Autores *</label>
                <select
                  multiple
                  value={editForm.authorIds.map(String)}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => Number(option.value));
                    setEditForm({ ...editForm, authorIds: selected });
                  }}
                >
                  {authors.map(author => (
                    <option key={author.id} value={author.id}>
                      {author.name} {author.middleName ? author.middleName + ' ' : ''}{author.lastName}
                    </option>
                  ))}
                </select>
                <small>
                  Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples
                </small>
              </div>

              {/* Géneros (multi-select) */}
              <div className="book-edit-field">
                <label>Géneros *</label>
                <select
                  multiple
                  value={editForm.genreIds.map(String)}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => Number(option.value));
                    setEditForm({ ...editForm, genreIds: selected });
                  }}
                >
                  {genres.map(genre => (
                    <option key={genre.id} value={genre.id}>{genre.name}</option>
                  ))}
                </select>
                <small>
                  Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples
                </small>
              </div>

              {/* Editoriales (multi-select) */}
              <div className="book-edit-field">
                <label>Editoriales *</label>
                <select
                  multiple
                  value={editForm.editorialIds.map(String)}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => Number(option.value));
                    setEditForm({ ...editForm, editorialIds: selected });
                  }}
                >
                  {editorials.map(editorial => (
                    <option key={editorial.id} value={editorial.id}>{editorial.companyName}</option>
                  ))}
                </select>
                <small>
                  Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples
                </small>
              </div>

              {/* URLs */}
              <div className="book-edit-urls-grid">
                <div className="book-edit-field">
                  <label>URL PDF *</label>
                  <input
                    type="text"
                    value={editForm.pdfUrl}
                    onChange={(e) => setEditForm({ ...editForm, pdfUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="book-edit-field">
                  <label>URL EPUB *</label>
                  <input
                    type="text"
                    value={editForm.epubUrl}
                    onChange={(e) => setEditForm({ ...editForm, epubUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Cover URL */}
              <div className="book-edit-field">
                <label>URL de Portada *</label>
                <input
                  type="text"
                  value={editForm.coverUrl}
                  onChange={(e) => setEditForm({ ...editForm, coverUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              {/* Botones */}
              <div className="book-edit-actions">
                <button
                  onClick={() => setEditingId(null)}
                  disabled={loadingOperation === `update-${editingId}`}
                  className="btn-modal-cancel"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSaveEdit(editingId)}
                  disabled={loadingOperation === `update-${editingId}`}
                  className="btn-modal-save"
                >
                  {loadingOperation === `update-${editingId}` ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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