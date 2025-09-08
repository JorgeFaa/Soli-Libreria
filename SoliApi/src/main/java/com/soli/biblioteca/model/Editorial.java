package com.soli.biblioteca.model;

import jakarta.persistence.*;

@Entity
@Table(name = "editorials", schema = "public")
public class Editorial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "editorialid")
    private Long id;

    @Column(name = "companyname", nullable = false, length = 250)
    private String companyName;

    @ManyToOne
    @JoinColumn(name = "countryid")
    private Country country;

    // --------- Getters y Setters ---------

    public Long getEditorialId() { return id; }
    public void setEditorialId(Long id) { this.id = id; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public Country getEditorialCountry() { return country; }
    public void setEditorialCountry(Country country) { this.country = country; }
}
