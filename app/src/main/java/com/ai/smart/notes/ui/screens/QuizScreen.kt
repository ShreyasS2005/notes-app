package com.ai.smart.notes.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.ai.smart.notes.data.local.entity.QuizEntity
import com.ai.smart.notes.ui.viewmodel.NoteViewModel
import com.ai.smart.notes.ui.theme.TechBlue
import com.ai.smart.notes.ui.theme.NeonPurple
import com.ai.smart.notes.ui.theme.DeepSpace
import com.google.gson.Gson
import com.google.gson.JsonSyntaxException

data class QuizData(val quizzes: List<QuizQuestion>)
data class QuizQuestion(
    val question: String,
    val options: List<String>,
    val correctAnswer: String,
    val explanation: String? = null
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuizScreen(noteId: Long, navController: NavController, viewModel: NoteViewModel = hiltViewModel()) {
    val quizzes by viewModel.getQuizzes(noteId).collectAsState(initial = emptyList<QuizEntity>())
    val quiz = quizzes.lastOrNull()
    var showTutorExplanation by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Neural Challenge", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = TechBlue)
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = DeepSpace,
                    titleContentColor = TechBlue
                )
            )
        },
        containerColor = DeepSpace
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            if (quiz == null) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CircularProgressIndicator(color = TechBlue)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Synthesizing Quiz...", color = TechBlue)
                }
            } else {
                val quizData = remember(quiz) {
                    try {
                        Gson().fromJson(quiz.questionsJson, QuizData::class.java)
                    } catch (e: JsonSyntaxException) {
                        null
                    } catch (e: Exception) {
                        null
                    }
                }

                if (quizData != null && quizData.quizzes.isNotEmpty()) {
                    QuizContent(
                        questions = quizData.quizzes,
                        onFinish = { score, incorrectQuestions ->
                            viewModel.saveQuizResult(quiz.id, score, quizData.quizzes.size)
                            viewModel.generateFlashcardsFromIncorrect(noteId, incorrectQuestions)
                            navController.popBackStack()
                        },
                        onTutorRequest = { explanation ->
                            showTutorExplanation = explanation
                        }
                    )
                } else {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("Neural Logic Error: Invalid Data", color = Color.Red)
                        Button(onClick = { navController.popBackStack() }, colors = ButtonDefaults.buttonColors(containerColor = TechBlue)) {
                            Text("RETURN TO BASE")
                        }
                    }
                }
            }

            if (showTutorExplanation != null) {
                AlertDialog(
                    onDismissRequest = { showTutorExplanation = null },
                    title = { Text("AI Tutor Explanation", color = TechBlue) },
                    text = { Text(showTutorExplanation!!, color = Color.White) },
                    confirmButton = {
                        TextButton(onClick = { showTutorExplanation = null }) {
                            Text("UNDERSTOOD", color = TechBlue)
                        }
                    },
                    containerColor = Color(0xFF1A1A2E),
                    shape = RoundedCornerShape(16.dp)
                )
            }
        }
    }
}

@Composable
fun QuizContent(
    questions: List<QuizQuestion>,
    onFinish: (Int, List<QuizQuestion>) -> Unit,
    onTutorRequest: (String) -> Unit
) {
    var currentIndex by remember { mutableIntStateOf(0) }
    var score by remember { mutableIntStateOf(0) }
    var selectedOption by remember { mutableStateOf<String?>(null) }
    var isChecked by remember { mutableStateOf(false) }
    val incorrectQuestions = remember { mutableStateListOf<QuizQuestion>() }

    val currentQuestion = questions[currentIndex]
    val progress by animateFloatAsState(targetValue = (currentIndex + 1).toFloat() / questions.size)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Progress Bar
        Box(modifier = Modifier.fillMaxWidth().height(10.dp).clip(RoundedCornerShape(5.dp)).background(Color.White.copy(alpha = 0.1f))) {
            Box(modifier = Modifier.fillMaxWidth(progress).fillMaxHeight().background(Brush.horizontalGradient(listOf(TechBlue, NeonPurple))))
        }

        Spacer(modifier = Modifier.height(12.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(
                text = "STEP ${currentIndex + 1} / ${questions.size}",
                style = MaterialTheme.typography.labelMedium,
                color = TechBlue,
                letterSpacing = 2.sp
            )
            if (isChecked) {
                IconButton(onClick = { onTutorRequest(currentQuestion.explanation ?: "Thinking...") }) {
                    Icon(Icons.Default.Info, "AI Tutor", tint = TechBlue)
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Question Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.05f)),
            shape = RoundedCornerShape(24.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, TechBlue.copy(alpha = 0.3f))
        ) {
            Text(
                text = currentQuestion.question,
                modifier = Modifier.padding(24.dp),
                style = MaterialTheme.typography.titleLarge,
                textAlign = TextAlign.Center,
                fontWeight = FontWeight.Medium,
                color = Color.White,
                lineHeight = 28.sp
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Options
        currentQuestion.options.forEach { option ->
            val isCorrect = option == currentQuestion.correctAnswer
            val isSelected = option == selectedOption
            
            val borderColor = when {
                isChecked && isCorrect -> Color(0xFF00FFCC)
                isChecked && isSelected && !isCorrect -> Color.Red
                isSelected -> TechBlue
                else -> Color.White.copy(alpha = 0.1f)
            }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(if (isSelected) TechBlue.copy(alpha = 0.1f) else Color.Transparent)
                    .border(1.dp, borderColor, RoundedCornerShape(16.dp))
                    .clickable(enabled = !isChecked) { selectedOption = option }
                    .padding(20.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = option,
                        style = MaterialTheme.typography.bodyLarge,
                        color = if (isSelected) TechBlue else Color.White.copy(alpha = 0.8f),
                        modifier = Modifier.weight(1f)
                    )
                    if (isChecked) {
                        if (isCorrect) Icon(Icons.Default.CheckCircle, "", tint = Color(0xFF00FFCC))
                        else if (isSelected) Icon(Icons.Default.Cancel, "", tint = Color.Red)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(40.dp))

        // Action Button
        Button(
            onClick = {
                if (!isChecked) {
                    isChecked = true
                    if (selectedOption == currentQuestion.correctAnswer) {
                        score++
                    } else {
                        incorrectQuestions.add(currentQuestion)
                    }
                } else {
                    if (currentIndex < questions.size - 1) {
                        currentIndex++
                        selectedOption = null
                        isChecked = false
                    } else {
                        onFinish(score, incorrectQuestions.toList())
                    }
                }
            },
            enabled = selectedOption != null,
            modifier = Modifier.fillMaxWidth().height(60.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = if (isChecked) NeonPurple else TechBlue,
                disabledContainerColor = Color.Gray.copy(alpha = 0.3f)
            )
        ) {
            Text(
                text = if (!isChecked) "VERIFY LOGIC" else if (currentIndex < questions.size - 1) "NEXT SEQUENCE" else "FINISH EVALUATION",
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )
        }
    }
}
