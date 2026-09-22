import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft, BookOpen, Check, X, Coins, Trophy, Sparkles, Clock,
  ChevronRight, Lightbulb, Play, GraduationCap, TrendingUp, Calculator,
  CreditCard, Landmark, Scale, Table, Target, Brain, AlertTriangle,
  Percent, Wallet, TrendingDown, ArrowRightLeft, Search,
} from "lucide-react";
import "../Styles/semana1.css"; // botones, quiz, reward, monedas…
import "../Styles/semana2.css"; // word-count, sim, etc.
import "../Styles/semana3.css"; // fincalc, teach, step-solver…
import "../Styles/semana4.css"; // estilos propios de la semana 4
import useGlobalReducer from "../hooks/useGlobalReducer"; // ajusta la ruta si tu hook está en otro lado

/* =====================================================================
   SEMANA 4 · CRÉDITO Y DEUDA
   El interés que en la S3 crecía a tu favor, aquí crece EN TU CONTRA.
   Tarjetas vs créditos de consumo, costo real, tabla de amortización,
   abono a capital, y traer tu deuda a valor presente (une S3).
   Guarda en Progreso_Semanas (Semana: 4) vía save_progreso. Optimistic UI.
   ===================================================================== */

const SECTION_KEYS = ["reading", "check", "cost", "amort", "extra", "research", "final"];
const TOTAL_SECTIONS = SECTION_KEYS.length;

/* ---- Monedas por actividad ---- */
const XP = {
  reading: 20,
  checkCorrect: 4,     // ~10 preguntas
  cost: 30,            // costo real del crédito (pasos)
  amort: 40,           // construir tabla de amortización
  extra: 30,           // abono a capital
  research: 25,        // investigar tasas reales + simular
  finalCorrect: 6,     // mini examen + ejercicio grande
};

/* =====================================================================
   CONTENIDO
   ===================================================================== */
const OBJECTIVES = [
  "Explain how credit works and the key terms: principal, term, rate, instalment.",
  "Tell credit cards apart from consumer loans, and when each costs more.",
  "Calculate the real total cost of a loan, not just the monthly payment.",
  "Build and read an amortization table: interest vs capital each month.",
  "Use an extra capital payment to cut either your term or your instalment.",
];
const DELIVERABLES = [
  "Read the credit chapter and pass a comprehension check.",
  "Compute the true cost of a credit-card purchase across instalment plans.",
  "Build a full amortization table month by month.",
  "See how an 'Extra capital payment' reshapes your table.",
  "Research real Colombian rates and pass a final exam with a big exercise.",
];

/* ---- Lectura ---- */
const READING = [
  { h: "1. Credit is the mirror of saving" },
  { p: "In Week 3 you saw compound interest make your savings grow: the bank pays you for using your money. Credit is the exact opposite. It happens when you borrow money to buy something today that you can't — or don't want to — pay for in full right now." },
  { p: "When a bank gives you a loan or a credit card, they hand you purchasing power today in exchange for a promise: you'll repay the original amount you borrowed (the principal) plus a charge for using their money (the interest and fees) over a set time. Now the same interest math you learned works against you." },
  { h: "2. The words every borrower must know" },
  { p: "Principal (P) is the amount you borrow. Term (n) is how long you have to repay it, usually in months. The interest rate (r) is what the lender charges — in Colombia, consumer loans and cards quote a monthly rate (say 2.1% per month) next to its Effective Annual Rate (E.A.)." },
  { p: "The instalment (PMT) is your fixed monthly payment until the debt is gone. And the usury rate (tasa de usura) is the legal maximum a lender may charge, set each month by the Superintendencia Financiera — charging above it is illegal." },
  { h: "3. Credit cards vs consumer loans" },
  { p: "A credit card is revolving credit: a pre-approved limit you can reuse as you pay it back. The magic rule in Colombia: if you pay a purchase in 1 single instalment (1 cuota), most banks charge 0% interest — a free short-term loan for up to 30 days. But split it into 6, 12 or 24 instalments and interest starts from day one, at high card rates near the usury limit." },
  { p: "A consumer loan (crédito de consumo) drops a lump sum into your account for a specific purchase — a car, education, a repair — with a fixed schedule over a set term. These usually carry lower rates than cards, so for large, long-term needs they're often the cheaper choice." },
  { h: "4. The real cost of borrowing" },
  { p: "The total you pay back is always more than what you borrowed: Total cost = Principal + Total interest + Insurance/fees. Here's the trap. Buy a $1,200,000 console on a card at 2.2% monthly: in 1 instalment you pay $1,200,000 (no interest). In 12 instalments, about $1,378,000. In 24 instalments, about $1,557,000 — 30% extra for the same console." },
  { p: "Key takeaway: stretching the term lowers your monthly payment but dramatically raises the total interest you pay. A smaller cuota can quietly cost you far more." },
  { h: "5. The amortization table" },
  { p: "An amortization table (tabla de amortización) shows how every monthly payment splits between interest and capital. Most Colombian banks use the French system: your total payment (PMT) stays the same every month, but what's inside it shifts." },
  { p: "Each month the interest is charged on the balance you still owe: I = remaining balance × monthly rate. Whatever is left of your fixed payment goes to capital: C = PMT − I, and that's what actually shrinks your debt. Early on, the balance is high, so most of your payment is interest and little goes to capital. As the balance falls, interest shrinks and more of each payment attacks the principal — until it hits zero." },
];

/* término → significado en español */
const GLOSSARY = {
  "principal": "Capital — el monto original que pides prestado.",
  "term": "Plazo — cuánto tiempo tienes para pagar (en meses).",
  "interest rate": "Tasa de interés — el % que te cobra el prestamista por la plata.",
  "instalment": "Cuota — el pago fijo mensual hasta terminar la deuda.",
  "usury rate": "Tasa de usura — el máximo legal que un banco puede cobrar.",
  "amortization table": "Tabla de amortización — muestra cuánto de cada cuota va a interés y cuánto a capital.",
  "credit card": "Tarjeta de crédito — cupo rotativo; 1 cuota = 0% interés, diferido cobra intereses.",
  "consumer loan": "Crédito de consumo — un monto fijo con cuotas y, normalmente, tasa más baja que la tarjeta.",
};
const KEY_TERMS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);

/* ---- Comprensión (12 preguntas, estilo IELTS) ---- */
const CHECK = [
  { q: "How is credit the 'mirror' of saving?", correct: 0, feedback: "Saving: the bank pays you. Credit: you pay the bank.", options: ["When saving the bank pays you; with credit you pay the bank.", "Both always earn you money over time.", "Credit removes all interest from a purchase.", "Saving and credit are exactly the same thing."] },
  { q: "What is the 'principal' of a loan?", correct: 1, feedback: "The original amount you borrow.", options: ["The total interest you'll pay.", "The original amount you borrow.", "The monthly fee the bank charges.", "The legal maximum interest rate."] },
  { q: "In Colombia, paying a card purchase in 1 instalment usually means…", correct: 2, feedback: "1 cuota is typically 0% interest — a free short-term loan.", options: ["the highest possible interest.", "interest starting on day one.", "0% interest for up to 30 days.", "the purchase is cancelled."] },
  { q: "What is the 'tasa de usura'?", correct: 0, feedback: "The legal maximum rate a lender may charge.", options: ["The legal maximum interest rate allowed.", "The interest a savings account earns.", "The bank's monthly profit target.", "A tax added to every loan."] },
  { q: "Compared with credit cards, consumer loans usually have…", correct: 3, feedback: "Lower rates, better for large long-term needs.", options: ["much higher interest rates.", "no repayment schedule at all.", "0% interest always.", "lower interest rates."] },
  { q: "What happens to total interest when you stretch the term?", correct: 1, feedback: "Lower monthly payment, but much more total interest.", options: ["Total interest goes down.", "Monthly payment drops but total interest rises.", "Nothing changes.", "The principal disappears."] },
  { q: "In the French system, the monthly payment (PMT) is…", correct: 0, feedback: "It stays constant every month.", options: ["the same every month.", "different every month.", "zero after month one.", "equal to the interest only."] },
  { q: "How is each month's interest calculated?", correct: 2, feedback: "On the balance you still owe, times the monthly rate.", options: ["On the original principal every month.", "On the total of all future payments.", "On the remaining balance × monthly rate.", "On your income."] },
  { q: "What is the 'capital' portion of a payment?", correct: 1, feedback: "PMT minus interest — the part that reduces your debt.", options: ["The interest charged that month.", "PMT minus interest — what shrinks the debt.", "A fee added by the bank.", "The full monthly payment."] },
  { q: "Early in a loan, most of your payment goes to…", correct: 0, feedback: "Interest, because the balance is still high.", options: ["interest, because the balance is high.", "capital, because interest is tiny.", "insurance only.", "nothing — it's free."] },
  { q: "A $1,200,000 purchase costs ~$1,557,000 in 24 instalments. Why?", correct: 3, feedback: "The extra ~$357,000 is interest from stretching the term.", options: ["The store raised the price.", "A tax was added.", "The bank made an error.", "Interest piled up over 24 months."] },
  { q: "Best summary of this chapter?", correct: 2, feedback: "Credit is borrowed time — interest is its price, and the table shows where it goes.", options: ["Credit cards are always the cheapest option.", "Interest never matters if you pay monthly.", "Credit is borrowed money; interest is its price, split each month between interest and capital.", "Loans have no real cost."] },
];

/* ---- Ejercicio: costo real del crédito (pasos) ---- */
const COST_PROBLEMS = [
  {
    teach: {
      title: "Which rate do banks use — and how to handle it",
      body: "First, always turn a percent into a decimal: divide by 100. So 2.2% = 0.022, 1.5% = 0.015. Colombian cards and loans usually quote a MONTHLY rate, but you may also find quarterly, semi-annual or E.A. rates. For monthly instalments you need the MONTHLY rate — so convert whatever you find, exactly like in Week 3: first to E.A. with (1 + i)^m − 1, then to monthly with (1 + E.A.)^(1/12) − 1. The calculator below does this for you once you pick the right base.",
      example: "A card at 2.2% monthly → as E.A. that's (1.022)¹² − 1 ≈ 29.8% — which is why deferring is so expensive. If instead a lender gave you 8% quarterly, you'd first get E.A. = (1.08)⁴ − 1 ≈ 36% and then convert to monthly. Below you'll compute the month 1 interest, then the total cost across 12 and 24 instalments — use the calculator to check each step.",
    },
    scenario: "You buy a console for COP $1,200,000 on a credit card at 2.2% monthly. You compare paying in 1 vs 12 vs 24 instalments.",
    steps: [
      { type: "number", q: "In 12 instalments the monthly payment is $114,834. What's the month 1 interest? (P × monthly rate: 1,200,000 × 0.022)", answer: 26400, tol: 0.02, hint: "1,200,000 × 0.022", feedback: "1,200,000 × 0.022 = 26,400. Check it in the calculator: P=1200000, rate 2.2, monthly, n=12 → 'Month 1 interest'." },
      { type: "number", q: "12 instalments of $114,834. What's the TOTAL paid? (12 × 114,834)", answer: 1378008, tol: 0.01, hint: "12 × 114,834", feedback: "12 × 114,834 = 1,378,008." },
      { type: "number", q: "How much of that is interest? (total − price)", answer: 178008, tol: 0.02, hint: "1,378,008 − 1,200,000", feedback: "1,378,008 − 1,200,000 = 178,008 in interest." },
      { type: "number", q: "24 instalments of $64,883. Total paid? (24 × 64,883)", answer: 1557192, tol: 0.01, hint: "24 × 64,883", feedback: "24 × 64,883 = 1,557,192." },
      { type: "choice", q: "What did stretching from 12 to 24 instalments do?", options: ["Lowered the monthly payment but nearly doubled the interest.", "Made the console cheaper overall.", "Removed all interest."], correct: 0, feedback: "Smaller cuota, far bigger total interest — the classic trap." },
    ],
  },
  {
    teach: {
      title: "Two ways to read a loan",
      body: "PMT means 'pago mensual' — your fixed monthly payment. The calculator works BOTH ways. Mode 1 (I know the rate → find PMT): give it P, the rate and n, and it returns the payment and totals. Mode 2 (I know the PMT → find the rate): banks often show you only the monthly payment, so give it P, that PMT and n, and it works backwards to reveal the hidden monthly rate and its E.A. That's how you catch how expensive a loan really is.",
      example: "$2,000,000 for 24 months. Bank A tells you 'pay $96,426 a month'. Switch the calculator to 'find the rate', type P=2000000, PMT=96426, n=24 → it reveals ~1.2% monthly (~15.4% E.A.). Bank B says '$111,867 a month' → same trick reveals ~2.5% monthly (~34% E.A.). Now you can compare the real rates, not just the payments.",
    },
    scenario: "Two banks quote only a monthly payment for the same COP $2,000,000 over 24 months. Bank A: $96,426. Bank B: $111,867. Uncover their real rates with the calculator.",
    steps: [
      { type: "choice", q: "You only know the PMT. Which calculator mode do you need?", options: ["'I know the PMT → find the rate' (work backwards).", "'I know the rate → find PMT'.", "Neither — just multiply."], correct: 0, feedback: "When the rate is hidden, switch to the reverse mode." },
      { type: "number", q: "BANK A: mode 'find the rate', P=2000000, PMT=96426, n=24. What monthly rate (%) does it show? (one decimal)", answer: 1.2, tol: 0.15, hint: "Read 'Monthly rate'.", feedback: "≈ 1.2% monthly. You just recovered a rate the bank didn't show you." },
      { type: "number", q: "BANK B: same mode, PMT=111867, n=24. What monthly rate (%)? (one decimal)", answer: 2.5, tol: 0.2, hint: "Read 'Monthly rate' — ", feedback: "≈ 2.5% monthly — more than double Bank A's rate for the same money." },
      { type: "number", q: "Read Bank B's 'Total interest' from the calculator. Roughly how much is it?", answer: 684808, tol: 0.05, hint: "PMT × 24 − 2,000,000.", feedback: "About $684,808 in interest — vs ~$314,224 for Bank A." },
      { type: "choice", q: "The lesson?", options: ["A small gap in monthly payment hides a big gap in the real rate and total cost.", "The monthly payment tells you everything.", "Both banks cost the same."], correct: 0, feedback: "Always uncover the rate — the calculator turns a payment into the truth." },
    ],
  },
];

/* ---- Tabla de amortización interactiva (el estudiante construye cada fila) ---- */
const AMORT = {
  principal: 1000000,
  rate: 0.02,       // 2% mensual
  pmt: 262624,
  months: 4,
};

/* ---- Abono a capital: dos escenarios interactivos ---- */
const EXTRA_SCENARIOS = {
  term: {
    key: "term",
    title: "Abono that shortens your TERM",
    intro: "Same monthly payment, but you throw an extra amount at the capital. The debt dies faster and you pay less total interest. Watch three months: with vs without the extra payment.",
    loan: { balance: 1000000, rate: 0.02, pmt: 300000, extra: 200000 },
  },
  cuota: {
    key: "cuota",
    title: "Abono that lowers your CUOTA",
    intro: "Here you keep the same number of months, but after the abono the bank recalculates a smaller monthly payment. Same finish line, lighter payments.",
    loan: { balance: 1000000, rate: 0.02, pmt: 350000, extra: 200000 },
  },
};

/* ---- Mini examen final (mezcla + ejercicio grande) ---- */
const FINAL = [
  { q: "Credit gives you purchasing power today in exchange for…", correct: 0, feedback: "Repaying principal + interest over time.", options: ["repaying principal plus interest over time.", "a free gift from the bank.", "nothing at all.", "lowering your future income."] },
  { q: "A card purchase paid in 1 instalment in Colombia usually costs…", correct: 1, feedback: "0% interest — interest-free for ~30 days.", options: ["the most interest possible.", "0% interest.", "double the price.", "a fixed $50,000 fee."] },
  { q: "Stretching a loan's term makes the monthly payment ___ and total interest ___.", correct: 2, feedback: "Lower payment, higher total interest.", options: ["higher / lower.", "lower / lower.", "lower / higher.", "higher / higher."] },
  { q: "In the French system, month 1 interest on a $500,000 balance at 2% is…", correct: 0, feedback: "500,000 × 0.02 = 10,000.", options: ["$10,000.", "$20,000.", "$5,000.", "$2,000."] },
  { q: "If PMT is $132,700 and interest is $10,000, the capital paid is…", correct: 1, feedback: "132,700 − 10,000 = 122,700.", options: ["$142,700.", "$122,700.", "$10,000.", "$132,700."] },
  { q: "As a loan progresses, the interest portion of each payment…", correct: 2, feedback: "Falls, while the capital portion rises.", options: ["stays the same.", "keeps rising.", "falls over time.", "becomes the whole payment."] },
  { q: "A 2% monthly card rate as E.A. is about…", correct: 3, feedback: "(1.02)¹² − 1 ≈ 26.82%.", options: ["2%.", "24%.", "12%.", "26.82%."] },
  { q: "An 'Extra capital payment' saves interest because…", correct: 0, feedback: "A smaller balance is charged less interest.", options: ["interest is charged on the balance you owe.", "the bank rewards big spenders.", "it raises your credit limit.", "it cancels the loan instantly."] },
  { q: "Consumer loans vs credit cards: for a big long-term purchase…", correct: 1, feedback: "The loan's lower rate usually wins.", options: ["the card is almost always cheaper.", "the consumer loan is usually cheaper.", "they always cost the same.", "neither charges interest."] },
  { q: "Total cost of credit = principal + total interest + …", correct: 2, feedback: "Insurance and fees.", options: ["your salary.", "the usury rate.", "insurance and fees.", "nothing else."] },
  { q: "Bringing a future debt to present value uses…", correct: 3, feedback: "PV = FV ÷ (1 + r)ⁿ — the Week 3 tool, now on debt.", options: ["FV = PV(1+r)ⁿ.", "I = P·r·t.", "E.A. = (1+i)ᵐ−1.", "PV = FV ÷ (1+r)ⁿ."] },
  { q: "The single smartest habit from this week?", correct: 0, feedback: "Compare total cost and pay down principal early.", options: ["Compare total cost, avoid long deferrals, and Extra capital payment when you can.", "Always pick the smallest monthly payment.", "Only use credit cards for everything.", "Never pay more than the minimum."] },
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
function shuffleArr(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
function sample(arr, n) { return !n || n >= arr.length ? shuffleArr(arr) : shuffleArr(arr).slice(0, n); }

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
   QUIZ RUNNER (80% para pasar, reintento)
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
        <div className="reader-meta"><Clock size={15} strokeWidth={2.3} /> ~8 min read</div>
      </div>
      <article className="s1-reader">
        <span className="reader-tag">READING · B2 · CREDIT</span>
        <h1>Credit, Debt &amp; the Amortization Table</h1>
        <p className="reader-sub">The same interest you learned to love now works against you.</p>
        <div className="reader-terms">
          <span className="terms-label">Key words (tap for meaning):</span>
          {["principal", "term", "interest rate", "instalment", "usury rate", "amortization table", "credit card", "consumer loan"].map((t) => (
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
   CALCULADORA DE CRÉDITO (ayuda, pero NO regala: si eliges mal la base
   de la tasa o la periodicidad, el resultado sale mal a propósito)
   ===================================================================== */
function CreditCalc() {
  const [solveFor, setSolveFor] = useState("pmt"); // "pmt" = tengo la tasa, busco PMT | "rate" = tengo el PMT, busco la tasa
  const [P, setP] = useState("");
  const [rate, setRate] = useState("");            // se usa cuando solveFor === "pmt"
  const [rateBase, setRateBase] = useState("monthly");
  const [pmtIn, setPmtIn] = useState("");          // se usa cuando solveFor === "rate"
  const [n, setN] = useState("");

  const p = parseFloat(P || 0);
  const per = parseFloat(n || 0);
  const periodsPerYear = { monthly: 12, bimonthly: 6, quarterly: 4, semiannual: 2, annualEA: 1 };

  // Resuelve la tasa mensual por bisección a partir de P, PMT y n (Newton sería frágil aquí)
  const monthlyFromPmt = (P, PMT, N) => {
    if (!P || !PMT || !N || PMT * N <= P) return 0; // sin interés o datos inválidos
    let lo = 0, hi = 1; // 0% a 100% mensual
    for (let k = 0; k < 60; k++) {
      const mid = (lo + hi) / 2;
      const pmtMid = (P * mid) / (1 - Math.pow(1 + mid, -N));
      if (pmtMid > PMT) hi = mid; else lo = mid;
    }
    return (lo + hi) / 2;
  };

  let iMonthly = 0;
  if (solveFor === "pmt") {
    const raw = parseFloat(rate || 0) / 100;
    const m = periodsPerYear[rateBase];
    const ea = rateBase === "annualEA" ? raw : Math.pow(1 + raw, m) - 1;
    iMonthly = Math.pow(1 + ea, 1 / 12) - 1;
  } else {
    iMonthly = monthlyFromPmt(p, parseFloat(pmtIn || 0), per);
  }

  const ea = Math.pow(1 + iMonthly, 12) - 1;
  const pmt = solveFor === "pmt"
    ? (p && iMonthly && per ? (p * iMonthly) / (1 - Math.pow(1 + iMonthly, -per)) : 0)
    : parseFloat(pmtIn || 0);
  const totalPaid = pmt * per;
  const totalInterest = totalPaid - p;
  const firstInterest = p * iMonthly;

  return (
    <div className="fincalc">
      <div className="fincalc-head"><Calculator size={16} strokeWidth={2.3} /> Credit calculator</div>

      <div className="ccalc-mode">
        <button className={solveFor === "pmt" ? "on" : ""} onClick={() => setSolveFor("pmt")}>I know the rate → find PMT</button>
        <button className={solveFor === "rate" ? "on" : ""} onClick={() => setSolveFor("rate")}>I know the PMT → find the rate</button>
      </div>

      <div className="ccalc-inputs">
        <label>Amount P<input type="number" value={P} onChange={(e) => setP(e.target.value)} placeholder="1000000" /></label>
        {solveFor === "pmt" ? (
          <>
            <label>Rate (%)<input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="1.2" /></label>
            <label>Rate is…
              <select value={rateBase} onChange={(e) => setRateBase(e.target.value)}>
                <option value="monthly">monthly</option>
                <option value="bimonthly">bi-monthly</option>
                <option value="quarterly">quarterly</option>
                <option value="semiannual">semi-annual</option>
                <option value="annualEA">annual E.A.</option>
              </select>
            </label>
          </>
        ) : (
          <label className="ccalc-wide">Monthly payment PMT<input type="number" value={pmtIn} onChange={(e) => setPmtIn(e.target.value)} placeholder="12345" /></label>
        )}
        <label>Instalments n<input type="number" value={n} onChange={(e) => setN(e.target.value)} placeholder="24" /></label>
      </div>

      <div className="ccalc-warn"><AlertTriangle size={13} strokeWidth={2.4} /> {solveFor === "pmt"
        ? "Pick the rate base right — the calculator converts it to a monthly rate for you. Mislabel it and the PMT will be wrong."
        : "Give it the amount, the monthly payment and n — it works backwards to find the hidden monthly rate."}</div>

      <div className="fincalc-out">
        <div><span>Monthly rate</span><b>{(iMonthly * 100).toFixed(3)}%</b></div>
        <div><span>As Effective Annual (E.A.)</span><b>{(ea * 100).toFixed(2)}%</b></div>
        <div><span>Month 1 interest = P × i</span><b>{money(firstInterest)}</b></div>
        <div className="hi"><span>Monthly payment (PMT)</span><b>{money(pmt)}</b></div>
        <div><span>Total paid = PMT × n</span><b>{money(totalPaid)}</b></div>
        <div><span>Total interest</span><b>{money(totalInterest)}</b></div>
      </div>
      <p className="fincalc-tip">💡 Remember: a percent becomes a decimal by dividing by 100. 2% = 0.02, 2.2% = 0.022, 1.5% = 0.015.</p>
    </div>
  );
}

/* Calculadora básica (teclado): para multiplicaciones/restas rápidas de los ejercicios */
function BasicCalc() {
  const [expr, setExpr] = useState("");
  const [out, setOut] = useState("");
  const press = (t) => { setOut(""); setExpr((e) => e + t); };
  const clear = () => { setExpr(""); setOut(""); };
  const del = () => { setOut(""); setExpr((e) => e.slice(0, -1)); };
  const equals = () => {
    try {
      // solo dígitos y operadores básicos → seguro de evaluar
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
        {/* fila de utilidades */}
        <button className="bcalc-k util" onClick={clear}>C</button>
        <button className="bcalc-k util" onClick={del}>⌫</button>
        <button className="bcalc-k op" onClick={() => press("(")}>(</button>
        <button className="bcalc-k op" onClick={() => press(")")}>)</button>
        {/* números + operadores, layout clásico */}
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
      <p className="fincalc-tip" style={{ margin: "10px 0 0" }}>💡 Tip: 2% as a decimal is 0.02. So 1,000,000 × 0.02 = type <b>1000000 × 0.02</b>.</p>
    </div>
  );
}

/* =====================================================================
   STEP SET (problemas paso a paso, con la calculadora de crédito)
   ===================================================================== */
function StepSet({ title, emoji, problems, xp, calc = true, calcType = "credit", onSave, onExit }) {
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
    onSave({ done: true, xp }).finally(() => setSaving(false));
  };

  if (finished) return <Reward title="Solved! 🧮" subtitle="You worked out the real cost like a smart borrower." coins={xp} saving={saving} onExit={onExit} />;

  return (
    <div className="s1-start step-wrap">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className="start-head">
        <div className="start-ico"><Calculator size={22} strokeWidth={2.1} /></div>
        <div><h2>{emoji} {title}</h2><p>Problem {pi + 1} of {problems.length} · step {si + 1} of {problem.steps.length}</p></div>
      </div>

      {problem.teach && si === 0 && (
        <div className="s3-teach">
          <h3><Lightbulb size={18} strokeWidth={2.3} /> {problem.teach.title}</h3>
          <p>{problem.teach.body}</p>
          <p className="s3-teach-ex"><b>Worked example — </b>{problem.teach.example}</p>
        </div>
      )}
      {calc && <div className="fincalc-row">{calcType === "basic" ? <BasicCalc /> : <CreditCalc />}</div>}

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
              <input className={`start-input ${numError ? "err" : ""} ${answered ? "ok" : ""}`} type="text" inputMode="numeric" value={numInput}
                onChange={(e) => { setNumInput(e.target.value); setNumError(false); }} placeholder="Type your answer (numbers only)" disabled={answered} />
              {!answered && <button className="s1-btn primary" onClick={submitNumber}>Check</button>}
            </div>
            {numError && <p className="num-msg err">Not quite — recompute (watch the rate base!) and try again.</p>}
          </div>
        )}

        {answered && (
          <div className="quiz-feedback"><Lightbulb size={18} strokeWidth={2.2} />
            <span><b>Correct! </b>{step.feedback}</span>
          </div>
        )}

        <div className="quiz-nav">
          <button className="s1-btn ghost" onClick={onExit}>Save &amp; exit</button>
          <button className="s1-btn primary" onClick={next} disabled={!answered}>
            {isLastStep && isLastProblem ? "Finish" : isLastStep ? "Next problem" : "Next step"} <ChevronRight size={18} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}


/* Calculadora de ayuda para la tabla: el estudiante teclea el saldo y ve las tres cifras */
function AmortHelper({ rate, pmt }) {
  const [bal, setBal] = useState("");
  const b = parseFloat(bal || 0);
  const i = b ? Math.round(b * rate) : 0;
  const c = b ? Math.round(pmt - i) : 0;
  const end = b ? Math.max(0, Math.round(b - c)) : 0;
  return (
    <div className="fincalc">
      <div className="fincalc-head"><Calculator size={16} strokeWidth={2.3} /> Row helper</div>
      <p className="fincalc-tip" style={{ margin: "0 0 10px" }}>Type this month's <b>starting balance</b> and see the three numbers. Then type them into the row yourself.</p>
      <div className="fincalc-inputs" style={{ gridTemplateColumns: "1fr" }}>
        <label>Starting balance<input type="number" value={bal} onChange={(e) => setBal(e.target.value)} placeholder="1000000" /></label>
      </div>
      <div className="fincalc-out">
        <div><span>1. Interest = balance × {(rate * 100).toFixed(0)}%</span><b>{money(i)}</b></div>
        <div><span>2. Capital = PMT − interest</span><b>{money(c)}</b></div>
        <div className="hi"><span>3. Ending = balance − capital</span><b>{money(end)}</b></div>
      </div>
    </div>
  );
}

/* =====================================================================
   AMORTIZATION BUILDER · el estudiante construye la tabla fila por fila
   ===================================================================== */
function AmortBuilder({ onSave, onExit }) {
  const { principal, rate, pmt, months } = AMORT;
  const [rows, setRows] = useState([]);           // filas ya confirmadas
  const [interest, setInterest] = useState("");
  const [capital, setCapital] = useState("");
  const [endBal, setEndBal] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const k = rows.length;                            // mes actual (0-index)
  const startBal = k === 0 ? principal : rows[k - 1].end;
  const trueI = Math.round(startBal * rate);
  const trueC = Math.round(pmt - trueI);
  const trueEnd = Math.max(0, Math.round(startBal - trueC));
  const near = (v, t) => Math.abs(parseNum(v) - t) <= Math.max(2, t * 0.005);

  const submitRow = () => {
    if (!near(interest, trueI)) { setErr("Check the interest: it's the starting balance × monthly rate."); return; }
    if (!near(capital, trueC)) { setErr("Check the capital: it's PMT − interest."); return; }
    if (!near(endBal, trueEnd)) { setErr("Check the ending balance: starting balance − capital."); return; }
    setErr("");
    setRows([...rows, { start: startBal, i: trueI, c: trueC, end: trueEnd }]);
    setInterest(""); setCapital(""); setEndBal("");
  };
  const finish = () => { setSaving(true); setDone(true); onSave({ done: true, xp: XP.amort }).finally(() => setSaving(false)); };
  const allDone = rows.length >= months;

  if (done) return <Reward title="Table built! 📊" subtitle="You broke every payment into interest and capital — like a banker." coins={XP.amort} saving={saving} onExit={onExit} gold />;

  return (
    <div className="s1-start">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className="start-head">
        <div className="start-ico"><Table size={22} strokeWidth={2.1} /></div>
        <div><h2>Build the amortization table</h2><p>Fill each month yourself. The table only accepts a row when your three numbers are right.</p></div>
      </div>

      <div className="s3-teach">
        <h3><Lightbulb size={18} strokeWidth={2.3} /> How to fill each row (French system)</h3>
        <p>A loan is paid in equal monthly payments. Here the payment never changes: <b>PMT = {money(pmt)}</b> every single month. What changes is what's <i>inside</i> it. Each month has three steps, always in this order:</p>
        <p><b>Step 1 — Interest.</b> The bank charges interest only on what you still owe (the <b>starting balance</b>): interest = starting balance × {(rate * 100).toFixed(0)}% (that's × {rate}). <b>Step 2 — Capital.</b> Whatever is left of your fixed payment after interest goes to reduce the debt: capital = PMT − interest. <b>Step 3 — Ending balance.</b> Subtract that capital from what you owed: ending = starting balance − capital. <b>That ending balance becomes next month's starting balance</b> — that's the key link.</p>
        <p><b>Watch the pattern:</b> at the start the balance is big, so interest eats most of the payment and little goes to capital. As the balance shrinks, interest drops and more of each payment attacks the debt — until the last month leaves exactly $0.</p>
        <p className="s3-teach-ex"><b>Month 1, step by step:</b> starting balance = {money(principal)}. (1) interest = {money(principal)} × {rate} = {money(principal * rate)}. (2) capital = {money(pmt)} − {money(principal * rate)} = {money(pmt - principal * rate)}. (3) ending = {money(principal)} − {money(pmt - principal * rate)} = {money(principal - (pmt - principal * rate))}. Month 2 then STARTS from {money(principal - (pmt - principal * rate))}. Use the helper below to check each month, then type the numbers into the row.</p>
      </div>

      <div className="fincalc-row"><AmortHelper rate={rate} pmt={pmt} /></div>

      <div className="amort-loan">
        <span><b>Principal</b> {money(principal)}</span>
        <span><b>Monthly rate</b> {(rate * 100).toFixed(0)}%</span>
        <span><b>PMT</b> {money(pmt)}</span>
        <span><b>Term</b> {months} months</span>
      </div>

      <div className="amort-table">
        <div className="amort-row head">
          <span>Month</span><span>Starting</span><span>Interest</span><span>Capital</span><span>Ending</span>
        </div>
        {rows.map((r, idx) => (
          <div key={idx} className="amort-row filled">
            <span>{idx + 1}</span><span>{money(r.start)}</span><span>{money(r.i)}</span><span>{money(r.c)}</span><span>{money(r.end)}</span>
          </div>
        ))}
        {!allDone && (
          <div className="amort-row input">
            <span>{k + 1}</span>
            <span className="amort-fixed">{money(startBal)}</span>
            <input type="text" inputMode="numeric" value={interest} onChange={(e) => { setInterest(e.target.value); setErr(""); }} placeholder="interest" />
            <input type="text" inputMode="numeric" value={capital} onChange={(e) => { setCapital(e.target.value); setErr(""); }} placeholder="capital" />
            <input type="text" inputMode="numeric" value={endBal} onChange={(e) => { setEndBal(e.target.value); setErr(""); }} placeholder="ending" />
          </div>
        )}
      </div>

      {err && <p className="num-msg err" style={{ textAlign: "center" }}>{err}</p>}

      <div className="amort-hint">Row {Math.min(k + 1, months)} of {months} · PMT is always {money(pmt)}</div>

      <div className="start-foot" style={{ justifyContent: "space-between" }}>
        {!allDone
          ? <button className="s1-btn primary big" onClick={submitRow} disabled={!interest || !capital || !endBal}>Add this month <ChevronRight size={18} strokeWidth={2.4} /></button>
          : <span className="reader-done"><Check size={18} strokeWidth={3} /> Balance reached $0 — table complete!</span>}
        {allDone && <button className="s1-btn primary big" onClick={finish}>Finish <span className="coin-tag"><Coins size={15} /> +{XP.amort}</span></button>}
      </div>
    </div>
  );
}

/* =====================================================================
   ABONO A CAPITAL · construyes 2 filas (con y sin abono) y ves el ahorro
   ===================================================================== */
function ExtraBuilder({ onSave, onExit }) {
  const [mode, setMode] = useState(null);          // null → elegir | "term" | "cuota"
  const [step, setStep] = useState(0);             // 0 sin abono, 1 con abono
  const [rows, setRows] = useState([]);            // filas confirmadas [{label, interest, end}]
  const [iIn, setIIn] = useState("");
  const [eIn, setEIn] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const near = (v, t) => Math.abs(parseNum(v) - t) <= Math.max(2, t * 0.01);

  if (done) return <Reward title="Abono mastered! ⚡" subtitle="You saw an extra payment shrink both the balance and the interest." coins={XP.extra} saving={saving} onExit={onExit} gold />;

  /* ---- 1. elegir modalidad ---- */
  if (!mode) {
    return (
      <div className="s1-start">
        <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
        <div className="start-head">
          <div className="start-ico"><TrendingDown size={22} strokeWidth={2.1} /></div>
          <div><h2>Extra capital payment (abono a capital)</h2><p>An extra payment to your principal cuts interest at its root. You can use it two ways — try both.</p></div>
        </div>
        <div className="s3-teach">
          <h3><Lightbulb size={18} strokeWidth={2.3} /> The idea</h3>
          <p>Interest is charged on the balance you still owe. Pay extra <b>straight to capital</b> and the balance drops now, so <b>every future month</b> is charged less interest. The bank lets you choose what to do with that saving:</p>
          <p><b>① Reduce the term:</b> keep paying the same cuota → you finish sooner and save the most interest. <b>② Reduce the cuota:</b> keep the same number of months → your monthly payment goes down.</p>
        </div>
        <div className="extra-choice">
          <button className="plan-choice" onClick={() => setMode("term")}>
            <span className="plan-choice-ico"><Clock size={18} strokeWidth={2.1} /></span>
            <span className="plan-choice-text"><b>Reduce the term</b><span>Same cuota, fewer months, maximum interest saved.</span></span>
          </button>
          <button className="plan-choice" onClick={() => setMode("cuota")}>
            <span className="plan-choice-ico"><Wallet size={18} strokeWidth={2.1} /></span>
            <span className="plan-choice-text"><b>Reduce the cuota</b><span>Same months, a lighter monthly payment.</span></span>
          </button>
        </div>
      </div>
    );
  }

  const sc = EXTRA_SCENARIOS[mode];
  const { balance, rate, pmt, extra } = sc.loan;

  // Escenario SIN abono: interés = balance × rate, saldo final = balance − (pmt − interés)
  const noI = Math.round(balance * rate);
  const noEnd = Math.round(balance - (pmt - noI));
  // Escenario CON abono: pagas la cuota Y el abono este mes
  const balAfter = balance - extra;                 // el abono baja el capital de una
  const yesI = Math.round(balAfter * rate);         // el próximo interés ya es sobre el saldo menor
  const yesEnd = Math.round(balAfter - (pmt - yesI));
  const saved = noI - yesI;

  const target = step === 0
    ? { i: noI, end: noEnd, startBal: balance }
    : { i: yesI, end: yesEnd, startBal: balAfter };

  const submitRow = () => {
    if (!near(iIn, target.i)) { setErr("Interest = starting balance × " + (rate * 100).toFixed(0) + "%. Recheck."); return; }
    if (!near(eIn, target.end)) { setErr("Ending = starting balance − (PMT − interest). Recheck."); return; }
    setErr("");
    setRows([...rows, { label: step === 0 ? "Without abono" : "With abono", startBal: target.startBal, i: target.i, end: target.end }]);
    setIIn(""); setEIn("");
    if (step === 0) setStep(1);
  };
  const bothDone = rows.length >= 2;
  const finish = () => { setSaving(true); setDone(true); onSave({ done: true, xp: XP.extra }).finally(() => setSaving(false)); };

  return (
    <div className="s1-start">
      <button className="s1-btn ghost" onClick={() => setMode(null)}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className="start-head">
        <div className="start-ico">{mode === "term" ? <Clock size={22} strokeWidth={2.1} /> : <Wallet size={22} strokeWidth={2.1} />}</div>
        <div><h2>{sc.title}</h2><p>{sc.intro}</p></div>
      </div>

      <div className="s3-teach">
        <h3><Lightbulb size={18} strokeWidth={2.3} /> How to complete each row</h3>
        <p>
          You owe <b>{money(balance)}</b> at a <b>{(rate * 100).toFixed(0)}% monthly rate</b>, with a monthly payment of <b>{money(pmt)}</b>.
          First, complete the standard month (no extra payment). Then, complete the month <b>after paying an extra {money(extra)} toward the principal</b>, which reduces the balance to {money(balAfter)}.
        </p>
        <p>
          <b>Interest</b> = starting balance × {rate}. <b>Ending balance</b> = starting balance − (monthly payment − interest). Use the calculator below.
        </p>
        <p className="s3-teach-ex">
          <b>Row 1 (no extra payment):</b> interest = {money(balance)} × {rate} = {money(noI)}. Row 2 then starts from {money(balAfter)} because the extra payment already reduced that principal balance.
        </p>
      </div>

      <div className="fincalc-row"><BasicCalc /></div>

      <div className="extra-table">
        <div className="extra-row head"><span>Scenario</span><span>Starting</span><span>Interest</span><span>Ending</span></div>
        {rows.map((r, idx) => (
          <div key={idx} className={`extra-row filled ${idx === 1 ? "good" : ""}`}>
            <span>{r.label}</span><span>{money(r.startBal)}</span><span>{money(r.i)}</span><span>{money(r.end)}</span>
          </div>
        ))}
        {!bothDone && (
          <div className="extra-row input">
            <span>{step === 0 ? "Without abono" : "With abono"}</span>
            <span className="amort-fixed">{money(target.startBal)}</span>
            <input type="text" inputMode="numeric" value={iIn} onChange={(e) => { setIIn(e.target.value); setErr(""); }} placeholder="interest" />
            <input type="text" inputMode="numeric" value={eIn} onChange={(e) => { setEIn(e.target.value); setErr(""); }} placeholder="ending" />
          </div>
        )}
      </div>
      {err && <p className="num-msg err" style={{ textAlign: "center" }}>{err}</p>}

      {bothDone && (
        <div className="sim-verdict good">
          <TrendingDown size={18} strokeWidth={2.3} /> The extra {money(extra)} cut this month's interest from <b>{money(noI)}</b> to <b>{money(yesI)}</b> — you saved <b>{money(saved)}</b> this month alone, and {mode === "term" ? "by keeping the same cuota you'll finish sooner and save even more over the whole loan." : "the bank now recalculates a smaller cuota for the rest of the loan."}
        </div>
      )}

      <div className="start-foot" style={{ justifyContent: "space-between" }}>
        {!bothDone
          ? <button className="s1-btn primary big" onClick={submitRow} disabled={!iIn || !eIn}>Add this row <ChevronRight size={18} strokeWidth={2.4} /></button>
          : <span className="reader-done"><Check size={18} strokeWidth={3} /> Both scenarios done!</span>}
        {bothDone && <button className="s1-btn primary big" onClick={finish}>Finish <span className="coin-tag"><Coins size={15} /> +{XP.extra}</span></button>}
      </div>
    </div>
  );
}

/* =====================================================================
   RESEARCH · investiga tasas reales + simula (con la calculadora de crédito)
   ===================================================================== */
function Research({ existing, onSave, onExit }) {
  const [lender, setLender] = useState(existing?.lender || "");
  const [rate, setRate] = useState(existing?.rate || "");
  const [rateNote, setRateNote] = useState(existing?.rateNote || "");
  const [analysis, setAnalysis] = useState(existing?.analysis || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const MIN_NOTE = 15, MIN_AN = 35;
  const ready = lender.trim() && parseFloat(rate) > 0 && countWords(rateNote) >= MIN_NOTE && countWords(analysis) >= MIN_AN;
  const submit = () => { setSaving(true); setSaved(true); onSave({ lender, rate: parseFloat(rate), rateNote, analysis }).finally(() => setSaving(false)); };

  if (saved) return <Reward title="Real research done! 🔎" subtitle="You checked what borrowing actually costs in Colombia today." coins={XP.research} saving={saving} onExit={onExit} />;

  return (
    <div className="s1-start">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className="start-head">
        <div className="start-ico"><Search size={22} strokeWidth={2.1} /></div>
        <div><h2>Research real rates &amp; simulate</h2><p>Find what a real lender charges today, then simulate a loan with the calculator.</p></div>
      </div>

      <div className="s3-teach">
        <h3><Lightbulb size={18} strokeWidth={2.3} /> Your mission</h3>
        <p>Look up a real Colombian lender or fintech (a bank, Nu, Lulo, a cooperative, or a platform like <b>Sólventa</b>) and find the rate they charge for a consumer loan or credit card. The important detail: <b>which rate is it?</b> It might be monthly, bi-monthly, quarterly, semi-annual, or an Effective Annual (E.A.) rate — Colombian ads often show more than one. Write down the number AND its type.</p>
        <p>Don't worry if it's not monthly. The calculator below now takes any of those bases and converts it for you (it shows you the E.A. and the monthly rate it used) — exactly the conversions you practiced in Week 3. Just make sure you pick the matching option in the "Rate is…" menu.</p>
        <p className="s3-teach-ex"><b>Then simulate:</b> enter a realistic loan amount, the rate you found, its correct base, and a term. Watch the monthly payment — but focus on the number that really matters: the <b>total interest</b> you'd pay for that money.</p>
      </div>

      <div className="fincalc-row"><CreditCalc /></div>

      <div className="start-block">
        <h3><span className="step-n">1</span> What did you find?</h3>
        <p className="start-tip">Lender / product name:</p>
        <input className="start-input" value={lender} onChange={(e) => setLender(e.target.value)} placeholder="e.g. Nu Colombia — credit card" />
        <p className="start-tip" style={{ margin: "12px 0 4px" }}>The rate they charge (%):</p>
        <input className="start-input" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g. 2.3" />
        <p className="start-tip" style={{ margin: "12px 0 4px" }}>In English, is it monthly or E.A., and where did you find it? (min {MIN_NOTE} words)</p>
        <WordFieldLocal value={rateNote} onChange={setRateNote} min={MIN_NOTE} max={70} rows={3} placeholder="I found on … that the rate is … which is a … rate because …" />
      </div>

      <div className="start-block">
        <h3><span className="step-n">2</span> Analyze your simulation (in English)</h3>
        <p className="start-tip">Using the calculator: for a loan you'd realistically take, how much is the monthly payment and the total interest? Is it worth it? (min {MIN_AN} words)</p>
        <WordFieldLocal value={analysis} onChange={setAnalysis} min={MIN_AN} max={140} rows={5} placeholder="If I borrowed … at … for … months, my payment would be … and the total interest …" />
      </div>

      <div className="start-foot">
        <button className="s1-btn primary big" onClick={submit} disabled={!ready}>Finish research <span className="coin-tag"><Coins size={15} /> +{XP.research}</span></button>
      </div>
    </div>
  );
}

/* Campo con mínimo de palabras (local) */
function WordFieldLocal({ value, onChange, placeholder, min, max = 130, rows = 4 }) {
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
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Semana4 = ({ userData, API_URL, existingRow, onBack }) => {
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

  const doneCount = SECTION_KEYS.filter((k) => checklist[k]).length;
  const pct = Math.round((doneCount / TOTAL_SECTIONS) * 100);

  const persist = (nextChecklist, nextPoints, respPatch) => {
    respRef.current = { ...respRef.current, ...respPatch };
    const done = SECTION_KEYS.filter((k) => nextChecklist[k]).length;
    const newPct = Math.round((done / TOTAL_SECTIONS) * 100);
    const row = {
      Student_Key: userData.Student_Key, Semana: 4,
      Estado: done >= TOTAL_SECTIONS ? "completed" : "in_progress",
      Porcentaje: newPct,
      Puntos_Comportamiento: nextPoints.comportamiento,
      Puntos_Quizzes: nextPoints.quizzes,
      Puntos_Aprendi: nextPoints.aprendi,
      Checklist_JSON: JSON.stringify(nextChecklist),
      Respuestas_JSON: JSON.stringify(respRef.current),
    };
    const prev = store.semanas?.[4];
    dispatch({ type: "save_progreso", payload: row });
    fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "save_progreso", data: row }) })
      .catch((e) => { console.error("Error guardando Semana 4:", e); dispatch({ type: "rollback_progreso", payload: { Semana: 4, prev } }); });
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

  /* ---------- VISTAS ---------- */
  if (open === "reading") return (
    <div className="s1"><Reader done={!!checklist.reading} onExit={() => setOpen(null)}
      onFinish={() => { complete("reading", { comportamiento: XP.reading }, { reading: { at: new Date().toISOString() } }); setOpen(null); }} /></div>
  );
  if (open === "check") return (
    <div className="s1"><QuizRunner title="Reading check" emoji="🧠" questions={CHECK} pickCount={10} passThreshold={80} xpPerCorrect={XP.checkCorrect} xpComplete={0}
      onExit={() => setOpen(null)}
      onSave={(r) => complete("check", { quizzes: r.correct * XP.checkCorrect }, { check: { correct: r.correct, total: r.total, at: new Date().toISOString() } }, r.passed)} /></div>
  );
  if (open === "cost") return (
    <div className="s1"><StepSet title="The real cost of credit" problems={COST_PROBLEMS} xp={XP.cost}
      onExit={() => setOpen(null)}
      onSave={() => complete("cost", { aprendi: XP.cost }, { cost: { done: true, at: new Date().toISOString() } })} /></div>
  );
  if (open === "amort") return (
    <div className="s1"><AmortBuilder onExit={() => setOpen(null)}
      onSave={() => complete("amort", { aprendi: XP.amort }, { amort: { done: true, at: new Date().toISOString() } })} /></div>
  );
  if (open === "extra") return (
    <div className="s1"><ExtraBuilder onExit={() => setOpen(null)}
      onSave={() => complete("extra", { aprendi: XP.extra }, { extra: { done: true, at: new Date().toISOString() } })} /></div>
  );
  if (open === "research") return (
    <div className="s1"><Research existing={respRef.current?.research} onExit={() => setOpen(null)}
      onSave={(r) => complete("research", { comportamiento: XP.research }, { research: { ...r, at: new Date().toISOString() } })} /></div>
  );
  if (open === "final") return (
    <div className="s1"><QuizRunner title="Final exam" emoji="🏆" questions={FINAL} pickCount={10} passThreshold={80} xpPerCorrect={XP.finalCorrect} xpComplete={0}
      onExit={() => setOpen(null)}
      onSave={(r) => complete("final", { quizzes: r.correct * XP.finalCorrect }, { final: { correct: r.correct, total: r.total, at: new Date().toISOString() } }, r.passed)} /></div>
  );

  /* ---------- MENÚ ---------- */
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

      <div className="s1-hero s4-hero">
        <span className="s1-tag"><CreditCard size={14} strokeWidth={2.6} /> WEEK 4 · CREDIT &amp; DEBT</span>
        <h1>When interest works against you</h1>
        <p>You learned to make interest grow your money. Now see how banks charge it — cards, loans, the amortization table, and how to fight back with an extra capital payment.</p>
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
        <Section k="reading" icon={<BookOpen size={22} strokeWidth={2.1} />} title="Reading: Credit &amp; Debt" desc="How credit works, cards vs loans, and the amortization table."
          topics={["Principal & rate", "Cards vs loans", "Amortization"]}
          cta={btn("reading", "Read", <span className="coin-tag"><Coins size={14} /> +{XP.reading}</span>)} />

        <Section k="check" icon={<GraduationCap size={22} strokeWidth={2.1} />} title="Reading check" desc="10 random questions from the chapter — pass with 80%."
          cta={btn("check", <><Play size={16} strokeWidth={2.6} /> Start</>, <span className="coin-tag"><Coins size={14} /> +{10 * XP.checkCorrect}</span>)} />

        <Section k="cost" icon={<Percent size={22} strokeWidth={2.1} />} title="The real cost of credit" desc="Compute total cost across instalment plans and between lenders."
          topics={["Monthly rate", "Total interest", "Rate shopping"]}
          cta={btn("cost", <><Play size={16} strokeWidth={2.6} /> Solve</>, <span className="coin-tag"><Coins size={14} /> +{XP.cost}</span>)} />

        <Section k="amort" icon={<Table size={22} strokeWidth={2.1} />} title="Build the amortization table ⭐" desc="Fill every month yourself: interest vs capital until the balance hits $0."
          topics={["French system", "Interest vs capital", "Balance → 0"]}
          cta={btn("amort", <><Play size={16} strokeWidth={2.6} /> Build</>, <span className="coin-tag"><Coins size={14} /> +{XP.amort}</span>)} />

        <Section k="extra" icon={<TrendingDown size={22} strokeWidth={2.1} />} title="Extra capital payment" desc="See how an 'Extra capital payment' cuts interest — and your term or cuota."
          topics={["Abono a capital", "Reduce term", "Reduce cuota"]}
          cta={btn("extra", <><Play size={16} strokeWidth={2.6} /> Solve</>, <span className="coin-tag"><Coins size={14} /> +{XP.extra}</span>)} />

        <Section k="research" icon={<Search size={22} strokeWidth={2.1} />} title="Research real rates" desc="Find real Colombian lender rates and simulate a loan."
          topics={["Real rates", "Sólventa / banks", "Simulate"]}
          cta={btn("research", <><Play size={16} strokeWidth={2.6} /> Start</>, <span className="coin-tag"><Coins size={14} /> +{XP.research}</span>)} />

        <Section k="final" icon={<Trophy size={22} strokeWidth={2.1} />} title="Final exam" desc="10 mixed questions plus a big exercise — pass with 80%."
          cta={btn("final", <><Play size={16} strokeWidth={2.6} /> Start</>, <span className="coin-tag"><Coins size={14} /> +{10 * XP.finalCorrect}</span>)} />
      </div>
    </div>
  );
};