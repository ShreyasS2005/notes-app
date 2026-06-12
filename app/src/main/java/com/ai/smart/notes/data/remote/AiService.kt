package com.ai.smart.notes.data.remote

import android.util.Log
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AiService @Inject constructor(
    private val llmInference: LlmInference?,
    private val api: SmartNotesApi
) {
    private val systemInstruction = """
        You are the SmartNotes AI Engine, a specialized educational assistant.
        Rules: 
        1. Summarize notes in professional bullet points.
        2. Generate MCQ quizzes in strict JSON format.
        3. Create flashcards as a JSON array of objects with 'front' and 'back' keys.
        4. Parse reminder requests into JSON: {"topic": String, "delayMinutes": Int}.
        5. Identity: Neural Study Partner.
    """.trimIndent()

    suspend fun generateSummary(text: String): String = withContext(Dispatchers.IO) {
        if (text.isBlank()) return@withContext "Note content is empty."
        
        if (llmInference != null) {
            try {
                val prompt = "${systemInstruction}\n\nTask: Summarize the following:\n${text}\n\nSummary:"
                return@withContext llmInference.generateResponse(prompt)
            } catch (e: Exception) {
                Log.e("AiService", "Local LLM Error: ${e.message}")
            }
        }
        
        return@withContext try {
            val response = api.getSummary(AiRequest(text))
            response.result
        } catch (e: Exception) {
            Log.e("AiService", "Remote API Error: ${e.message}")
            // Fallback: Simple summary
            "Summary: " + text.take(100) + "..."
        }
    }

    suspend fun generateQuiz(text: String): String = withContext(Dispatchers.IO) {
        if (text.isBlank()) return@withContext ""
        
        if (llmInference != null) {
            try {
                val prompt = "${systemInstruction}\n\nTask: Create a 5-question MCQ JSON from:\n${text}\n\nJSON:"
                val response = llmInference.generateResponse(prompt)
                return@withContext extractJson(response)
            } catch (e: Exception) {
                Log.e("AiService", "Local LLM Quiz Error: ${e.message}")
            }
        }

        return@withContext try {
            val response = api.getQuiz(AiRequest(text))
            extractJson(response.result)
        } catch (e: Exception) {
            Log.e("AiService", "Remote Quiz Error: ${e.message}")
            ""
        }
    }

    suspend fun generateFlashcards(text: String): String = withContext(Dispatchers.IO) {
        if (text.isBlank()) return@withContext ""
        
        if (llmInference != null) {
            try {
                val prompt = """
                    ${systemInstruction}
                    Task: Create 5-10 flashcards for active recall from the content provided.
                    Constraint: Return ONLY a raw JSON array. NO markdown code blocks, NO text before or after.
                    Format: [{"front": "Question/Term", "back": "Answer/Definition"}]
                    Content: ${text}
                """.trimIndent()
                val response = llmInference.generateResponse(prompt)
                return@withContext extractJson(response)
            } catch (e: Exception) {
                Log.e("AiService", "Local LLM Flashcard Error: ${e.message}")
            }
        }

        return@withContext try {
            val response = api.getFlashcards(AiRequest(text))
            extractJson(response.result)
        } catch (e: Exception) {
            Log.e("AiService", "Remote Flashcard Error: ${e.message}")
            ""
        }
    }

    suspend fun predictStudyTime(text: String): String = withContext(Dispatchers.IO) {
        if (text.isBlank()) return@withContext "0 min"
        
        val wordCount = text.trim().split("\\s+".toRegex()).size
        // Average reading speed is 200-250 wpm, study speed is lower.
        val baseMinutes = (wordCount / 50).coerceAtLeast(1)
        
        if (llmInference != null) {
            try {
                val prompt = "${systemInstruction}\n\nTask: Estimate study time for ${wordCount} words. Return only time.\n\nTime:"
                return@withContext llmInference.generateResponse(prompt).trim()
            } catch (e: Exception) {
                Log.e("AiService", "Local LLM Time Error: ${e.message}")
            }
        }

        return@withContext try {
            val response = api.predictStudyTime(AiRequest(text))
            response.result
        } catch (e: Exception) {
            "$baseMinutes min"
        }
    }

    suspend fun chat(message: String, history: List<ChatMessage> = emptyList()): String = withContext(Dispatchers.IO) {
        if (llmInference != null) {
            try {
                val prompt = "${systemInstruction}\n\nUser: ${message}\n\nModel:"
                return@withContext llmInference.generateResponse(prompt)
            } catch (e: Exception) {
                Log.e("AiService", "Local LLM Chat Error: ${e.message}")
            }
        }

        return@withContext try {
            val response = api.chat(ChatRequest(message, history))
            response.result
        } catch (e: Exception) {
            "I'm experiencing some connectivity issues with my neural core. How can I help you manually?"
        }
    }

    suspend fun parseReminderIntent(voiceText: String): String = withContext(Dispatchers.IO) {
        if (llmInference != null) {
            try {
                val prompt = """
                    ${systemInstruction}
                    Task: Extract 'topic' and 'delayMinutes' from the user's voice request.
                    Example: "Remind me in one hour to study History" -> {"topic": "History", "delayMinutes": 60}
                    Request: "${voiceText}"
                    Output: Return ONLY raw JSON.
                """.trimIndent()
                val response = llmInference.generateResponse(prompt)
                return@withContext extractJson(response)
            } catch (e: Exception) {
                Log.e("AiService", "Local Intent Error: ${e.message}")
            }
        }

        return@withContext try {
            val response = api.parseIntent(AiRequest(voiceText))
            extractJson(response.result)
        } catch (e: Exception) {
            Log.e("AiService", "Remote Intent Error: ${e.message}")
            ""
        }
    }

    private fun extractJson(text: String): String {
        val cleaned = text.trim()
            .replace("```json", "")
            .replace("```", "")
            .trim()
            
        val startBrace = cleaned.indexOf('{')
        val startBracket = cleaned.indexOf('[')
        
        val startIndex = when {
            startBrace != -1 && startBracket != -1 -> minOf(startBrace, startBracket)
            startBrace != -1 -> startBrace
            startBracket != -1 -> startBracket
            else -> return cleaned
        }
        
        val lastBrace = cleaned.lastIndexOf('}')
        val lastBracket = cleaned.lastIndexOf(']')
        val endIndex = maxOf(lastBrace, lastBracket)
        
        return if (endIndex != -1 && endIndex > startIndex) {
            cleaned.substring(startIndex, endIndex + 1)
        } else {
            cleaned
        }
    }
}
