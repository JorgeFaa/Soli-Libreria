// src/components/Header.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

// Importación de iconos SVG
import SunIcon from "../icons/sun.svg";
import SearchIcon from "../icons/search.svg";
import MenuIcon from "../icons/menu.svg";
import XIcon from "../icons/x.svg";

// Definimos un tipo personalizado para los enlaces de navegación
// Este tipo me va a ayudar a renderizar el menú de navegación sin tener que definir uno por uno como en JS
// Tiene dos propiedades: para navegación (href) y el texto del enlace (label)
type NavLink = { href: string; label: string };

// Array constante con los enlaces de navegación
// Se define fuera del componente para evitar recrearlo en cada render
// El tipo NavLink lo va a tomar como referencia para renderizarlo en la página, haciendo uso de las propiedades href y label
const LINKS: NavLink[] = [
  { href: "/", label: "Inicio" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

// Componente funcional Header con TypeScript
// JSX.Element especifica que este componente retorna elementos JSX
export default function Header() {
  // Hook useState para manejar el estado del menú para móviles
  // 'open' es el valor actual, 'setOpen' es la función para actualizarlo
  // Inicializamos en 'false' (menú cerrado para móviles)
  const [open, setOpen] = useState<boolean>(false);
  // Hook useNavigate de React Router para navegar programáticamente
  // Esto nos permite cambiar de ruta sin recargar la página
  // 'navigate' es la función que usaremos para cambiar de ruta
  const navigate = useNavigate();

  // Función para navegar al inicio y hacer scroll al top
  const handleHomeNavigation = () => {
    navigate('/');
    window.scrollTo(0, 0);
  };

  return (
    <nav className="header-nav">
      <div className="header-container">
        {/* Logo Section - Actualizado con el nuevo nombre "Soli" */}
        <button onClick={handleHomeNavigation} className="header-logo">
          <div>
            {/* Icono del sol importado (relacionado con "Soli") */}
            <img src={SunIcon} alt="Soli Logo" className="header-logo-icon" />
          </div>
          <div className="header-logo-text">
            {/* Nombre actualizado de la librería */}
            <span className="header-logo-title">Soli</span>
            <span className="header-logo-subtitle">Librería Digital</span>
          </div>
        </button>

        {/* Navegación (Escritorio) */}
        <div className="header-nav-links">
          {/* Usamos map para renderizar un <a> con las propiedades de LINKS, y vamos colocando los atributos para que siga funcionando como un HTML*/}
          {/* .map tranforma cada elemento de LINKS en otra cosa, en este caso, elementos a. Como tal "mapea" las cosas a lo que declares. Funciona como un iterador, como for*/}
          {LINKS.map((l) => ( 
            l.href === "/" ? (
              <button
                key={l.href}
                onClick={handleHomeNavigation}
                className="header-nav-link"
              >
                {l.label}
              </button>
            ) : l.href.startsWith('/') ? (
              <Link
                key={l.href}
                to={l.href}
                className="header-nav-link"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="header-nav-link"
              >
                {l.label}
              </a>
            )
          ))}
        </div>

        {/* Botones de acción */}
        <div className="header-actions">
          <Link to="/libreria" className="header-cta-button">
            <img src={SearchIcon} alt="Buscar" className="header-cta-icon" />
            Explorar libros
          </Link>
          
          {/* Botón del menú móvil */}
          <button
            className="header-mobile-menu-button"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <img src={XIcon} alt="Cerrar menú" className="header-mobile-menu-icon" />
            ) : (
              <img src={MenuIcon} alt="Abrir menú" className="header-mobile-menu-icon" />
            )}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {open && (
        <div className="header-mobile-menu">
          <div className="header-mobile-menu-links">
            {LINKS.map((l) => (
              l.href === "/" ? (
                <button
                  key={l.href}
                  onClick={() => {
                    handleHomeNavigation();
                    setOpen(false);
                  }}
                  className="header-mobile-menu-link"
                >
                  {l.label}
                </button>
              ) : l.href.startsWith('/') ? (
                <Link
                  key={l.href}
                  to={l.href}
                  className="header-mobile-menu-link"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  className="header-mobile-menu-link"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              )
            ))}
            <Link
              to="/libreria"
              className="header-mobile-cta"
              onClick={() => setOpen(false)}
            >
              Explorar libros
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
