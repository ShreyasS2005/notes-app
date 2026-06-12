const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

// ============================================
// SECURITY: Rate Limiting Middleware
// ============================================
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many requests',
            retryAfter: req.rateLimit.resetTime
        });
    }
});

app.use(limiter);

// ============================================
// SECURITY: Authentication Middleware
// ============================================
const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp();
}

const verifyAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ 
            error: 'Unauthorized: Missing authentication token',
            code: 'AUTH_MISSING'
        });
    }

    try {
        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Auth Error:', error.message);
        return res.status(401).json({ 
            error: 'Unauthorized: Invalid or expired token',
            code: 'AUTH_INVALID'
        });
    }
};

// ============================================
// SECURITY: Input Validation Middleware
// ============================================
const validateContent = [
    body('content')
        .notEmpty().withMessage('Content is required')
        .isString().withMessage('Content must be a string')
        .trim()
        .isLength({ min: 1, max: 10000 }).withMessage('Content must be between 1 and 10000 characters')
];

const validateMessage = [
    body('message')
        .notEmpty().withMessage('Message is required')
        .isString().withMessage('Message must be a string')
        .trim()
        .isLength({ min: 1, max: 5000 }).withMessage('Message must be between 1 and 5000 characters')
];

// ============================================
// SECURITY: Sanitize Input Function
// ============================================
function sanitizeInput(input) {
    return input
        .replace(/[<>]/g, '')
        .trim()
        .substring(0, 10000);
}

// ============================================
// SECURITY: Initialize Gemini AI with env variable
// ============================================
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

// Helper to clean JSON response from AI
function cleanJsonResponse(text) {
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// ============================================
// 1. AI Summarization
// ============================================
app.post('/summarize', 
    verifyAuth,
    validateContent,
    handleValidationErrors,
    async (req, res) => {
        try {
            const content = sanitizeInput(req.body.content);

            const prompt = `You are an expert academic summarizer.
Summarize the following study notes into professional bullet points with a clear heading.
Focus on key concepts and definitions.

Notes: ${content}`;

            const result = await model.generateContent(prompt);
            res.json({ result: result.response.text() });
        } catch (error) {
            console.error("Summarize Error:", error.message);
            res.status(500).json({ 
                error: "Neural synthesis failed. Please try again.",
                code: 'SUMMARIZE_ERROR'
            });
        }
    }
);

// ============================================
// 2. AI Quiz Generation
// ============================================
app.post('/generate-quiz',
    verifyAuth,
    validateContent,
    handleValidationErrors,
    async (req, res) => {
        try {
            const content = sanitizeInput(req.body.content);
            
            const prompt = `Generate a 5-question multiple choice quiz based on the following text.
Return ONLY a raw JSON object with the following structure:
{"quizzes": [{"question": "...", "options": ["A","B","C","D"], "correctAnswer": "exact string from options"}]}

Text: ${content}`;

            const result = await model.generateContent(prompt);
            const text = cleanJsonResponse(result.response.text());
            res.json({ result: text });
        } catch (error) {
            console.error("Quiz Error:", error.message);
            res.status(500).json({ 
                error: 'Quiz generation failed',
                code: 'QUIZ_ERROR',
                result: '{"quizzes": []}'
            });
        }
    }
);

// ============================================
// 3. AI Flashcards
// ============================================
app.post('/generate-flashcards',
    verifyAuth,
    validateContent,
    handleValidationErrors,
    async (req, res) => {
        try {
            const content = sanitizeInput(req.body.content);
            
            const prompt = `Create 5 flashcards for active recall.
Return ONLY a raw JSON array of objects with 'front' and 'back' keys.
Example: [{"front": "What is AI?", "back": "Artificial Intelligence"}]

Text: ${content}`;

            const result = await model.generateContent(prompt);
            const text = cleanJsonResponse(result.response.text());
            res.json({ result: text });
        } catch (error) {
            console.error("Flashcard Error:", error.message);
            res.status(500).json({ 
                error: 'Flashcard generation failed',
                code: 'FLASHCARD_ERROR',
                result: "[]"
            });
        }
    }
);

// ============================================
// 4. AI Chat (Improved History Handling)
// ============================================
app.post('/chat',
    verifyAuth,
    validateMessage,
    handleValidationErrors,
    async (req, res) => {
        try {
            const message = sanitizeInput(req.body.message);
            const history = req.body.history || [];

            const formattedHistory = history.map(msg => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: sanitizeInput(msg.parts[0].text) }]
            }));

            const chat = model.startChat({
                history: formattedHistory,
            });

            const result = await chat.sendMessage(message);
            res.json({ result: result.response.text() });
        } catch (error) {
            console.error("Chat Error:", error.message);
            res.status(500).json({ 
                error: "I'm having trouble connecting to my neural network. Please check your internet.",
                code: 'CHAT_ERROR'
            });
        }
    }
);

// ============================================
// 5. Parse Reminder Intent
// ============================================
app.post('/parse-intent',
    verifyAuth,
    validateContent,
    handleValidationErrors,
    async (req, res) => {
        try {
            const content = sanitizeInput(req.body.content);
            
            const prompt = `Extract study task and delay from: "${content}"
Return ONLY raw JSON: {"topic": "string", "delayMinutes": number}`;

            const result = await model.generateContent(prompt);
            const text = cleanJsonResponse(result.response.text());
            res.json({ result: text });
        } catch (error) {
            console.error("Parse Intent Error:", error.message);
            res.status(500).json({ 
                error: 'Intent parsing failed',
                code: 'INTENT_ERROR',
                result: '{"topic": "Study Session", "delayMinutes": 60}'
            });
        }
    }
);

// ============================================
// 6. Predict Study Time
// ============================================
app.post('/predict-time',
    verifyAuth,
    validateContent,
    handleValidationErrors,
    async (req, res) => {
        try {
            const content = sanitizeInput(req.body.content);
            
            const prompt = `How many minutes to study this content thoroughly? Return only the number and "min".
Content: ${content}`;

            const result = await model.generateContent(prompt);
            res.json({ result: result.response.text().trim() });
        } catch (error) {
            console.error("Predict Time Error:", error.message);
            res.status(500).json({ 
                error: 'Time prediction failed',
                code: 'TIME_ERROR',
                result: "15 min"
            });
        }
    }
);

// ============================================
// Health Check Endpoint (No Auth Required)
// ============================================
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// ============================================
// Firebase Cloud Function Export
// ============================================
exports.api = functions.https.onRequest(app);

// ============================================
// Local Development Server
// ============================================
const PORT = process.env.PORT || 5001;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`SmartNotes Backend running locally at http://localhost:${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
    });
}
