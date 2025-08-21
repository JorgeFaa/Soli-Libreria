CREATE OR REPLACE VIEW vw_texts AS
SELECT
    t.textid,
    t.texttitle,
    t.publisheddate,
    t.texttype,
    t.genre,
    a.authorname || ' ' || COALESCE(a.authormiddlename, '') || ' ' || COALESCE(a.authorlastname, '') AS author_fullname,
    e.companyname AS editorial_name,
    e.country AS editorial_country
FROM soli_db.public.texts t
LEFT JOIN soli_db.public.authors a ON t.authorid = a.authorid
LEFT JOIN soli_db.public.editorials e ON t.editorialid = e.editorialid;

CREATE OR REPLACE VIEW vw_authors AS
SELECT
    a.authorid,
    a.authorname,
    a.authormiddlename,
    a.authorlastname,
    a.country,
    COUNT(t.textid) AS total_texts
FROM soli_db.public.authors a
LEFT JOIN soli_db.public.texts t ON a.authorid = t.authorid
GROUP BY a.authorid, a.authorname, a.authormiddlename, a.authorlastname, a.country;

CREATE OR REPLACE VIEW vw_editorials AS
SELECT
    e.editorialid,
    e.companyname,
    e.country,
    COUNT(t.textid) AS total_texts
FROM soli_db.public.editorials e
LEFT JOIN soli_db.public.texts t ON e.editorialid = t.editorialid
GROUP BY e.editorialid, e.companyname, e.country;


CREATE OR REPLACE VIEW vw_users AS
SELECT
    u.userid,
    u.firstname || ' ' || u.lastname AS full_name,
    u.useremail,
    u.userrole,
    CASE WHEN u.activemember THEN 'Activo' ELSE 'Inactivo' END AS membership_status,
    u.genrepreference
FROM soli_db.public.users u;
