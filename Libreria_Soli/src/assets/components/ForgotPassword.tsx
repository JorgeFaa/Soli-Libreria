import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

// Importación de iconos SVG
import SunIcon from "../icons/sun.svg";

// Importar el servicio de autenticación
import { forgotPassword } from "../../services/authService";

// Importar componente Toast
import Toast from "./Toast";

export default function ForgotPassword() {
  // Estados para manejar el formulario
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEmailSent, setIsEmailSent] = useState<boolean>(false);
  
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
    if (!email) {
      showNotification("Por favor, ingresa tu correo electrónico", "warning");
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
      // Llamada a la API para solicitar recuperación
      const response = await forgotPassword(email);
      
      if (response.success) {
        setIsEmailSent(true);
        showNotification(response.message, "success");
        
        // Después de 3 segundos, redirigir a confirmar contraseña
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 3000);
      } else {
        showNotification(response.message, "error");
      }
      
    } catch (err) {
      // Mensaje más específico según el tipo de error
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          showNotification("Error de conexión. Verifica tu internet e intenta nuevamente.", "error");
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
    <section className="forgot-password-section">
      <div className="forgot-password-container">
        <div className="forgot-password-grid">
          
          {/* COLUMNA 1: Formulario */}
          <div className="forgot-password-content">
            
            {/* Header del formulario */}
            <div className="forgot-password-header">
              <div className="forgot-password-logo">
                <img src={SunIcon} alt="Soli Logo" className="forgot-password-logo-icon" />
                <span className="forgot-password-logo-text">Recuperar</span>
              </div>
              <h1 className="forgot-password-title">
                {isEmailSent ? "¡Código enviado!" : "Recuperar Contraseña"}
              </h1>
              <p className="forgot-password-description">
                {isEmailSent 
                  ? "Hemos enviado un código de verificación a tu correo. Serás redirigido automáticamente para completar el proceso."
                  : "Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña"
                }
              </p>
            </div>

            {!isEmailSent ? (
              <>
                {/* Información adicional */}
                <div className="forgot-password-info">
                  <p className="forgot-password-info-text">
                    💡 Recibirás un código de 6 dígitos que deberás ingresar junto con tu nueva contraseña en el siguiente paso.
                  </p>
                </div>

                {/* Formulario */}
                <form className="forgot-password-form" onSubmit={handleSubmit}>
                  
                  {/* Campo de email */}
                  <div className="forgot-password-field">
                    <label htmlFor="email" className="forgot-password-label">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="forgot-password-input"
                      placeholder="tu@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>

                  {/* Botón de envío */}
                  <button
                    type="submit"
                    className="forgot-password-button"
                    disabled={isLoading}
                  >
                    {isLoading ? "Enviando código..." : "Enviar código de verificación"}
                  </button>

                </form>

                {/* Footer del formulario */}
                <div className="forgot-password-footer">
                  <p>
                    ¿Recordaste tu contraseña?{" "}
                    <Link to="/login" className="forgot-password-link-primary">
                      Volver a iniciar sesión
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Información de éxito */}
                <div className="forgot-password-info">
                  <p className="forgot-password-info-text">
                    ✅ Si el correo existe en nuestro sistema, recibirás el código en unos minutos. Revisa también tu carpeta de spam.
                  </p>
                </div>

                {/* Opciones después de enviar */}
                <div className="forgot-password-footer">
                  <p>
                    <Link 
                      to={`/reset-password?email=${encodeURIComponent(email)}`}
                      className="forgot-password-link-primary"
                    >
                      Continuar con el código →
                    </Link>
                  </p>
                  <p style={{ marginTop: '0.5rem' }}>
                    <Link to="/login" className="forgot-password-link-primary">
                      Volver al login
                    </Link>
                  </p>
                </div>
              </>
            )}

            {/* Enlace para volver al inicio */}
            <div className="forgot-password-back">
              <Link to="/" className="forgot-password-back-link">
                ← Volver al inicio
              </Link>
            </div>
          </div>

          {/* COLUMNA 2: Contenido visual */}
          <div className="forgot-password-visual">
            <div className="forgot-password-visual-content">
              <h3 className="forgot-password-visual-title">
                🔐 Recupera tu acceso a 
                <span className="forgot-password-visual-accent"> Soli</span>
              </h3>
              <p className="forgot-password-visual-description">
                No te preocupes, es normal olvidar contraseñas. En unos simples pasos tendrás acceso nuevamente a tu biblioteca personal y todas tus lecturas favoritas.
              </p>
              
              {/* Pasos del proceso */}
              <div className="forgot-password-steps">
                <div className="forgot-password-step">
                  <div className="forgot-password-step-icon">📮</div>
                  <div className="forgot-password-step-content">
                    <h4 className="forgot-password-step-title">1. Solicita el código</h4>
                    <p className="forgot-password-step-description">Te enviaremos un código de verificación a tu correo</p>
                  </div>
                </div>
                
                <div className="forgot-password-step">
                  <div className="forgot-password-step-icon">🔢</div>
                  <div className="forgot-password-step-content">
                    <h4 className="forgot-password-step-title">2. Ingresa el código</h4>
                    <p className="forgot-password-step-description">Usa el código de 6 dígitos que recibiste</p>
                  </div>
                </div>
              
                <div className="forgot-password-step">
                  <div className="forgot-password-step-icon">🎆</div>
                  <div className="forgot-password-step-content">
                    <h4 className="forgot-password-step-title">3. Nueva contraseña</h4>
                    <p className="forgot-password-step-description">Crea una contraseña segura y ¡listo!</p>
                  </div>
                </div>
              </div>
              
              {/* Frase inspiradora */}
              <div className="forgot-password-quote">
                <p className="forgot-password-quote-text">
                  "Cada final es un nuevo comienzo"
                </p>
                <p className="forgot-password-quote-author">— T.S. Eliot</p>
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