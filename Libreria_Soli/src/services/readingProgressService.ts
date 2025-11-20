// readingProgressService.ts - Servicio para manejar el progreso de lectura

import { getAuthToken } from './authService';

// Interfaces para el progreso de lectura
export interface ReadingProgress {
  bookId: number;
  lastPage: number;
  updatedAt: string;
}

export interface UpdateProgressRequest {
  lastPage: number;
}

// Configuración de la API
const API_BASE_URL = 'https://soli-api.gentledesert-973b7428.westus2.azurecontainerapps.io';

/**
 * Actualizar progreso de lectura de un libro específico
 * @param bookId - ID del libro
 * @param lastPage - Última página leída
 * @returns Promise<void> - No retorna datos, solo confirma éxito
 */
export const updateReadingProgress = async (bookId: number, lastPage: number): Promise<void> => {
  try {
    console.log('📚 [ReadingProgress] Actualizando progreso:', { bookId, lastPage });
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Validar parámetros
    if (!bookId || !Number.isInteger(bookId) || bookId <= 0) {
      throw new Error('ID de libro debe ser un número entero positivo.');
    }

    if (!Number.isInteger(lastPage) || lastPage < 0) {
      throw new Error('La página debe ser un número entero mayor o igual a 0.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/users/me/progress/${bookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        lastPage: lastPage
      })
    });

    console.log('📡 [ReadingProgress] Status response:', response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 403) {
      throw new Error('No tienes permisos para actualizar el progreso de lectura.');
    }

    if (response.status === 404) {
      throw new Error('Libro no encontrado.');
    }

    if (response.status === 400) {
      const errorText = await response.text();
      throw new Error(`Datos inválidos: ${errorText}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    console.log('✅ [ReadingProgress] Progreso actualizado exitosamente');

  } catch (error) {
    console.error('❌ [ReadingProgress] Error al actualizar progreso:', error);
    throw error;
  }
};

/**
 * Obtener todo el progreso de lectura del usuario
 * @returns Promise<ReadingProgress[]> - Array con todo el progreso del usuario
 */
export const getUserReadingProgress = async (): Promise<ReadingProgress[]> => {
  try {
    console.log('📚 [ReadingProgress] Obteniendo progreso de lectura del usuario...');
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/users/me/progress`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📡 [ReadingProgress] Status response:', response.status);

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 403) {
      throw new Error('No tienes permisos para ver el progreso de lectura.');
    }

    if (response.status === 404) {
      // Usuario sin progreso de lectura, devolver array vacío
      console.log('📝 [ReadingProgress] Usuario no tiene progreso de lectura aún');
      return [];
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const progress: ReadingProgress[] = await response.json();
    
    console.log(`✅ [ReadingProgress] Obtenido progreso para ${progress.length} libros:`, progress);
    return progress;

  } catch (error) {
    console.error('❌ [ReadingProgress] Error al obtener progreso:', error);
    throw error;
  }
};

/**
 * Obtener progreso de lectura de un libro específico
 * @param bookId - ID del libro
 * @returns Promise<ReadingProgress | null> - Progreso del libro o null si no existe
 */
export const getBookReadingProgress = async (bookId: number): Promise<ReadingProgress | null> => {
  try {
    const allProgress = await getUserReadingProgress();
    const bookProgress = allProgress.find(progress => progress.bookId === bookId);
    return bookProgress || null;
  } catch (error) {
    console.error(`❌ [ReadingProgress] Error al obtener progreso del libro ${bookId}:`, error);
    throw error;
  }
};

/**
 * Calcular porcentaje de lectura basado en páginas
 * @param currentPage - Página actual
 * @param totalPages - Total de páginas del libro
 * @returns number - Porcentaje de 0 a 100
 */
export const calculateReadingPercentage = (currentPage: number, totalPages: number): number => {
  if (totalPages <= 0) return 0;
  if (currentPage <= 0) return 0;
  if (currentPage >= totalPages) return 100;
  
  return Math.round((currentPage / totalPages) * 100);
};

/**
 * Formatear progreso de lectura para mostrar al usuario
 * @param progress - Objeto de progreso de lectura
 * @param totalPages - Total de páginas del libro (opcional)
 * @returns string - Texto formateado del progreso
 */
export const formatReadingProgress = (progress: ReadingProgress, totalPages?: number): string => {
  const { lastPage } = progress;
  
  if (totalPages && totalPages > 0) {
    const percentage = calculateReadingPercentage(lastPage, totalPages);
    return `Página ${lastPage} de ${totalPages} (${percentage}%)`;
  }
  
  return `Página ${lastPage}`;
};

/**
 * Determinar si un libro está completado
 * @param progress - Objeto de progreso de lectura
 * @param totalPages - Total de páginas del libro
 * @returns boolean - true si está completado
 */
export const isBookCompleted = (progress: ReadingProgress, totalPages: number): boolean => {
  if (totalPages <= 0) return false;
  return progress.lastPage >= totalPages;
};