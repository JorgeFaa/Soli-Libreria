import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Registro.css";

// Tipo para las props del Registro
//Se puede pasar como argumento en los componentes, la idea es que simule el registro y luego inicie sesión automáticamente
type RegistroProps = {
  onRegistroSuccess: () => void;
}; //Esta función no necesita parametros, y no retorna nada, pues es solo para simular el registro

//Por ejemplo, aquí lo estamos pasando como argumento, en este caso, primero el prop onRegistroSuccess, que es lo que se debe pasar 
export default function Registro({ onRegistroSuccess }: RegistroProps) {
  // Estados para manejar los inputs del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isErrorFading, setIsErrorFading] = useState<boolean>(false);

  // Hook de navegación
  const navigate = useNavigate();

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
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.password || !formData.confirmPassword) {
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

    // Simulación de registro (aquí iría la llamada a la API)
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Registro exitoso:", formData);
      
      // Actualizar el estado global de autenticación
      onRegistroSuccess();
      
      // Navegar de vuelta al inicio
      navigate("/");
      
    } catch (err) {
      setError("Error al crear la cuenta. Inténtalo de nuevo.");
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
              
              {/* Nombre y Apellido en fila */}
              <div className="registro-row">
                <div className="registro-field">
                  <label htmlFor="nombre" className="registro-label">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    className="registro-input"
                    placeholder="Tu nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    autoComplete="given-name"
                  />
                </div>

                <div className="registro-field">
                  <label htmlFor="apellido" className="registro-label">
                    Apellido
                  </label>
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    className="registro-input"
                    placeholder="Tu apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    autoComplete="family-name"
                  />
                </div>
              </div>

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
    </section>
  );
}