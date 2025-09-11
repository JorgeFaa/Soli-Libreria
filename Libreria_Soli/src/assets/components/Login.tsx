import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

// Importación de iconos SVG
import SunIcon from "../icons/sun.svg";

// Importar el servicio de autenticación
import { loginUser } from "../../services/authService";
import type { LoginRequest } from "../../services/authService";

// Tipo para las props del Login
type LoginProps = {
  onLoginSuccess: () => void;
};

export default function Login({ onLoginSuccess }: LoginProps) {
  // Estados para manejar los inputs del formulario
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Hook de navegación
  const navigate = useNavigate();

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validaciones básicas
    if (!email || !password) {
      setError("Por favor, completa todos los campos");
      setIsLoading(false);
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un email válido");
      setIsLoading(false);
      return;
    }

    try {
      // Llamada a la API real
      const credentials: LoginRequest = { email, password };
      const response = await loginUser(credentials);
      
      if (response.success) {
        console.log("Login exitoso:", response.user);
        
        // Actualizar el estado global de autenticación
        onLoginSuccess();
        
        // Navegar de vuelta al inicio
        navigate("/");
      } else {
        setError(response.message || "Error al iniciar sesión");
      }
      
    } catch (err) {
      console.error("Error en login:", err);
      setError(err instanceof Error ? err.message : "Error de conexión. Verifica tu internet.");
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
              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

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
    </section>
  );
}