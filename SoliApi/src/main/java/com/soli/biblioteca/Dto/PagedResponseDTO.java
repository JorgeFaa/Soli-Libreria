package com.soli.biblioteca.Dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponseDTO<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
    private boolean hasNext;
    private boolean hasPrevious;
    
    public static <T> PagedResponseDTO<T> of(List<T> content, int page, int size, long totalElements) {
        PagedResponseDTO<T> response = new PagedResponseDTO<>();
        response.setContent(content);
        response.setPage(page);
        response.setSize(size);
        response.setTotalElements(totalElements);
        
        int totalPages = (int) Math.ceil((double) totalElements / size);
        response.setTotalPages(Math.max(totalPages, 1));
        response.setFirst(page == 0);
        response.setLast(page >= totalPages - 1);
        response.setHasNext(page < totalPages - 1);
        response.setHasPrevious(page > 0);
        
        return response;
    }
}