package com.ai.study.companion.ui.viewmodel

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ai.study.companion.data.local.entity.QuizAttemptEntity
import com.ai.study.companion.data.local.entity.QuizEntity
import com.ai.study.companion.data.local.entity.SummaryEntity
import com.ai.study.companion.data.repository.StudyRepository
import com.ai.study.companion.util.PdfParser
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class StudyViewModel @Inject constructor(
    private val repository: StudyRepository,
    private val pdfParser: PdfParser
) : ViewModel() {

    private val _uiState = MutableStateFlow<StudyUiState>(StudyUiState.Idle)
    val uiState: StateFlow<StudyUiState> = _uiState.asStateFlow()

    val summaries = repository.getAllSummaries()
    val attempts = repository.getAllQuizAttempts()

    fun getQuizzesBySummary(summaryId: Long) = repository.getQuizzesBySummary(summaryId)

    fun processPdf(context: Context, uri: Uri, fileName: String) {
        viewModelScope.launch {
            _uiState.value = StudyUiState.Loading("Extracting text from PDF...")
            val text = pdfParser.extractTextFromPdf(context, uri)
            
            if (text.isEmpty()) {
                _uiState.value = StudyUiState.Error("Could not extract text from PDF.")
                return@launch
            }

            _uiState.value = StudyUiState.Loading("Generating AI Summary...")
            try {
                val aiResponse = repository.generateAiSummary(text)
                val summary = SummaryEntity(
                    fileName = fileName,
                    filePath = uri.toString(),
                    shortSummary = aiResponse,
                    bulletPoints = "",
                    keyConcepts = ""
                )
                val summaryId = repository.saveSummary(summary)
                
                // Automatically generate a quiz for the new summary
                generateQuiz(text, summaryId)
                
                _uiState.value = StudyUiState.Success("Summary and Quiz generated!")
            } catch (e: Exception) {
                _uiState.value = StudyUiState.Error("AI Generation failed: \${e.message}")
            }
        }
    }

    fun generateQuiz(text: String, summaryId: Long) {
        viewModelScope.launch {
            try {
                val quizJson = repository.generateAiQuiz(text)
                val quiz = QuizEntity(
                    summaryId = summaryId,
                    title = "Quiz for Summary $summaryId",
                    questionsJson = quizJson
                )
                repository.saveQuiz(quiz)
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun saveAttempt(attempt: QuizAttemptEntity) {
        viewModelScope.launch {
            repository.saveQuizAttempt(attempt)
        }
    }
}

sealed class StudyUiState {
    object Idle : StudyUiState()
    data class Loading(val message: String) : StudyUiState()
    data class Success(val message: String) : StudyUiState()
    data class Error(val message: String) : StudyUiState()
}
