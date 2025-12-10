# AI Admin Voice Communication Feature

## Overview

The AI Admin now supports **two-way voice communication** with real-time transcription. Users can speak to the AI Admin and hear responses read aloud, making the interface more interactive and accessible.

## Features

### 1. **Voice Input (Speech-to-Text)**
- **Microphone Button**: Start/stop recording voice commands
- **Real-time Transcription**: See live text as you speak
- **Auto-Submit**: Automatically submits request when you stop speaking
- **Browser Support**: Uses Web Speech API (Chrome, Edge, Safari)

### 2. **Voice Output (Text-to-Speech)**
- **Auto-Play**: AI responses automatically read aloud (when enabled)
- **Play/Pause/Stop Controls**: Manual control over audio playback
- **Volume Toggle**: Enable/disable voice output
- **Browser Native**: Uses Web Speech Synthesis API

### 3. **Voice Mode Toggle**
- Easy switch between text and voice modes
- Visual indicator showing current mode
- Listening status indicator

## Architecture

### File Structure

```
src/
├── lib/
│   └── stores/
│       └── voiceAdminStore.ts          # Zustand store for voice state
├── hooks/
│   ├── useSpeechRecognitionAdmin.ts    # Speech-to-text hook
│   └── useTextToSpeechAdmin.ts         # Text-to-speech hook
├── components/
│   ├── AIAdminVoiceInput.tsx           # Microphone & transcription UI
│   └── AIAdminVoiceOutput.tsx          # Audio controls UI
└── app/
    └── dashboard/
        └── ai-admin/
            └── page.tsx                # Updated with voice integration
```

### State Management

**Voice Store** (`voiceAdminStore.ts`):
```typescript
{
  // Recording state
  isRecording: boolean;
  transcript: string;
  interimTranscript: string;
  
  // Playback state
  isPlaying: boolean;
  currentAudioUrl: string | null;
  
  // Settings
  voiceEnabled: boolean;
  autoPlay: boolean;
  voiceMode: boolean;
}
```

### Hooks

#### `useSpeechRecognitionAdmin()`
- Initializes Web Speech API
- Handles real-time transcription
- Manages recording state
- Returns: `{ isRecording, startRecording, stopRecording, toggleRecording, isSupported }`

#### `useTextToSpeechAdmin()`
- Uses browser Speech Synthesis API
- Manages audio playback
- Supports pause/resume/stop
- Returns: `{ speak, stop, pause, resume, isPlaying, isSupported }`

## Usage

### For Users

1. **Enable Voice Mode**
   - Click the "Voice Mode" button in the AI Admin chat
   - Button turns blue when active

2. **Record a Message**
   - Click the microphone button
   - Speak your request
   - See real-time transcription
   - Stop speaking to auto-submit

3. **Listen to Response**
   - If voice is enabled, AI response plays automatically
   - Use Play/Pause/Stop buttons to control playback
   - Click volume icon to toggle audio on/off

### For Developers

#### Import Voice Components
```typescript
import { AIAdminVoiceInput } from "@/components/AIAdminVoiceInput";
import { AIAdminVoiceOutput } from "@/components/AIAdminVoiceOutput";
import { useVoiceAdminStore } from "@/lib/stores/voiceAdminStore";
import { useSpeechRecognitionAdmin } from "@/hooks/useSpeechRecognitionAdmin";
import { useTextToSpeechAdmin } from "@/hooks/useTextToSpeechAdmin";
```

#### Use Voice Store
```typescript
const { voiceMode, setVoiceMode, transcript, clearTranscript } = useVoiceAdminStore();
```

#### Handle Voice Input
```typescript
const { isRecording, toggleRecording } = useSpeechRecognitionAdmin();

// Auto-submit when recording stops
useEffect(() => {
  if (voiceMode && transcript && !isRecording) {
    handleSendMessage(transcript);
    clearTranscript();
  }
}, [isRecording, voiceMode, transcript]);
```

#### Play Voice Response
```typescript
const { speak, stop, pause, resume, isPlaying } = useTextToSpeechAdmin();

// Auto-play response
if (voiceMode && voiceEnabled) {
  speak(aiResponse);
}
```

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Speech Recognition | ✅ | ⚠️ | ✅ | ✅ |
| Speech Synthesis | ✅ | ✅ | ✅ | ✅ |
| Web Audio API | ✅ | ✅ | ✅ | ✅ |

**Note**: Speech Recognition (Web Speech API) works best in Chrome and Edge. Firefox and Safari have limited support.

## Configuration

### Language
Default: English (US)
To change, modify `useSpeechRecognitionAdmin.ts`:
```typescript
recognition.language = 'en-US'; // Change to desired language
```

### Speech Rate
Modify `useTextToSpeechAdmin.ts`:
```typescript
utterance.rate = 1;   // 0.1 to 10
utterance.pitch = 1;  // 0 to 2
utterance.volume = 1; // 0 to 1
```

## Performance Considerations

1. **Audio Processing**: Uses native browser APIs (no server-side processing)
2. **Real-time**: Transcription updates as user speaks
3. **Auto-submit Delay**: 500ms delay to allow final transcription to complete
4. **Memory**: Clears transcript after submission

## Accessibility

- **Keyboard Support**: All buttons are keyboard accessible
- **Screen Readers**: Proper ARIA labels on buttons
- **Visual Feedback**: Clear recording/listening indicators
- **Text Alternative**: Text input always available as fallback

## Troubleshooting

### Speech Recognition Not Working
- **Issue**: Microphone button doesn't respond
- **Solution**: 
  - Check browser compatibility (Chrome/Edge recommended)
  - Verify microphone permissions are granted
  - Ensure HTTPS connection (required for Web APIs)

### Speech Synthesis Not Playing
- **Issue**: No audio output
- **Solution**:
  - Check volume is not muted
  - Verify "Voice Enabled" toggle is on
  - Check browser audio output settings
  - Try different voice (browser default)

### Transcription Accuracy Issues
- **Issue**: Wrong words being transcribed
- **Solution**:
  - Speak clearly and at normal pace
  - Reduce background noise
  - Use shorter phrases
  - Check microphone quality

## Future Enhancements

1. **Custom Voice Selection**: Allow users to choose different voices
2. **Language Support**: Add multi-language support
3. **Whisper API Integration**: Server-side transcription for better accuracy
4. **ElevenLabs Integration**: Higher quality text-to-speech
5. **Voice Commands**: Predefined voice commands for quick actions
6. **Conversation History**: Save voice conversations
7. **Voice Profiles**: Remember user voice preferences

## Security & Privacy

- **Local Processing**: All audio processing happens in the browser
- **No Recording**: Audio is not stored or sent to servers
- **Microphone Permission**: Users must grant permission
- **HTTPS Only**: Web APIs require secure connection

## Testing

### Manual Testing Checklist
- [ ] Voice mode toggle works
- [ ] Microphone button starts/stops recording
- [ ] Real-time transcription displays
- [ ] Auto-submit triggers on silence
- [ ] AI response plays automatically
- [ ] Play/pause/stop controls work
- [ ] Volume toggle works
- [ ] Works in different browsers
- [ ] Fallback to text mode works

### Browser Testing
```bash
# Test in Chrome
# Test in Firefox
# Test in Safari
# Test in Edge
```

## Deployment Notes

1. **Ensure HTTPS**: Web Speech APIs require secure context
2. **Microphone Permissions**: Users will see permission prompt
3. **Browser Support**: Graceful fallback to text mode if not supported
4. **No Backend Changes**: Voice features are client-side only
5. **No New Dependencies**: Uses browser native APIs

## Support

For issues or questions:
1. Check browser console for errors
2. Verify browser compatibility
3. Test with different microphone
4. Try disabling browser extensions
5. Clear browser cache and reload

## References

- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Speech Recognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [Speech Synthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
