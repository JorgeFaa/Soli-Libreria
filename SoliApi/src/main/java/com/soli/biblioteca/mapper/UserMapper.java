package com.soli.biblioteca.mapper;

import com.soli.biblioteca.Dto.UserDTO;
import com.soli.biblioteca.Dto.RegisterDTO;
import com.soli.biblioteca.model.User;

public class UserMapper {

    public static UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setActiveMember(user.isActiveMember());
        dto.setGenrePreference(user.getGenrePreference());


        return dto;
    }

    public User convertToEntity(UserDTO dto) {
        if (dto == null) return null;
        User user = new User();
        user.setId(dto.getId());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setActiveMember(dto.isActiveMember());
        user.setGenrePreference(dto.getGenrePreference());
        return user;
    }

}
