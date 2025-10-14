package com.soli.biblioteca.exception;

import com.soli.biblioteca.Dto.ErrorResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import software.amazon.awssdk.services.cognitoidentityprovider.model.CognitoIdentityProviderException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Manejar errores de validación de Bean Validation en request body
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidationErrors(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        log.warn("Validation error on {}: {}", request.getRequestURI(), ex.getMessage());
        
        Map<String, String> validationErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            validationErrors.put(error.getField(), error.getDefaultMessage()));
        
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
            HttpStatus.BAD_REQUEST.value(),
            "Validation Failed",
            "Los datos enviados no son válidos",
            request.getRequestURI()
        );
        errorResponse.setValidationErrors(validationErrors);
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    // Manejar errores de validación de constraints
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponseDTO> handleConstraintViolationException(
            ConstraintViolationException ex, HttpServletRequest request) {
        
        log.warn("Constraint violation on {}: {}", request.getRequestURI(), ex.getMessage());
        
        Map<String, String> validationErrors = new HashMap<>();
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            String propertyPath = violation.getPropertyPath().toString();
            String message = violation.getMessage();
            validationErrors.put(propertyPath, message);
        }
        
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
            HttpStatus.BAD_REQUEST.value(),
            "Validation Failed",
            "Los parámetros no cumplen las validaciones requeridas",
            request.getRequestURI()
        );
        errorResponse.setValidationErrors(validationErrors);
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    // Manejar errores de argumentos con tipo incorrecto
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponseDTO> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        
        log.warn("Type mismatch on {}: {}", request.getRequestURI(), ex.getMessage());
        
        String message = String.format("El parámetro '%s' debe ser de tipo %s", 
            ex.getName(), ex.getRequiredType().getSimpleName());
            
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
            HttpStatus.BAD_REQUEST.value(),
            "Type Mismatch",
            message,
            request.getRequestURI()
        );
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    // Manejar parámetros requeridos faltantes
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponseDTO> handleMissingParams(
            MissingServletRequestParameterException ex, HttpServletRequest request) {
        
        log.warn("Missing parameter on {}: {}", request.getRequestURI(), ex.getMessage());
        
        String message = String.format("El parámetro requerido '%s' no fue proporcionado", ex.getParameterName());
        
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
            HttpStatus.BAD_REQUEST.value(),
            "Missing Parameter",
            message,
            request.getRequestURI()
        );
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    // Manejar ResponseStatusException (lanzadas por controllers)
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponseDTO> handleResponseStatusException(
            ResponseStatusException ex, HttpServletRequest request) {
        
        log.warn("Response status exception on {}: {}", request.getRequestURI(), ex.getMessage());
        
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
            ex.getStatusCode().value(),
            ex.getStatusCode().toString(),
            ex.getReason() != null ? ex.getReason() : "Error en la solicitud",
            request.getRequestURI()
        );
        
        return ResponseEntity.status(ex.getStatusCode()).body(errorResponse);
    }

    // Manejar errores de autenticación
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponseDTO> handleAuthenticationException(
            AuthenticationException ex, HttpServletRequest request) {
        
        log.warn("Authentication error on {}: {}", request.getRequestURI(), ex.getMessage());
        
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
            HttpStatus.UNAUTHORIZED.value(),
            "Authentication Failed",
            "Credenciales inválidas o token expirado",
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    // Manejar errores de autorización
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponseDTO> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {
        
        log.warn("Access denied on {}: {}", request.getRequestURI(), ex.getMessage());
        
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
            HttpStatus.FORBIDDEN.value(),
            "Access Denied",
            "No tienes permisos para acceder a este recurso",
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    // Manejar errores específicos de Cognito
    @ExceptionHandler(CognitoIdentityProviderException.class)
    public ResponseEntity<ErrorResponseDTO> handleCognitoException(
            CognitoIdentityProviderException ex, HttpServletRequest request) {
        
        log.error("Cognito error on {}: {}", request.getRequestURI(), ex.awsErrorDetails().errorMessage());
        
        String userMessage = getUserFriendlyMessage(ex.awsErrorDetails().errorCode());
        
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
            HttpStatus.BAD_REQUEST.value(),
            "Authentication Service Error",
            userMessage,
            request.getRequestURI()
        );
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    // Manejar BusinessLogicException personalizada
    @ExceptionHandler(BusinessLogicException.class)
    public ResponseEntity<ErrorResponseDTO> handleBusinessLogicException(
            BusinessLogicException ex, HttpServletRequest request) {
        
        log.warn("Business logic error on {}: {}", request.getRequestURI(), ex.getMessage());
        
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
            HttpStatus.BAD_REQUEST.value(),
            "Business Logic Error",
            ex.getMessage(),
            request.getRequestURI()
        );
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    // Manejar IllegalArgumentException
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalArgumentException(
            IllegalArgumentException ex, HttpServletRequest request) {
        
        log.warn("Illegal argument on {}: {}", request.getRequestURI(), ex.getMessage());
        
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
            HttpStatus.BAD_REQUEST.value(),
            "Invalid Argument",
            ex.getMessage(),
            request.getRequestURI()
        );
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    // Manejar RuntimeException genérica
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponseDTO> handleRuntimeException(
            RuntimeException ex, HttpServletRequest request) {
        
        log.error("Runtime exception on {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Internal Server Error",
            "Ha ocurrido un error interno del servidor",
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    // Manejar cualquier excepción no capturada
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGenericException(
            Exception ex, HttpServletRequest request) {
        
        log.error("Unexpected exception on {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Unexpected Error",
            "Ha ocurrido un error inesperado",
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    private String getUserFriendlyMessage(String errorCode) {
        return switch (errorCode) {
            case "UsernameExistsException" -> "El usuario ya existe en el sistema";
            case "UserNotFoundException" -> "Usuario no encontrado";
            case "NotAuthorizedException" -> "Credenciales incorrectas";
            case "InvalidPasswordException" -> "La contraseña no cumple con los requisitos mínimos";
            case "CodeExpiredException" -> "El código de verificación ha expirado";
            case "ExpiredCodeException" -> "El código de verificación ha expirado";
            case "InvalidVerificationCodeException" -> "Código de verificación inválido";
            case "UserNotConfirmedException" -> "El usuario no ha confirmado su cuenta";
            case "TokenRefreshException" -> "Error al refrescar el token";
            default -> "Error en el servicio de autenticación";
        };
    }
}