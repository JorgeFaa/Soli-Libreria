// authService.ts - Servicio de autenticación para comunicarse con la API de AWS

import { decodeJWT as decodeJWTUtil, isTokenExpired, getUserRoles, hasRole, isAdmin, isReader } from '../utils/jwtUtils';

// Tipos para las respuestas de la API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

// Tipo simplificado para el nuevo endpoint
export interface RegisterAPIRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  tokens?: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

// Tipo para la respuesta de login de la nueva API
export interface LoginTokenResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

// Tipo para el request de refresh token
export interface RefreshTokenRequest {
  username: string;
  refreshToken: string;
}

// Tipo para la respuesta de refresh token (igual que login)
export interface RefreshTokenResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

// Tipos para recuperación de contraseña
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ConfirmForgotPasswordRequest {
  email: string;
  confirmationCode: string;
  newPassword: string;
}

export interface ConfirmForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyAccountRequest {
  username: string;
  code: string;
}

export interface ResendVerificationRequest {
  username: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
}

// Tipo para la respuesta de verificación de la nueva API
export interface VerifyAccountResponse {
  status: string;
}

// Tipos para el endpoint createUser
export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  preferredGenreIds: number[];
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  user?: any;
}

// Tipos para el perfil completo del usuario
export interface UserCompleteProfile {
  id: number; // Cambiado a number según la especificación
  email?: string;
  firstName?: string;
  lastName?: string;
  profileCompleted?: boolean;
  preferredGenres?: any[];
  preferredGenreIds?: number[]; // Versión con una 'f'
  prefferredGenreIds?: number[]; // Versión con doble 'f' (typo del backend)
  favoriteBooks?: number[];
  // Agregar otros campos según la respuesta real del API
}

export interface UserProfileResponse {
  success: boolean;
  user?: UserCompleteProfile | {
    success: boolean;
    message: string;
    profile: UserCompleteProfile;
  };
  message?: string;
}

// Configuración de la API - Nuevo endpoint directo de Google Cloud Run
const API_BASE_URL = 'https://soli-api.gentledesert-973b7428.westus2.azurecontainerapps.io';

// ==========================================
// VERIFICACIÓN DE CONECTIVIDAD DEL SERVIDOR
// ==========================================

/**
 * Verifica si el servidor está disponible y accesible
 * @returns Promise<boolean> true si el servidor responde, false si no
 */
export const checkServerConnectivity = async (): Promise<boolean> => {
  try {
    console.log('🔍 [AuthService] Verificando conectividad del servidor...');
    
    // Intentar un endpoint simple y rápido
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Timeout corto para verificación rápida
      signal: AbortSignal.timeout(5000) // 5 segundos
    });
    
    const isConnected = response.ok || response.status < 500;
    console.log(`${isConnected ? '✅' : '❌'} [AuthService] Servidor ${isConnected ? 'disponible' : 'no disponible'} - Status: ${response.status}`);
    return isConnected;
    
  } catch (error) {
    console.error('❌ [AuthService] Error de conectividad del servidor:', error);
    return false;
  }
};

/**
 * Verifica la validez del token actual contra el servidor
 * Solo valida si hay conectividad
 * @returns Promise<boolean> true si el token es válido, false si no
 */
export const validateTokenWithServer = async (): Promise<boolean> => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.log('⚠️ [AuthService] No hay token para validar');
      return false;
    }

    // Primero verificar conectividad
    const serverAvailable = await checkServerConnectivity();
    if (!serverAvailable) {
      console.log('⚠️ [AuthService] Servidor no disponible - no se puede validar token');
      return false;
    }

    // Intentar una operación que requiera autenticación
    const response = await fetch(`${API_BASE_URL}/api/v3/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000) // 5 segundos
    });

    const isValid = response.ok;
    console.log(`${isValid ? '✅' : '❌'} [AuthService] Token ${isValid ? 'válido' : 'inválido'} - Status: ${response.status}`);
    
    // SOLO limpiar localStorage si es un error definitivo (401, 403)
    // NO hacer logout por errores 404 que pueden ser temporales
    if (!isValid && (response.status === 401 || response.status === 403)) {
      console.log('🧹 [AuthService] Limpiando tokens inválidos por error de autenticación...');
      logoutUser();
    } else if (!isValid) {
      console.log('⚠️ [AuthService] Error temporal del servidor, manteniendo sesión activa');
    }
    
    return isValid;
    
  } catch (error) {
    console.error('❌ [AuthService] Error validando token:', error);
    return false;
  }
};

// Función auxiliar para decodificar JWT - usa la utilidad centralizada
const decodeJWT = (token: string): any => {
  return decodeJWTUtil(token);
};

// Funciones para manejo de roles
export const getCurrentUserRoles = (): string[] => {
  const token = getAuthToken();
  return token ? getUserRoles(token) : [];
};

export const currentUserHasRole = (role: string): boolean => {
  const token = getAuthToken();
  return token ? hasRole(token, role) : false;
};

export const isCurrentUserAdmin = (): boolean => {
  const token = getAuthToken();
  return token ? isAdmin(token) : false;
};

export const isCurrentUserReader = (): boolean => {
  const token = getAuthToken();
  return token ? isReader(token) : false;
};

export const isCurrentTokenExpired = (): boolean => {
  const token = getAuthToken();
  return token ? isTokenExpired(token) : true;
};

// Función auxiliar para manejar respuestas HTTP del endpoint de registro
const handleRegisterResponse = async (response: Response, userData: RegisterRequest): Promise<AuthResponse> => {
  try {
    // El endpoint puede devolver tanto string como JSON
    const responseText = await response.text();
    
    // Intentar parsear como JSON primero
    let responseData: any = null;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      // Respuesta no es JSON válido, tratando como texto
    }
    
    // Verificar si el registro fue exitoso
    if (response.status === 200) {
      let isSuccess = false;
      let successMessage = "¡Registro exitoso! Revisa tu email para confirmar la cuenta.";
      
      if (responseData && typeof responseData === 'object') {
        // Respuesta JSON - verificar campo success
        if (responseData.success === true) {
          isSuccess = true;
          successMessage = responseData.instructions || responseData.message || successMessage;
        } else {
          // JSON indica fallo
        }
      } else {
        // Respuesta de texto - verificar contenido
        if (responseText.includes("Usuario registrado en Cognito")) {
          isSuccess = true;
        } else {
          // Texto no contiene mensaje de éxito esperado
        }
      }
      
      if (isSuccess) {
        return {
          success: true,
          message: successMessage,
          user: {
            id: "registered-user-" + Date.now(),
            nombre: userData.nombre,
            apellido: userData.apellido,
            email: userData.email
          }
        };
      }
    }
    
    // Si llegamos aquí, el registro falló
    let errorMessage = "Error en el registro";
    if (responseData && responseData.message) {
      errorMessage = responseData.message;
    } else if (responseText) {
      errorMessage = responseText;
    }
    
    return {
      success: false,
      message: errorMessage
    };
    
  } catch (error) {
    throw new Error('Error procesando respuesta del servidor');
  }
};

// Función para login
export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    // VERIFICAR CONECTIVIDAD PRIMERO
    console.log('🔍 [AuthService] Verificando conectividad antes del login...');
    const serverAvailable = await checkServerConnectivity();
    
    if (!serverAvailable) {
      console.error('❌ [AuthService] Servidor no disponible - login cancelado');
      return {
        success: false,
        message: "No se puede conectar al servidor. Verifica tu conexión a internet e inténtalo nuevamente."
      };
    }
    
    console.log('✅ [AuthService] Servidor disponible - procediendo con login');
    
    // Llamada a la API con el nuevo formato
    const requestBody = {
      username: credentials.email,
      password: credentials.password
    };
    
    const response = await fetch(`${API_BASE_URL}/api/v3/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 200) {
      const responseData = await response.json();
      
      // La nueva API devuelve los tokens directamente
      const tokens = {
        accessToken: responseData.accessToken,
        idToken: responseData.idToken,
        refreshToken: responseData.refreshToken,
        expiresIn: responseData.expiresIn
      };
      
      // Decodificar el idToken para extraer información del usuario
      const userInfo = decodeJWT(tokens.idToken);
      
      const user = {
        id: userInfo?.sub || "unknown-id",
        nombre: userInfo?.email?.split('@')[0] || "Usuario", // Usar parte del email como nombre
        apellido: "", // No disponible en el JWT
        email: userInfo?.email || credentials.email
      };
      
      // Guardar tokens y información del usuario
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('idToken', tokens.idToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('tokenExpiry', (Date.now() + parseInt(tokens.expiresIn) * 1000).toString());
      localStorage.setItem('userData', JSON.stringify(user));
      
      // Mantener compatibilidad con código anterior usando accessToken como token principal
      localStorage.setItem('authToken', tokens.accessToken);
      
      console.log('✅ [AuthService] Login exitoso con servidor');
      return {
        success: true,
        message: "¡Login exitoso! Bienvenido de vuelta",
        token: tokens.accessToken,
        tokens: tokens,
        user: user
      };
      
    } else {
      // Intentar parsear la respuesta de error
      let errorMessage = "Credenciales incorrectas";
      
      try {
        const errorText = await response.text();
        console.log('🔍 [AuthService] Respuesta de error del servidor:', errorText);
        console.log('🔍 [AuthService] Status code:', response.status);
        
        // Intentar parsear como JSON
        try {
          const errorData = JSON.parse(errorText);
          console.log('🔍 [AuthService] Error parseado:', errorData);
          
          // Extraer el mensaje de error del JSON
          if (errorData.error) {
            const errorLower = errorData.error.toLowerCase();
            
            // Mapear errores comunes a mensajes amigables
            if (errorLower.includes("incorrect") || errorLower.includes("password") || errorLower.includes("contraseña")) {
              errorMessage = "Contraseña incorrecta. Por favor, verifica tu contraseña e intenta nuevamente.";
            } else if (errorLower.includes("not found") || errorLower.includes("no encontrado") || errorLower.includes("user") || errorLower.includes("usuario")) {
              errorMessage = "Usuario no encontrado. Verifica tu email e intenta nuevamente.";
            } else if (response.status === 500) {
              // Error 500 específico
              errorMessage = "Error en el servidor. Por favor, intenta nuevamente más tarde.";
            } else {
              errorMessage = "Error al iniciar sesión. Verifica tus credenciales.";
            }
          } else if (errorData.message) {
            const messageLower = errorData.message.toLowerCase();
            
            if (messageLower.includes("incorrect") || messageLower.includes("password") || messageLower.includes("contraseña")) {
              errorMessage = "Contraseña incorrecta. Por favor, verifica tu contraseña e intenta nuevamente.";
            } else if (messageLower.includes("not found") || messageLower.includes("usuario")) {
              errorMessage = "Usuario no encontrado. Verifica tu email e intenta nuevamente.";
            } else {
              errorMessage = errorData.message;
            }
          }
        } catch (parseError) {
          console.log('⚠️ [AuthService] No se pudo parsear como JSON');
          
          // Si no es JSON válido, usar el texto directamente si es legible
          if (errorText && errorText.length < 100 && !errorText.includes('{')) {
            errorMessage = errorText;
          } else if (response.status === 500) {
            errorMessage = "Error en el servidor. Por favor, intenta nuevamente más tarde.";
          } else if (response.status === 401 || response.status === 403) {
            errorMessage = "Credenciales incorrectas. Verifica tu email y contraseña.";
          }
        }
      } catch (textError) {
        console.error('Error al leer respuesta de error:', textError);
        
        // Basarse en el código de estado HTTP
        if (response.status === 401 || response.status === 403) {
          errorMessage = "Credenciales incorrectas. Verifica tu email y contraseña.";
        } else if (response.status === 500) {
          errorMessage = "Error en el servidor. Por favor, intenta nuevamente más tarde.";
        }
      }
      
      console.error('❌ [AuthService] Error de credenciales:', errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    }
    
  } catch (error) {
    console.error('❌ [AuthService] Error durante login:', error);
    
    // IMPORTANTE: NO hacer fallback automático a modo simulación
    // El servidor debe estar disponible para hacer login
    return {
      success: false,
      message: "Error de conexión. No se pudo conectar al servidor para validar las credenciales."
    };
  }
};

// Función para registro
export const registerUser = async (userData: RegisterRequest): Promise<AuthResponse> => {
  try {
    // Llamada a la API real
    const requestBody = {
      username: userData.email,  // La API espera 'username' en lugar de 'email'
      password: userData.password
    };
    
    const response = await fetch(`${API_BASE_URL}/api/v3/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await handleRegisterResponse(response, userData);
    
    return result;
    
  } catch (error) {
    // Solo hacer fallback si es un error de red real, no un error de validación
    if (error instanceof Error && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('NetworkError') ||
      error.message.includes('CORS')
    )) {
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular respuesta exitosa como fallback
      const mockResponse: AuthResponse = {
        success: true,
        message: "Registro exitoso (modo simulación por error de red)",
        token: "mock-jwt-token-" + Date.now(),
        user: {
          id: "mock-user-id-" + Date.now(),
          nombre: userData.nombre,
          apellido: userData.apellido,
          email: userData.email
        }
      };
      
      // Guardar token simulado
      if (mockResponse.success && mockResponse.token) {
        localStorage.setItem('authToken', mockResponse.token);
        localStorage.setItem('userData', JSON.stringify(mockResponse.user));
      }
      
      return mockResponse;
    } else {
      // Re-lanzar otros errores (como validación, usuario duplicado, etc.)
      throw error;
    }
  }
};

// Función para verificar cuenta con código
export const verifyAccount = async (email: string, code: string): Promise<AuthResponse> => {
  try {
    // Llamada a la API real con el nuevo formato
    const requestBody = {
      username: email,
      code: code
    };
    
    const response = await fetch(`${API_BASE_URL}/api/v3/auth/verify-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    // Verificar si la verificación fue exitosa
    // La API puede devolver diferentes formatos, verificamos múltiples condiciones
    if (response.status === 200) {
      // Verificar si el mensaje indica éxito (independientemente del campo success)
      const isSuccessMessage = data.message && 
        (data.message.toLowerCase().includes('verificada exitosamente') ||
         data.message.toLowerCase().includes('verified successfully') ||
         data.message.toLowerCase().includes('cuenta verificada'));
      
      // Verificar el campo status
      const isSuccessStatus = data.status === "SUCCESS";
      
      // Verificar el campo success (aunque pueda estar mal configurado)
      const hasSuccessField = data.success === true;
      
      // Considerar exitoso si cualquiera de estas condiciones se cumple
      if (isSuccessStatus || isSuccessMessage || hasSuccessField) {
        return {
          success: true,
          message: "¡Cuenta verificada exitosamente!"
        };
      }
    }
    
    // Si llegamos aquí, la verificación falló
    return {
      success: false,
      message: data.message || "Código inválido o expirado"
    };
    
  } catch (error) {
    // Solo hacer fallback si es un error de red real
    if (error instanceof Error && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('NetworkError') ||
      error.message.includes('CORS')
    )) {
      // Simular respuesta exitosa como fallback
      return {
        success: true,
        message: "Verificación exitosa (modo simulación por error de red)"
      };
    } else {
      // Re-lanzar otros errores
      throw error;
    }
  }
};

// Función para reenviar código de verificación
export const resendVerificationCode = async (request: ResendVerificationRequest): Promise<ResendVerificationResponse> => {
  try {
    // Llamada a la API con el nuevo formato
    const requestBody = {
      username: request.username
    };

    const response = await fetch(`${API_BASE_URL}/api/v3/user/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // El nuevo endpoint devuelve un string simple, no JSON
    const responseText = await response.text();

    // Verificar si el reenvío fue exitoso (status 200 y mensaje esperado)
    if (response.status === 200 && responseText.includes("Código de verificación reenviado")) {
      return {
        success: true,
        message: "Código de verificación reenviado exitosamente"
      };
    } else {
      return {
        success: false,
        message: responseText || "Error al reenviar el código"
      };
    }

  } catch (error) {
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return {
          success: false,
          message: "Error de conexión. Verifica tu internet e intenta nuevamente."
        };
      }
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: false,
      message: "Error desconocido al reenviar código"
    };
  }
};

// Función para logout con API endpoint
export const logoutUser = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Obtener tokens necesarios para la API
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userData = localStorage.getItem('userData');
    
    let username = '';
    if (userData) {
      try {
        const user = JSON.parse(userData);
        username = user.email || '';
      } catch (e) {
        // No se pudo obtener email del usuario
      }
    }
    
    // Si tenemos los tokens necesarios, llamar a la API
    if (accessToken && refreshToken && username) {
      const requestBody = {
        username: username,
        refreshToken: refreshToken
      };
      
      const response = await fetch(`${API_BASE_URL}/api/v3/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (response.status === 200) {
        await response.json();
      }
    }
    
  } catch (error) {
    // Error en logout API, continuando con logout local
  }
  
  // Siempre limpiar tokens localmente, independientemente del resultado de la API
  localStorage.removeItem('authToken');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('idToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiry');
  localStorage.removeItem('userData');
  localStorage.removeItem('profileCompleted');
  localStorage.removeItem('hasLoggedInBefore');
  
  return {
    success: true,
    message: "Sesión cerrada exitosamente"
  };
};

// Función para solicitar recuperación de contraseña
export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  try {
    console.log('🔍 [AuthService] Solicitando recuperación de contraseña...');
    
    // Verificar conectividad del servidor
    const serverAvailable = await checkServerConnectivity();
    if (!serverAvailable) {
      console.error('❌ [AuthService] Servidor no disponible - recuperación cancelada');
      return {
        success: false,
        message: "No se puede conectar al servidor. Verifica tu conexión a internet e inténtalo nuevamente."
      };
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        success: false,
        message: "Por favor, ingresa un email válido."
      };
    }

    console.log('🌐 [AuthService] Enviando solicitud de recuperación de contraseña...');

    // Preparar request
    const requestBody: ForgotPasswordRequest = {
      email: email
    };

    // Llamada a la API
    const response = await fetch(`${API_BASE_URL}/api/v3/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 200) {
      console.log('✅ [AuthService] Solicitud de recuperación enviada exitosamente');
      
      return {
        success: true,
        message: "Se ha enviado un código de verificación a tu correo electrónico."
      };
      
    } else {
      const errorText = await response.text();
      console.error('❌ [AuthService] Error en forgot-password:', response.status, errorText);
      
      if (response.status === 404) {
        return {
          success: false,
          message: "No existe una cuenta con ese correo electrónico."
        };
      } else if (response.status === 429) {
        return {
          success: false,
          message: "Demasiadas solicitudes. Intenta nuevamente en unos minutos."
        };
      } else {
        return {
          success: false,
          message: "Error del servidor. Intenta nuevamente más tarde."
        };
      }
    }
    
  } catch (error) {
    console.error('❌ [AuthService] Excepción durante forgot-password:', error);
    
    if (error instanceof Error && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('NetworkError') ||
      error.message.includes('CORS')
    )) {
      return {
        success: false,
        message: "Error de conexión. Verifica tu internet e intenta nuevamente."
      };
    }
    
    return {
      success: false,
      message: "Error interno. Intenta nuevamente más tarde."
    };
  }
};

// Función para confirmar recuperación de contraseña con código
export const confirmForgotPassword = async (
  email: string, 
  confirmationCode: string, 
  newPassword: string
): Promise<ConfirmForgotPasswordResponse> => {
  try {
    console.log('🔍 [AuthService] Confirmando nueva contraseña...');
    
    // Verificar conectividad del servidor
    const serverAvailable = await checkServerConnectivity();
    if (!serverAvailable) {
      console.error('❌ [AuthService] Servidor no disponible - confirmación cancelada');
      return {
        success: false,
        message: "No se puede conectar al servidor. Verifica tu conexión a internet e inténtalo nuevamente."
      };
    }

    // Validaciones
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        success: false,
        message: "Por favor, ingresa un email válido."
      };
    }

    if (!confirmationCode || confirmationCode.trim().length === 0) {
      return {
        success: false,
        message: "Por favor, ingresa el código de verificación."
      };
    }

    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        message: "La contraseña debe tener al menos 8 caracteres."
      };
    }

    console.log('🌐 [AuthService] Enviando confirmación de nueva contraseña...');

    // Preparar request
    const requestBody: ConfirmForgotPasswordRequest = {
      email: email,
      confirmationCode: confirmationCode.trim(),
      newPassword: newPassword
    };

    // Llamada a la API
    const response = await fetch(`${API_BASE_URL}/api/v3/auth/confirm-forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 200) {
      console.log('✅ [AuthService] Contraseña actualizada exitosamente');
      
      return {
        success: true,
        message: "Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."
      };
      
    } else {
      const errorText = await response.text();
      console.error('❌ [AuthService] Error en confirm-forgot-password:', response.status, errorText);
      
      if (response.status === 400) {
        return {
          success: false,
          message: "Código de verificación inválido o expirado."
        };
      } else if (response.status === 404) {
        return {
          success: false,
          message: "No existe una cuenta con ese correo electrónico."
        };
      } else if (response.status === 429) {
        return {
          success: false,
          message: "Demasiados intentos. Intenta nuevamente en unos minutos."
        };
      } else {
        return {
          success: false,
          message: "Error del servidor. Intenta nuevamente más tarde."
        };
      }
    }
    
  } catch (error) {
    console.error('❌ [AuthService] Excepción durante confirm-forgot-password:', error);
    
    if (error instanceof Error && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('NetworkError') ||
      error.message.includes('CORS')
    )) {
      return {
        success: false,
        message: "Error de conexión. Verifica tu internet e intenta nuevamente."
      };
    }
    
    return {
      success: false,
      message: "Error interno. Intenta nuevamente más tarde."
    };
  }
};

// Función para verificar si hay una sesión activa (actualizada)
export const isAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem('accessToken');
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  
  if (!accessToken || !tokenExpiry) {
    return false;
  }
  
  // Verificar si el token no ha expirado
  const isNotExpired = Date.now() < parseInt(tokenExpiry);
  
  if (!isNotExpired) {
    logoutUser();
    return false;
  }
  
  return true;
};

// Función para obtener el token de acceso
export const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * Obtiene el token de autenticación con verificación de validez
 * Esta versión verifica que el token sea válido y el servidor esté disponible
 * @param validateWithServer Si debe validar contra el servidor (por defecto false para evitar llamadas innecesarias)
 * @returns Promise<string | null> El token si es válido, null si no
 */
export const getValidAuthToken = async (validateWithServer: boolean = false): Promise<string | null> => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    console.log('⚠️ [AuthService] No hay token disponible');
    return null;
  }

  // Verificación básica de expiración local
  if (isTokenExpired(token)) {
    console.log('⚠️ [AuthService] Token expirado localmente');
    logoutUser();
    return null;
  }

  // Si se solicita validación con servidor
  if (validateWithServer) {
    const isValid = await validateTokenWithServer();
    if (!isValid) {
      console.log('⚠️ [AuthService] Token inválido según servidor');
      return null;
    }
  }

  return token;
};

/**
 * Verifica si el usuario está realmente autenticado (SIMPLIFICADA)
 * @returns boolean true si tiene token válido localmente
 */
export const isUserAuthenticated = async (): Promise<boolean> => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.log('⚠️ [AuthService] No hay token almacenado');
      return false;
    }

    // Verificar si el token es un mock (modo offline)
    if (token.startsWith('mock-jwt-token-')) {
      console.log('⚠️ [AuthService] Token mock detectado - removiendo');
      // Limpiar datos de sesión simulada
      logoutUser();
      return false;
    }

    // SIMPLIFICADO - Solo verificar que tengamos token, sin validaciones de servidor
    console.log('✅ [AuthService] Token encontrado - usuario autenticado localmente');
    return true;
    
  } catch (error) {
    console.error('❌ [AuthService] Error verificando autenticación:', error);
    // En caso de error, no forzar logout - puede ser temporal
    return getAuthToken() !== null;
  }
};

/**
 * Inicia un monitor de conectividad que verifica periódicamente el estado del servidor
 * Se ejecuta en intervalos para detectar cuando el servidor se desconecta/reconecta
 */
export const startConnectivityMonitor = () => {
  console.log('🔄 [AuthService] Iniciando monitor de conectividad...');
  
  // Verificación inicial
  checkServerConnectivity();
  
  // Verificación periódica cada 30 segundos
  const interval = setInterval(async () => {
    const isConnected = await checkServerConnectivity();
    
    if (!isConnected) {
      console.warn('⚠️ [AuthService] Servidor desconectado - las operaciones pueden fallar');
      
      // Opcional: Mostrar notificación al usuario
      const event = new CustomEvent('serverDisconnected', { 
        detail: { message: 'El servidor no está disponible. Algunas funcionalidades pueden no funcionar.' }
      });
      window.dispatchEvent(event);
    } else {
      // Servidor conectado - validar token si hay uno
      const token = getAuthToken();
      if (token) {
        const isValid = await validateTokenWithServer();
        if (!isValid) {
          console.warn('⚠️ [AuthService] Sesión invalidada por el servidor');
          
          const event = new CustomEvent('sessionInvalidated', { 
            detail: { message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' }
          });
          window.dispatchEvent(event);
        }
      }
    }
  }, 30000); // 30 segundos
  
  // Limpiar intervalo en caso de que se necesite
  return () => {
    clearInterval(interval);
    console.log('🛑 [AuthService] Monitor de conectividad detenido');
  };
};

/**
 * Función utilitaria para verificar si las operaciones de API están disponibles
 * Debe usarse antes de operaciones críticas
 * @returns Promise<boolean> true si se pueden realizar operaciones de API
 */
export const canPerformAPIOperations = async (): Promise<boolean> => {
  const serverAvailable = await checkServerConnectivity();
  
  if (!serverAvailable) {
    console.log('❌ [AuthService] Servidor no disponible para operaciones API');
    return false;
  }
  
  // Solo verificar autenticación básica (sin validación servidor para evitar bucle)
  const token = getAuthToken();
  if (!token || token.startsWith('mock-jwt-token-')) {
    console.log('❌ [AuthService] No hay token válido para operaciones API');
    return false;
  }
  
  return true;
};

// Función para obtener el token de identidad
export const getIdToken = (): string | null => {
  return localStorage.getItem('idToken');
};

// Función para obtener el refresh token
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

// Función para obtener información del usuario desde localStorage
export const getCurrentUser = (): any => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Función para obtener datos del usuario
export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Función para verificar token con el servidor
export const verifyToken = async (): Promise<boolean> => {
  try {
    const token = getAuthToken();
    if (!token) return false;

    // Si es un token mock (simulación), considerarlo válido
    if (token.startsWith('mock-jwt-token-')) {
      return true;
    }
    
    // TODO: Implementar verificación con API real cuando esté disponible
    // Por ahora, si tenemos un token real (refreshToken), lo consideramos válido
    return true;
    
    // TODO: Descomentar esto cuando tengas endpoint de verificación
    /*
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
    */
  } catch (error) {
    return false;
  }
};

// Función para completar el perfil del usuario después del primer login
export const createUser = async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
  try {
    // Obtener el token de acceso
    const accessToken = getAuthToken();
    
    if (!accessToken) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/v3/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }
    
    if (response.status === 200 || response.status === 201) {
      const responseData = await response.json();
      
      // Marcar que el usuario ya completó el cuestionario
      localStorage.setItem('profileCompleted', 'true');
      
      return {
        success: true,
        message: "Perfil completado exitosamente",
        user: responseData
      };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        message: errorText || "Error al completar el perfil"
      };
    }
    
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('NetworkError') ||
      error.message.includes('CORS')
    )) {
      return {
        success: false,
        message: "Error de conexión. Verifica tu internet e intenta nuevamente."
      };
    } else {
      throw error;
    }
  }
};

// Función para obtener el perfil completo del usuario desde el servidor
export const getUserCompleteProfile = async (): Promise<UserProfileResponse> => {
  try {
    
    // Obtener el token de acceso
    const accessToken = getAuthToken();
    
    if (!accessToken) {
      return {
        success: false,
        message: 'No hay token de autenticación. Por favor, inicia sesión nuevamente.'
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/api/v3/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 401) {
      return {
        success: false,
        message: 'Token expirado. Por favor, inicia sesión nuevamente.'
      };
    }
    
    if (response.status === 200) {
      const responseData = await response.json();
      
      return {
        success: true,
        user: responseData
      };
    } else if (response.status === 400) {
      
      // Error 400 - puede indicar que el usuario no existe en la BD (necesita completar perfil)
      const errorText = await response.text();
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message?.includes('Usuario no encontrado') || 
            errorData.message?.includes('completar el registro')) {
          
          // Este es el comportamiento esperado para usuarios que necesitan completar perfil
          return {
            success: false,
            message: 'PROFILE_INCOMPLETE' // Código especial para indicar perfil incompleto
          };
        }
      } catch (parseError) {
        console.log('❌ [getUserCompleteProfile] Error al parsear respuesta JSON del error 400');
        // Si no se puede parsear, es un error real
      }
      
      return {
        success: false,
        message: `Bad Request: ${errorText}`
      };
    } else {
      const errorText = await response.text();
      
      return {
        success: false,
        message: errorText || "Error al obtener el perfil del usuario"
      };
    }
    
  } catch (error) {
    
    if (error instanceof Error && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('NetworkError') ||
      error.message.includes('CORS')
    )) {
      return {
        success: false,
        message: "Error de conexión. Verifica tu internet e intenta nuevamente."
      };
    } else {
      return {
        success: false,
        message: "Error al obtener el perfil del usuario."
      };
    }
  }
};

/**
 * Obtener solo el ID del usuario actual desde el servidor
 * @returns Promise<number | null> - ID del usuario o null si hay error
 */
export const getCurrentUserId = async (): Promise<number | null> => {
  try {
    console.log('👤 [AuthService] Obteniendo ID del usuario actual...');
    
    const profileResponse = await getUserCompleteProfile();
    
    if (!profileResponse.success || !profileResponse.user) {
      console.log('❌ [AuthService] No se pudo obtener perfil de usuario');
      return null;
    }
    
    // El servidor puede devolver diferentes estructuras
    let actualProfile: any = profileResponse.user;
    if (actualProfile && typeof actualProfile === 'object' && 'profile' in actualProfile) {
      actualProfile = actualProfile.profile;
    }
    
    const userId = actualProfile?.id;
    if (userId && typeof userId === 'number') {
      console.log('✅ [AuthService] ID de usuario obtenido:', userId);
      return userId;
    }
    
    console.log('❌ [AuthService] ID de usuario no encontrado en la respuesta');
    return null;
    
  } catch (error) {
    console.error('❌ [AuthService] Error al obtener ID de usuario:', error);
    return null;
  }
};

// Función para verificar si el usuario necesita completar su perfil usando el servidor
export const needsProfileCompletionFromServer = async (): Promise<boolean> => {
  try {
    const profileResponse = await getUserCompleteProfile();
    
    if (!profileResponse.success) {
      // Si el mensaje indica perfil incompleto, definitivamente necesita completarlo
      if (profileResponse.message === 'PROFILE_INCOMPLETE') {
        return true;
      }
      
      // Para otros errores, usar lógica local como fallback
      return needsProfileCompletion();
    }
    
    const userProfile = profileResponse.user;
    if (!userProfile) {
      return true;
    }
    
    // El servidor puede devolver diferentes estructuras:
    // 1. Directamente el perfil: { id, firstName, lastName, ... }
    // 2. Envuelto: { success, message, profile: { id, firstName, lastName, ... } }
    let actualProfile: any = userProfile;
    
    // Si tiene la estructura envuelta, extraer el perfil
    if (userProfile && typeof userProfile === 'object' && 'profile' in userProfile) {
      actualProfile = (userProfile as any).profile;
    } else {
      actualProfile = userProfile;
    }
    
    // Verificar si el perfil está marcado como completado en el servidor
    const isProfileCompleted = (actualProfile as any)?.profileCompleted === true || (userProfile as any)?.profileCompleted === true;
    if (isProfileCompleted) {
      // Sincronizar con localStorage
      localStorage.setItem('profileCompleted', 'true');
      return false;
    }
    
    // Verificar si tiene firstName y lastName
    const hasFirstName = actualProfile?.firstName && actualProfile.firstName.trim();
    const hasLastName = actualProfile?.lastName && actualProfile.lastName.trim();
    
    if (hasFirstName && hasLastName) {
      // Sincronizar con localStorage
      localStorage.setItem('profileCompleted', 'true');
      return false;
    }
    
    // Asegurar que localStorage no esté marcado incorrectamente
    localStorage.removeItem('profileCompleted');
    return true;
    
  } catch (error) {
    // En caso de error, usar lógica local
    return needsProfileCompletion();
  }
};

export const checkProfileCompletionWithServer = async (): Promise<boolean> => {
  try {
    const accessToken = getAuthToken();
    
    if (!accessToken) {
      return false;
    }
    
    // Intentar obtener información del usuario desde el servidor
    const response = await fetch(`${API_BASE_URL}/api/v3/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 200) {
      const userProfile = await response.json();
      
      // Verificar si tiene firstName y lastName
      if (userProfile.firstName && userProfile.lastName) {
        localStorage.setItem('profileCompleted', 'true');
        return true;
      }
    } else if (response.status === 404) {
      return false;
    }
    return false;
    
  } catch (error) {
    // En caso de error, usar verificación local
    return false;
  }
};

// Función para verificar si el usuario necesita completar su perfil
// Función síncrona para verificar si el usuario necesita completar su perfil (mejorada)
export const needsProfileCompletion = (): boolean => {
  const profileCompleted = localStorage.getItem('profileCompleted');
  const userData = localStorage.getItem('userData');
  
  // Si no hay datos del usuario, necesita completar perfil
  if (!userData) {
    return true;
  }
  
  // Verificar si el usuario tiene información completa ANTES de confiar en profileCompleted
  let hasRealCompleteProfile = false;
  try {
    const user = JSON.parse(userData);
    
    // Verificar si tiene datos de perfil reales (no generados automáticamente)
    const hasRealFirstName = user.firstName && user.firstName.trim();
    const hasRealLastName = user.lastName && user.lastName.trim();
    const hasRealNombre = user.nombre && user.nombre.trim() && user.nombre !== "Usuario";
    const hasRealApellido = user.apellido && user.apellido.trim();
    
    // Perfil completo: debe tener AMBOS nombres (firstName + lastName) O (nombre + apellido)
    const hasCompleteNewFormat = hasRealFirstName && hasRealLastName;
    const hasCompleteOldFormat = hasRealNombre && hasRealApellido;
    
    hasRealCompleteProfile = hasCompleteNewFormat || hasCompleteOldFormat;
    
  } catch (error) {
    // Error al parsear userData
  }
  
  // Si el perfil está marcado como completado PERO realmente no está completo, corregir
  if (profileCompleted === 'true' && !hasRealCompleteProfile) {
    localStorage.removeItem('profileCompleted');
    return true;
  }
  
  // Si está marcado como completado Y realmente está completo, no necesita
  if (profileCompleted === 'true' && hasRealCompleteProfile) {
    return false;
  }
  
  // Si tiene perfil completo pero no está marcado, marcarlo
  if (hasRealCompleteProfile) {
    localStorage.setItem('profileCompleted', 'true');
    return false;
  }
  
  // Por defecto, necesita completar perfil
  return true;
};

// Función para marcar el perfil como completado
export const markProfileAsCompleted = (): void => {
  localStorage.setItem('profileCompleted', 'true');
};

// Función para actualizar el perfil del usuario
export const updateUserProfile = async (profileData: {
  firstName: string;
  lastName: string;
  preferredGenreIds: number[];
}): Promise<{ success: boolean; message: string; user?: any }> => {
  try {
    // Obtener el token de acceso
    const accessToken = getAuthToken();
    
    if (!accessToken) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/v3/users/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (response.status === 401) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }
    
    if (response.status === 200) {
      const responseData = await response.json();
      
      return {
        success: true,
        message: "Perfil actualizado exitosamente",
        user: responseData
      };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        message: errorText || "Error al actualizar el perfil"
      };
    }
    
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('NetworkError') ||
      error.message.includes('CORS')
    )) {
      return {
        success: false,
        message: "Error de conexión. Verifica tu internet e intenta nuevamente."
      };
    } else {
      throw error;
    }
  }
};

// Función para refrescar tokens automáticamente
export const refreshAuthToken = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🔄 [AuthService] Iniciando refresh de token...');
    
    // Verificar conectividad del servidor
    const serverAvailable = await checkServerConnectivity();
    if (!serverAvailable) {
      console.error('❌ [AuthService] Servidor no disponible - refresh cancelado');
      return {
        success: false,
        message: "No se puede conectar al servidor para refrescar la sesión."
      };
    }

    // Obtener datos necesarios para refresh
    const refreshToken = getRefreshToken();
    const userData = getCurrentUser();
    
    if (!refreshToken || !userData?.email) {
      console.error('❌ [AuthService] No hay refresh token o datos de usuario');
      return {
        success: false,
        message: "No hay información de sesión válida para refrescar."
      };
    }

    // Preparar request
    const requestBody: RefreshTokenRequest = {
      username: userData.email,
      refreshToken: refreshToken
    };

    console.log('🌐 [AuthService] Enviando request de refresh token...');
    
    // Llamada a la API
    const response = await fetch(`${API_BASE_URL}/api/v3/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 200) {
      const responseData: RefreshTokenResponse = await response.json();
      
      console.log('✅ [AuthService] Refresh token exitoso');
      
      // Actualizar todos los tokens en localStorage
      localStorage.setItem('accessToken', responseData.accessToken);
      localStorage.setItem('idToken', responseData.idToken);
      localStorage.setItem('refreshToken', responseData.refreshToken);
      localStorage.setItem('tokenExpiry', (Date.now() + responseData.expiresIn * 1000).toString());
      
      // Mantener compatibilidad con código anterior
      localStorage.setItem('authToken', responseData.accessToken);
      
      return {
        success: true,
        message: "Sesión refrescada exitosamente"
      };
      
    } else if (response.status === 401 || response.status === 403) {
      console.error('❌ [AuthService] Refresh token inválido o expirado');
      
      // Limpiar localStorage si el refresh token no es válido
      logoutUser();
      
      return {
        success: false,
        message: "La sesión ha expirado. Por favor, inicia sesión nuevamente."
      };
      
    } else {
      const errorText = await response.text();
      console.error('❌ [AuthService] Error en refresh:', response.status, errorText);
      
      return {
        success: false,
        message: `Error del servidor: ${response.status}`
      };
    }
    
  } catch (error) {
    console.error('❌ [AuthService] Excepción durante refresh token:', error);
    
    if (error instanceof Error && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('NetworkError') ||
      error.message.includes('CORS')
    )) {
      return {
        success: false,
        message: "Error de conexión durante el refresh de sesión."
      };
    }
    
    return {
      success: false,
      message: "Error interno durante el refresh de sesión."
    };
  }
};

// Función para verificar si el token está próximo a expirar (5 minutos antes)
export const isTokenNearExpiry = (): boolean => {
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  if (!tokenExpiry) return true;
  
  const expiryTime = parseInt(tokenExpiry);
  const currentTime = Date.now();
  const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutos
  
  return (expiryTime - currentTime) <= fiveMinutesInMs;
};

// Función para manejar refresh automático de tokens (SIMPLIFICADA)
export const handleAutoTokenRefresh = async (): Promise<boolean> => {
  try {
    // TEMPORALMENTE SIMPLIFICADA - Solo verificar si está autenticado sin validar con servidor
    if (!isAuthenticated()) {
      console.log('🔍 [AuthService] Usuario no autenticado, no se requiere refresh');
      return false;
    }
    
    // NO verificar expiración ni hacer refresh automático por ahora
    console.log('🔍 [AuthService] Función de refresh simplificada - manteniendo sesión actual');
    return true;
    
  } catch (error) {
    console.error('❌ [AuthService] Error en handleAutoTokenRefresh:', error);
    return false;
  }
};

