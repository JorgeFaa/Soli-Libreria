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
  textUrl: string;
  coverUrl: string;
  authors: Author[];
  editorials: Editorial[];
  genres: Genre[];
  type: BookType;
}

// Tipo adaptado para compatibilidad con el componente actual
export interface Book {
  id: number;
  titulo: string;
  autor: string;
  año: number;
  genero: string;
  descripcion: string;
  sinopsis?: string;
  paginas?: number;
  isbn?: string;
  editorial?: string;
  idioma?: string;
  portada: string;
  textUrl?: string;
}

// Configuración de la API
const API_BASE_URL = 'https://soliapi-223325065421.northamerica-south1.run.app';

// Función para obtener todos los géneros disponibles
export const getGenres = async (): Promise<Genre[]> => {
  try {
    // Obtener el token de acceso
    const accessToken = getAuthToken();
    
    if (!accessToken) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/v2/genres`, {
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
    
    const response = await fetch(`${API_BASE_URL}/api/v2/books/all`, {
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
    
    // Convertir formato de API a formato del componente
    const books: Book[] = apiBooks.map(apiBook => ({
      id: apiBook.id,
      titulo: apiBook.title,
      autor: formatAuthors(apiBook.authors),
      año: new Date(apiBook.publishedDate).getFullYear(),
      genero: apiBook.genres.map(g => g.name).join(', '),
      descripcion: apiBook.description,
      sinopsis: apiBook.description, // Usar description como sinopsis
      editorial: apiBook.editorials[0]?.companyName || "Editorial desconocida",
      portada: apiBook.coverUrl,
      textUrl: apiBook.textUrl,
      idioma: "Español", // Valor por defecto
      isbn: "No disponible", // No viene en la API
      paginas: 0 // No viene en la API
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
    
    const response = await fetch(`${API_BASE_URL}/api/v2/books/${id}`, {
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
    
    // Convertir formato de API a formato del componente
    const book: Book = {
      id: apiBook.id,
      titulo: apiBook.title,
      autor: formatAuthors(apiBook.authors),
      año: new Date(apiBook.publishedDate).getFullYear(),
      genero: apiBook.genres.map(g => g.name).join(', '),
      descripcion: apiBook.description,
      sinopsis: apiBook.description, // Usar description como sinopsis
      editorial: apiBook.editorials[0]?.companyName || "Editorial desconocida",
      portada: apiBook.coverUrl,
      textUrl: apiBook.textUrl,
      idioma: "Español", // Valor por defecto
      isbn: "No disponible", // No viene en la API
      paginas: 0 // No viene en la API
    };
    
    return book;
    
  } catch (error) {
    throw error;
  }
};