# from flask import jsonify
# import face_recognition
# import os
# from utils import decode_base64_image

# # Load reference image on startup
# REFERENCE_IMAGE_PATH = "laxmi_sir.jpg"
# try:
#     reference_image = face_recognition.load_image_file(REFERENCE_IMAGE_PATH)
#     reference_encodings = face_recognition.face_encodings(reference_image)
#     if not reference_encodings:
#         raise ValueError("No face found in the reference image.")
#     reference_encoding = reference_encodings[0]
# except Exception as e:
#     raise RuntimeError(f"Failed to load reference image: {e}")

# # Main authentication endpoint logic
# def authenticate(request):
#     try:
#         data = request.get_json()
#         if not data or 'image' not in data:
#             return jsonify({"success": False, "message": "No image data provided"}), 400

#         image_np = decode_base64_image(data['image'])  # Ensure this returns RGB image

#         uploaded_encodings = face_recognition.face_encodings(image_np)
#         if not uploaded_encodings:
#             return jsonify({"success": False, "message": "No face found in uploaded image"}), 400

#         uploaded_encoding = uploaded_encodings[0]
#         match_result = face_recognition.compare_faces([reference_encoding], uploaded_encoding, tolerance=0.45)[0]
#         distance = face_recognition.face_distance([reference_encoding], uploaded_encoding)[0]

#         if match_result:
#             return jsonify({
#                 "success": True,
#                 "message": "Face verified successfully!",
#                 "distance": round(float(distance), 4)
#             })
#         else:
#             return jsonify({
#                 "success": False,
#                 "message": "Face did not match.",
#                 "distance": round(float(distance), 4)
#             })

#     except Exception as e:
#         return jsonify({"success": False, "message": f"Error processing image: {str(e)}"}), 500
