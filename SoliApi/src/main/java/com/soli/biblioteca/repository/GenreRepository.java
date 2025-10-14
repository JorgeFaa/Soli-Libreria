package com.soli.biblioteca.repository;

import com.soli.biblioteca.model.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GenreRepository extends JpaRepository<Genre, Long> {
    boolean existsByName(String name);
    
    List<Genre> findByNameContainingIgnoreCase(String name);
}
