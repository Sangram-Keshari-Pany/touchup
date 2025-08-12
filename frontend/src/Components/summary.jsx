import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/summary.css';

const average = (arr) => {
  const filtered = arr.filter((v) => typeof v === 'number');
  if (filtered.length === 0) return undefined;
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
};

const mostCommon = (arr) => {
  const freq = {};
  arr.forEach((val) => {
    if (val) freq[val] = (freq[val] || 0) + 1;
  });
  if (Object.keys(freq).length === 0) return undefined;
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
};

const estimateProficiency = (grammarAcc, speechRate) => {
  if (grammarAcc === undefined || speechRate === undefined) {
    return 'Data insufficient for proficiency assessment';
  }
  if (grammarAcc > 90 && speechRate >= 90 && speechRate <= 150) {
    return 'Excellent';
  } else if (grammarAcc > 80 && speechRate >= 80 && speechRate <= 160) {
    return 'Good';
  } else if (grammarAcc > 70) {
    return 'Average';
  } else {
    return 'Improvement Recommended';
  }
};

const estimateConfidence = (grammarAcc) => {
  if (grammarAcc === undefined) return undefined;
  return Math.min(100, Math.max(50, grammarAcc));
};

const SummaryModal = ({ responses, initialQuestions }) => {
  const navigate = useNavigate();
  const handleClose = () => {
  navigate('/'); 
  window.location.reload();};

  const speechRates = responses.map((r) => r.analysis?.approximate_speech_rate_fps);
  const pitches = responses.map((r) => r.analysis?.average_pitch_Hz);
  const volumes = responses.map((r) => r.analysis?.average_volume_dB);
  const silences = responses.map((r) => r.analysis?.silence_duration_sec);
  const grammarAccuracies = responses.map((r) => r.errors?.Grammar_Accuracy);
  const postures = responses.map((r) => r.analysis?.posture);
  const dressings = responses.map((r) => r.analysis?.dressing);
  const proficienciesFromData = responses.map((r) => r.analysis?.proficiency);

  const avgSpeechRate = average(speechRates);
  const avgPitch = average(pitches);
  const avgVolume = average(volumes);
  const avgSilence = average(silences);
  const avgGrammarAccuracy = average(grammarAccuracies);

  const estimatedConfidence = estimateConfidence(avgGrammarAccuracy);
  const estimatedProficiency = estimateProficiency(avgGrammarAccuracy, avgSpeechRate);

  const overallProficiency = mostCommon(proficienciesFromData) || estimatedProficiency;
  const overallPosture = mostCommon(postures) || 'Not Available';
  const overallDressing = mostCommon(dressings) || 'Not Available';

  return (
    <div className="modal-overlay">
      <div className="summary-modal">
        <div className="modal-header">
          <h2 style={{textAlign:"center"}}>Interview Summary Report</h2>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        <section className="summary-section overall-analysis">
          <h3>Overall Performance</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Speech Rate</span>
              <span className="stat-value">{avgSpeechRate ? `${avgSpeechRate.toFixed(1)} fps` : 'N/A'}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Silence Duration</span>
              <span className="stat-value">{avgSilence ? `${avgSilence.toFixed(1)} sec` : 'N/A'}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Confidence</span>
              <span className="stat-value">{estimatedConfidence ? `${estimatedConfidence.toFixed(1)}%` : 'N/A'}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Language Proficiency</span>
              <span className="stat-value">{overallProficiency}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Grammar Accuracy</span>
              <span className="stat-value">{avgGrammarAccuracy ? `${avgGrammarAccuracy.toFixed(1)}%` : 'N/A'}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Average Pitch</span>
              <span className="stat-value">{avgPitch ? `${avgPitch.toFixed(1)} Hz` : 'N/A'}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Average Volume</span>
              <span className="stat-value">{avgVolume ? `${avgVolume.toFixed(1)} dB` : 'N/A'}</span>
            </div>
          </div>
        </section>

        <section className="summary-section detailed-answers">
          <h3>Question Responses</h3>
          {responses.map((resp, idx) => (
            <div key={idx} className="question-card">
              <h4>{`Q${idx + 1}: ${initialQuestions[idx]?.text || 'Unknown Question'}`}</h4>
              <p>{resp.text && resp.text.trim() !== '' ? resp.text.trim() : '<No answer provided>'}</p>
            </div>
          ))}
        </section>

        <div className="modal-footer">
          <button className="btn-primary" onClick={handleClose}>Return to Home</button>
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;
