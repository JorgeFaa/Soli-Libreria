package com.soli.biblioteca.Dto;

public class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private boolean activeMember;
    private String genrePreference;
    private String roleName;

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public boolean isActiveMember() { return activeMember; }
    public void setActiveMember(boolean activeMember) { this.activeMember = activeMember; }

    public String getGenrePreference() { return genrePreference; }
    public void setGenrePreference(String genrePreference) { this.genrePreference = genrePreference; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
}