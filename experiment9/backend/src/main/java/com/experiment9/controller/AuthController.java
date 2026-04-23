package com.experiment9.controller;

import com.experiment9.model.User;
import com.experiment9.repository.UserRepository;
import com.experiment9.security.JwtTokenProvider;
import com.experiment9.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            Map<String, Object> result = authService.login(body.get("email"), body.get("password"));
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            Map<String, Object> result = authService.register(
                    body.get("email"),
                    body.get("password"),
                    body.get("name")
            );
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmailWithRoles(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("roles", user.getRoles());
        response.put("picture", user.getPicture());
        response.put("provider", user.getProvider());
        return ResponseEntity.ok(response);
    }

    // used after OAuth2 redirect to exchange the token from query param
    @PostMapping("/oauth2/token")
    public ResponseEntity<?> exchangeOAuthToken(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        if (token == null || !tokenProvider.validateToken(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }
        String email = tokenProvider.getEmailFromToken(token);
        User user = userRepository.findByEmailWithRoles(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "roles", user.getRoles(),
                "picture", user.getPicture()
        ));
        return ResponseEntity.ok(response);
    }
}
