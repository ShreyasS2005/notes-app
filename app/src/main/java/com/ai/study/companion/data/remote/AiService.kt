package com.ai.study.companion.data.remote

import com.ai.smart.notes.data.remote.AiRequest
import com.ai.smart.notes.data.remote.ChatRequest
import com.ai.smart.notes.data.remote.ChatMessage
import com.ai.smart.notes.data.remote.SmartNotesApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AiService @Inject constructor(
    private val api: SmartNotesApi
) {

    suspend fun generateSummary(text: String): String {
        if (text.isBlank()) return "Text is empty. Nothing to summarize."
        
        return try {
            val response = api.getSummary(AiRequest(text))
            response.result
        } catch (e: Exception) {
            "AI Error: ${e.localizedMessage}"
        }
    }

    suspend fun generateQuiz(text: String): String {
        if (text.isBlank()) return ""
        
        return try {
            val response = api.getQuiz(AiRequest(text))
            response.result
        } catch (e: Exception) {
            ""
        }
    }

    suspend fun generateFlashcards(text: String): String {
        if (text.isBlank()) return ""
        
        return try {
            val response = api.getFlashcards(AiRequest(text))
            response.result
        } catch (e: Exception) {
            ""
        }
    }

    suspend fun predictStudyTime(text: String): String {
        if (text.isBlank()) return "0 min"
        
        return try {
            val response = api.predictStudyTime(AiRequest(text))
            response.result
        } catch (e: Exception) {
            "Error"
        }
    }

    suspend fun chat(message: String, history: List<ChatMessage> = emptyList()): String {
        return try {
            val response = api.chat(ChatRequest(message, history))
            response.result
        } catch (e: Exception) {
            "Chat Connection Error: ${e.localizedMessage}"
        }
    }

    fun setApiKey(key: String) {
        // Managed by backend or Retrofit headers if needed
    }
}
