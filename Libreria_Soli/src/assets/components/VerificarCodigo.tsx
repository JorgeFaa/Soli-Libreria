import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./VerificarCodigo.css";

// Importar el servicio de autenticación
import { verifyAccount, resendVerificationCode } from "../../services/authService";

// Importar sistema de Toast
import Toast from "./Toast";

export default function VerificarCodigo() {
  // Estados para manejar el formulario
  const [code, setCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isErrorFading, setIsErrorFading] = useState<boolean>(false);

  // Estados para Toast
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");
  const [showToast, setShowToast] = useState<boolean>(false);

  // Estados para cooldown de reenvío
  const [canResend, setCanResend] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(180); // 3 minutos inicial
  const [isResending, setIsResending] = useState<boolean>(false);

  // Hooks
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "ejemplo@correo.com"; // Email temporal para demo

  // Función para mostrar notificaciones
  const showNotification = (message: string, type: "success" | "error" | "warning") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Auto-ocultar error después de 5 segundos
  useEffect(() => {
    if (error) {
      const fadeTimer = setTimeout(() => {
        setIsErrorFading(true);
        
        setTimeout(() => {
          setError("");
          setIsErrorFading(false);
        }, 300);
        
      }, 4500);

      return () => clearTimeout(fadeTimer);
    }
  }, [error]);

  // Cooldown inicial al entrar a la página (3 minutos)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  // Verificar que tenemos el email, si no, usar uno temporal para demo
  useEffect(() => {
    // Comentado temporalmente para poder ver la pantalla sin email
    // if (!email) {
    //   navigate("/registro");
    // }
  }, [email, navigate]);

  // Función para manejar cambios en el input del código
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Solo números
    if (value.length <= 6) {
      setCode(value);
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validaciones básicas
    if (!code) {
      setError("Por favor, ingresa el código de verificación");
      setIsLoading(false);
      return;
    }

    if (code.length !== 6) {
      setError("El código debe tener 6 dígitos");
      setIsLoading(false);
      return;
    }

    // Llamada a la API
    try {
      console.log("🚀 Verificando código para email:", email);
      console.log("📦 Código ingresado:", code);
      
      const response = await verifyAccount(email, code);
      
      console.log("📡 Respuesta de verificación:", response);
      
      if (response.success) {
        console.log("✅ Verificación exitosa");
        showNotification("¡Cuenta verificada exitosamente! Ahora puedes iniciar sesión.", "success");
        
        // Esperar un momento para que el usuario vea el mensaje
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        console.log("❌ Verificación fallida:", response.message);
        showNotification(response.message || "Código inválido o expirado", "error");
      }
      
    } catch (err) {
      console.error("🔥 Error en verificación:", err);
      
      if (err instanceof Error) {
        console.log("🔍 Tipo de error:", err.message);
        if (err.message.includes('fetch')) {
          showNotification("Error de conexión. Verifica tu internet e intenta nuevamente.", "error");
        } else {
          showNotification(err.message, "error");
        }
      } else {
        console.log("❓ Error desconocido:", err);
        showNotification("Error de conexión. Verifica tu internet.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para reenviar código de verificación
  const handleResendCode = async () => {
    if (!canResend || isResending) {
      return;
    }

    setIsResending(true);
    
    try {
      console.log("📧 Reenviando código para:", email);
      
      const response = await resendVerificationCode({
        username: email
      });

      if (response.success) {
        showNotification(response.message, "success");
        
        // Reiniciar cooldown a 30 segundos para siguientes reenvíos
        setCanResend(false);
        setResendCooldown(30);
        
      } else {
        showNotification(response.message, "error");
      }
      
    } catch (error) {
      console.error("🔥 Error al reenviar código:", error);
      showNotification("Error al reenviar el código. Intenta nuevamente.", "error");
    } finally {
      setIsResending(false);
    }
  };

  // Función para formatear el tiempo del cooldown
  const formatCooldownTime = (seconds: number): string => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  return (
    <section className="verificar-section">
      <div className="verificar-container">
        <div className="verificar-grid">
          
          {/* COLUMNA 1: Formulario de verificación */}
          <div className="verificar-content">
            
            {/* Header del formulario */}
            <div className="verificar-header">
              <h1 className="verificar-title">Verificar tu cuenta</h1>
              <p className="verificar-description">
                Hemos enviado un código de verificación de 6 dígitos a <strong>{email}</strong>
              </p>
            </div>

            {/* Formulario de verificación */}
            <form className="verificar-form" onSubmit={handleSubmit}>

              {/* Campo del código */}
              <div className="verificar-field">
                <label htmlFor="code" className="verificar-label">
                  Código de verificación
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  className="verificar-input"
                  placeholder="123456"
                  value={code}
                  onChange={handleCodeChange}
                  disabled={isLoading}
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                />
                <p className="verificar-hint">
                  Ingresa el código de 6 dígitos que recibiste por correo
                </p>
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                className="verificar-button"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? "Verificando..." : "Verificar Cuenta"}
              </button>

            </form>

            {/* Opciones adicionales */}
            <div className="verificar-footer">
              <p>
                ¿No recibiste el código?{" "}
                <button 
                  type="button"
                  className="verificar-link-button"
                  onClick={handleResendCode}
                  disabled={isLoading || !canResend || isResending}
                >
                  {isResending 
                    ? "Reenviando..." 
                    : canResend 
                      ? "Reenviar código"
                      : `Reenviar en ${formatCooldownTime(resendCooldown)}`
                  }
                </button>
              </p>
              
              <p>
                ¿Email incorrecto?{" "}
                <Link to="/registro" className="verificar-link-primary">
                  Cambiar email
                </Link>
              </p>
            </div>

            {/* Enlace para volver al inicio */}
            <div className="verificar-back">
              <Link to="/" className="verificar-back-link">
                ← Volver al inicio
              </Link>
            </div>
          </div>

          {/* COLUMNA 2: Elementos visuales */}
          <div className="verificar-visual">
            <div className="verificar-visual-content">
              <h3 className="verificar-visual-title">
                Un paso más para
                <span className="verificar-visual-accent">Soli</span>
              </h3>
              <p className="verificar-visual-description">
                La verificación de tu cuenta garantiza la seguridad de tu información y te permite acceder a todas las funcionalidades de nuestra plataforma.
              </p>
              
              {/* Pasos del proceso */}
              <div className="verificar-steps">
                <div className="verificar-step completed">
                  <div className="verificar-step-icon">✅</div>
                  <div className="verificar-step-content">
                    <h4 className="verificar-step-title">Registro completado</h4>
                    <p className="verificar-step-description">Tu cuenta ha sido creada exitosamente</p>
                  </div>
                </div>
                
                <div className="verificar-step active">
                  <div className="verificar-step-icon">📧</div>
                  <div className="verificar-step-content">
                    <h4 className="verificar-step-title">Verificación de email</h4>
                    <p className="verificar-step-description">Confirma tu dirección de correo electrónico</p>
                  </div>
                </div>

                <div className="verificar-step">
                  <div className="verificar-step-icon">🎉</div>
                  <div className="verificar-step-content">
                    <h4 className="verificar-step-title">¡Listo para usar!</h4>
                    <p className="verificar-step-description">Accede a tu cuenta y explora</p>
                  </div>
                </div>
              </div>
              
              {/* Consejos de seguridad */}
              <div className="verificar-tips">
                <h4 className="verificar-tips-title">💡 Consejos de seguridad</h4>
                <ul className="verificar-tips-list">
                  <li>El código expira en 10 minutos</li>
                  <li>Revisa tu carpeta de spam si no lo ves</li>
                  <li>No compartas este código con nadie</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Mensaje de error flotante */}
      {error && (
        <div className={`verificar-error ${isErrorFading ? 'fade-out' : ''}`}>
          {error}
        </div>
      )}

      {/* Toast de notificaciones */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />
      )}
    </section>
  );
}