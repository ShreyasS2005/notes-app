import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Webcam from 'react-webcam';
import { Camera, Upload, Image as ImageIcon, FileText, Loader2, X, Zap } from 'lucide-react';
import { ocrService } from '@/services/ocrService';
import { pdfService } from '@/services/pdfService';
import { motion, AnimatePresence } from 'framer-motion';

const OCRScanner = ({ onExtract }) => {
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const webcamRef = useRef(null);

  const processFile = async (file) => {
    setProcessing(true);
    setProgress(0);
    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await pdfService.extractTextFromPDF(file);
      } else {
        text = await ocrService.extractTextFromImage(file, (p) => setProgress(p));
      }
      onExtract(text, file.name, file);
    } catch (error) {
      console.error(error);
      alert('Extraction failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `webcam-capture-${Date.now()}.jpg`, { type: "image/jpeg" });
          setIsWebcamOpen(false);
          processFile(file);
        });
    }
  }, [webcamRef]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {processing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass p-12 rounded-3xl border border-cyan-500/20 text-center space-y-6"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-cyan-500 rounded-full blur-2xl opacity-20 animate-pulse" />
              <Loader2 className="w-16 h-16 text-cyan-500 animate-spin relative" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-widest">
                Analyzing <span className="text-cyan-500">Document</span>
              </h2>
              <p className="text-gray-500 mt-2">OCR Engine is decoding content... {progress}%</p>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        ) : isWebcamOpen ? (
          <motion.div
            key="webcam"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative glass rounded-3xl overflow-hidden border border-white/10"
          >
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-auto"
            />
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black to-transparent flex justify-center gap-4">
              <button
                onClick={() => setIsWebcamOpen(false)}
                className="p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <button
                onClick={capture}
                className="p-6 rounded-full bg-cyan-500 text-black shadow-2xl hover:bg-cyan-400 transition-all"
              >
                <Camera className="w-8 h-8" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div
              {...getRootProps()}
              className={`p-10 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                isDragActive ? 'border-cyan-500 bg-cyan-500/5' : 'border-white/10 hover:border-white/20 bg-white/5'
              }`}
            >
              <input {...getInputProps()} />
              <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-500 mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Drop Document</h3>
              <p className="text-xs text-gray-500">PDF, PNG, JPG supported</p>
            </div>

            <button
              onClick={() => setIsWebcamOpen(true)}
              className="p-10 rounded-3xl border border-white/10 bg-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all flex flex-col items-center justify-center text-center group"
            >
              <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-500 mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Webcam Scan</h3>
              <p className="text-xs text-gray-500">Quickly capture paper notes</p>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OCRScanner;
