package com.soli.biblioteca.model;

import jakarta.persistence.*;

@Entity
@Table(name = "texttype", schema = "public")
public class TextType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "typeid")
    private Long id;

    @Column(name = "texttype")
    private String type;

    // --------- Getters y Setters ---------
    public Long getTypeId() { return id; }
    public void setTypeId(Long id) { this.id = id; }

    public String getTextType() { return type; }
    public void setTextType(String type) { this.type = type; }
}
