// src/components/Hero.tsx
import { Link } from "react-router-dom";
import "./Hero.css";
import LibreriaImage from "../icons/libros-en-los-estantes-patrón-sin-inconvenientes-librerías-con-para-niños-interior-de-biblioteca-o-librería-blancos-391341420.png"

// Importación de iconos SVG
import StarIcon from "../icons/star.svg";
import SearchIcon from "../icons/search.svg";

/* Sección principal de la página de inicio */
export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-grid">
          
          {/* COLUMNA 1: Contenido de texto */}
          <div className="hero-content">
            
            {/* Badge para generar confianza */}
            <div className="hero-badge">
              <img src={StarIcon} alt="Estrella" className="hero-badge-icon" />
              Tu librería de confianza desde 2025
            </div>
            
            {/* Título principal */}
            <h1 className="hero-title">
              Donde cada libro 
              <span className="hero-title-accent">ilumina tu día</span>
            </h1>
            
            {/* Descripción */}
            <p className="hero-description">
              En Soli encontrarás desde los últimos bestsellers hasta joyas literarias descatalogadas. 
              Disfruta de un momento para tí mientras explores miles de títulos cuidadosamente seleccionados.
            </p>

            {/* Botones de llamada a la acción */}
            <div className="hero-buttons">
              <Link to="/libreria" className="hero-button-primary">
                <img src={SearchIcon} alt="Buscar" className="hero-button-icon" />
                Ver catálogo
              </Link>
            </div>
          </div>

          {/* COLUMNA 2: Elementos visuales */}
          <div className="hero-visual">
            <div className="hero-image-container">
              <img 
                src={LibreriaImage} 
                alt="Libros en un estante" 
                className="hero-image"
              />
              <div className="hero-image-overlay"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
