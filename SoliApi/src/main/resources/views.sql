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
    COALESCE((
        SELECT array_agg(a.authorname ||
                         CASE WHEN a.authormiddlename IS NOT NULL AND a.authormiddlename <> '' THEN ' ' || a.authormiddlename ELSE '' END ||
                         CASE WHEN a.authorlastname IS NOT NULL AND a.authorlastname <> '' THEN ' ' || a.authorlastname ELSE '' END)
        FROM public.text_authors ta
        JOIN public.authors a ON a.authorid = ta.authorid
        WHERE ta.textid = t.textid
    ), ARRAY[]::text[]) AS authors,
    COALESCE((
        SELECT array_agg(e.companyname)
        FROM public.text_editorials te
        JOIN public.editorials e ON e.editorialid = te.editorialid
        WHERE te.textid = t.textid
    ), ARRAY[]::text[]) AS editorials,
    COALESCE((
        SELECT array_agg(g.genrename)
        FROM public.text_genres tg
        JOIN public.genres g ON g.genreid = tg.genreid
        WHERE tg.textid = t.textid
    ), ARRAY[]::text[]) AS genres
FROM public.texts t
LEFT JOIN public.texttype tt ON tt.typeid = t.typeid;

-- Vista de usuarios con géneros preferidos agregados
CREATE OR REPLACE VIEW public.vw_users AS
SELECT
    u.userid,
    u.firstname,
    u.lastname,
    u.activemember,
    u.cognitosub,
    COALESCE((
        SELECT array_agg(g.genrename)
        FROM public.user_genres ug
        JOIN public.genres g ON g.genreid = ug.genreid
        WHERE ug.userid = u.userid
    ), ARRAY[]::text[]) AS preferred_genres
FROM public.users u;
