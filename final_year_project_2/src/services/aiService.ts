export interface EmotionResult {
  emotion: 'neutral' | 'happy' | 'fearful' | 'angry' | 'sad';
  confidence: number;
  stress_score: number;
  stress_level: number;
  intent: string;
}

export async function analyzeText(text: string): Promise<EmotionResult> {
  const response = await fetch("http://127.0.0.1:8000/analyze-text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("AI analysis failed");
  }

  return await response.json();
}