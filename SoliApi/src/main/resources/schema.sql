CREATE database Soli_DB;

create table Soli_DB.public.Texts(
    textID serial not null primary key,
    textTitle varchar(250) not null,
    publishedDate date
);

create table Soli_DB.public.Authors(
    authorID serial not null primary key,
    authorName varchar(50) not null ,
    AuthorMiddleName varchar(50),
    authorLastName varchar(100)
);
create table  Soli_DB.public.Editorials(
    editorialID serial not null primary key,
    companyName varchar(250) not null
);

Create table Soli_DB.public.Users(
    userID serial not null primary key,
    firstName varchar(50) not null,
    lastName varchar(50) not null ,
    activeMember boolean not null,
    genrePreference varchar(256)
);

Create table Soli_DB.public.Country(
    countryID serial not null primary key,
    countryName varchar
);

Create Table Soli_DB.public.Genres(
    genreID serial not null primary key,
    genreName varchar
);

Create table Soli_DB.public.textType(
    typeID serial not null primary key,
    textType varchar
);

Create table Soli_DB.public.Roles(
    roleID serial not null primary key,
    role varchar
);

alter table Soli_DB.public.Texts add column
    authorID int references Authors(authorID);

alter table Soli_DB.public.Texts add column
    editorialID int references Editorials(editorialID);

alter table Soli_DB.public.Texts add column
    genreID int references Genres(genreID);

alter table Soli_DB.public.Texts add column
    typeID int references textType(typeID);

alter table Soli_DB.public.Authors add column
    countryID int references Country(countryID);

alter table Soli_DB.public.Editorials add column
    countryID int references Country(countryID);

alter table Soli_DB.public.Users add column
    roleID int references Roles(roleID);