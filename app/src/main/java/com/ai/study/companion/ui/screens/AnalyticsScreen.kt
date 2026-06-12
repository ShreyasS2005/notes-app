package com.ai.study.companion.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.hilt.navigation.compose.hiltViewModel
import com.ai.study.companion.data.local.entity.QuizAttemptEntity
import com.ai.study.companion.ui.viewmodel.StudyViewModel
import com.github.mikephil.charting.charts.LineChart
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.LineData
import com.github.mikephil.charting.data.LineDataSet

@Composable
fun AnalyticsScreen(viewModel: StudyViewModel = hiltViewModel()) {
    val attempts by viewModel.attempts.collectAsState(initial = emptyList())

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        item {
            Text(
                text = "Performance Analytics",
                style = MaterialTheme.typography.headlineMedium,
                modifier = Modifier.padding(bottom = 16.dp)
            )
        }

        if (attempts.isEmpty()) {
            item {
                Text("No quiz attempts yet. Take a quiz to see your progress!")
            }
        } else {
            item {
                ScoreOverTimeChart(attempts)
            }
            item {
                Spacer(modifier = Modifier.height(24.dp))
                SummaryStats(attempts)
            }
        }
    }
}

@Composable
fun ScoreOverTimeChart(attempts: List<QuizAttemptEntity>) {
    Text(text = "Score Progress", style = MaterialTheme.typography.titleMedium)
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(300.dp)
            .padding(vertical = 8.dp)
    ) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { context ->
                LineChart(context).apply {
                    description.isEnabled = false
                    setTouchEnabled(true)
                    setPinchZoom(true)
                }
            },
            update = { chart ->
                val entries = attempts.reversed().mapIndexed { index, attempt ->
                    Entry(index.toFloat(), (attempt.score.toFloat() / attempt.totalQuestions) * 100)
                }
                val dataSet = LineDataSet(entries, "Accuracy %").apply {
                    color = android.graphics.Color.BLUE
                    valueTextColor = android.graphics.Color.BLACK
                    lineWidth = 2f
                    setCircleColor(android.graphics.Color.BLUE)
                }
                chart.data = LineData(dataSet)
                chart.invalidate()
            }
        )
    }
}

@Composable
fun SummaryStats(attempts: List<QuizAttemptEntity>) {
    val avgScore = if (attempts.isNotEmpty()) {
        attempts.map { it.score.toFloat() / it.totalQuestions }.average() * 100
    } else 0.0
    
    Column {
        Text(text = "Quick Stats", style = MaterialTheme.typography.titleMedium)
        Card(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Average Accuracy: ${String.format("%.1f", avgScore)}%")
                Text("Total Quizzes Taken: ${attempts.size}")
            }
        }
    }
}
