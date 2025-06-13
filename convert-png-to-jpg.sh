#!/bin/bash

# PNG to JPG Converter Script
# Usage: ./convert-png-to-jpg.sh [input.png] [output.jpg]
# Or: ./convert-png-to-jpg.sh [directory] (converts all PNGs in directory)

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed."
    echo "Please install it using: sudo apt-get install imagemagick"
    exit 1
fi

# Function to convert a single PNG to JPG
convert_single() {
    local input_file="$1"
    local output_file="$2"
    
    # If no output file specified, use same name with .jpg extension
    if [ -z "$output_file" ]; then
        output_file="${input_file%.png}.jpg"
    fi
    
    echo "Converting: $input_file -> $output_file"
    convert "$input_file" -quality 90 "$output_file"
    
    if [ $? -eq 0 ]; then
        echo "✓ Conversion successful"
    else
        echo "✗ Conversion failed"
        return 1
    fi
}

# Function to convert all PNGs in a directory
convert_directory() {
    local dir="$1"
    local count=0
    
    echo "Converting all PNG files in: $dir"
    echo "================================"
    
    for png_file in "$dir"/*.png; do
        if [ -f "$png_file" ]; then
            convert_single "$png_file"
            ((count++))
        fi
    done
    
    echo "================================"
    echo "Converted $count files"
}

# Main script logic
if [ $# -eq 0 ]; then
    echo "PNG to JPG Converter"
    echo "Usage:"
    echo "  Convert single file:  $0 input.png [output.jpg]"
    echo "  Convert directory:    $0 /path/to/directory"
    echo ""
    echo "Options:"
    echo "  -q [quality]  Set JPEG quality (1-100, default: 90)"
    exit 0
fi

# Check if first argument is a directory
if [ -d "$1" ]; then
    convert_directory "$1"
elif [ -f "$1" ]; then
    convert_single "$1" "$2"
else
    echo "Error: '$1' is not a valid file or directory"
    exit 1
fi