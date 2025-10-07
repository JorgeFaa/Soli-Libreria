package com.soli.biblioteca.repository;

import com.soli.biblioteca.model.TextType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TextTypeRepository extends JpaRepository<TextType, Long> {
    boolean existsByType(String name);
}
