-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE API V2
-- =====================================================

-- === ÍNDICES PARA BÚSQUEDA DE TEXTO ===

-- Índice para búsqueda de texto completo en títulos
CREATE INDEX IF NOT EXISTS idx_texts_title_trgm 
ON texts USING gin(texttitle gin_trgm_ops);

-- Índice para búsqueda de texto completo en descripciones
CREATE INDEX IF NOT EXISTS idx_texts_description_trgm 
ON texts USING gin(descripcion gin_trgm_ops);

-- Índice para búsqueda combinada de título y descripción
CREATE INDEX IF NOT EXISTS idx_texts_search_combined 
ON texts USING gin((texttitle || ' ' || COALESCE(descripcion, '')) gin_trgm_ops);

-- === ÍNDICES PARA FILTROS DE FECHA ===

-- Índice para filtros de fecha de publicación
CREATE INDEX IF NOT EXISTS idx_texts_published_date 
ON texts(publisheddate) WHERE publisheddate IS NOT NULL;

-- Índice compuesto para filtros de fecha y ordenamiento
CREATE INDEX IF NOT EXISTS idx_texts_date_title 
ON texts(publisheddate, texttitle) WHERE publisheddate IS NOT NULL;

-- === ÍNDICES PARA ORDENAMIENTO Y PAGINACIÓN ===

-- Índice para ordenamiento por título (más común)
CREATE INDEX IF NOT EXISTS idx_texts_title_id 
ON texts(texttitle, textid);

-- Índice para ordenamiento por fecha de publicación
CREATE INDEX IF NOT EXISTS idx_texts_published_id 
ON texts(publisheddate DESC, textid) WHERE publisheddate IS NOT NULL;

-- Índice para ordenamiento por fecha de creación
CREATE INDEX IF NOT EXISTS idx_texts_created_id 
ON texts(created_at DESC, textid);

-- === ÍNDICES PARA BÚSQUEDA DE AUTORES ===

-- Índice para búsqueda de autores por nombre
CREATE INDEX IF NOT EXISTS idx_authors_name_trgm 
ON authors USING gin(authorname gin_trgm_ops);

-- Índice para búsqueda por nombre completo
CREATE INDEX IF NOT EXISTS idx_authors_fullname_trgm 
ON authors USING gin((authorname || ' ' || COALESCE(authormiddlename, '') || ' ' || COALESCE(authorlastname, '')) gin_trgm_ops);

-- Índice para búsqueda de autores por país
CREATE INDEX IF NOT EXISTS idx_authors_country 
ON authors(countryid);

-- === ÍNDICES PARA BÚSQUEDA DE GÉNEROS ===

-- Índice para búsqueda de géneros por nombre
CREATE INDEX IF NOT EXISTS idx_genres_name_trgm 
ON genres USING gin(genrename gin_trgm_ops);

-- === ÍNDICES PARA RELACIONES N:M (FILTROS) ===

-- Optimización para filtros por autor
CREATE INDEX IF NOT EXISTS idx_text_authors_author 
ON text_authors(authorid, textid);

CREATE INDEX IF NOT EXISTS idx_text_authors_text 
ON text_authors(textid, authorid);

-- Optimización para filtros por género
CREATE INDEX IF NOT EXISTS idx_text_genres_genre 
ON text_genres(genreid, textid);

CREATE INDEX IF NOT EXISTS idx_text_genres_text 
ON text_genres(textid, genreid);

-- Optimización para filtros por editorial
CREATE INDEX IF NOT EXISTS idx_text_editorials_editorial 
ON text_editorials(editorialid, textid);

CREATE INDEX IF NOT EXISTS idx_text_editorials_text 
ON text_editorials(textid, editorialid);

-- === ÍNDICES PARA JOINS FRECUENTES ===

-- Optimización para joins con país en autores
CREATE INDEX IF NOT EXISTS idx_authors_country_name 
ON authors(countryid, authorname);

-- Optimización para joins con país en editoriales
CREATE INDEX IF NOT EXISTS idx_editorials_country_name 
ON editorials(countryid, companyname);

-- === ÍNDICES PARA ESTADÍSTICAS ===

-- Índice para contar libros por género
CREATE INDEX IF NOT EXISTS idx_text_genres_stats 
ON text_genres(genreid);

-- Índice para contar libros por autor
CREATE INDEX IF NOT EXISTS idx_text_authors_stats 
ON text_authors(authorid);

-- Índice para contar libros por editorial
CREATE INDEX IF NOT EXISTS idx_text_editorials_stats 
ON text_editorials(editorialid);

-- Índice para estadísticas por año de publicación
CREATE INDEX IF NOT EXISTS idx_texts_year_stats 
ON texts(EXTRACT(YEAR FROM publisheddate)) WHERE publisheddate IS NOT NULL;

-- === ÍNDICES ÚNICOS PARA INTEGRIDAD ===

-- Evitar duplicados en géneros (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_genres_name_unique 
ON genres(LOWER(genrename));

-- Evitar duplicados en países (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_country_name_unique 
ON country(LOWER(countryname));

-- Evitar duplicados en tipos de texto (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_texttype_unique 
ON texttype(LOWER(texttype));

-- === ÍNDICES DE AUDITORÍA ===

-- Índice para consultas de auditoría por fecha
CREATE INDEX IF NOT EXISTS idx_texts_created_at 
ON texts(created_at);

CREATE INDEX IF NOT EXISTS idx_authors_created_at 
ON authors(created_at);

CREATE INDEX IF NOT EXISTS idx_users_created_at 
ON users(created_at);

-- === ÍNDICES PARA USUARIOS ===

-- Índice para géneros preferidos de usuarios
CREATE INDEX IF NOT EXISTS idx_user_genres_user 
ON user_genres(userid, genreid);

-- Índices para N:M libros favoritos
CREATE INDEX IF NOT EXISTS idx_user_books_user
ON user_books(userid, textid);

CREATE INDEX IF NOT EXISTS idx_user_books_book
ON user_books(textid, userid);


-- =====================================================
-- EXTENSIONES NECESARIAS
-- =====================================================

-- Habilitar extensión para búsqueda de texto similar
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Habilitar extensión para texto completo (opcional)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- =====================================================
-- COMENTARIOS SOBRE ÍNDICES
-- =====================================================

-- Los índices GIN con pg_trgm son especialmente eficientes para:
-- 1. Búsquedas parciales (LIKE '%texto%')
-- 2. Búsquedas case-insensitive
-- 3. Búsquedas con similitud de texto

-- Los índices compuestos están optimizados para:
-- 1. Consultas que filtran y ordenan simultáneamente
-- 2. Paginación eficiente
-- 3. Evitar ordenamientos costosos en memoria

-- Los índices en tablas de relación N:M están optimizados para:
-- 1. Filtros por múltiples valores (ej: genreIds=1,2,3)
-- 2. Joins eficientes en consultas complejas
-- 3. Conteos y estadísticas rápidas