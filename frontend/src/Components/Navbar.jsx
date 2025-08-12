import React from "react";
import {
  FaSearch,
  FaBell,
  FaEnvelope,
  FaBookmark
} from "react-icons/fa";
import "../css/Nav.css";
import logo from "../assets/logo.png"
import user from "../assets/my.jpg"
import { MessageIcon, NotificationIcon, SavedJob } from "./svg";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="nav-left">
        <img src={logo} alt="Logo" />
      </div>

      <div className="nav-right">
        <div className="search-bar">
          
          <input className="search-bar-input" type="text" placeholder={"Search"} />
        </div>
        <button className="add-post-btn">+ Add Post</button>
        <div className="icon-nav"><SavedJob /></div>
        <div className="icon-nav"><NotificationIcon/></div>
        <div className="icon-nav"><MessageIcon /></div>
        <img
          src={user}
          alt="Profile"
          className="profile-pic"
        />
      </div>
    </header>
  );
}
