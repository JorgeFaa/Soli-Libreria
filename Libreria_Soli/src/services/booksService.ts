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

// Función para obtener todos los libros
export const getBooks = async (): Promise<Book[]> => {
  try {
    console.log("📚 [booksService] Obteniendo libros de la API...");
    
    // Obtener el token de acceso
    const accessToken = getAuthToken();
    
    if (!accessToken) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    console.log("🔑 [booksService] Token encontrado, haciendo petición...");
    
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log("📡 [booksService] Respuesta HTTP status:", response.status);
    console.log("📡 [booksService] Respuesta HTTP headers:", Object.fromEntries(response.headers.entries()));
    
    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ [booksService] Error en la respuesta:", errorText);
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }
    
    const apiBooks: ApiBook[] = await response.json();
    console.log("📋 [booksService] Libros recibidos:", apiBooks.length);
    
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
    
    console.log("✅ [booksService] Libros procesados exitosamente:", books.length);
    return books;
    
  } catch (error) {
    console.error("🔥 [booksService] Error obteniendo libros:", error);
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
    console.log("📖 [booksService] Obteniendo libro por ID:", id);
    
    const books = await getBooks();
    const book = books.find(b => b.id === id);
    
    if (!book) {
      console.log("❌ [booksService] Libro no encontrado:", id);
      return null;
    }
    
    console.log("✅ [booksService] Libro encontrado:", book.titulo);
    return book;
    
  } catch (error) {
    console.error("🔥 [booksService] Error obteniendo libro por ID:", error);
    throw error;
  }
};