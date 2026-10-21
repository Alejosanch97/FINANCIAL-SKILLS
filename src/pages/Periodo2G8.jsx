import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft, BookOpen, Video, Check, X, Coins, Trophy, Sparkles, Clock, ChevronRight, Lightbulb, Play,
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
import "../Styles/octavo2.css";   // 8° · Periodo 2 · Savings Portfolio
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   GRADO 8 · PERIODO 2 · SAVING TODAY, ACHIEVING TOMORROW (B1)
   Clases 11–21 · Pregunta guía: How can saving money today help us
   achieve bigger opportunities tomorrow?
   Hilo: SAVINGS PORTFOLIO (9 páginas + final) + GOAL JAR (meta real).
   Más HACER que contestar: cada clase = Starter · juego · misión · página.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "8P2", Grado = "8".
   ===================================================================== */
const PERIOD_KEY = "8P2";
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

/* =====================================================================
   PIEZAS DEL PERIODO 2 · Savings Portfolio + Goal Jar
   ===================================================================== */
const PF_PAGES = [
  { n: "01", key: "c11_page", t: "My money personality", e: "🧠" },
  { n: "02", key: "c12_goal", t: "My real goal", e: "🎯" },
  { n: "03", key: "c13_page", t: "My strategy", e: "♟️" },
  { n: "04", key: "c14_page", t: "My savings budget", e: "💧" },
  { n: "05", key: "c15_page", t: "My emergency plan", e: "🛟" },
  { n: "06", key: "c16_page", t: "My goal with interest", e: "📈" },
  { n: "07", key: "c17_page", t: "Where I keep my savings", e: "🏦" },
  { n: "08", key: "c18_page", t: "My business capital plan", e: "🚀" },
  { n: "09", key: "c19_page", t: "Ideas from the world", e: "🌍" },
];
function PortfolioPanel({ resp, compact, studentName }) {
  const r = resp || {};
  const done = PF_PAGES.filter((p) => r[p.key]).length;
  return (
    <div className={`g8-bp g82-pf ${compact ? "compact" : ""}`}>
      <div className="g8-bp-head">
        <b>🗂️ My Savings Portfolio{studentName && !compact ? ` · ${studentName.split(" ")[0]}` : ""}</b>
        <span>{done}/9 pages{r.c20_studio ? " · 🏆 complete" : ""}</span>
      </div>
      <div className="g8-bp-pages">
        {PF_PAGES.map((p) => <div key={p.n} className={`g8-bp-page ${r[p.key] ? "done" : ""}`}><small>{p.n}</small><em>{r[p.key] ? p.e : "▫️"}</em><span>{p.t}</span></div>)}
        <div className={`g8-bp-page final ${r.c20_studio ? "done" : ""}`}><small>10</small><em>{r.c20_studio ? "🏆" : "🔒"}</em><span>Final portfolio</span></div>
      </div>
    </div>
  );
}
function PFBadge({ n }) {
  const p = PF_PAGES.find((x) => x.n === n);
  return <div className="g8-bpbadge"><span>🗂️ PORTFOLIO PAGE {p.n}</span><b>{p.e} {p.t}</b></div>;
}

/* ---------- GOAL JAR: la meta que acompaña todo el periodo ---------- */
const jarSaved = (jar) => (jar ? (jar.start || 0) + Object.values(jar.logs || {}).reduce((a, v) => a + (v || 0), 0) : 0);
function GoalJar({ jar, classN, onLog, compact }) {
  const [amt, setAmt] = useState("");
  const [kind, setKind] = useState("real");
  if (!jar) {
    return (
      <div className="g82-jar empty">
        <div className="g82-jar-glass"><i style={{ height: "0%" }} /><b>?</b></div>
        <div><small>🫙 GOAL JAR</small><b>Your jar is empty — for now!</b><span>In <b>Class 12</b> you will choose a real goal. Then, at the end of every class, you add what you saved (real or simulated) and watch the jar fill up.</span></div>
      </div>
    );
  }
  const saved = jarSaved(jar);
  const pct = Math.min(100, Math.round((saved / (jar.target || 1)) * 100));
  const left = Math.max(0, jar.target - saved);
  const weeks = jar.weekly > 0 ? Math.ceil(left / jar.weekly) : null;
  const logged = classN && jar.logs && jar.logs[classN] !== undefined;
  return (
    <div className={`g82-jar ${compact ? "compact" : ""} ${pct >= 100 ? "full" : ""}`}>
      <div className="g82-jar-glass"><i style={{ height: `${Math.max(4, pct)}%` }} /><b>{pct}%</b></div>
      <div className="g82-jar-info">
        <small>🫙 GOAL JAR · {jar.item}</small>
        <b>{cop(saved)} <span>of {cop(jar.target)}</span></b>
        <div className="g82-jar-stats"><span>Left: <b>{cop(left)}</b></span>{weeks !== null && <span>≈ <b>{weeks}</b> weeks at {cop(jar.weekly)}/week</span>}</div>
        {!compact && Object.keys(jar.logs || {}).length > 0 && <div className="g82-jar-logs">{Object.entries(jar.logs).map(([k, v]) => <span key={k}>C{k}: +{cop(v)}</span>)}</div>}
        {classN && onLog && (logged
          ? <p className="g82-jar-ok">✅ Class {classN} logged: +{cop(jar.logs[classN])}</p>
          : (
            <div className="g82-jar-log">
              <div className="g73-toggle2"><button type="button" className={kind === "real" ? "on" : ""} onClick={() => setKind("real")}>Real money</button><button type="button" className={kind === "sim" ? "on" : ""} onClick={() => setKind("sim")}>Simulated</button></div>
              <MoneyInput value={amt} onChange={setAmt} />
              <button type="button" className="s1-btn primary" disabled={amt === "" || num(amt) < 0} onClick={() => { onLog(classN, num(amt), kind); setAmt(""); }}>+ Add to my jar <span className="coin-tag"><Coins size={13} /> +5</span></button>
              <small className="g82-jar-note">This week, how much did you save? $0 is OK — be honest. You can use a simulated amount.</small>
            </div>
          ))}
      </div>
    </div>
  );
}

/* ---------- VIDEO SIN PREGUNTAS (solo verlo y entenderlo) ---------- */
function WatchVideo({ src, title, subtitle, before, after, predict, coins = 10, onSave, onExit }) {
  const [watched, setWatched] = useState(false);
  const [pick, setPick] = useState(null);
  const [st, finish] = useFinish(onSave);
  const onTime = (e) => { const v = e.currentTarget; if (v.duration && v.currentTime / v.duration > 0.85) setWatched(true); };
  if (st.done) return <Reward title="Video watched! 🎬" subtitle="Now let's test it in real life…" coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Video size={22} strokeWidth={2.1} />} title={title} subtitle={subtitle} onExit={onExit}>
      {before}
      <div className="video-frame"><video src={src} controls playsInline preload="metadata" controlsList="nodownload" onTimeUpdate={onTime} onEnded={() => setWatched(true)} /></div>
      {predict && (
        <div className="start-block">
          <h3>🤔 {predict.q}</h3>
          <div className="g8-pick">{predict.options.map((o, k) => <button key={o} type="button" className={pick === k ? "on" : ""} onClick={() => setPick(k)}><b>{o}</b>{pick === k && <i>✓</i>}</button>)}</div>
        </div>
      )}
      {watched && after}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!watched || (predict && pick === null)} onClick={() => finish(coins, { predict: pick })}>{watched ? "I understood it — continue" : "Watch the whole video first"} <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
    </ActShell>
  );
}

/* ---------- Medidor doble (Present You vs Future You) ---------- */
function TwoMeters({ a, b, la, lb }) {
  return (
    <div className="g82-meters">
      <div><span>😋 {la}</span><i><s style={{ width: `${a}%` }} /></i><b>{a}</b></div>
      <div className="fut"><span>🚀 {lb}</span><i><s style={{ width: `${b}%` }} /></i><b>{b}</b></div>
    </div>
  );
}

/* Meta de escritura extra para P2: un plan con futuro */
const W_PLAN = { l: "Make a plan", re: /\b(i will|i'll|i am going to|i'm going to|next time|from now on|my plan is)\b/i, ex: "I will · next time · from now on" };

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
   PERIODO 2 · LECTURAS B1 (5) + 12 PREGUNTAS CADA UNA (se sortean 8)
   Opciones: la correcta · la que se parece (más larga) · la trampa · la que no tiene nada que ver.
   ===================================================================== */

/* ---------- CLASE 12 · The Price of Tomorrow ---------- */
const READ_12 = [
  { sub: "Three friends, three goals, one promise" },
  { p: "On the first day of the new school year, three friends made a promise. Before the end of the year, each of them would save money for something important. They thought the hardest part would be finding enough money. They soon discovered that setting a goal was only the beginning." },
  { h: "🚲 A bicycle for Daniel" },
  { p: "Daniel wanted a bicycle that cost $900,000. He imagined riding to school, exploring new places and spending less money on transportation. At first, he simply wrote “buy a bicycle” in his notebook." },
  { say: "His older sister asked him a question: “When do you want to buy it, and how will you know if you are making progress?”" },
  { p: "Daniel realized that his goal was too general. He decided to save $100,000 every month for nine months. He planned to earn some money helping his uncle on weekends and to save part of any gifts he received." },
  { p: "He also compared three bicycles instead of choosing the first one he saw. One was cheaper but needed repairs. Another had better brakes and a warranty. Daniel learned that the lowest price was not always the best value." },
  { p: "His plan became more useful when he wrote down the amount, the deadline and the steps he would follow. Instead of thinking only about the bicycle, he could now measure his progress every month." },
  { h: "💻 A laptop for Sofia" },
  { p: "Sofia wanted a laptop for school projects and learning to code. The model she liked cost $1,800,000. She hoped to buy it in two years." },
  { p: "Her cousin explained that prices can change over time. If the laptop price increased by 5% per year, the same model could cost approximately $1,984,500 after two years." },
  { node: <MiniTable head={["Time", "Laptop price (+5% a year)"]} rows={[["Today", "$1,800,000"], ["After 1 year", "$1,890,000"], ["After 2 years", "$1,984,500"]]} /> },
  { p: "Sofia had never thought about inflation before. She understood that keeping the same savings target for two years might not be enough if the price increased." },
  { p: "She also realized that she did not necessarily need that exact model. She could compare different laptops, consider refurbished devices from reliable sellers, or wait for a good offer. Her goal was not simply to own an expensive product; it was to have a computer that could support her learning." },
  { p: "Sofia created a flexible plan. She would track prices every few months, save a regular amount and review her target when she had better information." },
  { h: "🎓 A future for Camila" },
  { p: "Camila wanted to study at a university far from home. Her goal was much larger than her friends' goals, and it would take several years to prepare." },
  { p: "She researched tuition, transportation, food and accommodation. She discovered that university costs could change, and that scholarships or financial support might be available." },
  { p: "Camila divided her plan into smaller milestones. First, she would learn about entry requirements. Next, she would research scholarships and prepare the necessary documents. At the same time, she would save a small amount each month for application costs and transportation." },
  { p: "Her goal was not to pay for an entire university education by herself. It was to prepare carefully and understand the options available to her family." },
  { h: "Three goals, one important lesson" },
  { p: "The friends compared their plans. Daniel had a short-term goal, Sofia had a medium-term goal, and Camila had a long-term goal. Their deadlines were different, but they all needed clear targets, realistic steps and regular reviews." },
  { node: <MiniCase e="🎯" who="A SMART goal is…" lines={["S — Specific", "M — Measurable", "A — Achievable", "R — Relevant", "T — Time-bound"]} /> },
  { p: "A goal such as “I want to save more” gives little direction. A goal such as “I will save $50,000 each month for six months to buy a bicycle helmet and lock” is easier to follow." },
  { p: "They also learned that a plan should not ignore reality. Unexpected expenses can interrupt saving, and prices can change. A good plan allows people to adjust without giving up immediately." },
  { p: "At the end of the month, each friend recorded the money they had saved. Their amounts were different, but each had taken the first step toward a bigger opportunity. They decided to review their goals every month. The future still felt far away, but now they had a plan to move toward it." },
];
const GLOSS_12 = { "deadline": "Fecha límite.", "warranty": "Garantía.", "inflation": "Aumento general de los precios.", "refurbished": "Reacondicionado (usado pero reparado).", "milestones": "Etapas o metas pequeñas.", "tuition": "Matrícula / costo de estudiar.", "scholarships": "Becas.", "time-bound": "Con fecha límite." };
const Q_12 = [
  { q: "How much did Daniel's bicycle cost?", options: ["$900,000", "$1,800,000, the same price as Sofia's laptop", "$100,000", "A new helmet"], correct: 0, feedback: "Daniel's bicycle cost $900,000." },
  { q: "What was Daniel's plan?", options: ["Save $100,000 a month for nine months", "Save $900,000 in one month using all of his birthday gifts", "Save $50,000", "Buy the first bicycle he saw"], correct: 0, feedback: "$100,000 × 9 months = $900,000." },
  { q: "Why did Daniel compare three bicycles?", options: ["The cheapest isn't always the best value", "Because his sister told him to buy the most expensive bicycle in the store", "To buy three", "He likes shopping"], correct: 0, feedback: "One was cheaper but needed repairs." },
  { q: "What did Sofia's cousin explain?", options: ["Prices can change over time", "Laptops always become cheaper, so she should wait several years to buy one", "Prices never change", "Her laptop was broken"], correct: 0, feedback: "With +5% a year, the laptop could cost $1,984,500." },
  { q: "With +5% a year, the $1,800,000 laptop could cost about… in two years.", options: ["$1,984,500", "$1,890,000, which is the price after only one year", "$1,800,000", "$5"], correct: 0, feedback: "1,800,000 × 1.05 × 1.05 ≈ 1,984,500." },
  { q: "What was Sofia's REAL goal?", options: ["A computer that supports her learning", "The most expensive laptop in the store, because it has the best brand", "A phone", "A trip"], correct: 0, feedback: "Her goal was to support her learning — not a brand." },
  { q: "What was Camila's goal?", options: ["Preparing to study at a university far away", "Paying for her whole university education by herself before finishing school", "A bicycle", "A concert"], correct: 0, feedback: "She wanted to prepare and understand her family's options." },
  { q: "How did Camila make her big goal manageable?", options: ["She divided it into milestones", "She decided to wait until she finished school to start thinking about it", "She stopped saving", "She bought a car"], correct: 0, feedback: "Requirements → scholarships → documents → small monthly savings." },
  { q: "Which friend had a MEDIUM-term goal?", options: ["Sofia", "Daniel, because nine months is a very long time to wait for a bicycle", "Camila", "The teacher"], correct: 0, feedback: "Sofia: two years." },
  { q: "In SMART, what does the T mean?", options: ["Time-bound", "Together with your family and friends, so everyone can help you", "Target", "Taxi"], correct: 0, feedback: "It has a deadline." },
  { q: "Which goal is SMART?", options: ["Save $50,000 a month for six months for a helmet", "I want to save a lot of money in the future to buy many nice things", "Save more", "Eat healthy food"], correct: 0, feedback: "Amount + time + purpose." },
  { q: "Why should a plan allow adjustments?", options: ["Expenses and prices can change", "Because goals should change every week so saving never feels boring", "To give up", "Because of the weather"], correct: 0, feedback: "Adjust — don't give up." },
];

/* ---------- CLASE 14 · What Did That Coffee Really Cost? ---------- */
const READ_14 = [
  { sub: "A research article about small habits" },
  { p: "On the way to school, Nicolás often stopped at a small café. He bought a drink for $7,000 and sometimes added a snack for $4,000. He enjoyed the routine and did not think of it as a financial problem. After all, he was not buying an expensive phone or a new pair of shoes." },
  { say: "One Friday, his economics teacher asked the class a question: “How much does a small habit cost when you repeat it for a long time?”" },
  { h: "The investigation" },
  { p: "Nicolás decided to investigate. He wrote down every time he bought a drink or snack during a normal school week. He discovered that he spent $11,000 on five days of the week. That was $55,000 per week." },
  { p: "He multiplied the amount by four and estimated that the habit cost $220,000 over four weeks. When he considered 48 similar weeks, the total reached $2,640,000." },
  { node: <MiniTable head={["Time", "Calculation", "Total"]} rows={[["1 day", "$7,000 + $4,000", "$11,000"], ["1 week", "$11,000 × 5", "$55,000"], ["4 weeks", "$55,000 × 4", "$220,000"], ["48 weeks", "$55,000 × 48", "$2,640,000"]]} /> },
  { p: "Nicolás was surprised. The purchases had never felt expensive because he paid for them one at a time. However, adding them together revealed a much larger pattern." },
  { h: "Opportunity cost" },
  { p: "His teacher introduced the idea of opportunity cost. Every time we use money for one purpose, we give up the chance to use that money for something else. The cost is not only the price on the receipt. It can also include the value of the next best alternative we did not choose." },
  { box: "Opportunity cost = the value of the best alternative you give up when you choose something." },
  { p: "For Nicolás, the alternative was not necessarily to stop buying every drink. He could bring a drink from home three days a week and keep his café visits for Fridays. That way, he could still enjoy the café while saving part of the money." },
  { p: "He calculated the difference. If he replaced three $7,000 drinks each week with drinks from home, he could keep $21,000 each week before considering the cost of the drinks he prepared at home. Over 48 weeks, that was $1,008,000 in potential savings, minus the cost of preparing those drinks." },
  { p: "His friend Paula made a different decision. She spent money on a gaming subscription that she rarely used. She canceled it and kept the money for a course she wanted to take. Their choices were different, but both students examined whether their spending matched their priorities." },
  { h: "Savings create choices" },
  { p: "The teacher then explained that saving money can create future opportunities. A person might use savings to buy equipment, pay for education, prepare for an emergency or start a small business. Money saved today can give someone more choices tomorrow." },
  { p: "However, calculations need realistic assumptions. A person cannot assume that every peso saved will remain untouched for ten years. Income can change, emergencies happen, and prices rise. If savings earn interest, the balance may grow, but the result depends on the interest rate, fees and time." },
  { h: "Three plans" },
  { node: <MiniCase e="☕" who="Nicolás's three plans" lines={["Plan 1: continue buying his usual drinks", "Plan 2: prepare drinks at home three days a week", "Plan 3: reduce the habit AND move the money to a separate savings account ✅"]} /> },
  { p: "The third plan worked best for him because it combined a practical change with a clear destination for the money. He also decided to review his plan each month rather than assuming his spending would always stay the same." },
  { p: "At the end of the investigation, Nicolás understood that the lesson was not “never buy small things.” Small purchases can bring enjoyment and may sometimes be useful. The important question is whether a repeated expense is worth what it prevents us from doing." },
  { box: "A drink has a price. A habit has a pattern. And a pattern can have an opportunity cost that is much larger than it first appears." },
];
const GLOSS_14 = { "routine": "Rutina.", "pattern": "Patrón (algo que se repite).", "opportunity cost": "Costo de oportunidad: lo que dejas de hacer al elegir algo.", "alternative": "Alternativa / opción.", "potential savings": "Ahorro posible.", "priorities": "Prioridades.", "assumptions": "Supuestos.", "destination": "Destino." };
const Q_14 = [
  { q: "How much did Nicolás spend on a normal school day?", options: ["$11,000", "$7,000, because he only counted the drink and not the snack", "$55,000", "$1"], correct: 0, feedback: "$7,000 + $4,000 = $11,000." },
  { q: "How much did he spend per WEEK?", options: ["$55,000", "$220,000, which is the total for four weeks", "$11,000", "Nothing"], correct: 0, feedback: "$11,000 × 5 days." },
  { q: "Over 48 weeks, the habit reached…", options: ["$2,640,000", "$220,000, because he only multiplied the week by four", "$55,000", "A free coffee"], correct: 0, feedback: "$55,000 × 48." },
  { q: "Why didn't the purchases feel expensive?", options: ["He paid for them one at a time", "Because the café gave him a big discount every Friday afternoon", "They were free", "He never paid"], correct: 0, feedback: "Small payments hide the big pattern." },
  { q: "Opportunity cost is…", options: ["The best alternative you give up", "The price written on the receipt that you pay at the store", "The price", "A coffee recipe"], correct: 0, feedback: "It's what you DON'T get to do with that money." },
  { q: "What alternative did Nicolás find?", options: ["Drinks from home three days a week", "Stop going to the café forever and never buy any snack again", "Buy more drinks", "Change schools"], correct: 0, feedback: "He kept Fridays at the café." },
  { q: "Replacing three $7,000 drinks a week saves about… per week.", options: ["$21,000", "$55,000, which is everything he spends in a week", "$7,000", "$1,008"], correct: 0, feedback: "3 × $7,000 = $21,000." },
  { q: "What did Paula do?", options: ["Canceled a subscription she rarely used", "Bought a more expensive gaming subscription to play with her friends", "Played more games", "Opened a café"], correct: 0, feedback: "She kept the money for a course." },
  { q: "Why can't we assume savings stay untouched for ten years?", options: ["Income, emergencies and prices change", "Because banks close all savings accounts after five years by law", "Because of coffee", "Because of math"], correct: 0, feedback: "Realistic assumptions matter." },
  { q: "Which plan worked best for Nicolás?", options: ["Reduce the habit and save the difference", "Continue buying his usual drinks but feel a little guilty about it", "Plan 1", "Buy a café"], correct: 0, feedback: "A change + a clear destination for the money." },
  { q: "What is the main lesson?", options: ["Ask if a repeated expense is worth it", "Never buy small things because every purchase is a big financial mistake", "Never buy", "Drink water"], correct: 0, feedback: "It's not “never buy” — it's “is it worth it?”" },
  { q: "“A habit has a pattern” means…", options: ["It repeats again and again", "It happens only once a year on special occasions like birthdays", "It has a price", "It is a drink"], correct: 0, feedback: "Repetition = pattern." },
];

/* ---------- CLASE 16 · Why 10% Is Not Always 10% ---------- */
const READ_16 = [
  { sub: "An explainer about interest, rates and inflation" },
  { p: "Imagine that two banks offer savings products. Both advertisements use the number 10%, and both claim that customers can earn more money by saving with them. At first, the offers look identical. However, the meaning of the percentage depends on how the interest is calculated, how often it is paid and what costs apply." },
  { h: "What is interest?" },
  { p: "Interest is money paid for the use of money. When you save in an interest-bearing account, the financial institution may pay you interest according to the product's rules. When you borrow money, you usually pay interest to the lender." },
  { p: "An interest rate tells us how much interest is charged or earned in relation to an amount of money over a stated period. The period matters. A monthly rate and an annual rate are not directly interchangeable unless we know how they are defined." },
  { h: "EA: the effective annual rate" },
  { p: "In Colombia, savings products often advertise an effective annual rate, or EA. This rate represents the annual effect of interest under the stated compounding assumptions. It helps people compare products on a common annual basis." },
  { p: "Consider a simplified example. Suppose a savings product offers an effective annual rate of 10%. If you deposit $1,000,000 and leave it for one year, the balance before taxes, fees and other adjustments would be $1,100,000." },
  { p: "But what if you want to estimate the equivalent monthly rate? You cannot simply divide 10% by twelve and assume the result is exactly equivalent. With effective annual interest, the monthly equivalent is the rate that compounds to 10% over twelve months." },
  { box: "Monthly equivalent rate = (1 + annual rate)^(1/12) − 1 → for 10% EA ≈ 0.797% per month." },
  { p: "The monthly rate looks smaller, but it compounds over the year to produce the stated annual result." },
  { node: <MiniCase e="🧮" who="Step by step: 10% EA → monthly rate" lines={["1. Change the % to a decimal: 10% = 0.10", "2. Add 1: 1 + 0.10 = 1.10", "3. Take the 12th root (on a calculator: 1.10 ^ (1/12)) = 1.00797", "4. Subtract 1 and multiply by 100: 0.797% per month"]} /> },
  { h: "Compounding" },
  { p: "Compounding means that interest can be earned on previous interest as well as on the original deposit. If interest remains in the account, the balance can grow over time. If you withdraw the interest regularly, or if fees reduce the balance, the result will be different." },
  { h: "The inflation problem" },
  { p: "There is another important issue: inflation. Inflation describes a general increase in prices over time. If your savings balance grows by 10% in a year but the prices of the things you want to buy increase by 6%, your money has not gained 10% in purchasing power." },
  { p: "A simplified way to estimate the real rate is to subtract inflation from the nominal rate. In this example, 10% minus 6% gives an approximate real rate of 4%." },
  { box: "Real rate = (1 + nominal rate) ÷ (1 + inflation) − 1 → with 10% and 6% ≈ 3.77%." },
  { node: <MiniCase e="🧮" who="Step by step: the real rate" lines={["1. Decimals: rate 10% = 0.10 · inflation 6% = 0.06", "2. Add 1 to both: 1.10 and 1.06", "3. Divide: 1.10 ÷ 1.06 = 1.0377", "4. Subtract 1 and multiply by 100: 3.77%", "⚡ Quick estimate: 10 − 6 = 4%"]} /> },
  { p: "The difference is small in this example, but it can become more important when rates are higher." },
  { h: "Costs and access" },
  { p: "Fees and taxes may also affect the result. An account with a higher advertised rate may not always leave a customer with the most money after costs. Access matters, too. Some products allow withdrawals at any time, while others restrict access for a period." },
  { p: "A high rate can be attractive, but it is not the only factor that determines whether a financial product is suitable for a goal. A student saving for a school trip next month may value easy access to money. Someone saving for a goal several years away may consider different options." },
  { node: <MiniCase e="🔎" who="Three questions for any “10%” ad" lines={["1. Is the rate annual or monthly?", "2. What costs or restrictions apply?", "3. How much purchasing power will the money have after prices change?"]} /> },
  { p: "The number in the advertisement is only the beginning of the investigation." },
];
const GLOSS_16 = { "interest": "Interés: dinero que se paga por usar dinero.", "lender": "Prestamista.", "effective annual rate": "Tasa efectiva anual (EA).", "compounding": "Capitalización: ganar interés sobre el interés.", "purchasing power": "Poder adquisitivo.", "nominal rate": "Tasa nominal (la anunciada).", "real rate": "Tasa real (descontando inflación).", "fees": "Comisiones / costos." };
const Q_16 = [
  { q: "Interest is…", options: ["Money paid for the use of money", "Money the government gives to students who save every month", "A bank", "A tax on coffee"], correct: 0, feedback: "Savers can earn it; borrowers usually pay it." },
  { q: "What does EA mean?", options: ["Effective annual rate", "Extra amount, which is a monthly bonus paid by some banks", "Annual", "Easy app"], correct: 0, feedback: "It compares products on a yearly basis." },
  { q: "$1,000,000 at 10% EA for one year becomes…", options: ["$1,100,000", "$1,010,000, because you earn only 1% every year", "$1,000,000", "$10"], correct: 0, feedback: "Before taxes and fees." },
  { q: "Why can't you just divide 10% by 12?", options: ["The monthly rate must compound to 10%", "Because a year has 13 months in the official banking calendar", "Because 12 is big", "You can't divide"], correct: 0, feedback: "(1.10)^(1/12) − 1 ≈ 0.797%." },
  { q: "The monthly rate equivalent to 10% EA is about…", options: ["0.797%", "0.833%, which is exactly 10 divided by 12", "10%", "12%"], correct: 0, feedback: "Slightly less than 10 ÷ 12." },
  { q: "Compounding means…", options: ["Earning interest on interest", "Paying a fee every time you deposit money into your account", "Saving coins", "A loan"], correct: 0, feedback: "Interest + interest on previous interest." },
  { q: "Savings grow 10% but prices grow 6%. Your purchasing power grows…", options: ["Less than 10%", "Exactly 16%, because you add the two percentages together", "10%", "0%"], correct: 0, feedback: "About 3.77% — inflation eats part of it." },
  { q: "The EXACT real rate with 10% nominal and 6% inflation is about…", options: ["3.77%", "4%, which is only the simple approximation", "16%", "60%"], correct: 0, feedback: "1.10 ÷ 1.06 − 1 ≈ 3.77%." },
  { q: "What else can reduce your final balance?", options: ["Fees and taxes", "Having a higher interest rate than the other banks in the city", "Interest", "The weather"], correct: 0, feedback: "Advertised rate ≠ final amount." },
  { q: "Who might value easy access more than a high rate?", options: ["A student saving for a trip next month", "Someone saving for a goal many years away who never needs the money", "A bank", "A teacher"], correct: 0, feedback: "Short-term goals need liquidity." },
  { q: "Inflation is…", options: ["A general increase in prices", "A bonus that banks pay when you keep money for a long time", "A price", "A balloon"], correct: 0, feedback: "Prices go up over time." },
  { q: "A good question to ask about a “10%” ad:", options: ["Is the rate annual or monthly?", "Which famous person appears in the advertisement and how popular are they?", "Is it 10?", "What color is it?"], correct: 0, feedback: "Also ask about costs and inflation." },
];

/* ---------- CLASE 17 · The Fine Print Challenge ---------- */
const READ_17 = [
  { sub: "A financial investigation" },
  { p: "When Laura received money for her birthday, she decided to save it instead of spending it immediately. She had $500,000 and wanted to keep the money safe until she needed it for a school trip and a new tablet." },
  { p: "Her brother showed her three advertisements. One promised a high interest rate, another offered instant access to the money, and the third included a special savings feature in a mobile app." },
  { say: "“Just choose the one with the highest rate,” he said." },
  { p: "Laura was not convinced. She had learned that a financial product could look attractive in an advertisement but work differently once she read the conditions." },
  { h: "Option 1 · A savings account" },
  { p: "The first option was a savings account. It allowed the customer to deposit money and make withdrawals according to the account's rules. The advertised rate was not the only thing to consider. Laura needed to check whether the account charged fees, whether there was a minimum balance and how interest was calculated." },
  { h: "Option 2 · A digital savings pocket" },
  { p: "The second option was a digital savings pocket. It was a feature offered through a financial app that helped customers separate money for different goals. A pocket could make saving more organized, but its benefits depended on the institution and the product. Some pockets earned interest, while others simply separated money without providing a return." },
  { h: "Option 3 · A CDT" },
  { p: "The third option was a Certificado de Depósito a Término, or CDT. A CDT is a Colombian term deposit with conditions established when it is opened. It normally has a defined term and a rate under the contract. Unlike a savings account designed for regular access, a CDT may restrict access to the money until maturity." },
  { h: "Five questions" },
  { node: <MiniCase e="🔍" who="Laura's five questions" lines={["1. What interest rate does it offer?", "2. What fees apply?", "3. How much money do I need to open it?", "4. Can I withdraw the money when necessary?", "5. What protection applies if the institution fails?"]} /> },
  { p: "She discovered that liquidity was especially important. Liquidity means how easily an asset can be converted into available money without significant delay or loss. Money needed for an unexpected expense should not be placed somewhere that makes access difficult." },
  { p: "She also investigated deposit protection. In Colombia, Fogafín provides deposit insurance for eligible products at covered institutions, subject to the applicable conditions and limits. However, not every financial product is protected in the same way, and a customer should check whether the specific institution and product qualify." },
  { p: "Her research also raised questions about fees and taxes. An advertised interest rate may not represent the final amount the customer receives. Account charges, applicable taxes and transaction costs can affect the result." },
  { h: "🚩 The fourth advertisement" },
  { p: "Then she found a fourth advertisement. It promised a return of 10% every month with “no risk and guaranteed profits.” The company claimed that customers only needed to invite friends to earn more money." },
  { p: "Laura recognized the warning signs. An unusually high guaranteed return, pressure to act quickly and rewards that depend on recruiting other people can indicate a fraudulent scheme. A legitimate financial product should explain who offers it, how the return is generated, what risks exist and what conditions apply." },
  { p: "She did not send the company her money or personal information. Instead, she looked for information from official sources and decided not to trust an advertisement simply because it looked professional." },
  { h: "Laura's plan" },
  { p: "Finally, Laura made a plan. She kept the money she might need soon in an accessible place and considered whether a separate product would be appropriate for the part she could leave untouched. She understood that she did not need to choose one product for every financial goal." },
  { box: "The best savings product is not always the one with the highest advertised return. It is the one that fits the goal, offers understandable conditions and balances return, safety, costs and access." },
  { p: "Before opening an account, Laura would read the conditions, verify the institution and ask questions if anything was unclear. Saving money was important, but protecting it was part of the plan too." },
];
const GLOSS_17 = { "withdrawals": "Retiros.", "minimum balance": "Saldo mínimo.", "term deposit": "Depósito a término (CDT).", "maturity": "Vencimiento.", "liquidity": "Liquidez: qué tan fácil es tener el dinero disponible.", "deposit insurance": "Seguro de depósitos.", "fraudulent scheme": "Esquema fraudulento / estafa.", "fine print": "Letra pequeña." };
const Q_17 = [
  { q: "How much money did Laura want to save?", options: ["$500,000", "$5,000,000, because she wanted a tablet and a long trip", "$50,000", "A tablet"], correct: 0, feedback: "Birthday money: $500,000." },
  { q: "What did her brother tell her?", options: ["Choose the highest rate", "Read every condition carefully and ask the bank many questions before deciding", "Spend it all", "Buy a tablet"], correct: 0, feedback: "Laura was not convinced." },
  { q: "A digital savings pocket…", options: ["Separates money for goals in an app", "Always pays the highest interest rate in Colombia with no conditions at all", "Is a CDT", "Is a wallet"], correct: 0, feedback: "Some pay interest, some don't." },
  { q: "A CDT usually…", options: ["Restricts access until maturity", "Lets you withdraw money every day without any conditions or limits", "Has no rate", "Is a phone"], correct: 0, feedback: "Defined term, contract rate." },
  { q: "Liquidity means…", options: ["How easily you can get your money", "How much interest a product pays every single month after taxes", "Water", "Interest"], correct: 0, feedback: "Without delay or loss." },
  { q: "Money for emergencies should be…", options: ["Easy to access", "Locked in a long-term product with the highest possible interest rate", "Spent", "Invested in games"], correct: 0, feedback: "Emergencies don't wait." },
  { q: "In Colombia, Fogafín provides…", options: ["Deposit insurance for eligible products", "Free money to every person who opens a new account in a Colombian bank", "Loans", "Phones"], correct: 0, feedback: "With conditions and limits." },
  { q: "What were the warning signs of the fourth ad?", options: ["Guaranteed high returns and recruiting", "A professional website, a nice logo and photos of very happy customers", "Recruiting only", "Low prices"], correct: 0, feedback: "10% a month “guaranteed” + invite friends = 🚩." },
  { q: "What did Laura do with the suspicious offer?", options: ["She didn't send money or data", "She sent a small amount first to test if the company was real or not", "She invited friends", "She bought it"], correct: 0, feedback: "She checked official sources." },
  { q: "What was Laura's final plan?", options: ["Split the money by when she needs it", "Put all the money in the product with the highest advertised interest rate", "One product", "Buy the tablet now"], correct: 0, feedback: "Accessible money for soon + another option for the rest." },
  { q: "The best savings product is…", options: ["The one that fits the goal", "Always the one with the highest advertised return in the advertisement", "The cheapest", "The newest app"], correct: 0, feedback: "Return + safety + costs + access." },
  { q: "Before opening an account, Laura would…", options: ["Read conditions and verify the institution", "Ask her friends on social media which bank has the nicest colors and logo", "Sign quickly", "Buy a phone"], correct: 0, feedback: "Protecting money is part of the plan." },
];

/* ---------- CLASE 19 · World Saving Tour ---------- */
const READ_19 = [
  { sub: "Five places, five perspectives" },
  { p: "Saving money is a common financial goal, but people do not all save in the same way. Their choices can be influenced by family traditions, public services, income, access to financial institutions and the way communities organize their resources." },
  { p: "Our World Saving Tour visits five places to explore different approaches to saving. The examples are simplified educational scenarios, not descriptions of every person in each country." },
  { h: "🇯🇵 Japan: planning for tomorrow" },
  { p: "In Japan, a family might create separate plans for regular expenses, education, travel and future needs. Keeping a record of household spending can help people understand how much money is available after essential costs." },
  { p: "Imagine the Tanaka family planning for a holiday. Instead of waiting until the month before the trip, they estimate transportation, accommodation and food costs several months in advance. They transfer a planned amount into savings each month and review their budget when prices change." },
  { p: "Their approach demonstrates the value of planning ahead. However, families in Japan have different incomes, priorities and financial habits. There is no single Japanese way to save." },
  { h: "🇩🇪 Germany: understanding the household budget" },
  { p: "In Germany, as in many other countries, households may use savings accounts, bank transfers or other financial products to organize their money. The appropriate choice depends on the goal and the product's conditions." },
  { p: "Consider the Müller family. They want to replace an old washing machine next year. They compare prices, estimate the amount they need and set aside money regularly. They also keep some money accessible for unexpected expenses." },
  { p: "Their plan separates two purposes: preparing for a known purchase and protecting themselves against uncertainty." },
  { h: "🇨🇳 China: planning for family goals" },
  { p: "In China, as elsewhere, families have different saving habits and financial circumstances. Some may save for education, housing, retirement or family support. Others may have limited ability to save because everyday expenses use most of their income." },
  { p: "Imagine the Chen family planning for an educational course. They compare the cost of different programs and decide how much they can save without neglecting essential expenses. They also investigate whether scholarships or other forms of support are available." },
  { p: "Their example reminds us that saving is not simply a question of willpower. Income, prices, opportunities and family responsibilities all affect what people can do." },
  { h: "🇰🇪 Kenya: saving together" },
  { p: "In Kenya, some communities use group-based saving arrangements. One example is a rotating savings and credit association, often known as a ROSCA. Members contribute agreed amounts to a shared pool, and members receive the pooled amount in turn according to the group's rules." },
  { p: "Imagine a group of six market traders. Each person contributes 10,000 shillings every month. The group collects 60,000 shillings and gives that amount to one member. The next month, a different member receives the pooled contribution, until everyone has had a turn." },
  { node: <MiniTable head={["Month", "Everyone pays", "Pool", "Who receives"]} rows={[["1", "6 × 10,000", "60,000", "Member 1"], ["2", "6 × 10,000", "60,000", "Member 2"], ["…", "…", "…", "…"], ["6", "6 × 10,000", "60,000", "Member 6"]]} /> },
  { p: "This arrangement can help a member obtain a larger amount of money than they could save alone in one month. However, a rotating group does not automatically create extra money. Members still contribute their own funds. If someone fails to contribute, other members may be affected. Trust, clear records and agreed procedures are important." },
  { h: "🇨🇴 Colombia: the natillera" },
  { p: "In Colombia, a natillera is a familiar example of group saving, especially in some workplaces and communities. Members contribute money regularly and receive the accumulated amount at an agreed time, often near the end of the year." },
  { p: "Imagine a group of eight colleagues. Each contributes 50,000 pesos every month for ten months. If everyone pays on time and there are no fees or other changes, the group collects 400,000 pesos each month and 4,000,000 pesos over ten months." },
  { p: "The final amount can help members prepare for holiday expenses, buy something important or avoid relying entirely on expensive credit. A natillera is not automatically the same as a regulated bank account. Members should understand who holds the money, how contributions are recorded, when payouts occur and what happens if someone does not pay." },
  { h: "What can we learn from the tour?" },
  { p: "No method is perfect for every person. A group-saving arrangement may help someone follow a routine, but it depends on trust and reliable contributions. A savings account may offer convenient access, but its costs and conditions still matter. A long-term plan can support a future goal, but unexpected expenses may require adjustments." },
  { box: "The most useful lesson is not that one country saves better than another. People develop different strategies to respond to their circumstances." },
];
const GLOSS_19 = { "household": "Hogar.", "accommodation": "Alojamiento.", "willpower": "Fuerza de voluntad.", "pool": "Fondo común.", "contribute": "Aportar.", "natillera": "Ahorro grupal colombiano que se reparte en una fecha acordada.", "regulated": "Vigilado / regulado por el Estado.", "payouts": "Pagos / entregas del dinero." };
const Q_19 = [
  { q: "The examples in the article are…", options: ["Simplified educational scenarios", "Exact descriptions of how every person in each country manages money", "Statistics", "Recipes"], correct: 0, feedback: "Not every person in a country saves the same way." },
  { q: "What did the Tanaka family do?", options: ["Planned a holiday months ahead", "Waited until the last month and paid for the whole trip with a credit card", "Bought a car", "Moved to Germany"], correct: 0, feedback: "Planning ahead + reviewing the budget." },
  { q: "The Müller family separated…", options: ["A known purchase and money for surprises", "Their personal money and the money of their neighbors in the same building", "Two banks", "Shoes"], correct: 0, feedback: "Washing machine + accessible reserve." },
  { q: "The Chen family example shows that saving…", options: ["Isn't only about willpower", "Is only about willpower, because anyone can save if they really want to", "Is easy", "Is impossible"], correct: 0, feedback: "Income, prices and responsibilities matter." },
  { q: "What is a ROSCA?", options: ["A rotating savings and credit association", "A regular online savings and credit account offered by banks in Kenya", "A savings app", "A sport"], correct: 0, feedback: "Members take turns receiving the pool." },
  { q: "Six traders pay 10,000 shillings each per month. The pool is…", options: ["60,000 shillings", "10,000 shillings, because only one person receives it each month", "6,000", "100"], correct: 0, feedback: "6 × 10,000." },
  { q: "Does a rotating group create extra money?", options: ["No — members use their own money", "Yes, because the bank adds interest to the group every single month", "Yes", "Only in Kenya"], correct: 0, feedback: "It reorganizes money; it doesn't create it." },
  { q: "What happens if someone doesn't contribute?", options: ["Other members may be affected", "Nothing, because the group always has extra money for that situation", "They win", "It rains"], correct: 0, feedback: "That's why trust and records matter." },
  { q: "8 colleagues × 50,000 pesos × 10 months =", options: ["4,000,000 pesos", "400,000 pesos, which is only one month of the natillera", "500,000", "8"], correct: 0, feedback: "400,000 a month × 10." },
  { q: "A natillera is…", options: ["Not automatically a regulated account", "A regulated bank account protected by Fogafín like any savings product", "A bank", "A dessert"], correct: 0, feedback: "Ask who holds the money and how it's recorded." },
  { q: "What is important in group saving?", options: ["Trust and clear records", "Having a very big group of people that you don't know personally", "Money", "A leader"], correct: 0, feedback: "Plus agreed rules." },
  { q: "The main lesson of the tour:", options: ["People adapt to their circumstances", "One country saves better than all the others, so everyone should copy it", "Save more", "Travel more"], correct: 0, feedback: "Compare fairly and design your own plan." },
];

/* ---------- VIDEOS ---------- */
const VID_DG = "https://res.cloudinary.com/y9r84vgz/video/upload/v1792605368/videoplayback_20.mp4";
const VID_TIPS = "https://res.cloudinary.com/y9r84vgz/video/upload/v1792605433/videoplayback_21.mp4";
const VQ_13 = [
  { q: "What is a big advantage of learning to save as a teenager?", options: ["Building the habit before big adult bills", "Becoming a millionaire before graduating from high school with your allowance", "Saving coins", "Buying a fast sports car"], correct: 0, feedback: "Watch again at 00:05." },
  { q: "When is it a good age to start saving?", options: ["It's never too late — 13, 19 or in between", "Only after you turn 21 years old and start going to university", "Only at 18", "From birth only"], correct: 0, feedback: "Watch again at 00:20." },
  { q: "What is the very first step the video recommends?", options: ["Open a savings account", "Invest all your allowance in risky cryptocurrency tokens online", "Open a credit card", "Borrow money from a bank"], correct: 0, feedback: "Watch again at 00:34." },
  { q: "If you are under 18, how can you open a savings account?", options: ["A parent will probably help you", "With a written permission slip signed by your school principal", "Alone with your ID", "Pay a $500 fee"], correct: 0, feedback: "Watch again at 00:48." },
  { q: "What should you look for in a savings account?", options: ["High interest, no monthly fees, no minimum", "Free checkbooks and a complimentary credit card with a high spending limit", "Many branches", "Free snacks at the bank"], correct: 0, feedback: "Watch again at 00:55." },
  { q: "What is the second tip?", options: ["Set a clear, attainable target", "Spend your money immediately so you never have to worry about accounting", "Save without a target", "Avoid setting goals"], correct: 0, feedback: "Watch again at 01:23." },
  { q: "Which targets does the video suggest?", options: ["$1,000 for a trip or $2,000 for a car", "Saving $50,000 to buy a luxury apartment downtown before you turn 20", "Only $1,000", "Buying video games"], correct: 0, feedback: "Watch again at 01:30." },
  { q: "How can big amounts feel more manageable?", options: ["Divide them into weekly or monthly goals", "Keep all the cash hidden underneath your mattress at home for safety", "Ignore the total", "Spend half"], correct: 0, feedback: "Watch again at 01:38." },
  { q: "What does tip number three say?", options: ["Make a budget that puts savings first", "Rely on spontaneous spending without tracking any of your expenses", "Make a list of wants", "Stop working"], correct: 0, feedback: "Watch again at 01:53." },
  { q: "What is the hardest part of having a budget?", options: ["Sticking to it", "Finding a computer program complicated enough to calculate all the numbers", "Making it", "Printing spreadsheets"], correct: 0, feedback: "Watch again at 02:05." },
  { q: "What bad habit do people have when they need extra cash?", options: ["Skipping their regular savings", "Taking high-interest loans from dangerous loan sharks in the neighborhood", "Saving more", "Donating to charity"], correct: 0, feedback: "Watch again at 02:12." },
  { q: "What is tip number four about?", options: ["Spending less on things you already buy", "Earning a six-figure salary working full-time at a big corporate office", "Buying more", "Never buying clothes"], correct: 0, feedback: "Watch again at 02:24." },
  { q: "What does the video suggest instead of the movies?", options: ["A movie night at home — save the money", "Going to a luxury restaurant with all your friends instead of the cinema", "Two movies", "Sleeping all day"], correct: 0, feedback: "Watch again at 02:46." },
  { q: "Tip five: if you don't need something right away…", options: ["Wait 30 days before buying it", "Buy it immediately on credit before someone else buys it first", "Wait 30 minutes", "Forget about money"], correct: 0, feedback: "Watch again at 03:00." },
];

/* ---------- BOSS QUIZ · PERIODO 2 (se sortean 15 de 24) ---------- */
const BOSS_8P2 = [
  { q: "Delayed gratification means…", options: ["Waiting now to get something better later", "Buying everything immediately because the future is too far away to plan", "Waiting", "A dessert"], correct: 0, feedback: "Like the marshmallow test." },
  { q: "“It's only $2,000” is an example of…", options: ["A bias that hides small costs", "A smart plan that always helps you save more money every month", "Interest", "A goal"], correct: 0, feedback: "Small amounts add up." },
  { q: "A SMART goal must be…", options: ["Specific, measurable and time-bound", "Secret, magic and totally impossible, so it is more exciting to achieve", "Expensive", "Short"], correct: 0, feedback: "Plus achievable and relevant." },
  { q: "A laptop costs $1,000,000. With +10% inflation for one year it costs…", options: ["$1,100,000", "$1,010,000, because you add only 1% each year", "$1,000,000", "$10"], correct: 0, feedback: "1,000,000 × 1.10." },
  { q: "“Pay yourself first” means…", options: ["Save before you spend", "Buy yourself a gift first every month and save what is left at the end", "Pay bills", "Pay friends"], correct: 0, feedback: "Savings come first." },
  { q: "The 52-week challenge needs…", options: ["Contributions that grow every week", "Exactly the same amount of money every week of the year with no changes", "One payment", "No money"], correct: 0, feedback: "Harder at the end of the year." },
  { q: "Round-up saving keeps…", options: ["The difference to a round number", "All of the money that you spend at the store on that same day", "Coins", "Receipts"], correct: 0, feedback: "Spend $3,600 → save $400." },
  { q: "$5,000 a day × 5 days × 48 weeks =", options: ["$1,200,000", "$240,000, because you only multiply by forty-eight", "$25,000", "$5,000"], correct: 0, feedback: "25,000 × 48." },
  { q: "Opportunity cost is…", options: ["The best alternative you give up", "The price on the receipt that you pay at the store for a product", "A discount", "A bank fee"], correct: 0, feedback: "What else that money could do." },
  { q: "An emergency fund is for…", options: ["Unexpected necessary expenses", "Offers and discounts that appear suddenly on social media", "Gifts", "Concerts"], correct: 0, feedback: "Not for any shopping temptation." },
  { q: "Without an emergency fund, a surprise often becomes…", options: ["Debt with interest", "A free gift from the bank because it was not your fault", "Savings", "Nothing"], correct: 0, feedback: "Borrowing costs money." },
  { q: "A common emergency-fund reference is…", options: ["3–6 months of essential expenses", "Exactly one week of all your expenses, including entertainment and gifts", "10 years", "$0"], correct: 0, feedback: "Built step by step." },
  { q: "10% EA is about … per month.", options: ["0.797%", "0.833%, which is ten divided by twelve", "10%", "1.2%"], correct: 0, feedback: "(1.10)^(1/12) − 1." },
  { q: "Savings grow 8% and inflation is 8%. Your real gain is about…", options: ["0%", "16%, because you add the two numbers together", "8%", "100%"], correct: 0, feedback: "Purchasing power stays the same." },
  { q: "Liquidity means…", options: ["How easily you can get your money", "How much interest you earn after taxes in a full year", "Water", "Profit"], correct: 0, feedback: "Emergency money needs liquidity." },
  { q: "A CDT usually…", options: ["Has a fixed term", "Lets you take out money every day without any conditions or limits", "Has no rate", "Is a credit card"], correct: 0, feedback: "Access may be restricted until maturity." },
  { q: "“10% every month, guaranteed, invite friends” is probably…", options: ["A fraudulent scheme", "A normal savings account from a regulated bank in your city", "A CDT", "A tax"], correct: 0, feedback: "Huge guaranteed returns + recruiting = 🚩." },
  { q: "Bootstrapping means…", options: ["Starting a business with your own money", "Borrowing as much money as possible to grow very fast from day one", "Buying boots", "Selling shoes"], correct: 0, feedback: "Start small, grow with your profits." },
  { q: "A $1,000,000 loan at 2% a month for 12 months…", options: ["Costs more than $1,000,000 in total", "Costs exactly $1,000,000, because interest is only paid at the end of the year", "Is free", "Costs $2"], correct: 0, feedback: "Interest is the price of borrowing." },
  { q: "An MVP for a new business is…", options: ["The simplest version to start", "The most expensive and complete version with every possible feature", "A sports award", "A loan"], correct: 0, feedback: "Minimum viable product." },
  { q: "A ROSCA or natillera…", options: ["Doesn't create extra money", "Creates extra money because the group multiplies the contributions", "Is a bank", "Is a game"], correct: 0, feedback: "Members contribute their own money." },
  { q: "6 members × $50,000 = monthly pool of…", options: ["$300,000", "$50,000, because only one person receives it", "$56,000", "$6"], correct: 0, feedback: "6 × 50,000." },
  { q: "The best savings product is…", options: ["The one that fits your goal", "Always the one with the highest number in the advertisement", "The newest", "The cheapest"], correct: 0, feedback: "Return, safety, costs and access." },
  { q: "If your plan needs $100,000 a month but your budget allows $50,000, you should…", options: ["Adjust the date or the goal", "Ignore it and hope the money appears at the end of the year", "Give up", "Borrow from a scam"], correct: 0, feedback: "Make it make sense!" },
];

/* =====================================================================
   CLASE 11 · THE BRAIN VS. THE WALLET
   ===================================================================== */
const START_11 = {
  cards: [
    { e: "🐷", t: "Saving", d: "Keeping part of your money today to use it later for something important.", ex: "$10,000 a week for a bike." },
    { e: "⚡", t: "Impulse buying", d: "Buying fast, without a plan, because of an emotion or an offer.", ex: "“Only 10 minutes left!” → buy." },
    { e: "😋", t: "Instant gratification", d: "Wanting the reward NOW, even if it's smaller.", ex: "One snack now." },
    { e: "⏳", t: "Delayed gratification", d: "Waiting to get something better later.", ex: "Wait → two snacks later." },
    { e: "🧠", t: "Bias", d: "A mental shortcut that can push us to make a bad decision.", ex: "“It's only $2,000…”" },
    { e: "🚀", t: "Future you", d: "The person you will be in some months or years. Saving is a gift to future you.", ex: "Future you rides that bike!" },
  ],
  pairs: [
    { a: "Saving", b: "Keeping money for later" }, { a: "Impulse buying", b: "Buying fast without a plan" },
    { a: "Instant gratification", b: "Wanting the reward now" }, { a: "Delayed gratification", b: "Waiting for something better" },
    { a: "Bias", b: "A mental shortcut that can trick you" }, { a: "Future you", b: "You, months or years from now" },
  ],
};

/* ---------- THE MARSHMALLOW TEST (real, con cronómetro) ---------- */
const TREATS = [["🍬", "marshmallow"], ["🍪", "cookie"], ["🍫", "chocolate"]];
const TEMPT = [[8, "👀 Look at it… it looks soooo good."], [17, "📱 Friend: “Just eat it, nobody will know!”"], [27, "😋 Mmm… can you smell it?"], [37, "⏰ “Last chance!” (Is it really?)"], [47, "🤤 Your stomach is making noises…"], [55, "🔥 Almost there… or eat it now?"]];
const WAIT_S = 60;
const MONEY_WAIT = [
  { now: 10000, later: 11000, when: "in 1 week", note: "That's +10% in only one week — a great reason to wait!" },
  { now: 50000, later: 51000, when: "in 1 year", note: "Only +2% in a whole year. Prices may grow more than that — waiting is not always worth it!" },
  { now: 100000, later: 200000, when: "in 1 month", note: "Double in a month! (In real life, offers like this are rare — and sometimes scams.)" },
  { now: 80000, nowL: "a concert ticket today", later: 80000, laterL: "$80,000 closer to your bike goal", when: "in 3 months", note: "Same money, different value. Which one matters more to you? There's no single right answer." },
];
function MarshmallowTest({ resp, onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [treat, setTreat] = useState(0);
  const [sec, setSec] = useState(0);
  const [ate, setAte] = useState(null);
  const [cover, setCover] = useState(false);
  const [song, setSong] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const [popped, setPopped] = useState(0);
  const [used, setUsed] = useState({});
  const [mw, setMw] = useState({});
  const [st, finish] = useFinish(onSave);
  const guess = resp?.c11_video?.predict;
  useEffect(() => {
    if (stage !== 1) return undefined;
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [stage]);
  useEffect(() => { if (stage === 1 && sec >= WAIT_S) setStage(2); }, [sec, stage]);
  const msg = [...TEMPT].reverse().find(([t]) => sec >= t);
  const tool = (k) => setUsed((u) => ({ ...u, [k]: true }));
  const spawn = () => { tool("bubbles"); setBubbles(Array.from({ length: 8 }, (_, i) => ({ id: Date.now() + i, x: 6 + Math.random() * 84, y: 8 + Math.random() * 70, s: 34 + Math.random() * 26 }))); };
  const pop = (id) => { setPopped((p) => p + 1); setBubbles((b) => b.filter((x) => x.id !== id).concat([{ id: Date.now(), x: 6 + Math.random() * 84, y: 8 + Math.random() * 70, s: 34 + Math.random() * 26 }])); };
  const eat = () => { setAte(sec); setStage(2); };
  const waited = ate === null ? WAIT_S : ate;
  const success = ate === null;
  const restart = () => { setSec(0); setAte(null); setCover(false); setSong(false); setBubbles([]); setPopped(0); setUsed({}); setStage(1); };
  const T = TREATS[treat];
  const allMoney = MONEY_WAIT.every((_, i) => mw[i]);
  if (st.done) return <Reward title={success ? `You waited! ${T[0]}${T[0]}` : "Experiment complete!"} subtitle={`You waited ${waited} seconds. Now you know your “waiting power”.`} coins={st.coins} saving={st.saving} onExit={onExit} gold={success} />;
  return (
    <ActShell icon={<Timer size={22} strokeWidth={2.1} />} title="The Marshmallow Test 🍬⏳" subtitle="Can YOU wait? Let's find out — for real." onExit={onExit}>
      <div className="g72-steps">{["1 · The rules", "2 · The test", "3 · Results", "4 · Money version"].map((s, i) => <span key={s} className={stage === i ? "on" : stage > i ? "done" : ""}>{s}</span>)}</div>
      {stage === 0 && (
        <>
          <Mission e="🧪" title="A famous experiment from Stanford University">In the 1960s and 70s, researcher Walter Mischel offered children one marshmallow NOW — or TWO if they could wait alone for some minutes. Some ate it in seconds. Others waited… using clever tricks. Today, YOU are the child.</Mission>
          <div className="start-block">
            <h3>1 · Choose your treat</h3>
            <div className="g8-pick">{TREATS.map(([e, l], k) => <button key={l} type="button" className={treat === k ? "on" : ""} onClick={() => setTreat(k)}><em>{e}</em><b>{l}</b>{treat === k && <i>✓</i>}</button>)}</div>
            <h3>2 · The rules</h3>
            <div className="g82-rules"><div><em>{T[0]}</em><b>Eat it now</b><span>You get 1 {T[1]}.</span></div><div className="or">OR</div><div><em>{T[0]}{T[0]}</em><b>Wait {WAIT_S} seconds</b><span>You get 2 {T[1]}s.</span></div></div>
            <p className="start-tip">💡 During the test you can use <b>tricks</b>: cover the treat, sing a song or pop bubbles. Researchers found that children who distracted themselves waited longer!</p>
          </div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={restart}><Play size={16} /> Start the test</button></div>
        </>
      )}
      {stage === 1 && (
        <div className="g82-marsh">
          <div className="g82-ring" style={{ "--p": `${(sec / WAIT_S) * 100}%` }}><b>{WAIT_S - sec}</b><small>seconds</small></div>
          <div className={`g82-plate ${cover ? "covered" : ""}`} style={{ "--wob": `${Math.min(1 + sec / 40, 2.4)}` }}>
            {cover ? <span className="g82-napkin">🧻</span> : <span className="g82-treat">{T[0]}</span>}
            {song && <span className="g82-song">🎵 la la la… 🎶</span>}
            {bubbles.map((b) => <button key={b.id} type="button" className="g82-bubble" style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.s, height: b.s }} onClick={() => pop(b.id)} aria-label="pop" />)}
          </div>
          {msg && <div className="g82-tempt" key={msg[0]}>{msg[1]}</div>}
          <div className="g82-tools">
            <button type="button" className={cover ? "on" : ""} onClick={() => { setCover(!cover); tool("cover"); }}>🙈 {cover ? "Uncover" : "Cover it"}</button>
            <button type="button" className={song ? "on" : ""} onClick={() => { setSong(!song); tool("song"); }}>🎵 Sing a song</button>
            <button type="button" onClick={spawn}>🫧 Pop bubbles {popped ? `(${popped})` : ""}</button>
          </div>
          <button type="button" className="g82-eat" style={{ transform: `scale(${1 + Math.min(sec, 55) / 110})` }} onClick={eat}>EAT IT NOW {T[0]}</button>
        </div>
      )}
      {stage === 2 && (
        <>
          <div className={`g73-score ${success ? "" : ""}`}><small>{success ? "YOU WAITED!" : "YOU ATE IT AT…"}</small><b className={success ? "good" : "bad"}>{waited}s</b><span>{success ? `You get ${T[0]}${T[0]} — double reward!` : `You got ${T[0]}. That's OK — now you know how strong the “now” feeling is.`}{guess !== undefined && guess !== null ? ` · Your prediction: ${["10 seconds", "30 seconds", "60 seconds"][guess]}.` : ""}</span></div>
          <div className="start-block">
            <h3>🧠 What does science say?</h3>
            <div className="g8-cards three">
              <div className="g8-card open"><em>🙈</em><b>Out of sight</b><p>Children who covered the treat or looked away waited longer.</p></div>
              <div className="g8-card open"><em>🎵</em><b>Distraction</b><p>Singing, playing or thinking about something else made waiting easier.</p></div>
              <div className="g8-card open"><em>🖼️</em><b>Think differently</b><p>Imagining the treat as a “picture” — not as food — reduced the temptation.</p></div>
            </div>
            <p className="start-tip">Tricks you used: <b>{Object.keys(used).length ? Object.keys(used).map((k) => ({ cover: "🙈 cover", song: "🎵 song", bubbles: "🫧 bubbles" })[k]).join(" · ") : "none"}</b>. Money works the same way: an automatic transfer, a separate pocket or a picture of your goal are “tricks” that protect your savings.</p>
          </div>
          <div className="start-foot"><button className="s1-btn ghost" onClick={restart}><RefreshCw size={15} /> Try again</button><button className="s1-btn primary big" onClick={() => setStage(3)}>The money version <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 3 && (
        <>
          <HowTo>Four real-life choices. Choose <b>NOW</b> or <b>LATER</b>. Then read the tip: waiting is smart when the reward is <b>really</b> bigger — not always!</HowTo>
          {MONEY_WAIT.map((m, i) => (
            <div key={i} className="g82-nowlater">
              <small>CHOICE {i + 1}</small>
              <div>
                <button type="button" className={mw[i] === "now" ? "on" : ""} onClick={() => setMw({ ...mw, [i]: "now" })}><em>😋 NOW</em><b>{m.nowL || cop(m.now)}</b><span>today</span></button>
                <button type="button" className={mw[i] === "later" ? "on" : ""} onClick={() => setMw({ ...mw, [i]: "later" })}><em>⏳ LATER</em><b>{m.laterL || cop(m.later)}</b><span>{m.when}</span></button>
              </div>
              {mw[i] && <p>{m.later !== m.now && !m.laterL ? `Waiting = +${cop(m.later - m.now)} (+${Math.round(((m.later - m.now) / m.now) * 100)}%). ` : ""}{m.note}</p>}
            </div>
          ))}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!allMoney} onClick={() => finish(success ? 30 : 24, { seconds: waited, success, treat: T[1], strategies: Object.keys(used), popped, money: mw })}>Save my results <span className="coin-tag"><Coins size={15} /> +{success ? 30 : 24}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- TEMPTATION LAB · Present You vs. Future You ---------- */
const GOAL11 = 600000;
const TL_SCEN = [
  { e: "👟", t: "Your favorite sneakers are 30% OFF — but only for the next 10 minutes!", timer: 10, opts: [{ t: "Buy them before the offer ends ($140,000)", p: 22, m: -140000, smart: false }, { t: "Check my goal and compare prices first", p: -4, m: 0, smart: true }], bias: "Urgency / FOMO", why: "A countdown makes your brain feel you will LOSE something. Real good deals usually come back.", tip: "Wait 24 hours before buying anything with a countdown." },
  { e: "🍕", t: "Your friends go to an expensive restaurant every Friday. Tonight is $45,000.", opts: [{ t: "Go — I don't want to miss out", p: 18, m: -45000, smart: false }, { t: "Suggest a cheaper plan: movie night at home ($10,000)", p: 10, m: -10000, smart: true }], bias: "Social pressure", why: "We copy what our group does — even when it doesn't fit our budget.", tip: "Suggest a cheaper plan. Real friends say yes!" },
  { e: "🪙", t: "Game coins: “It's only $2,000!” You buy them almost every day.", opts: [{ t: "Buy them again — it's only a little", p: 12, m: -40000, smart: false }, { t: "Skip them this month", p: -6, m: 0, smart: true }], bias: "“It's only a little”", why: "$2,000 × 20 days = $40,000. Small amounts hide big totals.", tip: "Multiply small purchases by 20 days before you decide." },
  { e: "🍫", t: "“Buy 2, get 1 FREE!” — snacks you don't really need. 3 snacks = $16,000.", opts: [{ t: "Great deal! Buy 3", p: 14, m: -16000, smart: false }, { t: "Buy only the 1 I need ($8,000)", p: 6, m: -8000, smart: true }], bias: "Fake discount", why: "A “discount” on something you didn't need is not saving — it's spending.", tip: "Ask: would I buy this at full price?" },
  { e: "🛍️", t: "You already spent $50,000 at the mall today. Now you see a hoodie for $60,000.", opts: [{ t: "I already spent a lot… one more doesn't matter", p: 15, m: -60000, smart: false }, { t: "Stop here and go home", p: -4, m: 0, smart: true }], bias: "“What-the-hell” effect", why: "After breaking our plan once, we feel the day is “lost” and spend even more.", tip: "One mistake is not a reason for a second one." },
  { e: "📱", t: "Sunday, 9 p.m. You're bored, scrolling… an ad for a gadget appears ($35,000).", opts: [{ t: "Buy it — it looks fun", p: 16, m: -35000, smart: false }, { t: "Close the app and do something free", p: 4, m: 0, smart: true }], bias: "Boredom buying", why: "When we feel bored or sad, buying gives a short happy feeling — not a long one.", tip: "Bored? Move, call a friend, play — don't shop." },
  { e: "🐷", t: "You save $5,000 a week, but it feels useless. “It's too small to matter.”", opts: [{ t: "Stop saving — it's too little", p: 6, m: -200000, smart: false }, { t: "Keep saving $5,000 a week", p: -2, m: 200000, smart: true }], bias: "“Small savings don't matter”", why: "$5,000 × 40 weeks = $200,000. Small + regular = big.", tip: "Track your total, not just this week." },
  { e: "🎁", t: "Grandma gives you $100,000 for your birthday!", opts: [{ t: "Free money! Spend it all on games", p: 25, m: 0, smart: false }, { t: "Save 70%, enjoy 30%", p: 12, m: 70000, smart: true }], bias: "“Free money” (gift money)", why: "Gift money feels like “play money”, but it has the same value as money you earn.", tip: "Split gifts: a part for fun, a part for your goal." },
];
function TemptationLab({ onSave, onExit }) {
  const [i, setI] = useState(-1);
  const [present, setPresent] = useState(50);
  const [money, setMoney] = useState(200000);
  const [res, setRes] = useState([]);
  const [shown, setShown] = useState(null);
  const [left, setLeft] = useState(null);
  const [st, finish] = useFinish(onSave);
  const s = TL_SCEN[i];
  useEffect(() => {
    if (i < 0 || !s || !s.timer || shown) return undefined;
    setLeft(s.timer);
    const t = setInterval(() => setLeft((x) => (x > 0 ? x - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (s && s.timer && left === 0 && !shown) choose(-1); }, [left]); // eslint-disable-line react-hooks/exhaustive-deps
  const choose = (k) => {
    if (shown) return;
    const o = k >= 0 ? s.opts[k] : { t: "You didn't decide — the offer expired", p: -2, m: 0, smart: true, expired: true };
    setPresent((p) => clamp(p + o.p, 0, 100)); setMoney((m) => Math.max(0, m + o.m));
    setRes((r) => [...r, { k, smart: o.smart, bias: s.bias }]); setShown(o);
  };
  const next = () => { setShown(null); setLeft(null); setI(i + 1); };
  const smartN = res.filter((r) => r.smart).length;
  const fell = res.filter((r) => !r.smart).map((r) => r.bias);
  const profile = smartN >= 7 ? "Future Builder 🚀" : smartN >= 4 ? "Balanced Planner ⚖️" : "Present Lover 😋";
  const futurePct = Math.round((money / GOAL11) * 100);
  if (st.done) return <Reward title={`You are a ${profile}`} subtitle={`${smartN}/8 smart decisions · goal progress ${futurePct}%`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Brain size={22} strokeWidth={2.1} />} title="Temptation Lab 🧪" subtitle="Brain vs. Future You · 8 real temptations." onExit={onExit}>
      {i < 0 ? (
        <>
          <Mission e="🚲" title="Your goal: a $600,000 bicycle. You already have $200,000.">Eight temptations are coming. Every decision changes two meters: <b>Present You</b> (how happy you feel now) and <b>Future You</b> (your bike money). After each choice, the lab reveals the <b>bias</b> that was trying to trick you.</Mission>
          <TwoMeters a={present} b={futurePct} la="Present You" lb="Future You (goal %)" />
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => setI(0)}><Play size={16} /> Enter the lab</button></div>
        </>
      ) : i < TL_SCEN.length ? (
        <>
          <div className="p1-match-stats"><span>Experiment <b>{i + 1}/8</b></span><span>🚲 Bike money: <b>{cop(money)}</b> / {cop(GOAL11)}</span></div>
          <TwoMeters a={present} b={futurePct} la="Present You" lb="Future You (goal %)" />
          <div className={`g82-scene ${shown ? "done" : ""}`} key={i}>
            <em>{s.e}</em><b>{s.t}</b>
            {s.timer && !shown && <span className="g82-count">⏱️ {left ?? s.timer}s</span>}
          </div>
          {!shown ? (
            <div className="g82-choices">{s.opts.map((o, k) => <button key={k} type="button" onClick={() => choose(k)}>{String.fromCharCode(65 + k)}. {o.t}</button>)}</div>
          ) : (
            <div className={`g82-bias ${shown.smart ? "good" : "bad"}`}>
              <small>{shown.expired ? "⏰ TIME'S UP — AND NOTHING BAD HAPPENED!" : shown.smart ? "🚀 FUTURE YOU SAYS THANK YOU" : "😋 THE BIAS WON THIS TIME"}</small>
              <b>🧠 Bias: {s.bias}</b>
              <p>{s.why}</p>
              <span>💡 {s.tip}</span>
              <i>{shown.m !== 0 ? `Bike money ${shown.m > 0 ? "+" : "−"}${cop(Math.abs(shown.m))}` : "Bike money: no change"} · Present You {shown.p >= 0 ? "+" : ""}{shown.p}</i>
            </div>
          )}
          {shown && <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{i === TL_SCEN.length - 1 ? "See my profile" : "Next temptation"} <ChevronRight size={18} /></button></div>}
        </>
      ) : (
        <>
          <div className="g73-score"><small>MY PROFILE</small><b className={smartN >= 4 ? "good" : "bad"}>{profile}</b><span>{smartN}/8 smart decisions · Bike money {cop(money)} ({futurePct}%)</span></div>
          <TwoMeters a={present} b={futurePct} la="Present You" lb="Future You (goal %)" />
          {fell.length > 0 && <div className="start-block"><h3>🧠 The biases that tricked you</h3><div className="g74-chips">{fell.map((b) => <button key={b} type="button" className="on">{b}</button>)}</div><p className="start-tip">Remember them — you will use them in your Portfolio page 01.</p></div>}
          <p className="start-tip">⚖️ Notice: the smart choices did NOT make Present You sad forever. A good plan includes some fun!</p>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(14 + smartN * 2, { smart: smartN, fell, profile, money, present })}>Save my lab results <span className="coin-tag"><Coins size={15} /> +{14 + smartN * 2}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

const RUSH_IMPULSE = {
  buckets: [{ id: "trap", e: "⚡", l: "Impulse trap", d: "A bias is pushing you to spend now.", c: "#ff6b57" }, { id: "smart", e: "🧠", l: "Smart move", d: "It protects Future You.", c: "#0b7a50" }],
  items: [
    { e: "⏰", t: "“Only 5 minutes left!” — you buy without checking", b: "trap", why: "Urgency pressure." }, { e: "📝", t: "You add it to a wish list and decide tomorrow", b: "smart", why: "The 24-hour rule." },
    { e: "👯", t: "Everybody has it, so you buy it too", b: "trap", why: "Social pressure." }, { e: "🔁", t: "Automatic transfer to savings on payday", b: "smart", why: "Saving first — no willpower needed." },
    { e: "🪙", t: "“It's only $1,500” — for the tenth time this week", b: "trap", why: "Small amounts add up." }, { e: "🙈", t: "You unfollow stores that make you want to buy", b: "smart", why: "Out of sight, out of mind." },
    { e: "😢", t: "You feel sad, so you buy something to feel better", b: "trap", why: "Emotional buying." }, { e: "🖼️", t: "You put a photo of your goal as your phone wallpaper", b: "smart", why: "It keeps Future You visible." },
    { e: "🎁", t: "You spend all your birthday money in one day", b: "trap", why: "“Free money” feels like play money." }, { e: "⚖️", t: "You compare prices in 3 stores before buying", b: "smart", why: "Informed decision." },
    { e: "🛍️", t: "“I already spent a lot today… one more thing”", b: "trap", why: "The what-the-hell effect." }, { e: "🍿", t: "Movie night at home instead of the cinema — you save the difference", b: "smart", why: "Same fun, lower cost." },
    { e: "🏷️", t: "Buy 3 because it's “2 + 1 free” (you needed 1)", b: "trap", why: "A discount on something you don't need is spending." }, { e: "🐷", t: "You keep saving $5,000 a week, even if it feels small", b: "smart", why: "Small + regular = big." },
  ],
};

/* ---------- PORTFOLIO 01 · MY MONEY PERSONALITY ---------- */
const TRIGGERS = ["⏰ Countdown offers", "👯 What my friends do", "🪙 “It's only a little”", "🏷️ Discounts", "🛍️ After I already spent", "📱 Boredom / scrolling", "😢 Emotions", "🎁 Gift money"];
function MoneyPersonality({ resp, existing, onSave, onExit }) {
  const lab = resp?.c11_lab, marsh = resp?.c11_marsh;
  const [trig, setTrig] = useState(existing?.triggers || []);
  const [habit, setHabit] = useState(existing?.habit || "");
  const [txt, setTxt] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const G = [W_REASON, W_PLAN];
  const ready = trig.length === 2 && countWords(habit) >= 3 && realText(habit) && goalsOk(txt, 25, 90, G);
  if (st.done) return <Reward title="Page 01 ready! 🧠" subtitle="You know your money brain better now." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Brain size={22} strokeWidth={2.1} />} title="My Money Personality 🧠" subtitle="Know your brain → protect your goal." onExit={onExit}>
      <PFBadge n="01" />
      <div className="g8-diag">
        <div><small>Temptation Lab</small><b>{lab ? lab.profile : "Not played yet"}</b></div>
        <div><small>Marshmallow test</small><b>{marsh ? `${marsh.seconds}s ${marsh.success ? "✅" : ""}` : "Not played yet"}</b></div>
        <div><small>Smart decisions</small><b>{lab ? `${lab.smart}/8` : "—"}</b></div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">1</span> Choose the 2 situations that influence YOU the most</h3>
        <div className="g74-chips">{TRIGGERS.map((t) => <button key={t} type="button" className={trig.includes(t) ? "on" : ""} disabled={!trig.includes(t) && trig.length >= 2} onClick={() => setTrig(trig.includes(t) ? trig.filter((x) => x !== t) : [...trig, t])}>{trig.includes(t) ? "✓ " : ""}{t}</button>)}</div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> One money habit I want to improve</h3>
        <input className="start-input" value={habit} onChange={(e) => setHabit(e.target.value)} placeholder="Write your answer here…" />
      </div>
      <div className="start-block">
        <h3><span className="step-n">3</span> My strategy to protect my goal</h3>
        <Starters items={["When I see", "I usually", "because", "From now on, I will", "Next time,"]} onPick={appendStarter(setTxt)} />
        <WordField value={txt} onChange={setTxt} min={25} max={90} rows={4} goals={G} placeholder="Write your strategy here…" />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(25, { triggers: trig, habit, text: txt, profile: lab?.profile, seconds: marsh?.seconds })}>Save page 01 <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 12 · THE FUTURE PRICE OF A DREAM
   ===================================================================== */
const START_12 = {
  cards: [
    { e: "⚡", t: "Short-term goal", d: "A goal for less than 1 year.", ex: "A school trip in 4 months." },
    { e: "🧭", t: "Medium-term goal", d: "A goal for 1 to 3 years.", ex: "A laptop in 2 years." },
    { e: "🏔️", t: "Long-term goal", d: "A goal for more than 3 years.", ex: "A university fund in 6 years." },
    { e: "🎯", t: "SMART goal", d: "Specific, Measurable, Achievable, Relevant, Time-bound.", ex: "$50,000 a month for 6 months for a helmet." },
    { e: "📅", t: "Deadline", d: "The date when you want to reach your goal.", ex: "December 15th." },
    { e: "🎈", t: "Inflation", d: "When prices go up over time. Your goal can become more expensive!", ex: "$1,800,000 → $1,890,000 in a year (+5%)." },
    { e: "🪜", t: "Milestone", d: "A small step inside a big goal.", ex: "First $100,000 ✓" },
  ],
  rounds: [
    { tag: "QUICK 1", q: "Saving for a phone in 14 months is a…", options: ["Medium-term goal", "Short-term goal", "Long-term goal"], correct: 0, explain: "14 months = between 1 and 3 years." },
    { tag: "QUICK 2", q: "A $1,000,000 bike with +10% inflation for one year will cost…", answer: 1100000, money: true, hint: "1,000,000 × 1.10", explain: "$1,100,000." },
    { tag: "QUICK 3", q: "Which goal is SMART?", options: ["$30,000 a week for 10 weeks for a jacket", "I want to save a lot of money someday for many nice things", "Be rich"], correct: 0, explain: "Amount + time + purpose." },
    { tag: "QUICK 4", q: "$600,000 in 6 months. How much per month?", answer: 100000, money: true, hint: "600,000 ÷ 6", explain: "$100,000 a month." },
  ],
};
const GOALS12 = [
  { e: "🎁", t: "Buy a birthday gift next month", b: "s" }, { e: "🚲", t: "Save for a bicycle in 8 months", b: "s" }, { e: "💻", t: "Save for a laptop in 2 years", b: "m" },
  { e: "🎓", t: "Build a university fund over 6 years", b: "l" }, { e: "🎒", t: "Save for a school trip in 4 months", b: "s" }, { e: "📚", t: "Pay for a professional course in 18 months", b: "m" },
  { e: "🚗", t: "Save for a first car in 5 years", b: "l" }, { e: "📱", t: "Buy a new phone in 14 months", b: "m" }, { e: "🏠", t: "Help your family with a house in 10 years", b: "l" },
];
const HZ = { s: ["⚡", "Short", "< 1 year"], m: ["🧭", "Medium", "1–3 years"], l: ["🏔️", "Long", "> 3 years"] };
const DREAMS = [["💻", "Laptop", 1800000], ["🚲", "Bicycle", 900000], ["📱", "Phone", 1200000], ["🎓", "Course", 2500000], ["✈️", "Trip", 3000000]];
const fut = (p, r, y) => Math.round(p * Math.pow(1 + r / 100, y));
function GoalTimeline({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [ans, setAns] = useState({});
  const [checked, setChecked] = useState(false);
  const [di, setDi] = useState(0);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(2);
  const [st, finish] = useFinish(onSave);
  const okN = GOALS12.filter((g, i) => ans[i] === g.b).length;
  const D = DREAMS[di];
  const prices = Array.from({ length: years + 1 }, (_, y) => fut(D[2], rate, y));
  const fp = prices[years];
  const perMonthToday = Math.round(D[2] / (years * 12));
  const perMonthFut = Math.round(fp / (years * 12));
  const priceChart = <><LineChart series={[{ name: "Price", values: prices, color: "#e07a2f" }]} labels={prices.map((_, y) => (y === 0 ? "Today" : `Year ${y}`))} height={200} /><p className="start-tip p1-center">{D[0]} {D[1]} · inflation {rate}% a year</p></>;
  const R12 = [
    { tag: "TIME MACHINE 1", q: "A laptop costs $1,800,000 today. With +5% a year, how much in ONE year?", visual: <MiniTable head={["Today", "Rate", "Formula"]} rows={[["$1,800,000", "5% a year", "price × 1.05"]]} />, answer: 1890000, money: true, tol: 1000, hint: "1,800,000 × 1.05", explain: "$1,890,000." },
    { tag: "TIME MACHINE 2", q: "And after TWO years? (multiply by 1.05 again)", visual: <MiniTable head={["Year 1", "Rate", "Formula"]} rows={[["$1,890,000", "5% a year", "price × 1.05"]]} />, answer: 1984500, money: true, tol: 1000, hint: "1,890,000 × 1.05", explain: "$1,984,500 — like Sofia's laptop in the reading." },
    { tag: "TIME MACHINE 3", q: "A $900,000 bicycle in 9 months, no inflation. How much per month?", answer: 100000, money: true, hint: "900,000 ÷ 9", explain: "$100,000 — Daniel's plan!" },
    { tag: "TIME MACHINE 4", q: "Same bicycle, but the price grows 10% before you buy it ($990,000). Saving for 12 months, how much per month?", answer: 82500, money: true, tol: 100, hint: "990,000 ÷ 12", explain: "$82,500 a month." },
    { tag: "THINK", q: "Your goal price grows with inflation. What is a SMART reaction?", options: ["Review the target and adjust the monthly amount", "Keep the same target forever — prices never matter", "Give up the goal"], correct: 0, explain: "Review regularly, adjust, don't give up." },
  ];
  if (st.done) return <Reward title="Time traveler! ⏳" subtitle="You can see the future price of a dream." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Hourglass size={22} strokeWidth={2.1} />} title="Goal Timeline: Future Edition ⏳" subtitle="Sort the goals by time. Then travel to the future price of a dream." onExit={onExit}>
      <div className="g72-steps">{["1 · Sort the goals", "2 · Inflation time machine", "3 · Calculate"].map((s, i) => <span key={s} className={stage === i ? "on" : stage > i ? "done" : ""}>{s}</span>)}</div>
      {stage === 0 && (
        <>
          <HowTo>Put each goal on the timeline: <b>⚡ Short</b> (less than 1 year) · <b>🧭 Medium</b> (1–3 years) · <b>🏔️ Long</b> (more than 3 years).</HowTo>
          <div className="g82-lanes">{["s", "m", "l"].map((h) => <div key={h} className={`g82-lane ${h}`}><header><em>{HZ[h][0]}</em><b>{HZ[h][1]}</b><small>{HZ[h][2]}</small></header>{GOALS12.map((g, i) => ans[i] === h && <span key={i} className={checked ? (g.b === h ? "ok" : "no") : ""}>{g.e} {g.t}</span>)}</div>)}</div>
          <div className="g82-goalcards">{GOALS12.map((g, i) => (
            <div key={i} className={`g82-goalcard ${ans[i] ? "placed" : ""} ${checked ? (ans[i] === g.b ? "ok" : "no") : ""}`}>
              <b>{g.e} {g.t}</b>
              <div className="g82-hz">{["s", "m", "l"].map((h) => <button key={h} type="button" className={ans[i] === h ? "on" : ""} onClick={() => { setAns({ ...ans, [i]: h }); setChecked(false); }}>{HZ[h][0]} {HZ[h][1]}</button>)}</div>
              {checked && ans[i] !== g.b && <small>→ {HZ[g.b][1]} ({HZ[g.b][2]})</small>}
            </div>
          ))}</div>
          <div className="start-foot">{checked && <span className="sort-count">{okN}/9 correct</span>}{!checked ? <button className="s1-btn primary big" disabled={Object.keys(ans).length < 9} onClick={() => setChecked(true)}>Check my timeline <Check size={16} /></button> : <button className="s1-btn primary big" disabled={okN < 7} onClick={() => setStage(1)}>{okN < 7 ? "Fix the red ones (7+)" : "Enter the time machine"} <ChevronRight size={18} /></button>}</div>
        </>
      )}
      {stage === 1 && (
        <>
          <HowTo>Choose a dream. Move the <b>inflation</b> and the <b>years</b>. Watch the price travel to the future — and how much you need to save each month.</HowTo>
          <div className="g8-pick">{DREAMS.map(([e, l, p], k) => <button key={l} type="button" className={di === k ? "on" : ""} onClick={() => setDi(k)}><em>{e}</em><b>{l}</b><small>{cop(p)}</small>{di === k && <i>✓</i>}</button>)}</div>
          <div className="g72-machine">
            {Ctl({ l: "🎈 Inflation per year", v: rate, set: setRate, mn: 0, mx: 15, stp: 1, fmt: (x) => `${x}%` })}
            {Ctl({ l: "📅 Years until I buy it", v: years, set: setYears, mn: 1, mx: 5, stp: 1, fmt: (x) => `${x} yr` })}
          </div>
          {priceChart}
          <div className="g8-proj"><div><small>Price today</small><b>{cop(D[2])}</b></div><div><small>Price in {years} yr</small><b className="neg">{cop(fp)}</b></div><div><small>Per month (with inflation)</small><b className="pos">{cop(perMonthFut)}</b></div></div>
          <p className="start-tip">If you plan with today's price you save {cop(perMonthToday)}/month… and you arrive <b>{cop(fp - D[2])}</b> short!</p>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(2)}>Calculate like a pro <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 2 && <RoundsRunner rounds={R12} doneLabel="Finish" onDone={(r) => finish(16 + r.firstTry * 3, { sorted: okN, firstTry: r.firstTry })} />}
    </ActShell>
  );
}

/* ---------- PORTFOLIO 02 · MY REAL GOAL (crea el Goal Jar) ---------- */
function MyRealGoal({ existing, onSave, onExit }) {
  const e = existing || {};
  const [what, setWhat] = useState(e.what || "");
  const [why, setWhy] = useState(e.why || "");
  const [price, setPrice] = useState(e.price ? String(e.price) : "");
  const [months, setMonths] = useState(e.months || 6);
  const [infl, setInfl] = useState(e.infl ?? 5);
  const [start, setStart] = useState(e.start !== undefined ? String(e.start) : "");
  const [weekly, setWeekly] = useState(e.weekly || 10000);
  const [planB, setPlanB] = useState(e.planB || "");
  const [st, finish] = useFinish(onSave);
  const p = num(price);
  const future = Math.round(p * Math.pow(1 + infl / 100, months / 12));
  const need = Math.max(0, future - num(start));
  const weeks = Math.round(months * 4.33);
  const needWeekly = weeks ? Math.ceil(need / weeks / 500) * 500 : 0;
  const reach = weekly > 0 ? Math.ceil(need / weekly) : Infinity;
  const onTime = reach <= weeks;
  const smart = [["S", "Specific", countWords(what) >= 2 && realText(what)], ["M", "Measurable", p > 0], ["A", "Achievable", p > 0 && onTime], ["R", "Relevant", countWords(why) >= 5 && realText(why)], ["T", "Time-bound", months > 0]];
  const ready = smart.every((x) => x[2]) && countWords(planB) >= 5 && realText(planB);
  if (st.done) return <Reward title="Your Goal Jar is ready! 🫙" subtitle="From now on, add your savings at the end of every class." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Target size={22} strokeWidth={2.1} />} title="My Real Goal 🎯" subtitle="A SMART goal with a future price. It becomes your Goal Jar!" onExit={onExit}>
      <PFBadge n="02" />
      <HowTo>Choose a REAL goal (or a realistic one). Your amounts can be real or simulated — you don't need to share private information. The <b>SMART meter</b> lights up as you complete it.</HowTo>
      <div className="g82-smart">{smart.map(([l, t, ok]) => <span key={l} className={ok ? "on" : ""}><b>{l}</b>{t}</span>)}</div>
      <div className="g8-two">
        <div className="start-block">
          <label className="p3-lbl">🎯 My goal (what exactly?)<input className="start-input" value={what} onChange={(ev) => setWhat(ev.target.value)} placeholder="e.g. a second-hand bicycle" /></label>
          <label className="p3-lbl">💡 Why is it important to me?<input className="start-input" value={why} onChange={(ev) => setWhy(ev.target.value)} placeholder="Write your answer here…" /></label>
          <div className="g8-row big"><span>🏷️ Price today</span><MoneyInput value={price} onChange={setPrice} /></div>
          <div className="g8-row big"><span>🐷 I already have</span><MoneyInput value={start} onChange={setStart} /></div>
          <div className="g72-machine">
            {Ctl({ l: "📅 Months until my deadline", v: months, set: setMonths, mn: 1, mx: 36, stp: 1, fmt: (x) => `${x} mo` })}
            {Ctl({ l: "🎈 Expected inflation", v: infl, set: setInfl, mn: 0, mx: 15, stp: 1, fmt: (x) => `${x}%` })}
            {Ctl({ l: "💵 I will save per WEEK", v: weekly, set: setWeekly, mn: 1000, mx: 150000, stp: 1000, fmt: cop })}
          </div>
        </div>
        <div className="start-block g82-goalcalc">
          <h3>🔮 My goal in numbers</h3>
          <div className="g8-row"><span>Price today</span><b>{cop(p)}</b></div>
          <div className="g8-row"><span>Future price ({months} mo · {infl}%)</span><b className="neg">{cop(future)}</b></div>
          <div className="g8-row"><span>I already have</span><b>{cop(num(start))}</b></div>
          <div className="g8-row tot"><span>I still need</span><b>{cop(need)}</b></div>
          <div className="g8-row"><span>Needed per week</span><b>{cop(needWeekly)}</b></div>
          <div className={`g8-left ${p > 0 ? (onTime ? "ok" : "bad") : ""}`}>{p <= 0 ? "Write the price first" : onTime ? `✅ At ${cop(weekly)}/week you reach it in ${reach} weeks — on time!` : `⚠️ At ${cop(weekly)}/week you need ${reach} weeks, but you only have ${weeks}. Save more, move the deadline or choose a cheaper option.`}</div>
        </div>
      </div>
      <div className="start-block">
        <h3>🅱️ My plan B (if something changes)</h3>
        <Starters items={["If the price goes up, I will", "If I can't save one week,", "I could also"]} onPick={appendStarter(setPlanB)} />
        <input className="start-input" value={planB} onChange={(ev) => setPlanB(ev.target.value)} placeholder="Write your answer here…" />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { what, why, price: p, months, infl, future, start: num(start), weekly, target: future, planB })}>Save page 02 + create my Goal Jar 🫙 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 13 · THE SAVINGS STRATEGY LEAGUE
   ===================================================================== */
const START_13 = {
  cards: [
    { e: "🥇", t: "Pay yourself first", d: "Move money to savings the day you receive it — before you spend.", ex: "Payday → $50,000 to savings." },
    { e: "✉️", t: "Envelope method", d: "Divide your money into envelopes (categories). When an envelope is empty, you stop.", ex: "Fun envelope: $25,000." },
    { e: "📆", t: "52-week challenge", d: "Save a little more every week: $500, $1,000, $1,500…", ex: "Week 10 = $5,000." },
    { e: "🔼", t: "Round-up saving", d: "Round every purchase up and save the difference.", ex: "Spend $3,600 → save $400." },
    { e: "🤖", t: "Automatic saving", d: "A bank or app moves money to savings for you.", ex: "Every Friday, $10,000." },
    { e: "🔁", t: "Consistency", d: "Doing it again and again — the secret of every method.", ex: "Small, regular, always." },
  ],
  pairs: [
    { a: "Pay yourself first", b: "Save before you spend" }, { a: "Envelope method", b: "Money divided by categories" },
    { a: "52-week challenge", b: "Save a little more every week" }, { a: "Round-up saving", b: "Save the difference to a round number" },
    { a: "Automatic saving", b: "An app moves the money for you" }, { a: "Consistency", b: "Doing it regularly" },
  ],
};
const SB_GOAL = 400000, SB_INC = 100000, SB_NEEDS = 40000;
const SB_EVENTS = { 2: { e: "🎂", t: "Birthday gift for a friend", cost: 30000 }, 4: { e: "🎒", t: "School trip", cost: 50000 }, 6: { e: "📉", t: "Low month: income only $60,000", inc: 60000 }, 8: { e: "📱", t: "Phone screen repair", cost: 60000 }, 10: { e: "🎁", t: "Grandma's gift: +$40,000", inc: 140000 }, 11: { e: "🎄", t: "Holiday plans", cost: 40000 } };
const SB_METHODS = [
  { id: "pyf", e: "🥇", n: "Pay yourself first", c: "#0b7a50", rule: "Saves $50,000 the day income arrives." , target: () => 50000 },
  { id: "env", e: "✉️", n: "Envelopes", c: "#e07a2f", rule: "Savings envelope $35,000 · fun envelope gets the rest.", target: () => 35000 },
  { id: "w52", e: "📆", n: "52-week", c: "#f5b23e", rule: "+$500 every week: month 1 ≈ $5,000 … month 12 ≈ $93,000.", target: (m) => 500 * (16 * m - 6) },
  { id: "rnd", e: "🔼", n: "Round-up", c: "#16b074", rule: "≈ 30 purchases a month rounded up ≈ $18,000.", target: () => 18000 },
];
/* Simulación: mismas reglas e imprevistos para todos los métodos */
function sbRun(methodAt) {
  let saved = 0; const hist = [0]; let withdrawals = 0, shortMonths = 0, cleanMonths = 0;
  for (let m = 1; m <= 12; m++) {
    const M = SB_METHODS.find((x) => x.id === methodAt(m));
    const ev = SB_EVENTS[m] || {};
    const inc = ev.inc || SB_INC;
    const avail = inc - SB_NEEDS;
    let s = M.target(m); let short = false;
    if (s > avail) { s = avail; short = true; }
    let free = avail - s; let w = 0;
    if (ev.cost) { if (ev.cost <= free) free -= ev.cost; else { w = ev.cost - free; free = 0; } }
    if (M.id === "env" && ev.inc && ev.inc > SB_INC) s += Math.round((ev.inc - SB_INC) / 2);
    saved = Math.max(0, saved + s - w);
    withdrawals += w; if (short) shortMonths++; if (!w && !short) cleanMonths++;
    hist.push(saved);
  }
  return { saved, hist, withdrawals, shortMonths, cleanMonths, reached: saved >= SB_GOAL, month: hist.findIndex((v) => v >= SB_GOAL) };
}
function StrategyBattle({ existing, onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [pred, setPred] = useState(null);
  const [why, setWhy] = useState("");
  const [month, setMonth] = useState(0);
  const [play, setPlay] = useState(false);
  const [sw, setSw] = useState(null);
  const [swWhy, setSwWhy] = useState([]);
  const [st, finish] = useFinish(onSave);
  const runs = useMemo(() => SB_METHODS.map((M) => ({ ...M, r: sbRun(() => M.id) })), []);
  const mine = useMemo(() => (pred && sw ? sbRun((m) => (m <= 6 ? pred : sw)) : null), [pred, sw]);
  useEffect(() => {
    if (!play) return undefined;
    const t = setInterval(() => setMonth((m) => { if (m >= 12) { setPlay(false); return 12; } return m + 1; }), 750);
    return () => clearInterval(t);
  }, [play]);
  const ev = SB_EVENTS[month];
  const winner = [...runs].sort((a, b) => b.r.saved - a.r.saved)[0];
  const lanes = (lim, extra) => (
    <div className="g82-race">
      <div className="g82-race-goal"><span>🏁 Goal {cop(SB_GOAL)}</span></div>
      {[...runs, ...(extra ? [extra] : [])].map((L) => { const v = L.r.hist[lim]; return (
        <div key={L.id} className={`g82-lane-r ${pred === L.id ? "mine" : ""}`} style={{ "--lc": L.c }}>
          <span>{L.e} {L.n}</span>
          <i><s style={{ width: `${Math.min(100, (v / SB_GOAL) * 100)}%` }}><em>{L.e}</em></s></i>
          <b>{cop(v)}</b>
        </div>
      ); })}
    </div>
  );
  const series = runs.map((L) => ({ name: L.n, values: L.r.hist, color: L.c }));
  const mineL = mine ? { id: "mine", e: "⭐", n: "My plan", c: "#7a3fb0", r: mine } : null;
  if (st.done) return <Reward title="League complete! 🏆" subtitle={`Winner: ${winner.e} ${winner.n}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Trophy size={22} strokeWidth={2.1} />} title="Strategy Battle 🏆" subtitle="Four methods. Same student, same year, same surprises." onExit={onExit}>
      <div className="g72-steps">{["1 · Predict", "2 · The race", "3 · Strategy switch", "4 · League table"].map((s, i) => <span key={s} className={stage === i ? "on" : stage > i ? "done" : ""}>{s}</span>)}</div>
      {stage === 0 && (
        <>
          <Mission e="👧" title={`Mariana gets ${cop(SB_INC)} a month. Needs cost ${cop(SB_NEEDS)}. Goal: ${cop(SB_GOAL)} in 12 months.`}>Four versions of Mariana use four different methods. The year brings the SAME surprises to all of them. Which method wins?</Mission>
          <div className="g82-methods">{SB_METHODS.map((M) => <button key={M.id} type="button" className={pred === M.id ? "on" : ""} style={{ "--lc": M.c }} onClick={() => setPred(M.id)}><em>{M.e}</em><b>{M.n}</b><small>{M.rule}</small>{pred === M.id && <i>✓ My prediction</i>}</button>)}</div>
          <div className="start-block"><h3>Why do you think it will win?</h3><WordField value={why} onChange={setWhy} min={8} max={50} rows={2} goals={[W_REASON]} placeholder="Write your answer here…" /></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!pred || !goalsOk(why, 8, 50, [W_REASON])} onClick={() => { setStage(1); setMonth(0); setPlay(true); }}><Play size={16} /> Start the race</button></div>
        </>
      )}
      {stage === 1 && (
        <>
          <div className="g82-month"><b>Month {month}/12</b>{ev ? <span className="ev">{ev.e} {ev.t}{ev.cost ? ` · −${cop(ev.cost)}` : ""}</span> : <span>{month === 0 ? "Ready…" : "A normal month"}</span>}</div>
          {lanes(month)}
          <div className="g82-evlog">{Object.entries(SB_EVENTS).map(([m, e]) => <span key={m} className={+m <= month ? "on" : ""}>M{m} {e.e}</span>)}</div>
          <div className="start-foot">{month < 12 ? <><button className="s1-btn ghost" onClick={() => setPlay(!play)}>{play ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Continue</>}</button><button className="s1-btn ghost" onClick={() => { setPlay(false); setMonth(12); }}>Skip to the end</button></> : <button className="s1-btn primary big" onClick={() => setStage(2)}>Strategy switch <ChevronRight size={18} /></button>}</div>
        </>
      )}
      {stage === 2 && (
        <>
          <HowTo>Now YOU play. You keep <b>your predicted method</b> for months 1–6, and you can <b>switch</b> for months 7–12. What do you expect?</HowTo>
          <div className="g82-methods">{SB_METHODS.map((M) => <button key={M.id} type="button" className={sw === M.id ? "on" : ""} style={{ "--lc": M.c }} onClick={() => setSw(M.id)}><em>{M.e}</em><b>{M.n}</b><small>Months 7–12</small>{sw === M.id && <i>✓</i>}</button>)}</div>
          <div className="start-block"><h3>What do you expect from the switch?</h3><div className="g74-chips">{["💰 Save more money", "😌 Less stress", "🔒 Fewer withdrawals", "🎉 More money for fun", "⚠️ Harder at the end"].map((c) => <button key={c} type="button" className={swWhy.includes(c) ? "on" : ""} onClick={() => setSwWhy(swWhy.includes(c) ? swWhy.filter((x) => x !== c) : [...swWhy, c])}>{c}</button>)}</div></div>
          {mineL && (<><h4 className="g8-subh">⭐ My plan vs. the league (12 months)</h4>{lanes(12, mineL)}</>)}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!sw || !swWhy.length} onClick={() => setStage(3)}>League table <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 3 && (
        <>
          <LineChart series={mineL ? [...series, { name: "My plan", values: mine.hist, color: "#7a3fb0" }] : series} labels={Array.from({ length: 13 }, (_, i) => (i === 0 ? "Start" : `M${i}`))} height={230} />
          <ChartLegend series={mineL ? [...series, { name: "My plan", color: "#7a3fb0" }] : series} />
          <MiniTable head={["Method", "Saved", "Withdrawals", "Months short", "Goal?"]} rows={[...runs, ...(mineL ? [mineL] : [])].sort((a, b) => b.r.saved - a.r.saved).map((L, k) => [`${k === 0 ? "🏆 " : ""}${L.e} ${L.n}`, cop(L.r.saved), cop(L.r.withdrawals), `${L.r.shortMonths}`, L.r.reached ? `✅ M${L.r.month}` : "❌"])} />
          <div className="g8-cards three">
            <div className="g8-card open"><em>🥇</em><b>Pay yourself first</b><p>Saving first protects the goal — but surprises still force withdrawals.</p></div>
            <div className="g8-card open"><em>📆</em><b>52-week</b><p>Easy at the start, very hard at the end: it needs more money every month.</p></div>
            <div className="g8-card open"><em>🔼</em><b>Round-up</b><p>Painless and flexible… but slow. Good as an EXTRA method.</p></div>
          </div>
          <p className="start-tip">Your prediction: <b>{SB_METHODS.find((m) => m.id === pred)?.n}</b> → {pred === winner.id ? "✅ you were right!" : `the winner was ${winner.n}.`} There's no perfect method — it depends on income, surprises and discipline.</p>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(30 + (pred === winner.id ? 6 : 0), { pred, why, switchTo: sw, expect: swWhy, mine: mine ? mine.saved : null, table: runs.map((L) => ({ id: L.id, saved: L.r.saved })) })}>Save the league <span className="coin-tag"><Coins size={15} /> +{30 + (pred === winner.id ? 6 : 0)}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

const RUSH_METHOD = {
  buckets: [{ id: "pyf", e: "🥇", l: "Pay yourself first", d: "Save on payday, before spending.", c: "#0b7a50" }, { id: "env", e: "✉️", l: "Envelopes", d: "Money divided by categories.", c: "#e07a2f" }, { id: "w52", e: "📆", l: "52-week", d: "A bit more every week.", c: "#f5b23e" }, { id: "rnd", e: "🔼", l: "Round-up", d: "Save the difference.", c: "#16b074" }],
  items: [
    { e: "💸", t: "The day you get paid, $30,000 goes to savings first", b: "pyf", why: "Saving BEFORE spending." }, { e: "✉️", t: "Your “fun” money is $20,000. When it's gone, the fun stops", b: "env", why: "Limits per category." },
    { e: "🧾", t: "You spend $3,600 and $400 goes to your pocket", b: "rnd", why: "Rounded to $4,000." }, { e: "📈", t: "Week 1: $500 · Week 2: $1,000 · Week 3: $1,500…", b: "w52", why: "The amount grows every week." },
    { e: "🤖", t: "Your app moves money to savings every payday, automatically", b: "pyf", why: "Automatic = paying yourself first." }, { e: "🗂️", t: "Transport, food, fun and savings — each one has its own jar", b: "env", why: "Categories = envelopes." },
    { e: "☕", t: "Coffee $6,700 → the app saves $300", b: "rnd", why: "Round-up to $7,000." }, { e: "🗓️", t: "In December you must save $26,000 a week", b: "w52", why: "52 × $500 = $26,000 in the last week!" },
    { e: "🥇", t: "“Savings are my first bill every month”", b: "pyf", why: "Treat savings like a bill." }, { e: "🚫", t: "The clothes envelope is empty — you wait for next month", b: "env", why: "Respect the envelope." },
    { e: "🪙", t: "Every purchase leaves small change in your savings", b: "rnd", why: "Small automatic amounts." }, { e: "🏁", t: "A year-long challenge that ends with a big total", b: "w52", why: "52 weeks = a full year." },
  ],
};

/* ---------- PORTFOLIO 03 · MY STRATEGY ---------- */
function MyStrategy({ resp, existing, onSave, onExit }) {
  const sb = resp?.c13_battle;
  const jar = resp?.c12_goal;
  const [m, setM] = useState(existing?.method || sb?.switchTo || sb?.pred || "pyf");
  const [amt, setAmt] = useState(existing?.amount || 40000);
  const [txt, setTxt] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const M = SB_METHODS.find((x) => x.id === m);
  const G = [W_REASON, W_CONTRAST];
  const goal = jar?.target || 600000;
  const months = Array.from({ length: 13 }, (_, i) => i);
  const proj = months.map((i) => (m === "w52" ? Math.round((amt / 50000) * sbRun(() => "w52").hist[i]) : m === "rnd" ? i * Math.round(amt * 0.4) : i * amt));
  const reachM = proj.findIndex((v) => v >= goal);
  if (st.done) return <Reward title="Page 03 ready! ♟️" subtitle="Your strategy is on the board." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Target size={22} strokeWidth={2.1} />} title="My Strategy ♟️" subtitle="Choose YOUR method and test it with your real goal." onExit={onExit}>
      <PFBadge n="03" />
      <div className="g82-methods">{SB_METHODS.map((x) => <button key={x.id} type="button" className={m === x.id ? "on" : ""} style={{ "--lc": x.c }} onClick={() => setM(x.id)}><em>{x.e}</em><b>{x.n}</b>{m === x.id && <i>✓</i>}</button>)}</div>
      <div className="g72-machine">{Ctl({ l: m === "w52" ? "📆 Average per month" : m === "rnd" ? "🛒 Monthly spending (round-ups ≈ 40%)" : "💵 Saved per month", v: amt, set: setAmt, mn: 5000, mx: 200000, stp: 5000, fmt: cop })}</div>
      <LineChart series={[{ name: "My savings", values: proj, color: M.c }, { name: "Goal", values: months.map(() => goal), color: "#ff6b57" }]} labels={months.map((i) => (i === 0 ? "Now" : `M${i}`))} height={210} />
      <ChartLegend series={[{ name: "My savings", color: M.c }, { name: `Goal: ${jar?.what || "goal"} ${cop(goal)}`, color: "#ff6b57" }]} />
      <div className={`g8-left ${reachM > 0 ? "ok" : "bad"}`}>{reachM > 0 ? `✅ With ${M.n} you reach your goal in month ${reachM}.` : `⚠️ In 12 months you get ${cop(proj[12])}. Adjust the amount, the method or the deadline.`}</div>
      <div className="start-block">
        <h3><PenLine size={18} /> Why this method fits me</h3>
        <Starters items={["I chose", "because", "However,", "compared with"]} onPick={appendStarter(setTxt)} />
        <WordField value={txt} onChange={setTxt} min={30} max={100} rows={4} goals={G} placeholder="Write your answer here…" />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(txt, 30, 100, G)} onClick={() => finish(28, { method: m, methodName: M.n, amount: amt, reach: reachM, final12: proj[12], text: txt })}>Save page 03 <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 14 · THE TRUE PRICE OF SMALL CHOICES
   ===================================================================== */
const START_14 = {
  cards: [
    { e: "🔁", t: "Opportunity cost", d: "The value of the best alternative you give up when you choose something.", ex: "Coffee every day = no course next year." },
    { e: "⚖️", t: "Trade-off", d: "Getting one thing means giving up another.", ex: "Concert now OR bike sooner." },
    { e: "☕", t: "Habit", d: "Something you do again and again, almost without thinking.", ex: "A drink on the way to school." },
    { e: "📈", t: "Pattern", d: "When you add the repetitions, you see the real size.", ex: "$11,000 × 5 days × 48 weeks." },
    { e: "💰", t: "Potential savings", d: "Money you COULD keep if you change a habit.", ex: "$21,000 a week." },
    { e: "⭐", t: "Priority", d: "What is most important for you right now.", ex: "A course > a subscription I never use." },
  ],
  rounds: [
    { tag: "QUICK 1", q: "$5,000 × 5 school days =", answer: 25000, money: true, hint: "5,000 × 5", explain: "$25,000 a week." },
    { tag: "QUICK 2", q: "$25,000 a week × 48 weeks =", answer: 1200000, money: true, hint: "25,000 × 48", explain: "$1,200,000 a school year!" },
    { tag: "QUICK 3", q: "You buy a concert ticket instead of saving for a bike. The bike that arrives later is the…", options: ["Opportunity cost", "The ticket price written on the receipt", "Discount"], correct: 0, explain: "What you give up = opportunity cost." },
    { tag: "QUICK 4", q: "The lesson of small habits is…", options: ["Check if it is worth it", "Never buy anything", "Small things don't matter"], correct: 0, explain: "Enjoy — but consciously." },
  ],
};
const HABITS14 = [
  { e: "☕", n: "Café drink", cost: 7000, per: 5 }, { e: "🍫", n: "Snack", cost: 4000, per: 5 }, { e: "🛵", n: "Delivery fee", cost: 6000, per: 2 },
  { e: "🪙", n: "Game coins", cost: 2000, per: 7 }, { e: "🚕", n: "Taxi instead of bus", cost: 9000, per: 2 }, { e: "🧋", n: "Bubble tea", cost: 9000, per: 3 },
];
const UNLOCK14 = [["🎧", "Good headphones", 400000], ["🚲", "A bicycle", 900000], ["🛟", "An emergency fund", 1500000], ["💻", "A laptop", 1800000], ["🎓", "A professional course", 2500000], ["✈️", "A trip", 4000000]];
function LeakHunter({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [hi, setHi] = useState(0);
  const [cost, setCost] = useState(HABITS14[0].cost);
  const [per, setPer] = useState(HABITS14[0].per);
  const [years, setYears] = useState(1);
  const [avoid, setAvoid] = useState(2);
  const [visited, setVisited] = useState({ 1: true });
  const [st, finish] = useFinish(onSave);
  const pickH = (k) => { setHi(k); setCost(HABITS14[k].cost); setPer(HABITS14[k].per); setAvoid(Math.min(avoid, HABITS14[k].per)); };
  const yearly = cost * per * 52, saveYr = cost * Math.min(avoid, per) * 52;
  const spend = yearly * years, save = saveYr * years;
  const realistic = avoid > 0 && avoid < per;
  const go = (y) => { setYears(y); setVisited((v) => ({ ...v, [y]: true })); };
  const H = HABITS14[hi];
  const chart = <BarChart bars={[1, 5, 10].map((y) => ({ label: `${y} yr · spend`, value: yearly * y, color: "#ff6b57" })).concat([1, 5, 10].map((y) => ({ label: `${y} yr · save`, value: saveYr * y, color: "#16b074" })))} height={220} />;
  const R14 = [
    { tag: "CALCULATE 1", q: "A $7,000 drink, 5 days a week, for 4 weeks =", visual: <MiniTable head={["Price", "Per week", "Weeks"]} rows={[["$7,000", "5", "4"]]} />, answer: 140000, money: true, hint: "7,000 × 5 × 4", explain: "$140,000 in a month." },
    { tag: "CALCULATE 2", q: "$3,000 game coins, 7 days a week, for one year (52 weeks) =", visual: <MiniTable head={["Price", "Per week", "Weeks"]} rows={[["$3,000", "7", "52"]]} />, answer: 1092000, money: true, hint: "3,000 × 7 × 52", explain: "More than one million pesos!" },
    { tag: "CALCULATE 3", q: "Nicolás avoids 2 of his 5 coffees ($7,000) each week. In one year (52 weeks) he keeps…", visual: <MiniTable head={["Avoided per week", "Price", "Weeks"]} rows={[["2", "$7,000", "52"]]} />, answer: 728000, money: true, hint: "2 × 7,000 × 52", explain: "$728,000 — and he still enjoys 3 coffees a week." },
    { tag: "THINK 1", q: "Paula keeps a $17,000 subscription she never uses. The OPPORTUNITY COST is…", options: ["The course she can't pay for", "$17,000 every month, which is the price of the subscription", "Nothing"], correct: 0, explain: "The price is $17,000; the opportunity cost is what she gives up." },
    { tag: "THINK 2", q: "Which change is the most REALISTIC?", options: ["Avoid 2 of 5 purchases a week", "Never buy anything again for the rest of the school year", "Buy more"], correct: 0, explain: "A plan you can keep is better than a perfect plan you abandon." },
  ];
  if (st.done) return <Reward title="Leak hunter! 💧🔫" subtitle={`Potential savings: ${cop(save)} in ${years} years`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Hourglass size={22} strokeWidth={2.1} />} title="Leak Hunter: Time Machine 💧⏳" subtitle="Build a money leak. Travel 1, 5 and 10 years into the future." onExit={onExit}>
      <div className="g72-steps">{["1 · Build a leak & travel", "2 · Calculate"].map((s, i) => <span key={s} className={stage === i ? "on" : stage > i ? "done" : ""}>{s}</span>)}</div>
      {stage === 0 && (
        <>
          <HowTo>1) Pick a habit. 2) Adjust the price and how many times a week. 3) Decide how many purchases you <b>avoid</b> (a realistic change, not “never again”). 4) Use the <b>time machine</b>: visit 1, 5 and 10 years.</HowTo>
          <div className="g8-pick">{HABITS14.map((h, k) => <button key={h.n} type="button" className={hi === k ? "on" : ""} onClick={() => pickH(k)}><em>{h.e}</em><b>{h.n}</b><small>{cop(h.cost)} × {h.per}/wk</small>{hi === k && <i>✓</i>}</button>)}</div>
          <div className="g72-machine">
            {Ctl({ l: `${H.e} Cost per purchase`, v: cost, set: setCost, mn: 1000, mx: 20000, stp: 500, fmt: cop })}
            {Ctl({ l: "🔁 Purchases per week", v: per, set: (v) => { setPer(v); setAvoid(Math.min(avoid, v)); }, mn: 1, mx: 7, stp: 1, fmt: (x) => `${x}×` })}
            {Ctl({ l: "✂️ Purchases avoided per week", v: avoid, set: setAvoid, mn: 0, mx: per, stp: 1, fmt: (x) => `${x}×` })}
          </div>
          <div className="g82-tm">{[1, 5, 10].map((y) => <button key={y} type="button" className={`${years === y ? "on" : ""} ${visited[y] ? "seen" : ""}`} onClick={() => go(y)}><em>⏳</em><b>{y} year{y > 1 ? "s" : ""}</b><small>{visited[y] ? "visited ✓" : "travel"}</small></button>)}</div>
          <div className="g8-proj"><div><small>Habit cost in {years} yr</small><b className="neg">{cop(spend)}</b></div><div><small>Potential savings</small><b className="pos">{cop(save)}</b></div><div><small>Still enjoying</small><b>{per - Math.min(avoid, per)}× a week</b></div></div>
          {chart}
          <p className="start-tip p1-center">🔴 What the habit costs · 🟢 What your change saves (1, 5, 10 years · no inflation or interest)</p>
          <div className="start-block"><h3>🔓 With the savings in {years} year{years > 1 ? "s" : ""} you could unlock…</h3><div className="g82-unlock">{UNLOCK14.map(([e, n, p]) => <span key={n} className={save >= p ? "on" : ""}><em>{save >= p ? e : "🔒"}</em><b>{n}</b><small>{cop(p)}</small></span>)}</div></div>
          {avoid === per && <div className="p1-hint">🤔 You avoid ALL of them. Is that realistic for you? A plan that keeps some fun is easier to follow.</div>}
          {realistic && <div className="p1-banner good"><Check size={18} /> <span><b>Realistic change!</b> You save money AND keep some fun.</span></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={Object.keys(visited).length < 3 || avoid === 0} onClick={() => setStage(1)}>{Object.keys(visited).length < 3 ? `Visit 1, 5 and 10 years (${Object.keys(visited).length}/3)` : "Calculate like an investigator"} <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 1 && <RoundsRunner rounds={R14} doneLabel="Finish" onDone={(r) => finish(18 + r.firstTry * 3 + (realistic ? 4 : 0), { habit: H.n, cost, per, avoid, years, yearly, saveYr, realistic, firstTry: r.firstTry })} />}
    </ActShell>
  );
}

const RUSH_OPP = {
  buckets: [{ id: "price", e: "🏷️", l: "Price", d: "What you PAY.", c: "#e07a2f" }, { id: "opp", e: "🔁", l: "Opportunity cost", d: "What you GIVE UP.", c: "#0b7a50" }],
  items: [
    { e: "🧾", t: "The $7,000 written on the café receipt", b: "price", why: "The receipt shows the price." }, { e: "🎓", t: "The course Paula couldn't pay because of the subscription", b: "opp", why: "The alternative she gave up." },
    { e: "🎟️", t: "$80,000 for the concert ticket", b: "price", why: "That's what you pay." }, { e: "🚲", t: "The bike you will buy 2 months later because of the concert", b: "opp", why: "You gave up time with your bike." },
    { e: "📺", t: "$17,000 a month for streaming", b: "price", why: "The monthly price." }, { e: "📚", t: "Books you didn't buy with that streaming money", b: "opp", why: "The best alternative." },
    { e: "⏰", t: "Two hours playing instead of studying for the test", b: "opp", why: "Time also has an opportunity cost!" }, { e: "👟", t: "$250,000 for new sneakers", b: "price", why: "The price tag." },
    { e: "🛟", t: "The emergency fund you didn't build", b: "opp", why: "What you could have had." }, { e: "🍔", t: "$18,000 for a burger combo", b: "price", why: "The price." },
    { e: "💻", t: "The laptop savings that grew slower", b: "opp", why: "The alternative you gave up." }, { e: "🛵", t: "A $6,000 delivery fee", b: "price", why: "What you pay." },
  ],
};

/* ---------- PORTFOLIO 04 · MY SAVINGS BUDGET ---------- */
const VAL_LEAKS = [
  { e: "🧋", n: "Bubble tea", cost: 8000, freq: 3, unit: "week" }, { e: "🛵", n: "Delivery fee", cost: 5000, freq: 2, unit: "week" }, { e: "🎮", n: "Game pass", cost: 25000, freq: 1, unit: "month" },
  { e: "🚕", n: "Taxi to school", cost: 10000, freq: 1, unit: "week" }, { e: "🍫", n: "Snacks", cost: 3000, freq: 5, unit: "week" }, { e: "📺", n: "Second streaming app", cost: 17000, freq: 1, unit: "month" },
];
const annual = (l) => l.cost * l.freq * (l.unit === "week" ? 52 : 12);
const CHANGE = [["cut", "✂️ Cut it", 1], ["half", "➗ Half", 0.5], ["keep", "💛 Keep it", 0]];
function SavingsBudget({ existing, onSave, onExit }) {
  const [pick, setPick] = useState(existing?.picked || []);
  const [calc, setCalc] = useState({});
  const [chk, setChk] = useState(false);
  const [chg, setChg] = useState(existing?.changes || {});
  const [inc, setInc] = useState(existing?.income ? String(existing.income) : "");
  const [rate, setRate] = useState(existing?.rate || 20);
  const [txt, setTxt] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const okCalc = pick.length === 3 && pick.every((i) => Math.abs(num(calc[i]) - annual(VAL_LEAKS[i])) <= 500);
  const saved = pick.reduce((a, i) => a + annual(VAL_LEAKS[i]) * (CHANGE.find((c) => c[0] === chg[i])?.[2] ?? 0), 0);
  const G = [W_NUMBERS(2), W_REASON];
  const I = num(inc), saveAmt = Math.round((I * rate) / 100);
  const ready = okCalc && pick.every((i) => chg[i]) && I > 0 && goalsOk(txt, 30, 100, G);
  if (st.done) return <Reward title="Page 04 ready! 💧" subtitle="You found the leaks — and a destination for the money." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<PiggyBank size={22} strokeWidth={2.1} />} title="My Savings Budget 💧" subtitle="Help Valeria first — then build YOUR savings budget." onExit={onExit}>
      <PFBadge n="04" />
      <Mission e="👧" title="Valeria (14) wants to save for a laptop, but she “never has money”.">Here is her spending profile. Choose <b>3 leaks</b>, calculate their cost for ONE YEAR and decide what she should change.</Mission>
      <div className="start-block">
        <h3><span className="step-n">1</span> Choose 3 leaks ({pick.length}/3)</h3>
        <div className="g82-leaks">{VAL_LEAKS.map((l, i) => <button key={l.n} type="button" className={pick.includes(i) ? "on" : ""} disabled={!pick.includes(i) && pick.length >= 3} onClick={() => { setChk(false); setPick(pick.includes(i) ? pick.filter((x) => x !== i) : [...pick, i]); }}><em>{l.e}</em><b>{l.n}</b><small>{cop(l.cost)} × {l.freq} a {l.unit}</small></button>)}</div>
      </div>
      {pick.length === 3 && (
        <div className="start-block">
          <h3><span className="step-n">2</span> Calculate the cost for ONE year</h3>
          <p className="start-tip">💡 Per week × 52 · per month × 12</p>
          {pick.map((i) => { const l = VAL_LEAKS[i]; const ok = Math.abs(num(calc[i]) - annual(l)) <= 500; return (
            <div key={i} className={`g82-calcrow ${chk ? (ok ? "ok" : "no") : ""}`}>
              <span>{l.e} {l.n}: {cop(l.cost)} × {l.freq} × {l.unit === "week" ? 52 : 12}</span>
              <MoneyInput value={calc[i] || ""} onChange={(v) => { setCalc({ ...calc, [i]: v }); setChk(false); }} />
              {chk && <b>{ok ? "✅" : `❌ ${cop(annual(l))}`}</b>}
            </div>
          ); })}
          {!okCalc && <div className="start-foot"><button className="s1-btn ghost" onClick={() => setChk(true)}><Check size={15} /> Check my numbers</button></div>}
        </div>
      )}
      {okCalc && (
        <div className="start-block">
          <h3><span className="step-n">3</span> What should Valeria change?</h3>
          {pick.map((i) => <div key={i} className="g82-chg"><b>{VAL_LEAKS[i].e} {VAL_LEAKS[i].n} · {cop(annual(VAL_LEAKS[i]))}/yr</b><div className="type-toggle">{CHANGE.map(([k, l]) => <button key={k} type="button" className={chg[i] === k ? "on" : ""} onClick={() => setChg({ ...chg, [i]: k })}>{l}</button>)}</div></div>)}
          <div className="g8-proj"><div><small>Valeria saves per year</small><b className="pos">{cop(saved)}</b></div><div><small>Her laptop ($1,800,000)</small><b>{Math.min(100, Math.round((saved / 1800000) * 100))}%</b></div><div><small>Months of savings</small><b>{saved ? Math.ceil(1800000 / (saved / 12)) : "—"}</b></div></div>
        </div>
      )}
      <div className="start-block">
        <h3><span className="step-n">4</span> MY savings budget (real or simulated)</h3>
        <div className="g8-row big"><span>💵 My monthly money</span><MoneyInput value={inc} onChange={setInc} /></div>
        <div className="g72-machine">{Ctl({ l: "🥇 I save FIRST (% of my money)", v: rate, set: setRate, mn: 0, mx: 60, stp: 5, fmt: (x) => `${x}%` })}</div>
        {I > 0 && <StackBar parts={[{ label: "Savings first", value: saveAmt, color: "#0b7a50" }, { label: "To spend", value: I - saveAmt, color: "#f5b23e" }]} />}
      </div>
      <div className="start-block">
        <h3><PenLine size={18} /> Explain the change and the opportunity</h3>
        <Starters items={["Valeria spends", "per year on", "If she", "she could", "because", "I will save"]} onPick={appendStarter(setTxt)} />
        <WordField value={txt} onChange={setTxt} min={30} max={100} rows={4} goals={G} placeholder="Write your answer here…" />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { picked: pick, changes: chg, valeriaSaves: saved, income: I, rate, saveAmt, text: txt })}>Save page 04 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 15 · THE EMERGENCY THAT CHANGED EVERYTHING
   ===================================================================== */
const START_15 = {
  cards: [
    { e: "🛟", t: "Emergency fund", d: "Money saved ONLY for unexpected, necessary expenses.", ex: "A broken phone you need for school." },
    { e: "💥", t: "Unexpected expense", d: "A cost you didn't plan for.", ex: "A medical visit, a repair." },
    { e: "🏠", t: "Essential expenses", d: "What you MUST pay every month to live.", ex: "Food, transport, rent." },
    { e: "💧", t: "Liquidity", d: "How fast you can use your money.", ex: "A pocket: today. A CDT: maybe in a year." },
    { e: "⛓️", t: "Debt", d: "Money you owe — usually with interest.", ex: "Borrow $200,000 at 4% a month." },
    { e: "🔄", t: "Refill", d: "After using the fund, you fill it again.", ex: "$50,000 a month until it's full." },
  ],
  rounds: [
    { tag: "QUICK 1", q: "Essentials cost $1,000,000 a month. A 3-month emergency fund =", answer: 3000000, money: true, hint: "1,000,000 × 3", explain: "$3,000,000." },
    { tag: "QUICK 2", q: "Your bike for school breaks. Is it an emergency?", options: ["Yes — necessary and unexpected", "No — a bike is always a want, even if you use it for school", "Only on weekends"], correct: 0, explain: "You need it to study." },
    { tag: "QUICK 3", q: "A 50% sale on a jacket. Use the emergency fund?", options: ["No — it's not an emergency", "Yes — it's a great deal", "Yes, half of it"], correct: 0, explain: "Sales are not emergencies." },
    { tag: "QUICK 4", q: "$200,000 borrowed at 4% a month. Interest in the first month =", answer: 8000, money: true, hint: "200,000 × 0.04", explain: "$8,000 just for borrowing." },
  ],
};
const STORY15 = [
  { e: "📱💥", h: "Monday, 7:10 a.m.", t: "Tomás and Lucía are best friends. On the same day, both drop their phones on the street. CRACK! The repair costs $250,000. They need their phones for homework and to talk with their families." },
  { e: "🤔", h: "Tomás has no savings", t: "Tomás has $0 saved. A loan app offers him money in 5 minutes: “$250,000 now! Only 5% a month!”", ask: { q: "What do you think happens to Tomás?", opts: ["He pays much more than $250,000", "He pays exactly $250,000", "Nothing happens"], ok: 0, why: "Interest! Borrowing $250,000 at 5% a month and paying it back in 6 months costs about $295,000." } },
  { e: "🛟", h: "Lucía has an emergency fund", t: "Lucía saved $50,000 a month for six months: she has $300,000 in a separate pocket. She uses $250,000, pays the repair the same day and has no debt." },
  { e: "📅", h: "Six months later…", t: "Tomás is still paying his loan — $49,000 a month. He can't save for his concert. Lucía refilled her fund with $50,000 a month and is already saving for her goal again.", ask: { q: "What made the biggest difference?", opts: ["Lucía had money ready for surprises", "Lucía had a more expensive phone", "Tomás was unlucky"], ok: 0, why: "Same accident, same cost — different preparation." } },
  { e: "💡", h: "The lesson", t: "An emergency fund doesn't stop accidents. It stops accidents from becoming DEBT. That's why many people try to build a fund of 3 to 6 months of essential expenses — step by step, starting small." },
];
function EmergencyStory({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState({});
  const [st, finish] = useFinish(onSave);
  const p = STORY15[i];
  const need = p.ask && ans[i] === undefined;
  if (st.done) return <Reward title="Story unlocked! 📖" subtitle="Same accident, two endings." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<LifeBuoy size={22} strokeWidth={2.1} />} title="Same Accident, Two Endings 📱💥" subtitle="A short story. Predict what happens!" onExit={onExit}>
      <div className="g82-dots">{STORY15.map((_, k) => <i key={k} className={k < i ? "done" : k === i ? "now" : ""} />)}</div>
      <div className="g82-panel" key={i}>
        <em>{p.e}</em><small>{p.h}</small><p>{p.t}</p>
        {i === 1 && <div className="g82-vs"><div className="a"><b>🧑 Tomás</b><span>Savings: $0</span></div><div className="b"><b>👩 Lucía</b><span>Fund: $300,000</span></div></div>}
        {p.ask && (
          <div className="g82-ask"><b>🤔 {p.ask.q}</b>
            <div>{p.ask.opts.map((o, k) => <button key={o} type="button" disabled={ans[i] !== undefined} className={ans[i] === undefined ? "" : k === p.ask.ok ? "ok" : k === ans[i] ? "no" : ""} onClick={() => setAns({ ...ans, [i]: k })}>{o}</button>)}</div>
            {ans[i] !== undefined && <p>{ans[i] === p.ask.ok ? "✅ " : "❌ "}{p.ask.why}</p>}
          </div>
        )}
      </div>
      {i === STORY15.length - 1 && <MiniTable head={["", "🧑 Tomás (loan)", "👩 Lucía (fund)"]} rows={[["Repair", "$250,000", "$250,000"], ["Interest", "≈ $45,000", "$0"], ["Total paid", "≈ $295,000", "$250,000"], ["After 6 months", "Still paying", "Fund refilled ✅"]]} />}
      <div className="start-foot">{i > 0 && <button className="s1-btn ghost" onClick={() => setI(i - 1)}><ArrowLeft size={15} /> Back</button>}{i < STORY15.length - 1 ? <button className="s1-btn primary big" disabled={need} onClick={() => setI(i + 1)}>Next <ChevronRight size={18} /></button> : <button className="s1-btn primary big" onClick={() => finish(15, { answers: ans })}>I got the lesson <span className="coin-tag"><Coins size={15} /> +15</span></button>}</div>
    </ActShell>
  );
}

/* ---------- 12-MONTH SURVIVAL · dos vidas paralelas ---------- */
const SV = { inc: 1500000, ess: 1100000, save: 200000, fun: 200000, fund: 1100000, rate: 0.04, pay: 150000 };
const SV_FIXED = {
  1: { e: "🎒", t: "Unexpected school expense", cost: 180000, kind: "need" },
  3: { e: "🚲", t: "Your bike for work/school breaks", cost: 320000, kind: "need" },
  5: { e: "📉", t: "Fewer hours at work: income −$400,000", cost: 400000, kind: "income" },
  7: { e: "🛍️", t: "A great offer you didn't plan (new sneakers)", cost: 250000, kind: "want" },
  9: { e: "💻", t: "Your computer needs a repair", cost: 450000, kind: "need" },
};
const SV_BANK = [
  { e: "🦷", t: "Dentist visit (not covered)", cost: 220000, kind: "need" }, { e: "🎉", t: "A friend's party in another city", cost: 180000, kind: "want" },
  { e: "💡", t: "Electricity bill higher than usual", cost: 120000, kind: "need" }, { e: "📱", t: "Phone screen cracked", cost: 260000, kind: "need" },
  { e: "🎮", t: "A new console is on sale", cost: 300000, kind: "want" }, { e: "🩺", t: "Medicine for a cold", cost: 90000, kind: "need" },
  { e: "😊", t: "A calm month — no surprises!", cost: 0, kind: "calm" },
];
const SV_OPTS = {
  need: [["fund", "🛟 Pay with my emergency fund"], ["cut", "✂️ Cut my fun money this month"], ["debt", "💳 Borrow (4% a month)"]],
  income: [["fund", "🛟 Use the fund for essentials"], ["cut", "✂️ Cut fun and savings"], ["debt", "💳 Borrow the difference"]],
  want: [["skip", "🙅 Skip it — the reserve stays"], ["fund", "🛟 Use the emergency fund"], ["debt", "💳 Buy it on credit"]],
  calm: [["ok", "😊 Great — save as usual"]],
};
function svStep(L, ev, choice, hasFund) {
  const n = { ...L };
  n.debt = Math.round(n.debt * (1 + SV.rate));
  let cost = ev.cost || 0; let fun = SV.fun; let save = SV.save;
  if (ev.kind === "want" && choice === "skip") cost = 0;
  let c = choice;
  if (c === "fund" && (!hasFund || n.fund <= 0)) c = "cut";
  if (c === "fund") { const use = Math.min(cost, n.fund); n.fund -= use; cost -= use; }
  if (c === "cut" || (c === "fund" && cost > 0)) { const f = Math.min(cost, fun); fun -= f; cost -= f; if (cost > 0 && ev.kind === "income") { const s = Math.min(cost, save); save -= s; cost -= s; } }
  if (cost > 0) n.debt += cost;
  if (n.debt > 0) { const p = Math.min(n.debt, SV.pay); n.debt -= p; save = Math.max(0, save - p); }
  if (hasFund && n.fund < SV.fund) { const r = Math.min(save, SV.fund - n.fund); n.fund += r; save -= r; }
  n.savings += save;
  n.used = c; return n;
}
const svStab = (L) => clamp(Math.round(50 + ((L.fund + L.savings) / SV.ess) * 25 - (L.debt / SV.ess) * 60), 0, 100);
function Survival12({ onSave, onExit }) {
  const [evs] = useState(() => { const pool = shuffleArr(SV_BANK); let k = 0; return Array.from({ length: 12 }, (_, i) => SV_FIXED[i + 1] || (i === 11 ? { e: "📋", t: "Annual review", cost: 0, kind: "calm" } : pool[k++ % pool.length])); });
  const [m, setM] = useState(0);
  const [A, setA] = useState({ fund: 0, savings: 0, debt: 0 });
  const [B, setB] = useState({ fund: SV.fund, savings: 0, debt: 0 });
  const [hist, setHist] = useState([{ a: 0, b: SV.fund }]);
  const [last, setLast] = useState(null);
  const [badFund, setBadFund] = useState(0);
  const [st, finish] = useFinish(onSave);
  const ev = evs[m];
  const decide = (ch) => {
    const nb = svStep(B, ev, ch, true);
    const chA = ch === "fund" ? (ev.kind === "want" ? "debt" : "cut") : ch;
    const na = svStep(A, ev, chA, false);
    if (ev.kind === "want" && ch === "fund") setBadFund((x) => x + 1);
    setA(na); setB(nb); setLast({ ev, ch, na, nb });
    setHist((h) => [...h, { a: na.fund + na.savings - na.debt, b: nb.fund + nb.savings - nb.debt }]);
  };
  const next = () => { setLast(null); setM(m + 1); };
  const done = m >= 12;
  const Life = ({ L, t, cls }) => (
    <div className={`g82-life ${cls}`}>
      <header><b>{t}</b><small>{cls === "a" ? "No emergency fund" : "Emergency fund ✓"}</small></header>
      <div className="g82-ind"><span>🧱 Stability</span><i><s style={{ width: `${svStab(L)}%` }} /></i><b>{svStab(L)}</b></div>
      <div className="g8-row"><span>🛟 Reserve</span><b>{cop(L.fund)}</b></div>
      <div className="g8-row"><span>🐷 Savings</span><b>{cop(L.savings)}</b></div>
      <div className="g8-row"><span>⛓️ Debt pressure</span><b className={L.debt > 0 ? "neg" : ""}>{cop(L.debt)}</b></div>
    </div>
  );
  if (st.done) return <Reward title="You survived the year! 🛟" subtitle={`Life B ended with ${cop(B.fund + B.savings - B.debt)} · Life A with ${cop(A.fund + A.savings - A.debt)}`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<LifeBuoy size={22} strokeWidth={2.1} />} title="12-Month Survival 🛟" subtitle="Andrés (19, first job) lives the same year twice: without and with an emergency fund." onExit={onExit}>
      <Mission e="🧑" title={`Income ${cop(SV.inc)} · essentials ${cop(SV.ess)} · savings ${cop(SV.save)} · fun ${cop(SV.fun)} a month`}>Every month brings an event. YOU decide for <b>Life B</b> (with a {cop(SV.fund)} fund). <b>Life A</b> has no fund, so it must cut or borrow. Debt grows 4% a month. If you use the fund, it refills automatically from savings.</Mission>
      <div className="g82-lives"><Life L={A} t="Life A" cls="a" /><Life L={B} t="Life B" cls="b" /></div>
      {!done ? (
        <>
          <div className="g82-month"><b>Month {m + 1}/12</b><span className="ev">{ev.e} {ev.t}{ev.cost ? ` · ${cop(ev.cost)}` : ""}</span></div>
          {!last ? (
            <div className="g82-choices">{SV_OPTS[ev.kind].map(([k, l]) => <button key={k} type="button" onClick={() => decide(k)}>{l}</button>)}</div>
          ) : (
            <div className={`g82-bias ${last.ev.kind === "want" && last.ch === "fund" ? "bad" : "good"}`}>
              <small>WHAT HAPPENED</small>
              {last.ev.kind === "want" && last.ch === "fund" ? <b>🚩 The emergency fund is NOT for offers. Life B's reserve is now smaller for real emergencies.</b> : <b>Life B: {({ fund: "used the fund 🛟", cut: "cut fun money ✂️", debt: "borrowed 💳", skip: "skipped it 🙅", ok: "saved as usual 😊" })[last.ch]} · Life A: {({ fund: "—", cut: "had to cut ✂️", debt: "had to borrow 💳", skip: "skipped it 🙅", ok: "saved as usual 😊" })[last.na.used]}</b>}
              {last.na.debt > 0 && <p>⛓️ Life A owes {cop(last.na.debt)} — and it grows 4% every month.</p>}
            </div>
          )}
          {last && <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{m === 11 ? "See the annual review" : "Next month"} <ChevronRight size={18} /></button></div>}
        </>
      ) : (
        <>
          <h4 className="g8-subh">📈 Net position (reserve + savings − debt) month by month</h4>
          <LineChart series={[{ name: "Life A", values: hist.map((h) => h.a), color: "#ff6b57" }, { name: "Life B", values: hist.map((h) => h.b), color: "#0b7a50" }]} labels={hist.map((_, i) => (i === 0 ? "Start" : `M${i}`))} height={220} yMin={Math.min(0, ...hist.map((h) => h.a))} />
          <ChartLegend series={[{ name: "Life A · no fund", color: "#ff6b57" }, { name: "Life B · emergency fund", color: "#0b7a50" }]} />
          <MiniTable head={["", "Life A", "Life B"]} rows={[["Reserve", cop(A.fund), cop(B.fund)], ["Savings", cop(A.savings), cop(B.savings)], ["Debt", cop(A.debt), cop(B.debt)], ["Stability", `${svStab(A)}/100`, `${svStab(B)}/100`]]} />
          {badFund > 0 && <div className="p1-hint">🚩 You used the fund for an offer {badFund} time(s). Remember: the fund is for unexpected and NECESSARY expenses.</div>}
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(badFund ? 26 : 34, { A, B, misuse: badFund, events: evs.map((e) => e.t) })}>Save my year <span className="coin-tag"><Coins size={15} /> +{badFund ? 26 : 34}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

const RUSH_EMERG = {
  buckets: [{ id: "yes", e: "🛟", l: "Use the fund", d: "Unexpected AND necessary.", c: "#0b7a50" }, { id: "no", e: "🙅", l: "Not an emergency", d: "Plan it or skip it.", c: "#ff6b57" }],
  items: [
    { e: "🦷", t: "A painful tooth — dentist today", b: "yes", why: "Health + unexpected." }, { e: "👟", t: "Sneakers 50% off — today only", b: "no", why: "A sale is not an emergency." },
    { e: "🚲", t: "The bike you use for school breaks", b: "yes", why: "Necessary transport." }, { e: "🎂", t: "Your best friend's birthday (you knew the date)", b: "no", why: "Planned — use your budget." },
    { e: "💻", t: "Your laptop for homework stops working", b: "yes", why: "Necessary for studying." }, { e: "🎮", t: "A new game everybody is playing", b: "no", why: "It's a want." },
    { e: "📉", t: "Your parent's income drops this month — you help with food", b: "yes", why: "Essential expense." }, { e: "🎤", t: "Concert tickets just went on sale", b: "no", why: "Fun — save for it separately." },
    { e: "🩺", t: "Medicine for an infection", b: "yes", why: "Health is essential." }, { e: "📱", t: "A newer phone model — yours works fine", b: "no", why: "Upgrade = want." },
    { e: "🚪", t: "The door lock breaks and the house is not safe", b: "yes", why: "Safety + unexpected." }, { e: "✈️", t: "A cheap last-minute holiday trip", b: "no", why: "Nice — but not an emergency." },
  ],
};

/* ---------- PORTFOLIO 05 · MY EMERGENCY PLAN ---------- */
const ESS15 = [["food", "🍲 Food / lunches"], ["transport", "🚌 Transport"], ["phone", "📱 Phone / internet"], ["school", "📚 School costs"]];
const WHERE15 = [{ id: "pocket", e: "📲", n: "Separate digital pocket", ok: true, why: "Liquid and separated from daily money. ✅" }, { id: "account", e: "🏦", n: "Savings account", ok: true, why: "Easy access, possibly some interest. ✅" }, { id: "cdt", e: "📜", n: "1-year CDT", ok: false, why: "May restrict access until maturity — not ideal for emergencies." }, { id: "mattress", e: "🛏️", n: "Cash under the mattress", ok: false, why: "Easy to spend, can be lost or stolen, no protection." }, { id: "crypto", e: "🪙", n: "Crypto app", ok: false, why: "Value can drop exactly when you need it." }];
const RULES15 = [{ t: "Only for unexpected AND necessary expenses", ok: true }, { t: "Refill it after I use it", ok: true }, { t: "Keep it separate from my daily money", ok: true }, { t: "Ask: can it wait? Is it necessary?", ok: true }, { t: "Use it for sales and offers", ok: false, why: "Offers are not emergencies." }, { t: "Lend it to friends for parties", ok: false, why: "That's not what it's for." }];
function EmergencyPlan({ existing, onSave, onExit }) {
  const e = existing || {};
  const [ess, setEss] = useState(e.ess || {});
  const [months, setMonths] = useState(e.months || 3);
  const [where, setWhere] = useState(e.where || null);
  const [rules, setRules] = useState(e.rules || []);
  const [refill, setRefill] = useState(e.refill || 50000);
  const [txt, setTxt] = useState(e.text || "");
  const [st, finish] = useFinish(onSave);
  const monthly = ESS15.reduce((a, [k]) => a + num(ess[k]), 0);
  const target = monthly * months, first = monthly;
  const W = WHERE15.find((x) => x.id === where);
  const badRules = rules.filter((i) => !RULES15[i].ok);
  const G = [W_REASON, W_PLAN];
  const ready = monthly > 0 && W && W.ok && rules.length >= 3 && !badRules.length && goalsOk(txt, 25, 90, G);
  if (st.done) return <Reward title="Page 05 ready! 🛟" subtitle="Your safety net has a plan." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<LifeBuoy size={22} strokeWidth={2.1} />} title="My Emergency Plan 🛟" subtitle="How much, where, and when to use it." onExit={onExit}>
      <PFBadge n="05" />
      <div className="g8-two">
        <div className="start-block">
          <h3><span className="step-n">1</span> My essential expenses per month</h3>
          <p className="start-tip">Real or simulated — imagine you live alone at 19 if you prefer.</p>
          {ESS15.map(([k, l]) => <div key={k} className="g8-row"><span>{l}</span><MoneyInput value={ess[k] || ""} onChange={(v) => setEss({ ...ess, [k]: v })} /></div>)}
          <div className="g8-row tot"><span>Total essentials</span><b>{cop(monthly)}</b></div>
          <div className="g72-machine">{Ctl({ l: "🎯 Months of essentials", v: months, set: setMonths, mn: 1, mx: 6, stp: 1, fmt: (x) => `${x} mo` })}{Ctl({ l: "🔄 I can save per month", v: refill, set: setRefill, mn: 10000, mx: 500000, stp: 10000, fmt: cop })}</div>
        </div>
        <div className="start-block g82-goalcalc">
          <h3>🛟 My fund</h3>
          <div className="g8-row"><span>🥉 First milestone (1 month)</span><b>{cop(first)}</b></div>
          <div className="g8-row tot"><span>🎯 Target ({months} months)</span><b>{cop(target)}</b></div>
          <div className="g8-row"><span>⏱️ Time to build it</span><b>{refill ? `${Math.ceil(target / refill)} months` : "—"}</b></div>
          <p className="start-tip">Start small: the first milestone already protects you from many surprises.</p>
        </div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> Where will I keep it?</h3>
        <div className="g8-pick">{WHERE15.map((x) => <button key={x.id} type="button" className={where === x.id ? "on" : ""} onClick={() => setWhere(x.id)}><em>{x.e}</em><b>{x.n}</b>{where === x.id && <i>✓</i>}</button>)}</div>
        {W && <div className={`p1-banner ${W.ok ? "good" : "bad"}`}><span>{W.why}</span></div>}
      </div>
      <div className="start-block">
        <h3><span className="step-n">3</span> My rules (choose 3+ good ones)</h3>
        <div className="g74-rules">{RULES15.map((r, i) => <button key={r.t} type="button" className={rules.includes(i) ? (r.ok ? "on" : "bad") : ""} onClick={() => setRules(rules.includes(i) ? rules.filter((x) => x !== i) : [...rules, i])}>{rules.includes(i) ? (r.ok ? "✅ " : "🚩 ") : ""}{r.t}</button>)}</div>
        {badRules.map((i) => <div key={i} className="p1-banner bad"><span>🚩 <b>{RULES15[i].t}</b> — {RULES15[i].why}</span></div>)}
      </div>
      <div className="start-block">
        <h3><PenLine size={18} /> My emergency plan in words</h3>
        <Starters items={["My emergency fund will be", "because", "I will keep it in", "I will use it only when"]} onPick={appendStarter(setTxt)} />
        <WordField value={txt} onChange={setTxt} min={25} max={90} rows={4} goals={G} placeholder="Write your plan here…" />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { ess, monthly, months, target, where, whereName: W?.n, rules, rulesT: rules.map((i) => RULES15[i].t), refill, text: txt })}>Save page 05 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 16 · THE 10% ILLUSION
   ===================================================================== */
const START_16 = {
  cards: [
    { e: "💸", t: "Interest", d: "Money paid for the use of money. Savers can earn it; borrowers pay it.", ex: "Save $1,000,000 → +$100,000 in a year." },
    { e: "📊", t: "Interest rate", d: "The % of interest for a period of time.", ex: "10% per year." },
    { e: "📆", t: "EA (effective annual)", d: "The real yearly effect of the interest. Used in Colombia to compare.", ex: "10% EA." },
    { e: "🗓️", t: "Monthly rate", d: "The rate for one month. 10% EA ≈ 0.797% a month (not 10 ÷ 12!).", ex: "0.797% monthly." },
    { e: "❄️", t: "Compound interest", d: "Interest on interest — like a snowball.", ex: "Month 2 earns on month 1's interest." },
    { e: "🎈", t: "Inflation", d: "Prices go up, so money buys less.", ex: "6% a year." },
    { e: "🎯", t: "Real rate", d: "Your gain AFTER inflation: (1 + rate) ÷ (1 + inflation) − 1.", ex: "10% and 6% → ≈ 3.77%." },
  ],
  rounds: [
    { tag: "QUICK 1", q: "$1,000,000 at 10% EA for one year =", answer: 1100000, money: true, hint: "1,000,000 × 1.10", explain: "$1,100,000 (before fees and taxes)." },
    { tag: "QUICK 2", q: "Savings +8%, inflation +8%. Real gain ≈", options: ["0%", "16%", "8%"], correct: 0, explain: "Your money buys the same as before." },
    { tag: "QUICK 3", q: "Is 10% EA the same as 10% a month?", options: ["No — 10% a month is MUCH bigger", "Yes, they are the same because both say ten percent", "Only in December"], correct: 0, explain: "10% a month ≈ 214% a year!" },
    { tag: "QUICK 4", q: "Compound interest means…", options: ["Interest on interest", "A bank fee that you pay every time you deposit money", "A discount"], correct: 0, explain: "The snowball effect." },
  ],
};
const monthlyEq = (ea) => (Math.pow(1 + ea / 100, 1 / 12) - 1) * 100;
const realRate = (n, i) => ((1 + n / 100) / (1 + i / 100) - 1) * 100;
const OFFERS16 = <MiniTable head={["Offer", "Rate", "Conditions"]} rows={[["🏦 Bank A", "12% EA", "Withdraw anytime"], ["📲 Bank B", "1% monthly (compound)", "Withdraw anytime"], ["📜 Offer C", "15% EA", "No withdrawals for 1 year"], ["🏧 Bank D", "10% EA", "$5,000 fee every month"]]} />;
/* ---------- CAJA DE HERRAMIENTAS: fórmulas con calculadora (el estudiante pone los valores) ---------- */
const f2 = (x, d = 2) => (Number.isFinite(x) ? x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }) : "—");
const RC_TABS = [
  { id: "a2m", e: "📆➜🗓️", t: "Annual → Monthly", use: "To know the rate for ONE month." },
  { id: "m2a", e: "🗓️➜📆", t: "Monthly → Annual", use: "To compare a monthly rate with an EA rate." },
  { id: "real", e: "🎈", t: "Real rate", use: "To know your gain AFTER inflation." },
  { id: "bal", e: "💰", t: "Final balance", use: "To know how much money you will have (minus fees)." },
];
function NumBox({ label, value, set, unit, step = "any" }) {
  return (
    <label className="g82-nb"><span>{label}</span><div><input type="number" inputMode="decimal" step={step} value={value} onChange={(e) => set(e.target.value)} placeholder="0" /><i>{unit}</i></div></label>
  );
}
function RateCalc({ open: open0 = true }) {
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
  const T = RC_TABS.find((x) => x.id === tab);
  const vEa = num(ea), vMo = num(mo), vN = num(nom), vI = num(inf), vD = num(dep), vR = num(r), vM = num(m), vF = num(fee);
  const a2m = (Math.pow(1 + vEa / 100, 1 / 12) - 1) * 100;
  const m2a = (Math.pow(1 + vMo / 100, 12) - 1) * 100;
  const real = ((1 + vN / 100) / (1 + vI / 100) - 1) * 100;
  const grow = vD * Math.pow(1 + vR / 100, vM / 12);
  const bal = grow - vF * vM;
  return (
    <div className={`g82-calc ${open ? "open" : ""}`}>
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
          <p className="g82-calc-tip">✏️ Remember: % → decimal = divide by 100 (10% = 0.10 · 0.8% = 0.008)</p>
        </>
      )}
    </div>
  );
}

/* ---------- RATE TRANSLATOR (versión guiada) ---------- */
const LEARN16 = [
  { e: "💸", t: "1 · What is a rate?", d: "A rate is a % that tells you how much your money grows in a PERIOD of time. Always ask: per month or per year?", ex: [["You save", "$1,000,000"], ["Rate", "10% per year (EA)"], ["After 1 year", "$1,100,000"]], q: "A bank pays 10% EA. You save $500,000 for one year. You will have…", opts: ["$550,000", "$510,000", "$5,000,000"], ok: 0, why: "500,000 × 1.10 = 550,000 (10% of 500,000 = 50,000)." },
  { e: "❄️", t: "2 · Interest on interest", d: "Every month, the bank pays interest on your money AND on the interest you already earned. That's why 12 small monthly rates make a bigger annual rate. And that's why you can't just do 10 ÷ 12.", ex: [["Month 1", "$1,000,000 → $1,007,970"], ["Month 2", "$1,007,970 → $1,016,004"], ["…", "…"], ["Month 12", "→ $1,100,000 (10%)"]], q: "Why is the monthly rate for 10% EA a little LESS than 10 ÷ 12?", opts: ["Because interest also earns interest", "Because banks keep some money", "Because a year has 13 months"], ok: 0, why: "The small monthly rate grows like a snowball until it reaches 10%. Use the calculator: 📆➜🗓️." },
  { e: "🎈", t: "3 · The inflation thief", d: "If prices go up 6% and your money grows 10%, you are NOT 10% richer. Your REAL gain is about 10 − 6 = 4% (exactly 3.77%).", ex: [["Money grows", "+10%"], ["Prices grow", "+6%"], ["Real gain", "≈ +4% (3.77%)"]], q: "Your savings grow 5%. Prices grow 7%. What happens?", opts: ["You can buy LESS than before", "You are 12% richer", "Nothing changes"], ok: 0, why: "5 − 7 ≈ −2%: inflation is bigger than your rate." },
];
function RateTranslator({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [li, setLi] = useState(0);
  const [la, setLa] = useState({});
  const [ea, setEa] = useState(10);
  const [inf, setInf] = useState(6);
  const [dep, setDep] = useState(1000000);
  const [touched, setTouched] = useState({});
  const [st, finish] = useFinish(onSave);
  const t = (k) => setTouched((x) => ({ ...x, [k]: true }));
  const me = monthlyEq(ea), rr = realRate(ea, inf);
  const bal = Array.from({ length: 13 }, (_, m) => Math.round(dep * Math.pow(1 + me / 100, m)));
  const pp = bal.map((b, m) => Math.round(b / Math.pow(1 + inf / 100, m / 12)));
  const L = LEARN16[li];
  const learnOk = LEARN16.every((_, k) => la[k] !== undefined);
  const R16 = [
    { tag: "DETECTIVE 1", q: "Bank A pays 12% EA. Bank B pays 1% MONTHLY (compound). Which leaves more after one year?", visual: <>{OFFERS16}<p className="g82-hintline">🧮 Calculator: <b>🗓️➜📆 Monthly → Annual</b>. Type 1 and compare with 12% EA.</p></>, options: ["Bank B (≈ 12.68% EA)", "Bank A, because 12 is bigger than 1", "They are exactly the same"], correct: 0, hint: "Put 1 in the Monthly → Annual calculator. Is the result bigger or smaller than 12%?", explain: "(1.01)^12 − 1 ≈ 12.68% EA — more than 12%." },
    { tag: "DETECTIVE 2", q: "Bank D: $2,000,000 at 10% EA for 12 months, but it charges $5,000 every month. Final balance?", visual: <>{OFFERS16}<p className="g82-hintline">🧮 Calculator: <b>💰 Final balance</b>. Deposit 2000000 · rate 10 · months 12 · fee 5000.</p></>, answer: 2140000, money: true, tol: 1000, hint: "2,000,000 × 1.10 = 2,200,000. Then subtract 12 × 5,000.", explain: "$2,200,000 − $60,000 in fees = $2,140,000." },
    { tag: "DETECTIVE 3", q: "You need the money for a trip in 2 months. Which offer fits best?", visual: OFFERS16, options: ["Bank B — easy access and a good rate", "Offer C, because 15% is the highest rate", "None of them"], correct: 0, hint: "Look at the CONDITIONS column, not only the rate.", explain: "Offer C locks your money for a year!" },
    { tag: "DETECTIVE 4", q: "9% nominal rate, 5% inflation. The real rate is about…", visual: <p className="g82-hintline">🧮 Calculator: <b>🎈 Real rate</b>. Rate 9 · inflation 5. Quick estimate: 9 − 5.</p>, options: ["≈ 3.8%", "14%, because you add them", "4.5%"], correct: 0, hint: "Quick estimate: 9 − 5 = 4. The exact answer is a little less.", explain: "1.09 ÷ 1.05 − 1 ≈ 3.81%." },
    { tag: "DETECTIVE 5", q: "Your savings earn 6% EA. Inflation is 7%. What happens?", visual: <p className="g82-hintline">🧮 Calculator: <b>🎈 Real rate</b>. Rate 6 · inflation 7.</p>, options: ["You lose purchasing power", "You gain 13% in a year", "You gain exactly 6%"], correct: 0, hint: "6 − 7 is negative…", explain: "Real rate ≈ −0.9%: your money buys a little less." },
    { tag: "DETECTIVE 6", q: "What is the MONTHLY rate equivalent to 12% EA? (round to 2 decimals)", visual: <p className="g82-hintline">🧮 Calculator: <b>📆➜🗓️ Annual → Monthly</b>. Type 12.</p>, answer: 0.95, tol: 0.01, unit: "%", hint: "Use the Annual → Monthly calculator with 12. It's a little less than 12 ÷ 12 = 1.", explain: "(1.12)^(1/12) − 1 ≈ 0.95% a month." },
  ];
  const explored = Object.keys(touched).length >= 3;
  if (st.done) return <Reward title="Rate detective! 🔎" subtitle="10% is not always 10% — and now you can prove it." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Percent size={22} strokeWidth={2.1} />} title="Rate Translator 🔎" subtitle="Learn the 3 ideas · explore · investigate with your calculator." onExit={onExit}>
      <div className="g72-steps">{["1 · Learn in 3 steps", "2 · Explore the console", "3 · Investigate offers"].map((s, i) => <span key={s} className={stage === i ? "on" : stage > i ? "done" : ""}>{s}</span>)}</div>
      {stage === 0 && (
        <>
          <div className="g82-dots">{LEARN16.map((_, k) => <i key={k} className={la[k] !== undefined ? "done" : k === li ? "now" : ""} />)}</div>
          <div className="g82-learn" key={li}>
            <header><em>{L.e}</em><b>{L.t}</b></header>
            <p>{L.d}</p>
            <MiniTable head={["Example", "Numbers"]} rows={L.ex} />
            <div className="g82-ask"><b>🤔 {L.q}</b>
              <div>{L.opts.map((o, k) => <button key={o} type="button" disabled={la[li] !== undefined} className={la[li] === undefined ? "" : k === L.ok ? "ok" : k === la[li] ? "no" : ""} onClick={() => setLa({ ...la, [li]: k })}>{o}</button>)}</div>
              {la[li] !== undefined && <p>{la[li] === L.ok ? "✅ " : "❌ "}{L.why}</p>}
            </div>
          </div>
          {li === 1 && <RateCalc />}
          <div className="start-foot">{li > 0 && <button className="s1-btn ghost" onClick={() => setLi(li - 1)}><ArrowLeft size={15} /> Back</button>}{li < LEARN16.length - 1 ? <button className="s1-btn primary big" disabled={la[li] === undefined} onClick={() => setLi(li + 1)}>Next idea <ChevronRight size={18} /></button> : <button className="s1-btn primary big" disabled={!learnOk} onClick={() => setStage(1)}>Explore the console <ChevronRight size={18} /></button>}</div>
        </>
      )}
      {stage === 1 && (
        <>
          <HowTo>Move the 3 controls. <b>Green line</b> = your money in the account. <b>Orange line</b> = what that money can really BUY after inflation. When orange goes DOWN, inflation is winning!</HowTo>
          <div className="g82-console">
            {Ctl({ l: "📆 Annual rate (EA)", v: ea, set: (v) => { setEa(v); t("ea"); }, mn: 0, mx: 25, stp: 0.5, fmt: (x) => `${x}%` })}
            {Ctl({ l: "🎈 Inflation per year", v: inf, set: (v) => { setInf(v); t("inf"); }, mn: 0, mx: 15, stp: 0.5, fmt: (x) => `${x}%` })}
            {Ctl({ l: "💵 Money I save", v: dep, set: (v) => { setDep(v); t("dep"); }, mn: 100000, mx: 5000000, stp: 100000, fmt: cop })}
          </div>
          <div className="g82-readout">
            <div><small>Rate per MONTH</small><b>{me.toFixed(2)}%</b><span>{ea}% a year ≈ {me.toFixed(2)}% each month</span></div>
            <div className={rr < 0 ? "bad" : "good"}><small>REAL gain (after inflation)</small><b>{rr.toFixed(1)}%</b><span>≈ {ea} − {inf} = {(ea - inf).toFixed(1)}% · {rr < 0 ? "you LOSE buying power" : "you gain buying power"}</span></div>
            <div><small>Money after 1 year</small><b>{cop(bal[12])}</b><span>+{cop(bal[12] - dep)} of interest</span></div>
          </div>
          <LineChart series={[{ name: "Balance", values: bal, color: "#0b7a50" }, { name: "What it can buy", values: pp, color: "#e07a2f" }]} labels={bal.map((_, m) => (m === 0 ? "Start" : `M${m}`))} height={210} />
          <ChartLegend series={[{ name: "My money (balance)", color: "#0b7a50" }, { name: "What it can buy (real)", color: "#e07a2f" }]} />
          <p className="start-tip">🧪 Try this: put inflation <b>higher</b> than the rate. What happens to the orange line?</p>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!explored} onClick={() => setStage(2)}>{explored ? "Investigate 6 offers" : `Move the 3 controls first (${Object.keys(touched).length}/3)`} <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 2 && (
        <>
          <HowTo>Use the <b>🧮 calculator</b>: choose the right formula, type the numbers from the question and read the result. Each question tells you which calculator to use.</HowTo>
          <RateCalc />
          <RoundsRunner rounds={R16} doneLabel="Finish" onDone={(r) => finish(18 + r.firstTry * 3, { firstTry: r.firstTry })} />
        </>
      )}
    </ActShell>
  );
}

const RUSH_REAL = {
  buckets: [{ id: "gain", e: "📈", l: "Real gain", d: "Rate > inflation.", c: "#0b7a50" }, { id: "loss", e: "📉", l: "Real loss", d: "Rate < inflation.", c: "#ff6b57" }],
  items: [
    { e: "🏦", t: "Savings 10% EA · inflation 6%", b: "gain", why: "≈ +3.8% real." }, { e: "🐷", t: "Cash at home 0% · inflation 5%", b: "loss", why: "Prices grow, your cash doesn't." },
    { e: "📲", t: "Pocket 4% EA · inflation 7%", b: "loss", why: "≈ −2.8% real." }, { e: "📜", t: "CDT 11% EA · inflation 5%", b: "gain", why: "≈ +5.7% real." },
    { e: "💳", t: "Account 2% EA · inflation 3%", b: "loss", why: "Slightly below inflation." }, { e: "🏧", t: "Account 9% EA · inflation 4%", b: "gain", why: "≈ +4.8% real." },
    { e: "🪙", t: "Coins in a jar for 2 years · inflation 6% a year", b: "loss", why: "No interest at all." }, { e: "🏦", t: "Savings 7% EA · inflation 6.5%", b: "gain", why: "Small, but positive." },
    { e: "📲", t: "App 5% EA · inflation 9%", b: "loss", why: "≈ −3.7% real." }, { e: "📜", t: "Deposit 13% EA · inflation 8%", b: "gain", why: "≈ +4.6% real." },
    { e: "🏦", t: "Savings 6% EA · inflation 6%", b: "loss", why: "0% real — and fees make it negative!" }, { e: "💰", t: "Account 12% EA · inflation 3%", b: "gain", why: "≈ +8.7% real." },
  ],
};

/* ---------- PORTFOLIO 06 · MY GOAL WITH INTEREST ---------- */
function GoalWithInterest({ resp, existing, onSave, onExit }) {
  const g = resp?.c12_goal;
  const months = g?.months || 12;
  const monthly = Math.round((g?.weekly || 10000) * 4.33);
  const startAmt = g?.start || 0;
  const [rb, setRb] = useState(existing?.rateB ?? 8);
  const [inf, setInf] = useState(existing?.inf ?? 5);
  const [txt, setTxt] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const sim = (r) => { const mr = monthlyEq(r) / 100; let b = startAmt; const h = [b]; for (let m = 1; m <= months; m++) { b = b * (1 + mr) + monthly; h.push(Math.round(b)); } return h; };
  const A = sim(0), B = sim(rb);
  const realB = Math.round(B[months] / Math.pow(1 + inf / 100, months / 12));
  const G = [W_NUMBERS(2), W_CONTRAST];
  const step = Math.max(1, Math.round(months / 12));
  const idx = Array.from({ length: months + 1 }, (_, i) => i).filter((i) => i % step === 0 || i === months);
  if (st.done) return <Reward title="Page 06 ready! 📈" subtitle="Nominal vs. real — you know the difference." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<TrendingUp size={22} strokeWidth={2.1} />} title="My Goal with Interest 📈" subtitle="Two scenarios for YOUR goal: a pocket with 0% vs. an account with interest." onExit={onExit}>
      <PFBadge n="06" />
      {!g && <div className="p1-hint">💡 You haven't created your goal (Class 12) — we use an example: $10,000 a week for 12 months.</div>}
      <Mission e="🎯" title={`${g?.what || "Example goal"} · ${cop(monthly)} a month · ${months} months · start ${cop(startAmt)}`}>Scenario A: a pocket that pays 0%. Scenario B: an account with interest. Move the rate and the inflation.</Mission>
      <div className="g72-machine">{Ctl({ l: "🏦 Scenario B rate (EA)", v: rb, set: setRb, mn: 0, mx: 15, stp: 0.5, fmt: (x) => `${x}%` })}{Ctl({ l: "🎈 Inflation", v: inf, set: setInf, mn: 0, mx: 12, stp: 0.5, fmt: (x) => `${x}%` })}</div>
      <LineChart series={[{ name: "A · 0%", values: idx.map((i) => A[i]), color: "#f5b23e" }, { name: `B · ${rb}% EA`, values: idx.map((i) => B[i]), color: "#0b7a50" }]} labels={idx.map((i) => (i === 0 ? "Now" : `M${i}`))} height={210} />
      <ChartLegend series={[{ name: "A · pocket 0%", color: "#f5b23e" }, { name: `B · account ${rb}% EA`, color: "#0b7a50" }]} />
      <MiniTable head={["", "A · 0%", `B · ${rb}% EA`]} rows={[["Monthly rate", "0%", `${monthlyEq(rb).toFixed(3)}%`], ["Final balance", cop(A[months]), cop(B[months])], ["Interest earned", "$0", cop(B[months] - A[months])], [`Real value (inflation ${inf}%)`, cop(Math.round(A[months] / Math.pow(1 + inf / 100, months / 12))), cop(realB)], ["Real rate", `${realRate(0, inf).toFixed(2)}%`, `${realRate(rb, inf).toFixed(2)}%`]]} />
      <div className="start-block">
        <h3><PenLine size={18} /> Why nominal is not the same as real</h3>
        <Starters items={["In scenario B, I would have", "compared with", "However, after inflation", "My real rate is"]} onPick={appendStarter(setTxt)} />
        <WordField value={txt} onChange={setTxt} min={30} max={100} rows={4} goals={G} placeholder="Write your answer here…" />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(txt, 30, 100, G)} onClick={() => finish(28, { rateB: rb, inf, finalA: A[months], finalB: B[months], realB, monthlyRate: monthlyEq(rb), text: txt })}>Save page 06 <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 17 · THE FINE PRINT CHALLENGE
   ===================================================================== */
const START_17 = {
  cards: [
    { e: "🏦", t: "Savings account", d: "A bank account to deposit and withdraw money under its rules.", ex: "Check fees and minimum balance." },
    { e: "📲", t: "Digital pocket", d: "A space inside an app to separate money for a goal.", ex: "“Trip pocket”." },
    { e: "📜", t: "CDT", d: "Certificado de Depósito a Término: a deposit for a fixed time with a fixed rate.", ex: "12 months at 9% EA." },
    { e: "💧", t: "Liquidity", d: "How fast and easily you can use your money.", ex: "Pocket = high · CDT = low." },
    { e: "🧾", t: "Fees", d: "Costs a product charges you.", ex: "$5,000 a month." },
    { e: "🛡️", t: "Deposit insurance", d: "In Colombia, Fogafín protects eligible deposits at covered institutions (with limits).", ex: "Check if your product qualifies." },
    { e: "🚩", t: "Fraud", d: "A trick to take your money: huge guaranteed returns, pressure, recruiting.", ex: "“10% a month, guaranteed!”" },
  ],
  rounds: [
    { tag: "QUICK 1", q: "You need money for an emergency. The most important feature is…", options: ["Liquidity", "The highest rate", "A nice app"], correct: 0, explain: "Emergencies need fast access." },
    { tag: "QUICK 2", q: "“Earn 10% every month, guaranteed! Invite friends!” is…", options: ["A red flag 🚩", "A normal CDT", "A savings account"], correct: 0, explain: "Too good to be true." },
    { tag: "QUICK 3", q: "An account pays 6% EA but charges $8,000 a month on $500,000. Is it a good deal?", options: ["No — fees eat the interest", "Yes — 6% EA is a good rate, so the fees are not important", "Fees don't matter"], correct: 0, explain: "Interest ≈ $30,000/yr · fees = $96,000/yr!" },
    { tag: "QUICK 4", q: "A CDT usually…", options: ["Has a fixed term", "Lets you withdraw daily", "Has no rate"], correct: 0, explain: "Your money waits until maturity." },
  ],
};
const PRODS17 = [
  { id: "flex", e: "🏦", n: "Flexible Savings Account", rate: "6% EA", access: "Withdrawals under the account's rules", cost: "No monthly fee in this example", prot: "Eligible product at a covered institution" },
  { id: "pocket", e: "📲", n: "Goal Pocket", rate: "4% EA", access: "Easy access inside the app", cost: "No fee in this example", prot: "Depends on the institution and the product" },
  { id: "cdt", e: "📜", n: "12-Month CDT", rate: "9% EA", access: "No withdrawals until maturity — review the contract", cost: "Terms vary by offer", prot: "Verify eligibility and conditions" },
  { id: "scam", e: "💎", n: "Quick Profit Club", rate: "10% MONTHLY guaranteed", access: "Unclear withdrawal rules", cost: "You must recruit new members", prot: "Not verified" },
];
const CUST17 = [
  { id: "a", e: "🎒", n: "Customer A · School trip in 4 months", d: "Needs the money in 4 months — and maybe some of it earlier.", fit: { flex: 3, pocket: 3, cdt: 0, scam: -2 }, why: { flex: "✅ Access + some interest.", pocket: "✅ Easy access, organized by goal.", cdt: "❌ Locked for 12 months — the trip is in 4!", scam: "🚩 Never. It's a fraud pattern." } },
  { id: "b", e: "📱", n: "Customer B · Tablet in 18 months", d: "Won't need the money for more than a year.", fit: { cdt: 3, flex: 2, pocket: 1, scam: -2 }, why: { cdt: "✅ A higher rate for money that can wait 12 months.", flex: "👍 OK — flexible, but a lower rate.", pocket: "🤔 Works, but the lowest rate for a long goal.", scam: "🚩 Never. It's a fraud pattern." } },
  { id: "c", e: "🛟", n: "Customer C · Emergency reserve", d: "Money for surprises — must be ready ANY day.", fit: { flex: 3, pocket: 3, cdt: 0, scam: -2 }, why: { flex: "✅ Liquid and protected.", pocket: "✅ Liquid and separated.", cdt: "❌ Emergencies can't wait until maturity.", scam: "🚩 Never. It's a fraud pattern." } },
];
function ProductLab({ onSave, onExit }) {
  const [ci, setCi] = useState(0);
  const [open, setOpen] = useState({});
  const [pick, setPick] = useState({});
  const [flag, setFlag] = useState(false);
  const [why, setWhy] = useState("");
  const [st, finish] = useFinish(onSave);
  const C = CUST17[ci];
  const inspected = Object.keys(open).length;
  const score = CUST17.reduce((a, c) => a + (pick[c.id] ? c.fit[pick[c.id]] : 0), 0);
  const allPicked = CUST17.every((c) => pick[c.id]);
  const GW = [W_REASON];
  const ready = allPicked && inspected >= 4 && goalsOk(why, 15, 70, GW);
  if (st.done) return <Reward title="Fine print master! 🔍" subtitle={`Score ${score}/9${flag ? " · scam reported 🚩" : ""}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Savings Product Lab 🔍" subtitle="Three customers. Four offers. The highest rate does NOT win automatically." onExit={onExit}>
      <HowTo>1) Open the <b>fine print</b> of the 4 offers. 2) Choose the best product for <b>each</b> customer. 3) One offer is dangerous — <b>report it</b> 🚩.</HowTo>
      <div className="p1-match-stats"><span>🔍 Fine print read: <b>{inspected}/4</b></span><span>Score: <b>{score}</b>/9</span></div>
      <div className="g82-offers">{PRODS17.map((p) => (
        <div key={p.id} className={`g82-offer ${open[p.id] ? "open" : ""} ${p.id === "scam" && flag ? "flagged" : ""}`}>
          <header><em>{p.e}</em><b>{p.n}</b><span>{p.rate}</span></header>
          {open[p.id] ? (
            <ul><li><small>Access</small>{p.access}</li><li><small>Costs</small>{p.cost}</li><li><small>Protection</small>{p.prot}</li></ul>
          ) : <button type="button" className="g82-fine" onClick={() => setOpen({ ...open, [p.id]: true })}>🔍 Read the fine print</button>}
          {p.id === "scam" && open.scam && <button type="button" className={`g82-report ${flag ? "on" : ""}`} onClick={() => setFlag(true)}>{flag ? "🚩 Reported!" : "🚩 Report as suspicious"}</button>}
        </div>
      ))}</div>
      {flag && <div className="p1-banner good"><Check size={18} /> <span><b>Great detective work!</b> Huge guaranteed returns + recruiting + unclear rules = classic fraud.</span></div>}
      <div className="g8-homes">{CUST17.map((c, i) => <button key={c.id} type="button" className={`${ci === i ? "on" : ""} ${pick[c.id] ? "seen" : ""}`} onClick={() => setCi(i)}><em>{c.e}</em><b>{c.n.split(" · ")[0]}</b><small>{pick[c.id] ? `${PRODS17.find((p) => p.id === pick[c.id]).e} chosen` : "—"}</small></button>)}</div>
      <div className="start-block">
        <h3>{C.e} {C.n}</h3><p className="start-tip">{C.d}</p>
        <div className="g8-pick">{PRODS17.map((p) => <button key={p.id} type="button" className={pick[C.id] === p.id ? "on" : ""} onClick={() => setPick({ ...pick, [C.id]: p.id })}><em>{p.e}</em><b>{p.n}</b><small>{p.rate}</small>{pick[C.id] === p.id && <i>✓</i>}</button>)}</div>
        {pick[C.id] && <div className={`p1-banner ${C.fit[pick[C.id]] >= 2 ? "good" : "bad"}`}><span>{C.why[pick[C.id]]}</span></div>}
      </div>
      {allPicked && (
        <div className="start-block">
          <h3><PenLine size={18} /> Explain ONE of your choices</h3>
          <Starters items={["For customer", "I recommend", "because", "the money is ready when"]} onPick={appendStarter(setWhy)} />
          <WordField value={why} onChange={setWhy} min={15} max={70} rows={3} goals={GW} placeholder="Write your answer here…" />
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(14 + Math.max(0, score) * 2 + (flag ? 4 : 0), { picks: pick, score, flagged: flag, why })}>{inspected < 4 ? "Read all the fine print" : "Send my advice"} <span className="coin-tag"><Coins size={15} /> +{14 + Math.max(0, score) * 2 + (flag ? 4 : 0)}</span></button></div>
    </ActShell>
  );
}

const RUSH_SCAM = {
  buckets: [{ id: "ok", e: "✅", l: "Looks legitimate", d: "Clear conditions and information.", c: "#0b7a50" }, { id: "flag", e: "🚩", l: "Too good to be true", d: "Warning signs of fraud.", c: "#ff6b57" }],
  items: [
    { e: "💎", t: "“Earn 10% EVERY MONTH, guaranteed, no risk!”", b: "flag", why: "No real product guarantees that." }, { e: "📜", t: "CDT: 9% EA for 12 months, contract and conditions explained", b: "ok", why: "Clear rate, term and contract." },
    { e: "👯", t: "“Invite 3 friends and double your money”", b: "flag", why: "Recruiting = pyramid pattern." }, { e: "🏦", t: "Savings account with fees and rules published on the website", b: "ok", why: "Transparent conditions." },
    { e: "⏰", t: "“Only today! Send money in the next 30 minutes”", b: "flag", why: "Pressure is a red flag." }, { e: "🛡️", t: "The bank explains which deposits are insured and the limits", b: "ok", why: "Honest information about protection." },
    { e: "❓", t: "Nobody explains how the profit is generated", b: "flag", why: "Legit products explain the return." }, { e: "📲", t: "A goal pocket that pays 4% EA, withdraw anytime", b: "ok", why: "Normal, modest rate." },
    { e: "💬", t: "A stranger on WhatsApp offers “investments” with screenshots of profits", b: "flag", why: "Screenshots are easy to fake." }, { e: "📄", t: "You can read the full terms before signing", b: "ok", why: "Good sign." },
    { e: "🪙", t: "“Send us your bank password to receive your profits”", b: "flag", why: "NEVER share passwords." }, { e: "🏢", t: "A regulated institution with an official address and contact", b: "ok", why: "You can verify it." },
  ],
};

/* ---------- PORTFOLIO 07 · WHERE I'LL KEEP MY SAVINGS ---------- */
const Q5_17 = ["📊 What is the rate (EA)?", "🧾 What fees apply?", "💵 Is there a minimum to open it?", "💧 Can I withdraw when I need it?", "🛡️ What protection applies?"];
function WhereKeep({ resp, existing, onSave, onExit }) {
  const goal = resp?.c12_goal, em = resp?.c15_page;
  const [g, setG] = useState(existing?.goalProd || null);
  const [e, setE] = useState(existing?.emProd || null);
  const [qs, setQs] = useState(existing?.qs || []);
  const [txt, setTxt] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const goalLong = (goal?.months || 6) >= 12;
  const fitG = (p) => (p === "scam" ? 0 : p === "cdt" ? (goalLong ? 3 : 0) : 2);
  const fitE = (p) => (p === "flex" || p === "pocket" ? 3 : 0);
  const G = [W_REASON, W_CONTRAST];
  const ready = g && e && fitG(g) > 0 && fitE(e) > 0 && qs.length === 5 && goalsOk(txt, 30, 100, G);
  if (st.done) return <Reward title="Page 07 ready! 🏦" subtitle="Your money has a safe home." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Landmark size={22} strokeWidth={2.1} />} title="Where I'll Keep My Savings 🏦" subtitle="You don't need ONE product for everything." onExit={onExit}>
      <PFBadge n="07" />
      <div className="g8-two">
        <div className="start-block">
          <h3>🎯 For my goal{goal ? `: ${goal.what} (${goal.months} months)` : ""}</h3>
          <div className="g8-pick">{PRODS17.map((p) => <button key={p.id} type="button" className={g === p.id ? "on" : ""} onClick={() => setG(p.id)}><em>{p.e}</em><b>{p.n}</b><small>{p.rate}</small>{g === p.id && <i>✓</i>}</button>)}</div>
          {g && <div className={`p1-banner ${fitG(g) ? "good" : "bad"}`}><span>{g === "scam" ? "🚩 Never put your goal in a suspicious offer." : g === "cdt" ? (goalLong ? "✅ Your goal is 12+ months away — a CDT can work." : "❌ Your goal comes before the CDT matures.") : "✅ Flexible — good for your goal."}</span></div>}
        </div>
        <div className="start-block">
          <h3>🛟 For my emergency fund{em ? ` (${cop(em.target)})` : ""}</h3>
          <div className="g8-pick">{PRODS17.map((p) => <button key={p.id} type="button" className={e === p.id ? "on" : ""} onClick={() => setE(p.id)}><em>{p.e}</em><b>{p.n}</b><small>{p.rate}</small>{e === p.id && <i>✓</i>}</button>)}</div>
          {e && <div className={`p1-banner ${fitE(e) ? "good" : "bad"}`}><span>{fitE(e) ? "✅ Liquid — ready for any surprise." : "❌ An emergency fund needs liquidity (and safety)."}</span></div>}
        </div>
      </div>
      <div className="start-block">
        <h3>✅ I checked the 5 questions</h3>
        {Q5_17.map((q) => <label key={q} className="perm-check p1-check"><input type="checkbox" checked={qs.includes(q)} onChange={() => setQs(qs.includes(q) ? qs.filter((x) => x !== q) : [...qs, q])} /><span>{q}</span></label>)}
      </div>
      <div className="start-block">
        <h3><PenLine size={18} /> My decision</h3>
        <Starters items={["I will keep my goal money in", "because", "However, my emergency fund", "compared with"]} onPick={appendStarter(setTxt)} />
        <WordField value={txt} onChange={setTxt} min={30} max={100} rows={4} goals={G} placeholder="Write your answer here…" />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(28, { goalProd: g, emProd: e, goalName: PRODS17.find((p) => p.id === g)?.n, emName: PRODS17.find((p) => p.id === e)?.n, qs, text: txt })}>Save page 07 <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 18 · BUILD IT WITHOUT BORROWING
   ===================================================================== */
const START_18 = {
  cards: [
    { e: "💰", t: "Capital", d: "The money you need to START a business.", ex: "$1,200,000 for equipment." },
    { e: "🥾", t: "Bootstrapping", d: "Starting a business with your own savings and profits, without big loans.", ex: "Start small, grow step by step." },
    { e: "🏦", t: "Loan", d: "Borrowed money you must pay back WITH interest.", ex: "$1,000,000 at 2% a month." },
    { e: "📅", t: "Installment", d: "The fixed payment you make every month for a loan.", ex: "$94,560 × 12 months." },
    { e: "💸", t: "Total interest", d: "The extra money you pay for borrowing.", ex: "Paid $1,134,720 for $1,000,000." },
    { e: "🧪", t: "MVP", d: "Minimum viable product: the simplest version to start and test.", ex: "10 cases, not 500." },
    { e: "🔁", t: "Reinvest", d: "Use your profits to grow the business.", ex: "Profit → a better machine." },
  ],
  pairs: [
    { a: "Capital", b: "Money to start a business" }, { a: "Bootstrapping", b: "Starting with your own money" }, { a: "Loan", b: "Money you must pay back with interest" },
    { a: "Installment", b: "A fixed monthly payment" }, { a: "MVP", b: "The simplest version to test" }, { a: "Reinvest", b: "Use profits to grow" },
  ],
};
const FOUNDERS = [
  { e: "🧁", n: "Sara · Cupcake Corner", s: "Sara wants an oven ($300,000) and fancy boxes ($150,000).", q: "What should she do?", opts: ["Start with mom's oven and simple boxes", "Borrow $450,000 to start “big”"], ok: 0, out: "She started with her mom's oven and sold 20 cupcakes a week. She saved her profits and bought her own oven in month 4 — with ZERO debt. 🥾" },
  { e: "👟", n: "Leo · Sneaker Spa", s: "Leo borrowed $500,000 at 3% a month for a professional cleaning machine. In the first 3 months he only had 6 clients.", q: "What problem will Leo have?", opts: ["The loan payments don't wait for sales", "No problem — the machine pays itself"], ok: 0, out: "His installment was $50,000 a month, but sales were slow. He paid ≈ $600,000 for a $500,000 loan and used his personal savings to pay. 😓" },
  { e: "📱", n: "Ana · Case Lab", s: "Ana has $120,000. Printing 500 phone cases costs $1,500,000.", q: "What is her best MVP?", opts: ["Print 10 cases and test which designs sell", "Wait 2 years to print 500"], ok: 0, out: "She printed 10 cases, sold 8 in a week, and learned which designs people loved. She reinvested the profits again and again. 🔁" },
];
function FounderStories({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState({});
  const [st, finish] = useFinish(onSave);
  const done = i >= FOUNDERS.length;
  const F = FOUNDERS[i];
  if (st.done) return <Reward title="Founder mindset! 🚀" subtitle="Start small. Sell. Reinvest. Grow." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Rocket size={22} strokeWidth={2.1} />} title="Founder Stories 🚀" subtitle="Three young founders. Guess what happens next." onExit={onExit}>
      <div className="g82-dots">{FOUNDERS.map((_, k) => <i key={k} className={k < i ? "done" : k === i ? "now" : ""} />)}<i className={done ? "now" : ""} /></div>
      {!done ? (
        <div className="g82-panel founder" key={i}>
          <em>{F.e}</em><small>{F.n}</small><p>{F.s}</p>
          <div className="g82-ask"><b>🤔 {F.q}</b>
            <div>{F.opts.map((o, k) => <button key={o} type="button" disabled={ans[i] !== undefined} className={ans[i] === undefined ? "" : k === F.ok ? "ok" : k === ans[i] ? "no" : ""} onClick={() => setAns({ ...ans, [i]: k })}>{o}</button>)}</div>
            {ans[i] !== undefined && <p>{F.out}</p>}
          </div>
        </div>
      ) : (
        <div className="start-block">
          <h3>🥾 Bootstrapping in 4 steps</h3>
          <div className="g82-steps4">{[["🧪", "Start small", "An MVP with what you have."], ["🛒", "Sell", "Real customers = real feedback."], ["🔁", "Reinvest", "Profits buy the next tool."], ["📈", "Grow", "Bigger steps, less risk."]].map(([e, t, d], k) => <div key={t}><span>{k + 1}</span><em>{e}</em><b>{t}</b><small>{d}</small></div>)}</div>
          <p className="start-tip">⚖️ Loans are not always bad — but they have a cost and their payments don't wait for your sales. Compare BEFORE you decide.</p>
        </div>
      )}
      <div className="start-foot">{!done ? <button className="s1-btn primary big" disabled={ans[i] === undefined} onClick={() => setI(i + 1)}>Next <ChevronRight size={18} /></button> : <button className="s1-btn primary big" onClick={() => finish(15, { answers: ans })}>Got it! <span className="coin-tag"><Coins size={15} /> +15</span></button>}</div>
    </ActShell>
  );
}

const BIZ18 = [
  { id: "juice", e: "🧃", n: "Juice stand", items: [{ n: "Blender", c: 250000, need: true }, { n: "Fruit for the first week", c: 120000, need: true }, { n: "Cups and straws", c: 60000, need: true }, { n: "Professional stand with logo", c: 450000, need: false, alt: "Folding table from home", ac: 0 }, { n: "Cooler", c: 180000, need: true, alt: "Borrow your uncle's cooler", ac: 20000 }, { n: "Card payment machine", c: 140000, need: false }] },
  { id: "tees", e: "👕", n: "T-shirt printing", items: [{ n: "Heat press", c: 600000, need: true, alt: "Rent a press by the hour", ac: 150000 }, { n: "20 blank T-shirts", c: 300000, need: true }, { n: "Vinyl and designs", c: 120000, need: true }, { n: "Professional website", c: 400000, need: false, alt: "Free social media page", ac: 0 }, { n: "Fancy packaging", c: 150000, need: false }, { n: "Laptop for designs", c: 1800000, need: false, alt: "Use the school/home computer", ac: 0 }] },
  { id: "cookie", e: "🍪", n: "Cookie delivery", items: [{ n: "Ingredients (first 100 cookies)", c: 150000, need: true }, { n: "Baking trays and mixer", c: 280000, need: true, alt: "Use the family kitchen tools", ac: 0 }, { n: "Bags and stickers", c: 60000, need: true }, { n: "Electric scooter for delivery", c: 1500000, need: false, alt: "Deliver on foot / by bike nearby", ac: 0 }, { n: "Industrial oven", c: 900000, need: false }, { n: "Instagram ads", c: 100000, need: false }] },
];
const SALES18 = [180000, 60000, 120000, 40000, 260000, 200000];
function BootstrapChallenge({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [bi, setBi] = useState(0);
  const [sel, setSel] = useState({});
  const [sav, setSav] = useState(150000);
  const [rate, setRate] = useState(2);
  const [term, setTerm] = useState(12);
  const [route, setRoute] = useState(null);
  const [st, finish] = useFinish(onSave);
  const B = BIZ18[bi];
  const choice = (k) => sel[`${B.id}-${k}`] || (B.items[k].need ? "buy" : "later");
  const setC = (k, v) => setSel({ ...sel, [`${B.id}-${k}`]: v });
  const capital = B.items.reduce((a, it, k) => a + (choice(k) === "buy" ? it.c : choice(k) === "alt" ? it.ac : 0), 0);
  const full = B.items.reduce((a, it) => a + it.c, 0);
  const missing = B.items.filter((it, k) => it.need && choice(k) === "later");
  const saveMonths = Math.ceil(capital / sav);
  const inst = Math.round(pmt(capital, rate / 100, term));
  const totalLoan = inst * term, interest = totalLoan - capital;
  const profit = SALES18.map((s) => Math.round(s * (capital / 600000 || 1)));
  const shortM = profit.filter((p) => p < inst).length;
  const months = Array.from({ length: Math.max(saveMonths, term) + 1 }, (_, i) => i);
  if (st.done) return <Reward title="Founder decision made! 🚀" subtitle={route === "save" ? `Launch in ${saveMonths} months with zero debt.` : `Launch now · ${cop(interest)} in interest.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Hammer size={22} strokeWidth={2.1} />} title="Bootstrap Challenge 🥾" subtitle="Build a business. What do you REALLY need to start?" onExit={onExit}>
      <div className="g72-steps">{["1 · Shopping list", "2 · Save or borrow?", "3 · Sales reality"].map((s, i) => <span key={s} className={stage === i ? "on" : stage > i ? "done" : ""}>{s}</span>)}</div>
      {stage === 0 && (
        <>
          <div className="g8-pick">{BIZ18.map((b, k) => <button key={b.id} type="button" className={bi === k ? "on" : ""} onClick={() => setBi(k)}><em>{b.e}</em><b>{b.n}</b>{bi === k && <i>✓</i>}</button>)}</div>
          <HowTo>For each item choose: <b>Buy now</b>, a cheaper <b>alternative</b> (rent / reuse / borrow from family) or <b>Later</b>. Items marked ⭐ are necessary to start.</HowTo>
          <div className="g82-shop">{B.items.map((it, k) => (
            <div key={it.n} className={`g82-shoprow ${it.need && choice(k) === "later" ? "bad" : ""}`}>
              <span>{it.need ? "⭐ " : ""}{it.n}<small>{cop(it.c)}</small></span>
              <div className="type-toggle"><button type="button" className={choice(k) === "buy" ? "on" : ""} onClick={() => setC(k, "buy")}>🛒 Buy now</button>{it.alt && <button type="button" className={choice(k) === "alt" ? "on" : ""} onClick={() => setC(k, "alt")}>♻️ {it.alt} ({cop(it.ac)})</button>}<button type="button" className={choice(k) === "later" ? "on" : ""} onClick={() => setC(k, "later")}>⏳ Later</button></div>
            </div>
          ))}</div>
          <div className="g8-proj"><div><small>Everything new</small><b className="neg">{cop(full)}</b></div><div><small>My starting capital</small><b className="pos">{cop(capital)}</b></div><div><small>Saved by thinking</small><b>{cop(full - capital)}</b></div></div>
          {missing.length > 0 && <div className="p1-hint">⭐ You can't start without: {missing.map((m) => m.n).join(", ")}.</div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={missing.length > 0 || capital <= 0} onClick={() => setStage(1)}>Compare: save or borrow <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 1 && (
        <>
          <Mission e={B.e} title={`${B.n} · capital needed: ${cop(capital)}`}>Path 1: save and launch later. Path 2: borrow now and pay installments. Move the controls.</Mission>
          <div className="g82-console">
            {Ctl({ l: "🐷 I can save per month", v: sav, set: setSav, mn: 50000, mx: 400000, stp: 10000, fmt: cop })}
            {Ctl({ l: "🏦 Loan interest per month", v: rate, set: setRate, mn: 1, mx: 5, stp: 0.5, fmt: (x) => `${x}%` })}
            {Ctl({ l: "📅 Loan term", v: term, set: setTerm, mn: 6, mx: 24, stp: 1, fmt: (x) => `${x} mo` })}
          </div>
          <div className="g82-paths">
            <div className="save"><small>🥾 PATH 1 · SAVE FIRST</small><b>Launch in {saveMonths} months</b><span>Interest paid: $0</span><span>Risk: you wait — prices or ideas can change.</span></div>
            <div className="loan"><small>🏦 PATH 2 · BORROW NOW</small><b>Launch this month</b><span>Installment: {cop(inst)} × {term}</span><span>Total paid: {cop(totalLoan)} · interest <b>{cop(interest)}</b></span></div>
          </div>
          <LineChart series={[{ name: "Savings toward capital", values: months.map((m) => Math.min(capital, m * sav)), color: "#0b7a50" }, { name: "Loan paid so far", values: months.map((m) => Math.min(totalLoan, m * inst)), color: "#ff6b57" }]} labels={months.map((m) => (m === 0 ? "Now" : `M${m}`))} height={200} />
          <ChartLegend series={[{ name: "🥾 Saving for the capital", color: "#0b7a50" }, { name: "🏦 Paying the loan", color: "#ff6b57" }]} />
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(2)}>Check the sales reality <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 2 && (
        <>
          <HowTo>New businesses don't sell the same every month. Here are 6 possible months of profit. On the loan path, the installment is <b>{cop(inst)}</b> every month — good month or bad month.</HowTo>
          <BarChart bars={profit.map((p, k) => ({ label: `M${k + 1}`, value: p, color: p < inst ? "#ff6b57" : "#16b074" }))} height={200} />
          <p className="start-tip p1-center">🟢 profit covers the installment · 🔴 profit is LESS than the installment ({cop(inst)})</p>
          <div className={`g8-left ${shortM ? "bad" : "ok"}`}>{shortM ? `⚠️ In ${shortM} of 6 months, the business can't pay the installment — you would need personal money.` : "✅ In this scenario, profits cover every installment."}</div>
          <div className="start-block">
            <h3>Your decision</h3>
            <div className="g82-paths pick">
              <button type="button" className={`save ${route === "save" ? "on" : ""}`} onClick={() => setRoute("save")}><small>🥾 SAVE FIRST</small><b>{saveMonths} months · $0 interest</b></button>
              <button type="button" className={`loan ${route === "loan" ? "on" : ""}`} onClick={() => setRoute("loan")}><small>🏦 BORROW NOW</small><b>Today · {cop(interest)} interest</b></button>
            </div>
            {route && <p className="start-tip">{route === "save" ? "🥾 Zero debt and less pressure — but you launch later. Can you start even smaller and launch sooner?" : `🏦 You launch now, but ${shortM} difficult months could hurt. Do you have a plan B for those months?`}</p>}
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!route} onClick={() => finish(30, { biz: B.n, e: B.e, capital, full, saveMonths, sav, rate, term, inst, interest, route, shortMonths: shortM })}>Save my decision <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
        </>
      )}
    </ActShell>
  );
}

const RUSH_MVP = {
  buckets: [{ id: "now", e: "🚀", l: "Need it to start", d: "Without it, there is no product.", c: "#0b7a50" }, { id: "later", e: "⏳", l: "Later / rent / reuse", d: "Nice — but not to start.", c: "#f5b23e" }],
  items: [
    { e: "🧁", t: "Ingredients for a cupcake business", b: "now", why: "No ingredients, no cupcakes." }, { e: "🌐", t: "A $400,000 professional website on day 1", b: "later", why: "A free social page works to start." },
    { e: "👕", t: "Blank T-shirts for a printing business", b: "now", why: "That's the product!" }, { e: "🛵", t: "An electric scooter for deliveries in your neighborhood", b: "later", why: "Walk or bike first." },
    { e: "🧃", t: "A blender for a juice stand", b: "now", why: "Needed to make juice." }, { e: "🏷️", t: "A designer logo by an agency", b: "later", why: "A simple logo is enough to test." },
    { e: "🔥", t: "An industrial oven for your first 50 cookies", b: "later", why: "Use the family oven first." }, { e: "📦", t: "Bags to deliver cookies", b: "now", why: "You need to deliver the product." },
    { e: "💻", t: "A new laptop to make designs", b: "later", why: "Use a school or home computer." }, { e: "🧽", t: "Cleaning products for a sneaker spa", b: "now", why: "Essential for the service." },
    { e: "📣", t: "Paid ads before you have a product", b: "later", why: "Test first, advertise later." }, { e: "🪚", t: "Basic tools for a repair service", b: "now", why: "Required to work." },
  ],
};

/* ---------- PORTFOLIO 08 · MY BUSINESS CAPITAL PLAN ---------- */
const RISKS18 = ["📉 Sales are slower than expected", "💸 Prices of materials go up", "⏳ It takes longer to save the capital", "🏦 Loan payments in bad months", "🧑‍🤝‍🧑 Too much competition", "🛠️ Equipment breaks"];
function CapitalPlan({ resp, existing, onSave, onExit }) {
  const bs = resp?.c18_boot;
  const [risks, setRisks] = useState(existing?.risks || []);
  const [txt, setTxt] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const G = [W_NUMBERS(1), W_REASON, W_PLAN];
  const ready = bs && risks.length === 3 && goalsOk(txt, 30, 100, G);
  if (st.done) return <Reward title="Page 08 ready! 🚀" subtitle="Your business has a capital plan." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Rocket size={22} strokeWidth={2.1} />} title="My Business Capital Plan 🚀" subtitle="Capital · route · timeline · risks." onExit={onExit}>
      <PFBadge n="08" />
      {!bs ? <div className="p1-hint">Play the <b>Bootstrap Challenge</b> first — this page uses your results.</div> : (
        <div className="g8-diag">
          <div><small>Business</small><b>{bs.e} {bs.biz}</b></div>
          <div><small>Capital needed</small><b>{cop(bs.capital)}</b></div>
          <div><small>Route</small><b>{bs.route === "save" ? `🥾 Save · ${bs.saveMonths} months` : `🏦 Loan · ${cop(bs.interest)} interest`}</b></div>
          <div className="wide"><small>Timeline</small><b>{bs.route === "save" ? `Save ${cop(bs.sav)} a month → launch in month ${bs.saveMonths}` : `Launch now → ${bs.term} installments of ${cop(bs.inst)}`}</b></div>
        </div>
      )}
      <div className="start-block">
        <h3><span className="step-n">1</span> 3 risks to consider before starting</h3>
        <div className="g74-chips">{RISKS18.map((r) => <button key={r} type="button" className={risks.includes(r) ? "on" : ""} disabled={!risks.includes(r) && risks.length >= 3} onClick={() => setRisks(risks.includes(r) ? risks.filter((x) => x !== r) : [...risks, r])}>{risks.includes(r) ? "✓ " : ""}{r}</button>)}</div>
      </div>
      <div className="start-block">
        <h3><PenLine size={18} /> My capital plan</h3>
        <Starters items={["My business needs", "I chose to", "because", "If sales are slow, I will"]} onPick={appendStarter(setTxt)} />
        <WordField value={txt} onChange={setTxt} min={30} max={100} rows={4} goals={G} placeholder="Write your plan here…" />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(28, { ...bs, risks, text: txt })}>Save page 08 <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 19 · HOW THE WORLD SAVES
   ===================================================================== */
const START_19 = {
  cards: [
    { e: "🏠", t: "Household", d: "All the people who live in a home and share expenses.", ex: "A family budget." },
    { e: "🤝", t: "Community saving", d: "A group that saves together with agreed rules.", ex: "Colleagues, neighbors, traders." },
    { e: "🔄", t: "ROSCA", d: "Rotating savings and credit association: everyone pays, one person receives each month.", ex: "6 members, 6 turns." },
    { e: "🍮", t: "Natillera", d: "A Colombian group saving: regular contributions, paid out at an agreed time.", ex: "Often in December." },
    { e: "🫱", t: "Trust", d: "Believing others will follow the rules. Group saving depends on it.", ex: "Everyone pays on time." },
    { e: "📒", t: "Record", d: "A written list of who paid, how much and when.", ex: "A shared ledger." },
  ],
  rounds: [
    { tag: "QUICK 1", q: "5 members × $20,000 = monthly pool of…", answer: 100000, money: true, hint: "5 × 20,000", explain: "$100,000." },
    { tag: "QUICK 2", q: "Does a ROSCA create extra money?", options: ["No — it reorganizes members' money", "Yes — the group multiplies the money every month for everyone", "Only in December"], correct: 0, explain: "Members contribute their own funds." },
    { tag: "QUICK 3", q: "The most important thing in group saving is…", options: ["Trust and clear records", "A very big group of people you don't know", "A nice name"], correct: 0, explain: "Plus agreed rules." },
    { tag: "QUICK 4", q: "In a 6-member ROSCA, the last member receives the pool in month…", answer: 6, hint: "One turn per month", explain: "Month 6." },
  ],
};
const TOUR = [
  { id: "jp", e: "🇯🇵", n: "Japan", m: "The Tanaka family plans a trip: transport $600,000 + hotel $900,000 + food $300,000. They have 6 months. How much per month?", kind: "num", answer: 300000, money: true, adv: "Planning ahead avoids debt", risk: "Prices can change before the trip" },
  { id: "de", e: "🇩🇪", n: "Germany", m: "The Müllers separate two purposes. Classify: KNOWN purchase or RESERVE for surprises?", kind: "sort", items: [["🧺 Washing machine next year", "k"], ["🚗 Surprise car repair", "r"], ["🏖️ Summer holiday", "k"], ["🩺 Medical bill", "r"], ["🛋️ New sofa", "k"], ["💼 Job loss", "r"]], adv: "Two goals, two pockets", risk: "Using the reserve for planned things" },
  { id: "cn", e: "🇨🇳", n: "China", m: "The Chens want a $2,400,000 course. They can save $150,000 a month without touching essentials. How many months do they need?", kind: "num", answer: 16, adv: "Adjusting the time protects essentials", risk: "The course price may rise" },
  { id: "ke", e: "🇰🇪", n: "Kenya", m: "A ROSCA: 6 traders pay 10,000 shillings a month. How many shillings does each member PAY in total over 6 months?", kind: "num", answer: 60000, adv: "A big amount at once, without a loan", risk: "Someone may stop paying" },
  { id: "co", e: "🇨🇴", n: "Colombia", m: "Check the natillera ledger: 8 members × $50,000. One month has an ERROR. Tap it.", kind: "ledger", rows: [["Month 1", "8 paid", "$400,000"], ["Month 2", "8 paid", "$400,000"], ["Month 3", "8 paid", "$400,000"], ["Month 4", "7 paid", "$400,000"], ["Month 5", "8 paid", "$400,000"]], bad: 3, adv: "A routine that makes saving easier", risk: "Not regulated — depends on records" },
];
const ADV_RISK = ["Planning ahead avoids debt", "Two goals, two pockets", "Adjusting the time protects essentials", "A big amount at once, without a loan", "A routine that makes saving easier", "Prices can change before the trip", "Using the reserve for planned things", "The course price may rise", "Someone may stop paying", "Not regulated — depends on records"];
function WorldTour({ onSave, onExit }) {
  const [ti, setTi] = useState(0);
  const [stamps, setStamps] = useState({});
  const [val, setVal] = useState("");
  const [srt, setSrt] = useState({});
  const [led, setLed] = useState(null);
  const [solved, setSolved] = useState(false);
  const [msg, setMsg] = useState(null);
  const [adv, setAdv] = useState(null);
  const [risk, setRisk] = useState(null);
  const [st, finish] = useFinish(onSave);
  const T = TOUR[ti];
  const reset = (k) => { setTi(k); setVal(""); setSrt({}); setLed(null); setSolved(!!stamps[TOUR[k].id]); setMsg(null); setAdv(null); setRisk(null); };
  const check = () => {
    let ok = false;
    if (T.kind === "num") ok = Math.abs(num(val) - T.answer) <= (T.money ? 1000 : 0);
    if (T.kind === "sort") ok = T.items.every((it, k) => srt[k] === it[1]);
    if (T.kind === "ledger") ok = led === T.bad;
    setSolved(ok); setMsg(ok ? "✅ Mission solved! Now choose an advantage and a risk." : T.kind === "ledger" ? "❌ Look at the number of members who paid and the total." : "❌ Not yet — check your numbers.");
  };
  const stampIt = () => { if (adv === T.adv && risk === T.risk) { setStamps({ ...stamps, [T.id]: true }); setMsg("🛂 STAMP! Choose your next destination."); } else setMsg("🤔 Not quite — re-read the mission: which advantage and which risk belong to THIS method?"); };
  const all = TOUR.every((t) => stamps[t.id]);
  if (st.done) return <Reward title="Passport complete! 🛂🌍" subtitle="Five places, five ways to save." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Plane size={22} strokeWidth={2.1} />} title="World Saving Tour 🛂" subtitle="Solve a mission in each country to get its stamp." onExit={onExit}>
      <div className="g82-passport">{TOUR.map((t, k) => <button key={t.id} type="button" className={`${ti === k ? "on" : ""} ${stamps[t.id] ? "stamped" : ""}`} onClick={() => reset(k)}><em>{t.e}</em><b>{t.n}</b><small>{stamps[t.id] ? "🛂 STAMPED" : "mission"}</small></button>)}</div>
      <div className="start-block g82-mission">
        <h3>{T.e} {T.n}</h3>
        <p>{T.m}</p>
        {T.kind === "num" && <div className="p2-answer-row">{T.money && <span className="p2-unit">$</span>}<input className="start-input p2-num" type="number" value={val} disabled={solved} onChange={(e) => setVal(e.target.value)} placeholder="Your answer" /><span className="p2-unit">{T.id === "cn" ? "months" : T.id === "ke" ? "shillings" : ""}</span></div>}
        {T.kind === "sort" && <div className="g82-sort2">{T.items.map(([t], k) => <div key={t}><span>{t}</span><div className="type-toggle"><button type="button" disabled={solved} className={srt[k] === "k" ? "on" : ""} onClick={() => setSrt({ ...srt, [k]: "k" })}>🛒 Known purchase</button><button type="button" disabled={solved} className={srt[k] === "r" ? "on" : ""} onClick={() => setSrt({ ...srt, [k]: "r" })}>🛟 Reserve</button></div></div>)}</div>}
        {T.kind === "ledger" && <div className="g8-ledger">{T.rows.map((r, k) => <button key={k} type="button" disabled={solved} className={`g8-lg-r four ${led === k ? "picked" : ""}`} onClick={() => setLed(k)}><span>{r[0]}</span><span>{r[1]}</span><b>{r[2]}</b><b /></button>)}</div>}
        {!solved && <div className="start-foot"><button className="s1-btn primary" onClick={check}>Check <Check size={15} /></button></div>}
        {solved && !stamps[T.id] && (
          <>
            {T.kind === "ledger" && <p className="start-tip">Month 4: only 7 members paid → 7 × $50,000 = $350,000, not $400,000. Clear records matter!</p>}
            <div className="g82-ar"><div><small>👍 ADVANTAGE of this method</small><div className="g74-chips">{ADV_RISK.slice(0, 5).map((a) => <button key={a} type="button" className={adv === a ? "on" : ""} onClick={() => setAdv(a)}>{a}</button>)}</div></div><div><small>⚠️ RISK of this method</small><div className="g74-chips">{ADV_RISK.slice(5).map((a) => <button key={a} type="button" className={risk === a ? "on" : ""} onClick={() => setRisk(a)}>{a}</button>)}</div></div></div>
            <div className="start-foot"><button className="s1-btn primary" disabled={!adv || !risk} onClick={stampIt}>🛂 Get my stamp</button></div>
          </>
        )}
        {msg && <p className="start-tip">{msg}</p>}
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!all} onClick={() => finish(32, { stamps: Object.keys(stamps) })}>{all ? "Close my passport" : `${Object.keys(stamps).length}/5 stamps`} <span className="coin-tag"><Coins size={15} /> +32</span></button></div>
    </ActShell>
  );
}

/* ---------- NATILLERA SIMULATOR ---------- */
const NAT_CH = [
  { e: "⏰", t: "Member 3 pays 2 weeks late this month.", opts: [["📒 Apply the rule we agreed: a small late fee, written in the record", true], ["😡 Kick them out immediately and keep their money", false], ["🤷 Say nothing — maybe others will also pay late", false]] },
  { e: "✏️", t: "The record says Member 5 paid, but nobody received the money.", opts: [["🔍 Check receipts/transfers together and correct the record", true], ["🙈 Ignore it — the total is almost right", false], ["💸 The treasurer pays it from their own pocket and stays quiet", false]] },
  { e: "🚪", t: "Member 2 must leave the group in month 4.", opts: [["📜 Follow the agreed exit rule: return what they paid, as written", true], ["🔒 Keep their contributions — they broke the deal", false], ["🎲 Decide by luck what happens", false]] },
];
function Natillera({ onSave, onExit }) {
  const [mem, setMem] = useState(6);
  const [con, setCon] = useState(50000);
  const [month, setMonth] = useState(1);
  const [miss, setMiss] = useState({});
  const [ch, setCh] = useState({});
  const [st, finish] = useFinish(onSave);
  const pool = (m) => (mem - (miss[m] ? 1 : 0)) * con;
  const months = Array.from({ length: mem }, (_, i) => i + 1);
  const shortTotal = months.filter((m) => miss[m] && m <= month).length * con;
  const allCh = NAT_CH.every((_, k) => ch[k] !== undefined);
  const fair = NAT_CH.filter((c, k) => ch[k] !== undefined && c.opts[ch[k]][1]).length;
  if (st.done) return <Reward title="Fair natillera! 🍮" subtitle={`${fair}/3 fair, rule-based decisions`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Users size={22} strokeWidth={2.1} />} title="Natillera Simulator 🍮" subtitle="A community savings pool — with real problems." onExit={onExit}>
      <HowTo>Each month every member pays. One member receives the pool (a rotation, like a ROSCA). Move the month, mark a member who <b>misses</b> a payment and see what happens. Remember: the group doesn't create money — it only reorganizes it.</HowTo>
      <div className="g82-console">
        {Ctl({ l: "👥 Members", v: mem, set: (v) => { setMem(v); setMonth(Math.min(month, v)); }, mn: 4, mx: 10, stp: 1, fmt: (x) => `${x}` })}
        {Ctl({ l: "💵 Contribution per member", v: con, set: setCon, mn: 10000, mx: 100000, stp: 5000, fmt: cop })}
        {Ctl({ l: "📅 Current month", v: month, set: setMonth, mn: 1, mx: mem, stp: 1, fmt: (x) => `${x} / ${mem}` })}
      </div>
      <label className="perm-check p1-check"><input type="checkbox" checked={!!miss[month]} onChange={(e) => setMiss({ ...miss, [month]: e.target.checked })} /><span>😬 One member misses this month's contribution</span></label>
      <div className="g8-proj"><div><small>Normal pool</small><b>{cop(mem * con)}</b></div><div><small>Pool this month</small><b className={miss[month] ? "neg" : "pos"}>{cop(pool(month))}</b></div><div><small>Receives this month</small><b>👤 Member {month}</b></div></div>
      <div className="g82-rot">{months.map((m) => <span key={m} className={`${m === month ? "now" : ""} ${m < month ? "done" : ""} ${miss[m] ? "miss" : ""}`}><b>M{m}</b><small>👤{m}</small><i>{cop(pool(m))}</i></span>)}</div>
      {shortTotal > 0 && <div className="p1-hint">⚠️ Missed payments so far: {cop(shortTotal)}. The members who receive in those months get LESS — that's why rules and records matter.</div>}
      <div className="start-block">
        <h3>⚖️ Three problems. Choose fair, rule-based solutions.</h3>
        {NAT_CH.map((c, k) => (
          <div key={k} className="g82-natch"><b>{c.e} {c.t}</b>
            <div className="g82-choices">{c.opts.map(([t, ok], j) => <button key={t} type="button" disabled={ch[k] !== undefined} className={ch[k] === undefined ? "" : ok ? "ok" : ch[k] === j ? "no" : ""} onClick={() => setCh({ ...ch, [k]: j })}>{t}</button>)}</div>
            {ch[k] !== undefined && <p>{c.opts[ch[k]][1] ? "✅ Transparent and agreed in advance." : "❌ Not fair: solutions should follow rules everyone agreed — not anger or luck."}</p>}
          </div>
        ))}
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!allCh || month < 3} onClick={() => finish(16 + fair * 4, { members: mem, contribution: con, fair })}>{month < 3 ? "Move to month 3+ first" : "Save my natillera"} <span className="coin-tag"><Coins size={15} /> +{16 + fair * 4}</span></button></div>
    </ActShell>
  );
}

/* ---------- PORTFOLIO 09 · IDEAS FROM THE WORLD ---------- */
const IDEAS19 = [["🇯🇵", "Plan months ahead (Japan)"], ["🇩🇪", "Two pockets: purchase + reserve (Germany)"], ["🇨🇳", "Adjust the time, protect essentials (China)"], ["🇰🇪", "Save with a group (Kenya ROSCA)"], ["🇨🇴", "A natillera with clear records (Colombia)"]];
function BorrowCulture({ resp, existing, onSave, onExit }) {
  const [idea, setIdea] = useState(existing?.idea ?? null);
  const [txt, setTxt] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const goal = resp?.c12_goal;
  const G = [W_REASON, W_CONTRAST, W_PLAN];
  if (st.done) return <Reward title="Page 09 ready! 🌍" subtitle="You borrowed a world idea for your goal." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title="Ideas from the World 🌍" subtitle="Borrow one strategy — and adapt it to YOUR goal." onExit={onExit}>
      <PFBadge n="09" />
      <div className="start-block">
        <h3><span className="step-n">1</span> The strategy I would borrow</h3>
        <div className="g8-pick">{IDEAS19.map(([e, t], k) => <button key={t} type="button" className={idea === k ? "on" : ""} onClick={() => setIdea(k)}><em>{e}</em><b>{t}</b>{idea === k && <i>✓</i>}</button>)}</div>
      </div>
      <div className="start-block">
        <h3><PenLine size={18} /> How I would adapt it{goal ? ` to my goal (${goal.what})` : ""}</h3>
        <p className="start-tip">Include: why it's useful, one risk, and how you will use it.</p>
        <Starters items={["I would borrow", "because", "However, one risk is", "I will"]} onPick={appendStarter(setTxt)} />
        <WordField value={txt} onChange={setTxt} min={30} max={100} rows={4} goals={G} placeholder="Write your answer here…" />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={idea === null || !goalsOk(txt, 30, 100, G)} onClick={() => finish(26, { idea, ideaName: IDEAS19[idea][1], text: txt })}>Save page 09 <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 20 · PORTFOLIO STUDIO · MAKE IT MAKE SENSE
   ===================================================================== */
const loadHtml2Canvas = () => (window.html2canvas ? Promise.resolve(window.html2canvas) : new Promise((res, rej) => {
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  s.onload = () => res(window.html2canvas); s.onerror = rej;
  document.body.appendChild(s);
}));
const DECISIONS20 = [["c11_page", "🧠 Knowing my triggers"], ["c12_goal", "🎯 My SMART goal with a future price"], ["c13_page", "♟️ My saving method"], ["c14_page", "💧 Cutting a money leak"], ["c15_page", "🛟 Building an emergency fund"], ["c16_page", "📈 Understanding the real rate"], ["c17_page", "🏦 Choosing where to keep my money"], ["c18_page", "🚀 Save first vs. borrow"], ["c19_page", "🌍 A strategy from another culture"]];
function PortfolioStudio({ resp, jar, studentName, existing, onSave, onExit }) {
  const r = resp || {};
  const g = r.c12_goal, bud = r.c14_page, strat = r.c13_page, keep = r.c17_page;
  const [fix, setFix] = useState(existing?.fix || {});
  const [newMonths, setNewMonths] = useState(existing?.newMonths || (g ? g.months + 3 : 12));
  const [top, setTop] = useState(existing?.top || []);
  const [why, setWhy] = useState(existing?.why || "");
  const [busy, setBusy] = useState(false);
  const [st, finish] = useFinish(onSave);
  const pages = PF_PAGES.filter((p) => r[p.key]).length;
  const needW = g ? Math.max(0, Math.round((g.target - (g.start || 0)) / (g.months * 4.33))) : 0;
  const budW = bud ? Math.round(bud.saveAmt / 4.33) : null;
  const saved = jarSaved(jar);
  const logsN = Object.keys(jar?.logs || {}).length;
  const expected = g ? (g.start || 0) + g.weekly * logsN : 0;
  const issues = [];
  if (g && budW !== null && budW < needW * 0.95) issues.push({ id: "budget", e: "⚖️", t: `Your goal needs ≈ ${cop(needW)} a week, but your savings budget (page 04) gives ≈ ${cop(budW)} a week.` });
  if (g && strat && (strat.reach < 0 || strat.reach > g.months)) issues.push({ id: "strategy", e: "♟️", t: `Your strategy (page 03) reaches the goal ${strat.reach > 0 ? `in month ${strat.reach}` : "after 12 months"}, but your deadline is month ${g.months}.` });
  if (g && logsN >= 2 && saved < expected * 0.8) issues.push({ id: "jar", e: "🫙", t: `Your Goal Jar has ${cop(saved)}, but your plan expected ≈ ${cop(expected)} by now.` });
  if (keep && keep.emProd && !["flex", "pocket"].includes(keep.emProd)) issues.push({ id: "emergency", e: "🛟", t: "Your emergency fund is in a product with low liquidity." });
  const FIXES = [["date", "📅 Move the deadline"], ["cheaper", "🏷️ Choose a cheaper option"], ["more", "💵 Save more per week"]];
  const fixed = issues.every((x) => fix[x.id]);
  const G = [W_REASON];
  const ready = pages >= 6 && fixed && top.length === 3 && goalsOk(why, 15, 70, G);
  const png = async () => { setBusy(true); try { const h2c = await loadHtml2Canvas(); const cv = await h2c(document.getElementById("g8-final"), { scale: 2, backgroundColor: "#ffffff", useCORS: true }); const a = document.createElement("a"); a.href = cv.toDataURL("image/png"); a.download = `Savings_Portfolio_${(studentName || "student").replace(/\s+/g, "_")}.png`; a.click(); } catch (e) { /* sin imagen */ } setBusy(false); };
  const print = () => { document.body.classList.add("g8-printing"); const off = () => { document.body.classList.remove("g8-printing"); window.removeEventListener("afterprint", off); }; window.addEventListener("afterprint", off); setTimeout(() => window.print(), 50); };
  const Sec = ({ n, children }) => { const p = PF_PAGES.find((x) => x.n === n); const has = r[p.key]; return <section className={`g8-fp ${has ? "" : "empty"}`}><h4><span>{p.n}</span>{p.e} {p.t}</h4>{has ? children : <p className="g8-fp-empty">Not completed yet.</p>}</section>; };
  const s = (k) => r[k] || {};
  if (st.done) return <Reward title="My Savings Portfolio is complete! 🏆" subtitle="A plan that makes sense — in English." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Award size={22} strokeWidth={2.1} />} title="Portfolio Studio 🗂️" subtitle="Make it make sense: check, fix, choose, present." onExit={onExit}>
      <div className="start-block">
        <h3><span className="step-n">1</span> 🕵️ Contradiction detector</h3>
        {issues.length === 0 ? <div className="p1-banner good"><Check size={18} /> <span><b>Your plan makes sense!</b> No contradictions between your pages.</span></div> : issues.map((x) => (
          <div key={x.id} className={`g82-issue ${fix[x.id] ? "fixed" : ""}`}>
            <b>{x.e} {x.t}</b>
            <div className="type-toggle">{(x.id === "emergency" ? [["move", "🔁 Move it to a liquid product"]] : FIXES).map(([k, l]) => <button key={k} type="button" className={fix[x.id] === k ? "on" : ""} onClick={() => setFix({ ...fix, [x.id]: k })}>{l}</button>)}</div>
            {fix[x.id] === "date" && g && <>{Ctl({ l: "📅 New deadline", v: newMonths, set: setNewMonths, mn: g.months, mx: 48, stp: 1, fmt: (v) => `${v} mo` })}<small>New weekly need: <b>{cop(Math.round((g.target - (g.start || 0)) / (newMonths * 4.33)))}</b></small></>}
          </div>
        ))}
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> ⭐ My 3 most important decisions</h3>
        <div className="g74-chips">{DECISIONS20.filter(([k]) => r[k]).map(([k, l]) => <button key={k} type="button" className={top.includes(k) ? "on" : ""} disabled={!top.includes(k) && top.length >= 3} onClick={() => setTop(top.includes(k) ? top.filter((x) => x !== k) : [...top, k])}>{top.includes(k) ? `${top.indexOf(k) + 1}. ` : ""}{l}</button>)}</div>
        <WordField value={why} onChange={setWhy} min={15} max={70} rows={2} goals={G} placeholder="Why is your number 1 decision the most important? Write your answer here…" />
      </div>
      <div className="g8-final g82-final" id="g8-final">
        <header><small>SAVINGS PORTFOLIO · GRADE 8 · INSTITUTO CREAR</small><h2>Saving Today, Achieving Tomorrow</h2><p>By <b>{studentName}</b>{g ? ` · Goal: ${g.what}` : ""}</p></header>
        {jar && <div className="g82-final-jar"><GoalJar jar={jar} compact /></div>}
        <div className="g8-fp-grid">
          <Sec n="01"><p>{s("c11_page").profile || "—"}</p><p>Triggers: {(s("c11_page").triggers || []).join(" · ")}</p><i>“{(s("c11_page").text || "").split(" ").slice(0, 18).join(" ")}…”</i></Sec>
          <Sec n="02"><p><b>{s("c12_goal").what}</b> · {s("c12_goal").months} months</p><p>Today {cop(s("c12_goal").price)} → future <b>{cop(s("c12_goal").future)}</b> ({s("c12_goal").infl}%)</p><p>Plan: {cop(s("c12_goal").weekly)}/week</p></Sec>
          <Sec n="03"><p>Method: <b>{s("c13_page").methodName}</b> · {cop(s("c13_page").amount)}/month</p><p>{s("c13_page").reach > 0 ? `Goal in month ${s("c13_page").reach}` : `12 months: ${cop(s("c13_page").final12)}`}</p></Sec>
          <Sec n="04"><p>Valeria saves <b>{cop(s("c14_page").valeriaSaves)}</b>/year</p><p>I save first: {s("c14_page").rate}% = {cop(s("c14_page").saveAmt)}/month</p></Sec>
          <Sec n="05"><p>Essentials {cop(s("c15_page").monthly)}/month · target <b>{cop(s("c15_page").target)}</b> ({s("c15_page").months} mo)</p><p>Kept in: {s("c15_page").whereName}</p></Sec>
          <Sec n="06"><p>{s("c16_page").rateB}% EA → {cop(s("c16_page").finalB)} vs 0% → {cop(s("c16_page").finalA)}</p><p>Real value: {cop(s("c16_page").realB)}</p></Sec>
          <Sec n="07"><p>Goal → <b>{s("c17_page").goalName}</b></p><p>Emergency → <b>{s("c17_page").emName}</b></p></Sec>
          <Sec n="08"><p>{s("c18_page").e} {s("c18_page").biz} · capital {cop(s("c18_page").capital)}</p><p>{s("c18_page").route === "save" ? `🥾 Save · ${s("c18_page").saveMonths} months` : `🏦 Loan · ${cop(s("c18_page").interest)} interest`}</p></Sec>
          <Sec n="09"><p><b>{s("c19_page").ideaName}</b></p><i>“{(s("c19_page").text || "").split(" ").slice(0, 18).join(" ")}…”</i></Sec>
          <section className="g8-fp habit"><h4><span>⭐</span>My top 3 decisions</h4><p>{top.map((k, i) => `${i + 1}. ${DECISIONS20.find((d) => d[0] === k)[1]}`).join("   ")}</p>{why && <i>“{why}”</i>}</section>
        </div>
        <footer>💡 Concepts: delayed gratification · biases · SMART goals · inflation · saving methods · opportunity cost · emergency fund · liquidity · EA vs. monthly · real rate · CDT · fraud signs · bootstrapping · ROSCA · natillera</footer>
      </div>
      {pages < 6 && <div className="p1-banner bad"><span>You need at least 6 of the 9 pages. You have {pages}.</span></div>}
      <div className="p3-card-actions"><button className="s1-btn ghost" disabled={busy} onClick={png}><Download size={17} /> {busy ? "Creating…" : "Download PNG"}</button><button className="s1-btn ghost" onClick={print}><Printer size={17} /> Print / PDF</button></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(50, { pages, issues: issues.map((x) => x.id), fix, newMonths, top, why, saved })}>Publish my portfolio <span className="coin-tag"><Coins size={15} /> +50</span></button></div>
    </ActShell>
  );
}

const SHOW82 = ["I explained my goal and its future price.", "I showed my Goal Jar progress.", "I explained my saving method and why it fits me.", "I showed one money leak and its opportunity cost.", "I explained my emergency plan.", "I explained nominal vs. real rate.", "I said where I will keep my savings and why."];
function Showcase82({ onSave, onExit }) {
  const [checks, setChecks] = useState([]);
  const [peer, setPeer] = useState("");
  const [stars, setStars] = useState({ clear: 0, numbers: 0, english: 0 });
  const [c1, setC1] = useState(""); const [c2, setC2] = useState("");
  const [st, finish] = useFinish(onSave);
  const ready = checks.length >= 5 && peer.trim() && Object.values(stars).every((x) => x > 0) && countWords(c1) >= 3 && realText(c1) && countWords(c2) >= 3 && realText(c2);
  if (st.done) return <Reward title="Showcase done! 🎤" subtitle="You defended a financial plan in English." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Mic size={22} strokeWidth={2.1} />} title="Portfolio Showcase 🎤" subtitle="Present your portfolio in 2 minutes. Then give your tablet to a classmate." onExit={onExit}>
      <div className="start-block"><h3><span className="step-n">1</span> My presentation checklist (5+)</h3>{SHOW82.map((s) => <label key={s} className="perm-check p1-check"><input type="checkbox" checked={checks.includes(s)} onChange={() => setChecks(checks.includes(s) ? checks.filter((x) => x !== s) : [...checks, s])} /><span>{s}</span></label>)}</div>
      <div className="start-block">
        <h3><span className="step-n">2</span> 🔁 Classmate's feedback</h3>
        <input className="start-input p3-gap" value={peer} onChange={(e) => setPeer(e.target.value)} placeholder="Classmate's name" />
        {[["clear", "The plan made sense"], ["numbers", "They used numbers as evidence"], ["english", "They spoke in English"]].map(([k, l]) => <div key={k} className="p3-rub"><div><b>{l}</b></div><span /><div className="p3-stars">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={stars[k] >= n ? "on" : ""} onClick={() => setStars({ ...stars, [k]: n })}>★</button>)}</div></div>)}
        <div className="p3-sentence edit"><span>⭐ The best part was</span><input className="start-input" value={c1} onChange={(e) => setC1(e.target.value)} placeholder="Write it here…" /></div>
        <div className="p3-sentence edit"><span>💡 One idea to improve:</span><input className="start-input" value={c2} onChange={(e) => setC2(e.target.value)} placeholder="Write it here…" /></div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(20, { checks, peer, stars, comments: [c1, c2] })}>Save feedback <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 21 · SAVINGS BOSS · FINANCIAL SURVIVAL ARENA
   ===================================================================== */
const ARENA_OFFERS = [
  { id: "cdt", e: "📜", n: "24-month CDT", r: "11% EA", d: "No withdrawals for 24 months · contract explained", fit: 3 },
  { id: "fee", e: "🏧", n: "Premium Account", r: "6% EA", d: "Withdraw anytime · $8,000 fee EVERY month", fit: 0 },
  { id: "pocket", e: "📲", n: "Goal Pocket", r: "4% EA", d: "Withdraw anytime · no fees", fit: 1 },
  { id: "scam", e: "💎", n: "Crypto Club", r: "15% MONTHLY guaranteed", d: "Invite friends to unlock withdrawals", fit: -3 },
];
function SurvivalArena({ onSave, onExit }) {
  const [ch, setCh] = useState(0);
  const [p1, setP1] = useState(""); const [m1, setM1] = useState(""); const [a1, setA1] = useState(null);
  const [e2, setE2] = useState(null); const [r2, setR2] = useState(null);
  const [o3, setO3] = useState(null); const [f3, setF3] = useState(false);
  const [why, setWhy] = useState("");
  const [score, setScore] = useState({});
  const [st, finish] = useFinish(onSave);
  const ok1 = Math.abs(num(p1) - 1320000) <= 1000 && num(m1) === 11 && a1 !== null && a1 !== 2;
  const ok2 = e2 === 0 && r2 === 0;
  const ok3 = o3 === "cdt" && f3;
  const next = (k, ok) => { setScore({ ...score, [k]: ok }); setCh(ch + 1); };
  const total = Object.values(score).filter(Boolean).length;
  const G = [W_REASON];
  if (st.done) return <Reward title={`Savings Boss defeated! ${total}/3 ⚔️`} subtitle="You applied the period — not just remembered it." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Swords size={22} strokeWidth={2.1} />} title="Financial Survival Arena ⚔️" subtitle="Three challenges. Calculate, decide, explain." onExit={onExit}>
      <div className="g72-steps">{["1 · The Dream", "2 · The Emergency", "3 · The Offer", "🏆 Result"].map((s, i) => <span key={s} className={ch === i ? "on" : ch > i ? "done" : ""}>{s}</span>)}</div>
      {ch === 0 && (
        <>
          <Mission e="🎯" title="Your goal: $1,200,000 in 10 months. It's month 4 and you have $300,000.">Bad news ×2: the price goes up <b>10%</b>, and now you can only save <b>$100,000 a month</b>.</Mission>
          <MiniTable head={["Original price", "Price change", "Saved", "New monthly saving"]} rows={[["$1,200,000", "+10%", "$300,000", "$100,000"]]} />
          <div className="g8-row big"><span>1) The new price is…</span><MoneyInput value={p1} onChange={setP1} /></div>
          <div className="g8-row big"><span>2) Months you need now (round up)</span><input className="start-input sm" type="number" value={m1} onChange={(e) => setM1(e.target.value)} placeholder="months" /></div>
          <p className="start-tip">💡 (new price − saved) ÷ 100,000 → round up.</p>
          <div className="start-block"><h3>3) Your adjustment</h3><div className="g82-choices">{["📅 Move the deadline to month 15", "🏷️ Look for a cheaper or refurbished option", "💎 Put my savings in a “guaranteed 15% monthly” club"].map((t, k) => <button key={t} type="button" className={a1 === k ? "sel" : ""} onClick={() => setA1(k)}>{t}</button>)}</div></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!p1 || !m1 || a1 === null} onClick={() => next("dream", ok1)}>Submit challenge 1 <ChevronRight size={18} /></button></div>
        </>
      )}
      {ch === 1 && (
        <>
          <Mission e="💻" title="Your laptop for school breaks. Repair: $500,000.">You have: emergency fund <b>$400,000</b> · goal savings <b>$300,000</b> · fun budget <b>$150,000</b> this month.</Mission>
          <div className="start-block"><h3>How do you pay?</h3><div className="g82-choices">{["🛟 $400,000 from the fund + $100,000 from this month's fun money", "🎯 All from my goal savings — the fund stays full", "💳 Borrow $500,000 at 5% a month", "🙈 Don't repair it — I'll do homework on my phone"].map((t, k) => <button key={t} type="button" className={e2 === k ? "sel" : ""} onClick={() => setE2(k)}>{t}</button>)}</div></div>
          <div className="start-block"><h3>And after that?</h3><div className="g82-choices">{["🔄 Refill the fund little by little before saving for the goal again", "🎉 Celebrate — the problem is solved, no plan needed", "🛍️ Use next month's money for the things I missed"].map((t, k) => <button key={t} type="button" className={r2 === k ? "sel" : ""} onClick={() => setR2(k)}>{t}</button>)}</div></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={e2 === null || r2 === null} onClick={() => next("emergency", ok2)}>Submit challenge 2 <ChevronRight size={18} /></button></div>
        </>
      )}
      {ch === 2 && (
        <>
          <Mission e="🏦" title="You have $1,000,000 that you WON'T need for 2 years.">Four offers. Choose the best one — and report the dangerous one.</Mission>
          <div className="g82-offers">{ARENA_OFFERS.map((o) => <div key={o.id} className={`g82-offer open ${o3 === o.id ? "chosen" : ""} ${o.id === "scam" && f3 ? "flagged" : ""}`}><header><em>{o.e}</em><b>{o.n}</b><span>{o.r}</span></header><ul><li>{o.d}</li></ul><button type="button" className="g82-fine" onClick={() => setO3(o.id)}>{o3 === o.id ? "✓ Chosen" : "Choose"}</button>{o.id === "scam" && <button type="button" className={`g82-report ${f3 ? "on" : ""}`} onClick={() => setF3(true)}>{f3 ? "🚩 Reported" : "🚩 Report"}</button>}</div>)}</div>
          <p className="start-tip">💡 Premium Account: 6% of $1,000,000 ≈ $60,000 a year… but fees = 12 × $8,000 = $96,000!</p>
          <WordField value={why} onChange={setWhy} min={12} max={60} rows={2} goals={G} placeholder="Explain your choice. Write your answer here…" />
          <div className="start-foot"><button className="s1-btn primary big" disabled={!o3 || !goalsOk(why, 12, 60, G)} onClick={() => next("offer", ok3)}>Submit challenge 3 <ChevronRight size={18} /></button></div>
        </>
      )}
      {ch === 3 && (
        <>
          <div className="g73-score"><small>CHALLENGES SOLVED</small><b className={total === 3 ? "good" : ""}>{total}/3</b><span>{total === 3 ? "Perfect survival!" : "Read the solutions — every mistake is a lesson."}</span></div>
          <div className="g8-answers">
            <div className={score.dream ? "ok" : "no"}><b>1 · The Dream</b><span>New price = 1,200,000 × 1.10 = <b>$1,320,000</b>. Need (1,320,000 − 300,000) ÷ 100,000 = 10.2 → <b>11 months</b>. Move the date or choose a cheaper option — never a “guaranteed” club.</span></div>
            <div className={score.emergency ? "ok" : "no"}><b>2 · The Emergency</b><span>Use the fund (that's its job!) + a small cut, then <b>refill</b> it. Borrowing at 5% a month is expensive; touching the goal slows your dream.</span></div>
            <div className={score.offer ? "ok" : "no"}><b>3 · The Offer</b><span>📜 The CDT: you don't need the money for 2 years, so liquidity isn't a problem. 🚩 The Crypto Club is a fraud pattern.</span></div>
          </div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(20 + total * 10, { score, why })}>Claim my reward <span className="coin-tag"><Coins size={15} /> +{20 + total * 10}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- AUTOEVALUACIÓN · PERIODO 2 ---------- */
const RUBRIC82 = [
  { id: "brain", t: "I can recognize biases that push me to spend", d: "Delayed gratification, urgency, social pressure…", acts: ["c11_starter", "c11_marsh", "c11_lab", "c11_rush", "c11_page"], check: { q: "“Only 5 minutes left! Buy now!” is an example of…", options: ["Urgency bias", "A SMART goal", "Compound interest"], tip: "Review: Class 11 · Temptation Lab." } },
  { id: "goal", t: "I can set a SMART goal with a future price", d: "Short/medium/long term + inflation.", acts: ["c12_starter", "c12_read", "c12_timeline", "c12_goal"], check: { q: "$1,000,000 with +5% inflation for one year =", options: ["$1,050,000", "$1,005,000", "$1,500,000"], tip: "Price × 1.05. Review: Class 12 · Goal Timeline." } },
  { id: "method", t: "I can compare saving methods", d: "Pay yourself first, envelopes, 52-week, round-up.", acts: ["c13_starter", "c13_video", "c13_battle", "c13_page"], check: { q: "Which method needs MORE money at the end of the year?", options: ["52-week challenge", "Pay yourself first", "Round-up"], tip: "Its contributions grow every week. Review: Class 13 · Strategy Battle." } },
  { id: "opp", t: "I can calculate the opportunity cost of small habits", d: "1, 5 and 10 years.", acts: ["c14_read", "c14_hunter", "c14_rush", "c14_page"], check: { q: "$4,000 × 5 days × 52 weeks =", options: ["$1,040,000", "$20,000", "$208,000"], tip: "Review: Class 14 · Leak Hunter." } },
  { id: "emerg", t: "I can plan an emergency fund", d: "How much, where, when to use it.", acts: ["c15_story", "c15_survival", "c15_rush", "c15_page"], check: { q: "Where should an emergency fund be?", options: ["A liquid product, like a pocket", "A 2-year CDT", "A crypto club"], tip: "Liquidity first. Review: Class 15 · My Emergency Plan." } },
  { id: "rates", t: "I can understand EA, monthly and real rates", d: "And compare savings products.", acts: ["c16_read", "c16_rate", "c16_rush", "c17_lab"], check: { q: "Rate 8% EA, inflation 8%. Real gain ≈", options: ["0%", "16%", "8%"], tip: "Review: Class 16 · Rate Translator." } },
  { id: "world", t: "I can compare saving with borrowing and community saving", d: "Bootstrapping, ROSCA, natillera.", acts: ["c18_story", "c18_boot", "c19_tour", "c19_nat"], check: { q: "Does a natillera create extra money?", options: ["No — members use their own money", "Yes, it multiplies it", "Only in December"], tip: "Review: Class 19 · Natillera Simulator." } },
];
const STAR_L2 = ["", "Starting", "Developing", "Good", "Excellent"];
const HOW_L2 = [["read", "📖 Reading"], ["video", "🎬 Video"], ["game", "🎮 Game"], ["write", "✍️ Writing"], ["sim", "🧮 Simulator"]];
function SelfCheck82({ existing, checklist, onSave, onExit }) {
  const [stars, setStars] = useState(existing?.stars || {});
  const [how, setHow] = useState(existing?.how || {});
  const [prove, setProve] = useState({});
  const [goal, setGoal] = useState(existing?.goal || 0);
  const [proud, setProud] = useState(existing?.proud || "");
  const [next, setNext] = useState(existing?.next || "");
  const [st, finish] = useFinish(onSave);
  const [orders] = useState(() => RUBRIC82.map((r) => shuffleArr(r.check.options.map((_, k) => k))));
  const ck = checklist || {};
  const actT = (k) => ALL_ACTS2.find((a) => a.key === k)?.title.replace(/ · Page \d+/, "") || k;
  const proved = RUBRIC82.filter((r) => prove[r.id] === 0).length;
  const all = RUBRIC82.every((r) => stars[r.id] && how[r.id] && prove[r.id] !== undefined);
  const score = Math.round(RUBRIC82.reduce((a, r) => a + (stars[r.id] || 0), 0) / (RUBRIC82.length * 4) * 100);
  if (st.done) return <Reward title="Period 2 complete! 🏆" subtitle={`Prove-it challenges: ${proved}/${RUBRIC82.length}`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Star size={22} strokeWidth={2.1} />} title="My Self-Check · Period 2" subtitle="For each skill: prove it, say how you learned it, then rate yourself." onExit={onExit}>
      <HowTo>Seven skills. For each one: 1) <b>Prove it</b>. 2) See <b>where you practiced it</b> (✓ = done). 3) Choose <b>how you learned it best</b>. 4) Give yourself <b>stars</b> — be honest!</HowTo>
      <div className="g8-skills">
        {RUBRIC82.map((r, ri) => { const p = prove[r.id]; const doneActs = r.acts.filter((k) => ck[k]).length; return (
          <div key={r.id} className={`g8-skill ${stars[r.id] && how[r.id] && p !== undefined ? "done" : ""}`}>
            <header><span>{ri + 1}</span><div><b>{r.t}</b><small>{r.d}</small></div><i>{doneActs}/{r.acts.length} practiced</i></header>
            <div className="g8-skill-acts">{r.acts.map((k) => <span key={k} className={ck[k] ? "ok" : ""}>{ck[k] ? "✓" : "○"} {actT(k)}</span>)}</div>
            <div className="g8-skill-prove"><small>🎯 PROVE IT</small><b>{r.check.q}</b>
              <div>{orders[ri].map((k) => <button key={k} type="button" disabled={p !== undefined} className={p === undefined ? "" : k === 0 ? "ok" : k === p ? "no" : ""} onClick={() => setProve({ ...prove, [r.id]: k })}>{r.check.options[k]}</button>)}</div>
              {p !== undefined && <p className={p === 0 ? "ok" : "no"}>{p === 0 ? "✅ Correct!" : "❌ Not this time."} {r.check.tip}</p>}
            </div>
            <div className="g8-skill-row">
              <div><small>HOW DID YOU LEARN IT BEST?</small><div className="g74-chips">{HOW_L2.map(([k, l]) => <button key={k} type="button" className={how[r.id] === k ? "on" : ""} onClick={() => setHow({ ...how, [r.id]: k })}>{l}</button>)}</div></div>
              <div><small>MY LEVEL</small><div className="p3-stars">{[1, 2, 3, 4].map((n) => <button key={n} type="button" className={(stars[r.id] || 0) >= n ? "on" : ""} onClick={() => setStars({ ...stars, [r.id]: n })}>★</button>)}<small>{STAR_L2[stars[r.id] || 0]}</small></div></div>
            </div>
          </div>
        ); })}
      </div>
      <div className="p3-score"><small>My self-check</small><b>{score}%</b><div className="p3-mini-bar"><i style={{ width: `${score}%` }} /></div></div>
      <div className="start-block">
        <h3>🧭 Did the activities help you reach the goal?</h3>
        <p className="start-tip">Goal: <i>“Understand how saving today helps us achieve bigger opportunities tomorrow.”</i></p>
        <div className="g8-goalscale">{[["😕", "Not really"], ["🙂", "A little"], ["😀", "Yes"], ["🤩", "Totally!"]].map(([e, l], k) => <button key={l} type="button" className={goal === k + 1 ? "on" : ""} onClick={() => setGoal(k + 1)}><em>{e}</em>{l}</button>)}</div>
        <label className="p3-lbl">🌟 The activity that taught me the most was…<input className="start-input" value={proud} onChange={(e) => setProud(e.target.value)} placeholder="Write your answer here…" /></label>
        <label className="p3-lbl">🎯 Next period I want to improve…<input className="start-input" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Write your answer here…" /></label>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!all || !goal || countWords(proud) < 3 || !realText(proud) || countWords(next) < 3 || !realText(next)} onClick={() => finish(20, { stars, how, proved, score, goal, proud, next })}>{all ? "Send my self-check" : "Complete the 7 skills"} <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   ESTRUCTURA DEL PERIODO 2 (clases 11–21) · Goal Jar + Savings Portfolio
   ===================================================================== */
const A = (key, title, desc, icon, coins, bucket) => ({ key, title, desc, icon, coins, bucket });
const G8P2_WEEKS = [
  { n: 11, g: "11", title: "The Brain vs. The Wallet", blurb: "Why is saving so hard? Test your waiting power and meet your biases.", e: "🧠", skills: ["Video", "Game"], acts: [
    A("c11_starter", "Starter: Brain & Money 🧱", "6 key words + match game.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c11_video", "Video: Delayed Gratification 🎬", "Short video · no quiz · predict your time.", <Video size={22} />, 10, "quizzes"),
    A("c11_marsh", "The Marshmallow Test 🍬⏳", "Can you wait 60 seconds? For real.", <Timer size={22} />, 30, "aprendi"),
    A("c11_lab", "Temptation Lab 🧪", "8 temptations · Present You vs. Future You.", <Brain size={22} />, 30, "aprendi"),
    A("c11_rush", "Smart or Impulse? Rush ⚡", "14 situations · beat the clock.", <Zap size={22} />, 24, "aprendi"),
    A("c11_page", "My Money Personality 🧠 · Page 01", "Your triggers + your strategy.", <PenLine size={22} />, 25, "aprendi"),
  ] },
  { n: 12, g: "12", title: "The Future Price of a Dream", blurb: "Short, medium and long-term goals — and inflation. Create your Goal Jar!", e: "🎯", skills: ["Reading", "Math"], acts: [
    A("c12_starter", "Starter: Goals & Time 🧱", "SMART, deadline, inflation + quick game.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c12_read", "Reading: The Price of Tomorrow 📖", "Three friends, three goals · quiz (8 of 12).", <BookOpen size={22} />, 42, "quizzes"),
    A("c12_timeline", "Goal Timeline: Future Edition ⏳", "Sort 9 goals + inflation time machine.", <Hourglass size={22} />, 31, "aprendi"),
    A("c12_goal", "My Real Goal 🎯 · Page 02", "A SMART goal → your Goal Jar 🫙", <Target size={22} />, 30, "aprendi"),
  ] },
  { n: 13, g: "13", title: "The Savings Strategy League", blurb: "Four saving methods race through the same year. Who wins?", e: "♟️", skills: ["Video", "Simulator"], acts: [
    A("c13_starter", "Starter: Saving Methods 🧱", "6 methods + match game.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c13_video", "Video: Saving Tips for Teens 🎬", "5 tips · 8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c13_rush", "Which Method? Rush ⚡", "12 situations · 4 methods.", <Zap size={22} />, 24, "aprendi"),
    A("c13_battle", "Strategy Battle 🏆", "Predict · race · switch · league table.", <Trophy size={22} />, 36, "aprendi"),
    A("c13_page", "My Strategy ♟️ · Page 03", "Your method tested with your goal.", <Target size={22} />, 28, "aprendi"),
  ] },
  { n: 14, g: "14", title: "The True Price of Small Choices", blurb: "Small habits, big totals. Travel 10 years into the future.", e: "💧", skills: ["Reading", "Math"], acts: [
    A("c14_starter", "Starter: Small Choices 🧱", "Opportunity cost from zero.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c14_read", "Reading: What Did That Coffee Really Cost? ☕", "A research article · quiz (8 of 12).", <BookOpen size={22} />, 42, "quizzes"),
    A("c14_hunter", "Leak Hunter: Time Machine 💧⏳", "Build a leak · travel 1, 5, 10 years.", <Hourglass size={22} />, 37, "aprendi"),
    A("c14_rush", "Price or Opportunity Cost? ⚡", "12 cards · 60 seconds.", <Zap size={22} />, 24, "aprendi"),
    A("c14_page", "My Savings Budget 💧 · Page 04", "Help Valeria + your savings budget.", <PiggyBank size={22} />, 30, "aprendi"),
  ] },
  { n: 15, g: "15", title: "The Emergency That Changed Everything", blurb: "Same accident, two endings. Survive 12 months with and without a fund.", e: "🛟", skills: ["Story", "Simulator"], acts: [
    A("c15_starter", "Starter: Emergencies 🧱", "Fund, liquidity, debt + quick math.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c15_story", "Same Accident, Two Endings 📱💥", "A story · predict what happens.", <BookOpen size={22} />, 15, "quizzes"),
    A("c15_survival", "12-Month Survival 🛟", "Two lives, one year of surprises.", <LifeBuoy size={22} />, 34, "aprendi"),
    A("c15_rush", "Emergency or Not? Rush 🛟", "Use the fund — or plan it?", <Zap size={22} />, 24, "aprendi"),
    A("c15_page", "My Emergency Plan 🛟 · Page 05", "How much, where, when.", <Shield size={22} />, 30, "aprendi"),
  ] },
  { n: 16, g: "16", title: "The 10% Illusion", blurb: "EA vs. monthly, nominal vs. real. Become a rate detective.", e: "🔎", skills: ["Reading", "Math"], acts: [
    A("c16_starter", "Starter: Interest & Rates 🧱", "7 key words + quick math.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c16_read", "Reading: Why 10% Is Not Always 10% 📖", "An explainer · quiz (8 of 12).", <BookOpen size={22} />, 42, "quizzes"),
    A("c16_rate", "Rate Translator 🔎", "3 ideas + console + calculator + 6 offers.", <Percent size={22} />, 33, "aprendi"),
    A("c16_rush", "Real Gain or Real Loss? ⚡", "Rate vs. inflation · 12 cards.", <Zap size={22} />, 24, "aprendi"),
    A("c16_page", "My Goal with Interest 📈 · Page 06", "0% pocket vs. account with interest.", <TrendingUp size={22} />, 28, "aprendi"),
  ] },
  { n: 17, g: "17", title: "The Fine Print Challenge", blurb: "Accounts, pockets, CDTs — and one dangerous offer.", e: "🏦", skills: ["Reading", "Decision"], acts: [
    A("c17_starter", "Starter: Savings Products 🧱", "7 key words + quick game.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c17_read", "Reading: The Fine Print Challenge 📖", "An investigation · quiz (8 of 12).", <BookOpen size={22} />, 42, "quizzes"),
    A("c17_lab", "Savings Product Lab 🔍", "3 customers · 4 offers · 1 scam.", <Search size={22} />, 36, "aprendi"),
    A("c17_rush", "Legit or Too Good to Be True? 🚩", "12 offers · spot the fraud.", <Zap size={22} />, 24, "aprendi"),
    A("c17_page", "Where I'll Keep My Savings 🏦 · Page 07", "One product for the goal, one for emergencies.", <Landmark size={22} />, 28, "aprendi"),
  ] },
  { n: 18, g: "18", title: "Build It Without Borrowing", blurb: "Young founders, MVPs and the real cost of a loan.", e: "🚀", skills: ["Story", "Business"], acts: [
    A("c18_starter", "Starter: Founder Words 🧱", "Capital, loan, MVP + match game.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c18_story", "Founder Stories 🚀", "3 young founders · guess what happens.", <Rocket size={22} />, 15, "quizzes"),
    A("c18_boot", "Bootstrap Challenge 🥾", "Shopping list · save or borrow · sales reality.", <Hammer size={22} />, 30, "aprendi"),
    A("c18_rush", "Start Now or Later? Rush 🚀", "What does a business REALLY need?", <Zap size={22} />, 24, "aprendi"),
    A("c18_page", "My Business Capital Plan 🚀 · Page 08", "Capital · route · timeline · risks.", <Briefcase size={22} />, 28, "aprendi"),
  ] },
  { n: 19, g: "19", title: "How the World Saves", blurb: "Japan, Germany, China, Kenya and Colombia — and a natillera simulator.", e: "🌍", skills: ["Reading", "Global"], acts: [
    A("c19_starter", "Starter: Saving Together 🧱", "ROSCA, natillera, trust + quick game.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c19_read", "Reading: World Saving Tour 📖", "A travel magazine · quiz (8 of 12).", <BookOpen size={22} />, 42, "quizzes"),
    A("c19_tour", "World Saving Tour 🛂", "5 missions · 5 stamps.", <Plane size={22} />, 32, "aprendi"),
    A("c19_nat", "Natillera Simulator 🍮", "A group pool with real problems.", <Users size={22} />, 28, "aprendi"),
    A("c19_page", "Ideas from the World 🌍 · Page 09", "Borrow one strategy for your goal.", <Globe size={22} />, 26, "aprendi"),
  ] },
  { n: 20, g: "20", title: "Portfolio Studio", blurb: "Make it make sense: detect contradictions, fix them and present.", e: "🗂️", skills: ["Writing", "Speaking"], acts: [
    A("c20_studio", "Portfolio Studio 🗂️", "Contradiction detector + your final portfolio.", <Award size={22} />, 50, "aprendi"),
    A("c20_present", "Portfolio Showcase 🎤", "Present in 2 minutes + peer feedback.", <Mic size={22} />, 20, "comportamiento"),
  ] },
  { n: 21, g: "21", title: "Savings Boss: The Final Test", blurb: "Financial Survival Arena, the Boss quiz and your self-check.", e: "⚔️", skills: ["Challenge", "Review"], acts: [
    A("c21_arena", "Financial Survival Arena ⚔️", "The Dream · The Emergency · The Offer.", <Swords size={22} />, 50, "aprendi"),
    A("c21_quiz", "Savings Boss Quiz ⚔️", "15 questions from the period (70%).", <Trophy size={22} />, 70, "quizzes"),
    A("c21_self", "My Self-Check", "Prove 7 skills + how you learned them.", <Star size={22} />, 20, "comportamiento"),
  ] },
];
const ALL_ACTS2 = G8P2_WEEKS.flatMap((w) => w.acts);
const TOTAL_ACTS2 = ALL_ACTS2.length;
const PAGE_ACTS2 = [...PF_PAGES.map((p) => p.key), "c20_studio"];

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Periodo2G8 = ({ userData, API_URL, existingRow, onBack }) => {
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
  const doneCount = ALL_ACTS2.filter((a) => checklist[a.key]).length;
  const pctDone = Math.round((doneCount / TOTAL_ACTS2) * 100);
  const weekDone = (w) => w.acts.every((a) => checklist[a.key]);
  const coinsTotal = Math.round(points.comportamiento + points.quizzes + points.aprendi);

  const persist = (nextChecklist, nextPoints, respPatch) => {
    respRef.current = { ...respRef.current, ...respPatch };
    const done = ALL_ACTS2.filter((a) => nextChecklist[a.key]).length;
    const row = {
      Student_Key: userData.Student_Key, Semana: PERIOD_KEY, Grado: GRADE,
      Estado: done >= TOTAL_ACTS2 ? "completed" : "in_progress",
      Porcentaje: Math.round((done / TOTAL_ACTS2) * 100),
      Puntos_Comportamiento: nextPoints.comportamiento, Puntos_Quizzes: nextPoints.quizzes, Puntos_Aprendi: nextPoints.aprendi,
      Checklist_JSON: JSON.stringify(nextChecklist), Respuestas_JSON: JSON.stringify(respRef.current),
    };
    const prev = store.semanas?.[PERIOD_KEY];
    dispatch({ type: "save_progreso", payload: row }); // OPTIMISTA
    fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "save_progreso", data: row }) })
      .catch((e) => { console.error("Error guardando 8° Periodo 2:", e); dispatch({ type: "rollback_progreso", payload: { Semana: PERIOD_KEY, prev } }); });
  };
  const complete = (key, bucket, xp, respPatch, pass = true) => {
    const already = !!checklist[key];
    const nextChecklist = { ...checklist, [key]: already || pass };
    const nextPoints = already ? points : { ...points, [bucket]: points[bucket] + (xp || 0) };
    setChecklist(nextChecklist); setPoints(nextPoints);
    persist(nextChecklist, nextPoints, respPatch);
    return Promise.resolve();
  };
  const jarSrc = respRef.current.c12_goal;
  const jar = jarSrc ? { item: jarSrc.what, target: jarSrc.target, start: jarSrc.start || 0, weekly: jarSrc.weekly, logs: respRef.current.jarLogs || {} } : null;
  const logJar = (n, amt, kind) => {
    const key = `jar_${n}`;
    const already = !!checklist[key];
    const nextChecklist = { ...checklist, [key]: true };
    const nextPoints = already ? points : { ...points, comportamiento: points.comportamiento + 5 };
    setChecklist(nextChecklist); setPoints(nextPoints);
    persist(nextChecklist, nextPoints, { jarLogs: { ...(respRef.current.jarLogs || {}), [n]: amt }, jarKinds: { ...(respRef.current.jarKinds || {}), [n]: kind } });
    force((x) => x + 1);
  };
  const WRAP = "s1 p1 p2 p3 p4 g7 g72 g73 g74 g8 g82";

  if (act) {
    const def = ALL_ACTS2.find((a) => a.key === act);
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
      case "c11_starter": view = starter("Starter: Brain & Money 🧱", "Why is saving so hard? Start here.", START_11); break;
      case "c11_video": view = <WatchVideo src={VID_DG} title="Delayed Gratification 🎬" subtitle="A very short video. No quiz — just understand it." predict={{ q: "Before the test: how long do you think YOU can wait for a reward?", options: ["10 seconds", "30 seconds", "60 seconds — easy!"] }} after={<div className="p1-banner good"><span>💡 <b>Delayed gratification</b> = waiting now to get something better later. Next activity: try it for real!</span></div>} onSave={save} onExit={exit} />; break;
      case "c11_marsh": view = <MarshmallowTest resp={resp} onSave={save} onExit={exit} />; break;
      case "c11_lab": view = <TemptationLab onSave={save} onExit={exit} />; break;
      case "c11_rush": view = <SpeedSort title="Smart or Impulse? Rush ⚡" subtitle="Is it a bias trap or a smart move?" buckets={RUSH_IMPULSE.buckets} items={RUSH_IMPULSE.items} doneTitle="Bias buster! 🧠" onSave={save} onExit={exit} />; break;
      case "c11_page": view = <MoneyPersonality resp={resp} existing={resp.c11_page} onSave={save} onExit={exit} />; break;
      case "c12_starter": view = starter("Starter: Goals & Time 🧱", "Short, medium, long — and SMART.", START_12); break;
      case "c12_read": view = reading("READING · B1 · STORY", "The Price of Tomorrow", "Three friends, three goals: what makes a goal real?", READ_12, GLOSS_12, Q_12, "🎯"); break;
      case "c12_timeline": view = <GoalTimeline onSave={save} onExit={exit} />; break;
      case "c12_goal": view = <MyRealGoal existing={resp.c12_goal} onSave={save} onExit={exit} />; break;
      case "c13_starter": view = starter("Starter: Saving Methods 🧱", "Six words for the Strategy League.", START_13); break;
      case "c13_video": view = video(VID_TIPS, "Saving Tips for Teens", VQ_13); break;
      case "c13_rush": view = <SpeedSort title="Which Method? Rush ⚡" subtitle="Match each situation with its saving method." buckets={RUSH_METHOD.buckets} items={RUSH_METHOD.items} seconds={75} doneTitle="Method master! ♟️" onSave={save} onExit={exit} />; break;
      case "c13_battle": view = <StrategyBattle existing={resp.c13_battle} onSave={save} onExit={exit} />; break;
      case "c13_page": view = <MyStrategy resp={resp} existing={resp.c13_page} onSave={save} onExit={exit} />; break;
      case "c14_starter": view = starter("Starter: Small Choices 🧱", "Opportunity cost from zero.", START_14); break;
      case "c14_read": view = reading("READING · B1 · RESEARCH ARTICLE", "What Did That Coffee Really Cost?", "How much does a small habit cost when you repeat it?", READ_14, GLOSS_14, Q_14, "☕"); break;
      case "c14_hunter": view = <LeakHunter onSave={save} onExit={exit} />; break;
      case "c14_rush": view = <SpeedSort title="Price or Opportunity Cost? ⚡" subtitle="What you PAY vs. what you GIVE UP." buckets={RUSH_OPP.buckets} items={RUSH_OPP.items} doneTitle="Trade-off thinker! 🔁" onSave={save} onExit={exit} />; break;
      case "c14_page": view = <SavingsBudget existing={resp.c14_page} onSave={save} onExit={exit} />; break;
      case "c15_starter": view = starter("Starter: Emergencies 🧱", "Why a safety net matters.", START_15); break;
      case "c15_story": view = <EmergencyStory onSave={save} onExit={exit} />; break;
      case "c15_survival": view = <Survival12 onSave={save} onExit={exit} />; break;
      case "c15_rush": view = <SpeedSort title="Emergency or Not? Rush 🛟" subtitle="Use the fund — or plan it?" buckets={RUSH_EMERG.buckets} items={RUSH_EMERG.items} doneTitle="Emergency planner! 🛟" onSave={save} onExit={exit} />; break;
      case "c15_page": view = <EmergencyPlan existing={resp.c15_page} onSave={save} onExit={exit} />; break;
      case "c16_starter": view = starter("Starter: Interest & Rates 🧱", "EA, monthly, real — from zero.", START_16); break;
      case "c16_read": view = reading("READING · B1 · EXPLAINER", "Why 10% Is Not Always 10%", "Two ads say 10%. Are they the same?", READ_16, GLOSS_16, Q_16, "🔎"); break;
      case "c16_rate": view = <RateTranslator onSave={save} onExit={exit} />; break;
      case "c16_rush": view = <SpeedSort title="Real Gain or Real Loss? ⚡" subtitle="Compare the rate with inflation." buckets={RUSH_REAL.buckets} items={RUSH_REAL.items} doneTitle="Inflation fighter! 📈" onSave={save} onExit={exit} />; break;
      case "c16_page": view = <GoalWithInterest resp={resp} existing={resp.c16_page} onSave={save} onExit={exit} />; break;
      case "c17_starter": view = starter("Starter: Savings Products 🧱", "Account, pocket, CDT — and fraud.", START_17); break;
      case "c17_read": view = reading("READING · B1 · INVESTIGATION", "The Fine Print Challenge", "Is the highest rate always the best choice?", READ_17, GLOSS_17, Q_17, "🔍"); break;
      case "c17_lab": view = <ProductLab onSave={save} onExit={exit} />; break;
      case "c17_rush": view = <SpeedSort title="Legit or Too Good to Be True? 🚩" subtitle="Spot the fraud signals." buckets={RUSH_SCAM.buckets} items={RUSH_SCAM.items} doneTitle="Fraud detector! 🚩" onSave={save} onExit={exit} />; break;
      case "c17_page": view = <WhereKeep resp={resp} existing={resp.c17_page} onSave={save} onExit={exit} />; break;
      case "c18_starter": view = starter("Starter: Founder Words 🧱", "Capital, loans and bootstrapping.", START_18); break;
      case "c18_story": view = <FounderStories onSave={save} onExit={exit} />; break;
      case "c18_boot": view = <BootstrapChallenge onSave={save} onExit={exit} />; break;
      case "c18_rush": view = <SpeedSort title="Start Now or Later? Rush 🚀" subtitle="What does a new business REALLY need?" buckets={RUSH_MVP.buckets} items={RUSH_MVP.items} doneTitle="MVP builder! 🧪" onSave={save} onExit={exit} />; break;
      case "c18_page": view = <CapitalPlan resp={resp} existing={resp.c18_page} onSave={save} onExit={exit} />; break;
      case "c19_starter": view = starter("Starter: Saving Together 🧱", "Households, ROSCAs and natilleras.", START_19); break;
      case "c19_read": view = reading("READING · B1 · TRAVEL MAGAZINE", "World Saving Tour", "Do people in different places save in the same way?", READ_19, GLOSS_19, Q_19, "🌍"); break;
      case "c19_tour": view = <WorldTour onSave={save} onExit={exit} />; break;
      case "c19_nat": view = <Natillera onSave={save} onExit={exit} />; break;
      case "c19_page": view = <BorrowCulture resp={resp} existing={resp.c19_page} onSave={save} onExit={exit} />; break;
      case "c20_studio": view = <PortfolioStudio resp={resp} jar={jar} studentName={name} existing={resp.c20_studio} onSave={save} onExit={exit} />; break;
      case "c20_present": view = <Showcase82 onSave={save} onExit={exit} />; break;
      case "c21_arena": view = <SurvivalArena onSave={save} onExit={exit} />; break;
      case "c21_quiz": view = <QuizRunner title="Savings Boss · Period 2" emoji="⚔️" questions={BOSS_8P2} pickCount={15} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />; break;
      case "c21_self": view = <SelfCheck82 existing={resp.c21_self} checklist={checklist} onSave={save} onExit={exit} />; break;
      default: view = null;
    }
    return <div className={WRAP}>{view}</div>;
  }

  if (week) {
    const w = G8P2_WEEKS.find((x) => x.n === week);
    const wDone = w.acts.filter((a) => checklist[a.key]).length;
    const next = G8P2_WEEKS[G8P2_WEEKS.indexOf(w) + 1];
    return (
      <div className={WRAP}>
        <button className="s1-back" onClick={() => setWeek(null)}><ArrowLeft size={18} strokeWidth={2.4} /> Back to Period 2</button>
        <div className="s1-hero p1-week-hero g7-hero g8-hero">
          <span className="s1-tag">{w.e} GRADE 8 · PERIOD 2 · CLASS {w.g}</span>
          <h1>{w.title}</h1>
          <p>{w.blurb}</p>
          <div className="s1-progress"><div className="bar"><i style={{ width: `${(wDone / w.acts.length) * 100}%` }} /></div><span className="pill">{wDone}/{w.acts.length}</span></div>
        </div>
        <PortfolioPanel resp={respRef.current} compact />
        {w.n >= 12 && <GoalJar jar={jar} classN={respRef.current.c12_goal ? w.n : null} onLog={logJar} />}
        <div className="s1-quest">
          {w.acts.map((a) => (
            <div key={a.key} className={`act-card ${checklist[a.key] ? "done" : ""} ${PAGE_ACTS2.includes(a.key) ? "g8-page-act" : ""} ${a.title.startsWith("Starter") ? "g8-starter-act" : ""} ${a.key.endsWith("_rush") ? "g8-rush-act" : ""} ${a.key.endsWith("_read") || a.key.endsWith("_video") ? "g73-learn-act" : ""}`}>
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
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> ADMIN PREVIEW · GRADE {GRADE} · PERIOD 2</span>
        <h1>Saving Today, Achieving Tomorrow</h1>
        <p>How can saving money today help us achieve bigger opportunities tomorrow?</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pctDone}%` }} /></div><span className="pill">{pctDone}%</span></div>
        <div className="p1-hero-chips"><span><Coins size={14} /> {coinsTotal} coins</span><span><Check size={14} /> {doneCount}/{TOTAL_ACTS2} activities</span><span>🫙 Goal Jar</span><span>🗂️ Savings Portfolio</span><span>🎯 SDG 8</span></div>
      </div>
      <div className="g8-howyear"><b>🫙 This period:</b><span>In Class 12 you choose a REAL goal. At the end of every class, add what you saved to your <b>Goal Jar</b> and watch it fill up. Each class: Starter → one video or reading → games and simulators → a Portfolio page.</span></div>
      <GoalJar jar={jar} />
      <PortfolioPanel resp={respRef.current} studentName={name} />
      {checklist.c20_studio && <button type="button" className="p3-card-link" onClick={() => setAct("c20_studio")}><Award size={18} /> See my Savings Portfolio <ChevronRight size={16} /></button>}
      <div className="p1-passport">
        <div className="p1-passport-head"><b>🫙 Savings Season Pass</b><span>Finish a class to get its stamp</span></div>
        <div className="p1-stamps">{G8P2_WEEKS.map((w) => <button key={w.n} type="button" className={`p1-stamp ${weekDone(w) ? "done" : ""} ${checklist[`jar_${w.n}`] ? "jar" : ""}`} onClick={() => setWeek(w.n)} title={w.title}><em>{w.e}</em><small>{w.g}</small></button>)}</div>
      </div>
      <div className="p1-weeks">
        {G8P2_WEEKS.map((w) => {
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