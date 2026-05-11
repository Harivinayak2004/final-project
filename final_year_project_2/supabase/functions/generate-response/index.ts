import express from "express";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
console.log("OpenAI Key:", process.env.OPENAI_API_KEY ? "Loaded ✅" : "Missing ❌");
app.post("/", async (req, res) => {
  try {
    const { userMessage, emotion, stressLevel } = req.body;

    const systemPrompt = `You are MindCare, a compassionate AI wellness companion...`;

    const userContext =
      emotion && stressLevel >= 8
        ? `The person appears to be experiencing ${emotion} emotions with high stress (level ${stressLevel}/10). Be extra supportive and suggest professional help if needed.`
        : emotion
        ? `The person is experiencing ${emotion} emotions. Respond with appropriate emotional support.`
        : "Provide supportive guidance.";

    const message = `${userContext}\n\nUser's message: "${userMessage}"`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    res.json({
      success: true,
      response: response.choices[0]?.message?.content || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));