import "./LoadingScreen.css";

// Importar el icono del sol
import SunIcon from "../icons/sun.svg";

// Tipo para las props del LoadingScreen
type LoadingScreenProps = {
  isVisible: boolean;
  message?: string; // Mensaje personalizable
};

export default function LoadingScreen({ isVisible, message = "Cargando..." }: LoadingScreenProps) {
  // Si no está visible, no renderizar nada
  if (!isVisible) {
    return null;
  }

  return (
    <div className="loading-screen">
      <div className="loading-content">
        {/* Sol animado */}
        <div className="loading-spinner">
          <img 
            src={SunIcon} 
            alt="Loading" 
            className="loading-sun-icon"
          />
        </div>
        
        {/* Mensaje de carga */}
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
}