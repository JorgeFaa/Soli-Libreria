package com.soli.biblioteca.mapper;

import com.soli.biblioteca.Dto.UserDTO;
import com.soli.biblioteca.Dto.RegisterDTO;
import com.soli.biblioteca.model.Genre;
import com.soli.biblioteca.model.User;

import java.util.stream.Collectors;

public class UserMapper {

    public static UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setActiveMember(user.isActiveMember());
        dto.setPrefferedGenreIds(
                user.getPreferredGenres()
                        .stream()
                        .map(g -> g.getId())
                        .collect(Collectors.toSet())
        );

        return dto;
    }

    public User convertToEntity(UserDTO dto) {
        if (dto == null) return null;
        User user = new User();
        user.setId(dto.getId());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setActiveMember(dto.isActiveMember());
        return user;
    }

}
