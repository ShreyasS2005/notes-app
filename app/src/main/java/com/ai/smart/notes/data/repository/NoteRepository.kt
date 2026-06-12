package com.ai.smart.notes.data.repository

import com.ai.smart.notes.data.local.dao.BadgeDao
import com.ai.smart.notes.data.local.dao.NoteDao
import com.ai.smart.notes.data.local.entity.*
import com.ai.smart.notes.ui.viewmodel.UserStats
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

data class SharedNote(
    val id: String = "",
    val title: String = "",
    val content: String = "",
    val senderName: String = "",
    val senderEmail: String = ""
)

@Singleton
class NoteRepository @Inject constructor(
    private val noteDao: NoteDao,
    private val badgeDao: BadgeDao,
    private val firestore: FirebaseFirestore,
    private val auth: FirebaseAuth
) {
    val allNotes: Flow<List<NoteEntity>> = noteDao.getAllNotes()
    val allStudyGoals: Flow<List<StudyGoalEntity>> = noteDao.getAllStudyGoals()
    val allBadges: Flow<List<BadgeEntity>> = badgeDao.getAllBadges()
    val allQuizResults: Flow<List<QuizResultEntity>> = noteDao.getAllQuizResults()

    fun getUserStats(): Flow<UserStats> = callbackFlow {
        val userId = auth.currentUser?.uid
        val listener = if (userId != null) {
            val docRef = firestore.collection("users").document(userId)
            docRef.addSnapshotListener { snapshot, error ->
                if (error != null) return@addSnapshotListener
                if (snapshot != null && snapshot.exists()) {
                    val stats = UserStats(
                        totalNotes = (snapshot.getLong("total_notes") ?: 0).toInt(),
                        focusMinutes = snapshot.getLong("focus_minutes") ?: 0,
                        aiTasks = (snapshot.getLong("ai_tasks_performed") ?: 0).toInt(),
                        username = snapshot.getString("username") ?: "Explorer",
                        email = snapshot.getString("email") ?: auth.currentUser?.email ?: "",
                        streak = (snapshot.getLong("streak") ?: 0).toInt(),
                        experience = (snapshot.getLong("experience") ?: 0).toInt(),
                        level = (snapshot.getLong("level") ?: 1).toInt(),
                        notesShared = (snapshot.getLong("notes_shared") ?: 0).toInt()
                    )
                    trySend(stats)
                } else {
                    docRef.set(mapOf(
                        "total_notes" to 0,
                        "focus_minutes" to 0,
                        "ai_tasks_performed" to 0,
                        "username" to (auth.currentUser?.displayName ?: "Explorer"),
                        "email" to (auth.currentUser?.email ?: ""),
                        "streak" to 0,
                        "experience" to 0,
                        "level" to 1,
                        "last_activity_timestamp" to 0L,
                        "notes_shared" to 0
                    ))
                }
            }
        } else {
            trySend(UserStats())
            null
        }
        awaitClose { listener?.remove() }
    }

    suspend fun initBadges() {
        val initialBadges = listOf(
            BadgeEntity("note_1", "Neural Scribe", "Create your first note", "description", target = 1),
            BadgeEntity("note_10", "Data Architect", "Create 10 notes", "library_books", target = 10),
            BadgeEntity("focus_60", "Deep Focus", "Complete 60 minutes of study", "timer", target = 60),
            BadgeEntity("streak_3", "Steady Path", "Maintain a 3-day streak", "local_fire_department", target = 3),
            BadgeEntity("share_1", "Neural Node", "Share a note with the world", "share", target = 1),
            BadgeEntity("level_5", "Ascendant", "Reach Level 5", "trending_up", target = 5)
        )
        initialBadges.forEach { badge ->
            if (badgeDao.getBadgeById(badge.id) == null) {
                badgeDao.insertBadges(listOf(badge))
            }
        }
    }

    private suspend fun checkBadges() {
        val notesCount = noteDao.getAllNotes().first().size
        val stats = getUserStats().first()
        
        updateBadgeProgress("note_1", notesCount)
        updateBadgeProgress("note_10", notesCount)
        updateBadgeProgress("focus_60", stats.focusMinutes.toInt())
        updateBadgeProgress("streak_3", stats.streak)
        updateBadgeProgress("share_1", stats.notesShared)
        updateBadgeProgress("level_5", stats.level)
    }

    private suspend fun updateBadgeProgress(id: String, currentProgress: Int) {
        val badge = badgeDao.getBadgeById(id) ?: return
        if (badge.isUnlocked) return
        
        val newProgress = if (currentProgress > badge.target) badge.target else currentProgress
        val isNowUnlocked = newProgress >= badge.target
        
        if (newProgress != badge.progress || isNowUnlocked) {
            badgeDao.updateBadge(badge.copy(progress = newProgress, isUnlocked = isNowUnlocked))
            if (isNowUnlocked) awardExperience(500)
        }
    }

    suspend fun awardExperience(amount: Int) {
        val userId = auth.currentUser?.uid ?: return
        val docRef = firestore.collection("users").document(userId)
        firestore.runTransaction { transaction ->
            val snapshot = transaction.get(docRef)
            val currentExp = (snapshot.getLong("experience") ?: 0) + amount
            val currentLevel = snapshot.getLong("level") ?: 1
            val nextLevelThreshold = currentLevel * 1000
            
            if (currentExp >= nextLevelThreshold) {
                transaction.update(docRef, "level", currentLevel + 1)
                transaction.update(docRef, "experience", currentExp - nextLevelThreshold)
            } else {
                transaction.update(docRef, "experience", currentExp)
            }
        }.await()
        checkBadges()
    }

    suspend fun saveNote(note: NoteEntity): Long {
        val id = noteDao.insertNote(note)
        syncNoteToFirebase(note.copy(id = id))
        incrementStat("total_notes")
        awardExperience(50)
        return id
    }

    suspend fun deleteNote(note: NoteEntity) {
        noteDao.deleteNote(note)
        deleteNoteFromFirebase(note)
        decrementStat("total_notes")
    }

    private suspend fun incrementStat(field: String) {
        val userId = auth.currentUser?.uid ?: return
        firestore.collection("users").document(userId).update(field, FieldValue.increment(1)).await()
    }

    private suspend fun decrementStat(field: String) {
        val userId = auth.currentUser?.uid ?: return
        firestore.collection("users").document(userId).update(field, FieldValue.increment(-1)).await()
    }

    suspend fun logShare() {
        incrementStat("notes_shared")
        awardExperience(100)
    }

    suspend fun logFocusSession(minutes: Long) {
        val userId = auth.currentUser?.uid ?: return
        firestore.collection("users").document(userId).update("focus_minutes", FieldValue.increment(minutes)).await()
        awardExperience((minutes * 10).toInt())
    }

    suspend fun shareNote(note: NoteEntity, recipientEmail: String) {
        val senderName = auth.currentUser?.displayName ?: "Explorer"
        val recipientQuery = firestore.collection("users").whereEqualTo("email", recipientEmail).get().await()
        val recipientDoc = recipientQuery.documents.firstOrNull() ?: throw Exception("User not found.")
        val sharedNoteMap = hashMapOf(
            "title" to note.title,
            "content" to note.content,
            "senderName" to senderName,
            "senderEmail" to (auth.currentUser?.email ?: ""),
            "timestamp" to FieldValue.serverTimestamp()
        )
        firestore.collection("users").document(recipientDoc.id).collection("shared_notes").add(sharedNoteMap).await()
        logShare()
    }

    fun getSharedNotes(): Flow<List<SharedNote>> = callbackFlow {
        val userId = auth.currentUser?.uid
        val listener = if (userId != null) {
            firestore.collection("users").document(userId).collection("shared_notes")
                .orderBy("timestamp", Query.Direction.DESCENDING)
                .addSnapshotListener { snapshot, _ ->
                    val notes = snapshot?.documents?.mapNotNull { doc ->
                        SharedNote(doc.id, doc.getString("title") ?: "", doc.getString("content") ?: "", doc.getString("senderName") ?: "", doc.getString("senderEmail") ?: "")
                    } ?: emptyList()
                    trySend(notes)
                }
        } else {
            trySend(emptyList())
            null
        }
        awaitClose { listener?.remove() }
    }

    suspend fun updateUsername(newName: String) {
        val userId = auth.currentUser?.uid ?: return
        firestore.collection("users").document(userId).update("username", newName).await()
    }

    private suspend fun syncNoteToFirebase(note: NoteEntity) {
        val userId = auth.currentUser?.uid ?: return
        val noteMap = hashMapOf("title" to note.title, "content" to note.content, "type" to note.type, "timestamp" to note.timestamp)
        val docRef = if (note.firebaseId != null) firestore.collection("users").document(userId).collection("notes").document(note.firebaseId)
        else firestore.collection("users").document(userId).collection("notes").document()
        docRef.set(noteMap).await()
        if (note.firebaseId == null) noteDao.updateNote(note.copy(firebaseId = docRef.id))
    }

    private suspend fun deleteNoteFromFirebase(note: NoteEntity) {
        val userId = auth.currentUser?.uid ?: return
        val firebaseId = note.firebaseId ?: return
        try {
            firestore.collection("users").document(userId)
                .collection("notes").document(firebaseId)
                .delete().await()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun addStudyGoal(goal: StudyGoalEntity) = noteDao.insertStudyGoal(goal)
    suspend fun updateStudyGoal(goal: StudyGoalEntity) = noteDao.updateStudyGoal(goal)
    fun searchNotes(query: String) = noteDao.searchNotes(query)
    suspend fun acceptSharedNote(sharedNote: SharedNote) {
        saveNote(NoteEntity(title = sharedNote.title, content = sharedNote.content, type = "shared"))
        deleteSharedNote(sharedNote.id)
    }
    suspend fun deleteSharedNote(sharedId: String) {
        val userId = auth.currentUser?.uid ?: return
        firestore.collection("users").document(userId).collection("shared_notes").document(sharedId).delete().await()
    }

    fun getFlashcardsForNote(noteId: Long) = noteDao.getFlashcardsForNote(noteId)
    suspend fun reviewFlashcard(flashcard: FlashcardEntity, quality: Int) {
        // Simple SM-2 like update
        val newRepetitions = if (quality >= 3) flashcard.repetitions + 1 else 0
        val newInterval = when (newRepetitions) {
            0 -> 0
            1 -> 1
            2 -> 6
            else -> (flashcard.interval * flashcard.easinessFactor).toInt()
        }
        val newEasinessFactor = (flashcard.easinessFactor + (0.1f - (5 - quality) * (0.08f + (5 - quality) * 0.02f))).coerceAtLeast(1.3f)
        val nextDueDate = System.currentTimeMillis() + (newInterval * 24 * 60 * 60 * 1000L)
        
        noteDao.updateFlashcard(flashcard.copy(
            repetitions = newRepetitions,
            interval = newInterval,
            easinessFactor = newEasinessFactor,
            nextDueDate = nextDueDate
        ))
    }

    fun getQuizzesForNote(noteId: Long) = noteDao.getQuizzesForNote(noteId)
    suspend fun saveQuizResult(result: QuizResultEntity) = noteDao.insertQuizResult(result)
}
