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
import "../Styles/octavo4.css";   // 8° · Periodo 4 · piezas que se reutilizan
import "../Styles/noveno1.css";   // 9° · Periodo 1 · Financial District (base de noveno)
import "../Styles/noveno2.css";   // 9° · Periodo 2 · piezas que se reutilizan
import "../Styles/noveno3.css";   // 9° · Periodo 3 · piezas que se reutilizan
import "../Styles/noveno4.css";   // 9° · Periodo 4 · Global District
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   GRADO 9 · PERIODO 4 · GLOBAL DISTRICT (B1–B1+) · el periodo más corto (7 clases)
   Pregunta guía: How do the dollar, inflation, trade and sustainability change a
   business — and how can we create value for people and the planet?
   Hilo: FINANCIAL DISTRICT · Season 04 — la startup del Periodo 3 sale al mundo.
   El "mundo" (dólar, inflación, tasa) es IGUAL para todos; cada startup cambia con TUS decisiones.
   Cierre del año: Global Impact Report (proyecto grande), Radar 9 final, Year Wrapped y examen final.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "9P4" (lee también "9P1", "9P2" y "9P3"), Grado = "9".
   ===================================================================== */
const PERIOD_KEY = "9P4";
const GRADE = "9";
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


/* =====================================================================
   PIEZAS DE NOVENO · FINANCIAL DISTRICT (Season 01)
   El distrito es una simulación en código: TODOS empiezan con el mismo
   District Bank y el mismo saldo. Cada decisión cambia SU distrito.
   ===================================================================== */
const D0 = { me: 2000000, deposits: 100000000, cash: 20000000, loans: 70000000, other: 10000000, trust: 80, policy: 9, inflation: 9 };
const JOBS91 = [
  { id: "barista", e: "☕", n: "Barista", income: 1600000, d: "Stable salary · small daily payments" },
  { id: "designer", e: "🎨", n: "Graphic designer", income: 3000000, d: "Stable salary · saves for a trip" },
  { id: "nurse", e: "🩺", n: "Nurse", income: 3400000, d: "Stable salary · night shifts" },
  { id: "baker", e: "🥐", n: "Bakery owner", income: 4000000, d: "Business sales · they change every month" },
];
const AVATARS91 = ["🧑🏽", "👩🏻", "👨🏾", "👩🏽‍🦱", "🧑🏻‍🦰", "👩🏿", "🧔🏽", "👱🏼‍♀️"];
const SECTIONS91 = [
  { k: "bank", e: "🏦", t: "Banking Skills", keys: ["c2_builder", "c3_run"] },
  { k: "central", e: "🏛️", t: "Central Bank", keys: ["c4_desk"] },
  { k: "accounts", e: "💳", t: "Accounts", keys: ["c5_page"] },
  { k: "interest", e: "📈", t: "Interest Lab", keys: ["c6_page"] },
  { k: "credit", e: "📝", t: "Credit Office", keys: ["c7_page"] },
  { k: "inclusion", e: "🤝", t: "Inclusion Center", keys: ["c8_micro"] },
];
/* Páginas del portafolio del asesor (evidencias) */
const PAGES91 = [
  { n: "01", key: "c3_report", t: "My bank crisis report", e: "🚨" },
  { n: "02", key: "c5_page", t: "The right account", e: "💳" },
  { n: "03", key: "c6_page", t: "My bank pricing strategy", e: "📈" },
  { n: "04", key: "c7_page", t: "My loan decision", e: "📝" },
  { n: "05", key: "c8_micro", t: "Microfinance impact card", e: "🤝" },
];

/* Estado del distrito según TUS decisiones (todo sale de tus respuestas guardadas) */
function districtOf(r) {
  const d = { ...D0, steps: [] };
  const id = r?.c1_id;
  d.profile = id ? { name: id.name, avatar: id.avatar, job: JOBS91.find((j) => j.id === id.job) || JOBS91[1] } : null;
  const b = r?.c2_builder;
  if (b) { d.reserve = b.reserve; d.cash = Math.round(d.deposits * b.reserve / 100); d.loans = d.deposits - d.cash - d.other; d.steps.push(`Reserve ${b.reserve}%`); }
  else d.reserve = 20;
  const run = r?.c3_run;
  if (run) { d.trust = run.trust; d.deposits = run.deposits; d.cash = run.cash; d.loans = run.loans; d.survived = run.survived; d.withdrew = run.withdrew; d.steps.push(run.survived ? "Survived the bank run" : "Bank run damage"); }
  const cb = r?.c4_desk;
  if (cb) { d.policy = cb.policy; d.inflation = cb.inflation; d.steps.push(`Policy rate ${cb.policy}%`); }
  const acc = r?.c5_detective;
  if (acc) { d.account = acc.mine; d.me -= acc.mineCost || 0; d.steps.push(`Account: ${acc.mineName}`); }
  const im = r?.c6_machine;
  if (im && !d.withdrew) { d.dep = im.dep; d.lend = im.lend; d.profit = im.profit; d.me += Math.round(d.me * im.dep / 100); d.steps.push(`Rates ${im.dep}% / ${im.lend}%`); }
  const lc = r?.c7_committee;
  if (lc) { d.loans += lc.lent || 0; d.deposits += lc.lent || 0; d.badLoans = lc.bad || 0; d.trust = Math.max(0, Math.min(100, d.trust + (lc.trustDelta || 0))); d.steps.push(`Loans approved: ${lc.approved || 0}`); }
  const mi = r?.c8_micro;
  if (mi) { d.helped = mi.helped; d.steps.push(`People included: ${mi.helped}`); }
  d.reserveNow = d.deposits > 0 ? Math.round((d.cash / d.deposits) * 100) : 0;
  return d;
}

/* ---------- PANEL DEL DISTRITO (permanente) ---------- */
function DistrictPanel({ resp, compact, studentName }) {
  const r = resp || {};
  const D = districtOf(r);
  const pages = PAGES91.filter((p) => r[p.key]).length;
  return (
    <div className={`g91-district ${compact ? "compact" : ""}`}>
      <header>
        <em className="g91-avatar">{D.profile?.avatar || "🏙️"}</em>
        <div>
          <small>🏙️ FINANCIAL DISTRICT · SEASON 01{studentName && !compact ? ` · ${studentName.split(" ")[0]}` : ""}</small>
          <b>{D.profile ? `${D.profile.name} · ${D.profile.job.e} ${D.profile.job.n}` : "New citizen"}</b>
          <span>{D.profile ? `Income ${cop(D.profile.job.income)}/month · client of the District Bank` : "Class 1 · get your District ID"}</span>
        </div>
        <i>{pages}/{PAGES91.length} advisor pages{r.c8_guide ? " · 🏆 certified" : ""}</i>
      </header>
      <div className="g91-tiles">
        <div className="me"><small>🙋 My balance</small><b>{cop(D.me)}</b><span>{D.withdrew ? "💵 cash at home (no interest)" : D.account ? `in a ${D.account} account` : "in the District Bank"}</span></div>
        <div><small>🏦 Bank deposits</small><b>{cop(D.deposits)}</b><span>money people saved</span></div>
        <div><small>💵 Cash in the vault</small><b>{cop(D.cash)}</b><span>reserve {D.reserveNow}%</span></div>
        <div><small>📝 Loans</small><b>{cop(D.loans)}</b><span>{D.badLoans ? `⚠️ ${cop(D.badLoans)} at risk` : "money lent to people"}</span></div>
        <div><small>🤝 Trust</small><b>{D.trust}%</b><div className="g91-meter"><i style={{ width: `${D.trust}%`, background: D.trust >= 60 ? "#16b074" : D.trust >= 35 ? "#f5b23e" : "#ff6b57" }} /></div></div>
        <div><small>🏛️ Policy rate</small><b>{D.policy}%</b><span>inflation {D.inflation}%</span></div>
      </div>
      {!compact && (
        <div className="g91-sections">
          {SECTIONS91.map((s) => { const on = s.keys.every((k) => r[k]); return <span key={s.k} className={on ? "on" : ""}><em>{on ? s.e : "🔒"}</em>{s.t}</span>; })}
          <span className={`final ${r.c8_guide ? "on" : ""}`}><em>{r.c8_guide ? "🏆" : "🔒"}</em>Certified Financial Advisor</span>
        </div>
      )}
    </div>
  );
}
function PBadge({ n }) {
  const p = PAGES94.find((x) => x.n === n);
  if (!p) return null;
  return <div className="g8-bpbadge g91-badge"><span>🧾 FOUNDER PAGE {p.n}</span><b>{p.e} {p.t}</b></div>;
}
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
const lowFirst = (t) => String(t || "").replace(/^./, (c) => c.toLowerCase());
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

/* =====================================================================
   FINANCIAL DISTRICT · SEASON 02 · THE PRODUCT LAB
   Cada estudiante sigue con SU ciudadano del Periodo 1 (avatar, trabajo, saldo final).
   Los productos que elige (tarjeta, fondo, billetera, cripto…) cambian SU temporada.
   Todo está en código: no se necesita hoja nueva.
   ===================================================================== */
const PAGES92 = [
  { n: "06", key: "c2_page", t: "My credit card survival guide", e: "💳" },
  { n: "07", key: "c4_page", t: "My investment portfolio", e: "📈" },
  { n: "08", key: "c5_page", t: "My future financial plan", e: "🧓" },
  { n: "09", key: "c7_crypto", t: "Blockchain & crypto: what I understand", e: "⛓️" },
  { n: "10", key: "c8_shield", t: "My scam protection plan", e: "🛡️" },
];
const SECTIONS92 = [
  { e: "💳", t: "Cards", keys: ["c2_cards"] },
  { e: "🚐", t: "Financing", keys: ["c3_lab"] },
  { e: "📈", t: "Investments", keys: ["c4_market"] },
  { e: "🧓", t: "Pensions", keys: ["c5_time"] },
  { e: "📱", t: "FinTech", keys: ["c6_tower"] },
  { e: "⛓️", t: "Blockchain", keys: ["c7_block"] },
  { e: "🛡️", t: "Scam Shield", keys: ["c8_shield"] },
];
const LEASE_N = { cash: "💵 Cash purchase", loan: "🏦 Vehicle loan", lease: "📄 Financial leasing" };

/* Estado de la temporada según TUS decisiones */
function seasonOf(r) {
  const p1 = r?.__p1 || {};
  const D1 = districtOf(p1);
  const hasP1 = !!p1.c1_id;
  const s = { start: Math.round(hasP1 ? D1.me : D0.me), profile: D1.profile, hasP1 };
  s.cash = s.start; s.debt = 0; s.inv = 0; s.crypto = 0; s.future = 0; s.shield = null; s.health = 70;
  const c = r?.c2_cards;
  if (c) { s.cash -= (c.wantsSpent || 0) + (c.interest || 0) + (c.fees || 0); s.debt = c.debt || 0; s.health = c.health ?? 70; }
  const w = r?.c6_tower;
  if (w) { s.cash -= (w.myFees || 0) * 3; s.wallet = w.walletName; }
  const p7 = r?.c4_page, m = r?.c4_market;
  if (p7 && (m || p7.ret != null)) { const put = Math.round(s.cash * (p7.pct || 0) / 100); s.cash -= put; s.invPut = put; s.inv = Math.round(put * (1 + ((p7.ret ?? m?.ret) || 0) / 100)); }
  const cr = r?.c7_crypto;
  if (cr) { const put = Math.round(s.cash * (cr.pct || 0) / 100); s.cash -= put; s.cryptoPut = put; s.crypto = Math.round(put * (cr.mult ?? 1)); }
  const sh = r?.c8_shield;
  if (sh) { s.cash -= sh.loss || 0; s.shield = sh.score; }
  const t = r?.c5_time;
  if (t) s.future = t.projected || 0;
  s.lease = r?.c3_lab?.choice;
  s.net = s.cash + s.inv + s.crypto - s.debt;
  return s;
}

/* ---------- PANEL DE LA TEMPORADA (permanente) ---------- */
function SeasonPanel({ resp, compact, studentName }) {
  const r = resp || {};
  const S = seasonOf(r);
  const pages = PAGES92.filter((p) => r[p.key]).length;
  return (
    <div className={`g91-district g92-season ${compact ? "compact" : ""}`}>
      <header>
        <em className="g91-avatar">{S.profile?.avatar || "🧪"}</em>
        <div>
          <small>🧪 FINANCIAL DISTRICT · SEASON 02 · THE PRODUCT LAB{studentName && !compact ? ` · ${studentName.split(" ")[0]}` : ""}</small>
          <b>{S.profile ? `${S.profile.name} · ${S.profile.job.e} ${S.profile.job.n}` : "New citizen"}</b>
          <span>{S.hasP1 ? `You start Season 02 with your Season 01 balance: ${cop(S.start)}` : `No Season 01 data — you start with ${cop(S.start)}`}</span>
        </div>
        <i>{pages}/{PAGES92.length} advisor pages{r.c8_fair ? " · 🏆 product advisor" : ""}</i>
      </header>
      <div className="g91-tiles">
        <div className="me"><small>💰 My cash</small><b>{cop(S.cash)}</b><span>net worth {cop(S.net)}</span></div>
        <div><small>💳 Card debt</small><b>{cop(S.debt)}</b><span>credit health {S.health}/100</span></div>
        <div><small>📈 Investments</small><b>{cop(S.inv)}</b><span>{S.invPut ? `put in ${cop(S.invPut)} · hypothetical` : "not invested yet"}</span></div>
        <div><small>🪙 Crypto</small><b>{cop(S.crypto)}</b><span>{S.cryptoPut ? `bought ${cop(S.cryptoPut)}` : "none"}</span></div>
        <div><small>🧓 Future Self at 65</small><b>{S.future ? cop(S.future) : "—"}</b><span>hypothetical plan</span></div>
        <div><small>🛡️ Scam shield</small><b>{S.shield == null ? "—" : `${S.shield}%`}</b>{S.shield != null ? <div className="g91-meter"><i style={{ width: `${S.shield}%`, background: S.shield >= 70 ? "#16b074" : S.shield >= 40 ? "#f5b23e" : "#ff6b57" }} /></div> : <span>Class 8</span>}</div>
      </div>
      {!compact && (
        <div className="g91-sections">
          {SECTIONS92.map((x) => { const on = x.keys.every((k) => r[k]); return <span key={x.t} className={on ? "on" : ""}><em>{on ? x.e : "🔒"}</em>{x.t}</span>; })}
          <span className={`final ${r.c8_fair ? "on" : ""}`}><em>{r.c8_fair ? "🏆" : "🔒"}</em>Financial Product Advisor</span>
        </div>
      )}
    </div>
  );
}
/* Toca una serie de opciones en el orden correcto */
function OrderTap({ items, onDone }) {
  const [order] = useState(() => shuffleArr(items.map((_, k) => k)));
  const [picked, setPicked] = useState([]);
  const [bad, setBad] = useState(null);
  const tap = (k) => { if (picked.includes(k)) return; if (k === picked.length) { const n = [...picked, k]; setPicked(n); setBad(null); if (n.length === items.length) onDone && onDone(); } else setBad(k); };
  return (
    <div className="g92-order">
      <div className="g92-order-done">{picked.map((k, i) => <span key={k}><b>{i + 1}</b>{items[k]}</span>)}</div>
      <div className="g84-chips">{order.filter((k) => !picked.includes(k)).map((k) => <button key={k} type="button" className={bad === k ? "no" : ""} onClick={() => tap(k)}>{items[k]}</button>)}</div>
      {bad !== null && <p className="g91-note neg">Not yet — what should happen BEFORE that?</p>}
    </div>
  );
}
const W_VOCAB = (words, n = 3) => ({ l: `Use ${n} key words`, test: (t) => words.filter((w) => new RegExp(`\\b${w}`, "i").test(t || "")).length >= n, ex: words.slice(0, 5).join(" · ") });

/* =====================================================================
   FINANCIAL DISTRICT · SEASON 03 · STARTUP DISTRICT
   Cada estudiante funda UNA startup en la clase 1 y la misma empresa
   evoluciona hasta la Business Fair. Todos reciben el mismo capital semilla.
   Su ciudadano (P1) y su patrimonio personal (P2) continúan.
   ===================================================================== */
const SEED93 = 5000000;
const PAGES93 = [
  { n: "11", key: "c1_map", t: "My opportunity map", e: "🗺️" },
  { n: "12", key: "c2_surgery", t: "My value proposition card", e: "💎" },
  { n: "13", key: "c3_architect", t: "My business model canvas", e: "🧩" },
  { n: "14", key: "c4_mine", t: "My pricing strategy", e: "🏷️" },
  { n: "15", key: "c5_negotiate", t: "My investment deal", e: "🦈" },
  { n: "16", key: "c6_campaign", t: "My digital campaign", e: "📣" },
  { n: "17", key: "c7_life", t: "My life at 25 plan", e: "🧑‍💼" },
];
const SECTIONS93 = [
  { e: "🔎", t: "Opportunity", keys: ["c1_map"] }, { e: "💎", t: "Value", keys: ["c2_surgery"] }, { e: "🧩", t: "Canvas", keys: ["c3_architect"] },
  { e: "🏷️", t: "Pricing", keys: ["c4_mine"] }, { e: "🦈", t: "Investors", keys: ["c5_negotiate"] }, { e: "📣", t: "Marketing", keys: ["c6_campaign"] }, { e: "🧑‍💼", t: "Life at 25", keys: ["c7_life"] },
];
/* Los 5 problemas de la ciudad = las 5 startups posibles (con su producto y costos) */
const PROBLEMS93 = [
  { id: "lunch", e: "🥗", who: "Sara, a student", prob: "Students spend too much money buying lunch — and it's not healthy.", place: "School", cust: "Students and parents",
    sols: [["A healthy lunch box you pre-order the day before", 5, 4, 5], ["A luxury food truck with imported food", 3, 4, 1], ["Tell students to stop eating lunch", 1, 1, 3]],
    prod: "Healthy lunch box", costs: [["Ingredients", 6000], ["Cooking (labor)", 2000], ["Packaging", 1000], ["Other", 1000]], ref: 15000, base: 420, fixed: 1500000, logos: ["🥗", "🍱", "🥪", "🍎"] },
  { id: "recycle", e: "♻️", who: "Don Jorge, a neighbor", prob: "People in the neighborhood don't know how to recycle plastic — bags pile up.", place: "Neighborhood", cust: "Families in apartments",
    sols: [["A weekly pick-up service with reward points", 5, 4, 4], ["Build a giant recycling factory", 4, 3, 1], ["Sell more plastic bags", 1, 1, 4]],
    prod: "Monthly pick-up plan", costs: [["Fuel", 3000], ["Collector (labor)", 4000], ["Bags", 500], ["App", 500]], ref: 14000, base: 300, fixed: 1200000, logos: ["♻️", "🌱", "🚲", "🌍"] },
  { id: "bakery", e: "🥐", who: "Doña Rosa, a baker", prob: "A local bakery throws away good bread and cakes every night.", place: "Local business", cust: "Students and workers who want cheap food",
    sols: [["An app to sell end-of-day “surprise bags” at a discount", 5, 5, 5], ["Bake much less, even if clients go home without bread", 2, 1, 3], ["Throw the food away faster", 1, 1, 5]],
    prod: "Surprise bag", costs: [["Food (bought cheap)", 2500], ["Labor", 1000], ["Packaging", 800], ["App fee", 700]], ref: 9000, base: 420, fixed: 800000, logos: ["🥐", "🛍️", "🎁", "🍞"] },
  { id: "digital", e: "👵", who: "Abuela Carmen", prob: "Older people have difficulty using digital payments and are afraid of scams.", place: "Community", cust: "Older adults and their families",
    sols: [["Small digital-skills classes with a simple, safe payment guide", 5, 4, 4], ["A robot that pays everything for them", 3, 5, 1], ["Tell them to use only cash forever", 1, 1, 4]],
    prod: "Digital skills class", costs: [["Teacher", 15000], ["Materials", 3000], ["Room", 5000], ["Other", 2000]], ref: 40000, base: 150, fixed: 1200000, logos: ["👵", "📱", "🤝", "💡"] },
  { id: "supplies", e: "✏️", who: "Mateo, a 7th grader", prob: "Students lose their school supplies all the time — and parents buy them again.", place: "School", cust: "Parents of young students",
    sols: [["Name stickers with a QR code for lost & found", 5, 4, 5], ["A supply locker with a guard in every classroom", 3, 3, 1], ["Buy cheaper supplies so losing them doesn't matter", 2, 1, 4]],
    prod: "QR name-tag pack", costs: [["Stickers", 3000], ["Printing", 1500], ["Packaging", 500], ["Other", 500]], ref: 10000, base: 350, fixed: 600000, logos: ["✏️", "🏷️", "🎒", "🔖"] },
];
const unitCost93 = (P) => P.costs.reduce((a, [, v]) => a + v, 0);
const demand93 = (P, price) => Math.round(Math.min(900, P.base * Math.pow(P.ref / price, 2.4)));

/* Estado de la startup según TUS decisiones */
function startupOf(r) {
  const p1 = r?.__p1 || {}, p2 = r?.__p2 || {};
  const D1 = districtOf(p1);
  const S2 = seasonOf({ ...p2, __p1: p1 });
  const st = { profile: D1.profile, personal: Math.round(S2.net), hasP2: !!p2.c1_pass, cash: SEED93, equity: 100, inv: 0 };
  const m = r?.c1_map;
  st.P = m ? PROBLEMS93.find((x) => x.id === m.prob) : null;
  st.name = m?.name; st.logo = m?.logo; st.customer = m?.customer;
  const a = r?.c3_architect, iv = r?.c3_investor;
  st.fixed = st.P ? st.P.fixed + (a?.extraFixed || 0) + (iv?.fixedDelta || 0) : 0;
  const pr = r?.c4_mine;
  st.price = pr?.price; st.cost = pr?.cost ?? (st.P ? unitCost93(st.P) : 0) + (a?.extraUnit || 0);
  st.customers = pr?.sales || 0;
  const n = r?.c5_negotiate;
  if (n?.amount) { st.cash += n.amount; st.inv = n.amount; st.equity = 100 - n.equity; }
  const c = r?.c6_campaign;
  if (c) { st.cash -= c.budget || 0; st.customers += c.newCustomers || 0; st.reach = c.reach; st.rep = c.rep; }
  st.margin = st.price ? st.price - st.cost : 0;
  st.profit = st.price ? Math.round(st.customers * st.margin - st.fixed) : null;
  return st;
}

/* ---------- PANEL DE LA STARTUP (permanente) ---------- */
function StartupPanel({ resp, compact, studentName }) {
  const r = resp || {};
  const S = startupOf(r);
  const pages = PAGES93.filter((p) => r[p.key]).length;
  return (
    <div className={`g91-district g93-startup ${compact ? "compact" : ""}`}>
      <header>
        <em className="g91-avatar">{S.logo || S.profile?.avatar || "🚀"}</em>
        <div>
          <small>🚀 FINANCIAL DISTRICT · SEASON 03 · STARTUP DISTRICT{studentName && !compact ? ` · ${studentName.split(" ")[0]}` : ""}</small>
          <b>{S.name ? `${S.name} · ${S.P.prod}` : "Your startup has no name yet"}</b>
          <span>{S.profile ? `Founder: ${S.profile.name} (${S.profile.job.n})` : "Founder"}{S.hasP2 ? ` · personal net worth from Season 02: ${cop(S.personal)}` : ""}</span>
        </div>
        <i>{pages}/{PAGES93.length} founder pages{r.c8_pitch ? " · 🏆 young entrepreneur" : ""}</i>
      </header>
      <div className="g91-tiles">
        <div className="me"><small>💰 Startup cash</small><b>{cop(S.cash)}</b><span>seed {cop(SEED93)} (same for all)</span></div>
        <div><small>🏷️ Price · margin</small><b>{S.price ? cop(S.price) : "—"}</b><span>{S.price ? `margin ${cop(S.margin)} / unit` : "Class 4"}</span></div>
        <div><small>👥 Customers / month</small><b>{S.customers || "—"}</b><span>{S.reach ? `campaign reach ${S.reach.toLocaleString("en-US")}` : "estimate"}</span></div>
        <div><small>📊 Monthly profit</small><b className={S.profit == null ? "" : S.profit >= 0 ? "pos" : "neg"}>{S.profit == null ? "—" : cop(S.profit)}</b><span>{S.fixed ? `fixed costs ${cop(S.fixed)}` : "after your canvas"}</span></div>
        <div><small>🦈 Investment</small><b>{S.inv ? cop(S.inv) : "—"}</b><span>you own {S.equity}%</span></div>
        <div><small>⭐ Reputation</small><b>{S.rep == null ? "—" : `${S.rep}%`}</b>{S.rep != null ? <div className="g91-meter"><i style={{ width: `${S.rep}%`, background: S.rep >= 70 ? "#16b074" : S.rep >= 40 ? "#f5b23e" : "#ff6b57" }} /></div> : <span>Class 6</span>}</div>
      </div>
      {!compact && (
        <div className="g91-sections">
          {SECTIONS93.map((x) => { const on = x.keys.every((k) => r[k]); return <span key={x.t} className={on ? "on" : ""}><em>{on ? x.e : "🔒"}</em>{x.t}</span>; })}
          <span className={`final ${r.c8_pitch ? "on" : ""}`}><em>{r.c8_pitch ? "🏆" : "🔒"}</em>Young Entrepreneur</span>
        </div>
      )}
    </div>
  );
}
/* Aviso cuando falta fundar la startup */
function NeedStartup({ resp }) {
  return startupOf(resp).P ? null : <div className="p1-banner bad"><span>🚀 First found your startup in Class 1 (“My Opportunity Map”). Until then, you will practice with a sample startup.</span></div>;
}
const sampleOr93 = (r) => { const S = startupOf(r); return S.P ? S : { ...S, P: PROBLEMS93[2], name: "SaveBite", logo: "🥐", fixed: PROBLEMS93[2].fixed, sample: true }; };
/* Cronómetro corto */
function useCountdown(sec, running) {
  const [left, setLeft] = useState(sec);
  useEffect(() => { if (!running) return undefined; const t = setInterval(() => setLeft((s) => (s <= 1 ? 0 : s - 1)), 1000); return () => clearInterval(t); }, [running]);
  return [left, () => setLeft(sec)];
}

/* =====================================================================
   FINANCIAL DISTRICT · SEASON 04 · GLOBAL DISTRICT
   La startup del Periodo 3 sale al mundo. El "mundo" es igual para todos
   (dólar, inflación, tasa); cada empresa reacciona con SUS decisiones.
   Todo en código: no se necesita hoja nueva.
   ===================================================================== */
const WORLD94 = { usd0: 3800, usd1: 4500, usd2: 4100, infl: 8.5, unemp: 9.2, gdp: 1.1, rate: 6 };
const PAGES94 = [
  { n: "18", key: "c1_map", t: "My startup's global map", e: "🗺️" },
  { n: "19", key: "c2_protect", t: "My currency risk strategy", e: "💵" },
  { n: "20", key: "c3_cost", t: "My economic survival plan", e: "🌡️" },
  { n: "21", key: "c4_export", t: "My export plan", e: "🚢" },
  { n: "22", key: "c5_invest", t: "My ESG scorecard", e: "🌱" },
  { n: "23", key: "c6_redesign", t: "My circular plan", e: "♻️" },
];
const BADGES94 = [
  { e: "🌍", t: "World Explorer", keys: ["c1_passport", "c1_rescue", "c1_map"] },
  { e: "💵", t: "Currency Master", keys: ["c2_coaster", "c2_escape", "c2_protect"] },
  { e: "🌡️", t: "Economy Pilot", keys: ["c3_cb", "c3_cost"] },
  { e: "🚢", t: "Export Expert", keys: ["c4_market", "c4_customs", "c4_export"] },
  { e: "🌱", t: "ESG Champion", keys: ["c5_detector", "c5_crisis", "c5_invest"] },
  { e: "♻️", t: "Circular Innovator", keys: ["c6_detective", "c6_redesign"] },
];
/* El insumo importado de cada startup del P3 (en dólares por unidad) */
const IMPORT94 = {
  lunch: { item: "imported quinoa and sauces", usd: 0.8 }, recycle: { item: "scanner app license", usd: 0.3 }, bakery: { item: "compostable packaging film", usd: 0.25 },
  digital: { item: "tablet software license", usd: 1.5 }, supplies: { item: "special QR sticker paper", usd: 0.4 },
};
const usdTxt = (v) => `US$${Number(v).toFixed(2)}`;

/* La startup global según TUS decisiones (parte del Periodo 3) */
function globalOf(r) {
  const p3 = r?.__p3 || {};
  const S3 = startupOf({ ...p3, __p1: r?.__p1, __p2: r?.__p2 });
  const P = S3.P || PROBLEMS93[2];
  const g = { S3, P, name: S3.name || "SaveBite", logo: S3.logo || "🥐", sample: !S3.P, profile: S3.profile };
  g.price = S3.price || Math.round(P.ref / 500) * 500;
  g.fixed = S3.fixed || P.fixed;
  g.sales = S3.customers || Math.round(demand93(P, g.price));
  const imp = IMPORT94[P.id];
  g.imp = imp;
  const m = r?.c1_map;
  g.usdIn = m?.usdIn ?? imp.usd;
  g.local = (S3.cost || unitCost93(P)) - Math.round(imp.usd * WORLD94.usd0) + (m?.localExtra || 0);
  g.usd = r?.c2_protect ? WORLD94.usd2 : r?.c1_map ? WORLD94.usd0 : WORLD94.usd0;
  const pr = r?.c2_protect;
  if (pr) { g.usdIn = pr.usdIn; g.local += pr.localExtra || 0; g.price = pr.price || g.price; g.sales = Math.round(g.sales * (pr.demandF || 1)); }
  const sv = r?.c3_cost;
  if (sv) { g.price = sv.price; g.fixed = sv.fixed; g.local = sv.local; g.sales = Math.round(g.sales * (sv.demandF || 1)); }
  const ci = r?.c6_redesign;
  if (ci) { g.local += ci.costDelta || 0; g.sales = Math.round(g.sales * (ci.demandF || 1)); g.waste = ci.waste; }
  g.rate = r?.c2_protect?.rateFix || g.usd;
  g.unit = Math.round(g.local + g.usdIn * g.rate);
  const ex = r?.c4_export;
  g.exportUSD = ex?.usdPrice; g.exportQty = ex?.qty || 0; g.exportProfit = ex?.profit || 0; g.market = ex?.market;
  const es = r?.c5_invest;
  g.esg = es?.score ?? r?.c5_crisis?.score ?? null;
  g.profit = Math.round(g.sales * (g.price - g.unit) - g.fixed + g.exportProfit);
  return g;
}

/* ---------- PANEL DE LA TEMPORADA GLOBAL (permanente) ---------- */
function GlobalPanel({ resp, compact, studentName }) {
  const r = resp || {};
  const G = globalOf(r);
  const pages = PAGES94.filter((p) => r[p.key]).length;
  return (
    <div className={`g91-district g94-global ${compact ? "compact" : ""}`}>
      <header>
        <em className="g91-avatar">{G.logo}</em>
        <div>
          <small>🌍 FINANCIAL DISTRICT · SEASON 04 · GLOBAL DISTRICT{studentName && !compact ? ` · ${studentName.split(" ")[0]}` : ""}</small>
          <b>{G.name} goes global{G.market ? ` · exporting to ${G.market}` : ""}</b>
          <span>{G.sample ? "Sample startup (found yours in Period 3)" : `Your Period 3 startup · ${G.P.prod}`}{G.profile ? ` · founder ${G.profile.name}` : ""}</span>
        </div>
        <i>{pages}/{PAGES94.length} founder pages{r.c7_report ? " · 🏆 global leader" : ""}</i>
      </header>
      <div className="g91-tiles">
        <div className="me"><small>💵 Dollar (world)</small><b>{cop(G.usd)}</b><span>same for everybody</span></div>
        <div><small>🏭 Unit cost</small><b>{cop(G.unit)}</b><span>{usdTxt(G.usdIn)} imported · {cop(G.price)} price</span></div>
        <div><small>👥 Customers / month</small><b>{G.sales}</b><span>in Colombia</span></div>
        <div><small>🚢 Export profit</small><b>{G.exportProfit ? cop(G.exportProfit) : "—"}</b><span>{G.exportQty ? `${G.exportQty} units · ${usdTxt(G.exportUSD)} each` : "Class 4"}</span></div>
        <div><small>🌱 ESG · ♻️ waste cut</small><b>{G.esg == null ? "—" : `${G.esg}/100`}</b><span>{G.waste != null ? `waste −${G.waste}%` : "Classes 5–6"}</span></div>
        <div><small>📊 Monthly profit</small><b className={G.profit >= 0 ? "pos" : "neg"}>{cop(G.profit)}</b><span>fixed {cop(G.fixed)}</span></div>
      </div>
      {!compact && (
        <div className="g91-sections">
          {BADGES94.map((x) => { const on = x.keys.every((k) => r[k]); return <span key={x.t} className={on ? "on" : ""}><em>{on ? x.e : "🔒"}</em>{x.t}</span>; })}
          <span className={`final ${r.c7_report ? "on" : ""}`}><em>{r.c7_report ? "🏆" : "🔒"}</em>Global Impact Leader</span>
        </div>
      )}
    </div>
  );
}
function NeedP3({ resp }) {
  return globalOf(resp).sample ? <div className="p1-banner bad"><span>🚀 We didn't find your Period 3 startup, so you will play with a sample startup (SaveBite). Your decisions still count!</span></div> : null;
}

/* =====================================================================
   PERIODO 4 · 9° · 2 VIDEOS + 2 LECTURAS + 1 EXPLICACIÓN + EL PERIÓDICO
   Opciones: correcta (nunca la más larga) · parecida pero errada (la más larga)
             · trampa corta (errada) · nada que ver
   ===================================================================== */
const VID_GLOBAL = "https://res.cloudinary.com/y9r84vgz/video/upload/v1793486787/videoplayback_39.mp4";
const VID_ESG = "https://res.cloudinary.com/y9r84vgz/video/upload/v1793486917/videoplayback_40.mp4";

const VQ_GLOBAL = [
  { q: "How does the video explain globalization at the beginning?", options: ["Like a bridge between countries", "Like a closed wall that separates developing countries from the richest economies", "Like a bank vault", "Like a blockchain"], correct: 0, feedback: "A bridge for trade, investment, communication and ideas." },
  { q: "A country that grows flowers trades with one that can't. What happens?", options: ["Both benefit: income for one, new products for the other", "Both countries suffer from agricultural inflation and lose money for many years", "Their currencies disappear", "Trade stops forever"], correct: 0, feedback: "Trade blossoms!" },
  { q: "Besides goods, what else crosses the “bridges”?", options: ["Investment, communication, ideas and people", "Only military invasions and mandatory tax collections between governments", "Gold only", "Nothing else"], correct: 0, feedback: "Globalization is more than trade." },
  { q: "What effect have global links had, according to the IMF?", options: ["Cheaper goods and a richer planet", "A total economic collapse with hyperinflation in every country of the world", "No competition", "Identical products everywhere"], correct: 0, feedback: "Food and electronics became cheaper." },
  { q: "How many people left poverty in the last 30 years thanks to globalization?", options: ["1.5 billion", "5 billion people, which is almost everybody who lives on the planet today", "100 million", "500,000"], correct: 0, feedback: "1.5 billion people." },
  { q: "What problem of globalization does the video mention?", options: ["Not everyone benefited equally", "It stopped all technological innovation and made travel between countries impossible", "Prices went up", "Nothing"], correct: 0, feedback: "Some people feel left behind." },
  { q: "What does the video say is the WRONG solution?", options: ["Destroying the bridges and the rules", "Increasing international cooperation and redesigning the trade rules for everybody", "Investing in technology", "Talking"], correct: 0, feedback: "That would make everyone poorer." },
  { q: "What does the video suggest instead?", options: ["Rebuild the bridges and write fairer rules", "Ban all international commerce and let one private company control every economy", "Use gold bars", "Close borders"], correct: 0, feedback: "Improve the system so everyone benefits." },
  { q: "Which organization made the video?", options: ["The IMF", "The World Health Organization, which manages the trade rules of all countries", "The UN Security Council", "A bank"], correct: 0, feedback: "The International Monetary Fund." },
  { q: "What is the final conclusion?", options: ["We need international cooperation", "Countries should close their borders and produce everything they need by themselves", "Growth is impossible", "Trade only with neighbors"], correct: 0, feedback: "Cooperation for a future good for everyone." },
];
const VQ_ESG = [
  { q: "What is greenwashing?", options: ["Marketing that looks greener than the real actions", "A government program that pays companies to install renewable energy in their factories", "A carbon tax method", "A recycling plan"], correct: 0, feedback: "More green talk than green action." },
  { q: "What are Scope 1 emissions?", options: ["Direct emissions from the company's own sources", "Emissions from the electricity, steam and energy that the company buys from others", "Supply chain emissions", "Carbon credits"], correct: 0, feedback: "Like the factory's own chimney." },
  { q: "What are Scope 2 emissions?", options: ["Emissions from the energy the company buys", "Direct emissions from the trucks and vehicles that the company owns and drives every day", "Customer waste", "Supplier materials"], correct: 0, feedback: "Purchased electricity, steam or energy." },
  { q: "What do Scope 3 emissions include?", options: ["All other emissions in the value chain", "Only the smoke from the company's own chimneys, measured every month by the government", "Office lights", "Solar power"], correct: 0, feedback: "From raw materials to disposal — the hardest to measure." },
  { q: "Which system limits emissions but lets companies trade allowances?", options: ["Cap and trade", "A product recall ban that stops companies from selling any product that pollutes", "An import tariff", "A tax exemption"], correct: 0, feedback: "A ceiling + a market for allowances." },
  { q: "What does California's SB 100 require by 2045?", options: ["100% carbon-free electricity", "A complete ban on every private car and motorcycle in the whole state", "Solar roofs by 2030", "A fossil fuel tax"], correct: 0, feedback: "A carbon-free electricity grid." },
  { q: "Why is greenwashing riskier today?", options: ["Informed consumers and stricter rules expose it", "Because governments made all marketing departments illegal in most countries", "Nobody cares", "Social media bans ads"], correct: 0, feedback: "Transparency is demanded." },
  { q: "What does ESG stand for?", options: ["Environmental, Social, Governance", "Economic, Security and Growth, the three goals of every government and central bank", "Emissions, Sun, Gas", "Equity, Stocks, Global"], correct: 0, feedback: "The three pillars of responsible business." },
  { q: "What does the Social factor evaluate?", options: ["Relationships with workers, customers and communities", "The company's income tax payments and its transparency with the government every year", "Renewable energy", "Audits"], correct: 0, feedback: "People: labor, inclusion, community." },
  { q: "What is Governance about?", options: ["Transparency, ethics and accountability", "Making the stock price as high as possible every quarter so executives get big bonuses", "Cafeteria waste", "No oversight"], correct: 0, feedback: "How the company is led." },
  { q: "How are heavy polluters responding to ESG pressure?", options: ["Innovating with cleaner technology", "Ignoring the rules and spending all their money on green advertisements and new logos", "Closing forever", "Moving underground"], correct: 0, feedback: "Innovate or fall behind." },
  { q: "What is the video's conclusion?", options: ["Sustainability is the future of business", "ESG is a temporary marketing trend that will disappear in a few years", "Logos fix everything", "Only startups must care"], correct: 0, feedback: "Not a buzzword — a business imperative." },
];

/* ---------- READING · When the Dollar Jumped (clase 2) ---------- */
const READ_DOLLAR = [
  { sub: "Same news, two different faces" },
  { p: "On Monday morning, the news said: “The dollar jumps from $3,800 to $4,500.” In a small town in Huila, Don Ernesto smiled. In a shopping mall in Bogotá, Valeria looked worried. They heard the same news — but it meant very different things for their businesses." },
  { sub: "Don Ernesto: the coffee exporter" },
  { p: "Don Ernesto grows coffee and sells it to a company in the United States. He receives dollars: this month, US$10,000 for his coffee. When the dollar was at $3,800, those US$10,000 became $38,000,000 pesos. Now, at $4,500, the same coffee becomes $45,000,000 pesos. He didn't produce one more bag — but he received $7,000,000 more." },
  { p: "However, Don Ernesto is careful. His fertilizer is imported and priced in dollars, so it also became more expensive. And he knows the dollar can go down again. “Good months are for saving,” he says, “not for spending everything.”" },
  { sub: "Valeria: the phone importer" },
  { p: "Valeria sells phones that she imports from Asia. She pays her supplier in dollars: US$200 for each phone. At $3,800, each phone cost her $760,000 pesos. At $4,500, it costs $900,000. Her customers don't want to pay more, but if she keeps the same price, her profit almost disappears." },
  { box: "Exchange rate = how many pesos you need to buy one dollar. When the peso loses value (depreciation), exporters usually win and importers usually lose." },
  { sub: "How businesses protect themselves" },
  { p: "Businesses can't control the dollar, but they can manage the risk. Valeria could sign a contract to buy dollars at a fixed price in advance, find a local supplier, raise her prices a little, or change the products she sells. Don Ernesto could save part of his extra income or sell some coffee with a fixed price contract." },
  { p: "None of these options is perfect. A fixed price protects you when the dollar goes up — but if it goes down, you lose the benefit. A local supplier may be more expensive at first. Raising prices can make some customers leave. That's why companies talk about currency risk: the possibility that the exchange rate changes your costs, your income and your profit." },
  { sub: "The lesson" },
  { p: "On Friday, the dollar went down to $4,100. Don Ernesto was happy he had saved part of his extra money. Valeria was happy she had found a second supplier in Colombia. Both learned the same thing: in a global economy, a number that changes in another part of the world can change your life on Monday morning." },
];
const GLOSS_DOLLAR = { "exchange rate": "Tasa de cambio (TRM).", "exporter": "Exportador.", "importer": "Importador.", "depreciation": "Devaluación / depreciación del peso.", "currency risk": "Riesgo cambiario.", "fixed price contract": "Contrato a precio fijo." };
const Q_DOLLAR = [
  { q: "What was the news on Monday?", options: ["The dollar jumped from $3,800 to $4,500", "The government changed the peso for the dollar as the official money of Colombia", "Coffee became free", "Phones were banned"], correct: 0, feedback: "Same news, two faces." },
  { q: "Why was Don Ernesto happy?", options: ["He receives dollars for his coffee", "Because he imports all his products from Asia and pays his suppliers in pesos", "He sold more coffee", "He won a prize"], correct: 0, feedback: "Exporters receive dollars." },
  { q: "US$10,000 at $4,500 per dollar is…", options: ["$45,000,000", "$38,000,000, because the exchange rate does not change the money an exporter receives", "$4,500,000", "$10,000"], correct: 0, feedback: "10,000 × 4,500." },
  { q: "Why is Don Ernesto still careful?", options: ["His fertilizer is imported and the dollar can fall", "Because he thinks the dollar will stay at $4,500 forever and he wants to spend everything", "He is sad", "Coffee prices are fixed"], correct: 0, feedback: "Good months are for saving." },
  { q: "How much does one phone cost Valeria at $4,500?", options: ["$900,000", "$760,000, because she bought the phones when the dollar was still at $3,800", "$200", "$450,000"], correct: 0, feedback: "200 × 4,500." },
  { q: "When the peso loses value, who usually wins?", options: ["Exporters", "Importers, because they pay fewer pesos for each dollar when the peso is weaker", "Nobody", "Banks only"], correct: 0, feedback: "Exporters usually win; importers usually lose." },
  { q: "What is currency risk?", options: ["That the exchange rate changes your costs or income", "The danger of losing your wallet with dollars and pesos when you travel to another country", "A bank fee", "Inflation"], correct: 0, feedback: "Costs, income and profit can change." },
  { q: "What is a weakness of a fixed price contract?", options: ["If the dollar falls, you lose the benefit", "It always costs double, so no company in the world should ever sign one", "It's illegal", "None"], correct: 0, feedback: "No option is perfect." },
  { q: "What did Valeria do to protect her business?", options: ["Found a second supplier in Colombia", "She closed the store and moved her business to Asia to buy phones without dollars", "Nothing", "Raised prices x3"], correct: 0, feedback: "Diversify suppliers." },
  { q: "What is the main lesson?", options: ["A global number can change your life", "The dollar only matters for people who travel to the United States on vacation", "Coffee is better than phones", "Never trade"], correct: 0, feedback: "We live in a connected economy." },
];

/* ---------- EXPLAINER · The Inflation Thermostat (clase 3) ---------- */
const BRIEF_INFL = [
  { sub: "An economy has a temperature" },
  { p: "Think of an economy like a house. If it gets too hot, prices rise fast — that's high inflation. If it gets too cold, businesses stop selling and people lose their jobs. The central bank uses its interest rate like a thermostat to keep the temperature comfortable." },
  { box: "Inflation = how fast prices rise. GDP growth = how much the economy produces compared with last year. Unemployment = % of people who want a job and can't find one. Policy rate = the central bank's interest rate." },
  { sub: "How the thermostat works" },
  { p: "When inflation is too high, the central bank raises its rate. Loans become more expensive, so families and businesses borrow and spend less. With less spending, prices rise more slowly. When the economy is too cold, the bank lowers the rate to encourage credit, spending and jobs." },
  { sub: "The delay" },
  { p: "The thermostat is slow. A rate change can take 6 to 18 months to affect prices. If the bank raises rates too much, inflation falls — but GDP can stop growing and unemployment can rise. If it waits too long, inflation can become a habit. That's why central bankers move step by step and watch the data every month." },
  { sub: "What inflation does to you and your business" },
  { p: "With 10% inflation, $100,000 of groceries costs $110,000 next year. If your salary doesn't grow, you can buy less. For a business, materials, transport and electricity become more expensive. Smart businesses don't just raise prices: they reduce waste, negotiate with suppliers and keep a reserve. Remember your Period 1 decision as a central banker? Now you'll see the full picture." },
];
const GLOSS_INFL = { "inflation": "Inflación.", "GDP": "PIB (producto interno bruto).", "unemployment": "Desempleo.", "policy rate": "Tasa de política monetaria.", "thermostat": "Termostato.", "delay": "Retraso." };
const Q_INFL = [
  { q: "In the metaphor, what is the central bank's interest rate?", options: ["A thermostat", "A heater that the government turns on when people feel cold in winter", "A window", "A door"], correct: 0, feedback: "It controls the temperature of the economy." },
  { q: "What is GDP growth?", options: ["How much more the economy produces than last year", "The total money that the central bank prints every year to pay the government's salaries", "Prices", "Taxes"], correct: 0, feedback: "Production compared with last year." },
  { q: "What does the bank usually do when inflation is too high?", options: ["Raise the rate", "Lower the rate to zero so people can borrow more and buy more products", "Print money", "Nothing"], correct: 0, feedback: "More expensive credit → less spending." },
  { q: "How long can a rate change take to affect prices?", options: ["6 to 18 months", "Exactly one day, because markets react immediately to every decision", "10 years", "One hour"], correct: 0, feedback: "The thermostat is slow!" },
  { q: "What can happen if rates go up too much?", options: ["GDP slows and unemployment rises", "Inflation and GDP both grow very fast and everybody gets a better job immediately", "Nothing", "Prices double"], correct: 0, feedback: "Too cold!" },
  { q: "With 10% inflation, $100,000 of groceries costs next year…", options: ["$110,000", "$100,000, because inflation does not change the price of food, only of luxury goods", "$90,000", "$200,000"], correct: 0, feedback: "+10%." },
  { q: "What do smart businesses do with inflation?", options: ["Reduce waste and negotiate, not only raise prices", "Double all their prices immediately, because customers always accept higher prices", "Close", "Ignore it"], correct: 0, feedback: "Many tools, not just one." },
  { q: "Why do central bankers move step by step?", options: ["Effects are delayed and uncertain", "Because the law allows them to change the rate only once every ten years", "They are lazy", "For fun"], correct: 0, feedback: "Watch the data, adjust carefully." },
];

/* ---------- THE DISTRICT TIMES · periódico de economía (clase 4) ---------- */
const NEWS_P4 = {
  date: "Edition 2026 · Economy & Trade",
  lead: { kicker: "TRADE", h: "Small Colombian brands are crossing borders", d: "Trade agreements open doors, but only the companies that prepare well can walk through them.", p: "Colombia has trade agreements with several partners, including the United States, the European Union and its Pacific Alliance neighbors (Mexico, Chile and Peru). These agreements can reduce or remove tariffs — taxes on imported products — for many goods. But a lower tariff is not a free pass: exporters still need correct labels, documents, certifications and a price that buyers accept. “The agreement opens the door,” says a trade advisor in our story, “but your product must be ready to walk in.”", img: "🚢" },
  briefs: [
    { kicker: "SMEs", e: "☕", h: "A coffee brand from Huila lands its first order abroad", p: "A family business of 12 people sent its first 500 bags to a store in Chile. The hardest part? “Translating the label and getting the quality certificate,” says the founder. (Illustrative story.)" },
    { kicker: "CURRENCY", e: "💵", h: "Dollar rollercoaster: $3,800 → $4,500 → $4,100", p: "Exporters celebrated, importers suffered — and many companies learned to manage currency risk. (Simulation values, not real quotes.)" },
    { kicker: "PRICES", e: "🌡️", h: "Inflation at 8.5% — the central bank keeps watching", p: "With prices rising above the target, the bank must decide its next move. Families feel it in food and transport. (Fictional economy.)" },
    { kicker: "WORLD", e: "🌍", h: "1.5 billion people left poverty in 30 years", p: "According to the IMF, trade and investment between countries helped about 1.5 billion people escape poverty. But the benefits did not reach everyone equally — and that is the big debate today." },
    { kicker: "SHIPPING", e: "📦", h: "One ship, more than 20,000 containers", p: "The biggest container ships today can carry more than 20,000 containers. When one of them is delayed, factories on other continents can stop. That's why companies look for plan B suppliers." },
    { kicker: "GREEN", e: "🌱", h: "Buyers abroad now ask: “Can you prove it's sustainable?”", p: "More international buyers request evidence about packaging, emissions and working conditions. “Eco” on the label is no longer enough." },
  ],
  data: [["Dollar (simulation)", "$4,100"], ["Inflation (fictional)", "8.5%"], ["Policy rate (fictional)", "6.0%"], ["Exporters helped by TLCs", "📈"]],
  opinion: { h: "OPINION · Don't export your problems", p: "Before selling abroad, sell well at home. If your costs are a mess, the dollar will not save you. Export when your numbers, your quality and your documents are ready — not before.", by: "— The District Times editorial board" },
  ad: { h: "🌿 ECO-CLEAN 100% GREEN!!!", p: "“The most eco product in the universe” · no data · no certificate", note: "Spot the greenwashing in this ad? You'll need it in Class 5." },
};
const Q_NEWS = [
  { q: "According to the lead story, what can trade agreements do?", options: ["Reduce or remove tariffs", "Guarantee that every Colombian product will be sold abroad without any requirement", "Raise all taxes", "Close borders"], correct: 0, feedback: "Lower tariffs — not a free pass." },
  { q: "What is a tariff?", options: ["A tax on imported products", "A discount that the government gives to companies that export more than one million dollars", "A ship", "A label"], correct: 0, feedback: "Agreements can reduce them." },
  { q: "What do exporters still need, even with an agreement?", options: ["Labels, documents, certifications and a good price", "Nothing — the agreement does all the work and the buyers come automatically", "A big office", "A famous logo"], correct: 0, feedback: "“Your product must be ready to walk in.”" },
  { q: "What was the hardest part for the Huila coffee brand?", options: ["The label and the quality certificate", "Growing the coffee, because it was the first time they planted coffee in their lives", "The weather", "The price"], correct: 0, feedback: "Requirements matter." },
  { q: "What do more international buyers ask for now?", options: ["Evidence of sustainability", "A promise written on the label that says “eco”, without any data or certificate", "Lower prices only", "Nothing"], correct: 0, feedback: "Prove it!" },
  { q: "What is the main idea of the opinion column?", options: ["Get ready at home before exporting", "Export as soon as possible, because the dollar will solve any problem with your costs", "Never export", "Only import"], correct: 0, feedback: "Numbers, quality and documents first." },
  { q: "Which is TRUE about the dollar values in the newspaper?", options: ["They are simulation values", "They are the official real exchange rates published by the central bank this week", "They never change", "They are in euros"], correct: 0, feedback: "Always check if data is real or illustrative!" },
  { q: "According to the IMF story, what is the problem with globalization?", options: ["Its benefits didn't reach everyone equally", "It stopped all trade between countries, so most people became poorer in the last 30 years", "Ships are too big", "It has no problems"], correct: 0, feedback: "1.5 billion out of poverty — but unequal gains." },
  { q: "Why can a delayed ship stop a factory on another continent?", options: ["The factory needs parts from that ship", "Because ships carry the workers of the factory, so without the ship nobody can go to work", "Ships make electricity", "It can't"], correct: 0, feedback: "Global supply chains are connected — plan B suppliers help." },
  { q: "What is wrong with the ECO-CLEAN ad?", options: ["Big green claims with no evidence", "Nothing — an ad with many exclamation marks is always the most honest kind of ad", "It's too small", "It's blue"], correct: 0, feedback: "Greenwashing alert!" },
];

/* ---------- READING · Nothing Goes to Waste (clase 6) ---------- */
const READ_CIRC = [
  { sub: "The factory that hated the trash can" },
  { p: "When Lucía took over her family's small shoe factory in Bucaramanga, the first thing she noticed was the trash. Every day, bags full of leather scraps, rubber pieces and cardboard went to the landfill. “We are throwing away money,” she said." },
  { sub: "Linear vs. circular" },
  { p: "Most products follow a linear path: take materials, make a product, use it, throw it away. A circular economy tries to close the loop: materials stay in use as long as possible, waste becomes a resource, and products are designed to last, be repaired, or be recycled." },
  { box: "The three Rs, in order: REDUCE (use less), REUSE (give it a second life), RECYCLE (turn it into new material). Reducing usually saves the most." },
  { sub: "Lucía's experiments" },
  { p: "First, she reduced: a new cutting pattern used 15% less leather. Then, she reused: leather scraps became key chains and card holders that the factory sold online. Finally, she recycled: old rubber soles were ground and mixed into new soles. She also started a program: customers could bring old shoes to be repaired or recycled and get a 10% discount." },
  { sub: "Not everything worked" },
  { p: "Recycling rubber needed a new machine that cost $18,000,000. The first key chains didn't sell. Some customers didn't bring their old shoes back. Lucía learned that circular ideas need numbers too: every change has a cost, a benefit and a time to pay back." },
  { sub: "The result" },
  { p: "After a year, the factory sent 60% less waste to the landfill, saved money on materials, and found new customers who liked the repair program. A buyer from Chile even chose Lucía's shoes because she could show real data about her waste. “Nothing goes to waste,” is now written on the factory wall — and this time, it's not just a slogan. It's a plan with evidence." },
];
const GLOSS_CIRC = { "landfill": "Relleno sanitario.", "scraps": "Retazos / sobrantes.", "circular economy": "Economía circular.", "linear": "Lineal.", "pay back": "Recuperar la inversión.", "evidence": "Evidencia." };
const Q_CIRC = [
  { q: "What did Lucía notice first?", options: ["Bags of waste every day", "That her shoes were the most famous shoes in Colombia and in many other countries", "Too many workers", "Low prices"], correct: 0, feedback: "“We are throwing away money.”" },
  { q: "What is the linear path?", options: ["Take, make, use, throw away", "Reduce, reuse and recycle, so that the materials stay in use for a very long time", "Repair everything", "Sell abroad"], correct: 0, feedback: "Circular tries to close the loop." },
  { q: "Which R usually saves the most?", options: ["Reduce", "Recycle, because transforming waste into new material is always cheaper than using less", "Repeat", "Return"], correct: 0, feedback: "Use less first." },
  { q: "What did the new cutting pattern do?", options: ["Used 15% less leather", "Made the shoes 15% more expensive and 15% more beautiful for customers", "Nothing", "Used more glue"], correct: 0, feedback: "That's reducing." },
  { q: "What did the factory do with leather scraps?", options: ["Made key chains and card holders", "Burned them in a big fire behind the factory to produce cheap energy", "Threw them away", "Gave them to the river"], correct: 0, feedback: "Reuse = second life." },
  { q: "What problem did recycling rubber have?", options: ["It needed an $18,000,000 machine", "It was completely free and easy, so it didn't need any machine or any planning", "It was illegal", "Nobody makes rubber"], correct: 0, feedback: "Circular ideas need numbers too." },
  { q: "Why did the buyer from Chile choose Lucía?", options: ["She showed real data about her waste", "Because her shoes were the cheapest shoes in the whole world, even with low quality", "Luck", "A famous ad"], correct: 0, feedback: "Evidence beats slogans." },
  { q: "What is the main message?", options: ["Circular ideas + numbers + evidence", "Write “eco” on the wall and the factory automatically becomes sustainable", "Never change", "Recycle only paper"], correct: 0, feedback: "A plan with evidence." },
];

/* ---------- RADAR 9 FINAL · las MISMAS 10 preguntas del primer día + 5 nuevas ---------- */
const RADAR_DIMS = [
  { k: "mm", l: "Money Management", short: "Money" }, { k: "ent", l: "Entrepreneurship", short: "Business" }, { k: "wb", l: "Financial Wellbeing", short: "Wellbeing" },
  { k: "dig", l: "Digital Economy", short: "Digital" }, { k: "glo", l: "Global Citizenship", short: "Global" },
];
const RADAR9_Q = [
  { d: "mm", q: "You get your first salary from a part-time job. What do you do first?", o: ["Spend it on what I've wanted for months.", "Keep it all in cash at home.", "Make a plan: needs, a saving goal, and a part for fun.", "Lend it to a friend."], s: [0, 1, 3, 0] },
  { d: "mm", q: "Two savings accounts: one pays more interest but charges fees. How do you choose?", o: ["The one with more interest, always.", "Compare interest AND fees with how I will use it.", "The one with the nicest app.", "The one my friends use."], s: [1, 3, 0, 0] },
  { d: "ent", q: "A bakery sells a lot, but customers pay 30 days later. What can happen?", o: ["Nothing, sales are high.", "It can run out of cash to pay its bills.", "It will pay fewer taxes.", "It will close tomorrow for sure."], s: [0, 3, 0, 1] },
  { d: "ent", q: "You want a loan for a business idea. What should you prepare?", o: ["Just a good attitude.", "A plan with costs, sales and a plan B if sales are lower.", "A nice logo.", "Nothing — banks give loans to everyone."], s: [0, 3, 1, 0] },
  { d: "wb", q: "A store offers you a credit card with a big limit. You don't have a fixed income. What do you do?", o: ["Accept and use the whole limit.", "Think: can I repay it? What does it cost?", "Accept and pay only the minimum.", "Give it to a friend."], s: [0, 3, 0, 0] },
  { d: "wb", q: "Credit is…", o: ["extra money I can spend.", "money I borrow and must repay, usually with a cost.", "a gift from the bank.", "the same as my salary."], s: [0, 3, 0, 0] },
  { d: "dig", q: "A message says: “Your bank account will be closed. Confirm your password here.”", o: ["Click and confirm quickly.", "Don't click; check in the official app or call the bank.", "Reply asking if it's real.", "Forward it to friends."], s: [0, 3, 1, 0] },
  { d: "dig", q: "A rumor on social media says your bank is broke. What do you do?", o: ["Withdraw everything immediately.", "Look for official information before deciding.", "Share the rumor with everybody.", "Close all my accounts."], s: [1, 3, 0, 0] },
  { d: "glo", q: "Many people in a village can't open a bank account. What could help?", o: ["Nothing, it's their problem.", "Small loans and services designed for them (microfinance).", "Loan sharks.", "Giving them a credit card with no limit."], s: [0, 3, 0, 1] },
  { d: "glo", q: "Why does a country need a central bank?", o: ["To sell products.", "To keep prices and the financial system stable.", "To give free money.", "To collect parking fees."], s: [0, 3, 0, 0] },
];
const RADAR9_NEW = [
  { d: "mm", q: "Your startup imports a material priced in dollars. The dollar jumps 18%. What do you do?", o: ["Nothing.", "Recalculate costs and compare strategies (fixed price, local supplier…).", "Close the business.", "Double the price."], s: [0, 3, 0, 1] },
  { d: "ent", q: "A buyer abroad wants 1,000 units next month. What do you check first?", o: ["Only the price.", "Price, requirements, documents and if I can really produce it.", "My logo.", "Nothing, I say yes."], s: [1, 3, 0, 0] },
  { d: "wb", q: "Inflation is 9% and your salary stays the same. What does it mean?", o: ["Nothing changes.", "I can buy less — I must adjust my budget.", "I'm richer.", "Prices go down."], s: [0, 3, 0, 0] },
  { d: "dig", q: "An ad says “100% eco!” with no data. You…", o: ["Believe it.", "Ask for evidence or certifications.", "Share it.", "Buy two."], s: [0, 3, 0, 0] },
  { d: "glo", q: "Why can a circular economy help businesses AND the planet?", o: ["It can't.", "Less waste can mean lower costs and less pollution.", "Only because it's a trend.", "It makes products expensive always."], s: [0, 3, 1, 0] },
];
function radarProfile9(avg) {
  if (avg <= 30) return { l: "New Citizen 🌱", d: "You are still building your foundations. Keep practicing with real decisions." };
  if (avg <= 55) return { l: "District Explorer 🔎", d: "You know many ideas. Next step: use them with numbers every time." };
  if (avg <= 80) return { l: "Smart Planner 📐", d: "Strong decisions! You compare, plan and think about risks." };
  return { l: "Global Advisor ⭐", d: "Excellent! You think like a financial advisor with a global view." };
}

/* ---------- FINAL EXAM · 5 misiones + 15 preguntas de todo el año (con tema) ---------- */
const EXAM_MISSIONS = [
  { tag: "MISSION 1 · BANKING (P1)", q: "A bank has $80,000,000 in deposits and keeps a 15% reserve. How much can it lend?", answer: 68000000, money: true, hint: "80,000,000 − 15%", explain: "$68,000,000." },
  { tag: "MISSION 2 · PRODUCTS (P2)", q: "You owe $600,000 on your card and pay only the $60,000 minimum. Interest is 2.5% per month. How much interest next month?", answer: 13500, money: true, hint: "(600,000 − 60,000) × 2.5%", explain: "$13,500 — the cost of not paying in full." },
  { tag: "MISSION 3 · STARTUP (P3)", q: "Fixed costs $1,000,000, price $12,000, unit cost $7,000. How many units to break even?", answer: 200, unit: "units", hint: "1,000,000 ÷ (12,000 − 7,000)", explain: "200 units." },
  { tag: "MISSION 4 · GLOBAL (P4)", q: "You import a part that costs US$5. The dollar goes from $4,000 to $4,500. How much MORE does each part cost in pesos?", answer: 2500, money: true, hint: "5 × 4,500 − 5 × 4,000", explain: "$2,500 more per part." },
  { tag: "MISSION 5 · IMPACT (P4)", q: "A company says “100% sustainable” but shows no data, no certificate, and its supplier pollutes a river. What is it?", options: ["Greenwashing", "A verified ESG leader that deserves a green investment and a sustainability prize", "Circular economy", "Good governance"], correct: 0, hint: "Green talk, no green action.", explain: "Claims without evidence = greenwashing." },
];
const EXAM_Q = [
  { t: "Banking", q: "Why are deposits a liability for a bank?", options: ["The bank must return them", "Because the bank owns the deposits forever and can use them for anything without returning them", "They are profit", "They are taxes"], correct: 0, feedback: "Customers can ask for them back." },
  { t: "Banking", q: "A healthy bank runs out of cash after a rumor. What is its problem?", options: ["Liquidity", "Solvency, because a bank without cash today always owes more than everything it owns", "Inflation", "Marketing"], correct: 0, feedback: "Illiquid ≠ insolvent." },
  { t: "Credit", q: "What is capacity to pay?", options: ["Money left after expenses and debts", "The total salary of a person before paying rent, food, transport and other debts", "The loan", "The rate"], correct: 0, feedback: "Income − expenses − debts." },
  { t: "Products", q: "What is the main difference between credit and debit cards?", options: ["Credit borrows; debit uses your money", "A credit card only works online and a debit card only works at ATMs in the street", "Debit charges interest", "No difference"], correct: 0, feedback: "Borrowed vs. your own money." },
  { t: "Products", q: "Why diversify an investment?", options: ["To reduce risk", "To guarantee that the investment will never lose money in any year of its life", "To pay more fees", "To avoid rules"], correct: 0, feedback: "Don't put all your eggs in one basket." },
  { t: "Products", q: "How does a Ponzi scheme pay early investors?", options: ["With new investors' money", "With the real profits of a successful company that sells products in many countries", "With taxes", "With loans"], correct: 0, feedback: "It collapses when new money stops." },
  { t: "Startup", q: "What is a value proposition?", options: ["Why a customer should choose you", "The total money that investors put in the company during its first year of life", "A price", "A logo"], correct: 0, feedback: "Customer, problem, benefit, difference." },
  { t: "Startup", q: "An investor gives $10,000,000 for 25%. What is the valuation?", options: ["$40,000,000", "$2,500,000, because you multiply the investment by the percentage of the company", "$10,000,000", "$25,000,000"], correct: 0, feedback: "10,000,000 ÷ 0.25." },
  { t: "Startup", q: "Why separate personal and business money?", options: ["To see the real profit", "Because banks don't allow young people to have more than one account at the same time", "It doesn't matter", "To pay more tax"], correct: 0, feedback: "Clean money, clear numbers." },
  { t: "Global", q: "When the peso loses value, who usually benefits?", options: ["Exporters", "Importers, because they need fewer pesos to pay their suppliers in dollars", "Nobody", "Tourists abroad"], correct: 0, feedback: "Exporters receive more pesos." },
  { t: "Global", q: "What can a trade agreement do?", options: ["Reduce tariffs", "Remove every requirement, so exporters don't need labels, documents or certifications", "Raise prices", "Ban imports"], correct: 0, feedback: "A door — you still need to be ready." },
  { t: "Economy", q: "Why does a central bank raise its rate when inflation is high?", options: ["To reduce spending and slow prices", "To make loans cheaper so that people buy more products and prices go down", "To print money", "To close banks"], correct: 0, feedback: "With a delay of months!" },
  { t: "Economy", q: "With 8% inflation, $200,000 of groceries costs next year…", options: ["$216,000", "$200,000, because inflation only changes the prices of luxury products like phones", "$208,000", "$280,000"], correct: 0, feedback: "200,000 × 1.08." },
  { t: "Sustainability", q: "What does the G in ESG stand for?", options: ["Governance", "Green, because every part of ESG is about the environment and nothing else", "Growth", "Gold"], correct: 0, feedback: "Transparency, ethics, accountability." },
  { t: "Sustainability", q: "Which R usually saves the most resources?", options: ["Reduce", "Recycle, because transforming waste is always cheaper than using less material", "Repeat", "Return"], correct: 0, feedback: "Use less first." },
];
const EXAM_TIPS = { Banking: "Review the Bank Run Simulator and the Village Bank Builder (Period 1).", Credit: "Review the Loan Committee (Period 1, Class 7).", Products: "Review Card Wars, the Fund Market and Scam Shield (Period 2).", Startup: "Review your Pricing Strategy and the Negotiation Room (Period 3).", Global: "Review the Dollar Rollercoaster and your Export Plan (Period 4).", Economy: "Review the Inflation Thermostat (Period 4, Class 3).", Sustainability: "Review the ESG Crisis Room and the Circular Lab (Period 4)." };

/* =====================================================================
   CLASE 1 · THE JOURNEY OF A PRODUCT
   ===================================================================== */
const STOPS_P1 = [
  { id: "in", f: "🇮🇳", c: "India", step: "Cotton is grown and picked", who: "👩‍🌾 Cotton farmer", get: 1200, note: "Hard work in the sun — and the smallest part of the price." },
  { id: "cn", f: "🇨🇳", c: "China", step: "Cotton becomes thread and fabric", who: "🏭 Spinning factory", get: 2000, note: "Machines turn cotton into fabric." },
  { id: "bd", f: "🇧🇩", c: "Bangladesh", step: "The T-shirt is sewn", who: "🧵 Sewing factory (worker wages: $800)", get: 3600, note: "Millions of people work in garment factories." },
  { id: "sea", f: "🚢", c: "The ocean", step: "Shipping to Colombia", who: "🚢 Shipping company", get: 2400, note: "About 30 days on a container ship." },
  { id: "co", f: "🇨🇴", c: "Colombia · customs", step: "Tariffs, taxes and transport", who: "🏛️ Taxes and customs", get: 3800, note: "Taxes pay for public services." },
  { id: "brand", f: "🎨", c: "Colombia · brand", step: "Design, logo and marketing", who: "🎨 The brand", get: 8000, note: "Ideas and marketing add a lot of value." },
  { id: "store", f: "🛍️", c: "Colombia · store", step: "The T-shirt is sold for $40,000", who: "🛍️ The store", get: 19000, note: "Rent, salaries, lights — and profit." },
];
function Passport({ onSave, onExit }) {
  const [at, setAt] = useState(0);
  const [miss, setMiss] = useState(0);
  const [opts, setOpts] = useState(() => shuffleArr([0, 1, 2]));
  const [q, setQ] = useState(null);
  const [st, finish] = useFinish(onSave);
  const done = at >= STOPS_P1.length;
  const next = STOPS_P1[at];
  const choices = done ? [] : opts.map((k) => STOPS_P1[Math.min(STOPS_P1.length - 1, at + k)]).filter((x, i, arr) => arr.findIndex((y) => y.id === x.id) === i);
  const go = (s) => { if (s.id === next.id) { setAt(at + 1); setOpts(shuffleArr([0, 1, 2])); } else setMiss(miss + 1); };
  if (st.done) return <Reward title="Passport complete! 🛂" subtitle="The T-shirt traveled 4 countries before reaching you." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title="Passport of a T-shirt 🛂" subtitle="A $40,000 T-shirt crosses the world. Choose the NEXT stop of its journey — and discover who gets what." onExit={onExit}>
      <Brief91 k="c1_passport" />
      <div className="g94-route">{STOPS_P1.map((s, i) => <div key={s.id} className={i < at ? "done" : i === at ? "now" : ""}><em>{i < at ? s.f : "❔"}</em><small>{i < at ? s.c : `Stop ${i + 1}`}</small></div>)}</div>
      {!done && (
        <div className="start-block">
          <h3>🧭 Stop {at + 1}/7 · What happens next?</h3>
          <div className="g92-opts">{choices.map((s) => <button key={s.id} type="button" onClick={() => go(s)}>{s.f} {s.c}: {s.step}</button>)}</div>
          {miss > 0 && <p className="g91-note neg">Not yet! Think about the order: raw material → fabric → sewing → transport → selling.</p>}
        </div>
      )}
      {at > 0 && (
        <div className="g94-stamps">{STOPS_P1.slice(0, at).map((s) => <div key={s.id}><header><em>{s.f}</em><b>{s.c}</b></header><p>{s.step}</p><span>{s.who}</span><strong>{done ? cop(s.get) : "💰 ?"}</strong><small>{s.note}</small></div>)}</div>
      )}
      {done && (
        <>
          <div className="start-block"><h3>💰 Who gets what of the $40,000?</h3><HBars rows={STOPS_P1.map((s) => ({ l: s.who.split(" (")[0], v: s.get, c: s.id === "in" || s.id === "bd" ? "#ff6b57" : "var(--green)" }))} /></div>
          <PickOne tag="THINK" q="Who receives the SMALLEST part of the price?" options={["The cotton farmer", "The store, because it pays rent, salaries and electricity and keeps almost nothing at the end", "The brand", "The shipping company"]} correct={0} explain="Globalization made T-shirts cheap — but not everyone benefits equally (remember the IMF video)." onRight={setQ} />
          <div className="start-foot"><button className="s1-btn primary big" disabled={q === null} onClick={() => finish(Math.max(14, 26 - miss * 2), { misses: miss })}>Stamp my passport <span className="coin-tag"><Coins size={15} /> +{Math.max(14, 26 - miss * 2)}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- SUPPLY CHAIN RESCUE ---------- */
const RESCUE_P1 = [
  { e: "⚓", t: "The port in Asia is CLOSED for 10 days. Your LED chips are stuck.", o: [["Send them by plane", 1800000, 2], ["Wait for the port to open", 0, 10], ["Use another port (longer trip)", 600000, 5]] },
  { e: "📈", t: "Your battery supplier raises prices 20%.", o: [["Switch to a supplier in Mexico (trade agreement)", 400000, 3], ["Accept the new price", 900000, 0], ["Redesign with a smaller battery", 300000, 6]] },
  { e: "🐢", t: "The ship is delayed 8 more days.", o: [["Pay express trucks from the port", 700000, 2], ["Tell the customer and offer a discount", 500000, 8], ["Do nothing and hope", 0, 8]] },
  { e: "🧴", t: "There is a shortage of plastic for the case.", o: [["Use recycled plastic from a local supplier", 250000, 2], ["Wait for normal plastic", 0, 7], ["Buy at a black-market price", 1200000, 1]] },
];
function SupplyRescue({ onSave, onExit }) {
  const [ev, setEv] = useState(0);
  const [cost, setCost] = useState(0);
  const [days, setDays] = useState(12);
  const [log, setLog] = useState([]);
  const [orders] = useState(() => RESCUE_P1.map(() => shuffleArr([0, 1, 2])));
  const [st, finish] = useFinish(onSave);
  const E = RESCUE_P1[ev];
  const choose = (k) => { const o = E.o[k]; setCost(cost + o[1]); setDays(days + o[2]); setLog([...log, { e: E.e, t: o[0], c: o[1], d: o[2] }]); setEv(ev + 1); };
  const done = ev >= RESCUE_P1.length;
  const onTime = days <= 30, inBudget = cost <= 2500000;
  const coins = 16 + (onTime ? 6 : 0) + (inBudget ? 6 : 0);
  if (st.done) return <Reward title={onTime && inBudget ? "Supply chain rescued! 🛟" : "Order delivered… with scars 📦"} subtitle={`${days} days · extra cost ${cop(cost)}`} coins={st.coins} saving={st.saving} onExit={onExit} gold={onTime && inBudget} />;
  return (
    <ActShell icon={<Truck size={22} strokeWidth={2.1} />} title="Supply Chain Rescue 🛟" subtitle="You make smart bike lights with parts from 3 countries. A customer wants 100 lights in 30 days. Extra budget for problems: $2,500,000." onExit={onExit}>
      <Brief91 k="c1_rescue" />
      <div className="g94-parts"><span>💡 LED chips · 🇹🇼 Taiwan</span><span>🔋 Batteries · 🇨🇳 China</span><span>🧴 Case · 🇨🇴 Colombia</span></div>
      <div className="g91-meters">
        <Bar91 label={`📅 Days used (${days}/30)`} value={(days / 30) * 100} color={days <= 30 ? "#16b074" : "#ff6b57"} suffix="%" />
        <Bar91 label={`💸 Extra cost (${cop(cost)})`} value={(cost / 2500000) * 100} color={cost <= 2500000 ? "#f5b23e" : "#ff6b57"} suffix="%" />
      </div>
      {!done ? (
        <div className="start-block">
          <div className="g83-event"><em>{E.e}</em><div><b>Problem {ev + 1}/4</b><span>{E.t}</span></div></div>
          <div className="g92-pay3">{orders[ev].map((k) => <button key={k} type="button" onClick={() => choose(k)}><b>{E.o[k][0]}</b><small>{E.o[k][1] ? `+${cop(E.o[k][1])}` : "$0"} · {E.o[k][2] ? `+${E.o[k][2]} days` : "no delay"}</small></button>)}</div>
        </div>
      ) : (
        <>
          <div className={`g91-verdict ${onTime && inBudget ? "ok" : "no"}`}><em>{onTime && inBudget ? "📦" : "⏰"}</em><div><b>{onTime && inBudget ? "On time and on budget!" : !onTime ? `Late: ${days - 30} days after the deadline` : "On time — but over budget"}</b><span>Global supply chains save money… until something breaks. Plan B suppliers are worth it.</span></div></div>
          <div className="g91-timeline">{log.map((x, i) => <div key={i} className={x.d <= 3 && x.c <= 700000 ? "good" : "bad"}><small>{x.e} Problem {i + 1}</small><span>{x.t}</span></div>)}</div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(coins, { days, cost, onTime, inBudget, choices: log.map((x) => x.t) })}>Deliver the order <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- FOUNDER PAGE 18 · Build Your Global Company ---------- */
const MKT_P1 = [
  { id: "USA", f: "🇺🇸", n: "United States", d: "Huge market · trade agreement · strict labels and certifications", ship: 2500 },
  { id: "Mexico", f: "🇲🇽", n: "Mexico", d: "Big market · Pacific Alliance partner · Spanish labels", ship: 1800 },
  { id: "Chile", f: "🇨🇱", n: "Chile", d: "Smaller market · Pacific Alliance partner · loves specialty products", ship: 2000 },
];
function GlobalMap({ resp, existing, onSave, onExit }) {
  const G = globalOf(resp);
  const imp = G.imp;
  const SUP = [
    { id: "cn", f: "🇨🇳", n: "China", d: "Cheapest · 30 days by ship", usdIn: imp.usd, localExtra: 0 },
    { id: "mx", f: "🇲🇽", n: "Mexico", d: "Trade agreement · 7 days · a bit more expensive", usdIn: +(imp.usd * 1.15).toFixed(2), localExtra: 0 },
    { id: "co", f: "🇨🇴", n: "Local supplier", d: "More expensive in pesos · NO dollar risk", usdIn: 0, localExtra: Math.round(imp.usd * WORLD94.usd0 * 1.35) },
  ];
  const [sup, setSup] = useState(existing?.supplier || "");
  const [mkt, setMkt] = useState(existing?.target || "");
  const [why, setWhy] = useState(existing?.why || "");
  const [st, finish] = useFinish(onSave);
  const S = SUP.find((x) => x.id === sup);
  const unitWith = (x) => Math.round(G.local + x.localExtra + x.usdIn * WORLD94.usd0);
  const M = MKT_P1.find((x) => x.id === mkt);
  const G2 = [W_REASON];
  if (st.done) return <Reward title={`${G.name} is on the world map! 🗺️`} subtitle={`Supplier: ${S.f} ${S.n} · target: ${M.f} ${M.n}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<MapIcon size={22} strokeWidth={2.1} />} title={`Build Your Global Company · ${G.logo} ${G.name} 🗺️`} subtitle="Founder Page 18 · Your Period 3 startup goes global. Where do you buy? Where could you sell?" onExit={onExit}>
      <Brief91 k="c1_map" />
      <PBadge n="18" />
      <NeedP3 resp={resp} />
      <div className="start-block">
        <h3>📦 1 · Your {G.P.prod.toLowerCase()} needs {imp.item}. Who supplies it?</h3>
        <div className="g94-cards">{SUP.map((x) => <button key={x.id} type="button" className={sup === x.id ? "on" : ""} onClick={() => setSup(x.id)}><em>{x.f}</em><b>{x.n}</b><small>{x.d}</small><span>{x.usdIn ? `${usdTxt(x.usdIn)} per unit` : `+${cop(x.localExtra)} in pesos`}</span><strong>Unit cost: {cop(unitWith(x))}</strong></button>)}</div>
        {S && <p className={`g91-note ${S.usdIn ? "neg" : "pos"}`}>{S.usdIn ? `⚠️ Part of your cost is in dollars (${usdTxt(S.usdIn)}). If the dollar jumps, your cost jumps too.` : "💚 No dollar risk — but you pay a bit more today."}</p>}
      </div>
      <div className="start-block">
        <h3>🌎 2 · Where could you SELL in the future?</h3>
        <div className="g94-cards">{MKT_P1.map((x) => <button key={x.id} type="button" className={mkt === x.id ? "on" : ""} onClick={() => setMkt(x.id)}><em>{x.f}</em><b>{x.n}</b><small>{x.d}</small><span>Shipping ≈ {cop(x.ship)} / unit</span></button>)}</div>
      </div>
      {S && M && (
        <div className="g94-globe" id="g94-globe">
          <header><em>{G.logo}</em><div><small>🗺️ GLOBAL MAP · FOUNDER PAGE 18</small><b>{G.name}</b></div></header>
          <div className="g94-flow"><span>{S.f} {S.n}<small>{imp.item}</small></span><i>➜</i><span>🇨🇴 {G.name}<small>{G.P.prod}</small></span><i>➜</i><span>🇨🇴 Colombia<small>{G.sales} customers</small></span><i>➜</i><span>{M.f} {M.n}<small>future market</small></span></div>
        </div>
      )}
      <div className="start-block"><h3>✍️ Why these choices?</h3><WordField value={why} onChange={setWhy} min={12} max={45} rows={2} placeholder="I chose … because … In the future, we want to sell in … because …" goals={G2} /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!S || !M || !goalsOk(why, 12, 45, G2)} onClick={() => finish(28, { supplier: sup, usdIn: S.usdIn, localExtra: S.localExtra, target: mkt, why })}>Save Founder Page 18 <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 2 · WHEN THE DOLLAR JUMPED
   ===================================================================== */
const COS_P2 = [
  { id: "exp", e: "☕", n: "Coffee Exporter", d: "Sells US$10,000 of coffee · costs $30,000,000 + US$1,500 of fertilizer", f: (r) => 10000 * r - 30000000 - 1500 * r },
  { id: "imp", e: "📱", n: "Tech Importer", d: "Buys US$20,000 of phones · sells them for $95,000,000", f: (r) => 95000000 - 20000 * r },
  { id: "mix", e: "👕", n: "Clothing Store", d: "Sells $40,000,000 · materials $15,000,000 + US$4,000", f: (r) => 25000000 - 4000 * r },
];
const RATES_P2 = [WORLD94.usd0, WORLD94.usd1, WORLD94.usd2];
function DollarCoaster({ onSave, onExit }) {
  const [round, setRound] = useState(0);
  const [pred, setPred] = useState({});
  const [shown, setShown] = useState(0);
  const [twist, setTwist] = useState({});
  const [st, finish] = useFinish(onSave);
  const right = [1, 2].reduce((a, rd) => a + COS_P2.filter((c) => pred[`${rd}-${c.id}`] === (c.f(RATES_P2[rd]) > c.f(RATES_P2[rd - 1]) ? "up" : "down")).length, 0);
  const canReveal = round > 0 && COS_P2.every((c) => pred[`${round}-${c.id}`]);
  const nT = Object.keys(twist).length;
  if (st.done) return <Reward title="You survived the rollercoaster! 🎢" subtitle={`${right}/6 predictions right`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<TrendingUp size={22} strokeWidth={2.1} />} title="Dollar Rollercoaster 🎢" subtitle="Three companies, three rounds of the dollar. Predict who wins and who loses — then see the real numbers. (Simulation values.)" onExit={onExit}>
      <Brief91 k="c2_coaster" />
      <div className="g94-rates">{RATES_P2.map((r, i) => <div key={i} className={i <= shown ? "on" : ""}><small>Round {i + 1}</small><b>{i <= shown ? cop(r) : "?"}</b></div>)}</div>
      <div className="g94-cos">{COS_P2.map((c) => (
        <div key={c.id}>
          <header><em>{c.e}</em><b>{c.n}</b></header><p>{c.d}</p>
          {RATES_P2.slice(0, shown + 1).map((r, i) => { const v = c.f(r); return <span key={i} className={v >= 0 ? "pos" : "neg"}>R{i + 1}: {cop(v)}{i > 0 ? (v > c.f(RATES_P2[i - 1]) ? " 📈" : " 📉") : ""}</span>; })}
          {round > shown && <Tri value={pred[`${round}-${c.id}`]} onPick={(v) => setPred({ ...pred, [`${round}-${c.id}`]: v })} opts={[["up", "📈 Profit up"], ["down", "📉 Profit down"]]} />}
        </div>
      ))}</div>
      {shown < 2 ? (
        <div className="start-foot">{round === shown ? <button className="s1-btn primary big" onClick={() => setRound(round + 1)}>The dollar moves… ({round === 0 ? "$3,800 → ?" : "$4,500 → ?"}) 🎢</button> : <button className="s1-btn primary big" disabled={!canReveal} onClick={() => setShown(round)}>Reveal round {round + 1} 👀</button>}</div>
      ) : (
        <>
          <div className="p1-banner good"><span>{right}/6 predictions right. When the dollar went UP, the exporter won and the importer lost. When it went DOWN, the opposite. The clothing store was in the middle: part of its costs were in dollars.</span></div>
          <PickOne tag="IMPORTER VS. EXPORTER · TWIST 1" q="The coffee exporter also buys fertilizer in dollars. When the dollar goes up, its profit…" options={["Grows, but less than its income", "Grows exactly as much as its income, because costs in dollars never change with the exchange rate", "Falls", "Stays the same"]} correct={0} explain="Dollar costs eat part of the benefit." onRight={(w) => setTwist((t) => ({ ...t, a: w }))} />
          <PickOne tag="TWIST 2" q="An importer that also sells some products ABROAD in dollars is…" options={["Partly protected — dollar income balances dollar costs", "Completely ruined, because importers always lose money when they have any income in dollars", "Illegal", "A bank"]} correct={0} explain="It's not always simple: many companies have both." onRight={(w) => setTwist((t) => ({ ...t, b: w }))} />
          <div className="start-foot"><button className="s1-btn primary big" disabled={nT < 2} onClick={() => finish(14 + right * 2 + Object.values(twist).filter((w) => w === 0).length * 2, { right, twist })}>Finish <span className="coin-tag"><Coins size={15} /> +{14 + right * 2 + Object.values(twist).filter((w) => w === 0).length * 2}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- CURRENCY EXCHANGE ESCAPE ROOM ---------- */
const ESC_P2 = [
  { tag: "✈️ GATE 1 · PESOS → DOLLARS", q: "You have $410,000 pesos. The dollar is $4,100. How many dollars can you buy?", answer: 100, unit: "US$", hint: "410,000 ÷ 4,100", explain: "US$100. 🔑 Digit: 3", digit: 3 },
  { tag: "✈️ GATE 2 · DOLLARS → PESOS", q: "You receive US$250. The dollar is $4,100. How many pesos is that?", answer: 1025000, money: true, hint: "250 × 4,100", explain: "$1,025,000. 🔑 Digit: 0", digit: 0 },
  { tag: "✈️ GATE 3 · COMPARE", q: "You want to SELL US$100. Exchange A pays $4,050 per dollar; Exchange B pays $4,180. Which is better?", options: ["Exchange B — you get $418,000", "Exchange A, because a lower number per dollar always means a better deal for the seller", "Same", "Neither"], correct: 0, hint: "You are selling dollars: you want MORE pesos.", explain: "B gives $13,000 more. 🔑 Digit: 5", digit: 5 },
  { tag: "✈️ GATE 4 · AN IMPORT", q: "You import 300 parts at US$2 each. The dollar is $4,100. What do they cost in pesos?", answer: 2460000, money: true, hint: "300 × 2 × 4,100", explain: "$2,460,000. 🔑 Digit: 8", digit: 8 },
  { tag: "✈️ GATE 5 · WHO WINS?", q: "The peso loses value against the dollar. Which business benefits most?", options: ["A flower farm that exports to the U.S.", "A store that imports all its electronics from Asia and pays its suppliers in dollars", "A tourist traveling abroad", "Nobody"], correct: 0, hint: "Who RECEIVES dollars?", explain: "Exporters receive more pesos. 🔑 Digit: 2", digit: 2 },
];
function CurrencyEscape({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [res, setRes] = useState(null);
  const [code, setCode] = useState("");
  const [bad, setBad] = useState(false);
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Boarding pass unlocked! ✈️" subtitle="You escaped the airport." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Plane size={22} strokeWidth={2.1} />} title="Currency Exchange Escape Room ✈️" subtitle="You are stuck in an international airport. Solve 5 currency operations to get your boarding pass." onExit={onExit}>
      <Brief91 k="c2_escape" />
      {stage === 0 ? <RoundsRunner rounds={ESC_P2} doneLabel="Go to the gate 🛫" onDone={(r) => { setRes(r); setStage(1); }} /> : (
        <div className="start-block g93-door">
          <em>🛫</em>
          <h3>Enter your 5-digit boarding code (the 🔑 digits, in order)</h3>
          <input className="start-input g93-code" maxLength={5} value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setBad(false); }} placeholder="•••••" />
          {bad && <p className="g91-note neg">The gate stays closed… check your digits.</p>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={code.length < 5} onClick={() => { if (code === ESC_P2.map((x) => x.digit).join("")) finish(18 + res.firstTry * 3, { firstTry: res.firstTry }); else setBad(true); }}>Board the plane ✈️</button></div>
        </div>
      )}
    </ActShell>
  );
}

/* ---------- FOUNDER PAGE 19 · Protect My Business (riesgo cambiario) ---------- */
function ProtectBusiness({ resp, existing, onSave, onExit }) {
  const G = globalOf({ ...resp, c2_protect: null, c3_cost: null, c6_redesign: null, c4_export: null });
  const imp = G.imp;
  const usdIn = G.usdIn;
  const STR = [
    { id: "fixed", n: "🤝 Negotiate a fixed price: $4,000 per dollar for 6 months", p: { usdIn, localExtra: 0, price: G.price, demandF: 1, rateFix: 4000 } },
    { id: "local", n: "🇨🇴 Find a local supplier (no dollars)", p: { usdIn: 0, localExtra: usdIn ? Math.round(usdIn * WORLD94.usd0 * 1.35) : 0, price: G.price, demandF: 1 } },
    { id: "price", n: "🏷️ Increase the selling price 8%", p: { usdIn, localExtra: 0, price: Math.round((G.price * 1.08) / 500) * 500, demandF: 0.92 } },
    { id: "design", n: "🛠️ Change the design: 50% less imported input", p: { usdIn: +(usdIn * 0.5).toFixed(2), localExtra: usdIn ? Math.round(usdIn * WORLD94.usd0 * 0.15) : 0, price: G.price, demandF: 0.98 } },
    { id: "keep", n: "🙈 Keep the current supplier and absorb the cost", p: { usdIn, localExtra: 0, price: G.price, demandF: 1 } },
  ];
  const profitAt = (x, rate) => { const unit = G.local + x.localExtra + x.usdIn * (x.rateFix || rate); return Math.round(Math.round(G.sales * x.demandF) * (x.price - unit) - G.fixed); };
  const [pick, setPick] = useState(existing?.strategy || "");
  const [why, setWhy] = useState(existing?.why || "");
  const [st, finish] = useFinish(onSave);
  const X = STR.find((s) => s.id === pick);
  const Gw = [W_REASON, W_CONTRAST];
  if (st.done) return <Reward title="Currency risk managed! 💵" subtitle={X.n} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<ShieldCheck size={22} strokeWidth={2.1} />} title={`Protect My Business · ${G.logo} ${G.name} 💵`} subtitle="Founder Page 19 · Your supplier writes: “Because of the dollar, our prices go up.” Choose a strategy — and test it in two scenarios." onExit={onExit}>
      <Brief91 k="c2_protect" />
      <PBadge n="19" />
      <NeedP3 resp={resp} />
      <div className="g93-investor"><em>📧</em><div><small>EMAIL FROM YOUR SUPPLIER</small><b>{usdIn ? `“The dollar jumped to ${cop(WORLD94.usd1)}. Your ${imp.item} now costs ${cop(Math.round(usdIn * WORLD94.usd1))} per unit instead of ${cop(Math.round(usdIn * WORLD94.usd0))}.”` : "“You buy locally, so the dollar doesn't hit you directly… but your competitors are worried.”"}</b></div></div>
      <div className="g94-table">
        <div className="h"><span>Strategy</span><span>Profit if dollar = {cop(WORLD94.usd1)}</span><span>Profit if dollar = {cop(WORLD94.usd2)}</span></div>
        {STR.map((s) => <button key={s.id} type="button" className={pick === s.id ? "on" : ""} onClick={() => setPick(s.id)}><span>{s.n}</span><b className={profitAt(s.p, WORLD94.usd1) >= 0 ? "pos" : "neg"}>{cop(profitAt(s.p, WORLD94.usd1))}</b><b className={profitAt(s.p, WORLD94.usd2) >= 0 ? "pos" : "neg"}>{cop(profitAt(s.p, WORLD94.usd2))}</b></button>)}
      </div>
      <p className="start-tip">💡 No strategy wins in every scenario. A fixed price protects you if the dollar rises; a price increase can lose customers; a local supplier costs more today.</p>
      <div className="start-block"><h3>✍️ My currency risk strategy</h3><WordField value={why} onChange={setWhy} min={15} max={55} rows={3} placeholder="I choose … because … However, if the dollar …" goals={Gw} /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!X || !goalsOk(why, 15, 55, Gw)} onClick={() => finish(28, { strategy: pick, ...X.p, why, profit45: profitAt(X.p, WORLD94.usd1), profit41: profitAt(X.p, WORLD94.usd2) })}>Save Founder Page 19 <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 3 · THE INFLATION THERMOSTAT
   ===================================================================== */
const cbStep = (prev, rate, prevRate) => {
  const infl = +(prev.infl + 0.1 - 0.6 * (prevRate - 6.5)).toFixed(1);
  const gdp = +Math.max(-3, Math.min(5, 2.2 - 0.35 * (rate - 6.5) - 0.25 * (prevRate - 6.5))).toFixed(1);
  const unemp = +Math.max(4, prev.unemp - 0.35 * (gdp - 1.5)).toFixed(1);
  return { infl, gdp, unemp };
};
function CBSim2({ resp, onSave, onExit }) {
  const p1rate = resp?.__p1?.c4_desk?.policy;
  const [rate, setRate] = useState(WORLD94.rate);
  const [hist, setHist] = useState([{ q: "Start", infl: WORLD94.infl, gdp: WORLD94.gdp, unemp: WORLD94.unemp, rate: WORLD94.rate }]);
  const [why, setWhy] = useState(null);
  const [st, finish] = useFinish(onSave);
  const last = hist[hist.length - 1];
  const q = hist.length - 1;
  const play = () => { const prevRate = last.rate; const n = cbStep(last, rate, prevRate); setHist([...hist, { q: `Q${q + 1}`, ...n, rate }]); };
  const done = q >= 4;
  const win = done && last.infl <= 5 && last.unemp <= 10.5 && last.gdp >= 0.5;
  if (st.done) return <Reward title={win ? "Soft landing! 🛬" : "The economy survived… 🌡️"} subtitle={`Inflation ${last.infl}% · unemployment ${last.unemp}% · GDP ${last.gdp}%`} coins={st.coins} saving={st.saving} onExit={onExit} gold={win} />;
  return (
    <ActShell icon={<Gauge size={22} strokeWidth={2.1} />} title="Central Bank Simulator 2.0 🌡️" subtitle="You are the president of the central bank of a fictional economy. 4 quarters. Bring inflation down to 5% or less — without destroying jobs." onExit={onExit}>
      <Brief91 k="c3_cb" />
      {p1rate != null && <div className="g92-carry"><em>🏛️</em><div><small>FROM PERIOD 1</small><b>In Class 4 you set the policy rate at {p1rate}%</b><span>Now you will see what happens over a whole year — with the real delays of the economy.</span></div></div>}
      <div className="g94-dash">
        <div className={last.infl <= 5 ? "ok" : "no"}><small>🎈 Inflation</small><b>{last.infl}%</b><span>target ≤ 5%</span></div>
        <div className={last.unemp <= 10.5 ? "ok" : "no"}><small>👷 Unemployment</small><b>{last.unemp}%</b><span>keep ≤ 10.5%</span></div>
        <div className={last.gdp >= 0.5 ? "ok" : "no"}><small>🏭 GDP growth</small><b>{last.gdp}%</b><span>keep ≥ 0.5%</span></div>
        <div><small>🎚️ Policy rate</small><b>{last.rate}%</b><span>{done ? "final" : `quarter ${q + 1}/4`}</span></div>
      </div>
      {hist.length > 1 && <LineChart series={[{ name: "Inflation", color: "#ff6b57", values: hist.map((h) => h.infl) }, { name: "Unemployment", color: "#f5b23e", values: hist.map((h) => h.unemp) }, { name: "GDP growth", color: "#16b074", values: hist.map((h) => h.gdp) }, { name: "Policy rate", color: "#0b7a50", values: hist.map((h) => h.rate) }]} labels={hist.map((h) => h.q)} money={false} unit="%" yMin={-2} yMax={14} />}
      {hist.length > 1 && <ChartLegend series={[{ name: "Inflation", color: "#ff6b57" }, { name: "Unemployment", color: "#f5b23e" }, { name: "GDP growth", color: "#16b074" }, { name: "Policy rate", color: "#0b7a50" }]} />}
      {!done ? (
        <div className="start-block">
          <Ctl l={`🎚️ Policy rate for quarter ${q + 1}`} v={rate} set={setRate} mn={3} mx={14} stp={0.5} fmt={(v) => `${v}%`} />
          <p className="start-tip">💡 Your decision affects GDP now, but inflation mostly NEXT quarter (the delay!). Simplified model for learning.</p>
          <div className="p3-card-actions"><button className="s1-btn primary" onClick={play}><Gavel size={16} /> Announce the rate</button></div>
        </div>
      ) : (
        <>
          <div className={`p1-banner ${win ? "good" : "bad"}`}><span>{win ? "🛬 Soft landing: inflation is under control and the economy keeps growing." : last.infl > 5 ? "Inflation is still high — maybe you moved too little or too late." : "Inflation fell, but the economy cooled too much. Maybe you raised the rate too far for too long."}</span></div>
          <PickOne tag="THE DELAY" q="Why didn't inflation fall immediately when you raised the rate?" options={["Rates take months to affect prices", "Because raising rates always makes inflation go up forever, so central banks should never do it", "The model is broken", "Prices never change"]} correct={0} explain="Monetary policy works with a delay of months — central bankers must look ahead." onRight={setWhy} />
          <div className="start-foot"><button className="s1-btn primary big" disabled={why === null} onClick={() => finish(20 + (win ? 10 : 0) + (why === 0 ? 3 : 0), { win, final: last, rates: hist.slice(1).map((h) => h.rate) })}>Close the year <span className="coin-tag"><Coins size={15} /> +{20 + (win ? 10 : 0) + (why === 0 ? 3 : 0)}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- BASKET OF THE YEAR ---------- */
const BASKET_P3 = [["🍚 Rice (1 kg)", 4000, 4400], ["🥛 Milk (1 L)", 4500, 4900], ["🥚 Eggs (30)", 18000, 21000], ["🍞 Bread", 6000, 6500], ["🚌 Transport (20 trips)", 58000, 62000], ["💡 Electricity", 120000, 132000]];
const BasketTable = () => <div className="g94-table basket"><div className="h"><span>Product</span><span>Last year</span><span>This year</span></div>{BASKET_P3.map(([n, a, b]) => <div key={n}><span>{n}</span><b>{cop(a)}</b><b>{cop(b)}</b></div>)}</div>;
const BASKET_R = [
  { tag: "🧺 1/4", q: "What did the whole basket cost LAST year?", answer: 210500, money: true, hint: "Add the first column.", explain: "$210,500.", visual: <BasketTable /> },
  { tag: "🧺 2/4", q: "What does it cost THIS year?", answer: 230800, money: true, hint: "Add the second column.", explain: "$230,800.", visual: <BasketTable /> },
  { tag: "🧺 3/4", q: "By what percentage did the basket increase? (one decimal)", answer: 9.6, tol: 0.15, unit: "%", hint: "(230,800 − 210,500) ÷ 210,500 × 100", explain: "About 9.6% — that's the inflation of this basket." },
  { tag: "🧺 4/4", q: "Which product had the BIGGEST impact on the increase (in pesos)?", options: ["Electricity (+$12,000)", "Eggs, because they went up $3,000, which is the biggest percentage of all the products", "Bread", "Rice"], correct: 0, hint: "Compare the differences in pesos.", explain: "Big items with small % increases can hurt the most." },
];

/* ---------- FOUNDER PAGE 20 · The Business Cost Explosion ---------- */
const RESP_P3 = [
  { id: "price", n: "🏷️ Raise the price 6%", u: 0, p: 0.06, d: 0.95 },
  { id: "waste", n: "♻️ Reduce waste in production (−4% unit cost)", u: -0.04, p: 0, d: 1 },
  { id: "supplier", n: "🤝 Change to a cheaper supplier (−5% unit cost, small quality risk)", u: -0.05, p: 0, d: 0.98 },
  { id: "product", n: "🛠️ Modify the product: smaller size (−7% unit cost)", u: -0.07, p: 0, d: 0.96 },
];
function CostExplosion({ resp, existing, onSave, onExit }) {
  const G = globalOf({ ...resp, c3_cost: null, c6_redesign: null, c4_export: null });
  const local1 = Math.round(G.local * 1.1), fixed1 = Math.round(G.fixed * 1.05);
  const [pick, setPick] = useState(existing?.responses || []);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const imp = G.usdIn * G.rate;
  const before = Math.round(G.sales * (G.price - G.local - imp) - G.fixed);
  const shock = Math.round(G.sales * (G.price - local1 - imp) - fixed1);
  const R = RESP_P3.filter((x) => pick.includes(x.id));
  const local2 = Math.round(local1 * (1 + R.reduce((a, x) => a + x.u, 0)));
  const price2 = Math.round((G.price * (1 + R.reduce((a, x) => a + x.p, 0))) / 100) * 100;
  const dF = R.reduce((a, x) => a * x.d, 1);
  const after = Math.round(Math.round(G.sales * dF) * (price2 - local2 - imp) - fixed1);
  const Gw = [W_REASON, W_NUMBERS(1)];
  if (st.done) return <Reward title="Survival plan ready! 🌡️" subtitle={`Profit: ${cop(shock)} after the shock → ${cop(after)} with your plan`} coins={st.coins} saving={st.saving} onExit={onExit} gold={after > 0} />;
  return (
    <ActShell icon={<Flame size={22} strokeWidth={2.1} />} title={`The Business Cost Explosion · ${G.logo} ${G.name} 💥`} subtitle="Founder Page 20 · Inflation hits your startup. Choose up to 2 responses and build your economic survival plan." onExit={onExit}>
      <Brief91 k="c3_cost" />
      <PBadge n="20" />
      <NeedP3 resp={resp} />
      <div className="g94-shock">{[["🧱 Raw materials", "+12%"], ["🚚 Transport", "+8%"], ["💡 Electricity", "+10%"], ["📦 Packaging", "+15%"]].map(([l, v]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}</div>
      <div className="g84-results g91-results"><div><small>PROFIT BEFORE</small><b>{cop(before)}</b></div><div><small>AFTER THE SHOCK</small><b>{cop(shock)}</b></div><div><small>WITH MY PLAN</small><b>{cop(after)}</b></div><div><small>UNIT COST · PRICE</small><b>{cop(local2 + Math.round(imp))} · {cop(price2)}</b></div></div>
      <div className="start-block"><h3>🛠️ My responses (choose 1–2)</h3><div className="g92-opts">{RESP_P3.map((x) => <button key={x.id} type="button" className={pick.includes(x.id) ? "ok" : ""} onClick={() => setPick(pick.includes(x.id) ? pick.filter((y) => y !== x.id) : pick.length < 2 ? [...pick, x.id] : pick)}>{x.n}{x.d < 1 ? ` · customers −${Math.round((1 - x.d) * 100)}%` : ""}</button>)}</div>{after <= 0 && pick.length > 0 && <p className="g91-note neg">Still losing money — try another combination.</p>}</div>
      <div className="start-block"><h3>✍️ My economic survival plan</h3><WordField value={text} onChange={setText} min={15} max={55} rows={3} placeholder="Inflation increased our costs, so we … because … Our profit will be …" goals={Gw} /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!pick.length || !goalsOk(text, 15, 55, Gw)} onClick={() => finish(28, { responses: pick, price: price2, fixed: fixed1, local: local2, demandF: dF, before, shock, after, text })}>Save Founder Page 20 <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 4 · COLOMBIA EXPORTS — THE DISTRICT TIMES
   ===================================================================== */
function DistrictTimes({ onSave, onExit }) {
  const [stage, setStage] = useState("read");
  const [open, setOpen] = useState({});
  const N = NEWS_P4;
  const all = N.briefs.every((_, i) => open[i]);
  if (stage === "quiz") return <QuizRunner title="The District Times · check" emoji="📰" questions={Q_NEWS} pickCount={6} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={onSave} onExit={onExit} />;
  return (
    <ActShell icon={<Newspaper size={22} strokeWidth={2.1} />} title="The District Times 📰" subtitle="Read today's economy newspaper. Open every story (6) — then answer 6 questions." onExit={onExit}>
      <Brief91 k="c4_news" />
      <div className="g94-paper">
        <header><small>{N.date}</small><h2>The District Times</h2><span>ECONOMY · TRADE · MONEY · Fictional newspaper based on real topics</span></header>
        <article className="lead"><em>{N.lead.img}</em><div><small>{N.lead.kicker}</small><h3>{N.lead.h}</h3><b>{N.lead.d}</b><p>{N.lead.p}</p></div></article>
        <div className="g94-cols">
          {N.briefs.map((b, i) => <button key={i} type="button" className={open[i] ? "on" : ""} onClick={() => setOpen({ ...open, [i]: true })}><small>{b.e} {b.kicker}</small><h4>{b.h}</h4>{open[i] ? <p>{b.p}</p> : <i>Tap to read the story</i>}</button>)}
        </div>
        <div className="g94-paper-foot">
          <div className="data"><small>📊 MARKET DATA</small>{N.data.map(([l, v]) => <p key={l}><span>{l}</span><b>{v}</b></p>)}</div>
          <div className="op"><small>✍️ {N.opinion.h}</small><p>{N.opinion.p}</p><span>{N.opinion.by}</span></div>
          <div className="ad"><small>ADVERTISEMENT</small><b>{N.ad.h}</b><p>{N.ad.p}</p><i>{N.ad.note}</i></div>
        </div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!all} onClick={() => setStage("quiz")}>{all ? "I read the newspaper — quiz (6 questions)" : `Open all the stories (${Object.keys(open).length}/${N.briefs.length})`} <ChevronRight size={18} /></button></div>
    </ActShell>
  );
}

/* ---------- TRADE DEAL EXPLORER ---------- */
const HAVE_P4 = [["es", "Spanish labels", true], ["san", "Sanitary permit (INVIMA)", true], ["cert", "Quality certificate", false], ["en", "English labels", false]];
const MARKETS_P4 = [
  { id: "USA", f: "🇺🇸", n: "United States", demand: "Very high", price: "US$4.00", ship: "US$0.60", tariff: "0% (trade agreement)", req: ["en", "cert", "san"] },
  { id: "Mexico", f: "🇲🇽", n: "Mexico", demand: "Medium", price: "US$3.20", ship: "US$0.45", tariff: "0% (Pacific Alliance)", req: ["es", "san"] },
  { id: "Chile", f: "🇨🇱", n: "Chile", demand: "Medium-low", price: "US$3.60", ship: "US$0.50", tariff: "0% (Pacific Alliance)", req: ["es", "cert"] },
];
function TradeExplorer({ onSave, onExit }) {
  const [pick, setPick] = useState(null);
  const [tries, setTries] = useState(0);
  const [ok, setOk] = useState(false);
  const [why, setWhy] = useState(null);
  const [st, finish] = useFinish(onSave);
  const can = (m) => m.req.every((r) => HAVE_P4.find((h) => h[0] === r)[2]);
  const M = MARKETS_P4.find((m) => m.id === pick);
  const choose = (id) => { setPick(id); const m = MARKETS_P4.find((x) => x.id === id); if (can(m)) setOk(true); else { setOk(false); setTries(tries + 1); } };
  if (st.done) return <Reward title="Market chosen! 🌎" subtitle={`${M.f} ${M.n} — you can meet its requirements today.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title="Trade Deal Explorer 🌎" subtitle="Your company wants to export next month. The biggest market is not always the right one: can you MEET its requirements?" onExit={onExit}>
      <Brief91 k="c4_market" />
      <div className="start-block"><h3>🧾 What your company has today</h3><div className="g94-have">{HAVE_P4.map(([k, l, h]) => <span key={k} className={h ? "ok" : "no"}>{h ? "✅" : "❌"} {l}</span>)}</div><p className="start-tip">Getting a quality certificate takes about 3 months. English labels need a translator and new packaging.</p></div>
      <div className="g94-cards">{MARKETS_P4.map((m) => <button key={m.id} type="button" className={pick === m.id ? (ok ? "on" : "no") : ""} onClick={() => choose(m.id)}><em>{m.f}</em><b>{m.n}</b><small>Demand: {m.demand} · price {m.price} · shipping {m.ship}</small><small>Tariff: {m.tariff}</small><span>Needs: {m.req.map((r) => HAVE_P4.find((h) => h[0] === r)[1]).join(" · ")}</span></button>)}</div>
      {pick && !ok && <div className="p1-banner bad"><span>❌ You can't meet all the requirements of {M.n} yet. Your cargo would be stopped at customs.</span></div>}
      {ok && <><div className="p1-banner good"><span>✅ {M.n}: you meet every requirement today. A smaller market you CAN serve beats a giant market you can't.</span></div><PickOne q="Why not simply choose the market with the highest demand?" options={["You must be able to meet its requirements", "Because big markets always pay less and never buy products from small countries like Colombia", "It's too far", "No reason"]} correct={0} explain="Opportunity = demand + your capacity to comply." onRight={setWhy} /></>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok || why === null} onClick={() => finish(Math.max(14, 26 - tries * 4), { market: pick, tries })}>Choose this market <span className="coin-tag"><Coins size={15} /> +{Math.max(14, 26 - tries * 4)}</span></button></div>
    </ActShell>
  );
}

/* ---------- CUSTOMS CONTROL ---------- */
const FORM_P4 = [
  { k: "exp", l: "Exporter", v: "SaveBite SAS · Bogotá, Colombia", bad: false },
  { k: "desc", l: "Product description", v: "Stuff", bad: true, fix: "Bakery products in sealed bags (surprise bags)" },
  { k: "qty", l: "Quantity", v: "500 bags (packing list says 520)", bad: true, fix: "520 bags (same as the packing list)" },
  { k: "wt", l: "Total weight", v: "260 kg", bad: false },
  { k: "label", l: "Product label", v: "No label on the bags", bad: true, fix: "Spanish label with ingredients and expiry date" },
  { k: "cert", l: "Sanitary permit", v: "—", bad: true, fix: "Sanitary permit number attached" },
  { k: "dest", l: "Destination", v: "Mexico City, Mexico", bad: false },
  { k: "addr", l: "Buyer's address", v: "Calle 5", bad: true, fix: "Calle 5 #12-30, Col. Roma, Mexico City, CP 06700" },
];
function Customs({ onSave, onExit }) {
  const [flag, setFlag] = useState([]);
  const [checked, setChecked] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [st, finish] = useFinish(onSave);
  const right = FORM_P4.filter((f) => f.bad === flag.includes(f.k)).length;
  if (st.done) return <Reward title="Cargo released! 🛃" subtitle={`${right}/8 fields checked correctly`} coins={st.coins} saving={st.saving} onExit={onExit} gold={right === 8} />;
  return (
    <ActShell icon={<Package size={22} strokeWidth={2.1} />} title="Customs Control 🛃" subtitle="Your cargo is at the border. The customs officer found 5 errors in the export document. Find them before your cargo is held!" onExit={onExit}>
      <Brief91 k="c4_customs" />
      <div className="g94-doc">
        <header><b>📄 EXPORT DECLARATION · DRAFT</b><span>{flag.length} field(s) flagged</span></header>
        {FORM_P4.map((f) => <button key={f.k} type="button" disabled={checked} className={`${flag.includes(f.k) ? "flag" : ""} ${checked ? (f.bad === flag.includes(f.k) ? "ok" : "no") : ""}`} onClick={() => setFlag(flag.includes(f.k) ? flag.filter((x) => x !== f.k) : [...flag, f.k])}><span>{f.l}</span><b>{fixed && f.bad ? f.fix : f.v}</b>{flag.includes(f.k) && <i>🚩</i>}</button>)}
      </div>
      {checked && <div className={`p1-banner ${right === 8 ? "good" : "bad"}`}><span>{right}/8 correct. Errors: vague description, wrong quantity, missing label, missing permit, incomplete address. {!fixed && "Press “Correct the document”."}</span></div>}
      <div className="start-foot">{!checked ? <button className="s1-btn primary big" disabled={!flag.length} onClick={() => setChecked(true)}>Send to the officer 🛃</button> : !fixed ? <button className="s1-btn primary big" onClick={() => setFixed(true)}>Correct the document ✏️</button> : <button className="s1-btn primary big" onClick={() => finish(14 + right * 2, { right })}>Release the cargo <span className="coin-tag"><Coins size={15} /> +{14 + right * 2}</span></button>}</div>
    </ActShell>
  );
}

/* ---------- FOUNDER PAGE 21 · My Export Plan (calculadora + subasta) ---------- */
function ExportPlan({ resp, existing, onSave, onExit }) {
  const G = globalOf({ ...resp, c4_export: null });
  const mk = resp?.c4_market?.market || resp?.c1_map?.target || "Mexico";
  const ship = { USA: 2500, Mexico: 1800, Chile: 2000 }[mk] || 1800;
  const pack = Math.round(G.unit * 0.08), ins = Math.round(G.unit * 0.02);
  const costX = G.unit + pack + ship + ins;
  const [margin, setMargin] = useState(existing?.margin || 30);
  const [buyer, setBuyer] = useState(existing?.buyer || "");
  const [st, finish] = useFinish(onSave);
  const priceCOP = Math.round(costX * (1 + margin / 100));
  const usd = +(priceCOP / WORLD94.usd2).toFixed(2);
  const cap = Math.max(200, Math.round(G.sales * 0.6));
  const BUY = [
    { id: "big", e: "🏬", n: "MegaMart", q: cap * 3, pay: +(usd * 0.9).toFixed(2), days: 15, note: "Huge order, fast delivery" },
    { id: "fair", e: "🛒", n: "Tienda Verde", q: Math.round(cap * 0.7), pay: +(usd * 1.05).toFixed(2), days: 45, note: "Pays well, normal delivery" },
    { id: "cheap", e: "🏷️", n: "BargainCo", q: cap, pay: +(costX / WORLD94.usd2 * 0.85).toFixed(2), days: 30, note: "Fair quantity, very low price" },
  ];
  const B = BUY.find((b) => b.id === buyer);
  const unitProfit = (b) => Math.round(b.pay * WORLD94.usd2 - costX);
  const feasible = (b) => b.q <= cap && b.days >= 30;
  const profit = B ? (feasible(B) ? unitProfit(B) * B.q : 0) : 0;
  const ok = B && feasible(B) && unitProfit(B) > 0;
  if (st.done) return <Reward title="Export plan ready! 🚢" subtitle={`${B.q} units to ${mk} at ${usdTxt(B.pay)} · profit ${cop(profit)} a month`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Truck size={22} strokeWidth={2.1} />} title={`My Export Plan · ${G.logo} ${G.name} 🚢`} subtitle={`Founder Page 21 · Calculate an export price for ${mk} in dollars — then choose the best international buyer.`} onExit={onExit}>
      <Brief91 k="c4_export" />
      <PBadge n="21" />
      <NeedP3 resp={resp} />
      <div className="g92-impact"><p><b>Production cost</b><span>{cop(G.unit)}</span></p><p><b>Export packaging (8%)</b><span>{cop(pack)}</span></p><p><b>Transport to {mk}</b><span>{cop(ship)}</span></p><p><b>Insurance (2%)</b><span>{cop(ins)}</span></p><p className="no"><b>Total export cost</b><span>{cop(costX)}</span></p></div>
      <div className="start-block">
        <Ctl l="📈 Desired margin" v={margin} set={setMargin} mn={10} mx={80} stp={5} fmt={(v) => `${v}%`} />
        <div className="g84-results g91-results"><div><small>PRICE IN PESOS</small><b>{cop(priceCOP)}</b></div><div><small>DOLLAR (SIMULATION)</small><b>{cop(WORLD94.usd2)}</b></div><div><small>EXPORT PRICE</small><b>{usdTxt(usd)}</b></div><div><small>MY CAPACITY / MONTH</small><b>{cap} units</b></div></div>
      </div>
      <div className="start-block">
        <h3>🔨 World Market Auction · three buyers want your product</h3>
        <div className="g94-cards">{BUY.map((b) => <button key={b.id} type="button" className={buyer === b.id ? (feasible(b) && unitProfit(b) > 0 ? "on" : "no") : ""} onClick={() => setBuyer(b.id)}><em>{b.e}</em><b>{b.n}</b><small>{b.note}</small><span>{b.q} units · {usdTxt(b.pay)} each · {b.days} days</span><strong className={unitProfit(b) > 0 ? "pos" : "neg"}>Profit per unit: {cop(unitProfit(b))}</strong></button>)}</div>
        {B && !feasible(B) && <p className="g91-note neg">❌ You can't produce {B.q} units in {B.days} days (capacity {cap}/month). Saying yes would break your promise.</p>}
        {B && feasible(B) && unitProfit(B) <= 0 && <p className="g91-note neg">❌ You would lose money on every unit.</p>}
        {ok && <p className="g91-note pos">✅ A deal you can deliver AND that makes money: {cop(profit)} profit per month.</p>}
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30, { market: mk, margin, usdPrice: B.pay, qty: B.q, profit, buyer })}>Save Founder Page 21 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 5 · ESG & GREENWASHING
   ===================================================================== */
const ESGCO_P5 = [["🌱 GreenBox", 90, 55, 80], ["👗 FastFashion", 25, 45, 60], ["☀️ SolarTech", 85, 75, 85], ["🥫 CheapFoods", 40, 80, 35]];
const ESGQ_P5 = [
  { q: "Which company is the most responsible OVERALL?", options: ["SolarTech — high in all three", "GreenBox, because the environment is the only part of ESG that investors really look at", "CheapFoods", "FastFashion"], correct: 0, explain: "Average ≈ 82. Balance matters." },
  { q: "Which company has the weakest governance?", options: ["CheapFoods (35)", "FastFashion, because its environmental score is the lowest of the four companies", "SolarTech", "GreenBox"], correct: 0, explain: "Governance = transparency and ethics." },
  { q: "What is FastFashion's biggest problem?", options: ["The environment (25)", "Governance, because the board of directors doesn't publish its financial reports", "Social", "None"], correct: 0, explain: "Waste and pollution in fast fashion." },
];
const CLAIMS_P5 = [
  { e: "🌿", t: "“100% eco-friendly!” (no data, no certificate)", a: "mis" },
  { e: "📦", t: "“Our boxes are 60% recycled cardboard — certified by an independent lab (public report).”", a: "ver" },
  { e: "🌍", t: "“We care about the planet.”", a: "need" },
  { e: "🌳", t: "“Carbon neutral!” (they only planted 10 trees for a factory with 200 trucks)", a: "mis" },
  { e: "♻️", t: "“Made with recycled materials.” (no percentage, no proof)", a: "need" },
  { e: "💧", t: "“We cut water use 30% in 2025 — see our audited sustainability report.”", a: "ver" },
];
function GreenDetector({ onSave, onExit }) {
  const [q, setQ] = useState({});
  const [cl, setCl] = useState({});
  const [checked, setChecked] = useState(false);
  const [st, finish] = useFinish(onSave);
  const nQ = Object.keys(q).length;
  const right = CLAIMS_P5.filter((c, i) => cl[i] === c.a).length;
  if (st.done) return <Reward title="Greenwashing detected! 🔍" subtitle={`${right}/6 claims classified correctly`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="ESG Scanner + Greenwashing Detector 🔍" subtitle="Part 1: read an ESG table. Part 2: which green claims have real evidence?" onExit={onExit}>
      <Brief91 k="c5_detector" />
      <div className="g94-table esg"><div className="h"><span>Company (fictional)</span><span>🌱 E</span><span>🤝 S</span><span>⚖️ G</span></div>{ESGCO_P5.map(([n, e, s, g]) => <div key={n}><span>{n}</span>{[e, s, g].map((v, i) => <b key={i} className={v >= 70 ? "pos" : v < 45 ? "neg" : ""}>{v}</b>)}</div>)}</div>
      {ESGQ_P5.map((x, k) => <PickOne key={k} tag={`ESG SCANNER ${k + 1}/3`} q={x.q} options={x.options} correct={x.correct} explain={x.explain} onRight={(w) => setQ((o) => ({ ...o, [k]: w }))} />)}
      {nQ === 3 && (
        <>
          <h3 className="g94-h">🔍 Part 2 · Greenwashing Detector</h3>
          {CLAIMS_P5.map((c, i) => (
            <div key={i} className={`start-block ${checked ? (cl[i] === c.a ? "ok" : "no") : ""}`}>
              <div className="g93-adcard"><em>{c.e}</em><div><small>GREEN CLAIM {i + 1}/6</small><p>{c.t}</p></div></div>
              <Tri value={cl[i]} onPick={(v) => !checked && setCl({ ...cl, [i]: v })} disabled={checked} opts={[["ver", "✅ Verified"], ["need", "❓ Needs evidence"], ["mis", "🚫 Misleading"]]} />
              {checked && <p className={`g91-note ${cl[i] === c.a ? "pos" : "neg"}`}>{c.a === "ver" ? "✅ Specific data + independent proof." : c.a === "need" ? "❓ Too vague: how much? Who checked it?" : "🚫 A big claim the facts don't support."}</p>}
            </div>
          ))}
          <div className="start-foot">{!checked ? <button className="s1-btn primary big" disabled={Object.keys(cl).length < 6} onClick={() => setChecked(true)}>Check my detector</button> : <button className="s1-btn primary big" onClick={() => finish(12 + right * 2 + Object.values(q).filter((w) => w === 0).length * 2, { right })}>Finish <span className="coin-tag"><Coins size={15} /> +{12 + right * 2 + Object.values(q).filter((w) => w === 0).length * 2}</span></button>}</div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- ESG CRISIS ROOM (mi startup) ---------- */
const CRISIS_P5 = [
  { e: "👷", d: "S", t: "An employee reports unfair working conditions: 12-hour days with no extra pay.", o: [["Investigate, fix the schedules and pay the extra hours", { S: 15 }, 1500000], ["Ask the employee to stay quiet", { S: -25, G: -10 }, 0], ["Give one day off and forget it", { S: -5 }, 200000]] },
  { e: "🏞️", d: "E", t: "A news report shows that one of your suppliers is polluting a river.", o: [["Audit the supplier and change it if it doesn't improve", { E: 15, G: 5 }, 1000000], ["Say “it's not our problem”", { E: -20, G: -5 }, 0], ["Post a photo of a tree on Instagram", { E: -15, G: -10 }, 100000]] },
  { e: "📣", d: "G", t: "Your marketing team published “100% eco!” without any data.", o: [["Remove the claim, apologize and publish real data", { G: 12, E: 3 }, 300000], ["Keep it — sales went up", { G: -20 }, 0], ["Change it to “super eco!”", { G: -15 }, 50000]] },
  { e: "💼", d: "G", t: "A manager is accused of asking suppliers for money in exchange for contracts.", o: [["Open an independent investigation and create clear rules", { G: 15, S: 5 }, 800000], ["Protect the manager — he sells a lot", { G: -30 }, 0], ["Move him to another team quietly", { G: -10 }, 0]] },
];
function ESGCrisis({ resp, onSave, onExit }) {
  const G = globalOf(resp);
  const [sc, setSc] = useState({ E: 55, S: 60, G: 60 });
  const [ev, setEv] = useState(0);
  const [cost, setCost] = useState(0);
  const [log, setLog] = useState([]);
  const [orders] = useState(() => CRISIS_P5.map(() => shuffleArr([0, 1, 2])));
  const [st, finish] = useFinish(onSave);
  const C = CRISIS_P5[ev];
  const avg = Math.round((sc.E + sc.S + sc.G) / 3);
  const choose = (k) => { const o = C.o[k]; const n = { ...sc }; Object.entries(o[1]).forEach(([d, v]) => { n[d] = Math.max(0, Math.min(100, n[d] + v)); }); setSc(n); setCost(cost + o[2]); setLog([...log, { e: C.e, t: o[0], good: k === 0 }]); setEv(ev + 1); };
  const done = ev >= CRISIS_P5.length;
  const good = log.filter((x) => x.good).length;
  if (st.done) return <Reward title="Crisis managed! 🚨" subtitle={`ESG score ${avg}/100 · cost ${cop(cost)}`} coins={st.coins} saving={st.saving} onExit={onExit} gold={avg >= 70} />;
  return (
    <ActShell icon={<ShieldAlert size={22} strokeWidth={2.1} />} title={`ESG Crisis Room · ${G.logo} ${G.name} 🚨`} subtitle="Four bad news stories hit your startup. Every decision changes your ESG score — and your costs." onExit={onExit}>
      <Brief91 k="c5_crisis" />
      <NeedP3 resp={resp} />
      <div className="g91-meters">
        <Bar91 label="🌱 Environmental" value={sc.E} color="#16b074" suffix="" />
        <Bar91 label="🤝 Social" value={sc.S} color="#f5b23e" suffix="" />
        <Bar91 label="⚖️ Governance" value={sc.G} color="#0b7a50" suffix="" />
        <div className="g91-mini"><span>📊 ESG score <b>{avg}/100</b></span><span>💸 Cost of my responses <b>{cop(cost)}</b></span></div>
      </div>
      {!done ? (
        <div className="start-block">
          <div className="g83-event"><em>{C.e}</em><div><b>Breaking news {ev + 1}/4</b><span>{C.t}</span></div></div>
          <div className="quiz-options">{orders[ev].map((k, pos) => <button key={k} type="button" className="quiz-opt" onClick={() => choose(k)}><span className="opt-key">{"ABC"[pos]}</span><span className="opt-text">{C.o[k][0]}{C.o[k][2] ? ` · ${cop(C.o[k][2])}` : ""}</span></button>)}</div>
        </div>
      ) : (
        <>
          <div className="g91-timeline">{log.map((x, i) => <div key={i} className={x.good ? "good" : "bad"}><small>{x.e} News {i + 1}</small><span>{x.t}</span></div>)}</div>
          <div className={`p1-banner ${good >= 3 ? "good" : "bad"}`}><span>{good >= 3 ? "Responsible leadership costs money today — and builds trust for years." : "Hiding problems is cheaper today… until the truth comes out. Investors and buyers check ESG."}</span></div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(16 + good * 3, { ...sc, score: avg, cost, good })}>Save my crisis decisions <span className="coin-tag"><Coins size={15} /> +{16 + good * 3}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- FOUNDER PAGE 22 · The Green Investment Challenge → My ESG Scorecard ---------- */
const GREEN_P5 = [
  { id: "solar", e: "☀️", n: "Solar panels", c: 25, eff: { E: 15 }, m: 10 }, { id: "train", e: "🎓", n: "Employee training", c: 8, eff: { S: 12 }, m: 2 },
  { id: "pack", e: "📦", n: "Recycled packaging", c: 10, eff: { E: 8, S: 2 }, m: 3 }, { id: "water", e: "💧", n: "Wastewater treatment", c: 20, eff: { E: 12 }, m: 6 },
  { id: "audit", e: "🔎", n: "Supplier audits", c: 6, eff: { G: 10, S: 5 }, m: 2 }, { id: "report", e: "📑", n: "Public ESG report", c: 3, eff: { G: 8 }, m: 1 },
];
function GreenInvest({ resp, existing, onSave, onExit }) {
  const G = globalOf(resp);
  const base = resp?.c5_crisis || { E: 55, S: 60, G: 60 };
  const [pick, setPick] = useState(existing?.invest || []);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const spent = GREEN_P5.filter((x) => pick.includes(x.id)).reduce((a, x) => a + x.c, 0);
  const sc = { E: base.E, S: base.S, G: base.G };
  GREEN_P5.filter((x) => pick.includes(x.id)).forEach((x) => Object.entries(x.eff).forEach(([d, v]) => { sc[d] = Math.min(100, sc[d] + v); }));
  const avg = Math.round((sc.E + sc.S + sc.G) / 3);
  const months = Math.max(0, ...GREEN_P5.filter((x) => pick.includes(x.id)).map((x) => x.m));
  const Gw = [W_REASON, W_NUMBERS(1)];
  if (st.done) return <Reward title="ESG scorecard published! 🌱" subtitle={`${G.name}: ${avg}/100`} coins={st.coins} saving={st.saving} onExit={onExit} gold={avg >= 75} />;
  return (
    <ActShell icon={<Leaf size={22} strokeWidth={2.1} />} title={`The Green Investment Challenge · ${G.logo} ${G.name} 🌱`} subtitle="Founder Page 22 · $50,000,000 (fictional) to improve your company. Every investment has a cost, an impact and a time." onExit={onExit}>
      <Brief91 k="c5_invest" />
      <PBadge n="22" />
      {!resp?.c5_crisis && <p className="start-tip">💡 Play the ESG Crisis Room first to start from your real score. Now you start from 55/60/60.</p>}
      <div className="g94-cards">{GREEN_P5.map((x) => <button key={x.id} type="button" className={pick.includes(x.id) ? "on" : ""} disabled={!pick.includes(x.id) && spent + x.c > 50} onClick={() => setPick(pick.includes(x.id) ? pick.filter((y) => y !== x.id) : [...pick, x.id])}><em>{x.e}</em><b>{x.n}</b><span>{cop(x.c * 1e6)} · {x.m} months</span><small>{Object.entries(x.eff).map(([d, v]) => `${d} +${v}`).join(" · ")}</small></button>)}</div>
      <div className="g91-mini"><span>💰 Spent <b>{cop(spent * 1e6)} / {cop(50e6)}</b></span><span>⏳ Ready in <b>{months} months</b></span></div>
      <div className="g94-score" id="g94-score">
        <header><em>{G.logo}</em><div><small>🌱 ESG SCORECARD · FOUNDER PAGE 22</small><b>{G.name}</b></div><strong>{avg}</strong></header>
        <div>{[["🌱 Environmental", sc.E, "#16b074"], ["🤝 Social", sc.S, "#f5b23e"], ["⚖️ Governance", sc.G, "#0b7a50"]].map(([l, v, c]) => <Bar91 key={l} label={l} value={v} color={c} suffix="" />)}</div>
      </div>
      <div className="start-block"><h3>✍️ Why these investments?</h3><WordField value={text} onChange={setText} min={15} max={50} rows={3} placeholder="We invested in … because … Our ESG score went from … to …" goals={Gw} /></div>
      <div className="start-foot"><button className="s1-btn ghost" onClick={() => downloadPNG("g94-score", "ESG_Scorecard.png")}><Download size={16} /> PNG</button><button className="s1-btn primary big" disabled={!pick.length || !goalsOk(text, 15, 50, Gw)} onClick={() => finish(28, { invest: pick, ...sc, score: avg, spent, text })}>Save Founder Page 22 <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 6 · NOTHING GOES TO WASTE
   ===================================================================== */
const FACT_P6 = [
  { e: "🧩", t: "Plastic scraps on the floor", w: 1, loss: 400000 }, { e: "📦", t: "Boxes inside bigger boxes", w: 1, loss: 250000 },
  { e: "🧱", t: "Unused materials expiring in the store room", w: 1, loss: 600000 }, { e: "💡", t: "Machines and lights ON all night", w: 1, loss: 500000 },
  { e: "💧", t: "A water pipe dripping all day", w: 1, loss: 150000 }, { e: "🗃️", t: "Unsold products from last season", w: 1, loss: 900000 },
  { e: "☕", t: "A worker on her lunch break", w: 0 }, { e: "🚚", t: "A full truck leaving with orders", w: 0 },
];
function WasteDetective({ onSave, onExit }) {
  const [found, setFound] = useState([]);
  const [wrong, setWrong] = useState([]);
  const [st, finish] = useFinish(onSave);
  const tap = (i) => { if (found.includes(i) || wrong.includes(i)) return; if (FACT_P6[i].w) setFound([...found, i]); else setWrong([...wrong, i]); };
  const loss = found.reduce((a, i) => a + FACT_P6[i].loss, 0);
  const all = found.length === 6;
  if (st.done) return <Reward title="Waste found! 🕵️" subtitle={`${cop(loss)} lost every month — now you know where`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Waste Detective 🏭🕵️" subtitle="Walk through the factory. Tap every place where resources (and money) are wasted. 6 hidden wastes." onExit={onExit}>
      <Brief91 k="c6_detective" />
      <div className="g94-factory">{FACT_P6.map((f, i) => <button key={i} type="button" className={`${found.includes(i) ? "ok" : ""} ${wrong.includes(i) ? "no" : ""}`} onClick={() => tap(i)}><em>{f.e}</em><span>{f.t}</span>{found.includes(i) && <b>−{cop(f.loss)}/month</b>}{wrong.includes(i) && <b>That's not waste!</b>}</button>)}</div>
      <div className="g91-mini"><span>🔎 Found <b>{found.length}/6</b></span><span className="neg">💸 Money lost <b>{cop(loss)}/month</b></span></div>
      {all && <div className="p1-banner good"><span>Every waste is a cost twice: for the planet AND for the business. {cop(loss)} a month = {cop(loss * 12)} a year!</span></div>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!all} onClick={() => finish(Math.max(12, 24 - wrong.length * 3), { loss, wrong: wrong.length })}>Close the case <span className="coin-tag"><Coins size={15} /> +{Math.max(12, 24 - wrong.length * 3)}</span></button></div>
    </ActShell>
  );
}
const RUSH_P6 = {
  buckets: [{ id: "paper", e: "📄", l: "Paper & cardboard", d: "Blue line", c: "#0b7a50" }, { id: "plastic", e: "🧴", l: "Plastic", d: "Bottles, wraps", c: "#f5b23e" }, { id: "metal", e: "🥫", l: "Metal & glass", d: "Cans, jars", c: "#e07a2f" }, { id: "organic", e: "🍌", l: "Organic", d: "Compost", c: "#16b074" }],
  items: [
    { e: "📦", t: "Clean cardboard box", b: "paper", why: "Cardboard can be recycled many times." }, { e: "📰", t: "Old newspaper", b: "paper", why: "Paper → new paper." },
    { e: "🧾", t: "Office paper", b: "paper", why: "Keep it dry and clean." }, { e: "🧴", t: "Shampoo bottle", b: "plastic", why: "Rinse it first." },
    { e: "🥤", t: "Plastic cup", b: "plastic", why: "Plastic line." }, { e: "🛍️", t: "Clean plastic bag", b: "plastic", why: "Soft plastic, clean." },
    { e: "🥫", t: "Tuna can", b: "metal", why: "Metal is recyclable forever." }, { e: "🫙", t: "Glass jar", b: "metal", why: "Glass can be melted again." },
    { e: "🍾", t: "Glass bottle", b: "metal", why: "Glass line." }, { e: "🍌", t: "Banana peel", b: "organic", why: "Compost → fertilizer." },
    { e: "☕", t: "Coffee grounds", b: "organic", why: "Great compost!" }, { e: "🥚", t: "Egg shells", b: "organic", why: "Organic waste." },
  ],
};

/* ---------- FOUNDER PAGE 23 · Circular Redesign Lab ---------- */
const CIRC_P6 = [
  { id: "light", r: "REDUCE", e: "📦", n: "Lighter packaging", kg: 8, cost: -0.02, sat: 0 },
  { id: "plan", r: "REDUCE", e: "📅", n: "Produce on demand (less unsold stock)", kg: 6, cost: -0.03, sat: -2 },
  { id: "return", r: "REUSE", e: "🔁", n: "Returnable containers with a deposit", kg: 7, cost: 0.03, sat: 5 },
  { id: "byprod", r: "REUSE", e: "🎁", n: "Sell by-products (a second product from scraps)", kg: 5, cost: -0.01, sat: 2 },
  { id: "recpack", r: "RECYCLE", e: "♻️", n: "100% recycled packaging", kg: 4, cost: 0.04, sat: 3 },
  { id: "partner", r: "RECYCLE", e: "🤝", n: "A recycling / compost partner", kg: 5, cost: 0.01, sat: 1 },
];
function CircularLab({ resp, existing, onSave, onExit }) {
  const G = globalOf({ ...resp, c6_redesign: null, c4_export: null });
  const [pick, setPick] = useState(existing?.changes || []);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const C = CIRC_P6.filter((x) => pick.includes(x.id));
  const waste = Math.max(0, 30 - C.reduce((a, x) => a + x.kg, 0));
  const costPct = C.reduce((a, x) => a + x.cost, 0);
  const sat = C.reduce((a, x) => a + x.sat, 0);
  const costDelta = Math.round(G.local * costPct);
  const cut = Math.round(((30 - waste) / 30) * 100);
  const Gw = [W_REASON, W_NUMBERS(1)];
  const ok = waste <= 15 && goalsOk(text, 15, 55, Gw);
  if (st.done) return <Reward title="Nothing goes to waste! ♻️" subtitle={`Waste: 30 kg → ${waste} kg per 100 units (−${cut}%)`} coins={st.coins} saving={st.saving} onExit={onExit} gold={cut >= 60} />;
  return (
    <ActShell icon={<RefreshCw size={22} strokeWidth={2.1} />} title={`Circular Redesign Lab · ${G.logo} ${G.name} ♻️`} subtitle={`Founder Page 23 · Redesign your ${G.P.prod.toLowerCase()}. Goal: from 30 kg to 15 kg of waste per 100 units — without destroying your costs.`} onExit={onExit}>
      <Brief91 k="c6_redesign" />
      <PBadge n="23" />
      <NeedP3 resp={resp} />
      <div className="g94-circ">{["REDUCE", "REUSE", "RECYCLE"].map((r) => <div key={r}><h4>{r === "REDUCE" ? "🔽" : r === "REUSE" ? "🔁" : "♻️"} {r}</h4>{CIRC_P6.filter((x) => x.r === r).map((x) => <button key={x.id} type="button" className={pick.includes(x.id) ? "on" : ""} onClick={() => setPick(pick.includes(x.id) ? pick.filter((y) => y !== x.id) : pick.length < 3 ? [...pick, x.id] : pick)}><b>{x.e} {x.n}</b><small>−{x.kg} kg · cost {x.cost > 0 ? "+" : ""}{Math.round(x.cost * 100)}%{x.sat ? ` · customers ${x.sat > 0 ? "+" : ""}${x.sat}%` : ""}</small></button>)}</div>)}</div>
      <p className="start-tip">💡 Choose up to 3. Not every circular idea is cheaper: reusing and recycling can need investment and logistics.</p>
      <div className="g91-meters">
        <Bar91 label={`🗑️ Waste: ${waste} kg / 100 units`} value={(waste / 30) * 100} color={waste <= 15 ? "#16b074" : "#ff6b57"} suffix="%" />
        <div className="g91-mini"><span>♻️ Waste cut <b>−{cut}%</b></span><span className={costDelta > 0 ? "neg" : "pos"}>🏭 Unit cost <b>{costDelta >= 0 ? "+" : "−"}{cop(Math.abs(costDelta))}</b></span><span className="pos">😊 Customers <b>{sat >= 0 ? "+" : ""}{sat}%</b></span></div>
      </div>
      <div className="start-block"><h3>✍️ My circular plan</h3><WordField value={text} onChange={setText} min={15} max={55} rows={3} placeholder="We will reduce waste from 30 kg to … by … because …" goals={Gw} /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30, { changes: pick, waste: cut, kg: waste, costDelta, demandF: 1 + sat / 100, text })}>Save Founder Page 23 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 7 · GLOBAL IMPACT SUMMIT (cierre del año)
   ===================================================================== */

/* ---------- GLOBAL CRISIS · Final Boss (5 noticias a la vez, recursos limitados) ---------- */
const CRISIS_P7 = [
  { id: "usd", e: "💵", h: "The dollar jumps to $4,800!", d: "Your imported input becomes much more expensive tomorrow.", o: [
    ["Buy dollars at a fixed price for 6 months (hedge)", 3, { cash: 0, rep: 0, cust: 0, esg: 0 }],
    ["Raise your price 10% today", 0, { cash: 4, rep: -4, cust: -10, esg: 0 }],
    ["Do nothing and hope it goes down", 0, { cash: -18, rep: 0, cust: 0, esg: 0 }] ] },
  { id: "strike", e: "🚢", h: "Port strike: your shipment is stuck for 3 weeks", d: "Customers are waiting for their orders.", o: [
    ["Buy from a local supplier this month", 3, { cash: -3, rep: 4, cust: 0, esg: 2 }],
    ["Send it by plane (fast, very expensive, more CO₂)", 5, { cash: 0, rep: 4, cust: 0, esg: -8 }],
    ["Wait and tell customers nothing", 0, { cash: -6, rep: -14, cust: -14, esg: 0 }] ] },
  { id: "fake", e: "📱", h: "Fake news: a viral video says your product is unsafe", d: "It already has 200,000 views.", o: [
    ["Publish lab results and answer every question", 1, { cash: 0, rep: 12, cust: 4, esg: 3 }],
    ["Pay a lawyer to sue every account that shared it", 4, { cash: 0, rep: -6, cust: 0, esg: 0 }],
    ["Ignore it — it will disappear", 0, { cash: 0, rep: -16, cust: -12, esg: 0 }] ] },
  { id: "infl", e: "🛒", h: "Inflation hits 11%: your team asks for a raise", d: "Their salaries buy less every month.", o: [
    ["Give a fair raise linked to inflation", 3, { cash: 0, rep: 6, cust: 0, esg: 8 }],
    ["Give half the raise plus free training", 2, { cash: 0, rep: 3, cust: 0, esg: 5 }],
    ["No raise: “times are hard for everybody”", 0, { cash: 3, rep: -8, cust: -3, esg: -12 }] ] },
  { id: "rule", e: "📜", h: "New rule abroad: export packaging must be recycled", d: "Without it, your export buyer cancels the order.", o: [
    ["Redesign the packaging with recycled material", 3, { cash: 0, rep: 6, cust: 2, esg: 10 }],
    ["Stop exporting for now", 0, { cash: -10, rep: 0, cust: 0, esg: 0 }],
    ["Print a “recycled” label without changing anything", 0, { cash: 2, rep: -20, cust: -6, esg: -20 }] ] },
];
const CRISIS_BUDGET = 10;
function GlobalCrisis({ resp, onSave, onExit }) {
  const G = globalOf(resp);
  const [pick, setPick] = useState({});
  const [orders] = useState(() => CRISIS_P7.map(() => shuffleArr([0, 1, 2])));
  const [on, setOn] = useState(false);
  const [closed, setClosed] = useState(false);
  const [left] = useCountdown(240, on && !closed);
  const [st, finish] = useFinish(onSave);
  const spent = CRISIS_P7.reduce((a, c) => a + (pick[c.id] != null ? c.o[pick[c.id]][1] : 0), 0);
  const ind = { cash: 70, rep: 70, cust: 70, esg: G.esg ?? 60 };
  CRISIS_P7.forEach((c) => { if (pick[c.id] != null) Object.entries(c.o[pick[c.id]][2]).forEach(([k, v]) => { ind[k] = Math.max(0, Math.min(100, ind[k] + v)); }); });
  ind.cash = Math.max(0, ind.cash - spent * 1.5);
  const all = CRISIS_P7.every((c) => pick[c.id] != null);
  const score = Math.round((ind.cash + ind.rep + ind.cust + ind.esg) / 4);
  const best = CRISIS_P7.filter((c) => pick[c.id] === 0).length;
  const choose = (c, k) => { if (closed) return; const cost = c.o[k][1] - (pick[c.id] != null ? c.o[pick[c.id]][1] : 0); if (spent + cost > CRISIS_BUDGET) return; setPick({ ...pick, [c.id]: k }); };
  const timeUp = on && left === 0;
  if (st.done) return <Reward title="You survived the global crisis! 🌍" subtitle={`${G.logo} ${G.name} · resilience score ${score}/100`} coins={st.coins} saving={st.saving} onExit={onExit} gold={score >= 70} />;
  return (
    <ActShell icon={<Flame size={22} strokeWidth={2.1} />} title={`Global Crisis · Final Boss · ${G.logo} ${G.name} 🔥`} subtitle="Five breaking news stories hit your company AT THE SAME TIME. You have $10,000,000 (fictional) for emergencies and 4 minutes." onExit={onExit}>
      <Brief91 k="c7_crisis" />
      <NeedP3 resp={resp} />
      <HowTo>Everything you learned this year happens at once: the dollar, supply chains, fake news, inflation and sustainability rules. Choose one response for <b>each</b> crisis. Some answers cost money — and your budget is limited. Not every crisis can get the most expensive answer!</HowTo>
      {!on ? (
        <div className="start-foot"><button className="s1-btn primary big" onClick={() => setOn(true)}><Play size={17} /> Open the crisis room</button></div>
      ) : (
        <>
          <div className="g94-dash">
            <div className={left <= 30 && !closed ? "no" : "ok"}><small>⏱️ Time</small><b>{closed ? "Done" : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`}</b></div>
            <div className={spent > 8 ? "no" : "ok"}><small>💰 Emergency budget</small><b>{cop((CRISIS_BUDGET - spent) * 1e6)}</b></div>
            <div className={all ? "ok" : ""}><small>📰 Crises answered</small><b>{Object.keys(pick).length}/5</b></div>
          </div>
          <div className="g91-meters">
            <Bar91 label="💵 Cash" value={ind.cash} color="#0b7a50" suffix="" />
            <Bar91 label="⭐ Reputation" value={ind.rep} color="#f5b23e" suffix="" />
            <Bar91 label="👥 Customers" value={ind.cust} color="#16b074" suffix="" />
            <Bar91 label="🌱 ESG" value={ind.esg} color="#e07a2f" suffix="" />
          </div>
          <div className="g94-crisis">
            {CRISIS_P7.map((c, ci) => (
              <div key={c.id} className={`start-block ${pick[c.id] != null ? "set" : ""}`}>
                <div className="g83-event"><em>{c.e}</em><div><b>{c.h}</b><span>{c.d}</span></div></div>
                <div className="quiz-options">{orders[ci].map((k, pos) => { const o = c.o[k]; const tooMuch = pick[c.id] !== k && spent - (pick[c.id] != null ? c.o[pick[c.id]][1] : 0) + o[1] > CRISIS_BUDGET; return <button key={k} type="button" disabled={closed || timeUp || tooMuch} className={`quiz-opt ${pick[c.id] === k ? "correct" : ""}`} onClick={() => choose(c, k)}><span className="opt-key">{"ABC"[pos]}</span><span className="opt-text">{o[0]} · <b>{o[1] ? cop(o[1] * 1e6) : "free"}</b></span></button>; })}</div>
              </div>
            ))}
          </div>
          {!closed ? (
            <div className="start-foot"><button className="s1-btn primary big" disabled={!all && !timeUp} onClick={() => setClosed(true)}>{timeUp && !all ? "Time is up — see the result" : "Close the crisis room"}</button></div>
          ) : (
            <>
              <div className={`g91-verdict ${score >= 65 ? "ok" : "no"}`}><em>{score >= 65 ? "🛡️" : "⚠️"}</em><div><b>Resilience score: {score}/100</b><span>{score >= 65 ? "You protected your cash AND your reputation. Hedging, honesty and fair decisions are the best shield." : "Cheap answers today became expensive tomorrow. Unanswered crises and fake labels hurt trust the most."}</span></div></div>
              <div className="g91-timeline">{CRISIS_P7.map((c) => <div key={c.id} className={pick[c.id] === 0 ? "good" : "bad"}><small>{c.e} {c.h}</small><span>{pick[c.id] != null ? c.o[pick[c.id]][0] : "No response"}</span></div>)}</div>
              <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(24 + best * 3, { score, ...ind, spent, best, choices: Object.fromEntries(CRISIS_P7.map((c) => [c.id, pick[c.id] ?? null])) })}>Save my crisis result <span className="coin-tag"><Coins size={15} /> +{24 + best * 3}</span></button></div>
            </>
          )}
        </>
      )}
    </ActShell>
  );
}

/* ---------- PROYECTO FINAL · Global Impact Report · "The Founder Story" ---------- */
const STRAT_TXT94 = { fixed: "negotiated a fixed dollar price of $4,000 for six months", local: "changed to a local supplier, so we don't depend on the dollar", price: "raised our price 8%", design: "redesigned the product to use 50% less imported input", keep: "kept our supplier and absorbed the extra cost" };
const RESP_TXT94 = { price: "raise the price 6%", waste: "reduce waste in production", supplier: "change to a cheaper supplier", product: "make the product a little smaller" };
const SUP_TXT94 = { cn: "a supplier in China", mx: "a supplier in Mexico", co: "a local supplier in Colombia" };
const RUB_P7 = [["story", "📖 Clear story from Period 1 to Period 4"], ["nums", "🔢 Real numbers and decisions"], ["global", "🌍 Understands global risks (dollar, inflation, trade)"], ["impact", "🌱 Responsible impact (ESG, circular)"], ["english", "🎤 Clear presentation in English"]];
function titles94(r) {
  const p1 = r.__p1 || {}, p2 = r.__p2 || {}, p3 = r.__p3 || {};
  return [
    { e: "💰", t: "Money Master", on: PAGES91.filter((p) => p1[p.key]).length + PAGES92.filter((p) => p2[p.key]).length >= 4, how: "4+ advisor pages in Periods 1–2" },
    { e: "🚀", t: "Startup Founder", on: !!(p3.c4_mine || p3.c8_pitch), how: "Your pricing strategy or pitch in Period 3" },
    { e: "🚢", t: "Global Trader", on: !!(r.c4_export && r.c2_protect), how: "Founder Pages 19 and 21" },
    { e: "🌱", t: "Planet Protector", on: !!(r.c5_invest && r.c6_redesign), how: "Founder Pages 22 and 23" },
    { e: "🏆", t: "Global Impact Leader", on: !!r.c7_report, how: "Present your Global Impact Report" },
  ];
}
const listAnd94 = (a) => (a.length <= 1 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);
function buildReport94(r, studentName, closing) {
  const G = globalOf(r);
  const p1 = r.__p1 || {}, p2 = r.__p2 || {}, p3 = r.__p3 || {};
  const D1 = districtOf(p1), S2 = seasonOf({ ...p2, __p1: p1 });
  const first = (studentName || G.profile?.name || "Founder").split(" ")[0];
  const m = r.c1_map, pr = r.c2_protect, sv = r.c3_cost, ex = r.c4_export, es = r.c5_invest, ci = r.c6_redesign, cr = r.c7_crisis;
  const chapters = [
    { e: "🏦", t: "The citizen", sub: "Period 1 · Financial District", s: [
      p1.c1_id ? `My story started as a citizen of the Financial District${D1.profile?.job ? `, working as ${/^[aeiou]/i.test(D1.profile.job.n || "") ? "an" : "a"} ${String(D1.profile.job.n || "worker").toLowerCase()}` : ""}.` : "",
      p1.c3_run ? (D1.survived ? "I managed a bank during a bank run — and it survived, because trust is everything in banking." : "I managed a bank during a bank run and learned that a rumor can destroy a healthy bank.") : "",
      p1.c7_committee ? `On the loan committee, I approved ${p1.c7_committee.approved || 0} ${(p1.c7_committee.approved || 0) === 1 ? "loan" : "loans"} after checking capacity to pay.` : "",
      p1.c8_micro ? `With microfinance, my bank included ${p1.c8_micro.helped} new people in the financial system.` : "",
    ].filter(Boolean) },
    { e: "💳", t: "The advisor", sub: "Period 2 · The Product Lab", s: [
      p2.c2_cards || p2.c4_page ? `I learned to use financial products: cards, investments and funds. My simulated net worth was ${cop(S2.net)}.` : "",
      p2.c4_page ? `I invested ${p2.c4_page.pct || 0}% of my money and diversified to reduce risk.` : "",
      p2.c8_shield ? `My scam shield score was ${p2.c8_shield.score}/100: I never share passwords or codes.` : "",
    ].filter(Boolean) },
    { e: "🚀", t: "The founder", sub: "Period 3 · Startup District", s: [
      p3.c1_map ? `I founded ${G.logo} ${G.name} to solve a real problem: ${lowFirst(G.P.prob)}` : "",
      p3.c2_surgery?.vp ? dot(p3.c2_surgery.vp) : "",
      p3.c4_mine ? `We sell each ${G.P.prod.toLowerCase()} for ${cop(p3.c4_mine.price)} and need ${p3.c4_mine.breakEven} sales a month to break even.` : "",
      p3.c5_negotiate ? (p3.c5_negotiate.amount ? `An investor gave us ${cop(p3.c5_negotiate.amount)} for ${p3.c5_negotiate.equity}% of the company.` : "We decided not to accept a bad deal from an investor.") : "",
    ].filter(Boolean) },
    { e: "🌍", t: "Going global", sub: "Period 4 · Pages 18–21", s: [
      m ? `We buy our ${G.imp.item} from ${SUP_TXT94[m.supplier] || "a supplier"} and we want to sell in ${m.target}.` : "",
      pr ? `When the dollar went from ${cop(WORLD94.usd0)} to ${cop(WORLD94.usd1)}, we ${STRAT_TXT94[pr.strategy] || "changed our plan"}.` : "",
      sv ? `With inflation at ${WORLD94.infl}%, our costs went up, so we decided to ${(sv.responses || []).map((x) => RESP_TXT94[x]).filter(Boolean).join(" and ") || "keep our plan"}. Our new price is ${cop(sv.price)}.` : "",
      ex ? `Now we export ${ex.qty} units a month to ${ex.market} at ${usdTxt(ex.usdPrice)} each — that's ${cop(ex.profit)} of extra profit.` : "",
    ].filter(Boolean) },
    { e: "🌱", t: "Our impact", sub: "Period 4 · Pages 22–23", s: [
      es ? `We invested in ${listAnd94(GREEN_P5.filter((x) => (es.invest || []).includes(x.id)).map((x) => x.n.replace(/^([A-Z])(?=[a-z])/, (c) => c.toLowerCase())))}. Our ESG score is ${es.score}/100.` : "",
      ci ? `We redesigned our ${G.P.prod.toLowerCase()} with circular ideas and cut our waste by ${ci.waste}%.` : "",
      r.c5_crisis ? (r.c5_crisis.good >= 3 ? "When bad news came, we chose transparency instead of hiding problems." : "We learned that hiding problems always costs more later.") : "",
    ].filter(Boolean) },
    { e: "🔥", t: "The crisis & the future", sub: "Class 7 · Final Boss", s: [
      cr ? `In the global crisis, five problems arrived at the same time. Our resilience score was ${cr.score}/100.` : "",
      `Today, ${G.name} has a monthly profit of ${cop(G.profit)}${G.exportProfit ? `, including exports` : ""}.`,
    ].filter(Boolean) },
  ];
  return { G, chapters, intro: `Hello! I'm ${first}. This year I was a citizen, an advisor and a founder. This is the story of ${G.logo} ${G.name} — from one idea to the world.`, closing: closing.trim() ? `The most important thing I learned this year is ${dot(closing.trim())}` : "", outro: "Thank you for listening! Are there any questions? 🌍" };
}
function GlobalReport({ resp, studentName, existing, onSave, onExit }) {
  const r = resp || {};
  const [closing, setClosing] = useState(existing?.closing || "");
  const [goal, setGoal] = useState(existing?.goal || "");
  const [slide, setSlide] = useState(null);
  const [peer, setPeer] = useState(existing?.peer || "");
  const [stars, setStars] = useState(existing?.stars || {});
  const [cheer, setCheer] = useState(existing?.cheer || "");
  const [cert, setCert] = useState(!!existing?.closing);
  const [st, finish] = useFinish(onSave);
  const B = buildReport94(r, studentName, closing);
  const pages = PAGES94.filter((p) => r[p.key]).length;
  const T = titles94({ ...r, c7_report: r.c7_report || cert });
  const score = RUB_P7.reduce((a, [k]) => a + (stars[k] || 0), 0);
  const ready = pages >= 4 && countWords(closing) >= 8 && realText(closing) && countWords(goal) >= 6 && realText(goal) && peer.trim().length >= 2 && RUB_P7.every(([k]) => stars[k]) && countWords(cheer) >= 5;
  const Chap = ({ c, n, big }) => <section className={`g8-fp ${big ? "big" : ""} ${c.s.length ? "" : "empty"}`}><h4><span>{c.e}</span>{n}. {c.t} <small className="g94-sub">{c.sub}</small></h4>{c.s.length ? <div className="g8-fp-say"><small>🎤 I SAY</small>{c.s.map((t, k) => <p key={k}>{t}</p>)}</div> : <p className="g8-fp-empty">Finish the activities of this chapter to unlock it.</p>}</section>;
  const slides = [
    { k: "cover", node: <div className="g8-slide-cover"><small>GLOBAL IMPACT SUMMIT · GRADE 9 · INSTITUTO CREAR</small><h2>{B.G.logo} {B.G.name}: The Founder Story</h2><p className="g8-fp-sayline">🎤 {B.intro}</p></div> },
    ...B.chapters.map((c, k) => ({ k: c.t, node: <Chap c={c} n={k + 1} big /> })),
    { k: "goal", node: <div className="g8-slide-cover"><small>MY NEXT STEP</small><h2>🎯 {goal || "…"}</h2></div> },
    { k: "end", node: <div className="g8-slide-cover"><h2>{B.closing || "…"}</h2><p className="g8-fp-sayline">🎤 {B.outro}</p></div> },
  ];
  if (st.done) return <Reward title="Global Impact Leader! 🏆" subtitle={`${B.G.logo} ${B.G.name} · peer score ${score}/25 · open the report again to download your certificate`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title="Global Impact Report · The Founder Story 🌍" subtitle="THE BIG PROJECT of 9th grade. Your whole year — citizen, advisor, founder, global leader — in one presentation that builds itself from your decisions." onExit={onExit}>
      <Brief91 k="c7_report" />
      <HowTo>Your report has <b>6 chapters</b>, from Period 1 to today. Each chapter has the sentences you will <b>say</b> (🎤). Add your next step and your closing line, press <b>Present</b> and speak for 3–4 minutes. Then give your tablet to the classmate who listened. You need at least <b>4 of the 6 founder pages</b> of this period.</HowTo>
      <div className="g91-portfolio g93-port">{PAGES94.map((p) => <span key={p.n} className={r[p.key] ? "on" : ""}><em>{r[p.key] ? p.e : "🔒"}</em><small>PAGE {p.n}</small><b>{p.t}</b></span>)}</div>
      {pages < 4 && <div className="p1-banner bad"><span>You have {pages}/6 founder pages of Period 4. Finish at least 4 to present your report.</span></div>}
      <div className="g94-titles">{T.map((x) => <span key={x.t} className={x.on ? "on" : ""}><em>{x.on ? x.e : "🔒"}</em><b>{x.t}</b><small>{x.how}</small></span>)}</div>
      <div className="g8-final g94-final" id="g94-final">
        <header><small>GLOBAL IMPACT SUMMIT · FINANCIAL DISTRICT · INSTITUTO CREAR</small><h2>{B.G.logo} {B.G.name}: The Founder Story</h2><p>Founder: <b>{studentName}</b> · {B.G.P.prod} · {pages}/6 global founder pages</p></header>
        <div className="g94-kpis">
          <div><small>🏭 Unit cost</small><b>{cop(B.G.unit)}</b></div><div><small>🏷️ Price</small><b>{cop(B.G.price)}</b></div>
          <div><small>🚢 Exports</small><b>{B.G.market || "—"}</b></div><div><small>🌱 ESG</small><b>{B.G.esg ?? "—"}</b></div>
          <div><small>♻️ Waste cut</small><b>{B.G.waste != null ? `−${B.G.waste}%` : "—"}</b></div><div><small>📊 Profit / month</small><b className={B.G.profit >= 0 ? "pos" : "neg"}>{cop(B.G.profit)}</b></div>
        </div>
        <div className="g8-fp-intro">🎤 {B.intro}</div>
        <div className="g8-fp-list">{B.chapters.map((c, k) => <Chap key={c.t} c={c} n={k + 1} />)}</div>
        <div className="g8-fp-intro end">🎤 {goal ? `My next step: ${dot(goal)} ` : ""}{B.closing} {B.outro}</div>
      </div>
      <div className="p3-sentence edit"><span>🎯 My next step (a SMART goal for next year):</span><input className="start-input" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Write your goal here…" /></div>
      <div className="p3-sentence edit"><span>💡 My closing line: the most important thing I learned this year is</span><input className="start-input" value={closing} onChange={(e) => setClosing(e.target.value)} placeholder="Write your answer here…" /></div>
      <div className="p3-card-actions"><button className="s1-btn primary" onClick={() => setSlide(0)}><Mic size={17} /> Present</button><button className="s1-btn ghost" onClick={() => downloadPNG("g94-final", `Global_Impact_Report_${B.G.name}.png`)}><Download size={17} /> Download PNG</button></div>
      <div className="start-block g84-investor">
        <h3>🌍 Summit jury · for the classmate who listened</h3>
        <input className="start-input p3-gap" value={peer} onChange={(e) => setPeer(e.target.value)} placeholder="Jury member's name (your classmate)" />
        {RUB_P7.map(([k, l]) => <div key={k} className="p3-rub"><div><b>{l}</b></div><span /><div className="p3-stars">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={stars[k] >= n ? "on" : ""} onClick={() => setStars({ ...stars, [k]: n })}>★</button>)}</div></div>)}
        <div className="p3-sentence edit"><span>💬 The best part of this story was</span><input className="start-input" value={cheer} onChange={(e) => setCheer(e.target.value)} placeholder="Write it here…" /></div>
        <p className="start-tip">⚖️ Judge the story and the decisions — not the prettiest logo.</p>
      </div>
      {cert && (
        <div className="g93-cert g94-cert" id="g94-cert">
          <small>INSTITUTO CREAR · FINANCIAL DISTRICT · GRADE 9 · 2026</small>
          <h2>🏆 Global Impact Leader</h2>
          <p>This certifies that</p><b>{studentName}</b>
          <p>was a citizen, an advisor and a founder in the Financial District, took <strong>{B.G.logo} {B.G.name}</strong> to the world, managed currency, inflation and trade risks, and built a responsible, circular business.</p>
          <div className="g94-cert-t">{T.filter((x) => x.on).map((x) => <span key={x.t}>{x.e} {x.t}</span>)}</div>
          <span>Jury score: {score}/25 · {new Date().toLocaleDateString("en-GB")}</span>
        </div>
      )}
      <div className="start-foot">{cert && <button className="s1-btn ghost" onClick={() => downloadPNG("g94-cert", "Global_Impact_Leader.png")}><Download size={16} /> Certificate PNG</button>}<button className="s1-btn primary big" disabled={!ready} onClick={() => { setCert(true); finish(60, { closing, goal, peer: peer.trim(), stars, score, cheer, pages, titles: T.filter((x) => x.on).map((x) => x.t) }); }}>Get my certificate 🏆 <span className="coin-tag"><Coins size={15} /> +60</span></button></div>
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

/* ---------- RADAR 9 FINAL · mismo radar del P1 + 5 preguntas nuevas + autoevaluación ---------- */
const SELF_P7 = [
  ["bank", "🏦 I can explain how a bank works and why trust matters."], ["credit", "💳 I can compare financial products and avoid bad debt."],
  ["biz", "🚀 I can calculate costs, prices and break-even for a business."], ["global", "🌍 I can explain how the dollar and inflation affect a business."],
  ["esg", "🌱 I can recognize greenwashing and suggest circular ideas."], ["eng", "🎤 I can present my ideas about money in English."],
];
function RadarFinal({ resp, existing, onSave, onExit }) {
  const before = resp?.__p1?.c1_radar?.scores || null;
  const QS = useMemo(() => [...RADAR9_Q, ...RADAR9_NEW], []);
  const [cur, setCur] = useState(0);
  const [ans, setAns] = useState({});
  const [phase, setPhase] = useState(existing?.scores ? "done" : "quiz");
  const [self, setSelf] = useState(existing?.self || {});
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const scores = useMemo(() => { const o = {}; RADAR_DIMS.forEach((d) => { const list = RADAR9_Q.map((q, i) => ({ q, i })).filter((x) => x.q.d === d.k); o[d.k] = Math.round((list.reduce((a, x) => a + (ans[x.i] != null ? x.q.s[ans[x.i]] : 0), 0) / (list.length * 3)) * 100); }); return o; }, [ans]);
  const shown = existing?.scores && !Object.keys(ans).length ? existing.scores : scores;
  const newScore = existing?.newScore != null && !Object.keys(ans).length ? existing.newScore : Math.round((RADAR9_NEW.reduce((a, q, k) => a + (ans[10 + k] != null ? q.s[ans[10 + k]] : 0), 0) / 15) * 100);
  const avg = Math.round(Object.values(shown).reduce((a, v) => a + v, 0) / RADAR_DIMS.length);
  const bAvg = before ? Math.round(Object.values(before).reduce((a, v) => a + v, 0) / RADAR_DIMS.length) : null;
  const prof = radarProfile9(avg);
  const Gw = [W_CONTRAST, W_REASON];
  if (st.done) return <Reward title="Radar complete! 🧭" subtitle={`${prof.l} · ${avg}%${bAvg != null ? ` (from ${bAvg}%)` : ""}`} coins={st.coins} saving={st.saving} onExit={onExit} gold={bAvg != null && avg > bAvg} />;
  if (phase === "quiz") {
    const q = QS[cur]; const answered = ans[cur] != null;
    return (
      <div className="s1-quiz">
        <div className="quiz-top"><h2>🧭 My Money Radar 9 · Final</h2><span className="quiz-count">{cur + 1} / {QS.length}</span></div>
        <div className="quiz-track"><i style={{ width: `${((cur + (answered ? 1 : 0)) / QS.length) * 100}%` }} /></div>
        {cur === 0 && <Brief91 k="c7_radar" />}
        {false && <p className="start-tip">The SAME 10 situations from the first day of 9th grade — plus 5 new ones about this period. Answer honestly: this is not a test.</p>}
        {cur === 10 && <p className="start-tip">🆕 5 new situations: the global economy and sustainability.</p>}
        <span className="diag-dim">{cur >= 10 ? "🆕 " : ""}{RADAR_DIMS.find((d) => d.k === q.d).l}</span>
        <p className="quiz-q">{q.q}</p>
        <div className="quiz-options">{q.o.map((o, k) => <button key={k} type="button" className={`quiz-opt ${ans[cur] === k ? "correct" : ""}`} onClick={() => setAns({ ...ans, [cur]: k })}><span className="opt-key">{"ABCD"[k]}</span><span className="opt-text">{o}</span></button>)}</div>
        <div className="quiz-nav">
          <button className="s1-btn ghost" onClick={() => (cur > 0 ? setCur(cur - 1) : onExit())}>{cur > 0 ? "Back" : "Exit"}</button>
          <button className="s1-btn primary" disabled={!answered} onClick={() => (cur < QS.length - 1 ? setCur(cur + 1) : setPhase("done"))}>{cur < QS.length - 1 ? "Next" : "See my radar 🧭"} <ChevronRight size={18} /></button>
        </div>
      </div>
    );
  }
  const selfOk = SELF_P7.every(([k]) => self[k]) && goalsOk(text, 20, 60, Gw);
  return (
    <ActShell icon={<Compass size={22} strokeWidth={2.1} />} title="My Money Radar 9 · Before & After 🧭" subtitle="Day 1 of 9th grade vs. today. Then rate yourself honestly." onExit={onExit}>
      <div className="g7-radar-wrap"><RadarN labels={RADAR_DIMS.map((d) => d.short)} values={RADAR_DIMS.map((d) => shown[d.k])} before={before ? RADAR_DIMS.map((d) => before[d.k] || 0) : null} /></div>
      {before ? <div className="g94-legend"><span className="b">◼ Period 1 (day 1)</span><span className="a">◼ Today</span></div> : <p className="start-tip">💡 We didn't find your Period 1 radar, so you only see today's radar.</p>}
      <div className="g94-growth">{RADAR_DIMS.map((d) => { const b = before?.[d.k]; const diff = b != null ? shown[d.k] - b : null; return <div key={d.k}><span>{d.l}</span><div className="t"><i className="b" style={{ width: `${b || 0}%` }} /><i className="a" style={{ width: `${shown[d.k]}%` }} /></div><b className={diff == null ? "" : diff >= 0 ? "pos" : "neg"}>{shown[d.k]}%{diff != null ? ` (${diff >= 0 ? "+" : ""}${diff})` : ""}</b></div>; })}</div>
      <div className="g91-mini"><span>🧭 Average <b>{bAvg != null ? `${bAvg}% → ` : ""}{avg}%</b></span><span>🆕 Global & green situations <b>{newScore}%</b></span></div>
      <div className="diag-risk"><span className="diag-risk-tag">{prof.l}</span><p>{prof.d}</p></div>
      <div className="start-block">
        <h3>⭐ Self-assessment · How well can I do it?</h3>
        <p className="start-tip">1 ★ = not yet · 2 ★ = with help · 3 ★ = alone · 4 ★ = I can teach it</p>
        {SELF_P7.map(([k, l]) => <div key={k} className="p3-rub"><div><b>{l}</b></div><span /><div className="p3-stars">{[1, 2, 3, 4].map((n) => <button key={n} type="button" className={self[k] >= n ? "on" : ""} onClick={() => setSelf({ ...self, [k]: n })}>★</button>)}</div></div>)}
      </div>
      <div className="start-block"><h3>✍️ My reflection</h3><WordField value={text} onChange={setText} min={20} max={60} rows={3} placeholder="At the beginning of the year I … but now I … because …" goals={Gw} /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!selfOk} onClick={() => finish(30, { answers: ans, scores: shown, average: avg, beforeAvg: bAvg, growth: bAvg != null ? avg - bAvg : null, profile: prof.l, newScore, self, text })}>Save my radar <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- YEAR WRAPPED 9° ---------- */
function YearWrapped9({ resp, rows, pointsNow, actsNow, studentName, existing, onSave, onExit }) {
  const r = resp || {};
  const G = globalOf(r);
  const p1 = r.__p1 || {}, p2 = r.__p2 || {}, p3 = r.__p3 || {};
  const D1 = districtOf(p1), S2 = seasonOf({ ...p2, __p1: p1 });
  const pts = ["9P1", "9P2", "9P3"].map((k) => rowPoints(rows[k])).concat(pointsNow);
  const acts = ["9P1", "9P2", "9P3"].map((k) => Object.values(parseJSON(rows[k]?.Checklist_JSON)).filter(Boolean).length).concat(actsNow);
  const coins = pts.reduce((a, v) => a + v, 0);
  const totalActs = acts.reduce((a, v) => a + v, 0);
  const maxPts = Math.max(...pts, 1);
  const rad = r.c7_radar;
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [bestDec, setBestDec] = useState(existing?.bestDecision || null);
  const [lesson, setLesson] = useState(existing?.lesson || "");
  const [st, finish] = useFinish(onSave);
  const first = (studentName || "Student").split(" ")[0];
  const decisions = [
    p1.c3_run && "Protecting my bank's trust during the bank run",
    p1.c7_committee && "Checking capacity to pay before approving a loan",
    p2.c8_shield && "Never sharing my passwords or codes",
    p2.c4_page && "Diversifying my investments",
    p3.c4_mine && `Choosing a profitable price for ${G.name}`,
    r.c2_protect && "Protecting my startup from the dollar",
    r.c5_invest && "Investing in a greener company",
    "Comparing the numbers before every decision",
  ].filter(Boolean).slice(0, 5);
  const slides = [
    { k: "intro", c: "forest", node: <><small>GRADE 9 · 2026</small><h2>{first}, this was your year in the Financial District 🌍</h2><p>4 seasons: a citizen, an advisor, a founder — and a global leader. Ready?</p><em className="g74-big">✨</em></> },
    { k: "coins", c: "gold", node: <><small>THIS YEAR YOU EARNED</small><h2 className="g74-mega">{coins.toLocaleString("en-US")}</h2><p>FinFluent coins 🪙</p><div className="g74-wbars">{pts.map((v, k) => <div key={k}><i style={{ height: `${Math.max(6, (v / maxPts) * 100)}%` }} /><span>P{k + 1}</span><b>{v}</b></div>)}</div></> },
    { k: "acts", c: "green", node: <><small>YOU COMPLETED</small><h2 className="g74-mega">{totalActs}</h2><p>activities: simulators, games, readings, videos, writing and presentations.</p><div className="g74-wchips">{["🏦 Citizen", "💳 Advisor", "🚀 Founder", "🌍 Global Leader"].map((x, k) => <span key={x} className={acts[k] > 0 ? "on" : ""}>{x}</span>)}</div></> },
    { k: "p1", c: "coral", node: <><small>PERIOD 1 · FINANCIAL DISTRICT</small><h2>You ran a bank 🏦</h2><p>{p1.c3_run ? (D1.survived ? "Your bank survived the bank run." : "You lived a bank run — and learned why trust matters.") : "Banks, reserves, central banks and loans."}{p1.c8_micro ? ` Microfinance: ${p1.c8_micro.helped} people included.` : ""}</p></> },
    { k: "p2", c: "mint", node: <><small>PERIOD 2 · THE PRODUCT LAB</small><h2>You mastered financial products 💳</h2><p>{p2.c2_cards || p2.c4_page ? `Your simulated net worth: ${cop(S2.net)}.` : "Cards, investments, pensions, crypto and scams."}{p2.c8_shield ? ` Scam shield: ${p2.c8_shield.score}/100.` : ""}</p></> },
    { k: "p3", c: "gold", node: <><small>PERIOD 3 · STARTUP DISTRICT</small><h2>You founded {G.logo} {G.name} 🚀</h2><p>{p3.c4_mine ? `Price ${cop(p3.c4_mine.price)} · break-even ${p3.c4_mine.breakEven} sales.` : "Problems, value, canvas, prices and investors."}{p3.c5_negotiate?.amount ? ` Investment: ${cop(p3.c5_negotiate.amount)}.` : ""}</p></> },
    { k: "p4", c: "forest", node: <><small>PERIOD 4 · GLOBAL DISTRICT</small><h2>{G.name} went global 🌍</h2><div className="g74-wlist">
      {r.c2_protect && <span>💵 Currency strategy: <b>{STRAT_TXT94[r.c2_protect.strategy]?.split(",")[0]}</b></span>}
      {r.c4_export && <span>🚢 Exports: <b>{r.c4_export.qty} units to {r.c4_export.market}</b></span>}
      {r.c5_invest && <span>🌱 ESG score: <b>{r.c5_invest.score}/100</b></span>}
      {r.c6_redesign && <span>♻️ Waste cut: <b>−{r.c6_redesign.waste}%</b></span>}
      {r.c7_crisis && <span>🔥 Crisis resilience: <b>{r.c7_crisis.score}/100</b></span>}
      <span>📊 Monthly profit: <b>{cop(G.profit)}</b></span>
    </div></> },
    { k: "radar", c: "green", node: rad?.growth != null ? <><small>MY MONEY RADAR</small><h2 className="g74-mega">{rad.growth >= 0 ? "+" : ""}{rad.growth}</h2><p>points of growth since Period 1 ({rad.beforeAvg}% → {rad.average}%)</p><p className="g74-quote">Today you are: <b>{rad.profile}</b></p></> : <><small>MY MONEY RADAR</small><h2>{rad ? rad.profile : "🔒 Locked"}</h2><p>{rad ? "Your final radar is ready." : "Do “My Money Radar 9 · Final” to see how much you grew."}</p></> },
    { k: "me", c: "coral", node: <><small>YOUR STORY · YOUR WORDS</small><h2>My best decision & my biggest lesson</h2>
      <div className="g84-wpick">{decisions.map((d) => <button key={d} type="button" className={bestDec === d ? "on" : ""} onClick={() => setBestDec(d)}>{d}</button>)}</div>
      <input className="start-input g84-winput" value={lesson} onChange={(e) => setLesson(e.target.value)} placeholder="The biggest lesson of my year…" /></> },
    { k: "outro", c: "forest", node: <><small>2026 → 10th GRADE → YOUR FUTURE</small><h2>You learned to make money work — for you, for people and for the planet. 💚</h2><p>{bestDec ? `Best decision: ${bestDec}.` : ""} See you in 10th grade, {first}!</p></> },
  ];
  const s = slides[i];
  const last = i === slides.length - 1;
  const meOk = bestDec && countWords(lesson) >= 6 && realText(lesson);
  if (st.done) return <Reward title="That's a wrap! 🎁" subtitle="From a bank to a global company — what a year." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <div className="p1-act g74-wrapped-wrap">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      {i === 0 && <Brief91 k="c7_wrapped" />}
      <div className={`g74-wrapped c-${s.c}`} id="g74-wrapped" key={s.k}>
        <div className="g74-wprog">{slides.map((x, k) => <i key={x.k} className={k < i ? "done" : k === i ? "on" : ""} />)}</div>
        <div className="g74-wbody">{s.node}</div>
        <div className="g74-wfoot"><span>FinFluent · Instituto CREAR</span><span>{i + 1}/{slides.length}</span></div>
        {s.k !== "me" && <><button type="button" className="g74-wtap left" aria-label="Previous" onClick={() => setI(Math.max(0, i - 1))} /><button type="button" className="g74-wtap right" aria-label="Next" onClick={() => setI(Math.min(slides.length - 1, i + 1))} /></>}
      </div>
      <div className="p3-card-actions">
        <button className="s1-btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}><ArrowLeft size={16} /> Back</button>
        <button className="s1-btn ghost" disabled={busy} onClick={async () => { setBusy(true); await downloadPNG("g74-wrapped", `Year_Wrapped_9_${i + 1}_${first}.png`); setBusy(false); }}><Download size={16} /> {busy ? "Creating…" : "Save this slide"}</button>
        {!last ? <button className="s1-btn primary" disabled={s.k === "me" && !meOk} onClick={() => setI(i + 1)}>{s.k === "me" && !meOk ? "Choose + write (6+ words)" : "Next"} <ChevronRight size={16} /></button>
          : <button className="s1-btn primary" onClick={() => finish(25, { coins, acts: totalActs, bestDecision: bestDec, lesson })}>Finish my Wrapped <span className="coin-tag"><Coins size={15} /> +25</span></button>}
      </div>
    </div>
  );
}

/* ---------- FINAL EXAM · 5 misiones + 15 preguntas · feedback por tema ---------- */
function ExamQuiz({ missions, onSave, onExit }) {
  const [attempt, setAttempt] = useState(0);
  const deck = useMemo(() => shuffleArr(EXAM_Q.map((q) => ({ ...q, order: shuffleArr(q.options.map((_, k) => k)) }))), [attempt]); // eslint-disable-line react-hooks/exhaustive-deps
  const [cur, setCur] = useState(0);
  const [ans, setAns] = useState({});
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const q = deck[cur]; const answered = ans[cur] != null;
  const correct = deck.filter((x, k) => ans[k] === x.correct).length;
  const pct = Math.round((correct / deck.length) * 100);
  const passed = pct >= 70;
  const topics = [...new Set(EXAM_Q.map((x) => x.t))].map((t) => { const list = deck.map((x, k) => ({ x, k })).filter((o) => o.x.t === t); return { t, ok: list.filter((o) => ans[o.k] === o.x.correct).length, n: list.length }; });
  const xp = correct * 4 + missions * 4 + 10;
  const end = () => { setDone(true); setSaving(true); Promise.resolve(onSave({ correct, total: deck.length, pct, passed, xp, missions, topics: Object.fromEntries(topics.map((o) => [o.t, `${o.ok}/${o.n}`])) })).finally(() => setSaving(false)); };
  if (done) {
    const weak = topics.filter((o) => o.ok < o.n);
    const wrong = deck.filter((x, k) => ans[k] !== x.correct);
    return (
      <div className="s1-quiz diag-result g94-exam">
        <div className="diag-badge">{passed ? <Trophy size={30} strokeWidth={2.1} /> : <X size={30} strokeWidth={2.1} />}</div>
        <h2>{passed ? (pct === 100 ? "Perfect final exam! 🏆" : "You passed the final exam! 🎓") : "Almost there!"}</h2>
        <p className="diag-sub">Missions: <b>{missions}/5 ⭐</b> · Questions: <b>{correct}/{deck.length} ({pct}%)</b>{passed ? "" : " · you need 70%"}</p>
        <div className="reward-coins"><Coins size={20} strokeWidth={2.3} /> +{xp} coins</div>
        <h3 className="g94-h">📊 My results by topic</h3>
        <div className="diag-bars">{topics.map((o) => <div key={o.t} className="diag-bar"><span className="diag-bar-l">{o.t}</span><div className="diag-bar-track"><i style={{ width: `${(o.ok / o.n) * 100}%` }} /></div><span className="diag-bar-v">{o.ok}/{o.n}</span></div>)}</div>
        {weak.length ? <div className="g94-tips"><h4>🎯 What to review</h4>{weak.map((o) => <p key={o.t}><b>{o.t}:</b> {EXAM_TIPS[o.t]}</p>)}</div> : <div className="p1-banner good"><span>No weak topics — you are ready for 10th grade!</span></div>}
        {wrong.length > 0 && <div className="g94-tips wrong"><h4>🔁 My mistakes — and the key idea</h4>{wrong.map((x, k) => <p key={k}><span>{x.q}</span><b>✅ {x.options[x.correct]}</b><small>💡 {x.feedback}</small></p>)}</div>}
        {passed ? <button className="s1-btn primary" onClick={onExit}>Continue <ChevronRight size={18} /></button> : <><p className="reward-note">Your coins are saved. Read the feedback and try again — the questions change order.</p><button className="s1-btn primary" onClick={() => { setAttempt(attempt + 1); setCur(0); setAns({}); setDone(false); }}>Try again <RefreshCw size={17} strokeWidth={2.4} /></button></>}
        {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing your progress…</span>}
      </div>
    );
  }
  return (
    <div className="s1-quiz">
      <div className="quiz-top"><h2>🎓 Final Exam · Part 2 (missions: {missions}/5 ⭐)</h2><span className="quiz-count">{cur + 1} / {deck.length}</span></div>
      <div className="g8-qdots">{deck.map((x, k) => <i key={k} className={ans[k] == null ? (k === cur ? "now" : "") : ans[k] === x.correct ? "ok" : "no"} />)}</div>
      <span className="diag-dim">{q.t}</span>
      <p className="quiz-q">{q.q}</p>
      <div className="quiz-options">{q.order.map((oi, pos) => { let cls = "quiz-opt"; if (answered) { if (oi === q.correct) cls += " correct"; else if (oi === ans[cur]) cls += " wrong"; } return <button key={oi} className={cls} disabled={answered} onClick={() => setAns({ ...ans, [cur]: oi })}><span className="opt-key">{"ABCD"[pos]}</span><span className="opt-text">{q.options[oi]}</span>{answered && oi === q.correct && <Check size={18} strokeWidth={3} className="opt-tick" />}</button>; })}</div>
      {answered && <p className={`g91-note ${ans[cur] === q.correct ? "pos" : "neg"}`}>💡 {q.feedback}</p>}
      <div className="quiz-nav"><span /><button className="s1-btn primary" disabled={!answered} onClick={() => (cur < deck.length - 1 ? setCur(cur + 1) : end())}>{cur < deck.length - 1 ? "Next" : "See my results"} <ChevronRight size={18} /></button></div>
    </div>
  );
}
function FinalExam({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [mis, setMis] = useState(0);
  return stage === 0 ? (
    <ActShell icon={<Award size={22} strokeWidth={2.1} />} title="Final Exam 9° · Part 1 🎓" subtitle="5 missions from the whole year: banking, products, startup, global economy and impact." onExit={onExit}>
      <Brief91 k="c7_exam" />
      <RoundsRunner rounds={EXAM_MISSIONS} doneLabel="Part 2: 15 questions" onDone={(x) => { setMis(x.firstTry); setStage(1); }} />
    </ActShell>
  ) : <ExamQuiz missions={mis} onSave={onSave} onExit={onExit} />;
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
const FPAGE = (n, words, needs, coins) => [[`Text: ${words} words with ${needs}`, "required"], [`Founder Page ${n} saved`, `+${coins} 🪙`]];
const GUIDE = {
  c1_video: B_VIDEO("See how globalization works like a bridge between countries — and why not everybody wins the same.", "Next: follow a T-shirt around the world."),
  c1_passport: { goal: "Follow a $40,000 T-shirt through 4 countries and discover who receives each part of its price.", steps: ["Choose the NEXT stop of the journey (7 stops).", "Read each stamp of your passport.", "See who gets what of the $40,000.", "Answer the final question."], win: [["Coins = 26 − 2 per wrong stop", "min +14 🪙"]], tip: "Order of a product: raw material → fabric → sewing → transport → selling." },
  c1_rescue: { goal: "Deliver 100 bike lights in 30 days while 4 supply problems hit your parts from 3 countries.", steps: ["Read each problem.", "Choose a solution: each one costs money and/or days.", "Watch your days and your extra cost.", "Deliver the order."], win: [["On time (30 days or less)", "+6 🪙"], ["On budget ($2,500,000 or less)", "+6 🪙"], ["Delivering", "+16 🪙"]] },
  c1_map: { goal: "Your Period 3 startup goes global: choose your supplier and a future market. This is Founder Page 18.", steps: ["Choose who supplies your imported input (watch the unit cost).", "Choose where you could sell in the future.", "Explain your choices (12–45 words)."], win: FPAGE("18", "12–45", "a reason", 28), tip: "A supplier that charges in dollars = dollar risk." },
  c2_read: B_READ("See how the SAME change in the dollar helps an exporter and hurts an importer.", "Next: the Dollar Rollercoaster."),
  c2_coaster: { goal: "Predict how the profits of three companies change when the dollar goes up and down.", steps: ["Press “The dollar moves…”.", "Predict for each company: profit up or down?", "Reveal the real numbers.", "Answer 2 twists."], win: [["Each right prediction (6)", "+2 🪙"], ["Each twist right on the first try", "+2 🪙"], ["Finishing", "+14 🪙"]] },
  c2_escape: { goal: "You're stuck in an airport: solve 5 currency operations to get your boarding code.", steps: ["Solve each gate (a hint appears after a mistake).", "Write down each 🔑 digit.", "Enter the 5-digit code."], win: [["Each gate right on the first try", "+3 🪙"], ["Boarding the plane", "+18 🪙"]] },
  c2_protect: { goal: "The dollar jumps from $3,800 to $4,500: choose a strategy to protect YOUR startup. This is Founder Page 19.", steps: ["Compare the 5 strategies: profit if the dollar is $4,500 or $4,100.", "Choose one.", "Explain it with a reason and a contrast (15–55 words)."], win: FPAGE("19", "15–55", "a reason and a contrast (however, but…)", 28), tip: "No strategy wins in every scenario." },
  c3_brief: B_BRIEF("Learn the economy's thermometer: inflation, unemployment, growth — and the central bank's rate.", "Next: Central Bank Simulator 2.0."),
  c3_cb: { goal: "Run the central bank for 4 quarters: bring inflation to 5% or less without destroying jobs. Careful: your decisions work with a DELAY.", steps: ["Move the policy rate.", "Announce it and watch the dashboard and the chart.", "Repeat for 4 quarters.", "Answer the question about the delay."], win: [["Soft landing: inflation ≤ 5%, unemployment ≤ 10.5%, growth ≥ 0.5%", "+10 🪙"], ["Delay question right", "+3 🪙"], ["Closing the year", "+20 🪙"]] },
  c3_basket: { goal: "Calculate the real inflation of a family's basket: the same 6 products, one year later.", steps: ["Add the prices of last year.", "Add the prices of this year.", "Calculate the % increase.", "Find the product with the biggest impact."], win: [["Each answer right on the first try", "+3 🪙"], ["Finishing", "+9 🪙"]] },
  c3_cost: { goal: "Inflation raises your costs: choose up to 2 responses and save YOUR startup's profit. This is Founder Page 20.", steps: ["Look at the cost shock and your profit after it.", "Choose 1–2 responses and watch “with my plan”.", "Write your survival plan (15–55 words)."], win: FPAGE("20", "15–55", "a reason and a number", 28) },
  c4_news: { goal: "Read the economy newspaper of the district: trade, the dollar, prices, the world and the planet.", steps: ["Read the main story.", "Open all 6 stories.", "Look at the market data, the opinion and the ad.", "Answer 6 questions."], win: [["70% or more", "to pass"], ["Each correct answer", "+4 🪙"], ["Finishing", "+10 🪙"]], tip: "Always check: is the data real or illustrative?" },
  c4_market: { goal: "Choose an export market that you can REALLY enter with what your company has today.", steps: ["Check what your company has.", "Compare the 3 markets and their requirements.", "Choose one you can serve.", "Answer the final question."], win: [["Coins = 26 − 4 per market you can't enter", "min +14 🪙"]], tip: "A small market you CAN serve beats a giant market you can't." },
  c4_customs: { goal: "Your cargo is at the border: find the 5 errors in the export document before it is held.", steps: ["Tap 🚩 every field with an error.", "Send it to the officer.", "Correct the document.", "Release the cargo."], win: [["Each field checked correctly (8)", "+2 🪙"], ["Releasing the cargo", "+14 🪙"]] },
  c4_export: { goal: "Calculate an export price in dollars and choose a buyer you can serve AND make money with. This is Founder Page 21.", steps: ["Check your export cost.", "Choose your margin and see the price in dollars.", "Choose one of the 3 buyers: can you produce it on time? Do you make money?"], win: [["A buyer you can deliver to, with profit", "required"], ["Founder Page 21 saved", "+30 🪙"]] },
  c5_video: B_VIDEO("Learn what ESG means and how to recognize greenwashing.", "Next: the ESG Scanner and the Greenwashing Detector."),
  c5_detector: { goal: "Read an ESG table, then decide which green claims are verified, need evidence or are misleading.", steps: ["Read the ESG scores of 4 companies.", "Answer 3 questions.", "Classify 6 green claims.", "Check your detector."], win: [["Each claim right", "+2 🪙"], ["Each scanner question right on the first try", "+2 🪙"], ["Finishing", "+12 🪙"]] },
  c5_crisis: { goal: "Four bad news stories hit YOUR startup. Respond responsibly — even when it costs money.", steps: ["Read each story.", "Choose a response: watch your E, S and G scores and the cost.", "Save your decisions."], win: [["Each responsible decision", "+3 🪙"], ["Finishing", "+16 🪙"]], tip: "Your ESG score here is the starting point of Founder Page 22." },
  c5_invest: { goal: "Invest $50,000,000 (fictional) to make YOUR company better. This is Founder Page 22.", steps: ["Choose investments: each has a cost, an impact and a time.", "Watch your ESG scorecard.", "Explain your choices (15–50 words)."], win: FPAGE("22", "15–50", "a reason and a number", 28) },
  c6_read: B_READ("See how Lucía turned waste into value in her shoe factory.", "Next: the Waste Detective."),
  c6_detective: { goal: "Walk through a factory and find the 6 hidden wastes. Every waste is money lost.", steps: ["Tap the places where resources are wasted.", "Careful: 2 things are NOT waste.", "Close the case."], win: [["Coins = 24 − 3 per wrong tap", "min +12 🪙"]] },
  c6_rush: B_RUSH("Sort 12 items into the right recycling bin: paper, plastic, metal & glass, or organic."),
  c6_redesign: { goal: "Redesign YOUR product: from 30 kg to 15 kg of waste per 100 units — without destroying your costs. This is Founder Page 23.", steps: ["Choose up to 3 ideas: reduce, reuse, recycle.", "Watch the waste, the unit cost and your customers.", "Write your circular plan (15–55 words)."], win: [["Waste 15 kg or less", "required"], ...FPAGE("23", "15–55", "a reason and a number", 30)] },
  c7_crisis: { goal: "The final boss: 5 crises hit your company AT THE SAME TIME. You have $10,000,000 and 4 minutes.", steps: ["Open the crisis room (the timer starts).", "Choose one response for each crisis — the budget is limited.", "Watch cash, reputation, customers and ESG.", "Close the room and see your resilience score."], win: [["Each best response", "+3 🪙"], ["Saving your result", "+24 🪙"]], tip: "You can't buy the expensive answer for everything: prioritize!" },
  c7_report: { goal: "THE BIG PROJECT: your Global Impact Report. Your whole year — citizen, advisor, founder, global leader — in one presentation.", steps: ["Read your 6 chapters: they build themselves from your decisions.", "Write your next step (a SMART goal).", "Write your closing line.", "Press Present and speak 3–4 minutes.", "A classmate scores you as the jury."], win: [["📖 Clear story from Period 1 to 4", "★ 1–5"], ["🔢 Real numbers and decisions", "★ 1–5"], ["🌍 Understands global risks", "★ 1–5"], ["🌱 Responsible impact", "★ 1–5"], ["🎤 Clear presentation in English", "★ 1–5"], ["You need 4 of the 6 Founder Pages", "required"], ["Certificate", "+60 🪙"]] },
  c7_radar: { goal: "Answer the SAME 10 situations of the first day of 9th grade + 5 new ones. See how much you grew — then rate yourself.", steps: ["Answer 15 situations honestly.", "Compare your radar: day 1 vs. today.", "Rate 6 skills with stars.", "Write your reflection (20–60 words)."], win: [["No right or wrong — be honest", ""], ["Reflection with a contrast and a reason", "required"], ["Saving your radar", "+30 🪙"]] },
  c7_wrapped: { goal: "Your year in slides: your coins, your activities, your 4 seasons and your best decision.", steps: ["Tap → to see each slide.", "Save the slides you like (PNG).", "Choose your best decision and write your biggest lesson."], win: [["Best decision + lesson (6+ words)", "required"], ["Finishing", "+25 🪙"]] },
  c7_exam: { goal: "The final exam: 5 missions and 15 questions from the whole year — with feedback by topic.", steps: ["Part 1: 5 missions with numbers.", "Part 2: 15 questions (feedback after each one).", "Read your results by topic and what to review."], win: [["70% or more in Part 2", "to pass"], ["Each mission right on the first try", "+4 🪙"], ["Each correct question", "+4 🪙"], ["Finishing", "+10 🪙"]] },
};

/* =====================================================================
   ESTRUCTURA DEL PERIODO 4 · 9° (7 clases · el periodo más corto)
   ===================================================================== */
const A = (key, title, desc, icon, coins, bucket) => ({ key, title, desc, icon, coins, bucket });
const G9P4_WEEKS = [
  { n: 1, g: "1", title: "The Global Journey", blurb: "Where do the things you use come from? Your startup chooses its suppliers and markets.", e: "🌍", skills: ["Video", "Map"], acts: [
    A("c1_video", "Video: Globalization & Trade 🎬", "How the world trades · 8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c1_passport", "The Global Product Passport 🛂", "Follow a T-shirt around the world.", <Plane size={22} />, 26, "aprendi"),
    A("c1_rescue", "Supply Chain Rescue 🚚", "4 problems · deliver on time and on budget.", <Truck size={22} />, 28, "aprendi"),
    A("c1_map", "Build Your Global Company 🗺️ · Page 18", "Your supplier, your market, your unit cost.", <MapIcon size={22} />, 28, "aprendi"),
  ] },
  { n: 2, g: "2", title: "The Dollar Rollercoaster", blurb: "When the dollar moves, who wins and who loses? Protect your startup.", e: "💵", skills: ["Reading", "Strategy"], acts: [
    A("c2_read", "Reading: Two Businesses, One Dollar 📖", "Don Ernesto exports, Valeria imports · 8 questions.", <BookOpen size={22} />, 42, "quizzes"),
    A("c2_coaster", "The Dollar Rollercoaster 🎢", "3 businesses · 3 exchange rates · predict!", <TrendingUp size={22} />, 26, "aprendi"),
    A("c2_escape", "Currency Escape Room 🔓", "5 locks · one code.", <KeyRound size={22} />, 33, "aprendi"),
    A("c2_protect", "Protect My Business 🛡️ · Page 19", "Choose your currency strategy.", <ShieldCheck size={22} />, 28, "aprendi"),
  ] },
  { n: 3, g: "3", title: "The Economy Thermometer", blurb: "Inflation, unemployment and the central bank — and a cost explosion in your startup.", e: "🌡️", skills: ["Explainer", "Simulator"], acts: [
    A("c3_brief", "Explainer: The Economy Thermometer 💡", "A 5-minute read + 6 quick questions.", <BookOpen size={22} />, 34, "quizzes"),
    A("c3_cb", "Central Bank Simulator 🏛️", "4 quarters · control inflation without killing jobs.", <Gauge size={22} />, 33, "aprendi"),
    A("c3_basket", "The Basket of the Year 🧺", "Calculate the real inflation of a family.", <ShoppingCart size={22} />, 21, "aprendi"),
    A("c3_cost", "The Business Cost Explosion 💥 · Page 20", "Costs go up — save your startup.", <Flame size={22} />, 28, "aprendi"),
  ] },
  { n: 4, g: "4", title: "Exports & The District Times", blurb: "Read the economy newspaper — then take your startup abroad.", e: "🚢", skills: ["Newspaper", "Export"], acts: [
    A("c4_news", "The District Times 📰", "The economy newspaper · 6 questions.", <Newspaper size={22} />, 34, "quizzes"),
    A("c4_market", "Trade Agreement Explorer 🤝", "Which market can you really enter?", <Handshake size={22} />, 26, "aprendi"),
    A("c4_customs", "Customs Challenge 🛃", "Find the 5 errors before the cargo leaves.", <FileText size={22} />, 30, "aprendi"),
    A("c4_export", "My Export Plan 🚢 · Page 21", "Price in dollars, buyer, real profit.", <Package size={22} />, 30, "aprendi"),
  ] },
  { n: 5, g: "5", title: "Profit with Purpose", blurb: "ESG, greenwashing and a crisis — then invest to make your startup greener.", e: "🌱", skills: ["Video", "ESG"], acts: [
    A("c5_video", "Video: ESG & Sustainable Business 🎬", "Profit, people and planet · 8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c5_detector", "ESG Scanner + Greenwashing Detector 🔍", "Read an ESG table · check 6 green claims.", <Search size={22} />, 30, "aprendi"),
    A("c5_crisis", "ESG Crisis Room 🚨", "4 bad news stories hit YOUR startup.", <ShieldAlert size={22} />, 28, "aprendi"),
    A("c5_invest", "The Green Investment Challenge 🌱 · Page 22", "$50,000,000 · your ESG scorecard.", <Leaf size={22} />, 28, "aprendi"),
  ] },
  { n: 6, g: "6", title: "Nothing Goes to Waste", blurb: "Waste is money lost twice. Redesign your product the circular way.", e: "♻️", skills: ["Reading", "Redesign"], acts: [
    A("c6_read", "Reading: Lucía's Shoe Factory 📖", "A circular business in Bucaramanga · 8 questions.", <BookOpen size={22} />, 42, "quizzes"),
    A("c6_detective", "Waste Detective 🕵️", "Find 6 hidden wastes in the factory.", <Search size={22} />, 24, "aprendi"),
    A("c6_rush", "Recycling Rush ⚡", "12 items · 4 bins · 60 seconds.", <Zap size={22} />, 24, "aprendi"),
    A("c6_redesign", "Circular Redesign Lab ♻️ · Page 23", "Reduce, reuse, recycle — your product.", <RefreshCw size={22} />, 30, "aprendi"),
  ] },
  { n: 7, g: "7", title: "Global Impact Summit", blurb: "The final boss, your big project, your radar — and the final exam.", e: "🏆", skills: ["Project", "Exam"], acts: [
    A("c7_crisis", "Global Crisis · Final Boss 🔥", "5 crises at once · limited budget · 4 minutes.", <Flame size={22} />, 39, "aprendi"),
    A("c7_report", "Global Impact Report 🌍 · THE BIG PROJECT", "The Founder Story: your whole year · present it!", <Globe size={22} />, 60, "aprendi"),
    A("c7_radar", "My Money Radar 9 · Final 🧭", "Same radar as day 1 · before & after · self-assessment.", <Compass size={22} />, 30, "comportamiento"),
    A("c7_wrapped", "Year Wrapped 9° 🎁", "Your year in money — in slides.", <Gift size={22} />, 25, "comportamiento"),
    A("c7_exam", "Final Exam 9° 🎓", "5 missions + 15 questions (70%) · feedback by topic.", <Award size={22} />, 90, "quizzes"),
  ] },
];
const ALL_ACTS94 = G9P4_WEEKS.flatMap((w) => w.acts);
const TOTAL_ACTS94 = ALL_ACTS94.length;
const PAGE_ACTS94 = [...PAGES94.map((p) => p.key), "c7_report"];

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Periodo4G9 = ({ userData, API_URL, existingRow, onBack }) => {
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

  const name = userData?.Nombre_Completo || "Student";
  /* Filas de los periodos anteriores: ciudadano (P1), patrimonio (P2), startup (P3) */
  const rows = { "9P1": store.semanas?.["9P1"], "9P2": store.semanas?.["9P2"], "9P3": store.semanas?.["9P3"] };
  const p1 = parseJSON(rows["9P1"]?.Respuestas_JSON);
  const p2 = parseJSON(rows["9P2"]?.Respuestas_JSON);
  const p3 = parseJSON(rows["9P3"]?.Respuestas_JSON);
  const resp = { ...(respRef.current || {}), __p1: p1, __p2: p2, __p3: p3 };
  const doneCount = ALL_ACTS94.filter((a) => checklist[a.key]).length;
  const pctDone = Math.round((doneCount / TOTAL_ACTS94) * 100);
  const weekDone = (w) => w.acts.every((a) => checklist[a.key]);
  const coinsTotal = Math.round(points.comportamiento + points.quizzes + points.aprendi);

  const persist = (nextChecklist, nextPoints, respPatch) => {
    respRef.current = { ...respRef.current, ...respPatch };
    const done = ALL_ACTS94.filter((a) => nextChecklist[a.key]).length;
    const row = {
      Student_Key: userData.Student_Key, Semana: PERIOD_KEY, Grado: GRADE,
      Estado: done >= TOTAL_ACTS94 ? "completed" : "in_progress",
      Porcentaje: Math.round((done / TOTAL_ACTS94) * 100),
      Puntos_Comportamiento: nextPoints.comportamiento, Puntos_Quizzes: nextPoints.quizzes, Puntos_Aprendi: nextPoints.aprendi,
      Checklist_JSON: JSON.stringify(nextChecklist), Respuestas_JSON: JSON.stringify(respRef.current),
    };
    const prev = store.semanas?.[PERIOD_KEY];
    dispatch({ type: "save_progreso", payload: row }); // OPTIMISTA
    fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "save_progreso", data: row }) })
      .catch((e) => { console.error("Error guardando 9° Periodo 4:", e); dispatch({ type: "rollback_progreso", payload: { Semana: PERIOD_KEY, prev } }); });
  };
  const complete = (key, bucket, xp, respPatch, pass = true) => {
    const already = !!checklist[key];
    const nextChecklist = { ...checklist, [key]: already || pass };
    const nextPoints = already ? points : { ...points, [bucket]: points[bucket] + (xp || 0) };
    setChecklist(nextChecklist); setPoints(nextPoints);
    persist(nextChecklist, nextPoints, respPatch);
    return Promise.resolve();
  };
  const WRAP = "s1 p1 p2 p3 p4 g7 g72 g73 g74 g8 g82 g83 g84 g9 g91 g92 g93 g94";

  if (act) {
    const def = ALL_ACTS94.find((a) => a.key === act);
    const exit = () => setAct(null);
    const save = (r) => complete(act, def.bucket, r.xp, { [act]: { ...r, at: nowISO() } }, r.passed !== false);
    const reading = (title, subtitle, sections, glossary, questions, emoji) => (
      <ReadThen tag="READING · B1+ · 8 MIN" title={title} subtitle={subtitle} minutes={8} sections={[{ node: <Brief91 key="guide" k={act} /> }, ...sections]} glossary={glossary} onExit={exit} finishLabel="I read it — start the quiz (8 questions)">
        <QuizRunner title={`${title} · check`} emoji={emoji} questions={questions} pickCount={8} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
      </ReadThen>
    );
    const brief = (title, subtitle, sections, glossary, questions, emoji) => (
      <ReadThen tag="EXPLAINER · B1+ · 5 MIN" title={title} subtitle={subtitle} minutes={5} sections={[{ node: <Brief91 key="guide" k={act} /> }, ...sections]} glossary={glossary} onExit={exit} finishLabel="I understand — quick check (6 questions)">
        <QuizRunner title={`${title} · quick check`} emoji={emoji} questions={questions} pickCount={6} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
      </ReadThen>
    );
    const video = (src, title, qs) => <VideoQuiz intro={<Brief91 k={act} />} src={src} title={title} questions={qs} pickCount={8} onSave={save} onExit={exit} />;
    const rush = (title, subtitle, data, doneTitle, seconds = 60) => <SpeedSort intro={<Brief91 k={act} />} title={title} subtitle={subtitle} buckets={data.buckets} items={data.items} seconds={seconds} doneTitle={doneTitle} onSave={save} onExit={exit} />;
    let view = null;
    switch (act) {
      case "c1_video": view = video(VID_GLOBAL, "Globalization & International Trade", VQ_GLOBAL); break;
      case "c1_passport": view = <Passport onSave={save} onExit={exit} />; break;
      case "c1_rescue": view = <SupplyRescue onSave={save} onExit={exit} />; break;
      case "c1_map": view = <GlobalMap resp={resp} existing={resp.c1_map} onSave={save} onExit={exit} />; break;
      case "c2_read": view = reading("Two Businesses, One Dollar", "When the dollar moves, someone wins and someone loses.", READ_DOLLAR, GLOSS_DOLLAR, Q_DOLLAR, "💵"); break;
      case "c2_coaster": view = <DollarCoaster onSave={save} onExit={exit} />; break;
      case "c2_escape": view = <CurrencyEscape onSave={save} onExit={exit} />; break;
      case "c2_protect": view = <ProtectBusiness resp={resp} existing={resp.c2_protect} onSave={save} onExit={exit} />; break;
      case "c3_brief": view = brief("The Economy Thermometer", "Inflation, unemployment, growth — and the central bank.", BRIEF_INFL, GLOSS_INFL, Q_INFL, "🌡️"); break;
      case "c3_cb": view = <CBSim2 resp={resp} onSave={save} onExit={exit} />; break;
      case "c3_basket": view = <NumberRounds intro={<Brief91 k={act} />} icon={<ShoppingCart size={22} strokeWidth={2.1} />} title="The Basket of the Year 🧺" subtitle="The same 6 products, one year later. How much did life get more expensive?" rounds={BASKET_R} coinsPer={3} bonus={9} doneTitle="Inflation calculated! 🧺" onSave={save} onExit={exit} />; break;
      case "c3_cost": view = <CostExplosion resp={resp} existing={resp.c3_cost} onSave={save} onExit={exit} />; break;
      case "c4_news": view = <DistrictTimes onSave={save} onExit={exit} />; break;
      case "c4_market": view = <TradeExplorer onSave={save} onExit={exit} />; break;
      case "c4_customs": view = <Customs onSave={save} onExit={exit} />; break;
      case "c4_export": view = <ExportPlan resp={resp} existing={resp.c4_export} onSave={save} onExit={exit} />; break;
      case "c5_video": view = video(VID_ESG, "ESG & Sustainable Business", VQ_ESG); break;
      case "c5_detector": view = <GreenDetector onSave={save} onExit={exit} />; break;
      case "c5_crisis": view = <ESGCrisis resp={resp} onSave={save} onExit={exit} />; break;
      case "c5_invest": view = <GreenInvest resp={resp} existing={resp.c5_invest} onSave={save} onExit={exit} />; break;
      case "c6_read": view = reading("Lucía's Shoe Factory", "From waste to value: a circular business in Bucaramanga.", READ_CIRC, GLOSS_CIRC, Q_CIRC, "♻️"); break;
      case "c6_detective": view = <WasteDetective onSave={save} onExit={exit} />; break;
      case "c6_rush": view = rush("Recycling Rush ⚡", "Which bin? Paper, plastic, metal & glass or organic.", RUSH_P6, "Recycling pro! ♻️"); break;
      case "c6_redesign": view = <CircularLab resp={resp} existing={resp.c6_redesign} onSave={save} onExit={exit} />; break;
      case "c7_crisis": view = <GlobalCrisis resp={resp} onSave={save} onExit={exit} />; break;
      case "c7_report": view = <GlobalReport resp={resp} studentName={name} existing={resp.c7_report} onSave={save} onExit={exit} />; break;
      case "c7_radar": view = <RadarFinal resp={resp} existing={resp.c7_radar} onSave={save} onExit={exit} />; break;
      case "c7_wrapped": view = <YearWrapped9 resp={resp} rows={rows} pointsNow={coinsTotal} actsNow={doneCount} studentName={name} existing={resp.c7_wrapped} onSave={save} onExit={exit} />; break;
      case "c7_exam": view = <FinalExam onSave={save} onExit={exit} />; break;
      default: view = null;
    }
    return <div className={WRAP}>{view}</div>;
  }

  if (week) {
    const w = G9P4_WEEKS.find((x) => x.n === week);
    const wDone = w.acts.filter((a) => checklist[a.key]).length;
    const next = G9P4_WEEKS[G9P4_WEEKS.indexOf(w) + 1];
    return (
      <div className={WRAP}>
        <button className="s1-back" onClick={() => setWeek(null)}><ArrowLeft size={18} strokeWidth={2.4} /> Back to Period 4</button>
        <div className="s1-hero p1-week-hero g7-hero g8-hero g91-hero g94-hero">
          <span className="s1-tag">{w.e} GRADE 9 · PERIOD 4 · CLASS {w.g}</span>
          <h1>{w.title}</h1>
          <p>{w.blurb}</p>
          <div className="s1-progress"><div className="bar"><i style={{ width: `${(wDone / w.acts.length) * 100}%` }} /></div><span className="pill">{wDone}/{w.acts.length}</span></div>
        </div>
        <GlobalPanel resp={resp} compact />
        <div className="s1-quest">
          {w.acts.map((a) => (
            <div key={a.key} className={`act-card ${checklist[a.key] ? "done" : ""} ${PAGE_ACTS94.includes(a.key) ? "g8-page-act" : ""} ${a.key.endsWith("_rush") ? "g8-rush-act" : ""} ${a.key.endsWith("_read") || a.key.endsWith("_video") || a.key.endsWith("_brief") || a.key.endsWith("_news") ? "g73-learn-act" : ""} ${a.key === "c7_report" ? "g94-big-act" : ""}`}>
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
      <div className="s1-hero p1-hero g7-hero g8-hero g91-hero g94-hero">
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> ADMIN PREVIEW · GRADE {GRADE} · PERIOD 4</span>
        <h1>Global District 🌍</h1>
        <p>How do the dollar, inflation, trade and sustainability change a business — and how can we create value for people and the planet?</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pctDone}%` }} /></div><span className="pill">{pctDone}%</span></div>
        <div className="p1-hero-chips"><span><Coins size={14} /> {coinsTotal} coins</span><span><Check size={14} /> {doneCount}/{TOTAL_ACTS94} activities</span><span>🌍 Season 04</span><span>🧾 Founder Pages 18–23</span><span>🏆 Global Impact Leader</span></div>
      </div>
      <div className="g8-howyear"><b>🧭 This period:</b><span>The final season of the Financial District. Your Period 3 startup goes global: it buys from other countries, suffers the dollar and inflation, exports, becomes greener and wastes less. The world is the same for everybody (the same dollar, the same inflation) — your decisions make the difference. Six missions become Founder Pages 18–23, and at the Global Impact Summit you present <b>The Founder Story</b>: your whole year, from citizen to global leader. Then: your final radar, your Year Wrapped and the final exam.</span></div>
      <GlobalPanel resp={resp} studentName={name} />
      {checklist.c7_report && <button type="button" className="p3-card-link" onClick={() => setAct("c7_report")}><Award size={18} /> See my Global Impact Report & certificate <ChevronRight size={16} /></button>}
      <div className="g94-route">{G9P4_WEEKS.map((w, k) => <button key={w.n} type="button" className={weekDone(w) ? "done" : ""} onClick={() => setWeek(w.n)}><em>{weekDone(w) ? "✅" : w.e}</em><small>Class {w.g}</small>{k < G9P4_WEEKS.length - 1 && <i />}</button>)}</div>
      <div className="p1-weeks">
        {G9P4_WEEKS.map((w) => {
          const d = w.acts.filter((a) => checklist[a.key]).length; const fullW = d === w.acts.length;
          return (
            <button key={w.n} type="button" className={`p1-week-card ${fullW ? "done" : ""} ${w.n === 7 ? "g94-summit" : ""}`} onClick={() => setWeek(w.n)}>
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