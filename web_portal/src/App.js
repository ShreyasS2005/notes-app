import React, { useState } from 'react';
import './App.css';

const BACKEND_URL = 'http://localhost:5001';

// ─── Helper ──────────────────────────────────────────────────────────────────
async function callBackend(endpoint, body) {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const data = await res.json();
  return data.result;
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
function Spinner() {
  return <div className="spinner" aria-label="loading"></div>;
}

// ─── ToolCard ─────────────────────────────────────────────────────────────────
function ToolCard({ id, icon, title, color, children }) {
  return (
    <section className="tool-card" id={id} style={{ '--accent': color }}>
      <div className="tool-header">
        <span className="tool-icon" style={{ color }}>{icon}</span>
        <h2 className="tool-title">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ─── Summarizer ───────────────────────────────────────────────────────────────
function Summarizer() {
  const [content, setContent] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!content.trim()) return;
    setLoading(true); setError(''); setResult('');
    try {
      const res = await callBackend('/summarize', { content });
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <ToolCard id="summarizer-section" icon="🧠" title="AI Summarizer" color="var(--accent-blue)">
      <textarea
        id="summarizer-input"
        className="tool-textarea"
        placeholder="Paste your study notes here to get an AI-powered summary..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
      />
      <button
        id="summarize-btn"
        className="tool-btn"
        onClick={handleSummarize}
        disabled={loading || !content.trim()}
      >
        {loading ? <Spinner /> : '✨ Summarize Notes'}
      </button>
      {error && <p id="summarizer-error" className="tool-error">{error}</p>}
      {result && (
        <div id="summarizer-result" className="tool-result">
          <h3>📋 Summary</h3>
          <pre>{result}</pre>
        </div>
      )}
    </ToolCard>
  );
}

// ─── Quiz Generator ───────────────────────────────────────────────────────────
function QuizGenerator() {
  const [content, setContent] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleGenerate = async () => {
    if (!content.trim()) return;
    setLoading(true); setError(''); setQuizzes([]); setAnswers({}); setSubmitted(false);
    try {
      const raw = await callBackend('/generate-quiz', { content });
      const parsed = JSON.parse(raw);
      setQuizzes(parsed.quizzes || []);
    } catch (e) { setError('Failed to generate quiz. Try again.'); }
    finally { setLoading(false); }
  };

  const score = submitted
    ? quizzes.filter((q, i) => answers[i] === q.correctAnswer).length
    : 0;

  return (
    <ToolCard id="quiz-section" icon="❓" title="Quiz Generator" color="var(--accent-purple)">
      <textarea
        id="quiz-input"
        className="tool-textarea"
        placeholder="Paste study content to auto-generate a 5-question quiz..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />
      <button
        id="generate-quiz-btn"
        className="tool-btn purple"
        onClick={handleGenerate}
        disabled={loading || !content.trim()}
      >
        {loading ? <Spinner /> : '⚡ Generate Quiz'}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {quizzes.length > 0 && (
        <div id="quiz-results" className="quiz-container">
          {quizzes.map((q, i) => (
            <div key={i} className="quiz-question">
              <p className="question-text"><strong>Q{i + 1}.</strong> {q.question}</p>
              <div className="options-grid">
                {q.options.map((opt, j) => {
                  const isSelected = answers[i] === opt;
                  const isCorrect = submitted && opt === q.correctAnswer;
                  const isWrong = submitted && isSelected && opt !== q.correctAnswer;
                  return (
                    <label
                      key={j}
                      className={`option-label ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`q-${i}`}
                        value={opt}
                        onChange={() => !submitted && setAnswers({ ...answers, [i]: opt })}
                        checked={isSelected}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          {!submitted ? (
            <button
              id="submit-quiz-btn"
              className="tool-btn purple"
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(answers).length < quizzes.length}
            >
              Submit Answers
            </button>
          ) : (
            <div id="quiz-score" className="quiz-score">
              🎯 Score: {score} / {quizzes.length}
            </div>
          )}
        </div>
      )}
    </ToolCard>
  );
}

// ─── Flashcards ───────────────────────────────────────────────────────────────
function Flashcards() {
  const [content, setContent] = useState('');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState({});
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!content.trim()) return;
    setLoading(true); setError(''); setCards([]); setFlipped({});
    try {
      const raw = await callBackend('/generate-flashcards', { content });
      setCards(JSON.parse(raw));
    } catch (e) { setError('Failed to generate flashcards.'); }
    finally { setLoading(false); }
  };

  return (
    <ToolCard id="flashcard-section" icon="🃏" title="AI Flashcards" color="var(--accent-orange)">
      <textarea
        id="flashcard-input"
        className="tool-textarea"
        placeholder="Paste content to create interactive flashcards..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />
      <button
        id="generate-flashcard-btn"
        className="tool-btn orange"
        onClick={handleGenerate}
        disabled={loading || !content.trim()}
      >
        {loading ? <Spinner /> : '🃏 Create Flashcards'}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {cards.length > 0 && (
        <div id="flashcard-results" className="flashcard-grid">
          {cards.map((card, i) => (
            <div
              key={i}
              id={`flashcard-${i}`}
              className={`flashcard ${flipped[i] ? 'flipped' : ''}`}
              onClick={() => setFlipped({ ...flipped, [i]: !flipped[i] })}
            >
              <div className="flashcard-inner">
                <div className="flashcard-front">{card.front}</div>
                <div className="flashcard-back">{card.back}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToolCard>
  );
}

// ─── Chat Bot ─────────────────────────────────────────────────────────────────
function ChatBot() {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || loading) return;
    const userMsg = { role: 'user', text: message };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setMessage('');
    setLoading(true);
    try {
      const apiHistory = newHistory.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      const res = await callBackend('/chat', { message: userMsg.text, history: apiHistory.slice(0, -1) });
      setHistory([...newHistory, { role: 'model', text: res }]);
    } catch (e) {
      setHistory([...newHistory, { role: 'model', text: '⚠️ Neural link error. Please retry.' }]);
    }
    finally { setLoading(false); }
  };

  return (
    <ToolCard id="chatbot-section" icon="💬" title="Neural AI Chat" color="var(--accent-pink)">
      <div id="chat-messages" className="chat-messages">
        {history.length === 0 && (
          <p className="chat-placeholder">Ask anything about your study topics...</p>
        )}
        {history.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
            <span className="bubble-label">{msg.role === 'user' ? '👤 You' : '🤖 Neural AI'}</span>
            <p>{msg.text}</p>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble ai">
            <Spinner />
          </div>
        )}
      </div>
      <div className="chat-input-row">
        <input
          id="chat-input"
          className="chat-input"
          type="text"
          placeholder="Type your study question..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          id="send-chat-btn"
          className="tool-btn pink"
          onClick={handleSend}
          disabled={loading || !message.trim()}
        >
          Send
        </button>
      </div>
    </ToolCard>
  );
}

// ─── Study Timer ──────────────────────────────────────────────────────────────
function StudyTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = React.useRef(null);

  const start = () => {
    if (running) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s > 0) return s - 1;
        setMinutes(m => {
          if (m > 0) { return m - 1; }
          clearInterval(intervalRef.current);
          setRunning(false);
          return 0;
        });
        return s > 0 ? s - 1 : 59;
      });
    }, 1000);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setMinutes(25);
    setSeconds(0);
  };

  return (
    <ToolCard id="timer-section" icon="⏱" title="Focus Timer" color="var(--accent-pink)">
      <div className="timer-display" id="timer-display">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="timer-controls">
        <button id="start-timer-btn" className="tool-btn pink" onClick={start} disabled={running}>▶ Start</button>
        <button id="reset-timer-btn" className="tool-btn" onClick={reset}>↺ Reset</button>
      </div>
    </ToolCard>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <div className="app">
      {/* Header */}
      <header className="app-header" id="app-header">
        <div className="header-inner">
          <div className="logo-row">
            <span className="logo-icon">⚡</span>
            <div>
              <h1 id="app-title" className="app-title">SmartNotes AI</h1>
              <p className="app-subtitle">Neural Study Companion</p>
            </div>
          </div>
          <nav className="header-nav">
            <a href="#summarizer-section">Summarize</a>
            <a href="#quiz-section">Quiz</a>
            <a href="#flashcard-section">Flashcards</a>
            <a href="#chatbot-section">Chat</a>
            <a href="#timer-section">Timer</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero" id="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Supercharge Your Study Sessions</h2>
          <p className="hero-subtitle">
            AI-powered summarization, quiz generation, flashcards, and chat — all in one neural hub.
          </p>
        </div>
      </section>

      {/* Main Tools */}
      <main className="tools-grid" id="tools-grid">
        <Summarizer />
        <QuizGenerator />
        <Flashcards />
        <ChatBot />
        <StudyTimer />
      </main>

      {/* Footer */}
      <footer className="app-footer" id="app-footer">
        <p>SmartNotes AI &copy; 2024 — Neural Study Companion</p>
      </footer>
    </div>
  );
}

export default App;
