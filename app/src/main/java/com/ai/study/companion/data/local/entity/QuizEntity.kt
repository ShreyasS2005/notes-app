package com.ai.study.companion.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "quizzes")
data class QuizEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val summaryId: Long,
    val title: String,
    val questionsJson: String, // Store as JSON for simplicity, or use a separate table
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "quiz_attempts")
data class QuizAttemptEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val quizId: Long,
    val score: Int,
    val totalQuestions: Int,
    val timeTakenSeconds: Long,
    val timestamp: Long = System.currentTimeMillis()
)
