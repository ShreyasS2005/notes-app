import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Brain, Sparkles } from 'lucide-react';

const Flashcard = ({ card, isFlipped, onFlip }) => {
  return (
    <div
      className="relative w-full aspect-[4/3] cursor-pointer perspective-1000"
      onClick={onFlip}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full relative"
      >
        {/* Front */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden bg-gray-900 border-2 border-cyan-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(6,182,212,0.1)]"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-500 font-bold mb-4 opacity-50">Question / Concept</span>
          <h3 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
            {card.front}
          </h3>
          <div className="mt-8 flex items-center gap-2 text-gray-500 text-xs">
            <Sparkles className="w-3 h-3" />
            <span>Click to reveal answer</span>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden bg-purple-900/20 border-2 border-purple-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(168,85,247,0.1)]"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-purple-500 font-bold mb-4 opacity-50">Answer / Explanation</span>
          <div className="text-lg text-gray-200 leading-relaxed overflow-y-auto max-h-full">
            {card.back}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const FlashcardPlayer = ({ cards, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setDirection(1);
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="max-w-2xl mx-auto w-full px-4">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <Brain className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Study Mode</h2>
            <p className="text-xs text-gray-500">Flashcard session active</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-gray-400">
            {currentIndex + 1} <span className="text-gray-600">/ {cards.length}</span>
          </span>
        </div>
      </div>

      <div className="w-full bg-gray-800 h-1.5 rounded-full mb-12 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
        />
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -50 }}
          transition={{ duration: 0.3 }}
        >
          <Flashcard
            card={cards[currentIndex]}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
          />
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 flex items-center justify-center gap-6">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-4 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Flip
        </button>

        <button
          onClick={handleNext}
          className="p-4 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default FlashcardPlayer;
