import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")


class ClothesDetector:
    def base64_to_cv2(self, base64_str):
        # Remove header if present (e.g., "data:image/jpeg;base64,")
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        image_bytes = base64.b64decode(base64_str)
        image = Image.open(BytesIO(image_bytes)).convert('RGB')
        open_cv_image = np.array(image)
        # Convert RGB to BGR for OpenCV
        return cv2.cvtColor(open_cv_image, cv2.COLOR_RGB2BGR)

    def is_wearing_clothes(self, base64_image):
        img = self.base64_to_cv2(base64_image)
        if img is None:
            raise ValueError("Could not decode image from base64")

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        faces = face_cascade.detectMultiScale(gray, 1.1, 5)
        if len(faces) == 0:
            return "No face detected."

        for (x, y, w, h) in faces:
            # Define shirt region below the face
            shirt_y1 = y + int(h * 1.1)
            shirt_y2 = y + int(h * 2.0)
            shirt_y2 = min(shirt_y2, img.shape[0])  # Ensure within image bounds

            shirt_roi = img_rgb[shirt_y1:shirt_y2, x:x+w]

            if shirt_roi.size == 0:
                return False

            hsv = cv2.cvtColor(shirt_roi, cv2.COLOR_RGB2HSV)

            # Skin color range (HSV)
            lower_skin = np.array([0, 30, 60], dtype=np.uint8)
            upper_skin = np.array([20, 150, 255], dtype=np.uint8)

            mask = cv2.inRange(hsv, lower_skin, upper_skin)
            skin_ratio = np.sum(mask > 0) / mask.size
            print(skin_ratio)

            if skin_ratio > 0.3:
                return False
            else:
                return True

        return False


