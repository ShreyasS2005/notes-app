package com.ai.study.companion.data.local.dao

import androidx.room.*
import com.ai.study.companion.data.local.entity.QuizAttemptEntity
import com.ai.study.companion.data.local.entity.QuizEntity
import com.ai.study.companion.data.local.entity.SummaryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface StudyDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSummary(summary: SummaryEntity): Long

    @Query("SELECT * FROM summaries ORDER BY timestamp DESC")
    fun getAllSummaries(): Flow<List<SummaryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuiz(quiz: QuizEntity): Long

    @Query("SELECT * FROM quizzes WHERE summaryId = :summaryId")
    fun getQuizzesBySummary(summaryId: Long): Flow<List<QuizEntity>>

    @Insert
    suspend fun insertQuizAttempt(attempt: QuizAttemptEntity)

    @Query("SELECT * FROM quiz_attempts ORDER BY timestamp DESC")
    fun getAllQuizAttempts(): Flow<List<QuizAttemptEntity>>
    
    @Query("SELECT * FROM quiz_attempts WHERE quizId = :quizId")
    fun getAttemptsForQuiz(quizId: Long): Flow<List<QuizAttemptEntity>>
}
