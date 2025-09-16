import React from "react";
import Header from "./Header";
import "./ApplicationLayout.css";

interface LayoutProps {
  children: React.ReactNode;
}

const ApplicationLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div id="layout">
      <Header />
      <main id="main-content">{children}</main>
    </div>
  );
};

export default ApplicationLayout;
