package com.ai.smart.notes.data.model

data class UserStats(
    val totalNotes: Int = 0,
    val focusMinutes: Long = 0,
    val aiTasks: Int = 0,
    val username: String = "Explorer",
    val email: String = "",
    val streak: Int = 0,
    val experience: Int = 0,
    val level: Int = 1
)

data class QuizData(val quizzes: List<QuizQuestion>)

data class QuizQuestion(
    val question: String,
    val options: List<String>,
    val correctAnswer: String,
    val explanation: String? = null
)
