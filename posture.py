from flask import  jsonify
import mediapipe as mp
import cv2

from utils import decode_base64_image

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True)
drawing = mp.solutions.drawing_utils

def analyze_posture(landmarks):
    # Extract relevant points
    try:
        ls = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
        rs = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
        lh = landmarks[mp_pose.PoseLandmark.LEFT_HIP]
        rh = landmarks[mp_pose.PoseLandmark.RIGHT_HIP]
        nose = landmarks[mp_pose.PoseLandmark.NOSE]
        lw = landmarks[mp_pose.PoseLandmark.LEFT_WRIST]
        rw = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST]

        # Posture alignment (shoulder level difference)
        shoulder_diff = abs(ls.y - rs.y)
        posture_score = max(0, 100 - (shoulder_diff * 1000))  # 100 = perfect alignment

        # Head alignment (nose should be above center of shoulders)
        center_shoulder_x = (ls.x + rs.x) / 2
        head_alignment = "Centered" if abs(nose.x - center_shoulder_x) < 0.05 else "Tilted"

        # Hand position
        hands_up = (lw.y < ls.y) or (rw.y < rs.y)
        hand_position = "Raised" if hands_up else "Resting"

        return {
            "posture_score": round(posture_score, 2),
            "head_alignment": head_alignment,
            "hand_position": hand_position,
            "shoulder_diff": round(shoulder_diff, 3)
        }
    except Exception as e:
        return {"error": f"Landmark extraction failed: {str(e)}"}
    
def analyze_frame(request):
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"success": False, "message": "No image data provided"}), 400

        # Decode base64 image
        frame_np = decode_base64_image(data['image'])

        # Process pose
        results = pose.process(cv2.cvtColor(frame_np, cv2.COLOR_RGB2BGR))

        if not results.pose_landmarks:
            return jsonify({"success": False, "message": "No body detected"}), 400

        landmarks = results.pose_landmarks.landmark
        analysis = analyze_posture(landmarks)

        return jsonify({
            "success": True,
            "message": "Posture analyzed successfully.",
            "analysis": analysis
        })

    except Exception as e:
        return jsonify({"success": False, "message": f"Processing error: {str(e)}"}), 500

