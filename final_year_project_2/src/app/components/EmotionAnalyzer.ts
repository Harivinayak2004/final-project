// Simulated emotion and stress detection based on text content


export interface EmotionResult {
  emotion: 'neutral' | 'happy' | 'fearful' | 'angry' | 'sad';
  stressLevel: number; // 0-10 scale
  confidence: number; // 0-1 scale
}

// Keywords associated with different emotions and stress levels
const stressKeywords = [
  'stressed', 'anxiety', 'anxious', 'worried', 'overwhelmed', 'panic',
  'exhausted', 'tired', 'pressure', 'deadline', 'exam', 'test',
  'difficult', 'hard', 'struggling', 'can\'t', 'nervous', 'scared',
  'depressed', 'sad', 'alone', 'lonely', 'crying', 'upset'
];

const calmKeywords = [
  'calm', 'relaxed', 'peaceful', 'happy', 'good', 'great',
  'fine', 'okay', 'better', 'well', 'confident', 'excited',
  'grateful', 'thankful', 'wonderful', 'amazing', 'excellent'
];

const fearKeywords = [
  'afraid', 'scared', 'terrified', 'frightened', 'fear', 'panic',
  'worried', 'nervous', 'anxious', 'threatened'
];

const angerKeywords = [
  'angry', 'mad', 'furious', 'annoyed', 'irritated', 'frustrated',
  'hate', 'rage', 'pissed', 'infuriated'
];

const sadKeywords = [
  'sad', 'depressed', 'crying', 'upset', 'miserable', 'hopeless',
  'lonely', 'alone', 'hurt', 'disappointed'
];

const happyKeywords = [
  'happy', 'joy', 'excited', 'great', 'wonderful', 'amazing',
  'fantastic', 'excellent', 'thrilled', 'delighted', 'cheerful'
];

export function analyzeEmotion(text: string): EmotionResult {
  const lowerText = text.toLowerCase();
  
  // Count emotion-specific keywords
  let fearCount = 0;
  let angerCount = 0;
  let sadCount = 0;
  let happyCount = 0;
  let stressCount = 0;
  
  fearKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) fearCount++;
  });
  
  angerKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) angerCount++;
  });
  
  sadKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) sadCount++;
  });
  
  happyKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) happyCount++;
  });
  
  stressKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) stressCount++;
  });
  
  // Determine primary emotion based on keyword counts
  const emotionCounts = {
    fearful: fearCount,
    angry: angerCount,
    sad: sadCount,
    happy: happyCount
  };
  
  let emotion: EmotionResult['emotion'] = 'neutral';
  let maxCount = 0;
  
  Object.entries(emotionCounts).forEach(([key, count]) => {
    if (count > maxCount) {
      maxCount = count;
      emotion = key as EmotionResult['emotion'];
    }
  });
  
  // Calculate stress level (0-10)
  let stressLevel = 5; // neutral baseline
  
  if (emotion === 'happy') {
    stressLevel = Math.max(0, 3 - happyCount);
  } else if (emotion === 'fearful') {
    stressLevel = Math.min(10, 6 + fearCount * 1.5);
  } else if (emotion === 'angry') {
    stressLevel = Math.min(10, 6 + angerCount * 1.3);
  } else if (emotion === 'sad') {
    stressLevel = Math.min(10, 5 + sadCount * 1.5);
  } else if (stressCount > 0) {
    stressLevel = Math.min(10, 5 + stressCount * 1.2);
  }
  
  // Calculate confidence based on keyword matches
  const totalKeywords = fearCount + angerCount + sadCount + happyCount + stressCount;
  const confidence = Math.min(1, 0.5 + (totalKeywords * 0.15));
  
  return {
    emotion,
    stressLevel: Math.round(stressLevel * 10) / 10,
    confidence: Math.round(confidence * 100) / 100
  };
}

export function getEmotionColor(emotion: EmotionResult['emotion']): string {
  switch (emotion) {
    case 'angry':
      return '#ef4444'; // red
    case 'fearful':
      return '#a855f7'; // purple
    case 'sad':
      return '#3b82f6'; // blue
    case 'happy':
      return '#22c55e'; // green
    default:
      return '#64748b'; // slate
  }
}

export function getStressLevelColor(stressLevel: number): string {
  if (stressLevel >= 8) return '#ef4444'; // red
  if (stressLevel >= 6) return '#f59e0b'; // orange
  if (stressLevel >= 4) return '#eab308'; // yellow
  if (stressLevel >= 2) return '#10b981'; // green
  return '#22c55e'; // bright green
}

export function getEmotionIcon(emotion: EmotionResult['emotion']): string {
  switch (emotion) {
    case 'happy':
      return '😊';
    case 'sad':
      return '😢';
    case 'angry':
      return '😠';
    case 'fearful':
      return '😰';
    default:
      return '😐';
  }
}