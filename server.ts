import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Server-side Gemini initialization
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Deep Mathematical Analysis with Gemini 3.1 Pro Thinking Mode
app.post("/api/ai/deep-derivation", async (req, res) => {
  try {
    const { modelName, equationLatex, r2, mse, parameters, pointsSample, customQuestion } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured in this environment.",
        fallback: true,
      });
    }

    const ai = getGeminiClient();

    const promptText = `
You are the Chief AI Mathematician and Judge for the National Math Festival (Class-10 level).
A student drew a freehand curve on the Cartesian coordinate canvas.
The Reverse Desmos AI regression engine analyzed the stroke points and produced the following mathematical model:

- Fitted Model: ${modelName}
- Recognized Formula: ${equationLatex}
- Coefficient of Determination (R²): ${r2}%
- Mean Squared Error (MSE): ${mse}
- Fitted Parameters: ${JSON.stringify(parameters)}
- Sample Coordinate Points (x, y): ${JSON.stringify(pointsSample || [])}
${customQuestion ? `- Student Question: "${customQuestion}"` : ""}

Please provide an in-depth, rigorous yet pedagogically lucid mathematical derivation and AI insight:
1. **Mathematical Mechanics**: Show how the Normal Equations / Matrix formulation $\\mathbf{(X^T X)^{-1} X^T Y}$ or Least Squares minimization $\\frac{\\partial}{\\partial \\theta} MSE = 0$ calculates these exact parameters.
2. **Geometrical & Class-10 Curriculum Connection**: Explain what the coefficients represent geometrically (vertex, roots, curvature, phase shift, frequency) connecting to Class-10 Coordinate Geometry and Polynomials.
3. **AI & Machine Learning Insight**: How does this exact regression process relate to modern Deep Learning, Loss Landscapes, Cost Functions, and Neural Network Decision Boundaries?
4. **Error & Residual Analysis**: Critique the fit quality ($R^2$ and $MSE$), explaining what physical drawing human tremors cause and how regularization (L1/L2 ridge) or higher order polynomials would respond.

Format with clear Markdown headings and crisp LaTeX equations (using standard $...$ and $$...$$ notation). Keep the tone inspiring, academic, and tailored for a Math National Festival champion!
`;

    // High thinking mode using gemini-3.1-pro-preview with ThinkingLevel.HIGH
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: promptText,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        systemInstruction:
          "You are an elite mathematics professor and AI research scientist judging the Math National Festival. Provide rigorous, crystal-clear mathematical derivations with LaTeX formulas and high-level reasoning.",
      },
    });

    const outputText = response.text || "No derivation text generated.";
    res.json({ text: outputText });
  } catch (error: any) {
    console.error("Gemini thinking analysis error:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate AI mathematical derivation.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Reverse Desmos AI Server running on port ${PORT}`);
  });
}

startServer();
