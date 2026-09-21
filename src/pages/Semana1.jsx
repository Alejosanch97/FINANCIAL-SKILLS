import React, { useState, useMemo, useRef } from "react";
import {
  ArrowLeft, Target, BookOpen, Video, PenLine, Check, X, Coins, Trophy,
  Sparkles, Zap, Clock, GraduationCap, ChevronRight, Lightbulb, Play,
  PiggyBank, ShoppingCart, Plus, Trash2, Wallet, TrendingUp,
} from "lucide-react";
import "../Styles/semana1.css";

/* =====================================================================
   SEMANA 1 · MONEY MINDSET & YOUR STARTING POINT
   Diagnóstico + fundamentos. 6 actividades → conocimiento + evidencia.
   Todo se guarda en Progreso_Semanas (Respuestas_JSON) vía save_progreso.
   ===================================================================== */

const VIDEO_ID = "zIbNJCSCEjk";
const VIDEO_URL = "https://www.youtube.com/watch?v=" + VIDEO_ID;
const VIDEO_EMBED = "https://www.youtube.com/embed/" + VIDEO_ID;

const SECTION_KEYS = ["warmup", "reading", "video", "sort", "check", "start"];
const TOTAL_SECTIONS = SECTION_KEYS.length;

/* ---- Monedas por actividad ---- */
const XP = {
  warmupComplete: 10, warmupCorrect: 3,   // comportamiento + quizzes
  reading: 20,                            // comportamiento
  videoWatch: 10, videoCorrect: 5,        // comportamiento + quizzes
  sortCorrect: 3,                         // quizzes
  checkCorrect: 5,                        // quizzes
  startBase: 30, startBonus: 15,          // aprendi + comportamiento
};

/* =====================================================================
   CONTENIDO
   ===================================================================== */
const OBJECTIVES = [
  "Explain why we save and invest.",
  "Understand how inflation changes what your money can buy.",
  "Tell apart a need, a want and saving.",
  "Build your first monthly budget.",
  "Set a clear, measurable savings goal (a SMART goal).",
];
const DELIVERABLES = [
  "Take a warm-up quiz and a knowledge check.",
  "Read a text and watch a video about money and inflation.",
  "Sort real cases into saving vs spending.",
  "Build a budget with your own income and expenses.",
  "Discover your financial starting point (your \"you are here\").",
];

/* ---- Warm-up quiz (pre-reading) — corregido: sin objetivos repetidos ---- */
const WARMUP = [
  { q: "You keep COP $1,000,000 at home for five years. What is the main financial risk?",
    options: ["The money loses its numerical value automatically.", "It may lose purchasing power because prices can rise.", "Cash has an expiration date and disappears.", "It automatically becomes an investment."],
    correct: 1, feedback: "Cash keeps its number, but rising prices can lower what it buys." },
  { q: "Which of these best describes saving?",
    options: ["Using all your income to buy assets.", "Setting aside part of your income for a future purpose.", "Borrowing money to buy more now.", "Spending only on essentials."],
    correct: 1, feedback: "Saving = setting aside part of your income for later." },
  { q: "What is the main difference between saving and investing?",
    options: ["Saving always beats investing.", "Investing puts money into assets expecting a return.", "Saving is only for wealthy people.", "Investing means keeping money in cash."],
    correct: 1, feedback: "Investing puts money into assets hoping for a return." },
  { q: "Prices rise 6% in a year and your savings grow only 3%. What happens to your purchasing power?",
    options: ["It increases.", "It stays exactly the same.", "It decreases.", "Inflation can't affect it."],
    correct: 2, feedback: "If prices rise faster than savings, purchasing power falls." },
  { q: "Which is the clearest measurable financial goal?",
    options: ["\"I want more money.\"", "\"I want to be successful.\"", "\"I want to save COP $3,000,000 in 12 months.\"", "\"I want to stop worrying about money.\""],
    correct: 2, feedback: "A clear goal has an amount and a deadline." },
  { q: "Why might someone invest instead of keeping all their money in cash?",
    options: ["Investments can generate returns and help keep purchasing power.", "Investments can never lose value.", "Investing removes all risk.", "Cash always loses its numerical value."],
    correct: 0, feedback: "Investing can help money keep or grow its purchasing power." },
  { q: "What is the main reason to split your spending into \"needs\" and \"wants\"?",
    options: ["To remove all fun from your life.", "To see what you can cut fast to save more or in an emergency.", "To pay taxes first.", "Because it is an accounting rule."],
    correct: 1, feedback: "Needs are fixed (rent, food); wants are flexible (going out) — knowing them helps you save." },
  { q: "When is the best moment to save each month?",
    options: ["Only when there is money left at the end.", "Right when you receive your money, before spending (pay yourself first).", "Only when you want to buy something soon.", "Saving can't really be planned."],
    correct: 1, feedback: "\"Pay yourself first\": save as soon as the money arrives, then spend the rest." },
];

/* ---- Lectura ---- */
const READING = [
  { p: "Imagine receiving COP $1,000,000 today. At first glance, having one million pesos seems simple: you have the money, you can see it in your account, and you know you can use it. But what if you leave it untouched for several years? Would one million pesos still represent the same financial value in the future?" },
  { p: "The answer is not necessarily. One of the most important ideas in personal finance is that the amount of money we have and the purchasing power of that money are not always the same thing. Saving and investing both help people prepare for the future, but they serve different purposes." },
  { h: "Saving: Preparing for the Future" },
  { p: "Saving means setting aside part of your income for a future purpose instead of spending it now. People save to build an emergency fund, pay for education, buy a vehicle, travel, or simply feel more secure." },
  { p: "For example, Maria earns COP $2,500,000 per month. After her essential expenses, she saves COP $250,000 every month for a postgraduate program. After twelve months she will have COP $3,000,000, if she doesn't withdraw any money." },
  { p: "This shows something important: saving can turn a general intention into a plan. \"I want more money\" is an intention. \"I want to save COP $3,000,000 in twelve months\" is a measurable goal, with an amount, a deadline and a regular action you can track." },
  { h: "Money vs. Purchasing Power" },
  { p: "To go deeper we need to understand inflation: a general rise in the prices of goods and services over time. When prices rise, the same amount of money usually buys fewer things." },
  { p: "Suppose a basket of products costs COP $100,000 today. If prices rise 6% next year, the same basket costs about COP $106,000. If your money grows only 3%, your balance is bigger, but your purchasing power has not kept up." },
  { p: "This is the difference between nominal value (the number you have) and real value (what that money can actually buy). A growing bank balance should not automatically be read as growing wealth." },
  { h: "Why Saving Alone May Not Be Enough" },
  { p: "Saving gives you liquidity and prepares you for expected and unexpected costs. But keeping all your money in cash, or in an account with a return below inflation, can be a long-term problem: the purchasing power of those savings may slowly decline." },
  { p: "This doesn't make saving a bad decision — it's usually essential. The point is to know what you want your money to do, and choose a strategy that fits your goal and your time horizon." },
  { h: "What Does Investing Mean?" },
  { p: "Investing means putting money into an asset with the expectation that it may generate a return or grow over time — for example bonds, shares or investment funds. The goal is not only to keep money aside, but to make it work." },
  { p: "However, returns are not guaranteed. Investments can lose value, and each one carries different levels of risk, liquidity and potential return. Investing is not a shortcut to getting rich quickly. A responsible decision weighs risk, return, time and your objectives." },
  { h: "Setting a Financial Goal" },
  { p: "A goal is more useful when it is measurable. Carlos wants COP $6,000,000 for a postgraduate program in two years. Instead of \"save as much as possible,\" he calculates: COP $6,000,000 ÷ 24 months = COP $250,000 per month." },
  { p: "That gives him a starting point he can check against his income and expenses. But it isn't a guarantee: returns and inflation can change the final number, so a good goal needs monitoring and adjustment." },
  { h: "Two Strategies That Work Together" },
  { p: "Saving and investing are not opposites. You might save for an emergency fund because you need quick access, and invest part of your long-term money to pursue growth. The key is understanding the purpose of each decision." },
  { p: "Financial responsibility is not about accumulating the largest possible number. It is about making informed decisions over time. The most important question is not only \"How much money do I have?\", but \"What will my money be able to do for me in the future?\"" },
];
const KEY_TERMS = ["purchasing power", "nominal value", "real value", "inflation", "emergency fund", "measurable goal", "liquidity", "return"];

/* ---- Video quiz (listening / inflación) ---- */
const VIDEO_Q = [
  { q: "In simple words, what is inflation?", options: ["A tax the bank charges you.", "A general rise in prices over time.", "A special savings account.", "A fall in prices over time."], correct: 1, feedback: "Inflation is a general rise in prices — your money buys a bit less each year." },
  { q: "What happens to cash kept 'under the mattress' during inflation?", options: ["It grows on its own.", "It slowly loses purchasing power.", "It stays exactly the same in real value.", "It disappears."], correct: 1, feedback: "The number stays, but what it can buy shrinks over time." },
  { q: "If prices rise faster than your savings grow, your money…", options: ["buys more than before.", "buys about the same.", "buys less than before.", "is not affected."], correct: 2, feedback: "When inflation beats your interest, real value falls." },
  { q: "What is one way to protect your money from inflation?", options: ["Keep it all as cash.", "Spend it immediately.", "Invest it so it can grow above inflation.", "Ignore prices completely."], correct: 2, feedback: "Investing wisely can help your money grow faster than prices." },
];

/* ---- Sort: Saving or Spending? ---- */
const SORT_ITEMS = [
  { label: "Putting COP $50,000 aside for a future goal", answer: "saving" },
  { label: "Buying the newest videogame", answer: "spending" },
  { label: "Building an emergency fund", answer: "saving" },
  { label: "A monthly streaming subscription", answer: "spending" },
  { label: "An automatic transfer to your savings account", answer: "saving" },
  { label: "Eating fast food every day", answer: "spending" },
  { label: "Keeping money for a laptop you'll buy next year", answer: "saving" },
  { label: "New sneakers you don't really need", answer: "spending" },
];

/* ---- Post-reading knowledge check ---- */
const CHECK = [
  { q: "What is the main purpose of the text?", options: ["To prove investing is always better than saving.", "To focus only on accumulating wealth.", "To explain how saving, investing, inflation and purchasing power connect.", "To compare specific investment products."], correct: 2, feedback: "The text links saving, investing, inflation and purchasing power." },
  { q: "Why can saving in cash be insufficient over the long term?", options: ["Cash loses its numerical value every year.", "Inflation can reduce what the money buys.", "Banks charge you for holding cash.", "Savings can't be used for goals."], correct: 1, feedback: "Cash below inflation slowly loses purchasing power." },
  { q: "\"Purchasing power\" is closest in meaning to:", options: ["The money a person earns.", "The ability of money to buy goods and services.", "The debt a person can get.", "The ability to raise a salary."], correct: 1, feedback: "Purchasing power = what your money can buy." },
  { q: "What can be inferred about inflation?", options: ["More money always means more wealth.", "The number of pesos and their real value are not necessarily the same.", "Inflation only affects investors.", "Inflation makes saving impossible."], correct: 1, feedback: "More pesos doesn't always mean more real value." },
  { q: "Why does the author separate nominal accumulation from real growth?", options: ["To show a bigger number isn't always bigger purchasing power.", "To prove saving beats investing.", "To say goals are useless.", "To claim inflation raises everyone's income."], correct: 0, feedback: "A bigger number isn't always bigger wealth." },
  { q: "A student saves monthly but the return stays below inflation. The best conclusion?", options: ["The student saves nothing.", "The student saves nominally, but real purchasing power may fall.", "The student will lose all the money.", "The student is investing successfully."], correct: 1, feedback: "Money nominally grows, but real value can fall below inflation." },
  { q: "Why does the author stress a measurable savings goal?", options: ["Measurable goals make progress easier to track and adjust.", "They remove the need to invest.", "They guarantee success.", "You can't save without a bank."], correct: 0, feedback: "Measurable goals let you track and adjust progress." },
  { q: "Best meaning of: \"A growing balance should not automatically be interpreted as growing wealth.\"", options: ["More money in an account doesn't always mean a better real position.", "You should never let your balance grow.", "Wealth is only physical cash.", "Your position always improves when the balance grows."], correct: 0, feedback: "More money in the account isn't always improved real wealth." },
  { q: "Maria wants COP $6,000,000 in 24 months with no savings yet. Best strategy?", options: ["Save an undefined amount when she has extra.", "Set a monthly target, track it, and factor in inflation and returns.", "Keep the goal secret to avoid pressure.", "Wait and save it all in the last month."], correct: 1, feedback: "Set a target, track it, and factor in inflation and returns." },
  { q: "Which statement would the author most likely agree with?", options: ["Saving and investing are identical.", "A plan should weigh how much is saved and what it can buy in the future.", "Inflation doesn't matter if there's a deadline.", "Investment returns always beat inflation."], correct: 1, feedback: "A plan should weigh the amount and its future purchasing power." },
  { q: "\"Preserve\" is closest in meaning to:", options: ["Protect or maintain.", "Borrow.", "Spend rapidly.", "Replace completely."], correct: 0, feedback: "'Preserve' means to protect or maintain." },
  { q: "Which best summarizes the relationship among saving, investing, inflation and goals?", options: ["Saving creates wealth automatically; investing is only for the rich.", "Goals are met just by accumulating the biggest number.", "Saving sets money aside; investing helps it keep or grow value; measurable goals give direction.", "Investing removes the need to save."], correct: 2, feedback: "Saving sets money aside; investing helps it keep/grow value; goals give direction." },
];

/* ---- Diagnóstico "¿dónde estoy?" (no se califica, captura estado) ---- */
const TRACK_OPTIONS = [
  "I keep no record — I just check my balance.",
  "I look at my statements at the end of the month.",
  "I note fixed costs, but variable ones slip away.",
  "I keep a detailed record in an app or sheet.",
];
const COVER_OPTIONS = ["Less than 1 month", "1 to 3 months", "3 to 6 months", "More than 6 months"];

/* =====================================================================
   HELPERS de lectura
   ===================================================================== */
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const TERMS_RE = new RegExp("(" + KEY_TERMS.map(escapeRe).join("|") + ")", "gi");
function bionicWord(word, key) {
  const cut = Math.max(1, Math.ceil(word.length * 0.42));
  return <React.Fragment key={key}><b>{word.slice(0, cut)}</b>{word.slice(cut)}</React.Fragment>;
}
function bionicText(text, bionic, base) {
  if (!bionic) return text;
  return text.split(/(\s+)/).map((chunk, i) => (/\s+/.test(chunk) || chunk === "" ? chunk : bionicWord(chunk, base + "-" + i)));
}
function renderReadingText(text, bionic) {
  return text.split(TERMS_RE).map((part, i) => {
    if (!part) return null;
    if (KEY_TERMS.some((t) => t.toLowerCase() === part.toLowerCase()))
      return <mark className="hl" key={i}>{bionicText(part, bionic, "m" + i)}</mark>;
    return <React.Fragment key={i}>{bionicText(part, bionic, "t" + i)}</React.Fragment>;
  });
}
const money = (n) => "COP $" + (parseInt(n || 0, 10)).toLocaleString("es-CO");

/* =====================================================================
   REWARD (pantalla de recompensa reutilizable)
   ===================================================================== */
function Reward({ title, subtitle, coins, saving, onExit, gold }) {
  return (
    <div className="s1-reward">
      <div className={`reward-badge ${gold ? "gold" : ""}`}>{gold ? <Sparkles size={40} strokeWidth={2.1} /> : <Trophy size={40} strokeWidth={2.1} />}</div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      <div className="reward-coins"><Coins size={20} strokeWidth={2.3} /> +{coins} coins</div>
      <p className="reward-note">These coins power your Fluency Meter on the dashboard.</p>
      {saving ? <span className="s1-saving">Saving your progress…</span>
              : <button className="s1-btn primary" onClick={onExit}>Continue <ChevronRight size={18} strokeWidth={2.4} /></button>}
    </div>
  );
}

/* =====================================================================
   QUIZ RUNNER (warm-up, video, knowledge check)
   ===================================================================== */
function QuizRunner({ title, emoji, questions, soft, xpPerCorrect, xpComplete, onSave, onExit }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coins, setCoins] = useState(0);

  const q = questions[current];
  const answered = answers[current] !== undefined;
  const isLast = current === questions.length - 1;
  const pick = (i) => { if (!answered) setAnswers({ ...answers, [current]: i }); };

  const next = async () => {
    if (!isLast) { setCurrent(current + 1); return; }
    const correct = questions.reduce((a, qq, i) => a + (answers[i] === qq.correct ? 1 : 0), 0);
    const xp = correct * xpPerCorrect + xpComplete;
    setCoins(xp); setSaving(true); setFinished(true);
    await onSave({ correct, total: questions.length, answers, xp });
    setSaving(false);
  };

  if (finished) {
    const correct = questions.reduce((a, qq, i) => a + (answers[i] === qq.correct ? 1 : 0), 0);
    return <Reward title={correct === questions.length ? "Perfect!" : "Nice work!"} subtitle={`You got ${correct} / ${questions.length} correct.`} coins={coins} saving={saving} onExit={onExit} />;
  }

  return (
    <div className="s1-quiz">
      <div className="quiz-top"><h2>{emoji} {title}</h2><span className="quiz-count">{current + 1} / {questions.length}</span></div>
      <div className="quiz-track"><i style={{ width: `${((current + (answered ? 1 : 0)) / questions.length) * 100}%` }} /></div>
      <p className="quiz-q">{q.q}</p>
      <div className="quiz-options">
        {q.options.map((opt, i) => {
          let cls = "quiz-opt";
          if (answered) { if (i === q.correct) cls += " correct"; else if (i === answers[current]) cls += soft ? " chosen" : " wrong"; }
          return (
            <button key={i} className={cls} onClick={() => pick(i)} disabled={answered}>
              <span className="opt-key">{String.fromCharCode(65 + i)}</span>
              <span className="opt-text">{opt}</span>
              {answered && i === q.correct && <Check size={18} strokeWidth={3} className="opt-tick" />}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="quiz-feedback"><Lightbulb size={18} strokeWidth={2.2} />
          <span><b>{soft ? "Good thinking. " : answers[current] === q.correct ? "Correct! " : "Not quite. "}</b>{q.feedback}</span>
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
  const [bionic, setBionic] = useState(false);
  return (
    <div>
      <div className="reader-bar">
        <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
        <div className="reader-meta"><Clock size={15} strokeWidth={2.3} /> ~7 min read</div>
        <button className={`speed-toggle ${bionic ? "on" : ""}`} onClick={() => setBionic(!bionic)}><Zap size={15} strokeWidth={2.6} /> Speed read {bionic ? "on" : "off"}</button>
      </div>
      <article className={`s1-reader ${bionic ? "bionic" : ""}`}>
        <span className="reader-tag">READING · B2</span>
        <h1>Why Save and Invest?</h1>
        <p className="reader-sub">Building financial security over time.</p>
        <div className="reader-terms">
          <span className="terms-label">Key words:</span>
          <span title="What your money can actually buy">purchasing power</span>
          <span title="A general rise in prices over time">inflation</span>
          <span title="The number of pesos you have">nominal value</span>
          <span title="What that money can buy after prices change">real value</span>
          <span title="A goal with an amount and a deadline">measurable goal</span>
        </div>
        <div className="reader-body">
          {READING.map((b, i) => (b.h ? <h2 key={i}>{b.h}</h2> : <p key={i}>{renderReadingText(b.p, bionic)}</p>))}
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
   VIDEO LESSON (embed + quiz)
   ===================================================================== */
function VideoLesson({ onSave, onExit }) {
  return (
    <div>
      <div className="reader-bar">
        <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
        <a className="speed-toggle" href={VIDEO_URL} target="_blank" rel="noreferrer"><Video size={15} strokeWidth={2.4} /> Open on YouTube</a>
      </div>
      <div className="video-frame"><iframe src={VIDEO_EMBED} title="How inflation eats your savings" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
      <p className="video-hint">🎧 Watch the video, then answer to earn your coins.</p>
      <QuizRunner title="Video check" emoji="🎬" questions={VIDEO_Q} xpPerCorrect={XP.videoCorrect} xpComplete={XP.videoWatch} onSave={onSave} onExit={onExit} />
    </div>
  );
}

/* =====================================================================
   SORT · Saving or Spending?
   ===================================================================== */
function SortGame({ onSave, onExit }) {
  const [choices, setChoices] = useState({});
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coins, setCoins] = useState(0);

  const choose = (i, val) => { if (choices[i] === undefined) setChoices({ ...choices, [i]: val }); };
  const allDone = Object.keys(choices).length === SORT_ITEMS.length;
  const correct = SORT_ITEMS.reduce((a, it, i) => a + (choices[i] === it.answer ? 1 : 0), 0);

  const finish = async () => {
    const xp = correct * XP.sortCorrect;
    setCoins(xp); setSaving(true); setFinished(true);
    await onSave({ correct, total: SORT_ITEMS.length, choices, xp });
    setSaving(false);
  };

  if (finished) return <Reward title={correct === SORT_ITEMS.length ? "Sorted it all!" : "Good sorting!"} subtitle={`You classified ${correct} / ${SORT_ITEMS.length} correctly.`} coins={coins} saving={saving} onExit={onExit} />;

  return (
    <div className="s1-sort">
      <div className="reader-bar"><button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button></div>
      <div className="sort-head">
        <h2>💰 Saving or Spending?</h2>
        <p>Tap the right label for each case. <b>Saving</b> keeps money for later; <b>spending</b> uses it now.</p>
      </div>
      <div className="sort-list">
        {SORT_ITEMS.map((it, i) => {
          const picked = choices[i];
          const ok = picked === it.answer;
          return (
            <div key={i} className={`sort-item ${picked ? (ok ? "ok" : "no") : ""}`}>
              <span className="sort-label">{it.label}</span>
              <div className="sort-btns">
                <button className={`sort-btn save ${picked === "saving" ? "on" : ""}`} onClick={() => choose(i, "saving")} disabled={!!picked}><PiggyBank size={15} strokeWidth={2.3} /> Saving</button>
                <button className={`sort-btn spend ${picked === "spending" ? "on" : ""}`} onClick={() => choose(i, "spending")} disabled={!!picked}><ShoppingCart size={15} strokeWidth={2.3} /> Spending</button>
              </div>
              {picked && <span className={`sort-mark ${ok ? "ok" : "no"}`}>{ok ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}</span>}
            </div>
          );
        })}
      </div>
      <div className="sort-foot">
        <span className="sort-count">{Object.keys(choices).length} / {SORT_ITEMS.length} sorted</span>
        <button className="s1-btn primary" onClick={finish} disabled={!allDone}>Finish <ChevronRight size={18} strokeWidth={2.4} /></button>
      </div>
    </div>
  );
}

/* =====================================================================
   STARTING POINT · presupuesto + diagnóstico + meta (entregable ⭐)
   ===================================================================== */
function StartingPoint({ existing, onSave, onExit }) {
  const [income, setIncome] = useState(existing?.income || "");
  const [expenses, setExpenses] = useState(existing?.expenses || []);
  const [eName, setEName] = useState("");
  const [eAmount, setEAmount] = useState("");
  const [eType, setEType] = useState("need");
  const [track, setTrack] = useState(existing?.track ?? "");
  const [cover, setCover] = useState(existing?.cover ?? "");
  const [goal, setGoal] = useState(existing?.goal || "");
  const [goalAmount, setGoalAmount] = useState(existing?.goalAmount || "");
  const [goalMonths, setGoalMonths] = useState(existing?.goalMonths || "");
  const [reflection, setReflection] = useState(existing?.reflection || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [coins, setCoins] = useState(0);

  const inc = parseInt(income || 0, 10);
  const needs = expenses.filter((e) => e.type === "need").reduce((a, e) => a + e.amount, 0);
  const wants = expenses.filter((e) => e.type === "want").reduce((a, e) => a + e.amount, 0);
  const capacity = inc - needs - wants;
  const savePct = inc > 0 ? Math.round((capacity / inc) * 100) : 0;
  const goalMonthly = goalAmount && goalMonths ? Math.round(parseInt(goalAmount, 10) / parseInt(goalMonths, 10)) : 0;

  const addExpense = () => {
    const amt = parseInt(eAmount || 0, 10);
    if (!eName.trim() || amt <= 0) return;
    setExpenses([...expenses, { name: eName.trim(), amount: amt, type: eType }]);
    setEName(""); setEAmount(""); setEType("need");
  };
  const removeExpense = (idx) => setExpenses(expenses.filter((_, i) => i !== idx));

  const ready = inc > 0 && expenses.length >= 1 && track !== "" && cover !== "" && goal.trim() && goalAmount && goalMonths;

  const pctOf = (v) => (inc > 0 ? Math.max(0, Math.min(100, (v / inc) * 100)) : 0);

  const submit = async () => {
    const xp = XP.startBase + XP.startBonus;
    setCoins(xp); setSaving(true);
    await onSave({ income: inc, expenses, needs, wants, capacity, savePct, track, cover, goal, goalAmount, goalMonths, goalMonthly, reflection, xp });
    setSaving(false); setSaved(true);
  };

  if (saved) return <Reward title="Your starting point is set! 🎉" subtitle="You finished Week 1 and you now know exactly where you stand." coins={coins} saving={saving} onExit={onExit} gold />;

  return (
    <div className="s1-start">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className="start-head">
        <div className="start-ico"><Wallet size={22} strokeWidth={2.1} /></div>
        <div><h2>Your starting point</h2><p>Build your budget, then discover where your money stands today.</p></div>
      </div>

      {/* 1 · Ingreso */}
      <div className="start-block">
        <h3><span className="step-n">1</span> Your monthly money</h3>
        <p className="start-tip">How much money do you get per month? (allowance, help from your parents, a small job…)</p>
        <input className="start-input" type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="e.g. 200000" />
      </div>

      {/* 2 · Gastos */}
      <div className="start-block">
        <h3><span className="step-n">2</span> Your expenses</h3>
        <p className="start-tip">Add what you spend. Mark each one as a <b>need</b> (you must pay it) or a <b>want</b> (nice to have).</p>
        <div className="exp-add">
          <input className="start-input" value={eName} onChange={(e) => setEName(e.target.value)} placeholder="Expense (e.g. bus, snacks)" />
          <input className="start-input sm" type="number" value={eAmount} onChange={(e) => setEAmount(e.target.value)} placeholder="COP" />
          <div className="type-toggle">
            <button className={eType === "need" ? "on need" : ""} onClick={() => setEType("need")}>Need</button>
            <button className={eType === "want" ? "on want" : ""} onClick={() => setEType("want")}>Want</button>
          </div>
          <button className="exp-add-btn" onClick={addExpense}><Plus size={18} strokeWidth={2.6} /></button>
        </div>
        {expenses.length > 0 && (
          <div className="exp-list">
            {expenses.map((e, i) => (
              <div key={i} className="exp-row">
                <span className={`exp-tag ${e.type}`}>{e.type}</span>
                <span className="exp-name">{e.name}</span>
                <span className="exp-amt">{money(e.amount)}</span>
                <button className="exp-del" onClick={() => removeExpense(i)}><Trash2 size={15} strokeWidth={2.2} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3 · Resultado del presupuesto */}
      {inc > 0 && (
        <div className={`budget-result ${capacity < 0 ? "over" : ""}`}>
          <div className="budget-bar">
            <span className="seg needs" style={{ width: `${pctOf(needs)}%` }} title="Needs" />
            <span className="seg wants" style={{ width: `${pctOf(wants)}%` }} title="Wants" />
            <span className="seg save" style={{ width: `${pctOf(Math.max(0, capacity))}%` }} title="Savings" />
          </div>
          <div className="budget-legend">
            <span><i className="dot needs" /> Needs {money(needs)}</span>
            <span><i className="dot wants" /> Wants {money(wants)}</span>
            <span><i className="dot save" /> Can save {money(Math.max(0, capacity))}</span>
          </div>
          <div className="budget-capacity">
            {capacity >= 0
              ? <><TrendingUp size={18} strokeWidth={2.3} /> You can save <b>{money(capacity)}</b> per month — that's <b>{savePct}%</b> of your money.</>
              : <><span className="warn">⚠️</span> You're spending <b>{money(-capacity)}</b> more than you get. Try cutting a <b>want</b>.</>}
          </div>
        </div>
      )}

      {/* 4 · Diagnóstico "¿dónde estoy?" */}
      <div className="start-block">
        <h3><span className="step-n">3</span> Where you stand</h3>
        <p className="start-tip">How do you track your money right now?</p>
        <div className="diag-options">
          {TRACK_OPTIONS.map((o, i) => (
            <button key={i} className={`diag-opt ${track === i ? "on" : ""}`} onClick={() => setTrack(i)}>{o}</button>
          ))}
        </div>
        <p className="start-tip">If your money stopped today, how long could you cover your basic needs with your savings?</p>
        <div className="diag-chips">
          {COVER_OPTIONS.map((o, i) => (
            <button key={i} className={`diag-chip ${cover === i ? "on" : ""}`} onClick={() => setCover(i)}>{o}</button>
          ))}
        </div>
      </div>

      {/* 5 · Meta de ahorro */}
      <div className="start-block">
        <h3><span className="step-n">4</span> Your first savings goal</h3>
        <div className="goal-grid">
          <input className="start-input wide" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="What are you saving for? (e.g. a bike)" />
          <input className="start-input" type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} placeholder="Amount (COP)" />
          <input className="start-input" type="number" value={goalMonths} onChange={(e) => setGoalMonths(e.target.value)} placeholder="In how many months?" />
        </div>
        {goalMonthly > 0 && (
          <div className="goal-calc">🎯 To reach {money(goalAmount)} in {goalMonths} months, save <b>{money(goalMonthly)}</b> per month.
            {capacity >= 0 && goalMonthly > capacity && <span className="goal-warn"> That's more than you can save now — pick a longer deadline or a smaller amount.</span>}
          </div>
        )}
      </div>

      {/* 6 · Micro-reflexión */}
      <div className="start-block">
        <h3><span className="step-n">5</span> One quick thought</h3>
        <p className="start-tip">What surprised you about your budget? (1–2 sentences, in English)</p>
        <textarea className="start-input" rows={3} value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="I was surprised that…" />
      </div>

      <div className="start-foot">
        {saving ? <span className="s1-saving">Saving…</span>
                : <button className="s1-btn primary big" onClick={submit} disabled={!ready}>Finish Week 1 <span className="coin-tag"><Coins size={15} /> +{XP.startBase + XP.startBonus}</span></button>}
      </div>
    </div>
  );
}

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Semana1 = ({ userData, API_URL, existingRow, onBack, onSaved }) => {
  const initChecklist = useMemo(() => { try { return existingRow?.Checklist_JSON ? JSON.parse(existingRow.Checklist_JSON) : {}; } catch { return {}; } }, [existingRow]);
  const initResp = useMemo(() => { try { return existingRow?.Respuestas_JSON ? JSON.parse(existingRow.Respuestas_JSON) : {}; } catch { return {}; } }, [existingRow]);

  const [checklist, setChecklist] = useState(initChecklist);
  const respRef = useRef(initResp);
  const [points, setPoints] = useState({
    comportamiento: parseFloat(existingRow?.Puntos_Comportamiento || 0),
    quizzes: parseFloat(existingRow?.Puntos_Quizzes || 0),
    aprendi: parseFloat(existingRow?.Puntos_Aprendi || 0),
  });
  const [open, setOpen] = useState(null);

  const doneCount = SECTION_KEYS.filter((k) => checklist[k]).length;
  const pct = Math.round((doneCount / TOTAL_SECTIONS) * 100);

  const persist = async (nextChecklist, nextPoints, respPatch) => {
    respRef.current = { ...respRef.current, ...respPatch };
    const done = SECTION_KEYS.filter((k) => nextChecklist[k]).length;
    const newPct = Math.round((done / TOTAL_SECTIONS) * 100);
    try {
      await fetch(API_URL, { method: "POST", body: JSON.stringify({
        action: "save_progreso",
        data: {
          Student_Key: userData.Student_Key, Semana: 1,
          Estado: done >= TOTAL_SECTIONS ? "completed" : "in_progress",
          Porcentaje: newPct,
          Puntos_Comportamiento: nextPoints.comportamiento,
          Puntos_Quizzes: nextPoints.quizzes,
          Puntos_Aprendi: nextPoints.aprendi,
          Checklist_JSON: JSON.stringify(nextChecklist),
          Respuestas_JSON: JSON.stringify(respRef.current),
        },
      }) });
      if (onSaved) onSaved();
    } catch (e) { console.error("Error guardando Semana 1:", e); }
  };

  const complete = async (key, addPoints, respPatch) => {
    const already = !!checklist[key];
    const nextChecklist = { ...checklist, [key]: true };
    const nextPoints = already ? points : {
      comportamiento: points.comportamiento + (addPoints.comportamiento || 0),
      quizzes: points.quizzes + (addPoints.quizzes || 0),
      aprendi: points.aprendi + (addPoints.aprendi || 0),
    };
    setChecklist(nextChecklist); setPoints(nextPoints);
    await persist(nextChecklist, nextPoints, respPatch);
  };

  /* ---------- VISTAS ---------- */
  if (open === "warmup") return (
    <div className="s1"><QuizRunner title="Warm-up quiz" emoji="🎯" questions={WARMUP} soft xpPerCorrect={XP.warmupCorrect} xpComplete={XP.warmupComplete}
      onExit={() => setOpen(null)}
      onSave={(r) => complete("warmup", { quizzes: r.correct * XP.warmupCorrect, comportamiento: XP.warmupComplete }, { warmup: { correct: r.correct, total: r.total, answers: r.answers, at: new Date().toISOString() } })} /></div>
  );
  if (open === "video") return (
    <div className="s1"><VideoLesson onExit={() => setOpen(null)}
      onSave={(r) => complete("video", { quizzes: r.correct * XP.videoCorrect, comportamiento: XP.videoWatch }, { video: { correct: r.correct, total: r.total, answers: r.answers, at: new Date().toISOString() } })} /></div>
  );
  if (open === "sort") return (
    <div className="s1"><SortGame onExit={() => setOpen(null)}
      onSave={(r) => complete("sort", { quizzes: r.correct * XP.sortCorrect }, { sort: { correct: r.correct, total: r.total, choices: r.choices, at: new Date().toISOString() } })} /></div>
  );
  if (open === "check") return (
    <div className="s1"><QuizRunner title="Knowledge check" emoji="🧠" questions={CHECK} xpPerCorrect={XP.checkCorrect} xpComplete={0}
      onExit={() => setOpen(null)}
      onSave={(r) => complete("check", { quizzes: r.correct * XP.checkCorrect }, { check: { correct: r.correct, total: r.total, answers: r.answers, at: new Date().toISOString() } })} /></div>
  );
  if (open === "reading") return (
    <div className="s1"><Reader done={!!checklist.reading} onExit={() => setOpen(null)}
      onFinish={async () => { await complete("reading", { comportamiento: XP.reading }, { reading: { at: new Date().toISOString() } }); setOpen(null); }} /></div>
  );
  if (open === "start") return (
    <div className="s1"><StartingPoint existing={respRef.current?.start} onExit={() => setOpen(null)}
      onSave={(r) => complete("start", { aprendi: XP.startBase, comportamiento: XP.startBonus }, { start: { ...r, at: new Date().toISOString() } })} /></div>
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

      <div className="s1-hero">
        <span className="s1-tag"><Target size={14} strokeWidth={2.6} /> WEEK 1 · MONEY MINDSET</span>
        <h1>Where does your money stand?</h1>
        <p>Learn why we save and invest, build your first budget, and find out exactly where you stand today.</p>
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
        <Section k="warmup" icon={<Target size={22} strokeWidth={2.1} />} title="Warm-up quiz" desc="Check what you already know before you start."
          cta={btn("warmup", <><Play size={16} strokeWidth={2.6} /> Play</>, <span className="coin-tag"><Coins size={14} /> +{XP.warmupComplete}+</span>)} />

        <Section k="reading" icon={<BookOpen size={22} strokeWidth={2.1} />} title="Reading: Why Save and Invest?" desc="A short B2 text with speed-read mode and key words."
          topics={["Purchasing power", "Inflation", "Nominal vs real value"]}
          cta={btn("reading", "Read", <span className="coin-tag"><Coins size={14} /> +{XP.reading}</span>)} />

        <Section k="video" icon={<Video size={22} strokeWidth={2.1} />} title="Video: How inflation eats your savings" desc="Watch, then answer 4 quick questions."
          cta={btn("video", <><Play size={16} strokeWidth={2.6} /> Watch</>, <span className="coin-tag"><Coins size={14} /> +{VIDEO_Q.length * XP.videoCorrect + XP.videoWatch}</span>)} />

        <Section k="sort" icon={<PiggyBank size={22} strokeWidth={2.1} />} title="Saving or Spending?" desc="Sort 8 real cases and lock in the concept."
          topics={["Saving", "Spending", "Needs vs wants"]}
          cta={btn("sort", <><Play size={16} strokeWidth={2.6} /> Sort</>, <span className="coin-tag"><Coins size={14} /> +{SORT_ITEMS.length * XP.sortCorrect}</span>)} />

        <Section k="check" icon={<GraduationCap size={22} strokeWidth={2.1} />} title="Knowledge check" desc="Prove what you understood from the reading."
          cta={btn("check", <><Play size={16} strokeWidth={2.6} /> Start</>, <span className="coin-tag"><Coins size={14} /> +{CHECK.length * XP.checkCorrect}</span>)} />

        <Section k="start" icon={<Wallet size={22} strokeWidth={2.1} />} title="Your starting point ⭐" desc="Build your budget, set a goal and see where you stand."
          topics={["Budget", "Savings goal", "You are here"]}
          cta={btn("start", "Build", <span className="coin-tag"><Coins size={14} /> +{XP.startBase + XP.startBonus}</span>)} />
      </div>
    </div>
  );
};