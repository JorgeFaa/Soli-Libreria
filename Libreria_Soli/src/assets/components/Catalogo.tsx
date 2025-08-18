// src/components/Catalogo.tsx
import React from "react";
import { Link } from "react-router-dom";
import "./Catalogo.css";

// Importación de iconos SVG
import ArchiveIcon from "../icons/archive.svg";

/*
  Componente Catálogo - Sección de muestra de libros
  
  Por ahora es un placeholder
*/
export default function Catalogo() {

  return (
    <section id="catalogo" className="catalogo-section">
      <div className="catalogo-container">
        
        {/* Header de la sección */}
        <div className="catalogo-header">
          <div className="catalogo-badge">
            <img src={ArchiveIcon} alt="Archivo" className="catalogo-badge-icon" />
            Catálogo Digital
          </div>
          
          <h2 className="catalogo-title">
            Explora nuestro
            <span className="catalogo-title-accent"> universo literario</span>
          </h2>
          
          <p className="catalogo-description">
            Miles de títulos esperándote. Desde clásicos atemporales hasta las últimas novedades.
          </p>
        </div>
        <div>
          <Link to="/libreria"><h2 className="ir-catalogo">Ir al catálogo</h2></Link>
        </div>

        {/* Libros destacados*/}
            {/* TODO: Si se llega a implementar, mostrar un apartado con los libros más leídos*/}
      </div>
    </section>
  );
}
