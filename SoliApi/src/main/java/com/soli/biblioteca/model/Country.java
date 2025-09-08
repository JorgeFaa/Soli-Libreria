package com.soli.biblioteca.model;

import jakarta.persistence.*;

@Entity
@Table(name = "country", schema = "public")
public class Country {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "countryid")
    private Long id;

    @Column(name = "countryname")
    private String name;

    // --------- Getters y Setters ---------

    public Long getCountryId() { return id; }
    public void setCountryId(Long id) { this.id = id; }

    public String getCountryName() { return name; }
    public void setCountryName(String name) { this.name = name; }
}
