import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft, BookOpen, Video, Check, X, Coins, Trophy, Sparkles, Clock, ChevronRight, ChevronLeft, Lightbulb, Play,
  PenLine, Star, Users, Lock, Store, Scale, RefreshCw, Award, Puzzle, Mic, Target, Calculator,
  ShieldCheck, Plus, Minus, Trash2, Search, Swords, Rocket, Download, Printer, ShoppingCart, Globe,
  TrendingUp, TrendingDown, Headphones, Compass, BarChart3, LineChart as LineIcon, Flame, Map as MapIcon,
  Landmark, CreditCard, Smartphone, Briefcase, PiggyBank, Wallet, QrCode, Bell, KeyRound, Mail,
  FileText, Handshake, Zap, Eye, Unlock, AlertTriangle, Fingerprint, Calendar, Gauge, Home, Umbrella,
  Snowflake, Layers, Palette, Database, Shield, Send, Leaf, Crown, Newspaper, Gift, Activity, Pause, Receipt, Building2,
  Brain, Hourglass, Timer, Percent, Plane, Flag, Cookie, LifeBuoy, Hammer, Sprout,
  Gavel, Truck, Package, Route, ShieldAlert, Banknote, Megaphone, MapPin, BadgeCheck, UserCheck, Signal,
  Link2, History, GraduationCap, Heart, DollarSign, PieChart, User, Car, Coffee, Bike, Shuffle, Sparkle, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import "../Styles/semana1.css";   // botones, quiz, reward, monedas (misma gamificación)
import "../Styles/periodo1.css";  // piezas de 6°
import "../Styles/periodo2.css";
import "../Styles/periodo3.css";
import "../Styles/periodo4.css";
import "../Styles/septimo1.css";  // piezas de 7°
import "../Styles/septimo2.css";
import "../Styles/septimo3.css";
import "../Styles/septimo4.css";
import "../Styles/octavo1.css";   // piezas de 8°
import "../Styles/octavo2.css";
import "../Styles/octavo3.css";
import "../Styles/octavo4.css";
import "../Styles/noveno1.css";   // piezas de 9° (guía de actividad, medidores, listening)
import "../Styles/noveno2.css";
import "../Styles/noveno3.css";
import "../Styles/noveno4.css";
import "../Styles/decimo1.css";   // 10° · base Future Me (todas las piezas compartidas de décimo)
import useGlobalReducer from "../hooks/useGlobalReducer";
import audioUsedBike from "../assets/img/1DECIMO.mp3"; // 🎧 Listening clase 4 · The Used Bike (cámbiale el nombre si tu archivo se llama distinto)

/* =====================================================================
   GRADO 10 · PERIODO 1 · FROM ZERO (B1+ a B2)
   Año "FUTURE ME": cada periodo lee las filas anteriores ("10P1"…"10P3") y suma una Future Me Card.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "10P1", Grado = "10".
   ===================================================================== */
const PERIOD_KEY = "10P1";
const GRADE = "10";
/* =====================================================================
   HELPERS
   ===================================================================== */
const shuffleArr = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const sample = (arr, n) => (!n || n >= arr.length ? shuffleArr(arr) : shuffleArr(arr).slice(0, n));
const countWords = (s) => (s && s.trim() ? s.trim().split(/\s+/).length : 0);
const cop = (n) => (Number(n) < 0 ? "−$" : "$") + Math.abs(Math.round(Number(n || 0))).toLocaleString("en-US");
const nowISO = () => new Date().toISOString();
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const appendStarter = (setter) => (s) => setter((t) => (t.trim() ? t.trim() + " " : "") + s + " ");
const num = (v) => { const n = parseFloat(String(v ?? "").replace(/[^\d.-]/g, "")); return Number.isFinite(n) ? n : 0; };
const total = (arr, k = "amount") => (arr || []).reduce((a, x) => a + num(x[k]), 0);
const ceilDiv = (a, b) => (b > 0 ? Math.ceil(a / b) : Infinity);

/* Guarda el resultado y muestra la recompensa de inmediato (UI optimista) */
function useFinish(onSave) {
  const [state, setState] = useState({ done: false, saving: false, coins: 0 });
  const finish = (coins, payload) => {
    setState({ done: true, saving: true, coins });
    Promise.resolve(onSave({ ...payload, xp: coins })).finally(() => setState((s) => ({ ...s, saving: false })));
  };
  return [state, finish];
}

/* =====================================================================
   PIEZAS COMPARTIDAS
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

function ActShell({ icon, title, subtitle, onExit, children }) {
  return (
    <div className="p1-act">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className="start-head">
        <div className="start-ico">{icon}</div>
        <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
      </div>
      {children}
    </div>
  );
}

/* Objetivos de escritura: cada meta acepta VARIAS palabras (no solo "because") */
const W_REASON = { l: "Give a reason", re: /\b(because|since|so|that's why|that is why|the reason|as a result|due to)\b/i, ex: "because · since · so · that's why" };
const W_ADVICE = { l: "Give advice", re: /\b(should|could|need to|needs to|has to|have to|must|it's better|try to|i recommend|i suggest)\b/i, ex: "should · could · need to · I recommend" };
const W_CONTRAST = { l: "Show a contrast", re: /\b(however|although|but|while|whereas|even though|on the other hand|compared (with|to))\b/i, ex: "however · although · but · while" };
const W_OPINION = { l: "Give your opinion", re: /\b(i think|i believe|in my opinion|i recommend|i suggest|i choose|i chose|i would)\b/i, ex: "I think · I believe · in my opinion" };
const W_NUMBERS = (n = 2) => ({ l: `Use ${n} number${n > 1 ? "s" : ""}`, test: (t) => ((t || "").match(/\d[\d,.%]*/g) || []).length >= n, ex: "$350,000 · 20% · 4 weeks" });
const goalHit = (g, t) => (g.test ? g.test(t || "") : g.re ? g.re.test(t || "") : true);
/* Evita textos basura tipo "a a a a": pide palabras reales y variadas */
const realText = (t) => { const w = (t || "").toLowerCase().match(/[a-záéíóúñ']+/g) || []; if (w.length < 4) return w.length > 0; const longW = w.filter((x) => x.length >= 3).length; return new Set(w).size / w.length >= 0.45 && longW / w.length >= 0.4; };
const goalsOk = (t, min, max, goals = []) => { const n = countWords(t); return n >= min && n <= max && realText(t) && goals.every((g) => goalHit(g, t)); };
function WordField({ value, onChange, placeholder, min, max = 120, rows = 4, goals }) {
  const w = countWords(value);
  const ok = w >= min && w <= max;
  const real = realText(value);
  const state = w === 0 ? "" : ok && real ? "ok" : w > max ? "over" : "low";
  return (
    <>
      {goals && goals.length > 0 && (
        <div className="g8-goals">
          <small>✍️ YOUR WRITING CHECKLIST</small>
          <div>
            <span className={ok ? "on" : ""}>{ok ? "✓" : "○"} {min}–{max} words <i>({w})</i></span>
            {goals.map((g) => { const h = goalHit(g, value); return <span key={g.l} className={h ? "on" : ""}>{h ? "✓" : "○"} {g.l} <i>{g.ex}</i></span>; })}
          </div>
        </div>
      )}
      <textarea className="start-input" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      <p className={`word-count ${state}`}>
        {w} words · min {min} · max {max} {w > 0 && !real ? "— write real sentences in English ✋" : ok ? "✓" : w < min ? `— write ${min - w} more` : "— too long, trim it"}
      </p>
    </>
  );
}

function Starters({ items, onPick }) {
  return (
    <div className="p1-starters">
      <span className="terms-label">Tap to start:</span>
      {items.map((s) => <button key={s} type="button" className="p1-chip" onClick={() => onPick(s)}>{s}</button>)}
    </div>
  );
}

function MoneyInput({ value, onChange, placeholder = "0", className = "" }) {
  return (
    <div className={`p2-money ${className}`}>
      <span>$</span>
      <input type="number" min="0" inputMode="numeric" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/* ---------- QUIZ ---------- */
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
  const correctCount = deck.reduce((a, qq, i) => a + (answers[i] === qq.correct ? 1 : 0), 0);
  const pct = Math.round((correctCount / deck.length) * 100);
  const passed = passThreshold == null || pct >= passThreshold;
  let streak = 0; for (let k = current - (answered ? 0 : 1); k >= 0; k--) { if (answers[k] === deck[k].correct) streak++; else break; }

  const next = () => {
    if (!isLast) { setCurrent(current + 1); return; }
    const xp = correctCount * xpPerCorrect + (xpComplete || 0);
    setCoins(xp); setSaving(true); setFinished(true);
    Promise.resolve(onSave({ correct: correctCount, total: deck.length, xp, pct, passed })).finally(() => setSaving(false));
  };
  const retry = () => { setAttempt((a) => a + 1); setCurrent(0); setAnswers({}); setFinished(false); setCoins(0); };

  if (finished) {
    if (!passed) {
      return (
        <div className="s1-reward">
          <div className="reward-badge"><X size={40} strokeWidth={2.1} /></div>
          <h2>Almost there!</h2>
          <p>You got {correctCount} / {deck.length} ({pct}%). You need {passThreshold}% to pass.</p>
          <div className="reward-coins"><Coins size={20} strokeWidth={2.3} /> +{coins} coins</div>
          <p className="reward-note">Your coins are saved. Try again — you will get new questions.</p>
          <button className="s1-btn primary" onClick={retry}>Try again <RefreshCw size={17} strokeWidth={2.4} /></button>
          {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing your progress…</span>}
        </div>
      );
    }
    return <Reward title={correctCount === deck.length ? "Perfect!" : "You passed!"} subtitle={`You got ${correctCount} / ${deck.length} correct.`} coins={coins} saving={saving} onExit={onExit} />;
  }

  return (
    <div className="s1-quiz">
      <div className="quiz-top"><h2>{emoji} {title}</h2><span className="quiz-count">{current + 1} / {deck.length}</span></div>
      <div className="g8-qdots">{deck.map((qq, k) => <i key={k} className={answers[k] === undefined ? (k === current ? "now" : "") : answers[k] === qq.correct ? "ok" : "no"} />)}{streak >= 2 && <span className="g8-streak" key={streak}>🔥 Streak ×{streak}</span>}</div>
      <p className="quiz-q">{q.q}</p>
      <div className="quiz-options">
        {q.order.map((oi, pos) => {
          let cls = "quiz-opt";
          if (answered) { if (oi === q.correct) cls += " correct"; else if (oi === answers[current]) cls += " wrong"; }
          return (
            <button key={oi} className={cls} onClick={() => pick(oi)} disabled={answered}>
              <span className="opt-key">{String.fromCharCode(65 + pos)}</span>
              <span className="opt-text">{q.options[oi]}</span>
              {answered && oi === q.correct && <Check size={18} strokeWidth={3} className="opt-tick" />}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="quiz-feedback"><Lightbulb size={18} strokeWidth={2.2} />
          <span><b>{answers[current] === q.correct ? `Correct! +${xpPerCorrect} 🪙 ` : "Not quite. "}</b>{q.feedback}</span>
        </div>
      )}
      <div className="quiz-nav">
        <button className="s1-btn ghost" onClick={onExit}>Save &amp; exit</button>
        <button className="s1-btn primary" onClick={next} disabled={!answered}>{isLast ? "Finish" : "Next"} <ChevronRight size={18} strokeWidth={2.4} /></button>
      </div>
    </div>
  );
}

/* ---------- READER (lectura con imagen y glosario) ---------- */
function Reader({ tag, title, subtitle, minutes, img, sections, glossary, done, coins, finishLabel = "I've finished reading", onFinish, onExit }) {
  const terms = useMemo(() => Object.keys(glossary || {}).sort((a, b) => b.length - a.length), [glossary]);
  const re = useMemo(() => (terms.length ? new RegExp("(" + terms.map(escapeRe).join("|") + ")", "gi") : null), [terms]);
  const [term, setTerm] = useState(null);
  const render = (text) => (!re ? text : text.split(re).map((part, i) => {
    if (!part) return null;
    const hit = terms.find((t) => t.toLowerCase() === part.toLowerCase());
    return hit ? <mark className="hl" key={i} title={glossary[hit]}>{part}</mark> : <React.Fragment key={i}>{part}</React.Fragment>;
  }));

  return (
    <div>
      <div className="reader-bar">
        <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
        {minutes && <div className="reader-meta"><Clock size={15} strokeWidth={2.3} /> ~{minutes} min read</div>}
      </div>
      <article className="s1-reader">
        <span className="reader-tag">{tag}</span>
        <h1>{title}</h1>
        {subtitle && <p className="reader-sub">{subtitle}</p>}
        {img && <img className="p2-hero-img" src={img} alt="" loading="lazy" />}
        {terms.length > 0 && (
          <div className="reader-terms">
            <span className="terms-label">Key words (tap for meaning):</span>
            {terms.slice().reverse().map((t) => (
              <button key={t} className={`term-chip ${term === t ? "on" : ""}`} onClick={() => setTerm(term === t ? null : t)}>{t}</button>
            ))}
          </div>
        )}
        {term && <div className="term-pop"><b>{term}</b> — {glossary[term]}</div>}
        <div className="reader-body">
          {sections.map((b, i) => {
            if (b.h) return <h2 key={i}>{b.h}</h2>;
            if (b.sub) return <h3 key={i} className="p1-sub">{b.sub}</h3>;
            if (b.say) return <p key={i} className="p1-say">{render(b.say)}</p>;
            if (b.box) return <div key={i} className="p1-callout"><span className="p1-callout-text">{render(b.box)}</span></div>;
            if (b.list) return <ul key={i} className="p1-list">{b.list.map((l, k) => <li key={k}>{render(l)}</li>)}</ul>;
            if (b.olist) return <ol key={i} className="p1-list">{b.olist.map((l, k) => <li key={k}>{render(l)}</li>)}</ol>;
            if (b.node) return <React.Fragment key={i}>{b.node}</React.Fragment>;
            return <p key={i}>{render(b.p)}</p>;
          })}
        </div>
        <div className="reader-finish">
          {done ? <span className="reader-done"><Check size={18} strokeWidth={3} /> You've read this</span>
            : <button className="s1-btn primary big" onClick={onFinish}><Check size={18} strokeWidth={2.6} /> {finishLabel} {coins != null && <span className="coin-tag"><Coins size={15} /> +{coins}</span>}</button>}
        </div>
      </article>
    </div>
  );
}

/* Lee primero y después hace la actividad (una sola tarjeta en el menú) */
function ReadThen({ children, onExit, finishLabel, ...rp }) {
  const [stage, setStage] = useState("read");
  useEffect(() => { window.scrollTo({ top: 0 }); }, [stage]);
  if (stage === "do") return children;
  return <Reader {...rp} done={false} finishLabel={finishLabel || "I read it — start the activity"} onFinish={() => setStage("do")} onExit={onExit} />;
}

/* ---------- MATCH PAIRS ---------- */
function MatchPairs({ pairs, leftLabel = "Words", rightLabel = "Meanings", onDone, onRestart }) {
  const [lefts] = useState(() => shuffleArr(pairs.map((p, i) => ({ t: p.a, i }))));
  const [rights] = useState(() => shuffleArr(pairs.map((p, i) => ({ t: p.b, i }))));
  const [sel, setSel] = useState(null);
  const [matched, setMatched] = useState({});
  const [bad, setBad] = useState(null);
  const [errors, setErrors] = useState(0);
  const [missed, setMissed] = useState({});
  const count = Object.keys(matched).length;

  const tapRight = (i) => {
    if (matched[i]) return;
    if (sel === null) { setBad(i); setTimeout(() => setBad(null), 350); return; }
    if (i === sel) {
      const m = { ...matched, [i]: true };
      setMatched(m); setSel(null);
      if (Object.keys(m).length === pairs.length) {
        const firstTry = pairs.length - Object.keys(missed).length;
        setTimeout(() => onDone({ errors, firstTry }), 450);
      }
    } else {
      setErrors((e) => e + 1); setMissed((ms) => ({ ...ms, [sel]: true }));
      setBad(i); setTimeout(() => setBad(null), 500);
    }
  };

  return (
    <div className="p1-match">
      <div className="p1-match-stats">
        <span>Pairs: <b>{count}/{pairs.length}</b> · Mistakes: <b>{errors}</b></span>
        {onRestart && <button type="button" className="p1-link" onClick={onRestart}><RefreshCw size={14} /> Restart</button>}
      </div>
      <div className="p1-match-cols">
        <div className="p1-match-col">
          <span className="p1-col-label">{leftLabel}</span>
          {lefts.map((l) => (
            <button key={l.i} type="button" disabled={!!matched[l.i]}
              className={`p1-mbtn left ${sel === l.i ? "sel" : ""} ${matched[l.i] ? "ok" : ""}`}
              onClick={() => setSel(sel === l.i ? null : l.i)}>{l.t}</button>
          ))}
        </div>
        <div className="p1-match-col">
          <span className="p1-col-label">{rightLabel}</span>
          {rights.map((r) => (
            <button key={r.i} type="button" disabled={!!matched[r.i]}
              className={`p1-mbtn ${matched[r.i] ? "ok" : ""} ${bad === r.i ? "bad p1-shake" : ""}`}
              onClick={() => tapRight(r.i)}>{r.t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- SORT BUCKETS ---------- */
function SortBuckets({ buckets, items, onDone, doneLabel = "Finish" }) {
  const [list] = useState(() => shuffleArr(items));
  const [ch, setCh] = useState({});
  const all = Object.keys(ch).length === list.length;
  const correct = list.reduce((a, it, i) => a + (ch[i] === it.answer ? 1 : 0), 0);
  return (
    <>
      <div className="sort-list">
        {list.map((it, i) => {
          const picked = ch[i];
          const ok = picked === it.answer;
          return (
            <div key={i} className={`sort-item ${picked ? (ok ? "ok" : "no") : ""}`}>
              <div className="sort-row-top">
                <span className="sort-label">{it.e && <span className="p1-emoji">{it.e}</span>}{it.label}</span>
                <div className="sort-btns p1-bucket-btns">
                  {buckets.map((b) => (
                    <button key={b.id} className={`sort-btn ${picked === b.id ? "on" : ""}`} disabled={!!picked}
                      style={picked === b.id ? { background: b.color, borderColor: b.color, color: "#fff", opacity: 1 } : undefined}
                      onClick={() => setCh({ ...ch, [i]: b.id })}>{b.icon} {b.label}</button>
                  ))}
                </div>
                {picked && <span className={`sort-mark ${ok ? "ok" : "no"}`}>{ok ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}</span>}
              </div>
              {picked && (it.why || !ok) && (
                <p className="sort-why">{!ok && <b>Answer: {buckets.find((b) => b.id === it.answer)?.label}. </b>}{it.why}</p>
              )}
            </div>
          );
        })}
      </div>
      <div className="sort-foot">
        <span className="sort-count">{Object.keys(ch).length} / {list.length} sorted</span>
        <button className="s1-btn primary" disabled={!all} onClick={() => onDone({ correct, total: list.length })}>
          {doneLabel} <ChevronRight size={18} strokeWidth={2.4} />
        </button>
      </div>
    </>
  );
}

function SortActivity({ icon, title, subtitle, intro, buckets, items, per = 2, bonus = 4, doneTitle, onSave, onExit }) {
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title={doneTitle || "Great sorting! ✅"} subtitle="Every answer is a new money skill." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={icon} title={title} subtitle={subtitle} onExit={onExit}>
      {intro}
      <SortBuckets buckets={buckets} items={items} onDone={(r) => finish(r.correct * per + bonus, r)} />
    </ActShell>
  );
}

/* ---------- ORDER GAME (ordenar eventos) ---------- */
function OrderGame({ items, labels, onDone }) {
  const [cards] = useState(() => shuffleArr(items.map((t, i) => ({ id: i, t }))));
  const [sel, setSel] = useState(null);
  const [slots, setSlots] = useState({});
  const [locked, setLocked] = useState({});
  const [errors, setErrors] = useState(0);
  const [msg, setMsg] = useState("");
  const placed = Object.values(slots);
  const bank = cards.filter((c) => !placed.includes(c.id));
  const allLocked = items.every((_, i) => locked[i]);

  const tapSlot = (s) => {
    if (locked[s]) return;
    if (sel === null) { if (slots[s] !== undefined) { const n = { ...slots }; delete n[s]; setSlots(n); } return; }
    const n = { ...slots };
    Object.keys(n).forEach((k) => { if (n[k] === sel) delete n[k]; });
    n[s] = sel; setSlots(n); setSel(null);
  };
  const check = () => {
    const n = { ...slots }, lk = { ...locked }; let wrong = 0;
    items.forEach((_, i) => { if (n[i] === i) lk[i] = true; else { if (n[i] !== undefined) wrong++; delete n[i]; } });
    setSlots(n); setLocked(lk);
    if (wrong) { setErrors((e) => e + wrong); setMsg(`${wrong} card(s) are in the wrong place. They went back — try again!`); }
    else if (items.every((_, i) => lk[i])) setMsg("🎉 Perfect order!");
    else setMsg("Good! Now place the other cards.");
  };

  return (
    <>
      <div className="p1-tl">
        {items.map((_, i) => {
          const card = cards.find((c) => c.id === slots[i]);
          return (
            <button key={i} type="button" className={`p1-tl-slot ${locked[i] ? "ok" : ""} ${card ? "filled" : ""}`} onClick={() => tapSlot(i)}>
              <span className="p1-tl-dot" />
              <span className="p1-tl-date">{labels?.[i] || `Step ${i + 1}`}</span>
              {card ? <span className="p1-tl-card">{card.t}</span> : <span className="p1-tl-empty">{sel !== null ? "Tap to place here" : "Empty"}</span>}
            </button>
          );
        })}
      </div>
      {bank.length > 0 && (
        <div className="p1-tl-bank">
          {bank.map((c) => (
            <button key={c.id} type="button" className={`p1-tl-pick ${sel === c.id ? "sel" : ""}`} onClick={() => setSel(sel === c.id ? null : c.id)}>{c.t}</button>
          ))}
        </div>
      )}
      {msg && <div className={`p1-banner ${allLocked ? "good" : ""}`}>{msg}</div>}
      <div className="start-foot">
        {!allLocked
          ? <button className="s1-btn primary big" disabled={placed.length === 0} onClick={check}>Check my order <Check size={17} strokeWidth={2.6} /></button>
          : <button className="s1-btn primary big" onClick={() => onDone({ errors })}>Continue <ChevronRight size={18} /></button>}
      </div>
    </>
  );
}

/* ---------- FLIP MEMORY (voltear y encontrar parejas) ---------- */
const FLIP_COLORS = ["#16b074", "#f5b23e", "#ff6b57", "#5b8def", "#9b5de5", "#0b7a50", "#e07a2f", "#3a86c8"];
function FlipMemory({ pairs, back = "🐖", onDone }) {
  const cards = useMemo(() => shuffleArr(pairs.flatMap((p, i) => [
    { key: i + "a", pid: i, text: p.a, sub: "word", color: FLIP_COLORS[i % FLIP_COLORS.length] },
    { key: i + "b", pid: i, text: p.b, sub: "meaning", color: FLIP_COLORS[i % FLIP_COLORS.length] },
  ])), [pairs]);
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState({});
  const [errors, setErrors] = useState(0);
  const errRef = useRef(0);
  const busy = useRef(false);
  const flip = (i) => {
    if (busy.current || open.includes(i) || matched[cards[i].pid]) return;
    const o = [...open, i]; setOpen(o);
    if (o.length < 2) return;
    busy.current = true;
    const [a, b] = o;
    if (cards[a].pid === cards[b].pid) {
      const m = { ...matched, [cards[a].pid]: true };
      setTimeout(() => {
        setMatched(m); setOpen([]); busy.current = false;
        if (Object.keys(m).length === pairs.length) setTimeout(() => onDone({ errors: errRef.current }), 600);
      }, 400);
    } else {
      errRef.current += 1; setErrors(errRef.current);
      setTimeout(() => { setOpen([]); busy.current = false; }, 1000);
    }
  };
  return (
    <>
      <div className="p1-match-stats"><span>Pairs: <b>{Object.keys(matched).length}/{pairs.length}</b> · Mistakes: <b>{errors}</b></span></div>
      <div className="p1-flip p2-flip">
        {cards.map((c, i) => {
          const isOpen = open.includes(i) || matched[c.pid];
          return (
            <button key={c.key} type="button" className={`p1-fcard ${isOpen ? "open" : ""} ${matched[c.pid] ? "matched" : ""}`} style={{ "--bill": c.color }} onClick={() => flip(i)}>
              <span className="p1-fback">{back}</span>
              <span className="p1-ffront"><b>{c.text}</b><small>{c.sub}</small></span>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ---------- WRITING TASK ---------- */
function WritingTask({ icon, title, subtitle, prompt, tip, starters, example, min, max, coins, existing, top, onSave, onExit }) {
  const [text, setText] = useState(existing?.text || "");
  const [showEx, setShowEx] = useState(false);
  const [st, finish] = useFinish(onSave);
  const w = countWords(text);
  const ok = w >= min && w <= max;
  if (st.done) return <Reward title="Great writing! ✍️" subtitle={`You wrote ${w} words in English.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={icon || <PenLine size={22} strokeWidth={2.1} />} title={title} subtitle={subtitle} onExit={onExit}>
      {top}
      <div className="start-block">
        <h3><span className="step-n">✦</span> {prompt}</h3>
        {tip && <p className="start-tip">{tip}</p>}
        {starters && <Starters items={starters} onPick={appendStarter(setText)} />}
        <WordField value={text} onChange={setText} min={min} max={max} rows={6} placeholder="Write here in English…" />
        {example && (
          <>
            <button type="button" className="p1-link" onClick={() => setShowEx(!showEx)}><Lightbulb size={14} /> {showEx ? "Hide the example" : "Show me an example"}</button>
            {showEx && <div className="term-pop">{example}</div>}
          </>
        )}
      </div>
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!ok} onClick={() => finish(coins, { text, words: w })}>
          Send my writing <span className="coin-tag"><Coins size={15} /> +{coins}</span>
        </button>
      </div>
    </ActShell>
  );
}

/* ---------- FRAMES (completar oraciones para hablar) ---------- */
function FrameWriter({ icon, title, subtitle, frames, top, coins = 20, existing, onSave, onExit }) {
  const [vals, setVals] = useState(existing?.parts || frames.map(() => ""));
  const [said, setSaid] = useState(false);
  const [st, finish] = useFinish(onSave);
  const filled = vals.map((v) => countWords(v) >= 1);
  const ready = filled.every(Boolean) && said;
  if (st.done) return <Reward title="Ready to speak! 🗣️" subtitle="Say your sentences with confidence." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={icon || <Mic size={22} strokeWidth={2.1} />} title={title} subtitle={subtitle} onExit={onExit}>
      {top}
      {frames.map((f, i) => (
        <div key={i} className="start-block p1-nego">
          <div className="p1-nego-row">
            <span className="p1-frame">{f.frame}</span>
            <input className="start-input" value={vals[i]} placeholder={f.ph} onChange={(e) => setVals(vals.map((v, k) => (k === i ? e.target.value : v)))} />
          </div>
          {f.hint && <p className="start-tip p2-hint-line">💡 {f.hint}</p>}
          <p className={`word-count ${filled[i] ? "ok" : ""}`}>{filled[i] ? "✓ Done" : "Complete this sentence"}</p>
        </div>
      ))}
      <label className="perm-check p1-check">
        <input type="checkbox" checked={said} onChange={(e) => setSaid(e.target.checked)} />
        <span>🎤 I said my sentences aloud to a partner.</span>
      </label>
      {!ready && (
        <div className="p2-missing"><b>To save:</b>
          {!filled.every(Boolean) && <span>• Complete all the sentences ({filled.filter(Boolean).length}/{frames.length}).</span>}
          {!said && <span>• Check the box “I said my sentences aloud”.</span>}
        </div>
      )}
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!ready} onClick={() => finish(coins, { parts: vals, sentences: frames.map((f, i) => `${f.frame} ${vals[i].trim()}`) })}>
          Save my sentences <span className="coin-tag"><Coins size={15} /> +{coins}</span>
        </button>
      </div>
    </ActShell>
  );
}

/* ---------- MEDIA (ver o escuchar completo) ---------- */
function MediaCheck({ src, icon, title, subtitle, tip, coins, doneLabel, onSave, onExit }) {
  const [heard, setHeard] = useState(false);
  const [st, finish] = useFinish(onSave);
  const track = (e) => { const m = e.currentTarget; if (m.duration && m.currentTime / m.duration > 0.9) setHeard(true); };
  if (st.done) return <Reward title="Video complete! 🎬" subtitle="Your ears are getting stronger in English." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={icon} title={title} subtitle={subtitle} onExit={onExit}>
      <div className="video-frame"><video src={src} controls playsInline preload="metadata" controlsList="nodownload" onEnded={() => setHeard(true)} onTimeUpdate={track} /></div>
      {tip && <p className="video-hint">{tip}</p>}
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!heard} onClick={() => finish(coins, { completed: true })}>
          {heard ? doneLabel : "Finish the video first"} <span className="coin-tag"><Coins size={15} /> +{coins}</span>
        </button>
      </div>
    </ActShell>
  );
}

function VideoQuiz({ src, title, questions, pickCount, intro, onSave, onExit }) {
  return (
    <div>
      <div className="reader-bar">
        <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
        <a className="speed-toggle" href={src} target="_blank" rel="noreferrer"><Video size={15} strokeWidth={2.4} /> Open in new tab</a>
      </div>
      {intro}
      <div className="video-frame"><video src={src} controls playsInline preload="metadata" controlsList="nodownload" /></div>
      <p className="video-hint">🎧 Watch the video. Then answer {pickCount} questions — you need 70% to pass.</p>
      <QuizRunner title={title} emoji="🎬" questions={questions} pickCount={pickCount} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={onSave} onExit={onExit} />
    </div>
  );
}

/* ---------- ROUNDS (problemas de número o de opción, con pista) ---------- */
function RoundsRunner({ rounds, onDone, doneLabel = "Finish" }) {
  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [wrong, setWrong] = useState([]);
  const [tries, setTries] = useState(0);
  const [status, setStatus] = useState(null);
  const [log, setLog] = useState([]);
  const r = rounds[i];
  const isChoice = Array.isArray(r.options);
  /* Se baraja UNA sola vez al abrir: las opciones no cambian de lugar mientras responden */
  const [orders] = useState(() => rounds.map((x) => (Array.isArray(x.options) ? shuffleArr(x.options.map((_, k) => k)) : null)));
  const closed = status === "ok" || status === "reveal";
  const fmt = (v) => (r.money ? cop(v) : `${Number(v).toLocaleString("en-US")}${r.unit ? " " + r.unit : ""}`);
  const firstTry = log.filter((x) => x === 1).length;

  const check = (choice) => {
    if (closed) return;
    const ok = isChoice ? choice === r.correct : Math.abs(num(val) - r.answer) <= (r.tol || 0);
    if (ok) { setStatus("ok"); setLog((l) => [...l, tries === 0 ? 1 : 0.5]); return; }
    if (isChoice) setWrong((w) => [...w, choice]);
    if (tries === 0) { setTries(1); setStatus("bad"); }
    else { setStatus("reveal"); setLog((l) => [...l, 0]); }
  };
  const next = () => {
    if (i === rounds.length - 1) { onDone({ firstTry, total: rounds.length, answers: log }); return; }
    setI(i + 1); setVal(""); setWrong([]); setTries(0); setStatus(null);
  };

  return (
    <>
      <div className="start-block">
        <div className="p1-match-stats"><span>Problem <b>{i + 1}/{rounds.length}</b></span><span>First try: <b>{firstTry}</b> ⭐</span></div>
        {r.tag && <span className="diag-dim">{r.tag}</span>}
        <p className="quiz-q">{r.q}</p>
        {r.visual}
        {isChoice ? (
          <div className="quiz-options">
            {orders[i].map((k, pos) => { const o = r.options[k]; return (
              <button key={k} type="button" disabled={closed || wrong.includes(k)} onClick={() => check(k)}
                className={`quiz-opt ${closed && k === r.correct ? "correct" : ""} ${wrong.includes(k) ? "wrong" : ""}`}>
                <span className="opt-key">{String.fromCharCode(65 + pos)}</span><span className="opt-text">{o}</span>
                {closed && k === r.correct && <Check size={18} strokeWidth={3} className="opt-tick" />}
              </button>
            ); })}
          </div>
        ) : (
          <div className="p2-answer-row">
            {r.money && <span className="p2-unit">$</span>}
            <input className="start-input p2-num" type="number" inputMode="numeric" value={val} disabled={closed}
              onChange={(e) => { setVal(e.target.value); if (status === "bad") setStatus("retry"); }}
              onKeyDown={(e) => { if (e.key === "Enter" && val !== "") check(); }} placeholder="Your answer" />
            {r.unit && <span className="p2-unit">{r.unit}</span>}
            <button className="s1-btn primary" disabled={val === "" || closed} onClick={() => check()}>Check <Check size={16} /></button>
          </div>
        )}
        {status === "bad" && <div className="p1-hint">💡 {r.hint || "Not yet! Read the numbers again and try one more time."}</div>}
        {status === "ok" && <div className="p1-banner good"><Check size={18} /> <span><b>Correct!</b> {r.explain}</span></div>}
        {status === "reveal" && <div className="p1-banner bad"><span>The answer is <b>{isChoice ? r.options[r.correct] : fmt(r.answer)}</b>. {r.explain}</span></div>}
      </div>
      {closed && <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{i === rounds.length - 1 ? doneLabel : "Next problem"} <ChevronRight size={18} /></button></div>}
    </>
  );
}

function NumberRounds({ icon, title, subtitle, intro, rounds, coinsPer = 3, bonus = 6, doneTitle, onSave, onExit }) {
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title={doneTitle || "Math champion! 🧮"} subtitle="Numbers + English = super power." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={icon || <Calculator size={22} strokeWidth={2.1} />} title={title} subtitle={subtitle} onExit={onExit}>
      {intro}
      <RoundsRunner rounds={rounds} onDone={(r) => finish(r.firstTry * coinsPer + bonus, { firstTry: r.firstTry, total: r.total, answers: r.answers })} />
    </ActShell>
  );
}

/* ---------- QUEST MAP (mapa de salas con insignias y diploma) ---------- */
function QuestMap({ icon, title, subtitle, rooms, diploma, studentName, coins, existing, onSave, onExit }) {
  const [done, setDone] = useState(existing?.rooms || {});
  const [open, setOpen] = useState(null);
  const [st, finish] = useFinish(onSave);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [open]);
  if (st.done) return <Reward title={`${diploma.title}! ${diploma.e}`} subtitle="You completed every mission." coins={st.coins} saving={st.saving} onExit={onExit} gold />;

  const room = rooms.find((r) => r.id === open);
  if (room) {
    return (
      <div className="p1-roomview">
        <div className="reader-bar">
          <button className="s1-btn ghost" onClick={() => setOpen(null)}><ArrowLeft size={17} strokeWidth={2.4} /> Mission map</button>
          <span className="p1-room-tag">{room.e} {room.name}</span>
        </div>
        {room.brief && <div className="p1-challenge"><span>Mission</span><b>{room.brief}</b></div>}
        {room.render((stats) => { setDone((d) => ({ ...d, [room.id]: stats || { ok: true } })); setOpen(null); })}
      </div>
    );
  }
  const count = rooms.filter((r) => done[r.id]).length;
  return (
    <ActShell icon={icon} title={title} subtitle={subtitle} onExit={onExit}>
      <div className="p1-museum-map">
        {rooms.map((r, i) => {
          const isDone = !!done[r.id];
          const locked = i > 0 && !done[rooms[i - 1].id];
          return (
            <button key={r.id} type="button" className={`p1-room ${isDone ? "done" : ""} ${locked ? "locked" : ""}`} disabled={locked} onClick={() => setOpen(r.id)}>
              <span className="p1-room-n">{i + 1}</span>
              <em>{locked ? "🔒" : r.e}</em>
              <b>{r.name}</b>
              <small>{isDone ? `🏅 ${r.badge}` : locked ? "Locked" : "Start mission"}</small>
            </button>
          );
        })}
      </div>
      {count === rooms.length ? (
        <>
          <div className="p1-diploma">
            <span>{diploma.e}</span>
            <small>{diploma.small}</small>
            <h3>{diploma.title}</h3>
            <p>Awarded to <b>{studentName}</b></p>
            <div className="p1-diploma-badges">{rooms.map((r) => <i key={r.id}>{r.e} {r.badge}</i>)}</div>
          </div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(coins, { rooms: done })}>Claim my diploma <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </>
      ) : <p className="start-tip p1-center">{count}/{rooms.length} missions complete · Each mission gives you a badge.</p>}
    </ActShell>
  );
}

/* ---------- LISTA DE DINERO (ingresos / gastos) ---------- */
function MoneyList({ title, icon, tone = "in", rows, setRows, suggestions = [], min = 1, kinds, namePh = "Name" }) {
  const [name, setName] = useState("");
  const [amt, setAmt] = useState("");
  const [kind, setKind] = useState(kinds?.[0]?.id);
  const add = () => {
    if (!name.trim() || num(amt) <= 0) return;
    setRows([...rows, { name: name.trim(), amount: num(amt), ...(kinds ? { kind } : {}) }]);
    setName(""); setAmt("");
  };
  return (
    <div className={`start-block p2-list ${tone}`}>
      <h3>{icon} {title} <span className={`p2-count ${rows.length >= min ? "ok" : ""}`}>{rows.length}/{min}+</span></h3>
      {suggestions.length > 0 && (
        <div className="p1-starters"><span className="terms-label">Ideas:</span>
          {suggestions.map((s) => <button key={s} type="button" className="p1-chip" onClick={() => setName(s)}>{s}</button>)}
        </div>
      )}
      <div className="exp-add">
        <input className="start-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={namePh} />
        <input className="start-input sm" type="number" min="0" inputMode="numeric" value={amt} onChange={(e) => setAmt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }} placeholder="$" />
        {kinds && (
          <div className="type-toggle">
            {kinds.map((k) => (
              <button key={k.id} type="button" className={kind === k.id ? "on" : ""} style={kind === k.id ? { background: k.color, color: "#fff" } : undefined} onClick={() => setKind(k.id)}>{k.label}</button>
            ))}
          </div>
        )}
        <button type="button" className="exp-add-btn" onClick={add} aria-label="Add"><Plus size={18} strokeWidth={2.6} /></button>
      </div>
      {rows.length > 0 && (
        <div className="exp-list">
          {rows.map((r, i) => {
            const k = kinds?.find((x) => x.id === r.kind);
            return (
              <div key={i} className="exp-row">
                {k && <span className="exp-tag" style={{ background: k.color + "22", color: k.color }}>{k.label}</span>}
                <span className="exp-name">{r.name}</span>
                <span className="exp-amt">{cop(r.amount)}</span>
                <button type="button" className="exp-del" onClick={() => setRows(rows.filter((_, x) => x !== i))} aria-label="Delete"><Trash2 size={15} /></button>
              </div>
            );
          })}
        </div>
      )}
      <div className="p2-list-total"><span>Total</span><b>{cop(total(rows))}</b></div>
    </div>
  );
}

/* Barra apilada con leyenda */
function StackBar({ parts, max }) {
  const sum = max || parts.reduce((a, p) => a + Math.max(0, p.value), 0) || 1;
  return (
    <>
      <div className="p2-stack">{parts.map((p) => <i key={p.label} style={{ width: `${(Math.max(0, p.value) / sum) * 100}%`, background: p.color }} title={`${p.label}: ${cop(p.value)}`} />)}</div>
      <div className="p2-legend">{parts.map((p) => <span key={p.label}><i style={{ background: p.color }} />{p.label} <b>{cop(p.value)}</b></span>)}</div>
    </>
  );
}

/* Tienda (para comparar precios) */
function StoreCard({ name, rows, total: tot, badge, strike, final, best }) {
  return (
    <div className={`p2-store ${best ? "best" : ""}`}>
      <div className="p2-store-head">🏪 {name}{badge && <span className="p2-badge">{badge}</span>}</div>
      {rows && rows.map(([l, p]) => <div key={l} className="p2-store-row"><span>{l}</span><b>{cop(p)}</b></div>)}
      {strike != null && <div className="p2-store-row"><span>Original price</span><s>{cop(strike)}</s></div>}
      {tot != null && <div className="p2-store-total"><span>{final ? "Final price" : "Total"}</span><b>{cop(tot)}</b></div>}
    </div>
  );
}

const pctChange = (oldV, newV) => (Number(oldV) > 0 ? ((Number(newV) - Number(oldV)) / Number(oldV)) * 100 : 0);
const fmtPct = (v, d = 1) => `${v > 0 ? "+" : ""}${Number(v).toFixed(d)}%`;
const COLORS = ["#16b074", "#f5b23e", "#ff6b57", "#0b7a50", "#e07a2f"];

function QRow({ n, q, children }) {
  return <div className="p3-qrow"><span className="step-n">{n}</span><div><b>{q}</b>{children}</div></div>;
}

/* Una pregunta con varias respuestas posibles correctas */
function ChoiceCard({ options, good, picked, onAnswer, feedback }) {
  return (
    <div className="quiz-options">
      {options.map((o, k) => {
        const isGood = good.includes(k);
        const cls = picked === null ? "" : k === picked ? (isGood ? "correct" : "wrong") : isGood ? "correct" : "";
        return (
          <button key={k} type="button" disabled={picked !== null} className={`quiz-opt ${cls}`} onClick={() => onAnswer(k)}>
            <span className="opt-key">{"ABCDE"[k]}</span><span className="opt-text">{o}</span>
          </button>
        );
      })}
      {picked !== null && feedback && <div className={`p1-banner ${good.includes(picked) ? "good" : "bad"}`}>{feedback}</div>}
    </div>
  );
}

/* ---------- GRÁFICA DE LÍNEAS (SVG) ---------- */
function LineChart({ series, labels, height = 220, money = true, yMin, yMax, unit = "", highlight }) {
  const W = 560, H = height, L = 62, R = 16, T = 16, B = 34;
  const [tip, setTip] = useState(null);
  const all = series.flatMap((s) => s.values.filter((v) => v != null));
  let lo = yMin ?? Math.min(...all), hi = yMax ?? Math.max(...all);
  if (!isFinite(lo) || !isFinite(hi)) { lo = 0; hi = 1; }
  if (lo === hi) { lo = lo * 0.9; hi = hi * 1.1 || 1; }
  const raw = (hi - lo) / 5 || 1, mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s2) => s2 >= raw) || 10 * mag;
  if (yMin == null) lo = Math.max(0, Math.floor((lo - step * 0.3) / step) * step);
  if (yMax == null) hi = Math.ceil((hi + step * 0.3) / step) * step;
  const n = labels.length;
  const x = (i) => L + (n === 1 ? (W - L - R) / 2 : (i * (W - L - R)) / (n - 1));
  const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const ticks = [];
  for (let t = Math.ceil(lo / step - 1e-9) * step; t <= hi + 1e-9; t += step) ticks.push(t);
  const fmt = (v) => { if (!money) return `${Math.round(v)}${unit}`; const a = Math.abs(v), sg = v < 0 ? "−" : ""; if (a >= 1e6) return `${sg}$${+(a / 1e6).toFixed(a >= 1e7 ? 0 : 1)}M`; if (a >= 1e4) return `${sg}$${Math.round(a / 1e3)}k`; return cop(Math.round(v / 10) * 10); };
  const exact = (v) => (money ? cop(v) : `${v}${unit}`);
  const show = (p, si, i) => setTip({ x: p[0], y: p[1], c: series[si].color || COLORS[si], t: `${labels[i]}: ${exact(series[si].values[i])}`, k: `${si}-${i}` });
  const tw = tip ? tip.t.length * 7.4 + 20 : 0;
  const tx = tip ? Math.min(Math.max(tip.x - tw / 2, 4), W - tw - 4) : 0;
  const ty = tip ? (tip.y - 42 < 2 ? tip.y + 14 : tip.y - 42) : 0;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="g7-chart" onMouseLeave={() => setTip(null)}>
      {ticks.map((t, k) => <g key={k}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="grid" /><text x={L - 6} y={y(t) + 4} textAnchor="end" className="ax">{fmt(t)}</text></g>)}
      {labels.map((lb, i) => <text key={i} x={x(i)} y={H - 10} textAnchor="middle" className={`ax ${highlight === i ? "hl" : ""}`}>{lb}</text>)}
      {series.map((s, si) => {
        const pts = s.values.map((v, i) => (v == null ? null : [x(i), y(v), i])).filter(Boolean);
        return (
          <g key={si}>
            {pts.length > 1 && <polyline points={pts.map((p) => `${p[0]},${p[1]}`).join(" ")} fill="none" stroke={s.color || COLORS[si]} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />}
            {pts.map((p) => (
              <g key={p[2]} className={`g7-pt ${tip && tip.k === `${si}-${p[2]}` ? "on" : ""}`} tabIndex={0}
                onMouseEnter={() => show(p, si, p[2])} onClick={() => show(p, si, p[2])} onFocus={() => show(p, si, p[2])} onBlur={() => setTip(null)}>
                <circle cx={p[0]} cy={p[1]} r="16" fill="transparent" />
                <circle cx={p[0]} cy={p[1]} r="5" fill="#fff" stroke={s.color || COLORS[si]} strokeWidth="3" className="dot" />
                <title>{`${labels[p[2]]}: ${exact(s.values[p[2]])}`}</title>
              </g>
            ))}
          </g>
        );
      })}
      {tip && (
        <g className="g7-tip" pointerEvents="none">
          <rect x={tx} y={ty} width={tw} height="28" rx="8" fill="#072a1e" />
          <rect x={tx} y={ty + 24} width={tw} height="4" rx="2" fill={tip.c} />
          <text x={tx + tw / 2} y={ty + 18} textAnchor="middle">{tip.t}</text>
        </g>
      )}
    </svg>
  );
}
function ChartLegend({ series }) {
  return <div className="p2-legend">{series.map((s, i) => <span key={s.name}><i style={{ background: s.color || COLORS[i] }} />{s.name}</span>)}</div>;
}

/* ---------- GRÁFICA DE BARRAS (SVG) ---------- */
function BarChart({ bars, height = 220, money = true, unit = "", max }) {
  const W = 560, H = height, L = 62, R = 16, T = 16, B = 40;
  const rawHi = max || Math.max(...bars.map((b) => b.value), 1) * 1.1;
  const mag = Math.pow(10, Math.floor(Math.log10(rawHi / 2)));
  const hi = max || Math.ceil(rawHi / (mag * 2)) * mag * 2;
  const bw = ((W - L - R) / bars.length) * 0.62;
  const x = (i) => L + ((i + 0.5) * (W - L - R)) / bars.length;
  const y = (v) => T + (1 - v / hi) * (H - T - B);
  const fmt = (v) => (money ? cop(Math.round(v)) : `${Math.round(v)}${unit}`);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="g7-chart">
      {[0, 0.5, 1].map((f, k) => <g key={k}><line x1={L} x2={W - R} y1={y(hi * f)} y2={y(hi * f)} className="grid" /><text x={L - 6} y={y(hi * f) + 4} textAnchor="end" className="ax">{fmt(hi * f)}</text></g>)}
      {bars.map((b, i) => (
        <g key={i}>
          <rect x={x(i) - bw / 2} y={y(b.value)} width={bw} height={Math.max(0, y(0) - y(b.value))} rx="6" fill={b.color || COLORS[i % COLORS.length]} />
          <text x={x(i)} y={y(b.value) - 6} textAnchor="middle" className="val">{fmt(b.value)}</text>
          <text x={x(i)} y={H - 14} textAnchor="middle" className="ax">{b.label}</text>
        </g>
      ))}
    </svg>
  );
}

function Sparkline({ values, color = "#16b074" }) {
  const v = values.filter((a) => a != null);
  if (v.length < 2) return <span className="g7-spark-empty">—</span>;
  const lo = Math.min(...v), hi = Math.max(...v), W = 90, H = 28;
  const pts = v.map((a, i) => `${(i * W) / (v.length - 1)},${hi === lo ? H / 2 : H - 3 - ((a - lo) / (hi - lo)) * (H - 6)}`).join(" ");
  return <svg viewBox={`0 0 ${W} ${H}`} className="g7-spark"><polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" /></svg>;
}

/* Tarjetas de conceptos que se voltean (definiciones claras) */
function ConceptFlip({ cards }) {
  const [open, setOpen] = useState({});
  return (
    <div className="g7-concepts">
      {cards.map((c, i) => (
        <button key={c.t} type="button" className={`g7-concept ${open[i] ? "open" : ""}`} onClick={() => setOpen({ ...open, [i]: !open[i] })}>
          <em>{c.e}</em><b>{c.t}</b>
          {open[i] ? <><p>{c.d}</p>{c.ex && <small>💡 {c.ex}</small>}</> : <small className="g7-tap">Tap to learn</small>}
        </button>
      ))}
    </div>
  );
}

/* ---------- PIEZAS DE 7° P2 reutilizadas ---------- */
function Meter({ value, color, label }) {
  return (
    <div className="g72-meter">
      {label && <span>{label}</span>}
      <div className="bar"><i style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color || "var(--green)" }} /></div>
      <b>{value}%</b>
    </div>
  );
}

function PhoneFrame({ children, title = "CREAR Bank", dark }) {
  return (
    <div className={`g72-phone ${dark ? "dark" : ""}`}>
      <div className="g72-phone-status"><span>9:41</span><i /><span>📶 🔋</span></div>
      {title && <div className="g72-phone-title">{title}</div>}
      <div className="g72-phone-screen">{children}</div>
    </div>
  );
}


/* =====================================================================
   UTILIDADES NUMÉRICAS
   ===================================================================== */
// Cuota fija de un crédito: P · r / (1 − (1 + r)^−n)
const pmt = (P, r, n) => (r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n)));
const pct = (v, d = 0) => `${Number(v).toFixed(d)}%`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* =====================================================================
   AYUDAS: tablas, casos, errores comunes, controles y radar
   ===================================================================== */
function MiniTable({ head, rows, foot }) {
  return (
    <div className="g73-mtable">
      <div className="h">{head.map((h) => <span key={h}>{h}</span>)}</div>
      {rows.map((r, i) => <div key={i}>{r.map((c, k) => <span key={k}>{c}</span>)}</div>)}
      {foot && <div className="f">{foot.map((c, k) => <span key={k}>{c}</span>)}</div>}
    </div>
  );
}
function MiniCase({ e, who, lines }) {
  return <div className="g73-case"><em>{e}</em><div><b>{who}</b>{lines.map((l) => <span key={l}>{l}</span>)}</div></div>;
}
function Mistakes({ items }) {
  return <div className="g73-mistakes"><b>⚠️ Common mistakes</b>{items.map((m) => <span key={m}>✗ {m}</span>)}</div>;
}

/* Caja "How it works" (siempre clara) */
function HowTo({ title = "How it works", children }) {
  return <div className="g72-howto"><b>{title}</b><span>{children}</span></div>;
}
/* Control deslizante con − y + */
function Ctl({ l, v, set, mn, mx, stp = 1, fmt = (x) => x }) {
  return (
    <label className="g72-ctrl"><span>{l}</span>
      <button type="button" onClick={() => set(Math.max(mn, +(v - stp).toFixed(4)))}><Minus size={14} /></button>
      <input type="range" min={mn} max={mx} step={stp} value={v} onChange={(e) => set(Number(e.target.value))} />
      <button type="button" onClick={() => set(Math.min(mx, +(v + stp).toFixed(4)))}><Plus size={14} /></button>
      <b>{fmt(v)}</b>
    </label>
  );
}
/* Lee la fila de otro periodo (7P1, 7P2, 7P3) desde el store */
const parseJSON = (s) => { try { return s ? (typeof s === "string" ? JSON.parse(s) : s) : {}; } catch { return {}; } };
const rowPoints = (row) => Math.round(["Puntos_Comportamiento", "Puntos_Quizzes", "Puntos_Aprendi"].reduce((a, k) => a + parseFloat(row?.[k] || 0), 0));
const firstText = (o) => { const v = Object.values(o || {}).find((x) => typeof x === "string" && x.trim()); return v || ""; };
const millions = (v) => `$${(v / 1000000).toFixed(v >= 10000000 ? 0 : 1)}M`;

/* ---------- RADAR DE N PUNTAS (antes / después) ---------- */
function RadarN({ labels, values, before }) {
  const n = labels.length, size = 300, c = size / 2, r = size / 2 - 58;
  const ang = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, rad) => [c + rad * Math.cos(ang(i)), c + rad * Math.sin(ang(i))];
  const shape = (vals) => vals.map((v, i) => pt(i, r * (Math.max(v, 4) / 100)).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="p4-radar">
      {[0.25, 0.5, 0.75, 1].map((f, k) => <polygon key={k} points={labels.map((_, i) => pt(i, r * f).join(",")).join(" ")} className="g" />)}
      {labels.map((_, i) => { const [x2, y2] = pt(i, r); return <line key={i} x1={c} y1={c} x2={x2} y2={y2} className="g" />; })}
      {before && <polygon points={shape(before)} className="before" />}
      <polygon points={shape(values)} className="after" />
      {labels.map((lb, i) => { const [x2, y2] = pt(i, r + 30); return <text key={i} x={x2} y={y2} textAnchor="middle" dominantBaseline="middle">{lb}</text>; })}
    </svg>
  );
}

/* Barra apilada en % (para mezclas de inversión) */
function PctBar({ parts }) {
  return (
    <>
      <div className="p2-stack">{parts.map((p) => <i key={p.label} style={{ width: `${Math.max(0, p.value)}%`, background: p.color }} title={`${p.label}: ${p.value}%`} />)}</div>
      <div className="p2-legend">{parts.filter((p) => p.value > 0).map((p) => <span key={p.label}><i style={{ background: p.color }} />{p.label} <b>{p.value}%</b></span>)}</div>
    </>
  );
}

/* =====================================================================
   PIEZAS DE OCTAVO · Financial City + Money Blueprint
   ===================================================================== */
/* Misión al inicio de cada actividad grande */
function Mission({ e = "🎯", title, children }) {
  return <div className="g8-mission"><em>{e}</em><div><small>MISSION BRIEFING</small><b>{title}</b><span>{children}</span></div></div>;
}

/* ---------- STARTER PACK: definiciones desde cero + juego fácil ---------- */
function StarterPack({ icon, title, subtitle, intro, cards, pairs, rounds, coins = 20, onSave, onExit }) {
  const [open, setOpen] = useState({});
  const [stage, setStage] = useState("cards");
  const [round, setRound] = useState(0);
  const [res, setRes] = useState(null);
  const [st, finish] = useFinish(onSave);
  const all = cards.every((_, i) => open[i]);
  if (st.done) return <Reward title="Starter complete! 🧱" subtitle="You have the basics. Now level up!" coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={icon || <Lightbulb size={22} strokeWidth={2.1} />} title={title} subtitle={subtitle} onExit={onExit}>
      <div className="p3-stepper"><span className="on"><b>1</b>Open the cards</span><span className={stage !== "cards" ? "on" : ""}><b>2</b>{pairs ? "Match" : "Quick game"}</span><span className={stage === "recap" ? "on" : ""}><b>3</b>Remember</span></div>
      {stage === "cards" ? (
        <>
          {intro}
          <HowTo>New here? Perfect. Tap <b>every card</b> to learn the basic words. You will use them in all the activities of this class.</HowTo>
          <div className="g7-concepts">
            {cards.map((c, i) => (
              <button key={c.t} type="button" className={`g7-concept ${open[i] ? "open" : ""}`} onClick={() => setOpen({ ...open, [i]: true })}>
                <em>{c.e}</em><b>{c.t}</b>
                {open[i] ? <><p>{c.d}</p>{c.ex && <small>💡 {c.ex}</small>}</> : <small className="g7-tap">Tap to open</small>}
              </button>
            ))}
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!all} onClick={() => setStage("game")}>{all ? (pairs ? "Let's match!" : "Play the quick game") : `Open all the cards (${Object.keys(open).length}/${cards.length})`} <ChevronRight size={18} /></button></div>
        </>
      ) : stage === "game" && pairs ? (
        <div className="start-block"><MatchPairs key={round} pairs={pairs} leftLabel="Word" rightLabel="Meaning" onRestart={() => setRound((r) => r + 1)} onDone={(r) => { setRes({ xp: Math.max(8, coins - r.errors * 2), data: { errors: r.errors, firstTry: r.firstTry } }); setStage("recap"); }} /></div>
      ) : stage === "game" ? (
        <RoundsRunner rounds={rounds} doneLabel="See my cheat sheet" onDone={(r) => { setRes({ xp: Math.round(coins * 0.5) + r.firstTry * 2, data: { firstTry: r.firstTry } }); setStage("recap"); }} />
      ) : (
        <>
          <div className="g8-recap">
            <header><small>📌 MY CHEAT SHEET</small><b>The words of this class</b><span>You will use them in the reading, the video and the games. Take a screenshot or copy them in your notebook!</span></header>
            <div>{cards.map((c) => <div key={c.t}><em>{c.e}</em><b>{c.t}</b><p>{c.d}</p>{c.ex && <small>💡 {c.ex}</small>}</div>)}</div>
          </div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(res?.xp || coins, res?.data || {})}>I've got it! <span className="coin-tag"><Coins size={15} /> +{res?.xp || coins}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- Chat (para lecturas tipo WhatsApp) ---------- */
function ChatThread({ title, msgs }) {
  return (
    <div className="g8-chat">
      {title && <header>💬 {title}</header>}
      {msgs.map((m, i) => <div key={i} className={`g8-msg ${m.me ? "me" : ""}`}><b>{m.who}</b><span>{m.t}</span>{m.time && <small>{m.time}</small>}</div>)}
    </div>
  );
}

/* ---------- Documento tipo recibo / factura ---------- */
function ReceiptDoc({ doc, onLine, picked, reveal }) {
  return (
    <div className={`g8-receipt ${doc.kind}`}>
      <header><b>{doc.store}</b><small>{doc.sub}</small><i>{doc.label}</i></header>
      {doc.meta && <div className="g8-rmeta">{doc.meta.map(([k, v]) => <span key={k}><small>{k}</small>{v}</span>)}</div>}
      <div className="g8-rlines">
        {doc.lines.map((l, i) => {
          const isBad = reveal && doc.bad === i;
          return (
            <button key={i} type="button" disabled={!onLine} className={`g8-rline ${l.kind || ""} ${picked === i ? "picked" : ""} ${isBad ? "bad" : ""}`} onClick={() => onLine && onLine(i)}>
              <span>{l.t}</span><b>{l.v}</b>
            </button>
          );
        })}
      </div>
      {doc.foot && <footer>{doc.foot}</footer>}
    </div>
  );
}

/* ---------- Mini gráfica de barras horizontales ---------- */
function HBars({ rows, money = true, max }) {
  const hi = max || Math.max(...rows.map((r) => r.v), 1);
  return (
    <div className="g8-hbars">
      {rows.map((r) => (
        <div key={r.l} className="g8-hbar"><span>{r.e} {r.l}</span><i><s style={{ width: `${(Math.max(0, r.v) / hi) * 100}%`, background: r.c || "var(--green)" }} /></i><b>{money ? cop(r.v) : r.v}</b></div>
      ))}
    </div>
  );
}

/* Detector de conectores / palabras clave en un texto */
const hasWord = (text, re) => re.test(text || "");
function WordBank({ words, text, need }) {
  const hits = words.filter(([, re]) => hasWord(text, re)).map(([w]) => w);
  return (
    <div className="g74-wordbank">
      {words.map(([w]) => <span key={w} className={hits.includes(w) ? "on" : ""}>{hits.includes(w) ? "✓ " : ""}{w}</span>)}
      {need && <small className="g8-need">{hits.length}/{need} used</small>}
    </div>
  );
}
const countHits = (words, text) => words.filter(([, re]) => hasWord(text, re)).length;
const CONNECTORS = [["because", /\bbecause\b/i], ["should", /\bshould\b/i], ["however", /\bhowever\b/i], ["although", /\balthough\b/i], ["therefore", /\btherefore\b/i], ["so", /\bso\b/i]];

/* =====================================================================
   SPEED SORT · juegos rápidos (cronómetro + combo + repaso de errores)
   ===================================================================== */
function SpeedSort({ icon, title, subtitle, intro, buckets, items, seconds = 60, coins = 24, doneTitle = "Speed champion! ⚡", onSave, onExit }) {
  const [stage, setStage] = useState("intro");
  const [run, setRun] = useState(0);
  const deck = useMemo(() => shuffleArr(items), [items, run]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [okN, setOkN] = useState(0);
  const [miss, setMiss] = useState([]);
  const [left, setLeft] = useState(seconds);
  const [flash, setFlash] = useState(null);
  const [st, finish] = useFinish(onSave);
  const lock = useRef(false);
  useEffect(() => {
    if (stage !== "play") return undefined;
    const t = setInterval(() => setLeft((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [stage]);
  useEffect(() => { if (stage === "play" && (left === 0 || idx >= deck.length)) setStage("end"); }, [left, idx, deck.length, stage]);
  const start = () => { setRun((r) => r + 1); setIdx(0); setScore(0); setCombo(0); setBest(0); setOkN(0); setMiss([]); setLeft(seconds); setFlash(null); lock.current = false; setStage("play"); };
  const answer = (b) => {
    if (lock.current || stage !== "play") return;
    const it = deck[idx];
    if (b === it.b) {
      const c = combo + 1;
      setCombo(c); setBest((x) => Math.max(x, c)); setOkN((n) => n + 1); setScore((s) => s + 10 + Math.min(c - 1, 5) * 2);
      setFlash({ ok: true, k: idx }); lock.current = true;
      setTimeout(() => { lock.current = false; setFlash(null); setIdx((i) => i + 1); }, 380);
    } else {
      setCombo(0); setMiss((m) => [...m, { ...it, picked: b }]);
      setFlash({ ok: false, k: idx, why: it.why, right: it.b }); lock.current = true;
      setTimeout(() => { lock.current = false; setFlash(null); setIdx((i) => i + 1); }, 1700);
    }
  };
  const answered = okN + miss.length;
  const acc = answered ? Math.round((okN / answered) * 100) : 0;
  const passed = answered >= Math.min(8, deck.length) && acc >= 70;
  const B = (id) => buckets.find((x) => x.id === id);
  if (st.done) return <Reward title={doneTitle} subtitle={`${okN}/${answered} correct · best combo ×${best}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  const it = deck[Math.min(idx, deck.length - 1)];
  return (
    <ActShell icon={icon || <Zap size={22} strokeWidth={2.1} />} title={title} subtitle={subtitle} onExit={onExit}>
      {stage === "intro" && (
        <>
          {intro}
          <HowTo>A card appears. Tap the right box <b>as fast as you can</b>. Correct answers in a row = <b>combo</b> 🔥 (more points). A mistake shows you <b>why</b> — read it! You need <b>70%</b> correct to win.</HowTo>
          <div className="g8-rush-buckets intro">{buckets.map((b) => <div key={b.id} style={{ "--bc": b.c }}><em>{b.e}</em><b>{b.l}</b><small>{b.d}</small></div>)}</div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={start}><Play size={16} /> Start · {seconds} seconds</button></div>
        </>
      )}
      {stage === "play" && (
        <div className="g8-rush">
          <div className="g8-rush-top">
            <span className={`g8-rush-time ${left <= 10 ? "low" : ""}`}>⏱️ {left}s</span>
            <span>⭐ {score}</span>
            <span className={`g8-rush-combo ${combo >= 2 ? "hot" : ""}`} key={combo}>🔥 ×{combo}</span>
            <span>{Math.min(idx + 1, deck.length)}/{deck.length}</span>
          </div>
          <div className="g8-rush-timebar"><i style={{ width: `${(left / seconds) * 100}%` }} /></div>
          <div className={`g8-rush-card ${flash ? (flash.ok ? "ok" : "no") : ""}`} key={idx}>
            <em>{it.e}</em><b>{it.t}</b>
            {flash && !flash.ok && <p>❌ It's <b>{B(flash.right).e} {B(flash.right).l}</b>. {flash.why}</p>}
            {flash && flash.ok && <span className="g8-rush-plus">+{10 + Math.min(combo - 1, 5) * 2}</span>}
          </div>
          <div className="g8-rush-buckets">{buckets.map((b) => <button key={b.id} type="button" style={{ "--bc": b.c }} onClick={() => answer(b.id)}><em>{b.e}</em><b>{b.l}</b></button>)}</div>
        </div>
      )}
      {stage === "end" && (
        <>
          <div className="g73-score"><small>{left === 0 ? "TIME'S UP!" : "DECK COMPLETE!"}</small><b className={passed ? "good" : "bad"}>{acc}%</b><span>{okN}/{answered} correct · ⭐ {score} points · best combo 🔥×{best}</span></div>
          {miss.length > 0 && (
            <div className="start-block">
              <h3>📌 Learn from your mistakes</h3>
              <div className="g8-rush-review">{miss.map((m, k) => <div key={k}><b>{m.e} {m.t}</b><span>You chose {B(m.picked).e} {B(m.picked).l} → correct: <b>{B(m.b).e} {B(m.b).l}</b></span><small>💡 {m.why}</small></div>)}</div>
            </div>
          )}
          {!passed && <div className="p1-hint">{answered < Math.min(8, deck.length) ? "Answer at least 8 cards." : "You need 70%."} Read the mistakes and play again — the cards change order!</div>}
          <div className="start-foot"><button className="s1-btn ghost" onClick={start}><RefreshCw size={15} /> Play again</button><button className="s1-btn primary big" disabled={!passed} onClick={() => finish(Math.round(coins * 0.5) + Math.round((coins * 0.5 * acc) / 100), { score, acc, best, mistakes: miss.length })}>Claim my coins <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ===== piezas de noveno que se reutilizan ===== */
function Steps91({ labels, at }) {
  return <div className="g72-steps">{labels.map((s, i) => <span key={s} className={at === i ? "on" : at > i ? "done" : ""}>{s}</span>)}</div>;
}
function Tri({ value, onPick, opts, disabled }) {
  return <div className="type-toggle g83-tri">{opts.map(([k, l]) => <button key={k} type="button" disabled={disabled} className={value === k ? "on" : ""} onClick={() => onPick(k)}>{l}</button>)}</div>;
}
/* Pregunta con orden barajado UNA vez */
function PickOne({ q, options, correct, onRight, explain, tag }) {
  const [order] = useState(() => shuffleArr(options.map((_, k) => k)));
  const [wrong, setWrong] = useState([]);
  const [ok, setOk] = useState(false);
  return (
    <div className="start-block g84-pick">
      {tag && <span className="diag-dim">{tag}</span>}
      <p className="quiz-q">{q}</p>
      <div className="quiz-options">{order.map((k, pos) => <button key={k} type="button" disabled={ok || wrong.includes(k)} className={`quiz-opt ${ok && k === correct ? "correct" : ""} ${wrong.includes(k) ? "wrong" : ""}`} onClick={() => { if (k === correct) { setOk(true); onRight && onRight(wrong.length); } else setWrong([...wrong, k]); }}><span className="opt-key">{"ABCD"[pos]}</span><span className="opt-text">{options[k]}</span></button>)}</div>
      {wrong.length > 0 && !ok && <div className="p1-hint">💡 Not that one — read again and try another option.</div>}
      {ok && explain && <div className="p1-banner good"><Check size={18} /> <span>{explain}</span></div>}
    </div>
  );
}
function Bar91({ label, value, color, suffix = "%" }) {
  return <div className="g91-bar"><span>{label}</span><div><i style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} /></div><b>{Math.round(value)}{suffix}</b></div>;
}
const dot = (t) => { const x = String(t || "").trim(); return !x ? "" : /[.!?]$/.test(x) ? x : `${x}.`; };
const lowFirst = (t) => String(t || "").replace(/^(?!I\b|I')./, (c) => c.toLowerCase());
const W_RISK = { l: "Name a risk", re: /\b(risk|risky|danger|dangerous|lose|loss|problem|careful|warning|expensive)\b/i, ex: "risk · problem · careful · expensive" };
const W_RECOMMEND = { l: "Recommend", re: /\b(recommend|suggest|should|advise|it's better|it is better|choose)\b/i, ex: "I recommend · should · I suggest" };

/* ---------- LISTENING CON MP3 (audio grabado · src/assets/img) ---------- */
function ListenAudio({ title, subtitle, src, script, questions, intro, onSave, onExit }) {
  const [stage, setStage] = useState("listen");
  const [heard, setHeard] = useState(false);
  const [showT, setShowT] = useState(false);
  const [rate, setRate] = useState(1);
  const [err, setErr] = useState(false);
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.playbackRate = rate; }, [rate, stage]);
  const track = (e) => { const a = e.currentTarget; if (a.duration && a.currentTime / a.duration > 0.9) setHeard(true); };
  if (stage === "quiz") return <QuizRunner title={`${title} · listening check`} emoji="🎧" questions={questions} pickCount={8} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={onSave} onExit={onExit} />;
  return (
    <ActShell icon={<Headphones size={22} strokeWidth={2.1} />} title={`Listening: ${title} 🎧`} subtitle={subtitle} onExit={onExit}>
      {intro}
      <HowTo>Press <b>Play</b> and listen carefully — like a podcast. You can listen twice and change the speed. The transcript opens only AFTER you listen to the whole audio. Then answer 8 questions (70% to pass).</HowTo>
      <div className="g91-player on">
        <div className="g91-wave">{Array.from({ length: 28 }, (_, k) => <i key={k} style={{ animationDelay: `${(k % 7) * 0.12}s` }} />)}</div>
        <audio ref={ref} className="g91-audio" src={src} controls preload="metadata" controlsList="nodownload" onEnded={() => setHeard(true)} onTimeUpdate={track} onError={() => { setErr(true); setHeard(true); }} />
        <div className="g91-player-ctl"><Tri value={rate} onPick={setRate} opts={[[0.85, "🐢 Slow"], [1, "🙂 Normal"], [1.15, "⚡ Fast"]]} /></div>
        {err && <p className="p1-hint">💡 The audio could not load. Read the transcript (your teacher can play the audio for the class).</p>}
        {!heard && !err && <p className="g91-now">🎧 Listen to the end to unlock the transcript and the quiz.</p>}
      </div>
      <div className="p3-card-actions"><button type="button" className="s1-btn ghost" disabled={!heard} onClick={() => setShowT(!showT)}><FileText size={16} /> {showT ? "Hide transcript" : heard ? "Show transcript" : "Transcript (after listening)"}</button></div>
      {showT && <div className="g91-transcript">{script.map((s, k) => <p key={k}>{s.who && <b>{s.who}: </b>}{s.t}</p>)}</div>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!heard} onClick={() => { if (ref.current) ref.current.pause(); setStage("quiz"); }}>{heard ? "Start the quiz (8 questions)" : "Listen first"} <ChevronRight size={18} /></button></div>
    </ActShell>
  );
}

/* ---------- LISTENING (voz del navegador · sin archivos de audio) ---------- */
function ListenThen({ title, subtitle, script, questions, onSave, onExit }) {
  const can = typeof window !== "undefined" && "speechSynthesis" in window;
  const [stage, setStage] = useState("listen");
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(!can);
  const [rate, setRate] = useState(0.9);
  const [showT, setShowT] = useState(false);
  const [para, setPara] = useState(-1);
  const stopRef = useRef(false);
  const startedRef = useRef(false);
  const [noAudio, setNoAudio] = useState(false);
  useEffect(() => () => { if (can) window.speechSynthesis.cancel(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const pickVoice = () => { const vs = window.speechSynthesis.getVoices(); return vs.find((v) => /en[-_](US|GB)/i.test(v.lang) && /female|samantha|google|natural/i.test(v.name)) || vs.find((v) => /^en/i.test(v.lang)); };
  const play = () => {
    if (!can) return;
    window.speechSynthesis.cancel(); stopRef.current = false; startedRef.current = false; setPlaying(true);
    setTimeout(() => { if (!startedRef.current && !stopRef.current) { stopRef.current = true; window.speechSynthesis.cancel(); setPlaying(false); setPara(-1); setPlayed(true); setNoAudio(true); } }, 3500);
    const v = pickVoice();
    const say = (i) => {
      if (stopRef.current || i >= script.length) { setPlaying(false); setPara(-1); if (!stopRef.current) setPlayed(true); return; }
      const u = new SpeechSynthesisUtterance(script[i].t);
      if (v) u.voice = v; u.lang = "en-US"; u.rate = rate;
      u.onstart = () => { startedRef.current = true; };
      u.onend = () => say(i + 1); u.onerror = () => say(i + 1);
      setPara(i); window.speechSynthesis.speak(u);
    };
    say(0);
  };
  const stop = () => { if (playing && startedRef.current) setPlayed(true); stopRef.current = true; if (can) window.speechSynthesis.cancel(); setPlaying(false); setPara(-1); };
  if (stage === "quiz") return <QuizRunner title={`${title} · listening check`} emoji="🎧" questions={questions} pickCount={8} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={onSave} onExit={onExit} />;
  return (
    <ActShell icon={<Headphones size={22} strokeWidth={2.1} />} title={`Listening: ${title} 🎧`} subtitle={subtitle} onExit={onExit}>
      <HowTo>Press <b>Play</b> and listen carefully — like a podcast. You can listen twice and slow it down. The transcript opens only AFTER you listen once. Then answer 8 questions (70% to pass).</HowTo>
      <div className={`g91-player ${playing ? "on" : ""}`}>
        <div className="g91-wave">{Array.from({ length: 28 }, (_, k) => <i key={k} style={{ animationDelay: `${(k % 7) * 0.12}s` }} />)}</div>
        <div className="g91-player-ctl">
          {!playing ? <button type="button" className="s1-btn primary" disabled={!can} onClick={play}><Play size={17} /> {played ? "Listen again" : "Play"}</button> : <button type="button" className="s1-btn ghost" onClick={stop}><Pause size={17} /> Stop</button>}
          <Tri value={rate} onPick={setRate} disabled={playing} opts={[[0.75, "🐢 Slow"], [0.9, "🙂 Normal"], [1.05, "⚡ Fast"]]} />
        </div>
        {playing && <p className="g91-now">🔊 Part {para + 1} of {script.length} · {script[para]?.who || ""}</p>}
        {(!can || noAudio) && <p className="p1-hint">💡 This browser can't read aloud. Read the transcript (your teacher can read it to the class).</p>}
      </div>
      <div className="p3-card-actions"><button type="button" className="s1-btn ghost" disabled={!played} onClick={() => setShowT(!showT)}><FileText size={16} /> {showT ? "Hide transcript" : played ? "Show transcript" : "Transcript (after listening)"}</button></div>
      {showT && <div className="g91-transcript">{script.map((s, k) => <p key={k} className={para === k ? "on" : ""}>{s.who && <b>{s.who}: </b>}{s.t}</p>)}</div>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!played} onClick={() => { stop(); setStage("quiz"); }}>{played ? "Start the quiz (8 questions)" : "Listen first"} <ChevronRight size={18} /></button></div>
    </ActShell>
  );
}

/* Descargar una tarjeta como imagen (html2canvas desde cdnjs) */
const loadHtml2Canvas = () => (window.html2canvas ? Promise.resolve(window.html2canvas) : new Promise((res, rej) => {
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  s.onload = () => res(window.html2canvas); s.onerror = rej;
  document.body.appendChild(s);
}));
const downloadPNG = async (id, file) => { try { const h2c = await loadHtml2Canvas(); const cv = await h2c(document.getElementById(id), { scale: 2, backgroundColor: "#ffffff", useCORS: true }); const a = document.createElement("a"); a.href = cv.toDataURL("image/png"); a.download = file; a.click(); } catch (e) { /* sin imagen */ } };
/* Cronómetro corto */
function useCountdown(sec, running) {
  const [left, setLeft] = useState(sec);
  useEffect(() => { if (!running) return undefined; const t = setInterval(() => setLeft((s) => (s <= 1 ? 0 : s - 1)), 1000); return () => clearInterval(t); }, [running]);
  return [left, () => setLeft(sec)];
}
function Gauge91({ label, value, max, unit = "%", target, targetLabel, good, fmt }) {
  const w = Math.max(2, Math.min(100, (value / max) * 100));
  const t = target != null ? Math.min(100, (target / max) * 100) : null;
  return (
    <div className="g91-gauge">
      <div className="g91-gauge-top"><span>{label}</span><b className={good == null ? "" : good ? "pos" : "neg"}>{fmt ? fmt(value) : `${value}${unit}`}</b></div>
      <div className="g91-gauge-track"><i style={{ width: `${w}%`, background: good == null ? "var(--green)" : good ? "var(--green)" : "var(--coral)" }} />{t != null && <s style={{ left: `${t}%` }}><small>{targetLabel}</small></s>}</div>
    </div>
  );
}
/* =====================================================================
   GUÍA DE ACTIVIDAD · propósito + pasos + cómo se gana (rúbrica)
   Cada actividad del periodo abre con esta tarjeta (se puede ocultar).
   Estilos: .g91-brief en noveno1.css
   ===================================================================== */
const B_STARTER = (words) => ({ goal: `Learn the key words of today's class (${words}) before the big game.`, steps: ["Open every card: read the meaning and the example.", "Match each word with its meaning.", "Answer the quick rounds — a mistake shows you the right answer."], win: [["Open all the cards and finish the matches", "+20 🪙"], ["Mistakes are OK: they help you learn", ""]], tip: "These words appear in the rest of today's activities." });
const B_RUSH = (what) => ({ goal: what, steps: ["Read the boxes before you start.", "A card appears: tap the right box as fast as you can.", "If you make a mistake, read WHY — then keep going.", "At the end, check your mistakes. You can play again."], win: [["At least 8 cards answered and 70% correct", "to win"], ["Combo 🔥 (correct answers in a row)", "more points"], ["Coins depend on your accuracy", "up to +24 🪙"]] });
const B_VIDEO = (goal, next) => ({ goal, steps: ["Watch the whole video (you can pause or watch it twice).", "Write down numbers and key words you hear.", "Answer 8 random questions."], win: [["70% or more", "to pass"], ["Each correct answer", "+4 🪙"], ["Finishing", "+10 🪙"]], tip: next });
const B_READ = (goal, next) => ({ goal, steps: ["Read the text. Tap the key words to see their meaning.", "Pay attention to the numbers and the people's decisions.", "Answer 8 questions about the text."], win: [["70% or more", "to pass"], ["Each correct answer", "+4 🪙"], ["Finishing", "+10 🪙"]], tip: next });
const B_BRIEF = (goal, next) => ({ goal, steps: ["Read the short explanation (about 5 minutes). Tap the key words.", "Look at the examples and the boxes: they are the most important ideas.", "Answer 6 quick questions."], win: [["70% or more", "to pass"], ["Each correct answer", "+4 🪙"], ["Finishing", "+10 🪙"]], tip: next });
const B_LISTEN = (goal) => ({ goal, steps: ["Press Play and listen to the whole audio (you can choose Slow).", "Open the transcript to check what you didn't understand.", "Answer 8 questions."], win: [["70% or more", "to pass"], ["Each correct answer", "+4 🪙"], ["Finishing", "+10 🪙"]] });
function Brief91({ k }) {
  const b = GUIDE[k];
  const [open, setOpen] = useState(true);
  if (!b) return null;
  return (
    <div className={`g91-brief ${open ? "" : "closed"}`}>
      <button type="button" className="g91-brief-top" onClick={() => setOpen(!open)}>
        <em>🎯</em><div><small>YOUR MISSION · WHY IT MATTERS</small><b>{b.goal}</b></div><i>{open ? "Hide ▲" : "Guide ▼"}</i>
      </button>
      {open && (
        <div className="g91-brief-body">
          <div><small>🧭 WHAT YOU DO</small><ol>{b.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></div>
          <div className="win"><small>🏆 HOW YOU WIN</small><ul>{b.win.map(([t, p], i) => <li key={i}><span>{t}</span>{p && <b>{p}</b>}</li>)}</ul></div>
        </div>
      )}
      {open && b.tip && <p className="g91-brief-tip">💡 {b.tip}</p>}
    </div>
  );
}

/* =====================================================================
   PIEZAS DE DÉCIMO · FUTURE ME (compartidas por los 4 periodos)
   - PeriodShell10: guarda la fila del periodo (Progreso_Semanas), menú, clases y "Prove It".
   - FutureMePanel: tu Future Me (avatar del P1) + las 4 Future Me Cards del año.
   - PitchStudio: proyecto grande con guion 🎤, modo Present, jurado de pares y certificado.
   - Radar10, BossExam, ImpactRounds, AllocBars, FairPublish/FairArena, CSV.
   Estilos: decimo1.css (clases .g10-*)
   ===================================================================== */
const FM_CARDS = [
  { p: 1, k: "10P1", act: "c8_boss", e: "💎", t: "Value Creator", d: "I create value by solving someone's need." },
  { p: 2, k: "10P2", act: "c8_rules", e: "🧮", t: "My Money Rules", d: "My numbers decide, not my impulses." },
  { p: 3, k: "10P3", act: "c8_boss", e: "📈", t: "My Investor Card", d: "I invest with a plan and controlled risk." },
  { p: 4, k: "10P4", act: "c7_pitch", e: "🧭", t: "Future Me Blueprint", d: "I know who I want to be — and how to pay for it." },
];
const usd = (n) => (Number(n) < 0 ? "−US$" : "US$") + Math.abs(Number(n || 0)).toLocaleString("en-US", { maximumFractionDigits: 2 });
const pctTxt = (v, d = 1) => `${v >= 0 ? "+" : ""}${Number(v).toFixed(d)}%`;
/* Objetivos de escritura de 10° */
const W_FUTURE = { l: "Talk about the future", re: /\b(will|going to|plan to|want to|i'd like to|hope to)\b/i, ex: "will · going to · I plan to" };
const W_PAST = { l: "Use the past", re: /\b(was|were|had|did|gave|got|traded|started|made|found|took|offered|accepted|said|[a-z]{3,}ed)\b/i, ex: "we traded · we got · it was" };
const W_COMPARE = { l: "Compare", re: /\b([a-z]+er than|more (?:[a-z]+ )?than|less (?:[a-z]+ )?than|the most|the best|as [a-z]+ as|better|worse|bigger|smaller|higher|lower)\b/i, ex: "bigger than · more than · the best" };
const W_PERSUADE = { l: "Persuade", re: /\b(what if|imagine|this could|this will|you could|would you|if you|it can help)\b/i, ex: "What if… · Imagine… · This could…" };
const growth = (a, b) => (a > 0 ? Math.round(((b - a) / a) * 1000) / 10 : 0);
const pm = (v, d = 2) => `${(v * 100).toFixed(d)}%`;
const fvA = (pv, r, n) => pv * Math.pow(1 + r, n);
const pvA = (fv, r, n) => fv / Math.pow(1 + r, n);
const eaFromM = (m) => Math.pow(1 + m, 12) - 1;
const mFromEa = (ea) => Math.pow(1 + ea, 1 / 12) - 1;
const capF = (t) => String(t || "").trim().replace(/^./, (c) => c.toUpperCase());
const r2 = (v) => Math.round(v * 100) / 100;
/* Future Me ID guardado en el Periodo 1 (o uno de muestra) */
const fmIdOf = (p1) => { const x = p1?.c1_id || {}; return { name: x.name || "", avatar: x.avatar || "🧑🏽‍🚀", dream: x.dream || "", city: x.city || "", goal: x.goal || "", traits: x.traits || [], sample: !p1?.c1_id }; };

function FutureMePanel({ id, have, stats, compact, studentName, title }) {
  const first = (id.name || studentName || "Student").split(" ")[0];
  return (
    <div className={`g10-panel ${compact ? "compact" : ""}`}>
      <div className="g10-panel-me">
        <em>{id.avatar}</em>
        <div><small>MY FUTURE ME · {title}</small><b>{first}{id.dream ? ` · future ${id.dream}` : ""}</b>{!compact && <span>{id.goal ? `🎯 ${id.goal}` : "Create your Future Me ID in Period 1 (Class 1)."}</span>}</div>
      </div>
      {stats && stats.length > 0 && <div className="g10-panel-stats">{stats.map((s) => <div key={s.l} className={s.c || ""}><small>{s.l}</small><b>{s.v}</b></div>)}</div>}
      {!compact && <div className="g10-cards">{FM_CARDS.map((c) => <span key={c.t} className={have[c.p] ? "on" : ""}><em>{have[c.p] ? c.e : "🔒"}</em><small>PERIOD {c.p}</small><b>{c.t}</b><i>{c.d}</i></span>)}</div>}
    </div>
  );
}

/* Página del portafolio Future Me (Future Pages 01–23) */
function FPBadge({ n, t, e = "📄" }) {
  return <div className="g8-bpbadge g91-badge g10-fpbadge"><span>📘 FUTURE PAGE {String(n).padStart(2, "0")}</span><b>{e} {t}</b></div>;
}
/* Prove It: repaso rápido al abrir cada clase (no da monedas, no se guarda) */
function ProveIt({ data }) {
  const [pick, setPick] = useState(null);
  const [open, setOpen] = useState(false);
  if (!data) return null;
  return (
    <div className={`g10-prove ${open ? "open" : ""}`}>
      <button type="button" className="g10-prove-top" onClick={() => setOpen(!open)}><em>⚡</em><div><small>PROVE IT · 1 MINUTE · {data.from}</small><b>{data.q}</b></div><i>{open ? "▲" : "Try ▼"}</i></button>
      {open && (
        <div className="g10-prove-body">
          <div className="quiz-options">{data.options.map((o, k) => <button key={k} type="button" disabled={pick != null} className={`quiz-opt ${pick != null && k === data.correct ? "correct" : ""} ${pick === k && k !== data.correct ? "wrong" : ""}`} onClick={() => setPick(k)}><span className="opt-key">{"ABCD"[k]}</span><span className="opt-text">{o}</span></button>)}</div>
          {pick != null && <p className={`g91-note ${pick === data.correct ? "pos" : "neg"}`}>{pick === data.correct ? "✅ You remember it! " : "🔁 Not this time. "}{data.why}</p>}
        </div>
      )}
    </div>
  );
}

/* Barras de reparto (suman 100% o un total) */
function AllocBars({ items, vals, set, step = 5, total = 100, unit = "%", fmt }) {
  const sum = items.reduce((a, it) => a + (vals[it.k] || 0), 0);
  const left = total - sum;
  const f = fmt || ((v) => `${v}${unit}`);
  return (
    <div className="g10-alloc">
      {items.map((it) => {
        const v = vals[it.k] || 0;
        return (
          <div key={it.k} className="g10-alloc-row" style={{ "--c": it.c || "var(--green)" }}>
            <div className="l"><em>{it.e}</em><div><b>{it.l}</b>{it.d && <small>{it.d}</small>}</div></div>
            <div className="ctl">
              <button type="button" disabled={v <= 0} onClick={() => set({ ...vals, [it.k]: Math.max(0, v - step) })}><Minus size={14} /></button>
              <div className="bar"><i style={{ width: `${Math.min(100, (v / total) * 100)}%` }} /></div>
              <button type="button" disabled={left < step} onClick={() => set({ ...vals, [it.k]: v + step })}><Plus size={14} /></button>
              <b>{f(v)}</b>
            </div>
          </div>
        );
      })}
      <div className={`g10-alloc-left ${left === 0 ? "ok" : left < 0 ? "bad" : ""}`}>{left === 0 ? `✅ All ${f(total)} assigned` : `Still to assign: ${f(left)}`}</div>
    </div>
  );
}

/* Rondas de decisiones con indicadores que suben y bajan */
function ImpactRounds({ stats, rounds, onDone, doneLabel = "See my results", timer }) {
  const [i, setI] = useState(0);
  const [val, setVal] = useState(() => Object.fromEntries(stats.map((s) => [s.k, s.start])));
  const [picked, setPicked] = useState(null);
  const [log, setLog] = useState([]);
  const [orders] = useState(() => rounds.map((r) => shuffleArr(r.options.map((_, k) => k))));
  const [left, reset] = useCountdown(timer || 0, !!timer && picked == null);
  const r = rounds[i];
  useEffect(() => { if (timer && left === 0 && picked == null) choose(orders[i][0], true); }, [left]); // eslint-disable-line react-hooks/exhaustive-deps
  const choose = (k, late) => {
    if (picked != null) return;
    const o = r.options[k];
    const next = { ...val };
    Object.entries(o.fx || {}).forEach(([key, d]) => { next[key] = Math.max(0, Math.min(stats.find((s) => s.k === key)?.max ?? 100, (next[key] || 0) + d)); });
    setVal(next); setPicked(k); setLog([...log, { round: r.title, pick: o.t, good: !!o.good, late: !!late }]);
  };
  const go = () => {
    if (i === rounds.length - 1) { onDone({ values: val, log, good: log.filter((x) => x.good).length }); return; }
    setI(i + 1); setPicked(null); if (timer) reset();
  };
  const o = picked != null ? r.options[picked] : null;
  return (
    <>
      <div className="g10-stats">{stats.map((s) => { const v = val[s.k]; const mx = s.max ?? 100; return <div key={s.k}><small>{s.e} {s.l}</small><b>{s.fmt ? s.fmt(v) : v}</b><div className="t"><i style={{ width: `${Math.max(3, (v / mx) * 100)}%`, background: v / mx >= 0.5 ? "var(--green)" : "var(--coral)" }} /></div></div>; })}</div>
      <div className="start-block g10-event">
        <div className="p1-match-stats"><span>Round <b>{i + 1}/{rounds.length}</b></span><span>Good decisions: <b>{log.filter((x) => x.good).length}</b></span>{timer ? <span className={`g10-timer ${left <= 5 ? "low" : ""}`}>⏱️ {left}s</span> : null}</div>
        <div className="g10-event-head"><em>{r.e}</em><div><b>{r.title}</b><p>{r.text}</p></div></div>
        {r.extra}
        <div className="quiz-options">{orders[i].map((k, pos) => { const x = r.options[k]; return <button key={k} type="button" disabled={picked != null} className={`quiz-opt ${picked === k ? (x.good ? "correct" : "wrong") : ""} ${picked != null && picked !== k && x.good ? "g10-alt" : ""}`} onClick={() => choose(k)}><span className="opt-key">{"ABCD"[pos]}</span><span className="opt-text">{x.t}</span></button>; })}</div>
        {o && <div className={`p1-banner ${o.good ? "good" : "bad"}`}><span>{log[log.length - 1]?.late ? "⏱️ Time's up — the panic option was chosen for you. " : ""}<b>{o.good ? "Smart move. " : "Careful. "}</b>{o.note} <i className="g10-fx">{Object.entries(o.fx || {}).map(([k, d]) => `${stats.find((s) => s.k === k)?.e || ""} ${d >= 0 ? "+" : ""}${d}`).join("  ")}</i></span></div>}
      </div>
      {o && <div className="start-foot"><button className="s1-btn primary big" onClick={go}>{i === rounds.length - 1 ? doneLabel : "Next round"} <ChevronRight size={18} /></button></div>}
    </>
  );
}

/* Descargar una tabla como CSV (se abre en Excel o Google Sheets) */
const downloadCSV = (rows, file) => {
  try {
    const esc = (c) => { const s = String(c ?? ""); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const blob = new Blob(["﻿" + rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file; a.click();
  } catch (e) { /* sin descarga */ }
};

/* Modo Present a pantalla completa */
function PresentOverlay({ slides, onClose }) {
  const [i, setI] = useState(0);
  return (
    <div className="g8-present" role="dialog">
      <div className="g8-present-top"><span>{i + 1} / {slides.length}</span><button type="button" onClick={onClose}><X size={18} /> Close</button></div>
      <div className="g8-present-stage">{slides[i]}</div>
      <div className="g8-present-nav"><button type="button" disabled={i === 0} onClick={() => setI(i - 1)}><ChevronLeft size={20} /> Back</button><button type="button" disabled={i === slides.length - 1} onClick={() => setI(i + 1)}>Next <ChevronRight size={20} /></button></div>
    </div>
  );
}

/* Jurado de pares (estrellas 1–5) */
function PeerJury({ rubric, peer, setPeer, stars, setStars, cheer, setCheer, title = "Jury · for the classmate who listened", tip }) {
  return (
    <div className="start-block g84-investor">
      <h3>⚖️ {title}</h3>
      <input className="start-input p3-gap" value={peer} onChange={(e) => setPeer(e.target.value)} placeholder="Jury member's name (your classmate)" />
      {rubric.map(([k, l, d]) => <div key={k} className="p3-rub"><div><b>{l}</b>{d && <small className="g10-rubd">{d}</small>}</div><span /><div className="p3-stars">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={stars[k] >= n ? "on" : ""} onClick={() => setStars({ ...stars, [k]: n })}>★</button>)}</div></div>)}
      <div className="p3-sentence edit"><span>💬 The strongest part of this presentation was</span><input className="start-input" value={cheer} onChange={(e) => setCheer(e.target.value)} placeholder="Write it here…" /></div>
      {tip && <p className="start-tip">{tip}</p>}
    </div>
  );
}

/* PROYECTO GRANDE: guion que se arma solo + Present + jurado + certificado */
function PitchStudio({ icon, title, subtitle, brief, how, id, cover, kpis, chapters, inputs, rubric, ready, readyMsg, cert, coins = 60, extraData, existing, onPublish, publishLabel, onSave, onExit }) {
  const [vals, setVals] = useState(() => Object.fromEntries((inputs || []).map((x) => [x.k, existing?.[x.k] || ""])));
  const [show, setShow] = useState(false);
  const [peer, setPeer] = useState(existing?.peer || "");
  const [stars, setStars] = useState(existing?.stars || {});
  const [cheer, setCheer] = useState(existing?.cheer || "");
  const [got, setGot] = useState(!!existing?.score);
  const [pub, setPub] = useState(null);
  const [st, finish] = useFinish(onSave);
  const score = rubric.reduce((a, [k]) => a + (stars[k] || 0), 0);
  const inOk = (inputs || []).every((x) => countWords(vals[x.k]) >= (x.min || 5) && realText(vals[x.k]));
  const ok = ready && inOk && peer.trim().length >= 2 && rubric.every(([k]) => stars[k]) && countWords(cheer) >= 4;
  const chaps = chapters(vals);
  const Chap = ({ c, n, big }) => <section className={`g8-fp ${big ? "big" : ""} ${c.s.length ? "" : "empty"}`}><h4><span>{c.e}</span>{n}. {c.t}</h4>{c.s.length ? <div className="g8-fp-say"><small>🎤 I SAY</small>{c.s.map((t, k) => <p key={k}>{t}</p>)}</div> : <p className="g8-fp-empty">{c.empty || "Finish the activities of this part to unlock it."}</p>}</section>;
  const slides = [
    <div className="g8-slide-cover" key="c"><small>{cover.tag}</small><h2>{cover.title}</h2><p className="g8-fp-sayline">🎤 {cover.say}</p></div>,
    ...chaps.map((c, k) => <Chap key={c.t} c={c} n={k + 1} big />),
    <div className="g8-slide-cover" key="e"><small>CLOSING</small><h2>{cover.end(vals)}</h2></div>,
  ];
  if (st.done) return <Reward title={`${cert.title}! ${cert.e}`} subtitle={`Peer score ${score}/${rubric.length * 5} · open it again to download your certificate`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={icon} title={title} subtitle={subtitle} onExit={onExit}>
      {brief}
      {how && <HowTo>{how}</HowTo>}
      {!ready && <div className="p1-banner bad"><span>{readyMsg}</span></div>}
      <div className="g8-final g10-final" id={id}>
        <header><small>{cover.tag}</small><h2>{cover.title}</h2>{cover.sub && <p>{cover.sub}</p>}</header>
        {kpis && <div className="g10-kpis">{kpis.map((k) => <div key={k.l}><small>{k.l}</small><b className={k.c || ""}>{k.v}</b></div>)}</div>}
        <div className="g8-fp-intro">🎤 {cover.say}</div>
        <div className="g8-fp-list">{chaps.map((c, k) => <Chap key={c.t} c={c} n={k + 1} />)}</div>
        <div className="g8-fp-intro end">🎤 {cover.end(vals)}</div>
      </div>
      {(inputs || []).map((x) => <div key={x.k} className="p3-sentence edit"><span>{x.l}</span><input className="start-input" value={vals[x.k]} onChange={(e) => setVals({ ...vals, [x.k]: e.target.value })} placeholder={x.ph || "Write it here…"} /></div>)}
      <div className="p3-card-actions">
        <button className="s1-btn primary" onClick={() => setShow(true)}><Mic size={17} /> Present</button>
        <button className="s1-btn ghost" onClick={() => downloadPNG(id, `${id}.png`)}><Download size={17} /> Download PNG</button>
        {onPublish && <button className="s1-btn ghost" disabled={pub === "busy"} onClick={async () => { setPub("busy"); const r = await onPublish(vals); setPub(r ? "ok" : "bad"); }}><Store size={17} /> {pub === "ok" ? "Published ✓ (update)" : pub === "busy" ? "Publishing…" : publishLabel}</button>}
      </div>
      {pub === "ok" && <div className="p1-banner good"><span>Your pitch is live for your classmates' investment round. 🎪</span></div>}
      {pub === "bad" && <div className="p1-banner bad"><span>We couldn't publish it (connection or Apps Script). Present it anyway — your teacher can open the investment round later.</span></div>}
      <PeerJury rubric={rubric} peer={peer} setPeer={setPeer} stars={stars} setStars={setStars} cheer={cheer} setCheer={setCheer} tip="⚖️ Judge the ideas and the numbers — not the friendship." />
      {got && <div className="g93-cert g10-cert" id={`${id}-cert`}><small>INSTITUTO CREAR · FINFLUENT · GRADE 10</small><h2>{cert.e} {cert.title}</h2><p>This certifies that</p><b>{cert.name}</b><p>{cert.text}</p><span>Jury score: {score}/{rubric.length * 5} · {new Date().toLocaleDateString("en-GB")}</span></div>}
      <div className="start-foot">{got && <button className="s1-btn ghost" onClick={() => downloadPNG(`${id}-cert`, `${cert.title.replace(/\s+/g, "_")}.png`)}><Download size={16} /> Certificate PNG</button>}<button className="s1-btn primary big" disabled={!ok} onClick={() => { setGot(true); finish(coins, { ...vals, peer: peer.trim(), stars, score, cheer, ...(extraData || {}) }); }}>{ok ? "Get my certificate" : "Complete the script and the jury"} <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
      {show && <PresentOverlay slides={slides} onClose={() => setShow(false)} />}
    </ActShell>
  );
}

/* ---------- FERIA (Apps Script fair_*): publicar y ronda de inversión ---------- */
const fairPost = async (API_URL, userData, grado, action, extra = {}) => {
  const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action, user_key: userData?.Student_Key, nombre: userData?.Nombre_Completo, grado, ...extra }) });
  return res.json();
};
const FAIR_CATS10 = [{ id: "clarity", l: "Clear story", e: "🔍" }, { id: "useful", l: "Strong numbers", e: "📊" }, { id: "creative", l: "Creative", e: "🎨" }, { id: "responsible", l: "Responsible", e: "🤝" }];
function FairArena({ userData, API_URL, grado, title, subtitle, brief, coinsBase = 20, unitWord = "pitch", onSave, onExit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [open, setOpen] = useState(null);
  const [amt, setAmt] = useState(20);
  const [cat, setCat] = useState("useful");
  const [q1, setQ1] = useState("");
  const [busy, setBusy] = useState(false);
  const [st, finish] = useFinish(onSave);
  const load = async () => { setLoading(true); setMsg(null); try { const d = await fairPost(API_URL, userData, grado, "fair_list"); if (d.status === "error") setMsg({ t: "bad", x: d.message }); else setData(d); } catch (e) { setMsg({ t: "bad", x: "Connection problem. Try again." }); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const companies = data?.companies || [];
  const others = companies.filter((c) => c.key !== userData?.Student_Key);
  const mine = data?.mine || [];
  const left = data?.left ?? 100;
  const visited = new Set(mine.map((m) => m.company));
  const comp = others.find((c) => c.key === open);
  const coins = coinsBase + Math.min(visited.size, 5) * 4;
  const invest = async () => {
    setBusy(true); setMsg(null);
    try { const d = await fairPost(API_URL, userData, grado, "fair_invest", { company_key: open, amount: amt, category: cat, note: q1 }); if (d.status === "error") setMsg({ t: "bad", x: d.message }); else { setData(d); setOpen(null); setQ1(""); setMsg({ t: "good", x: `You invested ${amt} coins 💸` }); } }
    catch (e) { setMsg({ t: "bad", x: "Connection problem. Try again." }); } finally { setBusy(false); }
  };
  const board = companies.slice().sort((a, b) => (b.total || 0) - (a.total || 0));
  if (st.done) return <Reward title="Investment round closed! 💼" subtitle={`You evaluated ${visited.size} ${unitWord === "pitch" ? "pitches" : `${unitWord}s`}.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  if (comp) {
    const c = comp.company || {};
    return (
      <ActShell icon={<Briefcase size={22} strokeWidth={2.1} />} title={`${c.logo || "💼"} ${c.name || "Pitch"}`} subtitle={`by ${String(comp.nombre || "").split(" ")[0]} · listen, ask one question, then decide.`} onExit={() => setOpen(null)}>
        <div className="g10-fair-card">{(c.lines || []).map((l, k) => <p key={k}>{l}</p>)}{c.nums && <div className="g91-mini">{c.nums.map((n) => <span key={n.l}>{n.l} <b>{n.v}</b></span>)}</div>}</div>
        <div className="start-block p3-investor">
          <h3>🦈 My investor decision</h3>
          <label className="p3-lbl">The question I asked (or would ask) the founder:<input className="start-input" value={q1} onChange={(e) => setQ1(e.target.value)} placeholder="How did you calculate…? What happens if…?" /></label>
          <span className="terms-label">Best category:</span>
          <div className="p1-starters">{FAIR_CATS10.map((x) => <button key={x.id} type="button" className={`p1-chip ${cat === x.id ? "on" : ""}`} onClick={() => setCat(x.id)}>{x.e} {x.l}</button>)}</div>
          <span className="terms-label">Invest (you have {left} of 100 coins):</span>
          <div className="p3-invest">{[10, 20, 30, 50].map((a) => <button key={a} type="button" disabled={a > left} className={amt === a ? "on" : ""} onClick={() => setAmt(a)}>🪙 {a}</button>)}</div>
          {msg && <div className={`p1-banner ${msg.t}`}>{msg.x}</div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={busy || amt > left || countWords(q1) < 4} onClick={invest}>{busy ? "Investing…" : countWords(q1) < 4 ? "Write your question (4+ words)" : `Invest ${amt} coins`}</button></div>
        </div>
      </ActShell>
    );
  }
  return (
    <ActShell icon={<Briefcase size={22} strokeWidth={2.1} />} title={title} subtitle={subtitle} onExit={onExit}>
      {brief}
      <div className="p2-hud"><span>💰 Coins left <b>{left}/100</b></span><span>🗂️ Evaluated <b>{visited.size}</b></span><button type="button" className="p1-link" onClick={load}><RefreshCw size={14} /> Refresh</button></div>
      {msg && <div className={`p1-banner ${msg.t}`}>{msg.x}</div>}
      {loading ? <p className="start-tip p1-center">Loading the investment round…</p> : others.length === 0 ? <p className="start-tip p1-center">No pitches published yet. Ask your classmates to publish theirs and press Refresh.</p> : (
        <div className="g10-fair-grid">{others.map((s) => { const c = s.company || {}; const inv = mine.filter((m) => m.company === s.key).reduce((a, m) => a + Number(m.amount || 0), 0); return <button key={s.key} type="button" className={inv ? "on" : ""} onClick={() => setOpen(s.key)}><em>{c.logo || "💼"}</em><b>{c.name || "Pitch"}</b><small>{(c.lines || [])[0] || ""}</small><i>{inv ? `✅ You invested ${inv}` : "Open →"}</i></button>; })}</div>
      )}
      {board.length > 0 && <div className="start-block"><h3>🏆 Ranking</h3><div className="g10-rank">{board.slice(0, 10).map((s, k) => <div key={s.key} className={s.key === userData?.Student_Key ? "me" : ""}><span>{["🥇", "🥈", "🥉"][k] || k + 1}</span><b>{s.company?.logo} {s.company?.name}</b><i>{s.total || 0} 🪙</i></div>)}</div></div>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={visited.size < Math.min(2, others.length || 1) && others.length > 0} onClick={() => finish(coins, { visited: visited.size, invested: 100 - left })}>{others.length && visited.size < Math.min(2, others.length) ? "Invest in at least 2" : "Close my round"} <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
    </ActShell>
  );
}

/* ---------- MONEY RADAR 10 · 5 pilares del año ---------- */
const RADAR10_DIMS = [
  { k: "val", l: "Value Creation", short: "Value" }, { k: "mm", l: "Money Management", short: "Money" }, { k: "math", l: "Money Math", short: "Math" },
  { k: "inv", l: "Investing & Risk", short: "Investing" }, { k: "fut", l: "Future Planning", short: "Future" },
];
const RADAR10_Q = [
  { d: "val", q: "You have an old object you don't use. What is the smartest first step?", o: ["Throw it away.", "Find who needs it and what they would give for it.", "Keep it forever.", "Sell it at the first price anybody says."], s: [0, 3, 0, 1] },
  { d: "val", q: "Why can the same umbrella cost more on a rainy day?", o: ["Because umbrellas are magic.", "Because demand goes up while supply stays the same.", "Because the government says so.", "Because it is a different umbrella."], s: [0, 3, 1, 0] },
  { d: "mm", q: "You receive your first salary. What do you do first?", o: ["Spend it on what I wanted for months.", "Make a plan: needs, savings and a part for fun.", "Keep it all in cash at home.", "Lend it all to a friend."], s: [0, 3, 1, 0] },
  { d: "mm", q: "Inflation is 6% and your money sits in a piggy bank for a year. What happens?", o: ["Nothing.", "It can buy less than before.", "It grows 6%.", "It doubles."], s: [0, 3, 0, 0] },
  { d: "math", q: "A bank offers 1% per month. A CDT offers 12% E.A. Which pays more in a year?", o: ["They are exactly the same.", "1% per month (it compounds to about 12.7%).", "The CDT, always.", "I can't know and I don't care."], s: [1, 3, 1, 0] },
  { d: "math", q: "You can pay a $1,200,000 phone in 1 or 36 card installments. What should you check?", o: ["Only the monthly payment.", "The interest rate and the total I will pay.", "The color of the card.", "Nothing — installments are free."], s: [1, 3, 0, 0] },
  { d: "inv", q: "Your investment falls 15% in one week. What do you do?", o: ["Sell everything immediately.", "Check why it fell and remember my plan and time horizon.", "Borrow money to buy more.", "Ask a stranger online."], s: [0, 3, 0, 0] },
  { d: "inv", q: "An app promises 20% per month, guaranteed. You…", o: ["Invest everything.", "Suspect a scam and check if it is supervised.", "Invite my family.", "Invest half."], s: [0, 3, 0, 0] },
  { d: "fut", q: "When should you start saving and investing for your future?", o: ["When I'm 40.", "As soon as I can, even with small amounts.", "Never, it's for rich people.", "Only when I win the lottery."], s: [0, 3, 0, 0] },
  { d: "fut", q: "You are choosing a career. What do you consider?", o: ["Only what my friends study.", "What I love, what I'm good at, what the world needs and what pays.", "Only the salary.", "Nothing, I'll decide later."], s: [0, 3, 1, 0] },
];
function radarProfile10(avg) {
  if (avg <= 30) return { l: "Starter 🌱", d: "You are building your foundations. Every class this year is a step." };
  if (avg <= 55) return { l: "Explorer 🔎", d: "You know many ideas. Next step: use them with numbers every time." };
  if (avg <= 80) return { l: "Strategist 📐", d: "Strong decisions! You compare, calculate and think about risk." };
  return { l: "Future Architect ⭐", d: "Excellent! You connect money with the life you want to build." };
}
const radarScores10 = (ans, offset = 0) => { const o = {}; RADAR10_DIMS.forEach((d) => { const list = RADAR10_Q.map((q, i) => ({ q, i })).filter((x) => x.q.d === d.k); o[d.k] = Math.round((list.reduce((a, x) => a + (ans[x.i + offset] != null ? x.q.s[ans[x.i + offset]] : 0), 0) / (list.length * 3)) * 100); }); return o; };
function RadarQuiz({ title, qs, intro, onDone, onExit }) {
  const [cur, setCur] = useState(0);
  const [ans, setAns] = useState({});
  const q = qs[cur]; const answered = ans[cur] != null;
  return (
    <div className="s1-quiz">
      <div className="quiz-top"><h2>🧭 {title}</h2><span className="quiz-count">{cur + 1} / {qs.length}</span></div>
      <div className="quiz-track"><i style={{ width: `${((cur + (answered ? 1 : 0)) / qs.length) * 100}%` }} /></div>
      {cur === 0 && intro}
      {cur === 10 && <p className="start-tip">🆕 5 new situations about this year's topics.</p>}
      <span className="diag-dim">{cur >= 10 ? "🆕 " : ""}{RADAR10_DIMS.find((d) => d.k === q.d).l}</span>
      <p className="quiz-q">{q.q}</p>
      <div className="quiz-options">{q.o.map((o, k) => <button key={k} type="button" className={`quiz-opt ${ans[cur] === k ? "correct" : ""}`} onClick={() => setAns({ ...ans, [cur]: k })}><span className="opt-key">{"ABCD"[k]}</span><span className="opt-text">{o}</span></button>)}</div>
      <div className="quiz-nav">
        <button className="s1-btn ghost" onClick={() => (cur > 0 ? setCur(cur - 1) : onExit())}>{cur > 0 ? "Back" : "Exit"}</button>
        <button className="s1-btn primary" disabled={!answered} onClick={() => (cur < qs.length - 1 ? setCur(cur + 1) : onDone(ans))}>{cur < qs.length - 1 ? "Next" : "See my radar 🧭"} <ChevronRight size={18} /></button>
      </div>
    </div>
  );
}

/* ---------- BOSS / EXAMEN: misiones + preguntas + retroalimentación por tema ---------- */
function BossExam({ icon, title, subtitle, brief, missions, questions, tips, passPct = 70, cardNode, coinsPer = 4, onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [mis, setMis] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const deck = useMemo(() => shuffleArr(questions.map((q) => ({ ...q, order: shuffleArr(q.options.map((_, k) => k)) }))), [attempt, questions]);
  const [cur, setCur] = useState(0);
  const [ans, setAns] = useState({});
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  if (stage === 0) return <ActShell icon={icon} title={`${title} · Part 1`} subtitle={subtitle} onExit={onExit}>{brief}<RoundsRunner rounds={missions} doneLabel={`Part 2: ${questions.length} questions`} onDone={(x) => { setMis(x.firstTry); setStage(1); }} /></ActShell>;
  const q = deck[cur]; const answered = ans[cur] != null;
  const correct = deck.filter((x, k) => ans[k] === x.correct).length;
  const pct = Math.round((correct / deck.length) * 100);
  const passed = pct >= passPct;
  const topics = [...new Set(questions.map((x) => x.t))].map((t) => { const list = deck.map((x, k) => ({ x, k })).filter((o) => o.x.t === t); return { t, ok: list.filter((o) => ans[o.k] === o.x.correct).length, n: list.length }; });
  const xp = correct * coinsPer + mis * 4 + 10;
  const end = () => { setDone(true); setSaving(true); Promise.resolve(onSave({ correct, total: deck.length, pct, passed, xp, missions: mis, topics: Object.fromEntries(topics.map((o) => [o.t, `${o.ok}/${o.n}`])) })).finally(() => setSaving(false)); };
  if (done) {
    const weak = topics.filter((o) => o.ok < o.n);
    const wrong = deck.filter((x, k) => ans[k] !== x.correct);
    return (
      <div className="s1-quiz diag-result g94-exam">
        <div className="diag-badge">{passed ? <Trophy size={30} strokeWidth={2.1} /> : <X size={30} strokeWidth={2.1} />}</div>
        <h2>{passed ? (pct === 100 ? "Perfect! 🏆" : "You passed! 🎓") : "Almost there!"}</h2>
        <p className="diag-sub">Missions: <b>{mis}/{missions.length} ⭐</b> · Questions: <b>{correct}/{deck.length} ({pct}%)</b>{passed ? "" : ` · you need ${passPct}%`}</p>
        <div className="reward-coins"><Coins size={20} strokeWidth={2.3} /> +{xp} coins</div>
        {passed && cardNode}
        <h3 className="g94-h">📊 My results by topic</h3>
        <div className="diag-bars">{topics.map((o) => <div key={o.t} className="diag-bar"><span className="diag-bar-l">{o.t}</span><div className="diag-bar-track"><i style={{ width: `${(o.ok / o.n) * 100}%` }} /></div><span className="diag-bar-v">{o.ok}/{o.n}</span></div>)}</div>
        {weak.length ? <div className="g94-tips"><h4>🎯 What to review</h4>{weak.map((o) => <p key={o.t}><b>{o.t}:</b> {tips[o.t]}</p>)}</div> : <div className="p1-banner good"><span>No weak topics — excellent work!</span></div>}
        {wrong.length > 0 && <div className="g94-tips wrong"><h4>🔁 My mistakes — and the key idea</h4>{wrong.map((x, k) => <p key={k}><span>{x.q}</span><b>✅ {x.options[x.correct]}</b><small>💡 {x.feedback}</small></p>)}</div>}
        {passed ? <button className="s1-btn primary" onClick={onExit}>Continue <ChevronRight size={18} /></button> : <><p className="reward-note">Your coins are saved. Read the feedback and try again — the questions change order.</p><button className="s1-btn primary" onClick={() => { setAttempt(attempt + 1); setCur(0); setAns({}); setDone(false); }}>Try again <RefreshCw size={17} strokeWidth={2.4} /></button></>}
        {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing your progress…</span>}
      </div>
    );
  }
  return (
    <div className="s1-quiz">
      <div className="quiz-top"><h2>{title} · Part 2 (missions: {mis}/{missions.length} ⭐)</h2><span className="quiz-count">{cur + 1} / {deck.length}</span></div>
      <div className="g8-qdots">{deck.map((x, k) => <i key={k} className={ans[k] == null ? (k === cur ? "now" : "") : ans[k] === x.correct ? "ok" : "no"} />)}</div>
      <span className="diag-dim">{q.t}</span>
      <p className="quiz-q">{q.q}</p>
      <div className="quiz-options">{q.order.map((oi, pos) => { let cls = "quiz-opt"; if (answered) { if (oi === q.correct) cls += " correct"; else if (oi === ans[cur]) cls += " wrong"; } return <button key={oi} className={cls} disabled={answered} onClick={() => setAns({ ...ans, [cur]: oi })}><span className="opt-key">{"ABCD"[pos]}</span><span className="opt-text">{q.options[oi]}</span>{answered && oi === q.correct && <Check size={18} strokeWidth={3} className="opt-tick" />}</button>; })}</div>
      {answered && <p className={`g91-note ${ans[cur] === q.correct ? "pos" : "neg"}`}>💡 {q.feedback}</p>}
      <div className="quiz-nav"><span /><button className="s1-btn primary" disabled={!answered} onClick={() => (cur < deck.length - 1 ? setCur(cur + 1) : end())}>{cur < deck.length - 1 ? "Next" : "See my results"} <ChevronRight size={18} /></button></div>
    </div>
  );
}

/* Tarjeta coleccionable Future Me Card */
function FMCardView({ id, card, name, lines }) {
  return (
    <div className="g10-fmcard-wrap">
      <div className="g10-fmcard" id={id}>
        <small>FUTURE ME CARD · PERIOD {card.p}</small>
        <em>{card.e}</em>
        <h3>{card.t}</h3>
        <b>{name}</b>
        <p>“{card.d}”</p>
        <ul>{lines.filter(Boolean).map((l) => <li key={l}>{l}</li>)}</ul>
        <span>FinFluent · Instituto CREAR · Grade 10</span>
      </div>
      <button type="button" className="s1-btn ghost" onClick={() => downloadPNG(id, `${card.t.replace(/\s+/g, "_")}.png`)}><Download size={16} /> Save my card</button>
    </div>
  );
}

/* Gráfica dentro de una tarjeta que nunca se sale */
function ChartCard({ title, children, legend }) {
  return <div className="g10-chart">{title && <b>{title}</b>}{children}{legend && <ChartLegend series={legend} />}</div>;
}

/* =====================================================================
   PERIOD SHELL · guarda una fila por periodo en Progreso_Semanas
   ===================================================================== */
const A10 = (key, title, desc, icon, coins, bucket) => ({ key, title, desc, icon, coins, bucket });
const LEARN_END = ["_read", "_video", "_brief", "_listen", "_news"];
function PeriodShell10({ cfg, userData, API_URL, existingRow, onBack }) {
  const { store, dispatch } = useGlobalReducer();
  const parse = (s) => { try { return s ? JSON.parse(s) : {}; } catch { return {}; } };
  const ALL = useMemo(() => cfg.weeks.flatMap((w) => w.acts), [cfg]);
  const TOTAL = ALL.length;
  const [checklist, setChecklist] = useState(() => parse(existingRow?.Checklist_JSON));
  const respRef = useRef(parse(existingRow?.Respuestas_JSON));
  const [, force] = useState(0);
  const [points, setPoints] = useState({ comportamiento: parseFloat(existingRow?.Puntos_Comportamiento || 0), quizzes: parseFloat(existingRow?.Puntos_Quizzes || 0), aprendi: parseFloat(existingRow?.Puntos_Aprendi || 0) });
  const hydrated = useRef(!!existingRow?.Checklist_JSON);
  useEffect(() => {
    if (hydrated.current || !existingRow?.Checklist_JSON) return;
    hydrated.current = true;
    setChecklist(parse(existingRow.Checklist_JSON));
    respRef.current = parse(existingRow.Respuestas_JSON);
    setPoints({ comportamiento: parseFloat(existingRow.Puntos_Comportamiento || 0), quizzes: parseFloat(existingRow.Puntos_Quizzes || 0), aprendi: parseFloat(existingRow.Puntos_Aprendi || 0) });
    force((x) => x + 1);
  }, [existingRow]); // eslint-disable-line react-hooks/exhaustive-deps
  const [week, setWeek] = useState(null);
  const [act, setAct] = useState(null);
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [week, act]);

  const name = userData?.Nombre_Completo || "Student";
  const rows = {}; ["10P1", "10P2", "10P3", "10P4"].forEach((k) => { rows[k] = store.semanas?.[k]; });
  const prev = { __p1: parseJSON(rows["10P1"]?.Respuestas_JSON), __p2: parseJSON(rows["10P2"]?.Respuestas_JSON), __p3: parseJSON(rows["10P3"]?.Respuestas_JSON) };
  if (cfg.n === 1) prev.__p1 = {};
  const resp = { ...prev, ...(respRef.current || {}) };
  if (cfg.n === 1) resp.__p1 = respRef.current || {};
  const doneCount = ALL.filter((a) => checklist[a.key]).length;
  const pctDone = Math.round((doneCount / TOTAL) * 100);
  const weekDone = (w) => w.acts.every((a) => checklist[a.key]);
  const coinsTotal = Math.round(points.comportamiento + points.quizzes + points.aprendi);
  const have = { 1: !!parseJSON(rows["10P1"]?.Respuestas_JSON)?.c8_boss?.passed, 2: !!parseJSON(rows["10P2"]?.Respuestas_JSON)?.c8_rules, 3: !!parseJSON(rows["10P3"]?.Respuestas_JSON)?.c8_boss?.passed, 4: !!parseJSON(rows["10P4"]?.Respuestas_JSON)?.c7_pitch };
  const mineCard = FM_CARDS.find((c) => c.p === cfg.n);
  if (mineCard && respRef.current?.[mineCard.act] && (mineCard.act !== "c8_boss" || respRef.current[mineCard.act].passed)) have[cfg.n] = true;

  const persist = (nextChecklist, nextPoints, respPatch) => {
    respRef.current = { ...respRef.current, ...respPatch };
    const done = ALL.filter((a) => nextChecklist[a.key]).length;
    const row = {
      Student_Key: userData.Student_Key, Semana: cfg.KEY, Grado: "10",
      Estado: done >= TOTAL ? "completed" : "in_progress", Porcentaje: Math.round((done / TOTAL) * 100),
      Puntos_Comportamiento: nextPoints.comportamiento, Puntos_Quizzes: nextPoints.quizzes, Puntos_Aprendi: nextPoints.aprendi,
      Checklist_JSON: JSON.stringify(nextChecklist), Respuestas_JSON: JSON.stringify(respRef.current),
    };
    const before = store.semanas?.[cfg.KEY];
    dispatch({ type: "save_progreso", payload: row }); // OPTIMISTA
    fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "save_progreso", data: row }) })
      .catch((e) => { console.error(`Error guardando 10° ${cfg.KEY}:`, e); dispatch({ type: "rollback_progreso", payload: { Semana: cfg.KEY, prev: before } }); });
  };
  const complete = (key, bucket, xp, respPatch, pass = true) => {
    const already = !!checklist[key];
    const nextChecklist = { ...checklist, [key]: already || pass };
    const nextPoints = already ? points : { ...points, [bucket]: points[bucket] + (xp || 0) };
    setChecklist(nextChecklist); setPoints(nextPoints);
    persist(nextChecklist, nextPoints, respPatch);
    return Promise.resolve();
  };
  const WRAP = `s1 p1 p2 p3 p4 g7 g72 g73 g74 g8 g82 g83 g84 g9 g91 g92 g93 g94 g10 g10${cfg.n}`;
  const ctxBase = { resp, name, userData, API_URL, rows, coinsTotal, doneCount, have, checklist };

  if (act) {
    const def = ALL.find((a) => a.key === act);
    const exit = () => setAct(null);
    const save = (r) => complete(act, def.bucket, r.xp, { [act]: { ...r, at: nowISO() } }, r.passed !== false);
    const ctx = { ...ctxBase, save, exit, existing: resp[act] };
    return <div className={WRAP}>{cfg.render(act, ctx) || null}</div>;
  }
  if (week) {
    const w = cfg.weeks.find((x) => x.n === week);
    const wDone = w.acts.filter((a) => checklist[a.key]).length;
    const next = cfg.weeks[cfg.weeks.indexOf(w) + 1];
    return (
      <div className={WRAP}>
        <button className="s1-back" onClick={() => setWeek(null)}><ArrowLeft size={18} strokeWidth={2.4} /> Back to Period {cfg.n}</button>
        <div className={`s1-hero p1-week-hero g7-hero g8-hero g91-hero g10-hero g10-hero${cfg.n}`}>
          <span className="s1-tag">{w.e} GRADE 10 · PERIOD {cfg.n} · CLASS {w.n}</span>
          <h1>{w.title}</h1>
          <p>{w.blurb}</p>
          <div className="s1-progress"><div className="bar"><i style={{ width: `${(wDone / w.acts.length) * 100}%` }} /></div><span className="pill">{wDone}/{w.acts.length}</span></div>
        </div>
        {cfg.panel(ctxBase, true)}
        <ProveIt data={w.prove} />
        <div className="s1-quest">
          {w.acts.map((a) => (
            <div key={a.key} className={`act-card ${checklist[a.key] ? "done" : ""} ${(cfg.pageKeys || []).includes(a.key) ? "g8-page-act" : ""} ${a.key.endsWith("_rush") ? "g8-rush-act" : ""} ${LEARN_END.some((s) => a.key.endsWith(s)) ? "g73-learn-act" : ""} ${(cfg.bigKeys || []).includes(a.key) ? "g94-big-act" : ""}`}>
              <div className="act-ico">{checklist[a.key] ? <Check size={22} strokeWidth={3} /> : a.icon}</div>
              <div className="act-main"><h3>{a.title}</h3><p>{a.desc}</p></div>
              {checklist[a.key] ? <button className="act-cta done" onClick={() => setAct(a.key)}>Done ✓</button> : <button className="act-cta play" onClick={() => setAct(a.key)}><Play size={16} strokeWidth={2.6} /> Start <span className="coin-tag"><Coins size={14} /> +{a.coins}</span></button>}
            </div>
          ))}
        </div>
        {next && wDone === w.acts.length && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setWeek(next.n)}>Go to class {next.n}: {next.title} <ChevronRight size={18} /></button></div>}
      </div>
    );
  }
  return (
    <div className={WRAP}>
      <button className="s1-back" onClick={onBack}><ArrowLeft size={18} strokeWidth={2.4} /> Back to overview</button>
      <div className={`s1-hero p1-hero g7-hero g8-hero g91-hero g10-hero g10-hero${cfg.n}`}>
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> GRADE 10 · PERIOD {cfg.n} · FUTURE ME</span>
        <h1>{cfg.title}</h1>
        <p>{cfg.question}</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pctDone}%` }} /></div><span className="pill">{pctDone}%</span></div>
        <div className="p1-hero-chips"><span><Coins size={14} /> {coinsTotal} coins</span><span><Check size={14} /> {doneCount}/{TOTAL} activities</span>{cfg.chips.map((c) => <span key={c}>{c}</span>)}</div>
      </div>
      <div className="g8-howyear"><b>🧭 This period:</b><span>{cfg.howyear}</span></div>
      {cfg.panel(ctxBase, false)}
      {cfg.bigKeys && checklist[cfg.bigKeys[0]] && <button type="button" className="p3-card-link" onClick={() => setAct(cfg.bigKeys[0])}><Award size={18} /> Open my big project & certificate <ChevronRight size={16} /></button>}
      <div className="g94-route g10-route">{cfg.weeks.map((w, k) => <button key={w.n} type="button" className={weekDone(w) ? "done" : ""} onClick={() => setWeek(w.n)}><em>{weekDone(w) ? "✅" : w.e}</em><small>Class {w.n}</small>{k < cfg.weeks.length - 1 && <i />}</button>)}</div>
      <div className="p1-weeks">
        {cfg.weeks.map((w) => {
          const d = w.acts.filter((a) => checklist[a.key]).length; const fullW = d === w.acts.length;
          return (
            <button key={w.n} type="button" className={`p1-week-card ${fullW ? "done" : ""} ${w.n === cfg.weeks.length ? "g94-summit" : ""}`} onClick={() => setWeek(w.n)}>
              <div className="p1-week-top"><span className="p1-week-n">Class {w.n}</span><em>{fullW ? "✅" : w.e}</em></div>
              <h3>{w.title}</h3><p>{w.blurb}</p>
              <div className="act-topics">{w.skills.map((s) => <span key={s}>{s}</span>)}</div>
              <div className="p1-week-bar"><i style={{ width: `${(d / w.acts.length) * 100}%` }} /></div>
              <small>{d}/{w.acts.length} activities</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Atajos para lecturas, explicadores, videos, listening y rush (B2) */
const mkLearn = (ctx, Brief) => ({
  reading: (k, title, subtitle, sections, glossary, questions, emoji, min = 10) => (
    <ReadThen tag={`READING · B2 · ${min} MIN`} title={title} subtitle={subtitle} minutes={min} sections={[{ node: <Brief k={k} key="b" /> }, ...sections]} glossary={glossary} onExit={ctx.exit} finishLabel="I read it — start the quiz (8 questions)">
      <QuizRunner title={`${title} · check`} emoji={emoji} questions={questions} pickCount={8} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={ctx.save} onExit={ctx.exit} />
    </ReadThen>
  ),
  brief: (k, title, subtitle, sections, glossary, questions, emoji) => (
    <ReadThen tag="EXPLAINER · B2 · 6 MIN" title={title} subtitle={subtitle} minutes={6} sections={[{ node: <Brief k={k} key="b" /> }, ...sections]} glossary={glossary} onExit={ctx.exit} finishLabel="I understand — quick check (6 questions)">
      <QuizRunner title={`${title} · quick check`} emoji={emoji} questions={questions} pickCount={6} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={ctx.save} onExit={ctx.exit} />
    </ReadThen>
  ),
  video: (k, src, title, qs) => <><div className="g10-brief-pad"><Brief k={k} /></div><VideoQuiz src={src} title={title} questions={qs} pickCount={8} onSave={ctx.save} onExit={ctx.exit} /></>,
  rush: (k, title, subtitle, data, doneTitle, seconds = 60) => <SpeedSort title={title} subtitle={subtitle} intro={<Brief k={k} />} buckets={data.buckets} items={data.items} seconds={seconds} doneTitle={doneTitle} onSave={ctx.save} onExit={ctx.exit} />,
  listen: (k, src, title, subtitle, script, qs) => <><div className="g10-brief-pad"><Brief k={k} /></div><ListenAudio title={title} subtitle={subtitle} src={src} script={script} questions={qs} onSave={ctx.save} onExit={ctx.exit} /></>,
});

/* =====================================================================
   10° · PERIODO 1 · FROM ZERO — VIDEOS, LECTURAS (B2), LISTENING Y DATOS
   ===================================================================== */
const VID_INFL10 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1794068117/videoplayback_41.mp4";
const VID_SD10 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1794068310/videoplayback_44.mp4";
const VID_COLOR10 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1794068411/videoplayback_42.mp4";
const VID_SHARK10 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1794068523/videoplayback_43.mp4";

/* ---------- VIDEO 1 · Inflation Explained (Johnny Harris) ---------- */
const VQ_INFL10 = [
  { q: "According to the video, what is the basic cause of inflation?", options: ["More money than goods and services to buy.", "A permanent fall in what companies can produce because trade tariffs became very high.", "A government plan to raise savings.", "Stable prices after a recession."], correct: 0, feedback: "Inflation happens when there is more money circulating than goods and services to spend it on — so prices go up." },
  { q: "How did government help during COVID-19 add to inflation later?", options: ["Stimulus checks pushed demand up fast.", "It forced banks to keep much more money in reserve and stop lending to their customers.", "It paid shipping companies.", "It closed the stock market."], correct: 0, feedback: "Checks, unemployment benefits and subsidies put a lot of cash in people's hands, so spending and demand jumped." },
  { q: "What happens when demand is high but supply chains are broken?", options: ["Businesses can't deliver enough, so prices rise.", "People keep their cash in safe boxes at home, so money moves more slowly in the economy.", "Interest rates fall alone.", "Shops have too much stock."], correct: 0, feedback: "Lots of money + not enough products arriving = shortages, and businesses raise prices at the same time." },
  { q: "What makes a central bank different from a normal bank?", options: ["It manages the economy, not profits.", "It mainly gives mortgages and credit cards to families who want to buy their first house.", "It belongs to retail shareholders.", "It sells phones."], correct: 0, feedback: "Commercial banks look for profit. The central bank 'babysits' the economy: jobs, growth and stable prices." },
  { q: "What do LOWER interest rates usually do?", options: ["Make loans cheaper, so people spend more.", "Punish spending and force companies to keep more cash in reserve instead of investing it.", "Stop all inflation.", "Close banks."], correct: 0, feedback: "Cheap borrowing encourages people and companies to take loans and spend — the economy speeds up." },
  { q: "What happens to your purchasing power with high inflation?", options: ["The same money buys fewer things.", "It goes up because salaries always grow faster than the prices in the supermarket.", "Your savings triple.", "Nothing at all."], correct: 0, feedback: "As prices rise across the board, each bill buys less than it did before." },
  { q: "What does the central bank do to cool down spending and inflation?", options: ["It raises interest rates.", "It sends extra stimulus checks to every family so they can pay their bills more easily.", "It fixes all prices.", "It prints posters."], correct: 0, feedback: "Higher rates make loans expensive, so people borrow and spend less, and demand cools down." },
  { q: "What usually comes after a boom built on cheap credit?", options: ["A recession: unsold goods and layoffs.", "A permanent period with zero inflation and a perfectly stable economy for many years.", "Free factories.", "A gold standard."], correct: 0, feedback: "When the stimulus ends and prices stay high, buyers disappear: factories close, people lose jobs." },
  { q: "What does the Venezuela example show about hyperinflation?", options: ["Money can become almost worthless.", "The central bank solved everything easily by printing more foreign cash for the people.", "People love cash more.", "Taxes disappear."], correct: 0, feedback: "In extreme hyperinflation, bills were worth more as material for crafts than as money." },
  { q: "According to the video, what keeps modern money working?", options: ["Trust: people believe it has value.", "A law that links every single bill directly to gold kept in the central bank's vault.", "Military treaties.", "Smart contracts."], correct: 0, feedback: "Fiat money works because we all believe it is worth something. When trust falls, money breaks." },
  { q: "Why does the video call the central bank a 'puppet master'?", options: ["Its rates pull the strings of spending.", "It secretly decides who wins the elections and who becomes the next president of the country.", "It owns all buildings.", "It makes toys."], correct: 0, feedback: "By moving interest rates, the central bank guides whether people spend or save." },
  { q: "What is the big lesson of the video?", options: ["Economies are fragile and depend on trust.", "Economies can grow forever without any risk of inflation or recession if banks work hard.", "Central banks never fail.", "Spending doesn't matter."], correct: 0, feedback: "Psychology, supply problems and money supply must stay in balance — small shocks can break it." },
];

/* ---------- VIDEO 2 · Supply and Demand (Jacob Clifford) ---------- */
const VQ_SD10 = [
  { q: "What principle explains why people buy LESS when the price goes UP?", options: ["The law of demand.", "The market clearing theorem, which fixes prices automatically every day in every market.", "Diminishing returns in factories.", "Comparative advantage."], correct: 0, feedback: "The law of demand: price and quantity demanded move in opposite directions (substitution, income and marginal utility)." },
  { q: "Ice cream gets much more expensive. How does the substitution effect work?", options: ["People switch to other treats, like candy bars.", "People use their savings to buy even more ice cream than before because it is more valuable.", "Producers double production.", "Demand shifts right."], correct: 0, feedback: "When a good becomes expensive, people choose cheaper alternatives." },
  { q: "Why do we enjoy the 5th slice of pizza less than the 1st?", options: ["Diminishing marginal utility.", "Structural market saturation that affects every product in the economy after some time.", "Income elasticity.", "Cost-push inflation."], correct: 0, feedback: "Each extra unit gives less satisfaction, so a lower price is needed to make you buy more." },
  { q: "How is a normal good different from an inferior good?", options: ["Normal goods: buy more when income rises. Inferior: buy less.", "Normal goods have fixed prices, while inferior goods change every season with the costs.", "Only monopolies sell normal goods.", "Income changes nothing."], correct: 0, feedback: "With more income you buy more normal goods — and less of inferior goods like instant noodles." },
  { q: "Why does the supply curve go UP?", options: ["Higher prices mean more profit, so firms produce more.", "The government forces every factory to produce a fixed quantity each year by law.", "Consumers prefer cheap goods.", "Inputs get cheaper."], correct: 0, feedback: "Producers are willing to sell more at higher prices because they earn more." },
  { q: "Milk becomes more expensive for an ice cream company. What happens to supply?", options: ["Supply decreases: the curve shifts left.", "Supply increases because the company wants to sell more ice cream to pay for the milk.", "Nothing changes.", "Demand shifts right."], correct: 0, feedback: "Higher input costs make production more expensive, so supply decreases (shift left)." },
  { q: "What do we call the price where quantity demanded = quantity supplied?", options: ["Equilibrium price.", "Disequilibrium surplus threshold for the market.", "Marginal cost.", "Price floor."], correct: 0, feedback: "Equilibrium (the market-clearing price) is where the two curves cross." },
  { q: "What happens if the price is set far BELOW equilibrium?", options: ["A shortage: people want more than is produced.", "A surplus: producers keep a lot of products that nobody wants to buy at that price.", "Perfect equilibrium.", "Both curves disappear."], correct: 0, feedback: "Low prices make people want more, but producers make less — a shortage." },
  { q: "In a free market, how does a surplus fix itself?", options: ["Sellers lower prices until the extra stock is sold.", "The government buys all the extra products at a high price to protect the producers.", "Consumers raise prices.", "Factories close forever."], correct: 0, feedback: "Extra inventory pushes competing sellers to cut prices until the market clears." },
  { q: "A study says ice cream makes you smarter. What happens?", options: ["Demand rises: higher price and quantity.", "Supply falls, so there is less ice cream and companies produce smaller quantities.", "Demand falls.", "Nothing changes."], correct: 0, feedback: "A change in tastes increases demand (shift right): equilibrium price and quantity go up." },
  { q: "What is the difference between a 'change in quantity demanded' and a 'change in demand'?", options: ["Only the good's own price moves you ALONG the curve.", "A change in demand is always caused by the profits of the companies, never by consumers.", "There is no difference.", "Price shifts the whole curve."], correct: 0, feedback: "Its own price = movement along the curve. Other factors (tastes, income…) = the curve shifts." },
  { q: "What advice does Jacob Clifford repeat for shift problems?", options: ["When in doubt, draw it out.", "Memorize big multi-variable tables with every possible combination of changes.", "Guess the price.", "Ignore graphs."], correct: 0, feedback: "Draw the graph and trace the shift — you will see the new price and quantity." },
];

/* ---------- VIDEO 3 · Color psychology in marketing ---------- */
const VQ_COLOR10 = [
  { q: "What role does color psychology play in branding?", options: ["Brands use it on purpose to shape emotions and choices.", "It decides the official prices that companies must use when they launch in other countries.", "It makes products last longer.", "It is a government rule."], correct: 0, feedback: "Colors are chosen deliberately to make us feel hunger, trust or excitement." },
  { q: "What does RED usually trigger?", options: ["Energy, urgency and appetite.", "Financial security, calm productivity and long-term corporate stability.", "Nature and calm.", "Royalty."], correct: 0, feedback: "Red raises the heart rate: passion, urgency and hunger (fast food, sales)." },
  { q: "Why do banks and tech companies love BLUE?", options: ["It communicates trust and security.", "It pushes people to buy on impulse during big discount days in stores.", "It means organic food.", "Babies see it first."], correct: 0, feedback: "Blue is calm and dependable — perfect for banks and tech brands." },
  { q: "How is YELLOW used in stores?", options: ["To catch attention and show optimism.", "To look like an exclusive luxury brand that only very rich clients can afford.", "To look like a bank.", "To mean nature."], correct: 0, feedback: "Yellow is cheerful and eye-catching — great for window shoppers and kids' products." },
  { q: "What job does ORANGE often do on websites?", options: ["Call-to-action buttons: buy, subscribe.", "A calm background color that helps people focus and work for many hours.", "Government forms.", "Luxury status."], correct: 0, feedback: "Orange = enthusiasm and confidence, so it works for 'Buy now' and 'Subscribe'." },
  { q: "When do brands use GREEN?", options: ["Health, growth, nature and eco products.", "To look aggressive, powerful and mysterious, like an exclusive luxury fashion house.", "Fast-food sales.", "Bank security."], correct: 0, feedback: "Green connects with nature, health and growth." },
  { q: "What image does PURPLE give a product?", options: ["Royalty, wisdom and luxury.", "Cheap discount products for very young customers who want cheerful and simple designs.", "Fast technology.", "Farming."], correct: 0, feedback: "Purple is historically linked to royalty: quality and sophistication (cosmetics, luxury)." },
  { q: "How are BLACK and WHITE different?", options: ["Black: power and luxury. White: purity and simplicity.", "Black makes people hungry and white makes people buy on impulse in every kind of store.", "Both mean nature.", "Black is for kids."], correct: 0, feedback: "Black = elegance and authority; white = clean, simple, minimal." },
  { q: "Why do clearance sales use red signs?", options: ["Red creates urgency.", "Red builds long-term trust with customers and makes them feel calm and secure.", "Red means eco.", "It's the cheapest paint."], correct: 0, feedback: "Red says 'act now!' — urgency drives bargain purchases." },
  { q: "What effect can blue have at work?", options: ["It can help productivity and calm.", "It makes people buy impulsively and spend more money than they planned to spend.", "It makes people tired.", "It raises stress."], correct: 0, feedback: "Blue is calm and non-invasive; it can support focus and productivity." },
  { q: "How do online stores choose colors?", options: ["Every shade is chosen to guide feelings and actions.", "Randomly, following whatever design trend is popular in that season, without any plan.", "By law.", "By printing costs only."], correct: 0, feedback: "Color in branding is never an accident: it is designed to influence perception." },
  { q: "What is the lesson for us as consumers?", options: ["Knowing color tricks helps us decide better.", "We always buy only by comparing prices, so colors and designs never change our decisions.", "Colors don't affect profit.", "Stores must remove colors."], correct: 0, feedback: "If you recognize the visual cues, you can make more conscious buying decisions." },
];

/* ---------- VIDEO 4 · A Shark Tank pitch ---------- */
const VQ_SHARK10 = [
  { q: "How did the entrepreneur fund his launch before Shark Tank?", options: ["With a Kickstarter campaign.", "With venture capital from big technology investors in Silicon Valley.", "With bank loans.", "By selling his house."], correct: 0, feedback: "He asked for about $10,000 on Kickstarter and raised around $350,000." },
  { q: "What customer acquisition cost (CAC) did he mention?", options: ["About $33.30 per customer.", "Around $148 for every single buyer that he gets through advertising.", "Zero dollars.", "70% of revenue."], correct: 0, feedback: "He calculated about $33.30 to win a customer, against an average sale of $148." },
  { q: "What profit margin did he report?", options: ["About 70%.", "Exactly 33%.", "Around 15%.", "Roughly 50%."], correct: 0, feedback: "He said his margin was about 70% on an average sale of $148." },
  { q: "Why did he ask for $212,000 for 10%?", options: ["He could say it without stuttering.", "It was exactly the amount of his manufacturing debts and the taxes that he owed.", "VC rules require it.", "A DCF model said so."], correct: 0, feedback: "An honest, funny moment: '$200,000' made him stutter, so he chose a number he could say!" },
  { q: "What was the Sharks' problem with his Kickstarter data?", options: ["Kickstarter isn't a normal, repeatable market.", "Kickstarter sales don't count as real sales because they are legally different from normal sales.", "It had no margins.", "Backers want shares."], correct: 0, feedback: "Crowdfunding is unusual: it doesn't prove what it costs to win customers every month." },
  { q: "How did he describe his operation?", options: ["Just him, in his garage, with friends.", "A big warehouse with dozens of workers who pack and send orders to many countries.", "An automated factory.", "A global partner."], correct: 0, feedback: "He was honest: it was only him, working from his garage." },
  { q: "Which new products made the Sharks skeptical?", options: ["T-shirts and underwear.", "High-end titanium cookware for camping trips in the mountains.", "Smart electronics.", "Organic food."], correct: 0, feedback: "Expanding into T-shirts and underwear looked like losing focus on the core product." },
  { q: "What was his main product?", options: ["Copper-infused bed sheets.", "Smart mattresses that connect with health apps on the phone.", "Bamboo pillows.", "Silk blankets."], correct: 0, feedback: "Copper-infused sheets designed to stop bad smells." },
  { q: "Why did he stop taking orders for a while?", options: ["He sold out and production was slow.", "A government agency forced him to recall all the products from the market.", "He was rebranding.", "Materials were too expensive."], correct: 0, feedback: "He sold out in November–December and shipping took weeks." },
  { q: "What did the Sharks think of his valuation (about $2 million)?", options: ["Too high without proven data.", "Too low compared with big technology companies that sell software around the world.", "Perfect.", "Hidden lawsuits."], correct: 0, feedback: "Without proven repeat customers outside Kickstarter, ~$2 million was premature." },
  { q: "How did he react to hard questions?", options: ["With honesty, humility and good humor.", "He got angry and said the investors didn't understand anything about finance or business.", "He walked out.", "He invented numbers."], correct: 0, feedback: "He stayed transparent and lighthearted — and grateful to be there." },
  { q: "What lesson does this pitch teach for YOUR Shark Tank?", options: ["Authenticity helps, but you need solid numbers.", "If you are funny and charming, the investors never ask about your numbers or your customers.", "Never smile.", "Ask for a random amount."], correct: 0, feedback: "His honesty made the pitch memorable, but the missing data hurt the deal. Bring both!" },
];

/* ---------- LISTENING · The Used Bike (mp3 · decimo1.mp3) ---------- */
const SCRIPT_BIKE = [
  { who: "Narrator", t: "Daniel is sixteen. He has saved 800,000 pesos and wants a used mountain bike. He finds one online for 900,000 pesos. Listen to two versions of the same negotiation. Version A." },
  { who: "Daniel", t: "Hi! I'm here for the bike. Wow, it's perfect! I've wanted this exact model for months." },
  { who: "Seller", t: "It's a great bike. The price is 900,000." },
  { who: "Daniel", t: "Okay... I only have 800,000. That's all my savings." },
  { who: "Seller", t: "Hmm. Other people are interested. I can do 850,000." },
  { who: "Daniel", t: "Fine, I'll find the other 50,000 somehow. Deal!" },
  { who: "Narrator", t: "Daniel got the bike, but he paid almost the full price and borrowed money from his brother. Now, Version B." },
  { who: "Daniel", t: "Good afternoon. Thanks for showing me the bike. Can I check it before we talk about the price?" },
  { who: "Seller", t: "Of course. The price is 900,000." },
  { who: "Daniel", t: "I see the back tire is worn, and the brakes need adjusting. A new tire costs about 80,000. I also checked online: three similar bikes are listed between 650,000 and 750,000." },
  { who: "Seller", t: "But mine has a new chain." },
  { who: "Daniel", t: "That's true, and I value that. Here's my offer: 680,000, in cash, today. You don't have to wait for other buyers or meet more strangers." },
  { who: "Seller", t: "680,000 is too low. I can't go below 780,000." },
  { who: "Daniel", t: "I understand. What if I pay 730,000 and you include the helmet and the lock? You said you don't use them anymore." },
  { who: "Seller", t: "Hmm... 740,000 with the helmet and the lock, and you take it today." },
  { who: "Daniel", t: "Deal. Thank you!" },
  { who: "Narrator", t: "In Version B, Daniel used three tools. He anchored the price with market data. He pointed out the flaws to lower the value. And he created a win-win: quick cash for the seller, and extra items for him. He paid 110,000 pesos less than in Version A, and he kept 60,000 of his savings." },
];
const Q_BIKE = [
  { q: "How much money did Daniel have saved?", options: ["800,000 pesos.", "900,000 pesos, exactly the price.", "740,000.", "50,000."], correct: 0, feedback: "He had 800,000 pesos — less than the 900,000 price." },
  { q: "What was Daniel's biggest mistake in Version A?", options: ["He showed his excitement and his budget.", "He checked the bike very carefully before talking and found every single problem with it.", "He paid in cash.", "He was too polite."], correct: 0, feedback: "Saying 'It's perfect!' and 'I only have 800,000' gave the seller all the power." },
  { q: "How much did Daniel pay in Version A?", options: ["850,000 pesos.", "740,000 pesos with a helmet and a lock included.", "900,000.", "680,000."], correct: 0, feedback: "The seller only lowered the price to 850,000." },
  { q: "What market data did Daniel use in Version B?", options: ["Similar bikes cost 650,000–750,000.", "The bank's interest rate for a loan to buy a bike was too high for him to pay.", "The color of the bike.", "Nothing."], correct: 0, feedback: "Comparing three similar bikes online helped him anchor a lower price." },
  { q: "Why did Daniel mention the worn tire and the brakes?", options: ["To lower the perceived value of the bike.", "Because he wanted the seller to fix them before he could ride the bike to his house.", "To be rude.", "To ask for a discount on brakes."], correct: 0, feedback: "Pointing out the flaws (a new tire costs about 80,000) reduced the value." },
  { q: "What made Version B a win-win?", options: ["Quick cash for the seller, extras for Daniel.", "The seller got exactly the price that he wanted and Daniel paid more than his savings.", "Both lost money.", "Daniel got it free."], correct: 0, feedback: "The seller sold fast in cash; Daniel got a lower price plus a helmet and a lock." },
  { q: "What was the final price in Version B?", options: ["740,000 pesos.", "730,000 pesos without anything extra.", "780,000.", "680,000."], correct: 0, feedback: "740,000 with the helmet and the lock included." },
  { q: "How much did Daniel save in Version B compared with Version A?", options: ["110,000 pesos.", "160,000 pesos, because the helmet and the lock are free.", "60,000.", "50,000."], correct: 0, feedback: "850,000 − 740,000 = 110,000 pesos." },
  { q: "Daniel's first offer was 680,000. What is this tactic called?", options: ["Anchoring.", "Showing the seller exactly how much money you have saved.", "Surrender.", "Inflation."], correct: 0, feedback: "A low but justified first offer 'anchors' the negotiation." },
  { q: "Which sentence is a persuasion frame from Version B?", options: ["“What if I pay 730,000 and you include the helmet?”", "“I only have 800,000. That's all my savings, so please help me.”", "“Deal!”", "“Wow, it's perfect!”"], correct: 0, feedback: "'What if…' proposes a new deal where both sides win something." },
];

/* ---------- LECTURA · The Red Paperclip (B2) ---------- */
const READ_CLIP = [
  { p: "In July 2005, a 26-year-old Canadian man called Kyle MacDonald was sitting at his desk in Montreal, looking at a red paperclip. He had no job, no house and very little money. Most people would see a paperclip as something worth almost nothing. Kyle saw a starting point. He took a photo of it, posted it on a website for free ads and asked a simple question: “What will you give me for this paperclip?”" },
  { p: "A year later, after fourteen trades, Kyle owned a house. He never used money in any of the trades. This true story became famous all over the world, and it is the inspiration for our Red Paperclip Challenge. But it is not a fairy tale about luck. It is a perfect lesson about value, needs and negotiation." },
  { h: "From a paperclip to a house" },
  { p: "Kyle's first trade was with two women who gave him a pen shaped like a fish. The fish pen became a hand-made doorknob. The doorknob became a camping stove. The stove became an electric generator, and the generator became an “instant party”: an empty beer barrel, a promise to fill it and an old neon sign. Then a comedian in Quebec offered a snowmobile for the party, and someone else offered a trip to a small town called Yahk for the snowmobile." },
  { node: <MiniTable key="t" head={["Step", "He gave…", "He got…", "Why the other person said yes"]} rows={[["1", "📎 Red paperclip", "🐟 Fish pen", "Fun story, almost no cost"], ["4", "🔥 Camping stove", "⚡ Generator", "The man needed a stove for camping"], ["7", "🛷 Snowmobile", "✈️ Trip to Yahk", "The town wanted publicity"], ["11", "🎸 Afternoon with a rock star", "🔮 Rare snow globe", "A collector wanted the experience"], ["14", "🎬 Role in a movie", "🏡 House in Kipling", "The town wanted visitors and fame"]]} /> },
  { p: "Later trades included a truck, a recording contract and one year of rent in Phoenix. The rent was traded for an afternoon with the rock singer Alice Cooper, and that afternoon was traded for a rare snow globe. A film director who collected snow globes offered a role in a movie for it. Finally, the small town of Kipling, in Saskatchewan, offered a two-floor farmhouse in exchange for the movie role — the town organized auditions and became famous. In July 2006, Kyle moved into his house." },
  { h: "Lesson 1: value is subjective" },
  { p: "Why would anybody give a snowmobile for a party kit? Because value is not inside the object — it is inside the person. The economist's word is subjective value: each person values a thing according to their own needs, plans and feelings. For the camper, a stove was more useful than a generator. For the collector, a snow globe was worth more than an afternoon with a rock star. Kyle did not need to find people who thought his object was valuable for everybody. He needed to find ONE person who valued it more than what they were giving." },
  { box: "💡 Every trade that both people accept voluntarily creates value: each one ends up with something they value MORE than what they had. Nobody has to lose for you to win." },
  { h: "Lesson 2: the story is part of the value" },
  { p: "After a few trades, journalists started to write about the man with the red paperclip. Suddenly, trading with Kyle meant appearing in the news. The town of Kipling did not only “buy” a movie role: it bought attention, tourists and a famous story. This is what marketers call perceived value. People pay for the product AND for what it means to them. A plain T-shirt is worth $20,000; the same T-shirt signed by a famous player can be worth $2,000,000." },
  { h: "Lesson 3: you need a double coincidence of wants" },
  { p: "Barter has a big problem. For a trade to happen, I must want what you have AND you must want what I have. Economists call this the double coincidence of wants. Kyle solved it with the internet: he could talk with thousands of people until he found the right match. In a small village without internet, it could take months. That is exactly why money was invented: money is a medium of exchange that everybody accepts, so you don't need the perfect partner." },
  { h: "Let's do the math" },
  { p: "Imagine you start with an object worth $2,000. You trade it for one worth $5,000. Your growth is (5,000 − 2,000) ÷ 2,000 = 1.5, which means 150%. Then you trade the $5,000 object for one worth $12,000: (12,000 − 5,000) ÷ 5,000 = 140%. From the start to the end, your total growth is (12,000 − 2,000) ÷ 2,000 = 500%. Not every trade must go up a lot. Sometimes a trade that keeps the same value is smart if the new object is easier to trade next time." },
  { node: <Mistakes key="m" items={["Thinking the paperclip story is only luck — Kyle talked with hundreds of people.", "Calculating growth over the NEW value. Always divide by the value you had BEFORE.", "Believing a trade is good only if YOU win. The best trades make both sides happier."]} /> },
  { h: "Your challenge" },
  { p: "In this period your team will start with a simple object and try to trade it up, step by step, in real life. You will register every trade in your Trade Log: what you gave, what you got, the estimated value, who your partner was, what need you solved and the English sentence that closed the deal. At the end, you will present your story in a Shark Tank Pitch." },
  { box: "📌 Summary: value is subjective · stories increase perceived value · barter needs a double coincidence of wants · growth % = (new − old) ÷ old × 100." },
];
const GLOSS_CLIP = { "subjective value": "how much ONE person values something, according to their needs", "perceived value": "the value people believe something has, including its story or brand", "double coincidence of wants": "in barter, both people must want what the other has", "medium of exchange": "something everybody accepts to pay, like money", "barter": "exchanging goods or services without money", "auditions": "tests where actors show their talent to get a role" };
const Q_CLIP = [
  { q: "What did Kyle MacDonald start with?", options: ["One red paperclip.", "A small house that he wanted to change for a bigger one in another city.", "A car.", "Money."], correct: 0, feedback: "He started with a single red paperclip in July 2005." },
  { q: "How many trades did he need to get the house?", options: ["Fourteen.", "Four, because each trade was very big and very lucky.", "Forty.", "One."], correct: 0, feedback: "14 trades in about one year (2005–2006)." },
  { q: "Why did the camper accept a generator-for-stove trade?", options: ["He needed a stove for camping.", "Because generators are always cheaper than stoves in every store in the country.", "He was forced.", "He lost a bet."], correct: 0, feedback: "Subjective value: the stove was more useful for HIS plans." },
  { q: "What does 'subjective value' mean?", options: ["Each person values things by their own needs.", "The official price written on the label that every store must respect by law.", "The weight of a thing.", "A tax."], correct: 0, feedback: "Value lives in the person, not in the object." },
  { q: "Why did the town of Kipling trade a house for a movie role?", options: ["It wanted publicity and visitors.", "Because the house was old and nobody in the town wanted to live in it anymore.", "It needed a paperclip.", "It was a mistake."], correct: 0, feedback: "The town bought attention, tourists and a famous story — perceived value." },
  { q: "What is the 'double coincidence of wants'?", options: ["Both people must want what the other has.", "When two people want the same object and they have to fight to get it first.", "Wanting two things.", "A discount."], correct: 0, feedback: "It's the big problem of barter — and why money was invented." },
  { q: "You trade a $4,000 object for one worth $10,000. What is your growth?", options: ["150%.", "60%, because you divide the difference by the new value of 10,000.", "40%.", "250%."], correct: 0, feedback: "(10,000 − 4,000) ÷ 4,000 = 1.5 → 150%. Always divide by the OLD value." },
  { q: "According to the text, a voluntary trade…", options: ["can make BOTH people better off.", "always means that one person wins and the other person loses the same amount.", "is illegal.", "needs a bank."], correct: 0, feedback: "Each side gets something they value more — value is created." },
  { q: "How did Kyle solve the barter problem?", options: ["He used the internet to find the right partners.", "He used money in the last trade because nobody wanted to exchange the house.", "He stole.", "He waited at home."], correct: 0, feedback: "The internet let him talk to thousands of people until he found a match." },
  { q: "A trade keeps the same value. When can it still be smart?", options: ["When the new object is easier to trade next.", "Never, because every trade must increase the value at least 100% to be a good trade.", "Only on Mondays.", "When it's heavy."], correct: 0, feedback: "Liquidity matters: an object more people want helps the next trade." },
];

/* ---------- LECTURA · Three Ideas of Value (B2) ---------- */
const READ_VALUE = [
  { p: "Why is a bottle of water cheap in Bogotá, but you would pay almost anything for it in the middle of the desert? Why does a diamond cost millions, even though nobody needs it to live? For more than 250 years, economists have asked the same question: where does value come from? In this reading you will meet three famous answers. None of them is “the only truth” — each one helps you see a different part of the market." },
  { h: "1. Adam Smith and the water–diamond paradox" },
  { p: "In 1776 the Scottish thinker Adam Smith published The Wealth of Nations, one of the first big books about economics. He noticed something strange: water is extremely useful, but it is cheap; diamonds are almost useless, but they are expensive. He called this the paradox of value. Smith separated two ideas: value in use (how useful something is) and value in exchange (what you can get for it in the market). He also thought that the work needed to produce something was an important part of its price." },
  { node: <MiniCase key="c1" e="💧" who="Example · water in two places" lines={["In a city with taps: lots of water, low price.", "In a desert after 2 days walking: very little water, a very high price.", "Same water — different situation."]} /> },
  { h: "2. Karl Marx and the value of work" },
  { p: "In 1867 the German philosopher Karl Marx published Capital. Building on Smith and David Ricardo, he argued that the value of a product comes from the human work needed to make it — more exactly, the average time society needs to produce it. A handmade chair that takes a carpenter 10 hours would contain more value than a plastic chair made by a machine in 2 minutes. Marx used this idea to criticize how profits are shared between business owners and workers. Many economists today disagree with his conclusions, but his question is still useful: who did the work, and who receives the money?" },
  { node: <MiniCase key="c2" e="🪑" who="Example · two chairs" lines={["Handmade wooden chair: 10 hours of work.", "Factory plastic chair: 2 minutes of machine work.", "Marx: the first one contains more labor value."]} /> },
  { h: "3. The subjective theory: value is in the eye of the buyer" },
  { p: "Around 1871, three economists in different countries — Carl Menger in Austria, William Stanley Jevons in England and Léon Walras in Switzerland — proposed a new answer. Value does not come from the work or the materials. It comes from the person who wants the thing. And it depends on marginal utility: how much satisfaction ONE more unit gives you. The first glass of water when you are thirsty is extremely valuable. The fifth glass is worth much less. That solves Smith's paradox: water is cheap because we usually have a lot of it, so one more liter gives little extra satisfaction; diamonds are rare, so one more diamond feels special." },
  { node: <MiniTable key="t" head={["Idea", "Value comes from…", "Good for explaining…"]} rows={[["Adam Smith (1776)", "Use, exchange and the work to produce it", "Why useful things are not always expensive"], ["Karl Marx (1867)", "Human labor time", "Debates about wages and profits"], ["Subjective theory (1871)", "The buyer's needs and marginal utility", "Why the same object has different prices"]]} /> },
  { h: "What this means for your trades" },
  { p: "Imagine your team has an umbrella. For a student who has three umbrellas at home, it is worth maybe $10,000. For a tourist going to a wedding in a storm, it could be worth $60,000. For a collector of vintage umbrellas, maybe $45,000. The umbrella is the same; the needs are different. A smart trader does not ask “How much is this worth?” but “Who needs this the most, and why?”." },
  { p: "However, work and costs also matter. If you spent 5 hours repairing and painting an old bicycle, you will not want to trade it for something that took 5 minutes to make — and many buyers will value your effort, especially if you tell the story. In real markets, price is the meeting point between what sellers need to cover their costs and what buyers are willing to pay." },
  { box: "💡 Willingness to pay = the maximum a buyer would pay. Price = what they actually pay. The difference is a gain for the buyer. A good negotiator finds a price that both sides accept." },
  { node: <Mistakes key="m" items={["Thinking one theory is 'right' and the others are 'wrong' — each explains a different part.", "Confusing price with value: a free hug can be very valuable!", "Forgetting that the SAME person can value the same thing differently on different days."]} /> },
  { box: "📌 Summary: Smith (use vs. exchange, the paradox) · Marx (labor value) · Subjective theory (needs and marginal utility). Ask: who needs it most, and why?" },
];
const GLOSS_VALUE = { "paradox of value": "useful things (water) can be cheap and useless things (diamonds) expensive", "value in use": "how useful something is", "value in exchange": "what you can get for something in the market", "marginal utility": "the extra satisfaction from ONE more unit", "willingness to pay": "the maximum money a buyer would pay", "labor": "human work" };
const Q_VALUE = [
  { q: "What is the 'paradox of value'?", options: ["Useful water is cheap; useless diamonds are expensive.", "Diamonds are cheap in the desert because people there need to buy a lot of water.", "Prices never change.", "Work has no value."], correct: 0, feedback: "Adam Smith noticed water is very useful but cheap, and diamonds the opposite." },
  { q: "According to Marx, where does value come from?", options: ["From human labor time.", "From the feelings of the buyer and how much they want the product on a special day.", "From diamonds.", "From banks."], correct: 0, feedback: "Marx linked value with the average work time needed to produce something." },
  { q: "What is marginal utility?", options: ["The extra satisfaction of ONE more unit.", "The total satisfaction of all the products that a person bought during the whole year.", "A tax.", "A machine."], correct: 0, feedback: "The first glass of water is worth a lot; the fifth, much less." },
  { q: "How does the subjective theory solve the paradox?", options: ["Water is abundant, so one more liter adds little.", "Diamonds are more useful than water for most people in the world, so they cost more.", "It doesn't.", "With taxes."], correct: 0, feedback: "Marginal utility: plenty of water → low value of the next liter; rare diamonds → high." },
  { q: "Which three economists proposed the subjective idea around 1871?", options: ["Menger, Jevons and Walras.", "Adam Smith, Karl Marx and David Ricardo, together in one famous book.", "Kyle MacDonald.", "Newton."], correct: 0, feedback: "Carl Menger, William Stanley Jevons and Léon Walras, in different countries." },
  { q: "The tourist values the umbrella at $60,000, the student at $10,000. Why?", options: ["Their needs are different.", "The tourist's umbrella is a different, better model made with more expensive materials.", "The student is rich.", "Random."], correct: 0, feedback: "Same umbrella, different situations → different subjective value." },
  { q: "What is 'willingness to pay'?", options: ["The most a buyer would pay.", "The price written on the label, which every buyer must pay without any negotiation.", "A discount.", "Bank interest."], correct: 0, feedback: "Price is what you pay; willingness to pay is your maximum." },
  { q: "What smart question should a trader ask?", options: ["“Who needs this most, and why?”", "“How can I convince somebody to pay more than the thing is really worth to them?”", "“What color is it?”", "“Is it heavy?”"], correct: 0, feedback: "Find the person with the strongest need — that's where value is highest." },
  { q: "What does the text say about the three theories?", options: ["Each explains a different part of value.", "Only the subjective theory is correct, so the other two theories are useless today.", "They are identical.", "They are illegal."], correct: 0, feedback: "Use all three as lenses — none is the only truth." },
  { q: "In real markets, price is…", options: ["the meeting point of costs and willingness to pay.", "always decided only by the seller, who chooses any number that covers the costs.", "random.", "the same everywhere."], correct: 0, feedback: "Sellers need to cover costs; buyers pay up to their willingness. Price meets in the middle." },
];

/* ---------- EXPLAINER · The Dollar Is a Product Too (B2) ---------- */
const BRIEF_DOLLAR = [
  { p: "When you buy an empanada, you buy a product: something you can touch, keep or use. When you get a haircut, you buy a service: an activity someone does for you. Now a tricky question: when you exchange pesos for dollars, are you buying a product or a service? The surprising answer is: both." },
  { h: "The dollar is a product" },
  { p: "A US dollar is a currency, but in Colombia it also behaves like a product with a price. That price is the exchange rate: how many pesos you pay for one dollar. Every day the Superintendencia Financiera publishes the TRM (Tasa Representativa del Mercado), based on the dollars that banks and companies bought and sold the day before. If many people want dollars (to travel, to import or to protect their savings) and few people sell them, the price goes up — the same supply and demand you studied in Class 3." },
  { h: "The exchange house sells a service" },
  { p: "A casa de cambio does not give you dollars at the TRM. It buys dollars from you at a lower price and sells dollars to you at a higher price. The difference is the spread, and it pays for their service: security, cash, location, employees and profit." },
  { node: <MiniTable key="t" head={["Example (illustrative)", "Pesos per US$1"]} rows={[["TRM today", "$4,000"], ["The house BUYS your dollars at", "$3,900"], ["The house SELLS you dollars at", "$4,100"], ["Spread", "$200 per dollar"]]} /> },
  { p: "Example 1: you buy US$300 for a trip: 300 × 4,100 = $1,230,000. At the TRM it would be $1,200,000, so the service cost you $30,000. Example 2: you come back with US$100 and sell them: 100 × 3,900 = $390,000. If you had bought and sold the same 100 dollars on the same day, you would lose 100 × 200 = $20,000 — that is the full spread." },
  { box: "💡 Devaluation: when the peso loses value, you need MORE pesos for one dollar (from $4,000 to $4,400 = the dollar went up 10%). Imported products, trips and foreign apps get more expensive in pesos." },
  { node: <Mistakes key="m" items={["Comparing only 'no commission' signs — the cost can be hidden in the price.", "Using the TRM as the price you will get at the airport.", "Thinking a strong dollar is good for everybody: exporters win, importers lose."]} /> },
];
const GLOSS_DOLLAR = { "exchange rate": "how many pesos you pay for one dollar", "TRM": "Colombia's official daily exchange rate, published by the Superintendencia Financiera", "spread": "the difference between the selling price and the buying price", "devaluation": "when a currency loses value against another one", "service": "an activity someone does for you", "product": "a thing you can touch, keep or use" };
const Q_DOLLAR = [
  { q: "What is the TRM?", options: ["Colombia's official daily exchange rate.", "The price that every exchange house must use when it sells dollars at the airport.", "A bank account.", "A tax."], correct: 0, feedback: "It is published daily, based on the dollars traded the day before." },
  { q: "TRM $4,000; the house sells at $4,100. You buy US$200. How much do you pay?", options: ["$820,000.", "$800,000, the same as the TRM, because the house doesn't charge commission.", "$780,000.", "$8,200."], correct: 0, feedback: "200 × 4,100 = $820,000." },
  { q: "What is the spread?", options: ["Selling price minus buying price.", "The commission that the government charges to every person who travels abroad.", "A type of dollar.", "Inflation."], correct: 0, feedback: "It's how the exchange house earns money for its service." },
  { q: "The dollar goes from $4,000 to $4,400. What happened?", options: ["The peso devalued 10%.", "The peso became 10% stronger, so imported products are cheaper now in Colombia.", "Nothing.", "Inflation fell."], correct: 0, feedback: "More pesos for one dollar = the peso lost value (devaluation)." },
  { q: "Why is a casa de cambio a service?", options: ["It gives you cash, safety and convenience.", "Because the dollars that it sells are a physical product that you can touch and keep.", "It is a bank.", "It is free."], correct: 0, feedback: "You pay for the activity of exchanging — the spread is its price." },
  { q: "Who usually WINS when the dollar goes up?", options: ["Exporters who sell in dollars.", "Families that buy imported phones, clothes and apps that are paid in dollars.", "Tourists traveling abroad.", "Nobody."], correct: 0, feedback: "Exporters receive dollars, which now buy more pesos." },
  { q: "A sign says 'No commission!'. What should you check?", options: ["The real buying and selling prices.", "Nothing, because 'no commission' always means it is the cheapest option in the city.", "The color of the sign.", "The employee's name."], correct: 0, feedback: "The cost can be hidden in a worse exchange rate." },
];

/* ---------- LECTURA · Leaders Who Started Small (B2) ---------- */
const READ_LEADERS = [
  { p: "When we see a famous company, we imagine big offices and millions of dollars. But many of the most successful leaders in the world started exactly like you: with a small idea, little money and a problem they wanted to solve. Here are three leaders from different centuries and countries. While you read, look for three things: the problem they saw, the value they created and the leadership traits that helped them." },
  { h: "Madam C.J. Walker · United States · 1867–1919" },
  { p: "Sarah Breedlove was born in 1867 in Louisiana, the daughter of formerly enslaved parents. She became an orphan at seven and later worked as a laundress for about a dollar and a half a day. In her thirties she suffered from a scalp problem that made her lose her hair — a common problem for Black women at that time, when many homes had no running water or electricity. She experimented with products, created her own hair-care formula and started selling it door to door as “Madam C.J. Walker”." },
  { p: "Her real innovation was not only the product: it was the business model. She trained thousands of women as sales agents, who earned their own money and independence. She is often described as one of the first self-made female millionaires in the United States, and she used her fortune to support education and civil rights." },
  { node: <MiniCase key="c1" e="💇🏾‍♀️" who="Madam C.J. Walker" lines={["Problem: hair loss and no products for Black women.", "Value: products + a job for thousands of women.", "Traits: resilience, vision, generosity."]} /> },
  { h: "Sara Blakely · United States · born 1971" },
  { p: "Sara Blakely sold fax machines door to door for seven years. She heard “no” so many times that rejection stopped scaring her. One day she wanted to wear white trousers without visible lines from her underwear, so she cut the feet off a pair of tights. The idea worked. With about $5,000 of savings and no business studies, she researched patents at night, wrote her own patent application and visited factories until one agreed to produce her design. She called the company Spanx and launched it in 2000." },
  { p: "She had no money for advertising, so she created value with her story and with clever distribution: she personally convinced store buyers and stood in shops explaining the product. In 2012 Forbes named her the youngest self-made female billionaire at that time. Her lesson for you: failure is not the opposite of success — it is part of the training." },
  { node: <MiniCase key="c2" e="🧦" who="Sara Blakely" lines={["Problem: clothes that looked bad with normal underwear.", "Value: a simple, comfortable solution.", "Traits: persistence, creativity, courage."]} /> },
  { h: "The founders of Rappi · Colombia · 2015" },
  { p: "In 2015, three Colombians — Simón Borrero, Sebastián Mejía and Felipe Villamarín — started a delivery app in Bogotá. At the beginning it delivered products from small convenience stores. The problem was clear: people in big cities had little time, and traffic made simple errands take hours. The founders tested the idea quickly, listened to users and added new services: restaurants, supermarkets, pharmacies and even cash delivery." },
  { p: "In 2018 Rappi became the first Colombian startup valued at more than US$1 billion — a “unicorn”. The company also faced hard criticism, especially about the working conditions of delivery workers, and it had to respond and change. That is part of leadership too: listening when people say you are doing something wrong." },
  { node: <MiniCase key="c3" e="🛵" who="Rappi's founders" lines={["Problem: no time, too much traffic.", "Value: everything delivered to your door.", "Traits: speed, teamwork, adaptability."]} /> },
  { h: "What do they have in common?" },
  { node: <MiniTable key="t" head={["", "Started with", "Key trait", "Impact"]} rows={[["Madam C.J. Walker", "A homemade formula", "Resilience", "Jobs for thousands of women"], ["Sara Blakely", "About $5,000", "Persistence", "A new product category"], ["Rappi founders", "A simple app", "Adaptability", "Services for millions of users"]]} /> },
  { p: "None of them started with a perfect plan. All of them solved a real problem, created value for others and kept improving. Notice also the difference between a feature and a benefit: Spanx's feature was “no feet and strong fabric”; its benefit was “you feel confident in your clothes”. Leaders sell benefits." },
  { box: "📌 Summary: see a problem → create value → persist → listen and improve. Ask yourself: which of these traits do I want for my Future Me?" },
];
const GLOSS_LEADERS = { "laundress": "a woman whose job is washing clothes", "sales agents": "people who sell a company's products and earn a commission", "patent": "a legal document that protects an invention", "unicorn": "a startup valued at more than US$1 billion", "rejection": "when someone says no to you", "adaptability": "the ability to change when the situation changes" };
const Q_LEADERS = [
  { q: "What problem did Madam C.J. Walker solve?", options: ["Hair loss and no products for Black women.", "The lack of good laundries in big cities, where people had no time to wash clothes.", "Traffic in Bogotá.", "Expensive fax machines."], correct: 0, feedback: "She suffered the problem herself and created products for it." },
  { q: "What was Madam C.J. Walker's business model innovation?", options: ["Training thousands of women as sales agents.", "Selling only in big department stores with expensive advertising on the radio.", "A mobile app.", "Selling fax machines."], correct: 0, feedback: "Her agents earned their own money — value for customers AND for workers." },
  { q: "How much money did Sara Blakely start Spanx with?", options: ["About $5,000 of savings.", "About $5 million from investors who believed in her idea from the first day.", "Nothing.", "$1 billion."], correct: 0, feedback: "Around $5,000 — and no business degree." },
  { q: "What helped Sara Blakely handle rejection?", options: ["Years of selling fax machines door to door.", "Her university studies in business, where she learned how to talk with investors.", "Luck.", "Her rich family."], correct: 0, feedback: "Hearing 'no' for seven years made her fearless." },
  { q: "What did Rappi deliver at the very beginning?", options: ["Products from convenience stores.", "Cash and medicines to hospitals in every city of Latin America at the same time.", "Fax machines.", "Houses."], correct: 0, feedback: "It started simple, then added restaurants, supermarkets, pharmacies…" },
  { q: "What is a 'unicorn' in business?", options: ["A startup valued over US$1 billion.", "A company that never makes mistakes and never receives criticism from anyone.", "A magic product.", "A new bank."], correct: 0, feedback: "Rappi became Colombia's first unicorn in 2018." },
  { q: "Why does the text mention criticism of Rappi?", options: ["Listening and changing is part of leadership.", "To show that Rappi is a bad company that people should never use again.", "To sell the app.", "It is not important."], correct: 0, feedback: "Leaders must listen when people point out problems." },
  { q: "Which is a BENEFIT (not a feature)?", options: ["“You feel confident in your clothes.”", "“Strong fabric without feet, made in a factory with a special machine.”", "“It's black.”", "“It costs $50.”"], correct: 0, feedback: "Features describe the product; benefits describe how your life improves." },
  { q: "What do the three leaders have in common?", options: ["They solved a real problem and kept improving.", "They all started with a lot of money and a perfect plan from the first day.", "They were all from Colombia.", "They never failed."], correct: 0, feedback: "Problem → value → persistence → improvement." },
  { q: "Which trait is most connected to Sara Blakely?", options: ["Persistence.", "Generosity with thousands of sales agents across the country.", "Speed.", "Luck."], correct: 0, feedback: "She kept going after many 'no's — persistence." },
];

/* ---------- STARTER · Before Money ---------- */
const STARTER_BARTER = [
  { e: "🔁", t: "Barter", d: "Exchanging goods or services directly, without money.", ex: "My notebook for your cap." },
  { e: "🤝", t: "Double coincidence of wants", d: "In barter, I must want what you have AND you must want what I have.", ex: "I have fish and want bread — I need a baker who wants fish!" },
  { e: "🪙", t: "Medium of exchange", d: "Something everybody accepts as payment.", ex: "Pesos, dollars… in the past, salt or shells." },
  { e: "📏", t: "Unit of account", d: "A common measure to compare prices.", ex: "A cap costs $30,000; a notebook $8,000." },
  { e: "🏦", t: "Store of value", d: "Money keeps value for the future (if inflation is low).", ex: "Bananas rot; coins don't." },
  { e: "⏳", t: "Scarcity", d: "When there is less of something than people want.", ex: "Concert tickets for a famous singer." },
];
const STARTER_BARTER_PAIRS = STARTER_BARTER.map((c) => ({ a: c.t, b: c.d }));

/* ---------- RUSH · Shift the curve ---------- */
const RUSH_SHIFT = {
  buckets: [
    { id: "dU", e: "📈", l: "Demand ↑", d: "people want MORE", c: "#16b074" }, { id: "dD", e: "📉", l: "Demand ↓", d: "people want LESS", c: "#ff6b57" },
    { id: "sU", e: "🏭", l: "Supply ↑", d: "sellers offer MORE", c: "#1b4a33" }, { id: "sD", e: "⛔", l: "Supply ↓", d: "sellers offer LESS", c: "#f5b23e" },
  ],
  items: [
    { e: "🌧️", t: "A storm is coming: umbrellas", b: "dU", why: "More people want umbrellas → demand increases." },
    { e: "🥛", t: "Milk gets expensive: ice cream", b: "sD", why: "Higher input costs → less supply." },
    { e: "🤖", t: "A new machine makes shoes faster", b: "sU", why: "Better technology → more supply." },
    { e: "🦠", t: "A study says a snack is unhealthy", b: "dD", why: "Tastes change → demand falls." },
    { e: "⚽", t: "Colombia plays the final: jerseys", b: "dU", why: "More people want jerseys → demand rises." },
    { e: "🌱", t: "Perfect weather: big avocado harvest", b: "sU", why: "More production → supply increases." },
    { e: "🚚", t: "A truck strike: fruit in the city", b: "sD", why: "Less arrives to the market → supply falls." },
    { e: "💸", t: "Salaries rise: restaurant meals", b: "dU", why: "More income → more demand for normal goods." },
    { e: "📱", t: "A new phone model arrives: old model", b: "dD", why: "People prefer the new one → demand for the old falls." },
    { e: "🏛️", t: "The government gives a subsidy to farmers", b: "sU", why: "Lower costs for producers → supply increases." },
    { e: "🔥", t: "A fire destroys a coffee farm", b: "sD", why: "Less production → supply falls." },
    { e: "📉", t: "Bus tickets get much cheaper: taxis", b: "dD", why: "A cheaper substitute → demand for taxis falls." },
  ],
};
/* ---------- RUSH · Product or service? ---------- */
const RUSH_PS = {
  buckets: [{ id: "p", e: "📦", l: "Product", d: "you can touch or keep it", c: "#f5b23e" }, { id: "s", e: "🛎️", l: "Service", d: "someone does it for you", c: "#16b074" }],
  items: [
    { e: "👟", t: "A pair of sneakers", b: "p", why: "You can touch it and keep it." }, { e: "💇", t: "A haircut", b: "s", why: "Someone does an activity for you." },
    { e: "🚕", t: "A taxi ride", b: "s", why: "Transport is an activity." }, { e: "📱", t: "A phone", b: "p", why: "A physical thing." },
    { e: "🏦", t: "Exchanging pesos for dollars", b: "s", why: "The exchange house sells the activity of exchanging." }, { e: "💵", t: "A 100-dollar bill", b: "p", why: "The bill itself is something you can keep." },
    { e: "🎓", t: "A math tutoring class", b: "s", why: "Teaching is an activity." }, { e: "🍔", t: "A hamburger to go", b: "p", why: "You take the food with you." },
    { e: "🎬", t: "A streaming subscription", b: "s", why: "Access to content over time is a service." }, { e: "📚", t: "A printed book", b: "p", why: "A physical thing." },
    { e: "🧹", t: "House cleaning", b: "s", why: "Someone does a job for you." }, { e: "🔧", t: "Repairing a bike", b: "s", why: "The repair is an activity." },
    { e: "🎸", t: "A guitar", b: "p", why: "You can touch and keep it." }, { e: "🛡️", t: "Phone insurance", b: "s", why: "Protection is a service." },
  ],
};
/* ---------- RUSH · Color feelings ---------- */
const RUSH_COLOR = {
  buckets: [
    { id: "blue", e: "🔵", l: "Blue", d: "trust · security", c: "#2f80ed" }, { id: "red", e: "🔴", l: "Red", d: "urgency · appetite", c: "#ff6b57" },
    { id: "green", e: "🟢", l: "Green", d: "health · nature", c: "#16b074" }, { id: "purple", e: "🟣", l: "Purple / Black", d: "luxury · elegance", c: "#7b4fd6" },
  ],
  items: [
    { e: "🏦", t: "A new digital bank wants people to trust it", b: "blue", why: "Blue = trust and security." }, { e: "🍕", t: "A pizza place wants hungry customers", b: "red", why: "Red stimulates appetite." },
    { e: "🥗", t: "An organic salad bar", b: "green", why: "Green = health and nature." }, { e: "💎", t: "A premium perfume", b: "purple", why: "Purple and black = luxury." },
    { e: "🏷️", t: "A 'Last day: 50% off!' sign", b: "red", why: "Red = urgency." }, { e: "♻️", t: "A recycling startup", b: "green", why: "Green = eco-friendly." },
    { e: "💻", t: "A cybersecurity company", b: "blue", why: "Blue = dependable and secure." }, { e: "⌚", t: "An exclusive watch brand", b: "purple", why: "Black/purple = elegance and status." },
    { e: "🌿", t: "A natural shampoo", b: "green", why: "Green = natural." }, { e: "🍔", t: "A fast-food combo ad", b: "red", why: "Red + appetite + urgency." },
    { e: "🛡️", t: "An insurance company", b: "blue", why: "Blue = protection and calm." }, { e: "👗", t: "A high-end fashion house", b: "purple", why: "Black = luxury and authority." },
  ],
};

/* ---------- BOSS P1 · 5 misiones + 10 preguntas ---------- */
const BOSS1_MISSIONS = [
  { tag: "🔁 Trade growth", q: "You traded a $3,000 object for one worth $7,500. What is your growth in %?", answer: 150, unit: "%", tol: 1, hint: "(new − old) ÷ old × 100", explain: "(7,500 − 3,000) ÷ 3,000 = 1.5 → 150%." },
  { tag: "💵 Exchange", q: "The house sells dollars at $4,150. How many pesos for US$200?", answer: 830000, money: true, hint: "200 × 4,150", explain: "200 × 4,150 = $830,000." },
  { tag: "📈 Supply & demand", q: "A frost destroys half of the strawberry harvest. What happens to the price?", options: ["It goes up: supply falls.", "It goes down because people stop liking strawberries after a frost in the country.", "Nothing.", "It becomes free."], correct: 0, explain: "Less supply with the same demand → higher price." },
  { tag: "🫧 Inflation", q: "Inflation is 10%. A $50,000 basket costs how much next year?", answer: 55000, money: true, hint: "50,000 × 1.10", explain: "50,000 × 1.10 = $55,000." },
  { tag: "🏷️ Brand", q: "Which motto speaks about a BENEFIT?", options: ["“Sleep better, wake up stronger.”", "“Made with 100% cotton fabric and a special double stitch in our factory.”", "“Blue box.”", "“Since 2025.”"], correct: 0, explain: "A benefit says how your life improves." },
];
const BOSS1_Q = [
  { t: "Money & inflation", q: "Why does money in a piggy bank lose value?", options: ["Inflation makes prices rise.", "Because the bank charges a monthly fee to every piggy bank that families keep at home.", "Coins get old.", "It doesn't."], correct: 0, feedback: "Prices rise, so the same money buys less." },
  { t: "Money & inflation", q: "What does a central bank do to fight inflation?", options: ["It raises interest rates.", "It prints more money and gives it to families so they can pay the new prices.", "It closes shops.", "It lowers taxes."], correct: 0, feedback: "Higher rates → less borrowing and spending → prices calm down." },
  { t: "Barter & value", q: "What is the main problem of barter?", options: ["The double coincidence of wants.", "Barter is illegal in most countries, so people can go to prison if they exchange things.", "Objects break.", "It's too fast."], correct: 0, feedback: "Both must want what the other has — money solves it." },
  { t: "Barter & value", q: "Same umbrella: $10,000 for one buyer, $60,000 for another. This shows…", options: ["subjective value.", "that one of the buyers doesn't know the official price of umbrellas in the market.", "inflation.", "a mistake."], correct: 0, feedback: "Value depends on each person's needs." },
  { t: "Supply & demand", q: "The price is set far below equilibrium. What appears?", options: ["A shortage.", "A surplus of products that nobody wants to buy, so stores throw them away.", "Equilibrium.", "Inflation."], correct: 0, feedback: "People want more than is produced → shortage." },
  { t: "Supply & demand", q: "Salaries rise. What happens to demand for restaurant meals (a normal good)?", options: ["It increases.", "It decreases because people prefer to cook at home when they earn more money.", "No change.", "It disappears."], correct: 0, feedback: "More income → more demand for normal goods." },
  { t: "Dollar & services", q: "Which is a SERVICE?", options: ["Exchanging currency at a casa de cambio.", "A 100-dollar bill that you keep in your wallet for your next trip abroad.", "A phone.", "Sneakers."], correct: 0, feedback: "The exchange is an activity done for you." },
  { t: "Dollar & services", q: "The dollar goes from $4,000 to $4,300. Who wins?", options: ["Colombian exporters.", "Families who buy imported products and pay for apps that charge in dollars.", "Tourists going abroad.", "Importers."], correct: 0, feedback: "Exporters receive more pesos for each dollar." },
  { t: "Brand & leadership", q: "Why do banks often use blue?", options: ["It communicates trust.", "Because blue makes people hungry and urgent, so they open accounts faster.", "It's cheap.", "By law."], correct: 0, feedback: "Blue = trust and security." },
  { t: "Brand & leadership", q: "What did the leaders in the reading have in common?", options: ["They solved a real problem and persisted.", "They all started with millions of dollars and never heard the word 'no' from anyone.", "They were lucky.", "They copied others."], correct: 0, feedback: "Problem → value → persistence." },
];
const BOSS1_TIPS = { "Money & inflation": "Review the inflation video and The Last Million: inflation = prices rise, money buys less; central banks raise rates to cool it.", "Barter & value": "Reread The Red Paperclip and Three Ideas of Value: double coincidence of wants and subjective value.", "Supply & demand": "Replay the Market Price Machine: draw it out — which curve moves, and where?", "Dollar & services": "Reread The Dollar Is a Product Too: TRM, spread, devaluation.", "Brand & leadership": "Review the color video and Leaders Who Started Small: colors communicate; leaders sell benefits." };

/* =====================================================================
   10° · PERIODO 1 · JUEGOS
   ===================================================================== */

/* ---------- Trade Log (Red Paperclip Challenge en la vida real) ---------- */
const TL_EMOJI = ["📎", "✏️", "📓", "🧢", "🍫", "🧸", "🎧", "📚", "⚽", "🎮", "👟", "🪴", "🎸", "🛹", "🚲", "📱", "🎁", "🏆"];
const TL_PARTNER = ["Classmate", "Family member", "Neighbor", "Teacher", "Friend outside school", "Small business"];
const SAMPLE_LOG = [{ n: 0, item: "Red paperclip", e: "📎", value: 500 }, { n: 1, item: "Notebook", e: "📓", value: 6000 }, { n: 2, item: "Board game", e: "🎲", value: 35000 }, { n: 3, item: "Skateboard", e: "🛹", value: 90000 }];
const tradeLogOf = (r) => {
  const s = r?.c2_seed?.seed;
  if (!s) return { steps: [], sample: true };
  const steps = [{ n: 0, item: s.item, e: s.e, value: s.value }];
  [r.c3_trade1?.trade, r.c4_trade2?.trade, r.c7_card?.trade].forEach((t) => { if (t) steps.push({ n: steps.length, item: t.got, e: t.e, value: t.value, partner: t.partner, need: t.need, sentence: t.sentence }); });
  return { steps, sample: false };
};

function TradeEntry({ n, before, val, set }) {
  const v = val || {};
  const up = (k, x) => set({ ...v, [k]: x });
  return (
    <div className="start-block g10-trade">
      <h3>🔁 Trade {n} · Trade Log</h3>
      <p className="start-tip">You gave: <b>{before ? `${before.e} ${before.item} (${cop(before.value)})` : "your seed object"}</b>. Write what you got.</p>
      <div className="g10-trade-grid">
        <label className="p3-lbl">What did you get?<input className="start-input" value={v.got || ""} onChange={(e) => up("got", e.target.value)} placeholder="A board game" /></label>
        <label className="p3-lbl">Estimated value (COP)<MoneyInput value={v.value || ""} onChange={(x) => up("value", x)} placeholder="25000" /></label>
      </div>
      <span className="terms-label">Icon:</span>
      <div className="g10-emo">{TL_EMOJI.map((e) => <button key={e} type="button" className={v.e === e ? "on" : ""} onClick={() => up("e", e)}>{e}</button>)}</div>
      <span className="terms-label">Partner profile:</span>
      <div className="p1-starters">{TL_PARTNER.map((p) => <button key={p} type="button" className={`p1-chip ${v.partner === p ? "on" : ""}`} onClick={() => up("partner", p)}>{p}</button>)}</div>
      <label className="p3-lbl">What need did your trade solve for your partner?<input className="start-input" value={v.need || ""} onChange={(e) => up("need", e.target.value)} placeholder="She needed a notebook for her art class" /></label>
      <label className="p3-lbl">The English sentence that closed the deal:<input className="start-input" value={v.sentence || ""} onChange={(e) => up("sentence", e.target.value)} placeholder="What if I give you… and you give me…?" /></label>
      {before && num(v.value) > 0 && <div className="g91-mini"><span className={num(v.value) >= before.value ? "pos" : "neg"}>Growth of this trade <b>{pctTxt(growth(before.value, num(v.value)))}</b></span></div>}
    </div>
  );
}
const tradeOk = (v) => !!v && countWords(v.got) >= 1 && num(v.value) > 0 && !!v.e && !!v.partner && countWords(v.need) >= 4 && countWords(v.sentence) >= 5;
const tradeData = (v) => ({ got: v.got.trim(), e: v.e, value: num(v.value), partner: v.partner, need: v.need.trim(), sentence: v.sentence.trim() });

/* ---------- C1 · Money Radar 10 (punto de partida) ---------- */
function Radar10Start({ existing, onSave, onExit }) {
  const [phase, setPhase] = useState(existing?.scores ? "done" : "quiz");
  const [scores, setScores] = useState(existing?.scores || null);
  const [saving, setSaving] = useState(false);
  if (phase === "quiz") return <RadarQuiz title="My Money Radar 10 · Day 1" qs={RADAR10_Q} intro={<Brief91 k="c1_radar" />} onExit={onExit} onDone={(ans) => { const sc = radarScores10(ans); const avg = Math.round(Object.values(sc).reduce((a, v) => a + v, 0) / 5); setScores(sc); setPhase("done"); setSaving(true); Promise.resolve(onSave({ answers: ans, scores: sc, average: avg, profile: radarProfile10(avg).l, xp: 25 })).finally(() => setSaving(false)); }} />;
  const avg = Math.round(Object.values(scores).reduce((a, v) => a + v, 0) / 5);
  const prof = radarProfile10(avg);
  const sorted = RADAR10_DIMS.map((d) => ({ ...d, v: scores[d.k] })).sort((a, b) => b.v - a.v);
  return (
    <div className="s1-quiz diag-result g74-radar2">
      <div className="diag-badge"><Compass size={30} strokeWidth={2.1} /></div>
      <h2>My Money Radar 10 · My starting point</h2>
      <p className="diag-sub">Your photo on day 1 of 10th grade. In Period 4 you will answer the same situations and compare.</p>
      <div className="g7-radar-wrap"><RadarN labels={RADAR10_DIMS.map((d) => d.short)} values={RADAR10_DIMS.map((d) => scores[d.k])} /></div>
      <div className="diag-bars">{RADAR10_DIMS.map((d) => <div key={d.k} className="diag-bar"><span className="diag-bar-l">{d.l}</span><div className="diag-bar-track"><i style={{ width: `${scores[d.k]}%` }} /></div><span className="diag-bar-v">{scores[d.k]}%</span></div>)}</div>
      <div className="diag-risk"><span className="diag-risk-tag">{prof.l}</span><p>{prof.d} Average: <b>{avg}%</b>.</p></div>
      <div className="p1-diag-cards"><div className="p1-diag-card good"><b>💪 Strongest: {sorted[0].l}</b><span>Use it to help your team.</span></div><div className="p1-diag-card next"><b>🎯 Challenge: {sorted[4].l}</b><span>This year will train it.</span></div></div>
      <button className="s1-btn primary" onClick={onExit}>Continue <ChevronRight size={18} /></button>
      {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing your progress…</span>}
    </div>
  );
}

/* ---------- C1 · The Last Million (alcancía vs. cuenta vs. CDT vs. fondo · 5 años) ---------- */
const LM_OPTS = [
  { k: "mat", l: "Under the mattress", e: "🛏️", d: "0% · always available", c: "#9aa5a0" },
  { k: "sav", l: "Savings account", e: "🏦", d: "4% E.A. · available any day", c: "#1b4a33" },
  { k: "cdt", l: "CDT (renews every year)", e: "📜", d: "9.5% E.A. · locked · early exit −3%", c: "#16b074" },
  { k: "fund", l: "Investment fund", e: "📈", d: "moves every year · it can fall", c: "#f5b23e" },
  { k: "stuff", l: "Buy things now", e: "🛍️", d: "fun today · loses 25% value per year", c: "#ff6b57" },
];
const LM_INFL = [5.6, 13.1, 9.3, 5.2, 5.0];
const LM_FUND = [12, -9, 16, 8, 11];
const LM_EVENTS = [
  { e: "📱", t: "Year 1 · Black Friday", d: "A phone you love is 30% off: $400,000. Buy it?", opts: [{ t: "Buy it (from mattress or savings)", f: (b) => ({ take: 400000, to: "stuff" }), note: "Fun today — but things lose value fast." }, { t: "Skip it and keep my plan", f: () => null, note: "Your plan keeps working for you." }] },
  { e: "🦷", t: "Year 2 · Emergency!", d: "A dental emergency costs $300,000. You must pay it now.", forced: true },
  { e: "😱", t: "Year 3 · The fund fell 9% last year", d: "Your friend says: “Sell everything before it falls more!”", opts: [{ t: "Sell the fund and put it under the mattress", f: () => ({ moveAll: ["fund", "mat"] }), note: "Panic selling locks in the loss — and the mattress loses to inflation." }, { t: "Keep my plan: funds go up and down", f: () => null, note: "Long-term investors ride the roller coaster." }] },
  { e: "💼", t: "Year 4 · You got a part-time job!", d: "You can add $300,000. Where?", opts: [{ t: "Into the CDT", f: () => ({ add: 300000, to: "cdt" }), note: "Safe and it beats inflation this year." }, { t: "Into the fund", f: () => ({ add: 300000, to: "fund" }), note: "More risk, more expected growth." }, { t: "Spend it on clothes", f: () => ({ add: 300000, to: "stuff" }), note: "Fun now, but it loses value." }] },
  { e: "🏁", t: "Year 5 · Last year", d: "No surprises this year. Let's see the final results!", opts: [{ t: "See the results", f: () => null, note: "" }] },
];
function LastMillion({ onSave, onExit }) {
  const [alloc, setAlloc] = useState({ mat: 20, sav: 20, cdt: 20, fund: 20, stuff: 20 });
  const [stage, setStage] = useState("plan");
  const [y, setY] = useState(0);
  const [bal, setBal] = useState(null);
  const [hist, setHist] = useState([]);
  const [msg, setMsg] = useState("");
  const [extra, setExtra] = useState(0);
  const [st, finish] = useFinish(onSave);
  const sum = Object.values(alloc).reduce((a, v) => a + v, 0);
  const tot = (b) => Object.values(b).reduce((a, v) => a + v, 0);
  const start = () => { const b = Object.fromEntries(LM_OPTS.map((o) => [o.k, Math.round((alloc[o.k] / 100) * 1000000)])); setBal(b); setHist([{ y: 0, total: 1000000, need: 1000000 }]); setStage("play"); };
  const applyYear = (b) => { const r = { mat: 0, sav: 4, cdt: 9.5, fund: LM_FUND[y], stuff: -25 }; const nb = {}; LM_OPTS.forEach((o) => { nb[o.k] = Math.round(b[o.k] * (1 + r[o.k] / 100)); }); return nb; };
  const decide = (opt) => {
    let b = { ...bal }; let note = opt?.note || "";
    const ev = LM_EVENTS[y];
    if (ev.forced) {
      let need = 300000; const order = ["mat", "sav", "fund", "cdt", "stuff"];
      const parts = [];
      for (const k of order) { if (need <= 0) break; const take = Math.min(b[k], need); if (take > 0) { b[k] -= take; need -= take; parts.push(k); if (k === "cdt") { const pen = Math.round(take * 0.03); b.cdt = Math.max(0, b.cdt - pen); parts.push("penalty"); } } }
      if (need > 0) { setExtra(extra + Math.round(need * 0.3)); note = "You didn't have enough: you borrowed the rest at a high cost (+30%)."; }
      else note = parts.includes("penalty") ? "Your liquid money wasn't enough: you broke the CDT and paid a 3% penalty. Lesson: keep an emergency fund in a liquid place." : parts[0] === "mat" || parts[0] === "sav" ? "You paid with liquid money (mattress or savings). That's why an emergency fund matters." : "You had to sell part of your fund — maybe at a bad moment.";
    } else if (opt) {
      const fx = opt.f(b);
      if (fx?.take) { let need = fx.take; for (const k of ["mat", "sav"]) { const t = Math.min(b[k], need); b[k] -= t; need -= t; } const paid = fx.take - need; b.stuff += paid; if (need > 0) note += " You didn't have enough liquid money for all of it."; }
      if (fx?.moveAll) { b[fx.moveAll[1]] += b[fx.moveAll[0]]; b[fx.moveAll[0]] = 0; }
      if (fx?.add) b[fx.to] += fx.add;
    }
    const nb = applyYear(b);
    const needV = Math.round(hist[hist.length - 1].need * (1 + LM_INFL[y] / 100));
    setBal(nb); setHist([...hist, { y: y + 1, total: tot(nb), need: needV }]); setMsg(note);
    if (y === LM_EVENTS.length - 1) setStage("end"); else setY(y + 1);
  };
  if (st.done) return <Reward title="Five years survived! 💰" subtitle="Now you know why money must work against inflation." coins={st.coins} saving={st.saving} onExit={onExit} />;
  const last = hist[hist.length - 1];
  const real = last ? Math.round((last.total - extra) * 1000000 / last.need) : 0;
  return (
    <ActShell icon={<PiggyBank size={22} strokeWidth={2.1} />} title="The Last Million 💰" subtitle="$1,000,000 (fictional) · 5 years · inflation, emergencies and temptations." onExit={onExit}>
      <Brief91 k="c1_million" />
      <Steps91 labels={["1 · Plan", "2 · Live 5 years", "3 · Results"]} at={stage === "plan" ? 0 : stage === "play" ? 1 : 2} />
      {stage === "plan" && (
        <>
          <HowTo>Split your <b>$1,000,000</b> into 5 places (steps of 10%). Then you will live 5 years with real-life events. Inflation is similar to Colombia 2021–2025 (approximately). You win if your money keeps or increases its <b>purchasing power</b>.</HowTo>
          <AllocBars items={LM_OPTS} vals={alloc} set={setAlloc} step={10} />
          <div className="start-foot"><button className="s1-btn primary big" disabled={sum !== 100} onClick={start}>{sum === 100 ? "Start year 1" : "Assign 100%"} <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage !== "plan" && bal && (
        <>
          <div className="g10-stats">{LM_OPTS.map((o) => <div key={o.k}><small>{o.e} {o.l}</small><b>{cop(bal[o.k])}</b></div>)}</div>
          <div className="g91-mini"><span>💰 Total <b>{cop(last.total)}</b></span><span>🛒 Needed to keep purchasing power <b>{cop(last.need)}</b></span>{extra > 0 && <span className="neg">💳 Debt cost <b>{cop(extra)}</b></span>}</div>
          {msg && <div className="p1-banner"><span>{msg}</span></div>}
        </>
      )}
      {stage === "play" && (
        <div className="start-block g10-event">
          <div className="g10-event-head"><em>{LM_EVENTS[y].e}</em><div><b>{LM_EVENTS[y].t}</b><p>{LM_EVENTS[y].d} <i>Inflation this year: {LM_INFL[y]}% · fund: {LM_FUND[y] > 0 ? "+" : ""}{LM_FUND[y]}%</i></p></div></div>
          {LM_EVENTS[y].forced ? <div className="start-foot"><button className="s1-btn primary big" onClick={() => decide(null)}>Pay the emergency</button></div>
            : <div className="quiz-options">{LM_EVENTS[y].opts.map((o) => <button key={o.t} type="button" className="quiz-opt" onClick={() => decide(o)}><span className="opt-text">{o.t}</span></button>)}</div>}
        </div>
      )}
      {stage === "end" && (
        <>
          <ChartCard title="My money vs. the money I NEED to keep my purchasing power" legend={[{ name: "My total", color: "#16b074" }, { name: "Needed (inflation)", color: "#ff6b57" }]}>
            <LineChart labels={hist.map((h) => `Y${h.y}`)} series={[{ name: "My total", values: hist.map((h) => h.total), color: "#16b074" }, { name: "Needed", values: hist.map((h) => h.need), color: "#ff6b57" }]} />
          </ChartCard>
          <div className={`p1-banner ${real >= 1000000 ? "good" : "bad"}`}><span>In today's money, your $1,000,000 is now worth <b>{cop(real)}</b> of purchasing power. {real >= 1000000 ? "You beat inflation! 🏆" : "Inflation won this time. Look at where your money was."}</span></div>
          <PickOne q="What is the main lesson of The Last Million?" options={["Money that doesn't grow loses purchasing power.", "The mattress is the safest place for all your money because nobody can steal it from a bank.", "Inflation never matters.", "Spend everything now."]} correct={0} explain="Inflation eats money that sits still. Liquid savings for emergencies + investments for growth." />
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(30 + (real >= 1000000 ? 10 : 0), { alloc, final: last.total, real, history: hist, debt: extra })}>Save my 5 years <span className="coin-tag"><Coins size={15} /> +{30 + (real >= 1000000 ? 10 : 0)}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C1 · Future Me ID · Page 01 ---------- */
const FM_AVATARS = ["🧑🏽‍🚀", "👩🏽‍💻", "👨🏾‍🔬", "👩🏻‍⚕️", "🧑🏼‍🎨", "👨🏽‍🍳", "👩🏾‍💼", "🧑🏻‍🏫", "👨🏻‍✈️", "👩🏽‍🔧", "🧑🏾‍⚖️", "👩🏼‍🌾"];
const FM_DREAMS = ["engineer", "doctor", "designer", "entrepreneur", "lawyer", "chef", "teacher", "programmer", "architect", "psychologist", "athlete", "musician", "pilot", "economist"];
const FM_TRAITS = ["creative", "organized", "curious", "brave", "patient", "a leader", "a good listener", "competitive", "kind", "practical"];
function FutureMeId({ studentName, existing, onSave, onExit }) {
  const e = existing || {};
  const [name, setName] = useState(e.name || (studentName || "").split(" ")[0]);
  const [avatar, setAvatar] = useState(e.avatar || "");
  const [dream, setDream] = useState(e.dream || "");
  const [city, setCity] = useState(e.city || "");
  const [traits, setTraits] = useState(e.traits || []);
  const [goal, setGoal] = useState(e.goal || "");
  const [text, setText] = useState(e.text || "");
  const [st, finish] = useFinish(onSave);
  const G = [W_FUTURE, W_REASON];
  const ok = name.trim() && avatar && dream && city.trim() && traits.length === 3 && countWords(goal) >= 5 && goalsOk(text, 25, 80, G);
  if (st.done) return <Reward title="Future Me ID created! 🪪" subtitle="Page 01 is in your Future Me portfolio." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Fingerprint size={22} strokeWidth={2.1} />} title="Future Me ID 🪪 · Page 01" subtitle="Who do you think you will be at 25? This card travels with you the whole year." onExit={onExit}>
      <Brief91 k="c1_id" />
      <FPBadge n={1} t="My starting point" e="🪪" />
      <div className="g10-idgrid">
        <div className="start-block">
          <label className="p3-lbl">My name<input className="start-input" value={name} onChange={(x) => setName(x.target.value)} /></label>
          <span className="terms-label">My Future Me avatar:</span>
          <div className="g10-emo big">{FM_AVATARS.map((a) => <button key={a} type="button" className={avatar === a ? "on" : ""} onClick={() => setAvatar(a)}>{a}</button>)}</div>
          <span className="terms-label">My first career dream:</span>
          <div className="p1-starters">{FM_DREAMS.map((d) => <button key={d} type="button" className={`p1-chip ${dream === d ? "on" : ""}`} onClick={() => setDream(d)}>{d}</button>)}</div>
          <label className="p3-lbl">Where will I live at 25?<input className="start-input" value={city} onChange={(x) => setCity(x.target.value)} placeholder="Bogotá, Medellín, Madrid…" /></label>
          <span className="terms-label">3 words that describe me ({traits.length}/3):</span>
          <div className="p1-starters">{FM_TRAITS.map((t) => <button key={t} type="button" className={`p1-chip ${traits.includes(t) ? "on" : ""}`} onClick={() => setTraits(traits.includes(t) ? traits.filter((x) => x !== t) : traits.length < 3 ? [...traits, t] : traits)}>{t}</button>)}</div>
          <label className="p3-lbl">One goal for this year (money or life):<input className="start-input" value={goal} onChange={(x) => setGoal(x.target.value)} placeholder="I want to save $300,000 for…" /></label>
        </div>
        <div className="g10-idcard" id="g10-idcard">
          <small>FUTURE ME ID · 2035</small>
          <em>{avatar || "❔"}</em>
          <b>{name || "Your name"}</b>
          <span>future {dream || "…"} · {city || "…"}</span>
          <div>{traits.map((t) => <i key={t}>{t}</i>)}</div>
          <p>🎯 {goal || "My goal…"}</p>
        </div>
      </div>
      <div className="start-block">
        <h3>✍️ Page 01 · My starting point</h3>
        <p className="start-tip">Write about your Future Me at 25: your job, your city and one money habit. Use <b>will</b> or <b>going to</b>, and give a reason.</p>
        <Starters items={["At 25, I will be…", "I'm going to live in…", "I want to… because…"]} onPick={appendStarter(setText)} />
        <WordField value={text} onChange={setText} min={25} max={80} goals={G} placeholder="At 25, I will be a… I'm going to live in… because…" />
      </div>
      <div className="start-foot"><button className="s1-btn ghost" onClick={() => downloadPNG("g10-idcard", "Future_Me_ID.png")}><Download size={16} /> Save my ID</button><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30, { name: name.trim(), avatar, dream, city: city.trim(), traits, goal: goal.trim(), text })}>Save Page 01 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- C2 · Barter Island (puzzle de cadenas de trueque) ---------- */
const ISLAND = [
  { goal: "💊", goalL: "medicine", start: "🐟", people: [{ n: "Doctor Ana", has: "💊", wants: "🍞" }, { n: "Baker Leo", has: "🍞", wants: "🔨" }, { n: "Smith Rosa", has: "🔨", wants: "🐟" }, { n: "Farmer Tim", has: "🌽", wants: "👕" }] },
  { goal: "🛶", goalL: "a canoe", start: "🍯", people: [{ n: "Builder Max", has: "🛶", wants: "🧶" }, { n: "Weaver Sol", has: "🧶", wants: "🥥" }, { n: "Collector Ivy", has: "🥥", wants: "🧂" }, { n: "Trader Nico", has: "🧂", wants: "🍯" }, { n: "Fisher Eva", has: "🐟", wants: "🛶" }, { n: "Potter Kai", has: "🏺", wants: "🍯" }] },
  { goal: "🏠", goalL: "a roof repair", start: "📻", people: [{ n: "Roofer Dan", has: "🏠", wants: "🐐" }, { n: "Herder Mia", has: "🐐", wants: "🚲" }, { n: "Mechanic Joe", has: "🚲", wants: "🎣" }, { n: "Fisher Lu", has: "🎣", wants: "📻" }, { n: "DJ Rita", has: "🎧", wants: "📻" }, { n: "Cook Sam", has: "🍲", wants: "🎧" }, { n: "Tailor Bea", has: "👕", wants: "🍲" }] },
];
function BarterIsland({ onSave, onExit }) {
  const [lv, setLv] = useState(0);
  const [have, setHave] = useState(ISLAND[0].start);
  const [moves, setMoves] = useState(0);
  const [fails, setFails] = useState(0);
  const [log, setLog] = useState([]);
  const [note, setNote] = useState(null);
  const [res, setRes] = useState([]);
  const [money, setMoney] = useState(false);
  const [mStep, setMStep] = useState(0);
  const [st, finish] = useFinish(onSave);
  const L = ISLAND[lv];
  const won = have === L.goal;
  const tap = (p) => {
    if (won) return;
    if (p.wants !== have) { setFails(fails + 1); setNote({ bad: true, t: `${p.n} doesn't want ${have}. No double coincidence of wants! (${p.n.split(" ")[0]} wants ${p.wants})` }); return; }
    setLog([...log, `${have} → ${p.has}`]); setHave(p.has); setMoves(moves + 1); setNote({ bad: false, t: `Deal! You gave ${have} to ${p.n} and got ${p.has}.` });
  };
  const nextLv = () => { const r = [...res, { moves, fails }]; setRes(r); if (lv < ISLAND.length - 1) { setLv(lv + 1); setHave(ISLAND[lv + 1].start); setMoves(0); setFails(0); setLog([]); setNote(null); } else setMoney(true); };
  if (st.done) return <Reward title="Island explorer! 🏝️" subtitle="Now you know why humans invented money." coins={st.coins} saving={st.saving} onExit={onExit} />;
  if (money) {
    return (
      <ActShell icon={<Coins size={22} strokeWidth={2.1} />} title="Barter Island · Money Mode 🪙" subtitle="The island invents shells as money. Repeat level 3." onExit={onExit}>
        <HowTo>Now everybody accepts <b>🐚 shells</b>. You don't need a chain: sell your 📻 for shells, then buy the roof repair.</HowTo>
        <div className="g10-island-path"><span className={mStep >= 0 ? "on" : ""}>📻</span><i>→</i><span className={mStep >= 1 ? "on" : ""}>🐚 ×12</span><i>→</i><span className={mStep >= 2 ? "on" : ""}>🏠</span></div>
        <div className="p3-card-actions">
          <button className="s1-btn primary" disabled={mStep !== 0} onClick={() => setMStep(1)}>Sell 📻 to DJ Rita for 12 🐚</button>
          <button className="s1-btn primary" disabled={mStep !== 1} onClick={() => setMStep(2)}>Pay Roofer Dan 12 🐚</button>
        </div>
        {mStep === 2 && (
          <>
            <div className="p1-banner good"><span>2 moves with money vs. <b>{res[2]?.moves || 4}</b> moves (and <b>{res[2]?.fails || 0}</b> failed tries) with barter.</span></div>
            <PickOne q="Why was money mode faster?" options={["Money is a medium of exchange everybody accepts.", "Because shells are more beautiful and more valuable than any object on the island.", "Because Dan likes radios.", "It wasn't faster."]} correct={0} explain="With money you don't need the double coincidence of wants." />
            <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(26, { levels: res })}>Finish the island <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
          </>
        )}
      </ActShell>
    );
  }
  return (
    <ActShell icon={<MapIcon size={22} strokeWidth={2.1} />} title="Barter Island 🏝️" subtitle="No money on this island. Find the chain of trades to get what you need." onExit={onExit}>
      <Brief91 k="c2_island" />
      <Steps91 labels={["Level 1", "Level 2", "Level 3", "Money mode"]} at={lv} />
      <div className="g10-island-top"><div><small>YOU HAVE</small><em>{have}</em></div><i>➜</i><div><small>YOU NEED</small><em>{L.goal}</em><span>{L.goalL}</span></div><div><small>MOVES</small><b>{moves}</b></div><div><small>FAILED</small><b>{fails}</b></div></div>
      <p className="start-tip">Tap a villager to offer your {have}. They only accept what they WANT.</p>
      <div className="g10-villagers">{L.people.map((p) => <button key={p.n} type="button" onClick={() => tap(p)} disabled={won}><b>{p.n}</b><span>has <em>{p.has}</em></span><small>wants {p.wants}</small></button>)}</div>
      {note && <div className={`p1-banner ${note.bad ? "bad" : "good"}`}><span>{note.t}</span></div>}
      {log.length > 0 && <div className="g10-island-path">{[L.start, ...log.map((x) => x.split(" → ")[1])].map((x, k) => <React.Fragment key={k}>{k > 0 && <i>→</i>}<span className="on">{x}</span></React.Fragment>)}</div>}
      {won && <div className="start-foot"><button className="s1-btn primary big" onClick={nextLv}>{lv < ISLAND.length - 1 ? `Level ${lv + 2}` : "Try money mode 🪙"} <ChevronRight size={18} /></button></div>}
    </ActShell>
  );
}

/* ---------- C2 · CREAR Market 10 (trueque en vivo · Apps Script trade_* · Grado "10") ---------- */
const MARKET10 = {
  clip: { name: "Red paper clip", e: "📎", v: 1, cat: "Study" }, pen: { name: "Fancy pen", e: "🖊️", v: 3, cat: "Study" }, cap: { name: "Baseball cap", e: "🧢", v: 8, cat: "Style" },
  calc: { name: "Scientific calculator", e: "🧮", v: 15, cat: "Study" }, ball: { name: "Football", e: "⚽", v: 18, cat: "Sport" }, speaker: { name: "Bluetooth speaker", e: "🔊", v: 30, cat: "Tech" },
  sneakers: { name: "Sneakers", e: "👟", v: 45, cat: "Style" }, skate: { name: "Skateboard", e: "🛹", v: 55, cat: "Sport" }, guitar: { name: "Guitar", e: "🎸", v: 70, cat: "Art" },
  console: { name: "Game console", e: "🎮", v: 110, cat: "Tech" }, bike: { name: "Bicycle", e: "🚲", v: 130, cat: "Transport" }, scooter: { name: "Electric scooter", e: "🛴", v: 180, cat: "Transport" },
};
const NEEDS10 = ["Study", "Style", "Sport", "Tech", "Transport", "Art"];
const m10 = (id) => MARKET10[id] || { name: id || "?", e: "❓", v: 0, cat: "" };
const hashKey = (s) => String(s || "x").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7);
/* Valor de mercado: el valor base cambia con la escasez real del salón (cuántos lo tienen) */
const marketValue10 = (id, board) => {
  const base = m10(id).v; if (!board || !board.length) return base;
  const holders = board.filter((b) => b.object === id).length;
  const avg = board.length / Object.keys(MARKET10).length;
  const f = Math.max(0.6, Math.min(1.6, 1 + ((avg - holders) / (avg + 1)) * 0.5));
  return Math.max(1, Math.round(base * f));
};
function CrearMarket10({ userData, API_URL, existing, onSave, onExit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [mode, setMode] = useState("home");
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState(null);
  const [why, setWhy] = useState("");
  const [notes, setNotes] = useState(existing?.notes || []);
  const [text, setText] = useState("");
  const [st, finish] = useFinish(onSave);
  const waiting = useRef(null);
  const post = async (action, extra = {}) => { const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action, user_key: userData?.Student_Key, nombre: userData?.Nombre_Completo, grado: "10", ...extra }) }); return res.json(); };
  const run = async (action, extra) => { setBusy(true); setMsg(null); try { const d = await post(action, extra); if (d.status === "error") { setMsg({ t: "bad", x: d.message }); return null; } if ("me" in d) setData(d); return d; } catch (e) { setMsg({ t: "bad", x: "Connection problem. Try again." }); return null; } finally { setBusy(false); setLoading(false); } };
  useEffect(() => { run("trade_state"); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const myCode = data?.myCode;
  useEffect(() => {
    if (mode !== "offer" || !myCode || myCode.status !== "open") return undefined;
    const id = setInterval(async () => { try { const d = await post("trade_state"); if (d && "me" in d) setData(d); } catch (e) { /* reintenta */ } }, 4000);
    return () => clearInterval(id);
  }, [mode, myCode?.code, myCode?.status]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (mode === "offer" && waiting.current && myCode?.code === waiting.current && myCode?.status === "used") { waiting.current = null; setMode("home"); setMsg({ t: "good", x: "🎉 Trade complete! Check your new object." }); } }, [myCode, mode]);
  const me = data?.me; const board = data?.board || [];
  const need = NEEDS10[hashKey(userData?.Student_Key) % NEEDS10.length];
  const trades = me?.trades || 0;
  const mvNow = me ? marketValue10(me.object, board) : 0;
  const mvStart = me ? m10(me.start).v : 0;
  const needMet = me && m10(me.object).cat === need;
  const G = [W_COMPARE, W_REASON];
  const coins = 18 + Math.min(trades, 5) * 4 + (needMet ? 6 : 0);
  const accept = async () => {
    const d = await run("trade_accept", { code });
    if (d?.me) { const t = d.traded; setNotes([...notes, { gave: t?.gave || preview?.myObject, got: t?.got || preview?.theirObject, why: why.trim() }]); setMsg({ t: "good", x: t ? `🤝 You gave your ${m10(t.gave).name} and got a ${m10(t.got).name} from ${t.with}!` : "🤝 Trade complete!" }); setMode("home"); setCode(""); setPreview(null); setWhy(""); }
  };
  if (st.done) return <Reward title="Market closed! 🏪" subtitle={`${trades} trades · ${m10(me?.object).e} ${m10(me?.object).name}${needMet ? " · client's need solved ✅" : ""}`} coins={st.coins} saving={st.saving} onExit={onExit} gold={needMet} />;
  return (
    <ActShell icon={<Store size={22} strokeWidth={2.1} />} title="CREAR Market 10 · Level Up 🏪" subtitle="The 6th-grade market — now with market values that change, a secret client and a trade analysis." onExit={onExit}>
      <Brief91 k="c2_market" />
      {msg && <div className={`p1-banner ${msg.t}`}><span>{msg.x}</span></div>}
      <div className="g10-need"><em>🕵️</em><div><small>YOUR SECRET CLIENT NEEDS</small><b>Something from the category: {need}</b><span>Finish with a {need} object = +6 🪙 bonus. Don't tell everybody!</span></div></div>
      {loading ? <p className="start-tip p1-center">Opening the market…</p> : !me ? (
        <div className="start-block"><h3><Gift size={18} /> Choose your mystery box</h3><p className="start-tip">Only ONE box. Inside is your first object.</p><div className="p1-boxes">{Array.from({ length: 10 }, (_, i) => <button key={i} type="button" className="p1-box" disabled={busy} onClick={() => run("trade_pick", { box: i })}>🎁<small>Box {i + 1}</small></button>)}</div></div>
      ) : (
        <>
          <div className="g10-mk-top">
            <div className="g10-obj big"><small>MY OBJECT NOW</small><em>{m10(me.object).e}</em><b>{m10(me.object).name}</b><span>{m10(me.object).cat}</span><i>Base {m10(me.object).v} · market <b>{mvNow}</b> CC</i></div>
            <div className="g10-stats"><div><small>🔁 Trades</small><b>{trades}</b></div><div><small>📈 Growth vs. start</small><b className={mvNow >= mvStart ? "pos" : "neg"}>{pctTxt(growth(mvStart, mvNow), 0)}</b></div><div><small>🎯 Client need</small><b>{needMet ? "✅" : "Not yet"}</b></div></div>
          </div>
          <p className="start-tip">💡 The <b>market value</b> changes with scarcity: if few classmates have an object, its value goes up; if many have it, it goes down.</p>
          {mode === "home" && <div className="p1-options"><button className="s1-btn primary big" disabled={busy} onClick={async () => { const d = await run("trade_offer"); if (d?.myCode) { waiting.current = d.myCode.code; setMode("offer"); } }}><KeyRound size={17} /> Offer a trade (get a code)</button><button className="s1-btn ghost big" onClick={() => { setMode("redeem"); setMsg(null); }}>I have a code</button></div>}
          {mode === "offer" && myCode && (
            <div className="start-block p1-center">
              <p className="start-tip">Show this code to your partner. They type it on their tablet.</p>
              <div className="p1-code">{myCode.code}</div>
              <p className="p1-waiting"><span className="s1-sync-dot" /> Waiting for your partner…</p>
              <div className="p1-frames"><b>Persuade in English:</b><span>“Imagine having a {m10(me.object).name.toLowerCase()} for your {m10(me.object).cat.toLowerCase()} plans…”</span><span>“What if I give you my {m10(me.object).name.toLowerCase()} and you give me…?”</span><span>“Its market value today is {mvNow} — that's more than…”</span></div>
              <button className="s1-btn ghost" disabled={busy} onClick={async () => { await run("trade_cancel"); waiting.current = null; setMode("home"); }}>Cancel offer</button>
            </div>
          )}
          {mode === "redeem" && <div className="start-block p1-center"><h3>Type your partner's code</h3><input className="start-input p1-code-input" maxLength={4} value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="ABCD" /><div className="p1-options"><button className="s1-btn ghost" onClick={() => setMode("home")}>Back</button><button className="s1-btn primary" disabled={code.length !== 4 || busy} onClick={async () => { const d = await run("trade_preview", { code }); if (d?.preview) { setPreview(d.preview); setMode("preview"); } }}>See the offer</button></div></div>}
          {mode === "preview" && preview && (
            <div className="start-block">
              <h3><Users size={18} /> Offer from {preview.partner}</h3>
              <div className="g10-vs"><div className="g10-obj"><small>YOU GIVE</small><em>{m10(preview.myObject).e}</em><b>{m10(preview.myObject).name}</b><i>market {marketValue10(preview.myObject, board)}</i></div><span>⇄</span><div className="g10-obj"><small>YOU GET</small><em>{m10(preview.theirObject).e}</em><b>{m10(preview.theirObject).name}</b><i>market {marketValue10(preview.theirObject, board)} · {m10(preview.theirObject).cat}</i></div></div>
              <label className="p3-lbl">Why does this trade create value for you? (6+ words)<input className="start-input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="It is more valuable than… because…" /></label>
              <div className="p1-options"><button className="s1-btn ghost" onClick={() => { setMode("home"); setPreview(null); setCode(""); }}>No, thanks</button><button className="s1-btn primary big" disabled={busy || countWords(why) < 6} onClick={accept}>Deal! Trade <Check size={17} /></button></div>
            </div>
          )}
          {me.history?.length > 0 && (
            <ChartCard title="📈 My value path (base value)">
              <LineChart money={false} unit=" CC" labels={["Start", ...me.history.map((_, k) => `T${k + 1}`)]} series={[{ name: "Value", values: [m10(me.start).v, ...me.history.map((h) => m10(h.got).v)], color: "#16b074" }]} />
            </ChartCard>
          )}
          {board.length > 0 && <div className="start-block"><h3><Trophy size={18} /> Market board <button type="button" className="p1-link" onClick={() => run("trade_state")}><RefreshCw size={13} /> refresh</button></h3><div className="p1-board">{board.slice(0, 15).map((b, i) => <div key={i} className={`p1-board-row ${b.me ? "me" : ""}`}><span className="p1-board-n">{i + 1}</span><span className="p1-board-name">{b.name}{b.me ? " (you)" : ""}</span><span>{m10(b.object).e} {marketValue10(b.object, board)}</span><span>{b.trades} 🔁</span></div>)}</div></div>}
          <div className="start-block"><h3>✍️ My market analysis</h3><p className="start-tip">Compare your first and your last object: market value vs. what it means for YOU (subjective value).</p><WordField value={text} onChange={setText} min={20} max={70} goals={G} placeholder="My skateboard is more valuable than my pen because…" /></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={trades < 1 || !goalsOk(text, 20, 70, G)} onClick={() => finish(coins, { start: me.start, final: me.object, trades, need, needMet, mvStart, mvNow, history: me.history, notes, text })}>{trades < 1 ? "Make at least 1 trade" : "Close my market"} <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C2 · Our seed asset · Page 02 ---------- */
function SeedAsset({ existing, onSave, onExit }) {
  const e = existing?.seed || {};
  const [item, setItem] = useState(e.item || "");
  const [emo, setEmo] = useState(e.e || "📎");
  const [value, setValue] = useState(e.value || "");
  const [team, setTeam] = useState(existing?.team || "");
  const [client, setClient] = useState(existing?.client || "");
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const G = [W_PAST, W_REASON];
  const ok = countWords(item) >= 1 && num(value) > 0 && countWords(team) >= 2 && countWords(client) >= 4 && goalsOk(text, 20, 70, G);
  if (st.done) return <Reward title="Seed asset registered! 🌱" subtitle="Step 0 of your Red Paperclip Challenge." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Sprout size={22} strokeWidth={2.1} />} title="Our Seed Asset 🌱 · Page 02" subtitle="THE BIG PROJECT starts: the Red Paperclip Challenge. Register the object your team will trade up in real life." onExit={onExit}>
      <Brief91 k="c2_seed" />
      <FPBadge n={2} t="Our seed asset" e="🌱" />
      <HowTo>Your team chooses ONE simple object (cheap, legal, easy to carry). During the period you will trade it with real people outside class, step by step, and register each trade here. Rules: no money, no lying about value, ask an adult before trading with strangers.</HowTo>
      <div className="start-block">
        <label className="p3-lbl">Team members<input className="start-input" value={team} onChange={(x) => setTeam(x.target.value)} placeholder="Ana, Luis, Sofía" /></label>
        <div className="g10-trade-grid"><label className="p3-lbl">Our seed object<input className="start-input" value={item} onChange={(x) => setItem(x.target.value)} placeholder="A red paperclip" /></label><label className="p3-lbl">Estimated value (COP)<MoneyInput value={value} onChange={setValue} placeholder="500" /></label></div>
        <span className="terms-label">Icon:</span>
        <div className="g10-emo">{TL_EMOJI.map((x) => <button key={x} type="button" className={emo === x ? "on" : ""} onClick={() => setEmo(x)}>{x}</button>)}</div>
        <label className="p3-lbl">Who could be our first client, and what do they need?<input className="start-input" value={client} onChange={(x) => setClient(x.target.value)} placeholder="A classmate who needs… for…" /></label>
      </div>
      <div className="start-block"><h3>✍️ Page 02 · How we chose it</h3><p className="start-tip">Tell the story of how you chose your object (past simple) and why it is a good start.</p><WordField value={text} onChange={setText} min={20} max={70} goals={G} placeholder="We chose a… because… First, we thought about… then we decided…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(26, { seed: { item: item.trim(), e: emo, value: num(value) }, team: team.trim(), client: client.trim(), text })}>Save Page 02 <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
    </ActShell>
  );
}

/* ---------- C3 · Market Price Machine (oferta y demanda en vivo) ---------- */
const SD_EVENTS = [
  { e: "💧", prod: "Bottled water", t: "A storm destroys 60% of bottled water production.", dD: 0, dS: -24, p: "up", q: "down" },
  { e: "🎤", prod: "Concert tickets", t: "A famous singer announces a surprise guest.", dD: 22, dS: 0, p: "up", q: "up" },
  { e: "🤖", prod: "Sneakers", t: "A new robot makes sneakers twice as fast.", dD: 0, dS: 24, p: "down", q: "up" },
  { e: "🍫", prod: "Chocolate bars", t: "A viral video says a chocolate brand is unhealthy.", dD: -20, dS: 0, p: "down", q: "down" },
  { e: "☂️", prod: "Umbrellas", t: "Rainy season starts AND a factory closes.", dD: 18, dS: -14, p: "up", q: "same" },
  { e: "🎮", prod: "Game consoles", t: "Salaries rise and a cheaper chip lowers costs.", dD: 16, dS: 16, p: "same", q: "up" },
];
const sdEq = (dD, dS) => { const Q = (80 + dD + dS) / 2; return { Q, P: 100 - Q + dD }; };
function SDGraph({ dD, dS, ghost }) {
  const W = 320, H = 240, x = (q) => 34 + (q / 100) * (W - 50), y = (p) => H - 28 - (p / 130) * (H - 44);
  const line = (f) => [0, 100].map((q) => `${x(q)},${y(f(q))}`).join(" ");
  const e = sdEq(dD, dS), g = ghost ? sdEq(ghost.dD, ghost.dS) : null;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="g10-sd">
      <line x1={34} y1={H - 28} x2={W - 10} y2={H - 28} className="ax" /><line x1={34} y1={10} x2={34} y2={H - 28} className="ax" />
      <text x={W - 12} y={H - 10} textAnchor="end" className="lb">Quantity</text><text x={38} y={20} className="lb">Price</text>
      {ghost && <><polyline points={line((q) => 100 - q + ghost.dD)} className="ghost" /><polyline points={line((q) => 20 + q - ghost.dS)} className="ghost" /></>}
      <polyline points={line((q) => 100 - q + dD)} className="dem" /><polyline points={line((q) => 20 + q - dS)} className="sup" />
      <text x={x(8)} y={y(100 - 8 + dD) - 6} className="dl">D</text><text x={x(92)} y={y(20 + 92 - dS) - 6} className="sl">S</text>
      {g && <circle cx={x(g.Q)} cy={y(g.P)} r="5" className="old" />}
      <line x1={34} x2={x(e.Q)} y1={y(e.P)} y2={y(e.P)} className="dash" /><line x1={x(e.Q)} x2={x(e.Q)} y1={y(e.P)} y2={H - 28} className="dash" />
      <circle cx={x(e.Q)} cy={y(e.P)} r="7" className="eq" />
    </svg>
  );
}
function MarketMachine({ onSave, onExit }) {
  const [free, setFree] = useState({ dD: 0, dS: 0 });
  const [i, setI] = useState(-1);
  const [pred, setPred] = useState({});
  const [shown, setShown] = useState(false);
  const [score, setScore] = useState(0);
  const [st, finish] = useFinish(onSave);
  const ev = SD_EVENTS[i];
  const base = sdEq(0, 0);
  const now = ev && shown ? sdEq(ev.dD, ev.dS) : base;
  const reveal = () => { let s = 0; if (pred.p === ev.p) s++; if (pred.q === ev.q) s++; setScore(score + s); setShown(true); };
  if (st.done) return <Reward title="Market master! 📈" subtitle={`${score}/${SD_EVENTS.length * 2} predictions right`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  const opts = [["up", "⬆️ Up"], ["down", "⬇️ Down"], ["same", "≈ About the same"]];
  return (
    <ActShell icon={<TrendingUp size={22} strokeWidth={2.1} />} title="Market Price Machine 📈" subtitle="Move supply and demand — then predict what 6 news stories do to prices." onExit={onExit}>
      <Brief91 k="c3_machine" />
      {i === -1 ? (
        <>
          <HowTo>Play first: move the <b>demand</b> (blue) and <b>supply</b> (orange) curves. The green dot is the <b>equilibrium</b>: the price and quantity where buyers and sellers agree.</HowTo>
          <div className="g10-sdwrap"><SDGraph dD={free.dD} dS={free.dS} /><div><Ctl l="Demand" v={free.dD} set={(v) => setFree({ ...free, dD: v })} mn={-30} mx={30} stp={2} fmt={(v) => (v > 0 ? `+${v}` : v)} /><Ctl l="Supply" v={free.dS} set={(v) => setFree({ ...free, dS: v })} mn={-30} mx={30} stp={2} fmt={(v) => (v > 0 ? `+${v}` : v)} /><div className="g91-mini"><span>Price <b>{Math.round(sdEq(free.dD, free.dS).P)}</b></span><span>Quantity <b>{Math.round(sdEq(free.dD, free.dS).Q)}</b></span></div></div></div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => setI(0)}>Start the news rounds <ChevronRight size={18} /></button></div>
        </>
      ) : (
        <>
          <div className="p1-match-stats"><span>News <b>{i + 1}/{SD_EVENTS.length}</b></span><span>Points <b>{score}</b></span></div>
          <div className="g10-event-head"><em>{ev.e}</em><div><b>{ev.prod}</b><p>📰 {ev.t}</p></div></div>
          <div className="g10-sdwrap"><SDGraph dD={shown ? ev.dD : 0} dS={shown ? ev.dS : 0} ghost={shown ? { dD: 0, dS: 0 } : null} />
            <div>
              <p className="quiz-q">The PRICE will go…</p><Tri value={pred.p} onPick={(v) => setPred({ ...pred, p: v })} opts={opts} disabled={shown} />
              <p className="quiz-q">The QUANTITY sold will go…</p><Tri value={pred.q} onPick={(v) => setPred({ ...pred, q: v })} opts={opts} disabled={shown} />
              {shown && <div className="g91-mini"><span>Price <b>{Math.round(base.P)} → {Math.round(now.P)}</b></span><span>Quantity <b>{Math.round(base.Q)} → {Math.round(now.Q)}</b></span></div>}
            </div>
          </div>
          {shown && <div className={`p1-banner ${pred.p === ev.p && pred.q === ev.q ? "good" : "bad"}`}><span>{ev.dD ? `Demand ${ev.dD > 0 ? "increases (shift right)" : "decreases (shift left)"}. ` : ""}{ev.dS ? `Supply ${ev.dS > 0 ? "increases (shift right)" : "decreases (shift left)"}. ` : ""}When both curves move, one result can stay about the same.</span></div>}
          <div className="start-foot">{!shown ? <button className="s1-btn primary big" disabled={!pred.p || !pred.q} onClick={reveal}>Reveal the market</button> : i < SD_EVENTS.length - 1 ? <button className="s1-btn primary big" onClick={() => { setI(i + 1); setPred({}); setShown(false); }}>Next news <ChevronRight size={18} /></button> : <button className="s1-btn primary big" onClick={() => finish(14 + score, { score })}>Finish <span className="coin-tag"><Coins size={15} /> +{14 + score}</span></button>}</div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C3 · Market Audit + Trade 1 · Page 03 ---------- */
const AUDIT_Q = [
  { t: "What do you need for school or your hobbies right now?", good: true }, { t: "Do you want my paperclip? Yes or no.", good: false },
  { t: "What would you give for something you really need this week?", good: true }, { t: "Why is your object so bad?", good: false },
  { t: "Which object do you have that you don't use anymore?", good: true }, { t: "Can you give me your phone?", good: false },
];
function TradeOne({ resp, existing, onSave, onExit }) {
  const log = tradeLogOf(resp);
  const [qs, setQs] = useState(existing?.questions || []);
  const [who, setWho] = useState(existing?.target || "");
  const [t, setT] = useState(existing?.trade || {});
  const [st, finish] = useFinish(onSave);
  const goodQ = qs.filter((q) => AUDIT_Q.find((x) => x.t === q)?.good).length;
  const ok = qs.length === 3 && goodQ === 3 && countWords(who) >= 5 && tradeOk(t);
  if (st.done) return <Reward title="Trade 1 registered! 🔁" subtitle="Your value curve has its first step." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Market Audit + Trade 1 🔎 · Page 03" subtitle="Before trading, listen: who needs what? Then register your first real trade." onExit={onExit}>
      <Brief91 k="c3_trade1" />
      <FPBadge n={3} t="Market audit + Trade 1" e="🔎" />
      {log.sample && <div className="p1-banner bad"><span>First register your seed object (Class 2 · Our Seed Asset).</span></div>}
      <div className="start-block">
        <h3>1 · Choose 3 GOOD interview questions ({qs.length}/3)</h3>
        <p className="start-tip">Good questions discover needs. Bad questions are closed, rude or pushy.</p>
        <div className="g10-qpick">{AUDIT_Q.map((q) => { const on = qs.includes(q.t); const bad = on && !q.good; return <button key={q.t} type="button" className={`${on ? "on" : ""} ${bad ? "bad" : ""}`} onClick={() => setQs(on ? qs.filter((x) => x !== q.t) : qs.length < 3 ? [...qs, q.t] : qs)}>{bad ? "✗ " : on ? "✓ " : ""}{q.t}</button>; })}</div>
        {qs.length === 3 && goodQ < 3 && <p className="p1-hint">💡 One of your questions is closed or pushy. Change it.</p>}
        <label className="p3-lbl">Our target client (who needs our object, and why?)<input className="start-input" value={who} onChange={(x) => setWho(x.target.value)} placeholder="Students in the art club, because they…" /></label>
      </div>
      <TradeEntry n={1} before={log.steps[0]} val={t} set={setT} />
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(28, { questions: qs, target: who.trim(), trade: tradeData(t) })}>Save Page 03 <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}

/* ---------- C4 · One Umbrella, Four Prices (subasta de valor subjetivo) ---------- */
const AUCTION = [
  { e: "🤵", who: "Tourist going to a wedding", txt: "It's raining hard. His wedding suit cost a fortune and the church is 6 blocks away.", wtp: 60000 },
  { e: "🎒", who: "Student near home", txt: "She has two umbrellas at home and lives 2 blocks away.", wtp: 12000 },
  { e: "🧐", who: "Vintage collector", txt: "Your umbrella has a rare 1990s design. He collects them.", wtp: 45000 },
  { e: "🛒", who: "Street vendor", txt: "He wants to resell it to people at the bus station.", wtp: 20000 },
  { e: "☀️", who: "The same tourist… on a sunny day", txt: "No rain today. He is walking to the wedding in the sun.", wtp: 8000, twist: true },
];
function ValueAuction({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [price, setPrice] = useState(30000);
  const [res, setRes] = useState([]);
  const [shown, setShown] = useState(false);
  const [st, finish] = useFinish(onSave);
  const b = AUCTION[i];
  const sold = price <= b.wtp;
  const rev = res.reduce((a, r) => a + (r.sold ? r.price : 0), 0);
  const maxRev = AUCTION.reduce((a, x) => a + x.wtp, 0);
  const capture = Math.round((rev / maxRev) * 100);
  if (st.done) return <Reward title="Value detective! 💎" subtitle={`You captured ${capture}% of the total willingness to pay.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  const done = res.length === AUCTION.length;
  return (
    <ActShell icon={<Gavel size={22} strokeWidth={2.1} />} title="One Umbrella, Four Prices ☂️" subtitle="The same umbrella, five buyers. Read each situation and set a price." onExit={onExit}>
      <Brief91 k="c4_auction" />
      {!done ? (
        <>
          <div className="p1-match-stats"><span>Buyer <b>{i + 1}/{AUCTION.length}</b></span><span>Money earned <b>{cop(rev)}</b></span></div>
          <div className={`g10-buyer ${b.twist ? "twist" : ""}`}><em>{b.e}</em><div><b>{b.who}</b><p>{b.txt}</p>{b.twist && <small>🔄 TWIST: the situation changed!</small>}</div></div>
          <Ctl l="My price" v={price} set={setPrice} mn={2000} mx={80000} stp={1000} fmt={cop} />
          {!shown ? <div className="start-foot"><button className="s1-btn primary big" onClick={() => setShown(true)}>Offer the umbrella at {cop(price)}</button></div> : (
            <>
              <div className={`p1-banner ${sold ? "good" : "bad"}`}><span>{sold ? `SOLD at ${cop(price)}! ` : "No sale. "}His real maximum was <b>{cop(b.wtp)}</b>. {sold ? `You left ${cop(b.wtp - price)} on the table.` : "Your price was above his willingness to pay."}</span></div>
              <div className="start-foot"><button className="s1-btn primary big" onClick={() => { setRes([...res, { who: b.who, price, wtp: b.wtp, sold }]); setShown(false); setI(Math.min(i + 1, AUCTION.length - 1)); }}>{i < AUCTION.length - 1 ? "Next buyer" : "See my results"} <ChevronRight size={18} /></button></div>
            </>
          )}
        </>
      ) : (
        <>
          <MiniTable head={["Buyer", "My price", "Max (WTP)", "Result"]} rows={res.map((r) => [r.who, cop(r.price), cop(r.wtp), r.sold ? "✅ sold" : "✗ no sale"])} foot={["Total", cop(rev), cop(maxRev), `${capture}% captured`]} />
          <PickOne q="What does this game show about value?" options={["The same object has a different value for each person and situation.", "The umbrella has one correct price, and the buyers who don't pay it simply don't understand the market.", "Rain is expensive.", "Collectors are always rich."]} correct={0} explain="Subjective value: needs and circumstances change willingness to pay." />
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(14 + Math.round(capture / 8), { results: res, revenue: rev, capture })}>Finish <span className="coin-tag"><Coins size={15} /> +{14 + Math.round(capture / 8)}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C4 · Persuasion Frames Lab + Trade 2 ---------- */
const FRAME_R = [
  { q: "Your partner says: “I don't need a calculator.” Best answer?", options: ["“Imagine finishing your math homework in half the time.”", "“You are wrong, everybody needs a calculator, so you have to accept my offer now.”", "“OK, bye.”", "“It's blue.”"], correct: 0, explain: "'Imagine…' helps the other person see the benefit." },
  { q: "You want to propose a different deal. Best frame?", options: ["“What if I add my pen and you give me the cap?”", "“Give me the cap or I will tell everybody that you are a bad trader in this market.”", "“Whatever.”", "“Cap now.”"], correct: 0, explain: "'What if…' opens a new option where both win." },
  { q: "The partner hesitates. How do you show value?", options: ["“This could help you during the football season.”", "“My object is perfect and the best in the whole world, so don't think about it too much.”", "“Hurry up.”", "“I don't know.”"], correct: 0, explain: "'This could help you…' connects the object with THEIR need." },
  { q: "Which sentence creates a win-win?", options: ["“You get a speaker for your party, and I get a cap for my trip.”", "“I win this trade because my object is cheaper than yours and you didn't notice it.”", "“You lose.”", "“No deal.”"], correct: 0, explain: "Both sides get something they value more." },
  { q: "How do you close politely?", options: ["“Great! Shall we shake on it?”", "“Finally! I thought you would never accept, it took you forever to decide.”", "“Give it.”", "“Bye.”"], correct: 0, explain: "A polite close makes partners want to trade again." },
];
function TradeTwo({ resp, existing, onSave, onExit }) {
  const log = tradeLogOf(resp);
  const [stage, setStage] = useState(existing?.trade ? 1 : 0);
  const [first, setFirst] = useState(existing?.firstTry || 0);
  const [t, setT] = useState(existing?.trade || {});
  const [st, finish] = useFinish(onSave);
  const before = log.steps[log.steps.length - (existing?.trade ? 2 : 1)] || log.steps[0];
  const ok = tradeOk(t) && W_PERSUADE.re.test(t.sentence || "");
  if (st.done) return <Reward title="Trade 2 registered! 🤝" subtitle="Persuasion + real numbers = growing value." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Handshake size={22} strokeWidth={2.1} />} title="Persuasion Frames Lab + Trade 2 🤝" subtitle="Learn 5 frames that persuade without pressure. Then register trade 2." onExit={onExit}>
      <Brief91 k="c4_trade2" />
      {stage === 0 ? <RoundsRunner rounds={FRAME_R} doneLabel="Register Trade 2" onDone={(r) => { setFirst(r.firstTry); setStage(1); }} /> : (
        <>
          <div className="p1-frames"><b>Frames you can use:</b><span>What if… ?</span><span>Imagine…</span><span>This could help you…</span><span>If you…, you will…</span><span>Would you…?</span></div>
          <TradeEntry n={2} before={before} val={t} set={setT} />
          {tradeOk(t) && !W_PERSUADE.re.test(t.sentence || "") && <p className="p1-hint">💡 Your closing sentence must use a persuasion frame (What if… / Imagine… / This could…).</p>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(20 + first * 2, { firstTry: first, trade: tradeData(t) })}>Save Trade 2 <span className="coin-tag"><Coins size={15} /> +{20 + first * 2}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C5 · Currency Desk (comprar y vender dólares con noticias) ---------- */
const DESK_DAYS = [
  { trm: 4000, news: "📰 Calm day. Nothing special in the news." },
  { trm: 4080, news: "📰 Oil prices fall. Colombia receives fewer dollars from exports." },
  { trm: 3950, news: "📰 Big foreign investment arrives in Colombia." },
  { trm: 4150, news: "📰 Global panic: investors buy dollars everywhere." },
  { trm: 4300, news: "📰 The panic continues. Some people say: 'buy dollars NOW!'" },
  { trm: 4100, news: "📰 Markets calm down. The dollar falls again." },
];
const DESK_SPREAD = 100;
function CurrencyDesk({ onSave, onExit }) {
  const [d, setD] = useState(0);
  const [cash, setCash] = useState(2000000);
  const [usdH, setUsdH] = useState(0);
  const [spread, setSpread] = useState(0);
  const [log, setLog] = useState([]);
  const [end, setEnd] = useState(false);
  const [st, finish] = useFinish(onSave);
  const day = DESK_DAYS[d];
  const sell = day.trm + DESK_SPREAD, buy = day.trm - DESK_SPREAD;
  const act = (a) => {
    let c = cash, u = usdH, s = spread, l = `Day ${d + 1}: wait`;
    if (a === "buy") { const n = Math.min(200, Math.floor(c / sell)); if (n > 0) { c -= n * sell; u += n; s += n * DESK_SPREAD; l = `Day ${d + 1}: bought US$${n} at ${cop(sell)}`; } }
    if (a === "sell" && u > 0) { const n = Math.min(200, u); c += n * buy; u -= n; s += n * DESK_SPREAD; l = `Day ${d + 1}: sold US$${n} at ${cop(buy)}`; }
    setCash(c); setUsdH(u); setSpread(s); setLog([...log, l]);
    if (d === DESK_DAYS.length - 1) setEnd(true); else setD(d + 1);
  };
  const lastBuy = DESK_DAYS[DESK_DAYS.length - 1].trm - DESK_SPREAD;
  const final = cash + usdH * lastBuy;
  const pnl = final - 2000000;
  if (st.done) return <Reward title="Desk closed! 💵" subtitle={`Result: ${cop(pnl)} · spread paid ${cop(spread)}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Banknote size={22} strokeWidth={2.1} />} title="Currency Desk 💵" subtitle="You start with $2,000,000 COP. Six days, six news stories. Buy, sell or wait." onExit={onExit}>
      <Brief91 k="c5_desk" />
      <div className="g10-stats"><div><small>🇨🇴 Pesos</small><b>{cop(cash)}</b></div><div><small>🇺🇸 Dollars</small><b>US${usdH}</b></div><div><small>💸 Spread paid</small><b>{cop(spread)}</b></div><div><small>📅 Day</small><b>{Math.min(d + 1, 6)}/6</b></div></div>
      <ChartCard title="TRM during the week (illustrative)"><LineChart labels={DESK_DAYS.map((_, k) => `D${k + 1}`)} series={[{ name: "TRM", values: DESK_DAYS.map((x, k) => (k <= d ? x.trm : null)), color: "#f5b23e" }]} yMin={3800} yMax={4400} /></ChartCard>
      {!end ? (
        <div className="start-block g10-event">
          <p className="quiz-q">{day.news}</p>
          <div className="g10-board3"><div><small>TRM</small><b>{cop(day.trm)}</b></div><div><small>WE SELL US$ AT</small><b>{cop(sell)}</b></div><div><small>WE BUY US$ AT</small><b>{cop(buy)}</b></div></div>
          <div className="p3-card-actions"><button className="s1-btn primary" disabled={cash < sell} onClick={() => act("buy")}>Buy up to US$200</button><button className="s1-btn primary" disabled={usdH <= 0} onClick={() => act("sell")}>Sell up to US$200</button><button className="s1-btn ghost" onClick={() => act("wait")}>Wait</button></div>
        </div>
      ) : (
        <>
          <MiniTable head={["My moves"]} rows={log.map((l) => [l])} />
          <div className={`p1-banner ${pnl >= 0 ? "good" : "bad"}`}><span>Final value: <b>{cop(final)}</b> ({cop(pnl)}). You paid <b>{cop(spread)}</b> in spreads. Every buy-and-sell costs $200 per dollar — trading on news is risky!</span></div>
          <PickOne q="Two houses: A sells at $4,350 'no commission'; B sells at $4,120 + $10,000 fee. You need US$500. Which is cheaper?" options={["B: $2,070,000 vs. A: $2,175,000.", "A, because 'no commission' always means you pay less money in total at the end.", "They are the same.", "Neither."]} correct={0} explain="A: 500 × 4,350 = 2,175,000. B: 500 × 4,120 + 10,000 = 2,070,000." />
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(26, { final, pnl, spread, log })}>Close the desk <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C5 · Value Growth Calculator · Page 04 ---------- */
function ValueGrowth({ resp, existing, onSave, onExit }) {
  const L = tradeLogOf(resp);
  const steps = L.sample ? SAMPLE_LOG.slice(0, 3) : L.steps;
  const last = steps[steps.length - 1], first = steps[0];
  const rounds = steps.slice(1).map((s, k) => ({ tag: `Trade ${k + 1}`, q: `${steps[k].e} ${steps[k].item} (${cop(steps[k].value)}) → ${s.e} ${s.item} (${cop(s.value)}). Growth in %?`, answer: growth(steps[k].value, s.value), unit: "%", tol: 1, hint: "(new − old) ÷ old × 100", explain: `(${s.value} − ${steps[k].value}) ÷ ${steps[k].value} × 100 = ${growth(steps[k].value, s.value)}%.` }));
  const [stage, setStage] = useState(existing?.text ? 1 : 0);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const G = [W_COMPARE, W_NUMBERS(2)];
  if (st.done) return <Reward title="Growth calculated! 📊" subtitle={`Total growth: ${pctTxt(growth(first.value, last.value), 0)}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Percent size={22} strokeWidth={2.1} />} title="Value Growth Calculator 📊 · Page 04" subtitle="How much value has your team created so far?" onExit={onExit}>
      <Brief91 k="c5_growth" />
      <FPBadge n={4} t="Our trades so far" e="📊" />
      {L.sample && <div className="p1-banner bad"><span>You don't have trades yet, so you practice with a sample log. Register your seed and Trade 1 to use YOUR numbers.</span></div>}
      <div className="g10-tl">{steps.map((s, k) => <div key={k}><small>{k === 0 ? "START" : `TRADE ${k}`}</small><em>{s.e}</em><b>{s.item}</b><span>{cop(s.value)}</span>{k > 0 && <i className={s.value >= steps[k - 1].value ? "pos" : "neg"}>{pctTxt(growth(steps[k - 1].value, s.value), 0)}</i>}</div>)}</div>
      {stage === 0 ? <RoundsRunner rounds={rounds.length ? rounds : [{ q: "No trades yet: a $500 clip becomes a $6,000 notebook. Growth in %?", answer: 1100, unit: "%", tol: 1, explain: "(6,000 − 500) ÷ 500 × 100 = 1,100%." }]} doneLabel="Write Page 04" onDone={() => setStage(1)} /> : (
        <>
          <div className="g91-mini"><span>Total growth <b>{pctTxt(growth(first.value, last.value), 0)}</b></span><span>From <b>{cop(first.value)}</b> to <b>{cop(last.value)}</b></span></div>
          <div className="start-block"><h3>✍️ Page 04 · Our trades so far</h3><Starters items={["Our … is more valuable than…", "The best trade was… because…", "Our value grew …%"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={25} max={75} goals={G} placeholder="Our notebook is more valuable than our clip…" /></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(text, 25, 75, G)} onClick={() => finish(26, { growth: growth(first.value, last.value), steps: steps.length, text, sample: L.sample })}>Save Page 04 <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C6 · Logo Detective (marcas ficticias) ---------- */
const LOGO_R = [
  { tag: "🦉 OwlBank", q: "A dark-blue owl with a simple, solid font. What does it communicate?", options: ["Trust, wisdom and security.", "Fun, cheap fast food for teenagers who want to eat something quick after school.", "Danger.", "Organic farming."], correct: 0, explain: "Blue + owl (wisdom) + solid font = a trustworthy bank." },
  { tag: "🔥 BlazeBurger", q: "Red and yellow flames, a round, bold font. Who is the target?", options: ["Hungry young people who want fast food.", "Rich investors looking for a luxury financial advisor to manage their savings.", "Doctors.", "Babies."], correct: 0, explain: "Red + yellow = appetite and energy." },
  { tag: "🍃 Verdea", q: "A green leaf and a thin, light font. What product fits best?", options: ["Natural cosmetics.", "A heavy-metal music festival with loud guitars and black t-shirts for the fans.", "Car tires.", "A casino."], correct: 0, explain: "Green + leaf = natural, healthy, eco." },
  { tag: "👑 NOIR & Co.", q: "Black and gold, a classic serif font. Positioning?", options: ["Luxury and exclusivity.", "Cheap products for big families who want to save money in the supermarket every month.", "Kids' toys.", "Fast food."], correct: 0, explain: "Black + gold + serif = elegance and status." },
  { tag: "🧸 Bubbly", q: "Orange and light blue, rounded letters, a smiling cloud. Target?", options: ["Children and parents.", "Serious lawyers who need a formal and powerful image for a big law office downtown.", "Banks.", "Gyms."], correct: 0, explain: "Rounded shapes + soft colors = friendly and playful." },
  { tag: "⚡ Voltio", q: "An electric-purple bolt and a futuristic font. What does it say?", options: ["Innovation and energy.", "Tradition, calm and an old family business that never changes its products.", "Farming.", "Cheap prices."], correct: 0, explain: "A bolt + futuristic font = tech, speed, innovation." },
];

/* ---------- C6 · Brand Empire · Page 05 ---------- */
const BR_SYMBOLS = [{ s: "🦉", p: { trust: 2, wise: 2 } }, { s: "🚀", p: { energy: 2, innov: 2 } }, { s: "🍃", p: { nature: 3 } }, { s: "👑", p: { luxury: 3 } }, { s: "⚡", p: { energy: 2, innov: 1 } }, { s: "🧸", p: { fun: 3 } }, { s: "🔑", p: { trust: 2 } }, { s: "🌎", p: { nature: 1, trust: 1 } }, { s: "🎯", p: { energy: 1, trust: 1 } }];
const BR_COLORS = [{ k: "blue", c: ["#1f4e9c", "#7fb2ff"], l: "Blue", p: { trust: 3 } }, { k: "red", c: ["#d93a2b", "#ffcf3f"], l: "Red + yellow", p: { energy: 3, fun: 1 } }, { k: "green", c: ["#1f8a4c", "#b7e4a7"], l: "Green", p: { nature: 3 } }, { k: "black", c: ["#141414", "#c9a24a"], l: "Black + gold", p: { luxury: 3 } }, { k: "orange", c: ["#ff8a1f", "#62c3ff"], l: "Orange + sky", p: { fun: 2, energy: 1 } }, { k: "purple", c: ["#6a3fc8", "#f0a6ff"], l: "Purple", p: { innov: 2, luxury: 1 } }];
const BR_FONTS = [{ k: "serif", l: "Classic serif", f: "Georgia, serif", p: { luxury: 1, trust: 1 } }, { k: "round", l: "Rounded & bold", f: "'Trebuchet MS', sans-serif", p: { fun: 2 } }, { k: "tech", l: "Futuristic", f: "'Courier New', monospace", p: { innov: 2 } }];
const BR_DIMS = [["trust", "Trust"], ["energy", "Energy"], ["luxury", "Luxury"], ["nature", "Nature"], ["fun", "Fun"], ["innov", "Innovation"]];
const BR_CLIENTS = [{ e: "👵", who: "Grandma Rosa, wants a safe and simple product", likes: ["trust", "nature"] }, { e: "🧑‍🎤", who: "Sam, 17, wants something cool and new", likes: ["energy", "innov", "fun"] }, { e: "💼", who: "Carla, executive, wants quality and status", likes: ["luxury", "trust"] }];
function BrandEmpire({ resp, existing, onSave, onExit }) {
  const e = existing || {};
  const [name, setName] = useState(e.name || "");
  const [sym, setSym] = useState(e.symbol || "");
  const [col, setCol] = useState(e.color || "");
  const [font, setFont] = useState(e.font || "");
  const [target, setTarget] = useState(e.target ?? null);
  const [diff, setDiff] = useState(e.diff || null);
  const [mission, setMission] = useState(e.mission || "");
  const [vision, setVision] = useState(e.vision || "");
  const [st, finish] = useFinish(onSave);
  const pers = { trust: 0, energy: 0, luxury: 0, nature: 0, fun: 0, innov: 0 };
  [BR_SYMBOLS.find((x) => x.s === sym)?.p, BR_COLORS.find((x) => x.k === col)?.p, BR_FONTS.find((x) => x.k === font)?.p].forEach((p) => Object.entries(p || {}).forEach(([k, v]) => { pers[k] += v; }));
  const C = BR_COLORS.find((x) => x.k === col); const F = BR_FONTS.find((x) => x.k === font);
  const fit = target != null ? Math.min(100, Math.round((BR_CLIENTS[target].likes.reduce((a, k) => a + pers[k], 0) / 6) * 100)) : 0;
  const ok = name.trim() && sym && col && font && target != null && diff && countWords(mission) >= 8 && countWords(vision) >= 8;
  const seed = resp?.c2_seed?.seed;
  if (st.done) return <Reward title="Brand created! 🎨" subtitle={`${sym} ${name} · fit with your client ${fit}%`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Palette size={22} strokeWidth={2.1} />} title="Brand Empire 🎨 · Page 05" subtitle="Build your team's brand: symbol, color, font, client, mission and vision." onExit={onExit}>
      <Brief91 k="c6_brand" />
      <FPBadge n={5} t="Our brand" e="🎨" />
      <div className="g10-brandgrid">
        <div>
          <div className="start-block">
            <label className="p3-lbl">Brand name {seed ? `(for your ${seed.item} trading team)` : ""}<input className="start-input" maxLength={18} value={name} onChange={(x) => setName(x.target.value)} placeholder="ClipUp" /></label>
            <span className="terms-label">Symbol:</span><div className="g10-emo">{BR_SYMBOLS.map((x) => <button key={x.s} type="button" className={sym === x.s ? "on" : ""} onClick={() => setSym(x.s)}>{x.s}</button>)}</div>
            <span className="terms-label">Colors:</span><div className="g10-swatch">{BR_COLORS.map((x) => <button key={x.k} type="button" className={col === x.k ? "on" : ""} onClick={() => setCol(x.k)}><i style={{ background: x.c[0] }} /><i style={{ background: x.c[1] }} /><span>{x.l}</span></button>)}</div>
            <span className="terms-label">Font:</span><div className="p1-starters">{BR_FONTS.map((x) => <button key={x.k} type="button" className={`p1-chip ${font === x.k ? "on" : ""}`} style={{ fontFamily: x.f }} onClick={() => setFont(x.k)}>{x.l}</button>)}</div>
          </div>
          <div className="start-block">
            <h3>🎯 Who is your client?</h3>
            <div className="g10-clients">{BR_CLIENTS.map((c, k) => <button key={c.who} type="button" className={target === k ? "on" : ""} onClick={() => setTarget(k)}><em>{c.e}</em><span>{c.who}</span></button>)}</div>
            {target != null && <Gauge91 label="Brand–client fit" value={fit} max={100} target={60} targetLabel="good fit" good={fit >= 60} />}
            {target != null && fit < 60 && <p className="p1-hint">💡 Your personality doesn't match this client yet. Change the color, symbol or font.</p>}
          </div>
          <div className="start-block">
            <h3>⚔️ Twist: a competitor copies your idea and sells cheaper!</h3>
            <div className="quiz-options">{[["story", "Tell our real trading story — nobody can copy it."], ["price", "Lower our price until we lose money."], ["quality", "Add a service: free advice for every trade."], ["copy", "Copy their logo to confuse people."]].map(([k, t]) => <button key={k} type="button" className={`quiz-opt ${diff === k ? (k === "story" || k === "quality" ? "correct" : "wrong") : ""}`} onClick={() => setDiff(k)}><span className="opt-text">{t}</span></button>)}</div>
            {diff && <p className={`g91-note ${diff === "story" || diff === "quality" ? "pos" : "neg"}`}>{diff === "story" || diff === "quality" ? "✅ Differentiation without destroying your profit." : "❌ That damages your brand or your profit. Choose another way."}</p>}
          </div>
        </div>
        <div>
          <div className="g10-logo" id="g10-logo" style={{ "--c0": C?.c[0] || "#ccd", "--c1": C?.c[1] || "#eef" }}><em>{sym || "?"}</em><b style={{ fontFamily: F?.f }}>{name || "Brand"}</b></div>
          <div className="g10-pers">{BR_DIMS.map(([k, l]) => <Bar91 key={k} label={l} value={Math.min(100, pers[k] * 20)} color={C?.c[0] || "#16b074"} suffix="" />)}</div>
          <button type="button" className="s1-btn ghost" onClick={() => downloadPNG("g10-logo", `${name || "brand"}_logo.png`)}><Download size={15} /> Save logo</button>
        </div>
      </div>
      <div className="start-block"><h3>✍️ Page 05 · Mission and vision</h3><label className="p3-lbl">Mission (what we do today and for whom):<input className="start-input" value={mission} onChange={(x) => setMission(x.target.value)} placeholder="We help… to… by…" /></label><label className="p3-lbl">Vision (what we want to be in the future):<input className="start-input" value={vision} onChange={(x) => setVision(x.target.value)} placeholder="In five years, we will be…" /></label></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok || fit < 60 || !(diff === "story" || diff === "quality")} onClick={() => finish(30, { name: name.trim(), symbol: sym, color: col, font, target, fit, diff, mission: mission.trim(), vision: vision.trim(), personality: pers })}>Save Page 05 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- C7 · Tagline Workshop ---------- */
const TAG_R = [
  { tag: "Feature → benefit", q: "Feature: “The bottle keeps water cold for 24 hours.” Benefit?", options: ["“Fresh water all day, wherever you go.”", "“It is made with double-wall stainless steel and a special vacuum layer inside.”", "“24 hours.”", "“Metal.”"], correct: 0, explain: "A benefit tells how YOUR life gets better." },
  { tag: "Feature → benefit", q: "Feature: “The app compares 50 bank rates.” Benefit?", options: ["“Find where your money grows more, in one minute.”", "“It has a database with fifty different banks updated by our programmers every night.”", "“50 banks.”", "“An app.”"], correct: 0, explain: "Benefit = time saved + more money." },
  { tag: "Good motto", q: "Which motto is short, positive and memorable?", options: ["“Trade up. Dream bigger.”", "“We are a team of students who exchange objects in order to create more value.”", "“Objects.”", "“Buy now or never.”"], correct: 0, explain: "Short (2–6 words), positive, connected to the benefit." },
  { tag: "Good motto", q: "A bike-repair startup. Best tagline?", options: ["“Back on the road today.”", "“We repair bicycles with professional tools and certified mechanics in our shop.”", "“Bikes.”", "“Cheap!!!”"], correct: 0, explain: "It promises the benefit: you ride again quickly." },
];
function TaglineWorkshop({ resp, existing, onSave, onExit }) {
  const [stage, setStage] = useState(existing?.motto ? 1 : 0);
  const [first, setFirst] = useState(0);
  const [feat, setFeat] = useState(existing?.feature || "");
  const [ben, setBen] = useState(existing?.benefit || "");
  const [motto, setMotto] = useState(existing?.motto || "");
  const [st, finish] = useFinish(onSave);
  const brand = resp?.c6_brand;
  const mw = countWords(motto);
  const ok = countWords(feat) >= 4 && countWords(ben) >= 5 && mw >= 2 && mw <= 7;
  if (st.done) return <Reward title="Motto ready! 🏷️" subtitle={`“${motto}”`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Megaphone size={22} strokeWidth={2.1} />} title="Tagline Workshop 🏷️" subtitle="From feature to benefit to motto." onExit={onExit}>
      <Brief91 k="c7_tagline" />
      {stage === 0 ? <RoundsRunner rounds={TAG_R} doneLabel="Create our motto" onDone={(r) => { setFirst(r.firstTry); setStage(1); }} /> : (
        <>
          <div className="g10-funnel"><div><small>1 · FEATURE</small><input className="start-input" value={feat} onChange={(x) => setFeat(x.target.value)} placeholder="What our product/service IS or HAS" /></div><i>▼</i><div><small>2 · BENEFIT</small><input className="start-input" value={ben} onChange={(x) => setBen(x.target.value)} placeholder="How the client's life gets better" /></div><i>▼</i><div><small>3 · MOTTO (2–7 words)</small><input className="start-input" value={motto} onChange={(x) => setMotto(x.target.value)} placeholder="Trade up. Dream bigger." /></div></div>
          {motto && <div className="g10-logo small" style={{ "--c0": BR_COLORS.find((x) => x.k === brand?.color)?.c[0] || "#16b074", "--c1": BR_COLORS.find((x) => x.k === brand?.color)?.c[1] || "#cfe" }}><em>{brand?.symbol || "✨"}</em><b>{brand?.name || "Our brand"}</b><small>{motto}</small></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(20 + first * 2, { feature: feat.trim(), benefit: ben.trim(), motto: motto.trim(), firstTry: first })}>Save our motto <span className="coin-tag"><Coins size={15} /> +{20 + first * 2}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C7 · CEO Under Pressure ---------- */
const CEO_STATS = [{ k: "lead", l: "Leadership", e: "🧭", start: 50 }, { k: "innov", l: "Innovation", e: "💡", start: 50 }, { k: "profit", l: "Profit", e: "💰", start: 50 }, { k: "social", l: "Social impact", e: "🤝", start: 50 }, { k: "rep", l: "Reputation", e: "⭐", start: 50 }];
const CEO_R = [
  { e: "📉", title: "We are losing customers", text: "Sales fell 20% in two months. A new competitor is cheaper.", options: [{ t: "Talk to 20 customers and find out what they need", fx: { lead: 10, innov: 10, rep: 5 }, good: true, note: "Like Rappi's founders: listen, test and adapt." }, { t: "Cut the price 40% immediately", fx: { profit: -20, rep: -5 }, note: "A price war can destroy your profit." }, { t: "Blame the sales team", fx: { lead: -15, rep: -10 }, note: "Blaming kills trust." }] },
  { e: "😠", title: "Conflict in the team", text: "Two employees fight about who did the work on a big project.", options: [{ t: "Meet both, listen and recognize each one's part", fx: { lead: 15, rep: 5 }, good: true, note: "Fair recognition builds a team." }, { t: "Ignore it — they are adults", fx: { lead: -10, profit: -5 }, note: "Problems grow when leaders hide." }, { t: "Fire both", fx: { lead: -10, profit: -10, rep: -10 }, note: "Too extreme — you lose talent." }] },
  { e: "🏭", title: "Production problem", text: "The factory can't deliver a huge order on time.", options: [{ t: "Tell the client the truth and offer a new date + a discount", fx: { rep: 10, profit: -5, lead: 5 }, good: true, note: "Honesty keeps clients for the long term." }, { t: "Send the products with defects to arrive on time", fx: { rep: -20, profit: 5 }, note: "Short-term profit, long-term damage." }, { t: "Say nothing and hope for the best", fx: { rep: -15, lead: -10 }, note: "Silence makes it worse." }] },
  { e: "🌍", title: "International competition", text: "A giant global company enters your market.", options: [{ t: "Specialize: a niche product with a great story", fx: { innov: 15, profit: 5 }, good: true, note: "Like Sara Blakely: do one thing better than anyone." }, { t: "Copy everything they do", fx: { innov: -10, rep: -5 }, note: "Copying never beats the original." }, { t: "Close the company", fx: { profit: -20, social: -10 }, note: "Too fast — there are options." }] },
  { e: "🌱", title: "Social and environmental crisis", text: "A report says your packaging produces lots of plastic waste.", options: [{ t: "Admit it and switch to recyclable packaging with a plan", fx: { social: 15, rep: 10, profit: -5 }, good: true, note: "Responsibility builds long-term value." }, { t: "Paint the logo green and say 'eco'", fx: { rep: -15, social: -10 }, note: "That's greenwashing — people find out." }, { t: "Delete the report from social media", fx: { rep: -20 }, note: "Hiding information destroys trust." }] },
];
function CEOPressure({ onSave, onExit }) {
  const [res, setRes] = useState(null);
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="CEO of the year! 🧭" subtitle={`${res?.good}/5 smart decisions`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  const avg = res ? Math.round(Object.values(res.values).reduce((a, v) => a + v, 0) / 5) : 0;
  return (
    <ActShell icon={<Briefcase size={22} strokeWidth={2.1} />} title="CEO Under Pressure 🧭" subtitle="5 crises · 5 indicators. Every decision moves your company." onExit={onExit}>
      <Brief91 k="c7_ceo" />
      {!res ? <ImpactRounds stats={CEO_STATS} rounds={CEO_R} onDone={setRes} /> : (
        <>
          <div className="g10-stats">{CEO_STATS.map((s) => <div key={s.k}><small>{s.e} {s.l}</small><b>{res.values[s.k]}</b></div>)}</div>
          <div className={`p1-banner ${avg >= 55 ? "good" : "bad"}`}><span>Company health: <b>{avg}/100</b>. {avg >= 55 ? "Your leadership made the company stronger." : "Some decisions hurt the company. Replay to compare."}</span></div>
          <PickOne q="Which leadership trait helped most in these crises?" options={["Listening and telling the truth.", "Always deciding alone and quickly, without asking anybody in the company for information.", "Being lucky.", "Copying competitors."]} correct={0} explain="Good leaders listen, are honest and adapt." />
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(18 + res.good * 2, { values: res.values, good: res.good, log: res.log })}>Finish <span className="coin-tag"><Coins size={15} /> +{18 + res.good * 2}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C7 · Leader Card + Trade 3 · Page 06 ---------- */
const LEADERS10 = [{ k: "walker", e: "💇🏾‍♀️", n: "Madam C.J. Walker", trait: "Resilience" }, { k: "blakely", e: "🧦", n: "Sara Blakely", trait: "Persistence" }, { k: "rappi", e: "🛵", n: "Rappi's founders", trait: "Adaptability" }];
function LeaderCard({ resp, existing, onSave, onExit }) {
  const log = tradeLogOf(resp);
  const [lead, setLead] = useState(existing?.leader || "");
  const [text, setText] = useState(existing?.text || "");
  const [t, setT] = useState(existing?.trade || {});
  const [st, finish] = useFinish(onSave);
  const G = [W_PAST, W_REASON, W_FUTURE];
  const before = log.steps[log.steps.length - (existing?.trade ? 2 : 1)] || log.steps[0];
  const ok = lead && goalsOk(text, 35, 90, G) && tradeOk(t);
  const L = LEADERS10.find((x) => x.k === lead);
  if (st.done) return <Reward title="Leader card + last trade! 👑" subtitle="Page 06 saved. Ready for Shark Tank Day." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Crown size={22} strokeWidth={2.1} />} title="Leader Card + Trade 3 👑 · Page 06" subtitle="Choose a leader, explain them in 1 minute and register your last trade." onExit={onExit}>
      <Brief91 k="c7_card" />
      <FPBadge n={6} t="Our motto + leader lesson" e="👑" />
      <div className="g10-clients">{LEADERS10.map((x) => <button key={x.k} type="button" className={lead === x.k ? "on" : ""} onClick={() => setLead(x.k)}><em>{x.e}</em><span><b>{x.n}</b><br />{x.trait}</span></button>)}</div>
      <div className="start-block"><h3>🎤 My 1-minute leader talk</h3><p className="start-tip">What did {L?.n || "the leader"} do (past simple)? Which trait do you want for your Future Me, and why?</p><Starters items={["First, she/he…", "Then…", "Finally…", "I will be more… because…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={35} max={90} goals={G} placeholder="Sara Blakely started with… Then she… I will be more persistent because…" /></div>
      <TradeEntry n={3} before={before} val={t} set={setT} />
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30, { leader: lead, text, trade: tradeData(t) })}>Save Page 06 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- C8 · Trade Audit ---------- */
function TradeAudit({ resp, onSave, onExit }) {
  const L = tradeLogOf(resp);
  const steps = L.sample ? SAMPLE_LOG : L.steps;
  const first = steps[0], last = steps[steps.length - 1];
  const gs = steps.slice(1).map((s, k) => ({ k: k + 1, g: growth(steps[k].value, s.value), s }));
  const best = gs.slice().sort((a, b) => b.g - a.g)[0];
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Audit complete! 🔍" subtitle={`Total growth ${pctTxt(growth(first.value, last.value), 0)}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<BarChart3 size={22} strokeWidth={2.1} />} title="Trade Audit 🔍" subtitle="Your whole Red Paperclip Challenge in one chart." onExit={onExit}>
      <Brief91 k="c8_audit" />
      {L.sample && <div className="p1-banner bad"><span>Sample data: register your seed and trades to audit YOUR challenge.</span></div>}
      <ChartCard title="📈 Our value curve (COP)"><LineChart labels={steps.map((s, k) => (k === 0 ? "Start" : `T${k}`))} series={[{ name: "Value", values: steps.map((s) => s.value), color: "#16b074" }]} highlight={best?.k} /></ChartCard>
      <div className="g10-tl">{steps.map((s, k) => <div key={k}><small>{k === 0 ? "START" : `TRADE ${k}`}</small><em>{s.e}</em><b>{s.item}</b><span>{cop(s.value)}</span>{k > 0 && <i className={s.value >= steps[k - 1].value ? "pos" : "neg"}>{pctTxt(growth(steps[k - 1].value, s.value), 0)}</i>}</div>)}</div>
      <div className="g91-mini"><span>Total growth <b>{pctTxt(growth(first.value, last.value), 0)}</b></span>{best && <span className="pos">🏆 Best trade <b>T{best.k} · {pctTxt(best.g, 0)}</b></span>}<span>Trades <b>{steps.length - 1}</b></span></div>
      <PickOne q="Which explanation is the most professional for an investor?" options={[`“Our value grew ${Math.round(growth(first.value, last.value))}% in ${steps.length - 1} trades; our best trade solved a real need.”`, "“We traded a lot of things with many people and it was really fun, so we think it went well for our team.”", "“We were lucky.”", "“Numbers don't matter.”"]} correct={0} explain="Investors want numbers + the reason behind them." />
      <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(22, { growth: growth(first.value, last.value), best: best ? { k: best.k, g: best.g } : null, trades: steps.length - 1, sample: L.sample })}>Save my audit <span className="coin-tag"><Coins size={15} /> +22</span></button></div>
    </ActShell>
  );
}

/* ---------- C8 · Shark Tank Pitch (proyecto grande) ---------- */
const RUB_SHARK = [["story", "Clear trade story", "from step 0 to the end"], ["nums", "Numbers & growth %", "values, % per trade, total"], ["econ", "Economics", "supply, demand, perceived value"], ["brand", "Brand", "logo, motto, mission"], ["eng", "Clear, persuasive English", "frames, eye contact"]];
function SharkPitch({ resp, studentName, userData, API_URL, existing, onSave, onExit }) {
  const r = resp || {};
  const L = tradeLogOf(r);
  const steps = L.sample ? [] : L.steps;
  const first = steps[0], last = steps[steps.length - 1];
  const total = first && last ? growth(first.value, last.value) : 0;
  const br = r.c6_brand, mo = r.c7_tagline, ld = LEADERS10.find((x) => x.k === r.c7_card?.leader);
  const name = br?.name || "Our team";
  const ready = steps.length >= 3 && !!br;
  const chapters = (v) => [
    { e: "🌱", t: "Our seed", s: first ? [`We started with ${first.e} ${first.item.toLowerCase()}, worth about ${cop(first.value)}.`, r.c2_seed?.client ? `Our first idea of a client: ${dot(r.c2_seed.client)}` : ""].filter(Boolean) : [] },
    { e: "🔁", t: "Our trades", s: steps.slice(1).map((s, k) => `Trade ${k + 1}: we got ${s.e} ${s.item.toLowerCase()} (${cop(s.value)}, ${pctTxt(growth(steps[k].value, s.value), 0)}) from a ${String(s.partner || "partner").toLowerCase()}. ${s.need ? `It solved this need: ${lowFirst(dot(s.need))}` : ""}`) },
    { e: "📈", t: "The economics", s: steps.length > 1 ? [`In total our value grew ${pctTxt(total, 0)}: from ${cop(first.value)} to ${cop(last.value)}.`, "Each partner valued our object more than what they gave — that is subjective value.", r.c3_trade1?.target ? `We looked for people with a real need: ${lowFirst(dot(r.c3_trade1.target))}` : ""].filter(Boolean) : [] },
    { e: "🎨", t: "Our brand", s: br ? [`We are ${br.symbol} ${br.name}${mo?.motto ? `: “${mo.motto}”` : ""}.`, `Our mission: ${dot(br.mission)}`, `Our vision: ${dot(br.vision)}`] : [] },
    { e: "👑", t: "Our leader lesson", s: ld ? [`Like ${ld.n}, we learned the value of ${ld.trait.toLowerCase()}.`] : [] },
    { e: "🦈", t: "Our ask", s: v.ask ? [`Sharks, ${dot(v.ask)}`] : [] },
  ];
  const publish = async (v) => { try { const d = await fairPost(API_URL, userData, "10-ST", "fair_publish", { company: { name, logo: br?.symbol || "📎", lines: [`From ${first?.item || "a clip"} to ${last?.item || "…"}: ${pctTxt(total, 0)}`, mo?.motto ? `“${mo.motto}”` : "", v.ask || ""].filter(Boolean), nums: [{ l: "Trades", v: steps.length - 1 }, { l: "Growth", v: pctTxt(total, 0) }] } }); return d.status !== "error"; } catch (e) { return false; } };
  return (
    <PitchStudio icon={<Mic size={22} strokeWidth={2.1} />} title="Shark Tank Pitch 🦈 · THE BIG PROJECT" subtitle="Your Red Paperclip Challenge as a pitch: the story, the numbers, the brand — and your ask." brief={<Brief91 k="c8_pitch" />}
      how={<>The script builds itself from your Trade Log, your brand and your motto. Add your <b>ask</b> and your closing line, press <b>Present</b> (2–3 minutes), publish it for the investment round and give your tablet to a classmate-shark to rate you.</>}
      id="g10-shark" ready={ready} readyMsg="You need your seed + at least 2 registered trades and your brand (Page 05) to pitch."
      cover={{ tag: "SHARK TANK DAY · GRADE 10 · INSTITUTO CREAR", title: `${br?.symbol || "📎"} ${name}: from ${first?.item || "a paperclip"} to ${last?.item || "…"}`, sub: `Team pitch by ${studentName}`, say: `Hello sharks! We are ${name}, and we turned ${first ? `a ${first.item.toLowerCase()} worth ${cop(first.value)}` : "a simple object"} into ${last ? `${last.item.toLowerCase()} worth ${cop(last.value)}` : "something more valuable"} — without money.`, end: (v) => `${v.close ? dot(capF(v.close)) : "…"} Thank you, sharks!` }}
      kpis={[{ l: "🌱 Start", v: first ? cop(first.value) : "—" }, { l: "🏁 Now", v: last ? cop(last.value) : "—" }, { l: "📈 Growth", v: pctTxt(total, 0), c: total >= 0 ? "pos" : "neg" }, { l: "🔁 Trades", v: Math.max(0, steps.length - 1) }]}
      chapters={chapters} inputs={[{ k: "ask", l: "🦈 Our ask (what we want from the sharks and why):", ph: "we ask you for 30 coins for 10% of our next trade, because…", min: 8 }, { k: "close", l: "💡 Our closing line:", ph: "Value is created when you solve someone's need…", min: 6 }]}
      rubric={RUB_SHARK} existing={existing} onPublish={publish} publishLabel="Publish for the investment round"
      cert={{ e: "💎", title: "Value Creator", name: studentName, text: `turned ${first?.item || "a simple object"} into ${last?.item || "something more valuable"} (${pctTxt(total, 0)}) through negotiation, subjective value and a brand of their own.` }}
      extraData={{ growth: total, trades: Math.max(0, steps.length - 1), brand: name }} coins={60} onSave={onSave} onExit={onExit} />
  );
}

/* ---------- C8 · Boss P1 + Future Me Card: Value Creator ---------- */
function BossP1({ resp, studentName, onSave, onExit }) {
  const L = tradeLogOf(resp);
  const s = L.steps; const g = s.length > 1 ? growth(s[0].value, s[s.length - 1].value) : null;
  const card = <FMCardView id="g10-card1" card={FM_CARDS[0]} name={studentName} lines={[resp?.c6_brand ? `${resp.c6_brand.symbol} ${resp.c6_brand.name}${resp.c7_tagline?.motto ? ` · “${resp.c7_tagline.motto}”` : ""}` : "", g != null ? `Red Paperclip growth: ${pctTxt(g, 0)}` : "", resp?.c2_market ? `CREAR Market: ${resp.c2_market.trades} trades` : "", resp?.c1_million ? `Last Million: ${cop(resp.c1_million.real)} real value` : ""]} />;
  return <BossExam icon={<Swords size={22} strokeWidth={2.1} />} title="Boss P1 · Value Creator ⚔️" subtitle="5 missions + 10 questions. Pass with 70% to unlock your Future Me Card." brief={<Brief91 k="c8_boss" />} missions={BOSS1_MISSIONS} questions={BOSS1_Q} tips={BOSS1_TIPS} cardNode={card} onSave={onSave} onExit={onExit} />;
}

/* =====================================================================
   GUÍA DE CADA ACTIVIDAD · 10° PERIODO 1
   ===================================================================== */
const TPAGE = (n, words, needs, coins) => [[`Text: ${words} words with ${needs}`, "required"], [`Future Page ${n} saved`, `+${coins} 🪙`]];
const GUIDE = {
  c1_radar: { goal: "Take a photo of how you think about money TODAY. You will compare it with your final radar in Period 4.", steps: ["Read each situation.", "Choose what you would REALLY do (not the 'perfect' answer).", "See your radar with 5 pillars."], win: [["Answering all 10 situations", "+25 🪙"], ["There are no wrong answers — be honest", ""]] },
  c1_video: B_VIDEO("Understand what causes inflation and how central banks control it — the reason your money must work.", "Next: The Last Million — try to protect $1,000,000 from inflation."),
  c1_million: { goal: "Protect $1,000,000 (fictional) for 5 years from inflation, emergencies and temptations.", steps: ["Split your money in 5 places (100%).", "Live 5 years: decide at each event.", "Compare your money with the money you NEED to keep your purchasing power.", "Answer the final question."], win: [["Finishing the 5 years", "+30 🪙"], ["Beating inflation (real value ≥ $1,000,000)", "+10 🪙"]], tip: "Liquid money for emergencies + investments for growth." },
  c1_id: { goal: "Create your Future Me ID: who do you think you will be at 25? It appears in every period of the year. This is Future Page 01.", steps: ["Choose your avatar, career dream, city and 3 traits.", "Write a goal for this year.", "Write Page 01 (25–80 words) with will / going to."], win: TPAGE("01", "25–80", "the future + a reason", 30) },
  c2_starter: B_STARTER("barter, double coincidence of wants, medium of exchange, scarcity"),
  c2_read: B_READ("Discover how one man traded a red paperclip for a house in 14 trades — and the economics behind it.", "Next: Barter Island."),
  c2_island: { goal: "Live without money: find the chain of trades to get what you need on an island. Then see what money changes.", steps: ["Tap a villager to offer your object (they only accept what they WANT).", "Find the right chain in 3 levels.", "Try money mode and compare."], win: [["Finishing the 3 levels + money mode", "+26 🪙"]], tip: "Read what each villager WANTS before you tap." },
  c2_market: { goal: "The CREAR Market from 6th grade, level 10: trade up live with your classmates, watch market values change and satisfy a secret client.", steps: ["Open your mystery box.", "Offer a trade (code) or redeem a classmate's code.", "Before accepting, explain why the trade creates value.", "Write your market analysis (20–70 words)."], win: [["Base", "+18 🪙"], ["Each trade (up to 5)", "+4 🪙"], ["Secret client's need solved", "+6 🪙"]], tip: "Market value = base value × scarcity in YOUR class." },
  c2_seed: { goal: "Start THE BIG PROJECT: register the simple object your team will trade up in real life. This is Future Page 02.", steps: ["Write your team and your seed object.", "Estimate its value in pesos.", "Think of a first client and their need.", "Write how you chose it (past simple)."], win: TPAGE("02", "20–70", "the past + a reason", 26) },
  c3_video: B_VIDEO("Learn the law of demand, the law of supply and how the equilibrium price is born.", "Next: the Market Price Machine."),
  c3_machine: { goal: "Move supply and demand and predict what real news does to price and quantity.", steps: ["Play with the two curves.", "Read each news story.", "Predict price and quantity.", "Reveal and read the explanation."], win: [["Each right prediction (12)", "+1 🪙"], ["Finishing", "+14 🪙"]], tip: "When in doubt, draw it out!" },
  c3_rush: B_RUSH("Decide fast: does each event move DEMAND or SUPPLY — up or down?"),
  c3_trade1: { goal: "Interview like a pro to discover needs, then register your first real trade. This is Future Page 03.", steps: ["Choose 3 GOOD interview questions.", "Describe your target client.", "Register Trade 1 in the Trade Log."], win: [["3 good questions + target client + Trade 1", "required"], ["Future Page 03 saved", "+28 🪙"]] },
  c4_read: B_READ("Meet three ideas of value: Adam Smith, Karl Marx and the subjective theory.", "Next: One Umbrella, Four Prices."),
  c4_auction: { goal: "Sell the SAME umbrella to 5 buyers in different situations. Discover subjective value and willingness to pay.", steps: ["Read the buyer's situation.", "Set a price with the slider.", "See if they buy — and their real maximum.", "Answer the final question."], win: [["Base", "+14 🪙"], ["Bonus for the % of value you captured", "up to +12 🪙"]] },
  c4_listen: B_LISTEN("Listen to two versions of the same negotiation and discover the tools that saved Daniel 110,000 pesos."),
  c4_trade2: { goal: "Learn 5 persuasion frames that work without pressure, then register Trade 2.", steps: ["Answer 5 negotiation situations.", "Register Trade 2.", "Your closing sentence must use a frame (What if… / Imagine… / This could…)."], win: [["Base", "+20 🪙"], ["Each situation right on the first try", "+2 🪙"]] },
  c5_rush: B_RUSH("Product or service? Classify fast — and discover why exchanging dollars is a service."),
  c5_brief: B_BRIEF("Understand the dollar as a product with a price (the TRM) and the casa de cambio as a service (the spread).", "Next: the Currency Desk."),
  c5_desk: { goal: "Run your own currency desk for 6 days: buy, sell or wait with real-style news — and feel the cost of the spread.", steps: ["Read the news of the day.", "Buy, sell (up to US$200) or wait.", "See your final result and the spread you paid.", "Compare two exchange houses."], win: [["Closing the desk", "+26 🪙"]], tip: "Every buy + sell costs you the full spread." },
  c5_growth: { goal: "Calculate the % growth of each of your trades and write how your value grew. This is Future Page 04.", steps: ["Calculate the % of each trade.", "See your total growth.", "Write Page 04 with comparatives and 2 numbers."], win: TPAGE("04", "25–75", "comparatives + 2 numbers", 26), tip: "(new − old) ÷ old × 100" },
  c6_video: B_VIDEO("Discover how brands use colors to make you feel trust, hunger or luxury.", "Next: Color Rush and the Logo Detective."),
  c6_rush: B_RUSH("Which color would each brand use? Match the brand with the feeling."),
  c6_detective: { goal: "Read 6 fictional logos like a detective: what do they communicate and to whom?", steps: ["Look at the symbol, the color and the font.", "Choose what the brand communicates.", "Read the explanation."], win: [["Each answer right on the first try", "+3 🪙"], ["Finishing", "+8 🪙"]] },
  c6_brand: { goal: "Build your team's brand and test it with real client profiles. This is Future Page 05.", steps: ["Choose a name, a symbol, colors and a font.", "Choose your client and reach a fit of 60%+.", "Beat the competitor without destroying your profit.", "Write your mission and vision."], win: [["Fit ≥ 60% + smart differentiation", "required"], ["Future Page 05 saved", "+30 🪙"]] },
  c7_tagline: { goal: "Turn a feature into a benefit and a benefit into a motto for your brand.", steps: ["Answer 4 rounds.", "Write your feature, benefit and motto (2–7 words)."], win: [["Base", "+20 🪙"], ["Each round right on the first try", "+2 🪙"]] },
  c7_read: B_READ("Meet three leaders who started small and changed their industries.", "Next: CEO Under Pressure."),
  c7_ceo: { goal: "Lead a company through 5 crises. Your choices move leadership, innovation, profit, social impact and reputation.", steps: ["Read each crisis.", "Choose a response and watch the 5 indicators.", "See your company health."], win: [["Base", "+18 🪙"], ["Each smart decision", "+2 🪙"]], tip: "Think like the leaders in the reading." },
  c7_card: { goal: "Choose a leader, prepare a 1-minute talk and register your LAST trade. This is Future Page 06.", steps: ["Choose a leader.", "Write your talk (35–90 words): past simple + a reason + the future.", "Register Trade 3."], win: TPAGE("06", "35–90", "past, a reason and the future", 30) },
  c8_video: B_VIDEO("Analyze a real Shark Tank pitch: what investors ask and why numbers matter.", "Next: your Trade Audit and your own pitch."),
  c8_audit: { goal: "Audit your Red Paperclip Challenge: value curve, % per trade, total growth and best trade.", steps: ["Look at your curve.", "Find your best trade.", "Choose the most professional explanation."], win: [["Saving your audit", "+22 🪙"]] },
  c8_pitch: { goal: "THE BIG PROJECT: pitch your Red Paperclip Challenge to the sharks with your story, numbers, brand and ask.", steps: ["Check your auto-built script (🎤 I SAY).", "Write your ask and your closing line.", "Press Present and pitch for 2–3 minutes.", "Publish it for the investment round.", "A classmate-shark rates you (5 criteria)."], win: [["Script + jury complete", "required"], ["Value Creator certificate", "+60 🪙"]], tip: "Story + numbers + brand. Remember the copper sheets guy: honesty AND data." },
  c8_arena: { goal: "Be a shark: listen to your classmates' pitches and invest your 100 coins wisely.", steps: ["Open a pitch.", "Write the question you asked the founder.", "Choose a category and invest 10–50 coins.", "Invest in at least 2 pitches."], win: [["Base", "+20 🪙"], ["Each pitch evaluated (up to 5)", "+4 🪙"]] },
  c8_boss: { goal: "Beat the Period 1 boss and unlock your first Future Me Card: Value Creator.", steps: ["Part 1: 5 missions (calculate and decide).", "Part 2: 10 questions.", "Read your feedback by topic."], win: [["70% or more", "Future Me Card 💎"], ["Each question right", "+4 🪙"], ["Each mission on the first try", "+4 🪙"]] },
};

/* =====================================================================
   ESTRUCTURA · 10° PERIODO 1 · FROM ZERO (8 clases)
   ===================================================================== */
const G10P1_WEEKS = [
  { n: 1, title: "Money Reboot", e: "💰", blurb: "Inflation, saving vs. investing — and your Future Me at 25.", skills: ["Radar", "Video", "Simulator"], prove: { from: "9th grade", q: "Inflation is 8% and your money is in a piggy bank. After a year…", options: ["It buys about 8% less.", "It buys 8% more because coins get older and more valuable.", "Nothing changes.", "It doubles."], correct: 0, why: "Prices go up, the same money buys less." }, acts: [
    A10("c1_radar", "My Money Radar 10 🧭", "Day 1: 10 situations · 5 pillars.", <Compass size={22} />, 25, "comportamiento"),
    A10("c1_video", "Video: Inflation Explained 🎬", "Johnny Harris · 8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A10("c1_million", "The Last Million 💰", "5 years · inflation, emergencies, temptations.", <PiggyBank size={22} />, 40, "aprendi"),
    A10("c1_id", "Future Me ID 🪪 · Page 01", "Who will you be at 25?", <Fingerprint size={22} />, 30, "aprendi"),
  ] },
  { n: 2, title: "Before Money: Barter", e: "🔁", blurb: "Why money exists — and the start of the Red Paperclip Challenge.", skills: ["Reading", "Live market", "Project"], prove: { from: "6th grade", q: "In the CREAR Market of 6th grade, what made a trade possible?", options: ["Both wanted what the other had.", "The teacher decided the winner of every single trade in the market.", "Money.", "Luck."], correct: 0, why: "That's the double coincidence of wants." }, acts: [
    A10("c2_starter", "Starter: Before Money 🧱", "6 key words · match them.", <Lightbulb size={22} />, 20, "aprendi"),
    A10("c2_read", "Reading: The Red Paperclip 📖", "14 trades from a clip to a house · 8 questions.", <BookOpen size={22} />, 42, "quizzes"),
    A10("c2_island", "Barter Island 🏝️", "3 levels of trade chains + money mode.", <MapIcon size={22} />, 26, "aprendi"),
    A10("c2_market", "CREAR Market 10 · Level Up 🏪", "Live trading · market values · secret client.", <Store size={22} />, 42, "aprendi"),
    A10("c2_seed", "Our Seed Asset 🌱 · Page 02", "THE BIG PROJECT starts: step 0.", <Sprout size={22} />, 26, "aprendi"),
  ] },
  { n: 3, title: "Supply, Demand & Scarcity", e: "📈", blurb: "Why prices go up and down — and your first real trade.", skills: ["Video", "Simulator", "Trade 1"], prove: { from: "9th grade", q: "A storm destroys coffee farms. What happens to the coffee price?", options: ["It goes up.", "It goes down because people drink less coffee when it rains.", "Nothing.", "It's free."], correct: 0, why: "Less supply → higher price." }, acts: [
    A10("c3_video", "Video: Supply and Demand 🎬", "Jacob Clifford · 8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A10("c3_machine", "Market Price Machine 📈", "Move the curves · 6 news stories.", <TrendingUp size={22} />, 26, "aprendi"),
    A10("c3_rush", "Shift Rush ⚡", "Demand or supply? Up or down?", <Zap size={22} />, 24, "aprendi"),
    A10("c3_trade1", "Market Audit + Trade 1 🔎 · Page 03", "Discover needs · register your first trade.", <Search size={22} />, 28, "aprendi"),
  ] },
  { n: 4, title: "Who Decides Value?", e: "💎", blurb: "Smith, Marx and the subjective theory — and the art of persuasion.", skills: ["Reading", "Listening", "Trade 2"], prove: { from: "Class 2", q: "Why did a town give Kyle a house for a movie role?", options: ["It wanted publicity.", "The house was too old and nobody in the town wanted to live in it.", "A mistake.", "A law."], correct: 0, why: "Perceived value: attention and tourists." }, acts: [
    A10("c4_read", "Reading: Three Ideas of Value 📖", "Smith · Marx · subjective value · 8 questions.", <BookOpen size={22} />, 42, "quizzes"),
    A10("c4_auction", "One Umbrella, Four Prices ☂️", "5 buyers · willingness to pay.", <Gavel size={22} />, 26, "aprendi"),
    A10("c4_listen", "Listening: The Used Bike 🎧", "Two negotiations · 8 questions.", <Headphones size={22} />, 42, "quizzes"),
    A10("c4_trade2", "Persuasion Lab + Trade 2 🤝", "5 frames · register Trade 2.", <Handshake size={22} />, 30, "aprendi"),
  ] },
  { n: 5, title: "Product, Service & the Dollar", e: "💵", blurb: "The dollar is a product, the exchange is a service — and your value keeps growing.", skills: ["Rush", "Explainer", "Desk"], prove: { from: "9th grade", q: "The dollar goes up. Who wins?", options: ["Exporters.", "Families who buy imported products and pay for apps in dollars.", "Tourists.", "Importers."], correct: 0, why: "Exporters receive more pesos per dollar." }, acts: [
    A10("c5_rush", "Product or Service? ⚡", "14 cards · 60 seconds.", <Zap size={22} />, 24, "aprendi"),
    A10("c5_brief", "Explainer: The Dollar Is a Product Too 💡", "TRM, spread, devaluation · 6 questions.", <BookOpen size={22} />, 34, "quizzes"),
    A10("c5_desk", "Currency Desk 💵", "6 days · buy, sell or wait.", <Banknote size={22} />, 26, "aprendi"),
    A10("c5_growth", "Value Growth Calculator 📊 · Page 04", "% growth of your trades.", <Percent size={22} />, 26, "aprendi"),
  ] },
  { n: 6, title: "Brand in One Class", e: "🎨", blurb: "Colors, logos and a value proposition for your trading team.", skills: ["Video", "Detective", "Brand"], prove: { from: "9th grade", q: "What is a value proposition?", options: ["Why a client should choose you.", "The exact price list of all the products that a company sells in its store.", "A logo.", "A loan."], correct: 0, why: "It explains the value you create for a specific client." }, acts: [
    A10("c6_video", "Video: Color Psychology 🎬", "Colors in marketing · 8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A10("c6_rush", "Color Rush ⚡", "Which color would this brand use?", <Zap size={22} />, 24, "aprendi"),
    A10("c6_detective", "Logo Detective 🕵️", "6 fictional brands · what do they say?", <Search size={22} />, 26, "aprendi"),
    A10("c6_brand", "Brand Empire 🎨 · Page 05", "Logo + client fit + mission and vision.", <Palette size={22} />, 30, "aprendi"),
  ] },
  { n: 7, title: "Motto & Global Leaders", e: "👑", blurb: "From feature to benefit to motto — and leaders who started small.", skills: ["Reading", "CEO game", "Trade 3"], prove: { from: "Class 6", q: "Why do banks often use blue?", options: ["It communicates trust.", "Blue makes people hungry, so they open accounts faster.", "It's cheap.", "By law."], correct: 0, why: "Blue = trust and security." }, acts: [
    A10("c7_tagline", "Tagline Workshop 🏷️", "Feature → benefit → motto.", <Megaphone size={22} />, 28, "aprendi"),
    A10("c7_read", "Reading: Leaders Who Started Small 📖", "Walker · Blakely · Rappi · 8 questions.", <BookOpen size={22} />, 42, "quizzes"),
    A10("c7_ceo", "CEO Under Pressure 🧭", "5 crises · 5 indicators.", <Briefcase size={22} />, 28, "aprendi"),
    A10("c7_card", "Leader Card + Trade 3 👑 · Page 06", "1-minute talk · last trade.", <Crown size={22} />, 30, "aprendi"),
  ] },
  { n: 8, title: "Shark Tank Day", e: "🦈", blurb: "Audit your trades, pitch to the sharks, invest — and beat the boss.", skills: ["Project", "Pitch", "Boss"], prove: { from: "Class 5", q: "A clip worth $500 becomes a game worth $35,000. Growth?", options: ["6,900%.", "70%, because you divide 500 by 35,000 and multiply by 100.", "35%.", "100%."], correct: 0, why: "(35,000 − 500) ÷ 500 × 100 = 6,900%." }, acts: [
    A10("c8_video", "Video: A Shark Tank Pitch 🎬", "What investors ask · 8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A10("c8_audit", "Trade Audit 🔍", "Your value curve and best trade.", <BarChart3 size={22} />, 22, "aprendi"),
    A10("c8_pitch", "Shark Tank Pitch 🦈 · THE BIG PROJECT", "Present + jury + Value Creator certificate.", <Mic size={22} />, 60, "aprendi"),
    A10("c8_arena", "The Investors' Arena 💼", "Invest 100 coins in classmates' pitches.", <Briefcase size={22} />, 40, "aprendi"),
    A10("c8_boss", "Boss P1 + Future Me Card ⚔️", "5 missions + 10 questions (70%).", <Swords size={22} />, 70, "quizzes"),
  ] },
];

const CFG101 = {
  n: 1, KEY: "10P1", title: "From Zero 📎", weeks: G10P1_WEEKS,
  question: "How can I create value from almost nothing — with negotiation, perceived value and the laws of the market?",
  howyear: "10th grade is the year of your Future Me: in Period 4 you will design who you want to be — and how to pay for it. It starts here, from zero: your team trades a simple object up in real life (the Red Paperclip Challenge) while you learn barter, supply and demand, subjective value, the dollar, branding and leadership. You finish with a Shark Tank Pitch and your first Future Me Card: Value Creator.",
  chips: ["📎 Red Paperclip Challenge", "📘 Future Pages 01–06", "💎 Value Creator"],
  bigKeys: ["c8_pitch"], pageKeys: ["c1_id", "c2_seed", "c3_trade1", "c5_growth", "c6_brand", "c7_card"],
  panel: (ctx, compact) => {
    const r = ctx.resp; const L = tradeLogOf(r); const s = L.steps;
    const g = s.length > 1 ? growth(s[0].value, s[s.length - 1].value) : null;
    return <FutureMePanel id={fmIdOf(r)} have={ctx.have} compact={compact} studentName={ctx.name} title="PERIOD 1 · FROM ZERO" stats={[{ l: "📎 Start", v: s[0] ? `${s[0].e} ${cop(s[0].value)}` : "—" }, { l: "🔁 Real trades", v: Math.max(0, s.length - 1) }, { l: "📈 Value growth", v: g != null ? pctTxt(g, 0) : "—", c: g != null && g >= 0 ? "pos" : "" }, { l: "🏪 Market trades", v: r.c2_market?.trades ?? "—" }]} />;
  },
  render: (act, ctx) => {
    const L = mkLearn(ctx, Brief91);
    const P = { onSave: ctx.save, onExit: ctx.exit };
    switch (act) {
      case "c1_radar": return <Radar10Start existing={ctx.existing} {...P} />;
      case "c1_video": return L.video("c1_video", VID_INFL10, "Inflation Explained", VQ_INFL10);
      case "c1_million": return <LastMillion {...P} />;
      case "c1_id": return <FutureMeId studentName={ctx.name} existing={ctx.existing} {...P} />;
      case "c2_starter": return <StarterPack title="Starter: Before Money 🧱" subtitle="The 6 words you need to understand barter and money." intro={<Brief91 k="c2_starter" />} cards={STARTER_BARTER} pairs={STARTER_BARTER_PAIRS} {...P} />;
      case "c2_read": return L.reading("c2_read", "The Red Paperclip", "How a man traded one red paperclip for a house — without money.", READ_CLIP, GLOSS_CLIP, Q_CLIP, "📎");
      case "c2_island": return <BarterIsland {...P} />;
      case "c2_market": return <CrearMarket10 userData={ctx.userData} API_URL={ctx.API_URL} existing={ctx.existing} {...P} />;
      case "c2_seed": return <SeedAsset existing={ctx.existing} {...P} />;
      case "c3_video": return L.video("c3_video", VID_SD10, "Supply and Demand", VQ_SD10);
      case "c3_machine": return <MarketMachine {...P} />;
      case "c3_rush": return L.rush("c3_rush", "Shift Rush ⚡", "Does the event move demand or supply — up or down?", RUSH_SHIFT, "Market master! 📈");
      case "c3_trade1": return <TradeOne resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c4_read": return L.reading("c4_read", "Three Ideas of Value", "Where does value come from? Three famous answers.", READ_VALUE, GLOSS_VALUE, Q_VALUE, "💎");
      case "c4_auction": return <ValueAuction {...P} />;
      case "c4_listen": return L.listen("c4_listen", audioUsedBike, "The Used Bike", "Two versions of the same negotiation. What changed?", SCRIPT_BIKE, Q_BIKE);
      case "c4_trade2": return <TradeTwo resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c5_rush": return L.rush("c5_rush", "Product or Service? ⚡", "Can you touch it — or does someone do it for you?", RUSH_PS, "Classification pro! 📦");
      case "c5_brief": return L.brief("c5_brief", "The Dollar Is a Product Too", "TRM, spread and devaluation — explained with numbers.", BRIEF_DOLLAR, GLOSS_DOLLAR, Q_DOLLAR, "💵");
      case "c5_desk": return <CurrencyDesk {...P} />;
      case "c5_growth": return <ValueGrowth resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c6_video": return L.video("c6_video", VID_COLOR10, "The Psychology of Colors in Marketing", VQ_COLOR10);
      case "c6_rush": return L.rush("c6_rush", "Color Rush ⚡", "Which color would this brand choose?", RUSH_COLOR, "Brand designer! 🎨");
      case "c6_detective": return <NumberRounds icon={<Search size={22} strokeWidth={2.1} />} title="Logo Detective 🕵️" subtitle="6 fictional brands. What do their logos communicate?" intro={<Brief91 k="c6_detective" />} rounds={LOGO_R} coinsPer={3} bonus={8} doneTitle="Brand detective! 🕵️" {...P} />;
      case "c6_brand": return <BrandEmpire resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c7_tagline": return <TaglineWorkshop resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c7_read": return L.reading("c7_read", "Leaders Who Started Small", "Three leaders, three problems, three ways to create value.", READ_LEADERS, GLOSS_LEADERS, Q_LEADERS, "👑");
      case "c7_ceo": return <CEOPressure {...P} />;
      case "c7_card": return <LeaderCard resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c8_video": return L.video("c8_video", VID_SHARK10, "A Shark Tank Pitch", VQ_SHARK10);
      case "c8_audit": return <TradeAudit resp={ctx.resp} {...P} />;
      case "c8_pitch": return <SharkPitch resp={ctx.resp} studentName={ctx.name} userData={ctx.userData} API_URL={ctx.API_URL} existing={ctx.existing} {...P} />;
      case "c8_arena": return <FairArena userData={ctx.userData} API_URL={ctx.API_URL} grado="10-ST" title="The Investors' Arena 💼" subtitle="You are a shark: 100 coins, many pitches. Invest in the best ideas." brief={<Brief91 k="c8_arena" />} {...P} />;
      case "c8_boss": return <BossP1 resp={ctx.resp} studentName={ctx.name} {...P} />;
      default: return null;
    }
  },
};

export const Periodo1G10 = (props) => <PeriodShell10 cfg={CFG101} {...props} />;