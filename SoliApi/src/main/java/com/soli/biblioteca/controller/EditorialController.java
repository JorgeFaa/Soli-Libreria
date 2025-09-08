package com.soli.biblioteca.controller;

import com.soli.biblioteca.Dto.EditorialCreateDTO;
import com.soli.biblioteca.model.Editorial;
import com.soli.biblioteca.service.EditorialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/editorials")
public class EditorialController {

    private final EditorialService editorialService;

    public EditorialController(EditorialService editorialService) {
        this.editorialService = editorialService;
    }

    @PostMapping
    public ResponseEntity<Editorial> create(@RequestBody EditorialCreateDTO dto) {
        Editorial editorial = new Editorial();
        editorial.setCompanyName(dto.getCompanyName());
        return ResponseEntity.ok(editorialService.save(editorial));
    }

    @GetMapping
    public List<Editorial> getAll() {
        return editorialService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Editorial> getById(@PathVariable Long id) {
        return editorialService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        editorialService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
