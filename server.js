import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({limit:"2mb"}));
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

function clampText(value, max=10000) {
  return String(value ?? "").slice(0, max);
}

function demoReply({character, message, state}) {
  const name = character?.name || "the character";
  const emotion = state?.emotion || character?.emotion || "calm";
  if (!message) return `${name} looks at you quietly. What do you want to say?`;
  return `${name} (${emotion}) looks at you and answers: "${clampText(message, 900)}"\n\n[Demo mode] Add AI_API_KEY, AI_BASE_URL, and AI_CHAT_MODEL to enable online generation.`;
}

app.post("/api/chat", async (req, res) => {
  try {
    const {character, message, history=[], memory=[], state={}, maturity="Mature"} = req.body || {};
    const maxTokens = 10000;

    if (!process.env.AI_API_KEY || !process.env.AI_CHAT_MODEL) {
      return res.json({
        ok:true,
        mode:"demo",
        reply: demoReply({character, message, state}),
        usage:null
      });
    }

    const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/,"");
    const system = `You are ${character?.name || "an AI character"}.
Personality: ${character?.personality || "adaptive"}.
Backstory: ${character?.backstory || "unknown"}.
Current emotion: ${state?.emotion || character?.emotion || "calm"}.
HP: ${state?.hp ?? character?.hp ?? 100}/${state?.maxHp ?? character?.maxHp ?? 100}.
Relationship: ${state?.relationship ?? character?.relationship ?? 0}/100.
Maturity setting: ${maturity}.
Important memories: ${(memory || []).slice(-30).join("\\n") || "None"}.
Respond in-character. Preserve continuity. You may describe cinematic actions, emotions and consequences.
If the story state says the character is dead, do not pretend they are alive unless a resurrection event is explicitly established.
Maximum response length: 10,000 characters.`;

    const messages = [
      {role:"system", content:system},
      ...(Array.isArray(history) ? history.slice(-30).map(x=>({
        role:x.role === "assistant" ? "assistant" : "user",
        content:clampText(x.content, 10000)
      })) : []),
      {role:"user", content:clampText(message, 10000)}
    ];

    const r = await fetch(`${base}/chat/completions`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":`Bearer ${process.env.AI_API_KEY}`
      },
      body:JSON.stringify({
        model:process.env.AI_CHAT_MODEL,
        messages,
        max_tokens:10000
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ok:false,error:data?.error?.message || "AI provider error"});

    const reply = clampText(data?.choices?.[0]?.message?.content || "The character stays silent.",10000);
    res.json({ok:true, mode:"online", reply, usage:data.usage || null});
  } catch (e) {
    res.status(500).json({ok:false,error:e.message});
  }
});

app.post("/api/image", async (req,res) => {
  try {
    const {prompt,size="1024x1024"} = req.body || {};
    if (!process.env.AI_API_KEY || !process.env.AI_IMAGE_MODEL) {
      return res.json({
        ok:true,
        mode:"demo",
        image:null,
        message:"Image API is not configured yet. Add AI_IMAGE_MODEL and AI_API_KEY on the server."
      });
    }

    const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/,"");
    const r = await fetch(`${base}/images/generations`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":`Bearer ${process.env.AI_API_KEY}`
      },
      body:JSON.stringify({
        model:process.env.AI_IMAGE_MODEL,
        prompt:clampText(prompt,4000),
        size
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ok:false,error:data?.error?.message || "Image provider error"});
    res.json({ok:true, mode:"online", image:data?.data?.[0]?.url || null});
  } catch(e) {
    res.status(500).json({ok:false,error:e.message});
  }
});

app.get("*", (req,res) => res.sendFile(process.cwd()+"/public/index.html"));

app.listen(PORT, ()=>console.log(`MarioAI running on http://localhost:${PORT}`));
