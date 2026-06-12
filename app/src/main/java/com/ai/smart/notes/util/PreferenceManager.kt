package com.ai.smart.notes.util

import android.content.Context
import android.content.SharedPreferences
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PreferenceManager @Inject constructor(
    @ApplicationContext context: Context
) {
    private val prefs: SharedPreferences = context.getSharedPreferences("smart_notes_prefs", Context.MODE_PRIVATE)

    fun saveGeminiApiKey(key: String) {
        prefs.edit().putString("gemini_api_key", key).apply()
    }

    fun getGeminiApiKey(): String {
        return prefs.getString("gemini_api_key", "") ?: ""
    }

    fun setFontSizeMultiplier(multiplier: Float) {
        prefs.edit().putFloat("font_size_multiplier", multiplier).apply()
    }

    fun getFontSizeMultiplier(): Float {
        return prefs.getFloat("font_size_multiplier", 1.0f)
    }

    fun setEmail(email: String) {
        prefs.edit().putString("user_email", email).apply()
    }

    fun getEmail(): String? {
        return prefs.getString("user_email", null)
    }

    fun isDarkTheme(): Boolean {
        return prefs.getBoolean("is_dark_theme", true)
    }

    fun setDarkTheme(isDark: Boolean) {
        prefs.edit().putBoolean("is_dark_theme", isDark).apply()
    }
}
