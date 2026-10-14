package com.example.authservice.repository;

import com.example.authservice.domain.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import com.example.authservice.domain.Role;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRoleAndEnabledTrue(Role role);
}
