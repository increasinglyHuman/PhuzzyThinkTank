#!/usr/bin/env python3

import os
import json
import speech_recognition as sr
from pydub import AudioSegment
import tempfile
import time
from datetime import datetime

def transcribe_chipmunk_scenarios():
    print("🐿️ Chipmunk Cheese Chase - Python Speech Recognition")
    print("=" * 55)
    
    # Initialize recognizer
    r = sr.Recognizer()
    
    # Path to pack 007 audio files
    audio_base_path = "./data/audio-recording-voices-for-scenarios-from-elevenlabs"
    transcribed_scenarios = []
    
    print("🎵 Transcribing pack 007 audio files...")
    print("🆓 Using Google's free speech recognition API")
    
    # Process pack-007-scenario-000 through pack-007-scenario-009
    for i in range(10):
        scenario_id = f"{i:03d}"
        folder_name = f"pack-007-scenario-{scenario_id}"
        folder_path = os.path.join(audio_base_path, folder_name)
        
        print(f"\n📁 Processing {folder_name}...")
        
        if not os.path.exists(folder_path):
            print(f"  ⚠️ Folder not found: {folder_path}")
            continue
        
        scenario = {
            "id": f"pack-007-{scenario_id}-chipmunk-{i}",
            "title": "",
            "content": "",
            "claim": ""
        }
        
        # Transcribe each audio file
        audio_types = ['title', 'content', 'claim']
        for audio_type in audio_types:
            file_path = os.path.join(folder_path, f"{audio_type}.mp3")
            
            if os.path.exists(file_path):
                print(f"  🎤 Transcribing {audio_type}.mp3...")
                try:
                    transcript = transcribe_audio_file(r, file_path)
                    scenario[audio_type] = transcript
                    preview = transcript[:60] + ("..." if len(transcript) > 60 else "")
                    print(f"  ✅ {audio_type}: \"{preview}\"")
                    
                    # Small delay to be nice to the free API
                    time.sleep(2)
                    
                except Exception as error:
                    print(f"  ❌ Failed to transcribe {audio_type}: {str(error)}")
                    scenario[audio_type] = f"[Transcription failed: {str(error)}]"
            else:
                print(f"  ⚠️ File not found: {file_path}")
                scenario[audio_type] = "[Audio file not found]"
        
        transcribed_scenarios.append(scenario)
    
    # Save transcriptions
    output_file = "./transcribed-chipmunk-scenarios-python.json"
    result = {
        "packId": "pack-007",
        "theme": "Chipmunk Cheese Chase Adventures",
        "description": "Adorable chipmunk scenarios transcribed using Python SpeechRecognition",
        "transcribedAt": datetime.now().isoformat(),
        "method": "Python SpeechRecognition (Google Web API)",
        "scenarios": transcribed_scenarios
    }
    
    with open(output_file, 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"\n💾 Transcriptions saved to: {output_file}")
    print(f"📊 Total scenarios transcribed: {len(transcribed_scenarios)}")
    print(f"💰 Cost: $0.00 (completely free!)")
    
    return result

def transcribe_audio_file(recognizer, mp3_path):
    """Transcribe an MP3 file using speech recognition"""
    
    # Convert MP3 to WAV for speech recognition
    try:
        # Load MP3 file
        audio = AudioSegment.from_mp3(mp3_path)
        
        # Convert to the format speech_recognition expects
        audio = audio.set_frame_rate(16000).set_channels(1)
        
        # Export to temporary WAV file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
            audio.export(tmp_file.name, format="wav")
            wav_path = tmp_file.name
        
        # Transcribe the WAV file
        with sr.AudioFile(wav_path) as source:
            # Adjust for ambient noise
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            
            # Record the audio
            audio_data = recognizer.record(source)
            
            # Recognize speech using Google Web Speech API (free)
            transcript = recognizer.recognize_google(audio_data)
            
        # Clean up temporary file
        os.unlink(wav_path)
        
        return transcript if transcript else "[No speech detected]"
        
    except sr.UnknownValueError:
        return "[Could not understand audio]"
    except sr.RequestError as e:
        return f"[Google API error: {str(e)}]"
    except Exception as e:
        return f"[Processing error: {str(e)}]"

if __name__ == "__main__":
    try:
        result = transcribe_chipmunk_scenarios()
        print("\n🎉 Transcription completed successfully!")
        print("🐿️ Ready to restore the adorable chipmunk scenarios!")
    except Exception as error:
        print(f"\n💥 Transcription failed: {str(error)}")
        print("\n🤔 This uses Google's free web API - no setup required!")
        exit(1)