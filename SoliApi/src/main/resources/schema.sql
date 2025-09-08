-- CREATE database Soli_DB;

create table if not exists public.Texts(
    textID serial not null primary key,
    textTitle varchar(250) not null,
    publishedDate date
);

create table if not exists public.Authors(
    authorID serial not null primary key,
    authorName varchar(50) not null ,
    AuthorMiddleName varchar(50),
    authorLastName varchar(100)
);
create table if not exists public.Editorials(
    editorialID serial not null primary key,
    companyName varchar(250) not null
);

Create table if not exists public.Users(
    userID serial not null primary key,
    firstName varchar(50) not null,
    lastName varchar(50) not null ,
    activeMember boolean not null,
    genrePreference varchar(256)
);

Create table if not exists public.Country(
    countryID serial not null primary key,
    countryName varchar
);

Create Table if not exists public.Genres(
    genreID serial not null primary key,
    genreName varchar
);

Create table if not exists public.textType(
    typeID serial not null primary key,
    textType varchar
);

Create table if not exists public.Roles(
    roleID serial not null primary key,
    role varchar
);

alter table public.Texts add column if not exists
    authorID int references Authors(authorID);

alter table public.Texts add column if not exists
    editorialID int references Editorials(editorialID);

alter table public.Texts add column if not exists
    genreID int references Genres(genreID);

alter table public.Texts add column if not exists
    typeID int references textType(typeID);

alter table public.Authors add column if not exists
    countryID int references Country(countryID);

alter table public.Editorials add column if not exists
    countryID int references Country(countryID);

alter table public.Users add column if not exists
    roleID int references Roles(roleID);

alter table public.Users add column if not exists cognitoSub varchar(64);


