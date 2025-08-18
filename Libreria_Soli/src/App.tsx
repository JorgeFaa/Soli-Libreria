import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './assets/components/Header'
import Hero from './assets/components/Hero'
import Catalogo from './assets/components/Catalogo'
import Nosotros from './assets/components/Nosotros'
import Libreria from './assets/components/Libreria'

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
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/libreria" element={<Libreria />} />
      </Routes>
    </Router>
  )
}

export default App
