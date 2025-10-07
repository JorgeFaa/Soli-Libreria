package com.soli.biblioteca.Dto;

import com.soli.biblioteca.model.Genre;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Setter
@Getter
public class UserCreateDTO {
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    @NotBlank
    private boolean activeMember;
    @NotBlank
    private Set<Long> PreferredGenreIds;

}