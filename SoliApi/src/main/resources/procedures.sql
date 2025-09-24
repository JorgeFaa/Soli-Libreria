------ USERS ------
-- CREATE
create or replace procedure sp_create_user(
    p_firstName varchar,
    p_lastName varchar,
    p_activeMember boolean,
    p_genrePreference varchar,
    p_roleID int,
    p_cognitoSub varchar
)
language plpgsql
as $$
begin
    insert into public.users(firstName, lastName, activeMember, genrePreference, roleID, cognitoSub)
    values(p_firstName, p_lastName, p_activeMember, p_genrePreference, p_roleID, p_cognitoSub);
end; $$;

-- READ (consulta por ID)
create or replace function sp_get_user(p_userID int)
returns table(
    userID int,
    firstName varchar,
    lastName varchar,
    activeMember boolean,
    genrePreference varchar,
    roleID int,
    cognitoSub varchar
)
language plpgsql
as $$
begin
    return query
    select u.userID, u.firstName, u.lastName, u.activeMember, u.genrePreference, u.roleID, u.cognitoSub
    from public.Users u
    where u.userID = p_userID;
end; $$;

-- UPDATE
create or replace procedure sp_update_user(
    p_userID int,
    p_firstName varchar,
    p_lastName varchar,
    p_activeMember boolean,
    p_genrePreference varchar,
    p_roleID int,
    p_cognitoSub varchar
)
language plpgsql
as $$
begin
    update public.Users
    set firstName = p_firstName,
        lastName = p_lastName,
        activeMember = p_activeMember,
        genrePreference = p_genrePreference,
        roleID = p_roleID,
        cognitoSub = p_cognitoSub
    where userID = p_userID;
end; $$;

-- DELETE
create or replace procedure sp_delete_user(p_userID int)
language plpgsql
as $$
begin
    delete from public.Users where userID = p_userID;
end; $$;

------ AUTHORS ------
-- CREATE
create or replace procedure sp_create_author(
    p_authorName varchar,
    p_authorMiddleName varchar,
    p_authorLastName varchar,
    p_countryID int
)
language plpgsql
as $$
begin
    insert into public.Authors(authorName, authorMiddleName, authorLastName, countryID)
    values(p_authorName, p_authorMiddleName, p_authorLastName, p_countryID);
end; $$;

-- READ (consulta por ID)
create or replace function sp_get_author(p_authorID int)
returns table(
    authorID int,
    authorName varchar,
    authorMiddleName varchar,
    authorLastName varchar,
    countryID int
)
language plpgsql
as $$
begin
    return query
    select a.authorID, a.authorName, a.authorMiddleName, a.authorLastName, a.countryID
    from public.Authors a
    where a.authorID = p_authorID;
end; $$;

-- UPDATE
create or replace procedure sp_update_author(
    p_authorID int,
    p_authorName varchar,
    p_authorMiddleName varchar,
    p_authorLastName varchar,
    p_countryID int
)
language plpgsql
as $$
begin
    update public.Authors
    set authorName = p_authorName,
        authorMiddleName = p_authorMiddleName,
        authorLastName = p_authorLastName,
        countryID = p_countryID
    where authorID = p_authorID;
end; $$;

-- DELETE
create or replace procedure sp_delete_author(p_authorID int)
language plpgsql
as $$
begin
    delete from public.Authors where authorID = p_authorID;
end; $$;

------ EDITORIALS ------
-- CREATE
create or replace procedure sp_create_editorial(
    p_companyName varchar,
    p_countryID int
)
language plpgsql
as $$
begin
    insert into public.Editorials(companyName, countryID)
    values(p_companyName, p_countryID);
end; $$;


-- READ (consulta por ID)
create or replace function sp_get_editorial(p_editorialID int)
returns table(
    editorialID int,
    companyName varchar,
    countryID int
)
language plpgsql
as $$
begin
    return query
    select e.editorialID, e.companyName, e.countryID
    from public.Editorials e
    where e.editorialID = p_editorialID;
end; $$;


-- UPDATE
create or replace procedure sp_update_editorial(
    p_editorialID int,
    p_companyName varchar,
    p_countryID int
)
language plpgsql
as $$
begin
    update public.Editorials
    set companyName = p_companyName,
        countryID   = p_countryID
    where editorialID = p_editorialID;
end; $$;


-- DELETE
create or replace procedure sp_delete_editorial(p_editorialID int)
language plpgsql
as $$
begin
    delete from public.Editorials where editorialID = p_editorialID;
end; $$;

------ GENRES ------
-- CREATE
create or replace procedure sp_create_genre(
    p_genreName varchar
)
language plpgsql
as $$
begin
    insert into public.Genres(genreName)
    values(p_genreName);
end; $$;


-- READ (consulta por ID)
create or replace function sp_get_genre(p_genreID int)
returns table(
    genreID int,
    genreName varchar
)
language plpgsql
as $$
begin
    return query
    select g.genreID, g.genreName
    from public.Genres g
    where g.genreID = p_genreID;
end; $$;


-- UPDATE
create or replace procedure sp_update_genre(
    p_genreID int,
    p_genreName varchar
)
language plpgsql
as $$
begin
    update public.Genres
    set genreName = p_genreName
    where genreID = p_genreID;
end; $$;


-- DELETE
create or replace procedure sp_delete_genre(p_genreID int)
language plpgsql
as $$
begin
    delete from public.Genres where genreID = p_genreID;
end; $$;

------ COUNTRY ------
-- CREATE
create or replace procedure sp_create_country(
    p_countryName varchar
)
language plpgsql
as $$
begin
    insert into public.Country(countryName)
    values(p_countryName);
end; $$;


-- READ (consulta por ID)
create or replace function sp_get_country(p_countryID int)
returns table(
    countryID int,
    countryName varchar
)
language plpgsql
as $$
begin
    return query
    select c.countryID, c.countryName
    from public.Country c
    where c.countryID = p_countryID;
end; $$;


-- UPDATE
create or replace procedure sp_update_country(
    p_countryID int,
    p_countryName varchar
)
language plpgsql
as $$
begin
    update public.Country
    set countryName = p_countryName
    where countryID = p_countryID;
end; $$;


-- DELETE
create or replace procedure sp_delete_country(p_countryID int)
language plpgsql
as $$
begin
    delete from public.Country where countryID = p_countryID;
end; $$;

------ ROLES ------
-- CREATE
create or replace procedure sp_create_role(
    p_role varchar
)
language plpgsql
as $$
begin
    insert into public.Roles(role)
    values(p_role);
end; $$;


-- READ (consulta por ID)
create or replace function sp_get_role(p_roleID int)
returns table(
    roleID int,
    role varchar
)
language plpgsql
as $$
begin
    return query
    select r.roleID, r.role
    from public.Roles r
    where r.roleID = p_roleID;
end; $$;


-- UPDATE
create or replace procedure sp_update_role(
    p_roleID int,
    p_role varchar
)
language plpgsql
as $$
begin
    update public.Roles
    set role = p_role
    where roleID = p_roleID;
end; $$;


-- DELETE
create or replace procedure sp_delete_role(p_roleID int)
language plpgsql
as $$
begin
    delete from public.Roles where roleID = p_roleID;
end; $$;


------ TEXTS TYPES------
-- CREATE
create or replace procedure sp_create_texttype(
    p_textType varchar
)
language plpgsql
as $$
begin
    insert into public.textType(textType)
    values(p_textType);
end; $$;


-- READ (consulta por ID)
create or replace function sp_get_texttype(p_typeID int)
returns table(
    typeID int,
    textType varchar
)
language plpgsql
as $$
begin
    return query
    select t.typeID, t.textType
    from public.textType t
    where t.typeID = p_typeID;
end; $$;


-- UPDATE
create or replace procedure sp_update_texttype(
    p_typeID int,
    p_textType varchar
)
language plpgsql
as $$
begin
    update public.textType
    set textType = p_textType
    where typeID = p_typeID;
end; $$;


-- DELETE
create or replace procedure sp_delete_texttype(p_typeID int)
language plpgsql
as $$
begin
    delete from public.textType where typeID = p_typeID;
end; $$;

------ TEXTS ------
-- CREATE
create or replace procedure sp_create_text(
    p_textTitle varchar,
    p_publishedDate date,
    p_authorID int,
    p_editorialID int,
    p_genreID int,
    p_typeID int
)
language plpgsql
as $$
begin
    insert into public.Texts(textTitle, publishedDate, authorID, editorialID, genreID, typeID)
    values(p_textTitle, p_publishedDate, p_authorID, p_editorialID, p_genreID, p_typeID);
end; $$;


-- READ (consulta por ID)
create or replace function sp_get_text(p_textID int)
returns table(
    textID int,
    textTitle varchar,
    publishedDate date,
    authorID int,
    editorialID int,
    genreID int,
    typeID int
)
language plpgsql
as $$
begin
    return query
    select t.textID, t.textTitle, t.publishedDate,
           t.authorID, t.editorialID, t.genreID, t.typeID
    from public.Texts t
    where t.textID = p_textID;
end; $$;


-- UPDATE
create or replace procedure sp_update_text(
    p_textID int,
    p_textTitle varchar,
    p_publishedDate date
)
language plpgsql
as $$
begin
    update public.Texts
    set textTitle    = p_textTitle,
        publishedDate = p_publishedDate
    where textID = p_textID;
end; $$;


-- DELETE
create or replace procedure sp_delete_text(p_textID int)
language plpgsql
as $$
begin
    delete from public.Texts where textID = p_textID;
end; $$;
