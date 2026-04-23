import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const { user } = useAuth();

  const features = [
    { icon: '🔐', title: 'Spring Security', desc: 'Filter chain configured for stateless JWT auth with BCrypt password hashing.' },
    { icon: '🌐', title: 'OAuth2 / Google Login', desc: 'One-click sign-in via Google. Token issued on callback, no session stored server-side.' },
    { icon: '🛡️', title: 'RBAC', desc: 'ROLE_ADMIN and ROLE_USER enforced at both route and method level with @PreAuthorize.' },
    { icon: '⚡', title: 'JPA Optimization', desc: 'JOIN FETCH to avoid N+1, pagination via Pageable, indexed search queries.' },
    { icon: '🔗', title: 'CORS', desc: 'Locked down to the React frontend origin only. Preflight handled automatically.' },
    { icon: '🗄️', title: 'H2 In-Memory DB', desc: 'Seeded with demo admin and user accounts plus sample products on startup.' },
  ];

  return (
    <div className="home-page">
      <div className="hero">
        <div className="hero-tag">Experiment 9</div>
        <h1 className="hero-title">
          Secure &amp; Scalable<br/>
          <span className="hero-accent">Full Stack System</span>
        </h1>
        <p className="hero-sub">
          Spring Boot · Spring Security · OAuth2 · RBAC · JPA · React
        </p>
        <div className="hero-actions">
          {user ? (
            <Link to="/products" className="btn btn-primary">Browse Products →</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">Sign In</Link>
              <Link to="/register" className="btn btn-outline">Register</Link>
            </>
          )}
        </div>
      </div>

      <div className="features-grid">
        {features.map(f => (
          <div className="feature-card card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="card arch-note">
        <h2>Architecture Overview</h2>
        <div className="arch-flow">
          <div className="arch-box">React Frontend<span>:3000</span></div>
          <div className="arch-arrow">→ JWT / CORS →</div>
          <div className="arch-box">Spring Boot<span>:8080</span></div>
          <div className="arch-arrow">→ JPA →</div>
          <div className="arch-box">H2 / MySQL<span>DB</span></div>
        </div>
        <p className="arch-desc">
          Every request from the React app hits the Spring Boot filter chain. The JWT filter
          validates the bearer token, loads user details, and sets the security context.
          Role checks happen at the method level via <code>@PreAuthorize</code>.
          Google OAuth redirects back to the frontend with a short-lived token query param
          which is immediately exchanged for a full JWT.
        </p>
      </div>
    </div>
  );
}
