package com.soli.biblioteca.repository;

import com.soli.biblioteca.Dto.BookResponseDTO;
import com.soli.biblioteca.model.Author;
import com.soli.biblioteca.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    boolean existsByTitle(String title);
}