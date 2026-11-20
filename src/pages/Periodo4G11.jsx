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
import "../Styles/once4.css";     // 11° · Periodo 4
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   GRADO 11 · PERIODO 4 · GAME ZONE & GRADUATION (B2+)
   Año "FOUNDER YEAR": cada periodo lee las filas anteriores ("11P1"…"11P3") y suma una Founder Card.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "11P4", Grado = "11".
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
   11° · PERIODO 4 · GAME ZONE & GRADUATION — DATOS DE LOS JUEGOS
   Banco de preguntas 6°–11° (lv 1 fácil · 2 medio · 3 difícil)
   ===================================================================== */
const QB11 = [
  /* ---- 6° · El dinero y su historia ---- */
  { t: "Grade 6", lv: 1, q: "Before money existed, people exchanged goods directly. This is called…", options: ["saving", "barter", "credit", "taxes"], correct: 1 },
  { t: "Grade 6", lv: 1, q: "The 'double coincidence of wants' means that in a trade…", options: ["both people want what the other has", "both people want the same product", "nobody wants to trade anymore", "the bank decides who trades"], correct: 0 },
  { t: "Grade 6", lv: 1, q: "Which is NOT a function of money?", options: ["medium of exchange", "store of value", "unit of account for prices", "guarantee of happiness"], correct: 3 },
  { t: "Grade 6", lv: 2, q: "Who prints the banknotes in Colombia?", options: ["the President's office", "each commercial bank, in its own vault", "the Banco de la República", "the DIAN"], correct: 2 },
  { t: "Grade 6", lv: 2, q: "A need is different from a want because a need is…", options: ["necessary to live well", "more expensive than a want", "something your friends have", "always bought online"], correct: 0 },
  /* ---- 7° · Presupuesto y ahorro ---- */
  { t: "Grade 7", lv: 1, q: "A budget is…", options: ["a list of all the things you want to buy", "a type of bank account for young people", "a plan for your income and expenses", "money the bank lends you every month"], correct: 2 },
  { t: "Grade 7", lv: 1, q: "In the 50/30/20 rule, the 20% goes to…", options: ["wants and fun with your friends", "needs like food and transport", "gifts for friends and family", "savings and debt payments"], correct: 3 },
  { t: "Grade 7", lv: 2, q: "You earn $80,000 and spend $95,000. You have…", options: ["a surplus of $15,000", "a deficit of $15,000", "a balanced budget", "savings of $95,000"], correct: 1 },
  { t: "Grade 7", lv: 2, q: "A SMART goal must be specific, measurable, achievable, relevant and…", options: ["time-bound", "very expensive", "secret", "approved by a bank"], correct: 0 },
  { t: "Grade 7", lv: 2, q: "An emergency fund should be kept…", options: ["in one tech stock that grows fast", "lent to a friend who promises to pay", "in bitcoin, because you can sell it fast", "somewhere safe and easy to use"], correct: 3 },
  /* ---- 8° · Bancos, crédito, seguridad ---- */
  { t: "Grade 8", lv: 1, q: "Interest is…", options: ["the price of using someone else's money", "a free gift that the bank gives you", "a type of tax on salaries and income", "the money you keep at home for emergencies"], correct: 0 },
  { t: "Grade 8", lv: 1, q: "A message says: 'Your account is blocked, send your password'. It is…", options: ["a normal bank message", "a phishing scam", "a promotion from the bank for new clients", "a tax notice"], correct: 1 },
  { t: "Grade 8", lv: 2, q: "Paying only the minimum on a credit card usually means…", options: ["you pay less in total", "the bank forgives the debt", "you pay a lot more interest", "your credit score goes up fast"], correct: 2 },
  { t: "Grade 8", lv: 2, q: "Compound interest means you earn interest on…", options: ["only the first deposit", "only the salary you receive every month", "nothing until year 10", "your money and on past interest"], correct: 3 },
  { t: "Grade 8", lv: 3, q: "$1,000,000 at 10% a year, compound, for 2 years becomes…", options: ["$1,200,000", "$1,210,000", "$1,100,000", "$2,000,000"], correct: 1 },
  /* ---- 9° · Inversión básica ---- */
  { t: "Grade 9", lv: 1, q: "A share (stock) is…", options: ["a loan to the government", "a small part of a company", "a savings account", "a type of insurance"], correct: 1 },
  { t: "Grade 9", lv: 2, q: "Diversification means…", options: ["putting all your money in the best stock", "changing your investments every day to catch the trends", "spreading money across many investments", "changing investments every day"], correct: 2 },
  { t: "Grade 9", lv: 2, q: "The Rule of 72 tells you…", options: ["how long money takes to double", "the maximum interest allowed", "the age to start investing", "how many stocks to buy"], correct: 0 },
  { t: "Grade 9", lv: 3, q: "At 8% a year, money doubles in about…", options: ["4 years", "8 years", "12 years", "9 years"], correct: 3 },
  { t: "Grade 9", lv: 3, q: "A bond is…", options: ["a small part of a company that you own", "a loan you give to a company or government", "a type of cryptocurrency for investors", "a bank card to pay in shops of other countries"], correct: 1 },
  /* ---- 10° · Negocios, dólar, ikigai ---- */
  { t: "Grade 10", lv: 1, q: "The TRM in Colombia is…", options: ["the official dollar–peso exchange rate", "a tax on imports from other countries", "the minimum wage for Colombian workers", "a type of CDT that pays in dollars"], correct: 0 },
  { t: "Grade 10", lv: 2, q: "If the dollar goes from $4,000 to $4,400, the peso…", options: ["got stronger", "stayed the same", "got weaker", "disappeared"], correct: 2 },
  { t: "Grade 10", lv: 2, q: "Ikigai connects what you love, what you're good at, what the world needs and…", options: ["what your parents and teachers want for you", "what you can be paid for", "what is easy and quick to study", "what is famous"], correct: 1 },
  { t: "Grade 10", lv: 3, q: "US$50 at a TRM of $4,200 costs…", options: ["$84,000", "$4,250", "$420,000", "$210,000"], correct: 3 },
  { t: "Grade 10", lv: 3, q: "A bank's main business is…", options: ["printing money", "lending at a higher rate than it pays", "collecting taxes for the government", "selling shares of the government"], correct: 1 },
  /* ---- 11° P1 · Construir el producto ---- */
  { t: "Build It", lv: 1, q: "The first step to create a product people pay for is…", options: ["designing the logo and the brand", "finding a real problem", "printing the labels of the product", "choosing the price"], correct: 1 },
  { t: "Build It", lv: 1, q: "A persona is…", options: ["a fictional profile of your ideal customer", "the lawyer who protects your company's brand", "the owner of the business and its main investor", "a famous influencer who promotes your product"], correct: 0 },
  { t: "Build It", lv: 2, q: "Unit cost = $36,000 of ingredients for 24 cookies. Each cookie costs…", options: ["$3,600", "$2,400", "$1,500", "$1,200"], correct: 2 },
  { t: "Build It", lv: 2, q: "In branding, green usually communicates…", options: ["health, nature and growth", "luxury, power and elegance", "urgency and appetite", "sadness, calm and silence"], correct: 0 },
  { t: "Build It", lv: 3, q: "Fixed costs $120,000, price $3,000, unit cost $1,500. Break-even:", options: ["40 units", "120 units", "60 units", "80 units"], correct: 3 },
  { t: "Build It", lv: 2, q: "Customer acquisition cost (CAC) is…", options: ["the price of one product in your store", "what you spend to win one customer", "the cost of the ingredients for one unit", "the monthly salary of the CEO of the company"], correct: 1 },
  { t: "Build It", lv: 3, q: "Juicero failed mainly because…", options: ["its machine solved a problem people didn't really have", "its juice was too cheap to make any profit", "it had no investors at all to pay for the design of the machine", "it sold only in Colombia and never in the US"], correct: 0 },
  /* ---- 11° P2 · Financiar y valorar ---- */
  { t: "Fund It", lv: 1, q: "Revenue minus all costs and expenses is…", options: ["sales", "net profit", "cash flow", "valuation"], correct: 1 },
  { t: "Fund It", lv: 2, q: "A company can be profitable and still die because it runs out of…", options: ["customers' likes", "logos", "cash", "ideas"], correct: 2 },
  { t: "Fund It", lv: 2, q: "'$200,000 for 10%' means the company is valued at…", options: ["$200,000", "$2,200,000", "$20,000", "$2,000,000"], correct: 3 },
  { t: "Fund It", lv: 3, q: "You own 60%. A new investor buys 25% with new shares. You now own…", options: ["35%", "45%", "50%", "60%"], correct: 1 },
  { t: "Fund It", lv: 2, q: "Equity funding means you…", options: ["give part of your company for money", "borrow from a bank and pay interest every month", "use only your own savings and never borrow", "sell your products in advance"], correct: 0 },
  { t: "Fund It", lv: 3, q: "WeWork's valuation fell from US$47 billion mainly because…", options: ["it lost billions every year", "it had too few offices", "it didn't use technology", "it paid investors too much"], correct: 0 },
  { t: "Fund It", lv: 3, q: "A cap table shows…", options: ["the company's monthly sales", "the price of each product", "who owns what % of the company", "the schedule of the team for every week"], correct: 2 },
  /* ---- 11° P3 · Invertir a los 18 ---- */
  { t: "Invest 18+", lv: 1, q: "Higher expected return usually comes with…", options: ["lower risk", "higher risk", "no risk", "guaranteed profit"], correct: 1 },
  { t: "Invest 18+", lv: 1, q: "An ETF is…", options: ["one company's share on the stock exchange", "a bank loan for buying stocks", "a basket of many investments", "a type of tax on investments"], correct: 2 },
  { t: "Invest 18+", lv: 2, q: "Colombia's inflation in 2022 was about…", options: ["1.6%", "5.2%", "30%", "13.1%"], correct: 3 },
  { t: "Invest 18+", lv: 2, q: "A real return is the return…", options: ["after inflation", "before taxes", "of real estate only", "promised by the bank"], correct: 0 },
  { t: "Invest 18+", lv: 3, q: "A CDT pays 9% and inflation is 13%. Your real return is…", options: ["+4%", "about −3.6%", "+22%", "exactly 0%"], correct: 1 },
  { t: "Invest 18+", lv: 3, q: "FTX collapsed because it…", options: ["paid too many taxes in different countries", "had too few users to pay its costs", "used clients' deposits for risky bets", "refused to advertise with famous people"], correct: 2 },
  { t: "Invest 18+", lv: 3, q: "After a 50% fall, to get back to the start you need…", options: ["+50%", "+25%", "+75%", "+100%"], correct: 3 },
  { t: "Invest 18+", lv: 2, q: "Two ETFs follow the same index. The smart choice is the one with…", options: ["the lowest fee", "the most ads", "the highest fee", "the newest logo"], correct: 0 },
  { t: "Invest 18+", lv: 2, q: "Before investing with an entity in Colombia, check that it is…", options: ["recommended by an influencer with many followers", "supervised by the Superintendencia Financiera", "the one that promises the most money", "located abroad, in a big international city"], correct: 1 },
  /* ---- Plan de vida ---- */
  { t: "Life Plan", lv: 1, q: "ICETEX is…", options: ["a private university in Bogotá for engineers", "a Colombian public entity for student loans", "a stock exchange for Colombian companies", "a scholarship only for students who are athletes"], correct: 1 },
  { t: "Life Plan", lv: 2, q: "Your 'funding gap' for university is…", options: ["the cost of the first semester of your career", "the money your family pays every month", "the money you still need after all your funding", "the amount of the scholarship you receive"], correct: 2 },
  { t: "Life Plan", lv: 2, q: "To compare universities fairly, compare…", options: ["only the first semester's tuition", "the campus photos on its website", "the number of followers they have on social media", "full cost (tuition + living) and funding"], correct: 3 },
  { t: "Life Plan", lv: 3, q: "Tuition $10,000,000 rises 8% a year. Next year it costs…", options: ["$10,800,000", "$10,080,000", "$18,000,000", "$10,008,000"], correct: 0 },
  { t: "Life Plan", lv: 1, q: "A Plan B is…", options: ["a second real option if Plan A fails", "giving up on your dream", "a type of bank loan for students", "the plan your friends choose"], correct: 0 },
  { t: "Life Plan", lv: 3, q: "A loan of $12,000,000 at 1% a month for 60 months has a payment of about…", options: ["$120,000", "$200,000", "$267,000", "$400,000"], correct: 2 },
];
/* Selecciona preguntas mezclando nivel (nunca repite hasta agotar) */
const qbPick = (bank, lv, used = []) => { const pool = bank.filter((q, i) => (lv == null || q.lv === lv) && !used.includes(q._id ?? i)); const all = pool.length ? pool : bank.filter((q) => lv == null || q.lv === lv); return all[Math.floor(Math.random() * all.length)] || bank[0]; };
const withIds = (bank) => bank.map((q, i) => ({ ...q, _id: q._id ?? `b${i}` }));

/* ---------- ESCAPE ROOM · THE VAULT ---------- */
const VAULT = [
  { e: "🦈", room: "The Shark Office", story: "A note on the desk: “A shark offered $250,000 for 10% of the cookie company.” The lock has 4 digits: the company's valuation in thousands.", answer: "2500", hint: "250,000 ÷ 0.10 = ? — then drop the last three zeros.", digit: "2" },
  { e: "🛒", room: "The Market", story: "A price tag: “A gelatin cost $1,000. Inflation was 10% this year and 10% next year.” The lock: its price after two years.", answer: "1210", hint: "1,000 × 1.10 × 1.10", digit: "7" },
  { e: "🔤", room: "The Word Room", story: "Four letters are glued to the wall: K · S · R · I. “The thing that always comes with high return.” Type the word.", answer: "RISK", hint: "Higher return usually comes with higher…", digit: "4" },
  { e: "🧺", room: "The ETF Room", story: "“$8,000,000 in an ETF of 40 equal companies. One company goes to zero.” The lock: how much did you lose? (in thousands)", answer: "200", hint: "8,000,000 ÷ 40 = ? — then in thousands.", digit: "9" },
  { e: "🎓", room: "The Library", story: "A university brochure: “Tuition $6,000,000 per semester. Scholarship 25%.” The lock: what you pay per semester, in thousands.", answer: "4500", hint: "6,000,000 × 0.75", digit: "1" },
];
const VAULT_FINAL = { story: "The vault door has a 5-digit lock. Each room gave you one digit. Type them in the order of the rooms.", answer: "27491" };
const VAULT_HARD = [
  { e: "📈", room: "The Compound Room", story: "“$1,000 at 20% a year, compound, for 3 years.” The lock: the final amount.", answer: "1728", hint: "1,000 × 1.2 × 1.2 × 1.2", digit: "3" },
  { e: "⚖️", room: "The Factory", story: "“Fixed costs $180,000. Price $4,000. Unit cost $1,600.” The lock: break-even units (round up).", answer: "75", hint: "180,000 ÷ (4,000 − 1,600)", digit: "8" },
  { e: "🥧", room: "The Cap Table", story: "“You own 80%. Investor A buys 20% with new shares. Then investor B buys 25% with new shares.” The lock: your final % (no decimals).", answer: "48", hint: "80 × 0.8 × 0.75", digit: "6" },
  { e: "💵", room: "The Exchange", story: "“You bought US$100 at $3,800. You sell them at $4,370.” The lock: your profit in pesos.", answer: "57000", hint: "100 × (4,370 − 3,800)", digit: "0" },
  { e: "🔥", room: "The Inflation Room", story: "“Prices rose 13.12% in 2022.” The lock: what $1,000,000 under the mattress could buy at end of 2022, in thousands (round).", answer: "884", hint: "1,000,000 ÷ 1.1312", digit: "5" },
  { e: "🔤", room: "The Cipher", story: "Scrambled letters: F · E · E · S. “The silent thief of every investor.” Type the word.", answer: "FEES", hint: "0.1% vs. 2% every year…", digit: "2" },
];
const VAULT_HARD_FINAL = { story: "The master vault: 6 digits, in the order of the rooms.", answer: "386052" };

/* ---------- CREAR CITY · tablero de 20 casillas ---------- */
const CITY = [
  { k: "start", e: "🏁", n: "START", d: "Collect $200,000 salary" },
  { k: "biz", e: "🍪", n: "Cookie Shop", price: 300000, rent: 60000 },
  { k: "q", e: "❓", n: "Question", d: "Right: +$100,000" },
  { k: "biz", e: "🧃", n: "Juice Bar", price: 320000, rent: 64000 },
  { k: "ev", e: "🔥", n: "Inflation", d: "Cash loses 10%" },
  { k: "biz", e: "🍮", n: "Gelatin Lab", price: 360000, rent: 72000 },
  { k: "cdt", e: "📜", n: "CDT Bank", d: "Deposit cash: +10% at START" },
  { k: "biz", e: "🕯️", n: "Candle Studio", price: 400000, rent: 80000 },
  { k: "q", e: "❓", n: "Question", d: "Right: +$100,000" },
  { k: "biz", e: "🧼", n: "Soap Factory", price: 440000, rent: 88000 },
  { k: "ev", e: "🎖️", n: "Scholarship", d: "+$150,000" },
  { k: "biz", e: "🍿", n: "Popcorn Cart", price: 480000, rent: 96000 },
  { k: "scam", e: "🎣", n: "Scam Alert", d: "Answer right or lose $100,000" },
  { k: "biz", e: "🧁", n: "Cupcake Café", price: 520000, rent: 104000 },
  { k: "q", e: "❓", n: "Question", d: "Right: +$100,000" },
  { k: "biz", e: "🍫", n: "Chocolate Bites", price: 560000, rent: 112000 },
  { k: "ev", e: "🌪️", n: "Market Crash", d: "Businesses pay no rent next turn; ETF −20%" },
  { k: "etf", e: "🧺", n: "ETF Square", d: "Invest cash: +15% at START" },
  { k: "tax", e: "🏛️", n: "Taxes", d: "Pay 10% of your cash" },
  { k: "biz", e: "🔑", n: "Keychain Co.", price: 600000, rent: 120000 },
];
/* posición de cada casilla en una cuadrícula 6×6 (perímetro) */
const CITY_POS = [[6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [1, 5], [1, 4], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1]];
const TOKENS = ["🦊", "🐼", "🦁", "🐸"];

/* ---------- CARD DUEL · cartas de conceptos ---------- */
const DUEL_CARDS = [
  { e: "🛏️", n: "Cash at home", ret: 0, safe: 6, liq: 10 }, { e: "📲", n: "Cajita", ret: 3, safe: 9, liq: 10 }, { e: "📜", n: "CDT", ret: 4, safe: 9, liq: 2 },
  { e: "🧱", n: "Bond fund", ret: 4, safe: 8, liq: 7 }, { e: "💵", n: "US dollars", ret: 5, safe: 6, liq: 9 }, { e: "🥇", n: "Gold", ret: 5, safe: 6, liq: 7 },
  { e: "🧺", n: "S&P 500 ETF", ret: 8, safe: 6, liq: 8 }, { e: "🌍", n: "World ETF", ret: 7, safe: 7, liq: 8 }, { e: "🚀", n: "One tech stock", ret: 9, safe: 3, liq: 8 },
  { e: "₿", n: "Bitcoin", ret: 10, safe: 1, liq: 9 }, { e: "🏠", n: "House to rent", ret: 6, safe: 7, liq: 1 }, { e: "🎓", n: "My education", ret: 9, safe: 8, liq: 0 },
  { e: "🍪", n: "My cookie company", ret: 8, safe: 3, liq: 2 }, { e: "🏦", n: "FIC fund", ret: 5, safe: 7, liq: 6 }, { e: "🪙", n: "New meme coin", ret: 7, safe: 0, liq: 6 },
  { e: "🎣", n: "'10% monthly' app", ret: 1, safe: 0, liq: 0 }, { e: "🐷", n: "Piggy bank", ret: 0, safe: 5, liq: 9 }, { e: "🏪", n: "Neighborhood store", ret: 6, safe: 5, liq: 2 },
];
const DUEL_STATS = [["ret", "📈 Return"], ["safe", "🛡️ Safety"], ["liq", "💧 Liquidity"]];

/* =====================================================================
   11° · PERIODO 4 · GAME ZONE — JUEGOS (Clases 1–4)
   ===================================================================== */
const lbSave = (ctx, game, score, extra = {}) => { if (!ctx?.API_URL) return; teamPost(ctx.API_URL, ctx.userData, "lb_save", { game, score, extra }).catch(() => {}); };
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
/* Banco: preguntas del curso + preguntas creadas por la clase (Question Forge) */
function useBank(ctx) {
  const base = useMemo(() => withIds(QB11), []);
  const [cls, setCls] = useState([]);
  useEffect(() => { if (!ctx?.API_URL) return; teamPost(ctx.API_URL, ctx.userData, "qb_list").then((d) => { if (d?.questions) setCls(d.questions.filter((q) => q.mine !== true && Array.isArray(q.options) && q.options.length === 4).map((q) => ({ ...q, _id: `c${q.id}`, t: q.t || "Class bank", lv: Number(q.lv) || 2, cls: true, by: q.by }))); }).catch(() => {}); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return useMemo(() => [...base, ...cls], [base, cls]);
}

/* Tarjeta de pregunta (con tiempo opcional y opciones ocultas para 50:50) */
function QCard({ q, seconds = 0, onAnswer, hide = [], extra, tag, cont = "Continue" }) {
  const [order] = useState(() => shuffleArr(q.options.map((_, i) => i)));
  const [pick, setPick] = useState(null);
  const [left] = useCountdown(seconds || 1, !!seconds && pick == null);
  useEffect(() => { if (seconds && left === 0 && pick == null) setPick(-1); }, [left]); // eslint-disable-line react-hooks/exhaustive-deps
  const ok = pick === q.correct;
  return (
    <div className="g11-qcard">
      <div className="g11-qhead"><span>{tag || q.t}{q.cls ? ` · by ${String(q.by || "a classmate").split(" ")[0]}` : ""}</span>{seconds ? <b className={left <= 5 ? "neg" : ""}>⏱️ {left}s</b> : null}</div>
      <p className="quiz-q">{q.q}</p>
      <div className="quiz-options">{order.map((i, k) => (hide.includes(i) ? <button key={i} type="button" className="quiz-opt g11-gone" disabled><span className="opt-key">{"ABCD"[k]}</span><span className="opt-text">—</span></button> : <button key={i} type="button" disabled={pick != null} className={`quiz-opt ${pick != null && i === q.correct ? "correct" : ""} ${pick === i && i !== q.correct ? "wrong" : ""}`} onClick={() => setPick(i)}><span className="opt-key">{"ABCD"[k]}</span><span className="opt-text">{q.options[i]}</span></button>))}</div>
      {pick == null && extra}
      {pick != null && <div className={`p1-banner ${ok ? "good" : "bad"}`}><span>{ok ? "✅ Correct!" : pick === -1 ? `⏰ Time's up! Answer: ${q.options[q.correct]}` : `❌ The answer was: ${q.options[q.correct]}`}</span><button type="button" className="s1-btn primary" onClick={() => onAnswer(ok)}>{cont} <ChevronRight size={16} /></button></div>}
    </div>
  );
}

/* =========================== C1 · QUESTION FORGE =========================== */
const FORGE_TOPICS = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Build It", "Fund It", "Invest 18+", "Life Plan"];
const forgeIssues = (x) => {
  const out = []; const o = (x.options || []).map((s) => String(s || "").trim());
  if (countWords(x.q) < 6) out.push("The question needs 6+ words.");
  if (o.some((s) => !s)) out.push("Write all 4 options.");
  if (new Set(o.map((s) => s.toLowerCase())).size < 4) out.push("Options must be different.");
  if (x.correct == null) out.push("Mark the correct option.");
  if (o.every(Boolean) && x.correct != null) { const L = o.map((s) => s.length); const sorted = [...L].sort((a, b) => b - a); if (L[x.correct] === sorted[0] && sorted[0] > sorted[1] * 1.25) out.push("⚖️ The correct option is clearly the longest — that gives the answer away. Make the options similar."); if (Math.min(...L) * 3 < sorted[0]) out.push("⚖️ One option is very short compared to the others."); }
  return out;
};
function QuestionForge({ ctx, existing, onSave, onExit }) {
  const blank = () => ({ t: "Fund It", lv: 2, q: "", options: ["", "", "", ""], correct: null });
  const [qs, setQs] = useState(existing?.qs || [blank(), blank(), blank(), blank(), blank()]);
  const [i, setI] = useState(0);
  const [pub, setPub] = useState(existing?.published ? "ok" : null);
  const [st, finish] = useFinish(onSave);
  const Q = qs[i]; const set = (patch) => setQs(qs.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const issues = qs.map(forgeIssues); const allOk = issues.every((x) => !x.length);
  const levels = new Set(qs.map((x) => x.lv)).size; const topics = new Set(qs.map((x) => x.t)).size;
  const publish = async () => { if (!ctx.API_URL) { setPub("bad"); return; } setPub("busy"); try { const d = await teamPost(ctx.API_URL, ctx.userData, "qb_save", { questions: qs.map((x) => ({ t: x.t, lv: x.lv, q: x.q.trim(), options: x.options.map((s) => s.trim()), correct: x.correct })) }); setPub(d?.status === "error" ? "bad" : "ok"); } catch (e) { setPub("bad"); } };
  if (st.done) return <Reward title="Question Master! ⚒️" subtitle={pub === "ok" ? "Your 5 questions are in the class bank." : "Saved (not published)."} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Hammer size={22} strokeWidth={2.1} />} title="Question Forge ⚒️" subtitle="Create 5 fair questions about the whole FinFluent journey (6°–11°). They'll appear in your classmates' Millionaire, Battleship and duels!" onExit={onExit}>
      <Brief91 k="c1_forge" />
      <div className="g10-chips">{qs.map((x, k) => <button key={k} type="button" className={`${k === i ? "on" : ""} ${issues[k].length ? "" : "g11-placed"}`} onClick={() => setI(k)}>{issues[k].length ? "✏️" : "✅"} Question {k + 1}</button>)}</div>
      <div className="g10-two">
        <div className="start-block"><h3>✏️ Question {i + 1}</h3>
          <div className="g11-inline"><select className="start-input" value={Q.t} onChange={(e) => set({ t: e.target.value })}>{FORGE_TOPICS.map((t) => <option key={t}>{t}</option>)}</select><select className="start-input" value={Q.lv} onChange={(e) => set({ lv: Number(e.target.value) })}><option value={1}>⭐ Easy</option><option value={2}>⭐⭐ Medium</option><option value={3}>⭐⭐⭐ Hard</option></select></div>
          <textarea className="start-input g11-gap" rows={2} value={Q.q} onChange={(e) => set({ q: e.target.value })} placeholder="A shark offers $300,000 for 20% of your company. The valuation is…" />
          {Q.options.map((o, k) => <div key={k} className={`g11-opt-edit ${Q.correct === k ? "on" : ""}`}><button type="button" title="Mark as correct" onClick={() => set({ correct: k })}>{Q.correct === k ? "✅" : "⬜"}</button><input className="start-input" value={o} placeholder={`Option ${"ABCD"[k]}`} onChange={(e) => set({ options: Q.options.map((y, j) => (j === k ? e.target.value : y)) })} /></div>)}
          {issues[i].length ? <ul className="g11-issues">{issues[i].map((x) => <li key={x}>{x}</li>)}</ul> : <p className="g91-note pos">✅ Fair question! Options are similar and the answer is not obvious.</p>}
        </div>
        <div className="start-block"><h3>📏 The Fair Question rules</h3><ul className="g11-rules"><li>All 4 options must be <b>possible</b> — no silly answers.</li><li>Options of <b>similar length</b>: the correct one must not be the longest.</li><li>Change the position of the correct answer (it will be shuffled anyway).</li><li>Mix levels and topics.</li></ul>
          <div className="g91-mini"><span className={levels >= 2 ? "pos" : "neg"}>Levels <b>{levels}/3</b></span><span className={topics >= 3 ? "pos" : "neg"}>Topics <b>{topics}</b> (3+)</span><span>Ready <b>{issues.filter((x) => !x.length).length}/5</b></span></div></div>
      </div>
      <div className="start-foot">
        <button className="s1-btn ghost" disabled={!allOk || pub === "busy"} onClick={publish}><Send size={16} /> {pub === "ok" ? "Published ✓ (update)" : pub === "busy" ? "Publishing…" : pub === "bad" ? "Not published — try again" : "Publish to the class bank"}</button>
        <button className="s1-btn primary big" disabled={!allOk || levels < 2 || topics < 3} onClick={() => finish(30 + (pub === "ok" ? 6 : 0), { qs, published: pub === "ok" })}>Save my questions <span className="coin-tag"><Coins size={15} /> +{30 + (pub === "ok" ? 6 : 0)}</span></button>
      </div>
    </ActShell>
  );
}

/* ---------- C1 · Revisar preguntas de la clase ---------- */
function QuestionReview({ ctx, onSave, onExit }) {
  const bank = useBank(ctx);
  const [deck, setDeck] = useState(null);
  const [i, setI] = useState(0);
  const [stage, setStage] = useState("q");
  const [right, setRight] = useState(0);
  const [rates, setRates] = useState({});
  const [st, finish] = useFinish(onSave);
  const cls = bank.filter((q) => q.cls);
  const start = () => setDeck(sample(cls.length >= 6 ? cls : [...cls, ...sample(bank.filter((q) => !q.cls), 6 - cls.length)], 6));
  const rate = (r) => { const q = deck[i]; setRates({ ...rates, [q._id]: r }); if (q.cls && ctx.API_URL) teamPost(ctx.API_URL, ctx.userData, "qb_rate", { id: q.id, rate: r }).catch(() => {}); if (i < deck.length - 1) { setI(i + 1); setStage("q"); } else setStage("end"); };
  if (st.done) return <Reward title="Quality reviewer! 🔍" subtitle={`${right}/6 right · ${Object.keys(rates).length} reviews`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Question Review 🔍" subtitle="Answer 6 questions your classmates created — then judge them: clear and fair?" onExit={onExit}>
      <Brief91 k="c1_review" />
      {!deck ? <><p className="start-tip">{cls.length ? `📚 The class bank has ${cls.length} questions from your classmates.` : "📚 The class bank is still empty — you'll review course questions now. Come back later!"}</p><div className="start-foot"><button className="s1-btn primary big" onClick={start}>Start the review</button></div></> : stage === "end" ? (
        <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(14 + right * 3, { right, rates })}>Save my review <span className="coin-tag"><Coins size={15} /> +{14 + right * 3}</span></button></div>
      ) : stage === "q" ? <QCard key={deck[i]._id} q={deck[i]} tag={`${i + 1}/6 · ${deck[i].t}`} onAnswer={(ok) => { if (ok) setRight(right + 1); setStage("rate"); }} cont="Judge this question" /> : (
        <div className="start-block"><h3>⚖️ Is this question fair?</h3><p className="quiz-q">{deck[i].q}</p><div className="g10-ab four"><button type="button" onClick={() => rate("good")}><em>👍</em><b>Clear & fair</b></button><button type="button" onClick={() => rate("hard")}><em>🤔</em><b>Confusing</b></button><button type="button" onClick={() => rate("easy")}><em>🎯</em><b>Answer too obvious</b></button><button type="button" onClick={() => rate("wrong")}><em>❌</em><b>Answer is wrong</b></button></div></div>
      )}
    </ActShell>
  );
}

/* ---------- C1 · ¿Quién quiere ser millonario? ---------- */
const MILL_LV = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3];
const MILL_PRIZE = [100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000, 20000000, 50000000, 100000000, 250000000, 1000000000];
const MILL_SAFE = [3, 7];
const bigCOP = (v) => (v >= 1000000000 ? "$1,000 MILLION" : v >= 1000000 ? `$${(v / 1000000).toLocaleString("en-US")} million` : cop(v));
function Millionaire({ ctx, existing, onSave, onExit }) {
  const bank = useBank(ctx);
  const [lvl, setLvl] = useState(0);
  const [q, setQ] = useState(null);
  const [used, setUsed] = useState([]);
  const [life, setLife] = useState({ fifty: true, ask: true, swap: true });
  const [hide, setHide] = useState([]);
  const [poll, setPoll] = useState(null);
  const [end, setEnd] = useState(null);
  const [best, setBest] = useState(existing?.best || 0);
  const [n, setN] = useState(0);
  const [st, finish] = useFinish(onSave);
  const draw = (l, u = used) => { const x = qbPick(bank, MILL_LV[l], u); setQ(x); setUsed([...u, x._id]); setHide([]); setPoll(null); setN((k) => k + 1); };
  const safeWin = (l) => { const s = MILL_SAFE.filter((x) => x < l); return s.length ? MILL_PRIZE[s[s.length - 1]] : 0; };
  const stop = (prize, levels, why) => { setEnd({ prize, levels, why }); setBest(Math.max(best, levels)); lbSave(ctx, "mill", levels, { prize }); };
  const answer = (ok) => { if (!ok) { stop(safeWin(lvl), lvl, "wrong"); return; } if (lvl === 11) { stop(MILL_PRIZE[11], 12, "top"); return; } setLvl(lvl + 1); draw(lvl + 1); };
  const fifty = () => { const wrong = [0, 1, 2, 3].filter((k) => k !== q.correct); setHide(sample(wrong, 2)); setLife({ ...life, fifty: false }); };
  const ask = () => { const c = 40 + Math.floor(Math.random() * 30) - MILL_LV[lvl] * 5; const rest = [0, 1, 2, 3].filter((k) => k !== q.correct && !hide.includes(k)); let left = 100 - c; const v = {}; rest.forEach((k, j) => { const x = j === rest.length - 1 ? left : Math.floor(Math.random() * left * 0.7); v[k] = x; left -= x; }); v[q.correct] = c; setPoll(v); setLife({ ...life, ask: false }); };
  const coins = 14 + best * 2;
  if (st.done) return <Reward title="Millionaire mind! 💰" subtitle={`Best: level ${best}/12`} coins={st.coins} saving={st.saving} onExit={onExit} gold={best >= 12} />;
  return (
    <ActShell icon={<Crown size={22} strokeWidth={2.1} />} title="Who Wants to Be a FinFluent Millionaire? 💰" subtitle="12 questions from 6° to 11°. 3 lifelines. Safe levels at $1 million and $20 million. Walk away whenever you want." onExit={onExit}>
      <Brief91 k="c1_mill" />
      <div className="g11-mill">
        <div className="g11-ladder">{MILL_PRIZE.map((p, k) => k).reverse().map((k) => <div key={k} className={`${k === lvl && q && !end ? "on" : ""} ${k < lvl || (end && k < end.levels) ? "done" : ""} ${MILL_SAFE.includes(k) ? "safe" : ""}`}><span>{k + 1}</span><b>{bigCOP(MILL_PRIZE[k])}</b></div>)}</div>
        <div className="g11-mill-main">
          {!q && !end && <div className="g11-mill-start"><em>💰</em><h3>Ready, {ctx.name.split(" ")[0]}?</h3><p>{bank.filter((x) => x.cls).length ? `${bank.filter((x) => x.cls).length} questions were created by your class!` : "Questions from the whole FinFluent journey."}</p><button className="s1-btn primary big" onClick={() => draw(0, [])}>Let's play!</button></div>}
          {q && !end && <>
            <div className="g11-lifes"><button type="button" disabled={!life.fifty} onClick={fifty}>50:50</button><button type="button" disabled={!life.ask} onClick={ask}>👥 Ask the class</button><button type="button" disabled={!life.swap} onClick={() => { setLife({ ...life, swap: false }); draw(lvl); }}>🔄 Switch</button><button type="button" className="walk" disabled={lvl === 0} onClick={() => stop(MILL_PRIZE[lvl - 1], lvl, "walk")}>🚶 Walk away with {lvl ? bigCOP(MILL_PRIZE[lvl - 1]) : "$0"}</button></div>
            <QCard key={n} q={q} seconds={lvl >= 8 ? 45 : 30} hide={hide} tag={`Level ${lvl + 1} · for ${bigCOP(MILL_PRIZE[lvl])}`} onAnswer={answer} extra={poll && <div className="g11-poll">{[0, 1, 2, 3].map((k) => <div key={k}><span>{q.options[k]}</span><i style={{ width: `${poll[k] || 0}%` }} /><b>{poll[k] || 0}%</b></div>)}</div>} />
          </>}
          {end && <div className={`g11-mill-end ${end.why === "wrong" ? "bad" : "good"}`}><em>{end.why === "top" ? "🏆" : end.why === "walk" ? "🚶" : "💥"}</em><h3>{end.why === "top" ? "FINFLUENT MILLIONAIRE!" : end.why === "walk" ? "Smart exit!" : "Oh no!"}</h3><p>You take home <b>{bigCOP(end.prize)}</b> (play money) · level {end.levels}/12</p><div className="p3-card-actions"><button className="s1-btn ghost" onClick={() => { setLvl(0); setEnd(null); setQ(null); setLife({ fifty: true, ask: true, swap: true }); }}><RefreshCw size={16} /> Play again</button><button className="s1-btn primary" onClick={() => finish(coins, { best })}>Save my best <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div></div>}
        </div>
      </div>
    </ActShell>
  );
}

/* =========================== C2 · BATTLESHIP =========================== */
const BS_SHIPS = [3, 2, 2, 1];
const bsRandom = () => { const taken = new Set(); const ships = []; BS_SHIPS.forEach((L) => { for (let t = 0; t < 300; t++) { const h = Math.random() < 0.5; const r = Math.floor(Math.random() * (h ? 6 : 7 - L)); const c = Math.floor(Math.random() * (h ? 7 - L : 6)); const cells = Array.from({ length: L }, (_, k) => (h ? `${r},${c + k}` : `${r + k},${c}`)); if (cells.every((x) => !taken.has(x))) { cells.forEach((x) => taken.add(x)); ships.push(cells); break; } } }); return ships; };
const bsSunk = (ships, shots) => ships.filter((s) => s.every((k) => shots[k] === "hit"));
const bsAll = (ships, shots) => ships.length > 0 && ships.every((s) => s.every((k) => shots[k] === "hit"));
const bsShoot = (ships, shots, k) => ({ ...shots, [k]: ships.some((s) => s.includes(k)) ? "hit" : "miss" });
/* IA: si hay un impacto sin hundir, dispara al lado; si no, en damero */
const bsAI = (ships, shots) => { const sunk = new Set(bsSunk(ships, shots).flat()); const open = Object.keys(shots).filter((k) => shots[k] === "hit" && !sunk.has(k)); const free = (r, c) => r >= 0 && r < 6 && c >= 0 && c < 6 && !shots[`${r},${c}`]; for (const k of open) { const [r, c] = k.split(",").map(Number); const n = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => free(a, b)); if (n.length) { const [a, b] = n[Math.floor(Math.random() * n.length)]; return `${a},${b}`; } } const all = []; for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) if (free(r, c) && (r + c) % 2 === 0) all.push(`${r},${c}`); const any = []; for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) if (free(r, c)) any.push(`${r},${c}`); const pool = all.length ? all : any; return pool[Math.floor(Math.random() * pool.length)]; };
function BSGrid({ ships = [], shots = {}, reveal, onCell, label, glow }) {
  const shipSet = new Set(ships.flat()); const sunkSet = new Set(bsSunk(ships, shots).flat());
  return (
    <div className={`g11-bs-wrap ${glow ? "glow" : ""}`}><small>{label}</small>
      <div className="g11-bs"><span className="c" />{"ABCDEF".split("").map((l) => <span key={l} className="c">{l}</span>)}
        {Array.from({ length: 6 }, (_, r) => [<span key={`r${r}`} className="c">{r + 1}</span>, ...Array.from({ length: 6 }, (_, c) => { const k = `${r},${c}`; const s = shots[k]; const cls = [reveal && shipSet.has(k) ? "ship" : "", s || "", sunkSet.has(k) ? "sunk" : ""].join(" "); return <button key={k} type="button" className={cls} disabled={!onCell || !!s} onClick={() => onCell && onCell(k)}>{s === "hit" ? (sunkSet.has(k) ? "💥" : "🔥") : s === "miss" ? "•" : reveal && shipSet.has(k) ? "🚢" : ""}</button>; })])}
      </div>
    </div>
  );
}
function BattleCPU({ ctx, onSave, onExit }) {
  const bank = useBank(ctx);
  const [mine, setMine] = useState(bsRandom);
  const [cpu] = useState(bsRandom);
  const [play, setPlay] = useState(false);
  const [myShots, setMyShots] = useState({});
  const [cpuShots, setCpuShots] = useState({});
  const [q, setQ] = useState(null);
  const [n, setN] = useState(0);
  const [fire, setFire] = useState(false);
  const [msg, setMsg] = useState("");
  const [stats, setStats] = useState({ right: 0, total: 0 });
  const [st, finish] = useFinish(onSave);
  const won = bsAll(cpu, myShots); const lost = bsAll(mine, cpuShots); const over = won || lost;
  const nextQ = () => { setQ(qbPick(bank, null)); setN((k) => k + 1); };
  const answer = (ok) => { setStats({ right: stats.right + (ok ? 1 : 0), total: stats.total + 1 }); setQ(null); if (ok) { setFire(true); setMsg("🎯 Correct! Choose a cell on the enemy board and FIRE."); } else { const k = bsAI(mine, cpuShots); const ns = bsShoot(mine, cpuShots, k); setCpuShots(ns); const [r, c] = k.split(",").map(Number); setMsg(`❌ Wrong answer — the enemy fired at ${"ABCDEF"[c]}${r + 1}: ${ns[k] === "hit" ? "🔥 HIT!" : "missed."}`); } };
  const shoot = (k) => { const ns = bsShoot(cpu, myShots, k); setMyShots(ns); setFire(false); const [r, c] = k.split(",").map(Number); const sunkNow = bsSunk(cpu, ns).length > bsSunk(cpu, myShots).length; setMsg(`${"ABCDEF"[c]}${r + 1}: ${ns[k] === "hit" ? (sunkNow ? "💥 SUNK!" : "🔥 HIT!") : "• Miss."}`); };
  const coins = Math.min(40, 18 + stats.right * 2 + (won ? 8 : 0));
  if (st.done) return <Reward title={won ? "Admiral of Finance! ⚓" : "Brave captain! ⚓"} subtitle={`${stats.right}/${stats.total} answers right`} coins={st.coins} saving={st.saving} onExit={onExit} gold={won} />;
  return (
    <ActShell icon={<Ship size={22} strokeWidth={2.1} />} title="Finance Battleship ⚓ · vs. Computer" subtitle="Right answer = YOU fire. Wrong answer = the ENEMY fires. Sink 4 ships (3, 2, 2, 1)." onExit={onExit}>
      <Brief91 k="c2_cpu" />
      {!play ? <><BSGrid ships={mine} reveal label="🚢 Your fleet" /><div className="start-foot"><button className="s1-btn ghost" onClick={() => setMine(bsRandom())}><Shuffle size={16} /> Move my ships</button><button className="s1-btn primary big" onClick={() => { setPlay(true); nextQ(); }}>Start the battle ⚓</button></div></> : (
        <>
          <div className="g11-bs-two"><BSGrid ships={bsSunk(cpu, myShots)} shots={myShots} label={`🎯 Enemy waters · ${bsSunk(cpu, myShots).length}/4 sunk`} onCell={fire && !over ? shoot : null} glow={fire} /><BSGrid ships={mine} shots={cpuShots} reveal label={`🚢 Your fleet · ${4 - bsSunk(mine, cpuShots).length}/4 afloat`} /></div>
          {msg && <p className="g11-bs-msg">{msg}</p>}
          {!over && q && <QCard key={n} q={q} seconds={30} onAnswer={answer} cont="OK" />}
          {!over && !q && !fire && <div className="start-foot"><button className="s1-btn primary big" onClick={nextQ}>Next question ❓</button></div>}
          {over && <div className={`p1-banner ${won ? "good" : "bad"}`}><span>{won ? "🏆 You sank the whole enemy fleet!" : "💥 Your fleet was sunk. Study and try again!"} · {stats.right}/{stats.total} right</span></div>}
          {over && <div className="start-foot"><button className="s1-btn primary big" onClick={() => { lbSave(ctx, "bs", won ? 1 : 0, { right: stats.right }); finish(coins, { win: won, right: stats.right, total: stats.total }); }}>Save my battle <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>}
        </>
      )}
    </ActShell>
  );
}
/* ---------- C2 · Battleship online 1 vs 1 (Apps Script bs_*) ---------- */
function BattleOnline({ ctx, onSave, onExit }) {
  const bank = useBank(ctx);
  const [board, setBoard] = useState(bsRandom);
  const [room, setRoom] = useState(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState(null);
  const [n, setN] = useState(0);
  const [fire, setFire] = useState(false);
  const [stats, setStats] = useState({ right: 0, total: 0 });
  const [st, finish] = useFinish(onSave);
  const call = async (action, extra) => { setBusy(true); setErr(""); try { const d = await teamPost(ctx.API_URL, ctx.userData, action, extra); if (d?.status === "error") { setErr(d.message); return null; } if (d?.room) setRoom(d.room); return d; } catch (e) { setErr("Connection problem. Try again."); return null; } finally { setBusy(false); } };
  const myTurn = room && !room.winner && room.ready?.A && room.ready?.B && room.turn === room.me;
  useEffect(() => { if (!room || room.winner || myTurn) return undefined; const id = setInterval(() => { teamPost(ctx.API_URL, ctx.userData, "bs_state", { code: room.code }).then((d) => { if (d?.room) setRoom(d.room); }).catch(() => {}); }, 2500); return () => clearInterval(id); }, [room?.code, room?.turn, room?.winner, myTurn]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (myTurn && !q && !fire) { setQ(qbPick(bank, null)); setN((k) => k + 1); } }, [myTurn]); // eslint-disable-line react-hooks/exhaustive-deps
  const answer = async (ok) => { setStats({ right: stats.right + (ok ? 1 : 0), total: stats.total + 1 }); setQ(null); if (ok) setFire(true); else await call("bs_pass", { code: room.code }); };
  const shoot = async (k) => { setFire(false); await call("bs_fire", { code: room.code, cell: k }); };
  const win = room?.winner && room.winner === room.me; const opp = room ? room.names?.[room.me === "A" ? "B" : "A"] : "";
  const coins = Math.min(44, 20 + stats.right * 2 + (win ? 10 : 0));
  if (!ctx.API_URL) return <ActShell icon={<Ship size={22} strokeWidth={2.1} />} title="Battleship Online" subtitle="" onExit={onExit}><div className="p1-banner bad"><span>Online mode needs the internet connection of the platform. Play against the computer instead.</span></div></ActShell>;
  if (st.done) return <Reward title={win ? "Online champion! 🏆" : "Great battle! ⚓"} subtitle={`vs. ${opp || "a classmate"} · ${stats.right}/${stats.total} right`} coins={st.coins} saving={st.saving} onExit={onExit} gold={win} />;
  return (
    <ActShell icon={<Anchor size={22} strokeWidth={2.1} />} title="Battleship Online ⚓ · 1 vs 1" subtitle="Challenge a classmate. Each turn: answer → fire. A wrong answer passes the turn." onExit={onExit}>
      <Brief91 k="c2_online" />
      {err && <div className="p1-banner bad"><span>{err}</span></div>}
      {!room ? (
        <div className="g10-two">
          <div className="start-block"><h3>🚢 Your fleet</h3><BSGrid ships={board} reveal label="Placed at random" /><button className="s1-btn ghost" onClick={() => setBoard(bsRandom())}><Shuffle size={16} /> Move my ships</button></div>
          <div className="start-block"><h3>🆕 Create a battle</h3><p className="start-tip">You get a code. Tell it to your rival.</p><button className="s1-btn primary big" disabled={busy} onClick={() => call("bs_create", { board })}>Create battle</button>
            <h3 className="g11-gap">🔑 Join a battle</h3><input className="start-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Code (e.g. BX7K)" /><button className="s1-btn primary" disabled={busy || code.length < 4} onClick={() => call("bs_join", { code, board })}>Join</button></div>
        </div>
      ) : (
        <>
          <div className="g11-bs-code"><span>BATTLE CODE</span><b>{room.code}</b><small>{room.ready?.B ? `⚔️ ${room.names?.A || "A"} vs. ${room.names?.B || "B"}` : "Waiting for your rival… share the code."}</small></div>
          <div className="g11-bs-two"><BSGrid ships={room.theirSunk || []} shots={room.myShots || {}} label={`🎯 ${opp || "Rival"}'s waters · ${(room.theirSunk || []).length}/4 sunk`} onCell={fire && myTurn ? shoot : null} glow={fire} /><BSGrid ships={room.myShips || board} shots={room.theirShots || {}} reveal label={`🚢 Your fleet · ${4 - bsSunk(room.myShips || board, room.theirShots || {}).length}/4 afloat`} /></div>
          {!room.winner && room.ready?.B && !myTurn && <p className="g11-bs-msg">⏳ {opp}'s turn… (the board updates by itself)</p>}
          {myTurn && q && <QCard key={n} q={q} seconds={30} onAnswer={answer} cont="OK" />}
          {myTurn && fire && <p className="g11-bs-msg">🎯 Correct! Tap a cell on {opp}'s waters and FIRE.</p>}
          {room.winner && <><div className={`p1-banner ${win ? "good" : "bad"}`}><span>{win ? `🏆 You sank ${opp}'s fleet!` : `💥 ${opp} sank your fleet. Rematch?`}</span></div><div className="start-foot"><button className="s1-btn ghost" onClick={() => { setRoom(null); setBoard(bsRandom()); }}><RefreshCw size={16} /> New battle</button><button className="s1-btn primary big" onClick={() => { lbSave(ctx, "bs", win ? 1 : 0, { online: true }); finish(coins, { win, opp, right: stats.right, total: stats.total }); }}>Save my battle <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div></>}
        </>
      )}
    </ActShell>
  );
}
const RUSH_YEAR = {
  buckets: [{ id: "build", e: "🛠️", l: "Build It", d: "product, brand, price", c: "#c8743a" }, { id: "fund", e: "🦈", l: "Fund It", d: "P&L, cash, valuation", c: "#6d3b8f" }, { id: "inv", e: "📈", l: "Invest & Life", d: "assets, inflation, university", c: "#3c9d5d" }],
  items: [
    { e: "🎨", t: "Choosing the colors of a logo", b: "build", why: "Branding." }, { e: "🧮", t: "Unit cost of one cookie", b: "build", why: "Costing the product." }, { e: "🗣️", t: "Interviewing customers about a problem", b: "build", why: "Discovery." },
    { e: "🏷️", t: "Cost-plus pricing", b: "build", why: "Pricing." }, { e: "⚖️", t: "Break-even units", b: "build", why: "Launch math." },
    { e: "📒", t: "Net profit in the P&L", b: "fund", why: "Income statement." }, { e: "💧", t: "Running out of cash while profitable", b: "fund", why: "Cash flow." }, { e: "💎", t: "$200,000 for 10% = $2,000,000", b: "fund", why: "Valuation." },
    { e: "🥧", t: "Dilution in a cap table", b: "fund", why: "Equity." }, { e: "🏦", t: "Crowdfunding pre-sales", b: "fund", why: "Funding." },
    { e: "🔥", t: "Real return after inflation", b: "inv", why: "Investing." }, { e: "🧺", t: "An ETF with 500 companies", b: "inv", why: "Diversification." }, { e: "🌪️", t: "Holding during a market crash", b: "inv", why: "Behavior." },
    { e: "🎓", t: "The funding gap for 5 semesters", b: "inv", why: "Life plan." }, { e: "🪪", t: "Opening an account at 18 with your cédula", b: "inv", why: "Life plan." },
  ],
};

/* =========================== C3 · ESCAPE ROOM =========================== */
function VaultGame({ ctx, k, rooms, final, title, subtitle, limit, coinsBase = 30, game, onSave, onExit }) {
  const team = (ctx.resp?.__p1?.c1_team || {}).name;
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [hints, setHints] = useState([]);
  const [wrong, setWrong] = useState(0);
  const [t, setT] = useState(0);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(false);
  const [st, finish] = useFinish(onSave);
  const total = t + hints.length * 60 + wrong * 10; const timeUp = !!limit && total >= limit && !done;
  useEffect(() => { if (!started || done || timeUp) return undefined; const id = setInterval(() => setT((x) => x + 1), 1000); return () => clearInterval(id); }, [started, done, timeUp]);
  const isFinal = i >= rooms.length; const R = isFinal ? final : rooms[i];
  const norm = (s) => String(s).toUpperCase().replace(/[^0-9A-Z]/g, "");
  const tryIt = () => { if (norm(val) === norm(R.answer)) { setVal(""); if (isFinal) setDone(true); else setI(i + 1); } else { setWrong(wrong + 1); setShake(true); setTimeout(() => setShake(false), 500); } };
  const fast = done && total <= (limit ? limit * 0.6 : 600);
  const coins = coinsBase + (done ? 8 : 0) + (fast ? 6 : 0);
  if (st.done) return <Reward title={done ? "ESCAPED! 🔓" : "The vault won this time 🔒"} subtitle={done ? `Time ${mmss(total)} · ${hints.length} hints` : `${i}/${rooms.length} rooms`} coins={st.coins} saving={st.saving} onExit={onExit} gold={fast} />;
  return (
    <ActShell icon={<Lock size={22} strokeWidth={2.1} />} title={title} subtitle={subtitle} onExit={onExit}>
      <Brief91 k={k} />
      {!started ? <div className="g11-vault-intro"><em>🏦</em><h3>{team ? `Team ${team}, ` : ""}the CREAR Bank vault is locked!</h3><p>{rooms.length} rooms. Each lock gives you one digit of the master code. Hints cost +60 s · wrong codes +10 s.{limit ? ` You have ${mmss(limit)}.` : ""}</p><p className="start-tip">👥 Play as a team on ONE tablet: one reads, one calculates, one writes, one checks.</p><button className="s1-btn primary big" onClick={() => setStarted(true)}>Enter the vault ⏱️</button></div> : (
        <>
          <div className="g11-vault-top"><span>⏱️ {limit ? `${mmss(Math.max(0, limit - total))} left` : mmss(total)}</span><div className="g11-digits">{rooms.map((r, k) => <b key={k} className={k < i ? "on" : ""}>{k < i ? r.digit : "?"}</b>)}</div><span>💡 {hints.length} · ❌ {wrong}</span></div>
          <div className="g11-rooms">{rooms.map((r, k) => <span key={k} className={k < i ? "done" : k === i ? "on" : ""}>{k < i ? "🔓" : r.e}</span>)}<span className={isFinal ? "on" : ""}>🏦</span></div>
          {done ? <div className="p1-banner good"><span>🔓 THE VAULT IS OPEN! Time {mmss(total)} (with penalties).</span></div> : timeUp ? <div className="p1-banner bad"><span>⏰ Time's up! You opened {i}/{rooms.length} rooms.</span></div> : (
            <div className={`start-block g11-lock ${shake ? "shake" : ""}`}><h3>{isFinal ? "🏦 THE MASTER VAULT" : `${R.e} Room ${i + 1} · ${R.room}`}</h3><p>{R.story}</p>
              {isFinal && <p className="g91-note">Your digits: <b>{rooms.map((r) => r.digit).join(" ")}</b></p>}
              <div className="g11-inline"><input className="start-input g11-code" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") tryIt(); }} placeholder="Type the code" /><button className="s1-btn primary" disabled={!val.trim()} onClick={tryIt}>🔓 Try</button></div>
              {!isFinal && (hints.includes(i) ? <p className="start-tip">💡 {R.hint}</p> : <button type="button" className="p1-link" onClick={() => setHints([...hints, i])}>💡 Show a hint (+60 s)</button>)}
            </div>
          )}
          {(done || timeUp) && <div className="start-foot"><button className="s1-btn primary big" onClick={() => { if (done) lbSave(ctx, game, total, { hints: hints.length }); finish(coins, { escaped: done, time: total, hints: hints.length, wrong, rooms: i }); }}>Save my escape <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>}
        </>
      )}
    </ActShell>
  );
}
/* ---------- C3 · Crea un candado para otro equipo ---------- */
function LockMaker({ existing, onSave, onExit }) {
  const [L, setL] = useState(existing?.lock || { e: "🧁", room: "", story: "", answer: "", hint: "" });
  const [st, finish] = useFinish(onSave);
  const set = (p) => setL({ ...L, ...p });
  const ok = countWords(L.room) >= 1 && countWords(L.story) >= 20 && /\d/.test(L.story) && String(L.answer).trim().length >= 2 && countWords(L.hint) >= 4 && realText(L.story);
  if (st.done) return <Reward title="Lock designer! 🔐" subtitle="Print it and give it to another team." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<KeyRound size={22} strokeWidth={2.1} />} title="Lock Maker 🔐" subtitle="Design a lock for another team: a short story with real numbers, a code and a hint." onExit={onExit}>
      <Brief91 k="c3_maker" />
      <div className="g10-two">
        <div className="start-block"><div className="g10-chips">{["🧁", "🦈", "🔥", "🧺", "🎓", "💵", "📈", "🏦"].map((x) => <button key={x} type="button" className={L.e === x ? "on" : ""} onClick={() => set({ e: x })}>{x}</button>)}</div>
          <input className="start-input g11-gap" value={L.room} onChange={(e) => set({ room: e.target.value })} placeholder="Room name (e.g. The Cupcake Factory)" />
          <textarea className="start-input g11-gap" rows={4} value={L.story} onChange={(e) => set({ story: e.target.value })} placeholder="“The cupcake shop has fixed costs of $150,000. Each cupcake sells for $5,000 and costs $2,000. The lock: break-even units.”" />
          <div className="g11-inline"><input className="start-input" value={L.answer} onChange={(e) => set({ answer: e.target.value })} placeholder="Code (e.g. 50)" /><input className="start-input" value={L.hint} onChange={(e) => set({ hint: e.target.value })} placeholder="Hint (e.g. fixed ÷ (price − cost))" /></div>
          <p className="start-tip">✅ 20+ words · at least one number · a code · a hint of 4+ words. Check your math twice!</p></div>
        <div className="start-block"><div className="g11-lockcard" id="g11-lockcard"><small>CREAR VAULT · LOCK CARD</small><h3>{L.e} {L.room || "My room"}</h3><p>{L.story || "Your story appears here…"}</p><div className="g11-digits">{String(L.answer || "????").split("").map((_, k) => <b key={k}>?</b>)}</div><i>💡 Hint (fold here): {L.hint || "…"}</i></div></div>
      </div>
      <div className="start-foot"><button className="s1-btn ghost" onClick={() => downloadPNG("g11-lockcard", "Lock_Card.png")}><Download size={16} /> PNG to print</button><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(26, { lock: L })}>Save my lock <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
    </ActShell>
  );
}

/* =========================== C4 · CREAR CITY =========================== */
const CITY_ROUNDS = 10;
const netWorth = (g, k) => { const p = g.P[k]; return p.cash + p.cdt + p.etf + Object.entries(g.own).filter(([, o]) => o === k).reduce((a, [pos]) => a + CITY[pos].price, 0); };
function CityGame({ ctx, existing, onSave, onExit }) {
  const bank = useBank(ctx);
  const [names, setNames] = useState([ctx.name.split(" ")[0], "", "", ""]);
  const [g, setG] = useState(null);
  const [st, finish] = useFinish(onSave);
  const next = (x) => {
    let P = x.P.map((p) => (p.cash < 0 && !p.out ? { ...p, out: true, cash: 0 } : p)); const own = { ...x.own }; const log = [...x.log];
    P.forEach((p, k) => { if (p.out) Object.keys(own).forEach((s) => { if (own[s] === k) delete own[s]; }); if (p.out && !x.P[k].out) log.push(`💀 ${p.tok} ${p.n} went bankrupt!`); });
    let t = x.turn, r = x.round; for (let s = 0; s < P.length; s++) { t = (t + 1) % P.length; if (t === 0) r++; if (!P[t].out) break; }
    const alive = P.filter((p) => !p.out).length;
    return { ...x, P, own, log: log.slice(-6), turn: t, round: r, crash: Math.max(0, x.crash - 1), pend: null, over: r > CITY_ROUNDS || alive <= 1 };
  };
  const start = () => { const ps = names.map((n) => n.trim()).filter(Boolean).slice(0, 4).map((n, k) => ({ n, tok: TOKENS[k], pos: 0, cash: 1000000, cdt: 0, etf: 0, out: false })); setG({ P: ps, own: {}, turn: 0, round: 1, crash: 0, log: ["🏁 Everybody starts with $1,000,000. Buy businesses, invest, answer — the richest in net worth after 10 rounds wins!"], pend: null, dice: null, over: false, qn: 0 }); };
  const roll = () => { const d = 1 + Math.floor(Math.random() * 6); const pq = qbPick(bank, null); setG((x) => {
    const p = x.P[x.turn]; const pos = (p.pos + d) % 20; let me = { ...p, pos }; const log = [...x.log, `🎲 ${p.tok} ${p.n} rolled ${d} → ${CITY[pos].e} ${CITY[pos].n}`];
    if (p.pos + d >= 20) { me = { ...me, cash: me.cash + 200000, cdt: Math.round(me.cdt * 1.1), etf: Math.round(me.etf * 1.15) }; log.push(`🏁 ${p.tok} passed START: +$200,000${p.cdt ? " · CDT +10%" : ""}${p.etf ? " · ETF +15%" : ""}`); }
    let P = x.P.map((y, k) => (k === x.turn ? me : y)); let crash = x.crash; let pend = null; const sq = CITY[pos];
    if (sq.k === "biz") { const o = x.own[pos]; if (o == null) pend = { type: "buy", pos }; else if (o !== x.turn) { const rent = crash ? 0 : sq.rent; P = P.map((y, k) => (k === x.turn ? { ...y, cash: y.cash - rent } : k === o ? { ...y, cash: y.cash + rent } : y)); log.push(crash ? "🌪️ Crash: no rent this turn." : `💸 ${p.tok} paid ${cop(rent)} rent to ${x.P[o].tok}`); } }
    if (sq.k === "q" || sq.k === "scam") pend = { type: sq.k, q: pq };
    if (sq.k === "cdt" || sq.k === "etf") pend = { type: sq.k };
    if (sq.k === "tax") { const tx = Math.round(Math.max(0, me.cash) * 0.1); P = P.map((y, k) => (k === x.turn ? { ...y, cash: y.cash - tx } : y)); log.push(`🏛️ Taxes: −${cop(tx)}`); }
    if (sq.k === "ev") { if (sq.n === "Inflation") { P = P.map((y, k) => (k === x.turn ? { ...y, cash: Math.round(y.cash * 0.9) } : y)); log.push("🔥 Inflation: your cash lost 10%."); } else if (sq.n === "Scholarship") { P = P.map((y, k) => (k === x.turn ? { ...y, cash: y.cash + 150000 } : y)); log.push("🎖️ Scholarship: +$150,000!"); } else { P = P.map((y) => ({ ...y, etf: Math.round(y.etf * 0.8) })); crash = P.length; log.push("🌪️ MARKET CRASH: every ETF −20% and no rent for one round."); } }
    const g2 = { ...x, P, crash, dice: d, log: log.slice(-6), qn: x.qn + 1 };
    return pend ? { ...g2, pend } : next(g2);
  }); };
  const resolve = (fn) => setG((x) => { const y = fn(x); return next({ ...y, log: y.log.slice(-6) }); });
  const buy = (yes) => resolve((x) => { const sq = CITY[x.pend.pos]; const p = x.P[x.turn]; if (!yes || p.cash < sq.price) return { ...x, log: [...x.log, `${p.tok} didn't buy ${sq.n}.`] }; return { ...x, P: x.P.map((y, k) => (k === x.turn ? { ...y, cash: y.cash - sq.price } : y)), own: { ...x.own, [x.pend.pos]: x.turn }, log: [...x.log, `🏪 ${p.tok} bought ${sq.e} ${sq.n} for ${cop(sq.price)}!`] }; });
  const quiz = (ok) => resolve((x) => { const p = x.P[x.turn]; const scam = x.pend.type === "scam"; const delta = scam ? (ok ? 0 : -100000) : ok ? 100000 : 0; return { ...x, P: x.P.map((y, k) => (k === x.turn ? { ...y, cash: y.cash + delta } : y)), log: [...x.log, scam ? (ok ? `🛡️ ${p.tok} avoided the scam!` : `🎣 ${p.tok} fell for the scam: −$100,000`) : ok ? `✅ ${p.tok} +$100,000` : `❌ ${p.tok} no prize`] }; });
  const invest = (amt) => resolve((x) => { const p = x.P[x.turn]; const a = Math.min(amt, Math.max(0, p.cash)); const f = x.pend.type; return { ...x, P: x.P.map((y, k) => (k === x.turn ? { ...y, cash: y.cash - a, [f]: y[f] + a } : y)), log: [...x.log, a ? `${f === "cdt" ? "📜" : "🧺"} ${p.tok} invested ${cop(a)} in ${f.toUpperCase()}` : `${p.tok} kept the cash.`] }; });
  const ranking = g ? g.P.map((p, k) => ({ ...p, k, nw: netWorth(g, k) })).sort((a, b) => b.nw - a.nw) : [];
  const studentWins = g?.over && ranking[0]?.k === 0;
  const coins = 30 + (studentWins ? 6 : 0);
  if (st.done) return <Reward title={studentWins ? "Mayor of CREAR City! 🏙️" : "Great game! 🏙️"} subtitle={`Winner: ${ranking[0]?.tok} ${ranking[0]?.n} · ${cop(ranking[0]?.nw || 0)}`} coins={st.coins} saving={st.saving} onExit={onExit} gold={studentWins} />;
  if (!g) return (
    <ActShell icon={<Dice5 size={22} strokeWidth={2.1} />} title="CREAR City 🏙️ · Board Game" subtitle="2–4 players on ONE tablet. Buy businesses, collect rent, invest in CDT or ETF, survive inflation, crashes and scams." onExit={onExit}>
      <Brief91 k="c4_city" />
      <div className="start-block"><h3>👥 Players (2–4)</h3>{names.map((n, k) => <div key={k} className="g11-inline"><span className="g11-tok">{TOKENS[k]}</span><input className="start-input" value={n} placeholder={k === 0 ? "You" : `Player ${k + 1}`} onChange={(e) => setNames(names.map((y, j) => (j === k ? e.target.value : y)))} /></div>)}</div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={names.filter((n) => n.trim()).length < 2} onClick={start}>Start the game 🎲</button></div>
    </ActShell>
  );
  const cur = g.P[g.turn];
  return (
    <ActShell icon={<Dice5 size={22} strokeWidth={2.1} />} title="CREAR City 🏙️" subtitle={`Round ${Math.min(g.round, CITY_ROUNDS)}/${CITY_ROUNDS}${g.crash ? " · 🌪️ crash: no rent" : ""}`} onExit={onExit}>
      <div className="g11-city">
        {CITY.map((sq, k) => { const [r, c] = CITY_POS[k]; const o = g.own[k]; return <div key={k} className={`g11-sq k-${sq.k} ${o != null ? `own own${o}` : ""}`} style={{ gridRow: r, gridColumn: c }}><em>{sq.e}</em><b>{sq.n}</b>{sq.price ? <small>{cop(sq.price)}</small> : <small>{sq.d}</small>}<div className="toks">{g.P.map((p, j) => (!p.out && p.pos === k ? <i key={j}>{p.tok}</i> : null))}</div></div>; })}
        <div className="g11-city-mid">
          {g.over ? <div className="g11-city-end"><h3>🏆 {ranking[0].tok} {ranking[0].n} wins!</h3>{ranking.map((p, j) => <p key={p.k}>{j + 1}. {p.tok} {p.n} · <b>{cop(p.nw)}</b></p>)}</div> : (
            <>
              <div className="g11-turn"><span>{cur.tok}</span><b>{cur.n}'s turn</b>{g.dice && <i>🎲 {g.dice}</i>}</div>
              {!g.pend && <button className="s1-btn primary big" onClick={roll}>🎲 Roll the dice</button>}
              {g.pend?.type === "buy" && <div className="g11-pend"><p>{CITY[g.pend.pos].e} <b>{CITY[g.pend.pos].n}</b> is for sale: {cop(CITY[g.pend.pos].price)} · rent {cop(CITY[g.pend.pos].rent)}</p><div className="p3-card-actions"><button className="s1-btn primary" disabled={cur.cash < CITY[g.pend.pos].price} onClick={() => buy(true)}>Buy it</button><button className="s1-btn ghost" onClick={() => buy(false)}>No, thanks</button></div></div>}
              {(g.pend?.type === "cdt" || g.pend?.type === "etf") && <div className="g11-pend"><p>{g.pend.type === "cdt" ? "📜 CDT: +10% every time you pass START (safe)." : "🧺 ETF: +15% every time you pass START — but crashes hit it."}</p><div className="p3-card-actions">{[100000, 300000].map((a) => <button key={a} className="s1-btn primary" disabled={cur.cash < a} onClick={() => invest(a)}>Invest {cop(a)}</button>)}<button className="s1-btn ghost" onClick={() => invest(0)}>Skip</button></div></div>}
              {(g.pend?.type === "q" || g.pend?.type === "scam") && <QCard key={g.qn} q={g.pend.q} seconds={30} tag={g.pend.type === "scam" ? "🎣 SCAM ALERT · answer right to escape" : "❓ +$100,000 if right"} onAnswer={quiz} cont="OK" />}
            </>
          )}
          <div className="g11-city-log">{g.log.map((l, k) => <p key={k}>{l}</p>)}</div>
        </div>
      </div>
      <div className="g11-players">{g.P.map((p, k) => <div key={k} className={`${k === g.turn && !g.over ? "on" : ""} ${p.out ? "out" : ""}`}><b>{p.tok} {p.n}</b><span>💵 {cop(p.cash)}</span><span>📜 {cop(p.cdt)} · 🧺 {cop(p.etf)}</span><span>🏪 {Object.values(g.own).filter((o) => o === k).length} · NW <b>{cop(netWorth(g, k))}</b></span></div>)}</div>
      {g.over && <div className="start-foot"><button className="s1-btn ghost" onClick={() => setG(null)}><RefreshCw size={16} /> New game</button><button className="s1-btn primary big" onClick={() => { lbSave(ctx, "city", netWorth(g, 0), {}); finish(coins, { winner: ranking[0].n, win: studentWins, players: g.P.length, ranking: ranking.map((p) => ({ n: p.n, nw: p.nw, cash: p.cash, cdt: p.cdt, etf: p.etf })), mine: netWorth(g, 0) }); }}>Save the game <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>}
    </ActShell>
  );
}
function CityReport({ resp, existing, onSave, onExit }) {
  const c = resp?.c4_city; const me = c?.ranking?.find((p) => p.nw === c.mine) || null;
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const G = [W_PAST, W_NUMBERS(2), W_TOPIC("Use 2 words", ["rent", "cdt", "etf", "inflation", "crash", "scam", "net worth", "business"], 2), { l: "Next time I will…", ex: "Next time I will…", re: /next time[^.]*\b(will|would|'ll)\b/i }];
  if (st.done) return <Reward title="Match analyst! 📝" subtitle="Strategy explained." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<FileText size={22} strokeWidth={2.1} />} title="CREAR City · Match Report 📝" subtitle="Like a sports journalist: what happened, which decisions won — and what you'd change." onExit={onExit}>
      <Brief91 k="c4_report" />
      {c ? <MiniTable head={["Player", "Cash", "CDT + ETF", "Net worth"]} rows={c.ranking.map((p, k) => [`${k === 0 ? "🏆 " : ""}${p.n}`, cop(p.cash), cop(p.cdt + p.etf), cop(p.nw)])} /> : <div className="p1-banner bad"><span>Play CREAR City first to get your numbers.</span></div>}
      <div className="start-block"><h3>📰 THE CREAR TIMES · Sports & Money</h3><WordField value={text} onChange={setText} min={40} max={110} goals={G} placeholder={`${c ? `${c.winner} won with ${cop(c.ranking[0].nw)}. ` : ""}I bought the Gelatin Lab early, so I collected rent… When the market crashed, my ETF… Next time I will…`} /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!c || !goalsOk(text, 40, 110, G)} onClick={() => finish(24, { text, mine: me?.nw })}>Publish my report <span className="coin-tag"><Coins size={15} /> +24</span></button></div>
    </ActShell>
  );
}
/* ---------- C4 · Card Duel ---------- */
function CardDuel({ ctx, onSave, onExit }) {
  const bank = useBank(ctx);
  const [g, setG] = useState(null);
  const [st, finish] = useFinish(onSave);
  const start = () => { const d = shuffleArr(DUEL_CARDS); setG({ me: d.slice(0, 9), cpu: d.slice(9, 18), round: 0, phase: "q", q: qbPick(bank, null), n: 1, last: null, won: 0 }); };
  const settle = (stat, chooser) => setG((x) => { const a = x.me[0], b = x.cpu[0]; let me = x.me.slice(1), cpu = x.cpu.slice(1); let res; if (a[stat] > b[stat]) { me = [...me, a, b]; res = "win"; } else if (a[stat] < b[stat]) { cpu = [...cpu, b, a]; res = "lose"; } else { me = [...me, a]; cpu = [...cpu, b]; res = "tie"; } return { ...x, me, cpu, phase: "reveal", last: { a, b, stat, res, chooser }, won: x.won + (res === "win" ? 1 : 0) }; });
  const answer = (ok) => { if (ok) setG((x) => ({ ...x, phase: "pick" })); else { const b = g.cpu[0]; const best = DUEL_STATS.map(([k]) => k).sort((p, q) => b[q] - b[p])[0]; settle(best, "cpu"); } };
  const nextRound = () => setG((x) => ({ ...x, round: x.round + 1, phase: "q", q: qbPick(bank, null), n: x.n + 1, last: null }));
  const over = g && (g.round >= 9 || !g.me.length || !g.cpu.length) && g.phase === "reveal";
  const win = over && g.me.length > g.cpu.length;
  const coins = g ? Math.min(40, 18 + g.won * 2 + (win ? 6 : 0)) : 18;
  const Card = ({ c, hidden, hl }) => <div className={`g11-card ${hidden ? "back" : ""}`}>{hidden ? <em>🂠</em> : <><em>{c.e}</em><b>{c.n}</b>{DUEL_STATS.map(([k, l]) => <span key={k} className={hl === k ? "on" : ""}>{l}<i>{c[k]}</i></span>)}</>}</div>;
  if (st.done) return <Reward title={win ? "Duel master! 🃏" : "Good duel! 🃏"} subtitle={`${g?.won || 0} rounds won`} coins={st.coins} saving={st.saving} onExit={onExit} gold={win} />;
  return (
    <ActShell icon={<Swords size={22} strokeWidth={2.1} />} title="Asset Card Duel 🃏" subtitle="18 cards: investments with Return, Safety and Liquidity (0–10). Right answer = YOU choose the stat. Wrong = the computer chooses. Higher stat takes both cards." onExit={onExit}>
      <Brief91 k="c4_duel" />
      {!g ? <div className="start-foot"><button className="s1-btn primary big" onClick={start}>Deal the cards 🃏</button></div> : (
        <>
          <div className="g10-kpis"><div><small>🧑 Your cards</small><b>{g.me.length}</b></div><div><small>🤖 Computer</small><b>{g.cpu.length}</b></div><div><small>Round</small><b>{Math.min(g.round + 1, 10)}/10</b></div></div>
          <div className="g11-duel"><Card c={g.me[0] || g.last?.a} hl={g.last?.stat} /><span className="vs">VS</span><Card c={g.phase === "reveal" ? g.last.b : g.cpu[0]} hidden={g.phase !== "reveal"} hl={g.last?.stat} /></div>
          {g.phase === "q" && <QCard key={g.n} q={g.q} seconds={25} onAnswer={answer} cont="OK" />}
          {g.phase === "pick" && <div className="start-block"><h3>🎯 Choose the stat to battle with</h3><div className="g10-ab four">{DUEL_STATS.map(([k, l]) => <button key={k} type="button" onClick={() => settle(k, "me")}><b>{l}</b><span>{g.me[0][k]}</span></button>)}</div></div>}
          {g.phase === "reveal" && g.last && <div className={`p1-banner ${g.last.res === "win" ? "good" : g.last.res === "lose" ? "bad" : ""}`}><span>{g.last.chooser === "cpu" ? "🤖 The computer chose " : "You chose "}{DUEL_STATS.find((x) => x[0] === g.last.stat)[1]}: {g.last.a.n} {g.last.a[g.last.stat]} vs. {g.last.b.n} {g.last.b[g.last.stat]} → {g.last.res === "win" ? "you win both cards!" : g.last.res === "lose" ? "the computer takes them." : "tie."}</span>{!over && <button className="s1-btn primary" onClick={nextRound}>Next round <ChevronRight size={16} /></button>}</div>}
          {over && <><div className={`p1-banner ${win ? "good" : "bad"}`}><span>{win ? "🏆 You won the duel!" : g.me.length === g.cpu.length ? "🤝 A draw!" : "🤖 The computer won this time."}</span></div><div className="start-foot"><button className="s1-btn ghost" onClick={start}><RefreshCw size={16} /> Play again</button><button className="s1-btn primary big" onClick={() => finish(coins, { win, won: g.won, cards: g.me.length })}>Save my duel <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div></>}
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   11° · PERIODO 4 · GAME ZONE & GRADUATION (Clases 5–7)
   ===================================================================== */
/* ---------- C5 · Grand Tournament (5 etapas) ---------- */
const TOUR_NUM = [
  { tag: "Price", q: "Ingredients $48,000 make 30 gelatins. Unit cost?", answer: 1600, money: true, hint: "48,000 ÷ 30", explain: "$1,600." },
  { tag: "Valuation", q: "A shark offers $450,000 for 15%. Implied valuation?", answer: 3000000, money: true, hint: "450,000 ÷ 0.15", explain: "$3,000,000." },
  { tag: "Real return", q: "A CDT pays 12% and inflation is 7%. Real return (%, 1 decimal)?", answer: 4.7, unit: "%", tol: 0.1, hint: "1.12 ÷ 1.07 − 1", explain: "≈ 4.7%." },
  { tag: "Gap", q: "5 semesters cost $32,000,000. You have $9,000,000 saved and a 50% tuition scholarship worth $12,000,000. Gap?", answer: 11000000, money: true, hint: "32 − 9 − 12 million", explain: "$11,000,000." },
];
const TOUR_STAGES = [["⚡", "Speed", "6 questions · 12 s · +100"], ["🧮", "Numbers", "4 problems · +150 first try"], ["🔥", "Hard", "4 hard questions · 25 s · +200"], ["🎲", "Final Wager", "bet your points on 1 question"]];
function GrandTournament({ ctx, existing, onSave, onExit }) {
  const bank = useBank(ctx);
  const [stage, setStage] = useState(-1);
  const [k, setK] = useState(0);
  const [q, setQ] = useState(null);
  const [used, setUsed] = useState([]);
  const [pts, setPts] = useState(0);
  const [log, setLog] = useState([]);
  const [wager, setWager] = useState(0);
  const [wset, setWset] = useState(false);
  const [best] = useState(existing?.best || 0);
  const [st, finish] = useFinish(onSave);
  const draw = (lv) => { const x = qbPick(bank, lv, used); setUsed([...used, x._id]); setQ(x); };
  const go = (s) => { setStage(s); setK(0); if (s === 0) draw(Math.random() < 0.5 ? 1 : 2); if (s === 2 || s === 3) draw(3); };
  const add = (v, l) => { setPts((p) => p + v); setLog((L) => [...L, [l, v]]); };
  const answer = (ok) => {
    if (stage === 0) { if (ok) add(100, "⚡ Speed"); if (k < 5) { setK(k + 1); draw(Math.random() < 0.5 ? 1 : 2); } else go(1); }
    else if (stage === 2) { if (ok) add(200, "🔥 Hard"); if (k < 3) { setK(k + 1); draw(3); } else go(3); }
    else if (stage === 3) { const w = Math.round(pts * wager / 100); add(ok ? w : -w, `🎲 Wager ${wager}%`); setStage(4); lbSave(ctx, "tour", Math.round(pts + (ok ? w : -w)), {}); }
  };
  const coins = Math.min(44, 22 + Math.round(Math.max(0, pts) / 120));
  if (st.done) return <Reward title="Tournament finished! 🏆" subtitle={`${pts} points`} coins={st.coins} saving={st.saving} onExit={onExit} gold={pts >= 1500} />;
  return (
    <ActShell icon={<Trophy size={22} strokeWidth={2.1} />} title="The Grand FinFluent Tournament 🏆" subtitle="Four stages, one score. Your score goes to the Hall of Fame." onExit={onExit}>
      <Brief91 k="c5_tour" />
      <div className="g11-stages">{TOUR_STAGES.map(([e, l, d], j) => <div key={l} className={`${stage === j ? "on" : ""} ${stage > j ? "done" : ""}`}><em>{stage > j ? "✅" : e}</em><b>{l}</b><small>{d}</small></div>)}<div className="g11-score"><small>SCORE</small><b>{pts}</b></div></div>
      {stage === -1 && <div className="start-foot">{best ? <span className="start-tip">Your best: {best}</span> : null}<button className="s1-btn primary big" onClick={() => go(0)}>Start the tournament ⚡</button></div>}
      {(stage === 0 || stage === 2) && q && <QCard key={`${stage}-${k}`} q={q} seconds={stage === 0 ? 12 : 25} tag={`${TOUR_STAGES[stage][1]} · ${k + 1}/${stage === 0 ? 6 : 4}`} onAnswer={answer} cont="Next" />}
      {stage === 1 && <RoundsRunner rounds={TOUR_NUM} doneLabel="Go to Hard stage 🔥" onDone={(r) => { add(Math.round(r.answers.reduce((a, v) => a + v, 0) * 150), "🧮 Numbers"); go(2); }} />}
      {stage === 3 && !wset && <div className="start-block"><h3>🎲 How much of your {pts} points do you bet?</h3><div className="g10-chips">{[0, 25, 50, 100].map((w) => <button key={w} type="button" className={wager === w ? "on" : ""} onClick={() => setWager(w)}>{w}% · {Math.round(pts * w / 100)} pts</button>)}</div><div className="start-foot"><button className="s1-btn primary big" onClick={() => setWset(true)}>Show the final question</button></div></div>}
      {stage === 3 && wset && q && <QCard key="final" q={q} seconds={30} tag={`🎲 FINAL · ${wager}% at stake`} onAnswer={answer} cont="See my score" />}
      {stage === 4 && <><MiniTable head={["Stage", "Points"]} rows={log.map(([l, v]) => [l, v > 0 ? `+${v}` : String(v)])} foot={["TOTAL", String(pts)]} /><div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(coins, { score: pts, best: Math.max(best, pts) })}>Save my score <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div></>}
    </ActShell>
  );
}

/* ---------- C5 · Hall of Fame (Apps Script lb_*) ---------- */
const HOF = [["mill", "💰", "Millionaire", (v) => `level ${v}/12`], ["bs", "⚓", "Battleship", (v) => `${v} wins`], ["vault", "🏦", "Vault escape", (v) => mmss(Number(v))], ["city", "🏙️", "CREAR City", (v) => cop(v)], ["tour", "🏆", "Tournament", (v) => `${v} pts`]];
function HallOfFame({ ctx, existing, onSave, onExit }) {
  const r = ctx.resp || {};
  const [boards, setBoards] = useState(null);
  const [err, setErr] = useState(false);
  const [mvp, setMvp] = useState(existing?.mvp || "");
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  useEffect(() => { if (!ctx.API_URL) { setErr(true); return; } teamPost(ctx.API_URL, ctx.userData, "lb_list").then((d) => (d?.boards ? setBoards(d.boards) : setErr(true))).catch(() => setErr(true)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const mine = { mill: r.c1_mill?.best, bs: [r.c2_cpu?.win, r.c2_online?.win].filter(Boolean).length, vault: r.c3_vault?.escaped ? r.c3_vault.time : null, city: r.c4_city?.mine, tour: r.c5_tour?.best };
  const G = [W_REASON, W_TOPIC("Say what they did", ["answer", "question", "fast", "smart", "strategy", "team", "help"], 1)];
  const ok = countWords(mvp) >= 1 && goalsOk(text, 15, 50, G);
  if (st.done) return <Reward title="Hall of Fame signed! ⭐" subtitle={`MVP: ${mvp}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Medal size={22} strokeWidth={2.1} />} title="Hall of Fame ⭐" subtitle="The best of the Game Zone — and your own records." onExit={onExit}>
      <Brief91 k="c5_hall" />
      {err && <p className="start-tip">📡 The class ranking couldn't load — you still see your own records.</p>}
      <div className="g11-hof">{HOF.map(([k, e, l, f]) => <div key={k}><h3>{e} {l}</h3>{boards?.[k]?.length ? <ol>{boards[k].slice(0, 5).map((x, j) => <li key={j} className={x.mine ? "me" : ""}><span>{["🥇", "🥈", "🥉", "4", "5"][j]} {String(x.name || "").split(" ").slice(0, 2).join(" ")}</span><b>{f(x.score)}</b></li>)}</ol> : <p className="start-tip">{boards ? "No records yet." : "…"}</p>}<small>My record: <b>{mine[k] != null && mine[k] !== 0 ? f(mine[k]) : "—"}</b></small></div>)}</div>
      <div className="start-block"><h3>🌟 The class MVP of the Game Zone</h3><input className="start-input g11-gap" value={mvp} onChange={(e) => setMvp(e.target.value)} placeholder="Classmate's name" /><WordField value={text} onChange={setText} min={15} max={50} rows={3} goals={G} placeholder="I choose … because in the Battleship she answered every question fast and helped…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(20, { mvp, text })}>Sign the Hall of Fame <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}

/* ---------- C6 · Founder Radar 11 · Final ---------- */
const SELF11 = [["build", "🛠️ I can turn a real problem into a product people pay for."], ["profit", "🧮 I can calculate costs, prices, break-even and profit."], ["fund", "🦈 I can read a P&L, value a company and negotiate a deal."], ["inv", "📈 I can invest with real data, beat inflation and spot red flags."], ["life", "🎓 I can plan my studies and my first money at 18."], ["eng", "🎤 I can present a business and a life plan in English."]];
function Radar11Final({ resp, existing, onSave, onExit }) {
  const before = resp?.__p1?.c1_radar?.scores || null;
  const QS = useMemo(() => [...RADAR11_Q, ...RADAR11_NEW], []);
  const [ans, setAns] = useState(null);
  const [self, setSelf] = useState(existing?.self || {});
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  if (!ans && !existing?.scores) return <RadarQuiz title="Founder Radar 11 · Final" qs={QS} dims={RADAR11_DIMS} newFrom={10} intro={<Brief91 k="c6_radar" />} onExit={onExit} onDone={setAns} />;
  const shown = ans ? radarScores11(QS, ans) : existing.scores;
  const newScore = ans ? Math.round((RADAR11_NEW.reduce((a, q, k) => a + (ans[10 + k] != null ? q.s[ans[10 + k]] : 0), 0) / 15) * 100) : existing.newScore;
  const avg = Math.round(RADAR11_DIMS.reduce((a, d) => a + (shown[d.k] || 0), 0) / 5);
  const bAvg = before ? Math.round(RADAR11_DIMS.reduce((a, d) => a + (before[d.k] || 0), 0) / 5) : null;
  const prof = radarProfile11(avg);
  const Gw = [W_CONTRAST, W_REASON];
  const ok = SELF11.every(([k]) => self[k]) && goalsOk(text, 20, 60, Gw);
  if (st.done) return <Reward title="Final radar! 🧭" subtitle={`${prof.l} · ${avg}%${bAvg != null ? ` (from ${bAvg}%)` : ""}`} coins={st.coins} saving={st.saving} onExit={onExit} gold={bAvg != null && avg > bAvg} />;
  return (
    <ActShell icon={<Compass size={22} strokeWidth={2.1} />} title="Founder Radar 11 · Before & After 🧭" subtitle="Day 1 of 11th grade vs. today — the last radar of FinFluent." onExit={onExit}>
      <div className="g7-radar-wrap"><RadarN labels={RADAR11_DIMS.map((d) => d.l)} values={RADAR11_DIMS.map((d) => shown[d.k] || 0)} before={before ? RADAR11_DIMS.map((d) => before[d.k] || 0) : null} /></div>
      {before ? <div className="g94-legend"><span className="b">◼ Period 1 (day 1)</span><span className="a">◼ Today</span></div> : <p className="start-tip">💡 We didn't find your Period 1 radar, so you only see today's radar.</p>}
      <div className="g94-growth">{RADAR11_DIMS.map((d) => { const b = before?.[d.k]; const diff = b != null ? (shown[d.k] || 0) - b : null; return <div key={d.k}><span>{d.l}</span><div className="t"><i className="b" style={{ width: `${b || 0}%` }} /><i className="a" style={{ width: `${shown[d.k] || 0}%` }} /></div><b className={diff == null ? "" : diff >= 0 ? "pos" : "neg"}>{shown[d.k] || 0}%{diff != null ? ` (${diff >= 0 ? "+" : ""}${diff})` : ""}</b></div>; })}</div>
      <div className="g91-mini"><span>🧭 Average <b>{bAvg != null ? `${bAvg}% → ` : ""}{avg}%</b></span><span>🆕 New situations <b>{newScore}%</b></span></div>
      <div className="diag-risk"><span className="diag-risk-tag">{prof.l}</span><p>{prof.d}</p></div>
      <div className="start-block"><h3>⭐ Self-assessment</h3><p className="start-tip">1 ★ = not yet · 2 ★ = with help · 3 ★ = alone · 4 ★ = I can teach it</p>{SELF11.map(([k, l]) => <div key={k} className="p3-rub"><div><b>{l}</b></div><span /><div className="p3-stars">{[1, 2, 3, 4].map((n) => <button key={n} type="button" className={self[k] >= n ? "on" : ""} onClick={() => setSelf({ ...self, [k]: n })}>★</button>)}</div></div>)}</div>
      <div className="start-block"><h3>✍️ My reflection</h3><WordField value={text} onChange={setText} min={20} max={60} rows={3} placeholder="At the beginning of 11th grade I … but now I … because …" goals={Gw} /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30, { answers: ans, scores: shown, average: avg, beforeAvg: bAvg, growth: bAvg != null ? avg - bAvg : null, profile: prof.l, newScore, self, text })}>Save my radar <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- C6 · My Founder Year (solo 11°) ---------- */
function FounderYear({ resp, rows, pointsNow, actsNow, studentName, have, existing, onSave, onExit }) {
  const r = resp || {}; const p1 = r.__p1 || {}, p2 = r.__p2 || {}, p3 = r.__p3 || {}; const co = co11(p1);
  const pts = ["11P1", "11P2", "11P3"].map((k) => rowPoints(rows[k])).concat(pointsNow);
  const acts = ["11P1", "11P2", "11P3"].map((k) => Object.values(parseJSON(rows[k]?.Checklist_JSON)).filter(Boolean).length).concat(actsNow);
  const coins = pts.reduce((a, v) => a + v, 0); const totalActs = acts.reduce((a, v) => a + v, 0); const maxPts = Math.max(...pts, 1);
  const rad = r.c6_radar; const first = (studentName || "Student").split(" ")[0];
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [best, setBest] = useState(existing?.best || null);
  const [lesson, setLesson] = useState(existing?.lesson || "");
  const [st, finish] = useFinish(onSave);
  const titles = FM_CARDS.map((c) => [c.e, c.t, have[c.p] || (c.p === 4 && !!r.c7_showcase)]);
  const decisions = [p1.c2_interview && "Talking to real customers before building", p1.c5_price && "Pricing with costs AND customers", p2.c2_cash && "Protecting cash, not only profit", p2.c5_nego && "Respecting my walk-away point", p3.c6_crash && "Not selling in a crash", p3.c7_budget && "Planning university with real numbers", "Checking the numbers before deciding"].filter(Boolean).slice(0, 5);
  const games = [r.c1_mill && `💰 Millionaire level ${r.c1_mill.best}`, (r.c2_cpu || r.c2_online) && `⚓ Battleship ${r.c2_cpu?.win || r.c2_online?.win ? "victory" : "fought"}`, r.c3_vault && `🏦 Vault ${r.c3_vault.escaped ? mmss(r.c3_vault.time) : "locked"}`, r.c4_city && `🏙️ CREAR City ${r.c4_city.win ? "mayor" : cop(r.c4_city.mine || 0)}`, r.c5_tour && `🏆 Tournament ${r.c5_tour.score} pts`].filter(Boolean);
  const slides = [
    { k: "intro", c: "forest", node: <><small>GRADE 11 · FOUNDER YEAR · 2026</small><h2>{first}, this was your Founder Year 🚀</h2><p>From a real problem to a company, an investment plan and a life plan.</p><em className="g74-big">✨</em></> },
    { k: "coins", c: "gold", node: <><small>THIS YEAR YOU EARNED</small><h2 className="g74-mega">{coins.toLocaleString("en-US")}</h2><p>FinFluent coins 🪙 · {totalActs} activities</p><div className="g74-wbars">{pts.map((v, k) => <div key={k}><i style={{ height: `${Math.max(6, (v / maxPts) * 100)}%` }} /><span>P{k + 1}</span><b>{v}</b></div>)}</div></> },
    { k: "p1", c: "coral", node: <><small>PERIOD 1 · BUILD IT</small><h2>{co.brand ? `You created ${co.brand}` : "You built a real product"} 🛠️</h2>{co.logo && <div className="g11-wlogo"><LogoMark logo={co.logo} brand={co.brand} size={84} /></div>}<p>{co.product ? `${co.product}` : ""}{co.price ? ` · price ${cop(co.price)}` : ""}{p1.c8_audit ? ` · ${p1.c8_audit.real} real pre-orders` : ""}</p></> },
    { k: "p2", c: "mint", node: <><small>PERIOD 2 · FUND IT</small><h2>You faced the sharks 🦈</h2><p>{p2.c4_val ? `Valuation ${cop(p2.c4_val.implied)} · ask ${cop(p2.c4_val.ask)} for ${p2.c4_val.pct}%.` : "P&L, cash, funding, valuation and a pitch deck."}{p2.c5_nego?.deal && !p2.c5_nego.deal.none ? ` Deal: ${cop(p2.c5_nego.deal.money)} for ${p2.c5_nego.deal.pct}%.` : ""}</p></> },
    { k: "p3", c: "gold", node: <><small>PERIOD 3 · INVESTOR 18+</small><h2>You invested with real data 📈</h2><p>{p3.c6_portfolio ? `$10,000,000 → ${mCOP11(p3.c6_portfolio.final)} in 10 real years.` : "Inflation, companies, collapses, ETFs and crashes."}{p3.c7_budget ? ` Study plan: ${p3.c7_budget.unis?.join(" / ")}.` : ""}</p></> },
    { k: "p4", c: "forest", node: <><small>PERIOD 4 · GAME ZONE</small><h2>You played to win 🎮</h2><div className="g74-wlist">{games.length ? games.map((x) => <span key={x}>{x}</span>) : <span>Play the games of Classes 1–5!</span>}</div></> },
    { k: "radar", c: "green", node: rad?.growth != null ? <><small>MY FOUNDER RADAR</small><h2 className="g74-mega">{rad.growth >= 0 ? "+" : ""}{rad.growth}</h2><p>points since day 1 ({rad.beforeAvg}% → {rad.average}%)</p><p className="g74-quote">Today you are: <b>{rad.profile}</b></p></> : <><small>MY FOUNDER RADAR</small><h2>{rad ? rad.profile : "🔒 Locked"}</h2><p>{rad ? "Your final radar is ready." : "Do “Founder Radar 11 · Final” to see your growth."}</p></> },
    { k: "titles", c: "gold", node: <><small>MY FOUNDER CARDS</small><h2>Unlocked this year 🏆</h2><div className="g74-wlist">{titles.map(([e, t, on]) => <span key={t} className={on ? "" : "off"}>{on ? e : "🔒"} <b>{t}</b></span>)}</div></> },
    { k: "me", c: "coral", node: <><small>YOUR STORY · YOUR WORDS</small><h2>My best decision & my biggest lesson</h2><div className="g84-wpick">{decisions.map((d) => <button key={d} type="button" className={best === d ? "on" : ""} onClick={() => setBest(d)}>{d}</button>)}</div><input className="start-input g84-winput" value={lesson} onChange={(e) => setLesson(e.target.value)} placeholder="The biggest lesson of my year…" /></> },
    { k: "outro", c: "forest", node: <><small>2026 → GRADUATION → YOUR FUTURE</small><h2>You can build, fund, invest and plan. 💚</h2><p>{best ? `Best decision: ${best}.` : ""} The future is yours, {first}!</p></> },
  ];
  const s = slides[i]; const last = i === slides.length - 1; const meOk = best && countWords(lesson) >= 6 && realText(lesson);
  if (st.done) return <Reward title="That's my Founder Year! 🎞️" subtitle="From a problem to a plan." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <div className="p1-act g74-wrapped-wrap">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      {i === 0 && <Brief91 k="c6_year" />}
      <div className={`g74-wrapped c-${s.c}`} id="g11-year" key={s.k}>
        <div className="g74-wprog">{slides.map((x, k) => <i key={x.k} className={k < i ? "done" : k === i ? "on" : ""} />)}</div>
        <div className="g74-wbody">{s.node}</div>
        <div className="g74-wfoot"><span>FinFluent · Instituto CREAR</span><span>{i + 1}/{slides.length}</span></div>
        {s.k !== "me" && <><button type="button" className="g74-wtap left" aria-label="Previous" onClick={() => setI(Math.max(0, i - 1))} /><button type="button" className="g74-wtap right" aria-label="Next" onClick={() => setI(Math.min(slides.length - 1, i + 1))} /></>}
      </div>
      <div className="p3-card-actions">
        <button className="s1-btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}><ArrowLeft size={16} /> Back</button>
        <button className="s1-btn ghost" disabled={busy} onClick={async () => { setBusy(true); await downloadPNG("g11-year", `Founder_Year_${i + 1}_${first}.png`); setBusy(false); }}><Download size={16} /> {busy ? "Creating…" : "Save this slide"}</button>
        {!last ? <button className="s1-btn primary" disabled={s.k === "me" && !meOk} onClick={() => setI(i + 1)}>{s.k === "me" && !meOk ? "Choose + write (6+ words)" : "Next"} <ChevronRight size={16} /></button> : <button className="s1-btn primary" onClick={() => finish(25, { coins, acts: totalActs, best, lesson })}>Finish my Founder Year <span className="coin-tag"><Coins size={15} /> +25</span></button>}
      </div>
    </div>
  );
}
const mCOP11 = (v) => `$${(Number(v || 0) / 1000000).toFixed(1)} million`;

/* ---------- C6 · What I can do now — todo el año ---------- */
const CAN_YEAR = [
  { t: "I can find a real problem and test it with customers.", ev: (r) => (r.__p1?.c2_interview ? "Customer interviews done" : null) },
  { t: "I can design a brand: name, logo, colors and label.", ev: (r) => { const c = co11(r.__p1); return c.brand ? `${c.brand}${c.logo ? " + logo" : ""}` : null; } },
  { t: "I can calculate unit cost, price and break-even.", ev: (r) => { const c = co11(r.__p1); return c.price ? `Price ${cop(c.price)} · unit cost ${cop(c.unit)}` : null; } },
  { t: "I can read a P&L and protect my cash.", ev: (r) => (r.__p2?.c1_pl ? `Net ${cop(r.__p2.c1_pl.net)} / month` : null) },
  { t: "I can value a company and negotiate with investors.", ev: (r) => (r.__p2?.c4_val ? `Valuation ${cop(r.__p2.c4_val.implied)}` : null) },
  { t: "I can invest with real data and beat inflation.", ev: (r) => (r.__p3?.c6_portfolio ? `Lab: ${mCOP11(r.__p3.c6_portfolio.final)}` : r.__p3?.c2_sim ? "Inflation analysis done" : null) },
  { t: "I can spot red flags and choose low-fee ETFs.", ev: (r) => (r.__p3?.c4_detective ? `${r.__p3.c4_detective.total} detective points` : null) },
  { t: "I can plan my studies and my first money at 18.", ev: (r) => (r.__p3?.c7_budget ? `${(r.__p3.c7_budget.unis || []).join(" / ")}` : null) },
  { t: "I can create fair questions and compete with what I know.", ev: (r) => (r.c1_forge ? `5 questions${r.c1_forge.published ? " in the class bank" : ""}` : null) },
];

/* ---------- C6 · Carta a mí mismo a los 25 ---------- */
function FutureLetter({ resp, studentName, existing, onSave, onExit }) {
  const [to, setTo] = useState(existing?.to || "");
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const first = (studentName || "Student").split(" ")[0]; const co = co11(resp?.__p1); const p3 = resp?.__p3 || {};
  const G = [W_FUTURE, { l: "If… will…", ex: "If I…, I will…", re: /\bif\b[^.]*\b(will|would|'ll)\b/i }, W_NUMBERS(2), W_TOPIC("Use 2 words of the year", ["save", "invest", "inflation", "company", "university", "budget", "plan", "etf", "scholarship"], 2)];
  const ok = countWords(to) >= 1 && goalsOk(text, 70, 160, G);
  if (st.done) return <Reward title="Letter sealed! 💌" subtitle={`Open it when you turn 25, ${first}.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Mail size={22} strokeWidth={2.1} />} title="A Letter to Me at 25 💌" subtitle="Write to the person you will be in 8 years: your plans, your numbers, your promises." onExit={onExit}>
      <Brief91 k="c6_letter" />
      <div className="start-block"><p className="start-tip">💡 Ideas: {p3.c7_budget ? `your university (${p3.c7_budget.unis?.[0]})` : "your studies"} · {p3.c7_first ? "your first million at 18" : "your savings"} · {co.brand ? `your company ${co.brand}` : "a business idea"} · your money rules · a promise.</p>
        <input className="start-input g11-gap" value={to} onChange={(e) => setTo(e.target.value)} placeholder={`Dear ${first} at 25,`} />
        <WordField value={text} onChange={setText} min={70} max={160} rows={7} goals={G} placeholder="Today I'm 17 and I'm finishing school. I hope you are studying… If you have a salary, I hope you save at least 20%… In 2026 inflation was… so remember to…" /></div>
      <div className="g11-letter" id="g11-letter"><small>FINFLUENT · INSTITUTO CREAR · {new Date().getFullYear()}</small><h3>{to || `Dear ${first} at 25,`}</h3><p>{text || "…"}</p><b>— {studentName}</b><i>📬 Open in {new Date().getFullYear() + 8}</i></div>
      <div className="start-foot"><button className="s1-btn ghost" onClick={() => downloadPNG("g11-letter", `Letter_to_me_at_25_${first}.png`)}><Download size={16} /> PNG</button><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30, { to, text })}>Seal my letter <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- C7 · Graduation Showcase · THE LIFE PROJECT ---------- */
const RUB_GR = [["story", "A clear life story", "problem → company → money → future"], ["nums", "Real numbers", "price, valuation, portfolio, gap"], ["growth", "Shows growth", "radar, what I can do now"], ["plan", "A realistic plan", "studies, Plan B, first million"], ["eng", "Confident English", "eye contact, clear voice"]];
function GradShowcase({ resp, studentName, userData, API_URL, existing, onSave, onExit }) {
  const r = resp || {}; const p1 = r.__p1 || {}, p2 = r.__p2 || {}, p3 = r.__p3 || {}; const co = co11(p1); const first = studentName.split(" ")[0];
  const role = TEAM_ROLES.find((x) => x[0] === p1.c1_team?.role);
  const ev = [
    { k: "build", e: "🛠️", t: "Built a real product", ok: !!p1.c8_pitch, d: p1.c8_pitch ? `${co.brand || "My company"}${co.price ? ` · ${cop(co.price)}` : ""}` : "Period 1 Launch Pitch pending", fix: "Period 1 · Class 8.", cert: `launched ${co.brand || "a real product"} with a team` },
    { k: "fund", e: "🦈", t: "Faced the sharks", ok: !!p2.c8_pitch, d: p2.c4_val ? `Valuation ${cop(p2.c4_val.implied)}` : "Period 2 Shark Tank pending", fix: "Period 2 · Class 8.", cert: `valued it at ${p2.c4_val ? cop(p2.c4_val.implied) : "a defensible price"} on Shark Tank Day` },
    { k: "inv", e: "📈", t: "Invested with real data", ok: !!p3.c8_pitch, d: p3.c6_portfolio ? `Lab ${mCOP11(p3.c6_portfolio.final)}` : "Period 3 Committee pending", fix: "Period 3 · Class 8.", cert: "invested with ten years of real data" },
    { k: "life", e: "🎓", t: "Planned my studies", ok: !!p3.c7_budget, d: p3.c7_budget ? (p3.c7_budget.unis || []).join(" / ") : "Study plan pending", fix: "Period 3 · Class 7.", cert: "planned the real cost of university" },
    { k: "game", e: "🎮", t: "Competed in the Game Zone", ok: !!(r.c1_mill || r.c2_cpu || r.c3_vault || r.c4_city), d: [r.c1_mill && `💰 L${r.c1_mill.best}`, r.c3_vault?.escaped && `🏦 ${mmss(r.c3_vault.time)}`, r.c4_city && "🏙️"].filter(Boolean).join(" · ") || "Games pending", fix: "Period 4 · Classes 1–5.", cert: "competed with what they know in the Game Zone" },
    { k: "radar", e: "🧭", t: "Measured my growth", ok: !!r.c6_radar, d: r.c6_radar ? `${r.c6_radar.beforeAvg ?? "?"}% → ${r.c6_radar.average}%` : "Final radar pending", fix: "Period 4 · Class 6.", cert: `grew their Founder Radar${r.c6_radar?.growth != null ? ` by ${r.c6_radar.growth} points` : ""}` },
  ];
  const got = ev.filter((x) => x.ok);
  const QA = [
    { k: "q1", e: "🛠️", q: "“What was the hardest decision in your company — and what did the numbers say?”", goals: [W_PAST, W_NUMBERS(1), W_TOPIC("Use 2 words", ["price", "cost", "customer", "cash", "valuation", "profit", "team"], 2)], ph: "The hardest decision was the price. Our unit cost was… so we…" },
    { k: "q2", e: "📈", q: "“How will you protect your money from inflation and scams after 18?”", goals: [W_FUTURE, W_TOPIC("Use 2 words", ["inflation", "etf", "supervised", "emergency", "diversif", "fees", "red flag"], 2)], ph: "First I will build an emergency fund… then I will invest in a low-fee ETF…" },
    { k: "q3", e: "🎓", q: "“What is your plan for the next 5 years — and your Plan B?”", goals: [W_FUTURE, { l: "If… will…", ex: "If I…, I will…", re: /\bif\b[^.]*\b(will|would|'ll)\b/i }], ph: "I will study… If I don't get the scholarship, I will…" },
  ];
  const [qa, setQa] = useState(existing?.qa || {});
  const [stage, setStage] = useState(existing?.qa ? 1 : 0);
  const ready = got.length >= 3;
  const readyMsg = "You need at least 3 evidence lines (projects of Periods 1–3, games or the final radar).";
  if (stage === 0) return <QAStage title="Graduation Showcase 🎓 · Part 1" intro="Your evidence board for the whole Founder Year — and three questions from the graduation jury." evidence={ev} qa={qa} setQa={setQa} items={QA} ready={ready} readyMsg={readyMsg} onNext={() => setStage(1)} onExit={onExit} brief={<Brief91 k="c7_showcase" />} />;
  const chapters = (v) => [
    { e: "👋", t: "Who I am", s: [`I'm ${first}${role ? `, the ${role[2]} of team ${p1.c1_team?.name}` : ""}.`, r.c6_radar ? `My Founder Radar went from ${r.c6_radar.beforeAvg ?? "?"}% to ${r.c6_radar.average}%.` : ""].filter(Boolean) },
    { e: "🛠️", t: "What I built", s: co.brand ? [`${co.brand}: ${co.product || "a real product"}${co.tagline ? ` — “${co.tagline}”` : ""}.`, co.price ? `Price ${cop(co.price)}, unit cost ${cop(co.unit)}.` : "", p1.c8_audit ? `${p1.c8_audit.real} real pre-orders.` : ""].filter(Boolean) : [] },
    { e: "🦈", t: "What it's worth", s: p2.c4_val ? [`We valued the company at ${cop(p2.c4_val.implied)} and asked ${cop(p2.c4_val.ask)} for ${p2.c4_val.pct}%.`, p2.c5_nego?.deal && !p2.c5_nego.deal.none ? `Our deal: ${cop(p2.c5_nego.deal.money)} for ${p2.c5_nego.deal.pct}%.` : ""].filter(Boolean) : [] },
    { e: "📈", t: "My money at 18", s: [p3.c1_dna ? `I'm a ${({ con: "conservative", mod: "moderate", agg: "aggressive" }[p3.c1_dna.profile] || "moderate")} investor.` : "", p3.c6_portfolio ? `My Lab portfolio became ${mCOP11(p3.c6_portfolio.final)} in ten real years.` : "", ...(p3.c8_playbook?.rules || []).slice(0, 2).map((x) => dot(capF(x)))].filter(Boolean) },
    { e: "🎓", t: "My studies", s: p3.c7_budget ? [`Dream: ${p3.c7_budget.unis?.[0]} (${cop(p3.c7_budget.dream)} for 5 semesters). Possible: ${p3.c7_budget.unis?.[1]} (${cop(p3.c7_budget.possible)}).`] : [] },
    { e: "🎤", t: "The jury asked me", s: QA.map((x) => `${x.e} ${dot(capF(qa[x.k] || ""))}`) },
    { e: "💌", t: "To me at 25", s: r.c6_letter ? [dot(capF(r.c6_letter.text.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")))] : [] },
  ];
  const publish = async (vv) => { try { const d = await fairPost(API_URL, userData, "11-GR", "fair_publish", { company: { name: `${first} · ${co.brand || "Founder"}`, logo: co.logo?.symbol || "🎓", lines: [co.product || "", p2.c4_val ? `Valuation ${cop(p2.c4_val.implied)}` : "", p3.c7_budget ? `Studies: ${p3.c7_budget.unis?.[0]}` : "", vv.close || ""].filter(Boolean), nums: [{ l: "Evidence", v: `${got.length}/6` }, { l: "Radar", v: r.c6_radar ? `${r.c6_radar.average}%` : "—" }] } }); return d.status !== "error"; } catch (e) { return false; } };
  return (
    <PitchStudio icon={<GraduationCap size={22} strokeWidth={2.1} />} title="Graduation Showcase 🎓 · THE LIFE PROJECT" subtitle="Your whole Founder Year in one presentation: the company, the money, the future." brief={<div className="p3-card-actions"><button className="s1-btn ghost" onClick={() => setStage(0)}><ChevronLeft size={16} /> Edit answers</button></div>}
      how={<>Your script builds itself from the three projects of the year, your games, your radar and your letter. Write your closing line, press <b>Present</b> (3–4 minutes), receive the jury's rating — and publish your page in the Graduation Gallery.</>}
      id="g11-grad" ready={ready} readyMsg={readyMsg}
      cover={{ tag: "GRADUATION SHOWCASE · GRADE 11 · INSTITUTO CREAR", title: `🎓 ${first}: My Founder Year & My Life Plan`, sub: `${got.length}/6 evidence lines${r.c6_radar ? ` · ${r.c6_radar.profile}` : ""}`, say: `Good morning, everybody. I'm ${first}. This year I built a company, faced the sharks, invested with real data and planned my future. Let me show you.`, end: (vv) => `${vv.close ? dot(capF(vv.close)) : "…"} Thank you!` }}
      kpis={[{ l: "🛠️ Company", v: co.brand || "—" }, { l: "💎 Valuation", v: p2.c4_val ? cop(p2.c4_val.implied) : "—" }, { l: "📈 Lab", v: p3.c6_portfolio ? mCOP11(p3.c6_portfolio.final) : "—" }, { l: "🧭 Radar", v: r.c6_radar ? `${r.c6_radar.average}%` : "—" }]}
      chapters={chapters} inputs={[{ k: "close", l: "💡 My closing line:", ph: "Money is a tool; my future is the project…", min: 6 }]}
      rubric={RUB_GR} existing={existing} onPublish={publish} publishLabel="Publish my page in the Graduation Gallery"
      cert={{ e: "🎓", title: "FinFluent Graduate", name: studentName, text: got.length ? `${joinAnd(got.map((x) => x.cert))}.` : "completed the FinFluent Founder Year." }}
      extraData={{ qa, evidence: got.map((x) => x.k) }} coins={60 + got.length * 2} onSave={onSave} onExit={onExit} />
  );
}

/* =====================================================================
   GUÍA DE CADA ACTIVIDAD · 11° PERIODO 4
   ===================================================================== */
const ZONE_WIN = (c) => [["All goals done, each with evidence", "required"], ["Mission complete", `+${c} 🪙`]];
const GUIDE = {
  c1_forge: { goal: "Create 5 FAIR questions about the whole FinFluent journey (6°–11°) for the class bank.", steps: ["Choose topic and level.", "Write the question and 4 possible options.", "Mark the correct one — it must NOT be the longest.", "Publish them: they'll appear in your classmates' games."], win: [["Saving 5 fair questions", "+30 🪙"], ["Published in the class bank", "+6 🪙"]], tip: "A great question makes people THINK, not guess." },
  c1_review: { goal: "Answer 6 questions your classmates created and judge if they are fair.", steps: ["Answer each question.", "Rate it: clear, confusing, too obvious or wrong.", "Your rating helps the class bank."], win: [["Base", "+14 🪙"], ["Each right answer", "+3 🪙"]] },
  c1_mill: { goal: "Climb 12 levels — from $100,000 to $1,000 million (play money).", steps: ["Answer before the clock ends.", "Use 3 lifelines: 50:50, Ask the class, Switch.", "Safe levels: $1 million and $20 million.", "Walk away when you're not sure!"], win: [["Base", "+14 🪙"], ["Each level of your best game", "+2 🪙"]], tip: "Knowing when to stop is also a financial skill." },
  c1_zone: { goal: "TEAM ZONE: prepare a Game Night for another team — on paper.", steps: ["Write 8 questions with answers.", "Choose the host and the rules.", "Play against another team.", "Write the score."], win: ZONE_WIN(26) },
  c2_cpu: { goal: "Sink the computer's fleet. Right answer = you fire · wrong answer = the enemy fires.", steps: ["Move your ships until you like them.", "Answer the question.", "If you're right, choose a cell and FIRE.", "Sink 4 ships (3, 2, 2, 1)."], win: [["Base", "+18 🪙"], ["Each right answer", "+2 🪙"], ["Victory", "+8 🪙"]] },
  c2_online: { goal: "Battleship 1 vs 1 against a classmate, each on their own tablet.", steps: ["One creates the battle and shares the code.", "The other joins with the code.", "On your turn: answer → fire. Wrong = you lose the turn.", "The board updates by itself."], win: [["Base", "+20 🪙"], ["Each right answer", "+2 🪙"], ["Victory", "+10 🪙"]] },
  c2_rush: B_RUSH("Build It, Fund It or Invest & Life? 15 concepts of the Founder Year."),
  c2_zone: { goal: "TEAM ZONE: Battleship tournament between teams.", steps: ["Play 3 battles (online or vs. computer).", "Log every result.", "Choose the hardest question of the day."], win: ZONE_WIN(24) },
  c3_vault: { goal: "TEAM ESCAPE: open 5 locks of the CREAR Bank vault and the master code.", steps: ["One tablet per team.", "Read each room and calculate the code.", "Each lock gives you a digit.", "Open the master vault!"], win: [["Base", "+30 🪙"], ["Escaped", "+8 🪙"], ["Fast escape", "+6 🪙"]], tip: "Hints cost +60 seconds. Wrong codes +10 seconds." },
  c3_hard: { goal: "THE MASTER VAULT: 6 harder locks in 15 minutes.", steps: ["Compound interest, break-even, cap tables, dollars, inflation…", "Work as a team.", "Beat the clock."], win: [["Base", "+32 🪙"], ["Escaped", "+8 🪙"], ["Fast escape", "+6 🪙"]] },
  c3_maker: { goal: "Design a lock for another team: a story with real numbers, a code and a hint.", steps: ["Choose an emoji and a room name.", "Write a 20+ word story with numbers.", "Write the code and a hint.", "Download the card and print it."], win: [["Saving your lock", "+26 🪙"]] },
  c3_zone: { goal: "TEAM ZONE: swap your printed locks with other teams and escape!", steps: ["Give your lock cards to another team.", "Solve the locks you receive.", "Log your answers and time.", "Vote the best lock."], win: ZONE_WIN(26) },
  c4_city: { goal: "CREAR City: the board game of the Founder Year (2–4 players, one tablet).", steps: ["Roll the dice and move.", "Buy businesses and collect rent.", "Invest in CDT (safe) or ETF (risky).", "Survive inflation, crashes and scams. Highest net worth wins."], win: [["Base", "+30 🪙"], ["You win", "+6 🪙"]] },
  c4_report: { goal: "Write the match report like a journalist of THE CREAR TIMES.", steps: ["Read the final table.", "Explain the decisions that won.", "Write what you'll do next time."], win: [["Publishing your report", "+24 🪙"]] },
  c4_duel: { goal: "Asset Card Duel: Return, Safety and Liquidity — the higher stat wins the cards.", steps: ["Answer the question.", "Right: YOU choose the stat. Wrong: the computer chooses.", "10 rounds. More cards wins."], win: [["Base", "+18 🪙"], ["Each round won", "+2 🪙"], ["Victory", "+6 🪙"]] },
  c4_zone: { goal: "TEAM ZONE: CREAR City team tournament.", steps: ["Play a match with another team.", "Log the final net worth of each player.", "Explain the winning strategy."], win: ZONE_WIN(24) },
  c5_tour: { goal: "The Grand Tournament: Speed, Numbers, Hard and the Final Wager.", steps: ["Stage 1: 6 fast questions.", "Stage 2: 4 problems.", "Stage 3: 4 hard questions.", "Stage 4: bet your points!"], win: [["Base", "+22 🪙"], ["Your score", "up to +22 🪙"]] },
  c5_rush: B_RUSH("Smart money move or money mistake? 14 decisions for life after school."),
  c5_hall: { goal: "See the class records of every game — and choose the MVP.", steps: ["Read the 5 rankings.", "Compare them with your records.", "Choose the MVP and explain why."], win: [["Signing the Hall of Fame", "+20 🪙"]] },
  c5_zone: { goal: "TEAM ZONE: the Grand Final — team vs. team quiz show led by your teacher.", steps: ["Choose your team captain.", "Answer as a team (30 s per question).", "Log the scores of each round."], win: ZONE_WIN(26) },
  c6_radar: { goal: "The last Founder Radar: the same 10 questions of day 1 + 5 new situations.", steps: ["Answer honestly.", "Compare with your day 1 radar.", "Rate yourself and reflect."], win: [["Saving your radar", "+30 🪙"]] },
  c6_year: { goal: "Watch your Founder Year in 10 slides — and choose your best decision.", steps: ["Tap to advance.", "Save the slides you like.", "Choose your best decision and write your lesson."], win: [["Finishing", "+25 🪙"]] },
  c6_can: { goal: "Look back at the WHOLE year: what can you do now?", steps: ["Read each 'I can' and its evidence.", "Rate yourself honestly.", "Write what you're proudest of."], win: [["Saving your recap", "+20 🪙"]] },
  c6_letter: { goal: "Write a letter to yourself at 25: plans, numbers and promises.", steps: ["Write 70–160 words.", "Use the future, 'If…, I will…' and 2 numbers.", "Download it and keep it."], win: [["Sealing your letter", "+30 🪙"]] },
  c7_quiz: { goal: "The Final Quiz Show: 20 questions from 6° to 11°.", steps: ["Answer 20 random questions.", "70% to pass."], win: [["70% or more", "to pass"], ["Each correct answer", "+3 🪙"], ["Finishing", "+12 🪙"]] },
  c7_showcase: { goal: "THE LIFE PROJECT: present your Founder Year and your plan at the Graduation Showcase.", steps: ["Check your evidence board (all year).", "Answer 3 questions from the jury.", "Present for 3–4 minutes.", "Publish your page in the Graduation Gallery."], win: [["Evidence + answers + jury", "required"], ["FinFluent Graduate certificate + 4th Founder Card", "+60 🪙"], ["Each evidence line", "+2 🪙"]] },
  c7_gallery: { goal: "Visit your classmates' graduation pages and invest 100 coins in the best stories.", steps: ["Open a page.", "Write what impressed you.", "Choose a category and invest.", "Visit at least 2 pages."], win: [["Base", "+20 🪙"], ["Each page evaluated (up to 5)", "+4 🪙"]] },
  c7_zone: { goal: "TEAM ZONE: the last team meeting — thank-you notes and your team's final numbers.", steps: ["Write the team's final numbers.", "Write a thank-you note to each teammate.", "Take the team photo with your product."], win: ZONE_WIN(24) },
};

/* =====================================================================
   ESTRUCTURA · 11° PERIODO 4 · GAME ZONE & GRADUATION (7 clases)
   ===================================================================== */
const G11P4_WEEKS = [
  { n: 1, title: "Question Forge & Millionaire", e: "💰", blurb: "Create the questions — then climb to $1,000 million.", skills: ["Create", "Review", "Millionaire", "Team Zone"], acts: [
    A11("c1_forge", "Question Forge ⚒️", "5 fair questions for the class bank.", <Hammer size={22} />, 36, "aprendi"),
    A11("c1_review", "Question Review 🔍", "Answer & judge 6 questions.", <Search size={22} />, 32, "quizzes"),
    A11("c1_mill", "FinFluent Millionaire 💰", "12 levels · 3 lifelines.", <Crown size={22} />, 38, "quizzes"),
    A11("c1_zone", "Team Zone · Game Night 🧑‍🤝‍🧑", "8 paper questions vs. another team.", <Users size={22} />, 26, "comportamiento"),
  ] },
  { n: 2, title: "Finance Battleship", e: "⚓", blurb: "Answer to fire. Sink your friends' fleets.", skills: ["Battleship", "Online 1v1", "Rush", "Team Zone"], acts: [
    A11("c2_cpu", "Battleship vs. Computer ⚓", "Right = you fire · wrong = enemy fires.", <Ship size={22} />, 34, "quizzes"),
    A11("c2_online", "Battleship Online 1 vs 1 🌐", "Challenge a classmate with a code.", <Anchor size={22} />, 44, "quizzes"),
    A11("c2_rush", "Founder Year Rush ⚡", "15 concepts · 3 boxes.", <Zap size={22} />, 24, "aprendi"),
    A11("c2_zone", "Team Zone · Battleship Tournament 🧑‍🤝‍🧑", "3 battles · results.", <Users size={22} />, 24, "comportamiento"),
  ] },
  { n: 3, title: "Escape Room: The Vault", e: "🏦", blurb: "Five locks, one master code — and a lock of your own.", skills: ["Escape", "Master vault", "Lock maker", "Team Zone"], acts: [
    A11("c3_vault", "Escape Room · The Vault 🏦", "5 rooms · master code.", <Lock size={22} />, 44, "aprendi"),
    A11("c3_hard", "The Master Vault 🔐", "6 hard locks · 15 minutes.", <KeyRound size={22} />, 46, "aprendi"),
    A11("c3_maker", "Lock Maker 🔐", "Design & print a lock.", <PenLine size={22} />, 26, "aprendi"),
    A11("c3_zone", "Team Zone · Lock Swap 🧑‍🤝‍🧑", "Solve other teams' locks.", <Users size={22} />, 26, "comportamiento"),
  ] },
  { n: 4, title: "CREAR City", e: "🏙️", blurb: "The board game of the Founder Year — and a card duel.", skills: ["Board game", "Report", "Card duel", "Team Zone"], acts: [
    A11("c4_city", "CREAR City · Board Game 🏙️", "2–4 players · 10 rounds.", <Dice5 size={22} />, 36, "aprendi"),
    A11("c4_report", "Match Report 📝", "THE CREAR TIMES · sports & money.", <Newspaper size={22} />, 24, "aprendi"),
    A11("c4_duel", "Asset Card Duel 🃏", "Return · Safety · Liquidity.", <Swords size={22} />, 40, "quizzes"),
    A11("c4_zone", "Team Zone · City Tournament 🧑‍🤝‍🧑", "Team vs. team.", <Users size={22} />, 24, "comportamiento"),
  ] },
  { n: 5, title: "The Grand Tournament", e: "🏆", blurb: "One score, four stages, the Hall of Fame.", skills: ["Tournament", "Rush", "Hall of Fame", "Team Zone"], acts: [
    A11("c5_tour", "The Grand Tournament 🏆", "Speed · Numbers · Hard · Wager.", <Trophy size={22} />, 44, "quizzes"),
    A11("c5_rush", "Smart Move or Mistake? ⚡", "14 life decisions.", <Zap size={22} />, 24, "aprendi"),
    A11("c5_hall", "Hall of Fame ⭐", "Class records + MVP.", <Medal size={22} />, 20, "comportamiento"),
    A11("c5_zone", "Team Zone · Grand Final 🧑‍🤝‍🧑", "Team quiz show.", <Users size={22} />, 26, "comportamiento"),
  ] },
  { n: 6, title: "How Far I Came", e: "🧭", blurb: "The final radar, your Founder Year and a letter to you at 25.", skills: ["Radar", "My year", "I can", "Letter"], acts: [
    A11("c6_radar", "Founder Radar 11 · Final 🧭", "Day 1 vs. today.", <Compass size={22} />, 30, "aprendi"),
    A11("c6_year", "My Founder Year 🎞️", "10 slides of your year.", <Sparkles size={22} />, 25, "comportamiento"),
    A11("c6_can", "What I Can Do Now ✅ · The Year", "9 'I can' with evidence.", <BadgeCheck size={22} />, 20, "comportamiento"),
    A11("c6_letter", "A Letter to Me at 25 💌", "Plans, numbers, promises.", <Mail size={22} />, 30, "aprendi"),
  ] },
  { n: 7, title: "Graduation Showcase", e: "🎓", blurb: "The last quiz show, the life project and the graduation gallery.", skills: ["Quiz show", "Life project", "Gallery", "Team Zone"], acts: [
    A11("c7_quiz", "The Final Quiz Show 🎤", "20 questions · 6° to 11°.", <Mic size={22} />, 72, "quizzes"),
    A11("c7_showcase", "Graduation Showcase 🎓 · THE LIFE PROJECT", "Evidence · Q&A · present · certificate.", <GraduationCap size={22} />, 72, "aprendi"),
    A11("c7_gallery", "Graduation Gallery 🖼️", "Invest 100 coins in the best stories.", <Store size={22} />, 40, "comportamiento"),
    A11("c7_zone", "Team Zone · Last Meeting 🧑‍🤝‍🧑", "Thank-you notes · final numbers.", <Users size={22} />, 24, "comportamiento"),
  ] },
];

const ZONES_P4 = {
  c1_zone: { title: "Team Zone · Game Night 🧑‍🤝‍🧑", subtitle: "Prepare a paper quiz for another team — and play it.", goals: [
    { k: "qs", e: "📝", t: "Our 8 questions (with answers)", cols: [{ k: "q", l: "Question", ph: "What is a real return?" }, { k: "a", l: "Answer", ph: "Return after inflation" }, { k: "t", l: "Topic", ph: "Invest 18+" }], min: 8 },
    { k: "host", e: "🎙️", t: "Our host and our rules", ph: "Luis hosts · 30 s per question · no phones" },
    { k: "score", e: "🏆", t: "Final score (us vs. them)", ph: "We 6 – They 5" },
  ], coins: 26, minutes: 40 },
  c2_zone: { title: "Team Zone · Battleship Tournament 🧑‍🤝‍🧑", subtitle: "Three battles against other teams. Every result counts.", goals: [
    { k: "bt", e: "⚓", t: "Our battles", cols: [{ k: "vs", l: "Against", ph: "Team Nova" }, { k: "res", l: "Result", ph: "Won" }, { k: "left", l: "Ships left", type: "num", ph: "2" }], min: 3 },
    { k: "hard", e: "🤯", t: "The hardest question of the day (and its answer)", words: 10, ph: "“A CDT pays 9% and inflation is 13%…” → about −3.6%" },
  ], coins: 24, minutes: 35 },
  c3_zone: { title: "Team Zone · Lock Swap 🧑‍🤝‍🧑", subtitle: "Give your printed locks to another team. Solve theirs.", goals: [
    { k: "locks", e: "🔐", t: "Locks we solved", cols: [{ k: "from", l: "From team", ph: "Team Sol" }, { k: "lock", l: "Lock", ph: "The Cupcake Factory" }, { k: "ans", l: "Our code", ph: "50" }, { k: "ok", l: "Correct?", ph: "Yes" }], min: 3 },
    { k: "time", e: "⏱️", t: "Our total time (minutes)", kind: "num", unit: "min", ph: "18" },
    { k: "best", e: "🏅", t: "The best lock we received — and why", words: 10, ph: "The Shark Office, because the story was…" },
  ], coins: 26, minutes: 35 },
  c4_zone: { title: "Team Zone · City Tournament 🧑‍🤝‍🧑", subtitle: "One CREAR City match against another team on one tablet.", goals: [
    { k: "res", e: "🏙️", t: "Final net worth of each player", cols: [{ k: "who", l: "Player", ph: "Sofía" }, { k: "team", l: "Team", ph: "Nova" }, { k: "nw", l: "Net worth $", type: "num", ph: "2350000" }], min: 4 },
    { k: "why", e: "💡", t: "The winning strategy", words: 15, ph: "The winner bought cheap businesses early and kept cash for…" },
  ], coins: 24, minutes: 40 },
  c5_zone: { title: "Team Zone · Grand Final 🧑‍🤝‍🧑", subtitle: "Your teacher hosts; teams answer together.", goals: [
    { k: "cap", e: "👑", t: "Our captain", ph: "Ana" },
    { k: "rounds", e: "🏆", t: "Score of each round", cols: [{ k: "r", l: "Round", ph: "1" }, { k: "us", l: "Us", type: "num", ph: "3" }, { k: "best", l: "Best team", ph: "Nova · 4" }], min: 3 },
    { k: "learn", e: "📚", t: "One thing we learned from another team", words: 10, ph: "Team Sol explained the Rule of 72 better…" },
  ], coins: 26, minutes: 40 },
  c7_zone: { title: "Team Zone · Last Meeting 🧑‍🤝‍🧑", subtitle: "Your team built a company this year. Close it like founders.", goals: [
    { k: "nums", e: "📊", t: "Our company's final numbers", cols: [{ k: "k", l: "Number", ph: "Units sold" }, { k: "v", l: "Value", ph: "240" }], min: 4 },
    { k: "thanks", e: "💌", t: "A thank-you note to each teammate", words: 20, ph: "Luis: thanks for the recipes… Sofía: …" },
    { k: "photo", e: "📸", t: "Team photo with our product (where is it?)", ph: "Taken with the teacher's tablet" },
  ], coins: 24, minutes: 30 },
};
const RUSH_SMART = {
  buckets: [{ id: "smart", e: "✅", l: "Smart move", d: "builds your future", c: "#3c9d5d" }, { id: "oops", e: "❌", l: "Money mistake", d: "costs you later", c: "#c8563a" }],
  items: [
    { e: "🚑", t: "Building an emergency fund before investing", b: "smart", why: "Protection first." }, { e: "💳", t: "Paying only the credit card minimum", b: "oops", why: "Expensive interest." },
    { e: "🧺", t: "A low-fee ETF for 10+ years", b: "smart", why: "Diversified and cheap." }, { e: "🎣", t: "An app that 'guarantees' 8% monthly", b: "oops", why: "Classic scam." },
    { e: "🎓", t: "Comparing tuition, living costs and scholarships", b: "smart", why: "Full cost." }, { e: "🪪", t: "Lending your name for a friend's loan", b: "oops", why: "Their debt becomes yours." },
    { e: "🐷", t: "Paying yourself first every month", b: "smart", why: "Savings automatic." }, { e: "🚀", t: "All your savings in one hot stock", b: "oops", why: "No diversification." },
    { e: "🔐", t: "Two-factor security in your bank app", b: "smart", why: "Protects your account." }, { e: "🏃", t: "Selling everything in a 20% crash", b: "oops", why: "Panic locks in losses." },
    { e: "🏛️", t: "Checking the Superfinanciera before investing", b: "smart", why: "Supervised = safer." }, { e: "🛏️", t: "Keeping 5 years of savings under the mattress", b: "oops", why: "Inflation eats it." },
    { e: "📋", t: "A budget before your first salary", b: "smart", why: "A plan for every peso." }, { e: "🎰", t: "Borrowing to buy a meme coin", b: "oops", why: "Debt + speculation." },
  ],
};

const P4x = (resp) => resp?.__p1 || {};
const CFG114 = {
  n: 4, KEY: "11P4", title: "Game Zone & Graduation 🎓",
  question: "How much do you really know — and how far did you come?",
  howyear: "The last period of FinFluent: you create questions, play Millionaire, Battleship, an escape room, a board game and a card duel with everything you learned since 6th grade. Then the final radar, a letter to you at 25 and the Graduation Showcase.",
  chips: ["🎮 Game Zone", "🧭 Final radar", "🎓 Graduation"], bigKeys: ["c7_showcase"], pageKeys: ["c1_zone", "c2_zone", "c3_zone", "c4_zone", "c5_zone", "c7_zone"],
  weeks: G11P4_WEEKS,
  panel: (ctx, compact) => { const co = co11(P4x(ctx.resp)); const r = ctx.resp || {}; return <FounderPanel co={co} have={ctx.have} compact={compact} studentName={ctx.name} title="PERIOD 4 · GAME ZONE" stats={[{ l: "💰 Millionaire", v: r.c1_mill ? `L${r.c1_mill.best}/12` : "—" }, { l: "⚓ Battleship", v: r.c2_cpu || r.c2_online ? (r.c2_cpu?.win || r.c2_online?.win ? "Victory" : "Fought") : "—" }, { l: "🏦 Vault", v: r.c3_vault?.escaped ? mmss(r.c3_vault.time) : "—" }, { l: "🧭 Radar", v: r.c6_radar ? `${r.c6_radar.average}%` : "—" }]} />; },
  render: (act, ctx) => {
    const P = { onSave: ctx.save, onExit: ctx.exit };
    const L = mkLearn(ctx, Brief91);
    const Z = ZONES_P4[act];
    if (Z) return <TeamZone {...Z} brief={<Brief91 k={act} />} resp={ctx.resp} existing={ctx.existing} {...P} />;
    switch (act) {
      case "c1_forge": return <QuestionForge ctx={ctx} existing={ctx.existing} {...P} />;
      case "c1_review": return <QuestionReview ctx={ctx} {...P} />;
      case "c1_mill": return <Millionaire ctx={ctx} existing={ctx.existing} {...P} />;
      case "c2_cpu": return <BattleCPU ctx={ctx} {...P} />;
      case "c2_online": return <BattleOnline ctx={ctx} {...P} />;
      case "c2_rush": return L.rush("c2_rush", "Founder Year Rush ⚡", "Build It, Fund It or Invest & Life?", RUSH_YEAR, "Founder memory! 🚀", 75);
      case "c3_vault": return <VaultGame ctx={ctx} k="c3_vault" game="vault" rooms={VAULT} final={VAULT_FINAL} title="Escape Room · The Vault 🏦" subtitle="Five rooms, five locks, one master code. Work as a team!" coinsBase={30} {...P} />;
      case "c3_hard": return <VaultGame ctx={ctx} k="c3_hard" game="vault2" rooms={VAULT_HARD} final={VAULT_HARD_FINAL} title="The Master Vault 🔐" subtitle="Six hard locks. 15 minutes. No mercy." limit={900} coinsBase={32} {...P} />;
      case "c3_maker": return <LockMaker existing={ctx.existing} {...P} />;
      case "c4_city": return <CityGame ctx={ctx} existing={ctx.existing} {...P} />;
      case "c4_report": return <CityReport resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c4_duel": return <CardDuel ctx={ctx} {...P} />;
      case "c5_tour": return <GrandTournament ctx={ctx} existing={ctx.existing} {...P} />;
      case "c5_rush": return L.rush("c5_rush", "Smart Move or Mistake? ⚡", "Decisions for life after school.", RUSH_SMART, "Smart money brain! 🧠", 75);
      case "c5_hall": return <HallOfFame ctx={ctx} existing={ctx.existing} {...P} />;
      case "c6_radar": return <Radar11Final resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c6_year": return <FounderYear resp={ctx.resp} rows={ctx.rows} pointsNow={ctx.coinsTotal} actsNow={ctx.doneCount} studentName={ctx.name} have={ctx.have} existing={ctx.existing} {...P} />;
      case "c6_can": return <WhatICan title="What I Can Do Now ✅ · The Founder Year" items={CAN_YEAR} resp={ctx.resp} existing={ctx.existing} brief={<Brief91 k="c6_can" />} {...P} />;
      case "c6_letter": return <FutureLetter resp={ctx.resp} studentName={ctx.name} existing={ctx.existing} {...P} />;
      case "c7_quiz": return <QuizRunner title="The Final Quiz Show · 6° to 11°" emoji="🎤" questions={QB11} pickCount={20} passThreshold={70} xpPerCorrect={3} xpComplete={12} {...P} />;
      case "c7_showcase": return <GradShowcase resp={ctx.resp} studentName={ctx.name} userData={ctx.userData} API_URL={ctx.API_URL} existing={ctx.existing} {...P} />;
      case "c7_gallery": return <FairArena userData={ctx.userData} API_URL={ctx.API_URL} grado="11-GR" title="Graduation Gallery 🖼️" subtitle="Invest 100 coins in the classmates' stories that inspired you most." brief={<Brief91 k="c7_gallery" />} coinsBase={20} unitWord="page" {...P} />;
      default: return null;
    }
  },
};
export const Periodo4G11 = (props) => <PeriodShell10 cfg={CFG114} {...props} />;