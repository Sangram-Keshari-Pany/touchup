import os
import whisper
from pydub import AudioSegment
import matplotlib.pyplot as plt
import re
import language_tool_python
import nltk

model = whisper.load_model("base")
tool = language_tool_python.LanguageTool('en-US')

class Audio_Transcript:
    def __init__(self, audio_path):
        self.wav_path = audio_path
        self.transcript_text = ""
        self.errors = 0
        self.accuracy = 0
        self.sentences = []

    def convert_mp3_to_wav(self, mp3_path):
        audio = AudioSegment.from_file(mp3_path)
        wav_path = os.path.splitext(mp3_path)[0] + ".wav"
        audio.export(wav_path, format="wav")
        return wav_path

    def text_extraction(self):
        result = model.transcribe(self.wav_path)
        print("\n\n\n",result["text"],"\n\n\n")
        self.transcript_text = result["text"]
        return self.transcript_text

    def error_counts(self):
        self.sentences = re.split(r'(?<=[.!?])\s+', self.transcript_text.strip())

        for sentence in self.sentences:
            matches = tool.check(sentence)
            grammar_matches = [m for m in matches if m.ruleId != "MORFOLOGIK_RULE_EN_US"]
            if grammar_matches:
                self.errors += len(grammar_matches)
        self.accuracy = 100 * (1 - self.errors / len(self.sentences))

        print(f"Total Sentences: {len(self.sentences)}")
        print(f"Sentences with Grammar Errors (excluding spelling): {self.errors}")
        print(f"Grammar Accuracy (by sentence): {self.accuracy:.1f}%")

        return {"Total_Sentences":self.sentences,"Grammar_Errors":self.errors,"Grammar_Accuracy":self.accuracy}
    


        


