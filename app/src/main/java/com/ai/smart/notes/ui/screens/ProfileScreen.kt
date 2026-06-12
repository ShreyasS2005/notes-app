package com.ai.smart.notes.ui.screens

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Help
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.ai.smart.notes.ui.theme.NeonPurple
import com.ai.smart.notes.ui.theme.TechBlue
import com.ai.smart.notes.ui.theme.DeepSpace
import com.ai.smart.notes.ui.viewmodel.NoteViewModel
import com.ai.smart.notes.util.PreferenceManager
import com.google.firebase.auth.FirebaseAuth

@Composable
fun ProfileScreen(
    navController: NavController,
    preferenceManager: PreferenceManager,
    viewModel: NoteViewModel = hiltViewModel()
) {
    val userStats by viewModel.userStats.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepSpace)
    ) {
        Box(
            modifier = Modifier
                .size(400.dp)
                .align(Alignment.TopCenter)
                .offset(y = (-200).dp)
                .blur(100.dp)
                .background(TechBlue.copy(alpha = 0.15f), CircleShape)
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(40.dp))
            
            // Level & Badge
            Box(contentAlignment = Alignment.Center) {
                Box(
                    modifier = Modifier
                        .size(130.dp)
                        .clip(CircleShape)
                        .background(Brush.sweepGradient(listOf(TechBlue, NeonPurple, TechBlue)))
                        .padding(4.dp)
                        .clip(CircleShape)
                        .background(DeepSpace),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Person, null, modifier = Modifier.size(70.dp), tint = TechBlue)
                }
                
                Surface(
                    modifier = Modifier.align(Alignment.BottomEnd).offset(x = (-4).dp, y = (-4).dp),
                    color = NeonPurple,
                    shape = CircleShape,
                    shadowElevation = 8.dp
                ) {
                    Text(
                        text = "Lvl ${userStats?.level ?: 1}",
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = userStats?.username ?: "Explorer",
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold, color = Color.White)
            )
            
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Whatshot, "Streak", tint = Color(0xFFFF9800), modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text(text = "${userStats?.streak ?: 0} Day Streak", color = Color(0xFFFF9800), style = MaterialTheme.typography.labelLarge)
            }

            Spacer(modifier = Modifier.height(24.dp))

            // XP Progress
            val xpTarget = ((userStats?.level ?: 1) * 1000).toFloat()
            val xpProgressValue = if (xpTarget > 0) (userStats?.experience ?: 0).toFloat() / xpTarget else 0f
            val xpProgress by animateFloatAsState(
                targetValue = xpProgressValue,
                label = "xp_progress"
            )
            
            Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Experience", color = TechBlue, style = MaterialTheme.typography.labelSmall)
                    Text("${userStats?.experience ?: 0} / ${xpTarget.toInt()} XP", color = Color.White.copy(alpha = 0.6f), style = MaterialTheme.typography.labelSmall)
                }
                Spacer(modifier = Modifier.height(8.dp))
                LinearProgressIndicator(
                    progress = { xpProgress },
                    modifier = Modifier.fillMaxWidth().height(8.dp).clip(CircleShape),
                    color = TechBlue,
                    trackColor = Color.White.copy(alpha = 0.1f),
                )
            }

            Spacer(modifier = Modifier.height(40.dp))

            // Stats Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                ProfileStat("Notes", (userStats?.totalNotes ?: 0).toString())
                ProfileStat("Focus", "${(userStats?.focusMinutes ?: 0)}m")
                ProfileStat("Syncs", (userStats?.aiTasks ?: 0).toString())
            }

            Spacer(modifier = Modifier.height(40.dp))

            // Menu
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .background(Color.White.copy(alpha = 0.05f))
                    .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(24.dp))
            ) {
                ProfileMenuItem(Icons.Default.EmojiEvents, "Achievements & Badges") { navController.navigate("achievements") }
                HorizontalDivider(color = Color.White.copy(alpha = 0.05f), thickness = 1.dp)
                ProfileMenuItem(Icons.Default.Share, "Shared Notes") { navController.navigate("shared_notes") }
                HorizontalDivider(color = Color.White.copy(alpha = 0.05f), thickness = 1.dp)
                ProfileMenuItem(Icons.Default.Settings, "Account Settings") { navController.navigate("settings") }
            }

            Spacer(modifier = Modifier.weight(1f))

            Button(
                onClick = { 
                    FirebaseAuth.getInstance().signOut()
                    navController.navigate("login") { popUpTo(0) { inclusive = true } }
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF2E63).copy(alpha = 0.8f)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text("DISCONNECT SYSTEM", fontWeight = FontWeight.Bold)
            }
            
            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
fun ProfileStat(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = value, style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold, color = Color.White))
        Text(text = label, style = MaterialTheme.typography.labelMedium, color = Color.White.copy(alpha = 0.5f))
    }
}

@Composable
fun ProfileMenuItem(icon: ImageVector, title: String, onClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().clickable { onClick() }.padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, null, tint = TechBlue, modifier = Modifier.size(24.dp))
        Spacer(modifier = Modifier.width(16.dp))
        Text(title, color = Color.White, style = MaterialTheme.typography.bodyLarge)
        Spacer(modifier = Modifier.weight(1f))
        Icon(Icons.Default.ChevronRight, null, tint = Color.White.copy(alpha = 0.3f))
    }
}
