package com.ai.smart.notes.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.ai.smart.notes.ui.theme.NeonPurple
import com.ai.smart.notes.ui.theme.TechBlue

@Composable
fun SecurityScreen(navController: NavController) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Box(
            modifier = Modifier
                .size(300.dp)
                .offset(x = (-100).dp, y = 100.dp)
                .blur(100.dp)
                .background(NeonPurple.copy(alpha = 0.1f), RoundedCornerShape(150.dp))
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
                Text(
                    text = "Security Hub",
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.Bold,
                        brush = Brush.horizontalGradient(listOf(TechBlue, NeonPurple))
                    )
                )
            }

            Spacer(modifier = Modifier.height(32.dp))

            SecurityOption(
                icon = Icons.Default.Fingerprint,
                title = "Biometric Authentication",
                description = "Secure your notes with your fingerprint or face.",
                isToggle = true
            )

            SecurityOption(
                icon = Icons.Default.EnhancedEncryption,
                title = "End-to-End Encryption",
                description = "Your notes are encrypted before being synced to the cloud.",
                isToggle = false,
                tag = "ACTIVE"
            )

            SecurityOption(
                icon = Icons.Default.LockReset,
                title = "Two-Factor Auth",
                description = "Add an extra layer of security to your account.",
                isToggle = true
            )

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = { /* Reset Password logic */ },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = TechBlue),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text("Change Access Password", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun SecurityOption(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    description: String,
    isToggle: Boolean,
    tag: String? = null
) {
    var checked by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.05f)),
        shape = RoundedCornerShape(20.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.1f))
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(TechBlue.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = TechBlue)
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(title, color = Color.White, fontWeight = FontWeight.Bold)
                    if (tag != null) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(Color.Green.copy(alpha = 0.2f))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(tag, color = Color.Green, fontSize = 10.sp, fontWeight = FontWeight.ExtraBold)
                        }
                    }
                }
                Text(description, color = Color.White.copy(alpha = 0.6f), style = MaterialTheme.typography.bodySmall)
            }

            if (isToggle) {
                Switch(
                    checked = checked,
                    onCheckedChange = { checked = it },
                    colors = SwitchDefaults.colors(checkedThumbColor = TechBlue)
                )
            }
        }
    }
}
