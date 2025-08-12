import React, { useState, useRef } from "react";
import "../css/QuestionList.css";


export default function QuestionList({questionsData}) {
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);

  const handlePlayAudio = (question) => {
    if (!audioRef.current) return;

    if (playingId === question.id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.src = question.audioUrl;
      audioRef.current.play();
      setPlayingId(question.id);
    }
  };

  const onAudioEnded = () => setPlayingId(null);

  return (
    <div className="questionListContainer" aria-label="Question List with progress bars and audio playback">
      <h2 className="questionListTitle">Question List</h2>
      <ul className="questionList">
        {questionsData.map(({ id, text, completed }, index) => (
          <li key={id} className="questionItem" aria-current={completed ? "false" : "true"}>
            <div className="topRow">
              {completed ? (
                <button
                  className={`playButton ${playingId === id ? "playing" : ""}`}
                  aria-pressed={playingId === id}
                  aria-label={`Play audio for question ${id}`}
                  onClick={() => handlePlayAudio({ id, audioUrl: questionsData.find(q => q.id === id).audioUrl })}
                  type="button"
                >
                  {playingId === id ? "⏸️" : "▶️"}
                </button>
              ) : (
                <div className="playButtonPlaceholder" />
              )}
              <div className="questionText">
                {completed ? text : `Question ${index + 1}`}
              </div>
            </div>
            <div className="progressWrapper" aria-label={`Completion progress for question ${id}`}>
              <progress
                className={`progressBar ${completed ? "completed" : ""}`}
                value={completed ? 100 : 0}
                max="100"
              />
            </div>
          </li>
        ))}
      </ul>
      <audio ref={audioRef} onEnded={onAudioEnded} />
    </div>
  );
}
