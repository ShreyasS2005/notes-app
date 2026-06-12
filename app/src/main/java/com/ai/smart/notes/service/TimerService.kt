package com.ai.smart.notes.service

import android.app.*
import android.content.Intent
import android.os.Binder
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.ai.smart.notes.ui.MainActivity
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.Locale

class TimerService : Service() {

    private val binder = TimerBinder()
    private val serviceScope = CoroutineScope(Dispatchers.Main + Job())
    private var timerJob: Job? = null

    private val _timeLeft = MutableStateFlow(0)
    val timeLeft = _timeLeft.asStateFlow()

    private val _isRunning = MutableStateFlow(false)
    val isRunning = _isRunning.asStateFlow()

    private var totalTime = 0

    override fun onBind(intent: Intent?): IBinder = binder

    inner class TimerBinder : Binder() {
        fun getService(): TimerService = this@TimerService
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    fun startTimer(durationSeconds: Int) {
        if (_isRunning.value) return
        
        totalTime = durationSeconds
        _timeLeft.value = durationSeconds
        _isRunning.value = true
        
        startForeground(NOTIFICATION_ID, createNotification(formatTime(durationSeconds)))
        
        timerJob = serviceScope.launch {
            while (_timeLeft.value > 0 && _isRunning.value) {
                delay(1000)
                _timeLeft.value -= 1
                updateNotification(formatTime(_timeLeft.value))
            }
            if (_timeLeft.value == 0) {
                onTimerFinished()
            }
        }
    }

    fun stopTimer() {
        timerJob?.cancel()
        _isRunning.value = false
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    fun pauseTimer() {
        _isRunning.value = false
        timerJob?.cancel()
        updateNotification("Paused: ${formatTime(_timeLeft.value)}")
    }

    fun resumeTimer() {
        if (_isRunning.value || _timeLeft.value <= 0) return
        _isRunning.value = true
        timerJob = serviceScope.launch {
            while (_timeLeft.value > 0 && _isRunning.value) {
                delay(1000)
                _timeLeft.value -= 1
                updateNotification(formatTime(_timeLeft.value))
            }
            if (_timeLeft.value == 0) {
                onTimerFinished()
            }
        }
    }

    private fun onTimerFinished() {
        _isRunning.value = false
        updateNotification("Focus Session Complete!")
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Focus Timer Channel",
            NotificationManager.IMPORTANCE_LOW
        )
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)
    }

    private fun createNotification(content: String): Notification {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Focus Timer")
            .setContentText(content)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    private fun updateNotification(content: String) {
        val notification = createNotification(content)
        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(NOTIFICATION_ID, notification)
    }

    private fun formatTime(seconds: Int): String {
        val minutes = seconds / 60
        val secs = seconds % 60
        return String.format(Locale.getDefault(), "%02d:%02d", minutes, secs)
    }

    override fun onDestroy() {
        serviceScope.cancel()
        super.onDestroy()
    }

    companion object {
        const val CHANNEL_ID = "timer_service_channel"
        const val NOTIFICATION_ID = 1
    }
}
