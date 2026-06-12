package com.ai.study.companion.data.model

data class QuizData(
    val questions: List<Question>
)

data class Question(
    val type: String, // MCQ or TF
    val question: String,
    val options: List<String>? = null,
    val correctAnswer: String,
    val explanation: String
)
