package com.soli.biblioteca.repository;

import com.soli.biblioteca.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Busca un usuario por su cognitoSub (UUID de Cognito)
    Optional<User> findByCognitoSub(String cognitoSub);
    
    // Usar stored procedure para obtener usuario por ID
    @Query(value = "SELECT * FROM sp_get_user(:p_userID)", nativeQuery = true)
    Optional<User> findUserByStoredProcedure(@Param("p_userID") Long userId);
    
    // Usar la vista vw_users para obtener información completa
    @Query(value = "SELECT u.userid, u.firstname, u.lastname, u.activemember, u.cognitosub " +
           "FROM users u", nativeQuery = true)
    List<User> findAllUsersFromView();
}
