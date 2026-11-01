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
import "../Styles/noveno3.css";   // 9° · Periodo 3 · Startup District
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   GRADO 9 · PERIODO 3 · STARTUP CHALLENGE (B1–B1+)
   Clases 1–8 · Pregunta guía: How can banking services, financial products
   and responsible decisions help young people build a secure financial future?
   Hilo: FINANCIAL DISTRICT · Season 01 — un distrito simulado (todo en código):
   el District Bank y tu cuenta empiezan IGUAL para todos y cambian con TUS decisiones.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "9P3" (lee también "9P1" y "9P2"), Grado = "9".
   ===================================================================== */
const PERIOD_KEY = "9P3";
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
  const p = PAGES93.find((x) => x.n === n);
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
  if (p7 && m) { const put = Math.round(s.cash * (p7.pct || 0) / 100); s.cash -= put; s.invPut = put; s.inv = Math.round(put * (1 + (m.ret || 0) / 100)); }
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
   PERIODO 3 · 9° · EXPLICACIONES CORTAS (B1–B1+, 4–5 min) · 8 preguntas → 6
   Sin videos ni listenings: nosotros explicamos y ellos HACEN.
   Opciones: correcta (nunca la más larga) · parecida pero errada (la más larga)
             · trampa corta (errada) · nada que ver
   ===================================================================== */

/* ---------- BRIEF 1 · From Problems to Opportunities ---------- */
const BRIEF_1 = [
  { sub: "Every business starts with a problem" },
  { p: "Look around your school or your neighborhood. A long line at the cafeteria. Plastic bags everywhere. Bread thrown away at night. A grandmother who can't pay with her phone. For most people, these are just annoying situations. For an entrepreneur, they are opportunities." },
  { p: "An opportunity is a problem that many people have, that happens often, and that someone could solve in a better way. Entrepreneurs don't start with “What can I sell?”. They start with “What problem can I solve?”." },
  { sub: "The four questions of a Problem Hunter" },
  { box: "1) What is the problem? 2) Who has this problem? 3) How often does it happen? 4) What could we create to solve it?" },
  { p: "If only one person has the problem once a year, it is not a good opportunity. If hundreds of students have it every day, it might be. The best opportunities are frequent, painful and shared by many people." },
  { sub: "Useful, creative and viable" },
  { p: "A good solution must be useful (it really solves the problem), creative (it's different from what already exists) and viable (it is possible with the money, time and resources you have). A giant factory may be useful and creative — but it is not viable for a 9th grader." },
  { p: "Many famous companies started like this: someone noticed a small problem, asked questions, tested a simple solution and improved it. This season, you will do the same: you will choose one real problem from the Startup District and build ONE startup that grows class after class." },
];
const GLOSS_B1 = { "opportunity": "Oportunidad de negocio.", "entrepreneur": "Emprendedor(a).", "viable": "Viable (posible con tus recursos).", "frequent": "Frecuente.", "customer": "Cliente.", "solution": "Solución." };
const Q_B1 = [
  { q: "Where does every business start, according to the text?", options: ["With a problem", "With a big loan from the bank and a nice logo that customers will remember", "With a product", "With luck"], correct: 0, feedback: "Start with “What problem can I solve?”." },
  { q: "What is an opportunity?", options: ["A problem many people have often", "Any idea that you like a lot, even if nobody has the problem it solves", "A product on sale", "A loan"], correct: 0, feedback: "Frequent, painful and shared." },
  { q: "Which is NOT one of the four questions of a Problem Hunter?", options: ["How famous will I be?", "Who has this problem, and how often does it happen during the year?", "What is the problem?", "What could we create?"], correct: 0, feedback: "Fame is not a question about the problem!" },
  { q: "One person has a problem once a year. Is it a good opportunity?", options: ["Probably not", "Yes, because every problem is always a great business opportunity for an entrepreneur", "Yes, always", "Only online"], correct: 0, feedback: "Too few people, too rarely." },
  { q: "What does “viable” mean?", options: ["Possible with your resources", "The most creative and original idea in the world, even if it is impossible to build", "Very expensive", "Famous"], correct: 0, feedback: "Money, time and resources." },
  { q: "Why is a giant factory not a good idea for a 9th grader?", options: ["It isn't viable", "Because factories are never useful and never solve any real problem for anybody", "It's boring", "It's illegal"], correct: 0, feedback: "Useful and creative — but not viable." },
  { q: "What three qualities should a good solution have?", options: ["Useful, creative and viable", "Expensive, complicated and secret, so that no competitor can ever copy the idea", "Fast, cheap, easy", "Big, loud, famous"], correct: 0, feedback: "The three filters of the season." },
  { q: "What will you build this season?", options: ["One startup that grows every class", "Eight different businesses, one new business every single class of the period", "A bank", "Nothing"], correct: 0, feedback: "Same startup, from idea to Business Fair." },
];

/* ---------- BRIEF 2 · Why Would Anyone Buy It? ---------- */
const BRIEF_2 = [
  { sub: "People don't buy products — they buy solutions" },
  { p: "Nobody wakes up thinking, “I want a drill.” They think, “I want a hole in the wall for my family photo.” Customers buy what a product does for them: it saves time, saves money, makes them feel safe, healthy, beautiful or part of a group." },
  { p: "A value proposition is a short, clear promise: why a specific customer should choose YOUR product and not another one. It is not a slogan like “We are the best.” It explains the customer's problem, your solution, the main benefit and what makes you different." },
  { box: "Formula: For [customer] who [problem], our [product] [main benefit]. Unlike [alternatives], we [difference]." },
  { sub: "Bad vs. good" },
  { p: "Bad: “We sell shoes because shoes are good and everyone needs shoes.” It has no specific customer, no problem and no difference. Good: “For school runners who get blisters, our light running shoes have soft insoles that protect their feet. Unlike cheap sneakers, they last a whole year.”" },
  { sub: "The same object, different customers" },
  { p: "A small backpack can be useless for a student with ten books — but perfect for a runner who needs to carry only keys and water. Value depends on the customer. That's why entrepreneurs talk to customers, listen to their complaints and change their proposal when the customer says, “I wouldn't buy that.”" },
];
const GLOSS_B2 = { "value proposition": "Propuesta de valor.", "benefit": "Beneficio.", "alternative": "Alternativa (lo que el cliente usa hoy).", "slogan": "Eslogan.", "blister": "Ampolla.", "complaint": "Queja." };
const Q_B2 = [
  { q: "What do customers really buy?", options: ["What the product does for them", "The most expensive version of every product, because price shows that it is good", "Logos", "Boxes"], correct: 0, feedback: "Solutions, not objects." },
  { q: "What is a value proposition?", options: ["A clear promise of why a customer should choose you", "A slogan like “We are the best in the world” that you repeat in every advertisement", "A price list", "A loan"], correct: 0, feedback: "Customer + problem + benefit + difference." },
  { q: "What is missing in “We sell shoes because shoes are good”?", options: ["A customer, a problem and a difference", "Nothing — it is a perfect value proposition because everybody needs shoes", "A price", "A color"], correct: 0, feedback: "Too general = no value." },
  { q: "In the good example, who is the customer?", options: ["School runners who get blisters", "Everybody in the world who has feet and wants to buy any kind of shoes", "Shoe factories", "Teachers"], correct: 0, feedback: "Specific customer!" },
  { q: "What is the difference in the good example?", options: ["They last a whole year", "They are cheaper than every other shoe on the market and they come in many colors", "They are blue", "No difference"], correct: 0, feedback: "“Unlike cheap sneakers…”" },
  { q: "Why can a small backpack be valuable?", options: ["It's perfect for a specific customer, like a runner", "Because small things are always more expensive and customers love expensive things", "It isn't", "It's free"], correct: 0, feedback: "Value depends on the customer." },
  { q: "What should you do when a customer says “I wouldn't buy that”?", options: ["Listen and change the proposal", "Ignore the customer, because customers never know what they really need", "Lower the price to zero", "Close the business"], correct: 0, feedback: "Customers' complaints are information." },
  { q: "Which part comes FIRST in the formula?", options: ["The customer", "The price, because customers only care about how much the product costs", "The logo", "The difference"], correct: 0, feedback: "“For [customer] who [problem]…”" },
];

/* ---------- BRIEF 3 · The 9 Blocks ---------- */
const BRIEF_3 = [
  { sub: "A business on one page" },
  { p: "A business plan can have 50 pages. A Business Model Canvas has only one. It shows, in nine blocks, how a business creates value, delivers it and makes money. If one block changes, others change too." },
  { box: "THE RIGHT SIDE (customers): 1) Customer Segments — who you serve. 2) Value Propositions — why they choose you. 3) Channels — how you reach and deliver. 4) Customer Relationships — how you keep them. 5) Revenue Streams — how you earn money." },
  { box: "THE LEFT SIDE (the business): 6) Key Resources — what you need (people, machines, an app). 7) Key Activities — what you must do every day. 8) Key Partnerships — who helps you (suppliers, allies). 9) Cost Structure — what you pay." },
  { sub: "Everything is connected" },
  { p: "Imagine a healthy lunch app. If you decide to deliver to homes (Channels), you need riders (Key Resources). Riders cost money (Cost Structure). Higher costs may force you to raise your price (Revenue Streams) — and some customers may leave (Customer Segments)." },
  { p: "That's why entrepreneurs test their canvas: every decision has consequences. When an investor says, “Reduce your costs,” you don't destroy the business — you change one or two blocks and check that the model still works." },
];
const GLOSS_B3 = { "canvas": "Lienzo (plantilla de una página).", "segment": "Segmento (grupo de clientes).", "channel": "Canal.", "revenue stream": "Fuente de ingresos.", "key resources": "Recursos clave.", "partnership": "Alianza." };
const Q_B3 = [
  { q: "How many blocks does a Business Model Canvas have?", options: ["Nine", "Fifty, one block for every page of a traditional business plan", "Five", "Three"], correct: 0, feedback: "Nine blocks, one page." },
  { q: "Which block answers “who do we serve?”", options: ["Customer Segments", "Cost Structure, because customers are the biggest cost of every company", "Channels", "Key Activities"], correct: 0, feedback: "Who are the customers?" },
  { q: "Which block answers “how do we earn money?”", options: ["Revenue Streams", "Key Partnerships, because partners always pay the company every month", "Resources", "Relationships"], correct: 0, feedback: "Sales, subscriptions, commissions…" },
  { q: "Suppliers and allies belong to…", options: ["Key Partnerships", "Customer Segments, because suppliers are the most important customers", "Channels", "Revenue"], correct: 0, feedback: "Who helps you." },
  { q: "Home delivery is a decision in which block?", options: ["Channels", "Value Propositions only, because delivery is never connected with costs", "Partnerships", "Segments"], correct: 0, feedback: "How you deliver — and it affects costs!" },
  { q: "If you add riders, which block increases?", options: ["Cost Structure", "Customer Relationships, because riders talk with the customers every day", "Revenue", "Nothing"], correct: 0, feedback: "Riders cost money." },
  { q: "What does the left side of the canvas show?", options: ["How the business works inside", "Only the customers and the advertisements that the business will publish online", "The logo", "The price"], correct: 0, feedback: "Resources, activities, partners, costs." },
  { q: "An investor says “reduce your costs.” What do you do?", options: ["Change one or two blocks and check the model", "Destroy the whole canvas and start a completely different business from zero", "Ignore it", "Raise prices x3"], correct: 0, feedback: "Adjust, don't destroy." },
];

/* ---------- BRIEF 4 · The Price Is Right? ---------- */
const BRIEF_4 = [
  { sub: "Three numbers behind every price" },
  { p: "Choosing a price is not guessing. Entrepreneurs look at three things: their costs, what competitors charge, and how much value customers see in the product." },
  { box: "Unit cost = everything you spend to make ONE product (materials, labor, packaging, other). Price − unit cost = margin per unit. Fixed costs = what you pay every month even if you sell nothing (rent, app, salaries)." },
  { sub: "Break-even: the magic number" },
  { p: "If your fixed costs are $1,000,000 a month and your margin is $5,000 per product, you must sell 200 products just to cover your costs: 1,000,000 ÷ 5,000 = 200. That is your break-even point. Product number 201 is your first profit." },
  { sub: "Too high, too low, just right" },
  { p: "A price that is too high scares customers away. A price that is too low can bring many customers — and still lose money, because every sale has a small margin. Some customers even think, “Why is it so cheap? Maybe it's bad quality.”" },
  { p: "The goal is not to sell the most. The goal is to make a healthy profit while customers feel the price is fair. Remember: more sales is not the same as more profit." },
];
const GLOSS_B4 = { "unit cost": "Costo unitario.", "margin": "Margen (ganancia por unidad).", "fixed costs": "Costos fijos.", "break-even": "Punto de equilibrio.", "competitor": "Competidor.", "profit": "Ganancia / utilidad." };
const Q_B4 = [
  { q: "What three things do entrepreneurs look at to set a price?", options: ["Costs, competitors and customer value", "Only their own feelings about what the product should cost this month", "The weather", "Logos"], correct: 0, feedback: "Costs + competition + value." },
  { q: "Materials $5,000 + labor $2,000 + packaging $1,000 + other $1,000. What is the unit cost?", options: ["$9,000", "$5,000, because only the materials count as a real cost of the product", "$8,000", "$10,000"], correct: 0, feedback: "Add everything." },
  { q: "Price $14,000, unit cost $9,000. What is the margin?", options: ["$5,000", "$23,000, because the margin is the price plus the cost of the product", "$9,000", "$14,000"], correct: 0, feedback: "Price − unit cost." },
  { q: "What are fixed costs?", options: ["Costs you pay every month even with no sales", "Costs that change with every product, like the ingredients of each lunch box", "Taxes only", "Prices"], correct: 0, feedback: "Rent, app, salaries…" },
  { q: "Fixed costs $1,000,000, margin $5,000. What is the break-even?", options: ["200 products", "5,000 products, because you need to sell one product for every peso of margin", "100", "20"], correct: 0, feedback: "1,000,000 ÷ 5,000 = 200." },
  { q: "Why can a very low price lose money?", options: ["Each sale has a tiny margin", "Because the government charges a special tax to businesses that sell cheap products", "It can't", "Customers pay more"], correct: 0, feedback: "Many sales × tiny margin < fixed costs." },
  { q: "What might customers think if a price is TOO low?", options: ["Maybe it's bad quality", "That it is the best quality in the world, because cheap always means excellent", "Nothing", "That it's illegal"], correct: 0, feedback: "Suspicion!" },
  { q: "What is the goal of pricing?", options: ["A healthy profit with a fair price", "Selling more units than every competitor, even if the business loses money", "The lowest price", "The highest price"], correct: 0, feedback: "More sales ≠ more profit." },
];

/* ---------- BRIEF 5 · How Investors Think ---------- */
const BRIEF_5 = [
  { sub: "Money in exchange for a piece of your company" },
  { p: "Some startups need more money than the founder has. One option is an investor: a person or company that gives money in exchange for equity — a percentage of ownership. If an investor gives $20,000,000 for 10% of your startup, they now own one tenth of it." },
  { box: "Valuation = investment ÷ equity. $20,000,000 ÷ 10% = $200,000,000. That's how much the investor thinks the whole company is worth." },
  { sub: "What investors check" },
  { p: "Investors are not looking for the prettiest logo. They ask five questions: What problem does it solve? Is there a market (enough customers)? How does it make money? What are the risks? Is the deal fair? A great idea with a crazy valuation can still be a bad investment." },
  { sub: "Negotiation" },
  { p: "In a negotiation, the investor can accept, reject, ask for more equity, offer less money, or ask you to improve something first. The founder must protect two things: enough money to grow, and enough ownership to keep control. If you give away too much equity early, your company may stop being yours." },
  { p: "Investors also diversify: they put money in several startups, because many startups fail. Return on investment (ROI) tells them how much they won or lost: if $10,000,000 becomes $25,000,000, the ROI is 150%." },
];
const GLOSS_B5 = { "investor": "Inversionista.", "equity": "Participación (porcentaje de la empresa).", "valuation": "Valoración (lo que vale la empresa).", "deal": "Trato / acuerdo.", "ROI": "Retorno sobre la inversión.", "founder": "Fundador(a)." };
const Q_B5 = [
  { q: "What does an investor receive in exchange for money?", options: ["Equity — a part of the company", "A monthly salary and a job in the company for the rest of their life", "Nothing", "Interest only"], correct: 0, feedback: "Ownership." },
  { q: "$20,000,000 for 10%. What is the valuation?", options: ["$200,000,000", "$2,000,000, because you divide the investment by ten to get the valuation", "$20,000,000", "$30,000,000"], correct: 0, feedback: "Investment ÷ equity." },
  { q: "Which is NOT one of the investors' five questions?", options: ["Is the logo pretty?", "Is there a market with enough customers who will pay for the product?", "How does it make money?", "What are the risks?"], correct: 0, feedback: "Logos don't pay the bills." },
  { q: "Can a great idea be a bad investment?", options: ["Yes, if the valuation is crazy", "No, because a great idea always gives the investor a big profit in a short time", "Never", "Only online"], correct: 0, feedback: "The deal must be fair." },
  { q: "What can an investor do in a negotiation?", options: ["Accept, reject, ask for more equity, offer less", "Only accept the first offer, because negotiating is not allowed between founders and investors", "Nothing", "Buy the founder"], correct: 0, feedback: "Many possible moves." },
  { q: "What two things must the founder protect?", options: ["Money to grow and ownership", "The office furniture and the company's social media followers", "The logo and the colors", "Nothing"], correct: 0, feedback: "Growth + control." },
  { q: "Why do investors diversify?", options: ["Many startups fail", "Because the law forces them to invest in exactly ten companies every year", "To pay less tax", "For fun"], correct: 0, feedback: "Don't put all the money in one startup." },
  { q: "$10,000,000 becomes $25,000,000. What is the ROI?", options: ["150%", "250%, because the final value is two and a half times the original investment", "25%", "15%"], correct: 0, feedback: "Gain $15M ÷ $10M = 150%." },
];

/* ---------- BRIEF 6 · Marketing That Tells the Truth ---------- */
const BRIEF_6 = [
  { sub: "Marketing = the right message, to the right people, in the right place" },
  { p: "A great product that nobody knows doesn't sell. Digital marketing helps small businesses reach customers with little money. A campaign has six parts: target audience, platform, message, visual, call to action (“Order now”, “Visit us”) and budget." },
  { p: "Choosing the platform depends on the audience. Teenagers may be on TikTok and Instagram; parents may use WhatsApp and Facebook; older adults may trust a flyer at the bakery. Spending money where your customers are NOT is like shouting in an empty room." },
  { sub: "Honest marketing builds a reputation" },
  { p: "Some ads use tricks: invented testimonials, edited photos, “100% guaranteed” promises, or hidden costs. They can bring quick clicks — and then angry customers, bad reviews and even legal problems. In Colombia, advertising must be truthful and must not mislead consumers." },
  { sub: "Responsible AI" },
  { box: "AI can help you write captions, create images and analyze results. But before publishing, check: Is it true? Is the image a fair representation of the real product? Does it use someone's face, voice or name without permission? Are invented statistics or fake reviews included? If AI made it, should you say so?" },
  { p: "Using a famous person's image or voice without permission is not creativity — it's identity misuse. A good marketer uses AI as an assistant, not as a liar." },
];
const GLOSS_B6 = { "target audience": "Público objetivo.", "call to action": "Llamado a la acción.", "reach": "Alcance (cuántas personas lo ven).", "misleading": "Engañoso.", "testimonial": "Testimonio.", "permission": "Permiso / autorización." };
const Q_B6 = [
  { q: "How many parts does a campaign have in the text?", options: ["Six", "Ten, because every campaign also needs a famous influencer, a song and a logo", "Three", "Two"], correct: 0, feedback: "Audience, platform, message, visual, CTA, budget." },
  { q: "What is a call to action?", options: ["A phrase like “Order now”", "The phone call that the business makes to every customer after they buy a product", "A price", "A logo"], correct: 0, feedback: "It tells people what to do next." },
  { q: "Why does the platform depend on the audience?", options: ["You must be where your customers are", "Because every platform charges exactly the same price and has exactly the same users", "It doesn't", "For fun"], correct: 0, feedback: "Don't shout in an empty room." },
  { q: "Which is a misleading trick?", options: ["Invented testimonials", "Showing a real photo of the product with its real price and the conditions of the offer", "A clear price", "A real review"], correct: 0, feedback: "Fake reviews = misleading." },
  { q: "What can happen with misleading ads?", options: ["Angry customers and bad reviews", "More trust from customers, because people love surprises and exaggerated promises", "Nothing", "Free money"], correct: 0, feedback: "Quick clicks, long problems." },
  { q: "Which should you check before publishing AI content?", options: ["Is it true and do we have permission?", "Only if the image is beautiful and has the colors of the brand, nothing else matters", "Nothing", "The weather"], correct: 0, feedback: "Truth + permission + fair representation." },
  { q: "Using a celebrity's AI voice without permission is…", options: ["identity misuse", "a creative and totally legal way to make the campaign more viral and famous", "fine", "required"], correct: 0, feedback: "Not creativity — misuse." },
  { q: "How should a good marketer use AI?", options: ["As an assistant, not as a liar", "To create fake reviews and statistics, because customers can't check them anyway", "Never", "Only for logos"], correct: 0, feedback: "AI helps; you stay responsible." },
];

/* ---------- BRIEF 7 · Your Life at 25 ---------- */
const BRIEF_7 = [
  { sub: "Fast-forward ten years" },
  { p: "Imagine you are 25. You have a job that pays $3,500,000 a month. After rent, food, transport, services and entertainment, $1,250,000 is left. What do you do with it? Spend it all? Save it? Invest it? Start a business? Your choices at 25 shape your life at 35." },
  { sub: "SMART goals" },
  { p: "“I want to be rich” is a wish, not a goal. A SMART goal is Specific, Measurable, Achievable, Relevant and Time-bound." },
  { box: "Wish: “I want to travel.” SMART goal: “I will save $3,600,000 in 12 months — $300,000 every month — to travel to Cartagena with my family in December.”" },
  { sub: "The emergency fund comes first" },
  { p: "Life brings surprises: a broken laptop, a rent increase, a family emergency. An emergency fund (around 3 to 6 months of basic expenses) lets you face them without debt. Without it, a small problem can become a big loan." },
  { sub: "Personal money vs. business money" },
  { p: "Many young entrepreneurs make the same mistake: they mix their personal money with the business money. They use the business sales to pay their phone, their clothes and their parties. Then they don't know if the business really makes a profit, they can't pay suppliers, and the business dies. Rule: separate accounts, pay yourself a salary, and reinvest part of the profit." },
];
const GLOSS_B7 = { "SMART goal": "Meta específica, medible, alcanzable, relevante y con fecha.", "emergency fund": "Fondo de emergencia.", "reinvest": "Reinvertir.", "salary": "Salario.", "time-bound": "Con fecha límite.", "wish": "Deseo." };
const Q_B7 = [
  { q: "At 25, how much is left after the basic expenses?", options: ["$1,250,000", "$3,500,000, because the salary is all free money after paying the basic expenses", "$500,000", "$0"], correct: 0, feedback: "That's the money to plan." },
  { q: "Why is “I want to be rich” not a SMART goal?", options: ["It isn't specific or measurable", "Because it is too small, and a SMART goal must always be about millions of pesos", "It is SMART", "It's too short"], correct: 0, feedback: "How much? When?" },
  { q: "What does the T in SMART mean?", options: ["Time-bound", "Total, because a SMART goal must include the total money of your whole life", "True", "Tiny"], correct: 0, feedback: "It has a deadline." },
  { q: "$3,600,000 in 12 months. How much per month?", options: ["$300,000", "$3,600,000, because you must save the total amount every month to be safe", "$36,000", "$360,000"], correct: 0, feedback: "3,600,000 ÷ 12." },
  { q: "What is an emergency fund for?", options: ["Facing surprises without debt", "Buying the things you want when there is a big sale on the internet", "Paying for parties", "Investing in crypto"], correct: 0, feedback: "A cushion for bad surprises." },
  { q: "How big should an emergency fund be (approx.)?", options: ["3 to 6 months of basic expenses", "Ten years of your full salary, saved in cash at home under the mattress", "One day", "$1,000"], correct: 0, feedback: "A common guideline." },
  { q: "What mistake do many young entrepreneurs make?", options: ["Mixing personal and business money", "Opening a separate bank account for the business and paying themselves a fixed salary", "Saving", "Planning"], correct: 0, feedback: "Then they can't see the real profit." },
  { q: "What is the rule for business money?", options: ["Separate accounts, a salary, reinvest", "Spend all the sales on yourself, because the business belongs to you anyway", "Keep it in cash", "Give it away"], correct: 0, feedback: "Clean, ordered money." },
];

/* ---------- BOSS · The Startup Boss ---------- */
const BOSS_MISSIONS93 = [
  { tag: "MISSION 1 · OPPORTUNITY", q: "Which problem is the BEST business opportunity?", options: ["300 students wait 20 minutes in line every day", "One teacher who lost his umbrella last year and would like a new one in a special color", "A rainy day", "A friend's birthday"], correct: 0, hint: "Frequent + many people + painful.", explain: "Many people, every day — a real opportunity." },
  { tag: "MISSION 2 · VALUE", q: "Choose the best value proposition.", options: ["For busy parents, our lunch box saves 30 minutes every morning", "We sell the best lunch boxes in the whole world because our lunch boxes are very good", "Lunch is good", "Buy our product"], correct: 0, hint: "Customer + benefit.", explain: "Specific customer, clear benefit." },
  { tag: "MISSION 3 · CANVAS", q: "You add home delivery with riders. Which block MUST you update?", options: ["Cost Structure", "Customer Segments, because delivery changes who your customers are in every case", "Your logo", "Nothing"], correct: 0, hint: "Riders cost money.", explain: "Every decision has consequences." },
  { tag: "MISSION 4 · PRICING", q: "Fixed costs $1,200,000. Price $15,000, unit cost $9,000. How many units to break even?", answer: 200, unit: "units", hint: "Margin = 15,000 − 9,000. Then 1,200,000 ÷ margin.", explain: "1,200,000 ÷ 6,000 = 200 units." },
  { tag: "MISSION 5 · INVESTORS", q: "An investor offers $15,000,000 for 30% of your startup. What valuation is that?", answer: 50000000, money: true, hint: "Investment ÷ equity (30% = 0.30).", explain: "$15,000,000 ÷ 0.30 = $50,000,000." },
];
const BOSS_Q93 = [
  { q: "What is a value proposition?", options: ["Why a customer should choose you", "The total amount of money that investors put in the company during the first year", "A price", "A logo"], correct: 0, feedback: "Customer, problem, benefit, difference." },
  { q: "What does “viable” mean?", options: ["Possible with your resources", "The most creative idea, even if it costs more money than any company in the country has", "Cheap", "Famous"], correct: 0, feedback: "Can you really do it?" },
  { q: "Which canvas block shows how you reach customers?", options: ["Channels", "Key Partnerships, because partners always deliver the product to the customers", "Costs", "Resources"], correct: 0, feedback: "Instagram, a stand, an app…" },
  { q: "Price − unit cost =", options: ["margin", "fixed costs, which you pay every month even if you don't sell anything", "revenue", "equity"], correct: 0, feedback: "Margin per unit." },
  { q: "Why is more sales not always more profit?", options: ["A low margin may not cover fixed costs", "Because selling more products always makes the government increase the taxes of the company", "It always is", "Customers pay less"], correct: 0, feedback: "Price matters." },
  { q: "What is equity?", options: ["A percentage of ownership", "The monthly interest that the company pays to the investor for the money", "A loan", "A product"], correct: 0, feedback: "Investors buy equity." },
  { q: "What happens if a founder gives away too much equity?", options: ["They can lose control", "Nothing — founders always keep control, even if they own only 5% of the company", "They get richer", "Taxes go down"], correct: 0, feedback: "Protect ownership." },
  { q: "Which ad is misleading?", options: ["“100% guaranteed results, doctors agree” (invented)", "A real photo of the product with its price and the real conditions of the promotion", "A clear price", "A real review"], correct: 0, feedback: "Invented claims mislead." },
  { q: "Before publishing an AI image of a famous person using your product, you need…", options: ["their permission", "nothing, because AI images are always legal and nobody can complain about them", "more filters", "a bigger budget"], correct: 0, feedback: "Identity needs permission." },
  { q: "What makes a goal SMART?", options: ["Specific, measurable, achievable, relevant, time-bound", "Simple, magical, amazing, rich and tall, so that it motivates you every morning", "Short", "Secret"], correct: 0, feedback: "How much + when." },
  { q: "Why keep an emergency fund?", options: ["To face surprises without debt", "To spend on parties and trips whenever there is a long weekend", "To invest in crypto", "No reason"], correct: 0, feedback: "Cushion first." },
  { q: "Why separate personal and business money?", options: ["To see the real profit and pay the bills", "Because banks don't allow young people to have more than one account", "It doesn't matter", "To pay more tax"], correct: 0, feedback: "Mixing kills businesses." },
];

/* =====================================================================
   CLASE 1 · THE PROBLEM HUNTERS
   ===================================================================== */
const SCENE_P1 = [
  { e: "🧍‍♂️🧍‍♀️🧍", t: "A 20-minute line at the school cafeteria", o: 1 },
  { e: "🛍️🗑️", t: "Plastic bags piling up next to the buildings", o: 1 },
  { e: "🥖🚮", t: "A bakery throwing away bread at 8 p.m.", o: 1 },
  { e: "☀️🌳", t: "A sunny afternoon in the park", o: 0 },
  { e: "👵🏧", t: "A grandmother stuck at an ATM, asking for help", o: 1 },
  { e: "😂👫", t: "Two friends laughing at a joke", o: 0 },
  { e: "🚏🌧️", t: "People waiting in the rain with no bus information", o: 1 },
  { e: "🐈💤", t: "A cat sleeping on a wall", o: 0 },
  { e: "✏️❓", t: "Kids looking for lost pencils every morning", o: 1 },
];
const WHO_P1 = ["Students", "Parents", "Older adults", "Small businesses", "Neighbors", "Workers"];
const FREQ_P1 = [["day", "Every day"], ["week", "Every week"], ["year", "Once a year"]];
function OppRadar({ onSave, onExit }) {
  const [on, setOn] = useState([]);
  const [checked, setChecked] = useState(false);
  const [pick, setPick] = useState(null);
  const [who, setWho] = useState("");
  const [freq, setFreq] = useState("");
  const [idea, setIdea] = useState("");
  const [st, finish] = useFinish(onSave);
  const right = SCENE_P1.filter((s, i) => !!s.o === on.includes(i)).length;
  const opps = SCENE_P1.map((s, i) => ({ ...s, i })).filter((s) => s.o);
  const coins = 10 + right + (freq === "day" ? 3 : freq === "week" ? 2 : 0);
  if (st.done) return <Reward title="Radar on! 📡" subtitle={`${right}/9 scenes read correctly`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Target size={22} strokeWidth={2.1} />} title="Opportunity Radar 📡" subtitle="Walk through the Startup District. Turn on your radar where you see a business opportunity." onExit={onExit}>
      <Brief91 k="c1_radar" />
      <HowTo>Tap every scene where there is a <b>problem someone could solve</b>. Careful: not every scene is a problem! Then press <b>Scan</b>.</HowTo>
      <div className="g93-scene">{SCENE_P1.map((s, i) => <button key={i} type="button" disabled={checked} className={`${on.includes(i) ? "on" : ""} ${checked ? (!!s.o === on.includes(i) ? "ok" : "no") : ""}`} onClick={() => setOn(on.includes(i) ? on.filter((x) => x !== i) : [...on, i])}><em>{s.e}</em><span>{s.t}</span>{on.includes(i) && <i>📡</i>}</button>)}</div>
      {!checked ? <div className="start-foot"><button className="s1-btn primary big" disabled={!on.length} onClick={() => setChecked(true)}>Scan <Search size={17} /></button></div> : (
        <>
          <div className={`p1-banner ${right >= 8 ? "good" : "bad"}`}><span>{right}/9 correct. A sunny day or a sleeping cat is not a problem — but a line, waste or confusion can be an opportunity.</span></div>
          <div className="start-block">
            <h3>🔎 Choose ONE opportunity and investigate it</h3>
            <div className="g84-chips">{opps.map((s) => <button key={s.i} type="button" className={pick === s.i ? "on" : ""} onClick={() => setPick(s.i)}>{s.e} {s.t}</button>)}</div>
            {pick !== null && (
              <>
                <small className="g91-lbl">Who has this problem?</small>
                <div className="g84-chips">{WHO_P1.map((w) => <button key={w} type="button" className={who === w ? "on" : ""} onClick={() => setWho(w)}>{w}</button>)}</div>
                <small className="g91-lbl">How often does it happen?</small>
                <Tri value={freq} onPick={setFreq} opts={FREQ_P1} />
                <small className="g91-lbl">What could we create?</small>
                <input className="start-input" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="We could create…" />
                {freq === "year" && <p className="g91-note neg">Once a year? That's a small opportunity. Frequent problems are better.</p>}
              </>
            )}
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={pick === null || !who || !freq || countWords(idea) < 4} onClick={() => finish(coins, { right, scene: SCENE_P1[pick].t, who, freq, idea })}>Save my radar <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- THE CITY IS BROKEN ---------- */
const NEED_P1 = {
  lunch: ["Cheaper, healthy food she can count on", "A famous restaurant with a big screen and music every day", "A new phone"],
  recycle: ["An easy way to recycle at home", "A bigger trash can in the street that nobody needs to empty every week", "More bags"],
  bakery: ["To sell the food before it goes to waste", "To close the bakery and open a big supermarket in another city", "A new oven"],
  digital: ["Simple, safe help to pay digitally", "A very fast and complex app with many buttons and many functions", "More cash"],
  supplies: ["A way to get lost supplies back", "To buy all the supplies again every single week without complaining", "A bigger bag"],
};
function CityBroken({ onSave, onExit }) {
  const [who, setWho] = useState(null);
  const [need, setNeed] = useState(null);
  const [sol, setSol] = useState(null);
  const [tries, setTries] = useState(0);
  const [nOrder, setNOrder] = useState([0, 1, 2]);
  const [sOrder, setSOrder] = useState([0, 1, 2]);
  const [st, finish] = useFinish(onSave);
  const P = PROBLEMS93.find((x) => x.id === who);
  const S = P && sol !== null ? P.sols[sol] : null;
  const total = S ? S[1] + S[2] + S[3] : 0;
  const choose = (id) => { setWho(id); setNeed(null); setSol(null); setTries(0); setNOrder(shuffleArr([0, 1, 2])); setSOrder(shuffleArr([0, 1, 2])); };
  const coins = 16 + (total >= 13 ? 8 : total >= 10 ? 4 : 0) - Math.min(4, tries * 2) + 4;
  if (st.done) return <Reward title="The city is a bit less broken! 🏙️" subtitle={`${P.who}: ${S[0]} · ${total}/15 points`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Building2 size={22} strokeWidth={2.1} />} title="The City Is Broken 🏙️" subtitle="Five citizens have a problem. Choose one, understand what they need, and design a solution investors would score high." onExit={onExit}>
      <Brief91 k="c1_city" />
      <Steps91 labels={["1 · Meet a citizen", "2 · Find the need", "3 · Choose a solution"]} at={!who ? 0 : need === null ? 1 : 2} />
      <div className="g93-citizens">{PROBLEMS93.map((p) => <button key={p.id} type="button" className={who === p.id ? "on" : ""} onClick={() => choose(p.id)}><em>{p.e}</em><b>{p.who}</b><small>{p.place}</small></button>)}</div>
      {P && (
        <>
          <div className="g83-event"><em>{P.e}</em><div><b>{P.who} · {P.place}</b><span>“{P.prob}”</span></div></div>
          <PickOne key={`n-${who}`} tag="WHAT DOES THIS PERSON REALLY NEED?" q={`What does ${P.who.split(",")[0]} really need?`} options={NEED_P1[P.id]} correct={0} explain="Understand the need before you build anything." onRight={() => setNeed(0)} />
          {need !== null && (
            <div className="start-block">
              <h3>💡 Choose a solution</h3>
              <div className="quiz-options">{sOrder.map((k, pos) => <button key={k} type="button" className={`quiz-opt ${sol === k ? "correct" : ""}`} onClick={() => { if (sol !== null && sol !== k) setTries(tries + 1); setSol(k); }}><span className="opt-key">{"ABC"[pos]}</span><span className="opt-text">{P.sols[k][0]}</span></button>)}</div>
              {S && (
                <div className="g93-score">
                  <Bar91 label="🛠️ Useful" value={S[1] * 20} color="#16b074" suffix="" />
                  <Bar91 label="🎨 Creative" value={S[2] * 20} color="#f5b23e" suffix="" />
                  <Bar91 label="✅ Viable" value={S[3] * 20} color="#0b7a50" suffix="" />
                  <p className={`g91-note ${total >= 13 ? "pos" : "neg"}`}>Investor score: <b>{total}/15</b>. {total >= 13 ? "Useful, creative AND possible — great!" : S[3] <= 1 ? "Nice dream, but not viable with your resources." : S[1] <= 2 ? "It doesn't really solve the problem." : "OK… can you find a better one?"}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!S} onClick={() => finish(Math.max(10, coins), { who, sol: S[0], score: total, tries })}>Save my solution <span className="coin-tag"><Coins size={15} /> +{Math.max(10, coins)}</span></button></div>
    </ActShell>
  );
}

/* ---------- FOUNDER PAGE 11 · My Opportunity Map (fundas tu startup) ---------- */
function OpportunityMap({ resp, existing, onSave, onExit }) {
  const city = resp?.c1_city;
  const [prob, setProb] = useState(existing?.prob || city?.who || "");
  const P = PROBLEMS93.find((x) => x.id === prob);
  const [cust, setCust] = useState(existing?.customer || "");
  const [name, setName] = useState(existing?.name || "");
  const [logo, setLogo] = useState(existing?.logo || "");
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const G = [W_REASON];
  const ok = P && cust && name.trim().length >= 3 && logo && goalsOk(text, 15, 50, G);
  if (st.done) return <Reward title={`${logo} ${name} is born! 🚀`} subtitle="Founder Page 11 · your startup will grow every class." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<MapIcon size={22} strokeWidth={2.1} />} title="My Opportunity Map 🗺️" subtitle="Founder Page 11 · Found YOUR startup. This company will grow with you until the Business Fair." onExit={onExit}>
      <Brief91 k="c1_map" />
      <PBadge n="11" />
      <div className="start-block">
        <h3>1 · The problem I will solve</h3>
        <div className="g93-citizens">{PROBLEMS93.map((p) => <button key={p.id} type="button" className={prob === p.id ? "on" : ""} onClick={() => { setProb(p.id); setLogo(""); setCust(""); }}><em>{p.e}</em><b>{p.who}</b><small>{city?.who === p.id ? "⭐ your city choice" : p.place}</small></button>)}</div>
        {P && <p className="g91-note">“{P.prob}” → <b>{P.sols[0][0]}</b></p>}
      </div>
      {P && (
        <>
          <div className="start-block">
            <h3>2 · My first customers</h3>
            <div className="g84-chips">{[P.cust, ...WHO_P1.filter((w) => !P.cust.includes(w))].slice(0, 5).map((c) => <button key={c} type="button" className={cust === c ? "on" : ""} onClick={() => setCust(c)}>{c}</button>)}</div>
          </div>
          <div className="start-block">
            <h3>3 · Name and logo</h3>
            <input className="start-input p3-gap" value={name} maxLength={18} onChange={(e) => setName(e.target.value)} placeholder="Startup name (e.g. SaveBite, LunchUp…)" />
            <div className="g91-avatars">{[...P.logos, "🚀", "⭐", "🦉", "🌈"].map((l) => <button key={l} type="button" className={logo === l ? "on" : ""} onClick={() => setLogo(l)}>{l}</button>)}</div>
          </div>
          <div className="start-block">
            <h3>4 · Why does this opportunity matter?</h3>
            <WordField value={text} onChange={setText} min={15} max={50} rows={3} placeholder={`${name || "Our startup"} helps … because …`} goals={G} />
          </div>
          <div className="g93-map" id="g93-map">
            <header><em>{logo || "❔"}</em><div><small>🗺️ OPPORTUNITY MAP · FOUNDER PAGE 11</small><b>{name || "Startup name"}</b></div></header>
            <div className="g93-map-grid">
              <div><small>😣 PROBLEM</small><p>{P.prob}</p></div>
              <div><small>👥 WHO</small><p>{cust || "…"}</p></div>
              <div><small>📍 WHERE</small><p>{P.place}</p></div>
              <div><small>💡 SOLUTION</small><p>{P.sols[0][0]}</p></div>
              <div><small>📦 PRODUCT</small><p>{P.prod}</p></div>
              <div><small>💰 SEED CAPITAL</small><p>{cop(SEED93)} (same for every founder)</p></div>
            </div>
            {text && <p className="g93-map-say">“{text.trim()}”</p>}
          </div>
        </>
      )}
      <div className="start-foot"><button className="s1-btn ghost" disabled={!P} onClick={() => downloadPNG("g93-map", `Opportunity_${name || "map"}.png`)}><Download size={16} /> PNG</button><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30, { prob, customer: cust, name: name.trim(), logo, text })}>Found my startup 🚀 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 2 · WHY WOULD ANYONE BUY IT? — VALUE PROPOSITION LAB
   ===================================================================== */
const CUST_P2 = [["runners", "🏃 Runners"], ["kids", "🧒 Kids"], ["office", "💼 Office workers"], ["garden", "🌱 Gardeners"], ["travel", "🧳 Travelers"], ["artists", "🎨 Artists"]];
const NEEDS_P2 = [["carry", "carry only small things"], ["organize", "stay organized"], ["water", "water their plants"], ["sun", "protect themselves from the sun"], ["decorate", "decorate their space"], ["learn", "play and learn"]];
const OBJ_P2 = [
  { e: "🎒", n: "a tiny backpack", ok: [["runners", "carry"], ["travel", "carry"], ["kids", "organize"]] },
  { e: "🍾", n: "a bottle without a cap", ok: [["garden", "water"], ["artists", "decorate"], ["kids", "learn"]] },
  { e: "⌚", n: "a watch without a screen", ok: [["artists", "decorate"], ["kids", "learn"], ["office", "decorate"]] },
  { e: "📦", n: "a cardboard box", ok: [["kids", "learn"], ["office", "organize"], ["artists", "decorate"]] },
  { e: "✏️", n: "a very short pencil", ok: [["kids", "learn"], ["travel", "carry"], ["office", "organize"]] },
  { e: "☂️", n: "an old umbrella", ok: [["travel", "sun"], ["garden", "sun"], ["runners", "sun"]] },
];
function SellMeThis({ onSave, onExit }) {
  const [objs] = useState(() => shuffleArr(OBJ_P2).slice(0, 3));
  const [i, setI] = useState(0);
  const [cust, setCust] = useState("");
  const [need, setNeed] = useState("");
  const [pname, setPname] = useState("");
  const [done, setDone] = useState(null);
  const [log, setLog] = useState([]);
  const [left, reset] = useCountdown(45, done === null);
  const [st, finish] = useFinish(onSave);
  const O = objs[i];
  const good = (c, n) => O.ok.some(([a, b]) => a === c && b === n);
  const submit = () => { const g = good(cust, need); setDone(g); setLog([...log, { obj: O.n, cust, need, pname, good: g }]); };
  const next = () => { setI(i + 1); setCust(""); setNeed(""); setPname(""); setDone(null); reset(); };
  const pts = log.filter((x) => x.good).length;
  if (st.done) return <Reward title="You sold it! 🎤" subtitle={`${pts}/3 objects turned into products people need`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Mic size={22} strokeWidth={2.1} />} title="Sell Me This! 🎤" subtitle="Three boring objects, 45 seconds each. Don't change the object — find the customer who NEEDS it." onExit={onExit}>
      <Brief91 k="c2_sell" />
      <div className="g93-sell">
        <div className="g93-obj"><em>{O.e}</em><b>{O.n}</b><span>Object {i + 1}/3</span></div>
        <div className={`g93-timer ${left <= 10 ? "low" : ""}`}><b>{done === null ? left : "✓"}</b><small>seconds</small></div>
      </div>
      <div className="start-block">
        <small className="g91-lbl">Who needs it?</small>
        <div className="g84-chips">{CUST_P2.map(([k, l]) => <button key={k} type="button" disabled={done !== null || left === 0} className={cust === k ? "on" : ""} onClick={() => setCust(k)}>{l}</button>)}</div>
        <small className="g91-lbl">What do they need?</small>
        <div className="g84-chips">{NEEDS_P2.map(([k, l]) => <button key={k} type="button" disabled={done !== null || left === 0} className={need === k ? "on" : ""} onClick={() => setNeed(k)}>{l}</button>)}</div>
        <small className="g91-lbl">Give it a product name</small>
        <input className="start-input" disabled={done !== null} value={pname} onChange={(e) => setPname(e.target.value)} placeholder="e.g. RunMini, PlantDrop…" />
        {cust && need && <p className="g93-pitch">🎤 “Our <b>{pname || O.n}</b> helps <b>{CUST_P2.find(([k]) => k === cust)[1].slice(3).toLowerCase()}</b> who need to <b>{NEEDS_P2.find(([k]) => k === need)[1]}</b>.”</p>}
        {left === 0 && done === null && <p className="g91-note neg">⏰ Time! Submit what you have.</p>}
        {done !== null && <div className={`p1-banner ${done ? "good" : "bad"}`}><span>{done ? "✅ Investors like it: a real customer with a real need!" : `🤔 Hmm, that's hard to sell. Better: ${O.ok.map(([a, b]) => `${CUST_P2.find(([k]) => k === a)[1].slice(3)} → ${NEEDS_P2.find(([k]) => k === b)[1]}`).join(" · ")}.`}</span></div>}
      </div>
      <div className="start-foot">{done === null ? <button className="s1-btn primary big" disabled={!cust || !need || pname.trim().length < 2} onClick={submit}>Sell it! 🎤</button> : i < 2 ? <button className="s1-btn primary big" onClick={next}>Next object <ChevronRight size={18} /></button> : <button className="s1-btn primary big" onClick={() => finish(14 + pts * 4, { log, good: pts })}>Finish <span className="coin-tag"><Coins size={15} /> +{14 + pts * 4}</span></button>}</div>
    </ActShell>
  );
}

/* ---------- CUSTOMER VS. PRODUCT + sorpresas ---------- */
const CVP_P2 = [
  { c: "🎒 A busy student", p: "Healthy meal subscription" },
  { c: "🚴 A cyclist", p: "Waterproof backpack" },
  { c: "👴 An elderly person", p: "Simple digital payment service" },
  { c: "🏪 A small business owner", p: "Inventory management app" },
];
const SURP_P2 = [
  { e: "🎒", t: "The busy student says: “I wouldn't buy the meal subscription — $300,000 a month is too much for me.”", q: "How do you change the value proposition?", options: ["Offer a smaller plan: 3 healthy lunches a week at a student price", "Make the subscription more expensive and add a famous chef so it looks more exclusive", "Ignore the student", "Remove the healthy food"], correct: 0, explain: "Same benefit, adapted to the customer's budget." },
  { e: "👴", t: "The elderly person says: “I wouldn't use it — there are too many buttons and I'm afraid of scams.”", q: "How do you change it?", options: ["A version with 3 big buttons, a help line and anti-scam tips", "Add more functions and advertisements, so the app looks modern and powerful", "Tell him to ask his grandchildren", "Close the app"], correct: 0, explain: "Listen to the complaint — it shows you what to improve." },
];
function CustomerMatch({ onSave, onExit }) {
  const [order] = useState(() => shuffleArr(CVP_P2.map((_, k) => k)));
  const [sel, setSel] = useState(null);
  const [pairs, setPairs] = useState({});
  const [checked, setChecked] = useState(false);
  const [surp, setSurp] = useState({});
  const [st, finish] = useFinish(onSave);
  const right = CVP_P2.filter((x, k) => pairs[k] === k).length;
  const nS = Object.keys(surp).length;
  if (st.done) return <Reward title="Customers understood! 🤝" subtitle={`${right}/4 matches · ${nS}/2 proposals fixed`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Users size={22} strokeWidth={2.1} />} title="Customer vs. Product 🤝" subtitle="Match each customer with the product made for them — then listen when they say “I wouldn't buy that.”" onExit={onExit}>
      <Brief91 k="c2_match" />
      <div className="g92-match">
        <div className="g92-clients">{CVP_P2.map((x, k) => { const bad = checked && pairs[k] !== k; return <button key={k} type="button" className={`${sel === k ? "on" : ""} ${checked ? (bad ? "no" : "ok") : ""}`} onClick={() => setSel(k)}><em>{x.c.split(" ")[0]}</em><span>{x.c.slice(x.c.indexOf(" ") + 1)}</span><b>{pairs[k] != null ? CVP_P2[pairs[k]].p : "Choose a product…"}</b></button>; })}</div>
        <div className="g92-products">{order.map((k) => <button key={k} type="button" disabled={sel === null} onClick={() => { setPairs({ ...pairs, [sel]: k }); setChecked(false); setSel(null); }}>{CVP_P2[k].p}</button>)}</div>
      </div>
      {!(checked && right === 4) ? <div className="start-foot"><button className="s1-btn primary big" disabled={Object.keys(pairs).length < 4} onClick={() => setChecked(true)}>{checked ? `Check again (${right}/4)` : "Check"} <Check size={17} /></button></div> : (
        <>
          {SURP_P2.map((s, k) => <div key={k}><div className="g83-event"><em>{s.e}</em><div><b>Surprise {k + 1}: “I wouldn't buy that!”</b><span>{s.t}</span></div></div><PickOne q={s.q} options={s.options} correct={s.correct} explain={s.explain} onRight={(w) => setSurp((o) => ({ ...o, [k]: w }))} /></div>)}
          <div className="start-foot"><button className="s1-btn primary big" disabled={nS < 2} onClick={() => finish(18 + Object.values(surp).filter((w) => w === 0).length * 3, { right, surprises: surp })}>Finish <span className="coin-tag"><Coins size={15} /> +{18 + Object.values(surp).filter((w) => w === 0).length * 3}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- FOUNDER PAGE 12 · Value Proposition Surgery + My Card ---------- */
const SURG_P2 = [
  { k: "Customer problem", bad: "everyone needs shoes", opts: ["school runners get painful blisters", "people in the world have feet and walk to many different places", "shoes"] },
  { k: "Product solution", bad: "we sell shoes", opts: ["light running shoes with soft insoles", "we sell many different products because a big catalog is always better", "socks"] },
  { k: "Main benefit", bad: "shoes are good", opts: ["they protect your feet in every race", "they are the best shoes in the universe and every famous person wants them", "good"] },
  { k: "Why is it different?", bad: "(nothing)", opts: ["unlike cheap sneakers, they last a whole year", "we have the most beautiful store and the biggest logo in the shopping mall", "blue"] },
];
const BEN_P2 = ["saves time", "saves money", "is healthier", "is safer", "is easier", "helps the planet"];
const ALT_P2 = ["doing nothing", "buying at big stores", "paying a lot more", "doing it alone", "wasting it"];
function VPSurgery({ resp, existing, onSave, onExit }) {
  const S = sampleOr93(resp);
  const [stage, setStage] = useState(0);
  const [fix, setFix] = useState({});
  const [orders] = useState(() => SURG_P2.map((s) => shuffleArr(s.opts.map((_, k) => k))));
  const [ben, setBen] = useState(existing?.benefit || "");
  const [alt, setAlt] = useState(existing?.alt || "");
  const [diff, setDiff] = useState(existing?.diff || "");
  const [st, finish] = useFinish(onSave);
  const fixed = SURG_P2.every((s, i) => fix[i] === 0);
  const vp = `For ${lowFirst(S.customer || S.P.cust)} who face this problem — ${lowFirst(S.P.prob).replace(/\.$/, "")} — our ${lowFirst(S.P.prod)} ${ben || "…"}. Unlike ${alt || "…"}, we ${lowFirst(diff.trim().replace(/\.$/, "")) || "…"}.`;
  if (st.done) return <Reward title="Value proposition ready! 💎" subtitle="Founder Page 12 saved." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Sparkles size={22} strokeWidth={2.1} />} title="Value Proposition Surgery 💎" subtitle="Founder Page 12 · Operate a terrible proposition — then write the one for YOUR startup." onExit={onExit}>
      <Brief91 k="c2_surgery" />
      <PBadge n="12" />
      <NeedStartup resp={resp} />
      <Steps91 labels={["1 · The surgery", "2 · My value proposition card"]} at={stage} />
      {stage === 0 && (
        <>
          <div className="g93-patient">🩺 PATIENT: “We sell shoes because shoes are good and everyone needs shoes.”</div>
          {SURG_P2.map((s, i) => (
            <div key={s.k} className={`start-block ${fix[i] === 0 ? "ok" : fix[i] != null ? "no" : ""}`}>
              <small className="g91-lbl">{i + 1} · {s.k} <s>{s.bad}</s></small>
              <div className="g92-opts">{orders[i].map((k) => <button key={k} type="button" disabled={fix[i] === 0} className={fix[i] === k ? (k === 0 ? "ok" : "no") : ""} onClick={() => setFix({ ...fix, [i]: k })}>{s.opts[k]}</button>)}</div>
            </div>
          ))}
          {fixed && <div className="p1-banner good"><span>💚 Surgery successful: “For school runners who get painful blisters, our light running shoes with soft insoles protect your feet in every race. Unlike cheap sneakers, they last a whole year.”</span></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!fixed} onClick={() => setStage(1)}>Now: MY value proposition <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 1 && (
        <>
          <div className="start-block">
            <small className="g91-lbl">Main benefit · our {S.P.prod.toLowerCase()}…</small>
            <div className="g84-chips">{BEN_P2.map((b) => <button key={b} type="button" className={ben === b ? "on" : ""} onClick={() => setBen(b)}>{b}</button>)}</div>
            <small className="g91-lbl">Unlike… (what customers do today)</small>
            <div className="g84-chips">{ALT_P2.map((b) => <button key={b} type="button" className={alt === b ? "on" : ""} onClick={() => setAlt(b)}>{b}</button>)}</div>
            <small className="g91-lbl">…we (your difference)</small>
            <input className="start-input" value={diff} onChange={(e) => setDiff(e.target.value)} placeholder="deliver it in 10 minutes / use recycled packaging / …" />
          </div>
          <div className="g93-vp" id="g93-vp">
            <header><em>{S.logo}</em><div><small>💎 VALUE PROPOSITION CARD · FOUNDER PAGE 12</small><b>{S.name}</b></div></header>
            <p>{vp}</p>
          </div>
          <div className="start-foot"><button className="s1-btn ghost" onClick={() => downloadPNG("g93-vp", "Value_Proposition.png")}><Download size={16} /> PNG</button><button className="s1-btn primary big" disabled={!ben || !alt || countWords(diff) < 3} onClick={() => finish(28, { benefit: ben, alt, diff: diff.trim(), vp, sample: !!S.sample })}>Save Founder Page 12 <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   CLASE 3 · BUSINESS MODEL CANVAS — BUILD YOUR EMPIRE
   ===================================================================== */
const BLOCKS93 = [["part", "🔗", "Key Partnerships"], ["act", "⚙️", "Key Activities"], ["res", "🧰", "Key Resources"], ["vp", "💎", "Value Propositions"], ["rel", "🤝", "Customer Relationships"], ["ch", "📣", "Channels"], ["seg", "👥", "Customer Segments"], ["cost", "🧾", "Cost Structure"], ["rev", "💰", "Revenue Streams"]];
function CanvasBoard({ fill, sel, onBlock, bad }) {
  return (
    <div className="g93-canvas">
      {BLOCKS93.map(([k, e, l]) => <button key={k} type="button" className={`b-${k} ${sel ? "pick" : ""} ${bad?.includes(k) ? "no" : ""} ${fill[k] ? "full" : ""}`} onClick={() => onBlock && onBlock(k)}><small>{e} {l}</small>{fill[k] ? (Array.isArray(fill[k]) ? fill[k].map((t) => <p key={t}>{t}</p>) : <p>{fill[k]}</p>) : <i>…</i>}</button>)}
    </div>
  );
}
const PUZZLE_P3 = [
  ["seg", "Students and office workers who live nearby"], ["vp", "Good coffee + fast Wi-Fi + a quiet place to study"], ["ch", "The café on the corner + Instagram"],
  ["rel", "Loyalty card: the 10th coffee is free"], ["rev", "Sales of drinks and snacks"], ["res", "Coffee machine, baristas and the place"],
  ["act", "Making drinks, cleaning, buying beans"], ["part", "Local coffee farmers + a bakery supplier"], ["cost", "Rent, salaries, coffee beans, electricity"],
];
function CanvasPuzzle({ onSave, onExit }) {
  const [order] = useState(() => shuffleArr(PUZZLE_P3.map((_, k) => k)));
  const [sel, setSel] = useState(null);
  const [place, setPlace] = useState({});
  const [checked, setChecked] = useState(false);
  const [errs, setErrs] = useState(0);
  const [st, finish] = useFinish(onSave);
  const fill = {}; Object.entries(place).forEach(([b, k]) => { fill[b] = PUZZLE_P3[k][1]; });
  const bad = checked ? Object.entries(place).filter(([b, k]) => PUZZLE_P3[k][0] !== b).map(([b]) => b) : [];
  const done = Object.keys(place).length === 9 && checked && bad.length === 0;
  const putIn = (b) => { if (sel === null) return; const n = { ...place }; Object.keys(n).forEach((x) => { if (n[x] === sel) delete n[x]; }); n[b] = sel; setPlace(n); setSel(null); setChecked(false); };
  if (st.done) return <Reward title="Puzzle solved! 🧩" subtitle="Café Luna's business model is complete." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Puzzle size={22} strokeWidth={2.1} />} title="Business Model Puzzle ☕" subtitle="Café Luna's canvas fell on the floor. Put each piece in the right block." onExit={onExit}>
      <Brief91 k="c3_puzzle" />
      <HowTo>Tap a <b>piece</b>, then tap the <b>block</b> where it belongs. When all 9 are placed, press <b>Check</b>.</HowTo>
      <div className="g93-pieces">{order.filter((k) => !Object.values(place).includes(k)).map((k) => <button key={k} type="button" className={sel === k ? "on" : ""} onClick={() => setSel(k)}>{PUZZLE_P3[k][1]}</button>)}{Object.keys(place).length === 9 && <span className="g91-note">All pieces placed!</span>}</div>
      <CanvasBoard fill={fill} sel={sel !== null} onBlock={putIn} bad={bad} />
      {checked && bad.length > 0 && <p className="g91-note neg">{bad.length} piece(s) in the wrong block (red). Press “Take the red pieces back” and try again.</p>}
      <div className="start-foot">
        {checked && bad.length > 0 && <button className="s1-btn ghost" onClick={() => { const n = { ...place }; bad.forEach((b) => delete n[b]); setPlace(n); setChecked(false); }}>Take the red pieces back</button>}
        {!done ? <button className="s1-btn primary big" disabled={Object.keys(place).length < 9} onClick={() => { setChecked(true); if (Object.entries(place).some(([b, k]) => PUZZLE_P3[k][0] !== b)) setErrs(errs + 1); }}>Check <Check size={17} /></button> : <button className="s1-btn primary big" onClick={() => finish(Math.max(12, 24 - errs * 3), { errors: errs })}>Finish <span className="coin-tag"><Coins size={15} /> +{Math.max(12, 24 - errs * 3)}</span></button>}
      </div>
    </ActShell>
  );
}

/* ---------- FOUNDER PAGE 13 · STARTUP ARCHITECT (mi canvas, con consecuencias) ---------- */
const ARCH_P3 = {
  seg2: { l: "👥 A second customer segment", o: [["Schools or companies (B2B)", 0, 0, 0.1], ["Tourists and visitors", 0, 0, 0.05], ["Only my first customers, for now", 0, 0, 0]] },
  ch: { l: "📣 Channel", o: [["Instagram + WhatsApp", 0, 0, 0], ["Our own app", 800000, 0, 0.08], ["A physical stand", 500000, 0, 0.06], ["Home delivery with riders", 900000, 0, 0.12]] },
  rel: { l: "🤝 Customer relationship", o: [["Self-service", 0, 0, 0], ["Personal help (one assistant)", 400000, 0, 0.05], ["Loyalty points (every 10th is free)", 0, 300, 0.07]] },
  rev: { l: "💰 Revenue stream", o: [["Pay per product", 0, 0, 0], ["Monthly subscription", 0, 0, 0.05], ["Commission per sale", 0, 0, 0]] },
  res: { l: "🧰 Extra key resource", o: [["A small kitchen / workshop", 300000, 0, 0], ["Just a laptop + a phone", 0, 0, 0], ["A van", 600000, 0, 0.04]] },
  part: { l: "🔗 Key partner", o: [["Local suppliers (cheaper materials)", 0, -500, 0], ["A school or community partner", 0, 0, 0.1], ["A delivery app (takes 20% per order)", 0, 1500, 0.1]] },
};
const ACTS_P3 = ["Producing the product", "Talking to customers", "Buying materials", "Posting on social media", "Delivering orders", "Checking the numbers"];
function CanvasArchitect({ resp, existing, onSave, onExit }) {
  const S = sampleOr93(resp);
  const vp = resp?.c2_surgery;
  const [ch, setCh] = useState(existing?.choices || {});
  const [acts, setActs] = useState(existing?.acts || []);
  const [toast, setToast] = useState(null);
  const [st, finish] = useFinish(onSave);
  const pick = (k, i) => { setCh({ ...ch, [k]: i }); const o = ARCH_P3[k].o[i]; if (o[1] > 0) setToast(`${o[0]} → +${cop(o[1])} per month in your Cost Structure. Check your prices in Class 4!`); else if (o[2] > 0) setToast(`${o[0]} → each product now costs ${cop(o[2])} more.`); else if (o[2] < 0) setToast(`${o[0]} → each product costs ${cop(-o[2])} less. 💚`); else setToast(null); };
  const all = Object.keys(ARCH_P3).every((k) => ch[k] != null) && acts.length >= 2;
  const extraFixed = Object.entries(ch).reduce((a, [k, i]) => a + ARCH_P3[k].o[i][1], 0);
  const extraUnit = Object.entries(ch).reduce((a, [k, i]) => a + ARCH_P3[k].o[i][2], 0);
  const boost = +Object.entries(ch).reduce((a, [k, i]) => a + ARCH_P3[k].o[i][3], 0).toFixed(2);
  const uc = unitCost93(S.P) + extraUnit;
  const O = (k) => (ch[k] != null ? ARCH_P3[k].o[ch[k]][0] : null);
  const fill = {
    seg: [S.customer || S.P.cust, O("seg2")].filter(Boolean), vp: vp ? `Our ${S.P.prod.toLowerCase()} ${vp.benefit}` : S.P.sols[0][0], ch: O("ch"), rel: O("rel"), rev: O("rev"),
    res: [S.P.prod === "Digital skills class" ? "A teacher + materials" : "Materials + people", O("res"), ch.ch === 3 ? "🛵 Riders" : null].filter(Boolean), act: acts, part: O("part"),
    cost: [`Fixed: ${cop(S.P.fixed + extraFixed)}/month`, `Per product: ${cop(uc)}`],
  };
  if (st.done) return <Reward title="Empire designed! 🧩" subtitle={`Fixed costs ${cop(S.P.fixed + extraFixed)}/month · unit cost ${cop(uc)}`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Layers size={22} strokeWidth={2.1} />} title={`Startup Architect · ${S.logo} ${S.name} 🧩`} subtitle="Founder Page 13 · Build YOUR canvas. Every decision has consequences — watch the Cost Structure." onExit={onExit}>
      <Brief91 k="c3_architect" />
      <PBadge n="13" />
      <NeedStartup resp={resp} />
      <div className="g93-arch">
        <div className="g93-arch-ctl">
          {Object.entries(ARCH_P3).map(([k, b]) => (
            <div key={k} className="start-block">
              <small className="g91-lbl">{b.l}</small>
              <div className="g92-opts">{b.o.map((o, i) => <button key={o[0]} type="button" className={ch[k] === i ? "ok" : ""} onClick={() => pick(k, i)}>{o[0]}{o[1] > 0 ? ` · +${cop(o[1])}/mo` : ""}{o[2] ? ` · ${o[2] > 0 ? "+" : "−"}${cop(Math.abs(o[2]))}/unit` : ""}</button>)}</div>
            </div>
          ))}
          <div className="start-block"><small className="g91-lbl">⚙️ Key activities (choose 2–3)</small><div className="g84-chips">{ACTS_P3.map((a) => <button key={a} type="button" className={acts.includes(a) ? "on" : ""} onClick={() => setActs(acts.includes(a) ? acts.filter((x) => x !== a) : acts.length < 3 ? [...acts, a] : acts)}>{a}</button>)}</div></div>
        </div>
        <div className="g93-arch-board">
          {toast && <div className="g93-toast">⚡ {toast}</div>}
          <CanvasBoard fill={fill} />
          <div className="g91-mini"><span>🧾 Fixed costs <b>{cop(S.P.fixed + extraFixed)}</b></span><span>📦 Unit cost <b>{cop(uc)}</b></span><span className="pos">👥 Demand boost <b>+{Math.round(boost * 100)}%</b></span></div>
        </div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!all} onClick={() => finish(30, { choices: ch, acts, extraFixed, extraUnit, boost, fill })}>Save Founder Page 13 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---------- THE UNEXPECTED INVESTOR ---------- */
const COND_P3 = [
  { k: "cost", e: "✂️", t: "“I will invest, but you must REDUCE your costs.”", o: [["Share a space with another small business", -300000, 0, 1], ["Use free social media instead of paid tools", -200000, 0, 1], ["Stop paying the suppliers on time so we keep more money in the bank account", -400000, 0, 0]] },
  { k: "cust", e: "👥", t: "“I will invest, but you need MORE customers.”", o: [["Partner with a school or a community group", 0, 0.12, 1], ["Add a WhatsApp catalog with weekly offers", 0, 0.08, 1], ["Lower the quality of everything so we can sell much cheaper than anybody else", 0, 0.05, 0]] },
  { k: "green", e: "🌱", t: "“I will invest, but your business must be SUSTAINABLE.”", o: [["Use recycled or reusable packaging", 0, 0.03, 1], ["Buy from local suppliers to reduce transport", 0, 0.02, 1], ["Write “eco” and draw green leaves on the logo, without changing anything in the business", 0, 0, 0]] },
  { k: "rev", e: "💰", t: "“I will invest, but you need ANOTHER revenue stream.”", o: [["Offer workshops or a premium version", 0, 0.06, 1], ["Sell gift cards for special dates", 0, 0.04, 1], ["Sell your customers' personal data to other companies without telling them", 0, 0, 0]] },
];
function UnexpectedInvestor({ resp, onSave, onExit }) {
  const S = sampleOr93(resp);
  const [ci] = useState(() => Math.floor(Math.random() * COND_P3.length));
  const C = COND_P3[ci];
  const [pick, setPick] = useState(null);
  const [wrong, setWrong] = useState([]);
  const [order] = useState(() => shuffleArr([0, 1, 2]));
  const [why, setWhy] = useState("");
  const [st, finish] = useFinish(onSave);
  const O = pick !== null ? C.o[pick] : null;
  const choose = (k) => { if (C.o[k][3]) setPick(k); else setWrong([...wrong, k]); };
  if (st.done) return <Reward title="Deal on the table! 🤝" subtitle={`${C.e} ${O[0]}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Briefcase size={22} strokeWidth={2.1} />} title="The Unexpected Investor 💼" subtitle={`An investor likes ${S.name}… but has ONE condition. Change your canvas without destroying the model.`} onExit={onExit}>
      <Brief91 k="c3_investor" />
      <div className="g93-investor"><em>🧑‍💼</em><div><small>INVESTOR · INCOMING CALL</small><b>{C.t}</b></div></div>
      <div className="quiz-options">{order.map((k, pos) => <button key={k} type="button" disabled={pick !== null || wrong.includes(k)} className={`quiz-opt ${pick === k ? "correct" : ""} ${wrong.includes(k) ? "wrong" : ""}`} onClick={() => choose(k)}><span className="opt-key">{"ABC"[pos]}</span><span className="opt-text">{C.o[k][0]}</span></button>)}</div>
      {wrong.length > 0 && pick === null && <div className="p1-hint">🚫 The investor says: “That's not ethical — or it doesn't really change anything. Try again.”</div>}
      {O && (
        <>
          <div className="p1-banner good"><span>✅ The investor nods. {O[1] ? `Fixed costs: ${cop(O[1])} per month.` : ""} {O[2] ? `More demand: +${Math.round(O[2] * 100)}%.` : ""} Your canvas is updated.</span></div>
          <div className="start-block"><h3>✍️ Tell the investor which block changed and why</h3><WordField value={why} onChange={setWhy} min={10} max={40} rows={2} placeholder="We changed our … block because …" goals={[W_REASON]} /></div>
        </>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!O || !goalsOk(why, 10, 40, [W_REASON])} onClick={() => finish(20 - Math.min(6, wrong.length * 3) + 4, { cond: C.k, change: O[0], fixedDelta: O[1], boost: O[2], why })}>Send to the investor <span className="coin-tag"><Coins size={15} /> +{24 - Math.min(6, wrong.length * 3)}</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 4 · THE PRICE WAR ON 10TH STREET
   ===================================================================== */
const COST_P4 = [["Materials", 5000], ["Labor", 2000], ["Packaging", 1000], ["Other costs", 1000]];
const SEGS_P4 = [
  { e: "🎓", n: "Budget students", d: "“I have little money, but I want something good.”", lo: 10800, hi: 12500 },
  { e: "💼", n: "Busy workers", d: "“I pay a bit more if it's fast and reliable.”", lo: 12000, hi: 15000 },
  { e: "💎", n: "Quality lovers", d: "“I prefer quality, not the lowest price.”", lo: 15000, hi: 20000 },
  { e: "🏷️", n: "Bargain hunters", d: "“I never pay more than $10,000.”", lo: 0, hi: 10000, notUs: true },
];
function PricingMachine({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [tc, setTc] = useState("");
  const [tcOk, setTcOk] = useState(null);
  const [mk, setMk] = useState(50);
  const [si, setSi] = useState(0);
  const [pr, setPr] = useState(13000);
  const [res, setRes] = useState({});
  const [msg, setMsg] = useState(null);
  const [st, finish] = useFinish(onSave);
  const price = Math.round(9000 * (1 + mk / 100) / 100) * 100;
  const G = SEGS_P4[si];
  const show = () => {
    const marg = (pr - 9000) / pr;
    let t, ok = false;
    if (pr > G.hi) t = "😤 “Too expensive!”"; else if (pr < G.lo && !G.notUs) t = marg < 0.2 ? "🤔 “Why is it so cheap?” — and your margin is under 20%." : "🤔 “Why is this product so cheap? Is it good?”"; else if (marg < 0.2) t = "😀 They love it… but your margin is under 20%. You lose money with fixed costs."; else { t = "😀 “This is a good price!” ✅"; ok = true; }
    setMsg({ ok, t });
    if (ok) setRes({ ...res, [si]: pr });
  };
  const notUs = () => { if (G.notUs) { setRes({ ...res, [si]: "not" }); setMsg({ ok: true, t: "✅ Smart! With a $9,000 cost, you can't sell at $10,000 and survive. Not every customer is YOUR customer." }); } else setMsg({ ok: false, t: "❌ This segment can pay a price that works for you. Find it!" }); };
  const nOk = Object.keys(res).length;
  if (st.done) return <Reward title="Pricing machine mastered! 🏷️" subtitle={`${nOk}/4 customer types solved`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Calculator size={22} strokeWidth={2.1} />} title="The Pricing Machine 🏷️" subtitle="Build the cost, choose a margin — then face 4 different customers watching your price." onExit={onExit}>
      <Brief91 k="c4_machine" />
      <Steps91 labels={["1 · Build the cost", "2 · Choose a margin", "3 · The customer is watching"]} at={stage} />
      {stage === 0 && (
        <div className="start-block">
          <h3>🧾 A handmade notebook — what does ONE cost?</h3>
          <div className="g92-impact">{COST_P4.map(([l, v]) => <p key={l}><b>{l}</b><span>{cop(v)}</span></p>)}</div>
          <MoneyInput value={tc} onChange={(v) => { setTc(v); setTcOk(null); }} />
          <div className="p3-card-actions"><button className="s1-btn primary" disabled={!tc} onClick={() => setTcOk(num(tc) === 9000)}>Check</button></div>
          {tcOk === false && <div className="p1-hint">💡 Add the four costs.</div>}
          {tcOk && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(1)}>✅ $9,000 — choose a margin <ChevronRight size={18} /></button></div>}
        </div>
      )}
      {stage === 1 && (
        <div className="start-block">
          <Ctl l="📈 Markup over cost" v={mk} set={setMk} mn={0} mx={150} stp={10} fmt={(v) => `${v}%`} />
          <div className="g84-results g91-results"><div><small>COST</small><b>{cop(9000)}</b></div><div><small>PRICE</small><b>{cop(price)}</b></div><div><small>PROFIT / UNIT</small><b>{cop(price - 9000)}</b></div><div><small>MARGIN</small><b>{Math.round(((price - 9000) / price) * 100)}%</b></div></div>
          <p className="start-tip">💡 Markup is calculated on the cost; margin is calculated on the price. 50% markup → 33% margin.</p>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => { setPr(price); setStage(2); }}>Open the store <ChevronRight size={18} /></button></div>
        </div>
      )}
      {stage === 2 && (
        <div className="start-block">
          <div className="g93-segs">{SEGS_P4.map((s, k) => <span key={s.n} className={`${k === si ? "on" : ""} ${res[k] != null ? "done" : ""}`}>{s.e} {s.n}</span>)}</div>
          <div className="g93-customer"><em>{G.e}</em><div><b>{G.n}</b><span>{G.d}</span></div></div>
          <Ctl l="🏷️ My price for them" v={pr} set={(v) => { setPr(v); setMsg(null); }} mn={8000} mx={22000} stp={500} fmt={cop} />
          <div className="p3-card-actions"><button className="s1-btn primary" disabled={res[si] != null} onClick={show}>Show the price 👀</button><button className="s1-btn ghost" disabled={res[si] != null} onClick={notUs}>🙅 This segment is not for us</button></div>
          {msg && <div className={`p1-banner ${msg.ok ? "good" : "bad"}`}><span>{msg.t}</span></div>}
          <div className="start-foot">{res[si] != null && si < 3 && <button className="s1-btn primary big" onClick={() => { setSi(si + 1); setMsg(null); }}>Next customer <ChevronRight size={18} /></button>}{nOk === 4 && <button className="s1-btn primary big" onClick={() => finish(26, { markup: mk, prices: res })}>Finish <span className="coin-tag"><Coins size={15} /> +26</span></button>}</div>
        </div>
      )}
    </ActShell>
  );
}

/* ---------- THE PRICE WAR (simulación competitiva) ---------- */
const SHOPS_P4 = [{ id: "you", e: "🍔", n: "Street Burger (YOU)", c: 7000, q: 1 }, { id: "house", e: "🏠", n: "Burger House", c: 8000, q: 1 }, { id: "fast", e: "⚡", n: "Fast Burger", c: 9000, q: 1.15 }];
const dayWar = (p) => { const a = SHOPS_P4.map((s) => { let v = s.q / Math.pow(p[s.id] / 1000, 3); if (p[s.id] < 9000) v *= 0.75; return v; }); const avg = (p.you + p.house + p.fast) / 3; const total = Math.round(300 * (avg > 18000 ? 0.8 : 1)); const sum = a.reduce((x, y) => x + y, 0); return SHOPS_P4.map((s, i) => { const u = Math.round((total * a[i]) / sum); return { id: s.id, u, profit: u * (p[s.id] - s.c) }; }); };
function PriceWar({ onSave, onExit }) {
  const [day, setDay] = useState(0);
  const [my, setMy] = useState(12000);
  const [riv, setRiv] = useState({ house: 14000, fast: 15500 });
  const [hist, setHist] = useState([]);
  const [st, finish] = useFinish(onSave);
  const tot = (id, k) => hist.reduce((a, d) => a + d.r.find((x) => x.id === id)[k], 0);
  const play = () => {
    const p = { you: my, ...riv }; const r = dayWar(p);
    const msg = my < 9000 ? "🤔 “Why so cheap? Is it real meat?”" : my > 17000 ? "😤 “Too expensive! I'm going to Burger House.”" : my <= 12000 ? "😀 “Good price!”" : "🙂 “Fair price for a good burger.”";
    setHist([...hist, { day: day + 1, p, r, msg }]);
    const nh = my < riv.house - 1500 ? Math.max(10000, riv.house - 1000) : my > riv.house + 1500 ? riv.house + 500 : riv.house;
    const nf = my < riv.fast - 3000 ? Math.max(11500, riv.fast - 1000) : riv.fast;
    setRiv({ house: nh, fast: nf }); setDay(day + 1);
  };
  const ranking = SHOPS_P4.map((s) => ({ ...s, profit: tot(s.id, "profit"), units: tot(s.id, "u") })).sort((a, b) => b.profit - a.profit);
  const myRank = ranking.findIndex((s) => s.id === "you") + 1;
  const salesRank = [...ranking].sort((a, b) => b.units - a.units).findIndex((s) => s.id === "you") + 1;
  const last = hist[hist.length - 1];
  if (st.done) return <Reward title={myRank === 1 ? "Price War champion! 🏆" : "War over! 🍔"} subtitle={`Profit ${cop(tot("you", "profit"))} · rank #${myRank}`} coins={st.coins} saving={st.saving} onExit={onExit} gold={myRank === 1} />;
  return (
    <ActShell icon={<Swords size={22} strokeWidth={2.1} />} title="The Price War on 10th Street 🍔" subtitle="You run Street Burger (cost $7,000). 5 days, 300 customers a day. Goal: the MOST PROFIT — not the most sales." onExit={onExit}>
      <Brief91 k="c4_war" />
      <div className="g93-street">{SHOPS_P4.map((s) => <div key={s.id} className={s.id === "you" ? "me" : ""}><em>{s.e}</em><b>{s.n}</b><span>cost {cop(s.c)}{s.q > 1 ? " · premium quality" : ""}</span><strong>{cop(s.id === "you" ? my : riv[s.id])}</strong></div>)}</div>
      {day < 5 ? (
        <div className="start-block">
          <h3>📅 Day {day + 1}/5 · set your price</h3>
          <Ctl l="🍔 My price" v={my} set={setMy} mn={7500} mx={20000} stp={500} fmt={cop} />
          <p className="g91-note">Profit per burger: {cop(my - 7000)}</p>
          <div className="p3-card-actions"><button className="s1-btn primary" onClick={play}><Play size={16} /> Open the shops</button></div>
        </div>
      ) : (
        <div className="p1-banner good"><span>🏁 War over! You were #{myRank} in PROFIT and #{salesRank} in SALES. {salesRank < myRank ? "More sales did NOT mean more profit!" : myRank === 1 ? "You found the balance between price and customers." : "Next time, look at the margin AND the number of customers."}</span></div>
      )}
      {last && (
        <div className="start-block">
          <h3>📊 Day {last.day} results</h3>
          <div className="g93-war">{last.r.map((x) => { const s = SHOPS_P4.find((y) => y.id === x.id); return <div key={x.id} className={x.id === "you" ? "me" : ""}><span>{s.e} {s.n}</span><i style={{ width: `${(x.u / 300) * 100}%` }} /><b>{x.u} burgers · {cop(x.profit)}</b></div>; })}</div>
          <div className="g93-customer small"><em>🗣️</em><div><b>A customer says:</b><span>{last.msg}</span></div></div>
          {(last.p.house !== riv.house || last.p.fast !== riv.fast) && day < 5 && <p className="g91-note neg">⚠️ Your rivals reacted: Burger House {cop(riv.house)} · Fast Burger {cop(riv.fast)}.</p>}
        </div>
      )}
      {hist.length > 0 && <div className="g92-bench">{ranking.map((s, i) => <div key={s.id} className={s.id === "you" ? "me" : ""}><span>#{i + 1} {s.e} {s.n}</span><b>{cop(s.profit)} · {s.units} sold</b></div>)}</div>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={day < 5} onClick={() => finish(20 + (myRank === 1 ? 10 : myRank === 2 ? 5 : 0), { profit: tot("you", "profit"), units: tot("you", "u"), rank: myRank, salesRank, prices: hist.map((h) => h.p.you) })}>Finish the war <span className="coin-tag"><Coins size={15} /> +{20 + (myRank === 1 ? 10 : myRank === 2 ? 5 : 0)}</span></button></div>
    </ActShell>
  );
}

/* ---------- FOUNDER PAGE 14 · My Pricing Strategy ---------- */
const STRAT_P4 = [["premium", "💎 Premium: high quality, higher price"], ["fair", "⚖️ Fair value: good quality, fair price"], ["low", "🏷️ Low cost: simple product, low price"]];
function MyPricing({ resp, existing, onSave, onExit }) {
  const S = sampleOr93(resp);
  const a = resp?.c3_architect, iv = resp?.c3_investor;
  const cost = unitCost93(S.P) + (a?.extraUnit || 0);
  const fixed = S.P.fixed + (a?.extraFixed || 0) + (iv?.fixedDelta || 0);
  const boost = (a?.boost || 0) + (iv?.boost || 0);
  const [price, setPrice] = useState(existing?.price || Math.round((cost * 1.5) / 500) * 500);
  const [strat, setStrat] = useState(existing?.strategy || "");
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const sales = Math.round(demand93(S.P, price) * (1 + boost));
  const margin = price - cost;
  const profit = sales * margin - fixed;
  const be = margin > 0 ? Math.ceil(fixed / margin) : Infinity;
  const mPct = Math.round((margin / price) * 100);
  const grid = Array.from({ length: 9 }, (_, i) => Math.round((cost * (1.1 + i * 0.18)) / 500) * 500);
  const curve = grid.map((g) => Math.round(demand93(S.P, g) * (1 + boost)) * (g - cost) - fixed);
  const G = [W_REASON, W_NUMBERS(2)];
  const ok = profit > 0 && mPct >= 20 && strat && goalsOk(text, 20, 60, G);
  if (st.done) return <Reward title="Price set! 🏷️" subtitle={`${cop(price)} · ${sales} customers/month · profit ${cop(profit)}`} coins={st.coins} saving={st.saving} onExit={onExit} gold={profit > 0} />;
  return (
    <ActShell icon={<Calculator size={22} strokeWidth={2.1} />} title={`My Pricing Strategy · ${S.logo} ${S.name} 🏷️`} subtitle="Founder Page 14 · Your real costs (with your canvas decisions), your price, your profit." onExit={onExit}>
      <Brief91 k="c4_mine" />
      <PBadge n="14" />
      <NeedStartup resp={resp} />
      <div className="g92-impact">{S.P.costs.map(([l, v]) => <p key={l}><b>{l}</b><span>{cop(v)}</span></p>)}{a?.extraUnit ? <p><b>Canvas decisions</b><span>{a.extraUnit > 0 ? "+" : "−"}{cop(Math.abs(a.extraUnit))}</span></p> : null}<p className="no"><b>Unit cost</b><span>{cop(cost)}</span></p><p><b>Fixed costs / month</b><span>{cop(fixed)}</span></p></div>
      <div className="start-block">
        <Ctl l={`🏷️ Price of one ${S.P.prod.toLowerCase()}`} v={price} set={setPrice} mn={Math.round(cost / 500) * 500} mx={Math.round((cost * 2.6) / 500) * 500} stp={500} fmt={cop} />
        <div className="g84-results g91-results"><div><small>MARGIN</small><b>{cop(margin)} ({mPct}%)</b></div><div><small>CUSTOMERS / MONTH</small><b>{sales}</b></div><div><small>BREAK-EVEN</small><b>{be === Infinity ? "never" : `${be} units`}</b></div><div><small>MONTHLY PROFIT</small><b>{cop(profit)}</b></div></div>
        <LineChart series={[{ name: "Monthly profit", color: "#16b074", values: curve }]} labels={grid.map((g) => `$${(g / 1000).toFixed(1)}k`)} yMin={Math.min(0, Math.floor(Math.min(...curve) / 500000) * 500000)} highlight={grid.reduce((bi, g, i) => (Math.abs(g - price) < Math.abs(grid[bi] - price) ? i : bi), 0)} />
        <p className="start-tip">💡 The market price for similar products is about {cop(S.P.ref)}. Too cheap → many sales, tiny margin. Too expensive → few customers.</p>
        {profit <= 0 && <p className="g91-note neg">You lose money at this price. Move the slider!</p>}
        {profit > 0 && mPct < 20 && <p className="g91-note neg">Margin under 20% — too risky.</p>}
      </div>
      <div className="start-block"><h3>🎯 My strategy</h3><Tri value={strat} onPick={setStrat} opts={STRAT_P4} /></div>
      <div className="start-block"><h3>✍️ Explain your price</h3><WordField value={text} onChange={setText} min={20} max={60} rows={3} placeholder="Our price is … because … We need … sales to break even." goals={G} /></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(30, { price, cost, fixed, sales, profit, breakEven: be, strategy: strat, text })}>Save Founder Page 14 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 5 · SHARK TANK — THE INVESTOR ARENA
   ===================================================================== */
const SHARKS_P5 = [
  { id: "eco", e: "🧴", n: "EcoBottle", ask: 20e6, eq: 10, prob: "Plastic bottles everywhere", market: "Big · every student and worker", model: "Sells refillable bottles + refill stations", risk: "Copycats", mult: 2.5, out: "Schools bought refill stations. Sales grew every year." },
  { id: "lunch", e: "🥗", n: "SmartLunch", ask: 30e6, eq: 15, prob: "Unhealthy, expensive lunches", market: "Medium · parents in 3 schools", model: "Monthly lunch subscription", risk: "Food costs go up", mult: 1.3, out: "It grew slowly — food costs rose, but parents stayed." },
  { id: "pet", e: "🐶", n: "PetCare App", ask: 15e6, eq: 20, prob: "Pet owners forget vaccines", market: "Small · nobody tested it", model: "“We'll think about it later”", risk: "No way to make money yet", mult: 0, out: "Lots of downloads, zero income. It closed in year 2." },
  { id: "recy", e: "♻️", n: "RecycleTech", ask: 40e6, eq: 10, prob: "Recycling is confusing", market: "Big · cities", model: "Sells sorting machines", risk: "Very expensive machines", mult: 0.8, out: "Good idea, but the price was too high: the company is worth less than the deal said." },
];
const REASON_P5 = ["Real problem", "Big market", "Clear way to make money", "Fair valuation", "Low risk"];
function BecomeShark({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [val, setVal] = useState("");
  const [valOk, setValOk] = useState(null);
  const [inv, setInv] = useState({});
  const [why, setWhy] = useState({});
  const [st, finish] = useFinish(onSave);
  const spent = SHARKS_P5.reduce((a, s) => a + (inv[s.id] ? s.ask : 0), 0);
  const chosen = SHARKS_P5.filter((s) => inv[s.id]);
  const final = chosen.reduce((a, s) => a + s.ask * s.mult, 0) + (100e6 - spent);
  const roi = Math.round(((final - 100e6) / 100e6) * 100);
  const okInv = chosen.length >= 2 && spent <= 100e6 && chosen.every((s) => why[s.id]);
  if (st.done) return <Reward title="Shark season over! 🦈" subtitle={`$100,000,000 → ${cop(final)} (${roi >= 0 ? "+" : ""}${roi}%)`} coins={st.coins} saving={st.saving} onExit={onExit} gold={roi > 20} />;
  return (
    <ActShell icon={<Briefcase size={22} strokeWidth={2.1} />} title="Become the Shark 🦈" subtitle="You have a fictional $100,000,000. Four startups want your money. Analyze, invest — and see what happens 3 years later." onExit={onExit}>
      <Brief91 k="c5_shark" />
      <Steps91 labels={["1 · Valuation check", "2 · Invest", "3 · Three years later"]} at={stage} />
      <div className="g93-sharks">{SHARKS_P5.map((s) => (
        <div key={s.id} className={`${inv[s.id] ? "on" : ""} ${stage === 2 ? (s.mult >= 1.2 ? "ok" : s.mult < 1 ? "no" : "") : ""}`}>
          <header><em>{s.e}</em><b>{s.n}</b></header>
          <p><span>Asks</span><b>{cop(s.ask)} for {s.eq}%</b></p>
          <p><span>Valuation</span><b>{stage >= 1 ? cop(s.ask / (s.eq / 100)) : "?"}</b></p>
          <p><span>Problem</span><b>{s.prob}</b></p><p><span>Market</span><b>{s.market}</b></p><p><span>Model</span><b>{s.model}</b></p><p><span>Risk</span><b>{s.risk}</b></p>
          {stage === 1 && <><button type="button" className={`g93-inv ${inv[s.id] ? "on" : ""}`} onClick={() => setInv({ ...inv, [s.id]: !inv[s.id] })}>{inv[s.id] ? "✅ Investing" : "Invest"}</button>{inv[s.id] && <select value={why[s.id] || ""} onChange={(e) => setWhy({ ...why, [s.id]: e.target.value })}><option value="">Main reason…</option>{REASON_P5.map((r) => <option key={r}>{r}</option>)}</select>}</>}
          {stage === 2 && <div className="g93-after"><small>3 YEARS LATER</small><b>×{s.mult}</b><span>{s.out}</span>{inv[s.id] && <strong>Your {cop(s.ask)} → {cop(s.ask * s.mult)}</strong>}</div>}
        </div>
      ))}</div>
      {stage === 0 && (
        <div className="start-block">
          <h3>🧮 Before investing: how much does EcoBottle say it is worth?</h3>
          <p className="start-tip">Valuation = investment ÷ equity. $20,000,000 for 10%.</p>
          <MoneyInput value={val} onChange={(v) => { setVal(v); setValOk(null); }} />
          <div className="p3-card-actions"><button className="s1-btn primary" disabled={!val} onClick={() => setValOk(num(val) === 200000000)}>Check</button></div>
          {valOk === false && <div className="p1-hint">💡 20,000,000 ÷ 0.10</div>}
          {valOk && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(1)}>✅ $200,000,000 — see all valuations <ChevronRight size={18} /></button></div>}
        </div>
      )}
      {stage === 1 && (
        <>
          <div className="g91-mini"><span>💼 Budget <b>{cop(100e6)}</b></span><span className={spent > 100e6 ? "neg" : ""}>📤 Invested <b>{cop(spent)}</b></span><span>💵 Left <b>{cop(100e6 - spent)}</b></span></div>
          {spent > 100e6 && <p className="g91-note neg">Over budget!</p>}
          <p className="start-tip">Invest in at least 2 startups and choose the main reason for each one. Real sharks diversify.</p>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!okInv} onClick={() => setStage(2)}>Fast-forward 3 years ⏩</button></div>
        </>
      )}
      {stage === 2 && (
        <>
          <div className={`p1-banner ${roi > 0 ? "good" : "bad"}`}><span>Your portfolio: {cop(final)} ({roi >= 0 ? "+" : ""}{roi}%). 💡 PetCare had a cheap deal but NO way to make money. RecycleTech had a great idea but an inflated valuation. A clear model + a fair price won.</span></div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(20 + (roi > 30 ? 10 : roi > 0 ? 5 : 0) + (valOk ? 4 : 0), { invested: chosen.map((s) => s.id), reasons: why, final, roi })}>Save my investment decision <span className="coin-tag"><Coins size={15} /> +{24 + (roi > 30 ? 10 : roi > 0 ? 5 : 0)}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- EQUITY MATH (cálculos de inversionista) ---------- */
const EQUITY_P5 = [
  { tag: "EQUITY 1/5", q: "You own 100% of your startup. You sell 25% to an investor. How much do you keep?", answer: 75, unit: "%", hint: "100 − 25", explain: "You keep 75%." },
  { tag: "EQUITY 2/5", q: "An investor gives $15,000,000 for 30%. What is the valuation of the company?", answer: 50000000, money: true, hint: "15,000,000 ÷ 0.30", explain: "$50,000,000." },
  { tag: "EQUITY 3/5", q: "The company is worth $80,000,000 and you own 60%. How much is YOUR part worth?", answer: 48000000, money: true, hint: "80,000,000 × 0.60", explain: "$48,000,000." },
  { tag: "EQUITY 4/5", q: "You invested $10,000,000 and now it's worth $25,000,000. What is your ROI?", answer: 150, unit: "%", hint: "(25 − 10) ÷ 10 × 100", explain: "150%." },
  { tag: "EQUITY 5/5", q: "Two offers: A) $10,000,000 for 20% · B) $10,000,000 for 40%. Which is better for the FOUNDER?", options: ["A — you give away less of your company", "B, because the investor will own more of the company and will work harder to help it grow", "They are equal", "Neither"], correct: 0, hint: "Same money… which costs less ownership?", explain: "A values the company at $50M; B only at $25M." },
];

/* ---------- FOUNDER PAGE 15 · THE NEGOTIATION ROOM (mi startup) ---------- */
const STRENGTH_P5 = ["Our monthly profit", "Real customers who want it", "A clear value proposition", "Low costs", "A sustainable model", "A strong team"];
const PLAN_P5 = [["Raise the price a little and cut one fixed cost", 1], ["Spend the investment on a big party to get famous", 0], ["Hope for more customers without changing anything", 0]];
function Negotiation({ resp, existing, onSave, onExit }) {
  const S = sampleOr93(resp);
  const annual = Math.max(0, (S.profit ?? 400000) * 12);
  const fair = Math.max(20e6, Math.round(annual * 5 / 1e6) * 1e6);
  const [ask, setAsk] = useState(existing?.amount || 10e6);
  const [eq, setEq] = useState(existing?.equity || 20);
  const [str, setStr] = useState([]);
  const [round, setRound] = useState(0);
  const [resp2, setResp2] = useState(null);
  const [deal, setDeal] = useState(null);
  const [plan, setPlan] = useState(null);
  const [why, setWhy] = useState("");
  const [st, finish] = useFinish(onSave);
  const v = ask / (eq / 100);
  const offer = () => {
    const r = round + 1; setRound(r);
    if (v > fair * 1.6) { const ce = Math.min(60, Math.ceil(((ask / (fair * 1.2)) * 100) / 5) * 5); setResp2({ k: "counter", t: `“Your valuation is ${cop(v)}. That's too high for these numbers. I'll give you ${cop(ask)}… for ${ce}%.”`, eq: ce }); }
    else if (v < fair * 0.6) { setResp2({ k: "grab", t: "“DEAL! Shake my hand right now!” 😏 (Hmm… that was too easy.)" }); }
    else if ((S.profit ?? 0) <= 0 && plan === null) { setResp2({ k: "improve", t: "“I like it — but you are losing money. Show me a plan to make profit first.”" }); }
    else setResp2({ k: "accept", t: "“Fair valuation, real numbers, clear value. You have a deal!” 🤝" });
  };
  const close = (amount, equity) => setDeal({ amount, equity });
  if (st.done) return <Reward title={deal.amount ? "Deal closed! 🤝" : "You walked away 🚶"} subtitle={deal.amount ? `${cop(deal.amount)} for ${deal.equity}% · you keep ${100 - deal.equity}%` : "No investment — you keep 100%."} coins={st.coins} saving={st.saving} onExit={onExit} gold={!!deal.amount} />;
  return (
    <ActShell icon={<Handshake size={22} strokeWidth={2.1} />} title={`The Negotiation Room · ${S.logo} ${S.name} 🦈`} subtitle="Founder Page 15 · Ask for money for YOUR startup. Protect two things: money to grow and ownership." onExit={onExit}>
      <Brief91 k="c5_negotiate" />
      <PBadge n="15" />
      <NeedStartup resp={resp} />
      <div className="g84-results g91-results"><div><small>MONTHLY PROFIT</small><b>{S.profit == null ? "no price yet" : cop(S.profit)}</b></div><div><small>CUSTOMERS</small><b>{S.customers || "—"}</b></div><div><small>INVESTOR'S IDEA OF VALUE</small><b>≈ {cop(fair)}</b></div></div>
      {!deal && (
        <>
          <div className="start-block">
            <h3>🎤 1 · Your offer</h3>
            <Ctl l="💰 I ask for" v={ask} set={(x) => { setAsk(x); setResp2(null); }} mn={5e6} mx={40e6} stp={1e6} fmt={cop} />
            <Ctl l="📊 In exchange for" v={eq} set={(x) => { setEq(x); setResp2(null); }} mn={5} mx={50} stp={5} fmt={(x) => `${x}%`} />
            <p className={`g91-note ${v > fair * 1.6 ? "neg" : v < fair * 0.6 ? "neg" : "pos"}`}>Your valuation: <b>{cop(v)}</b> · you would keep {100 - eq}%</p>
            <small className="g91-lbl">2 · Highlight 3 strengths in your pitch</small>
            <div className="g84-chips">{STRENGTH_P5.map((x) => <button key={x} type="button" className={str.includes(x) ? "on" : ""} onClick={() => setStr(str.includes(x) ? str.filter((y) => y !== x) : str.length < 3 ? [...str, x] : str)}>{x}</button>)}</div>
            <div className="p3-card-actions"><button className="s1-btn primary" disabled={str.length < 3 || round >= 3} onClick={offer}>🎤 Make the offer (round {Math.min(round + 1, 3)}/3)</button></div>
          </div>
          {resp2 && (
            <div className="start-block">
              <div className="g93-investor"><em>🦈</em><div><small>THE INVESTOR ANSWERS</small><b>{resp2.t}</b></div></div>
              {resp2.k === "counter" && <div className="p3-card-actions"><button className="s1-btn primary" onClick={() => close(ask, resp2.eq)}>Accept {resp2.eq}%</button><button className="s1-btn ghost" disabled={round >= 3} onClick={() => setResp2(null)}>Make a new offer</button><button className="s1-btn ghost" onClick={() => close(0, 0)}>Walk away 🚶</button></div>}
              {resp2.k === "grab" && <><p className="g91-note neg">⚠️ You valued your company at only {cop(v)}. The investor got a bargain — you gave away too much.</p><div className="p3-card-actions"><button className="s1-btn primary" onClick={() => close(ask, eq)}>Accept anyway</button><button className="s1-btn ghost" disabled={round >= 3} onClick={() => setResp2(null)}>Change my offer</button></div></>}
              {resp2.k === "improve" && <><div className="quiz-options">{PLAN_P5.map(([t, g], k) => <button key={t} type="button" className={`quiz-opt ${plan === k ? (g ? "correct" : "wrong") : ""}`} onClick={() => { setPlan(g ? k : null); if (g) setResp2({ k: "accept", t: "“Now THAT's a plan. You have a deal!” 🤝" }); }}><span className="opt-key">{"ABC"[k]}</span><span className="opt-text">{t}</span></button>)}</div></>}
              {resp2.k === "accept" && <div className="p3-card-actions"><button className="s1-btn primary" onClick={() => close(ask, eq)}>🤝 Shake hands</button></div>}
            </div>
          )}
          {round >= 3 && resp2?.k === "counter" && <p className="g91-note">Last round: accept or walk away.</p>}
        </>
      )}
      {deal && (
        <div className="start-block">
          <div className="g93-deal"><div><small>INVESTMENT</small><b>{cop(deal.amount)}</b></div><div><small>INVESTOR OWNS</small><b>{deal.equity}%</b></div><div><small>YOU KEEP</small><b>{100 - deal.equity}%</b></div><div><small>VALUATION</small><b>{deal.amount ? cop(deal.amount / (deal.equity / 100)) : "—"}</b></div></div>
          <h3>✍️ Why was this a good (or bad) deal for you?</h3>
          <WordField value={why} onChange={setWhy} min={12} max={45} rows={3} placeholder="I accepted … because … I keep …% of my company." goals={[W_REASON, W_NUMBERS(1)]} />
          <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(why, 12, 45, [W_REASON, W_NUMBERS(1)])} onClick={() => finish(30, { amount: deal.amount, equity: deal.equity, valuation: deal.amount ? deal.amount / (deal.equity / 100) : 0, fair, rounds: round, strengths: str, why })}>Save Founder Page 15 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
        </div>
      )}
    </ActShell>
  );
}

/* =====================================================================
   CLASE 6 · DIGITAL MARKETING & RESPONSIBLE AI
   ===================================================================== */
const ADS_P6 = [
  { e: "🥤", brand: "FitSnack", ad: "“Lose 10 kg in one week with FitSnack! ★★★★★ ‘It changed my life’ — Laura, 24”", tgt: ["Young adults who want to be healthy", "Grandparents", "Pets"], emo: "hope", honest: false, trick: "False promise" },
  { e: "👕", brand: "Barrio Style", ad: "“New T-shirts made in our neighborhood. $45,000. Free changes for 30 days. Visit us on 10th Street.”", tgt: ["Local young people", "Big companies", "Babies"], emo: "belonging", honest: true },
  { e: "🐾", brand: "PetPal", ad: "“ONLY TODAY! 90% OFF dog walking! ⏰ 5 spots left!!!” (the same ad every day)", tgt: ["Busy pet owners", "Farmers", "Students without pets"], emo: "urgency", honest: false, trick: "Fake urgency" },
  { e: "🧴", brand: "EcoBottle", ad: "“Our bottle saves up to 300 plastic bottles a year. Photo: our real bottle. $38,000.”", tgt: ["Students who care about the planet", "Car drivers", "Nobody"], emo: "pride", honest: true },
];
const EMO_P6 = ["hope", "fear", "belonging", "urgency", "pride"];
const TRICK_P6 = ["False promise", "Fake urgency", "Edited photo", "Hidden cost"];
const AI_P6 = [
  { e: "🖼️", t: "An AI-generated image of your product. It looks exactly like the real one, and the post says “image created with AI”.", a: "pub", v: "It shows the real product fairly" },
  { e: "🎤", t: "An AI video of a famous singer “recommending” your snacks. You never asked her.", a: "no", v: "We have permission to use her image" },
  { e: "📊", t: "An AI caption says: “9 out of 10 doctors recommend our lunch box.” Nobody asked any doctor.", a: "fix", v: "The statistic is true and has a source" },
  { e: "💬", t: "A real review from a real customer, shared with her permission.", a: "pub", v: "The customer agreed to share it" },
  { e: "🗣️", t: "An AI clone of a local influencer's voice saying your brand is “the best in Bogotá”.", a: "no", v: "We have permission to use her voice" },
];
const AIV_P6 = ["It shows the real product fairly", "We have permission to use her image", "The statistic is true and has a source", "The customer agreed to share it", "We have permission to use her voice"];
function MarketingDetective({ onSave, onExit }) {
  const [ans, setAns] = useState({});
  const [orders] = useState(() => ADS_P6.map((a) => shuffleArr(a.tgt.map((_, k) => k))));
  const [checked, setChecked] = useState(false);
  const [st, finish] = useFinish(onSave);
  const set = (i, k, v) => !checked && setAns({ ...ans, [i]: { ...(ans[i] || {}), [k]: v } });
  const score = ADS_P6.reduce((a, ad, i) => { const x = ans[i] || {}; return a + (x.tgt === 0 ? 1 : 0) + (x.emo === ad.emo ? 1 : 0) + (x.hon === (ad.honest ? "yes" : "no") ? 1 : 0) + (!ad.honest && x.trick === ad.trick ? 1 : 0); }, 0);
  const max = ADS_P6.reduce((a, ad) => a + (ad.honest ? 3 : 4), 0);
  const ready = ADS_P6.every((ad, i) => { const x = ans[i] || {}; return x.tgt != null && x.emo && x.hon && (x.hon === "yes" || x.trick); });
  if (st.done) return <Reward title="Case closed, detective! 🕵️" subtitle={`${score}/${max} clues found`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Marketing Detective 🕵️" subtitle="Four ads from the district. Who are they for? Which emotion do they use? Are they honest?" onExit={onExit}>
      <Brief91 k="c6_detective" />
      {ADS_P6.map((ad, i) => { const x = ans[i] || {}; return (
        <div key={ad.brand} className="start-block g93-ad">
          <div className="g93-adcard"><em>{ad.e}</em><div><small>{ad.brand} · SPONSORED</small><p>{ad.ad}</p></div></div>
          <small className="g91-lbl">🎯 Target customer</small>
          <div className="g84-chips">{orders[i].map((k) => <button key={k} type="button" className={`${x.tgt === k ? "on" : ""} ${checked && k === 0 ? "red" : ""}`} onClick={() => set(i, "tgt", k)}>{ad.tgt[k]}</button>)}</div>
          <small className="g91-lbl">❤️ Main emotion</small>
          <div className="g84-chips">{EMO_P6.map((e) => <button key={e} type="button" className={`${x.emo === e ? "on" : ""} ${checked && e === ad.emo ? "red" : ""}`} onClick={() => set(i, "emo", e)}>{e}</button>)}</div>
          <small className="g91-lbl">⚖️ Is it honest?</small>
          <Tri value={x.hon} onPick={(v) => set(i, "hon", v)} disabled={checked} opts={[["yes", "✅ Honest"], ["no", "🚩 Misleading"]]} />
          {x.hon === "no" && <div className="g84-chips">{TRICK_P6.map((t) => <button key={t} type="button" className={x.trick === t ? "on" : ""} onClick={() => set(i, "trick", t)}>{t}</button>)}</div>}
          {checked && <p className={`g91-note ${x.hon === (ad.honest ? "yes" : "no") ? "pos" : "neg"}`}>{ad.honest ? "✅ Honest: real product, real price, clear conditions." : `🚩 Misleading: ${ad.trick.toLowerCase()}.`}</p>}
        </div>
      ); })}
      <div className="start-foot">{!checked ? <button className="s1-btn primary big" disabled={!ready} onClick={() => setChecked(true)}>Reveal the truth 🕵️</button> : <button className="s1-btn primary big" onClick={() => finish(12 + score, { score, max })}>Finish <span className="coin-tag"><Coins size={15} /> +{12 + score}</span></button>}</div>
    </ActShell>
  );
}
function AIorHuman({ onSave, onExit }) {
  const [ans, setAns] = useState({});
  const [checked, setChecked] = useState(false);
  const [st, finish] = useFinish(onSave);
  const right = AI_P6.filter((c, i) => ans[i]?.a === c.a).length;
  const vRight = AI_P6.filter((c, i) => ans[i]?.v === c.v).length;
  const ready = AI_P6.every((_, i) => ans[i]?.a && ans[i]?.v);
  if (st.done) return <Reward title="Responsible marketer! 🤖✅" subtitle={`${right}/5 decisions · ${vRight}/5 checks`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Brain size={22} strokeWidth={2.1} />} title="AI or Human? Responsible AI Check 🤖" subtitle="Your marketing team prepared 5 posts. Some use AI. Decide: publish, fix first, or never publish." onExit={onExit}>
      <Brief91 k="c6_ai" />
      {AI_P6.map((c, i) => (
        <div key={i} className={`start-block ${checked ? (ans[i]?.a === c.a ? "ok" : "no") : ""}`}>
          <div className="g93-adcard"><em>{c.e}</em><div><small>POST {i + 1}/5</small><p>{c.t}</p></div></div>
          <Tri value={ans[i]?.a} onPick={(v) => !checked && setAns({ ...ans, [i]: { ...(ans[i] || {}), a: v } })} disabled={checked} opts={[["pub", "✅ Publish"], ["fix", "✏️ Fix first"], ["no", "🚫 Never publish"]]} />
          <small className="g91-lbl">What must the business verify?</small>
          <select className="g93-select" value={ans[i]?.v || ""} disabled={checked} onChange={(e) => setAns({ ...ans, [i]: { ...(ans[i] || {}), v: e.target.value } })}><option value="">Choose…</option>{AIV_P6.map((v) => <option key={v}>{v}</option>)}</select>
          {checked && <p className={`g91-note ${ans[i]?.a === c.a ? "pos" : "neg"}`}>{c.a === "pub" ? "✅ Fine to publish — it's true and fair." : c.a === "fix" ? "✏️ Remove the invented statistic or find a real source." : "🚫 Never: it uses someone's identity without permission."} Check: {c.v.toLowerCase()}.</p>}
        </div>
      ))}
      <div className="start-foot">{!checked ? <button className="s1-btn primary big" disabled={!ready} onClick={() => setChecked(true)}>Check my decisions</button> : <button className="s1-btn primary big" onClick={() => finish(12 + right * 2 + vRight, { right, vRight })}>Finish <span className="coin-tag"><Coins size={15} /> +{12 + right * 2 + vRight}</span></button>}</div>
    </ActShell>
  );
}

/* ---------- FOUNDER PAGE 16 · BUILD A VIRAL CAMPAIGN (mi startup) ---------- */
const PLAT_P6 = [["tiktok", "🎵 TikTok"], ["ig", "📸 Instagram"], ["wa", "💬 WhatsApp"], ["fb", "👍 Facebook"], ["flyer", "📄 Flyers"]];
const FIT_P6 = { young: { tiktok: 1, ig: 0.9, wa: 0.5, fb: 0.2, flyer: 0.4 }, parents: { tiktok: 0.3, ig: 0.6, wa: 1, fb: 0.8, flyer: 0.5 }, older: { tiktok: 0.1, ig: 0.3, wa: 0.7, fb: 0.9, flyer: 1 }, families: { tiktok: 0.3, ig: 0.6, wa: 0.9, fb: 0.8, flyer: 0.8 }, workers: { tiktok: 0.5, ig: 0.9, wa: 0.7, fb: 0.5, flyer: 0.4 } };
const audOf6 = (c) => (/older|grand/i.test(c) ? "older" : /parent/i.test(c) ? "parents" : /famil|neighbor/i.test(c) ? "families" : /worker|business/i.test(c) ? "workers" : "young");
const MSG_P6 = [["honest", "✅ A real benefit: “Healthy lunch ready in 10 minutes — $X”", 0.03, 0.12, 10], ["hype", "🤩 “The BEST in the world! 100% guaranteed results!”", 0.05, 0.05, -30], ["fake", "⏰ “ONLY TODAY 90% OFF!” (every day)", 0.045, 0.07, -15]];
const VIS_P6 = [["real", "📷 A real photo of our product", 1, 0], ["ai", "🤖 An AI image, accurate and labeled", 1.05, 0], ["celeb", "⭐ A fake AI celebrity using our product", 1.3, -40]];
const CTA_P6 = ["Order on WhatsApp", "Visit our stand", "Follow us for weekly offers", "Book your spot"];
const sim6 = (fit, msg, vis, b) => { const M = MSG_P6.find((m) => m[0] === msg), V = VIS_P6.find((v) => v[0] === vis); if (!M || !V) return null; const reach = Math.round(((b.ads / 1000) * 120 + (b.infl / 1000) * 150 + (b.content / 1000) * 60 + (b.promo / 1000) * 30) * fit + 2000 * fit); const clicks = Math.round(reach * M[2] * V[2]); const sales = Math.round(clicks * M[3] * (1 + (b.promo / 1e6) * 0.6)); const rep = Math.max(0, Math.min(100, 70 + M[4] + V[3] + (b.content > 200000 ? 5 : 0))); const complaints = msg === "honest" && vis !== "celeb" ? 0 : Math.round(sales * (msg === "hype" ? 0.4 : 0.25) + (vis === "celeb" ? 10 : 0)); return { reach, clicks, sales, rep, complaints }; };
function CampaignBuilder({ resp, existing, onSave, onExit }) {
  const S = sampleOr93(resp);
  const aud = audOf6(S.customer || S.P.cust);
  const benefitTxt = (t) => t.replace("Healthy lunch ready in 10 minutes", `${S.P.prod}: it ${resp?.c2_surgery?.benefit || "solves your problem"}`).replace("$X", S.price ? cop(S.price) : "a fair price");
  const [plat, setPlat] = useState("");
  const [msg, setMsg] = useState("");
  const [vis, setVis] = useState("");
  const [cta, setCta] = useState("");
  const [b, setB] = useState({ ads: 300000, infl: 200000, content: 200000, promo: 100000 });
  const [run, setRun] = useState(null);
  const [st, finish] = useFinish(onSave);
  const total = b.ads + b.infl + b.content + b.promo;
  const fit = plat ? FIT_P6[aud][plat] : 0;
  const ready = plat && msg && vis && cta && total <= 1000000 && total > 0;
  const launch = () => { const r = sim6(fit, msg, vis, b); setRun({ ...r, newCustomers: Math.round(r.sales / 2) }); };
  const coins = run ? 20 + (run.rep >= 70 ? 6 : 0) + (fit >= 0.9 ? 4 : 0) : 20;
  if (st.done) return <Reward title="Campaign live! 📣" subtitle={`${run.reach.toLocaleString("en-US")} people reached · ${run.sales} sales · reputation ${run.rep}%`} coins={st.coins} saving={st.saving} onExit={onExit} gold={run.rep >= 70} />;
  return (
    <ActShell icon={<Megaphone size={22} strokeWidth={2.1} />} title={`Build a Viral Campaign · ${S.logo} ${S.name} 📣`} subtitle="Founder Page 16 · $1,000,000 marketing budget (from your startup cash). Reach your customers — honestly." onExit={onExit}>
      <Brief91 k="c6_campaign" />
      <PBadge n="16" />
      <NeedStartup resp={resp} />
      <div className="g93-camp">
        <div>
          <div className="start-block"><small className="g91-lbl">1 · Target audience</small><p className="g91-note pos">👥 {S.customer || S.P.cust}</p>
            <small className="g91-lbl">2 · Platform</small><div className="g84-chips">{PLAT_P6.map(([k, l]) => <button key={k} type="button" className={plat === k ? "on" : ""} onClick={() => { setPlat(k); setRun(null); }}>{l}</button>)}</div>
            {plat && <p className={`g91-note ${fit >= 0.8 ? "pos" : "neg"}`}>{fit >= 0.8 ? "🎯 Your customers are here!" : fit >= 0.5 ? "🤏 Some of your customers are here." : "😶 Your customers are NOT here — like shouting in an empty room."}</p>}
          </div>
          <div className="start-block"><small className="g91-lbl">3 · Message</small><div className="g92-opts">{MSG_P6.map(([k, l]) => <button key={k} type="button" className={msg === k ? "ok" : ""} onClick={() => { setMsg(k); setRun(null); }}>{benefitTxt(l)}</button>)}</div>
            <small className="g91-lbl">4 · Visual</small><div className="g92-opts">{VIS_P6.map(([k, l]) => <button key={k} type="button" className={vis === k ? "ok" : ""} onClick={() => { setVis(k); setRun(null); }}>{l}</button>)}</div>
            <small className="g91-lbl">5 · Call to action</small><div className="g84-chips">{CTA_P6.map((c) => <button key={c} type="button" className={cta === c ? "on" : ""} onClick={() => setCta(c)}>{c}</button>)}</div>
          </div>
          <div className="start-block"><small className="g91-lbl">6 · Budget (max $1,000,000)</small>
            {[["ads", "📢 Paid ads"], ["infl", "🤳 Micro-influencer"], ["content", "🎬 Our own content"], ["promo", "🏷️ Launch promotion"]].map(([k, l]) => <Ctl key={k} l={l} v={b[k]} set={(v) => { setB({ ...b, [k]: v }); setRun(null); }} mn={0} mx={600000} stp={50000} fmt={cop} />)}
            <p className={`g91-note ${total <= 1000000 ? "pos" : "neg"}`}>Total: {cop(total)} {total > 1000000 ? "— over budget!" : ""}</p>
          </div>
        </div>
        <div className="g93-phonead">
          <div className="g93-post"><header><em>{S.logo}</em><b>{S.name}</b><small>{PLAT_P6.find(([k]) => k === plat)?.[1] || "Platform?"}</small></header><div className="g93-post-img">{vis === "celeb" ? "⭐🤳" : vis === "ai" ? `🤖 ${S.logo}` : S.logo}</div><p>{msg ? benefitTxt(MSG_P6.find((m) => m[0] === msg)[1].slice(2)) : "Your message…"}</p>{vis === "ai" && <small className="g93-label">Image created with AI</small>}<button type="button" tabIndex={-1}>{cta || "Call to action"}</button></div>
          {run && (
            <div className="g93-results">
              <div><small>👀 Reach</small><b>{run.reach.toLocaleString("en-US")}</b></div><div><small>👆 Clicks</small><b>{run.clicks.toLocaleString("en-US")}</b></div><div><small>🛒 Sales</small><b>{run.sales}</b></div><div><small>⭐ Reputation</small><b>{run.rep}%</b></div>
              {run.complaints > 0 && <p className="neg">😡 {run.complaints} complaints: “This is not what the ad promised!”</p>}
              {run.rep >= 70 && <p className="pos">💚 Customers trust {S.name}. They will come back.</p>}
            </div>
          )}
        </div>
      </div>
      <div className="start-foot"><button className="s1-btn ghost" disabled={!ready} onClick={launch}><Zap size={16} /> {run ? "Launch again" : "Launch the campaign"}</button><button className="s1-btn primary big" disabled={!run} onClick={() => finish(coins, { platform: plat, msg, vis, cta, budget: total, ...run })}>Save Founder Page 16 <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 7 · LIFE AT 25 — FUTURE LIFE SIMULATOR
   ===================================================================== */
const BUCKETS_P7 = [["emer", "🆘 Emergency fund", "#ff6b57"], ["save", "🐷 Savings", "#16b074"], ["inv", "📈 Investments", "#0b7a50"], ["edu", "🎓 Education", "#f5b23e"], ["goals", "✈️ Personal goals", "#e07a2f"], ["biz", "🚀 My future business", "#9b5de5"]];
const EXP_P7 = [["Rent", 1000000], ["Food", 500000], ["Transport", 250000], ["Services", 200000], ["Entertainment", 300000]];
const EV_P7 = [
  { m: 1, e: "💻", t: "Your laptop breaks. A new one costs $1,500,000.", opts: [["Pay from my emergency fund", "emer"], ["Put it on a credit card", "debt"]] },
  { m: 2, e: "🎉", t: "Promotion! You earn $500,000 more every month. Where does it go?", opts: BUCKETS_P7.map(([k, l]) => [l, k]) },
  { m: 3, e: "🏠", t: "Your rent goes up $200,000 a month. Which monthly amount do you reduce?", opts: BUCKETS_P7.map(([k, l]) => [l, k]) },
  { m: 4, e: "✈️", t: "Friends invite you on a trip: $1,800,000.", opts: [["Use my personal goals fund", "goals"], ["Pay with a credit card", "debt"], ["Not this time", "skip"]] },
  { m: 5, e: "👨‍👩‍👧", t: "Your family needs $600,000 for an emergency.", opts: [["From my emergency fund", "emer"], ["From my savings", "save"], ["Borrow it", "debt"]] },
  { m: 6, e: "🚀", t: "A business opportunity! You need $3,000,000 from your business fund to start.", opts: [["Start it (if I have the money)", "start"], ["Wait and keep saving", "wait"]] },
];
function LifeAt25({ resp, existing, onSave, onExit }) {
  const S = startupOf(resp);
  const [stage, setStage] = useState(0);
  const [al, setAl] = useState(existing?.alloc || { emer: 300000, save: 250000, inv: 200000, edu: 100000, goals: 200000, biz: 200000 });
  const [m, setM] = useState(0);
  const [bal, setBal] = useState({ emer: 0, save: 0, inv: 0, edu: 0, goals: 0, biz: 0 });
  const [mo, setMo] = useState(null);
  const [debt, setDebt] = useState(0);
  const [log, setLog] = useState([]);
  const [biz, setBiz] = useState(false);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const sum = Object.values(al).reduce((a, v) => a + v, 0);
  const E = EV_P7[m];
  const apply = (choice) => {
    const monthly = { ...(mo || al) };
    const b = { ...bal }; Object.keys(b).forEach((k) => { b[k] += monthly[k]; }); b.inv = Math.round(b.inv * 1.01);
    let d = Math.round(debt * 1.025), note = "", good = true;
    const pay = (k, amt) => { if (b[k] >= amt) { b[k] -= amt; return true; } const miss = amt - b[k]; b[k] = 0; d += miss; return false; };
    if (E.m === 1) { if (choice === "emer") { const ok = pay("emer", 1500000); note = ok ? "Paid with your emergency fund — no debt!" : "Your fund wasn't enough: the rest became debt."; good = ok; } else { d += 1500000; note = "Credit card debt: $1,500,000 at 2.5% a month."; good = false; } }
    if (E.m === 2) { monthly[choice] += 500000; note = `+$500,000 every month to ${BUCKETS_P7.find(([k]) => k === choice)[1]}.`; good = choice !== "goals"; }
    if (E.m === 3) { const cut = Math.min(200000, monthly[choice]); monthly[choice] -= cut; if (cut < 200000) d += 200000 - cut; note = `You reduced ${BUCKETS_P7.find(([k]) => k === choice)[1]} by ${cop(cut)}.`; good = choice === "goals" || choice === "edu"; }
    if (E.m === 4) { if (choice === "goals") { const ok = pay("goals", 1800000); note = ok ? "Trip paid with your goals fund. Enjoy! ✈️" : "Not enough in your goals fund — the rest became debt."; good = ok; } else if (choice === "debt") { d += 1800000; note = "A trip on credit… you'll pay it with interest."; good = false; } else note = "You skipped it — and kept your plan."; }
    if (E.m === 5) { if (choice === "debt") { d += 600000; note = "You borrowed it."; good = false; } else { const ok = pay(choice, 600000); note = ok ? "You helped your family without debt. 💚" : "Not enough — the rest became debt."; good = ok; } }
    if (E.m === 6) { if (choice === "start" && b.biz >= 3000000) { b.biz -= 3000000; setBiz(true); note = "🚀 You started your business with your own savings!"; } else if (choice === "start") { note = `You only have ${cop(b.biz)} in your business fund. Not yet!`; good = false; } else note = "You keep saving for a better moment."; }
    setBal(b); setDebt(d); setMo(monthly); setLog([...log, { m: E.m, choice, note, good }]); setM(m + 1);
  };
  const net = Object.values(bal).reduce((a, v) => a + v, 0) - debt;
  const goodN = log.filter((x) => x.good).length;
  const G = [W_REASON, W_NUMBERS(2)];
  if (st.done) return <Reward title="Life at 25: planned! 🧑‍💼" subtitle={`Net savings after 6 months: ${cop(net)} · debt ${cop(debt)}`} coins={st.coins} saving={st.saving} onExit={onExit} gold={debt === 0} />;
  return (
    <ActShell icon={<Briefcase size={22} strokeWidth={2.1} />} title="Your Life at 25 🧑‍💼" subtitle="Founder Page 17 · Fast-forward 10 years. Plan your money, survive 6 months of surprises." onExit={onExit}>
      <Brief91 k="c7_life" />
      <PBadge n="17" />
      <Steps91 labels={["1 · My budget", "2 · Six months", "3 · My plan"]} at={stage} />
      <div className="g93-life">
        <header><em>{S.profile?.avatar || "🧑"}</em><div><small>AGE 25 · FICTIONAL SIMULATION</small><b>{S.profile ? S.profile.name : "You"} · {S.name ? `founder of ${S.logo} ${S.name} (side project)` : "young professional"}</b><span>Monthly income: {cop(3500000)}</span></div></header>
        <div className="g92-impact">{EXP_P7.map(([l, v]) => <p key={l}><b>{l}</b><span>−{cop(v)}</span></p>)}<p className="no"><b>Money remaining</b><span>{cop(1250000)}</span></p></div>
      </div>
      {stage === 0 && (
        <div className="start-block">
          <h3>💰 Distribute your $1,250,000 every month</h3>
          {BUCKETS_P7.map(([k, l]) => <Ctl key={k} l={l} v={al[k]} set={(v) => setAl({ ...al, [k]: v })} mn={0} mx={800000} stp={50000} fmt={cop} />)}
          <PctBar parts={BUCKETS_P7.map(([k, l, c]) => ({ label: l, value: Math.round((al[k] / 1250000) * 100), color: c }))} />
          <p className={`g91-note ${sum === 1250000 ? "pos" : "neg"}`}>{sum === 1250000 ? "✅ Every peso has a job." : `Total ${cop(sum)} — it must be exactly ${cop(1250000)}.`}{al.emer === 0 ? " ⚠️ No emergency fund?" : ""}</p>
          <div className="start-foot"><button className="s1-btn primary big" disabled={sum !== 1250000} onClick={() => setStage(1)}>Start month 1 <ChevronRight size={18} /></button></div>
        </div>
      )}
      {stage === 1 && (
        <>
          <div className="g93-buckets">{BUCKETS_P7.map(([k, l, c]) => <div key={k}><small>{l}</small><b>{cop(bal[k])}</b><i style={{ width: `${Math.min(100, (bal[k] / 3000000) * 100)}%`, background: c }} /></div>)}<div className="debt"><small>💳 Debt</small><b>{cop(debt)}</b></div></div>
          {log.length > 0 && <p className={`g91-note ${log[log.length - 1].good ? "pos" : "neg"}`}>Month {log[log.length - 1].m}: {log[log.length - 1].note}</p>}
          {m < 6 ? (
            <div className="start-block">
              <div className="g83-event"><em>{E.e}</em><div><b>Month {E.m}</b><span>{E.t}</span></div></div>
              <div className="g84-chips">{E.opts.map(([l, k]) => <button key={k} type="button" onClick={() => apply(k)}>{l}</button>)}</div>
            </div>
          ) : <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(2)}>See my 6 months <ChevronRight size={18} /></button></div>}
        </>
      )}
      {stage === 2 && (
        <>
          <div className="g84-results g91-results"><div><small>SAVED (ALL FUNDS)</small><b>{cop(net + debt)}</b></div><div><small>DEBT</small><b>{cop(debt)}</b></div><div><small>BUSINESS</small><b>{biz ? "Started 🚀" : "Not yet"}</b></div><div><small>GOOD DECISIONS</small><b>{goodN}/6</b></div></div>
          <div className="g91-timeline">{log.map((x) => <div key={x.m} className={x.good ? "good" : "bad"}><small>Month {x.m}</small><span>{x.note}</span></div>)}</div>
          <div className="start-block"><h3>✍️ My Life at 25 plan</h3><WordField value={text} onChange={setText} min={20} max={70} rows={4} placeholder="At 25, I will save … every month because … My emergency fund will be … My goal is …" goals={G} /></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(text, 20, 70, G)} onClick={() => finish(20 + goodN * 2, { alloc: al, balances: bal, debt, business: biz, good: goodN, text })}>Save Founder Page 17 <span className="coin-tag"><Coins size={15} /> +{20 + goodN * 2}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- THE SMART GOALS FACTORY ---------- */
const SMART_P7 = [
  { tag: "🏭 GOAL 1 · “I want to travel.”", q: "Which version is SMART?", options: ["Save $3,600,000 in 12 months to travel to Cartagena in December", "I really, really want to travel to many places around the world someday when I have money", "Travel tomorrow", "Travel a lot"], correct: 0, hint: "How much? When? What for?", explain: "Specific, measurable, with a date." },
  { tag: "🏭 GOAL 1 · THE NUMBERS", q: "$3,600,000 in 12 months. How much every month?", answer: 300000, money: true, hint: "3,600,000 ÷ 12", explain: "$300,000 per month." },
  { tag: "🏭 GOAL 2 · “I want to start a business.”", q: "Which version is SMART?", options: ["Save $2,400,000 in 8 months to buy a coffee cart", "Start the biggest company in Colombia next week with no money and no plan at all", "Be a boss", "Sell things"], correct: 0, hint: "Achievable + time-bound.", explain: "A realistic first step." },
  { tag: "🏭 GOAL 2 · THE NUMBERS", q: "$2,400,000 in 8 months. How much every month?", answer: 300000, money: true, hint: "2,400,000 ÷ 8", explain: "$300,000 per month." },
  { tag: "🏭 GOAL 3 · “I want to save money.”", q: "Which version is SMART?", options: ["Build a $1,500,000 emergency fund in 10 months", "Save as much money as possible every month, without any number or date, and see what happens", "Save", "Never spend"], correct: 0, hint: "A number + a date.", explain: "Now it's measurable." },
  { tag: "🏭 GOAL 3 · THE NUMBERS", q: "$1,500,000 in 10 months. How much every month?", answer: 150000, money: true, hint: "1,500,000 ÷ 10", explain: "$150,000 per month." },
  { tag: "🏭 GOAL 4 · “I want to be rich.”", q: "Which version is SMART?", options: ["Invest $200,000 every month for 5 years in a diversified fund", "Become a millionaire in one month with a secret crypto that a friend told me about on WhatsApp", "Win the lottery", "Be rich"], correct: 0, hint: "Realistic and specific.", explain: "Small, consistent steps." },
  { tag: "🏭 GOAL 4 · THE NUMBERS", q: "$200,000 every month for 5 years. How much do you contribute in total?", answer: 12000000, money: true, hint: "200,000 × 60 months", explain: "$12,000,000 — before any returns." },
];
function SmartGoals({ onSave, onExit }) {
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="SMART factory closed! 🏭" subtitle="Wishes turned into goals with numbers and dates." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Target size={22} strokeWidth={2.1} />} title="The SMART Goals Factory 🏭" subtitle="Four wishes enter the factory. Four SMART goals come out — with the monthly numbers." onExit={onExit}>
      <Brief91 k="c7_smart" />
      <div className="g93-smart">{["S · Specific", "M · Measurable", "A · Achievable", "R · Relevant", "T · Time-bound"].map((x) => <span key={x}>{x}</span>)}</div>
      <RoundsRunner rounds={SMART_P7} doneLabel="Close the factory" onDone={(r) => finish(12 + r.firstTry * 2, { firstTry: r.firstTry })} />
    </ActShell>
  );
}

/* ---------- PERSONAL VS. BUSINESS MONEY (rush) ---------- */
const RUSH_P7 = {
  buckets: [{ id: "pinc", e: "🙋", l: "Personal income", d: "Money for ME", c: "#16b074" }, { id: "brev", e: "🏪", l: "Business revenue", d: "Money for the BUSINESS", c: "#0b7a50" }, { id: "bexp", e: "📦", l: "Business expense", d: "The business pays", c: "#f5b23e" }, { id: "pexp", e: "🛍️", l: "Personal expense", d: "I pay", c: "#ff6b57" }],
  items: [
    { e: "💵", t: "The salary I pay myself from the business", b: "pinc", why: "A fixed salary = personal income." }, { e: "🎁", t: "Birthday money from my grandmother", b: "pinc", why: "Personal money." },
    { e: "🥐", t: "Sales of 120 surprise bags", b: "brev", why: "Sales belong to the business." }, { e: "📲", t: "Payments from customers by QR", b: "brev", why: "Business revenue." },
    { e: "🧂", t: "Ingredients for the products", b: "bexp", why: "The business buys its materials." }, { e: "📢", t: "Instagram ads for the startup", b: "bexp", why: "Marketing is a business cost." },
    { e: "📦", t: "Packaging and stickers", b: "bexp", why: "Part of the unit cost." }, { e: "🛵", t: "Delivery of customer orders", b: "bexp", why: "A business expense." },
    { e: "📱", t: "My personal phone plan", b: "pexp", why: "Pay it from YOUR money, not the business." }, { e: "👟", t: "New sneakers for me", b: "pexp", why: "Personal — never from the cash register!" },
    { e: "🎉", t: "A party with my friends", b: "pexp", why: "Personal expense." }, { e: "🏦", t: "Profit reinvested in a new oven", b: "bexp", why: "Reinvesting = the business pays for growth." },
  ],
};

/* =====================================================================
   CLASE 8 · BUSINESS FAIR — THE ULTIMATE STARTUP CHALLENGE
   ===================================================================== */
const ESCAPE_P8 = [
  { tag: "🔒 LOCK 1 · COSTS", q: "TacoLab: fixed costs $2,400,000/month · unit cost $6,000 · price $9,000 · 600 sales a month. How much money does it LOSE every month?", answer: 600000, money: true, hint: "600 × (9,000 − 6,000) − 2,400,000", explain: "It loses $600,000. 🔑 Digit: 6", digit: 6 },
  { tag: "🔒 LOCK 2 · CUSTOMERS", q: "How many tacos must TacoLab sell to break even?", answer: 800, unit: "tacos", hint: "2,400,000 ÷ 3,000", explain: "800 tacos. 🔑 Digit: 8", digit: 8 },
  { tag: "🔒 LOCK 3 · REVENUE", q: "Which plan saves TacoLab (with the same 600 sales)?", options: ["Raise the price to $10,000 AND cut $400,000 of fixed costs", "Lower the price to $7,000 so that many more customers come, even with a tiny margin", "Close on weekends", "Do nothing"], correct: 0, hint: "600 × 4,000 − 2,000,000 = ?", explain: "Profit: +$400,000 a month. 🔑 Digit: 4", digit: 4 },
  { tag: "🔒 LOCK 4 · CANVAS", q: "TacoLab pays a delivery app 30% of every order. In which canvas block does this go?", options: ["Cost Structure", "Customer Relationships, because the delivery app talks with the customers every day", "Value Propositions", "Segments"], correct: 0, hint: "It's something TacoLab pays.", explain: "A cost — and a partner! 🔑 Digit: 1", digit: 1 },
  { tag: "🔒 LOCK 5 · MARKETING", q: "Which ad should TacoLab publish?", options: ["“Real tacos, real price: $10,000. Order on WhatsApp.”", "“The BEST tacos in the universe! 100% guaranteed! A famous singer loves them!” (fake AI video)", "“ONLY TODAY 90% OFF” (every day)", "No ads"], correct: 0, hint: "Honest and clear.", explain: "Truth builds reputation. 🔑 Digit: 7", digit: 7 },
];
function StartupEscape({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [res, setRes] = useState(null);
  const [code, setCode] = useState("");
  const [bad, setBad] = useState(false);
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="You escaped! 🔓" subtitle="TacoLab is saved — and so is your startup brain." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<KeyRound size={22} strokeWidth={2.1} />} title="Startup Escape Room 🔓" subtitle="TacoLab is losing money and the door is locked. Open 5 locks, collect the digits, and save the startup." onExit={onExit}>
      <Brief91 k="c8_escape" />
      {stage === 0 ? <RoundsRunner rounds={ESCAPE_P8} doneLabel="Go to the door 🚪" onDone={(r) => { setRes(r); setStage(1); }} /> : (
        <div className="start-block g93-door">
          <em>🚪</em>
          <h3>Enter the 5-digit code (the 🔑 digits, in order)</h3>
          <input className="start-input g93-code" maxLength={5} value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setBad(false); }} placeholder="•••••" />
          {bad && <p className="g91-note neg">The door doesn't open… check the digits of locks 1 to 5.</p>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={code.length < 5} onClick={() => { if (code === ESCAPE_P8.map((x) => x.digit).join("")) finish(20 + res.firstTry * 3, { firstTry: res.firstTry }); else setBad(true); }}>Open the door 🔓</button></div>
        </div>
      )}
    </ActShell>
  );
}

/* ---------- BUSINESS FAIR · pitch final + certificado ---------- */
const RUB_P8 = [["prob", "😣 Real problem & opportunity"], ["value", "💎 Clear value proposition"], ["nums", "🏷️ Realistic numbers (price, profit)"], ["mkt", "📣 Honest marketing"], ["pitch", "🎤 Clear pitch in English"]];
function buildPitch93(r, studentName, closing) {
  const S = sampleOr93(r);
  const vp = r.c2_surgery, ar = r.c3_architect, iv = r.c3_investor, pr = r.c4_mine, ng = r.c5_negotiate, cp = r.c6_campaign, lf = r.c7_life;
  const O = (k) => (ar?.choices?.[k] != null ? ARCH_P3[k].o[ar.choices[k]][0].toLowerCase() : null);
  const first = (studentName || S.profile?.name || "Founder").split(" ")[0];
  const parts = [
    { e: "😣", t: "The problem", s: r.c1_map ? [`${S.P.who} has a problem: ${lowFirst(S.P.prob)}`, `It happens in our ${S.P.place.toLowerCase()} — and many people have it.`] : [] },
    { e: "💎", t: "Our solution & value", s: vp ? [dot(vp.vp)] : [] },
    { e: "🧩", t: "Our business model", s: ar ? [`We reach customers through ${O("ch")}, we earn money by ${O("rev")}, and our key partner is ${O("part")}.`, iv ? `An investor asked us to change something, so we decided to ${lowFirst(iv.change)}.` : ""].filter(Boolean) : [] },
    { e: "🏷️", t: "Our numbers", s: pr ? [`One ${S.P.prod.toLowerCase()} costs us ${cop(pr.cost)} and we sell it for ${cop(pr.price)}.`, `We need ${pr.breakEven} sales a month to break even. With ${pr.sales} customers, our monthly profit is ${cop(pr.profit)}.`] : [] },
    { e: "📣", t: "Our marketing", s: cp ? [`Our campaign on ${PLAT_P6.find(([k]) => k === cp.platform)?.[1].slice(3)} reached ${cp.reach.toLocaleString("en-US")} people and brought ${cp.sales} sales.`, cp.rep >= 70 ? "We used honest messages, so customers trust us." : "We learned that exaggerated messages damage trust."] : [] },
    { e: "🦈", t: "Our investment", s: ng ? [ng.amount ? `We raised ${cop(ng.amount)} for ${ng.equity}% of the company — I still own ${100 - ng.equity}%.` : "We decided not to give away our company for a bad deal — we grow with our own money."] : [] },
    { e: "🎯", t: "Our financial goals", s: [pr ? `In 12 months, we want to earn ${cop(Math.max(0, pr.profit) * 12)} and reinvest part of it.` : "", lf ? `As a founder, I will keep my personal money separate and build an emergency fund.` : ""].filter(Boolean) },
  ];
  return { S, parts, intro: `Hello! I'm ${first}, founder of ${S.logo} ${S.name}. In three minutes, I'll show you why our startup matters.`, closing: dot(closing), outro: `Thank you! Would you invest in ${S.name}? 🚀` };
}
function BusinessFair({ resp, studentName, existing, onSave, onExit }) {
  const r = resp || {};
  const [closing, setClosing] = useState(existing?.closing || "");
  const [slide, setSlide] = useState(null);
  const [peer, setPeer] = useState(existing?.peer || "");
  const [stars, setStars] = useState(existing?.stars || {});
  const [amount, setAmount] = useState(existing?.amount ?? 5000000);
  const [why, setWhy] = useState(existing?.why || "");
  const [cert, setCert] = useState(!!existing?.closing);
  const [st, finish] = useFinish(onSave);
  const B = buildPitch93(r, studentName, closing);
  const pages = PAGES93.filter((p) => r[p.key]).length;
  const score = RUB_P8.reduce((a, [k]) => a + (stars[k] || 0), 0);
  const ready = pages >= 5 && countWords(closing) >= 8 && realText(closing) && peer.trim().length >= 2 && RUB_P8.every(([k]) => stars[k]) && countWords(why) >= 5;
  const Part = ({ p, n, big }) => <section className={`g8-fp ${big ? "big" : ""} ${p.s.length ? "" : "empty"}`}><h4><span>{p.e}</span>{n}. {p.t}</h4>{p.s.length ? <div className="g8-fp-say"><small>🎤 I SAY</small>{p.s.map((t, k) => <p key={k}>{t}</p>)}</div> : <p className="g8-fp-empty">Finish the founder page for this part.</p>}</section>;
  const slides = [
    { k: "cover", node: <div className="g8-slide-cover"><small>STARTUP DISTRICT · BUSINESS FAIR · GRADE 9</small><h2>{B.S.logo} {B.S.name}</h2><p className="g8-fp-sayline">🎤 {B.intro}</p></div> },
    ...B.parts.map((p, k) => ({ k: p.t, node: <Part p={p} n={k + 1} big /> })),
    { k: "end", node: <div className="g8-slide-cover"><h2>{B.closing || "…"}</h2><p className="g8-fp-sayline">🎤 {B.outro}</p></div> },
  ];
  if (st.done) return <Reward title="Young Entrepreneur! 🏆" subtitle={`${B.S.logo} ${B.S.name} · investor score ${score}/25 · open the Business Fair again to download your certificate`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Award size={22} strokeWidth={2.1} />} title="Business Fair · The Ultimate Startup Challenge 🏆" subtitle="Your 3-minute pitch builds itself from your founder pages. Practice, present — then a classmate decides whether to invest." onExit={onExit}>
      <Brief91 k="c8_pitch" />
      <HowTo>Each part has the sentences you will <b>say</b> (🎤). Add your closing line, press <b>Present</b>, and after presenting give your tablet to the classmate who listened. You need at least <b>5 of the 7 founder pages</b>.</HowTo>
      <div className="g91-portfolio g93-port">{PAGES93.map((p) => <span key={p.n} className={r[p.key] ? "on" : ""}><em>{r[p.key] ? p.e : "🔒"}</em><small>PAGE {p.n}</small><b>{p.t}</b></span>)}</div>
      {pages < 5 && <div className="p1-banner bad"><span>You have {pages}/7 founder pages. Finish at least 5 to present at the fair.</span></div>}
      <div className="g8-final g93-final" id="g8-final">
        <header><small>STARTUP DISTRICT · BUSINESS FAIR · INSTITUTO CREAR</small><h2>{B.S.logo} {B.S.name}</h2><p>Founder: <b>{studentName}</b> · {B.S.P.prod} · {pages}/7 founder pages</p></header>
        <div className="g8-fp-intro">🎤 {B.intro}</div>
        <div className="g8-fp-list">{B.parts.map((p, k) => <Part key={p.t} p={p} n={k + 1} />)}</div>
        <div className="g8-fp-intro end">🎤 {B.closing} {B.outro}</div>
      </div>
      <div className="p3-sentence edit"><span>💡 My closing line: the most important thing I learned as a founder is</span><input className="start-input" value={closing} onChange={(e) => setClosing(e.target.value)} placeholder="Write your answer here…" /></div>
      <div className="p3-card-actions"><button className="s1-btn primary" onClick={() => setSlide(0)}><Mic size={17} /> Present</button><button className="s1-btn ghost" onClick={() => downloadPNG("g8-final", `Pitch_${B.S.name}.png`)}><Download size={17} /> Download PNG</button></div>
      <div className="start-block g84-investor">
        <h3>🦈 Investor Day · for the classmate who listened</h3>
        <input className="start-input p3-gap" value={peer} onChange={(e) => setPeer(e.target.value)} placeholder="Investor's name (your classmate)" />
        {RUB_P8.map(([k, l]) => <div key={k} className="p3-rub"><div><b>{l}</b></div><span /><div className="p3-stars">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={stars[k] >= n ? "on" : ""} onClick={() => setStars({ ...stars, [k]: n })}>★</button>)}</div></div>)}
        <Ctl l="🪙 I invest (fictional)" v={amount} set={setAmount} mn={0} mx={20000000} stp={1000000} fmt={cop} />
        <div className="p3-sentence edit"><span>💬 I invest this amount because</span><input className="start-input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Write it here…" /></div>
        <p className="start-tip">⚖️ Invest for the IDEAS and the NUMBERS — not for the prettiest logo.</p>
      </div>
      {cert && (
        <div className="g93-cert" id="g93-cert">
          <small>INSTITUTO CREAR · FINANCIAL DISTRICT · SEASON 03</small>
          <h2>🏆 Young Entrepreneur Certificate</h2>
          <p>This certifies that</p><b>{studentName}</b>
          <p>founded <strong>{B.S.logo} {B.S.name}</strong>, built its business model, set a profitable price, raised investment and pitched it at the Startup District Business Fair.</p>
          <span>Investor score: {score}/25 · {new Date().toLocaleDateString("en-GB")}</span>
        </div>
      )}
      <div className="start-foot">{cert && <button className="s1-btn ghost" onClick={() => downloadPNG("g93-cert", "Young_Entrepreneur.png")}><Download size={16} /> Certificate PNG</button>}<button className="s1-btn primary big" disabled={!ready} onClick={() => { setCert(true); finish(50, { closing, peer: peer.trim(), stars, score, amount, why, pages }); }}>Get my certificate 🏆 <span className="coin-tag"><Coins size={15} /> +50</span></button></div>
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

/* ---------- BOSS · The Startup Boss ---------- */
function BossStartup({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [mis, setMis] = useState(0);
  return stage === 0 ? (
    <ActShell icon={<Swords size={22} strokeWidth={2.1} />} title="The Startup Boss · Part 1 ⚔️" subtitle="5 missions: opportunity, value, canvas, pricing and investors." onExit={onExit}>
      <Brief91 k="c8_boss" />
      <RoundsRunner rounds={BOSS_MISSIONS93} doneLabel="Part 2: 10 questions" onDone={(x) => { setMis(x.firstTry); setStage(1); }} />
    </ActShell>
  ) : (
    <QuizRunner title={`Startup Boss · Part 2 (missions: ${mis}/5 ⭐)`} emoji="⚔️" questions={BOSS_Q93} pickCount={10} passThreshold={70} xpPerCorrect={4} xpComplete={10 + Math.round(mis * 4)} onSave={(x) => onSave({ ...x, missions: mis })} onExit={onExit} />
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
const FPAGE = (n, words, needs, coins) => [[`Text: ${words} words with ${needs}`, "required"], [`Founder Page ${n} saved`, `+${coins} 🪙`]];
const GUIDE = {
  c1_brief: B_BRIEF("Learn how entrepreneurs turn everyday problems into business opportunities.", "Next: the Opportunity Radar — find opportunities in the city."),
  c1_radar: { goal: "Train your entrepreneur eyes: in 9 city scenes, find the problems that are real business opportunities.", steps: ["Tap the scenes that show an opportunity (a problem many people have, often).", "Press Scan to check.", "Choose one problem: who has it and how often?", "Write a first idea to solve it."], win: [["Each scene right", "+1 🪙"], ["A problem that happens every day (every week = +2)", "+3 🪙"], ["Finishing", "+10 🪙"]] },
  c1_city: { goal: "Listen to 5 citizens, find their REAL need and choose the best solution: useful, creative and viable.", steps: ["Choose a citizen and read their problem.", "Answer the questions about their need.", "Choose the best solution."], win: [["13+ points (10+ = +4)", "+8 🪙"], ["Each extra try (max −4)", "−2 🪙"], ["Finishing", "+20 🪙"]] },
  c1_map: { goal: "Found YOUR startup: problem, customers, name and logo. It grows every class until the Business Fair. This is Founder Page 11.", steps: ["Choose the problem you want to solve.", "Choose your customers.", "Give your startup a name and a logo.", "Explain why it matters (15–50 words)."], win: FPAGE("11", "15–50", "a reason", 30), tip: "Everybody starts with the same seed capital — your decisions make the difference." },
  c2_brief: B_BRIEF("Learn why people buy: they don't buy products — they buy solutions.", "Next: Sell Me This!"),
  c2_sell: { goal: "Sell a boring object in 45 seconds. Focus on the customer's problem, not on the object.", steps: ["Look at the object.", "Choose a customer and a benefit.", "Give it a name and say your pitch before the time ends.", "Repeat with 3 objects."], win: [["Each good pitch point", "+4 🪙"], ["Finishing", "+14 🪙"]] },
  c2_match: { goal: "Match each customer with the right product — and discover why some customers say “I wouldn't buy that”.", steps: ["Tap a customer, then the product for them.", "Check your matches.", "Answer the 2 surprise customers."], win: [["Each surprise customer right on the first try", "+3 🪙"], ["Finishing", "+18 🪙"]] },
  c2_surgery: { goal: "Operate on a bad value proposition, then write YOURS. This is Founder Page 12.", steps: ["Fix the 4 parts of the bad proposition.", "Choose your customer and your benefit.", "Write what makes your startup different."], win: [["A complete value proposition: customer, problem, benefit, difference", "required"], ["Founder Page 12 saved", "+28 🪙"]] },
  c3_brief: B_BRIEF("Learn the 9 blocks of a business model canvas: a whole business on one page.", "Next: rebuild Café Luna's canvas."),
  c3_puzzle: { goal: "Rebuild Café Luna's business model: put each piece in the right block of the canvas.", steps: ["Tap a piece.", "Tap the block where it belongs.", "Check your canvas."], win: [["Coins = 24 − 3 per mistake", "min +12 🪙"]] },
  c3_architect: { goal: "Build the canvas of YOUR startup. Each choice changes your costs — watch them. This is Founder Page 13.", steps: ["Choose an option for each block.", "Watch your monthly costs change.", "Choose your key partner."], win: [["All blocks completed", "required"], ["Founder Page 13 saved", "+30 🪙"]] },
  c3_investor: { goal: "An investor wants to help — with ONE condition. Change your canvas to meet it.", steps: ["Read the investor's condition.", "Choose what you change in your canvas.", "Explain why (10–40 words with a reason)."], win: [["Coins = 20 − 3 per wrong try", "min +14 🪙"], ["Explanation with “because”", "required"]] },
  c4_brief: B_BRIEF("Learn the three numbers behind every price: cost, margin and break-even.", "Next: the Pricing Machine."),
  c4_machine: { goal: "Build a price step by step: calculate the cost, choose a margin and serve 4 customers.", steps: ["Calculate the unit cost.", "Choose your margin.", "Set the price for each customer — or say “not for us”."], win: [["Finishing the 4 customers", "+26 🪙"]] },
  c4_war: { goal: "Fight 5 days against 2 rival burger shops. The lowest price doesn't always win — profit does.", steps: ["Set your price each day.", "Open the shops and see sales and profit.", "Adjust your price for the next day."], win: [["1st place in profit (2nd = +5)", "+10 🪙"], ["Finishing", "+20 🪙"]] },
  c4_mine: { goal: "Set the REAL price of YOUR startup, see your profit and your break-even. This is Founder Page 14.", steps: ["Move the price bar and watch sales and profit.", "Choose your strategy.", "Explain your price (20–60 words with 2 numbers)."], win: FPAGE("14", "20–60", "a reason and 2 numbers", 30) },
  c5_brief: B_BRIEF("Learn how investors think: money in exchange for a piece of your company.", "Next: Become the Shark."),
  c5_shark: { goal: "Be the investor: you have $100,000,000 and 4 startups. Then see what happened 3 years later.", steps: ["Calculate the valuations.", "Choose where you invest and how much.", "Fast-forward 3 years and see your return."], win: [["Return above 30% (above 0% = +5)", "+10 🪙"], ["Finishing", "+20 🪙"]] },
  c5_equity: { goal: "Practice the math of investors and founders: valuation, equity and ownership.", steps: ["Solve 5 calculations.", "A hint appears after a mistake."], win: [["Each answer right on the first try", "+3 🪙"], ["Finishing", "+9 🪙"]] },
  c5_negotiate: { goal: "Ask an investor for money for YOUR startup — and protect your ownership. This is Founder Page 15.", steps: ["Choose your arguments.", "Make an offer: amount and %.", "Read the counteroffer and decide.", "Explain your deal (12–45 words with a number)."], win: FPAGE("15", "12–45", "a reason and a number", 30), tip: "Accepting a bad deal is worse than no deal." },
  c6_brief: B_BRIEF("Learn honest marketing: the right message, for the right people, in the right place.", "Next: Marketing Detective."),
  c6_detective: { goal: "Analyze 4 ads like a detective: who is the target, which emotion do they use, and are they honest?", steps: ["For each ad choose the target and the emotion.", "Decide: honest or misleading? If misleading, choose the trick.", "Reveal the truth."], win: [["Right target", "+1 🪙"], ["Right emotion", "+1 🪙"], ["Honest or misleading — right", "+1 🪙"], ["Right trick (misleading ads)", "+1 🪙"], ["Finishing", "+12 🪙"]] },
  c6_ai: { goal: "Decide if 5 AI-made posts can be published, need fixing or should never be published.", steps: ["Read each post.", "Choose: publish, fix or never.", "Choose the reason."], win: [["Each right decision", "+2 🪙"], ["Each right reason", "+1 🪙"], ["Finishing", "+12 🪙"]] },
  c6_campaign: { goal: "Launch an honest campaign for YOUR startup with a $1,000,000 budget. This is Founder Page 16.", steps: ["Choose a platform that your customers use.", "Choose your message and your visual.", "Choose a call to action and split your budget.", "Launch and see reach, sales and reputation."], win: [["Budget ≤ $1,000,000", "required"], ["Reputation 70+", "+6 🪙"], ["Message that fits your customer", "+4 🪙"], ["Founder Page 16 saved", "+20 🪙"]] },
  c7_brief: B_BRIEF("Learn SMART goals, emergency funds and why you must separate personal and business money.", "Next: Your Life at 25."),
  c7_life: { goal: "Live 6 months of your life at 25: a salary, a budget and surprises. This is Founder Page 17.", steps: ["Split your salary into buckets.", "Each month a surprise arrives: decide what to do.", "See your 6 months.", "Write your plan (20–70 words)."], win: [["Each good month", "+2 🪙"], ["Text: 20–70 words with a reason and numbers", "required"], ["Founder Page 17 saved", "+20 🪙"]] },
  c7_smart: { goal: "Turn 4 wishes into SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound.", steps: ["Choose the SMART version of each wish.", "Calculate how much to save per month."], win: [["Each answer right on the first try", "+2 🪙"], ["Finishing", "+12 🪙"]] },
  c7_rush: B_RUSH("Decide fast: is it personal money or business money? Clean money = clear numbers."),
  c8_escape: { goal: "Save TacoLab! Use everything from the period to open 5 locks and find the code.", steps: ["Solve each lock (a hint appears after a mistake).", "Write down each 🔑 digit.", "Enter the 5-digit code."], win: [["Each lock right on the first try", "+3 🪙"], ["Opening the door", "+20 🪙"]] },
  c8_pitch: { goal: "The final project: pitch YOUR startup in 3 minutes at the Business Fair. A classmate decides if they invest.", steps: ["Read your pitch: it builds itself from your Founder Pages.", "Write your closing line.", "Press Present and speak (3 minutes).", "Your classmate scores you and decides how much to invest."], win: [["😣 Real problem & opportunity", "★ 1–5"], ["💎 Clear value proposition", "★ 1–5"], ["🏷️ Realistic numbers", "★ 1–5"], ["📣 Honest marketing", "★ 1–5"], ["🎤 Clear pitch in English", "★ 1–5"], ["You need 5 of the 7 Founder Pages", "required"]] },
  c8_boss: { goal: "Show everything you learned about startups: opportunities, value, canvas, pricing and investors.", steps: ["Part 1: 5 missions with numbers (a hint appears after a mistake).", "Part 2: 10 questions."], win: [["70% or more in Part 2", "to pass"], ["Each mission right on the first try", "+4 🪙"], ["Each correct question", "+4 🪙"]] },
};

/* =====================================================================
   ESTRUCTURA DEL PERIODO 3 · 9° (clases 1–8 · 4 actividades cortas por clase)
   ===================================================================== */
const A = (key, title, desc, icon, coins, bucket) => ({ key, title, desc, icon, coins, bucket });
const G9P3_WEEKS = [
  { n: 1, g: "1", title: "The Problem Hunters", blurb: "Find real problems in the district — and found YOUR startup.", e: "🔎", skills: ["Explainer", "Radar"], acts: [
    A("c1_brief", "Explainer: From Problems to Opportunities 💡", "A 5-minute read + 6 quick questions.", <BookOpen size={22} />, 34, "quizzes"),
    A("c1_radar", "Opportunity Radar 📡", "9 city scenes · which ones are opportunities?", <Target size={22} />, 22, "aprendi"),
    A("c1_city", "The City Is Broken 🏙️", "5 citizens · find the need · choose a solution.", <Building2 size={22} />, 28, "aprendi"),
    A("c1_map", "My Opportunity Map 🗺️ · Page 11", "Found your startup: problem, customers, name, logo.", <MapIcon size={22} />, 30, "aprendi"),
  ] },
  { n: 2, g: "2", title: "Why Would Anyone Buy It?", blurb: "Turn boring objects into products — and write your value proposition.", e: "💎", skills: ["Explainer", "Pitch"], acts: [
    A("c2_brief", "Explainer: Why Would Anyone Buy It? 💡", "A 5-minute read + 6 quick questions.", <BookOpen size={22} />, 34, "quizzes"),
    A("c2_sell", "Sell Me This! 🎤", "3 objects · 45 seconds each.", <Mic size={22} />, 26, "aprendi"),
    A("c2_match", "Customer vs. Product 🤝", "Match + 2 customers who say “I wouldn't buy that”.", <Users size={22} />, 24, "aprendi"),
    A("c2_surgery", "Value Proposition Surgery 💎 · Page 12", "Fix a bad proposition — then write yours.", <Sparkles size={22} />, 28, "aprendi"),
  ] },
  { n: 3, g: "3", title: "Build Your Empire", blurb: "Nine blocks, one page — and every decision has consequences.", e: "🧩", skills: ["Explainer", "Canvas"], acts: [
    A("c3_brief", "Explainer: The 9 Blocks 💡", "A 5-minute read + 6 quick questions.", <BookOpen size={22} />, 34, "quizzes"),
    A("c3_puzzle", "Business Model Puzzle ☕", "Rebuild Café Luna's canvas.", <Puzzle size={22} />, 24, "aprendi"),
    A("c3_architect", "Startup Architect 🧩 · Page 13", "Build YOUR canvas · watch the costs.", <Layers size={22} />, 30, "aprendi"),
    A("c3_investor", "The Unexpected Investor 💼", "One condition — change your canvas.", <Briefcase size={22} />, 24, "aprendi"),
  ] },
  { n: 4, g: "4", title: "The Price War on 10th Street", blurb: "Costs, margins, break-even — and a burger war.", e: "🏷️", skills: ["Explainer", "Battle"], acts: [
    A("c4_brief", "Explainer: The Price Is Right? 💡", "A 5-minute read + 6 quick questions.", <BookOpen size={22} />, 34, "quizzes"),
    A("c4_machine", "The Pricing Machine 🏷️", "Build the cost · choose a margin · 4 customers.", <Calculator size={22} />, 26, "aprendi"),
    A("c4_war", "The Price War 🍔", "5 days against 2 rival shops.", <Swords size={22} />, 30, "aprendi"),
    A("c4_mine", "My Pricing Strategy 🏷️ · Page 14", "Your real costs, your price, your profit.", <TrendingUp size={22} />, 30, "aprendi"),
  ] },
  { n: 5, g: "5", title: "The Investor Arena", blurb: "Be the shark — then sit on the other side of the table.", e: "🦈", skills: ["Explainer", "Negotiation"], acts: [
    A("c5_brief", "Explainer: How Investors Think 💡", "A 5-minute read + 6 quick questions.", <BookOpen size={22} />, 34, "quizzes"),
    A("c5_shark", "Become the Shark 🦈", "$100,000,000 · 4 startups · 3 years later.", <Briefcase size={22} />, 34, "aprendi"),
    A("c5_equity", "Equity Math 🧮", "5 investor calculations.", <Calculator size={22} />, 24, "aprendi"),
    A("c5_negotiate", "The Negotiation Room 🤝 · Page 15", "Ask an investor for money for YOUR startup.", <Handshake size={22} />, 30, "aprendi"),
  ] },
  { n: 6, g: "6", title: "Marketing Agency", blurb: "Honest ads, responsible AI — and your viral campaign.", e: "📣", skills: ["Explainer", "Campaign"], acts: [
    A("c6_brief", "Explainer: Marketing That Tells the Truth 💡", "A 5-minute read + 6 quick questions.", <BookOpen size={22} />, 34, "quizzes"),
    A("c6_detective", "Marketing Detective 🕵️", "4 ads · target, emotion, honest?", <Search size={22} />, 26, "aprendi"),
    A("c6_ai", "AI or Human? 🤖", "5 posts · publish, fix or never.", <Brain size={22} />, 27, "aprendi"),
    A("c6_campaign", "Build a Viral Campaign 📣 · Page 16", "Platform, message, visual, budget — launch!", <Megaphone size={22} />, 30, "aprendi"),
  ] },
  { n: 7, g: "7", title: "Life at 25", blurb: "Your money at 25, SMART goals — and personal vs. business money.", e: "🧑‍💼", skills: ["Explainer", "Simulator"], acts: [
    A("c7_brief", "Explainer: Your Life at 25 💡", "A 5-minute read + 6 quick questions.", <BookOpen size={22} />, 34, "quizzes"),
    A("c7_life", "Your Life at 25 🧑‍💼 · Page 17", "Budget + 6 months of surprises.", <Briefcase size={22} />, 32, "aprendi"),
    A("c7_smart", "The SMART Goals Factory 🏭", "4 wishes → 4 SMART goals with numbers.", <Target size={22} />, 28, "aprendi"),
    A("c7_rush", "Personal or Business? Rush ⚡", "12 transactions · 4 boxes.", <Zap size={22} />, 24, "aprendi"),
  ] },
  { n: 8, g: "8", title: "Business Fair", blurb: "Escape the room, pitch your startup — and beat the Startup Boss.", e: "🏆", skills: ["Escape room", "Speaking"], acts: [
    A("c8_escape", "Startup Escape Room 🔓", "Save TacoLab · 5 locks · one code.", <KeyRound size={22} />, 35, "aprendi"),
    A("c8_pitch", "Business Fair 🏆", "Your 3-minute pitch · investor day · certificate.", <Award size={22} />, 50, "aprendi"),
    A("c8_boss", "The Startup Boss ⚔️", "5 missions + 10 questions (70%).", <Swords size={22} />, 70, "quizzes"),
  ] },
];
const ALL_ACTS93 = G9P3_WEEKS.flatMap((w) => w.acts);
const TOTAL_ACTS93 = ALL_ACTS93.length;
const PAGE_ACTS93 = [...PAGES93.map((p) => p.key), "c8_pitch"];

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Periodo3G9 = ({ userData, API_URL, existingRow, onBack }) => {
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
  /* Filas del Periodo 1 (ciudadano) y Periodo 2 (patrimonio personal): continúan */
  const p1 = parseJSON(store.semanas?.["9P1"]?.Respuestas_JSON);
  const p2 = parseJSON(store.semanas?.["9P2"]?.Respuestas_JSON);
  const resp = { ...(respRef.current || {}), __p1: p1, __p2: p2 };
  const doneCount = ALL_ACTS93.filter((a) => checklist[a.key]).length;
  const pctDone = Math.round((doneCount / TOTAL_ACTS93) * 100);
  const weekDone = (w) => w.acts.every((a) => checklist[a.key]);
  const coinsTotal = Math.round(points.comportamiento + points.quizzes + points.aprendi);

  const persist = (nextChecklist, nextPoints, respPatch) => {
    respRef.current = { ...respRef.current, ...respPatch };
    const done = ALL_ACTS93.filter((a) => nextChecklist[a.key]).length;
    const row = {
      Student_Key: userData.Student_Key, Semana: PERIOD_KEY, Grado: GRADE,
      Estado: done >= TOTAL_ACTS93 ? "completed" : "in_progress",
      Porcentaje: Math.round((done / TOTAL_ACTS93) * 100),
      Puntos_Comportamiento: nextPoints.comportamiento, Puntos_Quizzes: nextPoints.quizzes, Puntos_Aprendi: nextPoints.aprendi,
      Checklist_JSON: JSON.stringify(nextChecklist), Respuestas_JSON: JSON.stringify(respRef.current),
    };
    const prev = store.semanas?.[PERIOD_KEY];
    dispatch({ type: "save_progreso", payload: row }); // OPTIMISTA
    fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "save_progreso", data: row }) })
      .catch((e) => { console.error("Error guardando 9° Periodo 3:", e); dispatch({ type: "rollback_progreso", payload: { Semana: PERIOD_KEY, prev } }); });
  };
  const complete = (key, bucket, xp, respPatch, pass = true) => {
    const already = !!checklist[key];
    const nextChecklist = { ...checklist, [key]: already || pass };
    const nextPoints = already ? points : { ...points, [bucket]: points[bucket] + (xp || 0) };
    setChecklist(nextChecklist); setPoints(nextPoints);
    persist(nextChecklist, nextPoints, respPatch);
    return Promise.resolve();
  };
  const WRAP = "s1 p1 p2 p3 p4 g7 g72 g73 g74 g8 g82 g83 g84 g9 g91 g92 g93";

  if (act) {
    const def = ALL_ACTS93.find((a) => a.key === act);
    const exit = () => setAct(null);
    const save = (r) => complete(act, def.bucket, r.xp, { [act]: { ...r, at: nowISO() } }, r.passed !== false);
    const reading = (tag, title, subtitle, sections, glossary, questions, emoji) => (
      <ReadThen tag={tag} title={title} subtitle={subtitle} minutes={8} sections={[{ node: <Brief91 key="guide" k={act} /> }, ...sections]} glossary={glossary} onExit={exit} finishLabel="I read it — start the quiz (8 questions)">
        <QuizRunner title={`${title} · check`} emoji={emoji} questions={questions} pickCount={8} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
      </ReadThen>
    );
    const brief = (title, subtitle, sections, glossary, questions, emoji) => (
      <ReadThen tag="EXPLAINER · B1+ · 5 MIN" title={title} subtitle={subtitle} minutes={5} sections={[{ node: <Brief91 key="guide" k={act} /> }, ...sections]} glossary={glossary} onExit={exit} finishLabel="I understand — quick check (6 questions)">
        <QuizRunner title={`${title} · quick check`} emoji={emoji} questions={questions} pickCount={6} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
      </ReadThen>
    );
    const video = (src, title, qs) => <VideoQuiz intro={<Brief91 k={act} />} src={src} title={title} questions={qs} pickCount={8} onSave={save} onExit={exit} />;
    const starter = (title, subtitle, data, coins = 20) => <StarterPack intro={<Brief91 k={act} />} title={title} subtitle={subtitle} cards={data.cards} pairs={data.pairs} rounds={data.rounds} coins={coins} onSave={save} onExit={exit} />;
    const rush = (title, subtitle, data, doneTitle, seconds = 60) => <SpeedSort intro={<Brief91 k={act} />} title={title} subtitle={subtitle} buckets={data.buckets} items={data.items} seconds={seconds} doneTitle={doneTitle} onSave={save} onExit={exit} />;
    let view = null;
    switch (act) {
      case "c1_brief": view = brief("From Problems to Opportunities", "Every business starts with a problem.", BRIEF_1, GLOSS_B1, Q_B1, "💡"); break;
      case "c1_radar": view = <OppRadar onSave={save} onExit={exit} />; break;
      case "c1_city": view = <CityBroken onSave={save} onExit={exit} />; break;
      case "c1_map": view = <OpportunityMap resp={resp} existing={resp.c1_map} onSave={save} onExit={exit} />; break;
      case "c2_brief": view = brief("Why Would Anyone Buy It?", "People don't buy products — they buy solutions.", BRIEF_2, GLOSS_B2, Q_B2, "💎"); break;
      case "c2_sell": view = <SellMeThis onSave={save} onExit={exit} />; break;
      case "c2_match": view = <CustomerMatch onSave={save} onExit={exit} />; break;
      case "c2_surgery": view = <VPSurgery resp={resp} existing={resp.c2_surgery} onSave={save} onExit={exit} />; break;
      case "c3_brief": view = brief("The 9 Blocks", "A business on one page.", BRIEF_3, GLOSS_B3, Q_B3, "🧩"); break;
      case "c3_puzzle": view = <CanvasPuzzle onSave={save} onExit={exit} />; break;
      case "c3_architect": view = <CanvasArchitect resp={resp} existing={resp.c3_architect} onSave={save} onExit={exit} />; break;
      case "c3_investor": view = <UnexpectedInvestor resp={resp} onSave={save} onExit={exit} />; break;
      case "c4_brief": view = brief("The Price Is Right?", "Three numbers behind every price.", BRIEF_4, GLOSS_B4, Q_B4, "🏷️"); break;
      case "c4_machine": view = <PricingMachine onSave={save} onExit={exit} />; break;
      case "c4_war": view = <PriceWar onSave={save} onExit={exit} />; break;
      case "c4_mine": view = <MyPricing resp={resp} existing={resp.c4_mine} onSave={save} onExit={exit} />; break;
      case "c5_brief": view = brief("How Investors Think", "Money in exchange for a piece of your company.", BRIEF_5, GLOSS_B5, Q_B5, "🦈"); break;
      case "c5_shark": view = <BecomeShark onSave={save} onExit={exit} />; break;
      case "c5_equity": view = <NumberRounds intro={<Brief91 k={act} />} icon={<Calculator size={22} strokeWidth={2.1} />} title="Equity Math 🧮" subtitle="Think like an investor — and like a founder." rounds={EQUITY_P5} coinsPer={3} bonus={9} doneTitle="Equity expert! 🧮" onSave={save} onExit={exit} />; break;
      case "c5_negotiate": view = <Negotiation resp={resp} existing={resp.c5_negotiate} onSave={save} onExit={exit} />; break;
      case "c6_brief": view = brief("Marketing That Tells the Truth", "The right message, the right people, the right place — honestly.", BRIEF_6, GLOSS_B6, Q_B6, "📣"); break;
      case "c6_detective": view = <MarketingDetective onSave={save} onExit={exit} />; break;
      case "c6_ai": view = <AIorHuman onSave={save} onExit={exit} />; break;
      case "c6_campaign": view = <CampaignBuilder resp={resp} existing={resp.c6_campaign} onSave={save} onExit={exit} />; break;
      case "c7_brief": view = brief("Your Life at 25", "SMART goals, emergency funds and clean business money.", BRIEF_7, GLOSS_B7, Q_B7, "🧑‍💼"); break;
      case "c7_life": view = <LifeAt25 resp={resp} existing={resp.c7_life} onSave={save} onExit={exit} />; break;
      case "c7_smart": view = <SmartGoals onSave={save} onExit={exit} />; break;
      case "c7_rush": view = rush("Personal or Business? Rush ⚡", "Whose money is it?", RUSH_P7, "Clean money pro! 🧼", 75); break;
      case "c8_escape": view = <StartupEscape onSave={save} onExit={exit} />; break;
      case "c8_pitch": view = <BusinessFair resp={resp} studentName={name} existing={resp.c8_pitch} onSave={save} onExit={exit} />; break;
      case "c8_boss": view = <BossStartup onSave={save} onExit={exit} />; break;
      default: view = null;
    }
    return <div className={WRAP}>{view}</div>;
  }

  if (week) {
    const w = G9P3_WEEKS.find((x) => x.n === week);
    const wDone = w.acts.filter((a) => checklist[a.key]).length;
    const next = G9P3_WEEKS[G9P3_WEEKS.indexOf(w) + 1];
    return (
      <div className={WRAP}>
        <button className="s1-back" onClick={() => setWeek(null)}><ArrowLeft size={18} strokeWidth={2.4} /> Back to Period 3</button>
        <div className="s1-hero p1-week-hero g7-hero g8-hero g91-hero g93-hero">
          <span className="s1-tag">{w.e} GRADE 9 · PERIOD 3 · CLASS {w.g}</span>
          <h1>{w.title}</h1>
          <p>{w.blurb}</p>
          <div className="s1-progress"><div className="bar"><i style={{ width: `${(wDone / w.acts.length) * 100}%` }} /></div><span className="pill">{wDone}/{w.acts.length}</span></div>
        </div>
        <StartupPanel resp={resp} compact />
        <div className="s1-quest">
          {w.acts.map((a) => (
            <div key={a.key} className={`act-card ${checklist[a.key] ? "done" : ""} ${PAGE_ACTS93.includes(a.key) ? "g8-page-act" : ""} ${a.title.startsWith("Starter") ? "g8-starter-act" : ""} ${a.key.endsWith("_rush") ? "g8-rush-act" : ""} ${a.key.endsWith("_read") || a.key.endsWith("_video") || a.key.endsWith("_listen") ? "g73-learn-act" : ""}`}>
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
      <div className="s1-hero p1-hero g7-hero g8-hero g91-hero g93-hero">
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> ADMIN PREVIEW · GRADE {GRADE} · PERIOD 3</span>
        <h1>Startup District 🚀</h1>
        <p>How can we turn a real problem into a business that creates value, makes a profit and communicates honestly?</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pctDone}%` }} /></div><span className="pill">{pctDone}%</span></div>
        <div className="p1-hero-chips"><span><Coins size={14} /> {coinsTotal} coins</span><span><Check size={14} /> {doneCount}/{TOTAL_ACTS93} activities</span><span>🚀 Season 03</span><span>🧾 Founder Pages 11–17</span><span>🏆 Young Entrepreneur</span></div>
      </div>
      <div className="g8-howyear"><b>🧭 This period:</b><span>Season 03 of the Financial District: less watching, more doing. In Class 1 you found ONE startup to solve a real problem of the district. Every class, the same startup grows: its value proposition, its business model canvas, its price, its investors and its marketing campaign. Every founder starts with the same seed capital ({cop(SEED93)}) — your decisions make the difference. Seven missions become Founder Pages 11–17, and at the Business Fair you pitch your startup to investors.</span></div>
      <StartupPanel resp={resp} studentName={name} />
      {checklist.c8_pitch && <button type="button" className="p3-card-link" onClick={() => setAct("c8_pitch")}><Award size={18} /> See my pitch & certificate <ChevronRight size={16} /></button>}
      <div className="p1-passport">
        <div className="p1-passport-head"><b>🚀 Founder Pass</b><span>Finish a class to get its stamp</span></div>
        <div className="p1-stamps">{G9P3_WEEKS.map((w) => <button key={w.n} type="button" className={`p1-stamp ${weekDone(w) ? "done" : ""}`} onClick={() => setWeek(w.n)} title={w.title}><em>{w.e}</em><small>{w.g}</small></button>)}</div>
      </div>
      <div className="p1-weeks">
        {G9P3_WEEKS.map((w) => {
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