package com.ai.smart.notes.ui.screens

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.ai.smart.notes.data.local.entity.FlashcardEntity
import com.ai.smart.notes.ui.viewmodel.NoteViewModel
import com.ai.smart.notes.ui.theme.TechBlue
import com.ai.smart.notes.ui.theme.NeonPurple
import com.ai.smart.notes.ui.theme.DeepSpace

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FlashcardScreen(noteId: Long, navController: NavController, viewModel: NoteViewModel = hiltViewModel()) {
    val flashcards by viewModel.getFlashcards(noteId).collectAsState(initial = emptyList<FlashcardEntity>())
    var currentIndex by remember { mutableIntStateOf(0) }
    val progress by animateFloatAsState(targetValue = if (flashcards.isNotEmpty()) (currentIndex + 1).toFloat() / flashcards.size else 0f)
    var showExplanation by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Neural Recall", fontWeight = FontWeight.Bold) },
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
            if (flashcards.isEmpty()) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CircularProgressIndicator(color = TechBlue)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Synthesizing Flashcards...", color = TechBlue)
                }
            } else {
                Column(
                    modifier = Modifier.fillMaxSize().padding(horizontal = 24.dp, vertical = 16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Progress Header
                    Box(modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)).background(Color.White.copy(alpha = 0.05f))) {
                        Box(modifier = Modifier.fillMaxWidth(progress).fillMaxHeight().background(Brush.horizontalGradient(listOf(TechBlue, NeonPurple))))
                    }
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "CORE DATA ${currentIndex + 1} / ${flashcards.size}",
                        style = MaterialTheme.typography.labelSmall,
                        color = TechBlue.copy(alpha = 0.7f),
                        letterSpacing = 1.5.sp
                    )
                    
                    Spacer(modifier = Modifier.height(24.dp))

                    Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                        FlashcardItem(
                            flashcard = flashcards[currentIndex],
                            modifier = Modifier.fillMaxHeight(0.8f).fillMaxWidth(),
                            onFlipped = { showExplanation = it }
                        )
                    }

                    if (showExplanation) {
                        Text(
                            text = flashcards[currentIndex].explanation,
                            style = MaterialTheme.typography.bodySmall,
                            color = TechBlue.copy(alpha = 0.6f),
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(16.dp)
                        )

                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Rate Difficulty (SM-2):", color = Color.White.copy(alpha = 0.7f), style = MaterialTheme.typography.labelLarge)
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            (0..5).forEach { quality ->
                                val color = when(quality) {
                                    0, 1 -> Color.Red
                                    2, 3 -> Color.Yellow
                                    else -> Color.Green
                                }
                                Box(
                                    modifier = Modifier
                                        .size(45.dp)
                                        .clip(CircleShape)
                                        .background(color.copy(alpha = 0.2f))
                                        .border(1.dp, color.copy(alpha = 0.5f), CircleShape)
                                        .clickable {
                                            viewModel.reviewFlashcard(flashcards[currentIndex], quality)
                                            if (currentIndex < flashcards.size - 1) {
                                                currentIndex++
                                                showExplanation = false
                                            } else {
                                                navController.popBackStack()
                                            }
                                        },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(quality.toString(), color = color, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))
                }
            }
        }
    }
}

@Composable
fun FlashcardItem(flashcard: FlashcardEntity, modifier: Modifier = Modifier, onFlipped: (Boolean) -> Unit) {
    var rotated by remember(flashcard) { mutableStateOf(false) }
    val rotation by animateFloatAsState(
        targetValue = if (rotated) 180f else 0f,
        animationSpec = tween(durationMillis = 500),
        label = "flashcard_rotation"
    )

    LaunchedEffect(rotated) {
        onFlipped(rotated)
    }

    Card(
        modifier = modifier
            .graphicsLayer {
                rotationY = rotation
                cameraDistance = 12 * density
            }
            .clickable { rotated = !rotated }
            .border(1.dp, TechBlue.copy(alpha = 0.2f), RoundedCornerShape(32.dp)),
        shape = RoundedCornerShape(32.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White.copy(alpha = 0.05f)
        )
    ) {
        Box(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            if (rotation <= 90f) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                    Text("FRONT", style = MaterialTheme.typography.labelSmall, color = TechBlue, modifier = Modifier.padding(bottom = 16.dp))
                    Text(
                        text = flashcard.front,
                        style = MaterialTheme.typography.headlineSmall.copy(
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center,
                            color = Color.White
                        )
                    )
                }
            } else {
                Column(
                    modifier = Modifier.graphicsLayer { rotationY = 180f },
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text("BACK", style = MaterialTheme.typography.labelSmall, color = NeonPurple, modifier = Modifier.padding(bottom = 16.dp))
                    Text(
                        text = flashcard.back,
                        style = MaterialTheme.typography.bodyLarge.copy(
                            textAlign = TextAlign.Center,
                            fontSize = 18.sp,
                            color = Color.White.copy(alpha = 0.9f)
                        )
                    )
                }
            }
        }
    }
}
