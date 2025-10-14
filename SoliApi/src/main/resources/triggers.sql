-- 1. Validar fecha de publicación en texts
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

drop trigger if exists trg_validate_text_date on public.texts^;
create trigger trg_validate_text_date
before insert or update on public.texts
for each row
execute function fn_validate_text_date()^;

-- 2. Normalizar nombres en authors, users y editorials
create or replace function fn_format_names()
returns trigger
language plpgsql
as $$
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

drop trigger if exists trg_format_author_names on public.authors^;
create trigger trg_format_author_names
before insert or update on public.authors
for each row execute function fn_format_names()^;

drop trigger if exists trg_format_user_names on public.users^;
create trigger trg_format_user_names
before insert or update on public.users
for each row execute function fn_format_names()^;

drop trigger if exists trg_format_editorial_name on public.editorials^;
create trigger trg_format_editorial_name
before insert or update on public.editorials
for each row execute function fn_format_names()^;

-- 3. (Eliminado) Validación de genrePreference en Users: no aplica con tabla N:M user_genres

-- 4. Auditoría de cambios en users y texts
create table if not exists public.auditlog(
    logid serial primary key,
    tablename varchar(50),
    action varchar(10),
    recordid int,
    changedat timestamp default now()
)^;

create or replace function fn_audit_changes()
returns trigger
language plpgsql
as $$
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

drop trigger if exists trg_audit_users on public.users^;
create trigger trg_audit_users
after insert or update or delete on public.users
for each row
execute function fn_audit_changes()^;

drop trigger if exists trg_audit_texts on public.texts^;
create trigger trg_audit_texts
after insert or update or delete on public.texts
for each row
execute function fn_audit_changes()^;

-- 5. Evitar duplicados lógicos en genres
create or replace function fn_prevent_duplicates()
returns trigger
language plpgsql
as $$
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

drop trigger if exists trg_no_duplicate_genres on public.genres^;
create trigger trg_no_duplicate_genres
before insert or update on public.genres
for each row execute function fn_prevent_duplicates()^;

-- 6. Trigger para actualizar updated_at automáticamente
create or replace function fn_update_timestamp()
returns trigger
language plpgsql
as $$
begin
    new.updated_at := current_timestamp;
    return new;
end; $$;

-- Aplicar trigger de timestamp a todas las tablas principales
drop trigger if exists trg_update_timestamp_users on public.users^;
create trigger trg_update_timestamp_users
before update on public.users
for each row execute function fn_update_timestamp()^;

drop trigger if exists trg_update_timestamp_authors on public.authors^;
create trigger trg_update_timestamp_authors
before update on public.authors
for each row execute function fn_update_timestamp()^;

drop trigger if exists trg_update_timestamp_texts on public.texts^;
create trigger trg_update_timestamp_texts
before update on public.texts
for each row execute function fn_update_timestamp()^;

drop trigger if exists trg_update_timestamp_editorials on public.editorials^;
create trigger trg_update_timestamp_editorials
before update on public.editorials
for each row execute function fn_update_timestamp()^;

drop trigger if exists trg_update_timestamp_genres on public.genres^;
create trigger trg_update_timestamp_genres
before update on public.genres
for each row execute function fn_update_timestamp()^;

drop trigger if exists trg_update_timestamp_country on public.country^;
create trigger trg_update_timestamp_country
before update on public.country
for each row execute function fn_update_timestamp()^;

drop trigger if exists trg_update_timestamp_texttype on public.texttype^;
create trigger trg_update_timestamp_texttype
before update on public.texttype
for each row execute function fn_update_timestamp()^;
