package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.UserCreateDTO;
import com.soli.biblioteca.Dto.UserDTO;
import com.soli.biblioteca.mapper.UserMapper;
import com.soli.biblioteca.model.Genre;
import com.soli.biblioteca.model.User;
import com.soli.biblioteca.repository.GenreRepository;
import com.soli.biblioteca.repository.UserRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final GenreRepository genreRepository;

    public UserService(UserRepository userRepository, GenreRepository genreRepository) {
        this.userRepository = userRepository;
        this.genreRepository = genreRepository;
    }

    // =============================
    // Métodos de sincronización
    // =============================


    // Crea usuario si no existe (desde login Cognito)
    public UserDTO createUserInDB(String cognitoSub, UserCreateDTO dto) {
        // Crear usuario vía stored procedure para alinear con la capa SQL
        boolean active = false; // mantener comportamiento actual (nota: default DB es TRUE)
        userRepository.createUserByProcedure(
                dto.getFirstName(),
                dto.getLastName(),
                active,
                cognitoSub
        );

        // Recuperar el usuario creado para obtener su ID
        User created = userRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new RuntimeException("No se pudo recuperar el usuario recien creado"));

        // Asignar géneros preferidos mediante SP N:M si se enviaron
        if (dto.getPreferredGenreIds() != null) {
            dto.getPreferredGenreIds().forEach(gid -> {
                // Validar que el género existe
                genreRepository.findById(gid).orElseThrow(() -> new RuntimeException("Género no encontrado con id: " + gid));
                userRepository.addUserGenre(created.getId(), gid);
            });
        }

        // Devolver DTO basado en la entidad actual
        return UserMapper.toDTO(userRepository.findById(created.getId()).orElse(created));
    }

    public UserDTO findByCognitoSubDTO(String sub) {
        return userRepository.findByCognitoSub(sub)
                .map(UserMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con sub: " + sub));
    }

    public UserDTO findUserByJwt(Jwt jwt) {
        String cognitoSub = jwt.getSubject(); // obtenemos el cognitoSub del JWT

        return userRepository.findByCognitoSub(cognitoSub)
                .map(UserMapper::toDTO)
                .orElse(null); // o lanzar excepción si prefieres
    }

    // =============================
    // Actualizaciones específicas
    // =============================

    public UserDTO updateGenreById(Long id, Set<Long> newGenreIds) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        Set<Genre> genres = new HashSet<>();
        newGenreIds.forEach(gid -> genreRepository.findById(gid).ifPresent(genres::add));

        user.setPreferredGenres(genres);
        return UserMapper.toDTO(userRepository.save(user));
    }

    public UserDTO updateGenreBySub(String sub, Set<Long> newGenreIds) {
        User user = userRepository.findByCognitoSub(sub)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con sub: " + sub));
        Set<Genre> genres = new HashSet<>();
        newGenreIds.forEach(gid -> genreRepository.findById(gid).ifPresent(genres::add));
        return UserMapper.toDTO(userRepository.save(user));
    }


    public UserDTO activateMembership(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        user.setActiveMember(true);
        return UserMapper.toDTO(userRepository.save(user));
    }

}