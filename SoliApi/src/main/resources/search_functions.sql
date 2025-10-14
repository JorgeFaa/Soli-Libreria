-- =====================================================
-- FUNCIONES DE BÚSQUEDA OPTIMIZADAS PARA API V2
-- =====================================================

-- === FUNCIÓN DE BÚSQUEDA AVANZADA DE TEXTOS ===

CREATE OR REPLACE FUNCTION fn_search_texts_v2(
    p_search_term TEXT DEFAULT NULL,
    p_title TEXT DEFAULT NULL,
    p_author_ids INT[] DEFAULT NULL,
    p_genre_ids INT[] DEFAULT NULL,
    p_editorial_ids INT[] DEFAULT NULL,
    p_type_id INT DEFAULT NULL,
    p_published_after DATE DEFAULT NULL,
    p_published_before DATE DEFAULT NULL,
    p_page INT DEFAULT 0,
    p_size INT DEFAULT 20,
    p_sort_by TEXT DEFAULT 'texttitle',
    p_sort_direction TEXT DEFAULT 'ASC'
)
RETURNS TABLE(
    textid INT,
    texttitle VARCHAR,
    descripcion TEXT,
    publisheddate DATE,
    texturl VARCHAR,
    coverurl VARCHAR,
    typeid INT,
    total_count BIGINT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_offset INT := p_page * p_size;
    v_sort_clause TEXT;
    v_query TEXT;
BEGIN
    -- Construir cláusula de ordenamiento segura
    v_sort_clause := CASE 
        WHEN p_sort_by = 'texttitle' THEN 'texttitle'
        WHEN p_sort_by = 'publisheddate' THEN 'publisheddate'
        WHEN p_sort_by = 'created_at' THEN 'created_at'
        ELSE 'texttitle'
    END;
    
    IF UPPER(p_sort_direction) = 'DESC' THEN
        v_sort_clause := v_sort_clause || ' DESC';
    ELSE
        v_sort_clause := v_sort_clause || ' ASC';
    END IF;
    
    -- Construir consulta dinámica
    v_query := '
        SELECT DISTINCT t.textid, t.texttitle, t.descripcion, t.publisheddate, 
               t.texturl, t.coverurl, t.typeid,
               COUNT(*) OVER() AS total_count
        FROM texts t
        LEFT JOIN text_authors ta ON t.textid = ta.textid
        LEFT JOIN authors a ON ta.authorid = a.authorid
        LEFT JOIN text_genres tg ON t.textid = tg.textid
        LEFT JOIN text_editorials te ON t.textid = te.textid
        WHERE 1=1';
    
    -- Agregar filtros dinámicamente
    IF p_search_term IS NOT NULL THEN
        v_query := v_query || ' AND (t.texttitle ILIKE ''%' || p_search_term || '%'' 
                                   OR t.descripcion ILIKE ''%' || p_search_term || '%'')';
    END IF;
    
    IF p_title IS NOT NULL THEN
        v_query := v_query || ' AND t.texttitle ILIKE ''%' || p_title || '%''';
    END IF;
    
    IF p_author_ids IS NOT NULL THEN
        v_query := v_query || ' AND ta.authorid = ANY(ARRAY[' || array_to_string(p_author_ids, ',') || '])';
    END IF;
    
    IF p_genre_ids IS NOT NULL THEN
        v_query := v_query || ' AND tg.genreid = ANY(ARRAY[' || array_to_string(p_genre_ids, ',') || '])';
    END IF;
    
    IF p_editorial_ids IS NOT NULL THEN
        v_query := v_query || ' AND te.editorialid = ANY(ARRAY[' || array_to_string(p_editorial_ids, ',') || '])';
    END IF;
    
    IF p_type_id IS NOT NULL THEN
        v_query := v_query || ' AND t.typeid = ' || p_type_id;
    END IF;
    
    IF p_published_after IS NOT NULL THEN
        v_query := v_query || ' AND t.publisheddate >= ''' || p_published_after || '''';
    END IF;
    
    IF p_published_before IS NOT NULL THEN
        v_query := v_query || ' AND t.publisheddate <= ''' || p_published_before || '''';
    END IF;
    
    -- Agregar ordenamiento y paginación
    v_query := v_query || ' ORDER BY ' || v_sort_clause || ', t.textid LIMIT ' || p_size || ' OFFSET ' || v_offset;
    
    -- Ejecutar consulta
    RETURN QUERY EXECUTE v_query;
END;
$$;

-- === FUNCIÓN DE BÚSQUEDA DE AUTORES ===

CREATE OR REPLACE FUNCTION fn_search_authors_v2(
    p_name TEXT DEFAULT NULL,
    p_country TEXT DEFAULT NULL
)
RETURNS TABLE(
    authorid INT,
    authorname VARCHAR,
    authormiddlename VARCHAR,
    authorlastname VARCHAR,
    countryid INT,
    countryname VARCHAR
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT a.authorid, a.authorname, a.authormiddlename, a.authorlastname, 
           a.countryid, c.countryname
    FROM authors a
    LEFT JOIN country c ON a.countryid = c.countryid
    WHERE (p_name IS NULL OR 
           a.authorname ILIKE '%' || p_name || '%' OR
           a.authormiddlename ILIKE '%' || p_name || '%' OR
           a.authorlastname ILIKE '%' || p_name || '%')
      AND (p_country IS NULL OR c.countryname ILIKE '%' || p_country || '%')
    ORDER BY a.authorname, a.authorlastname;
END;
$$;

-- === FUNCIÓN DE BÚSQUEDA DE GÉNEROS ===

CREATE OR REPLACE FUNCTION fn_search_genres_v2(
    p_name TEXT DEFAULT NULL
)
RETURNS TABLE(
    genreid INT,
    genrename VARCHAR,
    book_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT g.genreid, g.genrename, 
           COALESCE(stats.book_count, 0) AS book_count
    FROM genres g
    LEFT JOIN (
        SELECT tg.genreid, COUNT(DISTINCT tg.textid) AS book_count
        FROM text_genres tg
        GROUP BY tg.genreid
    ) stats ON g.genreid = stats.genreid
    WHERE p_name IS NULL OR g.genrename ILIKE '%' || p_name || '%'
    ORDER BY g.genrename;
END;
$$;

-- === FUNCIÓN DE GÉNEROS POPULARES ===

CREATE OR REPLACE FUNCTION fn_popular_genres_v2(
    p_limit INT DEFAULT 10
)
RETURNS TABLE(
    genreid INT,
    genrename VARCHAR,
    book_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT g.genreid, g.genrename, COUNT(DISTINCT tg.textid) AS book_count
    FROM genres g
    INNER JOIN text_genres tg ON g.genreid = tg.genreid
    GROUP BY g.genreid, g.genrename
    HAVING COUNT(DISTINCT tg.textid) > 0
    ORDER BY book_count DESC, g.genrename
    LIMIT p_limit;
END;
$$;

-- === FUNCIÓN DE ESTADÍSTICAS DE LIBROS ===

CREATE OR REPLACE FUNCTION fn_book_statistics_v2()
RETURNS TABLE(
    total_books BIGINT,
    unique_authors BIGINT,
    unique_genres BIGINT,
    unique_editorials BIGINT,
    books_this_year BIGINT,
    books_last_month BIGINT,
    avg_books_per_author NUMERIC,
    most_popular_genre_id INT,
    most_popular_genre_name VARCHAR,
    most_popular_genre_count BIGINT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    current_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
    last_month_start DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
    last_month_end DATE := DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day';
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(DISTINCT t.textid) as total_books,
            COUNT(DISTINCT ta.authorid) as unique_authors,
            COUNT(DISTINCT tg.genreid) as unique_genres,
            COUNT(DISTINCT te.editorialid) as unique_editorials,
            COUNT(DISTINCT CASE 
                WHEN EXTRACT(YEAR FROM t.publisheddate) = current_year 
                THEN t.textid 
            END) as books_this_year,
            COUNT(DISTINCT CASE 
                WHEN t.created_at BETWEEN last_month_start AND last_month_end 
                THEN t.textid 
            END) as books_last_month
        FROM texts t
        LEFT JOIN text_authors ta ON t.textid = ta.textid
        LEFT JOIN text_genres tg ON t.textid = tg.textid
        LEFT JOIN text_editorials te ON t.textid = te.textid
    ),
    popular_genre AS (
        SELECT g.genreid, g.genrename, COUNT(DISTINCT tg.textid) as book_count
        FROM genres g
        INNER JOIN text_genres tg ON g.genreid = tg.genreid
        GROUP BY g.genreid, g.genrename
        ORDER BY book_count DESC
        LIMIT 1
    )
    SELECT 
        s.total_books,
        s.unique_authors,
        s.unique_genres,
        s.unique_editorials,
        s.books_this_year,
        s.books_last_month,
        CASE 
            WHEN s.unique_authors > 0 
            THEN ROUND(s.total_books::NUMERIC / s.unique_authors::NUMERIC, 2)
            ELSE 0 
        END as avg_books_per_author,
        pg.genreid as most_popular_genre_id,
        pg.genrename as most_popular_genre_name,
        pg.book_count as most_popular_genre_count
    FROM stats s
    CROSS JOIN popular_genre pg;
END;
$$;

-- === FUNCIÓN DE ESTADÍSTICAS DE AUTORES ===

CREATE OR REPLACE FUNCTION fn_author_statistics_v2()
RETURNS TABLE(
    total_authors BIGINT,
    unique_countries BIGINT,
    avg_books_per_author NUMERIC,
    most_prolific_author_id INT,
    most_prolific_author_name TEXT,
    most_prolific_author_book_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH author_stats AS (
        SELECT 
            COUNT(DISTINCT a.authorid) as total_authors,
            COUNT(DISTINCT a.countryid) as unique_countries,
            AVG(author_books.book_count) as avg_books_per_author
        FROM authors a
        LEFT JOIN (
            SELECT ta.authorid, COUNT(DISTINCT ta.textid) as book_count
            FROM text_authors ta
            GROUP BY ta.authorid
        ) author_books ON a.authorid = author_books.authorid
    ),
    top_author AS (
        SELECT 
            a.authorid,
            (a.authorname || ' ' || COALESCE(a.authormiddlename, '') || ' ' || COALESCE(a.authorlastname, '')) as full_name,
            COUNT(DISTINCT ta.textid) as book_count
        FROM authors a
        INNER JOIN text_authors ta ON a.authorid = ta.authorid
        GROUP BY a.authorid, full_name
        ORDER BY book_count DESC
        LIMIT 1
    )
    SELECT 
        s.total_authors,
        s.unique_countries,
        COALESCE(ROUND(s.avg_books_per_author, 2), 0) as avg_books_per_author,
        t.authorid as most_prolific_author_id,
        t.full_name as most_prolific_author_name,
        t.book_count as most_prolific_author_book_count
    FROM author_stats s
    CROSS JOIN top_author t;
END;
$$;

-- === FUNCIÓN PARA BÚSQUEDA DE TEXTO SIMILAR ===

CREATE OR REPLACE FUNCTION fn_similar_books_v2(
    p_title TEXT,
    p_limit INT DEFAULT 5
)
RETURNS TABLE(
    textid INT,
    texttitle VARCHAR,
    similarity_score REAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT t.textid, t.texttitle, similarity(t.texttitle, p_title) as similarity_score
    FROM texts t
    WHERE similarity(t.texttitle, p_title) > 0.2
    ORDER BY similarity_score DESC
    LIMIT p_limit;
END;
$$;

-- === FUNCIÓN DE RECOMENDACIONES POR GÉNERO ===

CREATE OR REPLACE FUNCTION fn_recommend_books_by_genre_v2(
    p_user_genre_ids INT[],
    p_exclude_text_ids INT[] DEFAULT NULL,
    p_limit INT DEFAULT 10
)
RETURNS TABLE(
    textid INT,
    texttitle VARCHAR,
    descripcion TEXT,
    genre_matches INT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT 
        t.textid, 
        t.texttitle, 
        t.descripcion,
        COUNT(tg.genreid)::INT as genre_matches
    FROM texts t
    INNER JOIN text_genres tg ON t.textid = tg.textid
    WHERE tg.genreid = ANY(p_user_genre_ids)
      AND (p_exclude_text_ids IS NULL OR t.textid != ALL(p_exclude_text_ids))
    GROUP BY t.textid, t.texttitle, t.descripcion
    ORDER BY genre_matches DESC, t.texttitle
    LIMIT p_limit;
END;
$$;

-- =====================================================
-- FUNCIONES DE UTILIDAD
-- =====================================================

-- === FUNCIÓN PARA LIMPIAR PARÁMETROS DE BÚSQUEDA ===

CREATE OR REPLACE FUNCTION fn_clean_search_param(p_param TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_param IS NULL OR trim(p_param) = '' THEN
        RETURN NULL;
    END IF;
    
    -- Limpiar caracteres especiales peligrosos
    p_param := regexp_replace(p_param, '[''";\\]', '', 'g');
    
    -- Truncar si es muy largo
    IF length(p_param) > 200 THEN
        p_param := left(p_param, 200);
    END IF;
    
    RETURN trim(p_param);
END;
$$;

-- === FUNCIÓN PARA VALIDAR ORDENAMIENTO ===

CREATE OR REPLACE FUNCTION fn_validate_sort_params(
    p_sort_by TEXT,
    p_sort_direction TEXT,
    p_allowed_fields TEXT[]
)
RETURNS TABLE(
    sort_by TEXT,
    sort_direction TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validar y limpiar sort_by
    IF p_sort_by IS NULL OR p_sort_by != ALL(p_allowed_fields) THEN
        p_sort_by := 'texttitle';
    END IF;
    
    -- Validar y limpiar sort_direction
    IF p_sort_direction IS NULL OR UPPER(p_sort_direction) NOT IN ('ASC', 'DESC') THEN
        p_sort_direction := 'ASC';
    ELSE
        p_sort_direction := UPPER(p_sort_direction);
    END IF;
    
    RETURN QUERY SELECT p_sort_by, p_sort_direction;
END;
$$;