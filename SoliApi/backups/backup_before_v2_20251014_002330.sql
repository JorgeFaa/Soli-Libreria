--
-- PostgreSQL database dump
--

\restrict 3pNCVYMADEcOEoupLmK2JO0W2pYG0BJqB7q2fiK1st2jLZMXAAGMqUvrSCHeXcD

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-10-14 00:23:30 CST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS "Soli_DB";
--
-- TOC entry 4107 (class 1262 OID 16562)
-- Name: Soli_DB; Type: DATABASE; Schema: -; Owner: cloudsqlsuperuser
--

CREATE DATABASE "Soli_DB" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF8';


ALTER DATABASE "Soli_DB" OWNER TO cloudsqlsuperuser;

\unrestrict 3pNCVYMADEcOEoupLmK2JO0W2pYG0BJqB7q2fiK1st2jLZMXAAGMqUvrSCHeXcD
\connect "Soli_DB"
\restrict 3pNCVYMADEcOEoupLmK2JO0W2pYG0BJqB7q2fiK1st2jLZMXAAGMqUvrSCHeXcD

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 282 (class 1255 OID 16994)
-- Name: fn_audit_changes(); Type: FUNCTION; Schema: public; Owner: Soli_DB_Admin
--

CREATE FUNCTION public.fn_audit_changes() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    v_id int;
begin
    if tg_table_name = 'users' then
        if tg_op = 'DELETE' then
            v_id := old.userid;
        else
            v_id := new.userid;
        end if;
    elsif tg_table_name = 'texts' then
        if tg_op = 'DELETE' then
            v_id := old.textid;
        else
            v_id := new.textid;
        end if;
    end if;

    insert into public.auditlog(tablename, action, recordid)
    values(tg_table_name, tg_op, v_id);

    return case when tg_op = 'DELETE' then old else new end;
end; $$;


ALTER FUNCTION public.fn_audit_changes() OWNER TO "Soli_DB_Admin";

--
-- TOC entry 277 (class 1255 OID 16982)
-- Name: fn_format_names(); Type: FUNCTION; Schema: public; Owner: Soli_DB_Admin
--

CREATE FUNCTION public.fn_format_names() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if tg_table_name = 'authors' then
        new.authorname := initcap(new.authorname);
        if new.authormiddlename is not null then
            new.authormiddlename := initcap(new.authormiddlename);
        end if;
        if new.authorlastname is not null then
            new.authorlastname := initcap(new.authorlastname);
        end if;

    elsif tg_table_name = 'users' then
        new.firstname := initcap(new.firstname);
        new.lastname := initcap(new.lastname);

    elsif tg_table_name = 'editorials' then
        new.companyname := initcap(new.companyname);
    end if;
    return new;
end; $$;


ALTER FUNCTION public.fn_format_names() OWNER TO "Soli_DB_Admin";

--
-- TOC entry 283 (class 1255 OID 16997)
-- Name: fn_prevent_duplicates(); Type: FUNCTION; Schema: public; Owner: Soli_DB_Admin
--

CREATE FUNCTION public.fn_prevent_duplicates() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    v_exists int;
begin
    if tg_table_name = 'genres' then
        select count(*) into v_exists
        from public.genres
        where lower(genrename) = lower(new.genrename)
          and (tg_op = 'INSERT' or genreid <> new.genreid);

        if v_exists > 0 then
            raise exception 'Ya existe un género con ese nombre.';
        end if;
    end if;

    return new;
end; $$;


ALTER FUNCTION public.fn_prevent_duplicates() OWNER TO "Soli_DB_Admin";

--
-- TOC entry 243 (class 1255 OID 16980)
-- Name: fn_validate_text_date(); Type: FUNCTION; Schema: public; Owner: Soli_DB_Admin
--

CREATE FUNCTION public.fn_validate_text_date() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if new.publisheddate > current_date then
        raise exception 'La fecha de publicación no puede ser futura.';
    end if;
    return new;
end; $$;


ALTER FUNCTION public.fn_validate_text_date() OWNER TO "Soli_DB_Admin";

--
-- TOC entry 242 (class 1255 OID 16953)
-- Name: sp_add_user_genre(integer, integer); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_add_user_genre(IN p_userid integer, IN p_genreid integer)
    LANGUAGE plpgsql
    AS $$
begin
    insert into public.user_genres(userid, genreid)
    values(p_userid, p_genreid)
    on conflict (userid, genreid) do nothing;
end; $$;


ALTER PROCEDURE public.sp_add_user_genre(IN p_userid integer, IN p_genreid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 254 (class 1255 OID 16955)
-- Name: sp_create_author(character varying, character varying, character varying, integer); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_create_author(IN p_authorname character varying, IN p_authormiddlename character varying, IN p_authorlastname character varying, IN p_countryid integer)
    LANGUAGE plpgsql
    AS $$
begin
    insert into public.authors(authorname, authormiddlename, authorlastname, countryid)
    values(p_authorname, p_authormiddlename, p_authorlastname, p_countryid);
end; $$;


ALTER PROCEDURE public.sp_create_author(IN p_authorname character varying, IN p_authormiddlename character varying, IN p_authorlastname character varying, IN p_countryid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 247 (class 1255 OID 16967)
-- Name: sp_create_country(character varying); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_create_country(IN p_countryname character varying)
    LANGUAGE plpgsql
    AS $$
begin
    insert into public.country(countryname)
    values(p_countryname);
end; $$;


ALTER PROCEDURE public.sp_create_country(IN p_countryname character varying) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 244 (class 1255 OID 16959)
-- Name: sp_create_editorial(character varying, integer); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_create_editorial(IN p_companyname character varying, IN p_countryid integer)
    LANGUAGE plpgsql
    AS $$
begin
    insert into public.editorials(companyname, countryid)
    values(p_companyname, p_countryid);
end; $$;


ALTER PROCEDURE public.sp_create_editorial(IN p_companyname character varying, IN p_countryid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 271 (class 1255 OID 16963)
-- Name: sp_create_genre(character varying); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_create_genre(IN p_genrename character varying)
    LANGUAGE plpgsql
    AS $$
begin
    insert into public.genres(genrename)
    values(p_genrename);
end; $$;


ALTER PROCEDURE public.sp_create_genre(IN p_genrename character varying) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 278 (class 1255 OID 16976)
-- Name: sp_create_text(character varying, text, date, integer, character varying, character varying, integer[], integer[], integer[]); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_create_text(IN p_texttitle character varying, IN p_descripcion text, IN p_publisheddate date, IN p_typeid integer, IN p_texturl character varying, IN p_coverurl character varying, IN p_author_ids integer[], IN p_editorial_ids integer[], IN p_genre_ids integer[])
    LANGUAGE plpgsql
    AS $$
declare
    v_textid int;
    v_authorid int;
    v_editorialid int;
    v_genreid int;
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


ALTER PROCEDURE public.sp_create_text(IN p_texttitle character varying, IN p_descripcion text, IN p_publisheddate date, IN p_typeid integer, IN p_texturl character varying, IN p_coverurl character varying, IN p_author_ids integer[], IN p_editorial_ids integer[], IN p_genre_ids integer[]) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 249 (class 1255 OID 16971)
-- Name: sp_create_texttype(character varying); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_create_texttype(IN p_texttype character varying)
    LANGUAGE plpgsql
    AS $$
begin
    insert into public.texttype(texttype)
    values(p_texttype);
end; $$;


ALTER PROCEDURE public.sp_create_texttype(IN p_texttype character varying) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 239 (class 1255 OID 16949)
-- Name: sp_create_user(character varying, character varying, boolean, character varying); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_create_user(IN p_firstname character varying, IN p_lastname character varying, IN p_activemember boolean, IN p_cognitosub character varying)
    LANGUAGE plpgsql
    AS $$
begin
    insert into public.users(firstname, lastname, activemember, cognitosub)
    values(p_firstname, p_lastname, coalesce(p_activemember, true), p_cognitosub);
end; $$;


ALTER PROCEDURE public.sp_create_user(IN p_firstname character varying, IN p_lastname character varying, IN p_activemember boolean, IN p_cognitosub character varying) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 268 (class 1255 OID 16958)
-- Name: sp_delete_author(integer); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_delete_author(IN p_authorid integer)
    LANGUAGE plpgsql
    AS $$
begin
    delete from public.authors where authorid = p_authorid;
end; $$;


ALTER PROCEDURE public.sp_delete_author(IN p_authorid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 275 (class 1255 OID 16970)
-- Name: sp_delete_country(integer); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_delete_country(IN p_countryid integer)
    LANGUAGE plpgsql
    AS $$
begin
    delete from public.country where countryid = p_countryid;
end; $$;


ALTER PROCEDURE public.sp_delete_country(IN p_countryid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 245 (class 1255 OID 16962)
-- Name: sp_delete_editorial(integer); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_delete_editorial(IN p_editorialid integer)
    LANGUAGE plpgsql
    AS $$
begin
    delete from public.editorials where editorialid = p_editorialid;
end; $$;


ALTER PROCEDURE public.sp_delete_editorial(IN p_editorialid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 273 (class 1255 OID 16966)
-- Name: sp_delete_genre(integer); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_delete_genre(IN p_genreid integer)
    LANGUAGE plpgsql
    AS $$
begin
    delete from public.genres where genreid = p_genreid;
end; $$;


ALTER PROCEDURE public.sp_delete_genre(IN p_genreid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 281 (class 1255 OID 16979)
-- Name: sp_delete_text(integer); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_delete_text(IN p_textid integer)
    LANGUAGE plpgsql
    AS $$
begin
    delete from public.texts where textid = p_textid;
end; $$;


ALTER PROCEDURE public.sp_delete_text(IN p_textid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 251 (class 1255 OID 16974)
-- Name: sp_delete_texttype(integer); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_delete_texttype(IN p_typeid integer)
    LANGUAGE plpgsql
    AS $$
begin
    delete from public.texttype where typeid = p_typeid;
end; $$;


ALTER PROCEDURE public.sp_delete_texttype(IN p_typeid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 241 (class 1255 OID 16952)
-- Name: sp_delete_user(integer); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_delete_user(IN p_userid integer)
    LANGUAGE plpgsql
    AS $$
begin
    delete from public.users where userid = p_userid;
end; $$;


ALTER PROCEDURE public.sp_delete_user(IN p_userid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 255 (class 1255 OID 16956)
-- Name: sp_get_author(integer); Type: FUNCTION; Schema: public; Owner: Soli_DB_Admin
--

CREATE FUNCTION public.sp_get_author(p_authorid integer) RETURNS TABLE(authorid integer, authorname character varying, authormiddlename character varying, authorlastname character varying, countryid integer)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select a.authorid, a.authorname, a.authormiddlename, a.authorlastname, a.countryid
    from public.authors a
    where a.authorid = p_authorid;
end; $$;


ALTER FUNCTION public.sp_get_author(p_authorid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 274 (class 1255 OID 16968)
-- Name: sp_get_country(integer); Type: FUNCTION; Schema: public; Owner: Soli_DB_Admin
--

CREATE FUNCTION public.sp_get_country(p_countryid integer) RETURNS TABLE(countryid integer, countryname character varying)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select c.countryid, c.countryname
    from public.country c
    where c.countryid = p_countryid;
end; $$;


ALTER FUNCTION public.sp_get_country(p_countryid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 269 (class 1255 OID 16960)
-- Name: sp_get_editorial(integer); Type: FUNCTION; Schema: public; Owner: Soli_DB_Admin
--

CREATE FUNCTION public.sp_get_editorial(p_editorialid integer) RETURNS TABLE(editorialid integer, companyname character varying, countryid integer)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select e.editorialid, e.companyname, e.countryid
    from public.editorials e
    where e.editorialid = p_editorialid;
end; $$;


ALTER FUNCTION public.sp_get_editorial(p_editorialid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 272 (class 1255 OID 16964)
-- Name: sp_get_genre(integer); Type: FUNCTION; Schema: public; Owner: Soli_DB_Admin
--

CREATE FUNCTION public.sp_get_genre(p_genreid integer) RETURNS TABLE(genreid integer, genrename character varying)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select g.genreid, g.genrename
    from public.genres g
    where g.genreid = p_genreid;
end; $$;


ALTER FUNCTION public.sp_get_genre(p_genreid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 279 (class 1255 OID 16977)
-- Name: sp_get_text(integer); Type: FUNCTION; Schema: public; Owner: Soli_DB_Admin
--

CREATE FUNCTION public.sp_get_text(p_textid integer) RETURNS TABLE(textid integer, texttitle character varying, descripcion text, publisheddate date, typeid integer, texturl character varying, coverurl character varying)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select t.textid, t.texttitle, t.descripcion, t.publisheddate, t.typeid, t.texturl, t.coverurl
    from public.texts t
    where t.textid = p_textid;
end; $$;


ALTER FUNCTION public.sp_get_text(p_textid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 276 (class 1255 OID 16972)
-- Name: sp_get_texttype(integer); Type: FUNCTION; Schema: public; Owner: Soli_DB_Admin
--

CREATE FUNCTION public.sp_get_texttype(p_typeid integer) RETURNS TABLE(typeid integer, texttype character varying)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select t.typeid, t.texttype
    from public.texttype t
    where t.typeid = p_typeid;
end; $$;


ALTER FUNCTION public.sp_get_texttype(p_typeid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 252 (class 1255 OID 16950)
-- Name: sp_get_user(integer); Type: FUNCTION; Schema: public; Owner: Soli_DB_Admin
--

CREATE FUNCTION public.sp_get_user(p_userid integer) RETURNS TABLE(userid integer, firstname character varying, lastname character varying, activemember boolean, cognitosub character varying)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select u.userid, u.firstname, u.lastname, u.activemember, u.cognitosub
    from public.users u
    where u.userid = p_userid;
end; $$;


ALTER FUNCTION public.sp_get_user(p_userid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 253 (class 1255 OID 16954)
-- Name: sp_remove_user_genre(integer, integer); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_remove_user_genre(IN p_userid integer, IN p_genreid integer)
    LANGUAGE plpgsql
    AS $$
begin
    delete from public.user_genres where userid = p_userid and genreid = p_genreid;
end; $$;


ALTER PROCEDURE public.sp_remove_user_genre(IN p_userid integer, IN p_genreid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 266 (class 1255 OID 16957)
-- Name: sp_update_author(integer, character varying, character varying, character varying, integer); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_update_author(IN p_authorid integer, IN p_authorname character varying, IN p_authormiddlename character varying, IN p_authorlastname character varying, IN p_countryid integer)
    LANGUAGE plpgsql
    AS $$
begin
    update public.authors
    set authorname = coalesce(p_authorname, authorname),
        authormiddlename = coalesce(p_authormiddlename, authormiddlename),
        authorlastname = coalesce(p_authorlastname, authorlastname),
        countryid = coalesce(p_countryid, countryid)
    where authorid = p_authorid;
end; $$;


ALTER PROCEDURE public.sp_update_author(IN p_authorid integer, IN p_authorname character varying, IN p_authormiddlename character varying, IN p_authorlastname character varying, IN p_countryid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 248 (class 1255 OID 16969)
-- Name: sp_update_country(integer, character varying); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_update_country(IN p_countryid integer, IN p_countryname character varying)
    LANGUAGE plpgsql
    AS $$
begin
    update public.country
    set countryname = coalesce(p_countryname, countryname)
    where countryid = p_countryid;
end; $$;


ALTER PROCEDURE public.sp_update_country(IN p_countryid integer, IN p_countryname character varying) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 270 (class 1255 OID 16961)
-- Name: sp_update_editorial(integer, character varying, integer); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_update_editorial(IN p_editorialid integer, IN p_companyname character varying, IN p_countryid integer)
    LANGUAGE plpgsql
    AS $$
begin
    update public.editorials
    set companyname = coalesce(p_companyname, companyname),
        countryid   = coalesce(p_countryid, countryid)
    where editorialid = p_editorialid;
end; $$;


ALTER PROCEDURE public.sp_update_editorial(IN p_editorialid integer, IN p_companyname character varying, IN p_countryid integer) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 246 (class 1255 OID 16965)
-- Name: sp_update_genre(integer, character varying); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_update_genre(IN p_genreid integer, IN p_genrename character varying)
    LANGUAGE plpgsql
    AS $$
begin
    update public.genres
    set genrename = coalesce(p_genrename, genrename)
    where genreid = p_genreid;
end; $$;


ALTER PROCEDURE public.sp_update_genre(IN p_genreid integer, IN p_genrename character varying) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 280 (class 1255 OID 16978)
-- Name: sp_update_text(integer, character varying, text, date, integer, character varying, character varying, integer[], integer[], integer[]); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_update_text(IN p_textid integer, IN p_texttitle character varying DEFAULT NULL::character varying, IN p_descripcion text DEFAULT NULL::text, IN p_publisheddate date DEFAULT NULL::date, IN p_typeid integer DEFAULT NULL::integer, IN p_texturl character varying DEFAULT NULL::character varying, IN p_coverurl character varying DEFAULT NULL::character varying, IN p_author_ids integer[] DEFAULT NULL::integer[], IN p_editorial_ids integer[] DEFAULT NULL::integer[], IN p_genre_ids integer[] DEFAULT NULL::integer[])
    LANGUAGE plpgsql
    AS $$
declare
    v_authorid int;
    v_editorialid int;
    v_genreid int;
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


ALTER PROCEDURE public.sp_update_text(IN p_textid integer, IN p_texttitle character varying, IN p_descripcion text, IN p_publisheddate date, IN p_typeid integer, IN p_texturl character varying, IN p_coverurl character varying, IN p_author_ids integer[], IN p_editorial_ids integer[], IN p_genre_ids integer[]) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 250 (class 1255 OID 16973)
-- Name: sp_update_texttype(integer, character varying); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_update_texttype(IN p_typeid integer, IN p_texttype character varying)
    LANGUAGE plpgsql
    AS $$
begin
    update public.texttype
    set texttype = coalesce(p_texttype, texttype)
    where typeid = p_typeid;
end; $$;


ALTER PROCEDURE public.sp_update_texttype(IN p_typeid integer, IN p_texttype character varying) OWNER TO "Soli_DB_Admin";

--
-- TOC entry 240 (class 1255 OID 16951)
-- Name: sp_update_user(integer, character varying, character varying, boolean); Type: PROCEDURE; Schema: public; Owner: Soli_DB_Admin
--

CREATE PROCEDURE public.sp_update_user(IN p_userid integer, IN p_firstname character varying, IN p_lastname character varying, IN p_activemember boolean)
    LANGUAGE plpgsql
    AS $$
begin
    update public.users
    set firstname = coalesce(p_firstname, firstname),
        lastname = coalesce(p_lastname, lastname),
        activemember = coalesce(p_activemember, activemember)
    where userid = p_userid;
end; $$;


ALTER PROCEDURE public.sp_update_user(IN p_userid integer, IN p_firstname character varying, IN p_lastname character varying, IN p_activemember boolean) OWNER TO "Soli_DB_Admin";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 236 (class 1259 OID 16987)
-- Name: auditlog; Type: TABLE; Schema: public; Owner: Soli_DB_Admin
--

CREATE TABLE public.auditlog (
    logid integer NOT NULL,
    tablename character varying(50),
    action character varying(10),
    recordid integer,
    changedat timestamp without time zone DEFAULT now()
);


ALTER TABLE public.auditlog OWNER TO "Soli_DB_Admin";

--
-- TOC entry 235 (class 1259 OID 16986)
-- Name: auditlog_logid_seq; Type: SEQUENCE; Schema: public; Owner: Soli_DB_Admin
--

CREATE SEQUENCE public.auditlog_logid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditlog_logid_seq OWNER TO "Soli_DB_Admin";

--
-- TOC entry 4109 (class 0 OID 0)
-- Dependencies: 235
-- Name: auditlog_logid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Soli_DB_Admin
--

ALTER SEQUENCE public.auditlog_logid_seq OWNED BY public.auditlog.logid;


--
-- TOC entry 224 (class 1259 OID 16585)
-- Name: authors; Type: TABLE; Schema: public; Owner: Soli_DB_Admin
--

CREATE TABLE public.authors (
    authorid bigint NOT NULL,
    authorname character varying(50) NOT NULL,
    authormiddlename character varying(50),
    authorlastname character varying(100),
    countryid bigint
);


ALTER TABLE public.authors OWNER TO "Soli_DB_Admin";

--
-- TOC entry 223 (class 1259 OID 16584)
-- Name: authors_authorid_seq; Type: SEQUENCE; Schema: public; Owner: Soli_DB_Admin
--

CREATE SEQUENCE public.authors_authorid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.authors_authorid_seq OWNER TO "Soli_DB_Admin";

--
-- TOC entry 4110 (class 0 OID 0)
-- Dependencies: 223
-- Name: authors_authorid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Soli_DB_Admin
--

ALTER SEQUENCE public.authors_authorid_seq OWNED BY public.authors.authorid;


--
-- TOC entry 218 (class 1259 OID 16564)
-- Name: country; Type: TABLE; Schema: public; Owner: Soli_DB_Admin
--

CREATE TABLE public.country (
    countryid bigint NOT NULL,
    countryname character varying(255) NOT NULL
);


ALTER TABLE public.country OWNER TO "Soli_DB_Admin";

--
-- TOC entry 217 (class 1259 OID 16563)
-- Name: country_countryid_seq; Type: SEQUENCE; Schema: public; Owner: Soli_DB_Admin
--

CREATE SEQUENCE public.country_countryid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.country_countryid_seq OWNER TO "Soli_DB_Admin";

--
-- TOC entry 4111 (class 0 OID 0)
-- Dependencies: 217
-- Name: country_countryid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Soli_DB_Admin
--

ALTER SEQUENCE public.country_countryid_seq OWNED BY public.country.countryid;


--
-- TOC entry 226 (class 1259 OID 16597)
-- Name: editorials; Type: TABLE; Schema: public; Owner: Soli_DB_Admin
--

CREATE TABLE public.editorials (
    editorialid bigint NOT NULL,
    companyname character varying(250) NOT NULL,
    countryid bigint
);


ALTER TABLE public.editorials OWNER TO "Soli_DB_Admin";

--
-- TOC entry 225 (class 1259 OID 16596)
-- Name: editorials_editorialid_seq; Type: SEQUENCE; Schema: public; Owner: Soli_DB_Admin
--

CREATE SEQUENCE public.editorials_editorialid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.editorials_editorialid_seq OWNER TO "Soli_DB_Admin";

--
-- TOC entry 4112 (class 0 OID 0)
-- Dependencies: 225
-- Name: editorials_editorialid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Soli_DB_Admin
--

ALTER SEQUENCE public.editorials_editorialid_seq OWNED BY public.editorials.editorialid;


--
-- TOC entry 220 (class 1259 OID 16571)
-- Name: genres; Type: TABLE; Schema: public; Owner: Soli_DB_Admin
--

CREATE TABLE public.genres (
    genreid bigint NOT NULL,
    genrename character varying(255) NOT NULL
);


ALTER TABLE public.genres OWNER TO "Soli_DB_Admin";

--
-- TOC entry 219 (class 1259 OID 16570)
-- Name: genres_genreid_seq; Type: SEQUENCE; Schema: public; Owner: Soli_DB_Admin
--

CREATE SEQUENCE public.genres_genreid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.genres_genreid_seq OWNER TO "Soli_DB_Admin";

--
-- TOC entry 4113 (class 0 OID 0)
-- Dependencies: 219
-- Name: genres_genreid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Soli_DB_Admin
--

ALTER SEQUENCE public.genres_genreid_seq OWNED BY public.genres.genreid;


--
-- TOC entry 231 (class 1259 OID 16637)
-- Name: text_authors; Type: TABLE; Schema: public; Owner: Soli_DB_Admin
--

CREATE TABLE public.text_authors (
    textid bigint NOT NULL,
    authorid bigint NOT NULL
);


ALTER TABLE public.text_authors OWNER TO "Soli_DB_Admin";

--
-- TOC entry 233 (class 1259 OID 16667)
-- Name: text_editorials; Type: TABLE; Schema: public; Owner: Soli_DB_Admin
--

CREATE TABLE public.text_editorials (
    textid bigint NOT NULL,
    editorialid bigint NOT NULL
);


ALTER TABLE public.text_editorials OWNER TO "Soli_DB_Admin";

--
-- TOC entry 232 (class 1259 OID 16652)
-- Name: text_genres; Type: TABLE; Schema: public; Owner: Soli_DB_Admin
--

CREATE TABLE public.text_genres (
    textid bigint NOT NULL,
    genreid bigint NOT NULL
);


ALTER TABLE public.text_genres OWNER TO "Soli_DB_Admin";

--
-- TOC entry 230 (class 1259 OID 16619)
-- Name: texts; Type: TABLE; Schema: public; Owner: Soli_DB_Admin
--

CREATE TABLE public.texts (
    textid bigint NOT NULL,
    texttitle character varying(250) NOT NULL,
    descripcion text,
    publisheddate date,
    editorialid integer,
    typeid bigint,
    texturl character varying(1024),
    coverurl character varying(1024)
);


ALTER TABLE public.texts OWNER TO "Soli_DB_Admin";

--
-- TOC entry 229 (class 1259 OID 16618)
-- Name: texts_textid_seq; Type: SEQUENCE; Schema: public; Owner: Soli_DB_Admin
--

CREATE SEQUENCE public.texts_textid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.texts_textid_seq OWNER TO "Soli_DB_Admin";

--
-- TOC entry 4114 (class 0 OID 0)
-- Dependencies: 229
-- Name: texts_textid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Soli_DB_Admin
--

ALTER SEQUENCE public.texts_textid_seq OWNED BY public.texts.textid;


--
-- TOC entry 222 (class 1259 OID 16578)
-- Name: texttype; Type: TABLE; Schema: public; Owner: Soli_DB_Admin
--

CREATE TABLE public.texttype (
    typeid bigint NOT NULL,
    texttype character varying(255) NOT NULL
);


ALTER TABLE public.texttype OWNER TO "Soli_DB_Admin";

--
-- TOC entry 221 (class 1259 OID 16577)
-- Name: texttype_typeid_seq; Type: SEQUENCE; Schema: public; Owner: Soli_DB_Admin
--

CREATE SEQUENCE public.texttype_typeid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.texttype_typeid_seq OWNER TO "Soli_DB_Admin";

--
-- TOC entry 4115 (class 0 OID 0)
-- Dependencies: 221
-- Name: texttype_typeid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Soli_DB_Admin
--

ALTER SEQUENCE public.texttype_typeid_seq OWNED BY public.texttype.typeid;


--
-- TOC entry 234 (class 1259 OID 16682)
-- Name: user_genres; Type: TABLE; Schema: public; Owner: Soli_DB_Admin
--

CREATE TABLE public.user_genres (
    userid bigint NOT NULL,
    genreid bigint NOT NULL
);


ALTER TABLE public.user_genres OWNER TO "Soli_DB_Admin";

--
-- TOC entry 228 (class 1259 OID 16609)
-- Name: users; Type: TABLE; Schema: public; Owner: Soli_DB_Admin
--

CREATE TABLE public.users (
    userid bigint NOT NULL,
    firstname character varying(255) NOT NULL,
    lastname character varying(255) NOT NULL,
    activemember boolean DEFAULT true NOT NULL,
    cognitosub character varying(255) NOT NULL
);


ALTER TABLE public.users OWNER TO "Soli_DB_Admin";

--
-- TOC entry 227 (class 1259 OID 16608)
-- Name: users_userid_seq; Type: SEQUENCE; Schema: public; Owner: Soli_DB_Admin
--

CREATE SEQUENCE public.users_userid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_userid_seq OWNER TO "Soli_DB_Admin";

--
-- TOC entry 4116 (class 0 OID 0)
-- Dependencies: 227
-- Name: users_userid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Soli_DB_Admin
--

ALTER SEQUENCE public.users_userid_seq OWNED BY public.users.userid;


--
-- TOC entry 237 (class 1259 OID 16999)
-- Name: vw_texts; Type: VIEW; Schema: public; Owner: Soli_DB_Admin
--

CREATE VIEW public.vw_texts AS
 SELECT t.textid,
    t.texttitle,
    t.descripcion,
    t.publisheddate,
    t.texturl,
    t.coverurl,
    tt.typeid,
    tt.texttype AS type_name,
    COALESCE(( SELECT array_agg(a.authorid) AS array_agg
           FROM (public.text_authors ta
             JOIN public.authors a ON ((a.authorid = ta.authorid)))
          WHERE (ta.textid = t.textid)), (ARRAY[]::integer[])::bigint[]) AS author_ids,
    COALESCE(( SELECT array_agg(a.authorname) AS array_agg
           FROM (public.text_authors ta
             JOIN public.authors a ON ((a.authorid = ta.authorid)))
          WHERE (ta.textid = t.textid)), (ARRAY[]::text[])::character varying[]) AS author_names,
    COALESCE(( SELECT array_agg(a.authormiddlename) AS array_agg
           FROM (public.text_authors ta
             JOIN public.authors a ON ((a.authorid = ta.authorid)))
          WHERE (ta.textid = t.textid)), (ARRAY[]::text[])::character varying[]) AS author_middle_names,
    COALESCE(( SELECT array_agg(a.authorlastname) AS array_agg
           FROM (public.text_authors ta
             JOIN public.authors a ON ((a.authorid = ta.authorid)))
          WHERE (ta.textid = t.textid)), (ARRAY[]::text[])::character varying[]) AS author_last_names,
    COALESCE(( SELECT array_agg(c.countryname) AS array_agg
           FROM ((public.text_authors ta
             JOIN public.authors a ON ((a.authorid = ta.authorid)))
             JOIN public.country c ON ((c.countryid = a.countryid)))
          WHERE (ta.textid = t.textid)), (ARRAY[]::text[])::character varying[]) AS author_country_names,
    COALESCE(( SELECT array_agg(e.editorialid) AS array_agg
           FROM (public.text_editorials te
             JOIN public.editorials e ON ((e.editorialid = te.editorialid)))
          WHERE (te.textid = t.textid)), (ARRAY[]::integer[])::bigint[]) AS editorial_ids,
    COALESCE(( SELECT array_agg(e.companyname) AS array_agg
           FROM (public.text_editorials te
             JOIN public.editorials e ON ((e.editorialid = te.editorialid)))
          WHERE (te.textid = t.textid)), (ARRAY[]::text[])::character varying[]) AS editorial_names,
    COALESCE(( SELECT array_agg(c.countryid) AS array_agg
           FROM ((public.text_editorials te
             JOIN public.editorials e ON ((e.editorialid = te.editorialid)))
             JOIN public.country c ON ((c.countryid = e.countryid)))
          WHERE (te.textid = t.textid)), (ARRAY[]::integer[])::bigint[]) AS editorial_country_ids,
    COALESCE(( SELECT array_agg(c.countryname) AS array_agg
           FROM ((public.text_editorials te
             JOIN public.editorials e ON ((e.editorialid = te.editorialid)))
             JOIN public.country c ON ((c.countryid = e.countryid)))
          WHERE (te.textid = t.textid)), (ARRAY[]::text[])::character varying[]) AS editorial_country_names,
    COALESCE(( SELECT array_agg(g.genreid) AS array_agg
           FROM (public.text_genres tg
             JOIN public.genres g ON ((g.genreid = tg.genreid)))
          WHERE (tg.textid = t.textid)), (ARRAY[]::integer[])::bigint[]) AS genre_ids,
    COALESCE(( SELECT array_agg(g.genrename) AS array_agg
           FROM (public.text_genres tg
             JOIN public.genres g ON ((g.genreid = tg.genreid)))
          WHERE (tg.textid = t.textid)), (ARRAY[]::text[])::character varying[]) AS genre_names
   FROM (public.texts t
     LEFT JOIN public.texttype tt ON ((tt.typeid = t.typeid)));


ALTER VIEW public.vw_texts OWNER TO "Soli_DB_Admin";

--
-- TOC entry 238 (class 1259 OID 17004)
-- Name: vw_users; Type: VIEW; Schema: public; Owner: Soli_DB_Admin
--

CREATE VIEW public.vw_users AS
 SELECT userid,
    firstname,
    lastname,
    activemember,
    cognitosub,
    COALESCE(( SELECT array_agg(g.genreid) AS array_agg
           FROM (public.user_genres ug
             JOIN public.genres g ON ((g.genreid = ug.genreid)))
          WHERE (ug.userid = u.userid)), (ARRAY[]::integer[])::bigint[]) AS preferred_genre_ids,
    COALESCE(( SELECT array_agg(g.genrename) AS array_agg
           FROM (public.user_genres ug
             JOIN public.genres g ON ((g.genreid = ug.genreid)))
          WHERE (ug.userid = u.userid)), (ARRAY[]::text[])::character varying[]) AS preferred_genres
   FROM public.users u;


ALTER VIEW public.vw_users OWNER TO "Soli_DB_Admin";

--
-- TOC entry 3888 (class 2604 OID 16990)
-- Name: auditlog logid; Type: DEFAULT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.auditlog ALTER COLUMN logid SET DEFAULT nextval('public.auditlog_logid_seq'::regclass);


--
-- TOC entry 3883 (class 2604 OID 16697)
-- Name: authors authorid; Type: DEFAULT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.authors ALTER COLUMN authorid SET DEFAULT nextval('public.authors_authorid_seq'::regclass);


--
-- TOC entry 3880 (class 2604 OID 16718)
-- Name: country countryid; Type: DEFAULT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.country ALTER COLUMN countryid SET DEFAULT nextval('public.country_countryid_seq'::regclass);


--
-- TOC entry 3884 (class 2604 OID 16735)
-- Name: editorials editorialid; Type: DEFAULT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.editorials ALTER COLUMN editorialid SET DEFAULT nextval('public.editorials_editorialid_seq'::regclass);


--
-- TOC entry 3881 (class 2604 OID 16761)
-- Name: genres genreid; Type: DEFAULT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.genres ALTER COLUMN genreid SET DEFAULT nextval('public.genres_genreid_seq'::regclass);


--
-- TOC entry 3887 (class 2604 OID 16778)
-- Name: texts textid; Type: DEFAULT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.texts ALTER COLUMN textid SET DEFAULT nextval('public.texts_textid_seq'::regclass);


--
-- TOC entry 3882 (class 2604 OID 16831)
-- Name: texttype typeid; Type: DEFAULT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.texttype ALTER COLUMN typeid SET DEFAULT nextval('public.texttype_typeid_seq'::regclass);


--
-- TOC entry 3885 (class 2604 OID 16843)
-- Name: users userid; Type: DEFAULT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.users ALTER COLUMN userid SET DEFAULT nextval('public.users_userid_seq'::regclass);


--
-- TOC entry 4101 (class 0 OID 16987)
-- Dependencies: 236
-- Data for Name: auditlog; Type: TABLE DATA; Schema: public; Owner: Soli_DB_Admin
--

COPY public.auditlog (logid, tablename, action, recordid, changedat) FROM stdin;
\.


--
-- TOC entry 4089 (class 0 OID 16585)
-- Dependencies: 224
-- Data for Name: authors; Type: TABLE DATA; Schema: public; Owner: Soli_DB_Admin
--

COPY public.authors (authorid, authorname, authormiddlename, authorlastname, countryid) FROM stdin;
1	Antoine Marie	Jean-Baptiste	Roger de Saint-Exupéry	3
2	Friedrich	Wilhelm	Nietzsche	4
3	Manuel	Chaves	Nogales	5
4	Homero			6
5	Durante	Alighieri		7
\.


--
-- TOC entry 4083 (class 0 OID 16564)
-- Dependencies: 218
-- Data for Name: country; Type: TABLE DATA; Schema: public; Owner: Soli_DB_Admin
--

COPY public.country (countryid, countryname) FROM stdin;
1	Mexico
2	United States of America
3	France
4	Alemania
5	España
6	Grecia
7	Italia
\.


--
-- TOC entry 4091 (class 0 OID 16597)
-- Dependencies: 226
-- Data for Name: editorials; Type: TABLE DATA; Schema: public; Owner: Soli_DB_Admin
--

COPY public.editorials (editorialid, companyname, countryid) FROM stdin;
1	Reynal & Hitchcock	2
2	Éditions Gallimard	3
3	C. G. Naumann Verlag	4
4	Espasa-Calpe	5
5	Editorial Gredos	5
6	Editorial Alianza	5
7	Editorial Penguin Classics	2
8	Einaudi	7
\.


--
-- TOC entry 4085 (class 0 OID 16571)
-- Dependencies: 220
-- Data for Name: genres; Type: TABLE DATA; Schema: public; Owner: Soli_DB_Admin
--

COPY public.genres (genreid, genrename) FROM stdin;
1	Fantasia
2	Autobiografía
3	Filosofía
4	Crónica
5	Ensayo narrativo
6	Biografía
7	Poesía heroica
8	Poesía épica
9	Alegoría
\.


--
-- TOC entry 4096 (class 0 OID 16637)
-- Dependencies: 231
-- Data for Name: text_authors; Type: TABLE DATA; Schema: public; Owner: Soli_DB_Admin
--

COPY public.text_authors (textid, authorid) FROM stdin;
1	1
2	2
3	3
4	4
5	5
\.


--
-- TOC entry 4098 (class 0 OID 16667)
-- Dependencies: 233
-- Data for Name: text_editorials; Type: TABLE DATA; Schema: public; Owner: Soli_DB_Admin
--

COPY public.text_editorials (textid, editorialid) FROM stdin;
1	1
1	2
2	3
3	4
4	5
4	7
4	6
5	8
5	6
5	7
\.


--
-- TOC entry 4097 (class 0 OID 16652)
-- Dependencies: 232
-- Data for Name: text_genres; Type: TABLE DATA; Schema: public; Owner: Soli_DB_Admin
--

COPY public.text_genres (textid, genreid) FROM stdin;
1	1
2	3
2	2
3	5
3	6
3	4
4	7
5	9
5	8
\.


--
-- TOC entry 4095 (class 0 OID 16619)
-- Dependencies: 230
-- Data for Name: texts; Type: TABLE DATA; Schema: public; Owner: Soli_DB_Admin
--

COPY public.texts (textid, texttitle, descripcion, publisheddate, editorialid, typeid, texturl, coverurl) FROM stdin;
1	El principito	La historia comienza cuando un piloto, que está perdido en el desierto del Sahara, se topa con un misterioso niño: el Principito. Este joven, que viene de un lejano asteroide, cuenta una serie de relatos donde viaja a otros planetas y conoce una serie de peculiares personajes.	1943-04-06	\N	2	https://storage.googleapis.com/soli_books_pdf/El_principito-Antoine_de_Saint-Exupery.pdf	https://storage.googleapis.com/soli_books_cover/ElPrincipito.png
2	De Mi Vida - Nietzsche	Los textos autobiográficos que se reúnen en el presente volumen comprenden el período de la niñez, la adolescencia y la época de estudiante universitario de Friedrich Nietzsche, hasta su acceso a la cátedra de lengua y literatura griega en la Universidad de Basilea, cuando contaba veinticinco años de edad.	1902-01-01	\N	1	https://storage.googleapis.com/soli_books_pdf/De_mi_vida-Friedrich_Nietzsche.pdf	https://storage.googleapis.com/soli_books_cover/DeMiVida.png
4	La Odisea	La Odisea es un poema épico que narra el regreso de Odiseo (Ulises) a Ítaca después de la guerra de Troya, enfrentando dioses, monstruos y pruebas heroicas. Es literatura clásica, no novela ni biografía.	0700-01-01	\N	4	https://storage.googleapis.com/soli_books_pdf/La_Odisea-Homero.pdf	https://storage.googleapis.com/soli_books_cover/LaOdisea.png
5	La Divina Comedia	La Divina Comedia es un poema épico alegórico dividido en tres partes: Infierno, Purgatorio y Paraíso. Narra el viaje de Dante a través de estos reinos, con fuertes elementos filosóficos, religiosos y morales, siendo una de las obras cumbre de la literatura universal.	1320-01-01	\N	4	https://storage.googleapis.com/soli_books_pdf/La_divina_comedia-Dante_Alighieri.pdf	https://storage.googleapis.com/soli_books_cover/DivinaComedia.png
3	matador de toros: su vida y sus hazañas	“Juan Belmonte, matador de toros” es una biografía literaria sobre el famoso torero sevillano Juan Belmonte. Chaves Nogales narra su vida desde una perspectiva humana y filosófica, combinando realidad histórica con estilo narrativo atractivo, por lo que a veces se considera también una obra de periodismo literario.	1935-01-01	\N	3	https://storage.googleapis.com/soli_books_pdf/Juan_Belmonte_matador_de_toros-Manuel_Chaves_Nogales.pdf	https://storage.googleapis.com/soli_books_cover/MatadorDeToros.png
\.


--
-- TOC entry 4087 (class 0 OID 16578)
-- Dependencies: 222
-- Data for Name: texttype; Type: TABLE DATA; Schema: public; Owner: Soli_DB_Admin
--

COPY public.texttype (typeid, texttype) FROM stdin;
1	book
2	Novela corta
3	Biografía
4	Poema Épico
\.


--
-- TOC entry 4099 (class 0 OID 16682)
-- Dependencies: 234
-- Data for Name: user_genres; Type: TABLE DATA; Schema: public; Owner: Soli_DB_Admin
--

COPY public.user_genres (userid, genreid) FROM stdin;
\.


--
-- TOC entry 4093 (class 0 OID 16609)
-- Dependencies: 228
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: Soli_DB_Admin
--

COPY public.users (userid, firstname, lastname, activemember, cognitosub) FROM stdin;
\.


--
-- TOC entry 4117 (class 0 OID 0)
-- Dependencies: 235
-- Name: auditlog_logid_seq; Type: SEQUENCE SET; Schema: public; Owner: Soli_DB_Admin
--

SELECT pg_catalog.setval('public.auditlog_logid_seq', 1, false);


--
-- TOC entry 4118 (class 0 OID 0)
-- Dependencies: 223
-- Name: authors_authorid_seq; Type: SEQUENCE SET; Schema: public; Owner: Soli_DB_Admin
--

SELECT pg_catalog.setval('public.authors_authorid_seq', 5, true);


--
-- TOC entry 4119 (class 0 OID 0)
-- Dependencies: 217
-- Name: country_countryid_seq; Type: SEQUENCE SET; Schema: public; Owner: Soli_DB_Admin
--

SELECT pg_catalog.setval('public.country_countryid_seq', 7, true);


--
-- TOC entry 4120 (class 0 OID 0)
-- Dependencies: 225
-- Name: editorials_editorialid_seq; Type: SEQUENCE SET; Schema: public; Owner: Soli_DB_Admin
--

SELECT pg_catalog.setval('public.editorials_editorialid_seq', 8, true);


--
-- TOC entry 4121 (class 0 OID 0)
-- Dependencies: 219
-- Name: genres_genreid_seq; Type: SEQUENCE SET; Schema: public; Owner: Soli_DB_Admin
--

SELECT pg_catalog.setval('public.genres_genreid_seq', 9, true);


--
-- TOC entry 4122 (class 0 OID 0)
-- Dependencies: 229
-- Name: texts_textid_seq; Type: SEQUENCE SET; Schema: public; Owner: Soli_DB_Admin
--

SELECT pg_catalog.setval('public.texts_textid_seq', 5, true);


--
-- TOC entry 4123 (class 0 OID 0)
-- Dependencies: 221
-- Name: texttype_typeid_seq; Type: SEQUENCE SET; Schema: public; Owner: Soli_DB_Admin
--

SELECT pg_catalog.setval('public.texttype_typeid_seq', 4, true);


--
-- TOC entry 4124 (class 0 OID 0)
-- Dependencies: 227
-- Name: users_userid_seq; Type: SEQUENCE SET; Schema: public; Owner: Soli_DB_Admin
--

SELECT pg_catalog.setval('public.users_userid_seq', 1, false);


--
-- TOC entry 3915 (class 2606 OID 16993)
-- Name: auditlog auditlog_pkey; Type: CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.auditlog
    ADD CONSTRAINT auditlog_pkey PRIMARY KEY (logid);


--
-- TOC entry 3897 (class 2606 OID 16699)
-- Name: authors authors_pkey; Type: CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_pkey PRIMARY KEY (authorid);


--
-- TOC entry 3891 (class 2606 OID 16720)
-- Name: country country_pkey; Type: CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.country
    ADD CONSTRAINT country_pkey PRIMARY KEY (countryid);


--
-- TOC entry 3899 (class 2606 OID 16737)
-- Name: editorials editorials_pkey; Type: CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.editorials
    ADD CONSTRAINT editorials_pkey PRIMARY KEY (editorialid);


--
-- TOC entry 3893 (class 2606 OID 16763)
-- Name: genres genres_pkey; Type: CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_pkey PRIMARY KEY (genreid);


--
-- TOC entry 3907 (class 2606 OID 16872)
-- Name: text_authors text_authors_pkey; Type: CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.text_authors
    ADD CONSTRAINT text_authors_pkey PRIMARY KEY (textid, authorid);


--
-- TOC entry 3911 (class 2606 OID 16894)
-- Name: text_editorials text_editorials_pkey; Type: CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.text_editorials
    ADD CONSTRAINT text_editorials_pkey PRIMARY KEY (textid, editorialid);


--
-- TOC entry 3909 (class 2606 OID 16916)
-- Name: text_genres text_genres_pkey; Type: CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.text_genres
    ADD CONSTRAINT text_genres_pkey PRIMARY KEY (textid, genreid);


--
-- TOC entry 3905 (class 2606 OID 16780)
-- Name: texts texts_pkey; Type: CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.texts
    ADD CONSTRAINT texts_pkey PRIMARY KEY (textid);


--
-- TOC entry 3895 (class 2606 OID 16833)
-- Name: texttype texttype_pkey; Type: CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.texttype
    ADD CONSTRAINT texttype_pkey PRIMARY KEY (typeid);


--
-- TOC entry 3913 (class 2606 OID 16938)
-- Name: user_genres user_genres_pkey; Type: CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.user_genres
    ADD CONSTRAINT user_genres_pkey PRIMARY KEY (userid, genreid);


--
-- TOC entry 3901 (class 2606 OID 16857)
-- Name: users users_cognitosub_key; Type: CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_cognitosub_key UNIQUE (cognitosub);


--
-- TOC entry 3903 (class 2606 OID 16845)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);


--
-- TOC entry 3933 (class 2620 OID 16996)
-- Name: texts trg_audit_texts; Type: TRIGGER; Schema: public; Owner: Soli_DB_Admin
--

CREATE TRIGGER trg_audit_texts AFTER INSERT OR DELETE OR UPDATE ON public.texts FOR EACH ROW EXECUTE FUNCTION public.fn_audit_changes();


--
-- TOC entry 3931 (class 2620 OID 16995)
-- Name: users trg_audit_users; Type: TRIGGER; Schema: public; Owner: Soli_DB_Admin
--

CREATE TRIGGER trg_audit_users AFTER INSERT OR DELETE OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.fn_audit_changes();


--
-- TOC entry 3929 (class 2620 OID 16983)
-- Name: authors trg_format_author_names; Type: TRIGGER; Schema: public; Owner: Soli_DB_Admin
--

CREATE TRIGGER trg_format_author_names BEFORE INSERT OR UPDATE ON public.authors FOR EACH ROW EXECUTE FUNCTION public.fn_format_names();


--
-- TOC entry 3930 (class 2620 OID 16985)
-- Name: editorials trg_format_editorial_name; Type: TRIGGER; Schema: public; Owner: Soli_DB_Admin
--

CREATE TRIGGER trg_format_editorial_name BEFORE INSERT OR UPDATE ON public.editorials FOR EACH ROW EXECUTE FUNCTION public.fn_format_names();


--
-- TOC entry 3932 (class 2620 OID 16984)
-- Name: users trg_format_user_names; Type: TRIGGER; Schema: public; Owner: Soli_DB_Admin
--

CREATE TRIGGER trg_format_user_names BEFORE INSERT OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.fn_format_names();


--
-- TOC entry 3928 (class 2620 OID 16998)
-- Name: genres trg_no_duplicate_genres; Type: TRIGGER; Schema: public; Owner: Soli_DB_Admin
--

CREATE TRIGGER trg_no_duplicate_genres BEFORE INSERT OR UPDATE ON public.genres FOR EACH ROW EXECUTE FUNCTION public.fn_prevent_duplicates();


--
-- TOC entry 3934 (class 2620 OID 16981)
-- Name: texts trg_validate_text_date; Type: TRIGGER; Schema: public; Owner: Soli_DB_Admin
--

CREATE TRIGGER trg_validate_text_date BEFORE INSERT OR UPDATE ON public.texts FOR EACH ROW EXECUTE FUNCTION public.fn_validate_text_date();


--
-- TOC entry 3916 (class 2606 OID 16726)
-- Name: authors authors_countryid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_countryid_fkey FOREIGN KEY (countryid) REFERENCES public.country(countryid);


--
-- TOC entry 3917 (class 2606 OID 16752)
-- Name: editorials editorials_countryid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.editorials
    ADD CONSTRAINT editorials_countryid_fkey FOREIGN KEY (countryid) REFERENCES public.country(countryid);


--
-- TOC entry 3920 (class 2606 OID 16873)
-- Name: text_authors text_authors_authorid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.text_authors
    ADD CONSTRAINT text_authors_authorid_fkey FOREIGN KEY (authorid) REFERENCES public.authors(authorid) ON DELETE CASCADE;


--
-- TOC entry 3921 (class 2606 OID 16862)
-- Name: text_authors text_authors_textid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.text_authors
    ADD CONSTRAINT text_authors_textid_fkey FOREIGN KEY (textid) REFERENCES public.texts(textid) ON DELETE CASCADE;


--
-- TOC entry 3924 (class 2606 OID 16895)
-- Name: text_editorials text_editorials_editorialid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.text_editorials
    ADD CONSTRAINT text_editorials_editorialid_fkey FOREIGN KEY (editorialid) REFERENCES public.editorials(editorialid) ON DELETE CASCADE;


--
-- TOC entry 3925 (class 2606 OID 16884)
-- Name: text_editorials text_editorials_textid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.text_editorials
    ADD CONSTRAINT text_editorials_textid_fkey FOREIGN KEY (textid) REFERENCES public.texts(textid) ON DELETE CASCADE;


--
-- TOC entry 3922 (class 2606 OID 16917)
-- Name: text_genres text_genres_genreid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.text_genres
    ADD CONSTRAINT text_genres_genreid_fkey FOREIGN KEY (genreid) REFERENCES public.genres(genreid) ON DELETE CASCADE;


--
-- TOC entry 3923 (class 2606 OID 16906)
-- Name: text_genres text_genres_textid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.text_genres
    ADD CONSTRAINT text_genres_textid_fkey FOREIGN KEY (textid) REFERENCES public.texts(textid) ON DELETE CASCADE;


--
-- TOC entry 3918 (class 2606 OID 16738)
-- Name: texts texts_editorialid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.texts
    ADD CONSTRAINT texts_editorialid_fkey FOREIGN KEY (editorialid) REFERENCES public.editorials(editorialid);


--
-- TOC entry 3919 (class 2606 OID 16834)
-- Name: texts texts_typeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.texts
    ADD CONSTRAINT texts_typeid_fkey FOREIGN KEY (typeid) REFERENCES public.texttype(typeid);


--
-- TOC entry 3926 (class 2606 OID 16939)
-- Name: user_genres user_genres_genreid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.user_genres
    ADD CONSTRAINT user_genres_genreid_fkey FOREIGN KEY (genreid) REFERENCES public.genres(genreid) ON DELETE CASCADE;


--
-- TOC entry 3927 (class 2606 OID 16928)
-- Name: user_genres user_genres_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Soli_DB_Admin
--

ALTER TABLE ONLY public.user_genres
    ADD CONSTRAINT user_genres_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- TOC entry 4108 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO cloudsqlsuperuser;


-- Completed on 2025-10-14 00:23:46 CST

--
-- PostgreSQL database dump complete
--

\unrestrict 3pNCVYMADEcOEoupLmK2JO0W2pYG0BJqB7q2fiK1st2jLZMXAAGMqUvrSCHeXcD

