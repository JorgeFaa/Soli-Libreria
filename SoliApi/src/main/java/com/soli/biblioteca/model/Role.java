package com.soli.biblioteca.model;

import jakarta.persistence.*;

@Entity
@Table(name = "roles", schema = "public")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "roleid")
    private Long id;

    @Column(name = "role")
    private String role;

    // --------- Getters y Setters ---------

    public Long getRoleId() { return id; }
    public void setRoleId(Long id) { this.id = id; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
