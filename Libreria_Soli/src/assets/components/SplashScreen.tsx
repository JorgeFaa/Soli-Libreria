import React, { useEffect, useState } from 'react';
import './SplashScreen.css';
import soliLogo from '../../public/soli-logo.svg';

const SplashScreen: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="splash-container">
      <img src={soliLogo} alt="Soli Logo" className="splash-logo" />
      <div className="splash-text">Cargando...</div>
    </div>
  );
};

export default SplashScreen;
