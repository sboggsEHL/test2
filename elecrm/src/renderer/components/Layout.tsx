// src/renderer/components/Layout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import "../styles/Layout.css";
import SideBar from "./SideBar";

interface LayoutProps {
  onToggleSoftphone: () => void;
}

const Layout: React.FC<LayoutProps> = ({ onToggleSoftphone }) => {
  return (
    <>
      <SideBar onToggleSoftphone={onToggleSoftphone} />
      <main className="w-full h-full lg:pl-48 overflow-hidden bg-mainContentBg">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;