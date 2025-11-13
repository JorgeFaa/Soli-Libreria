package com.soli.biblioteca.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReadingProgressDTO {
    private Long bookId;
    private int lastPage;
    private LocalDateTime updatedAt;
}
