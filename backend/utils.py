import uuid
import os
import ffmpeg
import tempfile

def extract_audio_from_video(video_file_obj, save_dir):
    # Create temporary video file
    temp_video_path = os.path.join(tempfile.gettempdir(), f"temp_{uuid.uuid4()}.webm")
    
    # Save the uploaded video bytes to temp file
    with open(temp_video_path, "wb") as f:
        f.write(video_file_obj)

    # Set up audio output path
    audio_filename = f"{uuid.uuid4()}.wav"
    audio_path = os.path.join(save_dir, audio_filename)

    try:
        # Convert video to audio using ffmpeg
        ffmpeg.input(temp_video_path).output(audio_path, format='wav', acodec='pcm_s16le').run(overwrite_output=True)
        return {'audio_path': audio_path, "status": 200}
    
    except Exception as e:
        print("Exception occurred:", e)
        return {"error": "can't convert the video", "status": 400}

    finally:
        # Clean up the temp video file
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
