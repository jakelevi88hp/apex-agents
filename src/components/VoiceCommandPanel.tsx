'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Loader2, Sparkles } from 'lucide-react';

/**
 * Shape of the server response describing the interpreted command.
 */
interface ParsedCommand {
  action: 'respond' | 'get_dashboard_metrics' | 'run_agent';
  summary: string;
  commandText: string;
  arguments?: {
    agentId?: string;
    agentName?: string;
    input?: string;
  };
}

/**
 * Shape of the data returned from the voice command API.
 */
interface VoiceCommandResponse {
  success?: boolean;
  transcript: string;
  command: ParsedCommand;
  result: Record<string, unknown>;
  error?: string;
}

/**
 * VoiceCommandPanel renders a microphone button and displays the interpreted command results.
 *
 * @returns {JSX.Element} Interactive panel for capturing and executing voice commands.
 */
export function VoiceCommandPanel(): JSX.Element {
  // Track recording state to update the button label and styling.
  const [isRecording, setIsRecording] = useState(false);
  // Track when the API call is running to disable repeated submissions.
  const [isProcessing, setIsProcessing] = useState(false);
  // Persist the most recent transcript returned by Whisper.
  const [transcript, setTranscript] = useState<string | null>(null);
  // Store the structured command returned from GPT reasoning.
  const [command, setCommand] = useState<ParsedCommand | null>(null);
  // Keep execution results (metrics, agent output, etc.) to show in the UI.
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  // Capture friendly error messages for display.
  const [error, setError] = useState<string | null>(null);

  // Hold onto the MediaRecorder instance so we can stop it later.
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // Accumulate audio data chunks emitted by the recorder.
  const audioChunksRef = useRef<Blob[]>([]);

  /**
   * Handle unexpected failures by logging them and showing a readable message.
   *
   * @param {unknown} caughtError - The caught error from any async operation.
   */
  function handleError(caughtError: unknown): void {
    // Emit the error to the console for debugging and monitoring.
    console.error('[VoiceCommandPanel] Error capturing voice command:', caughtError);
    // Update local state so the UI can show an alert message.
    setError(
      caughtError instanceof Error
        ? caughtError.message
        : 'Something went wrong while handling your voice command.',
    );
  }

  /**
   * Send the recorded audio to the backend for transcription, reasoning, and execution.
   *
   * @param {Blob} audioBlob - The audio data captured from the microphone.
   */
  async function submitAudio(audioBlob: Blob): Promise<void> {
    // Mark the request as in-flight so the UI can show a spinner.
    setIsProcessing(true);
    // Reset previous results to avoid showing stale data.
    setTranscript(null);
    setCommand(null);
    setResult(null);
    setError(null);

    try {
      // Wrap the Blob in a File so FormData sends a meaningful filename and MIME type.
      const audioFile = new File([audioBlob], 'voice-command.webm', { type: 'audio/webm' });
      // Prepare multipart/form-data payload expected by the API route.
      const formData = new FormData();
      formData.append('audio', audioFile);

      // Retrieve the authentication token saved in localStorage.
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      // Build the request headers, optionally including the Authorization header.
      const headers: Record<string, string> = {};
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }

      // Post the audio to the server for transcription and reasoning.
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers,
        body: formData,
      });

      // Parse the JSON payload regardless of success to capture error messages.
      const payload = (await response.json()) as VoiceCommandResponse;

      if (!response.ok) {
        // Forward server-side error details to the UI.
        throw new Error(payload.error || 'Voice command processing failed.');
      }

      // Save the transcription so the user can confirm what Whisper heard.
      setTranscript(payload.transcript);
      // Store the reasoning layer output to describe the action that will happen.
      setCommand(payload.command);
      // Keep the execution result for display (metrics, agent output, etc.).
      setResult(payload.result);
    } catch (caughtError) {
      // Handle any network, parsing, or server errors gracefully.
      handleError(caughtError);
    } finally {
      // Ensure the spinner disappears after the call finishes.
      setIsProcessing(false);
    }
  }

  /**
   * Start capturing audio from the user's microphone.
   */
  async function startRecording(): Promise<void> {
    try {
      // Request microphone access from the browser.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Create a new MediaRecorder for the granted stream.
      const mediaRecorder = new MediaRecorder(stream);
      // Clear any previous audio chunks before starting a new recording.
      audioChunksRef.current = [];

      // Append new audio data as the recorder emits it.
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // When recording stops, combine the chunks and send them to the server.
      mediaRecorder.onstop = async () => {
        // Close the input stream to release the microphone.
        stream.getTracks().forEach((track) => track.stop());
        // Create a Blob that contains the entire recording.
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Submit the audio for transcription and reasoning.
        await submitAudio(audioBlob);
      };

      // Begin recording and save the recorder reference for later.
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      // Update UI states to reflect a clean start.
      setError(null);
      setTranscript(null);
      setCommand(null);
      setResult(null);
    } catch (caughtError) {
      // Propagate permission or hardware issues to the UI.
      handleError(caughtError);
      setIsRecording(false);
    }
  }

  /**
   * Stop the active recording session and trigger the upload workflow.
   */
  function stopRecording(): void {
    // Guard against situations where the recorder never initialised.
    if (!mediaRecorderRef.current) {
      return;
    }

    // Stop the recorder; the onstop handler will submit the audio.
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  }

  /**
   * Toggle between starting and stopping the microphone recording.
   */
  function handleToggleRecording(): void {
    // Decide whether to start or stop based on the current state.
    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  }

  return (
    <div className="mb-8 rounded-lg border border-purple-500/40 bg-gray-900/80 p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Voice Commands</h2>
          <p className="text-sm text-gray-400">
            Speak to Apex Agents, and we will transcribe, understand, and act on your request.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleRecording}
          disabled={isProcessing}
          className={`flex items-center gap-2 rounded-full px-5 py-2 font-medium transition
            ${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-purple-600 text-white hover:bg-purple-500'}
            ${isProcessing ? 'opacity-60' : ''}`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing…
            </>
          ) : isRecording ? (
            <>
              <Square className="h-5 w-5" />
              Stop
            </>
          ) : (
            <>
              <Mic className="h-5 w-5" />
              Start Talking
            </>
          )}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-gray-700 bg-gray-800/70 p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-purple-300">
            <Sparkles className="h-4 w-4" />
            Transcript
          </h3>
          <div className="text-sm text-gray-300">
            {transcript ? (
              <p>{transcript}</p>
            ) : (
              <p className="italic text-gray-500">
                {isRecording
                  ? 'Recording in progress…'
                  : 'Press the button and speak clearly to issue a command.'}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-md border border-gray-700 bg-gray-800/70 p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-purple-300">
            <Sparkles className="h-4 w-4" />
            Interpretation
          </h3>
          <div className="space-y-2 text-sm text-gray-300">
            {command ? (
              <>
                <p>
                  <span className="font-semibold text-purple-200">Summary:</span> {command.summary}
                </p>
                <p>
                  <span className="font-semibold text-purple-200">Action:</span> {command.action}
                </p>
                {command.arguments ? (
                  <pre className="rounded bg-black/40 p-2 text-xs text-gray-200">
                    {JSON.stringify(command.arguments, null, 2)}
                  </pre>
                ) : (
                  <p className="italic text-gray-500">No structured arguments required.</p>
                )}
              </>
            ) : (
              <p className="italic text-gray-500">
                The command interpretation will appear here after processing.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-gray-700 bg-gray-800/70 p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-purple-300">
          <Sparkles className="h-4 w-4" />
          Result
        </h3>
        {error ? (
          <p className="rounded bg-red-500/20 p-3 text-sm text-red-200">{error}</p>
        ) : result ? (
          <pre className="rounded bg-black/40 p-3 text-xs text-gray-200">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-gray-500">
            Execution results will appear once a voice command has been processed.
          </p>
        )}
      </div>
    </div>
  );
}

export default VoiceCommandPanel;

