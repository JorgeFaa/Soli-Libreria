package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.UserCreateDTO;
import com.soli.biblioteca.Dto.UserDTO;
import com.soli.biblioteca.Dto.UserUpdateDTO;
import com.soli.biblioteca.exception.BusinessLogicException;
import com.soli.biblioteca.mapper.UserMapper;
import com.soli.biblioteca.model.Book;
import com.soli.biblioteca.model.Genre;
import com.soli.biblioteca.model.User;
import com.soli.biblioteca.repository.BookRepository;
import com.soli.biblioteca.repository.GenreRepository;
import com.soli.biblioteca.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
public class UserService {

    private final UserRepository userRepository;
    private final GenreRepository genreRepository;
    private final CognitoService cognitoService;
    private final BookRepository bookRepository;

    public UserService(UserRepository userRepository, GenreRepository genreRepository, CognitoService cognitoService, BookRepository bookRepository) {
        this.userRepository = userRepository;
        this.genreRepository = genreRepository;
        this.cognitoService = cognitoService;
        this.bookRepository = bookRepository;
    }

    // =============================
    // Métodos para Admin
    // =============================

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<UserDTO> getUserById(Long id) {
        return userRepository.findById(id).map(UserMapper::toDTO);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));

        cognitoService.adminDeleteUser(user.getCognitoSub());
        userRepository.delete(user);
        log.info("User with id {} and cognitoSub {} deleted successfully.", id, user.getCognitoSub());
    }
    
    // =============================
    // Métodos de sincronización
    // =============================

    public UserDTO createUserInDB(String cognitoSub, UserCreateDTO dto) {
        log.info("Creating user in DB for cognitoSub: {}", cognitoSub);
        
        Optional<User> existingUser = userRepository.findByCognitoSub(cognitoSub);
        if (existingUser.isPresent()) {
            log.warn("User already exists for cognitoSub: {}", cognitoSub);
            throw new BusinessLogicException("El usuario ya existe en la base de datos");
        }
        
        try {
            userRepository.createUserByProcedure(
                    dto.getFirstName(),
                    dto.getLastName(),
                    cognitoSub,
                    dto.getPreferredGenreIds()
            );

            User created = userRepository.findByCognitoSub(cognitoSub)
                    .orElseThrow(() -> new RuntimeException("No se pudo recuperar el usuario recien creado"));

            UserDTO result = UserMapper.toDTO(userRepository.findById(created.getId()).orElse(created));
            log.info("User created successfully with ID: {}", result.getId());
            return result;
        } catch (BusinessLogicException e) {
            throw e;
        } catch (Exception ex) {
            log.warn("Stored procedure failed, falling back to JPA: {}", ex.getMessage());
            User user = new User();
            user.setCognitoSub(cognitoSub);
            user.setFirstName(dto.getFirstName());
            user.setLastName(dto.getLastName());

            Set<Genre> genres = new HashSet<>();
            if (dto.getPreferredGenreIds() != null) {
                log.debug("JPA fallback: Adding {} preferred genres", dto.getPreferredGenreIds().size());
                dto.getPreferredGenreIds().forEach(id -> {
                    genreRepository.findById(id).ifPresentOrElse(
                        genres::add,
                        () -> log.warn("Genre with id {} not found during JPA fallback", id)
                    );
                });
            }
            user.setPreferredGenres(genres);

            User saved = userRepository.save(user);
            return UserMapper.toDTO(saved);
        }
    }

    public UserDTO findByCognitoSubDTO(String sub) {
        try {
            Optional<Object[]> row = userRepository.findUserViewByCognitoSub(sub);
            if (row.isPresent()) return mapUserViewRow(row.get());
        } catch (Exception ignored) {}

        return userRepository.findByCognitoSub(sub)
                .map(UserMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con sub: " + sub));
    }

    public UserDTO findUserByJwt(Jwt jwt) {
        String cognitoSub = jwt.getSubject();
        log.debug("Finding user by JWT with cognitoSub: {}", cognitoSub);

        try {
            Optional<Object[]> row = userRepository.findUserViewByCognitoSub(cognitoSub);
            if (row.isPresent()) {
                UserDTO user = mapUserViewRow(row.get());
                log.debug("User found in view with ID: {}", user.getId());
                return user;
            }
        } catch (Exception e) {
            log.warn("Failed to fetch user from view, trying JPA: {}", e.getMessage());
        }

        return userRepository.findByCognitoSub(cognitoSub)
                .map(user -> {
                    UserDTO userDTO = UserMapper.toDTO(user);
                    log.debug("User found in DB with ID: {}", userDTO.getId());
                    return userDTO;
                })
                .orElseThrow(() -> {
                    log.error("User not found for cognitoSub: {}", cognitoSub);
                    return new BusinessLogicException(
                        "Usuario no encontrado. Debe completar el registro en la base de datos."
                    );
                });
    }

    private UserDTO mapUserViewRow(Object[] r) {
        int i = 0;
        Long id = ((Number) r[i++]).longValue();
        String first = (String) r[i++];
        String last = (String) r[i++];
        String cognitoSub = (String) r[i++];
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
        dto.setPrefferredGenreIds(new java.util.HashSet<>(genreIds));
        return dto;
    }

    // =============================
    // Actualizaciones específicas
    // =============================

    @Transactional
    public UserDTO updateUserProfile(String cognitoSub, UserUpdateDTO dto) {
        User user = userRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new BusinessLogicException("Usuario no encontrado."));

        dto.getFirstName().ifPresent(user::setFirstName);
        dto.getLastName().ifPresent(user::setLastName);
        dto.getPreferredGenreIds().ifPresent(genreIds -> {
            Set<Genre> preferredGenres = new HashSet<>(genreRepository.findAllById(genreIds));
            if (preferredGenres.size() != genreIds.size()) {
                throw new BusinessLogicException("Uno o más géneros preferidos no encontrados.");
            }
            user.setPreferredGenres(preferredGenres);
        });

        User updatedUser = userRepository.save(user);
        log.info("User profile for {} updated successfully.", cognitoSub);
        return UserMapper.toDTO(updatedUser);
    }

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

    // =============================
    // Gestión de Libros Favoritos
    // =============================

    @Transactional(readOnly = true)
    public Set<Book> getFavoriteBooks(String cognitoSub) {
        User user = userRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new BusinessLogicException("Usuario no encontrado."));
        return user.getFavoriteBooks();
    }

    @Transactional
    public void addFavoriteBook(String cognitoSub, Long bookId) {
        User user = userRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new BusinessLogicException("Usuario no encontrado."));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new BusinessLogicException("Libro no encontrado."));

        user.getFavoriteBooks().add(book);
        userRepository.save(user);
        log.info("Book with id {} added to favorites for user {}", bookId, cognitoSub);
    }

    @Transactional
    public void removeFavoriteBook(String cognitoSub, Long bookId) {
        User user = userRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new BusinessLogicException("Usuario no encontrado."));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new BusinessLogicException("Libro no encontrado."));

        user.getFavoriteBooks().remove(book);
        userRepository.save(user);
        log.info("Book with id {} removed from favorites for user {}", bookId, cognitoSub);
    }
}
