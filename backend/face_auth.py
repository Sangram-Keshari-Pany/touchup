import cv2
import numpy as np
import base64
from mtcnn import MTCNN
from numpy.linalg import norm
from keras_facenet import FaceNet

embedder = FaceNet()
detector = MTCNN()

REFERENCE_IMAGE_PATH = "image4.jpg"

def decode_base64_image(base64_string: str) -> np.ndarray:
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    image_data = base64.b64decode(base64_string)
    np_array = np.frombuffer(image_data, np.uint8)
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode image.")
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

def extract_face(img: np.ndarray) -> np.ndarray:
    faces = detector.detect_faces(img)
    if not faces:
        raise ValueError("No face detected")
    face = faces[0]
    keypoints = face['keypoints']

    left_eye = keypoints['left_eye']
    right_eye = keypoints['right_eye']

    dx = right_eye[0] - left_eye[0]
    dy = right_eye[1] - left_eye[1]
    angle = np.degrees(np.arctan2(dy, dx))

    eye_center = (
        int((left_eye[0] + right_eye[0]) / 2),
        int((left_eye[1] + right_eye[1]) / 2)
    )

    rot_mat = cv2.getRotationMatrix2D(eye_center, angle, scale=1.0)
    aligned_img = cv2.warpAffine(img, rot_mat, (img.shape[1], img.shape[0]))

    x, y, w, h = face['box']
    x, y = max(0, x), max(0, y)
    face_aligned = aligned_img[y:y+h, x:x+w]
    face_resized = cv2.resize(face_aligned, (160, 160))

    return face_resized

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return np.dot(a, b) / (norm(a) * norm(b))

# Prepare reference embedding once
_ref_img_bgr = cv2.imread(REFERENCE_IMAGE_PATH)
if _ref_img_bgr is None:
    raise RuntimeError(f"Could not load reference image: {REFERENCE_IMAGE_PATH}")
_ref_img_rgb = cv2.cvtColor(_ref_img_bgr, cv2.COLOR_BGR2RGB)
_ref_face = extract_face(_ref_img_rgb)
_ref_embedding = embedder.embeddings([_ref_face])[0]
ref_embedding = _ref_embedding / norm(_ref_embedding)

def verify_face(image_base64: str) -> dict:
    img = decode_base64_image(image_base64)
    face = extract_face(img)
    embedding = embedder.embeddings([face])[0]
    embedding = embedding / norm(embedding)

    similarity = float(cosine_similarity(ref_embedding, embedding))
    threshold = 0.6
    verified = similarity > threshold

    return {
        "success": verified,
        "message": "Face verified successfully!" if verified else "Face not verified!",
        "distance": threshold,
        "similarity": similarity,
    }
