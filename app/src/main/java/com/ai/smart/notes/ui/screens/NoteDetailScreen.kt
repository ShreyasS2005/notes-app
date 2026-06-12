package com.ai.smart.notes.ui.screens

import android.app.TimePickerDialog
import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.VolumeOff
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.ai.smart.notes.ui.viewmodel.NoteUiState
import com.ai.smart.notes.ui.viewmodel.NoteViewModel
import com.ai.smart.notes.ui.theme.TechBlue
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NoteDetailScreen(noteId: Long, navController: NavController, viewModel: NoteViewModel = hiltViewModel()) {
    val notes by viewModel.allNotes.collectAsState(initial = emptyList())
    val note = notes.find { it.id == noteId }
    
    val fontSize by viewModel.fontSize.collectAsState()
    val uiState by viewModel.uiState.collectAsState()
    val predictedTime by viewModel.predictedTime.collectAsState()
    val translatedText by viewModel.translatedText.collectAsState()
    val isSpeaking by viewModel.isSpeaking.collectAsState()
    val context = LocalContext.current
    
    var showShareDialog by remember { mutableStateOf(false) }
    var recipientEmail by remember { mutableStateOf("") }
    var showDeleteConfirm by remember { mutableStateOf(false) }
    val keyboardController = LocalSoftwareKeyboardController.current

    LaunchedEffect(Unit) {
        viewModel.initTts(context)
    }

    LaunchedEffect(note) {
        note?.let { 
            viewModel.updateNoteMetrics(it.content)
            viewModel.predictStudyTime(it.content)
        }
    }

    LaunchedEffect(uiState) {
        if (uiState is NoteUiState.Success) {
            Toast.makeText(context, (uiState as NoteUiState.Success).message, Toast.LENGTH_SHORT).show()
        } else if (uiState is NoteUiState.Error) {
            Toast.makeText(context, (uiState as NoteUiState.Error).message, Toast.LENGTH_LONG).show()
        }
    }

    if (note == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
        }
    } else {
        Scaffold(
            topBar = {
                CenterAlignedTopAppBar(
                    title = { Text("Note Detail", fontWeight = FontWeight.Bold) },
                    navigationIcon = {
                        IconButton(onClick = { navController.popBackStack() }) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                        }
                    },
                    actions = {
                        IconButton(onClick = { showDeleteConfirm = true }) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Red)
                        }
                        IconButton(onClick = { viewModel.shareAsPdf(context, noteId) }) {
                            Icon(Icons.Default.PictureAsPdf, contentDescription = "Share PDF", tint = MaterialTheme.colorScheme.primary)
                        }
                        IconButton(onClick = { showShareDialog = true }) {
                            Icon(Icons.Default.CloudUpload, contentDescription = "Share Cloud", tint = MaterialTheme.colorScheme.primary)
                        }
                    },
                    colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface,
                        titleContentColor = MaterialTheme.colorScheme.onSurface,
                        navigationIconContentColor = MaterialTheme.colorScheme.onSurface,
                        actionIconContentColor = MaterialTheme.colorScheme.primary
                    )
                )
            }
        ) { innerPadding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .background(MaterialTheme.colorScheme.background)
                    .verticalScroll(rememberScrollState())
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                        shape = RoundedCornerShape(20.dp)
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Text(note.title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Schedule, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Study: ${predictedTime ?: "..."}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.primary,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    if (uiState is NoteUiState.Loading) {
                        LinearProgressIndicator(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                            color = MaterialTheme.colorScheme.primary
                        )
                    }

                    Text("Study Tools", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(vertical = 12.dp))
                    
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        ActionButton(
                            text = "Set Reminder",
                            icon = Icons.Default.NotificationsActive,
                            color = Color(0xFF00AAFF),
                            modifier = Modifier.weight(1f)
                        ) {
                            showTimePicker(context) { hour, minute ->
                                val calendar = Calendar.getInstance().apply {
                                    set(Calendar.HOUR_OF_DAY, hour)
                                    set(Calendar.MINUTE, minute)
                                    set(Calendar.SECOND, 0)
                                }
                                if (calendar.timeInMillis <= System.currentTimeMillis()) {
                                    calendar.add(Calendar.DAY_OF_YEAR, 1)
                                }
                                viewModel.addStudyGoal(note.title, calendar.timeInMillis, context, syncToCalendar = true)
                                Toast.makeText(context, "Reminder set for ${hour}:${minute}", Toast.LENGTH_SHORT).show()
                            }
                        }
                        
                        ActionButton(
                            text = "Tamil Trans",
                            icon = Icons.Default.Translate,
                            color = Color(0xFF673AB7),
                            modifier = Modifier.weight(1f)
                        ) {
                            viewModel.translateToTamil(note.content)
                        }

                        ActionButton(
                            text = if (isSpeaking) "Stop" else "Speak",
                            icon = if (isSpeaking) Icons.AutoMirrored.Filled.VolumeOff else Icons.Default.VolumeUp,
                            color = Color(0xFFFF9800),
                            modifier = Modifier.weight(1f)
                        ) {
                            viewModel.toggleSpeakText(translatedText ?: note.content)
                        }
                    }

                    AnimatedVisibility(visible = translatedText != null) {
                        Card(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.3f))
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text("Tamil Translation", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.secondary)
                                    Spacer(modifier = Modifier.weight(1f))
                                    IconButton(onClick = { viewModel.clearTranslation() }) {
                                        Icon(Icons.Default.Close, contentDescription = "Clear", modifier = Modifier.size(16.dp))
                                    }
                                }
                                Text(translatedText ?: "", style = MaterialTheme.typography.bodyMedium)
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Note Content", style = MaterialTheme.typography.titleMedium)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = { viewModel.updateFontSize(fontSize - 2f) }) {
                                Icon(Icons.Default.ZoomOut, "Decrease font", modifier = Modifier.size(24.dp), tint = TechBlue)
                            }
                            Text("${fontSize.toInt()}", style = MaterialTheme.typography.labelLarge, color = TechBlue)
                            IconButton(onClick = { viewModel.updateFontSize(fontSize + 2f) }) {
                                Icon(Icons.Default.ZoomIn, "Increase font", modifier = Modifier.size(24.dp), tint = TechBlue)
                            }
                        }
                    }

                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 12.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            text = note.content,
                            style = MaterialTheme.typography.bodyLarge.copy(fontSize = fontSize.sp),
                            modifier = Modifier.padding(16.dp)
                        )
                    }
                }
            }

            if (showShareDialog) {
                AlertDialog(
                    onDismissRequest = { showShareDialog = false },
                    title = { Text("Share Note") },
                    text = {
                        Column {
                            Text("Enter recipient's email to share this note directly to their app.", fontSize = 12.sp)
                            Spacer(modifier = Modifier.height(16.dp))
                            OutlinedTextField(
                                value = recipientEmail,
                                onValueChange = { recipientEmail = it },
                                label = { Text("Recipient Email") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                                keyboardActions = KeyboardActions(
                                    onDone = { keyboardController?.hide() }
                                )
                            )
                        }
                    },
                    confirmButton = {
                        Button(
                            onClick = {
                                if (recipientEmail.isNotBlank()) {
                                    viewModel.shareNote(note.id, recipientEmail)
                                    showShareDialog = false
                                    recipientEmail = ""
                                }
                            }
                        ) {
                            Text("SHARE")
                        }
                    },
                    dismissButton = {
                        TextButton(onClick = { showShareDialog = false }) {
                            Text("CANCEL")
                        }
                    }
                )
            }

            if (showDeleteConfirm) {
                AlertDialog(
                    onDismissRequest = { showDeleteConfirm = false },
                    title = { Text("Delete Note") },
                    text = { Text("Are you sure you want to delete this note? This action cannot be undone.") },
                    confirmButton = {
                        Button(
                            onClick = {
                                viewModel.deleteNote(note.id)
                                showDeleteConfirm = false
                                navController.popBackStack()
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color.Red)
                        ) {
                            Text("DELETE", color = Color.White)
                        }
                    },
                    dismissButton = {
                        TextButton(onClick = { showDeleteConfirm = false }) {
                            Text("CANCEL")
                        }
                    }
                )
            }
        }
    }
}

private fun showTimePicker(context: android.content.Context, onTimeSelected: (Int, Int) -> Unit) {
    val calendar = Calendar.getInstance()
    TimePickerDialog(
        context,
        { _, hourOfDay, minute -> onTimeSelected(hourOfDay, minute) },
        calendar.get(Calendar.HOUR_OF_DAY),
        calendar.get(Calendar.MINUTE),
        false
    ).show()
}

@Composable
fun ActionButton(text: String, icon: ImageVector, color: Color, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = modifier.height(64.dp),
        contentPadding = PaddingValues(0.dp),
        colors = ButtonDefaults.buttonColors(containerColor = color.copy(alpha = 0.1f)),
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.3f))
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(icon, contentDescription = text, tint = color, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.height(4.dp))
            Text(text, style = MaterialTheme.typography.labelSmall, color = color, fontSize = 10.sp, maxLines = 1)
        }
    }
}
