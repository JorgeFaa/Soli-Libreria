import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Perfil.css";

export default function Perfil() {
  // Estados para manejar la edición del perfil (falsos por ahora)
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState({
    nombre: "Ana",
    apellido: "García",
    email: "ana.garcia@ejemplo.com",
    fechaNacimiento: "1995-03-15",
    telefono: "+57 300 123 4567",
    ciudad: "Bogotá, Colombia",
    biografia: "Amante de la literatura clásica y contemporánea. Me encanta descubrir nuevos autores y compartir recomendaciones con otros lectores."
  });

  // Datos simulados de estadísticas del usuario
  const estadisticas = {
    librosLeidos: 47,
    librosEnLectura: 3,
    librosDeseados: 12,
    reseñasEscritas: 23,
    miembroDesde: "Agosto 2025"
  };

  // Libros recientes (datos simulados)
  const librosRecientes = [
    { id: 1, titulo: "Cien años de soledad", autor: "Gabriel García Márquez", estado: "Completado", rating: 5, progreso: 100 },
    { id: 2, titulo: "1984", autor: "George Orwell", estado: "Leyendo", progreso: 65, rating: 0 },
    { id: 3, titulo: "El amor en los tiempos del cólera", autor: "Gabriel García Márquez", estado: "Deseado", rating: 0, progreso: 0 }
  ];

  // Función para manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para guardar cambios
  const handleSaveChanges = () => {
    // Aquí iría la lógica para guardar en el backend
    console.log("Guardando cambios:", userInfo);
    setIsEditing(false);
  };

  return (
    <section className="perfil-section">
      <div className="perfil-container">
        
        {/* Header del perfil */}
        <div className="perfil-header">
          <div className="perfil-avatar">
            <div className="perfil-avatar-circle">
              <span className="perfil-avatar-initials">
                {userInfo.nombre[0]}{userInfo.apellido[0]}
              </span>
            </div>
          </div>
          
          <div className="perfil-header-info">
            <h1 className="perfil-title">
              {userInfo.nombre} {userInfo.apellido}
            </h1>
            <p className="perfil-subtitle">
              Miembro desde {estadisticas.miembroDesde}
            </p>
            <div className="perfil-header-actions">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="perfil-edit-btn"
                >
                  Editar perfil
                </button>
              ) : (
                <div className="perfil-edit-actions">
                  <button 
                    onClick={handleSaveChanges}
                    className="perfil-save-btn"
                  >
                    Guardar
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="perfil-cancel-btn"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas del usuario */}
        <div className="perfil-stats">
          <div className="perfil-stat">
            <span className="perfil-stat-number">{estadisticas.librosLeidos}</span>
            <span className="perfil-stat-label">Libros leídos</span>
          </div>
          <div className="perfil-stat">
            <span className="perfil-stat-number">{estadisticas.librosEnLectura}</span>
            <span className="perfil-stat-label">Leyendo ahora</span>
          </div>
          <div className="perfil-stat">
            <span className="perfil-stat-number">{estadisticas.librosDeseados}</span>
            <span className="perfil-stat-label">Lista de deseos</span>
          </div>
          <div className="perfil-stat">
            <span className="perfil-stat-number">{estadisticas.reseñasEscritas}</span>
            <span className="perfil-stat-label">Reseñas escritas</span>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="perfil-content">
          
          {/* Información personal */}
          <div className="perfil-card">
            <h2 className="perfil-card-title">Información Personal</h2>
            <div className="perfil-form">
              {/* Aquí vamos a hacer divs dinámicos, que van a cambiar lo que tengan dentro dependiendo del valor de isEditing*/}
              <div className="perfil-row">
                <div className="perfil-field">
                  <label className="perfil-label">Nombre</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="nombre"
                      value={userInfo.nombre}
                      onChange={handleInputChange}
                      className="perfil-input"
                    />
                  ) : (
                    <p className="perfil-value">{userInfo.nombre}</p>
                  )}
                </div>
                
                <div className="perfil-field">
                  <label className="perfil-label">Apellido</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="apellido"
                      value={userInfo.apellido}
                      onChange={handleInputChange}
                      className="perfil-input"
                    />
                  ) : (
                    <p className="perfil-value">{userInfo.apellido}</p>
                  )}
                </div>
              </div>

              <div className="perfil-field">
                <label className="perfil-label">Correo electrónico</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={userInfo.email}
                    onChange={handleInputChange}
                    className="perfil-input"
                  />
                ) : (
                  <p className="perfil-value">{userInfo.email}</p>
                )}
              </div>

              <div className="perfil-row">
                <div className="perfil-field">
                  <label className="perfil-label">Fecha de nacimiento</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={userInfo.fechaNacimiento}
                      onChange={handleInputChange}
                      className="perfil-input"
                    />
                  ) : (
                    <p className="perfil-value">
                      {new Date(userInfo.fechaNacimiento).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>

                <div className="perfil-field">
                  <label className="perfil-label">Teléfono</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="telefono"
                      value={userInfo.telefono}
                      onChange={handleInputChange}
                      className="perfil-input"
                    />
                  ) : (
                    <p className="perfil-value">{userInfo.telefono}</p>
                  )}
                </div>
              </div>

              <div className="perfil-field">
                <label className="perfil-label">Ciudad</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="ciudad"
                    value={userInfo.ciudad}
                    onChange={handleInputChange}
                    className="perfil-input"
                  />
                ) : (
                  <p className="perfil-value">{userInfo.ciudad}</p>
                )}
              </div>

              <div className="perfil-field">
                <label className="perfil-label">Biografía</label>
                {isEditing ? (
                  <textarea
                    name="biografia"
                    value={userInfo.biografia}
                    onChange={handleInputChange}
                    className="perfil-textarea"
                    rows={4}
                    placeholder="Cuéntanos un poco sobre ti y tus gustos literarios..."
                  />
                ) : (
                  <p className="perfil-value">{userInfo.biografia}</p>
                )}
              </div>

            </div>
          </div>

          {/* Actividad reciente */}
          <div className="perfil-card">
            <h2 className="perfil-card-title">Actividad Reciente</h2>
            <div className="perfil-books">
              {librosRecientes.map((libro) => (
                <div key={libro.id} className="perfil-book">
                  <div className="perfil-book-info">
                    <h3 className="perfil-book-title">{libro.titulo}</h3>
                    <p className="perfil-book-author">por {libro.autor}</p>
                    <span className={`perfil-book-status ${libro.estado.toLowerCase().replace(' ', '-')}`}>
                      {libro.estado}
                      {libro.estado === "Leyendo" && libro.progreso && (
                        <span className="perfil-book-progress"> - {libro.progreso}%</span>
                      )}
                    </span>
                  </div>
                  {libro.rating > 0 && (
                    <div className="perfil-book-rating">
                      {"★".repeat(libro.rating)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="perfil-actions">
              <Link to="/libreria" className="perfil-action-link">
                Ver todos mis libros →
              </Link>
            </div>
          </div>

        </div>

        {/* Navegación de regreso */}
        <div className="perfil-navigation">
          <Link to="/" className="perfil-back-link">
            ← Volver al inicio
          </Link>
        </div>

      </div>
    </section>
  );
}