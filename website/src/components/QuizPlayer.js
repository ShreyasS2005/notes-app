import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Timer, Award, ArrowRight, RotateCcw } from 'lucide-react';

const QuizPlayer = ({ quiz, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  useEffect(() => {
    if (isFinished) return;

    if (timeLeft === 0) {
      handleNextQuestion(null);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  const handleAnswer = (answer) => {
    if (showExplanation) return;

    const isCorrect = answer === currentQuestion.correctAnswer;
    if (isCorrect) setScore(prev => prev + 1);

    setAnswers([...answers, { questionId: currentQuestion.id, answer, isCorrect }]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setTimeLeft(30);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      onComplete({
        score,
        totalQuestions: quiz.questions.length,
        answers: [...answers],
        xpEarned: score * 100,
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">{quiz.title}</h2>
          <p className="text-gray-500 text-sm">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${timeLeft < 10 ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'}`}>
          <Timer className="w-4 h-4" />
          <span className="font-mono font-bold">{timeLeft}s</span>
        </div>
      </div>

      <div className="w-full bg-gray-900 h-2 rounded-full mb-12 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-600"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-[#0a0a0c] border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <h3 className="text-xl font-medium text-gray-100 mb-8 leading-relaxed">
            {currentQuestion.question}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.type === 'mcq' && currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestionIndex]?.answer === option;
              const isCorrect = option === currentQuestion.correctAnswer;

              let variant = "default";
              if (showExplanation) {
                if (isCorrect) variant = "correct";
                else if (isSelected) variant = "incorrect";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={showExplanation}
                  className={`p-5 rounded-2xl text-left transition-all border-2 flex items-center justify-between group ${
                    variant === 'correct' ? 'bg-green-500/10 border-green-500 text-green-400' :
                    variant === 'incorrect' ? 'bg-red-500/10 border-red-500 text-red-400' :
                    'bg-white/5 border-white/5 hover:border-cyan-500/50 text-gray-300'
                  }`}
                >
                  <span className="font-medium">{option}</span>
                  {showExplanation && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                  {showExplanation && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                </button>
              );
            })}

            {currentQuestion.type === 'boolean' && ['True', 'False'].map((option) => (
               <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={showExplanation}
                  className={`p-5 rounded-2xl text-left transition-all border-2 flex items-center justify-between ${
                    showExplanation && option === currentQuestion.correctAnswer ? 'bg-green-500/10 border-green-500 text-green-400' :
                    showExplanation && answers[currentQuestionIndex]?.answer === option && option !== currentQuestion.correctAnswer ? 'bg-red-500/10 border-red-500 text-red-400' :
                    'bg-white/5 border-white/5 hover:border-cyan-500/50 text-gray-300'
                  }`}
                >
                  <span className="font-medium">{option}</span>
                </button>
            ))}

            {currentQuestion.type === 'fill' && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Type your answer here..."
                  className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-500/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleAnswer(e.target.value.trim());
                    }
                  }}
                  disabled={showExplanation}
                />
              </div>
            )}
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-8 p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20"
              >
                <div className="flex items-center gap-2 text-cyan-400 mb-2">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Explanation</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
                <button
                  onClick={handleNextQuestion}
                  className="mt-6 w-full py-4 rounded-xl bg-cyan-500 text-black font-bold flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all"
                >
                  Next Question
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizPlayer;
