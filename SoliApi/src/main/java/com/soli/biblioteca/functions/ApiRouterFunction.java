package com.soli.biblioteca.functions;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.soli.biblioteca.Dto.*;
import com.soli.biblioteca.model.*;
import com.soli.biblioteca.service.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

public class ApiRouterFunction implements Function<Map<String, Object>, Map<String, Object>> {

    private final CognitoService cognitoService;
    private final UserService userService;
    private final TextTypeService textTypeService;
    private final GenreService genreService;
    private final EditorialService editorialService;
    private final CountryService countryService;
    private final AuthorService authorService;
    private final BookService bookService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ApiRouterFunction(CognitoService cognitoService,
                             UserService userService,
                             TextTypeService textTypeService,
                             GenreService genreService,
                             EditorialService editorialService,
                             CountryService countryService,
                             AuthorService authorService,
                             BookService bookService) {
        this.bookService = bookService;
        this.authorService = authorService;
        this.countryService = countryService;
        this.cognitoService = cognitoService;
        this.userService = userService;
        this.textTypeService = textTypeService;
        this.genreService = genreService;
        this.editorialService = editorialService;
    }

    @Override
    public Map<String, Object> apply(Map<String, Object> input) {
        try {
            String path = (String) input.getOrDefault("rawPath", "");
            Map<String,Object> requestContext = (Map<String,Object>) input.get("requestContext");
            Map<String,Object> http = requestContext != null ? (Map<String,Object>) requestContext.get("http") : null;
            String method = http != null ? (String) http.get("method") : "";

            Map<String, Object> body = parseBody(input.get("body"));
            Map<String,String> pathParams = (Map<String,String>) input.getOrDefault("pathParameters", new HashMap<>());
            switch (path) {
                case "/user/login":
                    if ("POST".equalsIgnoreCase(method)) {
                        LoginRequest loginRequest = objectMapper.convertValue(body, LoginRequest.class);
                        if (loginRequest.getUsername() == null || loginRequest.getPassword() == null) {
                            return buildResponse(400, Map.of("error", "Username or password is missing"));
                        }
                        Map<String,String> tokens = cognitoService.login(loginRequest.getUsername(), loginRequest.getPassword());
                        return buildResponse(200, tokens);
                    }
                    break;

                case "/user/register":
                    if ("POST".equalsIgnoreCase(method)) {
                        RegisterDTO registerDTO = objectMapper.convertValue(body, RegisterDTO.class);

                        if (registerDTO.getUsername() == null || registerDTO.getPassword() == null) {
                            return buildResponse(400, Map.of("error", "Username o password faltante"));
                        }

                        cognitoService.registerUser(registerDTO.getUsername(), registerDTO.getPassword());
                        return buildResponse(200, Map.of("message", "Registrado en Cognito"));
                    }
                    break;

                case "/user/createUser":
                    if ("POST".equalsIgnoreCase(method)) {
                        UserCreateDTO dto = objectMapper.convertValue(body, UserCreateDTO.class);
                        String cognitoSub = (String) body.get("cognitoSub");
                        return buildResponse(200, userService.createUserInDB(cognitoSub, dto));
                    }
                    break;

                case "/user/{identifier}/genre":
                    if ("PATCH".equalsIgnoreCase(method)) {
                        String identifier = pathParams.get("identifier");
                        String newGenre = (String) body.get("genrePreference");
                        return buildResponse(200,
                                identifier.matches("\\d+")
                                        ? userService.updateGenreById(Long.valueOf(identifier), newGenre)
                                        : userService.updateGenreBySub(identifier, newGenre));
                    }
                    break;

                case "/user/{id}/active":
                    if ("PATCH".equalsIgnoreCase(method)) {
                        Long id = Long.valueOf(pathParams.get("id"));
                        return buildResponse(200, userService.activateMembership(id));
                    }
                    break;

                case "/user/resend-verification":
                    if ("POST".equalsIgnoreCase(method)) {
                        VerificationRequest dto = objectMapper.convertValue(body, VerificationRequest.class);
                        cognitoService.resendConfirmationCode(dto.getUsername());
                        return buildResponse(200, Map.of("message", "Código de verificación reenviado"));
                    }
                    break;

                case "/user/verify-account":
                    if ("POST".equalsIgnoreCase(method)) {
                        ConfirmAccountRequest dto = objectMapper.convertValue(body, ConfirmAccountRequest.class);
                        boolean verified = cognitoService.confirmSignUp(dto.getUsername(), dto.getCode());
                        return buildResponse(200, Map.of("message",
                                verified ? "Cuenta verificada correctamente" : "Código inválido o expirado"));
                    }
                    break;

                // ===================== TextTypeController =====================
                case "/api/types":
                    if ("POST".equalsIgnoreCase(method)) {
                        TextTypeCreateDTO dto = objectMapper.convertValue(body, TextTypeCreateDTO.class);
                        TextType type = new TextType();
                        type.setType(dto.getType());
                        return buildResponse(200, textTypeService.save(type));
                    } else if ("GET".equalsIgnoreCase(method)) {
                        return buildResponse(200, textTypeService.findAll());
                    }
                    break;

                case "/api/types/{id}":
                    Long typeId = Long.valueOf(pathParams.get("id"));
                    if ("GET".equalsIgnoreCase(method)) {
                        return buildResponse(200, textTypeService.findById(typeId).orElse(null));
                    } else if ("DELETE".equalsIgnoreCase(method)) {
                        textTypeService.delete(typeId);
                        return buildResponse(200, Map.of("message", "Deleted"));
                    } else if ("PATCH".equalsIgnoreCase(method)) {
                        TextTypeUpdateDTO dto = objectMapper.convertValue(body, TextTypeUpdateDTO.class);
                        TextType updated = textTypeService.findById(typeId).map(existing -> {
                            if (dto.getType() != null) existing.setType(dto.getType());
                            return textTypeService.save(existing);
                        }).orElse(null);
                        return buildResponse(200, updated);
                    }
                    break;

                // ===================== GenreController =====================
                case "/api/genres":
                    if ("POST".equalsIgnoreCase(method)) {
                        GenreCreateDTO dto = objectMapper.convertValue(body, GenreCreateDTO.class);
                        Genre genre = new Genre();
                        genre.setName(dto.getName());
                        return buildResponse(200, genreService.save(genre));
                    } else if ("GET".equalsIgnoreCase(method)) {
                        return buildResponse(200, genreService.findAll());
                    }
                    break;

                case "/api/genres/{id}":
                    Long genreId = Long.valueOf(pathParams.get("id"));
                    if ("GET".equalsIgnoreCase(method)) {
                        return buildResponse(200, genreService.findById(genreId).orElse(null));
                    } else if ("DELETE".equalsIgnoreCase(method)) {
                        genreService.delete(genreId);
                        return buildResponse(200, Map.of("message", "Deleted"));
                    }
                    break;

                // ===================== EditorialController =====================
                case "/api/editorials":
                    if ("POST".equalsIgnoreCase(method)) {
                        EditorialCreateDTO dto = objectMapper.convertValue(body, EditorialCreateDTO.class);
                        Editorial editorial = new Editorial();
                        editorial.setCompanyName(dto.getCompanyName());
                        return buildResponse(200, editorialService.save(editorial));
                    } else if ("GET".equalsIgnoreCase(method)) {
                        return buildResponse(200, editorialService.findAll());
                    }
                    break;

                case "/api/editorials/{id}":
                    Long editorialId = Long.valueOf(pathParams.get("id"));
                    if ("GET".equalsIgnoreCase(method)) {
                        return buildResponse(200, editorialService.findById(editorialId).orElse(null));
                    } else if ("DELETE".equalsIgnoreCase(method)) {
                        editorialService.delete(editorialId);
                        return buildResponse(200, Map.of("message", "Deleted"));
                    }
                    break;

                // ===================== CountryController =====================
                case "/api/countries":
                    if ("POST".equalsIgnoreCase(method)) {
                        CountryCreateDTO dto = objectMapper.convertValue(body, CountryCreateDTO.class);
                        Country country = new Country();
                        country.setName(dto.getName());
                        return buildResponse(200, countryService.save(country));
                    } else if ("GET".equalsIgnoreCase(method)) {
                        return buildResponse(200, countryService.findAll());
                    }
                    break;

                case "/api/countries/{id}":
                    Long countryId = Long.valueOf(pathParams.get("id"));
                    if ("GET".equalsIgnoreCase(method)) {
                        return buildResponse(200, countryService.findById(countryId).orElse(null));
                    } else if ("DELETE".equalsIgnoreCase(method)) {
                        countryService.delete(countryId);
                        return buildResponse(200, Map.of("message", "Deleted"));
                    }
                    break;

                // ===================== AuthorController =====================
                case "/api/authors":
                    if ("POST".equalsIgnoreCase(method)) {
                        AuthorCreateDTO dto = objectMapper.convertValue(body, AuthorCreateDTO.class);
                        Author author = new Author();
                        author.setName(dto.getName());
                        return buildResponse(200, authorService.save(author));
                    } else if ("GET".equalsIgnoreCase(method)) {
                        return buildResponse(200, authorService.findAll());
                    }
                    break;

                case "/api/authors/{id}":
                    Long authorId = Long.valueOf(pathParams.get("id"));
                    if ("GET".equalsIgnoreCase(method)) {
                        return buildResponse(200, authorService.findById(authorId).orElse(null));
                    } else if ("DELETE".equalsIgnoreCase(method)) {
                        authorService.delete(authorId);
                        return buildResponse(200, Map.of("message", "Deleted"));
                    }
                    break;

                // ===================== BookController =====================
                case "/books":
                    if ("POST".equalsIgnoreCase(method)) {
                        BookCreateDTO dto = objectMapper.convertValue(body, BookCreateDTO.class);
                        Book book = new Book();
                        book.setTitle(dto.getTitle());
                        book.setPublishedDate(dto.getPublishedDate());

                        // Relaciones
                        Author author = authorService.findById(dto.getAuthorId())
                                .orElseThrow(() -> new RuntimeException("Autor no encontrado"));
                        book.setAuthor(author);

                        Editorial editorial = editorialService.findById(dto.getEditorialId())
                                .orElseThrow(() -> new RuntimeException("Editorial no encontrada"));
                        book.setEditorial(editorial);

                        Genre genre = genreService.findById(dto.getGenreId())
                                .orElseThrow(() -> new RuntimeException("Género no encontrado"));
                        book.setGenre(genre);

                        TextType type = textTypeService.findById(dto.getTypeId())
                                .orElseThrow(() -> new RuntimeException("Tipo de texto no encontrado"));
                        book.setType(type);

                        return buildResponse(200, bookService.createBook(book));
                    } else if ("GET".equalsIgnoreCase(method)) {
                        List<BookResponseDTO> books = bookService.getAllBooks();
                        return buildResponse(200, books);
                    }
                    break;

                case "/books/{id}":
                    Long bookId = Long.valueOf(pathParams.get("id"));
                    if ("GET".equalsIgnoreCase(method)) {
                        return buildResponse(200,
                                bookService.getBookById(bookId).orElse((BookResponseDTO) Map.of("error", "Libro no encontrado")));
                    }
                    break;

                default:
                    return buildResponse(404, Map.of("error", "Endpoint no encontrado"));
            }

            return buildResponse(400, Map.of("error", "Método no soportado"));
        } catch (Exception e) {
            try {
                return buildResponse(500, Map.of("error", e.getMessage()));
            } catch (Exception ex) {
                throw new RuntimeException(ex);
            }
        }
    }

    // ================= Helpers =================
    private Map<String, Object> buildResponse(int statusCode, Object body) throws Exception {
        Map<String, Object> response = new HashMap<>();
        response.put("statusCode", statusCode);
        response.put("headers", Map.of("Content-Type", "application/json"));
        response.put("body", objectMapper.writeValueAsString(body));
        return response;
    }

    @SuppressWarnings("unchecked")
    private Map<String,Object> parseBody(Object rawBody) throws Exception {
        if (rawBody == null) return new HashMap<>();
        if (rawBody instanceof String) {
            String raw = ((String) rawBody).trim();
            if (raw.isEmpty()) return new HashMap<>();
            return objectMapper.readValue(raw, Map.class);
        }
        if (rawBody instanceof Map) {
            return (Map<String,Object>) rawBody;
        }
        throw new IllegalArgumentException("Body inválido: " + rawBody);
    }
}