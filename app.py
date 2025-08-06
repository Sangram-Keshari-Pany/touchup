from flask import Flask, request, jsonify
from flask_cors import CORS
from concurrent.futures import ProcessPoolExecutor

import os
from faceverification import authenticate
from posture import analyze_frame
from objectdetection import analyze
from utils import extract_audio_from_video
from transcript import Audio_Transcript
from audioanalyzer import AudioAnalyzer


app = Flask(__name__)
CORS(app)

SAVE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'extracted_audios'))
os.makedirs(SAVE_DIR, exist_ok=True)

# FACE VERIFICATION FUNCTIONALITY
@app.route('/authenticate', methods=['POST'])
def face_verification():
    return authenticate(request)



@app.route('/analyze_posture', methods=['POST'])
def analyze_posture():
    return analyze_frame(request)

@app.route('/analyze', methods=['POST'])
def video_analyze():
    return analyze(request)


@app.route('/extract-audio', methods=['POST'])
def extract_audio():
    response1=extract_audio_from_video(request,SAVE_DIR)
    print(response1)
    if response1["status"]==200:
        #Text analyze
        transcript_audio = Audio_Transcript(response1["audio_path"])
        extracted_audio_text=transcript_audio.text_extraction()
        extracted_eroors=transcript_audio.error_counts()
        #Audio analyze 
        analyze_audio=AudioAnalyzer(response1["audio_path"])
        extract_audioanalyze=analyze_audio.summarize()

    return jsonify({"extracted_audio_text":extracted_audio_text,"extracted_eroors":extracted_eroors,"extract_audioanalyze":extract_audioanalyze})

if __name__ == '__main__':
    app.run(debug=True)
