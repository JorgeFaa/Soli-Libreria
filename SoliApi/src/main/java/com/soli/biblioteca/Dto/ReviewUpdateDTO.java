package com.soli.biblioteca.Dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.util.Optional;

@Data
public class ReviewUpdateDTO {

    private Optional<@Min(1) @Max(5) Integer> rating = Optional.empty();

    private Optional<String> comment = Optional.empty();
}
