package com.ai.study.companion.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.ai.study.companion.data.local.dao.StudyDao
import com.ai.study.companion.data.local.entity.QuizAttemptEntity
import com.ai.study.companion.data.local.entity.QuizEntity
import com.ai.study.companion.data.local.entity.SummaryEntity

@Database(
    entities = [SummaryEntity::class, QuizEntity::class, QuizAttemptEntity::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun studyDao(): StudyDao
}
