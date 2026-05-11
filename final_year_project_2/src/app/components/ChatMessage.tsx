import { Bot, User } from 'lucide-react';
import type { EmotionResult } from './EmotionAnalyzer';
import { getEmotionColor } from './EmotionAnalyzer';

export interface Message {
  id: string;
  text?: string;
  audio?: string;
  sender: 'user' | 'bot';
  timestamp: Date;

  emotion?: {
    emotion: string;
    stressScore: number;
    stressLevel: number;
  };

  crisis?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md mt-1 ${
          isUser 
            ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
            : 'bg-gradient-to-br from-teal-500 to-green-500'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>
      
      {/* Changed to flex-col with gap-2 so Audio and Text stack nicely */}
      <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
        
        {/* 1. AUDIO BUBBLE (Separated) */}
        {message.audio && (
          <div
            className={`rounded-full shadow-sm p-1 ${
              isUser
                ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                : 'bg-white border border-gray-100'
            }`}
          >
            {/* The white background on the audio tag makes the outer div look like a colorful border */}
            <audio 
              controls 
              src={message.audio} 
              className="w-64 max-w-full rounded-full bg-white" 
            />
          </div>
        )}

        {/* 2. TEXT BUBBLE (Separated) */}
        {message.text && (
          <div
            className={`rounded-2xl shadow-sm px-4 py-2 ${
              isUser
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-sm'
                : 'bg-white text-gray-900 rounded-bl-sm border border-gray-100'
            }`}
          >
            <p className="text-sm leading-relaxed">{message.text}</p>
          </div>
        )}

        {/* 3. CRISIS BUBBLE */}
        {message.crisis && (
          <div className="mt-2 bg-red-50 p-4 rounded-xl text-center border border-red-200">
            <h3 className="font-semibold text-lg">You are not alone ❤️</h3>
            <p className="text-sm mt-1">
              It sounds like you're going through a very difficult moment.
              Please consider reaching out to a trained listener right now.
            </p>
            <img
              src="/helpline.jpeg"
              alt="iCALL Mental Health Helpline"
              className="mx-auto mt-3 rounded shadow w-64"
            />
            <p className="font-semibold mt-3">
              iCALL Mental Health Helpline (India)
            </p>
            <p className="text-sm mt-1">🌐 Official Website</p>
            <a
              href="https://icallhelpline.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
            >
              https://icallhelpline.org/
            </a>
            <p className="text-sm mt-2">
              You deserve support. Talking to a real person can help.
            </p>
          </div>
        )}
        
        {/* TIMESTAMP */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
}