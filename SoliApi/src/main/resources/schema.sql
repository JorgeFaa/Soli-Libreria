-- =====================================================
-- SOLI-BOOKS API - SCHEMA UNIFICADO
-- Este archivo contiene todo lo necesario para inicializar la base de datos.
-- Orden de ejecución: Extensiones -> Tablas -> Funciones -> Triggers -> Índices
-- ====================================================

-- === EXTENSIONES ===
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- TABLAS
-- =====================================================

CREATE TABLE IF NOT EXISTS country (
    countryid BIGSERIAL PRIMARY KEY,
    countryname VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS genres (
    genreid BIGSERIAL PRIMARY KEY,
    genrename VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS texttype (
    typeid BIGSERIAL PRIMARY KEY,
    texttype VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS authors (
    authorid BIGSERIAL PRIMARY KEY,
    authorname VARCHAR(50) NOT NULL,
    authormiddlename VARCHAR(50),
    authorlastname VARCHAR(100),
    countryid BIGINT REFERENCES country(countryid),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS editorials (
    editorialid BIGSERIAL PRIMARY KEY,
    companyname VARCHAR(250) NOT NULL,
    countryid BIGINT REFERENCES country(countryid),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    userid BIGSERIAL PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    cognitosub VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS texts (
    textid BIGSERIAL PRIMARY KEY,
    texttitle VARCHAR(250) NOT NULL,
    descripcion TEXT NOT NULL,
    publisheddate DATE,
    typeid BIGINT REFERENCES texttype(typeid) NOT NULL,
    pdf_url VARCHAR(512),
    epub_url VARCHAR(512),
    coverurl VARCHAR(512) NOT NULL,
    average_rating NUMERIC(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS text_authors (
    textid BIGINT NOT NULL REFERENCES texts(textid) ON DELETE CASCADE,
    authorid BIGINT NOT NULL REFERENCES authors(authorid) ON DELETE CASCADE,
    PRIMARY KEY (textid, authorid)
);

CREATE TABLE IF NOT EXISTS text_genres (
    textid BIGINT NOT NULL REFERENCES texts(textid) ON DELETE CASCADE,
    genreid BIGINT NOT NULL REFERENCES genres(genreid) ON DELETE CASCADE,
    PRIMARY KEY (textid, genreid)
);

CREATE TABLE IF NOT EXISTS text_editorials (
    textid BIGINT NOT NULL REFERENCES texts(textid) ON DELETE CASCADE,
    editorialid BIGINT NOT NULL REFERENCES editorials(editorialid) ON DELETE CASCADE,
    PRIMARY KEY (textid, editorialid)
);

CREATE TABLE IF NOT EXISTS user_genres (
    userid BIGINT NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
    genreid BIGINT NOT NULL REFERENCES genres(genreid) ON DELETE CASCADE,
    PRIMARY KEY (userid, genreid)
);

CREATE TABLE IF NOT EXISTS user_books (
    userid BIGINT NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
    textid BIGINT NOT NULL REFERENCES texts(textid) ON DELETE CASCADE,
    PRIMARY KEY (userid, textid)
);

CREATE TABLE IF NOT EXISTS reading_progress (
    user_id BIGINT NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
    book_id BIGINT NOT NULL REFERENCES texts(textid) ON DELETE CASCADE,
    last_page INT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
    book_id BIGINT NOT NULL REFERENCES texts(textid) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS auditlog(
    logid BIGSERIAL PRIMARY KEY,
    tablename VARCHAR(50),
    action VARCHAR(10),
    recordid BIGINT,
    changedat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_format_names()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_TABLE_NAME = 'authors' THEN
        NEW.authorname := initcap(trim(NEW.authorname));
        IF NEW.authormiddlename IS NOT NULL THEN NEW.authormiddlename := initcap(trim(NEW.authormiddlename)); END IF;
        IF NEW.authorlastname IS NOT NULL THEN NEW.authorlastname := initcap(trim(NEW.authorlastname)); END IF;
    ELSIF TG_TABLE_NAME = 'users' THEN
        NEW.firstname := initcap(trim(NEW.firstname));
        NEW.lastname := initcap(trim(NEW.lastname));
    ELSIF TG_TABLE_NAME = 'editorials' THEN
        NEW.companyname := initcap(trim(NEW.companyname));
    ELSIF TG_TABLE_NAME = 'genres' THEN
        NEW.genrename := initcap(trim(NEW.genrename));
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_audit_changes()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_id BIGINT;
BEGIN
    IF TG_TABLE_NAME = 'users' THEN v_id := COALESCE(NEW.userid, OLD.userid);
    ELSIF TG_TABLE_NAME = 'texts' THEN v_id := COALESCE(NEW.textid, OLD.textid);
    END IF;
    INSERT INTO public.auditlog(tablename, action, recordid) VALUES(TG_TABLE_NAME, TG_OP, v_id);
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION fn_update_review_stats()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_book_id BIGINT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_book_id := OLD.book_id;
    ELSE
        v_book_id := NEW.book_id;
    END IF;

    UPDATE texts
    SET
        review_count = (SELECT COUNT(*) FROM reviews WHERE book_id = v_book_id),
        average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE book_id = v_book_id)
    WHERE textid = v_book_id;

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar Triggers de Timestamp
DROP TRIGGER IF EXISTS trg_update_timestamp_users ON public.users;
CREATE TRIGGER trg_update_timestamp_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_timestamp_authors ON public.authors;
CREATE TRIGGER trg_update_timestamp_authors BEFORE UPDATE ON public.authors FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_timestamp_texts ON public.texts;
CREATE TRIGGER trg_update_timestamp_texts BEFORE UPDATE ON public.texts FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_timestamp_editorials ON public.editorials;
CREATE TRIGGER trg_update_timestamp_editorials BEFORE UPDATE ON public.editorials FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_timestamp_genres ON public.genres;
CREATE TRIGGER trg_update_timestamp_genres BEFORE UPDATE ON public.genres FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_timestamp_country ON public.country;
CREATE TRIGGER trg_update_timestamp_country BEFORE UPDATE ON public.country FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_timestamp_texttype ON public.texttype;
CREATE TRIGGER trg_update_timestamp_texttype BEFORE UPDATE ON public.texttype FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_timestamp_reading_progress ON public.reading_progress;
CREATE TRIGGER trg_update_timestamp_reading_progress BEFORE UPDATE ON public.reading_progress FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_timestamp_reviews ON public.reviews;
CREATE TRIGGER trg_update_timestamp_reviews BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- Aplicar Triggers de Formato de Nombres
DROP TRIGGER IF EXISTS trg_format_author_names ON public.authors;
CREATE TRIGGER trg_format_author_names BEFORE INSERT OR UPDATE ON public.authors FOR EACH ROW EXECUTE FUNCTION fn_format_names();

DROP TRIGGER IF EXISTS trg_format_user_names ON public.users;
CREATE TRIGGER trg_format_user_names BEFORE INSERT OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION fn_format_names();

DROP TRIGGER IF EXISTS trg_format_editorial_name ON public.editorials;
CREATE TRIGGER trg_format_editorial_name BEFORE INSERT OR UPDATE ON public.editorials FOR EACH ROW EXECUTE FUNCTION fn_format_names();

DROP TRIGGER IF EXISTS trg_format_genre_name ON public.genres;
CREATE TRIGGER trg_format_genre_name BEFORE INSERT OR UPDATE ON public.genres FOR EACH ROW EXECUTE FUNCTION fn_format_names();

-- Aplicar Triggers de Auditoría
DROP TRIGGER IF EXISTS trg_audit_users ON public.users;
CREATE TRIGGER trg_audit_users AFTER INSERT OR UPDATE OR DELETE ON public.users FOR EACH ROW EXECUTE FUNCTION fn_audit_changes();

DROP TRIGGER IF EXISTS trg_audit_texts ON public.texts;
CREATE TRIGGER trg_audit_texts AFTER INSERT OR UPDATE OR DELETE ON public.texts FOR EACH ROW EXECUTE FUNCTION fn_audit_changes();

-- Aplicar Nuevo Trigger para Estadísticas de Reseñas
DROP TRIGGER IF EXISTS trg_update_review_stats ON public.reviews;
CREATE TRIGGER trg_update_review_stats
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION fn_update_review_stats();

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para búsqueda de texto (GIN con trigramas)
CREATE INDEX IF NOT EXISTS idx_texts_title_trgm ON texts USING gin(texttitle gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_authors_fullname_trgm ON authors USING gin((authorname || ' ' || COALESCE(authormiddlename, '') || ' ' || COALESCE(authorlastname, '')) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_genres_name_trgm ON genres USING gin(genrename gin_trgm_ops);

-- Índices para claves foráneas (FK) y JOINS
CREATE INDEX IF NOT EXISTS idx_authors_countryid ON authors(countryid);
CREATE INDEX IF NOT EXISTS idx_editorials_countryid ON editorials(countryid);
CREATE INDEX IF NOT EXISTS idx_texts_typeid ON texts(typeid);

-- Índices para tablas de relación (N:M)
CREATE INDEX IF NOT EXISTS idx_text_authors_authorid ON text_authors(authorid);
CREATE INDEX IF NOT EXISTS idx_text_genres_genreid ON text_genres(genreid);
CREATE INDEX IF NOT EXISTS idx_text_editorials_editorialid ON text_editorials(editorialid);
CREATE INDEX IF NOT EXISTS idx_user_genres_userid ON user_genres(userid);
CREATE INDEX IF NOT EXISTS idx_user_books_userid ON user_books(userid);
CREATE INDEX IF NOT EXISTS idx_reading_progress_userid ON reading_progress(user_id);

-- Nuevos Índices para la tabla de reseñas
CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Índices para ordenamiento común
CREATE INDEX IF NOT EXISTS idx_texts_published_date ON texts(publisheddate DESC);
CREATE INDEX IF NOT EXISTS idx_texts_average_rating ON texts(average_rating DESC);

-- Índices únicos para integridad de datos
CREATE UNIQUE INDEX IF NOT EXISTS idx_genres_name_unique ON genres(LOWER(genrename));
CREATE UNIQUE INDEX IF NOT EXISTS idx_country_name_unique ON country(LOWER(countryname));
CREATE UNIQUE INDEX IF NOT EXISTS idx_texttype_unique ON texttype(LOWER(texttype));
