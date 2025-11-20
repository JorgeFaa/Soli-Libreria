// reviewsService.ts - Servicio para manejar operaciones con reseñas de libros

import { getAuthToken } from './authService';

// Interfaces para las reseñas
export interface CreateReviewRequest {
  rating: number; // 1-5 estrellas
  comment: string;
}

export interface UpdateReviewRequest {
  rating: number; // 1-5 estrellas
  comment: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  userFirstName: string;
  bookId: number;
}

export interface ReviewsResponse {
  content: Review[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  // Campos calculados para compatibilidad
  reviews?: Review[];
  totalReviews?: number;
  averageRating?: number;
}

// Configuración de la API
const API_BASE_URL = 'https://soli-api.gentledesert-973b7428.westus2.azurecontainerapps.io';

/**
 * Crear una nueva reseña para un libro
 * @param bookId - ID del libro
 * @param reviewData - Datos de la reseña (rating y comentario)
 * @returns Promise<Review> - Reseña creada
 */
export const createReview = async (bookId: number, reviewData: CreateReviewRequest): Promise<Review> => {
  try {
    console.log('🌟 [ReviewsService] Creando reseña para libro:', bookId);
    console.log('📝 [ReviewsService] Datos de reseña:', reviewData);
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Validar rating
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('La calificación debe estar entre 1 y 5 estrellas.');
    }

    // Validar comentario
    if (!reviewData.comment.trim()) {
      throw new Error('El comentario no puede estar vacío.');
    }

    if (reviewData.comment.length > 1000) {
      throw new Error('El comentario no puede tener más de 1000 caracteres.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/books/${bookId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        rating: reviewData.rating,
        comment: reviewData.comment.trim()
      })
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 403) {
      throw new Error('No tienes permisos para crear reseñas.');
    }

    if (response.status === 400) {
      const errorText = await response.text();
      throw new Error(`Datos inválidos: ${errorText}`);
    }

    if (response.status === 409) {
      throw new Error('Ya has creado una reseña para este libro.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const review: Review = await response.json();
    
    console.log('✅ [ReviewsService] Reseña creada exitosamente:', review);
    return review;

  } catch (error) {
    console.error('❌ [ReviewsService] Error al crear reseña:', error);
    throw error;
  }
};

/**
 * Actualizar una reseña existente
 * @param reviewId - ID de la reseña
 * @param reviewData - Nuevos datos de la reseña (rating y comentario)
 * @returns Promise<Review> - Reseña actualizada
 */
export const updateReview = async (reviewId: number, reviewData: UpdateReviewRequest): Promise<Review> => {
  try {
    console.log('✏️ [ReviewsService] Actualizando reseña:', reviewId);
    console.log('📝 [ReviewsService] Nuevos datos:', reviewData);
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Validar rating
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('La calificación debe estar entre 1 y 5 estrellas.');
    }

    // Validar comentario
    if (!reviewData.comment.trim()) {
      throw new Error('El comentario no puede estar vacío.');
    }

    if (reviewData.comment.length > 1000) {
      throw new Error('El comentario no puede tener más de 1000 caracteres.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        rating: reviewData.rating,
        comment: reviewData.comment.trim()
      })
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 403) {
      throw new Error('No tienes permisos para actualizar esta reseña.');
    }

    if (response.status === 404) {
      throw new Error('La reseña no existe o no tienes permisos para modificarla.');
    }

    if (response.status === 400) {
      const errorText = await response.text();
      throw new Error(`Datos inválidos: ${errorText}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const review: Review = await response.json();
    
    console.log('✅ [ReviewsService] Reseña actualizada exitosamente:', review);
    return review;

  } catch (error) {
    console.error('❌ [ReviewsService] Error al actualizar reseña:', error);
    throw error;
  }
};

/**
 * Eliminar una reseña
 * @param reviewId - ID de la reseña a eliminar
 * @returns Promise<void>
 */
export const deleteReview = async (reviewId: number): Promise<void> => {
  try {
    console.log('🗑️ [ReviewsService] Eliminando reseña:', reviewId);
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v3/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }

    if (response.status === 403) {
      throw new Error('No tienes permisos para eliminar esta reseña.');
    }

    if (response.status === 404) {
      throw new Error('La reseña no existe o ya fue eliminada.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }
    
    console.log('✅ [ReviewsService] Reseña eliminada exitosamente');

  } catch (error) {
    console.error('❌ [ReviewsService] Error al eliminar reseña:', error);
    throw error;
  }
};

/**
 * Obtener todas las reseñas de un libro
 * @param bookId - ID del libro
 * @param page - Número de página (default: 0)
 * @param size - Tamaño de página (default: 10)
 * @returns Promise<ReviewsResponse> - Reseñas del libro con paginación
 */
export const getBookReviews = async (bookId: number, page: number = 0, size: number = 10): Promise<ReviewsResponse> => {
  try {
    console.log('📚 [ReviewsService] Obteniendo reseñas para libro:', bookId);
    console.log('📄 [ReviewsService] Parámetros paginación:', { page, size });
    
    // Las reseñas pueden ser públicas, pero incluimos token si está disponible
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Construir URL con parámetros de paginación
    const url = new URL(`${API_BASE_URL}/api/v3/books/${bookId}/reviews`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', size.toString());

    console.log('🌐 [ReviewsService] URL completa:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers
    });

    console.log('📡 [ReviewsService] Status response:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        // No hay reseñas para este libro
        console.log('📝 [ReviewsService] No hay reseñas para este libro');
        return {
          content: [],
          page: 0,
          size: size,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
          hasNext: false,
          hasPrevious: false,
          // Campos de compatibilidad
          reviews: [],
          totalReviews: 0,
          averageRating: 0
        };
      }
      
      const errorText = await response.text();
      console.error('❌ [ReviewsService] Error response:', errorText);
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📊 [ReviewsService] Respuesta del servidor:', data);
    
    // Calcular promedio de rating si hay reseñas
    const averageRating = data.content && data.content.length > 0 ? 
      data.content.reduce((sum: number, review: Review) => sum + review.rating, 0) / data.content.length : 0;
    
    const reviewsResponse: ReviewsResponse = {
      content: data.content || [],
      page: data.page || 0,
      size: data.size || size,
      totalElements: data.totalElements || 0,
      totalPages: data.totalPages || 0,
      first: data.first !== undefined ? data.first : true,
      last: data.last !== undefined ? data.last : true,
      hasNext: data.hasNext !== undefined ? data.hasNext : false,
      hasPrevious: data.hasPrevious !== undefined ? data.hasPrevious : false,
      
      // Campos de compatibilidad
      reviews: data.content || [],
      totalReviews: data.totalElements || 0,
      averageRating: averageRating
    };
    
    console.log('✅ [ReviewsService] Respuesta procesada:', {
      totalReviews: reviewsResponse.totalReviews,
      currentPage: reviewsResponse.page,
      totalPages: reviewsResponse.totalPages,
      averageRating: (reviewsResponse.averageRating || 0).toFixed(1)
    });
    
    return reviewsResponse;

  } catch (error) {
    console.error('❌ [ReviewsService] Error al obtener reseñas:', error);
    throw error;
  }
};

/**
 * Formatear fecha de reseña para mostrar
 * @param dateString - Fecha en formato ISO
 * @returns string - Fecha formateada
 */
export const formatReviewDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (error) {
    return dateString;
  }
};

/**
 * Generar estrellas para mostrar rating
 * @param rating - Rating de 1 a 5
 * @returns string - Estrellas en formato emoji
 */
export const generateStars = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '⭐'.repeat(fullStars) + 
         (hasHalfStar ? '⭐' : '') + 
         '☆'.repeat(emptyStars);
};