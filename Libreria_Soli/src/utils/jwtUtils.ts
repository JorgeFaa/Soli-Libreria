// jwtUtils.ts - Utilidades para manejo de JSON Web Tokens

export interface DecodedJWT {
  userId: string;
  username: string;
  roles: string[];
  isReader: boolean;
  isAdmin: boolean;
  expiresAt: Date;
  isExpired: boolean;
  email?: string;
  clientId: string;
  scope: string;
}

/**
 * Decodifica un JWT y extrae información útil del usuario
 * @param token - JWT token string
 * @returns Información decodificada del token o null si es inválido
 */
export const decodeJWT = (token: string): DecodedJWT | null => {
  try {
    // Validar formato básico del JWT
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('JWT inválido: formato incorrecto');
      return null;
    }

    // Decodificar el payload (segunda parte)
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));

    // Extraer roles de Cognito
    const cognitoGroups = decoded['cognito:groups'] || [];
    
    return {
      userId: decoded.sub,
      username: decoded.username,
      roles: cognitoGroups,
      isReader: cognitoGroups.includes('READER'),
      isAdmin: cognitoGroups.includes('ADMIN'),
      expiresAt: new Date(decoded.exp * 1000),
      isExpired: Date.now() > (decoded.exp * 1000),
      email: decoded.email,
      clientId: decoded.client_id,
      scope: decoded.scope
    };
  } catch (error) {
    console.error('Error decodificando JWT:', error);
    return null;
  }
};

/**
 * Verifica si un token JWT ha expirado
 * @param token - JWT token string
 * @returns true si ha expirado, false en caso contrario
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  return decoded ? decoded.isExpired : true;
};

/**
 * Obtiene los roles del usuario desde un JWT
 * @param token - JWT token string
 * @returns Array de roles o array vacío
 */
export const getUserRoles = (token: string): string[] => {
  const decoded = decodeJWT(token);
  return decoded ? decoded.roles : [];
};

/**
 * Verifica si el usuario tiene un rol específico
 * @param token - JWT token string
 * @param role - Rol a verificar
 * @returns true si tiene el rol, false en caso contrario
 */
export const hasRole = (token: string, role: string): boolean => {
  const roles = getUserRoles(token);
  return roles.includes(role);
};

/**
 * Verifica si el usuario es administrador
 * @param token - JWT token string
 * @returns true si es admin, false en caso contrario
 */
export const isAdmin = (token: string): boolean => {
  return hasRole(token, 'ADMIN');
};

/**
 * Verifica si el usuario es lector
 * @param token - JWT token string
 * @returns true si es reader, false en caso contrario
 */
export const isReader = (token: string): boolean => {
  return hasRole(token, 'READER');
};