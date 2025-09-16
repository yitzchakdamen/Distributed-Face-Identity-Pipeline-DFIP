import React from "react";
import { Link } from "react-router-dom";
import "./Logo.css";

const Logo: React.FC = () => {
  return (
    <div className="logo">
      <Link to="/">
        <img src="/logo.svg" alt="DFIP Logo" />
        <span>DFIP Dashboard</span>
      </Link>
    </div>
  );
};

export default Logo;
