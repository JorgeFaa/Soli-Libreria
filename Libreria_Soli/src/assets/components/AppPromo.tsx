import "./AppPromo.css";

// Importación de iconos SVG
import SunIcon from "../icons/sun.svg";
import GooglePlayBadge from "../icons/disponible-en-google-play-badge.png";

export default function AppPromo() {
  // Función para manejar el clic en el botón de descarga
  const handleDownloadClick = () => {
    // Aquí irá el enlace real a Google Play Store
    const googlePlayUrl = "https://play.google.com/apps/testing/com.edwin_antonio.proyectosoliv1";
    window.open(googlePlayUrl, "_blank");
  };

  return (
    <section id="app-promo" className="app-promo-section">
      <div className="app-promo-container">
        
        {/* Contenido principal */}
        <div className="app-promo-content">
          
          {/* COLUMNA 1: Información de la app */}
          <div className="app-promo-info">
            <div className="app-promo-header">
              <div className="app-promo-logo">
                <img src={SunIcon} alt="Soli App" className="app-promo-logo-icon" />
              </div>
              <h2 className="app-promo-title">
                Lleva <span className="app-promo-accent">Soli</span> contigo
              </h2>
              <p className="app-promo-description">
                Descarga nuestra app móvil y disfruta de tu biblioteca personal 
                en cualquier lugar. Lee, descubre y explora miles de libros 
                desde la palma de tu mano.
              </p>
            </div>

            {/* Características de la app */}
            <div className="app-promo-features">
              <div className="app-promo-feature">
                <div className="app-promo-feature-icon">📖</div>
                <div className="app-promo-feature-content">
                  <h3 className="app-promo-feature-title">Lectura offline</h3>
                  <p className="app-promo-feature-description">
                    Descarga tus libros favoritos y léelos sin conexión
                  </p>
                </div>
              </div>

              <div className="app-promo-feature">
                <div className="app-promo-feature-icon">🔄</div>
                <div className="app-promo-feature-content">
                  <h3 className="app-promo-feature-title">Sincronización total</h3>
                  <p className="app-promo-feature-description">
                    Tu progreso se sincroniza entre todos tus dispositivos
                  </p>
                </div>
              </div>

              <div className="app-promo-feature">
                <div className="app-promo-feature-icon">🌙</div>
                <div className="app-promo-feature-content">
                  <h3 className="app-promo-feature-title">Modo nocturno</h3>
                  <p className="app-promo-feature-description">
                    Cuida tus ojos con nuestro modo de lectura nocturna
                  </p>
                </div>
              </div>

            </div>

            {/* Botón de descarga */}
            <div className="app-promo-download">
              <div 
                onClick={handleDownloadClick}
                className="app-promo-google-play-button"
              >
                <img 
                  src={GooglePlayBadge} 
                  alt="Disponible en Google Play" 
                  className="app-promo-google-play-image"
                />
              </div>

              <p className="app-promo-download-note">
                Gratis • Compatible con Android 6.0+
              </p>
            </div>
          </div>

          {/* COLUMNA 2: Mockup del teléfono */}
          <div className="app-promo-visual">
            <div className="app-promo-phone">
              <div className="app-promo-phone-frame">
                <div className="app-promo-phone-screen">
                  
                  {/* Header de la app */}
                  <div className="app-promo-screen-header">
                    <div className="app-promo-screen-logo">
                      <img src={SunIcon} alt="Soli" className="app-promo-screen-logo-icon" />
                      <span className="app-promo-screen-title">Soli</span>
                    </div>
                    <div className="app-promo-screen-user">👤</div>
                  </div>

                  {/* Contenido de la app */}
                  <div className="app-promo-screen-content">
                    <div className="app-promo-screen-section">
                      <h3 className="app-promo-screen-section-title">Leyendo ahora</h3>
                      <div className="app-promo-screen-book">
                        <div className="app-promo-screen-book-cover">📚</div>
                        <div className="app-promo-screen-book-info">
                          <p className="app-promo-screen-book-title">Cien años de soledad</p>
                          <p className="app-promo-screen-book-author">Gabriel García Márquez</p>
                          <div className="app-promo-screen-progress">
                            <div className="app-promo-screen-progress-bar">
                              <div className="app-promo-screen-progress-fill"></div>
                            </div>
                            <span className="app-promo-screen-progress-text">68%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="app-promo-screen-section">
                      <h3 className="app-promo-screen-section-title">Recomendados</h3>
                      <div className="app-promo-screen-books">
                        <div className="app-promo-screen-book-mini">📖</div>
                        <div className="app-promo-screen-book-mini">📘</div>
                        <div className="app-promo-screen-book-mini">📗</div>
                        <div className="app-promo-screen-book-mini">📙</div>
                      </div>
                    </div>
                  </div>

                  {/* Footer de navegación */}
                  <div className="app-promo-screen-nav">
                    <div className="app-promo-screen-nav-item active">🏠</div>
                    <div className="app-promo-screen-nav-item">🔍</div>
                    <div className="app-promo-screen-nav-item">📚</div>
                    <div className="app-promo-screen-nav-item">👤</div>
                  </div>

                </div>
              </div>
            </div>

            {/* Elementos decorativos */}
            <div className="app-promo-decorations">
              <div className="app-promo-decoration app-promo-decoration-1">✨</div>
              <div className="app-promo-decoration app-promo-decoration-2">📖</div>
              <div className="app-promo-decoration app-promo-decoration-3">💫</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
