package com.ai.study.companion.data.repository

import com.ai.study.companion.data.local.dao.StudyDao
import com.ai.study.companion.data.local.entity.QuizAttemptEntity
import com.ai.study.companion.data.local.entity.QuizEntity
import com.ai.study.companion.data.local.entity.SummaryEntity
import com.ai.study.companion.data.remote.AiService
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class StudyRepository @Inject constructor(
    private val studyDao: StudyDao,
    private val aiService: AiService
) {
    fun getAllSummaries(): Flow<List<SummaryEntity>> = studyDao.getAllSummaries()

    suspend fun saveSummary(summary: SummaryEntity): Long = studyDao.insertSummary(summary)

    suspend fun generateAiSummary(text: String): String = aiService.generateSummary(text)

    suspend fun generateAiQuiz(text: String): String = aiService.generateQuiz(text)

    suspend fun saveQuiz(quiz: QuizEntity): Long = studyDao.insertQuiz(quiz)

    fun getQuizzesBySummary(summaryId: Long): Flow<List<QuizEntity>> = studyDao.getQuizzesBySummary(summaryId)

    suspend fun saveQuizAttempt(attempt: QuizAttemptEntity) = studyDao.insertQuizAttempt(attempt)

    fun getAllQuizAttempts(): Flow<List<QuizAttemptEntity>> = studyDao.getAllQuizAttempts()
}
