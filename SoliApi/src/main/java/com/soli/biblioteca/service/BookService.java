package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.*;
import com.soli.biblioteca.mapper.BookMapper;
import com.soli.biblioteca.model.Book;
import com.soli.biblioteca.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.sql.Array;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    // Crear o actualizar un libro (escrituras siguen usando JPA)
    public Book save(Book book) {
        return bookRepository.save(book);
    }

    // Obtener todos los libros (lectura desde vista agregada)
    public List<BookResponseDTO> getAllBooks() {
        List<Object[]> rows = bookRepository.findAllFromView();
        return rows.stream().map(this::mapViewRowToDTO).collect(Collectors.toList());
    }

    public boolean existsBookByTitle(String title) {
        return bookRepository.existsByTitle(title);
    }

    // Obtener libro por ID (lectura desde vista agregada)
    public Optional<BookResponseDTO> getBookById(Long id) {
        return bookRepository.findFromViewById(id).map(this::mapViewRowToDTO);
    }

    // Obtener entidad por ID (para escrituras/actualizaciones)
    public Optional<Book> findEntityById(Long id) {
        return bookRepository.findById(id);
    }

    // Eliminar libro por ID
    public boolean deleteBook(Long id) {
        if (bookRepository.existsById(id)) {
            bookRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private BookResponseDTO mapViewRowToDTO(Object[] r) {
        int i = 0;
        Long id = getLong(r[i++]);
        String title = (String) r[i++];
        String descripcion = (String) r[i++];
        LocalDate publishedDate = (r[i] instanceof java.sql.Date) ? ((java.sql.Date) r[i++]).toLocalDate() : (LocalDate) r[i++];
        String textUrl = (String) r[i++];
        String coverUrl = (String) r[i++];
        Long typeId = getLong(r[i++]);
        String typeName = (String) r[i++];

        List<Long> authorIds = toLongList(r[i++]);
        List<String> authorNames = toStringList(r[i++]);
        List<String> authorMiddle = toStringList(r[i++]);
        List<String> authorLast = toStringList(r[i++]);
        List<String> authorCountry = toStringList(r[i++]);

        List<Long> editorialIds = toLongList(r[i++]);
        List<String> editorialNames = toStringList(r[i++]);
        List<Long> editorialCountryIds = toLongList(r[i++]);
        List<String> editorialCountryNames = toStringList(r[i++]);

        List<Long> genreIds = toLongList(r[i++]);
        List<String> genreNames = toStringList(r[i++]);

        // Map authors
        Set<AuthorResponseDTO> authors = new LinkedHashSet<>();
        int maxA = maxSize(authorIds, authorNames, authorMiddle, authorLast, authorCountry);
        for (int idx = 0; idx < maxA; idx++) {
            Long aid = getAt(authorIds, idx);
            String an = getAt(authorNames, idx);
            String am = getAt(authorMiddle, idx);
            String al = getAt(authorLast, idx);
            String ac = getAt(authorCountry, idx);
            authors.add(new AuthorResponseDTO(aid, an, am, al, ac));
        }

        // Map editorials
        Set<EditorialResponseDTO> editorials = new LinkedHashSet<>();
        int maxE = maxSize(editorialIds, editorialNames, editorialCountryIds, editorialCountryNames);
        for (int idx = 0; idx < maxE; idx++) {
            Long eid = getAt(editorialIds, idx);
            String en = getAt(editorialNames, idx);
            Long ecid = getAt(editorialCountryIds, idx);
            String ecn = getAt(editorialCountryNames, idx);
            editorials.add(new EditorialResponseDTO(eid, en, ecid, ecn));
        }

        // Map genres
        Set<GenreResponseDTO> genres = new LinkedHashSet<>();
        int maxG = Math.max(genreIds.size(), genreNames.size());
        for (int idx = 0; idx < maxG; idx++) {
            Long gid = getAt(genreIds, idx);
            String gn = getAt(genreNames, idx);
            genres.add(new GenreResponseDTO(gid, gn));
        }

        TextTypeResponseDTO type = new TextTypeResponseDTO(typeId, typeName);

        BookResponseDTO dto = new BookResponseDTO();
        dto.setId(id);
        dto.setTitle(title);
        dto.setDescription(descripcion);
        dto.setPublishedDate(publishedDate);
        dto.setTextUrl(textUrl);
        dto.setCoverUrl(coverUrl);
        dto.setAuthors(authors);
        dto.setEditorials(editorials);
        dto.setGenres(genres);
        dto.setType(type);
        return dto;
    }

    private int maxSize(List<?>... lists) {
        int m = 0;
        for (List<?> l : lists) m = Math.max(m, l != null ? l.size() : 0);
        return m;
    }

    private <T> T getAt(List<T> list, int idx) {
        if (list == null || idx >= list.size()) return null;
        return list.get(idx);
    }

    private Long getLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).longValue();
        return Long.valueOf(o.toString());
    }

    private List<Long> toLongList(Object sqlArray) {
        List<Object> base = toObjectList(sqlArray);
        List<Long> out = new ArrayList<>();
        for (Object v : base) out.add(v == null ? null : ((Number) v).longValue());
        return out;
    }

    private List<String> toStringList(Object sqlArray) {
        List<Object> base = toObjectList(sqlArray);
        List<String> out = new ArrayList<>();
        for (Object v : base) out.add(v == null ? null : v.toString());
        return out;
    }

    private List<Object> toObjectList(Object sqlArray) {
        if (sqlArray == null) return Collections.emptyList();
        try {
            if (sqlArray instanceof Array a) {
                Object arr = a.getArray();
                if (arr instanceof Object[]) return Arrays.asList((Object[]) arr);
                // Fallback: single element
                return Collections.singletonList(arr);
            }
            if (sqlArray instanceof Object[]) return Arrays.asList((Object[]) sqlArray);
            if (sqlArray instanceof Collection<?>) return new ArrayList<>((Collection<?>) sqlArray);
        } catch (SQLException e) {
            // ignore and return empty
        }
        return Collections.emptyList();
    }
}
