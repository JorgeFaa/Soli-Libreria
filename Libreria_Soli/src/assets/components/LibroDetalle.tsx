import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./LibroDetalle.css";

// Importar el servicio de libros
import { getBookById, addBookToFavorites, getFavoriteBooks } from "../../services/booksService";
import type { Book } from "../../services/booksService";

// Importar componente Toast
import Toast from "./Toast";

// Importar el visor de PDF
import PDFViewer from "./PDFViewer";

// Importar el modal de reseñas
import ReviewsModal from "./ReviewsModal";

// Importar el modal de estanterías
import AddToShelfModal from "./AddToShelfModal";


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
    
    // Estado para el modal de reseñas
    const [showReviewsModal, setShowReviewsModal] = useState<boolean>(false);
    
    // Estado para el modal de estanterías
    const [showAddToShelfModal, setShowAddToShelfModal] = useState<boolean>(false);
    
    // Estado para manejar favoritos
    const [isAddingToFavorites, setIsAddingToFavorites] = useState<boolean>(false);
    const [isInFavorites, setIsInFavorites] = useState<boolean>(false);
    const [checkingFavorites, setCheckingFavorites] = useState<boolean>(true);
    const [recentlyAdded, setRecentlyAdded] = useState<boolean>(false);
    const [showRefreshButton, setShowRefreshButton] = useState<boolean>(false);
    
    // Cache para evitar llamadas duplicadas
    const [lastFavoritesCheck, setLastFavoritesCheck] = useState<number>(0);
    const [favoritesCache, setFavoritesCache] = useState<Book[]>([]);
    const [isFetchingFavorites, setIsFetchingFavorites] = useState<boolean>(false);
    
    // Ref para evitar doble ejecución del useEffect
    const hasInitialized = useRef<boolean>(false);
    
    // Función para mostrar notificaciones
    const showNotification = (message: string, type: "success" | "error" | "warning") => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };
    
    // Función para manejar el éxito al agregar a estantería
    const handleBookAddedToShelf = (shelfName: string) => {
        showNotification(`Libro agregado exitosamente a "${shelfName}"`, "success");
    };
    
    // Función para verificar si el libro está en favoritos
    const checkIfInFavorites = async (bookId: number, forceRefresh: boolean = false) => {
        try {
            setCheckingFavorites(true);
            
            const now = Date.now();
            const timeSinceLastCheck = now - lastFavoritesCheck;
            
            // Si ya hay una llamada en proceso, esperar un poco y usar cache si existe
            if (isFetchingFavorites && !forceRefresh) {
                // Esperar un poco para que termine la otra llamada
                await new Promise(resolve => setTimeout(resolve, 100));
                if (favoritesCache.length > 0) {
                    const isAlreadyFavorite = favoritesCache.some((fav: Book) => fav.id === bookId);
                    setIsInFavorites(isAlreadyFavorite);
                    return;
                }
            }
            
            // Si ha pasado menos de 2 segundos desde la última verificación y no es un refresh forzado, usar cache
            if (!forceRefresh && timeSinceLastCheck < 2000 && favoritesCache.length > 0) {
                const isAlreadyFavorite = favoritesCache.some((fav: Book) => fav.id === bookId);
                setIsInFavorites(isAlreadyFavorite);
                return;
            }
            
            // Marcar que estamos haciendo una llamada
            setIsFetchingFavorites(true);
            
            const favorites = await getFavoriteBooks();
            
            // Actualizar cache
            setFavoritesCache(favorites);
            setLastFavoritesCheck(now);
            
            const isAlreadyFavorite = favorites.some((fav: Book) => fav.id === bookId);
            setIsInFavorites(isAlreadyFavorite);
        } catch (error) {
            // Si hay error, asumimos que no está en favoritos
            setIsInFavorites(false);
        } finally {
            setCheckingFavorites(false);
            setIsFetchingFavorites(false); // Limpiar el flag de llamada en proceso
        }
    };
    
    // Función para refrescar manualmente el estado de favoritos
    const handleRefreshFavorites = async () => {
        if (!libro) return;
        await checkIfInFavorites(libro.id, true); // Forzar refresh
        setShowRefreshButton(false);
        showNotification("Estado de favoritos actualizado", "success");
    };
    
    // Función para agregar a favoritos
    const handleAddToFavorites = async () => {
        if (!libro) return;
        
        setIsAddingToFavorites(true);
        
        try {
            await addBookToFavorites(libro.id);
            setIsInFavorites(true); // Actualizar el estado local inmediatamente
            setRecentlyAdded(true); // Marcar como recién agregado
            
            // Invalidar cache de favoritos
            setFavoritesCache([]);
            setLastFavoritesCheck(0);
            setIsFetchingFavorites(false);
            
            showNotification("¡Libro agregado a favoritos!", "success");
            
            // Re-verificar favoritos después de un delay para asegurar sincronización
            setTimeout(async () => {
                const previousState = isInFavorites;
                await checkIfInFavorites(libro.id, true); // Forzar refresh después de agregar
                setRecentlyAdded(false); // Limpiar el flag después de la verificación
                
                // Si esperábamos que estuviera en favoritos pero no está, mostrar botón de refresh
                if (previousState && !isInFavorites) {
                    setShowRefreshButton(true);
                }
            }, 1500); // Delay de 1.5 segundos para permitir que el backend procese
            
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('Token expirado') || error.message.includes('No hay token')) {
                    showNotification("Sesión expirada. Por favor, inicia sesión nuevamente.", "error");
                    setTimeout(() => {
                        navigate("/login");
                    }, 2000);
                } else {
                    showNotification(`Error: ${error.message}`, "error");
                }
            } else {
                showNotification("Error desconocido al agregar a favoritos.", "error");
            }
        } finally {
            setIsAddingToFavorites(false);
        }
    };
    
    // Cargar libro al montar el componente
    useEffect(() => {
        // Evitar doble ejecución en modo desarrollo (React Strict Mode)
        if (hasInitialized.current) {
            return;
        }
        
        const cargarLibro = async () => {
            try {
                if (!id) {
                    throw new Error("ID de libro no válido");
                }
                
                hasInitialized.current = true;
                
                setIsLoading(true);
                setError("");
                
                const libroApi = await getBookById(parseInt(id));
                
                if (!libroApi) {
                    throw new Error("Libro no encontrado");
                }
                
                setLibro(libroApi);
                
                // Verificar si está en favoritos
                await checkIfInFavorites(libroApi.id);
                
            } catch (err) {
                
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
    
    // Reset del flag cuando cambie el ID
    useEffect(() => {
        hasInitialized.current = false;
    }, [id]);
    
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
                            {libro.sinopsis && (
                                <>
                                    <h3>Sinopsis</h3>
                                    <p>{libro.sinopsis}</p>
                                </>
                            )}
                        </div>

                        <div className="libro-detalles">
                            <h3>Detalles del libro</h3>
                            <div className="detalles-grid">
                                <div className="detalle-item">
                                    <strong>ISBN:</strong>
                                {libro.isbn && (
                                    <span>{libro.isbn}</span>
                                )}
                                {!libro.isbn && (
                                    <span>No disponible</span>
                                )}
                                </div>
                                <div className="detalle-item">
                                    <strong>Editorial:</strong>
                                    <span>{libro.editorials?.[0]?.companyName || 'Editorial desconocida'}</span>
                                </div>
                                <div className="detalle-item">
                                    <strong>Páginas:</strong>
                                    <span>{libro.paginas || 'No especificado'}</span>
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
                                    if (libro.pdfUrl) {
                                        setShowPDFViewer(true);
                                    } else {
                                        showNotification("El archivo PDF del libro no está disponible", "warning");
                                    }
                                }}
                            >
                                📖 Leer libro
                            </button>
                            <button 
                                className={`boton-favorito ${(isInFavorites || recentlyAdded) ? 'favorito-activo' : ''}`}
                                onClick={handleAddToFavorites}
                                disabled={isAddingToFavorites || isInFavorites || checkingFavorites || recentlyAdded}
                                title={
                                    recentlyAdded ? "Sincronizando con el servidor..." :
                                    isInFavorites ? "Ya está en tus favoritos" : "Añadir a favoritos"
                                }
                            >
                                {checkingFavorites ? "⏳ Verificando..." : 
                                 isAddingToFavorites ? "⏳ Agregando..." : 
                                 recentlyAdded ? "🔄 Sincronizando..." :
                                 isInFavorites ? "✅ En favoritos" : "❤️ Añadir a favoritos"}
                            </button>
                            {showRefreshButton && (
                                <button 
                                    className="boton-refresh-favoritos"
                                    onClick={handleRefreshFavorites}
                                    title="Actualizar estado de favoritos"
                                >
                                    🔄 Actualizar
                                </button>
                            )}
                            <button 
                                className="boton-shelf"
                                onClick={() => setShowAddToShelfModal(true)}
                                title="Agregar a estantería"
                            >
                                📚 Agregar a estantería
                            </button>
                            <button 
                                className="boton-reviews"
                                onClick={() => setShowReviewsModal(true)}
                            >
                                📝 Ver reseñas
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Modal de reseñas */}
            <ReviewsModal
                bookId={libro.id}
                bookTitle={libro.titulo || libro.title || 'Libro sin título'}
                isOpen={showReviewsModal}
                onClose={() => setShowReviewsModal(false)}
            />
            
            {/* Modal para agregar a estantería */}
            <AddToShelfModal
                isOpen={showAddToShelfModal}
                bookId={libro.id}
                bookTitle={libro.titulo || libro.title || 'Libro sin título'}
                onClose={() => setShowAddToShelfModal(false)}
                onBookAdded={handleBookAddedToShelf}
            />
            
            {/* Visor de PDF */}
            {libro?.pdfUrl && (
                <PDFViewer
                    pdfUrl={libro.pdfUrl}
                    bookTitle={libro.titulo || libro.title || 'Libro sin título'}
                    bookId={libro.id}
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