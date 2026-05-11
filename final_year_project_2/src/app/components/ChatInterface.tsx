import { useEffect, useRef } from 'react';
import { ChatMessage, type Message } from './ChatMessage';
import { MessageInput } from './MessageInput';
import { Bot } from 'lucide-react';
import { CopingActions } from "./CopingActions";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export function ChatInterface({ messages, onSendMessage }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50/20 via-blue-50/20 to-teal-50/20">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-green-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-3">
                Welcome to MindCare
              </h2>
              <p className="text-gray-700 max-w-md mb-6 leading-relaxed">
                I'm your AI wellness companion, here to support your mental health journey with 
                personalized guidance and evidence-based coping strategies.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 max-w-2xl">
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-purple-100">
                  <div className="text-2xl mb-2">🗣️</div>
                  <p className="text-sm font-medium text-gray-700">Speech & Text Input</p>
                  <p className="text-xs text-gray-600 mt-1">Express yourself your way</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-blue-100">
                  <div className="text-2xl mb-2">🧘</div>
                  <p className="text-sm font-medium text-gray-700">Coping Strategies</p>
                  <p className="text-xs text-gray-600 mt-1">Breathing & mindfulness</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-teal-100">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-sm font-medium text-gray-700">Track Progress</p>
                  <p className="text-xs text-gray-600 mt-1">Monitor your wellness</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                // Calculate the 0-10 UI scaled score dynamically
                const uiStressLevel = message.emotion?.stressScore ? message.emotion.stressScore / 10 : 0;
                
                // Only show CopingActions if there is an actual spike (>= 2.5) or a crisis
                const hasStressSpike = uiStressLevel >= 2.5 || message.crisis;

                return (
                  <div key={message.id}>
                    <ChatMessage message={message} />

                    {/* Instantly trigger CopingActions on ANY user message that has a spike! */}
                    {message.sender === "user" && message.emotion && hasStressSpike && (
                      <CopingActions
                        stressLevel={uiStressLevel}
                        crisis={message.crisis}
                      />
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>
      
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
}