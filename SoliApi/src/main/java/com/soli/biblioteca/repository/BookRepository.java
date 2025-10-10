package com.soli.biblioteca.repository;

import com.soli.biblioteca.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    boolean existsByTitle(String title);

    // Vistas para lecturas agregadas
    @Query(value = "select * from public.vw_texts", nativeQuery = true)
    List<Object[]> findAllFromView();

    @Query(value = "select * from public.vw_texts where textid = :id", nativeQuery = true)
    Optional<Object[]> findFromViewById(@Param("id") Long id);
}
