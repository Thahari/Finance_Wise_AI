# Finance Wise 🧠💰

> **PromptWars: Virtual** — Google Developer Groups (GDG) × Hack2skill

A **decision intelligence system** that helps beginners make smarter, safer financial choices in real-world situations — powered by a structured AI reasoning engine.

🌐 **Live Demo:** https://lnkd.in/g6hbPjr8
📂 **GitHub:** https://github.com/Thahari/Finance_Wise_AI

---

## 🎯 Chosen Vertical

**Financial Decision Support for Beginners**

Finance Wise targets the _Personal Finance & Financial Literacy_ vertical. Millions of first-time earners, students, and young professionals face high-stakes financial choices (pay off debt vs. invest; buy now vs. save) with no trusted, jargon-free guidance. This tool fills that gap by simulating how an experienced human financial mentor would reason through a decision — not by returning a textbook formula, but by stress-testing options against real-world survival scenarios.

---

## 💡 Approach & Logic

### The Core Problem

Traditional financial calculators return numbers. Finance Wise returns **judgment**. The system was designed around one central insight:

> *For beginners, the wrong financial decision isn't just suboptimal — it can be catastrophic. A tool that optimises for returns without accounting for liquidity risk, monthly cash flow, or income vulnerability will actively harm its users.*

### Reasoning Engine Design

The AI reasoning follows a **structured, 7-step mentor protocol** baked into the system prompt:

| Step | Purpose |
|---|---|
| **1. The Setup** | Restates both options in plain English to confirm understanding |
| **2. Understanding the Options** | Explains what each choice actually does in real life (no jargon) |
| **3. Key Insight** | Identifies the core financial trade-off (e.g. liquidity vs. growth) |
| **4. Reality Check** | Compares both options on risk, monthly cash flow impact, and capital lock-in |
| **5. Final Recommendation** | Gives a direct, confident recommendation grounded in safety |
| **6. The Exception** | Provides one realistic scenario where the non-recommended option wins |
| **7. Beginner Tip** | Ends with a single memorable, actionable financial principle |

### Core Philosophy (Safety-First)

The engine enforces **four non-negotiable priorities**:

1. **Survival First** — Emergency buffers and liquidity always override potential growth
2. **Real-World Consequences** — Options are evaluated on cash flow pressure and stress scenarios (e.g., 3-month income loss)
3. **Beginner Assumption** — The user is assumed to be optimistic about returns but inexperienced with risk
4. **Guaranteed vs. Uncertain** — Guaranteed costs (like debt interest) outweigh uncertain gains (like market returns) when cash flow is tight

---

## ⚙️ How the Solution Works

```
User enters Option A + Option B
        ↓
Input sanitized (HTML stripped, truncated to 300 chars)
        ↓
POST /api/chat → Vercel Serverless Function
        ↓
System prompt + conversation history → Groq API (Llama 3.3 70B)
        ↓
Structured 7-section response rendered as Markdown
        ↓
User can ask follow-up questions in a stateful chat thread
        ↓
Session saved to localStorage for history/resumption
```

**Architecture decisions:**
- **Serverless API proxy** (`/api/chat`) keeps the API key server-side, never exposed to the browser
- **Client-side fallback** for local development (uses user-provided key via encrypted `password` input)
- **Session history** persisted in localStorage with deduplication and storage-full error handling
- **Lazy-loaded MatrixRain** animation to avoid blocking the initial render (code splitting via `React.lazy`)
- **Memoised callbacks** (`useCallback`) and component memoisation (`React.memo`) to prevent unnecessary re-renders

---

## 🔒 Assumptions Made

1. **Single user per browser session** — History is stored in `localStorage`, not a database. Multiple users on the same device will share history.
2. **Groq free-tier rate limits** — The app handles `429` responses gracefully but is subject to Groq's rate limits. A short wait resolves this.
3. **Two-option comparison** — The tool is intentionally constrained to exactly two options. Multi-option comparison is out of scope to preserve the clarity of the AI output.
4. **English only** — The AI mentor is calibrated for English input. Non-English inputs may produce lower-quality reasoning.
5. **No financial advice disclaimer** — This tool is for educational decision support only. It does not constitute certified financial advice.
6. **Beginner audience** — All prompt tuning and tone calibration targets first-time earners with limited financial knowledge.

---

## 🚀 Run Locally

```bash
git clone https://github.com/Thahari/Finance_Wise_AI.git
cd Finance_Wise_AI
npm install
npm run dev
```

Add your Groq API key to `.env.local`:

```
VITE_GROQ_API_KEY=your_key_here
```

Run the test suite:

```bash
npm test
```

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 19 + Vite | Fast HMR, code splitting, optimised production builds |
| AI Engine | Groq (Llama 3.3 70B) | Low-latency inference at zero cost on the free tier |
| API Proxy | Vercel Serverless Functions | Keeps API key server-side; prevents key exposure |
| Prompt Design | Google AI Studio | Iterative prompt engineering with structured output |
| UI Development | Google Antigravity + TailwindCSS v4 | Glassmorphism + accessible dark mode UI |
| Testing | Vitest + React Testing Library | Fast unit + integration tests, jsdom environment |
| Deployment | Vercel | Zero-config CI/CD from GitHub |

---

## 📊 Evaluation Alignment

| Criteria | Implementation |
|---|---|
| **Code Quality** | Modular components, memoised callbacks, ESLint enforced, no magic strings |
| **Security** | Server-side API key, input sanitisation (HTML stripping), `Content-Security-Policy` header |
| **Efficiency** | Lazy loading, `React.memo`, `useCallback`, minimal re-renders, token-efficient prompt |
| **Testing** | 11 automated tests covering smoke, accessibility, history DB, API mocking, sanitisation |
| **Accessibility** | Skip link, ARIA labels, `aria-live` regions, keyboard navigation, screen reader support |

---

This project pushed me to think beyond just UI — into reasoning systems, behavioural finance, and real-world impact. The goal was never to maximise returns — it was to **improve decision clarity** for people who can't afford to make bad financial choices early in life.
