package com.soli.biblioteca.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "editorials", schema = "public")
public class Editorial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "editorialid")
    private Long id;


    @Column(name = "companyname", nullable = false, length = 250)
    private String companyName;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "countryid")
    private Country country;

}
