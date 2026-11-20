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
  Ship, Anchor, Gamepad2, Dice5, Factory, FlaskConical, Tag, Crosshair, School, Medal, Gem,
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
import "../Styles/noveno1.css";   // piezas de 9°
import "../Styles/noveno2.css";
import "../Styles/noveno3.css";
import "../Styles/noveno4.css";
import "../Styles/decimo1.css";   // piezas compartidas de 10° (panel, pitch, feria, radar…)
import "../Styles/decimo3.css";   // pasos, evidencias
import "../Styles/once1.css";     // 11° · base Founder Year (equipos, Team Zone, logo, juegos)
import "../Styles/once3.css";     // 11° · Periodo 3
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   GRADO 11 · PERIODO 3 · INVESTOR LAB 18+ & LIFE PLAN (B2+)
   Año "FOUNDER YEAR": cada periodo lee las filas anteriores ("11P1"…"11P3") y suma una Founder Card.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "11P3", Grado = "11".
   ===================================================================== */
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
  { p: 1, k: "11P1", act: "c8_boss", e: "🛠️", t: "Product Builder", d: "I turn a real problem into a product people pay for." },
  { p: 2, k: "11P2", act: "c8_boss", e: "🦈", t: "Shark-Ready Founder", d: "I know what my company is worth — and why." },
  { p: 3, k: "11P3", act: "c8_boss", e: "📈", t: "Investor 18+", d: "At 18, my money works harder than inflation." },
  { p: 4, k: "11P4", act: "c7_showcase", e: "🎓", t: "FinFluent Graduate", d: "I can build, fund, invest and plan my life." },
];
const usd = (n) => (Number(n) < 0 ? "−US$" : "US$") + Math.abs(Number(n || 0)).toLocaleString("en-US", { maximumFractionDigits: 2 });
const pctTxt = (v, d = 1) => `${v >= 0 ? "+" : ""}${Number(v).toFixed(d)}%`;
/* Objetivos de escritura (10°–11°) */
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
      {got && <div className="g93-cert g10-cert" id={`${id}-cert`}><small>INSTITUTO CREAR · FINFLUENT · GRADE 11</small><h2>{cert.e} {cert.title}</h2><p>This certifies that</p><b>{cert.name}</b><p>{cert.text}</p><span>Jury score: {score}/{rubric.length * 5} · {new Date().toLocaleDateString("en-GB")}</span></div>}
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
function RadarQuiz({ title, qs, intro, onDone, onExit, dims = RADAR10_DIMS, newFrom = 10 }) {
  const [cur, setCur] = useState(0);
  const [ans, setAns] = useState({});
  const [orders] = useState(() => qs.map((x) => shuffleArr(x.o.map((_, k) => k))));
  const q = qs[cur]; const answered = ans[cur] != null;
  return (
    <div className="s1-quiz">
      <div className="quiz-top"><h2>🧭 {title}</h2><span className="quiz-count">{cur + 1} / {qs.length}</span></div>
      <div className="quiz-track"><i style={{ width: `${((cur + (answered ? 1 : 0)) / qs.length) * 100}%` }} /></div>
      {cur === 0 && intro}
      {cur === newFrom && <p className="start-tip">🆕 New situations about this year's topics.</p>}
      <span className="diag-dim">{cur >= newFrom ? "🆕 " : ""}{(dims.find((d) => d.k === q.d) || {}).l}</span>
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
        <small>FOUNDER CARD · PERIOD {card.p}</small>
        <em>{card.e}</em>
        <h3>{card.t}</h3>
        <b>{name}</b>
        <p>“{card.d}”</p>
        <ul>{lines.filter(Boolean).map((l) => <li key={l}>{l}</li>)}</ul>
        <span>FinFluent · Instituto CREAR · Grade 11</span>
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
  const rows = {}; ["11P1", "11P2", "11P3", "11P4"].forEach((k) => { rows[k] = store.semanas?.[k]; });
  const prev = { __p1: parseJSON(rows["11P1"]?.Respuestas_JSON), __p2: parseJSON(rows["11P2"]?.Respuestas_JSON), __p3: parseJSON(rows["11P3"]?.Respuestas_JSON) };
  if (cfg.n === 1) prev.__p1 = {};
  const resp = { ...prev, ...(respRef.current || {}) };
  if (cfg.n === 1) resp.__p1 = respRef.current || {};
  const doneCount = ALL.filter((a) => checklist[a.key]).length;
  const pctDone = Math.round((doneCount / TOTAL) * 100);
  const weekDone = (w) => w.acts.every((a) => checklist[a.key]);
  const coinsTotal = Math.round(points.comportamiento + points.quizzes + points.aprendi);
  const have = {}; FM_CARDS.forEach((c) => { const x = parseJSON(rows[c.k]?.Respuestas_JSON)?.[c.act]; have[c.p] = !!(x && (c.act !== "c8_boss" || x.passed)); });
  const mineCard = FM_CARDS.find((c) => c.p === cfg.n);
  if (mineCard && respRef.current?.[mineCard.act] && (mineCard.act !== "c8_boss" || respRef.current[mineCard.act].passed)) have[cfg.n] = true;

  const persist = (nextChecklist, nextPoints, respPatch) => {
    respRef.current = { ...respRef.current, ...respPatch };
    const done = ALL.filter((a) => nextChecklist[a.key]).length;
    const row = {
      Student_Key: userData.Student_Key, Semana: cfg.KEY, Grado: "11",
      Estado: done >= TOTAL ? "completed" : "in_progress", Porcentaje: Math.round((done / TOTAL) * 100),
      Puntos_Comportamiento: nextPoints.comportamiento, Puntos_Quizzes: nextPoints.quizzes, Puntos_Aprendi: nextPoints.aprendi,
      Checklist_JSON: JSON.stringify(nextChecklist), Respuestas_JSON: JSON.stringify(respRef.current),
    };
    const before = store.semanas?.[cfg.KEY];
    dispatch({ type: "save_progreso", payload: row }); // OPTIMISTA
    fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "save_progreso", data: row }) })
      .catch((e) => { console.error(`Error guardando 11° ${cfg.KEY}:`, e); dispatch({ type: "rollback_progreso", payload: { Semana: cfg.KEY, prev: before } }); });
  };
  const complete = (key, bucket, xp, respPatch, pass = true) => {
    const already = !!checklist[key];
    const nextChecklist = { ...checklist, [key]: already || pass };
    const nextPoints = already ? points : { ...points, [bucket]: points[bucket] + (xp || 0) };
    setChecklist(nextChecklist); setPoints(nextPoints);
    persist(nextChecklist, nextPoints, respPatch);
    return Promise.resolve();
  };
  const WRAP = `s1 p1 p2 p3 p4 g7 g72 g73 g74 g8 g82 g83 g84 g9 g91 g92 g93 g94 g10 g11 g11${cfg.n}`;
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
        <div className={`s1-hero p1-week-hero g7-hero g8-hero g91-hero g10-hero g11-hero g11-hero${cfg.n}`}>
          <span className="s1-tag">{w.e} GRADE 11 · PERIOD {cfg.n} · CLASS {w.n}</span>
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
      <div className={`s1-hero p1-hero g7-hero g8-hero g91-hero g10-hero g11-hero g11-hero${cfg.n}`}>
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> GRADE 11 · PERIOD {cfg.n} · FOUNDER YEAR</span>
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
   PIEZAS DE ONCE · FOUNDER YEAR (compartidas por los 4 periodos)
   - Equipos (Apps Script team_*), Team Zone (metas físicas del día), logo, panel del fundador.
   - Radar 11, "What I can do now", periódico THE CREAR TIMES, juegos del Game Zone.
   Estilos: decimo1.css (.g10-*) + once1.css (.g11-*)
   ===================================================================== */
const A11 = (key, title, desc, icon, coins, bucket) => ({ key, title, desc, icon, coins, bucket });
const apiPost = async (API_URL, body) => { const res = await fetch(API_URL, { method: "POST", body: JSON.stringify(body) }); return res.json(); };
const teamPost = (API_URL, userData, action, extra = {}) => apiPost(API_URL, { action, user_key: userData?.Student_Key, nombre: userData?.Nombre_Completo, grado: "11", ...extra });
/* Guarda en el equipo lo último que construyó el estudiante (marca, precio, costo…) — no bloquea */
const teamShare = (ctx, patch) => { const code = (ctx.resp?.__p1?.c1_team || ctx.resp?.c1_team)?.code; if (!code || !ctx.API_URL || String(code).startsWith("OFF")) return; teamPost(ctx.API_URL, ctx.userData, "team_save", { code, data: patch }).catch(() => {}); };
function useTeamData(ctx) {
  const t = ctx.resp?.__p1?.c1_team || ctx.resp?.c1_team;
  const [data, setData] = useState(null);
  useEffect(() => { if (!t?.code || String(t.code).startsWith("OFF") || !ctx.API_URL) return; teamPost(ctx.API_URL, ctx.userData, "team_state").then((d) => { if (d?.team) setData(d.team); }).catch(() => {}); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return data;
}
/* Muestra lo que el equipo ya guardó y permite usarlo */
function TeamSync({ team, field, label, show, onUse }) {
  const v = team?.data?.[field];
  if (!v) return null;
  return <div className="g11-sync"><span>👥 Your team saved a {label}: <b>{show ? show(v) : String(v)}</b>{team.data?.[`${field}_by`] ? ` (by ${String(team.data[`${field}_by`]).split(" ")[0]})` : ""}</span><button type="button" className="s1-btn ghost" onClick={() => onUse(v)}>Use the team version</button></div>;
}

const TEAM_ROLES = [["ceo", "👑", "CEO", "leads, decides, presents"], ["cfo", "🧮", "CFO", "costs, prices, numbers"], ["cmo", "📣", "CMO", "brand, posts, customers"], ["maker", "🧪", "Maker", "recipe, prototype, quality"]];
const PRODUCT_CATS = ["🍮 Gelatin desserts", "🍪 Cookies", "🧁 Cupcakes / brownies", "🍫 Chocolate bites", "🥤 Natural drinks", "🍿 Flavored popcorn", "🍓 Fruit snacks", "🧼 Handmade soap", "🕯️ Candles", "🔑 Keychains / accessories", "✨ Something innovative"];

/* ---------- Logo (se dibuja con CSS: forma + color + símbolo + nombre) ---------- */
const LOGO_SHAPES = [["circle", "⚪ Circle"], ["round", "▢ Rounded"], ["hex", "⬡ Hexagon"], ["shield", "🛡️ Shield"], ["leaf", "🍃 Leaf"], ["ticket", "🎟️ Ticket"]];
const LOGO_FONTS = [["bold", "BOLD & modern"], ["serif", "Classic serif"], ["round", "Round & friendly"], ["hand", "Handmade"]];
const LOGO_COLORS = [
  { c: "#d64933", n: "Red", m: "energy, appetite, urgency" }, { c: "#f2a541", n: "Orange", m: "fun, friendly, call to action" }, { c: "#f6d55c", n: "Yellow", m: "optimism, attention" },
  { c: "#3c9d5d", n: "Green", m: "health, nature, growth" }, { c: "#6d3b8f", n: "Purple", m: "luxury, creativity, wisdom" }, { c: "#7a4a2b", n: "Brown", m: "natural, homemade, warm" },
  { c: "#e98fb0", n: "Pink", m: "sweet, playful, caring" }, { c: "#1d1d1f", n: "Black", m: "premium, power, elegance" }, { c: "#f7f1e3", n: "Cream", m: "clean, simple, soft" },
];
const colorName = (c) => LOGO_COLORS.find((x) => x.c === c)?.n || c;
function LogoMark({ logo, brand, size = 96 }) {
  const L = logo || {}; const bg = L.bg || "#3c9d5d"; const fg = L.fg || "#f7f1e3";
  return (
    <div className={`g11-logo shape-${L.shape || "circle"} font-${L.font || "bold"}`} style={{ "--lg-bg": bg, "--lg-fg": fg, "--lg-s": `${size}px` }}>
      <em>{L.symbol || "✨"}</em>
      {brand && <b>{brand}</b>}
    </div>
  );
}

/* ---------- Foto de la empresa (todo lo construido en P1, leído desde cualquier periodo) ---------- */
const co11 = (r1) => {
  const r = r1 || {};
  const team = r.c1_team || {}; const nm = r.c4_name || {}; const bl = r.c3_builder || {};
  return {
    team, brand: nm.brand || team.name || "", tagline: nm.tagline || "", logo: r.c4_logo || null,
    product: bl.product || "", cat: team.category || bl.base || "", persona: r.c2_persona || null,
    unit: num(r.c5_cost?.unitCost), price: num(r.c5_price?.price), fixed: num(r.c6_break?.fixed), monthly: num(r.c6_market?.monthly),
    preorders: num(r.c8_audit?.real), ok: !!(r.c4_name && r.c5_price),
  };
};
function FounderPanel({ co, have, stats, compact, studentName, title }) {
  const first = (studentName || "Student").split(" ")[0];
  return (
    <div className={`g10-panel g11-panel ${compact ? "compact" : ""}`}>
      <div className="g10-panel-me">
        {co.logo ? <LogoMark logo={co.logo} size={compact ? 52 : 64} /> : <em>🚀</em>}
        <div><small>FOUNDER YEAR · {title}</small><b>{co.brand || "My company"}{co.product ? ` · ${co.product}` : ""}</b>{!compact && <span>{co.team?.name ? `👥 Team ${co.team.name} · ${first} is ${TEAM_ROLES.find((x) => x[0] === co.team.role)?.[2] || "a founder"}` : "Create or join your team in Period 1 (Class 1)."}{co.tagline ? ` · “${co.tagline}”` : ""}</span>}</div>
      </div>
      {stats && stats.length > 0 && <div className="g10-panel-stats">{stats.map((s) => <div key={s.l} className={s.c || ""}><small>{s.l}</small><b>{s.v}</b></div>)}</div>}
      {!compact && <div className="g10-cards">{FM_CARDS.map((c) => <span key={c.t} className={have[c.p] ? "on" : ""}><em>{have[c.p] ? c.e : "🔒"}</em><small>PERIOD {c.p}</small><b>{c.t}</b><i>{c.d}</i></span>)}</div>}
    </div>
  );
}

/* ---------- Periódico (lecturas) ---------- */
function NewsHead({ s, d, k }) {
  return <div className="g11-news-head"><b>THE CREAR TIMES</b><span>{s}{d ? ` · ${d}` : ""}</span>{k && <i>{k}</i>}</div>;
}

/* ---------- Team Zone: metas físicas del día con evidencia ---------- */
function TeamZone({ icon, title, subtitle, brief, goals, minutes = 30, coins = 24, existing, resp, extraValid = true, extra, onData, onSave, onExit }) {
  const team = resp?.__p1?.c1_team || resp?.c1_team;
  const [g, setG] = useState(() => Object.fromEntries(goals.map((x) => { const def = { done: false, ev: "", rows: x.cols ? Array.from({ length: x.min || 3 }, () => ({})) : undefined }; const e = existing?.goals?.[x.k]; return [x.k, e ? { ...def, ...e, rows: x.cols ? (e.rows && e.rows.length ? e.rows : def.rows) : undefined } : def]; })));
  const [run, setRun] = useState(false);
  const [left, reset] = useCountdown(minutes * 60, run);
  const [st, finish] = useFinish(onSave);
  const up = (k, patch) => setG((o) => ({ ...o, [k]: { ...o[k], ...patch } }));
  const rowsOk = (x) => !x.cols || (g[x.k].rows || []).filter((r) => x.cols.every((c) => String(r[c.k] ?? "").trim())).length >= (x.min || 3);
  const evOk = (x) => (x.cols ? rowsOk(x) : x.kind === "num" ? num(g[x.k].ev) > 0 : countWords(g[x.k].ev) >= (x.words || 3));
  const okAll = goals.every((x) => g[x.k].done && evOk(x)) && extraValid;
  const doneN = goals.filter((x) => g[x.k].done && evOk(x)).length;
  if (st.done) return <Reward title="Team mission complete! 🧑‍🤝‍🧑" subtitle={`${doneN}/${goals.length} goals with evidence`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={icon || <Users size={22} strokeWidth={2.1} />} title={title} subtitle={subtitle} onExit={onExit}>
      {brief}
      <div className="g11-zone-top">
        <div><small>🧑‍🤝‍🧑 TEAM ZONE · MEET WITH YOUR TEAM</small><b>{team?.name ? `Team ${team.name}` : "Your team"}</b>{team?.members?.length ? <span>{team.members.join(" · ")}</span> : <span>Work with your teammates — this part happens in real life.</span>}</div>
        <div className="g11-timer"><b>{String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}</b><button type="button" className="s1-btn ghost" onClick={() => setRun(!run)}>{run ? <><Pause size={15} /> Pause</> : <><Play size={15} /> {left === minutes * 60 ? "Start" : "Go on"}</>}</button>{left !== minutes * 60 && <button type="button" className="p1-link" onClick={() => { setRun(false); reset(); }}>reset</button>}</div>
      </div>
      <div className="g11-goals-bar"><span>TODAY'S GOALS</span><i><b style={{ width: `${(doneN / goals.length) * 100}%` }} /></i><em>{doneN}/{goals.length}</em></div>
      <div className="g11-goals">{goals.map((x, i) => {
        const o = g[x.k]; const ok = o.done && evOk(x);
        return (
          <div key={x.k} className={`g11-goal ${ok ? "ok" : ""}`}>
            <button type="button" className={`g11-check ${o.done ? "on" : ""}`} onClick={() => up(x.k, { done: !o.done })} aria-label="mark as done">{o.done ? "✓" : i + 1}</button>
            <div className="g11-goal-main">
              <b>{x.e || "🎯"} {x.t}</b>{x.d && <small>{x.d}</small>}
              {x.cols ? (
                <div className="g11-rows">
                  <div className="g11-row head">{x.cols.map((c) => <span key={c.k}>{c.l}</span>)}</div>
                  {(o.rows || []).map((r, ri) => <div key={ri} className="g11-row">{x.cols.map((c) => <input key={c.k} className="start-input" type={c.type === "num" ? "number" : "text"} inputMode={c.type === "num" ? "decimal" : undefined} value={r[c.k] ?? ""} placeholder={c.ph || ""} onChange={(e) => { const rows = o.rows.map((y, j) => (j === ri ? { ...y, [c.k]: e.target.value } : y)); up(x.k, { rows }); if (onData) onData(x.k, rows); }} />)}</div>)}
                  <button type="button" className="p1-link" onClick={() => up(x.k, { rows: [...(o.rows || []), {}] })}><Plus size={14} /> add a row</button>
                </div>
              ) : x.kind === "num" ? (
                <div className="p2-answer-row">{x.money && <span className="p2-unit">$</span>}<input className="start-input p2-num" type="number" inputMode="decimal" value={o.ev} placeholder={x.ph || "0"} onChange={(e) => { up(x.k, { ev: e.target.value }); if (onData) onData(x.k, e.target.value); }} />{x.unit && <span className="p2-unit">{x.unit}</span>}</div>
              ) : (
                <input className="start-input" value={o.ev} placeholder={x.ph || "Evidence: what exactly did you do?"} onChange={(e) => { up(x.k, { ev: e.target.value }); if (onData) onData(x.k, e.target.value); }} />
              )}
              {o.done && !evOk(x) && <i className="g11-need">✋ Add the evidence to complete this goal.</i>}
            </div>
          </div>
        );
      })}</div>
      {extra}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!okAll} onClick={() => finish(coins, { goals: g, minutesUsed: Math.round((minutes * 60 - left) / 60) })}>{okAll ? "Our mission is complete" : `Complete all goals with evidence (${doneN}/${goals.length})`} <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
    </ActShell>
  );
}
const zoneRows = (resp, act, k) => (resp?.[act]?.goals?.[k]?.rows || []);

/* ---------- Equipos: crear o unirse con código (Apps Script team_*) ---------- */
function TeamHub({ userData, API_URL, existing, onSave, onExit, brief }) {
  const [team, setTeam] = useState(existing?.code ? { code: existing.code, name: existing.name, members: (existing.members || []).map((n) => ({ name: n })) } : null);
  const [mode, setMode] = useState("home");
  const [tName, setTName] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState(existing?.role || "");
  const [cat, setCat] = useState(existing?.category || "");
  const [rules, setRules] = useState(existing?.rules || ["", "", ""]);
  const [offMembers, setOffMembers] = useState(existing?.members?.join(", ") || "");
  const [st, finish] = useFinish(onSave);
  const run = async (action, extra) => { setBusy(true); setMsg(null); try { const d = await teamPost(API_URL, userData, action, extra); if (d.status === "error") { setMsg(d.message); return null; } if (d.team) setTeam(d.team); return d; } catch (e) { setMsg("Connection problem. Try again — or create an offline team."); return null; } finally { setBusy(false); } };
  useEffect(() => { if (!existing?.code && API_URL) run("team_state"); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const members = team ? (team.offline ? offMembers.split(",").map((x) => x.trim()).filter(Boolean) : (team.members || []).map((m) => m.name)) : [];
  const ok = team && role && cat && rules.filter((r) => countWords(r) >= 3).length >= 3 && (!team.offline || members.length >= 1);
  if (st.done) return <Reward title={`Team ${team.name} is born! 🚀`} subtitle={`${members.length} founders · ${cat}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Users size={22} strokeWidth={2.1} />} title="Team Up 🤝 · Found your company" subtitle="Teams of 2–4. One person creates the team, the others join with the code." onExit={onExit}>
      {brief}
      {!team ? (
        <>
          {mode === "home" && <div className="g10-ab four"><button type="button" onClick={() => setMode("create")}><em>🏗️</em><b>Create a team</b><span>you get a 4-letter code</span></button><button type="button" onClick={() => setMode("join")}><em>🔑</em><b>Join a team</b><span>type your team's code</span></button><button type="button" onClick={() => { setTeam({ code: `OFF-${Date.now().toString(36).slice(-4).toUpperCase()}`, name: "", offline: true }); }}><em>📴</em><b>Offline team</b><span>no internet? type the names</span></button></div>}
          {mode === "create" && <div className="start-block"><h3>🏗️ Team name (you can change the brand later)</h3><input className="start-input" value={tName} maxLength={28} onChange={(e) => setTName(e.target.value)} placeholder="e.g. The Sweet Founders" /><div className="start-foot"><button className="s1-btn ghost" onClick={() => setMode("home")}>Back</button><button className="s1-btn primary" disabled={busy || tName.trim().length < 3} onClick={() => run("team_create", { name: tName.trim() })}>{busy ? "Creating…" : "Create my team"}</button></div></div>}
          {mode === "join" && <div className="start-block"><h3>🔑 Type your team's code</h3><input className="start-input p1-code-input" maxLength={4} value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="ABCD" /><div className="start-foot"><button className="s1-btn ghost" onClick={() => setMode("home")}>Back</button><button className="s1-btn primary" disabled={busy || code.length !== 4} onClick={() => run("team_join", { code })}>{busy ? "Joining…" : "Join the team"}</button></div></div>}
          {msg && <div className="p1-banner bad"><span>{msg}</span></div>}
        </>
      ) : (
        <>
          <div className="g11-teamcard">
            <div><small>TEAM CODE</small><b>{team.offline ? "OFFLINE" : team.code}</b>{!team.offline && <span>Share this code with your teammates.</span>}</div>
            <div>
              {team.offline ? <><input className="start-input" value={team.name} placeholder="Team name" onChange={(e) => setTeam({ ...team, name: e.target.value })} /><input className="start-input" value={offMembers} placeholder="Teammates' names, separated by commas" onChange={(e) => setOffMembers(e.target.value)} /></> : <><h3>👥 {team.name}</h3><p>{members.join(" · ") || "Waiting for teammates…"}</p><button type="button" className="p1-link" onClick={() => run("team_state")}><RefreshCw size={14} /> Refresh members</button></>}
            </div>
          </div>
          <div className="start-block"><h3>🎭 My role in the company</h3><div className="g10-ab four">{TEAM_ROLES.map(([k, e, l, d]) => <button key={k} type="button" className={role === k ? "on" : ""} onClick={() => setRole(k)}><em>{e}</em><b>{l}</b><span>{d}</span></button>)}</div><p className="start-tip">💡 Everybody does everything — your role means you are responsible for checking that part.</p></div>
          <div className="start-block"><h3>🧺 What kind of PHYSICAL product will you make?</h3><div className="g10-chips">{PRODUCT_CATS.map((c) => <button key={c} type="button" className={cat === c ? "on" : ""} onClick={() => setCat(c)}>{c}</button>)}</div><p className="start-tip">You will really make it, test it with customers and sell it. Choose something your team can produce in a kitchen or classroom.</p></div>
          <div className="start-block"><h3>🤝 Our team pact (3 rules)</h3>{rules.map((r, i) => <input key={i} className="start-input g11-gap" value={r} placeholder={["We always… (e.g. bring the materials we promised)", "When we disagree, we…", "If someone can't come, they…"][i]} onChange={(e) => setRules(rules.map((x, j) => (j === i ? e.target.value : x)))} />)}</div>
          {msg && <div className="p1-banner bad"><span>{msg}</span></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(24, { code: team.code, name: team.name, members, role, category: cat, rules, offline: !!team.offline })}>{ok ? "Seal our team pact" : "Choose role, product type and 3 rules"} <span className="coin-tag"><Coins size={15} /> +24</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- What I can do now (recapitulación con evidencias) ---------- */
const CAN_FACES = ["😬", "🙂", "💪", "🚀"];
function WhatICan({ title, items, resp, existing, onSave, onExit, brief }) {
  const [rate, setRate] = useState(existing?.rate || {});
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const G = [W_PAST, W_REASON, W_FUTURE];
  const ev = items.map((x) => { try { return x.ev(resp || {}); } catch (e) { return null; } });
  const ok = items.every((_, i) => rate[i]) && goalsOk(text, 30, 90, G);
  if (st.done) return <Reward title="Look what you can do! ✅" subtitle={`${ev.filter(Boolean).length}/${items.length} skills with evidence`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<BadgeCheck size={22} strokeWidth={2.1} />} title={title} subtitle="Every 'I can' comes with YOUR evidence from this period. Rate yourself honestly." onExit={onExit}>
      {brief}
      <div className="g11-can">{items.map((x, i) => (
        <div key={x.t} className={ev[i] ? "ok" : "no"}>
          <em>{ev[i] ? "✅" : "⏳"}</em>
          <div><b>{x.t}</b><span>{ev[i] || "No evidence yet — finish the activity to prove it."}</span></div>
          <div className="g11-faces">{CAN_FACES.map((f, k) => <button key={f} type="button" className={rate[i] === k + 1 ? "on" : ""} onClick={() => setRate({ ...rate, [i]: k + 1 })} title={["Not yet", "With help", "On my own", "I can teach it"][k]}>{f}</button>)}</div>
        </div>
      ))}</div>
      <p className="start-tip">😬 not yet · 🙂 with help · 💪 on my own · 🚀 I could teach it</p>
      <div className="start-block"><h3>✍️ What I'm proudest of — and what's next</h3><Starters items={["This period I learned to…", "I'm proud of… because…", "Next period I will…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={30} max={90} goals={G} placeholder="This period I learned to calculate my unit cost because… Next period I will…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(20, { rate, text, evidence: ev.filter(Boolean).length })}>Save my recap <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}

/* ---------- RADAR 11 · 5 pilares del Founder Year ---------- */
const RADAR11_DIMS = [{ k: "build", l: "Create Value" }, { k: "profit", l: "Price & Profit" }, { k: "fund", l: "Funding & Valuation" }, { k: "inv", l: "Investing & Risk" }, { k: "life", l: "Life Planning" }];
const RADAR11_Q = [
  { d: "build", q: "You want to start a small business at school. What do you do first?", o: ["Find a problem many students have and ask them about it.", "Copy the snack that sells the most in the cafeteria.", "Make the product I like most and see who buys it.", "Ask my parents for money to buy materials."], s: [3, 1, 2, 0] },
  { d: "build", q: "Five friends say they 'would buy' your idea. What does that tell you?", o: ["Something — but I need to see if they really pay.", "My idea is validated and ready to launch.", "Nothing at all: friends always lie.", "I should raise the price because demand is high."], s: [3, 1, 1, 0] },
  { d: "profit", q: "A cookie costs you $1,200 to make. How do you choose the price?", o: ["Cost + what customers pay for similar cookies + their value.", "Double the cost: $2,400, always.", "The cheapest price in school, to sell more.", "The price my friends say sounds good."], s: [3, 2, 1, 0] },
  { d: "profit", q: "You sold $500,000 this month. Are you rich?", o: ["It depends on costs: profit is what's left.", "Yes, $500,000 is a lot for a student.", "Only if I sold more than last month.", "Yes, if the money is already in my account."], s: [3, 0, 1, 1] },
  { d: "fund", q: "An investor offers $1,000,000 for 50% of your new company. You…", o: ["Calculate what that says my company is worth and negotiate.", "Accept: it's a lot of money.", "Say no: investors always want too much.", "Ask for $2,000,000 for 50% to look strong."], s: [3, 0, 1, 1] },
  { d: "fund", q: "To buy a $600,000 oven for your business you could…", o: ["Compare savings, a loan's total cost and a partner's share.", "Take the first loan the bank offers.", "Use the credit card and pay the minimum.", "Wait until I save all the money, whatever it takes."], s: [3, 1, 0, 2] },
  { d: "inv", q: "One company in your portfolio goes bankrupt. What protects you most?", o: ["Having many companies, like in an ETF.", "Having bought it at a low price.", "Selling all my other stocks quickly.", "Nothing: bankruptcy always destroys everything."], s: [3, 1, 0, 0] },
  { d: "inv", q: "Inflation is 5%. Where should your long-term savings go?", o: ["Somewhere that can beat inflation over time.", "Cash at home, so I can see it.", "A savings account at 1%, because it's safe.", "The asset that went up the most last month."], s: [3, 0, 1, 0] },
  { d: "life", q: "You dream of a university that costs a lot. What do you do?", o: ["Research the real cost, scholarships and a Plan B.", "Forget it: it's for rich people.", "Apply and see what happens later.", "Take the biggest loan possible."], s: [3, 0, 1, 0] },
  { d: "life", q: "At 18 you get $1,000,000. What's your first move?", o: ["Emergency fund first, then invest a part with a plan.", "Invest all of it in one stock I like.", "Spend half and save half in a piggy bank.", "Lend it to a friend who promises 20% more."], s: [3, 1, 1, 0] },
];
const RADAR11_NEW = [
  { d: "build", q: "Your product's sales fall for two weeks. You…", o: ["Ask customers why, test a change and measure.", "Lower the price 50% immediately.", "Make more posts with the same message.", "Close the business and start another."], s: [3, 1, 1, 0] },
  { d: "profit", q: "Selling more units is good when…", o: ["each unit still leaves a positive margin.", "the price is lower than the competition.", "I have many orders, whatever the cost.", "my friends like the product."], s: [3, 1, 0, 0] },
  { d: "fund", q: "A shark says: '$4,000,000 for 20%'. The implied valuation is…", o: ["$20,000,000.", "$4,000,000.", "$800,000.", "$16,000,000."], s: [3, 0, 0, 1] },
  { d: "inv", q: "Fees of 2% vs. 0.1% for 30 years…", o: ["make a huge difference because they compound.", "don't matter if returns are high.", "only matter for very rich investors.", "are the same after taxes."], s: [3, 0, 1, 0] },
  { d: "life", q: "Your dream university costs more than your family can pay. Your plan…", o: ["compares scholarships, ICETEX, savings and a possible university.", "is to take a loan for everything.", "is to give up studying.", "is to decide in 11th grade's last week."], s: [3, 1, 0, 0] },
];
const radarScores11 = (qs, ans) => { const o = {}; RADAR11_DIMS.forEach((d) => { const list = qs.map((q, i) => ({ q, i })).filter((x) => x.q.d === d.k); o[d.k] = list.length ? Math.round((list.reduce((a, x) => a + (ans[x.i] != null ? x.q.s[ans[x.i]] : 0), 0) / (list.length * 3)) * 100) : 0; }); return o; };
function radarProfile11(avg) {
  if (avg <= 35) return { l: "Starter Founder 🌱", d: "You have ideas. This year you'll turn them into numbers and plans." };
  if (avg <= 60) return { l: "Builder 🛠️", d: "You know the basics. Now: test, calculate and decide with data." };
  if (avg <= 82) return { l: "Strategist 📐", d: "You think like a founder AND like an investor." };
  return { l: "FinFluent Leader ⭐", d: "You connect business, money and life decisions." };
}

/* ---------- Estudio de pitch con evidencias + preguntas difíciles (P1, P2, P3, P4) ---------- */
function EvidenceBoard({ items }) {
  return <div className="g10-evid">{items.map((x) => <div key={x.k} className={x.ok ? "ok" : "no"}><em>{x.ok ? "✅" : "🔒"}</em><div><b>{x.e} {x.t}</b><span>{x.d}</span>{!x.ok && <i>To unlock: {x.fix}</i>}</div></div>)}</div>;
}
const joinAnd = (a) => (a.length <= 1 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);
const W_TOPIC = (l, words, n = 2, ex) => ({ l, ex: ex || words.slice(0, 4).join(" · "), test: (t) => { const s = (t || "").toLowerCase(); return words.filter((w) => s.includes(w.toLowerCase())).length >= n; } });
function QAStage({ title, intro, evidence, qa, setQa, items, ready, readyMsg, onNext, onExit, brief }) {
  const ok = items.every((x) => goalsOk(qa[x.k], x.min || 20, x.max || 70, x.goals));
  return (
    <ActShell icon={<Mic size={22} strokeWidth={2.1} />} title={title} subtitle={intro} onExit={onExit}>
      {brief}
      {!ready && <div className="p1-banner bad"><span>{readyMsg}</span></div>}
      {evidence && <div className="start-block"><h3>🔎 My evidence board · {evidence.filter((x) => x.ok).length}/{evidence.length} lines unlocked</h3><p className="start-tip">Each line of your certificate comes from a real activity. Missing lines don't appear on the certificate.</p><EvidenceBoard items={evidence} /></div>}
      <div className="start-block g10-boss"><h3>🦈 The hard questions</h3><p className="start-tip">Answer with the topic words, YOUR numbers and a reason.</p>
        {items.map((x) => <div key={x.k} className="g10-qa"><p className="quiz-q">{x.e} {x.q}</p><WordField value={qa[x.k] || ""} onChange={(v) => setQa({ ...qa, [x.k]: v })} min={x.min || 20} max={x.max || 70} rows={3} goals={x.goals} placeholder={x.ph} /></div>)}
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready || !ok} onClick={onNext}>{ok ? "Build my presentation 🎤" : "Answer all the questions"} <ChevronRight size={18} /></button></div>
    </ActShell>
  );
}

/* ---------- Juego genérico de decisiones por días (Launch Week, Cash Flow…) ---------- */
const fmtM = (v) => cop(v);

/* =====================================================================
   11° · PERIODO 3 · INVESTOR LAB 18+ & LIFE PLAN — LECTURAS Y VIDEOS
   ===================================================================== */
const VID_INFL11 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1794068117/videoplayback_41.mp4";
const VID_ETF11 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1794069697/videoplayback_49.mp4";
const VQ_INFL11 = [
  { q: "According to the video, what is the basic cause of inflation?", options: ["More money chasing the same goods and services.", "Companies produce less because tariffs are high.", "A government plan to make people save more.", "Prices that stay stable after a recession."], correct: 0, feedback: "Inflation happens when there is more money circulating than goods and services to spend it on — so prices go up." },
  { q: "How did government help during COVID-19 add to inflation later?", options: ["Stimulus checks pushed demand up very fast.", "Banks had to stop lending to their customers.", "The government paid all the shipping costs.", "The stock market closed for several months."], correct: 0, feedback: "Checks, unemployment benefits and subsidies put a lot of cash in people's hands, so spending and demand jumped." },
  { q: "What happens when demand is high but supply chains are broken?", options: ["Businesses can't deliver enough, so prices rise.", "People keep cash at home, so money moves slower.", "Interest rates fall on their own.", "Shops end up with too much stock."], correct: 0, feedback: "Lots of money + not enough products arriving = shortages, and businesses raise prices at the same time." },
  { q: "What makes a central bank different from a normal bank?", options: ["It manages the economy, not profits.", "It gives mortgages and credit cards to families.", "It is owned by small retail shareholders.", "It competes with other banks for clients."], correct: 0, feedback: "Commercial banks look for profit. The central bank 'babysits' the economy: jobs, growth and stable prices." },
  { q: "What do LOWER interest rates usually do?", options: ["Make loans cheaper, so people spend more.", "Make people save more and spend less.", "Stop inflation completely in a few weeks.", "Make the peso stronger against the dollar."], correct: 0, feedback: "Cheap borrowing encourages people and companies to take loans and spend — the economy speeds up." },
  { q: "What happens to your purchasing power with high inflation?", options: ["The same money buys fewer things.", "It goes up because salaries rise faster than prices.", "It stays the same if you don't spend your money.", "Your savings grow at the same speed as prices."], correct: 0, feedback: "As prices rise across the board, each bill buys less than it did before." },
  { q: "What does the central bank do to cool down spending and inflation?", options: ["It raises interest rates.", "It sends extra stimulus checks to families.", "It fixes the price of every product by law.", "It lowers interest rates to help businesses."], correct: 0, feedback: "Higher rates make loans expensive, so people borrow and spend less, and demand cools down." },
  { q: "What usually comes after a boom built on cheap credit?", options: ["A recession, with unsold goods and layoffs.", "A long period of zero inflation and stable prices.", "Even cheaper credit for every family and company.", "A return to the gold standard."], correct: 0, feedback: "When the stimulus ends and prices stay high, buyers disappear: factories close, people lose jobs." },
  { q: "What does the Venezuela example show about hyperinflation?", options: ["Money can become almost worthless.", "Printing more money fixed the problem quickly.", "People trust cash more when prices rise.", "Hyperinflation only affects rich families."], correct: 0, feedback: "In extreme hyperinflation, bills were worth more as material for crafts than as money." },
  { q: "According to the video, what keeps modern money working?", options: ["Trust: people believe it has value.", "Every bill is backed by gold in the central bank.", "Military treaties between countries.", "Smart contracts on the blockchain."], correct: 0, feedback: "Fiat money works because we all believe it is worth something. When trust falls, money breaks." },
  { q: "Why does the video call the central bank a 'puppet master'?", options: ["Its rates pull the strings of spending.", "It decides who wins the elections.", "It owns most of the companies in the country.", "It controls the prices in every shop directly."], correct: 0, feedback: "By moving interest rates, the central bank guides whether people spend or save." },
  { q: "What is the big lesson of the video?", options: ["Economies are fragile and depend on trust.", "Economies can grow forever without risk.", "Central banks never make mistakes.", "Spending doesn't change the economy much."], correct: 0, feedback: "Psychology, supply problems and money supply must stay in balance — small shocks can break it." },
];
const VQ_ETF11 = [
  { q: "How does the video describe the origin of an ETF?", options: ["The child of an index fund and a stock.", "A mix of a mutual fund and a bank.", "A new type of cryptocurrency created by banks.", "A savings account that trades on an exchange."], correct: 0, feedback: "It combines the best traits of both 'parents'." },
  { q: "What do ETFs inherit from index funds?", options: ["Passive, diversified and low cost.", "Active trading by expert managers.", "Guaranteed returns every year.", "High fees and fixed prices."], correct: 0, feedback: "Most ETFs track an index cheaply." },
  { q: "What do ETFs inherit from stocks?", options: ["They trade on an exchange during the day.", "They are bought once a year from the central bank.", "They pay dividends to every investor every week.", "Their price is fixed once a day."], correct: 0, feedback: "You can buy and sell them any time the market is open." },
  { q: "What is the 'basket' idea?", options: ["An ETF holds many real securities.", "An ETF is a vault of paper money.", "An ETF is a bet on one company.", "An ETF is a savings account."], correct: 0, feedback: "Bonds, stocks or even gold — inside one basket." },
  { q: "Why is a gold ETF useful with only $1,000?", options: ["No need to buy and store gold bars.", "Gold doubles in value every year.", "You don't pay any taxes on it.", "You receive gold coins at home."], correct: 0, feedback: "Small amounts, safe storage, easy to trade." },
  { q: "What are the two main attractions of ETFs?", options: ["Accessible and simple.", "Tax-free and insured.", "More leverage.", "Zero volatility."], correct: 0, feedback: "You don't need to be rich, and they're easy to own." },
  { q: "How are ETFs different from mutual funds on taxes (in the US)?", options: ["They rarely create yearly capital-gains taxes.", "They charge capital-gains taxes every month.", "Mutual funds pay no taxes at all.", "ETFs pay no taxes in any country."], correct: 0, feedback: "You usually pay when YOU sell with a profit." },
  { q: "How big was the ETF market in the video?", options: ["6,000+ ETFs, 60 exchanges, about $3 trillion.", "About 500 ETFs and $50 billion in total.", "A tiny, shrinking niche for experts.", "60,000 ETFs and about $300 trillion in many countries."], correct: 0, feedback: "A huge global market." },
  { q: "What comparison shows US ETF trading volume?", options: ["About $2 trillion a year, more than US GDP.", "About the same as all the world's oil exports.", "Less than the trading of one big company.", "All the retail spending in the US."], correct: 0, feedback: "(The video's figure — volumes change over time.)" },
  { q: "Why are passive ETFs cheaper than active funds?", options: ["They copy an index instead of paying stock pickers.", "The government pays part of their operating costs.", "Their commissions are forbidden by the law.", "Their managers work for free to get famous."], correct: 0, feedback: "Tracking an index costs much less." },
  { q: "What does the creation/redemption mechanism do?", options: ["Keeps the price close to the basket's NAV.", "Guarantees that investors never lose money.", "Fixes the price once a day.", "Removes all broker fees for every investor forever."], correct: 0, feedback: "Trading price stays close to the real value of the basket." },
  { q: "What is the video's conclusion about ETFs?", options: ["They are here to stay.", "They are a temporary fad.", "They will be banned soon.", "They'll replace all stocks."], correct: 0, feedback: "A permanent pillar of investing." },
];

/* ---------- Datos históricos (aproximados, para aprender) 2015–2024 ---------- */
const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
const DATA = {
  infl: [6.77, 5.75, 4.09, 3.18, 3.80, 1.61, 5.62, 13.12, 9.28, 5.20],      // inflación Colombia (DANE, %)
  cdt: [5.2, 6.9, 6.0, 4.7, 4.5, 3.4, 2.3, 9.0, 12.5, 10.0],                 // tasa CDT aprox. (% E.A.)
  trm: [2392, 3149, 3000, 2984, 3249, 3277, 3432, 3981, 4810, 3822, 4409],   // TRM fin de año 2014→2024 (aprox.)
  sp: [1.4, 12.0, 21.8, -4.4, 31.5, 18.4, 28.7, -18.1, 26.3, 25.0],          // S&P 500 retorno total (USD, %)
  bond: [0.6, 2.6, 3.5, 0.0, 8.7, 7.5, -1.5, -13.0, 5.5, 1.3],               // bonos EE. UU. (agregado, USD, %)
  gold: [-10.4, 8.6, 13.1, -1.6, 18.3, 25.1, -3.6, -0.3, 13.1, 27.2],         // oro (USD, %)
  btc: [35, 125, 1331, -73, 95, 303, 60, -64, 156, 121],                       // bitcoin (USD, %)
};
/* Retorno de un año en PESOS para cada activo */
const ASSET11 = [
  { k: "cash", e: "🛏️", l: "Cash at home (pesos)", c: "#7a6a58", r: () => 0 },
  { k: "cdt", e: "📜", l: "CDT / cajita (pesos)", c: "#3c9d5d", r: (i) => DATA.cdt[i] },
  { k: "usd", e: "💵", l: "US dollars", c: "#2e6b4a", r: (i) => (DATA.trm[i + 1] / DATA.trm[i] - 1) * 100 },
  { k: "bond", e: "🧱", l: "US bond ETF", c: "#8a7a4a", r: (i) => ((1 + DATA.bond[i] / 100) * (DATA.trm[i + 1] / DATA.trm[i]) - 1) * 100 },
  { k: "sp", e: "📈", l: "S&P 500 ETF", c: "#e0a03a", r: (i) => ((1 + DATA.sp[i] / 100) * (DATA.trm[i + 1] / DATA.trm[i]) - 1) * 100 },
  { k: "gold", e: "🥇", l: "Gold", c: "#c9a227", r: (i) => ((1 + DATA.gold[i] / 100) * (DATA.trm[i + 1] / DATA.trm[i]) - 1) * 100 },
  { k: "btc", e: "₿", l: "Bitcoin", c: "#c8563a", r: (i) => ((1 + DATA.btc[i] / 100) * (DATA.trm[i + 1] / DATA.trm[i]) - 1) * 100 },
];

/* ---------- R1 · El mapa de los activos ---------- */
const READ_MAP = [
  { node: <NewsHead key="n" s="YOUR MONEY" d="Special edition" k="A map of every place your money can live" /> },
  { h: "Seven homes for your money" },
  { p: "Every peso you save has to live somewhere. You can keep it under the mattress, lend it to a bank, lend it to a government, buy a small piece of a company, buy a foreign currency, buy a precious metal or buy a digital asset. Each of these 'homes' is called an asset class, and each one has a different personality." },
  { p: "Investors describe that personality with three questions. RISK: how much can the value go up and down? RETURN: how much do I expect to earn over time? LIQUIDITY: how fast can I turn it back into cash without losing money? No asset wins in all three. That is the most important rule of investing: higher expected returns come with higher risk." },
  { box: "🗺️ CASH: no risk of falling in pesos, but inflation eats it. CDT / cajita: safe and predictable, low return. BONDS: loans to governments or companies, moderate. STOCKS & ETFs: ownership, higher growth, big ups and downs. DOLLARS: protection when the peso falls. GOLD: a refuge in crises. CRYPTO: extreme volatility, possible huge gains or losses." },
  { h: "Liquidity: the forgotten question" },
  { p: "A CDT can pay a good rate, but if you need the money before the date, you may not be able to withdraw it. A house can be a good investment, but you cannot sell one bedroom when you need cash. That's why professionals keep an emergency fund in a very liquid place before they invest in anything that can fall or stay locked." },
  { h: "Time changes everything" },
  { p: "Over one year, stocks can fall 20% or more. Over twenty years, a diversified group of stocks has historically grown much more than savings accounts — but past results don't guarantee the future. Your time horizon — when you will need the money — decides how much risk you can take. Money for next month's bus tickets should not be in bitcoin. Money for when you are 40 can live in assets that move a lot, because it has time to recover." },
  { h: "The new investor at 18" },
  { p: "In Colombia, when you turn 18 and get your cédula, you can open accounts and investment products in your own name. Digital banks and apps make it possible to start with very small amounts. That is great news — and also a risk: social media is full of 'gurus' who promise impossible returns. Knowing the map is your first defense." },
  { list: ["Emergency money → liquid and safe (cajita, savings account).", "Goals in 1–3 years → predictable (CDT, short-term funds).", "Goals in 5+ years → growth with diversification (ETFs).", "Speculation → only money you can lose, and only a small part."] },
  { h: "What this means for your Investor Lab" },
  { p: "This period you will manage a simulated portfolio with REAL data from 2015 to 2024, test what inflation does to your money, analyze companies, study famous bankruptcies and build your own investment playbook for the day you turn 18. Start by placing every asset on the map." },
];
const GLOSS_MAP = { "asset class": "a group of investments with similar behavior", "liquidity": "how fast you can turn an asset into cash", "volatility": "how much a price goes up and down", "time horizon": "when you will need the money", "emergency fund": "money for unexpected problems, easy to use", "diversified": "spread among many different investments" };
const Q_MAP = [
  { q: "What are the three questions investors use to describe an asset?", options: ["Price, brand and country.", "Risk, return and liquidity.", "Size, age and popularity.", "Taxes, fees and design."], correct: 1, feedback: "Risk, return, liquidity." },
  { q: "What is the most important rule of investing, according to the text?", options: ["Higher expected returns come with higher risk.", "Cash at home is always the best investment.", "Crypto always beats stocks in the long run.", "Banks never lose money, so deposits always grow."], correct: 0, feedback: "No free lunch." },
  { q: "Why can a CDT be a problem for emergencies?", options: ["It pays a negative interest rate every month.", "It is not legal for young people under 25.", "You may not be able to withdraw before the date.", "Its value changes every day like a stock."], correct: 2, feedback: "Low liquidity." },
  { q: "Which asset is described as a 'refuge in crises'?", options: ["Bitcoin.", "Cash at home.", "Stocks.", "Gold."], correct: 3, feedback: "Gold is a traditional refuge." },
  { q: "Money you need next month should be…", options: ["liquid and safe.", "in bitcoin, to grow fast.", "in a 5-year CDT.", "in one tech stock."], correct: 0, feedback: "Short horizon → low risk, high liquidity." },
  { q: "Why can money for age 40 live in assets that move a lot?", options: ["Because the government protects it.", "Because it has time to recover from falls.", "Because stocks never fall over 20 years.", "Because crypto is safer for older people."], correct: 1, feedback: "Long horizon = time to recover (no guarantee)." },
  { q: "What new risk appears when investing becomes easy on apps?", options: ["Apps charge very high taxes.", "Banks close accounts of young people.", "'Gurus' promising impossible returns.", "Apps only accept dollars."], correct: 2, feedback: "Knowledge is your defense." },
  { q: "Where should speculation money go, according to the list?", options: ["All your savings, if the price is going up.", "Your emergency fund, because it is just waiting.", "The money you saved for your university.", "Only money you can lose, and only a small part."], correct: 3, feedback: "Small, and affordable to lose." },
];

/* ---------- R2 · Inflación en Colombia ---------- */
const READ_INFL = [
  { node: <NewsHead key="n" s="ECONOMY" d="Colombia, 2015 – 2024" k="Ten years of prices: the invisible tax" /> },
  { h: "The year everything got expensive" },
  { p: "In 2022, Colombian families felt something they had almost forgotten. Food, transport, rent — everything went up. According to DANE, the national statistics office, consumer prices rose 13.12% that year, the highest inflation in more than two decades. A family that spent 2,000,000 pesos a month on the same basket of goods needed about 2,262,000 pesos a year later." },
  { p: "The causes were global and local: the world was recovering from the pandemic, supply chains were broken, the war in Ukraine raised the prices of energy and fertilizers, and the Colombian peso lost value against the dollar, which made imported products more expensive. In response, the Banco de la República raised its interest rate many times, until it reached 13.25% in 2023, to cool down spending." },
  { box: "📊 Colombian inflation (DANE): 2015: 6.77% · 2016: 5.75% · 2017: 4.09% · 2018: 3.18% · 2019: 3.80% · 2020: 1.61% · 2021: 5.62% · 2022: 13.12% · 2023: 9.28% · 2024: 5.20%." },
  { h: "Why inflation is an invisible tax" },
  { p: "Inflation doesn't take money out of your wallet. It does something quieter: the same bills buy less every year. If you kept 1,000,000 pesos under your mattress from January 2015 to December 2024, you would still have 1,000,000 pesos — but, using the DANE numbers, prices rose about 75% in those ten years. Your money would buy roughly what 570,000 pesos bought in 2015." },
  { h: "Nominal vs. real return" },
  { p: "A bank account that pays 5% when inflation is 9% gives you a positive NOMINAL return (you have more pesos) but a negative REAL return (you can buy less). The real return is approximately the rate minus inflation. The exact formula is (1 + rate) ÷ (1 + inflation) − 1. Investors care about real returns, because what matters is what your money can buy." },
  { list: ["Rate 12%, inflation 9% → real return ≈ 2.75%.", "Rate 4%, inflation 9% → real return ≈ −4.6%.", "Cash at home, inflation 13% → real return ≈ −11.5%."] },
  { h: "Who wins and who loses" },
  { p: "Inflation hurts people who keep cash and people with fixed incomes, like many retirees. It can help people with debts at fixed rates, because they pay back with money that is worth less. Assets like stocks, real estate or dollars sometimes protect purchasing power over long periods — but not every year, and not always." },
  { h: "What this means for you" },
  { p: "Inflation is the first enemy of a saver. Before you choose any investment, ask: will this beat inflation over my time horizon? This week you will run ten years of REAL Colombian data and see which 'homes' protected the money — and which ones lost it." },
];
const GLOSS_INFL = { "DANE": "Colombia's national statistics office", "basket": "a group of products used to measure prices", "nominal return": "how much your money grows in pesos", "real return": "how much your purchasing power grows after inflation", "fixed income": "an income that doesn't change, like some pensions", "purchasing power": "how much you can buy with your money" };
const Q_INFL = [
  { q: "What was Colombia's inflation in 2022, according to DANE?", options: ["5.62%.", "13.12%.", "9.28%.", "3.18%."], correct: 1, feedback: "The highest in more than two decades." },
  { q: "Which was NOT a cause of the 2022 inflation, according to the text?", options: ["Broken supply chains.", "Higher energy prices after the war in Ukraine.", "Higher energy prices after the war in Ukraine started in 2022.", "A big fall in world demand for food."], correct: 3, feedback: "Demand was recovering, not falling." },
  { q: "What did the Banco de la República do?", options: ["It raised its interest rate many times.", "It printed more money to help families buy food.", "It fixed the prices of food and fuel for a year.", "It closed the banks for a month."], correct: 0, feedback: "Higher rates cool spending." },
  { q: "Why is inflation called an 'invisible tax'?", options: ["The government collects it secretly.", "Banks charge it every month.", "The same money buys less every year.", "It only affects invisible products."], correct: 2, feedback: "It takes purchasing power, not bills." },
  { q: "Rate 4%, inflation 9%. Real return?", options: ["About +13%.", "About +5%.", "About −4.6%.", "Exactly 0%."], correct: 2, feedback: "(1.04 ÷ 1.09) − 1 ≈ −4.6%." },
  { q: "Who can benefit from inflation?", options: ["People with fixed-rate debts.", "People who keep cash at home.", "Retirees with fixed pensions.", "Savers with low-rate accounts."], correct: 0, feedback: "They repay with cheaper money." },
  { q: "$1,000,000 under the mattress 2015–2024 buys about…", options: ["the same as in 2015.", "what $1,750,000 bought in 2015.", "what $570,000 bought in 2015.", "what $1,000 bought in 2015."], correct: 2, feedback: "Prices rose about 75%." },
  { q: "What should you ask before choosing an investment?", options: ["Is it popular on social media this month?", "Will it beat inflation over my time horizon?", "Is it the newest product that the bank offers?", "Do my friends and my family have it too?"], correct: 1, feedback: "Real returns matter." },
];

/* ---------- R3 · Leer una empresa ---------- */
const READ_COMPANY = [
  { node: <NewsHead key="n" s="MARKETS" d="Explainer" k="How to read a company in five numbers" /> },
  { h: "Buying a piece of a business" },
  { p: "When you buy a share of a company, you are not buying a ticker on a screen; you are buying a small piece of a real business with customers, employees, debts and competitors. Professional analysts read the company before they look at the price. You don't need a finance degree to do the basics. Five numbers tell most of the story." },
  { h: "1. Revenue growth" },
  { p: "Are sales growing? A company whose revenue grows 15% a year is gaining customers or charging more. Revenue that falls year after year can be a warning — unless the company is doing it on purpose to focus on more profitable products." },
  { h: "2. Profit margin" },
  { p: "Of every 100 dollars of sales, how many remain as profit? A net margin of 20% means 20 dollars. High margins often mean a strong brand or a product that is hard to copy. Thin margins mean that a small increase in costs can turn profit into loss — remember your own company in Period 2." },
  { h: "3. Debt" },
  { p: "Debt is not always bad: it can finance growth. But a company with too much debt must pay interest even in bad years. Analysts compare debt with profits or with the company's own capital. When interest rates rise, very indebted companies suffer first." },
  { h: "4. Price-to-earnings ratio (P/E)" },
  { p: "The P/E ratio divides the share price by the profit per share. A P/E of 20 means investors pay 20 dollars for every dollar of annual profit. A high P/E shows that investors expect strong growth; a very low P/E can mean a bargain — or a company in trouble. The number only makes sense compared with similar companies." },
  { h: "5. Cash flow" },
  { p: "Profit is an accounting number; cash is what pays salaries and debts. A healthy company generates more cash from its operations than it consumes. You learned this lesson with your own company: profitable on paper is not the same as alive in real life." },
  { box: "🔎 The 5 numbers: REVENUE GROWTH · NET MARGIN · DEBT · P/E · CASH FLOW. Read them together, compare with competitors and look at several years — never just one." },
  { h: "Price vs. value" },
  { p: "The famous investor Warren Buffett often repeats an idea from his teacher Benjamin Graham: 'Price is what you pay; value is what you get.' A great company can be a bad investment if you pay too much for it, and an average company can be a good investment at a low price. Analysts try to estimate value and then wait for a reasonable price." },
  { h: "What this means for you" },
  { p: "This week you will analyze fictional companies with these five numbers and then research a real company on your tablet. Then you will discover why most professionals still recommend something simpler for most people: buying many companies at once through an ETF." },
];
const GLOSS_COMPANY = { "ticker": "the short code of a stock, like AAPL", "analyst": "a professional who studies companies", "net margin": "% of sales left as profit", "P/E ratio": "price ÷ profit per share", "bargain": "something cheap compared with its value", "indebted": "with a lot of debt" };
const Q_COMPANY = [
  { q: "What are you really buying with a share?", options: ["A code on a screen with no real value behind it.", "A small piece of a real business.", "A loan that you give to the company.", "A product that the company sells."], correct: 1, feedback: "Ownership of a business." },
  { q: "A net margin of 20% means…", options: ["sales grew 20% compared with last year.", "debt is 20% of the company's profit this year.", "20 of every 100 dollars of sales remain as profit.", "the share price rose 20% in the last twelve months."], correct: 2, feedback: "Profit ÷ sales." },
  { q: "When interest rates rise, who suffers first?", options: ["Very indebted companies.", "Companies with no debt.", "Companies with high margins.", "Investors in cash."], correct: 0, feedback: "More interest to pay." },
  { q: "A P/E of 20 means investors pay…", options: ["$20 for each share in the stock market.", "20% interest every year for investors.", "20 years of salary of the company's CEO.", "$20 for each $1 of annual profit."], correct: 3, feedback: "Price ÷ earnings per share." },
  { q: "A very low P/E can mean…", options: ["always a bargain that you must buy now.", "always a bad company that will fail.", "a bargain — or a company in trouble.", "the company pays no taxes this year."], correct: 2, feedback: "Compare with similar companies." },
  { q: "Why is cash flow important?", options: ["Cash pays salaries and debts; profit is an accounting number.", "It is the same as revenue, so it shows all the sales of the year.", "It decides the logo and the brand of the company.", "It replaces the P/E ratio when the price is high."], correct: 0, feedback: "Alive vs. profitable on paper." },
  { q: "'Price is what you pay; value is what you get' means…", options: ["expensive stocks are always better than cheap ones.", "a great company can be a bad investment if you overpay.", "value and price are always exactly the same thing.", "you should never buy cheap companies in a crisis."], correct: 1, feedback: "Graham & Buffett's idea." },
  { q: "What simpler option do most professionals recommend for most people?", options: ["Buying one famous company that everybody knows.", "Trading every day to catch the best prices.", "Keeping all your money in cash at home.", "Buying many companies through an ETF."], correct: 3, feedback: "Diversification made easy." },
];

/* ---------- R4 · Cuatro quiebras ---------- */
const READ_COLLAPSE = [
  { node: <NewsHead key="n" s="FINANCIAL HISTORY" d="2001 – 2022" k="Four collapses every investor should remember" /> },
  { h: "Enron, 2001: profits that didn't exist" },
  { p: "Enron was an American energy company admired by investors and magazines. Its stock price rose for years. Behind the success, executives were hiding debts and losses in complicated companies outside the official books. In 2001 the truth came out, the share price collapsed from around 90 dollars to less than one, and the company went bankrupt. Thousands of employees lost their jobs — and many lost their retirement savings, because they had invested them in Enron's own shares." },
  { h: "Lehman Brothers, 2008: borrowed money and risky loans" },
  { p: "Lehman Brothers was one of the biggest investment banks in the United States, with more than 150 years of history. It borrowed huge amounts of money to invest in securities connected to risky home loans. When house prices fell, those investments lost value and nobody wanted to lend Lehman more money. On September 15, 2008, it filed the largest bankruptcy in US history, and the global financial crisis exploded." },
  { h: "Interbolsa, 2012: Colombia's biggest broker" },
  { p: "Interbolsa was the largest stockbroker in Colombia. In November 2012 it could not pay a debt of around 20,000 million pesos, and the authorities took control of it. Investigations showed that the firm had been used to inflate the price of a company's shares artificially and that clients' money had been put at risk. Thousands of investors were affected. It became the biggest financial scandal in Colombia in decades." },
  { h: "FTX, 2022: the crypto exchange that used clients' money" },
  { p: "FTX was one of the largest cryptocurrency exchanges in the world, promoted by celebrities and sports stadiums. In November 2022, reports revealed that it had used customers' deposits for risky bets through a related company. Customers rushed to withdraw their money, FTX couldn't pay, and it went bankrupt in a few days. Its founder was later convicted of fraud in the United States." },
  { box: "🚩 Common red flags: numbers nobody can explain · huge debt · promises of easy, guaranteed profits · clients' money mixed with the company's money · employees or clients putting ALL their savings in one place · celebrity marketing instead of transparent information." },
  { h: "The lesson of diversification" },
  { p: "In all four cases, the people who lost the most were those with all or most of their money in ONE company or ONE platform. An investor who owned an index fund with 500 companies barely noticed Enron's collapse, because it was a tiny part of the basket. Diversification does not prevent crises, but it prevents one disaster from destroying everything you have." },
  { h: "What this means for you" },
  { p: "This week you will become a bankruptcy detective: you will read the data of companies before their fall and look for red flags. Then you will compare what happens to an investor with one stock and an investor with an ETF when a company goes to zero." },
];
const GLOSS_COLLAPSE = { "bankrupt": "unable to pay debts; the company fails", "investment bank": "a bank that invests and helps companies raise money", "securities": "financial products like stocks and bonds", "stockbroker": "a company that buys and sells shares for clients", "exchange": "a platform to buy and sell assets", "convicted": "found guilty by a court", "fraud": "lying to get money illegally" };
const Q_COLLAPSE = [
  { q: "What was Enron hiding?", options: ["Its best products and its plans for new ones.", "Debts and losses outside the official books.", "The names and phone numbers of its clients.", "Its secret profits from contracts with the government."], correct: 1, feedback: "Profits that didn't exist." },
  { q: "Why did many Enron employees lose their retirement savings?", options: ["They had invested them in Enron's own shares.", "The government took them.", "They kept them in cash.", "They bought bonds of other energy companies."], correct: 0, feedback: "No diversification." },
  { q: "What caused Lehman Brothers' fall?", options: ["A fire in its offices that destroyed its computers.", "A crypto crash that destroyed all of its investments in a single week.", "Borrowed money invested in securities tied to risky home loans.", "A scandal with its logo and its advertising on TV in 2008."], correct: 2, feedback: "Leverage + risky mortgages." },
  { q: "When did Lehman Brothers file for bankruptcy?", options: ["November 2012, in New York.", "December 2001, after Enron.", "November 2022, with FTX.", "September 15, 2008."], correct: 3, feedback: "The largest bankruptcy in US history." },
  { q: "What was Interbolsa?", options: ["The largest stockbroker in Colombia.", "A crypto exchange in the Bahamas.", "A big US investment bank in New York.", "An energy company in Texas."], correct: 0, feedback: "November 2012." },
  { q: "What did FTX do with customers' deposits?", options: ["It kept them safe in a bank vault in New York, without using them.", "It used them for risky bets through a related company.", "It returned them to clients with interest every month.", "It invested them in safe government bonds."], correct: 1, feedback: "Clients' money mixed with company bets." },
  { q: "Which one is a red flag?", options: ["Clear, audited financial statements.", "Diversified investments.", "Guaranteed, easy profits.", "Moderate debt."], correct: 2, feedback: "Guaranteed easy profits = danger." },
  { q: "Who lost the most in these collapses?", options: ["Investors with diversified ETFs of many companies.", "People with emergency funds in supervised banks and cooperatives.", "Governments that regulated the companies and their banks.", "People with most of their money in ONE company or platform."], correct: 3, feedback: "Concentration risk." },
];

/* ---------- R5 · A los 18 en Colombia ---------- */
const READ_AT18 = [
  { node: <NewsHead key="n" s="YOUNG MONEY" d="Colombia" k="Your cédula, your money: a guide for the day you turn 18" /> },
  { h: "A new financial life" },
  { p: "Turning 18 in Colombia changes your financial life overnight. With your cédula de ciudadanía you can sign contracts, open bank accounts in your own name, invest, receive a salary in your account and — if a bank approves you — get your first credit card. You also become responsible: every contract you sign and every debt you take is legally yours." },
  { h: "Where you can put your money" },
  { list: ["Savings accounts and digital 'cajitas' or pockets in banks and fintechs: liquid, simple, usually covered by deposit insurance (Fogafín) if the entity is supervised.", "CDTs: a fixed rate for a fixed time; good for goals with a date.", "Collective investment funds (FICs): managed funds with different risk levels, some from small amounts.", "Shares and ETFs: through a stockbroker (comisionista de bolsa) or authorized international platforms; prices go up and down.", "Dollars: through accounts or investments in dollars; they protect you when the peso falls, but the dollar can also fall."] },
  { box: "🛡️ Before any investment, check that the entity is supervised by the Superintendencia Financiera de Colombia. If an offer promises guaranteed high returns and asks you to invite friends, walk away." },
  { h: "Paying for your future studies" },
  { p: "For many families, the biggest financial decision after school is university. Tuition varies enormously: some public universities charge according to the family's income, while some private universities charge more than ten million pesos per semester. Costs also include transport, food, materials, technology and — if you study in another city — housing." },
  { p: "There are several ways to pay: family support, personal savings, scholarships from universities or companies (many give discounts for excellent Saber 11 results or for talent in sports and arts), part-time work, and student loans, such as those from ICETEX or banks. A loan can open the door to a career, but you must understand the total cost and the monthly payment you will have when you graduate." },
  { h: "Dream university and possible university" },
  { p: "Financial planners recommend comparing two scenarios: the 'dream' option and a 'possible' option that your family can afford with less debt. Calculate the full cost of the career, not just one semester; tuition usually rises every year. Then build a funding plan and calculate the gap — the money you still don't have. A gap is not a reason to give up; it is a number you can work on: more savings, a scholarship, a different city or a technical program first." },
  { h: "Your first credit" },
  { p: "A small credit card used carefully — small purchases, paid in full every month — can start a good credit history in the credit bureaus. Paying late, lending your name for someone else's debt or using the whole limit can damage it for years." },
  { h: "What this means for you" },
  { p: "This week you will research real universities and careers on your tablet, calculate five semesters of costs in two scenarios and design what you will do with your first 1,000,000 pesos at 18. It's not a game anymore: it's the plan for the next chapter of your life." },
];
const GLOSS_AT18 = { "cédula": "the Colombian national ID card you get at 18", "fintech": "a technology company that offers financial services", "Fogafín": "the institution that insures deposits in supervised banks", "comisionista de bolsa": "a stockbroker authorized to buy and sell shares", "ICETEX": "a Colombian public entity that gives student loans", "gap": "the money you still need to reach a goal" };
const Q_AT18 = [
  { q: "What changes legally when you turn 18?", options: ["You can sign contracts and open accounts in your own name.", "You must buy a house.", "You must pay income tax immediately.", "You can't use your parents' accounts or cards anymore."], correct: 0, feedback: "Rights and responsibilities." },
  { q: "Which product is best for a goal with a fixed date?", options: ["Bitcoin.", "A CDT.", "A credit card.", "Cash at home."], correct: 1, feedback: "Fixed rate, fixed time." },
  { q: "How can you buy shares or ETFs?", options: ["Only through a friend who already invests.", "At any supermarket, pharmacy or neighborhood store.", "Through a stockbroker or authorized platforms.", "Only if you are 25 years old or older."], correct: 2, feedback: "Comisionistas or authorized platforms." },
  { q: "What should you check BEFORE investing with an entity?", options: ["How many followers it has on social media.", "If it pays the highest return of all the options you can find online.", "If famous celebrities recommend it on TV.", "If it is supervised by the Superintendencia Financiera."], correct: 3, feedback: "Supervision first." },
  { q: "Which cost is often forgotten when planning university?", options: ["Transport, food, materials and housing.", "The color of the uniform.", "The color of the university's uniform and its sweaters.", "The price of the ICFES certificate only."], correct: 0, feedback: "Living costs add up." },
  { q: "What is a 'possible' university scenario?", options: ["The most expensive option, because it is the best.", "An option your family can afford with less debt.", "Studying abroad without a plan or a budget.", "Not studying at all and working full-time."], correct: 1, feedback: "Compare dream vs. possible." },
  { q: "What is the 'gap'?", options: ["The years between school and work.", "The interest that you pay on a loan every month.", "The money you still need to reach your goal.", "The difference between two universities' rankings."], correct: 2, feedback: "A number you can work on." },
  { q: "Which action DAMAGES your credit history?", options: ["Small purchases that you pay in full every month.", "Paying the card before the due date.", "Using a small part of your credit limit.", "Lending your name for someone else's debt."], correct: 3, feedback: "Their debt becomes yours." },
];

/* =====================================================================
   11° · PERIODO 3 · INVESTOR LAB 18+ & LIFE PLAN — ACTIVIDADES
   ===================================================================== */
/* Valor en el tiempo de $1 en un activo desde el año de inicio (índice) */
const pathOf = (k, from = 0, to = 10) => { const A = ASSET11.find((x) => x.k === k); const out = [1]; for (let i = from; i < to; i++) out.push(out[out.length - 1] * (1 + A.r(i) / 100)); return out; };
const inflPath = (from = 0, to = 10) => { const out = [1]; for (let i = from; i < to; i++) out.push(out[out.length - 1] * (1 + DATA.infl[i] / 100)); return out; };
const cagr = (mult, years) => (years > 0 ? (Math.pow(mult, 1 / years) - 1) * 100 : 0);
const mCOP = (v) => `$${(v / 1000000).toFixed(v >= 10000000 ? 1 : 2)}M`;

/* ---------- C1 · Asset Map (riesgo × retorno + liquidez) ---------- */
const MAP_ASSETS = [
  { k: "cash", e: "🛏️", l: "Cash at home", r: 1, t: 1, q: 5 }, { k: "acc", e: "📲", l: "Cajita / savings", r: 1, t: 2, q: 5 }, { k: "cdt", e: "📜", l: "CDT 1 year", r: 1, t: 2, q: 1 },
  { k: "bond", e: "🧱", l: "Bond fund", r: 2, t: 2, q: 4 }, { k: "usd", e: "💵", l: "US dollars", r: 3, t: 2, q: 5 }, { k: "gold", e: "🥇", l: "Gold", r: 3, t: 3, q: 4 },
  { k: "sp", e: "📈", l: "S&P 500 ETF", r: 4, t: 4, q: 4 }, { k: "one", e: "🚀", l: "One tech stock", r: 5, t: 4, q: 4 }, { k: "house", e: "🏠", l: "A house to rent", r: 3, t: 3, q: 1 }, { k: "btc", e: "₿", l: "Bitcoin", r: 5, t: 5, q: 4 },
];
function AssetMap({ existing, onSave, onExit }) {
  const [pos, setPos] = useState(existing?.pos || {});
  const [liq, setLiq] = useState(existing?.liq || {});
  const [sel, setSel] = useState(null);
  const [checked, setChecked] = useState(false);
  const [st, finish] = useFinish(onSave);
  const placed = MAP_ASSETS.filter((a) => pos[a.k] && liq[a.k]).length;
  const near = (a) => pos[a.k] && Math.abs(pos[a.k].r - a.r) <= 1 && Math.abs(pos[a.k].t - a.t) <= 1 && Math.abs((liq[a.k] || 0) - a.q) <= 1;
  const score = MAP_ASSETS.filter(near).length;
  if (st.done) return <Reward title="Asset map drawn! 🗺️" subtitle={`${score}/10 close to the experts`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<MapIcon size={22} strokeWidth={2.1} />} title="Asset Map Builder 🗺️" subtitle="Tap an asset, then tap its place on the map (risk → / return ↑). Then rate its liquidity." onExit={onExit}>
      <Brief91 k="c1_map" />
      <div className="g10-chips">{MAP_ASSETS.map((a) => <button key={a.k} type="button" className={`${sel === a.k ? "on" : ""} ${pos[a.k] ? "g11-placed" : ""}`} onClick={() => setSel(a.k)}>{a.e} {a.l}</button>)}</div>
      <div className="g10-two">
        <div className="g11-map"><span className="y">RETURN ↑</span><span className="x">RISK →</span>
          {[5, 4, 3, 2, 1].map((t) => [1, 2, 3, 4, 5].map((r) => { const here = MAP_ASSETS.filter((a) => pos[a.k]?.r === r && pos[a.k]?.t === t); return <button key={`${r}${t}`} type="button" style={{ gridColumn: r + 1, gridRow: 6 - t }} onClick={() => { if (sel) { setPos({ ...pos, [sel]: { r, t } }); setChecked(false); } }}>{here.map((a) => <i key={a.k} className={checked ? (near(a) ? "ok" : "no") : ""}>{a.e}</i>)}</button>; }))}
        </div>
        <div className="start-block"><h3>💧 Liquidity (1 = locked · 5 = cash today)</h3>{MAP_ASSETS.filter((a) => pos[a.k]).map((a) => <div key={a.k} className="g11-rate"><small>{a.e} {a.l}</small>{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={liq[a.k] === n ? "on" : ""} onClick={() => { setLiq({ ...liq, [a.k]: n }); setChecked(false); }}>{n}</button>)}</div>)}</div>
      </div>
      {placed === 10 && <div className="start-foot"><button className="s1-btn ghost big" onClick={() => setChecked(true)}>Compare with the experts</button></div>}
      {checked && <><MiniTable head={["Asset", "Your risk/return/liq.", "Experts", ""]} rows={MAP_ASSETS.map((a) => [`${a.e} ${a.l}`, `${pos[a.k]?.r}/${pos[a.k]?.t}/${liq[a.k]}`, `${a.r}/${a.t}/${a.q}`, near(a) ? "✅" : "🔁"])} /><p className="start-tip">💡 No asset is top-left (high return, no risk). If you see one, it's probably a scam.</p></>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!checked} onClick={() => finish(18 + score * 2, { pos, liq, score })}>Save my map <span className="coin-tag"><Coins size={15} /> +{18 + score * 2}</span></button></div>
    </ActShell>
  );
}

/* ---------- C1 · Investor DNA 2.0 ---------- */
const DNA2 = [
  { q: "You invested $1,000,000 and it falls to $800,000 in a month. You…", o: ["Sell everything to stop the pain.", "Sell half.", "Check why and keep the plan.", "Buy more: it's cheaper now."], s: [0, 1, 2, 3] },
  { q: "When will you use this money?", o: ["In less than 1 year.", "In 1–3 years.", "In 3–7 years.", "In more than 7 years."], s: [0, 1, 2, 3] },
  { q: "Choose a 1-year result:", o: ["+5% sure.", "Between 0% and +10%.", "Between −10% and +25%.", "Between −40% and +80%."], s: [0, 1, 2, 3] },
  { q: "Do you have an emergency fund?", o: ["No.", "A little (less than 1 month).", "Yes, 1–3 months.", "Yes, more than 3 months."], s: [0, 1, 2, 3] },
  { q: "How much do you understand what you invest in?", o: ["Almost nothing.", "A little.", "The basics.", "Quite well."], s: [0, 1, 2, 3] },
  { q: "If you lose 30% for a year, your life…", o: ["changes a lot (I need that money).", "gets harder.", "is a bit uncomfortable.", "doesn't change."], s: [0, 1, 2, 3] },
  { q: "Your friends are making money with a new coin. You…", o: ["Put everything in it now.", "Put half.", "Investigate first and maybe put a small part.", "Ignore it: not my plan."], s: [0, 1, 3, 2] },
  { q: "What's more important for you?", o: ["Never losing money.", "Small, steady growth.", "Growth with some ups and downs.", "Maximum growth, whatever the ride."], s: [0, 1, 2, 3] },
];
const PROF11 = { con: { l: "Conservative 🛡️", lo: 1, hi: 2.2, d: "Safety first. Most of your money in liquid, predictable assets." }, mod: { l: "Moderate ⚖️", lo: 2.2, hi: 3.4, d: "Growth with controlled ups and downs." }, agg: { l: "Aggressive 🚀", lo: 3.2, hi: 4.6, d: "Long horizon, high tolerance: more growth assets." } };
function InvestorDNA2({ existing, onSave, onExit }) {
  const [ans, setAns] = useState(existing?.answers || {});
  const [i, setI] = useState(0);
  const [st, finish] = useFinish(onSave);
  const done = Object.keys(ans).length === DNA2.length && i >= DNA2.length;
  const score = DNA2.reduce((a, q, k) => a + (ans[k] != null ? q.s[ans[k]] : 0), 0);
  const prof = score <= 8 ? "con" : score <= 16 ? "mod" : "agg";
  if (st.done) return <Reward title={`You are ${PROF11[prof].l}`} subtitle="Your profile guides your Lab portfolio." coins={st.coins} saving={st.saving} onExit={onExit} />;
  if (!done) { const q = DNA2[Math.min(i, DNA2.length - 1)]; return (
    <div className="s1-quiz"><div className="quiz-top"><h2>🧬 Investor DNA 2.0</h2><span className="quiz-count">{i + 1} / {DNA2.length}</span></div>{i === 0 && <Brief91 k="c1_dna" />}<p className="quiz-q">{q.q}</p>
      <div className="quiz-options">{q.o.map((o, k) => <button key={k} type="button" className={`quiz-opt ${ans[i] === k ? "correct" : ""}`} onClick={() => setAns({ ...ans, [i]: k })}><span className="opt-key">{"ABCD"[k]}</span><span className="opt-text">{o}</span></button>)}</div>
      <div className="quiz-nav"><button className="s1-btn ghost" onClick={() => (i > 0 ? setI(i - 1) : onExit())}>{i > 0 ? "Back" : "Exit"}</button><button className="s1-btn primary" disabled={ans[i] == null} onClick={() => setI(i + 1)}>{i < DNA2.length - 1 ? "Next" : "See my DNA"} <ChevronRight size={18} /></button></div></div>
  ); }
  const P = PROF11[prof];
  return (
    <ActShell icon={<Brain size={22} strokeWidth={2.1} />} title="My Investor DNA 2.0 🧬" subtitle="Need + ability + willingness to take risk." onExit={onExit}>
      <div className="g10-dna"><em>{P.l.split(" ").pop()}</em><div><small>MY INVESTOR PROFILE · SCORE {score}/24</small><b>{P.l}</b><p>{P.d} Target portfolio risk: {P.lo}–{P.hi}.</p></div></div>
      <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(24, { profile: prof, score, answers: ans })}>Save my DNA <span className="coin-tag"><Coins size={15} /> +24</span></button></div>
    </ActShell>
  );
}

/* ---------- C1 · Lab Portfolio $10,000,000 ---------- */
const RISK11 = { cash: 1, cdt: 1, usd: 3, bond: 2, sp: 4, gold: 3, btc: 5 };
function LabPortfolio({ resp, existing, onSave, onExit }) {
  const prof = resp?.c1_dna?.profile || "mod"; const P = PROF11[prof];
  const [al, setAl] = useState(existing?.alloc || { cash: 0, cdt: 0, usd: 0, bond: 0, sp: 0, gold: 0, btc: 0 });
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const sum = Object.values(al).reduce((a, v) => a + v, 0); const risk = r2(ASSET11.reduce((a, x) => a + ((al[x.k] || 0) / 100) * RISK11[x.k], 0));
  const coherent = risk >= P.lo - 0.1 && risk <= P.hi + 0.1; const maxOne = Math.max(...Object.values(al));
  const G = [W_REASON, { l: "If… (risk)", ex: "If the peso falls, …", re: /\bif\b[^.]*\b(will|would|'ll|might|could)\b/i }, W_TOPIC("Use 2 investing words", ["risk", "return", "diversif", "inflation", "dollar", "liquid", "horizon"], 2)];
  const ok = sum === 100 && maxOne <= 50 && goalsOk(text, 30, 80, G);
  if (st.done) return <Reward title="Lab portfolio opened! 🧪" subtitle={`$10,000,000 · risk ${risk}/5`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<PieChart size={22} strokeWidth={2.1} />} title="Investor Lab · $10,000,000 🧪" subtitle="Your simulated portfolio will travel through REAL data 2015–2024 in Class 6. Split it now — no peeking!" onExit={onExit}>
      <Brief91 k="c1_alloc" />
      <div className="g10-dna small"><em>{P.l.split(" ").pop()}</em><div><small>MY PROFILE</small><b>{P.l}</b><p>Target risk {P.lo}–{P.hi}</p></div></div>
      <AllocBars items={ASSET11.map((x) => ({ ...x, d: `risk ${RISK11[x.k]}/5` }))} vals={al} set={setAl} step={5} />
      <div className="g10-two"><div className="start-block"><Gauge91 label="Portfolio risk (1–5)" value={risk} max={5} unit="" target={P.hi} targetLabel="your max" good={coherent} /><div className="g91-mini"><span className={coherent ? "pos" : "neg"}>Fits my profile <b>{coherent ? "✓" : "✗"}</b></span><span className={maxOne <= 50 ? "pos" : "neg"}>Max 50% in one <b>{maxOne <= 50 ? "✓" : "✗"}</b></span></div></div>
        <div className="start-block"><PctBar parts={ASSET11.map((x) => ({ label: `${x.e} ${x.l}`, value: al[x.k] || 0, color: x.c }))} /></div></div>
      <div className="start-block"><h3>✍️ Why this mix?</h3><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="I put 40% in the S&P 500 because my horizon is long. If the peso falls, my dollars will…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(28 + (coherent ? 6 : 0), { alloc: al, risk, profile: prof, coherent, text })}>{sum !== 100 ? `Assign 100% (${sum}%)` : "Open my Lab portfolio"} <span className="coin-tag"><Coins size={15} /> +{28 + (coherent ? 6 : 0)}</span></button></div>
    </ActShell>
  );
}

/* ---------- C2 · Inflation Simulator (datos reales DANE + mercados) ---------- */
function InflationSim({ existing, onSave, onExit }) {
  const [from, setFrom] = useState(existing?.from ?? 0);
  const [beat, setBeat] = useState(existing?.beat || []);
  const [checked, setChecked] = useState(false);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const yrs = 10 - from; const ip = inflPath(from); const end = ip[ip.length - 1];
  const res = ASSET11.map((a) => { const p = pathOf(a.k, from); const m = p[p.length - 1]; return { ...a, p, m, real: m / end }; });
  const truth = res.filter((x) => x.real > 1).map((x) => x.k);
  const okBeat = checked && truth.every((k) => beat.includes(k)) && beat.every((k) => truth.includes(k));
  const G = [W_NUMBERS(2), W_TOPIC("Use 2 words of the topic", ["inflation", "real", "purchasing", "beat", "lost", "dollar", "cdt"], 2), W_PAST];
  if (st.done) return <Reward title="Inflation attacked! 🔥" subtitle={`${YEARS[from]}–2024 · ${truth.length} assets beat inflation`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Flame size={22} strokeWidth={2.1} />} title="Inflation Simulator 🔥 · Real data" subtitle="$1,000,000 in each asset since the year you choose. Inflation = Colombian DANE data. Who kept the purchasing power?" onExit={onExit}>
      <Brief91 k="c2_sim" />
      <div className="g10-chips">{YEARS.slice(0, 9).map((y, i) => <button key={y} type="button" className={from === i ? "on" : ""} onClick={() => { setFrom(i); setChecked(false); }}>Start Jan {y}</button>)}</div>
      <ChartCard title={`Value of $1,000,000 (pesos) · ${YEARS[from]}–2024`} legend={[...res.filter((x) => x.k !== "btc").map((x) => ({ name: x.l, color: x.c })), { name: "Inflation (prices)", color: "#5f5a6b" }]}><LineChart labels={["start", ...YEARS.slice(from)]} series={[...res.filter((x) => x.k !== "btc").map((x) => ({ name: x.l, values: x.p.map((v) => Math.round(v * 1000000)), color: x.c })), { name: "Prices", values: ip.map((v) => Math.round(v * 1000000)), color: "#5f5a6b" }]} /></ChartCard>
      <MiniTable head={["Asset", "Value at the end", "Per year", "Real (after inflation)"]} rows={res.map((x) => [`${x.e} ${x.l}`, cop(x.m * 1000000), pctTxt(cagr(x.m, yrs)), checked ? `${x.real >= 1 ? "✅" : "❌"} ${cop(x.real * 1000000)}` : "?"])} />
      <p className="start-tip">₿ Bitcoin is in the table but not in the chart (it would hide everything else). Data approximate, for learning.</p>
      <div className="start-block"><h3>🎯 Which assets BEAT inflation? (tap all)</h3><div className="g10-chips">{ASSET11.map((a) => <button key={a.k} type="button" className={beat.includes(a.k) ? "on" : ""} onClick={() => { setBeat(beat.includes(a.k) ? beat.filter((x) => x !== a.k) : [...beat, a.k]); setChecked(false); }}>{a.e} {a.l}</button>)}</div>
        <div className="start-foot"><button className="s1-btn ghost" onClick={() => setChecked(true)}>Check</button></div>{checked && <p className={`g91-note ${okBeat ? "pos" : "neg"}`}>{okBeat ? "✅ Exactly!" : `Real winners: ${res.filter((x) => x.real > 1).map((x) => x.l).join(", ") || "none"}.`} Purchasing power = value ÷ prices.</p>}</div>
      {checked && <div className="start-block"><h3>✍️ What the data says</h3><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder={`From ${YEARS[from]} to 2024 prices rose… Cash at home lost… while the S&P 500…`} /></div>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!checked || !goalsOk(text, 30, 80, G)} onClick={() => finish(26 + (okBeat ? 6 : 0), { from: YEARS[from], beat, ok: okBeat, text })}>Save my analysis <span className="coin-tag"><Coins size={15} /> +{26 + (okBeat ? 6 : 0)}</span></button></div>
    </ActShell>
  );
}
const BEAT_R = [
  { tag: "Real return", q: "2022: a CDT paid about 9% and inflation was 13.12%. Real return (%, 1 decimal)?", answer: -3.6, unit: "%", tol: 0.2, hint: "(1.09 ÷ 1.1312) − 1", explain: "≈ −3.6%: even a CDT lost purchasing power." },
  { tag: "Real return", q: "2023: a CDT paid about 12.5% and inflation was 9.28%. Real return?", answer: 2.9, unit: "%", tol: 0.2, hint: "(1.125 ÷ 1.0928) − 1", explain: "≈ +2.9%." },
  { tag: "Cash", q: "2022: cash at home (0%) with 13.12% inflation. Real return?", answer: -11.6, unit: "%", tol: 0.2, hint: "(1 ÷ 1.1312) − 1", explain: "≈ −11.6% in one year." },
  { tag: "Prices", q: "A basket cost $500,000 in Dec 2021. Inflation 2022: 13.12%. Price in Dec 2022?", answer: 565600, money: true, tol: 100, hint: "500,000 × 1.1312", explain: "$565,600." },
  { tag: "Dollar", q: "TRM went from $3,981 (end 2021) to $4,810 (end 2022). Change of the dollar in pesos?", answer: 20.8, unit: "%", tol: 0.2, hint: "4,810 ÷ 3,981 − 1", explain: "≈ +20.8%: dollars protected savers in 2022." },
  { tag: "Decide", q: "Inflation 9%. Which option protects purchasing power?", options: ["A cajita at 11% E.A.", "A savings account at 1%.", "Cash under the mattress.", "A 'guaranteed' 10% monthly app."], correct: 0, explain: "Above inflation and supervised." },
];

/* ---------- C3 · Stock Picker (empresas ficticias, 5 números) ---------- */
const PICK_CO = [
  { k: "a", e: "🛒", n: "Andes Market", sec: "Retail", g: 6, m: 4, debt: "Medium", pe: 14, cf: "+", out: 32 },
  { k: "b", e: "💊", n: "VitaLab", sec: "Health", g: 12, m: 18, debt: "Low", pe: 22, cf: "+", out: 48 },
  { k: "c", e: "🛰️", n: "OrbitNet", sec: "Tech", g: 45, m: -20, debt: "High", pe: null, cf: "−", out: -71 },
  { k: "d", e: "⚡", n: "SolarCo", sec: "Energy", g: 25, m: 12, debt: "Medium", pe: 28, cf: "+", out: 55 },
  { k: "e", e: "🍔", n: "FastBite", sec: "Food", g: 2, m: 8, debt: "High", pe: 9, cf: "−", out: -35 },
  { k: "f", e: "🏦", n: "TrustBank", sec: "Banking", g: 8, m: 22, debt: "Medium", pe: 10, cf: "+", out: 26 },
  { k: "g", e: "🎮", n: "PixelPlay", sec: "Games", g: 30, m: 15, debt: "Low", pe: 60, cf: "+", out: 5 },
  { k: "h", e: "🚚", n: "RutaLog", sec: "Logistics", g: 10, m: 6, debt: "Low", pe: 12, cf: "+", out: 30 },
];
const PICK_WHY = { a: "Steady but thin margins: modest growth.", b: "Growth + high margin + low debt: the market rewarded quality.", c: "Fast growth but losses, high debt and negative cash: rates rose and it almost went bankrupt.", d: "Strong growth and positive cash flow.", e: "No growth + high debt + negative cash: a 'cheap' P/E that was a trap.", f: "Solid profits at a low P/E.", g: "Great company, but a P/E of 60 = very high expectations: the price barely moved.", h: "Boring, healthy and fairly priced." };
function StockPicker({ existing, onSave, onExit }) {
  const [w, setW] = useState(existing?.w || {});
  const [shown, setShown] = useState(false);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const sum = Object.values(w).reduce((a, v) => a + v, 0); const picks = PICK_CO.filter((c) => w[c.k] > 0);
  const ret = picks.reduce((a, c) => a + (w[c.k] / 100) * c.out, 0); const etf = PICK_CO.reduce((a, c) => a + c.out / PICK_CO.length, 0);
  const G = [W_TOPIC("Use 2 of the 5 numbers", ["growth", "margin", "debt", "p/e", "cash flow", "profit"], 2), W_REASON, W_COMPARE];
  if (st.done) return <Reward title="Analyst mode! 🔎" subtitle={`Your 3 years: ${pctTxt(ret, 0)} · equal-weight basket ${pctTxt(etf, 0)}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Stock Picker 🔎" subtitle="8 fictional companies, 5 numbers each. Build a 3-company portfolio (steps of 10%) — then see 3 years later." onExit={onExit}>
      <Brief91 k="c3_picker" />
      <MiniTable head={["Company", "Sales growth", "Net margin", "Debt", "P/E", "Cash flow"]} rows={PICK_CO.map((c) => [`${c.e} ${c.n} · ${c.sec}`, `${c.g}%`, `${c.m}%`, c.debt, c.pe ?? "— (loss)", c.cf])} />
      <div className="start-block"><h3>Your portfolio (max 3 companies, 100%)</h3><div className="g11-picks">{PICK_CO.map((c) => <div key={c.k}><b>{c.e} {c.n}</b><div className="g11-qty"><button type="button" disabled={shown} onClick={() => setW({ ...w, [c.k]: Math.max(0, (w[c.k] || 0) - 10) })}><Minus size={14} /></button><b>{w[c.k] || 0}%</b><button type="button" disabled={shown || sum >= 100 || (!w[c.k] && picks.length >= 3)} onClick={() => setW({ ...w, [c.k]: (w[c.k] || 0) + 10 })}><Plus size={14} /></button></div></div>)}</div></div>
      {!shown ? <div className="start-foot"><button className="s1-btn primary big" disabled={sum !== 100} onClick={() => setShown(true)}>{sum === 100 ? "Jump 3 years ⏩" : `Assign 100% (${sum}%)`}</button></div> : (
        <>
          <MiniTable head={["Company", "3-year result", "Why"]} rows={PICK_CO.map((c) => [`${c.e} ${c.n}${w[c.k] ? ` ⬅️ ${w[c.k]}%` : ""}`, pctTxt(c.out, 0), PICK_WHY[c.k]])} />
          <div className="g10-kpis"><div><small>My portfolio</small><b className={ret >= 0 ? "pos" : "neg"}>{pctTxt(ret, 0)}</b></div><div><small>All 8 (equal weights)</small><b>{pctTxt(etf, 0)}</b></div></div>
          <div className="start-block"><h3>✍️ What the numbers told me</h3><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="I chose VitaLab because its margin was higher than… OrbitNet grew fast but its debt…" /></div>
        </>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!shown || !goalsOk(text, 30, 80, G)} onClick={() => finish(26 + (ret >= etf ? 6 : 0), { w, ret: r2(ret), etf: r2(etf), text })}>Save my analysis <span className="coin-tag"><Coins size={15} /> +{26 + (ret >= etf ? 6 : 0)}</span></button></div>
    </ActShell>
  );
}

/* ---------- C3 · Company Research (empresas reales en la tablet) ---------- */
const RES_F = [["name", "🏢 Company", "e.g. Ecopetrol / Apple / Bancolombia"], ["ticker", "🔤 Ticker & exchange", "AAPL · NASDAQ"], ["sells", "🛍️ What it sells", "iPhones, services…"], ["price", "💲 Share price today", "190 USD"], ["pe", "📐 P/E ratio", "29"], ["y1", "📈 Change in 1 year (%)", "+12"], ["risk", "⚠️ One big risk", "Depends on one product"], ["src", "🔗 Source & date", "Yahoo Finance · 20 Nov"]];
function CompanyResearch({ existing, onSave, onExit }) {
  const [c, setC] = useState(existing?.c || [{}, {}]);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const okC = (x) => RES_F.every(([k]) => String(x[k] || "").trim().length >= 1);
  const G = [W_COMPARE, W_REASON, W_TOPIC("Use 2 analyst words", ["p/e", "risk", "price", "sales", "profit", "debt", "growth"], 2)];
  const ok = c.every(okC) && goalsOk(text, 35, 90, G);
  if (st.done) return <Reward title="Research done! 🧾" subtitle={`${c[0].name} vs. ${c[1].name}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title="Real Company Research 🧾" subtitle="Use your tablet (Yahoo Finance, Google Finance, the company's website) to research TWO real companies." onExit={onExit}>
      <Brief91 k="c3_research" />
      <div className="g10-two">{c.map((x, i) => <div key={i} className="start-block"><h3>Company {i + 1}</h3>{RES_F.map(([k, l, ph]) => <div key={k} className="p3-sentence edit"><span>{l}</span><input className="start-input" value={x[k] || ""} placeholder={ph} onChange={(e) => setC(c.map((y, j) => (j === i ? { ...y, [k]: e.target.value } : y)))} /></div>)}</div>)}</div>
      <div className="start-block"><h3>✍️ Which one would you rather own for 10 years — and why?</h3><WordField value={text} onChange={setText} min={35} max={90} goals={G} placeholder="I would rather own… because its P/E is lower than… However, its biggest risk is…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30, { c, text })}>Save my research <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}
const RATIO_R = [
  { tag: "Net margin", q: "Sales $50 million, net profit $6 million. Net margin?", answer: 12, unit: "%", tol: 0.1, hint: "6 ÷ 50 × 100", explain: "12%." },
  { tag: "Growth", q: "Sales went from $80M to $92M. Growth?", answer: 15, unit: "%", tol: 0.1, hint: "(92 − 80) ÷ 80", explain: "15%." },
  { tag: "EPS", q: "Profit $20M and 10M shares. Earnings per share?", answer: 2, unit: "$ per share", hint: "20 ÷ 10", explain: "$2 per share." },
  { tag: "P/E", q: "Share price $36, earnings per share $2. P/E?", answer: 18, unit: "×", hint: "36 ÷ 2", explain: "18×." },
  { tag: "Compare", q: "Two similar companies: P/E 12 and P/E 40, same growth. The P/E 40 one is…", options: ["more expensive relative to its profits.", "safer because it is more expensive.", "cheaper, because 40 is a bigger number than 12.", "impossible to compare."], correct: 0, explain: "You pay more for each peso of profit." },
  { tag: "Debt", q: "Which company suffers most when interest rates rise?", options: ["The one with high debt.", "The one with no debt.", "The one with the highest margin.", "The one with the most cash."], correct: 0, explain: "More interest to pay." },
];

/* ---------- C4 · Bankruptcy Detective ---------- */
const FLAGS = ["Debt grows much faster than sales", "Profits rise but cash flow is negative", "Auditor resigned / numbers unclear", "Clients' money mixed with company bets", "Promises of guaranteed high returns", "Employees' savings in the company's own shares", "Sales and margins stable", "Low debt and positive cash flow"];
const DOSSIERS = [
  { e: "⚡", n: "PowerNet Energy", d: [["Sales", "$10B", "$14B", "$19B"], ["Reported profit", "$0.8B", "$1.0B", "$1.3B"], ["Cash from operations", "−$0.2B", "−$0.6B", "−$1.1B"], ["Debt", "$8B", "$15B", "$27B"]], news: "The auditor resigned last month. Executives sold many shares. Employees' pension plan is 60% PowerNet shares.", flags: [0, 1, 2, 5], fail: true },
  { e: "🧃", n: "FrutaViva", d: [["Sales", "$300M", "$330M", "$360M"], ["Profit", "$24M", "$27M", "$30M"], ["Cash from operations", "$30M", "$33M", "$36M"], ["Debt", "$60M", "$55M", "$50M"]], news: "Opened 3 new stores in Medellín. Same auditor for 10 years.", flags: [6, 7], fail: false },
  { e: "🪙", n: "CoinRocket Exchange", d: [["Users", "1M", "4M", "9M"], ["Reported profit", "$0.1B", "$0.4B", "$1.0B"], ["Clients' deposits", "$2B", "$8B", "$16B"], ["Related trading firm's bets", "$1B", "$6B", "$14B"]], news: "Stadium sponsorships and celebrity ads. It offers 12% 'guaranteed' on stablecoins. The related trading firm belongs to the founder.", flags: [3, 4], fail: true },
  { e: "🧰", n: "HerraCol Tools", d: [["Sales", "$90M", "$95M", "$99M"], ["Profit", "$7M", "$7.5M", "$8M"], ["Cash from operations", "$9M", "$10M", "$10M"], ["Debt", "$20M", "$20M", "$18M"]], news: "Boring company. Pays a small dividend every year.", flags: [6, 7], fail: false },
];
function BankruptcyDetective({ existing, onSave, onExit }) {
  const [i, setI] = useState(0);
  const [sel, setSel] = useState({});
  const [pred, setPred] = useState({});
  const [shown, setShown] = useState({});
  const [st, finish] = useFinish(onSave);
  const D = DOSSIERS[Math.min(i, 3)]; const S = sel[i] || [];
  const flagScore = (k) => { const s = sel[k] || []; const t = DOSSIERS[k].flags; return s.filter((x) => t.includes(x)).length - s.filter((x) => !t.includes(x)).length; };
  const total = DOSSIERS.reduce((a, _, k) => a + Math.max(0, flagScore(k)) + (pred[k] === DOSSIERS[k].fail ? 2 : 0), 0);
  const done = i >= 4;
  if (st.done) return <Reward title="Detective of the year! 🕵️" subtitle={`${total} points`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<ShieldAlert size={22} strokeWidth={2.1} />} title="Bankruptcy Detective 🕵️" subtitle="4 dossiers. Mark the red (and green) flags, then predict: will it survive 2 years?" onExit={onExit}>
      <Brief91 k="c4_detective" />
      {!done ? (
        <div className="start-block g10-event">
          <div className="g10-event-head"><em>{D.e}</em><div><b>Dossier {i + 1}/4 · {D.n}</b><p>📰 {D.news}</p></div></div>
          <MiniTable head={["", "Year 1", "Year 2", "Year 3"]} rows={D.d} />
          <span className="terms-label">Flags you see:</span><div className="g10-qpick">{FLAGS.map((f, k) => { const on = S.includes(k); const c = shown[i] ? (D.flags.includes(k) ? "on" : on ? "bad" : "") : on ? "on" : ""; return <button key={f} type="button" disabled={!!shown[i]} className={c} onClick={() => setSel({ ...sel, [i]: on ? S.filter((x) => x !== k) : [...S, k] })}>{k < 6 ? "🚩" : "✅"} {f}</button>; })}</div>
          <span className="terms-label">Prediction:</span><div className="g10-ab four"><button type="button" disabled={!!shown[i]} className={pred[i] === true ? "on" : ""} onClick={() => setPred({ ...pred, [i]: true })}><em>💥</em><b>It will collapse</b></button><button type="button" disabled={!!shown[i]} className={pred[i] === false ? "on" : ""} onClick={() => setPred({ ...pred, [i]: false })}><em>🌱</em><b>It will survive</b></button></div>
          {shown[i] && <div className={`p1-banner ${pred[i] === D.fail ? "good" : "bad"}`}><span>{D.fail ? "💥 Two years later it went bankrupt." : "🌱 Two years later it was still healthy."} Flags you found: {Math.max(0, flagScore(i))}/{D.flags.length}.</span></div>}
          <div className="start-foot">{!shown[i] ? <button className="s1-btn primary big" disabled={!S.length || pred[i] == null} onClick={() => setShown({ ...shown, [i]: true })}>Reveal the future</button> : <button className="s1-btn primary big" onClick={() => setI(i + 1)}>{i < 3 ? "Next dossier" : "See my report"} <ChevronRight size={18} /></button>}</div>
        </div>
      ) : (
        <>
          <MiniTable head={["Company", "Flags right", "Prediction"]} rows={DOSSIERS.map((d, k) => [`${d.e} ${d.n}`, `${Math.max(0, flagScore(k))}/${d.flags.length}`, pred[k] === d.fail ? "✅" : "❌"])} />
          <p className="start-tip">💡 PowerNet looks like Enron; CoinRocket looks like FTX. Real history repeats its patterns.</p>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(18 + total * 2, { total })}>Save my investigation <span className="coin-tag"><Coins size={15} /> +{18 + total * 2}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C4 · One stock vs. an ETF ---------- */
function OneVsMany({ existing, onSave, onExit }) {
  const [pick, setPick] = useState(existing?.pick || null);
  const [run, setRun] = useState(false);
  const [r, setR] = useState(null);
  const [st, finish] = useFinish(onSave);
  const CO = [["⚡", "PowerNet"], ["🧃", "FrutaViva"], ["🛰️", "OrbitNet"], ["🏦", "TrustBank"], ["🎮", "PixelPlay"]];
  const fail = "PowerNet"; const amt = 10000000;
  const one = pick === fail ? 0 : amt * 1.18; const etf = amt * (1 + (49 * 0.18 - 1) / 50);
  const ROUNDS = [
    { tag: "One company", q: "$10,000,000 in ONE company that goes to zero. What's left?", answer: 0, money: true, hint: "100% of the money in it", explain: "$0. Everything." },
    { tag: "ETF", q: "The same $10,000,000 in an ETF of 50 equal companies. One goes to zero. How much do you lose from that company?", answer: 200000, money: true, hint: "10,000,000 ÷ 50", explain: "$200,000 — 2%." },
    { tag: "Employee", q: "An employee has 60% of her $50,000,000 savings in her own company's shares. The company collapses. She loses…", answer: 30000000, money: true, hint: "50,000,000 × 0.6", explain: "$30,000,000 — and her job. Never put all your eggs in your employer's basket." },
  ];
  if (st.done) return <Reward title="Diversification proven! 🧺" subtitle="One disaster, two very different stories." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Layers size={22} strokeWidth={2.1} />} title="One Stock vs. an ETF 🧺" subtitle="Bet $10,000,000 on ONE company… or buy all 50. Then one company goes to zero." onExit={onExit}>
      <Brief91 k="c4_impact" />
      {!run ? <><p className="quiz-q">Choose ONE company for all your money:</p><div className="g10-ab four">{CO.map(([e, n]) => <button key={n} type="button" className={pick === n ? "on" : ""} onClick={() => setPick(n)}><em>{e}</em><b>{n}</b></button>)}</div><div className="start-foot"><button className="s1-btn primary big" disabled={!pick} onClick={() => setRun(true)}>Run 3 years ⏩</button></div></> : (
        <>
          <div className="p1-banner bad"><span>💥 PowerNet hid its debts and went to ZERO. The other companies grew about 18%.</span></div>
          <div className="g10-kpis"><div><small>🎯 Your one stock ({pick})</small><b className={one >= amt ? "pos" : "neg"}>{cop(one)}</b></div><div><small>🧺 ETF of 50 (PowerNet included)</small><b className="pos">{cop(etf)}</b></div></div>
          <p className="start-tip">{pick === fail ? "You picked the disaster — and lost everything." : "You avoided the disaster this time… but could you know it before? The ETF didn't need to guess."}</p>
          {!r ? <RoundsRunner rounds={ROUNDS} doneLabel="Finish" onDone={setR} /> : <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(18 + r.firstTry * 3, { pick, firstTry: r.firstTry })}>Save <span className="coin-tag"><Coins size={15} /> +{18 + r.firstTry * 3}</span></button></div>}
        </>
      )}
    </ActShell>
  );
}
const RUSH_FLAGS = {
  buckets: [{ id: "red", e: "🚩", l: "Red flag", d: "danger: investigate or walk away", c: "#c8563a" }, { id: "green", e: "✅", l: "Green flag", d: "a healthy sign", c: "#3c9d5d" }],
  items: [
    { e: "💯", t: "“Returns guaranteed: 5% every month”", b: "red", why: "No real investment guarantees high returns." }, { e: "🏛️", t: "Supervised by the Superintendencia Financiera", b: "green", why: "Supervision protects you." },
    { e: "👥", t: "“Invite 3 friends to unlock your bonus”", b: "red", why: "Recruiting = pyramid pattern." }, { e: "🧾", t: "Audited financial statements every year", b: "green", why: "Transparency." },
    { e: "📉", t: "Debt doubles every year while sales grow 5%", b: "red", why: "Unsustainable." }, { e: "💧", t: "Positive cash flow for 5 years", b: "green", why: "The business pays its own bills." },
    { e: "🤫", t: "“The strategy is secret, just trust us”", b: "red", why: "If you can't understand it, don't invest." }, { e: "🧺", t: "An index fund with 500 companies", b: "green", why: "Diversified." },
    { e: "⏰", t: "“Only today! 10 spots left!”", b: "red", why: "Pressure is a scam tool." }, { e: "📊", t: "Fees clearly published: 0.2% a year", b: "green", why: "Low, transparent fees." },
    { e: "🏟️", t: "Celebrity ads but no information about reserves", b: "red", why: "Marketing ≠ transparency." }, { e: "🔁", t: "You can withdraw your money any day", b: "green", why: "Liquidity." },
    { e: "🚪", t: "The auditor resigned suddenly", b: "red", why: "A classic warning." }, { e: "🪪", t: "Clients' money kept separate from the company's", b: "green", why: "Protects clients." },
  ],
};

/* ---------- C5 · ETF Builder ---------- */
const UNIV = [
  { k: "t1", e: "💻", n: "CloudCore", s: "Tech" }, { k: "t2", e: "📱", n: "PhoneMax", s: "Tech" }, { k: "t3", e: "🤖", n: "RoboAI", s: "Tech" },
  { k: "h1", e: "💊", n: "VitaLab", s: "Health" }, { k: "h2", e: "🩺", n: "MediPlus", s: "Health" }, { k: "e1", e: "⚡", n: "SolarCo", s: "Energy" },
  { k: "e2", e: "🛢️", n: "PetroSur", s: "Energy" }, { k: "f1", e: "🏦", n: "TrustBank", s: "Finance" }, { k: "f2", e: "💳", n: "PayFast", s: "Finance" },
  { k: "c1", e: "🛒", n: "Andes Market", s: "Consumer" }, { k: "c2", e: "🍔", n: "FastBite", s: "Consumer" }, { k: "c3", e: "👟", n: "StepUp", s: "Consumer" },
  { k: "i1", e: "🏗️", n: "BuildCol", s: "Industry" }, { k: "i2", e: "🚚", n: "RutaLog", s: "Industry" }, { k: "u1", e: "💡", n: "LuzRed", s: "Utilities" },
];
const SECT_RET = { Tech: [30, -25, 35, 20, 10], Health: [8, 6, 10, 5, 9], Energy: [-15, 40, 5, -5, 12], Finance: [12, -5, 15, 10, 8], Consumer: [10, 2, 8, 6, 7], Industry: [9, 0, 11, 7, 6], Utilities: [5, 6, 4, 5, 5] };
const BUST = "t3";
function ETFBuilder({ existing, onSave, onExit }) {
  const [sel, setSel] = useState(existing?.sel || []);
  const [fee, setFee] = useState(existing?.fee ?? 0.2);
  const [name, setName] = useState(existing?.name || "");
  const [shown, setShown] = useState(false);
  const [st, finish] = useFinish(onSave);
  const sectors = [...new Set(sel.map((k) => UNIV.find((u) => u.k === k).s))];
  const run = (keys, f) => { let v = 1; const p = [1]; for (let y = 0; y < 5; y++) { const r = keys.reduce((a, k) => { const u = UNIV.find((x) => x.k === k); if (k === BUST && y >= 2) return a + (y === 2 ? -100 : 0) / keys.length; return a + SECT_RET[u.s][y] / keys.length; }, 0); v *= (1 + r / 100) * (1 - f / 100); p.push(v); } return p; };
  const mine = run(sel, fee); const idx = run(UNIV.map((u) => u.k), 0.05);
  const ok = sel.length === 10 && countWords(name) >= 1 && shown;
  if (st.done) return <Reward title={`${name} ETF launched! 🧺`} subtitle={`${sectors.length} sectors · 5 years ${pctTxt((mine[5] - 1) * 100, 0)}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Layers size={22} strokeWidth={2.1} />} title="ETF Builder 🧺" subtitle="Create your own ETF: choose 10 of 15 companies (equal weights) and a fee. Compete with the full index for 5 years." onExit={onExit}>
      <Brief91 k="c5_build" />
      <div className="g10-chips">{UNIV.map((u) => <button key={u.k} type="button" disabled={shown} className={sel.includes(u.k) ? "on" : ""} onClick={() => setSel(sel.includes(u.k) ? sel.filter((x) => x !== u.k) : sel.length < 10 ? [...sel, u.k] : sel)}>{u.e} {u.n} <i className="g11-sec">{u.s}</i></button>)}</div>
      <div className="g10-two"><div className="start-block"><input className="start-input g11-gap" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name of your ETF (e.g. CREAR Future 10)" /><Ctl l="Annual fee" v={fee} set={setFee} mn={0.05} mx={2} stp={0.05} fmt={(x) => `${x.toFixed(2)}%`} /><div className="g91-mini"><span>Companies <b>{sel.length}/10</b></span><span className={sectors.length >= 5 ? "pos" : "neg"}>Sectors <b>{sectors.length}/7</b></span></div></div>
        <div className="start-block">{shown ? <><ChartCard title="Growth of $1 (5 years)" legend={[{ name: name || "My ETF", color: "#e0a03a" }, { name: "Full index (15)", color: "#3c9d5d" }]}><LineChart money={false} labels={["Y0", "Y1", "Y2", "Y3", "Y4", "Y5"]} series={[{ name: "Mine", values: mine.map((v) => r2(v)), color: "#e0a03a" }, { name: "Index", values: idx.map((v) => r2(v)), color: "#3c9d5d" }]} /></ChartCard>{sel.includes(BUST) && <p className="g91-note neg">💥 RoboAI went bankrupt in year 3 — it was 10% of your ETF.</p>}</> : <p className="start-tip">💡 More sectors = less risk from one bad sector. Lower fee = more money for you every year.</p>}</div></div>
      {!shown ? <div className="start-foot"><button className="s1-btn primary big" disabled={sel.length !== 10 || countWords(name) < 1} onClick={() => setShown(true)}>Run 5 years ⏩</button></div> : <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(24 + (sectors.length >= 5 ? 4 : 0) + (fee <= 0.5 ? 4 : 0), { sel, fee, name, sectors: sectors.length, result: r2(mine[5]), index: r2(idx[5]) })}>Save my ETF <span className="coin-tag"><Coins size={15} /> +{24 + (sectors.length >= 5 ? 4 : 0) + (fee <= 0.5 ? 4 : 0)}</span></button></div>}
    </ActShell>
  );
}

/* ---------- C5 · Fee impact ---------- */
function FeeImpact({ existing, onSave, onExit }) {
  const [monthly, setMonthly] = useState(existing?.monthly || 200000);
  const [ret, setRet] = useState(existing?.ret || 8);
  const [r, setR] = useState(null);
  const [st, finish] = useFinish(onSave);
  const fv = (fee) => { const m = Math.pow(1 + (ret - fee) / 100, 1 / 12) - 1; const out = [0]; let v = 0; for (let y = 1; y <= 30; y++) { for (let k = 0; k < 12; k++) v = v * (1 + m) + monthly; out.push(v); } return out; };
  const a = fv(0.1), b = fv(1), c = fv(2);
  const R = [
    { tag: "Fees", q: `After 30 years, how much more do you have with a 0.1% fee than with 2%? (rounded to millions)`, answer: Math.round((a[30] - c[30]) / 1000000), unit: "million", tol: 1, hint: "Look at the chart's last point", explain: `About ${mCOP(a[30] - c[30])} — paid only in fees.` },
    { tag: "Fees", q: "A 1.5% fee on $20,000,000 costs per year…", answer: 300000, money: true, hint: "20,000,000 × 0.015", explain: "$300,000 every year — even in bad years." },
    { tag: "Choose", q: "Two S&P 500 ETFs: fee 0.03% and fee 0.9%. Same index. Choose…", options: ["0.03% — same companies, less cost.", "0.9% — more expensive means better.", "Both are equal.", "Neither: ETFs are risky."], correct: 0, explain: "Same basket: the cheapest wins." },
  ];
  if (st.done) return <Reward title="Fee detective! 🔍" subtitle={`Fees could cost you ${mCOP(a[30] - c[30])}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Percent size={22} strokeWidth={2.1} />} title="The Silent Thief: Fees 🔍" subtitle="Invest every month for 30 years. Change only the fee. Watch what happens." onExit={onExit}>
      <Brief91 k="c5_fees" />
      <div className="g10-two"><div className="start-block"><Ctl l="Monthly investment" v={monthly} set={setMonthly} mn={50000} mx={1000000} stp={50000} fmt={cop} /><Ctl l="Return before fees" v={ret} set={setRet} mn={3} mx={12} stp={0.5} fmt={(x) => `${x}%`} /><div className="g10-kpis"><div><small>Fee 0.1%</small><b>{mCOP(a[30])}</b></div><div><small>Fee 1%</small><b>{mCOP(b[30])}</b></div><div><small>Fee 2%</small><b className="neg">{mCOP(c[30])}</b></div></div></div>
        <div className="start-block"><ChartCard title="30 years of investing" legend={[{ name: "0.1%", color: "#3c9d5d" }, { name: "1%", color: "#e0a03a" }, { name: "2%", color: "#c8563a" }]}><LineChart labels={a.map((_, k) => (k % 5 === 0 ? `Y${k}` : ""))} series={[{ name: "0.1%", values: a.map(Math.round), color: "#3c9d5d" }, { name: "1%", values: b.map(Math.round), color: "#e0a03a" }, { name: "2%", values: c.map(Math.round), color: "#c8563a" }]} /></ChartCard></div></div>
      {!r ? <RoundsRunner rounds={R} doneLabel="Finish" onDone={setR} /> : <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(18 + r.firstTry * 3, { monthly, ret, lost: Math.round(a[30] - c[30]) })}>Save <span className="coin-tag"><Coins size={15} /> +{18 + r.firstTry * 3}</span></button></div>}
    </ActShell>
  );
}

/* ---------- C5 · My Big Investment Summary ---------- */
const SUM_COLS = [["risk", "Risk", ["Low", "Medium", "High", "Extreme"]], ["liq", "Liquidity", ["Locked", "Days", "Same day"]], ["hor", "Best for", ["Emergencies", "1–3 years", "5+ years", "Only money I can lose"]], ["how", "How at 18", ["Bank / fintech app", "Stockbroker or platform", "Crypto exchange", "Buy & store / dealer"]]];
const SUM_ROWS = [
  { k: "acc", e: "📲", l: "Cajita / savings account", a: { risk: "Low", liq: "Same day", hor: "Emergencies", how: "Bank / fintech app" } },
  { k: "cdt", e: "📜", l: "CDT", a: { risk: "Low", liq: "Locked", hor: "1–3 years", how: "Bank / fintech app" } },
  { k: "fic", e: "🏦", l: "Collective fund (FIC)", a: { risk: "Medium", liq: "Days", hor: "1–3 years", how: "Bank / fintech app" } },
  { k: "usd", e: "💵", l: "US dollars", a: { risk: "Medium", liq: "Same day", hor: "1–3 years", how: "Bank / fintech app" } },
  { k: "etf", e: "🧺", l: "S&P 500 / world ETF", a: { risk: "Medium", liq: "Days", hor: "5+ years", how: "Stockbroker or platform" } },
  { k: "one", e: "🚀", l: "One company's shares", a: { risk: "High", liq: "Days", hor: "5+ years", how: "Stockbroker or platform" } },
  { k: "gold", e: "🥇", l: "Gold", a: { risk: "Medium", liq: "Days", hor: "5+ years", how: "Buy & store / dealer" } },
  { k: "btc", e: "₿", l: "Bitcoin / crypto", a: { risk: "Extreme", liq: "Same day", hor: "Only money I can lose", how: "Crypto exchange" } },
];
function BigSummary({ existing, onSave, onExit }) {
  const [v, setV] = useState(existing?.v || {});
  const [checked, setChecked] = useState(false);
  const [rules, setRules] = useState(existing?.rules || ["", "", ""]);
  const [st, finish] = useFinish(onSave);
  const cells = SUM_ROWS.length * SUM_COLS.length; const filled = SUM_ROWS.reduce((a, r) => a + SUM_COLS.filter(([c]) => v[r.k]?.[c]).length, 0);
  const right = SUM_ROWS.reduce((a, r) => a + SUM_COLS.filter(([c]) => v[r.k]?.[c] === r.a[c]).length, 0);
  const ok = checked && rules.every((x) => countWords(x) >= 5);
  if (st.done) return <Reward title="Your Big Investment Summary! 📘" subtitle={`${right}/${cells} cells like the experts`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<BookOpen size={22} strokeWidth={2.1} />} title="My Big Investment Summary 📘" subtitle="Everything about investing in ONE table — built by you. Then write your 3 golden rules." onExit={onExit}>
      <Brief91 k="c5_summary" />
      <div className="g11-summary" id="g11-summary"><div className="g11-sum-row head"><span>Asset</span>{SUM_COLS.map(([c, l]) => <span key={c}>{l}</span>)}</div>
        {SUM_ROWS.map((r) => <div key={r.k} className="g11-sum-row"><b>{r.e} {r.l}</b>{SUM_COLS.map(([c, , opts]) => { const val = v[r.k]?.[c] || ""; return <select key={c} className={`start-input ${checked ? (val === r.a[c] ? "ok" : "no") : ""}`} value={val} onChange={(e) => { setV({ ...v, [r.k]: { ...(v[r.k] || {}), [c]: e.target.value } }); setChecked(false); }}><option value="">—</option>{opts.map((o) => <option key={o} value={o}>{o}</option>)}</select>; })}</div>)}
        {rules.some((x) => x) && <div className="g11-sum-rules"><b>⭐ My golden rules</b>{rules.filter(Boolean).map((x, i) => <p key={i}>{i + 1}. {x}</p>)}</div>}
      </div>
      <div className="start-foot"><button className="s1-btn ghost" disabled={filled < cells} onClick={() => setChecked(true)}>{filled < cells ? `Fill all cells (${filled}/${cells})` : "Check with the experts"}</button></div>
      {checked && <p className={`g91-note ${right >= cells * 0.8 ? "pos" : ""}`}>✅ {right}/{cells} like the experts. Red cells: think again (you can change them).</p>}
      <div className="start-block"><h3>⭐ My 3 golden rules for investing</h3>{rules.map((x, i) => <input key={i} className="start-input g11-gap" value={x} placeholder={["Emergency fund first, then…", "Never invest in what I don't understand…", "Fees and diversification…"][i]} onChange={(e) => setRules(rules.map((y, j) => (j === i ? e.target.value : y)))} />)}</div>
      <div className="start-foot"><button className="s1-btn ghost" onClick={() => downloadPNG("g11-summary", "My_Investment_Summary.png")}><Download size={16} /> PNG</button><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(20 + Math.round((right / cells) * 16), { v, right, rules })}>Save my summary <span className="coin-tag"><Coins size={15} /> +{20 + Math.round((right / cells) * 16)}</span></button></div>
    </ActShell>
  );
}

/* ---------- C6 · Time Machine (datos reales, todo de una vez vs. cada año) ---------- */
function TimeMachine({ existing, onSave, onExit }) {
  const [from, setFrom] = useState(existing?.from ?? 0);
  const [mode, setMode] = useState(existing?.mode || "lump");
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const yrs = 10 - from; const total = 10000000;
  const val = (k) => { const p = pathOf(k, from); if (mode === "lump") return p.map((x) => x * total); const each = total / yrs; const out = [0]; let v = 0; for (let y = 0; y < yrs; y++) { v = (v + each) * (p[y + 1] / p[y]); out.push(v); } return out; };
  const res = ASSET11.map((a) => ({ ...a, v: val(a.k) })); const ip = inflPath(from);
  const G = [W_NUMBERS(2), W_COMPARE, W_TOPIC("Use 2 words", ["lump", "every year", "dca", "crash", "inflation", "real", "volatile"], 2)];
  if (st.done) return <Reward title="Time traveler! ⏳" subtitle={`${YEARS[from]}–2024 · ${mode === "lump" ? "all at once" : "a part every year"}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Hourglass size={22} strokeWidth={2.1} />} title="Time Machine ⏳ · Real 2015–2024" subtitle="$10,000,000 in pesos. Invest everything at once — or a part every year (DCA). Real historical data (approximate)." onExit={onExit}>
      <Brief91 k="c6_machine" />
      <div className="g10-chips">{YEARS.slice(0, 9).map((y, i) => <button key={y} type="button" className={from === i ? "on" : ""} onClick={() => setFrom(i)}>{y}</button>)}</div>
      <div className="g10-ab four"><button type="button" className={mode === "lump" ? "on" : ""} onClick={() => setMode("lump")}><em>💰</em><b>All at once</b><span>lump sum in {YEARS[from]}</span></button><button type="button" className={mode === "dca" ? "on" : ""} onClick={() => setMode("dca")}><em>📆</em><b>A part every year</b><span>DCA: {cop(total / yrs)}/year</span></button></div>
      <ChartCard title="Value in pesos" legend={res.filter((x) => x.k !== "btc").map((x) => ({ name: x.l, color: x.c }))}><LineChart labels={["start", ...YEARS.slice(from)]} series={res.filter((x) => x.k !== "btc").map((x) => ({ name: x.l, values: x.v.map(Math.round), color: x.c }))} /></ChartCard>
      <MiniTable head={["Asset", "End 2024", "Real (in start-year pesos)", "Worst year"]} rows={res.map((x) => { const worst = Math.min(...Array.from({ length: yrs }, (_, k) => x.r(from + k))); return [`${x.e} ${x.l}`, mCOP(x.v[x.v.length - 1]), mCOP(x.v[x.v.length - 1] / ip[ip.length - 1]), pctTxt(worst, 0)]; })} />
      <div className="start-block"><h3>✍️ What the time machine taught me</h3><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="Investing every year was safer than all at once because… The S&P 500 ended with more than… but in 2022…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(text, 30, 80, G)} onClick={() => finish(30, { from: YEARS[from], mode, text })}>Save my trip <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- C6 · Crash Survival (caminos mensuales aproximados del S&P 500) ---------- */
const CRASH = {
  "2008": { l: "Global Financial Crisis · 2008–2009", m: ["Jan 08", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan 09", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], r: [-6.1, -3.5, -0.6, 4.8, 1.1, -8.6, -1.0, 1.2, -9.1, -16.9, -7.5, 0.8, -8.6, -11.0, 8.5, 9.4, 5.3, 0.0, 7.4, 3.4, 3.6, -2.0, 5.7, 1.8] },
  "2020": { l: "COVID crash · 2020", m: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], r: [-0.2, -8.4, -12.5, 12.7, 4.5, 1.8, 5.5, 7.0, -3.9, -2.8, 10.8, 3.7] },
};
function CrashSurvival({ existing, onSave, onExit }) {
  const [c, setC] = useState(null);
  const [i, setI] = useState(0);
  const [inv, setInv] = useState(10000000);
  const [cash, setCash] = useState(0);
  const [hist, setHist] = useState([]);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const C = c ? CRASH[c] : null; const done = C && i >= C.r.length;
  const hold = C ? C.r.reduce((a, x) => a * (1 + x / 100), 10000000) : 0;
  const act = (d) => { const r = C.r[i] / 100; let a = inv, b = cash; if (d === "sell") { b += a; a = 0; } if (d === "buy") { a += b; b = 0; } a *= 1 + r; setInv(a); setCash(b); setHist([...hist, { m: C.m[i], d, v: a + b, r: C.r[i] }]); setI(i + 1); };
  const G = [W_PAST, W_NUMBERS(2), W_TOPIC("Use 2 words", ["panic", "recover", "hold", "sell", "crash", "plan", "fear"], 2)];
  if (st.done) return <Reward title="You survived the crash! 🌪️" subtitle={`You: ${mCOP(inv + cash)} · just holding: ${mCOP(hold)}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<TrendingDown size={22} strokeWidth={2.1} />} title="Crash Survival 🌪️" subtitle="$10,000,000 in an S&P 500 ETF. Live a real crash month by month: hold, sell — or buy back." onExit={onExit}>
      <Brief91 k="c6_crash" />
      {!C ? <div className="g10-ab four">{Object.entries(CRASH).map(([k, x]) => <button key={k} type="button" onClick={() => setC(k)}><em>{k === "2008" ? "🏦" : "🦠"}</em><b>{x.l}</b><span>{x.r.length} months</span></button>)}</div> : (
        <>
          <div className="g10-kpis"><div><small>📈 In the ETF</small><b>{mCOP(inv)}</b></div><div><small>💵 In cash</small><b>{mCOP(cash)}</b></div><div><small>💼 Total</small><b className={inv + cash >= 10000000 ? "pos" : "neg"}>{mCOP(inv + cash)}</b></div></div>
          {!done ? <div className="start-block g10-event"><div className="g10-event-head"><em>📅</em><div><b>{C.m[i]} · {C.l}</b><p>{i > 0 ? `Last month: ${pctTxt(C.r[i - 1], 1)}. ` : ""}What do you do BEFORE this month?</p></div></div><div className="g10-ab four"><button type="button" onClick={() => act("hold")}><em>🧘</em><b>Hold</b></button><button type="button" disabled={!inv} onClick={() => act("sell")}><em>🏃</em><b>Sell all</b></button><button type="button" disabled={!cash} onClick={() => act("buy")}><em>🛒</em><b>Buy back</b></button></div></div> : <div className={`p1-banner ${inv + cash >= hold * 0.98 ? "good" : "bad"}`}><span>End: you {mCOP(inv + cash)} vs. just holding {mCOP(hold)}. {inv + cash < hold * 0.98 ? "Panic decisions cost money." : hist.some((x) => x.d === "sell") ? "This time your timing worked — but nobody can predict the bottom every time." : "Discipline paid."} (Approximate monthly S&P 500 price changes.)</span></div>}
          {hist.length > 1 && <ChartCard title="Your portfolio month by month"><LineChart labels={hist.map((x) => x.m)} series={[{ name: "You", values: hist.map((x) => Math.round(x.v)), color: "#e0a03a" }]} /></ChartCard>}
          {done && <div className="start-block"><h3>✍️ What I felt and learned</h3><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="In October I panicked and sold because the market fell 17%… Holding would have…" /></div>}
        </>
      )}
      {done && <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(text, 30, 80, G)} onClick={() => finish(26 + (inv + cash >= hold * 0.98 ? 6 : 0), { crash: c, final: Math.round(inv + cash), hold: Math.round(hold), text })}>Save my crash report <span className="coin-tag"><Coins size={15} /> +{26 + (inv + cash >= hold * 0.98 ? 6 : 0)}</span></button></div>}
    </ActShell>
  );
}

/* ---------- C6 · My Lab portfolio through 2015–2024 ---------- */
function LabRun({ resp, existing, onSave, onExit }) {
  const al = resp?.c1_alloc?.alloc || { cdt: 30, usd: 20, sp: 30, gold: 10, btc: 5, cash: 5, bond: 0 }; const sample = !resp?.c1_alloc;
  const [reb, setReb] = useState(existing?.reb ?? true);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const T = 10000000;
  const run = () => { let h = Object.fromEntries(ASSET11.map((a) => [a.k, (T * (al[a.k] || 0)) / 100])); const p = [T]; for (let y = 0; y < 10; y++) { h = Object.fromEntries(ASSET11.map((a) => [a.k, h[a.k] * (1 + a.r(y) / 100)])); const tot = Object.values(h).reduce((x, v) => x + v, 0); p.push(tot); if (reb) h = Object.fromEntries(ASSET11.map((a) => [a.k, (tot * (al[a.k] || 0)) / 100])); } return p; };
  const p = run(); const cdt = pathOf("cdt").map((x) => x * T); const ip = inflPath().map((x) => x * T);
  const G = [W_NUMBERS(2), W_COMPARE, W_TOPIC("Use 2 words", ["rebalanc", "inflation", "diversif", "risk", "return", "dollar"], 2)];
  if (st.done) return <Reward title="Ten years managed! 🧪" subtitle={`${mCOP(p[10])} · ${pctTxt(cagr(p[10] / T, 10))} per year`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<LineIcon size={22} strokeWidth={2.1} />} title="My Lab Portfolio · 2015–2024 🧪" subtitle="The mix you chose in Class 1 travels through ten real years." onExit={onExit}>
      <Brief91 k="c6_portfolio" />
      {sample && <div className="p1-banner bad"><span>You didn't open your Lab portfolio in Class 1 — this is a sample mix.</span></div>}
      <div className="g91-mini">{ASSET11.filter((a) => al[a.k]).map((a) => <span key={a.k}>{a.e} {a.l} <b>{al[a.k]}%</b></span>)}</div>
      <label className="g11-toggle"><input type="checkbox" checked={reb} onChange={(e) => setReb(e.target.checked)} /> ⚖️ Rebalance every January (back to my %)</label>
      <ChartCard title="My portfolio vs. all in CDT vs. prices" legend={[{ name: "My portfolio", color: "#e0a03a" }, { name: "All in CDT", color: "#3c9d5d" }, { name: "Prices (inflation)", color: "#5f5a6b" }]}><LineChart labels={["2015", ...YEARS]} series={[{ name: "Mine", values: p.map(Math.round), color: "#e0a03a" }, { name: "CDT", values: cdt.map(Math.round), color: "#3c9d5d" }, { name: "Prices", values: ip.map(Math.round), color: "#5f5a6b" }]} /></ChartCard>
      <div className="g10-kpis"><div><small>End 2024</small><b>{mCOP(p[10])}</b></div><div><small>Per year</small><b>{pctTxt(cagr(p[10] / T, 10))}</b></div><div><small>Real (after inflation)</small><b className={p[10] > ip[10] ? "pos" : "neg"}>{mCOP((p[10] / ip[10]) * T)}</b></div><div><small>Worst year</small><b className="neg">{pctTxt(Math.min(...p.slice(1).map((v, k) => (v / p[k] - 1) * 100)), 0)}</b></div></div>
      <div className="start-block"><h3>✍️ My portfolio's story</h3><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="My portfolio grew to… per year, more than the CDT because… In 2022 it fell… Rebalancing…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(text, 30, 80, G)} onClick={() => finish(32, { reb, final: Math.round(p[10]), cagr: r2(cagr(p[10] / T, 10)), real: Math.round((p[10] / ip[10]) * T), text })}>Save my 10 years <span className="coin-tag"><Coins size={15} /> +32</span></button></div>
    </ActShell>
  );
}
const CAGR_R = [
  { tag: "CAGR", q: "$10M became $20M in 10 years. Annual growth (CAGR, %, 1 decimal)?", answer: 7.2, unit: "%", tol: 0.1, hint: "2^(1/10) − 1", explain: "≈ 7.2% a year (Rule of 72!)." },
  { tag: "Real", q: "Your portfolio grew 9% a year; inflation 5.5% a year. Real growth ≈ ? (%, 1 decimal)", answer: 3.3, unit: "%", tol: 0.1, hint: "1.09 ÷ 1.055 − 1", explain: "≈ 3.3% a year." },
  { tag: "DCA", q: "You invest $1,000,000 every year for 5 years. Total invested?", answer: 5000000, money: true, hint: "5 × 1,000,000", explain: "$5,000,000." },
  { tag: "Drawdown", q: "A portfolio fell from $12M to $8.4M. Drawdown (%)?", answer: 30, unit: "%", tol: 0.1, hint: "(12 − 8.4) ÷ 12", explain: "30%." },
  { tag: "Recovery", q: "After falling 50%, how much must it rise to go back to the start?", answer: 100, unit: "%", hint: "from 50 back to 100", explain: "+100%! Losses hurt more than gains help." },
  { tag: "Decide", q: "During a crash, the best evidence-based behavior for a long-term investor is usually…", options: ["follow the plan and rebalance.", "sell everything immediately.", "borrow money to buy crypto.", "stop looking at money forever."], correct: 0, explain: "Discipline beats panic (no guarantees)." },
];

/* ---------- C7 · University Hunter ---------- */
const UNI_F = [["uni", "🏫 University / institution", "Universidad de los Andes"], ["city", "📍 City", "Bogotá"], ["prog", "🎓 Program", "Industrial Engineering"], ["sem", "📚 Semesters", "9"], ["tuition", "💲 Tuition per semester ($)", "22000000"], ["schol", "🎖️ Scholarships / discounts found", "Saber 11 top scores: 50%"], ["src", "🔗 Source (website) & date", "uniandes.edu.co · 20 Nov"]];
function UniHunter({ existing, onSave, onExit }) {
  const [u, setU] = useState(existing?.u || [{}, {}]);
  const [st, finish] = useFinish(onSave);
  const okU = (x) => UNI_F.every(([k]) => String(x[k] || "").trim().length >= 1) && num(x.tuition) > 0 && num(x.sem) > 0;
  const ok = u.every(okU);
  if (st.done) return <Reward title="Universities researched! 🎓" subtitle={`${u[0].uni} · ${u[1].uni}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<GraduationCap size={22} strokeWidth={2.1} />} title="University Hunter 🎓" subtitle="Use your tablet: research your DREAM option and a POSSIBLE option (cheaper, public, technical or another city). Real data only." onExit={onExit}>
      <Brief91 k="c7_uni" />
      <div className="g10-two">{u.map((x, i) => <div key={i} className={`start-block g11-uni ${i === 0 ? "dream" : "possible"}`}><h3>{i === 0 ? "🌟 My DREAM option" : "🧭 My POSSIBLE option"}</h3>{UNI_F.map(([k, l, ph]) => <div key={k} className="p3-sentence edit"><span>{l}</span><input className="start-input" type={k === "tuition" || k === "sem" ? "number" : "text"} value={x[k] || ""} placeholder={i === 1 && k === "uni" ? "Universidad Nacional / SENA / …" : ph} onChange={(e) => setU(u.map((y, j) => (j === i ? { ...y, [k]: e.target.value } : y)))} /></div>)}{num(x.tuition) > 0 && num(x.sem) > 0 && <p className="g91-note">Tuition for the whole program ≈ <b>{cop(num(x.tuition) * num(x.sem))}</b></p>}</div>)}</div>
      <p className="start-tip">💡 Look for: 'matrícula' or 'valor del semestre', 'becas', 'descuentos', 'ICETEX'. Public universities often charge by family income — write the value you found for a family like yours.</p>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30, { u })}>Save my research <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- C7 · Dream vs. Possible: 5 semestres ---------- */
function DreamBudget({ resp, existing, onSave, onExit }) {
  const u = resp?.c7_uni?.u || [{ uni: "Dream university", tuition: 15000000 }, { uni: "Possible university", tuition: 4000000 }];
  const [inc, setInc] = useState(existing?.inc ?? 7);
  const [live, setLive] = useState(existing?.live || [{ n: "Transport", v: "250000" }, { n: "Food", v: "400000" }, { n: "Materials & tech", v: "150000" }, { n: "Housing (if other city)", v: "0" }]);
  const [fund, setFund] = useState(existing?.fund || { family: "1000000", save: "3000000", schol: "0", job: "0" });
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const liveM = live.reduce((a, x) => a + num(x.v), 0);
  const costOf = (t) => { let tot = 0; const per = []; for (let s = 0; s < 5; s++) { const tu = num(t) * Math.pow(1 + inc / 100, Math.floor(s / 2)); const lv = liveM * 6; per.push(tu + lv); tot += tu + lv; } return { tot, per }; };
  const D = costOf(u[0].tuition); const Pp = costOf(u[1].tuition);
  const schol = num(fund.schol) / 100;
  const funds = (C, t) => num(fund.family) * 30 + num(fund.save) + num(t) * 5 * schol + num(fund.job) * 30;
  const gapD = D.tot - funds(D, u[0].tuition); const gapP = Pp.tot - funds(Pp, u[1].tuition);
  const loanPay = (g) => (g > 0 ? pmt(g, 0.01, 60) : 0);
  const G = [W_NUMBERS(3), W_COMPARE, { l: "If… will…", ex: "If I get a scholarship, I will…", re: /\bif\b[^.]*\b(will|would|'ll)\b/i }, W_TOPIC("Use 2 words", ["gap", "scholarship", "loan", "icetex", "savings", "tuition", "plan"], 2)];
  const ok = goalsOk(text, 40, 100, G);
  if (st.done) return <Reward title="Life plan with numbers! 🎓" subtitle={`Gap dream ${cop(Math.max(0, gapD))} · possible ${cop(Math.max(0, gapP))}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Calculator size={22} strokeWidth={2.1} />} title="Dream vs. Possible · 5 Semesters 🎓" subtitle="The real cost of the first 5 semesters (2.5 years): tuition that rises every year + living costs. Then your funding and your GAP." onExit={onExit}>
      <Brief91 k="c7_budget" />
      {!resp?.c7_uni && <div className="p1-banner bad"><span>Do the University Hunter first — now you see sample tuitions.</span></div>}
      <div className="g10-two">
        <div className="start-block"><h3>📈 Tuition increase per year</h3><Ctl l="Increase" v={inc} set={setInc} mn={0} mx={15} fmt={(x) => `${x}%`} /><h3>🏠 Living costs per month</h3>{live.map((x, i) => <div key={i} className="g11-inline"><input className="start-input" value={x.n} onChange={(e) => setLive(live.map((y, j) => (j === i ? { ...y, n: e.target.value } : y)))} /><MoneyInput value={x.v} onChange={(v) => setLive(live.map((y, j) => (j === i ? { ...y, v } : y)))} /></div>)}<p className="g91-note">Living: {cop(liveM)}/month · 6 months per semester</p></div>
        <div className="start-block"><h3>💰 How you will pay</h3><div className="p3-sentence edit"><span>👨‍👩‍👧 Family support per month</span><MoneyInput value={fund.family} onChange={(v) => setFund({ ...fund, family: v })} /></div><div className="p3-sentence edit"><span>🐷 My savings at 18 (Playbook)</span><MoneyInput value={fund.save} onChange={(v) => setFund({ ...fund, save: v })} /></div><div className="p3-sentence edit"><span>🎖️ Scholarship (% of tuition)</span><input className="start-input" type="number" value={fund.schol} onChange={(e) => setFund({ ...fund, schol: e.target.value })} /></div><div className="p3-sentence edit"><span>💼 Part-time job per month</span><MoneyInput value={fund.job} onChange={(v) => setFund({ ...fund, job: v })} /></div></div>
      </div>
      <MiniTable head={["", `🌟 ${u[0].uni}`, `🧭 ${u[1].uni}`]} rows={[["Semester 1", cop(D.per[0]), cop(Pp.per[0])], ["Semester 3", cop(D.per[2]), cop(Pp.per[2])], ["Semester 5", cop(D.per[4]), cop(Pp.per[4])], ["TOTAL 5 semesters", cop(D.tot), cop(Pp.tot)], ["My funding", cop(funds(D, u[0].tuition)), cop(funds(Pp, u[1].tuition))], ["GAP", cop(Math.max(0, gapD)), cop(Math.max(0, gapP))], ["If the gap is a loan (≈1%/month, 5 years): payment", cop(loanPay(gapD)), cop(loanPay(gapP))]]} />
      <ChartCard title="Cost vs. funding (5 semesters)"><BarChart bars={[{ label: "Dream cost", value: D.tot, color: "#c8743a" }, { label: "Dream funding", value: funds(D, u[0].tuition), color: "#3c9d5d" }, { label: "Possible cost", value: Pp.tot, color: "#e0a03a" }, { label: "Possible funding", value: funds(Pp, u[1].tuition), color: "#2e6b4a" }]} /></ChartCard>
      <div className="start-block"><h3>✍️ My study plan</h3><WordField value={text} onChange={setText} min={40} max={100} goals={G} placeholder="My dream option costs… for 5 semesters, but my funding covers only… If I get a 50% scholarship, I will… My Plan B is…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(36, { inc, live, fund, dream: Math.round(D.tot), possible: Math.round(Pp.tot), gapD: Math.round(gapD), gapP: Math.round(gapP), unis: [u[0].uni, u[1].uni], text })}>Save my study plan <span className="coin-tag"><Coins size={15} /> +36</span></button></div>
    </ActShell>
  );
}

/* ---------- C7 · Mi primer $1,000,000 a los 18 ---------- */
const FIRST_B = [{ k: "emerg", e: "🚑", l: "Emergency fund (cajita)", r: 9 }, { k: "goal", e: "🎯", l: "Goal with a date (CDT)", r: 10 }, { k: "etf", e: "🧺", l: "World / S&P 500 ETF", r: 9 }, { k: "usd", e: "💵", l: "Dollars", r: 3 }, { k: "learn", e: "📚", l: "A course / learning", r: 0 }, { k: "fun", e: "🎉", l: "Fun (guilt-free)", r: 0 }, { k: "spec", e: "🎲", l: "Speculation (crypto)", r: 0 }];
const STEPS18 = ["Get my cédula", "Open an account in my own name", "Check the entity is supervised (Superfinanciera)", "Turn on two-factor security", "Read the fees of any fund/platform", "Decide my monthly saving amount"];
function FirstMillion({ existing, onSave, onExit }) {
  const [al, setAl] = useState(existing?.alloc || { emerg: 30, goal: 20, etf: 25, usd: 5, learn: 10, fun: 10, spec: 0 });
  const [steps, setSteps] = useState(existing?.steps || []);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const sum = Object.values(al).reduce((a, v) => a + v, 0);
  const y1 = FIRST_B.reduce((a, b) => a + (1000000 * (al[b.k] || 0)) / 100 * (b.k === "learn" || b.k === "fun" ? 0 : 1 + b.r / 100), 0);
  const okE = al.emerg >= 20; const okS = al.spec <= 10;
  const G = [W_FUTURE, W_REASON, W_TOPIC("Use 2 words", ["emergency", "etf", "inflation", "risk", "goal", "supervised"], 2)];
  const ok = sum === 100 && okE && okS && steps.length >= 4 && goalsOk(text, 30, 80, G);
  if (st.done) return <Reward title="Ready for 18! 🪪" subtitle={`After a year ≈ ${cop(y1)} (illustrative)`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Wallet size={22} strokeWidth={2.1} />} title="My First $1,000,000 at 18 🪪" subtitle="A gift, your first salary or your savings: plan it BEFORE it arrives." onExit={onExit}>
      <Brief91 k="c7_first" />
      <AllocBars items={FIRST_B.map((b) => ({ ...b, d: b.r ? `~${b.r}%/year (illustrative)` : "" , c: "#3c9d5d" }))} vals={al} set={setAl} step={5} />
      <div className="g91-mini"><span className={okE ? "pos" : "neg"}>Emergency ≥ 20% <b>{okE ? "✓" : "✗"}</b></span><span className={okS ? "pos" : "neg"}>Speculation ≤ 10% <b>{okS ? "✓" : "✗"}</b></span><span>After 1 year ≈ <b>{cop(y1)}</b></span></div>
      <div className="start-block"><h3>✅ My checklist for the day I turn 18 (4+)</h3><div className="g10-qpick">{STEPS18.map((s) => <button key={s} type="button" className={steps.includes(s) ? "on" : ""} onClick={() => setSteps(steps.includes(s) ? steps.filter((x) => x !== s) : [...steps, s])}>{steps.includes(s) ? "✅" : "⬜"} {s}</button>)}</div></div>
      <div className="start-block"><h3>✍️ My plan</h3><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="I will keep 30% as an emergency fund in a supervised cajita because… and invest 25% in an ETF…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(28, { alloc: al, steps, y1: Math.round(y1), text })}>{sum !== 100 ? `Assign 100% (${sum}%)` : "Save my plan"} <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}

/* ---------- C8 · My Playbook at 18 (gran resumen) ---------- */
function Playbook({ resp, studentName, existing, onSave, onExit }) {
  const r = resp || {};
  const [rules, setRules] = useState(existing?.rules || r.c5_summary?.rules || ["", "", ""]);
  const [st, finish] = useFinish(onSave);
  const ok = rules.every((x) => countWords(x) >= 5);
  const P = PROF11[r.c1_dna?.profile || "mod"];
  const items = [
    ["🧬 My profile", r.c1_dna ? `${P.l} (score ${r.c1_dna.score}/24)` : "—"],
    ["🧪 My Lab portfolio", r.c6_portfolio ? `${mCOP(r.c6_portfolio.final)} after 10 real years (${pctTxt(r.c6_portfolio.cagr)} per year)` : "—"],
    ["🔥 Inflation lesson", r.c2_sim ? `Since ${r.c2_sim.from}: ${r.c2_sim.beat?.length || 0} assets beat inflation` : "—"],
    ["🕵️ Red flags I can see", r.c4_detective ? `${r.c4_detective.total} detective points` : "—"],
    ["🧺 My ETF", r.c5_build ? `${r.c5_build.name}: ${r.c5_build.sectors} sectors, fee ${r.c5_build.fee}%` : "—"],
    ["🔍 Fees", r.c5_fees ? `2% vs 0.1% could cost ${mCOP(r.c5_fees.lost)} in 30 years` : "—"],
    ["🌪️ Crash behavior", r.c6_crash ? `${r.c6_crash.crash}: me ${mCOP(r.c6_crash.final)} vs. holding ${mCOP(r.c6_crash.hold)}` : "—"],
    ["🎓 University plan", r.c7_budget ? `${r.c7_budget.unis?.join(" / ")} · gap ${cop(Math.max(0, r.c7_budget.gapD))} / ${cop(Math.max(0, r.c7_budget.gapP))}` : "—"],
    ["🪪 My first $1,000,000", r.c7_first ? FIRST_B.filter((b) => r.c7_first.alloc[b.k]).map((b) => `${b.e} ${r.c7_first.alloc[b.k]}%`).join(" · ") : "—"],
  ];
  if (st.done) return <Reward title="Playbook printed! 📗" subtitle="Your guide for the day you turn 18." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<BookOpen size={22} strokeWidth={2.1} />} title="My Playbook at 18 📗" subtitle="Everything you built this period in ONE page — plus your 3 money rules." onExit={onExit}>
      <Brief91 k="c8_playbook" />
      <div className="g11-playbook" id="g11-playbook"><small>FINFLUENT · GRADE 11 · INVESTOR LAB 18+</small><h2>📗 {studentName.split(" ")[0]}'s Playbook at 18</h2>
        {items.map(([l, v]) => <div key={l}><b>{l}</b><span>{v}</span></div>)}
        <div className="g11-sum-rules"><b>⭐ My 3 money rules</b>{rules.map((x, i) => <p key={i}>{i + 1}. {x || "…"}</p>)}</div></div>
      <div className="start-block"><h3>⭐ My 3 money rules (5+ words each)</h3>{rules.map((x, i) => <input key={i} className="start-input g11-gap" value={x} placeholder={["First my emergency fund, then…", "I never invest in…", "Every month I…"][i]} onChange={(e) => setRules(rules.map((y, j) => (j === i ? e.target.value : y)))} />)}</div>
      <div className="start-foot"><button className="s1-btn ghost" onClick={() => downloadPNG("g11-playbook", "My_Playbook_18.png")}><Download size={16} /> PNG</button><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(26, { rules, filled: items.filter((x) => x[1] !== "—").length })}>Save my Playbook <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
    </ActShell>
  );
}

/* ---------- C8 · Investment & Life Committee ---------- */
const RUB_P3 = [["prof", "Profile & portfolio coherent", "risk fits the profile"], ["data", "Uses REAL data", "inflation, 10 years, crashes"], ["flags", "Knows red flags & fees", "collapses, ETFs, fees"], ["life", "Realistic life plan", "university, gap, first million"], ["eng", "Clear financial English", "confident, with numbers"]];
function LifeCommittee({ resp, studentName, existing, onSave, onExit }) {
  const r = resp || {}; const P = PROF11[r.c1_dna?.profile || "mod"];
  const ev = [
    { k: "lab", e: "🧪", t: "Managed a portfolio with real data", ok: !!r.c1_alloc && !!r.c6_portfolio, d: r.c6_portfolio ? `${mCOP(r.c6_portfolio.final)} · ${pctTxt(r.c6_portfolio.cagr)}/year` : "Lab pending", fix: "Classes 1 & 6: Lab portfolio.", cert: `managed a simulated $10,000,000 portfolio through ten real years (${pctTxt(r.c6_portfolio?.cagr || 0)} a year)` },
    { k: "infl", e: "🔥", t: "Beat inflation with data", ok: !!r.c2_sim, d: r.c2_sim ? `Analysis since ${r.c2_sim.from}` : "Inflation pending", fix: "Class 2: Inflation Simulator.", cert: "analyzed ten years of Colombian inflation" },
    { k: "flags", e: "🕵️", t: "Detected red flags", ok: !!r.c4_detective, d: r.c4_detective ? `${r.c4_detective.total} detective points` : "Detective pending", fix: "Class 4: Bankruptcy Detective.", cert: "detected the red flags of corporate collapses" },
    { k: "etf", e: "🧺", t: "Built an ETF & a big summary", ok: !!r.c5_build && !!r.c5_summary, d: r.c5_build ? `${r.c5_build.name} · summary ${r.c5_summary?.right ?? "—"}/32` : "ETF pending", fix: "Class 5: ETF Builder + Big Summary.", cert: "built an ETF and an investment summary" },
    { k: "crash", e: "🌪️", t: "Survived a real crash", ok: !!r.c6_crash, d: r.c6_crash ? `${r.c6_crash.crash}: ${mCOP(r.c6_crash.final)}` : "Crash pending", fix: "Class 6: Crash Survival.", cert: "survived a historical market crash" },
    { k: "life", e: "🎓", t: "Planned university with numbers", ok: !!r.c7_budget, d: r.c7_budget ? `${r.c7_budget.unis?.join(" / ")}` : "Study plan pending", fix: "Class 7: University Hunter + Dream vs. Possible.", cert: "planned the cost of university with real research" },
  ];
  const got = ev.filter((x) => x.ok);
  const QA = [
    { k: "q1", e: "🔥", q: "“Inflation was 13% in 2022. How will YOUR money beat inflation after 18?”", goals: [W_NUMBERS(1), W_TOPIC("Use 2 words", ["inflation", "real", "etf", "cdt", "dollar", "return"], 2)], ph: "In 2022 prices rose 13.12%, so cash lost… I will…" },
    { k: "q2", e: "🌪️", q: "“The market falls 30% next year. What do you do with your investments?”", goals: [{ l: "If… will…", ex: "If it falls, I will…", re: /\bif\b[^.]*\b(will|would|'ll)\b/i }, W_TOPIC("Use 2 words", ["plan", "hold", "rebalanc", "panic", "horizon", "recover"], 2)], ph: "If the market falls 30%, I will… because in my crash simulation…" },
    { k: "q3", e: "🎓", q: "“How will you pay for your studies — and what's your Plan B?”", goals: [W_NUMBERS(2), W_TOPIC("Use 2 words", ["scholarship", "gap", "loan", "savings", "plan b", "tuition"], 2)], ph: "My dream option costs… for 5 semesters; my gap is… My Plan B is…" },
  ];
  const [qa, setQa] = useState(existing?.qa || {});
  const [stage, setStage] = useState(existing?.qa ? 1 : 0);
  const ready = !!r.c1_dna && !!r.c7_budget;
  if (stage === 0) return <QAStage title="Investment & Life Committee 🏛️ · Part 1" intro="Prove your evidence and answer the committee." evidence={ev} qa={qa} setQa={setQa} items={QA} ready={ready} readyMsg="You need your Investor DNA (Class 1) and your study plan (Class 7)." onNext={() => setStage(1)} onExit={onExit} brief={<Brief91 k="c8_pitch" />} />;
  const chapters = (v) => [
    { e: "🧬", t: "Who I am as an investor", s: r.c1_dna ? [`I am a ${P.l.split(" ")[0].toLowerCase()} investor.`, r.c1_alloc ? `My Lab portfolio: ${ASSET11.filter((a) => r.c1_alloc.alloc[a.k]).map((a) => `${r.c1_alloc.alloc[a.k]}% ${a.l}`).join(", ")}.` : ""].filter(Boolean) : [] },
    { e: "🧪", t: "Ten real years", s: r.c6_portfolio ? [`From 2015 to 2024 my $10,000,000 became ${mCOP(r.c6_portfolio.final)} — ${pctTxt(r.c6_portfolio.cagr)} a year.`] : [] },
    { e: "🕵️", t: "What I won't do", s: [r.c4_detective ? "I can spot red flags like Enron's hidden debts or FTX's mixed money." : "", r.c5_fees ? `High fees could cost me ${mCOP(r.c5_fees.lost)} in 30 years.` : ""].filter(Boolean) },
    { e: "🎓", t: "My studies", s: r.c7_budget ? [`Five semesters cost ${cop(r.c7_budget.dream)} at ${r.c7_budget.unis?.[0]} and ${cop(r.c7_budget.possible)} at ${r.c7_budget.unis?.[1]}.`] : [] },
    { e: "🪪", t: "My first million", s: r.c7_first ? [`${FIRST_B.filter((b) => r.c7_first.alloc[b.k]).map((b) => `${r.c7_first.alloc[b.k]}% ${b.l.toLowerCase()}`).join(", ")}.`] : [] },
    { e: "🏛️", t: "The committee asked me", s: QA.map((x) => `${x.e} ${dot(capF(qa[x.k] || ""))}`) },
    { e: "⭐", t: "My rules", s: (r.c8_playbook?.rules || []).filter(Boolean).map((x) => dot(capF(x))) },
  ];
  return (
    <PitchStudio icon={<Mic size={22} strokeWidth={2.1} />} title="Investment & Life Committee 🏛️ · Part 2" subtitle="Present your Playbook at 18 and your life plan with numbers." brief={<div className="p3-card-actions"><button className="s1-btn ghost" onClick={() => setStage(0)}><ChevronLeft size={16} /> Edit answers</button></div>}
      how={<>Your script builds itself from your profile, real-data results, red flags, study plan and Playbook. Add your closing line, press <b>Present</b> (3 minutes) and receive the committee's rating.</>}
      id="g11-life" ready={ready} readyMsg="You need your Investor DNA (Class 1) and your study plan (Class 7)."
      cover={{ tag: "INVESTMENT & LIFE COMMITTEE · GRADE 11 · INSTITUTO CREAR", title: `📗 ${studentName.split(" ")[0]}: My Money & Life at 18`, sub: P.l, say: `Good morning, committee. I'm ${studentName.split(" ")[0]}, and this is my plan for the day I turn 18.`, end: (vv) => `${vv.close ? dot(capF(vv.close)) : "…"} Thank you.` }}
      kpis={[{ l: "🧬 Profile", v: P.l }, { l: "🧪 10 years", v: r.c6_portfolio ? mCOP(r.c6_portfolio.final) : "—" }, { l: "🎓 Gap (possible)", v: r.c7_budget ? cop(Math.max(0, r.c7_budget.gapP)) : "—" }, { l: "🔎 Evidence", v: `${got.length}/6` }]}
      chapters={chapters} inputs={[{ k: "close", l: "💡 My closing line:", ph: "Inflation is silent, but my plan is louder…", min: 6 }]}
      rubric={RUB_P3} existing={existing} cert={{ e: "📈", title: "Investor 18+", name: studentName, text: got.length ? `${joinAnd(got.map((x) => x.cert))}.` : "built an investment and life plan for age 18." }}
      extraData={{ qa, evidence: got.map((x) => x.k) }} coins={46 + got.length * 2} onSave={onSave} onExit={onExit} />
  );
}

/* ---------- C8 · Boss P3 ---------- */
const BOSS11_3_MISSIONS = [
  { tag: "Real return", q: "Rate 11%, inflation 5%. Real return (exact, %, 1 decimal)?", answer: 5.7, unit: "%", tol: 0.1, hint: "1.11 ÷ 1.05 − 1", explain: "≈ 5.7%." },
  { tag: "P/E", q: "Price $45, earnings per share $3. P/E?", answer: 15, unit: "×", hint: "45 ÷ 3", explain: "15×." },
  { tag: "ETF", q: "$5,000,000 in an ETF of 100 equal companies. One goes to zero. Loss?", answer: 50000, money: true, hint: "5,000,000 ÷ 100", explain: "$50,000 (1%)." },
  { tag: "Fees", q: "A 1.2% fee on $15,000,000 per year?", answer: 180000, money: true, hint: "15,000,000 × 0.012", explain: "$180,000." },
  { tag: "Gap", q: "5 semesters cost $40,000,000. Funding $28,000,000. Gap?", answer: 12000000, money: true, hint: "40 − 28 million", explain: "$12,000,000." },
];
const BOSS11_3_Q = [
  { t: "Assets", q: "Which asset is best for an emergency fund?", options: ["Bitcoin, because you can sell it any day.", "A 1-year CDT with a good interest rate.", "A supervised cajita or savings account.", "One tech stock that is growing fast."], correct: 2 },
  { t: "Assets", q: "Higher expected return usually comes with…", options: ["higher risk.", "lower risk.", "no risk.", "guaranteed profit."], correct: 0 },
  { t: "Inflation", q: "Colombia's inflation in 2022 was about…", options: ["1.6%.", "5.2%.", "13.1%.", "30%."], correct: 2 },
  { t: "Inflation", q: "Real return =", options: ["rate + inflation, because both make money grow.", "rate × inflation, for the whole year.", "inflation − rate, always in pesos.", "(1 + rate) ÷ (1 + inflation) − 1."], correct: 3 },
  { t: "Companies", q: "A very low P/E can mean…", options: ["always a bargain you must buy quickly.", "a bargain — or a company in trouble.", "the company has no shares on the exchange.", "the company pays no taxes this year."], correct: 1 },
  { t: "Collapses", q: "What did FTX do wrong?", options: ["It used clients' deposits for risky bets.", "It paid too many taxes in the Bahamas.", "It refused to use celebrity ads and sponsors.", "It had too few users to pay its costs."], correct: 0 },
  { t: "Collapses", q: "Who lost the most in Enron's fall?", options: ["People with diversified ETFs of many companies.", "People who had emergency funds in banks.", "People who never invested in the stock market.", "Employees with their savings in Enron shares."], correct: 3 },
  { t: "ETFs", q: "Two ETFs track the same index. Choose…", options: ["the one with the higher fee.", "the one with the lower fee.", "the newest one in the market, because it is modern.", "the most advertised one."], correct: 1 },
  { t: "Life plan", q: "The best way to compare universities is…", options: ["the cost of the first semester only.", "the university's popularity and its followers on social media.", "the full cost (tuition + living) and the funding gap.", "the color of the campus and the design of its buildings."], correct: 2 },
  { t: "Life plan", q: "At 18, before investing with an entity, check that it is…", options: ["supervised by the Superintendencia Financiera.", "recommended by an influencer with many followers.", "the one that promises the highest return.", "an international company with big offices."], correct: 0 },
];
const BOSS11_3_TIPS = { Assets: "Risk, return, liquidity.", Inflation: "Real return = (1+r)/(1+i) − 1.", Companies: "5 numbers: growth, margin, debt, P/E, cash.", Collapses: "Red flags + diversification.", ETFs: "Diversified, low fees.", "Life plan": "Full cost, funding, gap, Plan B." };
function BossP3_11({ resp, studentName, onSave, onExit }) {
  const r = resp || {}; const P = PROF11[r.c1_dna?.profile || "mod"];
  const card = <FMCardView id="g11-card3" card={FM_CARDS[2]} name={studentName} lines={[`Profile: ${P.l}`, r.c6_portfolio ? `10 real years: ${mCOP(r.c6_portfolio.final)}` : "", r.c5_build ? `My ETF: ${r.c5_build.name}` : "", "I check: supervised? fees? diversified?"]} />;
  return <BossExam icon={<Swords size={22} strokeWidth={2.1} />} title="Boss P3 · Investor Lab ⚔️" subtitle="5 missions + 10 questions. 70% unlocks your Founder Card." brief={<Brief91 k="c8_boss" />} missions={BOSS11_3_MISSIONS} questions={BOSS11_3_Q} tips={BOSS11_3_TIPS} cardNode={card} onSave={onSave} onExit={onExit} />;
}
const CAN_P3 = [
  { t: "I can place any asset on the risk–return–liquidity map.", ev: (r) => (r.c1_map ? `${r.c1_map.score}/10 like the experts` : null) },
  { t: "I can calculate real returns with real inflation data.", ev: (r) => (r.c2_sim ? `Analysis since ${r.c2_sim.from}` : null) },
  { t: "I can read a company with 5 numbers.", ev: (r) => (r.c3_research ? `${r.c3_research.c?.[0]?.name} vs. ${r.c3_research.c?.[1]?.name}` : null) },
  { t: "I can detect red flags before a collapse.", ev: (r) => (r.c4_detective ? `${r.c4_detective.total} points` : null) },
  { t: "I can build an ETF and explain fees.", ev: (r) => (r.c5_build ? `${r.c5_build.name} · fee ${r.c5_build.fee}%` : null) },
  { t: "I can stay calm in a crash.", ev: (r) => (r.c6_crash ? `${r.c6_crash.crash}: ${mCOP(r.c6_crash.final)}` : null) },
  { t: "I can plan the cost of my studies.", ev: (r) => (r.c7_budget ? `Gap ${cop(Math.max(0, r.c7_budget.gapP))} (possible)` : null) },
  { t: "I have a plan for my first $1,000,000 at 18.", ev: (r) => (r.c7_first ? `Emergency ${r.c7_first.alloc.emerg}% · ETF ${r.c7_first.alloc.etf}%` : null) },
];

/* =====================================================================
   GUÍA DE CADA ACTIVIDAD · 11° PERIODO 3
   ===================================================================== */
const ZONE_WIN = (c) => [["All goals done, each with evidence", "required"], ["Mission complete", `+${c} 🪙`]];
const B_ROUNDS = (goal) => ({ goal, steps: ["Solve each problem (calculator allowed).", "Use the hint if you need it.", "Read the explanation after each answer."], win: [["Each answer right on the first try", "+3 🪙"], ["Finishing", "+8 🪙"]] });
const GUIDE = {
  c1_read: B_READ("Learn the map of investing: the 7 big asset classes, risk, return and liquidity.", "Next: Asset Map Builder."),
  c1_map: { goal: "Place 10 real assets on the risk–return map and rate their liquidity.", steps: ["Tap an asset, then tap its square.", "Rate its liquidity from 1 to 5.", "Compare with the experts.", "Move what you got wrong and save."], win: [["Base", "+18 🪙"], ["Each asset close to the experts", "+2 🪙"]], tip: "If something is top-left (high return, no risk), it's probably a scam." },
  c1_dna: { goal: "Discover your investor profile: need, ability and willingness to take risk.", steps: ["Answer 8 honest questions.", "There are no wrong answers.", "Read your profile and target risk."], win: [["Saving your DNA", "+24 🪙"]] },
  c1_alloc: { goal: "Split a simulated $10,000,000 among 7 assets. It will travel through REAL data 2015–2024 in Class 6.", steps: ["Assign 100% (max 50% in one asset).", "Check the risk fits your profile.", "Explain your mix with 'If…, … will…'."], win: [["Base", "+28 🪙"], ["Risk fits your profile", "+6 🪙"]] },
  c2_video: B_VIDEO("Watch how inflation eats your money — and what beats it.", "Next: the real numbers of Colombia."),
  c2_read: B_READ("Read ten years of Colombian inflation (DANE) and what happened to $1,000,000 under the mattress.", "Next: Inflation Simulator."),
  c2_sim: { goal: "Use REAL data: which assets kept their purchasing power since the year you choose?", steps: ["Choose a start year.", "Read the chart and the table.", "Mark ALL the assets that beat inflation.", "Write what the data says."], win: [["Base", "+26 🪙"], ["All winners right", "+6 🪙"]] },
  c2_beat: B_ROUNDS("Real returns with real years: 2022, 2023, the dollar and cash."),
  c3_read: B_READ("Learn to read a company like an analyst: 5 numbers that tell its story.", "Next: Stock Picker."),
  c3_picker: { goal: "Build a 3-company portfolio using 5 numbers — then jump 3 years into the future.", steps: ["Read the 8 companies' numbers.", "Split 100% among max 3 companies.", "Jump 3 years and compare with the equal-weight basket.", "Write what the numbers told you."], win: [["Base", "+26 🪙"], ["You beat the basket", "+6 🪙"]] },
  c3_research: { goal: "Use your tablet to research TWO real companies — and decide which one you'd own for 10 years.", steps: ["Search on Yahoo Finance or Google Finance.", "Fill the 8 fields of each company (with source).", "Compare and decide."], win: [["Saving your research", "+30 🪙"]], tip: "Write the date: prices change every second." },
  c3_rounds: B_ROUNDS("Ratios: margin, growth, EPS, P/E and debt."),
  c3_zone: { goal: "TEAM ZONE: your team is an investment club. Each member presents a real company; the team buys only one.", steps: ["Each member presents their company in 60 seconds.", "Fill the comparison table.", "Vote and justify the choice.", "Write the biggest risk."], win: ZONE_WIN(26) },
  c4_read: B_READ("Enron, Lehman, Interbolsa and FTX: what happens to investors when a company collapses.", "Next: Bankruptcy Detective."),
  c4_detective: { goal: "Investigate 4 dossiers. Find the red flags and predict who will collapse.", steps: ["Read the numbers and the news.", "Mark the red and green flags.", "Predict: collapse or survive?", "Reveal the future."], win: [["Base", "+18 🪙"], ["Each correct flag and prediction", "+2 🪙"]] },
  c4_impact: { goal: "Feel diversification: $10,000,000 in ONE company vs. an ETF of 50 — when one goes to zero.", steps: ["Pick one company.", "Run 3 years.", "Solve 3 problems."], win: [["Base", "+18 🪙"], ["Each problem on the first try", "+3 🪙"]] },
  c4_rush: B_RUSH("Red flag or green flag? 14 signals of scams, collapses and healthy investments."),
  c5_video: B_VIDEO("Watch what an ETF is and why millions of people use them.", "Next: ETF Builder."),
  c5_build: { goal: "Create your own ETF: 10 companies, sectors and a fee — and compete with the full index.", steps: ["Choose 10 of 15 companies.", "Name your ETF and choose its fee.", "Run 5 years and read the chart."], win: [["Base", "+24 🪙"], ["5+ sectors", "+4 🪙"], ["Fee ≤ 0.5%", "+4 🪙"]] },
  c5_fees: { goal: "See the silent thief: the same investment for 30 years with fees of 0.1%, 1% and 2%.", steps: ["Move the monthly investment and the return.", "Read the 3 lines.", "Solve 3 problems."], win: [["Base", "+18 🪙"], ["Each problem on the first try", "+3 🪙"]] },
  c5_summary: { goal: "Build your BIG investment summary: 8 assets × risk, liquidity, horizon and how to buy at 18.", steps: ["Fill all 32 cells.", "Check with the experts and fix the red ones.", "Write your 3 golden rules.", "Download it as PNG."], win: [["Base", "+20 🪙"], ["Cells like the experts", "up to +16 🪙"]] },
  c6_machine: { goal: "Travel to any year 2015–2023 with $10,000,000: all at once or a part every year?", steps: ["Choose the start year.", "Choose lump sum or DCA.", "Compare value, real value and worst year.", "Write what you learned."], win: [["Saving your trip", "+30 🪙"]] },
  c6_crash: { goal: "Live a REAL crash month by month (2008 or 2020). Hold, sell or buy back?", steps: ["Choose a crash.", "Decide before each month.", "Compare with 'just holding'.", "Write what you felt and learned."], win: [["Base", "+26 🪙"], ["You did as well as holding", "+6 🪙"]] },
  c6_portfolio: { goal: "The mix you chose in Class 1 travels through ten real years.", steps: ["Turn rebalancing on or off.", "Compare with the CDT and with prices.", "Read your real value and worst year.", "Tell your portfolio's story."], win: [["Saving your 10 years", "+32 🪙"]] },
  c6_rounds: B_ROUNDS("CAGR, real growth, DCA, drawdowns and recoveries."),
  c6_zone: { goal: "TEAM ZONE: the team creates ONE team fund — every member must agree.", steps: ["Compare each member's Lab result.", "Agree one mix (100%).", "Agree what you do in a 30% crash.", "Everybody signs."], win: ZONE_WIN(24) },
  c7_read: B_READ("Turning 18 in Colombia: cédula, accounts, Fogafín, scams, ICETEX — the real first steps.", "Next: University Hunter."),
  c7_uni: { goal: "Use your tablet: research your DREAM option and a POSSIBLE option with real prices.", steps: ["Search the official website.", "Fill program, semesters, tuition and scholarships.", "Write the source and date."], win: [["Saving your research", "+30 🪙"]], tip: "Search 'valor matrícula', 'becas', 'ICETEX'." },
  c7_budget: { goal: "Build the budget of your first 5 semesters — dream vs. possible — and find your GAP.", steps: ["Set the tuition increase per year.", "Write your living costs.", "Write how you will pay (family, savings, scholarship, job).", "Read the gap and the loan payment; write your plan."], win: [["Saving your study plan", "+36 🪙"]] },
  c7_first: { goal: "Plan your first $1,000,000 at 18 — before it arrives.", steps: ["Split it in 7 boxes (emergency ≥ 20%, speculation ≤ 10%).", "Choose 4+ steps for your 18th birthday.", "Write your plan."], win: [["Saving your plan", "+28 🪙"]] },
  c7_zone: { goal: "TEAM ZONE: career & university fair. Every member shares their plan and gets feedback.", steps: ["Each member shares career, university and cost.", "The team finds one scholarship for each member.", "Each member writes their Plan B."], win: ZONE_WIN(26) },
  c8_playbook: { goal: "Print your Playbook at 18: everything you built this period in ONE page.", steps: ["Check each line (complete what's missing).", "Write your 3 money rules.", "Download it as PNG."], win: [["Saving your Playbook", "+26 🪙"]] },
  c8_pitch: { goal: "THE PERIOD 3 PROJECT: present your money & life plan to the Investment & Life Committee.", steps: ["Check your evidence board.", "Answer 3 hard questions.", "Present for 3 minutes.", "Receive the committee's rating and your certificate."], win: [["Evidence + answers + jury", "required"], ["Investor 18+ certificate", "+46 🪙"], ["Each evidence line", "+2 🪙"]] },
  c8_boss: { goal: "Beat the Period 3 boss and unlock your third Founder Card.", steps: ["Part 1: 5 missions.", "Part 2: 10 questions.", "Read your feedback by topic."], win: [["70% or more", "Founder Card 📈"], ["Each question right", "+4 🪙"], ["Each mission on the first try", "+4 🪙"]] },
  c8_can: { goal: "Look back: what can you do now with your money and your future?", steps: ["Read each 'I can' and your evidence.", "Rate yourself honestly.", "Write what you're proudest of."], win: [["Saving your recap", "+20 🪙"]] },
};

/* =====================================================================
   ESTRUCTURA · 11° PERIODO 3 · INVESTOR LAB 18+ & LIFE PLAN (8 clases)
   ===================================================================== */
const G11P3_WEEKS = [
  { n: 1, title: "The Map of Investing", e: "🗺️", blurb: "Seven asset classes, one profile — and a $10,000,000 Lab portfolio.", skills: ["Reading", "Asset map", "DNA", "Lab"], acts: [
    A11("c1_read", "Reading: The Map Nobody Gave You 📰", "Asset classes · 8 questions.", <Newspaper size={22} />, 42, "quizzes"),
    A11("c1_map", "Asset Map Builder 🗺️", "10 assets · risk, return, liquidity.", <MapIcon size={22} />, 38, "aprendi"),
    A11("c1_dna", "Investor DNA 2.0 🧬", "8 questions · your profile.", <Brain size={22} />, 24, "aprendi"),
    A11("c1_alloc", "Investor Lab · $10,000,000 🧪", "Your portfolio for 10 real years.", <FlaskConical size={22} />, 34, "aprendi"),
  ] },
  { n: 2, title: "Beat Inflation", e: "🔥", blurb: "Ten real years of Colombian prices: who kept their purchasing power?", skills: ["Video", "Reading", "Real data", "Rounds"], acts: [
    A11("c2_video", "Video: Inflation 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A11("c2_read", "Reading: The Silent Tax 📰", "DANE 2015–2024 · 8 questions.", <Newspaper size={22} />, 42, "quizzes"),
    A11("c2_sim", "Inflation Simulator 🔥", "Real data · 7 assets.", <Flame size={22} />, 32, "aprendi"),
    A11("c2_beat", "Real Return Rounds 🧮", "6 real-year problems.", <Percent size={22} />, 26, "aprendi"),
  ] },
  { n: 3, title: "Read a Company", e: "🔎", blurb: "Five numbers, eight companies, two real ones on your tablet.", skills: ["Reading", "Stock picker", "Research", "Team Zone"], acts: [
    A11("c3_read", "Reading: Read It Like an Analyst 📰", "5 numbers · 8 questions.", <Newspaper size={22} />, 42, "quizzes"),
    A11("c3_picker", "Stock Picker 🔎", "8 companies · jump 3 years.", <Search size={22} />, 32, "aprendi"),
    A11("c3_research", "Real Company Research 🧾", "Tablet · 2 real companies.", <Globe size={22} />, 30, "aprendi"),
    A11("c3_rounds", "Ratio Rounds 🧮", "6 problems.", <Calculator size={22} />, 26, "aprendi"),
    A11("c3_zone", "Team Zone · Investment Club 🧑‍🤝‍🧑", "Present · compare · vote.", <Users size={22} />, 26, "aprendi"),
  ] },
  { n: 4, title: "When Companies Collapse", e: "💥", blurb: "Enron, Lehman, Interbolsa, FTX — and why diversification saves you.", skills: ["Reading", "Detective", "Diversification", "Rush"], acts: [
    A11("c4_read", "Reading: The Day the Money Disappeared 📰", "4 collapses · 8 questions.", <Newspaper size={22} />, 42, "quizzes"),
    A11("c4_detective", "Bankruptcy Detective 🕵️", "4 dossiers · flags · predict.", <ShieldAlert size={22} />, 38, "aprendi"),
    A11("c4_impact", "One Stock vs. an ETF 🧺", "One goes to zero.", <Layers size={22} />, 27, "aprendi"),
    A11("c4_rush", "Red Flag Rush 🚩", "14 signals · 2 boxes.", <Zap size={22} />, 24, "aprendi"),
  ] },
  { n: 5, title: "ETFs & the Big Summary", e: "🧺", blurb: "Build your own ETF, catch the silent thief and summarize EVERYTHING.", skills: ["Video", "ETF builder", "Fees", "Summary"], acts: [
    A11("c5_video", "Video: What Is an ETF? 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A11("c5_build", "ETF Builder 🧺", "10 companies · fee · 5 years.", <Layers size={22} />, 32, "aprendi"),
    A11("c5_fees", "The Silent Thief: Fees 🔍", "30 years · 3 fees.", <Percent size={22} />, 27, "aprendi"),
    A11("c5_summary", "My Big Investment Summary 📘", "8 assets × 4 columns + rules.", <BookOpen size={22} />, 36, "aprendi"),
  ] },
  { n: 6, title: "Time Machine", e: "⏳", blurb: "Real years, real crashes, your real Lab portfolio.", skills: ["Time machine", "Crash", "Lab run", "Team Zone"], acts: [
    A11("c6_machine", "Time Machine ⏳", "Lump sum vs. DCA · real data.", <Hourglass size={22} />, 30, "aprendi"),
    A11("c6_crash", "Crash Survival 🌪️", "2008 or 2020 · month by month.", <TrendingDown size={22} />, 32, "aprendi"),
    A11("c6_portfolio", "My Lab Portfolio 2015–2024 🧪", "Your Class 1 mix · 10 years.", <LineIcon size={22} />, 32, "aprendi"),
    A11("c6_rounds", "CAGR & Crash Rounds 🧮", "6 problems.", <Calculator size={22} />, 26, "aprendi"),
    A11("c6_zone", "Team Zone · Our Team Fund 🧑‍🤝‍🧑", "One mix · one crash plan.", <Users size={22} />, 24, "aprendi"),
  ] },
  { n: 7, title: "My Life Plan", e: "🎓", blurb: "University, careers, real costs — and your first $1,000,000 at 18.", skills: ["Reading", "Research", "Budget", "Team Zone"], acts: [
    A11("c7_read", "Reading: Eighteen 📰", "First steps at 18 · 8 questions.", <Newspaper size={22} />, 42, "quizzes"),
    A11("c7_uni", "University Hunter 🎓", "Tablet · dream + possible.", <GraduationCap size={22} />, 30, "aprendi"),
    A11("c7_budget", "Dream vs. Possible · 5 Semesters 💰", "Costs · funding · gap.", <Calculator size={22} />, 36, "aprendi"),
    A11("c7_first", "My First $1,000,000 at 18 🪪", "7 boxes + checklist.", <Wallet size={22} />, 28, "aprendi"),
    A11("c7_zone", "Team Zone · Career Fair 🧑‍🤝‍🧑", "Plans · scholarships · Plan B.", <Users size={22} />, 26, "aprendi"),
  ] },
  { n: 8, title: "Investor 18+ Day", e: "📈", blurb: "Your Playbook, the committee, the boss and your recap.", skills: ["Playbook", "Committee", "Boss", "Recap"], acts: [
    A11("c8_playbook", "My Playbook at 18 📗", "One page · 3 rules.", <BookOpen size={22} />, 26, "aprendi"),
    A11("c8_pitch", "Investment & Life Committee 🏛️ · THE PROJECT", "Evidence · Q&A · present · certificate.", <Mic size={22} />, 58, "aprendi"),
    A11("c8_boss", "Boss P3 + Founder Card ⚔️", "5 missions + 10 questions (70%).", <Swords size={22} />, 70, "quizzes"),
    A11("c8_can", "What I Can Do Now ✅", "Recap with evidence.", <BadgeCheck size={22} />, 20, "comportamiento"),
  ] },
];

const ZONES_P3 = {
  c3_zone: { title: "Team Zone · Investment Club 🧑‍🤝‍🧑", subtitle: "Every member brings one real company (from the tablet). The club can buy only ONE.", goals: [
    { k: "table", e: "📊", t: "Each member's company", cols: [{ k: "who", l: "Member", ph: "Ana" }, { k: "co", l: "Company", ph: "Bancolombia" }, { k: "pe", l: "P/E", type: "num", ph: "6" }, { k: "y1", l: "1-year %", type: "num", ph: "18" }], min: 3 },
    { k: "vote", e: "🗳️", t: "The company we buy and the vote", ph: "Apple · 3 votes vs. 1 · because…" },
    { k: "why", e: "💡", t: "Why this one? (2 numbers)", words: 15, ph: "Its margin is 25% and its debt is low, while…" },
    { k: "risk", e: "⚠️", t: "Its biggest risk", ph: "It depends on China for production…" },
  ], coins: 26, minutes: 30 },
  c6_zone: { title: "Team Zone · Our Team Fund 🧑‍🤝‍🧑", subtitle: "Compare your Lab results and agree ONE team fund — and ONE crash plan.", goals: [
    { k: "res", e: "🧪", t: "Each member's Lab result (2015–2024)", cols: [{ k: "who", l: "Member", ph: "Luis" }, { k: "end", l: "End value $", type: "num", ph: "18500000" }, { k: "worst", l: "Worst year %", type: "num", ph: "-9" }], min: 3 },
    { k: "mix", e: "🥧", t: "Our team fund (must add up to 100%)", ph: "40% S&P 500 ETF, 30% CDT, 20% dollars, 10% gold" },
    { k: "crash", e: "🌪️", t: "If the market falls 30%, our team will…", words: 12, ph: "If it falls 30%, we will rebalance and not sell, because…" },
    { k: "sign", e: "✍️", t: "Everybody signs (write the names)", ph: "Ana, Luis, Sofía" },
  ], coins: 24, minutes: 25 },
  c7_zone: { title: "Team Zone · Career Fair 🧑‍🤝‍🧑", subtitle: "Share your plan, help each other find money, and write a Plan B.", goals: [
    { k: "plans", e: "🎓", t: "Each member's career plan", cols: [{ k: "who", l: "Member", ph: "Sofía" }, { k: "career", l: "Career", ph: "Medicine" }, { k: "uni", l: "University", ph: "U. de Antioquia" }, { k: "cost", l: "Semester $", type: "num", ph: "1200000" }], min: 3 },
    { k: "schol", e: "🎖️", t: "One scholarship or financing option for each member (with link)", words: 12, ph: "Sofía: Generación E · Luis: ICETEX Tú Eliges…" },
    { k: "planb", e: "🧭", t: "Each member's Plan B", words: 12, ph: "Ana: technical program at SENA first, then…" },
  ], coins: 26, minutes: 35 },
};

const P3x = (resp) => resp?.__p1 || {};
const CFG113 = {
  n: 3, KEY: "11P3", title: "Investor Lab 18+ & Life Plan 📈",
  question: "What will you do with your money — and your future — the day you turn 18?",
  howyear: "You leave the company for a moment and become an investor: real Colombian data, real crashes, real collapses, ETFs and fees. Then the most important investment: your studies. The project ends with the Investment & Life Committee.",
  chips: ["🔥 Beat inflation", "🧺 ETFs", "🎓 Life plan"], bigKeys: ["c8_pitch"], pageKeys: ["c3_zone", "c6_zone", "c7_zone"],
  weeks: G11P3_WEEKS,
  panel: (ctx, compact) => { const co = co11(P3x(ctx.resp)); const r = ctx.resp || {}; return <FounderPanel co={co} have={ctx.have} compact={compact} studentName={ctx.name} title="PERIOD 3 · INVESTOR 18+" stats={[{ l: "🧬 Profile", v: r.c1_dna ? PROF11[r.c1_dna.profile].l : "—" }, { l: "🧪 Lab 10 years", v: r.c6_portfolio ? mCOP(r.c6_portfolio.final) : r.c1_alloc ? "Opened" : "—" }, { l: "🧺 My ETF", v: r.c5_build?.name || "—" }, { l: "🎓 Study gap", v: r.c7_budget ? cop(Math.max(0, r.c7_budget.gapP)) : "—", c: r.c7_budget && r.c7_budget.gapP <= 0 ? "pos" : "" }]} />; },
  render: (act, ctx) => {
    const P = { onSave: ctx.save, onExit: ctx.exit };
    const L = mkLearn(ctx, Brief91);
    const Z = ZONES_P3[act];
    if (Z) return <TeamZone {...Z} brief={<Brief91 k={act} />} resp={ctx.resp} existing={ctx.existing} {...P} />;
    switch (act) {
      case "c1_read": return L.reading("c1_read", "The Map Nobody Gave You", "Seven asset classes and the three questions behind every investment.", READ_MAP, GLOSS_MAP, Q_MAP, "📰");
      case "c1_map": return <AssetMap existing={ctx.existing} {...P} />;
      case "c1_dna": return <InvestorDNA2 existing={ctx.existing} {...P} />;
      case "c1_alloc": return <LabPortfolio resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c2_video": return L.video("c2_video", VID_INFL11, "Inflation", VQ_INFL11);
      case "c2_read": return L.reading("c2_read", "The Silent Tax", "Ten years of Colombian inflation — and your $1,000,000.", READ_INFL, GLOSS_INFL, Q_INFL, "📰");
      case "c2_sim": return <InflationSim existing={ctx.existing} {...P} />;
      case "c2_beat": return <NumberRounds icon={<Percent size={22} strokeWidth={2.1} />} title="Real Return Rounds 🧮" subtitle="Real years, real rates, real inflation." intro={<Brief91 k="c2_beat" />} rounds={BEAT_R} coinsPer={3} bonus={8} doneTitle="Inflation fighter! 🔥" {...P} />;
      case "c3_read": return L.reading("c3_read", "Read It Like an Analyst", "Five numbers that tell a company's story.", READ_COMPANY, GLOSS_COMPANY, Q_COMPANY, "📰");
      case "c3_picker": return <StockPicker existing={ctx.existing} {...P} />;
      case "c3_research": return <CompanyResearch existing={ctx.existing} {...P} />;
      case "c3_rounds": return <NumberRounds icon={<Calculator size={22} strokeWidth={2.1} />} title="Ratio Rounds 🧮" subtitle="The analyst's calculator." intro={<Brief91 k="c3_rounds" />} rounds={RATIO_R} coinsPer={3} bonus={8} doneTitle="Analyst! 🔎" {...P} />;
      case "c4_read": return L.reading("c4_read", "The Day the Money Disappeared", "Enron, Lehman Brothers, Interbolsa and FTX.", READ_COLLAPSE, GLOSS_COLLAPSE, Q_COLLAPSE, "📰");
      case "c4_detective": return <BankruptcyDetective existing={ctx.existing} {...P} />;
      case "c4_impact": return <OneVsMany existing={ctx.existing} {...P} />;
      case "c4_rush": return L.rush("c4_rush", "Red Flag Rush 🚩", "Scam, collapse — or a healthy sign?", RUSH_FLAGS, "Flag hunter! 🚩", 75);
      case "c5_video": return L.video("c5_video", VID_ETF11, "What Is an ETF?", VQ_ETF11);
      case "c5_build": return <ETFBuilder existing={ctx.existing} {...P} />;
      case "c5_fees": return <FeeImpact existing={ctx.existing} {...P} />;
      case "c5_summary": return <BigSummary existing={ctx.existing} {...P} />;
      case "c6_machine": return <TimeMachine existing={ctx.existing} {...P} />;
      case "c6_crash": return <CrashSurvival existing={ctx.existing} {...P} />;
      case "c6_portfolio": return <LabRun resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c6_rounds": return <NumberRounds icon={<Calculator size={22} strokeWidth={2.1} />} title="CAGR & Crash Rounds 🧮" subtitle="Growth, losses and recoveries." intro={<Brief91 k="c6_rounds" />} rounds={CAGR_R} coinsPer={3} bonus={8} doneTitle="Long-term thinker! ⏳" {...P} />;
      case "c7_read": return L.reading("c7_read", "Eighteen", "Your cédula, your first account and your first big decisions.", READ_AT18, GLOSS_AT18, Q_AT18, "📰");
      case "c7_uni": return <UniHunter existing={ctx.existing} {...P} />;
      case "c7_budget": return <DreamBudget resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c7_first": return <FirstMillion existing={ctx.existing} {...P} />;
      case "c8_playbook": return <Playbook resp={ctx.resp} studentName={ctx.name} existing={ctx.existing} {...P} />;
      case "c8_pitch": return <LifeCommittee resp={ctx.resp} studentName={ctx.name} existing={ctx.existing} {...P} />;
      case "c8_boss": return <BossP3_11 resp={ctx.resp} studentName={ctx.name} {...P} />;
      case "c8_can": return <WhatICan title="What I Can Do Now ✅ · Period 3" items={CAN_P3} resp={ctx.resp} existing={ctx.existing} brief={<Brief91 k="c8_can" />} {...P} />;
      default: return null;
    }
  },
};
export const Periodo3G11 = (props) => <PeriodShell10 cfg={CFG113} {...props} />;