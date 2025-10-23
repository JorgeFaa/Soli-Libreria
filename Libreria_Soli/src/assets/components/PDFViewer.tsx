import { useState, useEffect } from "react";
import "./PDFViewer.css";

// Importar componente Toast
import Toast from "./Toast";

interface PDFViewerProps {
  pdfUrl: string;
  bookTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PDFViewer({ pdfUrl, bookTitle, isOpen, onClose }: PDFViewerProps) {
  // Estados para manejar el visor
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

  // Función para cerrar el visor
  const handleClose = () => {
    setIsLoading(true);
    setError("");
    onClose();
  };

  // Función para abrir en nueva pestaña como alternativa
  const handleOpenExternal = () => {
    window.open(pdfUrl, '_blank');
    showNotification("Abriendo PDF en nueva pestaña", "success");
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
        
        {/* Header del visor */}
        <div className="pdf-viewer-header">
          <div className="pdf-viewer-title">
            <h3>📖 {bookTitle}</h3>
          </div>
          <div className="pdf-viewer-controls">
            <button 
              className="pdf-button-external"
              onClick={handleOpenExternal}
              title="Abrir en nueva pestaña"
            >
              🔗 Externa
            </button>
            <button 
              className="pdf-button-close"
              onClick={handleClose}
              title="Cerrar visor"
            >
              ✕ Cerrar
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
                <button onClick={handleOpenExternal} className="pdf-button-retry">
                  🔗 Abrir en nueva pestaña
                </button>
                <button onClick={handleClose} className="pdf-button-cancel">
                  Cerrar
                </button>
              </div>
            </div>
          )}
          
          {/* PDF Iframe */}
          {!error && (
            <iframe
              src={pdfUrl}
              title={`PDF: ${bookTitle}`}
              className="pdf-iframe"
              onLoad={handlePDFLoad}
              onError={handlePDFError}
              allowFullScreen
            />
          )}
        </div>

        {/* Instrucciones */}
        <div className="pdf-viewer-footer">
          <p className="pdf-instructions">
            💡 Usa los controles del navegador para navegar por el PDF • Presiona ESC para cerrar • Abre en nueva pestaña para mejor experiencia
          </p>
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
    </div>
  );
}