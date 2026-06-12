package com.ai.smart.notes.ui

import android.Manifest
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.animation.*
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.border
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.nestedscroll.NestedScrollConnection
import androidx.compose.ui.input.nestedscroll.NestedScrollSource
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.unit.dp
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.ai.smart.notes.ui.screens.*
import com.ai.smart.notes.ui.theme.DeepSpace
import com.ai.smart.notes.ui.theme.SmartNotesTheme
import com.ai.smart.notes.ui.theme.TechBlue
import com.ai.smart.notes.util.PreferenceManager
import com.ai.smart.notes.util.TtsHelper
import com.ai.smart.notes.util.VoskHelper
import com.razorpay.Checkout
import com.razorpay.PaymentResultListener
import dagger.hilt.android.AndroidEntryPoint
import org.json.JSONObject
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : AppCompatActivity(), PaymentResultListener {
    
    @Inject
    lateinit var preferenceManager: PreferenceManager
    
    @Inject
    lateinit var voskHelper: VoskHelper
    
    @Inject
    lateinit var ttsHelper: TtsHelper

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Checkout.preload(applicationContext)
        setContent {
            var isDarkTheme by remember { mutableStateOf(preferenceManager.isDarkTheme()) }
            
            SmartNotesTheme(darkTheme = isDarkTheme) {
                MainScreen(
                    preferenceManager = preferenceManager, 
                    voskHelper = voskHelper, 
                    ttsHelper = ttsHelper, 
                    onStartPayment = ::startPayment,
                    onThemeChanged = { isDarkTheme = it }
                )
            }
        }
    }

    private fun startPayment(amount: Int) {
        val checkout = Checkout()
        checkout.setKeyID("rzp_test_YourKeyHere")
        
        try {
            val options = JSONObject()
            options.put("name", "SmartNotes AI")
            options.put("description", "Premium Subscription")
            options.put("image", "https://s3.amazonaws.com/rzp-mobile/images/rzp.png")
            options.put("theme.color", "#3399cc")
            options.put("currency", "INR")
            options.put("amount", (amount * 100).toString())
            
            val retryObj = JSONObject()
            retryObj.put("enabled", true)
            retryObj.put("max_count", 4)
            options.put("retry", retryObj)

            val prefill = JSONObject()
            prefill.put("email", preferenceManager.getEmail() ?: "user@example.com")
            prefill.put("contact", "9876543210")
            options.put("prefill", prefill)

            checkout.open(this, options)
        } catch (e: Exception) {
            Toast.makeText(this, "Error in payment: " + e.message, Toast.LENGTH_LONG).show()
            e.printStackTrace()
        }
    }

    override fun onPaymentSuccess(razorpayPaymentId: String?) {
        Toast.makeText(this, "Payment Successful: $razorpayPaymentId", Toast.LENGTH_LONG).show()
    }

    override fun onPaymentError(code: Int, response: String?) {
        Toast.makeText(this, "Payment Failed: $response", Toast.LENGTH_LONG).show()
    }
}

@Composable
fun MainScreen(
    preferenceManager: PreferenceManager,
    voskHelper: VoskHelper,
    ttsHelper: TtsHelper,
    onStartPayment: (Int) -> Unit,
    onThemeChanged: (Boolean) -> Unit
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    var isNavVisible by remember { mutableStateOf(true) }
    var permissionsRequested by remember { mutableStateOf(false) }

    // Defer permission prompts until Home is visible so Appium login→home flow is not blocked
    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { }

    LaunchedEffect(currentRoute) {
        if (currentRoute == NavigationItem.Home.route && !permissionsRequested) {
            permissionsRequested = true
            val permissions = mutableListOf(
                Manifest.permission.RECORD_AUDIO,
                Manifest.permission.READ_CALENDAR,
                Manifest.permission.WRITE_CALENDAR,
                Manifest.permission.CAMERA
            )
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                permissions.add(Manifest.permission.POST_NOTIFICATIONS)
            }
            permissionLauncher.launch(permissions.toTypedArray())
        }
    }

    val noBottomBarRoutes = listOf("login", "signup", "splash", "forgot_password")
    val showBottomBar = currentRoute !in noBottomBarRoutes && 
                       currentRoute != null && 
                       !currentRoute!!.startsWith("exam_detail") &&
                       !currentRoute!!.startsWith("note_detail") &&
                       currentRoute != "security" &&
                       currentRoute != "support" &&
                       currentRoute != "pro_version" &&
                       currentRoute != "achievements"

    val navBarColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f)
    val navBarBorderColor = TechBlue.copy(alpha = 0.5f)

    // Helper to get tab index for dynamic sliding
    fun getTabIndex(route: String?): Int {
        val tabRoutes = listOf(
            NavigationItem.Home.route,
            NavigationItem.Planner.route,
            NavigationItem.Exams.route,
            NavigationItem.Profile.route
        )
        return tabRoutes.indexOf(route)
    }

    val nestedScrollConnection = remember {
        object : NestedScrollConnection {
            override fun onPreScroll(available: Offset, source: NestedScrollSource): Offset {
                if (available.y < -10f) { // Scrolling down
                    isNavVisible = false
                } else if (available.y > 10f) { // Scrolling up
                    isNavVisible = true
                }
                return Offset.Zero
            }
        }
    }

    LaunchedEffect(currentRoute) {
        isNavVisible = true
    }

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .nestedScroll(nestedScrollConnection),
        bottomBar = {
            AnimatedVisibility(
                visible = showBottomBar && isNavVisible,
                enter = slideInVertically(initialOffsetY = { it }) + fadeIn(),
                exit = slideOutVertically(targetOffsetY = { it }) + fadeOut()
            ) {
                NavigationBar(
                    modifier = Modifier
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                        .border(1.dp, navBarBorderColor, RoundedCornerShape(24.dp))
                        .clip(RoundedCornerShape(24.dp)),
                    containerColor = navBarColor,
                    tonalElevation = 0.dp
                ) {
                    val items = listOf(
                        NavigationItem.Home,
                        NavigationItem.Planner,
                        NavigationItem.Exams,
                        NavigationItem.Profile
                    )
                    items.forEach { item ->
                        NavigationBarItem(
                            icon = { Icon(item.icon, contentDescription = item.title) },
                            label = { Text(item.title) },
                            selected = currentRoute == item.route,
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = TechBlue,
                                selectedTextColor = TechBlue,
                                unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                indicatorColor = TechBlue.copy(alpha = 0.1f)
                            ),
                            onClick = {
                                if (currentRoute != item.route) {
                                    navController.navigate(item.route) {
                                        popUpTo(navController.graph.startDestinationId) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        val borderAlpha by animateFloatAsState(
            targetValue = if (isNavVisible) 0.4f else 0f,
            animationSpec = tween(durationMillis = 300),
            label = "borderAlpha"
        )
        
        val borderPadding by animateDpAsState(
            targetValue = if (isNavVisible) 4.dp else 0.dp,
            animationSpec = tween(durationMillis = 300),
            label = "borderPadding"
        )
        
        val cornerRadius by animateDpAsState(
            targetValue = if (isNavVisible) 12.dp else 0.dp,
            animationSpec = tween(durationMillis = 300),
            label = "cornerRadius"
        )

        Box(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .padding(borderPadding)
                .border(2.dp, TechBlue.copy(alpha = borderAlpha), RoundedCornerShape(cornerRadius))
                .clip(RoundedCornerShape(cornerRadius))
        ) {
            NavHost(
                navController = navController,
                startDestination = "splash",
                modifier = Modifier.fillMaxSize(),
                enterTransition = {
                    val initialIndex = getTabIndex(initialState.destination.route)
                    val targetIndex = getTabIndex(targetState.destination.route)
                    if (initialIndex != -1 && targetIndex != -1) {
                        if (targetIndex > initialIndex) {
                            slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.Left) + fadeIn()
                        } else {
                            slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.Right) + fadeIn()
                        }
                    } else {
                        fadeIn() + slideInHorizontally { it }
                    }
                },
                exitTransition = {
                    val initialIndex = getTabIndex(initialState.destination.route)
                    val targetIndex = getTabIndex(targetState.destination.route)
                    if (initialIndex != -1 && targetIndex != -1) {
                        if (targetIndex > initialIndex) {
                            slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.Left) + fadeOut()
                        } else {
                            slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.Right) + fadeOut()
                        }
                    } else {
                        fadeOut() + slideOutHorizontally { -it }
                    }
                },
                popEnterTransition = {
                    slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.Right) + fadeIn()
                },
                popExitTransition = {
                    slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.Right) + fadeOut()
                }
            ) {
                composable("splash") { SplashScreen { navController.navigate("login") { popUpTo("splash") { inclusive = true } } } }
                composable("login") { LoginScreen(navController) }
                composable("signup") { SignupScreen(navController) }
                composable("forgot_password") { ForgotPasswordScreen(navController) }
                composable(NavigationItem.Home.route) { HomeScreen(navController) }
                composable(NavigationItem.Planner.route) { StudyPlannerScreen(navController) }
                composable(NavigationItem.Exams.route) { CompetitiveExamsScreen(navController) }
                composable(NavigationItem.Profile.route) { ProfileScreen(navController, preferenceManager) }
                
                composable(
                    "exam_detail/{examName}",
                    arguments = listOf(navArgument("examName") { type = NavType.StringType })
                ) { backStackEntry ->
                    val examName = backStackEntry.arguments?.getString("examName") ?: ""
                    ExamDetailScreen(examName, navController)
                }

                composable("security") { SecurityScreen(navController) }
                composable("support") { SupportScreen(navController) }
                composable("settings") { 
                    SettingsScreen(
                        navController = navController, 
                        preferenceManager = preferenceManager,
                        onThemeChanged = onThemeChanged
                    ) 
                }
                composable("pro_version") { ProVersionScreen(navController, onStartPayment) }

                composable("notes") { NotesScreen(navController) }
                composable("shared_notes") { SharedNotesScreen(navController) }
                composable("pomodoro") { PomodoroScreen() }
                composable("add_note") { AddNoteScreen(navController) }
                composable("achievements") { AchievementsScreen(navController) }
                composable(
                    "note_detail/{noteId}",
                    arguments = listOf(navArgument("noteId") { type = NavType.LongType })
                ) { backStackEntry ->
                    val noteId = backStackEntry.arguments?.getLong("noteId") ?: -1L
                    NoteDetailScreen(noteId, navController)
                }
                composable("analytics") { AnalyticsScreen(navController) }
            }
        }
    }
}

sealed class NavigationItem(val route: String, val icon: androidx.compose.ui.graphics.vector.ImageVector, val title: String) {
    object Home : NavigationItem("home", Icons.Default.Dashboard, "Home")
    object Planner : NavigationItem("planner", Icons.Default.CalendarMonth, "Planner")
    object Exams : NavigationItem("exams", Icons.Default.School, "Exams")
    object Profile : NavigationItem("profile", Icons.Default.Person, "Profile")
}
