package com.ai.study.companion.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.ai.study.companion.data.local.entity.SummaryEntity
import com.ai.study.companion.ui.viewmodel.StudyUiState
import com.ai.study.companion.ui.viewmodel.StudyViewModel

@Composable
fun SummaryScreen(
    navController: NavController,
    viewModel: StudyViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val summaries by viewModel.summaries.collectAsState(initial = emptyList())
    val uiState by viewModel.uiState.collectAsState()

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            // Get file name from Uri (simplified)
            val fileName = it.lastPathSegment ?: "Unknown PDF"
            viewModel.processPdf(context, it, fileName)
        }
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(onClick = { launcher.launch("application/pdf") }) {
                Icon(Icons.Default.Add, contentDescription = "Upload PDF")
            }
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            if (uiState is StudyUiState.Loading) {
                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
                Text(
                    text = (uiState as StudyUiState.Loading).message,
                    modifier = Modifier.padding(16.dp)
                )
            }

            if (summaries.isEmpty() && uiState is StudyUiState.Idle) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No summaries yet. Upload a PDF to get started!")
                }
            }

            LazyColumn(modifier = Modifier.fillMaxSize()) {
                items(summaries) { summary ->
                    SummaryItem(summary) {
                        navController.navigate("summary_detail/${summary.id}")
                    }
                }
            }
        }
    }
}

@Composable
fun SummaryItem(summary: SummaryEntity, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .padding(horizontal = 16.dp),
        onClick = onClick
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = summary.fileName, style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = summary.shortSummary.take(150).replace("\n", " ") + "...",
                style = MaterialTheme.typography.bodySmall,
                maxLines = 2
            )
        }
    }
}
