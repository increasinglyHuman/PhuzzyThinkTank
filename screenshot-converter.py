#!/usr/bin/env python3
"""
🐻 Bear Screenshot Converter
Converts PNG screenshots to JPG and organizes them in a screenshots folder
"""

import os
import glob
from PIL import Image
from datetime import datetime

def convert_screenshots():
    # Create screenshots directory if it doesn't exist
    screenshots_dir = os.path.join(os.getcwd(), 'screenshots')
    os.makedirs(screenshots_dir, exist_ok=True)
    
    # Common screenshot locations to check
    screenshot_paths = [
        os.path.expanduser('~/Desktop/*.png'),
        os.path.expanduser('~/Downloads/*.png'),
        os.path.expanduser('~/Pictures/*.png'),
        os.path.expanduser('~/Documents/*.png'),
        '/tmp/*.png',
        '*.png'  # Current directory
    ]
    
    converted_count = 0
    
    print("🐻 Bear starting screenshot hunt...")
    
    for path_pattern in screenshot_paths:
        png_files = glob.glob(path_pattern)
        
        for png_file in png_files:
            # Skip if already processed
            filename = os.path.basename(png_file)
            if filename.startswith('Screenshot') or 'screen' in filename.lower():
                try:
                    # Open and convert PNG to JPG
                    with Image.open(png_file) as img:
                        # Convert RGBA to RGB if needed
                        if img.mode in ('RGBA', 'LA'):
                            background = Image.new('RGB', img.size, (255, 255, 255))
                            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                            img = background
                        
                        # Generate output filename with timestamp
                        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                        base_name = os.path.splitext(filename)[0]
                        jpg_filename = f"{base_name}_{timestamp}.jpg"
                        jpg_path = os.path.join(screenshots_dir, jpg_filename)
                        
                        # Save as JPG with high quality
                        img.save(jpg_path, 'JPEG', quality=95, optimize=True)
                        
                        print(f"✅ Bear converted: {filename} -> {jpg_filename}")
                        converted_count += 1
                        
                        # Optionally remove original PNG
                        # os.remove(png_file)  # Uncomment to delete originals
                        
                except Exception as e:
                    print(f"🐻 Bear error converting {filename}: {e}")
    
    print(f"🎯 Bear mission complete! Converted {converted_count} screenshots")
    print(f"📁 Screenshots saved to: {screenshots_dir}")

if __name__ == "__main__":
    convert_screenshots()