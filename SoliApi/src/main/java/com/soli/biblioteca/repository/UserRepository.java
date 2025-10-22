package com.soli.biblioteca.repository;

import com.soli.biblioteca.model.Genre;
import com.soli.biblioteca.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.cognitoidentityprovider.endpoints.internal.Value;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface UserRepository extends JpaRepository<User, Long> {

    // Busca un usuario por su cognitoSub (UUID de Cognito)
    Optional<User> findByCognitoSub(String cognitoSub);

    // Crear usuario usando stored procedure
    @Modifying
    @Transactional
    @Query(value = "call sp_create_user(:firstname, :lastname, :cognitosub, :genre_ids)", nativeQuery = true)
    void createUserByProcedure(@Param("firstname") String firstName,
                               @Param("lastname") String lastName,
                               @Param("cognitosub") String cognitoSub,
                               @Param("genre_ids") Set<Long> genre_ids);
    // Añadir o quitar géneros preferidos (tabla N:M)
    @Modifying
    @Transactional
    @Query(value = "call sp_add_user_genre(:userid, :genreid)", nativeQuery = true)
    void addUserGenre(@Param("userid") Long userId, @Param("genreid") Long genreId);

    @Modifying
    @Transactional
    @Query(value = "call sp_remove_user_genre(:userid, :genreid)", nativeQuery = true)
    void removeUserGenre(@Param("userid") Long userId, @Param("genreid") Long genreId);

    // Consultar vista agregada de usuarios (si se requiere)
    @Query(value = "select * from public.vw_users", nativeQuery = true)
    List<Object[]> findAllUsersView();

    @Query(value = "select * from public.vw_users where cognitosub = :cognitoSub", nativeQuery = true)
    Optional<Object[]> findUserViewByCognitoSub(@Param("cognitoSub") String cognitoSub);
}
