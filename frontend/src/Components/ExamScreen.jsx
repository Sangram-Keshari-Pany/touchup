import React, { useEffect, useRef, useState } from "react";
import "../css/ExamScreen.css";
import QuestionList from "./QuestionList";
import CurrentQuestion from "./ActualQuestion";
import VideoAnalysis from "./VideoAnalysis";
import CameraFunctionality from "./CameraFunctionality";
import intro from "../assets/tell_me_about_your_self.mp3";
import strength from "../assets/What are your strengths and weaknesses.mp3";
import next5 from "../assets/Where do you see yourself in 5 years.mp3";
import joining from "../assets/Why do you want to work for our company.mp3";
import SummaryModal from "./summary";

const initialQuestions = [
  {
    id: 1,
    text: "Tell me about yourself",
    audioUrl: intro,
    completed: false,
  },
  {
    id: 2,
    text: "What are your strengths and weaknesses?",
    audioUrl: strength,
    completed: false,
  },
  {
    id: 3,
    text: "Where do you see yourself in 5 years?",
    audioUrl: next5,
    completed: false,
  },
  {
    id: 4,
    text: "Why do you want to work for our company?",
    audioUrl: joining,
    completed: false,
  },
  {
    id: 5,
    text: "What are your strengths and weaknesses?",
    audioUrl: "/audio/virtual_dom.mp3",
    completed: false,
  },
];

export default function ExamScreen() {
  const [questionsData, setQuestionsData] = useState(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(Array(initialQuestions.length).fill(0));
  const [postureAnalysis, setPostureAnalysis] = useState(null);
  const [emotionAnalysis, setEmotionAnalysis] = useState(null);
  const [eyecontact, setEyeContact] = useState(null);
  const [dress, setDress] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const [extractedAudioText, setExtractedAudioText] = useState('');
  const [extractedErrors, setExtractedErrors] = useState([]);
  const [extractedAudioAnalysis, setExtractedAudioAnalysis] = useState(null);
  const [responses, setResponses] = useState(
    Array(initialQuestions.length).fill({ text: '', errors: {}, analysis: {} })
  );

  const audioRef = useRef(null);
  const sidebarAudioRef = useRef(null);

  useEffect(() => {
    const isValidResponse =
      extractedAudioText.trim() !== "" ||
      Object.keys(extractedErrors || {}).length > 0 ||
      Object.keys(extractedAudioAnalysis || {}).length > 0;

    if (isValidResponse) {
      // Save response
      const updatedResponses = [...responses];
      updatedResponses[currentQuestionIndex] = {
        text: extractedAudioText,
        errors: extractedErrors,
        analysis: extractedAudioAnalysis,
      };
      setResponses(updatedResponses);

      // Update progress
      const newProgress = [...progress];
      newProgress[currentQuestionIndex] = 100;
      setProgress(newProgress);

      // Mark current question as completed
      const updatedQuestions = [...questionsData];
      updatedQuestions[currentQuestionIndex].completed = true;
      setQuestionsData(updatedQuestions);

      // Go to next or finish
      if (currentQuestionIndex < questionsData.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
        }, 1000);
      } else {
        setTimeout(() => setShowSummary(true), 1000);
      }

      // Reset state for next question
      setExtractedAudioText("");
      setExtractedErrors([]);
      setExtractedAudioAnalysis(null);
    } 
  }, [extractedAudioText, extractedErrors, extractedAudioAnalysis]);

  return (
  <div className="container">
    {showSummary ? (
      <SummaryModal responses={responses} initialQuestions={initialQuestions}/>
    ) : (
      <>
        <QuestionList questionsData={questionsData} />
        <div className="middle-section">
          <CurrentQuestion question={questionsData[currentQuestionIndex]} />
          <CameraFunctionality
            setPostureAnalysis={setPostureAnalysis}
            setExtractedAudioText={setExtractedAudioText}
            setExtractedErrors={setExtractedErrors}
            setExtractedAudioAnalyze={setExtractedAudioAnalysis}
            setEmotionAnalysis={setEmotionAnalysis}
            setDress={setDress}
            setEyeContact={setEyeContact}
          />
        </div>
        <aside className="analysisSection">
          <VideoAnalysis
            postureAnalysis={postureAnalysis}
            emotionAnalysis={emotionAnalysis}
            eyecontact={eyecontact}
          />
        </aside>
      </>
    )}
  </div>
);

}
