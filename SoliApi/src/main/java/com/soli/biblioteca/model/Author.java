package com.soli.biblioteca.model;

import jakarta.persistence.*;

@Entity
@Table(name = "authors", schema = "public")
public class Author {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "authorid")
    private Long id;

    @Column(name = "authorname", nullable = false, length = 50)
    private String name;

    @Column(name = "authormiddlename", length = 50)
    private String middleName;

    @Column(name = "authorlastname", length = 100)
    private String lastName;

    @ManyToOne
    @JoinColumn(name = "countryid")
    private Country country;

    // --------- Getters y Setters ---------

    public Long getAuthorId() { return id; }
    public void setAuthorId(Long id) { this.id = id; }

    public String getAuthorName() { return name; }
    public void setAuthorName(String name) { this.name = name; }

    public String getAuthorMiddleName() { return middleName; }
    public void setAuthorMiddleName(String middleName) { this.middleName = middleName; }

    public String getAuthorLastName() { return lastName; }
    public void setAuthorLastName(String lastName) { this.lastName = lastName; }

    public Country getAuthorCountry() { return country; }
    public void setAuthorCountry(Country country) { this.country = country; }
}
