// useAuthRefresh.ts - Hook personalizado para manejar el refresh automático de tokens

import { useEffect, useRef } from 'react';
import { handleAutoTokenRefresh } from '../services/authService';

export const useAuthRefresh = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stopAutoRefresh = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log('🛑 [useAuthRefresh] Deteniendo monitoreo automático de tokens...');
      }
    };

    // TEMPORALMENTE DESHABILITADO - El refresh automático está causando logout forzado
    // debido a validaciones 404 del servidor
    console.log('⚠️ [useAuthRefresh] Sistema de refresh automático DESHABILITADO temporalmente');

    // Limpiar intervalo al desmontar el componente
    return stopAutoRefresh;
  }, []);

  // Función para forzar una verificación manual
  const forceTokenCheck = async (): Promise<boolean> => {
    try {
      console.log('🔍 [useAuthRefresh] Verificación manual solicitada...');
      const result = await handleAutoTokenRefresh();
      return result;
    } catch (error) {
      console.error('❌ [useAuthRefresh] Error en verificación manual:', error);
      return false;
    }
  };

  return {
    forceTokenCheck
  };
};

export default useAuthRefresh;