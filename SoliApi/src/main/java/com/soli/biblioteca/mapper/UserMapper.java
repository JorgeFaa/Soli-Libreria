package com.soli.biblioteca.mapper;

import com.soli.biblioteca.Dto.UserDTO;
import com.soli.biblioteca.model.User;

import java.util.stream.Collectors;

public class UserMapper {

    public static UserDTO toDTO(User user) {
        if (user == null) return null;

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPrefferredGenreIds(
                user.getPreferredGenres()
                        .stream()
                        .map(g -> g.getId())
                        .collect(Collectors.toSet())
        );
        dto.setFavoriteBooks(
                user.getFavoriteBooks()
                        .stream()
                        .map(g -> g.getId())
                        .collect(Collectors.toSet())
        );

        return dto;
    }

}
