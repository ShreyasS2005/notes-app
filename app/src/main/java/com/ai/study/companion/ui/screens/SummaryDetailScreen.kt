package com.ai.study.companion.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.ai.study.companion.ui.viewmodel.StudyViewModel

@Composable
fun SummaryDetailScreen(
    summaryId: Long,
    onNavigateToQuiz: () -> Unit,
    viewModel: StudyViewModel = hiltViewModel()
) {
    val summaries by viewModel.summaries.collectAsState(initial = emptyList())
    val summary = summaries.find { it.id == summaryId }

    Scaffold(
        bottomBar = {
            Button(
                onClick = onNavigateToQuiz,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Text("Take Quiz")
            }
        }
    ) { padding ->
        if (summary != null) {
            Column(
                modifier = Modifier
                    .padding(padding)
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(text = summary.fileName, style = MaterialTheme.typography.headlineMedium)
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(text = "Summary", style = MaterialTheme.typography.titleLarge)
                Text(text = summary.shortSummary, style = MaterialTheme.typography.bodyMedium)
                
                if (summary.keyConcepts.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(text = "Key Concepts", style = MaterialTheme.typography.titleLarge)
                    Text(text = summary.keyConcepts, style = MaterialTheme.typography.bodyMedium)
                }
            }
        } else {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) {
                Text("Summary not found")
            }
        }
    }
}
