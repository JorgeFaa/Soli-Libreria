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

// Configuración de la API - Para Vite usamos import.meta.env en lugar de process.env
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://tu-api-gateway.execute-api.us-east-1.amazonaws.com/prod';

// Función auxiliar para manejar respuestas HTTP (para cuando uses la API real)
// const handleResponse = async (response: Response): Promise<AuthResponse> => {
//   const data = await response.json();
  
//   if (!response.ok) {
//     throw new Error(data.message || 'Error en la solicitud');
//   }
  
//   return data;
// };

// Función para login
export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    // TEMPORAL: Simulación hasta que tengas API real
    console.log("Simulando login con:", credentials);
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular respuesta exitosa (cualquier email/password será válido por ahora)
    const mockResponse: AuthResponse = {
      success: true,
      message: "Login exitoso",
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
    
    // TODO: Descomentar esto cuando tengas la API real
    /*
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const result = await handleResponse(response);
    
    if (result.success && result.token) {
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('userData', JSON.stringify(result.user));
    }
    
    return result;
    */
    
  } catch (error) {
    console.error('Error en login:', error);
    throw new Error(error instanceof Error ? error.message : 'Error de conexión');
  }
};

// Función para registro
export const registerUser = async (userData: RegisterRequest): Promise<AuthResponse> => {
  try {
    // TEMPORAL: Simulación hasta que tengas API real
    console.log("Simulando registro con:", userData);
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simular respuesta exitosa
    const mockResponse: AuthResponse = {
      success: true,
      message: "Registro exitoso",
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
    
    // TODO: Descomentar esto cuando tengas la API real
    /*
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const result = await handleResponse(response);
    
    if (result.success && result.token) {
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('userData', JSON.stringify(result.user));
    }
    
    return result;
    */
    
  } catch (error) {
    console.error('Error en registro:', error);
    throw new Error(error instanceof Error ? error.message : 'Error de conexión');
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

    // TEMPORAL: Simulación hasta que tengas API real
    console.log("Simulando verificación de token:", token);
    
    // Simular que el token es válido si existe
    return true;
    
    // TODO: Descomentar esto cuando tengas la API real
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
    console.error('Error verificando token:', error);
    return false;
  }
};
