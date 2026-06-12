package com.ai.smart.notes.util

import android.content.Context
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TtsHelper @Inject constructor() : TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = null
    private var isReady = false
    private var onSpeechStateChanged: ((Boolean) -> Unit)? = null

    fun init(context: Context) {
        if (tts == null) {
            tts = TextToSpeech(context, this)
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            setLanguage(Locale.US)
            isReady = true
            
            tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {
                    onSpeechStateChanged?.invoke(true)
                }

                override fun onDone(utteranceId: String?) {
                    onSpeechStateChanged?.invoke(false)
                }

                override fun onError(utteranceId: String?) {
                    onSpeechStateChanged?.invoke(false)
                }
            })
        }
    }

    fun setSpeechStateListener(listener: (Boolean) -> Unit) {
        onSpeechStateChanged = listener
    }

    fun setLanguage(locale: Locale) {
        tts?.setLanguage(locale)
    }

    fun speak(text: String) {
        if (isReady) {
            val hasTamil = text.any { it in '\u0B80'..'\u0BFF' }
            if (hasTamil) {
                setLanguage(Locale("ta", "IN"))
            } else {
                setLanguage(Locale.US)
            }
            val params = Bundle()
            params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, "note_speech")
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, params, "note_speech")
        }
    }

    fun isSpeaking(): Boolean {
        return tts?.isSpeaking == true
    }

    fun stop() {
        tts?.stop()
        onSpeechStateChanged?.invoke(false)
    }

    fun shutdown() {
        tts?.shutdown()
        tts = null
        isReady = false
    }
}
