
   ---- Create Database ----
CREATE database Soli_DB;


   ---- Create Main Tables ----
create table Soli_DB.public.Texts(
    textID serial not null primary key,
    textTitle varchar(250) not null,
    publishedDate date,
    editorialID INT references Editorials(editorialID),
    typeID INT references TextType(typeID),
    textUrl varchar(512),
    coverUrl varchar(512)
);

create table Soli_DB.public.Authors(
    authorID serial not null primary key,
    authorName varchar(50) not null ,
    AuthorMiddleName varchar(50),
    authorLastName varchar(100),
    countryID INT references Country(countryID)
);
create table  Soli_DB.public.Editorials(
    editorialID serial not null primary key,
    companyName varchar(250) not null,
    countryID INT references Country(countryID)
);

Create table Soli_DB.public.Users(
    userID serial not null primary key,
    firstName varchar(50) not null,
    lastName varchar(50) not null ,
    activeMember boolean not null DEFAULT TRUE,
    cognitoSub varchar(64) UNIQUE  NOT NULL
);

   ---- Create Auxiliary Catalog Tables ----

Create table Soli_DB.public.Country(
    countryID serial not null primary key,
    countryName varchar
);

Create Table Soli_DB.public.Genres(
    genreID serial not null primary key,
    genreName varchar
);

Create table Soli_DB.public.TextType(
    typeID serial not null primary key,
    textType varchar
);

Create table Soli_DB.public.Roles(
    roleID serial not null primary key,
    role varchar
);

     ---- Create Tables Many to Many ----

CREATE TABLE IF NOT EXISTS TextGenres(
    textID INT references Texts(textID) ON DELETE CASCADE,
    genreID INT references Genres(genreID) ON DELETE CASCADE,
    PRIMARY KEY (textID, genreID)
);

CREATE TABLE IF NOT EXISTS TextAuthors(
    textID INT references Texts(textID) ON DELETE CASCADE,
    authorID INT REFERENCES Authors(authorID) ON DELETE CASCADE,
    PRIMARY KEY (textID, authorID)
);

CREATE TABLE IF NOT EXISTS UserGenres(
    userID INT references  Users(userID) ON DELETE CASCADE,
    genreID INT references Genres(genreID) ON DELETE CASCADE,
    PRIMARY KEY (userID, genreID)
)
