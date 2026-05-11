import { generateAIResponse } from '../../utils/openai/generateResponse';

export interface StressAnalysisResult {
  transcript: string;
  emotion: string;
  stress_score: number;
  stress_level: number;
}

/**
 * Main bot response generator
 * Always expects structured analysis from backend
 */
export async function generateBotResponse(
  analysis: StressAnalysisResult
): Promise<string> {

  console.log("🔥 Stress Inference Result:");
  console.log("Transcript:", analysis.transcript);
  console.log("Emotion:", analysis.emotion);
  console.log("Stress Score:", analysis.stress_score);
  console.log("Stress Level:", analysis.stress_level);

  return generateAIResponse(analysis);
}

/**
 * Welcome message
 */
export function getWelcomeMessage(
  type: 'general' | 'academic' = 'general'
): string {

  if (type === 'academic') {
    return "Hello! I'm your wellness companion. I'm here to support you through your academic journey. How are you feeling today?";
  }

  return "Welcome to MindCare! I'm your AI wellness companion. Share how you're feeling, and I’ll provide personalized guidance to help you manage stress.";
}