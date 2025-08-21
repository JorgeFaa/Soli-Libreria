CREATE database Soli_DB;

create table Soli_DB.public.Texts(
    textID serial not null primary key,
    textTitle varchar(250) not null,
    publishedDate date,
    textType varchar(50) not null ,
    genre varchar(20) not null
);

create table Soli_DB.public.Authors(
    authorID serial not null primary key,
    authorName varchar(50) not null ,
    AuthorMiddleName varchar(50),
    authorLastName varchar(100),
    country varchar(50) not null
);
create table  Soli_DB.public.Editorials(
    editorialID serial not null primary key,
    companyName varchar(250) not null ,
    country varchar(60) not null
);

Create table Soli_DB.public.users(
    userID serial not null primary key,
    firstName varchar(50) not null,
    lastName varchar(50) not null ,
    userEmail varchar(100) not null ,
    userRole varchar(15) not null ,
    activeMember boolean not null,
    genrePreference varchar(256)
);

alter table Soli_DB.public.Texts add column
    authorID int references Authors(authorID);

alter table Soli_DB.public.Texts add column
    editorialID int references Editorials(editorialID);
