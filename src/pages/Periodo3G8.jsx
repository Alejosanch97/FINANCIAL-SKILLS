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
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   GRADO 8 · PERIODO 3 · BANKING, CREDIT & INVESTING (B1)
   Clases 18–25 · Pregunta guía: How can banks, saving strategies and
   responsible financial services help people achieve financial security?
   Hilo: FINANCIAL SERVICES GUIDE (7 páginas + guía final) para 4 clientes
   + MY MONEY LIFE (crédito simulado, puntaje, inversiones, un año después).
   Más HACER que leer: cada clase = Starter · entrada · juego grande · página.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "8P3", Grado = "8".
   ===================================================================== */
const PERIOD_KEY = "8P3";
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
const W_NUMBERS = (n = 2) => ({ l: `Use ${n} numbers`, test: (t) => ((t || "").match(/\d[\d,.%]*/g) || []).length >= n, ex: "$350,000 · 20% · 4 weeks" });
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
const monthlyEq = (ea) => (Math.pow(1 + ea / 100, 1 / 12) - 1) * 100;
const realRate = (n, i) => ((1 + n / 100) / (1 + i / 100) - 1) * 100;
/* ---------- CAJA DE HERRAMIENTAS: fórmulas con calculadora (el estudiante pone los valores) ---------- */
const f2 = (x, d = 2) => (Number.isFinite(x) ? x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }) : "—");
const RC_TABS = [
  { id: "a2m", e: "📆➜🗓️", t: "Annual → Monthly", use: "To know the rate for ONE month." },
  { id: "m2a", e: "🗓️➜📆", t: "Monthly → Annual", use: "To compare a monthly rate with an EA rate." },
  { id: "real", e: "🎈", t: "Real rate", use: "To know your gain AFTER inflation." },
  { id: "bal", e: "💰", t: "Final balance", use: "To know how much money you will have (minus fees)." },
  { id: "n2e", e: "🏷️➜📆", t: "Nominal → EA", use: "When an ad says “X% a year, paid monthly” (nominal): find the real yearly effect." },
  { id: "pmt", e: "🧾", t: "Loan payment", use: "To know the monthly payment and the TOTAL cost of a loan." },
];
function NumBox({ label, value, set, unit, step = "any" }) {
  return (
    <label className="g82-nb"><span>{label}</span><div><input type="number" inputMode="decimal" step={step} value={value} onChange={(e) => set(e.target.value)} placeholder="0" /><i>{unit}</i></div></label>
  );
}
function RateCalc({ open: open0 = true, preset, boxRef }) {
  const [open, setOpen] = useState(open0);
  const [tab, setTab] = useState("a2m");
  const [ea, setEa] = useState("10");
  const [mo, setMo] = useState("1");
  const [nom, setNom] = useState("10");
  const [inf, setInf] = useState("6");
  const [dep, setDep] = useState("1000000");
  const [r, setR] = useState("10");
  const [m, setM] = useState("12");
  const [fee, setFee] = useState("0");
  const [nn, setNn] = useState("24");
  const [lp, setLp] = useState("6000000");
  const [lr, setLr] = useState("1.8");
  const [ln, setLn] = useState("24");
  useEffect(() => {
    if (!preset) return;
    const v = preset.v || {}; const S = { ea: setEa, mo: setMo, nom: setNom, inf: setInf, dep: setDep, r: setR, m: setM, fee: setFee, nn: setNn, lp: setLp, lr: setLr, ln: setLn };
    setOpen(true); setTab(preset.tab); Object.entries(v).forEach(([k, x]) => S[k] && S[k](String(x)));
  }, [preset?.n]); // eslint-disable-line react-hooks/exhaustive-deps
  const T = RC_TABS.find((x) => x.id === tab);
  const vEa = num(ea), vMo = num(mo), vN = num(nom), vI = num(inf), vD = num(dep), vR = num(r), vM = num(m), vF = num(fee);
  const a2m = (Math.pow(1 + vEa / 100, 1 / 12) - 1) * 100;
  const m2a = (Math.pow(1 + vMo / 100, 12) - 1) * 100;
  const real = ((1 + vN / 100) / (1 + vI / 100) - 1) * 100;
  const grow = vD * Math.pow(1 + vR / 100, vM / 12);
  const bal = grow - vF * vM;
  const vNn = num(nn), n2eM = vNn / 12, n2e = (Math.pow(1 + n2eM / 100, 12) - 1) * 100;
  const vLp = num(lp), vLr = num(lr), vLn = Math.max(1, Math.round(num(ln)));
  const cuota = pmt(vLp, vLr / 100, vLn), totalPay = cuota * vLn;
  return (
    <div ref={boxRef} className={`g82-calc ${open ? "open" : ""} ${preset ? "loaded" : ""}`}>
      <button type="button" className="g82-calc-head" onClick={() => setOpen(!open)}><b>🧮 Rate calculator & help</b><span>{open ? "Hide ▲" : "Open ▼"}</span></button>
      {open && (
        <>
          <div className="g82-calc-tabs">{RC_TABS.map((x) => <button key={x.id} type="button" className={tab === x.id ? "on" : ""} onClick={() => setTab(x.id)}><em>{x.e}</em>{x.t}</button>)}</div>
          <p className="g82-calc-use">💡 Use it: {T.use}</p>
          {tab === "a2m" && (
            <div className="g82-calc-body">
              <NumBox label="Annual rate (EA)" value={ea} set={setEa} unit="%" />
              <div className="g82-formula"><small>FORMULA</small><code>monthly = (1 + EA)<sup>1/12</sup> − 1</code><small>WITH YOUR NUMBERS</small><code>(1 + {f2(vEa / 100, 3)})<sup>1/12</sup> − 1 = {f2(a2m / 100, 5)}</code></div>
              <div className="g82-result"><small>Monthly rate</small><b>{f2(a2m, 3)}%</b><span>Not {f2(vEa / 12, 3)}% (that's just EA ÷ 12 — a little too big!)</span></div>
            </div>
          )}
          {tab === "m2a" && (
            <div className="g82-calc-body">
              <NumBox label="Monthly rate" value={mo} set={setMo} unit="%" />
              <div className="g82-formula"><small>FORMULA</small><code>EA = (1 + monthly)<sup>12</sup> − 1</code><small>WITH YOUR NUMBERS</small><code>(1 + {f2(vMo / 100, 4)})<sup>12</sup> − 1 = {f2(m2a / 100, 4)}</code></div>
              <div className="g82-result"><small>Effective annual rate</small><b>{f2(m2a, 2)}% EA</b><span>More than {f2(vMo * 12, 2)}% because of interest on interest ❄️</span></div>
            </div>
          )}
          {tab === "real" && (
            <div className="g82-calc-body two">
              <NumBox label="Rate (nominal)" value={nom} set={setNom} unit="%" />
              <NumBox label="Inflation" value={inf} set={setInf} unit="%" />
              <div className="g82-formula"><small>FORMULA</small><code>real = (1 + rate) ÷ (1 + inflation) − 1</code><small>WITH YOUR NUMBERS</small><code>(1 + {f2(vN / 100, 3)}) ÷ (1 + {f2(vI / 100, 3)}) − 1 = {f2(real / 100, 4)}</code><small>QUICK ESTIMATE</small><code>{f2(vN, 1)}% − {f2(vI, 1)}% ≈ {f2(vN - vI, 1)}%</code></div>
              <div className={`g82-result ${real < 0 ? "bad" : ""}`}><small>Real rate</small><b>{f2(real, 2)}%</b><span>{real < 0 ? "📉 Your money buys LESS than before." : real === 0 ? "😐 Your money buys the same." : "📈 Your money buys MORE than before."}</span></div>
            </div>
          )}
          {tab === "bal" && (
            <div className="g82-calc-body four">
              <NumBox label="Deposit" value={dep} set={setDep} unit="$" />
              <NumBox label="Rate (EA)" value={r} set={setR} unit="%" />
              <NumBox label="Months" value={m} set={setM} unit="mo" step="1" />
              <NumBox label="Fee per month" value={fee} set={setFee} unit="$" />
              <div className="g82-formula"><small>FORMULA</small><code>deposit × (1 + EA)<sup>months ÷ 12</sup> − fee × months</code><small>WITH YOUR NUMBERS</small><code>{cop(vD)} × (1 + {f2(vR / 100, 3)})<sup>{f2(vM / 12, 2)}</sup> − {cop(vF)} × {vM}</code></div>
              <div className="g82-result"><small>Final balance</small><b>{cop(bal)}</b><span>Interest {cop(grow - vD)} · fees {cop(vF * vM)}</span></div>
            </div>
          )}
          {tab === "n2e" && (
            <div className="g82-calc-body">
              <NumBox label="Nominal annual rate (paid monthly)" value={nn} set={setNn} unit="%" />
              <div className="g82-formula"><small>FORMULA</small><code>monthly = nominal ÷ 12 · EA = (1 + monthly)<sup>12</sup> − 1</code><small>WITH YOUR NUMBERS</small><code>{f2(vNn, 2)} ÷ 12 = {f2(n2eM, 3)}% · (1 + {f2(n2eM / 100, 5)})<sup>12</sup> − 1 = {f2(n2e / 100, 4)}</code></div>
              <div className="g82-result"><small>Effective annual rate</small><b>{f2(n2e, 2)}% EA</b><span>Monthly rate: {f2(n2eM, 3)}% · the EA is BIGGER than {f2(vNn, 2)}% ❄️</span></div>
            </div>
          )}
          {tab === "pmt" && (
            <div className="g82-calc-body four">
              <NumBox label="Loan (amount)" value={lp} set={setLp} unit="$" />
              <NumBox label="Monthly rate" value={lr} set={setLr} unit="%" />
              <NumBox label="Months" value={ln} set={setLn} unit="mo" step="1" />
              <div className="g82-formula"><small>FORMULA</small><code>payment = loan × r ÷ (1 − (1 + r)<sup>−months</sup>)</code><small>WITH YOUR NUMBERS</small><code>{cop(vLp)} × {f2(vLr / 100, 4)} ÷ (1 − (1 + {f2(vLr / 100, 4)})<sup>−{vLn}</sup>)</code></div>
              <div className="g82-result"><small>Monthly payment</small><b>{cop(cuota)}</b><span>Total paid {cop(totalPay)} · interest {cop(totalPay - vLp)}</span></div>
            </div>
          )}
          <p className="g82-calc-tip">✏️ Remember: % → decimal = divide by 100 (10% = 0.10 · 0.8% = 0.008)</p>
        </>
      )}
    </div>
  );
}

/* =====================================================================
   PIEZAS DEL PERIODO 3 · Financial Services Guide + My Money Life
   ===================================================================== */
/* Límite de usura PARA EL JUEGO. Actualízalo con la tasa de usura certificada
   por la Superintendencia Financiera para el mes en que se juega. */
const USURY = { ea: 26.0, label: "the usury limit for this activity", src: "Update it with the official rate certified by the Superintendencia Financiera." };
/* "Future Me" · el perfil ficticio con el que juegan crédito, puntaje e inversión */
const FUTURE_ME = { age: 22, income: 1800000, ess: 1200000, savings: 2000000 };
const W_PLAN = { l: "Make a plan", re: /\b(i will|i'll|i am going to|i'm going to|next time|from now on|my plan is)\b/i, ex: "I will · next time · from now on" };
const W_RISK = { l: "Name a risk", re: /\b(risk|risky|danger|dangerous|lose|loss|careful|protect|warning)\b/i, ex: "risk · danger · lose · protect" };

const CLIENTS = [
  { id: "valentina", e: "👩‍🎓", n: "Valentina", age: 16, need: "Saves for university in 5 years", pages: ["01", "05"] },
  { id: "andres", e: "🧑‍🔧", n: "Andrés", age: 22, need: "First job · wants his first motorcycle loan", pages: ["02", "04"] },
  { id: "rosa", e: "🫓", n: "Tía Rosa", age: 48, need: "Wants to open a second arepa stand", pages: ["06"] },
  { id: "efrain", e: "👴", n: "Don Efraín", age: 60, need: "Rural · no bank · basic phone", pages: ["07", "04"] },
];
const GUIDE_PAGES = [
  { n: "01", key: "c18_page", t: "A bank account for Valentina", e: "🏦", who: "valentina" },
  { n: "02", key: "c19_page", t: "Credit rates for Andrés", e: "🔎", who: "andres" },
  { n: "03", key: "c20_page", t: "My credit decision", e: "📲", who: "me" },
  { n: "04", key: "c21_page", t: "Responsible borrowing rules", e: "⭐", who: "andres" },
  { n: "05", key: "c22_page", t: "Valentina's investment plan", e: "📈", who: "valentina" },
  { n: "06", key: "c23_page", t: "Rosa's financing & risk plan", e: "🫓", who: "rosa" },
  { n: "07", key: "c24_page", t: "Access for Don Efraín", e: "📱", who: "efrain" },
];
function GuidePanel({ resp, compact, studentName }) {
  const r = resp || {};
  const done = GUIDE_PAGES.filter((p) => r[p.key]).length;
  return (
    <div className={`g8-bp g83-guide ${compact ? "compact" : ""}`}>
      <div className="g8-bp-head">
        <b>🧭 Financial Services Guide{studentName && !compact ? ` · ${studentName.split(" ")[0]}` : ""}</b>
        <span>{done}/{GUIDE_PAGES.length} pages{r.c25_guide ? " · 🏆 published" : ""}</span>
      </div>
      <div className="g8-bp-pages" style={{ gridTemplateColumns: `repeat(${GUIDE_PAGES.length + 1}, minmax(0, 1fr))` }}>
        {GUIDE_PAGES.map((p) => <div key={p.n} className={`g8-bp-page ${r[p.key] ? "done" : ""}`}><small>{p.n}</small><em>{r[p.key] ? p.e : "▫️"}</em><span>{p.t}</span></div>)}
        <div className={`g8-bp-page final ${r.c25_guide ? "done" : ""}`}><small>{String(GUIDE_PAGES.length + 1).padStart(2, "0")}</small><em>{r.c25_guide ? "🏆" : "🔒"}</em><span>Final guide</span></div>
      </div>
    </div>
  );
}
function GBadge({ n }) {
  const p = GUIDE_PAGES.find((x) => x.n === n);
  if (!p) return null;
  const c = CLIENTS.find((x) => x.id === p.who);
  return <div className="g8-bpbadge g83-badge"><span>🧭 GUIDE PAGE {p.n}{c ? ` · ${c.e} ${c.n}` : " · 🙋 Me"}</span><b>{p.e} {p.t}</b></div>;
}
function ClientCard({ id, compact }) {
  const c = CLIENTS.find((x) => x.id === id);
  if (!c) return null;
  return <div className={`g83-client ${compact ? "compact" : ""}`}><em>{c.e}</em><div><b>{c.n}{c.age ? `, ${c.age}` : ""}</b><small>{c.need}</small></div></div>;
}

/* ---------- MY MONEY LIFE · lo que acompaña todo el periodo ---------- */
const scoreBand = (s) => (s >= 750 ? { t: "Excellent", c: "#0b7a50", rate: 1.4 } : s >= 650 ? { t: "Good", c: "#16b074", rate: 1.8 } : s >= 550 ? { t: "Fair", c: "#f5b23e", rate: 2.3 } : { t: "Risky", c: "#ff6b57", rate: null });
function moneyLife(r) {
  const loan = r.c20_app || null, life = r.c21_life || null, inv = r.c22_storm || null, later = r.c25_later || null;
  return {
    loan, life, inv, later,
    score: later?.score ?? life?.score ?? 650,
    debt: later?.debt ?? (loan ? loan.amount : 0),
    invest: later?.invest ?? (inv ? inv.final : null),
    savings: later?.savings ?? life?.savings ?? FUTURE_ME.savings,
  };
}
function MoneyLife({ resp, compact }) {
  const m = moneyLife(resp || {});
  const band = scoreBand(m.score);
  const gain = m.inv ? (m.invest ?? m.inv.final) - m.inv.invested : 0;
  return (
    <div className={`g83-life ${compact ? "compact" : ""}`}>
      <header><b>📊 My Money Life</b><small>Future Me · age {FUTURE_ME.age} · income {cop(FUTURE_ME.income)}/month</small></header>
      <div className="g83-life-grid">
        <div><small>💳 My loan</small>{m.loan ? <><b>{cop(m.loan.amount)}</b><span>{cop(m.loan.cuota)}/month · {m.loan.months} mo</span></> : <><b>—</b><span>Class 20 · Credit App</span></>}</div>
        <div><small>⭐ Credit score (class)</small><b>{m.score}</b><span>{m.life ? `${band.t}${band.rate ? ` · ≈ ${band.rate}% monthly` : ""}` : "Start: 650 · Class 21"}</span></div>
        <div><small>📈 Investments</small>{m.inv ? <><b className={gain >= 0 ? "pos" : "neg"}>{cop(m.invest ?? m.inv.final)}</b><span>{gain >= 0 ? "+" : "−"}{cop(Math.abs(gain))} vs. invested</span></> : <><b>—</b><span>Class 22 · Market Storm</span></>}</div>
        <div><small>🐷 Emergency savings</small><b>{cop(m.savings)}</b><span>{m.later ? "after one year" : "my reserve"}</span></div>
      </div>
    </div>
  );
}

/* ---------- Teléfono del periodo 3 ---------- */
function Phone83({ title = "CREAR Bank", sub, children, ok }) {
  return (
    <div className={`g83-phone ${ok ? "ok" : ""}`}>
      <div className="g83-phone-bar"><span>9:41</span><i /><span>📶 🔋</span></div>
      <div className="g83-phone-app">
        <header><em>🏦</em><div><b>{title}</b>{sub && <small>{sub}</small>}</div></header>
        {children}
      </div>
    </div>
  );
}
/* Barra de pasos con puntos */
function Steps83({ labels, at }) {
  return <div className="g72-steps">{labels.map((s, i) => <span key={s} className={at === i ? "on" : at > i ? "done" : ""}>{s}</span>)}</div>;
}
/* Tres botones de clasificación (para revisar cláusulas, ofertas…) */
function Tri({ value, onPick, opts, disabled }) {
  return <div className="type-toggle g83-tri">{opts.map(([k, l]) => <button key={k} type="button" disabled={disabled} className={value === k ? "on" : ""} onClick={() => onPick(k)}>{l}</button>)}</div>;
}

/* Orden aleatorio estable (se baraja UNA vez al abrir) */
const useOrder = (n) => useState(() => shuffleArr([...Array(n).keys()]))[0];

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
   PERIODO 3 · VIDEOS (14 preguntas c/u → 8 al azar) + LECTURAS B1 (12 → 8)
   Opciones: correcta · parecida pero errada (la más larga) · trampa corta · nada que ver
   ===================================================================== */
const VID_BANK = "https://res.cloudinary.com/y9r84vgz/video/upload/v1792714511/videoplayback_22.mp4";
const VID_LOAN = "https://res.cloudinary.com/y9r84vgz/video/upload/v1792714607/videoplayback_23.mp4";
const VID_STOCK = "https://res.cloudinary.com/y9r84vgz/video/upload/v1792714697/videoplayback_24.mp4";
const VID_MPESA = "https://res.cloudinary.com/y9r84vgz/video/upload/v1792714882/videoplayback_26.mp4";

const VQ_18 = [
  { q: "How do banks mainly make a profit from deposits and loans?", options: ["They charge more interest on loans than they pay on deposits", "They collect a fixed monthly subscription fee from every single account holder", "They print new money", "They sell houses"], correct: 0, feedback: "The difference between the two rates is the bank's main business." },
  { q: "Which system lets banks keep only a part of the deposits in cash?", options: ["Fractional reserve banking", "A centralized system that keeps all the money in one national vault", "Full reserve banking", "Stock market trading"], correct: 0, feedback: "Banks keep a fraction and lend the rest." },
  { q: "In the video, how much cash do banks usually have to keep?", options: ["About 10% of deposits", "Exactly 50% of all the money that people deposit in their accounts", "100% of every deposit", "It depends on the weather"], correct: 0, feedback: "The video uses a 10% reserve requirement." },
  { q: "In the video (USA), who sets the reserve requirement?", options: ["The Federal Reserve (the central bank)", "The city government and the state treasury offices of each region", "Each customer", "The United Nations"], correct: 0, feedback: "In Colombia, the central bank is the Banco de la República." },
  { q: "You deposit $10,000 and the reserve is 10%. How much can the bank lend?", options: ["$9,000", "$10,000, because the bank can lend everything that it receives", "$1,000", "$500"], correct: 0, feedback: "It keeps $1,000 and can lend $9,000." },
  { q: "How does this lending process affect the money supply?", options: ["It increases it without new physical cash", "It destroys all the money that is available in the economy", "It reduces it", "It lowers printing costs"], correct: 0, feedback: "Loans create money in the system." },
  { q: "What surprising idea does the narrator explain about loans and deposits?", options: ["Loans can create new deposits", "Deposits have nothing to do with any kind of lending by banks", "Loans destroy deposits", "Banks print all the cash"], correct: 0, feedback: "Borrowed money is deposited again in the banking system." },
  { q: "In reality, how do many big banks handle reserve requirements?", options: ["They lend first, then find the reserves", "They stop lending until they collect billions in physical gold bars", "They never lend money", "They close on weekends"], correct: 0, feedback: "They get new deposits or borrow afterwards." },
  { q: "What is the FIRST limit that stops banks from lending too much?", options: ["Profitability: costs and possible losses", "A government rule that allows only five loans per year for each bank", "Customer complaints", "The bank's logo"], correct: 0, feedback: "If borrowers don't pay, the bank loses money." },
  { q: "What is the SECOND limit on bank lending?", options: ["Capital requirements", "The physical space inside the bank's underground security vaults", "Employee shortages", "Football results"], correct: 0, feedback: "Banks must hold capital relative to their loans." },
  { q: "How does the video define a bank's “capital”?", options: ["Profits kept in the bank, not paid out", "The total amount of physical cash stored inside the bank's security boxes", "Money from new loans", "A capital city"], correct: 0, feedback: "Profits that are not paid to shareholders." },
  { q: "Which U.S. organization insures bank deposits?", options: ["The FDIC", "The Internal Revenue Service, the office that collects taxes in the U.S.", "The stock market", "The army"], correct: 0, feedback: "In Colombia, Fogafín protects eligible deposits (with limits)." },
  { q: "Up to what amount does the FDIC insure deposits?", options: ["Up to $250,000", "Up to ten million dollars for each person and for each account", "Only $1,000", "A free car"], correct: 0, feedback: "$250,000 per depositor, per bank (in the U.S.)." },
  { q: "What question does the video explore at the beginning?", options: ["What happens to the money we deposit", "Why banks close all of their physical branches on the weekends", "How to get a credit card", "How to cook rice"], correct: 0, feedback: "Where your deposit goes — and how banks create money." },
];

const VQ_20 = [
  { q: "Who presents the video?", options: ["Jack Guttentag, the Mortgage Professor", "A real estate broker who sells big offices in New York City", "A bank robot", "A football coach"], correct: 0, feedback: "Jack Guttentag, known as the Mortgage Professor." },
  { q: "What are many of his readers asking him?", options: ["Whether to pay their loan faster, and how", "How to declare bankruptcy and erase all of their mortgage debt", "How to borrow more", "How to buy crypto"], correct: 0, feedback: "Paying down the balance more rapidly." },
  { q: "How is each monthly payment divided?", options: ["Interest + principal that lowers the balance", "Three equal parts for insurance, property taxes and the bank's administrative fees", "Only interest", "Electricity bills"], correct: 0, feedback: "Interest for the lender, principal to reduce the debt." },
  { q: "How is the interest part of a payment calculated?", options: ["Rate × the remaining balance", "Using the market value of the house when it was first built", "Payment × 12", "Lottery numbers"], correct: 0, feedback: "Interest depends on the rate and what you still owe." },
  { q: "Monthly payment for $100,000 at 4% for 30 years in the video?", options: ["$477.42", "$1,200.50 a month, including all the taxes and the insurance", "$333.33", "$100"], correct: 0, feedback: "$477.42 every month." },
  { q: "In month one, how much of the payment is interest?", options: ["$333.33", "$477.42, the whole monthly payment for that first month", "$4,000", "$50"], correct: 0, feedback: "$100,000 × 4% ÷ 12 = $333.33." },
  { q: "What happens to interest and principal over time (same payment)?", options: ["Interest goes down, principal goes up", "Both the interest and the principal increase every month until the end", "Interest goes up", "Nothing changes"], correct: 0, feedback: "You pay less interest as the balance falls." },
  { q: "Why do you pay less and less interest each month?", options: ["Because you owe a smaller balance", "Because the government pays half of your interest every month", "Because rates fall", "Because banks like you"], correct: 0, feedback: "Lower principal → lower interest." },
  { q: "How much of an EXTRA payment goes to principal?", options: ["100%", "50% goes to principal and the other 50% goes to bank fees", "0%", "It goes to taxes"], correct: 0, feedback: "All extra payments reduce the principal." },
  { q: "Paying just $10 extra every month, the loan ends…", options: ["13 months early", "101 months early — almost nine full years before the end", "1 month early", "30 years early"], correct: 0, feedback: "Small extra payments matter." },
  { q: "Paying $100 extra every month, the loan ends…", options: ["101 months early", "13 months early, a little more than one year before the end", "10 months early", "Never"], correct: 0, feedback: "Almost 9 years earlier!" },
  { q: "Why is an extra payment like an investment?", options: ["It earns a sure return equal to the loan rate", "It puts your money in volatile shares and funds of the stock market", "It loses money", "It is a lottery"], correct: 0, feedback: "Every peso of interest you avoid is a peso earned." },
  { q: "Whose quote does the professor use?", options: ["Benjamin Franklin", "Albert Einstein, the famous scientist who studied physics", "Abraham Lincoln", "Shakira"], correct: 0, feedback: "“A penny saved is a penny earned.”" },
  { q: "What is the video's final message?", options: ["Pay extra now, save extra later", "Never make extra payments under any circumstances at all", "Pay less now", "Borrow every week"], correct: 0, feedback: "Pay extra now, save extra later." },
];

const VQ_22 = [
  { q: "Which company accidentally created the first stock market in the 1600s?", options: ["The Dutch East India Company", "The British Royal Trading Corporation of the City of London", "The New York Bank", "Google"], correct: 0, feedback: "The Dutch East India Company sold shares of its voyages." },
  { q: "Where did people first trade these shares?", options: ["In coffee houses and ports", "Inside underground bank vaults in the center of London", "In supermarkets", "On the moon"], correct: 0, feedback: "Coffee houses and shipping ports." },
  { q: "What does IPO mean?", options: ["Initial public offering", "International private option for very big investors", "Internal profit order", "Online video"], correct: 0, feedback: "The first time a company sells shares to the public." },
  { q: "What happens when you buy a stock?", options: ["You become a part owner of the company", "You get total control to hire and fire the company's CEO", "You lend money to a bank", "You become a teller"], correct: 0, feedback: "A share = a small piece of the company." },
  { q: "What happens to a stock's price when demand increases?", options: ["The price goes up", "The price automatically drops to zero for everybody", "The price goes down", "The company closes"], correct: 0, feedback: "More buyers → higher price." },
  { q: "Why do investors sell when they think value will fall?", options: ["To keep a profit before it falls more", "To pay their student loans directly to the national government", "To make the price rise", "Out of generosity"], correct: 0, feedback: "They try to sell before losing more value." },
  { q: "What force moves stock prices up and down?", options: ["Supply and demand", "Fixed prices that the government sets every single day", "Only the weather", "Video games"], correct: 0, feedback: "Like a seesaw: buyers vs. sellers." },
  { q: "Which is a market force that affects companies?", options: ["Material prices, technology and labor costs", "The clothes that employees choose and the snacks in the office", "The CEO's mood", "Movie releases"], correct: 0, feedback: "Costs and technology change company value." },
  { q: "What can “appearing to lose value” lead to?", options: ["Losing investors and real value", "Instant government rescues paid by all of the taxpayers", "More profits", "A holiday"], correct: 0, feedback: "Confidence matters." },
  { q: "Which human element can cause booms and crises?", options: ["Confidence in the market", "Advanced artificial intelligence trading programs only", "Computer viruses", "Rain"], correct: 0, feedback: "Human confidence moves markets." },
  { q: "What do most professionals recommend?", options: ["Long-term investing", "Day trading volatile stocks every single minute of the day", "Quick cash", "Casinos"], correct: 0, feedback: "Markets are unpredictable in the short term." },
  { q: "How did the internet change investing?", options: ["Everyday people can invest like big investors", "Only licensed multi-millionaires are allowed to buy shares online", "Trading was banned", "Phones got cheaper"], correct: 0, feedback: "Everyday investors have access now." },
  { q: "What is the first step to pursue your financial goals?", options: ["Getting invested", "Buying a huge commercial building in the center of the city", "Getting a loan", "Leaving school"], correct: 0, feedback: "The video says: get invested." },
  { q: "Which audiobook does the video recommend?", options: ["The Richest Man in Babylon", "The Wolf of Wall Street, a famous memoir that became a movie", "The Little Prince", "Harry Potter"], correct: 0, feedback: "A classic book about saving and investing." },
];

const VQ_24 = [
  { q: "What was the situation of banking in Africa?", options: ["Many people were unbanked and used cash", "Every citizen had several digital bank accounts and credit cards", "Banks were banned", "Everyone used gold"], correct: 0, feedback: "Many transactions happened outside banks." },
  { q: "In 2006, how many Kenyans had a bank account?", options: ["Only 2 in 10, mostly in big cities", "Nine in ten, most of them in remote villages with bank branches", "Everyone", "Only tourists"], correct: 0, feedback: "Mostly in Nairobi and Mombasa." },
  { q: "Before M-Pesa, how did city workers send money home?", options: ["Cash in an envelope with a courier", "Instant transfers with smartphone apps on very fast internet", "With credit cards", "Carrier pigeons"], correct: 0, feedback: "Slow and risky." },
  { q: "How does M-Pesa work without a bank account?", options: ["Your phone number works as the account", "People deposit physical gold in international storage boxes", "With paper checks", "Only in banks"], correct: 0, feedback: "The phone becomes a mobile wallet." },
  { q: "What can people do with M-Pesa?", options: ["Transfers, payments, credit and savings", "Buy commercial buildings and trade global stock market options", "Only phone calls", "Print dollars"], correct: 0, feedback: "Many financial services from a basic phone." },
  { q: "How are users verified?", options: ["National ID card + SMS validation", "A university diploma and a signed letter from their employer", "A password only", "A selfie"], correct: 0, feedback: "ID to register, SMS for each transaction." },
  { q: "How do users add or withdraw cash?", options: ["Agents, a SIM toolkit or an ATM", "Mailing paper checks directly to the national government treasury", "Only at banks", "Lottery"], correct: 0, feedback: "Authorized agents are key." },
  { q: "What does “M-Pesa” mean?", options: ["M = mobile, Pesa = money (Swahili)", "M = monetary, and Pesa means electronic credit in English", "M = money, Pesa = phone", "Management paper"], correct: 0, feedback: "Mobile money." },
  { q: "Where can M-Pesa's origin be traced (year 2000)?", options: ["The British Commonwealth (UK funds)", "Startup incubators in Silicon Valley, California, in the United States", "The Kenyan army", "Tokyo labs"], correct: 0, feedback: "Vodafone received funding from the British government." },
  { q: "Which Kenyan company worked with Vodafone?", options: ["Safaricom", "Airtel Kenya, the second biggest mobile company in the country", "A Spanish bank", "Netflix"], correct: 0, feedback: "Safaricom developed it with Vodafone." },
  { q: "When was M-Pesa officially launched?", options: ["2007, after a two-year pilot", "2010, after a five-year test in every country of Africa", "After ten years", "Last week"], correct: 0, feedback: "Two-year pilot, launch in 2007." },
  { q: "Where else is M-Pesa used?", options: ["Parts of Europe, Asia and the Middle East", "Only in Kenya and Uganda, with no users in any other country", "Only North America", "Antarctica"], correct: 0, feedback: "It spread beyond East Africa." },
  { q: "What positive impact did M-Pesa have in Kenya?", options: ["Fewer unbanked people and less poverty", "Very high inflation and a bankrupt national government treasury", "Less food", "More traffic"], correct: 0, feedback: "More inclusion and higher consumption." },
  { q: "What criticisms does M-Pesa receive?", options: ["Monopoly, high fees and weak privacy", "Phones that are too heavy to carry in your pocket every day", "It is too cheap", "Slow trains"], correct: 0, feedback: "Even good solutions have risks and costs." },
];

/* ---------------- LECTURA 1 · THE RATE BEHIND THE AD (Clase 19) ---------------- */
const READ_19 = [
  { sub: "The motorcycle that looked affordable" },
  { p: "Andrés was twenty-two years old and had recently started his first full-time job. Every morning, he took two buses to get to work. The journey was long, and he often arrived tired. One Friday, he saw an advertisement on his phone." },
  { say: "“Your first motorcycle! Small monthly payments. Get yours today!”" },
  { p: "The motorcycle looked perfect. The advertisement showed a smiling young man arriving at work in less than twenty minutes. At the bottom, Andrés noticed a large message: “Only 1.9% interest!”" },
  { say: "“That sounds cheap,” he thought. “If the payment is small, I can probably afford it.”" },
  { p: "Andrés visited the store after work. A salesperson explained that he could take the motorcycle home that day. He only needed to complete a short application. The salesperson showed him a payment that seemed possible, and Andrés was ready to sign." },
  { p: "Then he remembered something his cousin had told him: “Never choose a loan only because the monthly payment looks small. Ask how much you will pay in total.” Andrés decided to look at the details." },
  { h: "🔍 What the documents said" },
  { p: "The first document showed a rate of 1.9% per MONTH. It was not the same as 1.9% per year. A monthly rate applies every month. If interest is added to a balance, the effect over a year can be much bigger than the number in the advertisement suggests." },
  { p: "The second document showed a different kind of rate: the effective annual rate, or EA. This rate describes the yearly effect of interest. It helps people compare products that use different ways of expressing interest." },
  { p: "The salesperson explained that the advertisement used a monthly rate because it looked smaller. Andrés understood that a percentage without a time period does not tell the whole story. He needed to know if the rate was monthly, annual, nominal or effective." },
  { h: "🧾 More than the interest rate" },
  { p: "The loan also included a study fee and an insurance charge. Some costs were paid at the beginning, while others were added to the monthly payments. The salesperson had not mentioned these details in the first conversation." },
  { p: "Andrés opened his calculator. He compared the amount he wanted to borrow with the TOTAL amount he would pay over the complete term. A second offer had a slightly higher monthly payment, but a shorter term and fewer extra costs. A third offer had a lower payment, but Andrés would stay in debt for much longer." },
  { say: "He learned an important lesson: a small payment does not always mean a cheap loan." },
  { p: "Before choosing, Andrés asked for a complete written quotation. He wanted to confirm the EA rate, the total cost, all mandatory charges and the consequences of paying late. He also checked if the rate was fixed or variable. A fixed rate stays the same; a variable rate can change." },
  { p: "At home, he made a simple table: amount borrowed, monthly payment, term, extra costs and total amount payable. The next day, he returned to the store with questions instead of a signature." },
];
const GLOSS_19 = { "loan": "Préstamo.", "monthly payment": "Cuota mensual.", "effective annual rate": "Tasa efectiva anual (EA).", "fixed rate": "Tasa fija.", "variable rate": "Tasa variable.", "fine print": "Letra pequeña.", "quotation": "Cotización.", "term": "Plazo." };
const Q_19 = [
  { q: "Why did Andrés like the first advertisement?", options: ["The payment and the rate looked small", "Because the store promised him a free motorcycle with no payments at all", "It was red", "His boss sent it"], correct: 0, feedback: "“Small monthly payments… only 1.9%!”" },
  { q: "What was the truth about the 1.9% rate?", options: ["It was 1.9% per month, not per year", "It was 1.9% for the whole loan, so the total interest was very small", "It was a discount", "It was illegal"], correct: 0, feedback: "A monthly rate is much bigger over a year." },
  { q: "Why did the ad use the monthly rate?", options: ["Because it looks smaller", "Because the law says that all the ads must show only monthly rates", "Because it is cheaper", "By mistake"], correct: 0, feedback: "Smaller numbers attract customers." },
  { q: "What does the EA rate help you do?", options: ["Compare products fairly", "Know the exact day when the motorcycle will arrive at your house", "Avoid all fees", "Get a discount"], correct: 0, feedback: "EA = the yearly effect of interest." },
  { q: "What extra costs did Andrés discover?", options: ["A study fee and insurance", "A free helmet and a discount for paying the total amount in cash", "Only taxes", "Parking"], correct: 0, feedback: "Costs beyond the advertised interest." },
  { q: "Why was the monthly payment NOT enough to compare offers?", options: ["The term and total cost also matter", "Because the monthly payment always includes the price of the motorcycle insurance", "It changes daily", "It was secret"], correct: 0, feedback: "A small payment can mean many more months." },
  { q: "What was the problem with the third offer?", options: ["He would be in debt much longer", "It had a much higher monthly payment than all of the other offers he saw", "It had no rate", "It was in dollars"], correct: 0, feedback: "Lower payment, longer term, more total cost." },
  { q: "What did Andrés ask for in writing?", options: ["The EA, total cost and all charges", "A promise that the motorcycle would never break during the first ten years", "A free gift", "A selfie"], correct: 0, feedback: "A complete written quotation." },
  { q: "What is a variable rate?", options: ["A rate that can change", "A rate that the bank changes every day to make the loan cheaper for you", "A rate of 0%", "A monthly fee"], correct: 0, feedback: "Fixed stays the same; variable can change." },
  { q: "What did Andrés write in his table?", options: ["Amount, payment, term, extra costs, total", "The names of all the salespeople and the colors of the motorcycles", "Only the rate", "His salary"], correct: 0, feedback: "Everything needed to compare." },
  { q: "What did Andrés take to the store the next day?", options: ["Questions instead of a signature", "The money in cash to pay the full price of the motorcycle that same day", "His cousin", "A lawyer"], correct: 0, feedback: "Compare first, sign later." },
  { q: "What is the main lesson of the story?", options: ["A small payment isn't always a cheap loan", "Motorcycles are always a bad idea for young people who work in the city", "Never borrow", "Ads never lie"], correct: 0, feedback: "Look at the EA, the term and the total cost." },
];

/* ---------------- LECTURA 2 · TWO COUSINS, TWO SCORES (Clase 21) ---------------- */
const READ_21 = [
  { sub: "The same salary, different decisions" },
  { p: "Tomás and Lucía were cousins. They were both twenty-two years old, and they started working in the same company during the same month. Their salaries were similar, and both wanted to become more independent." },
  { p: "Tomás dreamed of a better computer, while Lucía wanted to save for a course that could help her find a better job. One day, both received an offer for a small loan. The company explained the payment schedule, the interest rate and the consequences of paying late." },
  { p: "Tomás accepted quickly. Lucía took the documents home and compared the offer with her monthly budget. She asked herself three questions: Could she pay the installment after covering her essential expenses? Would she still have money for an unexpected problem? Did she really need the loan now?" },
  { p: "She decided to borrow a smaller amount than the one offered. She also set a reminder on her phone for each payment date." },
  { h: "📉 A late payment" },
  { p: "Tomás did not make a budget. In the second month, he bought new headphones and spent more than he planned. He forgot to leave enough money for his loan payment. The payment was late, and he discovered that the agreement included late charges." },
  { p: "Lucía also had a difficult month. Her phone broke, and the repair was expensive. She considered using a credit card. Instead, she used part of her emergency reserve and continued making her loan payment on time. Her savings became smaller, and she needed to rebuild them — but she avoided adding a new debt." },
  { h: "📊 What is a credit history?" },
  { p: "A credit history is a record of a person's borrowing and repayment activity. Lenders may use information from credit bureaus, like Datacrédito in Colombia, when they evaluate a credit application. A credit score can describe how a lender sees an applicant, but the exact method depends on each institution." },
  { p: "Tomás learned that his late payment could matter. He also learned that a credit score is not a simple school grade. Paying on time is important, but it does not guarantee a particular score or a future loan." },
  { p: "Lucía learned something else: having a credit history is not a reason to borrow more money. The most important question was whether a new payment made sense for her situation." },
  { h: "⚠️ The dangerous offer" },
  { p: "Months later, a family member received an offer from a lender who gave money immediately, with no papers, but demanded very high daily payments and used threats when people could not pay. The cousins learned that “gota a gota” lending can bring serious financial and personal risks. Easy money is not safe money." },
  { say: "Tomás wrote three rules in his notebook: check the budget before borrowing, read the agreement and set payment reminders. Lucía added a fourth rule: keep an emergency reserve whenever possible." },
];
const GLOSS_21 = { "credit history": "Historial crediticio.", "credit bureau": "Central de riesgo (ej. Datacrédito).", "installment": "Cuota.", "late charge": "Cargo por mora.", "emergency reserve": "Fondo de emergencia.", "borrower": "Deudor / quien pide prestado.", "lender": "Prestamista.", "threats": "Amenazas." };
const Q_21 = [
  { q: "What did Tomás and Lucía have in common?", options: ["Same age, same company, similar salaries", "They both wanted to buy the same computer and the same headphones", "Same bank", "Same city"], correct: 0, feedback: "Same start — different decisions." },
  { q: "What did Lucía do before accepting the loan?", options: ["She compared it with her budget", "She asked her boss to pay the first three installments of the loan for her", "She signed fast", "Nothing"], correct: 0, feedback: "She asked herself three questions." },
  { q: "Why did Lucía choose a smaller loan?", options: ["So the payment fit her budget", "Because the company refused to give her the full amount that they had offered", "She didn't like it", "It was free"], correct: 0, feedback: "Borrow what you can pay." },
  { q: "What caused Tomás's late payment?", options: ["He spent more and had no budget", "His bank closed for a holiday and he could not pay on the right day", "He lost his job", "A storm"], correct: 0, feedback: "The headphones + no budget." },
  { q: "How did Lucía pay for the phone repair?", options: ["With her emergency reserve", "With a new credit card that offered her a free first year with no fees", "She didn't fix it", "With a loan"], correct: 0, feedback: "No new debt while paying the first one." },
  { q: "What is a credit history?", options: ["A record of borrowing and payments", "A list of all the things that you bought with cash during the last year", "A bank account", "A history class"], correct: 0, feedback: "It shows how you borrow and repay." },
  { q: "What is Datacrédito in the story?", options: ["A credit bureau in Colombia", "A bank that gives free loans to all the young people who start working", "A phone app", "A store"], correct: 0, feedback: "It collects credit information." },
  { q: "Why is a credit score NOT like a school grade?", options: ["Each lender uses its own methods", "Because it goes up exactly ten points every time you pay any kind of bill", "It is secret", "It never changes"], correct: 0, feedback: "Paying on time matters, but nothing is guaranteed." },
  { q: "Does a credit history mean you should borrow more?", options: ["No — only if the payment makes sense", "Yes, because more loans always make your score go up very quickly", "Always", "Only on Fridays"], correct: 0, feedback: "Lucía's lesson." },
  { q: "What is “gota a gota” lending?", options: ["Easy money with huge payments and threats", "A safe government program that helps families pay their electricity bills", "A savings account", "A CDT"], correct: 0, feedback: "Easy money is not safe money." },
  { q: "Which was one of Tomás's three rules?", options: ["Set payment reminders", "Always accept the first loan that a company offers you by message", "Buy headphones", "Ignore late charges"], correct: 0, feedback: "Budget · read the agreement · reminders." },
  { q: "What was Lucía's fourth rule?", options: ["Keep an emergency reserve", "Get a credit card from every store that offers you a free first year", "Borrow more", "Never work"], correct: 0, feedback: "A reserve protects your payments." },
];

/* ---------------- LECTURA 3 · ROSA WANTS A SECOND STAND (Clase 23) ---------------- */
const READ_23 = [
  { sub: "A bigger business, a bigger decision" },
  { p: "Tía Rosa had sold arepas near a busy street for three years. Her customers liked the fresh food, and several office workers visited her stand every morning. One Monday, Rosa noticed an empty space near a bus station. She imagined opening a second stand there and hiring someone to help her." },
  { p: "But opening a second stand required money: equipment, ingredients, a safe place to store food, transport and money to pay the new worker. She had some savings, but using all of them would leave her without a reserve for emergencies." },
  { h: "💵 Sales are not profit" },
  { p: "Her nephew helped her make a simple plan. Rosa discovered that sales and profit are not the same. The new stand would receive money from customers, but it would also pay for ingredients, transport, wages and equipment." },
  { p: "They also discussed cash flow: the money entering and leaving the business. Rosa might have a good month on paper but still have a problem if a big payment was due before customers paid her. She needed enough cash at the right time." },
  { h: "🏦 Four ways to finance the stand" },
  { p: "1) Her personal savings: no loan payment, but less money if the refrigerator broke or sales fell. 2) A microcredit: money sooner, but regular payments — even in a slow month. 3) A business grant, like Fondo Emprender: she might not need to repay it, but the application takes time and approval is not guaranteed. 4) An investor or partner: money now, but Rosa might share profits or decisions, so she would need a clear written agreement." },
  { h: "🧪 Test first" },
  { p: "For two weekends, Rosa sold arepas at a small temporary stand near the bus station. She recorded customers, ingredients and money received. The results were good, but sales fell when it rained. She also realized that depending on ONE supplier was risky: if the cheese price jumped, she would pay more or stop selling some products." },
  { p: "She prepared a risk plan: keep a reserve, compare suppliers, avoid depending on one big customer and investigate what business insurance would really cover. Then she created three cash-flow scenarios: a normal month, a slow month and a difficult month. If the stand could only survive when everything went well, the plan was too risky." },
  { say: "She wrote in her notebook: “Growth is not only about getting more money. It is about making decisions that allow the business to continue when something goes wrong.”" },
];
const GLOSS_23 = { "initial cost": "Inversión inicial.", "cash flow": "Flujo de caja.", "microcredit": "Microcrédito.", "grant": "Subsidio / capital semilla.", "investor": "Inversionista.", "supplier": "Proveedor.", "reserve": "Reserva.", "wages": "Salarios." };
const Q_23 = [
  { q: "Why did Rosa want a second stand?", options: ["She found a good place near a bus station", "Because her first stand was closed by the city for selling food without permission", "To cook less", "Her nephew asked"], correct: 0, feedback: "A busy location = more customers." },
  { q: "Why was using all her savings dangerous?", options: ["She would have no reserve", "Because the bank charges a very high fee every time someone uses savings", "It is illegal", "Savings expire"], correct: 0, feedback: "No money for emergencies." },
  { q: "What is the difference between sales and profit?", options: ["Profit is what's left after costs", "Sales are the money you save and profit is the money that you borrow", "No difference", "Profit is sales × 2"], correct: 0, feedback: "Sales − costs = profit." },
  { q: "What is cash flow?", options: ["Money entering and leaving", "The amount of cash that Rosa keeps hidden at home under her bed every night", "A loan", "A tax"], correct: 0, feedback: "You need cash at the right time." },
  { q: "One risk of a microcredit is…", options: ["Payments even in slow months", "That the bank becomes the new owner of half of the arepa business forever", "No money", "Free money"], correct: 0, feedback: "The installment doesn't wait for good months." },
  { q: "Why is a grant uncertain?", options: ["It takes time and may not be approved", "Because she has to pay it back twice in only three months with high interest", "It is a loan", "It's in dollars"], correct: 0, feedback: "Don't plan only with money you may not get." },
  { q: "What could an investor ask for?", options: ["A share of profits or decisions", "A free arepa every day for the rest of his life and nothing more", "Nothing", "Her house"], correct: 0, feedback: "That's why a written agreement matters." },
  { q: "How did the temporary stand help Rosa?", options: ["She tested sales before a big decision", "She earned enough money in two weekends to pay for the whole second stand", "It was free", "She got famous"], correct: 0, feedback: "Test small, then decide." },
  { q: "What happened when it rained?", options: ["Sales fell", "Sales doubled because people wanted hot food and coffee", "The stand closed forever", "Nothing"], correct: 0, feedback: "A good location doesn't guarantee good days." },
  { q: "Why is one supplier risky?", options: ["Prices or shortages can hurt her", "Because suppliers always become competitors and open their own arepa stands", "It is illegal", "It is cheaper"], correct: 0, feedback: "Compare suppliers." },
  { q: "Why did she plan for a difficult month?", options: ["To check if the stand can survive", "Because the bank asked for it as the only condition to give her a free credit card", "To be sad", "For fun"], correct: 0, feedback: "Plans must survive bad months." },
  { q: "What was Rosa's final lesson?", options: ["Growth means surviving when things go wrong", "Growth means getting as much money as possible from as many lenders as possible", "Never grow", "Always borrow"], correct: 0, feedback: "Decisions that let the business continue." },
];

/* ---------------- BOSS · PERIODO 3 (24 → 10 al azar) ---------------- */
const BOSS_8P3 = [
  { q: "A bank's main income comes from…", options: ["The spread between loan and savings rates", "A fixed subscription that every customer pays to enter the bank's building", "Printing money", "Selling ATMs"], correct: 0, feedback: "Loan rate − savings rate = spread." },
  { q: "Who supervises banks in Colombia?", options: ["The Superintendencia Financiera", "The national football federation and the ministry of sports", "Each bank", "Datacrédito"], correct: 0, feedback: "The Superfinanciera supervises; the Banco de la República controls inflation." },
  { q: "Which protects eligible bank deposits in Colombia?", options: ["Fogafín", "A private insurance that every saver must buy from the bank every month", "The army", "Nobody"], correct: 0, feedback: "Fogafín (with limits)." },
  { q: "An account costs $8,000 a month. Annual cost?", options: ["$96,000", "$8,000, because you pay the fee only once in the whole year", "$80,000", "$800"], correct: 0, feedback: "8,000 × 12." },
  { q: "“Only 1.9%!” — what's missing?", options: ["The time period (monthly or yearly)", "The name of the salesperson who will sell you the product in the store", "A discount", "Nothing"], correct: 0, feedback: "1.9% a month ≈ 25% a year." },
  { q: "2% a month is about … EA.", options: ["26.8%", "24%, because you only multiply the monthly rate by twelve months", "2%", "12%"], correct: 0, feedback: "(1.02)^12 − 1 ≈ 26.8%." },
  { q: "The usury limit is…", options: ["The maximum legal interest rate", "The minimum amount of money that you need to open a savings account", "A late fee", "A tax"], correct: 0, feedback: "Rates above it are illegal." },
  { q: "A loan payment is divided into…", options: ["Interest and principal", "Insurance, taxes and a gift for the bank employees who helped you", "Only interest", "Only principal"], correct: 0, feedback: "Principal lowers the balance." },
  { q: "Balance $1,000,000 at 2% monthly. Interest this month?", options: ["$20,000", "$200,000, because two percent of one million is two hundred thousand", "$2,000", "$100,000"], correct: 0, feedback: "1,000,000 × 0.02." },
  { q: "Payment $100,000, interest $20,000. Principal paid?", options: ["$80,000", "$120,000, because you add the interest to the payment of the month", "$20,000", "$100,000"], correct: 0, feedback: "100,000 − 20,000." },
  { q: "An extra payment on a loan…", options: ["Goes 100% to principal", "Goes completely to the bank as a fee for paying before the date", "Is illegal", "Raises the rate"], correct: 0, feedback: "It shortens the loan." },
  { q: "The game rule for a safe payment was…", options: ["Max 30% of your income", "Exactly 90% of your income, so you finish paying the loan very fast", "Any amount", "50% of savings"], correct: 0, feedback: "A simplified class rule." },
  { q: "Which action usually helps your credit history?", options: ["Paying on time", "Opening a new credit card in every store that offers you one", "Paying late", "Ignoring bills"], correct: 0, feedback: "Payment habits matter." },
  { q: "“Money in 5 minutes, no papers, daily payments!” is probably…", options: ["Gota a gota — dangerous", "A safe and cheap loan from a bank that is supervised by the government", "A CDT", "A grant"], correct: 0, feedback: "Easy money is not safe money." },
  { q: "Diversification means…", options: ["Not putting all your money in one place", "Buying only the one stock that went up the most last month", "Saving in cash", "Borrowing more"], correct: 0, feedback: "Spread the risk." },
  { q: "Which is usually the riskiest in our game?", options: ["Crypto", "A CDT from a supervised bank with a fixed rate for one full year", "An index fund", "A savings account"], correct: 0, feedback: "Very high volatility." },
  { q: "A great result in one year proves your strategy is safe.", options: ["False — luck can play a part", "True, because a good year always means the next years will also be very good", "True", "Only with crypto"], correct: 0, feedback: "Compare strategies under the same events." },
  { q: "Cash flow is…", options: ["Money in and out of a business", "The total value of all the equipment and furniture that a business owns", "A loan", "A tax"], correct: 0, feedback: "Timing matters." },
  { q: "A microcredit's main risk for Rosa is…", options: ["Payments in slow months", "The bank keeps all of her arepa recipes and opens its own stand", "No money", "Free money"], correct: 0, feedback: "Installments don't wait." },
  { q: "An investor gives Rosa money. In exchange she may…", options: ["Share profits or decisions", "Receive a second free stand from the government every single year", "Pay nothing", "Lose the first stand"], correct: 0, feedback: "Get a clear written agreement." },
  { q: "Business insurance helps when…", options: ["The grill breaks or there is a theft", "It rains and fewer customers come to buy arepas that day", "Prices fall", "Always"], correct: 0, feedback: "A reserve helps with slow sales." },
  { q: "Before confirming a transfer, you should check…", options: ["Name, key and amount", "Only the color of the app and the time on your phone screen", "Nothing", "Your score"], correct: 0, feedback: "Review before you send." },
  { q: "A message asks for your verification code. You…", options: ["Never share it and report it", "Send it quickly because the message says your account will close today", "Reply with your password", "Share it with friends"], correct: 0, feedback: "Real banks never ask for codes." },
  { q: "M-Pesa helped people because…", options: ["A basic phone works as a wallet", "Everyone received a free smartphone and a free bank account from Vodafone", "It prints money", "It's only for rich people"], correct: 0, feedback: "Access without a branch." },
];

/* =====================================================================
   CLASE 18 · HOW DOES A BANK MAKE MONEY?
   ===================================================================== */
const START_18 = {
  cards: [
    { e: "📥", t: "Deposit", d: "Money you put in the bank. The bank keeps it safe and may pay you interest.", ex: "You deposit $200,000 in your savings account." },
    { e: "🤝", t: "Loan", d: "Money the bank lends. The borrower pays it back WITH interest.", ex: "A bakery borrows $5,000,000 for an oven." },
    { e: "↔️", t: "Spread (margen)", d: "The difference between the rate the bank CHARGES for loans and the rate it PAYS to savers.", ex: "Loans 12% − savings 3% = 9 points." },
    { e: "🐷", t: "Savings account", d: "An account to keep money and withdraw it when you need it. It may pay a small interest.", ex: "Your emergency money." },
    { e: "🧾", t: "Current account", d: "An account for many payments, often used by businesses. It can include checks and overdraft.", ex: "Rosa pays suppliers from it." },
    { e: "📜", t: "CDT", d: "A deposit for a fixed time with a fixed rate. You usually can't withdraw before the end.", ex: "12 months at 10% EA." },
    { e: "🛡️", t: "Superfinanciera", d: "The Superintendencia Financiera supervises banks and protects customers.", ex: "You can complain there about unclear fees." },
    { e: "🏛️", t: "Banco de la República", d: "Colombia's central bank: it controls inflation and issues the peso.", ex: "It sets the reference interest rate." },
  ],
  rounds: [
    { tag: "QUICK 1", q: "Loans pay 14%. Savings pay 4%. The spread is…", options: ["10 points", "18 points, because you add the two rates together", "4 points", "14 points"], correct: 0, explain: "14 − 4 = 10 percentage points." },
    { tag: "QUICK 2", q: "Who controls inflation in Colombia?", options: ["Banco de la República", "The Superfinanciera, which also prints all the bills", "Each bank", "Datacrédito"], correct: 0, explain: "The central bank." },
    { tag: "QUICK 3", q: "A bank charges a fee you didn't understand. Where can you complain?", options: ["Superfinanciera", "The Banco de la República, which approves every fee", "Nowhere", "The police"], correct: 0, explain: "It supervises banks and protects customers." },
    { tag: "QUICK 4", q: "Money for a fixed time at a fixed rate is a…", options: ["CDT", "Current account with a checkbook for business payments", "Loan", "Debit card"], correct: 0, explain: "Certificado de Depósito a Término." },
  ],
};
const RUSH_18 = {
  buckets: [{ id: "bank", e: "🏦", l: "A bank", d: "Saves, lends, charges.", c: "#0b7a50" }, { id: "super", e: "🛡️", l: "Superfinanciera", d: "Supervises & protects.", c: "#e07a2f" }, { id: "banrep", e: "🏛️", l: "Banco de la República", d: "Inflation & pesos.", c: "#f5b23e" }],
  items: [
    { e: "🐷", t: "Keeps your savings and pays you interest", b: "bank", why: "That's a bank's service." }, { e: "🏠", t: "Lends money to a family to buy a house", b: "bank", why: "Loans = bank business." },
    { e: "💳", t: "Charges a monthly fee for a debit card", b: "bank", why: "Fees are charged by banks." }, { e: "📜", t: "Opens a 12-month CDT for you", b: "bank", why: "A savings product." },
    { e: "🔍", t: "Supervises banks so they follow the rules", b: "super", why: "Supervision." }, { e: "📣", t: "Receives complaints about unclear fees", b: "super", why: "Consumer protection." },
    { e: "📏", t: "Certifies the usury limit (maximum legal rate)", b: "super", why: "The Superfinanciera certifies it." }, { e: "🧮", t: "Checks that banks have enough capital", b: "super", why: "Safety of the system." },
    { e: "🎈", t: "Fights inflation in Colombia", b: "banrep", why: "Central bank job." }, { e: "🪙", t: "Issues the Colombian peso bills and coins", b: "banrep", why: "Only the central bank." },
    { e: "📊", t: "Sets the reference interest rate", b: "banrep", why: "Monetary policy." }, { e: "🏦", t: "Is “the bank of the banks”", b: "banrep", why: "Banks keep reserves there." },
  ],
};

/* ---------- BANK TYCOON · administra CREAR Bank 6 rondas ---------- */
const TY_ROUNDS = [
  { e: "🎒", t: "New savers · a bakery asks for a loan", d: "Students and families deposit money. 🥖 Panadería Sol asks to borrow 30 units for a new oven.", app: { n: "🥖 Panadería Sol", amt: 30, good: true, review: "Sells every day for 5 years · paid all its loans on time · the oven will raise sales." } },
  { e: "🏦", t: "Savers compare banks", d: "A new digital bank pays 6% to savers. Will your customers stay with you?", ev: "savers" },
  { e: "🚗", t: "A risky application", d: "Mr. Pérez asks to borrow 40 units for a luxury car.", app: { n: "🚗 Mr. Pérez", amt: 40, good: false, review: "3 unpaid loans · no stable income · already owes money to two banks." } },
  { e: "💡", t: "A marketing idea", d: "Your team suggests a new monthly fee. How will you show it to customers?", fee: true },
  { e: "🏃", t: "Rumors! Many savers want their money today", d: "Can you pay them? It depends on how much cash you kept (not lent).", ev: "run" },
  { e: "📋", t: "Final audit", d: "The Superfinanciera reviews your bank: profit, trust and risk.", ev: "audit" },
];
const TY_S = [1, 3, 4, 6], TY_L = [8, 12, 15, 20, 28];
function BankTycoon({ onSave, onExit }) {
  const [rd, setRd] = useState(0);
  const [s, setS] = useState(3);
  const [l, setL] = useState(12);
  const [share, setShare] = useState(70);
  const [app, setApp] = useState(null); // approve | reject
  const [reviewed, setReviewed] = useState(false);
  const [fee, setFee] = useState(null);
  const [st8, setSt8] = useState({ D: 100, P: 0, T: 70, K: 20, pending: 0 });
  const [log, setLog] = useState([]);
  const [last, setLast] = useState(null);
  const [q, setQ] = useState(null);
  const qOrd = useOrder(3);
  const [st, finish] = useFinish(onSave);
  const R = TY_ROUNDS[rd];
  const done = rd >= TY_ROUNDS.length;
  const needs = !R ? false : (R.app && !app) || (R.fee && !fee);
  const run = () => {
    let { D, P, T, K, pending } = st8; const msgs = [];
    let extra = 0;
    const demand = clamp(1.25 - (l - 10) / 20, 0.3, 1.2);
    const L = Math.round(D * (share / 100) * demand);
    const income = +(L * l / 100).toFixed(1), cost = +(D * s / 100).toFixed(1), ops = 2;
    let losses = +(L * (0.01 + K / 1000)).toFixed(1);
    if (pending) { losses += pending; msgs.push(`💸 Missed payments: Mr. Pérez stopped paying (−${pending}).`); pending = 0; }
    if (R.app) {
      if (app === "approve" && R.app.good) { extra += 2; msgs.push(`✅ ${R.app.n} got the loan and pays on time (+2).`); }
      if (app === "approve" && !R.app.good) { pending = Math.round(R.app.amt * 0.6); K += 25; msgs.push(`⚠️ You lent to ${R.app.n}. Risk goes up… payments may stop next round.`); }
      if (app === "reject" && R.app.good) { T -= 3; msgs.push(`😕 You rejected a good customer: no income from that loan.`); }
      if (app === "reject" && !R.app.good) { K = Math.max(0, K - 5); msgs.push(`👍 Good call: rejecting a risky loan protects savers' money.`); }
    }
    if (R.ev === "savers") { if (s >= 4) { D += 15; T += 5; msgs.push("😊 Happy savers! Your rate is competitive: deposits +15."); } else { D -= 15; T -= 5; msgs.push("🚪 Savers moved to the digital bank: deposits −15."); } }
    if (R.fee) { if (fee === "hidden") { extra += 4; T -= 15; K += 5; msgs.push("📣 Customers found the hidden fee and complained to the Superfinanciera. Trust −15."); } if (fee === "clear") { extra += 2; msgs.push("🧾 A clear, explained fee: a little income, no surprises."); } if (fee === "none") { T += 3; msgs.push("💚 No new fee: customers trust you more."); } }
    if (R.ev === "run") { if (100 - share < 20) { T -= 25; extra -= 6; msgs.push("🚨 You kept too little cash! You had to borrow in a hurry to pay savers. Trust −25."); } else { T += 10; msgs.push("🏦 You had enough cash and paid everyone. Trust +10."); } }
    if (l > USURY.ea) { T -= 10; K += 10; extra -= 5; msgs.push(`🛑 Regulator alert: ${l}% is above ${USURY.label} (${USURY.ea}% in this game). Fine −5.`); }
    if (s >= 4) T += 3; if (s <= 1) T -= 6; if (l >= 20) T -= 5;
    K = clamp(K + (share > 85 ? 8 : -3), 0, 100);
    const profit = +(income - cost - ops - losses + extra).toFixed(1);
    P = +(P + profit).toFixed(1); T = clamp(Math.round(T), 0, 100);
    D = Math.max(40, Math.round(D + 2 + (s - 3) * 2 + (T - 60) / 10));
    const row = { rd: rd + 1, L, income, cost, ops, losses, extra, profit, P, T, K, D };
    setSt8({ D, P, T, K, pending }); setLog([...log, row]); setLast({ row, msgs });
  };
  const next = () => { setRd(rd + 1); setLast(null); setApp(null); setReviewed(false); setFee(null); };
  const stars = [st8.P > 0, st8.T >= 60, st8.K <= 40].filter(Boolean).length;
  if (st.done) return <Reward title={`CREAR Bank audit: ${stars}/3 ⭐`} subtitle="A good bank is profitable AND trusted." coins={st.coins} saving={st.saving} onExit={onExit} gold={stars === 3} />;
  return (
    <ActShell icon={<Landmark size={22} strokeWidth={2.1} />} title="Bank Tycoon 🏦" subtitle="Run CREAR Bank for 6 rounds. Make a profit — and keep customers' trust." onExit={onExit}>
      <div className="g83-tyco-meters">
        <div><small>💰 Profit (total)</small><b className={st8.P >= 0 ? "pos" : "neg"}>{st8.P}</b></div>
        <div><small>📥 Deposits</small><b>{st8.D}</b></div>
        <Meter value={st8.T} color="#16b074" label="🤝 Customer trust" />
        <Meter value={st8.K} color="#ff6b57" label="⚠️ Loan risk" />
      </div>
      {!done ? (
        <>
          <HowTo>You decide <b>what you pay savers</b>, <b>what you charge borrowers</b> and <b>how much you lend</b>. The spread is your main income — but if you pay too little, savers leave; if you charge too much, nobody borrows (and above the usury limit the regulator fines you). Units are fictional (1 unit = $1,000,000).</HowTo>
          <div className="g74-news"><small>ROUND {rd + 1}/{TY_ROUNDS.length}</small><h3>{R.e} {R.t}</h3><p>{R.d}</p></div>
          {!last && (
            <>
              <div className="g83-rates">
                <div><small>🐷 Rate you PAY savers</small><Tri value={s} onPick={setS} opts={TY_S.map((x) => [x, `${x}%`])} /></div>
                <div><small>🤝 Rate you CHARGE borrowers</small><Tri value={l} onPick={setL} opts={TY_L.map((x) => [x, `${x}%`])} /></div>
                <div className="g83-spread"><small>Spread</small><b>{l - s} points</b><span>{l - s <= 5 ? "Very small — can you cover costs?" : l > USURY.ea ? "🛑 Above the usury limit!" : "Your main income per unit lent"}</span></div>
              </div>
              <div className="g72-machine">{Ctl({ l: "📤 % of deposits you LEND (the rest stays as cash)", v: share, set: setShare, mn: 40, mx: 95, stp: 5, fmt: (x) => `${x}% lent · ${100 - x}% cash` })}</div>
              {R.app && (
                <div className="start-block">
                  <h3>📝 Loan application: {R.app.n} · {R.app.amt} units</h3>
                  {reviewed ? <div className="p1-hint">🔍 Review: {R.app.review}</div> : <button type="button" className="s1-btn ghost" onClick={() => setReviewed(true)}><Search size={15} /> Review the customer first</button>}
                  <Tri value={app} onPick={setApp} opts={[["approve", "✅ Approve"], ["reject", "❌ Reject"]]} />
                </div>
              )}
              {R.fee && <div className="start-block"><h3>💡 The new fee</h3><div className="g82-choices">{[["hidden", "🙈 Hide it in the fine print (+4 profit)"], ["clear", "🧾 Explain it clearly (+2 profit)"], ["none", "💚 No new fee"]].map(([k, t]) => <button key={k} type="button" className={fee === k ? "sel" : ""} onClick={() => setFee(k)}>{t}</button>)}</div></div>}
              <div className="start-foot"><button className="s1-btn primary big" disabled={needs} onClick={run}><Play size={16} /> Run round {rd + 1}</button></div>
            </>
          )}
          {last && (
            <>
              <MiniTable head={["Loans", "Interest earned", "Interest paid", "Costs", "Losses", "Round profit"]} rows={[[`${last.row.L}`, `+${last.row.income}`, `−${last.row.cost}`, `−${last.row.ops}`, `−${last.row.losses}`, `${last.row.profit >= 0 ? "+" : ""}${last.row.profit}${last.row.extra ? ` (extra ${last.row.extra > 0 ? "+" : ""}${last.row.extra})` : ""}`]]} />
              <div className={`g82-bias ${last.row.profit >= 0 ? "good" : "bad"}`}><small>WHAT HAPPENED</small>{last.msgs.length ? last.msgs.map((m) => <p key={m}>{m}</p>) : <p>A normal round: your spread did the work.</p>}</div>
              <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{rd === TY_ROUNDS.length - 1 ? "See the final audit" : "Next round"} <ChevronRight size={18} /></button></div>
            </>
          )}
        </>
      ) : (
        <>
          <h4 className="g8-subh">📈 Total profit, round by round (units)</h4>
          <LineChart series={[{ name: "Total profit", values: [0, ...log.map((r) => r.P)], color: "#0b7a50" }, { name: "Trust", values: [70, ...log.map((r) => r.T)], color: "#f5b23e" }]} labels={["Start", ...log.map((r) => `R${r.rd}`)]} height={200} money={false} yMin={Math.min(0, ...log.map((r) => r.P))} />
          <ChartLegend series={[{ name: "Total profit (units)", color: "#0b7a50" }, { name: "Customer trust", color: "#f5b23e" }]} />
          <div className="g8-answers">
            <div className={st8.P > 0 ? "ok" : "no"}><b>💰 Profitable</b><span>Total profit {st8.P} units.</span></div>
            <div className={st8.T >= 60 ? "ok" : "no"}><b>🤝 Trusted</b><span>Trust {st8.T}/100 (60+ needed).</span></div>
            <div className={st8.K <= 40 ? "ok" : "no"}><b>⚠️ Safe</b><span>Risk {st8.K}/100 (40 or less).</span></div>
          </div>
          <div className="start-block">
            <h3>🤔 Where did your bank's profit really come from?</h3>
            <div className="g82-choices">{qOrd.map((k) => { const t = ["↔️ The spread: charging borrowers more than I paid savers", "🙈 Hidden fees, because customers never notice them", "🖨️ Printing money"][k]; return <button key={t} type="button" className={q === k ? "sel" : ""} onClick={() => setQ(k)}>{t}</button>; })}</div>
            {q !== null && <div className={`p1-banner ${q === 0 ? "good" : "bad"}`}><span>{q === 0 ? "✅ Exactly: the spread is the business model. Trust and low risk keep it working." : "❌ Look at your table: interest earned − interest paid is the main income. Hidden fees destroy trust."}</span></div>}
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={q !== 0} onClick={() => finish(24 + stars * 4, { profit: st8.P, trust: st8.T, risk: st8.K, stars, log })}>Save my audit <span className="coin-tag"><Coins size={15} /> +{24 + stars * 4}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- GUIDE 01 · TOTAL COST DUEL (cuenta para Valentina) ---------- */
const ACC18 = [
  { id: "clasica", e: "🏦", n: "Cuenta Clásica", fee: 9900, free: 4, wcost: 2500, perks: "Debit card · branches in every city" },
  { id: "neo", e: "📲", n: "NeoPocket", fee: 0, free: 1, wcost: 4500, perks: "App only · no branches · instant transfers" },
  { id: "joven", e: "🎓", n: "Cuenta Joven", fee: 3500, free: 2, wcost: 3000, perks: "For students · debit card · app" },
];
const annualCost18 = (a, w) => (a.fee + Math.max(0, w - a.free) * a.wcost) * 12;
function CostDuel({ existing, onSave, onExit }) {
  const W0 = 3;
  const [c, setC] = useState({ fee: "", w: "", free: "", cost: "" });
  const [ans, setAns] = useState({});
  const [chk, setChk] = useState(false);
  const [w, setW] = useState(W0);
  const [pick, setPick] = useState(existing?.pick || null);
  const [txt, setTxt] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const calc = (num(c.fee) + Math.max(0, num(c.w) - num(c.free)) * num(c.cost)) * 12;
  const okAll = ACC18.every((a) => Math.abs(num(ans[a.id]) - annualCost18(a, W0)) <= 100);
  const G = [W_NUMBERS(1), W_REASON];
  const P = ACC18.find((a) => a.id === pick);
  if (st.done) return <Reward title="Guide page 01 ready! 🏦" subtitle="You compared accounts by their REAL annual cost." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Wallet size={22} strokeWidth={2.1} />} title="Total Cost Duel 🏦" subtitle="Which account is really cheaper for Valentina? Don't look only at the monthly fee." onExit={onExit}>
      <GBadge n="01" />
      <ClientCard id="valentina" />
      <Mission e="👩‍🎓" title="Valentina saves $150,000 a month and withdraws cash about 3 times a month.">She found 3 accounts. Calculate the ANNUAL cost of each one and recommend the best for her.</Mission>
      <MiniTable head={["Account", "Monthly fee", "Free withdrawals / month", "Each extra withdrawal", "Perks"]} rows={ACC18.map((a) => [`${a.e} ${a.n}`, cop(a.fee), `${a.free}`, cop(a.wcost), a.perks])} />
      <div className="g82-calc open">
        <div className="g82-calc-head"><b>🧮 Annual cost calculator</b><span>Type the numbers · read the result</span></div>
        <div className="g82-calc-body four">
          <NumBox label="Monthly fee" value={c.fee} set={(v) => setC({ ...c, fee: v })} unit="$" />
          <NumBox label="Withdrawals / month" value={c.w} set={(v) => setC({ ...c, w: v })} unit="#" step="1" />
          <NumBox label="Free withdrawals" value={c.free} set={(v) => setC({ ...c, free: v })} unit="#" step="1" />
          <NumBox label="Cost of each extra" value={c.cost} set={(v) => setC({ ...c, cost: v })} unit="$" />
          <div className="g82-formula"><small>FORMULA</small><code>(fee + extra withdrawals × cost) × 12</code><small>WITH YOUR NUMBERS</small><code>({cop(num(c.fee))} + {Math.max(0, num(c.w) - num(c.free))} × {cop(num(c.cost))}) × 12</code></div>
          <div className="g82-result"><small>Annual cost</small><b>{cop(calc)}</b><span>Extra withdrawals = withdrawals − free ones (never below 0)</span></div>
        </div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">1</span> Annual cost for Valentina (3 withdrawals a month)</h3>
        {ACC18.map((a) => { const ok = Math.abs(num(ans[a.id]) - annualCost18(a, W0)) <= 100; return (
          <div key={a.id} className={`g82-calcrow ${chk ? (ok ? "ok" : "no") : ""}`}><span>{a.e} {a.n}</span><MoneyInput value={ans[a.id] || ""} onChange={(v) => { setAns({ ...ans, [a.id]: v }); setChk(false); }} />{chk && <b>{ok ? "✅" : "❌ try again"}</b>}</div>
        ); })}
        {!okAll && <div className="start-foot"><button className="s1-btn ghost" onClick={() => setChk(true)}><Check size={15} /> Check my numbers</button></div>}
      </div>
      {okAll && (
        <>
          <div className="start-block">
            <h3><span className="step-n">2</span> 🔁 What if Valentina changes how she uses the account?</h3>
            <div className="g72-machine">{Ctl({ l: "🏧 Withdrawals per month", v: w, set: setW, mn: 0, mx: 8, stp: 1, fmt: (x) => `${x}` })}</div>
            <BarChart bars={ACC18.map((a) => ({ label: `${a.e} ${a.n}`, value: annualCost18(a, w), color: a.id === ACC18.reduce((m, x) => (annualCost18(x, w) < annualCost18(m, w) ? x : m)).id ? "#16b074" : "#f5b23e" }))} height={190} />
            <p className="start-tip">💡 The cheapest account CHANGES with the number of withdrawals. That's why you must know how the client uses the account.</p>
          </div>
          <div className="start-block">
            <h3><span className="step-n">3</span> My recommendation for Valentina</h3>
            <div className="g8-pick">{ACC18.map((a) => <button key={a.id} type="button" className={pick === a.id ? "on" : ""} onClick={() => setPick(a.id)}><em>{a.e}</em><b>{a.n}</b><small>{cop(annualCost18(a, W0))}/year</small>{pick === a.id && <i>✓</i>}</button>)}</div>
            <Starters items={["I recommend", "because it costs", "per year", "Compared with", "If she withdraws less,"]} onPick={appendStarter(setTxt)} />
            <WordField value={txt} onChange={setTxt} min={25} max={90} rows={4} goals={G} placeholder="Write your recommendation here…" />
          </div>
        </>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!okAll || !pick || !goalsOk(txt, 25, 90, G)} onClick={() => finish(30, { pick, pickName: P?.n, costs: Object.fromEntries(ACC18.map((a) => [a.id, annualCost18(a, W0)])), annual: annualCost18(P, W0), text: txt })}>Save page 01 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 19 · THE RATE BEHIND THE AD
   ===================================================================== */
const START_19 = {
  cards: [
    { e: "🗓️", t: "Monthly rate", d: "Interest for ONE month. It looks small, but it repeats every month.", ex: "1.9% a month ≈ 25% a year." },
    { e: "🏷️", t: "Nominal annual rate", d: "A yearly rate that is divided by 12 and paid monthly. The real yearly effect is bigger.", ex: "24% nominal → 2% a month → 26.8% EA." },
    { e: "📆", t: "EA (effective annual)", d: "The real yearly effect of interest. Use it to compare offers.", ex: "23.87% EA." },
    { e: "🔒", t: "Fixed rate", d: "It stays the same during the loan.", ex: "1.8% monthly for 24 months." },
    { e: "🔁", t: "Variable rate", d: "It can change during the loan, so the payment can change too.", ex: "“From 17% EA…”" },
    { e: "⏰", t: "Late charge (mora)", d: "Extra interest or fees if you pay after the due date.", ex: "+$30,000 collection fee." },
    { e: "📏", t: "Usury limit", d: "The maximum legal interest rate in Colombia. The Superfinanciera certifies it.", ex: "Any rate above it is illegal." },
    { e: "🧾", t: "Total cost", d: "Everything you pay: payments + fees + insurance. Compare THIS, not only the payment.", ex: "Borrow $6M → pay $7.5M." },
  ],
  rounds: [
    { tag: "QUICK 1", q: "“Only 1.9%!” What is missing?", options: ["The time period", "The color of the motorcycle and the name of the store", "Nothing", "A gift"], correct: 0, explain: "1.9% a month is NOT 1.9% a year." },
    { tag: "QUICK 2", q: "24% nominal annual paid monthly = … a month", answer: 2, unit: "%", hint: "24 ÷ 12", explain: "2% a month (and about 26.8% EA)." },
    { tag: "QUICK 3", q: "To compare offers fairly, use the…", options: ["EA and the total cost", "Monthly payment only, because it is what you pay", "Ad's colors", "Fastest approval"], correct: 0, explain: "EA + total cost tell the full story." },
    { tag: "QUICK 4", q: "A rate ABOVE the usury limit is…", options: ["Illegal", "Normal for loans that are approved very fast", "Cheaper", "A discount"], correct: 0, explain: "The usury limit is the legal maximum." },
  ],
};
const RUSH_19 = {
  buckets: [{ id: "ok", e: "✅", l: "Clear info", d: "You can compare it.", c: "#0b7a50" }, { id: "red", e: "🚩", l: "Missing or hidden", d: "Ask — or walk away.", c: "#ff6b57" }],
  items: [
    { e: "📆", t: "Rate: 1.8% monthly = 23.87% EA, fixed", b: "ok", why: "Period + EA + fixed." }, { e: "🧾", t: "Total to pay in 24 months: $7,526,000", b: "ok", why: "The total cost is clear." },
    { e: "🛡️", t: "Insurance $25,000/month, included in the payment shown", b: "ok", why: "The extra cost is explained." }, { e: "⏰", t: "Late charge explained in the contract", b: "ok", why: "You know the consequence." },
    { e: "💵", t: "You can pay extra with no penalty", b: "ok", why: "A clear condition." }, { e: "📝", t: "Written quotation with all the fees", b: "ok", why: "Everything in writing." },
    { e: "📣", t: "“Only 1.9%!” (no period)", b: "red", why: "Monthly or yearly?" }, { e: "🪙", t: "“Low payments!” (no term)", b: "red", why: "For how many months?" },
    { e: "❓", t: "“Fees may apply”", b: "red", why: "Which fees? How much?" }, { e: "⚡", t: "“Approved in 5 minutes, no questions”", b: "red", why: "Pressure + no evaluation." },
    { e: "🤐", t: "“Rate: ask the agent”", b: "red", why: "The rate must be written." }, { e: "🔑", t: "“Send us your password to approve your loan”", b: "red", why: "Never share passwords." },
  ],
};
/* ---------- RATE READER · 6 anuncios para Andrés ($6,000,000) ---------- */
const LOAN19 = 6000000;
const OFFERS19 = [
  { id: "moto", e: "🛵", n: "Moto Fácil", ad: "Your first motorcycle! Only 1.9%!", main: "1.9%", fine: ["1.9% per MONTH", "Term: 24 months", "Study fee: $150,000 at the start"], type: "monthly", m: 1.9, months: 24, fee0: 150000, flag: "ask", why: "The ad hides that 1.9% is MONTHLY (≈ 25.3% EA) and there is a study fee." },
  { id: "ruta", e: "🚀", n: "Ruta Joven", ad: "21.6% a year — clear and simple.", main: "21.6% a year", fine: ["21.6% NOMINAL annual, paid monthly", "Term: 36 months", "No extra fees · fixed rate"], type: "nominal", m: 1.8, months: 36, flag: "ok", why: "Everything is written: rate type, term and no extra fees." },
  { id: "seguro", e: "🛡️", n: "Plan Seguro", ad: "22% EA — the honest rate!", main: "22% EA", fine: ["22% EA, fixed", "Term: 24 months", "Mandatory insurance: $30,000 EVERY month"], type: "ea", ea: 22, months: 24, feeM: 30000, flag: "ask", why: "Good EA, but the insurance adds $720,000. Ask if you can choose your own insurance." },
  { id: "pequena", e: "🪙", n: "Cuota Pequeña", ad: "Pay only $153,000 a month!", main: "1.5%", fine: ["1.5% per month", "Term: 60 months (5 years!)", "No extra fees"], type: "monthly", m: 1.5, months: 60, flag: "ask", why: "A small payment… for 5 years. The total cost is the highest of the clear offers." },
  { id: "flex", e: "🔁", n: "Crédito Flexible", ad: "From 17% EA!", main: "17% EA (starting)", fine: ["17% EA for the first 6 months", "VARIABLE rate: it can change every 6 months", "Term: 24 months"], type: "ea", ea: 17, months: 24, flag: "ask", why: "“From” 17%: the rate is variable, so the payment can go up. Ask the maximum." },
  { id: "misterio", e: "❓", n: "Oferta Misteriosa", ad: "Approved in 5 minutes! Tiny payments!", main: "Not shown", fine: ["Rate: “ask the agent”", "“Fees may apply”", "In the contract: 3.2% per month"], type: "none", m: 3.2, months: 24, flag: "red", why: "No EA in the ad, unclear fees and 3.2% monthly ≈ 45.9% EA — far above the usury limit." },
];
const offMonthly = (o) => (o.m != null ? o.m : monthlyEq(o.ea));
const offEA = (o) => (Math.pow(1 + offMonthly(o) / 100, 12) - 1) * 100;
const offRow = (o) => { const cu = pmt(LOAN19, offMonthly(o) / 100, o.months) + (o.feeM || 0); const total = cu * o.months + (o.fee0 || 0); return { cu, total, ea: offEA(o), extra: (o.feeM || 0) * o.months + (o.fee0 || 0) }; };
const RTYPES = [["monthly", "🗓️ Monthly"], ["nominal", "🏷️ Nominal annual"], ["ea", "📆 EA"], ["none", "❓ Not shown"]];
function RateReader({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [open, setOpen] = useState(0);
  const [layer, setLayer] = useState({});
  const [typ, setTyp] = useState({});
  const [typBad, setTypBad] = useState({});
  const [first, setFirst] = useState(0);
  const [calcScore, setCalcScore] = useState(0);
  const [flag, setFlag] = useState({});
  const [flagChk, setFlagChk] = useState(false);
  const [preset, setPreset] = useState(null);
  const calcRef = useRef(null);
  const [st, finish] = useFinish(onSave);
  const load = (tab, v) => { setPreset({ n: Date.now(), tab, v }); setTimeout(() => calcRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60); };
  const LoadBtn = ({ tab, v }) => <button type="button" className="g82-load" onClick={() => load(tab, v)}>📥 Put these numbers in the calculator</button>;
  const O = OFFERS19[open];
  const lay = layer[O.id] || 0;
  const typedOk = OFFERS19.every((o) => typ[o.id] === o.type);
  const pickType = (k) => { const ok = k === O.type; setTyp({ ...typ, [O.id]: k }); if (ok && !typBad[O.id]) setFirst((f) => f + 1); if (!ok) setTypBad({ ...typBad, [O.id]: true }); };
  const rows = OFFERS19.map((o) => ({ o, ...offRow(o) }));
  const flagsOk = OFFERS19.every((o) => flag[o.id] === o.flag);
  const R19 = [
    { tag: "CALCULATE 1", q: "🛵 Moto Fácil charges 1.9% MONTHLY. What is the EA? (2 decimals)", visual: <p className="g82-hintline">🧮 Use <b>🗓️➜📆 Monthly → Annual</b> with 1.9. <LoadBtn tab="m2a" v={{ mo: 1.9 }} /></p>, answer: +offEA(OFFERS19[0]).toFixed(2), tol: 0.05, unit: "%", hint: "Monthly → Annual with 1.9. It's MORE than 1.9 × 12 = 22.8.", explain: `≈ ${offEA(OFFERS19[0]).toFixed(2)}% EA — the “1.9%” ad hides a 25% yearly rate.` },
    { tag: "CALCULATE 2", q: "🚀 Ruta Joven: 21.6% NOMINAL annual paid monthly. What is the EA?", visual: <p className="g82-hintline">🧮 Use <b>🏷️➜📆 Nominal → EA</b> with 21.6. <LoadBtn tab="n2e" v={{ nn: 21.6 }} /></p>, answer: +offEA(OFFERS19[1]).toFixed(2), tol: 0.05, unit: "%", hint: "21.6 ÷ 12 = 1.8% a month → (1.018)^12 − 1.", explain: `≈ ${offEA(OFFERS19[1]).toFixed(2)}% EA.` },
    { tag: "CALCULATE 3", q: "🛵 Moto Fácil: monthly payment for $6,000,000 in 24 months at 1.9% monthly?", visual: <p className="g82-hintline">🧮 Use <b>🧾 Loan payment</b>. <LoadBtn tab="pmt" v={{ lp: 6000000, lr: 1.9, ln: 24 }} /></p>, answer: Math.round(pmt(LOAN19, 0.019, 24)), tol: 1000, money: true, hint: "Loan payment tab: 6000000 · 1.9 · 24.", explain: `${cop(pmt(LOAN19, 0.019, 24))} a month.` },
    { tag: "CALCULATE 4", q: "🪙 Cuota Pequeña: 1.5% monthly for 60 months. TOTAL paid (without the $6,000,000 discount)?", visual: <p className="g82-hintline">🧮 Use <b>🧾 Loan payment</b> and read “Total paid”. <LoadBtn tab="pmt" v={{ lp: 6000000, lr: 1.5, ln: 60 }} /></p>, answer: Math.round(pmt(LOAN19, 0.015, 60) * 60), tol: 3000, money: true, hint: "Read the TOTAL under the payment.", explain: `${cop(pmt(LOAN19, 0.015, 60) * 60)} — more than $9 million for a $6 million loan!` },
  ];
  if (st.done) return <Reward title="Rate detective! 🔎" subtitle="You read the fine print, calculated the EA and exposed the trap." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Rate Reader 🔎" subtitle="Six credit ads for Andrés ($6,000,000 motorcycle). Scan · translate · calculate · expose." onExit={onExit}>
      <Steps83 labels={["1 · Scan & translate", "2 · Calculate", "3 · Compare & expose"]} at={stage} />
      {stage === 0 && (
        <>
          <HowTo>Open each ad in 3 layers: the <b>ad</b> → the <b>main rate</b> → the <b>fine print</b>. Then say what TYPE of rate it is. ({Object.keys(typ).filter((k) => typ[k] === OFFERS19.find((o) => o.id === k).type).length}/6)</HowTo>
          <div className="g83-adtabs">{OFFERS19.map((o, k) => <button key={o.id} type="button" className={`${open === k ? "on" : ""} ${typ[o.id] === o.type ? "done" : ""}`} onClick={() => setOpen(k)}><em>{o.e}</em>{o.n}</button>)}</div>
          <div className="g83-ad" key={O.id}>
            <div className="g83-ad-hero"><em>{O.e}</em><b>{O.n}</b><p>“{O.ad}”</p></div>
            {lay >= 1 && <div className="g83-ad-main"><small>MAIN RATE</small><b>{O.main}</b></div>}
            {lay >= 2 && <div className="g83-ad-fine"><small>📜 FINE PRINT</small><ul>{O.fine.map((f) => <li key={f}>{f}</li>)}</ul></div>}
            {lay < 2 ? <button type="button" className="s1-btn ghost" onClick={() => setLayer({ ...layer, [O.id]: lay + 1 })}><Search size={15} /> {lay === 0 ? "Reveal the main rate" : "Open the fine print"}</button> : (
              <div className="g83-ad-type"><small>What type of rate is it?</small><Tri value={typ[O.id]} onPick={pickType} opts={RTYPES} />
                {typ[O.id] && (typ[O.id] === O.type ? <p className="ok">✅ Correct!</p> : <p className="no">❌ Read the fine print again: is the rate per month, per year divided by 12, effective annual — or missing?</p>)}
              </div>
            )}
          </div>
          <div className="start-foot">{open < OFFERS19.length - 1 && <button className="s1-btn ghost" onClick={() => setOpen(open + 1)}>Next ad <ChevronRight size={16} /></button>}<button className="s1-btn primary big" disabled={!typedOk} onClick={() => setStage(1)}>{typedOk ? "Calculate" : "Classify the 6 ads"} <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 1 && (
        <>
          <HowTo>Use the calculator: press <b>📥 Put these numbers</b>, read the result and type it. ⚠️ Check that the calculator has the numbers of THIS problem.</HowTo>
          <RateCalc preset={preset} boxRef={calcRef} />
          <RoundsRunner rounds={R19} doneLabel="Compare all offers" onDone={(r) => { setCalcScore(r.firstTry); setStage(2); }} />
        </>
      )}
      {stage === 2 && (
        <>
          <HowTo>Now compare the <b>EA</b> and the <b>TOTAL cost</b> — not only the payment. Then label each offer: ✅ clear · ⚠️ ask first · 🚩 red flag. Usury limit in this activity: <b>{USURY.ea}% EA</b> ({USURY.src})</HowTo>
          <div className="g83-offtable">
            <div className="h"><span>Offer</span><span>EA</span><span>Months</span><span>Payment</span><span>Extra costs</span><span>TOTAL paid</span><span>My label</span></div>
            {rows.map(({ o, cu, total, ea, extra }) => (
              <div key={o.id} className={`r ${flagChk ? (flag[o.id] === o.flag ? "ok" : "no") : ""}`}>
                <span>{o.e} {o.n}</span><b className={ea > USURY.ea ? "neg" : ""}>{ea.toFixed(2)}%{ea > USURY.ea ? " 🛑" : ""}</b><span>{o.months}</span><span>{cop(cu)}</span><span>{extra ? cop(extra) : "—"}</span><b>{cop(total)}</b>
                <Tri value={flag[o.id]} onPick={(k) => { setFlag({ ...flag, [o.id]: k }); setFlagChk(false); }} opts={[["ok", "✅"], ["ask", "⚠️"], ["red", "🚩"]]} />
                {flagChk && flag[o.id] !== o.flag && <small className="why">💡 {o.why}</small>}
              </div>
            ))}
          </div>
          <p className="start-tip">💡 The cheapest TOTAL isn't always the best: a variable rate can rise, and a tiny payment can mean 5 years of debt.</p>
          {!flagsOk ? <div className="start-foot"><button className="s1-btn primary big" disabled={OFFERS19.some((o) => !flag[o.id])} onClick={() => setFlagChk(true)}>Check my labels <Check size={16} /></button></div> : (
            <>
              <div className="p1-banner good"><span>✅ Well done! 🚩 Oferta Misteriosa is above the usury limit and hides information. Now you can advise Andrés (Guide page 02).</span></div>
              <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(20 + first * 2 + calcScore * 3, { typeFirst: first, calcFirst: calcScore, table: rows.map(({ o, cu, total, ea }) => ({ id: o.id, n: o.n, ea: +ea.toFixed(2), cu: Math.round(cu), total: Math.round(total) })) })}>Save my investigation <span className="coin-tag"><Coins size={15} /> +{20 + first * 2 + calcScore * 3}</span></button></div>
            </>
          )}
        </>
      )}
    </ActShell>
  );
}

/* ---------- GUIDE 02 · THE BEST OFFER FOR ANDRÉS ---------- */
const Q_ASK19 = [
  { t: "What is the EA rate, and is it fixed or variable?", ok: true }, { t: "What is the TOTAL amount I will pay?", ok: true },
  { t: "Which fees and insurance are mandatory?", ok: true }, { t: "What happens if I pay late?", ok: true },
  { t: "Can I pay extra with no penalty?", ok: true }, { t: "What color is the motorcycle?", ok: false, why: "It doesn't help you compare the loan." },
  { t: "Can I sign today without reading the contract?", ok: false, why: "Never sign without reading." },
];
function AndresOffer({ resp, existing, onSave, onExit }) {
  const [pick, setPick] = useState(existing?.pick || null);
  const [qs, setQs] = useState(existing?.qs || []);
  const [txt, setTxt] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const rows = OFFERS19.map((o) => ({ o, ...offRow(o) }));
  const P = rows.find((r) => r.o.id === pick);
  const badQ = qs.filter((i) => !Q_ASK19[i].ok);
  const G = [W_NUMBERS(2), W_REASON];
  const ready = pick && pick !== "misterio" && qs.length >= 3 && badQ.length === 0 && goalsOk(txt, 30, 100, G);
  if (st.done) return <Reward title="Guide page 02 ready! 🔎" subtitle="Andrés will compare before he signs." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<FileText size={22} strokeWidth={2.1} />} title="The Best Offer for Andrés 🔎" subtitle="Recommend ONE offer with numbers — and the questions he must ask." onExit={onExit}>
      <GBadge n="02" />
      <ClientCard id="andres" />
      <MiniTable head={["Offer", "EA", "Months", "Payment", "TOTAL"]} rows={rows.map(({ o, cu, total, ea }) => [`${o.e} ${o.n}`, `${ea.toFixed(2)}%${ea > USURY.ea ? " 🛑" : ""}`, `${o.months}`, cop(cu), cop(total)])} />
      <p className="start-tip">💼 Andrés earns {cop(FUTURE_ME.income)} a month. Game rule: his payment should be max 30% = {cop(FUTURE_ME.income * 0.3)}.</p>
      <div className="start-block">
        <h3><span className="step-n">1</span> My choice for Andrés</h3>
        <div className="g8-pick">{rows.map(({ o, total }) => <button key={o.id} type="button" className={pick === o.id ? "on" : ""} onClick={() => setPick(o.id)}><em>{o.e}</em><b>{o.n}</b><small>{cop(total)}</small>{pick === o.id && <i>✓</i>}</button>)}</div>
        {pick === "misterio" && <div className="p1-banner bad"><span>🚩 Never! It's above the usury limit and hides information. Choose another one.</span></div>}
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> 3+ questions Andrés must ask before signing</h3>
        <div className="g74-rules">{Q_ASK19.map((q, i) => <button key={q.t} type="button" className={qs.includes(i) ? (q.ok ? "on" : "bad") : ""} onClick={() => setQs(qs.includes(i) ? qs.filter((x) => x !== i) : [...qs, i])}>{q.t}</button>)}</div>
        {badQ.map((i) => <div key={i} className="p1-banner bad"><span>🚩 <b>{Q_ASK19[i].t}</b> — {Q_ASK19[i].why}</span></div>)}
      </div>
      <div className="start-block">
        <h3><PenLine size={18} /> My recommendation (min 30 words)</h3>
        <Starters items={["Andrés, I recommend", "because its EA is", "and the total cost is", "However, ask", "I don't recommend"]} onPick={appendStarter(setTxt)} />
        <WordField value={txt} onChange={setTxt} min={30} max={100} rows={4} goals={G} placeholder="Write your recommendation here…" />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { pick, pickName: P.o.n, ea: +P.ea.toFixed(2), total: Math.round(P.total), cuota: Math.round(P.cu), months: P.o.months, questions: qs.map((i) => Q_ASK19[i].t), text: txt })}>Save page 02 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 20 · MY FIRST DIGITAL CREDIT
   ===================================================================== */
const START_20 = {
  cards: [
    { e: "💵", t: "Principal", d: "The money you borrow. It's what you must pay back (before interest).", ex: "$6,000,000 for a motorcycle." },
    { e: "📅", t: "Installment (cuota)", d: "The fixed payment you make every month.", ex: "$313,600 a month." },
    { e: "⏳", t: "Term (plazo)", d: "How many months you will pay.", ex: "24 months." },
    { e: "💸", t: "Interest", d: "The price of borrowing: balance × monthly rate.", ex: "$1,000,000 × 2% = $20,000." },
    { e: "📊", t: "Amortization table", d: "A table that shows each payment split into interest and principal, and the new balance.", ex: "Month 1, 2, 3…" },
    { e: "➕", t: "Extra payment (abono)", d: "Money you pay above the installment. 100% goes to principal.", ex: "+$50,000 → you finish sooner." },
    { e: "🛡️", t: "Debtor insurance", d: "Insurance that pays the debt if something happens to the borrower. It adds a monthly cost.", ex: "$18,000 a month." },
    { e: "🧾", t: "Total cost", d: "All the payments + fees + insurance. Compare THIS.", ex: "Borrow $6M → pay $7.5M." },
  ],
  rounds: [
    { tag: "QUICK 1", q: "Balance $2,000,000 at 2% monthly. Interest this month?", answer: 40000, money: true, hint: "2,000,000 × 0.02", explain: "$40,000." },
    { tag: "QUICK 2", q: "Payment $150,000 and interest $40,000. How much goes to principal?", answer: 110000, money: true, hint: "Payment − interest", explain: "$110,000 lowers the balance." },
    { tag: "QUICK 3", q: "Over time, with the same payment, the interest part…", options: ["Gets smaller", "Gets bigger every month until the end of the loan", "Never changes", "Disappears in month 1"], correct: 0, explain: "You owe less, so you pay less interest." },
    { tag: "QUICK 4", q: "A longer term usually means…", options: ["Smaller payments but MORE total cost", "Bigger payments and less total interest for you", "No interest", "A lower rate"], correct: 0, explain: "More months = more interest." },
  ],
};
const RUSH_20 = {
  buckets: [{ id: "int", e: "💸", l: "Interest", d: "The bank's price.", c: "#ff6b57" }, { id: "cap", e: "🧱", l: "Principal", d: "Lowers your debt.", c: "#0b7a50" }],
  items: [
    { e: "✖️", t: "Balance × monthly rate", b: "int", why: "That's how interest is calculated." }, { e: "🏦", t: "The bank's price for lending you money", b: "int", why: "Interest = price of money." },
    { e: "🥇", t: "The BIGGEST part of month 1 in a long loan", b: "int", why: "At the start you owe the most." }, { e: "📉", t: "It gets smaller every month", b: "int", why: "The balance falls." },
    { e: "💰", t: "$20,000 of a $100,000 payment (you owe $1,000,000 at 2%)", b: "int", why: "1,000,000 × 2%." }, { e: "➕", t: "What you pay ABOVE what you borrowed", b: "int", why: "Total − principal = interest." },
    { e: "➖", t: "Payment − interest", b: "cap", why: "The rest lowers the balance." }, { e: "🧱", t: "The part that lowers your balance", b: "cap", why: "Principal." },
    { e: "🚀", t: "An extra payment of $50,000", b: "cap", why: "100% goes to principal." }, { e: "📈", t: "It gets bigger every month", b: "cap", why: "Less interest → more principal." },
    { e: "💵", t: "$80,000 of that $100,000 payment", b: "cap", why: "100,000 − 20,000." }, { e: "🛵", t: "The original $6,000,000 you borrowed", b: "cap", why: "Principal = the amount borrowed." },
  ],
};

/* ---------- CREAR CREDIT APP · crédito digital simulado ---------- */
const EXP20 = [["🏠", "Rent (shared)", 450000], ["🍲", "Food", 350000], ["🚌", "Transport", 200000], ["📱", "Phone & internet", 60000], ["🧴", "Other basics", 140000]];
const GOALS20 = [{ id: "moto", e: "🛵", n: "A motorcycle to go to work", price: 6000000 }, { id: "laptop", e: "💻", n: "A laptop for a course", price: 3500000 }, { id: "course", e: "🎓", n: "A technical course", price: 4000000 }];
const RATE20 = 1.8; // % mensual fijo (≈ 23.87% EA, por debajo del límite del juego)
const INS20 = 18000;
const CLAUSES20 = [
  { t: "Rate: 1.8% monthly (23.87% EA), FIXED for the whole loan.", a: "ok", why: "Clear: period, EA and fixed." },
  { t: "Debtor life insurance: $18,000 every month — NOT included in the payment shown.", a: "ask", why: "It raises your real payment. Ask for the total WITH insurance." },
  { t: "Late payment: interest for late payment (mora) + a $35,000 collection fee each time.", a: "ask", why: "Know the consequence and set reminders." },
  { t: "Extra payments: you can pay extra at any time with NO penalty.", a: "ok", why: "Good for you: extra payments go 100% to principal." },
  { t: "We may share your data with partner companies for marketing.", a: "ask", why: "Your data is yours. Ask if you can say no." },
  { t: "Payment date: the 5th of every month, by app or at a banking agent.", a: "ok", why: "Clear and simple." },
];
const amortRows = (P, r, n, cu) => { let b = P; const out = []; for (let m = 1; m <= n; m++) { const it = b * r; const cp = cu - it; b = Math.max(0, b - cp); out.push({ m, it, cp, b }); } return out; };
function CreditApp({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [left, setLeft] = useState(""); const [cap, setCap] = useState(""); const [chk0, setChk0] = useState(false);
  const [goal, setGoal] = useState(null);
  const [amt, setAmt] = useState(6000000);
  const [n, setN] = useState(24);
  const [cl, setCl] = useState({}); const [clChk, setClChk] = useState(false);
  const [br, setBr] = useState({}); const [brChk, setBrChk] = useState(false);
  const [st, finish] = useFinish(onSave);
  const ess = EXP20.reduce((a, x) => a + x[2], 0), income = FUTURE_ME.income;
  const LEFT = income - ess, CAP = Math.round(income * 0.3);
  const ok0 = Math.abs(num(left) - LEFT) <= 100 && Math.abs(num(cap) - CAP) <= 100 && goal;
  const G = GOALS20.find((g) => g.id === goal);
  const r = RATE20 / 100;
  const cu = pmt(amt, r, n), real = cu + INS20, total = real * n, interest = cu * n - amt;
  const fits = real <= Math.min(CAP, LEFT);
  const clOk = CLAUSES20.every((c, i) => cl[i] === c.a);
  const rows = amortRows(amt, r, n, cu);
  const brOk = [0, 1].every((k) => Math.abs(num(br[`i${k}`]) - rows[k].it) <= 1000 && Math.abs(num(br[`c${k}`]) - rows[k].cp) <= 1000 && Math.abs(num(br[`b${k}`]) - rows[k].b) <= 1500);
  const prevBal = (k) => (k === 0 ? amt : rows[k - 1].b);
  if (st.done) return <Reward title="Loan approved! 📲" subtitle={`${cop(amt)} · ${n} months · ${cop(real)} a month (with insurance). It's in your Money Life now.`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Smartphone size={22} strokeWidth={2.1} />} title="CREAR Credit App 📲" subtitle="Apply for a digital loan as “Future Me” (22 years old, first job). Fictional money only." onExit={onExit}>
      <Steps83 labels={["1 · My budget", "2 · Choose my loan", "3 · Contract trap", "4 · Where did my payment go?"]} at={stage} />
      <div className="g83-app">
        <div className="g83-app-main">
          {stage === 0 && (
            <>
              <Mission e="🙋" title={`Future Me earns ${cop(income)} a month.`}>Before asking for a loan, check what you can REALLY pay.</Mission>
              <MiniTable head={["Essential expense", "Per month"]} rows={[...EXP20.map(([e, t, v]) => [`${e} ${t}`, cop(v)]), ["TOTAL essentials", cop(ess)]]} />
              <div className="g8-row big"><span>💵 Money left each month (income − essentials)</span><MoneyInput value={left} onChange={(v) => { setLeft(v); setChk0(false); }} /></div>
              <div className="g8-row big"><span>📏 Max payment with the 30% rule (income × 0.30)</span><MoneyInput value={cap} onChange={(v) => { setCap(v); setChk0(false); }} /></div>
              {chk0 && (Math.abs(num(left) - LEFT) > 100 || Math.abs(num(cap) - CAP) > 100) && <div className="p1-hint">💡 {Math.abs(num(left) - LEFT) > 100 ? `${cop(income)} − ${cop(ess)} = ?` : `${cop(income)} × 0.30 = ?`}</div>}
              <p className="start-tip">⚠️ The 30% rule is a simplified class rule — not a guarantee that a loan is safe. You also need money for surprises.</p>
              <h4 className="g8-subh">🎯 What do I need the loan for?</h4>
              <div className="g8-pick">{GOALS20.map((g) => <button key={g.id} type="button" className={goal === g.id ? "on" : ""} onClick={() => { setGoal(g.id); setAmt(g.price); }}><em>{g.e}</em><b>{g.n}</b><small>{cop(g.price)}</small>{goal === g.id && <i>✓</i>}</button>)}</div>
              <div className="start-foot">{!(Math.abs(num(left) - LEFT) <= 100 && Math.abs(num(cap) - CAP) <= 100) ? <button className="s1-btn ghost" disabled={!left || !cap} onClick={() => setChk0(true)}><Check size={15} /> Check my numbers</button> : null}<button className="s1-btn primary big" disabled={!ok0} onClick={() => setStage(1)}>Choose my loan <ChevronRight size={18} /></button></div>
            </>
          )}
          {stage === 1 && (
            <>
              <HowTo>Move the amount and the term. The app uses a <b>fixed rate of {RATE20}% a month ({f2(offEA({ m: RATE20 }), 2)}% EA)</b>. Your REAL payment includes the insurance. It must fit your limit: <b>{cop(Math.min(CAP, LEFT))}</b>.</HowTo>
              <div className="g72-machine">{Ctl({ l: `💵 Amount (${G?.e} ${G?.n})`, v: amt, set: setAmt, mn: 500000, mx: G?.price || 6000000, stp: 250000, fmt: cop })}</div>
              <div className="start-block"><h3>⏳ Term</h3><Tri value={n} onPick={setN} opts={[6, 12, 24, 36, 48].map((x) => [x, `${x} months`])} /></div>
              <div className="g8-proj"><div><small>Payment + insurance</small><b className={fits ? "pos" : "neg"}>{cop(real)}</b></div><div><small>Total interest</small><b>{cop(interest)}</b></div><div><small>TOTAL you pay</small><b>{cop(total)}</b></div></div>
              <StackBar parts={[{ label: "Amount borrowed", value: amt, color: "#0b7a50" }, { label: "Interest", value: interest, color: "#ff6b57" }, { label: "Insurance", value: INS20 * n, color: "#f5b23e" }]} />
              <div className={`g8-left ${fits ? "ok" : "bad"}`}>{fits ? "✅ This payment fits your budget rule." : `❌ ${cop(real)} is above your limit (${cop(Math.min(CAP, LEFT))}). Borrow less or choose more months.`}</div>
              <p className="start-tip">🤔 Try 12 vs. 48 months: the payment goes down… and the total cost goes UP.</p>
              <div className="start-foot"><button className="s1-btn ghost" onClick={() => setStage(0)}><ArrowLeft size={15} /> Back</button><button className="s1-btn primary big" disabled={!fits} onClick={() => setStage(2)}>Read the contract <ChevronRight size={18} /></button></div>
            </>
          )}
          {stage === 2 && (
            <>
              <HowTo>Read each clause of your contract. Mark ✅ <b>OK</b> or ❓ <b>Ask before signing</b>.</HowTo>
              <div className="g83-clauses">{CLAUSES20.map((c, i) => (
                <div key={i} className={`g83-clause ${clChk ? (cl[i] === c.a ? "ok" : "no") : ""}`}><p>📜 {c.t}</p><Tri value={cl[i]} onPick={(k) => { setCl({ ...cl, [i]: k }); setClChk(false); }} opts={[["ok", "✅ OK"], ["ask", "❓ Ask first"]]} />{clChk && cl[i] !== c.a && <small>💡 {c.why}</small>}{clOk && <small className="good">✔ {c.why}</small>}</div>
              ))}</div>
              <div className="start-foot"><button className="s1-btn ghost" onClick={() => setStage(1)}><ArrowLeft size={15} /> Back</button>{!clOk ? <button className="s1-btn primary big" disabled={CLAUSES20.some((_, i) => !cl[i])} onClick={() => setClChk(true)}>Check my review <Check size={16} /></button> : <button className="s1-btn primary big" onClick={() => setStage(3)}>See where my payment goes <ChevronRight size={18} /></button>}</div>
            </>
          )}
          {stage === 3 && (
            <>
              <HowTo>Split YOUR payment ({cop(cu)}, without insurance) for months 1 and 2: <b>interest = balance × {RATE20}%</b> · <b>principal = payment − interest</b> · <b>new balance = balance − principal</b>.</HowTo>
              {[0, 1].map((k) => (
                <div key={k} className={`g83-brk ${brChk ? ([`i${k}`, `c${k}`, `b${k}`].every((f, j) => Math.abs(num(br[f]) - [rows[k].it, rows[k].cp, rows[k].b][j]) <= (j === 2 ? 1500 : 1000)) ? "ok" : "no") : ""}`}>
                  <header><b>Month {k + 1}</b><span>Balance at the start: {k === 0 ? cop(prevBal(0)) : (brOk || (brChk && Math.abs(num(br.b0) - rows[0].b) <= 1500) ? cop(prevBal(1)) : "your new balance from month 1")}</span></header>
                  <div><label>💸 Interest<MoneyInput value={br[`i${k}`] || ""} onChange={(v) => { setBr({ ...br, [`i${k}`]: v }); setBrChk(false); }} /></label><label>🧱 Principal<MoneyInput value={br[`c${k}`] || ""} onChange={(v) => { setBr({ ...br, [`c${k}`]: v }); setBrChk(false); }} /></label><label>📉 New balance<MoneyInput value={br[`b${k}`] || ""} onChange={(v) => { setBr({ ...br, [`b${k}`]: v }); setBrChk(false); }} /></label></div>
                </div>
              ))}
              {brChk && !brOk && <div className="p1-hint">💡 Month 1: {cop(amt)} × {RATE20 / 100} = interest. Then {cop(cu)} − interest = principal. Round to pesos.</div>}
              {!brOk ? <div className="start-foot"><button className="s1-btn primary big" onClick={() => setBrChk(true)}>Check my table <Check size={16} /></button></div> : (
                <>
                  <div className="p1-banner good"><span>✅ Perfect! Here is your full amortization table.</span></div>
                  <MiniTable head={["Month", "Payment", "💸 Interest", "🧱 Principal", "📉 Balance"]} rows={[...rows.slice(0, 6), ...(n > 6 ? [rows[n - 1]] : [])].map((x) => [x.m === n && n > 6 ? `… ${x.m}` : `${x.m}`, cop(cu), cop(x.it), cop(x.cp), cop(x.b)])} />
                  <LineChart series={[{ name: "Interest", values: rows.map((x) => Math.round(x.it)), color: "#ff6b57" }, { name: "Principal", values: rows.map((x) => Math.round(x.cp)), color: "#0b7a50" }]} labels={rows.map((x, i) => (i % Math.max(1, Math.round(n / 8)) === 0 || i === n - 1 ? `M${x.m}` : ""))} height={190} yMin={0} />
                  <ChartLegend series={[{ name: "💸 Interest (goes down)", color: "#ff6b57" }, { name: "🧱 Principal (goes up)", color: "#0b7a50" }]} />
                  <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(36, { item: G.n, e: G.e, amount: amt, months: n, rate: RATE20, ea: +offEA({ m: RATE20 }).toFixed(2), cuota: Math.round(real), base: Math.round(cu), insurance: INS20, total: Math.round(total), interest: Math.round(interest) })}>✍️ Sign & get my money <span className="coin-tag"><Coins size={15} /> +36</span></button></div>
                </>
              )}
            </>
          )}
        </div>
        <Phone83 title="CREAR Credit" sub="Digital loan · simulation" ok={stage >= 3 && brOk}>
          <div className="g83-ph-card"><small>Applicant</small><b>🙋 Future Me · 22</b><span>Income {cop(income)}</span></div>
          <div className="g83-ph-card"><small>Loan for</small><b>{G ? `${G.e} ${G.n}` : "—"}</b><span>{cop(amt)} · {n} months</span></div>
          <div className="g83-ph-card big"><small>Monthly payment (+ insurance)</small><b className={fits ? "pos" : "neg"}>{cop(real)}</b><span>Limit {cop(Math.min(CAP, LEFT))}</span></div>
          <div className="g83-ph-card"><small>Total to pay</small><b>{cop(total)}</b><span>{RATE20}% monthly · fixed</span></div>
          <div className="g83-ph-status">{stage < 3 ? "📝 Application in progress" : brOk ? "✅ READY TO SIGN" : "🧮 Check your table"}</div>
        </Phone83>
      </div>
    </ActShell>
  );
}

/* ---------- GUIDE 03 · MY CREDIT DECISION ---------- */
function CreditDecision({ resp, existing, onSave, onExit }) {
  const L = resp?.c20_app;
  const [dec, setDec] = useState(existing?.decision || null);
  const [txt, setTxt] = useState(existing?.text || "");
  const [tip, setTip] = useState(existing?.tip || "");
  const [st, finish] = useFinish(onSave);
  const G = [W_NUMBERS(2), W_REASON];
  const ready = L && dec && goalsOk(txt, 30, 100, G) && countWords(tip) >= 8 && realText(tip);
  if (st.done) return <Reward title="Guide page 03 ready! 📲" subtitle="A loan decision with numbers — not with feelings." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<CreditCard size={22} strokeWidth={2.1} />} title="My Credit Decision 📲" subtitle="Accept, change or reject your loan — and explain why." onExit={onExit}>
      <GBadge n="03" />
      {!L ? <div className="p1-hint">Use the <b>CREAR Credit App</b> first — this page uses your loan.</div> : (
        <div className="g8-diag">
          <div><small>Loan for</small><b>{L.e} {L.item}</b></div>
          <div><small>Amount · term</small><b>{cop(L.amount)} · {L.months} mo</b></div>
          <div><small>Payment + insurance</small><b>{cop(L.cuota)}</b></div>
          <div className="wide"><small>Total cost</small><b>{cop(L.total)} — interest {cop(L.interest)} + insurance {cop(L.insurance * L.months)}</b></div>
        </div>
      )}
      <div className="start-block">
        <h3><span className="step-n">1</span> My decision</h3>
        <div className="g82-choices">{[["accept", "✅ Accept it: it fits my budget and I know the total cost"], ["change", "🔧 Change it: borrow less or pay in fewer months"], ["reject", "❌ Reject it: I will save first"]].map(([k, t]) => <button key={k} type="button" className={dec === k ? "sel" : ""} onClick={() => setDec(k)}>{t}</button>)}</div>
      </div>
      <div className="start-block">
        <h3><PenLine size={18} /> Why? (min 30 words, use 2 numbers)</h3>
        <Starters items={["I decided to", "because my payment is", "and the total cost is", "If something unexpected happens,", "I will"]} onPick={appendStarter(setTxt)} />
        <WordField value={txt} onChange={setTxt} min={30} max={100} rows={4} goals={G} placeholder="Write your decision here…" />
      </div>
      <div className="p3-sentence edit"><span>💡 My tip for Andrés:</span><input className="start-input" value={tip} onChange={(e) => setTip(e.target.value)} placeholder="Write your tip here…" /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(28, { decision: dec, text: txt, tip, loan: L })}>Save page 03 <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 21 · CREDIT SCORE LIFE
   ===================================================================== */
const START_21 = {
  cards: [
    { e: "📚", t: "Credit history", d: "A record of how you borrow and repay.", ex: "Paid on time 12 months in a row." },
    { e: "🗄️", t: "Credit bureau", d: "An organization that collects credit information, like Datacrédito in Colombia.", ex: "Banks check it before lending." },
    { e: "⭐", t: "Credit score", d: "A number that summarizes your credit risk. In our game it's a CLASS index (150–950).", ex: "Higher = lenders trust you more." },
    { e: "⏰", t: "Late payment (mora)", d: "Paying after the due date. It can add charges and hurt your history.", ex: "5 days late + $35,000 fee." },
    { e: "📏", t: "Payment capacity", d: "How much you can pay after your essentials — with money left for surprises.", ex: "Max 30% of income (class rule)." },
    { e: "⛓️", t: "Over-indebtedness", d: "When your debts are bigger than what you can pay.", ex: "3 loans to pay 1 loan." },
    { e: "💧", t: "Gota a gota", d: "Illegal daily-payment lenders with huge interest and threats.", ex: "“Money now, no papers!” 🚩" },
    { e: "🛟", t: "Emergency reserve", d: "Savings for surprises, so you don't need new debt.", ex: "3 months of essentials." },
  ],
  rounds: [
    { tag: "QUICK 1", q: "Which action usually helps your credit history?", options: ["Paying on time", "Accepting every new credit card that a store offers", "Paying late", "Ignoring bills"], correct: 0, explain: "Payment habits matter most." },
    { tag: "QUICK 2", q: "Income $1,800,000. Max payment with the 30% rule?", answer: 540000, money: true, hint: "1,800,000 × 0.30", explain: "$540,000 (a class rule)." },
    { tag: "QUICK 3", q: "“Money now, no papers, pay every day” is probably…", options: ["Gota a gota — dangerous", "A safe loan from a bank that the government supervises", "A CDT", "A grant"], correct: 0, explain: "Easy money is not safe money." },
    { tag: "QUICK 4", q: "Datacrédito is…", options: ["A credit bureau", "A bank that lends money to students at 0% interest", "A phone app", "A tax"], correct: 0, explain: "It collects credit information." },
  ],
};
const RUSH_21 = {
  buckets: [{ id: "up", e: "⬆️", l: "Helps my history", d: "Good habits.", c: "#0b7a50" }, { id: "down", e: "⬇️", l: "Hurts my history", d: "Risky habits.", c: "#ff6b57" }],
  items: [
    { e: "✅", t: "Paying every installment on time", b: "up", why: "The most important habit." }, { e: "⏰", t: "Setting automatic payments", b: "up", why: "You never forget." },
    { e: "💳", t: "Using a card for planned buys and paying it in full", b: "up", why: "Responsible use." }, { e: "📉", t: "Keeping debts low compared with income", b: "up", why: "Less debt pressure." },
    { e: "➕", t: "Making an extra payment to the loan", b: "up", why: "Less debt, sooner." }, { e: "🛟", t: "Paying a surprise with savings, not new debt", b: "up", why: "No extra loans." },
    { e: "🐌", t: "Paying 30 days late", b: "down", why: "Late payments are reported." }, { e: "🛍️", t: "Using 3 credit cards up to the limit", b: "down", why: "Too much debt." },
    { e: "🔁", t: "Borrowing to pay another loan", b: "down", why: "A debt spiral." }, { e: "🙈", t: "Ignoring a small phone bill", b: "down", why: "Small debts count too." },
    { e: "💧", t: "Taking a gota a gota loan", b: "down", why: "Dangerous and illegal." }, { e: "📨", t: "Asking for many loans in one month", b: "down", why: "It looks risky." },
  ],
};
/* ---------- CREDIT SCORE LIFE · 12 meses con TU cuota ---------- */
const EV21 = [
  { e: "📅", t: "Your first loan installment is due.", o: [["✅ Pay on time", { sc: 15, hab: 10 }, "Great start: a good payment history begins today."], ["🐌 Pay 5 days late", { sc: -30, hab: -15, sav: -35000 }, "A late fee of $35,000 — and a note in your history."], ["🌓 Pay only half", { sc: -45, hab: -20, pr: 10 }, "Half a payment is a missed payment for the lender."]] },
  { e: "💳", t: "A store offers you a credit card: “No fee the first year!”", o: [["🙅 No, thanks — I don't need it now", {}, "A calm, smart decision."], ["🛍️ Accept and use it for everything", { sc: -10, pr: 25 }, "Your debt grows fast. Debt pressure goes up."], ["📝 Accept, only for planned buys, pay in full", { sc: 10, pr: 5 }, "Responsible use can build history."]] },
  { e: "🙈", t: "You forgot your phone bill ($60,000).", o: [["⏰ Pay now + set reminders", { sc: -5, hab: 10, sav: -60000 }, "Small damage, good fix."], ["🤷 Ignore it — it's small", { sc: -40, hab: -15 }, "Small debts are reported too!"], ["📆 Pay it next month", { sc: -20, sav: -60000 }, "Late is late."]] },
  { e: "📱", t: "Your phone breaks: repair $120,000. Your loan payment is due too.", o: [["🛟 Use emergency savings, pay the loan on time", { sav: -120000 }, "That's what the reserve is for. Now rebuild it."], ["⏳ Pay the repair, delay the loan", { sc: -45, hab: -15 }, "The loan payment can't wait."], ["⚡ Take a fast app loan at 5% a month", { sc: -10, pr: 25 }, "New debt to cover a surprise = more pressure."]] },
  { e: "🎁", t: "You receive an extra $300,000 (a bonus).", o: [["🐷 Rebuild my emergency savings", { sav: 300000 }, "Your safety net is stronger."], ["➕ Extra payment to my loan", { sc: 10, pr: -10 }, "100% goes to principal. You finish sooner."], ["🎉 Spend it all this weekend", {}, "Fun… but nothing changes in your plan."]] },
  { e: "🧑‍🤝‍🧑", t: "A friend asks to borrow $200,000 — your loan payment money.", o: [["💬 Say no kindly and explain", {}, "Protecting your payment is OK."], ["🤝 Lend it and pay my loan late", { sc: -40, hab: -15 }, "Your friend's problem became your late payment."], ["🐷 Lend only $50,000 from savings", { sav: -50000 }, "Only what you can afford to lose."]] },
  { e: "💧", t: "An ad: “Easy money! No papers! Pay a little every day!”", o: [["🚫 Ignore it and warn my family", { hab: 5 }, "Gota a gota is dangerous: huge rates and threats."], ["😬 Take it — it's fast", { pr: 40, sav: -150000 }, "Daily payments, very high interest… and threats when you can't pay."], ["📞 Call to ask for details", { pr: 5 }, "They push you to decide fast. That's a red flag."]] },
  { e: "📉", t: "Your income falls $400,000 this month.", o: [["✂️ Cut wants and pay on time", { sc: 10, hab: 10 }, "Hard month, good habit."], ["⏭️ Skip the loan payment", { sc: -50, hab: -20 }, "A missed payment hurts your history a lot."], ["🛟 Use savings for essentials, pay on time", { sav: -200000, sc: 5 }, "Smart use of your reserve."]] },
  { e: "👟", t: "Sneakers you don't need: $350,000.", o: [["⏳ Wait 24 hours — I don't buy", { hab: 5 }, "The wish passed. Money saved."], ["💳 Buy on credit (36 installments)", { sc: -10, pr: 20 }, "36 months paying sneakers…"], ["🐷 Buy with savings", { sav: -350000 }, "No debt, but a weaker reserve."]] },
  { e: "🧮", t: "Time to review your monthly budget.", o: [["📋 Make a budget + automatic payment", { sc: 10, hab: 15 }, "You'll never forget a payment."], ["😎 Skip it — everything is fine", {}, "OK… until the next surprise."], ["💰 Ask for a bigger loan to have more money", { sc: -15, pr: 20 }, "More debt is not more money."]] },
  { e: "📨", t: "SMS: “Your loan is blocked. Send your password and code to unlock it.”", o: [["🗑️ Delete it and report it to the bank", { hab: 5 }, "Real banks never ask for codes."], ["📲 Send the code quickly", { sav: -400000, sc: -20 }, "Fraud! They emptied part of your account."], ["❔ Reply asking who they are", { pr: 5 }, "Never answer. Report it."]] },
  { e: "🏁", t: "Year review: make a recovery plan.", o: [["✍️ Plan: rebuild savings, keep paying on time", { sc: 10, hab: 10 }, "A clear plan for next year."], ["🤷 Do nothing", {}, "Next year will look the same."], ["🎉 Celebrate with a new loan", { sc: -10, pr: 20 }, "Celebrations shouldn't create debt."]] },
];
function ScoreLife({ resp, onSave, onExit }) {
  const L = resp?.c20_app;
  const cuota = L?.cuota || 300000;
  const left = Math.max(0, FUTURE_ME.income - FUTURE_ME.ess - cuota);
  const [m, setM] = useState(0);
  const [S, setS] = useState({ sc: 650, hab: 60, pr: Math.round((cuota / FUTURE_ME.income) * 100), sav: 600000 });
  const [hist, setHist] = useState([650]);
  const [choices, setChoices] = useState([]);
  const [last, setLast] = useState(null);
  const [ord] = useState(() => EV21.map((e) => shuffleArr(e.o.map((_, k) => k))));
  const [st, finish] = useFinish(onSave);
  const done = m >= EV21.length;
  const E = EV21[m];
  const pickO = (k) => {
    const [, d, msg] = E.o[k];
    let sav = S.sav + Math.round(left * 0.5) + (d.sav || 0); let pr = S.pr + (d.pr || 0); let sc = S.sc + (d.sc || 0); let extra = "";
    if (sav < 0) { pr += 15; sc -= 15; sav = 0; extra = " Your savings were not enough: you had to borrow."; }
    const n = { sc: clamp(sc, 150, 950), hab: clamp(S.hab + (d.hab || 0), 0, 100), pr: clamp(pr, 0, 100), sav };
    setS(n); setHist([...hist, n.sc]); setChoices([...choices, k]); setLast({ msg: msg + extra, d, good: (d.sc || 0) >= 0 && (d.pr || 0) <= 5 });
  };
  const band = scoreBand(S.sc);
  if (st.done) return <Reward title={`Final score: ${S.sc} ⭐`} subtitle={`${band.t} · ${band.rate ? `you could get ${band.rate}% a month` : "most banks would say no"}`} coins={st.coins} saving={st.saving} onExit={onExit} gold={S.sc >= 700} />;
  return (
    <ActShell icon={<Gauge size={22} strokeWidth={2.1} />} title="Credit Score Life ⭐" subtitle="12 months with YOUR loan payment. Every decision changes your history." onExit={onExit}>
      <Mission e="🙋" title={`Future Me: income ${cop(FUTURE_ME.income)} · essentials ${cop(FUTURE_ME.ess)} · loan payment ${cop(cuota)}`}>{L ? `Your loan from the Credit App: ${L.e} ${L.item}.` : "You haven't used the Credit App yet — we use an example payment of $300,000."} Each month you save half of what's left ({cop(Math.round(left * 0.5))}).</Mission>
      <div className="g83-score">
        <div className="g83-gauge" style={{ "--p": `${((S.sc - 150) / 800) * 100}%`, "--c": band.c }}><b>{S.sc}</b><small>{band.t}</small></div>
        <div className="g83-score-meters">
          <Meter value={S.hab} color="#16b074" label="✅ Payment habits" />
          <Meter value={S.pr} color="#ff6b57" label="⛓️ Debt pressure" />
          <div className="g8-row"><span>🛟 Emergency savings</span><b>{cop(S.sav)}</b></div>
        </div>
      </div>
      <p className="start-tip">⚠️ This is a CLASS index (150–950). Real credit bureaus use other information and models.</p>
      {!done ? (
        <>
          <div className="g82-month"><b>Month {m + 1}/12</b><span className="ev">{E.e} {E.t}</span></div>
          {!last ? <div className="g82-choices">{ord[m].map((k) => <button key={E.o[k][0]} type="button" onClick={() => pickO(k)}>{E.o[k][0]}</button>)}</div> : (
            <>
              <div className={`g82-bias ${last.good ? "good" : "bad"}`}><small>CONSEQUENCE</small><b>{last.msg}</b><p>{[last.d.sc ? `⭐ ${last.d.sc > 0 ? "+" : ""}${last.d.sc}` : "", last.d.sav ? `🛟 ${last.d.sav > 0 ? "+" : "−"}${cop(Math.abs(last.d.sav))}` : "", last.d.pr ? `⛓️ pressure ${last.d.pr > 0 ? "+" : ""}${last.d.pr}` : ""].filter(Boolean).join(" · ") || "No change in your score."}</p></div>
              <div className="start-foot"><button className="s1-btn primary big" onClick={() => { setLast(null); setM(m + 1); }}>{m === 11 ? "See my year" : "Next month"} <ChevronRight size={18} /></button></div>
            </>
          )}
        </>
      ) : (
        <>
          <h4 className="g8-subh">📈 My class score, month by month</h4>
          <LineChart series={[{ name: "Score", values: hist, color: band.c }]} labels={hist.map((_, i) => (i === 0 ? "Start" : `M${i}`))} height={200} money={false} yMin={150} yMax={950} />
          <MiniTable head={["Score band", "Monthly rate you could get"]} rows={[["750+ · Excellent", "1.4%"], ["650–749 · Good", "1.8%"], ["550–649 · Fair", "2.3%"], ["Below 550 · Risky", "Most banks say no → danger of gota a gota"]]} />
          <div className={`p1-banner ${S.sc >= 650 ? "good" : "bad"}`}><span>Your score: <b>{S.sc}</b> ({band.t}). {band.rate ? `A bank could offer you about ${band.rate}% a month.` : "Most banks would reject you — and that's when dangerous lenders appear."}</span></div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(S.sc >= 650 ? 34 : 26, { score: S.sc, habits: S.hab, pressure: S.pr, savings: S.sav, history: hist, choices, cuota })}>Save my year <span className="coin-tag"><Coins size={15} /> +{S.sc >= 650 ? 34 : 26}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- GUIDE 04 · FIVE RULES FOR RESPONSIBLE BORROWING ---------- */
const RULES21 = [
  { t: "Check my budget before borrowing", ok: true }, { t: "Read the whole agreement before signing", ok: true },
  { t: "Set reminders or automatic payments", ok: true }, { t: "Keep an emergency reserve", ok: true },
  { t: "Compare the EA and the TOTAL cost", ok: true }, { t: "Never take gota a gota loans", ok: true },
  { t: "Accept every credit card offer", ok: false, why: "More cards = more temptation and debt." },
  { t: "Pay the minimum and forget the rest", ok: false, why: "The debt keeps growing with interest." },
  { t: "Borrow to pay another loan", ok: false, why: "That's a debt spiral." },
];
function BorrowRules({ existing, onSave, onExit }) {
  const [rules, setRules] = useState(existing?.ruleIds || []);
  const [adv, setAdv] = useState(existing?.advice || "");
  const [warn, setWarn] = useState(existing?.warning || "");
  const [st, finish] = useFinish(onSave);
  const bad = rules.filter((i) => !RULES21[i].ok);
  const GA = [W_REASON], GW = [W_RISK];
  const ready = rules.length === 5 && bad.length === 0 && goalsOk(adv, 20, 80, GA) && goalsOk(warn, 15, 60, GW);
  if (st.done) return <Reward title="Guide page 04 ready! ⭐" subtitle="Rules that protect your future self." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<ShieldCheck size={22} strokeWidth={2.1} />} title="Five Rules for Responsible Borrowing ⭐" subtitle="Your rules · advice for Andrés · a warning for Don Efraín." onExit={onExit}>
      <GBadge n="04" />
      <div className="start-block">
        <h3><span className="step-n">1</span> Choose my 5 rules ({rules.length}/5)</h3>
        <div className="g74-rules">{RULES21.map((r, i) => <button key={r.t} type="button" disabled={!rules.includes(i) && rules.length >= 5} className={rules.includes(i) ? (r.ok ? "on" : "bad") : ""} onClick={() => setRules(rules.includes(i) ? rules.filter((x) => x !== i) : [...rules, i])}>{r.t}</button>)}</div>
        {bad.map((i) => <div key={i} className="p1-banner bad"><span>🚩 <b>{RULES21[i].t}</b> — {RULES21[i].why}</span></div>)}
      </div>
      <div className="g8-two">
        <div className="start-block">
          <ClientCard id="andres" compact />
          <h3>🧑‍🔧 Advice for Andrés (min 20 words)</h3>
          <Starters items={["Andrés, before you borrow,", "because", "Always", "Never"]} onPick={appendStarter(setAdv)} />
          <WordField value={adv} onChange={setAdv} min={20} max={80} rows={3} goals={GA} placeholder="Write your advice here…" />
        </div>
        <div className="start-block">
          <ClientCard id="efrain" compact />
          <h3>👴 A warning for Don Efraín (min 15 words)</h3>
          <Starters items={["Don Efraín, be careful with", "It is dangerous because", "Never", "Instead,"]} onPick={appendStarter(setWarn)} />
          <WordField value={warn} onChange={setWarn} min={15} max={60} rows={3} goals={GW} placeholder="Write your warning here…" />
        </div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(28, { ruleIds: rules, rules: rules.map((i) => RULES21[i].t), advice: adv, warning: warn })}>Save page 04 <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 22 · INVEST & SURVIVE
   ===================================================================== */
const START_22 = {
  cards: [
    { e: "🌱", t: "Investing", d: "Using money today to try to have MORE money in the future — with risk.", ex: "Buying part of a fund for 5 years." },
    { e: "🎢", t: "Risk", d: "The chance that the value goes down — even a lot.", ex: "A stock can fall 40% in one month." },
    { e: "📈", t: "Return", d: "What you gain (or lose) on an investment, usually in %.", ex: "+8% in one year." },
    { e: "⏳", t: "Time horizon", d: "How long you can leave the money invested.", ex: "Valentina: 5 years." },
    { e: "🧺", t: "Diversification", d: "Not putting all your eggs in one basket: spread money across many investments.", ex: "CDT + fund + a little stock." },
    { e: "🏢", t: "Stock (share)", d: "A small piece of ONE company. Its price goes up and down with demand.", ex: "TechNova shares." },
    { e: "🌐", t: "Index fund", d: "A fund that owns MANY companies at once. More diversified than one stock.", ex: "500 companies in one fund." },
    { e: "🪙", t: "Crypto", d: "Digital assets with very high volatility in our game. They can multiply — or collapse.", ex: "+120% or −65% in 3 months." },
  ],
  rounds: [
    { tag: "QUICK 1", q: "All your money in ONE company is…", options: ["High risk", "Low risk, because you know the company very well", "No risk", "A CDT"], correct: 0, explain: "If that company falls, everything falls." },
    { tag: "QUICK 2", q: "$1,000,000 grows 10%. Now you have…", answer: 1100000, money: true, hint: "1,000,000 × 1.10", explain: "$1,100,000." },
    { tag: "QUICK 3", q: "$1,000,000 falls 50%, then grows 50%. Now you have…", answer: 750000, money: true, hint: "1,000,000 × 0.5 × 1.5", explain: "$750,000 — losses are hard to recover!" },
    { tag: "QUICK 4", q: "Diversification means…", options: ["Spreading your money", "Buying only the stock that went up the most last month", "Saving in cash", "Borrowing to invest"], correct: 0, explain: "Many baskets, less damage." },
  ],
};
const RUSH_22 = {
  buckets: [{ id: "low", e: "🟢", l: "Low risk", d: "Small moves.", c: "#0b7a50" }, { id: "mid", e: "🟡", l: "Medium risk", d: "Ups and downs.", c: "#f5b23e" }, { id: "high", e: "🔴", l: "High risk", d: "Big swings.", c: "#ff6b57" }],
  items: [
    { e: "📜", t: "A 1-year CDT in a supervised bank", b: "low", why: "Fixed rate, fixed time." }, { e: "🐷", t: "A savings account", b: "low", why: "Stable, low return." },
    { e: "📲", t: "A digital pocket for your goal", b: "low", why: "Liquid and stable." }, { e: "🏛️", t: "A fund of government bonds", b: "low", why: "Usually stable (not zero risk)." },
    { e: "🌐", t: "An index fund of 500 companies", b: "mid", why: "Diversified, but markets fall sometimes." }, { e: "🧺", t: "A fund with stocks AND bonds", b: "mid", why: "Mixed risk." },
    { e: "📊", t: "20 different stocks from different sectors", b: "mid", why: "Diversified stocks." }, { e: "🏘️", t: "A real estate fund", b: "mid", why: "Can go up and down." },
    { e: "🏢", t: "All your money in ONE company", b: "high", why: "No diversification." }, { e: "🪙", t: "A new crypto coin a friend recommends", b: "high", why: "Very volatile." },
    { e: "🚀", t: "Your cousin's brand-new startup", b: "high", why: "Most startups fail." }, { e: "💎", t: "“Guaranteed 10% a month” club", b: "high", why: "Probably a fraud!" },
  ],
};
/* ---------- MARKET STORM · 24 meses con eventos aleatorios ---------- */
const AS22 = [{ id: "cdt", e: "📜", n: "CDT", c: "#0b7a50" }, { id: "index", e: "🌐", n: "Index fund", c: "#16b074" }, { id: "stock", e: "🏢", n: "TechNova stock", c: "#f5b23e" }, { id: "crypto", e: "🪙", n: "MoonCoin crypto", c: "#ff6b57" }];
const EV22 = [
  { id: "boom", e: "🚀", t: "Tech Boom", d: "Technology companies are the stars of the quarter.", w: 2, ch: { cdt: 2.4, index: 8, stock: 25, crypto: 20 } },
  { id: "scandal", e: "📰", t: "TechNova Scandal", d: "TechNova's boss lied about the profits. Investors run away.", w: 1.5, ch: { cdt: 2.4, index: -3, stock: -45, crypto: 0 } },
  { id: "inflation", e: "🎈", t: "Inflation Shock", d: "Prices rise fast. Markets get nervous.", w: 2, ch: { cdt: 2.4, index: -6, stock: -8, crypto: -15 } },
  { id: "crash", e: "💥", t: "Crypto Crash", d: "A big crypto exchange closes. Panic!", w: 1.5, ch: { cdt: 2.4, index: -2, stock: -4, crypto: -65 } },
  { id: "quiet", e: "😴", t: "Quiet Quarter", d: "Nothing special happens.", w: 3, ch: { cdt: 2.4, index: 2, stock: 1, crypto: -3 } },
  { id: "recession", e: "🌧️", t: "Global Recession", d: "The world economy slows down. Almost everything falls.", w: 1, ch: { cdt: 2.4, index: -15, stock: -25, crypto: -35 } },
  { id: "rally", e: "🔄", t: "Recovery Rally", d: "Confidence comes back. Markets jump.", w: 2, ch: { cdt: 2.4, index: 12, stock: 18, crypto: 40 } },
  { id: "mania", e: "🌕", t: "Crypto Mania", d: "Everybody on social media talks about MoonCoin.", w: 1, ch: { cdt: 2.4, index: 1, stock: 2, crypto: 120 } },
  { id: "earnings", e: "📊", t: "Great Earnings", d: "TechNova sells a record number of products.", w: 2, ch: { cdt: 2.4, index: 5, stock: 30, crypto: 0 } },
];
const START22 = 2000000;
const draw22 = (n = 8) => { const tot = EV22.reduce((a, e) => a + e.w, 0); return Array.from({ length: n }, () => { let r = Math.random() * tot; return EV22.find((e) => (r -= e.w) <= 0) || EV22[4]; }).map((e) => e.id); };
const sim22 = (alloc, monthly, evIds) => {
  const v = Object.fromEntries(AS22.map((a) => [a.id, (START22 * (alloc[a.id] || 0)) / 100]));
  const tot = (o) => AS22.reduce((s, a) => s + o[a.id], 0);
  const hist = [tot(v)], snaps = [{ ...v }];
  evIds.forEach((id) => { const E = EV22.find((e) => e.id === id); AS22.forEach((a) => { v[a.id] = (v[a.id] + (monthly * 3 * (alloc[a.id] || 0)) / 100) * (1 + E.ch[a.id] / 100); }); hist.push(tot(v)); snaps.push({ ...v }); });
  return { hist, snaps, final: tot(v), parts: { ...v } };
};
const STRATS22 = [{ n: "📜 All CDT", a: { cdt: 100, index: 0, stock: 0, crypto: 0 } }, { n: "🧺 Diversified", a: { cdt: 40, index: 40, stock: 10, crypto: 10 } }, { n: "🪙 All crypto", a: { cdt: 0, index: 0, stock: 0, crypto: 100 } }];
function MarketStorm({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [alloc, setAlloc] = useState({ cdt: 40, index: 30, stock: 20, crypto: 10 });
  const [monthly, setMonthly] = useState(50000);
  const [evs] = useState(() => draw22(8));
  const [q, setQ] = useState(0);
  const [luck, setLuck] = useState(null);
  const lOrd = useOrder(3);
  const [st, finish] = useFinish(onSave);
  const sum = AS22.reduce((a, x) => a + (alloc[x.id] || 0), 0);
  const res = useMemo(() => sim22(alloc, monthly, evs), [alloc, monthly, evs]);
  const invested = START22 + monthly * 24;
  const cur = res.hist[q], gain = cur - (START22 + monthly * 3 * q);
  const E = q > 0 ? EV22.find((e) => e.id === evs[q - 1]) : null;
  const others = STRATS22.map((s) => ({ ...s, final: sim22(s.a, monthly, evs).final }));
  const setA = (id, v) => setAlloc({ ...alloc, [id]: v });
  if (st.done) return <Reward title={`Market Storm: ${cop(res.final)} 🌪️`} subtitle={`You invested ${cop(invested)} · ${res.final >= invested ? "+" : "−"}${cop(Math.abs(res.final - invested))}`} coins={st.coins} saving={st.saving} onExit={onExit} gold={res.final >= invested} />;
  return (
    <ActShell icon={<TrendingUp size={22} strokeWidth={2.1} />} title="Market Storm 🌪️" subtitle="Invest $2,000,000 (fictional) + a monthly contribution. Survive 24 months of random events." onExit={onExit}>
      <Steps83 labels={["1 · Build my portfolio", "2 · Survive 8 quarters", "3 · Luck or strategy?"]} at={stage} />
      {stage === 0 && (
        <>
          <HowTo>Split your money between 4 investments (the total must be <b>100%</b>). Every 3 months a <b>random event</b> hits the market — each student gets different events! Prices in this game are simplified.</HowTo>
          <div className="g83-alloc">
            {AS22.map((a) => <div key={a.id} style={{ "--lc": a.c }}>{Ctl({ l: `${a.e} ${a.n}`, v: alloc[a.id], set: (v) => setA(a.id, v), mn: 0, mx: 100, stp: 10, fmt: (x) => `${x}%` })}</div>)}
            <div className={`g83-alloc-sum ${sum === 100 ? "ok" : "no"}`}><b>{sum}%</b><span>{sum === 100 ? "All your money is invested ✅" : sum > 100 ? `Remove ${sum - 100}%` : `Add ${100 - sum}%`}</span></div>
          </div>
          <StackBar parts={AS22.map((a) => ({ label: a.n, value: alloc[a.id], color: a.c }))} />
          <div className="g72-machine">{Ctl({ l: "💵 Monthly contribution", v: monthly, set: setMonthly, mn: 0, mx: 200000, stp: 25000, fmt: cop })}</div>
          <p className="start-tip">💡 In this game: 📜 CDT ≈ +2.4% every quarter (10% EA) · 🌐 the fund moves a little · 🏢 one stock moves a lot · 🪙 crypto can explode — or collapse.</p>
          <div className="start-foot"><button className="s1-btn primary big" disabled={sum !== 100} onClick={() => setStage(1)}>🎲 Start the storm <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 1 && (
        <>
          <div className="g83-storm-top">
            <div><small>Quarter</small><b>{q}/8</b><span>{q * 3} months</span></div>
            <div><small>My portfolio</small><b className={gain >= 0 ? "pos" : "neg"}>{cop(cur)}</b><span>{gain >= 0 ? "+" : "−"}{cop(Math.abs(gain))} vs. invested</span></div>
            <div><small>Invested so far</small><b>{cop(START22 + monthly * 3 * q)}</b><span>{cop(monthly)}/month</span></div>
          </div>
          {E ? <div className={`g83-event ${Object.values(E.ch).reduce((a, x) => a + x, 0) >= 0 ? "up" : "down"}`} key={q}><em>{E.e}</em><div><b>{E.t}</b><p>{E.d}</p><span>{AS22.map((a) => `${a.e} ${E.ch[a.id] > 0 ? "+" : ""}${E.ch[a.id]}%`).join("  ")}</span></div></div> : <div className="g83-event"><em>🎲</em><div><b>Ready?</b><p>Press the button to live the first 3 months.</p></div></div>}
          <div className="g83-parts">{AS22.map((a) => <div key={a.id} style={{ "--lc": a.c }}><small>{a.e} {a.n} · {alloc[a.id]}%</small><b>{cop(res.snaps[q][a.id])}</b></div>)}</div>
          <LineChart series={[{ name: "My portfolio", values: res.hist.slice(0, q + 1), color: "#0b7a50" }, { name: "Money invested", values: res.hist.slice(0, q + 1).map((_, i) => START22 + monthly * 3 * i), color: "#f5b23e" }]} labels={res.hist.slice(0, q + 1).map((_, i) => (i === 0 ? "Start" : `Q${i}`))} height={200} yMin={0} />
          <ChartLegend series={[{ name: "My portfolio", color: "#0b7a50" }, { name: "Money I put in", color: "#f5b23e" }]} />
          <div className="start-foot">{q < 8 ? <button className="s1-btn primary big" onClick={() => setQ(q + 1)}>🎲 Next 3 months</button> : <button className="s1-btn primary big" onClick={() => setStage(2)}>See the results <ChevronRight size={18} /></button>}</div>
        </>
      )}
      {stage === 2 && (
        <>
          <div className={`g73-score`}><small>AFTER 24 MONTHS</small><b className={res.final >= invested ? "good" : "bad"}>{cop(res.final)}</b><span>You put in {cop(invested)} · {res.final >= invested ? "+" : "−"}{cop(Math.abs(res.final - invested))} ({(((res.final - invested) / invested) * 100).toFixed(1)}%)</span></div>
          <h4 className="g8-subh">🔁 The SAME events with other strategies</h4>
          <BarChart bars={[{ label: "⭐ Mine", value: res.final, color: "#0b7a50" }, ...others.map((o, k) => ({ label: o.n, value: o.final, color: ["#16b074", "#f5b23e", "#ff6b57"][k] }))]} height={200} />
          <MiniTable head={["Your 8 events", ""]} rows={evs.map((id, i) => { const e = EV22.find((x) => x.id === id); return [`Q${i + 1} · ${e.e} ${e.t}`, AS22.map((a) => `${a.e} ${e.ch[a.id] > 0 ? "+" : ""}${e.ch[a.id]}%`).join(" ")]; })} />
          <p className="start-tip">👥 Your classmates had DIFFERENT events. Some got rich with crypto, others lost almost everything. Compare in class!</p>
          <div className="start-block">
            <h3>🤔 Was your result luck or strategy?</h3>
            <div className="g82-choices">{lOrd.map((k) => { const t = ["🎲🧠 Both: luck decides the extremes, diversification reduces the damage", "🧠 Only strategy: a good result proves my strategy is always safe", "🎲 Only luck: decisions don't matter at all"][k]; return <button key={t} type="button" className={luck === k ? "sel" : ""} onClick={() => setLuck(k)}>{t}</button>; })}</div>
            {luck !== null && <div className={`p1-banner ${luck === 0 ? "good" : "bad"}`}><span>{luck === 0 ? "✅ Exactly. Look at the table: with the same events, “all crypto” and “all CDT” end very far apart. Diversification protects you from the worst." : "❌ Look at the bars again: the SAME events give very different results. Luck matters — and so does how you spread the risk."}</span></div>}
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={luck !== 0} onClick={() => finish(30 + (res.final >= invested ? 6 : 0), { alloc, monthly, events: evs, invested, final: Math.round(res.final), hist: res.hist.map(Math.round), compare: others.map((o) => ({ n: o.n, final: Math.round(o.final) })) })}>Save my investment <span className="coin-tag"><Coins size={15} /> +{30 + (res.final >= invested ? 6 : 0)}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- GUIDE 05 · VALENTINA'S FIVE-YEAR PLAN ---------- */
const VAL22 = { start: 3000000, monthly: 150000, years: 5 };
const RET22 = { cdt: { avg: 10, bad: 10 }, index: { avg: 9, bad: -25 }, stock: { avg: 12, bad: -50 }, crypto: { avg: 15, bad: -80 } };
const PROFILE_Q22 = [
  { q: "Valentina needs this money for university. Can she lose a big part of it?", o: ["No — she needs it", "Yes, no problem"], ok: 0 },
  { q: "When will she use the money?", o: ["In 5 years", "In 30 years"], ok: 0 },
  { q: "How does she feel when her savings go down?", o: ["Very nervous", "She doesn't care"], ok: 0 },
];
function ValentinaPlan({ existing, onSave, onExit }) {
  const [ans, setAns] = useState({});
  const [alloc, setAlloc] = useState(existing?.alloc || { cdt: 50, index: 40, stock: 10, crypto: 0 });
  const [txt, setTxt] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const profOk = PROFILE_Q22.every((p, i) => ans[i] === p.ok);
  const sum = AS22.reduce((a, x) => a + (alloc[x.id] || 0), 0);
  const proj = (bad) => { let v = 0; const mr = (k) => Math.pow(1 + RET22[k].avg / 100, 1 / 12) - 1; AS22.forEach((a) => { const w = (alloc[a.id] || 0) / 100; let x = VAL22.start * w; for (let m = 1; m <= 60; m++) { x = x * (1 + mr(a.id)) + VAL22.monthly * w; if (bad && m === 54) x *= 1 + Math.min(0, RET22[a.id].bad) / 100; } v += x; }); return v; };
  const exp = proj(false), worst = proj(true), put = VAL22.start + VAL22.monthly * 60;
  const warns = [alloc.crypto > 10 && "🪙 More than 10% in crypto is too risky for money she NEEDS.", alloc.stock > 10 && "🏢 More than 10% in ONE stock: not diversified enough.", alloc.cdt + alloc.index < 70 && "🧺 Keep at least 70% in CDT + index fund for a 5-year goal."].filter(Boolean);
  const G = [W_REASON, W_RISK, W_NUMBERS(1)];
  const ready = profOk && sum === 100 && warns.length === 0 && goalsOk(txt, 30, 100, G);
  if (st.done) return <Reward title="Guide page 05 ready! 📈" subtitle="A plan that fits the goal, the time and the person." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<TrendingUp size={22} strokeWidth={2.1} />} title="Valentina's Five-Year Plan 📈" subtitle="Know the client → choose the mix → see the good AND the bad scenario." onExit={onExit}>
      <GBadge n="05" />
      <ClientCard id="valentina" />
      <Mission e="🎓" title={`Valentina has ${cop(VAL22.start)} and saves ${cop(VAL22.monthly)} a month. University starts in 5 years.`}>Help her invest — without risking her dream.</Mission>
      <div className="start-block">
        <h3><span className="step-n">1</span> Her risk profile</h3>
        {PROFILE_Q22.map((p, i) => <div key={p.q} className="g83-prof"><b>{p.q}</b><Tri value={ans[i]} onPick={(k) => setAns({ ...ans, [i]: k })} opts={p.o.map((t, k) => [k, t])} />{ans[i] !== undefined && ans[i] !== p.ok && <small>💡 Read her situation again: it's money for a goal in 5 years.</small>}</div>)}
        {profOk && <div className="p1-banner good"><span>✅ Profile: <b>Conservative</b> — short horizon + money she needs = low risk.</span></div>}
      </div>
      {profOk && (
        <>
          <div className="start-block">
            <h3><span className="step-n">2</span> Her investment mix</h3>
            <div className="g83-alloc">
              {AS22.map((a) => <div key={a.id} style={{ "--lc": a.c }}>{Ctl({ l: `${a.e} ${a.n}`, v: alloc[a.id], set: (v) => setAlloc({ ...alloc, [a.id]: v }), mn: 0, mx: 100, stp: 10, fmt: (x) => `${x}%` })}</div>)}
              <div className={`g83-alloc-sum ${sum === 100 ? "ok" : "no"}`}><b>{sum}%</b><span>{sum === 100 ? "Total 100% ✅" : `Total must be 100%`}</span></div>
            </div>
            {warns.map((w) => <div key={w} className="p1-banner bad"><span>{w}</span></div>)}
          </div>
          <div className="g8-proj"><div><small>She puts in (5 years)</small><b>{cop(put)}</b></div><div><small>😊 Likely result</small><b className="pos">{cop(exp)}</b></div><div><small>😰 Bad scenario (crash in year 5)</small><b className={worst < put ? "neg" : ""}>{cop(worst)}</b></div></div>
          <p className="start-tip">💡 The bad scenario happens 6 months before university: is there enough time to recover? That's why short horizons need low risk.</p>
          <div className="start-block">
            <h3><PenLine size={18} /> My plan for Valentina (min 30 words)</h3>
            <Starters items={["Valentina, I recommend", "because you need the money in", "The risk is", "If the market falls,", "I don't recommend"]} onPick={appendStarter(setTxt)} />
            <WordField value={txt} onChange={setTxt} min={30} max={100} rows={4} goals={G} placeholder="Write your plan here…" />
          </div>
        </>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { profile: "Conservative", alloc, expected: Math.round(exp), worst: Math.round(worst), put, text: txt })}>Save page 05 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 23 · ROSA GOES BIG
   ===================================================================== */
const START_23 = {
  cards: [
    { e: "🧰", t: "Initial cost", d: "The money needed to START: equipment, first ingredients, permits.", ex: "$4,000,000 for the second stand." },
    { e: "🔄", t: "Cash flow", d: "Money entering and leaving the business — and WHEN it happens.", ex: "Sales in, costs out, every month." },
    { e: "🤝", t: "Microcredit", d: "A small loan for small businesses. Fast money, monthly payments.", ex: "$4,000,000 at 2.2% monthly." },
    { e: "🌱", t: "Grant (Fondo Emprender)", d: "Money to start a business that may not need to be repaid — if you are approved.", ex: "Takes months · not guaranteed." },
    { e: "👔", t: "Investor / partner", d: "Someone who gives money and gets a share of the profits or decisions.", ex: "30% of the profits." },
    { e: "🧀", t: "Supplier", d: "A person or company that sells you materials.", ex: "The cheese supplier." },
    { e: "🛟", t: "Reserve", d: "Money kept for bad months and surprises.", ex: "$1,000,000 in a pocket." },
    { e: "☂️", t: "Business insurance", d: "Pays for some losses, like theft or broken equipment. It doesn't cover everything.", ex: "$250,000 a year." },
  ],
  rounds: [
    { tag: "QUICK 1", q: "Sales $2,400,000 · costs $1,900,000. Profit?", answer: 500000, money: true, hint: "Sales − costs", explain: "$500,000." },
    { tag: "QUICK 2", q: "Profit $500,000 · loan payment $382,000. Cash left?", answer: 118000, money: true, hint: "Profit − payment", explain: "$118,000 — tight!" },
    { tag: "QUICK 3", q: "Which financing doesn't need to be repaid (if approved)?", options: ["A grant", "A microcredit with a low monthly interest rate", "A credit card", "Gota a gota"], correct: 0, explain: "But it's slow and not guaranteed." },
    { tag: "QUICK 4", q: "An investor usually wants…", options: ["A share of the profits", "Nothing, because investors help businesses for free", "Interest only", "Your house"], correct: 0, explain: "That's the price of their money." },
  ],
};
/* ---------- BUSINESS BANK DESK · 4 formas de financiar el 2.º puesto ---------- */
const COST23 = 4000000, SAV23 = 5000000, OPEX23 = 1900000;
const SALES23 = [{ e: "🌤️", v: 2400000 }, { e: "☀️", v: 2600000 }, { e: "🌧️", v: 1700000 }, { e: "🌤️", v: 2500000 }, { e: "📉", v: 1500000 }, { e: "🎉", v: 2700000 }];
const MICRO23 = Math.round(pmt(COST23, 0.022, 12));
const FIN23 = [
  { id: "save", e: "🐷", n: "Personal savings", d: "Use $4,000,000 of her $5,000,000. No payments, but only $1,000,000 left as reserve." },
  { id: "micro", e: "🤝", n: "Microcredit", d: `$4,000,000 at 2.2% monthly for 12 months: ${cop(MICRO23)} every month. She keeps her savings.` },
  { id: "grant", e: "🌱", n: "Grant (Fondo Emprender)", d: "No repayment — but the answer arrives in month 4, and approval is NOT guaranteed." },
  { id: "investor", e: "👔", n: "Investor", d: "An investor gives $4,000,000 and receives 30% of the second stand's profit every month — forever." },
];
const runFin23 = (id, approved) => {
  let cash = id === "save" ? SAV23 - COST23 : SAV23; let extra = 0; const rows = [];
  SALES23.forEach((s, i) => {
    const open = id !== "grant" || (approved && i >= 4);
    const sales = open ? s.v : 0, costs = open ? OPEX23 : 0, profit = sales - costs;
    let pay = 0;
    if (id === "micro") pay = MICRO23;
    if (id === "investor" && profit > 0) pay = Math.round(profit * 0.3);
    extra += pay; cash += profit - pay;
    rows.push({ m: i + 1, e: open ? s.e : "⏳", sales, costs, pay, cash, open });
  });
  const interest = id === "micro" ? MICRO23 * 12 - COST23 : 0;
  return { rows, cash, extra, interest };
};
function BankDesk({ onSave, onExit }) {
  const [approved] = useState(() => Math.random() < 0.6);
  const [tried, setTried] = useState({});
  const [view, setView] = useState(null);
  const [final, setFinal] = useState(null);
  const [st, finish] = useFinish(onSave);
  const R = view ? runFin23(view, approved) : null;
  const nTried = Object.keys(tried).length;
  if (st.done) return <Reward title="Financing decided! 🏦" subtitle="Rosa compared before choosing." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Building2 size={22} strokeWidth={2.1} />} title="Business Bank Desk 🏦" subtitle="How should Tía Rosa pay for her second stand? Test the options with 6 months of cash flow." onExit={onExit}>
      <ClientCard id="rosa" />
      <Mission e="🫓" title={`Second stand: ${cop(COST23)} · Rosa's savings: ${cop(SAV23)} · monthly costs: ${cop(OPEX23)}`}>Try at least 2 options. Watch the <b>cash left</b> every month — if it goes below $0, Rosa can't pay the worker!</Mission>
      <div className="g72-opts">{FIN23.map((f) => <button key={f.id} type="button" className={`g72-opt ${view === f.id ? "on" : ""}`} onClick={() => { setView(f.id); setTried({ ...tried, [f.id]: runFin23(f.id, approved).cash }); }}><em>{f.e}</em><span><b>{f.n}</b><br /><small>{f.d}</small></span></button>)}</div>
      {R && (
        <>
          {view === "grant" && <div className={`p1-banner ${approved ? "good" : "bad"}`}><span>{approved ? "🎉 Month 4: the grant was APPROVED! The stand opens in month 5." : "😕 Month 4: the grant was NOT approved this time. The second stand never opened in these 6 months."}</span></div>}
          <div className="g83-cf">
            <div className="h"><span>Month</span><span>💵 Sales</span><span>🧾 Costs</span><span>{view === "investor" ? "👔 Investor 30%" : "🏦 Loan payment"}</span><span>💰 Cash left</span></div>
            {R.rows.map((x) => <div key={x.m} className={`r ${x.cash < 0 ? "bad" : ""}`}><span>{x.e} M{x.m}</span><span>{x.open ? cop(x.sales) : "closed"}</span><span>{x.open ? `−${cop(x.costs)}` : "—"}</span><span>{x.pay ? `−${cop(x.pay)}` : "—"}</span><b className={x.cash < 1000000 ? "neg" : "pos"}>{cop(x.cash)}</b></div>)}
          </div>
          <div className="g8-proj"><div><small>Cash after 6 months</small><b>{cop(R.cash)}</b></div><div><small>{view === "micro" ? "Interest (12 months)" : view === "investor" ? "Paid to the investor" : "Extra cost"}</small><b className="neg">{view === "micro" ? cop(R.interest) : view === "investor" ? `${cop(R.extra)} …and more every month` : "$0"}</b></div><div><small>Lowest reserve</small><b>{cop(Math.min(...R.rows.map((x) => x.cash)))}</b></div></div>
        </>
      )}
      {nTried >= 2 && (
        <div className="start-block">
          <h3>🧭 Compare and decide</h3>
          <MiniTable head={["Option", "Cash after 6 months", "Watch out"]} rows={FIN23.filter((f) => tried[f.id] !== undefined).map((f) => [`${f.e} ${f.n}`, cop(tried[f.id]), { save: "Small reserve for surprises", micro: `Payments even in 🌧️ months · ${cop(MICRO23 * 12 - COST23)} interest`, grant: approved ? "Opens late (month 5)" : "Not approved — no stand yet", investor: "Shares 30% forever + decisions" }[f.id]])} />
          <div className="g8-pick">{FIN23.filter((f) => tried[f.id] !== undefined).map((f) => <button key={f.id} type="button" className={final === f.id ? "on" : ""} onClick={() => setFinal(f.id)}><em>{f.e}</em><b>{f.n}</b>{final === f.id && <i>✓</i>}</button>)}</div>
          <p className="start-tip">💡 There's no single correct answer. In Rosa's plan (page 06) you will explain your choice with numbers.</p>
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={nTried < 2 || !final} onClick={() => finish(30, { choice: final, choiceName: FIN23.find((f) => f.id === final).n, tried, approved, cash: tried[final] })}>{nTried < 2 ? `Try ${2 - nTried} more option(s)` : "Save my decision"} <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}
/* ---------- RISK SHIELD · protecciones vs. golpes aleatorios ---------- */
const SH23 = [
  { id: "reserve", e: "🛟", n: "Emergency reserve", price: 300000, d: "Absorbs ONE loss up to $500,000." },
  { id: "insurance", e: "☂️", n: "Business insurance", price: 250000, d: "Covers theft and broken equipment." },
  { id: "supplier", e: "🧀", n: "Second supplier", price: 100000, d: "If one supplier raises prices, buy from the other." },
  { id: "clients", e: "🤝", n: "More customers (catering deal)", price: 150000, d: "If a big customer leaves, others keep buying." },
  { id: "box", e: "🔐", n: "Secure cash box", price: 80000, d: "Cuts theft losses in half." },
];
const RK23 = [
  { id: "rain", e: "🌧️", t: "A rainy week: fewer customers", loss: 400000, by: [] },
  { id: "cheese", e: "🧀", t: "The cheese price jumps 50%", loss: 350000, by: ["supplier"] },
  { id: "grill", e: "🔧", t: "The grill breaks", loss: 700000, by: ["insurance"] },
  { id: "client", e: "💼", t: "An office that bought 40 arepas a day stops buying", loss: 500000, by: ["clients"] },
  { id: "theft", e: "🕵️", t: "Someone steals the day's cash", loss: 450000, by: ["insurance", "box"] },
];
const BUDGET23 = 600000;
function RiskShield({ onSave, onExit }) {
  const [sh, setSh] = useState([]);
  const [risks, setRisks] = useState(() => shuffleArr(RK23).slice(0, 4).map((r) => r.id));
  const [k, setK] = useState(-1);
  const [tries, setTries] = useState(0);
  const [best, setBest] = useState(null);
  const [st, finish] = useFinish(onSave);
  const spent = sh.reduce((a, id) => a + SH23.find((s) => s.id === id).price, 0);
  const play = useMemo(() => { let reserveUsed = false; return risks.map((id) => { const R = RK23.find((r) => r.id === id); let loss = R.loss; let how = ""; if (R.by.some((b) => b !== "box" && sh.includes(b))) { loss = 0; how = SH23.find((s) => s.id === R.by.find((b) => b !== "box" && sh.includes(b))).n; } else if (id === "theft" && sh.includes("box")) { loss = loss / 2; how = "Secure cash box (half)"; } if (loss > 0 && sh.includes("reserve") && !reserveUsed && loss <= 500000) { reserveUsed = true; how = how ? `${how} + reserve` : "Emergency reserve"; loss = 0; } return { ...R, after: loss, how }; }); }, [risks, sh]);
  const shown = play.slice(0, k + 1);
  const damage = play.reduce((a, x) => a + x.after, 0), raw = play.reduce((a, x) => a + x.loss, 0);
  const done = k >= play.length - 1;
  const again = () => { setBest(best === null ? damage : Math.min(best, damage)); setTries(tries + 1); setRisks(shuffleArr(RK23).slice(0, 4).map((r) => r.id)); setK(-1); };
  if (st.done) return <Reward title="Rosa's business is protected! ☂️" subtitle={`Damage avoided: ${cop(raw - damage)}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Umbrella size={22} strokeWidth={2.1} />} title="Risk Shield ☂️" subtitle="Buy protections for the second stand. Then 4 random shocks arrive." onExit={onExit}>
      <ClientCard id="rosa" />
      {k < 0 ? (
        <>
          <HowTo>Rosa has <b>{cop(BUDGET23)}</b> for protection. Choose your shields — you can't buy everything! Each shield protects against SOME problems, not all.</HowTo>
          <div className="g83-shields">{SH23.map((s) => { const on = sh.includes(s.id); const can = on || spent + s.price <= BUDGET23; return <button key={s.id} type="button" disabled={!can} className={on ? "on" : ""} onClick={() => setSh(on ? sh.filter((x) => x !== s.id) : [...sh, s.id])}><em>{s.e}</em><b>{s.n}</b><small>{s.d}</small><i>{cop(s.price)}</i></button>; })}</div>
          <div className="g8-proj"><div><small>Budget</small><b>{cop(BUDGET23)}</b></div><div><small>Spent</small><b>{cop(spent)}</b></div><div><small>Left</small><b className="pos">{cop(BUDGET23 - spent)}</b></div></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={sh.length < 2} onClick={() => setK(0)}>{sh.length < 2 ? "Choose at least 2 shields" : "⚡ Bring the shocks"}</button></div>
        </>
      ) : (
        <>
          <div className="g83-shocks">{shown.map((x) => <div key={x.id} className={x.after === 0 ? "ok" : x.after < x.loss ? "half" : "no"}><em>{x.e}</em><div><b>{x.t}</b><span>Loss: {cop(x.loss)} → <b>{cop(x.after)}</b></span><small>{x.how ? `🛡️ Protected by: ${x.how}` : "❌ None of your shields covered this."}</small></div></div>)}</div>
          {!done ? <div className="start-foot"><button className="s1-btn primary big" onClick={() => setK(k + 1)}>⚡ Next shock</button></div> : (
            <>
              <div className="g8-proj"><div><small>Total shocks</small><b className="neg">{cop(raw)}</b></div><div><small>Real damage</small><b className={damage > 0 ? "neg" : "pos"}>{cop(damage)}</b></div><div><small>Shields cost</small><b>{cop(spent)}</b></div></div>
              <div className="p1-hint">💡 No shield covers everything: a reserve helps with slow sales, insurance with theft and broken equipment, and a second supplier with price jumps.</div>
              <div className="start-foot"><button className="s1-btn ghost" onClick={again}><RefreshCw size={15} /> New shocks (try again)</button><button className="s1-btn primary big" onClick={() => finish(24 + (damage <= 500000 ? 6 : 0), { shields: sh, shieldNames: sh.map((id) => SH23.find((s) => s.id === id).n), risks, damage, raw, spent, tries: tries + 1 })}>Save my shields <span className="coin-tag"><Coins size={15} /> +{24 + (damage <= 500000 ? 6 : 0)}</span></button></div>
            </>
          )}
        </>
      )}
    </ActShell>
  );
}
/* ---------- GUIDE 06 · ROSA'S FINANCING & RISK PLAN ---------- */
function RosaPlan({ resp, existing, onSave, onExit }) {
  const d = resp?.c23_desk, s = resp?.c23_shield;
  const [txt, setTxt] = useState(existing?.text || "");
  const [test, setTest] = useState(existing?.test ?? null);
  const tOrd = useOrder(3);
  const [st, finish] = useFinish(onSave);
  const G = [W_NUMBERS(1), W_REASON, W_RISK];
  const ready = d && s && test === 0 && goalsOk(txt, 30, 100, G);
  if (st.done) return <Reward title="Guide page 06 ready! 🫓" subtitle="Growth with a plan for bad days." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Store size={22} strokeWidth={2.1} />} title="Rosa's Financing & Risk Plan 🫓" subtitle="Your financing choice + your shields + one smart step." onExit={onExit}>
      <GBadge n="06" />
      <ClientCard id="rosa" />
      {!d || !s ? <div className="p1-hint">Play <b>Business Bank Desk</b> and <b>Risk Shield</b> first — this page uses your results.</div> : (
        <div className="g8-diag">
          <div><small>Financing</small><b>{d.choiceName}</b></div>
          <div><small>Cash after 6 months</small><b>{cop(d.cash)}</b></div>
          <div><small>Shields</small><b>{s.shieldNames.join(" · ")}</b></div>
          <div className="wide"><small>Shocks vs. real damage</small><b>{cop(s.raw)} → {cop(s.damage)}</b></div>
        </div>
      )}
      <div className="start-block">
        <h3>🧪 Rosa's smartest first step</h3>
        <div className="g82-choices">{tOrd.map((k) => { const t = ["🧪 Test a small temporary stand first and record the sales", "🏃 Open the biggest stand possible today before someone else takes the place", "💧 Ask a gota a gota lender because it's faster than a bank"][k]; return <button key={t} type="button" className={test === k ? "sel" : ""} onClick={() => setTest(k)}>{t}</button>; })}</div>
        {test !== null && test !== 0 && <div className="p1-banner bad"><span>{test === 1 ? "Fast and big = more risk. Rosa tested first in the story." : "Never! Gota a gota is illegal and dangerous."}</span></div>}
      </div>
      <div className="start-block">
        <h3><PenLine size={18} /> My plan for Rosa (min 30 words)</h3>
        <Starters items={["Rosa, I recommend", "because after 6 months", "The biggest risk is", "To protect the business,", "In a slow month,"]} onPick={appendStarter(setTxt)} />
        <WordField value={txt} onChange={setTxt} min={30} max={100} rows={4} goals={G} placeholder="Write your plan here…" />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { choice: d.choiceName, cash: d.cash, shields: s.shieldNames, damage: s.damage, raw: s.raw, test, text: txt })}>Save page 06 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 24 · A BANK IN EVERY POCKET
   ===================================================================== */
const START_24 = {
  cards: [
    { e: "📱", t: "Mobile banking", d: "Using your bank from a phone app: transfers, payments, balances.", ex: "Pay a bill at 10 p.m. from your sofa." },
    { e: "⚡", t: "Instant payment + key (llave)", d: "Money arrives in seconds. You send it to a “key”: a phone number, ID or email linked to an account.", ex: "Key: 310 555 0123." },
    { e: "🔳", t: "QR payment", d: "You scan a code to pay a store from your app.", ex: "Pay the arepa stand with QR." },
    { e: "👛", t: "Digital wallet", d: "An app or phone account that stores money and makes payments.", ex: "Like M-Pesa in Kenya." },
    { e: "🏪", t: "Banking agent (corresponsal)", d: "A shop that offers basic bank services: deposits, withdrawals, payments.", ex: "The village store." },
    { e: "🚫", t: "Unbanked", d: "People with no account in a financial institution.", ex: "2 in 10 Kenyans had an account in 2006." },
    { e: "🌍", t: "Financial inclusion", d: "When everyone can use safe, useful and affordable financial services.", ex: "A wallet on a basic phone." },
    { e: "🎣", t: "Phishing", d: "Fake messages that try to steal your passwords or codes.", ex: "“URGENT! Your account will close!”" },
  ],
  rounds: [
    { tag: "QUICK 1", q: "Before you confirm a transfer, check…", options: ["Name, key and amount", "Only the color of the app and the time", "Nothing", "Your score"], correct: 0, explain: "Review before you send." },
    { tag: "QUICK 2", q: "A message asks for your verification code. You…", options: ["Never share it", "Send it quickly because the message says it's urgent", "Post it", "Share with friends"], correct: 0, explain: "Real banks never ask for codes." },
    { tag: "QUICK 3", q: "A banking agent is…", options: ["A shop with basic bank services", "A secret agent who protects all the banks in the country", "An ATM", "A loan"], correct: 0, explain: "Very important in rural areas." },
    { tag: "QUICK 4", q: "Someone with a basic phone (no internet) can use…", options: ["Mobile money by SMS", "Only a banking app that needs fast internet", "Nothing", "QR codes"], correct: 0, explain: "Like M-Pesa." },
  ],
};
/* ---------- MOBILE BANK TOUR · 4 misiones en el celular ---------- */
const CONTACTS24 = [{ id: "a", n: "Camila Rojas", k: "310 555 0123" }, { id: "b", n: "Camilo Rojas", k: "310 555 0132" }, { id: "c", n: "Camila Ríos", k: "311 555 0123" }];
const BILLS24 = [{ id: "e1", e: "💡", n: "Electricity · ref 4589-2231", v: 86400 }, { id: "e2", e: "💡", n: "Electricity · ref 4589-2213", v: 68400 }, { id: "i1", e: "🌐", n: "Internet · ref 7781-0090", v: 95000 }];
const MSG24 = [
  { t: "CREAR Bank: You sent $50,000 to Camila Rojas. If it wasn't you, call the number on the back of your card.", ok: true, why: "Information only. It asks you to call the OFFICIAL number." },
  { t: "URGENT!!! Your account will be CLOSED TODAY. Enter here now: crear-bank-secure.co/login", ok: false, why: "Urgency + a strange link = phishing." },
  { t: "Your verification code is 482913. Never share it with anyone — not even with the bank.", ok: true, why: "A real code message tells you NOT to share it." },
  { t: "Hi, I'm from CREAR Bank support 👋 Tell me the code we just sent you to unlock your account.", ok: false, why: "Real support never asks for your code." },
  { t: "Congratulations! You WON $2,000,000! Pay $50,000 to receive your prize.", ok: false, why: "You never pay to receive a prize." },
  { t: "Reminder: your electricity bill is due on the 15th. You can pay it in the app.", ok: true, why: "A normal reminder — no links, no codes." },
];
function MobileTour({ onSave, onExit }) {
  const [ms, setMs] = useState(0);
  const [done, setDone] = useState({});
  const [errs, setErrs] = useState(0);
  const [c, setC] = useState(null); const [amt, setAmt] = useState(""); const [rev, setRev] = useState(false); const [m1msg, setM1msg] = useState(null);
  const [bill, setBill] = useState(null); const [m2msg, setM2msg] = useState(null);
  const [lim, setLim] = useState(null); const [notif, setNotif] = useState(false); const [alert, setAlert] = useState(null);
  const [mk, setMk] = useState({}); const [mChk, setMChk] = useState(false);
  const [st, finish] = useFinish(onSave);
  const ok = (k) => setDone((d) => ({ ...d, [k]: true }));
  const send = () => { if (c === "a" && num(amt) === 50000) { ok(1); setM1msg("✅ Sent! $50,000 to Camila Rojas (310 555 0123)."); } else { setErrs(errs + 1); setM1msg(c !== "a" ? "⚠️ STOP! The name or key is not Camila Rojas · 310 555 0123. Money sent to the wrong key is very hard to recover." : "⚠️ Check the amount: the task says $50,000."); setRev(false); } };
  const pay = () => { if (bill === "e1") { ok(2); setM2msg("✅ Paid! Reference 4589-2231 · $86,400."); } else { setErrs(errs + 1); setM2msg("⚠️ That's not your bill! Compare the REFERENCE and the AMOUNT with your paper bill."); } };
  const m3ok = lim === 200000 && notif && alert === "block";
  const mOk = MSG24.every((m, i) => mk[i] === (m.ok ? "real" : "fake"));
  const all = [1, 2, 3, 4].every((k) => done[k]);
  const MISS = [["💸", "Send money"], ["🧾", "Pay a bill"], ["🔐", "Protect my account"], ["🎣", "Catch the phisher"]];
  if (st.done) return <Reward title="Mobile banking pro! 📱" subtitle="You sent, paid, protected — and caught the phishers." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Smartphone size={22} strokeWidth={2.1} />} title="Mobile Bank Tour 📱" subtitle="Four missions inside a practice phone. Fictional money and accounts only." onExit={onExit}>
      <div className="g83-missions">{MISS.map(([e, t], k) => <button key={t} type="button" className={`${ms === k ? "on" : ""} ${done[k + 1] ? "done" : ""}`} onClick={() => setMs(k)}><em>{done[k + 1] ? "✅" : e}</em>{t}</button>)}</div>
      <div className="g83-app">
        <div className="g83-app-main">
          {ms === 0 && (<><Mission e="💸" title="Send $50,000 to your classmate Camila Rojas for the school project.">Her key: <b>310 555 0123</b>. Be careful: there are similar names!</Mission>{done[1] ? <div className="p1-banner good"><span>{m1msg}</span></div> : m1msg && <div className="p1-banner bad"><span>{m1msg}</span></div>}</>)}
          {ms === 1 && (<><Mission e="🧾" title="Pay YOUR electricity bill.">Your paper bill says: reference <b>4589-2231</b> · <b>$86,400</b>.</Mission>{m2msg && <div className={`p1-banner ${done[2] ? "good" : "bad"}`}><span>{m2msg}</span></div>}</>)}
          {ms === 2 && (<><Mission e="🔐" title="Protect your account.">Choose a safe daily limit, turn ON notifications and react to the alert.</Mission>{done[3] && <div className="p1-banner good"><span>✅ Account protected: low limit, notifications ON, suspicious login blocked.</span></div>}</>)}
          {ms === 3 && (
            <>
              <HowTo>Six messages arrived. Mark each one: ✅ <b>Real</b> or 🎣 <b>Phishing</b>.</HowTo>
              <div className="g83-msgs">{MSG24.map((m, i) => <div key={i} className={`g83-msg ${mChk ? (mk[i] === (m.ok ? "real" : "fake") ? "ok" : "no") : ""}`}><p>💬 {m.t}</p><Tri value={mk[i]} onPick={(k) => { setMk({ ...mk, [i]: k }); setMChk(false); }} opts={[["real", "✅ Real"], ["fake", "🎣 Phishing"]]} />{(mChk || mOk) && <small>{mk[i] === (m.ok ? "real" : "fake") ? "✔ " : "💡 "}{m.why}</small>}</div>)}</div>
              {!done[4] && <div className="start-foot"><button className="s1-btn primary big" disabled={MSG24.some((_, i) => !mk[i])} onClick={() => { setMChk(true); if (mOk) ok(4); else setErrs(errs + 1); }}>Check the messages <Check size={16} /></button></div>}
              {done[4] && <div className="p1-banner good"><span>✅ Phishers caught! Signals: urgency, strange links, asking for codes, paying to get a prize.</span></div>}
            </>
          )}
          <p className="start-tip">💡 Missions done: {[1, 2, 3, 4].filter((k) => done[k]).length}/4 · Mistakes: {errs}</p>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!all} onClick={() => finish(Math.max(20, 34 - errs * 2), { missions: 4, errors: errs })}>{all ? "Finish the tour" : "Complete the 4 missions"} <span className="coin-tag"><Coins size={15} /> +{Math.max(20, 34 - errs * 2)}</span></button></div>
        </div>
        <Phone83 title="CREAR Bank" sub="Practice account · $500,000" ok={done[ms + 1]}>
          {ms === 0 && (!rev ? (
            <>
              <small className="g83-ph-lab">Send to (key)</small>
              {CONTACTS24.map((x) => <button key={x.id} type="button" className={`g83-ph-row ${c === x.id ? "on" : ""}`} disabled={done[1]} onClick={() => setC(x.id)}><b>{x.n}</b><span>🔑 {x.k}</span></button>)}
              <small className="g83-ph-lab">Amount</small>
              <MoneyInput value={amt} onChange={setAmt} />
              <button type="button" className="s1-btn primary" disabled={!c || !amt || done[1]} onClick={() => setRev(true)}>Continue</button>
            </>
          ) : (
            <>
              <div className="g83-ph-card big"><small>Review before sending</small><b>{cop(num(amt))}</b><span>To: {CONTACTS24.find((x) => x.id === c).n}</span><span>🔑 {CONTACTS24.find((x) => x.id === c).k}</span></div>
              <button type="button" className="s1-btn primary" onClick={send}>✅ Confirm and send</button>
              <button type="button" className="s1-btn ghost" onClick={() => setRev(false)}>← Edit</button>
            </>
          ))}
          {ms === 1 && (
            <>
              <small className="g83-ph-lab">My bills</small>
              {BILLS24.map((b) => <button key={b.id} type="button" className={`g83-ph-row ${bill === b.id ? "on" : ""}`} disabled={done[2]} onClick={() => setBill(b.id)}><b>{b.e} {b.n}</b><span>{cop(b.v)}</span></button>)}
              <button type="button" className="s1-btn primary" disabled={!bill || done[2]} onClick={pay}>Pay {bill ? cop(BILLS24.find((b) => b.id === bill).v) : ""}</button>
            </>
          )}
          {ms === 2 && (
            <>
              <small className="g83-ph-lab">Daily transfer limit</small>
              <Tri value={lim} onPick={setLim} opts={[[200000, "$200,000"], [5000000, "$5,000,000"]]} disabled={done[3]} />
              {lim === 5000000 && <small className="g83-ph-warn">⚠️ If someone steals your phone, they could send $5,000,000 in one day!</small>}
              <label className="g74-switch"><input type="checkbox" checked={notif} disabled={done[3]} onChange={(e) => setNotif(e.target.checked)} /><span /> 🔔 Notifications {notif ? "ON" : "OFF"}</label>
              <div className="g83-ph-alert"><b>🚨 New login from another city · 3:12 a.m.</b><small>Was it you?</small></div>
              <Tri value={alert} onPick={setAlert} opts={[["block", "🔒 No — block & report"], ["ignore", "🤷 Ignore it"]]} disabled={done[3]} />
              {alert === "ignore" && <small className="g83-ph-warn">⚠️ Never ignore a login you don't recognize.</small>}
              <button type="button" className="s1-btn primary" disabled={!m3ok || done[3]} onClick={() => ok(3)}>Save my settings</button>
            </>
          )}
          {ms === 3 && <div className="g83-ph-card"><small>Inbox</small><b>📨 6 new messages</b><span>Real or phishing? Check them on the left.</span></div>}
        </Phone83>
      </div>
    </ActShell>
  );
}
/* ---------- UNBANKED CHALLENGE · resolver el acceso ---------- */
const CR24 = [["access", "🚪 Access"], ["cost", "💲 Cost"], ["safety", "🛡️ Safety"], ["ease", "👌 Easy to use"]];
const PROF24 = [
  { id: "efrain", e: "👴", n: "Don Efraín · rural Colombia", d: "Lives 2 hours from a bank branch. Has a basic phone (no internet). Sells coffee and gets paid in cash. Doesn't trust apps.", opts: [
    { t: "🏪 A banking agent in the village shop", s: [5, 4, 4, 4], best: true, why: "Close, cheap and with a person who helps him." },
    { t: "📱 A banking app with a smartphone", s: [1, 4, 4, 1], why: "He has no smartphone and doesn't trust apps." },
    { t: "🏦 Open an account at the city branch", s: [1, 3, 5, 2], why: "Safe, but 2 hours away every time." },
    { t: "💵 Keep all the cash under the mattress", s: [5, 5, 1, 5], why: "Easy… until a thief or a fire takes everything." },
  ] },
  { id: "amina", e: "👩🏾", n: "Amina · Kenya", d: "Uses mobile money every day. She pays high fees for small transfers — and once told her PIN to a “helper”.", opts: [
    { t: "📲 Keep mobile money, compare fees and NEVER share her PIN", s: [5, 4, 5, 4], best: true, why: "Mobile money works for her — she just needs to use it safely." },
    { t: "💵 Stop using mobile money and carry cash", s: [3, 5, 1, 4], why: "Cash is easy to lose or steal." },
    { t: "🤝 Give her PIN to the helper so he can do everything", s: [5, 4, 0, 5], why: "Never share a PIN!" },
    { t: "🏦 Only use a branch 3 hours away", s: [1, 3, 5, 2], why: "Too far for daily payments." },
  ] },
  { id: "rahim", e: "👨🏽", n: "Rahim · Bangladesh", d: "Works in the city and sends small amounts to his mother in a village. Both have basic phones. No bank account.", opts: [
    { t: "📞 Mobile money by SMS to his mother's phone", s: [5, 4, 4, 5], best: true, why: "Instant, cheap and works on basic phones." },
    { t: "✉️ Cash in an envelope with a bus driver", s: [3, 4, 1, 4], why: "Slow and risky — like Kenya before M-Pesa." },
    { t: "📱 A banking app (his mother has a basic phone)", s: [2, 4, 4, 2], why: "His mother can't use it." },
    { t: "💧 Borrow from a gota a gota lender to send more", s: [4, 0, 0, 3], why: "Dangerous and illegal." },
  ] },
];
function Unbanked({ onSave, onExit }) {
  const [pi, setPi] = useState(0);
  const [ch, setCh] = useState({});
  const [first, setFirst] = useState({});
  const [ord] = useState(() => PROF24.map((p) => shuffleArr(p.opts.map((_, k) => k))));
  const [st, finish] = useFinish(onSave);
  const P = PROF24[pi];
  const sel = ch[P.id] !== undefined ? P.opts[ch[P.id]] : null;
  const allOk = PROF24.every((p) => ch[p.id] !== undefined && p.opts[ch[p.id]].best);
  const pick = (k) => { setCh({ ...ch, [P.id]: k }); if (first[P.id] === undefined) setFirst({ ...first, [P.id]: !!P.opts[k].best }); };
  const firstOk = Object.values(first).filter(Boolean).length;
  if (st.done) return <Reward title="Inclusion designer! 🌍" subtitle="The best solution fits the PERSON — not only the technology." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title="Unbanked Challenge 🌍" subtitle="Three people, three access problems. Find a solution that is useful, safe and realistic." onExit={onExit}>
      <HowTo>Read the case. Choose a solution and look at the 4 criteria: <b>access, cost, safety, ease of use</b>. The best solution is good in ALL of them for THAT person.</HowTo>
      <div className="g83-missions">{PROF24.map((p, k) => <button key={p.id} type="button" className={`${pi === k ? "on" : ""} ${ch[p.id] !== undefined && p.opts[ch[p.id]].best ? "done" : ""}`} onClick={() => setPi(k)}><em>{ch[p.id] !== undefined && p.opts[ch[p.id]].best ? "✅" : p.e}</em>{p.n.split(" · ")[0]}</button>)}</div>
      <div className="g83-case"><em>{P.e}</em><div><b>{P.n}</b><p>{P.d}</p></div></div>
      <div className="g82-choices">{ord[pi].map((k) => <button key={P.opts[k].t} type="button" className={ch[P.id] === k ? "sel" : ""} onClick={() => pick(k)}>{P.opts[k].t}</button>)}</div>
      {sel && (
        <>
          <div className="g83-crit">{CR24.map(([k, l], i) => <div key={k}><span>{l}</span><i><s style={{ width: `${sel.s[i] * 20}%`, background: sel.s[i] >= 4 ? "#16b074" : sel.s[i] >= 2 ? "#f5b23e" : "#ff6b57" }} /></i><b>{sel.s[i]}/5</b></div>)}</div>
          <div className={`p1-banner ${sel.best ? "good" : "bad"}`}><span>{sel.best ? "✅ " : "💡 "}{sel.why}{!sel.best && " Try another option."}</span></div>
          {sel.best && pi < PROF24.length - 1 && <div className="start-foot"><button className="s1-btn primary" onClick={() => setPi(pi + 1)}>Next case <ChevronRight size={16} /></button></div>}
        </>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!allOk} onClick={() => finish(22 + firstOk * 4, { choices: Object.fromEntries(PROF24.map((p) => [p.id, p.opts[ch[p.id]].t])), firstTry: firstOk })}>{allOk ? "Save my solutions" : "Solve the 3 cases"} <span className="coin-tag"><Coins size={15} /> +{22 + firstOk * 4}</span></button></div>
    </ActShell>
  );
}
/* ---------- GUIDE 07 · ACCESS FOR DON EFRAÍN ---------- */
const CH24 = [{ t: "🏪 A banking agent in the village shop", ok: true }, { t: "📞 Mobile money by SMS (basic phone)", ok: true }, { t: "🤝 A savings group with clear rules and records", ok: true }, { t: "👨‍👩‍👦 In-person help from his family the first times", ok: true }, { t: "📱 A banking app with a smartphone", ok: false, why: "He has a basic phone and doesn't trust apps." }, { t: "💧 A gota a gota lender for emergencies", ok: false, why: "Dangerous and illegal." }];
const SR24 = [{ t: "Never share his PIN or codes", ok: true }, { t: "Check the name and the amount before confirming", ok: true }, { t: "Ask the agent for a receipt every time", ok: true }, { t: "Don't lend his card or phone", ok: true }, { t: "Answer messages that ask for his code", ok: false, why: "Never! That's phishing." }];
function EfrainPlan({ existing, onSave, onExit }) {
  const [chs, setChs] = useState(existing?.chIds || []);
  const [rules, setRules] = useState(existing?.ruleIds || []);
  const [txt, setTxt] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const badC = chs.filter((i) => !CH24[i].ok), badR = rules.filter((i) => !SR24[i].ok);
  const G = [W_REASON, W_RISK];
  const ready = chs.length >= 2 && badC.length === 0 && rules.length >= 3 && badR.length === 0 && goalsOk(txt, 30, 100, G);
  if (st.done) return <Reward title="Guide page 07 ready! 📱" subtitle="Financial access that fits Don Efraín's real life." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Handshake size={22} strokeWidth={2.1} />} title="A Financial Access Solution for Don Efraín 📱" subtitle="Useful · safe · realistic — without assuming he has a smartphone." onExit={onExit}>
      <GBadge n="07" />
      <ClientCard id="efrain" />
      <div className="start-block"><h3><span className="step-n">1</span> Channels for him (2+)</h3><div className="g74-rules">{CH24.map((c, i) => <button key={c.t} type="button" className={chs.includes(i) ? (c.ok ? "on" : "bad") : ""} onClick={() => setChs(chs.includes(i) ? chs.filter((x) => x !== i) : [...chs, i])}>{c.t}</button>)}</div>{badC.map((i) => <div key={i} className="p1-banner bad"><span>🚩 {CH24[i].why}</span></div>)}</div>
      <div className="start-block"><h3><span className="step-n">2</span> His safety rules (3+)</h3><div className="g74-rules">{SR24.map((c, i) => <button key={c.t} type="button" className={rules.includes(i) ? (c.ok ? "on" : "bad") : ""} onClick={() => setRules(rules.includes(i) ? rules.filter((x) => x !== i) : [...rules, i])}>{c.t}</button>)}</div>{badR.map((i) => <div key={i} className="p1-banner bad"><span>🚩 {SR24[i].why}</span></div>)}</div>
      <div className="start-block">
        <h3><PenLine size={18} /> My solution (min 30 words)</h3>
        <Starters items={["Don Efraín, I recommend", "because he lives", "It is safe because", "He must be careful with", "It is realistic because"]} onPick={appendStarter(setTxt)} />
        <WordField value={txt} onChange={setTxt} min={30} max={100} rows={4} goals={G} placeholder="Write your solution here…" />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { chIds: chs, channels: chs.map((i) => CH24[i].t), ruleIds: rules, rules: rules.map((i) => SR24[i].t), text: txt })}>Save page 07 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 25 · FINANCIAL SERVICES FAIR + BOSS
   ===================================================================== */
/* ---------- ONE YEAR LATER · 3 eventos aleatorios sobre MI Money Life ---------- */
const LATER_CREDIT = [
  { e: "📉", t: "You lose your job for one month. Your loan payment is due.", o: [["🛟 Pay with my emergency savings", { sav: -1 }, "Your reserve did its job. Rebuild it next month."], ["⏭️ Skip the payment", { sc: -50 }, "A missed payment hurts your history."], ["📞 Call the bank and ask for a payment agreement", { sc: -5 }, "Talking early protects you. Banks often have options."]] },
  { e: "💳", t: "The bank offers to TRIPLE your credit card limit.", o: [["🙅 No, thanks — my limit is enough", {}, "Less temptation, less risk."], ["🛍️ Yes! And I use it all for a new phone", { sc: -15, sav: -200000 }, "A big new debt with high interest."], ["📝 Accept, but keep using it only for planned buys", { sc: 5 }, "Responsible — if you keep the habit."]] },
  { e: "💰", t: "You get a raise: +$200,000 a month.", o: [["➕ Extra payments to my loan", { sc: 15, debt: -1 }, "You finish the loan sooner and pay less interest."], ["🐷 Half to savings, half to extra payments", { sc: 10, sav: 600000 }, "Balanced and smart."], ["🎉 Spend it all", {}, "Nothing changes in your plan."]] },
];
const LATER_INV = [
  { e: "💥", t: "Market crash: your investments fall 30%.", o: [["😱 Sell everything now", { inv: -0.3 }, "You turned a temporary fall into a real loss."], ["🧘 Stay calm and keep investing", { inv: -0.12 }, "The market recovered part of the fall. Patience helped."], ["🧺 Move the crypto part to the index fund", { inv: -0.15 }, "Less risk for the next storm."]] },
  { e: "🚀", t: "Bull market: your investments rise 40%!", o: [["🔒 Take some profits to a CDT", { inv: 0.3 }, "You protected part of your gain."], ["🎲 Put ALL my savings in crypto now", { inv: "gamble" }, "All-in after a big rise is very risky…"], ["🧭 Keep the plan", { inv: 0.4 }, "Calm and consistent."]] },
  { e: "😴", t: "A calm year: investments grow 6%.", o: [["🧭 Keep my monthly contributions", { inv: 0.08 }, "Small steps, every month."], ["😴 Stop contributing — it's boring", { inv: 0.06 }, "Boring is OK in investing."], ["🎰 Look for a “guaranteed 10% a month” club", { inv: -0.5 }, "It was a fraud. You lost half."]] },
];
const LATER_LIFE = [
  { e: "🦷", t: "Dentist emergency: $500,000.", o: [["🛟 Pay with my emergency savings", { sav: -500000 }, "That's what the reserve is for."], ["💳 Pay with a credit card in 24 installments", { sc: -10 }, "Two years paying a dentist visit…"], ["💧 Ask a gota a gota lender", { sc: -30, sav: -400000 }, "Threats and huge daily payments. Never!"]] },
  { e: "🧑‍🤝‍🧑", t: "A friend asks you to co-sign (be guarantor of) his loan.", o: [["🙅 Say no kindly", {}, "If he doesn't pay, YOU pay. Saying no is OK."], ["✍️ Sign without reading", { sc: -25, sav: -300000 }, "He stopped paying… and the bank called you."], ["🧮 Check his budget first, then decide", { sc: 0 }, "Smart: information before a promise."]] },
  { e: "🎁", t: "Your family needs help: $300,000.", o: [["🐷 Help from my savings", { sav: -300000 }, "Savings can protect the people you love."], ["💳 Take a new loan to help", { sc: -10 }, "A new debt to solve a problem."], ["🤝 Help with part and make a plan together", { sav: -150000 }, "Balanced and caring."]] },
];
function OneYearLater({ resp, onSave, onExit }) {
  const base = moneyLife(resp || {});
  const L = base.loan;
  const [evs] = useState(() => [LATER_CREDIT, LATER_INV, LATER_LIFE].map((pool) => Math.floor(Math.random() * pool.length)));
  const [i, setI] = useState(0);
  const [S, setS] = useState(() => ({ sav: base.savings > 0 ? Math.min(base.savings, 1500000) : 800000, inv: base.inv ? base.inv.final : 2000000, debt: L ? Math.max(0, Math.round(L.amount * (1 - Math.min(1, 12 / L.months)))) : 0, sc: base.score }));
  const [log, setLog] = useState([]);
  const [last, setLast] = useState(null);
  const [ord] = useState(() => [0, 1, 2].map(() => shuffleArr([0, 1, 2])));
  const [st, finish] = useFinish(onSave);
  const POOLS = [LATER_CREDIT, LATER_INV, LATER_LIFE];
  const E = i < 3 ? POOLS[i][evs[i]] : null;
  const pickO = (k) => {
    const [t, d, msg] = E.o[k]; const n = { ...S }; let extra = "";
    if (d.sav === -1) n.sav -= L ? L.cuota : 300000; else if (d.sav) n.sav += d.sav;
    if (d.debt === -1) n.debt = Math.max(0, n.debt - 2400000);
    if (d.sc) n.sc = clamp(n.sc + d.sc, 150, 950);
    if (d.inv === "gamble") { const win = Math.random() < 0.45; n.inv = Math.round(n.inv * (win ? 1.9 : 0.35)); extra = win ? " 🍀 Lucky this time: +90%." : " 💥 Crypto crashed: −65%."; } else if (d.inv) n.inv = Math.round(n.inv * (1 + d.inv));
    if (n.sav < 0) { n.debt += -n.sav; n.sav = 0; extra += " Your savings were not enough: the rest became debt."; }
    setS(n); setLog([...log, { e: E.e, t: E.t, choice: t, msg: msg + extra }]); setLast(msg + extra);
  };
  const net = S.sav + S.inv - S.debt;
  if (st.done) return <Reward title="One year later… 📆" subtitle={`Net position: ${cop(net)}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Calendar size={22} strokeWidth={2.1} />} title="One Year Later 📆" subtitle="Your Money Life continues. Three random events — your decisions write the ending." onExit={onExit}>
      <div className="g83-storm-top">
        <div><small>🐷 Savings</small><b>{cop(S.sav)}</b></div>
        <div><small>📈 Investments</small><b>{cop(S.inv)}</b></div>
        <div><small>💳 Debt left</small><b className={S.debt ? "neg" : ""}>{cop(S.debt)}</b></div>
        <div><small>⭐ Score</small><b>{S.sc}</b></div>
      </div>
      {E ? (
        <>
          <div className="g82-month"><b>Event {i + 1}/3 · {["💳 Credit", "📈 Investment", "🧍 Life"][i]}</b><span className="ev">{E.e} {E.t}</span></div>
          {!last ? <div className="g82-choices">{ord[i].map((k) => <button key={E.o[k][0]} type="button" onClick={() => pickO(k)}>{E.o[k][0]}</button>)}</div> : (
            <>
              <div className="g82-bias good"><small>CONSEQUENCE</small><b>{last}</b></div>
              <div className="start-foot"><button className="s1-btn primary big" onClick={() => { setLast(null); setI(i + 1); }}>{i === 2 ? "See my year" : "Next event"} <ChevronRight size={18} /></button></div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="g73-score"><small>MY NET POSITION (savings + investments − debt)</small><b className={net >= 0 ? "good" : "bad"}>{cop(net)}</b><span>Score {S.sc} · {scoreBand(S.sc).t}</span></div>
          <MiniTable head={["Event", "My decision", "What happened"]} rows={log.map((x) => [`${x.e} ${x.t}`, x.choice, x.msg])} />
          <p className="start-tip">👥 Everybody had different events. Not winning the most money is OK — what matters is explaining your decisions, the risks and how you recovered.</p>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(30, { events: log, savings: S.sav, invest: S.inv, debt: S.debt, score: S.sc, net })}>Save my year <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- FINANCIAL SERVICES GUIDE · presentación final ---------- */
const dot3 = (t) => { const x = String(t || "").trim(); return !x ? "" : /[.!?]$/.test(x) ? x : `${x}.`; };
const ALLOC_T = (a) => AS22.filter((x) => a?.[x.id]).map((x) => `${a[x.id]}% ${x.n}`).join(", ");
function buildGuide(r, name, lesson) {
  const m = moneyLife(r);
  const ty = r.c18_tycoon, p1 = r.c18_page, p2 = r.c19_page, p3 = r.c20_page, p4 = r.c21_page, p5 = r.c22_page, p6 = r.c23_page, p7 = r.c24_page;
  const life = [];
  if (m.loan) life.push(`I borrowed ${cop(m.loan.amount)} for ${m.loan.item.charAt(0).toLowerCase() + m.loan.item.slice(1)}, for ${m.loan.months} months at ${m.loan.rate}% a month. My payment was ${cop(m.loan.cuota)} and the total cost was ${cop(m.loan.total)}.`);
  if (p3) life.push(`My decision: ${({ accept: "I accepted it because it fit my budget", change: "I changed it to pay less in total", reject: "I rejected it and decided to save first" })[p3.decision]}.`);
  if (m.life) life.push(`After 12 months, my class credit score was ${m.life.score} (${scoreBand(m.life.score).t}).`);
  if (m.inv) life.push(`I invested ${cop(m.inv.invested)} (${ALLOC_T(m.inv.alloc)}). After 24 months of random events, I had ${cop(m.inv.final)}. With the same events, “all crypto” ended with ${cop(m.inv.compare?.[2]?.final || 0)} and “all CDT” with ${cop(m.inv.compare?.[0]?.final || 0)}.`);
  if (m.later) life.push(`One year later, my net position was ${cop(m.later.net)}.`);
  const clients = {
    valentina: [p1 && `For her account, I recommend ${p1.pickName}: it costs ${cop(p1.annual)} a year with her real use.`, p5 && `For university in 5 years, I recommend a conservative mix: ${ALLOC_T(p5.alloc)}. Likely result: ${cop(p5.expected)}; bad scenario: ${cop(p5.worst)}.`].filter(Boolean),
    andres: [p2 && `For his motorcycle, I recommend ${p2.pickName}: ${p2.ea}% EA and a total cost of ${cop(p2.total)}. Before signing he must ask: ${p2.questions.slice(0, 2).map((q) => `“${q}”`).join(" and ")}`, p4 && dot3(p4.advice)].filter(Boolean),
    rosa: [p6 && `For her second stand, I recommend ${p6.choice.toLowerCase()}. After 6 months she would have ${cop(p6.cash)} in cash. To protect the business: ${p6.shields.join(", ").toLowerCase()}.`, p6 && "First, she should test a small temporary stand."].filter(Boolean),
    efrain: [p7 && `For Don Efraín, I recommend ${p7.channels.map((c) => { const t = c.replace(/^\S+\s/, "").replace(/\s*\(.*?\)/, ""); return t.charAt(0).toLowerCase() + t.slice(1); }).join(" and ")}. His safety rules: ${p7.rules.slice(0, 3).map((x) => x.charAt(0).toLowerCase() + x.slice(1)).join("; ")}.`, p4 && dot3(p4.warning)].filter(Boolean),
  };
  const bank = ty ? `When I ran CREAR Bank, I learned that a bank earns money with the spread: it charges more for loans than it pays to savers. My bank ended with ${ty.profit} units of profit and ${ty.trust}/100 trust.` : "";
  return {
    intro: `Hello! My name is ${name || "…"}. This is my Financial Services Guide: how banks, credit and investments can help people be financially secure.`,
    bank, life, clients,
    lesson: lesson ? `The lesson I will use in real life is ${dot3(lesson.replace(/^the lesson i will use in real life is\s*/i, ""))}` : "",
    outro: "Thank you for listening! Do you have any questions?",
  };
}
function GuideStudio({ resp, studentName, existing, onSave, onExit }) {
  const r = resp || {};
  const [lesson, setLesson] = useState(existing?.lesson || "");
  const [slide, setSlide] = useState(null);
  const [busy, setBusy] = useState(false);
  const [st, finish] = useFinish(onSave);
  const pages = GUIDE_PAGES.filter((p) => r[p.key]).length;
  const B = buildGuide(r, studentName, lesson);
  const ready = pages >= 5 && countWords(lesson) >= 12 && realText(lesson);
  const png = async () => { setBusy(true); try { const h2c = await loadHtml2Canvas(); const cv = await h2c(document.getElementById("g8-final"), { scale: 2, backgroundColor: "#ffffff", useCORS: true }); const a = document.createElement("a"); a.href = cv.toDataURL("image/png"); a.download = `Financial_Services_Guide_${(studentName || "student").replace(/\s+/g, "_")}.png`; a.click(); } catch (e) { /* sin imagen */ } setBusy(false); };
  const print = () => { document.body.classList.add("g8-printing"); const off = () => { document.body.classList.remove("g8-printing"); window.removeEventListener("afterprint", off); }; window.addEventListener("afterprint", off); setTimeout(() => window.print(), 50); };
  const Client = ({ id, big }) => { const c = CLIENTS.find((x) => x.id === id); const lines = B.clients[id]; return (
    <section className={`g8-fp g83-cl ${big ? "big" : ""} ${lines.length ? "" : "empty"}`}>
      <h4><span>{c.e}</span>{c.n} · {c.need}</h4>
      {lines.length ? <div className="g8-fp-say"><small>🎤 I SAY</small>{lines.map((t, k) => <p key={k}>{t}</p>)}</div> : <p className="g8-fp-empty">Finish this client's pages to present them.</p>}
      <div className="g8-fp-learn">🧭 Guide pages: {c.pages.map((n) => `${n} ${GUIDE_PAGES.find((p) => p.n === n).t}`).join(" · ")}</div>
    </section>
  ); };
  const Life = ({ big }) => (
    <section className={`g8-fp g83-cl life ${big ? "big" : ""}`}>
      <h4><span>📊</span>My Money Life — my story</h4>
      <MoneyLife resp={r} compact />
      <div className="g8-fp-say"><small>🎤 I SAY</small>{B.life.length ? B.life.map((t, k) => <p key={k}>{t}</p>) : <p>Play the Credit App, Credit Score Life and Market Storm to build your story.</p>}</div>
    </section>
  );
  const Bank = ({ big }) => B.bank ? <section className={`g8-fp ${big ? "big" : ""}`}><h4><span>🏦</span>How banks work</h4><div className="g8-fp-say"><small>🎤 I SAY</small><p>{B.bank}</p></div></section> : null;
  const slides = [
    { k: "intro", node: <div className="g8-slide-cover"><small>FINANCIAL SERVICES GUIDE · GRADE 8</small><h2>Banking, Credit & Investing</h2><p className="g8-fp-sayline">🎤 {B.intro}</p></div> },
    ...(B.bank ? [{ k: "bank", node: <Bank big /> }] : []),
    { k: "life", node: <Life big /> },
    ...CLIENTS.map((c) => ({ k: c.id, node: <Client id={c.id} big /> })),
    { k: "lesson", node: <section className="g8-fp habit big"><h4><span>💡</span>My lesson</h4><div className="g8-fp-say"><small>🎤 I SAY</small><p>{B.lesson || "…"}</p></div></section> },
    { k: "end", node: <div className="g8-slide-cover"><h2>Thank you! 🙌</h2><p className="g8-fp-sayline">🎤 {B.outro}</p></div> },
  ];
  if (st.done) return <Reward title="Financial Services Guide published! 🏆" subtitle="Your story + advice for 4 clients — in English." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Award size={22} strokeWidth={2.1} />} title="Financial Services Guide 🧭" subtitle="Your Money Life + your advice for 4 clients. Practice it and present it!" onExit={onExit}>
      <HowTo>Your guide builds itself from your pages and games. Each part has the sentences you will <b>say</b> (🎤). Add your lesson, then press <b>Present</b> to show one part at a time at the fair.</HowTo>
      <div className="g8-final g83-final" id="g8-final">
        <header><small>FINANCIAL SERVICES GUIDE · GRADE 8 · INSTITUTO CREAR</small><h2>Banking, Credit & Investing</h2><p>By <b>{studentName}</b> · {pages}/{GUIDE_PAGES.length} pages</p></header>
        <div className="g8-fp-intro">🎤 {B.intro}</div>
        <div className="g8-fp-list">
          <Bank />
          <Life />
          <h4 className="g8-subh">🧑‍🤝‍🧑 My advice for 4 clients</h4>
          {CLIENTS.map((c) => <Client key={c.id} id={c.id} />)}
          <section className="g8-fp habit"><h4><span>💡</span>My lesson</h4><div className="g8-fp-say"><small>🎤 I SAY</small><p>{B.lesson || "Write your lesson below."}</p></div></section>
        </div>
        <div className="g8-fp-intro end">🎤 {B.outro}</div>
      </div>
      <div className="p3-sentence edit"><span>💡 The lesson I will use in real life is</span><input className="start-input" value={lesson} onChange={(e) => setLesson(e.target.value)} placeholder="Write your answer here…" /></div>
      {pages < 5 && <div className="p1-banner bad"><span>You need at least 5 of the {GUIDE_PAGES.length} guide pages. You have {pages}.</span></div>}
      <div className="p3-card-actions"><button className="s1-btn primary" onClick={() => setSlide(0)}><Mic size={17} /> Present</button><button className="s1-btn ghost" disabled={busy} onClick={png}><Download size={17} /> {busy ? "Creating…" : "Download PNG"}</button><button className="s1-btn ghost" onClick={print}><Printer size={17} /> Print / PDF</button></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(50, { pages, lesson })}>Publish my guide <span className="coin-tag"><Coins size={15} /> +50</span></button></div>
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

/* ---------- FINANCIAL SERVICES FAIR · estaciones + feedback ---------- */
const SHOW83 = ["I explained how a bank makes money.", "I told my Money Life story with numbers.", "I recommended an account and an investment plan for Valentina.", "I compared credit offers for Andrés (EA + total cost).", "I recommended financing and protections for Rosa.", "I designed a safe access solution for Don Efraín.", "I explained one risk and how to reduce it."];
function Fair83({ onSave, onExit }) {
  const [checks, setChecks] = useState([]);
  const [peer, setPeer] = useState("");
  const [station, setStation] = useState(null);
  const [stars, setStars] = useState({ clear: 0, evidence: 0, risk: 0 });
  const [c1, setC1] = useState(""); const [c2, setC2] = useState("");
  const [st, finish] = useFinish(onSave);
  const ready = checks.length >= 5 && peer.trim() && station && Object.values(stars).every((x) => x > 0) && countWords(c1) >= 3 && realText(c1) && countWords(c2) >= 3 && realText(c2);
  if (st.done) return <Reward title="Fair complete! 🎪" subtitle="You advised real clients — in English." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Users size={22} strokeWidth={2.1} />} title="Financial Services Fair 🎪" subtitle="4 stations, 2 minutes each. Present — then give your tablet to the classmate who listened." onExit={onExit}>
      <div className="g83-stations">{CLIENTS.map((c, k) => <div key={c.id}><small>STATION {k + 1}</small><em>{c.e}</em><b>{c.n}</b><span>{c.need}</span></div>)}</div>
      <div className="start-block"><h3><span className="step-n">1</span> My presentation checklist (5+)</h3>{SHOW83.map((s) => <label key={s} className="perm-check p1-check"><input type="checkbox" checked={checks.includes(s)} onChange={() => setChecks(checks.includes(s) ? checks.filter((x) => x !== s) : [...checks, s])} /><span>{s}</span></label>)}</div>
      <div className="start-block">
        <h3><span className="step-n">2</span> 🔁 Classmate's feedback</h3>
        <input className="start-input p3-gap" value={peer} onChange={(e) => setPeer(e.target.value)} placeholder="Classmate's name" />
        <small className="g83-ph-lab">Which station did you watch?</small>
        <Tri value={station} onPick={setStation} opts={CLIENTS.map((c) => [c.id, `${c.e} ${c.n}`])} />
        {[["clear", "Clear recommendation"], ["evidence", "Good use of evidence (numbers)"], ["risk", "Risk explained"]].map(([k, l]) => <div key={k} className="p3-rub"><div><b>{l}</b></div><span /><div className="p3-stars">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={stars[k] >= n ? "on" : ""} onClick={() => setStars({ ...stars, [k]: n })}>★</button>)}</div></div>)}
        <div className="p3-sentence edit"><span>⭐ The best part was</span><input className="start-input" value={c1} onChange={(e) => setC1(e.target.value)} placeholder="Write it here…" /></div>
        <div className="p3-sentence edit"><span>💡 One idea to improve:</span><input className="start-input" value={c2} onChange={(e) => setC2(e.target.value)} placeholder="Write it here…" /></div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(20, { checks, peer, station, stars, comments: [c1, c2] })}>Save feedback <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}

/* ---------- FINANCIAL BOSS · 5 misiones aplicadas + repaso ---------- */
const BOSS_MISSIONS = [
  { tag: "MISSION 1 · HIDDEN COST", q: "NeoPocket: $0 monthly fee, but $4,500 for each withdrawal after the first free one. Valentina withdraws 4 times a month. ANNUAL cost?", answer: 162000, money: true, hint: "(4 − 1) × 4,500 × 12", explain: "3 extra × $4,500 × 12 = $162,000. “$0 fee” is not “$0 cost”." },
  { tag: "MISSION 2 · TWO RATES", q: "Offer X: 2% MONTHLY. Offer Y: 25% EA. Same term, no fees. Which is cheaper?", options: ["Offer Y (2% monthly ≈ 26.8% EA)", "Offer X, because 2 is a much smaller number than 25", "They are the same", "You can't know"], correct: 0, hint: "Convert 2% monthly to EA: (1.02)^12 − 1.", explain: "Always compare in EA." },
  { tag: "MISSION 3 · FIX THE TABLE", q: "Balance $2,000,000 · 2% monthly · payment $150,000. A student wrote “interest $150,000, principal $0”. What is the correct PRINCIPAL?", answer: 110000, money: true, hint: "Interest = 2,000,000 × 2% = 40,000. Principal = payment − interest.", explain: "$150,000 − $40,000 = $110,000." },
  { tag: "MISSION 4 · THE STORM", q: "Your diversified portfolio falls 25% in one quarter. Your goal is in 10 years. Best move?", options: ["Stay invested and keep diversifying", "Sell everything today and put it all in the coin that went up the most", "Borrow money to buy crypto", "Stop saving forever"], correct: 0, hint: "Long horizon + diversification = time to recover.", explain: "A fall is not a loss until you sell. Luck ≠ strategy." },
  { tag: "MISSION 5 · ACCESS", q: "Don Efraín has a basic phone and lives 2 hours from a branch. Best option?", options: ["A banking agent + mobile money by SMS", "A banking app that needs a smartphone and fast internet at home", "Cash under the mattress", "A gota a gota lender"], correct: 0, hint: "Think: access, cost, safety, ease.", explain: "Close, cheap, safe and simple." },
];
function BossP3({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [mis, setMis] = useState(0);
  return stage === 0 ? (
    <ActShell icon={<Swords size={22} strokeWidth={2.1} />} title="Financial Boss · Part 1 ⚔️" subtitle="5 applied missions. Then 10 quick review questions." onExit={onExit}>
      <RateCalc />
      <RoundsRunner rounds={BOSS_MISSIONS} doneLabel="Part 2: review questions" onDone={(r) => { setMis(r.firstTry); setStage(1); }} />
    </ActShell>
  ) : (
    <QuizRunner title={`Financial Boss · Part 2 (missions: ${mis}/5 ⭐)`} emoji="⚔️" questions={BOSS_8P3} pickCount={10} passThreshold={70} xpPerCorrect={4} xpComplete={10 + mis * 4} onSave={(r) => onSave({ ...r, missions: mis })} onExit={onExit} />
  );
}

/* ---------- AUTOEVALUACIÓN · PERIODO 3 ---------- */
const RUBRIC83 = [
  { id: "bank", t: "I can explain how a bank makes money", d: "Spread, deposits, loans, Superfinanciera, Banco de la República.", acts: ["c18_starter", "c18_video", "c18_rush", "c18_tycoon"], check: { q: "Loans pay 15%, savings pay 4%. The spread is…", options: ["11 points", "19 points", "4 points"], tip: "15 − 4. Review: Class 18 · Bank Tycoon." } },
  { id: "cost", t: "I can compare accounts by their real annual cost", d: "Fees, withdrawals, use.", acts: ["c18_page"], check: { q: "$5,000 fee a month. Annual cost?", options: ["$60,000", "$5,000", "$50,000"], tip: "5,000 × 12. Review: Class 18 · Total Cost Duel." } },
  { id: "rates", t: "I can read a rate: monthly, nominal, EA and usury", d: "And compare the TOTAL cost.", acts: ["c19_starter", "c19_read", "c19_rush", "c19_reader", "c19_page"], check: { q: "1.5% monthly is about…", options: ["19.6% EA", "1.5% a year", "18% EA exactly"], tip: "(1.015)^12 − 1. Review: Class 19 · Rate Reader." } },
  { id: "credit", t: "I can explain a loan payment (interest vs. principal)", d: "Amortization and total cost.", acts: ["c20_starter", "c20_video", "c20_rush", "c20_app", "c20_page"], check: { q: "Balance $1,000,000 at 2%. Interest this month?", options: ["$20,000", "$200,000", "$2,000"], tip: "Balance × rate. Review: Class 20 · Credit App." } },
  { id: "history", t: "I can protect my credit history", d: "Payment habits, capacity, gota a gota.", acts: ["c21_starter", "c21_read", "c21_rush", "c21_life", "c21_page"], check: { q: "Which helps your history the most?", options: ["Paying on time", "Having many cards", "Borrowing to pay loans"], tip: "Review: Class 21 · Credit Score Life." } },
  { id: "invest", t: "I can explain risk, return and diversification", d: "Luck vs. strategy.", acts: ["c22_starter", "c22_video", "c22_rush", "c22_storm", "c22_page"], check: { q: "For money you need in 2 years, the best is…", options: ["Low risk (CDT / pocket)", "All in crypto because it grows the fastest", "One single stock"], tip: "Short horizon = low risk. Review: Class 22 · Market Storm." } },
  { id: "business", t: "I can compare ways to finance and protect a business", d: "Cash flow, microcredit, grant, investor, insurance.", acts: ["c23_starter", "c23_read", "c23_desk", "c23_shield", "c23_page"], check: { q: "Sales $2,000,000 · costs $1,700,000 · loan $250,000. Cash left?", options: ["$50,000", "$300,000", "$550,000"], tip: "2,000,000 − 1,700,000 − 250,000. Review: Class 23 · Bank Desk." } },
  { id: "digital", t: "I can use digital banking safely and explain financial inclusion", d: "Transfers, phishing, agents, mobile money.", acts: ["c24_starter", "c24_video", "c24_tour", "c24_unbanked", "c24_page"], check: { q: "A message asks for your code to “unlock” your account. It is…", options: ["Phishing", "Normal support", "A prize"], tip: "Review: Class 24 · Mobile Bank Tour." } },
];

const STAR_L3 = ["", "Starting", "Developing", "Good", "Excellent"];
const HOW_L3 = [["read", "📖 Reading"], ["video", "🎬 Video"], ["game", "🎮 Game"], ["write", "✍️ Writing"], ["sim", "🧮 Simulator"]];
function SelfCheck83({ existing, checklist, onSave, onExit }) {
  const [stars, setStars] = useState(existing?.stars || {});
  const [how, setHow] = useState(existing?.how || {});
  const [prove, setProve] = useState({});
  const [goal, setGoal] = useState(existing?.goal || 0);
  const [proud, setProud] = useState(existing?.proud || "");
  const [next, setNext] = useState(existing?.next || "");
  const [st, finish] = useFinish(onSave);
  const [orders] = useState(() => RUBRIC83.map((r) => shuffleArr(r.check.options.map((_, k) => k))));
  const ck = checklist || {};
  const actT = (k) => ALL_ACTS3.find((a) => a.key === k)?.title.replace(/ · Page \d+/, "") || k;
  const proved = RUBRIC83.filter((r) => prove[r.id] === 0).length;
  const all = RUBRIC83.every((r) => stars[r.id] && how[r.id] && prove[r.id] !== undefined);
  const score = Math.round(RUBRIC83.reduce((a, r) => a + (stars[r.id] || 0), 0) / (RUBRIC83.length * 4) * 100);
  if (st.done) return <Reward title="Period 3 complete! 🏆" subtitle={`Prove-it challenges: ${proved}/${RUBRIC83.length}`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Star size={22} strokeWidth={2.1} />} title="My Self-Check · Period 3" subtitle="For each skill: prove it, say how you learned it, then rate yourself." onExit={onExit}>
      <HowTo>Eight skills. For each one: 1) <b>Prove it</b>. 2) See <b>where you practiced it</b> (✓ = done). 3) Choose <b>how you learned it best</b>. 4) Give yourself <b>stars</b> — be honest!</HowTo>
      <div className="g8-skills">
        {RUBRIC83.map((r, ri) => { const p = prove[r.id]; const doneActs = r.acts.filter((k) => ck[k]).length; return (
          <div key={r.id} className={`g8-skill ${stars[r.id] && how[r.id] && p !== undefined ? "done" : ""}`}>
            <header><span>{ri + 1}</span><div><b>{r.t}</b><small>{r.d}</small></div><i>{doneActs}/{r.acts.length} practiced</i></header>
            <div className="g8-skill-acts">{r.acts.map((k) => <span key={k} className={ck[k] ? "ok" : ""}>{ck[k] ? "✓" : "○"} {actT(k)}</span>)}</div>
            <div className="g8-skill-prove"><small>🎯 PROVE IT</small><b>{r.check.q}</b>
              <div>{orders[ri].map((k) => <button key={k} type="button" disabled={p !== undefined} className={p === undefined ? "" : k === 0 ? "ok" : k === p ? "no" : ""} onClick={() => setProve({ ...prove, [r.id]: k })}>{r.check.options[k]}</button>)}</div>
              {p !== undefined && <p className={p === 0 ? "ok" : "no"}>{p === 0 ? "✅ Correct!" : "❌ Not this time."} {r.check.tip}</p>}
            </div>
            <div className="g8-skill-row">
              <div><small>HOW DID YOU LEARN IT BEST?</small><div className="g74-chips">{HOW_L3.map(([k, l]) => <button key={k} type="button" className={how[r.id] === k ? "on" : ""} onClick={() => setHow({ ...how, [r.id]: k })}>{l}</button>)}</div></div>
              <div><small>MY LEVEL</small><div className="p3-stars">{[1, 2, 3, 4].map((n) => <button key={n} type="button" className={(stars[r.id] || 0) >= n ? "on" : ""} onClick={() => setStars({ ...stars, [r.id]: n })}>★</button>)}<small>{STAR_L3[stars[r.id] || 0]}</small></div></div>
            </div>
          </div>
        ); })}
      </div>
      <div className="p3-score"><small>My self-check</small><b>{score}%</b><div className="p3-mini-bar"><i style={{ width: `${score}%` }} /></div></div>
      <div className="start-block">
        <h3>🧭 Did the activities help you reach the goal?</h3>
        <p className="start-tip">Goal: <i>“How can banks, saving strategies and responsible financial services help people achieve financial security?”</i></p>
        <div className="g8-goalscale">{[["😕", "Not really"], ["🙂", "A little"], ["😀", "Yes"], ["🤩", "Totally!"]].map(([e, l], k) => <button key={l} type="button" className={goal === k + 1 ? "on" : ""} onClick={() => setGoal(k + 1)}><em>{e}</em>{l}</button>)}</div>
        <label className="p3-lbl">🌟 The activity that taught me the most was…<input className="start-input" value={proud} onChange={(e) => setProud(e.target.value)} placeholder="Write your answer here…" /></label>
        <label className="p3-lbl">🎯 Next period I want to improve…<input className="start-input" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Write your answer here…" /></label>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!all || !goal || countWords(proud) < 3 || !realText(proud) || countWords(next) < 3 || !realText(next)} onClick={() => finish(20, { stars, how, proved, score, goal, proud, next })}>{all ? "Send my self-check" : "Complete the 8 skills"} <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}
/* =====================================================================
   ESTRUCTURA DEL PERIODO 3 (clases 18–25) · Financial Services Guide + My Money Life
   ===================================================================== */
const A = (key, title, desc, icon, coins, bucket) => ({ key, title, desc, icon, coins, bucket });
const G8P3_WEEKS = [
  { n: 18, g: "18", title: "How Does a Bank Make Money?", blurb: "Run a bank for 6 rounds — then find the cheapest account for Valentina.", e: "🏦", skills: ["Video", "Simulator"], acts: [
    A("c18_starter", "Starter: Bank Words 🧱", "Deposit, loan, spread, CDT, Superfinanciera, Banco de la República.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c18_video", "Video: How Banks Make Money 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c18_rush", "Who Does What? Rush ⚡", "Bank · Superfinanciera · Banco de la República.", <Zap size={22} />, 24, "aprendi"),
    A("c18_tycoon", "Bank Tycoon 🏦", "Run CREAR Bank: profit, trust and risk.", <Landmark size={22} />, 36, "aprendi"),
    A("c18_page", "Total Cost Duel 🏦 · Page 01", "The real annual cost of 3 accounts for Valentina.", <Wallet size={22} />, 30, "aprendi"),
  ] },
  { n: 19, g: "19", title: "The Rate Behind the Ad", blurb: "Monthly, nominal, EA, usury: read the fine print before Andrés signs.", e: "🔎", skills: ["Reading", "Calculator"], acts: [
    A("c19_starter", "Starter: Rate Words 🧱", "Monthly, nominal, EA, fixed, variable, usury.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c19_read", "Reading: The Rate Behind the Ad 📖", "Andrés and the motorcycle · quiz (8 of 12).", <BookOpen size={22} />, 42, "quizzes"),
    A("c19_rush", "Clear or Hidden? Rush 🚩", "12 pieces of loan information.", <Zap size={22} />, 24, "aprendi"),
    A("c19_reader", "Rate Reader 🔎", "6 ads · scan, translate, calculate, expose.", <Search size={22} />, 38, "aprendi"),
    A("c19_page", "The Best Offer for Andrés 🔎 · Page 02", "One offer + the questions he must ask.", <FileText size={22} />, 30, "aprendi"),
  ] },
  { n: 20, g: "20", title: "My First Digital Credit", blurb: "Apply for a simulated loan, read the contract and see where every payment goes.", e: "📲", skills: ["Video", "Simulator"], acts: [
    A("c20_starter", "Starter: Loan Words 🧱", "Principal, installment, term, amortization.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c20_video", "Video: How Loan Payments Work 🎬", "The Mortgage Professor · 8 questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c20_rush", "Interest or Principal? Rush ⚡", "Where does each peso go?", <Zap size={22} />, 24, "aprendi"),
    A("c20_app", "CREAR Credit App 📲", "Budget · loan · contract trap · amortization.", <Smartphone size={22} />, 36, "aprendi"),
    A("c20_page", "My Credit Decision 📲 · Page 03", "Accept, change or reject — with numbers.", <CreditCard size={22} />, 28, "aprendi"),
  ] },
  { n: 21, g: "21", title: "Credit Score Life", blurb: "Live 12 months with YOUR loan payment. Every decision changes your history.", e: "⭐", skills: ["Reading", "Simulator"], acts: [
    A("c21_starter", "Starter: Credit History 🧱", "Score, bureau, capacity, gota a gota.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c21_read", "Reading: Two Cousins, Two Scores 📖", "Same salary, different decisions · quiz (8 of 12).", <BookOpen size={22} />, 42, "quizzes"),
    A("c21_rush", "Score Up or Down? Rush ⚡", "Habits that help or hurt.", <Zap size={22} />, 24, "aprendi"),
    A("c21_life", "Credit Score Life ⭐", "12 months · 12 decisions.", <Gauge size={22} />, 34, "aprendi"),
    A("c21_page", "Five Borrowing Rules ⭐ · Page 04", "Rules + advice for Andrés + a warning for Don Efraín.", <ShieldCheck size={22} />, 28, "aprendi"),
  ] },
  { n: 22, g: "22", title: "Invest & Survive", blurb: "Build a portfolio and survive 24 months of random market events.", e: "📈", skills: ["Video", "Simulator"], acts: [
    A("c22_starter", "Starter: Investing Words 🧱", "Risk, return, horizon, diversification.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c22_video", "Video: How the Stock Market Works 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c22_rush", "Low, Medium or High Risk? ⚡", "12 investments · 3 boxes.", <Zap size={22} />, 24, "aprendi"),
    A("c22_storm", "Market Storm 🌪️", "$2,000,000 · 8 random quarters · luck or strategy?", <TrendingUp size={22} />, 36, "aprendi"),
    A("c22_page", "Valentina's Five-Year Plan 📈 · Page 05", "Risk profile + mix + good and bad scenarios.", <PiggyBank size={22} />, 30, "aprendi"),
  ] },
  { n: 23, g: "23", title: "Rosa Goes Big", blurb: "Finance Tía Rosa's second stand and protect it from random shocks.", e: "🫓", skills: ["Reading", "Business"], acts: [
    A("c23_starter", "Starter: Business Money 🧱", "Cash flow, microcredit, grant, investor, insurance.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c23_read", "Reading: Rosa Wants a Second Stand 📖", "A business case · quiz (8 of 12).", <BookOpen size={22} />, 42, "quizzes"),
    A("c23_desk", "Business Bank Desk 🏦", "4 ways to finance · 6 months of cash flow.", <Building2 size={22} />, 30, "aprendi"),
    A("c23_shield", "Risk Shield ☂️", "Buy protections · survive 4 random shocks.", <Umbrella size={22} />, 30, "aprendi"),
    A("c23_page", "Rosa's Plan 🫓 · Page 06", "Financing + protections + first step.", <Store size={22} />, 30, "aprendi"),
  ] },
  { n: 24, g: "24", title: "A Bank in Every Pocket", blurb: "Digital banking missions — and financial access for people without a bank.", e: "📱", skills: ["Video", "Digital"], acts: [
    A("c24_starter", "Starter: Digital Money 🧱", "Instant payments, keys, agents, phishing.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c24_video", "Video: M-Pesa in Kenya 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c24_tour", "Mobile Bank Tour 📱", "Send · pay · protect · catch the phisher.", <Smartphone size={22} />, 34, "aprendi"),
    A("c24_unbanked", "Unbanked Challenge 🌍", "Don Efraín · Amina · Rahim.", <Globe size={22} />, 34, "aprendi"),
    A("c24_page", "Access for Don Efraín 📱 · Page 07", "Channels + safety rules.", <Handshake size={22} />, 30, "aprendi"),
  ] },
  { n: 25, g: "25", title: "Financial Services Fair + Boss", blurb: "One year later · your guide · the fair · the Boss · your self-check.", e: "🏆", skills: ["Speaking", "Challenge"], acts: [
    A("c25_later", "One Year Later 📆", "3 random events for YOUR Money Life.", <Calendar size={22} />, 30, "aprendi"),
    A("c25_guide", "Financial Services Guide 🧭", "Your story + advice for 4 clients · present it.", <Award size={22} />, 50, "aprendi"),
    A("c25_fair", "Financial Services Fair 🎪", "4 stations · peer feedback.", <Users size={22} />, 20, "comportamiento"),
    A("c25_boss", "Financial Boss ⚔️", "5 missions + 10 review questions (70%).", <Swords size={22} />, 70, "quizzes"),
    A("c25_self", "My Self-Check", "Prove 8 skills + how you learned them.", <Star size={22} />, 20, "comportamiento"),
  ] },
];
const ALL_ACTS3 = G8P3_WEEKS.flatMap((w) => w.acts);
const TOTAL_ACTS3 = ALL_ACTS3.length;
const PAGE_ACTS3 = [...GUIDE_PAGES.map((p) => p.key), "c25_guide"];

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Periodo3G8 = ({ userData, API_URL, existingRow, onBack }) => {
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
  const doneCount = ALL_ACTS3.filter((a) => checklist[a.key]).length;
  const pctDone = Math.round((doneCount / TOTAL_ACTS3) * 100);
  const weekDone = (w) => w.acts.every((a) => checklist[a.key]);
  const coinsTotal = Math.round(points.comportamiento + points.quizzes + points.aprendi);

  const persist = (nextChecklist, nextPoints, respPatch) => {
    respRef.current = { ...respRef.current, ...respPatch };
    const done = ALL_ACTS3.filter((a) => nextChecklist[a.key]).length;
    const row = {
      Student_Key: userData.Student_Key, Semana: PERIOD_KEY, Grado: GRADE,
      Estado: done >= TOTAL_ACTS3 ? "completed" : "in_progress",
      Porcentaje: Math.round((done / TOTAL_ACTS3) * 100),
      Puntos_Comportamiento: nextPoints.comportamiento, Puntos_Quizzes: nextPoints.quizzes, Puntos_Aprendi: nextPoints.aprendi,
      Checklist_JSON: JSON.stringify(nextChecklist), Respuestas_JSON: JSON.stringify(respRef.current),
    };
    const prev = store.semanas?.[PERIOD_KEY];
    dispatch({ type: "save_progreso", payload: row }); // OPTIMISTA
    fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "save_progreso", data: row }) })
      .catch((e) => { console.error("Error guardando 8° Periodo 3:", e); dispatch({ type: "rollback_progreso", payload: { Semana: PERIOD_KEY, prev } }); });
  };
  const complete = (key, bucket, xp, respPatch, pass = true) => {
    const already = !!checklist[key];
    const nextChecklist = { ...checklist, [key]: already || pass };
    const nextPoints = already ? points : { ...points, [bucket]: points[bucket] + (xp || 0) };
    setChecklist(nextChecklist); setPoints(nextPoints);
    persist(nextChecklist, nextPoints, respPatch);
    return Promise.resolve();
  };
  const WRAP = "s1 p1 p2 p3 p4 g7 g72 g73 g74 g8 g82 g83";

  if (act) {
    const def = ALL_ACTS3.find((a) => a.key === act);
    const resp = respRef.current || {};
    const exit = () => setAct(null);
    const save = (r) => complete(act, def.bucket, r.xp, { [act]: { ...r, at: nowISO() } }, r.passed !== false);
    const reading = (tag, title, subtitle, sections, glossary, questions, emoji) => (
      <ReadThen tag={tag} title={title} subtitle={subtitle} minutes={8} sections={sections} glossary={glossary} onExit={exit} finishLabel="I read it — start the quiz (8 questions)">
        <QuizRunner title={`${title} · check`} emoji={emoji} questions={questions} pickCount={8} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
      </ReadThen>
    );
    const video = (src, title, qs) => <VideoQuiz src={src} title={title} questions={qs} pickCount={8} onSave={save} onExit={exit} />;
    const starter = (title, subtitle, data, coins = 20) => <StarterPack title={title} subtitle={subtitle} cards={data.cards} pairs={data.pairs} rounds={data.rounds} coins={coins} onSave={save} onExit={exit} />;
    let view = null;
    switch (act) {
      case "c18_starter": view = starter("Starter: Bank Words 🧱", "Where does a bank's money come from?", START_18); break;
      case "c18_video": view = video(VID_BANK, "How Banks Make Money", VQ_18); break;
      case "c18_rush": view = <SpeedSort title="Who Does What? Rush ⚡" subtitle="Bank, Superfinanciera or Banco de la República?" buckets={RUSH_18.buckets} items={RUSH_18.items} seconds={75} doneTitle="System expert! 🏛️" onSave={save} onExit={exit} />; break;
      case "c18_tycoon": view = <BankTycoon onSave={save} onExit={exit} />; break;
      case "c18_page": view = <CostDuel existing={resp.c18_page} onSave={save} onExit={exit} />; break;
      case "c19_starter": view = starter("Starter: Rate Words 🧱", "A percentage without a period tells half the story.", START_19); break;
      case "c19_read": view = reading("READING · B1 · STORY", "The Rate Behind the Ad", "Is a small payment always a cheap loan?", READ_19, GLOSS_19, Q_19, "🛵"); break;
      case "c19_rush": view = <SpeedSort title="Clear or Hidden? Rush 🚩" subtitle="Can you compare it — or is something missing?" buckets={RUSH_19.buckets} items={RUSH_19.items} doneTitle="Fine-print reader! 🔎" onSave={save} onExit={exit} />; break;
      case "c19_reader": view = <RateReader onSave={save} onExit={exit} />; break;
      case "c19_page": view = <AndresOffer resp={resp} existing={resp.c19_page} onSave={save} onExit={exit} />; break;
      case "c20_starter": view = starter("Starter: Loan Words 🧱", "Every payment has two parts.", START_20); break;
      case "c20_video": view = video(VID_LOAN, "How Loan Payments Work", VQ_20); break;
      case "c20_rush": view = <SpeedSort title="Interest or Principal? Rush ⚡" subtitle="Where does each peso of your payment go?" buckets={RUSH_20.buckets} items={RUSH_20.items} doneTitle="Amortization ace! 📊" onSave={save} onExit={exit} />; break;
      case "c20_app": view = <CreditApp onSave={save} onExit={exit} />; break;
      case "c20_page": view = <CreditDecision resp={resp} existing={resp.c20_page} onSave={save} onExit={exit} />; break;
      case "c21_starter": view = starter("Starter: Credit History 🧱", "Your habits tell lenders a story.", START_21); break;
      case "c21_read": view = reading("READING · B1 · STORY", "Two Cousins, Two Scores", "Same salary — different decisions.", READ_21, GLOSS_21, Q_21, "⭐"); break;
      case "c21_rush": view = <SpeedSort title="Score Up or Down? Rush ⚡" subtitle="Does it help or hurt your credit history?" buckets={RUSH_21.buckets} items={RUSH_21.items} doneTitle="History keeper! ⭐" onSave={save} onExit={exit} />; break;
      case "c21_life": view = <ScoreLife resp={resp} onSave={save} onExit={exit} />; break;
      case "c21_page": view = <BorrowRules existing={resp.c21_page} onSave={save} onExit={exit} />; break;
      case "c22_starter": view = starter("Starter: Investing Words 🧱", "Risk, return and many baskets.", START_22); break;
      case "c22_video": view = video(VID_STOCK, "How the Stock Market Works", VQ_22); break;
      case "c22_rush": view = <SpeedSort title="Low, Medium or High Risk? ⚡" subtitle="How much can its value move?" buckets={RUSH_22.buckets} items={RUSH_22.items} seconds={75} doneTitle="Risk radar! 🎢" onSave={save} onExit={exit} />; break;
      case "c22_storm": view = <MarketStorm onSave={save} onExit={exit} />; break;
      case "c22_page": view = <ValentinaPlan existing={resp.c22_page} onSave={save} onExit={exit} />; break;
      case "c23_starter": view = starter("Starter: Business Money 🧱", "Sales are not profit — and cash is king.", START_23); break;
      case "c23_read": view = reading("READING · B1 · BUSINESS CASE", "Rosa Wants a Second Stand", "A bigger business, a bigger decision.", READ_23, GLOSS_23, Q_23, "🫓"); break;
      case "c23_desk": view = <BankDesk onSave={save} onExit={exit} />; break;
      case "c23_shield": view = <RiskShield onSave={save} onExit={exit} />; break;
      case "c23_page": view = <RosaPlan resp={resp} existing={resp.c23_page} onSave={save} onExit={exit} />; break;
      case "c24_starter": view = starter("Starter: Digital Money 🧱", "A bank in your pocket — safely.", START_24); break;
      case "c24_video": view = video(VID_MPESA, "M-Pesa: Mobile Money in Kenya", VQ_24); break;
      case "c24_tour": view = <MobileTour onSave={save} onExit={exit} />; break;
      case "c24_unbanked": view = <Unbanked onSave={save} onExit={exit} />; break;
      case "c24_page": view = <EfrainPlan existing={resp.c24_page} onSave={save} onExit={exit} />; break;
      case "c25_later": view = <OneYearLater resp={resp} onSave={save} onExit={exit} />; break;
      case "c25_guide": view = <GuideStudio resp={resp} studentName={name} existing={resp.c25_guide} onSave={save} onExit={exit} />; break;
      case "c25_fair": view = <Fair83 onSave={save} onExit={exit} />; break;
      case "c25_boss": view = <BossP3 onSave={save} onExit={exit} />; break;
      case "c25_self": view = <SelfCheck83 existing={resp.c25_self} checklist={checklist} onSave={save} onExit={exit} />; break;
      default: view = null;
    }
    return <div className={WRAP}>{view}</div>;
  }

  if (week) {
    const w = G8P3_WEEKS.find((x) => x.n === week);
    const wDone = w.acts.filter((a) => checklist[a.key]).length;
    const next = G8P3_WEEKS[G8P3_WEEKS.indexOf(w) + 1];
    return (
      <div className={WRAP}>
        <button className="s1-back" onClick={() => setWeek(null)}><ArrowLeft size={18} strokeWidth={2.4} /> Back to Period 3</button>
        <div className="s1-hero p1-week-hero g7-hero g8-hero">
          <span className="s1-tag">{w.e} GRADE 8 · PERIOD 3 · CLASS {w.g}</span>
          <h1>{w.title}</h1>
          <p>{w.blurb}</p>
          <div className="s1-progress"><div className="bar"><i style={{ width: `${(wDone / w.acts.length) * 100}%` }} /></div><span className="pill">{wDone}/{w.acts.length}</span></div>
        </div>
        <GuidePanel resp={respRef.current} compact />
        {w.n >= 20 && <MoneyLife resp={respRef.current} compact />}
        <div className="s1-quest">
          {w.acts.map((a) => (
            <div key={a.key} className={`act-card ${checklist[a.key] ? "done" : ""} ${PAGE_ACTS3.includes(a.key) ? "g8-page-act" : ""} ${a.title.startsWith("Starter") ? "g8-starter-act" : ""} ${a.key.endsWith("_rush") ? "g8-rush-act" : ""} ${a.key.endsWith("_read") || a.key.endsWith("_video") ? "g73-learn-act" : ""}`}>
              <div className="act-ico">{checklist[a.key] ? <Check size={22} strokeWidth={3} /> : a.icon}</div>
              <div className="act-main"><h3>{a.title}</h3><p>{a.desc}</p>{a.topics && <div className="act-topics">{a.topics.map((t) => <span key={t}>{t}</span>)}</div>}</div>
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
      <div className="s1-hero p1-hero g7-hero g8-hero">
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> ADMIN PREVIEW · GRADE {GRADE} · PERIOD 3</span>
        <h1>Banking, Credit & Investing</h1>
        <p>How can banks, saving strategies and responsible financial services help people achieve financial security?</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pctDone}%` }} /></div><span className="pill">{pctDone}%</span></div>
        <div className="p1-hero-chips"><span><Coins size={14} /> {coinsTotal} coins</span><span><Check size={14} /> {doneCount}/{TOTAL_ACTS3} activities</span><span>📊 My Money Life</span><span>🧭 Financial Services Guide</span><span>🎯 SDG 8 · SDG 10</span></div>
      </div>
      <div className="g8-howyear"><b>🧭 This period:</b><span>You become a financial advisor for 4 clients — and you live your own “Future Me” money life: a simulated loan, a credit score and real-looking investments with random events. Each class (45 min): Starter → one video or reading → a BIG game → a page of your Guide.</span></div>
      <div className="g83-clients">{CLIENTS.map((c) => <ClientCard key={c.id} id={c.id} />)}</div>
      <MoneyLife resp={respRef.current} />
      <GuidePanel resp={respRef.current} studentName={name} />
      {checklist.c25_guide && <button type="button" className="p3-card-link" onClick={() => setAct("c25_guide")}><Award size={18} /> See my Financial Services Guide <ChevronRight size={16} /></button>}
      <div className="p1-passport">
        <div className="p1-passport-head"><b>🏦 Financial Services Pass</b><span>Finish a class to get its stamp</span></div>
        <div className="p1-stamps">{G8P3_WEEKS.map((w) => <button key={w.n} type="button" className={`p1-stamp ${weekDone(w) ? "done" : ""}`} onClick={() => setWeek(w.n)} title={w.title}><em>{w.e}</em><small>{w.g}</small></button>)}</div>
      </div>
      <div className="p1-weeks">
        {G8P3_WEEKS.map((w) => {
          const d = w.acts.filter((a) => checklist[a.key]).length; const full = d === w.acts.length;
          return (
            <button key={w.n} type="button" className={`p1-week-card ${full ? "done" : ""}`} onClick={() => setWeek(w.n)}>
              <div className="p1-week-top"><span className="p1-week-n">Class {w.g}</span><em>{full ? "✅" : w.e}</em></div>
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