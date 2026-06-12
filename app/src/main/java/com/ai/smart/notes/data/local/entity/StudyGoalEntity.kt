package com.ai.smart.notes.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "study_goals")
data class StudyGoalEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val firebaseId: String? = null,
    val calendarEventId: String? = null,
    val topic: String,
    val scheduledTime: Long,
    val isCompleted: Boolean = false,
    val category: String = "General",
    val aiReasoning: String = ""
)
