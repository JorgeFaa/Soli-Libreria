import "./Nosotros.css";

// Importación de iconos SVG
import BookOpenIcon from "../icons/book-open.svg";
import StarIcon from "../icons/star.svg";
import SunIcon from "../icons/sun.svg";

// Sección Nosotros

export default function Nosotros() {
    return (
        <section id="nosotros" className="nosotros-section">
            <div className="nosotros-container">
                
                {/* Header de la sección */}
                <div className="nosotros-header">
                    <div className="nosotros-badge">
                        <img src={BookOpenIcon} alt="Libro" className="nosotros-badge-icon" />
                        Nuestra Historia
                    </div>
                    
                    <h2 className="nosotros-title">
                        Conoce
                        <span className="nosotros-title-accent"> Soli</span>
                    </h2>
                    
                    <p className="nosotros-description">
                        Más que una librería, somos un espacio donde las historias cobran vida 
                        y cada libro encuentra su lector perfecto.
                    </p>
                </div>

                {/* Contenido principal */}
                <div className="nosotros-content">
                    
                    {/* Historia */}
                    <div className="nosotros-story">
                        <h3 className="nosotros-story-title">Nuestra Misión</h3>
                        <p className="nosotros-story-text">
                            En Soli creemos que cada libro tiene el poder de iluminar, inspirar y transformar. 
                            Desde 2025, nos dedicamos a crear un refugio literario donde biblióficos y lectores 
                            ocasionales encuentran exactamente lo que buscan, y a veces, lo que no sabían que necesitaban.
                        </p>
                        <p className="nosotros-story-text">
                            Nuestro equipo de apasionados por la literatura cura cuidadosamente cada título, 
                            desde bestsellers contemporáneos hasta joyas literarias descatalogadas, 
                            asegurándonos de que cada visita sea una nueva aventura de descubrimiento.
                        </p>
                    </div>

                    {/* Valores */}
                    <div className="nosotros-values">
                        <h3 className="nosotros-values-title">Lo que nos mueve</h3>
                        <div className="nosotros-values-grid">
                            
                            <div className="nosotros-value">
                                <div className="nosotros-value-icon">
                                    <img src={SunIcon} alt="Pasión" />
                                </div>
                                <h4 className="nosotros-value-title">Pasión por los libros</h4>
                                <p className="nosotros-value-text">
                                    Cada recomendación viene del corazón. Amamos lo que hacemos 
                                    y se nota en cada interacción.
                                </p>
                            </div>

                            <div className="nosotros-value">
                                <div className="nosotros-value-icon">
                                    <img src={StarIcon} alt="Calidad" />
                                </div>
                                <h4 className="nosotros-value-title">Calidad garantizada</h4>
                                <p className="nosotros-value-text">
                                    Seleccionamos cuidadosamente cada título para asegurar 
                                    la mejor experiencia de lectura.
                                </p>
                            </div>

                            <div className="nosotros-value">
                                <div className="nosotros-value-icon">
                                    <img src={BookOpenIcon} alt="Conocimiento" />
                                </div>
                                <h4 className="nosotros-value-title">Conocimiento compartido</h4>
                                <p className="nosotros-value-text">
                                    Creemos que el conocimiento crece cuando se comparte. 
                                    Estamos aquí para guiarte en tu viaje literario.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}