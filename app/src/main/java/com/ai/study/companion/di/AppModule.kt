package com.ai.study.companion.di

import android.content.Context
import androidx.room.Room
import com.ai.study.companion.data.local.AppDatabase
import com.ai.study.companion.data.local.dao.StudyDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object StudyModule {

    @Provides
    @Singleton
    fun provideStudyDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "study_companion.db"
        ).build()
    }

    @Provides
    fun provideStudyDao(database: AppDatabase): StudyDao {
        return database.studyDao()
    }
}
