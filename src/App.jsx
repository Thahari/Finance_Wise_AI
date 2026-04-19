import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { 
  ArrowRight, 
  Sparkles,
  Send,
  PiggyBank,
  History,
} from 'lucide-react';
import MarkdownOutput from './components/MarkdownOutput';
import HistorySidebar from './components/HistorySidebar';
import { systemPrompt } from './prompt';

// ─── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'finance_wise_history';
const GROQ_KEY_STORAGE = 'groq_key';
const MODEL_NAME = 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MAX_INPUT_LENGTH = 300;
const RATE_LIMIT_MSG = "⏳ You've briefly hit the Groq free-tier rate limit. Please wait a moment and try again!";

const MatrixRain = React.lazy(() => import('./MatrixRain'));

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Strips HTML tags from user input and trims to max length */
const sanitize = (str) => str.replace(/<[^>]*>/g, '').trim().substring(0, MAX_INPUT_LENGTH);

/** Maps UI messages to the OpenAI-compatible API format */
const toApiMessages = (uiMessages) =>
  uiMessages
    .filter((m) => m.text)
    .map((m) => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.text,
    }));

/** Reads session history from localStorage safely */
const loadStoredSessions = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && typeof saved === 'string') {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.warn('Storage warning: History reset.', e);
  }
  return [];
};

/** Persists sessions to localStorage, silently ignoring quota errors */
const persistSessions = (sessions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.warn('Storage full — history not saved.', e);
  }
};

/**
 * Calls the Groq API directly from the client (dev-mode fallback).
 * The server-side proxy (/api/chat) is preferred in production.
 */
const callGroqDirectly = async (uiMessages, apiKey) => {
  const apiMessages = [{ role: 'system', content: systemPrompt }, ...toApiMessages(uiMessages)];
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: MODEL_NAME, messages: apiMessages }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || `API Error ${res.status}: Please check your Groq API key.`);
  }
  const data = await res.json();
  return data.choices[0]?.message?.content || '';
};

/**
 * Central fetch function: tries the server proxy first, falls back to direct.
 * Returns the AI reply string.
 */
const fetchAIReply = async (uiMessages, apiKey) => {
  const proxyRes = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: uiMessages }),
  }).catch(() => null);

  if (proxyRes?.ok) {
    const data = await proxyRes.json();
    return data.reply;
  }

  // Fallback: call Groq directly (dev environment only)
  return callGroqDirectly(uiMessages, apiKey);
};

/** Normalises a raw error into a user-friendly string */
const friendlyError = (err) => {
  const msg = err?.message || String(err);
  if (msg.includes('429') || /quota|rate/i.test(msg)) return RATE_LIMIT_MSG;
  return msg;
};

// ─── App Component ────────────────────────────────────────────────────────────

function App() {
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [messages, setMessages] = useState([]);
  const [followUp, setFollowUp] = useState('');
  const [loadingText, setLoadingText] = useState('Finance Wise is thinking...');

  const [sessions, setSessions] = useState(loadStoredSessions);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const endOfMessagesRef = useRef(null);

  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem(GROQ_KEY_STORAGE) || import.meta.env.VITE_GROQ_API_KEY || ''
  );
  const [showSettings, setShowSettings] = useState(false);
  const cursorRef = useRef(null);

  // ── Side effects ─────────────────────────────────────────────────────────

  useEffect(() => {
    const onMouseMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX - 16}px, ${e.clientY - 16}px, 0)`;
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(GROQ_KEY_STORAGE, apiKey);
    } else {
      localStorage.removeItem(GROQ_KEY_STORAGE);
    }
  }, [apiKey]);

  // ── Session management ───────────────────────────────────────────────────

  const saveSession = useCallback((id, newMessages, optA, optB) => {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      const title = `${optA} vs ${optB}`.substring(0, 60);
      const sessionData = { id, title, optionA: optA, optionB: optB, messages: newMessages, timestamp: id };
      const nextSessions = idx >= 0
        ? prev.map((s, i) => (i === idx ? sessionData : s))
        : [sessionData, ...prev];
      persistSessions(nextSessions);
      return nextSessions;
    });
  }, []);

  const loadSession = useCallback((session) => {
    setCurrentSessionId(session.id);
    setOptionA(session.optionA);
    setOptionB(session.optionB);
    setMessages(session.messages);
    setHasSearched(true);
    setShowHistory(false);
  }, []);

  const startNew = useCallback(() => {
    setMessages([]);
    setHasSearched(false);
    setOptionA('');
    setOptionB('');
    setCurrentSessionId(null);
  }, []);

  const deleteSession = useCallback((e, id) => {
    e.stopPropagation();
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      persistSessions(next);
      return next;
    });
    // If the deleted session was active, reset to a new session
    setCurrentSessionId((prev) => {
      if (prev === id) startNew();
      return prev === id ? null : prev;
    });
  }, [startNew]);

  // ── AI interaction ───────────────────────────────────────────────────────

  const handleAnalyze = async (e) => {
    e.preventDefault();
    const cleanA = sanitize(optionA);
    const cleanB = sanitize(optionB);
    if (!cleanA || !cleanB) return;

    setHasSearched(true);
    setLoading(true);
    setLoadingText('Finance Wise is thinking...');
    setMessages([]);

    const sessionId = Date.now().toString();
    setCurrentSessionId(sessionId);

    const promptText = `I am trying to decide between Option A: "${cleanA}" and Option B: "${cleanB}". Can you compare these and guide me?`;
    const newUIMessages = [
      { role: 'user', text: promptText },
      { role: 'model', text: '' },
    ];
    setMessages(newUIMessages);
    saveSession(sessionId, newUIMessages, cleanA, cleanB);

    try {
      const fullText = await fetchAIReply(newUIMessages, apiKey);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'model', text: fullText };
        saveSession(sessionId, updated, cleanA, cleanB);
        return updated;
      });
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'model', text: friendlyError(error) }]);
    }

    setLoading(false);
  };

  const handleFollowUp = async (e) => {
    e.preventDefault();
    if (!followUp.trim()) return;

    const newMsgText = followUp;
    setFollowUp('');

    const updatedUIMessages = [
      ...messages,
      { role: 'user', text: newMsgText },
      { role: 'model', text: '' },
    ];
    setMessages(updatedUIMessages);
    if (currentSessionId) saveSession(currentSessionId, updatedUIMessages, optionA, optionB);

    setLoading(true);
    setLoadingText('Finance Wise is thinking...');

    try {
      const fullText = await fetchAIReply(updatedUIMessages, apiKey);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'model', text: fullText };
        if (currentSessionId) saveSession(currentSessionId, updated, optionA, optionB);
        return updated;
      });
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'model', text: friendlyError(err) }]);
    }

    setLoading(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#ededed] font-sans selection:bg-[#444] selection:text-white flex flex-col items-center relative overflow-hidden cursor-default md:cursor-none">
      {/* Skip to main content — Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[999] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Custom piggy-bank cursor (desktop only) */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[100] transition-transform duration-75 ease-out hidden md:block"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
        aria-hidden="true"
      >
        <PiggyBank className="w-8 h-8 text-[#555] opacity-80" />
      </div>

      {/* Matrix Rain background (landing only) */}
      {!hasSearched && (
        <Suspense fallback={null}>
          <MatrixRain />
        </Suspense>
      )}

      {/* ── Top Navbar ─────────────────────────────────────────────────────── */}
      <header className="w-full h-16 flex justify-between items-center px-6 bg-[#0e0e0e] sticky top-0 z-50 border-b border-[#222]">
        <div
          className="flex items-center gap-2 font-sans font-semibold text-xl tracking-tight text-[#ececec] cursor-pointer hover:opacity-80 transition-opacity"
          onClick={startNew}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && startNew()}
          aria-label="Finance Wise Home"
        >
          <div
            className="w-6 h-6 bg-[#ececec] rounded flex items-center justify-center p-1"
            role="img"
            aria-label="Piggy Bank Logo"
          >
            <PiggyBank className="w-4 h-4 text-[#0e0e0e]" aria-hidden="true" />
          </div>
          <span>Finance Wise</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHistory(true)}
            className="text-sm p-2 text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            aria-label="Open comparison history"
            title="History"
          >
            <History className="w-4 h-4" aria-hidden="true" />
            <span className="hidden md:inline">History</span>
          </button>

          {showSettings ? (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
              <label htmlFor="apiKeyInput" className="sr-only">Groq API Key</label>
              <input
                type="password"
                id="apiKeyInput"
                placeholder="Groq API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="perp-input rounded-md px-3 py-1.5 text-sm text-[#ececec] focus:outline-none w-48 transition-colors"
                title="Paste Groq API Key here"
                aria-label="Enter your Groq API key"
              />
              <button
                onClick={() => setShowSettings(false)}
                className="text-xs text-gray-400 hover:text-white"
                aria-label="Close API key settings"
              >
                Close
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSettings(true)}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              title="Add Groq API Key"
              aria-label="Open API key settings"
            >
              API Settings
            </button>
          )}
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main
        id="main-content"
        className={`w-full max-w-3xl px-4 md:px-8 transition-all duration-500 ease-in-out flex flex-col ${
          hasSearched ? 'pt-8' : 'pt-32 md:pt-48 items-center'
        }`}
      >
        {/* Landing hero text */}
        {!hasSearched && (
          <div className="text-center mb-10 flex flex-col items-center animate-in fade-in duration-500 w-full">
            <h1 className="text-4xl md:text-5xl font-sans font-medium tracking-tight mb-4 text-white">
              What's your financial choice?
            </h1>
            <p className="text-[#888] text-lg max-w-lg font-light">
              Enter two genuine options and get objective financial reasoning.
            </p>
          </div>
        )}

        {/* ── Input form (landing) ──────────────────────────────────────── */}
        {!hasSearched && (
          <>
            <div className="w-full transition-all duration-500 max-w-2xl z-10 bg-[#000000]/40 backdrop-blur-md p-3 md:p-4 rounded-[2rem] border border-[#222] shadow-2xl">
              <form onSubmit={handleAnalyze} className="relative group w-full">
                <div className="relative perp-input rounded-[1.5rem] p-2 flex flex-col md:flex-row items-center gap-2 w-full transition-colors">
                  {/* Option A */}
                  <div className="flex-1 w-full px-4 py-3 flex items-center gap-3 border-b md:border-b-0 md:border-r border-[#333] transition-colors rounded-t-[1rem] md:rounded-[1rem]">
                    <div className="font-semibold text-xs text-[#ececec] tracking-widest bg-[#222] border border-[#444] px-3 py-1.5 rounded shadow-sm">
                      OPTION A
                    </div>
                    <label htmlFor="optionA" className="sr-only">Financial Option A</label>
                    <input
                      id="optionA"
                      type="text"
                      required
                      placeholder="e.g. Pay off $1k credit card"
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-[#ececec] placeholder-[#666]"
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      disabled={loading}
                      aria-label="Enter your first financial option"
                    />
                  </div>
                  {/* Option B */}
                  <div className="flex-1 w-full px-4 py-3 flex items-center gap-3">
                    <div className="font-semibold text-xs text-[#ececec] tracking-widest bg-[#222] border border-[#444] px-3 py-1.5 rounded shadow-sm">
                      OPTION B
                    </div>
                    <label htmlFor="optionB" className="sr-only">Financial Option B</label>
                    <input
                      id="optionB"
                      type="text"
                      required
                      placeholder="e.g. Invest $1k in stocks"
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-[#ececec] placeholder-[#666]"
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      disabled={loading}
                      aria-label="Enter your second financial option"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !optionA.trim() || !optionB.trim()}
                    className="w-full md:w-auto px-6 py-3 md:py-2 md:px-6 m-1 rounded-xl bg-[#ececec] hover:bg-[#ffffff] text-black flex items-center justify-center transition-all cursor-pointer font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Compare financial options"
                  >
                    Compare <ArrowRight className="w-4 h-4 ml-2 text-black" aria-hidden="true" />
                  </button>
                </div>
              </form>
            </div>

            {/* Recent comparisons / empty state */}
            <div className="w-full max-w-2xl mt-12 animate-in fade-in duration-700 delay-300 fill-mode-both z-10">
              {sessions.length > 0 ? (
                <>
                  <h2 className="text-[#888] text-sm font-medium uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                    <History className="w-4 h-4" aria-hidden="true" /> Recent Comparisons
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Recent comparisons">
                    {sessions.slice(0, 4).map((s) => (
                      <div
                        key={s.id}
                        role="listitem"
                        tabIndex={0}
                        onClick={() => loadSession(s)}
                        onKeyDown={(e) => e.key === 'Enter' && loadSession(s)}
                        aria-label={`Resume comparison: ${s.title}`}
                        className="bg-[#111]/60 backdrop-blur-sm border border-[#222] hover:border-[#444] rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-1 group"
                      >
                        <h3 className="text-[#ececec] font-medium text-sm mb-2 line-clamp-1">{s.title}</h3>
                        <p className="text-[#666] text-xs line-clamp-2">
                          {s.messages[s.messages.length - 1]?.text?.replace(/<[^>]*>?/gm, '').substring(0, 80) ||
                            'View analysis details...'}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-[#111]/40 backdrop-blur-sm border border-[#222] border-dashed rounded-2xl p-8 text-center flex flex-col items-center">
                  <Sparkles className="w-6 h-6 text-[#444] mb-3" aria-hidden="true" />
                  <h2 className="text-[#ececec] text-sm font-medium mb-1">AI analysis appears here</h2>
                  <p className="text-[#555] text-xs">Enter your options above to start your first financial comparison.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Chat thread ───────────────────────────────────────────────── */}
        {hasSearched && (
          <div
            className="pb-32 space-y-8 animate-in fade-in duration-500 w-full flex flex-col"
            aria-live="polite"
            aria-atomic="false"
            aria-label="AI Mentor responses"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${
                  !msg.text ? 'hidden' : 'flex'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded shrink-0 mr-4 mt-1 flex items-center justify-center bg-[#ececec]" aria-hidden="true">
                    <Sparkles className="w-5 h-5 text-black" />
                  </div>
                )}
                <div
                  className={
                    msg.role === 'user'
                      ? 'bg-[#2a2a2a] text-[#ededed] px-5 py-3 rounded-2xl max-w-[80%]'
                      : 'bg-transparent text-[#ededed] w-full text-left'
                  }
                >
                  {msg.role === 'model' ? (
                    <MarkdownOutput text={msg.text} />
                  ) : (
                    <span className="text-[15px]">{msg.text}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {loading && messages.length > 0 && messages[messages.length - 1].text === '' && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded shrink-0 mr-4 bg-[#ececec] flex items-center justify-center" aria-hidden="true">
                  <Sparkles className="w-5 h-5 text-black animate-pulse" />
                </div>
                <div className="flex items-center text-[#888] py-2">
                  <span className="text-sm animate-pulse" role="status" aria-live="polite">{loadingText}</span>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={endOfMessagesRef} className="h-4 w-full" aria-hidden="true" />
          </div>
        )}
      </main>

      {/* ── Sticky follow-up input ─────────────────────────────────────────── */}
      {hasSearched && (
        <div className="fixed bottom-0 left-0 w-full bg-[#0e0e0e]/90 backdrop-blur-md pt-8 pb-6 px-4 border-t border-[#222] z-40">
          <div className="max-w-3xl mx-auto w-full">
            <form onSubmit={handleFollowUp} className="relative w-full">
              <div className="relative perp-input rounded-[1.5rem] px-4 py-2 flex gap-3 items-center focus-within:border-[#555] transition-all">
                <label htmlFor="followUpInput" className="sr-only">Ask a follow-up question</label>
                <input
                  id="followUpInput"
                  type="text"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder={loading ? 'Waiting for response...' : 'Ask a follow-up question...'}
                  disabled={loading}
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-[#ececec] placeholder-[#666] px-2 text-[15px]"
                  aria-label="Ask a follow up question"
                />
                <button
                  type="submit"
                  disabled={loading || !followUp.trim()}
                  className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                    !loading && followUp.trim()
                      ? 'bg-[#ececec] text-black hover:bg-white cursor-pointer'
                      : 'bg-[#252525] text-[#555] cursor-not-allowed'
                  }`}
                  aria-label="Send follow up question"
                >
                  <Send className="w-4 h-4 ml-0.5" aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── History sidebar ───────────────────────────────────────────────── */}
      <HistorySidebar
        show={showHistory}
        onClose={() => setShowHistory(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onLoadSession={loadSession}
        onDeleteSession={deleteSession}
        onStartNew={startNew}
      />
    </div>
  );
}

export default App;
