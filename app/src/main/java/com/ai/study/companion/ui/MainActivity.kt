package com.ai.study.companion.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.ai.study.companion.ui.screens.*
import com.ai.study.companion.ui.theme.AiStudyCompanionTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AiStudyCompanionTheme {
                MainScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val showBottomBar = currentRoute in listOf(
        NavigationItem.Home.route,
        NavigationItem.Summary.route,
        NavigationItem.Analytics.route,
        NavigationItem.Reminders.route
    )

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    val items = listOf(
                        NavigationItem.Home,
                        NavigationItem.Summary,
                        NavigationItem.Analytics,
                        NavigationItem.Reminders
                    )
                    items.forEach { item ->
                        NavigationBarItem(
                            icon = { Icon(item.icon, contentDescription = item.title) },
                            label = { Text(item.title) },
                            selected = currentRoute == item.route,
                            onClick = {
                                navController.navigate(item.route) {
                                    popUpTo(navController.graph.startDestinationId) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "splash",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("splash") {
                SplashScreen(onNext = {
                    navController.navigate(NavigationItem.Home.route) {
                        popUpTo("splash") { inclusive = true }
                    }
                })
            }
            composable(NavigationItem.Home.route) { HomeScreen(navController) }
            composable(NavigationItem.Summary.route) { SummaryScreen(navController) }
            composable(
                route = "summary_detail/{summaryId}",
                arguments = listOf(navArgument("summaryId") { type = NavType.LongType })
            ) { backStackEntry ->
                val summaryId = backStackEntry.arguments?.getLong("summaryId") ?: -1L
                SummaryDetailScreen(
                    summaryId = summaryId,
                    onNavigateToQuiz = { navController.navigate("quiz/$summaryId") }
                )
            }
            composable(NavigationItem.Analytics.route) { AnalyticsScreen() }
            composable(NavigationItem.Reminders.route) { ReminderScreen() }
            composable(
                route = "quiz/{summaryId}",
                arguments = listOf(navArgument("summaryId") { type = NavType.LongType })
            ) { backStackEntry ->
                val summaryId = backStackEntry.arguments?.getLong("summaryId") ?: -1L
                QuizScreen(summaryId)
            }
        }
    }
}

sealed class NavigationItem(val route: String, val icon: androidx.compose.ui.graphics.vector.ImageVector, val title: String) {
    object Home : NavigationItem("home", Icons.Default.Home, "Home")
    object Summary : NavigationItem("summary", Icons.Default.Description, "PDF")
    object Analytics : NavigationItem("analytics", Icons.Default.BarChart, "Stats")
    object Reminders : NavigationItem("reminders", Icons.Default.Notifications, "Reminders")
}
