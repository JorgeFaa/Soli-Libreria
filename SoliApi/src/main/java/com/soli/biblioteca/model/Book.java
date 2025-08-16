package com.soli.biblioteca.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "libros")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String autor;

    @Column(length = 1000)
    private String descripcion;

    private Integer paginas;

    private String categoria; // Ej: Fantástica, Clásica, Biología, Física

    @ElementCollection
    private List<String> etiquetas; // Etiquetas adicionales opcionales

    private String urlArchivo; // URL de S3, opcional

    public Book() {}

    public Book(String titulo, String autor, String descripcion, Integer paginas,
                String categoria, List<String> etiquetas, String urlArchivo) {
        this.titulo = titulo;
        this.autor = autor;
        this.descripcion = descripcion;
        this.paginas = paginas;
        this.categoria = categoria;
        this.etiquetas = etiquetas;
        this.urlArchivo = urlArchivo;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getPaginas() { return paginas; }
    public void setPaginas(Integer paginas) { this.paginas = paginas; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public List<String> getEtiquetas() { return etiquetas; }
    public void setEtiquetas(List<String> etiquetas) { this.etiquetas = etiquetas; }

    public String getUrlArchivo() { return urlArchivo; }
    public void setUrlArchivo(String urlArchivo) { this.urlArchivo = urlArchivo; }
}