package com.ai.study.companion.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.ai.study.companion.data.local.entity.QuizAttemptEntity
import com.ai.study.companion.data.model.Question
import com.ai.study.companion.data.model.QuizData
import com.ai.study.companion.ui.viewmodel.StudyViewModel
import com.ai.study.companion.util.PdfExporter
import com.google.gson.Gson

@Composable
fun QuizScreen(
    summaryId: Long,
    viewModel: StudyViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val quizzes by viewModel.getQuizzesBySummary(summaryId).collectAsState(initial = emptyList())
    val quiz = quizzes.firstOrNull()

    if (quiz == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) {
            Column(horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally) {
                CircularProgressIndicator()
                Text("Preparing your quiz...", modifier = Modifier.padding(top = 16.dp))
            }
        }
    } else {
        val quizData = remember(quiz) {
            try {
                // Remove Markdown code block backticks if present in AI response
                val cleanJson = quiz.questionsJson.replace("```json", "").replace("```", "").trim()
                Gson().fromJson(cleanJson, QuizData::class.java)
            } catch (e: Exception) {
                QuizData(emptyList())
            }
        }
        
        QuizContent(quizData, onQuizFinished = { score, total ->
            val attempt = QuizAttemptEntity(
                quizId = quiz.id,
                score = score,
                totalQuestions = total,
                timeTakenSeconds = 0 
            )
            viewModel.saveAttempt(attempt)
            
            // Ask to export
            PdfExporter.exportQuizResult(context, attempt, quiz.title)
        })
    }
}

@Composable
fun QuizContent(quizData: QuizData, onQuizFinished: (Int, Int) -> Unit) {
    var currentQuestionIndex by remember { mutableIntStateOf(0) }
    var score by remember { mutableIntStateOf(0) }
    var quizFinished by remember { mutableStateOf(false) }

    if (quizFinished) {
        Column(
            modifier = Modifier.fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally
        ) {
            Text("Quiz Finished!", style = MaterialTheme.typography.headlineMedium)
            Spacer(modifier = Modifier.height(8.dp))
            Text("Your Score: $score / ${quizData.questions.size}", style = MaterialTheme.typography.titleLarge)
            Spacer(modifier = Modifier.height(24.dp))
            Text("Result exported to PDF automatically.", style = MaterialTheme.typography.bodySmall)
        }
    } else if (quizData.questions.isNotEmpty()) {
        val question = quizData.questions[currentQuestionIndex]
        QuestionItem(
            question = question,
            currentNumber = currentQuestionIndex + 1,
            total = quizData.questions.size,
            onAnswerSelected = { isCorrect ->
                if (isCorrect) score++
                if (currentQuestionIndex < quizData.questions.size - 1) {
                    currentQuestionIndex++
                } else {
                    quizFinished = true
                    onQuizFinished(score, quizData.questions.size)
                }
            }
        )
    } else {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) {
            Text("Invalid quiz data generated. Please try again.")
        }
    }
}

@Composable
fun QuestionItem(question: Question, currentNumber: Int, total: Int, onAnswerSelected: (Boolean) -> Unit) {
    Column(modifier = Modifier.padding(16.dp)) {
        Text(text = "Question $currentNumber of $total", style = MaterialTheme.typography.labelMedium)
        LinearProgressIndicator(
            progress = currentNumber.toFloat() / total,
            modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(text = question.question, style = MaterialTheme.typography.titleLarge)
        
        Spacer(modifier = Modifier.height(24.dp))
        
        if (question.type == "MCQ") {
            question.options?.forEach { option ->
                Button(
                    onClick = { onAnswerSelected(option == question.correctAnswer) },
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant, contentColor = MaterialTheme.colorScheme.onSurfaceVariant)
                ) {
                    Text(option)
                }
            }
        } else if (question.type == "TF") {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                Button(
                    onClick = { onAnswerSelected(question.correctAnswer.lowercase() == "true") },
                    modifier = Modifier.weight(1f).padding(4.dp)
                ) { Text("True") }
                Button(
                    onClick = { onAnswerSelected(question.correctAnswer.lowercase() == "false") },
                    modifier = Modifier.weight(1f).padding(4.dp)
                ) { Text("False") }
            }
        }
    }
}
