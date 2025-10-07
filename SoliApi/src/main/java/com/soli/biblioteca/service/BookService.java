package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.BookCreateDTO;
import com.soli.biblioteca.Dto.BookResponseDTO;
import com.soli.biblioteca.mapper.BookMapper;
import com.soli.biblioteca.model.Book;
import com.soli.biblioteca.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    // Crear un libro
    public Book createBook(Book book) {
        return bookRepository.save(book);
    }

    // Obtener todos los libros
    public List<BookResponseDTO> getAllBooks() {
        return bookRepository.findAll()
                .stream()
                .map(BookMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public boolean existsBookByTitle(String title) {
        return bookRepository.existsByTitle(title);
    }

    // Obtener libro por ID
    public Optional<BookResponseDTO> getBookById(Long id) {
        return bookRepository.findById(id)
                .map(BookMapper::toResponseDTO);
    }
}
