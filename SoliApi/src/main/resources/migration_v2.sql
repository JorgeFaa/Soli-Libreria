-- =====================================================
-- MIGRACIÓN PARA N:M FAVORITOS Y AUDITORÍA
-- Solo aplica para cambios recientes: user_books, favoriteBooks, preferredGenres
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CREAR TABLA N:M FAVORITOS (si no existe)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_books (
    userid INT REFERENCES users(userid) ON DELETE CASCADE,
    textid INT REFERENCES texts(textid) ON DELETE CASCADE,
    PRIMARY KEY (userid, textid)
);

-- =====================================================
-- 2. CREAR ÍNDICES PARA N:M FAVORITOS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_books_user
ON user_books(userid, textid);

CREATE INDEX IF NOT EXISTS idx_user_books_book
ON user_books(textid, userid);

-- =====================================================
-- 3. CREAR/ACTUALIZAR FUNCIÓN DE TIMESTAMP (si no existe)
-- =====================================================
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END; $$;

-- =====================================================
-- 4. CREAR/ACTUALIZAR TRIGGERS DE TIMESTAMP EN TABLAS EXISTENTES
-- =====================================================
DO $$
BEGIN
    -- users
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_timestamp_users') THEN
        CREATE TRIGGER trg_update_timestamp_users
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
    END IF;

    -- texts
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_timestamp_texts') THEN
        CREATE TRIGGER trg_update_timestamp_texts
        BEFORE UPDATE ON texts
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
    END IF;

    -- authors
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_timestamp_authors') THEN
        CREATE TRIGGER trg_update_timestamp_authors
        BEFORE UPDATE ON authors
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
    END IF;

    -- editorials
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_timestamp_editorials') THEN
        CREATE TRIGGER trg_update_timestamp_editorials
        BEFORE UPDATE ON editorials
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
    END IF;

    -- genres
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_timestamp_genres') THEN
        CREATE TRIGGER trg_update_timestamp_genres
        BEFORE UPDATE ON genres
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
    END IF;

    -- country
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_timestamp_country') THEN
        CREATE TRIGGER trg_update_timestamp_country
        BEFORE UPDATE ON country
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
    END IF;

    -- texttype
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_timestamp_texttype') THEN
        CREATE TRIGGER trg_update_timestamp_texttype
        BEFORE UPDATE ON texttype
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
    END IF;
END $$;

-- =====================================================
-- 5. EXTENSIONES NECESARIAS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

COMMIT;

-- =====================================================
-- FIN MIGRACIÓN N:M FAVORITOS Y AUDITORÍA
-- =====================================================
