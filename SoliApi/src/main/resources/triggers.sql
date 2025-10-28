-- 1️⃣ Validar fecha de publicación en texts
create or replace function fn_validate_text_date()
returns trigger
language plpgsql
as $$
begin
    if new.publisheddate > current_date then
        raise exception 'La fecha de publicación no puede ser futura.';
    end if;
    return new;
end; $$;

drop trigger if exists trg_validate_text_date on public.texts;
create trigger trg_validate_text_date
before insert or update on public.texts
for each row
execute function fn_validate_text_date();

-- Normalizar nombres en authors, users, editorials y genres
create or replace function fn_format_names()
returns trigger
language plpgsql
as $$
begin
    if TG_TABLE_NAME = 'authors' then
        new.authorname := initcap(new.authorname);
        if new.authormiddlename is not null then
            new.authormiddlename := initcap(new.authormiddlename);
        end if;
        if new.authorlastname is not null then
            new.authorlastname := initcap(new.authorlastname);
        end if;

    elsif TG_TABLE_NAME = 'users' then
        new.firstname := initcap(new.firstname);
        new.lastname := initcap(new.lastname);

    elsif TG_TABLE_NAME = 'editorials' then
        new.companyname := initcap(new.companyname);

    elsif TG_TABLE_NAME = 'genres' then
        new.genrename := initcap(new.genrename);
    end if;

    return new;
end; $$;

-- Triggers existentes actualizados para incluir genres
drop trigger if exists trg_format_author_names on public.authors;
create trigger trg_format_author_names
before insert or update on public.authors
for each row execute function fn_format_names();

drop trigger if exists trg_format_user_names on public.users;
create trigger trg_format_user_names
before insert or update on public.users
for each row execute function fn_format_names();

drop trigger if exists trg_format_editorial_name on public.editorials;
create trigger trg_format_editorial_name
before insert or update on public.editorials
for each row execute function fn_format_names();

drop trigger if exists trg_format_genre_name on public.genres;
create trigger trg_format_genre_name
before insert or update on public.genres
for each row execute function fn_format_names();


-- 3️⃣ Auditoría de cambios en users y texts
create table if not exists public.auditlog(
    logid bigserial primary key,
    tablename varchar(50),
    action varchar(10),
    recordid bigint,
    changedat timestamp default now()
);

create or replace function fn_audit_changes()
returns trigger
language plpgsql
as $$
declare
    v_id bigint;
begin
    if TG_TABLE_NAME = 'users' then
        if TG_OP = 'DELETE' then
            v_id := old.userid;
        else
            v_id := new.userid;
        end if;
    elsif TG_TABLE_NAME = 'texts' then
        if TG_OP = 'DELETE' then
            v_id := old.textid;
        else
            v_id := new.textid;
        end if;
    end if;

    insert into public.auditlog(tablename, action, recordid)
    values(TG_TABLE_NAME, TG_OP, v_id);

    return case when TG_OP = 'DELETE' then old else new end;
end; $$;

drop trigger if exists trg_audit_users on public.users;
create trigger trg_audit_users
after insert or update or delete on public.users
for each row
execute function fn_audit_changes();

drop trigger if exists trg_audit_texts on public.texts;
create trigger trg_audit_texts
after insert or update or delete on public.texts
for each row
execute function fn_audit_changes();

-- 4️⃣ Evitar duplicados lógicos en genres
create or replace function fn_prevent_duplicates()
returns trigger
language plpgsql
as $$
declare
    v_exists bigint;
begin
    if TG_TABLE_NAME = 'genres' then
        select count(*) into v_exists
        from public.genres
        where lower(genrename) = lower(new.genrename)
          and (TG_OP = 'INSERT' or genreid <> new.genreid);

        if v_exists > 0 then
            raise exception 'Ya existe un género con ese nombre.';
        end if;
    end if;

    return new;
end; $$;

drop trigger if exists trg_no_duplicate_genres on public.genres;
create trigger trg_no_duplicate_genres
before insert or update on public.genres
for each row execute function fn_prevent_duplicates();

-- 5️⃣ Trigger para actualizar updated_at automáticamente
create or replace function fn_update_timestamp()
returns trigger
language plpgsql
as $$
begin
    new.updated_at := current_timestamp;
    return new;
end; $$;

-- Aplicar trigger de timestamp a todas las tablas principales
drop trigger if exists trg_update_timestamp_users on public.users;
create trigger trg_update_timestamp_users
before update on public.users
for each row execute function fn_update_timestamp();

drop trigger if exists trg_update_timestamp_authors on public.authors;
create trigger trg_update_timestamp_authors
before update on public.authors
for each row execute function fn_update_timestamp();

drop trigger if exists trg_update_timestamp_texts on public.texts;
create trigger trg_update_timestamp_texts
before update on public.texts
for each row execute function fn_update_timestamp();

drop trigger if exists trg_update_timestamp_editorials on public.editorials;
create trigger trg_update_timestamp_editorials
before update on public.editorials
for each row execute function fn_update_timestamp();

drop trigger if exists trg_update_timestamp_genres on public.genres;
create trigger trg_update_timestamp_genres
before update on public.genres
for each row execute function fn_update_timestamp();

drop trigger if exists trg_update_timestamp_country on public.country;
create trigger trg_update_timestamp_country
before update on public.country
for each row execute function fn_update_timestamp();

drop trigger if exists trg_update_timestamp_texttype on public.texttype;
create trigger trg_update_timestamp_texttype
before update on public.texttype
for each row execute function fn_update_timestamp();
