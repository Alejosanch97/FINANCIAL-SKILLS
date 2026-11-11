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
import "../Styles/decimo2.css";   // 10° · Periodo 2 · Money Math Lab
import useGlobalReducer from "../hooks/useGlobalReducer";
import audioCdtBank from "../assets/img/2DECIMO.mp3"; // 🎧 Listening clase 5 · A CDT at the Bank (cámbiale el nombre si tu archivo se llama distinto)

/* =====================================================================
   GRADO 10 · PERIODO 2 · MONEY MATH LAB (B1+ a B2)
   Año "FUTURE ME": cada periodo lee las filas anteriores ("10P1"…"10P3") y suma una Future Me Card.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "10P2", Grado = "10".
   ===================================================================== */
const PERIOD_KEY = "10P2";
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
   10° · PERIODO 2 · MONEY MATH LAB — VIDEOS, LECTURAS (B2), LISTENING Y DATOS
   Personaje compartido: Future Me a los 18, trabajo de medio tiempo, $1,600,000 al mes (ficticio).
   ===================================================================== */
const VID_OPP10 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1794068802/videoplayback_45.mp4";
const VID_72 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1794069103/The_Rule_of_72.mp4";
const VID_MINPAY = "https://res.cloudinary.com/y9r84vgz/video/upload/v1794069290/videoplayback_46.mp4";
const INCOME18 = 1600000;

/* ---------- VIDEO · Scarcity and Opportunity Cost (St. Louis Fed) ---------- */
const VQ_OPP10 = [
  { q: "What economic problem does the school board face with the empty lot?", options: ["Scarcity: the land can't fit every wish.", "A big municipal debt from high taxes.", "A law that forbids building on the lot.", "Too few workers to build everything."], correct: 0, feedback: "Limited land, competing wants (parking vs. playground): that's scarcity." },
  { q: "How does the video define scarcity?", options: ["Not enough resources for everything people want.", "A short break in supply because of ship problems.", "A price limit set by the government.", "When a product becomes too expensive to buy."], correct: 0, feedback: "Resources are limited, wants are unlimited — so we must choose." },
  { q: "The board chose a bigger playground. What concept does this show?", options: ["A choice made because of scarcity.", "A market where everyone gets what they want.", "A subsidy from the government.", "An investment to make the land more valuable."], correct: 0, feedback: "Scarcity forces choices: one alternative over another." },
  { q: "What was the opportunity cost of building the playground?", options: ["The parking space they gave up.", "The money they paid for swings and slides.", "The rent they could charge for the land.", "The time the students spent measuring."], correct: 0, feedback: "Opportunity cost = the next best alternative you give up." },
  { q: "What is the relationship between wants and resources?", options: ["Wants are unlimited; resources are limited.", "Resources grow when people need more.", "Wants and resources are always equal.", "Wants are limited; resources are unlimited."], correct: 0, feedback: "That basic tension is the starting point of economics." },
  { q: "What did the students discover with their playground wish list?", options: ["It didn't all fit on the land.", "The city banned climbing ropes for safety.", "Equipment prices went up too much.", "The board didn't like the games."], correct: 0, feedback: "Unlimited wants vs. limited space." },
  { q: "What did the students do before presenting to the board?", options: ["They measured the land and each piece of equipment.", "They asked a bank for a loan to buy more land.", "They sold the naming rights of the playground.", "They voted to choose the most popular game."], correct: 0, feedback: "Data (measurements) helped them choose what really fits." },
  { q: "Why must people, businesses and governments make trade-offs?", options: ["Using a resource for one thing means not using it for another.", "The law says nobody can keep more than one resource.", "Prices change so fast that people must choose quickly.", "Everybody wants the same things at the same time."], correct: 0, feedback: "Land, time or money used here can't be used there." },
  { q: "How did information help the school board?", options: ["It showed what could realistically fit.", "It got the school a bigger grant.", "It raised the money to buy everything.", "It proved parking wasn't needed."], correct: 0, feedback: "Good data → better decisions under scarcity." },
  { q: "How is opportunity cost different from the money you pay?", options: ["It measures the value of the option you give up.", "It is the total money you pay for something.", "It is a fee companies pay when they invest.", "It only applies to governments, not people."], correct: 0, feedback: "It's broader than the price: it's what you lose by not choosing the alternative." },
  { q: "What general lesson does the classroom story teach?", options: ["Every decision means choosing some wants and giving up others.", "With enough information, you can always have everything you want.", "Good planning removes the need to give anything up.", "Only big organizations need to think about trade-offs."], correct: 0, feedback: "Scarcity governs every decision." },
  { q: "What was the final outcome?", options: ["They chose the playground and accepted less parking.", "They built both and bought more land later.", "They chose parking because it was cheaper.", "They decided not to build anything at all."], correct: 0, feedback: "A deliberate choice, with a clear opportunity cost." },
];

/* ---------- VIDEO · The Rule of 72 ---------- */
const VQ_72 = [
  { q: "What two variables do you usually need to know how fast money doubles?", options: ["The starting balance and the interest rate.", "Your taxes and the city's inflation rate.", "Your salary and your monthly debts.", "Your age and the amount you deposit."], correct: 0, feedback: "Starting money + compound interest rate." },
  { q: "Why does the video skip the logarithm formula?", options: ["Most people can't do logarithms mentally.", "Logarithms only work for simple interest.", "Logarithms give the wrong answer here.", "It needs a special computer program."], correct: 0, feedback: "We don't have 'bionic brains' — so we use a shortcut." },
  { q: "What is the Rule of 72?", options: ["72 ÷ interest rate = years to double.", "100 − your age = % to invest in stocks.", "72 × interest rate = total interest earned.", "72 ÷ years = interest you need to triple."], correct: 0, feedback: "Divide 72 by the rate to estimate the doubling time." },
  { q: "$5,000 at 4%. How many years to reach $10,000?", options: ["18 years.", "12 years.", "9 years.", "24 years."], correct: 0, feedback: "72 ÷ 4 = 18 years." },
  { q: "What does the Rule of 72 show about small rate changes?", options: ["Small rate increases make a huge difference over time.", "Small rate changes don't matter in the long term.", "Only the first deposit matters, not the rate.", "A higher rate doubles your money in the same time."], correct: 0, feedback: "Compounding turns small differences into big ones." },
  { q: "36 years at 4%. How many times does the money double?", options: ["Twice.", "Four times.", "Three times.", "Once."], correct: 0, feedback: "Doubles every 18 years → 36 ÷ 18 = 2 times." },
  { q: "Same 36 years but at 8%. What happens?", options: ["It doubles 4 times (×16).", "It doubles twice, like at 4%.", "It doubles 8 times (×256).", "It doubles 3 times (×8)."], correct: 0, feedback: "72 ÷ 8 = 9 years → 4 doublings: 2⁴ = 16 times the money. (The video simplifies it as 'quadrupling the doublings'.)" },
  { q: "At 12% for 36 years, how many times does it double?", options: ["6 times (every 6 years).", "3 times (every 12 years).", "4 times (every 9 years).", "12 times (every 3 years)."], correct: 0, feedback: "72 ÷ 12 = 6 years → 36 ÷ 6 = 6 doublings (2⁶ = 64 times)." },
  { q: "Why is 72 such a useful number?", options: ["It divides easily by many rates.", "Tax agencies use it in every calculation.", "It adjusts the result for inflation.", "It removes the risk from the estimate."], correct: 0, feedback: "72 ÷ 2, 3, 4, 6, 8, 9, 12 — easy mental math." },
  { q: "What is the big lesson for retirement planning?", options: ["Compounding and higher rates change your future wealth a lot.", "Only the first deposit matters, not the interest rate.", "It is better to start late with bigger amounts.", "A 1% difference in rate is too small to care about."], correct: 0, feedback: "Rate + time = the power of compounding." },
  { q: "How exact is the Rule of 72?", options: ["A very close approximation.", "An exact formula for every rate.", "Only valid for stocks.", "Useful only for loans, not savings."], correct: 0, feedback: "A practical shortcut — close enough for normal rates." },
  { q: "What is the relationship between rate and doubling time?", options: ["Higher rate → shorter doubling time.", "Higher rate → longer doubling time.", "The rate doesn't change the doubling time.", "Doubling time = rate × 72."], correct: 0, feedback: "72 ÷ bigger number = fewer years." },
];

/* ---------- VIDEO · The Minimum Payment Trap ---------- */
const VQ_MINPAY = [
  { q: "What is the real purpose of minimum payment formulas?", options: ["To keep you paying as long as possible.", "To help you finish your debt in two years.", "To follow a law that caps the interest.", "To make your monthly payments bigger."], correct: 0, feedback: "They keep you in a long loop while you feel responsible." },
  { q: "$5,000 at 22%, paying only the minimum. What happens?", options: ["About 19 years and ~$8,000 in interest.", "About 26 months and very little interest.", "About 5 years and ~$1,300 in interest.", "About 10 years, then the bank cancels it."], correct: 0, feedback: "19 years and about $8,000 just in interest." },
  { q: "How is a typical minimum payment calculated?", options: ["Monthly interest + about 1% of the balance.", "10% of the first purchase plus a fee.", "A fixed $50 set by law.", "Half of the monthly interest only."], correct: 0, feedback: "Interest + ~1% of what you owe." },
  { q: "Why do minimum payments get smaller every month?", options: ["1% of a smaller balance is smaller, so you repay slower.", "The bank gives you a discount on interest after a few years.", "The interest rate goes down automatically every month.", "The store pays part of your debt as a reward."], correct: 0, feedback: "A shrinking payment means the debt shrinks slower and slower." },
  { q: "What happens if you pay a fixed $250 per month instead?", options: ["Paid in ~26 months with ~$1,300 interest.", "Still 19 years, because the rate is the same.", "Paid in ~12 months with no interest.", "Paid in ~5 years with ~$4,000 interest."], correct: 0, feedback: "Fixed payments: 26 months and $1,300 instead of 19 years and $8,000." },
  { q: "What is Step 1 to escape the trap?", options: ["Stop adding new charges.", "Ask the bank to cancel the balance.", "Take a new loan to pay the card.", "Pay only the minimum for now."], correct: 0, feedback: "You can't empty a bathtub with the tap still running." },
  { q: "Why make a list of all your debts (Step 2)?", options: ["It becomes a clear map after 10 scary minutes.", "It lowers the interest rate of each debt.", "It freezes your bills for a few months.", "The bank needs it to give you more credit."], correct: 0, feedback: "Debts, rates and minimums on one page = your plan." },
  { q: "What is the Debt Avalanche method?", options: ["Extra money goes to the highest rate first.", "Extra money goes to the smallest balance first.", "Equal extra payments go to every debt.", "You combine all debts into one new card."], correct: 0, feedback: "Highest rate first saves the most money." },
  { q: "What is the Debt Snowball method?", options: ["Smallest balance first, for quick wins.", "Highest interest rate first, to save money.", "Biggest balance first, to finish it early.", "All debts at the same time, equally."], correct: 0, feedback: "Smallest first = motivation from quick victories." },
  { q: "What can you ask your card company?", options: ["A lower rate, if you always pay on time.", "To erase all the interest you have paid.", "To stop paying for six months, no cost.", "A higher limit, so you can pay it faster."], correct: 0, feedback: "Many people never ask — sometimes it works." },
  { q: "When does a balance transfer or consolidation loan help?", options: ["Only after you stop adding new debt.", "Before you use all your credit limit.", "When you want a higher credit limit.", "When you need money for daily expenses."], correct: 0, feedback: "Otherwise you just build a bigger chain." },
  { q: "What is the reality of getting out of debt?", options: ["Boring, consistent payments month after month.", "One big win in the stock market that pays everything.", "A new app that organizes your money for you.", "Help from the government after a few years."], correct: 0, feedback: "Discipline beats drama." },
];

/* ---------- LISTENING · A CDT at the Bank (mp3 · decimo2.mp3) ---------- */
const SCRIPT_CDT = [
  { who: "Narrator", t: "Valentina is seventeen. She saved 2,000,000 pesos working at her aunt's bakery. She wants to pay for a programming course in exactly one year. Her mom goes with her to the bank." },
  { who: "Adviser", t: "Good morning! How can I help you?" },
  { who: "Valentina", t: "Good morning. I'd like to know my options to save 2,000,000 pesos for one year." },
  { who: "Adviser", t: "Great. We have three options. First, a savings account. It pays 4% E-A, and you can take your money out any time." },
  { who: "Valentina", t: "So after one year I'd earn about 80,000 pesos." },
  { who: "Adviser", t: "Exactly. Second, a CDT for 360 days. It pays 10% E-A, but you can't withdraw the money before the 360 days." },
  { who: "Valentina", t: "That would be around 200,000 pesos. And the third option?" },
  { who: "Adviser", t: "Our investment fund, Fondo Crecer. Last year it paid 14%! That's 280,000 pesos. Honestly, it's the best option." },
  { who: "Valentina", t: "Is the 14% guaranteed?" },
  { who: "Adviser", t: "Well... nothing is a hundred percent guaranteed, but it's a very good fund. There is a small management fee of 2% per year." },
  { who: "Mom", t: "So if the fund does worse this year, she could earn less than with the CDT?" },
  { who: "Adviser", t: "It's possible, yes. In a bad year, it could even lose a little." },
  { who: "Valentina", t: "And the 2% fee is charged every year, even in a bad year?" },
  { who: "Adviser", t: "Yes, that's right." },
  { who: "Valentina", t: "Okay. I need the money in exactly one year, and I can't risk losing part of it. I think the CDT is the best option for my goal." },
  { who: "Adviser", t: "Good choice. Just remember: the rate is 10% effective annual, E-A. It's not 10% per month." },
  { who: "Valentina", t: "Got it. Effective annual means that's what I really earn in one full year." },
  { who: "Narrator", t: "Valentina didn't choose the biggest number. She chose the option that matched her goal: a fixed date and no risk. The 14% was last year's return, not a promise, and the 2% fee is charged every year." },
];
const Q_CDT = [
  { q: "Why does Valentina need the money in exactly one year?", options: ["To pay for a programming course.", "To buy a laptop for her aunt's bakery.", "To travel with her friends.", "To lend it to her mom."], correct: 0, feedback: "Her goal has a fixed date: a programming course." },
  { q: "How much would the savings account pay in one year?", options: ["About 80,000 pesos.", "About 200,000 pesos.", "About 280,000 pesos.", "About 20,000 pesos."], correct: 0, feedback: "4% of 2,000,000 = 80,000." },
  { q: "What is the main condition of the CDT?", options: ["You can't withdraw before 360 days.", "You can withdraw any time, with less interest.", "It charges a 2% fee every year.", "Its rate goes up and down every month."], correct: 0, feedback: "Higher rate, but the money is locked." },
  { q: "What was the trap in the adviser's offer?", options: ["14% was LAST year's return, not a promise.", "The CDT wasn't real; the bank wanted her money.", "The fund was illegal in Colombia.", "The 14% was monthly, not annual."], correct: 0, feedback: "Past returns don't guarantee future returns." },
  { q: "What extra cost does the fund have?", options: ["A 2% management fee every year.", "A 3% penalty to withdraw early.", "A 14% tax on the profit.", "A fixed fee of $50,000 a month."], correct: 0, feedback: "The fee is charged even in bad years." },
  { q: "Why did Valentina choose the CDT?", options: ["Fixed date + no risk matches her goal.", "It paid the most of all the options.", "Her mom chose it for her.", "She could take the money out any day."], correct: 0, feedback: "She matched the product to her goal, not to the biggest number." },
  { q: "What does 10% E.A. mean?", options: ["What she really earns in one full year.", "The bank pays her 10% every month.", "10% minus the inflation of the year.", "What she earns in the first month only."], correct: 0, feedback: "Effective annual = the real yearly return, with compounding included." },
  { q: "How much would the CDT pay in one year?", options: ["About 200,000 pesos.", "About 2,400,000 pesos.", "About 80,000 pesos.", "About 280,000 pesos."], correct: 0, feedback: "10% of 2,000,000 = 200,000." },
  { q: "When could the fund be a better option?", options: ["With a long horizon and money you can risk.", "When you need the money on a fixed date soon.", "When you want a guaranteed 14%.", "When you can't lose any of your money."], correct: 0, feedback: "Funds fit long-term goals where you can wait out bad years." },
  { q: "What smart question did Valentina ask?", options: ["“Is the 14% guaranteed?”", "“Can I have 14% now and the CDT later?”", "“Which option does my mom prefer?”", "“What did the fund pay two years ago?”"], correct: 0, feedback: "Always ask if a return is guaranteed — and what the fees are." },
];

/* ---------- LECTURA · Your Money in a Spreadsheet (B2) ---------- */
const READ_SHEET = [
  { p: "Imagine it's your 18th birthday. You have a part-time job that pays $1,600,000 a month (in this period we all use the same fictional Future Me). The first month, the money disappears and you don't know where it went. The second month, it happens again. Sound familiar? The problem is not the amount — it's that your money has no map. A spreadsheet is that map." },
  { h: "Why a spreadsheet and not a notebook?" },
  { p: "A notebook can list your expenses, but it can't think. A spreadsheet (Excel or Google Sheets) calculates automatically: if your rent changes, the total, the savings and the percentages change at the same moment. Professionals use spreadsheets for everything — budgets, business plans, investments — because a formula never forgets to add a number." },
  { h: "Rows, columns, cells and formulas" },
  { p: "A spreadsheet is a grid. Columns have letters (A, B, C…) and rows have numbers (1, 2, 3…). Each box is a cell, and its name is the column plus the row: B4 is column B, row 4. A formula always starts with the = sign. =B2+B3 adds two cells. =SUM(B2:B8) adds everything from B2 to B8. =B9*20% calculates 20% of B9. =B1-B9 subtracts." },
  { node: <MiniTable key="t1" head={["", "A", "B (COP)", "Formula behind B"]} rows={[["1", "Income", "1,600,000", "(typed)"], ["2", "Transport", "180,000", "(typed)"], ["3", "Phone plan", "60,000", "(typed)"], ["4", "Food & snacks", "320,000", "(typed)"], ["5", "Contribution at home", "300,000", "(typed)"], ["6", "Total expenses", "860,000", "=SUM(B2:B5)"], ["7", "Savings goal (20%)", "320,000", "=B1*20%"], ["8", "Free to spend", "420,000", "=B1-B6-B7"]]} /> },
  { h: "Example 1 · Does the month close?" },
  { p: "With the table above, Future Me spends $860,000, saves $320,000 and still has $420,000 for wants. The month closes because B8 is positive. Now imagine transport goes up to $260,000. You change ONE cell, and the spreadsheet immediately shows that B8 falls to $340,000. That's the magic: you see the consequence before it happens." },
  { h: "Example 2 · The 50/30/20 rule" },
  { p: "A popular guide splits income into 50% needs, 30% wants and 20% savings. With $1,600,000: needs up to $800,000, wants up to $480,000 and savings at least $320,000. The formulas are =B1*50%, =B1*30% and =B1*20%. It's a guide, not a law: if you live with your family, you might save much more than 20%." },
  { h: "Example 3 · A savings goal in months" },
  { p: "You want a $1,200,000 laptop. If you save $320,000 a month, how many months do you need? =1200000/320000 gives 3.75, so 4 months. If you cut snacks by $80,000 and save $400,000, you need exactly 3 months. A spreadsheet lets you test scenarios: “What if I…?”." },
  { box: "💡 Fixed expenses are the same every month (rent, phone plan). Variable expenses change (food, going out). Needs keep you alive and working; wants make life nicer. Your spreadsheet should show both classifications." },
  { node: <Mistakes key="m" items={["Typing totals by hand instead of using =SUM — one change and everything is wrong.", "Forgetting small daily expenses (a $5,000 snack × 22 days = $110,000!).", "Saving 'what is left' at the end of the month. Save FIRST, then spend."]} /> },
  { box: "📌 Summary: cells + formulas (=SUM, =B1*20%) · 50/30/20 · fixed vs. variable · needs vs. wants · test 'what if' scenarios." },
];
const GLOSS_SHEET = { "spreadsheet": "a program with rows and columns that calculates automatically (Excel, Google Sheets)", "cell": "one box of a spreadsheet, like B4", "formula": "an instruction that starts with = and calculates", "fixed expenses": "costs that are the same every month", "variable expenses": "costs that change from month to month", "50/30/20": "a guide: 50% needs, 30% wants, 20% savings" };
const Q_SHEET = [
  { q: "What is cell C7?", options: ["Column C, row 7.", "Row C, column 7.", "The seventh formula in column C.", "The total of column C."], correct: 0, feedback: "Column letter + row number." },
  { q: "Which formula adds cells B2 to B8?", options: ["=SUM(B2:B8)", "=B2+B8", "=SUM(B2;B8)", "=B2*B8"], correct: 0, feedback: "Formulas start with = and SUM adds a range." },
  { q: "Income is in B1. How do you calculate 20% savings?", options: ["=B1*20%", "=B1+20%", "=20/B1", "=B1*20"], correct: 0, feedback: "Multiplying by 20% always updates if B1 changes." },
  { q: "With $1,600,000 and 50/30/20, how much for wants?", options: ["$480,000.", "$800,000.", "$320,000.", "$500,000."], correct: 0, feedback: "30% × 1,600,000 = 480,000." },
  { q: "Which is a FIXED expense?", options: ["A monthly phone plan.", "Weekend plans with friends.", "Snacks at school.", "Birthday gifts."], correct: 0, feedback: "Same amount every month = fixed." },
  { q: "Why is a spreadsheet better than a notebook?", options: ["It recalculates automatically.", "It can hold bigger numbers.", "It looks more professional.", "It keeps your data private."], correct: 0, feedback: "Change one cell → every total updates." },
  { q: "You save $400,000 a month for a $1,200,000 laptop. How long?", options: ["3 months.", "4 months.", "2 months.", "6 months."], correct: 0, feedback: "1,200,000 ÷ 400,000 = 3." },
  { q: "What is the best moment to save, according to the text?", options: ["First, as soon as you receive your income.", "At the end of the month, with what is left.", "After paying for your wants.", "Only when you get a bonus or a gift."], correct: 0, feedback: "Pay yourself first." },
  { q: "A $5,000 snack every school day (22 days) costs…", options: ["$110,000 a month.", "$5,000 a month.", "$100,000 a month.", "$150,000 a month."], correct: 0, feedback: "Small expenses add up: 5,000 × 22." },
  { q: "What is the 50/30/20 rule?", options: ["A guide, not a law.", "A law every worker must follow.", "A tax rule from the DIAN.", "A bank savings product."], correct: 0, feedback: "Adapt it to your life." },
];

/* ---------- LECTURA · The Time Traveler's Wallet (B2) ---------- */
const READ_TIME = [
  { p: "In 2016, Grandpa Jorge put a $100,000 bill in an old book and forgot about it. In 2025 his granddaughter Mariana found it while she was cleaning. “Lucky me!” she shouted. But when she went to the supermarket, she discovered something strange: the same basket of products that cost $100,000 in 2016 cost around $165,000 at the end of 2024. The bill had not changed — but its power had. Mariana had found a time traveler's wallet, and it had lost almost 40% of its purchasing power." },
  { node: <MiniTable key="t" head={["Year", "Inflation in Colombia (DANE, IPC)"]} rows={[["2016", "5.75%"], ["2017", "4.09%"], ["2018", "3.18%"], ["2019", "3.80%"], ["2020", "1.61%"], ["2021", "5.62%"], ["2022", "13.12%"], ["2023", "9.28%"], ["2024", "5.20%"]]} foot={["2016–2024", "prices × about 1.65"]} /> },
  { h: "A peso today is worth more than a peso tomorrow" },
  { p: "This is called the time value of money. There are two reasons. First, inflation: prices rise, so future money buys less. Second, opportunity: if you have money today, you can invest it and earn interest. Money received later loses that chance. That's why banks, companies and governments never compare money from different years directly — they first move it to the same moment in time." },
  { h: "Future value (FV): traveling forward" },
  { p: "If you invest a present value (PV) at a rate r for n years, the future value is FV = PV × (1 + r)ⁿ. Example 1: $1,000,000 at 10% per year for 3 years → 1,000,000 × 1.10 × 1.10 × 1.10 = $1,331,000. Notice that you earn more than $100,000 each year after the first: in year 2 you earn interest on your interest. That is compounding." },
  { h: "Present value (PV): traveling backward" },
  { p: "The opposite question is: how much is a future amount worth today? PV = FV ÷ (1 + r)ⁿ. Example 2: someone promises you $1,331,000 in 3 years. If you can earn 10% elsewhere, that promise is worth exactly $1,000,000 today: 1,331,000 ÷ 1.331. If they offer you $950,000 today instead, the promise is better; if they offer $1,050,000 today, take the money now." },
  { h: "Example 3 · Today or tomorrow?" },
  { p: "Your aunt offers you $1,000,000 today or $1,100,000 in one year. Which is better? It depends on what you can do with the money. If a CDT pays 12% E.A., today's million becomes $1,120,000 in a year — more than $1,100,000, so take it today. If the best you can get is 6%, today's million becomes $1,060,000, so waiting for $1,100,000 is better. The rate you could earn is your opportunity cost." },
  { box: "💡 Real value: if your money grows 6% but inflation is 9%, your purchasing power FALLS about 3%. Real return ≈ interest rate − inflation." },
  { node: <Mistakes key="m" items={["Comparing pesos from different years as if they were the same.", "Thinking 10% for 3 years = 30% (it's 33.1% with compounding).", "Forgetting inflation: a bigger number is not always more purchasing power."]} /> },
  { box: "📌 Summary: FV = PV × (1 + r)ⁿ · PV = FV ÷ (1 + r)ⁿ · today or tomorrow depends on your opportunity rate · real return ≈ rate − inflation." },
];
const GLOSS_TIME = { "time value of money": "money today is worth more than the same money in the future", "present value": "what a future amount is worth today", "future value": "what money today will become in the future", "compounding": "earning interest on your interest", "purchasing power": "how many things your money can buy", "real return": "your return after inflation" };
const Q_TIME = [
  { q: "Why did Mariana's $100,000 lose value?", options: ["Prices rose (inflation).", "The bill became too old to use.", "The peso got stronger.", "The bank charged a fee."], correct: 0, feedback: "Same bill, higher prices → less purchasing power." },
  { q: "$1,000,000 at 10% for 3 years becomes…", options: ["$1,331,000.", "$1,300,000.", "$1,310,000.", "$1,030,000."], correct: 0, feedback: "1,000,000 × 1.1³ = 1,331,000 (compounding)." },
  { q: "What is present value?", options: ["What a future amount is worth today.", "The money you have in your pocket now.", "The value of something after interest.", "The price of a product in the future."], correct: 0, feedback: "PV = FV ÷ (1 + r)ⁿ." },
  { q: "$1,000,000 today or $1,100,000 in a year, with a CDT at 12%?", options: ["Today: it becomes $1,120,000.", "Next year: $1,100,000 is bigger.", "It's the same either way.", "Next year, it has no risk."], correct: 0, feedback: "Invest today at 12% → 1,120,000 > 1,100,000." },
  { q: "Same choice, but your best rate is 6%?", options: ["Wait: $1,100,000 beats $1,060,000.", "Take it today: money today always wins.", "Take it today: it becomes $1,120,000.", "It's exactly the same either way."], correct: 0, feedback: "1,000,000 × 1.06 = 1,060,000 < 1,100,000." },
  { q: "Your money grows 6% and inflation is 9%. Real return?", options: ["About −3%.", "About +15%.", "About +6%.", "About +3%."], correct: 0, feedback: "Real ≈ 6% − 9% = −3%." },
  { q: "Which year had the highest inflation in the table?", options: ["2022 (13.12%).", "2016 (5.75%).", "2023 (9.28%).", "2020 (1.61%)."], correct: 0, feedback: "2022: 13.12%." },
  { q: "What is your opportunity cost in the 'today or tomorrow' example?", options: ["The rate you could earn elsewhere.", "The money your aunt has in the bank.", "The inflation of the last year.", "The time you wait for the money."], correct: 0, feedback: "Your best alternative return." },
  { q: "10% per year for 3 years is…", options: ["33.1% in total.", "30% in total.", "31% in total.", "13.3% in total."], correct: 0, feedback: "1.1³ − 1 = 0.331." },
  { q: "Why do banks move money 'to the same moment' before comparing?", options: ["Money from different years isn't comparable.", "The law requires the same day of the week.", "It helps them charge more fees.", "It makes the numbers look bigger."], correct: 0, feedback: "Time changes the value of money." },
];

/* ---------- EXPLAINER · Reading a Bank Ad (E.A. vs. mensual) ---------- */
const BRIEF_RATES = [
  { p: "Bank ads love big, shiny numbers: “1% monthly!”, “12% E.A.!”, “0.9% per month!”. They look similar, but they are not. To compare them, you must translate all of them into the same language: the effective annual rate (E.A.)." },
  { h: "What does E.A. really mean?" },
  { p: "Effective annual is what you really earn (or pay) in one year, including compounding. If a CDT pays 10% E.A. and you invest $2,000,000, after one year you have $2,200,000. Simple. A monthly rate is different: the interest of each month earns interest in the next months." },
  { node: <MiniTable key="t" head={["Monthly rate", "Formula", "E.A."]} rows={[["0.5%", "(1.005)¹² − 1", "6.17%"], ["1%", "(1.01)¹² − 1", "12.68%"], ["2%", "(1.02)¹² − 1", "26.82%"]]} /> },
  { p: "Example 1: Bank A offers 1% monthly; Bank B offers 12% E.A. Bank A seems the same (1% × 12 = 12%), but with compounding it's 12.68% E.A. — A pays more. Example 2 (going backward): a CDT pays 12% E.A. What is the equivalent monthly rate? (1.12)^(1/12) − 1 = 0.949% per month. Example 3: a credit card charges 2% monthly. That sounds small, but it's 26.82% E.A.!" },
  { box: "💡 Two formulas: E.A. = (1 + monthly)¹² − 1 · monthly = (1 + E.A.)^(1/12) − 1. For SAVING you want the highest E.A.; for BORROWING you want the lowest." },
  { node: <Mistakes key="m" items={["Multiplying the monthly rate by 12 (it ignores compounding).", "Comparing only the rate — check fees, minimum balance and if you can withdraw.", "Believing a 'promotional rate' lasts forever: read the small letters."]} /> },
];
const GLOSS_RATES = { "effective annual": "the real rate for one year, including compounding (E.A.)", "monthly rate": "the interest rate for one month", "promotional rate": "a special rate that lasts a limited time", "minimum balance": "the money you must keep in the account" };
const Q_RATES = [
  { q: "What is 1% monthly in E.A.?", options: ["About 12.68%.", "Exactly 12%.", "About 11.39%.", "About 13.5%."], correct: 0, feedback: "(1.01)¹² − 1 = 12.68%." },
  { q: "Which pays more for SAVING: 1% monthly or 12% E.A.?", options: ["1% monthly (12.68% E.A.).", "12% E.A.: annual is always bigger.", "They are exactly equal.", "12% E.A.: fewer calculations."], correct: 0, feedback: "Translate first, then compare." },
  { q: "A card charges 2% monthly. E.A.?", options: ["About 26.8%.", "Exactly 24%.", "About 22.4%.", "About 30%."], correct: 0, feedback: "(1.02)¹² − 1 = 26.82%." },
  { q: "12% E.A. is about how much per month?", options: ["About 0.95%.", "Exactly 1%.", "About 1.2%.", "About 0.5%."], correct: 0, feedback: "(1.12)^(1/12) − 1 ≈ 0.949%." },
  { q: "For a LOAN, which rate do you want?", options: ["The lowest E.A.", "The highest E.A.", "The lowest monthly payment.", "The one with the most installments."], correct: 0, feedback: "Borrowing → lowest cost." },
  { q: "Besides the rate, what should you check?", options: ["Fees, conditions and when you can withdraw.", "Only the design of the bank's app.", "The bank's ranking on social media.", "How many branches it has in your city."], correct: 0, feedback: "The rate is not the only thing that matters." },
  { q: "$2,000,000 in a CDT at 10% E.A. for one year gives…", options: ["$2,200,000.", "$4,400,000.", "$2,020,000.", "$2,240,000."], correct: 0, feedback: "2,000,000 × 1.10." },
];

/* ---------- LECTURA · The Price Times (periódico) ---------- */
const READ_PRICES = [
  { node: <div key="mast" className="g10-paper-mast"><small>SPECIAL EDITION · MONEY MATH LAB · GRADE 10</small><h2>📰 The Price Times</h2><span>“When prices climb, your money must climb faster.”</span></div> },
  { h: "Main story · The year prices jumped" },
  { p: "In 2022, Colombian families felt something they hadn't felt in more than twenty years: inflation of 13.12%, according to DANE. Food was the main driver. Families that earned the same salary as in 2021 suddenly could buy much less. “I buy the same things, but I pay much more,” said a mother of two in Bogotá. The Banco de la República raised its interest rate many times to cool down spending. By 2024, annual inflation had fallen to 5.20% — still higher than the bank's target of 3%." },
  { node: <MiniTable key="t" head={["Year", "Inflation (IPC, DANE)", "What $100,000 of January buys in December"]} rows={[["2020", "1.61%", "≈ $98,400"], ["2021", "5.62%", "≈ $94,700"], ["2022", "13.12%", "≈ $88,400"], ["2023", "9.28%", "≈ $91,500"], ["2024", "5.20%", "≈ $95,100"]]} /> },
  { h: "How to calculate it · The 'price time machine'" },
  { p: "The percentage change of a price is (new price − old price) ÷ old price × 100. Example 1: a bus ticket went from $2,300 to $3,200: (3,200 − 2,300) ÷ 2,300 × 100 = 39%. Example 2: a lunch went from $9,000 to $15,000: (15,000 − 9,000) ÷ 9,000 = 67%. Example 3: a phone went from $800,000 to $700,000: −12.5% — technology often gets cheaper! The IPC averages the change of a whole basket of products, so YOUR personal inflation can be higher or lower, depending on what you buy. (The prices in these examples are illustrative.)" },
  { h: "Opinion · Your piggy bank is losing" },
  { p: "If you keep $1,000,000 in a piggy bank for a year with 5% inflation, you still have $1,000,000 — but it buys what $952,000 bought before. A savings account at 4% E.A. still loses a little purchasing power. A CDT or a 'cajita' that pays more than inflation protects you. That doesn't mean investing everything: you also need money you can use in an emergency. The secret is to know the real return: rate − inflation." },
  { box: "📊 Market box: inflation target of the Banco de la República = 3% (± 1 point). Real return ≈ rate − inflation. Inflation data: DANE (dane.gov.co)." },
  { node: <Mistakes key="m" items={["Thinking that 'prices went up 5%' means EVERY product went up 5%.", "Dividing by the NEW price when calculating the % change.", "Saying a product is 'cheaper' just because its number is the same — compare with inflation."]} /> },
];
const GLOSS_PRICES = { "IPC": "Índice de Precios al Consumidor: measures the average change of prices of a basket", "DANE": "Colombia's official statistics office", "driver": "the main cause of a change", "inflation target": "the inflation the central bank wants (3% in Colombia)", "basket": "a group of products used to measure prices" };
const Q_PRICES = [
  { q: "What inflation did Colombia have in 2022, according to DANE?", options: ["13.12%.", "5.20%.", "9.28%.", "10.15%."], correct: 0, feedback: "2022: 13.12%, the highest in more than 20 years." },
  { q: "What is the Banco de la República's inflation target?", options: ["3%.", "13%.", "0%.", "5%."], correct: 0, feedback: "3% (with a range of ± 1 point)." },
  { q: "A bus ticket goes from $2,300 to $3,200. % change?", options: ["About 39%.", "About 28%.", "About 9%.", "About 90%."], correct: 0, feedback: "900 ÷ 2,300 × 100 ≈ 39%." },
  { q: "Why can YOUR inflation be different from the IPC?", options: ["You buy a different basket.", "The IPC only measures cars and houses.", "The IPC is calculated once every 10 years.", "Your city doesn't count in the IPC."], correct: 0, feedback: "The IPC is an average basket." },
  { q: "$1,000,000 in a piggy bank with 5% inflation buys what… bought before.", options: ["about $952,000", "about $1,050,000", "about $900,000", "about $500,000"], correct: 0, feedback: "1,000,000 ÷ 1.05 ≈ 952,000." },
  { q: "Why did the central bank raise rates in 2022?", options: ["To cool down spending and inflation.", "To help families spend more.", "To make loans cheaper for everybody.", "To make the peso weaker."], correct: 0, feedback: "Higher rates → less spending → lower inflation." },
  { q: "A phone goes from $800,000 to $700,000. % change?", options: ["−12.5%.", "−14.3%.", "+14.3%.", "−10%."], correct: 0, feedback: "−100,000 ÷ 800,000 = −12.5%." },
  { q: "What protects your purchasing power?", options: ["A return higher than inflation.", "Keeping your savings in cash at home.", "A return equal to last year's rate.", "Spending your money before prices rise."], correct: 0, feedback: "Real return = rate − inflation must be positive." },
];

/* ---------- RUSH · Budget ---------- */
const RUSH_BUDGET = {
  buckets: [
    { id: "fn", e: "🏠", l: "Fixed need", d: "same every month · necessary", c: "#1b4a33" }, { id: "vn", e: "🛒", l: "Variable need", d: "changes · necessary", c: "#16b074" },
    { id: "fw", e: "📺", l: "Fixed want", d: "same every month · nice to have", c: "#f5b23e" }, { id: "vw", e: "🎉", l: "Variable want", d: "changes · nice to have", c: "#ff6b57" },
  ],
  items: [
    { e: "🏠", t: "Rent of a room: $500,000 every month", b: "fn", why: "Same amount, and you need a place to live." }, { e: "🍿", t: "Movies with friends this weekend", b: "vw", why: "It changes and it's a want." },
    { e: "🎵", t: "Music streaming plan: $17,000 monthly", b: "fw", why: "Same every month, but not necessary." }, { e: "🥦", t: "Groceries for the week", b: "vn", why: "Necessary, and the amount changes." },
    { e: "📱", t: "Phone plan for work: $60,000 monthly", b: "fn", why: "Same amount and you need it to work." }, { e: "👟", t: "New sneakers on sale", b: "vw", why: "Nice to have, and not every month." },
    { e: "🚌", t: "Bus to work (depends on the days)", b: "vn", why: "Necessary, but it changes with your schedule." }, { e: "🏋️", t: "Gym membership: $90,000 monthly", b: "fw", why: "Fixed, but a want for most people." },
    { e: "💡", t: "Electricity bill", b: "vn", why: "Necessary, and it changes with use." }, { e: "🍔", t: "Delivery food on Friday night", b: "vw", why: "A want that changes." },
    { e: "🎓", t: "Monthly course payment: $250,000", b: "fn", why: "A fixed investment in your future." }, { e: "🎮", t: "Game subscription: $40,000 monthly", b: "fw", why: "Fixed and a want." },
  ],
};

/* ---------- CERTIFICATION CHALLENGE · 5 misiones + 10 preguntas ---------- */
const BOSS2_MISSIONS = [
  { tag: "🧾 Level 1 · Budget", q: "Income $1,600,000. Needs $780,000, wants $420,000. How much is left to save?", answer: 400000, money: true, hint: "1,600,000 − 780,000 − 420,000", explain: "1,600,000 − 1,200,000 = 400,000 (25%)." },
  { tag: "📈 Level 2 · Compound", q: "$2,000,000 at 10% E.A. for 2 years. Final value?", answer: 2420000, money: true, hint: "2,000,000 × 1.1 × 1.1", explain: "2,000,000 × 1.21 = 2,420,000." },
  { tag: "🏦 Level 3 · Rates", q: "Which pays more for saving?", options: ["1% monthly (12.68% E.A.).", "11.5% E.A. (no fees).", "0.8% monthly.", "12% E.A. (fixed rate)."], correct: 0, explain: "(1.01)¹² − 1 = 12.68%." },
  { tag: "💳 Level 4 · Loan", q: "A $1,200,000 purchase on a card at 2% monthly in 12 installments: payment ≈ $113,472. Total paid?", answer: 1361664, money: true, tol: 300, hint: "113,472 × 12", explain: "≈ $1,361,664 — about $161,664 of interest." },
  { tag: "🫧 Level 5 · Inflation", q: "Your savings pay 4% and inflation is 7%. Real return (approx.)?", answer: -3, unit: "%", tol: 0.2, hint: "rate − inflation", explain: "4% − 7% = −3%: you lose purchasing power." },
];
const BOSS2_Q = [
  { t: "Budget", q: "In 50/30/20, the 20% is for…", options: ["savings.", "wants.", "needs.", "fun plans."], correct: 0, feedback: "50 needs · 30 wants · 20 savings." },
  { t: "Budget", q: "Which formula adds B2 to B6?", options: ["=SUM(B2:B6)", "=B2+B6", "=SUM(B2-B6)", "=B2*B6"], correct: 0, feedback: "= starts every formula." },
  { t: "Opportunity cost", q: "You choose a course instead of a trip. Opportunity cost?", options: ["The trip.", "The price of the course.", "The materials for the course.", "Nothing, you chose well."], correct: 0, feedback: "The next best alternative you gave up." },
  { t: "Time value", q: "PV of $1,210,000 in 2 years at 10%?", options: ["$1,000,000.", "$1,010,000.", "$968,000.", "$1,100,000."], correct: 0, feedback: "1,210,000 ÷ 1.21." },
  { t: "Time value", q: "Why is money today worth more than tomorrow?", options: ["Inflation + you can invest it.", "Banks close on Sundays.", "Tomorrow you will pay taxes.", "Money gets old and loses value."], correct: 0, feedback: "Two reasons: prices rise and opportunity." },
  { t: "Interest", q: "Rule of 72: at 9%, money doubles in…", options: ["8 years.", "9 years.", "6 years.", "10 years."], correct: 0, feedback: "72 ÷ 9 = 8." },
  { t: "Interest", q: "Compound interest means…", options: ["earning interest on interest.", "earning the same interest every year.", "interest only on your first deposit.", "paying interest on interest."], correct: 0, feedback: "That's why the curve bends upward." },
  { t: "Loans & cards", q: "Paying only the card minimum…", options: ["keeps you in debt for years.", "finishes your debt fast.", "lowers your interest rate.", "is free if you pay on time."], correct: 0, feedback: "Minimums shrink — the debt lives longer." },
  { t: "Loans & cards", q: "In an amortization table, at the beginning most of the payment goes to…", options: ["interest.", "capital.", "fees.", "insurance."], correct: 0, feedback: "Interest is calculated on a big balance at first." },
  { t: "Inflation", q: "Inflation 9%, account 4%. Your purchasing power…", options: ["falls about 5%.", "grows about 13%.", "grows about 4%.", "stays the same."], correct: 0, feedback: "Real ≈ 4 − 9 = −5%." },
];
const BOSS2_TIPS = { Budget: "Review Your Money in a Spreadsheet and Survive the Month: formulas and 50/30/20.", "Opportunity cost": "Rewatch the St. Louis Fed video and replay Choices Arcade.", "Time value": "Reread The Time Traveler's Wallet: FV = PV × (1 + r)ⁿ and PV = FV ÷ (1 + r)ⁿ.", Interest: "Rewatch the Rule of 72 and replay the Interest Battle.", "Loans & cards": "Rewatch the Minimum Payment Trap and replay the Loan Lab.", Inflation: "Reread The Price Times: real return = rate − inflation." };

/* =====================================================================
   10° · PERIODO 2 · MONEY MATH LAB — JUEGOS
   ===================================================================== */
const W_FREQ = { l: "Use frequency words", re: /\b(always|usually|often|sometimes|never|every (day|week|month)|once a|twice a)\b/i, ex: "always · usually · every month" };
const W_IFLOSE = { l: "If I choose…, I lose…", re: /\bif i (choose|buy|spend|take|save|pick)\b/i, ex: "If I choose…, I lose…" };
const W_WOULD = { l: "Use will or would", re: /\b(will|would|'ll|'d)\b/i, ex: "I will · I would" };
const W_COND1 = { l: "If + will (conditional 1)", re: /\bif\b[^.]*\b(will|'ll|won't)\b/i, ex: "If I pay…, I will…" };
const W_USEDTO = { l: "Use 'used to'", re: /\bused to\b/i, ex: "A lunch used to cost…" };
const fvSeries = (monthly, ea, years) => { const m = mFromEa(ea); let b = 0; const pts = [0]; for (let y = 1; y <= years; y++) { for (let k = 0; k < 12; k++) b = b * (1 + m) + monthly; pts.push(Math.round(b)); } return pts; };

/* ---------- C1 · Survive the Month · Page 07 ---------- */
const BUD_ITEMS = [
  { k: "home", l: "Contribution at home", e: "🏠", type: "need", mn: 200000, mx: 600000, v: 300000 },
  { k: "trans", l: "Transport", e: "🚌", type: "need", mn: 100000, mx: 300000, v: 180000 },
  { k: "food", l: "Food & snacks", e: "🥪", type: "need", mn: 150000, mx: 450000, v: 260000 },
  { k: "phone", l: "Phone plan", e: "📱", type: "need", mn: 30000, mx: 100000, v: 60000 },
  { k: "fun", l: "Going out & fun", e: "🎉", type: "want", mn: 0, mx: 400000, v: 200000 },
  { k: "shop", l: "Clothes & shopping", e: "👕", type: "want", mn: 0, mx: 400000, v: 150000 },
  { k: "save", l: "Savings (pay yourself first)", e: "🐷", type: "save", mn: 0, mx: 700000, v: 250000 },
];
const MONTH_EV = [
  { e: "👟", t: "Day 6 · Flash sale", d: "Sneakers you like: $350,000 (30% off).", opts: [{ t: "Buy them", cost: 350000, from: "free" }, { t: "Skip — not in my plan", cost: 0 }] },
  { e: "🎂", t: "Day 12 · Birthday dinner", d: "Your best friend's birthday dinner: $80,000.", opts: [{ t: "Go, it's in my fun budget", cost: 80000, from: "fun" }, { t: "Go and pay with my savings", cost: 80000, from: "save" }, { t: "Stay home", cost: 0 }] },
  { e: "🦷", t: "Day 18 · Emergency", d: "A broken phone screen: $150,000. You need the phone for work.", opts: [{ t: "Pay from my emergency savings", cost: 150000, from: "save" }, { t: "Pay with a credit card in 12 installments", cost: 150000, from: "debt" }] },
  { e: "📺", t: "Day 25 · New subscription", d: "A streaming service offers 'only $25,000 a month'.", opts: [{ t: "Subscribe (it's every month!)", cost: 25000, from: "free" }, { t: "No, I already have entertainment", cost: 0 }] },
];
function SurviveMonth({ existing, onSave, onExit }) {
  const [plan, setPlan] = useState(() => existing?.plan || Object.fromEntries(BUD_ITEMS.map((x) => [x.k, x.v])));
  const [stage, setStage] = useState("plan");
  const [ev, setEv] = useState(0);
  const [log, setLog] = useState([]);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const tot = (t) => BUD_ITEMS.filter((x) => x.type === t).reduce((a, x) => a + plan[x.k], 0);
  const needs = tot("need"), wants = tot("want"), save = tot("save");
  const free0 = INCOME18 - needs - wants - save;
  const extra = log.reduce((a, l) => { if (l.from === "free") a.free += l.cost; if (l.from === "fun") a.fun += l.cost; if (l.from === "save") a.save += l.cost; if (l.from === "debt") a.debt += l.cost; return a; }, { free: 0, fun: 0, save: 0, debt: 0 });
  const free = free0 - extra.free - Math.max(0, extra.fun - plan.fun);
  const saved = save - extra.save;
  const ok503020 = needs <= INCOME18 * 0.5 && wants <= INCOME18 * 0.3 && save >= INCOME18 * 0.2;
  const G = [W_FREQ, W_NUMBERS(2)];
  if (st.done) return <Reward title="Month survived! 🗓️" subtitle={`Saved ${cop(saved)} · ${free >= 0 ? "the month closed ✅" : "you ended in red ❌"}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Calendar size={22} strokeWidth={2.1} />} title="Survive the Month 🗓️ · Page 07" subtitle={`Future Me is 18 with a part-time job: ${cop(INCOME18)} a month (fictional). Can you reach day 30?`} onExit={onExit}>
      <Brief91 k="c1_month" />
      <FPBadge n={7} t="My income map" e="🗺️" />
      <Steps91 labels={["1 · Plan", "2 · Live the month", "3 · Results"]} at={stage === "plan" ? 0 : stage === "live" ? 1 : 2} />
      {stage === "plan" && (
        <>
          <HowTo>Move each line. Save <b>first</b>. Try to respect <b>50/30/20</b>: needs ≤ {cop(INCOME18 * 0.5)}, wants ≤ {cop(INCOME18 * 0.3)}, savings ≥ {cop(INCOME18 * 0.2)}. The money you don't assign stays "free" for surprises.</HowTo>
          <div className="g10-budget">{BUD_ITEMS.map((x) => <Ctl key={x.k} l={`${x.e} ${x.l}`} v={plan[x.k]} set={(v) => setPlan({ ...plan, [x.k]: v })} mn={x.mn} mx={x.mx} stp={10000} fmt={cop} />)}</div>
          <div className="g10-503020">
            <Gauge91 label={`Needs ${Math.round((needs / INCOME18) * 100)}%`} value={needs} max={INCOME18} target={INCOME18 * 0.5} targetLabel="50%" good={needs <= INCOME18 * 0.5} fmt={cop} />
            <Gauge91 label={`Wants ${Math.round((wants / INCOME18) * 100)}%`} value={wants} max={INCOME18} target={INCOME18 * 0.3} targetLabel="30%" good={wants <= INCOME18 * 0.3} fmt={cop} />
            <Gauge91 label={`Savings ${Math.round((save / INCOME18) * 100)}%`} value={save} max={INCOME18} target={INCOME18 * 0.2} targetLabel="20%" good={save >= INCOME18 * 0.2} fmt={cop} />
          </div>
          <div className="g91-mini"><span className={free0 >= 0 ? "pos" : "neg"}>Free money <b>{cop(free0)}</b></span><span className={ok503020 ? "pos" : ""}>50/30/20 <b>{ok503020 ? "✓" : "not yet"}</b></span></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={free0 < 0} onClick={() => setStage("live")}>{free0 < 0 ? "Your plan spends more than you earn" : "Live the month"} <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === "live" && (
        <div className="start-block g10-event">
          <div className="g10-event-head"><em>{MONTH_EV[ev].e}</em><div><b>{MONTH_EV[ev].t}</b><p>{MONTH_EV[ev].d}</p></div></div>
          <div className="g91-mini"><span className={free >= 0 ? "pos" : "neg"}>Free money <b>{cop(free)}</b></span><span>Savings <b>{cop(saved)}</b></span>{extra.debt > 0 && <span className="neg">Card debt <b>{cop(extra.debt)}</b></span>}</div>
          <div className="quiz-options">{MONTH_EV[ev].opts.map((o) => <button key={o.t} type="button" className="quiz-opt" onClick={() => { setLog([...log, { ev: MONTH_EV[ev].t, pick: o.t, cost: o.cost, from: o.from }]); if (ev < MONTH_EV.length - 1) setEv(ev + 1); else setStage("end"); }}><span className="opt-text">{o.t}{o.cost ? ` (${cop(o.cost)})` : ""}</span></button>)}</div>
        </div>
      )}
      {stage === "end" && (
        <>
          <div className="g10-stats"><div><small>💼 Income</small><b>{cop(INCOME18)}</b></div><div><small>🐷 Saved</small><b className="pos">{cop(saved)}</b></div><div><small>💵 Free at day 30</small><b className={free >= 0 ? "pos" : "neg"}>{cop(free)}</b></div><div><small>💳 New debt</small><b className={extra.debt ? "neg" : ""}>{cop(extra.debt)}</b></div></div>
          <div className={`p1-banner ${free >= 0 && !extra.debt ? "good" : "bad"}`}><span>{free >= 0 && !extra.debt ? "You reached day 30 with a plan. Your emergency savings worked!" : free < 0 ? "Your month closed in red: temptations ate your free money." : "You closed the month, but now you have card debt with interest."}</span></div>
          <div className="start-block"><h3>✍️ Page 07 · My income map</h3><p className="start-tip">Describe your money habits as Future Me (present simple + frequency words) with 2 numbers.</p><Starters items={["Every month I earn…", "I always save … first", "I usually spend…", "I never…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="Every month I earn $1,600,000. I always save…" /></div>
          <div className="start-foot"><button className="s1-btn ghost" onClick={() => { setStage("plan"); setEv(0); setLog([]); }}><RefreshCw size={15} /> Plan again</button><button className="s1-btn primary big" disabled={!goalsOk(text, 30, 80, G)} onClick={() => finish(26 + (free >= 0 ? 4 : 0) + (ok503020 ? 4 : 0), { income: INCOME18, plan, needs, wants, savePlan: save, saved, free, debt: extra.debt, log, ok503020, text })}>Save Page 07 <span className="coin-tag"><Coins size={15} /> +{26 + (free >= 0 ? 4 : 0) + (ok503020 ? 4 : 0)}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C1 · Spreadsheet Formula Rounds ---------- */
const SHEET_VIS = <MiniTable head={["", "A", "B"]} rows={[["1", "Income", "1,600,000"], ["2", "Transport", "180,000"], ["3", "Food", "260,000"], ["4", "Phone", "60,000"], ["5", "Fun", "200,000"], ["6", "Total expenses", "?"]]} />;
const SHEET_R = [
  { tag: "=SUM", q: "What does =SUM(B2:B5) show in B6?", visual: SHEET_VIS, answer: 700000, money: true, hint: "180,000 + 260,000 + 60,000 + 200,000", explain: "The four expenses add 700,000." },
  { tag: "Formula", q: "Which formula calculates 20% savings of the income?", visual: SHEET_VIS, options: ["=B1*20%", "=SUM(B1:B5)*20", "=B1+20%", "=B1/20"], correct: 0, explain: "Start with = and multiply the income cell by 20%." },
  { tag: "=B1-B6", q: "Free money = income − expenses. Result?", visual: SHEET_VIS, answer: 900000, money: true, hint: "1,600,000 − 700,000", explain: "=B1-B6 → 900,000." },
  { tag: "What if…", q: "Transport goes up to $240,000. What is the new total in B6?", answer: 760000, money: true, hint: "700,000 + 60,000", explain: "Change one cell, the formula updates: 760,000." },
  { tag: "%", q: "What % of the income is food ($260,000 of $1,600,000)?", answer: 16.25, unit: "%", tol: 0.1, hint: "=B3/B1", explain: "260,000 ÷ 1,600,000 = 16.25%." },
  { tag: "Goal", q: "A $1,200,000 laptop, saving $300,000 a month. How many months?", answer: 4, unit: "months", hint: "=1200000/300000", explain: "4 months." },
];

/* ---------- C2 · Choices Arcade ---------- */
const ARCADE = [
  { e: "🎮", a: "A new video game ($250,000)", b: "Save for a laptop ($250,000)", why: "fun now vs. a tool for study and work" },
  { e: "📚", a: "Saturday English course", b: "Saturday shift at work ($80,000)", why: "skills for the future vs. money today" },
  { e: "🍕", a: "Pizza with friends ($45,000)", b: "Three lunches at work", why: "a social moment vs. food for 3 days" },
  { e: "🛵", a: "Take a taxi to work ($25,000)", b: "Take the bus ($3,200) and arrive 20 min later", why: "time vs. money" },
  { e: "💤", a: "Sleep 8 hours before the exam", b: "Watch a series until 2 a.m.", why: "performance vs. entertainment" },
  { e: "🏦", a: "Put $500,000 in a CDT for one year", b: "Keep it in a savings account you can use any day", why: "a higher rate vs. liquidity" },
  { e: "👕", a: "Brand-name hoodie ($180,000)", b: "Similar hoodie ($70,000) + $110,000 saved", why: "brand vs. savings" },
  { e: "🎓", a: "Study a 5-year degree", b: "Start working full-time at 18", why: "future income vs. income now" },
];
function ChoicesArcade({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [q, setQ] = useState(null);
  const [log, setLog] = useState([]);
  const [order] = useState(() => ARCADE.map(() => shuffleArr([0, 1, 2])));
  const [st, finish] = useFinish(onSave);
  const r = ARCADE[i];
  const right = log.filter((x) => x.ok).length;
  if (st.done) return <Reward title="Arcade cleared! 🕹️" subtitle={`${right}/${ARCADE.length} opportunity costs identified`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  const lost = pick === "a" ? r.b : r.a; const chosen = pick === "a" ? r.a : r.b;
  const qOpts = [lost, chosen, "Nothing — every choice is free."];
  const done = log.length === ARCADE.length;
  return (
    <ActShell icon={<Shuffle size={22} strokeWidth={2.1} />} title="Choices Arcade 🕹️" subtitle="8 rounds of A or B. There's no wrong choice — but every choice has a cost." onExit={onExit}>
      <Brief91 k="c2_arcade" />
      {!done ? (
        <>
          <div className="p1-match-stats"><span>Round <b>{i + 1}/{ARCADE.length}</b></span><span>Correct costs <b>{right}</b></span></div>
          <div className="g10-ab"><button type="button" disabled={!!pick} className={pick === "a" ? "on" : ""} onClick={() => setPick("a")}><small>A</small><em>{r.e}</em><b>{r.a}</b></button><span>or</span><button type="button" disabled={!!pick} className={pick === "b" ? "on" : ""} onClick={() => setPick("b")}><small>B</small><em>{r.e}</em><b>{r.b}</b></button></div>
          {pick && (
            <div className="start-block">
              <p className="quiz-q">You chose: <b>{chosen}</b>. What is your opportunity cost?</p>
              <div className="quiz-options">{order[i].map((k) => <button key={k} type="button" disabled={q != null} className={`quiz-opt ${q === k ? (k === 0 ? "correct" : "wrong") : ""} ${q != null && k === 0 ? "correct" : ""}`} onClick={() => setQ(k)}><span className="opt-text">{qOpts[k]}</span></button>)}</div>
              {q != null && <div className={`p1-banner ${q === 0 ? "good" : "bad"}`}><span>🔀 The other path: <b>{lost}</b>. The trade-off here is {r.why}.</span></div>}
              {q != null && <div className="start-foot"><button className="s1-btn primary big" onClick={() => { setLog([...log, { round: i, pick, ok: q === 0 }]); setPick(null); setQ(null); setI(Math.min(i + 1, ARCADE.length - 1)); }}>{i < ARCADE.length - 1 ? "Next round" : "See results"} <ChevronRight size={18} /></button></div>}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="p1-banner good"><span>You identified <b>{right}/{ARCADE.length}</b> opportunity costs. Remember: the cost of a choice is the best thing you DIDN'T choose.</span></div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(14 + right * 2, { right, log })}>Finish <span className="coin-tag"><Coins size={15} /> +{14 + right * 2}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C2 · Time is Money ---------- */
const WAGE = 10000;
const HOURS_R = [
  { tag: "⏱️ $10,000 per hour", q: "Sneakers cost $350,000. How many hours of work?", answer: 35, unit: "hours", hint: "350,000 ÷ 10,000", explain: "35 hours = almost 9 four-hour shifts." },
  { tag: "⏱️", q: "A $25,000 subscription for 12 months. Hours of work per year?", answer: 30, unit: "hours", hint: "25,000 × 12 ÷ 10,000", explain: "300,000 a year = 30 hours of your life." },
  { tag: "⏱️", q: "A $6,000 snack every school day (20 days). Hours per month?", answer: 12, unit: "hours", hint: "6,000 × 20 ÷ 10,000", explain: "120,000 = 12 hours every month." },
  { tag: "⏱️", q: "A $1,200,000 phone. How many hours?", answer: 120, unit: "hours", hint: "1,200,000 ÷ 10,000", explain: "120 hours = 30 shifts of 4 hours." },
  { tag: "🧠 Decide", q: "Which purchase costs the MOST hours in a year?", options: ["A $6,000 daily snack (20 days/month).", "A $350,000 pair of sneakers.", "A $25,000 monthly subscription.", "An $80,000 dinner, once."], correct: 0, explain: "6,000 × 20 × 12 = 1,440,000 → 144 hours!" },
];

/* ---------- C2 · My Biggest Trade-off · Page 08 (SMART) ---------- */
const SMART = [["s", "S · Specific", "What exactly?", "Buy a laptop for my programming course"], ["m", "M · Measurable", "How much?", "$1,200,000"], ["a", "A · Achievable", "How will I do it?", "Saving $300,000 a month"], ["r", "R · Relevant", "Why does it matter?", "I need it to study"], ["t", "T · Time-bound", "When?", "In 4 months, by June"]];
function TradeoffPage({ existing, onSave, onExit }) {
  const [g, setG] = useState(existing?.smart || {});
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const Gw = [W_IFLOSE, W_REASON];
  const ok = SMART.every(([k]) => countWords(g[k]) >= 2) && /\d/.test(g.m || "") && goalsOk(text, 30, 80, Gw);
  if (st.done) return <Reward title="Trade-off written! ⚖️" subtitle="Page 08 saved." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Scale size={22} strokeWidth={2.1} />} title="My Biggest Trade-off ⚖️ · Page 08" subtitle="A SMART goal for Future Me — and what you will give up to reach it." onExit={onExit}>
      <Brief91 k="c2_page" />
      <FPBadge n={8} t="My biggest trade-off" e="⚖️" />
      <div className="g10-smart">{SMART.map(([k, l, q, ph]) => <label key={k} className={countWords(g[k]) >= 2 ? "on" : ""}><b>{l}</b><small>{q}</small><input className="start-input" value={g[k] || ""} onChange={(e) => setG({ ...g, [k]: e.target.value })} placeholder={ph} /></label>)}</div>
      {SMART.every(([k]) => g[k]) && <div className="p1-banner good"><span>🎯 My SMART goal: <b>{g.s}</b> — {g.m}, {lowFirst(g.a)}, because {lowFirst(g.r)}, {lowFirst(g.t)}.</span></div>}
      <div className="start-block"><h3>✍️ Page 08 · If I choose…, I lose…</h3><Starters items={["If I choose…, I lose…", "My opportunity cost is…", "It's worth it because…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={30} max={80} goals={Gw} placeholder="If I choose to save for my laptop, I lose…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(28, { smart: g, text })}>Save Page 08 <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}

/* ---------- C3 · Today or Tomorrow? ---------- */
const TODAY_R = [
  { tag: "⏳ 12% available", q: "$1,000,000 today or $1,100,000 in one year? You can get 12% E.A.", options: ["Today (it becomes $1,120,000).", "In one year: $1,100,000 is more.", "It's exactly the same.", "In one year, because waiting is safer."], correct: 0, explain: "1,000,000 × 1.12 = 1,120,000 > 1,100,000." },
  { tag: "⏳ 6% available", q: "Same offer, but your best option pays 6% E.A.", options: ["Wait for $1,100,000.", "Take it today: money today is always better.", "It's exactly the same.", "Take it today and invest it at 6%."], correct: 0, explain: "1,000,000 × 1.06 = 1,060,000 < 1,100,000." },
  { tag: "🧮 Future value", q: "$500,000 at 8% E.A. for 2 years. Future value?", answer: 583200, money: true, hint: "500,000 × 1.08 × 1.08", explain: "500,000 × 1.1664 = 583,200." },
  { tag: "🧮 Present value", q: "You will receive $2,420,000 in 2 years. With 10%, what is it worth today?", answer: 2000000, money: true, hint: "2,420,000 ÷ 1.21", explain: "2,420,000 ÷ 1.1² = 2,000,000." },
  { tag: "🫧 Real value", q: "Your money grows 5% but inflation is 9%. What happens?", options: ["You lose about 4% of purchasing power.", "You win 14%: interest plus inflation.", "You win 5%, inflation doesn't matter.", "Nothing changes in real terms."], correct: 0, explain: "Real ≈ 5% − 9% = −4%." },
];

/* ---------- C3 · PV/FV Machine (máquina del tiempo) ---------- */
function PVFVMachine({ existing, onSave, onExit }) {
  const [mode, setMode] = useState("fv");
  const [amt, setAmt] = useState(1000000);
  const [rate, setRate] = useState(10);
  const [yrs, setYrs] = useState(3);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const r = rate / 100;
  const res = mode === "fv" ? fvA(amt, r, yrs) : pvA(amt, r, yrs);
  const rows = Array.from({ length: yrs + 1 }, (_, k) => (mode === "fv" ? fvA(amt, r, k) : pvA(amt, r, yrs - k)));
  const G = [W_WOULD, W_NUMBERS(2)];
  if (st.done) return <Reward title="Time traveler! ⏳" subtitle="You can move money through time." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Hourglass size={22} strokeWidth={2.1} />} title="Time Traveler · PV/FV Machine ⏳" subtitle="Travel forward (future value) or backward (present value). See every year." onExit={onExit}>
      <Brief91 k="c3_machine" />
      <Tri value={mode} onPick={setMode} opts={[["fv", "➡️ Travel to the future (FV)"], ["pv", "⬅️ Bring it to today (PV)"]]} />
      <div className="g10-two">
        <div className="start-block">
          <Ctl l={mode === "fv" ? "Money today" : "Money in the future"} v={amt} set={setAmt} mn={100000} mx={10000000} stp={100000} fmt={cop} />
          <Ctl l="Rate E.A." v={rate} set={setRate} mn={1} mx={20} stp={0.5} fmt={(v) => `${v}%`} />
          <Ctl l="Years" v={yrs} set={setYrs} mn={1} mx={10} fmt={(v) => `${v} y`} />
          <div className="g10-formula">{mode === "fv" ? <>FV = {cop(amt)} × (1 + {rate}%)<sup>{yrs}</sup> = <b>{cop(res)}</b></> : <>PV = {cop(amt)} ÷ (1 + {rate}%)<sup>{yrs}</sup> = <b>{cop(res)}</b></>}</div>
        </div>
        <ChartCard title={mode === "fv" ? "Your money traveling forward" : "The value of that future money, year by year"}><LineChart labels={rows.map((_, k) => (mode === "fv" ? `Y${k}` : `Y${k}`))} series={[{ name: "Value", values: rows.map((v) => Math.round(v)), color: mode === "fv" ? "#16b074" : "#f5b23e" }]} /></ChartCard>
      </div>
      <MiniTable head={["Year", "Value", "Interest that year"]} rows={rows.map((v, k) => [`${k}`, cop(v), k === 0 ? "—" : cop(v - rows[k - 1])])} />
      <p className="start-tip">💡 Look at the last column: the interest grows every year. That's compounding.</p>
      <div className="start-block"><h3>✍️ Today or tomorrow? (will vs. would)</h3><p className="start-tip">Your aunt offers $1,000,000 today or $1,150,000 in 2 years. Use the machine with YOUR rate and explain your decision.</p><Starters items={["I will take…", "If I waited, I would…", "With a rate of …%, the money would…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={25} max={70} goals={G} placeholder="I will take the money today because with 10% it would become…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(text, 25, 70, G)} onClick={() => finish(28, { mode, amount: amt, rate, years: yrs, result: Math.round(res), text })}>Save my decision <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}
const PVFV_R = [
  { tag: "FV", q: "$800,000 at 9% for 1 year?", answer: 872000, money: true, hint: "800,000 × 1.09", explain: "872,000." },
  { tag: "FV", q: "$1,000,000 at 12% for 2 years?", answer: 1254400, money: true, hint: "1,000,000 × 1.12²", explain: "1,000,000 × 1.2544." },
  { tag: "PV", q: "$1,100,000 in 1 year at 10%. Value today?", answer: 1000000, money: true, hint: "1,100,000 ÷ 1.1", explain: "1,000,000." },
  { tag: "PV", q: "$1,331,000 in 3 years at 10%. Value today?", answer: 1000000, money: true, hint: "÷ 1.331", explain: "1,000,000." },
  { tag: "Think", q: "If the rate goes UP, the PV of a future amount…", options: ["goes down.", "goes up.", "stays the same.", "doubles."], correct: 0, explain: "You divide by a bigger number → a smaller PV." },
];

/* ---------- C4 · Interest Battle (simple vs. compuesto) ---------- */
function InterestBattle({ onSave, onExit }) {
  const [cap, setCap] = useState(1000000);
  const [rate, setRate] = useState(10);
  const [yrs, setYrs] = useState(30);
  const [add, setAdd] = useState(0);
  const [boss, setBoss] = useState(null);
  const [st, finish] = useFinish(onSave);
  const r = rate / 100;
  const simple = [], comp = [];
  let c = cap;
  for (let y = 0; y <= yrs; y++) { simple.push(Math.round(cap * (1 + r * y) + add * 12 * y)); if (y > 0) c = c * (1 + r) + add * 12; comp.push(Math.round(c)); }
  const step = Math.max(1, Math.round(yrs / 10));
  const idx = simple.map((_, k) => k).filter((k) => k % step === 0 || k === yrs);
  const A = Math.round(5000000 * (1 + 0.12 * 10)), B = Math.round(5000000 * Math.pow(1.1, 10));
  if (st.done) return <Reward title="Battle won! ⚔️" subtitle="Compound interest is a slow superpower." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Swords size={22} strokeWidth={2.1} />} title="The Interest Battle ⚔️" subtitle="Player A earns simple interest. Player B earns compound interest. Same money, same rate." onExit={onExit}>
      <Brief91 k="c4_race" />
      <div className="g10-two">
        <div className="start-block">
          <Ctl l="Starting money" v={cap} set={setCap} mn={100000} mx={5000000} stp={100000} fmt={cop} />
          <Ctl l="Rate" v={rate} set={setRate} mn={1} mx={15} fmt={(v) => `${v}%`} />
          <Ctl l="Years" v={yrs} set={setYrs} mn={5} mx={40} fmt={(v) => `${v} y`} />
          <Ctl l="Extra each month" v={add} set={setAdd} mn={0} mx={300000} stp={10000} fmt={cop} />
          <div className="g10-vsbar"><div><small>🅰️ Simple</small><b>{cop(simple[yrs])}</b></div><div className="b"><small>🅱️ Compound</small><b>{cop(comp[yrs])}</b></div></div>
          <div className="g91-mini"><span className="pos">B wins by <b>{cop(comp[yrs] - simple[yrs])}</b></span><span>Rule of 72: doubles every <b>{(72 / rate).toFixed(1)} years</b></span></div>
        </div>
        <ChartCard title="30 years of battle" legend={[{ name: "Simple", color: "#f5b23e" }, { name: "Compound", color: "#16b074" }]}><LineChart labels={idx.map((k) => `Y${k}`)} series={[{ name: "Simple", values: idx.map((k) => simple[k]), color: "#f5b23e" }, { name: "Compound", values: idx.map((k) => comp[k]), color: "#16b074" }]} /></ChartCard>
      </div>
      <div className="start-block g10-boss">
        <h3>👾 Boss mode · The bank's 'amazing' offer</h3>
        <p>You have $5,000,000 for 10 years. <b>Offer A:</b> “12% simple interest per year!” <b>Offer B:</b> “10% E.A. compound”. Which gives you more?</p>
        <div className="quiz-options">{[["A", `Offer A: ${cop(A)}`], ["B", `Offer B: ${cop(B)}`]].map(([k, t]) => <button key={k} type="button" disabled={!!boss} className={`quiz-opt ${boss === k ? (k === "A" ? "correct" : "wrong") : ""}`} onClick={() => setBoss(k)}><span className="opt-text">{boss ? t : `Offer ${k}`}</span></button>)}</div>
        {boss && <p className={`g91-note ${boss === "A" ? "pos" : "neg"}`}>{boss === "A" ? "✅" : "❌"} A: 5,000,000 × (1 + 0.12 × 10) = {cop(A)}. B: 5,000,000 × 1.1¹⁰ = {cop(B)}. Here the higher simple rate wins — but extend it to 20 years and compound wins. Always calculate!</p>}
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!boss} onClick={() => finish(24 + (boss === "A" ? 6 : 0), { cap, rate, yrs, add, simple: simple[yrs], comp: comp[yrs], boss })}>Finish the battle <span className="coin-tag"><Coins size={15} /> +{24 + (boss === "A" ? 6 : 0)}</span></button></div>
    </ActShell>
  );
}
const INT_R = [
  { tag: "Simple", q: "$2,000,000 at 8% SIMPLE for 3 years. Total?", answer: 2480000, money: true, hint: "2,000,000 × (1 + 0.08 × 3)", explain: "2,000,000 × 1.24 = 2,480,000." },
  { tag: "Compound", q: "$2,000,000 at 8% COMPOUND for 3 years. Total?", answer: 2519424, money: true, tol: 5, hint: "2,000,000 × 1.08³", explain: "2,000,000 × 1.259712 = 2,519,424." },
  { tag: "Rule of 72", q: "At 6%, how many years to double?", answer: 12, unit: "years", hint: "72 ÷ 6", explain: "12 years." },
  { tag: "Rule of 72", q: "You want to double your money in 8 years. Rate needed?", answer: 9, unit: "%", hint: "72 ÷ 8", explain: "9% per year." },
  { tag: "Shape", q: "Which graph shows compound interest?", options: ["A curve that bends upward.", "A straight line that climbs the same every year.", "A line that rises fast, then goes flat.", "Stairs: equal steps up every year."], correct: 0, explain: "Exponential growth curves upward." },
];

/* ---------- C4 · My Growth Chart · Page 09 ---------- */
function GrowthPage({ resp, existing, onSave, onExit }) {
  const base = resp?.c1_month?.saved || 250000;
  const [m, setM] = useState(existing?.monthly || Math.min(700000, Math.max(50000, Math.round(base / 10000) * 10000)));
  const [ea, setEa] = useState(existing?.rate || 9);
  const [yrs, setYrs] = useState(existing?.years || 10);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const series = fvSeries(m, ea / 100, yrs);
  const put = m * 12 * yrs;
  const fv = series[series.length - 1];
  const G = [W_COMPARE, W_NUMBERS(2)];
  if (st.done) return <Reward title="Growth chart saved! 📈" subtitle={`${cop(fv)} in ${yrs} years`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<LineIcon size={22} strokeWidth={2.1} />} title="My Growth Chart 📈 · Page 09" subtitle="Project YOUR monthly savings with compound interest." onExit={onExit}>
      <Brief91 k="c4_page" />
      <FPBadge n={9} t="My growth chart" e="📈" />
      {resp?.c1_month && <p className="start-tip">💡 In Survive the Month you saved {cop(resp.c1_month.saved)}. We start from there.</p>}
      <div className="g10-two">
        <div className="start-block">
          <Ctl l="I save every month" v={m} set={setM} mn={50000} mx={700000} stp={10000} fmt={cop} />
          <Ctl l="Rate E.A." v={ea} set={setEa} mn={2} mx={14} stp={0.5} fmt={(v) => `${v}%`} />
          <Ctl l="Years" v={yrs} set={setYrs} mn={1} mx={30} fmt={(v) => `${v} y`} />
          <div className="g10-stats"><div><small>💵 I put in</small><b>{cop(put)}</b></div><div><small>✨ Interest earned</small><b className="pos">{cop(fv - put)}</b></div><div><small>🏁 Final</small><b>{cop(fv)}</b></div></div>
        </div>
        <ChartCard title="My money vs. the money I put in" legend={[{ name: "With interest", color: "#16b074" }, { name: "Only my deposits", color: "#f5b23e" }]}><LineChart labels={series.map((_, k) => `Y${k}`)} series={[{ name: "With interest", values: series, color: "#16b074" }, { name: "Deposits", values: series.map((_, k) => m * 12 * k), color: "#f5b23e" }]} /></ChartCard>
      </div>
      <div className="start-block"><h3>✍️ Page 09 · My growth chart</h3><Starters items={["After … years, I will have…", "The interest is bigger than…", "Starting earlier is better than…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={25} max={70} goals={G} placeholder="If I save $250,000 every month at 9%, after 10 years I will have… That's more than…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(text, 25, 70, G)} onClick={() => finish(28, { monthly: m, rate: ea, years: yrs, put, fv, text })}>Save Page 09 <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}

/* ---------- C5 · Rate Translator ---------- */
function RateTranslator({ onSave, onExit }) {
  const [mm, setMm] = useState(1);
  const [ea, setEa] = useState(12);
  const [stage, setStage] = useState(0);
  const [st, finish] = useFinish(onSave);
  const rounds = [
    { tag: "Monthly → E.A.", q: "0.8% monthly = ?% E.A. (2 decimals)", answer: 10.03, unit: "%", tol: 0.05, hint: "(1.008)^12 − 1", explain: "10.03% E.A." },
    { tag: "Monthly → E.A.", q: "1.5% monthly = ?% E.A.", answer: 19.56, unit: "%", tol: 0.05, hint: "(1.015)^12 − 1", explain: "19.56% E.A." },
    { tag: "E.A. → monthly", q: "10% E.A. = ?% monthly", answer: 0.8, unit: "%", tol: 0.01, hint: "(1.10)^(1/12) − 1", explain: "0.797% ≈ 0.80% monthly." },
    { tag: "E.A. → monthly", q: "26.82% E.A. = ?% monthly", answer: 2, unit: "%", tol: 0.02, hint: "(1.2682)^(1/12) − 1", explain: "2% monthly — a typical card rate." },
    { tag: "Compare", q: "For saving: 0.9% monthly or 11% E.A.?", options: ["0.9% monthly (about 11.35% E.A.).", "11% E.A., it already includes twelve months.", "They are exactly equal.", "11% E.A., because annual rates are bigger."], correct: 0, explain: "(1.009)^12 − 1 = 11.35% > 11%." },
  ];
  if (st.done) return <Reward title="Rate translator! 🔁" subtitle="You speak the language of banks." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Percent size={22} strokeWidth={2.1} />} title="Rate Translator 🔁" subtitle="Translate any rate into E.A. — the only fair way to compare." onExit={onExit}>
      <Brief91 k="c5_translator" />
      {stage === 0 ? (
        <>
          <div className="g10-two">
            <div className="start-block"><h3>Monthly ➜ E.A.</h3><Ctl l="Monthly" v={mm} set={setMm} mn={0.1} mx={3} stp={0.1} fmt={(v) => `${v}%`} /><div className="g10-formula">(1 + {mm}%)<sup>12</sup> − 1 = <b>{pm(eaFromM(mm / 100))}</b> E.A.</div><p className="start-tip">× 12 would say {(mm * 12).toFixed(1)}% — the difference is compounding.</p></div>
            <div className="start-block"><h3>E.A. ➜ Monthly</h3><Ctl l="E.A." v={ea} set={setEa} mn={1} mx={40} stp={0.5} fmt={(v) => `${v}%`} /><div className="g10-formula">(1 + {ea}%)<sup>1/12</sup> − 1 = <b>{pm(mFromEa(ea / 100), 3)}</b> monthly</div></div>
          </div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(1)}>Translation challenge (5) <ChevronRight size={18} /></button></div>
        </>
      ) : <RoundsRunner rounds={rounds} doneLabel="Finish" onDone={(r) => finish(14 + r.firstTry * 3, { firstTry: r.firstTry })} />}
    </ActShell>
  );
}

/* ---------- C5 · Bank Ads Detective ---------- */
const ADS = [
  { k: "A", e: "🏦", bank: "Banco Andino", ad: "Savings account: 1% MONTHLY!", m: 0.01, cond: "Monthly fee $12,000 if your balance is under $5,000,000." },
  { k: "B", e: "🟢", bank: "NeoBank Verde", ad: "Cajita: 11% E.A. Withdraw any day.", ea: 0.11, cond: "No fees. 100% digital." },
  { k: "C", e: "📜", bank: "Cooperativa Futuro", ad: "CDT 360 days: 12.5% E.A.", ea: 0.125, cond: "Locked for 360 days. Early exit: not allowed." },
  { k: "D", e: "💜", bank: "Banca Joven", ad: "0.85% per month, guaranteed!", m: 0.0085, cond: "Only for the first 3 months. Then 0.3% monthly." },
  { k: "E", e: "⭐", bank: "SuperBank", ad: "Up to 15% E.A.!!!", ea: 0.15, cond: "Only on balances over $100,000,000." },
];
function BankDetective({ onSave, onExit }) {
  const [pick, setPick] = useState(null);
  const [seen, setSeen] = useState({});
  const [st, finish] = useFinish(onSave);
  const eaOf = (a) => (a.ea != null ? a.ea : eaFromM(a.m));
  const allSeen = ADS.every((a) => seen[a.k]);
  const good = pick === "B";
  if (st.done) return <Reward title="Case closed! 🕵️" subtitle={good ? "You found the best real option." : "Read the small letters next time!"} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Bank Ads Detective 🕵️" subtitle="Valentina has $2,000,000 for one year and may need part of it in an emergency. Which ad is REALLY best?" onExit={onExit}>
      <Brief91 k="c5_detective" />
      <div className="g10-ads">{ADS.map((a) => <button key={a.k} type="button" className={`${seen[a.k] ? "open" : ""} ${pick === a.k ? "on" : ""}`} onClick={() => setSeen({ ...seen, [a.k]: true })}><em>{a.e}</em><small>{a.bank}</small><b>{a.ad}</b>{seen[a.k] ? <><span>🔁 E.A. = <strong>{pm(eaOf(a))}</strong></span><i>📄 Small letters: {a.cond}</i></> : <span className="tap">Tap to investigate</span>}</button>)}</div>
      {allSeen && (
        <div className="start-block">
          <p className="quiz-q">Valentina's goal: 1 year, $2,000,000, and she might need money for an emergency. Choose the best ad:</p>
          <div className="quiz-options">{ADS.map((a) => <button key={a.k} type="button" disabled={!!pick} className={`quiz-opt ${pick === a.k ? (a.k === "B" ? "correct" : "wrong") : ""} ${pick && a.k === "B" ? "correct" : ""}`} onClick={() => setPick(a.k)}><span className="opt-key">{a.k}</span><span className="opt-text">{a.bank}: {pm(eaOf(a))} E.A.</span></button>)}</div>
          {pick && <p className={`g91-note ${good ? "pos" : "neg"}`}>{good ? "✅ " : "❌ "}A has a fee (her balance is under $5M). C is locked (no emergencies). D drops after 3 months. E needs $100M. B: 11% E.A., no fees and liquidity — the best match for HER goal.</p>}
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!pick} onClick={() => finish(good ? 30 : 18, { pick, good })}>{pick ? "Close the case" : allSeen ? "Choose an ad" : "Investigate the 5 ads"} <span className="coin-tag"><Coins size={15} /> +{good ? 30 : 18}</span></button></div>
    </ActShell>
  );
}

/* ---------- C6 · Loan Lab (tabla de amortización + abono extra) ---------- */
const amortTable = (P, r, n, extraAt, extra, mode) => {
  let bal = P; let q = pmt(P, r, n); const rows = []; let k = 0; let tot = 0;
  while (bal > 1 && k < 400) {
    k++; const it = bal * r; let cap = Math.min(bal, q - it); bal -= cap; tot += it + cap;
    if (extraAt && k === extraAt && extra) { const e = Math.min(extra, bal); bal -= e; tot += e; if (mode === "pay" && bal > 1) q = pmt(bal, r, n - k); }
    rows.push({ k, pay: it + cap, it, cap, bal: Math.max(0, bal) });
  }
  return { rows, total: tot, months: k, q: pmt(P, r, n) };
};
function LoanLab({ onSave, onExit }) {
  const [P, setP] = useState(3000000);
  const [n, setN] = useState(24);
  const [shown, setShown] = useState(1);
  const [mode, setMode] = useState(null);
  const [st, finish] = useFinish(onSave);
  const r = 0.018;
  const base = amortTable(P, r, n);
  const term = amortTable(P, r, n, 6, 1000000, "term");
  const pay = amortTable(P, r, n, 6, 1000000, "pay");
  const vis = base.rows.slice(0, shown);
  if (st.done) return <Reward title="Loan mastered! 🏦" subtitle="You know where every peso of your payment goes." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Landmark size={22} strokeWidth={2.1} />} title="Loan Lab 🏦" subtitle="Future Me needs a loan for a programming bootcamp. Rate: 1.8% monthly (about 23.9% E.A.)." onExit={onExit}>
      <Brief91 k="c6_loan" />
      <div className="g10-two">
        <div className="start-block">
          <Ctl l="Loan" v={P} set={(v) => { setP(v); setShown(1); }} mn={1000000} mx={6000000} stp={250000} fmt={cop} />
          <Ctl l="Months" v={n} set={(v) => { setN(v); setShown(1); }} mn={6} mx={48} stp={6} fmt={(v) => `${v} m`} />
          <div className="g10-stats"><div><small>💳 Monthly payment</small><b>{cop(base.q)}</b></div><div><small>💸 Total paid</small><b>{cop(base.total)}</b></div><div><small>🔥 Total interest</small><b className="neg">{cop(base.total - P)}</b></div></div>
        </div>
        <ChartCard title="Each payment: interest vs. capital" legend={[{ name: "Interest", color: "#ff6b57" }, { name: "Capital", color: "#16b074" }]}><div className="g10-amort">{base.rows.map((x) => <div key={x.k} title={`Month ${x.k}`}><i className="it" style={{ height: `${(x.it / base.q) * 100}%` }} /><i className="cp" style={{ height: `${(x.cap / base.q) * 100}%` }} /></div>)}</div></ChartCard>
      </div>
      <div className="start-block">
        <h3>📋 Pay month by month</h3>
        <MiniTable head={["Month", "Payment", "Interest", "Capital", "Balance"]} rows={vis.map((x) => [x.k, cop(x.pay), cop(x.it), cop(x.cap), cop(x.bal)])} />
        <div className="p3-card-actions"><button className="s1-btn ghost" disabled={shown >= base.rows.length} onClick={() => setShown(Math.min(base.rows.length, shown + 1))}>Pay next month</button><button className="s1-btn ghost" disabled={shown >= 6} onClick={() => setShown(6)}>Pay 6 months</button></div>
        {shown >= 2 && <p className="start-tip">💡 Month 1 interest = balance × 1.8% = {cop(P * r)}. As the balance falls, interest falls and capital grows.</p>}
      </div>
      {shown >= 6 && (
        <div className="start-block g10-boss">
          <h3>🎁 Month 6: you receive a $1,000,000 bonus and pay it to capital. What do you prefer?</h3>
          <div className="g10-ab"><button type="button" className={mode === "term" ? "on" : ""} onClick={() => setMode("term")}><small>OPTION 1</small><b>Reduce the TERM</b><span>Same payment · finish in {term.months} months</span><span>Total interest {cop(term.total - P)}</span></button><span>or</span><button type="button" className={mode === "pay" ? "on" : ""} onClick={() => setMode("pay")}><small>OPTION 2</small><b>Reduce the PAYMENT</b><span>New payment {cop(pmt(Math.max(1, (base.rows[5]?.bal || 0) - 1000000), r, n - 6))} · same months</span><span>Total interest {cop(pay.total - P)}</span></button></div>
          {mode && <p className="g91-note pos">💡 Reducing the term saves {cop(pay.total - term.total)} more in interest. Reducing the payment gives you breathing room every month. Both are better than spending the bonus!</p>}
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!mode} onClick={() => finish(30, { P, n, payment: Math.round(base.q), total: Math.round(base.total), interest: Math.round(base.total - P), choice: mode })}>{mode ? "Save my loan analysis" : "Pay 6 months and choose"} <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- C6 · 1 vs. 36 installments + pago mínimo ---------- */
function Installments({ onSave, onExit }) {
  const [guess, setGuess] = useState(null);
  const [st, finish] = useFinish(onSave);
  const P = 1200000, r = 0.02;
  const opts = [1, 6, 12, 24, 36].map((n) => { const q = n === 1 ? P : pmt(P, r, n); return { n, q, tot: q * n }; });
  const minSim = (() => { let b = P, k = 0, it = 0; while (b > 1000 && k < 600) { const i = b * r; const pay = Math.max(30000, i + b * 0.01); it += i; b = b + i - pay; k++; } return { months: k, interest: it }; })();
  const fixSim = (() => { let b = P, k = 0, it = 0; while (b > 1 && k < 600) { const i = b * r; it += i; b = b + i - 120000; k++; } return { months: k, interest: it }; })();
  if (st.done) return <Reward title="Trap avoided! 💳" subtitle="Installments and minimums have a price." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<CreditCard size={22} strokeWidth={2.1} />} title="1 vs. 36 Installments 💳" subtitle="A $1,200,000 phone on a credit card at 2% monthly (26.8% E.A.)." onExit={onExit}>
      <Brief91 k="c6_cuotas" />
      <p className="quiz-q">Before you look: how much MORE do you pay in 36 installments than in 1?</p>
      <div className="quiz-options">{["About $50,000", "About $200,000", "About $500,000"].map((t, k) => <button key={t} type="button" disabled={guess != null} className={`quiz-opt ${guess === k ? (k === 2 ? "correct" : "wrong") : ""} ${guess != null && k === 2 ? "correct" : ""}`} onClick={() => setGuess(k)}><span className="opt-text">{t}</span></button>)}</div>
      {guess != null && (
        <>
          <MiniTable head={["Installments", "Monthly payment", "Total paid", "Extra cost"]} rows={opts.map((o) => [o.n, cop(o.q), cop(o.tot), o.n === 1 ? "$0 (usually no interest)" : cop(o.tot - P)])} />
          <div className="g10-bars">{opts.map((o) => <div key={o.n}><span>{o.n}×</span><div><i style={{ width: `${(o.tot / opts[4].tot) * 100}%`, background: o.n === 1 ? "#16b074" : o.n >= 24 ? "#ff6b57" : "#f5b23e" }} /></div><b>{cop(o.tot)}</b></div>)}</div>
          <div className="start-block g10-boss">
            <h3>😈 Extreme mode · Paying only the minimum</h3>
            <p>Same $1,200,000 debt. Minimum = interest + 1% of the balance (at least $30,000).</p>
            <div className="g10-stats"><div><small>🐌 Only the minimum</small><b className="neg">{Math.round(minSim.months / 12 * 10) / 10} years</b><span className="g10-sub">interest {cop(minSim.interest)}</span></div><div><small>🚀 Fixed $120,000/month</small><b className="pos">{fixSim.months} months</b><span className="g10-sub">interest {cop(fixSim.interest)}</span></div></div>
          </div>
          <PickOne q="What is the smartest way to use a credit card?" options={["Pay the full balance in 1 installment, every month.", "Use 36 installments so the payment is small.", "Pay the minimum and save the rest.", "Pay in 12 installments to build credit faster."]} correct={0} explain="1 installment usually has no interest. Long installments and minimums make you pay much more." />
        </>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={guess == null} onClick={() => finish(26, { guess, extra36: Math.round(opts[4].tot - P), minYears: Math.round(minSim.months / 12 * 10) / 10 })}>Finish <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
    </ActShell>
  );
}

/* ---------- C6 · My Loan Decision · Page 10 ---------- */
const LOAN_OFFERS = [
  { k: "bank", e: "🏦", l: "Bank loan", d: "$3,000,000 · 24 months · 1.5% monthly", P: 3000000, r: 0.015, n: 24 },
  { k: "card", e: "💳", l: "Credit card", d: "$3,000,000 · 36 installments · 2.2% monthly", P: 3000000, r: 0.022, n: 36 },
  { k: "app", e: "📲", l: "Fast app loan", d: "$3,000,000 · 12 months · 4% monthly · approved in 5 min", P: 3000000, r: 0.04, n: 12 },
];
function LoanPage({ existing, onSave, onExit }) {
  const [pick, setPick] = useState(existing?.pick || "");
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const G = [W_COND1, W_RISK];
  const calc = LOAN_OFFERS.map((o) => { const q = pmt(o.P, o.r, o.n); return { ...o, q, tot: q * o.n, ea: eaFromM(o.r) }; });
  const best = calc.slice().sort((a, b) => a.tot - b.tot)[0];
  const ch = calc.find((c) => c.k === pick);
  if (st.done) return <Reward title="Loan decision saved! 📝" subtitle="Page 10 is in your portfolio." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<FileText size={22} strokeWidth={2.1} />} title="My Loan Decision 📝 · Page 10" subtitle="Future Me needs $3,000,000 for a bootcamp. Three offers. Compare the TOTAL cost." onExit={onExit}>
      <Brief91 k="c6_page" />
      <FPBadge n={10} t="My loan decision" e="📝" />
      <div className="g10-ads">{calc.map((o) => <button key={o.k} type="button" className={`open ${pick === o.k ? "on" : ""}`} onClick={() => setPick(o.k)}><em>{o.e}</em><small>{o.l}</small><b>{o.d}</b><span>Payment <strong>{cop(o.q)}</strong> · E.A. {pm(o.ea, 1)}</span><i>Total {cop(o.tot)} · interest {cop(o.tot - o.P)}</i></button>)}</div>
      {ch && <div className={`p1-banner ${ch.k === best.k ? "good" : "bad"}`}><span>{ch.k === best.k ? "✅ The cheapest total cost." : `⚠️ ${ch.l} costs ${cop(ch.tot - best.tot)} more than ${best.l}.`} {ch.k === "app" ? "Fast approval is not a reason: 4% monthly is about 60% E.A.!" : ""}</span></div>}
      <div className="start-block"><h3>✍️ Page 10 · My loan decision</h3><Starters items={["If I take the…, I will pay…", "The risk is…", "I won't take the app loan because…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="If I take the bank loan, I will pay… The risk is…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!pick || !goalsOk(text, 30, 80, G)} onClick={() => finish(pick === best.k ? 30 : 22, { pick, payment: Math.round(ch.q), total: Math.round(ch.tot), best: best.k, text })}>Save Page 10 <span className="coin-tag"><Coins size={15} /> +{pick === best.k ? 30 : 22}</span></button></div>
    </ActShell>
  );
}

/* ---------- C7 · Inflation Apocalypse ---------- */
const APOC_ITEMS = [{ e: "🍚", l: "Rice 5 kg", p: 25000 }, { e: "🥚", l: "30 eggs", p: 18000 }, { e: "🚌", l: "40 bus tickets", p: 128000 }, { e: "🥛", l: "Milk 6 L", p: 27000 }, { e: "🍗", l: "Chicken 3 kg", p: 45000 }];
const APOC_BASKET = APOC_ITEMS.reduce((a, x) => a + x.p, 0);
const APOC_R = [
  { e: "🛢️", t: "Oil prices jump", infl: 0.04, fund: 0.03 },
  { e: "🌾", t: "A drought hits farms: food prices rise", infl: 0.06, fund: -0.05 },
  { e: "💱", t: "The peso devalues: imports get expensive", infl: 0.05, fund: 0.08 },
  { e: "🏛️", t: "The central bank raises rates", infl: 0.02, fund: 0.02 },
  { e: "😌", t: "Inflation slows down", infl: 0.01, fund: 0.06 },
];
const APOC_OPTS = [{ k: "cash", e: "💵", l: "Cash at home", g: () => 0 }, { k: "sav", e: "🏦", l: "Savings 4% E.A.", g: () => 0.01 }, { k: "cdt", e: "📜", l: "CDT 11% E.A.", g: () => 0.026 }, { k: "fund", e: "📈", l: "Investment fund", g: (r) => r.fund }];
function InflationApocalypse({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [money, setMoney] = useState(1000000);
  const [basket, setBasket] = useState(APOC_BASKET);
  const [hist, setHist] = useState([{ m: 1000000, b: APOC_BASKET }]);
  const [last, setLast] = useState(null);
  const [st, finish] = useFinish(onSave);
  const baskets = (m, b) => Math.round((m / b) * 100) / 100;
  const start = baskets(1000000, APOC_BASKET);
  const done = hist.length > APOC_R.length;
  const choose = (o) => { const r = APOC_R[i]; const nm = Math.round(money * (1 + o.g(r))); const nb = Math.round(basket * (1 + r.infl)); setMoney(nm); setBasket(nb); setHist([...hist, { m: nm, b: nb, pick: o.l }]); setLast({ o, r }); setI(i + 1); };
  const now = baskets(money, basket);
  if (st.done) return <Reward title="You survived the apocalypse! 🧟" subtitle={`${now} baskets (you started with ${start})`} coins={st.coins} saving={st.saving} onExit={onExit} gold={now >= start} />;
  return (
    <ActShell icon={<Flame size={22} strokeWidth={2.1} />} title="The Inflation Apocalypse 🧟" subtitle="5 quarters of crisis. You win if you can still buy as many baskets as at the start." onExit={onExit}>
      <Brief91 k="c7_apoc" />
      <div className="g10-basket">{APOC_ITEMS.map((x) => <span key={x.l}><em>{x.e}</em>{x.l}<b>{cop(x.p * (basket / APOC_BASKET))}</b></span>)}</div>
      <div className="g10-stats"><div><small>💰 My money</small><b>{cop(money)}</b></div><div><small>🧺 Basket price</small><b>{cop(basket)}</b></div><div><small>🛒 Baskets I can buy</small><b className={now >= start ? "pos" : "neg"}>{now}</b></div><div><small>🏁 At the start</small><b>{start}</b></div></div>
      {last && <div className="p1-banner"><span>{last.r.e} {last.r.t}: prices +{(last.r.infl * 100).toFixed(0)}% · your {last.o.l.toLowerCase()} {last.o.g(last.r) >= 0 ? "+" : ""}{(last.o.g(last.r) * 100).toFixed(1)}%</span></div>}
      {!done ? (
        <div className="start-block g10-event">
          <div className="g10-event-head"><em>📅</em><div><b>Quarter {i + 1} of 5</b><p>Where will your money stay this quarter? (The news arrives after you choose!)</p></div></div>
          <div className="g10-ab four">{APOC_OPTS.map((o) => <button key={o.k} type="button" onClick={() => choose(o)}><em>{o.e}</em><b>{o.l}</b></button>)}</div>
        </div>
      ) : (
        <>
          <ChartCard title="Baskets I can buy, quarter by quarter"><LineChart money={false} labels={hist.map((_, k) => `Q${k}`)} series={[{ name: "Baskets", values: hist.map((h) => baskets(h.m, h.b)), color: "#16b074" }]} /></ChartCard>
          <PickOne q="Who wins in an inflation crisis?" options={["Whoever keeps the most purchasing power.", "Whoever ends with the most pesos.", "Whoever keeps cash at home.", "Whoever spends fast before prices rise."]} correct={0} explain="Count baskets, not pesos: purchasing power is what matters." />
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(22 + (now >= start ? 8 : 0), { final: money, basket, baskets: now, start, picks: hist.slice(1).map((h) => h.pick) })}>Finish <span className="coin-tag"><Coins size={15} /> +{22 + (now >= start ? 8 : 0)}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C7 · Price Time Machine · Page 11 ---------- */
const PTM_DEF = [{ item: "Bus ticket", then: "", now: "" }, { item: "A lunch (corrientazo)", then: "", now: "" }, { item: "A soda", then: "", now: "" }, { item: "", then: "", now: "" }];
function PriceTimeMachine({ existing, onSave, onExit }) {
  const [rows, setRows] = useState(existing?.rows || PTM_DEF);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const up = (k, f, v) => setRows(rows.map((r, i) => (i === k ? { ...r, [f]: v } : r)));
  const valid = rows.filter((r) => r.item.trim() && num(r.then) > 0 && num(r.now) > 0);
  const avg = valid.length ? Math.round(valid.reduce((a, r) => a + growth(num(r.then), num(r.now)), 0) / valid.length) : 0;
  const G = [W_USEDTO, W_NUMBERS(2)];
  if (st.done) return <Reward title="Price report ready! 🕰️" subtitle={`Your average increase: ${avg}%`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Clock size={22} strokeWidth={2.1} />} title="Price Time Machine 🕰️ · Page 11" subtitle="Ask your family: how much did these things cost about 10 years ago? Compare with today." onExit={onExit}>
      <Brief91 k="c7_machine" />
      <FPBadge n={11} t="My price history report" e="🕰️" />
      <div className="g10-ptm">{rows.map((r, k) => <div key={k}><input className="start-input" value={r.item} onChange={(e) => up(k, "item", e.target.value)} placeholder="Product" /><MoneyInput value={r.then} onChange={(v) => up(k, "then", v)} placeholder="10 years ago" /><MoneyInput value={r.now} onChange={(v) => up(k, "now", v)} placeholder="today" /><b className={num(r.then) > 0 && num(r.now) > 0 ? "pos" : ""}>{num(r.then) > 0 && num(r.now) > 0 ? pctTxt(growth(num(r.then), num(r.now)), 0) : "—"}</b></div>)}</div>
      {valid.length >= 3 && <ChartCard title="My family's prices vs. official inflation (IPC 2015–2024 ≈ +76%)"><div className="g10-bars">{valid.map((r) => { const g = growth(num(r.then), num(r.now)); return <div key={r.item}><span>{r.item}</span><div><i style={{ width: `${Math.min(100, Math.max(2, g / 2))}%`, background: g > 76 ? "#ff6b57" : "#16b074" }} /></div><b>{pctTxt(g, 0)}</b></div>; })}<div><span>IPC (DANE)</span><div><i style={{ width: "38%", background: "#f5b23e" }} /></div><b>+76%</b></div></div></ChartCard>}
      <div className="start-block"><h3>✍️ Page 11 · My price history report (used to)</h3><Starters items={["A … used to cost…", "Now it costs…, so it went up …%", "Prices used to be…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="A bus ticket used to cost $1,800. Now it costs…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={valid.length < 3 || !goalsOk(text, 30, 80, G)} onClick={() => finish(30, { rows: valid, avg, text })}>{valid.length < 3 ? "Complete 3 products" : "Save Page 11"} <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- C8 · Money Dashboard Builder · Page 12 ---------- */
const dashRows = (r) => {
  const m = r?.c1_month; const plan = m?.plan || Object.fromEntries(BUD_ITEMS.map((x) => [x.k, x.v]));
  const g = r?.c4_page; const l = r?.c6_page; const pt = r?.c7_machine;
  const lines = [
    ["1", "Monthly income", INCOME18, "(typed)"],
    ...BUD_ITEMS.filter((x) => x.type !== "save").map((x, k) => [String(k + 2), `${x.l} (${x.type})`, plan[x.k], "(typed)"]),
  ];
  const n = lines.length;
  lines.push([String(n + 1), "Total expenses", BUD_ITEMS.filter((x) => x.type !== "save").reduce((a, x) => a + plan[x.k], 0), `=SUM(C2:C${n})`]);
  lines.push([String(n + 2), "Savings (pay yourself first)", plan.save, "(typed)"]);
  lines.push([String(n + 3), "Free money", INCOME18 - BUD_ITEMS.reduce((a, x) => a + plan[x.k], 0), `=C1-C${n + 1}-C${n + 2}`]);
  lines.push([String(n + 4), "Savings rate", `${Math.round((plan.save / INCOME18) * 100)}%`, `=C${n + 2}/C1`]);
  lines.push([String(n + 5), `Savings in ${g?.years || 10} years at ${g?.rate || 9}% E.A.`, g?.fv || fvSeries(plan.save, 0.09, 10)[10], "=FV(rate/12, months, -saving)"]);
  lines.push([String(n + 6), "Loan payment (Page 10)", l?.payment || 0, "=PMT(rate, months, -loan)"]);
  lines.push([String(n + 7), "My personal inflation (Page 11)", pt ? `${pt.avg}%` : "—", "=AVERAGE(growth %)"]);
  return lines;
};
function MoneyDashboard({ resp, existing, onSave, onExit }) {
  const L = dashRows(resp);
  const [show, setShow] = useState(true);
  const [rule, setRule] = useState(existing?.insight || "");
  const [st, finish] = useFinish(onSave);
  const savRow = L.find((x) => x[1].startsWith("Savings (")); const freeRow = L.find((x) => x[1] === "Free money");
  const closes = num(freeRow[2]) >= 0;
  const csv = () => downloadCSV([["Row", "Concept", "Value (COP)", "Formula"], ...L], "My_Money_Dashboard.csv");
  if (st.done) return <Reward title="Dashboard built! 📊" subtitle="Page 12 + your CSV file." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Database size={22} strokeWidth={2.1} />} title="My Money Dashboard 📊 · Page 12" subtitle="THE BIG PROJECT: your whole period in one spreadsheet — with the formulas visible." onExit={onExit}>
      <Brief91 k="c8_dashboard" />
      <FPBadge n={12} t="My Money Dashboard" e="📊" />
      {!resp?.c1_month && <div className="p1-banner bad"><span>Survive the Month is not done yet, so the budget uses default numbers.</span></div>}
      <div className="p3-card-actions"><button className="s1-btn ghost" onClick={() => setShow(!show)}>{show ? "Hide formulas" : "Show formulas"}</button><button className="s1-btn primary" onClick={csv}><Download size={16} /> Download CSV (Excel)</button></div>
      <div className="g10-sheet" id="g10-sheet">
        <div className="h"><span /><span>B · Concept</span><span>C · Value</span>{show && <span>Formula</span>}</div>
        {L.map((x) => <div key={x[0]} className={/Total|Savings|Free/.test(x[1]) ? "hl" : ""}><span>{x[0]}</span><span>{x[1]}</span><span>{typeof x[2] === "number" ? cop(x[2]) : x[2]}</span>{show && <span><code>{x[3]}</code></span>}</div>)}
      </div>
      <div className="g91-mini"><span className={closes ? "pos" : "neg"}>The month closes <b>{closes ? "✓" : "✗"}</b></span><span>Savings <b>{cop(savRow[2])}</b></span></div>
      <div className="p3-sentence edit"><span>💡 The most important insight of my dashboard:</span><input className="start-input" value={rule} onChange={(e) => setRule(e.target.value)} placeholder="If I keep saving 20%, in 10 years I will have…" /></div>
      <div className="start-foot"><button className="s1-btn ghost" onClick={() => downloadPNG("g10-sheet", "My_Money_Dashboard.png")}><Download size={16} /> PNG</button><button className="s1-btn primary big" disabled={countWords(rule) < 8} onClick={() => finish(36, { closes, insight: rule, rows: L.length })}>Save Page 12 <span className="coin-tag"><Coins size={15} /> +36</span></button></div>
    </ActShell>
  );
}

/* ---------- C8 · Money Math Defense (Present + rúbrica) ---------- */
const RUB_DEF = [["bud", "The budget makes sense", "it closes, 50/30/20"], ["comp", "Simple vs. compound", "explained with the chart"], ["rate", "E.A. & the real cost of a loan", "numbers correct"], ["infl", "Inflation & purchasing power", "real return"], ["eng", "Precise financial English", "clear and confident"]];
function MoneyDefense({ resp, studentName, existing, onSave, onExit }) {
  const r = resp || {}; const m = r.c1_month, g = r.c4_page, l = r.c6_page, p = r.c7_machine, ln = r.c6_loan;
  const ready = !!(m && g && (l || ln));
  const chapters = (v) => [
    { e: "🧾", t: "My budget", s: m ? [`As Future Me, I earn ${cop(INCOME18)} a month.`, `I save ${cop(m.savePlan)} first (${Math.round((m.savePlan / INCOME18) * 100)}%), and my needs are ${cop(m.needs)}.`, m.free >= 0 ? "My month closes in green." : "My month closed in red — and I learned why."] : [] },
    { e: "📈", t: "Simple vs. compound", s: g ? [`If I save ${cop(g.monthly)} every month at ${g.rate}% E.A. for ${g.years} years, I will have ${cop(g.fv)}.`, `I only put in ${cop(g.put)}: ${cop(g.fv - g.put)} is interest on interest.`] : [] },
    { e: "🏦", t: "Rates and loans", s: [l ? `For a $3,000,000 loan I chose the ${l.pick} option: ${cop(l.payment)} per month, ${cop(l.total)} in total.` : "", ln ? `In my Loan Lab, ${cop(ln.P)} in ${ln.n} months costs ${cop(ln.interest)} in interest.` : "", r.c5_detective ? "I always translate rates into E.A. before comparing." : ""].filter(Boolean) },
    { e: "🫧", t: "Inflation", s: p ? [`In my family, prices went up ${p.avg}% on average in about 10 years.`, "That's why my money must earn more than inflation."] : [] },
    { e: "🎯", t: "The 3 things I mastered", s: v.three ? [dot(capF(v.three))] : [] },
  ];
  return (
    <PitchStudio icon={<Mic size={22} strokeWidth={2.1} />} title="Money Math Defense 🎤" subtitle="2–3 minutes: defend your numbers in front of a classmate-jury." brief={<Brief91 k="c8_defense" />}
      how={<>Your script builds itself from your Future Pages. Write <b>the 3 things you mastered</b> and your closing line, press <b>Present</b> and defend your numbers. Then your jury rates you.</>}
      id="g10-defense" ready={ready} readyMsg="You need Survive the Month, My Growth Chart and a loan activity (Loan Lab or Page 10)."
      cover={{ tag: "MONEY MATH DEFENSE · GRADE 10 · INSTITUTO CREAR", title: `🧮 ${studentName}: my Money Math`, say: `Hello! I'm ${studentName.split(" ")[0]}, and these are the numbers of my Future Me at 18.`, end: (v) => `${v.close ? dot(capF(v.close)) : "…"} Thank you!` }}
      kpis={[{ l: "💼 Income", v: cop(INCOME18) }, { l: "🐷 Saving / month", v: m ? cop(m.savePlan) : "—" }, { l: "📈 Projection", v: g ? cop(g.fv) : "—" }, { l: "🏦 Loan total", v: l ? cop(l.total) : "—" }]}
      chapters={chapters} inputs={[{ k: "three", l: "🎯 The 3 things I mastered:", ph: "I can calculate…, I can translate…, and I can…", min: 10 }, { k: "close", l: "💡 My closing line:", ph: "Math is my best tool to protect my money…", min: 6 }]}
      rubric={RUB_DEF} existing={existing} cert={{ e: "🧮", title: "Money Math Defender", name: studentName, text: "defended a budget, a compound-interest projection, a loan decision and an inflation report with correct numbers and clear English." }} coins={50} onSave={onSave} onExit={onExit} />
  );
}

/* ---------- C8 · Certification Challenge (la bóveda) ---------- */
function CertificationBoss({ studentName, onSave, onExit }) {
  const cert = <div className="g93-cert g10-cert" id="g10-mmcert"><small>INSTITUTO CREAR · FINFLUENT · GRADE 10</small><h2>🧮 FinFluent Money Math Certificate</h2><p>This certifies that</p><b>{studentName}</b><p>can build a budget, calculate simple and compound interest, translate rates into E.A., read an amortization table and measure the effect of inflation.</p><span>{new Date().toLocaleDateString("en-GB")}</span><button type="button" className="s1-btn ghost" onClick={() => downloadPNG("g10-mmcert", "Money_Math_Certificate.png")}><Download size={15} /> Save</button></div>;
  return <BossExam icon={<Lock size={22} strokeWidth={2.1} />} title="Certification Challenge · The Vault 🔐" subtitle="5 vault levels + 10 questions. 70% unlocks your FinFluent Money Math Certificate." brief={<Brief91 k="c8_boss" />} missions={BOSS2_MISSIONS} questions={BOSS2_Q} tips={BOSS2_TIPS} cardNode={cert} onSave={onSave} onExit={onExit} />;
}

/* ---------- C8 · Future Me Card: My Money Rules ---------- */
const RULES = [
  { t: "I save first, then I spend.", good: true }, { t: "I compare rates in E.A. before choosing.", good: true },
  { t: "I keep an emergency fund I can use any day.", good: true }, { t: "I pay my card in 1 installment.", good: true },
  { t: "I check if my money beats inflation.", good: true }, { t: "I count the hours of work before buying.", good: true },
  { t: "I pay only the minimum of my card.", good: false }, { t: "I buy everything on sale — it's always cheaper.", good: false },
  { t: "I keep all my savings under the mattress.", good: false }, { t: "I take the fastest loan, not the cheapest.", good: false },
];
function MoneyRules({ studentName, existing, onSave, onExit }) {
  const [sel, setSel] = useState(existing?.rules || []);
  const [own, setOwn] = useState(existing?.own || "");
  const [st, finish] = useFinish(onSave);
  const bad = sel.filter((t) => !RULES.find((r) => r.t === t)?.good);
  const ok = sel.length === 5 && !bad.length && countWords(own) >= 5;
  if (st.done) return <Reward title="Future Me Card unlocked! 🧮" subtitle="My Money Rules travel with you to Period 4." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<BadgeCheck size={22} strokeWidth={2.1} />} title="Future Me Card · My Money Rules 🧮" subtitle="Choose your 5 money rules and write one of your own. In Period 4 your life at 25 will follow them." onExit={onExit}>
      <Brief91 k="c8_rules" />
      <div className="g10-qpick">{RULES.map((r) => { const on = sel.includes(r.t); return <button key={r.t} type="button" className={`${on ? "on" : ""} ${on && !r.good ? "bad" : ""}`} onClick={() => setSel(on ? sel.filter((x) => x !== r.t) : sel.length < 5 ? [...sel, r.t] : sel)}>{on ? (r.good ? "✓ " : "✗ ") : ""}{r.t}</button>; })}</div>
      {bad.length > 0 && <p className="p1-hint">💡 One of your rules would hurt Future Me. Which one? Change it.</p>}
      <label className="p3-lbl">My own rule (5+ words):<input className="start-input" value={own} onChange={(e) => setOwn(e.target.value)} placeholder="I never lend money I can't lose…" /></label>
      {ok && <FMCardView id="g10-card2" card={FM_CARDS[1]} name={studentName} lines={[...sel, `✍️ ${own}`]} />}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30, { rules: sel, own: own.trim() })}>{sel.length < 5 ? `Choose 5 rules (${sel.length}/5)` : "Save my Future Me Card"} <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   GUÍA DE CADA ACTIVIDAD · 10° PERIODO 2
   ===================================================================== */
const TPAGE = (n, words, needs, coins) => [[`Text: ${words} words with ${needs}`, "required"], [`Future Page ${n} saved`, `+${coins} 🪙`]];
const GUIDE = {
  c1_rush: B_RUSH("Classify Future Me's expenses: fixed or variable? Need or want?"),
  c1_read: B_READ("Learn to build a budget in a spreadsheet: cells, formulas, 50/30/20 and 'what if' scenarios.", "Next: Survive the Month."),
  c1_month: { goal: "Future Me is 18 and earns $1,600,000 a month. Plan the budget and reach day 30 with temptations and an emergency. This is Future Page 07.", steps: ["Plan with the sliders (save first!).", "Check the 50/30/20 gauges.", "Live 4 events of the month.", "Write Page 07: present simple + frequency words + 2 numbers."], win: [["Page 07 saved", "+26 🪙"], ["The month closes in green", "+4 🪙"], ["Your plan respects 50/30/20", "+4 🪙"]] },
  c1_sheet: { goal: "Use spreadsheet formulas like a pro: =SUM, %, subtraction and 'what if'.", steps: ["Look at the mini spreadsheet.", "Calculate what each formula shows.", "A mistake gives you a hint."], win: [["Each answer right on the first try", "+3 🪙"], ["Finishing", "+8 🪙"]] },
  c2_video: B_VIDEO("Understand scarcity and opportunity cost with a real school decision.", "Next: the Choices Arcade."),
  c2_arcade: { goal: "Play 8 rounds of A or B and identify the opportunity cost of each choice.", steps: ["Choose A or B (any choice is OK).", "Identify what you gave up.", "Read the trade-off."], win: [["Base", "+14 🪙"], ["Each opportunity cost identified", "+2 🪙"]] },
  c2_hours: { goal: "Translate prices into HOURS of your life: Future Me earns $10,000 per hour.", steps: ["Divide the price by $10,000.", "Watch out for small daily expenses.", "Decide which costs the most."], win: [["Each answer right on the first try", "+3 🪙"], ["Finishing", "+8 🪙"]] },
  c2_page: { goal: "Write a SMART goal for Future Me and explain the trade-off. This is Future Page 08.", steps: ["Complete S, M, A, R and T.", "Write Page 08 with 'If I choose…, I lose…' and a reason."], win: TPAGE("08", "30–80", "'If I choose…, I lose…' + a reason", 28) },
  c3_read: B_READ("Discover why money changes value through time: inflation, FV and PV, with real Colombian data.", "Next: Today or Tomorrow?"),
  c3_today: { goal: "Decide: money today or more money tomorrow? It depends on the rate you can get.", steps: ["Read each offer.", "Calculate or decide.", "Read the explanation."], win: [["Each answer right on the first try", "+3 🪙"], ["Finishing", "+8 🪙"]] },
  c3_machine: { goal: "Travel through time with the PV/FV machine and decide 'today or tomorrow' with numbers.", steps: ["Choose FV or PV.", "Move the money, the rate and the years.", "Read the year-by-year table.", "Explain your decision (will / would)."], win: [["Decision written (25–70 words, will/would + 2 numbers)", "+28 🪙"]] },
  c3_rounds: { goal: "Practice future value and present value calculations.", steps: ["Use FV = PV × (1 + r)ⁿ or PV = FV ÷ (1 + r)ⁿ.", "Type your answer.", "Read the explanation."], win: [["Each answer right on the first try", "+3 🪙"], ["Finishing", "+8 🪙"]] },
  c4_video: B_VIDEO("Learn the Rule of 72: how many years until your money doubles.", "Next: the Interest Battle."),
  c4_race: { goal: "Watch simple vs. compound interest fight for 30 years — then beat the bank's 'amazing' offer.", steps: ["Move money, rate, years and monthly extra.", "Compare the two curves.", "Boss mode: choose the better offer."], win: [["Finishing", "+24 🪙"], ["Boss offer right", "+6 🪙"]] },
  c4_rounds: { goal: "Practice simple interest, compound interest and the Rule of 72.", steps: ["Simple: P × (1 + r × n). Compound: P × (1 + r)ⁿ.", "Rule of 72: 72 ÷ rate = years to double.", "Type your answer and read the explanation."], win: [["Each answer right on the first try", "+3 🪙"], ["Finishing", "+8 🪙"]] },
  c4_page: { goal: "Project YOUR monthly savings with compound interest. This is Future Page 09.", steps: ["Choose your monthly saving, rate and years.", "Compare 'my deposits' vs. 'with interest'.", "Write Page 09 with comparatives and 2 numbers."], win: TPAGE("09", "25–70", "comparatives + 2 numbers", 28) },
  c5_listen: B_LISTEN("Listen to Valentina at the bank and discover why the biggest number is not always the best option."),
  c5_brief: B_BRIEF("Learn what E.A. really means and how to translate monthly rates.", "Next: the Rate Translator."),
  c5_translator: { goal: "Translate rates (monthly ↔ E.A.) — the only fair way to compare banks.", steps: ["Play with both translators.", "Solve 5 translation challenges."], win: [["Base", "+14 🪙"], ["Each challenge right on the first try", "+3 🪙"]], tip: "E.A. = (1 + monthly)¹² − 1" },
  c5_detective: { goal: "Investigate 5 real-style bank ads and choose the best one for Valentina's goal.", steps: ["Open each ad: see its E.A. and its small letters.", "Think about her goal: 1 year + possible emergency.", "Choose."], win: [["Best real option", "+30 🪙"], ["Other options", "+18 🪙"]] },
  c6_video: B_VIDEO("Discover the minimum payment trap — and the 5 steps to escape it.", "Next: the Loan Lab."),
  c6_loan: { goal: "Build an amortization table month by month and decide what to do with a $1,000,000 bonus.", steps: ["Choose the loan and the months.", "Pay 6 months and watch interest vs. capital.", "Choose: reduce the term or the payment."], win: [["Saving your analysis", "+30 🪙"]] },
  c6_cuotas: { goal: "See the real price of 36 installments and of paying only the minimum.", steps: ["Guess the extra cost.", "Compare 1, 6, 12, 24 and 36 installments.", "See the minimum-payment trap.", "Answer the final question."], win: [["Finishing", "+26 🪙"]] },
  c6_page: { goal: "Choose the best loan for Future Me by TOTAL cost and explain the risks. This is Future Page 10.", steps: ["Compare 3 offers.", "Choose one.", "Write Page 10: conditional 1 (If…, I will…) + a risk."], win: [["Cheapest total cost", "+30 🪙"], ["Other options", "+22 🪙"]] },
  c7_read: B_READ("Read The Price Times: real inflation data from Colombia and how to calculate price changes.", "Next: the Inflation Apocalypse."),
  c7_apoc: { goal: "Survive 5 quarters of crisis: keep your purchasing power (baskets), not just your pesos.", steps: ["Choose where your money stays each quarter.", "Read the news and see prices change.", "Count your baskets."], win: [["Finishing", "+22 🪙"], ["Keeping your purchasing power", "+8 🪙"]] },
  c7_machine: { goal: "Investigate with your family the prices of 10 years ago and compare them with today and with the IPC. This is Future Page 11.", steps: ["Write at least 3 products with both prices.", "See the % of each one vs. the IPC.", "Write Page 11 with 'used to' and 2 numbers."], win: TPAGE("11", "30–80", "'used to' + 2 numbers", 30) },
  c8_dashboard: { goal: "THE BIG PROJECT: your whole period in one spreadsheet with visible formulas — and download it. This is Future Page 12.", steps: ["Check the rows built from your pages.", "Show the formulas.", "Download the CSV (opens in Excel/Sheets).", "Write your most important insight."], win: [["Insight (8+ words)", "required"], ["Future Page 12 saved", "+36 🪙"]] },
  c8_defense: { goal: "Defend your numbers in 2–3 minutes: budget, compound interest, rates, loans and inflation.", steps: ["Check your auto-built script.", "Write the 3 things you mastered and your closing line.", "Present.", "Your classmate-jury rates you (5 criteria)."], win: [["Script + jury complete", "required"], ["Money Math Defender certificate", "+50 🪙"]] },
  c8_boss: { goal: "Open the vault: 5 levels + 10 questions. Pass with 70% to get the FinFluent Money Math Certificate.", steps: ["Part 1: 5 vault levels.", "Part 2: 10 questions.", "Read your feedback by topic."], win: [["70% or more", "Certificate 🔐"], ["Each question right", "+4 🪙"], ["Each level on the first try", "+4 🪙"]] },
  c8_rules: { goal: "Choose the 5 money rules Future Me will live by — your second Future Me Card.", steps: ["Choose 5 rules (watch out for bad ones!).", "Write one rule of your own.", "Save your card."], win: [["5 good rules + your own rule", "+30 🪙"]] },
};

/* =====================================================================
   ESTRUCTURA · 10° PERIODO 2 · MONEY MATH LAB (8 clases)
   ===================================================================== */
const G10P2_WEEKS = [
  { n: 1, title: "Budget Reboot", e: "🧾", blurb: "Future Me at 18: your first salary, a spreadsheet and the 50/30/20 rule.", skills: ["Rush", "Reading", "Simulator"], acts: [
    A10("c1_rush", "Budget Rush ⚡", "Fixed or variable? Need or want?", <Zap size={22} />, 24, "aprendi"),
    A10("c1_read", "Reading: Your Money in a Spreadsheet 📖", "Cells, formulas, 50/30/20 · 8 questions.", <BookOpen size={22} />, 42, "quizzes"),
    A10("c1_month", "Survive the Month 🗓️ · Page 07", "$1,600,000 · temptations · emergency.", <Calendar size={22} />, 34, "aprendi"),
    A10("c1_sheet", "Spreadsheet Formulas 🧮", "=SUM, %, what if · 6 rounds.", <Calculator size={22} />, 26, "aprendi"),
  ] },
  { n: 2, title: "Opportunity Cost", e: "⚖️", blurb: "Every choice has a cost: the best thing you didn't choose.", skills: ["Video", "Arcade", "SMART"], acts: [
    A10("c2_video", "Video: Scarcity & Opportunity Cost 🎬", "St. Louis Fed · 8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A10("c2_arcade", "Choices Arcade 🕹️", "8 rounds of A or B.", <Shuffle size={22} />, 30, "aprendi"),
    A10("c2_hours", "Time Is Money ⏱️", "Prices in hours of work.", <Timer size={22} />, 23, "aprendi"),
    A10("c2_page", "My Biggest Trade-off ⚖️ · Page 08", "SMART goal + If I choose…, I lose…", <Scale size={22} />, 28, "aprendi"),
  ] },
  { n: 3, title: "Time Value of Money", e: "⏳", blurb: "A peso today is worth more than a peso tomorrow. Learn to travel through time.", skills: ["Reading", "Machine", "Rounds"], acts: [
    A10("c3_read", "Reading: The Time Traveler's Wallet 📖", "FV, PV and real DANE data · 8 questions.", <BookOpen size={22} />, 42, "quizzes"),
    A10("c3_today", "Today or Tomorrow? ⏳", "5 decisions with rates.", <Hourglass size={22} />, 23, "aprendi"),
    A10("c3_machine", "PV/FV Machine 🚀", "Travel forward and backward.", <Rocket size={22} />, 28, "aprendi"),
    A10("c3_rounds", "PV/FV Rounds 🧮", "5 calculations.", <Calculator size={22} />, 23, "aprendi"),
  ] },
  { n: 4, title: "Simple vs. Compound Interest", e: "📈", blurb: "Interest on interest: the slow superpower — and the Rule of 72.", skills: ["Video", "Battle", "Page 09"], acts: [
    A10("c4_video", "Video: The Rule of 72 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A10("c4_race", "The Interest Battle ⚔️", "Simple vs. compound · boss offer.", <Swords size={22} />, 30, "aprendi"),
    A10("c4_rounds", "Formula Rounds 🧮", "Simple, compound, Rule of 72.", <Calculator size={22} />, 23, "aprendi"),
    A10("c4_page", "My Growth Chart 📈 · Page 09", "YOUR savings projected.", <LineIcon size={22} />, 28, "aprendi"),
  ] },
  { n: 5, title: "E.A. vs. Monthly Rates", e: "🏦", blurb: "Bank ads speak different languages. Translate them all into E.A.", skills: ["Listening", "Translator", "Detective"], acts: [
    A10("c5_listen", "Listening: A CDT at the Bank 🎧", "Valentina's choice · 8 questions.", <Headphones size={22} />, 42, "quizzes"),
    A10("c5_brief", "Explainer: What Does 10% E.A. Mean? 💡", "6 questions.", <BookOpen size={22} />, 34, "quizzes"),
    A10("c5_translator", "Rate Translator 🔁", "Monthly ↔ E.A. · 5 challenges.", <Percent size={22} />, 29, "aprendi"),
    A10("c5_detective", "Bank Ads Detective 🕵️", "5 ads · small letters.", <Search size={22} />, 30, "aprendi"),
  ] },
  { n: 6, title: "The Real Cost of a Loan", e: "💳", blurb: "Amortization, extra payments, installments and the minimum-payment trap.", skills: ["Video", "Loan Lab", "Page 10"], acts: [
    A10("c6_video", "Video: The Minimum Payment Trap 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A10("c6_loan", "Loan Lab 🏦", "Amortization + a $1,000,000 bonus.", <Landmark size={22} />, 30, "aprendi"),
    A10("c6_cuotas", "1 vs. 36 Installments 💳", "Total cost + minimum trap.", <CreditCard size={22} />, 26, "aprendi"),
    A10("c6_page", "My Loan Decision 📝 · Page 10", "3 offers · total cost.", <FileText size={22} />, 30, "aprendi"),
  ] },
  { n: 7, title: "Inflation & Purchasing Power", e: "🫧", blurb: "Count baskets, not pesos. Investigate the prices of your family.", skills: ["Newspaper", "Apocalypse", "Page 11"], acts: [
    A10("c7_read", "The Price Times 📰", "Real inflation data · 8 questions.", <Newspaper size={22} />, 42, "quizzes"),
    A10("c7_apoc", "The Inflation Apocalypse 🧟", "5 quarters · keep your baskets.", <Flame size={22} />, 30, "aprendi"),
    A10("c7_machine", "Price Time Machine 🕰️ · Page 11", "Your family's prices vs. the IPC.", <Clock size={22} />, 30, "aprendi"),
  ] },
  { n: 8, title: "Certification Day", e: "🎓", blurb: "Your Money Dashboard, your defense, the vault — and your Money Rules.", skills: ["Project", "Defense", "Certificate"], acts: [
    A10("c8_dashboard", "My Money Dashboard 📊 · Page 12", "THE BIG PROJECT · formulas + CSV.", <Database size={22} />, 36, "aprendi"),
    A10("c8_defense", "Money Math Defense 🎤", "Present + jury.", <Mic size={22} />, 50, "aprendi"),
    A10("c8_boss", "Certification Challenge 🔐", "5 levels + 10 questions (70%).", <Lock size={22} />, 70, "quizzes"),
    A10("c8_rules", "Future Me Card: My Money Rules 🧮", "Your 5 rules for life.", <BadgeCheck size={22} />, 30, "comportamiento"),
  ] },
];

const CFG102 = {
  n: 2, KEY: "10P2", title: "Money Math Lab 🧮", weeks: G10P2_WEEKS,
  question: "Why is a peso today worth more than tomorrow — and how do I make math work for me, not against me?",
  howyear: "The mathematical heart of 10th grade. Everybody receives the same Future Me at 18: a part-time job that pays $1,600,000 a month (fictional). Your decisions make your numbers different: budget, opportunity cost, present and future value, simple and compound interest, E.A. rates, loans and inflation. Your big project is My Money Dashboard (a spreadsheet you download), you defend it in a Money Math Defense, open the vault to get the FinFluent Money Math Certificate and unlock your second Future Me Card: My Money Rules.",
  chips: ["🧑 Future Me at 18", "📘 Future Pages 07–12", "🧮 Money Math Certificate"],
  bigKeys: ["c8_dashboard"], pageKeys: ["c1_month", "c2_page", "c4_page", "c6_page", "c7_machine", "c8_dashboard"],
  panel: (ctx, compact) => {
    const r = ctx.resp;
    return <FutureMePanel id={fmIdOf(r.__p1)} have={ctx.have} compact={compact} studentName={ctx.name} title="PERIOD 2 · MONEY MATH LAB" stats={[{ l: "💼 Income at 18", v: cop(INCOME18) }, { l: "🐷 Saving / month", v: r.c1_month ? cop(r.c1_month.savePlan) : "—" }, { l: "📈 Projection", v: r.c4_page ? cop(r.c4_page.fv) : "—", c: r.c4_page ? "pos" : "" }, { l: "🎓 Certificate", v: r.c8_boss?.passed ? "✅" : "🔒" }]} />;
  },
  render: (act, ctx) => {
    const L = mkLearn(ctx, Brief91);
    const P = { onSave: ctx.save, onExit: ctx.exit };
    switch (act) {
      case "c1_rush": return L.rush("c1_rush", "Budget Rush ⚡", "Fixed or variable? Need or want?", RUSH_BUDGET, "Budget pro! 🧾", 75);
      case "c1_read": return L.reading("c1_read", "Your Money in a Spreadsheet", "Cells, formulas and the 50/30/20 rule — with Future Me's real numbers.", READ_SHEET, GLOSS_SHEET, Q_SHEET, "🧾");
      case "c1_month": return <SurviveMonth existing={ctx.existing} {...P} />;
      case "c1_sheet": return <NumberRounds icon={<Calculator size={22} strokeWidth={2.1} />} title="Spreadsheet Formulas 🧮" subtitle="What does each formula show?" intro={<Brief91 k="c1_sheet" />} rounds={SHEET_R} coinsPer={3} bonus={8} doneTitle="Spreadsheet pro! 🧮" {...P} />;
      case "c2_video": return L.video("c2_video", VID_OPP10, "Scarcity and Opportunity Cost", VQ_OPP10);
      case "c2_arcade": return <ChoicesArcade {...P} />;
      case "c2_hours": return <NumberRounds icon={<Timer size={22} strokeWidth={2.1} />} title="Time Is Money ⏱️" subtitle={`Future Me earns ${cop(WAGE)} per hour. How many hours does each thing cost?`} intro={<Brief91 k="c2_hours" />} rounds={HOURS_R} coinsPer={3} bonus={8} doneTitle="Your time is valuable! ⏱️" {...P} />;
      case "c2_page": return <TradeoffPage existing={ctx.existing} {...P} />;
      case "c3_read": return L.reading("c3_read", "The Time Traveler's Wallet", "Why $100,000 from 2016 is not $100,000 today.", READ_TIME, GLOSS_TIME, Q_TIME, "⏳");
      case "c3_today": return <NumberRounds icon={<Hourglass size={22} strokeWidth={2.1} />} title="Today or Tomorrow? ⏳" subtitle="Money now or more money later? Calculate before you decide." intro={<Brief91 k="c3_today" />} rounds={TODAY_R} coinsPer={3} bonus={8} doneTitle="Time master! ⏳" {...P} />;
      case "c3_machine": return <PVFVMachine existing={ctx.existing} {...P} />;
      case "c3_rounds": return <NumberRounds title="PV/FV Rounds 🧮" subtitle="FV = PV × (1 + r)ⁿ · PV = FV ÷ (1 + r)ⁿ" intro={<Brief91 k="c3_rounds" />} rounds={PVFV_R} coinsPer={3} bonus={8} {...P} />;
      case "c4_video": return L.video("c4_video", VID_72, "The Rule of 72", VQ_72);
      case "c4_race": return <InterestBattle {...P} />;
      case "c4_rounds": return <NumberRounds title="Formula Rounds 🧮" subtitle="Simple · compound · Rule of 72" intro={<Brief91 k="c4_rounds" />} rounds={INT_R} coinsPer={3} bonus={8} {...P} />;
      case "c4_page": return <GrowthPage resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c5_listen": return L.listen("c5_listen", audioCdtBank, "A CDT at the Bank", "Valentina has $2,000,000 and a goal in one year.", SCRIPT_CDT, Q_CDT);
      case "c5_brief": return L.brief("c5_brief", "What Does 10% E.A. Really Mean?", "Reading a bank ad without falling into the trap.", BRIEF_RATES, GLOSS_RATES, Q_RATES, "🏦");
      case "c5_translator": return <RateTranslator {...P} />;
      case "c5_detective": return <BankDetective {...P} />;
      case "c6_video": return L.video("c6_video", VID_MINPAY, "The Minimum Payment Trap", VQ_MINPAY);
      case "c6_loan": return <LoanLab {...P} />;
      case "c6_cuotas": return <Installments {...P} />;
      case "c6_page": return <LoanPage existing={ctx.existing} {...P} />;
      case "c7_read": return L.reading("c7_read", "The Price Times", "A special edition about inflation in Colombia.", READ_PRICES, GLOSS_PRICES, Q_PRICES, "📰");
      case "c7_apoc": return <InflationApocalypse {...P} />;
      case "c7_machine": return <PriceTimeMachine existing={ctx.existing} {...P} />;
      case "c8_dashboard": return <MoneyDashboard resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c8_defense": return <MoneyDefense resp={ctx.resp} studentName={ctx.name} existing={ctx.existing} {...P} />;
      case "c8_boss": return <CertificationBoss studentName={ctx.name} {...P} />;
      case "c8_rules": return <MoneyRules studentName={ctx.name} existing={ctx.existing} {...P} />;
      default: return null;
    }
  },
};

export const Periodo2G10 = (props) => <PeriodShell10 cfg={CFG102} {...props} />;