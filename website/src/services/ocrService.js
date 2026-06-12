import { createWorker } from 'tesseract.js';

export const ocrService = {
  extractTextFromImage: async (imageFile, onProgress) => {
    const worker = await createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      }
    });

    try {
      const { data: { text } } = await worker.recognize(imageFile);
      await worker.terminate();
      return text;
    } catch (error) {
      console.error("OCR Error:", error);
      await worker.terminate();
      throw error;
    }
  }
};
