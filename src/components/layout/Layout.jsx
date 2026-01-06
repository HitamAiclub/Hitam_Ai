import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ParticleBackground from "../particles/ParticaleBackground.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Layout() {
  return (
    <div className="relative flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <ParticleBackground />
      <Navbar />
      <main className="flex-grow relative z-10 pt-16 px-4 sm:px-6 lg:px-8 border-none">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  );
}

export default Layout;
