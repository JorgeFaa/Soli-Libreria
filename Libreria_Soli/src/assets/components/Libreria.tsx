import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Libreria.css";

// Importar el servicio de libros
import { getBooks } from "../../services/booksService";
import type { Book } from "../../services/booksService";

// Importar componente Toast para notificaciones
import Toast from "./Toast";

// Datos de respaldo en caso de error (mantenemos algunos libros como fallback)
const librosRespaldo: Book[] = [
    {
        id: 1,
        titulo: "Don Quijote de la Mancha",
        autor: "Miguel de Cervantes",
        año: 1605,
        genero: "Novela",
        descripcion: "La obra cumbre de la literatura española que narra las aventuras de Don Quijote y Sancho Panza.",
        portada: "https://images-na.ssl-images-amazon.com/images/I/81-ylKA1wJL.jpg"
    },
    {
        id: 2,
        titulo: "Cien Años de Soledad",
        autor: "Gabriel García Márquez",
        año: 1967,
        genero: "Realismo Mágico",
        descripcion: "La saga de la familia Buendía en el pueblo ficticio de Macondo.",
        portada: "https://images-na.ssl-images-amazon.com/images/I/71K-3e3B69L.jpg"
    },
    {
        id: 3,
        titulo: "El Principito",
        autor: "Antoine de Saint-Exupéry",
        año: 1943,
        genero: "Fábula",
        descripcion: "Un pequeño príncipe viaja por diferentes planetas y aprende sobre la vida.",
        portada: "https://images-na.ssl-images-amazon.com/images/I/51r72khRTwL.jpg"
    }
];

export default function Libreria() {
    const navigate = useNavigate();
    
    // Estados para manejar los libros y loading
    const [libros, setLibros] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    
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
    
    // Cargar libros al montar el componente
    useEffect(() => {
        const cargarLibros = async () => {
            try {
                setIsLoading(true);
                setError("");
                console.log("📚 Cargando libros de la API...");
                
                const librosApi = await getBooks();
                console.log("✅ Libros cargados exitosamente:", librosApi.length);
                
                setLibros(librosApi);
                
                if (librosApi.length === 0) {
                    showNotification("No se encontraron libros en la biblioteca", "warning");
                }
                
            } catch (err) {
                console.error("🔥 Error cargando libros:", err);
                
                if (err instanceof Error) {
                    if (err.message.includes('Token expirado') || err.message.includes('No hay token')) {
                        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
                        showNotification("Sesión expirada. Redirigiendo al login...", "error");
                        
                        // Redirigir al login después de un delay
                        setTimeout(() => {
                            navigate("/login");
                        }, 2000);
                    } else {
                        setError("Error al cargar los libros. Usando datos de respaldo.");
                        showNotification("Error de conexión. Mostrando libros de respaldo.", "warning");
                        setLibros(librosRespaldo);
                    }
                } else {
                    setError("Error desconocido al cargar libros.");
                    showNotification("Error desconocido. Mostrando libros de respaldo.", "error");
                    setLibros(librosRespaldo);
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
                <h1 className="libreria-title">Librería Soli</h1>
                <p className="libreria-description">
                    Descubre tu próxima gran lectura entre nuestra cuidada selección literaria
                </p>
                
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
                    <div className="seccion-recomendados">
                        <div className="seccion-header">
                            <h2 className="seccion-titulo">📚 Biblioteca Digital</h2>
                            <p className="seccion-descripcion">
                                {libros.length} {libros.length === 1 ? 'libro disponible' : 'libros disponibles'} 
                                {error ? ' (modo de respaldo)' : ' desde nuestro catálogo'}
                            </p>
                        </div>
                        
                        <div className="carrusel-container">
                            <div className="carrusel-libros">
                                {libros.map(libro => (
                                <div 
                                    key={libro.id}
                                    className="libro-card"
                                    onClick={() => handleSeleccionarLibro(libro)}
                                >
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
                            ))}
                        </div>
                    </div>
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