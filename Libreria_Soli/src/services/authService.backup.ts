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
}

export interface VerifyAccountRequest {
  username: string;
  code: string;
}

// Configuración de la API - Siempre usar /api para que Netlify maneje el proxy
const API_BASE_URL = '/api';

// Función auxiliar para manejar respuestas HTTP de la API Lambda
const handleResponse = async (response: Response): Promise<AuthResponse> => {
  try {
    const data = await response.json();
    
    // La API Lambda devuelve la estructura: { headers, body, statusCode }
    // El body es un string JSON que necesitamos parsear
    const parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    
    // Verificar si hay error en la respuesta de Lambda
    if (data.statusCode !== 200 || parsedBody.error) {
      return {
        success: false,
        message: parsedBody.error || parsedBody.message || "Error en autenticación"
      };
    }
    
    // Verificar si el login fue exitoso (tiene refreshToken)
    if (data.statusCode === 200 && parsedBody.refreshToken) {
      return {
        success: true,
        message: "Login exitoso",
        token: parsedBody.refreshToken,
        user: {
          id: parsedBody.userId || "temp-id",
          nombre: parsedBody.firstName || "Usuario",
          apellido: parsedBody.lastName || "",
          email: parsedBody.email || ""
        }
      };
    } else {
      return {
        success: false,
        message: "Credenciales incorrectas"
      };
    }
    
  } catch (error) {
    throw new Error('Error procesando respuesta del servidor');
  }
};

// Función auxiliar para manejar respuestas HTTP del endpoint de verificación
const handleVerifyResponse = async (response: Response): Promise<AuthResponse> => {
  try {
    console.log("🔍 [handleVerifyResponse] Status de respuesta:", response.status);
    console.log("🔍 [handleVerifyResponse] Headers de respuesta:", Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log("📋 [handleVerifyResponse] Datos crudos recibidos:", data);
    
    // La API Lambda devuelve la estructura: { headers, body, statusCode }
    // El body es un string JSON que necesitamos parsear
    const parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    console.log("📋 [handleVerifyResponse] Body parseado:", parsedBody);
    console.log("📋 [handleVerifyResponse] StatusCode de Lambda:", data.statusCode);
    
    // Verificar si hay error en la respuesta de Lambda
    if (data.statusCode !== 200 || parsedBody.error) {
      console.log("❌ [handleVerifyResponse] Error detectado:", parsedBody.error || parsedBody.message);
      return {
        success: false,
        message: parsedBody.error || parsedBody.message || "Error en la verificación"
      };
    }
    
    // Verificar si la verificación fue exitosa
    if (data.statusCode === 200 && parsedBody.message) {
      // Verificar si el mensaje indica éxito o error
      if (parsedBody.message.includes("inválido") || parsedBody.message.includes("expirado")) {
        console.log("❌ [handleVerifyResponse] Código inválido:", parsedBody.message);
        return {
          success: false,
          message: parsedBody.message
        };
      } else {
        console.log("✅ [handleVerifyResponse] Verificación exitosa");
        return {
          success: true,
          message: "Cuenta verificada exitosamente"
        };
      }
    } else {
      console.log("❌ [handleVerifyResponse] Respuesta inesperada:", { statusCode: data.statusCode, message: parsedBody.message });
      return {
        success: false,
        message: "Error en la verificación"
      };
    }
    
  } catch (error) {
    console.error("🔥 [handleVerifyResponse] Error parseando respuesta:", error);
    throw new Error('Error procesando respuesta del servidor');
  }
};

// Función auxiliar para manejar respuestas HTTP del endpoint de verificación
const handleVerifyResponse = async (response: Response): Promise<AuthResponse> => {
  try {
    console.log("🔍 [handleVerifyResponse] Status de respuesta:", response.status);
    console.log("🔍 [handleVerifyResponse] Headers de respuesta:", Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log("📋 [handleVerifyResponse] Datos crudos recibidos:", data);
    
    // La API Lambda devuelve la estructura: { headers, body, statusCode }
    // El body es un string JSON que necesitamos parsear
    const parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    console.log("📋 [handleVerifyResponse] Body parseado:", parsedBody);
    console.log("📋 [handleVerifyResponse] StatusCode de Lambda:", data.statusCode);
    
    // Verificar si hay error en la respuesta de Lambda
    if (data.statusCode !== 200 || parsedBody.error) {
      console.log("❌ [handleVerifyResponse] Error detectado:", parsedBody.error || parsedBody.message);
      return {
        success: false,
        message: parsedBody.error || parsedBody.message || "Error en la verificación"
      };
    }
    
    // Verificar si la verificación fue exitosa
    if (data.statusCode === 200 && parsedBody.message) {
      // Verificar si el mensaje indica éxito o error
      if (parsedBody.message.includes("inválido") || parsedBody.message.includes("expirado")) {
        console.log("❌ [handleVerifyResponse] Código inválido:", parsedBody.message);
        return {
          success: false,
          message: parsedBody.message
        };
      } else {
        console.log("✅ [handleVerifyResponse] Verificación exitosa");
        return {
          success: true,
          message: "Cuenta verificada exitosamente"
        };
      }
    } else {
      console.log("❌ [handleVerifyResponse] Respuesta inesperada:", { statusCode: data.statusCode, message: parsedBody.message });
      return {
        success: false,
        message: "Error en la verificación"
      };
    }
    
  } catch (error) {
    console.error("🔥 [handleVerifyResponse] Error parseando respuesta:", error);
    throw new Error('Error procesando respuesta del servidor');
  }
};

// Función auxiliar para manejar respuestas HTTP del endpoint de registro
const handleRegisterResponse = async (response: Response, userData: RegisterRequest): Promise<AuthResponse> => {
    console.log("🔍 [handleRegisterResponse] Status de respuesta:", response.status);
    console.log("🔍 [handleRegisterResponse] Headers de respuesta:", Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log("📋 [handleRegisterResponse] Datos crudos recibidos:", data);
    
    // La API Lambda devuelve la estructura: { headers, body, statusCode }
    // El body es un string JSON que necesitamos parsear
    const parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    console.log("📋 [handleRegisterResponse] Body parseado:", parsedBody);
    console.log("📋 [handleRegisterResponse] StatusCode de Lambda:", data.statusCode);
    
    // Verificar si hay error en la respuesta de Lambda
    if (data.statusCode !== 200 || parsedBody.error) {
      console.log("❌ [handleRegisterResponse] Error detectado:", parsedBody.error || parsedBody.message);
      return {
        success: false,
        message: parsedBody.error || parsedBody.message || "Error en el registro"
      };
    }
    
    // Verificar si el registro fue exitoso
    if (data.statusCode === 200 && parsedBody.message === "Registrado en Cognito") {
      console.log("✅ [handleRegisterResponse] Registro exitoso detectado");
      // Para el registro, no tenemos token automáticamente, 
      // pero podemos generar uno temporal o hacer login automático
      return {
        success: true,
        message: "Registro exitoso. Ahora puedes iniciar sesión.",
        // No guardamos token aquí, el usuario necesitará hacer login
        user: {
          id: "registered-user-" + Date.now(),
          nombre: userData.nombre,
          apellido: userData.apellido,
          email: userData.email
        }
      };
    } else {
      console.log("❌ [handleRegisterResponse] Respuesta inesperada:", { statusCode: data.statusCode, message: parsedBody.message });
      return {
        success: false,
        message: "Error en el registro"
      };
    }
    
  } catch (error) {
    console.error("🔥 [handleRegisterResponse] Error parseando respuesta:", error);
    throw new Error('Error procesando respuesta del servidor');
  }
};

// Función para login
export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    // Llamada a la API real
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: credentials.email,  // La API espera 'username' en lugar de 'email'
        password: credentials.password
      }),
    });

    const result = await handleResponse(response);
    
    // Guardar token solo si el login fue exitoso
    if (result.success && result.token) {
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('userData', JSON.stringify(result.user));
    }
    
    return result;
    
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
    console.log("🚀 [authService] Iniciando registro para:", userData.email);
    
    // Llamada a la API real
    const requestBody = {
      username: userData.email,  // La API espera 'username' en lugar de 'email'
      password: userData.password
    };
    
    console.log("📦 [authService] Enviando datos:", {
      username: requestBody.username,
      password: "***oculta***"
    });
    console.log("🌐 [authService] URL del endpoint:", `${API_BASE_URL}/user/register`);
    
    const response = await fetch(`${API_BASE_URL}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📡 [authService] Respuesta HTTP status:", response.status);
    console.log("📡 [authService] Respuesta HTTP headers:", Object.fromEntries(response.headers.entries()));

    const result = await handleRegisterResponse(response, userData);
    
    console.log("✨ [authService] Resultado procesado:", result);
    
    return result;
    
  } catch (error) {
    console.error("🔥 [authService] Error en registerUser:", error);
    
    // Solo hacer fallback si es un error de red real, no un error de validación
    if (error instanceof Error && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('NetworkError') ||
      error.message.includes('CORS')
    )) {
      console.log("🔄 [authService] Error de red detectado, usando simulación como fallback");
      
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

// Función para logout
export const logoutUser = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
};

// Función para verificar si hay una sesión activa
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

// Función para obtener el token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
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

// Función para verificar cuenta con código
export const verifyAccount = async (email: string, code: string): Promise<AuthResponse> => {
  try {
    console.log("🚀 [authService] Iniciando verificación para:", email);
    console.log("📦 [authService] Código ingresado:", code);
    
    // Llamada a la API real
    const requestBody = {
      username: email,
      code: code
    };
    
    console.log("📦 [authService] Enviando datos:", requestBody);
    console.log("🌐 [authService] URL del endpoint:", `${API_BASE_URL}/user/verify-account`);
    
    const response = await fetch(`${API_BASE_URL}/user/verify-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📡 [authService] Respuesta HTTP status:", response.status);
    console.log("📡 [authService] Respuesta HTTP headers:", Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log("📋 [authService] Datos crudos recibidos:", data);
    
    // La API Lambda devuelve la estructura: { headers, body, statusCode }
    // El body es un string JSON que necesitamos parsear
    const parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    console.log("📋 [authService] Body parseado:", parsedBody);
    console.log("📋 [authService] StatusCode de Lambda:", data.statusCode);
    
    // Verificar si hay error en la respuesta de Lambda
    if (data.statusCode !== 200 || parsedBody.error) {
      console.log("❌ [authService] Error detectado:", parsedBody.error || parsedBody.message);
      return {
        success: false,
        message: parsedBody.error || parsedBody.message || "Error en la verificación"
      };
    }
    
    // Verificar si la verificación fue exitosa
    if (data.statusCode === 200 && parsedBody.message) {
      // Verificar si el mensaje indica éxito o error
      if (parsedBody.message.includes("inválido") || parsedBody.message.includes("expirado")) {
        console.log("❌ [authService] Código inválido:", parsedBody.message);
        return {
          success: false,
          message: parsedBody.message
        };
      } else {
        console.log("✅ [authService] Verificación exitosa");
        return {
          success: true,
          message: "Cuenta verificada exitosamente"
        };
      }
    } else {
      console.log("❌ [authService] Respuesta inesperada:", { statusCode: data.statusCode, message: parsedBody.message });
      return {
        success: false,
        message: "Error en la verificación"
      };
    }
    
  } catch (error) {
    console.error("🔥 [authService] Error en verifyAccount:", error);
    
    // Solo hacer fallback si es un error de red real
    if (error instanceof Error && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('NetworkError') ||
      error.message.includes('CORS')
    )) {
      console.log("🔄 [authService] Error de red detectado, usando simulación como fallback");
      
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
