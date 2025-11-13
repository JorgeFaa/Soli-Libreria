package com.soli.biblioteca.controller.v3;

import com.soli.biblioteca.Dto.PagedResponseDTO;
import com.soli.biblioteca.Dto.ReviewCreateDTO;
import com.soli.biblioteca.Dto.ReviewDTO;
import com.soli.biblioteca.Dto.ReviewUpdateDTO;
import com.soli.biblioteca.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import static com.soli.biblioteca.config.ApiVersioningConfig.API_V3_PREFIX;

@RestController
@RequestMapping(API_V3_PREFIX)
@Tag(name = "Reviews V3", description = "API v3 para calificaciones y reseñas de libros")
@Validated
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @Operation(summary = "Crear una nueva reseña para un libro")
    @PostMapping("/books/{bookId}/reviews")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<ReviewDTO> createReview(
            @PathVariable Long bookId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ReviewCreateDTO reviewCreateDTO) {
        String cognitoSub = jwt.getSubject();
        ReviewDTO createdReview = reviewService.createReview(bookId, cognitoSub, reviewCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdReview);
    }

    @Operation(summary = "Obtener las reseñas de un libro con paginación")
    @GetMapping("/books/{bookId}/reviews")
    public ResponseEntity<PagedResponseDTO<ReviewDTO>> getReviewsByBook(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size) {
        return ResponseEntity.ok(reviewService.getReviewsByBookId(bookId, page, size));
    }

    @Operation(summary = "Actualizar una reseña existente")
    @PutMapping("/reviews/{reviewId}")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<ReviewDTO> updateReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ReviewUpdateDTO reviewUpdateDTO) {
        String cognitoSub = jwt.getSubject();
        ReviewDTO updatedReview = reviewService.updateReview(reviewId, cognitoSub, reviewUpdateDTO);
        return ResponseEntity.ok(updatedReview);
    }

    @Operation(summary = "Eliminar una reseña")
    @DeleteMapping("/reviews/{reviewId}")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal Jwt jwt) {
        String cognitoSub = jwt.getSubject();
        reviewService.deleteReview(reviewId, cognitoSub);
        return ResponseEntity.noContent().build();
    }
}
