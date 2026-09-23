import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft, BookOpen, Check, X, Coins, Trophy, Sparkles, Clock,
  ChevronRight, Lightbulb, Play, GraduationCap, TrendingUp, Calculator,
  DollarSign, Globe, ShieldCheck, Layers, Search, Target, Brain,
  PieChart, Compass, Star, Send, Wallet, Bitcoin, ArrowRightLeft,
} from "lucide-react";
import "../Styles/semana1.css"; // botones, quiz, reward, monedas, radar…
import "../Styles/semana2.css"; // word-count, sim…
import "../Styles/semana3.css"; // teach, formula, step-solver…
import "../Styles/semana6.css"; // estilos propios de la semana 6
import useGlobalReducer from "../hooks/useGlobalReducer"; // ajusta la ruta si tu hook está en otro lado

/* =====================================================================
   SEMANA 6 · ONLINE INVESTMENTS & YOUR PERSONAL PORTFOLIO
   The finale: digital dollars (stablecoins), buying them online, crypto
   basics, risk & diversification. Then the capstone — your own portfolio,
   a re-run of the Week 1 self-check to see how far you've come, and your
   feedback on the course. Saves to Progreso_Semanas (Semana: 6).
   ===================================================================== */

const SECTION_KEYS = ["reading", "check", "stablecoin", "match", "portfolio", "growth", "feedback"];
const TOTAL_SECTIONS = SECTION_KEYS.length;

/* ---- Coins per activity ---- */
const XP = {
  reading: 20,
  checkCorrect: 4,       // ~10 questions
  stablecoin: 35,        // conversion exercise
  matchCorrect: 5,       // asset match
  portfolio: 40,         // capstone portfolio
  growth: 25,            // re-run the Week 1 self-check
  feedback: 20,          // course feedback
};

/* =====================================================================
   CONTENT
   ===================================================================== */
const OBJECTIVES = [
  "Explain what stablecoins (USDT/USDC) are and how they hold a 1:1 dollar peg.",
  "Describe how people in Colombia buy digital dollars online, and the risks.",
  "Apply diversification: balance safe assets with controlled digital exposure.",
  "Build your own personal investment portfolio that adds up to 100%.",
  "See how far your financial profile has grown since Week 1.",
];
const DELIVERABLES = [
  "Read the finale article and pass a comprehension check.",
  "Convert pesos to USDC and analyze a currency move.",
  "Match each asset to its role in a portfolio.",
  "Build and justify your personal portfolio (your capstone deliverable).",
  "Re-take the Week 1 self-check and give feedback on the whole course.",
];

/* ---- Reading ---- */
const READING = [
  { h: "1. Dollars from your smartphone" },
  { p: "Not long ago, a Colombian who wanted to protect savings by holding US dollars had two awkward options: walk into a casa de cambio to buy paper bills, or open an offshore US bank account that demanded large sums and heavy paperwork. Today, financial technology has changed the game — from your phone in Bogotá, Medellín or Cali you can reach digital dollars, global platforms and fractional assets in a few taps." },
  { h: "2. What are digital dollars (stablecoins)?" },
  { p: "Crypto prices can be wild — Bitcoin or Ethereum can move 10% in a single day. To fix that, developers created stablecoins: digital assets designed to hold a stable value pegged 1:1 to a traditional currency, usually the US dollar. The two most used dollar stablecoins are USDT (Tether), the largest by volume, and USDC (USD Coin), a highly regulated one from Circle, backed 1:1 by cash and short-term US Treasury bonds in audited institutions." },
  { p: "Holding a stablecoin like USDC is functionally like holding a digital US dollar. It lets you protect your buying power against local currency devaluation without needing a physical US bank account." },
  { h: "3. How people in Colombia buy digital dollars online" },
  { p: "Apps built for Latin America make it straightforward. P2P or broker apps (like Ark) let you exchange Colombian pesos directly through local rails — PSE, Nequi, Daviplata — into digital dollars. Global exchanges convert fiat into stablecoins held in a secure digital wallet. And some platforms offer digital-dollar yield accounts, letting you earn interest on your stablecoin balance — currency protection plus passive income." },
  { h: "4. The reality check: risk and diversification" },
  { p: "Digital assets bring speed and global access, but also unique risks. Platform risk: an unregulated app that fails or gets hacked could lose your funds — use reputable, audited platforms. Regulatory risk: governments keep updating the rules on digital assets. Depeg risk: in rare conditions a stablecoin can briefly lose its 1:1 parity with the dollar." },
  { p: "The golden rule is diversification: never put all your eggs in one basket. A well-built portfolio balances low-risk traditional assets with controlled exposure to modern ones. A common balanced example: about 60% fixed income (CDTs/FICs) for safety, 30% foreign currency (USDC/USD) as a hedge, and 10% growth assets or crypto for upside." },
  { h: "5. This is where it all comes together" },
  { p: "Over six weeks you learned how much you can save (Week 1), where to keep it (Week 2), the math that grows it (Week 3), how debt works against you (Week 4), and how to judge an investment (Week 5). Now you'll design your own portfolio — what you hold, your goal, and how it's split — using everything you know. This is your capstone." },
];

/* term → meaning in Spanish (only Spanish in the module) */
const GLOSSARY = {
  "stablecoins": "Monedas estables — activos digitales atados 1:1 a una moneda real (casi siempre el dólar).",
  "USDT": "Tether — la stablecoin más grande por volumen, atada al dólar.",
  "USDC": "USD Coin — stablecoin regulada de Circle, respaldada 1:1 por efectivo y bonos del Tesoro.",
  "digital dollars": "Dólares digitales — tener stablecoins es como tener dólares en el teléfono.",
  "diversification": "Diversificación — repartir tu dinero en varios activos para no arriesgarlo todo junto.",
  "depeg risk": "Riesgo de despegue — que una stablecoin pierda temporalmente su paridad 1:1 con el dólar.",
  "fixed income": "Renta fija — prestas tu dinero por intereses fijos (CDT, bonos).",
};
const KEY_TERMS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);

/* ---- Comprehension (12 questions, IELTS style) ---- */
const CHECK = [
  { q: "Before FinTech, how did Colombians usually hold US dollars?", correct: 0, feedback: "A casa de cambio for bills, or a hard-to-open offshore account.", options: ["A casa de cambio or an offshore US account.", "Only through their local savings account.", "By using a credit card abroad.", "It was completely impossible before."] },
  { q: "What is a stablecoin designed to do?", correct: 2, feedback: "Hold a stable value pegged 1:1 to a currency.", options: ["Double in price every year.", "Replace all physical cash by law.", "Hold a value pegged 1:1 to a currency.", "Pay a guaranteed 10% return."] },
  { q: "Which stablecoin is the largest by market volume?", correct: 1, feedback: "USDT (Tether) is the largest.", options: ["USDC.", "USDT.", "Bitcoin.", "Ethereum."] },
  { q: "What backs USDC, according to the text?", correct: 3, feedback: "Cash and short-term US Treasury bonds, audited.", options: ["Gold bars in a vault.", "Nothing at all.", "The Colombian peso.", "Cash and short-term US Treasuries."] },
  { q: "Holding USDC is functionally like…", correct: 0, feedback: "Holding a digital US dollar.", options: ["holding a digital US dollar.", "owning a share of Bitcoin.", "having a Colombian CDT.", "buying a lottery ticket."] },
  { q: "How can Colombians turn pesos into digital dollars via P2P apps?", correct: 1, feedback: "Through local rails like PSE, Nequi or Daviplata.", options: ["Only with a US bank wire.", "Through PSE, Nequi or Daviplata.", "By visiting a bank branch abroad.", "It cannot be done online."] },
  { q: "What is 'platform risk'?", correct: 2, feedback: "An unregulated app failing or being hacked.", options: ["The dollar losing all its value.", "A tax on digital assets.", "An unregulated platform failing or being hacked.", "Prices staying frozen forever."] },
  { q: "What is 'depeg risk'?", correct: 0, feedback: "A stablecoin briefly losing its 1:1 parity.", options: ["A stablecoin losing its 1:1 parity.", "A bank raising its fees.", "Losing your phone password.", "Inflation in Colombia rising."] },
  { q: "What is the 'golden rule' of investing here?", correct: 3, feedback: "Diversification — don't put all eggs in one basket.", options: ["Buy only Bitcoin.", "Keep everything in cash.", "Invest all in one CDT.", "Diversify across assets."] },
  { q: "In the balanced example, what gets the LARGEST share?", correct: 1, feedback: "Fixed income (CDTs/FICs) at ~60% for safety.", options: ["Crypto, for growth.", "Fixed income, for safety.", "Foreign currency, as a hedge.", "Everything is equal."] },
  { q: "What role do digital dollars play in that example portfolio?", correct: 2, feedback: "A hedge against local currency devaluation.", options: ["The high-risk growth piece.", "Guaranteed fixed interest.", "A currency hedge (~30%).", "They are not included."] },
  { q: "What is the main point of the whole finale?", correct: 0, feedback: "Use everything learned to build your own diversified plan.", options: ["Use what you learned to build your own diversified plan.", "Put all your money in crypto.", "Avoid investing entirely.", "Only the richest can invest."] },
];

/* ---- Asset match (function in a portfolio) ---- */
const MATCH_PAIRS = [
  { a: "CDT (fixed income)", b: "100% capital safety, predictable returns (Fogafín-backed)" },
  { a: "Digital dollars (USDC/USDT)", b: "Protects against local currency devaluation (a hedge)" },
  { a: "Collective Investment Fund (FIC)", b: "Pools money into a professionally managed, diversified portfolio" },
  { a: "Bitcoin / crypto", b: "High-risk, high-reward growth — only a small slice" },
];

/* ---- Final feedback options ---- */
const FEEDBACK_TOPICS = [
  { id: "budget", label: "Budgeting (Week 1)" },
  { id: "saving", label: "Saving & CDTs (Week 2)" },
  { id: "math", label: "Financial math (Week 3)" },
  { id: "credit", label: "Credit & debt (Week 4)" },
  { id: "investing", label: "Project evaluation (Week 5)" },
  { id: "digital", label: "Digital dollars (Week 6)" },
];

/* =====================================================================
   HELPERS
   ===================================================================== */
const money = (n) => "COP $" + (Math.round(parseFloat(n) || 0)).toLocaleString("es-CO");
const countWords = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const parseNum = (s) => parseFloat(String(s).replace(/[^0-9.\-]/g, ""));
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const TERMS_RE = new RegExp("(" + KEY_TERMS.map(escapeRe).join("|") + ")", "g");
function renderReadingText(text) {
  return text.split(TERMS_RE).map((part, i) => {
    if (!part) return null;
    const hit = KEY_TERMS.find((t) => t === part);
    if (hit) return <mark className="hl" key={i} title={GLOSSARY[hit]}>{part}</mark>;
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
function shuffleArr(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function sample(arr, n) { return !n || n >= arr.length ? shuffleArr(arr) : shuffleArr(arr).slice(0, n); }
function riskProfile(pct) {
  if (pct <= 33) return { label: "Cautious", desc: "safety-first — fixed income should dominate your plan." };
  if (pct <= 66) return { label: "Balanced", desc: "open to some risk — a mix of safe and growth assets fits you." };
  return { label: "Bold", desc: "comfortable with risk — you can hold more growth assets, managed wisely." };
}
const DIMS = { knowledge: "Knowledge", habits: "Habits", planning: "Planning", risk: "Risk" };

/* =====================================================================
   REWARD
   ===================================================================== */
function Reward({ title, subtitle, coins, saving, onExit, gold }) {
  return (
    <div className="s1-reward">
      <div className={`reward-badge ${gold ? "gold" : ""}`}>{gold ? <Sparkles size={40} strokeWidth={2.1} /> : <Trophy size={40} strokeWidth={2.1} />}</div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      <div className="reward-coins">
        <span className="coin-burst" aria-hidden="true">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="coin-fly" style={{ "--i": i }}>🪙</span>)}</span>
        <Coins size={20} strokeWidth={2.3} /> +{coins} coins
      </div>
      <p className="reward-note">These coins power your Fluency Meter on the dashboard.</p>
      <button className="s1-btn primary" onClick={onExit}>Continue <ChevronRight size={18} strokeWidth={2.4} /></button>
      {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing your progress…</span>}
    </div>
  );
}

/* =====================================================================
   QUIZ RUNNER (80% to pass, retry)
   ===================================================================== */
function QuizRunner({ title, emoji, questions, pickCount, passThreshold, xpPerCorrect, xpComplete, onSave, onExit }) {
  const [attempt, setAttempt] = useState(0);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coins, setCoins] = useState(0);

  const deck = useMemo(() => sample(questions, pickCount).map((q) => ({ ...q, order: shuffleArr(q.options.map((_, i) => i)) })), [questions, pickCount, attempt]);
  const q = deck[current];
  const answered = answers[current] !== undefined;
  const isLast = current === deck.length - 1;
  const pick = (i) => { if (!answered) setAnswers({ ...answers, [current]: i }); };

  const next = () => {
    if (!isLast) { setCurrent(current + 1); return; }
    const correct = deck.reduce((a, qq, i) => a + (answers[i] === qq.correct ? 1 : 0), 0);
    const pct = Math.round((correct / deck.length) * 100);
    const passed = passThreshold == null || pct >= passThreshold;
    const xp = correct * xpPerCorrect + (xpComplete || 0);
    setCoins(xp); setSaving(true); setFinished(true);
    onSave({ correct, total: deck.length, xp, pct, passed }).finally(() => setSaving(false));
  };
  const retry = () => { setAttempt((a) => a + 1); setCurrent(0); setAnswers({}); setFinished(false); setCoins(0); };

  if (finished) {
    const correct = deck.reduce((a, qq, i) => a + (answers[i] === qq.correct ? 1 : 0), 0);
    const pct = Math.round((correct / deck.length) * 100);
    const passed = passThreshold == null || pct >= passThreshold;
    if (!passed) {
      return (
        <div className="s1-reward">
          <div className="reward-badge"><X size={40} strokeWidth={2.1} /></div>
          <h2>Almost there</h2>
          <p>You got {correct} / {deck.length} correct ({pct}%). You need at least {passThreshold}% to pass.</p>
          <div className="reward-coins"><Coins size={20} strokeWidth={2.3} /> +{coins} coins</div>
          <p className="reward-note">Your coins are saved, but you need {passThreshold}% to move on. Try again — new questions.</p>
          <button className="s1-btn primary" onClick={retry}>Try again <ChevronRight size={18} strokeWidth={2.4} /></button>
          {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing your progress…</span>}
        </div>
      );
    }
    return <Reward title={correct === deck.length ? "Perfect!" : "You passed!"} subtitle={`You got ${correct} / ${deck.length} correct.`} coins={coins} saving={saving} onExit={onExit} />;
  }

  return (
    <div className="s1-quiz">
      <div className="quiz-top"><h2>{emoji} {title}</h2><span className="quiz-count">{current + 1} / {deck.length}</span></div>
      <div className="quiz-track"><i style={{ width: `${((current + (answered ? 1 : 0)) / deck.length) * 100}%` }} /></div>
      <p className="quiz-q">{q.q}</p>
      <div className="quiz-options">
        {q.order.map((oi, pos) => {
          const opt = q.options[oi];
          let cls = "quiz-opt";
          if (answered) { if (oi === q.correct) cls += " correct"; else if (oi === answers[current]) cls += " wrong"; }
          return (
            <button key={oi} className={cls} onClick={() => pick(oi)} disabled={answered}>
              <span className="opt-key">{String.fromCharCode(65 + pos)}</span>
              <span className="opt-text">{opt}</span>
              {answered && oi === q.correct && <Check size={18} strokeWidth={3} className="opt-tick" />}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="quiz-feedback"><Lightbulb size={18} strokeWidth={2.2} />
          <span><b>{answers[current] === q.correct ? "Correct! " : "Not quite. "}</b>{q.feedback}</span>
        </div>
      )}
      <div className="quiz-nav">
        <button className="s1-btn ghost" onClick={onExit}>Save &amp; exit</button>
        <button className="s1-btn primary" onClick={next} disabled={!answered}>{isLast ? "Finish" : "Next"} <ChevronRight size={18} strokeWidth={2.4} /></button>
      </div>
    </div>
  );
}

/* =====================================================================
   READER
   ===================================================================== */
function Reader({ done, onFinish, onExit }) {
  const [term, setTerm] = useState(null);
  return (
    <div>
      <div className="reader-bar">
        <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
        <div className="reader-meta"><Clock size={15} strokeWidth={2.3} /> ~9 min read</div>
      </div>
      <article className="s1-reader">
        <span className="reader-tag">READING · B2 · FINALE</span>
        <h1>Online Investments &amp; Your Portfolio</h1>
        <p className="reader-sub">Digital dollars, diversification, and building your own plan.</p>
        <div className="reader-terms">
          <span className="terms-label">Key words (tap for meaning):</span>
          {["stablecoins", "USDT", "USDC", "digital dollars", "diversification", "depeg risk", "fixed income"].map((t) => (
            <button key={t} className={`term-chip ${term === t ? "on" : ""}`} onClick={() => setTerm(term === t ? null : t)}>{t}</button>
          ))}
        </div>
        {term && <div className="term-pop"><b>{term}</b> — {GLOSSARY[term]}</div>}
        <div className="reader-body">
          {READING.map((b, i) => (b.h ? <h2 key={i}>{b.h}</h2> : <p key={i}>{renderReadingText(b.p)}</p>))}
        </div>
        <div className="reader-finish">
          {done ? <span className="reader-done"><Check size={18} strokeWidth={3} /> You've read this</span>
            : <button className="s1-btn primary big" onClick={onFinish}><Check size={18} strokeWidth={2.6} /> I've finished reading <span className="coin-tag"><Coins size={15} /> +{XP.reading}</span></button>}
        </div>
      </article>
    </div>
  );
}

/* =====================================================================
   BASIC CALCULATOR (keypad) — reused inside the stablecoin exercise
   ===================================================================== */
function BasicCalc() {
  const [expr, setExpr] = useState("");
  const [out, setOut] = useState("");
  const press = (t) => { setOut(""); setExpr((e) => e + t); };
  const clear = () => { setExpr(""); setOut(""); };
  const del = () => { setOut(""); setExpr((e) => e.slice(0, -1)); };
  const equals = () => {
    try {
      if (!/^[0-9+\-*/.() ]+$/.test(expr)) { setOut("—"); return; }
      const r = Function('"use strict";return (' + expr + ")")();
      setOut(Number.isFinite(r) ? String(Math.round(r * 100) / 100) : "—");
    } catch { setOut("—"); }
  };
  return (
    <div className="fincalc bcalc">
      <div className="fincalc-head"><Calculator size={16} strokeWidth={2.3} /> Calculator</div>
      <div className="bcalc-screen">
        <span className="bcalc-expr">{expr || "0"}</span>
        {out !== "" && <span className="bcalc-out">= {Number(out).toLocaleString("es-CO")}</span>}
      </div>
      <div className="bcalc-pad">
        <button className="bcalc-k util" onClick={clear}>C</button>
        <button className="bcalc-k util" onClick={del}>⌫</button>
        <button className="bcalc-k op" onClick={() => press("(")}>(</button>
        <button className="bcalc-k op" onClick={() => press(")")}>)</button>
        <button className="bcalc-k" onClick={() => press("7")}>7</button>
        <button className="bcalc-k" onClick={() => press("8")}>8</button>
        <button className="bcalc-k" onClick={() => press("9")}>9</button>
        <button className="bcalc-k op" onClick={() => press("/")}>÷</button>
        <button className="bcalc-k" onClick={() => press("4")}>4</button>
        <button className="bcalc-k" onClick={() => press("5")}>5</button>
        <button className="bcalc-k" onClick={() => press("6")}>6</button>
        <button className="bcalc-k op" onClick={() => press("*")}>×</button>
        <button className="bcalc-k" onClick={() => press("1")}>1</button>
        <button className="bcalc-k" onClick={() => press("2")}>2</button>
        <button className="bcalc-k" onClick={() => press("3")}>3</button>
        <button className="bcalc-k op" onClick={() => press("-")}>−</button>
        <button className="bcalc-k zero" onClick={() => press("0")}>0</button>
        <button className="bcalc-k" onClick={() => press(".")}>.</button>
        <button className="bcalc-k op" onClick={() => press("+")}>+</button>
        <button className="bcalc-k eq" onClick={equals}>=</button>
      </div>
    </div>
  );
}

/* =====================================================================
   STABLECOIN STEP SET (conversion + currency analysis)
   ===================================================================== */
const STABLE_PROBLEMS = [
  {
    teach: {
      title: "Turning pesos into digital dollars",
      body: "When you buy USDC, the platform charges a small fee on your deposit, then converts what's left at the exchange rate (COP per 1 USD). Fewer pesos per dollar means more USD; the rate and the fee decide how much you actually get.",
      example: "Different case: $200,000 COP, 2% fee, rate $4,100/USD. Fee = 200,000 × 0.02 = $4,000. Net = 200,000 − 4,000 = $196,000. USDC = 196,000 ÷ 4,100 ≈ 47.8 USDC. Use the calculator, then do the case below.",
    },
    scenario: "You have $400,000 COP. The platform fee is 1%, and the rate is $1 USD = $4,000 COP.",
    steps: [
      { type: "number", q: "Step 1 — the fee in COP: 400,000 × 0.01 = ?", answer: 4000, tol: 0.02, hint: "400,000 × 0.01", feedback: "Fee = $4,000." },
      { type: "number", q: "Step 2 — net COP to convert: 400,000 − 4,000 = ?", answer: 396000, tol: 0.01, hint: "400,000 − 4,000", feedback: "Net = $396,000." },
      { type: "number", q: "Step 3 — how many USDC? 396,000 ÷ 4,000 = ? (one decimal)", answer: 99, tol: 0.02, hint: "396,000 ÷ 4,000", feedback: "≈ 99 USDC." },
      { type: "number", q: "Step 4 — six months later the rate is $4,400/USD. Your 99 USDC in pesos? (99 × 4,400)", answer: 435600, tol: 0.02, hint: "99 × 4,400", feedback: "99 × 4,400 = $435,600 — more pesos than you started with, because the dollar rose." },
      { type: "choice", q: "What just happened to your buying power?", options: ["The dollar rose vs the peso, so your USDC is worth more pesos — a hedge that worked.", "You lost money because crypto is risky.", "Nothing changed at all."], correct: 0, feedback: "Holding dollars protected you when the peso weakened." },
    ],
  },
];

function StableStepSet({ onSave, onExit }) {
  const problems = STABLE_PROBLEMS;
  const [pi, setPi] = useState(0);
  const [si, setSi] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [choiceIdx, setChoiceIdx] = useState(null);
  const [numInput, setNumInput] = useState("");
  const [numError, setNumError] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  const problem = problems[pi];
  const step = problem.steps[si];
  const isLastStep = si === problem.steps.length - 1;
  const isLastProblem = pi === problems.length - 1;

  const resetStep = () => { setAnswered(false); setChoiceIdx(null); setNumInput(""); setNumError(false); };
  const pickChoice = (i) => { if (answered) return; setChoiceIdx(i); setAnswered(true); };
  const submitNumber = () => {
    const val = parseNum(numInput);
    const tol = (step.tol || 0.01) * Math.abs(step.answer) + 1;
    if (!Number.isNaN(val) && Math.abs(val - step.answer) <= tol) { setAnswered(true); setNumError(false); }
    else setNumError(true);
  };
  const next = () => {
    if (!isLastStep) { setSi(si + 1); resetStep(); return; }
    if (!isLastProblem) { setPi(pi + 1); setSi(0); resetStep(); return; }
    setSaving(true); setFinished(true);
    onSave({ done: true, xp: XP.stablecoin }).finally(() => setSaving(false));
  };

  if (finished) return <Reward title="Digital dollars unlocked! 💵" subtitle="You bought USDC and saw currency protection in action." coins={XP.stablecoin} saving={saving} onExit={onExit} />;

  return (
    <div className="s1-start step-wrap">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className="start-head">
        <div className="start-ico"><DollarSign size={22} strokeWidth={2.1} /></div>
        <div><h2>💵 Buy digital dollars (USDC)</h2><p>Step {si + 1} of {problem.steps.length}</p></div>
      </div>

      {problem.teach && si === 0 && (
        <div className="s3-teach">
          <h3><Lightbulb size={18} strokeWidth={2.3} /> {problem.teach.title}</h3>
          <p>{problem.teach.body}</p>
          <p className="s3-teach-ex"><b>Worked example — </b>{problem.teach.example}</p>
        </div>
      )}

      <div className="fincalc-row"><BasicCalc /></div>

      <div className="s1-quiz step-card">
        <div className="step-scenario"><Brain size={16} strokeWidth={2.2} /> {problem.scenario}</div>
        <div className="quiz-track"><i style={{ width: `${((si + (answered ? 1 : 0)) / problem.steps.length) * 100}%` }} /></div>
        <p className="quiz-q">{step.q}</p>
        {step.type === "choice" ? (
          <div className="quiz-options">
            {step.options.map((opt, i) => {
              let cls = "quiz-opt";
              if (answered) { if (i === step.correct) cls += " correct"; else if (i === choiceIdx) cls += " wrong"; }
              return (
                <button key={i} className={cls} onClick={() => pickChoice(i)} disabled={answered}>
                  <span className="opt-key">{String.fromCharCode(65 + i)}</span>
                  <span className="opt-text">{opt}</span>
                  {answered && i === step.correct && <Check size={18} strokeWidth={3} className="opt-tick" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="num-step">
            {step.hint && <div className="num-hint"><Lightbulb size={15} strokeWidth={2.3} /> {step.hint}</div>}
            <div className="num-entry">
              <input className={`start-input ${numError ? "err" : ""} ${answered ? "ok" : ""}`} type="text" inputMode="decimal" value={numInput}
                onChange={(e) => { setNumInput(e.target.value); setNumError(false); }} placeholder="Type your answer" disabled={answered} />
              {!answered && <button className="s1-btn primary" onClick={submitNumber}>Check</button>}
            </div>
            {numError && <p className="num-msg err">Not quite — use the calculator and try again.</p>}
          </div>
        )}
        {answered && (
          <div className="quiz-feedback"><Lightbulb size={18} strokeWidth={2.2} /><span><b>Correct! </b>{step.feedback}</span></div>
        )}
        <div className="quiz-nav">
          <button className="s1-btn ghost" onClick={onExit}>Save &amp; exit</button>
          <button className="s1-btn primary" onClick={next} disabled={!answered}>{isLastStep && isLastProblem ? "Finish" : "Next step"} <ChevronRight size={18} strokeWidth={2.4} /></button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   ASSET MATCH (asset ↔ portfolio role) — 80% via count, but 4 pairs all-or-nothing
   ===================================================================== */
function AssetMatch({ onSave, onExit }) {
  const [leftSel, setLeftSel] = useState(null);
  const [matched, setMatched] = useState({});
  const [wrong, setWrong] = useState(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const lefts = useMemo(() => shuffleArr(MATCH_PAIRS.map((p) => p.a)), []);
  const rights = useMemo(() => shuffleArr(MATCH_PAIRS.map((p) => p.b)), []);
  const answerFor = (a) => MATCH_PAIRS.find((p) => p.a === a).b;
  const allDone = Object.keys(matched).length === MATCH_PAIRS.length;

  const clickRight = (b) => {
    if (!leftSel || matched[leftSel]) return;
    if (answerFor(leftSel) === b) { setMatched({ ...matched, [leftSel]: b }); setLeftSel(null); }
    else { setWrong({ a: leftSel, b }); setTimeout(() => setWrong(null), 600); }
  };
  const finish = () => { setSaving(true); setDone(true); onSave({ correct: MATCH_PAIRS.length, total: MATCH_PAIRS.length, xp: MATCH_PAIRS.length * XP.matchCorrect }).finally(() => setSaving(false)); };

  if (done) return <Reward title="Portfolio roles mastered! 🧩" subtitle="You know what each asset is FOR in a plan." coins={MATCH_PAIRS.length * XP.matchCorrect} saving={saving} onExit={onExit} />;

  return (
    <div className="s1-start">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className="start-head">
        <div className="start-ico"><Layers size={22} strokeWidth={2.1} /></div>
        <div><h2>Match each asset to its role</h2><p>Tap an asset on the left, then its job in a portfolio on the right.</p></div>
      </div>
      <div className="s3-teach">
        <h3><Lightbulb size={18} strokeWidth={2.3} /> Reminder</h3>
        <p>Every asset plays a role: <b>fixed income</b> = safety, <b>digital dollars</b> = currency hedge, <b>funds (FICs)</b> = diversified growth, <b>crypto</b> = a small high-risk bet. A good portfolio uses each on purpose.</p>
      </div>
      <div className="match-grid">
        <div className="match-col">
          {lefts.map((a) => (
            <button key={a} className={`match-item ${matched[a] ? "done" : ""} ${leftSel === a ? "sel" : ""} ${wrong?.a === a ? "shake" : ""}`}
              onClick={() => !matched[a] && setLeftSel(a)} disabled={!!matched[a]}>
              {matched[a] && <Check size={15} strokeWidth={3} />} {a}
            </button>
          ))}
        </div>
        <div className="match-col">
          {rights.map((b) => {
            const isMatched = Object.values(matched).includes(b);
            return (
              <button key={b} className={`match-item right ${isMatched ? "done" : ""} ${wrong?.b === b ? "shake" : ""}`}
                onClick={() => clickRight(b)} disabled={isMatched}>
                {isMatched && <Check size={15} strokeWidth={3} />} {b}
              </button>
            );
          })}
        </div>
      </div>
      <div className="sort-foot">
        <span className="sort-count">{Object.keys(matched).length} / {MATCH_PAIRS.length} matched</span>
        <button className="s1-btn primary" onClick={finish} disabled={!allDone}>Finish <ChevronRight size={18} strokeWidth={2.4} /></button>
      </div>
    </div>
  );
}

/* =====================================================================
   PORTFOLIO BUILDER · capstone deliverable (must total 100%)
   ===================================================================== */
const ASSET_ROWS = [
  { key: "fixed", label: "Fixed income", hint: "Bank CDT, TES bonds", color: "#0b7a50" },
  { key: "funds", label: "Investment funds", hint: "Tyba FIC", color: "#16b074" },
  { key: "dollars", label: "Digital dollars", hint: "USDC via Ark", color: "#f5b23e" },
  { key: "growth", label: "Growth / crypto", hint: "Bitcoin (small)", color: "#ff6b57" },
];

function PortfolioBuilder({ existing, week1, onSave, onExit }) {
  const capacity = Math.max(0, parseInt(week1?.budget?.capacity || 0, 10));
  const riskScore = week1?.diagnostic?.scores?.risk;
  const rp = riskScore != null ? riskProfile(riskScore) : null;

  const [goal, setGoal] = useState(existing?.goal || "");
  const [horizon, setHorizon] = useState(existing?.horizon || "");
  const [amount, setAmount] = useState(existing?.amount || (capacity ? String(capacity) : ""));
  const [alloc, setAlloc] = useState(existing?.alloc || { fixed: 40, funds: 30, dollars: 20, growth: 10 });
  const [reflection, setReflection] = useState(existing?.reflection || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const total = ASSET_ROWS.reduce((s, r) => s + (parseInt(alloc[r.key] || 0, 10)), 0);
  const amt = parseInt(amount || 0, 10);
  const MIN_REF = 40;
  const ready = goal.trim() && horizon && amt > 0 && total === 100 && countWords(reflection) >= MIN_REF;

  const setPct = (key, v) => setAlloc({ ...alloc, [key]: Math.max(0, Math.min(100, parseInt(v || 0, 10))) });
  const submit = () => { setSaving(true); setSaved(true); onSave({ goal, horizon, amount: amt, alloc, reflection }).finally(() => setSaving(false)); };

  if (saved) return <Reward title="Your portfolio is built! 🏆" subtitle="This is your capstone — a real, diversified plan that's yours." coins={XP.portfolio} saving={saving} onExit={onExit} gold />;

  // Donut segments
  let acc = 0;
  const segs = ASSET_ROWS.map((r) => {
    const p = parseInt(alloc[r.key] || 0, 10);
    const seg = { color: r.color, from: acc, to: acc + p };
    acc += p; return seg;
  });
  const grad = total > 0
    ? `conic-gradient(${segs.map((s) => `${s.color} ${s.from}% ${s.to}%`).join(", ")}${total < 100 ? `, #e6ece9 ${total}% 100%` : ""})`
    : "#e6ece9";

  return (
    <div className="s1-start">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className="start-head">
        <div className="start-ico"><PieChart size={22} strokeWidth={2.1} /></div>
        <div><h2>Build your personal portfolio ⭐</h2><p>Your capstone: goal, amount, and how you split it across assets. It must add up to 100%.</p></div>
      </div>

      <div className="s3-teach">
        <h3><Lightbulb size={18} strokeWidth={2.3} /> How to think about it</h3>
        {rp
          ? <p>Your Week 1 self-check came out <b>{rp.label}</b> — {rp.desc} Let that guide your split: more safety if cautious, more growth if bold.</p>
          : <p>Balance safety, growth and inflation protection. A classic starting mix is 60% fixed income, 30% digital dollars, 10% growth — adjust to your own risk tolerance.</p>}
        {capacity > 0 && <p>Your Week 1 budget said you can invest about <b>{money(capacity)}</b> a month. That's a realistic amount to plan with.</p>}
      </div>

      <div className="start-block">
        <h3><span className="step-n">1</span> Your profile</h3>
        <p className="start-tip">Your main financial goal:</p>
        <input className="start-input" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. save for university / a laptop / an emergency fund" />
        <p className="start-tip" style={{ margin: "12px 0 6px" }}>Time horizon:</p>
        <div className="pf-horizon">
          {[["short", "Short (<1 yr)"], ["medium", "Medium (1–3 yrs)"], ["long", "Long (>3 yrs)"]].map(([id, lbl]) => (
            <button key={id} className={horizon === id ? "on" : ""} onClick={() => setHorizon(id)}>{lbl}</button>
          ))}
        </div>
        <p className="start-tip" style={{ margin: "12px 0 4px" }}>Amount to invest (COP):</p>
        <input className="start-input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={capacity ? String(capacity) : "e.g. 100000"} />
      </div>

      <div className="start-block">
        <h3><span className="step-n">2</span> Your distribution (total must be 100%)</h3>
        <div className="pf-grid">
          <div className="pf-rows">
            {ASSET_ROWS.map((r) => (
              <div key={r.key} className="pf-row">
                <span className="pf-dot" style={{ background: r.color }} />
                <div className="pf-row-label"><b>{r.label}</b><span>{r.hint}</span></div>
                <div className="pf-pct">
                  <input type="number" value={alloc[r.key]} onChange={(e) => setPct(r.key, e.target.value)} /><span>%</span>
                </div>
                <span className="pf-amt">{amt > 0 ? money(amt * (parseInt(alloc[r.key] || 0, 10) / 100)) : "—"}</span>
              </div>
            ))}
          </div>
          <div className="pf-donut-wrap">
            <div className="pf-donut" style={{ background: grad }}><div className="pf-donut-hole"><b className={total === 100 ? "ok" : "bad"}>{total}%</b><span>{total === 100 ? "balanced" : "adjust"}</span></div></div>
          </div>
        </div>
        {total !== 100 && <p className="num-msg err" style={{ textAlign: "center" }}>Your allocations add to {total}% — they must total exactly 100%.</p>}
      </div>

      <div className="start-block">
        <h3><span className="step-n">3</span> Justify your plan (in English)</h3>
        <p className="start-tip">Why this split? How does it balance safety, growth and inflation protection for your goal? (min {MIN_REF} words)</p>
        <WordFieldLocal value={reflection} onChange={setReflection} min={MIN_REF} max={160} rows={6} placeholder="I chose this allocation because my goal is … and my risk tolerance is …" />
      </div>

      <div className="start-foot">
        <button className="s1-btn primary big" onClick={submit} disabled={!ready}>Save my portfolio <span className="coin-tag"><Coins size={15} /> +{XP.portfolio}</span></button>
      </div>
    </div>
  );
}

/* =====================================================================
   GROWTH · re-run the Week 1 self-check and compare (radar)
   ===================================================================== */
const DIAG = [
  { dim: "knowledge", q: "How confident are you explaining what inflation does to your money?", options: [{ t: "Still not sure.", v: 0 }, { t: "I have a rough idea.", v: 1 }, { t: "I can explain it.", v: 2 }, { t: "I can explain it clearly with an example.", v: 3 }] },
  { dim: "knowledge", q: "Do you know the difference between saving and investing, and simple vs compound interest?", options: [{ t: "Not really.", v: 0 }, { t: "One of them.", v: 1 }, { t: "Mostly yes.", v: 2 }, { t: "Yes, and I can calculate both.", v: 3 }] },
  { dim: "habits", q: "Do you track your money and separate needs from wants?", options: [{ t: "No.", v: 0 }, { t: "Sometimes.", v: 1 }, { t: "Usually.", v: 2 }, { t: "Yes, it's a habit now.", v: 3 }] },
  { dim: "habits", q: "When you get money, do you set some aside first?", options: [{ t: "Never.", v: 0 }, { t: "Whatever is left.", v: 1 }, { t: "A little, on purpose.", v: 2 }, { t: "I pay myself first.", v: 3 }] },
  { dim: "planning", q: "Do you have a clear savings/investing goal with an amount and a plan?", options: [{ t: "No goal.", v: 0 }, { t: "A vague one.", v: 1 }, { t: "A goal, loosely.", v: 2 }, { t: "A clear goal and a portfolio plan.", v: 3 }] },
  { dim: "planning", q: "Could you evaluate whether an investment is worth it (NPV/IRR)?", options: [{ t: "No idea.", v: 0 }, { t: "I've heard of it.", v: 1 }, { t: "Roughly.", v: 2 }, { t: "Yes, I can compute and decide.", v: 3 }] },
  { dim: "risk", q: "How do you feel about risk for higher returns now?", options: [{ t: "I avoid all risk.", v: 0 }, { t: "Very cautious.", v: 1 }, { t: "Balanced.", v: 2 }, { t: "Comfortable, and I manage it.", v: 3 }] },
  { dim: "risk", q: "Could you build a diversified plan (fixed, funds, dollars, growth)?", options: [{ t: "No.", v: 0 }, { t: "Maybe one part.", v: 1 }, { t: "Most of it.", v: 2 }, { t: "Yes — I just did.", v: 3 }] },
];

function Radar({ before, after }) {
  const size = 260, c = size / 2, r = size / 2 - 44, n = after.length;
  const ang = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, rad) => [c + rad * Math.cos(ang(i)), c + rad * Math.sin(ang(i))];
  const ring = (f) => after.map((_, i) => pt(i, r * f).join(",")).join(" ");
  const shape = (data) => data.map((d, i) => pt(i, r * (d.value / 100)).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="radar">
      {[0.25, 0.5, 0.75, 1].map((f, k) => <polygon key={k} points={ring(f)} className="radar-grid" />)}
      {after.map((_, i) => { const [x, y] = pt(i, r); return <line key={i} x1={c} y1={c} x2={x} y2={y} className="radar-axis" />; })}
      {before && <polygon points={shape(before)} className="radar-before" />}
      <polygon points={shape(after)} className="radar-shape" />
      {after.map((d, i) => { const [x, y] = pt(i, r + 20); return <text key={i} x={x} y={y} className="radar-label" textAnchor="middle" dominantBaseline="middle">{d.label}</text>; })}
    </svg>
  );
}

function GrowthCompare({ week1, onSave, onExit }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [doneScreen, setDoneScreen] = useState(false);
  const [saving, setSaving] = useState(false);

  const q = DIAG[current];
  const answered = answers[current] !== undefined;
  const isLast = current === DIAG.length - 1;

  const scores = useMemo(() => {
    const acc = {}, cnt = {};
    DIAG.forEach((d, i) => { acc[d.dim] = (acc[d.dim] || 0) + (answers[i]?.v ?? 0); cnt[d.dim] = (cnt[d.dim] || 0) + 3; });
    const out = {}; Object.keys(DIMS).forEach((k) => { out[k] = cnt[k] ? Math.round((acc[k] / cnt[k]) * 100) : 0; });
    return out;
  }, [answers]);

  const beforeScores = week1?.diagnostic?.scores;
  const pick = (opt) => setAnswers({ ...answers, [current]: opt });
  const finish = () => { setSaving(true); setDoneScreen(true); onSave({ scores, before: beforeScores || null }).finally(() => setSaving(false)); };
  const next = () => { if (!isLast) setCurrent(current + 1); else finish(); };

  if (doneScreen) {
    const after = Object.keys(DIMS).map((k) => ({ label: DIMS[k], value: scores[k] }));
    const before = beforeScores ? Object.keys(DIMS).map((k) => ({ label: DIMS[k], value: beforeScores[k] })) : null;
    const avgAfter = Math.round(after.reduce((s, d) => s + d.value, 0) / after.length);
    const avgBefore = before ? Math.round(before.reduce((s, d) => s + d.value, 0) / before.length) : null;
    return (
      <div className="s1-quiz diag-result">
        <div className="diag-badge"><Compass size={30} strokeWidth={2.1} /></div>
        <h2>How far you've come</h2>
        <p className="diag-sub">The faded shape is your Week 1 self-check. The solid one is you now.</p>
        <Radar before={before} after={after} />
        <div className="diag-bars">
          {after.map((d, i) => (
            <div key={d.label} className="diag-bar">
              <span className="diag-bar-l">{d.label}</span>
              <div className="diag-bar-track"><i style={{ width: `${d.value}%` }} /></div>
              <span className="diag-bar-v">{d.value}%</span>
            </div>
          ))}
        </div>
        {avgBefore != null
          ? <div className="grow-badge">You started at <b>{avgBefore}%</b> overall and you're now at <b>{avgAfter}%</b> — that's <b>{avgAfter - avgBefore >= 0 ? "+" : ""}{avgAfter - avgBefore} points</b> of growth in six weeks. 🎉</div>
          : <div className="grow-badge">You're at <b>{avgAfter}%</b> overall — a strong finish to the course. 🎉</div>}
        <button className="s1-btn primary" onClick={onExit}>Continue <ChevronRight size={18} strokeWidth={2.4} /></button>
        {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing…</span>}
      </div>
    );
  }

  return (
    <div className="s1-quiz">
      <div className="quiz-top"><h2>🧭 Your financial self-check, again</h2><span className="quiz-count">{current + 1} / {DIAG.length}</span></div>
      <div className="quiz-track"><i style={{ width: `${(current / DIAG.length) * 100}%` }} /></div>
      <span className="diag-dim">{DIMS[q.dim]}</span>
      <p className="quiz-q">{q.q}</p>
      <div className="quiz-options">
        {q.options.map((opt, i) => (
          <button key={i} className={`quiz-opt ${answers[current] === opt ? "chosen" : ""}`} onClick={() => pick(opt)}>
            <span className="opt-key">{String.fromCharCode(65 + i)}</span>
            <span className="opt-text">{opt.t}</span>
          </button>
        ))}
      </div>
      <div className="quiz-nav">
        <button className="s1-btn ghost" onClick={onExit}>Save &amp; exit</button>
        <button className="s1-btn primary" onClick={next} disabled={!answered}>{isLast ? "See my growth" : "Next"} <ChevronRight size={18} strokeWidth={2.4} /></button>
      </div>
    </div>
  );
}

/* =====================================================================
   FEEDBACK · opinion on the whole course
   ===================================================================== */
function Feedback({ existing, onSave, onExit }) {
  const [rateCourse, setRateCourse] = useState(existing?.rateCourse || 0);
  const [rateUI, setRateUI] = useState(existing?.rateUI || 0);
  const [favorite, setFavorite] = useState(existing?.favorite || "");
  const [opinion, setOpinion] = useState(existing?.opinion || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const MIN_OP = 30;
  const ready = rateCourse > 0 && rateUI > 0 && favorite && countWords(opinion) >= MIN_OP;
  const submit = () => { setSaving(true); setSaved(true); onSave({ rateCourse, rateUI, favorite, opinion }).finally(() => setSaving(false)); };

  if (saved) return <Reward title="Course complete! 🎓" subtitle="Thank you for your feedback — and congratulations on finishing FinFluent." coins={XP.feedback} saving={saving} onExit={onExit} gold />;

  const Stars = ({ value, onChange }) => (
    <div className="fb-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} className={s <= value ? "on" : ""} onClick={() => onChange(s)} aria-label={`${s} stars`}><Star size={26} strokeWidth={2} fill={s <= value ? "currentColor" : "none"} /></button>
      ))}
    </div>
  );

  return (
    <div className="s1-start">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className="start-head">
        <div className="start-ico"><Send size={22} strokeWidth={2.1} /></div>
        <div><h2>Your verdict on the course</h2><p>You built a full financial toolkit. Tell us what you thought — it shapes the next version.</p></div>
      </div>

      <div className="start-block">
        <h3><span className="step-n">1</span> Rate the course overall</h3>
        <Stars value={rateCourse} onChange={setRateCourse} />
        <h3 style={{ marginTop: 16 }}><span className="step-n">2</span> Rate the interface &amp; how it looked</h3>
        <Stars value={rateUI} onChange={setRateUI} />
      </div>

      <div className="start-block">
        <h3><span className="step-n">3</span> Your favorite week</h3>
        <div className="plan-choices">
          {FEEDBACK_TOPICS.map((t) => (
            <button key={t.id} className={`plan-choice ${favorite === t.id ? "on" : ""}`} onClick={() => setFavorite(t.id)}>
              <span className="plan-choice-ico"><Star size={16} strokeWidth={2.1} /></span>
              <span className="plan-choice-text"><b>{t.label}</b></span>
            </button>
          ))}
        </div>
      </div>

      <div className="start-block">
        <h3><span className="step-n">4</span> Your opinion (in English)</h3>
        <p className="start-tip">What did you like about the topics, the order and the interface? What would you improve? (min {MIN_OP} words)</p>
        <WordFieldLocal value={opinion} onChange={setOpinion} min={MIN_OP} max={160} rows={6} placeholder="I liked … The order of the weeks felt … The interface was … One thing I'd improve is …" />
      </div>

      <div className="start-foot">
        <button className="s1-btn primary big" onClick={submit} disabled={!ready}>Finish the course <span className="coin-tag"><Coins size={15} /> +{XP.feedback}</span></button>
      </div>
    </div>
  );
}

/* Word field with a minimum (local) */
function WordFieldLocal({ value, onChange, placeholder, min, max = 160, rows = 4 }) {
  const w = countWords(value);
  const ok = w >= min && w <= max;
  const state = w === 0 ? "" : ok ? "ok" : w > max ? "over" : "low";
  return (
    <>
      <textarea className="start-input" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      <p className={`word-count ${state}`}>{w} words · min {min} · max {max} {ok ? "✓" : w < min ? `— write ${min - w} more` : "— too long, trim it"}</p>
    </>
  );
}

/* =====================================================================
   MAIN COMPONENT
   ===================================================================== */
export const Semana6 = ({ userData, API_URL, existingRow, onBack }) => {
  const { store, dispatch } = useGlobalReducer();

  const initChecklist = useMemo(() => { try { return existingRow?.Checklist_JSON ? JSON.parse(existingRow.Checklist_JSON) : {}; } catch { return {}; } }, [existingRow]);
  const initResp = useMemo(() => { try { return existingRow?.Respuestas_JSON ? JSON.parse(existingRow.Respuestas_JSON) : {}; } catch { return {}; } }, [existingRow]);

  const [checklist, setChecklist] = useState(initChecklist);
  const respRef = useRef(initResp);
  const [points, setPoints] = useState({
    comportamiento: parseFloat(existingRow?.Puntos_Comportamiento || 0),
    quizzes: parseFloat(existingRow?.Puntos_Quizzes || 0),
    aprendi: parseFloat(existingRow?.Puntos_Aprendi || 0),
  });

  const hydrated = useRef(!!existingRow);
  useEffect(() => {
    if (hydrated.current || !existingRow) return;
    hydrated.current = true;
    setChecklist(initChecklist); respRef.current = initResp;
    setPoints({
      comportamiento: parseFloat(existingRow.Puntos_Comportamiento || 0),
      quizzes: parseFloat(existingRow.Puntos_Quizzes || 0),
      aprendi: parseFloat(existingRow.Puntos_Aprendi || 0),
    });
  }, [existingRow]); // eslint-disable-line

  const [open, setOpen] = useState(null);
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [open]);

  // Week 1 data (budget + first diagnostic) from the store
  const week1 = useMemo(() => { try { const r = JSON.parse(store.semanas?.[1]?.Respuestas_JSON || "{}"); return { budget: r.start, diagnostic: r.diagnostic }; } catch { return {}; } }, [store.semanas]);

  const doneCount = SECTION_KEYS.filter((k) => checklist[k]).length;
  const pct = Math.round((doneCount / TOTAL_SECTIONS) * 100);

  const persist = (nextChecklist, nextPoints, respPatch) => {
    respRef.current = { ...respRef.current, ...respPatch };
    const done = SECTION_KEYS.filter((k) => nextChecklist[k]).length;
    const newPct = Math.round((done / TOTAL_SECTIONS) * 100);
    const row = {
      Student_Key: userData.Student_Key, Semana: 6,
      Estado: done >= TOTAL_SECTIONS ? "completed" : "in_progress",
      Porcentaje: newPct,
      Puntos_Comportamiento: nextPoints.comportamiento,
      Puntos_Quizzes: nextPoints.quizzes,
      Puntos_Aprendi: nextPoints.aprendi,
      Checklist_JSON: JSON.stringify(nextChecklist),
      Respuestas_JSON: JSON.stringify(respRef.current),
    };
    const prev = store.semanas?.[6];
    dispatch({ type: "save_progreso", payload: row });
    fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "save_progreso", data: row }) })
      .catch((e) => { console.error("Error guardando Semana 6:", e); dispatch({ type: "rollback_progreso", payload: { Semana: 6, prev } }); });
  };

  const complete = (key, addPoints, respPatch, pass = true) => {
    const already = !!checklist[key];
    const nextChecklist = { ...checklist, [key]: already || pass };
    const nextPoints = already ? points : {
      comportamiento: points.comportamiento + (addPoints.comportamiento || 0),
      quizzes: points.quizzes + (addPoints.quizzes || 0),
      aprendi: points.aprendi + (addPoints.aprendi || 0),
    };
    setChecklist(nextChecklist); setPoints(nextPoints);
    persist(nextChecklist, nextPoints, respPatch);
    return Promise.resolve();
  };

  /* ---------- VIEWS ---------- */
  if (open === "reading") return (
    <div className="s1"><Reader done={!!checklist.reading} onExit={() => setOpen(null)}
      onFinish={() => { complete("reading", { comportamiento: XP.reading }, { reading: { at: new Date().toISOString() } }); setOpen(null); }} /></div>
  );
  if (open === "check") return (
    <div className="s1"><QuizRunner title="Reading check" emoji="🧠" questions={CHECK} pickCount={10} passThreshold={80} xpPerCorrect={XP.checkCorrect} xpComplete={0}
      onExit={() => setOpen(null)}
      onSave={(r) => complete("check", { quizzes: r.correct * XP.checkCorrect }, { check: { correct: r.correct, total: r.total, at: new Date().toISOString() } }, r.passed)} /></div>
  );
  if (open === "stablecoin") return (
    <div className="s1"><StableStepSet onExit={() => setOpen(null)}
      onSave={() => complete("stablecoin", { aprendi: XP.stablecoin }, { stablecoin: { done: true, at: new Date().toISOString() } })} /></div>
  );
  if (open === "match") return (
    <div className="s1"><AssetMatch onExit={() => setOpen(null)}
      onSave={(r) => complete("match", { quizzes: r.xp }, { match: { correct: r.correct, total: r.total, at: new Date().toISOString() } })} /></div>
  );
  if (open === "portfolio") return (
    <div className="s1"><PortfolioBuilder existing={respRef.current?.portfolio} week1={week1} onExit={() => setOpen(null)}
      onSave={(r) => complete("portfolio", { aprendi: XP.portfolio }, { portfolio: { ...r, at: new Date().toISOString() } })} /></div>
  );
  if (open === "growth") return (
    <div className="s1"><GrowthCompare week1={week1} onExit={() => setOpen(null)}
      onSave={(r) => complete("growth", { comportamiento: XP.growth }, { growth: { ...r, at: new Date().toISOString() } })} /></div>
  );
  if (open === "feedback") return (
    <div className="s1"><Feedback existing={respRef.current?.feedback} onExit={() => setOpen(null)}
      onSave={(r) => complete("feedback", { comportamiento: XP.feedback }, { feedback: { ...r, at: new Date().toISOString() } })} /></div>
  );

  /* ---------- MENU ---------- */
  const Section = ({ k, icon, title, desc, topics, cta }) => (
    <div className={`act-card ${checklist[k] ? "done" : ""}`}>
      <div className="act-ico">{checklist[k] ? <Check size={22} strokeWidth={3} /> : icon}</div>
      <div className="act-main">
        <h3>{title}</h3><p>{desc}</p>
        {topics && <div className="act-topics">{topics.map((t, i) => <span key={i}>{t}</span>)}</div>}
      </div>
      {cta}
    </div>
  );
  const btn = (k, label, extra) => checklist[k]
    ? <button className="act-cta done" onClick={() => setOpen(k)}>Done ✓</button>
    : <button className="act-cta play" onClick={() => setOpen(k)}>{label} {extra}</button>;

  return (
    <div className="s1">
      <button className="s1-back" onClick={onBack}><ArrowLeft size={18} strokeWidth={2.4} /> Back to overview</button>

      <div className="s1-hero s6-hero">
        <span className="s1-tag"><Globe size={14} strokeWidth={2.6} /> WEEK 6 · GO LIVE · THE FINALE</span>
        <h1>Your money, your plan</h1>
        <p>Digital dollars, diversification, and your own portfolio. Then see how far you've grown since Week 1 and close the course.</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pct}%` }} /></div><span className="pill">{pct}%</span></div>
      </div>

      <div className="obj-card">
        <div className="obj-col">
          <div className="obj-head"><span className="obj-ico learn"><GraduationCap size={20} strokeWidth={2.2} /></span><h3>What you'll learn</h3></div>
          <ul className="obj-list">{OBJECTIVES.map((o, i) => <li key={i}><Check size={16} strokeWidth={3} /> {o}</li>)}</ul>
        </div>
        <div className="obj-col">
          <div className="obj-head"><span className="obj-ico do"><Target size={20} strokeWidth={2.2} /></span><h3>By the end, you'll…</h3></div>
          <ul className="obj-list">{DELIVERABLES.map((o, i) => <li key={i}><ChevronRight size={16} strokeWidth={3} /> {o}</li>)}</ul>
        </div>
      </div>

      <div className="s1-quest">
        <Section k="reading" icon={<BookOpen size={22} strokeWidth={2.1} />} title="Reading: Online Investments" desc="Stablecoins, buying digital dollars, risk and diversification."
          topics={["Stablecoins", "USDC / USDT", "Diversification"]}
          cta={btn("reading", "Read", <span className="coin-tag"><Coins size={14} /> +{XP.reading}</span>)} />

        <Section k="check" icon={<GraduationCap size={22} strokeWidth={2.1} />} title="Reading check" desc="10 random questions from the chapter — pass with 80%."
          cta={btn("check", <><Play size={16} strokeWidth={2.6} /> Start</>, <span className="coin-tag"><Coins size={14} /> +{10 * XP.checkCorrect}</span>)} />

        <Section k="stablecoin" icon={<DollarSign size={22} strokeWidth={2.1} />} title="Buy digital dollars" desc="Convert pesos to USDC and see currency protection in action."
          topics={["Fee", "Exchange rate", "Hedge"]}
          cta={btn("stablecoin", <><Play size={16} strokeWidth={2.6} /> Solve</>, <span className="coin-tag"><Coins size={14} /> +{XP.stablecoin}</span>)} />

        <Section k="match" icon={<Layers size={22} strokeWidth={2.1} />} title="Asset match" desc="Match each asset to its role in a portfolio."
          topics={["Safety", "Hedge", "Growth"]}
          cta={btn("match", <><Play size={16} strokeWidth={2.6} /> Play</>, <span className="coin-tag"><Coins size={14} /> +{MATCH_PAIRS.length * XP.matchCorrect}</span>)} />

        <Section k="portfolio" icon={<PieChart size={22} strokeWidth={2.1} />} title="Build your portfolio ⭐" desc="Your capstone: goal, amount, and a split that totals 100%."
          topics={["Goal", "Allocation", "Justify"]}
          cta={btn("portfolio", "Build", <span className="coin-tag"><Coins size={14} /> +{XP.portfolio}</span>)} />

        <Section k="growth" icon={<Compass size={22} strokeWidth={2.1} />} title="How far you've come" desc="Re-take the Week 1 self-check and compare your growth."
          topics={["Radar", "Week 1 vs now", "Your growth"]}
          cta={btn("growth", <><Play size={16} strokeWidth={2.6} /> Start</>, <span className="coin-tag"><Coins size={14} /> +{XP.growth}</span>)} />

        <Section k="feedback" icon={<Send size={22} strokeWidth={2.1} />} title="Rate the course 🎓" desc="Give your honest verdict — topics, order and interface."
          cta={btn("feedback", <><Play size={16} strokeWidth={2.6} /> Finish</>, <span className="coin-tag"><Coins size={14} /> +{XP.feedback}</span>)} />
      </div>
    </div>
  );
};