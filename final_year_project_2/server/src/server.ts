import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3000;
app.get("/", (_req, res) => {
  res.send("Backend is running 🚀");
});
// Health check
app.get("/make-server-0fad513c/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Signup
app.post("/make-server-0fad513c/auth/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || "" },
      email_confirm: true,
    });

    if (error) {
      console.error("Signup error:", error);
      return res.status(400).json({ error: error.message });
    }

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      console.error("Auto sign-in error:", signInError);
      return res.status(500).json({ error: "User created but sign-in failed" });
    }

    res.json({
      userId: data.user?.id,
      email: data.user?.email,
      accessToken: signInData.session?.access_token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// Login
app.post("/make-server-0fad513c/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_ANON_KEY as string
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      userId: data.user?.id,
      email: data.user?.email,
      accessToken: data.session?.access_token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout
app.post("/make-server-0fad513c/auth/logout", async (_req: Request, res: Response) => {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_ANON_KEY as string
    );

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return res.status(500).json({ error: "Logout failed" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});