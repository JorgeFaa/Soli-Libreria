-- Vista de textos con agregaciones (autores, editoriales, géneros)
CREATE OR REPLACE VIEW public.vw_texts AS
SELECT
    t.textid,
    t.texttitle,
    t.descripcion,
    t.publisheddate,
    t.texturl,
    t.coverurl,
    tt.typeid,
    tt.texttype AS type_name,
    -- Autores: IDs y nombres por separado para mapear a DTOs
    COALESCE((
        SELECT array_agg(a.authorid)
        FROM public.text_authors ta
        JOIN public.authors a ON a.authorid = ta.authorid
        WHERE ta.textid = t.textid
    ), ARRAY[]::bigint[]) AS author_ids,
    COALESCE((
        SELECT array_agg(a.authorname)
        FROM public.text_authors ta
        JOIN public.authors a ON a.authorid = ta.authorid
        WHERE ta.textid = t.textid
    ), ARRAY[]::text[]) AS author_names,
    COALESCE((
        SELECT array_agg(a.authormiddlename)
        FROM public.text_authors ta
        JOIN public.authors a ON a.authorid = ta.authorid
        WHERE ta.textid = t.textid
    ), ARRAY[]::text[]) AS author_middle_names,
    COALESCE((
        SELECT array_agg(a.authorlastname)
        FROM public.text_authors ta
        JOIN public.authors a ON a.authorid = ta.authorid
        WHERE ta.textid = t.textid
    ), ARRAY[]::text[]) AS author_last_names,
    COALESCE((
        SELECT array_agg(c.countryname)
        FROM public.text_authors ta
        JOIN public.authors a ON a.authorid = ta.authorid
        JOIN public.country c ON c.countryid = a.countryid
        WHERE ta.textid = t.textid
    ), ARRAY[]::text[]) AS author_country_names,
    -- Editoriales: IDs, nombres y país
    COALESCE((
        SELECT array_agg(e.editorialid)
        FROM public.text_editorials te
        JOIN public.editorials e ON e.editorialid = te.editorialid
        WHERE te.textid = t.textid
    ), ARRAY[]::bigint[]) AS editorial_ids,
    COALESCE((
        SELECT array_agg(e.companyname)
        FROM public.text_editorials te
        JOIN public.editorials e ON e.editorialid = te.editorialid
        WHERE te.textid = t.textid
    ), ARRAY[]::text[]) AS editorial_names,
    COALESCE((
        SELECT array_agg(c.countryid)
        FROM public.text_editorials te
        JOIN public.editorials e ON e.editorialid = te.editorialid
        JOIN public.country c ON c.countryid = e.countryid
        WHERE te.textid = t.textid
    ), ARRAY[]::bigint[]) AS editorial_country_ids,
    COALESCE((
        SELECT array_agg(c.countryname)
        FROM public.text_editorials te
        JOIN public.editorials e ON e.editorialid = te.editorialid
        JOIN public.country c ON c.countryid = e.countryid
        WHERE te.textid = t.textid
    ), ARRAY[]::text[]) AS editorial_country_names,
    -- Géneros: IDs y nombres
    COALESCE((
        SELECT array_agg(g.genreid)
        FROM public.text_genres tg
        JOIN public.genres g ON g.genreid = tg.genreid
        WHERE tg.textid = t.textid
    ), ARRAY[]::bigint[]) AS genre_ids,
    COALESCE((
        SELECT array_agg(g.genrename)
        FROM public.text_genres tg
        JOIN public.genres g ON g.genreid = tg.genreid
        WHERE tg.textid = t.textid
    ), ARRAY[]::text[]) AS genre_names
FROM public.texts t
LEFT JOIN public.texttype tt ON tt.typeid = t.typeid;

-- Vista actualizada de usuarios para incluir cambios de libros favoritos
CREATE OR REPLACE VIEW public.vw_users AS
SELECT
    u.userid,
    u.firstname,
    u.lastname,
    u.cognitosub,
    COALESCE((
        SELECT array_agg(g.genreid)
        FROM public.user_genres ug
        JOIN public.genres g ON g.genreid = ug.genreid
        WHERE ug.userid = u.userid
    ), ARRAY[]::bigint[]) AS preferred_genre_ids,
    COALESCE((
        SELECT array_agg(g.genrename)
        FROM public.user_genres ug
        JOIN public.genres g ON g.genreid = ug.genreid
        WHERE ug.userid = u.userid
    ), ARRAY[]::text[]) AS preferred_genres,
    COALESCE((
        SELECT array_agg(ub.textid)
        FROM public.user_books ub
        WHERE ub.userid = u.userid
    ), ARRAY[]::bigint[]) AS favorite_book_ids,
    COALESCE((
        SELECT array_agg(t.texttitle)
        FROM public.user_books ub
        JOIN public.texts t ON t.textid = ub.textid
        WHERE ub.userid = u.userid
    ), ARRAY[]::text[]) AS favorite_book_titles
FROM public.users u;
