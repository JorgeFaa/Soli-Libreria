import { useState, useEffect } from "react";
import { createUser } from "../../services/authService";
import { getGenres } from "../../services/booksService";
import type { CreateUserRequest } from "../../services/authService";
import type { Genre } from "../../services/booksService";
import Toast from "./Toast";
import "./CuestionarioPerfil.css";

interface CuestionarioPerfilProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export default function CuestionarioPerfil({ onComplete, onSkip }: CuestionarioPerfilProps) {
  // Estados del formulario
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  
  // Estados de la UI
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingGenres, setIsLoadingGenres] = useState<boolean>(true);
  
  // Estados para Toast
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");
  const [showToast, setShowToast] = useState<boolean>(false);
  
  // Función para mostrar notificaciones
  const showNotification = (message: string, type: "success" | "error" | "warning") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };
  
    // Cargar géneros al montar el componente
  useEffect(() => {
    const loadGenres = async () => {
      try {
        console.log('🎨 [Cuestionario] Iniciando carga de géneros...');
        setIsLoadingGenres(true);
        const genresData = await getGenres();
        console.log(`✅ [Cuestionario] Géneros cargados exitosamente: ${genresData.length} géneros`);
        setGenres(genresData);
      } catch (error) {
        console.error('❌ [Cuestionario] Error al cargar géneros:', error);
        showNotification('Error al cargar los géneros. Intenta nuevamente.', 'error');
      } finally {
        setIsLoadingGenres(false);
        console.log('🏁 [Cuestionario] Carga de géneros finalizada');
      }
    };

    loadGenres();
  }, []);
  
  // Manejar selección de géneros
  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      } else {
        // Limitar a máximo 5 géneros
        if (prev.length >= 5) {
          showNotification("Máximo 5 géneros permitidos", "warning");
          return prev;
        }
        return [...prev, genreId];
      }
    });
  };
  
  // Validar formulario
  const isFormValid = () => {
    return firstName.trim().length >= 2 && 
           lastName.trim().length >= 2 && 
           selectedGenres.length >= 1;
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 [Cuestionario] Iniciando envío del formulario...');
    console.log('📋 [Cuestionario] Datos del formulario:', {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      selectedGenres: selectedGenres,
      selectedGenresCount: selectedGenres.length
    });
    
    if (!isFormValid()) {
      console.warn('⚠️ [Cuestionario] Formulario inválido - campos faltantes');
      showNotification("Por favor completa todos los campos requeridos", "warning");
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('🔄 [Cuestionario] Enviando datos a la API...');
      
      const userData: CreateUserRequest = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        preferredGenreIds: selectedGenres
      };
      
      const result = await createUser(userData);
      console.log('📡 [Cuestionario] Respuesta de createUser:', result);
      
      if (result.success) {
        console.log('✅ [Cuestionario] Perfil completado exitosamente');
        showNotification("¡Perfil completado exitosamente!", "success");
        setTimeout(() => {
          console.log('🚪 [Cuestionario] Cerrando cuestionario...');
          onComplete();
        }, 1500);
      } else {
        console.error('❌ [Cuestionario] Error en la respuesta:', result.message);
        showNotification(result.message || "Error al completar el perfil", "error");
      }
      
    } catch (error) {
      console.error("💥 [Cuestionario] Error al crear usuario:", error);
      showNotification("Error al completar el perfil. Intenta nuevamente.", "error");
    } finally {
      setIsLoading(false);
      console.log('🏁 [Cuestionario] Proceso de envío finalizado');
    }
  };
  
  // Manejar omitir cuestionario
  const handleSkip = () => {
    console.log('⏭️ [Cuestionario] Usuario ha decidido saltar el cuestionario');
    if (onSkip) {
      console.log('🚪 [Cuestionario] Ejecutando función onSkip...');
      onSkip();
    } else {
      console.log('🚪 [Cuestionario] Ejecutando función onComplete (fallback)...');
      onComplete();
    }
  };

  return (
    <div className="cuestionario-overlay">
      <div className="cuestionario-container">
        
        {/* Header */}
        <div className="cuestionario-header">
          <h2>📚 ¡Completa tu Perfil!</h2>
          <p>Ayúdanos a personalizar tu experiencia de lectura</p>
        </div>
        
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="cuestionario-form">
          
          {/* Información Personal */}
          <div className="form-section">
            <h3>👤 Información Personal</h3>
            
            <div className="form-group">
              <label htmlFor="firstName">
                Nombre *
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Tu nombre"
                className="form-input"
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">
                Apellido *
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Tu apellido"
                className="form-input"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          
          {/* Géneros Preferidos */}
          <div className="form-section">
            <h3>📖 Géneros Preferidos</h3>
            <p className="section-description">
              Selecciona de 1 a 5 géneros que más te gusten (mínimo 1)
            </p>
            
            {isLoadingGenres ? (
              <div className="genres-loading">
                <div className="loading-spinner"></div>
                <p>Cargando géneros...</p>
              </div>
            ) : (
              <div className="genres-grid">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => handleGenreToggle(genre.id)}
                    className={`genre-button ${selectedGenres.includes(genre.id) ? 'selected' : ''}`}
                    disabled={isLoading}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            )}
            
            <div className="genres-counter">
              {selectedGenres.length}/5 géneros seleccionados
            </div>
          </div>
          
          {/* Botones de Acción */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleSkip}
              className="btn-skip"
              disabled={isLoading}
            >
              Omitir por ahora
            </button>
            
            <button
              type="submit"
              className="btn-submit"
              disabled={isLoading || !isFormValid() || isLoadingGenres}
            >
              {isLoading ? (
                <>
                  <div className="button-spinner"></div>
                  Guardando...
                </>
              ) : (
                "Completar Perfil"
              )}
            </button>
          </div>
          
        </form>
        
      </div>

      {/* Toast de notificaciones */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}