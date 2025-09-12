package com.soli.biblioteca.controller;

import com.soli.biblioteca.Dto.TextTypeCreateDTO;
import com.soli.biblioteca.Dto.TextTypeUpdateDTO;
import com.soli.biblioteca.model.TextType;
import com.soli.biblioteca.service.TextTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/types")
public class TextTypeController {

    private final TextTypeService textTypeService;

    public TextTypeController(TextTypeService textTypeService) {
        this.textTypeService = textTypeService;
    }

    @PostMapping
    public ResponseEntity<TextType> create(@RequestBody TextTypeCreateDTO dto) {
        TextType type = new TextType();
        type.setType(dto.getType());
        return ResponseEntity.ok(textTypeService.save(type));
    }

    @GetMapping
    public List<TextType> getAll() {
        return textTypeService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TextType> getById(@PathVariable Long id) {
        return textTypeService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        textTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TextType> updatePartial(
            @PathVariable Long id,
            @RequestBody TextTypeUpdateDTO dto) {

        return textTypeService.findById(id)
                .map(existing -> {
                    if (dto.getType() != null) {
                        existing.setType(dto.getType());
                    }
                    return ResponseEntity.ok(textTypeService.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

}
