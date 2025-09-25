package com.soli.biblioteca.config;

import com.soli.biblioteca.functions.ApiRouterFunction;
import com.soli.biblioteca.service.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;
import java.util.function.Function;

@Configuration
public class RouterConfig {

    @Bean
    public Function<Map<String,Object>, Map<String,Object>> apiRouterFunction(
            CognitoService cognitoService,
            UserService userService,
            TextTypeService textTypeService,
            GenreService genreService,
            EditorialService editorialService,
            CountryService countryService,
            AuthorService authorService,
            BookService bookService
    ) {
        return new ApiRouterFunction(
                cognitoService,
                userService,
                textTypeService,
                genreService,
                editorialService,
                countryService,
                authorService,
                bookService
        );
    }
}