import React from "react";
import Logo from "./Logo";
import NavMenu from "./NavMenu";
import "./Header.css";

const Header: React.FC = () => {
  return (
    <header id="header">
      <Logo />
      <NavMenu />
    </header>
  );
};

export default Header;
