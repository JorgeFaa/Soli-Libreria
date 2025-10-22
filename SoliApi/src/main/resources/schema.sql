-- =====================================================
-- Base de datos: Soli_DB
-- =====================================================
--CREATE DATABASE Soli_DB;

-- =====================================================
-- Tablas de catálogo / referencia
-- =====================================================

CREATE TABLE IF NOT EXISTS country (
    countryid SERIAL PRIMARY KEY,
    countryname VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS genres (
    genreid SERIAL PRIMARY KEY,
    genrename VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS texttype (
    typeid SERIAL PRIMARY KEY,
    texttype VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Tablas principales
-- =====================================================

CREATE TABLE IF NOT EXISTS authors (
    authorid SERIAL PRIMARY KEY,
    authorname VARCHAR(50) NOT NULL,
    authormiddlename VARCHAR(50),
    authorlastname VARCHAR(100),
    countryid INT REFERENCES country(countryid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS editorials (
    editorialid SERIAL PRIMARY KEY,
    companyname VARCHAR(250) NOT NULL,
    countryid INT REFERENCES country(countryid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    userid SERIAL PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    activemember BOOLEAN NOT NULL DEFAULT TRUE,
    cognitosub VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS texts (
    textid SERIAL PRIMARY KEY,
    texttitle VARCHAR(250) NOT NULL,
    descripcion TEXT NOT NULL,
    publisheddate DATE,
    editorialid INT REFERENCES editorials(editorialid) NOT NULL,
    typeid INT REFERENCES texttype(typeid) NOT NULL,
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
    textid INT REFERENCES texts(textid) ON DELETE CASCADE,
    authorid INT REFERENCES authors(authorid) ON DELETE CASCADE,
    PRIMARY KEY (textid, authorid)
);

-- Un texto puede tener varios géneros y un género aplicarse a varios textos
CREATE TABLE IF NOT EXISTS text_genres (
    textid INT REFERENCES texts(textid) ON DELETE CASCADE,
    genreid INT REFERENCES genres(genreid) ON DELETE CASCADE,
    PRIMARY KEY (textid, genreid)
);

-- Un texto puede estar asociado a varias editoriales y una editorial a varios textos
CREATE TABLE IF NOT EXISTS text_editorials (
    textid INT REFERENCES texts(textid) ON DELETE CASCADE,
    editorialid INT REFERENCES editorials(editorialid) ON DELETE CASCADE,
    PRIMARY KEY (textid, editorialid)
);

-- Un usuario puede preferir varios géneros
CREATE TABLE IF NOT EXISTS user_genres (
    userid INT REFERENCES users(userid) ON DELETE CASCADE,
    genreid INT REFERENCES genres(genreid) ON DELETE CASCADE,
    PRIMARY KEY (userid, genreid)
);

-- Crear tabla de relación para libros favoritos
CREATE TABLE IF NOT EXISTS user_books (
    userid INT REFERENCES users(userid) ON DELETE CASCADE,
    textid INT REFERENCES texts(textid) ON DELETE CASCADE,
    PRIMARY KEY (userid, textid)
);


-- Modificar tabla de usuarios para eliminar tipo de miembro
ALTER TABLE users
DROP COLUMN IF EXISTS activemember;

