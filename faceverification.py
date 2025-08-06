from flask import jsonify
import cv2
import numpy as np
import base64
from mtcnn import MTCNN
from numpy.linalg import norm
from keras_facenet import FaceNet
import matplotlib.pyplot as plt

# Load FaceNet model and detector once
embedder = FaceNet()
detector = MTCNN()

def decode_base64_image(base64_string):
    try:
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        image_data = base64.b64decode(base64_string)
        np_array = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Could not decode image.")
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return rgb_image
    except Exception as e:
        raise ValueError(f"Failed to decode base64 image: {str(e)}")

def extract_face(img):
    # Detect faces and facial landmarks
    faces = detector.detect_faces(img)
    if len(faces) == 0:
        raise ValueError("No face detected")

    face = faces[0]
    keypoints = face['keypoints']

    # Extract eye coordinates
    left_eye = keypoints['left_eye']
    right_eye = keypoints['right_eye']

    # Compute angle between the eyes
    dx = right_eye[0] - left_eye[0]
    dy = right_eye[1] - left_eye[1]
    angle = np.degrees(np.arctan2(dy, dx))

    # Compute center between eyes and convert to int
    eye_center = (
        int((left_eye[0] + right_eye[0]) // 2),
        int((left_eye[1] + right_eye[1]) // 2)
    )

    # Get rotation matrix and rotate image
    rot_mat = cv2.getRotationMatrix2D(eye_center, angle, scale=1.0)
    aligned_img = cv2.warpAffine(img, rot_mat, (img.shape[1], img.shape[0]))

    # After alignment, re-calculate bounding box
    x, y, w, h = face['box']
    x, y = max(0, x), max(0, y)
    face_aligned = aligned_img[y:y+h, x:x+w]

    # Resize to 160x160 (standard input size for models like FaceNet)
    face_resized = cv2.resize(face_aligned, (160, 160))


    return face_resized

def cosine_similarity(a, b):
    return np.dot(a, b) / (norm(a) * norm(b))

# Load and preprocess reference image once at startup
REFERENCE_IMAGE_PATH = "image4.jpg"
ref_img_bgr = cv2.imread(REFERENCE_IMAGE_PATH)
if ref_img_bgr is None:
    raise RuntimeError(f"Could not load reference image from {REFERENCE_IMAGE_PATH}")
ref_img_rgb = cv2.cvtColor(ref_img_bgr, cv2.COLOR_BGR2RGB)
ref_face = extract_face(ref_img_rgb)
ref_embedding = embedder.embeddings([ref_face])[0]

def authenticate(request):
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"success": False, "message": "No image data provided"}), 400

        uploaded_img = decode_base64_image(data['image'])
        uploaded_face = extract_face(uploaded_img)
        uploaded_embedding = embedder.embeddings([uploaded_face])[0]

        similarity =float(cosine_similarity(ref_embedding, uploaded_embedding))
        print(similarity,"similarity")
        threshold = 0.7  # You can tune this

        verified = bool(similarity > threshold)

        print(verified,round(float(similarity), 4),threshold)

        return jsonify({
            "success": verified,
            "message": "Face verified successfully!" if verified else "Face Not verified successfully!" ,
            "distance":threshold
        })

    except Exception as e:
        return jsonify({"success": False, "message": f"Error processing image: {str(e)}"}), 500
