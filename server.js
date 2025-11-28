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

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, "public")));

// TODO: apni asli API key yahan daalo
// API Key updated with the one provided by the user.
const key = "b0ba45bb2d0864dfe2fa95f792abe53f";
const sdk = new Bytez(key);

// Imagen 4.0 image model
const model = sdk.model("google/imagen-4.0-generate-001");

// detect url or base64 output type
function detectType(output) {
  if (typeof output === "string" && output.startsWith("http")) return "url";
  if (typeof output === "string") return "base64";
  return "unknown";
}

app.post("/generate", async (req, res) => {
  try {
    const { prompt, count } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "prompt required" });
    }

    // Client-side se ab hum 'count: 1' bhejenge, isliye yahan sirf 1 ya max limit rakhenge
    const n = Math.min(Number(count) || 1, 100); 
    
    if (n > 100) {
        // Yeh check ab zaroori nahi, lekin safety ke liye rehne denge
        return res.status(400).json({ error: "Maximum 100 images are allowed per request." });
    }
    
    const images = [];

    // Sirf ek image generate karein, kyunki client ab loop chala raha hai.
    const { error, output } = await model.run(prompt); 
    
    if (error) {
        console.error("Model error:", error);
        return res.status(500).json({ error: "model error", detail: error });
    }

    images.push({
        type: detectType(output),
        data: output
    });
    
    // Yahan sirf ek hi image return hogi
    return res.json({ images });

  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({ error: "server error", detail: String(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 SalamanGPT Image Server Running → http://localhost:${PORT}`);
});