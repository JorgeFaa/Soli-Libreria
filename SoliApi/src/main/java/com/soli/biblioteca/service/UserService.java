package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.UserCreateDTO;
import com.soli.biblioteca.Dto.UserDTO;
import com.soli.biblioteca.mapper.UserMapper;
import com.soli.biblioteca.model.User;
import com.soli.biblioteca.repository.UserRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
        user.setGenrePreference(dto.getGenrePreference());
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

    public UserDTO updateGenreById(Long id, String newGenre) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        user.setGenrePreference(newGenre);
        return UserMapper.toDTO(userRepository.save(user));
    }

    public UserDTO updateGenreBySub(String sub, String newGenre) {
        User user = userRepository.findByCognitoSub(sub)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con sub: " + sub));
        user.setGenrePreference(newGenre);
        return UserMapper.toDTO(userRepository.save(user));
    }


    public UserDTO activateMembership(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        user.setActiveMember(true);
        return UserMapper.toDTO(userRepository.save(user));
    }

}