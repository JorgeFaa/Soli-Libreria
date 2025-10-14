import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./LibroDetalle.css";

// Importar el servicio de libros
import { getBookById } from "../../services/booksService";
import type { Book } from "../../services/booksService";

// Importar componente Toast
import Toast from "./Toast";

// Importar el visor de PDF
import PDFViewer from "./PDFViewer";

// Ya no necesitamos datos simulados - obtenemos todo de la API

export default function LibroDetalle() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // Estados para manejar el libro y loading
    const [libro, setLibro] = useState<Book | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    
    // Estados para Toast
    const [toastMessage, setToastMessage] = useState<string>("");
    const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");
    const [showToast, setShowToast] = useState<boolean>(false);
    
    // Estado para el visor de PDF
    const [showPDFViewer, setShowPDFViewer] = useState<boolean>(false);
    
    // Función para mostrar notificaciones
    const showNotification = (message: string, type: "success" | "error" | "warning") => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };
    
    // Cargar libro al montar el componente
    useEffect(() => {
        const cargarLibro = async () => {
            try {
                if (!id) {
                    throw new Error("ID de libro no válido");
                }
                
                setIsLoading(true);
                setError("");
                console.log("📖 Cargando libro con ID:", id);
                
                const libroApi = await getBookById(parseInt(id));
                
                if (!libroApi) {
                    throw new Error("Libro no encontrado");
                }
                
                console.log("✅ Libro cargado exitosamente:", libroApi.titulo);
                setLibro(libroApi);
                
            } catch (err) {
                console.error("🔥 Error cargando libro:", err);
                
                if (err instanceof Error) {
                    if (err.message.includes('Token expirado') || err.message.includes('No hay token')) {
                        setError("Sesión expirada. Redirigiendo al login...");
                        showNotification("Sesión expirada. Por favor, inicia sesión nuevamente.", "error");
                        
                        setTimeout(() => {
                            navigate("/login");
                        }, 2000);
                    } else {
                        setError(err.message);
                        showNotification(`Error: ${err.message}`, "error");
                    }
                } else {
                    setError("Error desconocido al cargar el libro.");
                    showNotification("Error desconocido al cargar el libro.", "error");
                }
            } finally {
                setIsLoading(false);
            }
        };
        
        cargarLibro();
    }, [id, navigate]);
    
    // Loading state
    if (isLoading) {
        return (
            <section className="libro-detalle-section">
                <div className="libro-detalle-container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Cargando libro...</p>
                    </div>
                </div>
            </section>
        );
    }
    
    // Error state
    if (error || !libro) {
        return (
            <section className="libro-detalle-section">
                <div className="libro-detalle-container">
                    <div className="libro-no-encontrado">
                        <h1>📚 Libro no encontrado</h1>
                        <p>{error || "El libro que buscas no existe o ha sido removido."}</p>
                        <button 
                            onClick={() => navigate('/libreria')}
                            className="boton-volver"
                        >
                            Volver al catálogo
                        </button>
                    </div>
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

    return (
        <section className="libro-detalle-section">
            <div className="libro-detalle-container">
                
                {/* Botón para volver */}
                <button 
                    onClick={() => navigate('/libreria')}
                    className="boton-volver-arriba"
                >
                    ← Volver al catálogo
                </button>

                <div className="libro-detalle-grid">
                    
                    {/* Columna izquierda - Portada */}
                    <div className="libro-portada-grande">
                        {libro.portada ? (
                            <img 
                                src={libro.portada} 
                                alt={`Portada de ${libro.titulo}`}
                                className="portada-imagen"
                                onError={(e) => {
                                    // Fallback si la imagen no carga
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div 
                            className="portada-placeholder"
                            style={{ display: libro.portada ? 'none' : 'flex' }}
                        >
                            <div className="portada-titulo">
                                {libro.titulo}
                            </div>
                            <div className="portada-autor">
                                {libro.autor}
                            </div>
                        </div>
                    </div>

                    {/* Columna derecha - Información */}
                    <div className="libro-info">
                        <div className="libro-header">
                            <h1 className="libro-titulo-grande">{libro.titulo}</h1>
                            <p className="libro-autor-grande">por {libro.autor}</p>
                            <div className="libro-meta">
                                <span className="meta-item">
                                    <strong>Año:</strong> {libro.año}
                                </span>
                                <span className="meta-item">
                                    <strong>Género:</strong> {libro.genero}
                                </span>
                                <span className="meta-item">
                                    <strong>Páginas:</strong> {libro.paginas}
                                </span>
                                <span className="meta-item">
                                    <strong>Idioma:</strong> {libro.idioma}
                                </span>
                            </div>
                        </div>

                        <div className="libro-descripcion">
                            <h3>Descripción</h3>
                            <p>{libro.descripcion}</p>
                        </div>

                        <div className="libro-sinopsis">
                            <h3>Sinopsis</h3>
                            <p>{libro.sinopsis}</p>
                        </div>

                        <div className="libro-detalles">
                            <h3>Detalles del libro</h3>
                            <div className="detalles-grid">
                                <div className="detalle-item">
                                    <strong>ISBN:</strong>
                                    <span>{libro.isbn}</span>
                                </div>
                                <div className="detalle-item">
                                    <strong>Editorial:</strong>
                                    <span>{libro.editorial}</span>
                                </div>
                                <div className="detalle-item">
                                    <strong>Páginas:</strong>
                                    <span>{libro.paginas}</span>
                                </div>
                                <div className="detalle-item">
                                    <strong>Año de publicación:</strong>
                                    <span>{libro.año}</span>
                                </div>
                            </div>
                        </div>

                        <div className="libro-acciones">
                            <button 
                                className="boton-leer"
                                onClick={() => {
                                    if (libro.textUrl) {
                                        setShowPDFViewer(true);
                                        showNotification("¡Abriendo visor de PDF!", "success");
                                    } else {
                                        showNotification("El archivo del libro no está disponible", "warning");
                                    }
                                }}
                            >
                                📖 Leer libro
                            </button>
                            <button className="boton-favorito">
                                ❤️ Añadir a favoritos
                            </button>
                            <button className="boton-compartir">
                                📤 Compartir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Visor de PDF */}
            {libro?.textUrl && (
                <PDFViewer
                    pdfUrl={libro.textUrl}
                    bookTitle={libro.titulo}
                    isOpen={showPDFViewer}
                    onClose={() => setShowPDFViewer(false)}
                />
            )}
            
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