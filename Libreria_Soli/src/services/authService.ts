// authService.ts - Servicio de autenticación para comunicarse con la API de AWS

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
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileCompleted?: boolean;
  preferredGenres?: any[];
  preferredGenreIds?: number[];
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
const API_BASE_URL = 'https://soliapi-223325065421.northamerica-south1.run.app';

// Función auxiliar para decodificar JWT (solo para extraer información básica, no para validación)
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
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
    // Llamada a la API con el nuevo formato
    const requestBody = {
      username: credentials.email,
      password: credentials.password
    };
    
    const response = await fetch(`${API_BASE_URL}/api/v2/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 200) {
      const responseData = await response.json();
      
      // Intentar diferentes formatos posibles
      let tokens: any = responseData;
      
      // Verificar si los tokens están en un objeto anidado
      if (responseData.tokens) {
        tokens = responseData.tokens;
      } else if (responseData.data) {
        tokens = responseData.data;
      } else if (responseData.result) {
        tokens = responseData.result;
      }
      
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
      
      return {
        success: true,
        message: "¡Login exitoso! Bienvenido de vuelta",
        token: tokens.accessToken,
        tokens: tokens,
        user: user
      };
      
    } else {
      const errorText = await response.text();
      
      return {
        success: false,
        message: errorText || "Credenciales incorrectas"
      };
    }
    
  } catch (error) {
    // Solo hacer fallback si es un error de red real, no un error de credenciales
    if (error instanceof Error && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('NetworkError') ||
      error.message.includes('CORS')
    )) {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular respuesta exitosa como fallback
      const mockResponse: AuthResponse = {
        success: true,
        message: "Login exitoso (modo simulación por error de red)",
        token: "mock-jwt-token-" + Date.now(),
        user: {
          id: "mock-user-id",
          nombre: "Usuario",
          apellido: "Demo",
          email: credentials.email
        }
      };
      
      // Guardar token simulado
      if (mockResponse.success && mockResponse.token) {
        localStorage.setItem('authToken', mockResponse.token);
        localStorage.setItem('userData', JSON.stringify(mockResponse.user));
      }
      
      return mockResponse;
    } else {
      // Re-lanzar otros errores (como credenciales incorrectas)
      throw error;
    }
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
    
    const response = await fetch(`${API_BASE_URL}/api/v2/user/register`, {
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
    
    const response = await fetch(`${API_BASE_URL}/api/v2/user/verify-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    // Verificar si la verificación fue exitosa con el nuevo formato
    if (response.status === 200 && data.status === "SUCCESS") {
      return {
        success: true,
        message: "¡Cuenta verificada exitosamente!"
      };
    } else {
      return {
        success: false,
        message: data.message || "Código inválido o expirado"
      };
    }
    
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

    const response = await fetch(`${API_BASE_URL}/api/v2/user/resend-verification`, {
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
      
      const response = await fetch(`${API_BASE_URL}/api/v2/user/auth/logout`, {
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
    
    const response = await fetch(`${API_BASE_URL}/api/v2/user/createUser`, {
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
    
    const response = await fetch(`${API_BASE_URL}/api/v2/user/profile/complete`, {
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

// Función para verificar si el usuario necesita completar su perfil usando el servidor
export const needsProfileCompletionFromServer = async (): Promise<boolean> => {
  try {
    const profileResponse = await getUserCompleteProfile();
    
    if (!profileResponse.success) {
      // Si no se puede verificar con el servidor, usar lógica local como fallback
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
    const response = await fetch(`${API_BASE_URL}/api/v2/user/profile`, {
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

