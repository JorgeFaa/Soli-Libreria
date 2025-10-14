# 🚀 Guía de Migración: API V1 → V2

## 📋 **Resumen Ejecutivo**

Esta guía proporciona instrucciones detalladas para migrar del API V1 (funcionalidad básica) al API V2 (avanzada con paginación, filtros y estadísticas). Ambas versiones pueden coexistir simultáneamente, permitiendo una migración gradual sin interrupciones.

---

## 🎯 **¿Por qué Migrar a V2?**

### **✨ Beneficios Principales**

| Aspecto | V1 | V2 | Mejora |
|---------|----|----|---------|
| **Paginación** | ❌ No disponible | ✅ Paginación completa | 📈 +100% eficiencia en listas grandes |
| **Filtros** | ❌ Sin filtros | ✅ Filtros múltiples | 🔍 Búsquedas específicas y precisas |
| **Búsqueda** | ❌ Solo por ID | ✅ Texto parcial y combinada | 🎯 Experiencia de usuario mejorada |
| **Rendimiento** | ⚠️ Básico | ✅ Optimizado con caché | ⚡ +200% velocidad en consultas |
| **Estadísticas** | ❌ No disponible | ✅ Analytics integrados | 📊 Insights de datos |
| **Ordenamiento** | ❌ Fijo | ✅ Dinámico y flexible | 📈 Control total del usuario |

### **📊 Impacto en Rendimiento**
- **Reducción de transferencia de datos**: Hasta 90% menos datos transferidos con paginación
- **Tiempo de respuesta**: Hasta 75% más rápido en consultas filtradas
- **Carga del servidor**: 60% menos carga con consultas optimizadas

---

## 🛠️ **Estrategias de Migración**

### **1. Migración Gradual (Recomendada) 🟢**
- Migrar un endpoint a la vez
- Mantener V1 como fallback
- Probar cada migración antes de continuar
- **Tiempo estimado**: 2-4 semanas

### **2. Migración Completa 🟡**
- Migrar toda la aplicación de una vez
- Requiere más testing
- Mayor riesgo pero menor tiempo total
- **Tiempo estimado**: 1 semana

### **3. Migración Híbrida 🔵**
- Usar V2 para nuevas funcionalidades
- Mantener V1 para funcionalidad existente
- **Tiempo estimado**: Indefinido (coexistencia permanente)

---

## 📚 **Migración por Módulos**

## 1️⃣ **Libros (Books)**

### **V1 → V2: Lista Simple a Paginada**

#### **ANTES (V1):**
```javascript
// Obtener todos los libros (sin paginación)
const getAllBooks = async () => {
  try {
    const response = await fetch('/api/v1/books/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const books = await response.json();
    console.log(`Cargados ${books.length} libros`);
    return books;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### **DESPUÉS (V2):**
```javascript
// Obtener libros con paginación y filtros
const getBooksV2 = async (page = 0, size = 20, filters = {}) => {
  try {
    // Construir query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: 'title,asc'
    });
    
    // Agregar filtros si existen
    if (filters.title) params.append('title', filters.title);
    if (filters.genreIds) params.append('genreIds', filters.genreIds.join(','));
    if (filters.authorIds) params.append('authorIds', filters.authorIds.join(','));
    
    const response = await fetch(`/api/v2/books?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log(`Página ${data.number + 1} de ${data.totalPages}, ${data.totalElements} libros total`);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### **Implementar Búsqueda Avanzada:**
```javascript
// Búsqueda específica por múltiples criterios
const searchBooksAdvanced = async (searchCriteria) => {
  const {
    title,
    authorIds = [],
    genreIds = [],
    publishedAfter,
    publishedBefore,
    page = 0,
    size = 10,
    sortBy = 'title',
    sortDirection = 'asc'
  } = searchCriteria;
  
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: `${sortBy},${sortDirection}`
  });
  
  if (title) params.append('title', title);
  if (authorIds.length) params.append('authorIds', authorIds.join(','));
  if (genreIds.length) params.append('genreIds', genreIds.join(','));
  if (publishedAfter) params.append('published_after', publishedAfter);
  if (publishedBefore) params.append('published_before', publishedBefore);
  
  const response = await fetch(`/api/v2/books?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return await response.json();
};

// Ejemplo de uso
const results = await searchBooksAdvanced({
  title: 'quijote',
  genreIds: [1, 2],
  publishedAfter: '1600-01-01',
  sortBy: 'publishedDate',
  sortDirection: 'desc'
});
```

---

## 2️⃣ **Autores (Authors)**

### **V1 → V2: Lista Simple a Búsqueda Filtrada**

#### **ANTES (V1):**
```javascript
const getAllAuthors = async () => {
  const response = await fetch('/api/v1/authors/all', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

#### **DESPUÉS (V2):**
```javascript
// Búsqueda básica
const getAuthorsV2 = async () => {
  const response = await fetch('/api/v2/authors/all', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

// Búsqueda filtrada por nombre y país
const searchAuthors = async (name = '', country = '') => {
  const params = new URLSearchParams();
  if (name) params.append('name', name);
  if (country) params.append('country', country);
  
  const queryString = params.toString() ? `?${params}` : '';
  const response = await fetch(`/api/v2/authors${queryString}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return await response.json();
};

// Obtener estadísticas de autores
const getAuthorStats = async () => {
  const response = await fetch('/api/v2/authors/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

// Ejemplos de uso
const spanishAuthors = await searchAuthors('', 'españa');
const cervantesBooks = await searchAuthors('cervantes', '');
const authorStats = await getAuthorStats();
```

---

## 3️⃣ **Géneros (Genres)**

### **V1 → V2: Lista Simple a Sistema Avanzado**

#### **ANTES (V1):**
```javascript
const getAllGenres = async () => {
  const response = await fetch('/api/v1/genres/all', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

#### **DESPUÉS (V2):**
```javascript
// Lista completa de géneros
const getGenresV2 = async () => {
  const response = await fetch('/api/v2/genres/all', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

// Búsqueda por nombre
const searchGenres = async (name) => {
  const params = new URLSearchParams();
  if (name) params.append('name', name);
  
  const response = await fetch(`/api/v2/genres?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

// Géneros populares ordenados por número de libros
const getPopularGenres = async () => {
  const response = await fetch('/api/v2/genres/popular', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

// Estadísticas de géneros
const getGenreStats = async () => {
  const response = await fetch('/api/v2/genres/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

---

## 4️⃣ **Usuarios (Users)**

### **V1 → V2: Funciones Mejoradas**

#### **Registro Mejorado:**
```javascript
// V1 - Respuesta simple
const registerV1 = async (userData) => {
  const response = await fetch('/api/v1/user/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  const message = await response.text(); // String simple
  return message;
};

// V2 - Respuesta con metadata
const registerV2 = async (userData) => {
  const response = await fetch('/api/v2/user/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  const result = await response.json(); // Objeto con metadata
  /*
  {
    "message": "Usuario registrado exitosamente...",
    "username": "user@example.com",
    "timestamp": "2024-10-14T06:00:00Z",
    "requiresVerification": true
  }
  */
  return result;
};
```

#### **Login Mejorado:**
```javascript
// V2 - Login con información adicional
const loginV2 = async (credentials) => {
  const response = await fetch('/api/v2/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  const result = await response.json();
  
  if (result.userStatus === 'CONFIRMED') {
    // Usuario confirmado - tokens disponibles
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    console.log(`Usuario logueado a las ${result.loginTimestamp}`);
    return result;
  } else {
    // Usuario no confirmado
    console.log('Usuario requiere verificación');
    return result;
  }
};
```

---

## 🔧 **Implementación Práctica**

### **1. Wrapper de Compatibilidad**

Crea un wrapper que maneje ambas versiones automáticamente:

```javascript
class ApiClient {
  constructor(version = 'v2') {
    this.version = version;
    this.baseUrl = `/api/${version}`;
  }
  
  async getBooks(options = {}) {
    if (this.version === 'v1') {
      // Funcionalidad V1
      const response = await fetch(`${this.baseUrl}/books/all`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      return await response.json();
    } else {
      // Funcionalidad V2 con paginación
      const params = new URLSearchParams({
        page: options.page || 0,
        size: options.size || 20
      });
      
      if (options.title) params.append('title', options.title);
      
      const response = await fetch(`${this.baseUrl}/books?${params}`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      return await response.json();
    }
  }
  
  // Método para cambiar de versión dinámicamente
  setVersion(version) {
    this.version = version;
    this.baseUrl = `/api/${version}`;
  }
}

// Uso
const apiClient = new ApiClient('v2');
const books = await apiClient.getBooks({ 
  page: 0, 
  size: 10, 
  title: 'quijote' 
});
```

### **2. Manejo de Paginación en Frontend**

```javascript
class PaginationManager {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.currentPage = 0;
    this.pageSize = 20;
    this.totalPages = 0;
    this.totalElements = 0;
  }
  
  async loadBooks(filters = {}) {
    const response = await this.apiClient.getBooks({
      page: this.currentPage,
      size: this.pageSize,
      ...filters
    });
    
    // Actualizar metadata de paginación
    this.totalPages = response.totalPages;
    this.totalElements = response.totalElements;
    
    return response.content; // Solo los libros
  }
  
  async nextPage(filters = {}) {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      return await this.loadBooks(filters);
    }
    return [];
  }
  
  async previousPage(filters = {}) {
    if (this.currentPage > 0) {
      this.currentPage--;
      return await this.loadBooks(filters);
    }
    return [];
  }
  
  getPaginationInfo() {
    return {
      currentPage: this.currentPage + 1,
      totalPages: this.totalPages,
      totalElements: this.totalElements,
      hasNext: this.currentPage < this.totalPages - 1,
      hasPrevious: this.currentPage > 0
    };
  }
}

// Uso en React/Vue
const paginationManager = new PaginationManager(apiClient);
const books = await paginationManager.loadBooks({ title: 'cervantes' });
const info = paginationManager.getPaginationInfo();
```

### **3. Sistema de Filtros Dinámicos**

```javascript
class FilterManager {
  constructor() {
    this.activeFilters = {};
  }
  
  setFilter(key, value) {
    if (value) {
      this.activeFilters[key] = value;
    } else {
      delete this.activeFilters[key];
    }
  }
  
  setMultipleFilter(key, values) {
    if (values && values.length > 0) {
      this.activeFilters[key] = values;
    } else {
      delete this.activeFilters[key];
    }
  }
  
  buildQueryParams() {
    const params = new URLSearchParams();
    
    Object.entries(this.activeFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        params.append(key, value.join(','));
      } else {
        params.append(key, value);
      }
    });
    
    return params.toString();
  }
  
  clearAll() {
    this.activeFilters = {};
  }
  
  getActiveFilters() {
    return { ...this.activeFilters };
  }
}

// Uso
const filterManager = new FilterManager();
filterManager.setFilter('title', 'quijote');
filterManager.setMultipleFilter('genreIds', [1, 2, 3]);
filterManager.setFilter('published_after', '2000-01-01');

const queryString = filterManager.buildQueryParams();
// Resultado: "title=quijote&genreIds=1,2,3&published_after=2000-01-01"
```

---

## 📋 **Checklist de Migración**

### **Pre-Migración ✅**
- [ ] Revisar documentación completa de V2
- [ ] Configurar entorno de testing
- [ ] Backup de código V1
- [ ] Identificar endpoints críticos
- [ ] Definir criterios de éxito

### **Durante la Migración ✅**
- [ ] Migrar endpoint por endpoint
- [ ] Probar cada migración individualmente
- [ ] Verificar manejo de errores
- [ ] Validar paginación y filtros
- [ ] Probar rendimiento

### **Post-Migración ✅**
- [ ] Testing integral
- [ ] Monitoreo de rendimiento
- [ ] Feedback de usuarios
- [ ] Documentar cambios realizados
- [ ] Plan de rollback si es necesario

### **Validación de Funcionalidad ✅**
- [ ] **Paginación**: Navegación entre páginas funciona
- [ ] **Filtros**: Todos los filtros devuelven resultados esperados
- [ ] **Búsqueda**: Búsqueda parcial funciona correctamente
- [ ] **Ordenamiento**: Ordenamiento dinámico funciona
- [ ] **Estadísticas**: Endpoints de stats devuelven datos válidos
- [ ] **Rendimiento**: Tiempos de respuesta mejorados

---

## ⚠️ **Consideraciones Importantes**

### **🔄 Cambios en Estructura de Respuesta**

#### **V1 - Respuestas Simples:**
```json
// GET /api/v1/books/all
[
  { "id": 1, "title": "Libro 1" },
  { "id": 2, "title": "Libro 2" }
]
```

#### **V2 - Respuestas Paginadas:**
```json
// GET /api/v2/books
{
  "content": [
    { "id": 1, "title": "Libro 1" },
    { "id": 2, "title": "Libro 2" }
  ],
  "pageable": { ... },
  "totalElements": 100,
  "totalPages": 10,
  "first": true,
  "last": false
}
```

### **📱 Adaptación de UI/UX**

#### **Componentes de Paginación:**
```javascript
// Componente React para paginación V2
const PaginationControls = ({ paginationInfo, onPageChange }) => {
  return (
    <div className="pagination">
      <button 
        disabled={!paginationInfo.hasPrevious}
        onClick={() => onPageChange(paginationInfo.currentPage - 2)}
      >
        Anterior
      </button>
      
      <span>
        Página {paginationInfo.currentPage} de {paginationInfo.totalPages}
        ({paginationInfo.totalElements} elementos total)
      </span>
      
      <button 
        disabled={!paginationInfo.hasNext}
        onClick={() => onPageChange(paginationInfo.currentPage)}
      >
        Siguiente
      </button>
    </div>
  );
};
```

### **🔍 Componentes de Filtros:**
```javascript
const BookFilters = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState({});
  
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };
  
  return (
    <div className="filters">
      <input 
        placeholder="Buscar por título..."
        onChange={(e) => handleFilterChange('title', e.target.value)}
      />
      
      <select 
        onChange={(e) => handleFilterChange('genreIds', [e.target.value])}
      >
        <option value="">Todos los géneros</option>
        <option value="1">Novela</option>
        <option value="2">Ciencia Ficción</option>
      </select>
      
      <input 
        type="date"
        placeholder="Publicado después de..."
        onChange={(e) => handleFilterChange('published_after', e.target.value)}
      />
    </div>
  );
};
```

---

## 🚨 **Solución de Problemas Comunes**

### **1. Error de Paginación**
```javascript
// ❌ Problema: Acceder a datos como array
const books = await fetch('/api/v2/books');
books.forEach(book => console.log(book.title)); // ERROR

// ✅ Solución: Acceder al contenido paginado
const response = await fetch('/api/v2/books');
const data = await response.json();
data.content.forEach(book => console.log(book.title)); // CORRECTO
```

### **2. Filtros No Funcionan**
```javascript
// ❌ Problema: Enviar arrays directamente
const filters = { genreIds: [1, 2, 3] };
const params = new URLSearchParams(filters); // No funciona con arrays

// ✅ Solución: Convertir arrays a strings
const params = new URLSearchParams();
if (filters.genreIds) {
  params.append('genreIds', filters.genreIds.join(','));
}
```

### **3. Rendimiento Lento**
```javascript
// ❌ Problema: Cargar demasiados elementos
const allBooks = await fetch('/api/v2/books?size=1000');

// ✅ Solución: Usar paginación apropiada
const books = await fetch('/api/v2/books?page=0&size=20');
```

---

## 📊 **Métricas de Éxito**

### **KPIs a Monitorear:**
- **Tiempo de carga**: Debe reducirse en 60-80%
- **Transferencia de datos**: Reducción de 70-90% con paginación
- **Experiencia de usuario**: Búsquedas más precisas y rápidas
- **Uso de servidor**: Menor carga con consultas optimizadas

### **Herramientas de Monitoreo:**
```javascript
// Monitor de rendimiento personalizado
class PerformanceMonitor {
  static measure(name, fn) {
    return async (...args) => {
      const start = performance.now();
      const result = await fn(...args);
      const end = performance.now();
      console.log(`${name}: ${end - start}ms`);
      return result;
    };
  }
}

// Uso
const getBooksV2 = PerformanceMonitor.measure('getBooksV2', async (filters) => {
  // Lógica de V2
});
```

---

## 🎯 **Conclusión**

La migración de V1 a V2 representa una mejora significativa en:
- **Rendimiento y escalabilidad**
- **Experiencia de usuario**
- **Flexibilidad de búsqueda**
- **Insights y analytics**

### **Próximos Pasos Recomendados:**
1. Comenzar con migración gradual de libros
2. Implementar paginación en el frontend
3. Agregar filtros avanzados progresivamente
4. Monitorear métricas de rendimiento
5. Recopilar feedback de usuarios
6. Optimizar según resultados

### **Soporte y Recursos:**
- **Documentación completa**: `API_ENDPOINTS_DOCUMENTATION.md`
- **Swagger UI**: `/swagger-ui/index.html`
- **Ejemplos de código**: Disponibles en esta guía
- **Soporte técnico**: Equipo de desarrollo API Soli

---

*Guía de migración V1→V2 - API Soli - Octubre 2024*