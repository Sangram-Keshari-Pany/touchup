import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import "../css/FaceAuth.css";
import logo from "../assets/logo.png";
import FaceVerificationPopup from "./FaceVerificationPopup";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const FaceAuth = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate=useNavigate()

  const [showPopup, setShowPopup] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      toast.error("Error accessing camera: " + err.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Capture snapshot from video
  const captureSnapshot = () => {
    if (!canvasRef.current || !videoRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg");
  };

  // Authentication handler
  const startAuthentication = async () => {
    setIsAuthenticating(true);

    // Capture image and stop camera
    const snapshot = captureSnapshot();
    setCapturedImage(snapshot);
    stopCamera();

    try {
      const response = await axios.post("http://127.0.0.1:8000/authenticate", {
        image: snapshot,
      });

      if (response.data.success) {
        toast.success(response.data.message || "✅ Authentication successful!");
        navigate("/exam-screen")

      } else {
        toast.error(response.data.message || "❌ Authentication failed!");
        navigate("/")
      }
    } catch (err) {
      toast.error("❌ Error: " + (err?.response?.data?.message || err.message));
      navigate("/")
    } finally {
      setIsAuthenticating(false);
    }
  };

  // When popup closes, start the camera
  useEffect(() => {
    if (!showPopup) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [showPopup]);

  return (
    <>
      {showPopup ? (
        <FaceVerificationPopup onProceed={() => setShowPopup(false)} />
      ) : (
        <div className="auth-page">
          <div className="auth-card">
            <img src={logo} alt="Company Logo" className="auth-logo" />
            <h1 className="auth-title">Face Authentication</h1>
            <p className="auth-subtitle">
              Please position your face inside the frame for verification.
            </p>

            <div className="camera-frame">
              {!capturedImage && (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                />
              )}

              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Captured Face"
                  className="auth-image-preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>

            <div className="auth-buttons" style={{ marginTop: "20px" }}>
              {!capturedImage && (
                <button
                  onClick={startAuthentication}
                  disabled={isAuthenticating}
                  className="auth-btn"
                >
                  {isAuthenticating ? "Authenticating..." : "Start Authentication"}
                </button>
              )}
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />
            <ToastContainer 
              position="top-right"
              autoClose={3000}   
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnHover
              draggable
              // theme="colored"   // or "light", "dark"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FaceAuth;
