const path = require("path");
const fs = require("fs");
const { generateImagePrompt } = require("./anthropicService");

const PLATFORM_DIMENSIONS = {
  instagram:       { width: 1080, height: 1080, aspect: "1:1" },
  instagram_story: { width: 1080, height: 1920, aspect: "9:16" },
  youtube:         { width: 1280, height: 720,  aspect: "16:9" },
  facebook:        { width: 1200, height: 630,  aspect: "16:9" },
  telegram:        { width: 1280, height: 720,  aspect: "16:9" }
};

function getGoogleKey() {
  if (process.env.GOOGLE_AI_KEY) return process.env.GOOGLE_AI_KEY;
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const Settings = require("../models/Settings");
    return Settings.get("GOOGLE_AI_KEY") || Settings.get("GEMINI_API_KEY") || null;
  } catch {}
  return null;
}

function saveBase64(b64) {
  const dir = path.join(__dirname, "../../uploads");
  fs.mkdirSync(dir, { recursive: true });
  const filename = "img_" + Date.now() + ".png";
  fs.writeFileSync(path.join(dir, filename), Buffer.from(b64, "base64"));
  return "/uploads/" + filename;
}

async function tryGoogleImage(prompt, dims) {
  const apiKey = getGoogleKey();
  if (!apiKey) return null;

  // 1. Gemini Flash image generation (AI Studio free key bilan ishlaydi)
  const geminiModels = [
    "gemini-2.0-flash-preview-image-generation",
    "gemini-2.0-flash-exp-image-generation"
  ];
  for (const model of geminiModels) {
    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Generate a high quality image: " + prompt }] }],
            generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
          })
        }
      );
      const txt = await res.text();
      console.log("[Gemini img] " + model + " -> " + res.status);
      if (res.ok) {
        const data = JSON.parse(txt);
        const parts = data.candidates?.[0]?.content?.parts || [];
        const imgPart = parts.find(p => p.inlineData?.mimeType?.startsWith("image/"));
        if (imgPart?.inlineData?.data) {
          console.log("[Gemini img] success: " + model);
          return saveBase64(imgPart.inlineData.data);
        }
      } else {
        console.log("[Gemini img] " + model + " error: " + txt.slice(0, 200));
      }
    } catch (e) {
      console.log("[Gemini img] " + model + " exception: " + e.message);
    }
  }

  // 2. Imagen 3 (Google Cloud billing talab qiladi)
  const imagenModels = ["imagen-3.0-generate-001", "imagen-3.0-fast-generate-001"];
  for (const model of imagenModels) {
    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":predict?key=" + apiKey,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: { sampleCount: 1, aspectRatio: dims.aspect || "1:1" }
          })
        }
      );
      const txt = await res.text();
      console.log("[Imagen] " + model + " -> " + res.status);
      if (res.ok) {
        const data = JSON.parse(txt);
        const b64 = data.predictions?.[0]?.bytesBase64Encoded;
        if (b64) { console.log("[Imagen] success"); return saveBase64(b64); }
      }
    } catch (e) {
      console.log("[Imagen] " + model + " exception: " + e.message);
    }
  }

  return null;
}

async function generateImage(topic, style, platform) {
  const dims = PLATFORM_DIMENSIONS[platform] || PLATFORM_DIMENSIONS.instagram;
  const imagePrompt = await generateImagePrompt(topic, style, platform);

  const googleUrl = await tryGoogleImage(imagePrompt, dims);
  if (googleUrl) return { imageUrl: googleUrl, prompt: imagePrompt, provider: "google" };

  // Fallback: Pollinations.ai
  const encoded = encodeURIComponent(imagePrompt);
  const imageUrl = "https://image.pollinations.ai/prompt/" + encoded + "?width=" + dims.width + "&height=" + dims.height + "&nologo=true&model=flux";
  return { imageUrl, prompt: imagePrompt, provider: "pollinations" };
}

async function generateImagesForPlatforms(topic, style, platforms) {
  const results = {};
  for (const platform of platforms) {
    try { results[platform] = await generateImage(topic, style, platform); }
    catch (err) { results[platform] = { error: err.message }; }
  }
  return results;
}

module.exports = { generateImage, generateImagesForPlatforms };
