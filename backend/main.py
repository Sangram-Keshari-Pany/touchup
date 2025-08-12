from fastapi import FastAPI, HTTPException,UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from face_auth import verify_face
from posture_analysis import PostureEyeAnalyzer
from facial_expression import EmotionDetector
from cloth_detection import ClothesDetector
from eye_detection import EyeContactDetector
from utils import extract_audio_from_video
from transcript import Audio_Transcript
from audioanalyzer import AudioAnalyzer
import os

app = FastAPI()
analyzer = PostureEyeAnalyzer()
detector=EmotionDetector()
cloth_detector = ClothesDetector()
eye_detector=EyeContactDetector()

SAVE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'extracted_audios'))
os.makedirs(SAVE_DIR, exist_ok=True)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AuthRequest(BaseModel):
    image: str

@app.post("/authenticate")
async def authenticate(data: AuthRequest):
    try:
        result = verify_face(data.image)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class ImageRequest(BaseModel):
    image: str

@app.post("/analyze_posture")
async def analyze_posture_eye(data: ImageRequest):
    analysis = analyzer.analyze_frame(data.image)
    emotion= detector.analyze_frame(data.image)
    cloth= cloth_detector.is_wearing_clothes(data.image)
    eye=eye_detector.analyze(data.image)

    if not analysis.get("success", False):
        raise HTTPException(status_code=400, detail=analysis.get("message"))
    return {"analysis":analysis,"emotion":emotion,"cloth":cloth,"eye":eye}



@app.post("/extract-audio")
async def extract_audio(file: UploadFile = File(...)):
    # Read the uploaded file into memory
    video_bytes = await file.read()

    # Pass in-memory bytes to your audio extraction function
    response1 = extract_audio_from_video(video_bytes,SAVE_DIR)

    if response1["status"] == 200:
        # Transcription
        transcript_audio = Audio_Transcript(response1["audio_path"])
        extracted_audio_text = transcript_audio.text_extraction()
        extracted_errors = transcript_audio.error_counts()

        # Audio analysis
        analyze_audio = AudioAnalyzer(response1["audio_path"])
        extract_audioanalyze = analyze_audio.summarize()

        return JSONResponse(content={
            "extracted_audio_text": extracted_audio_text,
            "extracted_eroors": extracted_errors,
            "extract_audioanalyze": extract_audioanalyze
        })

    return JSONResponse(content={"error": "Audio extraction failed"}, status_code=400)
