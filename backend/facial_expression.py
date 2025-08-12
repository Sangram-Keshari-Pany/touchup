
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
from tensorflow.keras.models import load_model

# Load face detection model (Haar Cascade)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
model = load_model('emotion_model.keras')
emotion_classes = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

class EmotionDetector:
    def decode_base64_image(self, base64_string):
        try:
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            image_data = base64.b64decode(base64_string)
            image = Image.open(BytesIO(image_data)).convert('RGB')
            return np.array(image)
        except Exception as e:
            raise ValueError(f"Invalid base64 image: {str(e)}")

    def preprocess_face(self, face_img):
        face = cv2.resize(face_img, (48, 48))
        face = face / 255.0
        face = np.expand_dims(face, axis=-1)  # (48,48,1)
        face = np.expand_dims(face, axis=0)   # (1,48,48,1)
        return face

    def predict_emotions(self, face_img):
        processed = self.preprocess_face(face_img)
        prediction = model.predict(processed, verbose=0)[0]
        return {
            emotion_classes[i]: round(float(prediction[i]) * 100, 2)
            for i in range(len(emotion_classes))
        }

    def analyze_frame(self, base64_image: str):
        try:
            image_np = self.decode_base64_image(base64_image)
            gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)

            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=3,
                minSize=(30, 30)
            )

            if len(faces) == 0:
                return {
                    "success": False,
                    "message": "No face detected.",
                    "emotions": {}
                }

            (x, y, w, h) = faces[0]  # Just the first face
            face_gray = gray[y:y + h, x:x + w]
            emotions = self.predict_emotions(face_gray)

            return {
                "success": True,
                "message": "Emotion analysis successful.",
                "emotions": emotions
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Emotion processing error: {str(e)}",
                "emotions": {}
            }
