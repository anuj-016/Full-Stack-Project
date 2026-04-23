package com.experiment9.service;

import com.experiment9.model.User;
import com.experiment9.repository.UserRepository;
import com.experiment9.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    public Map<String, Object> login(String email, String password) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        String token = tokenProvider.generateToken(auth);
        User user = userRepository.findByEmail(email).orElseThrow();

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", buildUserInfo(user));
        return response;
    }

    public Map<String, Object> register(String email, String password, String name) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already registered");
        }

        User user = User.builder()
                .email(email)
                .name(name)
                .password(passwordEncoder.encode(password))
                .provider(User.AuthProvider.LOCAL)
                .roles(Set.of("ROLE_USER"))
                .build();

        userRepository.save(user);

        String token = tokenProvider.generateToken(email);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", buildUserInfo(user));
        return response;
    }

    private Map<String, Object> buildUserInfo(User user) {
        Map<String, Object> info = new HashMap<>();
        info.put("id", user.getId());
        info.put("email", user.getEmail());
        info.put("name", user.getName());
        info.put("roles", user.getRoles());
        info.put("picture", user.getPicture());
        return info;
    }
}
