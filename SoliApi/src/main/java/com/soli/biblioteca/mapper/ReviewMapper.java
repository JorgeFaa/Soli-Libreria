package com.soli.biblioteca.mapper;

import com.soli.biblioteca.Dto.ReviewDTO;
import com.soli.biblioteca.model.Review;

public class ReviewMapper {

    public static ReviewDTO toDTO(Review review) {
        if (review == null) {
            return null;
        }

        return ReviewDTO.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .userId(review.getUser().getId())
                .userFirstName(review.getUser().getFirstName())
                .bookId(review.getBook().getId())
                .build();
    }
}
