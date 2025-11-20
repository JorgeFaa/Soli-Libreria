import { useState, useEffect, useMemo } from "react";
import "./PDFViewer.css";

// Importar react-pdf para visor móvil
import { Document, Page, pdfjs } from 'react-pdf';

// Configurar worker de PDF.js usando unpkg CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Importar servicios
import Toast from "./Toast";
import { 
  updateReadingProgress, 
  getBookReadingProgress, 
  formatReadingProgress,
  type ReadingProgress 
} from "../../services/readingProgressService";

interface PDFViewerProps {
  pdfUrl: string;
  bookTitle: string;
  bookId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function PDFViewer({ pdfUrl, bookTitle, bookId, isOpen, onClose }: PDFViewerProps) {
  // Función para convertir URL de Google Storage a URL del proxy local
  const getProxiedPdfUrl = (url: string): string => {
    // Si la URL es de Google Storage, usar el proxy
    if (url.includes('storage.googleapis.com/soli_books_pdf')) {
      const filename = url.split('/').pop();
      return `/pdf-proxy/${filename}`;
    }
    // Si es otra URL, devolverla tal cual
    return url;
  };
  
  // Detectar si es móvil
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Estados para manejar el visor
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  
  // Estados para react-pdf (móvil)
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  
  // Estados para progreso de lectura
  const [currentProgress, setCurrentProgress] = useState<ReadingProgress | null>(null);
  
  // Detectar dispositivo móvil al montar el componente
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Memoizar las opciones de react-pdf para evitar re-renders innecesarios
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  }), []);
  
  // Memoizar el objeto file para react-pdf
  const pdfFile = useMemo(() => ({
    url: getProxiedPdfUrl(pdfUrl),
    httpHeaders: {
      'Accept': 'application/pdf',
    },
    withCredentials: false,
  }), [pdfUrl]);
  
  // Estados para Toast
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");
  const [showToast, setShowToast] = useState<boolean>(false);
  
  // Estado para controlar visibilidad de instrucciones
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  
  // Estado para entrada de página cuando no se detecta automáticamente
  const [showPageInput, setShowPageInput] = useState<boolean>(false);
  const [manualPage, setManualPage] = useState<string>("");
  const [pageError, setPageError] = useState<string>("");
  
  // Función para mostrar notificaciones
  const showNotification = (message: string, type: "success" | "error" | "warning") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Cargar progreso actual al abrir el visor
  useEffect(() => {
    if (isOpen && bookId) {
      // Resetear estado al abrir
      setIsLoading(true);
      setError("");
      loadCurrentProgress();
    }
  }, [isOpen, bookId]);

  const loadCurrentProgress = async () => {
    try {
      const progress = await getBookReadingProgress(bookId);
      setCurrentProgress(progress);
      if (progress && progress.lastPage > 1) {
        setManualPage(progress.lastPage.toString());
        setPageNumber(progress.lastPage); // Establecer página actual para react-pdf
        
        console.log('📖 Progreso encontrado:', formatReadingProgress(progress));
        showNotification(`Abriendo en página ${progress.lastPage}...`, "success");
        
      } else {
        // Si no hay progreso o está en página 1, iniciar en página 1
        setPageNumber(1);
        console.log('📖 Sin progreso previo o en página 1, iniciando normalmente');
      }
    } catch (error) {
      console.error('Error al cargar progreso:', error);
      // En caso de error, iniciar en página 1
      setPageNumber(1);
    }
  };

  // Función simplificada para guardar progreso - Siempre pregunta al usuario
  const saveProgressAutomatically = () => {
    console.log('💬 Mostrando modal para confirmar página actual');
    // Usar pageNumber directamente ya que ahora usamos react-pdf en todas las plataformas
    setManualPage(pageNumber.toString());
    setPageError("");
    setShowPageInput(true);
  };

  // Función para realizar el guardado
  const performSave = async (pageNumber: number) => {
    try {
      if (bookId && pageNumber > 0) {
        await updateReadingProgress(bookId, pageNumber);
        showNotification(`Progreso guardado - Página ${pageNumber}`, "success");
        onClose(); // Cerrar después de guardar
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      showNotification('Error al guardar el progreso', "error");
    }
  };

  // Función para manejar cambios en el input de página
  const handlePageChange = (value: string) => {
    setManualPage(value);
    setPageError(""); // Limpiar error cuando el usuario escribe
  };

  // Función para confirmar página manual con validaciones
  const confirmManualPage = () => {
    const pageNumber = parseInt(manualPage.trim());
    
    // Validaciones
    if (!manualPage.trim()) {
      setPageError("Debes ingresar un número de página");
      return;
    }
    
    if (isNaN(pageNumber)) {
      setPageError("Debes ingresar un número válido");
      return;
    }
    
    if (pageNumber < 1) {
      setPageError("La página debe ser mayor a 0");
      return;
    }
    
    // Si todas las validaciones pasan, guardar
    setShowPageInput(false);
    performSave(pageNumber);
  };

  // Función para cancelar entrada manual
  const cancelManualPage = () => {
    setShowPageInput(false);
    onClose(); // Cerrar sin guardar
  };



  // Funciones para react-pdf (móvil)
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError("");
    console.log(`📄 PDF cargado: ${numPages} páginas`);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error al cargar PDF:', error);
    setIsLoading(false);
    
    // Si es error de CORS, ofrecer abrir en nueva pestaña
    if (error.message.includes('fetch') || error.message.includes('CORS')) {
      setError("CORS");
    } else {
      setError("No se pudo cargar el archivo PDF");
    }
    showNotification("Error al cargar el PDF. Intenta abrirlo en una nueva pestaña.", "error");
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || prev));
  };



  // Función mejorada para cerrar el visor
  const handleClose = () => {
    saveProgressAutomatically();
  };

  // Manejar tecla ESC para cerrar
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="pdf-viewer-overlay">
      <div className="pdf-viewer-container">
        
        {/* Header del visor con información y cierre */}
        <div className="pdf-viewer-header">
          <div className="pdf-viewer-title">
            <h3>📖 {bookTitle}</h3>
            {currentProgress && (
              <p className="pdf-progress-info">
                <strong>Te preguntaremos en qué página te quedaste al cerrar</strong>
              </p>
            )}
          </div>

          <div className="pdf-header-actions">
            <button 
              className="pdf-button-close"
              onClick={handleClose}
              title="Cerrar y guardar progreso"
            >
              💾 Cerrar
            </button>
          </div>
        </div>

        {/* Controles de navegación - Justo debajo del header */}
        {!error && numPages && (
          <div className="pdf-mobile-controls">
            <button 
              onClick={goToPrevPage} 
              disabled={pageNumber <= 1}
              className="pdf-mobile-btn prev"
            >
              ◀ Anterior
            </button>
            
            <div className="pdf-mobile-page-info">
              <span className="current-page">{pageNumber}</span>
              <span className="page-separator">/</span>
              <span className="total-pages">{numPages}</span>
            </div>
            
            <button 
              onClick={goToNextPage} 
              disabled={pageNumber >= numPages}
              className="pdf-mobile-btn next"
            >
              Siguiente ▶
            </button>
          </div>
        )}

        {/* Contenido del visor */}
        <div className="pdf-viewer-content">
          
          {/* Loading State */}
          {isLoading && (
            <div className="pdf-loading">
              <div className="pdf-loading-spinner"></div>
              <p>Cargando PDF...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && !isLoading && (
            <div className="pdf-error">
              <div className="pdf-error-icon">📄</div>
              {error === "CORS" ? (
                <>
                  <h4>No se puede mostrar el PDF aquí</h4>
                  <p>Por restricciones de seguridad (CORS), el PDF no se puede cargar directamente en esta vista.</p>
                  <div className="pdf-error-actions">
                    <button 
                      onClick={() => window.open(pdfUrl, '_blank')}
                      className="pdf-button-primary"
                      style={{ marginRight: '10px' }}
                    >
                      📖 Abrir PDF en Nueva Pestaña
                    </button>
                    <button onClick={() => { setError(""); onClose(); }} className="pdf-button-cancel">
                      Cerrar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h4>Error al cargar el PDF</h4>
                  <p>{error}</p>
                  <div className="pdf-error-actions">
                    <button onClick={handleClose} className="pdf-button-cancel">
                      Cerrar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* PDF Viewer - Diferente para móvil y desktop */}
          {!error && (
            <>
              {/* Visor unificado - Usa react-pdf con URL proxiada */}
              <div className={isMobile ? "pdf-mobile-container" : "pdf-desktop-container"}>
                <Document
                  file={pdfFile}
                  options={pdfOptions}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="pdf-loading">
                      <div className="pdf-loading-spinner"></div>
                      <p>Cargando PDF...</p>
                    </div>
                  }
                  className={isMobile ? "pdf-mobile-document" : "pdf-desktop-document"}
                >
                  <Page
                    pageNumber={pageNumber}
                    width={isMobile ? window.innerWidth - 16 : Math.min(window.innerWidth * 0.85, 1400)}
                    className={isMobile ? "pdf-mobile-page" : "pdf-desktop-page"}
                    loading={
                      <div className="pdf-loading">
                        <div className="pdf-loading-spinner"></div>
                        <p>Cargando página {pageNumber}...</p>
                      </div>
                    }
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              </div>
            </>
          )}
        </div>

        {/* Instrucciones */}
        {showInstructions && (
          <div className="pdf-viewer-footer">
            <div className="pdf-instructions-content">
              <p className="pdf-instructions">
                💡 Usa los botones de Anterior/Siguiente para navegar • <strong>Al cerrar te preguntaremos en qué página te quedaste</strong> • 
                Presiona ESC para cerrar
              </p>
              <button 
                className="hide-instructions-btn"
                onClick={() => setShowInstructions(false)}
                title="Ocultar instrucciones"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Modal para entrada manual de página */}
        {showPageInput && (
          <div className="page-input-modal">
            <div className="page-input-content">
              <h4>📖 Guardar Progreso de Lectura</h4>
              <p><strong>¿En qué página te quedaste?</strong></p>
              <p>Esto nos ayudará a que la próxima vez abras el libro exactamente donde lo dejaste.</p>
              {currentProgress && (
                <p className="progress-hint">
                  💡 La última vez te quedaste en la página <strong>{currentProgress.lastPage}</strong>
                </p>
              )}
              
              <div className="page-input-group">
                <label htmlFor="manual-page">Página actual:</label>
                <input
                  id="manual-page"
                  type="number"
                  min="1"
                  value={manualPage}
                  onChange={(e) => handlePageChange(e.target.value)}
                  onFocus={(e) => e.target.select()} 
                  className={`manual-page-input ${pageError ? 'error' : ''}`}
                  autoFocus
                  placeholder="Ej: 5"
                />
                {pageError && (
                  <p className="page-error">{pageError}</p>
                )}
              </div>
              
              <div className="page-input-actions">
                <button onClick={confirmManualPage} className="confirm-page-btn">
                  💾 Guardar Progreso
                </button>
                <button onClick={cancelManualPage} className="cancel-page-btn">
                  ✕ Cerrar sin Guardar
                </button>
              </div>
            </div>
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
    </div>
  );
}