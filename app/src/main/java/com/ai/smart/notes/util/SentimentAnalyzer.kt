package com.ai.smart.notes.util

import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SentimentAnalyzer @Inject constructor() {

    enum class Emotion {
        NEUTRAL, FRUSTRATED, CONFIDENT, CURIOUS
    }

    fun analyze(text: String): Emotion {
        val frustratedKeywords = listOf("hard", "difficult", "don't understand", "stuck", "confused", "impossible", "hate")
        val confidentKeywords = listOf("easy", "know", "got it", "understand", "simple", "piece of cake")
        
        val lowerText = text.lowercase()
        return when {
            frustratedKeywords.any { lowerText.contains(it) } -> Emotion.FRUSTRATED
            confidentKeywords.any { lowerText.contains(it) } -> Emotion.CONFIDENT
            else -> Emotion.NEUTRAL
        }
    }
}
