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
} from "lucide-react";
import "../Styles/semana1.css";   // botones, quiz, reward, monedas (misma gamificación)
import "../Styles/periodo1.css";  // piezas de 6° (periodo 1)
import "../Styles/periodo2.css";  // piezas de 6° (periodo 2)
import "../Styles/periodo3.css";  // piezas de 6° (periodo 3)
import "../Styles/periodo4.css";  // piezas de 6° (periodo 4) · radar
import "../Styles/septimo1.css";  // 7° · gráficas, tarjetas
import "../Styles/septimo2.css";  // 7° · opciones, medidores, teléfono
import "../Styles/septimo3.css";  // 7° · tablas, casos, plan
import "../Styles/septimo4.css";  // 7° · portafolio, chips, noticias
import "../Styles/octavo1.css";   // 8° · Periodo 1 (base de diseño de octavo)
import "../Styles/octavo2.css";   // 8° · Periodo 2 · Savings Portfolio (piezas que se reutilizan)
import "../Styles/octavo3.css";   // 8° · Periodo 3 · Financial Services Guide
import "../Styles/octavo4.css";   // 8° · Periodo 4 · CREAR Startup Studio
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   GRADO 8 · PERIODO 4 · CREAR STARTUP STUDIO 🚀 (B1)
   Clases 26–32 (7 clases) · Pregunta guía: How can a digital business
   receive money, protect its customers and create real value?
   Hilo: STARTUP DASHBOARD (6 módulos) → Launch Day → Startup Showcase.
   Cierre del año: Radar 4.0 (antes/después), Year Wrapped 8° y Boss del año.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "8P4", Grado = "8".
   Para el radar y el Wrapped se leen también las filas "8P1", "8P2", "8P3".
   ===================================================================== */
const PERIOD_KEY = "8P4";
const GRADE = "8";
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

function VideoQuiz({ src, title, questions, pickCount, onSave, onExit }) {
  return (
    <div>
      <div className="reader-bar">
        <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
        <a className="speed-toggle" href={src} target="_blank" rel="noreferrer"><Video size={15} strokeWidth={2.4} /> Open in new tab</a>
      </div>
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
  const fmt = (v) => (money ? cop(Math.round(v / 10) * 10) : `${Math.round(v)}${unit}`);
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
   PIEZAS DEL PERIODO 4 · CREAR Startup Studio + Startup Dashboard
   ===================================================================== */
const SECTORS5 = [
  { id: "primary", e: "🌱", l: "Primary", d: "Takes products from nature" },
  { id: "secondary", e: "🏭", l: "Secondary", d: "Transforms materials into products" },
  { id: "tertiary", e: "🛎️", l: "Tertiary", d: "Sells or delivers services" },
  { id: "quaternary", e: "💡", l: "Quaternary", d: "Knowledge, information, technology" },
  { id: "quinary", e: "🏛️", l: "Quinary", d: "High-level decisions for many people" },
];
/* Ideas de startup · números ficticios para el juego */
const STARTUPS = [
  { id: "huerta", e: "🌱", n: "Huerta Viva", what: "grows and sells organic vegetables from a school garden", sector: "primary", ship: 3000, fixed: 120000, launch: 3000000,
    products: [{ n: "Vegetable basket", cost: 8000, price: 18000 }, { n: "Herb pot", cost: 4000, price: 12000 }, { n: "Seed kit", cost: 6000, price: 15000 }] },
  { id: "bottle", e: "🧴", n: "EcoBottle", what: "makes reusable bottles from recycled plastic", sector: "secondary", ship: 5000, fixed: 170000, launch: 5000000,
    products: [{ n: "Reusable bottle", cost: 25000, price: 50000 }, { n: "Steel straw kit", cost: 6000, price: 18000 }, { n: "Lunch box", cost: 18000, price: 40000 }] },
  { id: "arepa", e: "🫓", n: "ArepaGo", what: "delivers homemade arepas in the neighborhood", sector: "tertiary", ship: 2000, fixed: 150000, launch: 2500000,
    products: [{ n: "Arepa combo", cost: 5000, price: 12000 }, { n: "Family pack", cost: 14000, price: 30000 }, { n: "Breakfast box", cost: 9000, price: 20000 }] },
  { id: "rewear", e: "👕", n: "ReWear", what: "sells second-hand clothes online", sector: "tertiary", ship: 5000, fixed: 140000, launch: 3500000,
    products: [{ n: "Second-hand jacket", cost: 15000, price: 45000 }, { n: "T-shirt", cost: 5000, price: 18000 }, { n: "Jeans", cost: 12000, price: 38000 }] },
  { id: "tutor", e: "📚", n: "TutorLink", what: "is an app that connects students with tutors", sector: "quaternary", ship: 0, fixed: 300000, launch: 6000000,
    products: [{ n: "1 tutoring class", cost: 22000, price: 40000 }, { n: "4-class pack", cost: 80000, price: 140000 }, { n: "Exam prep session", cost: 35000, price: 60000 }] },
  { id: "pixel", e: "🎨", n: "PixelCraft", what: "designs logos and digital art for small businesses", sector: "quaternary", ship: 0, fixed: 250000, launch: 4000000,
    products: [{ n: "Logo design", cost: 50000, price: 120000 }, { n: "Social media pack", cost: 30000, price: 80000 }, { n: "Sticker design", cost: 8000, price: 25000 }] },
];
const FEE_PCT = 4, RESERVE_PCT = 2; // comisión de pago y reserva para devoluciones (ficticias)
const unitCosts = (price, cost, ship) => { const fee = Math.round(price * FEE_PCT / 100), res = Math.round(price * RESERVE_PCT / 100); return { fee, res, ship, cost, margin: price - cost - fee - ship - res }; };

const MODULES = [
  { n: "01", key: "c26_page", t: "Idea & sector", e: "💡" },
  { n: "02", key: "c27_page", t: "Payments & prices", e: "💳" },
  { n: "03", key: "c28_page", t: "Store policies", e: "⚖️" },
  { n: "04", key: "c29_page", t: "Anti-fraud plan", e: "🔐" },
  { n: "05", key: "c30_page", t: "Data & privacy", e: "🔏" },
  { n: "06", key: "c31_page", t: "Model, funding & impact", e: "🌍" },
];
const PAY_METHODS = [
  { id: "card", s: "cards", e: "💳", n: "Cards (via a payment gateway)", fee: "≈ 3–4% per sale", good: "Online shoppers with cards" },
  { id: "pse", s: "PSE bank transfers", e: "🏦", n: "Bank transfer / PSE", fee: "Low fixed fee", good: "Customers with bank accounts" },
  { id: "wallet", s: "digital wallets and QR codes", e: "👛", n: "Digital wallet / QR", fee: "Low or $0", good: "Young customers with phones" },
  { id: "cod", s: "cash on delivery", e: "💵", n: "Cash on delivery", fee: "Risk: orders not paid", good: "Customers without cards" },
  { id: "link", s: "payment links by chat", e: "🔗", n: "Payment link by chat", fee: "≈ 3% per sale", good: "Sales by WhatsApp or Instagram" },
];

/* ---------- Datos de la startup y de los periodos anteriores ---------- */
const ideaOf = (r) => STARTUPS.find((s) => s.id === r?.c26_page?.idea) || null;
const storeOf = (r) => { const p = r?.c26_page; const idea = ideaOf(r); return { name: p?.name || "My Startup", logo: p?.logo || idea?.e || "🚀", idea, sector: SECTORS5.find((s) => s.id === p?.sector) }; };
const jarSaved84 = (p2) => (p2?.c12_goal ? (num(p2.c12_goal.start) || 0) + Object.values(p2.jarLogs || {}).reduce((a, v) => a + (num(v) || 0), 0) : 0);
function pastOf(r) {
  const p1 = r?.__p1 || {}, p2 = r?.__p2 || {}, p3 = r?.__p3 || {};
  const inc = p1.c2_income, goal = p2.c12_goal, cap = p2.c18_page;
  return {
    dream: inc?.dreamJob || null, dreamSector: inc?.sector || null, income: inc?.total || null, radar: p1.c1_radar || null, blueprint: !!p1.c10_blueprint,
    goal: goal ? { what: goal.what, target: num(goal.target), saved: jarSaved84(p2) } : null,
    biz: cap ? { n: cap.biz, e: cap.e, capital: num(cap.capital), route: cap.route } : null,
    fmSavings: p3.c25_later?.savings ?? p3.c21_life?.savings ?? null, score: p3.c25_later?.score ?? p3.c21_life?.score ?? null, loan: p3.c20_app || null, inv: p3.c22_storm || null,
  };
}
function dashOf(r) {
  const ck = r?.c27_checkout, fu = r?.c31_funding, la = r?.c32_launch;
  const best = ck?.products ? [...ck.products].sort((a, b) => b.margin - a.margin)[0] : null;
  const shields = (r?.c29_page?.rules?.length || 0) + (r?.c30_page?.rules?.length || 0);
  const policy = r?.c28_page ? 1 : 0;
  const trust = la?.trust ?? Math.min(100, 40 + policy * 20 + Math.min(shields, 8) * 5);
  return { best, breakEven: ck?.breakEven ?? null, capital: fu ? fu.own + fu.loan + fu.inv + (fu.granted ? fu.grant : 0) : null, shields, trust, cash: la?.cash ?? null };
}

/* ---------- STARTUP DASHBOARD · panel permanente ---------- */
function StartupDash({ resp, compact, studentName }) {
  const r = resp || {};
  const S = storeOf(r), D = dashOf(r);
  const done = MODULES.filter((m) => r[m.key]).length;
  return (
    <div className={`g84-dash ${compact ? "compact" : ""}`}>
      <header>
        <em className="g84-logo">{S.logo}</em>
        <div><small>🚀 STARTUP DASHBOARD{studentName && !compact ? ` · ${studentName.split(" ")[0]}` : ""}</small><b>{S.name}</b><span>{S.idea ? `${S.idea.what}${S.sector ? ` · ${S.sector.e} ${S.sector.l} sector` : ""}` : "Class 26 · choose your idea"}</span></div>
        <i>{done}/{MODULES.length} modules{r.c32_showcase ? " · 🏆 launched" : ""}</i>
      </header>
      <div className="g84-tiles">
        <div><small>💰 Capital</small><b>{D.capital != null ? cop(D.capital) : "—"}</b><span>{D.capital != null ? "savings + funding" : "Class 31"}</span></div>
        <div><small>📈 Best margin</small><b>{D.best ? cop(D.best.margin) : "—"}</b><span>{D.best ? `${D.best.n} · per sale` : "Class 27"}</span></div>
        <div><small>⭐ Customer trust</small><b>{D.trust}%</b><div className="g84-mini"><i style={{ width: `${D.trust}%` }} /></div></div>
        <div><small>🛡️ Security</small><b>{D.shields} rules</b><span>{D.shields ? "anti-fraud + data" : "Classes 29–30"}</span></div>
      </div>
      {!compact && (
        <div className="g8-bp-pages g84-mods" style={{ gridTemplateColumns: `repeat(${MODULES.length + 1}, minmax(0, 1fr))` }}>
          {MODULES.map((m) => <div key={m.n} className={`g8-bp-page ${r[m.key] ? "done" : ""}`}><small>{m.n}</small><em>{r[m.key] ? m.e : "▫️"}</em><span>{m.t}</span></div>)}
          <div className={`g8-bp-page final ${r.c32_showcase ? "done" : ""}`}><small>🚀</small><em>{r.c32_showcase ? "🏆" : "🔒"}</em><span>Launch & showcase</span></div>
        </div>
      )}
    </div>
  );
}
function MBadge({ n }) {
  const m = MODULES.find((x) => x.n === n);
  if (!m) return null;
  return <div className="g8-bpbadge g84-badge"><span>🚀 STARTUP MODULE {m.n}</span><b>{m.e} {m.t}</b></div>;
}
/* Teléfono / tienda del periodo 4 */
function Phone84({ title = "CREAR Pay", logo = "💳", sub, children, ok }) {
  return (
    <div className={`g83-phone ${ok ? "ok" : ""}`}>
      <div className="g83-phone-bar"><span>9:41</span><i /><span>📶 🔋</span></div>
      <div className="g83-phone-app">
        <header><em>{logo}</em><div><b>{title}</b>{sub && <small>{sub}</small>}</div></header>
        {children}
      </div>
    </div>
  );
}
function Steps84({ labels, at }) {
  return <div className="g72-steps">{labels.map((s, i) => <span key={s} className={at === i ? "on" : at > i ? "done" : ""}>{s}</span>)}</div>;
}
function Tri({ value, onPick, opts, disabled }) {
  return <div className="type-toggle g83-tri">{opts.map(([k, l]) => <button key={k} type="button" disabled={disabled} className={value === k ? "on" : ""} onClick={() => onPick(k)}>{l}</button>)}</div>;
}
/* Pregunta de opción con orden barajado UNA vez (no se mueve) */
function PickOne({ q, options, correct, onRight, explain, tag }) {
  const [order] = useState(() => shuffleArr(options.map((_, k) => k)));
  const [wrong, setWrong] = useState([]);
  const [ok, setOk] = useState(false);
  return (
    <div className="g84-pick">
      {tag && <span className="diag-dim">{tag}</span>}
      <p className="quiz-q">{q}</p>
      <div className="quiz-options">{order.map((k, pos) => <button key={k} type="button" disabled={ok || wrong.includes(k)} className={`quiz-opt ${ok && k === correct ? "correct" : ""} ${wrong.includes(k) ? "wrong" : ""}`} onClick={() => { if (k === correct) { setOk(true); onRight && onRight(wrong.length); } else setWrong([...wrong, k]); }}><span className="opt-key">{"ABCD"[pos]}</span><span className="opt-text">{options[k]}</span></button>)}</div>
      {wrong.length > 0 && !ok && <div className="p1-hint">💡 Not that one — read again and try another option.</div>}
      {ok && explain && <div className="p1-banner good"><Check size={18} /> <span>{explain}</span></div>}
    </div>
  );
}
const useOrder = (n) => useState(() => shuffleArr([...Array(n).keys()]))[0];
const dot = (t) => { const x = String(t || "").trim(); return !x ? "" : /[.!?]$/.test(x) ? x : `${x}.`; };
const lowFirst = (t) => String(t || "").replace(/^./, (c) => c.toLowerCase());
const listJoin84 = (arr) => (arr.length <= 1 ? arr.join("") : `${arr.slice(0, -1).join(", ")} and ${arr[arr.length - 1]}`);
const W_PROTECT = { l: "Say how you protect", re: /\b(protect|protects|verify|verifies|check|checks|safe|safely|secure|never)\b/i, ex: "protect · verify · check · never" };
const W_CUSTOMER = { l: "Talk about your customers", re: /\b(customers?|clients?|buyers?|users?|people|students?|teenagers?|famil(y|ies)|neighbors?|neighbours?|workers?|sellers?|shops?|businesses)\b/i, ex: "customers · students · families · sellers" };

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


/* =====================================================================
   PERIODO 4 · VIDEOS (14 preguntas c/u → 8 al azar) + LECTURAS B1 (12 → 8)
   Opciones: correcta · parecida pero errada (la más larga) · trampa corta (errada) · nada que ver
   ===================================================================== */
const VID_PAY = "https://res.cloudinary.com/y9r84vgz/video/upload/v1792717139/videoplayback_27.mp4";
const VID_SIM = "https://res.cloudinary.com/y9r84vgz/video/upload/v1792717231/videoplayback_28.mp4";

const VQ_26 = [
  { q: "Who are the main players in any online payment?", options: ["You (the merchant) and your customer", "The local government treasury and the federal tax collection agencies", "Only the customer's bank", "Stock market brokers"], correct: 0, feedback: "The merchant (the store) and the customer — with helpers in the middle." },
  { q: "To accept credit cards online, what do you need?", options: ["A merchant account and a payment gateway", "A physical retail storefront in downtown New York with a big cash register", "Only a website", "A printing press"], correct: 0, feedback: "The merchant account receives the money; the gateway connects the store to the payment networks." },
  { q: "Why add an alternative method like PayPal on top of credit cards?", options: ["For customers who don't like to use credit cards", "To completely eliminate all the bank processing fees across the whole business", "To charge higher prices", "To pay employee salaries"], correct: 0, feedback: "More payment options = more customers can buy." },
  { q: "Where does the payment information go right after the customer submits it?", options: ["To the payment gateway", "Directly into the personal bank account of the business owner, without any checks", "To the delivery company", "To a social media feed"], correct: 0, feedback: "The gateway is the first stop after checkout." },
  { q: "What does the payment gateway do with the information?", options: ["Encrypts it and sends it for authorization", "Prints out a physical paper receipt and mails it to the customer by regular post", "Saves it on the store's website", "Deletes it permanently"], correct: 0, feedback: "Encryption protects the data; the networks and bank authorize the payment." },
  { q: "About how long does it take for the decision (accepted or declined) to come back?", options: ["About 2 seconds", "Approximately two full business days of activity between all the different banks", "Exactly 24 hours", "Five weeks"], correct: 0, feedback: "The whole flurry of activity takes about two seconds." },
  { q: "What happens at the end, after the processors approve the payment?", options: ["Money moves from the customer's bank to your account", "The customer is automatically billed a secondary hidden service fee by the gateway", "The order is cancelled", "The website shuts down"], correct: 0, feedback: "The money is transferred into the merchant account." },
  { q: "How do some payment solutions make all these parties easier to manage?", options: ["They bundle everything into an all-in-one solution", "They force merchants to hire external legal and accounting firms for every sale", "They remove the customer", "They stop all sales"], correct: 0, feedback: "One provider can offer the merchant account, the gateway and more." },
  { q: "What is the FIRST question to ask when you evaluate a payment solution?", options: ["Is it secure?", "Is it the most colorful and popular option that my friends are using right now?", "Is it new?", "Does it sell coffee?"], correct: 0, feedback: "Security comes first." },
  { q: "When you check security, what should you look for?", options: ["PCI compliant, trusted and never breached", "A system that undergoes weekly government tax audits and publishes customer data", "A cheap monthly price", "Open code with no passwords"], correct: 0, feedback: "PCI compliance = rules for protecting card data." },
  { q: "What does the video recommend about reliability?", options: ["Always available, with backup systems", "A service that operates only during standard banking hours from Monday to Friday", "Very fast internet", "Cheap hosting servers"], correct: 0, feedback: "If the system is down, you can't sell." },
  { q: "What makes a payment solution “easy to use”?", options: ["Easy to integrate, flexible, with support", "Pre-configured with zero settings that can never be changed or adapted by the store", "A big logo", "It needs a computer science degree"], correct: 0, feedback: "Easy setup + help + room to grow." },
  { q: "Where should you be able to accept orders, according to the video?", options: ["Website, marketplaces, phone and in person", "Strictly through mail-in paper order forms that customers send to the main office", "Only on Instagram", "At a bank counter"], correct: 0, feedback: "Make it easy for customers wherever they are." },
  { q: "What is the video's final advice?", options: ["Choose security, reliability and ease of use", "Pick the cheapest option available, no matter what its safety record looks like", "Accept only cash", "Avoid online payments"], correct: 0, feedback: "Those three qualities earn high marks from customers." },
];

const VQ_29 = [
  { q: "What is the first thing a criminal does in a SIM swap scam?", options: ["Convinces your phone company to move your number to a new SIM", "Physically breaks into your home to steal your smartphone from your nightstand while you sleep", "Sends you a gift", "Sends you an email"], correct: 0, feedback: "The criminal tricks the mobile provider — not you." },
  { q: "Who controls the new SIM card after the switch?", options: ["The criminal", "Your local bank manager, who must approve every change on your phone line", "You", "The phone factory"], correct: 0, feedback: "Your number now rings on the criminal's phone." },
  { q: "What does control of your phone number give the criminal?", options: ["Your texts, calls and accounts verified by phone", "Only your social media photos and your public video streaming subscriptions", "Your car keys", "Nothing important"], correct: 0, feedback: "Many accounts send codes by text message." },
  { q: "What can criminals do once they get into those accounts?", options: ["Reset passwords and steal your identity", "Pay off all your outstanding student loans and credit card debts for you", "Delete your browser history", "Upgrade your phone"], correct: 0, feedback: "Reset passwords → access financial accounts → identity theft." },
  { q: "How can criminals use your number against your friends and family?", options: ["By pretending to be you", "By calling them to offer free vacation packages and airline tickets to Europe", "By sending birthday cards", "By blocking them"], correct: 0, feedback: "A message from “you” is easy to trust." },
  { q: "In the video's example, what does the criminal ask the family member for?", options: ["The password to the Coin Exchange account", "Your mother's maiden name, your home address and your exact date of birth", "A selfie", "A favorite movie"], correct: 0, feedback: "The criminal wants the password to a crypto account." },
  { q: "In the cartoon, what mistake does the family member make?", options: ["Sends the password by text", "Refuses to answer and calls the official number of the exchange to check everything first", "Changes the password", "Turns off the phone"], correct: 0, feedback: "“Yes, it's FIAT123.” Never share a password by text — not even with family." },
  { q: "If hackers stole money from you through a SIM swap, what might you be able to do?", options: ["Sue your mobile carrier", "File a lawsuit directly against the smartphone manufacturing companies in Asia", "Nothing at all", "Arrest the internet provider"], correct: 0, feedback: "The carrier moved your number to the criminal." },
  { q: "What does the video suggest if you lost money in a SIM swap?", options: ["Talk to a lawyer about your case", "Post the details of your bank accounts on social media so people can help you", "Buy a new phone", "Wait and do nothing"], correct: 0, feedback: "It invites victims to contact attorneys (simswaplaw.com)." },
  { q: "Who made this informational video?", options: ["A law firm (MDF Law)", "The Federal Trade Commission's legal division in Washington, D.C.", "A bank", "Apple Inc."], correct: 0, feedback: "It's an ad from a law firm — so it also wants clients." },
  { q: "Which accounts does the video name as targets after a SIM swap?", options: ["Financial accounts and crypto exchanges", "Local library book rental accounts and school homework platforms", "Only email", "Video streaming profiles"], correct: 0, feedback: "Where the money is." },
  { q: "What does the phone company accidentally do for the criminal?", options: ["Switches your number to a SIM the hacker controls", "Upgrades your phone hardware for free as part of a special loyalty promotion", "Cancels your plan", "Blocks your bank"], correct: 0, feedback: "The provider believes the criminal is you." },
  { q: "Why is a SIM swap so dangerous for money apps?", options: ["Many send verification codes by text message", "Because all banking apps stop working forever when you change your mobile phone", "Phones get viruses", "Apps get expensive"], correct: 0, feedback: "If codes go to your number, they go to the criminal. An authenticator app is safer." },
  { q: "What is the best lesson from the family example?", options: ["Verify by an official channel before sharing anything", "Always answer quickly to messages from family members because they never ask without a reason", "Use the same password", "Text your PIN"], correct: 0, feedback: "Call the person or the company on a number you already know." },
];

/* ---------- READING 1 · Three Wallets, One Week (clase 27) ---------- */
const WALLETS = [
  { id: "pocket", e: "🟢", n: "PocketGo", fee: 0, transfer: 0, withdraw: 3000, limit: 200000 },
  { id: "flash", e: "⚡", n: "FlashPay", fee: 4000, transfer: 0, withdraw: 1000, limit: 500000 },
  { id: "simple", e: "🔷", n: "SimpleWallet", fee: 2000, transfer: 500, withdraw: 2000, limit: 300000 },
];
function WalletTable({ hi }) {
  return (
    <div className="g84-wtable">
      <div className="h"><span>Fictional wallet</span>{WALLETS.map((w) => <span key={w.id} className={hi === w.id ? "on" : ""}>{w.e} {w.n}</span>)}</div>
      {[["Monthly fee", "fee"], ["Transfer", "transfer"], ["Cash withdrawal", "withdraw"], ["Daily limit", "limit"]].map(([l, k]) => <div key={k}><span>{l}</span>{WALLETS.map((w) => <span key={w.id} className={hi === w.id ? "on" : ""}>{cop(w[k])}</span>)}</div>)}
      <div><span>QR payments</span>{WALLETS.map((w) => <span key={w.id} className={hi === w.id ? "on" : ""}>✅</span>)}</div>
    </div>
  );
}
const READ_27 = [
  { sub: "Monday: Three friends, three wallets" },
  { p: "Sofia, Mateo and Daniel were classmates, but they had different ways of managing their money. They all received a small weekly allowance and sometimes earned extra money by helping their families. One Monday, their teacher announced a challenge: each student had to plan a week of payments using a digital wallet." },
  { p: "The teacher explained that a digital wallet is a service that can help people store payment information, transfer money or pay for products. The exact services depend on the provider. Some wallets connect to a bank account, some allow users to keep a balance, and others mainly help people make payments." },
  { p: "The class would not use real money. Instead, each student would receive a fictional balance and compare three imaginary wallets: PocketGo, FlashPay and SimpleWallet." },
  { p: "Sofia chose PocketGo because its advertisement said, “No monthly fee!” She thought it was obviously the best option. Mateo chose FlashPay because it offered a higher daily limit. Daniel chose SimpleWallet because it seemed easy to use. They all started with the same fictional balance: $100,000." },
  { h: "💳 Tuesday: The first payment" },
  { p: "Sofia used PocketGo to pay for lunch. There was no fee for that transaction, so she felt happy with her choice. Mateo used FlashPay to buy lunch too. Daniel used SimpleWallet." },
  { p: "At the end of the day, the teacher showed the class the first rule of the challenge: a service can have no monthly fee and still charge for other transactions." },
  { node: <WalletTable key="wt" /> },
  { p: "PocketGo charged $3,000 for cash withdrawals. FlashPay charged only $1,000, while SimpleWallet charged $2,000. The wallets also had different monthly fees and transfer conditions." },
  { say: "Sofia looked at the table again. “But I don't withdraw cash every day,” she said. “Maybe the withdrawal fee will not matter much to me.”" },
  { p: "That was a good point. A fee is not important in exactly the same way for every user. Someone who pays digitally most of the time may care more about transfer fees. Someone who often needs cash may care more about withdrawal costs." },
  { h: "📤 Wednesday: Sending money home" },
  { p: "Mateo needed to send $20,000 to his mother. He opened FlashPay, checked the recipient's details and reviewed the amount before confirming. His wallet did not charge a transfer fee in the fictional scenario." },
  { p: "Daniel used SimpleWallet to send money to his sister. The transfer cost $500. He had not expected the charge, so he checked the fee list. “It's not a huge amount,” he said, “but if I make many transfers, the total can become important.”" },
  { p: "Their teacher asked them to calculate the cost of several small transactions over a month. The students discovered that costs that seem small one at a time can add up." },
  { box: "They also learned that payment safety matters as much as price. A low fee does not make a wallet safe automatically. Users should protect their access codes, check the recipient's details and use official applications. They should never share their password or verification code with someone who contacts them unexpectedly." },
  { h: "🛒 Thursday: The online purchase" },
  { p: "The three friends wanted to buy the same set of art materials from an online shop. The store accepted all three fictional wallets, but each wallet had a different daily limit." },
  { p: "Mateo's FlashPay account had a high limit, so the payment was easy. Sofia's PocketGo limit was lower, but it was still enough for the purchase. Daniel discovered that his remaining daily limit was not enough because he had already made other payments." },
  { say: "He felt frustrated. “My wallet is not bad,” he said. “It just doesn't fit today's purchase.”" },
  { p: "The teacher agreed. A payment service should be evaluated according to a person's needs, the limits, the costs and the way it is used. One product may be convenient for daily small payments but less useful for a larger purchase. Daniel decided to check the limits before his next online order. He also learned to verify that a store was trustworthy before entering payment details." },
  { h: "🏧 Friday: The cash problem" },
  { p: "On Friday afternoon, Sofia needed cash for a school activity. She went to a cash point and discovered the withdrawal fee. PocketGo had no monthly fee, but the withdrawal cost was higher than the fee on FlashPay. Mateo withdrew the same amount and paid less. Daniel paid an amount between the two." },
  { p: "The teacher asked the class to calculate the weekly cost of each wallet, including monthly fees when relevant and all the transactions they had made. The results depended on the students' choices. A wallet that was cheapest for one student was not necessarily cheapest for another." },
  { p: "Sofia realized that the advertisement had not been false. PocketGo really did have no monthly fee in the fictional scenario. However, that information alone did not explain the total cost of using the wallet." },
  { h: "💡 What the friends learned" },
  { p: "Sofia decided to keep PocketGo for small digital purchases, but she would consider another option if she needed to withdraw cash frequently. Mateo liked FlashPay because its higher limit matched his needs. Daniel chose SimpleWallet because its interface was simple, but he planned to pay attention to transfer fees." },
  { p: "They also agreed on three safety rules: use official applications, verify the recipient before sending money, and never share passwords or one-time verification codes." },
  { say: "Their teacher ended the activity with one question: “Which wallet is the best?” The students laughed. The answer depended on the user." },
  { p: "A good financial decision was not about choosing the most popular brand or the biggest number in an advertisement. It was about comparing the complete service with the person's real needs." },
];
const GLOSS_27 = { "digital wallet": "Billetera digital.", "monthly fee": "Cuota de manejo mensual.", "withdrawal": "Retiro de efectivo.", "transfer": "Transferencia.", "daily limit": "Límite diario.", "recipient": "Destinatario (quien recibe).", "verification code": "Código de verificación (temporal).", "total cost": "Costo total." };
const Q_27 = [
  { q: "Why did Sofia choose PocketGo?", options: ["Its ad said “No monthly fee!”", "Because it had the highest daily limit and the cheapest cash withdrawals of all", "Her mother uses it", "It was blue"], correct: 0, feedback: "She looked at only one number." },
  { q: "What did the teacher explain about monthly fees?", options: ["No monthly fee can still mean other charges", "A wallet without a monthly fee never charges anything for any kind of operation", "Monthly fees are illegal", "All wallets cost the same"], correct: 0, feedback: "Look at ALL the costs." },
  { q: "How much did PocketGo charge for a cash withdrawal?", options: ["$3,000", "$1,000, the cheapest withdrawal fee of the three fictional wallets", "$0", "$20,000"], correct: 0, feedback: "FlashPay $1,000 · SimpleWallet $2,000 · PocketGo $3,000." },
  { q: "Why did Daniel check the transfer fee?", options: ["His transfer cost $500 and he didn't expect it", "Because his sister told him that his wallet had stolen all of his weekly allowance", "He wanted a loan", "The app closed"], correct: 0, feedback: "Small charges can add up." },
  { q: "What happens with small costs over a month?", options: ["They can add up", "They always disappear at the end of the month because the bank returns them", "They become free", "They double"], correct: 0, feedback: "Many small fees = a big total." },
  { q: "What problem did Daniel have on Thursday?", options: ["His remaining daily limit was too low", "His wallet was hacked by a criminal who stole his balance and his password", "The store was fake", "He lost his phone"], correct: 0, feedback: "He had already made other payments that day." },
  { q: "Why was PocketGo not necessarily the cheapest option for Sofia?", options: ["Its cash withdrawal fee was the highest", "Because the advertisement was false and it really had a big monthly fee", "It had no QR", "Her balance was zero"], correct: 0, feedback: "The ad was true — but incomplete." },
  { q: "What should users check before sending money?", options: ["The recipient's details and the amount", "The color of the app, the weather and the number of friends who use the same wallet", "Nothing", "The battery"], correct: 0, feedback: "Verify before you confirm." },
  { q: "Which of these is one of the three safety rules?", options: ["Never share one-time verification codes", "Share your code with anyone who contacts you because they may be from the bank", "Use any app", "Write your PIN on the card"], correct: 0, feedback: "Plus: official apps and check the recipient." },
  { q: "Why did the friends choose different wallets?", options: ["Each wallet fit different needs", "Because the teacher forced each one of them to use a different wallet for the game", "They didn't like each other", "By luck"], correct: 0, feedback: "Limits, fees and the way each person pays." },
  { q: "Does a low fee make a wallet safe?", options: ["No, safety is a separate question", "Yes, because cheap wallets are always checked by the government every single day", "Always", "Only on Fridays"], correct: 0, feedback: "Price and safety are different things." },
  { q: "What is the main lesson of the story?", options: ["Compare the complete service with your real needs", "Always choose the most popular brand or the biggest number in the advertisement", "Never use wallets", "Free is best"], correct: 0, feedback: "The best wallet depends on the user." },
];

/* ---------- READING 2 · The Sneakers That Never Arrived (clase 28) ---------- */
const READ_28 = [
  { sub: "A problem with order number 4821" },
  { p: "Emma loved sports and had been saving for a new pair of running shoes. One evening, she found an online store called FastFeet. The website had bright pictures, a large discount and a message that said, “Fast delivery and excellent service!”" },
  { p: "Emma compared the price with other stores. FastFeet was cheaper, so she decided to place an order. She checked the shoe size, entered her delivery information and paid. The website displayed order number 4821." },
  { p: "At first, everything looked normal. Emma received an email confirming the order. The message said that the shoes would arrive within five business days." },
  { p: "Five days passed, but the package did not arrive. Emma checked the tracking page. It showed the same message: “Preparing your order.” She waited two more days and then contacted the store. She wrote a polite message explaining the problem and included her order number." },
  { say: "The store replied: “Your order is being processed. Please wait.”" },
  { p: "Emma waited again. Three days later, the tracking page still had not changed. She began to worry. Had the store lost the package? Had it ever sent the shoes? She could not tell." },
  { h: "🏪 The customer and the store" },
  { p: "At the same time, FastFeet's owner, Leo, was dealing with a different problem. The store had received more orders than expected during the discount campaign. The delivery company had delayed several packages, and Leo's small team was struggling to answer every message." },
  { p: "Leo had not intended to disappoint customers. However, he had made a mistake: the website promised a delivery time that the store could not always meet. His customer service policy was also difficult to find." },
  { p: "When Emma contacted the store again, Leo finally checked order 4821. He discovered that the order had not been handed to the delivery company. The store had run out of Emma's shoe size, but the website had continued to accept orders." },
  { p: "Leo had to decide what to do. He could ignore the message, blame the delivery company or explain the situation honestly. He chose to apologize, tell Emma what had happened and offer a clear solution according to the applicable rules and the order's conditions." },
  { p: "Emma wanted either the shoes she had paid for or a suitable solution. She did not want a vague promise that the package would arrive “soon.” She asked the store to confirm the next steps in writing." },
  { h: "⚖️ Three different problems" },
  { p: "The case helped Emma understand that online shopping problems can be different." },
  { olist: [
    "A package may not arrive. The customer should keep the order confirmation, payment evidence and messages with the store. If the problem is not resolved, the customer may need to contact the payment provider or the appropriate consumer-protection channel, depending on the circumstances.",
    "A product may arrive damaged or fail to work as promised. That situation is not the same as simply changing one's mind. The applicable warranty rules and the nature of the defect can affect the possible solution.",
    "A customer may change their mind after an online purchase. In Colombia, the right of withdrawal, known as derecho de retracto, may apply to certain distance sales. However, it has conditions, deadlines and exceptions. Students should not assume that every product can always be returned for any reason.",
  ] },
  { p: "Emma's case was mainly about a delivery problem. She had not received the shoes and did not know when she would receive them. She therefore focused on the order, the promise made by the store and the evidence showing what had happened." },
  { h: "📋 A better store policy" },
  { p: "Leo realized that he needed to change the way FastFeet worked. He updated the product inventory so that customers could not buy items that were unavailable. He also changed the delivery message to give a more realistic estimate." },
  { p: "The store added a clear section with contact information, delivery conditions, return and warranty information, and instructions for making a complaint. Leo learned that a policy should be easy to find and written in language customers can understand." },
  { p: "He also trained his team to respond respectfully. A customer who reports a problem is not an enemy. The message is an opportunity to find out what went wrong and to correct it." },
  { p: "Emma kept her order confirmation and the messages from FastFeet. She reviewed the available information and followed the store's response process. The important point was not to assume that every delay was fraud, but also not to accept endless promises without evidence." },
  { h: "💡 The lesson for every online business" },
  { p: "Emma's experience changed how she shopped. She now checked the store's identity, delivery conditions and contact information before buying. She saved her confirmation and looked for clear policies." },
  { p: "Leo's experience changed how he sold. He learned that honest advertising, realistic delivery estimates and clear complaint channels protect both the customer and the business." },
  { box: "A trustworthy store does not promise that nothing will ever go wrong. It explains what customers can expect and gives them a fair way to solve problems when something does go wrong." },
];
const GLOSS_28 = { "order confirmation": "Confirmación del pedido.", "tracking page": "Página de seguimiento del envío.", "business days": "Días hábiles.", "complaint": "Reclamo / PQR.", "warranty": "Garantía.", "right of withdrawal": "Derecho de retracto.", "evidence": "Pruebas / evidencia.", "delivery estimate": "Tiempo estimado de entrega." };
const Q_28 = [
  { q: "Why did Emma choose FastFeet?", options: ["It was cheaper than other stores", "Because a famous athlete recommended it on television during a football match", "It was near her house", "A friend works there"], correct: 0, feedback: "She compared prices — but not policies." },
  { q: "What did the website promise?", options: ["Delivery within five business days", "Free shoes for every customer who wrote a review about the store on social media", "Delivery in one hour", "A gift card"], correct: 0, feedback: "A promise the store could not always keep." },
  { q: "What did the tracking page say for many days?", options: ["“Preparing your order.”", "“Your package was delivered to your neighbor and signed by your mother.”", "“Cancelled.”", "“Lost.”"], correct: 0, feedback: "It never changed." },
  { q: "What did Leo discover about order 4821?", options: ["It was never sent: her size was sold out", "The delivery company had stolen the shoes and sold them in another city", "Emma never paid", "It was delivered"], correct: 0, feedback: "The website kept accepting orders for an unavailable size." },
  { q: "Why was the store's delivery message a problem?", options: ["It promised a time the store couldn't meet", "Because it was written in a language that nobody in the city could read or understand", "It was too short", "It had no colors"], correct: 0, feedback: "Realistic estimates build trust." },
  { q: "How did Leo finally respond?", options: ["He apologized and offered a clear solution", "He blamed the delivery company and closed the online store for the rest of the year", "He ignored her", "He sent a coupon only"], correct: 0, feedback: "Honesty + a clear next step." },
  { q: "How is a missing package different from a damaged product?", options: ["One never arrives; the other arrives with a defect", "They are exactly the same problem, so the store must always give the same solution", "Damaged ones are free", "No difference"], correct: 0, feedback: "Different problems → different evidence and solutions." },
  { q: "Does the right of withdrawal apply to every product in every situation?", options: ["No, it has conditions and exceptions", "Yes, every product can always be returned for any reason and at any time you want", "Only for shoes", "Only on Mondays"], correct: 0, feedback: "Derecho de retracto: certain distance sales, with deadlines and exceptions." },
  { q: "What evidence did Emma keep?", options: ["Her order confirmation and the messages", "Only a photo of the shoes that she found on another website and saved on her phone", "Nothing", "A video of her cat"], correct: 0, feedback: "Evidence shows what happened." },
  { q: "What changes did Leo make to his store?", options: ["Real inventory, realistic delivery and clear policies", "He increased all the prices and removed the contact information so nobody could complain", "A new logo only", "He closed it"], correct: 0, feedback: "Policies should be easy to find and to understand." },
  { q: "What should Emma NOT do, according to the story?", options: ["Accept endless promises without evidence", "Keep her order confirmation and all the messages that she exchanged with the store", "Write politely", "Check the tracking"], correct: 0, feedback: "Not every delay is fraud — but ask for clear next steps." },
  { q: "What does a trustworthy store do?", options: ["Explains what to expect and how to solve problems", "Promises that absolutely nothing will ever go wrong with any order, ever", "Hides its address", "Never answers"], correct: 0, feedback: "Fair ways to solve problems." },
];

/* ---------- READING 3 · My Data, My Rules (clase 30) ---------- */
const READ_30 = [
  { sub: "Why does a shop need my birthday?" },
  { p: "Maya was building an online shop for handmade bracelets as part of a school project. She wanted the shop to look professional, so she added product pictures, prices and a checkout page." },
  { p: "Her first customer was her friend Daniel. He chose a blue bracelet and clicked “Buy Now.” The checkout form asked for his full name, home address, phone number, birthday, school name, identification number and social media password." },
  { say: "Daniel stopped. “Why do you need my social media password to sell me a bracelet?” he asked." },
  { p: "Maya looked at the form. She had copied it from another website because it seemed complete. She had never asked herself whether every field was necessary." },
  { p: "Daniel did not finish the purchase. Instead, he suggested that they ask their teacher for help. The teacher explained that online businesses should think carefully about personal data. Personal data is information that identifies a person or can be linked to them. A name, phone number or address can be personal data. Some information is more sensitive because sharing it can create greater risks." },
  { p: "The teacher asked Maya to imagine that the shop had hundreds of customers. What could happen if the store collected more information than it needed? What if someone accessed the information without permission? What if the business used the data for a different purpose from the one customers expected?" },
  { p: "Maya understood that data collection was not just a technical question. It was also a question of trust." },
  { h: "🔎 The data detective" },
  { p: "Maya and Daniel created a list of the information the shop might request. A name could help identify the customer or prepare an order. A delivery address could be needed if the product had to be sent to the customer's home. A contact detail might help the store communicate about delivery." },
  { p: "But the customer's school name was not necessary for selling a bracelet. Their social media password was not necessary either. The store did not need to know the customer's location every minute." },
  { box: "Data minimization: collect only the information needed for a clear purpose. A store should not collect information simply because it might be useful someday." },
  { p: "They also discussed transparency. A privacy notice should explain what information the store collects, why it collects it and how it is handled. The language should be understandable. A long legal text that customers cannot understand does not build trust very well." },
  { p: "Maya changed the form. She kept the information needed to process the fictional order and removed the unnecessary questions. She added a short privacy notice and a way to contact the store with questions." },
  { h: "🔐 Passwords and the digital footprint" },
  { p: "The project also made Maya think about her own digital identity. She often used the same password for several accounts because it was easy to remember. The teacher explained that this created a problem: if one account was compromised, other accounts could also be at risk." },
  { p: "Maya began using long, unique passwords for important accounts and learned about password managers. She also learned about two-factor authentication, or 2FA. With 2FA, a person needs a second form of verification in addition to a password. This can make unauthorized access more difficult." },
  { p: "Daniel showed Maya another problem. He had posted a picture of his school uniform with the school logo visible, along with a comment about being home alone after classes. He had not thought about who might see the post." },
  { p: "They reviewed their public profiles and removed details they did not need to share publicly. They understood that a digital footprint is the information a person leaves online through posts, comments, photos and other activity. Some information can remain available even after a post is deleted or changed." },
  { say: "The teacher reminded them that privacy does not mean hiding everything. It means thinking about what to share, with whom and for what purpose." },
  { h: "📧 A difficult message" },
  { p: "A week later, Maya received an email that looked like a message from a payment service. It said her shop account would be closed unless she confirmed her password immediately. The message used the shop's name and included a link." },
  { p: "Maya felt nervous because she did not want to lose her orders. She almost clicked the link, but then she noticed that the sender's address looked unusual. She did not reply or enter her password. Instead, she opened the service through its official application and checked the account there. There was no warning about account closure." },
  { p: "Maya reported the suspicious message and deleted it. She also reviewed her account security. She realized that protecting data requires more than a good privacy notice. A business needs safe account practices, limited access to customer information and a plan for responding to suspicious activity." },
  { h: "🤝 Trust is part of the product" },
  { p: "At the end of the project, Daniel bought a bracelet from Maya's shop. The checkout form was shorter, the privacy notice was clear and the payment process did not ask for irrelevant information. Maya had not made her shop less professional by removing fields. She had made it easier to use and safer for customers." },
  { p: "The class also discussed the Colombian legal framework for personal data protection, including Law 1581 of 2012. The teacher explained that real businesses must review the rules that apply to their activities, purposes and types of data. A school simulation can teach good habits, but it is not a substitute for legal advice." },
  { say: "Maya wrote one final rule in her notebook: “If I cannot explain why I need a piece of information, I should stop and ask whether I need to collect it at all.”" },
  { p: "She wanted her shop to make money, but she also wanted customers to feel safe. Trust was not an extra feature added after a business opened. It was part of the business from the beginning." },
];
const GLOSS_30 = { "personal data": "Datos personales.", "sensitive": "Sensible (más riesgoso).", "privacy notice": "Aviso de privacidad.", "data minimization": "Minimización de datos.", "digital footprint": "Huella digital.", "two-factor authentication": "Autenticación de dos factores (2FA).", "unauthorized access": "Acceso no autorizado.", "password managers": "Gestores de contraseñas." };
const Q_30 = [
  { q: "Why did Daniel stop before completing his purchase?", options: ["The form asked for his social media password", "Because the bracelet was too expensive compared with the other online stores in the city", "The website was slow", "He lost his card"], correct: 0, feedback: "A bracelet shop doesn't need that!" },
  { q: "Where did Maya get her first checkout form?", options: ["She copied it from another website", "Her teacher wrote it for her as a model for every project in the whole school", "From a law book", "She invented every field"], correct: 0, feedback: "It “seemed complete” — but nobody asked why." },
  { q: "Which information did Maya remove from the form?", options: ["School name and social media password", "The delivery address, because the bracelets were always delivered by email", "The product name", "The price"], correct: 0, feedback: "Not needed to sell a bracelet." },
  { q: "What is data minimization?", options: ["Collecting only what you need for a clear purpose", "Collecting as much information as possible in case it is useful someday in the future", "Deleting the store", "Making text smaller"], correct: 0, feedback: "Less data, less risk." },
  { q: "Why should a privacy notice be clear?", options: ["So customers understand it and trust the store", "Because long legal texts that nobody understands are the best way to build trust", "To look pretty", "It must be secret"], correct: 0, feedback: "What, why and how — in simple words." },
  { q: "How can reusing passwords create a risk?", options: ["If one account is hacked, others are at risk", "Because the same password expires faster when you use it in many different accounts", "It's slow", "It's not a risk"], correct: 0, feedback: "One leak can open many doors." },
  { q: "What is 2FA?", options: ["A second verification step besides the password", "Two different passwords that you must write on a paper next to your computer", "Two phones", "A type of virus"], correct: 0, feedback: "It makes unauthorized access more difficult." },
  { q: "What is a digital footprint?", options: ["The information you leave online", "The marks that your shoes leave on the floor of the computer room at school", "Your phone model", "Your password"], correct: 0, feedback: "Posts, comments, photos… and some of it stays." },
  { q: "What was the problem with Daniel's post?", options: ["It showed his school and that he was home alone", "It had too many emojis and spelling mistakes that his English teacher noticed", "It was private", "It had no photo"], correct: 0, feedback: "Think: who might see it?" },
  { q: "How did Maya respond to the suspicious email?", options: ["She checked in the official app and reported it", "She clicked the link and quickly confirmed her password so the account wouldn't close", "She replied", "She ignored her shop"], correct: 0, feedback: "Never enter credentials from a suspicious link." },
  { q: "Which Colombian law is mentioned about personal data?", options: ["Law 1581 of 2012", "The traffic law that controls the speed of motorcycles in big cities", "Law 1480 only", "No law"], correct: 0, feedback: "Ley 1581 de 2012 — habeas data." },
  { q: "Why did collecting less data help her shop?", options: ["It was easier to use and safer", "Because the shop could then sell the extra data to other companies for more money", "It looked empty", "It didn't help"], correct: 0, feedback: "Trust is part of the product." },
];

/* ---------- READING 4 · From a Phone to the World (clase 31) ---------- */
const READ_31 = [
  { sub: "A small idea with a big problem" },
  { p: "Nicolás loved technology and noticed a problem in his neighborhood. Several small businesses sold good products, but customers did not always know what was available. Some shops received orders through messages, while others wrote orders on paper. When the shops became busy, they sometimes lost track of requests." },
  { p: "Nicolás imagined a simple digital platform where small businesses could display their products and receive orders. Customers could compare options, and sellers could update their stock. He called the idea LocalLink." },
  { p: "At first, Nicolás thought the most difficult part would be building the app. He soon discovered that he also needed to understand the business. Who would pay for the service? How much would it cost to run? How would the platform protect customer information? How would sellers receive payments?" },
  { p: "His teacher explained that FinTech combines finance and technology to create or improve financial services. E-commerce, on the other hand, refers to buying and selling through digital channels. LocalLink could connect the two ideas by helping small businesses sell online and manage digital payments. But an attractive idea was not yet a business model." },
  { h: "💰 How will LocalLink make money?" },
  { p: "Nicolás considered three options." },
  { list: [
    "Commission: LocalLink would receive a small percentage of each sale. The platform could earn more when sellers completed more orders, but the commission would need to be reasonable for small businesses.",
    "Subscription: sellers would pay a fixed amount every month. Income could be more predictable, but some sellers might not want to pay before they knew whether the service would help them.",
    "Freemium: sellers could use a basic version for free and pay for extra features. This could help new users try the service, but Nicolás would need to decide which features belonged in each version and how to cover the cost of the free service.",
  ] },
  { p: "He compared the three models and asked local shop owners what they needed. Some wanted a free way to display products. Others were willing to pay for tools that saved time or helped them manage orders." },
  { box: "The best business model is not necessarily the one that charges the most. It is the one that creates value for customers and gives the business a realistic way to cover its costs." },
  { h: "🏦 The funding problem" },
  { p: "Nicolás estimated that LocalLink needed $6,000,000 COP to launch its first version. The money would pay for development, basic marketing, support tools and an emergency reserve. He had saved $2,000,000. That meant he still needed $4,000,000." },
  { p: "His first idea was to take a loan. However, he remembered what he had learned about interest and monthly payments. He calculated an estimated installment and tested whether the business could cover it if sales were lower than expected." },
  { p: "He also considered finding an investor. An investor could provide money in exchange for an ownership share or another agreed return. Nicolás would not have a regular loan installment in the same way, but he might have to share control or future profits." },
  { p: "A third option was to apply for a seed-funding program. Some programs support early businesses, but applications take time and approval is not guaranteed. Nicolás could not assume that the money would arrive." },
  { p: "He decided to compare the options rather than choose immediately. He tested a six-month cash-flow plan with three scenarios: expected sales, low sales and a difficult month. The plan showed that the platform needed enough money to cover operating costs even before it became profitable." },
  { h: "🧭 The ethics test" },
  { p: "LocalLink began to attract attention. Nicolás wanted to collect as much information as possible so the app could recommend products to users. His team suggested collecting exact location, contacts, birthday, browsing habits and other personal details." },
  { p: "Nicolás stopped the discussion. Did the app really need all this information to show a list of local products? Some information might help with a specific feature, but collecting everything would increase privacy risks. He decided to start with the minimum information needed for the service and explain how it would be used." },
  { p: "Then another problem appeared. A seller asked LocalLink to promote a product using a misleading discount. The original price had been increased just before the promotion, making the discount look larger than it really was. Nicolás refused. Short-term sales could damage the platform's reputation if customers felt deceived." },
  { p: "The team also considered packaging and delivery. If every small order used excessive packaging, the platform could create unnecessary waste. Nicolás began exploring ways for sellers to use suitable packaging and combine deliveries when practical." },
  { h: "🌍 From a local idea to a global question" },
  { p: "Nicolás researched how digital tools can help people and businesses in different places. In some communities, digital payments can make transactions more convenient. In others, limited internet access, high fees, lack of trust or low digital skills can prevent people from benefiting." },
  { p: "He learned that technology does not automatically solve every problem. A useful service must fit the people who use it. It should be accessible, affordable, safe and clear about its costs." },
  { p: "His teacher connected the project with two Sustainable Development Goals. SDG 9 focuses on industry, innovation and infrastructure. SDG 12 focuses on responsible consumption and production. LocalLink could support these goals if it helped small businesses use appropriate technology and encouraged responsible practices. But the team would need evidence of its impact, not just a slogan." },
  { h: "🚀 The first launch" },
  { p: "Nicolás launched a small test with five local shops. The platform was not perfect. Some sellers needed help uploading products, and a few orders were delayed. However, the team learned which features were useful and which created confusion. They made the instructions simpler and improved the way sellers confirmed orders." },
  { say: "A startup is not successful just because it has an app or attracts attention. It needs customers, a sustainable way to pay its costs, responsible use of information and a plan for solving problems." },
];
const GLOSS_31 = { "FinTech": "Tecnología financiera.", "business model": "Modelo de negocio.", "commission": "Comisión por venta.", "subscription": "Suscripción (pago recurrente).", "freemium": "Básico gratis + extras pagos.", "investor": "Inversionista.", "seed-funding": "Capital semilla.", "cash-flow": "Flujo de caja.", "ownership share": "Participación en la empresa.", "Sustainable Development Goals": "Objetivos de Desarrollo Sostenible (ODS)." };
const Q_31 = [
  { q: "What problem did Nicolás notice in his neighborhood?", options: ["Small shops lost track of orders", "The shops were too big and had too many employees who did nothing all day", "There was no internet", "Prices were too low"], correct: 0, feedback: "Orders by message or paper got lost." },
  { q: "How could LocalLink help small businesses?", options: ["Show products and receive orders", "By lending them money at a very high interest rate every month without any contract", "By closing them", "By delivering mail"], correct: 0, feedback: "A simple platform to sell online." },
  { q: "In a commission model, LocalLink earns…", options: ["A percentage of each sale", "A fixed amount that every seller pays every month, even without any sales at all", "Nothing", "Money from ads only"], correct: 0, feedback: "More sales → more income." },
  { q: "What is a risk of the subscription model?", options: ["Sellers may not want to pay before seeing results", "Income becomes completely random and impossible to predict from one month to the next", "It's illegal", "No risk"], correct: 0, feedback: "Predictable — but harder to start." },
  { q: "What is freemium?", options: ["A free basic version plus paid extras", "A version where everything is free forever and the company never earns any money", "A loan", "A discount coupon"], correct: 0, feedback: "Who pays for the free part?" },
  { q: "How much did LocalLink need to launch, and how much did Nicolás have?", options: ["$6,000,000 needed · $2,000,000 saved", "$4,000,000 needed · $6,000,000 saved, so he had more than enough money", "$2,000,000 · $0", "$1,000,000 · $1,000,000"], correct: 0, feedback: "A gap of $4,000,000." },
  { q: "What is the difference between a loan and an investment?", options: ["A loan has installments; an investor gets a share", "There is no difference, because in both cases you never have to give anything back", "Loans are free", "Investors always lend"], correct: 0, feedback: "Installment vs. sharing ownership or profits." },
  { q: "Why couldn't Nicolás count on the seed-funding money?", options: ["Approval is not guaranteed", "Because seed money is only for very big companies with more than one thousand workers", "It was a scam", "It was too much"], correct: 0, feedback: "Never plan with money you don't have yet." },
  { q: "Why did Nicolás question collecting so much personal data?", options: ["It increases privacy risks", "Because collecting data is always illegal in every country of the world", "It was boring", "It was expensive"], correct: 0, feedback: "Start with the minimum needed." },
  { q: "How could misleading discounts damage the business?", options: ["Customers feel deceived and stop trusting it", "They make the products more expensive to produce in the factory", "They don't", "They raise taxes"], correct: 0, feedback: "Reputation is worth more than one sale." },
  { q: "How could LocalLink connect with SDG 9 or SDG 12?", options: ["Appropriate technology and responsible practices, with evidence", "By writing “we save the planet” in big green letters on the home page of the app", "By selling more plastic", "It can't"], correct: 0, feedback: "SDG 9 innovation · SDG 12 responsible consumption — prove it." },
  { q: "What did Nicolás learn from the first launch?", options: ["Test, listen and improve with evidence", "That an app with a nice design is enough to have a successful business forever", "Never launch", "Shops don't need help"], correct: 0, feedback: "Customers + sustainable costs + responsibility." },
];

/* ---------- BOSS DEL AÑO · banco de repaso (4 periodos) ---------- */
const BOSS_YEAR = [
  { q: "P1 · Your monthly income is $400,000. You save 20% first. How much do you save?", options: ["$80,000", "$200,000, because saving half of everything is always the rule", "$20,000", "$40,000"], correct: 0, feedback: "400,000 × 20%." },
  { q: "P1 · A product costs $10,000 + 19% IVA. Final price?", options: ["$11,900", "$19,000, because IVA almost doubles the price of every product", "$10,019", "$1,900"], correct: 0, feedback: "10,000 × 1.19." },
  { q: "P1 · A coffee farm belongs to the…", options: ["Primary sector", "Secondary sector, because coffee is later transformed into a drink", "Quinary sector", "No sector"], correct: 0, feedback: "From nature." },
  { q: "P2 · An emergency fund is for…", options: ["Unexpected and urgent expenses", "Buying things on sale before the discount ends tonight at midnight", "Vacations", "Paying friends"], correct: 0, feedback: "Urgent + unexpected." },
  { q: "P2 · Your account pays 8% a year, inflation is 10%. Your real return is about…", options: ["−2%", "+18%, because you add the interest rate and the inflation", "+8%", "0%"], correct: 0, feedback: "8 − 10 ≈ −2: you lose buying power." },
  { q: "P2 · The opportunity cost of a $5,000 snack every day is…", options: ["What you give up by spending that money", "Only the $5,000 price written on the snack package in the store", "Zero", "The tax"], correct: 0, feedback: "Small daily costs = big yearly amounts." },
  { q: "P3 · Offer A: 2% monthly. Offer B: 22% EA. Which is cheaper?", options: ["Offer B (2% monthly ≈ 26.8% EA)", "Offer A, because 2 is a much smaller number than 22", "They are equal", "You can't know"], correct: 0, feedback: "Always compare in EA." },
  { q: "P3 · Balance $1,000,000 at 2% monthly. Interest this month?", options: ["$20,000", "$200,000, because the rate is applied twice to the whole balance", "$2,000", "$120,000"], correct: 0, feedback: "Balance × monthly rate." },
  { q: "P3 · Diversification means…", options: ["Spreading money across different investments", "Putting all your money in the investment that grew the most last month", "Saving in cash", "Borrowing to invest"], correct: 0, feedback: "Many baskets." },
  { q: "P4 · Right after checkout, the card data goes to…", options: ["The payment gateway", "Directly into the store owner's personal savings account without checks", "The courier", "Instagram"], correct: 0, feedback: "Gateway → network → bank → merchant account." },
  { q: "P4 · Margin per sale = …", options: ["Price − variable costs", "Price + all the costs, because the customer pays everything at the end", "Price × 2", "Fixed costs ÷ price"], correct: 0, feedback: "What stays from each sale." },
  { q: "P4 · Fixed costs $200,000/month, margin $20,000 per sale. Break-even?", options: ["10 sales", "4,000,000 sales, because you multiply the two numbers", "20 sales", "1 sale"], correct: 0, feedback: "200,000 ÷ 20,000." },
  { q: "P4 · A wallet with $0 monthly fee…", options: ["Can still charge for other operations", "Is always the cheapest option for every person and every type of payment", "Is illegal", "Has no limits"], correct: 0, feedback: "Look at the total cost for YOUR use." },
  { q: "P4 · A product arrives broken. The customer should ask for…", options: ["The warranty (repair, replace or refund)", "The right of withdrawal, because breaking is the same as changing your mind", "Nothing", "A discount next year"], correct: 0, feedback: "Defect ≠ change of mind." },
  { q: "P4 · Your phone suddenly has no signal and you get login alerts. First step?", options: ["Contact your carrier through an official channel", "Wait two or three days to see if the signal comes back on its own", "Post it online", "Buy a new SIM from a stranger"], correct: 0, feedback: "Possible SIM swap: act fast, by official channels." },
  { q: "P4 · A buyer sends a screenshot of a payment. Before shipping you…", options: ["Check the payment in your official account", "Ship immediately because a screenshot is official proof that the money arrived", "Ask for a selfie", "Trust it"], correct: 0, feedback: "Screenshots can be fake." },
  { q: "P4 · Data minimization means…", options: ["Collecting only what you need", "Collecting everything because it might be useful someday for marketing", "Deleting the store", "Using small fonts"], correct: 0, feedback: "Less data, less risk." },
  { q: "P4 · “Guaranteed 15% monthly returns, invest today!” is…", options: ["A red flag for fraud", "A normal, safe offer that banks give to all young people in Colombia", "A CDT", "A grant"], correct: 0, feedback: "Unrealistic + pressure = scam signals." },
  { q: "P4 · An investor gives you money in exchange for…", options: ["A share of your business", "A fixed monthly installment with interest, exactly like a bank loan", "Nothing", "Your password"], correct: 0, feedback: "You share ownership or profits." },
  { q: "P4 · SDG 12 is about…", options: ["Responsible consumption and production", "Building more highways and airports in every big city of the country", "Ending wars", "Clean water only"], correct: 0, feedback: "SDG 9 = industry, innovation, infrastructure." },
];

/* =====================================================================
   CLASE 26 · FOLLOW THE PAYMENT
   ===================================================================== */
const START_26 = {
  cards: [
    { e: "🏪", t: "Merchant", d: "The business that sells the product or service.", ex: "Your online store." },
    { e: "🙋", t: "Customer", d: "The person who buys and pays.", ex: "Laura buys headphones." },
    { e: "🔐", t: "Payment gateway", d: "The service that receives the card data at checkout, encrypts it and sends it to be authorized.", ex: "The “Pay” button connects to it." },
    { e: "🌐", t: "Payment network", d: "The system that connects the gateway with the banks (card networks and processors).", ex: "Visa, Mastercard…" },
    { e: "✅", t: "Authorization", d: "The bank's decision: approved or declined.", ex: "It takes about 2 seconds." },
    { e: "🏦", t: "Merchant account", d: "The account where the store receives the money from sales.", ex: "The money arrives here." },
    { e: "🔒", t: "Encryption", d: "Changing data into a secret code so other people can't read it.", ex: "4589… → x7#Q!…" },
    { e: "↩️", t: "Refund", d: "The store sends money back to the customer.", ex: "A returned jacket." },
    { e: "⚠️", t: "Chargeback", d: "A payment dispute: the customer asks the bank to reverse a charge.", ex: "“I never received my order!”" },
  ],
  pairs: [{ a: "Merchant", b: "The business that sells" }, { a: "Payment gateway", b: "Encrypts and sends card data" }, { a: "Authorization", b: "Approved or declined" }, { a: "Merchant account", b: "Where the store gets the money" }, { a: "Refund", b: "Money goes back to the customer" }, { a: "Chargeback", b: "A dispute to reverse a charge" }],
};
const RUSH_26 = {
  buckets: [{ id: "cust", e: "🙋", l: "Customer", d: "Buys & pays", c: "#e07a2f" }, { id: "gate", e: "🔐", l: "Gateway", d: "Encrypts & sends", c: "#0b7a50" }, { id: "bank", e: "🏦", l: "Bank / network", d: "Decides & moves money", c: "#f5b23e" }, { id: "store", e: "🏪", l: "Merchant", d: "Sells & ships", c: "#ff6b57" }],
  items: [
    { e: "👆", t: "Taps “Pay” at checkout", b: "cust", why: "The customer starts the payment." }, { e: "💳", t: "Types the card number and confirms", b: "cust", why: "The customer gives the payment data." },
    { e: "🔒", t: "Encrypts the card data", b: "gate", why: "Protecting data is the gateway's job." }, { e: "📨", t: "Sends the data safely for authorization", b: "gate", why: "It shuttles the data to the networks." },
    { e: "🔎", t: "Checks if there is enough money", b: "bank", why: "Only the bank knows the balance." }, { e: "✅", t: "Approves or declines the payment", b: "bank", why: "Authorization = the bank's decision." },
    { e: "⏸️", t: "Blocks a strange payment to review it", b: "bank", why: "Banks run fraud checks." }, { e: "💸", t: "Moves the money to the merchant account", b: "bank", why: "The networks and banks transfer it." },
    { e: "📦", t: "Ships the product after the payment is confirmed", b: "store", why: "Never before the confirmation!" }, { e: "↩️", t: "Processes a refund for a returned product", b: "store", why: "The store sends the money back." },
    { e: "🧾", t: "Sends evidence of the sale in a chargeback", b: "store", why: "Order + tracking + delivery proof." }, { e: "📞", t: "Asks the bank to dispute a charge they don't recognize", b: "cust", why: "The customer starts a dispute." },
  ],
};

/* ---------- PAYMENT JOURNEY · construye la ruta y vive 5 rondas ---------- */
const ROUTE26 = [["cust", "🙋", "Customer"], ["gate", "🔐", "Payment gateway"], ["net", "🌐", "Payment network"], ["bank", "🏦", "Bank"], ["store", "🏪", "Merchant"]];
const ROUNDS26 = [
  { e: "✅", t: "Normal payment", act: ["cust", "gate", "net", "bank", "store"], story: "Laura buys headphones for $100,000 with her card. Two seconds later…", screen: ["✅ Payment approved", "Order #1001 · $100,000"], tone: "ok",
    qs: [
      { q: "What happened?", options: ["Her bank approved it; the money goes to the merchant account", "The gateway kept the money and will send it to the store owner's personal account next year", "The store printed it", "Nothing happened"], correct: 0 },
      { q: "Which actor made the decision?", options: ["Laura's bank", "The delivery company that will take the headphones to Laura's house", "The store", "The website designer"], correct: 0 },
      { q: "What should the store do now?", options: ["Confirm the order and ship it", "Ask Laura to send a photo of her card by WhatsApp to confirm the payment again", "Refund it", "Wait a month"], correct: 0 },
    ] },
  { e: "❌", t: "Insufficient funds", act: ["cust", "gate", "net", "bank"], story: "Andrés tries to pay $100,000, but his account only has $60,000.", screen: ["❌ Payment declined", "Reason: insufficient funds"], tone: "no",
    qs: [
      { q: "What happened?", options: ["His bank declined it: not enough money", "The gateway approved it and the store must ship the product before the money arrives", "The card was stolen", "The store closed"], correct: 0 },
      { q: "Which actor made the decision?", options: ["Andrés's bank", "The payment gateway, which always decides by itself without asking any bank", "Andrés", "The courier"], correct: 0 },
      { q: "What should the store do?", options: ["Don't ship; invite him to try another method", "Ship the order anyway and send Andrés a message to pay the rest when he can", "Call the police", "Block him forever"], correct: 0 },
    ] },
  { e: "⏸️", t: "Suspicious activity", act: ["cust", "gate", "net", "bank"], story: "At 3:12 a.m., a card from another country tries to buy 8 phones in 5 minutes.", screen: ["⏸️ Payment on hold", "Under review by the bank"], tone: "warn",
    qs: [
      { q: "What happened?", options: ["The bank blocked it to check for fraud", "The store's website broke because too many people visited it at the same time", "It was approved", "The phones were sent"], correct: 0 },
      { q: "Which actor intervened?", options: ["The bank (fraud check)", "The customer's best friend, who saw the purchase on social media", "The store", "Nobody"], correct: 0 },
      { q: "What should the store do?", options: ["Wait for confirmation before shipping", "Ship the 8 phones quickly before the bank cancels the payment so you don't lose the sale", "Delete the order history", "Raise prices"], correct: 0 },
    ] },
  { e: "↩️", t: "Refund", act: ["store", "bank", "cust"], story: "Mateo returns a jacket that arrived in the wrong size, following the store's return policy.", screen: ["↩️ Refund requested", "Order #1004 · $100,000"], tone: "warn",
    qs: [
      { q: "What happens in a refund?", options: ["The store sends the money back to the customer", "The bank takes money from the store without asking and gives it to another store", "Mateo pays again", "The jacket is free"], correct: 0 },
      { q: "Which actor starts the refund?", options: ["The merchant (the store)", "The payment network, which decides alone which customers deserve their money back", "The courier", "Mateo's school"], correct: 0 },
      { q: "What should the store do?", options: ["Refund through the same method and keep the record", "Pay Mateo in cash at the door and forget about writing anything down in the system", "Ignore him", "Give a coupon only"], correct: 0 },
    ] },
  { e: "⚠️", t: "Chargeback", act: ["cust", "bank", "store"], story: "A customer tells her bank: “I never received my $100,000 order!” The bank opens a dispute.", screen: ["⚠️ Payment disputed", "Chargeback · Order #1005"], tone: "no",
    qs: [
      { q: "What is happening?", options: ["A payment dispute: the bank may reverse the charge", "A normal refund that the store started because the customer returned the product", "A new sale", "A discount"], correct: 0 },
      { q: "Who opened the dispute?", options: ["The customer, through her bank", "The payment gateway, because it doesn't like the store's products or prices", "The store", "The government"], correct: 0 },
      { q: "What should the store do?", options: ["Send evidence: order, tracking and delivery proof", "Delete the order from the system so the bank can't see that the sale existed", "Ship a second product", "Nothing"], correct: 0 },
    ] },
];
function PaymentJourney({ onSave, onExit }) {
  const [stage, setStage] = useState("route");
  const [pool] = useState(() => shuffleArr(ROUTE26.map((x) => x[0])));
  const [route, setRoute] = useState([]);
  const [routeMsg, setRouteMsg] = useState(null);
  const [rTries, setRTries] = useState(0);
  const [rd, setRd] = useState(0);
  const [qi, setQi] = useState(0);
  const [errs, setErrs] = useState(0);
  const [st, finish] = useFinish(onSave);
  const R = ROUNDS26[rd];
  const coins = Math.max(20, 36 - errs * 2 - Math.max(0, rTries - 1) * 2);
  const checkRoute = () => {
    setRTries(rTries + 1);
    if (route.join() === ROUTE26.map((x) => x[0]).join()) { setRouteMsg("ok"); }
    else { setRouteMsg("bad"); }
  };
  if (st.done) return <Reward title="Payment detective! 💳" subtitle="You followed the money from “Pay” to the merchant account." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Route size={22} strokeWidth={2.1} />} title="Payment Journey 💳" subtitle="Follow a $100,000 purchase from “Pay” to the merchant account. A simplified route — real payments vary by method and provider." onExit={onExit}>
      <Steps84 labels={["Build the route", ...ROUNDS26.map((x) => x.t)]} at={stage === "route" ? 0 : stage === "end" ? 6 : rd + 1} />
      {stage === "route" && (
        <>
          <Mission e="🗺️" title="Build the route of the money.">Tap the actors in order: who goes first when a customer presses “Pay”? Who receives the money at the end?</Mission>
          <div className="g84-route">
            {ROUTE26.map((_, k) => { const id = route[k]; const a = ROUTE26.find((x) => x[0] === id); return <div key={k} className={`g84-slot ${a ? "full" : ""} ${routeMsg === "ok" ? "ok" : ""}`}><small>{k + 1}</small>{a ? <><em>{a[1]}</em><b>{a[2]}</b></> : <span>?</span>}{k < 4 && <i>→</i>}</div>; })}
          </div>
          <div className="g84-chips">{pool.map((id) => { const a = ROUTE26.find((x) => x[0] === id); const used = route.includes(id); return <button key={id} type="button" disabled={used || routeMsg === "ok"} onClick={() => { setRoute([...route, id]); setRouteMsg(null); }}><em>{a[1]}</em>{a[2]}</button>; })}</div>
          {routeMsg === "bad" && <div className="p1-hint">💡 Not yet. Think: the customer pays → the gateway encrypts → the network carries the data → the bank decides → the money reaches the merchant.</div>}
          {routeMsg === "ok" && <div className="p1-banner good"><Check size={18} /> <span><b>Perfect route!</b> In real life all of this happens in about <b>2 seconds</b>. The money then moves to the merchant account.</span></div>}
          <div className="start-foot">
            {routeMsg !== "ok" && <button className="s1-btn ghost" disabled={!route.length} onClick={() => { setRoute([]); setRouteMsg(null); }}><RefreshCw size={16} /> Clear</button>}
            {routeMsg !== "ok" ? <button className="s1-btn primary big" disabled={route.length < 5} onClick={checkRoute}>Check the journey <Check size={16} /></button>
              : <button className="s1-btn primary big" onClick={() => setStage("rounds")}>Play the 5 rounds <ChevronRight size={18} /></button>}
          </div>
        </>
      )}
      {stage === "rounds" && (
        <div className="g83-app">
          <div className="g83-app-main">
            <div className={`g83-event ${R.tone === "ok" ? "up" : R.tone === "no" ? "down" : ""}`}><em>{R.e}</em><div><small>ROUND {rd + 1} / 5</small><b>{R.t}</b><p>{R.story}</p></div></div>
            {R.qs.slice(0, qi + 1).map((q, k) => <PickOne key={`${rd}-${k}`} tag={`STEP ${k + 1} / 3`} q={q.q} options={q.options} correct={q.correct} onRight={(w) => { setErrs((e) => e + w); setQi((x) => Math.max(x, k + 1)); }} />)}
            {qi >= 3 && <div className="start-foot"><button className="s1-btn primary big" onClick={() => { if (rd < 4) { setRd(rd + 1); setQi(0); } else setStage("end"); }}>{rd < 4 ? "Next round" : "See my results"} <ChevronRight size={18} /></button></div>}
          </div>
          <Phone84 title="CREAR Pay" logo="💳" sub="Merchant dashboard">
            <div className={`g84-ph-status ${R.tone}`}><b>{R.screen[0]}</b><span>{R.screen[1]}</span></div>
            <div className="g84-ph-flow">{ROUTE26.map(([id, e, l]) => <span key={id} className={R.act.includes(id) ? "on" : ""}>{e} {l}</span>)}</div>
            <small className="g83-ph-lab">⏱️ Decision time ≈ 2 seconds</small>
          </Phone84>
        </div>
      )}
      {stage === "end" && (
        <>
          <div className="g73-score"><small>MY PAYMENT JOURNEY</small><b className={errs <= 3 ? "good" : "bad"}>{15 - Math.min(15, errs)}/15</b><span>steps right on the first try</span></div>
          <div className="g84-learned">{ROUNDS26.map((x) => <div key={x.t}><em>{x.e}</em><b>{x.t}</b><span>{x.qs[2].options[0]}</span></div>)}</div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(coins, { errors: errs, routeTries: rTries })}>Finish the journey <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- MÓDULO 01 · MY STARTUP IDEA ---------- */
const LOGOS26 = ["🚀", "🌱", "🧴", "🫓", "👕", "📚", "🎨", "⚡", "🌎", "💚", "🦊", "⭐"];
const CUST26 = ["Teenagers", "Families", "Students", "Small businesses", "Neighbors", "Young workers"];
function IdeaModule({ resp, existing, onSave, onExit }) {
  const P = pastOf(resp);
  const [idea, setIdea] = useState(existing?.idea || null);
  const [name, setName] = useState(existing?.name || "");
  const [logo, setLogo] = useState(existing?.logo || "");
  const [sector, setSector] = useState(existing?.sector || null);
  const [cust, setCust] = useState(existing?.customer || null);
  const [txt, setTxt] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const I = STARTUPS.find((s) => s.id === idea);
  const secOk = I && sector === I.sector;
  const G = [W_REASON, W_CUSTOMER];
  const nameOk = name.trim().length >= 2 && name.trim().length <= 24;
  const ready = I && nameOk && logo && secOk && cust && goalsOk(txt, 20, 70, G);
  if (st.done) return <Reward title="Module 01 unlocked! 💡" subtitle={`${logo} ${name} is born.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Lightbulb size={22} strokeWidth={2.1} />} title="My Startup Idea 💡 · Module 01" subtitle="Choose your business, name it and explain the problem it solves." onExit={onExit}>
      <MBadge n="01" />
      <div className="start-block">
        <h3><span className="step-n">1</span> Your story so far</h3>
        <div className="g84-past">
          <div><small>PERIOD 1</small><b>{P.dream ? `🎓 ${P.dream}` : "🎓 Your dream job"}</b><span>{P.dreamSector ? `${P.dreamSector} sector` : "Money Blueprint"}</span></div>
          <div><small>PERIOD 2</small><b>{P.biz ? `${P.biz.e || "🚀"} ${P.biz.n}` : "🚀 Business capital plan"}</b><span>{P.biz ? `Capital: ${cop(P.biz.capital)}` : "Savings Portfolio"}</span></div>
          <div><small>PERIOD 3</small><b>🐷 {cop(P.fmSavings ?? 2000000)}</b><span>Future Me savings</span></div>
        </div>
        <p className="start-tip">💡 This period you become a founder. Everything you learned — income, saving, credit — goes into your startup.</p>
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> Choose your startup</h3>
        <div className="g84-ideas">{STARTUPS.map((s) => <button key={s.id} type="button" className={idea === s.id ? "on" : ""} onClick={() => { setIdea(s.id); setSector(null); if (!logo) setLogo(s.e); }}><em>{s.e}</em><b>{s.n}</b><span>It {s.what}.</span><small>Launch: {cop(s.launch)}</small></button>)}</div>
      </div>
      {I && (
        <div className="start-block">
          <h3><span className="step-n">3</span> Name & logo</h3>
          <input className="start-input" maxLength={24} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your store's name (2–24 letters)" />
          <div className="g74-chips g84-logos">{LOGOS26.map((l) => <button key={l} type="button" className={logo === l ? "on" : ""} onClick={() => setLogo(l)}>{l}</button>)}</div>
        </div>
      )}
      {I && (
        <div className="start-block">
          <h3><span className="step-n">4</span> Which economic sector is your startup in?</h3>
          <p className="start-tip">Remember Period 1: what does your business mainly DO? It {I.what}.</p>
          <div className="g84-sectors">{SECTORS5.map((s) => <button key={s.id} type="button" className={`${sector === s.id ? (secOk ? "ok" : "no") : ""}`} onClick={() => setSector(s.id)}><em>{s.e}</em><b>{s.l}</b><small>{s.d}</small></button>)}</div>
          {sector && !secOk && <div className="p1-hint">💡 Not this one. Does it take things from nature, transform materials, offer a service, or create knowledge and technology?</div>}
          {secOk && <div className="p1-banner good"><Check size={18} /> <span>Correct: the <b>{SECTORS5.find((s) => s.id === sector).l}</b> sector.</span></div>}
        </div>
      )}
      {secOk && (
        <div className="start-block">
          <h3><span className="step-n">5</span> Your ideal customer</h3>
          <div className="g74-chips">{CUST26.map((c) => <button key={c} type="button" className={cust === c ? "on" : ""} onClick={() => setCust(c)}>{c}</button>)}</div>
          <h3 className="g84-mt"><span className="step-n">6</span> What problem does it solve?</h3>
          <Starters items={[`My startup is called ${name || "…"}.`, "It helps", "because", "Many customers have a problem:"]} onPick={appendStarter(setTxt)} />
          <WordField value={txt} onChange={setTxt} min={20} max={70} goals={G} placeholder="Write 2–3 sentences in English…" />
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(26, { idea, name: name.trim(), logo, sector, customer: cust, text: txt })}>Save module 01 <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 27 · GET PAID: WALLETS & PRICES
   ===================================================================== */
const START_27 = {
  cards: [
    { e: "👛", t: "Digital wallet", d: "A service to make or manage digital payments from your phone.", ex: "Pay with QR." },
    { e: "📅", t: "Monthly fee", d: "A charge you pay every month just for having the service.", ex: "$4,000 a month." },
    { e: "🏧", t: "Withdrawal fee", d: "What you pay to take money out as cash.", ex: "$3,000 per withdrawal." },
    { e: "🚦", t: "Daily limit", d: "The maximum amount you can move in one day.", ex: "$200,000 per day." },
    { e: "🧾", t: "Variable cost", d: "A cost you pay for EACH product you sell.", ex: "Product, payment fee, shipping." },
    { e: "🏠", t: "Fixed cost", d: "A cost you pay every month, even if you sell nothing.", ex: "Internet, app, rent." },
    { e: "📈", t: "Margin per sale", d: "Price − variable costs. What stays from each sale.", ex: "$50,000 − $33,000 = $17,000." },
    { e: "⚖️", t: "Break-even", d: "The number of sales you need to cover your fixed costs.", ex: "$170,000 ÷ $17,000 = 10 sales." },
  ],
  pairs: [{ a: "Monthly fee", b: "A charge every month" }, { a: "Daily limit", b: "The most you can move in a day" }, { a: "Variable cost", b: "A cost for each product sold" }, { a: "Fixed cost", b: "A cost even with zero sales" }, { a: "Margin per sale", b: "Price − variable costs" }, { a: "Break-even", b: "Sales needed to cover fixed costs" }],
};

/* ---------- WALLET SHOWDOWN · una semana + Wallet Detective ---------- */
const W27 = (id) => WALLETS.find((w) => w.id === id);
const CONT27 = [{ id: "m", n: "Mom", k: "300 555 1020" }, { id: "m2", n: "Mom Rosa (unknown)", k: "300 555 1002" }];
const PROF27 = [
  { id: "camilo", e: "📤", n: "Camilo", d: "Sends money to his family a lot.", use: [["Transfers", 10], ["Cash withdrawals", 0], ["Biggest payment", "$80,000"]], tr: 10, wd: 0, big: 80000 },
  { id: "marta", e: "💵", n: "Doña Marta", d: "Pays the market in cash.", use: [["Transfers", 0], ["Cash withdrawals", 6], ["Biggest payment", "$60,000"]], tr: 0, wd: 6, big: 60000 },
  { id: "vale", e: "🛒", n: "Valeria", d: "Buys online — one big purchase this month.", use: [["Transfers", 2], ["Cash withdrawals", 2], ["Biggest payment", "$280,000"]], tr: 2, wd: 2, big: 280000 },
];
const profCost = (p, w) => (p.big > w.limit ? null : w.fee + p.tr * w.transfer + p.wd * w.withdraw);
function WalletShowdown({ onSave, onExit }) {
  const [part, setPart] = useState(0);
  const [wid, setWid] = useState(null);
  const [day, setDay] = useState(-1);
  const [fees, setFees] = useState([]);
  const [msg, setMsg] = useState(null);
  const [contact, setContact] = useState(null);
  const [scam, setScam] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const [errs, setErrs] = useState(0);
  const [prof, setProf] = useState(0);
  const [pick, setPick] = useState({});
  const [val, setVal] = useState({});
  const [okP, setOkP] = useState({});
  const [pMsg, setPMsg] = useState(null);
  const [st, finish] = useFinish(onSave);
  const W = wid ? W27(wid) : null;
  const total = fees.reduce((a, f) => a + f.v, 0);
  const addFee = (t, v) => setFees((f) => [...f, { t, v }]);
  const next = (m) => { setMsg(m); };
  const go = () => { setMsg(null); setDay((d) => d + 1); setBlocked(false); };
  const DAYS = ["🚌 Mon · Transport", "🍔 Tue · Lunch", "📤 Wed · Send money", "🛒 Thu · Online", "🏧 Fri · Emergency"];
  /* costo "ideal" de la semana con cada billetera (mejores decisiones) */
  const ideal = (w) => w.fee + w.transfer + Math.min(w.withdraw, w.transfer); /* dividir el pago grande cuesta $0 */
  const P = PROF27[prof];
  const bestP = (p) => WALLETS.map((w) => [w.id, profCost(p, w)]).filter(([, c]) => c != null).sort((a, b) => a[1] - b[1])[0];
  const checkProf = () => {
    const [bid, bc] = bestP(P);
    if (pick[P.id] === bid && num(val[P.id]) === bc) { setOkP({ ...okP, [P.id]: true }); setPMsg("ok"); }
    else { setErrs(errs + 1); setPMsg(pick[P.id] !== bid ? "wallet" : "cost"); }
  };
  const coins = Math.max(20, 36 - errs * 2);
  if (st.done) return <Reward title="Wallet expert! 👛" subtitle="The best wallet depends on the user — and you can prove it with numbers." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Wallet size={22} strokeWidth={2.1} />} title="Wallet Showdown 👛" subtitle="Part 1: survive one week of payments. Part 2: find the cheapest wallet for 3 people. Fictional wallets and values." onExit={onExit}>
      <div className="g83-missions">{[["📅", "My week"], ["🔎", "Wallet Detective"]].map(([e, t], k) => <button key={t} type="button" className={`${part === k ? "on" : ""} ${(k === 0 && day > 4) || (k === 1 && PROF27.every((p) => okP[p.id])) ? "done" : ""}`} onClick={() => setPart(k)}><em>{e}</em>{t}</button>)}</div>
      <WalletTable hi={wid} />
      {part === 0 && (day < 0 ? (
        <>
          <Mission e="📅" title="Choose ONE wallet for your week.">You start with a fictional balance of <b>$400,000</b>. Five missions are coming. You can switch later — but switching has a cost.</Mission>
          <div className="g84-wallets">{WALLETS.map((w) => <button key={w.id} type="button" className={wid === w.id ? "on" : ""} onClick={() => setWid(w.id)}><em>{w.e}</em><b>{w.n}</b><span>Monthly fee {cop(w.fee)}</span></button>)}</div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!wid} onClick={() => { addFee(`${W.n} monthly fee`, W.fee); setDay(0); }}>Start my week <ChevronRight size={18} /></button></div>
        </>
      ) : day <= 4 ? (
        <div className="g83-app">
          <div className="g83-app-main">
            <Steps84 labels={DAYS} at={day} />
            {day === 0 && <Mission e="🚌" title="Pay for transport: $3,000 with QR.">Scan the bus QR code in your wallet.</Mission>}
            {day === 1 && <Mission e="🍔" title="Buy lunch: $12,000 with QR.">The school café accepts all three wallets.</Mission>}
            {day === 2 && <Mission e="📤" title="Send $20,000 to your mom.">Her key: <b>300 555 1020</b>. Check the recipient before you confirm!</Mission>}
            {day === 3 && <Mission e="🛒" title="Buy art materials online: $260,000.">Check your wallet's daily limit.</Mission>}
            {day === 4 && <Mission e="🏧" title="Wallet Emergency! You need $50,000 for the school trip today.">The organizer accepts cash OR a transfer to the school's official account.</Mission>}
            {msg && <div className={`p1-banner ${msg.ok ? "good" : "bad"}`}><span>{msg.t}</span></div>}
            <div className="g84-fees"><b>🧾 My fees this week: {cop(total)}</b>{fees.map((f, k) => <span key={k}>{f.t}: {cop(f.v)}</span>)}</div>
            {msg?.ok && <div className="start-foot"><button className="s1-btn primary big" onClick={go}>{day < 4 ? "Next day" : "See my week"} <ChevronRight size={18} /></button></div>}
          </div>
          <Phone84 title={W.n} logo={W.e} sub={`Fee list: transfer ${cop(W.transfer)} · cash ${cop(W.withdraw)}`} ok={msg?.ok}>
            {(day === 0 || day === 1) && !msg?.ok && <>
              <div className="g83-ph-card big"><small>Scan QR</small><b>{day === 0 ? "$3,000" : "$12,000"}</b><span>{day === 0 ? "🚌 City bus" : "🍔 School café"}</span></div>
              <button type="button" className="s1-btn primary" onClick={() => { addFee(day === 0 ? "QR bus" : "QR lunch", 0); next({ ok: true, t: "✅ Paid with QR — $0 fee in all three wallets." }); }}>Pay with QR</button>
            </>}
            {day === 2 && !msg?.ok && (scam === null ? <>
              <div className="g83-ph-alert">💬 “Hi! I'm {W.n} support 👋 To complete your transfer, send me the verification code we just sent you.”</div>
              <button type="button" className="s1-btn primary" onClick={() => setScam("block")}>🚫 Block & report</button>
              <button type="button" className="s1-btn ghost" onClick={() => { setScam("send"); setErrs(errs + 1); }}>Send the code</button>
            </> : scam === "send" ? <>
              <div className="g83-ph-alert">🚨 Never! Real support NEVER asks for your code. With it, a criminal can take your money.</div>
              <button type="button" className="s1-btn primary" onClick={() => setScam("block")}>OK — block & report</button>
            </> : <>
              <small className="g83-ph-lab">Send to (key)</small>
              {CONT27.map((c) => <button key={c.id} type="button" className={`g83-ph-row ${contact === c.id ? "on" : ""}`} onClick={() => setContact(c.id)}><b>{c.n}</b><span>🔑 {c.k}</span></button>)}
              <div className="g83-ph-card"><small>Amount</small><b>$20,000</b><span>Fee: {cop(W.transfer)}</span></div>
              <button type="button" className="s1-btn primary" disabled={!contact} onClick={() => { if (contact !== "m") { setErrs(errs + 1); setMsg({ ok: false, t: "⚠️ STOP! That key is 300 555 1002 — not your mom's. Check the recipient before you confirm." }); setContact(null); return; } addFee("Transfer", W.transfer); next({ ok: true, t: `✅ Sent to Mom (300 555 1020). Fee: ${cop(W.transfer)}. You blocked the fake “support” message too!` }); }}>Confirm transfer</button>
            </>)}
            {day === 3 && !msg?.ok && (W.limit < 260000 && !blocked ? <>
              <div className="g83-ph-alert">⛔ Payment blocked: $260,000 is over your daily limit ({cop(W.limit)}).</div>
              <button type="button" className="s1-btn primary" onClick={() => setBlocked(true)}>See my options</button>
            </> : W.limit < 260000 ? <>
              <small className="g83-ph-lab">Wallet emergency: choose</small>
              {WALLETS.filter((w) => w.limit >= 260000).map((w) => <button key={w.id} type="button" className="g83-ph-row" onClick={() => { addFee(`Switch to ${w.n} (monthly fee)`, w.fee); setWid(w.id); next({ ok: true, t: `🔁 You switched to ${w.n} and paid its monthly fee (${cop(w.fee)}). Purchase done! Lesson: check limits BEFORE a big purchase.` }); }}><b>🔁 Switch to {w.e} {w.n}</b><span>Monthly fee {cop(w.fee)} · limit {cop(w.limit)}</span></button>)}
              <button type="button" className="g83-ph-row" onClick={() => { addFee("Split payment (2 days)", 0); next({ ok: true, t: "🗓️ You paid $200,000 today and $60,000 tomorrow (the store agreed). $0 extra — but the delivery is one day later." }); }}><b>🗓️ Split it over two days</b><span>$0 extra · delivery 1 day later</span></button>
            </> : <>
              <div className="g83-ph-card big"><small>art-store.co · secure checkout</small><b>$260,000</b><span>Limit OK: {cop(W.limit)}</span></div>
              <button type="button" className="s1-btn primary" onClick={() => { addFee("Online purchase", 0); next({ ok: true, t: `✅ Paid! Your daily limit (${cop(W.limit)}) was enough.` }); }}>Pay $260,000</button>
            </>)}
            {day === 4 && !msg?.ok && <>
              <button type="button" className="g83-ph-row" onClick={() => { addFee("Cash withdrawal", W.withdraw); next({ ok: true, t: `🏧 Cash withdrawal: ${cop(W.withdraw)} fee.${W.transfer < W.withdraw ? ` A transfer to the official account would cost only ${cop(W.transfer)}!` : ""}` }); }}><b>🏧 Withdraw $50,000 cash</b><span>Fee: {cop(W.withdraw)}</span></button>
              <button type="button" className="g83-ph-row" onClick={() => { addFee("Transfer to school", W.transfer); next({ ok: true, t: `📤 Transfer to the school's official account: ${cop(W.transfer)} fee.${W.withdraw < W.transfer ? " Here cash was cheaper!" : " Smart — cheaper than cash."}` }); }}><b>📤 Transfer to the official account</b><span>Fee: {cop(W.transfer)}</span></button>
            </>}
          </Phone84>
        </div>
      ) : (
        <>
          <div className="g73-score"><small>MY WEEK IN FEES</small><b className={total <= Math.min(...WALLETS.map(ideal)) + 2000 ? "good" : "bad"}>{cop(total)}</b><span>{fees.length} operations · wallet: {W.e} {W.n}</span></div>
          <MiniTable head={["Wallet", "Best possible week"]} rows={WALLETS.map((w) => [`${w.e} ${w.n}`, cop(ideal(w))])} />
          <p className="start-tip">💡 Same week, different totals: the monthly fee, the limits and YOUR decisions (cash or transfer? switch or split?) decide the total cost — not the advertisement.</p>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => setPart(1)}>Part 2: Wallet Detective <ChevronRight size={18} /></button></div>
        </>
      ))}
      {part === 1 && (
        <>
          <div className="g83-missions">{PROF27.map((p, k) => <button key={p.id} type="button" className={`${prof === k ? "on" : ""} ${okP[p.id] ? "done" : ""}`} onClick={() => { setProf(k); setPMsg(null); }}><em>{okP[p.id] ? "✅" : p.e}</em>{p.n}</button>)}</div>
          <Mission e={P.e} title={`${P.n}: ${P.d}`}>Find the CHEAPEST wallet for one month and calculate its monthly cost: monthly fee + transfers + withdrawals. If the biggest payment is over the daily limit, that wallet doesn't fit.</Mission>
          <MiniTable head={["This month", ""]} rows={P.use.map(([a, b]) => [a, String(b)])} />
          <small className="g83-ph-lab">The best wallet for {P.n}</small>
          <Tri value={pick[P.id]} disabled={okP[P.id]} onPick={(k) => { setPick({ ...pick, [P.id]: k }); setPMsg(null); }} opts={WALLETS.map((w) => [w.id, `${w.e} ${w.n}`])} />
          <small className="g83-ph-lab">Its monthly cost</small>
          <MoneyInput value={val[P.id] || ""} onChange={(v) => { setVal({ ...val, [P.id]: v }); setPMsg(null); }} />
          {pMsg === "wallet" && <div className="p1-hint">💡 Calculate all three. Remember: a wallet with a limit lower than {cop(P.big)} doesn't fit.</div>}
          {pMsg === "cost" && <div className="p1-hint">💡 Right wallet! Check the math: monthly fee + ({P.tr} × transfer fee) + ({P.wd} × withdrawal fee).</div>}
          {pMsg === "ok" && <div className="p1-banner good"><Check size={18} /> <span><b>Correct!</b> {WALLETS.map((w) => `${w.n}: ${profCost(P, w) == null ? "doesn't fit (limit)" : cop(profCost(P, w))}`).join(" · ")}</span></div>}
          <div className="start-foot">
            {!okP[P.id] && <button className="s1-btn primary" disabled={!pick[P.id] || val[P.id] === undefined || val[P.id] === ""} onClick={checkProf}>Check <Check size={16} /></button>}
            {okP[P.id] && prof < 2 && <button className="s1-btn primary" onClick={() => { setProf(prof + 1); setPMsg(null); }}>Next person <ChevronRight size={16} /></button>}
            <button className="s1-btn primary big" disabled={day <= 4 || !PROF27.every((p) => okP[p.id])} onClick={() => finish(coins, { wallet: wid, weekFees: total, errors: errs })}>{day <= 4 ? "Finish your week first" : PROF27.every((p) => okP[p.id]) ? "Finish the showdown" : "Solve the 3 people"} <span className="coin-tag"><Coins size={15} /> +{coins}</span></button>
          </div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- CHECKOUT LAB · costos, precio, punto de equilibrio y mi tienda ---------- */
const COSTS28 = [
  { id: "prod", t: "Product cost", v: 25000, ok: true, why: "You pay it for every bottle." },
  { id: "fee", t: "Payment fee", v: 2000, ok: true, why: "The gateway charges it on every sale." },
  { id: "ship", t: "Packaging & shipping", v: 5000, ok: true, why: "The store pays it for every order." },
  { id: "res", t: "Returns reserve", v: 1000, ok: true, why: "Money saved for possible returns." },
  { id: "rent", t: "Monthly app & internet", v: 170000, ok: false, why: "That's a FIXED cost: you pay it every month, not for each sale." },
  { id: "likes", t: "Instagram likes", v: 0, ok: false, why: "Likes are not a cost of the sale." },
];
const units28 = (p) => Math.max(0, Math.round(44 - p / 2000));
const margin28 = (p) => p - 25000 - Math.round(p * 0.04) - 5000 - Math.round(p * 0.02);
const profit28 = (p) => units28(p) * margin28(p) - 170000;
const PRICES28 = Array.from({ length: 13 }, (_, k) => 30000 + k * 5000);
const BEST28 = PRICES28.reduce((b, p) => (profit28(p) > profit28(b) ? p : b), PRICES28[0]);
const goodPrice28 = (p) => profit28(p) >= profit28(BEST28) * 0.95;
function CheckoutLab({ resp, onSave, onExit }) {
  const idea = ideaOf(resp) || STARTUPS[1];
  const [stage, setStage] = useState(0);
  const [order] = useState(() => shuffleArr(COSTS28.map((c) => c.id)));
  const [sel, setSel] = useState([]);
  const [warn, setWarn] = useState(null);
  const [m1, setM1] = useState(""); const [m1s, setM1s] = useState(null);
  const [price, setPrice] = useState(40000);
  const [locked, setLocked] = useState(null);
  const [be1, setBe1] = useState(""); const [be1s, setBe1s] = useState(null);
  const [be2, setBe2] = useState(""); const [be2s, setBe2s] = useState(null);
  const [prices, setPrices] = useState(() => idea.products.map((p) => p.cost));
  const [goal, setGoal] = useState("");
  const [errs, setErrs] = useState(0);
  const [st, finish] = useFinish(onSave);
  const left = 50000 - sel.reduce((a, id) => a + COSTS28.find((c) => c.id === id).v, 0);
  const allVar = COSTS28.filter((c) => c.ok).every((c) => sel.includes(c.id));
  const tap = (c) => { if (sel.includes(c.id)) { setSel(sel.filter((x) => x !== c.id)); return; } if (!c.ok) { setErrs(errs + 1); setWarn(c.why); return; } setWarn(null); setSel([...sel, c.id]); };
  const lockedM = locked ? margin28(locked) : 0;
  const mine = idea.products.map((p, k) => ({ n: p.n, cost: p.cost, price: prices[k], ...unitCosts(prices[k], p.cost, idea.ship) }));
  const bestMine = [...mine].sort((a, b) => b.margin - a.margin)[0];
  const beMine = bestMine.margin > 0 ? Math.ceil(idea.fixed / bestMine.margin) : null;
  const myOk = mine.every((p) => p.margin > 0) && beMine && num(goal) >= beMine && num(goal) <= 500;
  const coins = Math.max(20, 36 - errs * 2);
  if (st.done) return <Reward title="Checkout Lab complete! 🧮" subtitle="You know what really stays from each sale." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Calculator size={22} strokeWidth={2.1} />} title="Checkout Lab 🧮" subtitle="Sell a product, subtract every cost, test prices and find your break-even. Fictional numbers." onExit={onExit}>
      <Steps84 labels={["Cost Slicer", "Price Roller", "Break-even", "My 3 products"]} at={stage} />
      <div className="g84-formula">Margin per sale = selling price − variable costs</div>
      {stage === 0 && (
        <>
          <Mission e="🧴" title="A reusable bottle sells for $50,000. What REALLY stays?">Tap every cost you pay <b>for each sale</b>. Careful: one card is a monthly cost and one is not a cost at all.</Mission>
          <div className="g84-slicer">
            <div className="g84-price"><small>SELLING PRICE</small><b>$50,000</b>{sel.map((id) => { const c = COSTS28.find((x) => x.id === id); return <span key={id}>− {c.t} <i>{cop(c.v)}</i></span>; })}<em>= {allVar ? "?" : cop(left)}</em></div>
            <div className="g84-costcards">{order.map((id) => { const c = COSTS28.find((x) => x.id === id); return <button key={id} type="button" className={sel.includes(id) ? "on" : ""} onClick={() => tap(c)}><b>{c.t}</b><span>{cop(c.v)}</span></button>; })}</div>
          </div>
          {warn && <div className="p1-hint">💡 {warn}</div>}
          {allVar && (
            <div className="start-block">
              <h3>What is the margin per sale?</h3>
              <div className="p2-answer-row"><MoneyInput value={m1} onChange={(v) => { setM1(v); setM1s(null); }} /><button className="s1-btn primary" disabled={!m1 || m1s === "ok"} onClick={() => { if (num(m1) === 17000) setM1s("ok"); else { setM1s("bad"); setErrs(errs + 1); } }}>Check <Check size={16} /></button></div>
              {m1s === "bad" && <div className="p1-hint">💡 $50,000 − $25,000 − $2,000 − $5,000 − $1,000 = ?</div>}
              {m1s === "ok" && <div className="p1-banner good"><Check size={18} /> <span><b>$17,000.</b> If you forget the fee or the shipping, you think you earn more than you really do!</span></div>}
            </div>
          )}
          {m1s === "ok" && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(1)}>Price Roller <ChevronRight size={18} /></button></div>}
        </>
      )}
      {stage === 1 && (
        <>
          <Mission e="🎚️" title="Find the price with the BIGGEST monthly profit.">Higher price = bigger margin, but fewer customers. Lower price = more customers, but maybe no margin. (Fictional demand — a game assumption.)</Mission>
          <Ctl l="Price" v={price} set={(v) => { setPrice(v); setLocked(null); }} mn={30000} mx={90000} stp={5000} fmt={cop} />
          <div className="g84-tiles light">
            <div><small>🛍️ Sales / month</small><b>{units28(price)}</b></div>
            <div><small>📈 Margin per sale</small><b className={margin28(price) < 0 ? "neg" : ""}>{cop(margin28(price))}</b></div>
            <div><small>🏠 Fixed costs</small><b>{cop(170000)}</b></div>
            <div><small>💰 Monthly profit</small><b className={profit28(price) < 0 ? "neg" : "pos"}>{cop(profit28(price))}</b></div>
          </div>
          {margin28(price) < 0 && <div className="p1-banner bad"><span>⚠️ Each sale LOSES money! More customers only means more losses.</span></div>}
          {!locked && <div className="start-foot"><button className="s1-btn primary" onClick={() => { setLocked(price); if (!goodPrice28(price)) setErrs(errs + 1); }}>🔒 Lock this price</button></div>}
          {locked && (
            <>
              <LineChart series={[{ name: "Monthly profit", values: PRICES28.map(profit28), color: "#0b7a50" }]} labels={PRICES28.map((p) => `${p / 1000}k`)} height={190} yMin={Math.min(...PRICES28.map(profit28))} highlight={PRICES28.indexOf(locked)} />
              <div className={`p1-banner ${goodPrice28(locked) ? "good" : "bad"}`}><span>{goodPrice28(locked) ? `🏆 Great price! ${cop(locked)} → profit ${cop(profit28(locked))}/month (the top of the curve: ${cop(BEST28)}). Neither the cheapest nor the most expensive price wins.` : `Your price makes ${cop(profit28(locked))}. The best was ${cop(BEST28)} (${cop(profit28(BEST28))}). The cheapest price is not always the best — and neither is the most expensive.`}</span></div>
              <div className="start-foot"><button className="s1-btn ghost" onClick={() => setLocked(null)}>Try again</button><button className="s1-btn primary big" onClick={() => setStage(2)}>Break-even <ChevronRight size={18} /></button></div>
            </>
          )}
        </>
      )}
      {stage === 2 && (
        <>
          <div className="g84-formula">Break-even units = fixed costs ÷ margin per sale</div>
          <Mission e="⚖️" title="Fixed costs: $170,000 a month (app, internet, ads).">How many bottles must you sell to cover them?</Mission>
          <div className="start-block"><h3>With a margin of $17,000</h3>
            <div className="p2-answer-row"><input className="start-input p2-num" type="number" value={be1} onChange={(e) => { setBe1(e.target.value); setBe1s(null); }} placeholder="Units" /><span className="p2-unit">units</span><button className="s1-btn primary" disabled={!be1 || be1s === "ok"} onClick={() => { if (num(be1) === 10) setBe1s("ok"); else { setBe1s("bad"); setErrs(errs + 1); } }}>Check <Check size={16} /></button></div>
            {be1s === "bad" && <div className="p1-hint">💡 170,000 ÷ 17,000</div>}
            {be1s === "ok" && <div className="p1-banner good"><Check size={18} /> <span>10 bottles. Bottle number 11 is the first one with profit!</span></div>}
          </div>
          {be1s === "ok" && (
            <div className="start-block"><h3>With YOUR locked price ({cop(locked)} → margin {cop(lockedM)})</h3>
              {lockedM > 0 ? <>
                <div className="p2-answer-row"><input className="start-input p2-num" type="number" value={be2} onChange={(e) => { setBe2(e.target.value); setBe2s(null); }} placeholder="Units" /><span className="p2-unit">units</span><button className="s1-btn primary" disabled={!be2 || be2s === "ok"} onClick={() => { if (num(be2) === Math.ceil(170000 / lockedM)) setBe2s("ok"); else { setBe2s("bad"); setErrs(errs + 1); } }}>Check <Check size={16} /></button></div>
                {be2s === "bad" && <div className="p1-hint">💡 170,000 ÷ {lockedM.toLocaleString("en-US")} — and round UP: you can't sell half a bottle.</div>}
                {be2s === "ok" && <div className="p1-banner good"><Check size={18} /> <span>{Math.ceil(170000 / lockedM)} units. A bigger margin → fewer sales to break even.</span></div>}
              </> : <div className="p1-banner bad"><span>With that price each sale loses money: you can NEVER break even. Go back and lock a better price.</span></div>}
            </div>
          )}
          <div className="start-foot">{lockedM <= 0 && <button className="s1-btn ghost" onClick={() => { setStage(1); setLocked(null); }}>Back to Price Roller</button>}<button className="s1-btn primary big" disabled={be1s !== "ok" || be2s !== "ok"} onClick={() => setStage(3)}>My 3 products <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 3 && (
        <>
          <Mission e={idea.e} title={`Price the 3 products of ${resp?.c26_page?.name || idea.n}.`}>Each price must leave a positive margin after the {FEE_PCT}% payment fee, {idea.ship ? `${cop(idea.ship)} shipping` : "no shipping (digital)"} and a {RESERVE_PCT}% returns reserve.</Mission>
          <div className="g84-prods">
            {mine.map((p, k) => (
              <div key={p.n} className={p.margin > 0 ? "ok" : "no"}>
                <header><b>{p.n}</b><span>Cost {cop(p.cost)}</span></header>
                <Ctl l="My price" v={prices[k]} set={(v) => setPrices(prices.map((x, j) => (j === k ? v : x)))} mn={p.cost} mx={p.cost * 4} stp={1000} fmt={cop} />
                <div className="g84-break"><span>Fee {cop(p.fee)}</span><span>Ship {cop(p.ship)}</span><span>Reserve {cop(p.res)}</span><b className={p.margin > 0 ? "pos" : "neg"}>Margin {cop(p.margin)}</b></div>
              </div>
            ))}
          </div>
          <div className="g84-tiles light">
            <div><small>🏆 Best margin</small><b>{bestMine.n}</b><span>{cop(bestMine.margin)} per sale</span></div>
            <div><small>🏠 Fixed costs</small><b>{cop(idea.fixed)}</b><span>per month</span></div>
            <div><small>⚖️ Break-even</small><b>{beMine ? `${beMine} sales` : "—"}</b><span>of your best product</span></div>
          </div>
          <div className="p3-sentence edit"><span>🎯 My sales goal per month (at least break-even):</span><input className="start-input" type="number" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Number of sales" /></div>
          {goal !== "" && beMine && num(goal) < beMine && <div className="p1-hint">💡 Your goal must cover your fixed costs: at least {beMine} sales.</div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!myOk} onClick={() => finish(coins, { products: mine.map(({ n, cost, price: pr, margin }) => ({ n, cost, price: pr, margin })), fixed: idea.fixed, breakEven: beMine, goal: num(goal), bestPrice: locked, errors: errs })}>Save my prices <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- MÓDULO 02 · PAYMENTS & PRICES ---------- */
function PayModule({ resp, existing, onSave, onExit }) {
  const ck = resp?.c27_checkout;
  const S = storeOf(resp);
  const [methods, setMethods] = useState(existing?.methods || []);
  const [wallet, setWallet] = useState(existing?.wallet || null);
  const [txt, setTxt] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const G = [W_REASON, W_CUSTOMER, W_NUMBERS(1)];
  const ready = ck && methods.length >= 2 && methods.length <= 3 && wallet && goalsOk(txt, 25, 80, G);
  const tog = (id) => setMethods(methods.includes(id) ? methods.filter((x) => x !== id) : methods.length < 3 ? [...methods, id] : methods);
  if (st.done) return <Reward title="Module 02 unlocked! 💳" subtitle="Your store can get paid." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<CreditCard size={22} strokeWidth={2.1} />} title="Payments & Prices 💳 · Module 02" subtitle="How will your customers pay — and where will the money arrive?" onExit={onExit}>
      <MBadge n="02" />
      {!ck && <div className="p1-banner bad"><span>First do the <b>Checkout Lab</b>: your prices and margins go into this module.</span></div>}
      {ck && <MiniTable head={["Product", "Price", "Margin"]} rows={ck.products.map((p) => [p.n, cop(p.price), cop(p.margin)])} foot={["Break-even", `${ck.breakEven} sales`, `Goal: ${ck.goal}`]} />}
      <div className="start-block">
        <h3><span className="step-n">1</span> Choose 2–3 payment methods for {S.logo} {S.name}</h3>
        <div className="g84-methods">{PAY_METHODS.map((m) => <button key={m.id} type="button" className={methods.includes(m.id) ? "on" : ""} onClick={() => tog(m.id)}><em>{m.e}</em><b>{m.n}</b><span>💲 {m.fee}</span><small>👥 {m.good}</small></button>)}</div>
        {methods.includes("cod") && <p className="start-tip">⚠️ Cash on delivery helps customers without cards, but some orders may not be paid. Plan for it!</p>}
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> Where will your store receive the money?</h3>
        <WalletTable hi={wallet} />
        <Tri value={wallet} onPick={setWallet} opts={WALLETS.map((w) => [w.id, `${w.e} ${w.n}`])} />
      </div>
      <div className="start-block">
        <h3><span className="step-n">3</span> Explain your choice</h3>
        <Starters items={["My customers can pay with", "I chose these methods because", "My best product costs", "I receive the money in"]} onPick={appendStarter(setTxt)} />
        <WordField value={txt} onChange={setTxt} min={25} max={80} goals={G} placeholder="Write 3–4 sentences in English…" />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(28, { methods, wallet, text: txt })}>Save module 02 <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 28 · CONSUMER COURT ⚖️
   Nota: principios generales simplificados (Ley 1480 de 2011 · Estatuto
   del Consumidor). Valida las reglas vigentes en sic.gov.co antes de usarlo.
   ===================================================================== */
const LEGAL84 = "Simplified for class. In Colombia, the Consumer Statute (Law 1480 of 2011) regulates warranties, the right of withdrawal and payment reversal — with conditions and exceptions. Official information: sic.gov.co";
const START_28 = {
  cards: [
    { e: "🧾", t: "Order confirmation", d: "A message that proves you placed and paid an order.", ex: "Order #4821 · $250,000." },
    { e: "🔧", t: "Warranty (garantía)", d: "Protection when a product has a defect or doesn't work as promised: repair, replace or refund.", ex: "The blender arrives broken." },
    { e: "↩️", t: "Right of withdrawal (retracto)", d: "In certain distance sales (online, phone), you can cancel within 5 business days. It has conditions and exceptions.", ex: "Unused headphones, day 3." },
    { e: "💳", t: "Payment reversal (reversión)", d: "In some online payments with cards or electronic methods, you can ask to reverse the payment — for example in fraud or if the product never arrives.", ex: "A charge you don't recognize." },
    { e: "📣", t: "Misleading advertising", d: "When an ad promises something the product doesn't have.", ex: "“Waterproof” — but it isn't." },
    { e: "📸", t: "Evidence", d: "Information that shows what happened: receipts, messages, photos, tracking.", ex: "A photo of the broken box." },
    { e: "🏛️", t: "SIC", d: "Superintendencia de Industria y Comercio: protects consumers in Colombia.", ex: "sic.gov.co" },
  ],
  pairs: [{ a: "Warranty", b: "A defect: repair, replace or refund" }, { a: "Right of withdrawal", b: "Cancel some online purchases in 5 business days" }, { a: "Payment reversal", b: "Undo an online payment in some cases" }, { a: "Evidence", b: "Proof of what happened" }, { a: "Misleading ad", b: "Promises what the product doesn't have" }, { a: "SIC", b: "Protects consumers in Colombia" }],
};
const RUSH_28 = {
  buckets: [{ id: "deliv", e: "📦", l: "Delivery problem", d: "It didn't arrive", c: "#e07a2f" }, { id: "warr", e: "🔧", l: "Defect → warranty", d: "Broken / doesn't work", c: "#0b7a50" }, { id: "mind", e: "↩️", l: "Change of mind", d: "Retracto rules", c: "#f5b23e" }, { id: "pay", e: "💳", l: "Payment problem", d: "Unknown / double charge", c: "#ff6b57" }],
  items: [
    { e: "📦", t: "“My package says ‘preparing’ for 10 days.”", b: "deliv", why: "It never left the store." }, { e: "🚚", t: "“The courier says delivered, but I have nothing.”", b: "deliv", why: "A delivery problem — check the tracking." },
    { e: "📭", t: "“The store sent my order to the wrong city.”", b: "deliv", why: "Delivery error." }, { e: "🔌", t: "“The charger doesn't work at all.”", b: "warr", why: "A defect → warranty." },
    { e: "💔", t: "“The jar of the blender arrived broken.”", b: "warr", why: "Damaged product." }, { e: "⌚", t: "“The ‘waterproof’ watch stopped in the pool.”", b: "warr", why: "It doesn't do what was promised." },
    { e: "🎧", t: "“I bought headphones online yesterday. I don't want them anymore.”", b: "mind", why: "Change of mind — retracto may apply." }, { e: "👗", t: "“I don't like the color of this dress.”", b: "mind", why: "No defect: it's a change of mind." },
    { e: "📏", t: "“I ordered the right size, but I prefer another style.”", b: "mind", why: "Preference, not a defect." }, { e: "❓", t: "“There's a $89,000 charge I don't recognize.”", b: "pay", why: "Possible fraud: contact your bank." },
    { e: "✌️", t: "“They charged me twice for the same order.”", b: "pay", why: "A payment problem." }, { e: "🧾", t: "“I paid, but the store says my payment never arrived.”", b: "pay", why: "Compare the payment evidence." },
  ],
};
/* ---------- CONSUMER COURT · 6 casos + ronda espejo ---------- */
const PROB28 = [["deliv", "📦 Delivery problem"], ["mind", "↩️ Change of mind"], ["warr", "🔧 Defect / warranty"], ["pay", "💳 Unknown charge"], ["ad", "📣 Misleading ad"]];
const CASES28 = [
  { e: "👟", t: "The missing sneakers", who: "Emma", msg: "I paid $250,000 for running shoes. They promised 5 business days. It's been 10, and the tracking still says “Preparing your order.”",
    ev: [["conf", "🧾 Order confirmation #4821 · paid"], ["track", "🚚 Tracking: “Preparing” for 10 days"], ["insta", "📱 The store's Instagram followers"], ["color", "🎨 Emma's favorite color"]], key: ["conf", "track"], prob: "deliv",
    acts: ["Ask for delivery with a written date — or a refund", "Tell Emma to wait patiently because all online stores are slow during big discount campaigns", "Close the case", "Give her a sticker"], why: "The store promised 5 days. Emma has evidence: confirmation + tracking." },
  { e: "🎧", t: "I changed my mind", who: "Tomás", msg: "I bought headphones online 3 days ago. They are new and still sealed. I just don't want them anymore.",
    ev: [["date", "📅 Purchase date: 3 business days ago · online"], ["seal", "📦 Product: new, unused, sealed"], ["review", "⭐ A review from another customer"], ["ad", "📣 A banner for a different product"]], key: ["date", "seal"], prob: "mind",
    acts: ["Accept the cancellation: within 5 business days, unused", "Refuse, because once you pay online it is impossible to cancel for any reason at all", "Charge a fine", "Ignore him"], why: "Online sale + within 5 business days + unused: the right of withdrawal can apply (the customer may pay the return shipping)." },
  { e: "🍹", t: "The damaged product", who: "Doña Luz", msg: "My new blender arrived today with the jar broken. I opened the box in front of the courier.",
    ev: [["photo", "📸 Photo of the broken jar"], ["deliv", "🚚 Delivery: today, box opened at the door"], ["song", "🎵 Her favorite song"], ["price", "🏷️ The price of a different blender"]], key: ["photo", "deliv"], prob: "warr",
    acts: ["Repair, replace or refund it under the warranty", "Treat it as a change of mind and ask her to pay all the return costs and wait 30 days", "Say it's her fault", "Offer a discount next year"], why: "A defect is NOT a change of mind. The warranty applies." },
  { e: "💳", t: "The unknown charge", who: "Valentina", msg: "My card statement shows $89,000 from “TECHSTORE*ONLN”. I never bought anything there!",
    ev: [["stmt", "🏦 Card statement with the charge"], ["orders", "🧾 List of her real online orders"], ["weather", "🌦️ The weather that day"], ["selfie", "🤳 A selfie"]], key: ["stmt", "orders"], prob: "pay",
    acts: ["Check her orders, then contact her bank quickly to dispute it", "Pay the charge so the bank doesn't get angry and wait to see if it happens again next month", "Post her card online", "Do nothing"], why: "If it isn't hers, it may be fraud: act fast with her bank (payment reversal can apply in some cases)." },
  { e: "⌚", t: "The false advertisement", who: "Sergio", msg: "The ad said “100% waterproof watch.” I swam with it and it stopped working. The manual in the box says “Do not use in water.”",
    ev: [["adshot", "📣 Screenshot of the ad: “100% waterproof”"], ["manual", "📘 Manual: “Do not use in water”"], ["friend", "👥 His friend's opinion"], ["logo", "🖼️ The store's logo"]], key: ["adshot", "manual"], prob: "ad",
    acts: ["The store must answer for its ad: repair, replace or refund", "Sergio should have read the manual, so the store has no responsibility for what the advertisement said", "Sell him a new watch", "Ask him to delete his review"], why: "Stores are responsible for the information they advertise." },
  { e: "👕", t: "Twenty days later", who: "Camila", msg: "I bought a shirt online 20 days ago. Nothing is wrong with it, I just don't like the color. I want my money back.",
    ev: [["date", "📅 Purchase date: 20 days ago · online"], ["reason", "💬 Reason: doesn't like the color (no defect)"], ["size", "📏 The size chart"], ["promo", "🏷️ A new promotion"]], key: ["date", "reason"], prob: "mind",
    acts: ["Explain kindly that the 5-day period has passed", "Give a full refund immediately, because customers can return anything at any time for any reason", "Shout at her", "Block her number"], why: "No defect and the withdrawal period has passed. A store MAY offer an exchange if its policy says so." },
];
const MIRROR28 = {
  msg: "Hi! My order arrived 3 days late, the box was open and one T-shirt is missing. Order #2207.",
  opts: [
    "I'm sorry! Please send a photo of the box and your order number. We'll send the missing T-shirt or refund it within 5 days. Questions: help@mystore.co",
    "Thank you for your message. We are a small company and we receive many orders, so problems like this sometimes happen. Please understand our situation and wait patiently.",
    "Not our fault.",
    "Do you want to buy another T-shirt with 10% off?",
  ],
  correct: 0,
};
function ConsumerCourt({ onSave, onExit }) {
  const [ci, setCi] = useState(0);
  const [stage, setStage] = useState(0);
  const [evPick, setEvPick] = useState([]);
  const [evMsg, setEvMsg] = useState(null);
  const [prob, setProb] = useState(null);
  const [actOrders] = useState(() => CASES28.map((c) => shuffleArr(c.acts.map((_, k) => k))));
  const [evOrders] = useState(() => CASES28.map((c) => shuffleArr(c.ev.map((_, k) => k))));
  const [act, setAct] = useState(null);
  const [errs, setErrs] = useState(0);
  const [done, setDone] = useState([]);
  const [mirror, setMirror] = useState(false);
  const [mPick, setMPick] = useState(null);
  const [mOrder] = useState(() => shuffleArr(MIRROR28.opts.map((_, k) => k)));
  const [note, setNote] = useState("");
  const [st, finish] = useFinish(onSave);
  const C = CASES28[ci];
  const reset = () => { setStage(0); setEvPick([]); setEvMsg(null); setProb(null); setAct(null); };
  const checkEv = () => { if (evPick.length === 2 && C.key.every((k) => evPick.includes(k))) { setEvMsg(null); setStage(1); } else { setErrs(errs + 1); setEvMsg("Choose the TWO pieces of evidence that really show what happened in this case."); } };
  const pickProb = (k) => { setProb(k); if (k === C.prob) setStage(2); else setErrs(errs + 1); };
  const pickAct = (k) => { setAct(k); if (k === 0) { setStage(3); setDone((d) => (d.includes(ci) ? d : [...d, ci])); } else setErrs(errs + 1); };
  const G = [W_REASON];
  const coins = Math.max(20, 38 - errs * 2);
  if (st.done) return <Reward title="Court is closed! ⚖️" subtitle="Six fair verdicts — and a store owner who answers well." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Gavel size={22} strokeWidth={2.1} />} title="Consumer Court ⚖️" subtitle="You are the judge. Open the evidence, name the problem, choose a fair action." onExit={onExit}>
      <div className="g84-legal">⚖️ {LEGAL84}</div>
      <div className="g83-missions">{CASES28.map((c, k) => <button key={c.t} type="button" className={`${!mirror && ci === k ? "on" : ""} ${done.includes(k) ? "done" : ""}`} onClick={() => { setMirror(false); setCi(k); reset(); }}><em>{done.includes(k) ? "✅" : c.e}</em>{k + 1}</button>)}<button type="button" className={`${mirror ? "on" : ""} ${mPick === MIRROR28.correct ? "done" : ""}`} disabled={done.length < 6} onClick={() => setMirror(true)}><em>{done.length < 6 ? "🔒" : "🪞"}</em>Mirror</button></div>
      {!mirror ? (
        <>
          <div className="g84-case">
            <header><em>{C.e}</em><div><small>CASE {ci + 1} / 6</small><b>{C.t}</b></div></header>
            <ChatThread msgs={[{ who: C.who, t: C.msg }]} />
          </div>
          <div className="start-block">
            <h3><span className="step-n">1</span> Open the case file: which 2 pieces of evidence matter?</h3>
            <div className="g84-evid">{evOrders[ci].map((k) => { const [id, t] = C.ev[k]; return <button key={id} type="button" disabled={stage > 0} className={`${evPick.includes(id) ? "on" : ""} ${stage > 0 && C.key.includes(id) ? "ok" : ""}`} onClick={() => { setEvMsg(null); setEvPick(evPick.includes(id) ? evPick.filter((x) => x !== id) : evPick.length < 2 ? [...evPick, id] : evPick); }}>{t}</button>; })}</div>
            {evMsg && <div className="p1-hint">💡 {evMsg}</div>}
            {stage === 0 && <div className="start-foot"><button className="s1-btn primary" disabled={evPick.length !== 2} onClick={checkEv}>Check the evidence <Check size={16} /></button></div>}
          </div>
          {stage >= 1 && (
            <div className="start-block">
              <h3><span className="step-n">2</span> What kind of problem is it?</h3>
              <div className="g74-chips">{PROB28.map(([k, l]) => <button key={k} type="button" disabled={stage > 1} className={`${prob === k ? (k === C.prob ? "on" : "no") : ""}`} onClick={() => pickProb(k)}>{l}</button>)}</div>
              {prob && prob !== C.prob && <div className="p1-hint">💡 Look at the evidence again: did it arrive? Is it broken? Did the customer just change their mind?</div>}
            </div>
          )}
          {stage >= 2 && (
            <div className="start-block">
              <h3><span className="step-n">3</span> Your verdict: the fair action</h3>
              <div className="quiz-options">{actOrders[ci].map((k, pos) => <button key={k} type="button" disabled={stage > 2 || (act !== null && act === k && k !== 0)} className={`quiz-opt ${stage > 2 && k === 0 ? "correct" : ""} ${act === k && k !== 0 ? "wrong" : ""}`} onClick={() => pickAct(k)}><span className="opt-key">{"ABCD"[pos]}</span><span className="opt-text">{C.acts[k]}</span></button>)}</div>
              {stage > 2 && <div className="p1-banner good"><Check size={18} /> <span><b>Fair verdict.</b> {C.why}</span></div>}
            </div>
          )}
          {stage > 2 && <div className="start-foot">{ci < 5 ? <button className="s1-btn primary big" onClick={() => { setCi(ci + 1); reset(); }}>Next case <ChevronRight size={18} /></button> : done.length === 6 && <button className="s1-btn primary big" onClick={() => setMirror(true)}>Mirror round: you are the store 🪞 <ChevronRight size={18} /></button>}</div>}
        </>
      ) : (
        <>
          <Mission e="🪞" title="Now YOU are the store owner.">A customer writes to your store. Choose the best answer — the one that solves the problem AND keeps the customer's trust.</Mission>
          <ChatThread msgs={[{ who: "Customer", t: MIRROR28.msg }]} />
          <div className="quiz-options">{mOrder.map((k, pos) => <button key={k} type="button" disabled={mPick === MIRROR28.correct} className={`quiz-opt ${mPick === MIRROR28.correct && k === MIRROR28.correct ? "correct" : ""} ${mPick === k && k !== MIRROR28.correct ? "wrong" : ""}`} onClick={() => { setMPick(k); if (k !== MIRROR28.correct) setErrs(errs + 1); }}><span className="opt-key">{"ABCD"[pos]}</span><span className="opt-text">{MIRROR28.opts[k]}</span></button>)}</div>
          {mPick !== null && mPick !== MIRROR28.correct && <div className="p1-hint">💡 A good answer apologizes, asks for evidence, offers a clear solution with a date, and gives a contact channel.</div>}
          {mPick === MIRROR28.correct && (
            <div className="start-block">
              <h3>⚖️ Judge's note: which case was the hardest — and why?</h3>
              <Starters items={["The hardest case was", "because", "The key evidence was"]} onPick={appendStarter(setNote)} />
              <WordField value={note} onChange={setNote} min={15} max={50} goals={G} placeholder="Write 1–2 sentences in English…" />
            </div>
          )}
          <div className="start-foot"><button className="s1-btn primary big" disabled={mPick !== MIRROR28.correct || !goalsOk(note, 15, 50, G)} onClick={() => finish(coins, { errors: errs, note })}>Close the court <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- MÓDULO 03 · MY STORE POLICIES (Customer Safety Center 1) ---------- */
const POL28 = [
  { id: "delivery", e: "🚚", t: "Delivery", opts: [
    { t: "Delivery in 3–5 business days. We only sell products we have in stock.", ok: true },
    { t: "Delivery in 1 hour, guaranteed, anywhere in Colombia.", ok: false, why: "A promise you can't keep = angry customers (remember FastFeet)." },
    { t: "Delivery when we can.", ok: false, why: "Too vague: customers need a realistic estimate." },
  ] },
  { id: "returns", e: "↩️", t: "Changing your mind", opts: [
    { t: "For online purchases, you can cancel within 5 business days if the product is unused (some exceptions apply). Return shipping may be paid by the customer.", ok: true },
    { t: "No returns. All sales are final.", ok: false, why: "The right of withdrawal can apply to distance sales — a store can't simply erase it." },
    { t: "Return anything, any time, for any reason.", ok: false, why: "Very generous — but can your business pay for it? Don't promise what you can't keep." },
  ] },
  { id: "warranty", e: "🔧", t: "Warranty", opts: [
    { t: "If a product has a defect, we will repair it, replace it or refund it.", ok: true },
    { t: "Our products have no warranty.", ok: false, why: "Products must have a legal warranty for quality and safety." },
    { t: "Warranty only if you buy our extra insurance.", ok: false, why: "The legal warranty is free — it can't depend on buying extras." },
  ] },
  { id: "refund", e: "💸", t: "Refunds", opts: [
    { t: "When a refund applies, we return the money within 30 calendar days, using the same payment method.", ok: true },
    { t: "We refund only with store coupons.", ok: false, why: "When a refund applies, the customer gets the money back." },
    { t: "Refunds when the owner has time.", ok: false, why: "No date = no trust." },
  ] },
];
const CONTACT28 = ["📧 Email", "💬 WhatsApp Business", "📝 Complaint form (PQR)", "📞 Phone line"];
function PolicyModule({ resp, existing, onSave, onExit }) {
  const S = storeOf(resp);
  const [pick, setPick] = useState(existing?.picks || {});
  const [orders] = useState(() => POL28.map((p) => shuffleArr(p.opts.map((_, k) => k))));
  const [contacts, setContacts] = useState(existing?.contacts || []);
  const [promise, setPromise] = useState(existing?.promise || "");
  const [errs, setErrs] = useState(0);
  const [st, finish] = useFinish(onSave);
  const allOk = POL28.every((p) => pick[p.id] !== undefined && p.opts[pick[p.id]].ok);
  const G = [W_CUSTOMER];
  const ready = allOk && contacts.length >= 1 && goalsOk(promise, 15, 50, G);
  if (st.done) return <Reward title="Module 03 unlocked! ⚖️" subtitle="Clear, fair policies — for your customers and your business." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Scale size={22} strokeWidth={2.1} />} title="My Store Policies ⚖️ · Module 03" subtitle="Build the first part of your Customer Safety Center. Clear, honest and fair." onExit={onExit}>
      <MBadge n="03" />
      <div className="g84-legal">⚖️ {LEGAL84}</div>
      {POL28.map((p, i) => { const sel = pick[p.id]; const o = sel !== undefined ? p.opts[sel] : null; return (
        <div key={p.id} className="start-block">
          <h3><span className="step-n">{i + 1}</span> {p.e} {p.t}</h3>
          <div className="g84-cards">{orders[i].map((k) => <button key={k} type="button" className={`${sel === k ? (p.opts[k].ok ? "ok" : "no") : ""}`} onClick={() => { setPick({ ...pick, [p.id]: k }); if (!p.opts[k].ok) setErrs(errs + 1); }}>{p.opts[k].t}</button>)}</div>
          {o && !o.ok && <div className="p1-hint">💡 {o.why}</div>}
        </div>
      ); })}
      <div className="start-block">
        <h3><span className="step-n">5</span> 📣 Contact channels (choose 1+)</h3>
        <div className="g74-chips">{CONTACT28.map((c) => <button key={c} type="button" className={contacts.includes(c) ? "on" : ""} onClick={() => setContacts(contacts.includes(c) ? contacts.filter((x) => x !== c) : [...contacts, c])}>{c}</button>)}</div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">6</span> 🤝 My promise to customers</h3>
        <Starters items={["At", `At ${S.name},`, "we promise", "If something goes wrong,"]} onPick={appendStarter(setPromise)} />
        <WordField value={promise} onChange={setPromise} min={15} max={50} goals={G} placeholder="Write 1–2 sentences: what can customers expect from your store?" />
      </div>
      {allOk && (
        <div className="g84-policy">
          <header>{S.logo} {S.name} · Customer Safety Center · Policies</header>
          {POL28.map((p) => <p key={p.id}><b>{p.e} {p.t}:</b> {p.opts[pick[p.id]].t}</p>)}
          <p><b>📣 Contact:</b> {contacts.join(" · ") || "…"}</p>
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(Math.max(20, 28 - errs), { picks: pick, policy: Object.fromEntries(POL28.map((p) => [p.id, p.opts[pick[p.id]].t])), contacts, promise })}>Save module 03 <span className="coin-tag"><Coins size={15} /> +{Math.max(20, 28 - errs)}</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 29 · FRAUD ESCAPE ROOM 2.0 🔓
   ===================================================================== */
const START_29 = {
  cards: [
    { e: "📶", t: "SIM swap", d: "A criminal convinces your phone company to move YOUR number to THEIR SIM card.", ex: "Your phone suddenly has no signal." },
    { e: "🎣", t: "Phishing / smishing", d: "Fake emails (phishing) or text messages (smishing) that try to steal passwords, codes or money.", ex: "“Your package is blocked, pay here.”" },
    { e: "🔢", t: "Verification code (OTP)", d: "A one-time code to confirm it's you. NEVER share it.", ex: "“Your code is 482913.”" },
    { e: "🛡️", t: "Authenticator app", d: "An app that creates codes on YOUR device. A SIM swap can't steal them.", ex: "Safer than SMS codes." },
    { e: "📌", t: "SIM PIN / port lock", d: "An extra PIN with your carrier so nobody can move your number without it.", ex: "Ask your carrier." },
    { e: "🏚️", t: "Fake store", d: "A website that copies real stores to take your money or data.", ex: "70% off + strange domain." },
    { e: "🔺", t: "Ponzi / pyramid", d: "A “business” that pays old investors with money from new ones. It always collapses.", ex: "“15% monthly guaranteed!”" },
  ],
  pairs: [{ a: "SIM swap", b: "Your number moved to a criminal's SIM" }, { a: "Smishing", b: "A fake text message" }, { a: "Verification code", b: "A one-time code — never share it" }, { a: "Authenticator app", b: "Codes on your own device" }, { a: "Fake store", b: "A copy of a store to steal" }, { a: "Ponzi scheme", b: "Pays old investors with new money" }],
};
const RUSH_29 = {
  buckets: [{ id: "safe", e: "✅", l: "Safe", d: "Good practice", c: "#0b7a50" }, { id: "scam", e: "🚩", l: "Scam signal", d: "Stop!", c: "#ff6b57" }],
  items: [
    { e: "🛡️", t: "Using an authenticator app for your bank", b: "safe", why: "Codes stay on your device." }, { e: "📞", t: "Calling the bank's number on the back of your card", b: "safe", why: "Official channel." },
    { e: "⌨️", t: "Typing the store's address yourself to check an order", b: "safe", why: "You avoid fake links." }, { e: "🔍", t: "Checking a payment in your official account before shipping", b: "safe", why: "Screenshots can be fake." },
    { e: "📌", t: "Asking your carrier for a SIM PIN", b: "safe", why: "It blocks SIM swaps." }, { e: "🔑", t: "Different long passwords for each account", b: "safe", why: "One leak doesn't open everything." },
    { e: "💸", t: "“Pay $4,900 to release your package: pkg-free.co”", b: "scam", why: "Urgency + strange link." }, { e: "📈", t: "“Guaranteed 15% monthly — no risk!”", b: "scam", why: "Impossible returns." },
    { e: "👟", t: "Brand sneakers 70% off, payment only to a personal account", b: "scam", why: "Classic fake store." }, { e: "🤳", t: "“Send me the code we just sent you to verify your account.”", b: "scam", why: "Never share codes." },
    { e: "🧑‍🤝‍🧑", t: "“Mom, I changed my number, send me money fast.”", b: "scam", why: "Impersonation: call the person first." }, { e: "🖼️", t: "A buyer sends only a screenshot as “proof of payment”", b: "scam", why: "Check your real account." },
  ],
};
/* ---------- FRAUD ESCAPE ROOM · 5 salas, 3 pistas cada una ---------- */
const SIM_ACTS = [["carrier", "📞 Call your carrier from another phone (official line)"], ["pass", "🔑 Change the passwords of your email and money apps"], ["bank", "🏦 Call your bank's official line to block movements"], ["auth", "🛡️ Turn on an authenticator app + ask for a SIM PIN"], ["reply", "💬 Reply to the SMS asking for your code"], ["wait", "😴 Wait until tomorrow — maybe it's the network"]];
const SIM_ORDER = ["carrier", "pass", "bank", "auth"];
const STORE_FLAGS = [["domain", "🌐 Domain: nikke-oferta-col.shop", true], ["price", "🏷️ Brand sneakers: 70% OFF today only", true], ["pay", "💸 Payment: only transfer to a personal account", true], ["policy", "📄 Policies copied with ANOTHER store's name", true], ["photos", "📸 Clear product photos", false], ["https", "🔒 The page has https", false]];
const ROOMS29 = [
  { id: "sim", e: "📶", t: "SIM Swap", digit: 3, hints: ["Start by recovering your phone number — who controls it?", "After the carrier, protect the accounts that use your number.", "The last step makes it harder next time: codes that don't depend on SMS."] },
  { id: "store", e: "🏚️", t: "The Fake Store", digit: 7, hints: ["Look at the web address letter by letter.", "Is the discount realistic for a famous brand?", "Who receives the money? Whose name is in the policies?"] },
  { id: "ponzi", e: "📈", t: "The Impossible Return", digit: 1, hints: ["Multiply by 1.15 twelve times (or use 1.15¹² ≈ 5.35).", "$1,000,000 × 5.35 ≈ …", "Then ask: does any honest business promise that, guaranteed?"] },
  { id: "pkg", e: "📦", t: "Your Package Is Blocked", digit: 5, hints: ["Look at the sender's address: is it the real company?", "Real companies don't ask you to pay through random links.", "Check the order by typing the official address yourself."] },
  { id: "receipt", e: "🧾", t: "The Fake Receipt", digit: 9, hints: ["Compare the screenshot with your official payments panel.", "Is there any movement for $180,000 today?", "Never ship until the money appears in YOUR account."] },
];
function EscapeRoom({ onSave, onExit }) {
  const [room, setRoom] = useState(0);
  const [solved, setSolved] = useState({});
  const [hints, setHints] = useState({});
  const [errs, setErrs] = useState(0);
  const [simSeq, setSimSeq] = useState([]); const [simMsg, setSimMsg] = useState(null);
  const [simPool] = useState(() => shuffleArr(SIM_ACTS.map((a) => a[0])));
  const [flags, setFlags] = useState([]); const [flagMsg, setFlagMsg] = useState(null);
  const [flagOrder] = useState(() => shuffleArr(STORE_FLAGS.map((f) => f[0])));
  const [pz, setPz] = useState(""); const [pzOk, setPzOk] = useState(false); const [pzMsg, setPzMsg] = useState(null);
  const [pkgPart, setPkgPart] = useState(null);
  const [code, setCode] = useState("");
  const [door, setDoor] = useState(false);
  const [left, setLeft] = useState(600);
  const [st, finish] = useFinish(onSave);
  useEffect(() => { if (door) return undefined; const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000); return () => clearInterval(t); }, [door]);
  const R = ROOMS29[room];
  const used = Object.values(hints).reduce((a, v) => a + v, 0);
  const win = (id) => setSolved((s) => ({ ...s, [id]: true }));
  const wrong = () => setErrs((e) => e + 1);
  const allSolved = ROOMS29.every((r) => solved[r.id]);
  const coins = Math.max(20, 42 - used * 2 - errs - (left === 0 ? 4 : 0));
  const mm = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  if (st.done) return <Reward title="You escaped! 🔓" subtitle={`Code ${ROOMS29.map((r) => r.digit).join("")} · hints used: ${used}`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<KeyRound size={22} strokeWidth={2.1} />} title="Fraud Escape Room 2.0 🔓" subtitle="5 rooms · each one gives you a digit of the exit code. Hints help, but cost points." onExit={onExit}>
      <div className="g84-escape-top"><span className={left < 120 ? "hot" : ""}>⏱️ {mm}</span><span>💡 Hints used: {used}</span><span>🔢 Code: {ROOMS29.map((r) => (solved[r.id] ? r.digit : "•")).join(" ")}</span></div>
      <div className="g83-missions">{ROOMS29.map((r, k) => <button key={r.id} type="button" className={`${room === k && !door ? "on" : ""} ${solved[r.id] ? "done" : ""}`} onClick={() => { setRoom(k); setDoor(false); }}><em>{solved[r.id] ? "✅" : r.e}</em>{r.t}</button>)}<button type="button" className={door ? "on" : ""} disabled={!allSolved} onClick={() => setDoor(true)}><em>{allSolved ? "🚪" : "🔒"}</em>Exit door</button></div>
      {!door ? (
        <div className="g84-room">
          <header><em>{R.e}</em><div><small>ROOM {room + 1} / 5</small><b>{R.t}</b></div>{solved[R.id] && <i>Digit: {R.digit}</i>}</header>
          {R.id === "sim" && (<>
            <ChatThread title="Your phone · 7:42 a.m." msgs={[{ who: "📵 Phone", t: "No service. Emergency calls only." }, { who: "📧 Email", t: "New login to your bank app from an unknown device." }, { who: "📧 Email", t: "Your email password was changed." }]} />
            <HowTo>Your number may have been stolen. Choose the <b>4 right actions</b> in the <b>right order</b>.</HowTo>
            <div className="g84-route small">{[0, 1, 2, 3].map((k) => { const a = SIM_ACTS.find((x) => x[0] === simSeq[k]); return <div key={k} className={`g84-slot ${a ? "full" : ""} ${solved.sim ? "ok" : ""}`}><small>{k + 1}</small>{a ? <b>{a[1]}</b> : <span>?</span>}</div>; })}</div>
            <div className="g84-chips col">{simPool.map((id) => { const a = SIM_ACTS.find((x) => x[0] === id); return <button key={id} type="button" disabled={simSeq.includes(id) || solved.sim || simSeq.length >= 4} onClick={() => { setSimSeq([...simSeq, id]); setSimMsg(null); }}>{a[1]}</button>; })}</div>
            {simMsg && <div className="p1-hint">💡 {simMsg}</div>}
            {!solved.sim && <div className="start-foot"><button className="s1-btn ghost" onClick={() => { setSimSeq([]); setSimMsg(null); }}><RefreshCw size={16} /> Clear</button><button className="s1-btn primary" disabled={simSeq.length < 4} onClick={() => { if (simSeq.join() === SIM_ORDER.join()) win("sim"); else { wrong(); setSimMsg(simSeq.some((x) => x === "reply" || x === "wait") ? "Replying or waiting helps the criminal. Act fast — through official channels." : "Right actions, wrong order. First recover your number…"); setSimSeq([]); } }}>Check <Check size={16} /></button></div>}
            {solved.sim && <div className="p1-banner good"><Check size={18} /> <span>Number recovered, accounts protected. Codes in an authenticator app can't be stolen with a SIM swap.</span></div>}
          </>)}
          {R.id === "store" && (<>
            <div className="g84-fakestore">
              <div className="bar">🔒 https://nikke-oferta-col.shop</div>
              <h4>👟 MEGA SALE · 70% OFF · TODAY ONLY</h4>
              <p>Brand running shoes <s>$450,000</s> <b>$135,000</b></p>
              <small>Payment: transfer to Carlos P. · Bancolombia savings 123-45 · Policies: “© ShoeWorld Mexico. All rights reserved.”</small>
            </div>
            <HowTo>Tap the <b>4 red flags</b>. Careful: two things are NOT proof of anything.</HowTo>
            <div className="g84-evid">{flagOrder.map((id) => { const f = STORE_FLAGS.find((x) => x[0] === id); return <button key={id} type="button" disabled={solved.store} className={`${flags.includes(id) ? "on" : ""} ${solved.store && f[2] ? "ok" : ""}`} onClick={() => { setFlagMsg(null); setFlags(flags.includes(id) ? flags.filter((x) => x !== id) : [...flags, id]); }}>{f[1]}</button>; })}</div>
            {flagMsg && <div className="p1-hint">💡 {flagMsg}</div>}
            {!solved.store && <div className="start-foot"><button className="s1-btn primary" disabled={flags.length !== 4} onClick={() => { const ok = flags.every((id) => STORE_FLAGS.find((x) => x[0] === id)[2]); if (ok) win("store"); else { wrong(); setFlagMsg("Clear photos and https don't prove a store is real — criminals can have both."); } }}>Check <Check size={16} /></button></div>}
            {solved.store && <div className="p1-banner good"><Check size={18} /> <span>Fake store detected! https only means the connection is encrypted — not that the store is honest.</span></div>}
          </>)}
          {R.id === "ponzi" && (<>
            <ChatThread title="CryptoMax 🚀 · group chat" msgs={[{ who: "CryptoMax Admin", t: "💰 Guaranteed 15% EVERY MONTH! No risk! Only 3 places left — invest TODAY!" }, { who: "“Investor” 😎", t: "I joined last month and I already have my money!!!" }]} />
            <Mission e="🧮" title="If it were true: how much would $1,000,000 become after 12 months at 15% monthly (compound)?">Round to the nearest $10,000.</Mission>
            <div className="p2-answer-row"><MoneyInput value={pz} onChange={(v) => { setPz(v); setPzMsg(null); }} /><button className="s1-btn primary" disabled={!pz || pzOk} onClick={() => { if (Math.abs(num(pz) - 5350250) <= 20000) setPzOk(true); else { wrong(); setPzMsg("Use 1.15 × 1.15 × … (12 times) ≈ 5.35."); } }}>Check <Check size={16} /></button></div>
            {pzMsg && <div className="p1-hint">💡 {pzMsg}</div>}
            {pzOk && <PickOne q="≈ $5,350,000 in one year — more than 5 times the money! What is the right conclusion?" options={["Impossible “guaranteed” returns + pressure = probably a Ponzi scheme", "It's a great opportunity because the people in the chat say that they already received their money", "Invest half", "Ask for a discount"]} correct={0} onRight={(w) => { setErrs((e) => e + w); win("ponzi"); }} explain="Early “investors” are often paid with new people's money — until it collapses." />}
          </>)}
          {R.id === "pkg" && (<>
            <div className="g84-email">
              <div><b>From:</b> Servientrega &lt;alertas@servi-entrega-pagos.co&gt;</div>
              <div><b>Subject:</b> ⚠️ YOUR PACKAGE IS BLOCKED</div>
              <p>Your package is retained. Pay a $4,900 release fee in the next 2 hours or it will be returned: <u>servi-entrega-pagos.co/pay</u></p>
            </div>
            <PickOne tag="CLUE 1" q="Which part of the email is the strongest sign that it's fake?" options={["The sender's domain is not the real company's", "The email uses the color orange and capital letters, which real companies never use in any message", "It has a subject", "It's in Spanish"]} correct={0} onRight={(w) => { setErrs((e) => e + w); setPkgPart(1); }} />
            {pkgPart && <PickOne tag="CLUE 2" q="What is the safe action?" options={["Don't click; type the official website yourself to check the tracking", "Pay the $4,900 quickly, because it's a small amount and the package is more important", "Reply and ask if it's real", "Forward it to friends"]} correct={0} onRight={(w) => { setErrs((e) => e + w); win("pkg"); }} explain="Small fees are bait: the real goal is your card data." />}
          </>)}
          {R.id === "receipt" && (<>
            <div className="g84-two">
              <div className="g84-shot"><small>📱 Screenshot sent by “buyer”</small><b>✅ Transferencia exitosa</b><span>$180,000 · To: your store</span><span>Today 10:41 a.m.</span></div>
              <div className="g84-panel"><small>🏦 Your OFFICIAL payments panel · today</small>{[["09:15", "Order #311", 45000], ["10:02", "Order #312", 12000], ["11:30", "Order #313", 30000]].map(([h, o, v]) => <span key={o}>{h} · {o} · <b>{cop(v)}</b></span>)}</div>
            </div>
            <PickOne q="The buyer wants the product shipped NOW. What do you do?" options={["Don't ship: no $180,000 payment appears in the official panel", "Ship it, because the screenshot shows a green check, the amount and the exact time of the transfer", "Ship half", "Ask for another screenshot"]} correct={0} onRight={(w) => { setErrs((e) => e + w); win("receipt"); }} explain="Screenshots are easy to edit. Only your official panel proves a payment." />
          </>)}
          {!solved[R.id] && (
            <div className="g84-hints">
              {R.hints.slice(0, hints[R.id] || 0).map((h, k) => <p key={k}>💡 Hint {k + 1}: {h}</p>)}
              {(hints[R.id] || 0) < 3 && <button type="button" className="s1-btn ghost" onClick={() => setHints({ ...hints, [R.id]: (hints[R.id] || 0) + 1 })}><Lightbulb size={15} /> Use a hint (−2 points)</button>}
            </div>
          )}
          {solved[R.id] && room < 4 && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setRoom(room + 1)}>Next room <ChevronRight size={18} /></button></div>}
          {solved[R.id] && allSolved && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setDoor(true)}>Go to the exit door 🚪 <ChevronRight size={18} /></button></div>}
        </div>
      ) : (
        <div className="g84-room door">
          <header><em>🚪</em><div><small>EXIT DOOR</small><b>Type the 5-digit code (rooms 1 → 5)</b></div></header>
          <input className="start-input g84-code" maxLength={5} inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="• • • • •" />
          {code.length === 5 && code !== ROOMS29.map((r) => r.digit).join("") && <div className="p1-hint">💡 Look at the code bar at the top: room 1 first.</div>}
          <MiniTable head={["Room", "My safe decision"]} rows={[["📶 SIM Swap", "Carrier → passwords → bank → authenticator"], ["🏚️ Fake Store", "Domain, price, personal account, copied policy"], ["📈 15% monthly", "Impossible guaranteed returns = scam"], ["📦 Blocked package", "Don't click — check the official site"], ["🧾 Fake receipt", "Only the official panel proves a payment"]]} />
          <div className="start-foot"><button className="s1-btn primary big" disabled={code !== ROOMS29.map((r) => r.digit).join("")} onClick={() => finish(coins, { hints: used, errors: errs, timeLeft: left })}>🔓 Open the door <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </div>
      )}
    </ActShell>
  );
}

/* ---------- MÓDULO 04 · MY ANTI-FRAUD PLAN ---------- */
const RULES29 = [
  { t: "Ship only when the payment appears in our official panel", ok: true }, { t: "Use an authenticator app on all store accounts", ok: true },
  { t: "Ask our carrier for a SIM PIN on the store's phone", ok: true }, { t: "Use long, different passwords + a password manager", ok: true },
  { t: "Never ask customers for passwords or codes", ok: true }, { t: "Only the owner can see customer data", ok: true },
  { t: "Accept screenshots as proof to ship faster", ok: false, why: "Screenshots can be edited." },
  { t: "Share the store password with the whole team by chat", ok: false, why: "Each person needs their own access." },
  { t: "Use SMS codes only, because they are the safest", ok: false, why: "SMS codes can be stolen with a SIM swap." },
];
const TIPS29 = [
  { t: "We will NEVER ask for your password or verification code", ok: true }, { t: "Buy only on our official website / account", ok: true },
  { t: "Check our payment details on the website before paying", ok: true }, { t: "If something looks strange, write to our official contact", ok: true },
  { t: "We never ask you to pay by transfer to a personal account", ok: true }, { t: "Turn on 2FA in your own bank apps", ok: true },
  { t: "If we send a link with a big discount, pay fast before it ends", ok: false, why: "Urgency is a scam signal — don't teach it!" },
  { t: "Send us a photo of your card to confirm your order", ok: false, why: "Never! Card photos can be used for fraud." },
];
function AntiFraudModule({ resp, existing, onSave, onExit }) {
  const S = storeOf(resp);
  const [rules, setRules] = useState(existing?.rules || []);
  const [tips, setTips] = useState(existing?.tips || []);
  const [ro] = useState(() => shuffleArr(RULES29.map((_, k) => k)));
  const [to] = useState(() => shuffleArr(TIPS29.map((_, k) => k)));
  const [warn, setWarn] = useState(null);
  const [own, setOwn] = useState(existing?.own || "");
  const [errs, setErrs] = useState(0);
  const [st, finish] = useFinish(onSave);
  const G = [W_PROTECT];
  const pickIn = (list, set, max, item) => { if (!item.ok) { setErrs(errs + 1); setWarn(item.why); return; } setWarn(null); set(list.includes(item.t) ? list.filter((x) => x !== item.t) : list.length < max ? [...list, item.t] : list); };
  const ready = rules.length === 5 && tips.length === 5 && goalsOk(own, 12, 45, G);
  if (st.done) return <Reward title="Module 04 unlocked! 🔐" subtitle="Your store and your customers are harder to trick." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<ShieldCheck size={22} strokeWidth={2.1} />} title="My Anti-Fraud Plan 🔐 · Module 04" subtitle="5 rules for your store + 5 tips for your customers." onExit={onExit}>
      <MBadge n="04" />
      <div className="start-block"><h3><span className="step-n">1</span> 🏪 5 rules for {S.name} <i className="g84-count">{rules.length}/5</i></h3>
        <div className="g84-cards">{ro.map((k) => { const it = RULES29[k]; return <button key={k} type="button" className={rules.includes(it.t) ? "ok" : ""} onClick={() => pickIn(rules, setRules, 5, it)}>{it.t}</button>; })}</div>
      </div>
      <div className="start-block"><h3><span className="step-n">2</span> 🙋 5 tips for your customers <i className="g84-count">{tips.length}/5</i></h3>
        <div className="g84-cards">{to.map((k) => { const it = TIPS29[k]; return <button key={k} type="button" className={tips.includes(it.t) ? "ok" : ""} onClick={() => pickIn(tips, setTips, 5, it)}>{it.t}</button>; })}</div>
      </div>
      {warn && <div className="p1-hint">🚩 {warn}</div>}
      <div className="start-block"><h3><span className="step-n">3</span> ✍️ Your own safety tip (in your words)</h3>
        <Starters items={["Never", "Always check", "If you receive", "We protect you by"]} onPick={appendStarter(setOwn)} />
        <WordField value={own} onChange={setOwn} min={12} max={45} goals={G} placeholder="Write one or two sentences for your customers…" />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(Math.max(20, 28 - errs), { rules, tips, own })}>Save module 04 <span className="coin-tag"><Coins size={15} /> +{Math.max(20, 28 - errs)}</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 30 · IDENTITY VAULT 🔏
   ===================================================================== */
const START_30 = {
  cards: [
    { e: "🪪", t: "Personal data", d: "Information that identifies a person or can be linked to them.", ex: "Name, phone, address, email." },
    { e: "⚠️", t: "Sensitive data", d: "Data that can create bigger risks if it's exposed: health, biometrics (fingerprint, face), religion, political opinions…", ex: "A fingerprint." },
    { e: "✂️", t: "Data minimization", d: "Collect only what you need for a clear purpose.", ex: "A bracelet shop doesn't need your school." },
    { e: "📜", t: "Privacy notice", d: "A clear text: what data you collect, why, and how you protect it.", ex: "“We use your address only to deliver.”" },
    { e: "👣", t: "Digital footprint", d: "The information you leave online: posts, photos, comments, check-ins.", ex: "A photo with your school logo." },
    { e: "🔐", t: "2FA", d: "Two-factor authentication: password + a second check.", ex: "Password + authenticator code." },
    { e: "⚖️", t: "Law 1581 of 2012", d: "Colombia's personal data protection law (habeas data): people can know, update and delete their data.", ex: "Your right to ask a store what it has about you." },
  ],
  pairs: [{ a: "Personal data", b: "Information linked to a person" }, { a: "Sensitive data", b: "Bigger risk if exposed" }, { a: "Data minimization", b: "Collect only what you need" }, { a: "Privacy notice", b: "What, why and how — in clear words" }, { a: "Digital footprint", b: "What you leave online" }, { a: "2FA", b: "Password + a second check" }],
};
const RUSH_30 = {
  buckets: [{ id: "pers", e: "🪪", l: "Personal data", d: "Identifies someone", c: "#0b7a50" }, { id: "sens", e: "⚠️", l: "Sensitive data", d: "Higher risk", c: "#ff6b57" }, { id: "none", e: "🌐", l: "Not personal", d: "Not about a person", c: "#f5b23e" }],
  items: [
    { e: "👤", t: "Daniel Pérez (full name)", b: "pers", why: "It identifies him." }, { e: "📱", t: "Phone number 310 555 0199", b: "pers", why: "It's linked to a person." },
    { e: "🏠", t: "Home address", b: "pers", why: "Personal data." }, { e: "📧", t: "Personal email", b: "pers", why: "Personal data." },
    { e: "🩺", t: "A health condition", b: "sens", why: "Health data is sensitive." }, { e: "☝️", t: "A fingerprint to unlock the app", b: "sens", why: "Biometric data is sensitive." },
    { e: "🛐", t: "Religious beliefs", b: "sens", why: "Sensitive data." }, { e: "🗳️", t: "Political opinions", b: "sens", why: "Sensitive data." },
    { e: "🏷️", t: "The price of a blue bracelet", b: "none", why: "It's about a product, not a person." }, { e: "🕘", t: "The store's opening hours", b: "none", why: "Not about a person." },
    { e: "🌦️", t: "The weather in Bogotá today", b: "none", why: "Not personal." }, { e: "📊", t: "Total sales of all stores in a city (no names)", b: "none", why: "Aggregated, without people." },
  ],
};
/* ---------- IDENTITY VAULT · 4 cerraduras ---------- */
const WORDS30 = ["mango", "volcano", "purple", "guitar", "river", "cloud", "tiger", "pizza"];
const WEAK30 = ["Ana2009", "123456", "password", "CREAR"];
const PROFILE30 = [
  { id: "uni", t: "📸 Photo in my uniform with the school logo", ok: ["limit", "remove"], why: "It shows where you are every day." },
  { id: "alone", t: "💬 “Home alone every day after 3 p.m. 😎”", ok: ["remove"], why: "Never post when your home is empty." },
  { id: "phone", t: "📱 My phone number on my public profile", ok: ["remove"], why: "Strangers can call, text… or try a SIM swap." },
  { id: "loc", t: "📍 Live location check-ins at home", ok: ["remove"], why: "Your exact location should not be public." },
  { id: "bday", t: "🎂 My full birth date (day, month, year)", ok: ["limit", "remove"], why: "Often used to verify identity." },
  { id: "hobby", t: "🎸 Photos playing guitar with my band", ok: ["keep", "limit"], why: "Hobbies are usually fine to share." },
  { id: "shop", t: "🛍️ The link to my bracelet shop", ok: ["keep"], why: "Your business needs to be visible!" },
  { id: "city", t: "🏙️ “I live in Bogotá”", ok: ["keep", "limit"], why: "A city is general information." },
];
const FIELDS30 = [
  { id: "name", t: "👤 Full name", ok: ["need"], why: "To prepare the order and the invoice." },
  { id: "addr", t: "🏠 Delivery address", ok: ["need", "maybe"], why: "Needed if you deliver to the home (not for digital products)." },
  { id: "phone", t: "📱 Phone number", ok: ["need", "maybe"], why: "Useful to coordinate the delivery." },
  { id: "id", t: "🪪 ID number", ok: ["maybe"], why: "Maybe: some invoices (factura electrónica) need it." },
  { id: "bday", t: "🎂 Date of birth", ok: ["maybe", "no"], why: "Usually not needed — maybe only to check age for some products." },
  { id: "school", t: "🏫 School name", ok: ["no"], why: "Not needed to sell a bracelet." },
  { id: "pass", t: "🔑 Email password", ok: ["no"], why: "NEVER. No store needs your password." },
  { id: "gps", t: "📍 Real-time location", ok: ["no"], why: "Too sensitive for this purpose." },
];
function IdentityVault({ onSave, onExit }) {
  const [lock, setLock] = useState(0);
  const [open, setOpen] = useState({});
  const [pw, setPw] = useState([]);
  const [store, setStore] = useState(null);
  const [mfa, setMfa] = useState(null); const [attack, setAttack] = useState(null);
  const [prof, setProf] = useState({}); const [profChk, setProfChk] = useState(false);
  const [fld, setFld] = useState({}); const [fldChk, setFldChk] = useState(false);
  const [errs, setErrs] = useState(0);
  const [st, finish] = useFinish(onSave);
  const pwStr = pw.join("");
  const hasNum = /\d/.test(pwStr), hasSym = /[!#?*&%]/.test(pwStr), longOk = pwStr.length >= 16, weak = pw.some((x) => WEAK30.includes(x));
  const words = pw.filter((x) => WORDS30.includes(x)).length;
  const strength = weak ? 15 : Math.min(100, (longOk ? 40 : pwStr.length * 2) + (hasNum ? 20 : 0) + (hasSym ? 20 : 0) + (words >= 3 ? 20 : 0));
  const pwOk = strength >= 100 && store === "manager";
  const profOk = PROFILE30.every((p) => p.ok.includes(prof[p.id]));
  const fldOk = FIELDS30.every((f) => f.ok.includes(fld[f.id]));
  const unlock = (k) => setOpen((o) => ({ ...o, [k]: true }));
  const all = [0, 1, 2, 3].every((k) => open[k]);
  const coins = Math.max(20, 38 - errs * 2);
  const LOCKS = [["🔑", "Password Builder"], ["📲", "Two-Factor Defense"], ["👣", "Clean Your Footprint"], ["🧾", "Data Collector"]];
  if (st.done) return <Reward title="Vault secured! 🔏" subtitle="Strong passwords, 2FA, a clean profile and a minimal checkout." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Fingerprint size={22} strokeWidth={2.1} />} title="Identity Vault 🔏" subtitle="Protect a digital store before it opens. Four locks — four security decisions. All examples are fictional." onExit={onExit}>
      <div className="g84-locks">{LOCKS.map(([e, t], k) => <button key={t} type="button" className={`${lock === k ? "on" : ""} ${open[k] ? "done" : ""}`} onClick={() => setLock(k)}><em>{open[k] ? "🔓" : "🔒"}</em><b>{e} {t}</b></button>)}</div>
      {lock === 0 && (<>
        <Mission e="🔑" title="Build an EXAMPLE passphrase — never type your real password here.">Tap tiles to build it. Goal: 16+ characters, 3+ random words, a number and a symbol. Avoid personal or famous passwords.</Mission>
        <div className="g84-pw"><code>{pwStr || "…"}</code><div className="g84-mini big"><i style={{ width: `${strength}%`, background: strength >= 100 ? "#0b7a50" : strength >= 60 ? "#f5b23e" : "#ff6b57" }} /></div><small>{weak ? "😱 Very weak: personal info or a famous password!" : strength >= 100 ? "💪 Very strong!" : `Strength: ${strength}%`}</small></div>
        <div className="g84-chips">{[...WORDS30, ...WEAK30, "7", "42", "!", "#"].map((t) => <button key={t} type="button" disabled={open[0] || pw.length >= 7} onClick={() => setPw([...pw, t])}>{t}</button>)}<button type="button" disabled={open[0]} onClick={() => setPw([])}>⌫ Clear</button></div>
        <div className="g84-checks"><span className={longOk ? "on" : ""}>{longOk ? "✓" : "○"} 16+ characters</span><span className={words >= 3 ? "on" : ""}>{words >= 3 ? "✓" : "○"} 3+ random words</span><span className={hasNum ? "on" : ""}>{hasNum ? "✓" : "○"} a number</span><span className={hasSym ? "on" : ""}>{hasSym ? "✓" : "○"} a symbol</span><span className={!weak && pw.length ? "on" : ""}>{!weak && pw.length ? "✓" : "○"} nothing personal</span></div>
        <small className="g83-ph-lab">Where will you keep it?</small>
        <Tri value={store} onPick={(k) => { setStore(k); if (k !== "manager") setErrs(errs + 1); }} opts={[["manager", "🔐 A password manager"], ["note", "📝 A sticky note on the screen"], ["same", "🔁 Use it in every account"]]} />
        {store && store !== "manager" && <div className="p1-hint">💡 {store === "note" ? "Anyone near your computer can read it." : "If one account leaks, ALL your accounts are open."}</div>}
        {!open[0] && <div className="start-foot"><button className="s1-btn primary" disabled={!pwOk} onClick={() => { unlock(0); setLock(1); }}>🔓 Open lock 1</button></div>}
      </>)}
      {lock === 1 && (<>
        <Mission e="📲" title="Your store's account has only a password. Add a second factor.">Remember the SIM swap video: which option is the safest?</Mission>
        <div className="g84-cards">{[["app", "🛡️ Authenticator app (codes on my device)"], ["sms", "💬 SMS codes to my phone number"], ["none", "🚫 No 2FA — the password is enough"]].map(([k, l]) => <button key={k} type="button" disabled={mfa === "app"} className={mfa === k ? (k === "app" ? "ok" : "no") : ""} onClick={() => { setMfa(k); if (k !== "app") setErrs(errs + 1); }}>{l}</button>)}</div>
        {mfa === "sms" && <div className="p1-hint">💡 Better than nothing — but a SIM swap can steal SMS codes. Choose the option that doesn't depend on your number.</div>}
        {mfa === "none" && <div className="p1-hint">💡 Passwords leak. A second factor stops a criminal who knows your password.</div>}
        {mfa === "app" && (<>
          <div className="g83-ph-alert">🔔 “Someone is trying to sign in to your store from Lagos, Nigeria. Approve?”</div>
          <div className="g84-cards">{[["deny", "❌ Deny, change my password and check my sessions"], ["approve", "✅ Approve — maybe it's my cousin"]].map(([k, l]) => <button key={k} type="button" disabled={attack === "deny"} className={attack === k ? (k === "deny" ? "ok" : "no") : ""} onClick={() => { setAttack(k); if (k !== "deny") setErrs(errs + 1); }}>{l}</button>)}</div>
          {attack === "approve" && <div className="p1-hint">💡 Never approve a sign-in you didn't start!</div>}
          {attack === "deny" && <div className="p1-banner good"><Check size={18} /> <span>Blocked! The attacker had your password — but not your second factor.</span></div>}
        </>)}
        {!open[1] && <div className="start-foot"><button className="s1-btn primary" disabled={attack !== "deny"} onClick={() => { unlock(1); setLock(2); }}>🔓 Open lock 2</button></div>}
      </>)}
      {lock === 2 && (<>
        <Mission e="👣" title="Clean Daniel's public profile.">For each detail: keep it public, limit it to friends, or remove it.</Mission>
        <div className="g83-msgs">{PROFILE30.map((p) => <div key={p.id} className={`g83-msg ${profChk ? (p.ok.includes(prof[p.id]) ? "ok" : "no") : ""}`}><p>{p.t}</p><Tri value={prof[p.id]} disabled={open[2]} onPick={(k) => { setProf({ ...prof, [p.id]: k }); setProfChk(false); }} opts={[["keep", "🌐 Keep"], ["limit", "👥 Friends only"], ["remove", "🗑️ Remove"]]} />{(profChk || open[2]) && <small>{p.ok.includes(prof[p.id]) ? "✔ " : "💡 "}{p.why}</small>}</div>)}</div>
        {!open[2] && <div className="start-foot"><button className="s1-btn primary" disabled={PROFILE30.some((p) => !prof[p.id])} onClick={() => { setProfChk(true); if (profOk) { unlock(2); } else setErrs(errs + 1); }}>Check the profile <Check size={16} /></button></div>}
        {open[2] && <div className="start-foot"><button className="s1-btn primary" onClick={() => setLock(3)}>Lock 4 <ChevronRight size={16} /></button></div>}
      </>)}
      {lock === 3 && (<>
        <Mission e="🧾" title="What does a bracelet shop REALLY need to deliver an order?">Sort each field. It depends on the purpose — ask “why do I need this?”</Mission>
        <div className="g83-msgs">{FIELDS30.map((f) => <div key={f.id} className={`g83-msg ${fldChk ? (f.ok.includes(fld[f.id]) ? "ok" : "no") : ""}`}><p>{f.t}</p><Tri value={fld[f.id]} disabled={open[3]} onPick={(k) => { setFld({ ...fld, [f.id]: k }); setFldChk(false); }} opts={[["need", "✅ Needed"], ["maybe", "🤔 Maybe"], ["no", "🚫 Unnecessary"]]} />{(fldChk || open[3]) && <small>{f.ok.includes(fld[f.id]) ? "✔ " : "💡 "}{f.why}</small>}</div>)}</div>
        {!open[3] && <div className="start-foot"><button className="s1-btn primary" disabled={FIELDS30.some((f) => !fld[f.id])} onClick={() => { setFldChk(true); if (fldOk) unlock(3); else setErrs(errs + 1); }}>Check the form <Check size={16} /></button></div>}
        {open[3] && <p className="g8-fp-sayline">📓 Maya's rule: “If I cannot explain why I need a piece of information, I should ask whether I need to collect it at all.”</p>}
      </>)}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!all} onClick={() => finish(coins, { errors: errs, mfa, fields: fld })}>{all ? "Close the vault" : `Open the 4 locks (${Object.keys(open).length}/4)`} <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
    </ActShell>
  );
}

/* ---------- MÓDULO 05 · DATA & PRIVACY NOTICE ---------- */
const DFIELDS30 = [
  { id: "name", t: "Full name", ok: true, why: "to prepare your order and invoice" }, { id: "addr", t: "Delivery address", ok: true, why: "to deliver your order" },
  { id: "phone", t: "Phone number", ok: true, why: "to coordinate the delivery" }, { id: "email", t: "Email", ok: true, why: "to send your order confirmation" },
  { id: "school", t: "School name", ok: false, why: "We don't need it to sell." }, { id: "pass", t: "Social media password", ok: false, why: "Never collect passwords!" },
  { id: "gps", t: "Real-time location", ok: false, why: "Too sensitive — and not needed." }, { id: "health", t: "Health information", ok: false, why: "Sensitive data with no purpose here." },
];
const DRULES30 = [
  { t: "Only the owner can access customer data", ok: true }, { t: "Accounts protected with 2FA", ok: true }, { t: "We delete data we don't need anymore", ok: true },
  { t: "We never sell or share data without permission", ok: true }, { t: "We use data only for the purpose we explained", ok: true },
  { t: "We keep customer data in a public spreadsheet", ok: false, why: "Anyone with the link could see it!" }, { t: "We sell our customer list to get extra money", ok: false, why: "That breaks customers' trust (and needs their authorization)." },
];
function DataModule({ resp, existing, onSave, onExit }) {
  const S = storeOf(resp);
  const digital = ["tutor", "pixel"].includes(S.idea?.id);
  const [fields, setFields] = useState(existing?.fields || []);
  const [rules, setRules] = useState(existing?.rules || []);
  const [fo] = useState(() => shuffleArr(DFIELDS30.map((_, k) => k)));
  const [ro] = useState(() => shuffleArr(DRULES30.map((_, k) => k)));
  const [warn, setWarn] = useState(null);
  const [email, setEmail] = useState(existing?.contact || "");
  const [txt, setTxt] = useState(existing?.text || "");
  const [errs, setErrs] = useState(0);
  const [st, finish] = useFinish(onSave);
  const G = [W_PROTECT, W_CUSTOMER];
  const togF = (f) => { if (!f.ok) { setErrs(errs + 1); setWarn(f.why); return; } setWarn(null); setFields(fields.includes(f.id) ? fields.filter((x) => x !== f.id) : [...fields, f.id]); };
  const togR = (r) => { if (!r.ok) { setErrs(errs + 1); setWarn(r.why); return; } setWarn(null); setRules(rules.includes(r.t) ? rules.filter((x) => x !== r.t) : rules.length < 3 ? [...rules, r.t] : rules); };
  const emailOk = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.trim());
  const ready = fields.includes("name") && fields.length >= 2 && rules.length === 3 && emailOk && goalsOk(txt, 15, 50, G);
  const uses = DFIELDS30.filter((f) => fields.includes(f.id));
  if (st.done) return <Reward title="Module 05 unlocked! 🔏" subtitle="A clear privacy notice: trust is part of the product." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Lock size={22} strokeWidth={2.1} />} title="Data & Privacy 🔏 · Module 05" subtitle="Build a simple privacy notice for your store." onExit={onExit}>
      <MBadge n="05" />
      <div className="start-block"><h3><span className="step-n">1</span> Which data will {S.name} collect?</h3>
        {digital && <p className="start-tip">💡 Your startup is digital: do you really need a delivery address?</p>}
        <div className="g74-chips">{fo.map((k) => { const f = DFIELDS30[k]; return <button key={f.id} type="button" className={fields.includes(f.id) ? "on" : ""} onClick={() => togF(f)}>{f.t}</button>; })}</div>
      </div>
      <div className="start-block"><h3><span className="step-n">2</span> 3 rules to protect it <i className="g84-count">{rules.length}/3</i></h3>
        <div className="g84-cards">{ro.map((k) => { const r = DRULES30[k]; return <button key={k} type="button" className={rules.includes(r.t) ? "ok" : ""} onClick={() => togR(r)}>{r.t}</button>; })}</div>
      </div>
      {warn && <div className="p1-hint">🚩 {warn}</div>}
      <div className="start-block"><h3><span className="step-n">3</span> Contact for data questions</h3>
        <input className="start-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="An email for your store (fictional), e.g. name@store.co" />
        <h3 className="g84-mt"><span className="step-n">4</span> Why can customers trust your store with their data?</h3>
        <Starters items={["Customers can trust us because", "We protect", "We never"]} onPick={appendStarter(setTxt)} />
        <WordField value={txt} onChange={setTxt} min={15} max={50} goals={G} placeholder="Write 1–2 sentences in English…" />
      </div>
      <div className="g84-policy">
        <header>{S.logo} {S.name} · Privacy notice</header>
        <p><b>What we collect and why:</b> {uses.length ? uses.map((f) => `${f.t.toLowerCase()} (${f.why})`).join("; ") : "…"}.</p>
        <p><b>How we protect it:</b> {rules.length ? rules.join(" · ") : "…"}.</p>
        <p><b>Your rights:</b> you can ask to know, update or delete your data (Law 1581 of 2012). Write to <b>{email || "…"}</b>.</p>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(Math.max(20, 28 - errs), { fields, rules, contact: email.trim(), text: txt })}>Save module 05 <span className="coin-tag"><Coins size={15} /> +{Math.max(20, 28 - errs)}</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 31 · FROM A PHONE TO THE WORLD 🌍
   ===================================================================== */
const START_31 = {
  cards: [
    { e: "📱", t: "FinTech", d: "Technology that creates or improves financial services.", ex: "A wallet app, a payment link." },
    { e: "🧩", t: "Business model", d: "How a business creates value and earns money.", ex: "Sales, commission, subscription, freemium." },
    { e: "🤝", t: "Investor", d: "Gives money in exchange for a share (part) of your business.", ex: "$1,000,000 for 5%." },
    { e: "🌱", t: "Seed funding (grant)", d: "Early money for new businesses. Approval is NOT guaranteed.", ex: "Capital semilla." },
    { e: "🏦", t: "Loan", d: "Borrowed money you pay back in installments, with interest.", ex: "$2,000,000 · 12 months." },
    { e: "🌊", t: "Cash flow", d: "Money coming in and going out each month.", ex: "Sales − costs − installments." },
    { e: "🎯", t: "SDG 9 & SDG 12", d: "UN goals: 9 = industry, innovation & infrastructure · 12 = responsible consumption & production.", ex: "Digital payments for small shops · less packaging." },
  ],
  pairs: [{ a: "FinTech", b: "Technology for financial services" }, { a: "Investor", b: "Money for a share of the business" }, { a: "Grant", b: "Early money — not guaranteed" }, { a: "Loan", b: "Installments with interest" }, { a: "Cash flow", b: "Money in and out each month" }, { a: "SDG 12", b: "Responsible consumption and production" }],
};
/* ---------- FUNDING ROUND · LocalLink + mi startup + 6 meses ---------- */
const RATE31 = 0.02; // 2% mensual (ficticio)
const VAL31 = 20000000; // valoración ficticia para el inversionista
const EVENTS31 = [
  { id: "low", e: "📉", t: "Very low sales month" },
  { id: "exp", e: "🧯", t: "Unexpected expense: the laptop broke ($400,000)" },
  { id: "priv", e: "🔏", t: "Privacy complaint: you collected data you didn't need ($300,000 to fix it)" },
];
function cashTest(start, monthly, cuota, ev) {
  const hist = [start]; let c = start;
  [1, 0.6, 1, null, 1.1, 1.2].forEach((m) => {
    const flow = m != null ? monthly * m : ev.id === "low" ? monthly * 0.2 : monthly * 0.6 - (ev.id === "exp" ? 400000 : 300000);
    c = Math.round(c + flow - cuota); hist.push(c);
  });
  return { hist, min: Math.min(...hist), final: c };
}
function FundingPanel({ need, own, setOwn, ownMax, loan, setLoan, term, setTerm, inv, setInv, grant, setGrant, granted, onApply, applied }) {
  const gap = Math.max(0, need - own);
  const cuota = loan > 0 ? Math.round(pmt(loan, RATE31, term)) : 0;
  const confirmed = loan + inv + (granted ? grant : 0);
  return (
    <>
      <div className="g84-tiles light">
        <div><small>🚀 Launch cost</small><b>{cop(need)}</b></div>
        <div><small>🐷 My savings in</small><b>{cop(own)}</b></div>
        <div><small>🕳️ Funding gap</small><b className={confirmed >= gap ? "pos" : "neg"}>{cop(Math.max(0, gap - confirmed))}</b><span>{confirmed >= gap ? "covered ✅" : "still missing"}</span></div>
      </div>
      {setOwn && <Ctl l="🐷 Savings I put in" v={own} set={setOwn} mn={0} mx={ownMax} stp={100000} fmt={cop} />}
      <Ctl l="🏦 Loan (2% monthly)" v={loan} set={setLoan} mn={0} mx={Math.max(gap, 0)} stp={250000} fmt={cop} />
      {loan > 0 && <><small className="g83-ph-lab">Loan term</small><Tri value={term} onPick={setTerm} opts={[[12, "12 months"], [24, "24 months"]]} /></>}
      <Ctl l="🤝 Investor money" v={inv} set={setInv} mn={0} mx={Math.max(gap, 0)} stp={250000} fmt={cop} />
      <Ctl l="🌱 Grant I apply for" v={grant} set={setGrant} mn={0} mx={Math.min(2000000, Math.max(gap, 0))} stp={250000} fmt={cop} />
      {grant > 0 && !applied && <button type="button" className="s1-btn ghost" onClick={onApply}>📨 Submit the grant application</button>}
      {applied && <div className={`p1-banner ${granted ? "good" : "bad"}`}><span>{granted ? `🎉 Grant approved: ${cop(grant)}!` : "❌ Grant NOT approved this time. Never count on money you don't have yet — cover the gap another way."}</span></div>}
      <div className="g84-fund">
        <span>🏦 Loan: <b>{cop(loan)}</b>{loan > 0 && ` → ${cop(cuota)}/month for ${term} months`}</span>
        <span>🤝 Investor: <b>{cop(inv)}</b>{inv > 0 && ` → owns ${((inv / VAL31) * 100).toFixed(1)}% of your startup`}</span>
        <span>🌱 Grant: <b>{applied ? (granted ? cop(grant) : "$0 (rejected)") : grant > 0 ? "pending…" : "$0"}</b></span>
      </div>
    </>
  );
}
function FundingRound({ resp, onSave, onExit }) {
  const idea = ideaOf(resp) || STARTUPS[4];
  const P = pastOf(resp);
  const ck = resp?.c27_checkout;
  const S = storeOf(resp);
  const [part, setPart] = useState(0);
  const [ev] = useState(() => EVENTS31[Math.floor(Math.random() * EVENTS31.length)]);
  const [luck] = useState(() => Math.random() < 0.5);
  const [luck2] = useState(() => Math.random() < 0.5);
  /* Parte A · LocalLink */
  const [aLoan, setALoan] = useState(0); const [aTerm, setATerm] = useState(12); const [aInv, setAInv] = useState(0); const [aGrant, setAGrant] = useState(0); const [aApp, setAApp] = useState(false);
  const [aRun, setARun] = useState(null);
  /* Parte B · mi startup */
  const avail = Math.max(500000, (P.fmSavings ?? 2000000) + (P.goal?.saved || 0));
  const [own, setOwn] = useState(Math.round(Math.min(avail * 0.5, idea.launch * 0.3) / 100000) * 100000);
  const [loan, setLoan] = useState(0); const [term, setTerm] = useState(24); const [inv, setInv] = useState(0); const [grant, setGrant] = useState(0); const [app, setApp] = useState(false);
  const [run, setRun] = useState(null);
  const [st, finish] = useFinish(onSave);
  const aGap = 4000000, aConf = aLoan + aInv + (aApp && luck ? aGrant : 0);
  const aCuota = aLoan > 0 ? Math.round(pmt(aLoan, RATE31, aTerm)) : 0;
  const best = ck?.products ? [...ck.products].sort((a, b) => b.margin - a.margin)[0] : null;
  const monthly = ck ? Math.round(ck.goal * (ck.products.reduce((a, p) => a + p.margin, 0) / ck.products.length) - ck.fixed) : Math.round(idea.fixed * 0.8);
  const reserve = Math.round(idea.launch * 0.15);
  const gap = Math.max(0, idea.launch - own), conf = loan + inv + (app && luck2 ? grant : 0);
  const cuota = loan > 0 ? Math.round(pmt(loan, RATE31, term)) : 0;
  const keep = avail - own;
  if (st.done) return <Reward title="Funding round closed! 💰" subtitle="Getting money is step one. Surviving month by month is the real test." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Banknote size={22} strokeWidth={2.1} />} title="Funding Round 💰" subtitle="Part A: help Nicolás fund LocalLink. Part B: fund YOUR startup and survive 6 months. Fictional numbers." onExit={onExit}>
      <div className="g83-missions">{[["📱", "A · LocalLink"], [S.logo, `B · ${S.name}`]].map(([e, t], k) => <button key={t} type="button" disabled={k === 1 && !aRun?.ok} className={`${part === k ? "on" : ""} ${(k === 0 && aRun?.ok) || (k === 1 && run?.ok) ? "done" : ""}`} onClick={() => setPart(k)}><em>{e}</em>{t}</button>)}</div>
      {part === 0 && (<>
        <Mission e="📱" title="LocalLink needs $6,000,000. Nicolás saved $2,000,000.">Cover the $4,000,000 gap with a loan, an investor and/or a grant. Then test 6 months with a reserve of $800,000.</Mission>
        <FundingPanel need={6000000} own={2000000} loan={aLoan} setLoan={(v) => { setALoan(v); setARun(null); }} term={aTerm} setTerm={(v) => { setATerm(v); setARun(null); }} inv={aInv} setInv={(v) => { setAInv(v); setARun(null); }} grant={aGrant} setGrant={(v) => { if (!aApp) setAGrant(v); }} granted={aApp && luck} applied={aApp} onApply={() => setAApp(true)} />
        <div className="start-foot"><button className="s1-btn primary big" disabled={aConf < aGap || (aGrant > 0 && !aApp)} onClick={() => { const r = cashTest(800000, 250000, aCuota, ev); setARun({ ...r, ok: r.min >= 0 }); }}>{aConf < aGap ? "Cover the whole gap first" : "▶️ Run the 6-month test"}</button></div>
        {aRun && (<>
          <LineChart series={[{ name: "Cash", values: aRun.hist, color: aRun.ok ? "#0b7a50" : "#ff6b57" }]} labels={["Start", "M1", "M2", "M3", "M4", "M5", "M6"]} height={190} yMin={Math.min(0, aRun.min)} />
          <div className="g83-event down"><em>{ev.e}</em><div><b>Month 4: {ev.t}</b><p>Every test has a difficult month.</p></div></div>
          <div className={`p1-banner ${aRun.ok ? "good" : "bad"}`}><span>{aRun.ok ? `✅ LocalLink survives! Lowest cash: ${cop(aRun.min)}.` : `❌ Cash went below zero (${cop(aRun.min)}). ${aCuota > 0 ? `The installment of ${cop(aCuota)} is too heavy — try a longer term, less loan or an investor.` : "Try a different mix."}`}</span></div>
          {aRun.ok && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setPart(1)}>Part B: fund my startup <ChevronRight size={18} /></button></div>}
        </>)}
      </>)}
      {part === 1 && (<>
        <Mission e={S.logo} title={`${S.name} needs ${cop(idea.launch)} to launch.`}>Your money from past periods: Future Me savings (P3) {cop(P.fmSavings ?? 2000000)}{P.goal ? ` + Goal Jar (P2) ${cop(P.goal.saved)}` : ""} = <b>{cop(avail)}</b>. Don't put in everything — keep an emergency reserve!</Mission>
        <FundingPanel need={idea.launch} own={own} setOwn={(v) => { setOwn(v); setRun(null); }} ownMax={Math.min(avail, idea.launch)} loan={loan} setLoan={(v) => { setLoan(v); setRun(null); }} term={term} setTerm={(v) => { setTerm(v); setRun(null); }} inv={inv} setInv={(v) => { setInv(v); setRun(null); }} grant={grant} setGrant={(v) => { if (!app) setGrant(v); }} granted={app && luck2} applied={app} onApply={() => setApp(true)} />
        {keep < avail * 0.3 && <div className="p1-hint">⚠️ You are keeping only {cop(keep)} for emergencies. Remember Period 2: an emergency fund protects you.</div>}
        <MiniTable head={["My monthly numbers", ""]} rows={[["Expected profit (sales goal × margin − fixed)", cop(monthly)], ["Starting reserve (15% of launch)", cop(reserve)], ["Loan installment", cop(cuota)]]} />
        {!ck && <p className="start-tip">💡 Do the Checkout Lab to use your own prices and sales goal.</p>}
        <div className="start-foot"><button className="s1-btn primary big" disabled={conf < gap || (grant > 0 && !app)} onClick={() => { const r = cashTest(reserve, monthly, cuota, ev); setRun({ ...r, ok: r.min >= 0 }); }}>{conf < gap ? "Cover the whole gap first" : "▶️ Run my 6-month test"}</button></div>
        {run && (<>
          <LineChart series={[{ name: "Cash", values: run.hist, color: run.ok ? "#0b7a50" : "#ff6b57" }]} labels={["Start", "M1", "M2", "M3", "M4", "M5", "M6"]} height={190} yMin={Math.min(0, run.min)} />
          <div className={`p1-banner ${run.ok ? "good" : "bad"}`}><span>{run.ok ? `✅ ${S.name} survives 6 months! Final cash: ${cop(run.final)}.` : `❌ Your cash goes negative (${cop(run.min)}). Change the mix: a longer term, less loan, more investor or more savings.`}</span></div>
        </>)}
        <div className="start-foot"><button className="s1-btn primary big" disabled={!run?.ok} onClick={() => finish(36, { need: idea.launch, own, keep, loan, term, cuota, inv, equity: +((inv / VAL31) * 100).toFixed(1), grant: app ? grant : 0, granted: app && luck2, survived: true, cash: run.final, min: run.min, event: ev.t, best: best?.n || null })}>Save my funding plan <span className="coin-tag"><Coins size={15} /> +36</span></button></div>
      </>)}
    </ActShell>
  );
}

/* ---------- GLOBAL IMPACT MAP · 5 comunidades ---------- */
const COMM31 = [
  { id: "A", e: "🏪", n: "Community A", p: "Small shops have no simple way to receive digital payments.", data: "6 of 10 shops: cash only", sdg: 9 },
  { id: "B", e: "🎣", n: "Community B", p: "Buyers receive many phishing messages and lose money.", data: "1 in 4 buyers: a fake message this month", sdg: 9 },
  { id: "C", e: "📦", n: "Community C", p: "Sellers use too much packaging for small products.", data: "3 bags + 1 box for one bracelet", sdg: 12 },
  { id: "D", e: "📶", n: "Community D", p: "People have limited internet access.", data: "Internet at home: 3 of 10 families", sdg: 9 },
  { id: "E", e: "💸", n: "Community E", p: "Entrepreneurs can't pay the high fees of some platforms.", data: "Fees up to 15% per sale", sdg: 9 },
];
const SOL31 = {
  A: ["A QR payment kit + training for shop owners", "Give every shop a free tablet and a huge advertising campaign on TV", "A new logo", "Close the shops"],
  B: ["Short safety tips + a way to verify official messages", "Ask buyers to send their passwords so the platform can protect them better", "Stop selling online", "More emails"],
  C: ["Right-size packaging and combined deliveries", "Use bigger boxes so the products look more important and expensive", "Plastic gifts", "Nothing"],
  D: ["Orders by SMS or a light app that works offline", "Build a heavy app with videos that needs very fast internet to work", "Only Instagram", "Print the app"],
  E: ["A low-fee plan for small sellers (e.g. freemium)", "Raise the commission so the platform earns more money from each seller", "Free forever, no plan", "A loan at 15%"],
};
const EVID31 = {
  A: ["% of shops that receive digital payments, before and after", "The number of likes and comments that the platform's posts receive on social media every week", "My opinion", "The color of the QR"],
  B: ["Fewer customers reporting money lost to fake messages", "The number of emails the platform sends every day to all of its users", "A nice slogan", "More followers"],
  C: ["Kilos of packaging per order, before and after", "Writing “we love the planet” in green letters on every box we send", "Bigger boxes", "Sales of plastic"],
  D: ["Number of orders made from basic phones", "How many people have the newest and most expensive smartphone models", "App downloads in Europe", "Nothing"],
  E: ["Fees paid per sale and sellers who stay on the platform", "The total profit of the platform owner at the end of every single year", "Number of logos", "Random comments"],
};
function ImpactMap({ resp, onSave, onExit }) {
  const S = storeOf(resp);
  const [com, setCom] = useState(null);
  const [stage, setStage] = useState(0);
  const [sdg, setSdg] = useState(null);
  const [txt, setTxt] = useState("");
  const [errs, setErrs] = useState(0);
  const [st, finish] = useFinish(onSave);
  const C = COMM31.find((c) => c.id === com);
  const G = [W_REASON, W_CUSTOMER];
  const coins = Math.max(20, 32 - errs * 2);
  if (st.done) return <Reward title="Impact mapped! 🌍" subtitle="Not a slogan: a problem, a goal and evidence." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<MapIcon size={22} strokeWidth={2.1} />} title="Global Impact Map 🌍" subtitle="Choose a community, a solution, an SDG and the evidence that would prove your impact." onExit={onExit}>
      <div className="g84-map">{COMM31.map((c) => <button key={c.id} type="button" disabled={stage > 0} className={com === c.id ? "on" : ""} onClick={() => setCom(c.id)}><em>{c.e}</em><b>{c.n}</b><span>{c.p}</span><small>📊 {c.data}</small></button>)}</div>
      {C && stage === 0 && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(1)}>Help {C.n} <ChevronRight size={18} /></button></div>}
      {C && stage >= 1 && <PickOne tag="STEP 1 · THE SOLUTION" q={`Which solution fits ${C.n}? (${C.p})`} options={SOL31[C.id]} correct={0} onRight={(w) => { setErrs((e) => e + w); setStage(2); }} explain="A useful service must fit the people who use it: accessible, affordable, safe and clear." />}
      {C && stage >= 2 && (
        <div className="start-block">
          <span className="diag-dim">STEP 2 · THE GOAL</span>
          <p className="quiz-q">Which Sustainable Development Goal does it connect with best?</p>
          <div className="g84-cards two">{[[9, "🏗️ SDG 9 · Industry, innovation & infrastructure"], [12, "♻️ SDG 12 · Responsible consumption & production"]].map(([k, l]) => <button key={k} type="button" disabled={stage > 2} className={sdg === k ? (k === C.sdg ? "ok" : "no") : ""} onClick={() => { setSdg(k); if (k === C.sdg) setStage(3); else setErrs(errs + 1); }}>{l}</button>)}</div>
          {sdg && sdg !== C.sdg && <div className="p1-hint">💡 {C.sdg === 12 ? "Packaging and waste = how we consume and produce." : "Access to technology, payments and services for small businesses = innovation & infrastructure (SDG 9)."}</div>}
        </div>
      )}
      {C && stage >= 3 && <PickOne tag="STEP 3 · THE EVIDENCE" q="How would you KNOW your startup helps? Choose evidence you can measure." options={EVID31[C.id]} correct={0} onRight={(w) => { setErrs((e) => e + w); setStage(4); }} explain="Evidence = something you can count before and after." />}
      {C && stage >= 4 && (
        <div className="start-block">
          <h3>✍️ {S.logo} {S.name}'s impact</h3>
          <Starters items={["My startup can help", "by", "because", "We will measure"]} onPick={appendStarter(setTxt)} />
          <WordField value={txt} onChange={setTxt} min={20} max={60} goals={G} placeholder="Who do you help, how, and how will you know it works?" />
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={stage < 4 || !goalsOk(txt, 20, 60, G)} onClick={() => finish(coins, { community: C.id, problem: C.p, solution: SOL31[C.id][0], sdg: C.sdg, evidence: EVID31[C.id][0], text: txt, errors: errs })}>Save my impact <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
    </ActShell>
  );
}

/* ---------- MÓDULO 06 · MODEL, FUNDING & IMPACT ---------- */
const MODELS31 = [
  { id: "sales", e: "🛍️", n: "Direct sales", good: "You earn on every product", bad: "No sales = no income" },
  { id: "comm", e: "🔁", n: "Commission", good: "You earn more when sellers sell more", bad: "It must be fair for small sellers" },
  { id: "subs", e: "📅", n: "Subscription", good: "Predictable monthly income", bad: "People may not pay before seeing results" },
  { id: "free", e: "🎁", n: "Freemium", good: "Easy for new users to try", bad: "Who pays for the free version?" },
];
function ModelModule({ resp, existing, onSave, onExit }) {
  const S = storeOf(resp);
  const fu = resp?.c31_funding, im = resp?.c31_impact;
  const [mt, setMt] = useState({});
  const [ord] = useState(() => ({ g: shuffleArr(MODELS31.map((m) => m.id)), b: shuffleArr(MODELS31.map((m) => m.id)) }));
  const [chk, setChk] = useState(false);
  const [passed, setPassed] = useState(!!existing);
  const [model, setModel] = useState(existing?.model || null);
  const [txt, setTxt] = useState(existing?.text || "");
  const [errs, setErrs] = useState(0);
  const [st, finish] = useFinish(onSave);
  const matchOk = MODELS31.every((m) => mt[`g_${m.id}`] === m.id && mt[`b_${m.id}`] === m.id);
  const G = [W_REASON, W_NUMBERS(1)];
  const ready = passed && model && fu && im && goalsOk(txt, 25, 80, G);
  if (st.done) return <Reward title="Module 06 unlocked! 🌍" subtitle="Your startup has a model, funding and a purpose." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title="Model, Funding & Impact 🌍 · Module 06" subtitle="How do you earn money, how did you fund it, and who does it help?" onExit={onExit}>
      <MBadge n="06" />
      {(!fu || !im) && <div className="p1-banner bad"><span>First finish the <b>Funding Round</b> and the <b>Global Impact Map</b>.</span></div>}
      <div className="start-block">
        <h3><span className="step-n">1</span> Match each model with a benefit AND a problem</h3>
        <div className="g84-models">{MODELS31.map((m) => (
          <div key={m.id} className={chk ? (mt[`g_${m.id}`] === m.id && mt[`b_${m.id}`] === m.id ? "ok" : "no") : ""}>
            <b>{m.e} {m.n}</b>
            <select className="start-input" value={mt[`g_${m.id}`] || ""} onChange={(e) => { setMt({ ...mt, [`g_${m.id}`]: e.target.value }); setChk(false); }}><option value="">👍 Benefit…</option>{ord.g.map((id) => <option key={id} value={id}>{MODELS31.find((x) => x.id === id).good}</option>)}</select>
            <select className="start-input" value={mt[`b_${m.id}`] || ""} onChange={(e) => { setMt({ ...mt, [`b_${m.id}`]: e.target.value }); setChk(false); }}><option value="">⚠️ Problem…</option>{ord.b.map((id) => <option key={id} value={id}>{MODELS31.find((x) => x.id === id).bad}</option>)}</select>
          </div>
        ))}</div>
        {!passed && <div className="start-foot"><button className="s1-btn primary" disabled={Object.keys(mt).length < 8} onClick={() => { setChk(true); if (matchOk) setPassed(true); else setErrs(errs + 1); }}>Check <Check size={16} /></button></div>}
        {passed && <div className="p1-banner good"><Check size={18} /> <span>Every model has a benefit and a problem — choose the one that fits YOUR customers.</span></div>}
      </div>
      {passed && (
        <div className="start-block">
          <h3><span className="step-n">2</span> The model for {S.logo} {S.name}</h3>
          <div className="g84-cards two">{MODELS31.map((m) => <button key={m.id} type="button" className={model === m.id ? "ok" : ""} onClick={() => setModel(m.id)}>{m.e} {m.n}</button>)}</div>
        </div>
      )}
      {fu && im && (
        <div className="g84-sum">
          <div><small>💰 FUNDING</small><b>{cop(fu.own)} savings{fu.loan ? ` + ${cop(fu.loan)} loan` : ""}{fu.inv ? ` + ${cop(fu.inv)} investor (${fu.equity}%)` : ""}{fu.granted ? ` + ${cop(fu.grant)} grant` : ""}</b><span>6-month test: final cash {cop(fu.cash)}</span></div>
          <div><small>🌍 IMPACT</small><b>SDG {im.sdg} · {COMM31.find((c) => c.id === im.community)?.n}</b><span>Evidence: {im.evidence}</span></div>
        </div>
      )}
      {passed && model && (
        <div className="start-block">
          <h3><span className="step-n">3</span> Explain your model and your funding</h3>
          <Starters items={["My business model is", "because my customers", "I funded my startup with", "I chose this because"]} onPick={appendStarter(setTxt)} />
          <WordField value={txt} onChange={setTxt} min={25} max={80} goals={G} placeholder="Write 3–4 sentences in English…" />
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(Math.max(20, 28 - errs * 2), { model, modelName: MODELS31.find((m) => m.id === model)?.n, text: txt })}>Save module 06 <span className="coin-tag"><Coins size={15} /> +{Math.max(20, 28 - errs * 2)}</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 32 · LAUNCH DAY + CIERRE DEL AÑO 🚀🏆
   ===================================================================== */
/* ---------- LAUNCH SIMULATOR · el primer mes en vivo ---------- */
const LAUNCH_EV = [
  { id: "viral", e: "🔥", t: "Your product goes viral!", d: "You receive 3 times more orders than expected in one day.", need: "c28_page",
    opts: [["Check stock, update the delivery estimate and pause orders you can't deliver", 1], ["Accept every single order and promise delivery tomorrow to all the new customers in every city", -1], ["Close the store", 0]],
    good: "Realistic promises protect your reputation (remember FastFeet).", bad: "Angry customers and refunds: you promised what you couldn't deliver." },
  { id: "susp", e: "🕵️", t: "A suspicious payment appears", d: "A buyer sends a screenshot for $380,000 and wants express shipping today.", need: "c29_page",
    opts: [["Check the official panel: no payment → don't ship", 1], ["Ship it fast, because the screenshot has the logo of the bank and looks very real", -1], ["Ask for a second screenshot", 0]],
    good: "Your anti-fraud rule saved the product.", bad: "The screenshot was fake: you lost the product and the shipping." },
  { id: "ret", e: "↩️", t: "A customer requests a return", d: "An online customer wants to cancel 2 business days after buying. The product is unused.", need: "c28_page",
    opts: [["Follow your policy: accept it and refund within the deadline", 1], ["Refuse the return and block the customer's number so they can't write again", -1], ["Offer a coupon only", 0]],
    good: "A clear policy turned a problem into a 5-star review.", bad: "The customer complained publicly — and you have no clear policy." },
  { id: "phish", e: "🎣", t: "You receive a phishing email", d: "“CREAR Pay: confirm your password in 1 hour or your store will be closed.”", need: "c30_page",
    opts: [["Don't click; check the account in the official app and report it", 1], ["Click the link and confirm your password quickly so you don't lose your store and orders", -1], ["Forward it to customers", 0]],
    good: "2FA + a calm check: your store stays safe.", bad: "The criminal entered your account and changed the bank details." },
  { id: "dispute", e: "⚠️", t: "A customer disputes a payment", d: "The bank opens a chargeback: “I never received my order.” You have the tracking.", need: "c27_page",
    opts: [["Send evidence: order confirmation, tracking and delivery proof", 1], ["Ignore the bank's message, because disputes usually disappear if nobody answers", -1], ["Refund twice", 0]],
    good: "Your evidence won the dispute.", bad: "Without an answer, the bank reversed the payment." },
  { id: "sim", e: "📶", t: "Your store's phone loses signal", d: "No service + an email: “New login from an unknown device.”", need: "c29_page",
    opts: [["Call the carrier officially, change passwords, alert the bank", 1], ["Wait until tomorrow, because the network sometimes fails when it rains a lot", -1], ["Post your number online", 0]],
    good: "Fast action stopped a SIM swap.", bad: "The criminal reset your passwords with SMS codes." },
];
function LaunchSim({ resp, onSave, onExit }) {
  const r = resp || {};
  const S = storeOf(r), ck = r.c27_checkout;
  const [evs] = useState(() => shuffleArr(LAUNCH_EV).slice(0, 3));
  const [ords] = useState(() => LAUNCH_EV.map((e) => shuffleArr(e.opts.map((_, k) => k))));
  const [i, setI] = useState(-1);
  const [ans, setAns] = useState({});
  const [st, finish] = useFinish(onSave);
  const mods = MODULES.filter((m) => r[m.key]).length;
  const orders = ck?.goal || 15;
  const avgM = ck ? Math.round(ck.products.reduce((a, p) => a + p.margin, 0) / ck.products.length) : 15000;
  const fixed = ck?.fixed || 170000;
  const res = useMemo(() => {
    let trust = 50 + mods * 5, ord = orders, loss = 0; const log = [];
    evs.forEach((e) => {
      const a = ans[e.id]; if (a === undefined) return;
      const v = e.opts[a][1], prot = !!r[e.need];
      if (v === 1) { trust += prot ? 10 : 6; if (e.id === "viral") ord += Math.round(orders * 0.5); log.push([e, true, prot]); }
      else { trust -= v === -1 ? (prot ? 8 : 15) : 5; loss += e.id === "susp" ? 380000 : e.id === "phish" || e.id === "sim" ? 250000 : 60000; if (e.id === "viral") ord -= Math.round(orders * 0.2); log.push([e, false, prot]); }
    });
    trust = clamp(Math.round(trust), 0, 100);
    const profit = ord * avgM - fixed - loss;
    return { trust, ord, loss, profit, rating: (Math.max(1, Math.min(5, 1 + trust / 25))).toFixed(1), log };
  }, [ans, evs]); // eslint-disable-line react-hooks/exhaustive-deps
  const allDone = evs.every((e) => ans[e.id] !== undefined);
  if (st.done) return <Reward title="Your store is live! 🚀" subtitle={`First month: ${res.ord} orders · ⭐ ${res.rating}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Rocket size={22} strokeWidth={2.1} />} title="Launch Simulator 🚀" subtitle="Your first month is live. Three random challenges — your modules decide how protected you are." onExit={onExit}>
      <StartupDash resp={r} compact />
      {i < 0 ? (
        <>
          <div className="g84-launch">{MODULES.map((m) => <span key={m.n} className={r[m.key] ? "on" : ""}>{r[m.key] ? "✅" : "⚠️"} {m.e} {m.t}</span>)}</div>
          {mods < 6 && <p className="start-tip">⚠️ Missing modules = less protection during the launch. You can still play!</p>}
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => setI(0)}>🚀 Open my store</button></div>
        </>
      ) : i < 3 ? (() => { const e = evs[i]; const a = ans[e.id]; const k0 = LAUNCH_EV.indexOf(e); const prot = !!r[e.need]; return (
        <>
          <Steps84 labels={["Challenge 1", "Challenge 2", "Challenge 3", "Results"]} at={i} />
          <div className={`g83-event ${a === undefined ? "" : e.opts[a][1] === 1 ? "up" : "down"}`}><em>{e.e}</em><div><b>{e.t}</b><p>{e.d}</p><span>{prot ? `🛡️ Your module “${MODULES.find((m) => m.key === e.need).t}” helps here.` : "⚠️ You didn't build the module that protects you here."}</span></div></div>
          <div className="quiz-options">{ords[k0].map((k, pos) => <button key={k} type="button" disabled={a !== undefined} className={`quiz-opt ${a !== undefined && e.opts[k][1] === 1 ? "correct" : ""} ${a === k && e.opts[k][1] !== 1 ? "wrong" : ""}`} onClick={() => setAns({ ...ans, [e.id]: k })}><span className="opt-key">{"ABC"[pos]}</span><span className="opt-text">{e.opts[k][0]}</span></button>)}</div>
          {a !== undefined && <div className={`p1-banner ${e.opts[a][1] === 1 ? "good" : "bad"}`}><span>{e.opts[a][1] === 1 ? e.good : e.bad}</span></div>}
          {a !== undefined && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setI(i + 1)}>{i < 2 ? "Next challenge" : "See my first month"} <ChevronRight size={18} /></button></div>}
        </>
      ); })() : (
        <>
          <div className="g84-tiles">
            <div><small>🛍️ Orders</small><b>{res.ord}</b><span>goal: {orders}</span></div>
            <div><small>💰 Profit this month</small><b className={res.profit >= 0 ? "pos" : "neg"}>{cop(res.profit)}</b><span>margins − fixed − losses</span></div>
            <div><small>⭐ Rating</small><b>{res.rating}</b><span>trust {res.trust}%</span></div>
            <div><small>🚨 Losses</small><b>{cop(res.loss)}</b><span>from mistakes</span></div>
          </div>
          <div className="g84-learned">{res.log.map(([e, ok, prot]) => <div key={e.id}><em>{ok ? "✅" : "❌"}</em><b>{e.t}</b><span>{ok ? e.good : e.bad}{!prot ? " (No module protected you.)" : ""}</span></div>)}</div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!allDone} onClick={() => finish(30, { trust: res.trust, orders: res.ord, cash: res.profit, rating: +res.rating, loss: res.loss, events: res.log.map(([e, ok]) => ({ id: e.id, t: e.t, ok })) })}>Save my launch <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- STARTUP SHOWCASE · tienda + guion de 6 partes + Present + Investor Day ---------- */
function buildPitch(r, studentName, closing) {
  const S = storeOf(r), P = pastOf(r);
  const m1 = r.c26_page, ck = r.c27_checkout, m2 = r.c27_page, m3 = r.c28_page, m4 = r.c29_page, m5 = r.c30_page, fu = r.c31_funding, im = r.c31_impact, m6 = r.c31_page, la = r.c32_launch;
  const best = ck ? [...ck.products].sort((a, b) => b.margin - a.margin)[0] : null;
  const first = (studentName || "Student").split(" ")[0];
  const parts = [
    { k: "idea", e: "💡", t: "My idea", lines: m1 ? [
      `Let me introduce ${S.name}: it ${S.idea?.what || "sells products online"}.`,
      `It helps ${lowFirst(m1.customer)}${S.sector ? `, and it is in the ${S.sector.l.toLowerCase()} sector` : ""}.`,
      dot(m1.text),
      P.dream ? `It connects with my dream job: I want to be ${/^[aeiou]/i.test(P.dream) ? "an" : "a"} ${P.dream.toLowerCase()}.` : "",
    ].filter(Boolean) : [] },
    { k: "nums", e: "📈", t: "My numbers", lines: ck ? [
      `My ${best.n.toLowerCase()} costs ${cop(best.cost)} and I sell it for ${cop(best.price)}.`,
      `After the payment fee, shipping and a returns reserve, my margin is ${cop(best.margin)} per sale.`,
      `My fixed costs are ${cop(ck.fixed)} a month, so I need ${ck.breakEven} sales to break even. My goal is ${ck.goal} sales.`,
    ] : [] },
    { k: "pay", e: "💳", t: "My payment system", lines: m2 ? [
      `Customers can pay using ${listJoin84(m2.methods.map((id) => PAY_METHODS.find((p) => p.id === id)?.s).filter(Boolean))}.`,
      `I receive the money in ${WALLETS.find((w) => w.id === m2.wallet)?.n || "my wallet"}.`,
      dot(m2.text),
    ] : [] },
    { k: "protect", e: "🛡️", t: "My customer protection", lines: [
      m3 ? `I protect customers with clear policies: ${lowFirst(m3.policy.delivery)}` : "",
      m3 ? dot(m3.promise) : "",
      m4 ? `My store rule: ${lowFirst(m4.rules[0])}. My tip for customers: ${lowFirst(m4.tips[0])}.` : "",
      m5 ? `I only collect ${listJoin84(DFIELDS30.filter((f) => m5.fields.includes(f.id)).map((f) => f.t.toLowerCase()))}, and ${lowFirst(m5.rules[0])}.` : "",
    ].filter(Boolean) },
    { k: "fund", e: "💰", t: "My funding", lines: fu ? [
      `To launch, I need ${cop(fu.need)}. I will use ${cop(fu.own)} of my own savings and keep ${cop(fu.keep)} for emergencies.`,
      [fu.loan ? `a loan of ${cop(fu.loan)} (${cop(fu.cuota)} a month for ${fu.term} months)` : "", fu.inv ? `an investor with ${cop(fu.inv)} for ${fu.equity}% of my startup` : "", fu.granted ? `a grant of ${cop(fu.grant)}` : ""].filter(Boolean).length ? `I will also use ${listJoin84([fu.loan ? `a loan of ${cop(fu.loan)} (${cop(fu.cuota)} a month for ${fu.term} months)` : "", fu.inv ? `an investor with ${cop(fu.inv)} for ${fu.equity}% of my startup` : "", fu.granted ? `a grant of ${cop(fu.grant)}` : ""].filter(Boolean))}.` : "",
      `In my 6-month test, my startup survived a difficult month and finished with ${cop(fu.cash)} in cash.`,
      m6 ? `My business model is ${m6.modelName.toLowerCase()}.` : "",
    ].filter(Boolean) : [] },
    { k: "impact", e: "🌍", t: "My impact", lines: im ? [
      `My startup can help ${COMM31.find((c) => c.id === im.community)?.n || "a community"}: ${lowFirst(im.problem)}`,
      `We connect with SDG ${im.sdg}. To prove it, we will measure: ${lowFirst(im.evidence)}.`,
      dot(im.text),
    ] : [] },
  ];
  return {
    S, parts,
    intro: `Hello! I'm ${first}, the founder of ${S.logo} ${S.name}. Let me show you my startup in six parts.`,
    launch: la ? `In our first month we had ${la.orders} orders, a rating of ${la.rating} stars and a profit of ${cop(la.cash)}.` : "",
    closing: dot(closing),
    outro: `Thank you! Would you invest in ${S.name}? 🚀`,
  };
}
function StorePage({ r }) {
  const S = storeOf(r), ck = r.c27_checkout, m2 = r.c27_page, m3 = r.c28_page, m4 = r.c29_page, m5 = r.c30_page;
  return (
    <div className="g84-store">
      <header><em>{S.logo}</em><div><b>{S.name}</b><span>{S.idea ? `It ${S.idea.what}.` : ""}{S.sector ? ` · ${S.sector.e} ${S.sector.l} sector` : ""}</span></div></header>
      <div className="g84-shelf">{(ck?.products || []).map((p) => <div key={p.n}><em>{S.idea?.e || "📦"}</em><b>{p.n}</b><span>{cop(p.price)}</span><button type="button" tabIndex={-1}>Add to cart</button></div>)}</div>
      {m2 && <div className="g84-paybar">Pay with: {m2.methods.map((id) => { const m = PAY_METHODS.find((x) => x.id === id); return <span key={id}>{m.e} {m.n.split(" (")[0]}</span>; })}</div>}
      <div className="g84-csc">
        <b>🛡️ Customer Safety Center</b>
        {m3 ? <><p>🚚 {m3.policy.delivery}</p><p>↩️ {m3.policy.returns}</p><p>🔧 {m3.policy.warranty}</p><p>📣 {m3.contacts.join(" · ")}</p></> : <p>⚠️ Policies missing (Module 03).</p>}
        {m4 ? <p>🔐 {m4.tips.slice(0, 3).join(" · ")}</p> : <p>⚠️ Safety tips missing (Module 04).</p>}
        {m5 ? <p>🔏 We collect only what we need. Questions about your data: {m5.contact}</p> : <p>⚠️ Privacy notice missing (Module 05).</p>}
      </div>
    </div>
  );
}
const RUB32 = [["model", "🧩 Clear business model"], ["money", "💰 Financially viable"], ["protect", "🛡️ Protects customers"], ["impact", "🌍 Real impact"]];
function StartupShowcase({ resp, studentName, existing, onSave, onExit }) {
  const r = resp || {};
  const [closing, setClosing] = useState(existing?.closing || "");
  const [slide, setSlide] = useState(null);
  const [busy, setBusy] = useState(false);
  const [peer, setPeer] = useState(existing?.investor?.peer || "");
  const [stars, setStars] = useState(existing?.investor?.stars || {});
  const [amount, setAmount] = useState(existing?.investor?.amount ?? 500000);
  const [why, setWhy] = useState(existing?.investor?.why || "");
  const [st, finish] = useFinish(onSave);
  const B = buildPitch(r, studentName, closing);
  const mods = MODULES.filter((m) => r[m.key]).length;
  const invOk = peer.trim().length >= 2 && RUB32.every(([k]) => stars[k]) && countWords(why) >= 5 && realText(why);
  const ready = mods >= 4 && countWords(closing) >= 8 && realText(closing) && invOk;
  const png = async () => { setBusy(true); try { const h2c = await loadHtml2Canvas(); const cv = await h2c(document.getElementById("g8-final"), { scale: 2, backgroundColor: "#ffffff", useCORS: true }); const a = document.createElement("a"); a.href = cv.toDataURL("image/png"); a.download = `Startup_${B.S.name.replace(/\s+/g, "_")}.png`; a.click(); } catch (e) { /* sin imagen */ } setBusy(false); };
  const print = () => { document.body.classList.add("g8-printing"); const off = () => { document.body.classList.remove("g8-printing"); window.removeEventListener("afterprint", off); }; window.addEventListener("afterprint", off); setTimeout(() => window.print(), 50); };
  const Part = ({ p, n, big }) => (
    <section className={`g8-fp ${big ? "big" : ""} ${p.lines.length ? "" : "empty"}`}>
      <h4><span>{p.e}</span>{n}. {p.t}</h4>
      {p.lines.length ? <div className="g8-fp-say"><small>🎤 I SAY</small>{p.lines.map((t, k) => <p key={k}>{t}</p>)}</div> : <p className="g8-fp-empty">Finish the module for this part.</p>}
    </section>
  );
  const slides = [
    { k: "intro", node: <div className="g8-slide-cover"><small>CREAR STARTUP STUDIO · GRADE 8</small><h2>{B.S.logo} {B.S.name}</h2><p className="g8-fp-sayline">🎤 {B.intro}</p></div> },
    { k: "store", node: <section className="g8-fp big"><h4><span>🛍️</span>My store</h4><StorePage r={r} /></section> },
    ...B.parts.map((p, k) => ({ k: p.k, node: <Part p={p} n={k + 1} big /> })),
    { k: "end", node: <div className="g8-slide-cover"><h2>{B.closing || "…"}</h2>{B.launch && <p className="g8-fp-sayline">🎤 {B.launch}</p>}<p className="g8-fp-sayline">🎤 {B.outro}</p></div> },
  ];
  if (st.done) return <Reward title="Startup launched! 🏆" subtitle={`${B.S.logo} ${B.S.name} · investment received: ${cop(amount)}`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Award size={22} strokeWidth={2.1} />} title="Startup Showcase 🏆" subtitle="Your store + a 6-part pitch in English. Practice, present — then a classmate decides whether to invest." onExit={onExit}>
      <HowTo>Your store and your script build themselves from your modules. Each part has the sentences you will <b>say</b> (🎤, about 2 minutes). Add your closing line, press <b>Present</b>, and after presenting give your tablet to the classmate who listened for the <b>Investor Day</b>.</HowTo>
      <div className="g8-final g84-final" id="g8-final">
        <header><small>CREAR STARTUP STUDIO · GRADE 8 · INSTITUTO CREAR</small><h2>{B.S.logo} {B.S.name}</h2><p>Founder: <b>{studentName}</b> · {mods}/{MODULES.length} modules</p></header>
        <StorePage r={r} />
        <div className="g8-fp-intro">🎤 {B.intro}</div>
        <div className="g8-fp-list">{B.parts.map((p, k) => <Part key={p.k} p={p} n={k + 1} />)}</div>
        <div className="g8-fp-intro end">🎤 {B.launch} {B.closing} {B.outro}</div>
      </div>
      <div className="p3-sentence edit"><span>💡 My closing line: the most important thing I learned as a founder is</span><input className="start-input" value={closing} onChange={(e) => setClosing(e.target.value)} placeholder="Write your answer here…" /></div>
      {mods < 4 && <div className="p1-banner bad"><span>You need at least 4 of the 6 modules to launch. You have {mods}.</span></div>}
      <div className="p3-card-actions"><button className="s1-btn primary" onClick={() => setSlide(0)}><Mic size={17} /> Present</button><button className="s1-btn ghost" disabled={busy} onClick={png}><Download size={17} /> {busy ? "Creating…" : "Download PNG"}</button><button className="s1-btn ghost" onClick={print}><Printer size={17} /> Print / PDF</button></div>
      <div className="start-block g84-investor">
        <h3>🤝 Investor Day · for the classmate who listened</h3>
        <input className="start-input p3-gap" value={peer} onChange={(e) => setPeer(e.target.value)} placeholder="Investor's name (your classmate)" />
        {RUB32.map(([k, l]) => <div key={k} className="p3-rub"><div><b>{l}</b></div><span /><div className="p3-stars">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={stars[k] >= n ? "on" : ""} onClick={() => setStars({ ...stars, [k]: n })}>★</button>)}</div></div>)}
        <Ctl l="🪙 I invest (fictional)" v={amount} set={setAmount} mn={0} mx={1000000} stp={50000} fmt={cop} />
        <div className="p3-sentence edit"><span>💬 I invest this amount because</span><input className="start-input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Write it here…" /></div>
        <p className="start-tip">⚖️ Invest for the IDEAS — clear model, real numbers, customer protection and impact — not for the prettiest design.</p>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(50, { modules: mods, closing, investor: { peer: peer.trim(), stars, amount, why } })}>Publish my startup <span className="coin-tag"><Coins size={15} /> +50</span></button></div>
      {slide !== null && (
        <div className="g8-present" role="dialog">
          <div className="g8-present-top"><span>{slide + 1} / {slides.length}</span><button type="button" onClick={() => setSlide(null)}><X size={18} /> Close</button></div>
          <div className="g8-present-stage">{slides[slide].node}</div>
          <div className="g8-present-nav"><button type="button" disabled={slide === 0} onClick={() => setSlide(slide - 1)}><ChevronLeft size={20} /> Back</button><button type="button" disabled={slide === slides.length - 1} onClick={() => setSlide(slide + 1)}>Next <ChevronRight size={20} /></button></div>
        </div>
      )}
    </ActShell>
  );
}
const loadHtml2Canvas = () => (window.html2canvas ? Promise.resolve(window.html2canvas) : new Promise((res, rej) => {
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  s.onload = () => res(window.html2canvas); s.onerror = rej;
  document.body.appendChild(s);
}));
const downloadPNG = async (id, file) => { try { const h2c = await loadHtml2Canvas(); const cv = await h2c(document.getElementById(id), { scale: 2, backgroundColor: null, useCORS: true }); const a = document.createElement("a"); a.href = cv.toDataURL("image/png"); a.download = file; a.click(); } catch (e) { /* sin imagen */ } };

/* ---------- MY MONEY RADAR 4.0 · el radar del periodo 1, otra vez ---------- */
const RADAR_DIMS = [
  { k: "mm", l: "Money Management", short: "Money" },
  { k: "ent", l: "Entrepreneurship", short: "Business" },
  { k: "wb", l: "Financial Wellbeing", short: "Wellbeing" },
  { k: "dig", l: "Digital Economy", short: "Digital" },
  { k: "glo", l: "Global Citizenship", short: "Global" },
];
/* Las MISMAS 10 preguntas del radar del Periodo 1 (para comparar) */
const RADAR8_Q = [
  { d: "mm", q: "You receive $200,000 for your birthday. What do you do first?", o: ["I spend it this weekend.", "I keep it in my drawer and decide later.", "I write a plan: needs, a saving goal and a little for fun.", "I give it to a friend to keep it safe."], s: [0, 1, 3, 0] },
  { d: "mm", q: "What is a budget?", o: ["A list of things I want to buy.", "A plan for my income, expenses and savings.", "The money in my bank account.", "A type of credit card."], s: [1, 3, 1, 0] },
  { d: "ent", q: "A shop sells many products every day. Does that mean it makes a profit?", o: ["Yes, always.", "It depends: we must subtract all the costs.", "No, shops never make profit.", "Only if the owner is happy."], s: [0, 3, 0, 0] },
  { d: "ent", q: "A friend sells bracelets but never writes down what she spends on materials. What can happen?", o: ["Nothing — she has cash in her pocket.", "She may think she earns money when she doesn't.", "She will pay more taxes.", "Her bracelets will break."], s: [0, 3, 1, 0] },
  { d: "wb", q: "A pair of sneakers is 40% off but the sale ends tonight. You don't need them. What do you do?", o: ["Buy them — it's a great deal!", "Ask a friend to lend me money.", "Ask: do I need it, can I afford it, is there something more important?", "Buy two pairs."], s: [0, 0, 3, 0] },
  { d: "wb", q: "You buy a $5,000 snack every school day. Is that important for your money?", o: ["No, it's a very small amount.", "Maybe: small expenses can add up to a lot every month.", "Only if I buy two.", "Snacks are free at school."], s: [0, 3, 0, 0] },
  { d: "dig", q: "A budgeting app asks for your contacts, photos and location. What do you do?", o: ["Accept everything — apps need it.", "Check if the app really needs that information before installing.", "Send my password to support.", "Install it on my parents' phone."], s: [0, 3, 0, 0] },
  { d: "dig", q: "Which password is the safest for a money app?", o: ["123456", "My birthday", "A long, unique password + a verification code (2FA)", "The same password I use everywhere"], s: [0, 0, 3, 0] },
  { d: "glo", q: "A family in another country spends 40% of its income on food. What can you conclude?", o: ["They eat too much.", "Probably less money is left for other needs — but we need more context.", "They are rich.", "Nothing at all."], s: [0, 3, 0, 1] },
  { d: "glo", q: "Why do the same $1,500 buy more in some cities than in others?", o: ["Because the cost of living is different.", "Because money is fake in some countries.", "Because of the weather.", "It's impossible."], s: [3, 0, 0, 0] },
];
/* 5 situaciones NUEVAS del periodo 4 */
const RADAR4_NEW = [
  { d: "mm", q: "A wallet says “$0 monthly fee!”. What do you check?", o: ["Nothing — it's free.", "Transfer and withdrawal fees and the limits, for MY use.", "Only the logo.", "If my friends use it."], s: [0, 3, 0, 1] },
  { d: "ent", q: "You sell a product for $50,000. What is your margin?", o: ["$50,000.", "Price minus ALL the variable costs (product, fee, shipping…).", "Price minus the product cost only.", "Whatever is left in my pocket."], s: [0, 3, 1, 0] },
  { d: "wb", q: "An online product arrives broken. What do you do?", o: ["Nothing, I lost my money.", "Keep evidence and ask the store for the warranty.", "Insult the store online.", "Buy another one."], s: [0, 3, 0, 0] },
  { d: "dig", q: "Your phone suddenly has no signal and you get login alerts.", o: ["Wait until tomorrow.", "Call the carrier officially, change passwords and alert the bank.", "Reply to the SMS.", "Restart the phone 10 times."], s: [0, 3, 0, 1] },
  { d: "glo", q: "Your startup says it “helps the planet”. How do you prove it?", o: ["With a green logo.", "With evidence I can measure, like less packaging per order.", "With many followers.", "I don't need to prove it."], s: [0, 3, 0, 0] },
];
const RADAR_ALL4 = [...RADAR8_Q, ...RADAR4_NEW];
function radarProfile4(avg) {
  if (avg <= 30) return { l: "Money Rookie 🌱", d: "You are still building the basics — keep practicing with real decisions." };
  if (avg <= 55) return { l: "Money Explorer 🔎", d: "You know many ideas. Next step: use them with numbers every time." };
  if (avg <= 80) return { l: "Money Planner 📐", d: "Strong decisions! You compare, plan and protect yourself." };
  return { l: "Money Strategist ⭐", d: "Excellent! You think like a founder: numbers, rights, safety and impact." };
}
const SKILLS84 = [["pay", "💳 Explain how an online payment works"], ["wallet", "👛 Compare wallets and calculate a margin"], ["rights", "⚖️ Defend consumer rights"], ["fraud", "🔓 Detect and stop fraud"], ["data", "🔏 Protect personal data"], ["fund", "💰 Fund a startup and test its cash flow"]];
const STAR_L4 = ["", "Starting", "Developing", "Good", "Excellent"];
function Radar40({ resp, existing, onSave, onExit }) {
  const before = resp?.__p1?.c1_radar?.scores || null;
  const [cur, setCur] = useState(0);
  const [ans, setAns] = useState({});
  const [phase, setPhase] = useState(existing?.scores ? "done" : "quiz");
  const [stars, setStars] = useState(existing?.skills || {});
  const [saving, setSaving] = useState(false);
  const scoresOf = (qs) => { const o = {}; RADAR_DIMS.forEach((d) => { const list = qs.map((q, i) => ({ q, i })).filter((x) => x.q.d === d.k); o[d.k] = Math.round((list.reduce((a, x) => a + (ans[x.i] != null ? x.q.s[ans[x.i]] : 0), 0) / (list.length * 3)) * 100); }); return o; };
  const same10 = useMemo(() => scoresOf(RADAR8_Q), [ans]); // eslint-disable-line react-hooks/exhaustive-deps
  const newOk = RADAR4_NEW.filter((q, k) => ans[10 + k] != null && q.s[ans[10 + k]] === 3).length;
  const shown = existing?.scores && !Object.keys(ans).length ? existing.scores : same10;
  const avg = Math.round(Object.values(shown).reduce((a, v) => a + v, 0) / RADAR_DIMS.length);
  const bAvg = before ? Math.round(Object.values(before).reduce((a, v) => a + v, 0) / RADAR_DIMS.length) : null;
  const prof = radarProfile4(avg);
  const q = RADAR_ALL4[cur];
  const answered = ans[cur] != null;
  const save = () => { setSaving(true); setPhase("done"); Promise.resolve(onSave({ answers: ans, scores: same10, average: avg, profile: prof.l, before, beforeAvg: bAvg, growth: bAvg == null ? null : avg - bAvg, newOk, skills: stars, xp: 25 })).finally(() => setSaving(false)); };
  if (phase === "skills") return (
    <ActShell icon={<Star size={22} strokeWidth={2.1} />} title="My Self-Check · Period 4" subtitle="Your radar is ready. Before you see it: how well can you do these 6 things? Be honest!" onExit={onExit}>
      <div className="g8-skills">{SKILLS84.map(([k, l], ri) => <div key={k} className={`g8-skill ${stars[k] ? "done" : ""}`}><header><span>{ri + 1}</span><div><b>I can {l.slice(3).toLowerCase()}</b></div></header><div className="p3-stars">{[1, 2, 3, 4].map((n) => <button key={n} type="button" className={(stars[k] || 0) >= n ? "on" : ""} onClick={() => setStars({ ...stars, [k]: n })}>★</button>)}<small>{STAR_L4[stars[k] || 0]}</small></div></div>)}</div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={SKILLS84.some(([k]) => !stars[k])} onClick={save}>See my growth 🧭 <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
    </ActShell>
  );
  if (phase === "done") {
    const B = existing?.before || before; const bA = existing?.beforeAvg ?? bAvg;
    const grow = B ? RADAR_DIMS.map((d) => ({ ...d, g: shown[d.k] - (B[d.k] || 0) })).sort((a, b) => b.g - a.g) : null;
    return (
      <div className="s1-quiz diag-result g74-radar2">
        <div className="diag-badge"><Compass size={30} strokeWidth={2.1} /></div>
        <h2>My Money Radar 4.0 · How much did I grow this year?</h2>
        <p className="diag-sub">{B ? "Gray dashed line = you in Period 1. Green = you today (the same 10 situations)." : "You didn't do the radar in Period 1, so this is your first photo."}</p>
        <div className="g7-radar-wrap"><RadarN labels={RADAR_DIMS.map((d) => d.short)} values={RADAR_DIMS.map((d) => shown[d.k])} before={B ? RADAR_DIMS.map((d) => B[d.k] || 0) : undefined} /></div>
        {B && <div className="p2-legend p1-center"><span><i style={{ background: "#9aa8a0" }} />Period 1 · {bA}%</span><span><i style={{ background: "#16b074" }} />Today · {avg}%</span></div>}
        <div className="diag-bars">{RADAR_DIMS.map((d) => <div key={d.k} className="diag-bar g74-growbar"><span className="diag-bar-l">{d.l}</span><div className="diag-bar-track">{B && <s style={{ width: `${B[d.k] || 0}%` }} />}<i style={{ width: `${shown[d.k]}%` }} /></div><span className="diag-bar-v">{shown[d.k]}%{B && <small className={shown[d.k] - B[d.k] >= 0 ? "pos" : "neg"}> {shown[d.k] - B[d.k] >= 0 ? "+" : ""}{shown[d.k] - B[d.k]}</small>}</span></div>)}</div>
        {B && <div className="g73-score"><small>MY GROWTH THIS YEAR</small><b className={avg - bA >= 0 ? "good" : "bad"}>{avg - bA >= 0 ? "+" : ""}{avg - bA} points</b><span>From {bA}% to {avg}%</span></div>}
        <div className="diag-risk"><span className="diag-risk-tag">{prof.l}</span><p>{prof.d} New Period 4 situations: <b>{existing?.newOk ?? newOk}/5</b> strong answers.</p></div>
        {grow && <div className="p1-diag-cards"><div className="p1-diag-card good"><b>🚀 You grew most in: {grow[0].l}</b><span>{grow[0].g >= 0 ? "+" : ""}{grow[0].g} points since Period 1.</span></div><div className="p1-diag-card next"><b>🎯 Keep practicing: {grow[4].l}</b><span>Your challenge for 9th grade.</span></div></div>}
        <button className="s1-btn primary" onClick={onExit}>Continue <ChevronRight size={18} /></button>
        {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing your progress…</span>}
      </div>
    );
  }
  return (
    <div className="s1-quiz">
      <div className="quiz-top"><h2>🧭 My Money Radar 4.0</h2><span className="quiz-count">{cur + 1} / {RADAR_ALL4.length}</span></div>
      <div className="quiz-track"><i style={{ width: `${((cur + (answered ? 1 : 0)) / RADAR_ALL4.length) * 100}%` }} /></div>
      {cur === 0 && <p className="start-tip">The same 10 situations from the first day of 8th grade + 5 new ones. Answer honestly — then compare yourself with Period 1!</p>}
      <span className="diag-dim">{RADAR_DIMS.find((d) => d.k === q.d).l}{cur >= RADAR8_Q.length ? " · NEW" : ""}</span>
      <p className="quiz-q">{q.q}</p>
      <div className="quiz-options">{q.o.map((o, k) => <button key={k} type="button" className={`quiz-opt ${ans[cur] === k ? "correct" : ""}`} onClick={() => setAns({ ...ans, [cur]: k })}><span className="opt-key">{"ABCD"[k]}</span><span className="opt-text">{o}</span></button>)}</div>
      <div className="quiz-nav">
        <button className="s1-btn ghost" onClick={() => (cur > 0 ? setCur(cur - 1) : onExit())}>{cur > 0 ? "Back" : "Exit"}</button>
        <button className="s1-btn primary" disabled={!answered} onClick={() => (cur < RADAR_ALL4.length - 1 ? setCur(cur + 1) : setPhase("skills"))}>{cur < RADAR_ALL4.length - 1 ? "Next" : "Last step: my self-check"} <ChevronRight size={18} /></button>
      </div>
    </div>
  );
}

/* ---------- YEAR WRAPPED 8° ---------- */
function yearData8(resp, rows, pointsNow) {
  const P = pastOf(resp);
  const p1 = resp.__p1 || {}, p2 = resp.__p2 || {}, p3 = resp.__p3 || {};
  const pts = [rowPoints(rows["8P1"]), rowPoints(rows["8P2"]), rowPoints(rows["8P3"]), pointsNow];
  const acts = ["8P1", "8P2", "8P3"].map((k) => Object.values(parseJSON(rows[k]?.Checklist_JSON)).filter(Boolean).length);
  return { P, p1, p2, p3, pts, acts, coins: pts.reduce((a, v) => a + v, 0), radar: resp.c32_radar };
}
function YearWrapped8({ resp, rows, pointsNow, actsNow, studentName, existing, onSave, onExit }) {
  const r = resp || {};
  const D = yearData8(r, rows, pointsNow);
  const S = storeOf(r), ck = r.c27_checkout, fu = r.c31_funding, la = r.c32_launch, esc = r.c29_escape;
  const best = ck ? [...ck.products].sort((a, b) => b.margin - a.margin)[0] : null;
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [bestDec, setBestDec] = useState(existing?.bestDecision || null);
  const [mistake, setMistake] = useState(existing?.mistake || "");
  const [st, finish] = useFinish(onSave);
  const first = (studentName || "Student").split(" ")[0];
  const totalActs = D.acts.reduce((a, v) => a + v, 0) + actsNow;
  const maxPts = Math.max(...D.pts, 1);
  const secEv = la?.events?.find((e) => e.ok);
  const decisions = [
    D.P.goal && `Saving for my goal: ${D.P.goal.what}`,
    D.p3.c20_page && "Reading the full credit contract before signing",
    D.p3.c22_storm && "Diversifying my investments",
    fu && fu.keep > 0 && `Keeping ${cop(fu.keep)} as an emergency reserve`,
    r.c29_page && "Never shipping without checking the official payment panel",
    r.c30_page && "Collecting only the data my store needs",
    "Comparing the TOTAL cost, not only the advertisement",
  ].filter(Boolean).slice(0, 5);
  const slides = [
    { k: "intro", c: "forest", node: <><small>GRADE 8 · 2026</small><h2>{first}, this was your year as a founder 🎁</h2><p>4 periods: your money plan, your savings, your bank — and your startup. Ready?</p><em className="g74-big">✨</em></> },
    { k: "coins", c: "gold", node: <><small>THIS YEAR YOU EARNED</small><h2 className="g74-mega">{D.coins.toLocaleString("en-US")}</h2><p>FinFluent coins 🪙</p><div className="g74-wbars">{D.pts.map((v, k) => <div key={k}><i style={{ height: `${Math.max(6, (v / maxPts) * 100)}%` }} /><span>P{k + 1}</span><b>{v}</b></div>)}</div></> },
    { k: "acts", c: "green", node: <><small>YOU COMPLETED</small><h2 className="g74-mega">{totalActs}</h2><p>activities: readings, videos, games, simulators, writing and presentations.</p><div className="g74-wchips">{["📐 Money Planner", "🫙 Smart Saver", "🧭 Financial Advisor", "🚀 Startup Founder"].map((x, k) => <span key={x} className={(k < 3 ? D.acts[k] : actsNow) > 0 ? "on" : ""}>{x}</span>)}</div></> },
    { k: "p1", c: "coral", node: <><small>PERIOD 1 · MY MONEY BLUEPRINT</small><h2>You built your financial plan 📐</h2><p>{D.P.dream ? `Your dream job: ${D.P.dream} (${String(D.P.dreamSector || "").toLowerCase()} sector).` : "Income, budgets, receipts and your first money rules."}{D.P.income ? ` Your monthly income map: ${cop(D.P.income)}.` : ""}</p>{D.P.radar && <p className="g74-quote">Your first radar: <b>{D.P.radar.profile}</b></p>}</> },
    { k: "p2", c: "mint", node: <><small>PERIOD 2 · MY SAVINGS PORTFOLIO</small><h2>You saved for real 🫙</h2><p>{D.P.goal ? `Your Goal Jar: ${D.P.goal.what} · ${cop(D.P.goal.saved)} of ${cop(D.P.goal.target)}.` : "SMART goals, saving methods, emergencies and interest."}{D.P.biz ? ` Your first business plan: ${D.P.biz.e || "🚀"} ${D.P.biz.n}.` : ""}</p></> },
    { k: "p3", c: "gold", node: <><small>PERIOD 3 · MY MONEY LIFE</small><h2>You advised 4 clients and lived “Future Me” 🧭</h2><p>{D.P.loan ? `Your simulated loan: ${cop(D.P.loan.amount)}.` : "Banks, credit, scores and investments."}{D.P.score ? ` Credit score: ${D.P.score}.` : ""}{D.P.inv ? ` Market Storm: ${cop(D.P.inv.final)}.` : ""}</p></> },
    { k: "p4", c: "forest", node: <><small>PERIOD 4 · CREAR STARTUP STUDIO</small><h2>You launched {S.logo} {S.name}</h2><div className="g74-wlist">
      {best && <span>📈 Best margin: <b>{best.n} · {cop(best.margin)}</b></span>}
      {fu && <span>💰 Funding: <b>{cop(fu.own)} savings{fu.loan ? ` + ${cop(fu.loan)} loan` : ""}{fu.inv ? ` + investor ${fu.equity}%` : ""}</b></span>}
      {secEv && <span>🛡️ Security event solved: <b>{secEv.t}</b></span>}
      {esc && <span>🔓 Escape Room: <b>{esc.hints} hints</b></span>}
      {la && <span>🚀 First month: <b>{la.orders} orders · ⭐ {la.rating}</b></span>}
      {r.c32_showcase?.investor && <span>🤝 Investment received: <b>{cop(r.c32_showcase.investor.amount)}</b></span>}
    </div></> },
    { k: "radar", c: "green", node: D.radar?.growth != null ? <><small>MY MONEY RADAR</small><h2 className="g74-mega">{D.radar.growth >= 0 ? "+" : ""}{D.radar.growth}</h2><p>points of growth since Period 1 ({D.radar.beforeAvg}% → {D.radar.average}%)</p><p className="g74-quote">Today you are: <b>{D.radar.profile}</b></p></> : <><small>MY MONEY RADAR</small><h2>{D.radar ? D.radar.profile : "🔒 Locked"}</h2><p>{D.radar ? "Your radar 4.0 is ready." : "Do “My Money Radar 4.0” to see how much you grew."}</p></> },
    { k: "me", c: "coral", node: <><small>YOUR STORY · YOUR WORDS</small><h2>My best decision & the mistake I fixed</h2>
      <div className="g84-wpick">{decisions.map((d) => <button key={d} type="button" className={bestDec === d ? "on" : ""} onClick={() => setBestDec(d)}>{d}</button>)}</div>
      <input className="start-input g84-winput" value={mistake} onChange={(e) => setMistake(e.target.value)} placeholder="One mistake I made this year and how I fixed it…" /></> },
    { k: "outro", c: "forest", node: <><small>2026 → 9th GRADE → YOUR FUTURE</small><h2>Money is a tool. You learned to use it with your head and your heart. 💚</h2><p>{bestDec ? `Best decision: ${bestDec}.` : ""} See you in 9th grade, {first}!</p></> },
  ];
  const s = slides[i];
  const last = i === slides.length - 1;
  const meOk = bestDec && countWords(mistake) >= 6 && realText(mistake);
  if (st.done) return <Reward title="That's a wrap! 🎁" subtitle="What a year: from a budget to a startup." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <div className="p1-act g74-wrapped-wrap">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className={`g74-wrapped c-${s.c}`} id="g74-wrapped" key={s.k}>
        <div className="g74-wprog">{slides.map((x, k) => <i key={x.k} className={k < i ? "done" : k === i ? "on" : ""} />)}</div>
        <div className="g74-wbody">{s.node}</div>
        <div className="g74-wfoot"><span>FinFluent · Instituto CREAR</span><span>{i + 1}/{slides.length}</span></div>
        {s.k !== "me" && <><button type="button" className="g74-wtap left" aria-label="Previous" onClick={() => setI(Math.max(0, i - 1))} /><button type="button" className="g74-wtap right" aria-label="Next" onClick={() => setI(Math.min(slides.length - 1, i + 1))} /></>}
      </div>
      <div className="p3-card-actions">
        <button className="s1-btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}><ArrowLeft size={16} /> Back</button>
        <button className="s1-btn ghost" disabled={busy} onClick={async () => { setBusy(true); await downloadPNG("g74-wrapped", `Year_Wrapped_8_${i + 1}_${first}.png`); setBusy(false); }}><Download size={16} /> {busy ? "Creating…" : "Save this slide"}</button>
        {!last ? <button className="s1-btn primary" disabled={s.k === "me" && !meOk} onClick={() => setI(i + 1)}>{s.k === "me" && !meOk ? "Choose + write (6+ words)" : "Next"} <ChevronRight size={16} /></button>
          : <button className="s1-btn primary" onClick={() => finish(25, { coins: D.coins, acts: totalActs, bestDecision: bestDec, mistake })}>Finish my Wrapped <span className="coin-tag"><Coins size={15} /> +25</span></button>}
      </div>
    </div>
  );
}

/* ---------- BOSS DEL AÑO · 5 misiones + 10 preguntas de los 4 periodos ---------- */
const BOSS_MISSIONS4 = [
  { tag: "MISSION 1 · MONEY", q: "Lina used PocketGo this month: 4 cash withdrawals ($3,000 each) and 6 transfers ($0). Monthly fee $0. How much did she pay in fees?", answer: 12000, money: true, hint: "4 × 3,000 + 6 × 0 + 0", explain: "$12,000. With FlashPay she would pay $4,000 + 4 × $1,000 = $8,000." },
  { tag: "MISSION 2 · BUSINESS", q: "A student says: “I sell a T-shirt for $40,000 and it costs me $18,000, so my margin is $22,000.” But the payment fee is $1,600, shipping $4,000 and the returns reserve $800. What is the REAL margin?", answer: 15600, money: true, hint: "40,000 − 18,000 − 1,600 − 4,000 − 800", explain: "$15,600. Forgetting variable costs makes you think you earn more." },
  { tag: "MISSION 3 · CONSUMER RIGHTS", q: "Pedro bought a speaker online 2 business days ago. It's unused and sealed — he just changed his mind. Best answer from the store?", options: ["Accept the cancellation: online, within 5 business days, unused", "Refuse, because the right of withdrawal only applies to products that arrive broken or damaged", "Charge him a 50% fine", "Offer only a coupon"], correct: 0, hint: "Changing your mind ≠ a defect. Which right is for distance sales?", explain: "The right of withdrawal can apply (with conditions and exceptions)." },
  { tag: "MISSION 4 · CYBERSECURITY", q: "“CREAR Pay: your store will be CLOSED. Confirm your password here in 1 hour: crearpay-verify.co”. What do you do?", options: ["Don't click; check in the official app and report it", "Click and confirm quickly, because losing the store would be much worse than the risk", "Reply asking if it's real", "Send it to your customers"], correct: 0, hint: "Urgency + strange link + asking for a password…", explain: "Phishing! Always go to the official app or website yourself." },
  { tag: "MISSION 5 · ENTREPRENEURSHIP", q: "Your startup needs $5,000,000. You have $2,000,000 saved. The grant is NOT approved yet. Expected profit is small. Which plan is the most responsible?", options: ["Investor + a small loan with a payment you can cover, keeping a reserve", "A $3,000,000 loan for 6 months, counting on the grant to pay it later, using all your savings", "Spend all savings and wait", "Borrow from a gota a gota lender"], correct: 0, hint: "Never count on money you don't have. Can you pay the installment in a bad month?", explain: "Mix sources, keep a reserve and test your cash flow." },
];
function BossYear({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [mis, setMis] = useState(0);
  return stage === 0 ? (
    <ActShell icon={<Swords size={22} strokeWidth={2.1} />} title="Boss of the Year · Part 1 ⚔️" subtitle="5 applied missions — one for each area. You can try again after a hint." onExit={onExit}>
      <RoundsRunner rounds={BOSS_MISSIONS4} doneLabel="Part 2: the year in 10 questions" onDone={(r) => { setMis(r.firstTry); setStage(1); }} />
    </ActShell>
  ) : (
    <QuizRunner title={`Boss of the Year · Part 2 (missions: ${mis}/5 ⭐)`} emoji="⚔️" questions={BOSS_YEAR} pickCount={10} passThreshold={70} xpPerCorrect={4} xpComplete={10 + Math.round(mis * 4)} onSave={(r) => onSave({ ...r, missions: mis })} onExit={onExit} />
  );
}

/* =====================================================================
   ESTRUCTURA DEL PERIODO 4 (clases 26–32) · CREAR Startup Studio
   ===================================================================== */
const A = (key, title, desc, icon, coins, bucket) => ({ key, title, desc, icon, coins, bucket });
const G8P4_WEEKS = [
  { n: 26, g: "26", title: "Follow the Payment", blurb: "From “Pay” to the merchant account — then choose your startup idea.", e: "💳", skills: ["Video", "Game"], acts: [
    A("c26_starter", "Starter: Payment Words 🧱", "Merchant, gateway, network, authorization, refund, chargeback.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c26_video", "Video: How Online Payments Work 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c26_rush", "Who Does It? Rush ⚡", "Customer · gateway · bank · merchant.", <Zap size={22} />, 24, "aprendi"),
    A("c26_journey", "Payment Journey 💳", "Build the route + 5 rounds: approved, declined, blocked, refund, chargeback.", <Route size={22} />, 36, "aprendi"),
    A("c26_page", "My Startup Idea 💡 · Module 01", "Name, logo, sector, customer and the problem you solve.", <Rocket size={22} />, 26, "aprendi"),
  ] },
  { n: 27, g: "27", title: "Get Paid: Wallets & Prices", blurb: "Survive a week with a digital wallet — then price your products and find your break-even.", e: "👛", skills: ["Reading", "Calculator"], acts: [
    A("c27_starter", "Starter: Wallets & Margins 🧱", "Fees, limits, variable and fixed costs, break-even.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c27_read", "Reading: Three Wallets, One Week 📖", "Sofia, Mateo and Daniel · quiz (8 of 12).", <BookOpen size={22} />, 42, "quizzes"),
    A("c27_wallet", "Wallet Showdown 👛", "A week of payments + Wallet Detective.", <Wallet size={22} />, 36, "aprendi"),
    A("c27_checkout", "Checkout Lab 🧮", "Cost Slicer · Price Roller · Break-even · my 3 products.", <Calculator size={22} />, 36, "aprendi"),
    A("c27_page", "Payments & Prices 💳 · Module 02", "2–3 payment methods + where the money arrives.", <CreditCard size={22} />, 28, "aprendi"),
  ] },
  { n: 28, g: "28", title: "Consumer Court", blurb: "Judge 6 online-shopping cases — then write fair policies for your store.", e: "⚖️", skills: ["Reading", "Game"], acts: [
    A("c28_starter", "Starter: Consumer Rights 🧱", "Warranty, retracto, payment reversal, evidence, SIC.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c28_read", "Reading: The Sneakers That Never Arrived 📖", "Emma and FastFeet · quiz (8 of 12).", <BookOpen size={22} />, 42, "quizzes"),
    A("c28_rush", "What Kind of Problem? Rush ⚡", "Delivery · defect · change of mind · payment.", <Zap size={22} />, 24, "aprendi"),
    A("c28_court", "Consumer Court ⚖️", "6 cases + the mirror round.", <Gavel size={22} />, 38, "aprendi"),
    A("c28_page", "My Store Policies ⚖️ · Module 03", "Delivery, returns, warranty, refunds, contact.", <Scale size={22} />, 28, "aprendi"),
  ] },
  { n: 29, g: "29", title: "Fraud Escape Room 2.0", blurb: "SIM swaps, fake stores, impossible returns, fake receipts: escape 5 rooms.", e: "🔓", skills: ["Video", "Escape room"], acts: [
    A("c29_starter", "Starter: Fraud Words 🧱", "SIM swap, smishing, OTP, authenticator, Ponzi.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c29_video", "Video: SIM Swap Scams 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c29_rush", "Safe or Scam? Rush 🚩", "12 situations · 2 boxes.", <Zap size={22} />, 24, "aprendi"),
    A("c29_escape", "Fraud Escape Room 🔓", "5 rooms · 3 hints each · one exit code.", <KeyRound size={22} />, 42, "aprendi"),
    A("c29_page", "My Anti-Fraud Plan 🔐 · Module 04", "5 store rules + 5 customer tips.", <ShieldCheck size={22} />, 28, "aprendi"),
  ] },
  { n: 30, g: "30", title: "Identity Vault", blurb: "Passwords, 2FA, your digital footprint and the data your store really needs.", e: "🔏", skills: ["Reading", "Security"], acts: [
    A("c30_starter", "Starter: Data Words 🧱", "Personal and sensitive data, minimization, Law 1581.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c30_read", "Reading: My Data, My Rules 📖", "Maya's bracelet shop · quiz (8 of 12).", <BookOpen size={22} />, 42, "quizzes"),
    A("c30_rush", "Personal, Sensitive or Not? Rush ⚡", "12 pieces of information.", <Zap size={22} />, 24, "aprendi"),
    A("c30_vault", "Identity Vault 🔏", "4 locks: password, 2FA, footprint, data collector.", <Fingerprint size={22} />, 38, "aprendi"),
    A("c30_page", "Data & Privacy 🔏 · Module 05", "Your privacy notice + 3 protection rules.", <Lock size={22} />, 28, "aprendi"),
  ] },
  { n: 31, g: "31", title: "From a Phone to the World", blurb: "Fund your startup, survive 6 months — and prove your impact.", e: "🌍", skills: ["Reading", "Simulator"], acts: [
    A("c31_starter", "Starter: FinTech & Funding 🧱", "Business model, investor, grant, loan, cash flow, SDGs.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c31_read", "Reading: From a Phone to the World 📖", "Nicolás and LocalLink · quiz (8 of 12).", <BookOpen size={22} />, 42, "quizzes"),
    A("c31_funding", "Funding Round 💰", "Loan · investor · grant · 6-month cash test.", <Banknote size={22} />, 36, "aprendi"),
    A("c31_impact", "Global Impact Map 🌍", "5 communities · SDG 9 or 12 · evidence.", <MapIcon size={22} />, 32, "aprendi"),
    A("c31_page", "Model, Funding & Impact 🌍 · Module 06", "How you earn, how you funded it, who you help.", <Globe size={22} />, 28, "aprendi"),
  ] },
  { n: 32, g: "32", title: "Launch Day + Year Close", blurb: "Launch your store, present it to investors, and close your year.", e: "🚀", skills: ["Speaking", "Challenge"], acts: [
    A("c32_launch", "Launch Simulator 🚀", "Your first month live · 3 random challenges.", <Rocket size={22} />, 30, "aprendi"),
    A("c32_showcase", "Startup Showcase 🏆", "Your store + 6-part pitch · present · Investor Day.", <Award size={22} />, 50, "aprendi"),
    A("c32_radar", "My Money Radar 4.0 🧭", "The radar from Period 1 again + your self-check.", <Compass size={22} />, 25, "comportamiento"),
    A("c32_wrapped", "Year Wrapped 8° 🎁", "Your year in money — in slides.", <Gift size={22} />, 25, "comportamiento"),
    A("c32_boss", "Boss of the Year ⚔️", "5 missions + 10 questions from the whole year (70%).", <Swords size={22} />, 70, "quizzes"),
  ] },
];
const ALL_ACTS4 = G8P4_WEEKS.flatMap((w) => w.acts);
const TOTAL_ACTS4 = ALL_ACTS4.length;
const PAGE_ACTS4 = [...MODULES.map((m) => m.key), "c32_showcase"];

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Periodo4G8 = ({ userData, API_URL, existingRow, onBack }) => {
  const { store, dispatch } = useGlobalReducer();
  const parse = (s) => { try { return s ? JSON.parse(s) : {}; } catch { return {}; } };
  const [checklist, setChecklist] = useState(() => parse(existingRow?.Checklist_JSON));
  const respRef = useRef(parse(existingRow?.Respuestas_JSON));
  const [, force] = useState(0);
  const [points, setPoints] = useState({
    comportamiento: parseFloat(existingRow?.Puntos_Comportamiento || 0),
    quizzes: parseFloat(existingRow?.Puntos_Quizzes || 0),
    aprendi: parseFloat(existingRow?.Puntos_Aprendi || 0),
  });
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

  /* Filas de los periodos anteriores (radar del P1, ahorros del P2, Money Life del P3, Wrapped) */
  const rows = { "8P1": store.semanas?.["8P1"], "8P2": store.semanas?.["8P2"], "8P3": store.semanas?.["8P3"] };
  const past = { __p1: parseJSON(rows["8P1"]?.Respuestas_JSON), __p2: parseJSON(rows["8P2"]?.Respuestas_JSON), __p3: parseJSON(rows["8P3"]?.Respuestas_JSON) };
  const full = () => ({ ...(respRef.current || {}), ...past });

  const name = userData?.Nombre_Completo || "Student";
  const doneCount = ALL_ACTS4.filter((a) => checklist[a.key]).length;
  const pctDone = Math.round((doneCount / TOTAL_ACTS4) * 100);
  const weekDone = (w) => w.acts.every((a) => checklist[a.key]);
  const coinsTotal = Math.round(points.comportamiento + points.quizzes + points.aprendi);

  const persist = (nextChecklist, nextPoints, respPatch) => {
    respRef.current = { ...respRef.current, ...respPatch };
    const done = ALL_ACTS4.filter((a) => nextChecklist[a.key]).length;
    const row = {
      Student_Key: userData.Student_Key, Semana: PERIOD_KEY, Grado: GRADE,
      Estado: done >= TOTAL_ACTS4 ? "completed" : "in_progress",
      Porcentaje: Math.round((done / TOTAL_ACTS4) * 100),
      Puntos_Comportamiento: nextPoints.comportamiento, Puntos_Quizzes: nextPoints.quizzes, Puntos_Aprendi: nextPoints.aprendi,
      Checklist_JSON: JSON.stringify(nextChecklist), Respuestas_JSON: JSON.stringify(respRef.current),
    };
    const prev = store.semanas?.[PERIOD_KEY];
    dispatch({ type: "save_progreso", payload: row }); // OPTIMISTA
    fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "save_progreso", data: row }) })
      .catch((e) => { console.error("Error guardando 8° Periodo 4:", e); dispatch({ type: "rollback_progreso", payload: { Semana: PERIOD_KEY, prev } }); });
  };
  const complete = (key, bucket, xp, respPatch, pass = true) => {
    const already = !!checklist[key];
    const nextChecklist = { ...checklist, [key]: already || pass };
    const nextPoints = already ? points : { ...points, [bucket]: points[bucket] + (xp || 0) };
    setChecklist(nextChecklist); setPoints(nextPoints);
    persist(nextChecklist, nextPoints, respPatch);
    return Promise.resolve();
  };
  const WRAP = "s1 p1 p2 p3 p4 g7 g72 g73 g74 g8 g82 g83 g84";

  if (act) {
    const def = ALL_ACTS4.find((a) => a.key === act);
    const resp = full();
    const exit = () => setAct(null);
    const save = (r) => complete(act, def.bucket, r.xp, { [act]: { ...r, at: nowISO() } }, r.passed !== false);
    const reading = (tag, title, subtitle, sections, glossary, questions, emoji) => (
      <ReadThen tag={tag} title={title} subtitle={subtitle} minutes={8} sections={sections} glossary={glossary} onExit={exit} finishLabel="I read it — start the quiz (8 questions)">
        <QuizRunner title={`${title} · check`} emoji={emoji} questions={questions} pickCount={8} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
      </ReadThen>
    );
    const video = (src, title, qs) => <VideoQuiz src={src} title={title} questions={qs} pickCount={8} onSave={save} onExit={exit} />;
    const starter = (title, subtitle, data, coins = 20) => <StarterPack title={title} subtitle={subtitle} cards={data.cards} pairs={data.pairs} rounds={data.rounds} coins={coins} onSave={save} onExit={exit} />;
    const rush = (title, subtitle, data, doneTitle, seconds = 60) => <SpeedSort title={title} subtitle={subtitle} buckets={data.buckets} items={data.items} seconds={seconds} doneTitle={doneTitle} onSave={save} onExit={exit} />;
    let view = null;
    switch (act) {
      case "c26_starter": view = starter("Starter: Payment Words 🧱", "Who is who when you press “Pay”?", START_26); break;
      case "c26_video": view = video(VID_PAY, "How Online Payments Work", VQ_26); break;
      case "c26_rush": view = rush("Who Does It? Rush ⚡", "Customer, gateway, bank / network or merchant?", RUSH_26, "Payment pro! 💳", 75); break;
      case "c26_journey": view = <PaymentJourney onSave={save} onExit={exit} />; break;
      case "c26_page": view = <IdeaModule resp={resp} existing={resp.c26_page} onSave={save} onExit={exit} />; break;
      case "c27_starter": view = starter("Starter: Wallets & Margins 🧱", "What does a payment REALLY cost?", START_27); break;
      case "c27_read": view = reading("READING · B1 · STORY", "Three Wallets, One Week", "Which wallet is the best? It depends…", READ_27, GLOSS_27, Q_27, "👛"); break;
      case "c27_wallet": view = <WalletShowdown onSave={save} onExit={exit} />; break;
      case "c27_checkout": view = <CheckoutLab resp={resp} onSave={save} onExit={exit} />; break;
      case "c27_page": view = <PayModule resp={resp} existing={resp.c27_page} onSave={save} onExit={exit} />; break;
      case "c28_starter": view = starter("Starter: Consumer Rights 🧱", "Not every problem has the same solution.", START_28); break;
      case "c28_read": view = reading("READING · B1 · STORY", "The Sneakers That Never Arrived", "A customer, a store and order #4821.", READ_28, GLOSS_28, Q_28, "👟"); break;
      case "c28_rush": view = rush("What Kind of Problem? Rush ⚡", "Delivery, defect, change of mind or payment?", RUSH_28, "Consumer judge! ⚖️", 75); break;
      case "c28_court": view = <ConsumerCourt onSave={save} onExit={exit} />; break;
      case "c28_page": view = <PolicyModule resp={resp} existing={resp.c28_page} onSave={save} onExit={exit} />; break;
      case "c29_starter": view = starter("Starter: Fraud Words 🧱", "Criminals don't hack phones — they trick people.", START_29); break;
      case "c29_video": view = video(VID_SIM, "SIM Swap Scams", VQ_29); break;
      case "c29_rush": view = rush("Safe or Scam? Rush 🚩", "Good practice or scam signal?", RUSH_29, "Scam stopper! 🚩"); break;
      case "c29_escape": view = <EscapeRoom onSave={save} onExit={exit} />; break;
      case "c29_page": view = <AntiFraudModule resp={resp} existing={resp.c29_page} onSave={save} onExit={exit} />; break;
      case "c30_starter": view = starter("Starter: Data Words 🧱", "If you can't explain why you need it, don't collect it.", START_30); break;
      case "c30_read": view = reading("READING · B1 · STORY", "My Data, My Rules", "Why does a shop need my birthday?", READ_30, GLOSS_30, Q_30, "🔏"); break;
      case "c30_rush": view = rush("Personal, Sensitive or Not? Rush ⚡", "What kind of information is it?", RUSH_30, "Data detective! 🔎", 75); break;
      case "c30_vault": view = <IdentityVault onSave={save} onExit={exit} />; break;
      case "c30_page": view = <DataModule resp={resp} existing={resp.c30_page} onSave={save} onExit={exit} />; break;
      case "c31_starter": view = starter("Starter: FinTech & Funding 🧱", "An idea is not yet a business model.", START_31); break;
      case "c31_read": view = reading("READING · B1 · BUSINESS CASE", "From a Phone to the World", "Nicolás, LocalLink and $6,000,000.", READ_31, GLOSS_31, Q_31, "📱"); break;
      case "c31_funding": view = <FundingRound resp={resp} onSave={save} onExit={exit} />; break;
      case "c31_impact": view = <ImpactMap resp={resp} onSave={save} onExit={exit} />; break;
      case "c31_page": view = <ModelModule resp={resp} existing={resp.c31_page} onSave={save} onExit={exit} />; break;
      case "c32_launch": view = <LaunchSim resp={resp} onSave={save} onExit={exit} />; break;
      case "c32_showcase": view = <StartupShowcase resp={resp} studentName={name} existing={resp.c32_showcase} onSave={save} onExit={exit} />; break;
      case "c32_radar": view = <Radar40 resp={resp} existing={resp.c32_radar} onSave={save} onExit={exit} />; break;
      case "c32_wrapped": view = <YearWrapped8 resp={resp} rows={rows} pointsNow={coinsTotal} actsNow={doneCount} studentName={name} existing={resp.c32_wrapped} onSave={save} onExit={exit} />; break;
      case "c32_boss": view = <BossYear onSave={save} onExit={exit} />; break;
      default: view = null;
    }
    return <div className={WRAP}>{view}</div>;
  }

  if (week) {
    const w = G8P4_WEEKS.find((x) => x.n === week);
    const wDone = w.acts.filter((a) => checklist[a.key]).length;
    const next = G8P4_WEEKS[G8P4_WEEKS.indexOf(w) + 1];
    return (
      <div className={WRAP}>
        <button className="s1-back" onClick={() => setWeek(null)}><ArrowLeft size={18} strokeWidth={2.4} /> Back to Period 4</button>
        <div className="s1-hero p1-week-hero g7-hero g8-hero">
          <span className="s1-tag">{w.e} GRADE 8 · PERIOD 4 · CLASS {w.g}</span>
          <h1>{w.title}</h1>
          <p>{w.blurb}</p>
          <div className="s1-progress"><div className="bar"><i style={{ width: `${(wDone / w.acts.length) * 100}%` }} /></div><span className="pill">{wDone}/{w.acts.length}</span></div>
        </div>
        <StartupDash resp={respRef.current} compact />
        <div className="s1-quest">
          {w.acts.map((a) => (
            <div key={a.key} className={`act-card ${checklist[a.key] ? "done" : ""} ${PAGE_ACTS4.includes(a.key) ? "g8-page-act" : ""} ${a.title.startsWith("Starter") ? "g8-starter-act" : ""} ${a.key.endsWith("_rush") ? "g8-rush-act" : ""} ${a.key.endsWith("_read") || a.key.endsWith("_video") ? "g73-learn-act" : ""}`}>
              <div className="act-ico">{checklist[a.key] ? <Check size={22} strokeWidth={3} /> : a.icon}</div>
              <div className="act-main"><h3>{a.title}</h3><p>{a.desc}</p></div>
              {checklist[a.key] ? <button className="act-cta done" onClick={() => setAct(a.key)}>Done ✓</button> : <button className="act-cta play" onClick={() => setAct(a.key)}><Play size={16} strokeWidth={2.6} /> Start <span className="coin-tag"><Coins size={14} /> +{a.coins}</span></button>}
            </div>
          ))}
        </div>
        {next && wDone === w.acts.length && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setWeek(next.n)}>Go to class {next.g}: {next.title} <ChevronRight size={18} /></button></div>}
      </div>
    );
  }

  return (
    <div className={WRAP}>
      <button className="s1-back" onClick={onBack}><ArrowLeft size={18} strokeWidth={2.4} /> Back to overview</button>
      <div className="s1-hero p1-hero g7-hero g8-hero g84-hero">
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> ADMIN PREVIEW · GRADE {GRADE} · PERIOD 4</span>
        <h1>CREAR Startup Studio 🚀</h1>
        <p>How can a digital business receive money, protect its customers and create real value?</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pctDone}%` }} /></div><span className="pill">{pctDone}%</span></div>
        <div className="p1-hero-chips"><span><Coins size={14} /> {coinsTotal} coins</span><span><Check size={14} /> {doneCount}/{TOTAL_ACTS4} activities</span><span>🚀 Startup Dashboard</span><span>🛡️ Customer Safety Center</span><span>🎯 SDG 9 · SDG 12</span></div>
      </div>
      <div className="g8-howyear"><b>🧭 This period:</b><span>You become a founder. In 7 classes you build a digital store: how it gets paid, its prices, its policies, its anti-fraud plan, its privacy notice and its funding. On Launch Day you open it, present it to investors — and close your year with your Radar 4.0 and your Year Wrapped.</span></div>
      <StartupDash resp={respRef.current} studentName={name} />
      {checklist.c32_showcase && <button type="button" className="p3-card-link" onClick={() => setAct("c32_showcase")}><Award size={18} /> See my Startup Showcase <ChevronRight size={16} /></button>}
      <div className="p1-passport">
        <div className="p1-passport-head"><b>🚀 Founder Pass</b><span>Finish a class to get its stamp</span></div>
        <div className="p1-stamps">{G8P4_WEEKS.map((w) => <button key={w.n} type="button" className={`p1-stamp ${weekDone(w) ? "done" : ""}`} onClick={() => setWeek(w.n)} title={w.title}><em>{w.e}</em><small>{w.g}</small></button>)}</div>
      </div>
      <div className="p1-weeks">
        {G8P4_WEEKS.map((w) => {
          const d = w.acts.filter((a) => checklist[a.key]).length; const fullW = d === w.acts.length;
          return (
            <button key={w.n} type="button" className={`p1-week-card ${fullW ? "done" : ""}`} onClick={() => setWeek(w.n)}>
              <div className="p1-week-top"><span className="p1-week-n">Class {w.g}</span><em>{fullW ? "✅" : w.e}</em></div>
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
};