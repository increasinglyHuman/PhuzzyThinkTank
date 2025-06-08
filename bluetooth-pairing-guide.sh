#!/bin/bash

# Bluetooth Headset Pairing Guide for Raspberry Pi
# Run with: bash bluetooth-pairing-guide.sh

echo "🎧 Bluetooth Headset Pairing Helper"
echo "==================================="
echo ""

# Check if running as sudo
if [ "$EUID" -eq 0 ]; then 
   echo "Don't run as sudo - we'll use sudo when needed"
   exit 1
fi

# Function to check service status
check_bluetooth_status() {
    echo "1. Checking Bluetooth service status..."
    sudo systemctl status bluetooth --no-pager | head -10
    echo ""
}

# Function to start bluetooth if needed
ensure_bluetooth_running() {
    echo "2. Ensuring Bluetooth is running..."
    sudo systemctl start bluetooth
    sudo systemctl enable bluetooth
    echo "✓ Bluetooth service started"
    echo ""
}

# Function to install required packages
check_packages() {
    echo "3. Checking required packages..."
    
    # Check if pulseaudio-module-bluetooth is installed
    if ! dpkg -l | grep -q pulseaudio-module-bluetooth; then
        echo "Installing Bluetooth audio support..."
        sudo apt-get update
        sudo apt-get install -y pulseaudio-module-bluetooth
        sudo apt-get install -y bluez-tools
        echo "✓ Packages installed"
    else
        echo "✓ Bluetooth audio packages already installed"
    fi
    echo ""
}

# Main pairing function
pair_headset() {
    echo "4. Starting Bluetooth pairing process..."
    echo ""
    echo "IMPORTANT: Put your headset in PAIRING MODE now!"
    echo "Press Enter when ready..."
    read
    
    echo "Starting bluetoothctl..."
    echo ""
    echo "Follow these steps:"
    echo "1. Type: power on"
    echo "2. Type: agent on"
    echo "3. Type: default-agent"
    echo "4. Type: scan on"
    echo "5. Wait for your headset to appear (look for its name)"
    echo "6. Type: pair XX:XX:XX:XX:XX:XX (headset MAC address)"
    echo "7. Type: trust XX:XX:XX:XX:XX:XX"
    echo "8. Type: connect XX:XX:XX:XX:XX:XX"
    echo "9. Type: quit"
    echo ""
    echo "Starting interactive mode..."
    
    sudo bluetoothctl
}

# Function to set audio output
set_audio_output() {
    echo ""
    echo "5. Setting audio output..."
    echo ""
    
    # Restart PulseAudio
    echo "Restarting PulseAudio..."
    pulseaudio -k
    pulseaudio --start
    sleep 2
    
    # List audio sinks
    echo "Available audio outputs:"
    pactl list short sinks
    echo ""
    
    # Show how to switch
    echo "To set your Bluetooth headset as default:"
    echo "1. Find your headset in the list above"
    echo "2. Run: pactl set-default-sink <headset_name>"
    echo ""
}

# Quick connect script
create_quick_connect() {
    echo "6. Creating quick connect script..."
    
    cat > ~/bluetooth-headset-connect.sh << 'EOF'
#!/bin/bash
# Quick connect to Bluetooth headset

HEADSET_MAC="XX:XX:XX:XX:XX:XX"  # Replace with your headset's MAC

echo "Connecting to Bluetooth headset..."
echo "connect $HEADSET_MAC" | bluetoothctl

# Wait a moment
sleep 3

# Set as default audio
HEADSET_SINK=$(pactl list short sinks | grep bluez | awk '{print $2}')
if [ ! -z "$HEADSET_SINK" ]; then
    pactl set-default-sink "$HEADSET_SINK"
    echo "✓ Headset connected and set as default audio"
else
    echo "⚠️  Headset connected but not set as audio output"
fi
EOF
    
    chmod +x ~/bluetooth-headset-connect.sh
    echo "✓ Created ~/bluetooth-headset-connect.sh"
    echo "Edit it and replace XX:XX:XX:XX:XX:XX with your headset's MAC address"
    echo ""
}

# Troubleshooting function
troubleshoot() {
    echo "7. Troubleshooting tips:"
    echo ""
    echo "If headset won't connect:"
    echo "- Make sure it's in pairing mode"
    echo "- Try: sudo rfkill unblock bluetooth"
    echo "- Try: sudo hciconfig hci0 up"
    echo ""
    echo "If no audio after connecting:"
    echo "- Check: pactl list short sinks"
    echo "- Try: sudo systemctl restart bluetooth"
    echo "- Try: pulseaudio -k && pulseaudio --start"
    echo ""
    echo "To remove old pairing:"
    echo "- bluetoothctl"
    echo "- remove XX:XX:XX:XX:XX:XX"
    echo "- quit"
    echo ""
}

# Main menu
main_menu() {
    while true; do
        echo ""
        echo "What would you like to do?"
        echo "1) Full setup (check status, install packages, pair)"
        echo "2) Just pair headset"
        echo "3) Fix audio output"
        echo "4) Show troubleshooting tips"
        echo "5) Create quick connect script"
        echo "6) Exit"
        echo ""
        read -p "Select option (1-6): " choice
        
        case $choice in
            1)
                check_bluetooth_status
                ensure_bluetooth_running
                check_packages
                pair_headset
                set_audio_output
                create_quick_connect
                ;;
            2)
                pair_headset
                ;;
            3)
                set_audio_output
                ;;
            4)
                troubleshoot
                ;;
            5)
                create_quick_connect
                ;;
            6)
                echo "Good luck with your Bluetooth headset!"
                exit 0
                ;;
            *)
                echo "Invalid option"
                ;;
        esac
    done
}

# Start
main_menu