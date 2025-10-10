------ USERS ------
-- CREATE (sin columnas inexistentes)
create or replace procedure sp_create_user(
    p_firstname varchar,
    p_lastname varchar,
    p_activemember boolean,
    p_cognitosub varchar
)
language plpgsql
as $$
begin
    insert into public.users(firstname, lastname, activemember, cognitosub)
    values(p_firstname, p_lastname, coalesce(p_activemember, true), p_cognitosub);
end; $$;

-- READ (consulta por ID)
create or replace function sp_get_user(p_userid int)
returns table(
    userid int,
    firstname varchar,
    lastname varchar,
    activemember boolean,
    cognitosub varchar
)
language plpgsql
as $$
begin
    return query
    select u.userid, u.firstname, u.lastname, u.activemember, u.cognitosub
    from public.users u
    where u.userid = p_userid;
end; $$;

-- UPDATE
create or replace procedure sp_update_user(
    p_userid int,
    p_firstname varchar,
    p_lastname varchar,
    p_activemember boolean
)
language plpgsql
as $$
begin
    update public.users
    set firstname = coalesce(p_firstname, firstname),
        lastname = coalesce(p_lastname, lastname),
        activemember = coalesce(p_activemember, activemember)
    where userid = p_userid;
end; $$;

-- DELETE
create or replace procedure sp_delete_user(p_userid int)
language plpgsql
as $$
begin
    delete from public.users where userid = p_userid;
end; $$;

-- Gestionar géneros preferidos (tabla N:M user_genres)
create or replace procedure sp_add_user_genre(p_userid int, p_genreid int)
language plpgsql
as $$
begin
    insert into public.user_genres(userid, genreid)
    values(p_userid, p_genreid)
    on conflict (userid, genreid) do nothing;
end; $$;

create or replace procedure sp_remove_user_genre(p_userid int, p_genreid int)
language plpgsql
as $$
begin
    delete from public.user_genres where userid = p_userid and genreid = p_genreid;
end; $$;

------ AUTHORS ------
-- CREATE
create or replace procedure sp_create_author(
    p_authorname varchar,
    p_authormiddlename varchar,
    p_authorlastname varchar,
    p_countryid int
)
language plpgsql
as $$
begin
    insert into public.authors(authorname, authormiddlename, authorlastname, countryid)
    values(p_authorname, p_authormiddlename, p_authorlastname, p_countryid);
end; $$;

-- READ (consulta por ID)
create or replace function sp_get_author(p_authorid int)
returns table(
    authorid int,
    authorname varchar,
    authormiddlename varchar,
    authorlastname varchar,
    countryid int
)
language plpgsql
as $$
begin
    return query
    select a.authorid, a.authorname, a.authormiddlename, a.authorlastname, a.countryid
    from public.authors a
    where a.authorid = p_authorid;
end; $$;

-- UPDATE
create or replace procedure sp_update_author(
    p_authorid int,
    p_authorname varchar,
    p_authormiddlename varchar,
    p_authorlastname varchar,
    p_countryid int
)
language plpgsql
as $$
begin
    update public.authors
    set authorname = coalesce(p_authorname, authorname),
        authormiddlename = coalesce(p_authormiddlename, authormiddlename),
        authorlastname = coalesce(p_authorlastname, authorlastname),
        countryid = coalesce(p_countryid, countryid)
    where authorid = p_authorid;
end; $$;

-- DELETE
create or replace procedure sp_delete_author(p_authorid int)
language plpgsql
as $$
begin
    delete from public.authors where authorid = p_authorid;
end; $$;

------ EDITORIALS ------
-- CREATE
create or replace procedure sp_create_editorial(
    p_companyname varchar,
    p_countryid int
)
language plpgsql
as $$
begin
    insert into public.editorials(companyname, countryid)
    values(p_companyname, p_countryid);
end; $$;

-- READ (consulta por ID)
create or replace function sp_get_editorial(p_editorialid int)
returns table(
    editorialid int,
    companyname varchar,
    countryid int
)
language plpgsql
as $$
begin
    return query
    select e.editorialid, e.companyname, e.countryid
    from public.editorials e
    where e.editorialid = p_editorialid;
end; $$;

-- UPDATE
create or replace procedure sp_update_editorial(
    p_editorialid int,
    p_companyname varchar,
    p_countryid int
)
language plpgsql
as $$
begin
    update public.editorials
    set companyname = coalesce(p_companyname, companyname),
        countryid   = coalesce(p_countryid, countryid)
    where editorialid = p_editorialid;
end; $$;

-- DELETE
create or replace procedure sp_delete_editorial(p_editorialid int)
language plpgsql
as $$
begin
    delete from public.editorials where editorialid = p_editorialid;
end; $$;

------ GENRES ------
-- CREATE
create or replace procedure sp_create_genre(
    p_genrename varchar
)
language plpgsql
as $$
begin
    insert into public.genres(genrename)
    values(p_genrename);
end; $$;

-- READ (consulta por ID)
create or replace function sp_get_genre(p_genreid int)
returns table(
    genreid int,
    genrename varchar
)
language plpgsql
as $$
begin
    return query
    select g.genreid, g.genrename
    from public.genres g
    where g.genreid = p_genreid;
end; $$;

-- UPDATE
create or replace procedure sp_update_genre(
    p_genreid int,
    p_genrename varchar
)
language plpgsql
as $$
begin
    update public.genres
    set genrename = coalesce(p_genrename, genrename)
    where genreid = p_genreid;
end; $$;

-- DELETE
create or replace procedure sp_delete_genre(p_genreid int)
language plpgsql
as $$
begin
    delete from public.genres where genreid = p_genreid;
end; $$;

------ COUNTRY ------
-- CREATE
create or replace procedure sp_create_country(
    p_countryname varchar
)
language plpgsql
as $$
begin
    insert into public.country(countryname)
    values(p_countryname);
end; $$;

-- READ (consulta por ID)
create or replace function sp_get_country(p_countryid int)
returns table(
    countryid int,
    countryname varchar
)
language plpgsql
as $$
begin
    return query
    select c.countryid, c.countryname
    from public.country c
    where c.countryid = p_countryid;
end; $$;

-- UPDATE
create or replace procedure sp_update_country(
    p_countryid int,
    p_countryname varchar
)
language plpgsql
as $$
begin
    update public.country
    set countryname = coalesce(p_countryname, countryname)
    where countryid = p_countryid;
end; $$;

-- DELETE
create or replace procedure sp_delete_country(p_countryid int)
language plpgsql
as $$
begin
    delete from public.country where countryid = p_countryid;
end; $$;

------ TEXT TYPES ------
-- CREATE
create or replace procedure sp_create_texttype(
    p_texttype varchar
)
language plpgsql
as $$
begin
    insert into public.texttype(texttype)
    values(p_texttype);
end; $$;

-- READ (consulta por ID)
create or replace function sp_get_texttype(p_typeid int)
returns table(
    typeid int,
    texttype varchar
)
language plpgsql
as $$
begin
    return query
    select t.typeid, t.texttype
    from public.texttype t
    where t.typeid = p_typeid;
end; $$;

-- UPDATE
create or replace procedure sp_update_texttype(
    p_typeid int,
    p_texttype varchar
)
language plpgsql
as $$
begin
    update public.texttype
    set texttype = coalesce(p_texttype, texttype)
    where typeid = p_typeid;
end; $$;

-- DELETE
create or replace procedure sp_delete_texttype(p_typeid int)
language plpgsql
as $$
begin
    delete from public.texttype where typeid = p_typeid;
end; $$;

------ TEXTS (LIBROS) ------
-- Crear texto con relaciones (autores, editoriales, géneros)
create or replace procedure sp_create_text(
    p_texttitle varchar,
    p_descripcion text,
    p_publisheddate date,
    p_typeid int,
    p_texturl varchar,
    p_coverurl varchar,
    p_author_ids int[],
    p_editorial_ids int[],
    p_genre_ids int[]
)
language plpgsql
as $$
declare
    v_textid int;
begin
    insert into public.texts(texttitle, descripcion, publisheddate, typeid, texturl, coverurl)
    values(p_texttitle, p_descripcion, p_publisheddate, p_typeid, p_texturl, p_coverurl)
    returning textid into v_textid;

    if p_author_ids is not null then
        foreach v_authorid in array p_author_ids loop
            insert into public.text_authors(textid, authorid)
            values(v_textid, v_authorid)
            on conflict do nothing;
        end loop;
    end if;

    if p_editorial_ids is not null then
        foreach v_editorialid in array p_editorial_ids loop
            insert into public.text_editorials(textid, editorialid)
            values(v_textid, v_editorialid)
            on conflict do nothing;
        end loop;
    end if;

    if p_genre_ids is not null then
        foreach v_genreid in array p_genre_ids loop
            insert into public.text_genres(textid, genreid)
            values(v_textid, v_genreid)
            on conflict do nothing;
        end loop;
    end if;
end; $$;

-- Obtener texto básico (sin agregaciones)
create or replace function sp_get_text(p_textid int)
returns table(
    textid int,
    texttitle varchar,
    descripcion text,
    publisheddate date,
    typeid int,
    texturl varchar,
    coverurl varchar
)
language plpgsql
as $$
begin
    return query
    select t.textid, t.texttitle, t.descripcion, t.publisheddate, t.typeid, t.texturl, t.coverurl
    from public.texts t
    where t.textid = p_textid;
end; $$;

-- Actualizar texto y, si vienen arrays, reemplazar relaciones
create or replace procedure sp_update_text(
    p_textid int,
    p_texttitle varchar default null,
    p_descripcion text default null,
    p_publisheddate date default null,
    p_typeid int default null,
    p_texturl varchar default null,
    p_coverurl varchar default null,
    p_author_ids int[] default null,
    p_editorial_ids int[] default null,
    p_genre_ids int[] default null
)
language plpgsql
as $$
begin
    update public.texts
    set texttitle = coalesce(p_texttitle, texttitle),
        descripcion = coalesce(p_descripcion, descripcion),
        publisheddate = coalesce(p_publisheddate, publisheddate),
        typeid = coalesce(p_typeid, typeid),
        texturl = coalesce(p_texturl, texturl),
        coverurl = coalesce(p_coverurl, coverurl)
    where textid = p_textid;

    if p_author_ids is not null then
        delete from public.text_authors where textid = p_textid;
        foreach v_authorid in array p_author_ids loop
            insert into public.text_authors(textid, authorid)
            values(p_textid, v_authorid)
            on conflict do nothing;
        end loop;
    end if;

    if p_editorial_ids is not null then
        delete from public.text_editorials where textid = p_textid;
        foreach v_editorialid in array p_editorial_ids loop
            insert into public.text_editorials(textid, editorialid)
            values(p_textid, v_editorialid)
            on conflict do nothing;
        end loop;
    end if;

    if p_genre_ids is not null then
        delete from public.text_genres where textid = p_textid;
        foreach v_genreid in array p_genre_ids loop
            insert into public.text_genres(textid, genreid)
            values(p_textid, v_genreid)
            on conflict do nothing;
        end loop;
    end if;
end; $$;

-- Eliminar texto (joins caen por ON DELETE CASCADE)
create or replace procedure sp_delete_text(p_textid int)
language plpgsql
as $$
begin
    delete from public.texts where textid = p_textid;
end; $$;
