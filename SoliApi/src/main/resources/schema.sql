-- =====================================================
-- Base de datos: Soli_DB
-- =====================================================
--CREATE DATABASE Soli_DB;

-- =====================================================
-- Tablas de catálogo / referencia
-- =====================================================

CREATE TABLE IF NOT EXISTS country (
    countryid BIGSERIAL PRIMARY KEY,
    countryname VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS genres (
    genreid BIGSERIAL PRIMARY KEY,
    genrename VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS texttype (
    typeid BIGSERIAL PRIMARY KEY,
    texttype VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Tablas principales
-- =====================================================

CREATE TABLE IF NOT EXISTS authors (
    authorid BIGSERIAL PRIMARY KEY,
    authorname VARCHAR(50) NOT NULL,
    authormiddlename VARCHAR(50),
    authorlastname VARCHAR(100),
    countryid BIGINT REFERENCES country(countryid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS editorials (
    editorialid BIGSERIAL PRIMARY KEY,
    companyname VARCHAR(250) NOT NULL,
    countryid BIGINT REFERENCES country(countryid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    userid BIGSERIAL PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    cognitosub VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS texts (
    textid BIGSERIAL PRIMARY KEY,
    texttitle VARCHAR(250) NOT NULL,
    descripcion TEXT NOT NULL,
    publisheddate DATE,
    editorialid BIGINT REFERENCES editorials(editorialid) NOT NULL,
    typeid BIGINT REFERENCES texttype(typeid) NOT NULL,
    texturl VARCHAR(512) NOT NULL,
    coverurl VARCHAR(512) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Tablas de relación N:M
-- =====================================================

-- Un texto puede tener varios autores y un autor varios textos
CREATE TABLE IF NOT EXISTS text_authors (
    textid BIGINT REFERENCES texts(textid) ON DELETE CASCADE,
    authorid BIGINT REFERENCES authors(authorid) ON DELETE CASCADE,
    PRIMARY KEY (textid, authorid)
);

-- Un texto puede tener varios géneros y un género aplicarse a varios textos
CREATE TABLE IF NOT EXISTS text_genres (
    textid BIGINT REFERENCES texts(textid) ON DELETE CASCADE,
    genreid BIGINT REFERENCES genres(genreid) ON DELETE CASCADE,
    PRIMARY KEY (textid, genreid)
);

-- Un texto puede estar asociado a varias editoriales y una editorial a varios textos
CREATE TABLE IF NOT EXISTS text_editorials (
    textid BIGINT REFERENCES texts(textid) ON DELETE CASCADE,
    editorialid BIGINT REFERENCES editorials(editorialid) ON DELETE CASCADE,
    PRIMARY KEY (textid, editorialid)
);

-- Un usuario puede preferir varios géneros
CREATE TABLE IF NOT EXISTS user_genres (
    userid BIGINT REFERENCES users(userid) ON DELETE CASCADE,
    genreid BIGINT REFERENCES genres(genreid) ON DELETE CASCADE,
    PRIMARY KEY (userid, genreid)
);

-- Crear tabla de relación para libros favoritos
CREATE TABLE IF NOT EXISTS user_books (
    userid BIGINT REFERENCES users(userid) ON DELETE CASCADE,
    textid BIGINT REFERENCES texts(textid) ON DELETE CASCADE,
    PRIMARY KEY (userid, textid)
);


-- Modificar tabla de usuarios para eliminar tipo de miembro
ALTER TABLE users
DROP COLUMN IF EXISTS activemember;

