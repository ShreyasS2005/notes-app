package com.ai.smart.notes.ui.viewmodel

import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.work.Data
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.ai.smart.notes.data.local.entity.*
import com.ai.smart.notes.data.remote.AiService
import com.ai.smart.notes.data.repository.NoteRepository
import com.ai.smart.notes.data.repository.SharedNote
import com.ai.smart.notes.util.*
import com.ai.smart.notes.data.worker.ReminderWorker
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit
import javax.inject.Inject

@HiltViewModel
class NoteViewModel @Inject constructor(
    private val repository: NoteRepository,
    private val aiService: AiService,
    private val ocrHelper: OcrHelper,
    private val pdfParser: PdfParser,
    private val preferenceManager: PreferenceManager,
    private val calendarHelper: CalendarHelper,
    private val voskHelper: VoskHelper,
    private val ttsHelper: TtsHelper,
    private val pdfHelper: PdfHelper
) : ViewModel() {

    init {
        viewModelScope.launch {
            repository.initBadges()
        }
    }

    private val _uiState = MutableStateFlow<NoteUiState>(NoteUiState.Idle)
    val uiState = _uiState.asStateFlow()

    private val _predictedTime = MutableStateFlow<String?>(null)
    val predictedTime = _predictedTime.asStateFlow()

    private val _characterCount = MutableStateFlow(0)
    val characterCount = _characterCount.asStateFlow()

    private val _fontSize = MutableStateFlow(16f)
    val fontSize = _fontSize.asStateFlow()

    private val _isListening = MutableStateFlow(false)
    val isListening = _isListening.asStateFlow()

    private val _isVoskModelReady = MutableStateFlow(false)
    val isVoskModelReady = _isVoskModelReady.asStateFlow()

    private val _translatedText = MutableStateFlow<String?>(null)
    val translatedText = _translatedText.asStateFlow()

    private val _isSpeaking = MutableStateFlow(false)
    val isSpeaking = _isSpeaking.asStateFlow()

    val allNotes = repository.allNotes
    val allStudyGoals = repository.allStudyGoals
    val allBadges = repository.allBadges
    val allQuizResults = repository.allQuizResults

    val userStats: StateFlow<UserStats?> = repository.getUserStats()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val sharedNotes: StateFlow<List<SharedNote>> = repository.getSharedNotes()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun updateNoteMetrics(content: String) {
        _characterCount.value = content.length
        if (content.length > 50) {
            predictStudyTime(content)
        } else {
            _predictedTime.value = "Short Note"
        }
    }

    fun updateFontSize(newSize: Float) {
        _fontSize.value = newSize.coerceIn(12f, 40f)
    }

    fun addTextNote(title: String, content: String) {
        viewModelScope.launch {
            repository.saveNote(NoteEntity(title = title, content = content))
        }
    }

    fun deleteNote(noteId: Long) {
        viewModelScope.launch {
            val currentNotes = allNotes.first()
            val noteToDelete = currentNotes.find { it.id == noteId }
            noteToDelete?.let {
                repository.deleteNote(it)
                _uiState.value = NoteUiState.Success("Note deleted successfully.")
            }
        }
    }

    fun translateToTamil(text: String) {
        viewModelScope.launch {
            _uiState.value = NoteUiState.Loading("Translating to Tamil...")
            try {
                // Using AI Service to translate via a custom prompt
                val prompt = "Translate the following text into Tamil language. Provide ONLY the translated text:\n\n$text"
                val result = aiService.chat(prompt)
                _translatedText.value = result
                _uiState.value = NoteUiState.Success("Translation complete.")
            } catch (e: Exception) {
                _uiState.value = NoteUiState.Error("Translation failed.")
            }
        }
    }

    fun clearTranslation() {
        _translatedText.value = null
    }

    fun toggleSpeakText(text: String) {
        if (_isSpeaking.value) {
            ttsHelper.stop()
            _isSpeaking.value = false
        } else {
            ttsHelper.speak(text)
            _isSpeaking.value = true
        }
    }

    fun initTts(context: Context) {
        ttsHelper.init(context)
        ttsHelper.setSpeechStateListener { speaking ->
            _isSpeaking.value = speaking
        }
    }

    fun addStudyGoal(topic: String, timeMillis: Long, context: Context, syncToCalendar: Boolean = false) {
        viewModelScope.launch {
            repository.addStudyGoal(StudyGoalEntity(topic = topic, scheduledTime = timeMillis))
            scheduleAppNotification(context, topic, timeMillis)
            if (syncToCalendar) {
                calendarHelper.addEventToCalendar(context, "Study: $topic", "Planned via SmartNotes AI", timeMillis)
            }
        }
    }

    fun updateStudyGoal(goal: StudyGoalEntity) {
        viewModelScope.launch {
            repository.updateStudyGoal(goal)
            if (goal.isCompleted) {
                repository.awardExperience(100)
            }
        }
    }

    private fun scheduleAppNotification(context: Context, topic: String, timeMillis: Long) {
        val delay = timeMillis - System.currentTimeMillis()
        if (delay > 0) {
            val data = Data.Builder()
                .putString("title", "Neural Study Alert")
                .putString("message", "Time to focus on: $topic")
                .build()

            val workRequest = OneTimeWorkRequestBuilder<ReminderWorker>()
                .setInitialDelay(delay, TimeUnit.MILLISECONDS)
                .setInputData(data)
                .addTag("reminder")
                .build()

            WorkManager.getInstance(context).enqueue(workRequest)
        }
    }

    fun processImageNote(context: Context, uri: Uri, title: String) {
        viewModelScope.launch {
            _uiState.value = NoteUiState.Loading("Neural Scanning...")
            try {
                val text = ocrHelper.extractTextFromImage(context, uri)
                if (text.isNotEmpty()) {
                    repository.saveNote(NoteEntity(title = title, content = text, type = "image"))
                    _uiState.value = NoteUiState.Success("Scan Complete. Text extracted.")
                } else {
                    _uiState.value = NoteUiState.Error("No text detected in image.")
                }
            } catch (e: Exception) {
                _uiState.value = NoteUiState.Error("OCR failed: ${e.message}")
            }
        }
    }

    fun processPdfNote(context: Context, uri: Uri, title: String) {
        viewModelScope.launch {
            _uiState.value = NoteUiState.Loading("Parsing PDF Data...")
            val text = pdfParser.extractTextFromPdf(context, uri)
            if (text.isNotEmpty()) {
                repository.saveNote(NoteEntity(title = title, content = text, type = "pdf"))
                _uiState.value = NoteUiState.Success("Import Successful.")
            } else {
                _uiState.value = NoteUiState.Error("Failed to extract PDF text.")
            }
        }
    }

    fun predictStudyTime(content: String) {
        viewModelScope.launch {
            val result = aiService.predictStudyTime(content)
            _predictedTime.value = result
        }
    }

    fun initVosk(context: Context) {
        if (_isVoskModelReady.value) return
        viewModelScope.launch {
            voskHelper.initModel(context) {
                _isVoskModelReady.value = true
            }
        }
    }

    fun startVoiceCapture(onResult: (String) -> Unit) {
        if (!_isVoskModelReady.value) {
            _uiState.value = NoteUiState.Error("Neural Voice Model is unpacking. Please wait.")
            return
        }
        _isListening.value = true
        voskHelper.startListening(object : VoskHelper.VoiceCallback {
            override fun onResult(text: String) {
                if (text.isNotBlank()) onResult(text)
                _isListening.value = false
            }
            override fun onError(error: String) {
                Log.e("NoteViewModel", "Voice Error: $error")
                _uiState.value = NoteUiState.Error("Voice Engine Error: $error")
                _isListening.value = false
            }
        })
    }

    fun stopVoiceCapture() {
        voskHelper.stopListening()
        _isListening.value = false
    }

    fun logFocusTime(minutes: Long) {
        viewModelScope.launch {
            repository.logFocusSession(minutes)
        }
    }

    fun shareNote(noteId: Long, recipientEmail: String) {
        viewModelScope.launch {
            _uiState.value = NoteUiState.Loading("Sharing Note...")
            val notes = allNotes.first()
            val note = notes.find { it.id == noteId }
            if (note != null) {
                try {
                    repository.shareNote(note, recipientEmail)
                    _uiState.value = NoteUiState.Success("Note shared successfully!")
                } catch (e: Exception) {
                    _uiState.value = NoteUiState.Error(e.message ?: "User not found.")
                }
            }
        }
    }

    fun shareAsPdf(context: Context, noteId: Long) {
        viewModelScope.launch {
            val notes = allNotes.first()
            val note = notes.find { it.id == noteId }
            note?.let {
                pdfHelper.generateAndSharePdf(context, it.title, it.content)
                repository.logShare() 
            }
        }
    }

    fun getFlashcards(noteId: Long) = repository.getFlashcardsForNote(noteId)
    fun reviewFlashcard(flashcard: FlashcardEntity, quality: Int) = viewModelScope.launch { repository.reviewFlashcard(flashcard, quality) }
    
    fun getQuizzes(noteId: Long) = repository.getQuizzesForNote(noteId)
    fun saveQuizResult(quizId: Long, score: Int, total: Int) {
        viewModelScope.launch {
            repository.saveQuizResult(QuizResultEntity(quizId = quizId, score = score, total = total))
        }
    }
    fun generateFlashcardsFromIncorrect(noteId: Long, incorrectAnswers: List<com.ai.smart.notes.ui.screens.QuizQuestion>) {
        // Implementation for later if needed
    }

    fun saveUserEmail(email: String) {
        preferenceManager.setEmail(email)
    }

    fun updateUsername(newName: String) = viewModelScope.launch { repository.updateUsername(newName) }
    fun acceptSharedNote(sharedNote: SharedNote) = viewModelScope.launch { repository.acceptSharedNote(sharedNote) }
    fun deleteSharedNote(sharedId: String) = viewModelScope.launch { repository.deleteSharedNote(sharedId) }
    fun searchNotes(query: String) = repository.searchNotes(query)

    override fun onCleared() {
        super.onCleared()
        ttsHelper.shutdown()
    }
}

data class UserStats(
    val totalNotes: Int = 0,
    val focusMinutes: Long = 0,
    val aiTasks: Int = 0,
    val username: String = "Explorer",
    val email: String = "",
    val streak: Int = 0,
    val experience: Int = 0,
    val level: Int = 1,
    val notesShared: Int = 0
)

sealed class NoteUiState {
    object Idle : NoteUiState()
    data class Loading(val message: String) : NoteUiState()
    data class Success(val message: String) : NoteUiState()
    data class Error(val message: String) : NoteUiState()
}
