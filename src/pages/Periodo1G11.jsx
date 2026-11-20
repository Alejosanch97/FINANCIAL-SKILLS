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
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   GRADO 11 · PERIODO 1 · STARTUP STUDIO: BUILD IT (B2+)
   Año "FOUNDER YEAR": cada periodo lee las filas anteriores ("11P1"…"11P3") y suma una Founder Card.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "11P1", Grado = "11".
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
   11° · PERIODO 1 · STARTUP STUDIO — LECTURAS (THE CREAR TIMES, B2+)
   ===================================================================== */
const VID_COLOR11 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1794068411/videoplayback_42.mp4";
const VQ_COLOR11 = [
  { q: "What role does color psychology play in branding?", options: ["It decides the prices companies can charge.", "Brands use it on purpose to shape emotions and choices.", "It only matters for products sold to children.", "It is a government rule that decides the colors of logos and packaging."], correct: 1, feedback: "Colors are chosen on purpose: they push feelings and decisions." },
  { q: "What does RED usually trigger?", options: ["Security, calm and stability.", "Nature, health and growth.", "Energy, urgency and appetite.", "Royalty, wisdom and luxury."], correct: 2, feedback: "Red = energy, urgency, appetite — think of fast food and sales." },
  { q: "Why do banks and tech companies love BLUE?", options: ["It communicates trust and security.", "It pushes people to buy on impulse.", "It makes people feel hungry.", "It shows energy and urgency."], correct: 0, feedback: "Blue = trust and security." },
  { q: "How is YELLOW used in stores?", options: ["To look exclusive and luxurious.", "To show trust, safety and security.", "To make customers feel calm.", "To catch attention and show optimism."], correct: 3, feedback: "Yellow grabs attention and feels optimistic." },
  { q: "What job does ORANGE often do on websites?", options: ["A calm background for long reading.", "Call-to-action buttons: buy, subscribe.", "Official forms and legal pages.", "Luxury products, premium plans and VIP memberships."], correct: 1, feedback: "Orange buttons invite action." },
  { q: "When do brands use GREEN?", options: ["Power, mystery and luxury fashion.", "Urgency and big discount sales.", "Health, growth, nature and eco products.", "Trust, safety and security for banks."], correct: 2, feedback: "Green = health, nature, growth." },
  { q: "What image does PURPLE give a product?", options: ["Royalty, wisdom and luxury.", "Cheap, cheerful products for kids.", "Speed, energy and urgency.", "Nature and organic farming."], correct: 0, feedback: "Purple = royalty and luxury." },
  { q: "Why do clearance sales use red signs?", options: ["Red builds long-term trust.", "Red means eco-friendly.", "Red is the cheapest paint.", "Red creates urgency."], correct: 3, feedback: "Red = act now!" },
  { q: "How do online stores choose colors?", options: ["They follow the trend of the season, without any real plan.", "They use the colors that cost less to print on labels and boxes.", "Every shade is chosen to guide feelings and actions.", "The law decides the colors for online stores."], correct: 2, feedback: "Nothing is random: color guides behavior." },
  { q: "What is the lesson for founders like you?", options: ["Pick the colors you personally like the most.", "Choose colors that match the feeling your customer needs.", "Use as many colors as possible so the brand looks fun and young.", "Colors don't matter at all if the product inside is really good."], correct: 1, feedback: "Your logo's colors should speak to YOUR customer." },
];

/* ---------- R1 · Airbnb ---------- */
const READ_AIRBNB = [
  { node: <NewsHead key="n" s="BUSINESS" d="San Francisco, 2007" k="How a rent problem became a global company" /> },
  { h: "Three air mattresses and a rent problem" },
  { p: "In October 2007, two young designers in San Francisco, Brian Chesky and Joe Gebbia, had a very ordinary problem: they could not pay their rent. At the same time, the city had a very different problem. A big design conference was coming, and every hotel room was full. Thousands of visitors needed a place to sleep, and there was nowhere to go." },
  { p: "Chesky and Gebbia looked at their apartment and saw something nobody else saw: empty floor space. They bought three air mattresses, built a simple website called 'AirBed & Breakfast' and promised guests a mattress, breakfast and local tips. Three people paid to sleep on their floor. The founders paid their rent — and, more importantly, they learned that strangers were willing to pay to stay in someone's home." },
  { h: "A problem, not just an idea" },
  { p: "Many teenagers think a business starts with a brilliant idea. Successful founders usually start somewhere else: with a painful, frequent problem that real people already try to solve. Hotel rooms were expensive and sometimes impossible to find; travelers wanted something cheaper and more local. The air mattresses were not the business. The business was solving that pain." },
  { box: "💡 Founders look for problems that are FREQUENT (they happen a lot), PAINFUL (people really suffer) and PAID (people already spend money trying to solve them)." },
  { h: "Cereal boxes to survive" },
  { p: "The beginning was not glamorous. For months, almost nobody used the website. In 2008, during the United States presidential election, the founders designed special cereal boxes — 'Obama O's' and 'Cap'n McCain's' — and sold them as collector's items. They raised around 30,000 dollars, enough to keep the company alive. The episode shows another lesson: early founders do unusual, creative things to survive while they learn what customers really want." },
  { p: "Later, the team visited their first hosts in New York and noticed something important: the photos of the apartments were terrible. They rented a camera, took professional pictures and bookings went up. They did not discover this in a spreadsheet; they discovered it by talking to users and watching what they did." },
  { h: "From the floor to the world" },
  { p: "Airbnb grew into one of the largest travel companies in the world, with millions of homes listed in almost every country. It also created new problems — some cities complain that it raises rents and changes neighborhoods — which shows that every business has an impact beyond its customers." },
  { h: "What this means for your team" },
  { list: ["Start with a problem you can SEE in your school or neighborhood.", "Test it small and fast — three customers are enough to learn.", "Talk to your users and watch what they do, not only what they say.", "Be ready to do creative things to survive the first months."] },
  { box: "🧠 Your product this year will be physical: a dessert, a snack, a drink, a handmade object. But the question is the same one Chesky and Gebbia asked: whose problem am I solving, and will they pay for my solution?" },
];
const GLOSS_AIRBNB = { "founder": "a person who starts a company", "conference": "a big meeting of professionals", "pain": "a problem that really bothers people", "frequent": "happening often", "collector's items": "objects people buy to keep because they are rare", "bookings": "reservations", "impact": "the effect something has on other people" };
const Q_AIRBNB = [
  { q: "What problem did Chesky and Gebbia have in 2007?", options: ["They could not find investors for their design studio.", "They could not pay their rent.", "Their hotel was always empty.", "They lost their jobs at a conference."], correct: 1, feedback: "Their own problem was rent; the city's problem was full hotels." },
  { q: "Why was the timing of the design conference important?", options: ["Hotels were full, so visitors needed another place to sleep.", "The conference gave free tickets to new companies.", "Investors at the conference were looking for apps.", "The city gave money to the people who hosted guests at home."], correct: 0, feedback: "Scarcity of rooms created demand for their floor." },
  { q: "According to the text, what was the REAL business?", options: ["Selling cheap air mattresses online to students.", "Organizing international design conferences.", "Solving travelers' need for a cheaper, local place to stay.", "Selling homemade breakfast to tourists who stay in big hotels."], correct: 2, feedback: "The mattresses were only the first solution to a real pain." },
  { q: "Which three words describe a good problem to solve?", options: ["New, modern and digital.", "Cheap, fast and easy.", "Big, global and famous.", "Frequent, painful and paid."], correct: 3, feedback: "Frequent + painful + already paid for = a real opportunity." },
  { q: "Why did the founders sell 'Obama O's' cereal boxes?", options: ["To test a new food business before the conference.", "To raise money and keep the company alive.", "Because the government asked them to.", "Because the government asked them to help tourists during the event."], correct: 1, feedback: "About US$30,000 kept the company alive." },
  { q: "How did they discover that photos were a problem?", options: ["By visiting hosts and watching what happened.", "By reading a famous marketing book about startups.", "Because an important investor told them in a meeting.", "Because hotels complained about them."], correct: 0, feedback: "Talking to users and observing beats guessing." },
  { q: "Which negative impact of Airbnb does the text mention?", options: ["It makes every trip much more expensive for tourists and families.", "It closed all the hotels in some big cities.", "Some cities say it raises rents and changes neighborhoods.", "It sells the personal data of hosts to companies."], correct: 2, feedback: "Every business has an impact beyond its customers." },
  { q: "What is the main lesson for your team this year?", options: ["Start with a brilliant idea and protect it.", "Start with a real problem and test a small solution.", "Start with a big loan from the bank to build your own factory.", "Start by copying the most famous company in your city."], correct: 1, feedback: "Problem first, small test, learn fast." },
];

/* ---------- R2 · New Coke ---------- */
const READ_COKE = [
  { node: <NewsHead key="n" s="MARKETING" d="Atlanta, 1985" k="The taste test that lied" /> },
  { h: "The biggest test in history" },
  { p: "In the early 1980s, Coca-Cola had a worrying problem. Its rival, Pepsi, was running the 'Pepsi Challenge': people tasted two drinks without seeing the brand, and many preferred the sweeter Pepsi. Coca-Cola's market share was slowly falling. The company's leaders decided to act like scientists. They created a new, sweeter formula and organized one of the biggest taste tests in history, with around 200,000 people." },
  { p: "The results looked perfect. In blind tests, most people preferred the new formula to the old Coca-Cola and to Pepsi. So, on April 23, 1985, the company announced 'New Coke' and stopped producing the original drink." },
  { h: "Customers were furious" },
  { p: "What happened next shocked the company. Thousands of angry phone calls and letters arrived every day. People said Coca-Cola had taken away a part of their childhood, their family traditions and even their national identity. Some people bought and stored bottles of the old drink. Protest groups appeared. The company had asked customers which drink TASTED better. It had never asked what the drink MEANT to them." },
  { box: "⚠️ Customers do not buy only a taste or a function. They buy memories, identity and emotions. A test that measures only one thing can give you a dangerously wrong answer." },
  { h: "79 days later" },
  { p: "On July 11, 1985 — only 79 days after the launch — Coca-Cola brought back the original formula as 'Coca-Cola Classic'. The news was so big that it interrupted television programs. Sales of the classic drink went up, and some analysts later joked that the 'mistake' was the best marketing campaign in history. The company itself recognized that it had underestimated the emotional connection people had with the brand." },
  { h: "Why good data can give bad answers" },
  { p: "The research was big, expensive and well organized. The problem was the QUESTION. People tasted a small sip, not a full can on a hot day. Nobody told them the old drink would disappear. And the test measured preference in a laboratory, not behavior in real life. Researchers today say that what people do is more reliable than what they say they would do." },
  { list: ["Ask about real past behavior: 'When did you last buy…?' is better than 'Would you buy…?'", "Test in real situations, not only in a laboratory.", "Ask what your product MEANS, not only how it works.", "Be careful with questions that push people to give the answer you want."] },
  { h: "What this means for your interviews" },
  { p: "This week you will interview real customers. Five friends saying 'I would totally buy it!' is not evidence. Watch what they do, ask what they did last time they had the problem, and look for the emotions behind the purchase. Coca-Cola learned that lesson with millions of dollars; you can learn it with five honest conversations." },
];
const GLOSS_COKE = { "market share": "the % of all sales in a market that one company has", "blind test": "a test where people don't know the brand", "formula": "the recipe of a product", "underestimated": "thought something was smaller or less important than it was", "behavior": "what people really do", "identity": "who you feel you are" };
const Q_COKE = [
  { q: "Why was Coca-Cola worried in the early 1980s?", options: ["Its market share was slowly falling to Pepsi.", "Its factories were too old and too slow.", "The government banned sugary drinks.", "Its bottles were too expensive."], correct: 0, feedback: "The Pepsi Challenge was hurting Coca-Cola." },
  { q: "How many people took part in the taste tests, approximately?", options: ["About 2,000.", "About 20,000.", "About 200,000.", "About 2 million."], correct: 2, feedback: "Around 200,000 people." },
  { q: "What did the company do when it launched New Coke?", options: ["It sold both drinks at the same price.", "It stopped producing the original drink.", "It only sold New Coke abroad.", "It gave New Coke away for free."], correct: 1, feedback: "Removing the original made people furious." },
  { q: "What had the research NOT measured?", options: ["The price people would pay.", "Whether people preferred the sweeter taste.", "How the drink tasted in a blind test.", "What the drink meant emotionally to people."], correct: 3, feedback: "Taste was measured; meaning and identity were not." },
  { q: "How long did New Coke last before the classic came back?", options: ["79 days.", "One full year.", "Seven days.", "Three years."], correct: 0, feedback: "From April 23 to July 11, 1985." },
  { q: "Why do researchers prefer questions about past behavior?", options: ["They are shorter and easier to translate.", "What people did is more reliable than what they say they'd do.", "Customers like talking about the past more than the future.", "They give bigger and better numbers for sales forecasts."], correct: 1, feedback: "Behavior beats promises." },
  { q: "Which interview question is the BEST?", options: ["“Would you buy my amazing new gelatin if it were really cheap?”", "“Don't you think healthy snacks are great for students?”", "“When did you last buy a dessert at school, and what did you pay?”", "“Do you like my idea, and would you tell your friends?”"], correct: 2, feedback: "Specific, past, real behavior — no pushing." },
  { q: "What is the main lesson of the New Coke case?", options: ["Big companies should never change their products.", "Customers buy emotions and meaning, not only a function.", "Blind tests are always useless, so companies should never do them.", "Sweet drinks always win in every market and every country."], correct: 1, feedback: "Measure the right thing — including meaning." },
];

/* ---------- R3 · Juan Valdez ---------- */
const READ_VALDEZ = [
  { node: <NewsHead key="n" s="BRANDS" d="Colombia, 1959 – today" k="A brand built by farmers" /> },
  { h: "A man, a mule and a mountain" },
  { p: "In the 1950s, Colombian coffee was excellent, but in supermarkets around the world it was just 'coffee'. Buyers mixed beans from many countries, and the farmer who worked on a steep mountain in Caldas or Antioquia received the same price as anyone else. The National Federation of Coffee Growers (Federación Nacional de Cafeteros) decided to change that with a brand." },
  { p: "In 1959, together with an advertising agency in New York, the Federation created Juan Valdez: a friendly coffee farmer with a hat, a poncho and his mule, Conchita, walking through the mountains. He was not a celebrity. He represented the more than 500,000 families who grew coffee by hand. The message was simple: 100% Colombian coffee is special because real people pick every bean, one by one." },
  { box: "🎨 A brand is a promise. Juan Valdez promised QUALITY (hand-picked), ORIGIN (Colombian mountains) and PEOPLE (farmer families) — and the logo shows all three in one image." },
  { h: "Why a logo can raise a price" },
  { p: "When customers recognize and trust a brand, they are willing to pay more. That difference is called a premium. The Juan Valdez logo — a triangle that suggests the mountains, the farmer and the mule — appeared on coffee packages around the world. It told buyers that the coffee came from Colombia, and that origin became valuable. Advertising experts often mention the campaign as one of the most successful 'origin brands' in history." },
  { h: "From advertising to coffee shops" },
  { p: "In 2002, the Federation opened the first Juan Valdez coffee shop in Bogotá. It was a bold idea: international chains were arriving, and many people believed a local brand could not compete. Today there are hundreds of Juan Valdez stores in Colombia and other countries. Part of the profits belongs to the coffee-growing families through the Federation, so the brand works for the people it represents." },
  { h: "The colors and the story" },
  { p: "The brand uses warm, natural colors — browns, creams and greens — that suggest the land, the mountains and a handmade product. The typography is classic and calm, not aggressive. Every element tells the same story. That is the secret of strong branding: name, logo, colors, words and experience all say the same thing." },
  { list: ["Name: easy to remember and connected to a person or a promise.", "Symbol: one image that tells your story.", "Colors: chosen for the feeling your customer needs.", "Experience: what customers feel when they buy and use the product."] },
  { h: "What this means for your brand" },
  { p: "Your team is not Coca-Cola or the Coffee Federation, but you can use the same tools. Ask yourselves: what is our promise? Who are the people behind our product? Which colors and symbol tell that story in one second? A good brand does not need a big budget; it needs a clear promise that is true." },
];
const GLOSS_VALDEZ = { "brand": "the name, symbol and promise that people recognize", "premium": "an extra price people pay for something they trust or value", "origin": "the place where something comes from", "bold": "brave, taking a risk", "typography": "the style of the letters" };
const Q_VALDEZ = [
  { q: "What problem did Colombian coffee have in the 1950s?", options: ["It was mixed with other beans and sold as just 'coffee'.", "It was too expensive to export to Europe and the United States.", "Its quality was very low compared with Brazil's.", "Farmers did not want to sell their coffee abroad."], correct: 0, feedback: "Without a brand, origin had no value." },
  { q: "Who created Juan Valdez?", options: ["A famous Colombian actor who loved coffee.", "The National Federation of Coffee Growers with an agency.", "A big supermarket chain in the United States and Canada.", "The Colombian government in 2002, with a new law."], correct: 1, feedback: "The Federation, with a New York agency, in 1959." },
  { q: "What did Juan Valdez represent?", options: ["Rich international coffee companies and their owners.", "International coffee shops in big cities.", "Hundreds of thousands of coffee-growing families.", "Colombian tourism, hotels and restaurants in general."], correct: 2, feedback: "He represented the farmer families." },
  { q: "What is a 'premium', according to the text?", options: ["A special discount for loyal and frequent customers.", "A small gift that comes free with the product.", "The tax that a company pays on its exports.", "An extra price people pay for a brand they trust."], correct: 3, feedback: "Trust and recognition allow a higher price." },
  { q: "Which three ideas did the brand promise?", options: ["Quality, origin and people.", "Speed, price and modernity.", "Luxury, fashion and youth.", "Health, sport and energy."], correct: 0, feedback: "Hand-picked quality, Colombian origin, farmer families." },
  { q: "When did the first Juan Valdez coffee shop open?", options: ["In 1959.", "In 2002.", "In 1985.", "In 2015."], correct: 1, feedback: "Bogotá, 2002." },
  { q: "Why are the brand's colors brown, cream and green?", options: ["They are the cheapest colors to print.", "They are the colors of the Colombian flag.", "They suggest land, mountains and a handmade product.", "Coffee buyers in other countries prefer dark packages."], correct: 2, feedback: "Every element tells the same story." },
  { q: "What is the secret of strong branding, according to the text?", options: ["A very big advertising budget on TV and social media.", "A famous person in every advertisement.", "Changing the logo every year to look new and fresh.", "Name, logo, colors and experience telling one true story."], correct: 3, feedback: "Consistency + a true promise." },
];

/* ---------- R4 · JC Penney ---------- */
const READ_PENNEY = [
  { node: <NewsHead key="n" s="RETAIL" d="United States, 2012" k="The price experiment that cost billions" /> },
  { h: "No more fake sales" },
  { p: "In 2011, the American department store JC Penney hired Ron Johnson, the executive who had created the successful Apple Stores. He looked at Penney's prices and saw something strange. The store raised prices and then offered huge 'discounts' almost every week: 40% off, 60% off, coupons, special days. Most products were sold on sale. Johnson thought this was dishonest and confusing. His plan was to end the game." },
  { p: "In 2012, JC Penney introduced 'Fair and Square' pricing: honest, lower prices every day, with no coupons and very few sales. A shirt that used to cost $40 'on sale' at $20 would simply cost $20, every day. On paper, customers would pay the same — or less." },
  { h: "Customers disappeared" },
  { p: "The result was a disaster. Customers stopped coming. Without the excitement of a big discount, a $20 shirt did not feel like a good deal. In 2012, the company's sales fell by about 25%, billions of dollars, and it lost a lot of money. In April 2013, Ron Johnson was fired, and the store went back to coupons and sales." },
  { box: "🧠 Price is not only a number. It is a feeling. People compare a price with a REFERENCE (the 'before' price, the competitor, what they paid last time). '$40 → $20' feels like winning; '$20' feels like nothing." },
  { h: "Three ways to set a price" },
  { p: "Companies usually combine three methods. Cost-plus pricing starts with what the product costs and adds a margin. Competitor pricing looks at what similar products cost. Value-based pricing asks how much customers are willing to pay for the benefit they receive. JC Penney's numbers were logical, but they ignored how customers perceived value." },
  { list: ["Cost-plus: unit cost $1,500 + 60% margin = $2,400.", "Competitor: similar desserts cost $2,500–$3,000 at school.", "Value-based: customers say they would pay up to $3,000 for something homemade and healthy."] },
  { h: "Margins matter more than sales" },
  { p: "Selling a lot is not the same as making money. If a cookie costs $1,500 to make and you sell it for $1,600, you earn only $100 per unit. One broken batch or one extra cost, and the profit disappears. Professional sellers watch their margin: the percentage of the price that remains after paying the cost of the product." },
  { h: "What this means for your price" },
  { p: "This week you will calculate your unit cost, look at competitors and test prices with real people. Remember JC Penney: the cheapest price is not always the best strategy, and a 'logical' price can fail if it ignores feelings. The best price covers your costs, respects the market and matches the value your customer sees." },
];
const GLOSS_PENNEY = { "department store": "a big store that sells many kinds of products", "reference price": "the price people compare with", "margin": "the % of the price that stays after paying the cost", "perceived value": "how much something seems to be worth to the customer", "fired": "removed from a job" };
const Q_PENNEY = [
  { q: "Why did Ron Johnson want to change JC Penney's prices?", options: ["He thought constant fake discounts were dishonest and confusing.", "The government forced the company to lower all its prices.", "Customers asked for more coupons.", "The company had too many products."], correct: 0, feedback: "He wanted honest, everyday prices." },
  { q: "What was 'Fair and Square' pricing?", options: ["Bigger discounts and coupons every single weekend.", "Higher prices with better quality in every product.", "Honest, lower prices every day, almost without sales.", "Prices that changed every hour, like an auction."], correct: 2, feedback: "No coupons, fewer sales, lower everyday prices." },
  { q: "What happened to sales in 2012?", options: ["They grew a little.", "They fell by about 25%.", "They stayed the same.", "They doubled."], correct: 1, feedback: "About a quarter of sales disappeared." },
  { q: "Why did a $20 shirt not feel like a good deal?", options: ["The quality of the shirts and jeans went down a lot.", "Competitors sold exactly the same shirt for only $5.", "Customers had no money to spend in 2012.", "There was no higher reference price to compare with."], correct: 3, feedback: "No '$40 → $20', no feeling of winning." },
  { q: "Which method starts with the cost of the product?", options: ["Value-based pricing.", "Cost-plus pricing.", "Competitor pricing.", "Psychological pricing."], correct: 1, feedback: "Cost-plus = cost + margin." },
  { q: "A cookie costs $1,500 and sells for $1,600. What is the problem?", options: ["The margin is very small and easy to lose.", "The price is too high for the market.", "The cost is too low to be real.", "There is no problem: every sale is profit."], correct: 0, feedback: "Only $100 per unit — almost no margin." },
  { q: "What is value-based pricing?", options: ["Copying the price of the cheapest competitor.", "Adding a fixed 50% to the cost of every product.", "Using the price customers would pay for the benefit.", "Changing the price every week to test the market."], correct: 2, feedback: "It starts from the customer's willingness to pay." },
  { q: "What is the main lesson for your team?", options: ["Always choose the cheapest price to sell more units.", "Never use discounts or promotions of any kind, even at Christmas.", "Copy the price of the biggest store in the city.", "Cover costs, respect the market and match perceived value."], correct: 3, feedback: "Price = numbers + feelings." },
];

/* ---------- R5 · Juicero ---------- */
const READ_JUICERO = [
  { node: <NewsHead key="n" s="STARTUPS" d="Silicon Valley, 2016–2017" k="US$120 million for a juice press" /> },
  { h: "A beautiful machine" },
  { p: "In 2016, a startup called Juicero launched an elegant kitchen machine connected to Wi-Fi. Customers bought packs of chopped fruit and vegetables from the company, put them in the machine and received fresh juice. Investors loved the idea: technology, healthy food and a subscription model, because customers would buy new packs every week. The company raised around 120 million dollars." },
  { p: "The machine was expensive. At launch it cost 699 dollars, and the packs cost between 5 and 8 dollars each. Engineers had designed a powerful press with many custom parts, so the cost of making each machine was very high." },
  { h: "The video that changed everything" },
  { p: "In April 2017, journalists from Bloomberg published a video. They took a Juicero pack and squeezed it with their hands. The juice came out almost as fast as with the 699-dollar machine. The story spread everywhere. Customers asked a simple question: why pay for a machine I don't need? The company cut the price to 399 dollars and offered refunds, but trust was gone. In September 2017, Juicero closed." },
  { box: "📊 Juicero had money, technology and a famous team. What it did not have was a realistic forecast: how many people would really pay that price, every week, for something they could almost do with their hands?" },
  { h: "Forecasts and break-even" },
  { p: "Every business needs two numbers before it spends big money. The first is the sales forecast: how many units we will really sell, based on evidence. The second is the break-even point: how many units we must sell to cover all our costs. Fixed costs — machines, molds, a stand, permits — are paid even if we sell nothing. Each unit sold contributes the difference between its price and its variable cost." },
  { list: ["Break-even units = fixed costs ÷ (price − variable cost per unit).", "Example: fixed costs $300,000; price $3,000; variable cost $1,500 → 300,000 ÷ 1,500 = 200 units.", "If your realistic forecast is 80 units a month, you need almost three months just to recover the fixed costs."] },
  { h: "Optimism is not a forecast" },
  { p: "Founders are optimistic by nature. That is good for energy, but dangerous for numbers. A professional forecast starts from facts: how many potential customers exist, how many will see the product, and how many of them will buy, based on tests. Juicero's investors imagined millions of kitchens; the market was much smaller and much more sensitive to price." },
  { h: "What this means for your launch" },
  { p: "Before your team buys molds, packaging or a big amount of ingredients, calculate your break-even point and build a forecast from your interviews and price tests. And remember: perishable products like gelatin or cupcakes that are not sold become waste. A smaller, realistic production plan is better than a beautiful plan that never sells." },
];
const GLOSS_JUICERO = { "subscription": "paying regularly (every week or month) for a product or service", "forecast": "an estimate of future sales based on evidence", "break-even point": "the number of units you must sell to cover all costs", "fixed costs": "costs you pay even if you sell nothing", "variable cost": "a cost that grows with every unit you make", "perishable": "something that goes bad quickly" };
const Q_JUICERO = [
  { q: "Why did investors love Juicero?", options: ["It combined technology, healthy food and a subscription model.", "It was the cheapest juice machine in the market, and the fastest one.", "It sold juice in supermarkets around the world.", "It had a famous actor as its founder and as its main investor."], correct: 0, feedback: "Tech + health + recurring sales." },
  { q: "How much money did the company raise, approximately?", options: ["US$1.2 million.", "US$12 million.", "US$120 million.", "US$1.2 billion."], correct: 2, feedback: "About US$120 million." },
  { q: "What did the Bloomberg video show?", options: ["The machine was dangerous and hurt some customers.", "The packs could be squeezed by hand almost as fast.", "The fruit inside the packs was old and not fresh.", "The Wi-Fi connection of the machine didn't work."], correct: 1, feedback: "Hands worked almost as well as the machine." },
  { q: "What happened to Juicero in September 2017?", options: ["It was bought by a bigger company.", "It cut the price to 99 dollars.", "It started selling in Colombia.", "It closed."], correct: 3, feedback: "The company shut down." },
  { q: "What is the break-even point?", options: ["The units you must sell to cover all costs.", "The highest price customers accept.", "The moment a company breaks its machines.", "The total money invested by the founders."], correct: 0, feedback: "Fixed costs ÷ (price − variable cost)." },
  { q: "Fixed costs $300,000; price $3,000; variable cost $1,500. Break-even?", options: ["100 units.", "200 units.", "150 units.", "300 units."], correct: 1, feedback: "300,000 ÷ 1,500 = 200 units." },
  { q: "Where should a professional forecast start?", options: ["From the founders' dreams and their big ambitions.", "From what investors want to hear in the meeting.", "From facts: customers, reach and tested conversion.", "From last year's biggest company in the sector."], correct: 2, feedback: "Evidence, not optimism." },
  { q: "Why is a perishable product riskier?", options: ["It is more expensive to advertise.", "Customers don't like fresh products.", "It needs a bigger logo.", "Units that are not sold become waste."], correct: 3, feedback: "Unsold gelatin = lost money." },
];

/* =====================================================================
   11° · PERIODO 1 · STARTUP STUDIO — ACTIVIDADES PARA CONSTRUIR
   ===================================================================== */
const P1r = (resp) => (resp?.__p1 && Object.keys(resp.__p1).length ? resp.__p1 : resp) || {};

/* ---------- C1 · Radar 11 (día 1) ---------- */
function Radar11Day1({ existing, onSave, onExit }) {
  const [scores, setScores] = useState(existing?.scores || null);
  const [st, finish] = useFinish(onSave);
  if (!scores) return <RadarQuiz title="Founder Radar 11 · Day 1" qs={RADAR11_Q} dims={RADAR11_DIMS} newFrom={99} intro={<Brief91 k="c1_radar" />} onExit={onExit} onDone={(ans) => setScores({ ...radarScores11(RADAR11_Q, ans), _ans: ans })} />;
  const vals = RADAR11_DIMS.map((d) => scores[d.k] || 0); const avg = Math.round(vals.reduce((a, v) => a + v, 0) / 5); const prof = radarProfile11(avg);
  if (st.done) return <Reward title={`You are a ${prof.l}`} subtitle="We'll compare this radar with your final one in Period 4." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Compass size={22} strokeWidth={2.1} />} title="My Founder Radar · Day 1 🧭" subtitle="5 pillars of your last FinFluent year." onExit={onExit}>
      <div className="g10-two"><div className="start-block"><RadarN labels={RADAR11_DIMS.map((d) => d.l)} values={vals} /></div><div className="start-block"><div className="g10-dna small"><em>🧭</em><div><small>MY PROFILE TODAY</small><b>{prof.l}</b><p>{prof.d}</p></div></div>{RADAR11_DIMS.map((d, i) => <Bar91 key={d.k} label={d.l} value={vals[i]} color={vals[i] >= 67 ? "#3c9d5d" : vals[i] >= 40 ? "#e0a03a" : "#c8563a"} />)}</div></div>
      <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(25, { scores, average: avg, profile: prof.l })}>Save my radar <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
    </ActShell>
  );
}

/* ---------- C1 · Problem Hunter ---------- */
const HUNT = [
  { e: "🕙", s: "Break time in the cafeteria", d: "600 students, 20 minutes, one cafeteria.", o: ["The lines are so long that students lose half of their break.", "Healthy snacks sell out in the first five minutes.", "Students get bored of eating the same snacks every week."] },
  { e: "📚", s: "Exam week", d: "Students stay late and study in groups.", o: ["Students feel tired in the afternoon and have nothing to eat.", "Study groups have no comfortable place to meet.", "Students spend a lot of money on energy drinks."] },
  { e: "⚽", s: "After sports practice", d: "Hot afternoons, two hours of training.", o: ["There are no cold drinks near the field.", "Bottled sports drinks are too expensive for students.", "Players forget their water bottles at home."] },
  { e: "🎂", s: "Birthdays in class", d: "Almost every week someone has a birthday.", o: ["Parents need cheap desserts for 30 students at the last minute.", "Big cakes are hard to share and make a mess in class.", "Students want small personalized gifts for friends."] },
  { e: "🏠", s: "Sunday lunch in the neighborhood", d: "Families eat together; the bakery is far.", o: ["Families want a homemade dessert but have no time to cook.", "Neighborhood stores close early on Sundays.", "Desserts from big bakeries are too expensive for big families."] },
  { e: "🌧️", s: "Rainy afternoons at the exit", d: "Students wait 30 minutes for transport.", o: ["Students are hungry while they wait and there is nothing nearby.", "There is no warm drink or snack for cold days.", "Waiting students don't have anything fun to do."] },
  { e: "💌", s: "Love & Friendship month", d: "Everybody exchanges small gifts.", o: ["Students want original gifts that cost less than $10,000.", "Most gifts are the same chocolates from the supermarket.", "Students want gifts with a personal message."] },
  { e: "🌱", s: "The healthy trend", d: "Many teens want to eat better.", o: ["Low-sugar snacks are hard to find at school.", "Healthy snacks are expensive in supermarkets.", "Students don't know which snacks are really healthy."] },
];
const HUNT_CHECK = [
  { tag: "Problem or solution?", q: "“We will sell vegan brownies.” Is this a problem or a solution?", options: ["A solution — it doesn't say whose problem it solves.", "A problem — students at our school don't eat vegan food.", "A problem — brownies are hard to make at home for many students.", "A solution AND a problem at the same time."], correct: 0, explain: "Start with the pain: who suffers, when and why?" },
  { tag: "Good problem?", q: "Which is the best problem statement?", options: ["“People in our school like desserts and snacks a lot.”", "“Students who train after school have no cold, cheap drink near the field.”", "“We want to start a business that makes a lot of money.”", "“Our cookies are delicious, and everybody at school will want to buy them.”"], correct: 1, explain: "Specific customer + specific moment + real pain." },
  { tag: "Frequent", q: "Which problem is the most FREQUENT?", options: ["A family's special dessert for a wedding party.", "Gifts for the school's anniversary.", "Hunger during the daily afternoon wait.", "Decoration for the prom."], correct: 2, explain: "Daily problems create repeat customers." },
];
const PROB_F = [["who", "👤 Customer", "Students who train after school"], ["pain", "😣 Problem", "have nothing cold and cheap to drink"], ["when", "⏰ When / where", "right after practice, next to the field"], ["now", "🩹 What they do today", "buy expensive sports drinks or nothing"], ["why", "💸 Why it hurts", "they spend $6,000 a day or stay thirsty"]];
function ProblemHunter({ existing, onSave, onExit }) {
  const [pick, setPick] = useState(existing?.pick || {});
  const [rate, setRate] = useState(existing?.rate || {});
  const [stage, setStage] = useState(existing?.statement ? 2 : 0);
  const [chk, setChk] = useState(null);
  const [top, setTop] = useState(existing?.top ?? null);
  const [f, setF] = useState(existing?.fields || {});
  const [st, finish] = useFinish(onSave);
  const score = (i) => { const r = rate[i] || {}; return (r.f || 0) * (r.p || 0) * (r.w || 0); };
  const allRated = HUNT.every((_, i) => pick[i] != null && rate[i]?.f && rate[i]?.p && rate[i]?.w);
  const rank = HUNT.map((h, i) => ({ i, h, sc: score(i) })).sort((a, b) => b.sc - a.sc);
  const fieldsOk = PROB_F.every(([k]) => countWords(f[k]) >= 3);
  const statement = fieldsOk ? `${capF(f.who)} ${lowFirst(f.pain)} ${lowFirst(f.when)}. Today they ${lowFirst(f.now).replace(/^they /i, "")}, so ${lowFirst(f.why)}.` : "";
  if (st.done) return <Reward title="Problem found! 🎯" subtitle="Every great company starts here." coins={st.coins} saving={st.saving} onExit={onExit} />;
  const R = ({ i, k, l }) => <div className="g11-rate"><small>{l}</small>{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={rate[i]?.[k] === n ? "on" : ""} onClick={() => setRate({ ...rate, [i]: { ...(rate[i] || {}), [k]: n } })}>{n}</button>)}</div>;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Problem Hunter 🎯" subtitle="8 real scenes. Find the pain, rate it like an investor, and write your team's problem statement." onExit={onExit}>
      <Brief91 k="c1_hunter" />
      <div className="g10-steps4"><span className={stage === 0 ? "now" : "done"}>1 · Hunt (8 scenes)</span><span className={stage === 1 ? "now" : stage > 1 ? "done" : ""}>2 · Problem or solution?</span><span className={stage === 2 ? "now" : ""}>3 · Problem statement</span></div>
      {stage === 0 && (
        <>
          <p className="start-tip">For each scene choose the most promising problem and rate it: <b>F</b> = how frequent · <b>P</b> = how painful · <b>W</b> = how willing to pay (1–5). Score = F × P × W.</p>
          {HUNT.map((h, i) => (
            <div key={h.s} className="start-block g11-hunt">
              <div className="g10-event-head"><em>{h.e}</em><div><b>{h.s}</b><p>{h.d}</p></div>{pick[i] != null && rate[i]?.w && <span className="g11-score">{score(i)}</span>}</div>
              <div className="g10-qpick">{h.o.map((o, k) => <button key={o} type="button" className={pick[i] === k ? "on" : ""} onClick={() => setPick({ ...pick, [i]: k })}>{o}</button>)}</div>
              {pick[i] != null && <div className="g11-rates"><R i={i} k="f" l="F · frequent" /><R i={i} k="p" l="P · painful" /><R i={i} k="w" l="W · would pay" /></div>}
            </div>
          ))}
          {allRated && <div className="start-block"><h3>🏆 My ranking</h3><HBars money={false} rows={rank.map((x) => ({ l: `${x.h.e} ${x.h.o[pick[x.i]]}`, v: x.sc }))} /></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!allRated} onClick={() => setStage(1)}>{allRated ? "Next: problem or solution?" : "Choose and rate all 8 scenes"} <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 1 && (chk ? <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(2)}>Write our problem statement <ChevronRight size={18} /></button></div> : <RoundsRunner rounds={HUNT_CHECK} doneLabel="Continue" onDone={setChk} />)}
      {stage === 2 && (
        <>
          <div className="start-block"><h3>🎯 Choose your team's problem</h3><div className="g10-qpick">{rank.slice(0, 4).map((x) => <button key={x.i} type="button" className={top === x.i ? "on" : ""} onClick={() => setTop(x.i)}>{x.h.e} {x.h.o[pick[x.i]] || x.h.s} <b className="g11-mini-score">score {x.sc}</b></button>)}</div></div>
          <div className="start-block"><h3>✍️ Our problem statement</h3>{PROB_F.map(([k, l, ph]) => <div key={k} className="p3-sentence edit"><span>{l}</span><input className="start-input" value={f[k] || ""} placeholder={ph} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>)}
            {statement && <div className="g11-statement">📌 {statement}</div>}
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={top == null || !fieldsOk} onClick={() => finish(20 + (chk?.firstTry || 0) * 2, { pick, rate, top, fields: f, statement, problem: HUNT[top]?.o[pick[top]] })}>Save our problem <span className="coin-tag"><Coins size={15} /> +{20 + (chk?.firstTry || 0) * 2}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C2 · Interview Simulator ---------- */
const CUSTOMERS = [
  { e: "🧑🏽‍🎓", n: "Valentina, 16", d: "Student · trains volleyball 3 afternoons a week", ins: ["She spends about $5,000 on drinks after practice.", "She hates very sweet drinks: she wants something fresh and light.", "She buys from the store at the corner because it's the only option."],
    qs: [
      { t: "Tell me about the last time you bought something after practice.", g: true, a: "Yesterday! I bought a sports drink at the corner store. It cost $5,000 — too much, honestly.", i: 0 },
      { t: "What do you usually drink when you finish training?", g: true, a: "Water if I remember my bottle… but sweet drinks make me feel worse, I want something fresh and light.", i: 1 },
      { t: "Where do you buy it, and why there?", g: true, a: "At the corner store. It's not great, it's just the only place open near the field.", i: 2 },
      { t: "What was the hardest part of your last practice day?", g: true, a: "The heat. And waiting for my mom with nothing to eat.", i: -1 },
      { t: "Would you buy my amazing natural gelatin?", g: false, a: "Sure, yes, totally! (She is being polite — this tells you nothing.)" },
      { t: "Don't you think healthy snacks are great?", g: false, a: "Yeah, of course… (A leading question: she agrees because you pushed her.)" },
      { t: "How much would you pay for a perfect drink?", g: false, a: "Hmm… maybe $10,000? (People can't predict this well — ask what they paid last time.)" },
      { t: "Do you like my idea?", g: false, a: "It's cute! (Compliments are not evidence.)" },
    ] },
  { e: "👩🏻‍💼", n: "Paola, 41", d: "Mom of two · works until 6 p.m.", ins: ["She needs desserts for birthdays at the last minute.", "She paid $90,000 for a cake that half of the class didn't eat.", "She wants individual portions that are easy to share."],
    qs: [
      { t: "Tell me about the last birthday you organized for your kids' class.", g: true, a: "Last month. I remembered the night before and ran to the bakery at 9 p.m.!", i: 0 },
      { t: "How much did you spend, and what happened with the cake?", g: true, a: "$90,000. Half of the kids didn't eat it, and it made a mess in the classroom.", i: 1 },
      { t: "What would make a class celebration easier for you?", g: true, a: "Small individual portions. No knives, no plates, nothing to cut.", i: 2 },
      { t: "Who decides what you buy for the class?", g: true, a: "Me, but the teacher sends rules: no peanuts, not too much sugar.", i: -1 },
      { t: "Would you buy cupcakes from my team?", g: false, a: "Oh, maybe! (Hypothetical yes = no evidence.)" },
      { t: "Isn't it terrible to cook after work?", g: false, a: "Yes, I guess… (You put words in her mouth.)" },
      { t: "Do you think my price will be good?", g: false, a: "I'm sure it will be fine. (She doesn't know your price — polite answer.)" },
      { t: "Do you love desserts?", g: false, a: "Who doesn't? (Too general.)" },
    ] },
  { e: "👨🏾‍🍳", n: "Don Hernán, 58", d: "Owner of a small store next to the school", ins: ["Snacks with nice packaging sell twice as fast in his store.", "He only buys products that last at least 3 days without a fridge.", "He keeps 30% of the price as his margin."],
    qs: [
      { t: "Which products sold the fastest in your store last week?", g: true, a: "Things with nice packaging. The ugly bags stay there — the nice ones sell twice as fast.", i: 0 },
      { t: "Tell me about a product you stopped selling. What happened?", g: true, a: "Some homemade cakes. They went bad in two days. Now I only buy things that last 3 days without a fridge.", i: 1 },
      { t: "How do you agree on a price with a new supplier?", g: true, a: "Simple: I keep 30% of the price. If they want me to sell at $3,000, they get $2,100.", i: 2 },
      { t: "When do students buy the most?", g: true, a: "At 3 p.m., when school finishes.", i: -1 },
      { t: "Would you sell my product in your store?", g: false, a: "We'll see, bring it someday! (Not a commitment.)" },
      { t: "Our product is better than the others, right?", g: false, a: "If you say so… (Leading.)" },
      { t: "Do you think students will love it?", g: false, a: "Probably! (He's guessing.)" },
      { t: "Is your store doing well?", g: false, a: "Thank God, yes. (Nothing useful for you.)" },
    ] },
];
function InterviewSim({ existing, onSave, onExit }) {
  const [ci, setCi] = useState(0);
  const [asked, setAsked] = useState({});
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const c = CUSTOMERS[Math.min(ci, CUSTOMERS.length - 1)]; const A = asked[ci] || [];
  const left = 4 - A.length;
  const found = (k) => new Set((asked[k] || []).map((qi) => CUSTOMERS[k].qs[qi]).filter((q) => q.g && q.i >= 0).map((q) => q.i)).size;
  const totalFound = CUSTOMERS.reduce((a, _, k) => a + found(k), 0);
  const badAsked = CUSTOMERS.reduce((a, cc, k) => a + (asked[k] || []).filter((qi) => !cc.qs[qi].g).length, 0);
  const G = [W_REASON, W_TOPIC("Use 3 words of the topic", ["customer", "pain", "pay", "price", "need", "problem", "buy", "insight"], 3, "customer · pain · pay · need"), W_NUMBERS(1)];
  const [order] = useState(() => CUSTOMERS.map((x) => shuffleArr(x.qs.map((_, k) => k))));
  if (st.done) return <Reward title="Interview pro! 🎙️" subtitle={`${totalFound}/9 insights · ${badAsked} bad questions`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Mic size={22} strokeWidth={2.1} />} title="Interview Simulator 🎙️" subtitle="3 customers, only 4 questions each. Good questions find insights; bad ones give polite lies." onExit={onExit}>
      <Brief91 k="c2_interview" />
      {ci < CUSTOMERS.length ? (
        <>
          <div className="g10-steps4">{CUSTOMERS.map((x, k) => <span key={x.n} className={k < ci ? "done" : k === ci ? "now" : ""}>{x.e} {x.n.split(",")[0]}</span>)}<span>✍️ Summary</span></div>
          <div className="g11-customer"><em>{c.e}</em><div><b>{c.n}</b><span>{c.d}</span></div><div className="g11-insights">{c.ins.map((x, k) => <i key={k} className={A.some((qi) => c.qs[qi].i === k) ? "on" : ""}>{A.some((qi) => c.qs[qi].i === k) ? `💡 ${x}` : "🔒 hidden insight"}</i>)}</div></div>
          <p className="quiz-q">Questions left: {left}</p>
          <div className="g10-qpick">{order[ci].map((qi) => { const q = c.qs[qi]; const on = A.includes(qi); return <button key={qi} type="button" disabled={on || left <= 0} className={on ? (q.g ? "on" : "bad") : ""} onClick={() => setAsked({ ...asked, [ci]: [...A, qi] })}>{q.t}</button>; })}</div>
          <div className="g11-chat">{A.map((qi) => { const q = c.qs[qi]; return <div key={qi}><p className="me">🙋 {q.t}</p><p className={`them ${q.g ? "" : "warn"}`}>{c.e} {q.a}</p></div>; })}</div>
          {left <= 0 && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setCi(ci + 1)}>{ci < CUSTOMERS.length - 1 ? "Next customer" : "Write my summary"} <ChevronRight size={18} /></button></div>}
        </>
      ) : (
        <>
          <div className="g10-kpis"><div><small>💡 Insights found</small><b>{totalFound}/9</b></div><div><small>🙊 Bad questions</small><b className={badAsked ? "neg" : "pos"}>{badAsked}</b></div></div>
          <div className="start-block"><h3>📒 What I learned (insights)</h3><ul className="p1-list">{CUSTOMERS.flatMap((cc, k) => cc.ins.filter((_, j) => (asked[k] || []).some((qi) => cc.qs[qi].i === j)).map((x) => <li key={x}>{cc.e} {x}</li>))}</ul></div>
          <div className="start-block"><h3>✍️ Interview summary</h3><Starters items={["The biggest pain I found was…", "Customers pay about $… for…", "A bad question I asked was… because…"]} onPick={appendStarter(setText)} /><WordField value={text} onChange={setText} min={35} max={90} goals={G} placeholder="The biggest pain I found was… because… Customers pay about $5,000 for…" /></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(text, 35, 90, G)} onClick={() => finish(14 + totalFound * 2, { found: totalFound, bad: badAsked, text })}>Save my summary <span className="coin-tag"><Coins size={15} /> +{14 + totalFound * 2}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- C2 · Persona Builder ---------- */
const PERSONA_SEG = [["students", "🎒 Students"], ["parents", "👨‍👩‍👧 Parents"], ["teachers", "🧑‍🏫 Teachers / staff"], ["healthy", "🥗 Healthy teens"], ["stores", "🏪 Stores"]];
const PERSONA_F = [["name", "👤 Name and age", "Valentina, 16"], ["day", "🗓️ A typical day", "School until 3, volleyball until 5, then the bus home"], ["pain", "😣 Main pain", "She is thirsty and hungry after practice"], ["now", "🩹 What she does today", "Buys a $5,000 sports drink at the corner"], ["where", "📍 Where and when she buys", "At 5 p.m., next to the field"], ["yes", "✅ What makes her say YES", "Fresh, light, cheap and fast"]];
function PersonaBuilder({ resp, existing, onSave, onExit }) {
  const rows = zoneRows(resp, "c2_zone", "int");
  const real = rows.filter((r) => num(r.wtp) > 0);
  const avgW = real.length ? Math.round(real.reduce((a, r) => a + num(r.wtp), 0) / real.length) : 0;
  const avgP = rows.filter((r) => num(r.pain) > 0).length ? r2(rows.reduce((a, r) => a + num(r.pain), 0) / rows.filter((r) => num(r.pain) > 0).length) : 0;
  const [seg, setSeg] = useState(existing?.seg || "");
  const [f, setF] = useState(existing?.fields || {});
  const [budget, setBudget] = useState(existing?.budget || (avgW ? String(avgW) : ""));
  const [avatar, setAvatar] = useState(existing?.avatar || "🧑🏽‍🎓");
  const [st, finish] = useFinish(onSave);
  const ok = seg && PERSONA_F.every(([k]) => countWords(f[k]) >= 2) && num(budget) > 0;
  if (st.done) return <Reward title="Meet your customer! 👤" subtitle={f.name} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<User size={22} strokeWidth={2.1} />} title="Persona Builder 👤" subtitle="Turn your interviews into ONE customer you design for." onExit={onExit}>
      <Brief91 k="c2_persona" />
      {rows.length ? <div className="g10-kpis"><div><small>🎙️ Real interviews</small><b>{rows.length}</b></div><div><small>😣 Average pain</small><b>{avgP || "—"}/5</b></div><div><small>💰 Average 'would pay'</small><b>{avgW ? cop(avgW) : "—"}</b></div></div> : <div className="p1-banner"><span>💡 Do the Team Zone interviews first: your persona should come from REAL data.</span></div>}
      <div className="g10-two">
        <div className="start-block"><h3>🎯 Segment</h3><div className="g10-chips">{PERSONA_SEG.map(([k, l]) => <button key={k} type="button" className={seg === k ? "on" : ""} onClick={() => setSeg(k)}>{l}</button>)}</div>
          <h3>🙂 Avatar</h3><div className="g10-chips">{["🧑🏽‍🎓", "👩🏻‍🎓", "🧑🏾‍🎓", "👩🏽‍💼", "👨🏻‍💼", "🧑🏼‍🏫", "👨🏾‍🍳", "🏃🏽‍♀️"].map((a) => <button key={a} type="button" className={avatar === a ? "on" : ""} onClick={() => setAvatar(a)}>{a}</button>)}</div>
          {PERSONA_F.map(([k, l, ph]) => <div key={k} className="p3-sentence edit"><span>{l}</span><input className="start-input" value={f[k] || ""} placeholder={ph} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>)}
          <div className="p3-sentence edit"><span>💰 Spends per purchase (from interviews)</span><MoneyInput value={budget} onChange={setBudget} /></div>
        </div>
        <div className="g11-persona" id="g11-persona"><em>{avatar}</em><b>{f.name || "Name, age"}</b><small>{PERSONA_SEG.find((x) => x[0] === seg)?.[1] || "Segment"}</small>{PERSONA_F.slice(1).map(([k, l]) => <p key={k}><i>{l}</i>{f[k] || "…"}</p>)}<p><i>💰 Budget</i>{num(budget) ? cop(budget) : "…"}</p></div>
      </div>
      <div className="start-foot"><button className="s1-btn ghost" onClick={() => downloadPNG("g11-persona", "My_Persona.png")}><Download size={16} /> PNG</button><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(26, { seg, fields: f, budget: num(budget), avatar, name: f.name, avgW, avgP })}>Save my persona <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
    </ActShell>
  );
}

/* ---------- C3 · Product Builder (MVP con presupuesto) ---------- */
const BASES = [
  { k: "gel", e: "🍮", l: "Gelatin cup", cost: 700, per: true }, { k: "cookie", e: "🍪", l: "Cookie pack (3)", cost: 900 }, { k: "brownie", e: "🟫", l: "Brownie", cost: 1100, per: true },
  { k: "choco", e: "🍫", l: "Chocolate bites", cost: 1300 }, { k: "drink", e: "🥤", l: "Natural drink", cost: 1000, per: true }, { k: "pop", e: "🍿", l: "Popcorn bag", cost: 600 },
  { k: "soap", e: "🧼", l: "Soap bar", cost: 1800 }, { k: "candle", e: "🕯️", l: "Small candle", cost: 2500 }, { k: "key", e: "🔑", l: "Keychain", cost: 1500 },
];
const ADDONS = [
  { k: "premium", e: "⭐", l: "Premium ingredient / material", c: 500, v: { students: 1, parents: 2, teachers: 2, healthy: 1, stores: 1 } },
  { k: "healthy", e: "🥗", l: "Low sugar / natural version", c: 300, v: { students: 1, parents: 3, teachers: 2, healthy: 3, stores: 1 } },
  { k: "bigger", e: "📏", l: "Bigger size", c: 400, v: { students: 2, parents: 1, teachers: 1, healthy: 0, stores: 1 } },
  { k: "pack", e: "📦", l: "Nice packaging", c: 350, v: { students: 2, parents: 2, teachers: 1, healthy: 1, stores: 3 } },
  { k: "eco", e: "♻️", l: "Eco packaging", c: 250, v: { students: 1, parents: 2, teachers: 2, healthy: 2, stores: 1 } },
  { k: "custom", e: "✍️", l: "Personal message / name", c: 300, v: { students: 2, parents: 3, teachers: 1, healthy: 0, stores: 0 } },
  { k: "combo", e: "➕", l: "Combo with a drink or topping", c: 600, v: { students: 3, parents: 1, teachers: 1, healthy: 1, stores: 1 } },
  { k: "shelf", e: "⏳", l: "Lasts 3 days without fridge", c: 200, v: { students: 0, parents: 1, teachers: 0, healthy: 0, stores: 3 } },
  { k: "fun", e: "🎉", l: "Fun shape / colors", c: 150, v: { students: 2, parents: 1, teachers: 0, healthy: 0, stores: 1 } },
];
function ProductBuilder({ resp, existing, onSave, onExit }) {
  const r1 = P1r(resp); const seg = r1.c2_persona?.seg || "students"; const budget = num(r1.c2_persona?.budget) || 3000;
  const [base, setBase] = useState(existing?.base || "");
  const [adds, setAdds] = useState(existing?.adds || []);
  const [name, setName] = useState(existing?.product || "");
  const [why, setWhy] = useState(existing?.why || "");
  const [st, finish] = useFinish(onSave);
  const B = BASES.find((b) => b.k === base);
  const cost = (B?.cost || 0) + adds.reduce((a, k) => a + ADDONS.find((x) => x.k === k).c, 0);
  const value = adds.reduce((a, k) => a + (ADDONS.find((x) => x.k === k).v[seg] || 0), 3);
  const maxCost = Math.round(budget * 0.5);
  const okCost = cost <= maxCost;
  const G = [W_REASON, W_TOPIC("Use 2 words of the topic", ["customer", "value", "cost", "feature", "need", "persona", "mvp"], 2, "customer · value · cost · need")];
  const ok = B && adds.length >= 1 && adds.length <= 3 && okCost && countWords(name) >= 2 && goalsOk(why, 20, 60, G);
  if (st.done) return <Reward title="MVP designed! 🧪" subtitle={`${name} · cost ~${cop(cost)} · value ${value}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<FlaskConical size={22} strokeWidth={2.1} />} title="Product Builder 🧪 · Your MVP" subtitle="A base + max 3 features. Each feature costs money and gives value — but value depends on YOUR persona." onExit={onExit}>
      <Brief91 k="c3_builder" />
      <div className="g10-kpis"><div><small>🎯 Persona</small><b>{PERSONA_SEG.find((x) => x[0] === seg)?.[1]}</b></div><div><small>💰 Spends</small><b>{cop(budget)}</b></div><div><small>🧱 Max unit cost (50%)</small><b>{cop(maxCost)}</b></div></div>
      <div className="start-block"><h3>1 · Base product</h3><div className="g10-ab four">{BASES.map((b) => <button key={b.k} type="button" className={base === b.k ? "on" : ""} onClick={() => setBase(b.k)}><em>{b.e}</em><b>{b.l}</b><span>~{cop(b.cost)} per unit</span></button>)}</div></div>
      {B && <div className="start-block"><h3>2 · Features (max 3) — MVP = Minimum Viable Product</h3><div className="g10-qpick">{ADDONS.map((a) => { const on = adds.includes(a.k); return <button key={a.k} type="button" className={on ? "on" : ""} onClick={() => setAdds(on ? adds.filter((x) => x !== a.k) : adds.length < 3 ? [...adds, a.k] : adds)}>{a.e} {a.l} <b className="g11-mini-score">+{cop(a.c)} · value +{a.v[seg]}</b></button>; })}</div></div>}
      {B && <div className="g10-two"><div className="start-block"><Gauge91 label="Unit cost vs. your limit" value={cost} max={Math.max(maxCost * 1.4, cost)} unit="" fmt={cop} target={maxCost} targetLabel="limit" good={okCost} /><Gauge91 label="Value for your persona" value={value} max={12} unit="" /></div><div className="start-block"><h3>📊 Value per $1,000</h3><b className="g11-big">{(value / (cost / 1000)).toFixed(2)}</b><p className="start-tip">{okCost ? "✅ Inside the budget." : "❌ Too expensive for your persona: remove a feature."}</p></div></div>}
      {B && <div className="start-block"><h3>3 · Name your product & explain the choice</h3><input className="start-input g11-gap" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fresh-Up mango gelatin" /><WordField value={why} onChange={setWhy} min={20} max={60} goals={G} placeholder="We chose low sugar because our customer… The cost is… so…" /></div>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30, { base, adds, product: name.trim(), costEst: cost, value, why })}>Save our MVP <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- C3 · Label / packaging canvas ---------- */
const CLAIMS = ["🌿 Natural", "🍬 Low sugar", "🏠 Homemade", "♻️ Eco packaging", "💪 Energy boost", "🎉 Fun size", "🇨🇴 Local ingredients", "❄️ Fresh today", "🎁 Perfect gift", "🥜 Peanut free"];
function LabelCanvas({ resp, existing, onSave, onExit }) {
  const r1 = P1r(resp); const B = BASES.find((b) => b.k === r1.c3_builder?.base);
  const [p, setP] = useState(existing?.label || { name: r1.c3_builder?.product || "", flavor: "", claims: [], content: "", bg: "#f7f1e3", fg: "#7a4a2b", emoji: B?.e || "🍮" });
  const [st, finish] = useFinish(onSave);
  const up = (k, v) => setP({ ...p, [k]: v });
  const nameOk = p.name.trim().length >= 3 && p.name.trim().length <= 22;
  const ok = nameOk && countWords(p.flavor) >= 1 && p.claims.length >= 1 && p.claims.length <= 3 && countWords(p.content) >= 1 && p.bg !== p.fg;
  if (st.done) return <Reward title="Label ready! 🏷️" subtitle="Print it and stick it on your prototype." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Tag size={22} strokeWidth={2.1} />} title="Label Studio 🏷️" subtitle="Design the label of your prototype: name, flavor, 3 claims max, content. Then print it." onExit={onExit}>
      <Brief91 k="c3_canvas" />
      <div className="g10-two">
        <div className="start-block">
          <input className="start-input g11-gap" value={p.name} maxLength={24} onChange={(e) => up("name", e.target.value)} placeholder="Product name (max 22 letters)" />
          <input className="start-input g11-gap" value={p.flavor} onChange={(e) => up("flavor", e.target.value)} placeholder="Flavor / variant (e.g. mango & lime)" />
          <input className="start-input g11-gap" value={p.content} onChange={(e) => up("content", e.target.value)} placeholder="Content (e.g. 120 g · 1 portion)" />
          <span className="terms-label">Claims (max 3 — more is noise):</span><div className="g10-chips">{CLAIMS.map((c) => <button key={c} type="button" className={p.claims.includes(c) ? "on" : ""} onClick={() => up("claims", p.claims.includes(c) ? p.claims.filter((x) => x !== c) : p.claims.length < 3 ? [...p.claims, c] : p.claims)}>{c}</button>)}</div>
          <span className="terms-label">Background / text color:</span>
          <div className="g11-swatches">{LOGO_COLORS.map((c) => <button key={`b${c.c}`} type="button" title={c.n} className={p.bg === c.c ? "on" : ""} style={{ background: c.c }} onClick={() => up("bg", c.c)} />)}</div>
          <div className="g11-swatches">{LOGO_COLORS.map((c) => <button key={`f${c.c}`} type="button" title={c.n} className={p.fg === c.c ? "on" : ""} style={{ background: c.c }} onClick={() => up("fg", c.c)} />)}</div>
          <span className="terms-label">Icon:</span><div className="g10-chips">{["🍮", "🍪", "🧁", "🍫", "🥤", "🍿", "🍓", "🥭", "🍋", "🧼", "🕯️", "✨"].map((e) => <button key={e} type="button" className={p.emoji === e ? "on" : ""} onClick={() => up("emoji", e)}>{e}</button>)}</div>
        </div>
        <div><div className="g11-label" id="g11-label" style={{ "--lb-bg": p.bg, "--lb-fg": p.fg }}><em>{p.emoji}</em><b>{p.name || "Product name"}</b><span>{p.flavor || "flavor"}</span><div>{p.claims.map((c) => <i key={c}>{c}</i>)}</div><small>{p.content || "content"}</small></div>
          <div className="g91-mini"><span className={nameOk ? "pos" : "neg"}>Readable name <b>{nameOk ? "✓" : "✗"}</b></span><span className={p.claims.length <= 3 && p.claims.length ? "pos" : "neg"}>1–3 claims <b>{p.claims.length}</b></span><span className={p.bg !== p.fg ? "pos" : "neg"}>Contrast <b>{p.bg !== p.fg ? "✓" : "✗"}</b></span></div></div>
      </div>
      <div className="start-foot"><button className="s1-btn ghost" onClick={() => downloadPNG("g11-label", "My_Label.png")}><Download size={16} /> PNG to print</button><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(24, { label: p })}>Save my label <span className="coin-tag"><Coins size={15} /> +24</span></button></div>
    </ActShell>
  );
}

/* ---------- C3 · Feature → Benefit ---------- */
const FB_R = [
  { tag: "Feature → benefit", q: "Feature: “Made with 30% less sugar.” Best benefit?", options: ["“30% less sugar than normal gelatin.”", "“Enjoy dessert without the sugar crash.”", "“Our recipe has fewer grams of sugar.”", "“Made in our school kitchen.”"], correct: 1, explain: "A benefit tells how the customer's life gets better." },
  { tag: "Feature → benefit", q: "Feature: “Individual portions.” Best benefit for a busy mom?", options: ["“Each portion weighs exactly 90 grams and has 3 layers.”", "“We sell the portions in practical boxes of 30 units.”", "“No knives, no plates, no mess at the party.”", "“Every portion is made by hand in our own kitchen.”"], correct: 2, explain: "Connect the feature to HER pain." },
  { tag: "Feature → benefit", q: "Feature: “Lasts 3 days without a fridge.” Best benefit for a store owner?", options: ["“Sell it all week without losing products.”", "“It has natural preservatives inside.”", "“It doesn't need a fridge for 72 hours.”", "“Our packaging is resistant.”"], correct: 0, explain: "Less waste = more money for HIM." },
  { tag: "Which is a benefit?", q: "Which sentence is a BENEFIT (not a feature)?", options: ["“Mango, lime and chia seeds.”", "“120 grams in a recyclable cup.”", "“Handmade by four students.”", "“Feel fresh again after practice.”"], correct: 3, explain: "Benefits talk about the customer's feeling or result." },
];
function BenefitLab({ resp, existing, onSave, onExit }) {
  const r1 = P1r(resp); const adds = (r1.c3_builder?.adds || []).map((k) => ADDONS.find((a) => a.k === k)).filter(Boolean);
  const feats = adds.length ? adds.map((a) => a.l) : ["Feature 1", "Feature 2", "Feature 3"];
  const [r, setR] = useState(null);
  const [b, setB] = useState(existing?.benefits || feats.map(() => ""));
  const [st, finish] = useFinish(onSave);
  const benOk = (t) => countWords(t) >= 5 && /\b(you|your)\b/i.test(t || "");
  const ok = r && b.every(benOk);
  if (st.done) return <Reward title="Benefits unlocked! 💬" subtitle="Now your customer understands WHY." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Sparkles size={22} strokeWidth={2.1} />} title="Feature → Benefit Lab 💬" subtitle="Customers don't buy features — they buy better days." onExit={onExit}>
      <Brief91 k="c3_benefit" />
      {!r ? <RoundsRunner rounds={FB_R} doneLabel="Now my product" onDone={setR} /> : (
        <div className="start-block"><h3>✍️ Turn YOUR features into benefits (use “you/your”)</h3>{feats.map((f, i) => <div key={f} className="p3-sentence edit"><span>⚙️ {f} →</span><input className="start-input" value={b[i]} placeholder="You can… / Your… / Enjoy…" onChange={(e) => setB(b.map((x, j) => (j === i ? e.target.value : x)))} />{b[i] && !benOk(b[i]) && <i className="g11-need">5+ words with “you/your”.</i>}</div>)}</div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(14 + r.firstTry * 2, { benefits: b, features: feats, firstTry: r.firstTry })}>Save our benefits <span className="coin-tag"><Coins size={15} /> +{14 + (r?.firstTry || 0) * 2}</span></button></div>
    </ActShell>
  );
}

/* ---------- C4 · Name & Tagline Lab ---------- */
const NAME_CHECK = [["short", "1–2 words"], ["say", "Easy to say in English AND Spanish"], ["mem", "Memorable / sounds good"], ["promise", "Suggests the benefit or feeling"], ["unique", "Not a copy of a famous brand"]];
function NameLab({ resp, existing, onSave, onExit }) {
  const r1 = P1r(resp);
  const [names, setNames] = useState(existing?.names || ["", "", "", ""]);
  const [chk, setChk] = useState(existing?.chk || {});
  const [win, setWin] = useState(existing?.winIdx ?? null);
  const [tag, setTag] = useState(existing?.tagline || "");
  const [promise, setPromise] = useState(existing?.promise || "");
  const [st, finish] = useFinish(onSave);
  const sc = (i) => NAME_CHECK.filter(([k]) => chk[i]?.[k]).length;
  const filled = names.filter((n) => n.trim().length >= 2).length;
  const tagW = countWords(tag);
  const tagOk = tagW >= 2 && tagW <= 6;
  const G = [W_TOPIC("Use 2 brand words", ["customer", "promise", "feel", "quality", "you", "every", "fresh", "because"], 2, "you · promise · feel · because")];
  const ok = filled >= 4 && win != null && names[win]?.trim() && tagOk && goalsOk(promise, 12, 40, G);
  if (st.done) return <Reward title={`Hello, ${names[win]}! ✨`} subtitle={`“${tag}”`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<PenLine size={22} strokeWidth={2.1} />} title="Name & Tagline Lab ✨" subtitle="4 candidates · 5 tests · 1 winner · a tagline of 2–6 words · one brand promise." onExit={onExit}>
      <Brief91 k="c4_name" />
      {r1.c3_builder?.product && <div className="g91-mini"><span>🧪 Product <b>{r1.c3_builder.product}</b></span>{r1.c2_persona?.name && <span>👤 For <b>{r1.c2_persona.name}</b></span>}</div>}
      <div className="start-block"><h3>1 · Four name candidates (descriptive, invented, compound, a feeling…)</h3><div className="g11-names">{names.map((n, i) => (
        <div key={i} className={win === i ? "on" : ""}>
          <input className="start-input" value={n} maxLength={22} onChange={(e) => setNames(names.map((x, j) => (j === i ? e.target.value : x)))} placeholder={["e.g. FreshUp", "e.g. Gelatín", "e.g. Mango Rush", "e.g. Dulce Calma"][i]} />
          <div className="g10-chips">{NAME_CHECK.map(([k, l]) => <button key={k} type="button" className={chk[i]?.[k] ? "on" : ""} onClick={() => setChk({ ...chk, [i]: { ...(chk[i] || {}), [k]: !chk[i]?.[k] } })}>{l}</button>)}</div>
          <div className="g11-namefoot"><b>{sc(i)}/5</b><button type="button" className="s1-btn ghost" disabled={n.trim().length < 2} onClick={() => setWin(i)}>{win === i ? "🏆 Winner" : "Choose"}</button></div>
        </div>
      ))}</div><p className="start-tip">💡 Test the names with 3 people OUTSIDE your team: which one do they remember after 1 minute?</p></div>
      <div className="start-block"><h3>2 · Tagline (2–6 words, a benefit)</h3><input className="start-input" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. Fresh after every game." /><div className="g91-mini"><span className={tagOk ? "pos" : "neg"}>2–6 words <b>{tagW}</b></span></div></div>
      <div className="start-block"><h3>3 · Our brand promise (one sentence)</h3><WordField value={promise} onChange={setPromise} min={12} max={40} goals={G} placeholder="We promise every student a fresh, light snack that makes you feel…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(26, { names, chk, winIdx: win, brand: names[win].trim(), tagline: tag.trim(), promise })}>Save our brand name <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
    </ActShell>
  );
}

/* ---------- C4 · Logo Builder (usa la psicología del color del video) ---------- */
const lum = (hex) => { const h = hex.replace("#", ""); const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
function LogoBuilder({ resp, existing, onSave, onExit, ctx }) {
  const r1 = P1r(resp); const brand = r1.c4_name?.brand || r1.c1_team?.name || "My brand";
  const team = useTeamData(ctx);
  const [L, setL] = useState(existing?.logo || { shape: "circle", symbol: "🍮", bg: "#3c9d5d", fg: "#f7f1e3", font: "round" });
  const [why, setWhy] = useState(existing?.why || "");
  const [st, finish] = useFinish(onSave);
  const up = (k, v) => setL({ ...L, [k]: v });
  const contrast = Math.abs(lum(L.bg) - lum(L.fg));
  const G = [W_REASON, { l: "Name your 2 colors", ex: `${colorName(L.bg)} · ${colorName(L.fg)}`, test: (t) => { const s = (t || "").toLowerCase(); return [colorName(L.bg), colorName(L.fg)].every((n) => s.includes(n.toLowerCase())); } }, W_TOPIC("Use 1 feeling word from the video", ["energy", "appetite", "trust", "health", "nature", "fresh", "fun", "luxury", "calm", "warm", "sweet", "premium", "optimism", "attention"], 1, "energy · health · fun · trust")];
  const ok = contrast >= 0.3 && goalsOk(why, 25, 70, G);
  if (st.done) return <Reward title="Logo ready! 🎨" subtitle={brand} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Palette size={22} strokeWidth={2.1} />} title="Logo Builder 🎨" subtitle="Shape + symbol + 2 colors + typography. Every choice must speak to your customer." onExit={onExit}>
      <Brief91 k="c4_logo" />
      <TeamSync team={team} field="logo" label="logo" show={(v) => `${v.symbol} ${colorName(v.bg)}`} onUse={(v) => setL(v)} />
      <div className="g10-two">
        <div className="start-block">
          <span className="terms-label">Shape:</span><div className="g10-chips">{LOGO_SHAPES.map(([k, l]) => <button key={k} type="button" className={L.shape === k ? "on" : ""} onClick={() => up("shape", k)}>{l}</button>)}</div>
          <span className="terms-label">Symbol:</span><div className="g10-chips">{["🍮", "🍪", "🧁", "🍫", "🥤", "🍿", "🍓", "🥭", "🍋", "🌿", "⚡", "☀️", "💧", "❤️", "⭐", "🔥", "🧼", "🕯️"].map((e) => <button key={e} type="button" className={L.symbol === e ? "on" : ""} onClick={() => up("symbol", e)}>{e}</button>)}</div>
          <span className="terms-label">Main color (background):</span><div className="g11-swatches big">{LOGO_COLORS.map((c) => <button key={c.c} type="button" className={L.bg === c.c ? "on" : ""} style={{ background: c.c }} onClick={() => up("bg", c.c)}><i>{c.n}</i></button>)}</div>
          <span className="terms-label">Second color (letters):</span><div className="g11-swatches big">{LOGO_COLORS.map((c) => <button key={c.c} type="button" className={L.fg === c.c ? "on" : ""} style={{ background: c.c }} onClick={() => up("fg", c.c)}><i>{c.n}</i></button>)}</div>
          <span className="terms-label">Typography:</span><div className="g10-chips">{LOGO_FONTS.map(([k, l]) => <button key={k} type="button" className={L.font === k ? "on" : ""} onClick={() => up("font", k)}>{l}</button>)}</div>
        </div>
        <div className="start-block g11-logo-stage"><div id="g11-logo-png" className="g11-logo-png"><LogoMark logo={L} brand={brand} size={170} /></div>
          <div className="g91-mini"><span className={contrast >= 0.3 ? "pos" : "neg"}>Contrast <b>{contrast >= 0.3 ? "✓ readable" : "✗ too similar"}</b></span></div>
          <p className="start-tip">🎨 {LOGO_COLORS.find((c) => c.c === L.bg)?.n}: {LOGO_COLORS.find((c) => c.c === L.bg)?.m}<br />🎨 {LOGO_COLORS.find((c) => c.c === L.fg)?.n}: {LOGO_COLORS.find((c) => c.c === L.fg)?.m}</p></div>
      </div>
      <div className="start-block"><h3>✍️ Why these colors for OUR customer?</h3><WordField value={why} onChange={setWhy} min={25} max={70} goals={G} placeholder="We chose green because it shows health and our customer… The cream letters…" /></div>
      <div className="start-foot"><button className="s1-btn ghost" onClick={() => downloadPNG("g11-logo-png", "My_Logo.png")}><Download size={16} /> PNG</button><button className="s1-btn primary big" disabled={!ok} onClick={() => { teamShare(ctx, { logo: L, logo_by: ctx.name }); finish(30, { ...L, why, logo: L }); }}>Save our logo <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- C5 · Cost Builder ---------- */
function CostBuilder({ resp, existing, onSave, onExit, ctx }) {
  const r1 = P1r(resp);
  const [rows, setRows] = useState(existing?.rows || [{ n: "", pack: "", packQ: "", use: "", src: "" }, { n: "", pack: "", packQ: "", use: "", src: "" }, { n: "", pack: "", packQ: "", use: "", src: "" }, { n: "", pack: "", packQ: "", use: "", src: "" }]);
  const [units, setUnits] = useState(existing?.units || "");
  const [packU, setPackU] = useState(existing?.packU || "");
  const [hours, setHours] = useState(existing?.hours || "");
  const [rate, setRate] = useState(existing?.rate || "8000");
  const [other, setOther] = useState(existing?.other || "");
  const [st, finish] = useFinish(onSave);
  const lineCost = (r) => (num(r.packQ) > 0 ? (num(r.pack) / num(r.packQ)) * num(r.use) : 0);
  const mat = rows.reduce((a, r) => a + lineCost(r), 0);
  const labor = num(hours) * num(rate);
  const batch = mat + labor + num(other);
  const unit = num(units) > 0 ? batch / num(units) + num(packU) : 0;
  const good = rows.filter((r) => countWords(r.n) >= 1 && lineCost(r) > 0 && countWords(r.src) >= 1);
  const ok = good.length >= 4 && num(units) > 0 && num(packU) > 0 && num(hours) > 0;
  const upR = (i, k, v) => setRows(rows.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  if (st.done) return <Reward title="Unit cost calculated! 🧮" subtitle={`${cop(unit)} per unit`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Calculator size={22} strokeWidth={2.1} />} title="Cost Builder 🧮 · Real prices" subtitle="Research REAL prices on your tablet (supermarket websites). Build one batch, then divide." onExit={onExit}>
      <Brief91 k="c5_cost" />
      {r1.c3_builder && <div className="g91-mini"><span>🧪 {r1.c3_builder.product}</span><span>Estimated cost in Class 3 <b>{cop(r1.c3_builder.costEst)}</b></span></div>}
      <div className="start-block"><h3>1 · Ingredients / materials for ONE batch (4+ rows, with source)</h3>
        <div className="g11-rows cost"><div className="g11-row head"><span>Item</span><span>Package price $</span><span>Package size (g/ml/units)</span><span>Used per batch</span><span>Source</span><span>Cost</span></div>
          {rows.map((r, i) => <div key={i} className="g11-row"><input className="start-input" value={r.n} placeholder="Gelatin powder" onChange={(e) => upR(i, "n", e.target.value)} /><input className="start-input" type="number" value={r.pack} placeholder="6500" onChange={(e) => upR(i, "pack", e.target.value)} /><input className="start-input" type="number" value={r.packQ} placeholder="170" onChange={(e) => upR(i, "packQ", e.target.value)} /><input className="start-input" type="number" value={r.use} placeholder="85" onChange={(e) => upR(i, "use", e.target.value)} /><input className="start-input" value={r.src} placeholder="Éxito web" onChange={(e) => upR(i, "src", e.target.value)} /><b>{cop(lineCost(r))}</b></div>)}
          <button type="button" className="p1-link" onClick={() => setRows([...rows, { n: "", pack: "", packQ: "", use: "", src: "" }])}><Plus size={14} /> add an item</button>
        </div>
      </div>
      <div className="start-block"><h3>2 · The batch</h3>
        <div className="g11-inline"><label>Units per batch<input className="start-input" type="number" value={units} onChange={(e) => setUnits(e.target.value)} placeholder="20" /></label><label>Packaging per unit $<input className="start-input" type="number" value={packU} onChange={(e) => setPackU(e.target.value)} placeholder="250" /></label><label>Work hours per batch<input className="start-input" type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="2" /></label><label>Value of 1 hour $<input className="start-input" type="number" value={rate} onChange={(e) => setRate(e.target.value)} /></label><label>Gas / energy / other $<input className="start-input" type="number" value={other} onChange={(e) => setOther(e.target.value)} placeholder="3000" /></label></div>
      </div>
      <div className="g10-two">
        <div className="start-block"><h3>📊 Cost of one batch</h3><HBars rows={[{ l: "🧂 Materials", v: Math.round(mat) }, { l: "⏱️ Work", v: Math.round(labor) }, { l: "🔥 Other", v: num(other) }, { l: "📦 Packaging (all units)", v: num(packU) * num(units) }]} /></div>
        <div className="start-block"><div className="g10-kpis"><div><small>Batch</small><b>{cop(batch + num(packU) * num(units))}</b></div><div><small>UNIT COST</small><b className="pos">{cop(unit)}</b></div></div><div className="g10-formula">unit cost = (materials + work + other) ÷ units + packaging</div><p className="start-tip">💡 Many young founders forget to pay for their own TIME. If you don't count it, your business only looks profitable.</p></div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => { teamShare(ctx, { unitCost: Math.round(unit), unitCost_by: ctx.name }); finish(32, { rows, units: num(units), packU: num(packU), hours: num(hours), rate: num(rate), other: num(other), materials: Math.round(mat), unitCost: Math.round(unit) }); }}>{ok ? "Save our unit cost" : "4 items with source + batch data"} <span className="coin-tag"><Coins size={15} /> +32</span></button></div>
    </ActShell>
  );
}

/* ---------- C5 · Pricing Lab (3 métodos + curva de demanda) ---------- */
const normCdf = (x) => { const t = 1 / (1 + 0.2316419 * Math.abs(x)); const d = 0.3989423 * Math.exp((-x * x) / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return x > 0 ? 1 - p : p; };
function PricingLab({ resp, existing, onSave, onExit, ctx }) {
  const r1 = P1r(resp);
  const unit = num(r1.c5_cost?.unitCost) || num(r1.c3_builder?.costEst) || 1500;
  const wtp = num(r1.c2_persona?.avgW) || num(r1.c2_persona?.budget) || 3000;
  const [mk, setMk] = useState(existing?.markup || 60);
  const [comp, setComp] = useState(existing?.comp || ["", "", ""]);
  const [price, setPrice] = useState(existing?.price || Math.round((unit * 1.6) / 100) * 100);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const N = 200; const sd = wtp * 0.35;
  const units = (p) => Math.round(N * (1 - normCdf((p - wtp) / sd)));
  const profit = (p) => units(p) * (p - unit);
  const grid = Array.from({ length: 13 }, (_, i) => Math.round(((unit * 0.9) + ((wtp * 1.8 - unit * 0.9) * i) / 12) / 100) * 100);
  const best = grid.reduce((b, p) => (profit(p) > profit(b) ? p : b), grid[0]);
  const compAvg = comp.filter((c) => num(c) > 0).length ? Math.round(comp.filter((c) => num(c) > 0).reduce((a, c) => a + num(c), 0) / comp.filter((c) => num(c) > 0).length) : 0;
  const margin = price > 0 ? Math.round(((price - unit) / price) * 100) : 0;
  const G = [W_NUMBERS(2), W_REASON, W_TOPIC("Use 2 pricing words", ["cost", "margin", "competitor", "value", "customer", "profit", "willing"], 2, "cost · margin · competitor · value")];
  const ok = comp.filter((c) => num(c) > 0).length >= 3 && price > unit && goalsOk(text, 30, 80, G);
  if (st.done) return <Reward title={`Price: ${cop(price)} 🏷️`} subtitle={`Margin ${margin}% · ~${units(price)} units / week`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Tag size={22} strokeWidth={2.1} />} title="Pricing Lab 🏷️" subtitle="Three methods, one demand curve, one decision. Remember JC Penney: price is a number AND a feeling." onExit={onExit}>
      <Brief91 k="c5_price" />
      <div className="g10-kpis"><div><small>🧮 Unit cost</small><b>{cop(unit)}</b></div><div><small>💰 Customers would pay (avg.)</small><b>{cop(wtp)}</b></div><div><small>🧑‍🤝‍🧑 Potential buyers / week</small><b>{N}</b></div></div>
      <div className="g10-two">
        <div className="start-block"><h3>① Cost-plus</h3><Ctl l="Markup" v={mk} set={setMk} mn={10} mx={200} stp={5} fmt={(x) => `${x}%`} /><p>{cop(unit)} × {(1 + mk / 100).toFixed(2)} = <b>{cop(unit * (1 + mk / 100))}</b></p></div>
        <div className="start-block"><h3>② Competitors (3 real prices)</h3>{comp.map((c, i) => <MoneyInput key={i} value={c} onChange={(v) => setComp(comp.map((x, j) => (j === i ? v : x)))} placeholder={["Store A", "Store B", "Online"][i]} />)}<p>Average: <b>{compAvg ? cop(compAvg) : "—"}</b></p></div>
      </div>
      <div className="start-block"><h3>③ Value-based: the demand curve (from your interviews)</h3>
        <ChartCard title="Weekly profit at each price" legend={[{ name: "Profit", color: "#3c9d5d" }]}><LineChart labels={grid.map((p) => `${Math.round(p / 100) / 10}k`)} series={[{ name: "Profit", values: grid.map(profit), color: "#3c9d5d" }]} /></ChartCard>
        <p className="start-tip">📈 The highest point (~{cop(best)}) maximizes profit in this model. But a price far from competitors or from the 'feeling' can still fail.</p>
      </div>
      <div className="start-block g10-boss"><h3>🎯 Your decision</h3><Ctl l="Our price" v={price} set={setPrice} mn={Math.round(unit / 100) * 100} mx={Math.round((wtp * 2) / 100) * 100} stp={100} fmt={cop} />
        <div className="g10-kpis"><div><small>Units / week</small><b>{units(price)}</b></div><div><small>Margin</small><b className={margin >= 30 ? "pos" : "neg"}>{margin}%</b></div><div><small>Profit / week</small><b className={profit(price) > 0 ? "pos" : "neg"}>{cop(profit(price))}</b></div></div>
        <WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="Our price is $3,000 because our cost is $1,450, competitors charge… and customers…" />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => { teamShare(ctx, { price, price_by: ctx.name }); finish(32, { price, markup: mk, comp: comp.map(num), compAvg, unit, wtp, units: units(price), margin, best, text }); }}>Save our price <span className="coin-tag"><Coins size={15} /> +32</span></button></div>
    </ActShell>
  );
}

/* ---------- C6 · Market size funnel ---------- */
function MarketFunnel({ resp, existing, onSave, onExit }) {
  const r1 = P1r(resp); const price = num(r1.c5_price?.price) || 3000;
  const tests = zoneRows(resp, "c5_zone", "test"); const yes = tests.filter((r) => /^(y|s|1)/i.test(String(r.buy || "").trim())).length;
  const convReal = tests.length ? Math.round((yes / tests.length) * 100) : 0;
  const [v, setV] = useState(existing?.v || { pop: 600, target: 40, reach: 50, conv: convReal || 20, freq: 1 });
  const [cap, setCap] = useState(existing?.cap || { batch: num(r1.c5_cost?.units) || 20, perWeek: 2 });
  const [st, finish] = useFinish(onSave);
  const up = (k, x) => setV({ ...v, [k]: x });
  const t1 = v.pop * (v.target / 100); const t2 = t1 * (v.reach / 100); const buyers = t2 * (v.conv / 100); const weekly = Math.round(buyers * v.freq); const monthly = weekly * 4;
  const capW = cap.batch * cap.perWeek;
  if (st.done) return <Reward title="Forecast ready! 🔭" subtitle={`${weekly} units / week · ${monthly} / month`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Target size={22} strokeWidth={2.1} />} title="Market Funnel 🔭 · Our forecast" subtitle="From the whole school to real buyers — with evidence, not optimism." onExit={onExit}>
      <Brief91 k="c6_market" />
      {tests.length > 0 && <div className="g91-mini"><span>🧪 Your price test: <b>{yes}/{tests.length}</b> said yes ({convReal}%)</span></div>}
      <div className="g10-two">
        <div className="start-block"><Ctl l="People in our market (school, families…)" v={v.pop} set={(x) => up("pop", x)} mn={50} mx={2000} stp={50} /><Ctl l="% who are our target" v={v.target} set={(x) => up("target", x)} mn={5} mx={100} fmt={(x) => `${x}%`} /><Ctl l="% who will SEE our product" v={v.reach} set={(x) => up("reach", x)} mn={5} mx={100} fmt={(x) => `${x}%`} /><Ctl l="% who BUY (use your test!)" v={v.conv} set={(x) => up("conv", x)} mn={1} mx={80} fmt={(x) => `${x}%`} /><Ctl l="Purchases per buyer per week" v={v.freq} set={(x) => up("freq", x)} mn={0.25} mx={3} stp={0.25} /></div>
        <div className="start-block"><div className="g11-funnel">{[["👥 Market", v.pop], ["🎯 Target", t1], ["👀 See it", t2], ["🛒 Buy", buyers]].map(([l, x], i) => <div key={l} style={{ width: `${100 - i * 18}%` }}><span>{l}</span><b>{Math.round(x)}</b></div>)}</div>
          <div className="g10-kpis"><div><small>Units / week</small><b>{weekly}</b></div><div><small>Units / month</small><b>{monthly}</b></div><div><small>Sales / month</small><b>{cop(monthly * price)}</b></div></div></div>
      </div>
      <div className="start-block"><h3>🏭 Can we produce it?</h3><div className="g11-inline"><label>Units per batch<input className="start-input" type="number" value={cap.batch} onChange={(e) => setCap({ ...cap, batch: num(e.target.value) })} /></label><label>Batches per week<input className="start-input" type="number" value={cap.perWeek} onChange={(e) => setCap({ ...cap, perWeek: num(e.target.value) })} /></label></div>
        <div className={`p1-banner ${capW >= weekly ? "good" : "bad"}`}><span>{capW >= weekly ? `✅ Capacity ${capW}/week ≥ demand ${weekly}.` : `⚠️ Demand ${weekly}/week but you can only make ${capW}. More batches, or a smaller target.`}</span></div></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!(v.conv > 0) || capW <= 0} onClick={() => finish(26, { v, cap, weekly, monthly, capW, convReal })}>Save our forecast <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
    </ActShell>
  );
}

/* ---------- C6 · Break-even Lab ---------- */
const BE_R = [
  { tag: "Break-even", q: "Fixed costs $240,000; price $3,000; variable cost $1,400. Break-even units?", answer: 150, unit: "units", hint: "240,000 ÷ (3,000 − 1,400)", explain: "240,000 ÷ 1,600 = 150 units." },
  { tag: "Contribution", q: "Price $2,500, variable cost $1,700. Contribution per unit?", answer: 800, money: true, hint: "2,500 − 1,700", explain: "$800 per unit helps pay fixed costs." },
  { tag: "Profit", q: "You sold 220 units (price $3,000, variable $1,400, fixed $240,000). Profit?", answer: 112000, money: true, hint: "220 × 1,600 − 240,000", explain: "352,000 − 240,000 = $112,000." },
];
function BreakEvenLab({ resp, existing, onSave, onExit }) {
  const r1 = P1r(resp);
  const [price, setPrice] = useState(existing?.price || num(r1.c5_price?.price) || 3000);
  const [vc, setVc] = useState(existing?.vc || num(r1.c5_cost?.unitCost) || 1500);
  const [fx, setFx] = useState(existing?.fx || [{ n: "Molds / trays", v: "60000" }, { n: "Stand decoration", v: "40000" }, { n: "Cooler / thermos", v: "80000" }]);
  const [r, setR] = useState(null);
  const [st, finish] = useFinish(onSave);
  const fixed = fx.reduce((a, x) => a + num(x.v), 0);
  const cm = price - vc; const be = cm > 0 ? Math.ceil(fixed / cm) : Infinity;
  const monthly = num(r1.c6_market?.monthly);
  const maxU = Math.max(20, Math.ceil((be === Infinity ? 100 : be) * 1.8 / 10) * 10);
  const xs = Array.from({ length: 11 }, (_, i) => Math.round((maxU * i) / 10));
  const ok = fx.filter((x) => countWords(x.n) >= 1 && num(x.v) > 0).length >= 2 && cm > 0 && r;
  if (st.done) return <Reward title="Break-even found! ⚖️" subtitle={`${be} units to cover ${cop(fixed)}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Scale size={22} strokeWidth={2.1} />} title="Break-even Lab ⚖️" subtitle="How many units must you sell before you earn the first peso of profit?" onExit={onExit}>
      <Brief91 k="c6_break" />
      <div className="g10-two">
        <div className="start-block"><h3>🏗️ Fixed costs (paid even if you sell nothing)</h3>{fx.map((x, i) => <div key={i} className="g11-inline"><input className="start-input" value={x.n} onChange={(e) => setFx(fx.map((y, j) => (j === i ? { ...y, n: e.target.value } : y)))} /><MoneyInput value={x.v} onChange={(v) => setFx(fx.map((y, j) => (j === i ? { ...y, v } : y)))} /></div>)}<button type="button" className="p1-link" onClick={() => setFx([...fx, { n: "", v: "" }])}><Plus size={14} /> add</button>
          <Ctl l="Price" v={price} set={setPrice} mn={500} mx={15000} stp={100} fmt={cop} /><Ctl l="Variable cost per unit" v={vc} set={setVc} mn={100} mx={12000} stp={50} fmt={cop} /></div>
        <div className="start-block"><div className="g10-kpis"><div><small>Fixed</small><b>{cop(fixed)}</b></div><div><small>Contribution / unit</small><b className={cm > 0 ? "pos" : "neg"}>{cop(cm)}</b></div><div><small>BREAK-EVEN</small><b>{be === Infinity ? "never" : `${be} u.`}</b></div></div>
          <ChartCard title="Revenue vs. total costs" legend={[{ name: "Revenue", color: "#3c9d5d" }, { name: "Total costs", color: "#c8563a" }]}><LineChart labels={xs.map(String)} series={[{ name: "Revenue", values: xs.map((u) => u * price), color: "#3c9d5d" }, { name: "Costs", values: xs.map((u) => fixed + u * vc), color: "#c8563a" }]} /></ChartCard>
          {monthly > 0 && be !== Infinity && <p className={`g91-note ${monthly >= be ? "pos" : "neg"}`}>With your forecast ({monthly}/month) you reach break-even in about {Math.max(1, Math.ceil(be / monthly))} month(s).</p>}</div>
      </div>
      <div className="start-block"><h3>🧮 Check yourself</h3>{!r ? <RoundsRunner rounds={BE_R} doneLabel="Done" onDone={setR} /> : <p className="g91-note pos">✅ {r.firstTry}/3 on the first try.</p>}</div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(20 + (r?.firstTry || 0) * 3, { fx, fixed, price, vc, be: be === Infinity ? null : be, firstTry: r?.firstTry })}>Save our break-even <span className="coin-tag"><Coins size={15} /> +{20 + (r?.firstTry || 0) * 3}</span></button></div>
    </ActShell>
  );
}

/* ---------- C6 · Launch Week (simulación de 10 días con eventos y desperdicio) ---------- */
const LW_EVENTS = [
  { e: "🌤️", t: "A normal day.", m: 1 }, { e: "🌧️", t: "Heavy rain: fewer people at break.", m: 0.7 }, { e: "📝", t: "Exam day: students want snacks.", m: 1.2 },
  { e: "🏐", t: "Sports tournament at school!", m: 1.6 }, { e: "🥊", t: "A competitor sells at half price.", m: 0.6 }, { e: "📱", t: "Your post got shared a lot.", m: 1.5, needPost: true },
  { e: "🚫", t: "Holiday Monday: school is closed.", m: 0 }, { e: "👨‍👩‍👧", t: "Parents' meeting: families everywhere.", m: 1.3 }, { e: "🔥", t: "Very hot day.", m: 1.4 }, { e: "💸", t: "End of the month: students have less money.", m: 0.8 },
];
const LW_PROMO = [["none", "—", "No promotion", 1, 0], ["sample", "🧁", "Free samples (5 units)", 1.25, 5], ["post", "📱", "Instagram post", 1.15, 0], ["disc", "🏷️", "10% discount", 1.3, 0]];
function LaunchWeek({ resp, existing, onSave, onExit }) {
  const r1 = P1r(resp);
  const price = num(r1.c5_price?.price) || 3000; const unit = num(r1.c5_cost?.unitCost) || 1500;
  const base = Math.max(6, Math.round((num(r1.c6_market?.weekly) || 40) / 5));
  const perish = !!BASES.find((b) => b.k === r1.c3_builder?.base)?.per || !r1.c3_builder;
  const [order] = useState(() => [0, ...shuffleArr([1, 2, 3, 4, 5, 6, 7, 8, 9])]);
  const [day, setDay] = useState(0);
  const [prod, setProd] = useState(base);
  const [promo, setPromo] = useState("none");
  const [log, setLog] = useState([]);
  const [stock, setStock] = useState(0);
  const [posted, setPosted] = useState(false);
  const [text, setText] = useState("");
  const [st, finish] = useFinish(onSave);
  const done = day >= 10;
  const ev = LW_EVENTS[order[Math.min(day, 9)]];
  const play = () => {
    const P = LW_PROMO.find((x) => x[0] === promo);
    let m = ev.m; if (ev.needPost && !posted) m = 1;
    const p = promo === "disc" ? price * 0.9 : price;
    const demand = Math.round(base * m * P[3] * (0.85 + Math.random() * 0.3));
    const avail = stock + prod - P[4];
    const sold = Math.max(0, Math.min(demand, avail));
    const left = Math.max(0, avail - sold);
    const waste = perish ? left : 0;
    const cost = prod * unit; const rev = sold * p;
    setLog([...log, { d: day + 1, e: ev.e, t: ev.t, prod, demand, sold, waste, promo, profit: rev - cost }]);
    setStock(perish ? 0 : left); if (promo === "post") setPosted(true); setDay(day + 1); setPromo("none");
  };
  const tot = log.reduce((a, x) => ({ sold: a.sold + x.sold, waste: a.waste + x.waste, profit: a.profit + x.profit, lost: a.lost + Math.max(0, x.demand - x.sold) }), { sold: 0, waste: 0, profit: 0, lost: 0 });
  const G = [W_PAST, W_NUMBERS(2), W_TOPIC("Use 2 words of the topic", ["demand", "waste", "production", "profit", "forecast", "stock", "event"], 2, "demand · waste · profit · forecast")];
  if (st.done) return <Reward title="Launch week survived! 🚀" subtitle={`Profit ${cop(tot.profit)} · waste ${tot.waste} units`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Rocket size={22} strokeWidth={2.1} />} title="Launch Week 🚀 · 10 school days" subtitle={`Decide production and promotion every morning. ${perish ? "Your product is PERISHABLE: what you don't sell today is waste." : "Your product lasts: leftovers go to tomorrow."}`} onExit={onExit}>
      <Brief91 k="c6_launch" />
      <div className="g10-kpis"><div><small>📅 Day</small><b>{Math.min(day + 1, 10)}/10</b></div><div><small>🛒 Sold</small><b>{tot.sold}</b></div><div><small>🗑️ Waste</small><b className={tot.waste ? "neg" : ""}>{tot.waste}</b></div><div><small>😞 Lost sales</small><b>{tot.lost}</b></div><div><small>💰 Profit</small><b className={tot.profit >= 0 ? "pos" : "neg"}>{cop(tot.profit)}</b></div></div>
      {!done ? (
        <div className="start-block g10-event">
          <div className="g10-event-head"><em>{ev.e}</em><div><b>Morning news · day {day + 1}</b><p>{ev.t}{ev.needPost && !posted ? " (only works if you posted before!)" : ""}</p></div></div>
          {!perish && stock > 0 && <p className="start-tip">📦 Stock from yesterday: {stock}</p>}
          <Ctl l="Units to produce today" v={prod} set={setProd} mn={0} mx={base * 3} />
          <div className="g10-ab four">{LW_PROMO.map(([k, e, l]) => <button key={k} type="button" className={promo === k ? "on" : ""} onClick={() => setPromo(k)}><em>{e}</em><b>{l}</b></button>)}</div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={play}>Open the stand 🔔</button></div>
        </div>
      ) : (
        <div className="start-block"><h3>✍️ Launch report</h3><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="On day 4 the tournament doubled demand, but we produced only… We wasted… Next time we will…" /></div>
      )}
      {log.length > 0 && <><ChartCard title="Demand vs. production (units)" legend={[{ name: "Demand", color: "#c8743a" }, { name: "Produced", color: "#3c9d5d" }]}><LineChart money={false} labels={log.map((x) => `D${x.d}`)} series={[{ name: "Demand", values: log.map((x) => x.demand), color: "#c8743a" }, { name: "Produced", values: log.map((x) => x.prod), color: "#3c9d5d" }]} /></ChartCard>
        <MiniTable head={["Day", "Event", "Made", "Demand", "Sold", "Waste", "Profit"]} rows={log.map((x) => [x.d, x.e, x.prod, x.demand, x.sold, x.waste, cop(x.profit)])} /></>}
      {done && <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(text, 30, 80, G)} onClick={() => finish(Math.max(18, Math.min(34, 18 + Math.round(tot.profit / Math.max(1, price * base)))), { profit: Math.round(tot.profit), sold: tot.sold, waste: tot.waste, lost: tot.lost, log, text })}>Save our launch report <span className="coin-tag"><Coins size={15} /> +18–34</span></button></div>}
    </ActShell>
  );
}

/* ---------- C7 · Campaign Builder ---------- */
const CHANNELS = [
  { k: "poster", e: "🖼️", l: "Posters in school", c: 15000, reach: 90, conv: 4 }, { k: "wa", e: "💬", l: "WhatsApp class groups", c: 0, reach: 120, conv: 5, max: 3 },
  { k: "ig", e: "📱", l: "Instagram post (free)", c: 0, reach: 150, conv: 2, max: 3 }, { k: "ad", e: "📣", l: "Instagram ad", c: 30000, reach: 600, conv: 1.5 },
  { k: "sample", e: "🧁", l: "Free samples (10 units)", c: -1, reach: 10, conv: 35 }, { k: "infl", e: "🤳", l: "A popular student posts it", c: 40000, reach: 800, conv: 2 },
  { k: "stand", e: "🎪", l: "Stand at break (1 day)", c: 10000, reach: 200, conv: 6 },
];
function CampaignBuilder({ resp, existing, onSave, onExit }) {
  const r1 = P1r(resp); const price = num(r1.c5_price?.price) || 3000; const unit = num(r1.c5_cost?.unitCost) || 1500;
  const BUDGET = 150000;
  const [q, setQ] = useState(existing?.q || {});
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const cost = (c) => (c.c === -1 ? unit * 10 : c.c);
  const spend = CHANNELS.reduce((a, c) => a + cost(c) * (q[c.k] || 0), 0);
  const res = CHANNELS.map((c) => { const n = q[c.k] || 0; const reach = c.reach * n * Math.pow(0.85, Math.max(0, n - 1)); return { ...c, n, reach, buyers: (reach * c.conv) / 100 }; });
  const reach = Math.round(res.reduce((a, x) => a + x.reach, 0)); const buyers = Math.round(res.reduce((a, x) => a + x.buyers, 0));
  const cac = buyers ? Math.round(spend / buyers) : 0; const margin = price - unit;
  const G = [W_NUMBERS(2), W_REASON, W_TOPIC("Use 2 marketing words", ["reach", "customer", "cac", "channel", "conversion", "budget", "buyers"], 2, "reach · CAC · channel · budget")];
  const ok = spend <= BUDGET && buyers > 0 && Object.values(q).filter((n) => n > 0).length >= 2 && goalsOk(text, 30, 80, G);
  if (st.done) return <Reward title="Campaign launched! 📣" subtitle={`${buyers} buyers · CAC ${cop(cac)}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Megaphone size={22} strokeWidth={2.1} />} title="Campaign Builder 📣" subtitle={`Budget ${cop(BUDGET)}. Reach people, turn them into buyers — and keep CAC below your margin (${cop(margin)}).`} onExit={onExit}>
      <Brief91 k="c7_campaign" />
      <div className="p1-banner"><span>📰 <b>The Ice Bucket Challenge (2014)</b> raised about US$115 million for ALS research in a few weeks with almost no paid advertising: a simple action, a challenge to friends and a video anyone could make. Free channels can beat expensive ones when people WANT to share.</span></div>
      <div className="g11-channels">{CHANNELS.map((c) => <div key={c.k}><em>{c.e}</em><b>{c.l}</b><small>{c.c === -1 ? `${cop(unit * 10)} (your cost)` : c.c ? cop(c.c) : "free"} · reach {c.reach} · buys {c.conv}%</small><div className="g11-qty"><button type="button" onClick={() => setQ({ ...q, [c.k]: Math.max(0, (q[c.k] || 0) - 1) })}><Minus size={14} /></button><b>{q[c.k] || 0}</b><button type="button" disabled={c.max && (q[c.k] || 0) >= c.max} onClick={() => setQ({ ...q, [c.k]: (q[c.k] || 0) + 1 })}><Plus size={14} /></button></div></div>)}</div>
      <div className="g10-kpis"><div><small>💸 Spent</small><b className={spend <= BUDGET ? "" : "neg"}>{cop(spend)}</b></div><div><small>👀 Reach</small><b>{reach}</b></div><div><small>🛒 Buyers</small><b>{buyers}</b></div><div><small>🎯 CAC</small><b className={cac && cac < margin ? "pos" : "neg"}>{cac ? cop(cac) : "—"}</b></div><div><small>💰 Profit after ads</small><b className={buyers * margin - spend >= 0 ? "pos" : "neg"}>{cop(buyers * margin - spend)}</b></div></div>
      <p className="start-tip">💡 CAC = money spent ÷ buyers. If CAC is bigger than your margin per unit, every new customer LOSES money (unless they buy again and again). Repeating a channel gives less new reach each time.</p>
      <div className="start-block"><h3>✍️ Our marketing plan</h3><WordField value={text} onChange={setText} min={30} max={80} goals={G} placeholder="We will use WhatsApp groups and a stand because their CAC is… With a budget of… we expect… buyers." /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30, { q, spend, reach, buyers, cac, text })}>{spend > BUDGET ? "Over budget!" : "Save our campaign"} <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- C7 · Post Maker ---------- */
function PostMaker({ resp, existing, onSave, onExit }) {
  const r1 = P1r(resp); const brand = r1.c4_name?.brand || "Our brand"; const logo = r1.c4_logo || null;
  const [p, setP] = useState(existing?.post || { head: "", offer: "", cap: "", emoji: BASES.find((b) => b.k === r1.c3_builder?.base)?.e || "🍮" });
  const [st, finish] = useFinish(onSave);
  const up = (k, v) => setP({ ...p, [k]: v });
  const C = [["hook", "Hook (question or !)", /[?!]/.test(p.cap.split(/[.\n]/)[0] || "")], ["you", "Talks to YOU", /\b(you|your)\b/i.test(p.cap)], ["cta", "Call to action", /\b(order|buy|dm|message|visit|come|get|try|reserve|pre-order)\b/i.test(p.cap)], ["tag", "1–3 hashtags", ((p.cap.match(/#\w+/g) || []).length >= 1 && (p.cap.match(/#\w+/g) || []).length <= 3)], ["short", "≤ 40 words", countWords(p.cap) > 0 && countWords(p.cap) <= 40], ["head", "Headline ≤ 6 words", countWords(p.head) >= 2 && countWords(p.head) <= 6]];
  const ok = C.every((x) => x[2]) && countWords(p.offer) >= 2;
  if (st.done) return <Reward title="Post ready! 📱" subtitle="Publish it for real with your team." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Smartphone size={22} strokeWidth={2.1} />} title="Post Maker 📱" subtitle="Design the launch post. 6 rules make people stop scrolling." onExit={onExit}>
      <Brief91 k="c7_post" />
      <div className="g10-two">
        <div className="start-block"><input className="start-input g11-gap" value={p.head} onChange={(e) => up("head", e.target.value)} placeholder="Headline: Fresh after every game" /><input className="start-input g11-gap" value={p.offer} onChange={(e) => up("offer", e.target.value)} placeholder="Offer: Pre-order today — $3,000" /><textarea className="start-input" rows={4} value={p.cap} onChange={(e) => up("cap", e.target.value)} placeholder="Thirsty after practice? 🥵 Your new favorite snack is here… DM us to pre-order! #FreshUp" />
          <div className="g10-chips">{["🍮", "🍪", "🧁", "🍫", "🥤", "🍿", "🍓", "🥭", "🔥", "❄️", "🎉"].map((e) => <button key={e} type="button" className={p.emoji === e ? "on" : ""} onClick={() => up("emoji", e)}>{e}</button>)}</div>
          <div className="g11-rules">{C.map(([k, l, v]) => <span key={k} className={v ? "on" : ""}>{v ? "✓" : "○"} {l}</span>)}</div></div>
        <PhoneFrame title={brand}><div className="g11-post" id="g11-post" style={{ "--lg-bg": logo?.bg || "#3c9d5d", "--lg-fg": logo?.fg || "#f7f1e3" }}><div className="g11-post-img"><em>{p.emoji}</em><b>{p.head || "Your headline"}</b><i>{p.offer || "Your offer"}</i>{logo && <div className="g11-post-logo"><LogoMark logo={logo} size={44} /></div>}</div><p><b>{brand.toLowerCase().replace(/\s+/g, "")}</b> {p.cap || "Your caption…"}</p></div></PhoneFrame>
      </div>
      <div className="start-foot"><button className="s1-btn ghost" onClick={() => downloadPNG("g11-post", "My_Post.png")}><Download size={16} /> PNG</button><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(26, { post: p })}>Save our post <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
    </ActShell>
  );
}

/* ---------- C7 · Pre-order Fair (publicar producto + pre-órdenes con monedas) ---------- */
function PreorderFair({ resp, userData, API_URL, existing, onSave, onExit }) {
  const r1 = P1r(resp); const brand = r1.c4_name?.brand || r1.c1_team?.name || "Our brand";
  const [pub, setPub] = useState(existing?.published ? "ok" : null);
  const [stage, setStage] = useState(existing?.published ? 1 : 0);
  const card = { name: brand, logo: r1.c4_logo?.symbol || "🛍️", lines: [`${r1.c3_builder?.product || "Our product"} · ${cop(r1.c5_price?.price || 0)}`, r1.c4_name?.tagline ? `“${r1.c4_name.tagline}”` : "", r1.c2_persona?.name ? `Made for: ${r1.c2_persona.name}` : "", r1.c1_team?.members?.length ? `Team: ${r1.c1_team.members.join(", ")}` : ""].filter(Boolean), nums: [{ l: "Price", v: cop(r1.c5_price?.price || 0) }, { l: "Margin", v: `${r1.c5_price?.margin ?? "—"}%` }] };
  const publish = async () => { setPub("busy"); try { const d = await fairPost(API_URL, userData, "11-PRE", "fair_publish", { company: card }); setPub(d.status !== "error" ? "ok" : "bad"); if (d.status !== "error") setStage(1); } catch (e) { setPub("bad"); } };
  if (stage === 1) return <FairArena userData={userData} API_URL={API_URL} grado="11-PRE" title="Pre-order Fair 🛍️" subtitle="You have 100 coins. Pre-order from the products you would REALLY buy — and ask the founders one question." brief={<Brief91 k="c7_fair" />} coinsBase={18} unitWord="product" onSave={(r) => onSave({ ...r, published: true })} onExit={onExit} />;
  return (
    <ActShell icon={<Store size={22} strokeWidth={2.1} />} title="Pre-order Fair 🛍️ · Publish" subtitle="First publish your product card. Then pre-order from your classmates." onExit={onExit}>
      <Brief91 k="c7_fair" />
      <div className="g10-fair-card"><h3>{card.logo} {card.name}</h3>{card.lines.map((l) => <p key={l}>{l}</p>)}<div className="g91-mini">{card.nums.map((n) => <span key={n.l}>{n.l} <b>{n.v}</b></span>)}</div></div>
      {!r1.c5_price && <div className="p1-banner bad"><span>Save your price (Class 5) first so the card shows real numbers.</span></div>}
      {pub === "bad" && <div className="p1-banner bad"><span>We couldn't publish (connection or Apps Script). Try again.</span></div>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={pub === "busy"} onClick={publish}>{pub === "busy" ? "Publishing…" : "Publish our product"} <ChevronRight size={18} /></button></div>
    </ActShell>
  );
}

/* ---------- C8 · Launch Audit ---------- */
function LaunchAudit({ resp, existing, onSave, onExit }) {
  const r1 = P1r(resp);
  const pre = zoneRows(resp, "c7_zone", "pre"); const realU = pre.reduce((a, r) => a + num(r.units), 0);
  const fW = num(r1.c6_market?.weekly); const sim = num(r1.c6_launch?.sold);
  const [real, setReal] = useState(existing?.real || (realU ? String(realU) : ""));
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const acc = fW && num(real) ? Math.round((Math.min(fW, num(real)) / Math.max(fW, num(real))) * 100) : 0;
  const G = [W_NUMBERS(3), W_COMPARE, W_TOPIC("Use 2 words of the topic", ["forecast", "real", "pre-order", "demand", "price", "customers", "next"], 2, "forecast · real · demand")];
  const ok = num(real) >= 0 && real !== "" && goalsOk(text, 35, 90, G);
  if (st.done) return <Reward title="Audit closed! 🔍" subtitle={`Forecast accuracy ${acc}%`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Launch Audit 🔍" subtitle="Forecast vs. simulation vs. reality. Professionals learn the most from the difference." onExit={onExit}>
      <Brief91 k="c8_audit" />
      <div className="g10-kpis"><div><small>🔭 Forecast / week</small><b>{fW || "—"}</b></div><div><small>🚀 Launch Week (sim, 2 weeks)</small><b>{sim || "—"}</b></div><div><small>🧾 REAL pre-orders</small><b>{num(real) || "—"}</b></div><div><small>🎯 Accuracy</small><b className={acc >= 70 ? "pos" : "neg"}>{acc ? `${acc}%` : "—"}</b></div></div>
      <div className="p3-sentence edit"><span>🧾 Real units pre-ordered (from your Team Zone list)</span><input className="start-input" type="number" value={real} onChange={(e) => setReal(e.target.value)} /></div>
      {fW > 0 && num(real) > 0 && <ChartCard title="Forecast vs. reality"><BarChart money={false} bars={[{ label: "Forecast", value: fW, color: "#c8743a" }, { label: "Real", value: num(real), color: "#3c9d5d" }]} /></ChartCard>}
      <div className="start-block"><h3>✍️ What the difference teaches us</h3><WordField value={text} onChange={setText} min={35} max={90} goals={G} placeholder="We forecast 40 units, but we got 26 real pre-orders, so our conversion was lower than… Next time we will…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(26, { real: num(real), forecast: fW, sim, acc, text })}>Save our audit <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
    </ActShell>
  );
}

/* ---------- C8 · Product Launch Pitch ---------- */
const RUB_P1 = [["prob", "Real problem & customer", "with interview evidence"], ["prod", "Product & brand", "logo, name, tagline coherent"], ["nums", "Correct numbers", "unit cost, price, margin, break-even"], ["test", "Tested with reality", "price test, pre-orders, audit"], ["eng", "Clear, confident English", "eye contact, no reading"]];
function LaunchPitch({ resp, studentName, userData, API_URL, existing, onSave, onExit }) {
  const r = P1r(resp); const co = co11(r);
  const ev = [
    { k: "prob", e: "🎯", t: "Found a real problem", ok: !!r.c1_hunter && !!r.c2_zone, d: r.c1_hunter ? `${r.c1_hunter.problem || "Problem saved"} · ${zoneRows(resp, "c2_zone", "int").length} real interviews` : "Problem Hunter pending", fix: "Classes 1–2: Problem Hunter + Team Zone interviews.", cert: "found a real problem and validated it with customer interviews" },
    { k: "mvp", e: "🧪", t: "Built and tested a prototype", ok: !!r.c3_builder && !!r.c3_zone, d: r.c3_builder ? `${r.c3_builder.product} · ${zoneRows(resp, "c3_zone", "taste").length} taste tests` : "Product Builder pending", fix: "Class 3: Product Builder + prototype Team Zone.", cert: `built and tested a physical prototype (${r.c3_builder?.product || "product"})` },
    { k: "brand", e: "🎨", t: "Designed a brand", ok: !!r.c4_logo && !!r.c4_name, d: r.c4_name ? `${r.c4_name.brand} · “${r.c4_name.tagline}”` : "Brand pending", fix: "Class 4: Name Lab + Logo Builder.", cert: `designed the brand ${r.c4_name?.brand || ""}` },
    { k: "price", e: "🏷️", t: "Priced with real costs", ok: !!r.c5_cost && !!r.c5_price, d: r.c5_price ? `Unit cost ${cop(r.c5_cost?.unitCost)} · price ${cop(r.c5_price.price)} · margin ${r.c5_price.margin}%` : "Pricing pending", fix: "Class 5: Cost Builder + Pricing Lab.", cert: `set a price of ${cop(r.c5_price?.price || 0)} with a ${r.c5_price?.margin ?? 0}% margin` },
    { k: "be", e: "⚖️", t: "Calculated break-even & forecast", ok: !!r.c6_break && !!r.c6_market, d: r.c6_break ? `Break-even ${r.c6_break.be} units · forecast ${r.c6_market?.weekly ?? "—"}/week` : "Break-even pending", fix: "Class 6: Market Funnel + Break-even Lab.", cert: `calculated a break-even of ${r.c6_break?.be ?? "—"} units` },
    { k: "real", e: "🧾", t: "Got real pre-orders", ok: !!r.c8_audit, d: r.c8_audit ? `${r.c8_audit.real} real units · accuracy ${r.c8_audit.acc}%` : "Launch Audit pending", fix: "Class 8: Launch Audit.", cert: `collected ${r.c8_audit?.real ?? 0} real pre-orders` },
  ];
  const got = ev.filter((x) => x.ok);
  const QA = [
    { k: "q1", e: "🎯", q: "“Why would a customer choose YOUR product instead of what they buy today?”", goals: [W_REASON, W_TOPIC("Use 2 words", ["customer", "pain", "benefit", "price", "today", "better", "interview"], 2)], ph: "Today our customers… but our product… because in our interviews…" },
    { k: "q2", e: "🧮", q: `“Your price is ${cop(co.price || 0)}. Prove that you make money on every unit.”`, goals: [W_NUMBERS(2), W_TOPIC("Use 2 words", ["cost", "margin", "price", "profit", "break-even", "unit"], 2)], ph: "Each unit costs us… and we sell it for… so our margin is…" },
    { k: "q3", e: "🔍", q: "“What did reality teach you that you didn't expect?”", goals: [W_PAST, W_TOPIC("Use 2 words", ["forecast", "real", "pre-order", "test", "customers", "learned", "changed"], 2)], ph: "We expected… but in the real test… so we changed…" },
  ];
  const [qa, setQa] = useState(existing?.qa || {});
  const [stage, setStage] = useState(existing?.qa ? 1 : 0);
  const ready = !!r.c4_name && !!r.c5_price;
  if (stage === 0) return <QAStage title="Launch Pitch 🎤 · Part 1 · Evidence & hard questions" intro="Before you present, prove it with YOUR data." evidence={ev} qa={qa} setQa={setQa} items={QA} ready={ready} readyMsg="You need your brand name (Class 4) and your price (Class 5)." onNext={() => setStage(1)} onExit={onExit} brief={<Brief91 k="c8_pitch" />} />;
  const chapters = (v) => [
    { e: "🎯", t: "The problem", s: r.c1_hunter ? [r.c1_hunter.statement || r.c1_hunter.problem] : [] },
    { e: "👤", t: "Our customer", s: r.c2_persona ? [`Meet ${r.c2_persona.name}: ${lowFirst(dot(r.c2_persona.fields?.pain || ""))}`, `Today she ${lowFirst(dot(r.c2_persona.fields?.now || "")).replace(/^she /i, "")}`] : [] },
    { e: "🧪", t: "Our product", s: r.c3_builder ? [`${r.c3_builder.product}: ${(r.c3_builder.adds || []).map((k) => ADDONS.find((a) => a.k === k)?.l.toLowerCase()).join(", ")}.`, ...(r.c3_benefit?.benefits || []).slice(0, 2).map((b) => dot(capF(b)))] : [] },
    { e: "🎨", t: "Our brand", s: r.c4_name ? [`${r.c4_name.brand} — “${r.c4_name.tagline}”.`, r.c4_logo?.why ? dot(capF(r.c4_logo.why)) : ""].filter(Boolean) : [] },
    { e: "🧮", t: "Our numbers", s: r.c5_price ? [`Unit cost ${cop(r.c5_cost?.unitCost || r.c5_price.unit)}, price ${cop(r.c5_price.price)}, margin ${r.c5_price.margin}%.`, r.c6_break ? `Break-even: ${r.c6_break.be} units. Forecast: ${r.c6_market?.weekly ?? "—"} units a week.` : ""].filter(Boolean) : [] },
    { e: "🧾", t: "Reality check", s: r.c8_audit ? [`We collected ${r.c8_audit.real} real pre-orders; our forecast accuracy was ${r.c8_audit.acc}%.`] : [] },
    { e: "🦈", t: "Your questions", s: QA.map((x) => `${x.e} ${dot(capF(qa[x.k] || ""))}`) },
    { e: "🚀", t: "Next step", s: v.next ? [dot(capF(v.next))] : [] },
  ];
  return (
    <PitchStudio icon={<Mic size={22} strokeWidth={2.1} />} title="Launch Pitch 🎤 · Part 2 · Present" subtitle="Your team's product launch, built from everything you made." brief={<div className="p3-card-actions"><button className="s1-btn ghost" onClick={() => setStage(0)}><ChevronLeft size={16} /> Edit answers</button></div>}
      how={<>Your script builds itself from the problem, persona, product, brand, numbers and audit. Each teammate presents at least one part. Add your next step and closing line, press <b>Present</b> and receive the jury's rating.</>}
      id="g11-launch" ready={ready} readyMsg="You need your brand name (Class 4) and your price (Class 5)."
      cover={{ tag: "LAUNCH DAY · GRADE 11 · INSTITUTO CREAR", title: `${co.logo?.symbol || "🚀"} ${co.brand || "Our company"}`, sub: `${co.product || ""}${co.team?.members?.length ? ` · ${co.team.members.join(", ")}` : ""}`, say: `Good morning. We are ${co.brand || "our team"}, and we solve a real problem.`, end: (v) => `${v.close ? dot(capF(v.close)) : "…"} Thank you!` }}
      kpis={[{ l: "🧮 Unit cost", v: cop(co.unit) }, { l: "🏷️ Price", v: cop(co.price) }, { l: "📊 Margin", v: `${r.c5_price?.margin ?? "—"}%` }, { l: "🧾 Pre-orders", v: r.c8_audit ? String(r.c8_audit.real) : "—" }]}
      chapters={chapters} inputs={[{ k: "next", l: "🚀 Our next step:", ph: "Next month we will sell at the school fair and…", min: 8 }, { k: "close", l: "💡 Our closing line:", ph: "A small product, a real solution…", min: 6 }]}
      rubric={RUB_P1} existing={existing} cert={{ e: "🛠️", title: "Product Builder", name: studentName, text: got.length ? `${joinAnd(got.map((x) => x.cert))}.` : "started a real company with a physical product." }}
      extraData={{ qa, evidence: got.map((x) => x.k) }} coins={46 + got.length * 2} onSave={onSave} onExit={onExit} />
  );
}

/* ---------- C8 · Boss P1 ---------- */
const BOSS11_1_MISSIONS = [
  { tag: "Unit cost", q: "A batch costs $36,000 in materials + $16,000 of work and makes 40 units. Packaging is $200 per unit. Unit cost?", answer: 1500, money: true, hint: "(36,000 + 16,000) ÷ 40 + 200", explain: "52,000 ÷ 40 = 1,300 + 200 = $1,500." },
  { tag: "Margin", q: "Price $2,500, unit cost $1,500. Margin in %?", answer: 40, unit: "%", tol: 0.5, hint: "(2,500 − 1,500) ÷ 2,500 × 100", explain: "1,000 ÷ 2,500 = 40%." },
  { tag: "Break-even", q: "Fixed costs $180,000; price $2,500; unit cost $1,500. Break-even units?", answer: 180, unit: "units", hint: "180,000 ÷ 1,000", explain: "180 units." },
  { tag: "Funnel", q: "800 people · 30% target · 50% see it · 10% buy. Buyers?", answer: 12, unit: "buyers", hint: "800 × 0.3 × 0.5 × 0.1", explain: "12 buyers." },
  { tag: "CAC", q: "You spent $60,000 on ads and got 40 buyers. CAC?", answer: 1500, money: true, hint: "60,000 ÷ 40", explain: "$1,500 per customer." },
];
const BOSS11_1_Q = [
  { t: "Problems", q: "Which is the best problem to build a business on?", options: ["A problem that happens once a year to a few people at school.", "A frequent, painful problem people already pay to solve.", "A problem only you and your friends have.", "A problem that nobody talks about, even when it happens every day."], correct: 1 },
  { t: "Interviews", q: "Which interview question gives the most reliable information?", options: ["“Would you buy this?”", "“Isn't my idea great?”", "“How much would you pay for a perfect, healthy snack every day?”", "“What did you buy the last time you had this problem?”"], correct: 3 },
  { t: "Interviews", q: "What was New Coke's main research mistake?", options: ["It measured taste, not what the drink meant to people.", "It asked too few people to get reliable results for a new formula.", "It tested the new formula in too many countries at once.", "It used a laboratory that was far too expensive."], correct: 0 },
  { t: "MVP", q: "An MVP is…", options: ["the most valuable player of the team, who sells the most every week.", "the final version with every feature.", "the simplest version that lets you learn from real customers.", "a product that costs more than the competition but looks premium."], correct: 2 },
  { t: "Branding", q: "What made Juan Valdez a strong brand?", options: ["A famous actor in every ad and a very big budget.", "Changing the logo every year to look modern.", "Low prices in supermarkets around the world.", "One clear promise: quality, origin and people."], correct: 3 },
  { t: "Branding", q: "Which color usually communicates health and nature?", options: ["Green.", "Red.", "Black.", "Purple."], correct: 0 },
  { t: "Pricing", q: "Why did JC Penney's honest prices fail?", options: ["The new everyday prices were higher than the old ones.", "Customers lost the reference price that made deals feel good.", "Competitors copied the new strategy immediately and better.", "The products in the stores were of lower quality."], correct: 1 },
  { t: "Pricing", q: "Value-based pricing starts from…", options: ["the total cost of making the product, plus taxes.", "the price of the cheapest competitor in the area.", "what customers are willing to pay for the benefit.", "a fixed 50% markup on top of the unit cost."], correct: 2 },
  { t: "Forecast", q: "What is the most dangerous thing in a forecast?", options: ["Using data from price tests.", "Counting how many people will see the product.", "Checking production capacity.", "Optimism without evidence."], correct: 3 },
  { t: "Forecast", q: "Why is a perishable product riskier in Launch Week?", options: ["Unsold units become waste.", "It is harder to price.", "Customers don't like fresh food.", "It needs more marketing."], correct: 0 },
];
const BOSS11_1_TIPS = { Problems: "Frequent + painful + paid.", Interviews: "Ask about past behavior; don't push answers.", MVP: "Smallest version that teaches you something.", Branding: "One clear, true promise — everywhere.", Pricing: "Cost, competitors AND perceived value.", Forecast: "Evidence beats optimism." };
function BossP1_11({ resp, studentName, onSave, onExit }) {
  const r = P1r(resp); const co = co11(r);
  const card = <FMCardView id="g11-card1" card={FM_CARDS[0]} name={studentName} lines={[co.brand ? `Company: ${co.brand}` : "", co.product ? `Product: ${co.product}` : "", co.price ? `Price ${cop(co.price)} · unit cost ${cop(co.unit)}` : "", r.c6_break?.be ? `Break-even: ${r.c6_break.be} units` : ""]} />;
  return <BossExam icon={<Swords size={22} strokeWidth={2.1} />} title="Boss P1 · Startup Studio ⚔️" subtitle="5 missions + 10 questions. 70% unlocks your Founder Card." brief={<Brief91 k="c8_boss" />} missions={BOSS11_1_MISSIONS} questions={BOSS11_1_Q} tips={BOSS11_1_TIPS} cardNode={card} onSave={onSave} onExit={onExit} />;
}
const CAN_P1 = [
  { t: "I can find a real problem and validate it with interviews.", ev: (r) => (r.c2_zone ? `${zoneRows(r, "c2_zone", "int").length} interviews · ${r.c1_hunter?.problem || ""}` : null) },
  { t: "I can design an MVP for a specific customer.", ev: (r) => (r.c3_builder ? `${r.c3_builder.product} for ${r.c2_persona?.name || "our persona"}` : null) },
  { t: "I can build a brand: name, logo, colors and tagline.", ev: (r) => (r.c4_logo && r.c4_name ? `${r.c4_name.brand} · ${colorName(r.c4_logo.bg)} + ${colorName(r.c4_logo.fg)}` : null) },
  { t: "I can calculate a unit cost with real prices.", ev: (r) => (r.c5_cost ? `${cop(r.c5_cost.unitCost)} per unit` : null) },
  { t: "I can set a price with 3 methods.", ev: (r) => (r.c5_price ? `${cop(r.c5_price.price)} · margin ${r.c5_price.margin}%` : null) },
  { t: "I can forecast sales and calculate break-even.", ev: (r) => (r.c6_break ? `Break-even ${r.c6_break.be} u. · forecast ${r.c6_market?.weekly ?? "—"}/week` : null) },
  { t: "I can plan a campaign and measure CAC.", ev: (r) => (r.c7_campaign ? `CAC ${cop(r.c7_campaign.cac)} · ${r.c7_campaign.buyers} buyers` : null) },
  { t: "I can present a product pitch in English.", ev: (r) => (r.c8_pitch ? `Jury score ${r.c8_pitch.score}` : null) },
];

/* =====================================================================
   GUÍA DE CADA ACTIVIDAD · 11° PERIODO 1
   ===================================================================== */
const ZONE_WIN = (c) => [["All goals done, each with evidence", "required"], ["Mission complete", `+${c} 🪙`]];
const GUIDE = {
  c1_radar: { goal: "Take a photo of how you think about business and money TODAY. You'll compare it with your final radar in Period 4.", steps: ["Read each situation.", "Choose what you would REALLY do — every option makes sense.", "See your radar with 5 pillars."], win: [["Saving your radar", "+25 🪙"]] },
  c1_read: B_READ("Discover how Airbnb started with three air mattresses: a business begins with a real problem.", "Next: Problem Hunter."),
  c1_hunter: { goal: "Hunt for real problems in 8 scenes, score them like an investor and write your team's problem statement.", steps: ["Choose the best problem in each scene.", "Rate frequency, pain and willingness to pay (1–5).", "Problem or solution? 3 quick rounds.", "Write your problem statement with 5 parts."], win: [["Base", "+20 🪙"], ["Each round right on the first try", "+2 🪙"]], tip: "Score = F × P × W. The best problems are frequent, painful and already paid for." },
  c1_team: { goal: "Found your company: create or join a team, choose your role, your product type and your team pact.", steps: ["One person creates the team and shares the code.", "The others join with the code.", "Choose your role and a PHYSICAL product type.", "Write 3 team rules."], win: [["Team pact sealed", "+24 🪙"]], tip: "No internet? Use an offline team and type your teammates' names." },
  c2_read: B_READ("Learn from New Coke why a huge taste test gave the wrong answer.", "Next: the Interview Simulator."),
  c2_interview: { goal: "Interview 3 fictional customers with only 4 questions each. Good questions unlock insights; bad ones give polite lies.", steps: ["Choose your questions carefully.", "Read the answers: some are traps.", "Write a summary with what you learned."], win: [["Base", "+14 🪙"], ["Each insight found (max 9)", "+2 🪙"]], tip: "Ask about the PAST and real behavior — not 'Would you buy…?'" },
  c2_zone: { goal: "TEAM ZONE: interview at least 5 REAL people (classmates, teachers, family) about your problem.", steps: ["Write 5 good questions together.", "Interview 5 people and log pain (1–5), what they pay today and a quote.", "Find one surprise.", "Decide: keep, adjust or change the idea."], win: ZONE_WIN(30), tip: "Your persona and your price will use these real numbers." },
  c2_persona: { goal: "Turn your real interviews into one customer persona you will design for.", steps: ["Check your interview numbers.", "Choose a segment and an avatar.", "Fill the 6 parts of your persona.", "Download it as PNG."], win: [["Saving your persona", "+26 🪙"]] },
  c3_builder: { goal: "Design your MVP: a base product + max 3 features, inside your persona's budget.", steps: ["Choose the base product.", "Add max 3 features: each one costs money and gives value.", "Stay below 50% of what your customer spends.", "Name the product and explain the choice."], win: [["Saving your MVP", "+30 🪙"]], tip: "MVP = Minimum Viable Product: the simplest version that lets you learn." },
  c3_canvas: { goal: "Design the label of your prototype — then print it and stick it on the real product.", steps: ["Name, flavor and content.", "Max 3 claims.", "Choose colors with contrast.", "Download the PNG and print it."], win: [["Saving your label", "+24 🪙"]] },
  c3_zone: { goal: "TEAM ZONE: make prototype v1 for real, test it with 3 people and improve it.", steps: ["Make the first prototype (real!).", "Taste/use test with 3 people (score 1–10).", "Write what you will change for v2.", "Record what the prototype really cost."], win: ZONE_WIN(32) },
  c3_benefit: { goal: "Turn features into benefits your customer feels.", steps: ["4 rounds: find the real benefit.", "Write a benefit for each of YOUR features with 'you/your'."], win: [["Base", "+14 🪙"], ["Each round right on the first try", "+2 🪙"]] },
  c4_video: B_VIDEO("Watch how brands use color psychology — you'll use it to design your logo.", "Next: Name & Tagline Lab."),
  c4_read: B_READ("Discover how Juan Valdez made Colombian coffee a world brand.", "Next: Logo Builder."),
  c4_name: { goal: "Create 4 name candidates, test them, choose a winner, write a tagline and your brand promise.", steps: ["Write 4 different names.", "Test each one with the 5 checks.", "Choose the winner.", "Write a 2–6 word tagline and one brand promise."], win: [["Saving your brand name", "+26 🪙"]] },
  c4_logo: { goal: "Design your logo with shape, symbol, 2 colors and typography — and justify the colors with the video.", steps: ["Choose a shape and a symbol.", "Choose 2 colors (read their meaning).", "Check the contrast.", "Explain why these colors speak to YOUR customer."], win: [["Saving your logo", "+30 🪙"]], tip: "Your teammates can use the same logo: the last one saved appears for them." },
  c4_zone: { goal: "TEAM ZONE: make your brand physical — label, logo on the product and a recognition test.", steps: ["Print or draw the logo and label.", "Put it on the prototype.", "Ask 3 people what the brand makes them feel.", "Decide one improvement."], win: ZONE_WIN(26) },
  c5_read: B_READ("Learn from JC Penney why price is a number AND a feeling.", "Next: Cost Builder."),
  c5_cost: { goal: "Calculate your REAL unit cost with prices you research on your tablet.", steps: ["List 4+ ingredients/materials with the real package price and source.", "Write how much one batch uses.", "Add packaging, work hours and other costs.", "Get your unit cost."], win: [["Saving your unit cost", "+32 🪙"]], tip: "Count your time: if you don't, the business only LOOKS profitable." },
  c5_price: { goal: "Choose your price with 3 methods and a demand curve built from your interviews.", steps: ["Cost-plus: choose a markup.", "Write 3 real competitor prices.", "Read the profit curve.", "Choose your price and justify it with numbers."], win: [["Saving your price", "+32 🪙"]] },
  c5_zone: { goal: "TEAM ZONE: test your price with 6 real people.", steps: ["Show the product with 3 different prices.", "Log who would buy at each price.", "Count the 'yes' answers.", "Decide your final price."], win: ZONE_WIN(26), tip: "Your yes-% becomes the conversion of your forecast." },
  c6_read: B_READ("Discover how Juicero lost US$120 million with an unrealistic forecast.", "Next: Market Funnel."),
  c6_market: { goal: "Build your sales forecast from the whole market down to real buyers — and check production capacity.", steps: ["Move the 5 sliders with evidence.", "Read units per week and month.", "Check if you can produce them."], win: [["Saving your forecast", "+26 🪙"]] },
  c6_break: { goal: "Find how many units you must sell to cover your fixed costs.", steps: ["List your fixed costs.", "Check price and variable cost.", "Read the chart: where the lines cross.", "Solve 3 check rounds."], win: [["Base", "+20 🪙"], ["Each round right on the first try", "+3 🪙"]] },
  c6_launch: { goal: "Run your stand for 10 school days: decide production and promotion every morning.", steps: ["Read the morning news.", "Choose how many units to make and a promotion.", "Avoid waste AND lost sales.", "Write your launch report."], win: [["Depends on your profit", "+18 to +34 🪙"]], tip: "Perishable products: what you don't sell today goes to the trash." },
  c7_campaign: { goal: "Spend a $150,000 marketing budget and keep your CAC below your margin.", steps: ["Add channels (+/−).", "Watch reach, buyers and CAC.", "Stay inside the budget.", "Write your marketing plan."], win: [["Saving your campaign", "+30 🪙"]] },
  c7_post: { goal: "Design your launch post with the 6 rules that make people stop scrolling.", steps: ["Headline and offer.", "Caption: hook, 'you', call to action, hashtags.", "Check the 6 rules.", "Download it — and publish it for real."], win: [["Saving your post", "+26 🪙"]] },
  c7_zone: { goal: "TEAM ZONE: make your campaign real and collect REAL pre-orders.", steps: ["Make a poster or stand sign.", "Publish your post or share it in groups.", "Write down every real pre-order.", "Count the total units."], win: ZONE_WIN(30) },
  c7_fair: { goal: "Publish your product in the Pre-order Fair and pre-order from your classmates with 100 coins.", steps: ["Publish your product card.", "Open other products and ask one question.", "Pre-order what you would really buy.", "Evaluate at least 2 products."], win: [["Base", "+18 🪙"], ["Each product evaluated (up to 5)", "+4 🪙"]] },
  c8_audit: { goal: "Compare your forecast, your Launch Week simulation and your REAL pre-orders.", steps: ["Check the three numbers.", "Read your accuracy.", "Explain what the difference teaches you."], win: [["Saving your audit", "+26 🪙"]] },
  c8_pitch: { goal: "THE PERIOD 1 PROJECT: present your product launch with evidence, numbers and answers.", steps: ["Check your evidence board.", "Answer 3 hard questions.", "Present as a team (3–4 minutes).", "Your classmate-jury rates you."], win: [["Evidence + answers + jury", "required"], ["Product Builder certificate", "+46 🪙"], ["Each evidence line", "+2 🪙"]], tip: "Only the evidence you earned appears on the certificate." },
  c8_boss: { goal: "Beat the Period 1 boss and unlock your first Founder Card.", steps: ["Part 1: 5 missions with numbers.", "Part 2: 10 questions.", "Read your feedback by topic."], win: [["70% or more", "Founder Card 🛠️"], ["Each question right", "+4 🪙"], ["Each mission on the first try", "+4 🪙"]] },
  c8_can: { goal: "Look back: what can you do now that you couldn't do 8 classes ago?", steps: ["Read each 'I can' and your evidence.", "Rate yourself honestly.", "Write what you're proudest of."], win: [["Saving your recap", "+20 🪙"]] },
};

/* =====================================================================
   ESTRUCTURA · 11° PERIODO 1 · STARTUP STUDIO (8 clases)
   ===================================================================== */
const G11P1_WEEKS = [
  { n: 1, title: "Founder Reboot", e: "🚀", blurb: "Your last FinFluent year starts: a radar, a real problem and a team.", skills: ["Radar", "Reading", "Hunter", "Team"], acts: [
    A11("c1_radar", "Founder Radar 11 🧭", "Day 1: 10 situations · 5 pillars.", <Compass size={22} />, 25, "comportamiento"),
    A11("c1_read", "Reading: Three Air Mattresses 📰", "The CREAR Times · 8 questions.", <Newspaper size={22} />, 42, "quizzes"),
    A11("c1_hunter", "Problem Hunter 🎯", "8 scenes · score · problem statement.", <Search size={22} />, 26, "aprendi"),
    A11("c1_team", "Team Up 🤝", "Create or join your company.", <Users size={22} />, 24, "comportamiento"),
  ] },
  { n: 2, title: "Customer Discovery", e: "🔍", blurb: "Talk to customers like a professional — and find what they really need.", skills: ["Reading", "Interviews", "Team Zone", "Persona"], acts: [
    A11("c2_read", "Reading: The Taste Test That Lied 📰", "New Coke, 1985 · 8 questions.", <Newspaper size={22} />, 42, "quizzes"),
    A11("c2_interview", "Interview Simulator 🎙️", "3 customers · 4 questions each.", <Mic size={22} />, 32, "aprendi"),
    A11("c2_zone", "Team Zone · Real Interviews 🧑‍🤝‍🧑", "5 real people · pain · price.", <Users size={22} />, 30, "aprendi"),
    A11("c2_persona", "Persona Builder 👤", "One customer from real data.", <User size={22} />, 26, "aprendi"),
  ] },
  { n: 3, title: "Product Design", e: "🧪", blurb: "Design your MVP, label it, make it for real and turn features into benefits.", skills: ["Builder", "Label", "Team Zone", "Benefits"], acts: [
    A11("c3_builder", "Product Builder 🧪", "Base + 3 features · budget.", <FlaskConical size={22} />, 30, "aprendi"),
    A11("c3_canvas", "Label Studio 🏷️", "Design and print your label.", <Tag size={22} />, 24, "aprendi"),
    A11("c3_zone", "Team Zone · Prototype v1 🧑‍🤝‍🧑", "Make it · test it · improve it.", <Users size={22} />, 32, "aprendi"),
    A11("c3_benefit", "Feature → Benefit Lab 💬", "4 rounds + your benefits.", <Sparkles size={22} />, 22, "aprendi"),
  ] },
  { n: 4, title: "Brand Studio", e: "🎨", blurb: "Colors, a name, a tagline and a logo that tell one true story.", skills: ["Video", "Reading", "Name", "Logo", "Team Zone"], acts: [
    A11("c4_video", "Video: Color Psychology 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A11("c4_read", "Reading: A Brand Built by Farmers 📰", "Juan Valdez · 8 questions.", <Newspaper size={22} />, 42, "quizzes"),
    A11("c4_name", "Name & Tagline Lab ✨", "4 names · 5 tests · 1 promise.", <PenLine size={22} />, 26, "aprendi"),
    A11("c4_logo", "Logo Builder 🎨", "Shape · symbol · 2 colors · font.", <Palette size={22} />, 30, "aprendi"),
    A11("c4_zone", "Team Zone · Brand in Real Life 🧑‍🤝‍🧑", "Label on the product + test.", <Users size={22} />, 26, "aprendi"),
  ] },
  { n: 5, title: "Unit Economics", e: "💰", blurb: "Your real unit cost, three ways to price — and a test with real people.", skills: ["Reading", "Costs", "Pricing", "Team Zone"], acts: [
    A11("c5_read", "Reading: The Price Experiment 📰", "JC Penney · 8 questions.", <Newspaper size={22} />, 42, "quizzes"),
    A11("c5_cost", "Cost Builder 🧮", "Real prices · batch · unit cost.", <Calculator size={22} />, 32, "aprendi"),
    A11("c5_price", "Pricing Lab 🏷️", "3 methods + demand curve.", <Tag size={22} />, 32, "aprendi"),
    A11("c5_zone", "Team Zone · Price Test 🧑‍🤝‍🧑", "6 people · 3 prices.", <Users size={22} />, 26, "aprendi"),
  ] },
  { n: 6, title: "Forecast & Break-even", e: "📊", blurb: "How many will you sell — and how many must you sell?", skills: ["Reading", "Funnel", "Break-even", "Launch Week"], acts: [
    A11("c6_read", "Reading: US$120 Million for a Juice Press 📰", "Juicero · 8 questions.", <Newspaper size={22} />, 42, "quizzes"),
    A11("c6_market", "Market Funnel 🔭", "From the market to real buyers.", <Target size={22} />, 26, "aprendi"),
    A11("c6_break", "Break-even Lab ⚖️", "Fixed costs · chart · 3 rounds.", <Scale size={22} />, 29, "aprendi"),
    A11("c6_launch", "Launch Week 🚀", "10 days · events · waste.", <Rocket size={22} />, 34, "aprendi"),
  ] },
  { n: 7, title: "Marketing & Pre-sales", e: "📣", blurb: "Plan the campaign, design the post and get REAL pre-orders.", skills: ["Campaign", "Post", "Team Zone", "Fair"], acts: [
    A11("c7_campaign", "Campaign Builder 📣", "$150,000 · CAC vs. margin.", <Megaphone size={22} />, 30, "aprendi"),
    A11("c7_post", "Post Maker 📱", "6 rules to stop the scroll.", <Smartphone size={22} />, 26, "aprendi"),
    A11("c7_zone", "Team Zone · Real Pre-orders 🧑‍🤝‍🧑", "Poster · post · orders list.", <Users size={22} />, 30, "aprendi"),
    A11("c7_fair", "Pre-order Fair 🛍️", "Publish · pre-order with coins.", <Store size={22} />, 38, "aprendi"),
  ] },
  { n: 8, title: "Launch Day", e: "🎤", blurb: "Audit reality, pitch your launch, beat the boss and see what you can do.", skills: ["Audit", "Pitch", "Boss", "Recap"], acts: [
    A11("c8_audit", "Launch Audit 🔍", "Forecast vs. reality.", <Search size={22} />, 26, "aprendi"),
    A11("c8_pitch", "Launch Pitch 🎤 · THE PROJECT", "Evidence · Q&A · present · certificate.", <Mic size={22} />, 58, "aprendi"),
    A11("c8_boss", "Boss P1 + Founder Card ⚔️", "5 missions + 10 questions (70%).", <Swords size={22} />, 70, "quizzes"),
    A11("c8_can", "What I Can Do Now ✅", "Recap with evidence.", <BadgeCheck size={22} />, 20, "comportamiento"),
  ] },
];

const ZONES_P1 = {
  c2_zone: { title: "Team Zone · Real Interviews 🧑‍🤝‍🧑", subtitle: "Today's goals happen in real life: go out and talk to 5 people.", goals: [
    { k: "qs", e: "📝", t: "Write 5 good interview questions (past behavior, no pushing)", words: 12, ph: "Q1: When did you last…? Q2: What did you pay…?" },
    { k: "int", e: "🎙️", t: "Interview 5 real people", d: "Pain 1–5 · what they pay TODAY for a solution · one quote.", cols: [{ k: "who", l: "Who (role)", ph: "11th grader" }, { k: "pain", l: "Pain 1–5", type: "num", ph: "4" }, { k: "wtp", l: "Pays today $", type: "num", ph: "5000" }, { k: "quote", l: "Quote", ph: "“I'm always thirsty after…”" }], min: 5 },
    { k: "surprise", e: "😮", t: "One thing that surprised us", ph: "Nobody cared about…, but everybody…" },
    { k: "decide", e: "🧭", t: "Decision: keep, adjust or change the idea — and why", ph: "We adjust: less sugar because…" },
  ], coins: 30, minutes: 35 },
  c3_zone: { title: "Team Zone · Prototype v1 🧑‍🤝‍🧑", subtitle: "Make it for real. A prototype on the table teaches more than 10 meetings.", goals: [
    { k: "make", e: "🧪", t: "Make prototype v1 (real product)", ph: "We made 6 mango gelatins with chia…" },
    { k: "taste", e: "👅", t: "Test with 3 people outside the team", cols: [{ k: "who", l: "Who", ph: "Teacher" }, { k: "score", l: "Score 1–10", type: "num", ph: "8" }, { k: "comment", l: "Comment", ph: "Too sweet" }], min: 3 },
    { k: "v2", e: "🔁", t: "What we change for v2", ph: "Less sugar and a bigger cup because…" },
    { k: "cost", e: "💸", t: "What the prototype really cost us", kind: "num", money: true, ph: "18000" },
  ], coins: 32, minutes: 40 },
  c4_zone: { title: "Team Zone · Brand in Real Life 🧑‍🤝‍🧑", subtitle: "Your brand has to live on the product, not only on the screen.", goals: [
    { k: "print", e: "🖨️", t: "Print or draw the logo and the label", ph: "We printed 10 labels in color" },
    { k: "stick", e: "🏷️", t: "Put the label on the prototype (photo or description)", ph: "Label on the lid; logo in front" },
    { k: "feel", e: "💭", t: "Ask 3 people: what does our brand make you feel?", cols: [{ k: "who", l: "Who", ph: "Classmate" }, { k: "feel", l: "Feeling / word", ph: "Fresh, natural" }], min: 3 },
    { k: "fix", e: "🛠️", t: "One improvement to the brand", ph: "The name is hard to read, so…" },
  ], coins: 26, minutes: 30 },
  c5_zone: { title: "Team Zone · Price Test 🧑‍🤝‍🧑", subtitle: "Show the product and a price. Watch the face — then write the answer.", goals: [
    { k: "prices", e: "🏷️", t: "Choose 3 prices to test (low, medium, high)", ph: "$2,500 · $3,000 · $3,500" },
    { k: "test", e: "🧪", t: "Test with 6 people (2 per price)", cols: [{ k: "who", l: "Who", ph: "Mom" }, { k: "price", l: "Price shown $", type: "num", ph: "3000" }, { k: "buy", l: "Would buy? (yes/no)", ph: "yes" }], min: 6 },
    { k: "final", e: "✅", t: "Our final price and why", ph: "$3,000: 4 of 6 said yes and…" },
  ], coins: 26, minutes: 30 },
  c7_zone: { title: "Team Zone · Real Pre-orders 🧑‍🤝‍🧑", subtitle: "Today you sell for real (pre-orders). Every order goes in the list.", goals: [
    { k: "poster", e: "🖼️", t: "Make a poster or a stand sign", ph: "A3 poster with logo, price and QR" },
    { k: "share", e: "📱", t: "Publish the post or share it in 2 groups", ph: "Posted on @freshup.crear; 2 WhatsApp groups" },
    { k: "pre", e: "🧾", t: "Real pre-orders list", cols: [{ k: "who", l: "Customer", ph: "Laura 10B" }, { k: "units", l: "Units", type: "num", ph: "2" }, { k: "paid", l: "Paid? (yes/no)", ph: "yes" }], min: 3 },
    { k: "learn", e: "💡", t: "What made people say yes (or no)", ph: "The free sample convinced…" },
  ], coins: 30, minutes: 40 },
};

const CFG111 = {
  n: 1, KEY: "11P1", title: "Startup Studio: Build It 🛠️",
  question: "Can your team turn a real problem into a physical product that people actually pay for?",
  howyear: "Your team builds a REAL product: problem, customers, prototype, brand, costs, price, forecast and pre-orders. Team Zones happen in real life; the project ends with your Launch Pitch.",
  chips: ["🧑‍🤝‍🧑 Teams", "🧪 Physical product", "🎤 Launch Pitch"], bigKeys: ["c8_pitch"], pageKeys: ["c2_zone", "c3_zone", "c4_zone", "c5_zone", "c7_zone"],
  weeks: G11P1_WEEKS,
  panel: (ctx, compact) => { const r = P1r(ctx.resp); const co = co11(r); return <FounderPanel co={co} have={ctx.have} compact={compact} studentName={ctx.name} title="PERIOD 1 · BUILD IT" stats={[{ l: "🏷️ Price", v: co.price ? cop(co.price) : "—" }, { l: "🧮 Unit cost", v: co.unit ? cop(co.unit) : "—" }, { l: "⚖️ Break-even", v: r.c6_break?.be ? `${r.c6_break.be} u.` : "—" }, { l: "🧾 Pre-orders", v: r.c8_audit ? String(r.c8_audit.real) : "—" }]} />; },
  render: (act, ctx) => {
    const P = { onSave: ctx.save, onExit: ctx.exit };
    const L = mkLearn(ctx, Brief91);
    const Z = ZONES_P1[act];
    if (Z) return <TeamZone {...Z} brief={<Brief91 k={act} />} resp={ctx.resp} existing={ctx.existing} {...P} />;
    switch (act) {
      case "c1_radar": return <Radar11Day1 existing={ctx.existing} {...P} />;
      case "c1_read": return L.reading("c1_read", "Three Air Mattresses and a Rent Problem", "How Airbnb started — and why a business begins with a problem.", READ_AIRBNB, GLOSS_AIRBNB, Q_AIRBNB, "📰");
      case "c1_hunter": return <ProblemHunter existing={ctx.existing} {...P} />;
      case "c1_team": return <TeamHub userData={ctx.userData} API_URL={ctx.API_URL} existing={ctx.existing} brief={<Brief91 k="c1_team" />} {...P} />;
      case "c2_read": return L.reading("c2_read", "The Taste Test That Lied", "New Coke, 1985: big data, wrong question.", READ_COKE, GLOSS_COKE, Q_COKE, "📰");
      case "c2_interview": return <InterviewSim existing={ctx.existing} {...P} />;
      case "c2_persona": return <PersonaBuilder resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c3_builder": return <ProductBuilder resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c3_canvas": return <LabelCanvas resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c3_benefit": return <BenefitLab resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c4_video": return L.video("c4_video", VID_COLOR11, "Color Psychology in Branding", VQ_COLOR11);
      case "c4_read": return L.reading("c4_read", "A Brand Built by Farmers", "Juan Valdez: how a logo raised the price of Colombian coffee.", READ_VALDEZ, GLOSS_VALDEZ, Q_VALDEZ, "📰");
      case "c4_name": return <NameLab resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c4_logo": return <LogoBuilder resp={ctx.resp} existing={ctx.existing} ctx={ctx} {...P} />;
      case "c5_read": return L.reading("c5_read", "The Price Experiment That Cost Billions", "JC Penney, 2012: price is a number and a feeling.", READ_PENNEY, GLOSS_PENNEY, Q_PENNEY, "📰");
      case "c5_cost": return <CostBuilder resp={ctx.resp} existing={ctx.existing} ctx={ctx} {...P} />;
      case "c5_price": return <PricingLab resp={ctx.resp} existing={ctx.existing} ctx={ctx} {...P} />;
      case "c6_read": return L.reading("c6_read", "US$120 Million for a Juice Press", "Juicero: why forecasts must start from facts.", READ_JUICERO, GLOSS_JUICERO, Q_JUICERO, "📰");
      case "c6_market": return <MarketFunnel resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c6_break": return <BreakEvenLab resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c6_launch": return <LaunchWeek resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c7_campaign": return <CampaignBuilder resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c7_post": return <PostMaker resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c7_fair": return <PreorderFair resp={ctx.resp} userData={ctx.userData} API_URL={ctx.API_URL} existing={ctx.existing} {...P} />;
      case "c8_audit": return <LaunchAudit resp={ctx.resp} existing={ctx.existing} {...P} />;
      case "c8_pitch": return <LaunchPitch resp={ctx.resp} studentName={ctx.name} userData={ctx.userData} API_URL={ctx.API_URL} existing={ctx.existing} {...P} />;
      case "c8_boss": return <BossP1_11 resp={ctx.resp} studentName={ctx.name} {...P} />;
      case "c8_can": return <WhatICan title="What I Can Do Now ✅ · Period 1" items={CAN_P1} resp={P1r(ctx.resp)} existing={ctx.existing} brief={<Brief91 k="c8_can" />} {...P} />;
      default: return null;
    }
  },
};
export const Periodo1G11 = (props) => <PeriodShell10 cfg={CFG111} {...props} />;