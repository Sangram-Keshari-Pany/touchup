import React from "react";
import { FaHome } from "react-icons/fa";
import "../css/HomeScreen.css";
import { HomeIcon, JobSearchIcon, MessageIcon, ProfileIcon, SearchIcon } from "./svg";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="center">
        <nav className="menu">
          <Link href="#home"><HomeIcon/></Link>
          <Link href="#about"><SearchIcon/></Link>
          <Link href="#services"><JobSearchIcon/></Link>
          <Link href="#portfolio"><MessageIcon/></Link>
          <Link href="#contact"><ProfileIcon/></Link>
        </nav>
      </div>
    </aside>
  );
}
