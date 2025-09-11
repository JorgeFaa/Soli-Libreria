import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Contacto.css";

// Importación de iconos SVG
import SunIcon from "../icons/sun.svg";

export default function Contacto() {
  // Estados para manejar el formulario de contacto
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: ""
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Función para manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validaciones básicas
    if (!formData.nombre || !formData.email || !formData.asunto || !formData.mensaje) {
      setError("Por favor, completa todos los campos");
      setIsLoading(false);
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor, ingresa un email válido");
      setIsLoading(false);
      return;
    }

    try {
      // Simulación de envío de contacto (aquí iría la llamada a la API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Mensaje enviado:", formData);
      
      // Mostrar mensaje de éxito
      setSuccess("¡Mensaje enviado correctamente! Te responderemos pronto.");
      
      // Limpiar formulario
      setFormData({
        nombre: "",
        email: "",
        asunto: "",
        mensaje: ""
      });
      
    } catch (err) {
      setError("Error al enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="contacto" className="contacto-section">
      <div className="contacto-container">
        
        {/* Header de la sección */}
        <div className="contacto-header">
          <div className="contacto-logo">
            <img src={SunIcon} alt="Soli Logo" className="contacto-logo-icon" />
          </div>
          <h2 className="contacto-title">Contáctanos</h2>
          <p className="contacto-description">
            ¿Tienes alguna pregunta, sugerencia o simplemente quieres conversar sobre libros? 
            Nos encantaría escucharte y ser parte de tu viaje literario.
          </p>
        </div>

        <div className="contacto-content">
          
          {/* COLUMNA 1: Formulario de contacto */}
          <div className="contacto-form-section">
            <h3 className="contacto-form-title">Envíanos un mensaje</h3>
            
            <form className="contacto-form" onSubmit={handleSubmit}>
              
              {/* Fila: Nombre y Email */}
              <div className="contacto-row">
                <div className="contacto-field">
                  <label htmlFor="nombre" className="contacto-label">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    className="contacto-input"
                    placeholder="Tu nombre completo"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="contacto-field">
                  <label htmlFor="email" className="contacto-label">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="contacto-input"
                    placeholder="tu@ejemplo.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Campo de asunto */}
              <div className="contacto-field">
                <label htmlFor="asunto" className="contacto-label">
                  Asunto
                </label>
                <select
                  id="asunto"
                  name="asunto"
                  className="contacto-select"
                  value={formData.asunto}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                >
                  <option value="">Selecciona un asunto</option>
                  <option value="consulta-general">Consulta general</option>
                  <option value="recomendacion-libro">Recomendación de libro</option>
                  <option value="problema-tecnico">Problema técnico</option>
                  <option value="sugerencia">Sugerencia</option>
                  <option value="colaboracion">Colaboración</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Campo de mensaje */}
              <div className="contacto-field">
                <label htmlFor="mensaje" className="contacto-label">
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  className="contacto-textarea"
                  placeholder="Cuéntanos lo que tienes en mente..."
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                  rows={6}
                />
              </div>

              {/* Mensajes de estado */}
              {error && (
                <div className="contacto-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="contacto-success">
                  {success}
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                className="contacto-button"
                disabled={isLoading}
              >
                {isLoading ? "Enviando mensaje..." : "Enviar mensaje"}
              </button>

            </form>
          </div>

          {/* COLUMNA 2: Información de contacto */}
          <div className="contacto-info-section">
            
            {/* Información de contacto */}
            <div className="contacto-info-cards">
              
              <div className="contacto-info-card">
                <div className="contacto-info-icon">📧</div>
                <div className="contacto-info-content">
                  <h4 className="contacto-info-label">Email</h4>
                  <p className="contacto-info-value">hola@soli-libreria.com</p>
                  <p className="contacto-info-description">Respuesta en 24 horas</p>
                </div>
              </div>

              <div className="contacto-info-card">
                <div className="contacto-info-icon">📱</div>
                <div className="contacto-info-content">
                  <h4 className="contacto-info-label">WhatsApp</h4>
                  <p className="contacto-info-value">+52 12 3456 7890</p>
                  <p className="contacto-info-description">Lun - Vie: 9:00 AM - 6:00 PM</p>
                </div>
              </div>

              <div className="contacto-info-card">
                <div className="contacto-info-icon">📍</div>
                <div className="contacto-info-content">
                  <h4 className="contacto-info-label">Ubicación</h4>
                  <p className="contacto-info-value">Querétaro, México</p>
                  <p className="contacto-info-description">Atención virtual</p>
                </div>
              </div>


            </div>

            {/* Redes sociales */}
            <div className="contacto-social">
              <h4 className="contacto-social-title">Síguenos</h4>
              <div className="contacto-social-links">
                <a href="#" className="contacto-social-link">
                  <span className="contacto-social-icon">📘</span>
                  Facebook
                </a>
                <a href="#" className="contacto-social-link">
                  <span className="contacto-social-icon">📷</span>
                  Instagram
                </a>
                <a href="#" className="contacto-social-link">
                  <span className="contacto-social-icon">🐦</span>
                  Twitter
                </a>
              </div>
            </div>

            {/* Mensaje motivacional */}
            <div className="contacto-quote">
              <p className="contacto-quote-text">
                "La lectura es una conversación con los hombres más ilustres de los siglos pasados"
              </p>
              <p className="contacto-quote-author">— René Descartes</p>
            </div>
          </div>

        </div>

        {/* Navegación de regreso */}
        <div className="contacto-navigation">
          <Link to="/" className="contacto-back-link">
            ← Volver al inicio
          </Link>
        </div>

      </div>
    </section>
  );
}
