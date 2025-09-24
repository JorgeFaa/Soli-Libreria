package com.soli.biblioteca.Dto;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RefreshTokenRequestDTO {
    private String username;
    private String refreshToken;

}
