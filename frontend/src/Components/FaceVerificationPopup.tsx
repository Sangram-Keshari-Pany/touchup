import React from "react";
import {
  FaLightbulb,
  FaGlasses,
  FaRegSmile,
  FaChair,
  FaUserAltSlash,
  FaTimes,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "../css/FaceVerificationPopup.css";

export default function FaceVerificationPopup({ onProceed }) {
  return (
    <div className="popup-overlay" role="dialog" aria-labelledby="popup-title">
      <div className="popup-container">

        {/* Title */}
        <h2 id="popup-title" className="popup-title">
          Face Verification Guidelines
        </h2>
        <p className="popup-subtitle">
          Please follow these steps to ensure smooth and accurate verification:
        </p>

        {/* Guidelines List */}
        <ul className="popup-list">
          <li>
            <FaGlasses className="icon" />
            Remove spectacles or sunglasses for better accuracy.
          </li>
          <li>
            <FaLightbulb className="icon" />
            Ensure good front lighting. Avoid strong shadows or backlight.
          </li>
          <li>
            <FaRegSmile className="icon" />
            Keep a neutral or natural expression.
          </li>
          <li>
            <FaChair className="icon" />
            Sit upright and keep your face centered in the frame.
          </li>
          <li>
            <FaUserAltSlash className="icon" />
            Avoid hats, masks, or face coverings.
          </li>
          <li>
            Use a plain background without distractions.
          </li>
        </ul>

        {/* Action Buttons */}
        <div className="button-section">
          <Link className="btn-secondary" to="/">
            Go Back
          </Link>
          <button
            className="btn-primary"
            onClick={onProceed}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
