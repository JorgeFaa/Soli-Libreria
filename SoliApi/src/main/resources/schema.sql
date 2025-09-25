-- =====================================================
-- Base de datos: Soli_DB
-- =====================================================
--CREATE DATABASE Soli_DB;

-- =====================================================
-- Tablas de catálogo / referencia
-- =====================================================

CREATE TABLE IF NOT EXISTS Country (
    countryID SERIAL PRIMARY KEY,
    countryName VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Genres (
    genreID SERIAL PRIMARY KEY,
    genreName VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS TextType (
    typeID SERIAL PRIMARY KEY,
    textType VARCHAR(100) NOT NULL
);

-- =====================================================
-- Tablas principales
-- =====================================================

CREATE TABLE IF NOT EXISTS Authors (
    authorID SERIAL PRIMARY KEY,
    authorName VARCHAR(50) NOT NULL,
    authorMiddleName VARCHAR(50),
    authorLastName VARCHAR(100),
    countryID INT REFERENCES Country(countryID)
);

CREATE TABLE IF NOT EXISTS Editorials (
    editorialID SERIAL PRIMARY KEY,
    companyName VARCHAR(250) NOT NULL,
    countryID INT REFERENCES Country(countryID)
);

CREATE TABLE IF NOT EXISTS Users (
    userID SERIAL PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    activeMember BOOLEAN NOT NULL DEFAULT TRUE,
    cognitoSub VARCHAR(64) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Texts (
    textID SERIAL PRIMARY KEY,
    textTitle VARCHAR(250) NOT NULL,
    publishedDate DATE,
    editorialID INT REFERENCES Editorials(editorialID),
    typeID INT REFERENCES TextType(typeID),
    textUrl VARCHAR(512),
    coverUrl VARCHAR(512)
);

-- =====================================================
-- Tablas de relación N:M
-- =====================================================

-- Un texto puede tener varios autores y un autor varios textos
CREATE TABLE IF NOT EXISTS TextAuthors (
    textID INT REFERENCES Texts(textID) ON DELETE CASCADE,
    authorID INT REFERENCES Authors(authorID) ON DELETE CASCADE,
    PRIMARY KEY (textID, authorID)
);

-- Un texto puede tener varios géneros y un género aplicarse a varios textos
CREATE TABLE IF NOT EXISTS TextGenres (
    textID INT REFERENCES Texts(textID) ON DELETE CASCADE,
    genreID INT REFERENCES Genres(genreID) ON DELETE CASCADE,
    PRIMARY KEY (textID, genreID)
);

-- Un usuario puede preferir varios géneros
CREATE TABLE IF NOT EXISTS UserGenres (
    userID INT REFERENCES Users(userID) ON DELETE CASCADE,
    genreID INT REFERENCES Genres(genreID) ON DELETE CASCADE,
    PRIMARY KEY (userID, genreID)
);

