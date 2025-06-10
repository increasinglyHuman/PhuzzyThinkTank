#!/bin/bash

echo "🐧 Corsair Linux Setup for Phuzzy"
echo "=================================="

# Update system
echo "1. Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential tools
echo -e "\n2. Installing development tools..."
sudo apt install -y \
    git \
    curl \
    wget \
    build-essential \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    ffmpeg

# Install Stable Diffusion WebUI
echo -e "\n3. Installing Stable Diffusion WebUI..."
cd ~
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui
./webui.sh --help

# Create project directory
echo -e "\n4. Setting up Phuzzy project..."
mkdir -p ~/Documents/Phuzzy
cd ~/Documents/Phuzzy

# Extract code backup
if [ -f ~/phuzzy-code-only.tar.gz ]; then
    tar -xzf ~/phuzzy-code-only.tar.gz
    echo "   ✅ Project files extracted"
fi

# Setup environment
if [ -f ~/.env ]; then
    cp ~/.env ~/Documents/Phuzzy/temp/.env
    echo "   ✅ Environment variables configured"
fi

# Install Node dependencies
echo -e "\n5. Installing Node.js dependencies..."
cd ~/Documents/Phuzzy/temp
npm install

# Setup Python environment
echo -e "\n6. Setting up Python environment..."
python3 -m venv venv
source venv/bin/activate
pip install requests python-dotenv

echo -e "\n✅ Setup complete!"
echo "Next steps:"
echo "1. Copy your SD models to ~/stable-diffusion-webui/models/"
echo "2. Run: cd ~/stable-diffusion-webui && ./webui.sh"
echo "3. Access at: http://localhost:7860"
