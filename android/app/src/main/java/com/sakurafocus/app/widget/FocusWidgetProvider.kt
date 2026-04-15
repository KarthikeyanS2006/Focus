package com.sakurafocus.app.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import android.app.PendingIntent
import android.graphics.Color
import android.view.View
import org.json.JSONObject
import android.content.SharedPreferences

class FocusWidgetProvider : AppWidgetProvider() {

    companion object {
        const val ACTION_UPDATE = "com.sakurafocus.app.ACTION_UPDATE_WIDGET"
        const val EXTRA_PHASE = "phase"
        const val EXTRA_SECONDS_LEFT = "seconds_left"
        const val EXTRA_STREAK = "streak"
        const val EXTRA_GOAL = "goal"
        const val EXTRA_ROUND = "round"
        const val EXTRA_IS_RUNNING = "is_running"
        
        private const val PREFS_NAME = "FocusWidgetPrefs"
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        
        if (intent.action == ACTION_UPDATE) {
            val phase = intent.getStringExtra(EXTRA_PHASE) ?: "idle"
            val secondsLeft = intent.getIntExtra(EXTRA_SECONDS_LEFT, 0)
            val streak = intent.getIntExtra(EXTRA_STREAK, 0)
            val goal = intent.getStringExtra(EXTRA_GOAL) ?: ""
            val round = intent.getIntExtra(EXTRA_ROUND, 1)
            val isRunning = intent.getBooleanExtra(EXTRA_IS_RUNNING, false)
            
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(
                android.content.ComponentName(context, FocusWidgetProvider::class.java)
            )
            
            for (appWidgetId in appWidgetIds) {
                updateAppWidgetWithData(
                    context,
                    appWidgetManager,
                    appWidgetId,
                    phase,
                    secondsLeft,
                    streak,
                    goal,
                    round,
                    isRunning
                )
            }
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        
        val phase = prefs.getString("phase_$appWidgetId", "idle") ?: "idle"
        val secondsLeft = prefs.getInt("seconds_$appWidgetId", 0)
        val streak = prefs.getInt("streak_$appWidgetId", 0)
        val goal = prefs.getString("goal_$appWidgetId", "") ?: ""
        val round = prefs.getInt("round_$appWidgetId", 1)
        val isRunning = prefs.getBoolean("running_$appWidgetId", false)
        
        updateAppWidgetWithData(
            context,
            appWidgetManager,
            appWidgetId,
            phase,
            secondsLeft,
            streak,
            goal,
            round,
            isRunning
        )
    }

    private fun updateAppWidgetWithData(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        phase: String,
        secondsLeft: Int,
        streak: Int,
        goal: String,
        round: Int,
        isRunning: Boolean
    ) {
        val views = RemoteViews(context.packageName, R.layout.widget_focus_timer)

        // Format time
        val minutes = secondsLeft / 60
        val seconds = secondsLeft % 60
        val timeText = String.format("%02d:%02d", minutes, seconds)

        // Set timer text
        views.setTextViewText(R.id.widget_time, timeText)

        // Set phase indicator
        when (phase) {
            "focus" -> {
                views.setTextViewText(R.id.widget_phase, if (isRunning) "🎯 FOCUSING" else "⏸️ PAUSED")
                views.setInt(R.id.widget_container, "setBackgroundColor", Color.parseColor("#1a1a2e"))
                views.setInt(R.id.widget_progress, "setProgress", calculateProgress(secondsLeft, 25 * 60))
            }
            "break" -> {
                views.setTextViewText(R.id.widget_phase, "☕ BREAK TIME")
                views.setInt(R.id.widget_container, "setBackgroundColor", Color.parseColor("#0d1b2a"))
                views.setInt(R.id.widget_progress, "setProgress", calculateProgress(secondsLeft, 5 * 60))
            }
            else -> {
                views.setTextViewText(R.id.widget_phase, "🌸 READY")
                views.setInt(R.id.widget_container, "setBackgroundColor", Color.parseColor("#16213e"))
                views.setInt(R.id.widget_progress, "setProgress", 0)
            }
        }

        // Set streak
        views.setTextViewText(R.id.widget_streak, "🔥 $streak")

        // Set goal
        if (goal.isNotEmpty()) {
            views.setTextViewText(R.id.widget_goal, "Goal: $goal")
            views.setViewVisibility(R.id.widget_goal, View.VISIBLE)
        } else {
            views.setViewVisibility(R.id.widget_goal, View.GONE)
        }

        // Set round
        views.setTextViewText(R.id.widget_round, "Round $round/4")

        // Open app on click
        val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

        // Update widget
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun calculateProgress(secondsLeft: Int, totalSeconds: Int): Int {
        if (totalSeconds == 0) return 0
        val elapsed = totalSeconds - secondsLeft
        return (elapsed * 100) / totalSeconds
    }

    override fun onEnabled(context: Context) {
        // First widget added
    }

    override fun onDisabled(context: Context) {
        // Last widget removed
    }
}
