package com.ai.smart.notes.data.local.dao

import androidx.room.*
import com.ai.smart.notes.data.local.entity.*
import kotlinx.coroutines.flow.Flow

@Dao
interface NoteDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNote(note: NoteEntity): Long

    @Query("SELECT * FROM notes ORDER BY timestamp DESC")
    fun getAllNotes(): Flow<List<NoteEntity>>

    @Query("SELECT * FROM notes WHERE title LIKE '%' || :query || '%' OR content LIKE '%' || :query || '%'")
    fun searchNotes(query: String): Flow<List<NoteEntity>>

    @Update
    suspend fun updateNote(note: NoteEntity)

    @Delete
    suspend fun deleteNote(note: NoteEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFlashcards(flashcards: List<FlashcardEntity>)

    @Update
    suspend fun updateFlashcard(flashcard: FlashcardEntity)

    @Query("SELECT * FROM flashcards WHERE noteId = :noteId")
    fun getFlashcardsForNote(noteId: Long): Flow<List<FlashcardEntity>>

    @Query("SELECT * FROM flashcards WHERE nextDueDate <= :currentTime ORDER BY nextDueDate ASC")
    fun getDueFlashcards(currentTime: Long): Flow<List<FlashcardEntity>>

    @Query("DELETE FROM flashcards WHERE noteId = :noteId")
    suspend fun deleteFlashcardsForNote(noteId: Long)

    @Transaction
    suspend fun replaceFlashcardsForNote(noteId: Long, flashcards: List<FlashcardEntity>) {
        deleteFlashcardsForNote(noteId)
        insertFlashcards(flashcards)
    }

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuiz(quiz: QuizEntity): Long

    @Query("SELECT * FROM quizzes WHERE noteId = :noteId")
    fun getQuizzesForNote(noteId: Long): Flow<List<QuizEntity>>

    @Insert
    suspend fun insertQuizResult(result: QuizResultEntity)

    @Query("SELECT * FROM quiz_results ORDER BY timestamp DESC")
    fun getAllQuizResults(): Flow<List<QuizResultEntity>>

    // Study Goals
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStudyGoal(goal: StudyGoalEntity): Long

    @Query("SELECT * FROM study_goals ORDER BY scheduledTime ASC")
    fun getAllStudyGoals(): Flow<List<StudyGoalEntity>>

    @Update
    suspend fun updateStudyGoal(goal: StudyGoalEntity)

    @Delete
    suspend fun deleteStudyGoal(goal: StudyGoalEntity)
}
