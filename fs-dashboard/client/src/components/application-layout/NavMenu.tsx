import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./NavMenu.css";

const NavMenu: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  if (!isAuthenticated) {
    return (
      <nav className="nav-menu">
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/register" className="nav-link">Register</Link>
      </nav>
    );
  }

  return (
    <nav className="nav-menu">
      <Link to="/" className="nav-link">Dashboard</Link>
      <Link to="/events" className="nav-link">Events</Link>
      <Link to="/cameras" className="nav-link">Cameras</Link>
      
      <div className="user-menu">
        <span className="user-info">Welcome, {user?.name}</span>
        <span className="user-role">({user?.role})</span>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavMenu;
