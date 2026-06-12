package com.ai.smart.notes.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.LibraryBooks
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.ai.smart.notes.data.local.entity.BadgeEntity
import com.ai.smart.notes.ui.theme.NeonPurple
import com.ai.smart.notes.ui.theme.TechBlue
import com.ai.smart.notes.ui.theme.DeepSpace
import com.ai.smart.notes.ui.viewmodel.NoteViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AchievementsScreen(navController: NavController, viewModel: NoteViewModel = hiltViewModel()) {
    val badges by viewModel.allBadges.collectAsState(initial = emptyList())
    val userStats by viewModel.userStats.collectAsState()

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Neural Achievements", fontWeight = FontWeight.Bold) },
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
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // Level and XP Header
            Card(
                modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp),
                colors = CardDefaults.cardColors(containerColor = TechBlue.copy(alpha = 0.1f)),
                shape = RoundedCornerShape(24.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, TechBlue.copy(alpha = 0.3f))
            ) {
                Row(
                    modifier = Modifier.padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .clip(CircleShape)
                            .background(Brush.linearGradient(listOf(TechBlue, NeonPurple))),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = (userStats?.level ?: 1).toString(),
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 24.sp
                        )
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        val level = userStats?.level ?: 1
                        val rankName = when {
                            level < 5 -> "Neural Novice"
                            level < 10 -> "Data Architect"
                            else -> "Neural Master"
                        }
                        Text("Rank: $rankName", color = Color.White, fontWeight = FontWeight.Bold)
                        val exp = userStats?.experience ?: 0
                        val nextLevel = level * 1000
                        val progressValue = if (nextLevel > 0) exp.toFloat() / nextLevel else 0f
                        
                        LinearProgressIndicator(
                            progress = { progressValue },
                            modifier = Modifier.fillMaxWidth().height(8.dp).padding(vertical = 4.dp).clip(RoundedCornerShape(4.dp)),
                            color = TechBlue,
                            trackColor = Color.White.copy(alpha = 0.1f)
                        )
                        Text("$exp / $nextLevel XP", color = Color.White.copy(alpha = 0.6f), style = MaterialTheme.typography.labelSmall)
                    }
                }
            }

            Text(
                "Neural Badges",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            if (badges.isEmpty()) {
                Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                    Text("Initializing Badge Matrix...", color = TechBlue.copy(alpha = 0.5f))
                }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(badges) { badge ->
                        BadgeItem(badge)
                    }
                }
            }
        }
    }
}

@Composable
fun BadgeItem(badge: BadgeEntity) {
    val alpha = if (badge.isUnlocked) 1f else 0.3f
    val color = if (badge.isUnlocked) TechBlue else Color.Gray

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(180.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.05f)),
        shape = RoundedCornerShape(20.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.3f * alpha))
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(50.dp)
                    .clip(CircleShape)
                    .background(color.copy(alpha = 0.15f * alpha)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = getIconForName(badge.iconName),
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.size(28.dp)
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = badge.name,
                fontWeight = FontWeight.Bold,
                color = Color.White.copy(alpha = alpha),
                fontSize = 14.sp,
                textAlign = TextAlign.Center
            )
            Text(
                text = badge.description,
                style = MaterialTheme.typography.bodySmall,
                color = Color.White.copy(alpha = 0.5f * alpha),
                textAlign = TextAlign.Center,
                lineHeight = 14.sp,
                maxLines = 2
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            val progressVal = if (badge.target > 0) badge.progress.toFloat() / badge.target else 0f
            LinearProgressIndicator(
                progress = { progressVal },
                modifier = Modifier.fillMaxWidth().height(4.dp).clip(RoundedCornerShape(2.dp)),
                color = if (badge.isUnlocked) TechBlue else Color.Gray.copy(alpha = 0.4f),
                trackColor = Color.White.copy(alpha = 0.05f)
            )
            if (!badge.isUnlocked) {
                Text("${badge.progress}/${badge.target}", color = Color.White.copy(alpha = 0.4f), style = MaterialTheme.typography.labelSmall)
            } else {
                Text("UNLOCKED", color = TechBlue, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
            }
        }
    }
}

fun getIconForName(name: String): ImageVector {
    return when(name) {
        "description" -> Icons.Default.Description
        "library_books" -> Icons.AutoMirrored.Filled.LibraryBooks
        "psychology" -> Icons.Default.Psychology
        "timer" -> Icons.Default.Timer
        "local_fire_department" -> Icons.Default.LocalFireDepartment
        "share" -> Icons.Default.Share
        "trending_up" -> Icons.Default.TrendingUp
        "all_inclusive" -> Icons.Default.AllInclusive
        "star" -> Icons.Default.Star
        else -> Icons.Default.Star
    }
}
