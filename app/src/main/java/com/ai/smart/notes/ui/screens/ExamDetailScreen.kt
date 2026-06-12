package com.ai.smart.notes.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.ai.smart.notes.ui.theme.NeonPurple
import com.ai.smart.notes.ui.theme.TechBlue

data class ExamTopic(
    val title: String,
    val resourceUrl: String
)

@Composable
fun ExamDetailScreen(examName: String, navController: NavController) {
    val context = LocalContext.current
    
    val topics = when (examName) {
        "UPSC" -> listOf(
            ExamTopic("Indian Polity by Laxmikanth", "https://byjus.com/free-ias-prep/indian-polity-m-laxmikanth/"),
            ExamTopic("Ancient History NCERT", "https://ncert.nic.in/textbook.php?hehs1=0-15"),
            ExamTopic("Modern History Summary", "https://www.clearias.com/modern-indian-history-notes/")
        )
        "JEE Mains" -> listOf(
            ExamTopic("Physics Concepts (HC Verma)", "https://www.concepts-of-physics.com/"),
            ExamTopic("Chemistry Revision Notes", "https://www.askiitians.com/revision-notes/chemistry/"),
            ExamTopic("Mathematics Formulas PDF", "https://www.vedantu.com/formula/jee-main-maths-formula-pdf")
        )
        "NEET" -> listOf(
            ExamTopic("Biology NCERT Vol 1", "https://ncert.nic.in/textbook.php?kebo1=0-22"),
            ExamTopic("Organic Chemistry Hub", "https://www.physicswallah.live/study-material/neet-chemistry-notes")
        )
        else -> listOf(
            ExamTopic("General Aptitude Guide", "https://www.indiabix.com/"),
            ExamTopic("Current Affairs PDF", "https://www.gktoday.in/current-affairs/")
        )
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Box(
            modifier = Modifier
                .size(300.dp)
                .offset(x = 100.dp, y = (-50).dp)
                .blur(100.dp)
                .background(TechBlue.copy(alpha = 0.1f), CircleShape)
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
                Text(
                    text = "$examName Resources",
                    style = MaterialTheme.typography.headlineSmall.copy(
                        fontWeight = FontWeight.Bold,
                        brush = Brush.horizontalGradient(listOf(TechBlue, NeonPurple))
                    )
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            LazyColumn(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                items(topics) { topic ->
                    TopicCard(topic) {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(topic.resourceUrl))
                        context.startActivity(intent)
                    }
                }
            }
        }
    }
}

@Composable
fun TopicCard(topic: ExamTopic, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
            .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(20.dp))
            .padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.PictureAsPdf, contentDescription = null, tint = Color.Red.copy(alpha = 0.7f))
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(topic.title, color = Color.White, fontWeight = FontWeight.Bold)
                Text("Official Learning Resource", style = MaterialTheme.typography.labelSmall, color = TechBlue)
            }
            Button(
                onClick = onClick,
                colors = ButtonDefaults.buttonColors(containerColor = TechBlue.copy(alpha = 0.2f)),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
            ) {
                Text("OPEN PDF", color = TechBlue, fontSize = 10.sp)
            }
        }
    }
}
