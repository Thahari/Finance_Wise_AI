import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, 
  Sparkles,
  Send,
  PiggyBank
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { systemPrompt } from './prompt';
import OpenAI from 'openai';
import MatrixRain from './MatrixRain';

function App() {
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [messages, setMessages] = useState([]);
  const [followUp, setFollowUp] = useState('');
  const [loadingText, setLoadingText] = useState("Mentor is thinking (API-Free)...");
  
  const endOfMessagesRef = useRef(null);

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq_key') || import.meta.env.VITE_GROQ_API_KEY || '');
  const [showSettings, setShowSettings] = useState(false);
  const MODEL_NAME = "llama-3.1-8b-instant"; // Groq Llama 3 8B
  const cursorRef = useRef(null);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX - 16}px, ${e.clientY - 16}px, 0)`;
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  // Scroll to bottom every time messages update or loading state changes
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('groq_key', apiKey);
    } else {
      localStorage.removeItem('groq_key');
    }
  }, [apiKey]);

  const buildApiMessages = (uiMessages) => {
    const mapped = uiMessages.slice(0, uiMessages.length - 1).filter(m => m.text).map(m => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.text
    }));
    return [{ role: 'system', content: systemPrompt }, ...mapped];
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!optionA.trim() || !optionB.trim()) return;

    setHasSearched(true);
    setLoading(true);
    setLoadingText(`Running Free Mentor...`);
    setMessages([]);
    
    try {
      const promptText = `I am trying to decide between Option A: "${optionA}" and Option B: "${optionB}". Can you compare these and guide me?`;
      
      const newUIMessages = [{ role: 'user', text: promptText }, { role: 'model', text: '' }];
      setMessages(newUIMessages);
      
      const apiMessages = buildApiMessages(newUIMessages);

      const client = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.groq.com/openai/v1",
        dangerouslyAllowBrowser: true
      });

      const response = await client.chat.completions.create({
        model: MODEL_NAME,
        messages: apiMessages,
      });

      const fullText = response.choices[0]?.message?.content || "";
      
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'model', text: fullText };
        return updated;
      });
      
    } catch (error) {
      console.error(error);
      let errorMsg = error.message;
      if (errorMsg.includes('429') || errorMsg.includes('exceeded your current quota')) {
        errorMsg = "⏳ You've briefly hit the Groq Free-Tier rate limit. Please wait a moment and try your request again!";
      }
      setMessages(prev => [...prev, {role: 'model', text: errorMsg}]);
    }
    setLoading(false);
  };

  const handleFollowUp = async (e) => {
     e.preventDefault();
     if (!followUp.trim()) return;
     
     const newMsgText = followUp;
     setFollowUp('');
     
     const updatedUIMessages = [...messages, { role: 'user', text: newMsgText }, { role: 'model', text: '' }];
     setMessages(updatedUIMessages);
     
     setLoading(true);
     setLoadingText(`Running Free Mentor...`);
     
     try {
       const apiMessages = buildApiMessages(updatedUIMessages);

       const client = new OpenAI({
         apiKey: apiKey,
         baseURL: "https://api.groq.com/openai/v1",
         dangerouslyAllowBrowser: true
       });

       const response = await client.chat.completions.create({
         model: MODEL_NAME,
         messages: apiMessages,
       });

       const fullText = response.choices[0]?.message?.content || "";

       setMessages(prev => {
         const updated = [...prev];
         updated[updated.length - 1] = { role: 'model', text: fullText };
         return updated;
       });

     } catch (err) {
       console.error(err);
       let errorMsg = err.message;
       if (errorMsg.includes('429') || errorMsg.includes('exceeded your current quota')) {
         errorMsg = "⏳ You've briefly hit the Groq Free-Tier rate limit. Please wait a moment and try your request again!";
       }
       setMessages(prev => [...prev, {role: 'model', text: errorMsg}]);
    }
     
     setLoading(false);
  };

  // Basic styling for the markdown output
  const renderMarkdown = (text) => (
    <div className="max-w-none text-gray-200">
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-2xl font-medium mb-4 text-[#ececec]" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-medium mt-6 mb-3 text-[#ececec]" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-medium mt-4 mb-2 text-[#cccccc]" {...props} />,
          p: ({node, ...props}) => <p className="leading-relaxed mb-4 text-[#ababab]" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-4 text-[#ababab] marker:text-[#555]" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-4 text-[#ababab] marker:text-[#555]" {...props} />,
          li: ({node, ...props}) => <li className="mb-1" {...props} />,
          strong: ({node, ...props}) => <strong className="font-medium text-[#ececec]" {...props} />,
          a: ({node, ...props}) => <a className="text-[#ececec] underline underline-offset-4 hover:text-white transition-colors" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-[#555] pl-4 italic py-1 my-4 text-[#888]" {...props} />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#ededed] font-sans selection:bg-[#444] selection:text-white flex flex-col items-center relative overflow-hidden cursor-default md:cursor-none">
      
      {/* Floating Piggy Cursor */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 pointer-events-none z-[100] transition-transform duration-75 ease-out hidden md:block"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <PiggyBank className="w-8 h-8 text-[#555] opacity-80" />
      </div>
      
      {/* Background Matrix Rain for Start Page */}
      {!hasSearched && <MatrixRain />}

      {/* Top Navbar */}
      <header className="w-full h-16 flex justify-between items-center px-6 bg-[#0e0e0e] sticky top-0 z-50 border-b border-[#222]">
        <div className="flex items-center gap-2 font-sans font-semibold text-xl tracking-tight text-[#ececec] cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { setMessages([]); setHasSearched(false); setOptionA(''); setOptionB(''); }}>
          <div className="w-6 h-6 bg-[#ececec] rounded flex items-center justify-center p-1">
             <PiggyBank className="w-4 h-4 text-[#0e0e0e]" />
          </div>
          <span>Finance Wise</span>
        </div>
        <div className="flex items-center gap-4">
          {showSettings ? (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
              <input 
                type="password" 
                placeholder="Groq API Key" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="perp-input rounded-md px-3 py-1.5 text-sm text-[#ececec] focus:outline-none w-48 transition-colors"
                title="Paste Groq API Key here"
              />
              <button 
                onClick={() => setShowSettings(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowSettings(true)}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              title="Add Groq API Key"
            >
              API Settings
            </button>
          )}
        </div>
      </header>

      <main className={`w-full max-w-3xl px-4 md:px-8 transition-all duration-500 ease-in-out flex flex-col ${hasSearched ? 'pt-8' : 'pt-32 md:pt-48 items-center'}`}>
        
        {!hasSearched && (
          <div className="text-center mb-10 flex flex-col items-center animate-in fade-in duration-500 w-full">
            <h1 className="text-4xl md:text-5xl font-sans font-medium tracking-tight mb-4 text-[#ececec]">
              What's your financial choice?
            </h1>
            <p className="text-[#888] text-lg max-w-lg font-light">
              Enter two genuine options and get objective financial reasoning.
            </p>
          </div>
        )}

        {/* Initial Input Form */}
        {!hasSearched && (
          <div className={`w-full transition-all duration-500 max-w-2xl z-10`}>
            <form onSubmit={handleAnalyze} className="relative group w-full">
              <div className="relative perp-input rounded-[1.5rem] p-2 flex flex-col md:flex-row items-center gap-2 w-full transition-colors">
                <div className="flex-1 w-full px-4 py-3 flex items-center gap-3 border-b md:border-b-0 md:border-r border-[#333] transition-colors rounded-t-[1rem] md:rounded-[1rem]">
                  <div className="font-semibold text-xs text-[#ececec] tracking-widest bg-[#222] border border-[#444] px-3 py-1.5 rounded shadow-sm">OPTION A</div>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Pay off $1k credit card"
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-[#ececec] placeholder-[#666]"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="flex-1 w-full px-4 py-3 flex items-center gap-3">
                  <div className="font-semibold text-xs text-[#ececec] tracking-widest bg-[#222] border border-[#444] px-3 py-1.5 rounded shadow-sm">OPTION B</div>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Invest $1k in stocks"
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-[#ececec] placeholder-[#666]"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading || !optionA.trim() || !optionB.trim()}
                  className="w-full md:w-auto px-5 py-3 md:py-2 md:px-4 m-1 rounded-xl bg-[#ececec] hover:bg-[#ffffff] text-black flex items-center justify-center transition-all cursor-pointer font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hidden md:flex"
                >
                  <ArrowRight className="w-5 h-5 text-black" />
                </button>
                <button 
                  type="submit"
                  disabled={loading || !optionA.trim() || !optionB.trim()}
                  className="w-full p-3 m-1 rounded-xl bg-[#ececec] hover:bg-[#ffffff] text-black items-center justify-center transition-all cursor-pointer font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex md:hidden"
                >
                  Compare Options
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Results / Chat Thread */}
        {hasSearched && (
          <div className="pb-32 space-y-8 animate-in fade-in duration-500 w-full flex flex-col">
            {messages.map((msg, idx) => (
              <div key={idx} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${!msg.text ? 'hidden' : 'flex'}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded shrink-0 mr-4 mt-1 flex items-center justify-center bg-[#ececec]">
                     <Sparkles className="w-5 h-5 text-black" />
                  </div>
                )}
                
                <div className={`${msg.role === 'user' ? 'bg-[#2a2a2a] text-[#ededed] px-5 py-3 rounded-2xl max-w-[80%]' : 'bg-transparent text-[#ededed] w-full text-left'}`}>
                   {msg.role === 'model' ? renderMarkdown(msg.text) : <span className="text-[15px]">{msg.text}</span>}
                </div>
              </div>
            ))}
            
            {loading && messages.length > 0 && messages[messages.length - 1].text === '' && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded shrink-0 mr-4 bg-[#ececec] flex items-center justify-center">
                   <Sparkles className="w-5 h-5 text-black animate-pulse" />
                </div>
                <div className="flex items-center text-[#888] py-2">
                  <span className="text-sm animate-pulse">{loadingText}</span>
                </div>
              </div>
            )}
            
            {/* Invis marker to scroll to bottom */}
            <div ref={endOfMessagesRef} className="h-4 w-full" />
          </div>
        )}
      </main>

      {/* Follow-up / Chat Input (Sticky at bottom) */}
      {hasSearched && (
        <div className="fixed bottom-0 left-0 w-full bg-[#0e0e0e]/90 backdrop-blur-md pt-8 pb-6 px-4 border-t border-[#222] z-40">
          <div className="max-w-3xl mx-auto w-full">
             <form onSubmit={handleFollowUp} className="relative w-full">
                <div className="relative perp-input rounded-[1.5rem] px-4 py-2 flex gap-3 items-center focus-within:border-[#555] transition-all">
                  <input
                    type="text"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    placeholder={loading ? "Waiting for response..." : "Ask a follow-up question..."}
                    disabled={loading}
                    className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-[#ececec] placeholder-[#666] px-2 text-[15px]"
                  />
                  <button 
                    type="submit" 
                    disabled={loading || !followUp.trim()} 
                    className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${!loading && followUp.trim() ? "bg-[#ececec] text-black hover:bg-white cursor-pointer" : "bg-[#252525] text-[#555] cursor-not-allowed"}`}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
