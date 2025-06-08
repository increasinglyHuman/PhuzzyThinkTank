# Bluetooth Audio Setup Guide

## Step 1: Start Bluetooth Control
```bash
bluetoothctl
```

## Step 2: In bluetoothctl, run these commands:

### Enable agent and make it default
```
agent on
default-agent
```

### Turn on Bluetooth and make it discoverable
```
power on
discoverable on
```

### Start scanning for devices
```
scan on
```

### Put your headphones in pairing mode
- Check your headphones manual for pairing instructions
- Usually involves holding the power button for several seconds
- Look for blinking LED

### Look for your device in the list
- It will show as: [NEW] Device XX:XX:XX:XX:XX:XX DeviceName
- Note the MAC address (XX:XX:XX:XX:XX:XX)

### Pair with your device
```
pair XX:XX:XX:XX:XX:XX
```

### Trust the device
```
trust XX:XX:XX:XX:XX:XX
```

### Connect to the device
```
connect XX:XX:XX:XX:XX:XX
```

### Exit bluetoothctl
```
exit
```

## Step 3: Test Audio
```bash
ffplay -nodisp -autoexit -t 2 data/audio-recording-voices-for-scenarios-from-elevenlabs/scenario-999/title.mp3
```

## Troubleshooting

### If no audio after connecting:
1. Install PulseAudio Bluetooth module:
```bash
sudo apt install pulseaudio-module-bluetooth
pulseaudio -k
pulseaudio --start
```

2. Check audio output:
```bash
pactl list sinks short
```

3. Set Bluetooth as default:
```bash
pactl set-default-sink bluez_sink.XX_XX_XX_XX_XX_XX.a2dp_sink
```
(Replace XX_XX_XX_XX_XX_XX with your device's MAC address using underscores)

### Common Issues:
- Make sure headphones are in pairing mode
- Some headphones need to be "forgotten" first if previously paired
- Check battery level on headphones
- Try moving closer to the Raspberry Pi