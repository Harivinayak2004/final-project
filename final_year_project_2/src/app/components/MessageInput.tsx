import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, AlertCircle, X } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
    };
  }, []);

  const handleSend = () => {
    if (disabled) return;

    const trimmed = message.trim();
    if (!trimmed && !chunksRef.current.length) return;

    let audioUrl: string | undefined;

    if (chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      audioUrl = URL.createObjectURL(blob);
    }

    onSendMessage(
      JSON.stringify({
        text: trimmed || undefined,
        audio: audioUrl || undefined,
      })
    );

    setMessage("");
    setAudioURL(null);
    chunksRef.current = [];
    textareaRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      mediaRecorderRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          chunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioURL(url);
        };

        mediaRecorder.start();
        setIsListening(true);
        setPermissionError(false);

      } catch (error) {
        console.error('Microphone access denied:', error);
        setPermissionError(true);
      }
    }
  };

  const cancelRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    chunksRef.current = [];
  };

  return (
    <div className="border-t bg-white/80 backdrop-blur-sm p-4 border-purple-100">
      <div className="flex gap-2 max-w-4xl mx-auto">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message or use voice input..."
          className="resize-none min-h-[44px] max-h-32 bg-white border-purple-200 focus:border-purple-400"
          disabled={disabled || isListening}
          rows={1}
        />

        {speechSupported && (
          <Button
            onClick={toggleListening}
            disabled={disabled}
            variant={isListening ? "default" : "outline"}
            size="icon"
            className={
              isListening
                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg'
                : 'border-purple-200 hover:bg-purple-50'
            }
          >
            {isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        )}

        <Button
          onClick={handleSend}
          disabled={(!message.trim() && !audioURL) || disabled || isListening}
          size="icon"
          className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 shadow-lg"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {isListening && (
        <p className="text-center text-sm text-purple-600 mt-2 animate-pulse font-medium">
          🎤 Recording... Click again to stop
        </p>
      )}

      {permissionError && (
        <p className="text-center text-sm text-red-500 mt-2 font-medium">
          <AlertCircle className="inline-block h-4 w-4 mr-1" />
          Permission denied for microphone access
        </p>
      )}

      {audioURL && (
        <div className="mt-4 flex flex-col items-center gap-2">

          {/* Close button ABOVE preview */}
          <button
            onClick={cancelRecording}
            className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Remove recording
          </button>

          {/* Audio preview */}
          <audio controls src={audioURL} className="shadow rounded-md" />

        </div>
      )}
    </div>
  );
}