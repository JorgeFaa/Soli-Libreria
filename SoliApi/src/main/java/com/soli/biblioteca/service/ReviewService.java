package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.PagedResponseDTO;
import com.soli.biblioteca.Dto.ReviewCreateDTO;
import com.soli.biblioteca.Dto.ReviewDTO;
import com.soli.biblioteca.Dto.ReviewUpdateDTO;
import com.soli.biblioteca.exception.BusinessLogicException;
import com.soli.biblioteca.mapper.ReviewMapper;
import com.soli.biblioteca.model.Book;
import com.soli.biblioteca.model.Review;
import com.soli.biblioteca.model.User;
import com.soli.biblioteca.repository.BookRepository;
import com.soli.biblioteca.repository.ReviewRepository;
import com.soli.biblioteca.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    @Transactional
    public ReviewDTO createReview(Long bookId, String cognitoSub, ReviewCreateDTO dto) {
        User user = userRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new BusinessLogicException("Usuario no encontrado."));
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new BusinessLogicException("Libro no encontrado."));

        if (reviewRepository.findByBookIdAndUserId(bookId, user.getId()).isPresent()) {
            throw new BusinessLogicException("El usuario ya ha reseñado este libro.");
        }

        Review review = new Review();
        review.setUser(user);
        review.setBook(book);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());

        Review savedReview = reviewRepository.save(review);
        return ReviewMapper.toDTO(savedReview);
    }

    @Transactional(readOnly = true)
    public PagedResponseDTO<ReviewDTO> getReviewsByBookId(Long bookId, int page, int size) {
        if (!bookRepository.existsById(bookId)) {
            throw new BusinessLogicException("Libro no encontrado.");
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Review> reviewPage = reviewRepository.findByBookId(bookId, pageable);

        List<ReviewDTO> reviewDTOs = reviewPage.getContent().stream()
                .map(ReviewMapper::toDTO)
                .collect(Collectors.toList());
        
        return PagedResponseDTO.of(reviewDTOs, page, size, reviewPage.getTotalElements());
    }

    @Transactional
    public ReviewDTO updateReview(Long reviewId, String cognitoSub, ReviewUpdateDTO dto) {
        User user = userRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new BusinessLogicException("Usuario no encontrado."));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new BusinessLogicException("Reseña no encontrada."));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new BusinessLogicException("No tienes permiso para editar esta reseña.", 403);
        }

        dto.getRating().ifPresent(review::setRating);
        dto.getComment().ifPresent(review::setComment);

        Review updatedReview = reviewRepository.save(review);
        return ReviewMapper.toDTO(updatedReview);
    }

    @Transactional
    public void deleteReview(Long reviewId, String cognitoSub) {
        User user = userRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new BusinessLogicException("Usuario no encontrado."));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new BusinessLogicException("Reseña no encontrada."));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new BusinessLogicException("No tienes permiso para eliminar esta reseña.", 403);
        }

        reviewRepository.delete(review);
    }
}
