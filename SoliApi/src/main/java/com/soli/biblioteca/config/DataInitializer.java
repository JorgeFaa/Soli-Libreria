package com.soli.biblioteca.config;

import com.soli.biblioteca.model.Role;
import com.soli.biblioteca.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public DataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        createRoleIfNotFound("ADMIN");
        createRoleIfNotFound("READER");
    }

    private void createRoleIfNotFound(String roleName) {
        roleRepository.findByRole(roleName).orElseGet(() -> {
            Role role = new Role();
            role.setRole(roleName);
            return roleRepository.save(role);
        });
    }
}
