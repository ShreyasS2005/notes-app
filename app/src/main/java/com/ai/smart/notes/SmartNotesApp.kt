package com.ai.smart.notes

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class SmartNotesApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialization moved to PdfParser to avoid app-wide build failure if possible
    }
}
