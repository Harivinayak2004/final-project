// src/utils/supabase/message.ts
import { supabase } from "./client";

export async function saveMessage(message: any, userId: string) {
  const { error } = await supabase.from("messages").insert([
    {
      user_id: userId,
      text: message.text || null, // Handle cases where there is only audio, no transcript yet
      sender: message.sender,
      emotion: message.emotion || null,
      crisis: message.crisis || false,
      // FIX: Ensure the audio URL is saved to the database!
      audio_url: message.audio || null 
    }
  ]);

  if (error) console.error("Save message error:", error);
}

export async function loadMessages(userId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map((msg) => ({
    id: msg.id,
    text: msg.text,
    sender: msg.sender,
    timestamp: new Date(msg.created_at),
    emotion: msg.emotion,
    crisis: msg.crisis,
    // FIX: Load the audio URL from the database
    audio: msg.audio_url 
  }));
}