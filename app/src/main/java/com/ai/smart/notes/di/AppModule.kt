package com.ai.smart.notes.di

import android.content.Context
import android.util.Log
import androidx.room.Room
import com.ai.smart.notes.data.local.AppDatabase
import com.ai.smart.notes.data.local.dao.BadgeDao
import com.ai.smart.notes.data.local.dao.NoteDao
import com.ai.smart.notes.data.remote.SmartNotesApi
import com.ai.smart.notes.util.*
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.File
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "smart_notes.db"
        )
        .fallbackToDestructiveMigration()
        .build()
    }

    @Provides
    fun provideNoteDao(database: AppDatabase): NoteDao {
        return database.noteDao()
    }

    @Provides
    fun provideBadgeDao(database: AppDatabase): BadgeDao {
        return database.badgeDao()
    }

    @Provides
    @Singleton
    fun provideFirebaseAuth(): FirebaseAuth = FirebaseAuth.getInstance()

    @Provides
    @Singleton
    fun provideFirebaseFirestore(): FirebaseFirestore = FirebaseFirestore.getInstance()

    @Provides
    @Singleton
    fun provideReminderHelper(): ReminderHelper = ReminderHelper()

    @Provides
    @Singleton
    fun provideVoskHelper(): VoskHelper = VoskHelper()

    @Provides
    @Singleton
    fun provideTtsHelper(): TtsHelper = TtsHelper()

    @Provides
    @Singleton
    fun provideSentimentAnalyzer(): SentimentAnalyzer = SentimentAnalyzer()

    @Provides
    @Singleton
    fun provideCalendarHelper(): CalendarHelper = CalendarHelper()

    @Provides
    @Singleton
    fun providePdfHelper(): PdfHelper = PdfHelper()

    @Provides
    @Singleton
    fun provideLlmInference(@ApplicationContext context: Context): LlmInference? {
        val modelFile = File(context.filesDir, "gemma-2b-it-cpu-int4.bin")
        
        if (!modelFile.exists()) {
            Log.e("AppModule", "Gemma model file not found at ${modelFile.absolutePath}")
            return null
        }

        return try {
            val options = LlmInference.LlmInferenceOptions.builder()
                .setModelPath(modelFile.absolutePath)
                .setMaxTokens(1024)
                .setMaxTopK(40)
                .build()
            LlmInference.createFromOptions(context, options)
        } catch (e: Exception) {
            Log.e("AppModule", "Failed to initialize LlmInference: ${e.message}")
            null
        }
    }

    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://us-central1-smartsnotesai.cloudfunctions.net/api/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideSmartNotesApi(retrofit: Retrofit): SmartNotesApi {
        return retrofit.create(SmartNotesApi::class.java)
    }
}
