import React, { useState, useRef } from "react";
import "../css/ActualQuestion.css"

export default function CurrentQuestion({ question }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlayAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
  };

  const onAudioPlay = () => setIsPlaying(true);
  const onAudioPause = () => setIsPlaying(false);
  const onAudioEnded = () => setIsPlaying(false);

  return (
    <section className="examSection" aria-label="Current Question Section">
      <div className="currentQuestionBox" role="region" aria-live="polite">
        
        <div
        className={`speakingIcon ${isPlaying ? "active" : ""}`}
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
        role="button"
        tabIndex={0}
        onClick={togglePlayAudio}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            togglePlayAudio();
          }
        }}
        title={isPlaying ? "Pause audio" : "Play audio"}
      >
        {/* Speaker icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="icon speakerIcon"
        >
          <path d="M3 9v6h4l5 5V4L7 9H3z" />
          {isPlaying && (
            <path d="M16.5 12a4.5 4.5 0 0 1-3 4.24v-8.48A4.5 4.5 0 0 1 16.5 12z" />
          )}
        </svg>
        {question.text}
      </div>
      </div>

      <audio
        ref={audioRef}
        src={question.audioUrl}
        onPlay={onAudioPlay}
        onPause={onAudioPause}
        onEnded={onAudioEnded}
      />
    </section>
  );
}
