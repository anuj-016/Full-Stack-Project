import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">
          <span className="brand-icon">⬡</span>
          <span className="brand-name">SecureStack</span>
          <span className="brand-exp">Exp 9</span>
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/products">Products</Link>
        {isAdmin() && <Link to="/admin">Admin Panel</Link>}
      </div>

      <div className="nav-user">
        {user ? (
          <>
            {user.picture && (
              <img src={user.picture} alt={user.name} className="nav-avatar" />
            )}
            <div className="nav-user-info">
              <span className="nav-user-name">{user.name}</span>
              <span className="nav-user-email">{user.email}</span>
            </div>
            <button className="btn btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary">Login</Link>
        )}
      </div>
    </nav>
  );
}
