-- 1. Validar fecha de publicación en Texts
create or replace function fn_validate_text_date()
returns trigger
language plpgsql
as $$
begin
    if new.publishedDate > current_date then
        raise exception 'La fecha de publicación no puede ser futura.';
    end if;
    return new;
end; $$;

create trigger trg_validate_text_date
before insert or update on Texts
for each row
execute function fn_validate_text_date();


-- 2. Normalizar nombres en Authors, Users y Editorials
create or replace function fn_format_names()
returns trigger
language plpgsql
as $$
begin
    if tg_table_name = 'authors' then
        new.authorName := initcap(new.authorName);
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

create trigger trg_format_author_names
before insert or update on Authors
for each row execute function fn_format_names();

create trigger trg_format_user_names
before insert or update on Users
for each row execute function fn_format_names();

create trigger trg_format_editorial_name
before insert or update on Editorials
for each row execute function fn_format_names();


-- 3. Validar que Users.genrePreference exista en Genres
create or replace function fn_validate_user_genre()
returns trigger
language plpgsql
as $$
declare
    v_exists int;
begin
    if new.genrePreference is not null then
        select count(*) into v_exists
        from Genres
        where lower(genrename) = lower(new.genrePreference);

        if v_exists = 0 then
            raise exception 'El género "%" no existe en la tabla Genres', new.genrePreference;
        end if;
    end if;
    return new;
end; $$;

create trigger trg_validate_user_genre
before insert or update on Users
for each row
execute function fn_validate_user_genre();


-- 4. Auditoría de cambios en Users y Texts
create table if not exists AuditLog(
    logID serial primary key,
    tableName varchar(50),
    action varchar(10),
    recordID int,
    changedAt timestamp default now()
);

create or replace function fn_audit_changes()
returns trigger
language plpgsql
as $$
declare
    v_id int;
begin
    if tg_table_name = 'users' then
        if tg_op = 'DELETE' then
            v_id := old.userID;
        else
            v_id := new.userID;
        end if;
    elsif tg_table_name = 'texts' then
        if tg_op = 'DELETE' then
            v_id := old.textID;
        else
            v_id := new.textID;
        end if;
    end if;

    insert into AuditLog(tableName, action, recordID)
    values(tg_table_name, tg_op, v_id);

    return case when tg_op = 'DELETE' then old else new end;
end; $$;

create trigger trg_audit_users
after insert or update or delete on Users
for each row
execute function fn_audit_changes();

create trigger trg_audit_texts
after insert or update or delete on Texts
for each row
execute function fn_audit_changes();


-- 5. Evitar duplicados lógicos en Genres y Roles
create or replace function fn_prevent_duplicates()
returns trigger
language plpgsql
as $$
declare
    v_exists int;
begin
    if tg_table_name = 'genres' then
        select count(*) into v_exists
        from Genres
        where lower(genrename) = lower(new.genrename)
          and (tg_op = 'INSERT' or genreID <> new.genreID);

        if v_exists > 0 then
            raise exception 'Ya existe un género con ese nombre.';
        end if;

    elsif tg_table_name = 'roles' then
        select count(*) into v_exists
        from Roles
        where lower(role) = lower(new.role)
          and (tg_op = 'INSERT' or roleID <> new.roleID);

        if v_exists > 0 then
            raise exception 'Ya existe un rol con ese nombre.';
        end if;
    end if;

    return new;
end; $$;

create trigger trg_no_duplicate_genres
before insert or update on Genres
for each row execute function fn_prevent_duplicates();

create trigger trg_no_duplicate_roles
before insert or update on Roles
for each row execute function fn_prevent_duplicates();