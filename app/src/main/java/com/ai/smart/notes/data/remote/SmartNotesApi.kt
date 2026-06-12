package com.ai.smart.notes.data.remote

import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.POST
import retrofit2.http.Path

data class AiRequest(val content: String)
data class ChatRequest(val message: String, val history: List<ChatMessage> = emptyList())
data class ChatMessage(val role: String, val parts: List<ChatPart>)
data class ChatPart(val text: String)
data class AiResponse(val result: String)

interface SmartNotesApi {
    @POST("summarize")
    suspend fun getSummary(@Body request: AiRequest): AiResponse

    @POST("generate-quiz")
    suspend fun getQuiz(@Body request: AiRequest): AiResponse

    @POST("generate-flashcards")
    suspend fun getFlashcards(@Body request: AiRequest): AiResponse

    @POST("chat")
    suspend fun chat(@Body request: ChatRequest): AiResponse

    @POST("predict-time")
    suspend fun predictStudyTime(@Body request: AiRequest): AiResponse

    @POST("parse-intent")
    suspend fun parseIntent(@Body request: AiRequest): AiResponse

    @DELETE("notes/{id}")
    suspend fun deleteNote(@Path("id") id: Long): AiResponse
}
