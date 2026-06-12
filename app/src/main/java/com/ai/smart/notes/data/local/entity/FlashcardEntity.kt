package com.ai.smart.notes.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "flashcards")
data class FlashcardEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val noteId: Long,
    val front: String,
    val back: String,
    val explanation: String = "",
    // SM-2 Algorithm Fields
    val interval: Int = 0,
    val repetitions: Int = 0,
    val easinessFactor: Float = 2.5f,
    val nextDueDate: Long = System.currentTimeMillis()
)
