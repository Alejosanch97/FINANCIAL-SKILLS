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
import "../Styles/decimo3.css";   // 10° · Periodo 3 · Global Investor
import useGlobalReducer from "../hooks/useGlobalReducer";
import audioDollarsMiami from "../assets/img/3DECIMO.mp3"; // 🎧 Listening clase 3 · Dollars for Miami (cámbiale el nombre si tu archivo se llama distinto)

/* =====================================================================
   GRADO 10 · PERIODO 3 · GLOBAL INVESTOR (B1+ a B2)
   Año "FUTURE ME": cada periodo lee las filas anteriores ("10P1"…"10P3") y suma una Future Me Card.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "10P3", Grado = "10".
   ===================================================================== */
const PERIOD_KEY = "10P3";
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
// Todas las opciones son razonables: cada una vale 0–3 según qué tan completa es la decisión.
// El orden se baraja en pantalla y las longitudes son parecidas para que no se adivine.
const RADAR10_Q = [
  { d: "val", q: "You have an old bike you don't use anymore. What do you do first?", o: ["Find out who needs a bike and what they would give for it.", "Check online what similar used bikes are selling for.", "Clean it and fix the brakes so it looks better.", "Sell it to the first person who makes an offer."], s: [3, 2, 2, 1] },
  { d: "val", q: "Why can the same umbrella cost more on a rainy day?", o: ["Demand jumps while the supply on the street stays the same.", "Sellers know people need it now, so they raise the price.", "Many people already bought one, so fewer are left.", "Bringing umbrellas to the street costs more when it rains."], s: [3, 2, 1, 1] },
  { d: "mm", q: "You receive your first salary. What do you do first?", o: ["Pay my needs first and save whatever is left.", "Save a fixed part first, then plan needs and fun.", "Write down every expense this month to see where it goes.", "Buy the thing I wanted for months — I worked for it."], s: [2, 3, 1, 0] },
  { d: "mm", q: "Inflation is 6% and you keep $1,000,000 at home for a year. What happens?", o: ["It's still $1,000,000, so I don't lose any pesos.", "It buys about 6% less than it did a year ago.", "It's safe from bank fees, so it keeps more value.", "It only loses value if I buy things that went up."], s: [1, 3, 1, 0] },
  { d: "math", q: "A bank offers 1% per month. A CDT offers 12% E.A. Which pays more in a year?", o: ["They are equal: 1% × 12 months is 12%.", "The CDT: E.A. already includes the compounding.", "1% monthly, because it compounds to about 12.7%.", "I'd convert both to E.A. before I decide."], s: [1, 1, 3, 2] },
  { d: "math", q: "You can pay a $1,200,000 phone in 1 or 36 card installments. What do you check?", o: ["If the monthly payment fits in my budget.", "The interest rate and the total I'll pay at the end.", "If the store gives a discount for paying at once.", "How many installments people usually choose."], s: [1, 3, 2, 0] },
  { d: "inv", q: "Your investment falls 15% in one week. What do you do?", o: ["Wait without looking; markets usually recover.", "Sell part of it to reduce the risk I feel.", "Sell everything now before it falls even more.", "Check why it fell and compare it with my plan."], s: [2, 1, 0, 3] },
  { d: "inv", q: "An app promises 20% per month, guaranteed. You…", o: ["Check if it is supervised by the Superfinanciera.", "Stay away: a guaranteed high return is a red flag.", "Invest a small amount first to test if it pays.", "Ask friends who invested if they really got paid."], s: [3, 2, 1, 0] },
  { d: "fut", q: "When should you start saving and investing for your future?", o: ["When I have a stable job and a real salary.", "After university, when I know what I want.", "Now, even with small amounts, so time helps.", "When I earn enough to save big amounts."], s: [2, 1, 3, 0] },
  { d: "fut", q: "You are choosing a career. What do you consider?", o: ["Salaries and job demand for the next ten years.", "What I love, what I'm good at and what pays.", "The subjects where I get my best grades.", "What my family recommends — they know me."], s: [2, 3, 1, 0] },
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
  const [orders] = useState(() => qs.map((x) => shuffleArr(x.o.map((_, k) => k))));
  const q = qs[cur]; const answered = ans[cur] != null;
  return (
    <div className="s1-quiz">
      <div className="quiz-top"><h2>🧭 {title}</h2><span className="quiz-count">{cur + 1} / {qs.length}</span></div>
      <div className="quiz-track"><i style={{ width: `${((cur + (answered ? 1 : 0)) / qs.length) * 100}%` }} /></div>
      {cur === 0 && intro}
      {cur === 10 && <p className="start-tip">🆕 5 new situations about this year's topics.</p>}
      <span className="diag-dim">{cur >= 10 ? "🆕 " : ""}{RADAR10_DIMS.find((d) => d.k === q.d).l}</span>
      <p className="quiz-q">{q.q}</p>
      <p className="start-tip">💡 Every option makes sense. Choose what YOU would really do — there is no trick.</p>
      <div className="quiz-options">{orders[cur].map((k, pos) => <button key={k} type="button" className={`quiz-opt ${ans[cur] === k ? "correct" : ""}`} onClick={() => setAns({ ...ans, [cur]: k })}><span className="opt-key">{"ABCD"[pos]}</span><span className="opt-text">{q.o[k]}</span></button>)}</div>
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
   10° · PERIODO 3 · GLOBAL INVESTOR — VIDEOS, LECTURAS (B2), LISTENING Y DATOS
   Proyecto grande: Global Asset Allocation Lab (US$1,000 simulados · Market Weeks 1–5).
   Los movimientos del mercado son ESCENARIOS ILUSTRATIVOS (iguales para todos), no pronósticos.
   ===================================================================== */
const VID_RISK10 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1794069569/videoplayback_48.mp4";
const VID_ETF10 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1794069697/videoplayback_49.mp4";
const VID_STABLE10 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1794069829/videoplayback_50.mp4";

/* ---------- VIDEO · Risk & Return ---------- */
const VQ_RISK10 = [
  { q: "What principle connects risk and return?", options: ["Higher expected return requires higher risk.", "Safe assets always win in the short term.", "Government bonds pay the highest returns.", "Risk and return aren't related."], correct: 0, feedback: "To aim for bigger gains, investors must accept more uncertainty." },
  { q: "Why do fixed deposits pay the lowest returns?", options: ["They are the safest, with almost no volatility.", "Banks can't legally pay more on deposits.", "They have the highest risk of all assets.", "Their returns follow inflation down."], correct: 0, feedback: "Low risk → low return." },
  { q: "How do shares compare with bonds?", options: ["Shares: more risk and higher expected return.", "Shares are safer: the government insures them.", "Bonds: more risk and higher expected return.", "They have the same risk and return."], correct: 0, feedback: "Owning a business is riskier than lending to it." },
  { q: "Which rule summarizes investing?", options: ["No reward without risk.", "Diversify and risk disappears.", "Safe investments pay the most.", "Central banks guarantee returns."], correct: 0, feedback: "Higher expected returns come with higher risk." },
  { q: "What measures the volatility (risk) of an investment?", options: ["Standard deviation.", "The country's GDP.", "The CPI.", "The average return."], correct: 0, feedback: "A bigger standard deviation = bigger swings = more risk." },
  { q: "Two investments both expect 3%. Which has the higher Sharpe ratio?", options: ["The one with lower volatility.", "The one with higher volatility.", "Both have the same Sharpe ratio.", "It depends only on the price."], correct: 0, feedback: "Sharpe = return per unit of risk." },
  { q: "What is the goal of using the Sharpe ratio?", options: ["The best return for each unit of risk.", "Guaranteed profit with no risk.", "The highest return, whatever the risk.", "The lowest risk, whatever the return."], correct: 0, feedback: "Maximize return for a given risk, or minimize risk for a given return." },
  { q: "What three things define your risk appetite?", options: ["Need, ability and willingness.", "Income, taxes and houses owned.", "Age, city and education.", "Your credit score only."], correct: 0, feedback: "Need for returns, ability to absorb losses, willingness to tolerate swings." },
  { q: "How do dependents (people who depend on you) affect your ability to take risk?", options: ["They usually reduce it.", "They increase it a lot.", "They have no effect.", "They only matter after 50."], correct: 0, feedback: "More responsibilities = less capacity to absorb losses." },
  { q: "What happens if your willingness to take risk is low but you invest aggressively?", options: ["You may panic and make bad decisions.", "You will earn more because fear makes you careful.", "Nothing, your feelings don't affect returns.", "Your risk drops because you watch closely."], correct: 0, feedback: "Anxiety leads to panic selling." },
  { q: "What analogy does the video use for panic selling?", options: ["Jumping off a roller coaster halfway.", "Driving a car without brakes at night.", "Sailing into a hurricane.", "Leaving a race before the finish line."], correct: 0, feedback: "Jumping off in the middle locks in your losses." },
  { q: "What is the key to long-term investing?", options: ["Staying invested through the ups and downs.", "Buying at the lowest point of every cycle.", "Avoiding stocks in election years.", "Selling quickly when prices fall."], correct: 0, feedback: "Time in the market beats timing the market." },
];

/* ---------- VIDEO · WTF Is an ETF? (Bloomberg) ---------- */
const VQ_ETF10 = [
  { q: "How does the video describe the origin of an ETF?", options: ["The child of an index fund and a stock.", "A mix of a mutual fund and a bank.", "A new type of cryptocurrency.", "A savings account that trades on an exchange."], correct: 0, feedback: "It combines the best traits of both 'parents'." },
  { q: "What do ETFs inherit from index funds?", options: ["Passive, diversified and low cost.", "Active trading by expert managers.", "Guaranteed returns every year.", "High fees and fixed prices."], correct: 0, feedback: "Most ETFs track an index cheaply." },
  { q: "What do ETFs inherit from stocks?", options: ["They trade on an exchange during the day.", "They are bought once a year from the central bank.", "They pay dividends every week.", "Their price is fixed once a day."], correct: 0, feedback: "You can buy and sell them any time the market is open." },
  { q: "What is the 'basket' idea?", options: ["An ETF holds many real securities.", "An ETF is a vault of paper money.", "An ETF is a bet on one company.", "An ETF is a savings account."], correct: 0, feedback: "Bonds, stocks or even gold — inside one basket." },
  { q: "Why is a gold ETF useful with only $1,000?", options: ["No need to buy and store gold bars.", "Gold doubles in value every year.", "You don't pay any taxes on it.", "You receive gold coins at home."], correct: 0, feedback: "Small amounts, safe storage, easy to trade." },
  { q: "What are the two main attractions of ETFs?", options: ["Accessible and simple.", "Tax-free and insured.", "More leverage.", "Zero volatility."], correct: 0, feedback: "You don't need to be rich, and they're easy to own." },
  { q: "How are ETFs different from mutual funds on taxes (in the US)?", options: ["They rarely create yearly capital-gains taxes.", "They charge capital-gains taxes every month.", "Mutual funds pay no taxes at all.", "ETFs pay no taxes in any country."], correct: 0, feedback: "You usually pay when YOU sell with a profit." },
  { q: "How big was the ETF market in the video?", options: ["6,000+ ETFs, 60 exchanges, about $3 trillion.", "About 500 ETFs and $50 billion in total.", "A tiny, shrinking niche for experts.", "60,000 ETFs and about $300 trillion."], correct: 0, feedback: "A huge global market." },
  { q: "What comparison shows US ETF trading volume?", options: ["About $2 trillion a year, more than US GDP.", "About the same as all the world's oil exports.", "Less than the trading of one big company.", "All the retail spending in the US."], correct: 0, feedback: "(The video's figure — volumes change over time.)" },
  { q: "Why are passive ETFs cheaper than active funds?", options: ["They copy an index instead of paying stock pickers.", "The government pays part of their operating costs.", "Their commissions are forbidden by the law.", "Their managers work for free to get famous."], correct: 0, feedback: "Tracking an index costs much less." },
  { q: "What does the creation/redemption mechanism do?", options: ["Keeps the price close to the basket's NAV.", "Guarantees that investors never lose money.", "Fixes the price once a day.", "Removes all broker fees."], correct: 0, feedback: "Trading price stays close to the real value of the basket." },
  { q: "What is the video's conclusion about ETFs?", options: ["They are here to stay.", "They are a temporary fad.", "They will be banned soon.", "They'll replace all stocks."], correct: 0, feedback: "A permanent pillar of investing." },
];

/* ---------- VIDEO · Stablecoins (Binance) ---------- */
const VQ_STABLE10 = [
  { q: "What is a stablecoin?", options: ["A crypto pegged 1:1 to an asset like the dollar.", "A crypto whose price moves a lot with speculation.", "A central bank coin backed by gold.", "A token that pays a high fixed interest."], correct: 0, feedback: "Designed to keep a stable value." },
  { q: "Why do traders use stablecoins?", options: ["To hold value without big price swings.", "To avoid taxes and hide money.", "To receive guaranteed dividends.", "To win more when bitcoin goes up."], correct: 0, feedback: "Like digital cash between trades." },
  { q: "How does the video compare stablecoins with traditional money?", options: ["Digital cash: fast, flexible, 24/7.", "Slow and limited to bank hours.", "Only useful for big institutions.", "Exactly like paper money, but online."], correct: 0, feedback: "Stability of cash + speed of blockchain." },
  { q: "What role do stablecoins play when entering crypto?", options: ["The bridge between local money and crypto.", "A tax that validators collect on payments.", "A guarantee for loans on exchanges.", "The last step to sell bitcoin for cash."], correct: 0, feedback: "Local currency → stablecoin → other assets (and back)." },
  { q: "Which two big stablecoins are mentioned?", options: ["USDT and USDC.", "Bitcoin and Ethereum.", "Ripple and Cardano.", "Solana and Dogecoin."], correct: 0, feedback: "USDT and USDC." },
  { q: "Why is USDC seen as transparent (according to the video)?", options: ["Its issuer, Circle, is a listed US company.", "The US Federal Reserve insures it directly.", "It is anonymous, so nobody can change it.", "It is backed by the bonds of many countries."], correct: 0, feedback: "A regulated, publicly listed issuer adds oversight." },
  { q: "Why are stablecoins important in high-inflation countries?", options: ["People can hold 'digital dollars' on a phone.", "They force governments to cut taxes.", "They are pegged to gold, not to dollars.", "They don't need internet to work."], correct: 0, feedback: "Protection from a weak local currency." },
  { q: "Besides the dollar, what else can back stablecoins?", options: ["Euros, other currencies and gold.", "Oil, coffee and real estate titles.", "Municipal taxes.", "Only copper."], correct: 0, feedback: "Many variations exist." },
  { q: "What US law did the video mention for payment stablecoins?", options: ["The GENIUS Act: 1:1 reserves and audits.", "A law that taxes every digital transfer.", "A total ban on private stablecoins.", "A law that caps crypto fees at 1%."], correct: 0, feedback: "It treats payment stablecoins as digital money with full reserves." },
  { q: "What European framework regulates stablecoins?", options: ["MiCA.", "Basel III.", "GDPR.", "SEPA."], correct: 0, feedback: "Markets in Crypto-Assets: licensing, backing, transparency." },
  { q: "How did regulation change stablecoins, according to the video?", options: ["It moved them out of the gray zone.", "It closed every stablecoin issuer.", "It made them more speculative.", "It removed all their fees."], correct: 0, feedback: "Clear rules → more trust." },
  { q: "IMPORTANT for your portfolio: is a stablecoin risk-free?", options: ["No: it depends on the issuer and its reserves.", "Yes: it works exactly like an insured bank deposit.", "Yes, if its price has been stable for a year.", "No, because its price changes as much as bitcoin."], correct: 0, feedback: "Stable ≠ guaranteed. Check reserves, regulation and the platform you use." },
];

/* ---------- LISTENING · Dollars for Miami (mp3 · decimo3.mp3) ---------- */
const SCRIPT_MIAMI = [
  { who: "Narrator", t: "Sara and her brother Tomás are going to Miami with their school. Each one needs 500 dollars. Today, the official exchange rate, the T-R-M, is 4,000 pesos per dollar. A week before the trip, they call two exchange houses. First, the one at the airport." },
  { who: "Cashier 1", t: "Hello! We sell dollars at 4,350 pesos. And no commission!" },
  { who: "Tomás", t: "No commission? Perfect, let's buy there." },
  { who: "Sara", t: "Wait. The T-R-M is 4,000. If they sell at 4,350, they earn 350 pesos on every dollar. That's the commission. It's just hidden in the price." },
  { who: "Tomás", t: "How much would 500 dollars cost?" },
  { who: "Cashier 1", t: "2,175,000 pesos." },
  { who: "Sara", t: "And if we come back with dollars, how much do you pay for them?" },
  { who: "Cashier 1", t: "We buy at 3,850." },
  { who: "Sara", t: "So the spread is 500 pesos per dollar. Let's compare first." },
  { who: "Narrator", t: "Then they call an exchange house downtown." },
  { who: "Cashier 2", t: "We sell dollars at 4,120 pesos. There's a fixed fee of 10,000 pesos per transaction. And we buy dollars at 3,980." },
  { who: "Tomás", t: "That sounds more expensive because of the fee." },
  { who: "Sara", t: "Let's do the math. 500 times 4,120 is 2,060,000. Plus 10,000 is 2,070,000." },
  { who: "Tomás", t: "And at the airport it was 2,175,000. So downtown is 105,000 pesos cheaper, even with the fee!" },
  { who: "Sara", t: "And the spread downtown is only 140 pesos. If we bring 100 dollars back, the airport pays us 385,000, and downtown pays us 398,000." },
  { who: "Tomás", t: "Lesson learned: “no commission” doesn't mean “cheap.”" },
  { who: "Sara", t: "Exactly. Always compare the price with the T-R-M, add the fees, and buy before you get to the airport." },
  { who: "Narrator", t: "Sara compared each price with the T-R-M, calculated the total cost with fees, and checked the spread. Together, they saved 210,000 pesos." },
];
const Q_MIAMI = [
  { q: "What was the TRM in the story?", options: ["4,000 pesos per dollar.", "4,350 pesos per dollar.", "4,120 pesos per dollar.", "3,850 pesos per dollar."], correct: 0, feedback: "The official rate was 4,000." },
  { q: "Why was 'no commission' misleading?", options: ["The cost was hidden in the price.", "There was a fixed fee of $10,000.", "The house used a fake TRM.", "The rate changed after paying."], correct: 0, feedback: "4,350 vs. 4,000: 350 pesos per dollar hidden in the price." },
  { q: "How much did US$500 cost at the airport?", options: ["2,175,000 pesos.", "2,070,000 pesos.", "2,000,000 pesos.", "2,060,000 pesos."], correct: 0, feedback: "500 × 4,350." },
  { q: "What was the airport's spread?", options: ["500 pesos per dollar.", "350 pesos per dollar.", "140 pesos per dollar.", "230 pesos per dollar."], correct: 0, feedback: "Sell 4,350 − buy 3,850 = 500." },
  { q: "What was the total cost downtown, with the fee?", options: ["2,070,000 pesos.", "2,060,000 pesos.", "2,175,000 pesos.", "2,120,000 pesos."], correct: 0, feedback: "500 × 4,120 + 10,000." },
  { q: "How much did BOTH siblings save by buying downtown?", options: ["210,000 pesos.", "105,000 pesos.", "115,000 pesos.", "500,000 pesos."], correct: 0, feedback: "105,000 each × 2." },
  { q: "Selling US$100 back downtown gives…", options: ["398,000 pesos.", "385,000 pesos.", "412,000 pesos.", "400,000 pesos."], correct: 0, feedback: "100 × 3,980." },
  { q: "What was Sara's three-step method?", options: ["Compare with the TRM, add fees, check the spread.", "Find 'no commission', then compare the offices.", "Ask a friend, then buy at the closest house.", "Check the TRM, then buy at the airport."], correct: 0, feedback: "TRM → total cost with fees → spread." },
  { q: "When should they buy dollars, according to Sara?", options: ["Before going to the airport.", "At the airport, on the day of the trip.", "In Miami, with a US card.", "A month after the trip."], correct: 0, feedback: "Airports usually have worse prices." },
  { q: "Which exchange house had the smaller spread?", options: ["Downtown (140 pesos).", "The airport (500 pesos).", "Both had the same spread.", "The airport (140 pesos)."], correct: 0, feedback: "4,120 − 3,980 = 140." },
];

/* ---------- LECTURA · Where Does Your Money Sleep? (B2) ---------- */
const READ_SLEEP = [
  { p: "Every night, your money sleeps somewhere. Maybe under a mattress, in a piggy bank, in a savings account, in a digital 'cajita' or in a CDT. Some beds are safe but cold: the money sleeps, wakes up the same, and inflation steals a little every night. Other beds pay interest while your money sleeps. And some beds look comfortable but have hidden holes. In this reading you will learn to choose a bed for each goal — using three criteria: safety, liquidity and return." },
  { h: "The three criteria" },
  { list: ["Safety: can I lose my money? Is the entity supervised by the Superintendencia Financiera? Are my deposits insured?", "Liquidity: how fast can I use my money without losing part of it?", "Return: how much does it pay per year (E.A.)? Is it higher than inflation?"] },
  { p: "No product is the best in the three criteria at the same time. A piggy bank is very liquid but pays 0% and can be stolen. A CDT pays more, but your money is locked. An investment fund (FIC) can pay more over time, but its value goes up and down, and it is not a deposit." },
  { h: "Fogafín: the safety net" },
  { p: "In Colombia, Fogafín (Fondo de Garantías de Instituciones Financieras) insures deposits in the banks and financial companies that are registered with it: savings accounts, checking accounts and CDTs. If one of those entities fails, Fogafín pays back each person up to a maximum amount per entity (for years it has been $50 million pesos — check the current amount on fogafin.gov.co). Investment funds and crypto platforms are NOT covered by this insurance." },
  { h: "Comparing beds · $1,000,000 for one year" },
  { node: <MiniTable key="t" head={["Where it sleeps", "Return (illustrative)", "Liquidity", "After 1 year", "With 5% inflation, it buys…"]} rows={[["🐷 Piggy bank", "0%", "Total", "$1,000,000", "≈ $952,000"], ["🏦 Savings account", "1% E.A.", "Total", "$1,010,000", "≈ $962,000"], ["📲 Digital 'cajita'", "8% E.A.", "Very high", "$1,080,000", "≈ $1,029,000"], ["📜 CDT 360 days", "10% E.A.", "Locked", "$1,100,000", "≈ $1,048,000"], ["📈 Investment fund", "−4% to +15%", "Days", "$960,000 – $1,150,000", "it depends"]]} /> },
  { p: "The rates in the table are examples: real rates change every month, so always check the current rate in the official app or website and write down the date. Notice the last column: only the products that pay MORE than inflation increase your purchasing power." },
  { h: "Example 1 · An emergency fund" },
  { p: "Camilo wants to keep $600,000 for emergencies. He needs liquidity: the money must be available today. A CDT is a bad bed for this goal because he can't withdraw. A high-yield digital account or 'cajita' at 8% E.A. is a good bed: available and paying more than a normal account." },
  { h: "Example 2 · A goal in exactly one year" },
  { p: "Laura is saving $2,000,000 to pay for a course in 12 months. She doesn't need the money before. A CDT at 10% E.A. gives her $200,000 more. The lock is not a problem because her date is fixed." },
  { h: "Example 3 · A goal in five years" },
  { p: "Andrés wants to help pay for his university in five years. He can accept that some years go badly. A diversified investment fund or ETF can make sense for part of his money, because time helps recover from falls. He keeps another part in safer beds." },
  { box: "💡 Minors: in Colombia, people under 18 usually open accounts WITH a parent or guardian. Many banks and digital entities offer youth accounts. Before opening one, check: fees (cuota de manejo), minimum balance, if it is supervised, and if it is covered by Fogafín." },
  { node: <Mistakes key="m" items={["Choosing the highest rate without checking liquidity.", "Thinking an investment fund is insured like a deposit.", "Forgetting inflation: 1% E.A. with 5% inflation is a loss of purchasing power."]} /> },
  { box: "📌 Summary: safety + liquidity + return · Fogafín insures deposits (not funds or crypto) · a different bed for each goal · beat inflation." },
];
const GLOSS_SLEEP = { "liquidity": "how fast you can use your money without losing part of it", "Fogafín": "Colombia's deposit insurance fund", "supervised": "controlled by the Superintendencia Financiera", "investment fund": "a pool of money invested in many assets; its value moves", "cajita": "a digital savings 'pocket' that pays interest", "youth accounts": "bank accounts designed for young people, usually with a guardian" };
const Q_SLEEP = [
  { q: "What are the three criteria to choose where money 'sleeps'?", options: ["Safety, liquidity and return.", "Brand, app design and branches.", "Price, popularity and color.", "Return, return and return."], correct: 0, feedback: "Safety, liquidity, return." },
  { q: "What does Fogafín insure?", options: ["Deposits in registered entities.", "Every type of investment, including funds.", "Only crypto platforms.", "Only accounts of adults."], correct: 0, feedback: "Savings, checking accounts and CDTs — not funds or crypto." },
  { q: "Why is a CDT a bad bed for an emergency fund?", options: ["The money is locked until the end.", "It pays less than a savings account.", "It is not supervised by anyone.", "Minors can't open a CDT."], correct: 0, feedback: "Emergencies need liquidity." },
  { q: "$1,000,000 at 10% E.A. with 5% inflation buys about…", options: ["About $1,048,000 of today's things.", "About $1,150,000 of today's things.", "About $950,000 of today's things.", "About $1,100,000 of today's things."], correct: 0, feedback: "1,100,000 ÷ 1.05 ≈ 1,048,000." },
  { q: "Which product matches a goal in exactly 12 months with no early use?", options: ["A CDT.", "A piggy bank.", "A crypto wallet.", "A stock fund."], correct: 0, feedback: "Fixed date + higher rate." },
  { q: "Why can a fund make sense for a 5-year goal?", options: ["Time helps recover from falls.", "Funds are insured by Fogafín.", "Funds guarantee their returns.", "Funds never lose value in 5 years."], correct: 0, feedback: "Longer horizon → more capacity to wait." },
  { q: "How do minors usually open an account in Colombia?", options: ["With a parent or guardian.", "Alone, with a photo of their school ID.", "They can't until they are 18.", "Only with a job contract."], correct: 0, feedback: "Youth accounts usually need a guardian." },
  { q: "Why should you write down the date when you check a rate?", options: ["Rates change over time.", "Banks require it by law.", "The rate expires that day.", "To get a better rate later."], correct: 0, feedback: "Today's rate may not be next month's." },
  { q: "A savings account pays 1% E.A. and inflation is 5%. Your purchasing power…", options: ["goes down.", "goes up 6%.", "stays the same.", "goes up 1%."], correct: 0, feedback: "Real return ≈ 1% − 5% = −4%." },
  { q: "Which is NOT covered by Fogafín?", options: ["An investment fund.", "A CDT in a registered bank.", "A savings account in a bank.", "A checking account in a bank."], correct: 0, feedback: "Funds are investments, not deposits." },
];

/* ---------- LECTURA · Too Good to Be True: the DMG Case (B2) ---------- */
const READ_DMG = [
  { p: "In 2008, in many towns of southern Colombia, people stood in long lines with their savings in cash. Some had sold their motorcycles, their cows or even their houses. They were not waiting to enter a bank. They were waiting to give their money to companies that promised to return it multiplied in a few weeks or months. Months later, many of them had lost everything." },
  { h: "What happened?" },
  { p: "One of the best-known companies was DMG, founded by David Murcia Guzmán. It sold prepaid cards that people could use in its stores, and it promised huge 'returns' that no real business could pay. Other organizations, like DRFE, simply received money and promised to multiply it. For a while, the first participants really received money — and they told their friends and families. In November 2008, the government intervened these companies and declared a social emergency because hundreds of thousands of people were affected. DMG's founder was later prosecuted and convicted, including in the United States for money laundering." },
  { h: "How a Ponzi or pyramid scheme works" },
  { p: "A Ponzi scheme pays 'returns' to old investors with the money of new investors. There is no real business producing those profits. While new money arrives, everything looks perfect. When new money slows down, the scheme collapses — and most people, especially the last ones to enter, lose their money." },
  { node: <MiniTable key="t" head={["Month", "New money in", "Paid to old investors", "What really exists"]} rows={[["1", "$10 million", "$0", "Promises"], ["2", "$30 million", "$10 million", "Promises"], ["3", "$60 million", "$35 million", "Promises"], ["4", "$20 million", "$60 million needed", "💥 Collapse"]]} /> },
  { h: "Example · Why 20% a month is impossible" },
  { p: "An offer of 20% per month sounds small. Let's calculate: (1.20)¹² − 1 ≈ 791% per year. A good CDT pays around 10% E.A.; the stock market has historically averaged around 7–10% per year in the long term, with bad years. No legal business can pay 791% per year for everybody. When the number is impossible, the business is probably fake." },
  { h: "The modern versions" },
  { p: "Today, the same idea appears with new clothes: crypto 'investment clubs', apps that pay you for inviting friends, 'trading gurus' on social media, or WhatsApp groups that show screenshots of winnings. Real cryptocurrencies are volatile, but they are not automatically scams. The red flags are about the PROMISE, not the technology." },
  { node: <div key="flags" className="g10-flags">{["💯 Guaranteed high returns", "⏰ Pressure: 'only today!'", "👥 You earn by inviting people", "🤫 No clear business or product", "🏛️ Not supervised by the Superintendencia Financiera", "🧾 You can't withdraw easily"].map((f) => <span key={f}>{f}</span>)}</div> },
  { box: "💡 Before investing, check: Is the company supervised (superfinanciera.gov.co)? How does it make money? Can I withdraw today? Is the return realistic compared with a CDT?" },
  { node: <Mistakes key="m" items={["Trusting because 'my cousin already received money' — early payments are part of the trick.", "Thinking 'it's crypto, so it's modern and safe'.", "Investing money you can't lose because of FOMO (fear of missing out)."]} /> },
  { box: "📌 Summary: Ponzi = old investors paid with new money · 20% monthly ≈ 791% a year = impossible · check supervision, business model and withdrawals." },
];
const GLOSS_DMG = { "Ponzi scheme": "a fraud that pays old investors with new investors' money", "pyramid": "a scheme where you earn mainly by recruiting people", "intervened": "taken under government control", "prosecuted": "taken to court for a crime", "FOMO": "fear of missing out", "red flags": "warning signs" };
const Q_DMG = [
  { q: "What did DMG and similar organizations promise?", options: ["Returns that no real business could pay.", "A normal rate, like a CDT in a bank.", "Houses and cars for every investor.", "Jobs in other countries."], correct: 0, feedback: "Impossible returns are the first red flag." },
  { q: "In a Ponzi scheme, where do the 'returns' come from?", options: ["From new investors' money.", "From a real, very profitable business.", "From government subsidies.", "From interest on bank deposits."], correct: 0, feedback: "Old investors are paid with new money." },
  { q: "Why did the first participants trust the scheme?", options: ["They really received money at the beginning.", "The Superintendencia approved the companies.", "Banks recommended the companies.", "The returns were guaranteed in a contract."], correct: 0, feedback: "Early payments create trust — and new victims." },
  { q: "When does a Ponzi scheme collapse?", options: ["When new money slows down.", "When it earns too much money.", "Exactly one year after it starts.", "When interest rates go up."], correct: 0, feedback: "Without new money, it can't pay old investors." },
  { q: "20% per month is about how much per year?", options: ["About 791%.", "About 240%.", "About 120%.", "About 2,000%."], correct: 0, feedback: "(1.20)¹² − 1 ≈ 7.91." },
  { q: "What did the government do in November 2008?", options: ["It intervened the companies.", "It gave the founders a prize.", "It invested public money in them.", "It did nothing for many years."], correct: 0, feedback: "It intervened and declared a social emergency." },
  { q: "According to the text, are cryptocurrencies scams?", options: ["Not automatically — check the promise.", "Yes, every cryptocurrency is a scam.", "No, crypto is always safe.", "Only stablecoins can be scams."], correct: 0, feedback: "Red flags are about the promise, not the technology." },
  { q: "Which is a red flag?", options: ["“You earn more if you invite friends.”", "“Returns are not guaranteed.”", "“You can withdraw any day.”", "“We are supervised by the Superfinanciera.”"], correct: 0, feedback: "Earning by recruiting is typical of pyramids." },
  { q: "Where can you check if a company is supervised in Colombia?", options: ["superfinanciera.gov.co.", "The company's Instagram comments.", "A WhatsApp group of investors.", "The company's own website."], correct: 0, feedback: "Official sources first." },
  { q: "What does FOMO mean?", options: ["Fear of missing out.", "Fund of money offers.", "Free online money order.", "Fast online market operations."], correct: 0, feedback: "Scammers use FOMO to make you rush." },
];

/* ---------- LECTURA · Is This Project Worth It? (VPN, TIR, recuperación) ---------- */
const READ_NPV = [
  { p: "Your uncle wants to invest $10,000,000. He has three options: a food cart, a motorcycle for deliveries, or a CDT. Each one gives money at different moments. How can he compare them? He needs the tools that companies use every day: net present value (NPV or VPN in Spanish), internal rate of return (IRR or TIR) and payback. Good news: you already know the secret ingredient — present value, from Period 2." },
  { h: "Step 1 · Cash flows" },
  { p: "A cash flow is the money that goes out (−) or comes in (+) in each period. Year 0 is today: usually the investment, a negative number. Then come the yearly profits." },
  { node: <MiniTable key="t" head={["Project", "Year 0", "Year 1", "Year 2", "Year 3"]} rows={[["🌮 Food cart", "−10,000,000", "+4,000,000", "+4,500,000", "+5,000,000"], ["🛵 Delivery motorbike", "−10,000,000", "+5,500,000", "+4,500,000", "+3,000,000 (+ sell the bike)"], ["📜 CDT 12%", "−10,000,000", "0", "0", "+14,049,280"]]} /> },
  { h: "Step 2 · NPV: bring everything to today" },
  { p: "The discount rate is your opportunity cost — here 12%, because that's what a CDT would pay. NPV = −investment + CF₁ ÷ 1.12 + CF₂ ÷ 1.12² + CF₃ ÷ 1.12³. For the food cart: −10,000,000 + 3,571,429 + 3,587,372 + 3,558,901 ≈ +$717,702. A positive NPV means the project creates value ABOVE what you would earn in the alternative. A negative NPV means you'd be better with the alternative." },
  { box: "💡 Decision rule: NPV > 0 → it creates value · NPV < 0 → it destroys value · between two projects, the higher NPV usually wins." },
  { h: "Example 2 · The motorbike" },
  { p: "−10,000,000 + 5,500,000 ÷ 1.12 + 4,500,000 ÷ 1.2544 + 3,000,000 ÷ 1.4049 ≈ −10,000,000 + 4,910,714 + 3,587,372 + 2,135,341 = +$633,427. It's also positive, but a little lower than the food cart — even though it gives more money in year 1." },
  { h: "Example 3 · The CDT" },
  { p: "The CDT pays exactly 12% per year: 10,000,000 × 1.12³ = 14,049,280. Discounted at 12%, its NPV is exactly $0. That makes sense: the CDT IS the alternative. Projects must beat it to be worth the extra risk and work." },
  { h: "IRR and payback" },
  { p: "The IRR is the rate that makes NPV = 0 — the project's own 'interest rate'. The food cart's IRR is about 16.0% and the motorbike's about 16.1%: both beat 12%. (Notice: the motorbike has a slightly higher IRR but a lower NPV — when they disagree, companies usually trust the NPV.) Payback is how long it takes to recover the investment: the food cart recovers the 10 million during year 3 (4 + 4.5 = 8.5 after two years), and the motorbike exactly at the end of year 2 (5.5 + 4.5 = 10). Payback is easy to understand, but it ignores what happens after." },
  { node: <Mistakes key="m" items={["Adding cash flows without discounting them (money in year 3 is worth less today).", "Choosing only by payback — a fast project can create less value.", "Forgetting risk: projected flows are estimates, not promises."]} /> },
  { box: "📌 Summary: cash flows → discount at your opportunity rate → NPV > 0 creates value · IRR > your rate = good · payback = time to recover." },
];
const GLOSS_NPV = { "cash flow": "money that goes out (−) or comes in (+) in a period", "net present value": "the sum of all cash flows brought to today (NPV / VPN)", "discount rate": "the rate used to bring future money to today; your opportunity cost", "internal rate of return": "the rate that makes NPV equal to zero (IRR / TIR)", "payback": "the time it takes to recover the investment" };
const Q_NPV = [
  { q: "What does a positive NPV mean?", options: ["It creates value above the alternative.", "The project can never lose money.", "The project needs a loan to start.", "The project pays back in one year."], correct: 0, feedback: "NPV > 0 → better than your opportunity rate." },
  { q: "Which discount rate did the reading use, and why?", options: ["12%, the CDT's rate (opportunity cost).", "5%, the inflation rate of the year.", "0%, because money keeps its value.", "16%, the IRR of the food cart."], correct: 0, feedback: "Your alternative return." },
  { q: "Why is the CDT's NPV exactly $0?", options: ["It IS the alternative: it pays exactly 12%.", "CDTs give no return after three years.", "It's a mistake in the calculation.", "Its return equals inflation, so it's zero."], correct: 0, feedback: "Discounting 12% at 12% gives zero." },
  { q: "What is the IRR?", options: ["The rate that makes NPV = 0.", "The rate a bank charges for a loan.", "The years it takes to recover the money.", "The inflation rate of the project."], correct: 0, feedback: "The project's own return." },
  { q: "The food cart's IRR (~16%) is above 12%. This means…", options: ["It beats the alternative.", "It loses money vs. the CDT.", "It's equal to the CDT.", "It has no risk at all."], correct: 0, feedback: "IRR > discount rate ↔ NPV > 0." },
  { q: "What is a weakness of payback?", options: ["It ignores what happens after recovery.", "It is too hard to calculate.", "It uses a discount rate.", "It only works for big companies."], correct: 0, feedback: "A fast payback can still create less value." },
  { q: "$4,000,000 in year 1 at 12% is worth today…", options: ["About $3,571,429.", "Exactly $4,480,000.", "About $3,520,000.", "Exactly $4,000,000."], correct: 0, feedback: "4,000,000 ÷ 1.12." },
  { q: "Why can't you just add the cash flows?", options: ["Future money is worth less today.", "Banks don't allow it in a table.", "The numbers are too big to add.", "Taxes change every year."], correct: 0, feedback: "Time value of money." },
];

/* ---------- EXPLAINER · NAV, P&L y ROI ---------- */
const BRIEF_PNL = [
  { p: "A portfolio manager must answer three questions every week: How much is my portfolio worth today? How much did I win or lose? Was it a good return? Three words answer them: NAV, P&L and ROI." },
  { h: "NAV · Net Asset Value" },
  { p: "NAV = the value of everything you own today (units × price) − what you owe. Example 1: you have 2 units of an ETF at $210, 10 stablecoins at $1 and $300 in a bond fund: NAV = 420 + 10 + 300 = $730." },
  { h: "P&L · Profit and Loss" },
  { p: "P&L = NAV today − money you invested. Realized P&L is what you won or lost on things you already SOLD; unrealized P&L is on things you still hold. Example 2: you invested $1,000 and your NAV is $1,084 → P&L = +$84 (green). If your NAV is $930 → P&L = −$70 (red)." },
  { h: "ROI · Return on Investment" },
  { p: "ROI = P&L ÷ money invested × 100. Example 3: +$84 ÷ $1,000 = +8.4%. Two investors can have the same P&L but different ROI: $84 on $1,000 (8.4%) is much better than $84 on $10,000 (0.84%)." },
  { node: <MiniTable key="t" head={["Investor", "Invested", "NAV", "P&L", "ROI"]} rows={[["Ana", "$1,000", "$1,084", "+$84", "+8.4%"], ["Leo", "$10,000", "$10,084", "+$84", "+0.84%"], ["Sam", "$1,000", "$930", "−$70", "−7.0%"]]} /> },
  { box: "💡 Fees reduce your NAV. A 2% yearly fee on $1,000 = $20 less every year, even when the market goes down." },
  { node: <Mistakes key="m" items={["Comparing P&L in dollars instead of ROI in %.", "Forgetting fees and the spread when you buy and sell.", "Celebrating an unrealized gain as if it were money in your pocket."]} /> },
];
const GLOSS_PNL = { "NAV": "net asset value: what your portfolio is worth today", "P&L": "profit and loss: NAV − money invested", "ROI": "return on investment: P&L ÷ invested × 100", "unrealized": "a gain or loss on something you haven't sold yet", "realized": "a gain or loss on something you already sold" };
const Q_PNL = [
  { q: "2 ETF units at $210 + $300 in bonds. NAV?", options: ["$720.", "$510.", "$630.", "$420."], correct: 0, feedback: "420 + 300." },
  { q: "Invested $1,000, NAV $930. P&L?", options: ["−$70.", "+$930.", "+$70.", "−$930."], correct: 0, feedback: "930 − 1,000." },
  { q: "P&L +$84 on $1,000. ROI?", options: ["+8.4%.", "+84%.", "+0.84%.", "+16.8%."], correct: 0, feedback: "84 ÷ 1,000 × 100." },
  { q: "Why compare ROI instead of P&L?", options: ["It considers how much each one invested.", "P&L is always negative and ROI positive.", "ROI is in dollars and P&L in percent.", "ROI includes all the fees automatically."], correct: 0, feedback: "Same $84 on very different investments." },
  { q: "What is an unrealized gain?", options: ["A gain on something you still hold.", "Money you received after selling.", "A gain that doesn't count for taxes.", "A gain from a fake investment."], correct: 0, feedback: "It can disappear if the price falls." },
  { q: "How do fees affect NAV?", options: ["They reduce it every year.", "They increase it every year.", "They have no effect on it.", "They reduce it only in bad years."], correct: 0, feedback: "Fees are charged in good and bad years." },
];

/* ---------- BOSS P3 · 5 misiones + 10 preguntas ---------- */
const BOSS3_MISSIONS = [
  { tag: "📊 ROI", q: "You invested US$1,000. Your NAV is US$1,065. ROI in %?", answer: 6.5, unit: "%", tol: 0.05, hint: "(1,065 − 1,000) ÷ 1,000 × 100", explain: "+6.5%." },
  { tag: "💵 Spread", q: "A house sells dollars at $4,180 and buys at $4,020. Spread per dollar?", answer: 160, money: true, hint: "4,180 − 4,020", explain: "$160 per dollar." },
  { tag: "🫧 Real return", q: "A CDT pays 10% and inflation is 6%. Real return (approx.)?", answer: 4, unit: "%", tol: 0.2, hint: "rate − inflation", explain: "≈ 4%." },
  { tag: "🧮 NPV", q: "Invest $1,000,000 today, receive $1,210,000 in 2 years. Discount rate 10%. NPV?", answer: 0, money: true, tol: 100, hint: "1,210,000 ÷ 1.21 − 1,000,000", explain: "Exactly $0: the project just equals the alternative." },
  { tag: "🚩 Scam", q: "Which offer has the most red flags?", options: ["“20% monthly, guaranteed — invite friends!”", "“A diversified ETF; you can sell any day.”", "“A CDT at 10% E.A. in a supervised bank.”", "“A fund with a 2% fee; returns vary.”"], correct: 0, explain: "Guaranteed high returns + recruiting = Ponzi signals." },
];
const BOSS3_Q = [
  { t: "Risk & profile", q: "Higher expected return usually means…", options: ["higher risk.", "lower risk.", "no risk.", "guaranteed profit."], correct: 0, feedback: "No reward without risk." },
  { t: "Risk & profile", q: "A conservative investor with a goal in 6 months should prefer…", options: ["safe, liquid products.", "one tech stock that can double.", "a mix of crypto coins.", "a five-year stock fund."], correct: 0, feedback: "Short horizon + low tolerance = safety and liquidity." },
  { t: "Where money lives", q: "Which product is insured by Fogafín?", options: ["A CDT in a registered bank.", "A famous investment fund.", "Bitcoin in an exchange.", "A stablecoin like USDC."], correct: 0, feedback: "Deposits, not investments." },
  { t: "Dollar & hedging", q: "You need US$1,000 in a year and fear devaluation. A hedge could be…", options: ["buying part of the dollars now.", "waiting and buying all at the airport.", "buying bitcoin instead of dollars.", "keeping all the money in pesos."], correct: 0, feedback: "Buying gradually reduces the risk of a big jump." },
  { t: "Dollar & hedging", q: "The peso devalues. Your Colombian ETF in pesos, measured in USD…", options: ["falls.", "rises.", "stays the same.", "doubles."], correct: 0, feedback: "Same pesos = fewer dollars." },
  { t: "Stocks & ETFs", q: "Why does an ETF reduce risk?", options: ["It holds many companies.", "The government insures it.", "It works like a deposit.", "Its price never falls."], correct: 0, feedback: "One bankruptcy hurts a little, not everything." },
  { t: "Stocks & ETFs", q: "A share costs $500. With $50 you can buy…", options: ["0.1 shares (a fraction).", "Nothing: you need a full share.", "10 shares.", "1 share, with a discount."], correct: 0, feedback: "Fractional shares: 50 ÷ 500." },
  { t: "Crypto & scams", q: "A stablecoin…", options: ["tries to keep a 1:1 value with an asset.", "is guaranteed by every government.", "always goes up a little every year.", "is always a Ponzi scheme."], correct: 0, feedback: "Stable is the goal, not a guarantee." },
  { t: "Projects", q: "A project has NPV = −$200,000 at 12%. Decision?", options: ["Reject it: the alternative is better.", "Accept it: negative NPV means it's safe.", "Accept it if the payback is short.", "Double the investment to fix it."], correct: 0, feedback: "NPV < 0 destroys value." },
  { t: "Projects", q: "The IRR of a project is 9% and your alternative pays 12%.", options: ["The project is worse than the alternative.", "The project is better: it's a real business.", "They are equal, both are close to 10%.", "You can't know without the payback."], correct: 0, feedback: "IRR < discount rate ↔ NPV < 0." },
];
const BOSS3_TIPS = { "Risk & profile": "Rewatch Risk & Return and check your Investor DNA.", "Where money lives": "Reread Where Does Your Money Sleep? — safety, liquidity, return and Fogafín.", "Dollar & hedging": "Replay the Dollar Storm and the Miami listening.", "Stocks & ETFs": "Rewatch WTF Is an ETF? and replay Wall Street Tycoon.", "Crypto & scams": "Reread the DMG case and replay Scam City.", Projects: "Reread Is This Project Worth It? and replay the Business Judge." };

/* =====================================================================
   10° · PERIODO 3 · GLOBAL INVESTOR — JUEGOS
   GLOBAL ASSET ALLOCATION LAB: US$1,000 simulados · 6 activos · Market Weeks 1–5.
   ===================================================================== */
const W_COND_RISK = { l: "If… (risk)", re: /\bif\b[^.]*\b(will|would|'ll|might|could)\b/i, ex: "If the market falls, I will…" };
const W_SUPER = { l: "Use a superlative", re: /\b(the (best|worst|safest|most|least|highest|lowest|fastest|biggest|smallest)|[a-z]+est)\b/i, ex: "the safest · the best · the most liquid" };
const W_PASSIVE = { l: "Use the passive", re: /\b(is|are|was|were|be|been|being) (?:not )?[a-z]+(ed|en|wn|ld|nt|ught)\b/i, ex: "risk is reduced · money is spread" };
const W_CAUSE = { l: "Cause and effect", re: /\b(because|so|as a result|that's why|therefore|caused|made)\b/i, ex: "because · so · as a result" };
const ASSETS10 = [
  { k: "bond", e: "🧱", l: "US bond fund", d: "low risk · ~4% a year", risk: 1, exp: 4, c: "#1b4a33" },
  { k: "sp", e: "📈", l: "S&P 500 ETF", d: "500 US companies", risk: 3, exp: 9, c: "#16b074" },
  { k: "col", e: "🇨🇴", l: "Colombia ETF (pesos)", d: "moves with the peso too", risk: 4, exp: 10, c: "#f5b23e" },
  { k: "tech", e: "🚀", l: "NovaTech (one stock)", d: "fictional tech company", risk: 5, exp: 14, c: "#ff6b57" },
  { k: "usdc", e: "🪙", l: "Stablecoin (USDC)", d: "1:1 with the dollar · 0%", risk: 2, exp: 0, c: "#9aa5a0" },
  { k: "btc", e: "₿", l: "Bitcoin", d: "very volatile", risk: 5, exp: 15, c: "#e07a2f" },
];
const SAMPLE_ALLOC = { bond: 30, sp: 30, col: 10, tech: 10, usdc: 10, btc: 10 };
const MWEEKS = [
  { n: 1, key: "c2_week1", e: "🌤️", news: "Calm week: US companies report good earnings.", r: { bond: 0.2, sp: 1.5, col: 0.8, tech: 4, usdc: 0, btc: 6 }, q: { q: "Why did most assets go up this week?", options: ["Good company earnings made investors optimistic.", "The government gave dollars to every investor.", "Bitcoin went up, so everything went up.", "Interest rates went up a lot this week."], correct: 0, explain: "Good news about profits → higher prices." } },
  { n: 2, key: "c3_week2", e: "💱", news: "The Colombian peso devalues 6% against the dollar.", r: { bond: 0.2, sp: 0.5, col: -5, tech: -2, usdc: 0, btc: -3 }, q: { q: "Why did the Colombia ETF fall in DOLLARS?", options: ["Its pesos are now worth fewer dollars.", "Colombian companies closed this week.", "Colombian companies sold less this week.", "The ETF paid a big dividend this week."], correct: 0, explain: "Same pesos ÷ a more expensive dollar = fewer dollars. Holding USD assets is a hedge." } },
  { n: 3, key: "c4_week3", e: "🚨", news: "Scandal: NovaTech hid losses. Its stock collapses.", r: { bond: 0.3, sp: -1.2, col: 0.5, tech: -38, usdc: 0, btc: 4 }, q: { q: "Why did the S&P 500 ETF fall only a little?", options: ["One company is a tiny part of 500.", "The government protects ETFs from scandals.", "The other companies also hid losses.", "NovaTech isn't part of the S&P 500."], correct: 0, explain: "Diversification: one disaster, a small impact." } },
  { n: 4, key: "c5_week4", e: "📉", news: "Crypto crash: a big crypto exchange fails.", r: { bond: 0.2, sp: 1, col: 1, tech: 3, usdc: 0, btc: -28 }, q: { q: "What happened to the stablecoin in this scenario?", options: ["It kept its 1:1 value.", "It lost 28%, like bitcoin.", "It went up 28% as people ran to it.", "It lost about half of bitcoin's fall."], correct: 0, explain: "In this scenario USDC held its peg — but stablecoins still carry issuer and platform risk." } },
  { n: 5, key: "c6_week5", e: "🌪️", news: "Global shock: fear everywhere, markets fall hard.", r: { bond: 1, sp: -9, col: -12, tech: -15, usdc: 0, btc: -10 }, rec: { bond: 0.2, sp: 6, col: 5, tech: 8, usdc: 0, btc: 7 }, q: { q: "What did investors who sold during the panic miss?", options: ["The recovery that came next.", "Nothing, selling protected their money.", "A special bonus for long-term investors.", "Lower fees for buying again later."], correct: 0, explain: "Panic selling locks in losses; the market often recovers (not always!)." } },
];
const applyR = (h, r) => Object.fromEntries(Object.entries(h).map(([k, v]) => [k, r2(v * (1 + (r[k] || 0) / 100))]));
const sumH = (h) => r2(Object.values(h).reduce((a, v) => a + v, 0));
const portOf = (r) => {
  const a = r?.c1_allocate?.alloc; const alloc = a || SAMPLE_ALLOC;
  let h = Object.fromEntries(ASSETS10.map((x) => [x.k, (alloc[x.k] || 0) * 10]));
  const hist = [{ l: "Start", v: 1000 }]; let done = 0;
  MWEEKS.forEach((w) => {
    if (!r?.[w.key]) return; done++;
    h = applyR(h, w.r);
    if (w.rec) { const d = r[w.key].decision; const tot = sumH(h); if (d === "sell") h = { ...Object.fromEntries(ASSETS10.map((x) => [x.k, 0])), bond: tot }; if (d === "rebalance") h = Object.fromEntries(ASSETS10.map((x) => [x.k, r2((tot * (alloc[x.k] || 0)) / 100)])); h = applyR(h, w.rec); }
    hist.push({ l: `W${w.n}`, v: sumH(h) });
  });
  const nav = sumH(h);
  return { h, hist, nav, pnl: r2(nav - 1000), roi: r2((nav - 1000) / 10), alloc, sample: !a, done };
};
const riskOf = (al) => r2(ASSETS10.reduce((s, x) => s + ((al[x.k] || 0) / 100) * x.risk, 0));
const expOf = (al) => r2(ASSETS10.reduce((s, x) => s + ((al[x.k] || 0) / 100) * x.exp, 0));
const PROFILES = { con: { l: "Conservative 🛡️", d: "You prefer safety. Your risk level should be about 1.0–2.2.", lo: 1, hi: 2.2 }, mod: { l: "Moderate ⚖️", d: "You accept some ups and downs for more growth: risk about 2.2–3.4.", lo: 2.2, hi: 3.4 }, agg: { l: "Aggressive 🚀", d: "You accept big swings for higher expected returns: risk about 3.2–4.5.", lo: 3.2, hi: 4.5 } };
const usd0 = (n) => usd(Math.round(n * 100) / 100);

/* ---------- C1 · Investor DNA ---------- */
const DNA_Q = [
  { q: "Your investment falls 15% in one week. What do you do?", o: ["Sell everything now.", "Investigate what happened.", "Keep my plan.", "Buy more — it's on sale."], s: [0, 1, 2, 3] },
  { q: "When will you need this money?", o: ["In less than 1 year.", "In 1–3 years.", "In 3–5 years.", "In more than 5 years."], s: [0, 1, 2, 3] },
  { q: "Which investment would you choose?", o: ["+4% sure.", "Between +1% and +8%.", "Between −5% and +15%.", "Between −30% and +50%."], s: [0, 1, 2, 3] },
  { q: "If you lose 20% of your savings, how would you feel?", o: ["Terrible, I can't sleep.", "Very worried.", "Uncomfortable but OK.", "Calm: it will recover."], s: [0, 1, 2, 3] },
  { q: "How much do you know about investing?", o: ["Almost nothing.", "A little.", "The basics.", "Quite a lot."], s: [0, 1, 2, 3] },
  { q: "Do other people depend on this money?", o: ["Yes, completely.", "Yes, a little.", "Not really.", "No."], s: [0, 1, 2, 3] },
];
function InvestorDNA({ existing, onSave, onExit }) {
  const [cur, setCur] = useState(0);
  const [ans, setAns] = useState({});
  const [done, setDone] = useState(!!existing?.profile);
  const [st, finish] = useFinish(onSave);
  const score = DNA_Q.reduce((a, q, i) => a + (ans[i] != null ? q.s[ans[i]] : 0), 0);
  const prof = existing?.profile && !Object.keys(ans).length ? existing.profile : score <= 6 ? "con" : score <= 12 ? "mod" : "agg";
  if (st.done) return <Reward title={`You are ${PROFILES[prof].l}`} subtitle="Your profile guides your $1,000 allocation." coins={st.coins} saving={st.saving} onExit={onExit} />;
  if (!done) {
    const q = DNA_Q[cur];
    return (
      <div className="s1-quiz">
        <div className="quiz-top"><h2>🧬 Investor DNA</h2><span className="quiz-count">{cur + 1} / {DNA_Q.length}</span></div>
        <div className="quiz-track"><i style={{ width: `${((cur + (ans[cur] != null ? 1 : 0)) / DNA_Q.length) * 100}%` }} /></div>
        {cur === 0 && <Brief91 k="c1_dna" />}
        <p className="quiz-q">{q.q}</p>
        <div className="quiz-options">{q.o.map((o, k) => <button key={k} type="button" className={`quiz-opt ${ans[cur] === k ? "correct" : ""}`} onClick={() => setAns({ ...ans, [cur]: k })}><span className="opt-key">{"ABCD"[k]}</span><span className="opt-text">{o}</span></button>)}</div>
        <div className="quiz-nav"><button className="s1-btn ghost" onClick={() => (cur > 0 ? setCur(cur - 1) : onExit())}>{cur > 0 ? "Back" : "Exit"}</button><button className="s1-btn primary" disabled={ans[cur] == null} onClick={() => (cur < DNA_Q.length - 1 ? setCur(cur + 1) : setDone(true))}>{cur < DNA_Q.length - 1 ? "Next" : "See my DNA 🧬"} <ChevronRight size={18} /></button></div>
      </div>
    );
  }
  const P = PROFILES[prof];
  return (
    <ActShell icon={<Brain size={22} strokeWidth={2.1} />} title="My Investor DNA 🧬" subtitle="Need, ability and willingness to take risk." onExit={onExit}>
      <div className="g10-dna"><em>{P.l.split(" ").pop()}</em><div><small>MY INVESTOR PROFILE</small><b>{P.l}</b><p>{P.d}</p></div></div>
      <div className="g10-scale">{Object.entries(PROFILES).map(([k, p]) => <span key={k} className={k === prof ? "on" : ""}>{p.l}</span>)}</div>
      <p className="start-tip">💡 Your profile is not good or bad. A 16-year-old with a 10-year goal can take more risk than someone who needs the money next month.</p>
      <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(25, { profile: prof, score: existing?.score ?? score, answers: ans })}>Save my DNA <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
    </ActShell>
  );
}

/* ---------- C1 · Allocate $1,000 · Page 13 ---------- */
function AllocateLab({ resp, existing, onSave, onExit }) {
  const prof = resp?.c1_dna?.profile || "mod";
  const P = PROFILES[prof];
  const [al, setAl] = useState(existing?.alloc || { bond: 0, sp: 0, col: 0, tech: 0, usdc: 0, btc: 0 });
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const sum = Object.values(al).reduce((a, v) => a + v, 0);
  const risk = riskOf(al), exp = expOf(al);
  const coherent = risk >= P.lo - 0.05 && risk <= P.hi + 0.05;
  const maxOne = Math.max(...Object.values(al));
  const G = [W_COND_RISK, W_REASON];
  const ok = sum === 100 && maxOne <= 60 && goalsOk(text, 30, 80, G);
  if (st.done) return <Reward title="Portfolio launched! 🚀" subtitle={`US$1,000 · risk ${risk}/5 · expected ~${exp}% a year`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<PieChart size={22} strokeWidth={2.1} />} title="Global Asset Allocation Lab · Allocate US$1,000 🌍 · Page 13" subtitle="THE BIG PROJECT starts: your simulated portfolio lives for 5 Market Weeks." onExit={onExit}>
      <Brief91 k="c1_allocate" />
      <FPBadge n={13} t="My investor profile" e="🧬" />
      {!resp?.c1_dna && <div className="p1-banner bad"><span>Do Investor DNA first. For now we use a moderate profile.</span></div>}
      <div className="g10-dna small"><em>{P.l.split(" ").pop()}</em><div><small>MY PROFILE</small><b>{P.l}</b><p>Target risk: {P.lo}–{P.hi}</p></div></div>
      <AllocBars items={ASSETS10} vals={al} set={setAl} step={5} />
      <div className="g10-two">
        <div className="start-block">
          <Gauge91 label="Portfolio risk (1–5)" value={risk} max={5} unit="" target={P.hi} targetLabel="your max" good={coherent} />
          <Gauge91 label="Expected return per year (illustrative)" value={exp} max={15} unit="%" />
          <div className="g91-mini"><span className={coherent ? "pos" : "neg"}>Coherent with my profile <b>{coherent ? "✓" : "✗"}</b></span><span className={maxOne <= 60 ? "pos" : "neg"}>No asset above 60% <b>{maxOne <= 60 ? "✓" : "✗"}</b></span></div>
        </div>
        <div className="start-block"><h3>🥧 My mix</h3><PctBar parts={ASSETS10.map((x) => ({ label: x.l, value: al[x.k] || 0, color: x.c }))} /></div>
      </div>
      <div className="start-block"><h3>✍️ Page 13 · My investor profile</h3><Starters items={["I am a … investor because…", "If the market falls, I will…", "I chose … because…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="I am a moderate investor because… If the market falls, I will…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30 + (coherent ? 6 : 0), { alloc: al, risk, exp, profile: prof, coherent, text })}>{sum !== 100 ? `Assign 100% (${sum}%)` : "Launch my portfolio"} <span className="coin-tag"><Coins size={15} /> +{30 + (coherent ? 6 : 0)}</span></button></div>
    </ActShell>
  );
}

/* ---------- Market Week 1–5 ---------- */
function MarketWeek({ n, resp, existing, onSave, onExit }) {
  const w = MWEEKS[n - 1];
  const before = portOf(resp);
  const [open, setOpen] = useState(false);
  const [dec, setDec] = useState(null);
  const [okQ, setOkQ] = useState(false);
  const [st, finish] = useFinish(onSave);
  const prevDone = MWEEKS.slice(0, n - 1).every((x) => resp?.[x.key]);
  const after = portOf({ ...resp, [w.key]: { decision: dec || "hold" } });
  const shock = w.rec ? applyR(before.h, w.r) : null;
  if (st.done) return <Reward title={`Market Week ${n} closed! 📊`} subtitle={`NAV ${usd0(after.nav)} · ROI ${pctTxt(after.roi)}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Activity size={22} strokeWidth={2.1} />} title={`Market Week ${n} ${w.e}`} subtitle="Global Asset Allocation Lab · illustrative scenario (the same for everybody)." onExit={onExit}>
      <Brief91 k={w.key} />
      {before.sample && <div className="p1-banner bad"><span>You haven't allocated your US$1,000 yet (Class 1). You're watching a sample portfolio.</span></div>}
      {!prevDone && <div className="p1-banner"><span>💡 You skipped an earlier Market Week. Your NAV only includes the weeks you opened.</span></div>}
      <div className="g10-news"><small>📰 MARKET NEWS · WEEK {n}</small><b>{w.news}</b></div>
      {!open ? (
        <>
          <div className="g10-hold">{ASSETS10.map((x) => <div key={x.k} style={{ "--c": x.c }}><em>{x.e}</em><span>{x.l}</span><b>{usd0(before.h[x.k])}</b></div>)}</div>
          <div className="g91-mini"><span>NAV before <b>{usd0(before.nav)}</b></span></div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => setOpen(true)}>Open the market 🔔</button></div>
        </>
      ) : (
        <>
          <MiniTable head={["Asset", "Before", "Change", w.rec ? "After the shock" : "After"]} rows={ASSETS10.map((x) => [`${x.e} ${x.l}`, usd0(before.h[x.k]), pctTxt(w.r[x.k], 1), usd0((shock || after.h)[x.k])])} foot={["NAV", usd0(before.nav), "", usd0(shock ? sumH(shock) : after.nav)]} />
          {w.rec && (
            <div className="start-block g10-boss">
              <h3>😱 Your portfolio fell to {usd0(sumH(shock))}. What do you do?</h3>
              <div className="g10-ab four">{[["hold", "🧘", "Hold", "keep everything"], ["sell", "🏃", "Sell all", "move to bonds"], ["rebalance", "⚖️", "Rebalance", "back to my %"]].map(([k, e, t, d]) => <button key={k} type="button" disabled={!!dec} className={dec === k ? "on" : ""} onClick={() => setDec(k)}><em>{e}</em><b>{t}</b><span>{d}</span></button>)}</div>
              {dec && <div className={`p1-banner ${dec === "sell" ? "bad" : "good"}`}><span>Next week the market recovers (sp +6%, Colombia +5%, NovaTech +8%, bitcoin +7%). Your NAV: <b>{usd0(after.nav)}</b>. {dec === "sell" ? "You sold at the bottom and missed most of the recovery." : dec === "rebalance" ? "You bought more of what fell — disciplined investing!" : "You stayed on the roller coaster and rode the recovery."}</span></div>}
            </div>
          )}
          {(!w.rec || dec) && (
            <>
              <ChartCard title="My portfolio (NAV) week by week"><LineChart labels={after.hist.map((x) => x.l)} series={[{ name: "NAV", values: after.hist.map((x) => x.v), color: after.nav >= 1000 ? "#16b074" : "#ff6b57" }]} money={false} unit="" /></ChartCard>
              <div className="g91-mini"><span className={after.pnl >= 0 ? "pos" : "neg"}>P&L <b>{after.pnl >= 0 ? "+" : ""}{usd0(after.pnl)}</b></span><span className={after.roi >= 0 ? "pos" : "neg"}>ROI <b>{pctTxt(after.roi)}</b></span></div>
              <PickOne q={w.q.q} options={w.q.options} correct={w.q.correct} explain={w.q.explain} onRight={() => setOkQ(true)} />
            </>
          )}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!okQ} onClick={() => finish(20 + (dec && dec !== "sell" ? 5 : 0), { decision: dec || null, nav: after.nav, roi: after.roi })}>Close Market Week {n} <span className="coin-tag"><Coins size={15} /> +{20 + (dec && dec !== "sell" ? 5 : 0)}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C2 · Bank Builder · Page 14 ---------- */
const BB_PROD = [
  { k: "piggy", e: "🐷", l: "Piggy bank", rate: 0, liq: 3, safe: 1 },
  { k: "acc", e: "🏦", l: "Savings account", rate: 1, liq: 3, safe: 3 },
  { k: "cajita", e: "📲", l: "Digital cajita", rate: 8, liq: 3, safe: 3 },
  { k: "cdt", e: "📜", l: "CDT 1 year", rate: 10, liq: 0, safe: 3 },
  { k: "fund", e: "📈", l: "Investment fund", rate: 9, liq: 2, safe: 1 },
];
const BB_GOALS = [
  { k: "emerg", e: "🚑", l: "Emergency fund · $600,000", d: "Must be available ANY day.", best: ["cajita", "acc"], ok: [] },
  { k: "trip", e: "✈️", l: "School trip in 12 months · $2,000,000", d: "A fixed date. You won't touch it before.", best: ["cdt"], ok: ["cajita"] },
  { k: "uni", e: "🎓", l: "University in 5 years · $3,000,000", d: "Long horizon. Some bad years are OK.", best: ["fund"], ok: ["cdt"] },
];
function BankBuilder({ existing, onSave, onExit }) {
  const [pick, setPick] = useState(existing?.picks || {});
  const [twist, setTwist] = useState(false);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const all = BB_GOALS.every((g) => pick[g.k]);
  const score = BB_GOALS.reduce((a, g) => a + (g.best.includes(pick[g.k]) ? 2 : g.ok.includes(pick[g.k]) ? 1 : 0), 0);
  const emerOk = ["cajita", "acc"].includes(pick.emerg);
  const G = [W_SUPER, W_REASON];
  if (st.done) return <Reward title="Your personal bank is built! 🏗️" subtitle={`Fit score ${score}/6`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Building2 size={22} strokeWidth={2.1} />} title="Bank Builder 🏗️ · Page 14" subtitle="Three goals, five products. Give each goal the right 'bed' for its money." onExit={onExit}>
      <Brief91 k="c2_bank" />
      <FPBadge n={14} t="My safe base" e="🏗️" />
      <MiniTable head={["Product", "Rate (illustrative)", "Liquidity", "Safety"]} rows={BB_PROD.map((p) => [`${p.e} ${p.l}`, `${p.rate}% E.A.`, "●".repeat(p.liq) + "○".repeat(3 - p.liq), "●".repeat(p.safe) + "○".repeat(3 - p.safe)])} />
      {BB_GOALS.map((g) => (
        <div key={g.k} className="start-block">
          <div className="g10-event-head"><em>{g.e}</em><div><b>{g.l}</b><p>{g.d}</p></div></div>
          <div className="g10-chips">{BB_PROD.map((p) => <button key={p.k} type="button" className={pick[g.k] === p.k ? "on" : ""} onClick={() => { setPick({ ...pick, [g.k]: p.k }); setTwist(false); }}>{p.e} {p.l}</button>)}</div>
          {pick[g.k] && <p className={`g91-note ${g.best.includes(pick[g.k]) ? "pos" : g.ok.includes(pick[g.k]) ? "" : "neg"}`}>{g.best.includes(pick[g.k]) ? "✅ Great match." : g.ok.includes(pick[g.k]) ? "🙂 It works, but there is a better bed." : "❌ Risky or wrong liquidity for this goal."}</p>}
        </div>
      ))}
      {all && !twist && <div className="start-foot"><button className="s1-btn ghost big" onClick={() => setTwist(true)}>🚨 Something happens…</button></div>}
      {twist && <div className={`p1-banner ${emerOk ? "good" : "bad"}`}><span>🚑 Your dog needs surgery: $500,000 TODAY. {emerOk ? "Your emergency money was liquid — paid in 1 minute!" : "Your emergency money was in a place you can't use today (or it could be stolen/fell in value). Change it!"}</span></div>}
      <div className="start-block"><h3>✍️ Page 14 · My safe base (superlatives)</h3><Starters items={["The safest place for… is…", "The best option for my trip is… because…", "The most liquid…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="The safest place for my emergency fund is… because…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!all || !twist || !emerOk || !goalsOk(text, 30, 80, G)} onClick={() => finish(22 + score * 2, { picks: pick, score, text })}>Save Page 14 <span className="coin-tag"><Coins size={15} /> +{22 + score * 2}</span></button></div>
    </ActShell>
  );
}
const REAL_R = [
  { tag: "Real return", q: "A cajita pays 8% E.A. Inflation is 5%. Real return (approx.)?", answer: 3, unit: "%", tol: 0.2, hint: "8 − 5", explain: "≈ 3% more purchasing power." },
  { tag: "Real return", q: "A savings account pays 1%. Inflation is 5%. Real return?", answer: -4, unit: "%", tol: 0.2, hint: "1 − 5", explain: "≈ −4%: you lose purchasing power." },
  { tag: "Exact formula", q: "Exact real return: (1.10 ÷ 1.05) − 1 = ?% (1 decimal)", answer: 4.8, unit: "%", tol: 0.1, hint: "1.10 ÷ 1.05", explain: "4.76% ≈ 4.8% (the shortcut said 5%)." },
  { tag: "$", q: "$1,000,000 in a CDT at 10% for 1 year, inflation 5%. In today's money it buys about…", answer: 1047619, money: true, tol: 2000, hint: "1,100,000 ÷ 1.05", explain: "≈ $1,047,619." },
  { tag: "Decide", q: "Which beats 6% inflation?", options: ["A CDT at 10% E.A.", "A savings account at 1% E.A.", "A CDT at 5% E.A.", "A piggy bank."], correct: 0, explain: "Only returns above inflation grow purchasing power." },
];

/* ---------- C3 · The Dollar Storm (cobertura) ---------- */
const STORM_S = [{ k: "dev", e: "🌪️", l: "Peso devalues: TRM $4,600", trm: 4600 }, { k: "same", e: "🌤️", l: "Stable: TRM $4,000", trm: 4000 }, { k: "rev", e: "☀️", l: "Peso strengthens: TRM $3,600", trm: 3600 }];
const STORM_P = [{ k: "wait", e: "⏳", l: "Keep pesos, buy all the dollars next year" }, { k: "now", e: "💵", l: "Buy all the dollars today ($4,000)" }, { k: "half", e: "⚖️", l: "Buy half today, half next year" }];
function DollarStorm({ onSave, onExit }) {
  const [pick, setPick] = useState(null);
  const [imp, setImp] = useState(null);
  const [st, finish] = useFinish(onSave);
  const cost = (p, s) => (p === "now" ? 1000 * 4000 : p === "wait" ? 1000 * s.trm : 500 * 4000 + 500 * s.trm);
  if (st.done) return <Reward title="Storm survived! 🌪️" subtitle="Hedging reduces risk — it doesn't predict the future." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Umbrella size={22} strokeWidth={2.1} />} title="The Dollar Storm 🌪️" subtitle="Your class trip to Miami is in one year and costs US$1,000. Today the TRM is $4,000. Nobody knows the future dollar." onExit={onExit}>
      <Brief91 k="c3_storm" />
      <p className="quiz-q">Choose your strategy BEFORE you see the future:</p>
      <div className="g10-ab four">{STORM_P.map((p) => <button key={p.k} type="button" disabled={!!pick} className={pick === p.k ? "on" : ""} onClick={() => setPick(p.k)}><em>{p.e}</em><b>{p.l}</b></button>)}</div>
      {pick && (
        <>
          <MiniTable head={["Strategy", ...STORM_S.map((s) => `${s.e} ${s.l}`), "Range"]} rows={STORM_P.map((p) => { const c = STORM_S.map((s) => cost(p.k, s)); return [`${p.e} ${p.l}${p.k === pick ? " ⬅️" : ""}`, ...c.map(cop), cop(Math.max(...c) - Math.min(...c))]; })} />
          <div className="p1-banner good"><span>💡 Look at the last column: "buy now" has NO range (you know the cost today). "Half and half" cuts the range in half. Hedging doesn't give the cheapest result in every scenario — it gives you <b>certainty</b>.</span></div>
          <div className="start-block g10-boss">
            <h3>🏭 Bonus case · An importer</h3>
            <p>Doña Marta imports coffee machines. She must pay US$20,000 in 6 months. If the dollar goes from $4,000 to $4,600, how much more does she pay in pesos?</p>
            <div className="quiz-options">{["$12,000,000", "$6,000,000", "$600,000"].map((t, k) => <button key={t} type="button" disabled={imp != null} className={`quiz-opt ${imp === k ? (k === 0 ? "correct" : "wrong") : ""} ${imp != null && k === 0 ? "correct" : ""}`} onClick={() => setImp(k)}><span className="opt-text">{t}</span></button>)}</div>
            {imp != null && <p className="g91-note pos">20,000 × (4,600 − 4,000) = $12,000,000. That's why importers hedge (forwards, buying dollars in advance).</p>}
          </div>
        </>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={imp == null} onClick={() => finish(24 + (imp === 0 ? 4 : 0), { pick, imp: imp === 0 })}>Finish <span className="coin-tag"><Coins size={15} /> +{24 + (imp === 0 ? 4 : 0)}</span></button></div>
    </ActShell>
  );
}
const DESK2_R = [
  { tag: "Buy", q: "The house sells at $4,150. US$300 cost…", answer: 1245000, money: true, hint: "300 × 4,150", explain: "$1,245,000." },
  { tag: "Sell", q: "The house buys at $3,950. You sell US$120. You receive…", answer: 474000, money: true, hint: "120 × 3,950", explain: "$474,000." },
  { tag: "Spread", q: "Sell price $4,150, buy price $3,950. Spread per dollar?", answer: 200, money: true, hint: "4,150 − 3,950", explain: "$200." },
  { tag: "Spread %", q: "That spread as a % of a $4,000 TRM?", answer: 5, unit: "%", tol: 0.1, hint: "200 ÷ 4,000", explain: "5% — a hidden cost every round trip." },
  { tag: "Compare", q: "A: $4,200 with no fee. B: $4,140 + $15,000 fee. You buy US$400. Cheaper?", options: ["B: $1,671,000 vs. $1,680,000.", "A: $1,680,000 vs. $1,671,000.", "A, a fixed fee always costs more.", "They cost the same."], correct: 0, explain: "A: 1,680,000. B: 400 × 4,140 + 15,000 = 1,671,000." },
];

/* ---------- C4 · Wall Street Tycoon · Page 15 ---------- */
const TYC = [
  { k: "solar", e: "☀️", l: "SunPower Co.", sec: "Energy" }, { k: "health", e: "💊", l: "MediCare+", sec: "Health" }, { k: "food", e: "🥑", l: "FreshMarket", sec: "Food" },
  { k: "move", e: "🚚", l: "FastMove", sec: "Transport" }, { k: "play", e: "🎮", l: "PlayVerse", sec: "Entertainment" }, { k: "chip", e: "💾", l: "ChipNova", sec: "Technology" },
];
const TYC_R = [
  { news: "📰 Round 1: A heat wave boosts solar energy demand. Games sales fall.", r: { solar: 18, health: 2, food: 3, move: 1, play: -8, chip: 5 } },
  { news: "📰 Round 2: ChipNova's factory burns down. The company goes BANKRUPT.", r: { solar: 2, health: 4, food: 1, move: 3, play: 6, chip: -92 } },
  { news: "📰 Round 3: A new medicine is approved. Fuel prices go up.", r: { solar: 4, health: 22, food: 2, move: -10, play: 3, chip: 0 } },
];
function WallStreetTycoon({ existing, onSave, onExit }) {
  const [al, setAl] = useState({ solar: 0, health: 0, food: 0, move: 0, play: 0, chip: 0 });
  const [round, setRound] = useState(-1);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const sum = Object.values(al).reduce((a, v) => a + v, 0);
  const run = (alloc, upto) => { let h = Object.fromEntries(TYC.map((c) => [c.k, alloc[c.k] * 10])); const hist = [sumH(h)]; for (let i = 0; i <= upto; i++) { h = applyR(h, TYC_R[i].r); hist.push(sumH(h)); } return { h, hist }; };
  const etfAl = Object.fromEntries(TYC.map((c) => [c.k, 100 / 6]));
  const mine = run(al, round), etf = run(etfAl, round);
  const G = [W_PASSIVE, W_REASON];
  if (st.done) return <Reward title="Tycoon of the year! 🏙️" subtitle={`You: ${usd0(mine.hist[mine.hist.length - 1])} · ETF: ${usd0(etf.hist[etf.hist.length - 1])}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Building2 size={22} strokeWidth={2.1} />} title="Wall Street Tycoon 🏙️ · Page 15" subtitle="US$1,000 · 6 fictional companies. Pick your stocks — then compare with an ETF that holds all six." onExit={onExit}>
      <Brief91 k="c4_tycoon" />
      <FPBadge n={15} t="Why ETFs reduce risk" e="🧺" />
      {round === -1 ? (
        <>
          <AllocBars items={TYC.map((c) => ({ ...c, d: c.sec, c: "#16b074" }))} vals={al} set={setAl} step={10} />
          <div className="start-foot"><button className="s1-btn primary big" disabled={sum !== 100} onClick={() => setRound(0)}>{sum === 100 ? "Ring the bell 🔔" : `Assign 100% (${sum}%)`}</button></div>
        </>
      ) : (
        <>
          <div className="g10-news"><small>ROUND {round + 1} / 3</small><b>{TYC_R[round].news}</b></div>
          <div className="g10-hold">{TYC.map((c) => <div key={c.k} style={{ "--c": TYC_R[round].r[c.k] >= 0 ? "#16b074" : "#ff6b57" }}><em>{c.e}</em><span>{c.l} <i>{pctTxt(TYC_R[round].r[c.k], 0)}</i></span><b>{usd0(mine.h[c.k])}</b></div>)}</div>
          <ChartCard title="My stocks vs. the ETF (all six)" legend={[{ name: "My stocks", color: "#ff6b57" }, { name: "ETF", color: "#16b074" }]}><LineChart money={false} labels={mine.hist.map((_, k) => (k === 0 ? "Start" : `R${k}`))} series={[{ name: "Mine", values: mine.hist, color: "#ff6b57" }, { name: "ETF", values: etf.hist, color: "#16b074" }]} /></ChartCard>
          {round < 2 ? <div className="start-foot"><button className="s1-btn primary big" onClick={() => setRound(round + 1)}>Next round <ChevronRight size={18} /></button></div> : (
            <>
              <div className={`p1-banner ${al.chip >= 30 ? "bad" : "good"}`}><span>{al.chip > 0 ? `ChipNova's bankruptcy took ${usd0(al.chip * 10 * 0.92 * 1.05)} from you. ` : "You avoided ChipNova! "}In the ETF, one bankruptcy was only 1/6 of the basket.</span></div>
              <div className="start-block"><h3>✍️ Page 15 · Why ETFs reduce risk (passive voice)</h3><Starters items={["In an ETF, money is spread across…", "Risk is reduced because…", "My portfolio was hurt by…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={25} max={70} goals={G} placeholder="In an ETF, the money is spread across many companies, so…" /></div>
              <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(text, 25, 70, G)} onClick={() => finish(30, { alloc: al, final: mine.hist[3], etf: etf.hist[3], text })}>Save Page 15 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
            </>
          )}
        </>
      )}
    </ActShell>
  );
}
const FRAC_R = [
  { tag: "Fraction", q: "One share of a big company costs US$500. With US$50 you buy how many shares?", answer: 0.1, unit: "shares", tol: 0.001, hint: "50 ÷ 500", explain: "0.1 share — a fractional share." },
  { tag: "Fraction", q: "You own 0.25 shares of a US$800 stock. Value?", answer: 200, unit: "US$", hint: "0.25 × 800", explain: "US$200." },
  { tag: "Gain", q: "Your 0.25 shares: the price goes from US$800 to US$880. Gain in US$?", answer: 20, unit: "US$", hint: "0.25 × 80", explain: "US$20 (+10%)." },
  { tag: "Diversify", q: "With US$100, which gives more diversification?", options: ["Fractions of an ETF with 500 companies.", "One full share of a cheap company.", "Shares of the 3 biggest tech companies.", "100 dollars in one crypto coin."], correct: 0, explain: "Fractions of an ETF = hundreds of companies with little money." },
];

/* ---------- C5 · Scam City (FOMO) · Page 16 ---------- */
const SCAM_STATS = [{ k: "money", l: "My savings", e: "💰", start: 70 }, { k: "safe", l: "Safety", e: "🛡️", start: 60 }];
const SCAM_R = [
  { e: "📲", title: "CryptoMillion Club", text: "“20% monthly GUARANTEED! Invite 3 friends and earn a bonus.” Screenshots of Lamborghinis.", options: [{ t: "Walk away and report it", fx: { safe: 15 }, good: true, note: "Guaranteed returns + recruiting = classic Ponzi." }, { t: "Invest a little to test", fx: { money: -20, safe: -10 }, note: "The first payments are bait." }, { t: "Invest everything now!", fx: { money: -60, safe: -20 }, note: "That's exactly what scammers want." }] },
  { e: "🪙", title: "A regulated stablecoin", text: "A known issuer, public reserves reports, 1:1 with the dollar. No promised returns.", options: [{ t: "Investigate the issuer and the platform first", fx: { safe: 10, money: 2 }, good: true, note: "Stable ≠ risk-free: check reserves and the platform." }, { t: "Put all my savings there forever", fx: { safe: -10 }, note: "Concentration is risky even in stable assets." }, { t: "Ignore it — all crypto is a scam", fx: { safe: -2 }, note: "Not all crypto is a scam: judge the promise." }] },
  { e: "⏰", title: "FOMO alert!", text: "“ONLY 10 SPOTS LEFT! 3x your money in 30 days. Everyone is buying!”", options: [{ t: "Close the app: pressure is a red flag", fx: { safe: 15 }, good: true, note: "Real investments don't disappear in 10 minutes." }, { t: "Hurry, buy before it's gone", fx: { money: -40, safe: -15 }, note: "FOMO is a weapon of scammers." }, { t: "Ask in the group chat", fx: { safe: -5 }, note: "The group may be full of fake accounts." }] },
  { e: "₿", title: "A volatile crypto", text: "Bitcoin fell 25% this month. A friend says: 'Buy with a loan, it will go back up!'", options: [{ t: "Never invest borrowed money in volatile assets", fx: { safe: 15 }, good: true, note: "Volatility + debt = disaster risk." }, { t: "Take the loan and buy", fx: { money: -35, safe: -20 }, note: "If it falls more, you lose AND owe." }, { t: "Invest a small part I can afford to lose", fx: { money: -3, safe: 5 }, good: true, note: "OK if it's money you can lose, with a long horizon." }] },
  { e: "👔", title: "The 'trading guru'", text: "A guru on social media sells a $500,000 course: “My bot wins 95% of trades.”", options: [{ t: "Check if he is supervised and ask for audited results", fx: { safe: 15 }, good: true, note: "Real advisers are supervised. Screenshots are not proof." }, { t: "Buy the course", fx: { money: -25 }, note: "If the bot really won 95%, why sell courses?" }, { t: "Trust the 5-star comments", fx: { money: -15, safe: -10 }, note: "Comments can be fake." }] },
];
function ScamCity({ existing, onSave, onExit }) {
  const [res, setRes] = useState(null);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const G = [W_CONTRAST, W_RISK];
  if (st.done) return <Reward title="Scam detective! 🕵️" subtitle={`${res?.good || 0} safe decisions`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<ShieldAlert size={22} strokeWidth={2.1} />} title="Scam City 🕵️ · Page 16" subtitle="5 offers. Some are scams, some are real but risky. You have 20 seconds each — FOMO mode is ON." onExit={onExit}>
      <Brief91 k="c5_scam" />
      <FPBadge n={16} t="Crypto or stablecoin?" e="🪙" />
      {!res ? <ImpactRounds stats={SCAM_STATS} rounds={SCAM_R} timer={20} onDone={setRes} doneLabel="See my report" /> : (
        <>
          <div className="g10-stats">{SCAM_STATS.map((s) => <div key={s.k}><small>{s.e} {s.l}</small><b>{res.values[s.k]}</b></div>)}<div><small>✅ Safe decisions</small><b>{res.good}/5</b></div></div>
          <div className="g10-flags">{["💯 Guaranteed returns", "⏰ Pressure", "👥 Recruiting", "🤫 No real business", "🏛️ Not supervised", "🧾 Hard to withdraw"].map((f) => <span key={f}>{f}</span>)}</div>
          <div className="start-block"><h3>✍️ Page 16 · Crypto or stablecoin? (contrast)</h3><Starters items={["A stablecoin tries to…, while bitcoin…", "However, both have risks:", "The biggest red flag is…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="A stablecoin tries to keep a 1:1 value, while bitcoin… However…" /></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(text, 30, 80, G)} onClick={() => finish(20 + res.good * 3, { values: res.values, good: res.good, text })}>Save Page 16 <span className="coin-tag"><Coins size={15} /> +{20 + res.good * 3}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C6 · The Business Judge (VPN, TIR, recuperación) · Page 17 ---------- */
const PROJ = [
  { k: "cart", e: "🌮", l: "Food cart", f: [-10000000, 4000000, 4500000, 5000000] },
  { k: "moto", e: "🛵", l: "Delivery motorbike", f: [-10000000, 5500000, 4500000, 3000000] },
  { k: "cdt", e: "📜", l: "CDT at 12%", f: [-10000000, 0, 0, 14049280] },
];
const npvOf = (rate, f) => f.reduce((a, c, t) => a + c / Math.pow(1 + rate, t), 0);
const irrOf = (f) => { let lo = -0.9, hi = 1; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (npvOf(m, f) > 0) lo = m; else hi = m; } return (lo + hi) / 2; };
const paybackOf = (f) => { let acc = f[0]; for (let t = 1; t < f.length; t++) { if (acc + f[t] >= 0) return r2(t - 1 + -acc / f[t]); acc += f[t]; } return null; };
function BusinessJudge({ existing, onSave, onExit }) {
  const [guess, setGuess] = useState(null);
  const [shown, setShown] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const [pick, setPick] = useState(existing?.pick || null);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const flows = (p) => (crisis && p.k !== "cdt" ? p.f.map((c, t) => (t === 0 ? c : Math.round(c * 0.8))) : p.f);
  const calc = PROJ.map((p) => { const f = flows(p); return { ...p, fl: f, npv: npvOf(0.12, f), irr: irrOf(f), pb: paybackOf(f) }; });
  const best = calc.slice().sort((a, b) => b.npv - a.npv)[0];
  const G = [W_RECOMMEND, W_NUMBERS(2)];
  if (st.done) return <Reward title="Verdict delivered! ⚖️" subtitle="You judge projects like a CFO." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Gavel size={22} strokeWidth={2.1} />} title="The Business Judge ⚖️ · Page 17" subtitle="Your uncle has $10,000,000. Three projects. Discount rate: 12% (his best alternative)." onExit={onExit}>
      <Brief91 k="c6_judge" />
      <FPBadge n={17} t="My project verdict" e="⚖️" />
      <MiniTable head={["Project", "Year 0", "Year 1", "Year 2", "Year 3"]} rows={calc.map((p) => [`${p.e} ${p.l}`, ...p.fl.map((c) => cop(c))])} />
      {!shown ? (
        <>
          <p className="quiz-q">Your instinct first: which project creates the most value?</p>
          <div className="g10-ab four">{PROJ.map((p) => <button key={p.k} type="button" className={guess === p.k ? "on" : ""} onClick={() => setGuess(p.k)}><em>{p.e}</em><b>{p.l}</b></button>)}</div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!guess} onClick={() => setShown(true)}>Calculate NPV, IRR and payback</button></div>
        </>
      ) : (
        <>
          <MiniTable head={["Project", "NPV at 12%", "IRR", "Payback"]} rows={calc.map((p) => [`${p.e} ${p.l}`, cop(p.npv), pm(p.irr, 1), p.pb != null ? `${p.pb} years` : "—"])} />
          <div className="g10-bars">{calc.map((p) => <div key={p.k}><span>{p.e} {p.l}</span><div><i style={{ width: `${Math.max(2, Math.min(100, (Math.abs(p.npv) / 1000000) * 100))}%`, background: p.npv > 1 ? "#16b074" : p.npv < -1 ? "#ff6b57" : "#9aa5a0" }} /></div><b>{cop(p.npv)}</b></div>)}</div>
          <p className={`g91-note ${guess === best.k ? "pos" : "neg"}`}>{guess === best.k ? "✅ Your instinct was right!" : `Your instinct said ${PROJ.find((p) => p.k === guess).l}; the numbers say ${best.l}.`} The CDT's NPV is $0: it IS the alternative.</p>
          {!crisis ? <div className="start-foot"><button className="s1-btn ghost big" onClick={() => { setCrisis(true); setPick(null); }}>🌪️ Crisis: sales fall 20%</button></div> : <div className="p1-banner bad"><span>🌪️ With 20% less income, the business projects {calc.filter((p) => p.k !== "cdt" && p.npv < 0).length ? "now have a NEGATIVE NPV: the CDT wins." : "still beat the CDT, but by less."} Projections are estimates — risk matters!</span></div>}
          {crisis && (
            <>
              <p className="quiz-q">Your final verdict for your uncle:</p>
              <div className="g10-ab four">{calc.map((p) => <button key={p.k} type="button" className={pick === p.k ? "on" : ""} onClick={() => setPick(p.k)}><em>{p.e}</em><b>{p.l}</b><span>NPV {cop(p.npv)}</span></button>)}</div>
              <div className="start-block"><h3>✍️ Page 17 · My project verdict</h3><Starters items={["I recommend… because its NPV is…", "However, if sales fall…", "The payback is…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="I recommend the… because its NPV is… However…" /></div>
            </>
          )}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!crisis || !pick || !goalsOk(text, 30, 80, G)} onClick={() => finish(28 + (guess === "cart" ? 2 : 0), { guess, pick, crisis, npvs: Object.fromEntries(calc.map((p) => [p.k, Math.round(p.npv)])), text })}>Save Page 17 <span className="coin-tag"><Coins size={15} /> +{28 + (guess === "cart" ? 2 : 0)}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C7 · Portfolio Rescue ---------- */
const RESCUE_LOG = [["Jan", "Bought 3 MegaTech at US$300", "−US$900"], ["Feb", "Paid a 'premium advisor' fee", "−US$60"], ["Mar", "MegaTech fell to US$180 — sold all in panic", "+US$540"], ["Apr", "Bought 0.01 bitcoin at the top: US$600", "−US$600"], ["May", "Bitcoin fell — still holding, now worth", "US$390"], ["May", "Cash left in the account", "US$40"]];
const RESCUE_ERR = [
  { t: "90% of the money in ONE stock (no diversification).", bad: true }, { t: "Panic selling after a fall.", bad: true },
  { t: "Paying a high fee for 'premium advice'.", bad: true }, { t: "Buying an asset after a huge rise because of FOMO.", bad: true },
  { t: "Keeping a small amount of cash.", bad: false }, { t: "Writing every move in a log.", bad: false },
];
function PortfolioRescue({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [first, setFirst] = useState(0);
  const [sel, setSel] = useState([]);
  const [st, finish] = useFinish(onSave);
  const rounds = [
    { tag: "NAV", q: "Today the portfolio has bitcoin worth US$390 and US$40 cash. NAV?", visual: <MiniTable head={["Month", "Move", "Cash flow"]} rows={RESCUE_LOG} />, answer: 430, unit: "US$", hint: "390 + 40", explain: "NAV = US$430." },
    { tag: "P&L", q: "The investor started with US$1,000. P&L?", answer: -570, unit: "US$", hint: "430 − 1,000", explain: "−US$570." },
    { tag: "ROI", q: "ROI in %?", answer: -57, unit: "%", tol: 0.1, hint: "−570 ÷ 1,000 × 100", explain: "−57%." },
    { tag: "Realized", q: "Realized loss on MegaTech (bought 900, sold 540)?", answer: -360, unit: "US$", hint: "540 − 900", explain: "−US$360 realized: locked in by selling." },
  ];
  const errs = RESCUE_ERR.filter((e) => e.bad).map((e) => e.t);
  const okSel = sel.length === 4 && sel.every((t) => errs.includes(t));
  if (st.done) return <Reward title="Portfolio rescued! 🛟" subtitle="You found the mistakes — and how to avoid them." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<LifeBuoy size={22} strokeWidth={2.1} />} title="Portfolio Rescue 🛟" subtitle="An investor lost money. Audit the log: calculate NAV, P&L and ROI — and find the 4 mistakes." onExit={onExit}>
      <Brief91 k="c7_rescue" />
      {stage === 0 ? <RoundsRunner rounds={rounds} doneLabel="Find the mistakes" onDone={(r) => { setFirst(r.firstTry); setStage(1); }} /> : (
        <>
          <div className="g10-qpick">{RESCUE_ERR.map((e) => { const on = sel.includes(e.t); return <button key={e.t} type="button" className={`${on ? "on" : ""} ${on && !e.bad ? "bad" : ""}`} onClick={() => setSel(on ? sel.filter((x) => x !== e.t) : sel.length < 4 ? [...sel, e.t] : sel)}>{on ? (e.bad ? "🚩 " : "✗ ") : ""}{e.t}</button>; })}</div>
          {sel.length === 4 && !okSel && <p className="p1-hint">💡 One of those is a GOOD habit. Change it.</p>}
          {okSel && <div className="p1-banner good"><span>🛟 Rescue plan: diversify with an ETF, keep fees low, never sell in panic, and never buy because of FOMO.</span></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!okSel} onClick={() => finish(18 + first * 3, { firstTry: first })}>Finish the rescue <span className="coin-tag"><Coins size={15} /> +{18 + first * 3}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C7 · Investment Dashboard · Page 18 ---------- */
function InvestDashboard({ resp, existing, onSave, onExit }) {
  const P = portOf(resp);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const G = [W_NUMBERS(2), W_CAUSE];
  const rows = ASSETS10.map((x) => { const inv = (P.alloc[x.k] || 0) * 10; const now = P.h[x.k]; return [`${x.e} ${x.l}`, inv, now, r2(now - inv), inv ? r2(((now - inv) / inv) * 100) : 0]; });
  const csv = () => downloadCSV([["Asset", "Invested (US$)", "Value now (US$)", "P&L (US$)", "ROI %"], ...rows, ["TOTAL", 1000, P.nav, P.pnl, P.roi], [], ["Week", "NAV"], ...P.hist.map((h) => [h.l, h.v])], "My_Investment_Dashboard.csv");
  if (st.done) return <Reward title="Dashboard ready! 📊" subtitle={`NAV ${usd0(P.nav)} · ROI ${pctTxt(P.roi)}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<BarChart3 size={22} strokeWidth={2.1} />} title="My Investment Dashboard 📊 · Page 18" subtitle="NAV, P&L and ROI of your Global Asset Allocation Lab — with formulas you understand." onExit={onExit}>
      <Brief91 k="c7_dashboard" />
      <FPBadge n={18} t="My P&L statement" e="📊" />
      {P.sample && <div className="p1-banner bad"><span>Sample portfolio: allocate your US$1,000 in Class 1 to see YOUR numbers.</span></div>}
      <div className="g10-kpis"><div><small>💼 Invested</small><b>{usd0(1000)}</b></div><div><small>📦 NAV</small><b>{usd0(P.nav)}</b></div><div><small>📈 P&L</small><b className={P.pnl >= 0 ? "pos" : "neg"}>{P.pnl >= 0 ? "+" : ""}{usd0(P.pnl)}</b></div><div><small>🎯 ROI</small><b className={P.roi >= 0 ? "pos" : "neg"}>{pctTxt(P.roi)}</b></div><div><small>📅 Weeks</small><b>{P.done}/5</b></div></div>
      <ChartCard title="NAV week by week (green = above US$1,000)"><LineChart money={false} labels={P.hist.map((h) => h.l)} series={[{ name: "NAV", values: P.hist.map((h) => h.v), color: P.nav >= 1000 ? "#16b074" : "#ff6b57" }]} /></ChartCard>
      <MiniTable head={["Asset", "Invested", "Now", "P&L", "ROI"]} rows={rows.map((r) => [r[0], usd0(r[1]), usd0(r[2]), `${r[3] >= 0 ? "+" : ""}${usd0(r[3])}`, pctTxt(r[4])])} foot={["TOTAL", usd0(1000), usd0(P.nav), `${P.pnl >= 0 ? "+" : ""}${usd0(P.pnl)}`, pctTxt(P.roi)]} />
      <div className="g10-formula">NAV = Σ value of each asset · P&L = NAV − 1,000 · ROI = P&L ÷ 1,000 × 100</div>
      <div className="p3-card-actions"><button className="s1-btn primary" onClick={csv}><Download size={16} /> Download CSV (Excel)</button></div>
      <div className="start-block"><h3>✍️ Page 18 · My P&L statement</h3><Starters items={["My NAV is… so my ROI is…", "My best asset was… because…", "My worst asset was…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="My NAV is US$1,012, so my ROI is +1.2%. My best asset was… because…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(text, 30, 80, G)} onClick={() => finish(34, { nav: P.nav, pnl: P.pnl, roi: P.roi, weeks: P.done, text })}>Save Page 18 <span className="coin-tag"><Coins size={15} /> +34</span></button></div>
    </ActShell>
  );
}

/* ---------- C8 · Shareholder Pitch (proyecto grande) ---------- */
const RUB_SH = [["coh", "Profile & allocation coherent", "risk fits the profile"], ["hedge", "Dollar hedge & diversification", "explained with examples"], ["spec", "Speculation vs. scam vs. investing", "clear differences"], ["nums", "Correct numbers", "NAV, P&L, ROI"], ["eng", "Professional financial English", "clear and confident"]];
function ShareholderPitch({ resp, studentName, userData, API_URL, existing, onSave, onExit }) {
  const r = resp || {}; const P = portOf(r); const prof = PROFILES[r.c1_dna?.profile || "mod"];
  const w5 = r.c6_week5?.decision; const jd = r.c6_judge;
  const ready = !!r.c1_allocate && P.done >= 3;
  const top = ASSETS10.slice().sort((a, b) => (P.alloc[b.k] || 0) - (P.alloc[a.k] || 0)).slice(0, 2);
  const chapters = (v) => [
    { e: "🧬", t: "My profile", s: r.c1_dna ? [`I am a ${prof.l.split(" ")[0].toLowerCase()} investor.`, r.c1_allocate ? `My portfolio risk is ${r.c1_allocate.risk} out of 5.` : ""].filter(Boolean) : [] },
    { e: "🥧", t: "My allocation", s: r.c1_allocate ? [`I invested US$1,000: ${ASSETS10.filter((x) => P.alloc[x.k]).map((x) => `${P.alloc[x.k]}% in ${x.l}`).join(", ")}.`, `My biggest positions were ${top.map((x) => x.l).join(" and ")}.`] : [] },
    { e: "🌪️", t: "My Market Weeks", s: [r.c3_week2 ? "When the peso devalued, my dollar assets protected me — that's a hedge." : "", r.c4_week3 ? "When NovaTech collapsed, diversification limited the damage." : "", r.c5_week4 ? "In the crypto crash, I saw the difference between bitcoin and a stablecoin." : "", w5 ? `In the global shock, I decided to ${w5 === "sell" ? "sell — and I learned what panic costs" : w5 === "hold" ? "hold my plan" : "rebalance"}.` : ""].filter(Boolean) },
    { e: "📊", t: "My results", s: P.done ? [`My NAV is ${usd0(P.nav)}: a P&L of ${P.pnl >= 0 ? "+" : ""}${usd0(P.pnl)} and an ROI of ${pctTxt(P.roi)}.`] : [] },
    { e: "⚖️", t: "A project I would finance", s: jd ? [`With NPV analysis at 12%, I recommended the ${PROJ.find((p) => p.k === jd.pick)?.l.toLowerCase()}.`] : [] },
    { e: "🎯", t: "My next move", s: v.next ? [dot(capF(v.next))] : [] },
  ];
  const publish = async (v) => { try { const d = await fairPost(API_URL, userData, "10-SH", "fair_publish", { company: { name: `${studentName.split(" ")[0]}'s Fund`, logo: "🌍", lines: [`${prof.l} · ROI ${pctTxt(P.roi)}`, `Top: ${top.map((x) => x.l).join(" + ")}`, v.next || ""].filter(Boolean), nums: [{ l: "NAV", v: usd0(P.nav) }, { l: "ROI", v: pctTxt(P.roi) }] } }); return d.status !== "error"; } catch (e) { return false; } };
  return (
    <PitchStudio icon={<Mic size={22} strokeWidth={2.1} />} title="Shareholder Pitch 🌍 · THE BIG PROJECT" subtitle="You are the portfolio manager. Present your fund to the shareholders." brief={<Brief91 k="c8_pitch" />}
      how={<>Your script builds itself from your profile, allocation, Market Weeks and project verdict. Add your next move and your closing line, press <b>Present</b> (2–3 minutes) and publish your fund for the championship.</>}
      id="g10-share" ready={ready} readyMsg="You need your allocation (Class 1) and at least 3 Market Weeks."
      cover={{ tag: "INVESTOR DAY · GRADE 10 · INSTITUTO CREAR", title: `🌍 ${studentName.split(" ")[0]}'s Global Fund`, sub: `Portfolio manager: ${studentName}`, say: `Good morning, shareholders. I'm ${studentName.split(" ")[0]}, and this is how I managed your US$1,000.`, end: (v) => `${v.close ? dot(capF(v.close)) : "…"} Thank you for your trust.` }}
      kpis={[{ l: "🧬 Profile", v: prof.l }, { l: "📦 NAV", v: usd0(P.nav) }, { l: "📈 P&L", v: `${P.pnl >= 0 ? "+" : ""}${usd0(P.pnl)}`, c: P.pnl >= 0 ? "pos" : "neg" }, { l: "🎯 ROI", v: pctTxt(P.roi), c: P.roi >= 0 ? "pos" : "neg" }]}
      chapters={chapters} inputs={[{ k: "next", l: "🎯 My next move as a manager:", ph: "Next quarter I will rebalance to…", min: 8 }, { k: "close", l: "💡 My closing line:", ph: "Investing is a plan, not a bet…", min: 6 }]}
      rubric={RUB_SH} existing={existing} onPublish={publish} publishLabel="Publish my fund for the championship"
      cert={{ e: "🌍", title: "Global Investor", name: studentName, text: `managed a simulated US$1,000 global portfolio as a ${prof.l.split(" ")[0].toLowerCase()} investor, hedged currency risk, diversified, avoided scams and explained NAV, P&L and ROI.` }}
      extraData={{ nav: P.nav, roi: P.roi }} coins={60} onSave={onSave} onExit={onExit} />
  );
}

/* ---------- C8 · Boss P3 + Future Me Card: My Investor Card ---------- */
function BossP3({ resp, studentName, onSave, onExit }) {
  const P = portOf(resp); const prof = PROFILES[resp?.c1_dna?.profile || "mod"];
  const card = <FMCardView id="g10-card3" card={FM_CARDS[2]} name={studentName} lines={[`Profile: ${prof.l}`, `NAV ${usd0(P.nav)} · ROI ${pctTxt(P.roi)}`, resp?.c6_week5?.decision ? `In the shock I chose: ${resp.c6_week5.decision}` : "", "I check: supervised? realistic? can I withdraw?"]} />;
  return <BossExam icon={<Swords size={22} strokeWidth={2.1} />} title="Boss P3 · Global Investor ⚔️" subtitle="5 missions + 10 questions. 70% unlocks My Investor Card." brief={<Brief91 k="c8_boss" />} missions={BOSS3_MISSIONS} questions={BOSS3_Q} tips={BOSS3_TIPS} cardNode={card} onSave={onSave} onExit={onExit} />;
}

/* =====================================================================
   GUÍA DE CADA ACTIVIDAD · 10° PERIODO 3
   ===================================================================== */
const TPAGE = (n, words, needs, coins) => [[`Text: ${words} words with ${needs}`, "required"], [`Future Page ${n} saved`, `+${coins} 🪙`]];
const B_WEEK = (n, extra) => ({ goal: `Market Week ${n}: open the market, see how the news moves YOUR US$1,000 portfolio and explain the cause.`, steps: ["Read the news of the week.", "Open the market and compare before vs. after.", ...(extra ? [extra] : []), "Answer the cause-and-effect question."], win: [["Closing the week", "+20 🪙"], ...(extra ? [["Holding or rebalancing (not panic selling)", "+5 🪙"]] : [])], tip: "Illustrative scenario: the same for everybody. Your allocation makes the difference." });
const GUIDE = {
  c1_video: B_VIDEO("Understand the risk–return trade-off, volatility and your own risk appetite.", "Next: Investor DNA."),
  c1_dna: { goal: "Discover your investor profile with 6 real situations: need, ability and willingness to take risk.", steps: ["Answer honestly (there are no wrong answers).", "See your profile.", "Save it: it guides your allocation."], win: [["Saving your DNA", "+25 🪙"]] },
  c1_ladder: { goal: "Order 6 products from the lowest to the highest risk.", steps: ["Tap a card, then tap a step of the ladder.", "Check your order.", "Fix the cards that come back."], win: [["Base", "+20 🪙"], ["Fewer mistakes", "more coins"]] },
  c1_allocate: { goal: "THE BIG PROJECT starts: split US$1,000 (simulated) among 6 assets, coherent with your profile. This is Future Page 13.", steps: ["Use the bars (steps of 5%).", "Watch the risk and expected-return gauges.", "No asset above 60%.", "Write Page 13 with 'If the market falls, I will…'."], win: [["Future Page 13 saved", "+30 🪙"], ["Risk coherent with your profile", "+6 🪙"]] },
  c2_read: B_READ("Choose where your money 'sleeps': safety, liquidity, return — and Fogafín.", "Next: Bank Builder."),
  c2_bank: { goal: "Give each of 3 goals the right product, survive an emergency and write about your safe base. This is Future Page 14.", steps: ["Compare the 5 products.", "Choose a product for each goal.", "Trigger the emergency.", "Write Page 14 with superlatives."], win: [["Base (emergency money must be liquid)", "+22 🪙"], ["Each point of fit (max 6)", "+2 🪙"]] },
  c2_real: { goal: "Calculate the real return: interest − inflation (and the exact formula).", steps: ["Subtract inflation from the rate.", "Use (1 + rate) ÷ (1 + inflation) − 1 for the exact value.", "Read the explanation."], win: [["Each answer right on the first try", "+3 🪙"], ["Finishing", "+8 🪙"]] },
  c2_week1: B_WEEK(1), c3_week2: B_WEEK(2), c4_week3: B_WEEK(3), c5_week4: B_WEEK(4), c6_week5: B_WEEK(5, "The shock: hold, sell or rebalance?"),
  c3_listen: B_LISTEN("Listen to Sara and Tomás comparing two exchange houses: TRM, spread and hidden costs."),
  c3_storm: { goal: "Protect a US$1,000 trip from the dollar's ups and downs: compare three strategies in three futures.", steps: ["Choose a strategy BEFORE seeing the future.", "Compare the cost in 3 scenarios.", "Solve the importer case."], win: [["Finishing", "+24 🪙"], ["Importer case right", "+4 🪙"]], tip: "Hedging = certainty, not the cheapest result every time." },
  c3_desk: { goal: "Exchange Desk 2.0: buy, sell, spreads and fees — like a professional.", steps: ["Calculate each operation.", "Compare two houses with fees."], win: [["Each answer right on the first try", "+3 🪙"], ["Finishing", "+8 🪙"]] },
  c4_video: B_VIDEO("Learn what an ETF is — the child of an index fund and a stock.", "Next: Wall Street Tycoon."),
  c4_tycoon: { goal: "Pick stocks of 6 fictional companies and compete against an ETF of all six — through a bankruptcy. This is Future Page 15.", steps: ["Split US$1,000 (steps of 10%).", "Live 3 rounds of news.", "Compare your stocks vs. the ETF.", "Write Page 15 in the passive voice."], win: TPAGE("15", "25–70", "the passive + a reason", 30) },
  c4_fraction: { goal: "Buy pieces of expensive shares with little money: fractional shares.", steps: ["Divide money by price.", "Calculate value and gains."], win: [["Each answer right on the first try", "+3 🪙"], ["Finishing", "+8 🪙"]] },
  c5_video: B_VIDEO("Understand stablecoins: how they keep their value and the new rules (GENIUS Act, MiCA).", "Next: the DMG case."),
  c5_read: B_READ("Learn from a real Colombian case how pyramid and Ponzi schemes work — and their red flags.", "Next: Scam City."),
  c5_scam: { goal: "Survive Scam City: 5 offers, 20 seconds each, FOMO mode ON. This is Future Page 16.", steps: ["Read each offer.", "Decide before the timer ends (if time runs out, panic decides for you!).", "Watch your savings and safety.", "Write Page 16 with a contrast and a risk."], win: [["Base", "+20 🪙"], ["Each safe decision", "+3 🪙"]] },
  c6_read: B_READ("Learn NPV, IRR and payback with three worked projects.", "Next: the Business Judge."),
  c6_judge: { goal: "Judge 3 projects with NPV, IRR and payback — then survive a crisis and give your verdict. This is Future Page 17.", steps: ["Guess with your instinct.", "Calculate and compare.", "Apply the crisis.", "Write your verdict (recommend + 2 numbers)."], win: TPAGE("17", "30–80", "a recommendation + 2 numbers", 28) },
  c7_brief: B_BRIEF("Learn NAV, P&L and ROI — the three numbers every portfolio manager reports.", "Next: Portfolio Rescue."),
  c7_rescue: { goal: "Audit a portfolio that lost money: calculate NAV, P&L and ROI, then find the 4 mistakes.", steps: ["Solve 4 calculations with the log.", "Mark the 4 mistakes (careful: 2 are good habits)."], win: [["Base", "+18 🪙"], ["Each calculation right on the first try", "+3 🪙"]] },
  c7_dashboard: { goal: "Your Investment Dashboard: NAV, P&L, ROI per asset, a green/red chart and a CSV file. This is Future Page 18.", steps: ["Check your numbers.", "Download the CSV.", "Write Page 18 with 2 numbers and a cause."], win: TPAGE("18", "30–80", "2 numbers + cause and effect", 34) },
  c8_pitch: { goal: "THE BIG PROJECT: present your fund to the shareholders as a portfolio manager.", steps: ["Check your auto-built script.", "Write your next move and your closing line.", "Present (2–3 minutes).", "Publish your fund for the championship.", "Your classmate-jury rates you."], win: [["Script + jury complete", "required"], ["Global Investor certificate", "+60 🪙"]] },
  c8_walk: { goal: "Global Investor Championship: evaluate your classmates' funds and invest 100 coins in the best managers.", steps: ["Open a fund.", "Write the question you asked the manager.", "Choose a category and invest.", "Evaluate at least 2 funds."], win: [["Base", "+20 🪙"], ["Each fund evaluated (up to 5)", "+4 🪙"]] },
  c8_boss: { goal: "Beat the Period 3 boss and unlock your third Future Me Card: My Investor Card.", steps: ["Part 1: 5 missions.", "Part 2: 10 questions.", "Read your feedback by topic."], win: [["70% or more", "Future Me Card 📈"], ["Each question right", "+4 🪙"], ["Each mission on the first try", "+4 🪙"]] },
};

/* =====================================================================
   ESTRUCTURA · 10° PERIODO 3 · GLOBAL INVESTOR (8 clases)
   ===================================================================== */
const G10P3_WEEKS = [
  { n: 1, title: "Risk vs. Reward", e: "🎢", blurb: "Your investor DNA — and US$1,000 to allocate.", skills: ["Video", "Profile", "Project"], acts: [
    A10("c1_video", "Video: Risk & Return 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A10("c1_dna", "Investor DNA 🧬", "6 situations · your profile.", <Brain size={22} />, 25, "comportamiento"),
    A10("c1_ladder", "Risk Ladder 🪜", "From the safest to the riskiest.", <Layers size={22} />, 24, "aprendi"),
    A10("c1_allocate", "Allocate US$1,000 🌍 · Page 13", "THE BIG PROJECT starts.", <PieChart size={22} />, 36, "aprendi"),
  ] },
  { n: 2, title: "Where My Money Lives", e: "🛏️", blurb: "Safety, liquidity and return — accounts, cajitas, CDTs and Fogafín.", skills: ["Reading", "Builder", "Week 1"], acts: [
    A10("c2_read", "Reading: Where Does Your Money Sleep? 📖", "8 questions.", <BookOpen size={22} />, 42, "quizzes"),
    A10("c2_bank", "Bank Builder 🏗️ · Page 14", "3 goals · 5 products · 1 emergency.", <Building2 size={22} />, 34, "aprendi"),
    A10("c2_real", "Real Return Rounds 🫧", "Rate − inflation.", <Percent size={22} />, 23, "aprendi"),
    A10("c2_week1", "Market Week 1 🌤️", "Your portfolio meets the market.", <Activity size={22} />, 20, "aprendi"),
  ] },
  { n: 3, title: "Dollar Hedging & Forex", e: "💱", blurb: "Why people buy dollars — and how to protect a plan from the exchange rate.", skills: ["Listening", "Storm", "Week 2"], acts: [
    A10("c3_listen", "Listening: Dollars for Miami 🎧", "8 questions.", <Headphones size={22} />, 42, "quizzes"),
    A10("c3_storm", "The Dollar Storm 🌪️", "3 strategies · 3 futures.", <Umbrella size={22} />, 28, "aprendi"),
    A10("c3_desk", "Exchange Desk 2.0 💵", "5 operations.", <Banknote size={22} />, 23, "aprendi"),
    A10("c3_week2", "Market Week 2 💱", "The peso devalues.", <Activity size={22} />, 20, "aprendi"),
  ] },
  { n: 4, title: "Stocks, ETFs & Fractional Shares", e: "🧺", blurb: "Own a piece of 500 companies — and survive a bankruptcy.", skills: ["Video", "Tycoon", "Week 3"], acts: [
    A10("c4_video", "Video: WTF Is an ETF? 🎬", "Bloomberg · 8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A10("c4_tycoon", "Wall Street Tycoon 🏙️ · Page 15", "Your stocks vs. the ETF.", <Building2 size={22} />, 30, "aprendi"),
    A10("c4_fraction", "Fractional Shares 🍕", "Pieces of expensive shares.", <Calculator size={22} />, 20, "aprendi"),
    A10("c4_week3", "Market Week 3 🚨", "A company collapses.", <Activity size={22} />, 20, "aprendi"),
  ] },
  { n: 5, title: "Crypto vs. Stablecoins & Scams", e: "🪙", blurb: "Volatility, stablecoins, pyramids — and decisions under pressure.", skills: ["Video", "Case", "Scam City"], acts: [
    A10("c5_video", "Video: Stablecoins Explained 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A10("c5_read", "Reading: Too Good to Be True — the DMG Case 📖", "8 questions.", <BookOpen size={22} />, 42, "quizzes"),
    A10("c5_scam", "Scam City 🕵️ · Page 16", "FOMO mode · 5 offers.", <ShieldAlert size={22} />, 35, "aprendi"),
    A10("c5_week4", "Market Week 4 📉", "Crypto crash.", <Activity size={22} />, 20, "aprendi"),
  ] },
  { n: 6, title: "Is It Worth It? NPV, IRR & Payback", e: "⚖️", blurb: "Judge projects like a CFO — and face the market shock.", skills: ["Reading", "Judge", "Week 5"], acts: [
    A10("c6_read", "Reading: Is This Project Worth It? 📖", "NPV, IRR, payback · 8 questions.", <BookOpen size={22} />, 42, "quizzes"),
    A10("c6_judge", "The Business Judge ⚖️ · Page 17", "3 projects + a crisis.", <Gavel size={22} />, 30, "aprendi"),
    A10("c6_week5", "Market Week 5 🌪️", "The shock: hold, sell or rebalance?", <Activity size={22} />, 25, "aprendi"),
  ] },
  { n: 7, title: "P&L Audit & Dashboard", e: "📊", blurb: "NAV, P&L, ROI — rescue a bad portfolio and build your dashboard.", skills: ["Explainer", "Rescue", "Dashboard"], acts: [
    A10("c7_brief", "Explainer: NAV, P&L & ROI 💡", "6 questions.", <BookOpen size={22} />, 34, "quizzes"),
    A10("c7_rescue", "Portfolio Rescue 🛟", "Audit · 4 mistakes.", <LifeBuoy size={22} />, 30, "aprendi"),
    A10("c7_dashboard", "My Investment Dashboard 📊 · Page 18", "NAV · P&L · ROI · CSV.", <BarChart3 size={22} />, 34, "aprendi"),
  ] },
  { n: 8, title: "Investor Day", e: "🏆", blurb: "Your Shareholder Pitch, the championship and the boss.", skills: ["Pitch", "Championship", "Boss"], acts: [
    A10("c8_pitch", "Shareholder Pitch 🌍 · THE BIG PROJECT", "Present + jury + certificate.", <Mic size={22} />, 60, "aprendi"),
    A10("c8_walk", "Global Investor Championship 🏆", "Invest in classmates' funds.", <Trophy size={22} />, 40, "aprendi"),
    A10("c8_boss", "Boss P3 + Future Me Card ⚔️", "5 missions + 10 questions (70%).", <Swords size={22} />, 70, "quizzes"),
  ] },
];

const LADDER = ["🏦 Savings account", "📜 CDT", "🧱 Bond fund", "🧺 S&P 500 ETF", "🚀 One tech stock", "₿ Bitcoin"];
function RiskLadder({ onSave, onExit }) {
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Ladder climbed! 🪜" subtitle="You know where each product sits on the risk ladder." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Layers size={22} strokeWidth={2.1} />} title="Risk Ladder 🪜" subtitle="From the safest (step 1) to the riskiest (step 6)." onExit={onExit}>
      <Brief91 k="c1_ladder" />
      <OrderGame items={LADDER} labels={["1 · safest", "2", "3", "4", "5", "6 · riskiest"]} onDone={(r) => finish(Math.max(14, 30 - r.errors * 2), { errors: r.errors })} />
    </ActShell>
  );
}

const CFG103 = {
  n: 3, KEY: "10P3", title: "Global Investor 🌍", weeks: G10P3_WEEKS,
  question: "How do I go from saver to investor — with controlled risk, protection from the dollar and zero scams?",
  howyear: "With the math of Period 2 in your hands, you become an investor. In Class 1 you receive US$1,000 (simulated) and allocate it according to your profile: bonds, the S&P 500, a Colombia ETF, one tech stock, a stablecoin and bitcoin. From Class 2 to Class 6 there is a Market Week every class: news moves prices (illustrative scenarios, the same for everybody) and your decisions make the difference. You also learn where your money should 'sleep', dollar hedging, ETFs, scams and how to judge a project with NPV. You close with a Shareholder Pitch and your third Future Me Card: My Investor Card.",
  chips: ["🌍 US$1,000 Lab", "📘 Future Pages 13–18", "📈 Investor Card"],
  bigKeys: ["c8_pitch"], pageKeys: ["c1_allocate", "c2_bank", "c4_tycoon", "c5_scam", "c6_judge", "c7_dashboard"],
  panel: (ctx, compact) => {
    const r = ctx.resp; const P = portOf(r);
    return <FutureMePanel id={fmIdOf(r.__p1)} have={ctx.have} compact={compact} studentName={ctx.name} title="PERIOD 3 · GLOBAL INVESTOR" stats={[{ l: "🧬 Profile", v: r.c1_dna ? PROFILES[r.c1_dna.profile].l : "—" }, { l: "📦 NAV", v: r.c1_allocate ? usd0(P.nav) : "—" }, { l: "🎯 ROI", v: r.c1_allocate ? pctTxt(P.roi) : "—", c: r.c1_allocate ? (P.roi >= 0 ? "pos" : "neg") : "" }, { l: "📅 Market Weeks", v: `${P.done}/5` }]} />;
  },
  render: (act, ctx) => {
    const L = mkLearn(ctx, Brief91);
    const P = { onSave: ctx.save, onExit: ctx.exit };
    const wk = (n) => <MarketWeek n={n} resp={ctx.resp} existing={ctx.existing} {...P} />;
    switch (act) {
      case "c1_video": return L.video("c1_video", VID_RISK10, "Risk & Return", VQ_RISK10);
      case "c1_dna": return <InvestorDNA existing={ctx.existing} {...P} />;
      case "c1_ladder": return <RiskLadder {...P} />;
      case "c1_allocate": return <AllocateLab resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c2_read": return L.reading("c2_read", "Where Does Your Money Sleep?", "Safety, liquidity and return — choose the right bed for each goal.", READ_SLEEP, GLOSS_SLEEP, Q_SLEEP, "🛏️");
      case "c2_bank": return <BankBuilder existing={ctx.existing} {...P} />;
      case "c2_real": return <NumberRounds icon={<Percent size={22} strokeWidth={2.1} />} title="Real Return Rounds 🫧" subtitle="Does your money really grow? Subtract inflation." intro={<Brief91 k="c2_real" />} rounds={REAL_R} coinsPer={3} bonus={8} doneTitle="Real-return pro! 🫧" {...P} />;
      case "c2_week1": return wk(1);
      case "c3_listen": return L.listen("c3_listen", audioDollarsMiami, "Dollars for Miami", "Two exchange houses, two very different prices.", SCRIPT_MIAMI, Q_MIAMI);
      case "c3_storm": return <DollarStorm {...P} />;
      case "c3_desk": return <NumberRounds icon={<Banknote size={22} strokeWidth={2.1} />} title="Exchange Desk 2.0 💵" subtitle="Buy, sell, spreads and fees." intro={<Brief91 k="c3_desk" />} rounds={DESK2_R} coinsPer={3} bonus={8} doneTitle="Forex pro! 💵" {...P} />;
      case "c3_week2": return wk(2);
      case "c4_video": return L.video("c4_video", VID_ETF10, "WTF Is an ETF?", VQ_ETF10);
      case "c4_tycoon": return <WallStreetTycoon existing={ctx.existing} {...P} />;
      case "c4_fraction": return <NumberRounds title="Fractional Shares 🍕" subtitle="Buy a piece of an expensive share." intro={<Brief91 k="c4_fraction" />} rounds={FRAC_R} coinsPer={3} bonus={8} {...P} />;
      case "c4_week3": return wk(3);
      case "c5_video": return L.video("c5_video", VID_STABLE10, "Stablecoins, Explained", VQ_STABLE10);
      case "c5_read": return L.reading("c5_read", "Too Good to Be True: the DMG Case", "How pyramid schemes trapped thousands of Colombians — and how to spot them today.", READ_DMG, GLOSS_DMG, Q_DMG, "🚩");
      case "c5_scam": return <ScamCity existing={ctx.existing} {...P} />;
      case "c5_week4": return wk(4);
      case "c6_read": return L.reading("c6_read", "Is This Project Worth It?", "NPV, IRR and payback with three real-life projects.", READ_NPV, GLOSS_NPV, Q_NPV, "⚖️");
      case "c6_judge": return <BusinessJudge existing={ctx.existing} {...P} />;
      case "c6_week5": return wk(5);
      case "c7_brief": return L.brief("c7_brief", "NAV, P&L & ROI", "The three numbers every portfolio manager reports.", BRIEF_PNL, GLOSS_PNL, Q_PNL, "📊");
      case "c7_rescue": return <PortfolioRescue {...P} />;
      case "c7_dashboard": return <InvestDashboard resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c8_pitch": return <ShareholderPitch resp={ctx.resp} studentName={ctx.name} userData={ctx.userData} API_URL={ctx.API_URL} existing={ctx.existing} {...P} />;
      case "c8_walk": return <FairArena userData={ctx.userData} API_URL={ctx.API_URL} grado="10-SH" title="Global Investor Championship 🏆" subtitle="Your classmates are portfolio managers. Invest your 100 coins in the best funds." brief={<Brief91 k="c8_walk" />} unitWord="fund" {...P} />;
      case "c8_boss": return <BossP3 resp={ctx.resp} studentName={ctx.name} {...P} />;
      default: return null;
    }
  },
};

export const Periodo3G10 = (props) => <PeriodShell10 cfg={CFG103} {...props} />;