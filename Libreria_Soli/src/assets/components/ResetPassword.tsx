import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./ResetPassword.css";

// Importación de iconos SVG
import SunIcon from "../icons/sun.svg";

// Importar el servicio de autenticación
import { confirmForgotPassword } from "../../services/authService";

// Importar componente Toast
import Toast from "./Toast";

export default function ResetPassword() {
  // Estados para manejar el formulario
  const [email, setEmail] = useState<string>("");
  const [confirmationCode, setConfirmationCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  // Estados para notificaciones Toast
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [showToast, setShowToast] = useState<boolean>(false);

  // Hook de navegación y parámetros URL
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Cargar email desde URL params al montar
  useEffect(() => {
    const emailFromParams = searchParams.get('email');
    if (emailFromParams) {
      setEmail(emailFromParams);
    }
  }, [searchParams]);

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

  // Función para validar fortaleza de contraseña
  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    return requirements;
  };

  // Validar contraseña actual
  const passwordValidation = validatePassword(newPassword);
  const isPasswordValid = Object.values(passwordValidation).every(req => req);

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

    if (!confirmationCode) {
      showNotification("Por favor, ingresa el código de verificación", "warning");
      setIsLoading(false);
      return;
    }

    if (!newPassword) {
      showNotification("Por favor, ingresa tu nueva contraseña", "warning");
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid) {
      showNotification("La contraseña no cumple con todos los requisitos de seguridad", "warning");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification("Las contraseñas no coinciden", "warning");
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
      // Llamada a la API para confirmar nueva contraseña
      const response = await confirmForgotPassword(email, confirmationCode, newPassword);
      
      if (response.success) {
        setIsSuccess(true);
        showNotification(response.message, "success");
        
        // Después de 3 segundos, redirigir al login
        setTimeout(() => {
          navigate("/login");
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

  if (isSuccess) {
    return (
      <section className="reset-password-section">
        <div className="reset-password-container">
          <div className="reset-password-grid">
            <div className="reset-password-content">
              <div className="reset-password-success">
                <span className="reset-password-success-icon">✅</span>
                <h1 className="reset-password-success-title">¡Contraseña actualizada!</h1>
                <p className="reset-password-success-message">
                  Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                  Serás redirigido automáticamente al login.
                </p>
                <Link to="/login" className="reset-password-link-primary">
                  Ir al login ahora →
                </Link>
              </div>
            </div>
            
            {/* Columna visual de éxito */}
            <div className="reset-password-visual">
              <div className="reset-password-visual-content">
                <h3 className="reset-password-visual-title">
                  🎉 ¡Todo listo para 
                  <span className="reset-password-visual-accent">Soli</span>!
                </h3>
                <p className="reset-password-visual-description">
                  Tu nueva contraseña ha sido configurada con éxito. Ahora puedes acceder a tu biblioteca personal y continuar explorando tus historias favoritas.
                </p>
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

  return (
    <section className="reset-password-section">
      <div className="reset-password-container">
        <div className="reset-password-grid">
          
          {/* COLUMNA 1: Formulario */}
          <div className="reset-password-content">"
          
          {/* Header del formulario */}
          <div className="reset-password-header">
            <div className="reset-password-logo">
              <img src={SunIcon} alt="Soli Logo" className="reset-password-logo-icon" />
              <span className="reset-password-logo-text">Nueva</span>
            </div>
            <h1 className="reset-password-title">Restablecer Contraseña</h1>
            <p className="reset-password-description">
              Ingresa el código que recibiste por correo y tu nueva contraseña
            </p>
            {email && (
              <div className="reset-password-email-display">
                {email}
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="reset-password-info">
            <p className="reset-password-info-text">
              🔐 El código tiene 6 dígitos y es válido por 15 minutos. Si no lo encuentras, revisa tu carpeta de spam.
            </p>
          </div>

          {/* Formulario */}
          <form className="reset-password-form" onSubmit={handleSubmit}>
            
            {/* Campo de email (editable si no vino por URL) */}
            <div className="reset-password-field">
              <label htmlFor="email" className="reset-password-label">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                className="reset-password-input"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Campo de código */}
            <div className="reset-password-field">
              <label htmlFor="code" className="reset-password-label">
                Código de verificación
              </label>
              <input
                type="text"
                id="code"
                className="reset-password-input reset-password-code-input"
                placeholder="123456"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value.trim())}
                disabled={isLoading}
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>

            {/* Campo de nueva contraseña */}
            <div className="reset-password-field">
              <label htmlFor="newPassword" className="reset-password-label">
                Nueva contraseña
              </label>
              <input
                type="password"
                id="newPassword"
                className="reset-password-input"
                placeholder="Tu nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
              
              {/* Indicadores de fortaleza */}
              {newPassword && (
                <div className="password-strength">
                  <div className="password-requirements">
                    <div className={`password-requirement ${passwordValidation.length ? 'met' : 'not-met'}`}>
                      <span>{passwordValidation.length ? '✓' : '✗'}</span>
                      <span>Al menos 8 caracteres</span>
                    </div>
                    <div className={`password-requirement ${passwordValidation.uppercase ? 'met' : 'not-met'}`}>
                      <span>{passwordValidation.uppercase ? '✓' : '✗'}</span>
                      <span>Una mayúscula</span>
                    </div>
                    <div className={`password-requirement ${passwordValidation.lowercase ? 'met' : 'not-met'}`}>
                      <span>{passwordValidation.lowercase ? '✓' : '✗'}</span>
                      <span>Una minúscula</span>
                    </div>
                    <div className={`password-requirement ${passwordValidation.number ? 'met' : 'not-met'}`}>
                      <span>{passwordValidation.number ? '✓' : '✗'}</span>
                      <span>Un número</span>
                    </div>
                    <div className={`password-requirement ${passwordValidation.special ? 'met' : 'not-met'}`}>
                      <span>{passwordValidation.special ? '✓' : '✗'}</span>
                      <span>Un carácter especial</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div className="reset-password-field">
              <label htmlFor="confirmPassword" className="reset-password-label">
                Confirmar nueva contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="reset-password-input"
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              className="reset-password-button"
              disabled={isLoading}
            >
              {isLoading ? "Actualizando contraseña..." : "Actualizar contraseña"}
            </button>

          </form>

          {/* Footer del formulario */}
          <div className="reset-password-footer">
            <p>
              ¿No recibiste el código?{" "}
              <Link to="/forgot-password" className="reset-password-link-primary">
                Solicitar nuevo código
              </Link>
            </p>
            <p>
              <Link to="/login" className="reset-password-link-primary">
                Volver al login
              </Link>
            </p>
          </div>

          {/* Enlace para volver al inicio */}
          <div className="reset-password-back">
            <Link to="/" className="reset-password-back-link">
              ← Volver al inicio
            </Link>
          </div>
          
        </div>

        {/* COLUMNA 2: Contenido visual */}
        <div className="reset-password-visual">
          <div className="reset-password-visual-content">
            <h3 className="reset-password-visual-title">
              🔐 Casi terminamos con tu 
              <span className="reset-password-visual-accent">nueva contraseña</span>
            </h3>
            <p className="reset-password-visual-description">
              Estás a un paso de recuperar el acceso completo a tu cuenta. Una vez que confirmes tu nueva contraseña, podrás volver a explorar tu biblioteca personal.
            </p>
            
            {/* Información de seguridad */}
            <div className="reset-password-security">
              <div className="reset-password-security-item">
                <div className="reset-password-security-icon">🛡️</div>
                <div className="reset-password-security-content">
                  <h4 className="reset-password-security-title">Seguridad mejorada</h4>
                  <p className="reset-password-security-description">Tu nueva contraseña será encriptada de forma segura</p>
                </div>
              </div>
              
              <div className="reset-password-security-item">
                <div className="reset-password-security-icon">⏰</div>
                <div className="reset-password-security-content">
                  <h4 className="reset-password-security-title">Código temporal</h4>
                  <p className="reset-password-security-description">El código de verificación expira en 15 minutos</p>
                </div>
              </div>
            
              <div className="reset-password-security-item">
                <div className="reset-password-security-icon">🔑</div>
                <div className="reset-password-security-content">
                  <h4 className="reset-password-security-title">Acceso inmediato</h4>
                  <p className="reset-password-security-description">Podrás iniciar sesión inmediatamente después</p>
                </div>
              </div>
            </div>
            
            {/* Frase inspiradora */}
            <div className="reset-password-quote">
              <p className="reset-password-quote-text">
                "Todo nuevo comienzo viene del final de algún otro comienzo"
              </p>
              <p className="reset-password-quote-author">— Séneca</p>
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