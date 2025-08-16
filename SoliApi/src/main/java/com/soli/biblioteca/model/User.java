package com.soli.biblioteca.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "usuarios")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String email;
    private String contrasena;

    @ElementCollection
    private List<String> categoriasPreferidas; // Para recomendar libros según categoría

    public User() {}

    public User(String nombre, String email, String contrasena, List<String> categoriasPreferidas) {
        this.nombre = nombre;
        this.email = email;
        this.contrasena = contrasena;
        this.categoriasPreferidas = categoriasPreferidas;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }

    public List<String> getCategoriasPreferidas() { return categoriasPreferidas; }
    public void setCategoriasPreferidas(List<String> categoriasPreferidas) { this.categoriasPreferidas = categoriasPreferidas; }
}