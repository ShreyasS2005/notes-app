package com.ai.smart.notes.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.ai.smart.notes.data.local.dao.BadgeDao
import com.ai.smart.notes.data.local.dao.NoteDao
import com.ai.smart.notes.data.local.entity.*

@Database(
    entities = [
        NoteEntity::class, 
        FlashcardEntity::class, 
        QuizEntity::class, 
        QuizResultEntity::class,
        StudyGoalEntity::class,
        BadgeEntity::class
    ],
    version = 5,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun noteDao(): NoteDao
    abstract fun badgeDao(): BadgeDao
}
