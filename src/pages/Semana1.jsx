import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft, Target, BookOpen, Video, Check, X, Coins, Trophy,
  Sparkles, Zap, Clock, GraduationCap, ChevronRight, Lightbulb, Play,
  PiggyBank, ShoppingCart, Plus, Trash2, Wallet, TrendingUp, Compass,
} from "lucide-react";
import "../Styles/semana1.css";
import useGlobalReducer from "../hooks/useGlobalReducer"; // ajusta la ruta si tu archivo del hook está en otro lado

/* =====================================================================
   SEMANA 1 · MONEY MINDSET & YOUR STARTING POINT
   Diagnóstico + fundamentos. 6 actividades → conocimiento + evidencia.
   Todo se guarda en Progreso_Semanas (Respuestas_JSON) vía save_progreso.
   ===================================================================== */

const VIDEO_URL = "https://res.cloudinary.com/k44zr7ap/video/upload/v1790085135/videoplayback.mp4";

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
  {
    q: "You keep COP $1,000,000 at home for five years. What is the main financial risk?",
    options: ["The money loses its numerical value automatically.", "It may lose purchasing power because prices can rise.", "Cash has an expiration date and disappears.", "It automatically becomes an investment."],
    correct: 1, feedback: "Cash keeps its number, but rising prices can lower what it buys."
  },
  {
    q: "Which of these best describes saving?",
    options: ["Using all your income to buy assets.", "Setting aside part of your income for a future purpose.", "Borrowing money to buy more now.", "Spending only on essentials."],
    correct: 1, feedback: "Saving = setting aside part of your income for later."
  },
  {
    q: "What is the main difference between saving and investing?",
    options: ["Saving always beats investing.", "Investing puts money into assets expecting a return.", "Saving is only for wealthy people.", "Investing means keeping money in cash."],
    correct: 1, feedback: "Investing puts money into assets hoping for a return."
  },
  {
    q: "Prices rise 6% in a year and your savings grow only 3%. What happens to your purchasing power?",
    options: ["It increases.", "It stays exactly the same.", "It decreases.", "Inflation can't affect it."],
    correct: 2, feedback: "If prices rise faster than savings, purchasing power falls."
  },
  {
    q: "Which is the clearest measurable financial goal?",
    options: ["\"I want more money.\"", "\"I want to be successful.\"", "\"I want to save COP $3,000,000 in 12 months.\"", "\"I want to stop worrying about money.\""],
    correct: 2, feedback: "A clear goal has an amount and a deadline."
  },
  {
    q: "Why might someone invest instead of keeping all their money in cash?",
    options: ["Investments can generate returns and help keep purchasing power.", "Investments can never lose value.", "Investing removes all risk.", "Cash always loses its numerical value."],
    correct: 0, feedback: "Investing can help money keep or grow its purchasing power."
  },
  {
    q: "What is the main reason to split your spending into \"needs\" and \"wants\"?",
    options: ["To remove all fun from your life.", "To see what you can cut fast to save more or in an emergency.", "To pay taxes first.", "Because it is an accounting rule."],
    correct: 1, feedback: "Needs are fixed (rent, food); wants are flexible (going out) — knowing them helps you save."
  },
  {
    q: "When is the best moment to save each month?",
    options: ["Only when there is money left at the end.", "Right when you receive your money, before spending (pay yourself first).", "Only when you want to buy something soon.", "Saving can't really be planned."],
    correct: 1, feedback: "\"Pay yourself first\": save as soon as the money arrives, then spend the rest."
  },
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
/* término (en inglés) → significado / traducción en español */
const GLOSSARY = {
  "purchasing power": "Poder adquisitivo — lo que tu dinero realmente puede comprar.",
  "inflation": "Inflación — la subida general de los precios con el tiempo.",
  "nominal value": "Valor nominal — el número de pesos que tienes (la cifra).",
  "real value": "Valor real — lo que ese dinero puede comprar después de la inflación.",
  "emergency fund": "Fondo de emergencia — dinero guardado para imprevistos.",
  "measurable goal": "Meta medible — una meta con un monto y una fecha claros.",
  "liquidity": "Liquidez — qué tan rápido puedes usar tu dinero sin perder valor.",
  "return": "Rendimiento — lo que gana tu dinero cuando lo inviertes.",
};
const KEY_TERMS = Object.keys(GLOSSARY);

/* ---- Video quiz (listening / inflación) ---- */
const VIDEO_Q = [
  { q: "In simple words, what is inflation?", correct: 1, feedback: "Inflation is a general rise in prices — your money buys a bit less each year.", options: ["A special fee your bank charges on savings.", "A general rise in prices across the economy.", "A type of high-interest savings account.", "A steady fall in prices over the years."] },
  { q: "What happens to cash kept 'under the mattress' during inflation?", correct: 1, feedback: "The number stays, but what it can buy shrinks over time.", options: ["It quietly grows in value on its own.", "It slowly loses what it can actually buy.", "It keeps exactly the same real value.", "It suddenly disappears within a year."] },
  { q: "If prices rise faster than your savings grow, your money…", correct: 2, feedback: "When inflation beats your interest, real value falls.", options: ["ends up buying more than it did before.", "keeps buying roughly the same as before.", "buys less than it did before.", "is completely unaffected by the change."] },
  { q: "One way to protect your money from inflation is to…", correct: 2, feedback: "Investing wisely can help your money grow faster than prices.", options: ["hold every peso of it as physical cash.", "spend all of it as quickly as you can.", "invest it so it can grow above inflation.", "ignore prices and never check them."] },
];

/* ---- Preguntas adicionales del video (Johnny Harris) ---- */
const NUEVAS_PREGUNTAS_VIDEO = [
  { q: "According to the video, what happens when the government increases stimulus checks and loans during a crisis?", options: ["People stop buying non-essential items.", "Overall demand rises quickly because people have extra money to spend.", "Prices immediately fall across all retail stores.", "Businesses reduce their output to save costs."], correct: 1, feedback: "When extra money is distributed, spending and demand rise faster than goods can be produced." },
  { q: "Why couldn't businesses keep up with the high demand created after the pandemic stimulus?", options: ["No one was willing to buy products.", "Global supply chain disruptions made it harder to manufacture and ship goods.", "Central banks forced factories to lower production.", "Businesses ran out of physical cash to operate."], correct: 1, feedback: "Pandemic restrictions damaged supply chains, making it difficult to deliver products to meet high demand." },
  { q: "What is the primary role of the Federal Reserve (the Fed) as described in the video?", options: ["To maximize profits like a commercial bank.", "To print infinite cash for all citizens.", "To oversee the economy, keep employment high, and keep prices stable.", "To set the prices for consumer products directly."], correct: 2, feedback: "The central bank acts as a 'puppet master' ensuring steady economic growth, high employment, and price stability." },
  { q: "How does lowering interest rates affect borrowing and spending?", options: ["It encourages people and businesses to borrow and spend more money.", "It forces people to put all their money into high-yield savings.", "It makes loans more expensive and discourages investments.", "It completely stops consumer spending."], correct: 0, feedback: "Lower interest rates make loans cheaper, encouraging spending and borrowing across the economy." },
  { q: "Why does the central bank raise interest rates when inflation gets too high?", options: ["To make the central bank more profitable.", "To cool down spending and borrowing by making loans more expensive.", "To encourage people to spend their money as fast as possible.", "To increase the total cash supply in the market."], correct: 1, feedback: "Higher rates make borrowing costlier, which slows down excessive spending and helps bring prices down." },
  { q: "What risk does the economy face if spending drops too sharply after raising interest rates?", options: ["Hyperinflation", "Economic recession or slowdown", "Immediate doubling of salaries", "Complete elimination of taxes"], correct: 1, feedback: "If spending drops too fast, businesses lose customers, lay off workers, and the economy can slip into a recession." },
  { q: "Why can small, predictable doses of inflation actually be a good sign for an economy?", options: ["It means prices double every single month.", "It signals that the economy is growing and expanding over time.", "It shows that cash is becoming obsolete.", "It stops consumers from buying imported goods."], correct: 1, feedback: "Low, stable inflation reflects healthy economic growth and increasing activity over time." },
  { q: "What extreme situation in Venezuela was mentioned in the video to illustrate out-of-control inflation?", options: ["Paper cash became so worthless that people used it as raw material for crafts.", "The central bank replaced all physical money with gold bars.", "Stores stopped using money and only accepted trading items.", "Prices remained frozen for over ten years."], correct: 0, feedback: "When hyperinflation hit, currency lost its purchasing power to the point where crafting items with cash was worth more than spending it." },
  { q: "If an annual inflation rate is 8%, what effectively happens to a $100 bill by the end of the year?", options: ["Its physical value automatically increases to $108.", "Its purchasing power is diluted, buying roughly 8% less than before.", "It loses its legal tender status entirely.", "It buys exactly the same amount of goods."], correct: 1, feedback: "Inflation dilutes purchasing power: the nominal $100 remains, but its real buying value drops." },
  { q: "Why is modern fiat money described in the video as being based on 'human psychology'?", options: ["Its value is backed line-by-line by physical gold bars.", "It only holds value because people collectively trust and believe it does.", "Prices are set directly by government workers each morning.", "Central banks guarantee that prices will never change."], correct: 1, feedback: "Modern money is not tied to gold; its value relies on public trust in its stability." },
];
const VIDEO_POOL = [...VIDEO_Q, ...NUEVAS_PREGUNTAS_VIDEO];

/* ---- Sort: Saving or Spending? ---- */

const SORT_ITEMS = [
  { label: "Rounding up every purchase and moving the change to savings", answer: "saving", why: "The money is set aside for later — that's saving, even in tiny amounts." },
  { label: "Buying sneakers on a 50% discount you didn't plan for", answer: "spending", why: "A discount still means money leaves you now. A cheaper purchase is still a purchase." },
  { label: "Leaving your bonus in the bank instead of touching it", answer: "saving", why: "You're keeping it for the future instead of using it today." },
  { label: "Prepaying a full year of a streaming service", answer: "spending", why: "You pay now to consume something — the size of the payment doesn't make it saving." },
  { label: "Auto-transferring 10% of your allowance the day it arrives", answer: "saving", why: "\"Pay yourself first\": you save before you spend the rest." },
  { label: "Upgrading your phone while the old one still works", answer: "spending", why: "It's a want you consume now, not money kept for later." },
  { label: "Keeping cash aside for a laptop you'll buy next year", answer: "saving", why: "Money reserved for a future goal is saving, even if you'll spend it eventually." },
  { label: "Eating out because you 'saved' by skipping breakfast", answer: "spending", why: "Skipping one meal to spend on another isn't saving — nothing was set aside." },
];

/* ---- Post-reading knowledge check ---- */
const CHECK = [
  { q: "What is the main purpose of the text?", correct: 1, feedback: "The text links saving, investing, inflation and purchasing power.", options: ["To prove that investing always beats saving over time.", "To explain how saving, investing, inflation and value connect.", "To compare specific investment products you can buy today.", "To show that a bigger balance always means more wealth."] },
  { q: "Why can saving in cash fall short over the long term?", correct: 1, feedback: "Cash below inflation slowly loses purchasing power.", options: ["Because banks quietly charge a fee for holding your cash.", "Because inflation can lower what that money is able to buy.", "Because cash slowly loses its printed numerical value.", "Because saved money can never be used toward a goal."] },
  { q: "\"Purchasing power\" is closest in meaning to:", correct: 1, feedback: "Purchasing power = what your money can buy.", options: ["the total amount of money a person earns each month.", "the ability of money to buy goods and services.", "the amount of debt a person is allowed to take on.", "the power to demand a higher salary at work."] },
  { q: "What can be inferred about inflation?", correct: 1, feedback: "More pesos doesn't always mean more real value.", options: ["Having more pesos always means having more real wealth.", "The number of pesos and their real value can differ.", "Inflation only affects people who invest their money.", "Inflation makes saving completely pointless for anyone."] },
  { q: "Why does the author separate nominal accumulation from real growth?", correct: 0, feedback: "A bigger number isn't always bigger buying power.", options: ["To show a bigger number isn't always bigger buying power.", "To prove that saving will always beat investing safely.", "To argue that setting financial goals is a waste of time.", "To claim inflation raises every person's income equally."] },
  { q: "A student saves monthly but the return stays below inflation. Best conclusion?", correct: 1, feedback: "Money grows in numbers, but real value can fall below inflation.", options: ["The student is effectively saving nothing at all.", "The student saves in numbers, but real value may fall.", "The student will lose every peso that was saved.", "The student is actually investing quite successfully."] },
  { q: "Why does the author stress a measurable savings goal?", correct: 0, feedback: "Measurable goals let you track and adjust progress.", options: ["It makes progress easier to track and adjust over time.", "It removes any need to ever invest your money.", "It guarantees the goal will always be reached.", "It proves you can't save without a bank account."] },
  { q: "Best meaning of \"A growing balance isn't automatically growing wealth\"?", correct: 1, feedback: "More money in the account isn't always a better real position.", options: ["You should avoid letting your account balance grow.", "More money in an account isn't always a better position.", "Real wealth is only the physical cash you can hold.", "Your position improves whenever the balance goes up."] },
  { q: "Maria wants COP $6,000,000 in 24 months with no savings yet. Best strategy?", correct: 1, feedback: "Set a target, track it, and factor in inflation and returns.", options: ["Save an undefined amount whenever she happens to have extra.", "Set a monthly target, track it, and factor in inflation.", "Keep the goal secret so she avoids feeling any pressure.", "Wait and try to save the whole amount in the final month."] },
  { q: "Which statement would the author most likely agree with?", correct: 1, feedback: "A plan should weigh the amount and its future purchasing power.", options: ["Saving and investing are essentially the same thing.", "A plan should weigh how much is saved and its future value.", "Inflation stops mattering once a deadline is set.", "Investment returns will always outpace inflation."] },
  { q: "\"Preserve\" is closest in meaning to:", correct: 0, feedback: "'Preserve' means to protect or maintain.", options: ["to protect or keep something as it is.", "to borrow something for a short time.", "to spend something as fast as possible.", "to replace something with a new version."] },
  { q: "Best summary of saving, investing, inflation and goals?", correct: 2, feedback: "Saving sets money aside; investing helps it hold value; goals give direction.", options: ["Saving builds wealth on its own; investing is only for the rich.", "Goals are reached simply by piling up the biggest number.", "Saving sets money aside; investing helps it hold value; goals guide it.", "Investing fully removes any real need to save money."] },
  { q: "What does Maria's example mainly show?", correct: 1, feedback: "It turns a vague wish into a concrete monthly plan.", options: ["That postgraduate programs are always too expensive.", "How a general intention becomes a trackable monthly plan.", "That saving only works for people with high salaries.", "That saving twelve months is never worth it."] },
  { q: "In the COP $100,000 basket example, why does 3% growth not fully protect the buyer?", correct: 2, feedback: "3% growth is below the 6% price rise, so real value falls.", options: ["Because 3% growth is not allowed by banks.", "Because the basket price never actually changes.", "Because prices rose 6%, faster than the 3% growth.", "Because baskets are not affected by inflation."] },
  { q: "According to the text, what does liquidity mean for your savings?", correct: 0, feedback: "Liquidity is how fast you can access and use your money.", options: ["How quickly you can access and use your money.", "How much interest a savings account pays yearly.", "The total number of goals you can set at once.", "The percentage of your income you must invest."] },
  { q: "What determines the potential return of an investment, according to the text?", correct: 1, feedback: "Return relates to the risk, liquidity and time involved.", options: ["Only how many years you keep the money untouched.", "Its risk, liquidity, and time horizon together.", "The color of the account the bank gives you.", "How famous the company issuing it is."] },
  { q: "What is the main question the author says matters most?", correct: 2, feedback: "The text closes by asking what your money can do for you, not just how much you have.", options: ["How much money can I show off to others?", "How fast can I become rich without effort?", "What will my money be able to do for me in the future?", "How many bank accounts should I open?"] },
  { q: "Per the text, what does financial responsibility mainly involve?", correct: 0, feedback: "It's about informed decisions over time, not just a big number.", options: ["Making informed decisions about money over time.", "Owning the largest possible bank balance.", "Avoiding banks and investments completely.", "Spending everything as soon as it arrives."] },
  { q: "Why does the text say saving and investing are not opposites?", correct: 3, feedback: "They serve different purposes and can be used together.", options: ["Because investing is just a faster way to save.", "Because saving always produces higher returns.", "Because only one of them protects against inflation.", "Because you can use both for different goals at once."] },
  { q: "What is the risk if someone keeps 100% of their money in cash for many years?", correct: 1, feedback: "Cash with no return can lose purchasing power to inflation over time.", options: ["The physical bills will expire after five years.", "Its purchasing power may slowly decline due to inflation.", "The government will confiscate it automatically.", "It will automatically convert into an investment."] },
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
      return <mark className="hl" key={i} title={GLOSSARY[part.toLowerCase()] || ""}>{bionicText(part, bionic, "m" + i)}</mark>;
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
   QUIZ RUNNER (warm-up, video, knowledge check)
   ===================================================================== */
function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample(arr, n) {
  if (!n || n >= arr.length) return shuffleArr(arr);
  return shuffleArr(arr).slice(0, n);
}

function QuizRunner({ title, emoji, questions, soft, xpPerCorrect, xpComplete, pickCount, passThreshold, onSave, onExit }) {
  const [attempt, setAttempt] = useState(0);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coins, setCoins] = useState(0);

  // Cada intento saca un set aleatorio de preguntas y baraja sus opciones
  const deck = useMemo(() => sample(questions, pickCount).map((q) => ({ ...q, order: q.options.map((_, i) => i).sort(() => Math.random() - 0.5) })), [questions, pickCount, attempt]);

  const q = deck[current];
  const answered = answers[current] !== undefined;
  const isLast = current === deck.length - 1;
  const pick = (i) => { if (!answered) setAnswers({ ...answers, [current]: i }); };

  const next = () => {
    if (!isLast) { setCurrent(current + 1); return; }
    const correct = deck.reduce((a, qq, i) => a + (answers[i] === qq.correct ? 1 : 0), 0);
    const pct = Math.round((correct / deck.length) * 100);
    const passed = passThreshold == null || pct >= passThreshold;
    const xp = correct * xpPerCorrect + xpComplete;
    setCoins(xp); setSaving(true); setFinished(true);
    // OPTIMISTIC: las monedas se muestran YA (siempre, gane o no); el guardado viaja por detrás
    onSave({ correct, total: deck.length, answers, xp, pct, passed }).finally(() => setSaving(false));
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
          <p className="reward-note">Your coins are saved, but you need {passThreshold}% to move on. Try again with new questions.</p>
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
          if (answered) { if (oi === q.correct) cls += " correct"; else if (oi === answers[current]) cls += soft ? " chosen" : " wrong"; }
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
   DIAGNÓSTICO FINANCIERO (self-check por dimensiones + perfil de riesgo)
   No se califica: es una foto de "dónde estoy". Genera un radar.
   ===================================================================== */
const DIMS = { knowledge: "Knowledge", habits: "Habits", planning: "Planning", risk: "Risk" };

const DIAG = [
  {
    dim: "knowledge", q: "How confident are you explaining what inflation does to your money?",
    options: [{ t: "I've never really thought about it.", v: 0 }, { t: "I've heard the word but couldn't explain it.", v: 1 }, { t: "I could give a rough explanation.", v: 2 }, { t: "I could explain it clearly with an example.", v: 3 }]
  },
  {
    dim: "knowledge", q: "Do you know the difference between saving and investing?",
    options: [{ t: "They sound like the same thing to me.", v: 0 }, { t: "I sense they're different but I'm not sure how.", v: 1 }, { t: "I know the basic difference.", v: 2 }, { t: "I know the difference and when to use each.", v: 3 }]
  },
  {
    dim: "habits", q: "How do you keep track of the money you receive and spend?",
    options: [{ t: "I don't track it at all.", v: 0 }, { t: "I check my balance now and then.", v: 1 }, { t: "I keep a rough idea in my head.", v: 2 }, { t: "I write it down or use an app.", v: 3 }]
  },
  {
    dim: "habits", q: "When you get money, what usually happens to it?",
    options: [{ t: "It's gone within a few days.", v: 0 }, { t: "I spend most and save whatever is left.", v: 1 }, { t: "I try to keep a little aside.", v: 2 }, { t: "I set some aside first, then spend the rest.", v: 3 }]
  },
  {
    dim: "planning", q: "Do you have a savings goal right now?",
    options: [{ t: "No goal at all.", v: 0 }, { t: "A vague 'I'd like to save more'.", v: 1 }, { t: "A goal, but no amount or deadline.", v: 2 }, { t: "A clear goal with an amount and a date.", v: 3 }]
  },
  {
    dim: "planning", q: "If an unexpected expense hit you today, how ready are you?",
    options: [{ t: "I couldn't cover it at all.", v: 0 }, { t: "I'd have to borrow the money.", v: 1 }, { t: "I could cover a small one.", v: 2 }, { t: "I have money set aside for this.", v: 3 }]
  },
  {
    dim: "risk", q: "You can put COP $100,000 somewhere for a year. Which feels most like you?",
    options: [{ t: "Keep it as cash — I don't want to risk any of it.", v: 0 }, { t: "A safe account with a small but sure return.", v: 1 }, { t: "A mix: part safe, part with more ups and downs.", v: 2 }, { t: "Something that could grow a lot, even if it might drop.", v: 3 }]
  },
  {
    dim: "risk", q: "An investment you own drops 20% in one month. You…",
    options: [{ t: "Sell right away — I can't handle that.", v: 0 }, { t: "Get very nervous and probably sell.", v: 1 }, { t: "Wait and see, feeling a bit uneasy.", v: 2 }, { t: "Stay calm — ups and downs are normal.", v: 3 }]
  },
  {
    dim: "knowledge", q: "Could you explain the difference between the number in your account and what it can actually buy?",
    options: [{ t: "I don't see any difference.", v: 0 }, { t: "I've heard they can differ but couldn't explain why.", v: 1 }, { t: "I could explain it in simple terms.", v: 2 }, { t: "I could explain it clearly, with a real example.", v: 3 }]
  },
  {
    dim: "habits", q: "Before buying something, do you stop to ask if it's a need or a want?",
    options: [{ t: "Never — I just buy what I feel like.", v: 0 }, { t: "Rarely, only for big purchases.", v: 1 }, { t: "Sometimes, when I remember to.", v: 2 }, { t: "Almost always, it's part of my routine.", v: 3 }]
  },
  {
    dim: "planning", q: "Do you know how many months your current savings would cover if you stopped receiving money?",
    options: [{ t: "No idea at all.", v: 0 }, { t: "A rough guess, nothing solid.", v: 1 }, { t: "I have a general sense.", v: 2 }, { t: "I know the exact number of months.", v: 3 }]
  },
  {
    dim: "risk", q: "Given a choice, which feels more like you?",
    options: [{ t: "Guaranteed tiny growth, zero chance of loss.", v: 0 }, { t: "Mostly safe, with a small chance of dipping.", v: 1 }, { t: "Good growth potential, occasional real drops.", v: 2 }, { t: "High growth potential, even with big swings.", v: 3 }]
  },
];

function riskProfile(pct) {
  if (pct <= 33) return { label: "Cautious", desc: "You value safety and hate losing money. That's a real strength — we'll show how to still beat inflation without big risks." };
  if (pct <= 66) return { label: "Balanced", desc: "You can accept some ups and downs in exchange for more growth. A mix of saving and investing fits you well." };
  return { label: "Bold", desc: "You're comfortable with risk for higher potential returns. Your focus will be learning to manage that risk wisely." };
}

/* Radar en SVG puro (sin dependencias, look tipo COMPASS) */
function Radar({ data }) {
  const size = 260, c = size / 2, r = size / 2 - 44, n = data.length;
  const ang = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, rad) => [c + rad * Math.cos(ang(i)), c + rad * Math.sin(ang(i))];
  const ring = (f) => data.map((_, i) => pt(i, r * f).join(",")).join(" ");
  const shape = data.map((d, i) => pt(i, r * (d.value / 100)).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="radar">
      {[0.25, 0.5, 0.75, 1].map((f, k) => <polygon key={k} points={ring(f)} className="radar-grid" />)}
      {data.map((_, i) => { const [x, y] = pt(i, r); return <line key={i} x1={c} y1={c} x2={x} y2={y} className="radar-axis" />; })}
      <polygon points={shape} className="radar-shape" />
      {data.map((d, i) => { const [x, y] = pt(i, r * (d.value / 100)); return <circle key={i} cx={x} cy={y} r="3.5" className="radar-dot" />; })}
      {data.map((d, i) => { const [x, y] = pt(i, r + 20); return <text key={i} x={x} y={y} className="radar-label" textAnchor="middle" dominantBaseline="middle">{d.label}</text>; })}
    </svg>
  );
}

function Diagnostic({ existing, onSave, onExit }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(existing?.answers || {});
  const [done, setDone] = useState(!!existing);
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

  const pick = (opt) => setAnswers({ ...answers, [current]: opt }); // se puede cambiar antes de Next
  const finish = () => { setSaving(true); setDone(true); onSave({ answers, scores }).finally(() => setSaving(false)); };
  const next = () => { if (!isLast) setCurrent(current + 1); else finish(); };

  if (done) {
    const radarData = Object.keys(DIMS).map((k) => ({ label: DIMS[k], value: scores[k] }));
    const rp = riskProfile(scores.risk);
    return (
      <div className="s1-quiz diag-result">
        <div className="diag-badge"><Compass size={30} strokeWidth={2.1} /></div>
        <h2>Your financial starting point</h2>
        <p className="diag-sub">This isn't a test — it's a snapshot of where you are today. You'll watch it change by the end of the course.</p>
        <Radar data={radarData} />
        <div className="diag-bars">
          {radarData.map((d) => (
            <div key={d.label} className="diag-bar">
              <span className="diag-bar-l">{d.label}</span>
              <div className="diag-bar-track"><i style={{ width: `${d.value}%` }} /></div>
              <span className="diag-bar-v">{d.value}%</span>
            </div>
          ))}
        </div>
        <div className="diag-risk">
          <span className="diag-risk-tag">{rp.label} investor</span>
          <p>{rp.desc}</p>
        </div>
        <button className="s1-btn primary" onClick={onExit}>Continue <ChevronRight size={18} strokeWidth={2.4} /></button>
        {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing your snapshot…</span>}
      </div>
    );
  }

  return (
    <div className="s1-quiz">
      <div className="quiz-top"><h2>🧭 Financial self-check</h2><span className="quiz-count">{current + 1} / {DIAG.length}</span></div>
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
        <button className="s1-btn primary" onClick={next} disabled={!answered}>{isLast ? "See my snapshot" : "Next"} <ChevronRight size={18} strokeWidth={2.4} /></button>
      </div>
    </div>
  );
}

/* =====================================================================
   READER
   ===================================================================== */
function Reader({ done, onFinish, onExit }) {
  const [bionic, setBionic] = useState(false);
  const [term, setTerm] = useState(null);
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
          <span className="terms-label">Key words (tap for meaning):</span>
          {KEY_TERMS.map((t) => (
            <button key={t} className={`term-chip ${term === t ? "on" : ""}`} onClick={() => setTerm(term === t ? null : t)}>{t}</button>
          ))}
        </div>
        {term && <div className="term-pop"><b>{term}</b> — {GLOSSARY[term]}</div>}
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
        <a className="speed-toggle" href={VIDEO_URL} target="_blank" rel="noreferrer"><Video size={15} strokeWidth={2.4} /> Open in new tab</a>
      </div>
      <div className="video-frame">
        <video src={VIDEO_URL} controls playsInline preload="metadata" controlsList="nodownload">
          Your browser can't play this video.
        </video>
      </div>
      <p className="video-hint">🎧 Watch the video, then pass the quiz (80% or more) to earn full credit.</p>
      <QuizRunner title="Video check" emoji="🎬" questions={VIDEO_POOL} pickCount={6} passThreshold={80} xpPerCorrect={XP.videoCorrect} xpComplete={XP.videoWatch} onSave={onSave} onExit={onExit} />
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

  const finish = () => {
    const xp = correct * XP.sortCorrect;
    setCoins(xp); setSaving(true); setFinished(true);
    onSave({ correct, total: SORT_ITEMS.length, choices, xp }).finally(() => setSaving(false));
  };

  if (finished) return <Reward title={correct === SORT_ITEMS.length ? "Sorted it all!" : "Good sorting!"} subtitle={`You classified ${correct} / ${SORT_ITEMS.length} correctly.`} coins={coins} saving={saving} onExit={onExit} />;

  return (
    <div className="s1-sort">
      <div className="reader-bar"><button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button></div>
      <div className="sort-head">
        <h2>💰 Saving or Spending?</h2>
        <p>Some of these are tricky. <b>Saving</b> keeps money for your future; <b>spending</b> uses it now — even if it's cheap or feels smart.</p>
      </div>
      <div className="sort-list">
        {SORT_ITEMS.map((it, i) => {
          const picked = choices[i];
          const ok = picked === it.answer;
          return (
            <div key={i} className={`sort-item ${picked ? (ok ? "ok" : "no") : ""}`}>
              <div className="sort-row-top">
                <span className="sort-label">{it.label}</span>
                <div className="sort-btns">
                  <button className={`sort-btn save ${picked === "saving" ? "on" : ""}`} onClick={() => choose(i, "saving")} disabled={!!picked}><PiggyBank size={15} strokeWidth={2.3} /> Saving</button>
                  <button className={`sort-btn spend ${picked === "spending" ? "on" : ""}`} onClick={() => choose(i, "spending")} disabled={!!picked}><ShoppingCart size={15} strokeWidth={2.3} /> Spending</button>
                </div>
                {picked && <span className={`sort-mark ${ok ? "ok" : "no"}`}>{ok ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}</span>}
              </div>
              {picked && <p className="sort-why">{it.why}</p>}
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
function StartingPoint({ existing, diagnostic, onSave, onExit }) {
  const [income, setIncome] = useState(existing?.income || "");
  const [expenses, setExpenses] = useState(existing?.expenses || []);
  const [eName, setEName] = useState("");
  const [eAmount, setEAmount] = useState("");
  const [eType, setEType] = useState("need");
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
  const pctOf = (v) => (inc > 0 ? Math.max(0, Math.min(100, (v / inc) * 100)) : 0);
  const MIN_REFLECTION_CHARS = 150;
  const ready = inc > 0 && expenses.length >= 1 && goal.trim() && goalAmount && goalMonths && reflection.trim().length >= MIN_REFLECTION_CHARS;

  const submit = () => {
    const xp = XP.startBase + XP.startBonus;
    setCoins(xp); setSaving(true); setSaved(true);
    // OPTIMISTIC: mostramos la recompensa; guardamos por detrás
    onSave({ income: inc, expenses, needs, wants, capacity, savePct, goal, goalAmount, goalMonths, goalMonthly, reflection, xp }).finally(() => setSaving(false));
  };

  if (saved) return <Reward title="Your starting point is set! 🎉" subtitle="You finished Week 1 and you now know exactly where you stand." coins={coins} saving={saving} onExit={onExit} gold />;

  return (
    <div className="s1-start">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className="start-head">
        <div className="start-ico"><Wallet size={22} strokeWidth={2.1} /></div>
        <div><h2>Build your budget</h2><p>Turn everything you learned into one simple plan for your money.</p></div>
      </div>

      {/* Intro: qué es un presupuesto (conecta con reading + video) */}
      <div className="start-explain">
        <h3><Lightbulb size={18} strokeWidth={2.3} /> What's a budget?</h3>
        <p>A budget is just a plan for your money: <b>what comes in</b> (income), <b>what goes out</b> (needs and wants), and <b>what's left to save</b>. You just learned why saving matters and how inflation quietly eats money that sits still — a budget is the tool that turns those ideas into action.</p>
        <p className="start-explain-steps"><span>1 · Your income</span><span>2 · Your expenses</span><span>3 · Your goal</span></p>
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
        <p className="start-tip">Add what you spend. Mark each one as a <b>need</b> (you must pay it) or a <b>want</b> (nice to have). This is the same "needs vs wants" idea from the sort game.</p>
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

      {/* Resultado del presupuesto */}
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

      {/* 3 · Meta de ahorro */}
      <div className="start-block">
        <h3><span className="step-n">3</span> Your first savings goal</h3>
        <p className="start-tip">Remember: a real goal has an <b>amount</b> and a <b>deadline</b> — that's what makes it measurable.</p>
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

      {/* Cierre: conecta el presupuesto (números) con el diagnóstico (percepción) */}
      {inc > 0 && (
        <div className="start-bridge">
          <h3>This is your real starting point 📍</h3>
          {diagnostic
            ? <p>At the start, your self-check felt like a <b>{riskProfile(diagnostic.scores.risk).label.toLowerCase()}</b> investor, with a knowledge score of <b>{diagnostic.scores.knowledge}%</b>.</p>
            : <p>You started this week without a clear picture of your money.</p>}
          <p>Now your numbers say you can save <b>{money(Math.max(0, capacity))}</b> a month — about <b>{savePct}%</b> of your money. That gap between what you <b>felt</b> and what you can <b>actually do</b> is exactly what the next weeks will close.</p>
        </div>
      )}

      {/* Micro-reflexión */}
      <div className="start-block">
        <h3><span className="step-n">✦</span> One quick thought</h3>
        <p className="start-tip">What surprised you about your budget? Write a full paragraph explaining your thoughts (in English).</p>
        <textarea className="start-input" rows={5} value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="I was surprised that…" />
        <p className="start-tip" style={{ margin: "8px 0 0", textAlign: "right" }}>
          {reflection.trim().length} / {MIN_REFLECTION_CHARS} characters {reflection.trim().length < MIN_REFLECTION_CHARS ? "(keep writing)" : "✓"}
        </p>
      </div>

      <div className="start-foot">
        <button className="s1-btn primary big" onClick={submit} disabled={!ready}>Finish Week 1 <span className="coin-tag"><Coins size={15} /> +{XP.startBase + XP.startBonus}</span></button>
      </div>
    </div>
  );
}

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Semana1 = ({ userData, API_URL, existingRow, onBack, onSaved }) => {
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

  // Red de seguridad: si el store llega DESPUÉS del montaje (fetch inicial
  // lento y el usuario ya entró a la semana), nos re-hidratamos una vez.
  const hydrated = useRef(!!existingRow);
  useEffect(() => {
    if (hydrated.current || !existingRow) return;
    hydrated.current = true;
    setChecklist(initChecklist);
    respRef.current = initResp;
    setPoints({
      comportamiento: parseFloat(existingRow.Puntos_Comportamiento || 0),
      quizzes: parseFloat(existingRow.Puntos_Quizzes || 0),
      aprendi: parseFloat(existingRow.Puntos_Aprendi || 0),
    });
  }, [existingRow]);
  const [open, setOpen] = useState(null);

  // Cada vez que cambia la sección abierta (o vuelves al menú), subimos al inicio
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [open]);

  const doneCount = SECTION_KEYS.filter((k) => checklist[k]).length;
  const pct = Math.round((doneCount / TOTAL_SECTIONS) * 100);

  const persist = (nextChecklist, nextPoints, respPatch) => {
    respRef.current = { ...respRef.current, ...respPatch };
    const done = SECTION_KEYS.filter((k) => nextChecklist[k]).length;
    const newPct = Math.round((done / TOTAL_SECTIONS) * 100);

    const row = {
      Student_Key: userData.Student_Key, Semana: 1,
      Estado: done >= TOTAL_SECTIONS ? "completed" : "in_progress",
      Porcentaje: newPct,
      Puntos_Comportamiento: nextPoints.comportamiento,
      Puntos_Quizzes: nextPoints.quizzes,
      Puntos_Aprendi: nextPoints.aprendi,
      Checklist_JSON: JSON.stringify(nextChecklist),
      Respuestas_JSON: JSON.stringify(respRef.current),
    };

    // 1) Guardamos la fila anterior por si toca revertir
    const prev = store.semanas?.[1];

    // 2) OPTIMISTA: el dashboard/Fluency Meter se mueve YA, sin esperar red
    dispatch({ type: "save_progreso", payload: row });

    // 3) Por detrás mandamos a la hoja; si falla, revertimos
    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "save_progreso", data: row }),
    }).catch((e) => {
      console.error("Error guardando Semana 1:", e);
      dispatch({ type: "rollback_progreso", payload: { Semana: 1, prev } });
    });
  };

  const complete = async (key, addPoints, respPatch, pass = true) => {
    const already = !!checklist[key];
    const nextChecklist = { ...checklist, [key]: already || pass };
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
    <div className="s1"><Diagnostic existing={respRef.current?.diagnostic} onExit={() => setOpen(null)}
      onSave={(r) => complete("warmup", { comportamiento: XP.warmupComplete }, { diagnostic: { ...r, at: new Date().toISOString() } })} /></div>
  );
  if (open === "video") return (
    <div className="s1"><VideoLesson onExit={() => setOpen(null)}
      onSave={(r) => complete("video", { quizzes: r.correct * XP.videoCorrect, comportamiento: XP.videoWatch }, { video: { correct: r.correct, total: r.total, answers: r.answers, at: new Date().toISOString() } }, r.passed)} /></div>
  );
  if (open === "sort") return (
    <div className="s1"><SortGame onExit={() => setOpen(null)}
      onSave={(r) => complete("sort", { quizzes: r.correct * XP.sortCorrect }, { sort: { correct: r.correct, total: r.total, choices: r.choices, at: new Date().toISOString() } })} /></div>
  );
  if (open === "check") return (
    <div className="s1"><QuizRunner title="Knowledge check" emoji="🧠" questions={CHECK} pickCount={8} passThreshold={80} xpPerCorrect={XP.checkCorrect} xpComplete={0}
      onExit={() => setOpen(null)}
      onSave={(r) => complete("check", { quizzes: r.correct * XP.checkCorrect }, { check: { correct: r.correct, total: r.total, answers: r.answers, at: new Date().toISOString() } }, r.passed)} /></div>
  );
  if (open === "reading") return (
    <div className="s1"><Reader done={!!checklist.reading} onExit={() => setOpen(null)}
      onFinish={() => { complete("reading", { comportamiento: XP.reading }, { reading: { at: new Date().toISOString() } }); setOpen(null); }} /></div>
  );
  if (open === "start") return (
    <div className="s1"><StartingPoint existing={respRef.current?.start} diagnostic={respRef.current?.diagnostic} onExit={() => setOpen(null)}
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
        <Section k="warmup" icon={<Compass size={22} strokeWidth={2.1} />} title="Financial self-check" desc="A quick, no-wrong-answers snapshot of where you stand today."
          topics={["Knowledge", "Habits", "Planning", "Risk profile"]}
          cta={btn("warmup", <><Play size={16} strokeWidth={2.6} /> Start</>, <span className="coin-tag"><Coins size={14} /> +{XP.warmupComplete}</span>)} />

        <Section k="reading" icon={<BookOpen size={22} strokeWidth={2.1} />} title="Reading: Why Save and Invest?" desc="A short B2 text with speed-read mode and key words."
          topics={["Purchasing power", "Inflation", "Nominal vs real value"]}
          cta={btn("reading", "Read", <span className="coin-tag"><Coins size={14} /> +{XP.reading}</span>)} />

        <Section k="video" icon={<Video size={22} strokeWidth={2.1} />} title="Video: How inflation eats your savings" desc="Watch, then pass a 6-question quiz (min. 80%)."
          cta={btn("video", <><Play size={16} strokeWidth={2.6} /> Watch</>, <span className="coin-tag"><Coins size={14} /> +{6 * XP.videoCorrect + XP.videoWatch}</span>)} />

        <Section k="sort" icon={<PiggyBank size={22} strokeWidth={2.1} />} title="Saving or Spending?" desc="Sort 8 real cases and lock in the concept."
          topics={["Saving", "Spending", "Needs vs wants"]}
          cta={btn("sort", <><Play size={16} strokeWidth={2.6} /> Sort</>, <span className="coin-tag"><Coins size={14} /> +{SORT_ITEMS.length * XP.sortCorrect}</span>)} />

        <Section k="check" icon={<GraduationCap size={22} strokeWidth={2.1} />} title="Knowledge check" desc="8 random questions from the reading — pass with 80% or more."
          cta={btn("check", <><Play size={16} strokeWidth={2.6} /> Start</>, <span className="coin-tag"><Coins size={14} /> +{8 * XP.checkCorrect}</span>)} />

        <Section k="start" icon={<Wallet size={22} strokeWidth={2.1} />} title="Your starting point ⭐" desc="Build your budget, set a goal and see where you stand."
          topics={["Budget", "Savings goal", "You are here"]}
          cta={btn("start", "Build", <span className="coin-tag"><Coins size={14} /> +{XP.startBase + XP.startBonus}</span>)} />
      </div>
    </div>
  );
};