package com.soli.biblioteca.Dto;

public class UserCreateDTO {
    private String firstName;
    private String lastName;
    private boolean activeMember;
    private String genrePreference;
    private String roleName; // Nuevo campo para el sub de Cognito

    // Getters y Setters

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