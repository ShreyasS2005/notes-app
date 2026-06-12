import { GoogleGenerativeAI } from "@google/generative-ai";

const getAIModel = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'undefined') {
    console.error("--- CONFIG ERROR: Gemini API Key is missing! ---");
    console.error("Make sure NEXT_PUBLIC_GEMINI_API_KEY is in your .env.local file.");
    console.error("You MUST restart your terminal (npm run dev) after adding it.");
    throw new Error("API_KEY_MISSING");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (err) {
    console.error("Failed to initialize Gemini:", err);
    throw new Error("INIT_ERROR");
  }
};

export const aiService = {
  translate: async (content, targetLang = "Tamil") => {
    try {
      const model = getAIModel();

      // Clean content: remove HTML tags and extra spaces
      const cleanContent = (content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

      if (!cleanContent) throw new Error("EMPTY_CONTENT");

      const prompt = `Translate the following text into ${targetLang}.
      Use the native script of ${targetLang} (e.g., Tamil script).
      Provide ONLY the translated text, no introductory remarks.

      Text: ${cleanContent}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) throw new Error("EMPTY_RESPONSE");
      return text;
    } catch (error) {
      console.error("--- AI SERVICE ERROR ---", error);
      throw error;
    }
  }
};
