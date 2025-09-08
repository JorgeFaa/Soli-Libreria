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
    public BookResponseDTO createBook(BookCreateDTO dto) {
        Book book = BookMapper.toEntity(dto);
        Book saved = bookRepository.save(book);
        return BookMapper.toResponseDTO(saved);
    }

    // Obtener todos los libros
    public List<BookResponseDTO> getAllBooks() {
        return bookRepository.findAll()
                .stream()
                .map(BookMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // Obtener libro por ID
    public Optional<BookResponseDTO> getBookById(Long id) {
        return bookRepository.findById(id)
                .map(BookMapper::toResponseDTO);
    }
}
