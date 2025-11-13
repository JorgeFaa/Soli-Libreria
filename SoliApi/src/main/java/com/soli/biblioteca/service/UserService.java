package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.*;
import com.soli.biblioteca.exception.BusinessLogicException;
import com.soli.biblioteca.exception.ResourceNotFoundException;
import com.soli.biblioteca.mapper.BookMapper;
import com.soli.biblioteca.mapper.UserMapper;
import com.soli.biblioteca.model.*;
import com.soli.biblioteca.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final ReadingProgressRepository readingProgressRepository;

    public UserService(UserRepository userRepository, GenreRepository genreRepository, CognitoService cognitoService, BookRepository bookRepository, ReadingProgressRepository readingProgressRepository) {
        this.userRepository = userRepository;
        this.genreRepository = genreRepository;
        this.cognitoService = cognitoService;
        this.bookRepository = bookRepository;
        this.readingProgressRepository = readingProgressRepository;
    }

    // =============================
    // Gestión de Progreso de Lectura
    // =============================

    @Transactional(readOnly = true)
    public List<ReadingProgressDTO> getReadingProgress(String cognitoSub) {
        User user = userRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        
        return readingProgressRepository.findByUserId(user.getId()).stream()
                .map(progress -> new ReadingProgressDTO(
                        progress.getBook().getId(),
                        progress.getLastPage(),
                        progress.getUpdatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public ReadingProgressDTO saveOrUpdateReadingProgress(String cognitoSub, Long bookId, ReadingProgressUpdateDTO dto) {
        User user = userRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Libro", bookId));

        ReadingProgressId progressId = new ReadingProgressId(user.getId(), bookId);
        
        ReadingProgress progress = readingProgressRepository.findById(progressId)
                .orElseGet(() -> {
                    ReadingProgress newProgress = new ReadingProgress();
                    newProgress.setId(progressId);
                    newProgress.setUser(user);
                    newProgress.setBook(book);
                    return newProgress;
                });

        progress.setLastPage(dto.getLastPage());
        progress.setUpdatedAt(LocalDateTime.now());

        ReadingProgress savedProgress = readingProgressRepository.save(progress);

        return new ReadingProgressDTO(
            savedProgress.getBook().getId(),
            savedProgress.getLastPage(),
            savedProgress.getUpdatedAt()
        );
    }


    // =============================
    // Gestión de Libros Favoritos
    // =============================

    @Transactional(readOnly = true)
    public Set<BookResponseDTO> getFavoriteBooks(String cognitoSub) {
        User user = userRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        return user.getFavoriteBooks().stream()
                .map(BookMapper::toResponseDTO)
                .collect(Collectors.toSet());
    }

    @Transactional
    public void addFavoriteBook(String cognitoSub, Long bookId) {
        User user = userRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Libro", bookId));

        user.getFavoriteBooks().add(book);
        userRepository.save(user);
        log.info("Book with id {} added to favorites for user {}", bookId, cognitoSub);
    }

    @Transactional
    public void removeFavoriteBook(String cognitoSub, Long bookId) {
        User user = userRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Libro", bookId));

        user.getFavoriteBooks().remove(book);
        userRepository.save(user);
        log.info("Book with id {} removed from favorites for user {}", bookId, cognitoSub);
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
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        cognitoService.adminDeleteUser(user.getCognitoSub());
        userRepository.delete(user);
        log.info("User with id {} and cognitoSub {} deleted successfully.", id, user.getCognitoSub());
    }
    
    // =============================
    // Métodos de sincronización y perfil
    // =============================

    public UserDTO createUserInDB(String cognitoSub, UserCreateDTO dto) {
        log.info("Creating user in DB for cognitoSub: {}", cognitoSub);
        
        userRepository.findByCognitoSub(cognitoSub).ifPresent(u -> {
            throw new BusinessLogicException("El usuario ya existe en la base de datos");
        });
        
        User user = new User();
        user.setCognitoSub(cognitoSub);
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());

        if (dto.getPreferredGenreIds() != null && !dto.getPreferredGenreIds().isEmpty()) {
            Set<Genre> genres = new HashSet<>(genreRepository.findAllById(dto.getPreferredGenreIds()));
            user.setPreferredGenres(genres);
        }

        User saved = userRepository.save(user);
        return UserMapper.toDTO(saved);
    }

    public UserDTO findUserByJwt(Jwt jwt) {
        String cognitoSub = jwt.getSubject();
        return userRepository.findByCognitoSub(cognitoSub)
                .map(UserMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado. Debe completar el registro en la base de datos."));
    }

    @Transactional
    public UserDTO updateUserProfile(String cognitoSub, UserUpdateDTO dto) {
        User user = userRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        dto.getFirstName().ifPresent(user::setFirstName);
        dto.getLastName().ifPresent(user::setLastName);
        dto.getPreferredGenreIds().ifPresent(genreIds -> {
            Set<Genre> preferredGenres = new HashSet<>(genreRepository.findAllById(genreIds));
            user.setPreferredGenres(preferredGenres);
        });

        User updatedUser = userRepository.save(user);
        log.info("User profile for {} updated successfully.", cognitoSub);
        return UserMapper.toDTO(updatedUser);
    }
}
