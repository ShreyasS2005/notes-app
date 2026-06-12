package com.ai.study.companion.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.ai.study.companion.data.remote.AiService
import javax.inject.Inject

@Composable
fun HomeScreen(navController: NavController, aiService: AiService = hiltViewModel<HomeScreenViewModel>().aiService) {
    var apiKey by remember { mutableStateOf("") }
    var isApiKeySet by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "AI Study Companion",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )
        Text(
            text = "Master your subjects with AI-powered summaries and quizzes.",
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.padding(top = 8.dp),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(32.dp))

        if (!isApiKeySet) {
            TextField(
                value = apiKey,
                onValueChange = { apiKey = it },
                label = { Text("Enter Gemini API Key") },
                modifier = Modifier.fillMaxWidth(),
                visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation()
            )
            Button(
                onClick = {
                    if (apiKey.isNotEmpty()) {
                        aiService.setApiKey(apiKey)
                        isApiKeySet = true
                    }
                },
                modifier = Modifier.padding(top = 8.dp)
            ) {
                Text("Set API Key")
            }
        } else {
            Text("AI Service Ready ✅", color = MaterialTheme.colorScheme.secondary)
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = { navController.navigate("summary") },
                modifier = Modifier.fillMaxWidth().height(56.dp)
            ) {
                Text("Upload PDF & Summarize")
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedButton(
                onClick = { navController.navigate("analytics") },
                modifier = Modifier.fillMaxWidth().height(56.dp)
            ) {
                Text("View Your Progress")
            }
        }
    }
}

// Simple ViewModel to inject AiService into HomeScreen
@dagger.hilt.android.lifecycle.HiltViewModel
class HomeScreenViewModel @Inject constructor(val aiService: AiService) : androidx.lifecycle.ViewModel()
