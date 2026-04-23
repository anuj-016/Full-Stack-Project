# Experiment 9 – Secure & Scalable Full Stack System

## Aim
Design and implement a secure, scalable full-stack application using Spring Boot by integrating Spring Security, OAuth2 (Google Login), Role-Based Access Control (RBAC), and JPA-based database performance optimization.

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Backend    | Spring Boot 3.2, Spring Security, Spring Data JPA |
| Auth       | JWT (jjwt), OAuth2 (Google), BCrypt           |
| Database   | H2 (in-memory), JPA / Hibernate               |
| Frontend   | React 18, React Router v6, Axios              |
| Build      | Maven (backend), npm (frontend)               |

---

## Project Structure

```
experiment9/
├── backend/                        # Spring Boot application
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/experiment9/
│       │   ├── SecureFullStackApplication.java
│       │   ├── config/
│       │   │   ├── SecurityConfig.java         # Filter chain, CORS, RBAC rules
│       │   │   └── DataSeeder.java             # Seeds demo users + products
│       │   ├── controller/
│       │   │   ├── AuthController.java         # /api/auth/*
│       │   │   ├── ProductController.java      # /api/products/*
│       │   │   └── AdminController.java        # /api/admin/* (ADMIN only)
│       │   ├── model/
│       │   │   ├── User.java                   # User entity with roles
│       │   │   └── Product.java                # Product entity
│       │   ├── repository/
│       │   │   ├── UserRepository.java         # JOIN FETCH query for roles
│       │   │   └── ProductRepository.java      # Pageable + search queries
│       │   ├── security/
│       │   │   ├── JwtTokenProvider.java       # Sign / validate JWT
│       │   │   ├── JwtAuthenticationFilter.java# Reads Bearer token per request
│       │   │   └── OAuth2AuthenticationSuccessHandler.java
│       │   └── service/
│       │       ├── AuthService.java
│       │       ├── CustomUserDetailsService.java
│       │       └── ProductService.java
│       └── resources/
│           └── application.properties
│
└── frontend/                       # React application
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.js                  # Routes
        ├── index.js
        ├── index.css               # Global design tokens
        ├── context/AuthContext.js  # Global auth state
        ├── services/api.js         # Axios with JWT interceptor
        ├── components/
        │   ├── Navbar.js / .css
        │   └── ProtectedRoute.js
        └── pages/
            ├── Home.js / .css
            ├── Login.js / Auth.css
            ├── Register.js
            ├── Products.js / .css
            └── Admin.js / .css
```

---

## Setup & Running

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+ and npm

---

### Backend

```bash
cd backend
mvn spring-boot:run
```

The server starts on **http://localhost:8080**.

H2 console available at: http://localhost:8080/h2-console  
JDBC URL: `jdbc:h2:mem:experiment9db`  Username: `sa`  Password: *(empty)*

**Demo accounts seeded automatically:**

| Email               | Password   | Role              |
|---------------------|------------|-------------------|
| admin@example.com   | admin123   | ROLE_ADMIN, ROLE_USER |
| user@example.com    | user123    | ROLE_USER         |

---

### Frontend

```bash
cd frontend
npm install
npm start
```

App runs on **http://localhost:3000**.

---

## Google OAuth2 Setup (optional)

To enable Google Login:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **Google+ API** (or People API)
3. Create OAuth 2.0 credentials:
   - Application type: **Web application**
   - Authorized redirect URI: `http://localhost:8080/login/oauth2/code/google`
4. Copy the **Client ID** and **Client Secret** into `application.properties`:

```properties
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
```

---

## API Endpoints

### Auth  (`/api/auth`)

| Method | Endpoint               | Access  | Description                    |
|--------|------------------------|---------|--------------------------------|
| POST   | `/login`               | Public  | Returns JWT + user info        |
| POST   | `/register`            | Public  | Creates account, returns JWT   |
| GET    | `/me`                  | Auth    | Current user details           |
| POST   | `/oauth2/token`        | Public  | Exchange OAuth token for JWT   |

### Products  (`/api/products`)

| Method | Endpoint               | Access        | Description              |
|--------|------------------------|---------------|--------------------------|
| GET    | `/`                    | Auth          | Paginated product list   |
| GET    | `/{id}`                | Auth          | Single product           |
| GET    | `/search?q=`           | Auth          | Name-based search        |
| GET    | `/filter?min=&max=`    | Auth          | Price range filter       |
| POST   | `/create`              | ADMIN only    | Create product           |
| PUT    | `/{id}`                | ADMIN only    | Update product           |
| DELETE | `/delete/{id}`         | ADMIN only    | Delete product           |

### Admin  (`/api/admin`)

| Method | Endpoint               | Access        | Description              |
|--------|------------------------|---------------|--------------------------|
| GET    | `/users`               | ADMIN only    | All users list           |
| GET    | `/stats`               | ADMIN only    | User count stats         |
| POST   | `/users/{id}/promote`  | ADMIN only    | Add ROLE_ADMIN to user   |
| POST   | `/users/{id}/toggle`   | ADMIN only    | Enable / disable user    |

---

## Key Concepts Demonstrated

### Spring Security Filter Chain
Configured in `SecurityConfig.java`. Stateless session, JWT filter inserted before `UsernamePasswordAuthenticationFilter`, CORS locked to `localhost:3000`.

### JWT Authentication
`JwtTokenProvider` issues HS256 tokens signed with a 256-bit key. `JwtAuthenticationFilter` intercepts every request, validates the token, and populates `SecurityContextHolder`.

### OAuth2 Flow
Google handles authentication and redirects to Spring Boot's callback URL. `OAuth2AuthenticationSuccessHandler` upserts the user in the DB and redirects to the React app with the JWT in the query string. React immediately exchanges it via `/api/auth/oauth2/token`.

### RBAC
Coarse-grained rules in the filter chain (e.g., `/api/admin/**` requires `ROLE_ADMIN`). Fine-grained control via `@PreAuthorize("hasRole('ADMIN')")` on individual controller methods. `@EnableMethodSecurity` activates this in `SecurityConfig`.

### JPA Performance Techniques
- `JOIN FETCH` on `findByEmailWithRoles` eliminates N+1 for role loading on every auth check
- `Pageable` in product listing prevents loading the full table
- Named JPQL queries for search and price-range filter instead of `findAll` + in-memory filtering
- `@Transactional(readOnly = true)` on read-only service methods

---

## Experiment Observations

| Topic | What to observe |
|-------|-----------------|
| Security filter chain | Enable `logging.level.org.springframework.security=DEBUG` and watch each filter execute in the console |
| JWT validation | Send a request with an expired or tampered token — observe the 401 response |
| RBAC enforcement | Log in as `user@example.com` and try `DELETE /api/products/delete/1` — observe 403 |
| OAuth2 | Click "Continue with Google" and watch the redirect chain in browser DevTools Network tab |
| JPA N+1 | Enable `spring.jpa.show-sql=true` and compare queries with vs without `JOIN FETCH` |
| Pagination | Observe `Page` object fields (`totalPages`, `totalElements`) in the products API response |
