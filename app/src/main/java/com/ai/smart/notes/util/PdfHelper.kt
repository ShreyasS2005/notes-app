package com.ai.smart.notes.util

import android.content.Context
import android.content.Intent
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.net.Uri
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream

class PdfHelper {
    fun generateAndSharePdf(context: Context, title: String, content: String) {
        val pdfDocument = PdfDocument()
        val pageWidth = 595
        val pageHeight = 842
        var pageNumber = 1
        
        val paint = Paint()
        val titlePaint = Paint().apply {
            textSize = 24f
            isFakeBoldText = true
        }
        val textPaint = Paint().apply {
            textSize = 14f
        }

        var pageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, pageNumber).create()
        var page = pdfDocument.startPage(pageInfo)
        var canvas = page.canvas

        // Draw Title
        canvas.drawText(title, 50f, 60f, titlePaint)
        
        var y = 100f
        val margin = 50f
        val maxWidth = pageWidth - (margin * 2)

        val paragraphs = content.split("\n")
        
        for (paragraph in paragraphs) {
            val words = paragraph.split(" ")
            var line = ""
            
            for (word in words) {
                val testLine = if (line.isEmpty()) word else "$line $word"
                if (textPaint.measureText(testLine) > maxWidth) {
                    canvas.drawText(line, margin, y, textPaint)
                    y += 20f
                    line = word
                    
                    if (y > pageHeight - margin) {
                        pdfDocument.finishPage(page)
                        pageNumber++
                        pageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, pageNumber).create()
                        page = pdfDocument.startPage(pageInfo)
                        canvas = page.canvas
                        y = margin
                    }
                } else {
                    line = testLine
                }
            }
            canvas.drawText(line, margin, y, textPaint)
            y += 25f // Paragraph spacing

            if (y > pageHeight - margin) {
                pdfDocument.finishPage(page)
                pageNumber++
                pageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, pageNumber).create()
                page = pdfDocument.startPage(pageInfo)
                canvas = page.canvas
                y = margin
            }
        }

        pdfDocument.finishPage(page)

        val fileName = "${title.replace("[^a-zA-Z0-9]".toRegex(), "_")}.pdf"
        val file = File(context.cacheDir, fileName)
        try {
            pdfDocument.writeTo(FileOutputStream(file))
        } catch (e: Exception) {
            e.printStackTrace()
        }
        pdfDocument.close()

        val uri: Uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )

        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "application/pdf"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, title)
            putExtra(Intent.EXTRA_TEXT, "Shared via SmartNotes AI")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(Intent.createChooser(intent, "Share Note as PDF"))
    }
}
