package com.experiment9.controller;

import com.experiment9.model.User;
import com.experiment9.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/users/{id}/promote")
    public ResponseEntity<?> promoteToAdmin(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.getRoles().add("ROLE_ADMIN");
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", user.getName() + " promoted to admin"));
    }

    @PostMapping("/users/{id}/toggle")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        String status = user.isEnabled() ? "enabled" : "disabled";
        return ResponseEntity.ok(Map.of("message", "User " + status));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalUsers = userRepository.count();
        long adminCount = userRepository.findAll().stream()
                .filter(u -> u.getRoles().contains("ROLE_ADMIN"))
                .count();
        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "adminCount", adminCount,
                "regularUsers", totalUsers - adminCount
        ));
    }
}
