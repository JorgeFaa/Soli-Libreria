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
        User user = new User();
        user.setCognitoSub(cognitoSub);
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        Set<Genre> genres = new HashSet<>();
        if (dto.getPreferredGenreIds() != null) {
            dto.getPreferredGenreIds().forEach(id -> {
                genreRepository.findById(id).ifPresent(genres::add);
            });
        }
        user.setActiveMember(false);


        User saved = userRepository.save(user);
        return UserMapper.toDTO(saved);
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