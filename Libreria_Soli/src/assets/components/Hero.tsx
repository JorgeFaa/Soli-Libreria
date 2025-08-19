// src/components/Hero.tsx
import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

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
            
            {/* Badge de confianza con el nuevo branding */}
            <div className="hero-badge">
              <img src={StarIcon} alt="Estrella" className="hero-badge-icon" />
              Tu librería de confianza desde 2025
            </div>
            
            {/* Título principal actualizado para Soli */}
            <h1 className="hero-title">
              Donde cada libro 
              <span className="hero-title-accent">ilumina tu día</span>
            </h1>
            
            {/* Descripción más específica de una librería física */}
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

            {/* Estadísticas actualizadas */}
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-number">12,000+</div>
                <div className="hero-stat-label">¿Siquiera</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">28</div>
                <div className="hero-stat-label">deberia</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">3,500+</div>
                <div className="hero-stat-label">poner estadísticas?</div>
              </div>
            </div>
          </div>

          {/* COLUMNA 2: Elementos visuales */}
          <div>
            <h3>Necesito hacer algo para rellenar aquí</h3>
          </div>
        </div>
      </div>
    </section>
  );
}
