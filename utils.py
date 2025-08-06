import numpy as np
import base64
from io import BytesIO
from PIL import Image
from flask import  jsonify
import ffmpeg
import os
import uuid

# Utility to decode base64 image
def decode_base64_image(base64_string):
    image_data = base64_string.split(',')[1]
    image_bytes = base64.b64decode(image_data)
    img = Image.open(BytesIO(image_bytes)).convert('RGB')
    return np.array(img)



def extract_audio_from_video(request,SAVE_DIR):
    if 'video' not in request.files:
        return jsonify({'error': 'No video provided'}), 400
    video_file = request.files['video']
    temp_video_path = f"temp_{uuid.uuid4()}.webm"
    video_file.save(temp_video_path)
    audio_filename = f"{uuid.uuid4()}.wav"
    audio_path = os.path.join(SAVE_DIR, audio_filename)
    try:
        ffmpeg.input(temp_video_path).output(audio_path, format='wav', acodec='pcm_s16le').run(overwrite_output=True)
        return {'audio_path': audio_path,"status":200}
    except Exception as e:
        print("Exception occurred:", e)
        return {"error":"can't convert the video","status":400}

    finally:
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)