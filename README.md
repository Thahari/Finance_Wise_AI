# Finance Wise 🧠💰

> Built for **PromptWars: Virtual** — Google Developer Groups (GDG) × Hack2skill

**Finance Wise** is a decision intelligence system designed to help beginners make smarter financial choices in real-world situations. Using AI and structured reasoning, it doesn't just compare numbers — it simulates real-world consequences, evaluates behavioral risk, and gives a decisive, beginner-safe recommendation.

🌐 **Live Demo:** https://lnkd.in/g6hbPjr8  
📂 **GitHub:** https://lnkd.in/gisZ_5qk

---

## 💡 The Problem

Most beginners instinctively know what *sounds* better financially — but they can't explain *why* it's safer, and they don't know what could go wrong.

Financial content is either too academic (jargon-heavy, textbook) or too vague ("it depends"). There's nothing in between for everyday decisions like:

- *"Should I pay off my credit card or invest in stocks?"*
- *"Should I build an emergency fund or start a SIP?"*
- *"Should I buy a car or keep renting?"*

**Finance Wise fills that gap** — acting as a calm, knowledgeable mentor who stress-tests your options and gives a clear answer.

---

## 🎯 Goal

> Not to maximize returns — but to **improve decision clarity** and help people avoid costly financial mistakes early.

---

## ✅ What It Does

- 🔹 Compares two financial choices in real-world terms (no jargon)
- 🔹 Evaluates cash flow, liquidity, and financial pressure
- 🔹 Simulates stress scenarios — *"What if you lost income for 3 months?"*
- 🔹 Compares guaranteed costs vs. uncertain returns
- 🔹 Gives a **decisive, confident recommendation** — never "it depends"
- 🔹 Highlights the exception: when the losing option would actually win
- 🔹 Ends with a single, memorable financial lesson

---

## 🧠 Reasoning Engine

The app runs a structured AI reasoning pipeline (powered by Groq) with a carefully engineered system prompt:

1. **Identify** — what type of decision is this? (debt, investment, consumption)
2. **Evaluate** — liquidity differences and monthly cash flow impact
3. **Stress Test** — which option survives a sudden income loss?
4. **Compare** — guaranteed costs vs. uncertain returns
5. **Recommend** — the structurally safer option for a beginner
6. **Exception** — one real scenario where the other option wins

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| AI Engine | Groq (Llama 3.3 70B) |
| Prompt Design | Google AI Studio |
| UI Development | Google Antigravity (AI pair programmer) |
| Testing | Vitest + React Testing Library (11 tests) |
| Deployment | Vercel (serverless API proxy) |

---

## 🔐 Security

- API key stored in `.env.local` — never committed to Git
- Vercel serverless function (`/api/chat.js`) proxies all AI calls — no key exposed in browser
- Input sanitization strips HTML tags before sending to the AI model
- Content Security Policy (CSP) header restricts allowed connections

---

## ♿ Accessibility

- Skip-to-main-content link for keyboard users
- Full `aria-label` coverage on all interactive elements
- `aria-live="polite"` on AI response region for screen readers
- Keyboard-navigable history sidebar with `tabIndex` and `onKeyDown`

---

## 🧪 Tests

```bash
npm run test
```

**11 tests** across 2 suites covering: smoke test, accessibility, history DB write, mocked API response, input sanitization, settings UI toggle, system prompt structure, tone, and token safety.

---

## 🚀 Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/Thahari/Finance_Wise_AI.git
cd Finance_Wise_AI

# 2. Install dependencies
npm install

# 3. Add your Groq API key
echo "VITE_GROQ_API_KEY=your_groq_key_here" > .env.local

# 4. Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📌 Hackathon

Built for **PromptWars: Virtual** hosted by **Google Developer Groups (GDG)** × **Hack2skill**

This project pushed the boundaries of just UI — into reasoning systems, behavioral finance, and real-world impact.

---

*Built with ❤️ to make financial reasoning accessible to everyone — Finance Wise.*
