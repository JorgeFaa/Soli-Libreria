-- =====================================================
-- MIGRACIÓN PARA API V2 - APLICAR EN ORDEN
-- =====================================================

-- Este archivo debe ejecutarse DESPUÉS de schema.sql, procedures.sql, etc.
-- Contiene solo las mejoras y optimizaciones para la API V2

BEGIN;

-- =====================================================
-- 1. AGREGAR CAMPOS DE AUDITORÍA A TABLAS EXISTENTES
-- =====================================================

-- Solo agregar si no existen (para evitar errores en re-ejecuciones)
DO $$
BEGIN
    -- Agregar campos a country si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='country' AND column_name='created_at') THEN
        ALTER TABLE country ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE country ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        
        -- Agregar restricción UNIQUE si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE table_name='country' AND constraint_type='UNIQUE') THEN
            ALTER TABLE country ADD CONSTRAINT country_name_unique UNIQUE (countryname);
        END IF;
    END IF;
    
    -- Agregar campos a genres si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='genres' AND column_name='created_at') THEN
        ALTER TABLE genres ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE genres ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        
        -- Agregar restricción UNIQUE si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE table_name='genres' AND constraint_type='UNIQUE') THEN
            ALTER TABLE genres ADD CONSTRAINT genres_name_unique UNIQUE (genrename);
        END IF;
    END IF;
    
    -- Agregar campos a texttype si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='texttype' AND column_name='created_at') THEN
        ALTER TABLE texttype ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE texttype ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        
        -- Agregar restricción UNIQUE si no existe  
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE table_name='texttype' AND constraint_type='UNIQUE') THEN
            ALTER TABLE texttype ADD CONSTRAINT texttype_name_unique UNIQUE (texttype);
        END IF;
    END IF;
    
    -- Agregar campos a authors si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='authors' AND column_name='created_at') THEN
        ALTER TABLE authors ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE authors ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Agregar campos a editorials si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='editorials' AND column_name='created_at') THEN
        ALTER TABLE editorials ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE editorials ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Agregar campos a users si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='created_at') THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Agregar campos a texts si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='texts' AND column_name='created_at') THEN
        ALTER TABLE texts ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE texts ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
END $$;

-- =====================================================
-- 2. CREAR EXTENSIONES NECESARIAS
-- =====================================================

-- Extensión para búsqueda de texto similar (necesaria para índices)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Extensión para remover acentos (opcional pero útil)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- =====================================================
-- 3. CREAR ÍNDICES OPTIMIZADOS PARA API V2
-- =====================================================

-- ÍNDICES PARA BÚSQUEDA DE TEXTO
CREATE INDEX IF NOT EXISTS idx_texts_title_trgm 
ON texts USING gin(texttitle gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_texts_description_trgm 
ON texts USING gin(descripcion gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_texts_search_combined 
ON texts USING gin((texttitle || ' ' || COALESCE(descripcion, '')) gin_trgm_ops);

-- ÍNDICES PARA FILTROS DE FECHA
CREATE INDEX IF NOT EXISTS idx_texts_published_date 
ON texts(publisheddate) WHERE publisheddate IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_texts_date_title 
ON texts(publisheddate, texttitle) WHERE publisheddate IS NOT NULL;

-- ÍNDICES PARA ORDENAMIENTO Y PAGINACIÓN
CREATE INDEX IF NOT EXISTS idx_texts_title_id 
ON texts(texttitle, textid);

CREATE INDEX IF NOT EXISTS idx_texts_published_id 
ON texts(publisheddate DESC, textid) WHERE publisheddate IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_texts_created_id 
ON texts(created_at DESC, textid);

-- ÍNDICES PARA BÚSQUEDA DE AUTORES
CREATE INDEX IF NOT EXISTS idx_authors_name_trgm 
ON authors USING gin(authorname gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_authors_fullname_trgm 
ON authors USING gin((authorname || ' ' || COALESCE(authormiddlename, '') || ' ' || COALESCE(authorlastname, '')) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_authors_country 
ON authors(countryid);

-- ÍNDICES PARA BÚSQUEDA DE GÉNEROS
CREATE INDEX IF NOT EXISTS idx_genres_name_trgm 
ON genres USING gin(genrename gin_trgm_ops);

-- ÍNDICES PARA RELACIONES N:M (FILTROS)
CREATE INDEX IF NOT EXISTS idx_text_authors_author 
ON text_authors(authorid, textid);

CREATE INDEX IF NOT EXISTS idx_text_authors_text 
ON text_authors(textid, authorid);

CREATE INDEX IF NOT EXISTS idx_text_genres_genre 
ON text_genres(genreid, textid);

CREATE INDEX IF NOT EXISTS idx_text_genres_text 
ON text_genres(textid, genreid);

CREATE INDEX IF NOT EXISTS idx_text_editorials_editorial 
ON text_editorials(editorialid, textid);

CREATE INDEX IF NOT EXISTS idx_text_editorials_text 
ON text_editorials(textid, editorialid);

-- ÍNDICES PARA JOINS FRECUENTES
CREATE INDEX IF NOT EXISTS idx_authors_country_name 
ON authors(countryid, authorname);

CREATE INDEX IF NOT EXISTS idx_editorials_country_name 
ON editorials(countryid, companyname);

-- ÍNDICES PARA ESTADÍSTICAS
CREATE INDEX IF NOT EXISTS idx_text_genres_stats 
ON text_genres(genreid);

CREATE INDEX IF NOT EXISTS idx_text_authors_stats 
ON text_authors(authorid);

CREATE INDEX IF NOT EXISTS idx_text_editorials_stats 
ON text_editorials(editorialid);

CREATE INDEX IF NOT EXISTS idx_texts_year_stats 
ON texts(EXTRACT(YEAR FROM publisheddate)) WHERE publisheddate IS NOT NULL;

-- ÍNDICES ÚNICOS PARA INTEGRIDAD
CREATE UNIQUE INDEX IF NOT EXISTS idx_genres_name_unique 
ON genres(LOWER(genrename));

CREATE UNIQUE INDEX IF NOT EXISTS idx_country_name_unique 
ON country(LOWER(countryname));

CREATE UNIQUE INDEX IF NOT EXISTS idx_texttype_unique 
ON texttype(LOWER(texttype));

-- ÍNDICES DE AUDITORÍA
CREATE INDEX IF NOT EXISTS idx_texts_created_at 
ON texts(created_at);

CREATE INDEX IF NOT EXISTS idx_authors_created_at 
ON authors(created_at);

CREATE INDEX IF NOT EXISTS idx_users_created_at 
ON users(created_at);

-- ÍNDICES PARA USUARIOS
CREATE INDEX IF NOT EXISTS idx_users_active 
ON users(activemember, userid) WHERE activemember = TRUE;

CREATE INDEX IF NOT EXISTS idx_user_genres_user 
ON user_genres(userid, genreid);

-- =====================================================
-- 4. ACTUALIZAR FUNCIONES DE TIMESTAMP
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END; $$;

-- =====================================================
-- 5. CREAR/ACTUALIZAR TRIGGERS DE TIMESTAMP
-- =====================================================

-- Triggers para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS trg_update_timestamp_users ON users;
CREATE TRIGGER trg_update_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_timestamp_authors ON authors;
CREATE TRIGGER trg_update_timestamp_authors
BEFORE UPDATE ON authors
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_timestamp_texts ON texts;
CREATE TRIGGER trg_update_timestamp_texts
BEFORE UPDATE ON texts
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_timestamp_editorials ON editorials;
CREATE TRIGGER trg_update_timestamp_editorials
BEFORE UPDATE ON editorials
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_timestamp_genres ON genres;
CREATE TRIGGER trg_update_timestamp_genres
BEFORE UPDATE ON genres
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_timestamp_country ON country;
CREATE TRIGGER trg_update_timestamp_country
BEFORE UPDATE ON country
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_timestamp_texttype ON texttype;
CREATE TRIGGER trg_update_timestamp_texttype
BEFORE UPDATE ON texttype
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- =====================================================
-- 6. MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'MIGRACIÓN V2 COMPLETADA EXITOSAMENTE';
    RAISE NOTICE 'Se agregaron campos de auditoría, índices optimizados y triggers';
    RAISE NOTICE 'La base de datos está optimizada para API V2';
END $$;

COMMIT;