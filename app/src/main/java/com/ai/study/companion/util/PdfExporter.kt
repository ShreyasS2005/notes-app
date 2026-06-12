package com.ai.study.companion.util

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.os.Environment
import android.widget.Toast
import com.ai.study.companion.data.local.entity.QuizAttemptEntity
import java.io.File
import java.io.FileOutputStream
import java.io.IOException

object PdfExporter {

    fun exportQuizResult(context: Context, attempt: QuizAttemptEntity, quizTitle: String) {
        val pdfDocument = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(300, 600, 1).create()
        val page = pdfDocument.startPage(pageInfo)
        val canvas: Canvas = page.canvas
        val paint = Paint()

        paint.color = Color.BLACK
        paint.textSize = 16f
        canvas.drawText("Quiz Result: $quizTitle", 10f, 25f, paint)

        paint.textSize = 12f
        canvas.drawText("Score: ${attempt.score} / ${attempt.totalQuestions}", 10f, 50f, paint)
        canvas.drawText("Accuracy: ${(attempt.score.toFloat() / attempt.totalQuestions) * 100}%", 10f, 70f, paint)
        canvas.drawText("Date: ${java.util.Date(attempt.timestamp)}", 10f, 90f, paint)

        pdfDocument.finishPage(page)

        val directory = context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)
        val file = File(directory, "QuizResult_${attempt.id}.pdf")

        try {
            pdfDocument.writeTo(FileOutputStream(file))
            Toast.makeText(context, "PDF saved to ${file.absolutePath}", Toast.LENGTH_LONG).show()
        } catch (e: IOException) {
            e.printStackTrace()
            Toast.makeText(context, "Error saving PDF", Toast.LENGTH_SHORT).show()
        }

        pdfDocument.close()
    }
}
