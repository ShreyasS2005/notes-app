package com.ai.study.companion

import android.app.Application

// Removed @HiltAndroidApp as only one is allowed per module.
// SmartNotesApp is the main application class used in AndroidManifest.xml.
class StudyCompanionApp : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
