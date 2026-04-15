package com.sakurafocus.app

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class FocusWidgetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "FocusWidgetModule"
        private const val PREFS_NAME = "FocusWidgetPrefs"
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun updateWidget(
        phase: String,
        secondsLeft: Int,
        streak: Int,
        goal: String,
        round: Int,
        isRunning: Boolean
    ) {
        try {
            val context = reactApplicationContext
            
            // Save to SharedPreferences for widget provider to read
            val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().apply {
                putString("phase", phase)
                putInt("seconds", secondsLeft)
                putInt("streak", streak)
                putString("goal", goal)
                putInt("round", round)
                putBoolean("running", isRunning)
                apply()
            }

            // Send broadcast to update widget
            val intent = Intent(context, com.sakurafocus.app.widget.FocusWidgetProvider::class.java).apply {
                action = "com.sakurafocus.app.ACTION_UPDATE_WIDGET"
                putExtra("phase", phase)
                putExtra("seconds_left", secondsLeft)
                putExtra("streak", streak)
                putExtra("goal", goal)
                putExtra("round", round)
                putExtra("is_running", isRunning)
            }
            context.sendBroadcast(intent)

            // Also update via AppWidgetManager
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(
                ComponentName(context, com.sakurafocus.app.widget.FocusWidgetProvider::class.java)
            )
            
            if (appWidgetIds.isNotEmpty()) {
                val updateIntent = Intent(context, com.sakurafocus.app.widget.FocusWidgetProvider::class.java).apply {
                    action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                    putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds)
                    putExtra("phase", phase)
                    putExtra("seconds_left", secondsLeft)
                    putExtra("streak", streak)
                    putExtra("goal", goal)
                    putExtra("round", round)
                    putExtra("is_running", isRunning)
                }
                context.sendBroadcast(updateIntent)
            }

        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun getWidgetIds(callback: com.facebook.react.bridge.Callback) {
        try {
            val context = reactApplicationContext
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(
                ComponentName(context, com.sakurafocus.app.widget.FocusWidgetProvider::class.java)
            )
            callback.invoke(appWidgetIds.size)
        } catch (e: Exception) {
            callback.invoke(0)
        }
    }
}
