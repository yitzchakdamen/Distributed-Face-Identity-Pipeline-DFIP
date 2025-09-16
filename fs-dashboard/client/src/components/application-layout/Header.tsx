import React from "react";
import Logo from "./Logo";
import Slogan from "./Slogan";
import NavMenu from "./NavMenu";
import "./Header.css";

const Header: React.FC = () => {
  return (
    <header id="header">
      <Logo />
      <Slogan />
      <NavMenu />
    </header>
  );
};

export default Header;
