package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.*;
import com.soli.biblioteca.exception.BusinessLogicException;
import com.soli.biblioteca.mapper.BookMapper;
import com.soli.biblioteca.model.*;
import com.soli.biblioteca.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.sql.Array;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class BookService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final EditorialRepository editorialRepository;
    private final GenreRepository genreRepository;
    private final TextTypeRepository textTypeRepository;

    public BookService(BookRepository bookRepository, AuthorRepository authorRepository, EditorialRepository editorialRepository, GenreRepository genreRepository, TextTypeRepository textTypeRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.editorialRepository = editorialRepository;
        this.genreRepository = genreRepository;
        this.textTypeRepository = textTypeRepository;
    }

    // =============================
    // Métodos CRUD para Admin
    // =============================

    @Transactional
    public BookResponseDTO createBook(BookCreateDTO dto) {
        Book book = new Book();
        book.setTitle(dto.getTitle());
        book.setDescription(dto.getDescription());
        book.setPublishedDate(dto.getPublishedDate());
        book.setTextUrl(dto.getTextUrl());
        book.setCoverUrl(dto.getCoverUrl());

        // Resolver relaciones
        book.setAuthors(getAuthorsFromIds(dto.getAuthorIds()));
        book.setEditorials(getEditorialsFromIds(dto.getEditorialIds()));
        book.setGenres(getGenresFromIds(dto.getGenreIds()));
        book.setType(getTextTypeFromId(dto.getTypeId()));

        Book savedBook = bookRepository.save(book);
        log.info("Book created successfully with ID: {}", savedBook.getId());
        return BookMapper.toResponseDTO(savedBook);
    }

    @Transactional
    public BookResponseDTO updateBook(Long id, BookUpdateDTO dto) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new BusinessLogicException("Libro no encontrado con ID: " + id));

        dto.getTitle().ifPresent(book::setTitle);
        dto.getDescription().ifPresent(book::setDescription);
        dto.getPublishedDate().ifPresent(book::setPublishedDate);
        dto.getTextUrl().ifPresent(book::setTextUrl);
        dto.getCoverUrl().ifPresent(book::setCoverUrl);

        dto.getAuthorIds().ifPresent(authorIds -> book.setAuthors(getAuthorsFromIds(authorIds)));
        dto.getEditorialIds().ifPresent(editorialIds -> book.setEditorials(getEditorialsFromIds(editorialIds)));
        dto.getGenreIds().ifPresent(genreIds -> book.setGenres(getGenresFromIds(genreIds)));
        dto.getTypeId().ifPresent(typeId -> book.setType(getTextTypeFromId(typeId)));

        Book updatedBook = bookRepository.save(book);
        log.info("Book updated successfully with ID: {}", updatedBook.getId());
        return BookMapper.toResponseDTO(updatedBook);
    }

    @Transactional
    public void deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new BusinessLogicException("Libro no encontrado con ID: " + id);
        }
        bookRepository.deleteById(id);
        log.info("Book deleted successfully with ID: {}", id);
    }

    // =============================
    // Métodos de Lectura y Filtros
    // =============================

    public Optional<BookResponseDTO> getBookById(Long id) {
        return bookRepository.findById(id)
                .map(BookMapper::toResponseDTO);
    }

    public PagedResponseDTO<BookResponseDTO> getBooksWithFilters(BookFilterDTO filters) {
        log.debug("Fetching books with filters: page={}, size={}, search={}", 
                filters.getPage(), filters.getSize(), filters.getSearch());
        
        Specification<Book> spec = createBookSpecification(filters);
        
        Sort sort = Sort.by(
            filters.getSortDirection().equalsIgnoreCase("DESC") ? 
            Sort.Direction.DESC : Sort.Direction.ASC, 
            filters.getSortBy()
        );
        Pageable pageable = PageRequest.of(filters.getPage(), filters.getSize(), sort);
        
        Page<Book> bookPage = bookRepository.findAll(spec, pageable);
        
        List<BookResponseDTO> bookDTOs = bookPage.getContent()
                .stream()
                .map(BookMapper::toResponseDTO)
                .collect(Collectors.toList());
        
        log.info("Retrieved {} books out of {} total (page {} of {})", 
                bookDTOs.size(), bookPage.getTotalElements(), 
                filters.getPage() + 1, bookPage.getTotalPages());
        
        return PagedResponseDTO.of(
                bookDTOs,
                filters.getPage(),
                filters.getSize(),
                bookPage.getTotalElements()
        );
    }

    // =============================
    // Métodos Auxiliares
    // =============================

    private Set<Author> getAuthorsFromIds(Set<Long> authorIds) {
        if (authorIds == null || authorIds.isEmpty()) return Collections.emptySet();
        Set<Author> authors = new HashSet<>(authorRepository.findAllById(authorIds));
        if (authors.size() != authorIds.size()) {
            throw new BusinessLogicException("Uno o más autores no encontrados.");
        }
        return authors;
    }

    private Set<Editorial> getEditorialsFromIds(Set<Long> editorialIds) {
        if (editorialIds == null || editorialIds.isEmpty()) return Collections.emptySet();
        Set<Editorial> editorials = new HashSet<>(editorialRepository.findAllById(editorialIds));
        if (editorials.size() != editorialIds.size()) {
            throw new BusinessLogicException("Una o más editoriales no encontradas.");
        }
        return editorials;
    }

    private Set<Genre> getGenresFromIds(Set<Long> genreIds) {
        if (genreIds == null || genreIds.isEmpty()) return Collections.emptySet();
        Set<Genre> genres = new HashSet<>(genreRepository.findAllById(genreIds));
        if (genres.size() != genreIds.size()) {
            throw new BusinessLogicException("Uno o más géneros no encontrados.");
        }
        return genres;
    }

    private TextType getTextTypeFromId(Long typeId) {
        return textTypeRepository.findById(typeId)
                .orElseThrow(() -> new BusinessLogicException("Tipo de texto no encontrado con ID: " + typeId));
    }

    private Specification<Book> createBookSpecification(BookFilterDTO filters) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (filters.getSearch() != null && !filters.getSearch().trim().isEmpty()) {
                String searchPattern = "%" + filters.getSearch().toLowerCase() + "%";
                Predicate titlePredicate = 
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), searchPattern);
                Predicate descriptionPredicate = 
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchPattern);
                predicates.add(criteriaBuilder.or(titlePredicate, descriptionPredicate));
            }
            
            if (filters.getTitle() != null && !filters.getTitle().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")), 
                    "%" + filters.getTitle().toLowerCase() + "%"
                ));
            }
            
            if (filters.getAuthorName() != null && !filters.getAuthorName().trim().isEmpty()) {
                String authorPattern = "%" + filters.getAuthorName().toLowerCase() + "%";
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.join("authors").get("name")), 
                    authorPattern
                ));
            }
            
            if (filters.getGenreIds() != null && !filters.getGenreIds().isEmpty()) {
                predicates.add(root.join("genres").get("id").in(filters.getGenreIds()));
            }
            
            if (filters.getEditorialIds() != null && !filters.getEditorialIds().isEmpty()) {
                predicates.add(root.join("editorials").get("id").in(filters.getEditorialIds()));
            }
            
            if (filters.getTypeId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("type").get("id"), filters.getTypeId()));
            }
            
            if (filters.getPublishedAfter() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("publishedDate"), filters.getPublishedAfter()
                ));
            }
            
            if (filters.getPublishedBefore() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("publishedDate"), filters.getPublishedBefore()
                ));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
