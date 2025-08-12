import mediapipe as mp
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image



class PostureEyeAnalyzer:
    def __init__(self):
        self.mp_pose = mp.solutions.pose

    def decode_base64_image(self,base64_string):
        image_data = base64_string.split(',')[1]
        image_bytes = base64.b64decode(image_data)
        img = Image.open(BytesIO(image_bytes)).convert('RGB')
        return np.array(img)

    def analyze_posture(self, landmarks):
        try:
            ls = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER]
            rs = landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER]
            lh = landmarks[self.mp_pose.PoseLandmark.LEFT_HIP]
            rh = landmarks[self.mp_pose.PoseLandmark.RIGHT_HIP]
            nose = landmarks[self.mp_pose.PoseLandmark.NOSE]
            lw = landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST]
            rw = landmarks[self.mp_pose.PoseLandmark.RIGHT_WRIST]

            shoulder_diff = abs(ls.y - rs.y)
            posture_score = max(0, 100 - (shoulder_diff * 1000))

            center_shoulder_x = (ls.x + rs.x) / 2
            head_alignment = "Centered" if abs(nose.x - center_shoulder_x) < 0.05 else "Tilted"

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

    def analyze_frame(self, image_base64: str):
        try:
            frame_np = self.decode_base64_image(image_base64)

            with self.mp_pose.Pose(static_image_mode=True) as pose:
                results = pose.process(cv2.cvtColor(frame_np, cv2.COLOR_RGB2BGR))

            if not results.pose_landmarks:
                raise ValueError("No body detected")

            landmarks = results.pose_landmarks.landmark
            analysis = self.analyze_posture(landmarks)
            

            # eye_contact_result = detect_eye_contact(frame_np)

            return {
                "success": True,
                "message": "Posture  analyzed successfully.",
                "analysis": analysis,
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Processing error: {str(e)}"
            }


