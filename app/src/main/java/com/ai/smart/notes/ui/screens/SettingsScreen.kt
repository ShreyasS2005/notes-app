package com.ai.smart.notes.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.ai.smart.notes.ui.theme.NeonPurple
import com.ai.smart.notes.ui.theme.TechBlue
import com.ai.smart.notes.ui.viewmodel.NoteViewModel
import com.ai.smart.notes.util.PreferenceManager
import com.google.firebase.auth.FirebaseAuth

@Composable
fun SettingsScreen(
    navController: NavController, 
    preferenceManager: PreferenceManager,
    viewModel: NoteViewModel = hiltViewModel(),
    onThemeChanged: (Boolean) -> Unit = {}
) {
    val auth = FirebaseAuth.getInstance()
    val userStats by viewModel.userStats.collectAsState()
    val keyboardController = LocalSoftwareKeyboardController.current
    
    var newUsername by remember { mutableStateOf("") }
    var isEditingName by remember { mutableStateOf(false) }
    
    var fontSizeMultiplier by remember { mutableStateOf(preferenceManager.getFontSizeMultiplier()) }
    var notificationsEnabled by remember { mutableStateOf(true) }
    var isDarkTheme by remember { mutableStateOf(preferenceManager.isDarkTheme()) }

    val textColor = MaterialTheme.colorScheme.onSurface

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Box(
            modifier = Modifier
                .size(300.dp)
                .offset(x = 200.dp, y = (-100).dp)
                .blur(80.dp)
                .background(TechBlue.copy(alpha = 0.1f), RoundedCornerShape(150.dp))
        )

        Column(modifier = Modifier.fillMaxSize().padding(24.dp)) {
            Text(
                text = "Core Configuration",
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontWeight = FontWeight.Bold,
                    brush = Brush.horizontalGradient(listOf(TechBlue, NeonPurple))
                )
            )
            
            Spacer(modifier = Modifier.height(32.dp))

            // Account Section
            Text("IDENTITY", style = MaterialTheme.typography.labelLarge, color = TechBlue)
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                shape = RoundedCornerShape(20.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Person, contentDescription = null, tint = TechBlue)
                        Spacer(modifier = Modifier.width(16.dp))
                        if (isEditingName) {
                            OutlinedTextField(
                                value = newUsername,
                                onValueChange = { newUsername = it },
                                modifier = Modifier.weight(1f),
                                label = { Text("New Username") },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                                keyboardActions = KeyboardActions(
                                    onDone = {
                                        keyboardController?.hide()
                                        if (newUsername.isNotBlank()) {
                                            viewModel.updateUsername(newUsername)
                                            isEditingName = false
                                        }
                                    }
                                ),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = TechBlue,
                                    unfocusedBorderColor = textColor.copy(alpha = 0.2f),
                                    focusedTextColor = textColor,
                                    unfocusedTextColor = textColor
                                )
                            )
                            IconButton(onClick = { 
                                if (newUsername.isNotBlank()) {
                                    viewModel.updateUsername(newUsername)
                                    isEditingName = false
                                }
                            }) {
                                Icon(Icons.Default.Check, "Save", tint = Color.Green)
                            }
                        } else {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(userStats?.username ?: "Explorer", style = MaterialTheme.typography.titleMedium, color = textColor)
                                Text(userStats?.email ?: "", style = MaterialTheme.typography.bodySmall, color = textColor.copy(alpha = 0.6f))
                            }
                            IconButton(onClick = { 
                                newUsername = userStats?.username ?: ""
                                isEditingName = true 
                            }) {
                                Icon(Icons.Default.Edit, "Edit", tint = TechBlue)
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Appearance Section
            Text("INTERFACE", style = MaterialTheme.typography.labelLarge, color = TechBlue)
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                shape = RoundedCornerShape(20.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.FormatSize, contentDescription = null, tint = TechBlue)
                        Spacer(modifier = Modifier.width(16.dp))
                        Text("Neural Font Scaling", modifier = Modifier.weight(1f), color = textColor)
                        IconButton(onClick = { 
                            fontSizeMultiplier = (fontSizeMultiplier - 0.1f).coerceAtLeast(0.8f)
                            preferenceManager.setFontSizeMultiplier(fontSizeMultiplier)
                        }) { Icon(Icons.Default.Remove, "Decrease", tint = textColor) }
                        Text("${(fontSizeMultiplier * 100).toInt()}%", color = textColor)
                        IconButton(onClick = { 
                            fontSizeMultiplier = (fontSizeMultiplier + 0.1f).coerceAtMost(1.5f)
                            preferenceManager.setFontSizeMultiplier(fontSizeMultiplier)
                        }) { Icon(Icons.Default.Add, "Increase", tint = textColor) }
                    }
                    
                    HorizontalDivider(color = textColor.copy(alpha = 0.1f), modifier = Modifier.padding(vertical = 8.dp))
                    
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(if (isDarkTheme) Icons.Default.DarkMode else Icons.Default.LightMode, contentDescription = null, tint = TechBlue)
                        Spacer(modifier = Modifier.width(16.dp))
                        Text("Dark Atmosphere", modifier = Modifier.weight(1f), color = textColor)
                        Switch(
                            checked = isDarkTheme, 
                            onCheckedChange = { 
                                isDarkTheme = it
                                preferenceManager.setDarkTheme(it)
                                onThemeChanged(it)
                            },
                            colors = SwitchDefaults.colors(checkedThumbColor = TechBlue)
                        )
                    }

                    HorizontalDivider(color = textColor.copy(alpha = 0.1f), modifier = Modifier.padding(vertical = 8.dp))
                    
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Notifications, contentDescription = null, tint = TechBlue)
                        Spacer(modifier = Modifier.width(16.dp))
                        Text("Pulse Notifications", modifier = Modifier.weight(1f), color = textColor)
                        Switch(
                            checked = notificationsEnabled, 
                            onCheckedChange = { notificationsEnabled = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = TechBlue)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {
                    auth.signOut()
                    navController.navigate("login") {
                        popUpTo(0) { inclusive = true }
                    }
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF2E63).copy(alpha = 0.2f)),
                shape = RoundedCornerShape(16.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFF2E63).copy(alpha = 0.5f))
            ) {
                Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = null, tint = Color(0xFFFF2E63))
                Spacer(modifier = Modifier.width(8.dp))
                Text("TERMINATE SESSION", color = Color(0xFFFF2E63), fontWeight = FontWeight.Bold)
            }
        }
    }
}
