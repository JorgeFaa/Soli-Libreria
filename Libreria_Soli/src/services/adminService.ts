// adminService.ts - Servicio para operaciones de administración

import { getAuthToken } from './authService';

// Configuración de la API
const API_BASE_URL = 'https://soli-api.gentledesert-973b7428.westus2.azurecontainerapps.io';

// ==========================================
// TIPOS TYPESCRIPT
// ==========================================

// Tipo para Text Types
export interface TextType {
  id: number;
  type: string;
}

// Tipo para crear/actualizar Text Type
export interface CreateTextTypeRequest {
  type: string;
}

export interface UpdateTextTypeRequest {
  type: string;
}

// Tipo para Genres
export interface Genre {
  id: number;
  name: string;
}

// Tipo para crear/actualizar Genre
export interface CreateGenreRequest {
  genrename: string;
}

export interface UpdateGenreRequest {
  genrename: string;
}

// Tipo para Editorials
export interface Editorial {
  id: number;
  companyName: string;
  books?: string[]; // Opcional para mayor seguridad
  countryId?: number; // Para requests
  countryName?: string; // Para responses
}

// Tipo para crear/actualizar Editorial
export interface CreateEditorialRequest {
  companyName: string;
  countryId: number;
}

export interface UpdateEditorialRequest {
  companyName: string;
  countryId: number;
}

// Tipo para Countries
export interface Country {
  id: number;
  name: string;
  authors?: string[];
  editorials?: Editorial[];
}

// Tipo para crear/actualizar Country
export interface CreateCountryRequest {
  countryname: string;
}

export interface UpdateCountryRequest {
  countryname: string;
}

// Tipo para Books (respuesta completa)
export interface Book {
  id: number;
  title: string;
  description: string;
  publishedDate: string;
  pdfUrl: string;
  epubUrl: string;
  coverUrl: string;
  type: {
    id: number;
    type: string;
  };
  authors: Array<{
    id: number;
    name: string;
    middleName: string;
    lastName: string;
    countryName: string;
  }>;
  editorials: Array<{
    id: number;
    companyName: string;
    countryId: number;
    countryName: string;
  }>;
  genres: Array<{
    id: number;
    name: string;
  }>;
}

// Tipo para crear Book
export interface CreateBookRequest {
  title: string;
  description: string;
  publishedDate: string; // formato: "2025-11-12"
  pdfUrl: string;
  epubUrl: string;
  coverUrl: string;
  typeId: number;
  authorIds: number[];
  editorialIds: number[];
  genreIds: number[];
}

// Tipo para actualizar Book
export interface UpdateBookRequest {
  title: string;
  description: string;
  publishedDate: string; // formato: "2025-11-12"
  pdfUrl: string;
  epubUrl: string;
  coverUrl: string;
  typeId: number;
  authorIds: number[];
  editorialIds: number[];
  genreIds: number[];
}

// Tipo para Authors (respuesta completa)
export interface Author {
  id: number;
  name: string;
  middleName?: string;
  lastName: string;
  country?: string;
  countryId?: number;
}

// Tipo para crear Author
export interface CreateAuthorRequest {
  name: string;
  middleName: string;
  lastName: string;
  countryId: number;
}

// Tipo para actualizar Author
export interface UpdateAuthorRequest {
  name: string;
  middleName: string;
  lastName: string;
  countryId: number;
}

// Tipo para Users (respuesta de admin)
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  prefferredGenreIds: number[];
  favoriteBooks: number[];
}

// Respuestas genéricas de la API
export interface AdminApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ==========================================
// TEXT TYPES ENDPOINTS
// ==========================================

/**
 * Obtiene todos los text types
 * GET /api/v3/admin/text-types
 */
export const getAllTextTypes = async (): Promise<TextType[]> => {
  try {
    const token = getAuthToken();
    console.log('🔑 [AdminService] Token disponible:', !!token);
    
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    console.log('🌐 [AdminService] Realizando petición a:', `${API_BASE_URL}/api/v3/admin/text-types`);
    
    const response = await fetch(`${API_BASE_URL}/api/v3/admin/text-types`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 [AdminService] Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`⚠️ [AdminService] Endpoint falló con ${response.status}:`, errorText);
      // Si el endpoint no funciona o no hay datos, devolver array vacío
      // No usar datos de fallback para evitar confusión
      return [];
    }

    const responseText = await response.text();
    console.log('📄 [AdminService] Respuesta cruda:', responseText);
    
    let textTypes;
    try {
      textTypes = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ [AdminService] Error al parsear JSON:', parseError);
      return [];
    }
    
    console.log('🧩 [AdminService] Datos parseados:', textTypes);
    
    // Validar que sea un array
    if (!Array.isArray(textTypes)) {
      console.warn('⚠️ [AdminService] El servidor no devolvió un array válido:', textTypes);
      return [];
    }

    console.log('✅ [AdminService] Retornando', textTypes.length, 'text types');
    return textTypes;
    
  } catch (error) {
    console.error('❌ [AdminService] Error al obtener text types:', error);
    // En caso de error, devolver array vacío en lugar de datos falsos
    return [];
  }
};

/**
 * Obtiene un text type específico por ID
 * GET /api/v3/admin/text-types/{id}
 */
export const getTextTypeById = async (id: number): Promise<TextType> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/text-types/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 404) {
      throw new Error(`Text type con ID ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const textType = await response.json();
    return textType;
    
  } catch (error) {
    console.error(`Error al obtener text type ${id}:`, error);
    throw error;
  }
};

/**
 * Actualiza un text type existente
 * PUT /api/v3/admin/text-types/{id}
 */
export const updateTextType = async (id: number, data: UpdateTextTypeRequest): Promise<TextType> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Validar datos de entrada
    if (!data.type || data.type.trim().length === 0) {
      throw new Error('El tipo de texto es obligatorio');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/text-types/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: data.type.trim()
      })
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 404) {
      throw new Error(`Text type con ID ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const updatedTextType = await response.json();
    return updatedTextType;
    
  } catch (error) {
    console.error(`Error al actualizar text type ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un text type
 * DELETE /api/v3/admin/text-types/{id}
 */
export const deleteTextType = async (id: number): Promise<boolean> => {
  try {
    const token = getAuthToken();
    console.log(`🗑️ [AdminService] Intentando eliminar text type ${id}`);
    
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    console.log('🌐 [AdminService] Realizando DELETE a:', `${API_BASE_URL}/api/v3/admin/text-types/${id}`);

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/text-types/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 [AdminService] Respuesta DELETE para ID ${id}:`, {
      status: response.status,
      statusText: response.statusText
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 404) {
      console.warn(`⚠️ [AdminService] Text type ${id} no encontrado - podría ser datos fantasma`);
      throw new Error(`Text type con ID ${id} no encontrado - posiblemente datos de prueba locales`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [AdminService] Error ${response.status} al eliminar ${id}:`, errorText);
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    // Verificar si hay contenido en la respuesta
    const responseText = await response.text();
    console.log(`✅ [AdminService] DELETE ${id} exitoso, respuesta:`, responseText || 'Sin contenido');
    
    // Si no hay contenido, asumir éxito
    return true;
    
  } catch (error) {
    console.error(`❌ [AdminService] Error al eliminar text type ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo text type
 * POST /api/v3/admin/text-types (si este endpoint existe)
 */
export const createTextType = async (data: CreateTextTypeRequest): Promise<TextType> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Validar datos de entrada
    if (!data.type || data.type.trim().length === 0) {
      throw new Error('El tipo de texto es obligatorio');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/text-types`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: data.type.trim()
      })
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const newTextType = await response.json();
    return newTextType;
    
  } catch (error) {
    console.error('Error al crear text type:', error);
    throw error;
  }
};

// ==========================================
// GENRES ENDPOINTS
// ==========================================

/**
 * Obtiene todos los géneros
 * GET /api/v3/admin/genres
 */
export const getAllGenres = async (): Promise<Genre[]> => {
  try {
    const token = getAuthToken();
    console.log('🔑 [AdminService] Token disponible para genres:', !!token);
    
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    console.log('🌐 [AdminService] Realizando petición a:', `${API_BASE_URL}/api/v3/admin/genres`);
    
    const response = await fetch(`${API_BASE_URL}/api/v3/admin/genres`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 [AdminService] Respuesta genres recibida:', {
      status: response.status,
      statusText: response.statusText
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`⚠️ [AdminService] Genres endpoint falló con ${response.status}:`, errorText);
      return [];
    }

    const responseText = await response.text();
    console.log('📄 [AdminService] Respuesta genres cruda:', responseText);
    
    let genres;
    try {
      genres = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ [AdminService] Error al parsear JSON genres:', parseError);
      return [];
    }
    
    console.log('🧩 [AdminService] Datos genres parseados:', genres);
    
    // Validar que sea un array
    if (!Array.isArray(genres)) {
      console.warn('⚠️ [AdminService] El servidor no devolvió un array de géneros válido:', genres);
      return [];
    }

    console.log('✅ [AdminService] Retornando', genres.length, 'géneros');
    return genres;
    
  } catch (error) {
    console.error('❌ [AdminService] Error al obtener géneros:', error);
    return [];
  }
};

/**
 * Obtiene un género específico por ID
 * GET /api/v3/admin/genres/{id}
 */
export const getGenreById = async (id: number): Promise<Genre> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/genres/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 404) {
      throw new Error(`Género con ID ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const genre = await response.json();
    return genre;
    
  } catch (error) {
    console.error(`Error al obtener género ${id}:`, error);
    throw error;
  }
};

/**
 * Actualiza un género existente
 * PUT /api/v3/admin/genres/{id}
 */
export const updateGenre = async (id: number, data: UpdateGenreRequest): Promise<Genre> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Validar datos de entrada
    if (!data.genrename || data.genrename.trim().length === 0) {
      throw new Error('El nombre del género es obligatorio');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/genres/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        genrename: data.genrename.trim()
      })
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 404) {
      throw new Error(`Género con ID ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const updatedGenre = await response.json();
    return updatedGenre;
    
  } catch (error) {
    console.error(`Error al actualizar género ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un género
 * DELETE /api/v3/admin/genres/{id}
 */
export const deleteGenre = async (id: number): Promise<boolean> => {
  try {
    const token = getAuthToken();
    console.log(`🗑️ [AdminService] Intentando eliminar género ${id}`);
    
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    console.log('🌐 [AdminService] Realizando DELETE a:', `${API_BASE_URL}/api/v3/admin/genres/${id}`);

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/genres/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 [AdminService] Respuesta DELETE género ${id}:`, {
      status: response.status,
      statusText: response.statusText
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 404) {
      console.warn(`⚠️ [AdminService] Género ${id} no encontrado`);
      throw new Error(`Género con ID ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [AdminService] Error ${response.status} al eliminar género ${id}:`, errorText);
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    // Verificar si hay contenido en la respuesta
    const responseText = await response.text();
    console.log(`✅ [AdminService] DELETE género ${id} exitoso, respuesta:`, responseText || 'Sin contenido');
    
    return true;
    
  } catch (error) {
    console.error(`❌ [AdminService] Error al eliminar género ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo género
 * POST /api/v3/admin/genres
 */
export const createGenre = async (data: CreateGenreRequest): Promise<Genre> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Validar datos de entrada
    if (!data.genrename || data.genrename.trim().length === 0) {
      throw new Error('El nombre del género es obligatorio');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/genres`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        genrename: data.genrename.trim()
      })
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const newGenre = await response.json();
    return newGenre;
    
  } catch (error) {
    console.error('Error al crear género:', error);
    throw error;
  }
};

// ==========================================
// EDITORIALS ENDPOINTS
// ==========================================

/**
 * Obtiene todas las editoriales
 * GET /api/v3/admin/editorials
 */
export const getAllEditorials = async (): Promise<Editorial[]> => {
  try {
    const token = getAuthToken();
    console.log('🔑 [AdminService] Token disponible para editorials:', !!token);
    
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    console.log('🌐 [AdminService] Realizando petición a:', `${API_BASE_URL}/api/v3/admin/editorials`);
    
    const response = await fetch(`${API_BASE_URL}/api/v3/admin/editorials`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 [AdminService] Respuesta editorials recibida:', {
      status: response.status,
      statusText: response.statusText
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`⚠️ [AdminService] Editorials endpoint falló con ${response.status}:`, errorText);
      return [];
    }

    const responseText = await response.text();
    console.log('📄 [AdminService] Respuesta editorials cruda:', responseText);
    
    let editorials;
    try {
      editorials = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ [AdminService] Error al parsear JSON editorials:', parseError);
      return [];
    }
    
    console.log('🧩 [AdminService] Datos editorials parseados:', editorials);
    
    // Validar que sea un array
    if (!Array.isArray(editorials)) {
      console.warn('⚠️ [AdminService] El servidor no devolvió un array de editoriales válido:', editorials);
      return [];
    }

    console.log('✅ [AdminService] Retornando', editorials.length, 'editoriales');
    return editorials;
    
  } catch (error) {
    console.error('❌ [AdminService] Error al obtener editoriales:', error);
    return [];
  }
};

/**
 * Obtiene una editorial específica por ID
 * GET /api/v3/admin/editorials/{id}
 */
export const getEditorialById = async (id: number): Promise<Editorial> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/editorials/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 404) {
      throw new Error(`Editorial con ID ${id} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const editorial = await response.json();
    return editorial;
    
  } catch (error) {
    console.error(`Error al obtener editorial ${id}:`, error);
    throw error;
  }
};

/**
 * Actualiza una editorial existente
 * PUT /api/v3/admin/editorials/{id}
 */
export const updateEditorial = async (id: number, data: UpdateEditorialRequest): Promise<Editorial> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Validar datos de entrada
    if (!data.companyName || data.companyName.trim().length === 0) {
      throw new Error('El nombre de la editorial es obligatorio');
    }

    if (!data.countryId || data.countryId <= 0) {
      throw new Error('El ID del país es obligatorio');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/editorials/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyName: data.companyName.trim(),
        countryId: data.countryId
      })
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 404) {
      throw new Error(`Editorial con ID ${id} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const updatedEditorial = await response.json();
    return updatedEditorial;
    
  } catch (error) {
    console.error(`Error al actualizar editorial ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una editorial
 * DELETE /api/v3/admin/editorials/{id}
 */
export const deleteEditorial = async (id: number): Promise<boolean> => {
  try {
    const token = getAuthToken();
    console.log(`🗑️ [AdminService] Intentando eliminar editorial ${id}`);
    
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    console.log('🌐 [AdminService] Realizando DELETE a:', `${API_BASE_URL}/api/v3/admin/editorials/${id}`);

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/editorials/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 [AdminService] Respuesta DELETE editorial ${id}:`, {
      status: response.status,
      statusText: response.statusText
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 404) {
      console.warn(`⚠️ [AdminService] Editorial ${id} no encontrada`);
      throw new Error(`Editorial con ID ${id} no encontrada`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [AdminService] Error ${response.status} al eliminar editorial ${id}:`, errorText);
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    // Verificar si hay contenido en la respuesta
    const responseText = await response.text();
    console.log(`✅ [AdminService] DELETE editorial ${id} exitoso, respuesta:`, responseText || 'Sin contenido');
    
    return true;
    
  } catch (error) {
    console.error(`❌ [AdminService] Error al eliminar editorial ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva editorial
 * POST /api/v3/admin/editorials
 */
export const createEditorial = async (data: CreateEditorialRequest): Promise<Editorial> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Validar datos de entrada
    if (!data.companyName || data.companyName.trim().length === 0) {
      throw new Error('El nombre de la editorial es obligatorio');
    }

    if (!data.countryId || data.countryId <= 0) {
      throw new Error('El ID del país es obligatorio');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/editorials`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyName: data.companyName.trim(),
        countryId: data.countryId
      })
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const newEditorial = await response.json();
    return newEditorial;
    
  } catch (error) {
    console.error('Error al crear editorial:', error);
    throw error;
  }
};

// ==========================================
// COUNTRIES ENDPOINTS
// ==========================================

/**
 * Obtiene todos los países
 * GET /api/v3/admin/countries
 */
export const getAllCountries = async (): Promise<Country[]> => {
  try {
    const token = getAuthToken();
    console.log('🔑 [AdminService] Token disponible para countries:', !!token);
    
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    console.log('🌐 [AdminService] Realizando petición a:', `${API_BASE_URL}/api/v3/admin/countries`);
    
    const response = await fetch(`${API_BASE_URL}/api/v3/admin/countries`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 [AdminService] Respuesta countries recibida:', {
      status: response.status,
      statusText: response.statusText
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`⚠️ [AdminService] Countries endpoint falló con ${response.status}:`, errorText);
      return [];
    }

    const responseText = await response.text();
    console.log('📄 [AdminService] Respuesta countries cruda:', responseText);
    
    let countries;
    try {
      countries = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ [AdminService] Error al parsear JSON countries:', parseError);
      return [];
    }
    
    console.log('🧩 [AdminService] Datos countries parseados:', countries);
    
    // Validar que sea un array
    if (!Array.isArray(countries)) {
      console.warn('⚠️ [AdminService] El servidor no devolvió un array de países válido:', countries);
      return [];
    }

    console.log('✅ [AdminService] Retornando', countries.length, 'países');
    return countries;
    
  } catch (error) {
    console.error('❌ [AdminService] Error al obtener países:', error);
    return [];
  }
};

/**
 * Obtiene un país específico por ID
 * GET /api/v3/admin/countries/{id}
 */
export const getCountryById = async (id: number): Promise<Country> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/countries/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 404) {
      throw new Error(`País con ID ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const country = await response.json();
    return country;
    
  } catch (error) {
    console.error(`Error al obtener país ${id}:`, error);
    throw error;
  }
};

/**
 * Actualiza un país existente
 * PUT /api/v3/admin/countries/{id}
 */
export const updateCountry = async (id: number, data: UpdateCountryRequest): Promise<Country> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Validar datos de entrada
    if (!data.countryname || data.countryname.trim().length === 0) {
      throw new Error('El nombre del país es obligatorio');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/countries/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        countryname: data.countryname.trim()
      })
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 404) {
      throw new Error(`País con ID ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const updatedCountry = await response.json();
    return updatedCountry;
    
  } catch (error) {
    console.error(`Error al actualizar país ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un país
 * DELETE /api/v3/admin/countries/{id}
 */
export const deleteCountry = async (id: number): Promise<boolean> => {
  try {
    const token = getAuthToken();
    console.log(`🗑️ [AdminService] Intentando eliminar país ${id}`);
    
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    console.log('🌐 [AdminService] Realizando DELETE a:', `${API_BASE_URL}/api/v3/admin/countries/${id}`);

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/countries/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 [AdminService] Respuesta DELETE país ${id}:`, {
      status: response.status,
      statusText: response.statusText
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 404) {
      console.warn(`⚠️ [AdminService] País ${id} no encontrado`);
      throw new Error(`País con ID ${id} no encontrado`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [AdminService] Error ${response.status} al eliminar país ${id}:`, errorText);
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    // Verificar si hay contenido en la respuesta
    const responseText = await response.text();
    console.log(`✅ [AdminService] DELETE país ${id} exitoso, respuesta:`, responseText || 'Sin contenido');
    
    return true;
    
  } catch (error) {
    console.error(`❌ [AdminService] Error al eliminar país ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo país
 * POST /api/v3/admin/countries
 */
export const createCountry = async (data: CreateCountryRequest): Promise<Country> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Validar datos de entrada
    if (!data.countryname || data.countryname.trim().length === 0) {
      throw new Error('El nombre del país es obligatorio');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/countries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        countryname: data.countryname.trim()
      })
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const newCountry = await response.json();
    return newCountry;
    
  } catch (error) {
    console.error('Error al crear país:', error);
    throw error;
  }
};

// ==========================================
// BOOKS ENDPOINTS
// ==========================================

export const createBook = async (bookData: CreateBookRequest): Promise<Book> => {
  console.log('📝 [AdminService] Creando libro:', bookData);
  
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookData)
    });

    console.log('📤 [AdminService] Respuesta crear libro:', response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const newBook = await response.json();
    console.log('✅ [AdminService] Libro creado exitosamente:', newBook);
    return newBook;
    
  } catch (error) {
    console.error('❌ [AdminService] Error al crear libro:', error);
    throw error;
  }
};


export const updateBook = async (id: number, bookData: UpdateBookRequest): Promise<Book> => {
  console.log(`📝 [AdminService] Actualizando libro ${id}:`, bookData);
  
  if (!id || id <= 0) {
    throw new Error('ID de libro inválido');
  }
  
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookData)
    });

    console.log(`📤 [AdminService] Respuesta actualizar libro ${id}:`, response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const updatedBook = await response.json();
    console.log(`✅ [AdminService] Libro ${id} actualizado exitosamente:`, updatedBook);
    return updatedBook;
    
  } catch (error) {
    console.error(`❌ [AdminService] Error al actualizar libro ${id}:`, error);
    throw error;
  }
};

export const deleteBook = async (id: number): Promise<void> => {
  console.log(`🗑️ [AdminService] Eliminando libro ${id}`);
  
  if (!id || id <= 0) {
    throw new Error('ID de libro inválido');
  }
  
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/books/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`📤 [AdminService] Respuesta eliminar libro ${id}:`, response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    console.log(`✅ [AdminService] Libro ${id} eliminado exitosamente`);
    
  } catch (error) {
    console.error(`❌ [AdminService] Error al eliminar libro ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene todos los libros usando el endpoint público
 * Reutiliza la función del booksService para evitar duplicación
 * @returns Promise<Book[]> Lista de todos los libros
 */
export const getAllBooks = async (): Promise<Book[]> => {
  console.log('📚 [AdminService] Obteniendo todos los libros para administración');
  
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/books`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📤 [AdminService] Respuesta obtener libros:', response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    
    // Intentar encontrar el array de libros en diferentes ubicaciones
    let apiBooks: Book[] = [];
    
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
    
    console.log(`✅ [AdminService] Obtenidos ${apiBooks.length} libros para administración`);
    return apiBooks;
    
  } catch (error) {
    console.error('❌ [AdminService] Error al obtener libros:', error);
    throw error;
  }
};

// ==========================================
// AUTHORS ENDPOINTS
// ==========================================

/**
 * Obtiene todos los autores
 * @returns Promise<Author[]> Lista de todos los autores
 */
export const getAllAuthors = async (): Promise<Author[]> => {
  console.log('👥 [AdminService] Obteniendo todos los autores...');
  
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/authors`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📤 [AdminService] Respuesta obtener autores:', response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const authors = await response.json();
    console.log(`✅ [AdminService] Obtenidos ${authors.length} autores`);
    return authors;
    
  } catch (error) {
    console.error('❌ [AdminService] Error al obtener autores:', error);
    throw error;
  }
};

/**
 * Obtiene un autor por ID
 * @param id ID del autor
 * @returns Promise<Author> El autor solicitado
 */
export const getAuthorById = async (id: number): Promise<Author> => {
  console.log(`👥 [AdminService] Obteniendo autor ${id}`);
  
  if (!id || id <= 0) {
    throw new Error('ID de autor inválido');
  }
  
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/authors/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📤 [AdminService] Respuesta obtener autor ${id}:`, response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 404) {
      throw new Error('Autor no encontrado');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const author = await response.json();
    console.log(`✅ [AdminService] Autor ${id} obtenido:`, author);
    return author;
    
  } catch (error) {
    console.error(`❌ [AdminService] Error al obtener autor ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo autor
 * @param authorData Datos del autor a crear
 * @returns Promise<Author> El autor creado
 */
export const createAuthor = async (authorData: CreateAuthorRequest): Promise<Author> => {
  console.log('👥 [AdminService] Creando autor:', authorData);
  
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/authors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(authorData)
    });

    console.log('📤 [AdminService] Respuesta crear autor:', response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const newAuthor = await response.json();
    console.log('✅ [AdminService] Autor creado exitosamente:', newAuthor);
    return newAuthor;
    
  } catch (error) {
    console.error('❌ [AdminService] Error al crear autor:', error);
    throw error;
  }
};

/**
 * Actualiza un autor existente
 * @param id ID del autor a actualizar
 * @param authorData Nuevos datos del autor
 * @returns Promise<Author> El autor actualizado
 */
export const updateAuthor = async (id: number, authorData: UpdateAuthorRequest): Promise<Author> => {
  console.log(`👥 [AdminService] Actualizando autor ${id}:`, authorData);
  
  if (!id || id <= 0) {
    throw new Error('ID de autor inválido');
  }
  
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/authors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(authorData)
    });

    console.log(`📤 [AdminService] Respuesta actualizar autor ${id}:`, response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const updatedAuthor = await response.json();
    console.log(`✅ [AdminService] Autor ${id} actualizado exitosamente:`, updatedAuthor);
    return updatedAuthor;
    
  } catch (error) {
    console.error(`❌ [AdminService] Error al actualizar autor ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un autor
 * @param id ID del autor a eliminar
 * @returns Promise<void>
 */
export const deleteAuthor = async (id: number): Promise<void> => {
  console.log(`👥 [AdminService] Eliminando autor ${id}`);
  
  if (!id || id <= 0) {
    throw new Error('ID de autor inválido');
  }
  
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/authors/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`📤 [AdminService] Respuesta eliminar autor ${id}:`, response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    console.log(`✅ [AdminService] Autor ${id} eliminado exitosamente`);
    
  } catch (error) {
    console.error(`❌ [AdminService] Error al eliminar autor ${id}:`, error);
    throw error;
  }
};

// ==========================================
// USERS ENDPOINTS
// ==========================================

/**
 * Obtiene todos los usuarios (solo para administradores)
 * @returns Promise<User[]> Lista de todos los usuarios
 */
export const getAllUsers = async (): Promise<User[]> => {
  console.log('👥 [AdminService] Obteniendo todos los usuarios...');
  
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📤 [AdminService] Respuesta obtener usuarios:', response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const users = await response.json();
    console.log(`✅ [AdminService] Obtenidos ${users.length} usuarios`);
    return users;
    
  } catch (error) {
    console.error('❌ [AdminService] Error al obtener usuarios:', error);
    throw error;
  }
};

/**
 * Obtiene un usuario por ID (solo para administradores)
 * @param id ID del usuario
 * @returns Promise<User> El usuario solicitado
 */
export const getUserById = async (id: number): Promise<User> => {
  console.log(`👥 [AdminService] Obteniendo usuario ${id}`);
  
  if (!id || id <= 0) {
    throw new Error('ID de usuario inválido');
  }
  
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/users/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📤 [AdminService] Respuesta obtener usuario ${id}:`, response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 404) {
      throw new Error('Usuario no encontrado');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const user = await response.json();
    console.log(`✅ [AdminService] Usuario ${id} obtenido:`, user);
    return user;
    
  } catch (error) {
    console.error(`❌ [AdminService] Error al obtener usuario ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un usuario (solo para administradores)
 * CUIDADO: Esta operación es irreversible y eliminará todos los datos del usuario
 * @param id ID del usuario a eliminar
 * @returns Promise<void>
 */
export const deleteUser = async (id: number): Promise<void> => {
  console.log(`👥 [AdminService] Eliminando usuario ${id}`);
  
  if (!id || id <= 0) {
    throw new Error('ID de usuario inválido');
  }
  
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`📤 [AdminService] Respuesta eliminar usuario ${id}:`, response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    console.log(`✅ [AdminService] Usuario ${id} eliminado exitosamente`);
    
  } catch (error) {
    console.error(`❌ [AdminService] Error al eliminar usuario ${id}:`, error);
    throw error;
  }
};