package com.ai.smart.notes.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.ai.smart.notes.data.local.entity.NoteEntity
import com.ai.smart.notes.data.local.entity.QuizResultEntity
import com.ai.smart.notes.ui.theme.NeonPurple
import com.ai.smart.notes.ui.theme.TechBlue
import com.ai.smart.notes.ui.viewmodel.NoteViewModel
import com.github.mikephil.charting.charts.BarChart
import com.github.mikephil.charting.charts.PieChart
import com.github.mikephil.charting.data.*
import com.github.mikephil.charting.utils.ColorTemplate

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalyticsScreen(navController: NavController, viewModel: NoteViewModel = hiltViewModel()) {
    val notes by viewModel.allNotes.collectAsState(initial = emptyList<NoteEntity>())
    val results by viewModel.allQuizResults.collectAsState(initial = emptyList<QuizResultEntity>())
    val userStats by viewModel.userStats.collectAsState()

    val totalPossible = results.sumOf { it.total }
    val totalEarned = results.sumOf { it.score }
    val quizAvg = if (totalPossible > 0) (totalEarned.toFloat() / totalPossible) * 100f else 0f
    
    val focusHours = (userStats?.focusMinutes ?: 0L).toFloat() / 60f
    val masteryScore = ((notes.size * 1.5f) + (quizAvg * 0.5f) + (focusHours * 2)).coerceIn(0f, 100f).toInt()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Neural Analytics", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = TechBlue)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.primary
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(8.dp).clip(RoundedCornerShape(4.dp)).background(Color(0xFF00C853)))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Edge AI Core Active • Private Processing", style = MaterialTheme.typography.labelMedium, color = Color.Gray)
                }
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.05f)),
                    shape = RoundedCornerShape(24.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(24.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Mastery Level", style = MaterialTheme.typography.labelLarge, color = Color.Gray)
                            Text(
                                text = when {
                                    masteryScore > 80 -> "Expert Scholar"
                                    masteryScore > 50 -> "Active Learner"
                                    else -> "Foundation Builder"
                                },
                                style = MaterialTheme.typography.headlineSmall,
                                fontWeight = FontWeight.ExtraBold,
                                color = TechBlue
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            LinearProgressIndicator(
                                progress = { masteryScore / 100f },
                                modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                                color = TechBlue,
                                trackColor = Color.LightGray.copy(alpha = 0.3f)
                            )
                        }
                        Spacer(modifier = Modifier.width(24.dp))
                        Box(contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(
                                progress = { masteryScore / 100f },
                                modifier = Modifier.size(70.dp),
                                color = TechBlue,
                                strokeWidth = 6.dp,
                                trackColor = Color.LightGray.copy(alpha = 0.2f)
                            )
                            Text("$masteryScore%", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = MaterialTheme.colorScheme.onSurface)
                        }
                    }
                }
            }

            item {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatCard("Notes", notes.size.toString(), Icons.Default.Description, TechBlue, Modifier.weight(1f))
                    StatCard("Focus", "${userStats?.focusMinutes ?: 0}m", Icons.Default.Timer, NeonPurple, Modifier.weight(1f))
                    StatCard("Quiz Avg", "${quizAvg.toInt()}%", Icons.Default.Psychology, Color(0xFF009688), Modifier.weight(1f))
                }
            }

            item {
                Text("Topic Distribution", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                TopicDistributionChart(notes.map { it.title })
            }

            item {
                Text("Learning Consistency", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                PerformanceBarChart(results)
            }
        }
    }
}

@Composable
fun StatCard(label: String, value: String, icon: ImageVector, color: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(icon, contentDescription = label, tint = color, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.height(4.dp))
            Text(value, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = color)
            Text(label, style = MaterialTheme.typography.labelSmall, color = color.copy(alpha = 0.7f))
        }
    }
}

@Composable
fun TopicDistributionChart(titles: List<String>) {
    val keywords = listOf("Math", "Science", "History", "Tech", "Personal", "Work", "Exam", "Code")
    val distribution = keywords.associateWith { keyword ->
        titles.count { it.contains(keyword, ignoreCase = true) }
    }.filter { it.value > 0 }.ifEmpty { if(titles.isNotEmpty()) mapOf("General" to titles.size) else emptyMap() }

    Card(
        modifier = Modifier.fillMaxWidth().height(280.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)),
        shape = RoundedCornerShape(24.dp)
    ) {
        if (distribution.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No data cycles found.", color = Color.Gray)
            }
        } else {
            AndroidView(
                modifier = Modifier.fillMaxSize().padding(16.dp),
                factory = { context ->
                    PieChart(context).apply {
                        description.isEnabled = false
                        isDrawHoleEnabled = true
                        setHoleColor(android.graphics.Color.TRANSPARENT)
                        setEntryLabelColor(android.graphics.Color.BLACK)
                        legend.isEnabled = true
                        legend.textColor = android.graphics.Color.BLACK
                        legend.verticalAlignment = com.github.mikephil.charting.components.Legend.LegendVerticalAlignment.BOTTOM
                        legend.horizontalAlignment = com.github.mikephil.charting.components.Legend.LegendHorizontalAlignment.CENTER
                        animateY(1000)
                    }
                },
                update = { chart ->
                    val entries = distribution.map { PieEntry(it.value.toFloat(), it.key) }
                    val dataSet = PieDataSet(entries, "").apply {
                        colors = ColorTemplate.MATERIAL_COLORS.toList()
                        valueTextSize = 12f
                        valueTextColor = android.graphics.Color.BLACK
                    }
                    chart.data = PieData(dataSet)
                    chart.invalidate()
                }
            )
        }
    }
}

@Composable
fun PerformanceBarChart(results: List<QuizResultEntity>) {
    Card(
        modifier = Modifier.fillMaxWidth().height(250.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)),
        shape = RoundedCornerShape(24.dp)
    ) {
        if (results.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Complete quizzes to track performance.", color = Color.Gray)
            }
        } else {
            AndroidView(
                modifier = Modifier.fillMaxSize().padding(12.dp),
                factory = { context ->
                    BarChart(context).apply {
                        description.isEnabled = false
                        xAxis.setDrawGridLines(false)
                        xAxis.position = com.github.mikephil.charting.components.XAxis.XAxisPosition.BOTTOM
                        xAxis.textColor = android.graphics.Color.BLACK
                        axisLeft.textColor = android.graphics.Color.BLACK
                        axisLeft.axisMinimum = 0f
                        axisLeft.axisMaximum = 100f
                        axisRight.isEnabled = false
                        legend.isEnabled = false
                        animateY(1000)
                    }
                },
                update = { chart ->
                    val entries = results.takeLast(7).mapIndexed { index, result ->
                        val pct = if (result.total > 0) (result.score.toFloat() / result.total) * 100f else 0f
                        BarEntry(index.toFloat(), pct)
                    }
                    val dataSet = BarDataSet(entries, "Score %").apply {
                        color = android.graphics.Color.parseColor("#006684")
                        valueTextColor = android.graphics.Color.BLACK
                        valueTextSize = 10f
                    }
                    chart.data = BarData(dataSet)
                    chart.invalidate()
                }
            )
        }
    }
}
