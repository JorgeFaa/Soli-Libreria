import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

// Importación de iconos SVG
import SunIcon from "../icons/sun.svg";

// Importar el servicio de autenticación
import { loginUser } from "../../services/authService";
import type { LoginRequest } from "../../services/authService";

// Importar componente Toast
import Toast from "./Toast";

// Tipo para las props del Login
type LoginProps = {
  onLoginSuccess: () => void;
};

export default function Login({ onLoginSuccess }: LoginProps) {
  // Estados para manejar los inputs del formulario
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Estados para notificaciones Toast
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [showToast, setShowToast] = useState<boolean>(false);

  // Hook de navegación
  const navigate = useNavigate();

  // Función para mostrar notificación
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Función para cerrar notificación
  const closeNotification = () => {
    setShowToast(false);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    closeNotification(); // Cerrar notificación anterior si existe

    // Validaciones básicas
    if (!email || !password) {
      showNotification("Por favor, completa todos los campos", "warning");
      setIsLoading(false);
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification("Por favor, ingresa un email válido", "warning");
      setIsLoading(false);
      return;
    }

    try {
      // Llamada a la API real de AWS Lambda
      const credentials: LoginRequest = { email, password };
      const response = await loginUser(credentials);
      
      if (response.success) {
        
        // Mostrar notificación de éxito
        showNotification("¡Bienvenido de vuelta! Login exitoso", "success");
        
        // Actualizar el estado global de autenticación
        onLoginSuccess();
        
        // Navegar de vuelta al inicio después de un pequeño delay
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        showNotification(response.message || "Credenciales incorrectas", "error");
      }
      
    } catch (err) {
      
      // Mensaje más específico según el tipo de error
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          showNotification("Error de conexión. Verifica tu internet e intenta nuevamente.", "error");
        } else if (err.message.includes('401') || err.message.includes('403')) {
          showNotification("Credenciales incorrectas. Verifica tu email y contraseña.", "error");
        } else {
          showNotification(err.message, "error");
        }
      } else {
        showNotification("Error inesperado. Intenta nuevamente.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="login-section">
      <div className="login-container">
        <div className="login-grid">
          
          {/* COLUMNA 1: Formulario de login */}
          <div className="login-content">
            
            {/* Header del formulario */}
            <div className="login-header">
              <div className="login-logo">
                <img src={SunIcon} alt="Soli Logo" className="login-logo-icon" />
                <span className="login-logo-text">Login</span>
              </div>
              <h1 className="login-title">Iniciar Sesión</h1>
              <p className="login-description">
                Accede a tu cuenta para descubrir tu próxima lectura favorita
              </p>
            </div>

            {/* Formulario de login */}
            <form className="login-form" onSubmit={handleSubmit}>
              
              {/* Campo de email */}
              <div className="login-field">
                <label htmlFor="email" className="login-label">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  className="login-input"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              {/* Campo de contraseña */}
              <div className="login-field">
                <label htmlFor="password" className="login-label">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  className="login-input"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              {/* Mensaje de error */}
              {/* Removido: Ahora usamos notificaciones flotantes */}

              {/* Botón de envío */}
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>

              {/* Enlaces adicionales */}
              <div className="login-links">
                <Link to="/forgot-password" className="login-link">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

            </form>

            {/* Footer del formulario */}
            <div className="login-footer">
              <p>
                ¿No tienes una cuenta?{" "}
                <Link to="/registro" className="login-link-primary">
                  Crear cuenta
                </Link>
              </p>
            </div>

            {/* Enlace para volver al inicio */}
            <div className="login-back">
              <Link to="/" className="login-back-link">
                ← Volver al inicio
              </Link>
            </div>
          </div>

          {/* COLUMNA 2: Elementos visuales */}
          <div className="login-visual">
            <div className="login-visual-content">
              <h3 className="login-visual-title">
                Bienvenido de vuelta a 
                <span className="login-visual-accent">Soli</span>
              </h3>
              <p className="login-visual-description">
                Tu mundo de historias infinitas te está esperando. Continúa explorando universos, conociendo personajes inolvidables y viviendo aventuras extraordinarias.
              </p>
              
              {/* Información motivacional */}
              <div className="login-features">
                <div className="login-feature">
                  <div className="login-feature-icon">📚</div>
                  <div className="login-feature-content">
                    <h4 className="login-feature-title">Tu biblioteca personal</h4>
                    <p className="login-feature-description">Accede a todos tus libros favoritos y continúa donde lo dejaste</p>
                  </div>
                </div>
                
                <div className="login-feature">
                  <div className="login-feature-icon">✨</div>
                  <div className="login-feature-content">
                    <h4 className="login-feature-title">Recomendaciones únicas</h4>
                    <p className="login-feature-description">Descubre tu próxima lectura favorita con sugerencias personalizadas</p>
                  </div>
                </div>
              
              </div>
              
              {/* Frase inspiradora */}
              <div className="login-quote">
                <p className="login-quote-text">
                  "Un libro es un sueño que tienes en tus manos"
                </p>
                <p className="login-quote-author">— Neil Gaiman</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Notificación flotante */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={closeNotification}
        duration={5000}
      />
    </section>
  );
}