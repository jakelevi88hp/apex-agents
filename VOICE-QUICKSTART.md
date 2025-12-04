# Voice Feature Quick Start

## For Users

### Enable Voice Mode
1. Go to AI Admin dashboard
2. Click the **"Voice Mode"** button (blue button with microphone icon)
3. Button will turn blue to indicate voice mode is active

### Use Voice Input
1. Click the **microphone button** (red when recording)
2. **Speak your request clearly**
3. See real-time transcription appear
4. **Stop speaking** - request auto-submits automatically
5. AI response appears in chat

### Listen to Response
1. AI response **plays automatically** (if voice is enabled)
2. Use **Play/Pause/Stop** buttons to control playback
3. Click **volume icon** to toggle audio on/off

### Switch Back to Text
1. Click the **"Text Mode"** button
2. Type your request normally
3. Press Enter or click Send button

## For Developers

### Quick Integration

```typescript
// Import components
import { AIAdminVoiceInput } from "@/components/AIAdminVoiceInput";
import { AIAdminVoiceOutput } from "@/components/AIAdminVoiceOutput";
import { useVoiceAdminStore } from "@/lib/stores/voiceAdminStore";

// Use in component
export function MyComponent() {
  const { voiceMode, transcript } = useVoiceAdminStore();
  
  return (
    <>
      {voiceMode && <AIAdminVoiceInput />}
      <AIAdminVoiceOutput text={response} />
    </>
  );
}
```

### Handle Voice Input

```typescript
const { voiceMode, transcript, clearTranscript } = useVoiceAdminStore();
const { isRecording } = useSpeechRecognitionAdmin();

useEffect(() => {
  if (voiceMode && transcript && !isRecording) {
    // Auto-submit voice input
    handleSendMessage(transcript);
    clearTranscript();
  }
}, [isRecording, voiceMode, transcript]);
```

### Play Voice Response

```typescript
const { speak, isPlaying } = useTextToSpeechAdmin();
const { voiceEnabled } = useVoiceAdminStore();

// Auto-play response
if (voiceEnabled) {
  speak(aiResponse);
}
```

## Troubleshooting

### Microphone Not Working
- ✅ Check browser is Chrome/Edge/Safari
- ✅ Grant microphone permission
- ✅ Check microphone is connected
- ✅ Ensure HTTPS connection

### No Audio Output
- ✅ Check volume is not muted
- ✅ Verify voice is enabled (click volume icon)
- ✅ Check browser audio settings
- ✅ Try different browser

### Transcription Inaccurate
- ✅ Speak clearly and slowly
- ✅ Reduce background noise
- ✅ Use shorter phrases
- ✅ Check microphone quality

## Browser Support

| Browser | Voice Input | Voice Output |
|---------|-------------|--------------|
| Chrome  | ✅ Yes      | ✅ Yes       |
| Firefox | ⚠️ Limited  | ✅ Yes       |
| Safari  | ✅ Yes      | ✅ Yes       |
| Edge    | ✅ Yes      | ✅ Yes       |

## Files Added

```
src/
├── components/
│   ├── AIAdminVoiceInput.tsx      # Microphone & transcription
│   └── AIAdminVoiceOutput.tsx     # Audio controls
├── hooks/
│   ├── useSpeechRecognitionAdmin.ts   # Speech-to-text
│   └── useTextToSpeechAdmin.ts        # Text-to-speech
└── lib/stores/
    └── voiceAdminStore.ts         # State management
```

## Key Features

✅ **Real-time Transcription** - See text as you speak
✅ **Auto-Submit** - Automatically sends when you stop speaking
✅ **Auto-Play** - AI responses read aloud automatically
✅ **Easy Toggle** - Switch between voice and text modes
✅ **No Setup** - Works out of the box, no configuration needed
✅ **Browser Native** - Uses standard Web APIs
✅ **Accessible** - Keyboard accessible, screen reader friendly

## Next Steps

1. **Test the feature** - Try voice mode in AI Admin
2. **Provide feedback** - Report any issues
3. **Share with users** - Let team know it's available
4. **Monitor usage** - Track adoption and feedback

## Support

For help:
1. Check browser console (F12)
2. Read VOICE-FEATURE-GUIDE.md
3. Try different browser
4. Check microphone permissions

---

**Ready to use!** No additional setup required.
