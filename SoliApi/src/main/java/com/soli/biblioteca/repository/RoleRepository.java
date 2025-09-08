package com.soli.biblioteca.repository;

import com.soli.biblioteca.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    // Método para buscar un rol por su nombre
    Optional<Role> findByRole(String role);
}