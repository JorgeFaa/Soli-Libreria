package com.soli.biblioteca.repository;

import com.soli.biblioteca.model.ReadingProgress;
import com.soli.biblioteca.model.ReadingProgressId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReadingProgressRepository extends JpaRepository<ReadingProgress, ReadingProgressId> {
    List<ReadingProgress> findByUserId(Long userId);
}
