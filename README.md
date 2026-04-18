# Finance Wise 🧠💰

> **The problem:** Most people instinctively know what *sounds* better financially — but they can't explain *why* it's safer, and they don't know what could go wrong.

Finance Wise is a beginner-safe financial decision tool that compares two real options using structured AI reasoning — not generic advice, not "it depends." You get a clear, stress-tested recommendation in plain English.

---

## 🎯 Problem Statement

Beginners face a critical gap: financial literacy content is either too academic (jargon-heavy, textbook) or too vague ("consult a financial advisor"). There's nothing in between that gives real, grounded reasoning for everyday decisions like:

- *"Should I pay off my credit card or invest in stocks?"*
- *"Should I buy a car or keep renting?"*
- *"Should I build an emergency fund or start a SIP?"*

**Finance Wise fills that gap** — it acts as a calm, knowledgeable mentor who explains both options in plain English, stress-tests them for real-world risk, and gives a decisive recommendation.

---

## ✅ What It Does

- Accepts any two financial options (Option A vs Option B)
- Explains what each option *actually does* in real life (no jargon)
- Evaluates cash flow pressure, liquidity, and risk
- Simulates a stress scenario — *"What if you lost income for 3 months?"*
- Gives a **decisive, confident recommendation** — not "it depends"
- Highlights the exception: when the losing option would actually win
- Ends with a single, memorable financial lesson

---

## 🧠 How It Works

The app runs a structured AI reasoning engine (powered by Grok) with a carefully engineered system prompt:

1. **Identify** the decision type (debt, investment, consumption)
2. **Evaluate** liquidity and monthly cash flow differences
3. **Stress test** — which option survives a sudden income loss?
4. **Compare** guaranteed costs vs uncertain returns
5. **Recommend** the structurally safer option for a beginner

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| AI Engine | Grok (xAI) via OpenAI-compatible API |
| Prompt Design | Google AI Studio |
| UI Vibe Coding | Google Antigravity (AI pair programmer) |
| Testing | Vitest + React Testing Library |
| Deployment | Vercel (serverless API proxy for key security) |

---

## 🔐 Security

- API key stored in `.env.local` — never committed to Git
- `.env.local` excluded via `.gitignore`
- Backend serverless function (`/api/chat.js`) proxies API calls on Vercel — no key exposed in browser
- Input sanitization: strips HTML tags before sending to the AI model
- Content Security Policy (CSP) header in `index.html`

---

## ♿ Accessibility

- Skip-to-main-content link for keyboard users
- Full `aria-label` coverage on all interactive elements
- `aria-live="polite"` on AI response region — screen reader friendly
- Keyboard navigable history sidebar (`tabIndex`, `onKeyDown`)

---

## 🚀 Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/Thahari/Finance_Wise_AI.git
cd Finance_Wise_AI

# 2. Install dependencies
npm install

# 3. Add your API key
echo "VITE_XAI_API_KEY=your_key_here" > .env.local

# 4. Start dev server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

---

## 🧪 Tests

```bash
npm run test
```

**11 tests** across 2 test suites:
- App smoke test, accessibility, history DB write, mocked API response, input sanitization, settings UI toggle
- System prompt: definition, philosophy, output structure, tone, token size

---

## 📌 Live Demo

> Try it: [your-vercel-deployment-url.vercel.app](#)

---

*Built with ❤️ to make financial reasoning accessible to everyone — Finance Wise.*
