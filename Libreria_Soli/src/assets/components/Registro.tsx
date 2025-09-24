import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Registro.css";

// Importar el servicio de autenticación
import { registerUser } from "../../services/authService";
import type { RegisterRequest } from "../../services/authService";

// Importar sistema de Toast
import Toast from "./Toast";

// Tipo para las props del Registro
type RegistroProps = {
  // No necesitamos onRegistroSuccess ya que el registro no inicia sesión automáticamente
};

//Por ejemplo, aquí lo estamos pasando como argumento, en este caso, primero el prop onRegistroSuccess, que es lo que se debe pasar 
export default function Registro({}: RegistroProps) {
  // Estados para manejar los inputs del formulario
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isErrorFading, setIsErrorFading] = useState<boolean>(false);

  // Estados para Toast
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");
  const [showToast, setShowToast] = useState<boolean>(false);

  // Hook de navegación
  const navigate = useNavigate();

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
        setIsErrorFading(true); // Inicia la animación de salida
        
        // Después de la animación, oculta completamente el error
        setTimeout(() => {
          setError("");
          setIsErrorFading(false);
        }, 300); // 300ms para que coincida con la duración de la transición CSS
        
      }, 4500); // 4.5 segundos + 0.5 de animación = 5 segundos total

      return () => clearTimeout(fadeTimer); // Limpia el timer si el componente se desmonta
    }
  }, [error]);

  // Función para manejar cambios en los inputs
  //Vamos a leer los inputs HTML que se estén modificando con React.ChangeEvent (en este caso, inputs)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; //Desestructuramos el name y value del input que se está modificando
    setFormData(prev => ({ //Tomamos parte del estado anterior (prev) y actualizamos solo el campo que cambió
      ...prev, // Como no vamos a modificar todos los campos, mantenemos los que no se modifican 
      [name]: value // Y solo aactualizamos el que cambió
    }));
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validaciones básicas
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Por favor, completa todos los campos");
      setIsLoading(false);
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor, ingresa un email válido");
      setIsLoading(false);
      return;
    }

    // Validar longitud de contraseña
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    // Llamada a la API real
    try {
      console.log("🚀 Iniciando registro con email:", formData.email);
      
      // Preparar datos para la API (solo username y password)
      const userData: RegisterRequest = {
        nombre: "Usuario", // Valor temporal, no se usa en la API
        apellido: "", // Valor temporal, no se usa en la API
        email: formData.email,
        password: formData.password
      };
      
      console.log("📦 Datos preparados para enviar:", {
        username: formData.email,
        password: "***oculta***"
      });
      
      const response = await registerUser(userData);
      
      console.log("📡 Respuesta recibida del registro:", response);
      
      if (response.success) {
        console.log("✅ Registro exitoso:", response.user);
        // Mostrar mensaje de éxito
        showNotification("¡Registro exitoso! Te hemos enviado un código de verificación por correo.", "success");
        
        // Esperar un momento para que el usuario vea el mensaje
        setTimeout(() => {
          // Navegar a la verificación con el email como parámetro
          navigate(`/verificar-codigo?email=${encodeURIComponent(formData.email)}`);
        }, 2000);
      } else {
        console.log("❌ Registro fallido:", response.message);
        showNotification(response.message || "Error al crear la cuenta", "error");
      }
      
    } catch (err) {
      console.error("🔥 Error en registro:", err);
      
      // Mensaje más específico según el tipo de error
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

  return (
    <section className="registro-section">
      <div className="registro-container">
        <div className="registro-grid">
          
          {/* COLUMNA 1: Formulario de registro */}
          <div className="registro-content">
            
            {/* Header del formulario */}
            <div className="registro-header">
              <h1 className="registro-title">Crear Cuenta</h1>
              <p className="registro-description">
                Únete a nuestra comunidad de lectores y descubre un mundo de historias infinitas
              </p>
            </div>

            {/* Formulario de registro */}
            <form className="registro-form" onSubmit={handleSubmit}>

              {/* Campo de email */}
              <div className="registro-field">
                <label htmlFor="email" className="registro-label">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="registro-input"
                  placeholder="tu@ejemplo.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              {/* Campo de contraseña */}
              <div className="registro-field">
                <label htmlFor="password" className="registro-label">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="registro-input"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>

              {/* Confirmar contraseña */}
              <div className="registro-field">
                <label htmlFor="confirmPassword" className="registro-label">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="registro-input"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                className="registro-button"
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </button>

            </form>

            {/* Footer del formulario */}
            <div className="registro-footer">
              <p>
                ¿Ya tienes una cuenta?{" "}
                <Link to="/login" className="registro-link-primary">
                  Iniciar sesión
                </Link>
              </p>
            </div>

            {/* Enlace para volver al inicio */}
            <div className="registro-back">
              <Link to="/" className="registro-back-link">
                ← Volver al inicio
              </Link>
            </div>
          </div>

          {/* COLUMNA 2: Elementos visuales */}
          <div className="registro-visual">
            <div className="registro-visual-content">
              <h3 className="registro-visual-title">
                Únete a la familia
                <span className="registro-visual-accent">Soli</span>
              </h3>
              <p className="registro-visual-description">
                Conviértete en parte de una comunidad apasionada por la lectura. Descubre nuevos mundos, conecta con otros lectores y construye tu biblioteca personal.
              </p>
              
              {/* Beneficios de registrarse */}
              <div className="registro-benefits">
                <div className="registro-benefit">
                  <div className="registro-benefit-icon">🎯</div>
                  <div className="registro-benefit-content">
                    <h4 className="registro-benefit-title">Recomendaciones personalizadas</h4>
                    <p className="registro-benefit-description">Algoritmo inteligente que aprende de tus gustos</p>
                  </div>
                </div>
                
                <div className="registro-benefit">
                  <div className="registro-benefit-icon">💎</div>
                  <div className="registro-benefit-content">
                    <h4 className="registro-benefit-title">Acceso a contenido exclusivo</h4>
                    <p className="registro-benefit-description">Primeras ediciones y lanzamientos anticipados</p>
                  </div>
                </div>

              </div>
              
              {/* Frase inspiradora */}
              <div className="registro-quote">
                <p className="registro-quote-text">
                  "Los libros son la puerta de entrada a una vida más rica"
                </p>
                <p className="registro-quote-author">— Paulo Coelho</p>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Mensaje de error flotante */}
      {error && (
        <div className={`registro-error ${isErrorFading ? 'fade-out' : ''}`}>
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