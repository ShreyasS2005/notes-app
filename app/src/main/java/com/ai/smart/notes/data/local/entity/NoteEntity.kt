package com.ai.smart.notes.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "notes")
data class NoteEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val firebaseId: String? = null,
    val title: String,
    val content: String,
    val summary: String? = null,
    val type: String = "text", // text, pdf, image
    val timestamp: Long = System.currentTimeMillis()
)
