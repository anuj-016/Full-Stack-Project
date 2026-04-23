package com.experiment9.config;

import com.experiment9.model.Product;
import com.experiment9.model.User;
import com.experiment9.repository.ProductRepository;
import com.experiment9.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedProducts();
    }

    private void seedUsers() {
        if (userRepository.existsByEmail("admin@example.com")) return;

        User admin = User.builder()
                .email("admin@example.com")
                .name("Admin User")
                .password(passwordEncoder.encode("admin123"))
                .provider(User.AuthProvider.LOCAL)
                .roles(Set.of("ROLE_ADMIN", "ROLE_USER"))
                .build();

        User regularUser = User.builder()
                .email("user@example.com")
                .name("Regular User")
                .password(passwordEncoder.encode("user123"))
                .provider(User.AuthProvider.LOCAL)
                .roles(Set.of("ROLE_USER"))
                .build();

        userRepository.saveAll(List.of(admin, regularUser));
        System.out.println("Seeded default users: admin@example.com / admin123 | user@example.com / user123");
    }

    private void seedProducts() {
        if (productRepository.count() > 0) return;

        List<Product> products = List.of(
                Product.builder().name("Laptop Pro X").description("High-performance laptop for developers").price(1299.99).stock(15).createdBy("admin@example.com").build(),
                Product.builder().name("Mechanical Keyboard").description("TKL layout, red switches").price(89.99).stock(50).createdBy("admin@example.com").build(),
                Product.builder().name("4K Monitor").description("27 inch, IPS panel, 144Hz").price(399.99).stock(20).createdBy("admin@example.com").build(),
                Product.builder().name("USB-C Hub").description("7-in-1 hub with PD charging").price(49.99).stock(100).createdBy("admin@example.com").build(),
                Product.builder().name("Noise Cancelling Headphones").description("40hr battery, ANC").price(199.99).stock(30).createdBy("admin@example.com").build()
        );

        productRepository.saveAll(products);
        System.out.println("Seeded " + products.size() + " demo products");
    }
}
