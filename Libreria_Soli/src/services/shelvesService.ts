// shelvesService.ts - Servicio para manejar operaciones con estanterías de libros

import { getAuthToken } from './authService';

// Interfaces para las estanterías
export interface CreateBookshelfRequest {
  name: string;
  description: string;
}

export interface UpdateBookshelfRequest {
  name: string;
  description: string;
}

export interface Author {
  id: number;
  name: string;
  middleName: string;
  lastName: string;
  countryName: string;
  books: Array<{
    id: number;
    title: string;
  }>;
}

export interface Editorial {
  id: number;
  companyName: string;
  countryId: number;
  countryName: string;
}

export interface Genre {
  id: number;
  name: string;
  books: Array<{
    id: number;
    title: string;
  }>;
}

export interface BookType {
  id: number;
  type: string;
}

export interface BookshelfBook {
  id: number;
  title: string;
  description: string;
  publishedDate: string;
  pdfUrl: string;
  epubUrl: string;
  coverUrl: string;
  type: BookType;
  authors: Author[];
  editorials: Editorial[];
  genres: Genre[];
}

export interface Bookshelf {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  bookCount?: number; // Opcional en caso de no venir del servidor
  books?: BookshelfBook[]; // Opcional en caso de no venir del servidor
}

// Configuración de la API
const API_BASE_URL = 'https://soli-api.gentledesert-973b7428.westus2.azurecontainerapps.io';

/**
 * Crear una nueva estantería
 * @param shelfData - Datos de la estantería (name y description)
 * @returns Promise<Bookshelf> - Estantería creada
 */
export const createBookshelf = async (shelfData: CreateBookshelfRequest): Promise<Bookshelf> => {
  try {
    console.log('📚 [ShelvesService] Creando nueva estantería:', shelfData);
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Validar nombre
    if (!shelfData.name.trim()) {
      throw new Error('El nombre de la estantería es obligatorio.');
    }

    if (shelfData.name.length > 100) {
      throw new Error('El nombre no puede tener más de 100 caracteres.');
    }

    // Validar descripción
    if (shelfData.description && shelfData.description.length > 500) {
      throw new Error('La descripción no puede tener más de 500 caracteres.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/bookshelves`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: shelfData.name.trim(),
        description: shelfData.description?.trim() || ''
      })
    });

    console.log('📡 [ShelvesService] Status response:', response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 403) {
      throw new Error('No tienes permisos para crear estanterías.');
    }

    if (response.status === 400) {
      const errorText = await response.text();
      throw new Error(`Datos inválidos: ${errorText}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const bookshelf: Bookshelf = await response.json();
    
    console.log('✅ [ShelvesService] Estantería creada exitosamente:', bookshelf);
    return bookshelf;

  } catch (error) {
    console.error('❌ [ShelvesService] Error al crear estantería:', error);
    throw error;
  }
};

/**
 * Obtener todas las estanterías del usuario actual
 * @returns Promise<Bookshelf[]> - Array de estanterías del usuario
 */
export const getUserBookshelves = async (): Promise<Bookshelf[]> => {
  try {
    console.log('📚 [ShelvesService] Obteniendo estanterías del usuario...');
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/bookshelves/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📡 [ShelvesService] Status response:', response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 403) {
      throw new Error('No tienes permisos para ver las estanterías.');
    }

    if (response.status === 404) {
      // Usuario sin estanterías, devolver array vacío
      console.log('📝 [ShelvesService] Usuario no tiene estanterías aún');
      return [];
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const bookshelves: Bookshelf[] = await response.json();
    
    console.log(`✅ [ShelvesService] Obtenidas ${bookshelves.length} estanterías del usuario:`, bookshelves);
    return bookshelves;

  } catch (error) {
    console.error('❌ [ShelvesService] Error al obtener estanterías:', error);
    throw error;
  }
};

/**
 * Actualizar una estantería existente
 * @param shelfId - ID de la estantería a actualizar
 * @param shelfData - Nuevos datos de la estantería (name y description)
 * @returns Promise<Bookshelf> - Estantería actualizada
 */
export const updateBookshelf = async (shelfId: number, shelfData: UpdateBookshelfRequest): Promise<Bookshelf> => {
  try {
    console.log(`✏️ [ShelvesService] Actualizando estantería ${shelfId}:`, shelfData);
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Validar nombre
    if (!shelfData.name.trim()) {
      throw new Error('El nombre de la estantería es obligatorio.');
    }

    if (shelfData.name.length > 100) {
      throw new Error('El nombre no puede tener más de 100 caracteres.');
    }

    // Validar descripción
    if (shelfData.description && shelfData.description.length > 500) {
      throw new Error('La descripción no puede tener más de 500 caracteres.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/bookshelves/${shelfId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: shelfData.name.trim(),
        description: shelfData.description?.trim() || ''
      })
    });

    console.log(`📡 [ShelvesService] Status response actualizar ${shelfId}:`, response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 403) {
      throw new Error('No tienes permisos para actualizar esta estantería.');
    }

    if (response.status === 404) {
      throw new Error('La estantería no existe o no tienes permisos para modificarla.');
    }

    if (response.status === 400) {
      const errorText = await response.text();
      throw new Error(`Datos inválidos: ${errorText}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const bookshelf: Bookshelf = await response.json();
    
    console.log(`✅ [ShelvesService] Estantería ${shelfId} actualizada exitosamente:`, bookshelf);
    return bookshelf;

  } catch (error) {
    console.error(`❌ [ShelvesService] Error al actualizar estantería ${shelfId}:`, error);
    throw error;
  }
};

/**
 * Eliminar una estantería
 * @param shelfId - ID de la estantería a eliminar
 * @returns Promise<void>
 */
export const deleteBookshelf = async (shelfId: number): Promise<void> => {
  try {
    console.log(`🗑️ [ShelvesService] Eliminando estantería ${shelfId}`);
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/bookshelves/${shelfId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`📡 [ShelvesService] Status response eliminar ${shelfId}:`, response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 403) {
      throw new Error('No tienes permisos para eliminar esta estantería.');
    }

    if (response.status === 404) {
      throw new Error('La estantería no existe o ya fue eliminada.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }
    
    console.log(`✅ [ShelvesService] Estantería ${shelfId} eliminada exitosamente`);

  } catch (error) {
    console.error(`❌ [ShelvesService] Error al eliminar estantería ${shelfId}:`, error);
    throw error;
  }
};

/**
 * Formatear fecha de creación de estantería
 * @param dateString - Fecha en formato ISO
 * @returns string - Fecha formateada
 */
export const formatShelfDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Obtener resumen de géneros de los libros en una estantería
 * @param books - Array de libros de la estantería
 * @returns string - Géneros más comunes
 */
export const getShelfGenresSummary = (books: BookshelfBook[]): string => {
  if (books.length === 0) return 'Sin libros';
  
  const genreCount: { [key: string]: number } = {};
  
  books.forEach(book => {
    book.genres.forEach(genre => {
      genreCount[genre.name] = (genreCount[genre.name] || 0) + 1;
    });
  });
  
  const sortedGenres = Object.entries(genreCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([genre]) => genre);
    
  return sortedGenres.length > 0 ? sortedGenres.join(', ') : 'Variado';
};

/**
 * Obtener detalles de una estantería específica con sus libros
 * @param shelfId - ID de la estantería
 * @returns Promise<Bookshelf> - Estantería con todos sus libros y detalles
 */
export const getBookshelfById = async (shelfId: number): Promise<Bookshelf> => {
  try {
    console.log('📖 [ShelvesService] Obteniendo detalles de estantería:', shelfId);
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/bookshelves/${shelfId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📡 [ShelvesService] Status response:', response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 403) {
      throw new Error('No tienes permisos para ver esta estantería.');
    }

    if (response.status === 404) {
      throw new Error('La estantería no existe o ha sido eliminada.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const bookshelf: Bookshelf = await response.json();
    
    console.log('✅ [ShelvesService] Estantería obtenida exitosamente:', {
      id: bookshelf.id,
      name: bookshelf.name,
      bookCount: bookshelf.bookCount,
      hasBooks: bookshelf.books && bookshelf.books.length > 0
    });
    
    return bookshelf;

  } catch (error) {
    console.error('❌ [ShelvesService] Error al obtener estantería:', error);
    throw error;
  }
};

/**
 * Agregar un libro a una estantería específica
 * @param shelfId - ID de la estantería
 * @param bookId - ID del libro a agregar
 * @returns Promise<void> - No retorna datos, solo confirma éxito
 */
export const addBookToBookshelf = async (shelfId: number, bookId: number): Promise<void> => {
  try {
    console.log('📚 [ShelvesService] Agregando libro a estantería:', { shelfId, bookId });
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Validar parámetros
    if (!shelfId || !bookId) {
      throw new Error('ID de estantería e ID de libro son obligatorios.');
    }

    if (!Number.isInteger(shelfId) || shelfId <= 0) {
      throw new Error('ID de estantería debe ser un número entero positivo.');
    }

    if (!Number.isInteger(bookId) || bookId <= 0) {
      throw new Error('ID de libro debe ser un número entero positivo.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/bookshelves/${shelfId}/books/${bookId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📡 [ShelvesService] Status response:', response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 403) {
      throw new Error('No tienes permisos para agregar libros a esta estantería.');
    }

    if (response.status === 404) {
      const errorText = await response.text();
      if (errorText.toLowerCase().includes('shelf') || errorText.toLowerCase().includes('estantería')) {
        throw new Error('La estantería no existe o ha sido eliminada.');
      } else {
        throw new Error('El libro no existe o no está disponible.');
      }
    }

    if (response.status === 409) {
      throw new Error('El libro ya está agregado en esta estantería.');
    }

    if (response.status === 400) {
      const errorText = await response.text();
      throw new Error(`Datos inválidos: ${errorText}`);
    }

    if (response.status === 500) {
      const errorText = await response.text();
      console.error('❌ [ShelvesService] Error 500 response body:', errorText);
      
      // Intentar parsear el error como JSON
      try {
        const errorData = JSON.parse(errorText);
        const serverMessage = errorData.error || errorData.message || 'Error interno del servidor';
        throw new Error(`Error del servidor: ${serverMessage}. Verifica que el libro y la estantería existan, o intenta nuevamente en unos momentos.`);
      } catch {
        throw new Error('Error interno del servidor. Es posible que el libro ya esté en la estantería o que haya un problema temporal. Intenta nuevamente.');
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    console.log('✅ [ShelvesService] Libro agregado exitosamente a la estantería');

  } catch (error) {
    console.error('❌ [ShelvesService] Error al agregar libro a estantería:', error);
    throw error;
  }
};

/**
 * Eliminar un libro de una estantería específica
 * @param shelfId - ID de la estantería
 * @param bookId - ID del libro a eliminar
 * @returns Promise<void> - No retorna datos, solo confirma éxito
 */
export const removeBookFromBookshelf = async (shelfId: number, bookId: number): Promise<void> => {
  try {
    console.log('🗑️ [ShelvesService] Eliminando libro de estantería:', { shelfId, bookId });
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Validar parámetros
    if (!shelfId || !bookId) {
      throw new Error('ID de estantería e ID de libro son obligatorios.');
    }

    if (!Number.isInteger(shelfId) || shelfId <= 0) {
      throw new Error('ID de estantería debe ser un número entero positivo.');
    }

    if (!Number.isInteger(bookId) || bookId <= 0) {
      throw new Error('ID de libro debe ser un número entero positivo.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/bookshelves/${shelfId}/books/${bookId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📡 [ShelvesService] Status response:', response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 403) {
      throw new Error('No tienes permisos para eliminar libros de esta estantería.');
    }

    if (response.status === 404) {
      const errorText = await response.text();
      if (errorText.toLowerCase().includes('shelf') || errorText.toLowerCase().includes('estantería')) {
        throw new Error('La estantería no existe o ha sido eliminada.');
      } else {
        throw new Error('El libro no está en esta estantería o ya fue eliminado.');
      }
    }

    if (response.status === 400) {
      const errorText = await response.text();
      throw new Error(`Datos inválidos: ${errorText}`);
    }

    if (response.status === 500) {
      const errorText = await response.text();
      console.error('❌ [ShelvesService] Error 500 response body:', errorText);
      
      // Intentar parsear el error como JSON
      try {
        const errorData = JSON.parse(errorText);
        const serverMessage = errorData.error || errorData.message || 'Error interno del servidor';
        throw new Error(`Error del servidor: ${serverMessage}. Verifica que el libro esté en la estantería, o intenta nuevamente en unos momentos.`);
      } catch {
        throw new Error('Error interno del servidor. Es posible que el libro ya fue eliminado o que haya un problema temporal. Intenta nuevamente.');
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    console.log('✅ [ShelvesService] Libro eliminado exitosamente de la estantería');

  } catch (error) {
    console.error('❌ [ShelvesService] Error al eliminar libro de estantería:', error);
    throw error;
  }
};