package com.ai.smart.notes.util

import android.content.ContentValues
import android.content.Context
import android.provider.CalendarContract
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CalendarHelper @Inject constructor() {

    fun addEventToCalendar(context: Context, title: String, description: String, startTimeMillis: Long) {
        val cr = context.contentResolver
        val values = ContentValues().apply {
            put(CalendarContract.Events.DTSTART, startTimeMillis)
            put(CalendarContract.Events.DTEND, startTimeMillis + 60 * 60 * 1000) // 1 hour duration
            put(CalendarContract.Events.TITLE, title)
            put(CalendarContract.Events.DESCRIPTION, description)
            put(CalendarContract.Events.CALENDAR_ID, 1) // Default calendar
            put(CalendarContract.Events.EVENT_TIMEZONE, TimeZone.getDefault().id)
        }
        try {
            cr.insert(CalendarContract.Events.CONTENT_URI, values)
        } catch (e: SecurityException) {
            // Handle permission not granted
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
