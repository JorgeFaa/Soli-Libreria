package com.soli.biblioteca.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    private String accessToken;
    private String idToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Integer expiresIn;
}
