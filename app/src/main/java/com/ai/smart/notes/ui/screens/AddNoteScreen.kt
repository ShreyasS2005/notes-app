package com.ai.smart.notes.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.ai.smart.notes.ui.viewmodel.NoteUiState
import com.ai.smart.notes.ui.viewmodel.NoteViewModel
import com.ai.smart.notes.ui.theme.TechBlue

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddNoteScreen(navController: NavController, viewModel: NoteViewModel = hiltViewModel()) {
    var title by remember { mutableStateOf("") }
    var content by remember { mutableStateOf("") }
    val context = LocalContext.current
    val keyboardController = LocalSoftwareKeyboardController.current
    val uiState by viewModel.uiState.collectAsState()
    val isListening by viewModel.isListening.collectAsState()
    val characterCount by viewModel.characterCount.collectAsState()
    val predictedTime by viewModel.predictedTime.collectAsState()

    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            viewModel.startVoiceCapture { text ->
                content = if (content.isEmpty()) text else "$content $text"
                viewModel.updateNoteMetrics(content)
            }
        } else {
            Toast.makeText(context, "Microphone permission is required for voice notes.", Toast.LENGTH_SHORT).show()
        }
    }

    val imageLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri?.let { viewModel.processImageNote(context, it, title.ifEmpty { "Image Note" }) }
    }

    val pdfLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri?.let { viewModel.processPdfNote(context, it, title.ifEmpty { "PDF Note" }) }
    }

    LaunchedEffect(Unit) {
        viewModel.initVosk(context)
    }

    LaunchedEffect(uiState) {
        if (uiState is NoteUiState.Success) {
            Toast.makeText(context, (uiState as NoteUiState.Success).message, Toast.LENGTH_SHORT).show()
        } else if (uiState is NoteUiState.Error) {
            Toast.makeText(context, (uiState as NoteUiState.Error).message, Toast.LENGTH_LONG).show()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Neural Note Engine", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    TextButton(onClick = {
                        if (title.isNotEmpty() && content.isNotEmpty()) {
                            viewModel.addTextNote(title, content)
                            navController.popBackStack()
                        } else {
                            Toast.makeText(context, "Title and Content are required.", Toast.LENGTH_SHORT).show()
                        }
                    }) {
                        Text("SYNC", color = TechBlue, fontWeight = FontWeight.Bold)
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
            ) {
                TextField(
                    value = title,
                    onValueChange = { title = it },
                    placeholder = { Text("Enter Topic...", fontSize = 20.sp, fontWeight = FontWeight.Bold) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color.Transparent,
                        unfocusedContainerColor = Color.Transparent,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent
                    ),
                    textStyle = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold)
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))

            // Metrics Row
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "$characterCount characters",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.Gray
                )
                if (predictedTime != null) {
                    Text(
                        text = "Est. Study: $predictedTime",
                        style = MaterialTheme.typography.labelSmall,
                        color = TechBlue,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = content,
                onValueChange = { 
                    content = it
                    viewModel.updateNoteMetrics(it)
                },
                placeholder = { Text("Neural input or start typing...") },
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(
                    onDone = { keyboardController?.hide() }
                ),
                shape = RoundedCornerShape(12.dp)
            )

            if (uiState is NoteUiState.Loading || isListening) {
                LinearProgressIndicator(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                    color = TechBlue
                )
                Text(
                    text = if (isListening) "Neural Voice: LISTENING" else (uiState as? NoteUiState.Loading)?.message ?: "Processing...",
                    style = MaterialTheme.typography.labelSmall,
                    color = TechBlue
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                color = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.5f)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceAround,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    ActionIcon(Icons.Default.CameraAlt, "Scan Note") { imageLauncher.launch("image/*") }
                    ActionIcon(Icons.Default.PictureAsPdf, "PDF Parse") { pdfLauncher.launch("application/pdf") }
                    ActionIcon(
                        if (isListening) Icons.Default.Stop else Icons.Default.Mic, 
                        if (isListening) "Stop" else "Voice"
                    ) {
                        if (!isListening) {
                            if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                                viewModel.startVoiceCapture { text ->
                                    content = if (content.isEmpty()) text else "$content $text"
                                    viewModel.updateNoteMetrics(content)
                                }
                            } else {
                                permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                            }
                        } else {
                            viewModel.stopVoiceCapture()
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ActionIcon(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, onClick: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        FilledIconButton(
            onClick = onClick, 
            colors = IconButtonDefaults.filledIconButtonColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Icon(icon, contentDescription = label, tint = TechBlue)
        }
        Text(label, style = MaterialTheme.typography.labelSmall, fontSize = 10.sp)
    }
}
