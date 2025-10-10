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
import java.util.Optional;

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
        // Crear usuario vía stored procedure; si falla, usar JPA
        try {
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
        } catch (Exception ex) {
            // Fallback a JPA puro si los SPs no están disponibles
            User user = new User();
            user.setCognitoSub(cognitoSub);
            user.setFirstName(dto.getFirstName());
            user.setLastName(dto.getLastName());
            user.setActiveMember(false);

            // Asignar géneros (entidad)
            Set<Genre> genres = new HashSet<>();
            if (dto.getPreferredGenreIds() != null) {
                dto.getPreferredGenreIds().forEach(id -> genreRepository.findById(id).ifPresent(genres::add));
            }
            user.setPreferredGenres(genres);

            User saved = userRepository.save(user);
            return UserMapper.toDTO(saved);
        }
    }

    public UserDTO findByCognitoSubDTO(String sub) {
        // Intentar vista agregada primero
        try {
            Optional<Object[]> row = userRepository.findUserViewByCognitoSub(sub);
            if (row.isPresent()) return mapUserViewRow(row.get());
        } catch (Exception ignored) {}

        // Fallback a entidad JPA si la vista no retorna
        return userRepository.findByCognitoSub(sub)
                .map(UserMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con sub: " + sub));
    }

    public UserDTO findUserByJwt(Jwt jwt) {
        String cognitoSub = jwt.getSubject(); // obtenemos el cognitoSub del JWT

        try {
            Optional<Object[]> row = userRepository.findUserViewByCognitoSub(cognitoSub);
            if (row.isPresent()) return mapUserViewRow(row.get());
        } catch (Exception ignored) {}

        return userRepository.findByCognitoSub(cognitoSub)
                .map(UserMapper::toDTO)
                .orElse(null); // o lanzar excepción si prefieres
    }

    private UserDTO mapUserViewRow(Object[] r) {
        // vw_users: userid, firstname, lastname, activemember, cognitosub, preferred_genre_ids, preferred_genres
        int i = 0;
        Long id = ((Number) r[i++]).longValue();
        String first = (String) r[i++];
        String last = (String) r[i++];
        Boolean active = (Boolean) r[i++];
        String cognitoSub = (String) r[i++];
        // int[] of genre ids may come as java.sql.Array
        java.util.List<Long> genreIds = new java.util.ArrayList<>();
        Object idsArr = r[i++];
        if (idsArr instanceof java.sql.Array a) {
            try {
                Object arr = a.getArray();
                if (arr instanceof Object[]) {
                    for (Object v : (Object[]) arr) if (v != null) genreIds.add(((Number) v).longValue());
                }
            } catch (Exception ignored) {}
        } else if (idsArr instanceof Object[]) {
            for (Object v : (Object[]) idsArr) if (v != null) genreIds.add(((Number) v).longValue());
        }

        UserDTO dto = new UserDTO();
        dto.setId(id);
        dto.setFirstName(first);
        dto.setLastName(last);
        dto.setActiveMember(active != null ? active : false);
        dto.setPrefferedGenreIds(new java.util.HashSet<>(genreIds));
        return dto;
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