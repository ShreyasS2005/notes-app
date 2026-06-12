package com.ai.smart.notes.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.ai.smart.notes.ui.theme.TechBlue
import com.ai.smart.notes.ui.theme.NeonPurple
import com.ai.smart.notes.ui.viewmodel.NoteViewModel

@Composable
fun HomeScreen(navController: NavController, viewModel: NoteViewModel = hiltViewModel()) {
    val userStats by viewModel.userStats.collectAsState()
    val notes by viewModel.allNotes.collectAsState(initial = emptyList())
    var selectedCategory by remember { mutableStateOf("All") }
    var searchQuery by remember { mutableStateOf("") }
    val focusManager = LocalFocusManager.current
    val keyboardController = LocalSoftwareKeyboardController.current
    
    val filteredNotes = notes.filter { note ->
        val matchesSearch = if (searchQuery.isEmpty()) true else {
            note.title.contains(searchQuery, ignoreCase = true) || note.content.contains(searchQuery, ignoreCase = true)
        }
        val matchesCategory = when(selectedCategory) {
            "Logic" -> note.type == "text" || note.type == "pdf"
            "Visual" -> note.type == "image"
            "Focus" -> note.summary != null
            "Reading" -> note.content.length > 500
            else -> true
        }
        matchesSearch && matchesCategory
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .pointerInput(Unit) {
                detectTapGestures(onTap = { focusManager.clearFocus() })
            }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .testTag("home_screen")
                .verticalScroll(rememberScrollState())
                .padding(bottom = 80.dp)
                .pointerInput(Unit) {
                    detectTapGestures(onTap = { focusManager.clearFocus() })
                }
        ) {
            // Top Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                HeaderSection(userStats?.username ?: "Explorer")
            }

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search your notes...") },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp),
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { 
                            searchQuery = "" 
                            focusManager.clearFocus()
                        }) {
                            Icon(Icons.Default.Close, contentDescription = "Clear")
                        }
                    }
                },
                shape = RoundedCornerShape(16.dp),
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(onSearch = {
                    keyboardController?.hide()
                    focusManager.clearFocus()
                }),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = TechBlue,
                    unfocusedBorderColor = Color.LightGray
                )
            )

            // Main Featured Card
            FeaturedCard(
                title = "Neural Mastery",
                subtitle = "Enhance your cognitive logic and visual processing with AI.",
                progress = 0.66f,
                onJoinClick = { 
                    focusManager.clearFocus()
                    navController.navigate("analytics") 
                }
            )

            // Category Chips
            CategorySelector(selectedCategory) { 
                selectedCategory = it 
                focusManager.clearFocus()
            }

            // Dynamic Content based on Category/Search
            Text(
                text = if (searchQuery.isEmpty()) "$selectedCategory Focus" else "Search Results",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp)
            )

            if (filteredNotes.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxWidth().height(150.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No items found.", color = Color.Gray)
                }
            } else {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 20.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(filteredNotes.take(10)) { note ->
                        LearningCard(
                            title = note.title,
                            author = "Local Vault",
                            progress = if (note.summary != null) 1f else 0.4f,
                            color = if (note.type == "image") NeonPurple else TechBlue,
                            icon = when(note.type) {
                                "image" -> Icons.Default.Visibility
                                "pdf" -> Icons.Default.PictureAsPdf
                                else -> Icons.Default.Description
                            },
                            onClick = { 
                                focusManager.clearFocus()
                                navController.navigate("note_detail/${note.id}") 
                            }
                        )
                    }
                }
            }

            // All/Older Notes Section
            Text(
                text = "Recent & Older Knowledge",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp)
            )

            Column(
                modifier = Modifier.padding(horizontal = 20.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                filteredNotes.forEach { note ->
                    NoteRowItem(note, onDelete = { viewModel.deleteNote(note.id) }) { 
                        focusManager.clearFocus()
                        navController.navigate("note_detail/${note.id}") 
                    }
                }
            }

            // AI Tools Section
            Text(
                text = "Neural Tools",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .padding(horizontal = 20.dp, vertical = 16.dp)
                    .semantics { contentDescription = "Neural Tools" }
            )

            Row(
                modifier = Modifier.padding(horizontal = 20.dp).fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                ToolButton(
                    title = "My Notes",
                    icon = Icons.Default.LibraryBooks,
                    modifier = Modifier.weight(1f),
                    color = TechBlue
                ) { 
                    focusManager.clearFocus()
                    navController.navigate("notes") 
                }
                ToolButton(
                    title = "Analytics",
                    icon = Icons.Default.AutoGraph,
                    modifier = Modifier.weight(1f),
                    color = NeonPurple
                ) { 
                    focusManager.clearFocus()
                    navController.navigate("analytics") 
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.padding(horizontal = 20.dp).fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                ToolButton(
                    title = "Focus Timer",
                    icon = Icons.Default.Timer,
                    modifier = Modifier.weight(1f),
                    color = Color(0xFFFF2E63)
                ) { 
                    focusManager.clearFocus()
                    navController.navigate("pomodoro") 
                }
                ToolButton(
                    title = "Achievements",
                    icon = Icons.Default.EmojiEvents,
                    modifier = Modifier.weight(1f),
                    color = Color(0xFFFF9800)
                ) { 
                    focusManager.clearFocus()
                    navController.navigate("achievements") 
                }
            }
            
            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
fun NoteRowItem(
    note: com.ai.smart.notes.data.local.entity.NoteEntity, 
    onDelete: () -> Unit,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = when(note.type) {
                    "image" -> Icons.Default.Image
                    "pdf" -> Icons.Default.PictureAsPdf
                    else -> Icons.Default.Notes
                },
                contentDescription = null,
                tint = TechBlue
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(note.title, fontWeight = FontWeight.Bold, maxLines = 1, color = MaterialTheme.colorScheme.onSurface)
                Text(note.content, style = MaterialTheme.typography.bodySmall, maxLines = 1, color = Color.Gray)
            }
            IconButton(onClick = onDelete) {
                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Red.copy(alpha = 0.6f), modifier = Modifier.size(20.dp))
            }
        }
    }
}

@Composable
fun HeaderSection(username: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f))
            ) {
                Icon(
                    Icons.Default.Person, 
                    contentDescription = null, 
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.align(Alignment.Center)
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = "Hello, $username",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground,
                    modifier = Modifier.semantics { contentDescription = "Hello, $username" }
                )
                Text(
                    text = "Neural Rank: Alpha",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.Gray,
                    modifier = Modifier.semantics { contentDescription = "Neural Rank: Alpha" }
                )
            }
        }
        
        IconButton(onClick = { /* Notifications */ }) {
            Icon(Icons.Default.NotificationsNone, contentDescription = "Notifications", tint = MaterialTheme.colorScheme.onBackground)
        }
    }
}

@Composable
fun FeaturedCard(title: String, subtitle: String, progress: Float, onJoinClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 8.dp)
            .height(180.dp),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.05f))
    ) {
        Box(modifier = Modifier.fillMaxSize().padding(24.dp)) {
            Column(modifier = Modifier.fillMaxWidth(0.6f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.semantics { contentDescription = title }
                )
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray,
                    lineHeight = 18.sp
                )
                Spacer(modifier = Modifier.weight(1f))
                Button(
                    onClick = onJoinClick,
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = TechBlue),
                    contentPadding = PaddingValues(horizontal = 24.dp)
                ) {
                    Text(
                        "Check Stats",
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.semantics { contentDescription = "Check Stats" }
                    )
                }
            }
            
            Box(
                modifier = Modifier.align(Alignment.TopEnd).size(48.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(
                    progress = { progress },
                    modifier = Modifier.fillMaxSize(),
                    color = TechBlue,
                    strokeWidth = 4.dp,
                    trackColor = Color.LightGray.copy(alpha = 0.2f)
                )
                Text(
                    text = "${(progress * 100).toInt()}%",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }
    }
}

@Composable
fun CategorySelector(selected: String, onSelect: (String) -> Unit) {
    val categories = listOf("All", "Logic", "Visual", "Focus", "Reading")

    LazyRow(
        modifier = Modifier.padding(top = 16.dp),
        contentPadding = PaddingValues(horizontal = 20.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(categories) { category ->
            val isSelected = selected == category
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant)
                    .clickable { onSelect(category) }
                    .padding(horizontal = 20.dp, vertical = 10.dp)
            ) {
                Text(
                    text = category,
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.Bold,
                    color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.semantics { contentDescription = category }
                )
            }
        }
    }
}

@Composable
fun LearningCard(title: String, author: String, progress: Float, color: Color, icon: ImageVector, onClick: () -> Unit) {
    Card(
        modifier = Modifier.width(180.dp).height(200.dp).clickable { onClick() },
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f))
    ) {
        Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            Box(
                modifier = Modifier.size(40.dp).clip(CircleShape).background(color.copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = color)
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                maxLines = 2,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.weight(1f))
            
            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier.fillMaxWidth().height(4.dp).clip(RoundedCornerShape(2.dp)),
                color = color,
                trackColor = Color.LightGray.copy(alpha = 0.2f)
            )
        }
    }
}

@Composable
fun ToolButton(title: String, icon: ImageVector, color: Color, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Card(
        modifier = modifier.height(100.dp).clickable { onClick() },
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.05f)),
        border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.2f))
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(icon, contentDescription = title, tint = color)
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                title,
                style = MaterialTheme.typography.labelLarge,
                color = color,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.semantics { contentDescription = title }
            )
        }
    }
}
