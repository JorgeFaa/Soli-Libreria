import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Libreria.css";

// Importar el servicio de libros
import { getBooks } from "../../services/booksService";
import type { Book } from "../../services/booksService";

// Importar servicio de progreso de lectura
import { getUserReadingProgress, type ReadingProgress } from "../../services/readingProgressService";

// Importar componente Toast para notificaciones
import Toast from "./Toast";

// Configuración de paginación
const LIBROS_POR_PAGINA = 8;

export default function Libreria() {
    const navigate = useNavigate();
    
    // Estados para manejar los libros y loading
    const [libros, setLibros] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    
    // Estados para paginación
    const [paginaActual, setPaginaActual] = useState<number>(1);
    const [totalPaginas, setTotalPaginas] = useState<number>(1);
    
    // Estados para progreso de lectura
    const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
    
    // Estados para Toast
    const [toastMessage, setToastMessage] = useState<string>("");
    const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");
    const [showToast, setShowToast] = useState<boolean>(false);
    
    // Función para mostrar notificaciones
    const showNotification = (message: string, type: "success" | "error" | "warning") => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    // Calcular libros para la página actual
    const obtenerLibrosPaginaActual = () => {
        const inicio = (paginaActual - 1) * LIBROS_POR_PAGINA;
        const fin = inicio + LIBROS_POR_PAGINA;
        return libros.slice(inicio, fin);
    };

    // Función para cambiar página
    const cambiarPagina = (nuevaPagina: number) => {
        setPaginaActual(nuevaPagina);
        // Scroll suave hacia arriba
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Obtener progreso de un libro específico
    const getBookProgress = (bookId: number): ReadingProgress | undefined => {
        return readingProgress.find(progress => progress.bookId === bookId);
    };

    // Cargar progreso de lectura
    const loadReadingProgress = async () => {
        try {
            const progress = await getUserReadingProgress();
            setReadingProgress(progress);
        } catch (error) {
            console.error('Error al cargar progreso de lectura:', error);
            // No mostrar error al usuario, es información opcional
        }
    };
    
    // Cargar libros al montar el componente
    useEffect(() => {
        const cargarLibros = async () => {
            try {
                setIsLoading(true);
                setError("");
                
                const librosApi = await getBooks();
                
                setLibros(librosApi);
                
                // Calcular total de páginas
                setTotalPaginas(Math.ceil(librosApi.length / LIBROS_POR_PAGINA));
                
                // Cargar progreso de lectura
                await loadReadingProgress();
                
                if (librosApi.length === 0) {
                    showNotification("No se encontraron libros en la biblioteca", "warning");
                }
                
            } catch (err) {
                if (err instanceof Error) {
                    if (err.message.includes('Token expirado') || err.message.includes('No hay token')) {
                        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
                        showNotification("Sesión expirada. Redirigiendo al login...", "error");
                        
                        // Redirigir al login después de un delay
                        setTimeout(() => {
                            navigate("/login");
                        }, 2000);
                    } 
                } 
            } finally {
                setIsLoading(false);
            }
        };
        
        cargarLibros();
    }, [navigate]);
    
    const handleSeleccionarLibro = (libro: Book) => {
        navigate(`/libro/${libro.id}`);
    };

    return (
        <section className="libreria-section">
            <div className="libreria-container">
                <h1 className="libreria-title">Soli-Librería</h1>
                <p className="libreria-description">
                    Descubre tu próxima gran lectura entre nuestra cuidada selección literaria
                </p>
                
                {/* Advertencia sobre navegadores */}
                <div className="browser-compatibility-notice">
                    <div className="browser-notice-content">
                        <span className="browser-notice-icon">ℹ️</span>
                        <span className="browser-notice-text">
                            <strong>Tip:</strong> Para una mejor experiencia leyendo nuestros libros, recomendamos usar 
                            <strong> Firefox</strong> o <strong>Safari</strong>. 
                            Algunos navegadores con configuraciones estrictas de privacidad pueden tener problemas mostrando ciertos archivos.
                        </span>
                    </div>
                </div>
                
                {/* Loading State */}
                {isLoading && (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Cargando biblioteca...</p>
                    </div>
                )}
                
                {/* Error State */}
                {error && !isLoading && (
                    <div className="error-container">
                        <p className="error-message">⚠️ {error}</p>
                    </div>
                )}
                
                {/* Sección de Libros */}
                {!isLoading && libros.length > 0 && (
                    <div className="seccion-biblioteca">
                        <div className="seccion-header">
                            <h2 className="seccion-titulo">📚 Biblioteca Digital</h2>
                            <p className="seccion-descripcion">
                                {libros.length} {libros.length === 1 ? 'libro disponible' : 'libros disponibles'} 
                                {error ? ' (modo de respaldo)' : ' desde nuestro catálogo'}
                            </p>
                        </div>
                        
                        {/* Grilla de libros */}
                        <div className="libros-grid">
                            {obtenerLibrosPaginaActual().map(libro => {
                                const progress = getBookProgress(libro.id);
                                return (
                                    <div 
                                        key={libro.id}
                                        className="libro-card"
                                        onClick={() => handleSeleccionarLibro(libro)}
                                    >
                                        {/* Indicador de progreso */}
                                        {progress && (
                                            <div className="libro-progress-indicator">
                                                📖 Página {progress.lastPage}
                                            </div>
                                        )}
                                        
                                        <div className="libro-portada">
                                            {libro.portada ? (
                                                <img 
                                                    src={libro.portada} 
                                                    alt={`Portada de ${libro.titulo}`}
                                                    className="libro-portada-imagen"
                                                    onError={(e) => {
                                                        // Fallback si la imagen no carga
                                                        e.currentTarget.style.display = 'none';
                                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                        if (fallback) fallback.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div 
                                                className="libro-portada-fallback"
                                                style={{ display: libro.portada ? 'none' : 'flex' }}
                                            >
                                                <div className="libro-titulo">
                                                    {libro.titulo}
                                                </div>
                                                <div className="libro-autor">
                                                    {libro.autor}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Información del libro debajo de la portada */}
                                        <div className="libro-info-externa">
                                            <h4 className="libro-titulo-externo">
                                                {libro.titulo}
                                            </h4>
                                            <p className="libro-autor-externo">
                                                {libro.autor}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Controles de paginación */}
                        {totalPaginas > 1 && (
                            <div className="paginacion">
                                <button 
                                    className="paginacion-btn" 
                                    onClick={() => cambiarPagina(paginaActual - 1)}
                                    disabled={paginaActual === 1}
                                >
                                    ← Anterior
                                </button>
                                
                                <div className="paginacion-numeros">
                                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numeroPagina => (
                                        <button
                                            key={numeroPagina}
                                            className={`paginacion-numero ${paginaActual === numeroPagina ? 'activa' : ''}`}
                                            onClick={() => cambiarPagina(numeroPagina)}
                                        >
                                            {numeroPagina}
                                        </button>
                                    ))}
                                </div>
                                
                                <button 
                                    className="paginacion-btn" 
                                    onClick={() => cambiarPagina(paginaActual + 1)}
                                    disabled={paginaActual === totalPaginas}
                                >
                                    Siguiente →
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Estado cuando no hay libros */}
                {!isLoading && libros.length === 0 && !error && (
                    <div className="no-books-container">
                        <p>📚 No hay libros disponibles en este momento.</p>
                    </div>
                )}
            </div>
            
            {/* Toast de notificaciones */}
            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    isVisible={showToast}
                    onClose={() => setShowToast(false)}
                />
            )}
        </section>
    );
}