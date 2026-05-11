import { useState } from 'react';
import { User, Activity, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import type { Message } from './ChatMessage';
import { getEmotionColor, getEmotionIcon } from './EmotionAnalyzer';

type EmotionType = 'neutral' | 'happy' | 'fearful' | 'angry' | 'sad';

interface EmotionData {
  emotion: EmotionType;
  stressLevel: number;
}

interface SidebarProps {
  messages: Message[];
  onNavigateToHistory: () => void;
  isHistoryView: boolean;
  userEmail: string; // NEW: Passed in from App.tsx
}

export function Sidebar({ messages, onNavigateToHistory, isHistoryView, userEmail }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Type-safe filter (removes need for !)
  const userMessages = messages.filter(
    (m): m is Message & { emotion: EmotionData } =>
      m.sender === 'user' && !!m.emotion
  );

  const latestMessage = userMessages[userMessages.length - 1];

  const currentStress =
    latestMessage?.emotion
      ? latestMessage.emotion.stressScore / 10
      : 0;

  const currentEmotion: EmotionType =
    latestMessage?.emotion.emotion ?? 'neutral';

  const stressValues = userMessages
    .filter(m => m.emotion && typeof m.emotion.stressScore === "number")
    .map(m => m.emotion!.stressScore / 10);

  const avgStress =
    stressValues.length > 0
      ? stressValues.reduce((a, b) => a + b, 0) / stressValues.length
      : 0;

  const emotionCounts: Record<EmotionType, number> = {
    neutral: 0,
    happy: 0,
    fearful: 0,
    angry: 0,
    sad: 0
  };

  userMessages.forEach((m) => {
    emotionCounts[m.emotion.emotion] += 1;
  });

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white border-r flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="mb-4"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>

        <button
          onClick={onNavigateToHistory}
          className={`p-3 rounded-lg transition-colors ${
            isHistoryView ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
          }`}
          title="Stress History"
        >
          <History className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white/90 backdrop-blur-sm border-r border-purple-100 flex flex-col h-full overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
        <h2 className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Student Profile
        </h2>
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(true)}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Student Account Section (CLEANED UP!) */}
        <Card className="p-4 bg-gradient-to-br from-purple-50/50 to-blue-50/50 border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-md shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 overflow-hidden">
              <Label className="text-xs text-gray-600">Student Account</Label>
              <p className="font-semibold text-gray-900 truncate" title={userEmail}>
                {userEmail || "Student"}
              </p>
            </div>
          </div>
        </Card>

        {/* Current Stress Level */}
        <Card className="p-4 bg-gradient-to-br from-blue-50/50 to-teal-50/50 border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Current Status</h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Stress Level</span>
                <span className="text-sm font-semibold">
                  {currentStress.toFixed(1)}/10
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${(currentStress / 10) * 100}%`,
                    backgroundColor: getEmotionColor(currentEmotion)
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-gray-100">
              <span className="text-2xl">
                {getEmotionIcon(currentEmotion)}
              </span>
              <div>
                <p className="text-xs text-gray-600">Current Emotion</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {currentEmotion}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Emotion Distribution */}
        {userMessages.length > 0 && (
          <Card className="p-4 bg-gradient-to-br from-teal-50/50 to-green-50/50 border-teal-100">
            <h3 className="font-semibold text-gray-900 mb-3">
              Emotion Overview
            </h3>
            <div className="space-y-2">
              {(Object.keys(emotionCounts) as EmotionType[]).map((emotion) => {
                const count = emotionCounts[emotion];
                const percentage =
                  userMessages.length > 0
                    ? (count / userMessages.length) * 100
                    : 0;

                return (
                  <div key={emotion}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {getEmotionIcon(emotion)}
                        </span>
                        <span className="text-sm capitalize text-gray-700">
                          {emotion}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600">
                        {count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getEmotionColor(emotion)
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Average Stress */}
        {userMessages.length > 0 && (
          <Card className="p-4 border-purple-100">
            <h3 className="font-semibold text-gray-900 mb-3">
              Session Summary
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Average Stress
                </span>
                <span className="font-semibold">
                  {avgStress.toFixed(1)}/10
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Total Messages
                </span>
                <span className="font-semibold">
                  {userMessages.length}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Navigation */}
        <Button
          onClick={onNavigateToHistory}
          variant={isHistoryView ? 'default' : 'outline'}
          className={
            isHistoryView
              ? 'w-full gap-2 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500'
              : 'w-full gap-2 border-purple-200 hover:bg-purple-50'
          }
        >
          <History className="w-4 h-4" />
          View Stress History
        </Button>
      </div>
    </div>
  );
}