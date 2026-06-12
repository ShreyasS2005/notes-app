const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Initialize Gemini AI
// NOTE: For production, use environment variables for API keys
const apiKey = "AIzaSyBB9lAhmi85xAGP4tH_oO3g6emhEV4Wewo";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

// Helper to clean JSON response from AI
function cleanJsonResponse(text) {
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

// 1. AI Summarization
app.post('/summarize', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ result: "Content is required" });

        const prompt = `You are an expert academic summarizer.
        Summarize the following study notes into professional bullet points with a clear heading.
        Focus on key concepts and definitions.

        Notes: ${content}`;

        const result = await model.generateContent(prompt);
        res.json({ result: result.response.text() });
    } catch (error) {
        console.error("Summarize Error:", error);
        res.status(500).json({ result: "Neural synthesis failed. Please try again." });
    }
});

// 2. AI Quiz Generation
app.post('/generate-quiz', async (req, res) => {
    try {
        const { content } = req.body;
        const prompt = `Generate a 5-question multiple choice quiz based on the following text.
        Return ONLY a raw JSON object with the following structure:
        {"quizzes": [{"question": "...", "options": ["A","B","C","D"], "correctAnswer": "exact string from options"}]}

        Text: ${content}`;

        const result = await model.generateContent(prompt);
        const text = cleanJsonResponse(result.response.text());
        res.json({ result: text });
    } catch (error) {
        console.error("Quiz Error:", error);
        res.status(500).json({ result: '{"quizzes": []}' });
    }
});

// 3. AI Flashcards
app.post('/generate-flashcards', async (req, res) => {
    try {
        const { content } = req.body;
        const prompt = `Create 5 flashcards for active recall.
        Return ONLY a raw JSON array of objects with 'front' and 'back' keys.
        Example: [{"front": "What is AI?", "back": "Artificial Intelligence"}]

        Text: ${content}`;

        const result = await model.generateContent(prompt);
        const text = cleanJsonResponse(result.response.text());
        res.json({ result: text });
    } catch (error) {
        console.error("Flashcard Error:", error);
        res.status(500).json({ result: "[]" });
    }
});

// 4. AI Chat (Improved History Handling)
app.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        // Map history to Gemini format if provided
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.parts[0].text }]
        }));

        const chat = model.startChat({
            history: formattedHistory,
        });

        const result = await chat.sendMessage(message);
        res.json({ result: result.response.text() });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ result: "I'm having trouble connecting to my neural network. Please check your internet." });
    }
});

// 5. Parse Reminder Intent
app.post('/parse-intent', async (req, res) => {
    try {
        const { content } = req.body;
        const prompt = `Extract study task and delay from: "${content}"
        Return ONLY raw JSON: {"topic": "string", "delayMinutes": number}`;

        const result = await model.generateContent(prompt);
        const text = cleanJsonResponse(result.response.text());
        res.json({ result: text });
    } catch (error) {
        res.status(500).json({ result: '{"topic": "Study Session", "delayMinutes": 60}' });
    }
});

// 6. Predict Study Time
app.post('/predict-time', async (req, res) => {
    try {
        const { content } = req.body;
        const prompt = `How many minutes to study this content thoroughly? Return only the number and "min".
        Content: ${content}`;

        const result = await model.generateContent(prompt);
        res.json({ result: result.response.text().trim() });
    } catch (error) {
        res.status(500).json({ result: "15 min" });
    }
});

// Firebase Cloud Function Export
exports.api = functions.https.onRequest(app);

// Local Development Server
const PORT = process.env.PORT || 5001;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`SmartNotes Backend running locally at http://localhost:${PORT}`);
    });
}
