// apiInterceptor.ts - Interceptor para manejar automáticamente errores 401 y refresh de tokens

import { handleAutoTokenRefresh, getAuthToken, logoutUser } from './authService';

// Tipo para las opciones de fetch mejoradas
interface ExtendedRequestInit extends RequestInit {
  skipTokenRefresh?: boolean; // Para evitar loops infinitos en el refresh
}

// Función wrapper para fetch que maneja automáticamente el refresh de tokens
export const fetchWithTokenRefresh = async (
  url: string, 
  options: ExtendedRequestInit = {}
): Promise<Response> => {
  
  // Función auxiliar para hacer la petición
  const makeRequest = async (requestOptions: RequestInit): Promise<Response> => {
    return fetch(url, requestOptions);
  };

  // Preparar headers con token de autorización
  const prepareHeaders = (options: ExtendedRequestInit): HeadersInit => {
    const headers = new Headers(options.headers);
    
    // Solo agregar token si no está skipTokenRefresh y si tenemos token
    if (!options.skipTokenRefresh) {
      const token = getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
    
    return headers;
  };

  try {
    // Intentar refresh preventivo si es necesario (solo para requests que requieren autenticación)
    if (!options.skipTokenRefresh && getAuthToken()) {
      await handleAutoTokenRefresh();
    }

    // Preparar options con headers actualizados
    const requestOptions: RequestInit = {
      ...options,
      headers: prepareHeaders(options)
    };

    console.log(`🌐 [ApiInterceptor] Realizando petición: ${url}`);
    
    // Primer intento
    let response = await makeRequest(requestOptions);
    
    // Si es 401 y no estamos en skipTokenRefresh, intentar refresh y reintentar
    if (response.status === 401 && !options.skipTokenRefresh && getAuthToken()) {
      console.log('🔄 [ApiInterceptor] Token expirado (401), intentando refresh...');
      
      const refreshResult = await handleAutoTokenRefresh();
      
      if (refreshResult) {
        console.log('✅ [ApiInterceptor] Refresh exitoso, reintentando petición original...');
        
        // Actualizar headers con el nuevo token
        const newRequestOptions: RequestInit = {
          ...options,
          headers: prepareHeaders(options)
        };
        
        // Reintentar la petición original
        response = await makeRequest(newRequestOptions);
        
        if (response.status === 401) {
          console.error('❌ [ApiInterceptor] Aún 401 después del refresh, sesión inválida');
          logoutUser(); // Limpiar sesión local
        }
        
      } else {
        console.error('❌ [ApiInterceptor] Falló el refresh, manteniendo respuesta 401 original');
        logoutUser(); // Limpiar sesión local
      }
    }
    
    // Log del resultado
    if (response.ok) {
      console.log(`✅ [ApiInterceptor] Petición exitosa: ${response.status}`);
    } else if (response.status !== 401) { // 401 ya se loggea arriba
      console.log(`⚠️ [ApiInterceptor] Petición con error: ${response.status}`);
    }
    
    return response;
    
  } catch (error) {
    console.error(`❌ [ApiInterceptor] Error en petición a ${url}:`, error);
    throw error;
  }
};

// Función conveniente para requests GET con manejo automático de tokens
export const apiGet = async (url: string, options: ExtendedRequestInit = {}): Promise<Response> => {
  return fetchWithTokenRefresh(url, {
    ...options,
    method: 'GET'
  });
};

// Función conveniente para requests POST con manejo automático de tokens
export const apiPost = async (
  url: string, 
  data: any, 
  options: ExtendedRequestInit = {}
): Promise<Response> => {
  return fetchWithTokenRefresh(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: JSON.stringify(data)
  });
};

// Función conveniente para requests PUT con manejo automático de tokens
export const apiPut = async (
  url: string, 
  data: any, 
  options: ExtendedRequestInit = {}
): Promise<Response> => {
  return fetchWithTokenRefresh(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: JSON.stringify(data)
  });
};

// Función conveniente para requests DELETE con manejo automático de tokens
export const apiDelete = async (url: string, options: ExtendedRequestInit = {}): Promise<Response> => {
  return fetchWithTokenRefresh(url, {
    ...options,
    method: 'DELETE'
  });
};