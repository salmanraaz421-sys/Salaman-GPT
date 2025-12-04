import express from "express";
import cors from "cors";
import Bytez from "bytez.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Updated API Key
const key = "b0ba45bb2d0864dfe2fa95f792abe53f";
const sdk = new Bytez(key);
const model = sdk.model("google/imagen-4.0-generate-001");

function detectType(output) {
  if (typeof output === "string" && output.startsWith("http")) return "url";
  if (typeof output === "string") return "base64";
  return "unknown";
}

app.post("/generate", async (req, res) => {
  try {
    const { prompt, variation } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "prompt required" });
    }

    const uniquePrompt = `${prompt}, variation ${variation || Math.random()}`;
    
    const { error, output } = await model.run(uniquePrompt);
    
    if (error) {
      console.error("Model error:", error);
      return res.status(500).json({ error: "model error", detail: error });
    }

    return res.json({ 
      image: {
        type: detectType(output),
        data: output
      }
    });
  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({ error: "server error", detail: String(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 SalamanGPT Image Server Running → http://localhost:${PORT}`);
});
