package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.BookCreateDTO;
import com.soli.biblioteca.Dto.BookResponseDTO;
import com.soli.biblioteca.Dto.BookUpdateDTO;
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

    // Eliminar libro por ID
    public boolean deleteBook(Long id) {
        if (bookRepository.existsById(id)) {
            bookRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Actualizar libro por ID
    public Optional<BookResponseDTO> updateBook(Long id, BookUpdateDTO updateDTO) {
        Optional<Book> optionalBook = bookRepository.findById(id);
        
        if (optionalBook.isEmpty()) {
            return Optional.empty();
        }
        
        Book existingBook = optionalBook.get();
        
        // Usar el mapper para actualizar solo los campos proporcionados
        BookMapper.updateBookFromDTO(existingBook, updateDTO);
        
        // Guardar el libro actualizado
        Book updatedBook = bookRepository.save(existingBook);
        
        // Retornar como DTO
        return Optional.of(BookMapper.toResponseDTO(updatedBook));
    }

    // Método auxiliar para obtener la entidad Book por ID (para uso interno)
    public Optional<Book> findById(Long id) {
        return bookRepository.findById(id);
    }
}
