import React, { useRef, useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/ExamScreen.css";

import {analyzeCurrentFrame,initializeCamera,shutdownCamera,startRecording,stopRecording,uploadRecordedVideo,uploadFromDevice,} from "./functionality";

const CameraFunctionality = ({setPostureAnalysis,setExtractedAudioText,setExtractedErrors,setExtractedAudioAnalyze,setEmotionAnalysis,setDress,setEyeContact,}) => {
  const fileInputRef = useRef();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const postureIntervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const [faceVisible, setFaceVisible] = useState(true);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [forbiddenObjectsDetected, setForbiddenObjectsDetected] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState([]);

  const faceVisibleRef = useRef(faceVisible);
  const multipleFacesRef = useRef(multipleFaces);
  const forbiddenObjectsDetectedRef = useRef(forbiddenObjectsDetected);
  const detectedObjectsRef = useRef(detectedObjects);

  // Keep refs in sync
  useEffect(() => {
    faceVisibleRef.current = faceVisible;
    multipleFacesRef.current = multipleFaces;
    forbiddenObjectsDetectedRef.current = forbiddenObjectsDetected;
    detectedObjectsRef.current = detectedObjects;
  }, [faceVisible, multipleFaces, forbiddenObjectsDetected, detectedObjects]);

  const handleUpload = async () => {
    const file = fileInputRef.current.files[0];
    if (!file) return;
    await uploadFromDevice({ file, setExtractedAudioText, setExtractedErrors, setExtractedAudioAnalyze, });

    fileInputRef.current.value = null;
  };

  // Camera init & cleanup
  useEffect(() => {
    const init = async () => {
      try {
        await initializeCamera(videoRef, streamRef);

        postureIntervalRef.current = setInterval(() => {
          analyzeCurrentFrame({
            videoRef,
            canvasRef,
            setPostureAnalysis,
            setFaceVisible,
            setMultipleFaces,
            setForbiddenObjectsDetected,
            setDetectedObjects,
            setEmotionAnalysis,
            setDress,
            setEyeContact,
          });
        }, 1000);
      } catch (err) {
        toast.error("Failed to access the camera.");
      }
    };

    init();

    return () => {
      shutdownCamera(videoRef, streamRef, timerIntervalRef, postureIntervalRef);
    };
  }, []);

  const onRecordingStop = () => {
    uploadRecordedVideo({
      recordedChunksRef,
      setExtractedAudioText,
      setExtractedErrors,
      setExtractedAudioAnalyze,
    });
  };

  return (
    <div className="camera-section">
      {isRecording && (
        <div className="timer-display">Recording Time Left: {timeLeft}s</div>
      )}
      <div className="analysisCameraWrapper">
        <div className="camera-wrapper">
          <video ref={videoRef} autoPlay muted playsInline className="camera-video" />
          <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
        </div>
      </div>

      <div className="btn-section">
        <button
          className="btn start"
          onClick={() =>
            startRecording({
              streamRef,
              mediaRecorderRef,
              recordedChunksRef,
              setIsRecording,
              setTimeLeft,
              timerIntervalRef,
              onRecordingStop,
            })
          }
          disabled={isRecording}
        >
          START
        </button>

        <button
          className="btn stop"
          onClick={() =>
            stopRecording({
              mediaRecorderRef,
              timerIntervalRef,
              setIsRecording,
              setTimeLeft,
            })
          }
          disabled={!isRecording}
        >
          STOP
        </button>

        <label htmlFor="videoUpload" className="btn upload">
          UPLOAD
        </label>
        <input
          type="file"
          id="videoUpload"
          accept="video/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleUpload}
        />
      </div>
      <ToastContainer position="bottom-center" />
    </div>
  );
};

export default CameraFunctionality;
