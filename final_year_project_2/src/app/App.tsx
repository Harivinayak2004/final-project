import { useState, useEffect } from 'react';
import { MessageCircle, LogOut, Sparkles } from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';
import { StressHistory } from './components/StressHistory';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/LoginPage';
import { Button } from './components/ui/button';
import type { Message } from './components/ChatMessage';
// IMPORTANT: Make sure this path points to your message.ts file correctly!
import { saveMessage, loadMessages } from '../utils/supabase/message';
import { getWelcomeMessage } from './components/BotResponses';
import { getStoredSession, clearSession } from '../utils/supabase/client';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(''); // NEW: Track userId for database operations
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const session = getStoredSession();
    if (session && session.userId) {
      setIsAuthenticated(true);
      setUserEmail(session.email);
      setUserId(session.userId);
    }
    setCheckingAuth(false);
  }, []);

  // Load messages from Supabase when user authenticates
  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const dbMessages = await loadMessages(userId);
        
        if (dbMessages && dbMessages.length > 0) {
          setMessages(dbMessages);
        } else {
          // Add welcome message for new users
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            text: getWelcomeMessage(),
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages([welcomeMessage]);
          await saveMessage(welcomeMessage, userId); // Save welcome message to DB
        }
      } catch (error) {
        console.error('Error fetching from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [isAuthenticated, userId]);

  const handleLoginSuccess = (userId: string, email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setUserId(userId);
  };

  const handleLogout = async () => {
    clearSession();
    setIsAuthenticated(false);
    setUserEmail('');
    setUserId('');
    setMessages([]);
    setActiveTab('chat');
  };

  const handleSendMessage = async (payload: string) => {
    let parsed;

    try {
      parsed = JSON.parse(payload);
    } catch {
      parsed = { text: payload };
    }

    const { text, audio } = parsed;

    // --------------------------------
    // 1️⃣ Add user message to chat & DB
    // --------------------------------
    if (text && !audio) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: text,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      if (userId) await saveMessage(userMessage, userId);
    }

    // --------------------------------
    // 2️⃣ If audio → run stress inference
    // --------------------------------
    if (audio) {
      setIsLoading(true);
      
      // ESSENTIAL CHANGE 1: Create a temporary ID
      const tempMessageId = Date.now().toString();

      // ESSENTIAL CHANGE 2: Show audio player immediately before backend finishes
      const initialAudioMessage: Message = {
        id: tempMessageId,
        text: "Transcribing audio...", // Temporary text while loading
        audio: audio, // Keep the audio URL
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, initialAudioMessage]);

      try {
        const blob = await fetch(audio).then((r) => r.blob());
        const formData = new FormData();
        formData.append("file", blob, "recording.webm");

        const response = await fetch("http://localhost:8000/predict", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          
          // CRASH PREVENTION: Handle early crisis return from main.py audio check
          if (result.crisis) {
            const crisisBotMessage: Message = {
              id: Date.now().toString(),
              text: result.reply,
              sender: "bot",
              timestamp: new Date(),
              crisis: true
            };
            setMessages((prev) => [...prev, crisisBotMessage]);
            if (userId) await saveMessage(crisisBotMessage, userId);
            setIsLoading(false);
            return;
          }

          const { stress_score, stress_level, emotion, transcript, intent } = result.data;

          // ESSENTIAL CHANGE 3: Update the initial message with the transcript, keeping the audio
          const updatedUserMessage: Message = {
            ...initialAudioMessage,
            text: transcript,
            emotion: {
              emotion: emotion,
              stressScore: stress_score,
              stressLevel: stress_level
            }
          };

          setMessages(prev => prev.map(msg => msg.id === tempMessageId ? updatedUserMessage : msg));
          if (userId) await saveMessage(updatedUserMessage, userId); // Save combined message to DB

          // 🟢 2. Call GPT backend
          const chatResponse = await fetch("http://localhost:8000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transcript, emotion, stress_score, stress_level, intent
            }),
          });

          const chatResult = await chatResponse.json();
          
          // 🟢 3. Add BOT message
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: chatResult.reply,
            sender: "bot",
            timestamp: new Date(),
            crisis: chatResult.crisis || false
          };

          setMessages(prev => [...prev, botMessage]);
          if (userId) await saveMessage(botMessage, userId); // Save to DB
        }
      } catch (error) {
        console.error("Prediction failed:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // --------------------------------
    // 3️⃣ If TEXT → send directly to chat API
    // --------------------------------
    if (text) {
      setIsLoading(true);

      try {
        const chatResponse = await fetch("http://localhost:8000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: text,
            emotion: "neutral",
            stress_score: 0,
            stress_level: 0,
            intent: "conversation"
          }),
        });

        const chatResult = await chatResponse.json();

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: chatResult.reply,
          sender: "bot",
          timestamp: new Date(),
          crisis: chatResult.crisis || false
        };

        setMessages(prev => [...prev, botMessage]);
        if (userId) await saveMessage(botMessage, userId); // Save to DB

      } catch (error) {
        console.error("Chat failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 rounded-2xl flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-purple-50/30 via-blue-50/30 to-teal-50/30">
      {/* Sidebar */}
      <Sidebar
        messages={messages}
        onNavigateToHistory={() => setActiveTab('history')}
        isHistoryView={activeTab === 'history'}
        userEmail={userEmail} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                    MindCare
                  </h1>
                  <p className="text-sm text-gray-600">
                    AI-Powered Mental Wellness Platform
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-full border border-purple-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{userEmail}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      activeTab === 'chat'
                        ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      activeTab === 'history'
                        ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    History
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? (
            <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
          ) : (
            <StressHistory messages={messages} />
          )}
        </main>

       {/* Loading indicator */}
        {isLoading && activeTab === 'chat' && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-purple-100">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm text-gray-600">Analyzing...</span>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}

export default App;