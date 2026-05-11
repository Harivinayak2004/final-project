export interface StressAnalysisResult {
  transcript: string;
  emotion: string;
  stress_score: number;
  stress_level: number;
}

export async function generateAIResponse(
  analysis: StressAnalysisResult
): Promise<string> {

  const systemPrompt = `
You are MindCare, an emotionally intelligent AI wellness assistant.

User Transcript:
"${analysis.transcript}"

Detected Emotion: ${analysis.emotion}
Stress Score (0–100): ${analysis.stress_score}
Stress Level (0–4): ${analysis.stress_level}

Instructions:
- If stress_level >= 3 → respond calmly and offer grounding techniques.
- If stress_score > 80 → prioritize emotional stabilization.
- Validate the user's emotional state.
- Do NOT mention raw stress numbers unless helpful.
- Be compassionate, warm, and supportive.
`;

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemPrompt,
      message: analysis.transcript,
    }),
  });

  const data = await response.json();
  return data.reply;
}