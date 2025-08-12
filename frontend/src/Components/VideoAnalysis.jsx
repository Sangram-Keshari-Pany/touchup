import React from 'react';
import '../css/VideoAnalysis.css';  // Your external CSS file

const Bar = ({ label, value, max = 100, color = '#4caf50' }) => {
  const widthPercent = Math.min((value / max) * 100, 100);
  // Format values: if max=1 (like shoulder_diff), show as percentage, else show raw value
  const displayValue = max === 1 ? `${(value * 100).toFixed(1)}%` : value.toFixed(2);

  return (
    <div className="barWrapper">
      <div className="barLabel">{label}: {displayValue}</div>
      <div className="barBackground">
        <div className="barFill" style={{ width: `${widthPercent}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

const ParamCard = ({ label, value }) => (
  <div className="paramCard">
    <div>
      <div className="paramLabel">{label}<span>:-</span> <span>{value || 'N/A'}</span></div>
    </div>
  </div>
);

// Calculate facial engagement traits from emotion scores
const calculateFacialEngagement = (emotions = {},eyecontact=false) => {
  const happy = emotions.Happy || 0;
  const fear = emotions.Fear || 0;
  const surprise = emotions.Surprise || 0;
  const neutral = emotions.Neutral || 0;

  const smile = happy > 60 ? 'High' : happy > 20 ? 'Moderate' : 'Low';

  const eye_contact = eyecontact? 'Good' : 'Poor';

  const nervousScore = fear + surprise;
  const nervousness =
    nervousScore > 40 ? 'High' :
    nervousScore > 20 ? 'Moderate' : 'Low';

  const calmness =
    neutral > 70 ? 'High' :
    neutral > 40 ? 'Moderate' : 'Low';

  const confidenceScore = neutral + happy;
  const confidence =
    confidenceScore > 70 ? 'High' :
    confidenceScore > 40 ? 'Moderate' : 'Low';

  return {
    eye_contact,
    smile,
    blink_frequency: null, // Can update if blink data available
    nervousness,
    calmness,
    confidence,
    dress: 'Formal', // Placeholder, can be replaced with real data
  };
};

const VideoAnalysis = ({ postureAnalysis, emotionAnalysis,eyecontact }) => {
  const analysis = postureAnalysis?.analysis || {};
  const facialEngagement = calculateFacialEngagement(emotionAnalysis ?? {},eyecontact);


  return (
    <div className="videocontainer" role="region" aria-label="Video posture and facial analysis">
      {/* Posture Analysis */}
      <ParamCard label="Hand Position" value={analysis.hand_position}  />
      <ParamCard label="Head Alignment" value={analysis.head_alignment} />
      <Bar label="Posture Score" value={analysis.posture_score ?? 0} max={100} color="#2196f3" />
      <Bar label="Shoulder Allignment" value={1 - (analysis.shoulder_diff ?? 0)}  max={1} color="#ff5722" />

      {/* Facial Engagement */}
      <ParamCard label="Eye Contact" value={facialEngagement.eye_contact}  />
      <ParamCard label="Smile" value={facialEngagement.smile}  />
      <ParamCard label="Nervousness" value={facialEngagement.nervousness}  />
      <ParamCard label="Calmness" value={facialEngagement.calmness}  />
      <ParamCard label="Confidence" value={facialEngagement.confidence} />
      <ParamCard label="Dress Style" value={facialEngagement.dress}  />
    </div>
  );
};

export default VideoAnalysis;
