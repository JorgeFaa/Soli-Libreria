// booksService.ts - Servicio para manejar operaciones con libros

import { getAuthToken } from './authService';

// Tipos para la API de libros
export interface Author {
  id: number;
  name: string;
  middleName?: string;
  lastName: string;
  countryName: string;
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
}

export interface BookType {
  id: number;
  type: string;
}

export interface ApiBook {
  id: number;
  title: string;
  description: string;
  publishedDate: string;
  pdfUrl?: string;
  epubUrl?: string;
  textUrl?: string;
  coverUrl: string;
  authors: Author[];
  editorials: Editorial[];
  genres: Genre[];
  type: BookType;
}

// Tipo actualizado para la nueva estructura de API
export interface Book {
  id: number;
  title: string;
  description: string;
  publishedDate: string;
  pdfUrl?: string;
  epubUrl?: string;
  coverUrl: string;
  authors: Author[];
  editorials: Editorial[];
  genres: Genre[];
  type: BookType;
  
  // Campos calculados para compatibilidad
  titulo?: string;    // derivado de title
  autor?: string;     // derivado de authors
  año?: number;       // derivado de publishedDate
  genero?: string;    // derivado de genres
  descripcion?: string; // derivado de description
  portada?: string;   // derivado de coverUrl
  
  // Campos adicionales para compatibilidad con LibroDetalle
  paginas?: number;
  idioma?: string;
  sinopsis?: string;
  isbn?: string;
}

// Configuración de la API
const API_BASE_URL = 'https://soli-api.gentledesert-973b7428.westus2.azurecontainerapps.io';

// Función para obtener un género individual por ID
export const getGenreById = async (genreId: number): Promise<Genre | null> => {
  try {
    const accessToken = getAuthToken();
    
    if (!accessToken) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Intentar primero el endpoint público
    let response = await fetch(`${API_BASE_URL}/api/v3/genres/${genreId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Si falla, intentar el endpoint de admin
    if (!response.ok && response.status !== 404) {
      response = await fetch(`${API_BASE_URL}/api/v3/admin/genres/${genreId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    }

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }
    
    if (response.status === 404) {
      return null; // Género no encontrado
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error('El servidor devolvió un JSON inválido para el género.');
    }

    return responseData;

  } catch (error) {
    console.warn(`Error al obtener género ${genreId}:`, error);
    return null;
  }
};

// Función para obtener géneros por IDs
export const getGenresByIds = async (genreIds: number[]): Promise<Genre[]> => {
  try {
    const genrePromises = genreIds.map(id => getGenreById(id));
    const genreResults = await Promise.all(genrePromises);
    
    // Filtrar géneros nulos y devolver solo los válidos
    return genreResults.filter((genre): genre is Genre => genre !== null);
  } catch (error) {
    console.warn('Error al obtener géneros por IDs:', error);
    return [];
  }
};

// Función para obtener todos los géneros disponibles
export const getGenres = async (): Promise<Genre[]> => {
  try {
    // Obtener el token de acceso
    const accessToken = getAuthToken();
    
    if (!accessToken) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Intentar primero el endpoint público de géneros
    let response = await fetch(`${API_BASE_URL}/api/v3/genres`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Si falla, intentar el endpoint de admin como fallback
    if (!response.ok && response.status !== 404) {
      response = await fetch(`${API_BASE_URL}/api/v3/admin/genres`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    }
    
    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }
    
    // Primero obtener el texto crudo para debugging
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error('El servidor devolvió un JSON inválido. Verifica la respuesta del servidor.');
    }
    
    // Intentar encontrar el array de géneros en diferentes ubicaciones
    let genres: Genre[] = [];
    
    if (Array.isArray(responseData)) {
      genres = responseData;
    } else if (responseData.content && Array.isArray(responseData.content)) {
      genres = responseData.content;
    } else if (responseData.genres && Array.isArray(responseData.genres)) {
      genres = responseData.genres;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      genres = responseData.data;
    } else {
      throw new Error('Formato de respuesta inesperado del servidor');
    }
    
    return genres;
    
  } catch (error) {
    throw error;
  }
};

// Función para obtener todos los libros
export const getBooks = async (): Promise<Book[]> => {
  try {
    // Obtener el token de acceso
    const accessToken = getAuthToken();
    
    if (!accessToken) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/v3/books`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }
    
    const responseData = await response.json();
    
    // Intentar encontrar el array de libros en diferentes ubicaciones
    let apiBooks: ApiBook[] = [];
    
    if (Array.isArray(responseData)) {
      apiBooks = responseData;
    } else if (responseData.content && Array.isArray(responseData.content)) {
      apiBooks = responseData.content;
    } else if (responseData.books && Array.isArray(responseData.books)) {
      apiBooks = responseData.books;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      apiBooks = responseData.data;
    } else if (responseData.result && Array.isArray(responseData.result)) {
      apiBooks = responseData.result;
    } else {
      throw new Error('Formato de respuesta inesperado del servidor');
    }
    
    // Convertir formato de API a nueva estructura Book
    const books: Book[] = apiBooks.map(apiBook => ({
      id: apiBook.id,
      title: apiBook.title,
      description: apiBook.description,
      publishedDate: apiBook.publishedDate,
      pdfUrl: apiBook.pdfUrl,
      epubUrl: apiBook.epubUrl,
      coverUrl: apiBook.coverUrl,
      authors: apiBook.authors,
      editorials: apiBook.editorials,
      genres: apiBook.genres,
      type: apiBook.type,
      
      // Campos de compatibilidad calculados
      titulo: apiBook.title,
      autor: formatAuthors(apiBook.authors),
      año: new Date(apiBook.publishedDate).getFullYear(),
      genero: apiBook.genres.map(g => g.name).join(', '),
      descripcion: apiBook.description,
      portada: apiBook.coverUrl
    }));
    
    return books;
    
  } catch (error) {
    throw error;
  }
};

// Función auxiliar para formatear autores
const formatAuthors = (authors: Author[]): string => {
  if (authors.length === 0) return "Autor desconocido";
  
  return authors.map(author => {
    const fullName = [author.name, author.middleName, author.lastName]
      .filter(Boolean)
      .join(' ');
    return fullName;
  }).join(', ');
};

// Función para obtener un libro específico por ID
export const getBookById = async (id: number): Promise<Book | null> => {
  try {
    // Obtener el token de acceso
    const accessToken = getAuthToken();
    
    if (!accessToken) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/v3/books/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }
    
    const apiBook: ApiBook = await response.json();
    
    // Convertir formato de API a nueva estructura Book
    const book: Book = {
      id: apiBook.id,
      title: apiBook.title,
      description: apiBook.description,
      publishedDate: apiBook.publishedDate,
      pdfUrl: apiBook.pdfUrl,
      epubUrl: apiBook.epubUrl,
      coverUrl: apiBook.coverUrl,
      authors: apiBook.authors,
      editorials: apiBook.editorials,
      genres: apiBook.genres,
      type: apiBook.type,
      
      // Campos de compatibilidad calculados
      titulo: apiBook.title,
      autor: formatAuthors(apiBook.authors),
      año: new Date(apiBook.publishedDate).getFullYear(),
      genero: apiBook.genres.map(g => g.name).join(', '),
      descripcion: apiBook.description,
      portada: apiBook.coverUrl
    };
    
    return book;
    
  } catch (error) {
    throw error;
  }
};

// Función para agregar un libro a favoritos
export const addBookToFavorites = async (bookId: number): Promise<boolean> => {
  try {
    // Obtener el token de acceso
    const accessToken = getAuthToken();
    
    if (!accessToken) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    const url = `${API_BASE_URL}/api/v3/users/me/favorites/${bookId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }
    
    if (response.status === 200 || response.status === 204) {
      return true; // Éxito
    }
    
    // Otros códigos de error
    const errorText = await response.text();
    throw new Error(`Error del servidor: ${response.status} - ${errorText || 'No se pudo agregar a favoritos'}`);
    
  } catch (error) {
    throw error;
  }
};

// Función para eliminar un libro de favoritos
export const removeBookFromFavorites = async (bookId: number): Promise<boolean> => {
  try {
    // Obtener el token de acceso
    const accessToken = getAuthToken();
    
    if (!accessToken) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    const url = `${API_BASE_URL}/api/v3/users/me/favorites/${bookId}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }
    
    if (response.status === 204 || response.status === 200) {
      return true; // Éxito
    }
    
    // Otros códigos de error
    const errorText = await response.text();
    throw new Error(`Error del servidor: ${response.status} - ${errorText || 'No se pudo eliminar de favoritos'}`);
    
  } catch (error) {
    throw error;
  }
};

// Función para obtener favoritos usando /users/me + /books/{id}
export const getFavoriteBooks = async (): Promise<Book[]> => {
  try {
    // Obtener el token de acceso
    const accessToken = getAuthToken();
    
    if (!accessToken) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    // Paso 1: Obtener perfil del usuario con IDs de favoritos
    const profileResponse = await fetch(`${API_BASE_URL}/api/v3/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!profileResponse.ok) {
      throw new Error(`Error al obtener perfil: ${profileResponse.status} ${profileResponse.statusText}`);
    }
    
    const profileData = await profileResponse.json();
    
    if (!profileData.favoriteBooks || profileData.favoriteBooks.length === 0) {
      return [];
    }
    
    // Paso 2: Obtener detalles de cada libro favorito
    const favoriteBooks: Book[] = [];
    
    for (const bookId of profileData.favoriteBooks) {
      try {
        const book = await getBookById(bookId);
        if (book) {
          favoriteBooks.push(book);
        }
      } catch (error) {
        // Continuar con los demás libros
      }
    }
    
    return favoriteBooks;
    
  } catch (error) {
    throw error;
  }
};

// Función para obtener todos los géneros desde el endpoint admin que funciona correctamente
export const getAllGenres = async (): Promise<Genre[]> => {
  try {
    // Obtener el token de acceso
    const accessToken = getAuthToken();
    
    if (!accessToken) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Usar el endpoint admin/genres que sabemos que funciona
    const response = await fetch(`${API_BASE_URL}/api/v3/admin/genres`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error al obtener géneros: ${response.status} ${response.statusText}`);
    }
    
    const genres = await response.json();
    
    // Validar que sea un array de géneros
    if (!Array.isArray(genres)) {
      throw new Error('El servidor no devolvió un array de géneros válido');
    }
    
    // Mapear a nuestro formato esperado
    return genres.map((genre: any) => ({
      id: genre.id,
      name: genre.name
    }));
    
  } catch (error) {
    console.error('Error al obtener todos los géneros:', error);
    throw error;
  }
};