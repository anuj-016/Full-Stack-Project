package com.experiment9.repository;

import com.experiment9.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // pagination keeps large datasets from killing response time
    Page<Product> findAll(Pageable pageable);

    // partial match search - works fine at small scale, use full-text index at prod scale
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByName(@Param("keyword") String keyword);

    List<Product> findByCreatedBy(String createdBy);

    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :min AND :max ORDER BY p.price ASC")
    List<Product> findByPriceRange(@Param("min") Double min, @Param("max") Double max);
}
