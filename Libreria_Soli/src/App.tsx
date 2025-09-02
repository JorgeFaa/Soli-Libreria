import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Header from './assets/components/Header'
import Hero from './assets/components/Hero'
import Catalogo from './assets/components/Catalogo'
import Nosotros from './assets/components/Nosotros'
import Libreria from './assets/components/Libreria'
import Login from './assets/components/Login'
import Registro from './assets/components/Registro'
import Perfil from './assets/components/Perfil'

import './App.css'

// Página principal con Hero, Catálogo y Nosotros
function HomePage() {
  return (
    <>
      <Hero />
      <Catalogo />
      <Nosotros />
    </>
  );
}

function App() {
  // Estado global de autenticación
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);

  // Función para manejar el login exitoso
  const handleLoginSuccess = () => {
    setIsUserLoggedIn(true);
  };

  // Función para manejar el logout
  const handleLogout = () => {
    setIsUserLoggedIn(false);
  };

  return (
    <Router>
      <Header 
        isUserLoggedIn={isUserLoggedIn} 
        onLogout={handleLogout}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/libreria" element={<Libreria />} />
        <Route 
          path="/login" 
          element={<Login onLoginSuccess={handleLoginSuccess} />} 
        />
        <Route 
          path="/registro" 
          element={<Registro onRegistroSuccess={handleLoginSuccess} />}
        />
        <Route 
          path="/perfil" 
          element={<Perfil />}
        />
      </Routes>
    </Router>
  )
}

export default App
