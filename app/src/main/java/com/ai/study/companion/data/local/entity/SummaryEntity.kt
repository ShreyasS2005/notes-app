package com.ai.study.companion.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "summaries")
data class SummaryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val fileName: String,
    val filePath: String,
    val shortSummary: String,
    val bulletPoints: String,
    val keyConcepts: String,
    val timestamp: Long = System.currentTimeMillis()
)
