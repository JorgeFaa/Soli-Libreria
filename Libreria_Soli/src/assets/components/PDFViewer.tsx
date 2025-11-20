import { useState, useEffect } from "react";
import "./PDFViewer.css";

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
  // Estados para manejar el visor
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  
  // Estados para progreso de lectura
  const [currentProgress, setCurrentProgress] = useState<ReadingProgress | null>(null);
  const [pdfUrlWithPage, setPdfUrlWithPage] = useState<string>(pdfUrl);
  const [iframeKey, setIframeKey] = useState<number>(0); // Para forzar recarga del iframe
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);
  
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
      setPdfUrlWithPage(pdfUrl);
      loadCurrentProgress();
    }
  }, [isOpen, bookId]);

  const loadCurrentProgress = async () => {
    try {
      const progress = await getBookReadingProgress(bookId);
      setCurrentProgress(progress);
      if (progress && progress.lastPage > 1) {
        setManualPage(progress.lastPage.toString());
        
        // Intentar múltiples formatos para navegación a página específica
        console.log('📖 Progreso encontrado:', formatReadingProgress(progress));
        
        // Formato 1: URL con fragmento #page=
        let urlWithPage = `${pdfUrl}#page=${progress.lastPage}`;
        
        // Formato 2: Algunos visores PDF usan #nameddest=page
        // urlWithPage = `${pdfUrl}#nameddest=page=${progress.lastPage}`;
        
        // Formato 3: Algunos usan &page=
        if (pdfUrl.includes('?')) {
          urlWithPage = `${pdfUrl}&page=${progress.lastPage}`;
        }
        
        console.log('🔗 URL generada:', urlWithPage);
        
        setPdfUrlWithPage(urlWithPage);
        setIframeKey(prev => prev + 1);
        
        showNotification(`Abriendo en página ${progress.lastPage}...`, "success");
        
        // Retraso adicional para asegurar que el iframe navegue correctamente
        setTimeout(() => {
          if (iframeRef) {
            try {
              // Intentar navegar programáticamente si es posible
              const newSrc = urlWithPage;
              if (iframeRef.src !== newSrc) {
                iframeRef.src = newSrc;
              }
            } catch (error) {
              console.log('No se pudo navegar programáticamente:', error);
            }
          }
        }, 1000);
        
      } else {
        // Si no hay progreso o está en página 1, usar URL original
        setPdfUrlWithPage(pdfUrl);
        setIframeKey(prev => prev + 1);
        console.log('📖 Sin progreso previo o en página 1, iniciando normalmente');
      }
    } catch (error) {
      console.error('Error al cargar progreso:', error);
      // En caso de error, usar URL original
      setPdfUrlWithPage(pdfUrl);
      setIframeKey(prev => prev + 1);
    }
  };

  // Función simplificada para guardar progreso - Siempre pregunta al usuario
  const saveProgressAutomatically = () => {
    console.log('💬 Mostrando modal para confirmar página actual');
    // Siempre mostrar el modal para que el usuario confirme la página
    setManualPage((currentProgress?.lastPage || 1).toString());
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

  // Función para manejar cuando el PDF se carga exitosamente
  const handlePDFLoad = () => {
    setIsLoading(false);
    setError("");
  };

  // Función para manejar errores al cargar el PDF
  const handlePDFError = () => {
    setIsLoading(false);
    setError("No se pudo cargar el archivo PDF");
    showNotification("Error al cargar el PDF. Intenta nuevamente.", "error");
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
            {/* Botón para ir a página guardada si hay progreso */}
            {currentProgress && currentProgress.lastPage > 1 && (
              <button 
                className="goto-saved-page-btn"
                onClick={() => {
                  const urlWithPage = `${pdfUrl}#page=${currentProgress.lastPage}`;
                  if (iframeRef) {
                    iframeRef.src = urlWithPage;
                    setIframeKey(prev => prev + 1);
                  }
                  showNotification(`Navegando a página ${currentProgress.lastPage}`, "success");
                }}
                title={`Ir a página ${currentProgress.lastPage}`}
              >
                📄 Página {currentProgress.lastPage}
              </button>
            )}

            <button 
              className="pdf-button-close"
              onClick={handleClose}
              title="Cerrar y guardar progreso"
            >
              💾 Cerrar
            </button>
          </div>
        </div>

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
              <h4>Error al cargar el PDF</h4>
              <p>{error}</p>
              <div className="pdf-error-actions">
                <button onClick={handleClose} className="pdf-button-cancel">
                  Cerrar
                </button>
              </div>
            </div>
          )}
          
          {/* PDF Iframe */}
          {!error && (
            <iframe
              key={iframeKey}
              ref={setIframeRef}
              src={pdfUrlWithPage}
              title={`PDF: ${bookTitle}`}
              className="pdf-iframe"
              onLoad={handlePDFLoad}
              onError={handlePDFError}
              allowFullScreen
            />
          )}
        </div>

        {/* Instrucciones */}
        {showInstructions && (
          <div className="pdf-viewer-footer">
            <div className="pdf-instructions-content">
              <p className="pdf-instructions">
                💡 Usa los controles del navegador para navegar • <strong>Al cerrar te preguntaremos en qué página te quedaste</strong> • 
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