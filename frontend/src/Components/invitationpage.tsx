import React from "react";
import { FaPlay, FaCalendarAlt, FaUserTie } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../css/InvitationScreen.css"; // your existing CSS

export default function InvitationScreen() {
  return (
    <div className="invitation-container" role="main" aria-labelledby="invitation-title">
      {/* Left - Text */}
      <div className="invitation-text">
        <h1 id="invitation-title">Welcome to Your AI Mock Interview</h1>
        <h3 className="sub-heading">AI-powered practice to sharpen your skills</h3>

        <p>
          Step into a realistic, AI-driven mock interview designed to simulate
          real hiring scenarios and give you actionable feedback.
        </p>

        <ul className="invite-details" aria-label="Invitation details">
          <li><FaUserTie className="detail-icon" /> Realistic interview questions</li>
          <li><FaCalendarAlt className="detail-icon" /> Flexible — start any time</li>
          <li><FaPlay className="detail-icon" /> Instant playback & insights</li>
        </ul>

        <p className="highlight">
          This is a demo of the AI conducting your interview in real-time.
        </p>

        <Link className="get-started" to="/face-auth" aria-label="Start face authentication and interview">
          <FaPlay className="btn-icon" /> Start Interview Now
        </Link>
      </div>

      {/* Right - Illustration (inline SVG + logo circle) */}
      <div className="ai-logo-container" aria-hidden="false">
        <div className="ai-logo" role="img" aria-label="AI interviewer logo">
          {/* Inline SVG illustration — no file import */}
          <svg
            width="300"
            height="300"
            viewBox="0 0 140 140"
            xmlns="http://www.w3.org/2000/svg"
            className="ai-svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#f4f7fb" />
                <stop offset="100%" stopColor="#cde7ff" />
              </linearGradient>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#7aa7ff" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* background circle */}
            <circle cx="70" cy="70" r="60" fill="url(#g1)" filter="url(#shadow)" />

            {/* stylized "AI" letters */}
            <g transform="translate(35,38)">
              <rect x="0" y="0" width="8" height="42" rx="2" fill="#2b6fbf" />
              <rect x="16" y="0" width="8" height="42" rx="2" fill="#4f8ff2" />
              <path d="M44 42 L56 6 L68 42 Z" fill="#2b6fbf" />
            </g>

            {/* small orbiting dots for motion impression */}
            <circle cx="25" cy="30" r="4" fill="#60a5fa" opacity="0.85" />
            <circle cx="112" cy="28" r="3" fill="#93c5fd" opacity="0.9" />
            <circle cx="102" cy="108" r="2.5" fill="#a7d1ff" opacity="0.9" />
          </svg>
        </div>

        <p className="ai-text">Your Virtual Interview Partner</p>
      </div>
    </div>
  );
}
