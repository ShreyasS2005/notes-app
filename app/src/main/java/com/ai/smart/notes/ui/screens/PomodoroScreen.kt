package com.ai.smart.notes.ui.screens

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.ai.smart.notes.service.TimerService
import com.ai.smart.notes.ui.theme.NeonPurple
import com.ai.smart.notes.ui.theme.TechBlue
import com.ai.smart.notes.ui.viewmodel.NoteViewModel
import java.util.*

@Composable
fun PomodoroScreen(viewModel: NoteViewModel = hiltViewModel()) {
    val context = LocalContext.current
    var timerService by remember { mutableStateOf<TimerService?>(null) }
    var isBound by remember { mutableStateOf(false) }

    val connection = remember {
        object : ServiceConnection {
            override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
                val binder = service as TimerService.TimerBinder
                timerService = binder.getService()
                isBound = true
            }

            override fun onServiceDisconnected(name: ComponentName?) {
                timerService = null
                isBound = false
            }
        }
    }

    DisposableEffect(Unit) {
        val intent = Intent(context, TimerService::class.java)
        context.bindService(intent, connection, Context.BIND_AUTO_CREATE)
        onDispose {
            if (isBound) {
                context.unbindService(connection)
                isBound = false
            }
        }
    }

    val timeLeft by timerService?.timeLeft?.collectAsState() ?: remember { mutableStateOf(0) }
    val isRunning by timerService?.isRunning?.collectAsState() ?: remember { mutableStateOf(false) }
    
    var selectedMinutes by remember { mutableStateOf(25) }
    var totalTime by remember { mutableStateOf(selectedMinutes * 60) }

    val progress = if (totalTime > 0) timeLeft.toFloat() / totalTime else 1f

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Box(
            modifier = Modifier
                .size(300.dp)
                .offset(x = (-50).dp, y = 100.dp)
                .blur(100.dp)
                .background(TechBlue.copy(alpha = 0.1f), RoundedCornerShape(150.dp))
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "Focus Timer",
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontWeight = FontWeight.Bold,
                    brush = Brush.horizontalGradient(listOf(TechBlue, NeonPurple))
                ),
                modifier = Modifier.semantics { contentDescription = "Focus Timer" }
            )
            
            Spacer(modifier = Modifier.height(32.dp))

            if (!isRunning) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = { if (selectedMinutes > 5) selectedMinutes -= 5 }) {
                        Icon(Icons.Default.RemoveCircleOutline, contentDescription = "Decrease", tint = TechBlue)
                    }
                    Text(
                        text = "$selectedMinutes min",
                        style = MaterialTheme.typography.titleLarge,
                        color = Color.White,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                    IconButton(onClick = { if (selectedMinutes < 120) selectedMinutes += 5 }) {
                        Icon(Icons.Default.AddCircleOutline, contentDescription = "Increase", tint = TechBlue)
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.size(280.dp)
            ) {
                Canvas(modifier = Modifier.size(250.dp)) {
                    drawArc(
                        color = Color.White.copy(alpha = 0.1f),
                        startAngle = -90f,
                        sweepAngle = 360f,
                        useCenter = false,
                        style = Stroke(width = 12.dp.toPx(), cap = StrokeCap.Round)
                    )
                    drawArc(
                        brush = Brush.sweepGradient(listOf(TechBlue, NeonPurple, TechBlue)),
                        startAngle = -90f,
                        sweepAngle = 360 * progress,
                        useCenter = false,
                        style = Stroke(width = 12.dp.toPx(), cap = StrokeCap.Round)
                    )
                }

                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = formatTime(if (isRunning) timeLeft else selectedMinutes * 60),
                        style = MaterialTheme.typography.displayLarge.copy(
                            fontWeight = FontWeight.Light,
                            color = Color.White,
                            fontSize = 64.sp
                        )
                    )
                    Text(
                        text = if (isRunning) "FOCUSING" else "READY",
                        style = MaterialTheme.typography.labelLarge,
                        color = TechBlue,
                        letterSpacing = 4.sp,
                        modifier = Modifier.semantics {
                            contentDescription = if (isRunning) "FOCUSING" else "READY"
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(64.dp))

            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(32.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
                    .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(32.dp))
                    .padding(horizontal = 24.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(24.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { 
                        timerService?.stopTimer()
                    }
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = "Reset", tint = Color.White)
                }

                FloatingActionButton(
                    onClick = { 
                        if (isRunning) {
                            timerService?.pauseTimer()
                        } else {
                            if (timeLeft > 0 && timeLeft < selectedMinutes * 60) {
                                timerService?.resumeTimer()
                            } else {
                                totalTime = selectedMinutes * 60
                                val intent = Intent(context, TimerService::class.java)
                                context.startForegroundService(intent)
                                timerService?.startTimer(totalTime)
                            }
                        }
                    },
                    containerColor = TechBlue,
                    contentColor = Color.White,
                    shape = CircleShape,
                    modifier = Modifier.size(64.dp)
                ) {
                    Icon(
                        if (isRunning) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = if (isRunning) "Pause" else "Play",
                        modifier = Modifier.size(32.dp)
                    )
                }
            }
        }
    }
}

private fun formatTime(seconds: Int): String {
    val minutes = seconds / 60
    val secs = seconds % 60
    return String.format(Locale.getDefault(), "%02d:%02d", minutes, secs)
}
