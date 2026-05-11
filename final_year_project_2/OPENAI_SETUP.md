## OpenAI Integration Setup Guide

### Step 1: Set Up Environment Variables

#### Frontend Environment Variables
Create or update your `.env.local` file in the project root with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase dashboard:
1. Go to https://app.supabase.com/
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and Anon Key

#### Supabase Function Environment Variables
Add your OpenAI API key to your Supabase project:

1. **Local Development (for testing):**
   ```bash
   # In the supabase folder, create/update .env.local
   OPENAI_API_KEY=sk_your_openai_api_key_here
   ```

2. **Production (in Supabase Dashboard):**
   - Go to your Supabase project
   - Settings → Secrets
   - Add a new secret named `OPENAI_API_KEY` with your OpenAI API key

### Step 2: Get Your OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign in to your OpenAI account (create one if needed)
3. Navigate to API keys section
4. Create a new secret API key
5. Copy and save it securely

**Important:** Keep your API key confidential. Never commit it to version control.

### Step 3: Deploy Supabase Function

Run this command in your project directory:

```bash
supabase functions deploy generate-response
```

If you haven't installed the Supabase CLI, install it first:
```bash
npm install -g supabase
```

Then initialize your Supabase project:
```bash
supabase init
```

### Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Login to the application
3. Send a message in the chat
4. The bot should respond with personalized AI-generated responses!

### Troubleshooting

**Issue: "OPENAI_API_KEY is not set"**
- Make sure you've added the API key to your Supabase project secrets
- For local testing, add it to `supabase/.env.local`

**Issue: Function not found (404)**
- Run `supabase functions deploy generate-response`
- Make sure your Supabase URL is correct in `.env.local`

**Issue: CORS errors**
- The function includes CORS headers, but verify your Supabase project has the correct settings

**Issue: Responses take too long**
- OpenAI API calls can take 2-10 seconds
- Consider showing a loading indicator to users (already implemented in App.tsx)

### File Structure Created

```
src/
  utils/
    openai/
      generateResponse.ts      ← Service to call Supabase function

supabase/
  functions/
    generate-response/
      index.ts                 ← Supabase Edge Function with OpenAI integration
```

### How It Works

1. User sends a message → App.tsx
2. Emotion is analyzed → analyzeEmotion()
3. Request sent to Supabase function with user message + emotion
4. Supabase function calls OpenAI API securely (key on server)
5. OpenAI generates personalized response
6. Response returned to frontend and displayed

### Cost Considerations

- OpenAI charges per token used
- gpt-4o-mini is very affordable (~$0.15 per 1M input tokens)
- Estimate: ~$0.001-0.005 per message
- Monitor your usage at https://platform.openai.com/account/billing/overview

### Customizing the AI Behavior

Edit `supabase/functions/generate-response/index.ts` to change:
- **Model**: Change `gpt-4o-mini` to `gpt-4o`, `gpt-4-turbo`, etc.
- **System Prompt**: Modify the `systemPrompt` variable to customize bot personality
- **Temperature**: Add `temperature: 0.7` to responses object for more/less randomness
- **Max Tokens**: Adjust max_tokens to control response length
