#!/bin/bash
# Quick connect to AfterShokz OpenComm

HEADSET_MAC="20:74:CF:74:76:DD"
HEADSET_NAME="OpenComm by AfterShokz"

echo "🎧 Connecting to $HEADSET_NAME..."

# Connect via bluetoothctl
echo "connect $HEADSET_MAC" | sudo bluetoothctl

# Wait for connection
sleep 3

# Set as default audio
HEADSET_SINK=$(pactl list short sinks | grep bluez | grep $HEADSET_MAC | awk '{print $2}')
if [ ! -z "$HEADSET_SINK" ]; then
    pactl set-default-sink "$HEADSET_SINK"
    echo "✓ AfterShokz connected and set as default audio!"
else
    echo "⚠️  Trying to set audio output..."
    sleep 2
    HEADSET_SINK=$(pactl list short sinks | grep bluez | grep $HEADSET_MAC | awk '{print $2}')
    if [ ! -z "$HEADSET_SINK" ]; then
        pactl set-default-sink "$HEADSET_SINK"
        echo "✓ AfterShokz audio output configured!"
    fi
fi

echo ""
echo "Test audio with: speaker-test -t wav -c 2"