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
import "../Styles/once2.css";     // 11° · Periodo 2
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   GRADO 11 · PERIODO 2 · SHARK TANK: FUND IT & VALUE IT (B2+)
   Año "FOUNDER YEAR": cada periodo lee las filas anteriores ("11P1"…"11P3") y suma una Founder Card.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "11P2", Grado = "11".
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
            <button type="button" className={`g11-check ${o.done ? "on" : ""} ${!o.done && evOk(x) ? "ready" : ""}`} onClick={() => up(x.k, { done: !o.done })} aria-label="mark as done">{o.done ? "✓" : i + 1}</button>
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
              {!o.done && evOk(x) && <i className="g11-need tap">👆 Evidence ready! Tap the number {i + 1} to mark this goal as DONE.</i>}
            </div>
          </div>
        );
      })}</div>
      {extra}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!okAll} onClick={() => finish(coins, { goals: g, minutesUsed: Math.round((minutes * 60 - left) / 60) })}>{okAll ? "Our mission is complete" : `Tap each goal number to mark it done (${doneN}/${goals.length})`} <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
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
   11° · PERIODO 2 · SHARK TANK — LECTURAS (THE CREAR TIMES, B2+) Y VIDEO
   ===================================================================== */

/* =====================================================================
   AYUDAS DE CONTEXTO (P2): guía "antes de empezar", fórmula por pregunta
   y ejemplo resuelto para las lecturas.
   ===================================================================== */
function Guide11({ title = "📘 Before you start: what you need to know", intro, items = [], open: startOpen = true }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <div className={`g11-guide ${open ? "open" : ""}`}>
      <button type="button" className="g11-guide-head" onClick={() => setOpen(!open)}><b>{title}</b><span>{open ? "Hide ▲" : "Show ▼"}</span></button>
      {open && <div className="g11-guide-body">
        {intro && <p className="g11-guide-intro">{intro}</p>}
        <div className="g11-guide-grid">{items.map((x, i) => (
          <div key={i} className="g11-guide-item">
            <b>{x.e} {x.t}</b>
            {x.d && <p>{x.d}</p>}
            {x.f && <div className="g10-formula">{x.f}</div>}
            {x.ex && <div className="g11-ex"><small>EXAMPLE</small>{Array.isArray(x.ex) ? <ol>{x.ex.map((s, j) => <li key={j}>{s}</li>)}</ol> : <p>{x.ex}</p>}</div>}
          </div>
        ))}</div>
      </div>}
    </div>
  );
}
/* Fórmula + pasos dentro de cada problema (RoundsRunner muestra r.visual) */
const F11 = (f, steps) => <div className="g11-rhelp"><div className="g10-formula">{f}</div>{steps && <ol>{steps.map((s, i) => <li key={i}>{s}</li>)}</ol>}</div>;
/* Ejemplo resuelto dentro de una lectura */
function Calc11({ title, formula, steps = [], result }) {
  return (
    <div className="g11-calc">
      <small>🧮 WORKED EXAMPLE</small>
      <b>{title}</b>
      {formula && <div className="g10-formula">{formula}</div>}
      <ol>{steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
      {result && <p className="g11-calc-res">✅ {result}</p>}
    </div>
  );
}
const VID_SHARK11 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1794068523/videoplayback_43.mp4";
const VQ_SHARK11 = [
  { q: "How did the entrepreneur fund his launch before Shark Tank?", options: ["With a Kickstarter campaign.", "With venture capital from Silicon Valley.", "With a big loan from a bank in San Francisco.", "By selling his house."], correct: 0, feedback: "He asked for about $10,000 on Kickstarter and raised around $350,000." },
  { q: "What customer acquisition cost (CAC) did he mention?", options: ["About $33.30 per customer.", "Around $148 per customer.", "Close to zero dollars.", "About 70% of revenue."], correct: 0, feedback: "He calculated about $33.30 to win a customer, against an average sale of $148." },
  { q: "What profit margin did he report?", options: ["About 70%.", "Exactly 33%.", "Around 15%.", "Roughly 50%."], correct: 0, feedback: "He said his margin was about 70% on an average sale of $148." },
  { q: "Why did he ask for $212,000 for 10%?", options: ["He could say it without stuttering.", "It matched his debts and taxes exactly.", "Investors require that number by rule.", "A financial model calculated it for him."], correct: 0, feedback: "An honest, funny moment: '$200,000' made him stutter, so he chose a number he could say!" },
  { q: "What was the Sharks' problem with his Kickstarter data?", options: ["Kickstarter isn't a normal, repeatable market.", "Kickstarter sales are illegal to report.", "The campaign had very low margins and lost money on each watch.", "Backers asked to receive company shares."], correct: 0, feedback: "Crowdfunding is unusual: it doesn't prove what it costs to win customers every month." },
  { q: "How did he describe his operation?", options: ["Just him, in his garage, with friends.", "A big warehouse with dozens of workers.", "An automated factory in another country.", "A global partner that does everything."], correct: 0, feedback: "He was honest: it was only him, working from his garage." },
  { q: "Which new products made the Sharks skeptical?", options: ["T-shirts and underwear.", "Titanium camping cookware.", "Smart electronics.", "Organic food for families."], correct: 0, feedback: "Expanding into T-shirts and underwear looked like losing focus on the core product." },
  { q: "What was his main product?", options: ["Copper-infused bed sheets.", "Smart mattresses with an app.", "Bamboo pillows.", "Cooling silk blankets."], correct: 0, feedback: "Copper-infused sheets designed to stop bad smells." },
  { q: "Why did he stop taking orders for a while?", options: ["He sold out and production was slow.", "The government made him recall his products.", "He was changing the brand and the logo.", "The materials became too expensive."], correct: 0, feedback: "He sold out in November–December and shipping took weeks." },
  { q: "What did the Sharks think of his valuation (about $2 million)?", options: ["Too high without proven data.", "Too low for a fast-growing company.", "Fair, based on his Kickstarter sales.", "Perfect, but they didn't like the product."], correct: 0, feedback: "Without proven repeat customers outside Kickstarter, ~$2 million was premature." },
  { q: "How did he react to hard questions?", options: ["With honesty, humility and good humor.", "He got angry and argued with the investors.", "He walked out before the end.", "He invented numbers to look better."], correct: 0, feedback: "He stayed transparent and lighthearted — and grateful to be there." },
  { q: "What lesson does this pitch teach for YOUR Shark Tank?", options: ["Authenticity helps, but you need solid numbers.", "If you are charming, investors forget the numbers.", "Never smile, so investors take you seriously.", "Ask for a big amount, then negotiate down."], correct: 0, feedback: "His honesty made the pitch memorable, but the missing data hurt the deal. Bring both!" },
];

/* ---------- R1 · WeWork ---------- */
const READ_WEWORK = [
  { node: <NewsHead key="n" s="MARKETS" d="New York, 2019" k="A US$47 billion company that lost money every year" /> },
  { h: "The most valuable startup in America" },
  { p: "In January 2019, WeWork — a company that rented office buildings, decorated them beautifully and sublet desks and offices to freelancers and startups — was valued at about 47 billion dollars. It had offices in dozens of countries, free beer, cool furniture and a charismatic founder, Adam Neumann, who described it as a technology company that would 'elevate the world's consciousness'." },
  { p: "To sell shares to the public, a company must publish its financial statements. In August 2019, WeWork published its numbers for its initial public offering (IPO). Investors read them carefully — and many were shocked." },
  { h: "Revenue is not profit" },
  { p: "WeWork's revenue was growing fast: in 2018 it was about 1.8 billion dollars. But its net loss in the same year was about 1.9 billion dollars. In other words, for every dollar that came in, the company spent around two. Its biggest costs were long rental contracts for buildings — sometimes for 15 years — while its customers could leave with one month's notice." },
  { box: "📒 The income statement (P&L) shows three key lines: REVENUE (sales), COSTS (to make and sell the product, and to run the company) and NET INCOME (what is left). A company can have huge revenue and still lose money." },
  { h: "From US$47 billion to almost nothing" },
  { p: "In September 2019, WeWork cancelled its IPO. Its valuation fell dramatically, the founder left the company, and thousands of employees lost their jobs. A few years later, in 2023, WeWork filed for bankruptcy protection in the United States. Analysts concluded that the company had been valued like a technology firm, but it was really a real-estate business with very expensive, long-term costs." },
  { h: "Margins tell the truth" },
  { p: "Professional investors look beyond sales. Gross margin shows how much of each sale remains after paying the direct cost of the product. Net margin shows what remains after ALL costs: marketing, salaries, rent, transport. If a business needs more and more revenue just to cover its costs, growing faster only means losing money faster." },
  { list: ["Revenue − cost of goods sold = GROSS PROFIT.", "Gross profit − operating expenses = NET INCOME (profit or loss).", "Gross margin = gross profit ÷ revenue × 100.", "Net margin = net income ÷ revenue × 100."] },
  { node: <Calc11 key="c" title="One month of a gelatin company" formula="Revenue − cost of goods = GROSS profit · Gross − expenses = NET income" steps={["Revenue: 120 gelatins × $3,000 = $360,000.", "Cost of goods (fruit, gelatin, cups): 120 × $1,500 = $180,000.", "Gross profit: $360,000 − $180,000 = $180,000 → gross margin 180,000 ÷ 360,000 = 50%.", "Operating expenses: marketing $40,000 + transport $20,000 + stand $15,000 + founders' pay $60,000 = $135,000.", "Net income: $180,000 − $135,000 = $45,000 → net margin 45,000 ÷ 360,000 = 12.5%."]} result="They SELL $360,000 but KEEP only $45,000. That is what investors look at first." /> },
  { h: "What this means for your company" },
  { p: "This period your team will present to the sharks. The first thing a serious investor asks is not 'How much do you sell?' but 'How much do you keep?'. Build your P&L honestly: include your time, the packaging, the transport and the marketing. A small company with a positive margin is worth more than a big one that loses money on every sale." },
];
const GLOSS_WEWORK = { "valued": "considered to be worth", "sublet": "rent again to someone else something you rent", "IPO": "initial public offering: the first time a company sells shares to the public", "revenue": "all the money that comes from sales", "net loss": "when costs are bigger than revenue", "gross margin": "% of each sale left after the direct cost of the product", "bankruptcy": "when a company cannot pay its debts" };
const Q_WEWORK = [
  { q: "What did WeWork really do?", options: ["It developed software and apps for big companies.", "It rented buildings and sublet desks and offices.", "It built new office buildings to sell.", "It sold furniture to startups."], correct: 1, feedback: "A real-estate business presented as a tech company." },
  { q: "Why did investors read WeWork's numbers in 2019?", options: ["The company published them to sell shares in an IPO.", "The government asked for an investigation.", "The founder wanted to buy more buildings around the world with the money.", "A bank refused to lend them money to open new offices."], correct: 0, feedback: "An IPO requires public financial statements." },
  { q: "In 2018, how did revenue compare with the net loss?", options: ["Revenue was about ten times bigger than the loss.", "There was a small profit, not a loss.", "The loss (~US$1.9B) was bigger than revenue (~US$1.8B).", "Revenue and loss were both close to zero."], correct: 2, feedback: "It spent about two dollars for every dollar it earned." },
  { q: "What was the dangerous mismatch in WeWork's model?", options: ["Customers paid in advance for 15 years of office space and services.", "Its buildings were only in very small cities.", "It had too few customers in Europe and Asia.", "Long rental contracts vs. customers who could leave quickly."], correct: 3, feedback: "Fixed long-term costs, flexible short-term revenue." },
  { q: "Which line of the P&L shows what is left after ALL costs?", options: ["Gross profit.", "Net income.", "Revenue.", "Cost of goods sold."], correct: 1, feedback: "Net income = the bottom line." },
  { q: "Revenue $1,000,000 and cost of goods $600,000. Gross margin?", options: ["40%.", "60%.", "16%.", "$400,000%."], correct: 0, feedback: "400,000 ÷ 1,000,000 = 40%." },
  { q: "What happened to WeWork in 2023?", options: ["It became the biggest IPO in history.", "It moved its headquarters to Colombia.", "It filed for bankruptcy protection.", "It was bought by its founder again."], correct: 2, feedback: "Bankruptcy protection in the US." },
  { q: "What does a serious investor ask first, according to the text?", options: ["How many followers do you have?", "How big is your office?", "How fast do your sales grow every single month?", "How much of each sale do you keep?"], correct: 3, feedback: "Margins tell the truth." },
];

/* ---------- R2 · Cash ---------- */
const READ_CASH = [
  { node: <NewsHead key="n" s="SMALL BUSINESS" d="Explainer" k="Profitable on paper, broke in real life" /> },
  { h: "The bakery that sold too much" },
  { p: "Imagine Camila's small bakery in Medellín. A supermarket chain loves her brownies and orders 2,000 units a month. It is the best news of her life — until she reads the contract: the supermarket pays 60 days after delivery. Camila must buy chocolate, flour, eggs and boxes today, pay her two employees every two weeks and rent a bigger oven. On paper, every brownie leaves a profit. In her bank account, the money disappears." },
  { p: "After six weeks, Camila cannot pay her suppliers. She has sold more than ever, her income statement shows a profit, and yet she is close to closing. This situation is so common that accountants have a saying: 'Revenue is vanity, profit is sanity, but cash is king.'" },
  { box: "💧 PROFIT tells you if your business model works. CASH FLOW tells you if you will survive until the money arrives. You can be profitable and still run out of cash." },
  { h: "Where cash gets stuck" },
  { list: ["Accounts receivable: sales you made but haven't collected yet (the supermarket's 60 days).", "Inventory: ingredients and products waiting on the shelf — money you already spent.", "Equipment: an oven or a freezer is paid today but helps you for years.", "Loan payments: they leave your account even if they are not 'costs' in the P&L."] },
  { h: "The cash flow statement" },
  { p: "A cash flow budget is a simple table. Each month you write the cash you START with, the cash that comes IN (sales paid in cash, pre-orders, loans, investors) and the cash that goes OUT (suppliers, salaries, rent, equipment, loan payments). The cash at the end of one month is the start of the next. If any month ends below zero, you have found your problem before it happens." },
  { h: "How small companies protect their cash" },
  { p: "Smart founders ask for pre-payments or deposits, negotiate longer payment terms with suppliers, buy ingredients in the right quantities, avoid buying expensive equipment too early and keep a cash reserve for emergencies. Some accept a smaller order with faster payment instead of a huge order that pays in two months." },
  { h: "What Camila did" },
  { p: "Camila negotiated: the supermarket agreed to pay in 30 days if she gave a 3% discount. She asked her clients at the bakery for 50% advance payments on big orders and used a short loan only for the oven. Her profit per brownie went down a little, but her business survived. In business, being alive next month is the first goal." },
  { h: "Cash vs. profit with real numbers" },
  { node: <Calc11 key="c" title="Camila's first month with the supermarket" formula="Ending cash = starting cash + cash IN − cash OUT" steps={["She starts the month with $2,000,000 in the bank.", "She buys ingredients for 2,000 brownies: 2,000 × $1,500 = $3,000,000 (cash OUT today).", "She delivers, but the supermarket pays in 60 days: cash IN this month = $0.", "Ending cash = 2,000,000 + 0 − 3,000,000 = −$1,000,000 ❌", "Her P&L shows a PROFIT: 2,000 × ($2,500 − $1,500) = $2,000,000 — but the money is not in the bank yet."]} result="Profitable on paper, NEGATIVE cash in real life." /> },
  { node: <Calc11 key="r" title="Runway: how many months can you survive?" formula="Runway (months) = cash you have ÷ cash you lose (burn) per month" steps={["You have $360,000.", "Each month you spend $90,000 more than you collect.", "360,000 ÷ 90,000 = 4."]} result="4 months of runway. Before month 4 you need sales, a deposit or funding." /> },
  { h: "What this means for your company" },
  { p: "Your team will receive pre-orders, buy ingredients and maybe ask for a loan or an investor. Before the sharks ask, build your cash plan month by month. A shark will not invest in a company that will run out of cash before the money arrives." },
];
const GLOSS_CASH = { "cash flow": "the money that really comes in and goes out, and when", "accounts receivable": "money customers owe you for sales already made", "inventory": "products and materials you have but haven't sold", "deposit": "part of the price paid in advance", "payment terms": "how many days you have to pay (or to receive payment)", "reserve": "money saved for emergencies" };
const Q_CASH = [
  { q: "Why was Camila close to closing?", options: ["Her brownies had lost quality because of new ingredients.", "She sold more but the money arrived 60 days later.", "The supermarket cancelled the order after two weeks.", "Her employees asked for higher salaries."], correct: 1, feedback: "Profitable on paper, no cash in the account." },
  { q: "'Cash is king' means that…", options: ["having cash to pay on time is essential to survive.", "you should always keep your money in cash at home.", "kings used to control all the money.", "cash payments are more profitable than cards."], correct: 0, feedback: "Survival depends on cash, not only on profit." },
  { q: "Which one is an example of accounts receivable?", options: ["Flour and sugar waiting on the shelf of the bakery.", "The loan payment that you must make this month.", "A sale the supermarket will pay in 60 days.", "The new oven that you bought and already paid."], correct: 2, feedback: "Money you earned but haven't collected." },
  { q: "In a cash flow budget, the cash at the end of a month…", options: ["is the profit of the year, shown in the P&L.", "must be paid to the government as a tax.", "is always zero at the end of every month.", "becomes the starting cash of the next month."], correct: 3, feedback: "End of month = start of the next one." },
  { q: "Which action PROTECTS cash?", options: ["Asking for a 50% deposit on big orders.", "Buying a big freezer before the first sale.", "Accepting 90-day payment terms.", "Buying six months of ingredients at once."], correct: 0, feedback: "Deposits bring cash in earlier." },
  { q: "What did Camila accept to get paid in 30 days?", options: ["A higher price for the supermarket.", "A 3% discount.", "Selling only cash products.", "Closing the bakery on weekends."], correct: 1, feedback: "A small discount for faster cash." },
  { q: "Why can a profitable company still fail?", options: ["Because profit is calculated once a year.", "Because taxes take all the profit.", "Because it can run out of cash before customers pay.", "Because investors always want their money back at the end of the year."], correct: 2, feedback: "Timing of cash matters." },
  { q: "What should your team prepare before talking to the sharks?", options: ["A list of famous customers.", "A bigger logo.", "A 5-year plan without numbers.", "A month-by-month cash plan."], correct: 3, feedback: "Sharks check survival." },
];

/* ---------- R3 · Pebble / Crowdfunding ---------- */
const READ_PEBBLE = [
  { node: <NewsHead key="n" s="FUNDING" d="Palo Alto, 2012" k="The watch that asked the crowd for money" /> },
  { h: "Rejected by investors" },
  { p: "In 2012, a young engineer called Eric Migicovsky had a prototype of a smartwatch that showed messages from your phone. Traditional investors were not interested: hardware was expensive and risky, they said. So he tried something new. He posted the Pebble watch on Kickstarter, a crowdfunding website where people pay in advance for a product that doesn't exist yet." },
  { p: "His goal was 100,000 dollars. He reached it in about two hours. After 30 days, around 69,000 people had promised more than 10 million dollars — at that time, the most successful campaign in Kickstarter's history. Customers became the first investors: they financed production in exchange for a watch, not for shares." },
  { box: "🏦 Five ways to fund a small company: OWN SAVINGS (bootstrapping), FAMILY & FRIENDS, a LOAN (you pay interest), INVESTORS (you give part of the company: equity) and CROWDFUNDING (customers pay in advance)." },
  { h: "The hidden costs of each option" },
  { p: "Every source of money has a price. A bank loan keeps the company 100% yours, but you must pay interest every month — even in bad months. An investor doesn't ask for monthly payments, but owns part of every future profit forever. Crowdfunding doesn't cost equity, but platforms keep a fee (often around 5–10%), rewards must be produced and shipped, and if you fail to deliver, your reputation is destroyed." },
  { h: "When success becomes a problem" },
  { p: "Pebble had to produce tens of thousands of watches it had never made before. Deliveries were delayed for months, and the team learned that manufacturing at scale was much harder than building a prototype. The company raised more money in later campaigns — in 2015 its new watch raised about 20 million dollars — but competition from big companies like Apple grew. In 2016, Pebble sold its assets to Fitbit and stopped making watches." },
  { h: "Debt or equity?" },
  { list: ["Debt (loan): you keep control; you must pay even if sales fall; interest is the cost.", "Equity (investor): no monthly payment; you share profits and decisions forever.", "Crowdfunding: proof of demand + cash in advance; fees, delivery pressure and public promises.", "Bootstrapping: total control and no cost of capital; growth is slower."] },
  { h: "How much does each kind of money cost? (with numbers)" },
  { node: <Calc11 key="l" title="A loan with a fixed monthly payment" formula="Payment = P × r ÷ (1 − (1 + r)^−n)   ·   P = amount · r = monthly rate · n = months" steps={["Loan $300,000 at 2% a month for 6 months: P = 300,000 · r = 0.02 · n = 6.", "(1 + r)^n = 1.02^6 = 1.1262 → (1 + r)^−n = 1 ÷ 1.1262 = 0.8880.", "Payment = 300,000 × 0.02 ÷ (1 − 0.8880) = 6,000 ÷ 0.1120 ≈ $53,558 a month.", "Total paid = 6 × 53,558 = $321,348 → total interest = 321,348 − 300,000 = $21,348."]} result="The money costs you about $21,348 — and you must pay $53,558 even in bad months." /> },
  { node: <Calc11 key="e" title="Monthly rate → yearly rate (E.A.)" formula="E.A. = (1 + monthly rate)^12 − 1" steps={["2% monthly → 1.02^12 = 1.268.", "1.268 − 1 = 0.268 → 26.8% E.A."]} result="'Only 2% a month' is almost 27% a year." /> },
  { node: <Calc11 key="q" title="Equity: money for a piece of the company" formula="Implied valuation = money ÷ %   ·   % to give = money ÷ valuation" steps={["An investor gives $500,000 for 25%.", "500,000 ÷ 0.25 = $2,000,000 → that's what your company is 'worth' in this deal.", "No monthly payment, but the investor owns 25% of every future profit."]} result="Equity has no interest — its price is a part of your company forever." /> },
  { node: <Calc11 key="c" title="Crowdfunding: what really arrives" formula="Money received = money raised × (1 − platform fee)" steps={["You raise $400,000 with an 8% fee.", "400,000 × 0.92 = $368,000.", "And you still must produce and deliver the rewards to every backer."]} result="You receive $368,000, not $400,000." /> },
  { h: "What this means for your company" },
  { p: "Your team will need money for equipment, ingredients or a bigger batch. Before you choose, calculate the real cost of each option: the total interest of a loan, the percentage of the company an investor would own, the fees of crowdfunding. The best funding is the one your cash flow can survive — and the one you won't regret when the company is successful." },
];
const GLOSS_PEBBLE = { "crowdfunding": "many people giving small amounts of money for a project", "hardware": "physical technology products", "equity": "ownership of part of a company", "bootstrapping": "funding a company with your own money and sales", "assets": "things of value a company owns", "debt": "money you borrowed and must pay back" };
const Q_PEBBLE = [
  { q: "Why did Migicovsky use Kickstarter?", options: ["He wanted to avoid paying taxes in the United States.", "Traditional investors weren't interested in his hardware.", "Banks offered him too much money with high interest.", "Apple asked him to test the market before it did."], correct: 1, feedback: "Investors thought hardware was too risky." },
  { q: "How much did Pebble raise in the 2012 campaign?", options: ["More than US$10 million.", "Exactly US$100,000.", "About US$1 million.", "US$47 million."], correct: 0, feedback: "About 69,000 backers, more than US$10 million." },
  { q: "What did Kickstarter backers receive?", options: ["Shares of the company, like an investor.", "Interest every month, like a bank deposit.", "A watch, if the project delivered.", "A seat on the board of directors of the company."], correct: 2, feedback: "Rewards, not equity." },
  { q: "What is the main cost of an investor's money?", options: ["A fixed monthly interest payment.", "A platform fee of 8%.", "Nothing, investors give money for free.", "A share of all future profits and decisions."], correct: 3, feedback: "Equity = ownership forever." },
  { q: "What problem appeared AFTER the successful campaign?", options: ["Producing tens of thousands of watches on time.", "Nobody wanted the watch anymore after one year.", "The government banned smartwatches in schools.", "Kickstarter refused to pay the money it collected."], correct: 0, feedback: "Manufacturing at scale is hard." },
  { q: "What happened to Pebble in 2016?", options: ["It became bigger than Apple in the world's smartwatch market.", "It sold its assets to Fitbit and stopped making watches.", "It moved its factory to Colombia to save money.", "It raised US$100 million more on Kickstarter for a new watch."], correct: 1, feedback: "Assets sold to Fitbit." },
  { q: "Which option keeps 100% of the company but requires monthly payments?", options: ["Crowdfunding.", "An investor.", "A bank loan.", "Family gifts."], correct: 2, feedback: "Debt: control + obligation." },
  { q: "According to the text, the best funding is…", options: ["always the cheapest loan the bank offers.", "the biggest amount possible.", "money from famous investors with big companies.", "the one your cash flow can survive."], correct: 3, feedback: "Cost + survival + no regrets." },
];

/* ---------- R4 · Cómo valoran los tiburones ---------- */
const READ_VALUE = [
  { node: <NewsHead key="n" s="SHARK TANK" d="Explainer" k="$100,000 for 10%: what does it really mean?" /> },
  { h: "The sentence every founder must understand" },
  { p: "On TV shows like Shark Tank, founders say a sentence that sounds simple: 'I'm asking for 100,000 dollars for 10% of my company.' In that sentence there is a hidden number — the valuation. If 10% costs 100,000 dollars, then 100% costs 1,000,000 dollars. The founder is saying: my company is worth one million dollars." },
  { box: "💎 Implied valuation = investment ÷ percentage. $100,000 ÷ 0.10 = $1,000,000. Sharks calculate it in their heads in two seconds — and so must you." },
  { h: "Why sharks laugh (or leave)" },
  { p: "Sharks compare that valuation with the company's real numbers. If the company sells 50,000 dollars a year and loses money, a one-million valuation means the shark would pay 20 times the sales for a risky business. Many founders fall in love with their idea and ask for valuations that their numbers cannot defend. Sharks often answer with a counteroffer: the same money for a bigger percentage, or a royalty — a small payment on every unit sold until they recover their investment." },
  { h: "Three ways to estimate value" },
  { list: ["Revenue multiple: annual sales × a multiple (small food businesses: often around 1–3 times).", "Earnings multiple: annual profit × a multiple (for example 3–8 times for small, risky businesses).", "Discounted cash flow: future profits brought to today's value with a high discount rate, because young companies are risky."] },
  { p: "None of these methods gives a perfect answer. Professionals use them together to find a reasonable range, and then they negotiate inside that range. The final number depends on growth, risk, the team, the market and how much the investor can help." },
  { h: "A famous deal" },
  { p: "In 2012, Aaron Krause presented Scrub Daddy, a smiling sponge that changes texture with water temperature. Lori Greiner offered 200,000 dollars for 20% — an implied valuation of one million dollars. With her help, the sponge reached big TV shopping channels and stores, and it became one of the most successful products in the show's history. The investor brought more than money: she brought distribution." },
  { h: "Smart money" },
  { p: "That's why founders talk about 'smart money': an investor who brings contacts, experience or sales channels can be worth more than one who only brings cash. Sometimes accepting a lower valuation from the right partner is the better deal." },
  { h: "The three methods, step by step" },
  { node: <Calc11 key="m" title="A gelatin company: revenue $3,600,000 a year, profit $540,000 a year" formula="① Revenue × multiple   ② Profit × multiple   ③ DCF = Σ profit of each year ÷ (1 + risk rate)^year" steps={["① Revenue multiple 1.5×: 3,600,000 × 1.5 = $5,400,000.", "② Earnings multiple 5×: 540,000 × 5 = $2,700,000.", "③ DCF, year 1: profit grows 30% → 540,000 × 1.3 = 702,000; brought to today with 35% risk: 702,000 ÷ 1.35 = $520,000. Do the same for 5 years and add them.", "The three answers make a RANGE (here about $2.7M – $5.4M). You negotiate inside it."]} /> },
  { node: <Calc11 key="a" title="From valuation to your ask" formula="% to offer = money you need ÷ valuation" steps={["You need $300,000.", "Your numbers defend a valuation of about $2,000,000.", "300,000 ÷ 2,000,000 = 0.15 → offer 15%.", "Walk-away point: the MAX % you would give (for example 25%). Above it, you say no."]} result="“We ask $300,000 for 15%” = a $2,000,000 valuation you can explain." /> },
  { h: "What this means for your pitch" },
  { p: "Your team will calculate a valuation range with three methods, choose an ask that your numbers can defend and decide your walk-away point: the worst deal you would accept. On Shark Tank Day, every number you say must have a calculation behind it." },
];
const GLOSS_VALUE = { "valuation": "how much a company is worth", "implied valuation": "the value of 100% calculated from the money and % asked", "counteroffer": "a different offer as an answer", "royalty": "a payment for every unit sold", "multiple": "the number you multiply sales or profit by", "distribution": "the channels that take a product to customers" };
const Q_VALUE = [
  { q: "A founder asks $100,000 for 10%. What is the implied valuation?", options: ["$100,000.", "$1,000,000.", "$110,000.", "$10,000,000."], correct: 1, feedback: "100,000 ÷ 0.10 = 1,000,000." },
  { q: "$50,000 for 25% means the company is worth…", options: ["$200,000.", "$125,000.", "$12,500.", "$250,000."], correct: 0, feedback: "50,000 ÷ 0.25 = 200,000." },
  { q: "Why do sharks often reject a pitch?", options: ["The founder speaks too fast and seems nervous.", "The product is too cheap for its target customers.", "The valuation is much higher than the numbers can defend.", "The company already has customers who buy every week."], correct: 2, feedback: "Numbers must support the valuation." },
  { q: "What is a royalty deal?", options: ["The shark buys 100% of the company.", "The founder pays a fixed monthly salary to the shark.", "The shark receives a free product every month.", "The shark gets a payment on every unit sold."], correct: 3, feedback: "A cut of each unit until recovered (or forever)." },
  { q: "Which method uses annual sales?", options: ["Revenue multiple.", "Earnings multiple.", "Royalty valuation.", "Break-even method."], correct: 0, feedback: "Sales × multiple." },
  { q: "Why do young companies use a HIGH discount rate?", options: ["Because banks require it by law.", "Because they are risky.", "Because inflation is always high.", "Because sharks like big numbers."], correct: 1, feedback: "More risk → future money is worth less today." },
  { q: "What did Lori Greiner bring to Scrub Daddy besides money?", options: ["A new formula for the sponge.", "Free advertising on her own channel and her friends' channels.", "Distribution in big sales channels.", "Free advertising on her own channel only."], correct: 2, feedback: "Smart money = money + distribution." },
  { q: "What is your 'walk-away point'?", options: ["The highest valuation you can dream of.", "The moment you leave the stage.", "The price of your product in the stores.", "The worst deal you would still accept."], correct: 3, feedback: "Decide it BEFORE negotiating." },
];

/* ---------- R5 · Blockbuster & Kodak ---------- */
const READ_GIANTS = [
  { node: <NewsHead key="n" s="BUSINESS HISTORY" d="2000 – 2012" k="When giants fall" /> },
  { h: "The US$50 million 'joke'" },
  { p: "In the year 2000, Blockbuster was the king of home entertainment. It had thousands of stores where families rented movies on weekends, and it made a lot of money from late fees. That year, the founders of a small company called Netflix — which sent DVDs by mail — flew to Dallas and offered to sell their company to Blockbuster for 50 million dollars. According to several reports, Blockbuster's executives almost laughed. They said no." },
  { p: "Netflix moved to streaming, invested in technology and later produced its own series. Blockbuster tried to react too late. In 2010 it filed for bankruptcy. Today, Netflix is worth many billions of dollars; famously, one Blockbuster store survives in Bend, Oregon, as a tourist attraction." },
  { h: "The company that invented its own enemy" },
  { p: "Kodak dominated photography for most of the 20th century. It sold cameras cheaply and made its real profits from film and printing. In 1975, a Kodak engineer named Steven Sasson built one of the first digital cameras. Managers saw the danger: digital photos would kill the film business. The company did develop digital technology, but it protected its profitable film business for too long. Smartphones finished the story. In January 2012, Kodak filed for bankruptcy." },
  { box: "⚠️ Both companies were profitable, famous and full of smart people. They failed because they protected the business of TODAY instead of preparing for the customer of TOMORROW." },
  { h: "Stress tests" },
  { p: "Banks and big companies run 'stress tests': they imagine bad scenarios — sales falling 30%, costs rising 20%, a new competitor, a crisis — and calculate whether the business survives. The goal is not to predict the future, but to prepare a Plan B before the crisis arrives." },
  { list: ["What happens to our profit if sales fall 30%?", "What happens if the price of our main ingredient rises 20%?", "How many months can we survive with the cash we have?", "Which changes (price, recipe, channel) would save the business?"] },
  { h: "Small companies, big lessons" },
  { p: "Your company is small, but the same forces affect you: a competitor that sells at half price, a supplier that doubles a price, a new trend that changes what customers want. Founders who check their numbers under pressure — and listen to customers' changing needs — survive longer than founders who only plan for sunny days." },
  { node: <Calc11 key="s" title="A stress test for a gelatin company" formula="Net income = units × (price − unit cost) − monthly expenses" steps={["Normal month: 120 × ($3,000 − $1,500) − $135,000 = 180,000 − 135,000 = +$45,000.", "Crisis: sales fall 30% → 84 units: 84 × 1,500 − 135,000 = 126,000 − 135,000 = −$9,000 ❌", "Plan B: a cheaper supplier lowers the unit cost to $1,300 → margin $1,700: 84 × 1,700 − 135,000 = +$7,800 ✅"]} result="A good Plan B turns a loss into a (small) profit." /> },
  { h: "What this means for your company" },
  { p: "This week you will put your own company under stress: higher costs, lower sales, new competitors. Then you will design a Plan B. Sharks love founders who can say: 'If this happens, this is exactly what we will do.'" },
];
const GLOSS_GIANTS = { "late fees": "extra money paid for returning something late", "streaming": "watching video over the internet without downloading", "dominated": "controlled the biggest part of a market", "stress test": "a calculation of what happens in bad scenarios", "Plan B": "an alternative plan if things go wrong" };
const Q_GIANTS = [
  { q: "What did Netflix offer Blockbuster in 2000?", options: ["To buy all Blockbuster stores.", "To sell Netflix for about US$50 million.", "A partnership to produce movies and TV series together.", "To share late fees 50/50."], correct: 1, feedback: "Blockbuster said no." },
  { q: "When did Blockbuster file for bankruptcy?", options: ["In 2010.", "In 2000.", "In 2019.", "In 1995."], correct: 0, feedback: "Ten years after the offer." },
  { q: "Where did Kodak make its real profits?", options: ["Selling expensive cameras.", "Repairing cameras.", "Film and printing.", "Digital photo apps."], correct: 2, feedback: "Cheap cameras, profitable film." },
  { q: "Who built one of the first digital cameras in 1975?", options: ["A Netflix founder who worked at Kodak before.", "A Japanese competitor.", "A university student in Colombia.", "Steven Sasson, a Kodak engineer."], correct: 3, feedback: "Kodak invented its own enemy." },
  { q: "Why did both giants fail, according to the text?", options: ["They protected today's business instead of preparing for tomorrow's customer.", "They didn't have smart people working in the company.", "They were never profitable, not even in their best years.", "Governments closed them because they were too big and too powerful for the market."], correct: 0, feedback: "Success made them slow to change." },
  { q: "What is a stress test?", options: ["A test of the employees' stress levels at work during a crisis.", "A calculation of whether a business survives bad scenarios.", "A prediction of the exact future of the company.", "An exam that new managers must pass before the company hires them."], correct: 1, feedback: "Prepare Plan B before the crisis." },
  { q: "Which question belongs in a stress test?", options: ["Which color of our logo do customers find prettier?", "How many followers do we have on social media?", "What happens to profit if sales fall 30%?", "Who is the youngest founder in the team?"], correct: 2, feedback: "Numbers under pressure." },
  { q: "What do sharks love to hear, according to the text?", options: ["“Nothing can go wrong with our company.”", "“Our competitors are not important to us.”", "“We will decide what to do later, when it happens.”", "“If this happens, this is exactly what we will do.”"], correct: 3, feedback: "A prepared Plan B." },
];

/* =====================================================================
   11° · PERIODO 2 · SHARK TANK — FINANZAS DE TU EMPRESA
   Lee la empresa construida en P1 (resp.__p1) y la lleva al tanque.
   ===================================================================== */
const P1of = (resp) => resp?.__p1 || {};
const nums2 = (resp) => { const r = P1of(resp); const co = co11(r); return { ...co, price: co.price || 3000, unit: co.unit || 1500, monthly: co.monthly || 120, fixed: co.fixed || 180000 }; };
/* P&L mensual de la empresa (lo que se guardó en Class 1) o uno calculado con P1 */
const plOf = (resp) => { const pl = resp?.c1_pl; const n = nums2(resp); if (pl) return pl; const rev = n.monthly * n.price; const cogs = n.monthly * n.unit; const opex = 60000; return { units: n.monthly, price: n.price, unit: n.unit, rev, cogs, gross: rev - cogs, opex, net: rev - cogs - opex, sample: true }; };


/* =====================================================================
   GUÍAS "ANTES DE EMPEZAR" (contexto + fórmula + ejemplo) · Periodo 2
   ===================================================================== */
const GD_PL = { intro: "The P&L (Profit & Loss, or income statement) shows ONE month of your company: what you sold, what it cost and what is left. You will fill it with YOUR Period 1 numbers.", items: [
  { e: "💰", t: "Revenue (sales)", d: "All the money from what you sold this month.", f: "Revenue = units sold × price", ex: "120 gelatins × $3,000 = $360,000" },
  { e: "🧂", t: "Cost of goods sold (COGS)", d: "The direct cost of EACH unit: ingredients + packaging. Use your unit cost from Period 1.", f: "COGS = units sold × unit cost", ex: "120 × $1,500 = $180,000" },
  { e: "🧾", t: "Operating expenses", d: "Costs to RUN the company, not inside each unit: marketing, transport, stand, your own pay. Write 4 or more with a real value.", ex: "Posters $40,000 · transport $20,000 · stand $15,000 · founders' pay $60,000 = $135,000" },
  { e: "📒", t: "Gross and net profit", f: "Gross = revenue − COGS  ·  Net = gross − expenses  ·  margin % = profit ÷ revenue × 100", ex: ["Gross = 360,000 − 180,000 = $180,000 (50%)", "Net = 180,000 − 135,000 = $45,000 (12.5%)"] },
] };
const GD_CASH = { intro: "Profit says if your business WORKS. Cash says if you SURVIVE. In this game you live 12 months: in normal months cash comes in; in 6 months something happens and you must decide.", items: [
  { e: "💧", t: "Cash now", d: "The money really in the bank. If it goes below $0, a real company can't pay suppliers.", f: "Cash at the end of the month = cash at the start + money IN − money OUT" },
  { e: "⏳", t: "Money that arrives LATER", d: "A sale paid in 60 days is profit today but cash in 2 months. The game moves that money to the month it really arrives.", ex: "A $600,000 order paid in 60 days: you spend on ingredients in month 1 and receive the money in month 3." },
  { e: "✅", t: "Smart decisions", d: "The best choice protects cash: deposits, renting instead of buying, buying in small quantities, keeping a safety net." },
] };
const GD_PLAN = { intro: "Now you write YOUR company's next 3 months. Each row is a movement of money. Mark it ⬆️ IN (money that enters) or ⬇️ OUT (money that leaves) and write the amount for each month. The table adds everything for you.", items: [
  { e: "⬆️", t: "Money IN", d: "Sales collected, pre-order deposits, a loan or an investor's money (the day it arrives)." },
  { e: "⬇️", t: "Money OUT", d: "Ingredients and packaging, marketing, equipment, transport, loan payments." },
  { e: "🧮", t: "How the table calculates", f: "Net flow = IN − OUT  ·  Cash at the end = previous cash + net flow", ex: ["Start $200,000 · month 1: IN $216,000 − OUT $240,000 = −$24,000", "Cash at the end of month 1 = 200,000 − 24,000 = $176,000 ✅"] },
  { e: "🚦", t: "The rule", d: "No month can end below $0. If one does: ask for deposits, move the equipment to a later month or lower a cost." },
] };
const GD_FUND = { intro: "Your company needs $600,000 (equipment + a big first batch). Move the 5 sources until you reach it. Each source has a different PRICE — read it under each slider.", items: [
  { e: "🐷", t: "Savings & family", d: "Cheapest money, but limited (max $200,000 and $150,000). Family money can damage relationships if you can't pay." },
  { e: "🏦", t: "Loan", d: "You keep 100% of the company but pay every month, even in bad months.", f: "Payment = P × r ÷ (1 − (1 + r)^−n)  ·  r = 2.2% monthly · n = 12", ex: "Rule: the payment must be ≤ 60% of your monthly net income (from your P&L)." },
  { e: "🦈", t: "Investor (equity)", d: "No monthly payment, but the investor owns a % of every future profit.", f: "Implied valuation = money ÷ %", ex: "$300,000 for 20% → 300,000 ÷ 0.20 = $1,500,000" },
  { e: "👥", t: "Crowdfunding", d: "Customers pay in advance; the platform keeps a fee and you must produce the rewards.", f: "Real cost ≈ amount × (8% fee + 15% rewards)" },
  { e: "👑", t: "Control", d: "The % of the company the founders keep. Below 51% you lose the majority of the decisions." },
] };
const GD_VAL = { intro: "How much is YOUR company worth? There is no single right number: you calculate 3 methods, see the range and choose an ask your numbers can defend. The yearly numbers come from your P&L (month × 12).", items: [
  { e: "①", t: "Revenue multiple", f: "Value = revenue per year × multiple", ex: "Small food businesses: about 1–3×. $3,600,000 × 1.5 = $5,400,000" },
  { e: "②", t: "Earnings multiple", f: "Value = profit per year × multiple", ex: "Small, risky businesses: about 3–8×. $540,000 × 5 = $2,700,000" },
  { e: "③", t: "Discounted cash flow (DCF)", d: "Future profits are worth LESS today because they are uncertain. Growth = how fast profit grows each year. Discount rate = how risky you are (young companies: 30–50%).", f: "DCF = profit₁ ÷ (1 + r) + profit₂ ÷ (1 + r)² + … (5 years)" },
  { e: "🦈", t: "Ask, % and walk-away", f: "Implied valuation = money ÷ %  ·  % to offer = money ÷ valuation", ex: ["Need $300,000 · our range ≈ $2,000,000 → offer 300,000 ÷ 2,000,000 = 15%", "Walk-away = the MAXIMUM % we would give (e.g. 25%). It must be bigger than the first offer."] },
] };
const GD_CAP = { intro: "A cap table is the list of WHO owns WHAT % of the company. When an investor buys new shares, everybody's % gets smaller (dilution) — but the company gets money and can be worth more.", items: [
  { e: "1️⃣", t: "Founders' split", d: "Divide 100% among your team (from your Period 1 team). Use + and − until the total is exactly 100%." },
  { e: "🌱", t: "Seed investor", d: "The first investor. Buys a % with NEW shares." },
  { e: "🧑‍🍳", t: "Employee pool", d: "A % reserved to reward future employees with shares." },
  { e: "🚀", t: "Series A", d: "A bigger investor later, when the company grows." },
  { e: "🧮", t: "Dilution", f: "New % = old % × (1 − % sold)", ex: ["Founder with 40%. Seed buys 15% → 40 × 0.85 = 34%", "Then pool 5% → 34 × 0.95 = 32.3%", "Then Series A 20% → 32.3 × 0.80 = 25.8%"] },
  { e: "💎", t: "Is that bad?", f: "Value of your slice = your % × company valuation", ex: "100% of $400,000 = $400,000 · 25.8% of $3,000,000 = $774,000 → smaller %, MORE value." },
] };
const GD_NEGO = { intro: "You are the founder in front of a shark. The shark makes an offer; you can ACCEPT it, send a COUNTER-OFFER or WALK AWAY. Your ask and walk-away come from your Valuation Machine.", items: [
  { e: "🦈", t: "The shark's offer", d: "“$300,000 for 30%” means the shark values your company at 300,000 ÷ 0.30 = $1,000,000. Each shark has a personality: some want more %, some want royalties (money per unit sold)." },
  { e: "🔁", t: "My counter", d: "YOUR proposal: the money you want (first slider) and the % you would give (second slider). The app shows the valuation your counter implies.", f: "My valuation = my money ÷ my %", ex: ["Shark: $300,000 for 30% → $1,000,000", "My counter: $300,000 for 20% → 300,000 ÷ 0.20 = $1,500,000", "If the shark thinks $1,500,000 is fair, he accepts; if not, he makes a new offer."] },
  { e: "⚖️", t: "How to get a 'yes'", d: "MORE % or LESS money = a LOWER valuation = easier for the shark to accept (but worse for you). Find the middle." },
  { e: "🚪", t: "Walk-away point", d: "The MAX % you will give. If the deal is above it, the smart move is to walk away. Max 3 rounds per shark." },
] };
const GD_STRESS = { intro: "Imagine a bad month for YOUR company. Move the crisis sliders and see your profit fall. Then choose up to 3 Plan B actions and see if you recover.", items: [
  { e: "🌪️", t: "The crisis", d: "Sales change: −30% means you sell 30% fewer units. Ingredient cost: +20% means each unit costs 20% more. A competitor takes 15% more of your sales." },
  { e: "🧮", t: "How the table calculates", f: "Net income = units × (price − unit cost) − monthly expenses", ex: ["Normal: 120 × (3,000 − 1,500) − 135,000 = +$45,000", "Crisis −30% sales: 84 × 1,500 − 135,000 = −$9,000"] },
  { e: "🛟", t: "Plan B", d: "Each action changes units, price, cost or expenses. Combine max 3 and compare the 3 rows of the table." },
] };
const GD_IMPACT = { intro: "Sharks ask about money; communities ask about IMPACT. A KPI is a number you can measure. Choose 2 or more and write the value TODAY and a GOAL in 6 months.", items: [
  { e: "📏", t: "Today vs. goal", d: "Today = what really happens now (0 is OK). Goal = a realistic number for 6 months.", ex: ["♻️ Units wasted per week: today 8 → goal 2", "🌽 % local ingredients: today 30 → goal 60"] },
  { e: "🌍", t: "SDG 8 & 12", d: "SDG 8 = decent work and growth. SDG 12 = responsible production and consumption (less waste, better packaging)." },
] };
const GD_DECK = { intro: "Your 10 slides already have YOUR data. Your job: write a HEADLINE for each one — a short sentence (2–12 words) that SAYS the main message, not just the topic.", items: [
  { e: "❌", t: "Topic headline (weak)", ex: "“Our numbers” · “The problem” · “Our customer”" },
  { e: "✅", t: "Message headline (strong)", ex: "“Every gelatin leaves us $1,500” · “Students skip breakfast at 10 a.m.” · “We ask $300,000 for 15%”" },
  { e: "🎤", t: "Present", d: "Use 'Present' to show the deck full screen and practice with your team." },
] };
const GD_QA = { intro: "On Shark Tank Day the sharks will interrupt you with hard questions. Train here: 60 seconds per question. A STRONG answer has 15+ words, 2 topic words and a number.", items: [
  { e: "🦈", t: "Example question", ex: "“What is your margin per unit?”" },
  { e: "✅", t: "Example strong answer", ex: "“Our price is $3,000 and our unit cost is $1,500, so our margin is $1,500 per gelatin — 50% of the price. That's why we can pay marketing and still keep a profit.”" },
] };
const GD_NUM = { intro: "Sharks test founders with THEIR OWN numbers. These 6 problems use your P&L and your valuation. Each problem shows the formula with your numbers — you just calculate.", items: [
  { e: "🧮", t: "The 6 formulas", ex: ["Margin per unit = price − unit cost", "Margin % = margin ÷ price × 100", "Break-even units = fixed costs ÷ margin per unit", "Implied valuation = money ÷ %", "Profit per year = profit per month × 12", "Shark's share = profit per year × shark's %"] },
] };

/* ---------- C1 · P&L Builder ---------- */
function PLBuilder({ resp, existing, onSave, onExit }) {
  const n = nums2(resp);
  const [units, setUnits] = useState(existing?.units || n.monthly);
  const [price, setPrice] = useState(existing?.price || n.price);
  const [unit, setUnit] = useState(existing?.unit || n.unit);
  const [ex, setEx] = useState(existing?.exRows || [{ n: "Marketing (posters, samples)", v: "40000" }, { n: "Transport", v: "20000" }, { n: "Stand / space", v: "15000" }, { n: "Founders' pay", v: "" }]);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const rev = units * price; const cogs = units * unit; const gross = rev - cogs; const opex = ex.reduce((a, x) => a + num(x.v), 0); const net = gross - opex;
  const gm = rev ? Math.round((gross / rev) * 100) : 0; const nm = rev ? Math.round((net / rev) * 100) : 0;
  const G = [W_NUMBERS(2), W_TOPIC("Use 3 P&L words", ["revenue", "gross", "net", "margin", "cost", "expense", "profit", "loss"], 3, "revenue · margin · net profit"), W_REASON];
  const ok = ex.filter((x) => countWords(x.n) >= 1 && num(x.v) > 0).length >= 4 && goalsOk(text, 30, 80, G);
  if (st.done) return <Reward title="P&L built! 📒" subtitle={`Net ${cop(net)} · net margin ${nm}%`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<FileText size={22} strokeWidth={2.1} />} title="P&L Builder 📒 · One month of OUR company" subtitle="Revenue − cost of goods = gross profit. Gross profit − expenses = net income. No hiding costs!" onExit={onExit}>
      <Brief91 k="c1_pl" /><Guide11 {...GD_PL} />
      {!P1of(resp).c5_price && <div className="p1-banner"><span>💡 We couldn't find your Period 1 numbers, so you start with sample numbers. Change them to yours.</span></div>}
      <div className="g10-two">
        <div className="start-block"><h3>📈 Sales</h3><Ctl l="Units sold per month" v={units} set={setUnits} mn={0} mx={1000} stp={5} /><Ctl l="Price" v={price} set={setPrice} mn={500} mx={20000} stp={100} fmt={cop} /><Ctl l="Cost of goods per unit" v={unit} set={setUnit} mn={100} mx={15000} stp={50} fmt={cop} />
          <h3>🧾 Operating expenses (monthly)</h3>{ex.map((x, i) => <div key={i} className="g11-inline"><input className="start-input" value={x.n} onChange={(e) => setEx(ex.map((y, j) => (j === i ? { ...y, n: e.target.value } : y)))} /><MoneyInput value={x.v} onChange={(v) => setEx(ex.map((y, j) => (j === i ? { ...y, v } : y)))} /></div>)}<button type="button" className="p1-link" onClick={() => setEx([...ex, { n: "", v: "" }])}><Plus size={14} /> add an expense</button>
          <p className="start-tip">💡 "Founders' pay": if your team works for free, the business is only profitable because you are not paying yourselves.</p></div>
        <div className="start-block g11-pl"><h3>📒 Income statement · 1 month</h3>
          <MiniTable head={["", "$", "% of revenue"]} rows={[["Revenue", cop(rev), "100%"], ["− Cost of goods sold", cop(cogs), `${rev ? Math.round((cogs / rev) * 100) : 0}%`], ["= GROSS PROFIT", cop(gross), `${gm}%`], ...ex.filter((x) => num(x.v) > 0).map((x) => [`− ${x.n}`, cop(num(x.v)), `${rev ? Math.round((num(x.v) / rev) * 100) : 0}%`])]} foot={["= NET INCOME", cop(net), `${nm}%`]} />
          <div className="g10-kpis"><div><small>Gross margin</small><b className={gm >= 40 ? "pos" : "neg"}>{gm}%</b></div><div><small>Net margin</small><b className={nm > 0 ? "pos" : "neg"}>{nm}%</b></div></div>
          <HBars rows={[{ l: "Revenue", v: rev, c: "#3c9d5d" }, { l: "Cost of goods", v: cogs, c: "#c8743a" }, { l: "Expenses", v: opex, c: "#c8563a" }, { l: "Net income", v: Math.max(0, net), c: "#2e6b4a" }]} /></div>
      </div>
      <div className="start-block"><h3>✍️ What our P&L says</h3><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="Our revenue is $360,000, but our net margin is only 12% because…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(32, { units, price, unit, exRows: ex, rev, cogs, gross, opex, net, gm, nm, text })}>Save our P&L <span className="coin-tag"><Coins size={15} /> +32</span></button></div>
    </ActShell>
  );
}
const RUSH_PL = {
  buckets: [
    { id: "rev", e: "💰", l: "Revenue", d: "money from sales", c: "#3c9d5d" }, { id: "cogs", e: "🧂", l: "Cost of goods", d: "direct cost of each unit", c: "#c8743a" },
    { id: "opex", e: "🧾", l: "Operating expense", d: "costs to run the company", c: "#c8563a" }, { id: "no", e: "🚫", l: "Not in the P&L", d: "loans, investments, assets", c: "#5f5a6b" },
  ],
  items: [
    { e: "🍮", t: "Sales of 120 gelatins", b: "rev", why: "Money from selling the product." }, { e: "🍓", t: "Strawberries used in this month's batches", b: "cogs", why: "Direct cost of each unit." },
    { e: "📦", t: "Cups and lids for each unit", b: "cogs", why: "Packaging is part of each unit's cost." }, { e: "🖼️", t: "Posters for the school", b: "opex", why: "Marketing runs the company; it's not inside each unit." },
    { e: "🚌", t: "Transport to buy ingredients", b: "opex", why: "An expense of running the business." }, { e: "🏦", t: "A $500,000 loan received", b: "no", why: "A loan is cash in, not revenue." },
    { e: "🦈", t: "Money from an investor for 20%", b: "no", why: "Investment = equity, not revenue." }, { e: "🧊", t: "Buying a freezer that will last 5 years", b: "no", why: "An asset (only its yearly depreciation goes to the P&L)." },
    { e: "🎂", t: "A special order for a birthday party", b: "rev", why: "Sales = revenue." }, { e: "🧁", t: "Sugar and flour for the brownies sold", b: "cogs", why: "Direct ingredients." },
    { e: "📱", t: "Instagram ad", b: "opex", why: "Marketing expense." }, { e: "👩‍🍳", t: "Pay for the founders' work hours", b: "opex", why: "Salaries run the company." },
    { e: "💵", t: "Paying back part of the loan", b: "no", why: "Paying the principal is not an expense (the interest is)." }, { e: "🎁", t: "Gift cards sold and already used by customers", b: "rev", why: "Revenue when the product is delivered." },
    { e: "🧼", t: "Soap base used in the soaps sold", b: "cogs", why: "Direct material." }, { e: "🎪", t: "Rent of the stand at the fair", b: "opex", why: "Operating expense." },
  ],
};

/* ---------- C2 · Cash Flow Survival (12 meses con eventos) ---------- */
const CASH_EV = [
  { e: "🏪", t: "A store wants 300 units — but pays in 60 days.", o: [{ t: "Accept the order as it is", cash: [-1, 0, 2], profit: 1, note: "Big profit later; you pay ingredients NOW." }, { t: "Accept with a 30% deposit", cash: [-0.4, 0, 1.4], profit: 0.95, good: true, note: "The deposit protects your cash." }, { t: "Say no", cash: [0, 0, 0], profit: 0, note: "Safe, but you lose a big opportunity." }] },
  { e: "🧊", t: "Your freezer breaks. A new one costs $400,000.", o: [{ t: "Buy a new one with all your cash", cash: [-4], profit: 0, note: "Your cash goes to zero for one month." }, { t: "Rent one for $40,000 a month", cash: [-0.4, -0.4, -0.4], profit: -1.2, good: true, note: "Smaller payments keep cash alive." }, { t: "Buy a used one for $180,000", cash: [-1.8], profit: 0, good: true, note: "Cheaper, a bit riskier." }] },
  { e: "🍓", t: "A supplier offers 20% off if you buy 4 months of fruit today.", o: [{ t: "Buy 4 months now", cash: [-3, 0.8, 0.8, 0.8], profit: 0.6, note: "Cheaper, but your cash is stuck in inventory (and fruit can spoil)." }, { t: "Keep buying monthly", cash: [0], profit: 0, good: true, note: "Flexible cash; no discount." }, { t: "Buy 2 months now", cash: [-1.4, 0.75], profit: 0.2, good: true, note: "A balance." }] },
  { e: "🎄", t: "December: demand doubles if you can produce more.", o: [{ t: "Produce double (buy ingredients now)", cash: [-1.2, 2.6], profit: 1.4, good: true, note: "Cash out first, more cash in later." }, { t: "Same production as always", cash: [0], profit: 0, note: "You miss the season." }, { t: "Ask customers to pre-order with 50%", cash: [0.8, 1.4], profit: 1.2, good: true, note: "Customers finance your production!" }] },
  { e: "🏦", t: "The bank offers you a $1,000,000 credit line.", o: [{ t: "Use all of it for marketing", cash: [10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], profit: -2.5, note: "Expensive interest for uncertain sales." }, { t: "Keep it only for emergencies", cash: [0], profit: 0, good: true, note: "A safety net costs little if you don't use it." }, { t: "Say no", cash: [0], profit: 0, good: true, note: "Fine if your cash plan is strong." }] },
  { e: "📉", t: "A slow month: sales fall 40%.", o: [{ t: "Cut production and costs", cash: [0.3], profit: 0.2, good: true, note: "Less waste, cash protected." }, { t: "Produce as usual", cash: [-0.6], profit: -0.6, note: "Waste and lost cash." }, { t: "Give 30% discounts to everyone", cash: [-0.3], profit: -0.4, note: "Margins disappear." }] },
];
function CashSurvival({ resp, existing, onSave, onExit }) {
  const pl = plOf(resp); const unitCash = Math.max(40000, Math.round(Math.abs(pl.net || 100000) / 2 / 1000) * 1000);
  const base = Math.max(30000, Math.round((pl.net > 0 ? pl.net : 80000) / 1000) * 1000);
  const [order] = useState(() => shuffleArr(CASH_EV.map((_, i) => i)));
  const evMonths = [1, 3, 5, 7, 9, 11];
  const [m, setM] = useState(0);
  const [flows, setFlows] = useState(() => Array(12).fill(base));
  const [profit, setProfit] = useState(0);
  const [log, setLog] = useState([]);
  const [pick, setPick] = useState(null);
  const [st, finish] = useFinish(onSave);
  const START = 200000;
  const evIdx = evMonths.indexOf(m); const ev = evIdx >= 0 ? CASH_EV[order[evIdx]] : null;
  const cashAt = (k) => START + flows.slice(0, k + 1).reduce((a, x) => a + x, 0);
  const hist = log.map((x) => x.cash);
  const minCash = Math.min(START, ...hist);
  const decide = (o) => { const f = flows.slice(); o.cash.forEach((c, j) => { if (m + j < 12) f[m + j] += Math.round(c * unitCash); }); setFlows(f); setProfit(profit + o.profit * unitCash); setPick(o); };
  const next = () => { const cash = cashAt(m); setLog([...log, { m: m + 1, cash, ev: ev ? ev.e : "", pick: pick?.t || "", good: !!pick?.good }]); setM(m + 1); setPick(null); };
  const done = m >= 12; const goods = log.filter((x) => x.good).length;
  const broke = log.some((x) => x.cash < 0);
  if (st.done) return <Reward title={broke ? "You survived… barely 💧" : "Cash master! 💧"} subtitle={`Lowest cash ${cop(minCash)} · ${goods} smart decisions`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Wallet size={22} strokeWidth={2.1} />} title="Cash Flow Survival 💧 · 12 months" subtitle={`You start with ${cop(START)}. Normal months bring about ${cop(base)}. Six events will test your cash — not only your profit.`} onExit={onExit}>
      <Brief91 k="c2_cash" /><Guide11 {...GD_CASH} />
      <div className="g10-kpis"><div><small>📅 Month</small><b>{Math.min(m + 1, 12)}/12</b></div><div><small>💧 Cash now</small><b className={(m ? cashAt(m - 1) : START) >= 0 ? "pos" : "neg"}>{cop(m ? cashAt(m - 1) : START)}</b></div><div><small>📉 Lowest cash</small><b className={minCash >= 0 ? "" : "neg"}>{cop(minCash)}</b></div><div><small>✅ Smart decisions</small><b>{goods}</b></div></div>
      {!done ? (
        <div className="start-block g10-event">
          {ev ? <><div className="g10-event-head"><em>{ev.e}</em><div><b>Month {m + 1} · decision</b><p>{ev.t}</p></div></div>
            <div className="quiz-options">{ev.o.map((o) => <button key={o.t} type="button" disabled={!!pick} className={`quiz-opt ${pick === o ? (o.good ? "correct" : "wrong") : ""}`} onClick={() => decide(o)}><span className="opt-text">{o.t}</span></button>)}</div>
            {pick && <div className={`p1-banner ${pick.good ? "good" : "bad"}`}><span>{pick.note} <i className="g10-fx">cash this month {cop(flows[m])}</i></span></div>}</>
            : <div className="g10-event-head"><em>📆</em><div><b>Month {m + 1}</b><p>A normal month. Cash in: {cop(flows[m])}.</p></div></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!!ev && !pick} onClick={next}>Close month {m + 1} <ChevronRight size={18} /></button></div>
        </div>
      ) : <div className={`p1-banner ${broke ? "bad" : "good"}`}><span>{broke ? "⚠️ Some months your cash was NEGATIVE: in real life you would need an emergency loan (or close). " : "✅ Your cash never went below zero. "}Profit and cash are different stories — look at the chart.</span></div>}
      {log.length > 0 && <ChartCard title="Cash at the end of each month (red = below zero)" legend={[{ name: "Cash", color: "#3c9d5d" }, { name: "Zero", color: "#c8563a" }]}><LineChart labels={log.map((x) => `M${x.m}`)} series={[{ name: "Cash", values: log.map((x) => x.cash), color: "#3c9d5d" }, { name: "Zero", values: log.map(() => 0), color: "#c8563a" }]} /></ChartCard>}
      {done && <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(16 + goods * 3 + (broke ? 0 : 4), { minCash, goods, broke, log })}>Save my survival report <span className="coin-tag"><Coins size={15} /> +{16 + goods * 3 + (broke ? 0 : 4)}</span></button></div>}
    </ActShell>
  );
}
const CASH_R = [
  { tag: "Cash vs. profit", q: "You sell 100 units at $3,000 (cost $1,500) but the store pays in 60 days. Cash from this sale THIS month?", answer: 0, money: true, hint: "When does the money arrive?", visual: F11("Cash this month = money that ARRIVES this month (not money promised)", ["The sale is real and has a profit…", "…but the store pays in 60 days.", "So how much enters the bank THIS month?"]), explain: "$0 now. Profit exists, cash doesn't — yet." },
  { tag: "Deposit", q: "A $600,000 order with a 30% deposit. Cash you receive today?", answer: 180000, money: true, hint: "600,000 × 0.30", visual: F11("Deposit = order value × deposit %", ["Order value = $600,000", "Deposit % = 30% = 0.30", "Deposit = 600,000 × 0.30"]), explain: "$180,000 today." },
  { tag: "Ending cash", q: "Start $250,000 · in $400,000 · out $520,000. Cash at the end?", answer: 130000, money: true, hint: "250,000 + 400,000 − 520,000", visual: F11("Ending cash = starting cash + cash IN − cash OUT", ["Starting = 250,000", "IN = 400,000 · OUT = 520,000", "Ending = 250,000 + 400,000 − 520,000"]), explain: "$130,000." },
  { tag: "Not an expense", q: "Which one takes cash OUT but is NOT an expense in the P&L?", options: ["Paying back the loan's principal.", "Paying the ingredients you used.", "Paying an Instagram ad.", "Paying the stand rent."], correct: 0, explain: "Principal is not a cost; only the interest is." },
  { tag: "Inventory", q: "You buy $300,000 of ingredients today and use them over 3 months. In the P&L this month you see about…", answer: 100000, money: true, hint: "300,000 ÷ 3", visual: F11("Cost in the P&L this month = part of the ingredients USED this month", ["You paid $300,000 today (cash OUT).", "You use them during 3 months.", "P&L this month = 300,000 ÷ 3"]), explain: "$100,000 — but your cash fell $300,000 today." },
  { tag: "Runway", q: "You have $360,000 and you burn $90,000 a month. How many months can you survive?", answer: 4, unit: "months", hint: "360,000 ÷ 90,000", visual: F11("Runway (months) = cash ÷ monthly burn", ["Cash = 360,000", "Burn (you lose each month) = 90,000", "Runway = 360,000 ÷ 90,000"]), explain: "4 months of runway." },
];
function CashPlan({ resp, existing, onSave, onExit }) {
  const pl = plOf(resp);
  const [start, setStart] = useState(existing?.start || "200000");
  const [rows, setRows] = useState(existing?.rows || [
    { n: "Sales collected", t: "in", v: [String(Math.round(pl.rev * 0.6)), String(Math.round(pl.rev)), String(Math.round(pl.rev))] },
    { n: "Pre-order deposits", t: "in", v: ["", "", ""] },
    { n: "Ingredients & packaging", t: "out", v: [String(Math.round(pl.cogs)), String(Math.round(pl.cogs)), String(Math.round(pl.cogs))] },
    { n: "Marketing", t: "out", v: ["", "", ""] },
    { n: "Equipment", t: "out", v: ["", "", ""] },
  ]);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const flow = [0, 1, 2].map((m) => rows.reduce((a, r) => a + (r.t === "in" ? 1 : -1) * num(r.v[m]), 0));
  const end = [0, 1, 2].map((m) => num(start) + flow.slice(0, m + 1).reduce((a, x) => a + x, 0));
  const G = [W_NUMBERS(2), W_TOPIC("Use 2 cash words", ["cash", "deposit", "payment", "month", "negative", "reserve", "collect"], 2, "cash · deposit · reserve")];
  const ok = rows.filter((r) => r.v.some((x) => num(x) > 0)).length >= 4 && end.every((x) => x >= 0) && goalsOk(text, 25, 70, G);
  const up = (i, m, v) => setRows(rows.map((r, j) => (j === i ? { ...r, v: r.v.map((x, k) => (k === m ? v : x)) } : r)));
  if (st.done) return <Reward title="Cash plan ready! 📅" subtitle={`Month 3 ends with ${cop(end[2])}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Calendar size={22} strokeWidth={2.1} />} title="Our Cash Plan 📅 · 3 months" subtitle="Write every peso that comes IN and goes OUT. No month can end below zero." onExit={onExit}>
      <Brief91 k="c2_plan" /><Guide11 {...GD_PLAN} />
      <div className="p3-sentence edit"><span>💧 Starting cash</span><MoneyInput value={start} onChange={setStart} /></div>
      <div className="g11-rows cash"><div className="g11-row head"><span>Item</span><span>In / out</span><span>Month 1</span><span>Month 2</span><span>Month 3</span></div>
        {rows.map((r, i) => <div key={i} className="g11-row"><input className="start-input" value={r.n} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, n: e.target.value } : x)))} /><button type="button" className={`g11-io ${r.t}`} onClick={() => setRows(rows.map((x, j) => (j === i ? { ...x, t: x.t === "in" ? "out" : "in" } : x)))}>{r.t === "in" ? "⬆️ IN" : "⬇️ OUT"}</button>{[0, 1, 2].map((m) => <input key={m} className="start-input" type="number" value={r.v[m]} onChange={(e) => up(i, m, e.target.value)} />)}</div>)}
        <div className="g11-row foot"><span>Net flow</span><span /> {flow.map((f, m) => <b key={m} className={f >= 0 ? "pos" : "neg"}>{cop(f)}</b>)}</div>
        <div className="g11-row foot"><span>CASH AT THE END</span><span /> {end.map((f, m) => <b key={m} className={f >= 0 ? "pos" : "neg"}>{cop(f)}</b>)}</div>
        <button type="button" className="p1-link" onClick={() => setRows([...rows, { n: "", t: "out", v: ["", "", ""] }])}><Plus size={14} /> add a row</button>
      </div>
      {end.some((x) => x < 0) && <div className="p1-banner bad"><span>⚠️ A month ends below zero. Ask for deposits, delay equipment or reduce a cost.</span></div>}
      <div className="start-block"><h3>✍️ How we protect our cash</h3><WordField value={text} onChange={setText} min={25} max={70} goals={G} placeholder="We ask for a 50% deposit, so in month 1 our cash…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(28, { start: num(start), rows, flow, end, text })}>Save our cash plan <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}

/* ---------- C3 · Funding Lab ---------- */
const NEED = 600000;
function FundingLab({ resp, existing, onSave, onExit }) {
  const pl = plOf(resp); const monthlyNet = Math.max(0, pl.net);
  const [a, setA] = useState(existing?.mix || { save: 100000, family: 0, loan: 0, inv: 0, crowd: 0 });
  const [invPct, setInvPct] = useState(existing?.invPct || 20);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const rM = 0.022, nM = 12;
  const pay = a.loan ? pmt(a.loan, rM, nM) : 0; const interest = a.loan ? pay * nM - a.loan : 0;
  const crowdFee = a.crowd * 0.08 + a.crowd * 0.15; const val = a.inv ? a.inv / (invPct / 100) : 0;
  const total = a.save + a.family + a.loan + a.inv + a.crowd;
  const control = 100 - (a.inv ? invPct : 0);
  const okPay = pay <= monthlyNet * 0.6 || !a.loan;
  const G = [W_NUMBERS(2), W_REASON, W_TOPIC("Use 2 funding words", ["loan", "interest", "equity", "investor", "control", "crowdfunding", "savings", "cash flow"], 2, "loan · equity · control · interest")];
  const ok = total >= NEED && a.save <= 200000 && a.family <= 150000 && okPay && goalsOk(text, 30, 80, G);
  const K = [["save", "🐷", "Team savings", "max $200,000 · no cost", 200000], ["family", "👨‍👩‍👧", "Family loan", "max $150,000 · 0% but relationship risk", 150000], ["loan", "🏦", "Bank/fintech loan", "2.2% monthly · 12 months", 600000], ["inv", "🦈", "Investor (equity)", "you give a % of the company", 600000], ["crowd", "👥", "Crowdfunding", "8% fee + ~15% cost of rewards", 400000]];
  if (st.done) return <Reward title="Funding plan closed! 🏦" subtitle={`${cop(total)} · you keep ${control}%`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Landmark size={22} strokeWidth={2.1} />} title="Funding Lab 🏦" subtitle={`Your company needs ${cop(NEED)} for a bigger oven/freezer and the first big batch. Build the mix — and pay its real cost.`} onExit={onExit}>
      <Brief91 k="c3_lab" /><Guide11 {...GD_FUND} />
      <div className="g10-kpis"><div><small>🎯 Needed</small><b>{cop(NEED)}</b></div><div><small>💼 Raised</small><b className={total >= NEED ? "pos" : "neg"}>{cop(total)}</b></div><div><small>📒 Monthly net income (P&L)</small><b>{cop(monthlyNet)}</b></div></div>
      {K.map(([k, e, l, d, mx]) => <div key={k} className="start-block g11-fund"><div className="g10-event-head"><em>{e}</em><div><b>{l}</b><p>{d}</p></div></div><Ctl l="Amount" v={a[k]} set={(v) => setA({ ...a, [k]: v })} mn={0} mx={mx} stp={10000} fmt={cop} />
        {k === "loan" && a.loan > 0 && <p className={`g91-note ${okPay ? "pos" : "neg"}`}>Payment {cop(pay)}/month for 12 months · total interest {cop(interest)} · E.A. {pm(eaFromM(rM), 1)}. {okPay ? "OK for your cash flow." : "⚠️ More than 60% of your monthly profit!"}</p>}
        {k === "inv" && a.inv > 0 && <><Ctl l="% of the company for the investor" v={invPct} set={setInvPct} mn={5} mx={60} fmt={(x) => `${x}%`} /><p className="g91-note">Implied valuation: <b>{cop(val)}</b> · you keep {100 - invPct}% of every future profit.</p></>}
        {k === "crowd" && a.crowd > 0 && <p className="g91-note">Fees + rewards ≈ {cop(crowdFee)} · you must deliver to every backer.</p>}
      </div>)}
      <div className="g10-two"><div className="start-block"><h3>🥧 Our mix</h3><PctBar parts={K.filter(([k]) => a[k] > 0).map(([k, e, l], i) => ({ label: `${e} ${l}`, value: total ? Math.round((a[k] / total) * 100) : 0, color: ["#3c9d5d", "#e0a03a", "#c8563a", "#6b4e8f", "#2e6b4a"][i % 5] }))} /></div>
        <div className="start-block"><h3>💸 Real cost of the money</h3><MiniTable head={["Source", "Cost"]} rows={[["Loan interest", cop(interest)], ["Crowdfunding fees + rewards", cop(crowdFee)], ["Equity given", a.inv ? `${invPct}% forever` : "0%"]]} /><Gauge91 label="Control we keep" value={control} max={100} target={51} targetLabel="majority" good={control >= 51} /></div></div>
      <div className="start-block"><h3>✍️ Why this mix?</h3><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="We use $200,000 of savings and a $250,000 loan because our monthly payment… We keep 100% control, but…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(32, { mix: a, invPct, pay: Math.round(pay), interest: Math.round(interest), control, total, text })}>{total < NEED ? `Raise ${cop(NEED - total)} more` : "Save our funding plan"} <span className="coin-tag"><Coins size={15} /> +32</span></button></div>
    </ActShell>
  );
}
const LOAN_R = [
  { tag: "Payment", q: "Loan $300,000 at 2% monthly for 6 months. Monthly payment (fixed)?", answer: Math.round(pmt(300000, 0.02, 6)), money: true, tol: 300, hint: "P × r ÷ (1 − (1 + r)^−n)", visual: F11("Payment = P × r ÷ (1 − (1 + r)^−n)", ["P = 300,000 · r = 2% = 0.02 · n = 6", "(1.02)^6 = 1.1262 → 1 ÷ 1.1262 = 0.8880", "Payment = 300,000 × 0.02 ÷ (1 − 0.8880)", "Calculator: 6,000 ÷ 0.1120 = ?"]), explain: `About ${cop(pmt(300000, 0.02, 6))}.` },
  { tag: "Total interest", q: `Same loan: 6 payments of ${cop(pmt(300000, 0.02, 6))}. Total interest?`, answer: Math.round(pmt(300000, 0.02, 6) * 6 - 300000), money: true, tol: 600, hint: "6 × payment − 300,000", visual: F11("Total interest = (payment × number of payments) − amount borrowed", ["Payment ≈ $53,558 · payments = 6", "Total paid = 6 × 53,558", "Interest = total paid − 300,000"]), explain: `About ${cop(pmt(300000, 0.02, 6) * 6 - 300000)}.` },
  { tag: "E.A.", q: "2% monthly is about how much E.A.? (%, 1 decimal)", answer: 26.8, unit: "%", tol: 0.2, hint: "1.02^12 − 1", visual: F11("E.A. = (1 + monthly rate)^12 − 1", ["Monthly rate = 2% = 0.02", "1.02^12 = ? (use the calculator: 1.02 xʸ 12)", "Subtract 1 and multiply by 100"]), explain: "26.8% E.A." },
  { tag: "Equity", q: "An investor gives $500,000 for 25%. Implied valuation?", answer: 2000000, money: true, hint: "500,000 ÷ 0.25", visual: F11("Implied valuation = money ÷ % (as a decimal)", ["Money = 500,000", "% = 25% = 0.25", "Valuation = 500,000 ÷ 0.25"]), explain: "$2,000,000." },
  { tag: "Crowdfunding", q: "You raise $400,000 with an 8% platform fee. What do you receive?", answer: 368000, money: true, hint: "400,000 × 0.92", visual: F11("Money received = money raised × (1 − fee)", ["Raised = 400,000", "Fee = 8% = 0.08 → 1 − 0.08 = 0.92", "Received = 400,000 × 0.92"]), explain: "$368,000 (and you still have to produce the rewards)." },
  { tag: "Decide", visual: F11("Safe payment ≤ 60% of monthly profit", ["Monthly profit = 90,000", "60% of 90,000 = 54,000", "Which option is below that line — with room to spare?"]), q: "Monthly profit $90,000. Which loan payment is safest?", options: ["$40,000 a month.", "$85,000 a month.", "$110,000 a month.", "$95,000 a month."], correct: 0, explain: "Keep payments well below your monthly profit." },
];

/* ---------- C4 · Valuation Machine ---------- */
function ValuationMachine({ resp, existing, onSave, onExit }) {
  const pl = plOf(resp);
  const [revM, setRevM] = useState(existing?.revM || 1.5);
  const [earnM, setEarnM] = useState(existing?.earnM || 5);
  const [g, setG] = useState(existing?.growth || 30);
  const [dr, setDr] = useState(existing?.dr || 35);
  const [ask, setAsk] = useState(existing?.ask || 300000);
  const [pctA, setPctA] = useState(existing?.pct || 15);
  const [walk, setWalk] = useState(existing?.walk || 25);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const revY = pl.rev * 12; const profY = Math.max(0, pl.net) * 12;
  const v1 = revY * revM; const v2 = profY * earnM;
  const flows = Array.from({ length: 5 }, (_, t) => profY * Math.pow(1 + g / 100, t + 1));
  const v3 = flows.reduce((a, f, t) => a + f / Math.pow(1 + dr / 100, t + 1), 0);
  const lo = Math.min(v1, v2, v3), hi = Math.max(v1, v2, v3);
  const implied = ask / (pctA / 100);
  const inRange = implied >= lo * 0.8 && implied <= hi * 1.2;
  const G = [W_NUMBERS(2), W_TOPIC("Use 2 valuation words", ["valuation", "multiple", "revenue", "profit", "risk", "equity", "%"], 2, "valuation · multiple · risk"), W_REASON];
  const ok = profY >= 0 && inRange && walk > pctA && goalsOk(text, 30, 80, G);
  if (st.done) return <Reward title={`Worth about ${cop(implied)} 💎`} subtitle={`Ask: ${cop(ask)} for ${pctA}%`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Gem size={22} strokeWidth={2.1} />} title="Valuation Machine 💎" subtitle="Three methods → a range → an ask your numbers can defend → a walk-away point." onExit={onExit}>
      <Brief91 k="c4_val" /><Guide11 {...GD_VAL} />
      <div className="g10-kpis"><div><small>📈 Revenue / year</small><b>{cop(revY)}</b></div><div><small>💰 Profit / year</small><b className={profY > 0 ? "pos" : "neg"}>{cop(profY)}</b></div>{pl.sample && <div><small>⚠️</small><b>sample P&L</b></div>}</div>
      <div className="g10-two">
        <div className="start-block"><h3>① Revenue multiple</h3><Ctl l="Multiple" v={revM} set={setRevM} mn={0.5} mx={4} stp={0.25} fmt={(x) => `${x}×`} /><p>{cop(revY)} × {revM} = <b>{cop(v1)}</b></p>
          <h3>② Earnings multiple</h3><Ctl l="Multiple" v={earnM} set={setEarnM} mn={2} mx={10} stp={0.5} fmt={(x) => `${x}×`} /><p>{cop(profY)} × {earnM} = <b>{cop(v2)}</b></p></div>
        <div className="start-block"><h3>③ Discounted cash flow (5 years)</h3><Ctl l="Profit growth per year" v={g} set={setG} mn={0} mx={80} stp={5} fmt={(x) => `${x}%`} /><Ctl l="Discount rate (risk)" v={dr} set={setDr} mn={15} mx={60} stp={5} fmt={(x) => `${x}%`} /><p>PV of 5 years of profit = <b>{cop(v3)}</b></p>
          <ChartCard title="Valuation range"><BarChart bars={[{ label: "Revenue ×", value: v1, color: "#3c9d5d" }, { label: "Earnings ×", value: v2, color: "#e0a03a" }, { label: "DCF", value: v3, color: "#6b4e8f" }]} /></ChartCard></div>
      </div>
      <div className="start-block g10-boss"><h3>🦈 Our ask</h3><Ctl l="Money we ask for" v={ask} set={setAsk} mn={50000} mx={2000000} stp={10000} fmt={cop} /><Ctl l="% we offer" v={pctA} set={setPctA} mn={5} mx={50} fmt={(x) => `${x}%`} /><Ctl l="Walk-away: the MAX % we would give" v={walk} set={setWalk} mn={5} mx={60} fmt={(x) => `${x}%`} />
        <div className="g10-kpis"><div><small>Implied valuation</small><b className={inRange ? "pos" : "neg"}>{cop(implied)}</b></div><div><small>Our range</small><b>{cop(lo)} – {cop(hi)}</b></div></div>
        {!inRange && <p className="g91-note neg">⚠️ Your ask implies a valuation far from your range: sharks will laugh (or leave).</p>}
        {walk <= pctA && <p className="g91-note neg">⚠️ Your walk-away % must be bigger than your first offer.</p>}
        <WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="We ask $300,000 for 15% because our valuation range is… Our walk-away point is 25% because…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(34, { revM, earnM, growth: g, dr, v1, v2, v3, lo, hi, ask, pct: pctA, walk, implied, text })}>Save our valuation <span className="coin-tag"><Coins size={15} /> +34</span></button></div>
    </ActShell>
  );
}
const OVER_R = [
  { tag: "🍪 CookieLab", q: "Ask: $200,000 for 10%. Implied valuation?", answer: 2000000, money: true, hint: "200,000 ÷ 0.10", visual: F11("Implied valuation = money asked ÷ % offered", ["Money = 200,000", "% = 10% = 0.10", "Valuation = 200,000 ÷ 0.10"]), explain: "$2,000,000." },
  { tag: "🍪 CookieLab", q: "CookieLab sells $400,000 a year and earns $60,000. Is $2,000,000 reasonable?", visual: F11("Revenue multiple = valuation ÷ revenue  ·  Earnings multiple = valuation ÷ profit", ["2,000,000 ÷ 400,000 = 5× revenue (small food businesses: about 1–3×)", "2,000,000 ÷ 60,000 = 33× profit (small risky businesses: about 3–8×)"]), options: ["No: 5× revenue and 33× profit is far too high.", "Yes: every startup is worth millions.", "Yes: profit doesn't matter at all, only how fast sales grow.", "We can't know without the logo."], correct: 0, explain: "Compare valuation with revenue and profit multiples." },
  { tag: "🥤 Fresko", q: "Ask: $150,000 for 30%. Implied valuation?", answer: 500000, money: true, hint: "150,000 ÷ 0.30", visual: F11("Implied valuation = money ÷ %", ["150,000 ÷ 0.30 = ?"]), explain: "$500,000." },
  { tag: "🥤 Fresko", q: "Fresko earns $120,000 a year and grows 50%. A shark offers $150,000 for 40%. You…", visual: F11("Compare the two valuations", ["Fresko asked 150,000 for 30% → $500,000", "The shark offers 150,000 for 40% → 150,000 ÷ 0.40 = $375,000 (he values you LOWER)", "Profit 120,000 × 4 (a fair multiple) = ? → can you defend $500,000?"]), options: ["Counter: $150,000 for 30% — the numbers support $500,000.", "Accept immediately: any money is good money for a new startup.", "Ask for $1,000,000 for 5%.", "Walk away without saying anything."], correct: 0, explain: "Negotiate inside your range." },
  { tag: "🧼 Spuma", q: "Ask: $90,000 for 15%. Implied valuation?", answer: 600000, money: true, hint: "90,000 ÷ 0.15", visual: F11("Implied valuation = money ÷ %", ["90,000 ÷ 0.15 = ?"]), explain: "$600,000." },
  { tag: "🧼 Spuma", q: "A shark offers $90,000 for 15% + a royalty of $500 per soap until she recovers $90,000. Spuma sells 2,000 soaps a year. How many years until the royalty ends?", answer: 0.09 * 1000000 / (500 * 2000) * 1, unit: "years", tol: 0.05, hint: "90,000 ÷ (500 × 2,000)", visual: F11("Years of royalty = money to recover ÷ (royalty per unit × units per year)", ["Money to recover = 90,000", "Royalty per year = 500 × 2,000 = 1,000,000", "Years = 90,000 ÷ 1,000,000"]), explain: "90,000 ÷ 1,000,000 = 0.09 years — about 1 month!" },
  { tag: "🕯️ Lumi", q: "Lumi asks $300,000 for 20% but loses $40,000 a year. The best shark answer is…", options: ["“Show me how you reach profit first.”", "“Here is $600,000 for 10%.”", "“Losses don't matter for a candle company like yours.”", "“I'll buy 100% of the company right now, with no questions.”"], correct: 0, explain: "No profit = very high risk." },
  { tag: "Smart money", q: "Two offers: A) $300,000 for 20% from someone with no contacts; B) $300,000 for 25% from a supermarket owner. B can be better because…", options: ["it brings distribution: more sales channels.", "a bigger percentage is always better for founders.", "supermarket owners never ask for profits.", "it has a higher implied valuation."], correct: 0, explain: "Smart money brings more than cash." },
];

/* ---------- C5 · Cap Table ---------- */
function CapTable({ resp, existing, onSave, onExit }) {
  const team = P1of(resp).c1_team; const members = (team?.members?.length ? team.members : ["Founder A", "Founder B", "Founder C"]).slice(0, 4);
  const [split, setSplit] = useState(existing?.split || Object.fromEntries(members.map((m) => [m, Math.floor(100 / members.length)])));
  const [seed, setSeed] = useState(existing?.seed || 15);
  const [pool, setPool] = useState(existing?.pool || 5);
  const [seriesA, setSeriesA] = useState(existing?.seriesA || 20);
  const [r, setR] = useState(null);
  const [st, finish] = useFinish(onSave);
  const sum = Object.values(split).reduce((a, v) => a + v, 0);
  const after = (pctNew) => (x) => x * (1 - pctNew / 100);
  const r1 = Object.fromEntries(members.map((m) => [m, split[m]])); const s1 = { ...Object.fromEntries(members.map((m) => [m, after(seed)(r1[m])])), Seed: seed };
  const s2 = { ...Object.fromEntries(Object.entries(s1).map(([k, v]) => [k, after(pool)(v)])), "Employee pool": pool };
  const s3 = { ...Object.fromEntries(Object.entries(s2).map(([k, v]) => [k, after(seriesA)(v)])), "Series A": seriesA };
  const COL = ["#3c9d5d", "#e0a03a", "#c8563a", "#6b4e8f", "#2e6b4a", "#d98fb0", "#7a4a2b"];
  const pie = (o) => Object.entries(o).map(([k, v], i) => ({ label: k, value: r2(v), color: COL[i % COL.length] }));
  const CAP_R = [
    { tag: "Dilution", q: `A founder has 40%. The seed investor buys ${seed}% (new shares). The founder now has… (%, 1 decimal)`, answer: r2(40 * (1 - seed / 100)), unit: "%", tol: 0.1, hint: `40 × (1 − ${seed / 100})`, visual: F11("New % = old % × (1 − % sold to the new investor)", [`Old % = 40 · sold = ${seed}% = ${seed / 100}`, `New % = 40 × ${r2(1 - seed / 100)}`]), explain: `${r2(40 * (1 - seed / 100))}%: smaller %, but of a bigger, funded company.` },
    { tag: "Value", q: "You own 30% of a company valued at $2,000,000. Your part is worth…", answer: 600000, money: true, hint: "2,000,000 × 0.30", visual: F11("Value of your slice = % × valuation", ["2,000,000 × 0.30 = ?"]), explain: "$600,000." },
    { tag: "Pie", q: "Is dilution always bad?", options: ["No — 20% of a big pie can be worth more than 100% of a tiny one.", "Yes — founders should never sell any percentage of the company.", "Yes — investors always take control of every decision.", "No — percentages never change after the company starts."], correct: 0, explain: "Value of your slice = % × valuation." },
  ];
  if (st.done) return <Reward title="Cap table mastered! 🥧" subtitle="You know who owns what — after every round." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<PieChart size={22} strokeWidth={2.1} />} title="Cap Table Simulator 🥧" subtitle="Who owns your company today — and after a seed round, an employee pool and a Series A?" onExit={onExit}>
      <Brief91 k="c5_cap" /><Guide11 {...GD_CAP} />
      <div className="start-block"><h3>1 · Founders' split (must be 100%)</h3>{members.map((m) => <Ctl key={m} l={m} v={split[m] || 0} set={(v) => setSplit({ ...split, [m]: v })} mn={0} mx={100} fmt={(x) => `${x}%`} />)}<p className={`g91-note ${sum === 100 ? "pos" : "neg"}`}>Total: {sum}%</p></div>
      <div className="start-block"><h3>2 · The rounds</h3><Ctl l="Seed investor buys" v={seed} set={setSeed} mn={0} mx={40} fmt={(x) => `${x}%`} /><Ctl l="Employee pool" v={pool} set={setPool} mn={0} mx={15} fmt={(x) => `${x}%`} /><Ctl l="Series A investor buys" v={seriesA} set={setSeriesA} mn={0} mx={40} fmt={(x) => `${x}%`} /></div>
      <div className="g11-caps">{[["Today", r1, "The founders' split"], ["After seed", s1, `Each owner × (1 − ${seed}%) · Seed gets ${seed}%`], ["After pool", s2, `Each owner × (1 − ${pool}%) · Pool gets ${pool}%`], ["After Series A", s3, `Each owner × (1 − ${seriesA}%) · Series A gets ${seriesA}%`]].map(([t, o, f]) => <div key={t} className="start-block"><h3>{t}</h3><p className="g91-note">🧮 {f}</p><PctBar parts={pie(o)} /><MiniTable head={["Owner", "%"]} rows={Object.entries(o).map(([k, v]) => [k, `${r2(v)}%`])} /></div>)}</div>
      <div className="start-block"><h3>🧮 Check yourself</h3>{!r ? <RoundsRunner rounds={CAP_R} doneLabel="Done" onDone={setR} /> : <p className="g91-note pos">✅ {r.firstTry}/3 on the first try.</p>}</div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={sum !== 100 || !r} onClick={() => finish(22 + r.firstTry * 3, { split, seed, pool, seriesA, final: s3 })}>Save our cap table <span className="coin-tag"><Coins size={15} /> +{22 + (r?.firstTry || 0) * 3}</span></button></div>
    </ActShell>
  );
}

/* ---------- C5 · Deal Negotiator (tiburones con personalidad) ---------- */
const SHARKS = [
  { k: "maria", e: "🦈", n: "María 'The Numbers'", d: "Loves margins. Hates high valuations.", f: 0.75, likes: "equity" },
  { k: "tomas", e: "🐋", n: "Tomás 'Royalty King'", d: "Wants his money back fast.", f: 0.95, likes: "royalty" },
  { k: "lucia", e: "🐬", n: "Lucía 'Smart Money'", d: "Brings supermarkets — asks for more %.", f: 0.85, likes: "distribution" },
];
function DealNegotiator({ resp, existing, onSave, onExit }) {
  const v = resp?.c4_val; const ask = v?.ask || 300000; const pct = v?.pct || 15; const walk = v?.walk || 25; const fair = v ? (v.lo + v.hi) / 2 : ask / (pct / 100);
  const [sk, setSk] = useState(null);
  const [round, setRound] = useState(0);
  const [offer, setOffer] = useState(null);
  const [mine, setMine] = useState({ money: ask, pct });
  const [deal, setDeal] = useState(null);
  const [msg, setMsg] = useState("");
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const S = SHARKS.find((x) => x.k === sk);
  const minVal = ask / (walk / 100);
  const sharkOffer = (s, r) => { const val = fair * s.f * (1 + r * 0.06); const p = Math.min(60, Math.round(((ask / val) * 100))); return { money: ask, pct: p, extra: s.likes === "royalty" ? `+ $300 per unit until she recovers ${cop(ask)}` : s.likes === "distribution" ? "+ intro to 3 supermarket chains" : "" }; };
  const start = (k) => { setSk(k); setRound(0); setOffer(sharkOffer(SHARKS.find((x) => x.k === k), 0)); setDeal(null); setMsg(""); setMine({ money: ask, pct }); };
  const counter = () => { const val = mine.money / (mine.pct / 100); const sharkMax = fair * S.f * 1.25; if (val <= sharkMax) { setDeal({ ...mine, shark: S.n, extra: offer.extra, accepted: "shark" }); return; } if (round >= 2) { setDeal({ none: true, shark: S.n }); return; } setMsg(`❌ ${S.n} says no: your counter values the company at ${cop(val)} — too expensive for this shark. Look at the new offer below. Tip: give a bit more % or ask for a bit less money (but never above your walk-away of ${walk}%).`); setRound(round + 1); setOffer(sharkOffer(S, round + 1)); };
  const G = [W_PAST, W_NUMBERS(2), W_TOPIC("Use 2 deal words", ["valuation", "offer", "counter", "equity", "royalty", "walk-away", "%"], 2, "offer · counter · valuation")];
  const ok = deal && goalsOk(text, 30, 80, G);
  const score = deal && !deal.none ? (deal.pct <= walk ? 1 : 0) : 0;
  if (st.done) return <Reward title={deal?.none ? "No deal — and that's OK 🤝" : `Deal with ${deal.shark}! 🤝`} subtitle={deal?.none ? "Walking away is also a decision." : `${cop(deal.money)} for ${deal.pct}%`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Handshake size={22} strokeWidth={2.1} />} title="Deal Negotiator 🤝" subtitle={`Your ask: ${cop(ask)} for ${pct}%. Your walk-away: ${walk}%. Three sharks, three personalities, max 3 rounds.`} onExit={onExit}>
      <Brief91 k="c5_nego" /><Guide11 {...GD_NEGO} />
      {!v && <div className="p1-banner"><span>💡 Save your Valuation Machine first to negotiate with YOUR ask. Now you use a sample ask.</span></div>}
      {!sk ? <div className="g10-ab four">{SHARKS.map((s) => <button key={s.k} type="button" onClick={() => start(s.k)}><em>{s.e}</em><b>{s.n}</b><span>{s.d}</span></button>)}</div> : (
        <div className="start-block g10-event">
          <div className="g10-event-head"><em>{S.e}</em><div><b>{S.n} · round {round + 1}/3</b><p>“I'll give you {cop(offer.money)} for {offer.pct}% of your company{offer.extra ? ` ${offer.extra}` : ""}.” (implied {cop(offer.money / (offer.pct / 100))})</p></div></div>
          {!deal ? (
            <>
              <div className="g10-two"><Ctl l="My counter: money" v={mine.money} set={(x) => setMine({ ...mine, money: x })} mn={50000} mx={2000000} stp={10000} fmt={cop} /><Ctl l="My counter: %" v={mine.pct} set={(x) => setMine({ ...mine, pct: x })} mn={5} mx={60} fmt={(x) => `${x}%`} /></div>
              {msg && <div className="p1-banner bad"><span>{msg}</span></div>}
              <MiniTable head={["", "Money", "%", "Valuation (money ÷ %)"]} rows={[[`${S.e} Shark's offer`, cop(offer.money), `${offer.pct}%`, cop(offer.money / (offer.pct / 100))], ["🔁 My counter", cop(mine.money), `${mine.pct}%`, cop(mine.money / (mine.pct / 100))], ["🚪 My limit (walk-away)", cop(ask), `${walk}%`, cop(minVal)]]} />
              <p className="start-tip">💡 <b>My counter</b> = the deal YOU propose. Move the money and the % you would give. The shark says yes if your valuation is close to what HE thinks the company is worth. {mine.pct > walk ? "⚠️ Your counter gives more than your walk-away %!" : ""}</p>
              <div className="p3-card-actions"><button className="s1-btn primary" onClick={() => setDeal({ ...offer, shark: S.n, accepted: "me" })}>Accept the shark's offer</button><button className="s1-btn ghost" onClick={counter}>Send my counter</button><button className="s1-btn ghost" onClick={() => setDeal({ none: true, shark: S.n })}>Walk away</button></div>
            </>
          ) : <div className={`p1-banner ${deal.none ? "" : deal.pct <= walk ? "good" : "bad"}`}><span>{deal.none ? `No deal with ${deal.shark}.` : `DEAL: ${cop(deal.money)} for ${deal.pct}% ${deal.extra || ""}. ${deal.pct <= walk ? "✅ Inside your walk-away point." : "⚠️ You gave more than your walk-away %!"}`}</span></div>}
          {deal && <button type="button" className="p1-link" onClick={() => { setSk(null); setDeal(null); }}><RefreshCw size={14} /> Try another shark</button>}
        </div>
      )}
      {deal && <div className="start-block"><h3>✍️ Negotiation report</h3><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="María offered $300,000 for 30%. We countered with 20% because our valuation… In the end…" /></div>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(26 + score * 6, { deal, text, walk })}>Save our negotiation <span className="coin-tag"><Coins size={15} /> +{26 + score * 6}</span></button></div>
    </ActShell>
  );
}

/* ---------- C6 · Stress Test ---------- */
const PLANB = [
  { k: "recipe", e: "🧪", l: "Cheaper recipe / supplier", cost: -0.12, sales: -0.03 }, { k: "price", e: "🏷️", l: "Raise the price 10%", price: 0.1, sales: -0.08 },
  { k: "channel", e: "🏪", l: "New channel (store or orders)", sales: 0.15, fixed: 30000 }, { k: "combo", e: "➕", l: "Combo to raise the ticket", price: 0.06, sales: 0.02 },
  { k: "cutmk", e: "✂️", l: "Cut marketing 50%", opex: -0.25, sales: -0.06 }, { k: "batch", e: "🏭", l: "Bigger batches (less cost per unit)", cost: -0.06, fixed: 20000 },
];
function StressTest({ resp, existing, onSave, onExit }) {
  const pl = plOf(resp);
  const [s, setS] = useState(existing?.s || { sales: -30, cost: 20, comp: false });
  const [plan, setPlan] = useState(existing?.plan || []);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const calc = (withPlan) => {
    let units = pl.units * (1 + s.sales / 100) * (s.comp ? 0.85 : 1); let price = pl.price; let unit = pl.unit * (1 + s.cost / 100); let opex = pl.opex; let extra = 0;
    if (withPlan) plan.forEach((k) => { const p = PLANB.find((x) => x.k === k); units *= 1 + (p.sales || 0); price *= 1 + (p.price || 0); unit *= 1 + (p.cost || 0); opex *= 1 + (p.opex || 0); extra += (p.fixed || 0) / 12; });
    const net = units * (price - unit) - opex - extra; return { units: Math.round(units), price, unit, net };
  };
  const base = { units: pl.units, net: pl.net }; const crisis = calc(false); const saved = calc(true);
  const G = [W_TOPIC("Use 2 words of the topic", ["sales", "cost", "plan b", "profit", "margin", "competitor", "price"], 2, "sales · cost · Plan B"), W_NUMBERS(2), { l: "If… will…", ex: "If sales fall, we will…", re: /\bif\b[^.]*\b(will|would|'ll)\b/i }];
  const ok = plan.length >= 1 && plan.length <= 3 && goalsOk(text, 30, 80, G);
  if (st.done) return <Reward title="Stress-tested! ⚠️" subtitle={`Crisis ${cop(crisis.net)} → with Plan B ${cop(saved.net)}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<AlertTriangle size={22} strokeWidth={2.1} />} title="Stress Test ⚠️ · Our company under pressure" subtitle="Break your own numbers before reality does — then design a Plan B (max 3 actions)." onExit={onExit}>
      <Brief91 k="c6_stress" /><Guide11 {...GD_STRESS} />
      <div className="g10-two">
        <div className="start-block"><h3>🌪️ The crisis</h3><Ctl l="Sales change" v={s.sales} set={(x) => setS({ ...s, sales: x })} mn={-60} mx={0} stp={5} fmt={(x) => `${x}%`} /><Ctl l="Ingredient cost change" v={s.cost} set={(x) => setS({ ...s, cost: x })} mn={0} mx={60} stp={5} fmt={(x) => `+${x}%`} /><label className="g11-toggle"><input type="checkbox" checked={s.comp} onChange={(e) => setS({ ...s, comp: e.target.checked })} /> 🥊 A competitor opens next to us (−15% sales)</label></div>
        <div className="start-block"><h3>🛟 Plan B (max 3)</h3><div className="g10-qpick">{PLANB.map((p) => { const on = plan.includes(p.k); return <button key={p.k} type="button" className={on ? "on" : ""} onClick={() => setPlan(on ? plan.filter((x) => x !== p.k) : plan.length < 3 ? [...plan, p.k] : plan)}>{p.e} {p.l}</button>; })}</div></div>
      </div>
      <MiniTable head={["Scenario", "Units / month", "Net income / month"]} rows={[["📒 Normal (our P&L)", base.units, cop(base.net)], ["🌪️ Crisis", crisis.units, cop(crisis.net)], ["🛟 Crisis + Plan B", saved.units, cop(saved.net)]]} />
      <ChartCard title="Net income per month"><BarChart bars={[{ label: "Normal", value: Math.max(0, base.net), color: "#3c9d5d" }, { label: "Crisis", value: Math.max(0, crisis.net), color: "#c8563a" }, { label: "Plan B", value: Math.max(0, saved.net), color: "#e0a03a" }]} /></ChartCard>
      {crisis.net < 0 && <p className="g91-note neg">In the crisis you LOSE {cop(-crisis.net)} a month.{saved.net >= 0 ? " Your Plan B brings you back to profit ✅" : " Your Plan B is not enough yet."}</p>}
      <div className="start-block"><h3>✍️ Our Plan B</h3><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="If sales fall 30% and costs rise 20%, we will… Our profit would go from… to…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30 + (saved.net >= 0 ? 4 : 0), { s, plan, crisis: Math.round(crisis.net), saved: Math.round(saved.net), text })}>Save our Plan B <span className="coin-tag"><Coins size={15} /> +{30 + (saved.net >= 0 ? 4 : 0)}</span></button></div>
    </ActShell>
  );
}
const CEO_STATS = [{ k: "cash", l: "Cash", e: "💧", start: 60 }, { k: "rep", l: "Reputation", e: "⭐", start: 60 }, { k: "team", l: "Team", e: "🧑‍🤝‍🧑", start: 60 }];
const CEO_R = [
  { e: "🍓", title: "Supplier shock", text: "The price of strawberries doubles this month.", options: [{ t: "Switch to a seasonal fruit and tell customers why", fx: { cash: 5, rep: 5 }, good: true, note: "Flexible recipe + honesty." }, { t: "Raise the price 40% without explaining", fx: { cash: 5, rep: -15 }, note: "Customers feel cheated." }, { t: "Keep everything the same and lose money", fx: { cash: -20 }, note: "Your margin disappears." }] },
  { e: "📱", title: "A viral complaint", text: "A customer posts a photo: 'I found a hair in my gelatin.'", options: [{ t: "Apologize publicly, refund and show your new hygiene steps", fx: { rep: 10, cash: -5 }, good: true, note: "Fast honesty rebuilds trust." }, { t: "Delete the comment", fx: { rep: -25 }, note: "Hiding makes it worse." }, { t: "Say it's fake", fx: { rep: -20, team: -5 }, note: "Attacking customers never works." }] },
  { e: "🧑‍🍳", title: "A founder quits", text: "Your Maker leaves the team in the busiest week.", options: [{ t: "Redistribute tasks and document the recipe", fx: { team: 10 }, good: true, note: "Processes protect companies." }, { t: "Stop production for a month", fx: { cash: -20, rep: -10 }, note: "Customers go to competitors." }, { t: "Blame the person on social media", fx: { team: -20, rep: -10 }, note: "Toxic." }] },
  { e: "🥊", title: "A copycat", text: "Another team copies your product and sells it 30% cheaper.", options: [{ t: "Compete on value: better quality, brand and service", fx: { rep: 10, cash: 5 }, good: true, note: "Differentiation beats price wars." }, { t: "Cut your price 40%", fx: { cash: -20 }, note: "A price war kills margins." }, { t: "Copy their packaging", fx: { rep: -15 }, note: "You lose identity." }] },
  { e: "🏪", title: "A big order", text: "A café wants 200 units a week, paying in 45 days.", options: [{ t: "Accept with a deposit and a trial week", fx: { cash: 10, rep: 5 }, good: true, note: "Growth with protected cash." }, { t: "Accept everything immediately", fx: { cash: -15, team: -10 }, note: "Cash and team exhausted." }, { t: "Reject: too risky", fx: { cash: -2 }, note: "Safe, but you miss growth." }] },
  { e: "🧾", title: "Health inspection", text: "The school asks for food-handling documents tomorrow.", options: [{ t: "Show your hygiene checklist and labels", fx: { rep: 10 }, good: true, note: "Being prepared is professional." }, { t: "Hide the products for a week", fx: { cash: -10, rep: -5 }, note: "You lose sales and trust." }, { t: "Ignore it", fx: { rep: -20 }, note: "Risky and irresponsible." }] },
];

/* ---------- C6 · Impact canvas (ODS 8 y 12) ---------- */
const IMPACT_KPIS = [["jobs", "🧑‍🍳", "Paid hours for young people", "hours / month"], ["local", "🌽", "% of ingredients from local suppliers", "%"], ["waste", "♻️", "Units wasted per week", "units"], ["pack", "📦", "% compostable / reusable packaging", "%"], ["price", "🤝", "Units sold at a social price", "units / month"], ["learn", "📚", "Students who learned with us", "people"]];
function ImpactCanvas({ existing, onSave, onExit }) {
  const [sel, setSel] = useState(existing?.sel || {});
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const chosen = IMPACT_KPIS.filter(([k]) => sel[k]);
  const ok = chosen.length >= 2 && chosen.every(([k]) => num(sel[k].now) >= 0 && num(sel[k].goal) > 0 && sel[k].now !== "") && goalsOk(text, 30, 80, [W_FUTURE, W_NUMBERS(2), W_TOPIC("Use 2 impact words", ["impact", "community", "waste", "local", "jobs", "sustainable", "sdg"], 2)]);
  if (st.done) return <Reward title="Impact measured! 🌱" subtitle={`${chosen.length} impact KPIs`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Sprout size={22} strokeWidth={2.1} />} title="Impact Canvas 🌱 · SDG 8 & 12" subtitle="Sharks ask about money. Communities ask about impact. Measure both." onExit={onExit}>
      <Brief91 k="c6_impact" /><Guide11 {...GD_IMPACT} />
      <div className="g11-kpis-pick">{IMPACT_KPIS.map(([k, e, l, u]) => { const on = !!sel[k]; return <div key={k} className={on ? "on" : ""}><button type="button" onClick={() => { const n = { ...sel }; if (on) delete n[k]; else n[k] = { now: "", goal: "" }; setSel(n); }}><em>{e}</em><b>{l}</b></button>{on && <div className="g11-inline"><label>Today<input className="start-input" type="number" value={sel[k].now} onChange={(ev) => setSel({ ...sel, [k]: { ...sel[k], now: ev.target.value } })} /></label><label>Goal in 6 months<input className="start-input" type="number" value={sel[k].goal} onChange={(ev) => setSel({ ...sel, [k]: { ...sel[k], goal: ev.target.value } })} /></label><small>{u}</small></div>}</div>; })}</div>
      <div className="start-block"><h3>✍️ Our impact promise</h3><WordField value={text} onChange={setText} min={30} max={80} goals={[W_FUTURE, W_NUMBERS(2), W_TOPIC("Use 2 impact words", ["impact", "community", "waste", "local", "jobs", "sustainable", "sdg"], 2)]} placeholder="In 6 months we will reduce waste from 8 to 2 units a week and buy 60% local fruit, so our community…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(26, { sel, text })}>Save our impact <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
    </ActShell>
  );
}

/* ---------- C7 · Pitch Deck Builder ---------- */
function DeckBuilder({ resp, existing, onSave, onExit }) {
  const r1 = P1of(resp); const co = co11(r1); const pl = plOf(resp); const v = resp?.c4_val;
  const auto = [
    { k: "cover", e: "🚀", t: co.brand || "Our company", s: co.tagline || "Tagline" },
    { k: "problem", e: "🎯", t: "The problem", s: r1.c1_hunter?.statement || "Who suffers, when and why." },
    { k: "solution", e: "🧪", t: "Our solution", s: co.product || "Our product" },
    { k: "customer", e: "👤", t: "Our customer", s: r1.c2_persona?.name ? `${r1.c2_persona.name} · spends ${cop(r1.c2_persona.budget)}` : "Persona" },
    { k: "traction", e: "🧾", t: "Traction", s: r1.c8_audit ? `${r1.c8_audit.real} real pre-orders` : "Pre-orders / sales" },
    { k: "model", e: "🧮", t: "Business model", s: `Price ${cop(pl.price)} · unit cost ${cop(pl.unit)} · margin ${pl.price ? Math.round(((pl.price - pl.unit) / pl.price) * 100) : 0}%` },
    { k: "pl", e: "📒", t: "Our numbers", s: `Revenue ${cop(pl.rev)}/month · net ${cop(pl.net)}` },
    { k: "risk", e: "⚠️", t: "Risks & Plan B", s: resp?.c6_stress ? `Crisis ${cop(resp.c6_stress.crisis)} → Plan B ${cop(resp.c6_stress.saved)}` : "Stress test" },
    { k: "impact", e: "🌱", t: "Impact", s: resp?.c6_impact ? "SDG 8 & 12 goals" : "Impact KPIs" },
    { k: "ask", e: "🦈", t: "The ask", s: v ? `${cop(v.ask)} for ${v.pct}% (valuation ${cop(v.implied)})` : "$ for %" },
  ];
  const [h, setH] = useState(existing?.heads || Object.fromEntries(auto.map((x) => [x.k, x.t])));
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const [st, finish] = useFinish(onSave);
  const okHead = (t) => countWords(t) >= 2 && countWords(t) <= 12;
  const ok = auto.every((x) => okHead(h[x.k]));
  const Slide = ({ x }) => <div className="g11-slide"><em>{x.e}</em><h2>{h[x.k]}</h2><p>{x.s}</p><small>{co.brand} · {auto.indexOf(x) + 1}/10</small></div>;
  if (st.done) return <Reward title="Deck ready! 🗂️" subtitle="10 slides, one story." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Layers size={22} strokeWidth={2.1} />} title="Pitch Deck Builder 🗂️" subtitle="10 slides built from your data. Write a headline (2–12 words) that SAYS the message of each slide." onExit={onExit}>
      <Brief91 k="c7_deck" /><Guide11 {...GD_DECK} />
      <div className="g11-deck"><div className="g11-deck-list">{auto.map((x, k) => <button key={x.k} type="button" className={`${k === i ? "on" : ""} ${okHead(h[x.k]) ? "ok" : ""}`} onClick={() => setI(k)}>{x.e} {k + 1}</button>)}</div>
        <div><Slide x={auto[i]} /><input className="start-input" value={h[auto[i].k]} onChange={(e) => setH({ ...h, [auto[i].k]: e.target.value })} placeholder="Headline with the message" /><p className="start-tip">💡 Not “Our numbers” — say “Every gelatin leaves us $1,500”.</p>
          <div className="p3-card-actions"><button className="s1-btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}><ChevronLeft size={16} /> Back</button><button className="s1-btn ghost" disabled={i === auto.length - 1} onClick={() => setI(i + 1)}>Next <ChevronRight size={16} /></button><button className="s1-btn primary" onClick={() => setShow(true)}><Mic size={16} /> Present</button></div></div></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30, { heads: h })}>{ok ? "Save our deck" : `Write the 10 headlines (${auto.filter((x) => okHead(h[x.k])).length}/10)`} <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
      {show && <PresentOverlay slides={auto.map((x) => <Slide key={x.k} x={x} />)} onClose={() => setShow(false)} />}
    </ActShell>
  );
}

/* ---------- C7 · Shark Q&A Trainer (60 s por pregunta) ---------- */
const SHARK_QS = [
  { q: "Why would anyone pay that price?", w: ["price", "value", "customer", "competitor", "benefit"] }, { q: "What happens if a big company copies you?", w: ["brand", "customer", "different", "quality", "relationship"] },
  { q: "How did you calculate your valuation?", w: ["valuation", "multiple", "revenue", "profit", "dcf"] }, { q: "What will you do with my money?", w: ["equipment", "batch", "marketing", "%", "sales"] },
  { q: "What is your margin per unit?", w: ["cost", "price", "margin", "unit", "%"] }, { q: "How many units must you sell to break even?", w: ["break-even", "fixed", "units", "contribution", "month"] },
  { q: "What's your biggest risk?", w: ["risk", "plan b", "cost", "competitor", "if"] }, { q: "Why is your team the right team?", w: ["team", "role", "we", "learned", "experience"] },
];
function SharkQA({ existing, onSave, onExit }) {
  const [qs] = useState(() => shuffleArr(SHARK_QS).slice(0, 5));
  const [i, setI] = useState(0);
  const [ans, setAns] = useState({});
  const [run, setRun] = useState(false);
  const [left, reset] = useCountdown(60, run);
  const [st, finish] = useFinish(onSave);
  const q = qs[Math.min(i, 4)]; const t = ans[i] || "";
  const hits = (k) => qs[k].w.filter((w) => (ans[k] || "").toLowerCase().includes(w)).length;
  const okA = (k) => countWords(ans[k]) >= 15 && hits(k) >= 2 && /\d/.test(ans[k] || "");
  useEffect(() => { if (left === 0) setRun(false); }, [left]);
  const done = i >= 5; const good = qs.filter((_, k) => okA(k)).length;
  if (st.done) return <Reward title="Shark-proof! 🦈" subtitle={`${good}/5 strong answers`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<MessageIcon />} title="Shark Q&A Trainer 🦈" subtitle="5 hard questions, 60 seconds each. Strong = 15+ words, 2 topic words and a number." onExit={onExit}>
      <Brief91 k="c7_qa" /><Guide11 {...GD_QA} />
      {!done ? (
        <div className="start-block g10-boss">
          <div className="p1-match-stats"><span>Question <b>{i + 1}/5</b></span><span className={`g10-timer ${left <= 10 ? "low" : ""}`}>⏱️ {left}s</span></div>
          <p className="quiz-q">🦈 “{q.q}”</p>
          {!run && left === 60 ? <button className="s1-btn primary big" onClick={() => setRun(true)}>Start the clock</button> : <>
            <textarea className="start-input" rows={4} value={t} disabled={left === 0} onChange={(e) => setAns({ ...ans, [i]: e.target.value })} placeholder="Answer like a founder: numbers + reasons…" />
            <div className="g11-rules"><span className={countWords(t) >= 15 ? "on" : ""}>15+ words ({countWords(t)})</span><span className={hits(i) >= 2 ? "on" : ""}>Topic words: {q.w.join(" · ")}</span><span className={/\d/.test(t) ? "on" : ""}>A number</span></div>
            <div className="start-foot"><button className="s1-btn primary big" onClick={() => { setI(i + 1); setRun(false); reset(); }}>{okA(i) ? "Strong! Next" : "Next question"} <ChevronRight size={18} /></button></div></>}
        </div>
      ) : (
        <>
          <MiniTable head={["Question", "Your answer", "Strong?"]} rows={qs.map((x, k) => [x.q, (ans[k] || "—").slice(0, 80), okA(k) ? "✅" : "🔁"])} />
          <div className="start-foot"><button className="s1-btn ghost" onClick={() => { setI(0); setAns({}); setRun(false); reset(); }}><RefreshCw size={15} /> Train again</button><button className="s1-btn primary big" onClick={() => finish(14 + good * 4, { good, answers: qs.map((x, k) => ({ q: x.q, a: ans[k] || "" })) })}>Save my training <span className="coin-tag"><Coins size={15} /> +{14 + good * 4}</span></button></div>
        </>
      )}
    </ActShell>
  );
}
function MessageIcon() { return <Mic size={22} strokeWidth={2.1} />; }

/* ---------- C7 · Know your numbers (rondas con TUS números) ---------- */
function KnowNumbers({ resp, onSave, onExit }) {
  const pl = plOf(resp); const v = resp?.c4_val; const r1 = P1of(resp);
  const ask = v?.ask || 300000; const pct = v?.pct || 15; const fixed = num(r1.c6_break?.fixed) || 180000; const cm = pl.price - pl.unit;
  const rounds = [
    { tag: "Margin", q: `Price ${cop(pl.price)}, unit cost ${cop(pl.unit)}. Margin per unit ($)?`, answer: cm, money: true, hint: "price − unit cost", visual: F11("Margin per unit = price − unit cost", [`${cop(pl.price)} − ${cop(pl.unit)} = ?`]), explain: `${cop(cm)} per unit.` },
    { tag: "Margin %", q: "That margin as a % of the price? (no decimals)", answer: Math.round((cm / pl.price) * 100), unit: "%", tol: 1, hint: "margin ÷ price × 100", visual: F11("Margin % = margin per unit ÷ price × 100", [`${cop(cm)} ÷ ${cop(pl.price)} × 100 = ?`]), explain: `${Math.round((cm / pl.price) * 100)}%.` },
    { tag: "Break-even", q: `Fixed costs ${cop(fixed)}. Break-even units?`, answer: Math.ceil(fixed / Math.max(1, cm)), unit: "units", tol: 1, hint: "fixed ÷ margin per unit", visual: F11("Break-even units = fixed costs ÷ margin per unit (round UP)", [`${cop(fixed)} ÷ ${cop(cm)} = ?`]), explain: `${Math.ceil(fixed / Math.max(1, cm))} units.` },
    { tag: "Valuation", q: `Your ask: ${cop(ask)} for ${pct}%. Implied valuation?`, answer: Math.round(ask / (pct / 100)), money: true, tol: 1000, hint: "money ÷ %", visual: F11("Implied valuation = money ÷ % (decimal)", [`${cop(ask)} ÷ ${pct / 100} = ?`]), explain: `${cop(ask / (pct / 100))}.` },
    { tag: "Year", q: `Monthly net income ${cop(pl.net)}. Net income in a year?`, answer: pl.net * 12, money: true, tol: 12, hint: "× 12", visual: F11("Year = month × 12", [`${cop(pl.net)} × 12 = ?`]), explain: `${cop(pl.net * 12)}.` },
    { tag: "Shark", q: `If a shark owns ${pct}%, how much of a year's profit is hers?`, answer: Math.round(pl.net * 12 * (pct / 100)), money: true, tol: 500, hint: `year profit × ${pct / 100}`, visual: F11("Investor's share = yearly profit × investor %", [`${cop(pl.net * 12)} × ${pct / 100} = ?`]), explain: `${cop(pl.net * 12 * (pct / 100))}.` },
  ];
  return <NumberRounds icon={<Calculator size={22} strokeWidth={2.1} />} title="Know Your Numbers 🧮" subtitle="Sharks test founders with THEIR own numbers. No calculator panic!" intro={<><Brief91 k="c7_numbers" /><Guide11 {...GD_NUM} open={false} /></>} rounds={rounds} coinsPer={4} bonus={8} doneTitle="Numbers ninja! 🧮" onSave={onSave} onExit={onExit} />;
}

/* ---------- C8 · Shark Tank Pitch ---------- */
const RUB_P2 = [["nums", "Numbers are correct & clear", "P&L, margin, break-even"], ["val", "Valuation defended", "3 methods, a range, an ask"], ["cash", "Cash & funding plan", "survives month by month"], ["risk", "Risks & Plan B", "stress test, impact"], ["eng", "Confident English", "answers sharks' questions"]];
function SharkPitch({ resp, studentName, userData, API_URL, existing, onSave, onExit }) {
  const r = resp || {}; const r1 = P1of(r); const co = co11(r1); const pl = plOf(r); const v = r.c4_val;
  const ev = [
    { k: "pl", e: "📒", t: "Built an honest P&L", ok: !!r.c1_pl, d: r.c1_pl ? `Revenue ${cop(r.c1_pl.rev)} · net ${cop(r.c1_pl.net)} (${r.c1_pl.nm}%)` : "P&L pending", fix: "Class 1: P&L Builder.", cert: `built an honest P&L (net margin ${r.c1_pl?.nm ?? 0}%)` },
    { k: "cash", e: "💧", t: "Survived the cash test", ok: !!r.c2_plan && !!r.c2_cash, d: r.c2_plan ? `Month 3 cash ${cop(r.c2_plan.end?.[2])} · survival ${r.c2_cash?.broke ? "with negative months" : "never below zero"}` : "Cash plan pending", fix: "Class 2: Cash Survival + Cash Plan.", cert: "planned cash month by month" },
    { k: "fund", e: "🏦", t: "Designed the funding", ok: !!r.c3_lab, d: r.c3_lab ? `${cop(r.c3_lab.total)} raised · control ${r.c3_lab.control}%` : "Funding Lab pending", fix: "Class 3: Funding Lab.", cert: `designed a ${cop(r.c3_lab?.total || 0)} funding plan` },
    { k: "val", e: "💎", t: "Valued the company", ok: !!v, d: v ? `Range ${cop(v.lo)}–${cop(v.hi)} · ask ${cop(v.ask)} for ${v.pct}%` : "Valuation pending", fix: "Class 4: Valuation Machine.", cert: `valued the company at ${cop(v?.implied || 0)}` },
    { k: "deal", e: "🤝", t: "Negotiated a deal", ok: !!r.c5_nego, d: r.c5_nego?.deal ? (r.c5_nego.deal.none ? "Walked away (inside the plan)" : `${cop(r.c5_nego.deal.money)} for ${r.c5_nego.deal.pct}%`) : "Negotiation pending", fix: "Class 5: Deal Negotiator.", cert: "negotiated with investors" },
    { k: "risk", e: "⚠️", t: "Stress-tested the company", ok: !!r.c6_stress, d: r.c6_stress ? `Crisis ${cop(r.c6_stress.crisis)} → Plan B ${cop(r.c6_stress.saved)}` : "Stress test pending", fix: "Class 6: Stress Test.", cert: "stress-tested the company with a Plan B" },
  ];
  const got = ev.filter((x) => x.ok);
  const QA = [
    { k: "q1", e: "💎", q: `“${v ? `${cop(v.ask)} for ${v.pct}% means ${cop(v.implied)}` : "Your valuation"}. Why is your company worth that?”`, goals: [W_NUMBERS(2), W_TOPIC("Use 2 words", ["valuation", "multiple", "revenue", "profit", "growth", "risk"], 2)], ph: "Our revenue is… and with a multiple of… our range is…" },
    { k: "q2", e: "💧", q: "“How do you make sure you won't run out of cash?”", goals: [W_TOPIC("Use 2 words", ["cash", "deposit", "month", "plan", "reserve", "loan"], 2), W_REASON], ph: "We ask for deposits and our cash plan shows that in month 3…" },
    { k: "q3", e: "⚠️", q: "“Sales fall 30% tomorrow. What exactly do you do?”", goals: [{ l: "If… will…", ex: "If…, we will…", re: /\bif\b[^.]*\b(will|would|'ll)\b/i }, W_NUMBERS(1)], ph: "If sales fall 30%, we will… because our stress test showed…" },
  ];
  const [qa, setQa] = useState(existing?.qa || {});
  const [stage, setStage] = useState(existing?.qa ? 1 : 0);
  const ready = !!r.c1_pl && !!v;
  if (stage === 0) return <QAStage title="Shark Tank 🦈 · Part 1 · Evidence & hard questions" intro="The sharks will test every number. Prove it first." evidence={ev} qa={qa} setQa={setQa} items={QA} ready={ready} readyMsg="You need your P&L (Class 1) and your valuation (Class 4)." onNext={() => setStage(1)} onExit={onExit} brief={<Brief91 k="c8_pitch" />} />;
  const heads = r.c7_deck?.heads || {};
  const chapters = (vv) => [
    { e: "🎯", t: heads.problem || "The problem", s: r1.c1_hunter ? [r1.c1_hunter.statement || r1.c1_hunter.problem] : [] },
    { e: "🧪", t: heads.solution || "Our solution", s: co.product ? [`${co.product} — ${co.tagline ? `“${co.tagline}”` : ""}`] : [] },
    { e: "🧾", t: heads.traction || "Traction", s: r1.c8_audit ? [`${r1.c8_audit.real} real pre-orders.`] : [] },
    { e: "📒", t: heads.pl || "Our numbers", s: [`Price ${cop(pl.price)}, unit cost ${cop(pl.unit)}; revenue ${cop(pl.rev)} a month and net income ${cop(pl.net)}.`] },
    { e: "💧", t: "Cash & funding", s: [r.c2_plan ? `Our cash plan never goes below zero: month 3 ends with ${cop(r.c2_plan.end?.[2])}.` : "", r.c3_lab ? `We fund ${cop(r.c3_lab.total)} and keep ${r.c3_lab.control}% control.` : ""].filter(Boolean) },
    { e: "⚠️", t: heads.risk || "Risks & Plan B", s: r.c6_stress ? [`In a crisis we would make ${cop(r.c6_stress.crisis)}; with Plan B, ${cop(r.c6_stress.saved)}.`] : [] },
    { e: "🦈", t: "Your questions, answered", s: QA.map((x) => `${x.e} ${dot(capF(qa[x.k] || ""))}`) },
    { e: "💎", t: heads.ask || "The ask", s: v ? [`We are asking for ${cop(v.ask)} for ${v.pct}% of ${co.brand || "our company"}.`, vv.use ? dot(capF(vv.use)) : ""].filter(Boolean) : [] },
  ];
  const publish = async (vv) => { try { const d = await fairPost(API_URL, userData, "11-ST", "fair_publish", { company: { name: co.brand || "Our company", logo: co.logo?.symbol || "🦈", lines: [co.product || "", v ? `Ask: ${cop(v.ask)} for ${v.pct}% (valuation ${cop(v.implied)})` : "", `Net margin ${pl.rev ? Math.round((pl.net / pl.rev) * 100) : 0}% · evidence ${got.length}/6`, vv.use || ""].filter(Boolean), nums: [{ l: "Valuation", v: v ? cop(v.implied) : "—" }, { l: "Net / month", v: cop(pl.net) }] } }); return d.status !== "error"; } catch (e) { return false; } };
  return (
    <PitchStudio icon={<Mic size={22} strokeWidth={2.1} />} title="Shark Tank 🦈 · Part 2 · Present" subtitle="Your team faces the sharks — every number with its calculation." brief={<div className="p3-card-actions"><button className="s1-btn ghost" onClick={() => setStage(0)}><ChevronLeft size={16} /> Edit answers</button></div>}
      how={<>Your script uses your deck headlines, P&L, cash plan, funding, stress test and answers. Write how you'll use the money, press <b>Present</b> (4 minutes as a team) and publish your company for the Shark Arena.</>}
      id="g11-shark" ready={ready} readyMsg="You need your P&L (Class 1) and your valuation (Class 4)."
      cover={{ tag: "SHARK TANK DAY · GRADE 11 · INSTITUTO CREAR", title: `${co.logo?.symbol || "🦈"} ${co.brand || "Our company"}`, sub: v ? `Asking ${cop(v.ask)} for ${v.pct}%` : "", say: `Hello, sharks. We are ${co.brand || "our team"}, and today we are asking for ${v ? cop(v.ask) : "an investment"}.`, end: (vv) => `${vv.close ? dot(capF(vv.close)) : "…"} Who's in?` }}
      kpis={[{ l: "📒 Net / month", v: cop(pl.net), c: pl.net >= 0 ? "pos" : "neg" }, { l: "💎 Valuation", v: v ? cop(v.implied) : "—" }, { l: "🦈 Ask", v: v ? `${cop(v.ask)} · ${v.pct}%` : "—" }, { l: "🔎 Evidence", v: `${got.length}/6` }]}
      chapters={chapters} inputs={[{ k: "use", l: "💸 What we'll do with the money:", ph: "We will buy a bigger freezer and produce 3 times more…", min: 10 }, { k: "close", l: "💡 Our closing line:", ph: "Small product, real numbers, a team that delivers…", min: 6 }]}
      rubric={RUB_P2} existing={existing} onPublish={publish} publishLabel="Publish our company for the Shark Arena"
      cert={{ e: "🦈", title: "Shark-Ready Founder", name: studentName, text: got.length ? `${joinAnd(got.map((x) => x.cert))}.` : "presented a company to investors." }}
      extraData={{ qa, evidence: got.map((x) => x.k), valuation: v?.implied }} coins={46 + got.length * 2} onSave={onSave} onExit={onExit} />
  );
}

/* ---------- C8 · Boss P2 ---------- */
const BOSS11_2_MISSIONS = [
  { tag: "Gross margin", q: "Revenue $800,000; cost of goods $440,000. Gross margin %?", answer: 45, unit: "%", tol: 0.5, hint: "(800 − 440) ÷ 800", explain: "45%." },
  { tag: "Cash", q: "Start $150,000 · in $300,000 · out $380,000. Ending cash?", answer: 70000, money: true, hint: "150 + 300 − 380 (thousands)", explain: "$70,000." },
  { tag: "Valuation", q: "$240,000 for 12%. Implied valuation?", answer: 2000000, money: true, hint: "240,000 ÷ 0.12", explain: "$2,000,000." },
  { tag: "Dilution", q: "You own 50%. An investor buys 20% (new shares). Your new %?", answer: 40, unit: "%", tol: 0.1, hint: "50 × 0.8", explain: "40%." },
  { tag: "Runway", q: "Cash $480,000, monthly burn $120,000. Months of runway?", answer: 4, unit: "months", hint: "480 ÷ 120", explain: "4 months." },
];
const BOSS11_2_Q = [
  { t: "P&L", q: "Which line shows what's left after ALL costs?", options: ["Revenue.", "Gross profit.", "Net income.", "Cost of goods sold."], correct: 2 },
  { t: "P&L", q: "Why did WeWork scare investors in 2019?", options: ["It had no revenue.", "It lost about $2 for every $1 it earned.", "It was too small to compete with big companies like Regus.", "Its founder sold all his shares to a big investor."], correct: 1 },
  { t: "Cash", q: "'Cash is king' means…", options: ["you can be profitable and still run out of cash.", "you should only accept cash payments.", "cash is better than investments.", "kings and governments control the whole economy."], correct: 0 },
  { t: "Cash", q: "Which action protects cash the most?", options: ["Buying a year of inventory.", "Accepting 90-day payments.", "Buying equipment before selling.", "Asking for deposits on big orders."], correct: 3 },
  { t: "Funding", q: "What is the main cost of an investor's money?", options: ["Monthly interest on the money, like a bank loan.", "A share of future profits and decisions.", "A platform fee for using the crowdfunding website.", "Nothing at all — it is a donation to the founders."], correct: 1 },
  { t: "Funding", q: "Crowdfunding backers usually receive…", options: ["shares of the company.", "monthly interest.", "the product or a reward.", "a seat on the board."], correct: 2 },
  { t: "Valuation", q: "Which method uses future profits brought to today's value?", options: ["Discounted cash flow.", "Revenue multiple.", "Royalty.", "Break-even."], correct: 0 },
  { t: "Valuation", q: "'Smart money' means an investor who…", options: ["asks for less percentage of the company.", "pays the money faster than the others.", "never asks difficult questions about the numbers.", "brings contacts, experience or distribution."], correct: 3 },
  { t: "Risk", q: "Why did Blockbuster and Kodak fail?", options: ["They had no money to invest in new technology.", "They protected today's business instead of preparing for tomorrow.", "Their products and stores were bad and old-fashioned.", "Governments closed them because of new digital laws for companies."], correct: 1 },
  { t: "Risk", q: "A stress test helps you…", options: ["predict the exact future.", "avoid paying taxes when the company makes a profit.", "prepare a Plan B before a crisis.", "increase your valuation automatically."], correct: 2 },
];
const BOSS11_2_TIPS = { "P&L": "Revenue − COGS = gross; − expenses = net.", Cash: "Profit ≠ cash. Timing matters.", Funding: "Debt costs interest; equity costs ownership.", Valuation: "Investment ÷ % = valuation.", Risk: "Test bad scenarios; prepare Plan B." };
function BossP2_11({ resp, studentName, onSave, onExit }) {
  const co = co11(P1of(resp)); const v = resp?.c4_val; const pl = plOf(resp);
  const card = <FMCardView id="g11-card2" card={FM_CARDS[1]} name={studentName} lines={[co.brand ? `Company: ${co.brand}` : "", v ? `Valuation ${cop(v.implied)}` : "", `Net ${cop(pl.net)} / month`, resp?.c5_nego?.deal && !resp.c5_nego.deal.none ? `Deal: ${cop(resp.c5_nego.deal.money)} for ${resp.c5_nego.deal.pct}%` : ""]} />;
  return <BossExam icon={<Swords size={22} strokeWidth={2.1} />} title="Boss P2 · Shark Tank ⚔️" subtitle="5 missions + 10 questions. 70% unlocks your Founder Card." brief={<Brief91 k="c8_boss" />} missions={BOSS11_2_MISSIONS} questions={BOSS11_2_Q} tips={BOSS11_2_TIPS} cardNode={card} onSave={onSave} onExit={onExit} />;
}
const CAN_P2 = [
  { t: "I can build and read a P&L.", ev: (r) => (r.c1_pl ? `Net ${cop(r.c1_pl.net)} · ${r.c1_pl.nm}% margin` : null) },
  { t: "I can plan cash month by month.", ev: (r) => (r.c2_plan ? `Month 3: ${cop(r.c2_plan.end?.[2])}` : null) },
  { t: "I can compare loans, investors and crowdfunding.", ev: (r) => (r.c3_lab ? `${cop(r.c3_lab.total)} · control ${r.c3_lab.control}%` : null) },
  { t: "I can value a company with 3 methods.", ev: (r) => (r.c4_val ? `${cop(r.c4_val.lo)}–${cop(r.c4_val.hi)}` : null) },
  { t: "I can read a cap table and negotiate a deal.", ev: (r) => (r.c5_nego ? (r.c5_nego.deal?.none ? "Walked away" : `${cop(r.c5_nego.deal?.money)} for ${r.c5_nego.deal?.pct}%`) : null) },
  { t: "I can stress-test a company and design a Plan B.", ev: (r) => (r.c6_stress ? `${cop(r.c6_stress.crisis)} → ${cop(r.c6_stress.saved)}` : null) },
  { t: "I can measure social impact (SDG 8 & 12).", ev: (r) => (r.c6_impact ? `${Object.keys(r.c6_impact.sel || {}).length} KPIs` : null) },
  { t: "I can pitch to investors in English.", ev: (r) => (r.c8_pitch ? `Jury ${r.c8_pitch.score}` : null) },
];

/* =====================================================================
   GUÍA DE CADA ACTIVIDAD · 11° PERIODO 2
   ===================================================================== */
const GD_R_CASH = { intro: "Six short problems about the difference between PROFIT and CASH. Each problem shows its formula — read it, put the numbers in and calculate.", items: [
  { e: "💧", t: "Cash this month", d: "Only the money that really ARRIVES or LEAVES this month. A sale paid in 60 days is profit now, cash later." },
  { e: "🧮", t: "Key formulas", ex: ["Deposit = order × deposit %", "Ending cash = start + IN − OUT", "Runway (months) = cash ÷ monthly burn"] },
] };
const GD_R_LOAN = { intro: "Every kind of money has a price. Use these formulas (they also appear under each problem). You can use the calculator.", items: [
  { e: "🏦", t: "Fixed loan payment", f: "Payment = P × r ÷ (1 − (1 + r)^−n)", ex: ["P = amount borrowed · r = monthly rate (2% = 0.02) · n = number of months", "Loan 100,000 at 2% for 3 months: 1.02^3 = 1.0612 → 1 ÷ 1.0612 = 0.9423", "Payment = 100,000 × 0.02 ÷ (1 − 0.9423) = 2,000 ÷ 0.0577 ≈ $34,675"] },
  { e: "💸", t: "Total interest", f: "Interest = payment × months − amount borrowed", ex: "3 × 34,675 − 100,000 = $4,025" },
  { e: "📅", t: "Monthly → yearly (E.A.)", f: "E.A. = (1 + monthly rate)^12 − 1", ex: "1% monthly → 1.01^12 − 1 = 12.7% E.A." },
  { e: "🦈", t: "Equity and crowdfunding", f: "Valuation = money ÷ %  ·  Received = raised × (1 − fee)", ex: ["$100,000 for 10% → 100,000 ÷ 0.10 = $1,000,000", "Raise $200,000 with a 5% fee → 200,000 × 0.95 = $190,000"] },
] };
const GD_R_OVER = { intro: "You are the shark. For each company: calculate the implied valuation, compare it with its real sales and profit, then decide.", items: [
  { e: "💎", t: "Implied valuation", f: "Valuation = money asked ÷ % offered", ex: "$80,000 for 20% → 80,000 ÷ 0.20 = $400,000" },
  { e: "📏", t: "Is it reasonable?", f: "Revenue multiple = valuation ÷ yearly revenue  ·  Earnings multiple = valuation ÷ yearly profit", ex: "Small food businesses: about 1–3× revenue or 3–8× profit. Much higher = overvalued." },
  { e: "👑", t: "Royalty", d: "Money per unit sold until the shark recovers her investment.", f: "Time = investment ÷ (royalty per unit × units per period)" },
] };
const GD_R_EQ = { intro: "Equity math: who owns how much, and how much that is worth. Each problem shows the formula.", items: [
  { e: "🥧", t: "Value of a slice", f: "Value = valuation × your %", ex: "20% of $1,000,000 = 1,000,000 × 0.20 = $200,000" },
  { e: "✂️", t: "Dilution", f: "New % = old % × (1 − % sold to the new investor)", ex: "You have 50%; an investor buys 20% → 50 × 0.80 = 40%" },
  { e: "👑", t: "Royalty time", f: "Months = money to recover ÷ (royalty per unit × units per month)", ex: "$100,000 ÷ (200 × 250) = 100,000 ÷ 50,000 = 2 months" },
  { e: "💰", t: "Profit share", f: "Investor's share = profit × investor's %", ex: "$500,000 × 0.10 = $50,000" },
] };
/* Guías de las Team Zones con los números del propio equipo */
const ZG = {
  c1_zone: (resp) => { const co = co11(resp?.__p1 || {}); return { intro: "Today you produce a REAL batch. Before buying, write the plan; after producing, compare what you planned with what you really spent and sold.", items: [
    { e: "📝", t: "1 · The plan", d: `Your Period 1 numbers: unit cost ${co.unit ? cop(co.unit) : "—"} · price ${co.price ? cop(co.price) : "—"}.`, f: "Budget = units planned × unit cost", ex: "40 gelatins × $1,500 = $60,000" },
    { e: "🧾", t: "2 · Planned vs. real", d: "One row per item you buy (4 or more): what you planned to pay and what you REALLY paid (keep the receipts!)." },
    { e: "🏭", t: "3 & 4 · Produced and sold", d: "Count the units that really came out (some break or fail) and the money you really collected." },
    { e: "🔍", t: "5 · Why real ≠ planned?", ex: "“Mango was $1,000 more expensive and 3 cups broke, so our real unit cost was $1,650, not $1,500.”" },
  ] }; },
  c3_zone: (resp) => { const m = resp?.c3_lab?.mix; return { intro: "Real founders write their money agreement BEFORE there are problems. Use your Funding Lab plan.", items: [
    { e: "🏦", t: "1 · Our plan in one sentence", d: m ? `Your Funding Lab: savings ${cop(m.save)} · family ${cop(m.family)} · loan ${cop(m.loan)} · investor ${cop(m.inv)} · crowdfunding ${cop(m.crowd)}.` : "Do the Funding Lab first to have your numbers.", ex: "“$200,000 savings + $250,000 loan + $150,000 crowdfunding = $600,000.”" },
    { e: "🤝", t: "2 · Each founder's contribution", d: "Money AND work count. Write what each person puts in.", ex: "Ana: $50,000 + recipes · Luis: $30,000 + Instagram · Sofía: $0 + sales and numbers" },
    { e: "🚪", t: "3 · If someone leaves…", d: "Decide now what happens with their % and their money (this is called vesting).", ex: "“If someone leaves before 3 months, they get their money back but keep only half of their %.”" },
    { e: "✍️", t: "4 · Sign", d: "Write the names of everyone who agrees." },
  ] }; },
  c5_zone: (resp) => { const v = resp?.c4_val; return { intro: "Agree as a team the numbers you will say on Shark Tank Day. They come from your Valuation Machine — copy them and make sure EVERYONE can explain them.", items: [
    { e: "💎", t: "1 · Final ask", d: v ? `Your Valuation Machine: ${cop(v.ask)} for ${v.pct}% → implied valuation ${cop(v.implied)}.` : "Do the Valuation Machine first to have your numbers.", f: "Implied valuation = money ÷ %", ex: "“$300,000 for 15% → 300,000 ÷ 0.15 = $2,000,000”" },
    { e: "🚪", t: "2 · Walk-away point", d: v ? `Your walk-away: ${v.walk}%. Write it as a number.` : "The MAX % you would give. Write only the number (e.g. 25).", ex: "If a shark asks for more than this %, you say no." },
    { e: "🎭", t: "3 · Who presents each part", d: "One row per founder: problem, product, numbers, ask, questions…" },
    { e: "😬", t: "4 · Questions we fear", ex: "“1) Why is it so expensive? → Because our unit cost is $1,500 and… 2) …”" },
  ] }; },
  c7_zone: () => ({ intro: "Pitch twice with a timer (goal: 4 minutes). After each run, another team gives you ONE thing to keep and ONE thing to fix.", items: [
    { e: "⏱️", t: "Rehearsals", d: "One row per run: number, time in minutes (e.g. 4.5) and the feedback you received.", ex: "Run 1 · 5.2 min · “Too fast in the numbers, say the valuation slower.”" },
    { e: "🛠️", t: "Three fixes", ex: "1) Cut the intro to 20 seconds. 2) Say the margin with an example. 3) Show the product in the first minute." },
    { e: "🍮", t: "Samples", d: "Real product ready for the sharks to taste, with labels." },
  ] }),
};
const ZONE_WIN = (c) => [["All goals done, each with evidence", "required"], ["Mission complete", `+${c} 🪙`]];
const GUIDE = {
  c1_read: B_READ("Learn from WeWork why revenue is not profit — and what investors look at first.", "Next: P&L Builder."),
  c1_pl: { goal: "Build one honest month of your company's income statement (P&L).", steps: ["Check units, price and cost of goods (from Period 1).", "List 4+ operating expenses — including your own pay.", "Read gross and net margin.", "Explain what your P&L says."], win: [["Saving your P&L", "+32 🪙"]], tip: "If the founders work for free, the business only LOOKS profitable." },
  c1_rush: B_RUSH("Classify 16 money movements: revenue, cost of goods, operating expense — or not in the P&L at all."),
  c1_zone: { goal: "TEAM ZONE: run a REAL production batch and compare planned vs. real costs.", steps: ["Plan the batch (units and budget).", "Buy and produce for real.", "Log planned vs. real cost of each item.", "Sell and record the money collected."], win: ZONE_WIN(30) },
  c2_read: B_READ("Understand why profitable companies can still die: cash flow.", "Next: Cash Flow Survival."),
  c2_cash: { goal: "Survive 12 months: six events test your CASH, not only your profit.", steps: ["Close each month.", "In event months, choose a decision.", "Watch the cash line — never below zero!", "Save your survival report."], win: [["Base", "+16 🪙"], ["Each smart decision", "+3 🪙"], ["Never below zero", "+4 🪙"]] },
  c2_rounds: { goal: "Six quick problems: cash vs. profit, deposits, runway.", steps: ["Read the box “Before you start”.", "In each problem, read the formula and the steps.", "Calculate and check.", "Read the explanation."], win: [["Each answer right on the first try", "+3 🪙"], ["Finishing", "+8 🪙"]] },
  c2_plan: { goal: "Build your company's 3-month cash plan. No month can end below zero.", steps: ["Write the starting cash.", "Add every inflow and outflow per month.", "Fix any negative month.", "Explain how you protect your cash."], win: [["Saving your cash plan", "+28 🪙"]] },
  c3_read: B_READ("Discover how Pebble raised US$10 million from customers — and the real cost of every type of money.", "Next: Funding Lab."),
  c3_lab: { goal: "Raise $600,000 with a mix of savings, family, loan, investor and crowdfunding — and know its real cost.", steps: ["Move each source.", "Check the loan payment vs. your monthly profit.", "Check how much control you keep.", "Explain your mix."], win: [["Saving your funding plan", "+32 🪙"]] },
  c3_loan: { goal: "Six problems: loan payments, interest, E.A., equity and crowdfunding fees.", steps: ["Read the formulas and the example in “Before you start”.", "In each problem, use the formula box (calculator allowed).", "Check your answer.", "Read the explanation."], win: [["Each answer right on the first try", "+3 🪙"], ["Finishing", "+8 🪙"]] },
  c3_zone: { goal: "TEAM ZONE: hold your funding meeting and agree the rules.", steps: ["Agree the funding plan.", "Write each founder's contribution.", "Agree what happens if someone leaves.", "Sign the agreement."], win: ZONE_WIN(24) },
  c4_video: B_VIDEO("Watch a real Shark Tank pitch: valuation, numbers and authenticity.", "Next: How Sharks Value a Company."),
  c4_read: B_READ("Learn the hidden number in every ask: the implied valuation — and three ways to estimate value.", "Next: Valuation Machine."),
  c4_val: { goal: "Value your company with 3 methods, choose an ask your numbers can defend and decide your walk-away point.", steps: ["Revenue multiple.", "Earnings multiple.", "Discounted cash flow.", "Choose money, % and walk-away; explain."], win: [["Saving your valuation", "+34 🪙"]] },
  c4_over: { goal: "Judge 4 pitches like a shark: calculate valuations and decide.", steps: ["Read “Before you start”: valuation and multiples.", "Calculate each implied valuation.", "Compare it with sales and profit.", "Choose deal, counter or no deal."], win: [["Each answer right on the first try", "+3 🪙"], ["Finishing", "+8 🪙"]] },
  c5_cap: { goal: "See who owns your company after a seed round, an employee pool and a Series A.", steps: ["Split the company among founders (100%).", "Move the three rounds.", "Read each cap table.", "Solve 3 checks."], win: [["Base", "+22 🪙"], ["Each check right on the first try", "+3 🪙"]] },
  c5_nego: { goal: "Negotiate with three sharks with different personalities. Respect your walk-away point.", steps: ["Read “Before you start”: offer, counter and walk-away.", "Choose a shark and read the offer table.", "Move your counter (money and %) and compare the valuations.", "Accept, counter (max 3 rounds) or walk away — then write your report."], win: [["Base", "+26 🪙"], ["Deal inside your walk-away", "+6 🪙"]] },
  c5_rounds: { goal: "Equity math: dilution, value of your slice, royalties.", steps: ["Read the 4 formulas in “Before you start”.", "In each problem, use the formula box.", "Check your answer and read the explanation."], win: [["Each answer right on the first try", "+3 🪙"], ["Finishing", "+8 🪙"]] },
  c5_zone: { goal: "TEAM ZONE: agree your final ask, your walk-away and who presents what.", steps: ["Agree the ask and walk-away.", "Assign pitch parts.", "Practice the 60-second version.", "Write 3 sharks' questions you fear."], win: ZONE_WIN(24) },
  c6_read: B_READ("Learn from Blockbuster and Kodak why giants fall — and what a stress test is.", "Next: Stress Test."),
  c6_stress: { goal: "Put your company under pressure and design a Plan B (max 3 actions).", steps: ["Move the crisis sliders.", "Choose up to 3 Plan B actions.", "Compare normal, crisis and Plan B.", "Write your plan with 'If…, we will…'."], win: [["Base", "+30 🪙"], ["Plan B back to profit", "+4 🪙"]] },
  c6_ceo: { goal: "Lead your company through 6 crises. Protect cash, reputation and team.", steps: ["Read each crisis.", "Decide (20 seconds!).", "Watch your 3 stats."], win: [["Base", "+20 🪙"], ["Each good decision", "+3 🪙"]] },
  c6_impact: { goal: "Measure your company's social and environmental impact (SDG 8 & 12).", steps: ["Choose 2+ impact KPIs.", "Write today's value and a 6-month goal.", "Write your impact promise."], win: [["Saving your impact", "+26 🪙"]] },
  c7_deck: { goal: "Build your 10-slide pitch deck from your data — with headlines that SAY the message.", steps: ["Check each slide's data.", "Write a 2–12 word headline for each.", "Present it to your team."], win: [["Saving your deck", "+30 🪙"]] },
  c7_qa: { goal: "Train for the sharks: 5 hard questions, 60 seconds each.", steps: ["Start the clock.", "Answer with 15+ words, topic words and a number.", "Train again if you want."], win: [["Base", "+14 🪙"], ["Each strong answer", "+4 🪙"]] },
  c7_numbers: { goal: "Know YOUR numbers by heart: margin, break-even, valuation, the shark's share.", steps: ["Solve 6 problems with your own data."], win: [["Each answer right on the first try", "+4 🪙"], ["Finishing", "+8 🪙"]] },
  c7_zone: { goal: "TEAM ZONE: rehearse the full Shark Tank pitch twice, with time and feedback.", steps: ["Rehearsal 1 with a timer.", "Feedback from another team.", "Rehearsal 2.", "Final fixes."], win: ZONE_WIN(26) },
  c8_pitch: { goal: "THE PERIOD 2 PROJECT: Shark Tank Day. Prove your evidence, answer the sharks and present.", steps: ["Check your evidence board.", "Answer 3 hard questions.", "Present as a team (4 minutes).", "Publish your company for the Shark Arena."], win: [["Evidence + answers + jury", "required"], ["Shark-Ready certificate", "+46 🪙"], ["Each evidence line", "+2 🪙"]] },
  c8_tank: { goal: "Shark Arena: you are the investor. Invest 100 coins in the companies with the best numbers.", steps: ["Open a company.", "Write the question you asked the founders.", "Choose a category and invest.", "Evaluate at least 2 companies."], win: [["Base", "+20 🪙"], ["Each company evaluated (up to 5)", "+4 🪙"]] },
  c8_boss: { goal: "Beat the Period 2 boss and unlock your second Founder Card.", steps: ["Part 1: 5 missions.", "Part 2: 10 questions.", "Read your feedback by topic."], win: [["70% or more", "Founder Card 🦈"], ["Each question right", "+4 🪙"], ["Each mission on the first try", "+4 🪙"]] },
  c8_can: { goal: "Look back: what can you do now with a company's finances?", steps: ["Read each 'I can' and your evidence.", "Rate yourself honestly.", "Write what you're proudest of."], win: [["Saving your recap", "+20 🪙"]] },
};

/* =====================================================================
   ESTRUCTURA · 11° PERIODO 2 · SHARK TANK (8 clases)
   ===================================================================== */
const G11P2_WEEKS = [
  { n: 1, title: "Our P&L", e: "📒", blurb: "Revenue is vanity, profit is sanity: the income statement of YOUR company.", skills: ["Reading", "P&L", "Rush", "Team Zone"], acts: [
    A11("c1_read", "Reading: The US$47 Billion Lesson 📰", "WeWork · 8 questions.", <Newspaper size={22} />, 42, "quizzes"),
    A11("c1_pl", "P&L Builder 📒", "One honest month.", <FileText size={22} />, 32, "aprendi"),
    A11("c1_rush", "P&L Rush ⚡", "16 movements · 4 boxes.", <Zap size={22} />, 24, "aprendi"),
    A11("c1_zone", "Team Zone · Real Batch 🧑‍🤝‍🧑", "Planned vs. real costs.", <Users size={22} />, 30, "aprendi"),
  ] },
  { n: 2, title: "Cash is King", e: "💧", blurb: "Why profitable companies die — and how yours will survive.", skills: ["Reading", "Survival", "Rounds", "Cash plan"], acts: [
    A11("c2_read", "Reading: Profitable but Broke 📰", "Cash flow · 8 questions.", <Newspaper size={22} />, 42, "quizzes"),
    A11("c2_cash", "Cash Flow Survival 💧", "12 months · 6 events.", <Wallet size={22} />, 38, "aprendi"),
    A11("c2_rounds", "Cash vs. Profit Rounds 🧮", "6 problems.", <Calculator size={22} />, 26, "aprendi"),
    A11("c2_plan", "Our Cash Plan 📅", "3 months · never below zero.", <Calendar size={22} />, 28, "aprendi"),
  ] },
  { n: 3, title: "Funding", e: "🏦", blurb: "Savings, loans, investors or the crowd: every peso has a price.", skills: ["Reading", "Funding Lab", "Loans", "Team Zone"], acts: [
    A11("c3_read", "Reading: The Watch That Asked the Crowd 📰", "Pebble · 8 questions.", <Newspaper size={22} />, 42, "quizzes"),
    A11("c3_lab", "Funding Lab 🏦", "$600,000 · 5 sources.", <Landmark size={22} />, 32, "aprendi"),
    A11("c3_loan", "Loan & Equity Rounds 🧮", "6 problems.", <Percent size={22} />, 26, "aprendi"),
    A11("c3_zone", "Team Zone · Funding Meeting 🧑‍🤝‍🧑", "Contributions + rules.", <Users size={22} />, 24, "aprendi"),
  ] },
  { n: 4, title: "Valuation", e: "💎", blurb: "What is your company worth — and what does '$100,000 for 10%' really mean?", skills: ["Video", "Reading", "Valuation", "Judge"], acts: [
    A11("c4_video", "Video: A Shark Tank Pitch 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A11("c4_read", "Reading: $100,000 for 10% 📰", "Valuation · 8 questions.", <Newspaper size={22} />, 42, "quizzes"),
    A11("c4_val", "Valuation Machine 💎", "3 methods · ask · walk-away.", <Gem size={22} />, 34, "aprendi"),
    A11("c4_over", "Overvalued? 🦈", "Judge 4 pitches.", <Scale size={22} />, 32, "aprendi"),
  ] },
  { n: 5, title: "The Deal", e: "🤝", blurb: "Cap tables, dilution and a negotiation against three sharks.", skills: ["Cap table", "Negotiator", "Rounds", "Team Zone"], acts: [
    A11("c5_cap", "Cap Table Simulator 🥧", "3 rounds of dilution.", <PieChart size={22} />, 31, "aprendi"),
    A11("c5_nego", "Deal Negotiator 🤝", "3 sharks · 3 rounds.", <Handshake size={22} />, 32, "aprendi"),
    A11("c5_rounds", "Equity Math 🧮", "6 problems.", <Calculator size={22} />, 26, "aprendi"),
    A11("c5_zone", "Team Zone · Our Ask 🧑‍🤝‍🧑", "Ask · walk-away · roles.", <Users size={22} />, 24, "aprendi"),
  ] },
  { n: 6, title: "Stress Test", e: "⚠️", blurb: "Break your numbers before reality does — and measure your impact.", skills: ["Reading", "Stress test", "CEO game", "Impact"], acts: [
    A11("c6_read", "Reading: When Giants Fall 📰", "Blockbuster & Kodak · 8 questions.", <Newspaper size={22} />, 42, "quizzes"),
    A11("c6_stress", "Stress Test ⚠️", "Crisis + Plan B.", <AlertTriangle size={22} />, 34, "aprendi"),
    A11("c6_ceo", "CEO Under Fire 🔥", "6 crises · 20 seconds.", <Flame size={22} />, 38, "aprendi"),
    A11("c6_impact", "Impact Canvas 🌱", "SDG 8 & 12 KPIs.", <Sprout size={22} />, 26, "aprendi"),
  ] },
  { n: 7, title: "Pitch Deck", e: "🗂️", blurb: "Ten slides, five hard questions, your numbers by heart.", skills: ["Deck", "Q&A", "Numbers", "Team Zone"], acts: [
    A11("c7_deck", "Pitch Deck Builder 🗂️", "10 slides from your data.", <Layers size={22} />, 30, "aprendi"),
    A11("c7_qa", "Shark Q&A Trainer 🦈", "5 questions · 60 s each.", <Mic size={22} />, 34, "aprendi"),
    A11("c7_numbers", "Know Your Numbers 🧮", "6 problems with YOUR data.", <Calculator size={22} />, 32, "aprendi"),
    A11("c7_zone", "Team Zone · Rehearsal 🧑‍🤝‍🧑", "2 timed rehearsals.", <Users size={22} />, 26, "aprendi"),
  ] },
  { n: 8, title: "Shark Tank Day", e: "🦈", blurb: "Face the sharks, invest in your classmates, beat the boss.", skills: ["Pitch", "Arena", "Boss", "Recap"], acts: [
    A11("c8_pitch", "Shark Tank 🦈 · THE PROJECT", "Evidence · Q&A · present · certificate.", <Mic size={22} />, 58, "aprendi"),
    A11("c8_tank", "Shark Arena 💼", "Invest 100 coins.", <Briefcase size={22} />, 40, "aprendi"),
    A11("c8_boss", "Boss P2 + Founder Card ⚔️", "5 missions + 10 questions (70%).", <Swords size={22} />, 70, "quizzes"),
    A11("c8_can", "What I Can Do Now ✅", "Recap with evidence.", <BadgeCheck size={22} />, 20, "comportamiento"),
  ] },
];

const ZONES_P2 = {
  c1_zone: { title: "Team Zone · Real Batch 🧑‍🤝‍🧑", subtitle: "Produce a real batch. Every peso planned vs. every peso spent.", goals: [
    { k: "plan", e: "📝", t: "Plan: units and budget of the batch", ph: "40 gelatins · budget $60,000" },
    { k: "cost", e: "🧾", t: "Planned vs. real cost of each item", cols: [{ k: "item", l: "Item", ph: "Gelatin powder" }, { k: "plan", l: "Planned $", type: "num", ph: "13000" }, { k: "real", l: "Real $", type: "num", ph: "14500" }], min: 4 },
    { k: "made", e: "🏭", t: "Units really produced", kind: "num", unit: "units", ph: "38" },
    { k: "sold", e: "💰", t: "Money collected from sales", kind: "num", money: true, ph: "96000" },
    { k: "why", e: "🔍", t: "Why real ≠ planned?", ph: "Fruit was more expensive and 2 cups broke…" },
  ], coins: 30, minutes: 45 },
  c3_zone: { title: "Team Zone · Funding Meeting 🧑‍🤝‍🧑", subtitle: "Real companies write their agreements BEFORE there are problems.", goals: [
    { k: "plan", e: "🏦", t: "Our funding plan in one sentence", ph: "Savings $200,000 + loan $250,000 + crowdfunding…" },
    { k: "who", e: "🤝", t: "Each founder's contribution", cols: [{ k: "who", l: "Founder", ph: "Ana" }, { k: "money", l: "Money $", type: "num", ph: "50000" }, { k: "work", l: "Work / skill", ph: "Recipes, Instagram" }], min: 2 },
    { k: "leave", e: "🚪", t: "If someone leaves the company, then…", ph: "They keep 50% of their % if they worked 2+ months…" },
    { k: "sign", e: "✍️", t: "Everybody signs (write the names)", ph: "Ana, Luis, Sofía" },
  ], coins: 24, minutes: 25 },
  c5_zone: { title: "Team Zone · Our Ask 🧑‍🤝‍🧑", subtitle: "Agree the numbers and the roles before you face the sharks.", goals: [
    { k: "ask", e: "💎", t: "Final ask: money, % and implied valuation", ph: "$300,000 for 15% → $2,000,000" },
    { k: "walk", e: "🚪", t: "Our walk-away point (max %)", kind: "num", unit: "%", ph: "25" },
    { k: "roles", e: "🎭", t: "Who presents each part", cols: [{ k: "who", l: "Founder", ph: "Luis" }, { k: "part", l: "Part", ph: "Numbers" }], min: 2 },
    { k: "fear", e: "😬", t: "3 questions we fear (and our answers)", words: 15, ph: "1) Why so expensive? → …" },
  ], coins: 24, minutes: 30 },
  c7_zone: { title: "Team Zone · Rehearsal 🧑‍🤝‍🧑", subtitle: "Pitch twice. Time it. Ask another team for honest feedback.", goals: [
    { k: "r1", e: "⏱️", t: "Rehearsals", cols: [{ k: "run", l: "Run", ph: "1" }, { k: "time", l: "Time (min)", type: "num", ph: "4.5" }, { k: "fb", l: "Feedback", ph: "Too fast in numbers" }], min: 2 },
    { k: "fix", e: "🛠️", t: "Three fixes for the final pitch", words: 10, ph: "1) Slow down… 2) Say the valuation… 3)…" },
    { k: "props", e: "🍮", t: "Product samples ready for the sharks", ph: "10 samples + labels" },
  ], coins: 26, minutes: 35 },
};

const CFG112 = {
  n: 2, KEY: "11P2", title: "Shark Tank: Fund It & Value It 🦈",
  question: "How much is your company really worth — and can you convince the sharks with your numbers?",
  howyear: "Your Period 1 company becomes a real business on paper: P&L, cash plan, funding, valuation, cap table, stress test and pitch deck. The project ends with Shark Tank Day.",
  chips: ["📒 P&L", "💎 Valuation", "🦈 Shark Tank Day"], bigKeys: ["c8_pitch"], pageKeys: ["c1_zone", "c3_zone", "c5_zone", "c7_zone"],
  weeks: G11P2_WEEKS,
  panel: (ctx, compact) => { const co = co11(P1of(ctx.resp)); const pl = plOf(ctx.resp); const v = ctx.resp?.c4_val; return <FounderPanel co={co} have={ctx.have} compact={compact} studentName={ctx.name} title="PERIOD 2 · FUND IT" stats={[{ l: "📒 Net / month", v: ctx.resp?.c1_pl ? cop(pl.net) : "—", c: pl.net >= 0 ? "pos" : "neg" }, { l: "💎 Valuation", v: v ? cop(v.implied) : "—" }, { l: "🦈 Ask", v: v ? `${cop(v.ask)} · ${v.pct}%` : "—" }, { l: "🏦 Control", v: ctx.resp?.c3_lab ? `${ctx.resp.c3_lab.control}%` : "—" }]} />; },
  render: (act, ctx) => {
    const P = { onSave: ctx.save, onExit: ctx.exit };
    const L = mkLearn(ctx, Brief91);
    const Z = ZONES_P2[act];
    if (Z) return <TeamZone {...Z} brief={<><Brief91 k={act} />{ZG[act] && <Guide11 {...ZG[act](ctx.resp)} />}</>} resp={ctx.resp} existing={ctx.existing} {...P} />;
    switch (act) {
      case "c1_read": return L.reading("c1_read", "The US$47 Billion Lesson", "WeWork, 2019: revenue is not profit.", READ_WEWORK, GLOSS_WEWORK, Q_WEWORK, "📰");
      case "c1_pl": return <PLBuilder resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c1_rush": return L.rush("c1_rush", "P&L Rush ⚡", "Revenue, cost of goods, expense — or not in the P&L?", RUSH_PL, "P&L master! 📒", 75);
      case "c2_read": return L.reading("c2_read", "Profitable on Paper, Broke in Real Life", "Why cash flow decides who survives.", READ_CASH, GLOSS_CASH, Q_CASH, "📰");
      case "c2_cash": return <CashSurvival resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c2_rounds": return <NumberRounds icon={<Calculator size={22} strokeWidth={2.1} />} title="Cash vs. Profit Rounds 🧮" subtitle="Profit is an opinion; cash is a fact." intro={<><Brief91 k="c2_rounds" /><Guide11 {...GD_R_CASH} /></>} rounds={CASH_R} coinsPer={3} bonus={8} doneTitle="Cash clear! 💧" {...P} />;
      case "c2_plan": return <CashPlan resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c3_read": return L.reading("c3_read", "The Watch That Asked the Crowd for Money", "Pebble, 2012: five ways to fund a company.", READ_PEBBLE, GLOSS_PEBBLE, Q_PEBBLE, "📰");
      case "c3_lab": return <FundingLab resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c3_loan": return <NumberRounds icon={<Percent size={22} strokeWidth={2.1} />} title="Loan & Equity Rounds 🧮" subtitle="The real price of borrowed and invested money." intro={<><Brief91 k="c3_loan" /><Guide11 {...GD_R_LOAN} /></>} rounds={LOAN_R} coinsPer={3} bonus={8} doneTitle="Funding pro! 🏦" {...P} />;
      case "c4_video": return L.video("c4_video", VID_SHARK11, "A Shark Tank Pitch", VQ_SHARK11);
      case "c4_read": return L.reading("c4_read", "$100,000 for 10%: What Does It Really Mean?", "The hidden number in every ask.", READ_VALUE, GLOSS_VALUE, Q_VALUE, "📰");
      case "c4_val": return <ValuationMachine resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c4_over": return <NumberRounds icon={<Scale size={22} strokeWidth={2.1} />} title="Overvalued? 🦈" subtitle="Four pitches. Calculate, compare, decide." intro={<><Brief91 k="c4_over" /><Guide11 {...GD_R_OVER} /></>} rounds={OVER_R} coinsPer={3} bonus={8} doneTitle="Shark instinct! 🦈" {...P} />;
      case "c5_cap": return <CapTable resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c5_nego": return <DealNegotiator resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c5_rounds": return <NumberRounds icon={<Calculator size={22} strokeWidth={2.1} />} title="Equity Math 🧮" subtitle="Percentages, slices and royalties." intro={<><Brief91 k="c5_rounds" /><Guide11 {...GD_R_EQ} /></>} rounds={EQUITY_R} coinsPer={3} bonus={8} doneTitle="Equity expert! 🥧" {...P} />;
      case "c6_read": return L.reading("c6_read", "When Giants Fall", "Blockbuster and Kodak: protecting today, losing tomorrow.", READ_GIANTS, GLOSS_GIANTS, Q_GIANTS, "📰");
      case "c6_stress": return <StressTest resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c6_ceo": return <CeoFire {...P} />;
      case "c6_impact": return <ImpactCanvas existing={ctx.existing} {...P} />;
      case "c7_deck": return <DeckBuilder resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c7_qa": return <SharkQA existing={ctx.existing} {...P} />;
      case "c7_numbers": return <KnowNumbers resp={ctx.resp} {...P} />;
      case "c8_pitch": return <SharkPitch resp={ctx.resp} studentName={ctx.name} userData={ctx.userData} API_URL={ctx.API_URL} existing={ctx.existing} {...P} />;
      case "c8_tank": return <FairArena userData={ctx.userData} API_URL={ctx.API_URL} grado="11-ST" title="Shark Arena 💼" subtitle="You are the shark: 100 coins for the companies with the best numbers." brief={<Brief91 k="c8_tank" />} coinsBase={20} unitWord="company" {...P} />;
      case "c8_boss": return <BossP2_11 resp={ctx.resp} studentName={ctx.name} {...P} />;
      case "c8_can": return <WhatICan title="What I Can Do Now ✅ · Period 2" items={CAN_P2} resp={ctx.resp} existing={ctx.existing} brief={<Brief91 k="c8_can" />} {...P} />;
      default: return null;
    }
  },
};
const EQUITY_R = [
  { tag: "Slice", q: "You own 35% of a company worth $3,000,000. Your slice is worth…", answer: 1050000, money: true, hint: "3,000,000 × 0.35", visual: F11("Value of your slice = valuation × your %", ["3,000,000 × 0.35 = ?"]), explain: "$1,050,000." },
  { tag: "Dilution", q: "You own 60%. A new investor buys 25% (new shares). Your new %?", answer: 45, unit: "%", tol: 0.1, hint: "60 × 0.75", visual: F11("New % = old % × (1 − % sold)", ["Old = 60% · sold = 25% → 1 − 0.25 = 0.75", "60 × 0.75 = ?"]), explain: "45%." },
  { tag: "Bigger pie", q: "Before: 100% of $400,000. After the deal: 70% of $1,200,000. Your value now?", answer: 840000, money: true, hint: "1,200,000 × 0.70", visual: F11("Value = % × valuation", ["Before: 1.00 × 400,000 = 400,000", "After: 0.70 × 1,200,000 = ?"]), explain: "$840,000 — less %, more value." },
  { tag: "Royalty", q: "A shark gets $400 per unit until she recovers $200,000. You sell 250 units a month. Months?", answer: 2, unit: "months", hint: "200,000 ÷ (400 × 250)", visual: F11("Months = money to recover ÷ (royalty per unit × units per month)", ["Royalty per month = 400 × 250 = 100,000", "Months = 200,000 ÷ 100,000"]), explain: "2 months." },
  { tag: "Control", q: "Three founders: 40%, 35%, 25%. An investor buys 30%. Who has the most %?", visual: F11("Each founder's new % = old % × (1 − 0.30)", ["Biggest founder: 40 × 0.7 = ?", "Compare it with the investor's 30%"]), options: ["The investor (30%) — more than any single founder.", "The first founder still has 40% of the company.", "All the founders keep exactly the same % as before.", "The investor now has 70% of the company."], correct: 0, explain: "40% × 0.7 = 28% < 30%." },
  { tag: "Profit share", q: "Net profit $900,000 a year. The investor owns 20%. Her share?", answer: 180000, money: true, hint: "900,000 × 0.20", visual: F11("Investor's share = profit × investor %", ["900,000 × 0.20 = ?"]), explain: "$180,000 a year." },
];
function CeoFire({ onSave, onExit }) {
  const [res, setRes] = useState(null);
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Crisis CEO! 🔥" subtitle={`${res?.good || 0}/6 good decisions`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Flame size={22} strokeWidth={2.1} />} title="CEO Under Fire 🔥" subtitle="Six crises, 20 seconds each. Protect cash, reputation and team." onExit={onExit}>
      <Brief91 k="c6_ceo" />
      {!res ? <ImpactRounds stats={CEO_STATS} rounds={CEO_R} timer={20} onDone={setRes} doneLabel="See my CEO report" /> : (
        <>
          <div className="g10-stats">{CEO_STATS.map((s) => <div key={s.k}><small>{s.e} {s.l}</small><b>{res.values[s.k]}</b></div>)}<div><small>✅ Good decisions</small><b>{res.good}/6</b></div></div>
          <MiniTable head={["Crisis", "My decision", ""]} rows={res.log.map((x) => [x.round, x.pick, x.good ? "✅" : "❌"])} />
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(20 + res.good * 3, { values: res.values, good: res.good })}>Save my report <span className="coin-tag"><Coins size={15} /> +{20 + res.good * 3}</span></button></div>
        </>
      )}
    </ActShell>
  );
}
export const Periodo2G11 = (props) => <PeriodShell10 cfg={CFG112} {...props} />;