package com.soli.biblioteca.repository;

import com.soli.biblioteca.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Busca un usuario por su cognitoSub (UUID de Cognito)
    Optional<User> findByCognitoSub(String cognitoSub);
}