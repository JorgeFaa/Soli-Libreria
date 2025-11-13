package com.soli.biblioteca.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class ReadingProgressId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "book_id")
    private Long bookId;
}
