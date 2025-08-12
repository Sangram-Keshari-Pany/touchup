import librosa
import numpy as np

class AudioAnalyzer:
    def __init__(self, file_path, silence_threshold=0.01, frame_length=2048, hop_length=512):
        self.file_path = file_path
        self.silence_threshold = silence_threshold
        self.frame_length = frame_length
        self.hop_length = hop_length

        # Load audio
        self.y, self.sr = librosa.load(self.file_path, sr=None)
        self.frame_duration = hop_length / self.sr

        # Precompute RMS
        self.rms = librosa.feature.rms(
            y=self.y, frame_length=self.frame_length, hop_length=self.hop_length
        )[0]

        # Precompute pitch (f0)
        self.f0, self.voiced_flag, _ = librosa.pyin(
            self.y,
            fmin=librosa.note_to_hz('E2'),
            fmax=librosa.note_to_hz('C5'),
            sr=self.sr,
            frame_length=self.frame_length,
            hop_length=self.hop_length
        )

        # Boolean masks
        self.voiced_frames = ~np.isnan(self.f0)
        self.silent_frames = self.rms < self.silence_threshold
        self.speech_frames = self.voiced_frames & ~self.silent_frames

    def get_average_pitch(self):
        pitch_values = self.f0[self.voiced_frames]
        return np.mean(pitch_values) if len(pitch_values) > 0 else 0.0

    def get_average_volume(self):
        mean_rms = np.mean(self.rms)
        return 20 * np.log10(mean_rms) if mean_rms > 0 else -np.inf

    def get_silence_duration(self):
        return np.sum(self.silent_frames) * self.frame_duration

    def get_speech_rate(self):
        speech_duration_sec = np.sum(self.speech_frames) * self.frame_duration
        total_voiced_frames = np.sum(self.voiced_frames)
        return total_voiced_frames / speech_duration_sec if speech_duration_sec > 0 else 0.0

    def summarize(self):
        return {
            "average_pitch_Hz": float(round(self.get_average_pitch(), 2)),
            "average_volume_dB": float(round(abs(self.get_average_volume()), 2)),
            "silence_duration_sec": float(round(self.get_silence_duration(), 2)),
            "approximate_speech_rate_fps": float(round(self.get_speech_rate(), 2))
        }
