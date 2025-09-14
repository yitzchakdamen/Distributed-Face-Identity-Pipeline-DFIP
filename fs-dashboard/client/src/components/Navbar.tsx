import "./Navbar.css";
import logoSvg from "/logo.svg";

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <img src={logoSvg} alt="Face Alert Logo" className="logo" />
          <span className="brand-text">Face Alert</span>
        </div>
        <div className="navbar-menu">
          <a href="#dashboard" className="nav-link">
            Dashboard
          </a>
          <a href="#alerts" className="nav-link">
            Alerts
          </a>
          <a href="#settings" className="nav-link">
            Settings
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
