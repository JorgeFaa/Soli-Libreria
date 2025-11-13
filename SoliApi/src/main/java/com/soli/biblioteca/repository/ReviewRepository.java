package com.soli.biblioteca.repository;

import com.soli.biblioteca.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByBookId(Long bookId, Pageable pageable);

    Optional<Review> findByBookIdAndUserId(Long bookId, Long userId);
}
