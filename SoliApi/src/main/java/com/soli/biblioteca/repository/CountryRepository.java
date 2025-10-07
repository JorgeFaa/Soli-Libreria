package com.soli.biblioteca.repository;

import com.soli.biblioteca.model.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {
    boolean existsByName(String name);
}
