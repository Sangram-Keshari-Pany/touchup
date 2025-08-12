import { toast } from "react-toastify";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

// ----- Analyze Frame Function -----
export const analyzeCurrentFrame = async ({ videoRef, canvasRef, setPostureAnalysis, setFaceVisible, setMultipleFaces, setForbiddenObjectsDetected, setDetectedObjects, setEmotionAnalysis, setDress, setEyeContact }) => {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  if (!video || !canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = canvas.toDataURL("image/jpeg");

  try {
    const postureRes = await fetch(`${BASE_URL}/analyze_posture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageData, timestamp: Date.now() }),
    });

    const data = await postureRes.json();
    if (setPostureAnalysis) setPostureAnalysis(data.analysis);
    if (setEmotionAnalysis) setEmotionAnalysis(data.emotion.emotions);
    if (setDress) setDress(data.cloth);
    if (setEyeContact) setEyeContact(data.eye);

  } catch (err) {
    console.error("Posture analysis error:", err);
  }


};

// ----- Initialize Camera -----
export const initializeCamera = async (videoRef, streamRef) => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  if (videoRef.current) {
    videoRef.current.srcObject = stream;
  }
  streamRef.current = stream;
};

// ----- Shutdown Camera -----
export const shutdownCamera = (videoRef, streamRef, timerRef, postureRef) => {
  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }
  if (timerRef.current) clearInterval(timerRef.current);
  if (postureRef.current) clearInterval(postureRef.current);
};






export const startRecording = ({streamRef,mediaRecorderRef,recordedChunksRef,setIsRecording,setTimeLeft,timerIntervalRef,onRecordingStop,}) => {
  if (!streamRef.current) {
    toast.error("Camera not initialized.");
    return;
  }

  let mediaRecorder;
  const options = { mimeType: "video/webm; codecs=vp9" };

  try {
    mediaRecorder = new MediaRecorder(streamRef.current, options);
  } catch (err) {
    mediaRecorder = new MediaRecorder(streamRef.current);
  }

  recordedChunksRef.current = [];
  mediaRecorderRef.current = mediaRecorder;

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunksRef.current.push(e.data);
    }
  };

  mediaRecorder.onstop = () => onRecordingStop();

  mediaRecorder.start();
  setIsRecording(true);
  setTimeLeft(60);

  timerIntervalRef.current = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timerIntervalRef.current);
        if (mediaRecorderRef.current?.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  toast.success("Recording started!");
};

export const stopRecording = ({mediaRecorderRef,timerIntervalRef,setIsRecording,setTimeLeft,}) => {
  if (mediaRecorderRef.current?.state !== "inactive") {
    mediaRecorderRef.current.stop();
  }
  clearInterval(timerIntervalRef.current);
  setIsRecording(false);
  setTimeLeft(0);
  toast.info("Recording stopped.");
};

export const uploadRecordedVideo = async ({recordedChunksRef,setExtractedAudioText,setExtractedErrors,setExtractedAudioAnalyze}) => {
  if (recordedChunksRef.current.length === 0) {
    toast.error("No video recorded.");
    return;
  }

  const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
  const formData = new FormData();
  formData.append("file", blob, "recorded_video.webm");

  toast.info("Uploading recorded video...");

  try {
    const { data } = await axios.post(`${BASE_URL}/extract-audio`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const { extracted_audio_text, extracted_eroors, extract_audioanalyze } = data;

    setExtractedAudioText(extracted_audio_text);
    setExtractedErrors(extracted_eroors);
    setExtractedAudioAnalyze(extract_audioanalyze);
    toast.success("Video uploaded and analyzed successfully!");
  } catch (error) {
    toast.error("Upload failed.");
  } finally {
    recordedChunksRef.current = [];
  }
};

export const uploadFromDevice = async ({
  file,
  setExtractedAudioText,
  setExtractedErrors,
  setExtractedAudioAnalyze,
}) => {
  const formData = new FormData();
  formData.append("file", file, file.name || "uploaded_video.webm"); // 👈 key name must match backend

  toast.info("Uploading selected video...");

  try {
    const { data } = await axios.post(`${BASE_URL}/extract-audio`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const { extracted_audio_text, extracted_eroors, extract_audioanalyze } = data;

    setExtractedAudioText(extracted_audio_text);
    setExtractedErrors(extracted_eroors);
    setExtractedAudioAnalyze(extract_audioanalyze);
    toast.success("Video uploaded and analyzed successfully!");
  } catch (error) {
    console.error(error); // 👈 Add this for debugging
    toast.error("Upload from device failed.");
  }
};
