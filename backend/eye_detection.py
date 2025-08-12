import cv2
import numpy as np
import base64
from tensorflow.keras.models import load_model
from io import BytesIO
from PIL import Image

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

class EyeContactDetector:
    def base64_to_cv2(self, base64_str):
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        image_bytes = base64.b64decode(base64_str)
        image = Image.open(BytesIO(image_bytes)).convert('RGB')
        open_cv_image = np.array(image)
        return cv2.cvtColor(open_cv_image, cv2.COLOR_RGB2BGR)

    def detect_eye_contact(self, gray_face):
        eyes = eye_cascade.detectMultiScale(gray_face, scaleFactor=1.1, minNeighbors=5)
        return len(eyes) >= 2  # True if at least two eyes detected

    def analyze(self, base64_image):
        frame = self.base64_to_cv2(base64_image)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

        if len(faces) == 0:
            return {"eye_contact": False, "message": "No face detected."}

        results = []
        for (x, y, w, h) in faces:
            face_gray = gray[y:y+h, x:x+w]
            eye_contact = self.detect_eye_contact(face_gray)

            results.append({
                "face_box": (x, y, w, h),
                "eye_contact": eye_contact,
            })

        return eye_contact



