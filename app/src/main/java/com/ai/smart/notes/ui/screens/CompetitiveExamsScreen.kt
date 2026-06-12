package com.ai.smart.notes.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.automirrored.filled.FactCheck
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.ai.smart.notes.ui.theme.NeonPurple
import com.ai.smart.notes.ui.theme.TechBlue

data class CompetitiveExam(
    val name: String,
    val category: String,
    val subjects: List<String>,
    val icon: ImageVector
)

@Composable
fun CompetitiveExamsScreen(navController: NavController) {
    val exams = listOf(
        CompetitiveExam("UPSC", "Civil Services", listOf("History", "Polity", "Geography"), Icons.Default.Book),
        CompetitiveExam("JEE Mains", "Engineering", listOf("Physics", "Chemistry", "Maths"), Icons.AutoMirrored.Filled.FactCheck),
        CompetitiveExam("NEET", "Medical", listOf("Biology", "Physics", "Chemistry"), Icons.Default.Timer),
        CompetitiveExam("GATE", "Engineering", listOf("Core Subject", "Maths", "Aptitude"), Icons.Default.Book),
        CompetitiveExam("SSC CGL", "Government", listOf("Quant", "English", "Reasoning"), Icons.AutoMirrored.Filled.FactCheck)
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Box(
            modifier = Modifier
                .size(400.dp)
                .align(Alignment.BottomStart)
                .offset(x = (-150).dp, y = 150.dp)
                .blur(100.dp)
                .background(NeonPurple.copy(alpha = 0.15f), CircleShape)
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp)
        ) {
            Text(
                text = "Competitive Exams",
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontWeight = FontWeight.Bold,
                    brush = Brush.horizontalGradient(listOf(TechBlue, NeonPurple))
                )
            )
            Text(
                text = "Tailored study materials for Indian Exams",
                style = MaterialTheme.typography.bodySmall,
                color = Color.White.copy(alpha = 0.6f)
            )

            Spacer(modifier = Modifier.height(24.dp))

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(bottom = 20.dp)
            ) {
                items(exams) { exam ->
                    ExamGlassCard(exam) {
                        navController.navigate("exam_detail/${exam.name}")
                    }
                }
            }
        }
    }
}

@Composable
fun ExamGlassCard(exam: CompetitiveExam, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
            .border(
                width = 1.dp,
                brush = Brush.linearGradient(
                    listOf(Color.White.copy(alpha = 0.1f), Color.Transparent)
                ),
                shape = RoundedCornerShape(24.dp)
            )
            .clickable { onClick() }
            .padding(20.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Brush.linearGradient(listOf(TechBlue, NeonPurple))),
                contentAlignment = Alignment.Center
            ) {
                Icon(exam.icon, contentDescription = null, tint = Color.White)
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = exam.name,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = exam.category,
                    style = MaterialTheme.typography.labelMedium,
                    color = TechBlue
                )
            }

            Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Go", tint = Color.White)
        }
    }
}
