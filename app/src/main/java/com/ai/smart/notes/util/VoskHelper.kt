package com.ai.smart.notes.util

import android.content.Context
import org.vosk.Model
import org.vosk.Recognizer
import org.vosk.android.SpeechService
import org.vosk.android.StorageService
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class VoskHelper @Inject constructor() {
    private var model: Model? = null
    private var speechService: SpeechService? = null

    interface VoiceCallback {
        fun onResult(text: String)
        fun onError(error: String)
    }

    fun initModel(context: Context, onReady: () -> Unit) {
        if (model != null) {
            onReady()
            return
        }
        
        // Unpacks the offline voice model from src/main/assets/model-en-us
        StorageService.unpack(context, "model-en-us", "model",
            { m: Model ->
                model = m
                onReady()
            },
            { exception: IOException ->
                exception.printStackTrace()
            }
        )
    }

    fun startListening(callback: VoiceCallback) {
        val model = model ?: return callback.onError("Neural Voice Model not loaded. Ensure assets/model-en-us exists.")
        
        try {
            val rec = Recognizer(model, 16000.0f)
            speechService = SpeechService(rec, 16000.0f)
            speechService?.startListening(object : org.vosk.android.RecognitionListener {
                override fun onPartialResult(hypothesis: String) {}
                override fun onResult(hypothesis: String) {
                    callback.onResult(parseVoskJson(hypothesis))
                }
                override fun onFinalResult(hypothesis: String) {
                    callback.onResult(parseVoskJson(hypothesis))
                    stopListening()
                }
                override fun onError(exception: Exception) {
                    callback.onError(exception.message ?: "Neural Voice Error")
                }
                override fun onTimeout() {
                    stopListening()
                }
            })
        } catch (e: IOException) {
            callback.onError("IO Failure: ${e.message}")
        }
    }

    fun stopListening() {
        speechService?.stop()
        speechService = null
    }

    private fun parseVoskJson(json: String): String {
        return try {
            val prefix = "\"text\" : \""
            val start = json.indexOf(prefix)
            if (start != -1) {
                val end = json.indexOf("\"", start + prefix.length)
                if (end != -1) {
                    return json.substring(start + prefix.length, end)
                }
            }
            ""
        } catch (e: Exception) { "" }
    }
}
