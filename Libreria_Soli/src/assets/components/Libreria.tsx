import "./Libreria.css";

export default function Libreria() {
    return (
        <section className="libreria-section">
            <div className="libreria-container">
                <h1 className="libreria-title">Bienvenido a la Librería Soli</h1>
                <p className="libreria-description">
                    Descubre tu próxima gran lectura. Explora miles de títulos cuidadosamente 
                    seleccionados desde clásicos atemporales hasta las últimas novedades literarias.
                </p>
                
                <div className="libreria-stats">
                    <div className="libreria-stat">
                        <span className="libreria-stat-number">15,000+</span>
                        <span className="libreria-stat-label">Libros disponibles</span>
                    </div>
                    <div className="libreria-stat">
                        <span className="libreria-stat-number">50+</span>
                        <span className="libreria-stat-label">Categorías</span>
                    </div>
                    <div className="libreria-stat">
                        <span className="libreria-stat-number">2,500+</span>
                        <span className="libreria-stat-label">Autores</span>
                    </div>
                </div>

                <div className="libreria-actions">
                    <a href="#catalogo" className="libreria-button-primary">
                        Explorar Catálogo
                    </a>
                    <a href="#busqueda" className="libreria-button-secondary">
                        Búsqueda Avanzada
                    </a>
                </div>
            </div>
        </section>
    );
}