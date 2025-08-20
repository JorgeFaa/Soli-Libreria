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
  // Hook useState para manejar el estado del menú de usuario
  // Controla si el menú lateral del usuario está abierto o cerrado
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  // Hook useState para manejar la animación de cierre
  // Parecido a lo que hacemos con el estado de userMenuOpen, pero al revés 
  const [isClosing, setIsClosing] = useState<boolean>(false);
  // Hook useNavigate de React Router para navegar programáticamente
  // Esto nos permite cambiar de ruta sin recargar la página
  // 'navigate' es la función que usaremos para cambiar de ruta
  const navigate = useNavigate();

  // Función para navegar al inicio y hacer scroll al top
  const handleHomeNavigation = () => {
    navigate('/');
    window.scrollTo(0, 0);
  };

  // Función para cerrar el menú con animación
  const handleCloseMenu = () => {
    setIsClosing(true); // Cambiamos el estado a true, es decir, que si se está cerrando
    setTimeout(() => { // Usamos setTimeout para esperar a que la animación de cierre termine
      setUserMenuOpen(false); // Cambiamos el estado de userMenuOpen a false, es decir, que ya no está abierto
      setIsClosing(false); // Cambiamos el estado de isClosing a false, es decir, que ya no se está cerrando
    }, 300); // Duración de la animación
  };

  return (
    <nav className="header-nav">
      <div className="MenuUsuario" onClick={() => setUserMenuOpen(!userMenuOpen)}>
          <img src={MenuIcon} alt="User Menu" />
        </div>
      <div className="header-container">
        {/* Logo - Soli" */}
        <button onClick={handleHomeNavigation} className="header-logo">
          <div>
            {/* Icono del sol  */}
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
        </div>
      </div>

      {/* Menú lateral de usuario */}
      {userMenuOpen && (
        <div className={`user-side-menu ${isClosing ? 'closing' : ''}`}> {/* Leemos el estado de isClosing declarado antes, si es true, le agregamos la clase closing para que entren los estilos, si no, no movemos ninguna clase */}
          <div 
            className="user-side-menu-content"
            onClick={(e) => e.stopPropagation()} // Prevenir que el clic se propague al overlay
          >
            <div className="user-side-menu-header">
              <h3>
                <span className="desktop-title">Mi Cuenta</span>
                <span className="mobile-title">Menú</span>
              </h3>
              <button 
                className="user-side-menu-close"
                onClick={handleCloseMenu}
              >
                <img src={XIcon} alt="Cerrar" />
              </button>
            </div>
            <div className="user-side-menu-items">
              {/* Navegación principal - Solo en móvil */}
              {/* En vez de renderizar el menú de navegación en el header, lo vamos a mostrar en el mismo menú donde está el usuario*/}
              <div className="user-side-menu-section mobile-only">
                <h4 className="user-side-menu-section-title">Navegación</h4>
                {/* Vamos a usar map de nuevo para transformar los valores de LINKS */}
                {LINKS.map((l) => (
                  l.href === "/" ? ( //Primero, verificamos si el enlace es el de inicio, porque eso va a cerrar el menú y volver al inicio. Lo renderizamos como un botón para el estilo
                    <button
                      key={l.href}
                      onClick={() => {
                        handleHomeNavigation();
                        handleCloseMenu();
                      }}
                      className="user-side-menu-item"
                    >
                      {l.label}
                    </button>
                  ) : l.href.startsWith('/') ? ( // Después, verificamos si el enlace es un enlace interno, porque eso va a navegar a la ruta y cerrar el menú. Lo renderizamos como un <Link> por convención
                    <Link
                      key={l.href}
                      to={l.href}
                      className="user-side-menu-item"
                      onClick={handleCloseMenu}
                    >
                      {l.label}
                    </Link>
                  ) : ( //Si no, significa que es un enlace externo, así que lo renderizamos como un <a> normal para navegación
                    <a
                      key={l.href}
                      href={l.href}
                      className="user-side-menu-item"
                      onClick={handleCloseMenu}
                    >
                      {l.label}
                    </a>
                  )
                ))}
                <Link
                  to="/libreria"
                  className="user-side-menu-item"
                  onClick={handleCloseMenu}
                >
                  Explorar libros
                </Link> {/* Esto siempre va a estar */}
              </div>
              
              <hr className="user-side-menu-divider mobile-only" />
              
              {/* Opciones de cuenta */}
              <div className="user-side-menu-section">
                {/* Distintas opciones del menú*/}
                <h4 className="user-side-menu-section-title">Mi Cuenta</h4>
                <a href="#perfil" className="user-side-menu-item">Mi Perfil</a>
                <a href="#mis-libros" className="user-side-menu-item">Mis Libros</a>
                <a href="#favoritos" className="user-side-menu-item">Favoritos</a>
                <a href="#configuracion" className="user-side-menu-item">Configuración</a>
                <hr className="user-side-menu-divider" />
                <a href="#cerrar-sesion" className="user-side-menu-item">Cerrar Sesión</a>
              </div>
            </div>
            <div className="Menufooter">
              &copy; 2025 El Edwin fan de dmc
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
