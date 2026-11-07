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
import "../Styles/decimo4.css";   // 10° · Periodo 4 · Future Me
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   GRADO 10 · PERIODO 4 · FUTURE ME (B1+ a B2)
   Año "FUTURE ME": cada periodo lee las filas anteriores ("10P1"…"10P3") y suma una Future Me Card.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "10P4", Grado = "10".
   ===================================================================== */
const PERIOD_KEY = "10P4";
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
   10° · PERIODO 4 · FUTURE ME — LECTURAS (B2) Y DATOS
   (Sin videos ni audios: este periodo es de HACER. Lecturas largas con ejemplos.)
   Los datos de carreras y salarios son ILUSTRATIVOS: el estudiante investiga los reales.
   ===================================================================== */

/* ---------- LECTURA · What a Personality Test Can (and Can't) Tell You ---------- */
const READ_PERS = [
  { p: "“I'm an INFP — that's why I hate math.” “I'm an extrovert, so I can't work alone.” Maybe you have heard sentences like these. Personality tests are fun and popular, and they can be a great mirror. But a mirror is not a destiny. In this reading you will learn how to use a personality test as a tool to know yourself better — and how NOT to use it." },
  { h: "What is a personality test?" },
  { p: "A personality test is a questionnaire that describes your preferences: how you get energy, how you take in information, how you make decisions and how you organize your life. The popular 16Personalities test, for example, gives you a four-letter type like ENFJ or ISTP. Psychologists in universities usually prefer the Big Five model, which measures five traits on a scale: openness, conscientiousness (being organized and responsible), extraversion, agreeableness and emotional stability. Instead of putting you in a box, the Big Five tells you how MUCH of each trait you show." },
  { node: <MiniTable key="t" head={["Big Five trait", "High score looks like…", "Low score looks like…"]} rows={[["Openness", "curious, creative, loves new ideas", "practical, prefers the familiar"], ["Conscientiousness", "organized, plans ahead", "flexible, spontaneous"], ["Extraversion", "energized by people", "energized by quiet time"], ["Agreeableness", "cooperative, kind", "direct, competitive"], ["Emotional stability", "calm under pressure", "feels stress strongly"]]} /> },
  { h: "What it CAN tell you" },
  { p: "A good test can help you put words to things you already feel. Example 1: Sofía always studied with music and friends, and she felt tired after studying alone in silence. Her result showed high extraversion. Now she understands why group projects energize her — and she plans study sessions with classmates. Example 2: Mateo scored high in conscientiousness. He realized that his love for planning budgets in Period 2 was not an accident: careers like accounting, engineering or project management might fit him. The test opened a conversation." },
  { h: "What it CAN'T tell you" },
  { p: "A test cannot tell you what you are able to learn, how intelligent you are or what career you 'must' study. Your answers also change with your mood, your age and your experiences. Example 3: Daniel took the test on a terrible day after an exam and got a very introverted result. Two weeks later, after a football tournament, his result was different. Neither result was 'wrong': personality has stable parts and parts that move. And remember: free online tests are not clinical diagnoses — they don't measure mental health." },
  { box: "💡 Use your result as a hypothesis, not a label: “The test says I'm organized. Is that true in my real life? When? When not?”" },
  { h: "From personality to a DOFA" },
  { p: "In business, a SWOT analysis (DOFA in Spanish: Debilidades, Oportunidades, Fortalezas, Amenazas) looks at what is inside a company (strengths and weaknesses) and outside it (opportunities and threats). You can do the same with yourself. Your personality gives clues for the inside: “I'm patient” is a strength; “I get nervous when I speak in public” is a weakness I can train. The outside is the world: “Companies need people who understand data” is an opportunity; “Many simple office tasks are being automated” is a threat." },
  { node: <Mistakes key="m" items={["Using a type as an excuse: “I'm introverted, so I won't present.” Skills can be trained.", "Believing the test chooses your career.", "Confusing a fun test with a psychological diagnosis."]} /> },
  { box: "📌 Summary: tests describe preferences, not abilities · Big Five = traits on a scale · use results as a hypothesis · inside = strengths and weaknesses, outside = opportunities and threats." },
];
const GLOSS_PERS = { "Big Five": "a scientific model that measures five personality traits on a scale", "conscientiousness": "being organized, careful and responsible", "extraversion": "getting energy from people and activity", "hypothesis": "an idea you test to see if it's true", "SWOT": "Strengths, Weaknesses, Opportunities, Threats (DOFA in Spanish)", "diagnosis": "a medical or psychological evaluation by a professional" };
const Q_PERS = [
  { q: "According to the text, a personality test is…", options: ["a mirror, not a destiny.", "a scientific way to know exactly which career you must study after school.", "a medical diagnosis.", "a math exam."], correct: 0, feedback: "It helps you see yourself; it doesn't decide for you." },
  { q: "How is the Big Five different from four-letter types?", options: ["It measures how MUCH of each trait you have.", "It puts every person in one of sixteen boxes with a name and a color.", "It only measures intelligence.", "It's the same."], correct: 0, feedback: "Traits on a scale instead of boxes." },
  { q: "What does high conscientiousness look like?", options: ["Organized and planning ahead.", "Being the center of attention at every party and talking to everybody.", "Feeling stress strongly.", "Hating rules."], correct: 0, feedback: "Organized, careful, responsible." },
  { q: "Why did Daniel get two different results?", options: ["Answers change with mood and experiences.", "Because the first test was broken and gave him the result of another student.", "He lied.", "Tests are random."], correct: 0, feedback: "Personality has stable parts and parts that move." },
  { q: "What CAN'T a personality test tell you?", options: ["What you are able to learn.", "Some preferences about how you like to work and spend your energy.", "How you get energy.", "How you make decisions."], correct: 0, feedback: "It describes preferences, not abilities." },
  { q: "In a personal DOFA, “Companies need people who understand data” is…", options: ["an opportunity (external).", "a strength, because it is something positive that you have inside you.", "a weakness.", "a threat."], correct: 0, feedback: "It comes from the world outside — opportunity." },
  { q: "“I get nervous speaking in public” is…", options: ["a weakness I can train.", "a threat from the outside world that I can't control.", "an opportunity.", "a diagnosis."], correct: 0, feedback: "Internal and improvable." },
  { q: "What is the best way to use your result?", options: ["As a hypothesis to test in real life.", "As a label that explains everything you do and every decision you make.", "As an excuse.", "To ignore feedback."], correct: 0, feedback: "Check it against your real experiences." },
  { q: "Sofía discovered she is high in extraversion. What did she change?", options: ["She planned group study sessions.", "She stopped studying, because extroverts don't need to study alone ever.", "She changed schools.", "Nothing."], correct: 0, feedback: "She used the result to study in a way that energizes her." },
];

/* ---------- LECTURA · Ikigai: Why You Get Up in the Morning ---------- */
const READ_IKIGAI = [
  { p: "In Japanese, ikigai roughly means “a reason for being” — the thing that makes you want to get up in the morning. In Okinawa, an island famous for people who live long lives, many elderly people talk about their ikigai: taking care of a garden, teaching grandchildren, fishing with friends. Years later, Western writers turned the idea into a popular diagram with four circles to think about careers. The diagram is a simplification, but it's a powerful tool for your Future Me." },
  { h: "The four circles" },
  { list: ["❤️ What I love — activities that make you lose track of time.", "⭐ What I'm good at — skills you have or can build.", "🌍 What the world needs — problems people need solved.", "💰 What I can be paid for — things people or companies pay for."] },
  { p: "Where two circles meet, something interesting appears. Love + good at = passion. Good at + paid for = profession. Paid for + world needs = vocation. World needs + love = mission. In the center, where all four meet, is the ikigai: work that you love, that you're good at, that helps people and that pays your bills." },
  { h: "Model · Camila, 16" },
  { node: <MiniTable key="t" head={["Circle", "Camila's answers"]} rows={[["❤️ I love", "drawing, video games, helping my little brother with homework"], ["⭐ I'm good at", "drawing, explaining things, being patient"], ["🌍 The world needs", "better education, apps that are easy to use"], ["💰 People pay for", "app design, illustration, teaching"]]} /> },
  { p: "Camila noticed that 'designing' appeared in three circles and 'explaining' in three circles. Her possible ikigai careers: UX/UI designer for educational apps, illustrator of school books, or a teacher who creates digital materials. She wrote: “I love designing things that help people learn.” Notice the gerund: designing, helping, teaching. It's the natural way to talk about activities you love." },
  { h: "Example 2 · When a circle is missing" },
  { p: "Julián loves football and he is good at it, but very few people get paid to play professionally. Does that mean he must forget football? No — he looks for neighbors of his passion: sports physiotherapy, sports data analysis, coaching kids, sports journalism or managing a sports brand. All of them connect what he loves with what the world pays for." },
  { h: "Example 3 · Money matters, but it's not everything" },
  { p: "Valeria is good at math and finance careers pay well, but she doesn't enjoy them. A job that pays a lot but makes you unhappy is a 'comfortable emptiness'. A job you love that doesn't pay your bills is 'delight without wealth'. Your Future Me needs a balance: the Money Rules and the budget you built in Period 2 will tell you how much is 'enough'." },
  { box: "💡 Your ikigai is not a single job forever. It can change as you grow, try things and discover new skills. Think of it as a compass, not a map." },
  { node: <Mistakes key="m" items={["Choosing only what pays the most.", "Thinking your hobby must become your job.", "Believing you need to find your ikigai at 16 — you're building it."]} /> },
  { box: "📌 Summary: love + good at + world needs + paid for · intersections: passion, profession, vocation, mission · look for 'neighbors' of your passion · a compass, not a map." },
];
const GLOSS_IKIGAI = { "ikigai": "a Japanese idea: a reason for being", "passion": "what you love + what you're good at", "profession": "what you're good at + what you can be paid for", "vocation": "what you're paid for + what the world needs", "mission": "what the world needs + what you love", "gerund": "a verb with -ing used as a noun: designing, helping" };
const Q_IKIGAI = [
  { q: "What does ikigai roughly mean?", options: ["A reason for being.", "A Japanese method to get a very high salary in a short time.", "A type of exercise.", "A bank."], correct: 0, feedback: "The reason to get up in the morning." },
  { q: "Love + good at = …", options: ["passion.", "profession, because you get paid for the things that you do very well.", "vocation.", "mission."], correct: 0, feedback: "Passion." },
  { q: "Good at + paid for = …", options: ["profession.", "mission, because it is what you love and what the world needs today.", "passion.", "ikigai."], correct: 0, feedback: "Profession." },
  { q: "Which careers fit Camila's ikigai?", options: ["UX/UI designer for educational apps.", "Professional football player in a European team, because she loves video games.", "Bank teller.", "Pilot."], correct: 0, feedback: "Designing + explaining + education." },
  { q: "What did Julián do with his love for football?", options: ["He looked for 'neighbor' careers.", "He forgot football completely and studied the career that paid the most money.", "He quit school.", "Nothing."], correct: 0, feedback: "Physiotherapy, data, coaching, journalism…" },
  { q: "A job that pays a lot but makes you unhappy is called…", options: ["comfortable emptiness.", "delight without wealth, because you have a lot of money but no free time.", "a mission.", "an ikigai."], correct: 0, feedback: "Paid + good at, but no love." },
  { q: "“I love designing things.” Why 'designing'?", options: ["It's a gerund for activities.", "Because 'design' is always a past tense verb in English.", "It's a mistake.", "It's a noun only."], correct: 0, feedback: "Love + verb-ing." },
  { q: "According to the text, your ikigai is…", options: ["a compass that can change.", "one single job that you must find before you finish high school.", "a test result.", "your salary."], correct: 0, feedback: "It grows with you." },
];

/* ---------- LECTURA · Careers by the Numbers ---------- */
const READ_CAREERS = [
  { p: "Choosing a career is one of the biggest investment decisions of your life. You invest years, money and energy, and you expect a 'return': a job you like and an income that pays for the life you want. In Period 3 you learned to judge projects with NPV and payback. Now the project is YOU." },
  { h: "Five numbers to research" },
  { olist: ["Duration: how many years until you can work in the field.", "Cost: tuition per semester × semesters (+ materials, transport, food).", "Entry salary: what new graduates earn in their first job.", "Employability: how many graduates find a job in their field.", "Growth: how salaries and demand change over 10 years."] },
  { p: "In Colombia, the Observatorio Laboral para la Educación (OLE, from the Ministry of Education) publishes data about graduates: how many work formally and how much they earn on average, by program and level. University websites publish tuition. Internationally, the World Economic Forum's Future of Jobs report lists the skills and jobs that are growing — like AI and big data, analytical thinking, creative thinking and green jobs. Always write the source and the date of your data." },
  { h: "Example 1 · Two careers, side by side (illustrative numbers)" },
  { node: <MiniTable key="t" head={["", "Career A: 5-year degree", "Career B: 2-year technical program"]} rows={[["Years studying", "5", "2"], ["Cost per year", "$12,000,000", "$4,000,000"], ["Total cost", "$60,000,000", "$8,000,000"], ["Entry salary / month", "$3,200,000", "$2,000,000"], ["Starts working at", "23", "20"]]} /> },
  { p: "Career B starts earning three years earlier and costs much less. Career A costs more but pays more every month. Which is better? It depends on time: payback is the year when the money earned covers the money invested and the income you didn't earn while studying (the opportunity cost — remember Period 2!)." },
  { h: "Example 2 · Payback with opportunity cost" },
  { p: "If you started working at 18 for $1,600,000 a month, five years of study cost you about 5 × 12 × 1,600,000 = $96,000,000 in lost income, plus $60,000,000 of tuition: $156,000,000. If Career A pays $1,600,000 MORE per month than the job at 18, it recovers about $19,200,000 per year, so payback is around 8 years after graduating. If the extra is $3,000,000 per month, payback falls to about 4.3 years. Salaries grow, and scholarships or public universities change everything." },
  { h: "Example 3 · NPV of a degree" },
  { p: "Professionals compare the NPV of the cash flows of each path (studying vs. working at 18) for 20–30 years, discounted at a rate like 8%. If the NPV of studying is higher, the degree 'creates value'. But careful: the NPV ignores something important — whether you will be happy and good at that work. That's why your ikigai and your numbers must talk to each other." },
  { box: "💡 Scenarios: calculate a pessimistic (lower salary), a moderate and an optimistic case. If the career only works in the optimistic case, it's risky." },
  { node: <Mistakes key="m" items={["Comparing only the salary, not the cost and the years.", "Forgetting the income you don't earn while you study.", "Using one number from social media instead of official data with a date."]} /> },
  { box: "📌 Summary: duration · cost · entry salary · employability · growth · payback includes opportunity cost · NPV compares paths · use real sources (OLE, universities, WEF)." },
];
const GLOSS_CAREERS = { "tuition": "the money you pay to study (matrícula)", "employability": "how easy it is to find a job in that field", "entry salary": "the salary of a first job after graduating", "Observatorio Laboral": "Colombian government data about graduates and their salaries", "scenario": "a possible future with different numbers (pessimistic, moderate, optimistic)" };
const Q_CAREERS = [
  { q: "Which Colombian source publishes graduates' employment and salary data?", options: ["The Observatorio Laboral para la Educación.", "The comments that people write on social media about their universities.", "DANE's IPC.", "The TRM."], correct: 0, feedback: "OLE, from the Ministry of Education." },
  { q: "Career A costs $12,000,000 per year for 5 years. Total tuition?", options: ["$60,000,000.", "$12,000,000, because you only pay the first year and then it's free.", "$17,000,000.", "$120,000,000."], correct: 0, feedback: "5 × 12,000,000." },
  { q: "What else must you count besides tuition?", options: ["The income you don't earn while studying.", "Only the price of the books that you need in the first semester.", "Nothing else.", "Your phone plan."], correct: 0, feedback: "Opportunity cost." },
  { q: "If a degree recovers $19,200,000 per year and the total investment is $156,000,000, payback is about…", options: ["8 years.", "19 years, because the investment is very big and the salary is very small.", "2 years.", "156 years."], correct: 0, feedback: "156 ÷ 19.2 ≈ 8.1." },
  { q: "What does the NPV of a career ignore?", options: ["Whether you will be happy in that work.", "The money you invest in tuition during the years that you study.", "The discount rate.", "The salary."], correct: 0, feedback: "Numbers + ikigai must talk to each other." },
  { q: "Why calculate three scenarios?", options: ["To see if the career works even when things go badly.", "Because universities require three different calculations before you can enroll.", "To get three degrees.", "It's not useful."], correct: 0, feedback: "Pessimistic, moderate, optimistic." },
  { q: "Which is an advantage of Career B (technical) in the example?", options: ["It starts earning 3 years earlier.", "It always pays more than a five-year degree for the whole life of the worker.", "It's free.", "It has no risk."], correct: 0, feedback: "Lower cost and earlier income." },
  { q: "What should you write next to every career number?", options: ["The source and the date.", "Your opinion about the university and the color of its logo.", "Nothing.", "A hashtag."], correct: 0, feedback: "Data without source and date can't be trusted." },
];

/* ---------- LECTURA · Anatomy of a CV ---------- */
const READ_CV = [
  { p: "A recruiter spends, on average, only a few seconds on the first look at a CV. In those seconds, they decide: “Read more” or “Next”. Your CV (curriculum vitae, or hoja de vida) is not a list of everything you did — it's an advertisement of the value you can create. And yes: even at 16 or 17 you have things to show." },
  { h: "The six parts" },
  { olist: ["Contact: full name, a professional email, phone, city (and LinkedIn if you have one).", "Profile: 2–3 lines about who you are and what you offer.", "Education: school, expected graduation year, relevant courses.", "Experience: jobs, volunteering, school projects, family business — with results.", "Skills: technical (Excel, design, programming) and soft (teamwork, communication).", "Languages and certificates: English level (be honest: B1, B2…), courses."] },
  { h: "Model · Daniela Rojas, 17" },
  { node: <div key="cv" className="g10-cvmodel"><b>DANIELA ROJAS PÉREZ</b><span>daniela.rojas.p@email.com · +57 300 000 0000 · Bogotá</span><h5>PROFILE</h5><p>Responsible and creative 11th-grade student interested in digital marketing. I enjoy turning data into clear ideas and working in teams.</p><h5>EDUCATION</h5><p>Instituto CREAR · Bilingual high school · Expected graduation: 2028</p><h5>EXPERIENCE & PROJECTS</h5><p>• Red Paperclip Challenge (2026): traded a $500 clip up to a $90,000 skateboard in 3 trades (+17,900%).<br />• Family bakery (weekends, 2025–2026): managed social media; increased Instagram followers from 300 to 1,200.<br />• Money Dashboard (2026): built a personal budget spreadsheet with formulas and projections.</p><h5>SKILLS</h5><p>Excel/Google Sheets · Canva · public speaking · teamwork</p><h5>LANGUAGES</h5><p>Spanish (native) · English (B2)</p></div> },
  { h: "Action verbs + results" },
  { p: "Weak: “I was in charge of the social media.” Strong: “Managed the bakery's Instagram and increased followers from 300 to 1,200 in six months.” The strong version starts with an action verb (managed, created, organized, designed, led, increased, reduced) and includes a measurable result. That's the same STAR logic you will use in interviews: situation, task, action, result." },
  { h: "Example · Turning school into experience" },
  { p: "You don't need a formal job to have experience. Your FinFluent projects are real projects: you negotiated trades, analyzed data, managed a simulated portfolio and presented to a jury. Write them with numbers: “Managed a simulated US$1,000 portfolio for 5 weeks; ROI +2.1%; presented to a jury of classmates.”" },
  { box: "💡 In Colombia, many CVs include a photo and an ID number; in other countries, like the US, photos are usually NOT included. Adapt your CV to the country and the company. Never include very personal data you don't need." },
  { node: <Mistakes key="m" items={["An unprofessional email (like superhero_2009@…).", "Lying about your English level — the interview will show it.", "Long paragraphs without numbers or action verbs.", "Spelling mistakes: one typo can send your CV to the 'Next' pile."]} /> },
  { box: "📌 Summary: 6 parts · professional email · action verbs + numbers · school projects count · honest English level · adapt to the country." },
];
const GLOSS_CV = { "recruiter": "a person who looks for and selects candidates for a job", "profile": "a short summary at the top of the CV", "action verb": "a verb that shows what you did: managed, created, led", "measurable result": "a result with a number: +30%, 1,200 followers", "STAR": "Situation, Task, Action, Result" };
const Q_CV = [
  { q: "What is a CV, according to the text?", options: ["An advertisement of the value you can create.", "A complete list of absolutely everything you have done since you were born.", "A school report.", "A contract."], correct: 0, feedback: "It sells your value in a few seconds." },
  { q: "Which email is professional?", options: ["daniela.rojas.p@email.com", "princesa_gamer_2009@email.com, because it shows your personality.", "lol123@email.com", "no email needed"], correct: 0, feedback: "Name-based and simple." },
  { q: "Which line is stronger?", options: ["“Increased followers from 300 to 1,200.”", "“I was in charge of the social media of the family bakery during some weekends.”", "“I did stuff.”", "“Instagram.”"], correct: 0, feedback: "Action verb + measurable result." },
  { q: "Can a 17-year-old include school projects as experience?", options: ["Yes, with numbers and results.", "No, because only paid jobs in big companies count as real experience.", "Only sports.", "Never."], correct: 0, feedback: "Projects show real skills." },
  { q: "What should you write about your English level?", options: ["Your honest level (B1, B2…).", "Always 'fluent', because recruiters never check the level of English.", "Nothing.", "C2 always."], correct: 0, feedback: "Honesty — the interview will show it." },
  { q: "Do CVs always include a photo?", options: ["It depends on the country.", "Yes, in every country of the world, because the law requires a photo.", "Never.", "Only in the US."], correct: 0, feedback: "Common in Colombia; usually not in the US." },
  { q: "Which is an action verb?", options: ["Designed.", "Was, because it is the most common verb in English sentences.", "Very.", "Responsibility."], correct: 0, feedback: "Designed, managed, led, created…" },
  { q: "What does STAR mean?", options: ["Situation, Task, Action, Result.", "Salary, Time, Area, Responsibility of the job.", "Start, Try, Ask, Repeat.", "Skills, Talent, Attitude, Respect."], correct: 0, feedback: "The structure of strong answers and CV lines." },
];

/* ---------- LECTURA · Your Credit Score in Colombia ---------- */
const READ_CREDIT = [
  { p: "At 18, a new door opens: you can sign contracts, open accounts on your own and apply for credit. From your very first loan or credit card, a 'financial reputation' starts: your credit history. Banks look at it before lending you money for a motorcycle, a course or, one day, a house. A good history can mean lower interest rates; a bad one can mean 'no' or very expensive credit." },
  { h: "Who keeps your history?" },
  { p: "In Colombia, credit bureaus (centrales de riesgo) like DataCrédito Experian and TransUnion collect information about how people pay their loans, credit cards and some services (like phone plans). With that information they calculate a credit score: a number where higher is better. Each bureau has its own scale." },
  { h: "Your rights: Habeas Data" },
  { p: "Law 1266 of 2008 (Habeas Data) protects your financial information: you have the right to know what the bureaus say about you, to ask for corrections and to receive a warning before a company reports you negatively. Law 2157 of 2021, known as 'Borrón y cuenta nueva', updated these rules: for example, companies must notify you before a negative report, and a negative report cannot stay forever after you pay — it has a limited time. You can consult your history for free in the bureaus' official channels." },
  { h: "What moves your score" },
  { node: <MiniTable key="t" head={["Up ⬆️", "Down ⬇️"]} rows={[["Paying on time, every month", "Late payments (even small ones)"], ["Using a small part of your card limit", "Using your full limit all the time"], ["A long, stable history", "Asking for many loans in a short time"], ["Paying the full card balance", "Debts sent to collection"]]} /> },
  { h: "Example 1 · The $35,000 phone bill" },
  { p: "Santiago forgot to pay a $35,000 phone bill for three months. He was reported. Two years later, when he applied for a motorcycle loan, the bank offered him a much higher rate. A small debt created a big cost. Lesson: automatic payments and alerts protect your score." },
  { h: "Example 2 · Building history from zero" },
  { p: "Laura, 19, has no history: banks don't know her. She gets a credit card with a low limit, uses it only for her phone plan ($60,000) and pays the FULL balance every month. After a year, she has a positive history and she never paid a peso of interest." },
  { h: "Example 3 · Debt-to-income" },
  { p: "Banks also look at how much of your income goes to debts. If Andrés earns $3,000,000 and pays $1,500,000 in loans, 50% of his income is debt — too risky. A common guideline is to keep debt payments below 30–35% of your income." },
  { box: "💡 Before 18, in Colombia you usually need a parent or guardian for financial products. At 18 you become legally responsible for your own contracts — and your own credit history." },
  { node: <Mistakes key="m" items={["Ignoring small bills: they also go to the credit bureau.", "Lending your name ('prestar el nombre') for someone else's loan — the debt is yours.", "Thinking 'no history' is the same as 'good history'."]} /> },
  { box: "📌 Summary: credit history starts at 18 · bureaus: DataCrédito Experian, TransUnion · Habeas Data protects you · pay on time, use little of your limit, keep debt < ~30% of income." },
];
const GLOSS_CREDIT = { "credit history": "the record of how you pay your debts", "credit bureau": "a company that collects payment information (central de riesgo)", "credit score": "a number that summarizes your credit history", "Habeas Data": "your right to know and correct your personal data", "debt-to-income": "the % of your income that goes to debt payments", "collection": "when a company tries to recover a debt you didn't pay" };
const Q_CREDIT = [
  { q: "When does your own credit history usually start?", options: ["With your first credit product as an adult.", "On the day you are born, when your parents register you at the notary.", "At 30.", "Never."], correct: 0, feedback: "From your first loan or card." },
  { q: "Which are Colombian credit bureaus?", options: ["DataCrédito Experian and TransUnion.", "DANE and the Banco de la República, which publish inflation and interest rates.", "Fogafín.", "OLE."], correct: 0, feedback: "Centrales de riesgo." },
  { q: "What does the Habeas Data law protect?", options: ["Your right to know and correct your financial data.", "The right of banks to publish your debts on social media without telling you.", "Your salary.", "Your passwords."], correct: 0, feedback: "Law 1266 of 2008." },
  { q: "What happened to Santiago?", options: ["A small unpaid bill made his loan more expensive.", "He got a lower rate because he had a lot of debts with different companies.", "Nothing.", "He won a prize."], correct: 0, feedback: "Small debts, big costs." },
  { q: "How did Laura build her history?", options: ["Small card use, full payment every month.", "She used her full card limit and paid only the minimum to keep the bank happy.", "She asked for 10 loans.", "She lent her name."], correct: 0, feedback: "Use little, pay all, on time." },
  { q: "Andrés earns $3,000,000 and pays $1,500,000 in debts. His debt-to-income is…", options: ["50% — too risky.", "15%, which is a very healthy number for a young professional.", "30%.", "5%."], correct: 0, feedback: "1.5 ÷ 3 = 50%." },
  { q: "Which action LOWERS your score?", options: ["Late payments.", "Paying the full balance of your credit card every single month on time.", "Using little of your limit.", "A long history."], correct: 0, feedback: "Even small delays count." },
  { q: "Why is 'lending your name' dangerous?", options: ["The debt becomes yours.", "Because the bank gives you a lower rate and you pay less interest in the future.", "It isn't.", "It's illegal for adults."], correct: 0, feedback: "If they don't pay, YOUR history suffers." },
];

/* ---------- RUSH · DOFA: inside or outside? ---------- */
const RUSH_DOFA = {
  buckets: [
    { id: "s", e: "💪", l: "Strength", d: "inside · positive", c: "#16b074" }, { id: "w", e: "🔧", l: "Weakness", d: "inside · to improve", c: "#f5b23e" },
    { id: "o", e: "🚪", l: "Opportunity", d: "outside · positive", c: "#1b4a33" }, { id: "t", e: "⛈️", l: "Threat", d: "outside · risk", c: "#ff6b57" },
  ],
  items: [
    { e: "🗣️", t: "I explain ideas clearly", b: "s", why: "A skill you have: internal and positive." }, { e: "⏰", t: "I often leave homework for the last minute", b: "w", why: "Internal, and you can improve it." },
    { e: "🤖", t: "Companies need people who work with AI", b: "o", why: "A trend in the world outside you." }, { e: "📉", t: "Simple office tasks are being automated", b: "t", why: "An external risk for some jobs." },
    { e: "🎓", t: "My city has a free public university program", b: "o", why: "External and positive." }, { e: "😰", t: "I get very nervous in exams", b: "w", why: "Internal — it can be trained." },
    { e: "🌎", t: "I speak English at a B2 level", b: "s", why: "A strength you built." }, { e: "💸", t: "University costs are rising", b: "t", why: "External and negative." },
    { e: "🧩", t: "I'm patient with difficult problems", b: "s", why: "Internal and positive." }, { e: "🌱", t: "Green jobs are growing fast", b: "o", why: "A trend outside you." },
    { e: "📵", t: "I don't know how to use spreadsheets well", b: "w", why: "Internal — you can learn it." }, { e: "🏭", t: "A lot of competition for popular careers", b: "t", why: "External risk." },
  ],
};
/* ---------- RUSH · Skills of the future ---------- */
const RUSH_SKILLS = {
  buckets: [{ id: "up", e: "📈", l: "Growing skill", d: "more demand in the future", c: "#16b074" }, { id: "auto", e: "🤖", l: "Task easy to automate", d: "machines can do it", c: "#ff6b57" }],
  items: [
    { e: "🧠", t: "Analytical thinking", b: "up", why: "Employers keep ranking it among the top skills." }, { e: "⌨️", t: "Typing the same data into forms all day", b: "auto", why: "Repetitive data entry is easy to automate." },
    { e: "🎨", t: "Creative thinking", b: "up", why: "Creativity is hard to automate." }, { e: "🧾", t: "Checking simple receipts one by one", b: "auto", why: "Software can do it faster." },
    { e: "🤖", t: "Working with AI and big data", b: "up", why: "One of the fastest-growing areas." }, { e: "🤝", t: "Leadership and social influence", b: "up", why: "Human skills grow in value." },
    { e: "📞", t: "Reading the same script on every phone call", b: "auto", why: "Chatbots can follow scripts." }, { e: "🌱", t: "Environmental and green skills", b: "up", why: "Green jobs are growing." },
    { e: "🔁", t: "Copying information between spreadsheets", b: "auto", why: "A formula or a bot can do it." }, { e: "💡", t: "Curiosity and lifelong learning", b: "up", why: "Jobs change — learners adapt." },
    { e: "🏷️", t: "Scanning products at a basic checkout", b: "auto", why: "Self-checkouts already do it." }, { e: "💪", t: "Resilience and flexibility", b: "up", why: "Valued in a changing world." },
  ],
};
/* ---------- RUSH · What can I do at 18? ---------- */
const RUSH_18 = {
  buckets: [{ id: "minor", e: "👨‍👩‍👧", l: "Before 18 (with a guardian)", d: "usually needs an adult", c: "#f5b23e" }, { id: "adult", e: "🪪", l: "At 18 (on my own)", d: "legally responsible", c: "#16b074" }, { id: "never", e: "🚫", l: "Bad idea at any age", d: "protect yourself", c: "#ff6b57" }],
  items: [
    { e: "🏦", t: "Open a youth savings account", b: "minor", why: "Usually with a parent or guardian." }, { e: "💳", t: "Apply for my own credit card", b: "adult", why: "Adults with income can apply." },
    { e: "📝", t: "Sign a rental contract", b: "adult", why: "Contracts need legal age." }, { e: "🤝", t: "Lend my name for a friend's loan", b: "never", why: "The debt becomes yours." },
    { e: "🗳️", t: "Vote in elections", b: "adult", why: "At 18 in Colombia." }, { e: "🎁", t: "Receive money in a digital wallet with my parents' authorization", b: "minor", why: "Many apps require a guardian for minors." },
    { e: "🔑", t: "Share my banking password with a 'friend'", b: "never", why: "Never share passwords or codes." }, { e: "🏍️", t: "Take a loan for a motorcycle in my name", b: "adult", why: "Loans are for adults — and must be calculated." },
    { e: "📲", t: "Pay a 'fast loan' app at 5% monthly", b: "never", why: "That's around 80% E.A. — a debt trap." }, { e: "💼", t: "Work part-time with legal authorization (15–17)", b: "minor", why: "Adolescents can work only with permission and limits." },
  ],
};

/* ---------- FINAL EXAM 10° · 5 misiones + 15 preguntas ---------- */
const EXAM10_MISSIONS = [
  { tag: "💎 Value (P1)", q: "A $2,000 object is traded for one worth $9,000. Growth %?", answer: 350, unit: "%", tol: 1, hint: "(9,000 − 2,000) ÷ 2,000 × 100", explain: "350%." },
  { tag: "🧮 Math (P2)", q: "$3,000,000 at 8% E.A. for 2 years?", answer: 3499200, money: true, hint: "3,000,000 × 1.08²", explain: "$3,499,200." },
  { tag: "📈 Investing (P3)", q: "Invested US$1,000, NAV US$940. ROI %?", answer: -6, unit: "%", tol: 0.05, hint: "(940 − 1,000) ÷ 1,000 × 100", explain: "−6%." },
  { tag: "🎓 Career (P4)", q: "Total investment $120,000,000; the career recovers $15,000,000 per year. Payback in years?", answer: 8, unit: "years", hint: "120 ÷ 15", explain: "8 years." },
  { tag: "💳 Credit (P4)", q: "Income $4,000,000; debt payments $1,600,000. Debt-to-income %?", answer: 40, unit: "%", hint: "1.6 ÷ 4", explain: "40% — above the ~30–35% guideline." },
];
const EXAM10_Q = [
  { t: "Value & markets", q: "Why does barter need money?", options: ["Double coincidence of wants is hard.", "Because objects lose all their value after one year without money.", "It doesn't.", "Banks require it."], correct: 0, feedback: "Money is a medium of exchange everybody accepts." },
  { t: "Value & markets", q: "Supply falls and demand stays the same. Price…", options: ["goes up.", "goes down, because sellers want to sell all their products quickly.", "stays the same.", "disappears."], correct: 0, feedback: "Scarcity raises prices." },
  { t: "Value & markets", q: "The dollar goes up. Who benefits?", options: ["Exporters.", "Importers who pay their suppliers in dollars every month.", "Tourists going abroad.", "Nobody."], correct: 0, feedback: "More pesos per dollar sold abroad." },
  { t: "Money math", q: "1% monthly is about how much E.A.?", options: ["12.68%.", "12%, because one percent multiplied by twelve months is twelve.", "1%.", "100%."], correct: 0, feedback: "(1.01)¹² − 1." },
  { t: "Money math", q: "Paying only the card minimum…", options: ["makes the debt last much longer.", "is the fastest way to pay the debt because the bank reduces the interest.", "is free.", "cancels the debt."], correct: 0, feedback: "Minimums shrink; debt lives on." },
  { t: "Money math", q: "Inflation 7%, savings 4%. Real return?", options: ["About −3%.", "About +11%, because you add the two numbers.", "+4%.", "0%."], correct: 0, feedback: "Rate − inflation." },
  { t: "Investing", q: "An ETF reduces risk because…", options: ["it holds many companies.", "the government insures it against every possible loss in the market.", "it's a deposit.", "it never falls."], correct: 0, feedback: "Diversification." },
  { t: "Investing", q: "“30% monthly guaranteed, invite friends.” This is probably…", options: ["a Ponzi scheme.", "an excellent investment supervised by the Superintendencia Financiera.", "a CDT.", "an ETF."], correct: 0, feedback: "Guaranteed high returns + recruiting." },
  { t: "Investing", q: "A project's NPV at 12% is +$500,000. It…", options: ["creates value vs. the alternative.", "destroys value, because positive numbers in finance always mean losses.", "is illegal.", "has no risk."], correct: 0, feedback: "NPV > 0." },
  { t: "Future planning", q: "In a personal DOFA, 'green jobs are growing' is…", options: ["an opportunity.", "a strength, because it is a positive thing that you have inside you.", "a weakness.", "a threat."], correct: 0, feedback: "External and positive." },
  { t: "Future planning", q: "Good at + paid for, in the ikigai, is…", options: ["profession.", "mission, because it is what the world needs and what you love doing.", "passion.", "vocation."], correct: 0, feedback: "Profession." },
  { t: "Future planning", q: "A career's payback should include…", options: ["the income lost while studying.", "only the price of the first semester and the books.", "nothing else.", "your favorite subjects."], correct: 0, feedback: "Opportunity cost." },
  { t: "Credit & life", q: "What helps your credit score most?", options: ["Paying on time, every month.", "Asking for many loans in a short time to show the banks you are active.", "Using your full limit.", "Lending your name."], correct: 0, feedback: "Punctuality builds history." },
  { t: "Credit & life", q: "Who started investing at 16 vs. 35 with the same monthly amount?", options: ["The one at 16 usually ends with much more.", "The one at 35, because people earn more money when they are older.", "Equal.", "Nobody."], correct: 0, feedback: "Time + compounding." },
  { t: "Credit & life", q: "A STAR answer in an interview includes…", options: ["Situation, Task, Action, Result.", "Salary, Time, Area and the Responsibilities of the job you want.", "Only your strengths.", "Your favorite star."], correct: 0, feedback: "Specific stories with results." },
];
const EXAM10_TIPS = { "Value & markets": "Review Period 1: barter, supply & demand, the dollar.", "Money math": "Review Period 2: E.A. rates, the minimum-payment trap, real return.", Investing: "Review Period 3: ETFs, scams and NPV.", "Future planning": "Review your DOFA, your Ikigai and Careers by the Numbers.", "Credit & life": "Reread Your Credit Score in Colombia and replay the Time Machine and the Interview Simulator." };

/* =====================================================================
   10° · PERIODO 4 · FUTURE ME — JUEGOS
   Une todo el año: Future Me ID (P1) · Money Rules (P2) · Investor Card (P3) → Future Me Blueprint.
   ===================================================================== */
const W_GERUND = { l: "Use gerunds (-ing)", re: /\b(love|like|enjoy|good at|interested in|passionate about|dream of)\s+[a-z]+ing\b/i, ex: "I love designing… · I'm good at explaining…" };
const W_IMGOOD = { l: "I'm good at… / I need to improve…", re: /\b(i'm good at|i am good at|i need to improve|i want to improve)\b/i, ex: "I'm good at… · I need to improve…" };
const W_COND2 = { l: "Conditional 2 (If I…ed, I would…)", re: /\bif\b[^.]*\bwould\b/i, ex: "If I studied…, I would earn…" };
const W_COND3 = { l: "Conditional 3 (If I had…, I would have…)", re: /\bif\b[^.]*\bhad\b[^.]*\bwould have\b/i, ex: "If I had started at 16, I would have…" };
const W_PLANS = { l: "Future plans", re: /\b(i'm going to|i am going to|i will|i'll|i plan to|my plan is)\b/i, ex: "I'm going to · I will · I plan to" };
const ACTION_VERBS = ["managed", "created", "designed", "organized", "led", "increased", "reduced", "built", "analyzed", "presented", "negotiated", "developed", "improved", "planned", "launched", "trained", "coordinated", "achieved", "traded", "invested", "volunteered", "taught", "won", "researched"];
const CAREERS10 = [
  { k: "sw", e: "💻", l: "Software engineer", love: ["tech", "games", "puzzles"], good: ["math", "logic", "building"], need: ["technology", "education"], paid: ["programming", "analyzing data"], years: 5, cost: 12000000, sal: 3800000 },
  { k: "ux", e: "🎨", l: "UX/UI designer", love: ["art", "tech"], good: ["drawing", "empathy", "creativity"], need: ["technology", "education"], paid: ["designing", "creating content"], years: 4, cost: 10000000, sal: 3000000 },
  { k: "med", e: "🩺", l: "Doctor", love: ["helping", "science"], good: ["memory", "empathy", "biology"], need: ["health"], paid: ["treating people", "researching"], years: 6, cost: 22000000, sal: 4500000 },
  { k: "nurse", e: "💉", l: "Nurse", love: ["helping", "people"], good: ["empathy", "organizing", "biology"], need: ["health"], paid: ["treating people"], years: 5, cost: 8000000, sal: 2600000 },
  { k: "psy", e: "🧠", l: "Psychologist", love: ["helping", "people"], good: ["listening", "empathy"], need: ["health", "education"], paid: ["advising", "researching"], years: 5, cost: 10000000, sal: 2600000 },
  { k: "teach", e: "🧑‍🏫", l: "Teacher", love: ["helping", "people"], good: ["explaining", "patience"], need: ["education"], paid: ["teaching", "creating content"], years: 5, cost: 7000000, sal: 2400000 },
  { k: "env", e: "🌱", l: "Environmental engineer", love: ["nature", "science"], good: ["math", "organizing"], need: ["environment"], paid: ["building", "researching"], years: 5, cost: 11000000, sal: 3000000 },
  { k: "arch", e: "🏛️", l: "Architect", love: ["art", "building things"], good: ["drawing", "math", "creativity"], need: ["housing"], paid: ["designing", "building"], years: 5, cost: 13000000, sal: 2800000 },
  { k: "data", e: "📊", l: "Data analyst", love: ["tech", "puzzles"], good: ["math", "logic"], need: ["technology", "business"], paid: ["analyzing data"], years: 4, cost: 10000000, sal: 3500000 },
  { k: "mkt", e: "📣", l: "Digital marketer", love: ["people", "art", "business"], good: ["talking", "writing", "creativity"], need: ["business"], paid: ["selling", "creating content"], years: 4, cost: 10000000, sal: 2600000 },
  { k: "chef", e: "👩‍🍳", l: "Chef", love: ["food", "art"], good: ["creativity", "organizing"], need: ["food"], paid: ["cooking", "selling"], years: 3, cost: 9000000, sal: 2000000 },
  { k: "law", e: "⚖️", l: "Lawyer", love: ["people", "debate"], good: ["talking", "writing", "memory"], need: ["justice", "business"], paid: ["advising"], years: 5, cost: 12000000, sal: 3000000 },
  { k: "fin", e: "💼", l: "Financial analyst", love: ["business", "puzzles"], good: ["math", "logic", "organizing"], need: ["business"], paid: ["analyzing data", "advising"], years: 5, cost: 12000000, sal: 3400000 },
  { k: "physio", e: "🏃", l: "Sports physiotherapist", love: ["sports", "helping"], good: ["empathy", "biology"], need: ["health"], paid: ["treating people"], years: 5, cost: 9000000, sal: 2500000 },
  { k: "techsys", e: "🛠️", l: "Systems technician (2 years)", love: ["tech", "building things"], good: ["logic", "building"], need: ["technology"], paid: ["programming", "building"], years: 2, cost: 4000000, sal: 2000000 },
  { k: "agro", e: "🌾", l: "Agronomist", love: ["nature", "food"], good: ["biology", "organizing"], need: ["food", "environment"], paid: ["researching", "advising"], years: 5, cost: 9000000, sal: 2400000 },
  { k: "music", e: "🎵", l: "Music producer", love: ["music", "tech"], good: ["creativity", "building"], need: ["entertainment"], paid: ["creating content"], years: 4, cost: 10000000, sal: 1900000 },
  { k: "sportsbiz", e: "🏟️", l: "Sports manager", love: ["sports", "business"], good: ["organizing", "talking"], need: ["entertainment", "business"], paid: ["selling", "advising"], years: 4, cost: 10000000, sal: 2700000 },
];
const IKI = {
  love: { e: "❤️", l: "What I love", chips: ["tech", "games", "art", "helping", "science", "nature", "sports", "music", "business", "food", "people", "debate", "puzzles", "building things"] },
  good: { e: "⭐", l: "What I'm good at", chips: ["math", "logic", "drawing", "empathy", "explaining", "talking", "writing", "organizing", "building", "biology", "listening", "creativity", "patience", "memory"] },
  need: { e: "🌍", l: "What the world needs", chips: ["health", "education", "technology", "environment", "housing", "food", "business", "justice", "entertainment"] },
  paid: { e: "💰", l: "What I can be paid for", chips: ["programming", "analyzing data", "designing", "creating content", "treating people", "teaching", "advising", "researching", "building", "selling", "cooking"] },
};
const careerOf = (k) => CAREERS10.find((c) => c.k === k) || CAREERS10[0];
const matchCareers = (sel) => CAREERS10.map((c) => { let hits = 0, circles = 0; Object.keys(IKI).forEach((k) => { const n = (sel[k] || []).filter((x) => c[k].includes(x)).length; hits += n; if (n) circles++; }); return { ...c, hits, circles, score: circles * 10 + hits }; }).sort((a, b) => b.score - a.score);
const p4Career = (r) => { const d = r?.c3_detective?.careers?.[0]; const k = r?.c2_match?.top?.[0]; const base = careerOf(d?.k || k || "data"); return { ...base, l: d?.name || base.l, sal: d ? num(d.sal) : base.sal, years: d ? num(d.years) : base.years, cost: d ? num(d.cost) * 2 : base.cost, real: !!d, sample: !d && !k }; };
const profRet = (p) => (p === "con" ? 5 : p === "agg" ? 10 : 8);

/* ---------- C1 · Personality Test ---------- */
const TRAITS10 = ["curious", "organized", "creative", "calm", "sociable", "kind", "logical", "brave", "patient", "practical", "independent", "competitive"];
function PersonalityTest({ resp, existing, onSave, onExit }) {
  const p1 = resp?.__p1?.c1_id;
  const [opened, setOpened] = useState(!!existing);
  const [type, setType] = useState(existing?.type || "");
  const [traits, setTraits] = useState(existing?.traits || []);
  const [same, setSame] = useState(existing?.same || null);
  const [st, finish] = useFinish(onSave);
  const okType = /^[IE][NS][TF][JP](-[AT])?$/i.test(type.trim());
  const ok = okType && traits.length === 3 && same;
  if (st.done) return <Reward title="Test recorded! 🔎" subtitle={`${type.toUpperCase()} · ${traits.join(", ")}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Fingerprint size={22} strokeWidth={2.1} />} title="Personality Test 🔎" subtitle="Take a free test, record your result — and compare it with your Future Me ID from Period 1." onExit={onExit}>
      <Brief91 k="c1_test" />
      <div className="g10-linkcard">
        <em>🧪</em>
        <div><b>16Personalities · free test (about 10 minutes)</b><span>Answer honestly and quickly. You don't need to register to see your type (write down the 4 letters, like ENFJ-A).</span></div>
        <a className="s1-btn primary" href="https://www.16personalities.com/free-personality-test" target="_blank" rel="noreferrer" onClick={() => setOpened(true)}>Open the test ↗</a>
      </div>
      <p className="start-tip">💡 If your teacher gives you another test (for example personality.co), use that one and write the result in the same way. Remember: it's a mirror, not a label.</p>
      {opened && (
        <div className="start-block">
          <label className="p3-lbl">My type (4 letters, e.g. INFJ or ESTP-A)<input className="start-input" maxLength={6} value={type} onChange={(e) => setType(e.target.value.toUpperCase())} placeholder="ENFJ-A" /></label>
          {type && !okType && <p className="p1-hint">💡 Use the 4 letters: I/E, N/S, T/F, J/P (and -A or -T if you have it).</p>}
          <span className="terms-label">My 3 main traits ({traits.length}/3):</span>
          <div className="p1-starters">{TRAITS10.map((t) => <button key={t} type="button" className={`p1-chip ${traits.includes(t) ? "on" : ""}`} onClick={() => setTraits(traits.includes(t) ? traits.filter((x) => x !== t) : traits.length < 3 ? [...traits, t] : traits)}>{t}</button>)}</div>
        </div>
      )}
      {opened && (
        <div className="start-block g10-boss">
          <h3>⚡ Prove It · Period 1 vs. today</h3>
          {p1 ? <p>In Period 1 your Future Me ID said you are <b>{(p1.traits || []).join(", ") || "…"}</b> and your dream was <b>{p1.dream || "…"}</b>.</p> : <p>We didn't find your Future Me ID from Period 1 — think about how you described yourself at the beginning of the year.</p>}
          <p className="quiz-q">Do you still think the same?</p>
          <Tri value={same} onPick={setSame} opts={[["yes", "Yes, the same"], ["partly", "Partly"], ["no", "No, I changed"]]} />
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(25, { type: type.trim().toUpperCase(), traits, same })}>Save my result <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
    </ActShell>
  );
}

/* ---------- C1 · Work Style & Values ---------- */
const VALUES10 = [["💰", "Good income"], ["🌍", "Helping others"], ["🎨", "Creativity"], ["⏰", "Free time"], ["📈", "Learning & growth"], ["🛡️", "Stability"], ["✈️", "Travel"], ["🏆", "Recognition"], ["🤝", "Teamwork"], ["🧭", "Independence"], ["🌱", "Caring for the planet"], ["🚀", "Adventure"]];
const STYLE10 = [["solo", "Alone", "In a team"], ["routine", "Routine", "Variety"], ["inside", "Office", "Outdoors"], ["people", "Data & things", "People"]];
function WorkValues({ existing, onSave, onExit }) {
  const [vals, setVals] = useState(existing?.values || []);
  const [sty, setSty] = useState(existing?.style || { solo: 50, routine: 50, inside: 50, people: 50 });
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Your compass is ready! 🧭" subtitle={vals.join(" · ")} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Heart size={22} strokeWidth={2.1} />} title="Work Style & Values 🧭" subtitle="What matters to you in a job — and how you like to work." onExit={onExit}>
      <Brief91 k="c1_values" />
      <div className="start-block"><h3>💎 My top 5 values ({vals.length}/5) — in order</h3><div className="g10-values">{VALUES10.map(([e, l]) => { const i = vals.indexOf(l); return <button key={l} type="button" className={i >= 0 ? "on" : ""} onClick={() => setVals(i >= 0 ? vals.filter((x) => x !== l) : vals.length < 5 ? [...vals, l] : vals)}>{i >= 0 && <i>{i + 1}</i>}<em>{e}</em><span>{l}</span></button>; })}</div></div>
      <div className="start-block"><h3>🛠️ My work style</h3>{STYLE10.map(([k, a, b]) => <div key={k} className="g10-style"><span>{a}</span><input type="range" min={0} max={100} step={10} value={sty[k]} onChange={(e) => setSty({ ...sty, [k]: Number(e.target.value) })} /><span>{b}</span></div>)}</div>
      {vals.length === 5 && <div className="p1-banner good"><span>🧭 My compass: <b>{vals[0]}</b> first, then {vals.slice(1).join(", ")}. I prefer {sty.solo >= 50 ? "teams" : "working alone"}, {sty.routine >= 50 ? "variety" : "routine"}, {sty.inside >= 50 ? "outdoors" : "an office"} and {sty.people >= 50 ? "people" : "data and things"}.</span></div>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={vals.length !== 5} onClick={() => finish(22, { values: vals, style: sty })}>Save my compass <span className="coin-tag"><Coins size={15} /> +22</span></button></div>
    </ActShell>
  );
}

/* ---------- C1 · DOFA Builder · Page 19 ---------- */
const DOFA_Q = [["s", "💪 Strengths", "inside · positive"], ["w", "🔧 Weaknesses", "inside · to improve"], ["o", "🚪 Opportunities", "outside · positive"], ["t", "⛈️ Threats", "outside · risks"]];
function DofaBuilder({ resp, existing, onSave, onExit }) {
  const [d, setD] = useState(existing?.dofa || { s: ["", ""], w: ["", ""], o: ["", ""], t: ["", ""] });
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const up = (q, i, v) => setD({ ...d, [q]: d[q].map((x, k) => (k === i ? v : x)) });
  const filled = DOFA_Q.every(([q]) => d[q].every((x) => countWords(x) >= 2));
  const G = [W_IMGOOD, W_REASON];
  const t = resp?.c1_test;
  if (st.done) return <Reward title="My DOFA is ready! 🧩" subtitle="Page 19 saved." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Puzzle size={22} strokeWidth={2.1} />} title="DOFA Builder 🧩 · Page 19" subtitle="A SWOT analysis… of YOU. Two ideas in each box." onExit={onExit}>
      <Brief91 k="c1_dofa" />
      <FPBadge n={19} t="Who I am" e="🧩" />
      {t && <div className="g91-mini"><span>🔎 My type <b>{t.type}</b></span><span>✨ Traits <b>{t.traits.join(", ")}</b></span>{resp?.c1_values && <span>💎 Top value <b>{resp.c1_values.values[0]}</b></span>}</div>}
      <div className="g10-dofa" id="g10-dofa">{DOFA_Q.map(([q, l, sub]) => <div key={q} className={`q-${q}`}><b>{l}</b><small>{sub}</small>{d[q].map((x, i) => <input key={i} className="start-input" value={x} onChange={(e) => up(q, i, e.target.value)} placeholder={q === "s" ? "I'm good at…" : q === "w" ? "I need to improve…" : q === "o" ? "In the world there is…" : "A risk outside me is…"} />)}</div>)}</div>
      <div className="start-block"><h3>✍️ Page 19 · Who I am</h3><Starters items={["I'm good at…", "I need to improve… because…", "A big opportunity for me is…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={35} max={90} goals={G} placeholder="I'm good at explaining things because… I need to improve…" /></div>
      <div className="start-foot"><button className="s1-btn ghost" onClick={() => downloadPNG("g10-dofa", "My_DOFA.png")}><Download size={16} /> PNG</button><button className="s1-btn primary big" disabled={!filled || !goalsOk(text, 35, 90, G)} onClick={() => finish(30, { dofa: d, text })}>Save Page 19 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- C2 · Ikigai World Builder ---------- */
function IkigaiBuilder({ existing, onSave, onExit }) {
  const [sel, setSel] = useState(existing?.sel || { love: [], good: [], need: [], paid: [] });
  const [st, finish] = useFinish(onSave);
  const tog = (k, c) => { const a = sel[k]; setSel({ ...sel, [k]: a.includes(c) ? a.filter((x) => x !== c) : a.length < 3 ? [...a, c] : a }); };
  const all = Object.keys(IKI).every((k) => sel[k].length >= 2);
  const top = matchCareers(sel).slice(0, 4);
  if (st.done) return <Reward title="Ikigai built! 🌸" subtitle={`Top match: ${top[0].e} ${top[0].l}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Sparkles size={22} strokeWidth={2.1} />} title="Ikigai World Builder 🌸" subtitle="Choose 2–3 cards in each circle. Careers unlock where your circles meet." onExit={onExit}>
      <Brief91 k="c2_builder" />
      <div className="g10-iki">
        <svg viewBox="0 0 300 300" className="g10-iki-svg" aria-hidden="true">
          <circle cx="150" cy="95" r="80" className="c-love" /><circle cx="95" cy="150" r="80" className="c-good" /><circle cx="205" cy="150" r="80" className="c-paid" /><circle cx="150" cy="205" r="80" className="c-need" />
          <text x="150" y="40" textAnchor="middle">❤️ {sel.love.length}</text><text x="38" y="155" textAnchor="middle">⭐ {sel.good.length}</text><text x="262" y="155" textAnchor="middle">💰 {sel.paid.length}</text><text x="150" y="270" textAnchor="middle">🌍 {sel.need.length}</text>
          <text x="150" y="156" textAnchor="middle" className="mid">{all ? top[0].e : "🌸"}</text>
        </svg>
        <div>{Object.entries(IKI).map(([k, c]) => <div key={k} className="start-block g10-ikiblk"><b>{c.e} {c.l} <small>({sel[k].length}/3)</small></b><div className="g10-chips">{c.chips.map((x) => <button key={x} type="button" className={sel[k].includes(x) ? "on" : ""} onClick={() => tog(k, x)}>{x}</button>)}</div></div>)}</div>
      </div>
      {all && (
        <>
          <h3 className="g94-h">🔓 Careers unlocked</h3>
          <div className="g10-careers">{top.map((c) => <div key={c.k} className={c.circles === 4 ? "iki" : ""}><em>{c.e}</em><b>{c.l}</b><span>{"●".repeat(c.circles)}{"○".repeat(4 - c.circles)} circles</span><small>{c.circles === 4 ? "🌸 IKIGAI match" : c.circles === 3 ? "Very close" : "Partial match"}</small><i>Entry salary (illustrative): {cop(c.sal)}</i></div>)}</div>
          {top[0].sal < 2200000 && <div className="p1-banner"><span>💡 Your top match pays less than others (illustrative). Remember Julián: look for “neighbor” careers that keep what you love AND pay your bills.</span></div>}
        </>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!all} onClick={() => finish(28, { sel, top: top.map((c) => c.k) })}>{all ? "Save my Ikigai" : "Choose at least 2 in each circle"} <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}

/* ---------- C2 · Career Match · Page 20 ---------- */
function CareerMatch({ resp, existing, onSave, onExit }) {
  const sel = resp?.c2_builder?.sel;
  const list = sel ? matchCareers(sel).slice(0, 6) : CAREERS10.slice(0, 6);
  const [top, setTop] = useState(existing?.top || []);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const G = [W_GERUND, W_REASON];
  if (st.done) return <Reward title="My Top 3 careers! 🎯" subtitle={top.map((k) => careerOf(k).l).join(" · ")} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Target size={22} strokeWidth={2.1} />} title="Career Match · My Top 3 🎯 · Page 20" subtitle="From your Ikigai to three careers you will research with real data." onExit={onExit}>
      <Brief91 k="c2_match" />
      <FPBadge n={20} t="My Ikigai" e="🌸" />
      {!sel && <div className="p1-banner bad"><span>Build your Ikigai first (Ikigai World Builder). Now you see a general list.</span></div>}
      <div className="g10-careers pick">{list.map((c) => { const i = top.indexOf(c.k); return <button key={c.k} type="button" className={i >= 0 ? "on" : ""} onClick={() => setTop(i >= 0 ? top.filter((x) => x !== c.k) : top.length < 3 ? [...top, c.k] : top)}>{i >= 0 && <i className="n">{i + 1}</i>}<em>{c.e}</em><b>{c.l}</b>{c.circles != null && <span>{"●".repeat(c.circles)}{"○".repeat(4 - c.circles)}</span>}</button>; })}</div>
      <div className="start-block"><h3>✍️ Page 20 · My Ikigai (gerunds)</h3><Starters items={["I love…ing", "I'm good at…ing", "I'm interested in…ing because…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="I love designing things and I'm good at explaining… That's why…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={top.length !== 3 || !goalsOk(text, 30, 80, G)} onClick={() => finish(30, { top, text })}>{top.length !== 3 ? `Choose 3 careers (${top.length}/3)` : "Save Page 20"} <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- C3 · Career Detective (datos reales) ---------- */
const DEMAND = ["High", "Medium", "Low"];
function CareerDetective({ resp, existing, onSave, onExit }) {
  const t = resp?.c2_match?.top || ["data", "ux"];
  const init = existing?.careers || t.slice(0, 2).map((k) => { const c = careerOf(k); return { k, name: c.l, uni: "", years: String(c.years), cost: String(Math.round(c.cost / 2)), sal: String(c.sal), demand: "", source: "" }; });
  const [cs, setCs] = useState(init);
  const [st, finish] = useFinish(onSave);
  const up = (i, f, v) => setCs(cs.map((c, k) => (k === i ? { ...c, [f]: v } : c)));
  const ok = cs.every((c) => countWords(c.name) >= 1 && countWords(c.uni) >= 1 && num(c.years) > 0 && num(c.cost) >= 0 && num(c.sal) > 0 && c.demand && countWords(c.source) >= 1);
  if (st.done) return <Reward title="Case solved, detective! 🕵️" subtitle="Your careers now have real numbers." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Career Detective 🕵️" subtitle="Research 2 careers in real sources. Replace the illustrative numbers with the real ones." onExit={onExit}>
      <Brief91 k="c3_detective" />
      <div className="g10-linkcard"><em>🔗</em><div><b>Where to look</b><span>Observatorio Laboral para la Educación (graduados.gov.co) · university websites (matrícula) · WEF Future of Jobs report · job portals (salary offers).</span></div></div>
      <div className="g10-two">{cs.map((c, i) => (
        <div key={i} className="start-block g10-detect">
          <h3>{careerOf(c.k).e} Career {i + 1}</h3>
          <label className="p3-lbl">Career<input className="start-input" value={c.name} onChange={(e) => up(i, "name", e.target.value)} /></label>
          <label className="p3-lbl">University / institution<input className="start-input" value={c.uni} onChange={(e) => up(i, "uni", e.target.value)} placeholder="Universidad Nacional, SENA…" /></label>
          <div className="g10-trade-grid"><label className="p3-lbl">Years<input className="start-input" type="number" value={c.years} onChange={(e) => up(i, "years", e.target.value)} /></label><label className="p3-lbl">Cost per semester<MoneyInput value={c.cost} onChange={(v) => up(i, "cost", v)} /></label></div>
          <label className="p3-lbl">Entry salary per month<MoneyInput value={c.sal} onChange={(v) => up(i, "sal", v)} /></label>
          <span className="terms-label">Demand:</span><div className="g10-chips">{DEMAND.map((x) => <button key={x} type="button" className={c.demand === x ? "on" : ""} onClick={() => up(i, "demand", x)}>{x}</button>)}</div>
          <label className="p3-lbl">Source (website or document)<input className="start-input" value={c.source} onChange={(e) => up(i, "source", e.target.value)} placeholder="graduados.gov.co · 2026" /></label>
          <div className="g91-mini"><span>Total tuition <b>{cop(num(c.cost) * 2 * num(c.years))}</b></span></div>
        </div>
      ))}</div>
      <p className="start-tip">⚠️ The starting numbers are illustrative estimates. Your grade improves when you replace them with real data and its source.</p>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30, { careers: cs.map((c) => ({ ...c, at: nowISO() })) })}>Save my research <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- C3 · Is My Degree Worth It? · Page 21 ---------- */
const flowsPath = (start, years, costYear, sal, grow, horizon) => { const f = []; for (let a = 18; a <= horizon; a++) { const y = a - 18; if (y < start) f.push(0); else if (y < start + years) f.push(-costYear); else f.push(sal * 12 * Math.pow(1 + grow, y - start - years)); } return f; };
function DegreeWorth({ resp, existing, onSave, onExit }) {
  const det = resp?.c3_detective?.careers || [];
  const opts = det.length ? det.map((c) => ({ name: c.name, years: num(c.years), costY: num(c.cost) * 2, sal: num(c.sal) })) : [careerOf(resp?.c2_match?.top?.[0] || "data")].map((c) => ({ name: c.l, years: c.years, costY: c.cost, sal: c.sal }));
  const [ci, setCi] = useState(0);
  const [sc, setSc] = useState("mod");
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const C = opts[ci]; const f = sc === "pes" ? 0.75 : sc === "opt" ? 1.25 : 1;
  const H = 45;
  const work = flowsPath(0, 0, 0, 1600000, 0.02, H);
  const tech = flowsPath(0, 2, 4000000, 2000000 * f, 0.03, H);
  const deg = flowsPath(0, C.years, C.costY, C.sal * f, 0.04, H);
  const npv = (fl) => fl.reduce((a, c, t) => a + c / Math.pow(1.08, t), 0);
  const cum = (fl) => { let s = 0; return fl.map((c) => (s += c)); };
  const cw = cum(work), ct = cum(tech), cd = cum(deg);
  const pb = cd.findIndex((v, i) => i > 0 && v >= cw[i]);
  const ages = Array.from({ length: H - 17 }, (_, i) => 18 + i);
  const idx = ages.map((_, i) => i).filter((i) => i % 3 === 0 || i === ages.length - 1);
  const G = [W_COND2, W_NUMBERS(2)];
  if (st.done) return <Reward title="Verdict on my degree! 🎓" subtitle={pb >= 0 ? `Payback at age ${18 + pb}` : "No payback before 45 in this scenario"} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<GraduationCap size={22} strokeWidth={2.1} />} title="Is My Degree Worth It? 🎓 · Page 21" subtitle="Career Stock Exchange: your degree vs. working at 18 vs. a 2-year technical program — until age 45." onExit={onExit}>
      <Brief91 k="c3_worth" />
      <FPBadge n={21} t="My career with numbers" e="🎓" />
      {!det.length && <div className="p1-banner bad"><span>You are using illustrative data. Do the Career Detective to use YOUR research.</span></div>}
      {opts.length > 1 && <Tri value={ci} onPick={setCi} opts={opts.map((o, i) => [i, o.name])} />}
      <Tri value={sc} onPick={setSc} opts={[["pes", "😟 Pessimistic (−25%)"], ["mod", "🙂 Moderate"], ["opt", "🤩 Optimistic (+25%)"]]} />
      <div className="g10-kpis"><div><small>🎓 {C.name}: NPV at 8%</small><b className={npv(deg) >= npv(work) ? "pos" : "neg"}>{cop(npv(deg))}</b></div><div><small>🛠️ Technical: NPV</small><b>{cop(npv(tech))}</b></div><div><small>💼 Work at 18: NPV</small><b>{cop(npv(work))}</b></div><div><small>⏱️ Payback vs. work at 18</small><b>{pb >= 0 ? `age ${18 + pb}` : "after 45"}</b></div></div>
      <ChartCard title="Cumulative money (not discounted), age 18 → 45" legend={[{ name: C.name, color: "#16b074" }, { name: "Technical", color: "#f5b23e" }, { name: "Work at 18", color: "#ff6b57" }]}>
        <LineChart labels={idx.map((i) => `${ages[i]}`)} series={[{ name: C.name, values: idx.map((i) => Math.round(cd[i])), color: "#16b074" }, { name: "Technical", values: idx.map((i) => Math.round(ct[i])), color: "#f5b23e" }, { name: "Work at 18", values: idx.map((i) => Math.round(cw[i])), color: "#ff6b57" }]} />
      </ChartCard>
      <p className="start-tip">💡 Assumptions: work at 18 = $1,600,000/month (+2%/year) · technical = 2 years, $4,000,000/year, $2,000,000/month (+3%) · degree = your data (+4%/year) · discount rate 8%. Scholarships or public universities change everything!</p>
      <div className="start-block"><h3>✍️ Page 21 · My career with numbers (conditional 2)</h3><Starters items={["If I studied…, I would earn…", "If I worked at 18, I would…", "In the pessimistic case…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={35} max={90} goals={G} placeholder="If I studied data analysis, I would earn $3,500,000 a month… The payback would be at age…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(text, 35, 90, G)} onClick={() => finish(32, { career: C.name, scenario: sc, npvDeg: Math.round(npv(deg)), npvWork: Math.round(npv(work)), npvTech: Math.round(npv(tech)), paybackAge: pb >= 0 ? 18 + pb : null, text })}>Save Page 21 <span className="coin-tag"><Coins size={15} /> +32</span></button></div>
    </ActShell>
  );
}

/* ---------- C4 · CV Fixer ---------- */
const CV_LINES = [
  { t: "Juan Esteban Pérez · reydelfreefire2009@email.com · Bogotá", bad: true, fix: "Use a professional email: juan.perez@email.com." },
  { t: "Profile: I am a student. I like many things and I want a job.", bad: true, fix: "Be specific: 'Organized 11th-grade student interested in logistics…'" },
  { t: "Education: Instituto CREAR · Expected graduation: 2028", bad: false },
  { t: "Experience: I did stuff in my uncle's store.", bad: true, fix: "Action verb + result: 'Organized the inventory of my uncle's store and reduced lost products by 20%.'" },
  { t: "Project: Red Paperclip Challenge — traded a clip up to a bicycle in 4 trades.", bad: false },
  { t: "Languages: English (native), French (fluent), Chinese (fluent)", bad: true, fix: "Be honest: 'English (B2)'. The interview will show your level." },
  { t: "Skills: Excel, teamwork, puntual, comunication", bad: true, fix: "Check spelling and language: 'punctual, communication'." },
  { t: "References: my mom (she says I'm the best)", bad: true, fix: "Use a teacher or a coach, or write 'available on request'." },
  { t: "Achievement: Money Math Certificate (FinFluent, 2026)", bad: false },
];
function CVFixer({ onSave, onExit }) {
  const [flag, setFlag] = useState({});
  const [checked, setChecked] = useState(false);
  const [st, finish] = useFinish(onSave);
  const right = CV_LINES.filter((l, i) => !!flag[i] === l.bad).length;
  if (st.done) return <Reward title="CV fixed! 🛠️" subtitle={`${right}/${CV_LINES.length} lines judged correctly`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<FileText size={22} strokeWidth={2.1} />} title="CV Fixer 🛠️" subtitle="Juan's CV has 6 errors. Flag them before a recruiter sees it." onExit={onExit}>
      <Brief91 k="c4_fixer" />
      <div className="g10-cvfix">{CV_LINES.map((l, i) => <button key={i} type="button" disabled={checked} className={`${flag[i] ? "on" : ""} ${checked ? (l.bad ? "bad" : "good") : ""}`} onClick={() => setFlag({ ...flag, [i]: !flag[i] })}><span>{flag[i] ? "🚩" : "▫️"}</span><p>{l.t}{checked && l.bad && <small>✅ {l.fix}</small>}</p></button>)}</div>
      <div className="g91-mini"><span>Flags <b>{Object.values(flag).filter(Boolean).length}/6</b></span>{checked && <span className={right >= 8 ? "pos" : "neg"}>Correct judgments <b>{right}/{CV_LINES.length}</b></span>}</div>
      <div className="start-foot">{!checked ? <button className="s1-btn primary big" disabled={Object.values(flag).filter(Boolean).length !== 6} onClick={() => setChecked(true)}>Check my flags</button> : <button className="s1-btn primary big" onClick={() => finish(12 + right * 2, { right })}>Finish <span className="coin-tag"><Coins size={15} /> +{12 + right * 2}</span></button>}</div>
    </ActShell>
  );
}

/* ---------- C4 · CV Builder · Page 22 ---------- */
function CVBuilder({ resp, studentName, existing, onSave, onExit }) {
  const p1 = resp?.__p1 || {}, p2 = resp?.__p2 || {}, p3 = resp?.__p3 || {};
  const sugg = [
    p1.c8_pitch ? `Traded a simple object up ${pctTxt(p1.c8_pitch.growth || 0, 0)} in ${p1.c8_pitch.trades || 3} real trades (Red Paperclip Challenge, 2026).` : "Negotiated real trades in the Red Paperclip Challenge (2026).",
    p2.c8_dashboard ? "Built a personal budget dashboard with formulas and a 10-year savings projection (Money Math Lab)." : "Created a personal budget spreadsheet with formulas (Money Math Lab).",
    p3.c7_dashboard ? `Managed a simulated US$1,000 global portfolio for 5 weeks; ROI ${pctTxt(p3.c7_dashboard.roi)}.` : "Managed a simulated US$1,000 global portfolio and presented it to a jury.",
    p2.c8_boss?.passed ? "Earned the FinFluent Money Math Certificate (2026)." : "",
  ].filter(Boolean);
  const e = existing || {};
  const [f, setF] = useState({ name: e.name || studentName, email: e.email || "", phone: e.phone || "", city: e.city || "", profile: e.profile || "", edu: e.edu || "Instituto CREAR · Bilingual high school · Expected graduation: 2028", exp: e.exp || "", skills: e.skills || "", lang: e.lang || "Spanish (native) · English (B1/B2)" });
  const [st, finish] = useFinish(onSave);
  const up = (k, v) => setF({ ...f, [k]: v });
  const verbs = ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\b`, "i").test(`${f.exp} ${f.profile}`));
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) && !/(\d{4,}|gamer|princes|lol|xx|king|reina)/i.test(f.email);
  const ok = f.name.trim() && emailOk && countWords(f.city) >= 1 && countWords(f.profile) >= 12 && countWords(f.exp) >= 20 && verbs.length >= 3 && countWords(f.skills) >= 3;
  if (st.done) return <Reward title="My first CV! 📄" subtitle="Page 22 saved — download it and keep improving it." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<FileText size={22} strokeWidth={2.1} />} title="CV Builder 📄 · Page 22" subtitle="Your first CV in English — with your real FinFluent projects." onExit={onExit}>
      <Brief91 k="c4_cv" />
      <FPBadge n={22} t="My first CV" e="📄" />
      <div className="g10-cvgrid">
        <div className="start-block">
          <label className="p3-lbl">Full name<input className="start-input" value={f.name} onChange={(x) => up("name", x.target.value)} /></label>
          <div className="g10-trade-grid"><label className="p3-lbl">Professional email<input className="start-input" value={f.email} onChange={(x) => up("email", x.target.value)} placeholder="name.lastname@email.com" /></label><label className="p3-lbl">City<input className="start-input" value={f.city} onChange={(x) => up("city", x.target.value)} /></label></div>
          {f.email && !emailOk && <p className="p1-hint">💡 Use a simple, professional email (name + last name).</p>}
          <label className="p3-lbl">Phone (optional)<input className="start-input" value={f.phone} onChange={(x) => up("phone", x.target.value)} /></label>
          <label className="p3-lbl">Profile (2–3 lines, 12+ words)<textarea className="start-input" rows={2} value={f.profile} onChange={(x) => up("profile", x.target.value)} placeholder="Responsible and creative 11th-grade student interested in…" /></label>
          <label className="p3-lbl">Education<input className="start-input" value={f.edu} onChange={(x) => up("edu", x.target.value)} /></label>
          <label className="p3-lbl">Experience & projects (20+ words, 3 action verbs)<textarea className="start-input" rows={4} value={f.exp} onChange={(x) => up("exp", x.target.value)} placeholder="• Managed… • Created… • Organized…" /></label>
          <span className="terms-label">Tap to add your real projects:</span>
          <div className="g10-sugg">{sugg.map((s) => <button key={s} type="button" onClick={() => up("exp", (f.exp.trim() ? `${f.exp.trim()}\n` : "") + `• ${s}`)}>+ {s}</button>)}</div>
          <div className="g91-mini"><span className={verbs.length >= 3 ? "pos" : ""}>Action verbs <b>{verbs.length}</b> {verbs.slice(0, 5).join(", ")}</span></div>
          <label className="p3-lbl">Skills<input className="start-input" value={f.skills} onChange={(x) => up("skills", x.target.value)} placeholder="Excel · public speaking · teamwork · Canva" /></label>
          <label className="p3-lbl">Languages<input className="start-input" value={f.lang} onChange={(x) => up("lang", x.target.value)} /></label>
        </div>
        <div className="g10-cv" id="g10-cv">
          <b>{(f.name || "YOUR NAME").toUpperCase()}</b>
          <span>{[f.email, f.phone, f.city].filter(Boolean).join(" · ") || "email · phone · city"}</span>
          <h5>PROFILE</h5><p>{f.profile || "…"}</p>
          <h5>EDUCATION</h5><p>{f.edu}</p>
          <h5>EXPERIENCE & PROJECTS</h5><p className="pre">{f.exp || "…"}</p>
          <h5>SKILLS</h5><p>{f.skills || "…"}</p>
          <h5>LANGUAGES</h5><p>{f.lang}</p>
        </div>
      </div>
      <div className="start-foot"><button className="s1-btn ghost" onClick={() => downloadPNG("g10-cv", "My_CV.png")}><Download size={16} /> Download CV (PNG)</button><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(34, { ...f, verbs })}>Save Page 22 <span className="coin-tag"><Coins size={15} /> +34</span></button></div>
    </ActShell>
  );
}

/* ---------- C4 · Interview Simulator (STAR) ---------- */
const INT_Q = [
  { q: "Tell me about yourself.", options: ["I'm an organized 11th-grader who loves data. I built a budget dashboard and managed a simulated portfolio, so I'm ready to learn fast.", "Well… I'm a normal student, I guess. I like music, my friends, my phone and many other things, and I don't really know what else to say about myself right now, sorry, I'm a little nervous.", "I'm the best student in my school. Nobody is better than me at anything."], correct: 0, explain: "Short, specific, connected to the job — with proof." },
  { q: "Tell me about a time you solved a problem.", options: ["Our food sale had low sales (S). I had to find why (T). I made a spreadsheet and changed the products (A). We beat the goal by $250,000 (R).", "I solve problems all the time because I'm a very responsible person and I always work really hard in every single project at school, so my teachers and my classmates always say I'm good at it.", "I never have problems."], correct: 0, explain: "That's STAR: Situation, Task, Action, Result." },
  { q: "What is your biggest weakness?", options: ["I used to get nervous presenting, so I practiced in FinFluent pitches and now I feel more confident.", "Honestly, I think my biggest weakness is that I'm a perfectionist and I work too much, which is really a weakness that all the very good workers have, so it's not a real problem for the company.", "I don't have weaknesses."], correct: 0, explain: "Honest + what you are doing to improve." },
  { q: "Why do you want to work here?", options: ["I researched your company: you help small businesses with data, and I want to learn that while I contribute my Excel skills.", "Because I need some extra money for the weekends and for my plans with friends, and this job is very close to my house, so it's easy for me to arrive on time every day without taking the bus.", "My mom told me to apply."], correct: 0, explain: "Show research and the value you bring." },
  { q: "Do you have any questions for us?", options: ["Yes: what does a successful first month look like in this role?", "No, I think you already explained everything very well, thank you very much for your time.", "How many vacation days do I get?"], correct: 0, explain: "A smart question shows interest and maturity." },
];
const STAR = [["s", "S · Situation", "Where and when?"], ["t", "T · Task", "What did you have to do?"], ["a", "A · Action", "What did YOU do?"], ["r", "R · Result", "What happened? (a number!)"]];
function InterviewSim({ existing, onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [first, setFirst] = useState(0);
  const [s, setS] = useState(existing?.star || {});
  const [offer, setOffer] = useState(existing?.offer || null);
  const [why, setWhy] = useState(existing?.why || "");
  const [st, finish] = useFinish(onSave);
  const starOk = STAR.every(([k]) => countWords(s[k]) >= (k === "a" ? 8 : 4)) && /\d/.test(s.r || "");
  if (st.done) return <Reward title="You're hired! 🤝" subtitle="STAR answers win interviews." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Users size={22} strokeWidth={2.1} />} title="Interview Simulator 🎙️" subtitle="Café Montaña, a growing company, interviews you for a part-time job." onExit={onExit}>
      <Brief91 k="c4_interview" />
      <Steps91 labels={["1 · 5 questions", "2 · My STAR answer", "3 · Two offers"]} at={stage} />
      {stage === 0 && <RoundsRunner rounds={INT_Q.map((x) => ({ tag: "🎙️ The interviewer asks", ...x }))} doneLabel="Write my STAR answer" onDone={(r) => { setFirst(r.firstTry); setStage(1); }} />}
      {stage === 1 && (
        <>
          <p className="quiz-q">“Tell me about a time you worked in a team to reach a goal.” Build your STAR answer:</p>
          <div className="g10-star">{STAR.map(([k, l, q]) => <label key={k}><b>{l}</b><small>{q}</small><textarea className="start-input" rows={2} value={s[k] || ""} onChange={(e) => setS({ ...s, [k]: e.target.value })} /></label>)}</div>
          {!(/\d/.test(s.r || "")) && s.r && <p className="p1-hint">💡 Add a number to your result (%, $, people, days…).</p>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!starOk} onClick={() => setStage(2)}>Next: two offers <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 2 && (
        <>
          <p className="quiz-q">Two companies want you! Which offer do you take?</p>
          <div className="g10-ab"><button type="button" className={offer === "A" ? "on" : ""} onClick={() => setOffer("A")}><small>OFFER A</small><em>💵</em><b>$1,800,000 / month</b><span>No training · same tasks every day</span></button><span>or</span><button type="button" className={offer === "B" ? "on" : ""} onClick={() => setOffer("B")}><small>OFFER B</small><em>📈</em><b>$1,500,000 / month</b><span>Training in data · promotion path in 1 year</span></button></div>
          {offer && <p className="g91-note">{offer === "A" ? "💡 More money today — but what's the opportunity cost in skills?" : "💡 Less today, but skills and growth can pay more later (remember compound growth!)."} Both can be good decisions — it depends on your goals.</p>}
          <label className="p3-lbl">My reason (8+ words):<input className="start-input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="I choose offer… because…" /></label>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!offer || countWords(why) < 8} onClick={() => finish(20 + first * 2, { firstTry: first, star: s, offer, why })}>Finish the interview <span className="coin-tag"><Coins size={15} /> +{20 + first * 2}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C5 · Life Simulator 25 · Page 23 ---------- */
const LIFE_OPTS = {
  home: { l: "🏠 Housing", o: [["family", "Live with family (contribution)", 400000, 0], ["shared", "Shared apartment", 800000, 0], ["studio", "Studio alone", 1400000, 0], ["buy", "Buy with a mortgage", 1900000, 1900000]] },
  move: { l: "🚌 Transport", o: [["bus", "Bus / bike", 220000, 0], ["moto", "Motorcycle with a loan", 550000, 380000], ["car", "Car with a loan", 1500000, 1100000]] },
  food: { l: "🍽️ Food", o: [["home", "Cook at home", 650000, 0], ["mix", "Mix", 950000, 0], ["out", "Restaurants & delivery", 1500000, 0]] },
  fun: { l: "🎉 Fun & subscriptions", o: [["low", "Low", 150000, 0], ["mid", "Medium", 350000, 0], ["high", "High", 700000, 0]] },
};
function LifeSim25({ resp, existing, onSave, onExit }) {
  const C = p4Career(resp);
  const p2 = resp?.__p2 || {}; const p3 = resp?.__p3 || {};
  const sal = Math.round((C.sal * Math.pow(1.04, Math.max(0, 25 - 18 - C.years))) / 10000) * 10000;
  const [ch, setCh] = useState(existing?.choices || { home: "shared", move: "bus", food: "mix", fun: "mid" });
  const [save, setSave] = useState(existing?.save ?? 15);
  const [inv, setInv] = useState(existing?.inv ?? 5);
  const [crisis, setCrisis] = useState(false);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const pick = (k) => LIFE_OPTS[k].o.find((x) => x[0] === ch[k]);
  const spend = Object.keys(LIFE_OPTS).reduce((a, k) => a + pick(k)[2], 0) + 150000;
  const debt = Object.keys(LIFE_OPTS).reduce((a, k) => a + pick(k)[3], 0);
  const sv = Math.round((sal * save) / 100), iv = Math.round((sal * inv) / 100);
  const left = sal - spend - sv - iv;
  const dti = Math.round((debt / sal) * 100);
  const fund12 = sv * 12;
  const months = spend > 0 ? r2(fund12 / spend) : 0;
  const ok = left >= 0 && dti <= 35;
  const G = [W_PLANS, W_NUMBERS(2)];
  if (st.done) return <Reward title="Life at 25: designed! 🏙️" subtitle={`Salary ${cop(sal)} · saving ${save}% · investing ${inv}%`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Home size={22} strokeWidth={2.1} />} title="Life Simulator 25 🏙️ · Page 23" subtitle={`You are 25. Your career: ${C.l}. You earn ${cop(sal)} a month${C.real ? " (from YOUR research)" : " (illustrative)"}.`} onExit={onExit}>
      <Brief91 k="c5_life" />
      <FPBadge n={23} t="My life at 25" e="🏙️" />
      {p2.c8_rules && <div className="g10-rules"><b>🧮 My Money Rules (Period 2):</b>{p2.c8_rules.rules.map((r) => <span key={r}>{r}</span>)}{p2.c8_rules.own && <span>✍️ {p2.c8_rules.own}</span>}</div>}
      <div className="g10-two">
        <div>
          {Object.entries(LIFE_OPTS).map(([k, g]) => <div key={k} className="start-block g10-lifeblk"><b>{g.l}</b><div className="g10-chips">{g.o.map(([id, l, c, d]) => <button key={id} type="button" className={ch[k] === id ? "on" : ""} onClick={() => setCh({ ...ch, [k]: id })}>{l} · {cop(c)}{d ? " 💳" : ""}</button>)}</div></div>)}
          <div className="start-block"><Ctl l="🐷 Save (emergency fund)" v={save} set={setSave} mn={0} mx={40} fmt={(v) => `${v}%`} /><Ctl l={`📈 Invest (${p3.c1_dna ? PROFILES10[p3.c1_dna.profile] : "profile"})`} v={inv} set={setInv} mn={0} mx={30} fmt={(v) => `${v}%`} /></div>
        </div>
        <div className="start-block">
          <h3>📊 My month at 25</h3>
          <div className="g10-bars">
            <div><span>Living costs</span><div><i style={{ width: `${Math.min(100, (spend / sal) * 100)}%`, background: "#f5b23e" }} /></div><b>{cop(spend)}</b></div>
            <div><span>Saving</span><div><i style={{ width: `${Math.min(100, (sv / sal) * 100)}%`, background: "#16b074" }} /></div><b>{cop(sv)}</b></div>
            <div><span>Investing</span><div><i style={{ width: `${Math.min(100, (iv / sal) * 100)}%`, background: "#1b4a33" }} /></div><b>{cop(iv)}</b></div>
            <div><span>Left</span><div><i style={{ width: `${Math.min(100, Math.max(0, (left / sal) * 100))}%`, background: left >= 0 ? "#16b074" : "#ff6b57" }} /></div><b className={left >= 0 ? "" : "neg"}>{cop(left)}</b></div>
          </div>
          <Gauge91 label="Debt payments / income" value={dti} max={100} target={35} targetLabel="35% max" good={dti <= 35} />
          <div className="g91-mini"><span>Emergency fund after 1 year <b>{cop(fund12)}</b></span><span className={months >= 3 ? "pos" : "neg"}>Covers <b>{months} months</b></span></div>
          <p className="start-tip">💡 Includes $150,000 of services (water, power, internet). 💳 = monthly loan payment.</p>
          {!crisis ? <button type="button" className="s1-btn ghost" onClick={() => setCrisis(true)}>🚨 Crisis: lose my job for 3 months</button> : <div className={`p1-banner ${months >= 3 ? "good" : "bad"}`}><span>{months >= 3 ? `You survive 3 months with your emergency fund (${months} months of costs).` : `Your fund covers only ${months} months. You would need debt — increase your saving or reduce costs.`}</span></div>}
        </div>
      </div>
      {!ok && <div className="p1-banner bad"><span>{left < 0 ? "Your month closes in red. " : ""}{dti > 35 ? "Your debt payments are above 35% of your income. " : ""}Adjust your choices.</span></div>}
      <div className="start-block"><h3>✍️ Page 23 · My life at 25 (future & plans)</h3><Starters items={["At 25, I'm going to live…", "I will save …% because…", "My plan is…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={35} max={90} goals={G} placeholder="At 25, I'm going to live in a shared apartment and I will save 15%…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok || !crisis || !goalsOk(text, 35, 90, G)} onClick={() => finish(34, { career: C.l, salary: sal, choices: ch, save, inv, spend, debt, dti, fund12, months, text })}>{!crisis ? "Test the crisis first" : "Save Page 23"} <span className="coin-tag"><Coins size={15} /> +34</span></button></div>
    </ActShell>
  );
}
const PROFILES10 = { con: "conservative", mod: "moderate", agg: "aggressive" };

/* ---------- C5 · Credit Path from 18 ---------- */
const CP_STATS = [{ k: "score", l: "Credit score (illustrative)", e: "📈", start: 500, max: 1000 }, { k: "debt", l: "Debt level", e: "💳", start: 0 }];
const CP_R = [
  { e: "🎂", title: "Month 1 · You turn 18", text: "A bank offers you a credit card. You have a part-time job.", options: [{ t: "Accept a LOW limit ($500,000)", fx: { score: 20 }, good: true, note: "A small limit is perfect to start your history." }, { t: "Ask for the highest limit possible", fx: { score: -10, debt: 20 }, note: "A big limit is a big temptation." }, { t: "No card ever — I'll have no history", fx: { score: 0 }, note: "No history ≠ good history: banks don't know you." }] },
  { e: "📱", title: "Month 2 · Phone bill", text: "Your $60,000 phone bill arrives while you are on vacation.", options: [{ t: "Set up automatic payment", fx: { score: 25 }, good: true, note: "Automation protects your score." }, { t: "Pay it 2 months late", fx: { score: -80 }, note: "Late payments are reported." }, { t: "Ignore it, it's small", fx: { score: -150, debt: 10 }, note: "Small debts can go to collection." }] },
  { e: "🧾", title: "Month 3 · Card statement: $400,000", text: "You used your card for books and transport.", options: [{ t: "Pay the full balance", fx: { score: 30 }, good: true, note: "Full payment = zero interest + a stronger score." }, { t: "Pay only the minimum", fx: { score: -10, debt: 25 }, note: "Interest starts to grow." }, { t: "Skip this month", fx: { score: -90, debt: 30 }, note: "A missed payment hurts a lot." }] },
  { e: "🤝", title: "Month 5 · A friend asks for your name", text: "“Can I take a loan in your name? I'll pay, I promise.”", options: [{ t: "Say no kindly", fx: { score: 10 }, good: true, note: "The debt would be YOURS." }, { t: "Say yes — he's my friend", fx: { score: -120, debt: 40 }, note: "He didn't pay. Now you're reported." }] },
  { e: "🛍️", title: "Month 7 · Black Friday laptop", text: "A $2,400,000 laptop. 36 installments at 2.3% monthly, or wait 4 months and pay cash.", options: [{ t: "Save 4 months and pay cash", fx: { score: 10 }, good: true, note: "No interest, no risk." }, { t: "36 installments", fx: { score: -20, debt: 40 }, note: "You'll pay almost $1,000,000 extra in interest." }] },
  { e: "📲", title: "Month 8 · Instant loan apps", text: "Three apps offer you 'fast money' with approval in 5 minutes.", options: [{ t: "Ignore them", fx: { score: 10 }, good: true, note: "Fast loans are usually very expensive." }, { t: "Ask all three to see who approves", fx: { score: -60, debt: 20 }, note: "Many applications in a short time lower your score." }] },
  { e: "🔎", title: "Month 10 · Check your history", text: "You can consult your credit history for free in the official channels.", options: [{ t: "Check it and correct any error", fx: { score: 15 }, good: true, note: "Habeas Data: it's your right." }, { t: "Never check it", fx: { score: 0 }, note: "Errors can stay hidden." }] },
  { e: "💼", title: "Month 12 · You get a raise!", text: "You earn $300,000 more per month.", options: [{ t: "Pay off my debts first, then save", fx: { score: 30, debt: -40 }, good: true, note: "Less debt, more freedom." }, { t: "Upgrade my phone with a new loan", fx: { score: -20, debt: 30 }, note: "Lifestyle inflation." }] },
];
function CreditPath({ onSave, onExit }) {
  const [res, setRes] = useState(null);
  const [st, finish] = useFinish(onSave);
  const lab = (s) => (s >= 700 ? "Excellent ⭐" : s >= 550 ? "Good 👍" : s >= 400 ? "Fair 😐" : "Poor ⚠️");
  if (st.done) return <Reward title="12 months of credit! 💳" subtitle={`Score ${res.values.score} · ${lab(res.values.score)}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<CreditCard size={22} strokeWidth={2.1} />} title="Credit Path from 18 💳" subtitle="Your first 12 months as an adult with credit. Every decision moves your score." onExit={onExit}>
      <Brief91 k="c5_credit" />
      {!res ? <ImpactRounds stats={CP_STATS} rounds={CP_R} onDone={setRes} /> : (
        <>
          <div className="g10-stats"><div><small>📈 Final score</small><b className={res.values.score >= 550 ? "pos" : "neg"}>{res.values.score} · {lab(res.values.score)}</b></div><div><small>💳 Debt level</small><b>{res.values.debt}</b></div><div><small>✅ Smart decisions</small><b>{res.good}/{CP_R.length}</b></div></div>
          <PickOne q="What builds a good credit history fastest?" options={["Small use and on-time full payments.", "Asking for many loans and cards to show the banks that you are a very active client.", "Having no card at all.", "Paying only minimums."]} correct={0} explain="Use little, pay all, on time — every month." />
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(18 + res.good * 2, { score: res.values.score, debt: res.values.debt, good: res.good })}>Save my credit path <span className="coin-tag"><Coins size={15} /> +{18 + res.good * 2}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C6 · The Time Machine: start at 16, 25 or 35 ---------- */
function TimeMachine3({ resp, existing, onSave, onExit }) {
  const p3 = resp?.__p3 || {};
  const base = resp?.c5_life ? Math.round(((resp.c5_life.salary * resp.c5_life.inv) / 100) / 10000) * 10000 : 150000;
  const [m, setM] = useState(existing?.monthly || Math.max(50000, Math.min(1000000, base || 150000)));
  const [ret, setRet] = useState(existing?.ret || profRet(p3.c1_dna?.profile));
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const ages = Array.from({ length: 45 }, (_, i) => 16 + i);
  const path = (startAge) => { const mm = mFromEa(ret / 100); let b = 0; return ages.map((a) => { if (a > startAge) for (let k = 0; k < 12; k++) b = b * (1 + mm) + m; return Math.round(b); }); };
  const A = path(16), S = path(25), Cc = path(35);
  const at = (arr, age) => arr[ages.indexOf(age)];
  const idx = ages.map((_, i) => i).filter((i) => i % 4 === 0 || i === ages.length - 1);
  const G = [W_COND3, W_NUMBERS(2)];
  if (st.done) return <Reward title="Time traveler! ⏳" subtitle={`At 60: Alex ${millions(at(A, 60))} · Sam ${millions(at(S, 60))} · Chris ${millions(at(Cc, 60))}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Hourglass size={22} strokeWidth={2.1} />} title="The Time Machine · 16 vs. 25 vs. 35 ⏳" subtitle="Alex starts investing at 16, Sam at 25, Chris at 35. Same monthly amount, same return. Who wins?" onExit={onExit}>
      <Brief91 k="c6_machine" />
      <div className="g10-two">
        <div className="start-block">
          <Ctl l="Invest every month" v={m} set={setM} mn={50000} mx={1000000} stp={10000} fmt={cop} />
          <Ctl l={`Return E.A. ${p3.c1_dna ? `(${PROFILES10[p3.c1_dna.profile]} profile)` : ""}`} v={ret} set={setRet} mn={2} mx={12} stp={0.5} fmt={(v) => `${v}%`} />
          <MiniTable head={["Age", "🧒 Alex (16)", "🧑 Sam (25)", "🧔 Chris (35)"]} rows={[25, 35, 45, 60].map((a) => [a, millions(at(A, a)), millions(at(S, a)), millions(at(Cc, a))])} />
          <div className="g91-mini"><span>Alex put in <b>{millions(m * 12 * 44)}</b></span><span>Chris put in <b>{millions(m * 12 * 25)}</b></span></div>
        </div>
        <ChartCard title="Wealth by age" legend={[{ name: "Alex (16)", color: "#16b074" }, { name: "Sam (25)", color: "#f5b23e" }, { name: "Chris (35)", color: "#ff6b57" }]}><LineChart labels={idx.map((i) => `${ages[i]}`)} series={[{ name: "Alex", values: idx.map((i) => A[i]), color: "#16b074" }, { name: "Sam", values: idx.map((i) => S[i]), color: "#f5b23e" }, { name: "Chris", values: idx.map((i) => Cc[i]), color: "#ff6b57" }]} /></ChartCard>
      </div>
      <p className="start-tip">💡 Illustrative: a constant return is a simplification — real markets go up and down (remember your Market Weeks).</p>
      <div className="start-block"><h3>✍️ Conditional 3 · If I had started…</h3><Starters items={["If Chris had started at 16, he would have…", "If I had started at 25, I would have…", "Starting early matters because…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="If Chris had started at 16, he would have had… at 60 instead of…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(text, 30, 80, G)} onClick={() => finish(30, { monthly: m, ret, alex60: at(A, 60), sam60: at(S, 60), chris60: at(Cc, 60), me25: at(A, 25), me35: at(A, 35), text })}>Save <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- C6 · Blueprint Check + ensayo ---------- */
const bpParts = (r) => [
  { e: "🔎", t: "Who I am", ok: !!(r.c1_test && r.c1_dofa) },
  { e: "🌸", t: "My Ikigai", ok: !!(r.c2_builder && r.c2_match) },
  { e: "🎓", t: "My career with numbers", ok: !!(r.c3_detective || r.c3_worth) },
  { e: "🏙️", t: "My life at 25", ok: !!r.c5_life },
  { e: "📈", t: "My investment plan", ok: !!r.c6_machine },
  { e: "💳", t: "My credit plan from 18", ok: !!r.c5_credit },
  { e: "💌", t: "My message to Future Me", ok: !!r.c6_capsule },
];
function BlueprintCheck({ resp, existing, onSave, onExit }) {
  const parts = bpParts(resp || {});
  const [run, setRun] = useState(false);
  const [left, reset] = useCountdown(150, run);
  const [peer, setPeer] = useState(existing?.peer || "");
  const [tip, setTip] = useState(existing?.tip || "");
  const [st, finish] = useFinish(onSave);
  const done = parts.filter((p) => p.ok).length;
  if (st.done) return <Reward title="Rehearsal done! 🎭" subtitle={`${done}/7 parts ready for the Summit`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<ShieldCheck size={22} strokeWidth={2.1} />} title="Blueprint Check + Rehearsal 🎭" subtitle="Your Future Me Blueprint has 7 parts. Check them and rehearse with a partner." onExit={onExit}>
      <Brief91 k="c6_blueprint" />
      <div className="g10-bp">{parts.map((p, i) => <div key={p.t} className={p.ok ? "on" : ""}><i>{i + 1}</i><em>{p.ok ? p.e : "🔒"}</em><b>{p.t}</b><small>{p.ok ? "ready ✓" : "missing"}</small></div>)}</div>
      <div className="start-block g10-boss">
        <h3>⏱️ Rehearsal timer (2 min 30 s)</h3>
        <div className={`g10-bigtimer ${left <= 20 ? "low" : ""}`}>{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</div>
        <div className="p3-card-actions"><button className="s1-btn primary" onClick={() => setRun(!run)}>{run ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start</>}</button><button className="s1-btn ghost" onClick={() => { setRun(false); reset(); }}><RefreshCw size={15} /> Reset</button></div>
        <p className="start-tip">Tell your partner your 7 parts in 2–3 minutes. Look at them, not at the screen!</p>
      </div>
      <div className="start-block"><h3>🤝 Feedback from my partner</h3><input className="start-input p3-gap" value={peer} onChange={(e) => setPeer(e.target.value)} placeholder="Partner's name" /><div className="p3-sentence edit"><span>💡 One thing to improve before the Summit:</span><input className="start-input" value={tip} onChange={(e) => setTip(e.target.value)} placeholder="Speak slower in the numbers part…" /></div></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={peer.trim().length < 2 || countWords(tip) < 5} onClick={() => finish(14 + done * 2, { parts: done, peer: peer.trim(), tip })}>Save my rehearsal <span className="coin-tag"><Coins size={15} /> +{14 + done * 2}</span></button></div>
    </ActShell>
  );
}

/* ---------- C6 · Time Capsule Letter ---------- */
const MODEL_LETTER = "Dear Future Me,\n\nToday is a normal Tuesday in 10th grade, and I'm writing this letter in my FinFluent class. Right now I'm 16. I love drawing and I'm good at explaining things, so my top career is UX design. I don't know if you finally chose it — and that's OK.\n\nThis year I learned that a peso today is worth more than a peso tomorrow, that 20% a month is always a lie, and that starting early is a superpower. I promise to save 15% of every salary and to never lend my name.\n\nI hope you are healthy, that you still laugh with your friends, and that you remember this: money is a tool, not a goal.\n\nWith love,\nMe (2026)";
function TimeCapsule({ studentName, existing, onSave, onExit }) {
  const [text, setText] = useState(existing?.letter || "Dear Future Me,\n\n");
  const [sealed, setSealed] = useState(!!existing?.letter);
  const [st, finish] = useFinish(onSave);
  const G = [W_FUTURE, W_PAST];
  if (st.done) return <Reward title="Capsule sealed! 💌" subtitle="Open it at your graduation in 2028." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Mail size={22} strokeWidth={2.1} />} title="Time Capsule Letter 💌" subtitle="Write to your Future Me. Your teacher will give it back to you at your 11th-grade graduation." onExit={onExit}>
      <Brief91 k="c6_capsule" />
      <details className="g10-model"><summary>📖 Read a model letter</summary><p className="pre">{MODEL_LETTER}</p></details>
      <div className="g10-prompts"><b>Ideas for your letter:</b><span>Who are you today? What do you love?</span><span>What did you learn about money this year?</span><span>What do you promise your Future Me?</span><span>What do you hope your life looks like?</span></div>
      {!sealed ? (
        <>
          <WordField value={text} onChange={setText} min={80} max={250} rows={10} goals={G} placeholder="Dear Future Me…" />
          <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(text, 80, 250, G)} onClick={() => setSealed(true)}>Seal my capsule 🔒</button></div>
        </>
      ) : (
        <>
          <div className="g10-capsule" id="g10-capsule"><em>💌</em><small>TIME CAPSULE · FINFLUENT · INSTITUTO CREAR</small><b>To: {studentName} · Graduation 2028</b><span>Sealed on {new Date().toLocaleDateString("en-GB")}</span><i>🔒 Do not open before graduation day</i></div>
          <div className="start-foot"><button className="s1-btn ghost" onClick={() => setSealed(false)}>Edit</button><button className="s1-btn ghost" onClick={() => downloadPNG("g10-capsule", "Time_Capsule.png")}><Download size={16} /> PNG</button><button className="s1-btn primary big" onClick={() => finish(30, { letter: text, words: countWords(text) })}>Send to my teacher <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C7 · Future Me Blueprint Pitch (proyecto grande) ---------- */
const RUB_BP = [["self", "I know myself", "personality, DOFA, Ikigai"], ["career", "Career researched with data", "years, cost, salary, NPV"], ["life", "Realistic budget & credit", "life at 25, debt ≤ 35%"], ["inv", "Investment plan with projection", "start early, profile"], ["eng", "Clear, formal English", "eye contact, structure"]];
function BlueprintPitch({ resp, studentName, have, existing, onSave, onExit }) {
  const r = resp || {}; const p1 = r.__p1 || {}; const p2 = r.__p2 || {}; const p3 = r.__p3 || {};
  const id = fmIdOf(p1); const C = p4Career(r);
  const parts = bpParts(r); const ready = parts.filter((p) => p.ok).length >= 5;
  const all4 = have[1] && have[2] && have[3];
  const chapters = (v) => [
    { e: "🔎", t: "Who I am", s: [r.c1_test ? `My personality type is ${r.c1_test.type}: I'm ${r.c1_test.traits.join(", ")}.` : "", r.c1_dofa ? `My biggest strength: ${lowFirst(dot(r.c1_dofa.dofa.s[0]))} I want to improve: ${lowFirst(dot(r.c1_dofa.dofa.w[0]))}` : "", r.c1_values ? `What matters most to me: ${r.c1_values.values.slice(0, 3).join(", ").toLowerCase()}.` : ""].filter(Boolean) },
    { e: "🌸", t: "My Ikigai", s: r.c2_match ? [`My top careers are ${r.c2_match.top.map((k) => careerOf(k).l.toLowerCase()).join(", ")}.`, r.c2_builder ? `I love ${r.c2_builder.sel.love.join(" and ")}, and I'm good at ${r.c2_builder.sel.good.join(" and ")}.` : ""].filter(Boolean) : [] },
    { e: "🎓", t: "My career with numbers", s: r.c3_worth ? [`I researched ${r.c3_worth.career}.`, `With my data, its NPV is ${cop(r.c3_worth.npvDeg)} vs. ${cop(r.c3_worth.npvWork)} if I worked at 18.`, r.c3_worth.paybackAge ? `It pays back at about age ${r.c3_worth.paybackAge}.` : "In this scenario it doesn't pay back before 45 — so I need a scholarship or a plan B."] : r.c3_detective ? [`I researched ${r.c3_detective.careers.map((c) => c.name).join(" and ")} in real sources.`] : [] },
    { e: "🏙️", t: "My life at 25", s: r.c5_life ? [`At 25, working in ${r.c5_life.career.toLowerCase()}, I will earn about ${cop(r.c5_life.salary)}.`, `I will save ${r.c5_life.save}% and invest ${r.c5_life.inv}%; my debt payments will be ${r.c5_life.dti}% of my income.`, p2.c8_rules ? `My first money rule: ${lowFirst(dot(p2.c8_rules.rules[0]))}` : ""].filter(Boolean) : [] },
    { e: "📈", t: "My investment plan", s: r.c6_machine ? [`If I invest ${cop(r.c6_machine.monthly)} a month at ${r.c6_machine.ret}%, at 35 I could have ${millions(r.c6_machine.me35)}.`, `Starting at 16 instead of 35 makes a difference of ${millions(r.c6_machine.alex60 - r.c6_machine.chris60)} at 60.`, p3.c1_dna ? `I'm a ${PROFILES10[p3.c1_dna.profile]} investor.` : ""].filter(Boolean) : [] },
    { e: "💳", t: "My credit plan from 18", s: r.c5_credit ? [`In my credit simulation I reached a score of ${r.c5_credit.score} (illustrative).`, "My plan: a small card, full payments, never lend my name."] : [] },
    { e: "💌", t: "My message to Future Me", s: v.msg ? [dot(capF(v.msg))] : [] },
  ];
  return (
    <PitchStudio icon={<Rocket size={22} strokeWidth={2.1} />} title="Future Me Blueprint 🧭 · THE BIG PROJECT" subtitle="The whole year in one presentation: who you are, your career with numbers, your life at 25 and your plan." brief={<Brief91 k="c7_pitch" />}
      how={<>Your Blueprint builds itself from the year: the 4 Future Me Cards and the pages of this period. Write your message to Future Me and your closing line, press <b>Present</b> at the Future Me Summit (3–4 minutes) and receive the jury's rating.</>}
      id="g10-blueprint" ready={ready} readyMsg="You need at least 5 of the 7 parts of your Blueprint (check the Blueprint Check in Class 6)."
      cover={{ tag: "FUTURE ME SUMMIT · GRADE 10 · INSTITUTO CREAR", title: `${id.avatar} ${studentName.split(" ")[0]}: My Future Me Blueprint`, sub: `${FM_CARDS.filter((c) => have[c.p] || c.p === 4).length}/4 Future Me Cards · ${C.l}`, say: `Good morning. I'm ${studentName.split(" ")[0]}, and this is the plan for the person I want to be — and how I will pay for it.`, end: (v) => `${v.close ? dot(capF(v.close)) : "…"} Thank you!` }}
      kpis={[{ l: "🎓 Career", v: C.l }, { l: "💼 Salary at 25", v: r.c5_life ? cop(r.c5_life.salary) : "—" }, { l: "🐷 Saving", v: r.c5_life ? `${r.c5_life.save}%` : "—" }, { l: "📈 At 35", v: r.c6_machine ? millions(r.c6_machine.me35) : "—" }]}
      chapters={chapters} inputs={[{ k: "msg", l: "💌 My message to Future Me:", ph: "Remember that money is a tool…", min: 8 }, { k: "close", l: "💡 My closing line:", ph: "The best time to start is today…", min: 6 }]}
      rubric={RUB_BP} existing={existing}
      cert={{ e: all4 ? "🏅" : "🧭", title: all4 ? "Financially Fluent · Future Architect" : "Future Architect", name: studentName, text: `designed a Future Me Blueprint: knew themself (personality, DOFA, Ikigai), researched a career with real data and NPV, built a realistic life budget at 25, a credit plan from 18 and an investment plan${all4 ? " — and earned all four Future Me Cards of the year" : ""}.` }}
      extraData={{ parts: parts.filter((p) => p.ok).length, all4 }} coins={70} onSave={onSave} onExit={onExit} />
  );
}

/* ---------- C7 · Money Radar 10 Final ---------- */
const RADAR10_NEW = [
  { d: "val", q: "A classmate wants to sell you a used phone. What do you do first?", o: ["Pay what they ask.", "Compare market prices, check its condition and negotiate.", "Buy two.", "Ignore the price."], s: [0, 3, 0, 1] },
  { d: "mm", q: "You get your first salary at 18. What is your first move?", o: ["Pay myself first: save a fixed %.", "Buy what I wanted for months.", "Lend it.", "Keep it all in cash."], s: [3, 0, 0, 1] },
  { d: "math", q: "A loan app offers 5% monthly. That is about…", o: ["60% E.A.", "Almost 80% E.A. — very expensive.", "5% a year.", "Free money."], s: [1, 3, 0, 0] },
  { d: "inv", q: "Your portfolio falls 12% in a global shock. You…", o: ["Sell everything.", "Keep the plan or rebalance.", "Borrow to buy crypto.", "Close my eyes forever."], s: [0, 3, 0, 1] },
  { d: "fut", q: "Choosing a career, you compare…", o: ["Only salaries.", "Ikigai + years + cost + salary + payback.", "What my friends do.", "Nothing."], s: [1, 3, 0, 0] },
];
const SELF10 = [["value", "💎 I can create value and negotiate a win-win trade."], ["math", "🧮 I can use compound interest, E.A. rates and loan tables."], ["invest", "📈 I can build a diversified portfolio and spot scams."], ["career", "🎓 I can evaluate a career with data and NPV."], ["life", "🏙️ I can design a realistic budget and credit plan for my 20s."], ["eng", "🎤 I can present my financial plan in English."]];
function Radar10Final({ resp, existing, onSave, onExit }) {
  const before = resp?.__p1?.c1_radar?.scores || null;
  const QS = useMemo(() => [...RADAR10_Q, ...RADAR10_NEW], []);
  const [ans, setAns] = useState(null);
  const [self, setSelf] = useState(existing?.self || {});
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  if (!ans && !existing?.scores) return <RadarQuiz title="My Money Radar 10 · Final" qs={QS} intro={<Brief91 k="c7_radar" />} onExit={onExit} onDone={setAns} />;
  const shown = ans ? radarScores10(ans) : existing.scores;
  const newScore = ans ? Math.round((RADAR10_NEW.reduce((a, q, k) => a + (ans[10 + k] != null ? q.s[ans[10 + k]] : 0), 0) / 15) * 100) : existing.newScore;
  const avg = Math.round(Object.values(shown).reduce((a, v) => a + v, 0) / 5);
  const bAvg = before ? Math.round(Object.values(before).reduce((a, v) => a + v, 0) / 5) : null;
  const prof = radarProfile10(avg);
  const Gw = [W_CONTRAST, W_REASON];
  const ok = SELF10.every(([k]) => self[k]) && goalsOk(text, 20, 60, Gw);
  if (st.done) return <Reward title="Radar complete! 🧭" subtitle={`${prof.l} · ${avg}%${bAvg != null ? ` (from ${bAvg}%)` : ""}`} coins={st.coins} saving={st.saving} onExit={onExit} gold={bAvg != null && avg > bAvg} />;
  return (
    <ActShell icon={<Compass size={22} strokeWidth={2.1} />} title="My Money Radar 10 · Before & After 🧭" subtitle="Day 1 of 10th grade vs. today. Then rate yourself honestly." onExit={onExit}>
      <div className="g7-radar-wrap"><RadarN labels={RADAR10_DIMS.map((d) => d.short)} values={RADAR10_DIMS.map((d) => shown[d.k])} before={before ? RADAR10_DIMS.map((d) => before[d.k] || 0) : null} /></div>
      {before ? <div className="g94-legend"><span className="b">◼ Period 1 (day 1)</span><span className="a">◼ Today</span></div> : <p className="start-tip">💡 We didn't find your Period 1 radar, so you only see today's radar.</p>}
      <div className="g94-growth">{RADAR10_DIMS.map((d) => { const b = before?.[d.k]; const diff = b != null ? shown[d.k] - b : null; return <div key={d.k}><span>{d.l}</span><div className="t"><i className="b" style={{ width: `${b || 0}%` }} /><i className="a" style={{ width: `${shown[d.k]}%` }} /></div><b className={diff == null ? "" : diff >= 0 ? "pos" : "neg"}>{shown[d.k]}%{diff != null ? ` (${diff >= 0 ? "+" : ""}${diff})` : ""}</b></div>; })}</div>
      <div className="g91-mini"><span>🧭 Average <b>{bAvg != null ? `${bAvg}% → ` : ""}{avg}%</b></span><span>🆕 New situations <b>{newScore}%</b></span></div>
      <div className="diag-risk"><span className="diag-risk-tag">{prof.l}</span><p>{prof.d}</p></div>
      <div className="start-block"><h3>⭐ Self-assessment</h3><p className="start-tip">1 ★ = not yet · 2 ★ = with help · 3 ★ = alone · 4 ★ = I can teach it</p>{SELF10.map(([k, l]) => <div key={k} className="p3-rub"><div><b>{l}</b></div><span /><div className="p3-stars">{[1, 2, 3, 4].map((n) => <button key={n} type="button" className={self[k] >= n ? "on" : ""} onClick={() => setSelf({ ...self, [k]: n })}>★</button>)}</div></div>)}</div>
      <div className="start-block"><h3>✍️ My reflection</h3><WordField value={text} onChange={setText} min={20} max={60} rows={3} placeholder="At the beginning of the year I … but now I … because …" goals={Gw} /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30, { answers: ans, scores: shown, average: avg, beforeAvg: bAvg, growth: bAvg != null ? avg - bAvg : null, profile: prof.l, newScore, self, text })}>Save my radar <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- C7 · Year Wrapped 10° ---------- */
function YearWrapped10({ resp, rows, pointsNow, actsNow, studentName, have, existing, onSave, onExit }) {
  const r = resp || {}; const p1 = r.__p1 || {}, p2 = r.__p2 || {}, p3 = r.__p3 || {};
  const pts = ["10P1", "10P2", "10P3"].map((k) => rowPoints(rows[k])).concat(pointsNow);
  const acts = ["10P1", "10P2", "10P3"].map((k) => Object.values(parseJSON(rows[k]?.Checklist_JSON)).filter(Boolean).length).concat(actsNow);
  const coins = pts.reduce((a, v) => a + v, 0); const totalActs = acts.reduce((a, v) => a + v, 0); const maxPts = Math.max(...pts, 1);
  const rad = r.c7_radar; const first = (studentName || "Student").split(" ")[0];
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [best, setBest] = useState(existing?.best || null);
  const [lesson, setLesson] = useState(existing?.lesson || "");
  const [st, finish] = useFinish(onSave);
  const titles = [["💎", "Value Creator", have[1]], ["🧮", "Money Mathematician", have[2]], ["📈", "Global Investor", have[3]], ["🧭", "Future Architect", !!r.c7_pitch], ["🏅", "Financially Fluent", have[1] && have[2] && have[3] && !!r.c7_pitch]];
  const decisions = [p1.c8_pitch && "Trading up my paperclip with real people", p2.c1_month && "Saving first, spending later", p2.c6_page && "Choosing a loan by its TOTAL cost", p3.c6_week5 && p3.c6_week5.decision !== "sell" && "Not selling in panic", p3.c5_scam && "Walking away from a 'guaranteed' scam", r.c3_worth && "Evaluating my career with NPV", "Comparing the numbers before deciding"].filter(Boolean).slice(0, 5);
  const slides = [
    { k: "intro", c: "forest", node: <><small>GRADE 10 · 2026</small><h2>{first}, this was your Future Me year 🧭</h2><p>From a red paperclip to a life plan. Ready?</p><em className="g74-big">✨</em></> },
    { k: "coins", c: "gold", node: <><small>THIS YEAR YOU EARNED</small><h2 className="g74-mega">{coins.toLocaleString("en-US")}</h2><p>FinFluent coins 🪙</p><div className="g74-wbars">{pts.map((v, k) => <div key={k}><i style={{ height: `${Math.max(6, (v / maxPts) * 100)}%` }} /><span>P{k + 1}</span><b>{v}</b></div>)}</div></> },
    { k: "acts", c: "green", node: <><small>YOU COMPLETED</small><h2 className="g74-mega">{totalActs}</h2><p>activities: simulators, readings, videos, pitches and real-world projects.</p></> },
    { k: "p1", c: "coral", node: <><small>PERIOD 1 · FROM ZERO</small><h2>You created value from almost nothing 📎</h2><p>{p1.c8_pitch ? `Your Red Paperclip grew ${pctTxt(p1.c8_pitch.growth || 0, 0)} in ${p1.c8_pitch.trades} trades.` : "Barter, supply & demand, value, the dollar and your brand."}</p></> },
    { k: "p2", c: "mint", node: <><small>PERIOD 2 · MONEY MATH LAB</small><h2>You made math work for you 🧮</h2><p>{p2.c4_page ? `Your savings projection: ${cop(p2.c4_page.fv)} in ${p2.c4_page.years} years.` : "Compound interest, E.A. rates, loans and inflation."}{p2.c8_boss?.passed ? " Money Math Certificate ✅" : ""}</p></> },
    { k: "p3", c: "gold", node: <><small>PERIOD 3 · GLOBAL INVESTOR</small><h2>You managed a global portfolio 🌍</h2><p>{p3.c7_dashboard ? `NAV ${usd(p3.c7_dashboard.nav)} · ROI ${pctTxt(p3.c7_dashboard.roi)}.` : "Risk, the dollar, ETFs, scams and NPV."}</p></> },
    { k: "p4", c: "forest", node: <><small>PERIOD 4 · FUTURE ME</small><h2>You designed your future 🧭</h2><div className="g74-wlist">{r.c1_test && <span>🔎 Type <b>{r.c1_test.type}</b></span>}{r.c2_match && <span>🎓 Top career <b>{careerOf(r.c2_match.top[0]).l}</b></span>}{r.c5_life && <span>🏙️ Salary at 25 <b>{cop(r.c5_life.salary)}</b></span>}{r.c6_machine && <span>📈 At 35 <b>{millions(r.c6_machine.me35)}</b></span>}</div></> },
    { k: "radar", c: "green", node: rad?.growth != null ? <><small>MY MONEY RADAR</small><h2 className="g74-mega">{rad.growth >= 0 ? "+" : ""}{rad.growth}</h2><p>points since day 1 ({rad.beforeAvg}% → {rad.average}%)</p><p className="g74-quote">Today you are: <b>{rad.profile}</b></p></> : <><small>MY MONEY RADAR</small><h2>{rad ? rad.profile : "🔒 Locked"}</h2><p>{rad ? "Your final radar is ready." : "Do “My Money Radar 10 · Final” to see your growth."}</p></> },
    { k: "titles", c: "gold", node: <><small>MY TITLES</small><h2>Unlocked this year 🏆</h2><div className="g74-wlist">{titles.map(([e, t, on]) => <span key={t} className={on ? "" : "off"}>{on ? e : "🔒"} <b>{t}</b></span>)}</div></> },
    { k: "me", c: "coral", node: <><small>YOUR STORY · YOUR WORDS</small><h2>My best decision & my biggest lesson</h2><div className="g84-wpick">{decisions.map((d) => <button key={d} type="button" className={best === d ? "on" : ""} onClick={() => setBest(d)}>{d}</button>)}</div><input className="start-input g84-winput" value={lesson} onChange={(e) => setLesson(e.target.value)} placeholder="The biggest lesson of my year…" /></> },
    { k: "outro", c: "forest", node: <><small>2026 → 11th GRADE → YOUR FUTURE</small><h2>Money is a tool. Your future is the goal. 💚</h2><p>{best ? `Best decision: ${best}.` : ""} See you in 11th grade, {first}!</p></> },
  ];
  const s = slides[i]; const last = i === slides.length - 1; const meOk = best && countWords(lesson) >= 6 && realText(lesson);
  if (st.done) return <Reward title="That's a wrap! 🎁" subtitle="From a paperclip to a Future Me Blueprint." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <div className="p1-act g74-wrapped-wrap">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      {i === 0 && <Brief91 k="c7_wrapped" />}
      <div className={`g74-wrapped c-${s.c}`} id="g10-wrapped" key={s.k}>
        <div className="g74-wprog">{slides.map((x, k) => <i key={x.k} className={k < i ? "done" : k === i ? "on" : ""} />)}</div>
        <div className="g74-wbody">{s.node}</div>
        <div className="g74-wfoot"><span>FinFluent · Instituto CREAR</span><span>{i + 1}/{slides.length}</span></div>
        {s.k !== "me" && <><button type="button" className="g74-wtap left" aria-label="Previous" onClick={() => setI(Math.max(0, i - 1))} /><button type="button" className="g74-wtap right" aria-label="Next" onClick={() => setI(Math.min(slides.length - 1, i + 1))} /></>}
      </div>
      <div className="p3-card-actions">
        <button className="s1-btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}><ArrowLeft size={16} /> Back</button>
        <button className="s1-btn ghost" disabled={busy} onClick={async () => { setBusy(true); await downloadPNG("g10-wrapped", `Year_Wrapped_10_${i + 1}_${first}.png`); setBusy(false); }}><Download size={16} /> {busy ? "Creating…" : "Save this slide"}</button>
        {!last ? <button className="s1-btn primary" disabled={s.k === "me" && !meOk} onClick={() => setI(i + 1)}>{s.k === "me" && !meOk ? "Choose + write (6+ words)" : "Next"} <ChevronRight size={16} /></button> : <button className="s1-btn primary" onClick={() => finish(25, { coins, acts: totalActs, best, lesson })}>Finish my Wrapped <span className="coin-tag"><Coins size={15} /> +25</span></button>}
      </div>
    </div>
  );
}

/* ---------- C7 · Final Exam 10° ---------- */
function FinalExam10({ onSave, onExit }) {
  return <BossExam icon={<Award size={22} strokeWidth={2.1} />} title="Final Exam 10° 🎓" subtitle="5 missions from the whole year + 15 questions with feedback by topic." brief={<Brief91 k="c7_exam" />} missions={EXAM10_MISSIONS} questions={EXAM10_Q} tips={EXAM10_TIPS} onSave={onSave} onExit={onExit} />;
}

/* =====================================================================
   GUÍA DE CADA ACTIVIDAD · 10° PERIODO 4
   ===================================================================== */
const TPAGE = (n, words, needs, coins) => [[`Text: ${words} words with ${needs}`, "required"], [`Future Page ${n} saved`, `+${coins} 🪙`]];
const GUIDE = {
  c1_test: { goal: "Take a free personality test, record your result and compare it with your Future Me ID from Period 1.", steps: ["Open the test and answer honestly.", "Write your type and choose 3 traits.", "Prove It: do you still think the same as in Period 1?"], win: [["Saving your result", "+25 🪙"]], tip: "A test is a mirror, not a label." },
  c1_read: B_READ("Learn what a personality test can and can't tell you — and how to build a personal DOFA.", "Next: Work Style & Values."),
  c1_values: { goal: "Choose your top 5 values and your work style: your compass for choosing a career.", steps: ["Choose 5 values in order of importance.", "Move the 4 work-style sliders.", "Read your compass."], win: [["Saving your compass", "+22 🪙"]] },
  c1_rush: B_RUSH("Inside or outside? Classify each statement as a Strength, Weakness, Opportunity or Threat."),
  c1_dofa: { goal: "Build your personal DOFA (SWOT) with two ideas in each box. This is Future Page 19.", steps: ["Write 2 strengths and 2 weaknesses (inside).", "Write 2 opportunities and 2 threats (outside).", "Write Page 19 with 'I'm good at… / I need to improve…'."], win: TPAGE("19", "35–90", "I'm good at… / I need to improve… + a reason", 30) },
  c2_read: B_READ("Discover the Ikigai: what you love, what you're good at, what the world needs and what you can be paid for.", "Next: the Ikigai World Builder."),
  c2_builder: { goal: "Build your Ikigai with cards in 4 circles and unlock careers where they meet.", steps: ["Choose 2–3 cards in each circle.", "See the careers you unlock.", "Look at the 'circles' each career touches."], win: [["Saving your Ikigai", "+28 🪙"]], tip: "Salaries shown are illustrative — you'll research real ones in Class 3." },
  c2_match: { goal: "Choose your Top 3 careers and explain your Ikigai with gerunds. This is Future Page 20.", steps: ["Choose 3 careers in order.", "Write Page 20: I love …ing, I'm good at …ing + a reason."], win: TPAGE("20", "30–80", "gerunds + a reason", 30) },
  c3_read: B_READ("Learn the 5 numbers of a career — and how to calculate payback and NPV with opportunity cost.", "Next: Career Detective."),
  c3_detective: { goal: "Research 2 careers in real sources: years, cost, entry salary, demand — with the source.", steps: ["Open the official sources.", "Replace the illustrative numbers with real ones.", "Write the source of each career."], win: [["Both careers complete with source", "+30 🪙"]] },
  c3_worth: { goal: "Your career is an investment: compare it with working at 18 and with a technical program — NPV, payback and 3 scenarios. This is Future Page 21.", steps: ["Choose a career and a scenario.", "Read the NPVs and the payback age.", "Look at the cumulative chart.", "Write Page 21 with conditional 2."], win: TPAGE("21", "35–90", "conditional 2 + 2 numbers", 32) },
  c3_rush: B_RUSH("Growing skill or task easy to automate? Prepare for the jobs of the future."),
  c4_read: B_READ("Learn the anatomy of a strong CV: 6 parts, action verbs and measurable results.", "Next: CV Fixer."),
  c4_fixer: { goal: "Find the 6 errors in Juan's CV before a recruiter sees it.", steps: ["Flag exactly 6 lines with 🚩.", "Check your flags.", "Read the corrections."], win: [["Base", "+12 🪙"], ["Each line judged correctly (9)", "+2 🪙"]] },
  c4_cv: { goal: "Build your first CV in English with your real FinFluent projects — and download it. This is Future Page 22.", steps: ["Complete your contact and a professional email.", "Write your profile.", "Add experience with 3+ action verbs (tap your projects).", "Download your CV."], win: [["CV complete (profile 12+ words, experience 20+ words, 3 action verbs)", "required"], ["Future Page 22 saved", "+34 🪙"]] },
  c4_interview: { goal: "Win a job interview: choose the best answers, build your own STAR answer and decide between two offers.", steps: ["Answer 5 interview questions.", "Write a STAR answer with a number in the result.", "Choose an offer and explain why."], win: [["Base", "+20 🪙"], ["Each question right on the first try", "+2 🪙"]] },
  c5_read: B_READ("Understand credit history, credit bureaus and your rights in Colombia (Habeas Data).", "Next: Life Simulator 25."),
  c5_life: { goal: "Design your life at 25 with YOUR career salary and YOUR Money Rules — then survive a crisis. This is Future Page 23.", steps: ["Choose housing, transport, food and fun.", "Decide your saving and investing %.", "Keep the month positive and debt ≤ 35%.", "Test the crisis (3 months without a job).", "Write Page 23 with future plans."], win: TPAGE("23", "35–90", "future plans + 2 numbers", 34) },
  c5_credit: { goal: "Live your first 12 months with credit at 18: every decision moves your score.", steps: ["Read each situation.", "Choose — watch your score and your debt.", "Answer the final question."], win: [["Base", "+18 🪙"], ["Each smart decision", "+2 🪙"]] },
  c5_at18: B_RUSH("What can you do before 18, at 18 — and what is a bad idea at any age?"),
  c6_machine: { goal: "Compare Alex (16), Sam (25) and Chris (35): same monthly investment, different start. Who wins at 60?", steps: ["Choose your monthly amount and your return.", "Compare the table and the chart.", "Write with conditional 3."], win: [["Saving (conditional 3 + 2 numbers)", "+30 🪙"]] },
  c6_blueprint: { goal: "Check the 7 parts of your Future Me Blueprint and rehearse with a partner.", steps: ["Check which parts are ready.", "Use the timer and present to a partner.", "Write their feedback."], win: [["Base", "+14 🪙"], ["Each part ready", "+2 🪙"]] },
  c6_capsule: { goal: "Write a letter to your Future Me. Your teacher will give it back at your 11th-grade graduation.", steps: ["Read the model letter.", "Write 80–250 words (the past + the future).", "Seal your capsule and send it."], win: [["Capsule sent", "+30 🪙"]] },
  c7_pitch: { goal: "THE BIG PROJECT: present your Future Me Blueprint at the Summit — the whole year in one plan.", steps: ["Check your auto-built script (7 parts).", "Write your message to Future Me and your closing line.", "Present for 3–4 minutes.", "Your jury rates you (5 criteria)."], win: [["Script + jury complete", "required"], ["Future Architect certificate (Financially Fluent with the 4 cards)", "+70 🪙"]] },
  c7_radar: { goal: "Answer the SAME 10 situations of day 1 + 5 new ones, and see how much you grew.", steps: ["Answer the 15 situations honestly.", "Compare before and after.", "Rate yourself and write a reflection."], win: [["Saving your radar", "+30 🪙"]] },
  c7_wrapped: { goal: "Your year in money — in slides you can save and share.", steps: ["Tap or press Next to see each slide.", "Choose your best decision and write your lesson.", "Save the slides you like."], win: [["Finishing your Wrapped", "+25 🪙"]] },
  c7_exam: { goal: "The final exam of 10th grade: 5 missions + 15 questions with feedback by topic.", steps: ["Part 1: 5 missions from the 4 periods.", "Part 2: 15 questions.", "Read what to review."], win: [["70% or more", "to pass"], ["Each question right", "+4 🪙"], ["Each mission on the first try", "+4 🪙"]] },
};

/* =====================================================================
   ESTRUCTURA · 10° PERIODO 4 · FUTURE ME (7 clases)
   ===================================================================== */
const G10P4_WEEKS = [
  { n: 1, title: "Who Am I?", e: "🔎", blurb: "Personality, values and your personal DOFA.", skills: ["Test", "Reading", "DOFA"], prove: { from: "Period 1", q: "In your Future Me ID, what did you imagine at 25?", options: ["A career, a city and a goal.", "Nothing, because 10th-graders can't think about the future yet.", "Only a salary.", "A car."], correct: 0, why: "Today you check if you still think the same." }, acts: [
    A10("c1_test", "Personality Test 🔎", "Your type + 3 traits · Prove It.", <Fingerprint size={22} />, 25, "comportamiento"),
    A10("c1_read", "Reading: What a Personality Test Can (and Can't) Tell You 📖", "8 questions.", <BookOpen size={22} />, 42, "quizzes"),
    A10("c1_values", "Work Style & Values 🧭", "Top 5 values + work style.", <Heart size={22} />, 22, "comportamiento"),
    A10("c1_rush", "DOFA Rush ⚡", "Inside or outside?", <Zap size={22} />, 24, "aprendi"),
    A10("c1_dofa", "DOFA Builder 🧩 · Page 19", "A SWOT analysis of YOU.", <Puzzle size={22} />, 30, "aprendi"),
  ] },
  { n: 2, title: "My Ikigai", e: "🌸", blurb: "What you love, what you're good at, what the world needs, what pays.", skills: ["Reading", "Builder", "Top 3"], prove: { from: "Period 1", q: "How is value created?", options: ["By solving someone's need.", "By having the most expensive object in the market.", "By luck.", "By printing money."], correct: 0, why: "Your Value Creator Card: the same idea applies to careers." }, acts: [
    A10("c2_read", "Reading: Ikigai 📖", "4 circles + a model · 8 questions.", <BookOpen size={22} />, 42, "quizzes"),
    A10("c2_builder", "Ikigai World Builder 🌸", "Cards in 4 circles · careers unlock.", <Sparkles size={22} />, 28, "aprendi"),
    A10("c2_match", "Career Match · My Top 3 🎯 · Page 20", "Gerunds + 3 careers.", <Target size={22} />, 30, "aprendi"),
  ] },
  { n: 3, title: "Career Research Lab", e: "🎓", blurb: "Your career is an investment: research it and calculate its NPV.", skills: ["Reading", "Detective", "NPV"], prove: { from: "Period 3", q: "A project has NPV > 0. That means…", options: ["it creates value vs. the alternative.", "it will never lose money in any scenario of the economy.", "it's illegal.", "nothing."], correct: 0, why: "The same tool now evaluates your career." }, acts: [
    A10("c3_read", "Reading: Careers by the Numbers 📖", "8 questions.", <BookOpen size={22} />, 42, "quizzes"),
    A10("c3_detective", "Career Detective 🕵️", "Real data + sources.", <Search size={22} />, 30, "aprendi"),
    A10("c3_worth", "Is My Degree Worth It? 🎓 · Page 21", "NPV · payback · 3 scenarios.", <GraduationCap size={22} />, 32, "aprendi"),
    A10("c3_rush", "Skills of the Future ⚡", "Growing or automated?", <Zap size={22} />, 24, "aprendi"),
  ] },
  { n: 4, title: "Get the Job", e: "💼", blurb: "Your first CV in English and a job interview with STAR answers.", skills: ["Reading", "CV", "Interview"], prove: { from: "Period 1", q: "A feature vs. a benefit: which is a benefit?", options: ["“You'll feel confident.”", "“It is made of strong fabric produced in our own factory.”", "“It's blue.”", "“It costs $50.”"], correct: 0, why: "In a CV, show the benefit of your skills." }, acts: [
    A10("c4_read", "Reading: Anatomy of a CV 📖", "8 questions.", <BookOpen size={22} />, 42, "quizzes"),
    A10("c4_fixer", "CV Fixer 🛠️", "Find 6 errors.", <FileText size={22} />, 30, "aprendi"),
    A10("c4_cv", "CV Builder 📄 · Page 22", "Your first CV · download it.", <FileText size={22} />, 34, "aprendi"),
    A10("c4_interview", "Interview Simulator 🎙️", "STAR answers + two offers.", <Users size={22} />, 30, "aprendi"),
  ] },
  { n: 5, title: "My Life at 25", e: "🏙️", blurb: "Your career salary, your Money Rules, your credit history.", skills: ["Reading", "Life sim", "Credit"], prove: { from: "Period 2", q: "In an amortization table, early payments go mostly to…", options: ["interest.", "the capital, so the debt goes down very fast at the start.", "fees.", "taxes."], correct: 0, why: "Your loan decisions at 25 work the same way." }, acts: [
    A10("c5_read", "Reading: Your Credit Score in Colombia 📖", "8 questions.", <BookOpen size={22} />, 42, "quizzes"),
    A10("c5_life", "Life Simulator 25 🏙️ · Page 23", "Budget · debt · crisis.", <Home size={22} />, 34, "aprendi"),
    A10("c5_credit", "Credit Path from 18 💳", "12 months · your score.", <CreditCard size={22} />, 34, "aprendi"),
    A10("c5_at18", "What Can I Do at 18? ⚡", "Before 18 · at 18 · never.", <Zap size={22} />, 24, "aprendi"),
  ] },
  { n: 6, title: "The Power of Starting Early", e: "⏳", blurb: "Start at 16, 25 or 35? Then prepare your Blueprint and your time capsule.", skills: ["Simulator", "Rehearsal", "Letter"], prove: { from: "Period 3", q: "Your investor profile helps you choose…", options: ["a risk level that fits you.", "the asset that will surely go up the most next month.", "a bank's logo.", "your career."], correct: 0, why: "Your Investor Card sets your return in the Time Machine." }, acts: [
    A10("c6_machine", "The Time Machine · 16 vs. 25 vs. 35 ⏳", "Who wins at 60?", <Hourglass size={22} />, 30, "aprendi"),
    A10("c6_blueprint", "Blueprint Check + Rehearsal 🎭", "7 parts · timer · feedback.", <ShieldCheck size={22} />, 28, "aprendi"),
    A10("c6_capsule", "Time Capsule Letter 💌", "A letter for your graduation.", <Mail size={22} />, 30, "comportamiento"),
  ] },
  { n: 7, title: "Future Me Summit", e: "🏆", blurb: "Your Blueprint pitch, your final radar, your Wrapped and the final exam.", skills: ["Project", "Radar", "Exam"], prove: { from: "The whole year", q: "Which Future Me Card did you earn in Period 2?", options: ["My Money Rules.", "Value Creator, the card of the Red Paperclip Challenge.", "Investor Card.", "None."], correct: 0, why: "P1 Value Creator · P2 My Money Rules · P3 Investor Card · P4 Blueprint." }, acts: [
    A10("c7_pitch", "Future Me Blueprint 🧭 · THE BIG PROJECT", "Present + jury + certificate.", <Rocket size={22} />, 70, "aprendi"),
    A10("c7_radar", "My Money Radar 10 · Final 🧭", "Before & after + self-assessment.", <Compass size={22} />, 30, "comportamiento"),
    A10("c7_wrapped", "Year Wrapped 10° 🎁", "Your year in slides.", <Gift size={22} />, 25, "comportamiento"),
    A10("c7_exam", "Final Exam 10° 🎓", "5 missions + 15 questions (70%).", <Award size={22} />, 100, "quizzes"),
  ] },
];

const CFG104 = {
  n: 4, KEY: "10P4", title: "Future Me 🧭", weeks: G10P4_WEEKS,
  question: "I know how money works. Now: who do I want to be — and how will I pay for that life?",
  howyear: "The closing of the year and the union of everything. You get to know yourself (personality, values, DOFA, Ikigai), research a career with real data and judge it with the NPV of Period 3, build your first CV, live your life at 25 with your Money Rules of Period 2, start your credit history and see what happens if you invest at 16, 25 or 35. Your big project is the Future Me Blueprint, presented at the Future Me Summit — and a time-capsule letter that you will open at your graduation.",
  chips: ["🧭 Future Me Blueprint", "📘 Future Pages 19–23", "🏅 Financially Fluent"],
  bigKeys: ["c7_pitch"], pageKeys: ["c1_dofa", "c2_match", "c3_worth", "c4_cv", "c5_life"],
  panel: (ctx, compact) => {
    const r = ctx.resp; const C = p4Career(r);
    return <FutureMePanel id={fmIdOf(r.__p1)} have={ctx.have} compact={compact} studentName={ctx.name} title="PERIOD 4 · FUTURE ME" stats={[{ l: "🔎 Type", v: r.c1_test?.type || "—" }, { l: "🎓 Top career", v: r.c2_match ? C.l : "—" }, { l: "🏙️ Salary at 25", v: r.c5_life ? cop(r.c5_life.salary) : "—" }, { l: "📈 At 35", v: r.c6_machine ? millions(r.c6_machine.me35) : "—", c: r.c6_machine ? "pos" : "" }]} />;
  },
  render: (act, ctx) => {
    const L = mkLearn(ctx, Brief91);
    const P = { onSave: ctx.save, onExit: ctx.exit };
    switch (act) {
      case "c1_test": return <PersonalityTest resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c1_read": return L.reading("c1_read", "What a Personality Test Can (and Can't) Tell You", "A mirror, not a destiny — and how to build a personal DOFA.", READ_PERS, GLOSS_PERS, Q_PERS, "🔎");
      case "c1_values": return <WorkValues existing={ctx.existing} {...P} />;
      case "c1_rush": return L.rush("c1_rush", "DOFA Rush ⚡", "Strength, weakness, opportunity or threat?", RUSH_DOFA, "SWOT master! 🧩", 75);
      case "c1_dofa": return <DofaBuilder resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c2_read": return L.reading("c2_read", "Ikigai: Why You Get Up in the Morning", "Four circles to think about your future — with a model.", READ_IKIGAI, GLOSS_IKIGAI, Q_IKIGAI, "🌸");
      case "c2_builder": return <IkigaiBuilder existing={ctx.existing} {...P} />;
      case "c2_match": return <CareerMatch resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c3_read": return L.reading("c3_read", "Careers by the Numbers", "Duration, cost, salary, employability, growth — and payback.", READ_CAREERS, GLOSS_CAREERS, Q_CAREERS, "🎓");
      case "c3_detective": return <CareerDetective resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c3_worth": return <DegreeWorth resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c3_rush": return L.rush("c3_rush", "Skills of the Future ⚡", "Growing skill or task easy to automate?", RUSH_SKILLS, "Future-ready! 🚀");
      case "c4_read": return L.reading("c4_read", "Anatomy of a CV", "Six parts, action verbs and results — with a model CV.", READ_CV, GLOSS_CV, Q_CV, "📄");
      case "c4_fixer": return <CVFixer {...P} />;
      case "c4_cv": return <CVBuilder resp={ctx.resp} studentName={ctx.name} existing={ctx.existing} {...P} />;
      case "c4_interview": return <InterviewSim existing={ctx.existing} {...P} />;
      case "c5_read": return L.reading("c5_read", "Your Credit Score in Colombia", "Credit bureaus, your rights and how to build a good history.", READ_CREDIT, GLOSS_CREDIT, Q_CREDIT, "💳");
      case "c5_life": return <LifeSim25 resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c5_credit": return <CreditPath {...P} />;
      case "c5_at18": return L.rush("c5_at18", "What Can I Do at 18? ⚡", "Before 18 with a guardian, at 18 on my own — or never?", RUSH_18, "Ready for 18! 🪪", 70);
      case "c6_machine": return <TimeMachine3 resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c6_blueprint": return <BlueprintCheck resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c6_capsule": return <TimeCapsule studentName={ctx.name} existing={ctx.existing} {...P} />;
      case "c7_pitch": return <BlueprintPitch resp={ctx.resp} studentName={ctx.name} have={ctx.have} existing={ctx.existing} {...P} />;
      case "c7_radar": return <Radar10Final resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c7_wrapped": return <YearWrapped10 resp={ctx.resp} rows={ctx.rows} pointsNow={ctx.coinsTotal} actsNow={ctx.doneCount} studentName={ctx.name} have={ctx.have} existing={ctx.existing} {...P} />;
      case "c7_exam": return <FinalExam10 {...P} />;
      default: return null;
    }
  },
};

export const Periodo4G10 = (props) => <PeriodShell10 cfg={CFG104} {...props} />;