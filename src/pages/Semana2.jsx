import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft, BookOpen, Check, X, Coins, Trophy, Sparkles, Zap, Clock,
  ChevronRight, Lightbulb, Play, GraduationCap, Wallet, TrendingUp,
  Landmark, ShieldCheck, FileCheck, Users, Calculator, PiggyBank,
  Plus, Trash2, ThumbsUp, ThumbsDown, Star, Target, Building2,
} from "lucide-react";
import "../Styles/semana1.css"; // reutiliza botones, quiz, reward, monedas, radar…
import "../Styles/semana2.css"; // estilos propios de la semana 2
import useGlobalReducer from "../hooks/useGlobalReducer"; // ajusta la ruta si tu hook está en otro lado

/* =====================================================================
   SEMANA 2 · AHORRO E INSTRUMENTOS EN COLOMBIA
   De "sé qué es ahorrar" (S1) a "actúo con mi presupuesto": cuenta de
   ahorros, bolsillos y CDT. Todo se guarda en Progreso_Semanas
   (Semana: 2, Respuestas_JSON) vía save_progreso. Optimistic UI.
   ===================================================================== */

const VIDEO_URL = "https://res.cloudinary.com/k44zr7ap/video/upload/v1790085135/videoplayback.mp4";

const SECTION_KEYS = ["reading", "check", "banks", "permission", "instruments", "plan"];
const TOTAL_SECTIONS = SECTION_KEYS.length;

/* ---- Monedas por actividad ---- */
const XP = {
  reading: 20,
  checkCorrect: 5,          // 10 preguntas al azar
  banksComplete: 25,        // investigar 3 bancos
  permission: 20,           // hablar con los papás
  simulator: 20,            // correr la comparación CDT vs caja
  planBase: 30, planBonus: 15,
};

/* =====================================================================
   CONTENIDO
   ===================================================================== */
const OBJECTIVES = [
  "Understand how a savings account works and how to open one in Colombia.",
  "Use saving pockets (bolsillos) to separate your money by goal.",
  "Explain what a CDT is and read an E.A. rate intuitively.",
  "Compare where to park your savings so they don't lose value.",
  "Turn your Week 1 budget into a real place for your money.",
];
const DELIVERABLES = [
  "Read Mateo's story and pass a comprehension check.",
  "Research and compare three Colombian banks.",
  "Ask your guardian about opening a youth savings account.",
  "Simulate a CDT vs a saving pocket with your own numbers.",
  "Write about inflation in Colombia and build your saving plan.",
];

/* ---- Lectura: "The Secret of the Digital Vault" ---- */
const READING = [
  { h: "1. The Coin Jar Dilemma" },
  { p: "For as long as he could remember, fourteen-year-old Mateo had kept his savings in a heavy blue ceramic piggy bank on his desk. Every time his grandparents gave him money, or every time he earned a bit of cash helping his neighbors in Bogotá, the coins and folded bills went straight into the slot at the top." },
  { p: "By the beginning of this year, the jar was practically full. But one afternoon his older sister, Valentina, saw him counting bills on his bed. \"Mateo, why do you still keep all your money in your room? What happens if you misplace those bills? Besides, money sitting under your bed is actually losing value over time because of inflation.\"" },
  { p: "Mateo frowned. \"It's safe here! What else am I supposed to do with it?\" Valentina smiled and pulled out her phone. \"You need to bring your money into the 21st century. It's time you learned how the Colombian banking system works, how to protect your cash, and how to make it grow.\"" },
  { h: "2. Stepping Into the Colombian Financial World" },
  { p: "That evening, his father explained the basics. \"In Colombia, storing cash at home is risky. When you place your money in a regulated bank, it is protected by Fogafín — a national guarantee fund that protects your money, up to 50 million pesos per person, if anything ever happens to the bank.\"" },
  { p: "\"But aren't banks only for adults with jobs?\" Mateo asked. \"Not at all,\" replied his mother. \"Most major banks offer youth accounts (Cuentas de Ahorro para Jóvenes). You just need an adult guardian, your Tarjeta de Identidad (TI), and our ID.\"" },
  { p: "Valentina showed him the options. Bancolombia is the largest bank, with the widest network of ATMs and its digital wallet Nequi. Banco de Bogotá is one of the oldest and most traditional, part of Grupo Aval. Davivienda is famous for its red house logo and its platform DaviPlata. BBVA Colombia is an international bank with strong digital tools." },
  { p: "Nu Colombia and Lulo Bank are 100% digital neobanks that became very popular among young people because they work entirely through apps, without paperwork or monthly maintenance fees (cuotas de manejo). \"Choosing a bank depends on what you need,\" Valentina said. \"Some people want branches nearby; others want to do everything from their phone.\"" },
  { h: "3. The Magic of Saving Pockets" },
  { p: "The next day, Mateo and his mother opened his new account, and he received his first debit card. When he logged in, he saw his balance: $350,000 COP. \"This is cool, but now every time I open the app I feel tempted to buy sneakers or snacks.\"" },
  { p: "\"That's a classic trap,\" Valentina said. \"When you see all your money in one pile, your brain thinks you're richer than you are. That's why you use saving pockets.\" A saving pocket (bolsillo) is a feature that divides your balance into separate virtual drawers. The money stays in your account, but it's invisible to your debit card. If you tap your card at a store, the machine can only take money from your main balance." },
  { p: "Together they set up three pockets: \"New Headset\" (target $120,000, he moved $50,000), \"Bicycle Maintenance\" (target $50,000, he set aside $20,000), and \"Long-Term Goals\" (he moved $200,000). \"By separating your cash, you discipline yourself,\" Valentina explained. \"You only spend what's in your main balance.\"" },
  { h: "4. Making Money Work: CDTs and Interest" },
  { p: "A few days later, Mateo noticed his \"Long-Term Goals\" pocket was safe but not really growing. \"If you want your savings to generate income,\" his father said, \"you should look into a CDT — a Certificado de Depósito a Término. It's one of the safest investment instruments in Colombia, like a formal contract between you and your bank.\"" },
  { p: "Here is how a CDT works. First, the agreement: you give the bank an amount you don't need immediately (for example $200,000). Second, the lock period: you agree to leave it for a fixed time — 90, 180 or 365 days — and you cannot withdraw it during that time. Third, the reward: the bank uses your capital to fund loans, and when the period ends it returns your principal plus a guaranteed profit called interest." },
  { h: "Demystifying the E.A. Rate" },
  { p: "Mateo saw a headline: \"CDT Fixed Rate: 10% E.A.\" \"What does E.A. mean?\" \"E.A. stands for Efectiva Anual,\" Valentina explained. \"It's the profit you'd earn if you left your money invested for one full year.\"" },
  { p: "She wrote a quick example. Scenario A: invest $100,000 at 10% E.A. for a full year, and you end with $110,000 ($10,000 in interest). Scenario B: invest the same $100,000 for only 180 days (half a year), and you get roughly half the annual rate — about $5,000 in interest, for a total near $105,000." },
  { p: "\"The beauty of a CDT is its predictability,\" Valentina emphasized. \"Unlike risky stocks or unstable cryptocurrencies, a CDT tells you exactly how much profit you'll receive on the exact day your term ends. It's guaranteed by the bank and protected by Fogafín.\"" },
  { h: "5. Where Mateo Stands Now" },
  { p: "By Sunday, Mateo thought about money differently. He was no longer a boy holding a heavy piggy bank; he understood how Colombian banks work, how to keep his money secure, how to organize goals with digital pockets, and how instruments like CDTs can help beat inflation. Now it's your turn to follow his steps." },
];

/* término (como aparece en el texto) → significado / traducción en español */
const GLOSSARY = {
  "Fogafín": "Fondo de garantías que protege tu dinero (hasta $50 millones) si el banco quiebra.",
  "saving pockets": "Bolsillos — subcuentas para separar tu dinero por metas sin gastarlo por impulso.",
  "saving pocket": "Bolsillo — una subcuenta para separar tu dinero por metas.",
  "CDT": "Certificado de Depósito a Término — inviertes un monto por un plazo fijo y ganas interés garantizado.",
  "E.A.": "Tasa Efectiva Anual — el % que ganarías si dejas la plata invertida un año completo.",
  "principal": "Capital — el monto original que inviertes, sin contar los intereses.",
  "interest": "Interés — la ganancia que te paga el banco por guardar o prestar tu dinero.",
  "neobanks": "Neobancos — bancos 100% digitales, sin oficinas físicas.",
  "maintenance fees": "Cuota de manejo — cobro mensual que algunos bancos hacen por tener la cuenta.",
  "inflation": "Inflación — la subida general de los precios; hace que tu dinero compre menos.",
};
const KEY_TERMS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length); // frases largas primero

/* ---- Comprensión de la lectura (15 preguntas, estilo IELTS) ----
   Opciones: la correcta / la que se parece / la que hace dudar / la que nada que ver. */
const CHECK = [
  { q: "Why does Valentina say money under the bed is a problem?", correct: 0, feedback: "Cash that just sits there loses purchasing power to inflation.", options: ["Inflation slowly reduces what that money can buy.", "Cash left at home loses its printed value each year.", "The bank charges a fee for money kept at home.", "Coins get too heavy to carry after a while."] },
  { q: "What is Fogafín?", correct: 0, feedback: "It's the national fund that protects your deposits if a bank fails.", options: ["A national fund that protects deposits if a bank fails.", "A government tax charged on large bank deposits.", "A private insurance teens must buy to open an account.", "A digital wallet used only by Bancolombia."] },
  { q: "Up to how much does Fogafín protect per person?", correct: 0, feedback: "Up to 50 million pesos per person.", options: ["Up to COP $50 million per person.", "Up to COP $50 million per account.", "Up to COP $5 million per person.", "There is no limit to the protection."] },
  { q: "What does a teen need to open a youth account?", correct: 1, feedback: "A guardian, the teen's Tarjeta de Identidad, and the guardian's ID.", options: ["A full-time job and their own adult ID.", "A guardian, their Tarjeta de Identidad, and the guardian's ID.", "Only their Tarjeta de Identidad, nothing else.", "A minimum first deposit of COP $1 million."] },
  { q: "How are Nu and Lulo Bank described?", correct: 2, feedback: "They are 100% digital neobanks, popular with young people.", options: ["Traditional banks with the widest branch network.", "Government banks that manage all youth accounts.", "100% digital neobanks popular with young people.", "Apps used only to invest in cryptocurrencies."] },
  { q: "What is the main purpose of a saving pocket (bolsillo)?", correct: 3, feedback: "To separate money by goals so you don't spend it by impulse.", options: ["To move money to a safer bank overnight.", "To earn a higher interest rate than a CDT.", "To share your savings with friends and family.", "To separate money by goals and avoid impulse spending."] },
  { q: "When you tap your card at a store, money inside a pocket is…", correct: 0, feedback: "Untouched — the machine only takes from your main balance.", options: ["untouched — only your main balance is charged.", "taken first, before your main balance.", "split evenly between the pocket and the balance.", "automatically turned into a CDT."] },
  { q: "What does CDT stand for?", correct: 1, feedback: "Certificado de Depósito a Término.", options: ["Certificado de Depósito Temporal.", "Certificado de Depósito a Término.", "Cuenta de Depósito a Término.", "Contrato de Deuda Tributaria."] },
  { q: "During the CDT lock period, you…", correct: 2, feedback: "Cannot withdraw the money until the term ends.", options: ["can withdraw it but lose all the interest.", "can withdraw only half of it early.", "cannot withdraw the money until the term ends.", "must add more money to it every month."] },
  { q: "Why does the bank pay you interest on a CDT?", correct: 0, feedback: "It uses your locked money to fund loans.", options: ["It uses your money to fund loans while it's locked.", "It rewards you just for opening a youth account.", "It returns part of the fees other clients pay.", "The government forces banks to pay teenagers."] },
  { q: "What does '10% E.A.' mean?", correct: 3, feedback: "The profit if the money stays invested one full year.", options: ["The profit you earn every single month.", "A yearly fee the bank charges you.", "The maximum amount you may invest.", "The profit if the money stays invested one full year."] },
  { q: "Invest $100,000 at 10% E.A. for a full year. You end with about…", correct: 0, feedback: "About $110,000 ($10,000 in interest).", options: ["$110,000.", "$100,000.", "$210,000.", "$90,000."] },
  { q: "Invest $100,000 at 10% E.A. for only 6 months. You get roughly…", correct: 1, feedback: "Around half the annual rate — about $5,000 in interest.", options: ["about $10,000 in interest (the full annual rate).", "about $5,000 in interest (around half the rate).", "about $1,000 in interest.", "no interest until a full year passes."] },
  { q: "Why does Valentina call a CDT 'predictable'?", correct: 2, feedback: "You know the exact profit and the exact day you'll get it.", options: ["Its return changes with the market every day.", "The bank can raise your rate whenever it wants.", "You know the exact profit and the exact payout day.", "You can withdraw it at any time without notice."] },
  { q: "By the end, what does Mateo understand about his money?", correct: 1, feedback: "How to keep it safe, organize goals, and beat inflation with instruments.", options: ["That a piggy bank is the safest possible option.", "How to keep it safe, organize goals, and beat inflation.", "That crypto is the only way to grow money.", "That he should spend it before it loses value."] },
];

/* ---- Bancos sugeridos (datalist) ---- */
const BANK_SUGGESTIONS = ["Bancolombia", "Davivienda", "Banco de Bogotá", "BBVA Colombia", "Nu Colombia", "Lulo Bank", "Nequi", "DaviPlata", "Scotiabank Colpatria", "Banco de Occidente"];

/* =====================================================================
   HELPERS
   ===================================================================== */
const money = (n) => "COP $" + (parseInt(n || 0, 10)).toLocaleString("es-CO");
const countWords = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);
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
function riskProfile(pct) {
  if (pct <= 33) return { label: "Cautious", desc: "safety-first, so a CDT or a saving pocket fits you naturally." };
  if (pct <= 66) return { label: "Balanced", desc: "open to some ups and downs, so mixing a CDT with a pocket suits you." };
  return { label: "Bold", desc: "comfortable with risk, but a CDT is still a smart, safe base to start from." };
}

/* Campo de texto con mínimo (y máximo) de palabras: obliga a escribir en inglés de verdad */
function WordField({ value, onChange, placeholder, min, max = 120, rows = 4 }) {
  const w = countWords(value);
  const ok = w >= min && w <= max;
  const state = w === 0 ? "" : ok ? "ok" : w > max ? "over" : "low";
  return (
    <>
      <textarea className="start-input" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      <p className={`word-count ${state}`}>
        {w} words · min {min}{max ? ` · max ${max}` : ""}
        {" "}{ok ? "✓" : w < min ? `— write ${min - w} more` : "— too long, trim it"}
      </p>
    </>
  );
}

/* =====================================================================
   REWARD (idéntico look a S1)
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
   QUIZ RUNNER (baraja opciones, saca set aleatorio, 80% para pasar, reintento)
   ===================================================================== */
function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function sample(arr, n) { return !n || n >= arr.length ? shuffleArr(arr) : shuffleArr(arr).slice(0, n); }

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
          <p className="reward-note">Your coins are saved, but you need {passThreshold}% to move on. Try again — you'll get new questions.</p>
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
   READER (historia de Mateo)
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
        <span className="reader-tag">READING · B2 · STORY</span>
        <h1>The Secret of the Digital Vault</h1>
        <p className="reader-sub">Mateo learns how to move his money into the 21st century.</p>
        <div className="reader-terms">
          <span className="terms-label">Key words (tap for meaning):</span>
          {["Fogafín", "saving pockets", "CDT", "E.A.", "principal", "interest", "neobanks", "maintenance fees"].map((t) => (
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
   BANK EXPLORER · investiga y compara 3 bancos (name + pro + con)
   ===================================================================== */
function BankExplorer({ existing, onSave, onExit }) {
  const [banks, setBanks] = useState(existing?.banks || []);
  const [name, setName] = useState("");
  const [pro, setPro] = useState("");
  const [con, setCon] = useState("");
  const [fav, setFav] = useState(existing?.fav || "");
  const [why, setWhy] = useState(existing?.why || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const MIN_PC = 6, MIN_WHY = 20;
  const proOk = countWords(pro) >= MIN_PC && countWords(pro) <= 40;
  const conOk = countWords(con) >= MIN_PC && countWords(con) <= 40;
  const canAdd = name.trim() && proOk && conOk && banks.length < 3;

  const add = () => {
    if (!canAdd) return;
    setBanks([...banks, { name: name.trim(), pro: pro.trim(), con: con.trim() }]);
    setName(""); setPro(""); setCon("");
  };
  const remove = (i) => { const b = banks.filter((_, idx) => idx !== i); setBanks(b); if (fav === banks[i]?.name) setFav(""); };

  const ready = banks.length === 3 && fav && countWords(why) >= MIN_WHY;
  const submit = () => {
    setSaving(true); setSaved(true);
    onSave({ banks, fav, why }).finally(() => setSaving(false));
  };

  if (saved) return <Reward title="You did your research! 🔎" subtitle="You compared three banks like a real customer would." coins={XP.banksComplete} saving={saving} onExit={onExit} />;

  return (
    <div className="s1-start">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className="start-head">
        <div className="start-ico"><Landmark size={22} strokeWidth={2.1} /></div>
        <div><h2>Bank scout</h2><p>Before opening anything, investigate. Add three Colombian banks with one real pro and one real con each.</p></div>
      </div>

      <div className="start-explain">
        <h3><Lightbulb size={18} strokeWidth={2.3} /> Your mission</h3>
        <p>Open each bank's website (or ask an adult) and find their <b>youth savings account</b>. Look at fees (cuota de manejo), whether it's digital or has branches, and any perks. Then decide which one <b>you</b> would choose — and why.</p>
      </div>

      {banks.length < 3 && (
        <div className="start-block">
          <h3><span className="step-n">{banks.length + 1}</span> Add a bank ({banks.length}/3)</h3>
          <input className="start-input" list="bank-list" value={name} onChange={(e) => setName(e.target.value)} placeholder="Bank name (e.g. Nu Colombia)" />
          <datalist id="bank-list">{BANK_SUGGESTIONS.map((b) => <option key={b} value={b} />)}</datalist>
          <p className="start-tip" style={{ margin: "14px 0 4px" }}><ThumbsUp size={15} strokeWidth={2.3} style={{ verticalAlign: "-2px" }} /> One advantage (full sentence, in English):</p>
          <WordField value={pro} onChange={setPro} min={MIN_PC} max={40} rows={2} placeholder="e.g. This bank has no monthly maintenance fee and works fully from the app…" />
          <p className="start-tip" style={{ margin: "10px 0 4px" }}><ThumbsDown size={15} strokeWidth={2.3} style={{ verticalAlign: "-2px" }} /> One disadvantage (full sentence, in English):</p>
          <WordField value={con} onChange={setCon} min={MIN_PC} max={40} rows={2} placeholder="e.g. It has no physical branches, so I can't deposit cash easily…" />
          <div style={{ marginTop: 12 }}>
            <button className="s1-btn primary" onClick={add} disabled={!canAdd}><Plus size={16} strokeWidth={2.6} /> Add this bank</button>
          </div>
        </div>
      )}

      {banks.length > 0 && (
        <div className="bank-grid">
          {banks.map((b, i) => (
            <div key={i} className={`bank-card ${fav === b.name ? "fav" : ""}`}>
              <div className="bank-card-top">
                <span className="bank-name"><Building2 size={16} strokeWidth={2.2} /> {b.name}</span>
                <button className="exp-del" onClick={() => remove(i)}><Trash2 size={15} strokeWidth={2.2} /></button>
              </div>
              <p className="bank-pro"><ThumbsUp size={14} strokeWidth={2.4} /> {b.pro}</p>
              <p className="bank-con"><ThumbsDown size={14} strokeWidth={2.4} /> {b.con}</p>
              {banks.length === 3 && (
                <button className={`bank-fav-btn ${fav === b.name ? "on" : ""}`} onClick={() => setFav(b.name)}>
                  <Star size={14} strokeWidth={2.4} /> {fav === b.name ? "My pick" : "Pick this one"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {banks.length === 3 && (
        <div className="start-block">
          <h3><Star size={18} strokeWidth={2.3} /> Why {fav || "your pick"}?</h3>
          <p className="start-tip">Explain in English why this bank is the best fit for you (think about fees, digital vs branches, and your Week 1 budget).</p>
          <WordField value={why} onChange={setWhy} min={MIN_WHY} max={90} rows={4} placeholder="I would choose … because …" />
        </div>
      )}

      <div className="start-foot">
        <button className="s1-btn primary big" onClick={submit} disabled={!ready}>Finish research <span className="coin-tag"><Coins size={15} /> +{XP.banksComplete}</span></button>
      </div>
    </div>
  );
}

/* =====================================================================
   PERMISSION · habla con tus papás (autoriza / no autoriza / ya tengo)
   ===================================================================== */
const PERM_OPTIONS = [
  { id: "authorized", icon: <FileCheck size={20} strokeWidth={2.1} />, label: "My guardian agreed", desc: "They'll sign the permission form and help me open the account." },
  { id: "already", icon: <ShieldCheck size={20} strokeWidth={2.1} />, label: "I already have one", desc: "I already have a savings account or a digital wallet." },
  { id: "not_yet", icon: <Clock size={20} strokeWidth={2.1} />, label: "Not right now", desc: "My guardian said no or we'll decide later — I'll continue in simulation mode." },
];
function Permission({ existing, onSave, onExit }) {
  const [status, setStatus] = useState(existing?.status || "");
  const [summary, setSummary] = useState(existing?.summary || "");
  const [signed, setSigned] = useState(existing?.signed || false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const MIN_SUM = 30;
  const needsSign = status === "authorized";
  const ready = status && countWords(summary) >= MIN_SUM && (!needsSign || signed);

  const submit = () => { setSaving(true); setSaved(true); onSave({ status, summary, signed }).finally(() => setSaving(false)); };

  if (saved) return <Reward title="Conversation done! 🗣️" subtitle="Talking to your family about money is a real financial skill." coins={XP.permission} saving={saving} onExit={onExit} />;

  return (
    <div className="s1-start">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className="start-head">
        <div className="start-ico"><Users size={22} strokeWidth={2.1} /></div>
        <div><h2>Talk to your family</h2><p>A youth account needs an adult guardian. Have the conversation, then tell us how it went.</p></div>
      </div>

      <div className="start-explain">
        <h3><Lightbulb size={18} strokeWidth={2.3} /> How to bring it up</h3>
        <p>Show your guardian what you researched: the bank you'd pick and why. Ask if they'll help you open a <b>youth savings account</b>. If they say yes, they sign the permission form to bring to class. If not, no problem — you'll finish the week in simulation mode and still learn everything.</p>
      </div>

      <div className="start-block">
        <h3><span className="step-n">1</span> What did your guardian say?</h3>
        <div className="perm-options">
          {PERM_OPTIONS.map((o) => (
            <button key={o.id} className={`perm-opt ${status === o.id ? "on" : ""}`} onClick={() => setStatus(o.id)}>
              <span className="perm-ico">{o.icon}</span>
              <span className="perm-text"><b>{o.label}</b><span>{o.desc}</span></span>
            </button>
          ))}
        </div>
      </div>

      <div className="start-block">
        <h3><span className="step-n">2</span> Tell the story (in English)</h3>
        <p className="start-tip">Write a short paragraph: who you talked to, what you asked, and what they answered.</p>
        <WordField value={summary} onChange={setSummary} min={MIN_SUM} max={120} rows={5} placeholder="I talked to my … about opening a savings account. I explained … and they said …" />
      </div>

      {needsSign && (
        <label className="perm-check">
          <input type="checkbox" checked={signed} onChange={(e) => setSigned(e.target.checked)} />
          <span>I will bring the <b>signed permission form</b> to class.</span>
        </label>
      )}

      <div className="start-foot">
        <button className="s1-btn primary big" onClick={submit} disabled={!ready}>Save my answer <span className="coin-tag"><Coins size={15} /> +{XP.permission}</span></button>
      </div>
    </div>
  );
}

/* =====================================================================
   SIMULATOR · CDT vs Caja de ahorro, con tu plata y vs inflación
   ===================================================================== */
function Simulator({ existing, suggestedAmount, onSave, onExit }) {
  const [amount, setAmount] = useState(existing?.amount || suggestedAmount || "");
  const [days, setDays] = useState(existing?.days || 365);
  const [cajaRate, setCajaRate] = useState(existing?.cajaRate || "");
  const [cdtRate, setCdtRate] = useState(existing?.cdtRate || "");
  const [inflation, setInflation] = useState(existing?.inflation || "");
  const [reflection, setReflection] = useState(existing?.reflection || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const p = parseFloat(amount || 0);
  const cr = parseFloat(cajaRate || 0);
  const dr = parseFloat(cdtRate || 0);
  const inf = parseFloat(inflation || 0);

  // interés compuesto proporcional al plazo:  P * ((1+EA)^(days/365) - 1)
  const grow = (rate) => (p > 0 && rate > 0 ? p * (Math.pow(1 + rate / 100, days / 365) - 1) : 0);
  const cajaInt = grow(cr);
  const cdtInt = grow(dr);
  // valor real: ¿la tasa EA le gana a la inflación anual?
  const cajaReal = cr - inf;
  const cdtReal = dr - inf;
  const bestReal = Math.max(cajaReal, cdtReal);

  const MIN_REF = 25;
  const numbersReady = p > 0 && cr > 0 && dr > 0 && inf > 0;
  const ready = numbersReady && countWords(reflection) >= MIN_REF;

  const submit = () => {
    setSaving(true); setSaved(true);
    onSave({ amount: p, days, cajaRate: cr, cdtRate: dr, inflation: inf, cajaInt: Math.round(cajaInt), cdtInt: Math.round(cdtInt), reflection }).finally(() => setSaving(false));
  };

  if (saved) return <Reward title="Simulation complete! 📈" subtitle="You compared instruments with real numbers — that's how investors think." coins={XP.simulator} saving={saving} onExit={onExit} />;

  const maxInt = Math.max(cajaInt, cdtInt, 1);

  return (
    <div className="s1-start">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className="start-head">
        <div className="start-ico"><Calculator size={22} strokeWidth={2.1} /></div>
        <div><h2>CDT vs saving pocket</h2><p>Put in your own numbers and watch how each option grows — and whether it beats inflation.</p></div>
      </div>

      <div className="start-explain">
        <h3><Lightbulb size={18} strokeWidth={2.3} /> Research first</h3>
        <p>Some instruments pay more than others. Look up a real <b>caja / cuenta de ahorros</b> rate and a real <b>CDT</b> rate (both as <b>E.A.</b>), and Colombia's current <b>inflation</b>. Different banks give different rates — that's the whole point of shopping around.</p>
      </div>

      <div className="start-block">
        <h3><span className="step-n">1</span> Your numbers</h3>
        <div className="sim-grid">
          <label className="sim-field"><span>Amount to invest (COP)</span>
            <input className="start-input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={suggestedAmount ? String(suggestedAmount) : "e.g. 200000"} />
          </label>
          <label className="sim-field"><span>Term</span>
            <div className="term-toggle">
              {[90, 180, 365].map((d) => <button key={d} className={days === d ? "on" : ""} onClick={() => setDays(d)}>{d}d</button>)}
            </div>
          </label>
          <label className="sim-field"><span>Saving pocket / caja rate (% E.A.)</span>
            <input className="start-input" type="number" value={cajaRate} onChange={(e) => setCajaRate(e.target.value)} placeholder="e.g. 8" />
          </label>
          <label className="sim-field"><span>CDT rate (% E.A.)</span>
            <input className="start-input" type="number" value={cdtRate} onChange={(e) => setCdtRate(e.target.value)} placeholder="e.g. 11" />
          </label>
          <label className="sim-field"><span>Colombia inflation now (% per year)</span>
            <input className="start-input" type="number" value={inflation} onChange={(e) => setInflation(e.target.value)} placeholder="look it up — e.g. 5" />
          </label>
        </div>
      </div>

      {numbersReady && (
        <div className="sim-result">
          <h3>After {days} days on {money(p)}</h3>
          <div className="sim-compare">
            <div className={`sim-col ${cdtInt >= cajaInt ? "" : "win"}`}>
              <span className="sim-col-name"><PiggyBank size={15} strokeWidth={2.3} /> Saving pocket</span>
              <div className="sim-bar-track"><i style={{ width: `${(cajaInt / maxInt) * 100}%` }} /></div>
              <span className="sim-int">+{money(Math.round(cajaInt))}</span>
              <span className="sim-total">Total {money(Math.round(p + cajaInt))}</span>
              <span className={`sim-real ${cajaReal >= 0 ? "good" : "bad"}`}>{cajaReal >= 0 ? "Beats" : "Loses to"} inflation by {Math.abs(cajaReal).toFixed(1)}%</span>
            </div>
            <div className={`sim-col ${cdtInt >= cajaInt ? "win" : ""}`}>
              <span className="sim-col-name"><Landmark size={15} strokeWidth={2.3} /> CDT</span>
              <div className="sim-bar-track"><i style={{ width: `${(cdtInt / maxInt) * 100}%` }} /></div>
              <span className="sim-int">+{money(Math.round(cdtInt))}</span>
              <span className="sim-total">Total {money(Math.round(p + cdtInt))}</span>
              <span className={`sim-real ${cdtReal >= 0 ? "good" : "bad"}`}>{cdtReal >= 0 ? "Beats" : "Loses to"} inflation by {Math.abs(cdtReal).toFixed(1)}%</span>
            </div>
          </div>
          <div className={`sim-verdict ${bestReal >= 0 ? "good" : "bad"}`}>
            {bestReal >= 0
              ? <><TrendingUp size={18} strokeWidth={2.3} /> Your best option grows your money <b>above</b> inflation — your savings keep their real value.</>
              : <><span className="warn">⚠️</span> Even your best option is <b>below</b> inflation — your money would slowly lose purchasing power. Look for a higher rate or a longer term.</>}
          </div>
        </div>
      )}

      <div className="start-block">
        <h3><span className="step-n">2</span> What did you find? (in English)</h3>
        <p className="start-tip">Which option won, by how much, and does it protect your savings from inflation?</p>
        <WordField value={reflection} onChange={setReflection} min={MIN_REF} max={110} rows={4} placeholder="The CDT gave me more interest because …" />
      </div>

      <div className="start-foot">
        <button className="s1-btn primary big" onClick={submit} disabled={!ready}>Save simulation <span className="coin-tag"><Coins size={15} /> +{XP.simulator}</span></button>
      </div>
    </div>
  );
}

/* =====================================================================
   PLAN · inflación en Colombia + conectar con presupuesto S1 (entregable ⭐)
   ===================================================================== */
function Plan({ existing, week1, sim, onSave, onExit }) {
  const capacity = Math.max(0, parseInt(week1?.budget?.capacity || 0, 10));
  const riskScore = week1?.diagnostic?.scores?.risk;
  const rp = riskScore != null ? riskProfile(riskScore) : null;

  const [inflationText, setInflationText] = useState(existing?.inflationText || "");
  const [instrument, setInstrument] = useState(existing?.instrument || "");
  const [monthly, setMonthly] = useState(existing?.monthly || "");
  const [reflection, setReflection] = useState(existing?.reflection || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const MIN_INF = 60, MIN_REF = 25;
  const m = parseInt(monthly || 0, 10);
  const overCapacity = capacity > 0 && m > capacity;
  const ready = countWords(inflationText) >= MIN_INF && instrument && m > 0 && !overCapacity && countWords(reflection) >= MIN_REF;

  const submit = () => {
    setSaving(true); setSaved(true);
    onSave({ inflationText, instrument, monthly: m, reflection }).finally(() => setSaving(false));
  };

  if (saved) return <Reward title="Week 2 done — you have a plan! 🎉" subtitle="You turned your budget into a real place for your money." coins={XP.planBase + XP.planBonus} saving={saving} onExit={onExit} gold />;

  const INSTRUMENTS = [
    { id: "pocket", icon: <PiggyBank size={18} strokeWidth={2.1} />, label: "Saving pocket", desc: "Flexible, always available. Great for short-term goals." },
    { id: "cdt", icon: <Landmark size={18} strokeWidth={2.1} />, label: "CDT", desc: "Locked for a term, higher rate. Great for money you won't touch." },
    { id: "mix", icon: <Wallet size={18} strokeWidth={2.1} />, label: "A mix of both", desc: "Some in a pocket for emergencies, some in a CDT to grow." },
  ];

  return (
    <div className="s1-start">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className="start-head">
        <div className="start-ico"><Target size={22} strokeWidth={2.1} /></div>
        <div><h2>Your saving plan</h2><p>Bring it all together: inflation, your instrument, and your Week 1 budget.</p></div>
      </div>

      <div className="start-block">
        <h3><span className="step-n">1</span> Inflation in Colombia (in English)</h3>
        <p className="start-tip">Research how inflation has changed in Colombia recently. Then analyze: is the rate a caja or a CDT pays enough so your savings <b>don't lose value</b>? Write a full paragraph.</p>
        <WordField value={inflationText} onChange={setInflationText} min={MIN_INF} max={160} rows={6} placeholder="In the last years, inflation in Colombia has …" />
      </div>

      <div className="start-block">
        <h3><span className="step-n">2</span> Where will your money go?</h3>
        {rp && <p className="start-tip">In Week 1 you came in as a <b>{rp.label}</b> saver — {rp.desc}</p>}
        <div className="plan-choices">
          {INSTRUMENTS.map((o) => (
            <button key={o.id} className={`plan-choice ${instrument === o.id ? "on" : ""}`} onClick={() => setInstrument(o.id)}>
              <span className="plan-choice-ico">{o.icon}</span>
              <span className="plan-choice-text"><b>{o.label}</b><span>{o.desc}</span></span>
            </button>
          ))}
        </div>
      </div>

      <div className="start-block">
        <h3><span className="step-n">3</span> How much per month?</h3>
        {capacity > 0
          ? <p className="start-tip">Your Week 1 budget says you can save about <b>{money(capacity)}</b> a month. How much of that will you move into your chosen instrument?</p>
          : <p className="start-tip">How much will you move into your chosen instrument each month?</p>}
        <input className="start-input" type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} placeholder={capacity > 0 ? `up to ${capacity}` : "e.g. 50000"} />
        {overCapacity && <p className="goal-warn" style={{ marginTop: 8 }}>That's more than your budget can save ({money(capacity)}). Lower it or revisit your Week 1 budget.</p>}
        {sim?.cdtInt > 0 && m > 0 && instrument && (
          <div className="goal-calc" style={{ marginTop: 12 }}>
            🎯 At the CDT rate you simulated, saving {money(m)}/month could grow meaningfully over a year — your money working instead of sitting still.
          </div>
        )}
      </div>

      <div className="start-bridge">
        <h3>From Week 1 to Week 2 📍</h3>
        <p>Week 1 told you <b>how much</b> you could save. This week you learned <b>where</b> to put it so inflation doesn't eat it. Next: making that money grow with real financial math.</p>
      </div>

      <div className="start-block">
        <h3><span className="step-n">✦</span> One honest reflection (in English)</h3>
        <p className="start-tip">What's one thing about banks, pockets or CDTs that surprised you this week?</p>
        <WordField value={reflection} onChange={setReflection} min={MIN_REF} max={110} rows={4} placeholder="What surprised me most was …" />
      </div>

      <div className="start-foot">
        <button className="s1-btn primary big" onClick={submit} disabled={!ready}>Finish Week 2 <span className="coin-tag"><Coins size={15} /> +{XP.planBase + XP.planBonus}</span></button>
      </div>
    </div>
  );
}

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Semana2 = ({ userData, API_URL, existingRow, onBack }) => {
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

  // Re-hidratación si el store llega después del montaje
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
  }, [existingRow]); // eslint-disable-line

  const [open, setOpen] = useState(null);
  // Scroll al inicio cada vez que entras/sales de una sección
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [open]);

  // Datos de la Semana 1 (presupuesto + perfil de riesgo) desde el store
  const week1 = useMemo(() => {
    try {
      const resp = JSON.parse(store.semanas?.[1]?.Respuestas_JSON || "{}");
      return { budget: resp.start, diagnostic: resp.diagnostic };
    } catch { return {}; }
  }, [store.semanas]);
  const suggestedAmount = Math.max(0, parseInt(week1?.budget?.capacity || 0, 10)) || "";

  const doneCount = SECTION_KEYS.filter((k) => checklist[k]).length;
  const pct = Math.round((doneCount / TOTAL_SECTIONS) * 100);

  const persist = (nextChecklist, nextPoints, respPatch) => {
    respRef.current = { ...respRef.current, ...respPatch };
    const done = SECTION_KEYS.filter((k) => nextChecklist[k]).length;
    const newPct = Math.round((done / TOTAL_SECTIONS) * 100);

    const row = {
      Student_Key: userData.Student_Key, Semana: 2,
      Estado: done >= TOTAL_SECTIONS ? "completed" : "in_progress",
      Porcentaje: newPct,
      Puntos_Comportamiento: nextPoints.comportamiento,
      Puntos_Quizzes: nextPoints.quizzes,
      Puntos_Aprendi: nextPoints.aprendi,
      Checklist_JSON: JSON.stringify(nextChecklist),
      Respuestas_JSON: JSON.stringify(respRef.current),
    };

    const prev = store.semanas?.[2];
    dispatch({ type: "save_progreso", payload: row }); // OPTIMISTA
    fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "save_progreso", data: row }) })
      .catch((e) => { console.error("Error guardando Semana 2:", e); dispatch({ type: "rollback_progreso", payload: { Semana: 2, prev } }); });
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
  if (open === "banks") return (
    <div className="s1"><BankExplorer existing={respRef.current?.banks} onExit={() => setOpen(null)}
      onSave={(r) => complete("banks", { comportamiento: XP.banksComplete }, { banks: { ...r, at: new Date().toISOString() } })} /></div>
  );
  if (open === "permission") return (
    <div className="s1"><Permission existing={respRef.current?.permission} onExit={() => setOpen(null)}
      onSave={(r) => complete("permission", { comportamiento: XP.permission }, { permission: { ...r, at: new Date().toISOString() } })} /></div>
  );
  if (open === "instruments") return (
    <div className="s1"><Simulator existing={respRef.current?.instruments} suggestedAmount={suggestedAmount} onExit={() => setOpen(null)}
      onSave={(r) => complete("instruments", { comportamiento: XP.simulator }, { instruments: { ...r, at: new Date().toISOString() } })} /></div>
  );
  if (open === "plan") return (
    <div className="s1"><Plan existing={respRef.current?.plan} week1={week1} sim={respRef.current?.instruments} onExit={() => setOpen(null)}
      onSave={(r) => complete("plan", { aprendi: XP.planBase, comportamiento: XP.planBonus }, { plan: { ...r, at: new Date().toISOString() } })} /></div>
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

      <div className="s1-hero s2-hero">
        <span className="s1-tag"><Landmark size={14} strokeWidth={2.6} /> WEEK 2 · SAVING &amp; INSTRUMENTS</span>
        <h1>Where does your money live?</h1>
        <p>Open a real savings account, learn saving pockets and CDTs, and decide where your Week 1 savings should go.</p>
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
        <Section k="reading" icon={<BookOpen size={22} strokeWidth={2.1} />} title="Reading: The Digital Vault" desc="Follow Mateo as he opens his first account and discovers CDTs."
          topics={["Fogafín", "Saving pockets", "CDT & E.A."]}
          cta={btn("reading", "Read", <span className="coin-tag"><Coins size={14} /> +{XP.reading}</span>)} />

        <Section k="check" icon={<GraduationCap size={22} strokeWidth={2.1} />} title="Reading check" desc="10 random questions from the story — pass with 80% or more."
          cta={btn("check", <><Play size={16} strokeWidth={2.6} /> Start</>, <span className="coin-tag"><Coins size={14} /> +{10 * XP.checkCorrect}</span>)} />

        <Section k="banks" icon={<Landmark size={22} strokeWidth={2.1} />} title="Bank scout" desc="Research and compare three Colombian banks: pros and cons."
          topics={["Youth accounts", "Fees", "Digital vs branches"]}
          cta={btn("banks", <><Play size={16} strokeWidth={2.6} /> Explore</>, <span className="coin-tag"><Coins size={14} /> +{XP.banksComplete}</span>)} />

        <Section k="permission" icon={<Users size={22} strokeWidth={2.1} />} title="Talk to your family" desc="Ask your guardian about opening a youth account (bring the signed form)."
          cta={btn("permission", <><Play size={16} strokeWidth={2.6} /> Start</>, <span className="coin-tag"><Coins size={14} /> +{XP.permission}</span>)} />

        <Section k="instruments" icon={<Calculator size={22} strokeWidth={2.1} />} title="CDT vs saving pocket" desc="Simulate both with your own numbers and beat inflation."
          topics={["E.A. rate", "Compound growth", "vs Inflation"]}
          cta={btn("instruments", <><Play size={16} strokeWidth={2.6} /> Simulate</>, <span className="coin-tag"><Coins size={14} /> +{XP.simulator}</span>)} />

        <Section k="plan" icon={<Target size={22} strokeWidth={2.1} />} title="Your saving plan ⭐" desc="Analyze inflation and turn your budget into a real plan."
          topics={["Inflation analysis", "Choose instrument", "Monthly amount"]}
          cta={btn("plan", "Build", <span className="coin-tag"><Coins size={14} /> +{XP.planBase + XP.planBonus}</span>)} />
      </div>
    </div>
  );
};