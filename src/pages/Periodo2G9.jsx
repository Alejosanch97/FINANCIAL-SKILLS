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
import "../Styles/noveno2.css";   // 9° · Periodo 2 · The Product Lab
import useGlobalReducer from "../hooks/useGlobalReducer";
import audioProductLab from "../assets/img/noveno2.mp3"; // 🎧 Listening clase 1
import audioScamCall from "../assets/img/periodo2.mp3"; // 🎧 Listening clase 8

/* =====================================================================
   GRADO 9 · PERIODO 2 · SMART FINANCIAL CHOICES (B1–B1+)
   Clases 1–8 · Pregunta guía: How can banking services, financial products
   and responsible decisions help young people build a secure financial future?
   Hilo: FINANCIAL DISTRICT · Season 01 — un distrito simulado (todo en código):
   el District Bank y tu cuenta empiezan IGUAL para todos y cambian con TUS decisiones.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "9P2" (lee también "9P1"), Grado = "9".
   ===================================================================== */
const PERIOD_KEY = "9P2";
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
  const p = PAGES92.find((x) => x.n === n);
  if (!p) return null;
  return <div className="g8-bpbadge g91-badge"><span>🧾 ADVISOR PAGE {p.n}</span><b>{p.e} {p.t}</b></div>;
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
   PERIODO 2 · 9° · VIDEOS (10–12 → 8 al azar) + LECTURAS (12 → 8) + LISTENINGS
   Opciones: correcta (nunca la más larga) · parecida pero errada (la más larga)
             · trampa corta (errada) · nada que ver
   ===================================================================== */
const VID_CARDS = "https://res.cloudinary.com/y9r84vgz/video/upload/v1793482267/videoplayback_35.mp4";
const VID_FUND = "https://res.cloudinary.com/y9r84vgz/video/upload/v1793482366/videoplayback_36.mp4";
const VID_FINTECH = "https://res.cloudinary.com/y9r84vgz/video/upload/v1793482434/videoplayback_37.mp4";
const VID_CHAIN = "https://res.cloudinary.com/y9r84vgz/video/upload/v1793482578/videoplayback_38.mp4";

/* ---------- v35 · Credit vs Debit Cards (clase 2) ---------- */
const VQ_CARDS = [
  { q: "What is the main difference between a credit card and a debit card?", options: ["Credit borrows money; debit uses your own money", "A credit card only works online, while a debit card only works at ATMs in the street", "Debit cards charge 30% interest", "The government issues credit cards"], correct: 0, feedback: "Credit = you borrow from the card provider. Debit = money leaves your own account." },
  { q: "What happens if you don't pay your credit card balance in full and on time?", options: ["Your debt grows with fees and interest", "The bank changes your credit card into a debit card automatically, with no extra cost", "Your credit rating goes up", "The government pays it"], correct: 0, feedback: "Interest + late fees make the debt grow fast." },
  { q: "What is a big benefit of using a credit card responsibly?", options: ["It helps your credit rating for future loans", "It lets you spend unlimited money every month without ever paying it back to the bank", "It removes taxes", "It fills your account"], correct: 0, feedback: "Paying on time builds a good credit history." },
  { q: "What perks do many credit card providers offer?", options: ["Loyalty points and cashback", "Free houses, free cars and guaranteed profits in the stock market for every customer", "No fees forever", "Free flights always"], correct: 0, feedback: "Rewards encourage you to use the card — be careful!" },
  { q: "What is the main advantage of a debit card about debt?", options: ["You spend only what you have — no debt", "You receive a cash bonus from the bank every time your account balance gets to zero", "You get cheap loans", "You never need a bank account"], correct: 0, feedback: "You can't spend money you don't have (unless you use an overdraft)." },
  { q: "How is a debit card similar to cash?", options: ["It uses your own money, but it's more convenient", "It creates a short-term loan with very high interest every time you pay at a shop", "It borrows from the central bank", "It's slower than cash"], correct: 0, feedback: "Like digital cash." },
  { q: "What can happen if you use an overdraft with your debit card?", options: ["Your balance goes negative and you borrow at a high cost", "The bank upgrades your debit card to a platinum credit card with a higher limit as a prize", "Fees disappear", "You earn interest"], correct: 0, feedback: "Overdraft = expensive borrowing." },
  { q: "Why can a credit card help in an emergency (like a car repair)?", options: ["You can pay even without money in the bank today", "Because the government gives every cardholder a free emergency grant for repairs", "It repairs the car", "It removes taxes"], correct: 0, feedback: "A cushion — but you must repay it." },
  { q: "What do both cards offer compared with paper cash?", options: ["More security and convenience", "Complete anonymity, so nobody can ever know what you bought or where you were", "No taxes", "Inflation protection"], correct: 0, feedback: "Lost cash is gone; a card can be blocked." },
  { q: "How do credit cards usually compare with debit cards in fraud protection?", options: ["Credit cards usually offer more protection", "Debit cards give total legal immunity while credit cards give zero protection to customers", "They are identical", "Neither protects you"], correct: 0, feedback: "With credit, the disputed money is the bank's, not yours — rules vary by country." },
];

/* ---------- v36 · Mutual Funds (clase 4) ---------- */
const VQ_FUND = [
  { q: "What is a mutual fund?", options: ["A mix of stocks, bonds and cash run by a professional", "A single high-risk stock that only day traders can buy and sell during the morning", "A government crypto", "A gold vault"], correct: 0, feedback: "Many investors' money pooled and managed by a professional." },
  { q: "What are the two main reasons people choose mutual funds?", options: ["Easy diversification and professional management", "Guaranteed tax-free returns and absolutely no management fees for any type of investor", "Control of companies", "High leverage"], correct: 0, feedback: "Many assets in one product + an expert." },
  { q: "10 people invest $1,000 each in Will's fund. How much does the fund have?", options: ["$10,000", "$100,000, because the manager multiplies every investment by ten when the fund starts", "$1,000", "$1,100"], correct: 0, feedback: "10 × $1,000 = $10,000." },
  { q: "What is the value of each share of the fund called?", options: ["Net asset value (NAV)", "Corporate equity par value, which is fixed by law and never changes during the year", "Liquidity rate", "Dividend yield"], correct: 0, feedback: "NAV = total assets ÷ number of shares." },
  { q: "What do we call all the stocks, bonds and cash that the fund holds?", options: ["Assets under management (AUM)", "Sovereign debt liabilities that the fund must pay back to the government every month", "Retained earnings", "Reserves"], correct: 0, feedback: "AUM = everything the fund manages." },
  { q: "How does the fund manager usually get paid?", options: ["A small % fee on assets under management", "A fixed salary that the central bank pays to every fund manager in the country", "An hourly rate", "100% of the profit"], correct: 0, feedback: "The AUM fee — that's why fees matter!" },
  { q: "Will's fund grows from $10,000 to $11,000. How much profit does each of the 10 investors make?", options: ["$100", "$1,000, because every investor receives the full profit of the fund for themselves", "$10", "$1,100"], correct: 0, feedback: "$1,000 ÷ 10 = $100 each." },
  { q: "A fund raises a fixed amount and doesn't accept new money. What type is it?", options: ["A closed-ended fund", "An open-ended index fund that accepts new investors every single day of the year", "A bank", "A pension"], correct: 0, feedback: "Closed-ended = fixed capital." },
  { q: "How do you exit a closed-ended fund?", options: ["Sell your shares to another investor", "Ask the federal government for an immediate cash refund of the full original amount", "Destroy the certificate", "You can never exit"], correct: 0, feedback: "You trade them on the exchange." },
  { q: "Which assets are usually inside a mutual fund?", options: ["Stocks, bonds, cash and other securities", "Only real estate mortgages and commercial vehicles that the manager buys every year", "Only gold", "Credit card debt"], correct: 0, feedback: "A diversified mix." },
  { q: "Why is diversification good for everyday investors?", options: ["It reduces risk compared with one single stock", "It guarantees risk-free returns every month and removes every fee of the fund", "It avoids rules", "It doubles the money"], correct: 0, feedback: "If one company fails, the others cushion the loss." },
  { q: "What does the professional manager do?", options: ["Makes buy-and-sell decisions for investors", "Guards the investors' cash inside a mattress and prints new money when the fund needs it", "Pays your bills", "Sets taxes"], correct: 0, feedback: "Expert decisions on behalf of the group." },
];

/* ---------- v37 · What is FinTech? (clase 6) ---------- */
const VQ_FINTECH = [
  { q: "What does “FinTech” stand for?", options: ["Financial technology", "Federal interest tax calculations made by the government every year for the banks", "Fixed currency codes", "Finance techniques"], correct: 0, feedback: "Apps and platforms that change financial services." },
  { q: "Which is an example of FinTech from the video?", options: ["Cashless payments, crowdfunding, robo-advisors", "Printing paper checks in central bank presses and manual bookkeeping by accountants", "Gold bars", "Coin collections"], correct: 0, feedback: "Tech-driven financial services." },
  { q: "Which two regions lead consumer adoption of FinTech?", options: ["China and India", "Western Europe and North America, because they have the oldest banks in the world", "Australia", "The Caribbean"], correct: 0, feedback: "More than half of consumers there use FinTech." },
  { q: "How does FinTech help the 2 billion people without bank accounts?", options: ["Loans and insurance with only a mobile phone", "By mailing physical cash and paper credit cards to their homes every single month", "Building branches", "Closing banks"], correct: 0, feedback: "A phone replaces the branch." },
  { q: "What is the name of Kenya's mobile money system?", options: ["M-Pesa", "Kickstarter, a mobile bank created by the government of Kenya for farmers", "Venmo", "Alipay"], correct: 0, feedback: "M-Pesa: transfers, bills and loans on the phone." },
  { q: "What impact did M-Pesa have in Kenya, according to studies?", options: ["About 2% of households left extreme poverty", "It eliminated national inflation and paid all the government debt in only one year", "It doubled oil exports", "Nothing"], correct: 0, feedback: "Access to finance created opportunities." },
  { q: "What are robo-advisors?", options: ["Automated, cheaper investment advice 24/7", "Physical robots that guard bank vaults at night against robberies in big cities", "Human brokers", "Regulators"], correct: 0, feedback: "Algorithms that plan investments." },
  { q: "What is a risk of peer-to-peer (P2P) lending platforms?", options: ["They may keep fewer reserves if borrowers default", "They charge illegal 100% daily interest to every user and only accept gold as payment", "The government owns them", "None"], correct: 0, feedback: "Rules may be weaker than for banks." },
  { q: "What security risk grows as finance goes digital?", options: ["Cyberattacks and data breaches", "The physical destruction of marble bank buildings by earthquakes and natural disasters", "Fake paper bills", "Lost keys"], correct: 0, feedback: "Protect your data and passwords." },
  { q: "Which big companies entered FinTech (like Apple Pay or Alipay)?", options: ["Apple and Alibaba", "Microsoft and Intel, with their own national currencies for every country", "Tesla and SpaceX", "Boeing and Airbus"], correct: 0, feedback: "Tech giants now offer payments." },
  { q: "Why did traditional banks have to adopt digital technology?", options: ["To compete with FinTech startups", "Because central banks made paper money illegal in every country of the world", "To fire everyone", "Tech companies bought them all"], correct: 0, feedback: "Customers changed their habits." },
  { q: "What happened to FinTech investment in recent years?", options: ["It grew into the billions, mostly payments and lending", "It dropped to zero because consumers rejected mobile apps and returned to cash only", "It moved to farming", "It was banned"], correct: 0, feedback: "Payments and lending got most of the money." },
];

/* ---------- v38 · What is Blockchain? (clase 7) ---------- */
const VQ_CHAIN = [
  { q: "What is a blockchain?", options: ["A digital ledger shared by thousands of computers", "A central vault owned only by international central banks to store all the gold", "A paper warehouse", "An email app"], correct: 0, feedback: "Distributed: many copies, no single owner." },
  { q: "What happens when a block fills up with transactions?", options: ["It is sealed and linked to the previous block", "It is deleted from the network to save space and sent to the tax authority", "It becomes cash", "Nothing"], correct: 0, feedback: "Locked with cryptographic proof and chained." },
  { q: "Which property means blockchain records are almost impossible to change?", options: ["Immutability", "Volatility, because the price of the records changes every minute on the market", "Liquidity", "Centralization"], correct: 0, feedback: "Changing the past = rewriting every copy." },
  { q: "Who verifies transactions instead of a bank?", options: ["Independent computers called nodes", "Government regulators working inside the central bank offices every day of the week", "Loan officers", "Accountants"], correct: 0, feedback: "Nodes double-check everything." },
  { q: "What is a block's unique digital fingerprint called?", options: ["A cryptographic hash", "A fractional reserve code that the bank prints on every new transaction", "A fiat token", "An asset key"], correct: 0, feedback: "Change the data → the hash changes." },
  { q: "What is the network's agreement to add a new block called?", options: ["Consensus", "Liquidation, when all the blocks are sold to the highest bidder in an auction", "Amortization", "Securitization"], correct: 0, feedback: "Everyone agrees on one version of the truth." },
  { q: "Which consensus does Bitcoin use, with miners competing with computing power?", options: ["Proof of work", "Proof of identity, where every user shows a passport to the network before buying", "Proof of stake", "Proof of authority"], correct: 0, feedback: "Miners solve puzzles using lots of energy." },
  { q: "How is Ethereum's proof of stake different?", options: ["Validators are chosen by how much crypto they stake", "It requires physical gold deposits and approval from the central bank for each block", "No fees ever", "It uses miners"], correct: 0, feedback: "“Skin in the game” instead of mining machines." },
  { q: "What can smart contracts do?", options: ["Run transactions automatically when conditions are met", "Print paper money in central mints and file the taxes of every company automatically", "Review loans by hand", "Nothing"], correct: 0, feedback: "Code that executes itself." },
  { q: "What is the big idea of blockchain, according to the video?", options: ["Trust on the internet without a middleman", "A tool to guarantee 100% risk-free profits in the stock market for every investor", "Replace all stores", "Control spending"], correct: 0, feedback: "“Trust the math, not the middleman.” (Crypto prices can still crash!)" },
];

/* ---------- LISTENING 1 · Welcome to the Product Lab (clase 1) ---------- */
const LISTEN_P2 = [
  { who: "Director", t: "Good morning, Financial District! Welcome to Season Two: The Product Lab. Last season, you learned how banks work, how people save money, and why responsible financial decisions matter. Now, a new challenge begins." },
  { who: "Director", t: "People in our district need more than a bank account. They need financial products that help them buy things, finance businesses, invest for the future, and make digital payments. During this season, you will explore four important areas." },
  { who: "Director", t: "First, credit cards. You will learn how credit limits, payment dates, and interest work. Remember: credit is borrowed money, not free money. Second, leasing and financing. You will compare different ways to use important assets, such as cars and business equipment." },
  { who: "Director", t: "Third, investments and pensions. You will discover how risk, time, and compound interest can influence long-term financial decisions. Finally, you will explore digital money, blockchain, and cryptocurrency. You will also learn how to recognize financial scams and protect your information." },
  { who: "Director", t: "Your mission is simple: understand the product before choosing it. Every financial decision has benefits, costs, and risks. A product that works well for one person may not be the best choice for another." },
  { who: "Director", t: "At the end of this season, you will become a Financial Product Advisor. You will receive a customer profile, analyze their needs, compare financial alternatives, and present your recommendation. The Product Lab is now open. Think carefully, ask questions, and remember: smart financial choices begin with good information. Good luck, advisors!" },
];
const LQ_P2 = [
  { q: "What is the name of Season Two?", options: ["The Product Lab", "The Central Bank Tower, where students print new money for the district", "The Loan Office", "Bank Run"], correct: 0, feedback: "Season Two: The Product Lab." },
  { q: "What did students learn last season?", options: ["How banks work and how people save", "How to invest in cryptocurrency and become rich in one season without any risk", "How to cook", "Nothing"], correct: 0, feedback: "Banks, saving and responsible decisions." },
  { q: "Why do people in the district need more than a bank account?", options: ["To buy, finance, invest and pay digitally", "Because bank accounts will be illegal next season and everyone must close them now", "To pay taxes", "To travel"], correct: 0, feedback: "Different needs → different products." },
  { q: "How many areas will the season explore?", options: ["Four", "Ten, one for every class of the season and two extra for the final project", "Two", "One"], correct: 0, feedback: "Cards · leasing · investments & pensions · digital money." },
  { q: "What does the director say about credit?", options: ["It is borrowed money, not free money", "It is free money that the bank gives you as a reward when you use your card a lot", "It is a tax", "It is a gift"], correct: 0, feedback: "Same lesson as Season 01!" },
  { q: "What will students compare in the leasing area?", options: ["Ways to use assets like cars and equipment", "Different apps for sending messages to friends and family in other countries", "Bank buildings", "Salaries"], correct: 0, feedback: "Buy, borrow or lease." },
  { q: "What can influence long-term decisions, according to the director?", options: ["Risk, time and compound interest", "The color of the bank logo and the number of followers it has on social media", "Luck only", "The weather"], correct: 0, feedback: "Investments and pensions." },
  { q: "What will students learn to recognize in the last area?", options: ["Financial scams", "Famous people who give away free money on the internet every weekend", "Bank logos", "Coins"], correct: 0, feedback: "And how to protect their information." },
  { q: "What is the mission of the season?", options: ["Understand the product before choosing it", "Choose the product with the most advertising and the nicest design as fast as possible", "Buy many products", "Avoid all products"], correct: 0, feedback: "Understand first, choose later." },
  { q: "Why may a product be good for one person but not another?", options: ["Each person has different needs and risks", "Because banks give better products only to their friends and family members", "Products are random", "It's not true"], correct: 0, feedback: "Benefits, costs and risks depend on the person." },
  { q: "What will students become at the end of the season?", options: ["Financial Product Advisors", "Bank managers with a real salary and an office in the District Bank building", "Bankers", "Programmers"], correct: 0, feedback: "With a customer profile and a recommendation." },
  { q: "What do smart financial choices begin with?", options: ["Good information", "A big credit limit and a lot of confidence in what your friends recommend", "Luck", "Money"], correct: 0, feedback: "“Smart financial choices begin with good information.”" },
];

/* ---------- LISTENING 2 · The Call from “the Bank” (clase 8) ---------- */
const LISTEN_SCAM = [
  { who: "Caller", t: "Good afternoon! Am I speaking with the account holder? My name is Laura, and I'm calling from the security department of the District Bank. We have detected a suspicious purchase on your card: two million pesos in an online store." },
  { who: "Tomás", t: "Two million? I didn't buy anything like that!" },
  { who: "Caller", t: "Don't worry, that's why I'm calling. I can cancel it right now, but we must act fast. In the next ten minutes, the payment will be final. I just need to verify your identity." },
  { who: "Caller", t: "You are going to receive a six-digit code by text message. Please read the code to me so I can block the purchase. Also, confirm your card number and the three numbers on the back." },
  { who: "Tomás", t: "Hmm… my bank always tells me that they never ask for codes. Can I call you back on the official number?" },
  { who: "Caller", t: "No, no, if you hang up, the system will close your case and you will lose the money. This line is the only one that can help you. Trust me, I work for the bank." },
  { who: "Tomás", t: "I'm sorry, but I'm going to hang up. I will open my bank app and call the number on the back of my card." },
  { who: "Narrator", t: "Tomás opened his app. There was no purchase of two million pesos. The call was a scam. The criminals wanted the code to enter his account. Remember: a real bank will never ask for your codes, passwords or the numbers on the back of your card." },
];
const LQ_SCAM = [
  { q: "Who does the caller say she is?", options: ["Laura from the bank's security department", "A police officer who is investigating a robbery in Tomás's neighborhood", "A friend", "A store owner"], correct: 0, feedback: "Criminals pretend to be the bank." },
  { q: "What problem does the caller describe?", options: ["A suspicious purchase of two million pesos", "A new credit card that Tomás won in a contest organized by the bank last week", "A late payment", "A tax"], correct: 0, feedback: "A scary story creates fear." },
  { q: "Why does the caller say they must act in ten minutes?", options: ["To create urgency and pressure", "Because the bank closes at five o'clock and all the employees go home early", "To be polite", "It's a bank rule"], correct: 0, feedback: "Urgency = red flag 🚩." },
  { q: "What does the caller ask for?", options: ["The text-message code and card numbers", "Only Tomás's favorite color and the name of his first pet for a security question", "Nothing", "His address"], correct: 0, feedback: "Codes and card numbers open your account." },
  { q: "Why does Tomás become suspicious?", options: ["His bank never asks for codes", "Because the caller speaks too slowly and uses very formal English during the call", "Her voice is strange", "She is too kind"], correct: 0, feedback: "He remembered the bank's rule." },
  { q: "What does Tomás want to do?", options: ["Call back on the official number", "Send the code quickly so the bank can cancel the purchase before it's too late", "Cry", "Buy something"], correct: 0, feedback: "Verify through an official channel." },
  { q: "What does the caller say if he hangs up?", options: ["He will lose the money", "He will receive a prize of two million pesos for being a careful customer", "Nothing happens", "He gets a new card"], correct: 0, feedback: "Another pressure trick." },
  { q: "What does Tomás finally do?", options: ["Hangs up and checks his app", "Gives the code but not the card numbers, because the code alone is not dangerous", "Gives everything", "Waits"], correct: 0, feedback: "The code alone IS dangerous!" },
  { q: "What did Tomás find in his app?", options: ["No purchase — it was a scam", "A real purchase of two million pesos that the bank had to refund the next day", "A loan", "A gift"], correct: 0, feedback: "The story was invented." },
  { q: "What will a real bank never ask for?", options: ["Codes, passwords or the back-of-card numbers", "Your name, because the bank already knows everything about you and never asks", "Your city", "Nothing"], correct: 0, feedback: "Never share them — with anybody." },
];

/* ---------- READING 1 · Buy, Borrow or Lease? (clase 3) ---------- */
const READ_P2R1 = [
  { sub: "Three ways to get the same van" },
  { p: "Mariana owns a small bakery called Sweet Corner. Her business started three years ago with a small oven, two tables, and a lot of hard work. Today, the bakery has regular customers, receives online orders, and supplies bread to two local cafés." },
  { p: "However, Mariana has a problem. She needs a van to deliver products to her customers. At the moment, she pays a delivery company every week. This service is convenient, but it is becoming expensive. Mariana believes that having her own van could help her business grow. But there is one important question: should she buy the van, borrow money to buy it, or lease it? Her financial advisor, David, explains that these are three different ways to access the same vehicle. Each option has different costs, responsibilities, and risks." },
  { sub: "Option 1: Buy the van with cash" },
  { p: "The vehicle costs $60,000,000. Mariana has saved $75,000,000 in her business account, so she can pay for it without borrowing money. Buying with cash has an important advantage: Mariana will not have a monthly loan payment or pay interest on a vehicle loan. She will also become the owner of the van." },
  { p: "But there is a disadvantage. After buying the van, Mariana will have only $15,000,000 left. The bakery needs money for ingredients, salaries, electricity, packaging, and unexpected repairs. If Mariana uses most of her savings to buy the vehicle, she may not have enough cash available to operate the business." },
  { box: "A business needs working capital: money available for its everyday activities. Without enough working capital, even a profitable business can experience financial difficulties." },
  { sub: "Option 2: Borrow money and buy the van" },
  { p: "The second option is a vehicle loan. The bank offers Mariana $60,000,000. She would buy the van and repay the bank through monthly installments. Each installment includes part of the borrowed amount and interest. David explains that the interest rate is not the only number to compare: she must also look at the repayment period, the monthly payment, the total amount she will repay, and any additional charges." },
  { box: "Fictional example · Amount borrowed: $60,000,000 · Repayment period: 48 months · Monthly payment: $1,650,000 · Total of monthly payments: $79,200,000." },
  { p: "With the loan, Mariana keeps more money in her business account at the beginning. However, the installment becomes a new responsibility: even if the bakery has a difficult month, the bank still expects the agreed payment. Mariana asks, “What happens if I have fewer customers next month?” David answers, “You still need a repayment plan. Check whether your business can afford the installment under normal conditions and during a difficult month.”" },
  { sub: "Option 3: Lease the van" },
  { p: "Leasing is an agreement in which a leasing company allows a customer to use an asset, such as a vehicle or machine, in exchange for payments over an agreed period. In a financial lease, the customer generally uses the asset and may have the option to acquire it at the end by paying an agreed residual value. In an operating lease, the customer mainly pays for the right to use the asset; the vehicle may be returned at the end." },
  { box: "Fictional financial leasing proposal · Monthly payment: $1,500,000 · Contract period: 48 months · Possible residual value at the end: $8,000,000." },
  { p: "The monthly payment is lower than the loan payment, and Mariana likes that. But David reminds her to read the contract: who pays for maintenance, insurance and repairs? Are there mileage limits? “So leasing is always cheaper than buying?” Mariana asks. David smiles. “Not necessarily. A lower monthly payment does not automatically mean a lower total cost. You need to compare all the payments, fees, responsibilities, and final conditions.”" },
  { sub: "A decision based on the business" },
  { p: "Mariana calculates the bakery's average income and expenses and estimates how many additional deliveries the van could make possible. She also includes fuel, insurance, maintenance, and repairs. Finally, she decides to request more information about the leasing contract and compare it with the vehicle loan. She does not want to spend most of her savings, but she also does not want a contract with unnecessary costs." },
  { p: "David congratulates her. “Financial decisions are not about choosing the option with the smallest payment. They are about choosing the option that fits your goals, resources, and risks.”" },
];
const GLOSS_P2R1 = { "cash purchase": "Compra de contado.", "installment": "Cuota.", "leasing": "Arrendamiento (leasing).", "financial lease": "Leasing financiero (opción de compra).", "operating lease": "Leasing operativo (solo uso).", "residual value": "Valor residual (opción de compra al final).", "working capital": "Capital de trabajo.", "collateral": "Garantía.", "total cost": "Costo total." };
const Q_P2R1 = [
  { q: "Why does Mariana need a van?", options: ["To deliver her products to customers", "Because she wants to start a new taxi business and close the bakery next year", "To travel", "For her family"], correct: 0, feedback: "Paying a delivery company is getting expensive." },
  { q: "How much would Mariana have left after buying the van with cash?", options: ["$15,000,000", "$75,000,000, because buying with cash does not reduce the money in her account", "$60,000,000", "$0"], correct: 0, feedback: "$75M − $60M = $15M." },
  { q: "What is the main risk of paying with cash?", options: ["Too little working capital for daily costs", "She would pay much more interest than with the loan or the leasing contract", "The van is not hers", "No risk"], correct: 0, feedback: "Ingredients, salaries and repairs still need money." },
  { q: "What is working capital?", options: ["Money for everyday business activities", "The total value of all the vans, ovens and buildings that a business owns forever", "A loan", "A tax"], correct: 0, feedback: "Without it, even a profitable business can struggle." },
  { q: "What does each loan installment include?", options: ["Part of the borrowed amount plus interest", "Only the interest, because the borrowed amount is paid back on the last day", "Only fees", "Nothing"], correct: 0, feedback: "Capital + interest (and maybe fees)." },
  { q: "The loan payments total $79,200,000 for $60,000,000. How much does she pay above the price?", options: ["$19,200,000", "$79,200,000, because she pays the total amount again on top of the original price", "$1,650,000", "$15,000,000"], correct: 0, feedback: "$79.2M − $60M = $19.2M." },
  { q: "What does Mariana worry about with the loan?", options: ["Paying in a month with fewer customers", "That the bank will take her bakery the first day she signs the contract", "The color of the van", "Nothing"], correct: 0, feedback: "The bank expects the payment every month." },
  { q: "What is leasing?", options: ["Using an asset in exchange for payments", "Buying an asset with cash and selling it after one month for a higher price", "A savings account", "A tax"], correct: 0, feedback: "Pay to use it for an agreed period." },
  { q: "What is the difference between a financial and an operating lease?", options: ["Financial may let you buy it; operating is mainly for use", "There is no difference — both always include free maintenance and free insurance forever", "Operating is a loan", "Financial is illegal"], correct: 0, feedback: "Residual value = the option to acquire at the end." },
  { q: "What is the residual value in Mariana's leasing offer?", options: ["$8,000,000", "$1,500,000, the amount she must pay every month during the full contract", "$60,000,000", "$72,000,000"], correct: 0, feedback: "She pays it at the end if she wants the van." },
  { q: "Why does David say leasing is not always cheaper?", options: ["A lower payment ≠ a lower total cost", "Because leasing companies always charge double the price of the vehicle at the start", "It's always cheaper", "Leasing is a scam"], correct: 0, feedback: "Compare ALL payments, fees and conditions." },
  { q: "What does Mariana decide at the end?", options: ["Ask for more information and compare", "Buy the van with cash immediately and spend all her savings on the same day", "Close the bakery", "Do nothing"], correct: 0, feedback: "Good decisions begin with the right questions." },
];

/* ---------- READING 2 · Your Future Self (clase 5) ---------- */
const READ_P2R2 = [
  { sub: "Two grandmothers, two different stories" },
  { p: "Sofia is 16 years old and is working on a school project about financial decisions. Her teacher asks the class to imagine their lives at age 65. Sofia has never thought seriously about retirement. It seems too far away. One weekend, she visits her two grandmothers, Elena and Rosa, and asks them: “Did you always have a plan for your future?” Both women smile, but their answers are very different." },
  { sub: "Grandma Elena: starting early" },
  { p: "Elena began working when she was 20 years old. At first, she did not earn much money, but she decided to save a small amount every month. Her father had once told her, “Time can be one of your greatest financial resources.” She started saving $100,000 every month in a fictional long-term investment account and did not withdraw the money when she wanted to buy something new." },
  { p: "Over time, she learned about compound interest. Compound interest happens when the money earned from savings or an investment is added to the original amount. Later, returns may be earned on both the original contributions and the accumulated returns." },
  { box: "Example: someone invests $1,000,000 and earns a hypothetical 5% in the first year → $1,050,000. If 5% happens again, it is calculated on $1,050,000, not only on the original $1,000,000. That is compounding (before fees, taxes and inflation)." },
  { p: "Elena understood that results were not guaranteed. Some investments can lose value, and returns can change. Still, she believed that starting early and contributing regularly could help her prepare. She also participated in the pension system available to her during her working life." },
  { sub: "Grandma Rosa: starting later" },
  { p: "Rosa began thinking about retirement much later. When she was young, she focused on helping her family and paying everyday expenses, and sometimes her income was unstable. At age 40, she started making regular contributions and learning about the pension system. Rosa did not regret her past decisions, but she understood that beginning earlier could have given her more time. She tells Sofia, “You do not need to be rich to start planning. You need to understand your situation and make decisions that you can maintain.”" },
  { sub: "Why does starting early matter?" },
  { p: "The teacher gives a simplified example. Two people save $100,000 every month. Person A starts at 20 and saves for 40 years: 480 contributions. Person B starts at 40 and saves for 20 years: only 240 contributions. Even with the same monthly amount, Person A contributes for twice as long — and with compounding, the difference may become even larger. However, returns are not guaranteed, and inflation can reduce the purchasing power of money." },
  { sub: "What is a pension?" },
  { p: "A pension is a form of income designed to provide financial support during retirement, subject to the rules of each system. Some systems use contributions from current workers to help pay benefits for retirees. Other arrangements build individual savings balances over time. Many countries combine approaches. In Colombia, the pension system has its own institutions, rules and requirements, which depend on the current law and each person's situation." },
  { box: "A pension is not the same as a regular savings account: it is part of a social and financial system, with legal protections, contribution rules, eligibility requirements and limits on withdrawals." },
  { sub: "Sofia's future plan" },
  { p: "Sofia may not have a salary today, but she can build good habits: learn how savings and investments work, avoid unnecessary debt, set long-term goals, understand inflation, and ask questions before choosing a financial product. She writes in her notebook: “My future self will live with the financial decisions I make today.” Before she leaves, Rosa says, “Do not wait until the future arrives to start thinking about it. Your future is being built through the small decisions you make today.”" },
];
const GLOSS_P2R2 = { "retirement": "Jubilación / retiro.", "pension": "Pensión.", "contribution": "Aporte.", "compound interest": "Interés compuesto.", "long-term savings": "Ahorro a largo plazo.", "investment return": "Rendimiento (ganancia o pérdida).", "inflation": "Inflación.", "purchasing power": "Poder adquisitivo.", "consistent": "Constante." };
const Q_P2R2 = [
  { q: "At what age did Elena begin saving?", options: ["20", "40, the same age as her sister Rosa, because they always did everything together", "16", "65"], correct: 0, feedback: "She started with her first job." },
  { q: "Why did Rosa start planning later?", options: ["She helped her family and had unstable income", "Because she didn't want a pension and preferred to spend all her money on vacations", "She was rich", "Nobody told her"], correct: 0, feedback: "Real life — no regrets, but less time." },
  { q: "$1,000,000 earns a hypothetical 5% for one year. How much is there at the end?", options: ["$1,050,000", "$1,500,000, because 5% of one million is five hundred thousand pesos every year", "$1,005,000", "$1,100,000"], correct: 0, feedback: "5% of $1,000,000 = $50,000." },
  { q: "In year 2, the 5% is calculated on…", options: ["$1,050,000", "only the original $1,000,000, because returns are never added to the account", "$50,000", "$0"], correct: 0, feedback: "That's compounding: returns on returns." },
  { q: "How many monthly contributions does Person A make in 40 years?", options: ["480", "240, the same number as Person B, because both of them save $100,000", "40", "400"], correct: 0, feedback: "40 × 12 = 480." },
  { q: "Why can starting early make a difference?", options: ["More contributions and more time to compound", "Because young people always receive a higher interest rate than older people at the bank", "It doesn't", "Prices go down"], correct: 0, feedback: "Time is a financial resource." },
  { q: "Does compound interest guarantee that an investment will grow?", options: ["No — returns can change or be negative", "Yes, compound interest always protects every investment from losses and inflation", "Only in banks", "Yes, by law"], correct: 0, feedback: "Results are not guaranteed." },
  { q: "How can inflation affect retirement savings?", options: ["The same money buys less in the future", "It makes your savings grow automatically every year without any investment", "No effect", "It removes taxes"], correct: 0, feedback: "Purchasing power falls." },
  { q: "How is a pension different from a regular savings account?", options: ["It has legal rules and limits on withdrawals", "There is no difference — you can withdraw all of your pension money any day you want", "It pays no money", "It's a loan"], correct: 0, feedback: "Part of a social system with protections." },
  { q: "What does Rosa say you need to start planning?", options: ["Understand your situation and make sustainable decisions", "You need to be rich first, because people with small incomes cannot plan for the future", "Luck", "A big salary"], correct: 0, feedback: "Decisions you can maintain." },
  { q: "Which habit can Sofia build BEFORE having a salary?", options: ["Avoid unnecessary debt and set long-term goals", "Open three credit cards to start a good credit history as soon as possible", "Spend everything", "Wait until 40"], correct: 0, feedback: "Habits first, salary later." },
  { q: "What does Sofia write in her notebook?", options: ["“My future self will live with the decisions I make today.”", "“Retirement is only a topic for old people, so I will think about it when I am 60.”", "“Save nothing.”", "“Trust luck.”"], correct: 0, feedback: "The key message of the reading." },
];

/* ---------- BOSS · The Financial Product Challenge ---------- */
const BOSS_MISSIONS92 = [
  { tag: "MISSION 1 · CREDIT CARD CRISIS", q: "Your statement: new purchases $800,000 · minimum payment $80,000 · interest 2.5% per month on what you don't pay. You pay only the minimum. How much interest next month?", answer: 18000, money: true, hint: "Unpaid = 800,000 − 80,000. Interest = 2.5% of that.", explain: "$720,000 × 2.5% = $18,000 — just for one month." },
  { tag: "MISSION 2 · THE VAN DECISION", q: "Leasing: 48 payments of $1,500,000 + residual value $8,000,000 to keep the van. Loan: 48 payments of $1,650,000. Which one costs MORE in total if you want to own the van?", options: ["Leasing ($80,000,000 vs $79,200,000)", "The loan, because its monthly payment is higher, so its total cost must always be higher too", "They cost the same", "Neither"], correct: 0, hint: "48 × 1,500,000 + 8,000,000 = ?", explain: "Lower monthly payment ≠ lower total cost." },
  { tag: "MISSION 3 · MARKET STORM", q: "Your growth fund fell 20% this year. You don't need the money for 10 years. What is the most responsible reaction?", options: ["Stay calm, review the plan and keep diversified", "Sell everything today, because a fund that falls once will continue falling forever", "Borrow to buy more", "Move all to crypto"], correct: 0, hint: "When do you need the money?", explain: "Selling in panic turns a temporary fall into a real loss." },
  { tag: "MISSION 4 · FUTURE SELF", q: "Ana saves $150,000 a month from age 25 to 65. How many contributions does she make?", answer: 480, unit: "contributions", hint: "40 years × 12 months.", explain: "480 contributions — time is her biggest advantage." },
  { tag: "MISSION 5 · CRYPTO SCAM", q: "“CryptoRocket: guaranteed 20% EVERY MONTH, no risk! Only today. Send your wallet password to join.” What do you do?", options: ["Don't invest, don't share anything, report it", "Invest a small amount first to check if it works, and then decide if you invest more money", "Send the password", "Share it with friends"], correct: 0, hint: "Guaranteed + no risk + urgency + password…", explain: "Four red flags. Real investments have risk and never ask for passwords." },
];
const BOSS_Q92 = [
  { q: "When you pay with a debit card, the money comes from…", options: ["your own bank account", "a loan from the card company that you must repay with interest next month", "the government", "the store"], correct: 0, feedback: "Debit = your money." },
  { q: "What is the cut-off date of a credit card?", options: ["The day the statement period closes", "The last day you can use the card before it expires and the bank destroys it", "Your birthday", "Payment day"], correct: 0, feedback: "Purchases after it go to the next statement." },
  { q: "Why is paying only the minimum dangerous?", options: ["Interest keeps growing on the rest", "Because the bank closes your account the same day you pay the minimum amount", "It isn't", "You pay more taxes"], correct: 0, feedback: "Small payments, long debt." },
  { q: "What is residual value in leasing?", options: ["The amount to buy the asset at the end", "The monthly payment of the contract that includes insurance, maintenance and repairs", "A fine", "A deposit"], correct: 0, feedback: "Financial lease: option to acquire." },
  { q: "What does diversification mean?", options: ["Spreading money across different investments", "Putting all your money in the one investment that went up the most last year", "Saving cash", "Borrowing"], correct: 0, feedback: "Don't put all your eggs in one basket." },
  { q: "Higher expected return usually comes with…", options: ["higher risk", "a guarantee from the central bank that you will never lose any of your money", "lower fees", "no inflation"], correct: 0, feedback: "Risk and return go together." },
  { q: "Why do fund fees matter?", options: ["They reduce what you keep every year", "They don't matter, because the fund always pays the fees with its own profits", "They increase returns", "They're taxes"], correct: 0, feedback: "1–2% a year adds up over time." },
  { q: "What is compound interest?", options: ["Returns earned on returns", "Interest that the bank charges you only once when you open a new savings account", "A fee", "A tax"], correct: 0, feedback: "Time makes it powerful." },
  { q: "What does inflation do to your money?", options: ["Reduces what it can buy", "Increases what it can buy every year, so saving cash at home is always a good idea", "Nothing", "Doubles it"], correct: 0, feedback: "Purchasing power falls." },
  { q: "What is a digital wallet?", options: ["An app to store and send money", "A leather wallet with a chip that stores coins and paper money from other countries", "A bank branch", "A loan"], correct: 0, feedback: "Pay with QR, transfers…" },
  { q: "Why is it hard to change a blockchain record?", options: ["Every block is linked by hashes and many copies exist", "Because the central bank keeps the only copy in a secret vault with armed guards", "It's easy", "It's on paper"], correct: 0, feedback: "Immutability." },
  { q: "How does a Ponzi scheme pay early investors?", options: ["With money from new investors", "With real profits from a successful company that sells products all over the world", "With taxes", "With loans"], correct: 0, feedback: "When new money stops, it collapses." },
];

/* =====================================================================
   CLASE 1 · WELCOME TO THE PRODUCT LAB
   ===================================================================== */
const START_P1 = {
  cards: [
    { e: "🧰", t: "Financial product", d: "A service from a financial company that helps you pay, borrow, save or invest.", ex: "A card, a loan, a fund…" },
    { e: "💳", t: "Credit card", d: "A card to borrow money up to a limit. You must repay what you use.", ex: "Limit: $3,000,000." },
    { e: "🏧", t: "Debit card", d: "A card that uses money from YOUR account.", ex: "No money = no purchase." },
    { e: "🚐", t: "Leasing", d: "Paying to use an asset (a car, a machine) for a period.", ex: "A van for a bakery." },
    { e: "📈", t: "Mutual fund", d: "Money from many people invested together by a professional.", ex: "Stocks + bonds + cash." },
    { e: "🧓", t: "Pension", d: "Income designed to support you during retirement.", ex: "After you stop working." },
    { e: "📱", t: "Digital wallet", d: "An app to store, send and receive money.", ex: "Pay with a QR code." },
    { e: "⚖️", t: "Benefit · cost · risk", d: "The three things to check before choosing ANY product.", ex: "What do I win, pay, risk?" },
  ],
  pairs: [{ a: "Credit card", b: "Borrow up to a limit" }, { a: "Debit card", b: "Uses your own money" }, { a: "Leasing", b: "Pay to use an asset" }, { a: "Mutual fund", b: "Invest together with others" }, { a: "Pension", b: "Income for retirement" }, { a: "Digital wallet", b: "Pay and send from an app" }],
};
const PRODUCTS92 = [
  { id: "credit", e: "💳", n: "Credit card" }, { id: "debit", e: "🏧", n: "Debit card" }, { id: "lease", e: "🚐", n: "Vehicle leasing" },
  { id: "fund", e: "📈", n: "Mutual fund" }, { id: "pension", e: "🧓", n: "Pension plan" }, { id: "wallet", e: "📱", n: "Digital wallet" },
];
const MATCH_P1 = [
  { e: "🛍️", t: "Wants to buy online now but doesn't want to touch her savings today.", b: "credit", why: "Credit lets her pay later — but she must repay it, ideally in full." },
  { e: "🙅", t: "Wants to pay every day with his own money and never be in debt.", b: "debit", why: "Debit uses only money he already has." },
  { e: "🥐", t: "A bakery owner needs a delivery vehicle but wants to keep cash for ingredients.", b: "lease", why: "Leasing lets her use the van without paying everything at once." },
  { e: "🤷", t: "Wants to invest but doesn't understand the stock market.", b: "fund", why: "A professional manages a diversified fund." },
  { e: "👷", t: "A young worker wants income when he is old.", b: "pension", why: "Pensions are built for retirement." },
  { e: "📲", t: "Wants to pay at the corner store with a QR code.", b: "wallet", why: "Digital wallets pay with QR in seconds." },
];
const MYSTERY_P1 = [
  { q: "🎁 Mystery Box 1: “You can borrow up to an approved limit. You must repay what you use, and unpaid balances may generate interest.” What is it — and what is its main risk?", options: ["A credit card — interest if you don't pay in full", "A debit card — because it takes money from your account and charges high monthly interest", "A pension — inflation", "A wallet — no risk"], correct: 0, explain: "Credit is borrowed money, not free money." },
  { q: "🎁 Mystery Box 2: “Your money is pooled with other investors and a professional buys stocks and bonds. The value can go up or down.” What is it?", options: ["A mutual fund", "A savings account with a fixed interest rate that the government guarantees forever", "A credit card", "Leasing"], correct: 0, explain: "Diversified and managed — but not guaranteed." },
  { q: "🎁 Mystery Box 3: “You use an asset for 48 months and may buy it at the end by paying a residual value.” What is it?", options: ["A financial lease", "A mortgage loan for a house that you must pay back in thirty years with a bank", "A debit card", "A fund"], correct: 0, explain: "Financial leasing: use now, option to buy later." },
];
function ProductMatch({ onSave, onExit }) {
  const [sel, setSel] = useState(null);
  const [pairs, setPairs] = useState({});
  const [checked, setChecked] = useState(false);
  const [box, setBox] = useState({});
  const [order] = useState(() => shuffleArr(MATCH_P1.map((_, k) => k)));
  const [st, finish] = useFinish(onSave);
  const right = MATCH_P1.filter((c, k) => pairs[k] === c.b).length;
  const allPaired = MATCH_P1.every((_, k) => pairs[k]);
  const nBox = Object.keys(box).length;
  const coins = 12 + right * 2 + Object.values(box).filter((w) => w === 0).length * 2;
  if (st.done) return <Reward title="Products matched! 🧪" subtitle={`${right}/6 clients · ${nBox}/3 mystery boxes`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Puzzle size={22} strokeWidth={2.1} />} title="Product Match Rush 🧪" subtitle="Six clients walk into the Product Lab. Give each one the right product — then open 3 mystery boxes." onExit={onExit}>
      <Brief91 k="c1_match" />
      <HowTo>Tap a <b>client</b>, then tap a <b>product</b>. When all 6 have a product, press <b>Check</b>. Wrong ones turn red: fix them before you continue.</HowTo>
      <div className="g92-match">
        <div className="g92-clients">{order.map((k) => { const c = MATCH_P1[k]; const P = PRODUCTS92.find((p) => p.id === pairs[k]); const bad = checked && pairs[k] !== c.b; return (
          <button key={k} type="button" className={`${sel === k ? "on" : ""} ${checked ? (bad ? "no" : "ok") : ""}`} onClick={() => setSel(k)}>
            <em>{c.e}</em><span>{c.t}</span><b>{P ? `${P.e} ${P.n}` : "Choose a product…"}</b>
            {checked && !bad && <small>✅ {c.why}</small>}
          </button>
        ); })}</div>
        <div className="g92-products">{PRODUCTS92.map((p) => <button key={p.id} type="button" disabled={sel === null} onClick={() => { setPairs({ ...pairs, [sel]: p.id }); setChecked(false); setSel(null); }}><em>{p.e}</em>{p.n}</button>)}</div>
      </div>
      {!checked || right < 6 ? <div className="start-foot"><button className="s1-btn primary big" disabled={!allPaired} onClick={() => setChecked(true)}>{checked ? `Check again (${right}/6)` : "Check"} <Check size={17} /></button></div> : (
        <>
          {MYSTERY_P1.map((m, k) => <PickOne key={k} tag={`MYSTERY BOX ${k + 1}/3`} q={m.q} options={m.options} correct={m.correct} explain={m.explain} onRight={(w) => setBox((b) => ({ ...b, [k]: w }))} />)}
          <div className="start-foot"><button className="s1-btn primary big" disabled={nBox < 3} onClick={() => finish(coins, { right, boxes: box })}>Finish <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- MY SEASON PASS · 6 productos + una precaución ---------- */
const PASS_P1 = [
  { id: "credit", ok: "Pay the full balance before the due date", no: ["Use all the limit every month", "Pay only the minimum"] },
  { id: "debit", ok: "Check the balance — and avoid overdrafts", no: ["Share the PIN with friends", "Use it in any link someone sends"] },
  { id: "lease", ok: "Read who pays maintenance and the residual value", no: ["Choose the smallest payment, always", "Sign before reading the contract"] },
  { id: "fund", ok: "Check the risk level and the fees", no: ["Expect guaranteed profits", "Invest money you need next week"] },
  { id: "pension", ok: "Start early and contribute regularly", no: ["Wait until you are 60", "Withdraw for every purchase"] },
  { id: "wallet", ok: "Use 2FA and never share your codes", no: ["Use the same password everywhere", "Send codes to “support” by chat"] },
];
function SeasonPass({ resp, studentName, existing, onSave, onExit }) {
  const S = seasonOf(resp);
  const [pick, setPick] = useState(existing?.picks || {});
  const [orders] = useState(() => PASS_P1.map((p) => shuffleArr([p.ok, ...p.no])));
  const [st, finish] = useFinish(onSave);
  const right = PASS_P1.filter((p) => pick[p.id] === p.ok).length;
  const done = PASS_P1.every((p) => pick[p.id]);
  if (st.done) return <Reward title="Season Pass activated! 🪪" subtitle={`${right}/6 precautions · Season 02 starts with ${cop(S.start)}`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<BadgeCheck size={22} strokeWidth={2.1} />} title="My Season Pass 🪪" subtitle="Your Season 01 citizen continues. For each product, choose the most important precaution." onExit={onExit}>
      <Brief91 k="c1_pass" />
      <div className="g92-carry"><em>{S.profile?.avatar || "🙋"}</em><div><small>FROM SEASON 01</small><b>{S.profile ? `${S.profile.name} · ${S.profile.job.n}` : (studentName || "Citizen").split(" ")[0]}</b><span>{S.hasP1 ? `Your balance at the end of Season 01: ${cop(S.start)}. Now your products will change it.` : `We didn't find your Season 01 results, so you start with ${cop(S.start)}.`}</span></div></div>
      <div className="g92-pass">{PASS_P1.map((p, i) => { const P = PRODUCTS92.find((x) => x.id === p.id); const v = pick[p.id]; return (
        <div key={p.id} className={`start-block ${v ? (v === p.ok ? "ok" : "no") : ""}`}>
          <header><em>{P.e}</em><b>{P.n}</b>{v && <i>{v === p.ok ? "✅" : "⚠️"}</i>}</header>
          <div className="g92-opts">{orders[i].map((o) => <button key={o} type="button" className={v === o ? (o === p.ok ? "ok" : "no") : ""} disabled={v === p.ok} onClick={() => setPick({ ...pick, [p.id]: o })}>{o}</button>)}</div>
          {v && v !== p.ok && <p className="g91-note neg">That's a risky habit! Choose the safe precaution.</p>}
        </div>
      ); })}</div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!done || right < 6} onClick={() => finish(14 + right * 2, { picks: pick, right, start: S.start })}>{right < 6 && done ? "Fix the risky habits first" : "Activate my Season Pass"} <span className="coin-tag"><Coins size={15} /> +{14 + right * 2}</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 2 · CREDIT VS DEBIT CARDS
   ===================================================================== */
const START_P2 = {
  cards: [
    { e: "📏", t: "Credit limit", d: "The maximum amount you can borrow with the card.", ex: "$3,000,000." },
    { e: "🧾", t: "Statement", d: "The monthly report of your card: purchases, payments, interest, balance.", ex: "It arrives after the cut-off date." },
    { e: "✂️", t: "Cut-off date", d: "The day the statement period closes. Later purchases go to the next statement.", ex: "Day 25." },
    { e: "📅", t: "Due date", d: "The last day to pay without late fees.", ex: "Day 10 of next month." },
    { e: "🪙", t: "Minimum payment", d: "The smallest amount you must pay. The rest generates interest.", ex: "10% of the balance." },
    { e: "📈", t: "Interest charge", d: "The cost of the money you didn't pay.", ex: "2.5% per month (fictional)." },
    { e: "✅", t: "Available credit", d: "Limit − what you owe.", ex: "$3,000,000 − $600,000." },
    { e: "🎁", t: "Cashback", d: "A small reward for using the card.", ex: "1% back — never a reason to overspend!" },
  ],
  pairs: [{ a: "Credit limit", b: "Maximum you can borrow" }, { a: "Cut-off date", b: "The statement period closes" }, { a: "Due date", b: "Last day to pay without fees" }, { a: "Minimum payment", b: "The smallest amount to pay" }, { a: "Available credit", b: "Limit minus what you owe" }, { a: "Statement", b: "Monthly report of the card" }],
};

/* ---------- CARD WARS · Survive the Month ---------- */
const CARD_RATE = 0.025, CARD_LIMIT = 3000000, CUT = 25;
const EVENTS_P2 = [
  { d: 3, e: "🛒", t: "Groceries for the week", amt: 120000, kind: "need" },
  { d: 7, e: "🚌", t: "Transport card recharge", amt: 80000, kind: "need" },
  { d: 12, e: "🎧", t: "New headphones on sale (−30%)", amt: 450000, kind: "want" },
  { d: 18, e: "💊", t: "Emergency medicine", amt: 90000, kind: "need", urgent: true },
  { d: 24, e: "📺", t: "A new streaming subscription", amt: 35000, kind: "want" },
  { d: 27, e: "🎁", t: "Your best friend's birthday gift", amt: 150000, kind: "want" },
];
const trap2 = (minRule) => { let b = 1000000, m = 0, int = 0; while (b > 0 && m < 400) { const i = Math.round(b * CARD_RATE); int += i; b += i; const pay = minRule ? Math.min(b, Math.max(50000, Math.round(b * 0.05))) : b; b -= pay; m++; } return { months: m, interest: int }; };
function CardWars({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [ev, setEv] = useState(0);
  const [debit, setDebit] = useState(500000);
  const [log, setLog] = useState([]);
  const [msg, setMsg] = useState(null);
  const [cal, setCal] = useState({});
  const [calOk, setCalOk] = useState(false);
  const [puz, setPuz] = useState({});
  const [puzOk, setPuzOk] = useState(false);
  const [pay, setPay] = useState(null);
  const [trapOk, setTrapOk] = useState(null);
  const [st, finish] = useFinish(onSave);
  const E = EVENTS_P2[ev];
  const credits = log.filter((x) => x.m === "credit");
  const thisSt = credits.filter((x) => x.d <= CUT).reduce((a, x) => a + x.amt, 0);
  const nextSt = credits.filter((x) => x.d > CUT).reduce((a, x) => a + x.amt, 0);
  const minPay = thisSt ? Math.max(50000, Math.round(thisSt * 0.1)) : 0;
  const avail = CARD_LIMIT - thisSt - nextSt;
  const free = 500000 + debit;
  const choose = (m) => {
    if (m === "debit" && debit < E.amt) { setMsg({ bad: true, t: `❌ Declined: your debit account has only ${cop(debit)}. Debit cards can't spend money you don't have.` }); return; }
    if (m === "debit") setDebit(debit - E.amt);
    const note = m === "wait" ? (E.urgent || E.kind === "need" ? "⚠️ You skipped a NEED. Food, transport and medicine can't always wait." : "👍 Smart: wanting something is not the same as needing it.") : m === "credit" ? (E.kind === "want" ? "💳 On the card. Remember: you'll pay it later — maybe with interest." : "💳 On the card. OK for a need — if you can repay it.") : "🏧 Paid with your own money. No debt.";
    setLog([...log, { ...E, m }]); setMsg({ bad: m === "wait" && E.kind === "need", t: note });
  };
  const next = () => { setMsg(null); if (ev < EVENTS_P2.length - 1) setEv(ev + 1); else setStage(credits.length ? 1 : 3); };
  const PUZ = [["new", "New purchases", thisSt], ["min", "Minimum payment", minPay], ["avail", "Available credit", avail], ["bal", "New balance", thisSt]];
  const puzItems = useMemo(() => shuffleArr([["new", cop(thisSt)], ["min", cop(minPay)], ["avail", cop(avail)]]), [stage === 2]); // eslint-disable-line react-hooks/exhaustive-deps
  const unpaid = pay === "total" ? 0 : pay === "min" ? thisSt - minPay : thisSt;
  const interest = Math.round(unpaid * CARD_RATE);
  const fees = pay === "none" ? 30000 : 0;
  const health = Math.max(0, Math.min(100, 70 + (pay === "total" ? 10 : pay === "min" ? -5 : pay === "none" ? -20 : 10) - (thisSt + nextSt > 1500000 ? 5 : 0)));
  const wantsSpent = log.filter((x) => x.kind === "want" && x.m !== "wait").reduce((a, x) => a + x.amt, 0);
  const T1 = useMemo(() => trap2(false), []), T2 = useMemo(() => trap2(true), []);
  const coins = 18 + (calOk ? 4 : 0) + (puzOk ? 4 : 0) + (pay === "total" ? 6 : pay === "min" ? 2 : 0) + (trapOk === 0 ? 4 : 0) + log.filter((x) => x.kind === "want" && x.m === "wait").length;
  if (st.done) return <Reward title="Month survived! 💳" subtitle={`Card debt ${cop(unpaid + nextSt)} · interest ${cop(interest)} · credit health ${health}/100`} coins={st.coins} saving={st.saving} onExit={onExit} gold={pay === "total"} />;
  return (
    <ActShell icon={<CreditCard size={22} strokeWidth={2.1} />} title="Card Wars · Survive the Month 💳" subtitle="Debit account $500,000 · credit card limit $3,000,000 · cut-off day 25 · interest 2.5% per month (fictional)." onExit={onExit}>
      <Brief91 k="c2_cards" />
      <Steps91 labels={["1 · The month", "2 · Cut-off calendar", "3 · Statement puzzle", "4 · Pay day", "5 · Minimum trap"]} at={stage} />
      <div className="g92-wallets">
        <div><small>🏧 DEBIT ACCOUNT</small><b>{cop(debit)}</b><span>your own money</span></div>
        <div className="cr"><small>💳 CREDIT CARD USED</small><b>{cop(thisSt + nextSt)}</b><span>available {cop(avail)}</span></div>
      </div>
      {stage === 0 && (
        <div className="start-block">
          <div className="g92-cal">{Array.from({ length: 30 }, (_, i) => i + 1).map((d) => { const L = log.find((x) => x.d === d); return <span key={d} className={`${d === E.d && !msg ? "now" : ""} ${d === CUT ? "cut" : ""} ${L ? L.m : ""}`}>{d}{L && <i>{L.m === "credit" ? "💳" : L.m === "debit" ? "🏧" : "⏸"}</i>}</span>; })}</div>
          <div className="g83-event"><em>{E.e}</em><div><b>Day {E.d} · {E.t}</b><span>{cop(E.amt)} · {E.kind === "need" ? (E.urgent ? "URGENT NEED" : "need") : "want"}</span></div></div>
          {!msg || msg.bad && msg.t.startsWith("❌") ? (
            <div className="g92-pay3">
              <button type="button" onClick={() => choose("debit")}>🏧<b>Debit</b><small>my money</small></button>
              <button type="button" onClick={() => choose("credit")}>💳<b>Credit</b><small>pay later</small></button>
              <button type="button" onClick={() => choose("wait")}>⏸️<b>Wait</b><small>don't buy</small></button>
            </div>
          ) : null}
          {msg && <div className={`p1-banner ${msg.bad ? "bad" : "good"}`}><span>{msg.t}</span></div>}
          {msg && !msg.t.startsWith("❌") && <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{ev < EVENTS_P2.length - 1 ? "Next day" : "End of the month"} <ChevronRight size={18} /></button></div>}
        </div>
      )}
      {stage === 1 && (
        <div className="start-block">
          <h3>✂️ Cut-off calendar · The statement closes on day {CUT}</h3>
          <p className="start-tip">For each credit purchase: does it appear in THIS statement or in the NEXT one?</p>
          {credits.map((x) => <div key={x.d} className={`g92-calrow ${calOk ? ((x.d <= CUT ? "this" : "next") === cal[x.d] ? "ok" : "no") : ""}`}><span>{x.e} Day {x.d} · {x.t} · {cop(x.amt)}</span><Tri value={cal[x.d]} onPick={(v) => { setCal({ ...cal, [x.d]: v }); setCalOk(false); }} opts={[["this", "This statement"], ["next", "Next statement"]]} /></div>)}
          {calOk && credits.some((x) => (x.d <= CUT ? "this" : "next") !== cal[x.d]) && <p className="g91-note neg">Purchases AFTER day {CUT} go to the next statement. Fix the red ones.</p>}
          <div className="start-foot">{calOk && credits.every((x) => (x.d <= CUT ? "this" : "next") === cal[x.d]) ? <button className="s1-btn primary big" onClick={() => setStage(thisSt ? 2 : 3)}>Open my statement <ChevronRight size={18} /></button> : <button className="s1-btn primary big" disabled={credits.some((x) => !cal[x.d])} onClick={() => setCalOk(true)}>Check <Check size={17} /></button>}</div>
        </div>
      )}
      {stage === 2 && (
        <div className="start-block">
          <h3>🧩 Statement puzzle</h3>
          <p className="start-tip">The statement arrived in pieces! Tap a line, then tap the amount that goes there. (Minimum = 10% of the balance or $50,000.)</p>
          <div className="g92-stmt">
            <header><b>🏦 District Bank · Card statement</b><span>Period closes day {CUT} · Due date: day 10 next month</span></header>
            <p><span>Previous balance</span><b>{cop(0)}</b></p><p><span>Payments</span><b>{cop(0)}</b></p>
            {PUZ.filter(([k]) => k !== "bal").map(([k, l]) => <p key={k} className={`slot ${puz.sel === k ? "on" : ""} ${puzOk ? "ok" : ""}`} onClick={() => !puzOk && setPuz({ ...puz, sel: k })}><span>{l}</span><b>{puz[k] || "tap to fill"}</b></p>)}
            <p className="tot"><span>New balance</span><b>{cop(thisSt)}</b></p>
          </div>
          <div className="g84-chips">{puzItems.map(([k, v]) => <button key={k} type="button" disabled={!puz.sel || puzOk} onClick={() => setPuz({ ...puz, [puz.sel]: v, sel: null, [`_${puz.sel}`]: k })}>{v}</button>)}</div>
          {!puzOk ? <div className="p3-card-actions"><button className="s1-btn primary" disabled={!["new", "min", "avail"].every((k) => puz[k])} onClick={() => { if (["new", "min", "avail"].every((k) => puz[`_${k}`] === k)) setPuzOk(true); else setPuz({}); }}>Check the statement</button>{Object.keys(puz).length === 0 && <span className="g91-note">Tap a line first.</span>}</div>
            : <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(3)}>Go to pay day <ChevronRight size={18} /></button></div>}
        </div>
      )}
      {stage === 3 && (
        <div className="start-block">
          <h3>💰 Pay day · Your salary arrived</h3>
          <p className="start-tip">After rent, food and transport for next month, you have {cop(free)} free (including what is left in your debit account). Statement balance: {cop(thisSt)} · minimum {cop(minPay)}.</p>
          {thisSt === 0 ? <div className="p1-banner good"><span>Nothing to pay in this statement! {nextSt ? `Your ${cop(nextSt)} after the cut-off go to next month.` : "You lived the month without debt."}</span></div> : (
            <div className="g92-pay3">
              <button type="button" disabled={thisSt > free || !!pay} className={pay === "total" ? "on" : ""} onClick={() => setPay("total")}>✅<b>Pay the total</b><small>{thisSt > free ? "not enough money!" : cop(thisSt)}</small></button>
              <button type="button" disabled={!!pay} className={pay === "min" ? "on" : ""} onClick={() => setPay("min")}>🪙<b>Pay the minimum</b><small>{cop(minPay)}</small></button>
              <button type="button" disabled={!!pay} className={pay === "none" ? "on" : ""} onClick={() => setPay("none")}>🙈<b>Pay nothing</b><small>$0</small></button>
            </div>
          )}
          {pay && <div className={`p1-banner ${pay === "total" ? "good" : "bad"}`}><span>{pay === "total" ? "No interest, no fees — and your credit health improves." : pay === "min" ? `You still owe ${cop(unpaid)}. Next month: ${cop(interest)} of interest.` : `Late fee ${cop(fees)} + ${cop(interest)} of interest — and your credit history gets worse.`}</span></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={thisSt > 0 && !pay} onClick={() => { if (!pay) setPay("total"); setStage(4); }}>The minimum payment trap <ChevronRight size={18} /></button></div>
        </div>
      )}
      {stage === 4 && (
        <>
          <div className="start-block">
            <h3>🪤 Two friends, the same $1,000,000 debt (2.5% per month, fictional)</h3>
            <div className="g91-two">
              <div className="g91-check ok"><b>🦸 Luisa pays it all</b><span>{T1.months} month · interest {cop(T1.interest)}</span></div>
              <div className="g91-check no"><b>🐢 Pablo pays only the minimum (5% or $50,000)</b><span>{T2.months} months ({(T2.months / 12).toFixed(1)} years) · interest {cop(T2.interest)}</span></div>
            </div>
          </div>
          <PickOne tag="THE LESSON" q={`Pablo paid ${cop(T2.interest)} in interest for a $1,000,000 debt. Why?`} options={["The minimum mostly pays interest, so the debt lasts years", "Because the bank charges a higher interest rate to people who pay the minimum every month", "He had bad luck", "The card was fake"]} correct={0} explain="Small minimum payments keep you in debt for a long time — and interest keeps growing." onRight={setTrapOk} />
          <div className="start-foot"><button className="s1-btn primary big" disabled={trapOk === null} onClick={() => finish(coins, { choices: log.map((x) => `${x.d}:${x.m}`), wantsSpent, thisSt, nextSt, pay: pay || "total", interest, fees, debt: unpaid + nextSt, health, calOk, puzOk })}>Save my month <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- ADVISOR PAGE 06 · My Credit Card Survival Guide ---------- */
const RULES_P2 = [["Pay the full balance before the due date", 1], ["Know my cut-off date and due date", 1], ["Use the card only for what I can repay this month", 1], ["Check my statement every month", 1], ["Pay only the minimum to save money", 0], ["Use all the limit — it's my money", 0], ["Get many cards for more points", 0]];
function CardGuide({ resp, existing, onSave, onExit }) {
  const cw = resp?.c2_cards;
  const [rules, setRules] = useState(existing?.rules || []);
  const [text, setText] = useState(existing?.text || "");
  const [order] = useState(() => shuffleArr(RULES_P2.map((_, k) => k)));
  const [st, finish] = useFinish(onSave);
  const bad = rules.filter((k) => !RULES_P2[k][1]).length;
  const G = [W_ADVICE, W_CONTRAST, W_NUMBERS(1)];
  if (st.done) return <Reward title="Advisor page 06 saved! 🧾" subtitle="My Credit Card Survival Guide." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<CreditCard size={22} strokeWidth={2.1} />} title="My Credit Card Survival Guide 💳" subtitle="Advisor Page 06 · Your month in numbers + your 3 golden rules." onExit={onExit}>
      <Brief91 k="c2_page" />
      <PBadge n="06" />
      {!cw ? <div className="p1-banner bad"><span>Play Card Wars first — this page uses your month.</span></div> : (
        <div className="g84-results g91-results"><div><small>WANTS BOUGHT</small><b>{cop(cw.wantsSpent)}</b></div><div><small>MY PAYMENT</small><b>{cw.pay === "total" ? "Full ✅" : cw.pay === "min" ? "Minimum ⚠️" : "Nothing 🚨"}</b></div><div><small>INTEREST + FEES</small><b>{cop(cw.interest + cw.fees)}</b></div><div><small>CREDIT HEALTH</small><b>{cw.health}/100</b></div></div>
      )}
      <div className="start-block">
        <h3>🥇 Choose my 3 golden rules</h3>
        <div className="g84-chips">{order.map((k) => <button key={k} type="button" className={rules.includes(k) ? "on" : ""} onClick={() => setRules(rules.includes(k) ? rules.filter((x) => x !== k) : rules.length < 3 ? [...rules, k] : rules)}>{RULES_P2[k][0]}</button>)}</div>
        {bad > 0 && <p className="g91-note neg">⚠️ One of your rules is a trap! Read them again.</p>}
      </div>
      <div className="start-block">
        <h3>✍️ Credit vs debit: my advice for a friend</h3>
        <WordField value={text} onChange={setText} min={20} max={70} rows={4} placeholder="You should use a debit card when … However, a credit card … If you pay only …" goals={G} />
        <Starters items={["You should use a debit card when", "However,", "A credit card is useful if", "Never pay only"]} onPick={appendStarter(setText)} />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!cw || rules.length < 3 || bad > 0 || !goalsOk(text, 20, 70, G)} onClick={() => finish(26, { rules, text })}>Save Advisor Page 06 <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 3 · BUY, BORROW OR LEASE?
   ===================================================================== */
const START_P3 = {
  cards: [
    { e: "💵", t: "Cash purchase", d: "Buying something with money you already have.", ex: "Pay $60,000,000 today." },
    { e: "🗓️", t: "Installment", d: "A regular payment to repay a debt.", ex: "$1,650,000 per month." },
    { e: "📄", t: "Leasing", d: "An agreement to USE an asset in exchange for payments.", ex: "A van for 48 months." },
    { e: "🔑", t: "Financial lease", d: "A lease that may let you buy the asset at the end.", ex: "Pay the residual value." },
    { e: "🔁", t: "Operating lease", d: "A lease mainly to use the asset; you may return it at the end.", ex: "A car for 2 years." },
    { e: "🏁", t: "Residual value", d: "The agreed value to keep the asset at the end of a lease.", ex: "$8,000,000." },
    { e: "⚙️", t: "Working capital", d: "Money available for everyday business activities.", ex: "Ingredients, salaries, rent." },
    { e: "🧮", t: "Total cost", d: "ALL you pay: payments + fees + final value.", ex: "Not just the monthly payment!" },
  ],
  pairs: [{ a: "Installment", b: "A regular payment of a debt" }, { a: "Leasing", b: "Pay to use an asset" }, { a: "Residual value", b: "The value to keep it at the end" }, { a: "Working capital", b: "Money for daily operations" }, { a: "Total cost", b: "Everything you pay" }, { a: "Operating lease", b: "Mainly to use, then return" }],
};

/* ---------- LEASE OR BUY LAB · 4 estaciones ---------- */
const OFFER = (e, t, rows) => <div className="g92-offer"><b>{e} {t}</b>{rows.map(([l, v]) => <p key={l}><span>{l}</span><b>{v}</b></p>)}</div>;
const STATIONS_P3 = [
  { tag: "💵 CASH STATION · 1/2", q: "The van costs $60,000,000 and Mariana has $75,000,000 saved. How much is left after buying with cash?", answer: 15000000, money: true, hint: "75,000,000 − 60,000,000", explain: "$15,000,000 of working capital left.", visual: OFFER("💵", "Cash purchase", [["Van price", "$60,000,000"], ["Savings", "$75,000,000"]]) },
  { tag: "💵 CASH STATION · 2/2", q: "Sweet Corner spends $18,000,000 a month (ingredients $9M, salaries $6M, rent and electricity $3M). Is $15,000,000 enough for ONE month of operations?", options: ["No — she would be $3,000,000 short", "Yes, because a business only needs to pay its costs when the sales of the month arrive", "Yes, with money left", "It doesn't matter"], correct: 0, hint: "Compare 15,000,000 with 18,000,000.", explain: "Having the money to buy ≠ buying is the best idea. Working capital matters!" },
  { tag: "🏦 LOAN STATION · 1/2", q: "Loan: 48 monthly payments of $1,650,000. What is the total of the payments?", answer: 79200000, money: true, hint: "1,650,000 × 48", explain: "$79,200,000.", visual: OFFER("🏦", "Vehicle loan", [["Borrowed", "$60,000,000"], ["Period", "48 months"], ["Payment", "$1,650,000 / month"]]) },
  { tag: "🏦 LOAN STATION · 2/2", q: "How much more than the borrowed $60,000,000 does Mariana pay with the loan?", answer: 19200000, money: true, hint: "79,200,000 − 60,000,000", explain: "$19,200,000: the cost of borrowing (interest)." },
  { tag: "📄 LEASING STATION · 1/2", q: "Leasing: 48 payments of $1,500,000 + a residual value of $8,000,000 to keep the van. What is the TOTAL cost to own it?", answer: 80000000, money: true, hint: "1,500,000 × 48 + 8,000,000", explain: "$72,000,000 + $8,000,000 = $80,000,000.", visual: OFFER("📄", "Financial leasing", [["Payment", "$1,500,000 / month"], ["Period", "48 months"], ["Residual value", "$8,000,000"]]) },
  { tag: "📄 LEASING STATION · 2/2", q: "Leasing has the LOWEST monthly payment. Is it the cheapest way to OWN the van?", options: ["No — $80,000,000 vs $79,200,000 with the loan", "Yes, because the option with the lowest monthly payment is always the cheapest one in total", "Yes, $72,000,000", "They are equal"], correct: 0, hint: "Compare the two totals you calculated.", explain: "A lower payment does not automatically mean a lower total cost!" },
];
const CLAUSES_P3 = [
  { t: "“The customer pays all repairs and maintenance during the contract.”", c: "maint" },
  { t: "“Maximum 20,000 km per year. Each extra km costs $500.”", c: "km" },
  { t: "“The leasing company owns the van until the contract ends.”", c: "own" },
  { t: "“At month 48, the customer may buy the van for $8,000,000.”", c: "resid" },
  { t: "“If the customer ends the contract early, a penalty of 3 payments applies.”", c: "early" },
  { t: "“The customer must keep full insurance at all times.”", c: "ins" },
];
const CATS_P3 = [["maint", "🔧 Maintenance"], ["km", "🛣️ Mileage limit"], ["own", "🔑 Ownership"], ["resid", "🏁 Residual value"], ["early", "⛔ Early termination"], ["ins", "🛡️ Insurance"]];
const RISKEV_P3 = [
  { e: "🔧", t: "Month 7: the van needs a $3,000,000 repair — and the contract says Mariana pays repairs.", rows: [["💵 Cash", "Working capital: $15M → $12M", "no"], ["🏦 Loan", "Savings: $75M → $72M + payment $1,650,000", "ok"], ["📄 Leasing", "Savings: $75M → $72M + payment $1,500,000", "ok"]], q: "Which option suffers MOST from this repair?", options: ["Cash — it has the smallest cushion", "The loan, because the bank pays for all the repairs and then increases the monthly payment", "Leasing", "None"], correct: 0 },
  { e: "📉", t: "Month 9: a café stops buying bread. Sales fall $5,000,000 this month.", rows: [["💵 Cash", "Working capital: $12M → $7M (danger!)", "no"], ["🏦 Loan", "Still must pay $1,650,000", "ok"], ["📄 Leasing", "Still must pay $1,500,000", "ok"]], q: "What do the loan and the leasing have in common in a bad month?", options: ["The payment must still be made", "In a bad month the bank and the leasing company cancel the payment automatically", "Nothing", "They become free"], correct: 0 },
];
function LeaseLab({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [first, setFirst] = useState(0);
  const [cl, setCl] = useState({});
  const [clOk, setClOk] = useState(false);
  const [risky, setRisky] = useState(null);
  const [why, setWhy] = useState("");
  const [ev, setEv] = useState({});
  const [choice, setChoice] = useState("");
  const [reason, setReason] = useState("");
  const [st, finish] = useFinish(onSave);
  const clRight = CLAUSES_P3.filter((c, k) => cl[k] === c.c).length;
  const nEv = Object.keys(ev).length;
  const coins = 18 + first * 2 + (clRight === 6 ? 4 : 0) + Object.values(ev).filter((w) => w === 0).length * 2;
  if (st.done) return <Reward title="Advisor work done! 🚐" subtitle={`Your advice for Mariana: ${LEASE_N[choice]}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Truck size={22} strokeWidth={2.1} />} title="Lease or Buy Lab 🚐" subtitle="You are Mariana's advisor. Unlock each offer, read the contract — and live 2 surprises before you decide." onExit={onExit}>
      <Brief91 k="c3_lab" />
      <Steps91 labels={["1 · Three stations", "2 · Contract detective", "3 · Business risk", "4 · Final advice"]} at={stage} />
      {stage === 0 && <RoundsRunner rounds={STATIONS_P3} doneLabel="Open the leasing contract" onDone={(r) => { setFirst(r.firstTry); setStage(1); }} />}
      {stage === 1 && (
        <div className="start-block">
          <h3>🔎 Contract detective · Classify each clause</h3>
          {CLAUSES_P3.map((c, k) => <div key={k} className={`g92-clause ${clOk ? (cl[k] === c.c ? "ok" : "no") : ""}`}><p>{c.t}</p><select value={cl[k] || ""} onChange={(e) => { setCl({ ...cl, [k]: e.target.value }); setClOk(false); }}><option value="">Choose…</option>{CATS_P3.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>)}
          {!clOk || clRight < 6 ? <div className="p3-card-actions"><button className="s1-btn primary" disabled={Object.keys(cl).length < 6} onClick={() => setClOk(true)}>Check ({clOk ? `${clRight}/6` : "6 clauses"})</button></div> : (
            <>
              <h3>⚠️ Which clause is the BIGGEST risk for Mariana's bakery?</h3>
              <div className="g84-chips">{CLAUSES_P3.map((c, k) => <button key={k} type="button" className={risky === k ? "on" : ""} onClick={() => setRisky(k)}>{CATS_P3.find(([v]) => v === c.c)[1]}</button>)}</div>
              <WordField value={why} onChange={setWhy} min={8} max={40} rows={2} placeholder="This clause is risky because…" goals={[W_REASON, W_RISK]} />
              <div className="start-foot"><button className="s1-btn primary big" disabled={risky === null || !goalsOk(why, 8, 40, [W_REASON, W_RISK])} onClick={() => setStage(2)}>Business risk station <ChevronRight size={18} /></button></div>
            </>
          )}
        </div>
      )}
      {stage === 2 && (
        <>
          {RISKEV_P3.map((r, k) => (
            <div key={k} className="start-block">
              <div className="g83-event"><em>{r.e}</em><div><b>Surprise {k + 1}</b><span>{r.t}</span></div></div>
              <div className="g92-impact">{r.rows.map(([o, t, c]) => <p key={o} className={c}><b>{o}</b><span>{t}</span></p>)}</div>
              <PickOne q={r.q} options={r.options} correct={r.correct} onRight={(w) => setEv((x) => ({ ...x, [k]: w }))} />
            </div>
          ))}
          <div className="start-foot"><button className="s1-btn primary big" disabled={nEv < 2} onClick={() => setStage(3)}>Final advice <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 3 && (
        <div className="start-block">
          <h3>🧑‍💼 Your final advice for Mariana</h3>
          <div className="g92-pay3">{Object.entries(LEASE_N).map(([k, l]) => <button key={k} type="button" className={choice === k ? "on" : ""} onClick={() => setChoice(k)}>{l.slice(0, 2)}<b>{l.slice(3)}</b><small>{k === "cash" ? "own it, no interest" : k === "loan" ? "own it, keep cash" : "lowest payment, read the contract"}</small></button>)}</div>
          <p className="start-tip">💡 There is no single correct answer — but your reason must use the numbers and the risks you discovered.</p>
          <WordField value={reason} onChange={setReason} min={15} max={50} rows={3} placeholder="I recommend … because … The biggest risk is …" goals={[W_RECOMMEND, W_REASON, W_NUMBERS(1)]} />
          <div className="start-foot"><button className="s1-btn primary big" disabled={!choice || !goalsOk(reason, 15, 50, [W_RECOMMEND, W_REASON, W_NUMBERS(1)])} onClick={() => finish(coins, { choice, reason, firstTry: first, clauses: clRight, risky: CLAUSES_P3[risky].c, why })}>Send my advice <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </div>
      )}
    </ActShell>
  );
}

/* ---------- MY FINANCING RECOMMENDATION ---------- */
const VOC_P3 = ["installment", "interest", "leasing", "residual", "working capital", "collateral", "total cost", "repayment", "lease", "loan"];
const CHECK_P3 = ["Who pays maintenance and repairs", "Mileage limits", "Early termination penalty", "Insurance requirements", "Total of all payments", "Payment in a bad month"];
function FinancingRec({ resp, existing, onSave, onExit }) {
  const lab = resp?.c3_lab;
  const [checks, setChecks] = useState(existing?.checks || []);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const G = [W_RECOMMEND, W_RISK, W_VOCAB(VOC_P3, 3)];
  if (st.done) return <Reward title="Recommendation sent! 📨" subtitle="Mariana has a clear plan." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<FileText size={22} strokeWidth={2.1} />} title="My Financing Recommendation 📨" subtitle="Write Mariana a short, professional recommendation. Use at least 3 key words from the reading." onExit={onExit}>
      <Brief91 k="c3_rec" />
      {!lab ? <div className="p1-banner bad"><span>Do the Lease or Buy Lab first.</span></div> : <div className="g84-results g91-results"><div><small>MY ADVICE</small><b>{LEASE_N[lab.choice]}</b></div><div><small>CASH LEFT</small><b>$15,000,000</b></div><div><small>LOAN TOTAL</small><b>$79,200,000</b></div><div><small>LEASING TOTAL</small><b>$80,000,000</b></div></div>}
      <div className="start-block"><h3>🔍 Before signing, Mariana should check… (choose 2–3)</h3><div className="g84-chips">{CHECK_P3.map((c) => <button key={c} type="button" className={checks.includes(c) ? "on" : ""} onClick={() => setChecks(checks.includes(c) ? checks.filter((x) => x !== c) : checks.length < 3 ? [...checks, c] : checks)}>{c}</button>)}</div></div>
      <div className="start-block">
        <h3>✍️ Dear Mariana…</h3>
        <WordField value={text} onChange={setText} min={30} max={90} rows={5} placeholder="Dear Mariana, I recommend … because … Its main advantage is … The biggest risk is … Before you sign, check …" goals={G} />
        <Starters items={["Dear Mariana, I recommend", "Its main advantage is", "The biggest risk is", "Before you sign, you should check"]} onPick={appendStarter(setText)} />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!lab || checks.length < 2 || !goalsOk(text, 30, 90, G)} onClick={() => finish(24, { choice: lab.choice, checks, text })}>Send it <span className="coin-tag"><Coins size={15} /> +24</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 4 · RISK & RETURN: INVESTMENT FUNDS
   ===================================================================== */
const START_P4 = {
  cards: [
    { e: "🧺", t: "Mutual fund", d: "Money from many investors, managed by a professional.", ex: "10 people × $1,000." },
    { e: "🥚", t: "Diversification", d: "Spreading money across different investments.", ex: "Don't put all your eggs in one basket." },
    { e: "📊", t: "Stocks", d: "Small parts of companies. They can grow a lot — or fall a lot.", ex: "Higher risk." },
    { e: "📜", t: "Bonds", d: "Loans to companies or governments that pay interest.", ex: "Usually lower risk." },
    { e: "🎢", t: "Risk", d: "The possibility of losing money or getting a different result.", ex: "−22% in a bad year." },
    { e: "💹", t: "Return", d: "The gain or loss of an investment.", ex: "+8% this year." },
    { e: "🏷️", t: "Fee (AUM fee)", d: "The % the manager charges every year.", ex: "0.5% vs 3% — big difference!" },
    { e: "🧭", t: "Risk profile", d: "How much risk YOU can accept: conservative, moderate, aggressive.", ex: "When do you need the money?" },
  ],
  pairs: [{ a: "Diversification", b: "Spread money across investments" }, { a: "Stocks", b: "Parts of companies" }, { a: "Bonds", b: "Loans that pay interest" }, { a: "Return", b: "The gain or loss" }, { a: "Fee", b: "What the manager charges" }, { a: "Risk profile", b: "How much risk you accept" }],
};
const FUNDS_P4 = [
  { id: "safe", e: "🛡️", n: "Safe Fund", p: "Conservative · mostly bonds", c: "#0b7a50", r: [4, 3, 3, 2, 4] },
  { id: "bal", e: "⚖️", n: "Balanced Fund", p: "Moderate · bonds + stocks", c: "#f5b23e", r: [8, -6, 7, 1, 9] },
  { id: "grow", e: "🚀", n: "Growth Fund", p: "Aggressive · mostly stocks", c: "#ff6b57", r: [15, -22, 25, -5, 12] },
];
const NEWS_P4 = [
  { e: "🌞", t: "Year 1 · The economy grows. Companies sell more." },
  { e: "🌩️", t: "Year 2 · MARKET CRASH! Stocks fall all over the world." },
  { e: "💻", t: "Year 3 · Technology companies grow fast." },
  { e: "🎈", t: "Year 4 · Inflation rises to 9%. Prices go up." },
  { e: "🌈", t: "Year 5 · Markets recover." },
];
const PROFILE_P4 = [
  { q: "When will you need this money?", o: [["In less than 1 year", 0], ["In 2–4 years", 1], ["In more than 5 years", 2]] },
  { q: "Your investment falls 15% in one month. You…", o: [["sell everything, I can't sleep", 0], ["wait and check the plan", 1], ["buy more, it's cheaper", 2]] },
  { q: "What is more important for you?", o: [["Stability", 0], ["A balance", 1], ["Maximum growth", 2]] },
  { q: "Could you accept a temporary loss?", o: [["No", 0], ["A small one", 1], ["Yes, for a bigger gain later", 2]] },
];
const profName4 = (p) => (p <= 2 ? "🛡️ Conservative" : p <= 5 ? "⚖️ Moderate" : "🚀 Aggressive");
const run4 = (mix, soldAt = null) => { let v = 10000000; const vals = [v]; for (let y = 0; y < 5; y++) { if (soldAt !== null && y >= soldAt) { vals.push(v); continue; } const g = FUNDS_P4.reduce((a, f) => a + (mix[f.id] / 100) * f.r[y], 0); v = Math.round(v * (1 + g / 100)); vals.push(v); } return vals; };
const FEE_P4 = [
  { tag: "FEE DETECTIVE · 1/2", q: "Fund Alpha and Fund Beta both earn 8% before fees on $10,000,000. Alpha charges 0.5%; Beta charges 3%. How much do you have after one year with ALPHA?", answer: 10750000, money: true, hint: "8% − 0.5% = 7.5% of 10,000,000, plus the 10,000,000.", explain: "$10,750,000." },
  { tag: "FEE DETECTIVE · 2/2", q: "With BETA (8% − 3% = 5%) you have $10,500,000. How much do you LOSE to the higher fee in one year?", answer: 250000, money: true, hint: "10,750,000 − 10,500,000", explain: "$250,000 in ONE year — fees matter!" },
];
const feeLine = (fee, years) => Array.from({ length: years + 1 }, (_, i) => Math.round(10000000 * Math.pow(1 + (8 - fee) / 100, i)));
function FundMarket({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [prof, setProf] = useState({});
  const [mix, setMix] = useState({ safe: 40, bal: 30, grow: 30 });
  const [year, setYear] = useState(0);
  const [sold, setSold] = useState(null);
  const [crashPick, setCrashPick] = useState(null);
  const [fee, setFee] = useState(null);
  const [feeYears, setFeeYears] = useState(1);
  const [st, finish] = useFinish(onSave);
  const sum = mix.safe + mix.bal + mix.grow;
  const pScore = Object.values(prof).reduce((a, v) => a + v, 0);
  const vals = run4(mix, sold);
  const shown = vals.slice(0, year + 1);
  const final = vals[5], ret = +(((final - 10000000) / 10000000) * 100).toFixed(1);
  const bench = [["🛡️ All safe", run4({ safe: 100, bal: 0, grow: 0 })[5]], ["⚖️ All balanced", run4({ safe: 0, bal: 100, grow: 0 })[5]], ["🚀 All growth", run4({ safe: 0, bal: 0, grow: 100 })[5]], ["😱 Growth + panic sell in year 2", run4({ safe: 0, bal: 0, grow: 100 }, 2)[5]]];
  const coins = 18 + (fee ? fee.firstTry * 3 : 0) + (sold === null ? 4 : 0) + (mix.safe < 100 && mix.grow < 100 ? 2 : 0);
  if (st.done) return <Reward title="Five years later… 📈" subtitle={`${cop(final)} · ${ret >= 0 ? "+" : ""}${ret}% (hypothetical)`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<LineIcon size={22} strokeWidth={2.1} />} title="Fund Market · Five Years Later 📈" subtitle="You manage a fictional $10,000,000 portfolio. Results are hypothetical — no mix wins every year." onExit={onExit}>
      <Brief91 k="c4_market" />
      <Steps91 labels={["1 · Risk profile", "2 · Build the mix", "3 · Five years", "4 · Fee detective"]} at={stage} />
      {stage === 0 && (
        <>
          {PROFILE_P4.map((p, k) => <div key={k} className="start-block"><p className="quiz-q">{k + 1}. {p.q}</p><Tri value={prof[k]} onPick={(v) => setProf({ ...prof, [k]: v })} opts={p.o.map(([l, v]) => [v, l])} /></div>)}
          {Object.keys(prof).length === 4 && <div className="p1-banner good"><span>Your educational risk profile: <b>{profName4(pScore)}</b>. (Not real financial advice — a way to think about risk.)</span></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={Object.keys(prof).length < 4} onClick={() => setStage(1)}>Build my portfolio <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 1 && (
        <div className="start-block">
          <div className="g92-funds">{FUNDS_P4.map((f) => <div key={f.id} style={{ borderTopColor: f.c }}><b>{f.e} {f.n}</b><span>{f.p}</span><Ctl l="%" v={mix[f.id]} set={(v) => setMix({ ...mix, [f.id]: v })} mn={0} mx={100} stp={10} fmt={(v) => `${v}%`} /><small>{cop(10000000 * mix[f.id] / 100)}</small></div>)}</div>
          <PctBar parts={FUNDS_P4.map((f) => ({ label: f.n, value: mix[f.id], color: f.c }))} />
          <p className={`g91-note ${sum === 100 ? "pos" : "neg"}`}>{sum === 100 ? "✅ 100% invested." : `Total: ${sum}% — it must be 100%.`} Your profile: {profName4(pScore)}.</p>
          <div className="start-foot"><button className="s1-btn primary big" disabled={sum !== 100} onClick={() => setStage(2)}>Start year 1 <ChevronRight size={18} /></button></div>
        </div>
      )}
      {stage === 2 && (
        <div className="start-block">
          <LineChart series={[{ name: "My portfolio", color: "#16b074", values: shown }]} labels={["Start", "Y1", "Y2", "Y3", "Y4", "Y5"].slice(0, year + 1)} yMin={6000000} yMax={14000000} />
          {year > 0 && <div className="g83-event"><em>{NEWS_P4[year - 1].e}</em><div><b>{NEWS_P4[year - 1].t}</b><span>Your portfolio: {cop(vals[year])} ({vals[year] >= vals[year - 1] ? "+" : ""}{(((vals[year] - vals[year - 1]) / vals[year - 1]) * 100).toFixed(1)}%){sold !== null && year > sold ? " · you are in cash" : ""}{year === 4 ? ` · with 9% inflation, it buys like ${cop(Math.round(vals[4] / 1.09))} of last year` : ""}</span></div></div>}
          {year === 2 && sold === null && crashPick === null && (
            <div className="g92-pay3">
              <button type="button" onClick={() => { setSold(2); setCrashPick("sell"); }}>😱<b>Sell everything</b><small>move to cash now</small></button>
              <button type="button" onClick={() => setCrashPick("stay")}>🧘<b>Stay invested</b><small>follow the plan</small></button>
              <button type="button" onClick={() => setCrashPick("rebal")}>⚖️<b>Rebalance</b><small>back to my mix</small></button>
            </div>
          )}
          {year === 2 && crashPick && <div className={`p1-banner ${crashPick === "sell" ? "bad" : "good"}`}><span>{crashPick === "sell" ? "You sold after the fall. Your loss is now real — and you will miss any recovery." : "You stayed calm. A temporary fall is not a loss until you sell."}</span></div>}
          <div className="start-foot">{year < 5 ? <button className="s1-btn primary big" disabled={year === 2 && !crashPick} onClick={() => setYear(year + 1)}>{year === 0 ? "Play year 1" : `Next year (${year + 1})`} <ChevronRight size={18} /></button> : <button className="s1-btn primary big" onClick={() => setStage(3)}>Fee detective <ChevronRight size={18} /></button>}</div>
          {year === 5 && (
            <div className="g92-bench">
              <div className="me"><span>🧑 My portfolio</span><b>{cop(final)} ({ret >= 0 ? "+" : ""}{ret}%)</b></div>
              {bench.map(([l, v]) => <div key={l}><span>{l}</span><b>{cop(v)} ({(((v - 1e7) / 1e7) * 100).toFixed(1)}%)</b></div>)}
              <p>💡 Growth had the best AND the worst years. Balanced was smoother. Panic selling was the worst decision of all.</p>
            </div>
          )}
        </div>
      )}
      {stage === 3 && (
        <>
          <Mission e="🔎" title="Fee detective · the hidden cost">Two funds earn the SAME 8% a year before fees. Fund Alpha charges 0.5% a year; Fund Beta charges 3%. Move the years and watch how a “small” fee grows.</Mission>
          <div className="start-block">
            <Ctl l="⏳ Years invested" v={feeYears} set={setFeeYears} mn={1} mx={20} stp={1} fmt={(v) => `${v} ${v === 1 ? "year" : "years"}`} />
            <LineChart series={[{ name: "Alpha · 0.5% fee", color: "#16b074", values: feeLine(0.5, feeYears) }, { name: "Beta · 3% fee", color: "#ff6b57", values: feeLine(3, feeYears) }]} labels={Array.from({ length: feeYears + 1 }, (_, i) => (i === 0 ? "Start" : feeYears > 10 && i % 5 !== 0 ? "" : `Y${i}`))} />
            <ChartLegend series={[{ name: "Alpha · 0.5% fee", color: "#16b074" }, { name: "Beta · 3% fee", color: "#ff6b57" }]} />
            <div className="g84-results g91-results"><div><small>ALPHA AFTER {feeYears} Y</small><b>{cop(feeLine(0.5, feeYears)[feeYears])}</b></div><div><small>BETA AFTER {feeYears} Y</small><b>{cop(feeLine(3, feeYears)[feeYears])}</b></div><div><small>LOST TO THE FEE</small><b className="neg">{cop(feeLine(0.5, feeYears)[feeYears] - feeLine(3, feeYears)[feeYears])}</b></div></div>
            <p className="g91-note">{feeYears < 10 ? "Move the bar to 10 and 20 years… 👀" : `In ${feeYears} years the 3% fee takes ${cop(feeLine(0.5, feeYears)[feeYears] - feeLine(3, feeYears)[feeYears])} from you — for the SAME investment.`}</p>
          </div>
          {!fee ? (
            <div className="start-block"><h3>🧮 Now calculate it yourself</h3><RoundsRunner rounds={FEE_P4} doneLabel="See my Fund Market report" onDone={setFee} /></div>
          ) : (
            <>
              <div className="g92-report">
                <header><em>📈</em><div><small>MY FUND MARKET REPORT</small><b>{profName4(pScore)} investor · mix {mix.safe}/{mix.bal}/{mix.grow}</b></div></header>
                <div><p><span>💰 Start</span><b>{cop(10000000)}</b></p><p><span>📅 After 5 years</span><b className={ret >= 0 ? "pos" : "neg"}>{cop(final)} ({ret >= 0 ? "+" : ""}{ret}%)</b></p><p><span>🌩️ In the crash</span><b>{crashPick === "sell" ? "Sold 😱" : crashPick === "rebal" ? "Rebalanced ⚖️" : "Stayed 🧘"}</b></p><p><span>🔎 Fee lesson (20 years)</span><b className="neg">−{cop(feeLine(0.5, 20)[20] - feeLine(3, 20)[20])}</b></p></div>
                <ul><li>{sold === null ? "✅ You didn't sell in the crash: +4 🪙" : "❌ You sold in the crash: the loss became real."}</li><li>{mix.safe < 100 && mix.grow < 100 ? "✅ Diversified mix: +2 🪙" : "❌ 100% in one fund: no diversification."}</li><li>✅ Fee calculations right on the first try: {fee.firstTry}/2 (+{fee.firstTry * 3} 🪙)</li></ul>
              </div>
              <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(coins, { mix, final, ret, sold: sold !== null, crash: crashPick, profile: profName4(pScore), feeFirst: fee.firstTry })}>Save my portfolio <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
            </>
          )}
        </>
      )}
    </ActShell>
  );
}

/* ---------- ADVISOR PAGE 07 · Portfolio Lab (juego con TU dinero del distrito) ---------- */
const LAB_P4 = [
  { id: "save", e: "🏦", n: "Savings account", d: "No risk · fee 0%", c: "#9fc9b3", fee: 0 },
  { id: "safe", e: "🛡️", n: "Safe Fund", d: "Bonds · fee 0.8%", c: "#0b7a50", fee: 0.8 },
  { id: "bal", e: "⚖️", n: "Balanced Fund", d: "Bonds + stocks · fee 1.2%", c: "#f5b23e", fee: 1.2 },
  { id: "grow", e: "🚀", n: "Growth Fund", d: "Stocks · fee 1.5%", c: "#ff6b57", fee: 1.5 },
];
/* Años posibles del mercado (rendimiento ANTES de comisiones): ahorro, seguro, balanceado, crecimiento */
const YEARS_P4 = [
  { e: "🌞", t: "Boom year", d: "Companies sell a lot.", r: { save: 3, safe: 5, bal: 12, grow: 24 } },
  { e: "🙂", t: "Normal year", d: "Nothing special.", r: { save: 3, safe: 4, bal: 7, grow: 10 } },
  { e: "🌩️", t: "Market crash", d: "Stocks fall all over the world.", r: { save: 3, safe: 2, bal: -9, grow: -25 } },
  { e: "🎈", t: "High inflation", d: "Rates go up, bonds and stocks fall.", r: { save: 3, safe: -2, bal: -4, grow: -8 } },
  { e: "💻", t: "Tech rally", d: "Technology companies fly.", r: { save: 3, safe: 3, bal: 9, grow: 20 } },
  { e: "😐", t: "Flat year", d: "Markets move sideways.", r: { save: 3, safe: 3, bal: 2, grow: -1 } },
  { e: "🌈", t: "Recovery", d: "Markets come back after a bad year.", r: { save: 3, safe: 5, bal: 11, grow: 18 } },
];
const labDeck = () => { const d = Array.from({ length: 5 }, () => YEARS_P4[Math.floor(Math.random() * YEARS_P4.length)]); if (!d.some((y) => y.r.grow < 0)) d[1 + Math.floor(Math.random() * 3)] = YEARS_P4[Math.random() < 0.5 ? 2 : 3]; let bad = 0; return d.map((y, i) => { if (y.r.grow < 0) { bad++; if (bad > 2) return YEARS_P4[6]; } if (i > 0 && d[i - 1].r.grow < -10 && y.r.grow < 0) return YEARS_P4[6]; return y; }); }; /* 1–2 años malos máximo, como en la vida real a veces hay rebote */
const labYear = (alloc, y) => LAB_P4.reduce((a, f) => a + (alloc[f.id] / 100) * (y.r[f.id] - f.fee), 0);
const labRun = (alloc, deck, start) => { let v = start; const out = [v]; deck.forEach((y) => { v = Math.round(v * (1 + labYear(alloc, y) / 100)); out.push(v); }); return out; };
function PortfolioPage({ resp, existing, onSave, onExit }) {
  const m = resp?.c4_market;
  const S = seasonOf({ ...resp, c4_page: null, c7_crypto: null, c8_shield: null });
  const [stage, setStage] = useState(existing?.alloc ? 3 : 0);
  const [pct, setPct] = useState(existing?.pct ?? 30);
  const [alloc, setAlloc] = useState(existing?.alloc || { save: 25, safe: 25, bal: 25, grow: 25 });
  const [deck, setDeck] = useState(existing?.deck ? existing.deck.map((i) => YEARS_P4[i]) : labDeck());
  const [yr, setYr] = useState(existing?.alloc ? 5 : 0);
  const [playing, setPlaying] = useState(false);
  const [runs, setRuns] = useState(existing?.runs || []);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const G = [W_REASON, W_RISK, W_NUMBERS(1)];
  const put = Math.round(S.cash * pct / 100);
  const sum = LAB_P4.reduce((a, f) => a + alloc[f.id], 0);
  const expRet = +LAB_P4.reduce((a, f) => a + (alloc[f.id] / 100) * ((YEARS_P4.reduce((s, y) => s + y.r[f.id], 0) / YEARS_P4.length) - f.fee), 0).toFixed(1);
  const worst = +LAB_P4.reduce((a, f) => a + (alloc[f.id] / 100) * (Math.min(...YEARS_P4.map((y) => y.r[f.id])) - f.fee), 0).toFixed(1);
  const risk = Math.round(LAB_P4.reduce((a, f) => a + (alloc[f.id] / 100) * { save: 0, safe: 15, bal: 50, grow: 100 }[f.id], 0));
  const maxOne = Math.max(...LAB_P4.map((f) => alloc[f.id]));
  const vals = labRun(alloc, deck, put);
  const savOnly = labRun({ save: 100, safe: 0, bal: 0, grow: 0 }, deck, put);
  const growOnly = labRun({ save: 0, safe: 0, bal: 0, grow: 100 }, deck, put);
  const final = vals[5], ret = put ? +(((final - put) / put) * 100).toFixed(1) : 0;
  useEffect(() => { if (!playing) return undefined; if (yr >= 5) { setPlaying(false); return undefined; } const t = setTimeout(() => setYr((v) => v + 1), 1100); return () => clearTimeout(t); }, [playing, yr]);
  useEffect(() => { if (yr === 5 && stage === 2 && !playing) setRuns((r) => (r.length && r[r.length - 1].key === deck.map((y) => y.t).join() ? r : [...r, { key: deck.map((y) => y.t).join(), ret, final }].slice(-3))); }, [yr, playing]); // eslint-disable-line react-hooks/exhaustive-deps
  const bonusDiv = maxOne <= 60 ? 3 : 0, bonusRes = pct <= 50 ? 3 : 0;
  const coins = 26 + bonusDiv + bonusRes;
  const setA = (id, v) => setAlloc({ ...alloc, [id]: v });
  const replay = () => { setDeck(labDeck()); setYr(0); setPlaying(true); };
  if (st.done) return <Reward title="Advisor page 07 saved! 🧾" subtitle={`You invested ${cop(put)} → ${cop(final)} after 5 simulated years (${ret >= 0 ? "+" : ""}${ret}%)`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  const cur = yr > 0 ? deck[yr - 1] : null;
  return (
    <ActShell icon={<TrendingUp size={22} strokeWidth={2.1} />} title="Portfolio Lab · My Investment Portfolio 📈" subtitle="Advisor Page 07 · Invest part of YOUR district money in different funds — then live 5 market years." onExit={onExit}>
      <Brief91 k="c4_page" />
      <PBadge n="07" />
      {m && <div className="g92-carry"><em>📊</em><div><small>FROM THE FUND MARKET</small><b>Your profile: {m.profile} · mix {m.mix.safe}/{m.mix.bal}/{m.mix.grow} · {m.ret >= 0 ? "+" : ""}{m.ret}%</b><span>{m.sold ? "You sold in the crash — this time, try to stay calm." : "You stayed calm in the crash. Use that lesson with YOUR money."}</span></div></div>}
      <Steps91 labels={["1 · How much", "2 · Where", "3 · 5 market years", "4 · Explain"]} at={stage} />
      {stage === 0 && (
        <div className="start-block">
          <h3>💰 Step 1 · How much of YOUR cash do you invest?</h3>
          <p className="start-tip">You have {cop(S.cash)} in your district account. Money you invest can go down — keep some cash for emergencies.</p>
          <Ctl l="📈 Invest" v={pct} set={setPct} mn={0} mx={80} stp={5} fmt={(v) => `${v}%`} />
          <div className="g84-results g91-results"><div><small>YOU INVEST</small><b>{cop(put)}</b></div><div><small>STAYS IN CASH</small><b>{cop(S.cash - put)}</b></div><div><small>EMERGENCY RESERVE</small><b className={pct <= 50 ? "pos" : "neg"}>{pct <= 50 ? "✅ Healthy" : "⚠️ Too small"}</b></div></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={pct === 0} onClick={() => setStage(1)}>{pct === 0 ? "Invest at least 5%" : "Step 2: where do I put it?"} <ChevronRight size={18} /></button></div>
        </div>
      )}
      {stage === 1 && (
        <div className="start-block">
          <h3>🧺 Step 2 · Split {cop(put)} between 4 options</h3>
          <p className="start-tip">Move each bar. The total must be 100%. Watch the meters: more growth = more possible return AND bigger falls. Fees are taken every year.</p>
          <div className="g92-lab">{LAB_P4.map((f) => <div key={f.id} style={{ borderTopColor: f.c }}><header><em>{f.e}</em><div><b>{f.n}</b><small>{f.d}</small></div><strong>{alloc[f.id]}%</strong></header><Ctl l="" v={alloc[f.id]} set={(v) => setA(f.id, v)} mn={0} mx={100} stp={5} fmt={(v) => `${v}%`} /><span>{cop(Math.round(put * alloc[f.id] / 100))}</span></div>)}</div>
          <PctBar parts={LAB_P4.map((f) => ({ label: f.n, value: alloc[f.id], color: f.c }))} />
          <div className="g91-meters">
            <Bar91 label="🎢 Risk level" value={risk} color={risk > 65 ? "#ff6b57" : risk > 35 ? "#f5b23e" : "#16b074"} suffix="/100" />
            <div className="g91-mini"><span>📈 Average year (after fees) <b>{expRet >= 0 ? "+" : ""}{expRet}%</b></span><span className={worst < -10 ? "neg" : ""}>🌩️ Worst possible year <b>{worst}%</b></span><span className={maxOne <= 60 ? "pos" : "neg"}>🥚 Biggest option <b>{maxOne}%</b></span></div>
          </div>
          <p className={`g91-note ${sum === 100 ? "pos" : "neg"}`}>{sum === 100 ? "✅ 100% placed." : `Total: ${sum}% — it must be exactly 100% (${sum > 100 ? "remove" : "add"} ${Math.abs(100 - sum)}%).`}</p>
          <div className="start-foot"><button className="s1-btn ghost" onClick={() => setStage(0)}>Back</button><button className="s1-btn primary big" disabled={sum !== 100} onClick={() => { setStage(2); setYr(0); setPlaying(true); }}><Play size={17} /> Play 5 market years</button></div>
        </div>
      )}
      {stage >= 2 && (
        <div className="start-block">
          <h3>🎢 Step 3 · Five market years{playing ? " — playing…" : ""}</h3>
          <div className="g92-years">{deck.map((y, i) => <div key={i} className={i < yr ? "on" : i === yr && playing ? "next" : ""}><small>Year {i + 1}</small><em>{i < yr ? y.e : "❔"}</em><b>{i < yr ? y.t : "?"}</b>{i < yr && <span className={labYear(alloc, y) >= 0 ? "pos" : "neg"}>{labYear(alloc, y) >= 0 ? "+" : ""}{labYear(alloc, y).toFixed(1)}%</span>}</div>)}</div>
          <LineChart series={[{ name: "My portfolio", color: "#16b074", values: vals.slice(0, yr + 1) }, { name: "Only savings", color: "#9fc9b3", values: savOnly.slice(0, yr + 1) }, { name: "Only growth", color: "#ff6b57", values: growOnly.slice(0, yr + 1) }]} labels={["Start", "Y1", "Y2", "Y3", "Y4", "Y5"].slice(0, yr + 1)} yMin={Math.round(put * 0.55)} yMax={Math.round(put * 1.7)} />
          <ChartLegend series={[{ name: "My portfolio", color: "#16b074" }, { name: "Only savings", color: "#9fc9b3" }, { name: "Only growth", color: "#ff6b57" }]} />
          {cur && <div className="g83-event"><em>{cur.e}</em><div><b>Year {yr} · {cur.t}</b><span>{cur.d} Your portfolio: {cop(vals[yr])} ({labYear(alloc, cur) >= 0 ? "+" : ""}{labYear(alloc, cur).toFixed(1)}% after fees)</span></div></div>}
          {yr === 5 && !playing && (
            <>
              <div className="g84-results g91-results"><div><small>YOU INVESTED</small><b>{cop(put)}</b></div><div><small>AFTER 5 YEARS</small><b className={ret >= 0 ? "pos" : "neg"}>{cop(final)}</b></div><div><small>RETURN</small><b className={ret >= 0 ? "pos" : "neg"}>{ret >= 0 ? "+" : ""}{ret}%</b></div><div><small>ONLY SAVINGS</small><b>{cop(savOnly[5])}</b></div></div>
              {runs.length > 1 && <div className="g92-runs"><b>🎲 Your simulations:</b>{runs.map((r, i) => <span key={i} className={r.ret >= 0 ? "pos" : "neg"}>#{i + 1}: {r.ret >= 0 ? "+" : ""}{r.ret}%</span>)}<small>Same portfolio, different years → different results. That is RISK.</small></div>}
              {stage === 2 && <div className="start-foot"><button className="s1-btn ghost" onClick={() => setStage(1)}>Change my mix</button>{runs.length < 3 && <button className="s1-btn ghost" onClick={replay}>🎲 Play 5 new years ({3 - runs.length} left)</button>}<button className="s1-btn primary big" onClick={() => setStage(3)}>Step 4: explain my portfolio <ChevronRight size={18} /></button></div>}
            </>
          )}
        </div>
      )}
      {stage === 3 && (
        <div className="start-block">
          <h3>✍️ Step 4 · Explain your portfolio</h3>
          <ul className="g92-checks"><li className={bonusRes ? "ok" : ""}>{bonusRes ? "✅" : "⬜"} Emergency reserve: you invested 50% or less (+3 🪙)</li><li className={bonusDiv ? "ok" : ""}>{bonusDiv ? "✅" : "⬜"} Diversified: no option above 60% (+3 🪙)</li></ul>
          <WordField value={text} onChange={setText} min={20} max={70} rows={4} placeholder="I put … in … because … One risk is … If the market falls, I will …" goals={G} />
        </div>
      )}
      <div className="start-foot">{stage === 3 && <button className="s1-btn ghost" onClick={() => setStage(1)}>Change my mix</button>}<button className="s1-btn primary big" disabled={stage !== 3 || !goalsOk(text, 20, 70, G)} onClick={() => finish(coins, { pct, put, alloc, deck: deck.map((y) => YEARS_P4.indexOf(y)), final, ret, runs, text })}>Save Advisor Page 07 <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 5 · YOUR FUTURE SELF: PENSIONS
   ===================================================================== */
const START_P5 = {
  cards: [
    { e: "🏖️", t: "Retirement", d: "The period of life when a person stops working regularly.", ex: "Around 60–65 years old." },
    { e: "🧓", t: "Pension", d: "Income or support during retirement, under the rules of a system.", ex: "A monthly payment." },
    { e: "➕", t: "Contribution", d: "Money paid into a savings or pension system.", ex: "$100,000 every month." },
    { e: "❄️", t: "Compound interest", d: "Returns earned on your money AND on past returns.", ex: "5% on $1,050,000, not on $1,000,000." },
    { e: "⏳", t: "Time horizon", d: "How long until you need the money.", ex: "45 years for a 20-year-old." },
    { e: "🎈", t: "Inflation", d: "Prices go up, so money buys less.", ex: "$100,000 → $104,000 next year." },
    { e: "🛒", t: "Purchasing power", d: "How many things your money can buy.", ex: "It falls with inflation." },
    { e: "🔁", t: "Consistent", d: "Happening regularly over time.", ex: "Saving every month, not only sometimes." },
  ],
  pairs: [{ a: "Retirement", b: "When you stop working regularly" }, { a: "Contribution", b: "Money paid into the system" }, { a: "Compound interest", b: "Returns on returns" }, { a: "Inflation", b: "Prices go up" }, { a: "Purchasing power", b: "What your money can buy" }, { a: "Consistent", b: "Happening regularly" }],
};

/* ---------- RETIREMENT TIME MACHINE ---------- */
const grow5 = ({ start = 20, monthly = 100000, raise = 0, withdraw = false, net40 = 4, crash = 0 }) => {
  let b = 0; const pts = [];
  for (let age = start; age < 65; age++) {
    const r = age < 40 ? 4 : net40;
    const m = monthly + (age >= 25 ? raise : 0);
    b = b * (1 + r / 100) + m * 12;
    if (age === 30 && withdraw) b = Math.max(0, b - 5000000);
    if (age === 60) b = b * (1 - crash / 100);
    if (age % 5 === 0) pts.push(Math.round(b));
  }
  return { final: Math.round(b), pts };
};
const LIFE_P5 = [
  { age: 25, e: "📈", t: "You get a salary increase!", a: ["Save $50,000 more every month", { raise: 50000 }], b: ["Spend the whole raise", {}] },
  { age: 30, e: "🚗", t: "An unexpected $5,000,000 car repair.", a: ["Use my emergency fund", {}], b: ["Withdraw $5,000,000 from my retirement savings", { withdraw: true }] },
  { age: 40, e: "🏷️", t: "Two plans with the same 5% return before fees.", a: ["Plan A · fee 0.5% → 4.5% net", { net40: 4.5 }], b: ["Plan B · fee 2% → 3% net", { net40: 3 }] },
  { age: 50, e: "🎢", t: "Risk review: you need the money in 15 years. Markets can fall.", a: ["Move part to safer investments", { crash: 10 }], b: ["Keep everything in risky investments", { crash: 25 }] },
];
const INFL_P5 = [
  { tag: "INFLATION MONSTER · 1/2", q: "A basket of groceries costs $100,000 today. With 4% inflation, how much does it cost next year?", answer: 104000, money: true, hint: "100,000 + 4% of 100,000.", explain: "$104,000. The same money buys a little less every year." },
  { tag: "INFLATION MONSTER · 2/2", q: "With 4% inflation, prices double in about 18 years. Then, $1,000,000 will buy what about how much buys TODAY?", answer: 500000, money: true, hint: "If prices double, money buys half.", explain: "About $500,000 of today's things. That's why savings must grow!" },
];
function TimeMachine({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [start, setStart] = useState(20);
  const [monthly, setMonthly] = useState(100000);
  const [tried, setTried] = useState([20]);
  const [why, setWhy] = useState(null);
  const [life, setLife] = useState({});
  const [orders] = useState(() => LIFE_P5.map(() => (Math.random() < 0.5 ? ["a", "b"] : ["b", "a"])));
  const [inf, setInf] = useState(null);
  const [st, finish] = useFinish(onSave);
  const G = grow5({ start, monthly });
  const A20 = grow5({ start: 20, monthly }), A35 = grow5({ start: 35, monthly });
  const opts = Object.entries(life).reduce((o, [k, v]) => ({ ...o, ...LIFE_P5[k][v][1] }), { start: 20, monthly });
  const J = grow5(opts);
  const best = grow5({ start: 20, monthly, raise: 50000, net40: 4.5, crash: 10 });
  const nLife = Object.keys(life).length;
  const good = Object.values(life).filter((v) => v === "a").length;
  const real = Math.round(J.final / 5.84);
  const monthIncome = Math.round(real / 240);
  const coins = 18 + good * 3 + (why === 0 ? 3 : 0) + (inf ? inf.firstTry * 2 : 0);
  if (st.done) return <Reward title="Hello, future self! 🧓" subtitle={`At 65 (hypothetical): ${cop(J.final)} · about ${cop(real)} in today's money`} coins={st.coins} saving={st.saving} onExit={onExit} gold={good === 4} />;
  return (
    <ActShell icon={<Hourglass size={22} strokeWidth={2.1} />} title="Retirement Time Machine 🧓" subtitle="Travel through a whole life of saving. Returns are hypothetical (4% per year) — not promises." onExit={onExit}>
      <Brief91 k="c5_time" />
      <Steps91 labels={["1 · Time jumper", "2 · Life journey", "3 · Inflation monster", "4 · Age 65"]} at={stage} />
      {stage === 0 && (
        <>
          <div className="start-block">
            <Ctl l="🎂 Start saving at age" v={start} set={(v) => { setStart(v); if (!tried.includes(v)) setTried([...tried, v]); }} mn={20} mx={40} stp={5} fmt={(v) => `${v}`} />
            <Ctl l="💰 Every month" v={monthly} set={setMonthly} mn={100000} mx={500000} stp={50000} fmt={cop} />
            <div className="g84-results g91-results"><div><small>YEARS SAVING</small><b>{65 - start}</b></div><div><small>CONTRIBUTIONS</small><b>{(65 - start) * 12}</b></div><div><small>YOU PUT IN</small><b>{cop(monthly * 12 * (65 - start))}</b></div><div><small>AT 65</small><b>{cop(G.final)}</b></div></div>
            <LineChart series={[{ name: "Start at 20", color: "#16b074", values: A20.pts }, { name: "Start at 35", color: "#ff6b57", values: [0, 0, 0, ...A35.pts].slice(0, A20.pts.length) }]} labels={A20.pts.map((_, i) => `${20 + i * 5}`)} />
            <ChartLegend series={[{ name: `Start at 20 → ${cop(A20.final)}`, color: "#16b074" }, { name: `Start at 35 → ${cop(A35.final)}`, color: "#ff6b57" }]} />
            {tried.length < 3 && <p className="start-tip">Move the age slider: try at least 3 different ages ({tried.length}/3).</p>}
          </div>
          {tried.length >= 3 && <PickOne tag="TIME JUMPER" q={`Starting at 20, you put in ${(45 / 30).toFixed(1)} times more money than starting at 35, but you finish with about ${(A20.final / A35.final).toFixed(1)} times more. Why?`} options={["Compound interest: more years of returns on returns", "Because older people always receive a lower interest rate than young people at the bank", "Luck", "A mistake"]} correct={0} explain="Time is a financial resource: the early years keep compounding for decades." onRight={setWhy} />}
          <div className="start-foot"><button className="s1-btn primary big" disabled={why === null} onClick={() => setStage(1)}>Start the life journey <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 1 && (
        <>
          <div className="g92-life">{[20, ...LIFE_P5.map((l) => l.age), 65].map((a, i) => <span key={a} className={i === 0 || life[i - 1] ? "on" : ""}>{a}</span>)}</div>
          {LIFE_P5.map((l, k) => (k === 0 || life[k - 1]) && (
            <div key={l.age} className="start-block">
              <div className="g83-event"><em>{l.e}</em><div><b>Age {l.age}</b><span>{l.t}</span></div></div>
              <div className="quiz-options">{orders[k].map((x, pos) => <button key={x} type="button" disabled={!!life[k]} className={`quiz-opt ${life[k] === x ? (x === "a" ? "correct" : "wrong") : ""}`} onClick={() => setLife({ ...life, [k]: x })}><span className="opt-key">{"AB"[pos]}</span><span className="opt-text">{l[x][0]}</span></button>)}</div>
              {life[k] && <p className={`g91-note ${life[k] === "a" ? "pos" : "neg"}`}>{life[k] === "a" ? "✅ Your future self says thank you." : "⚠️ This decision reduces your future savings."}</p>}
            </div>
          ))}
          {nLife === 4 && <div className="g92-future"><small>🧓 AGE 65 · HYPOTHETICAL</small><b>{cop(J.final)}</b><span>Best possible path: {cop(best.final)} · difference {cop(best.final - J.final)}</span></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={nLife < 4} onClick={() => setStage(2)}>The inflation monster <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 2 && (
        <>
          {!inf && <RoundsRunner rounds={INFL_P5} doneLabel="Arrive at age 65" onDone={(r) => { setInf(r); setStage(3); }} />}
        </>
      )}
      {stage === 3 && (
        <div className="start-block">
          <h3>🧓 Age 65 · Your future self's month</h3>
          <div className="g84-results g91-results"><div><small>SAVINGS AT 65</small><b>{cop(J.final)}</b></div><div><small>IN TODAY'S MONEY</small><b>{cop(real)}</b></div><div><small>FOR 20 YEARS / MONTH</small><b>{cop(monthIncome)}</b></div><div><small>BASIC EXPENSES TODAY</small><b>{cop(2200000)}</b></div></div>
          <HBars rows={[{ l: "🏠 Housing", v: 900000 }, { l: "🍲 Food", v: 700000 }, { l: "🩺 Health", v: 400000 }, { l: "🚌 Transport", v: 200000 }, { l: "💰 Income from my savings", v: monthIncome }]} />
          <div className={`p1-banner ${monthIncome >= 600000 ? "good" : "bad"}`}><span>Your savings could add {cop(monthIncome)} a month (in today's money) to your pension. {monthIncome >= 600000 ? "A strong complement!" : "It helps — but a pension and more years of saving would be needed."} That's why pension systems and personal savings work TOGETHER.</span></div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(coins, { start, monthly, decisions: life, good, projected: J.final, real, monthIncome })}>Save my time travel <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </div>
      )}
    </ActShell>
  );
}

/* ---------- ADVISOR PAGE 08 · My Future Financial Plan ---------- */
const HABITS_P5 = [["Learn how savings and investments work", 1], ["Avoid unnecessary debt", 1], ["Set a long-term goal", 1], ["Save a little every month", 1], ["Ask questions before choosing a product", 1], ["Wait until I'm 40 to think about it", 0], ["Spend everything — I'm young", 0]];
function FuturePlan({ resp, existing, onSave, onExit }) {
  const tm = resp?.c5_time;
  const [habits, setHabits] = useState(existing?.habits || []);
  const [age, setAge] = useState(existing?.age || 22);
  const [mo, setMo] = useState(existing?.monthly || 100000);
  const [text, setText] = useState(existing?.text || "");
  const [order] = useState(() => shuffleArr(HABITS_P5.map((_, k) => k)));
  const [st, finish] = useFinish(onSave);
  const P = grow5({ start: age, monthly: mo });
  const bad = habits.filter((k) => !HABITS_P5[k][1]).length;
  const G = [W_REASON, W_CONTRAST, W_NUMBERS(1)];
  if (st.done) return <Reward title="Advisor page 08 saved! 🧾" subtitle={`My plan: start at ${age} with ${cop(mo)} a month`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Hourglass size={22} strokeWidth={2.1} />} title="My Future Financial Plan 🧓" subtitle="Advisor Page 08 · A letter to your future self." onExit={onExit}>
      <Brief91 k="c5_page" />
      <PBadge n="08" />
      {tm && <div className="g84-results g91-results"><div><small>TIME MACHINE</small><b>{cop(tm.projected)}</b></div><div><small>GOOD DECISIONS</small><b>{tm.good}/4</b></div><div><small>TODAY'S MONEY</small><b>{cop(tm.real)}</b></div></div>}
      <div className="start-block">
        <h3>🎯 My own plan (hypothetical 4%)</h3>
        <Ctl l="🎂 I will start at age" v={age} set={setAge} mn={18} mx={35} stp={1} fmt={(v) => `${v}`} />
        <Ctl l="💰 Every month" v={mo} set={setMo} mn={50000} mx={500000} stp={50000} fmt={cop} />
        <p className="g91-note pos">At 65 (hypothetical): {cop(P.final)} after {(65 - age) * 12} contributions.</p>
      </div>
      <div className="start-block"><h3>🌱 3 habits I can start NOW</h3><div className="g84-chips">{order.map((k) => <button key={k} type="button" className={habits.includes(k) ? "on" : ""} onClick={() => setHabits(habits.includes(k) ? habits.filter((x) => x !== k) : habits.length < 3 ? [...habits, k] : habits)}>{HABITS_P5[k][0]}</button>)}</div>{bad > 0 && <p className="g91-note neg">⚠️ One habit hurts your future self!</p>}</div>
      <div className="start-block">
        <h3>✉️ Dear future me…</h3>
        <WordField value={text} onChange={setText} min={20} max={70} rows={4} placeholder="Dear future me, I will start saving at … because … Although …, I …" goals={G} />
        <Starters items={["Dear future me,", "I will start saving at", "because", "Although", "My future self will"]} onPick={appendStarter(setText)} />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={habits.length < 3 || bad > 0 || !goalsOk(text, 20, 70, G)} onClick={() => finish(26, { habits, age, monthly: mo, projected: P.final, text })}>Save Advisor Page 08 <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 6 · FINTECH & ELECTRONIC MONEY
   ===================================================================== */
const START_P6 = {
  cards: [
    { e: "🤖", t: "FinTech", d: "Financial technology: apps and platforms that change financial services.", ex: "Wallets, robo-advisors, crowdfunding." },
    { e: "📱", t: "Digital wallet", d: "An app to store, send and receive money.", ex: "Pay with QR." },
    { e: "🔳", t: "QR payment", d: "Paying by scanning a code — check the name and amount!", ex: "At the corner store." },
    { e: "💸", t: "Transfer", d: "Sending money from one account to another.", ex: "Pay the rent." },
    { e: "🔐", t: "Two-factor authentication (2FA)", d: "A second step to log in: a code or your fingerprint.", ex: "Password + code." },
    { e: "📶", t: "Mobile banking", d: "Using your bank from your phone.", ex: "Check balance, block a card." },
    { e: "🌍", t: "Financial inclusion", d: "Access to financial services for everyone.", ex: "M-Pesa in Kenya." },
    { e: "🧾", t: "Transaction fee", d: "A charge for an operation.", ex: "1.5% for receiving QR payments." },
  ],
  pairs: [{ a: "FinTech", b: "Financial technology" }, { a: "Digital wallet", b: "App to store and send money" }, { a: "2FA", b: "A second step to log in" }, { a: "Transfer", b: "Money from one account to another" }, { a: "Financial inclusion", b: "Access for everyone" }, { a: "Transaction fee", b: "A charge for an operation" }],
};
const WALLETS92 = [
  { id: "zap", e: "⚡", n: "ZapPay", monthly: 0, withdraw: 3000, qr: 1.5, intl: 4, limit: "$2,000,000/day", sec: "2FA + fingerprint", ok: true },
  { id: "movi", e: "🟢", n: "MoviBank", monthly: 5000, withdraw: 1000, qr: 0.8, intl: 1.5, limit: "$10,000,000/day", sec: "2FA", ok: true },
  { id: "coin", e: "🪙", n: "CoinGo", monthly: 0, withdraw: 0, qr: 0, intl: 0.5, limit: "No limits!", sec: "Password only · company not supervised", ok: false },
];
const wCost = (w, u) => Math.round(w.monthly + w.withdraw * (u.wd || 0) + (u.qr || 0) * w.qr / 100 + (u.intl || 0) * w.intl / 100);
const CLIENTS_P6 = [
  { id: "stu", e: "🎒", n: "Valeria, student", d: "Pays snacks with QR 20 times a month and withdraws cash twice.", u: { wd: 2 }, best: "zap" },
  { id: "shop", e: "🏪", n: "Don Hernán, shop owner", d: "RECEIVES $3,000,000 a month in QR payments from customers.", u: { qr: 3000000 }, best: "movi" },
  { id: "trav", e: "✈️", n: "Camilo, traveler", d: "Sends $1,500,000 to his sister in another country.", u: { intl: 1500000 }, best: "movi" },
];
const MYUSE_P6 = { barista: { wd: 6 }, designer: { wd: 2 }, nurse: { wd: 3 }, baker: { wd: 2, qr: 2000000 } };
const QR_P6 = [
  { tag: "⚡ QR RACE · 1/4", q: "The corner store shows a QR code for a $6,500 juice. What do you check before confirming?", options: ["The store's name and the amount", "Nothing — QR payments are always safe, so you can confirm as fast as possible", "The weather", "Your horoscope"], correct: 0, explain: "A fake QR sticker can send your money to someone else." },
  { tag: "⚡ QR RACE · 2/4", q: "You must pay $900,000 of rent to your landlord. Best method?", options: ["A transfer to his account, checking the name", "Cash in an envelope left under his door without any receipt, because it is faster", "A QR from a stranger", "Crypto"], correct: 0, explain: "Transfers leave a record — check the recipient before sending." },
  { tag: "⚡ QR RACE · 3/4", q: "You buy sneakers in a foreign online store. Best method?", options: ["A credit card (more protection in disputes)", "A transfer to the personal account of the seller, who promised a big discount by WhatsApp", "Cash by mail", "Your PIN by email"], correct: 0, explain: "Cards offer dispute processes; personal transfers to strangers don't." },
  { tag: "⚡ QR RACE · 4/4", q: "You take a bus in a small town with no signal. Best method?", options: ["Cash", "A QR payment that will be processed later when the bus driver finds a Wi-Fi network", "A transfer", "A credit card"], correct: 0, explain: "Digital is great — but cash still matters without signal." },
];
const EMERG_P6 = [
  { tag: "🚨 WALLET EMERGENCY · 1/4", q: "You lost your phone with your wallet app.", options: ["Block the account through the official line or website", "Wait a few days, because maybe someone will find the phone and return it to you", "Post your password online", "Buy a new phone"], correct: 0, explain: "Block first, then recover." },
  { tag: "🚨 WALLET EMERGENCY · 2/4", q: "You see a $250,000 transaction you didn't make.", options: ["Report it in the app and change your password", "Ignore it, because small transactions are normal and disappear after one month", "Delete the app", "Tell nobody"], correct: 0, explain: "Report fast — and secure your access." },
  { tag: "🚨 WALLET EMERGENCY · 3/4", q: "“Support” writes by WhatsApp: “Send us your code to fix your account.”", options: ["Don't answer; contact the official channel", "Send the code, because support needs it to repair the problem with your account", "Send half the code", "Share it with friends"], correct: 0, explain: "Real support never asks for your codes." },
  { tag: "🚨 WALLET EMERGENCY · 4/4", q: "You sent $80,000 to the wrong number.", options: ["Contact the wallet immediately with the receipt", "Send the same amount again to the right number and forget about the first one", "Call the stranger and insult them", "Nothing"], correct: 0, explain: "Act fast with evidence — and always double-check before sending." },
];
function FintechTower({ resp, onSave, onExit }) {
  const S = seasonOf(resp);
  const myU = MYUSE_P6[S.profile?.job?.id || "designer"];
  const [stage, setStage] = useState(0);
  const [pick, setPick] = useState({});
  const [checked, setChecked] = useState(false);
  const [hunt, setHunt] = useState("");
  const [huntOk, setHuntOk] = useState(null);
  const [rr, setRr] = useState(null);
  const [mine, setMine] = useState(null);
  const [st, finish] = useFinish(onSave);
  const right = CLIENTS_P6.filter((c) => pick[c.id] === c.best).length;
  const W = WALLETS92.find((w) => w.id === mine);
  const myFees = W ? wCost(W, myU) : 0;
  const coins = 16 + right * 3 + (huntOk === true ? 4 : 0) + (rr ? rr.firstTry : 0) + (W?.ok ? 3 : 0);
  if (st.done) return <Reward title="FinTech Tower climbed! 📱" subtitle={`My wallet: ${W.e} ${W.n} · ${cop(myFees)} a month`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Smartphone size={22} strokeWidth={2.1} />} title="FinTech Tower 📱" subtitle="Three fictional wallets, three clients, 8 emergencies — and the wallet for YOU." onExit={onExit}>
      <Brief91 k="c6_tower" />
      <Steps91 labels={["1 · Three clients", "2 · Fee hunter", "3 · QR race + emergencies", "4 · My wallet"]} at={stage} />
      <div className="g84-wtable g92-wt">
        <div className="h"><span>Fictional wallet</span>{WALLETS92.map((w) => <span key={w.id} className={mine === w.id ? "on" : ""}>{w.e} {w.n}</span>)}</div>
        {[["Monthly fee", (w) => cop(w.monthly)], ["Cash withdrawal", (w) => cop(w.withdraw)], ["Receiving QR payments", (w) => `${w.qr}%`], ["International transfer", (w) => `${w.intl}%`], ["Daily limit", (w) => w.limit], ["Security", (w) => w.sec]].map(([l, f]) => <div key={l}><span>{l}</span>{WALLETS92.map((w) => <span key={w.id} className={`${mine === w.id ? "on" : ""} ${!w.ok && l === "Security" ? "warn" : ""}`}>{f(w)}</span>)}</div>)}
      </div>
      {stage === 0 && (
        <>
          {CLIENTS_P6.map((c) => (
            <div key={c.id} className={`start-block g91-client ${checked ? (pick[c.id] === c.best ? "ok" : "no") : ""}`}>
              <header><em>{c.e}</em><div><b>{c.n}</b><span>{c.d}</span></div></header>
              <Tri value={pick[c.id]} onPick={(v) => { setPick({ ...pick, [c.id]: v }); setChecked(false); }} opts={WALLETS92.map((w) => [w.id, `${w.e} ${w.n}`])} />
              {checked && <div className="g91-costs">{WALLETS92.map((w) => <span key={w.id} className={w.id === c.best ? "on" : ""}>{w.e} {w.n}: <b>{cop(wCost(w, c.u))}</b>{!w.ok ? " ⚠️ unsafe" : ""}</span>)}</div>}
              {checked && pick[c.id] === "coin" && <p className="g91-note neg">🪙 CoinGo is the cheapest… but no 2FA and no supervision. If something goes wrong, nobody protects the money.</p>}
            </div>
          ))}
          <div className="start-foot">{checked && right === 3 ? <button className="s1-btn primary big" onClick={() => setStage(1)}>Fee hunter <ChevronRight size={18} /></button> : <button className="s1-btn primary big" disabled={Object.keys(pick).length < 3} onClick={() => setChecked(true)}>{checked ? `Check again (${right}/3)` : "Check"} <Check size={17} /></button>}</div>
        </>
      )}
      {stage === 1 && (
        <div className="start-block">
          <h3>🏷️ Fee hunter</h3>
          <p className="quiz-q">Don Hernán uses MoviBank: monthly fee $5,000 + 0.8% of the $3,000,000 he receives. How much does he pay per month?</p>
          <MoneyInput value={hunt} onChange={(v) => { setHunt(v); if (huntOk === false) setHuntOk(null); }} />
          <div className="p3-card-actions"><button className="s1-btn primary" disabled={!hunt || huntOk === true} onClick={() => setHuntOk(num(hunt) === 29000)}>Check</button></div>
          {huntOk === false && <div className="p1-hint">💡 0.8% of 3,000,000 = 24,000. Then add the monthly fee.</div>}
          {huntOk === true && <><div className="p1-banner good"><span>$29,000. With ZapPay (1.5%) he would pay $45,000 — $16,000 more every month!</span></div><div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(2)}>QR race <ChevronRight size={18} /></button></div></>}
        </div>
      )}
      {stage === 2 && !rr && <RoundsRunner rounds={[...QR_P6, ...EMERG_P6]} doneLabel="Choose MY wallet" onDone={(x) => { setRr(x); setStage(3); }} />}
      {stage === 3 && (
        <div className="start-block g91-client">
          <header><em>{S.profile?.avatar || "🙋"}</em><div><b>My wallet</b><span>My habits: {myU.wd} cash withdrawals a month{myU.qr ? ` · I receive ${cop(myU.qr)} in QR payments` : ""}.</span></div></header>
          <Tri value={mine} onPick={setMine} opts={WALLETS92.map((w) => [w.id, `${w.e} ${w.n}`])} />
          {W && <div className={`p1-banner ${W.ok ? "good" : "bad"}`}><span>{W.e} {W.n} costs you {cop(myFees)} a month ({cop(myFees * 3)} this season). {W.ok ? "Safe and supervised." : "⚠️ Cheap, but your money has NO protection. Think again!"}</span></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!mine} onClick={() => finish(coins, { picks: pick, right, hunt: huntOk, rounds: rr.firstTry, wallet: mine, walletName: `${W.e} ${W.n}`, myFees, safe: W.ok })}>Activate my wallet <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </div>
      )}
    </ActShell>
  );
}

/* ---------- MY DIGITAL PAYMENT GUIDE ---------- */
const SAFE_P6 = [["Turn on 2FA", 1], ["Check the name and amount before paying", 1], ["Never share codes or passwords", 1], ["Use only official apps and channels", 1], ["Save the receipt of every transfer", 1], ["Use the same password everywhere", 0], ["Send codes to “support” if they ask nicely", 0], ["Choose the cheapest app, even if it's not supervised", 0]];
function PaymentGuide({ resp, existing, onSave, onExit }) {
  const t = resp?.c6_tower;
  const [rules, setRules] = useState(existing?.rules || []);
  const [text, setText] = useState(existing?.text || "");
  const [order] = useState(() => shuffleArr(SAFE_P6.map((_, k) => k)));
  const [st, finish] = useFinish(onSave);
  const bad = rules.filter((k) => !SAFE_P6[k][1]).length;
  const G = [W_ADVICE, W_REASON];
  if (st.done) return <Reward title="Guide saved! 📲" subtitle="My Digital Payment Guide." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<QrCode size={22} strokeWidth={2.1} />} title="My Digital Payment Guide 📲" subtitle="Your grandma wants to start using a digital wallet. Write her a short, clear guide." onExit={onExit}>
      <Brief91 k="c6_page" />
      {t && <div className="g84-results g91-results"><div><small>MY WALLET</small><b>{t.walletName}</b></div><div><small>MONTHLY COST</small><b>{cop(t.myFees)}</b></div><div><small>SAFE?</small><b>{t.safe ? "Yes ✅" : "No ⚠️"}</b></div></div>}
      <div className="start-block"><h3>🔐 Choose 4 safety rules for Grandma</h3><div className="g84-chips">{order.map((k) => <button key={k} type="button" className={rules.includes(k) ? "on" : ""} onClick={() => setRules(rules.includes(k) ? rules.filter((x) => x !== k) : rules.length < 4 ? [...rules, k] : rules)}>{SAFE_P6[k][0]}</button>)}</div>{bad > 0 && <p className="g91-note neg">⚠️ One of your rules would put Grandma in danger!</p>}</div>
      <div className="start-block">
        <h3>✍️ Dear Grandma…</h3>
        <WordField value={text} onChange={setText} min={20} max={70} rows={4} placeholder="Dear Grandma, a digital wallet is … You should … because … Never …" goals={G} />
        <Starters items={["Dear Grandma, a digital wallet is", "You should always", "because", "Never share"]} onPick={appendStarter(setText)} />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={rules.length < 4 || bad > 0 || !goalsOk(text, 20, 70, G)} onClick={() => finish(22, { rules, text })}>Save my guide <span className="coin-tag"><Coins size={15} /> +22</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 7 · BLOCKCHAIN & CRYPTO
   ===================================================================== */
const START_P7 = {
  cards: [
    { e: "📒", t: "Ledger", d: "A record of transactions: who sent what to whom.", ex: "Ana → Luis $50,000." },
    { e: "🧱", t: "Block", d: "A group of transactions sealed together.", ex: "Block #2." },
    { e: "🔏", t: "Hash", d: "A digital fingerprint of a block. If the data changes, the hash changes.", ex: "7F3A" },
    { e: "⛓️", t: "Blockchain", d: "Blocks linked by hashes, copied on thousands of computers.", ex: "Each block points to the previous one." },
    { e: "🖥️", t: "Node", d: "A computer that keeps a copy and checks transactions.", ex: "No bank in the middle." },
    { e: "🤝", t: "Consensus", d: "The network's agreement on which version is true.", ex: "The majority of nodes." },
    { e: "🪙", t: "Cryptocurrency", d: "Digital money that uses a blockchain. Its price can change a lot.", ex: "Bitcoin, Ether." },
    { e: "🎢", t: "Volatility", d: "How much and how fast a price goes up and down.", ex: "+60% one week, −50% the next." },
  ],
  pairs: [{ a: "Ledger", b: "A record of transactions" }, { a: "Hash", b: "A block's digital fingerprint" }, { a: "Node", b: "A computer with a copy" }, { a: "Consensus", b: "Agreement of the network" }, { a: "Cryptocurrency", b: "Digital money on a blockchain" }, { a: "Volatility", b: "Big, fast price changes" }],
};

/* ---------- BLOCK BUILDER ---------- */
const hash7 = (s) => { let x = 7; for (const ch of String(s)) x = (x * 31 + ch.charCodeAt(0)) % 65521; return x.toString(16).toUpperCase().padStart(4, "0"); };
const TX_P7 = ["Ana → Luis $50,000", "Luis → Shop $20,000", "Shop → Bakery $35,000", "Bakery → Ana $10,000"];
const chain7 = (txs, prevs) => { const out = []; txs.forEach((tx, i) => { const prev = prevs?.[i] ?? (i === 0 ? "0000" : out[i - 1].hash); out.push({ id: i + 1, prev, tx, hash: hash7(`${i + 1}|${prev}|${tx}`) }); }); return out; };
const fakeH = (seed) => hash7(`fake-${seed}`);
function BlockCard({ b, bad, children }) {
  return <div className={`g92-block ${bad ? "bad" : "ok"}`}><small>BLOCK #{b.id}</small><p><span>Previous</span><b>{b.prev}</b></p><p><span>Data</span><b>{b.tx}</b></p><p><span>Hash</span><b className="h">{b.hash}</b></p>{children}</div>;
}
function BlockBuilder({ onSave, onExit }) {
  const base = useMemo(() => chain7(TX_P7), []);
  const [stage, setStage] = useState(0);
  const [links, setLinks] = useState({});
  const [miss, setMiss] = useState(0);
  const [opts] = useState(() => [1, 2, 3].map((i) => shuffleArr([base[i - 1].hash, fakeH(i), fakeH(i + 9)])));
  const [amt, setAmt] = useState("$20,000");
  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState(null);
  const [cand, setCand] = useState(null);
  const [st, finish] = useFinish(onSave);
  const linked = [1, 2, 3].every((i) => links[i] === base[i - 1].hash);
  const txs2 = TX_P7.map((t, i) => (i === 1 ? t.replace("$20,000", amt) : t));
  const tampered = useMemo(() => { const out = []; txs2.forEach((tx, i) => { const prev = i === 0 ? "0000" : base[i].prev; out.push({ id: i + 1, prev, tx, hash: hash7(`${i + 1}|${prev}|${tx}`) }); }); return out; }, [amt]); // eslint-disable-line react-hooks/exhaustive-deps
  const broken = (i) => i > 0 && tampered[i].prev !== tampered[i - 1].hash;
  const cands = useMemo(() => shuffleArr([
    { k: "ok", prev: base[1].hash, tx: TX_P7[2], hash: base[2].hash },
    { k: "tx", prev: base[1].hash, tx: "Shop → Bakery $95,000", hash: hash7(`3|${base[1].hash}|Shop → Bakery $95,000`) },
    { k: "prev", prev: fakeH(77), tx: TX_P7[2], hash: hash7(`3|${fakeH(77)}|${TX_P7[2]}`) },
  ]), [base]);
  const coins = 18 + Math.max(0, 6 - miss * 2) + (q1 === 0 ? 3 : 0) + (q2 === 0 ? 3 : 0) + (cand?.k === "ok" ? 4 : 0);
  if (st.done) return <Reward title="Chain complete! ⛓️" subtitle="You built, broke and repaired a blockchain." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Layers size={22} strokeWidth={2.1} />} title="Block Builder ⛓️" subtitle="A simplified blockchain: build it, try to cheat it, reach consensus and find the missing block." onExit={onExit}>
      <Brief91 k="c7_block" />
      <Steps91 labels={["1 · Build the chain", "2 · Try to cheat", "3 · Consensus", "4 · The missing block"]} at={stage} />
      {stage === 0 && (
        <>
          <HowTo>Each block must point to the <b>hash of the previous block</b>. Choose the right “Previous” for blocks #2, #3 and #4.</HowTo>
          <div className="g92-chain">{base.map((b, i) => (
            <BlockCard key={b.id} b={{ ...b, prev: i === 0 ? "0000" : links[i] || "????" }} bad={i > 0 && links[i] && links[i] !== base[i - 1].hash}>
              {i > 0 && links[i] !== base[i - 1].hash && <div className="g92-hopts">{opts[i - 1].map((h) => <button key={h} type="button" onClick={() => { setLinks({ ...links, [i]: h }); if (h !== base[i - 1].hash) setMiss(miss + 1); }}>{h}</button>)}</div>}
            </BlockCard>
          ))}</div>
          {linked && <div className="p1-banner good"><span>⛓️ Chain valid! Every block points to the fingerprint of the one before it.</span></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!linked} onClick={() => setStage(1)}>Try to cheat 😈 <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 1 && (
        <>
          <div className="g83-event"><em>😈</em><div><b>Luis wants to change the past</b><span>He wants block #2 to say he paid $200,000 instead of $20,000. Change the amount and watch the chain.</span></div></div>
          <Tri value={amt} onPick={setAmt} opts={[["$20,000", "$20,000 (real)"], ["$200,000", "$200,000 (fake)"], ["$2,000", "$2,000 (fake)"]]} />
          <div className="g92-chain">{tampered.map((b, i) => <BlockCard key={b.id} b={b} bad={broken(i) || (i === 1 && amt !== "$20,000")} />)}</div>
          {amt !== "$20,000" && <div className="p1-banner bad"><span>Block #2's hash changed to {tampered[1].hash}, but block #3 still points to {tampered[2].prev}. The chain is BROKEN — and the same chain lives on thousands of computers.</span></div>}
          {amt !== "$20,000" && <PickOne q="Why is it almost impossible to cheat a blockchain?" options={["Changing one block breaks the next ones on every copy", "Because the central bank checks every block by hand and calls the police immediately", "Blocks are on paper", "It's easy to cheat"]} correct={0} explain="Immutability: you would need to rebuild every later block on most copies at the same time." onRight={setQ1} />}
          <div className="start-foot"><button className="s1-btn primary big" disabled={q1 === null} onClick={() => setStage(2)}>Consensus challenge <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 2 && (
        <>
          <div className="g92-nodes">{["A", "B", "C", "D", "E"].map((n, i) => <div key={n} className={i === 3 ? "bad" : ""}><em>🖥️</em><b>Node {n}</b><span>Block #2: Luis → Shop {i === 3 ? "$200,000" : "$20,000"}</span></div>)}</div>
          <PickOne tag="CONSENSUS" q="Four nodes say $20,000. Node D (controlled by Luis) says $200,000. Which version does the network accept?" options={["$20,000 — the version most nodes agree on", "$200,000, because the newest version of a block always replaces the older versions", "Both", "Neither — the bank decides"]} correct={0} explain="Consensus: honest nodes agree, and the fake copy is rejected." onRight={setQ2} />
          <div className="start-foot"><button className="s1-btn primary big" disabled={q2 === null} onClick={() => setStage(3)}>The missing block <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 3 && (
        <>
          <p className="start-tip">Block #3 disappeared! It must point to block #2's hash ({base[1].hash}) AND its own hash must be the one block #4 points to ({base[3].prev}).</p>
          <div className="g92-chain small"><BlockCard b={base[1]} /><div className="g92-block gap"><small>BLOCK #3</small><b>?</b></div><BlockCard b={base[3]} /></div>
          <div className="g92-cands">{cands.map((c, i) => <button key={c.k} type="button" disabled={cand?.k === "ok"} className={cand === c ? (c.k === "ok" ? "ok" : "no") : ""} onClick={() => setCand(c)}><small>Candidate {"ABC"[i]}</small><p>Previous <b>{c.prev}</b></p><p>{c.tx}</p><p>Hash <b>{c.hash}</b></p></button>)}</div>
          {cand && <div className={`p1-banner ${cand.k === "ok" ? "good" : "bad"}`}><span>{cand.k === "ok" ? "✅ Both fingerprints match. The chain is complete!" : cand.k === "tx" ? "The previous hash is right, but the data was changed — so its hash doesn't match block #4." : "Its previous hash doesn't match block #2."}</span></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={cand?.k !== "ok"} onClick={() => finish(coins, { misses: miss, q1, q2 })}>Save my chain <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- CRYPTO ROLLERCOASTER + ADVISOR PAGE 09 ---------- */
const NEWS_P7 = [
  { e: "🚀", t: "Positive news: a big company accepts DistrictCoin!", c: 35 },
  { e: "⚖️", t: "New regulation: some exchanges must close.", c: -20 },
  { e: "🔓", t: "Security incident: an exchange was hacked.", c: -40 },
  { e: "🔥", t: "Sudden demand: influencers talk about it everywhere.", c: 60 },
  { e: "😱", t: "Market panic: everybody sells.", c: -50 },
  { e: "🌤️", t: "Calm returns. Small recovery.", c: 15 },
];
const VOC_P7 = ["block", "hash", "node", "ledger", "consensus", "immutab", "chain", "decentral"];
function CryptoCoaster({ resp, existing, onSave, onExit }) {
  const S = seasonOf({ ...resp, c7_crypto: null, c8_shield: null });
  const [stage, setStage] = useState(0);
  const [pct, setPct] = useState(10);
  const [step, setStep] = useState(0);
  const [soldAt, setSoldAt] = useState(null);
  const [t1, setT1] = useState(existing?.t1 || "");
  const [t2, setT2] = useState(existing?.t2 || "");
  const [st, finish] = useFinish(onSave);
  const prices = NEWS_P7.reduce((a, n) => [...a, +(a[a.length - 1] * (1 + n.c / 100)).toFixed(1)], [100]);
  const put = Math.round(S.cash * pct / 100);
  const mult = (soldAt !== null ? prices[soldAt] : prices[step]) / 100;
  const val = Math.round(put * mult);
  const G1 = [W_VOCAB(VOC_P7, 2)], G2 = [W_RISK, W_CONTRAST];
  if (st.done) return <Reward title="Advisor page 09 saved! 🧾" subtitle={`DistrictCoin: ${cop(put)} → ${cop(Math.round(put * (soldAt !== null ? prices[soldAt] : prices[6]) / 100))}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Coins size={22} strokeWidth={2.1} />} title="Crypto Rollercoaster 🎢" subtitle="Advisor Page 09 · A fictional coin, real emotions. Then explain blockchain and crypto in your own words." onExit={onExit}>
      <Brief91 k="c7_crypto" />
      <PBadge n="09" />
      {stage === 0 && (
        <div className="start-block">
          <h3>🪙 DistrictCoin (fictional) · price $100</h3>
          <p className="start-tip">How much of YOUR cash ({cop(S.cash)}) do you buy? Rule of advisors: only money you can afford to lose.</p>
          <Ctl l="🪙 I buy" v={pct} set={setPct} mn={0} mx={20} stp={5} fmt={(v) => `${v}% · ${cop(Math.round(S.cash * v / 100))}`} />
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(1)}>{pct ? "Buy and ride 🎢" : "Just watch the ride 👀"} <ChevronRight size={18} /></button></div>
        </div>
      )}
      {stage === 1 && (
        <div className="start-block">
          <LineChart series={[{ name: "DistrictCoin", color: "#ff6b57", values: prices.slice(0, step + 1) }]} labels={["Buy", "N1", "N2", "N3", "N4", "N5", "N6"].slice(0, step + 1)} money={false} yMin={0} yMax={200} />
          <div className="g91-mini"><span>💲 Price <b>${prices[soldAt ?? step]}</b></span><span>🪙 My coins are worth <b>{cop(val)}</b></span><span className={mult >= 1 ? "pos" : "neg"}>📊 <b>{mult >= 1 ? "+" : ""}{((mult - 1) * 100).toFixed(0)}%</b></span>{soldAt !== null && <span>✅ Sold after news {soldAt}</span>}</div>
          {step > 0 && <div className="g83-event"><em>{NEWS_P7[step - 1].e}</em><div><b>News {step}/6 · {NEWS_P7[step - 1].c > 0 ? "+" : ""}{NEWS_P7[step - 1].c}%</b><span>{NEWS_P7[step - 1].t}</span></div></div>}
          {step < 6 ? (
            <div className="g92-pay3">
              <button type="button" onClick={() => setStep(step + 1)}>{step === 0 ? "▶️" : "🤲"}<b>{step === 0 ? "Start" : soldAt !== null ? "Next news" : "Hold"}</b><small>{soldAt !== null ? "watch only" : "keep my coins"}</small></button>
              {step > 0 && soldAt === null && pct > 0 && <button type="button" onClick={() => { setSoldAt(step); setStep(step + 1); }}>💸<b>Sell everything</b><small>at ${prices[step]}</small></button>}
            </div>
          ) : (
            <>
              <div className={`p1-banner ${mult >= 1 ? "good" : "bad"}`}><span>Final price ${prices[6]} ({((prices[6] / 100 - 1) * 100).toFixed(0)}% from the start). {soldAt !== null ? `You sold at $${prices[soldAt]}.` : "You held until the end."} Nobody could predict these news. That's volatility.</span></div>
              <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(2)}>Write my Page 09 <ChevronRight size={18} /></button></div>
            </>
          )}
        </div>
      )}
      {stage === 2 && (
        <>
          <div className="start-block"><h3>⛓️ Blockchain is…</h3><WordField value={t1} onChange={setT1} min={15} max={50} rows={3} placeholder="Blockchain is a … Each block … If someone changes …" goals={G1} /></div>
          <div className="start-block"><h3>🎢 Cryptocurrency is risky because…</h3><WordField value={t2} onChange={setT2} min={15} max={50} rows={3} placeholder="Crypto can … However, … I would only invest …" goals={G2} /></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(t1, 15, 50, G1) || !goalsOk(t2, 15, 50, G2)} onClick={() => finish(30, { pct, put, mult: (soldAt !== null ? prices[soldAt] : prices[6]) / 100, soldAt, t1, t2 })}>Save Advisor Page 09 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   CLASE 8 · SCAM SHIELD + PRODUCT FAIR
   ===================================================================== */
const OFFERS_P8 = [
  { e: "🚀", src: "Instagram ad", t: "CryptoRocket: GUARANTEED 20% every month! Zero risk. Offer ends in 10 minutes!", scam: true, chips: [["Guaranteed returns", 1], ["“Zero risk”", 1], ["Pressure: 10 minutes", 1], ["It has a website", 0]] },
  { e: "📩", src: "SMS", t: "District Bank: your account will be BLOCKED today. Click bit.ly/db-verify and enter your password.", scam: true, chips: [["Threat: account blocked", 1], ["Strange short link", 1], ["Asks for your password", 1], ["Uses the bank's name", 0]] },
  { e: "🔔", src: "Inside the official bank app", t: "Your transfer of $50,000 to Luis was completed. Reference 88412.", scam: false, chips: [["Inside the official app", 0], ["Matches a transfer I made", 0], ["Has a reference number", 0]] },
  { e: "🎤", src: "Video ad", t: "A famous singer says: “I made $500 million with QuantumAI. Join today with $1,000,000!”", scam: true, chips: [["Celebrity endorsement I can't verify", 1], ["Unrealistic returns", 1], ["Pressure to join today", 1], ["The video looks professional", 0]] },
  { e: "📄", src: "Fund information sheet", t: "Balanced Fund · fee 1.2% per year · past returns don't guarantee future results · supervised company.", scam: false, chips: [["It explains the risk", 0], ["It shows the fees", 0], ["The company is supervised", 0]] },
];
const PONZI_P8 = [10, 20, 40, 25, 8, 0];
const STEPS_P8 = ["Don't click suspicious links", "Don't share passwords or codes", "Contact the institution through official channels", "Check your transactions", "Report the suspicious activity"];
const RULES_P8 = [["If it's “guaranteed” and “no risk”, it's a red flag", 1], ["I never share codes, passwords or card numbers", 1], ["I verify through official channels", 1], ["I don't decide under pressure", 1], ["If a famous person recommends it, it's safe", 0], ["Small amounts are OK to send to strangers", 0]];
function ScamShield({ existing, onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [flags, setFlags] = useState({});
  const [verd, setVerd] = useState({});
  const [checked, setChecked] = useState(false);
  const [month, setMonth] = useState(0);
  const [pz, setPz] = useState(null);
  const [ordered, setOrdered] = useState(false);
  const [rules, setRules] = useState(existing?.rules || []);
  const [text, setText] = useState(existing?.text || "");
  const [rOrder] = useState(() => shuffleArr(RULES_P8.map((_, k) => k)));
  const [st, finish] = useFinish(onSave);
  const flagScore = OFFERS_P8.reduce((a, o, i) => a + o.chips.filter(([, r], j) => !!(flags[i] || []).includes(j) === !!r).length, 0);
  const flagMax = OFFERS_P8.reduce((a, o) => a + o.chips.length, 0);
  const verdOk = OFFERS_P8.filter((o, i) => verd[i] === (o.scam ? "scam" : "legit")).length;
  const fell = OFFERS_P8.filter((o, i) => o.scam && verd[i] === "legit").length;
  const score = Math.round(((flagScore / flagMax) * 0.5 + (verdOk / 5) * 0.5) * 100);
  const pz6 = useMemo(() => { let pool = 0, inv = 0; const rows = []; PONZI_P8.forEach((n, m) => { inv += n * 1e6; pool += n * 1e6 * 0.8; const pay = Math.round(inv * 0.1); pool -= pay; rows.push({ m: m + 1, n, inv, pool: Math.max(0, pool), pay }); }); return rows; }, []);
  const bad = rules.filter((k) => !RULES_P8[k][1]).length;
  const G = [W_ADVICE, W_RISK];
  if (st.done) return <Reward title="Scam Shield activated! 🛡️" subtitle={`Shield ${score}% · ${fell ? `you fell for ${fell} scam(s): −${cop(fell * 500000)}` : "no money lost!"}`} coins={st.coins} saving={st.saving} onExit={onExit} gold={!fell} />;
  return (
    <ActShell icon={<ShieldCheck size={22} strokeWidth={2.1} />} title="Scam Shield 🛡️" subtitle="Advisor Page 10 · Find the red flags, watch a Ponzi tower fall, and build your protection plan." onExit={onExit}>
      <Brief91 k="c8_shield" />
      <PBadge n="10" />
      <Steps91 labels={["1 · Find the red flags", "2 · Ponzi tower", "3 · Response room", "4 · My plan"]} at={stage} />
      {stage === 0 && (
        <>
          <p className="start-tip">For each message: tap ONLY the red flags 🚩 (some are not!), then decide: scam or legit? ⚠️ If you call a scam “legit”, you lose $500,000 of your district money.</p>
          {OFFERS_P8.map((o, i) => { const ok = verd[i] === (o.scam ? "scam" : "legit"); return (
            <div key={i} className={`start-block g92-offer8 ${checked ? (ok ? "ok" : "no") : ""}`}>
              <header><em>{o.e}</em><small>{o.src}</small></header>
              <p>“{o.t}”</p>
              <div className="g84-chips">{o.chips.map(([c, r], j) => { const on = (flags[i] || []).includes(j); return <button key={c} type="button" disabled={checked} className={`${on ? "on" : ""} ${checked ? (r ? "red" : "") : ""}`} onClick={() => setFlags({ ...flags, [i]: on ? flags[i].filter((x) => x !== j) : [...(flags[i] || []), j] })}>{on ? "🚩 " : ""}{c}</button>; })}</div>
              <Tri value={verd[i]} onPick={(v) => !checked && setVerd({ ...verd, [i]: v })} disabled={checked} opts={[["scam", "🚨 Scam"], ["legit", "✅ Legit"]]} />
              {checked && <p className={`g91-note ${ok ? "pos" : "neg"}`}>{ok ? "✅ Correct." : o.scam ? "❌ It's a SCAM — you lost $500,000." : "❌ This one was legit: official app / clear risks and fees."}</p>}
            </div>
          ); })}
          {checked && <div className="g84-results g91-results"><div><small>RED FLAGS</small><b>{flagScore}/{flagMax}</b></div><div><small>VERDICTS</small><b>{verdOk}/5</b></div><div><small>SHIELD</small><b>{score}%</b></div><div><small>MONEY LOST</small><b>{cop(fell * 500000)}</b></div></div>}
          <div className="start-foot">{!checked ? <button className="s1-btn primary big" disabled={Object.keys(verd).length < 5} onClick={() => setChecked(true)}>Check my shield <ShieldCheck size={17} /></button> : <button className="s1-btn primary big" onClick={() => setStage(1)}>Ponzi tower <ChevronRight size={18} /></button>}</div>
        </>
      )}
      {stage === 1 && (
        <div className="start-block">
          <div className="g83-event"><em>🏗️</em><div><b>“Tower Club”: 10% EVERY MONTH!</b><span>Each new member puts in $1,000,000. The organizer keeps 20% and pays the “returns” with… let's see.</span></div></div>
          <div className="g92-ponzi">{pz6.slice(0, month).map((r) => <div key={r.m}><small>Month {r.m}</small><i style={{ height: `${Math.min(100, (r.n / 40) * 100)}%` }} /><span>+{r.n} new</span><b>{cop(r.pool)}</b></div>)}</div>
          {month > 0 && <div className="g91-mini"><span>👥 New members <b>{pz6[month - 1].n}</b></span><span>💰 Invested <b>{cop(pz6[month - 1].inv)}</b></span><span>💸 “Returns” paid <b>{cop(pz6[month - 1].pay)}</b></span><span className={pz6[month - 1].pool < pz6[month - 1].inv * 0.5 ? "neg" : ""}>🏦 Money left <b>{cop(pz6[month - 1].pool)}</b></span></div>}
          {month < 6 ? <div className="p3-card-actions"><button className="s1-btn primary" onClick={() => setMonth(month + 1)}>{month === 0 ? "Open the club" : "Next month"} <ChevronRight size={16} /></button></div> : (
            <>
              <div className="p1-banner bad"><span>💥 Month 6: no new members. Everybody asks for their money: {cop(pz6[5].inv)} — but only {cop(pz6[5].pool)} is left. The tower collapses. Most members lose.</span></div>
              <PickOne q="Where did the “10% monthly returns” really come from?" options={["From the money of new members", "From a real, successful business that sold many products in other countries every month", "From the bank", "From the government"]} correct={0} explain="A Ponzi scheme pays old members with new members' money. When new money stops, it collapses." onRight={setPz} />
            </>
          )}
          <div className="start-foot"><button className="s1-btn primary big" disabled={pz === null} onClick={() => setStage(2)}>Response room <ChevronRight size={18} /></button></div>
        </div>
      )}
      {stage === 2 && (
        <div className="start-block">
          <div className="g83-event"><em>🚨</em><div><b>ALERT: “Suspicious login on your account. Confirm your data here.”</b><span>Put the safe steps in the right order.</span></div></div>
          <OrderTap items={STEPS_P8} onDone={() => setOrdered(true)} />
          {ordered && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(3)}>My protection plan <ChevronRight size={18} /></button></div>}
        </div>
      )}
      {stage === 3 && (
        <>
          <div className="start-block"><h3>🛡️ My 3 protection rules</h3><div className="g84-chips">{rOrder.map((k) => <button key={k} type="button" className={rules.includes(k) ? "on" : ""} onClick={() => setRules(rules.includes(k) ? rules.filter((x) => x !== k) : rules.length < 3 ? [...rules, k] : rules)}>{RULES_P8[k][0]}</button>)}</div>{bad > 0 && <p className="g91-note neg">⚠️ One of those rules is exactly what scammers want you to believe!</p>}</div>
          <div className="start-block"><h3>✍️ My advice to a friend who received a “perfect investment”</h3><WordField value={text} onChange={setText} min={20} max={60} rows={3} placeholder="You should not … because … A real investment always has risk…" goals={G} /></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={rules.length < 3 || bad > 0 || !goalsOk(text, 20, 60, G)} onClick={() => finish(20 + Math.round(score / 10) + (pz === 0 ? 3 : 0), { score, fell, loss: fell * 500000, flags: flagScore, verdicts: verdOk, rules, text })}>Save Advisor Page 10 <span className="coin-tag"><Coins size={15} /> +{20 + Math.round(score / 10) + (pz === 0 ? 3 : 0)}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- PRODUCT FAIR · proyecto final ---------- */
const CLIENTS_P8 = [
  { id: "laura", e: "🚗", n: "Laura, 25", d: "Wants her first car ($40,000,000). Salary $3,200,000, savings $8,000,000, expenses $2,300,000.", prods: [["Vehicle loan with a payment she can afford", 1], ["Financial leasing (read the contract!)", 1], ["Save one more year and buy a cheaper car", 1], ["Pay the whole car with a credit card", 0]] },
  { id: "daniel", e: "💼", n: "Daniel, 30", d: "Has $10,000,000 saved and wants to invest. He has no emergency fund.", prods: [["Build an emergency fund first", 1], ["A diversified balanced fund", 1], ["A term deposit (CDT)", 1], ["Put everything in one cryptocurrency", 0]] },
  { id: "sofia", e: "🧑‍🎓", n: "Sofia, 22", d: "First job. Wants to start planning for retirement but thinks it's too early.", prods: [["Pension contributions + small voluntary savings", 1], ["A long-term diversified fund", 1], ["Wait until she is 40", 0], ["Spend everything now — she is young", 0]] },
  { id: "carlos", e: "💳", n: "Carlos, 35", d: "Credit card debt of $4,000,000. He pays only the minimum and has missed one payment.", prods: [["A repayment plan: pay more than the minimum", 1], ["Use a debit card for daily spending", 1], ["A cheaper loan to pay the card (if he stops new debt)", 1], ["Open another credit card", 0]] },
  { id: "emma", e: "📱", n: "Emma, 28", d: "Wants to pay digitally but is afraid of fraud. Received a fake “support” message last week.", prods: [["A supervised digital wallet with 2FA", 1], ["A debit card + official mobile banking", 1], ["The cheapest app, even if it's not supervised", 0], ["Share codes only with “support”", 0]] },
  { id: "michael", e: "🪙", n: "Michael, 40", d: "Wants to invest in cryptocurrency. A friend told him about a “guaranteed 20% crypto club”.", prods: [["Only a small % he can afford to lose", 1], ["A diversified fund for most of his money", 1], ["All his savings in crypto", 0], ["The “guaranteed 20%” club", 0]] },
];
const BEN_P8 = ["Low cost", "Builds credit history", "Keeps cash available", "Professional management", "Diversification", "Safety / 2FA", "No debt", "Long-term growth"];
const RISK_P8 = ["Interest and fees", "Value can fall", "Contract conditions", "Payment in a bad month", "Fraud", "Inflation", "Volatility", "Debt grows"];
const WARN_P8 = ["Read the whole contract", "Never share codes", "Don't invest money you need soon", "Compare the TOTAL cost", "Check if the company is supervised", "Pay more than the minimum"];
function ProductFair({ resp, studentName, existing, onSave, onExit }) {
  const r = resp || {};
  const S = seasonOf(r);
  const [cid] = useState(() => existing?.client || CLIENTS_P8[Math.floor(Math.random() * CLIENTS_P8.length)].id);
  const C = CLIENTS_P8.find((c) => c.id === cid);
  const [order] = useState(() => shuffleArr(C.prods.map((_, k) => k)));
  const [two, setTwo] = useState(existing?.two || []);
  const [ben, setBen] = useState(existing?.ben || {});
  const [risk, setRisk] = useState(existing?.risk || {});
  const [rec, setRec] = useState(existing?.rec ?? null);
  const [warn, setWarn] = useState(existing?.warn || "");
  const [text, setText] = useState(existing?.text || "");
  const [slide, setSlide] = useState(null);
  const [peer, setPeer] = useState(existing?.peer || "");
  const [stars, setStars] = useState(existing?.rubric || {});
  const [st, finish] = useFinish(onSave);
  const pages = PAGES92.filter((p) => r[p.key]).length;
  const first = (studentName || S.profile?.name || "Advisor").split(" ")[0];
  const G = [W_RECOMMEND, W_REASON, W_RISK];
  const total = Math.round(RUB8.reduce((a, [k, , mx]) => a + ((stars[k] || 0) / 5) * mx, 0));
  const badRec = rec !== null && !C.prods[rec][1];
  const okA = two.length === 2 && two.every((k) => ben[k] && risk[k]);
  const ready = pages >= 3 && okA && rec !== null && !badRec && warn && goalsOk(text, 25, 80, G) && peer.trim().length >= 2 && RUB8.every(([k]) => stars[k]);
  const P = (k) => C.prods[k][0];
  const lines = [
    { e: "👋", t: "Hello", s: [`Hello! I'm ${first}, a Financial Product Advisor from the Product Lab.`, `Today I'm advising ${C.n}.`] },
    { e: "🔎", t: "Client profile & needs", s: [dot(C.d)] },
    { e: "⚖️", t: "Two options", s: two.length === 2 ? two.map((k, i) => `Option ${i + 1}: ${lowFirst(P(k))}. Benefit: ${lowFirst(ben[k] || "…")}. Cost or risk: ${lowFirst(risk[k] || "…")}.`) : [] },
    { e: "✅", t: "My recommendation", s: rec !== null ? [`I recommend: ${lowFirst(P(rec))}.`, dot(text)] : [] },
    { e: "⚠️", t: "One warning", s: warn ? [`My warning: ${lowFirst(warn)}.`] : [] },
    { e: "🧾", t: "My evidence", s: [r.c2_cards ? `In Card Wars, I ${r.c2_cards.pay === "total" ? "paid my card in full and paid zero interest" : `paid ${cop(r.c2_cards.interest + r.c2_cards.fees)} in interest and fees`}.` : "", r.c4_market ? `In the Fund Market, my portfolio changed ${r.c4_market.ret}% in five years — ${r.c4_market.sold ? "and I learned not to sell in panic" : "and I stayed calm in the crash"}.` : "", r.c8_shield ? `My scam shield is ${r.c8_shield.score}%.` : ""].filter(Boolean) },
  ];
  const slides = [
    { k: "cover", node: <div className="g8-slide-cover"><small>FINANCIAL DISTRICT · SEASON 02 · PRODUCT FAIR</small><h2>{C.e} Products for {C.n}</h2><p className="g8-fp-sayline">🎤 {lines[0].s.join(" ")}</p></div> },
    ...lines.slice(1).map((l) => ({ k: l.t, node: <section className="g8-fp big"><h4><span>{l.e}</span>{l.t}</h4><div className="g8-fp-say"><small>🎤 I SAY</small>{l.s.map((t, k) => <p key={k}>{t}</p>)}</div></section> })),
    { k: "end", node: <div className="g8-slide-cover"><h2>“Understand the product before choosing it.”</h2><p className="g8-fp-sayline">🎤 Thank you! Any questions?</p></div> },
  ];
  if (st.done) return <Reward title="Financial Product Advisor! 🏆" subtitle={`${C.n} · peer score ${total}/100`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Award size={22} strokeWidth={2.1} />} title="Product Fair 🏆" subtitle="Your SECRET client needs products. Compare two options, recommend one, present in English — a classmate scores you (100 points)." onExit={onExit}>
      <Brief91 k="c8_fair" />
      <HowTo>1) Read your client. 2) Choose <b>two</b> options to compare: one benefit and one cost/risk for each. 3) Recommend one + a warning. 4) Press <b>Present</b> (≈2 min). 5) The classmate who listened scores you.</HowTo>
      <div className="g91-portfolio">{PAGES92.map((p) => <span key={p.n} className={r[p.key] ? "on" : ""}><em>{r[p.key] ? p.e : "🔒"}</em><small>PAGE {p.n}</small><b>{p.t}</b></span>)}</div>
      {pages < 3 && <div className="p1-banner bad"><span>You need at least 3 of the 5 Advisor Pages (06–10) to join the fair. You have {pages}.</span></div>}
      <div className="g91-secret"><small>🤫 YOUR SECRET CLIENT</small><div><em>{C.e}</em><div><b>{C.n}</b><span>{C.d}</span></div></div></div>
      <div className="start-block">
        <h3>1 · Choose 2 options to compare</h3>
        <div className="g84-chips">{order.map((k) => <button key={k} type="button" className={two.includes(k) ? "on" : ""} onClick={() => setTwo(two.includes(k) ? two.filter((x) => x !== k) : two.length < 2 ? [...two, k] : two)}>{P(k)}</button>)}</div>
        {two.map((k) => (
          <div key={k} className="g92-compare">
            <b>{P(k)}</b>
            <small className="g91-lbl">Benefit</small><div className="g84-chips">{BEN_P8.map((x) => <button key={x} type="button" className={ben[k] === x ? "on" : ""} onClick={() => setBen({ ...ben, [k]: x })}>{x}</button>)}</div>
            <small className="g91-lbl">Cost or risk</small><div className="g84-chips">{RISK_P8.map((x) => <button key={x} type="button" className={risk[k] === x ? "on" : ""} onClick={() => setRisk({ ...risk, [k]: x })}>{x}</button>)}</div>
          </div>
        ))}
      </div>
      {okA && (
        <div className="start-block">
          <h3>2 · My recommendation</h3>
          <Tri value={rec} onPick={setRec} opts={two.map((k) => [k, P(k)])} />
          {badRec && <div className="p1-hint">💡 Think again: is this option safe and affordable for {C.n.split(",")[0]}? A good advisor protects the client.</div>}
          <small className="g91-lbl">One warning</small>
          <div className="g84-chips">{WARN_P8.map((x) => <button key={x} type="button" className={warn === x ? "on" : ""} onClick={() => setWarn(x)}>{x}</button>)}</div>
          <WordField value={text} onChange={setText} min={25} max={80} rows={4} placeholder="I recommend … because … Compared with … The main risk is …" goals={G} />
          <Starters items={["I recommend", "because", "Compared with", "The main risk is", "You should"]} onPick={appendStarter(setText)} />
        </div>
      )}
      <div className="g8-final g91-final" id="g8-final">
        <header><small>FINANCIAL DISTRICT · SEASON 02 · PRODUCT ADVISOR GUIDE · INSTITUTO CREAR</small><h2>{C.e} {C.n}</h2><p>Advisor: <b>{studentName}</b> · {pages}/5 advisor pages</p></header>
        <div className="g8-fp-list">{lines.map((l, k) => <section key={l.t} className={`g8-fp ${l.s.length ? "" : "empty"}`}><h4><span>{l.e}</span>{k + 1}. {l.t}</h4>{l.s.length ? <div className="g8-fp-say"><small>🎤 I SAY</small>{l.s.map((t, j) => <p key={j}>{t}</p>)}</div> : <p className="g8-fp-empty">Complete this part above.</p>}</section>)}</div>
      </div>
      <div className="p3-card-actions"><button className="s1-btn primary" disabled={rec === null || !text} onClick={() => setSlide(0)}><Mic size={17} /> Present</button><button className="s1-btn ghost" onClick={() => downloadPNG("g8-final", `Product_Advisor_${first}.png`)}><Download size={17} /> Download PNG</button></div>
      <div className="start-block g84-investor">
        <h3>🧑‍⚖️ Product Fair rubric · for the classmate who listened</h3>
        <input className="start-input p3-gap" value={peer} onChange={(e) => setPeer(e.target.value)} placeholder="Evaluator's name (your classmate)" />
        {RUB8.map(([k, l, mx]) => <div key={k} className="p3-rub"><div><b>{l}</b><small> · {mx} pts</small></div><span>{stars[k] ? `${Math.round((stars[k] / 5) * mx)}/${mx}` : ""}</span><div className="p3-stars">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={stars[k] >= n ? "on" : ""} onClick={() => setStars({ ...stars, [k]: n })}>★</button>)}</div></div>)}
        <div className="g91-total"><span>TOTAL</span><b>{total}/100</b></div>
        <p className="start-tip">⚖️ Score the quality of the DECISION — not the most exciting product.</p>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(50, { client: cid, two, ben, risk, rec, warn, text, peer: peer.trim(), rubric: stars, total, pages })}>Get my certificate 🏆 <span className="coin-tag"><Coins size={15} /> +50</span></button></div>
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
const RUB8 = [["needs", "Understands the client's needs", 20], ["concepts", "Uses financial concepts correctly", 25], ["compare", "Compares alternatives", 20], ["risks", "Identifies risks", 20], ["comm", "Communicates the recommendation", 15]];

/* ---------- BOSS · The Financial Product Challenge ---------- */
function BossProducts({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [mis, setMis] = useState(0);
  return stage === 0 ? (
    <ActShell icon={<Swords size={22} strokeWidth={2.1} />} title="The Financial Product Challenge · Part 1 ⚔️" subtitle="5 missions from the whole season. You can try again after a hint." onExit={onExit}>
      <Brief91 k="c8_boss" />
      <RoundsRunner rounds={BOSS_MISSIONS92} doneLabel="Part 2: 10 questions" onDone={(x) => { setMis(x.firstTry); setStage(1); }} />
    </ActShell>
  ) : (
    <QuizRunner title={`Product Challenge · Part 2 (missions: ${mis}/5 ⭐)`} emoji="⚔️" questions={BOSS_Q92} pickCount={10} passThreshold={70} xpPerCorrect={4} xpComplete={10 + Math.round(mis * 4)} onSave={(x) => onSave({ ...x, missions: mis })} onExit={onExit} />
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
const PAGE_RULE = (n, words, needs, coins) => [[`Text: ${words} words with ${needs}`, "required"], [`Advisor Page ${n} saved`, `+${coins} 🪙`]];
const FAIR_RUB = [["Understands the client's needs", "20 pts"], ["Uses financial concepts correctly", "25 pts"], ["Compares alternatives", "20 pts"], ["Identifies risks", "20 pts"], ["Communicates the recommendation", "15 pts"]];
const GUIDE = {
  c1_starter: B_STARTER("credit, debit, leasing, fund, pension, wallet"),
  c1_listen: B_LISTEN("Meet Season 02: the district director presents the new financial products and the rules of the Product Lab."),
  c1_match: { goal: "Give each client the product that solves their need. Every product has a benefit, a cost and a risk.", steps: ["Read what each client needs.", "Choose the right product for each one.", "Open 3 mystery boxes and answer their questions."], win: [["Each client with the right product", "+2 🪙"], ["Each mystery box right on the first try", "+2 🪙"], ["Finishing", "+12 🪙"]] },
  c1_pass: { goal: "Your Period 1 citizen continues — with the money you finished with. Before using new products, learn the most important precaution of each one.", steps: ["Check your Season Pass: your citizen and your balance.", "For each product, choose the most important precaution.", "Save your pass."], win: [["Each precaution right", "+2 🪙"], ["Saving your pass", "+14 🪙"]], tip: "Every product you choose this period changes YOUR cash, debt and investments." },
  c2_starter: B_STARTER("limit, statement, cut-off, due date, minimum payment"),
  c2_video: B_VIDEO("Understand the big difference: a debit card uses YOUR money, a credit card uses BORROWED money.", "Next: Card Wars — survive one month with both cards."),
  c2_cards: { goal: "Survive one month with a debit account and a credit card — without falling into the minimum-payment trap.", steps: ["6 purchases arrive: pay with debit, with credit — or wait.", "Place the purchases on the cut-off calendar.", "Read your card statement.", "Pay day: choose how much you pay.", "Answer the minimum-payment trap."], win: [["Calendar right", "+4 🪙"], ["Statement puzzle right", "+4 🪙"], ["Pay the TOTAL (minimum = +2)", "+6 🪙"], ["Trap question right on the first try", "+4 🪙"], ["Each “want” you decide to wait for", "+1 🪙"], ["Finishing", "+18 🪙"]], tip: "Paying only the minimum = paying interest on everything else." },
  c2_page: { goal: "Write your credit card survival guide with your real numbers from Card Wars. This is Advisor Page 06.", steps: ["Check your month in numbers.", "Choose your 3 golden rules.", "Write your advice (20–70 words)."], win: PAGE_RULE("06", "20–70", "advice, a contrast and a number", 26) },
  c3_starter: B_STARTER("installment, leasing, residual value, working capital"),
  c3_read: B_READ("Compare three ways to get the same van: pay cash, take a loan or lease it.", "Next: the Lease or Buy Lab — you are Mariana's advisor."),
  c3_lab: { goal: "Be Mariana's advisor: buy, borrow or lease her van? The smallest monthly payment is not always the cheapest option.", steps: ["Unlock each offer by solving its calculation.", "Contract detective: read the clauses and mark the dangerous ones.", "Live 2 surprises and decide what to do.", "Give your final advice with a reason, a risk and a number."], win: [["Each calculation right on the first try", "+2 🪙"], ["All 6 clauses right", "+4 🪙"], ["Each surprise right on the first try", "+2 🪙"], ["Final advice: 15–50 words with a recommendation, a reason and a number", "required"], ["Finishing", "+18 🪙"]] },
  c3_rec: { goal: "Write Mariana a short, professional letter with your financing recommendation.", steps: ["Read your notes from the Lab.", "Write your recommendation and one risk.", "Use at least 3 key words from the reading."], win: [["Letter: 30–90 words with a recommendation, a risk and 3 key words", "required"], ["Saving your letter", "+24 🪙"]] },
  c4_starter: B_STARTER("diversification, stocks, bonds, risk, return, fees"),
  c4_video: B_VIDEO("Learn how a fund puts many people's money together — and why risk and return travel together.", "Next: the Fund Market — five years in one class."),
  c4_market: { goal: "Manage a fictional $10,000,000 portfolio for five years. No mix wins every year — learn to stay calm and watch the fees.", steps: ["Discover your risk profile.", "Choose your mix of funds.", "A crash arrives: hold or sell?", "Fee detective: find the real cost of each fund."], win: [["Don't sell in the crash", "+4 🪙"], ["A diversified mix (not 100% in one fund)", "+2 🪙"], ["Each fee answer right on the first try", "+3 🪙"], ["Finishing", "+18 🪙"]] },
  c4_page: { goal: "Portfolio Lab: invest part of YOUR district money in different funds and live 5 market years. Your result changes your net worth. This is Advisor Page 07.", steps: ["Choose how much of your cash you invest (keep an emergency reserve!).", "Split it between 4 options: watch the risk meter and the fees.", "Press Play: 5 random market years — watch your line move.", "Play up to 3 times: same mix, different years = RISK.", "Explain your portfolio (20–70 words)."], win: [["Text: 20–70 words with a reason, a risk and a number", "required"], ["Emergency reserve (invest 50% or less)", "+3 🪙"], ["Diversified (no option above 60%)", "+3 🪙"], ["Advisor Page 07 saved", "+26 🪙"]], tip: "Only invest money you won't need soon." },
  c5_starter: B_STARTER("retirement, contribution, compound interest, inflation"),
  c5_read: B_READ("Two grandmothers, two stories: see how starting to save early changes everything.", "Next: the Retirement Time Machine."),
  c5_time: { goal: "Travel through a whole life of saving and see the power of TIME and compound interest.", steps: ["Time jumper: compare starting at 25 vs. 35.", "Life journey: make decisions at each age.", "Fight the inflation monster.", "See your result at age 65."], win: [["Each good life decision", "+3 🪙"], ["“Why” question right", "+3 🪙"], ["Each inflation answer right on the first try", "+2 🪙"], ["Finishing", "+18 🪙"]] },
  c5_page: { goal: "Write your future financial plan and a letter to your future self. This is Advisor Page 08.", steps: ["Check your Time Machine results.", "Choose your plan.", "Write a letter to yourself at 65 (20–70 words)."], win: PAGE_RULE("08", "20–70", "a reason, a contrast and a number", 26) },
  c6_starter: B_STARTER("wallet, QR, transfer, 2FA, financial inclusion"),
  c6_video: B_VIDEO("Discover how technology changes the way we pay, save and borrow.", "Next: the FinTech Tower."),
  c6_tower: { goal: "Compare three digital wallets, solve emergencies and choose the safest and cheapest wallet for YOU.", steps: ["Match each client with the best wallet.", "Fee hunter: find the hidden costs.", "QR race: pay fast and safely.", "Solve the emergencies.", "Choose YOUR wallet."], win: [["Each client right", "+3 🪙"], ["Fee hunter right", "+4 🪙"], ["Each QR round right on the first try", "+1 🪙"], ["A good wallet for you", "+3 🪙"], ["Finishing", "+16 🪙"]] },
  c6_page: { goal: "Your grandma wants to use a digital wallet. Write her a short, clear and SAFE guide.", steps: ["Think: what can go wrong for her?", "Choose the most important tips.", "Write your guide (20–70 words)."], win: [["Guide: 20–70 words with advice and a reason", "required"], ["Saving your guide", "+22 🪙"]] },
  c7_starter: B_STARTER("ledger, block, hash, node, consensus, volatility"),
  c7_video: B_VIDEO("Understand how a blockchain keeps a shared record that is very hard to cheat.", "Next: Block Builder."),
  c7_block: { goal: "Build a simple blockchain, try to cheat it, reach consensus and find the missing block.", steps: ["Build the chain in the right order.", "Try to change an old block — see what happens.", "Reach consensus with the nodes.", "Find the missing block."], win: [["Building with no mistakes (−2 per mistake)", "up to +6 🪙"], ["Each question right on the first try", "+3 🪙"], ["Choosing the valid block", "+4 🪙"], ["Finishing", "+18 🪙"]] },
  c7_crypto: { goal: "Ride the price of a fictional coin — then explain blockchain and crypto in your own words. This is Advisor Page 09.", steps: ["Decide how much you put in the coin.", "Watch the ride: the price goes up and down.", "Explain blockchain using 2 key words.", "Explain crypto with a risk and a contrast."], win: [["Two texts of 15–50 words", "required"], ["Advisor Page 09 saved", "+30 🪙"]], tip: "Crypto can go up AND down very fast — never invest money you need." },
  c8_listen: B_LISTEN("Listen to a phone call from “the bank” and find the tricks that scammers use."),
  c8_shield: { goal: "Find the red flags, watch a Ponzi tower fall and build your own protection plan. This is Advisor Page 10.", steps: ["Find the red flags in each message.", "Watch how a Ponzi scheme grows — and falls.", "Response room: decide what to do.", "Write your protection plan (20–60 words)."], win: [["Plan: 20–60 words with advice and a risk", "required"], ["Coins = 20 + your shield score ÷ 10", "up to +30 🪙"]] },
  c8_fair: { goal: "The final project: use your Advisor Pages to help a SECRET client, compare two options and present in English.", steps: ["Read your secret client's situation.", "Compare two products and recommend one.", "Add a warning and write your advice (25–80 words).", "Press Present and speak to a classmate (2–3 minutes).", "Your classmate scores you with the rubric (100 points)."], win: [...FAIR_RUB, ["You need at least 3 Advisor Pages", "required"]] },
  c8_boss: { goal: "Show everything you learned about financial products: cards, leasing, funds, pensions, FinTech, crypto and scams.", steps: ["Part 1: 5 missions with numbers (a hint appears after a mistake).", "Part 2: 10 questions."], win: [["70% or more in Part 2", "to pass"], ["Each mission right on the first try", "+4 🪙"], ["Each correct question", "+4 🪙"]] },
};

/* =====================================================================
   ESTRUCTURA DEL PERIODO 2 · 9° (clases 1–8 · 4 actividades cortas por clase)
   ===================================================================== */
const A = (key, title, desc, icon, coins, bucket) => ({ key, title, desc, icon, coins, bucket });
const G9P2_WEEKS = [
  { n: 1, g: "1", title: "Welcome to the Product Lab", blurb: "Season 02 opens: six products, six clients — and your Season Pass.", e: "🧪", skills: ["Listening", "Match"], acts: [
    A("c1_starter", "Starter: Product Words 🧱", "Credit, debit, leasing, fund, pension, wallet.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c1_listen", "Listening: Welcome to the Product Lab 🎧", "The district director presents Season 02 · 8 questions.", <Headphones size={22} />, 42, "quizzes"),
    A("c1_match", "Product Match Rush 🧪", "6 clients · 6 products · 3 mystery boxes.", <Puzzle size={22} />, 30, "aprendi"),
    A("c1_pass", "My Season Pass 🪪", "Your Season 01 citizen continues + 6 precautions.", <BadgeCheck size={22} />, 26, "aprendi"),
  ] },
  { n: 2, g: "2", title: "Credit vs Debit Cards", blurb: "Survive a month with two cards — then read your statement.", e: "💳", skills: ["Video", "Simulator"], acts: [
    A("c2_starter", "Starter: Card Words 🧱", "Limit, statement, cut-off, due date, minimum payment.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c2_video", "Video: Credit Cards vs Debit Cards 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c2_cards", "Card Wars · Survive the Month 💳", "6 purchases · cut-off calendar · statement · pay day · minimum trap.", <CreditCard size={22} />, 40, "aprendi"),
    A("c2_page", "My Credit Card Survival Guide 💳 · Page 06", "Your month in numbers + 3 golden rules.", <ShieldCheck size={22} />, 26, "aprendi"),
  ] },
  { n: 3, g: "3", title: "Buy, Borrow or Lease?", blurb: "Mariana needs a van. Cash, loan or leasing — you decide.", e: "🚐", skills: ["Reading", "Lab"], acts: [
    A("c3_starter", "Starter: Financing Words 🧱", "Installment, leasing, residual value, working capital.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c3_read", "Reading: Buy, Borrow or Lease? 📖", "Mariana and Sweet Corner · quiz (8 of 12).", <BookOpen size={22} />, 42, "quizzes"),
    A("c3_lab", "Lease or Buy Lab 🚐", "3 stations · contract detective · 2 surprises · final advice.", <Truck size={22} />, 36, "aprendi"),
    A("c3_rec", "My Financing Recommendation 📨", "A professional letter for Mariana.", <FileText size={22} />, 24, "aprendi"),
  ] },
  { n: 4, g: "4", title: "Risk & Return: Investment Funds", blurb: "Build a portfolio and live five years of market news.", e: "📈", skills: ["Video", "Market"], acts: [
    A("c4_starter", "Starter: Fund Words 🧱", "Diversification, stocks, bonds, risk, return, fees.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c4_video", "Video: What is a Mutual Fund? 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c4_market", "Fund Market · Five Years Later 📈", "Risk profile · your mix · a crash · fee detective.", <LineIcon size={22} />, 34, "aprendi"),
    A("c4_page", "My Investment Portfolio 📈 · Page 07", "Invest part of YOUR district money.", <TrendingUp size={22} />, 26, "aprendi"),
  ] },
  { n: 5, g: "5", title: "Your Future Self: Pensions", blurb: "Two grandmothers, one time machine — and a letter to your future self.", e: "🧓", skills: ["Reading", "Time travel"], acts: [
    A("c5_starter", "Starter: Pension Words 🧱", "Retirement, contribution, compound interest, inflation.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c5_read", "Reading: Your Future Self 📖", "Elena, Rosa and Sofia · quiz (8 of 12).", <BookOpen size={22} />, 42, "quizzes"),
    A("c5_time", "Retirement Time Machine 🧓", "Time jumper · life journey · inflation monster · age 65.", <Hourglass size={22} />, 36, "aprendi"),
    A("c5_page", "My Future Financial Plan 🧓 · Page 08", "Your plan + a letter to your future self.", <Mail size={22} />, 26, "aprendi"),
  ] },
  { n: 6, g: "6", title: "FinTech & Electronic Money", blurb: "Three wallets, three clients, eight emergencies.", e: "📱", skills: ["Video", "Tower"], acts: [
    A("c6_starter", "Starter: FinTech Words 🧱", "Wallet, QR, transfer, 2FA, financial inclusion.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c6_video", "Video: What is FinTech? 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c6_tower", "FinTech Tower 📱", "Clients · fee hunter · QR race · emergencies · MY wallet.", <Smartphone size={22} />, 34, "aprendi"),
    A("c6_page", "My Digital Payment Guide 📲", "A safe guide for Grandma.", <QrCode size={22} />, 22, "aprendi"),
  ] },
  { n: 7, g: "7", title: "Blockchain & Crypto", blurb: "Build a chain, try to cheat it — then ride the crypto rollercoaster.", e: "⛓️", skills: ["Video", "Builder"], acts: [
    A("c7_starter", "Starter: Blockchain Words 🧱", "Ledger, block, hash, node, consensus, volatility.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c7_video", "Video: What is Blockchain? 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c7_block", "Block Builder ⛓️", "Build · cheat · consensus · missing block.", <Layers size={22} />, 34, "aprendi"),
    A("c7_crypto", "Crypto Rollercoaster 🎢 · Page 09", "A fictional coin + what I understand.", <Coins size={22} />, 30, "aprendi"),
  ] },
  { n: 8, g: "8", title: "Scam Shield + Product Fair", blurb: "A fake bank call, red flags, a Ponzi tower — and your final fair.", e: "🛡️", skills: ["Listening", "Speaking"], acts: [
    A("c8_listen", "Listening: The Call from “the Bank” 🎧", "Find the tricks · 8 questions.", <Headphones size={22} />, 42, "quizzes"),
    A("c8_shield", "Scam Shield 🛡️ · Page 10", "Red flags · Ponzi tower · response room · my plan.", <ShieldCheck size={22} />, 33, "aprendi"),
    A("c8_fair", "Product Fair 🏆", "Secret client · compare · present · peer rubric.", <Award size={22} />, 50, "aprendi"),
    A("c8_boss", "The Financial Product Challenge ⚔️", "5 missions + 10 questions (70%).", <Swords size={22} />, 70, "quizzes"),
  ] },
];
const ALL_ACTS92 = G9P2_WEEKS.flatMap((w) => w.acts);
const TOTAL_ACTS92 = ALL_ACTS92.length;
const PAGE_ACTS92 = [...PAGES92.map((p) => p.key), "c8_fair", "c3_rec", "c6_page"];

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Periodo2G9 = ({ userData, API_URL, existingRow, onBack }) => {
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
  /* La fila del Periodo 1 (9P1): tu ciudadano y tu saldo continúan */
  const p1 = parseJSON(store.semanas?.["9P1"]?.Respuestas_JSON);
  const resp = { ...(respRef.current || {}), __p1: p1 };
  const doneCount = ALL_ACTS92.filter((a) => checklist[a.key]).length;
  const pctDone = Math.round((doneCount / TOTAL_ACTS92) * 100);
  const weekDone = (w) => w.acts.every((a) => checklist[a.key]);
  const coinsTotal = Math.round(points.comportamiento + points.quizzes + points.aprendi);

  const persist = (nextChecklist, nextPoints, respPatch) => {
    respRef.current = { ...respRef.current, ...respPatch };
    const done = ALL_ACTS92.filter((a) => nextChecklist[a.key]).length;
    const row = {
      Student_Key: userData.Student_Key, Semana: PERIOD_KEY, Grado: GRADE,
      Estado: done >= TOTAL_ACTS92 ? "completed" : "in_progress",
      Porcentaje: Math.round((done / TOTAL_ACTS92) * 100),
      Puntos_Comportamiento: nextPoints.comportamiento, Puntos_Quizzes: nextPoints.quizzes, Puntos_Aprendi: nextPoints.aprendi,
      Checklist_JSON: JSON.stringify(nextChecklist), Respuestas_JSON: JSON.stringify(respRef.current),
    };
    const prev = store.semanas?.[PERIOD_KEY];
    dispatch({ type: "save_progreso", payload: row }); // OPTIMISTA
    fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "save_progreso", data: row }) })
      .catch((e) => { console.error("Error guardando 9° Periodo 2:", e); dispatch({ type: "rollback_progreso", payload: { Semana: PERIOD_KEY, prev } }); });
  };
  const complete = (key, bucket, xp, respPatch, pass = true) => {
    const already = !!checklist[key];
    const nextChecklist = { ...checklist, [key]: already || pass };
    const nextPoints = already ? points : { ...points, [bucket]: points[bucket] + (xp || 0) };
    setChecklist(nextChecklist); setPoints(nextPoints);
    persist(nextChecklist, nextPoints, respPatch);
    return Promise.resolve();
  };
  const WRAP = "s1 p1 p2 p3 p4 g7 g72 g73 g74 g8 g82 g83 g84 g9 g91 g92";

  if (act) {
    const def = ALL_ACTS92.find((a) => a.key === act);
    const exit = () => setAct(null);
    const save = (r) => complete(act, def.bucket, r.xp, { [act]: { ...r, at: nowISO() } }, r.passed !== false);
    const reading = (tag, title, subtitle, sections, glossary, questions, emoji) => (
      <ReadThen tag={tag} title={title} subtitle={subtitle} minutes={8} sections={[{ node: <Brief91 key="guide" k={act} /> }, ...sections]} glossary={glossary} onExit={exit} finishLabel="I read it — start the quiz (8 questions)">
        <QuizRunner title={`${title} · check`} emoji={emoji} questions={questions} pickCount={8} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
      </ReadThen>
    );
    const video = (src, title, qs) => <VideoQuiz intro={<Brief91 k={act} />} src={src} title={title} questions={qs} pickCount={8} onSave={save} onExit={exit} />;
    const starter = (title, subtitle, data, coins = 20) => <StarterPack intro={<Brief91 k={act} />} title={title} subtitle={subtitle} cards={data.cards} pairs={data.pairs} rounds={data.rounds} coins={coins} onSave={save} onExit={exit} />;
    const rush = (title, subtitle, data, doneTitle, seconds = 60) => <SpeedSort intro={<Brief91 k={act} />} title={title} subtitle={subtitle} buckets={data.buckets} items={data.items} seconds={seconds} doneTitle={doneTitle} onSave={save} onExit={exit} />;
    let view = null;
    switch (act) {
      case "c1_starter": view = starter("Starter: Product Words 🧱", "Benefit · cost · risk — for every product.", START_P1); break;
      case "c1_listen": view = <ListenAudio intro={<Brief91 k={act} />} src={audioProductLab} title="Welcome to the Product Lab" subtitle="The district director opens Season 02." script={LISTEN_P2} questions={LQ_P2} onSave={save} onExit={exit} />; break;
      case "c1_match": view = <ProductMatch onSave={save} onExit={exit} />; break;
      case "c1_pass": view = <SeasonPass resp={resp} studentName={name} existing={resp.c1_pass} onSave={save} onExit={exit} />; break;
      case "c2_starter": view = starter("Starter: Card Words 🧱", "Read a card statement like a pro.", START_P2); break;
      case "c2_video": view = video(VID_CARDS, "Credit Cards vs Debit Cards", VQ_CARDS); break;
      case "c2_cards": view = <CardWars onSave={save} onExit={exit} />; break;
      case "c2_page": view = <CardGuide resp={resp} existing={resp.c2_page} onSave={save} onExit={exit} />; break;
      case "c3_starter": view = starter("Starter: Financing Words 🧱", "The smallest payment is not always the cheapest.", START_P3); break;
      case "c3_read": view = reading("READING · B1+ · BUSINESS CASE", "Buy, Borrow or Lease?", "Three ways to get the same van.", READ_P2R1, GLOSS_P2R1, Q_P2R1, "🚐"); break;
      case "c3_lab": view = <LeaseLab onSave={save} onExit={exit} />; break;
      case "c3_rec": view = <FinancingRec resp={resp} existing={resp.c3_rec} onSave={save} onExit={exit} />; break;
      case "c4_starter": view = starter("Starter: Fund Words 🧱", "Risk and return travel together.", START_P4); break;
      case "c4_video": view = video(VID_FUND, "What is a Mutual Fund?", VQ_FUND); break;
      case "c4_market": view = <FundMarket onSave={save} onExit={exit} />; break;
      case "c4_page": view = <PortfolioPage resp={resp} existing={resp.c4_page} onSave={save} onExit={exit} />; break;
      case "c5_starter": view = starter("Starter: Pension Words 🧱", "Time is a financial resource.", START_P5); break;
      case "c5_read": view = reading("READING · B1+ · STORY", "Your Future Self", "Two grandmothers, two different stories.", READ_P2R2, GLOSS_P2R2, Q_P2R2, "🧓"); break;
      case "c5_time": view = <TimeMachine onSave={save} onExit={exit} />; break;
      case "c5_page": view = <FuturePlan resp={resp} existing={resp.c5_page} onSave={save} onExit={exit} />; break;
      case "c6_starter": view = starter("Starter: FinTech Words 🧱", "Money in your phone — safely.", START_P6); break;
      case "c6_video": view = video(VID_FINTECH, "What is FinTech?", VQ_FINTECH); break;
      case "c6_tower": view = <FintechTower resp={resp} onSave={save} onExit={exit} />; break;
      case "c6_page": view = <PaymentGuide resp={resp} existing={resp.c6_page} onSave={save} onExit={exit} />; break;
      case "c7_starter": view = starter("Starter: Blockchain Words 🧱", "Trust the math — but watch the price.", START_P7); break;
      case "c7_video": view = video(VID_CHAIN, "What is Blockchain?", VQ_CHAIN); break;
      case "c7_block": view = <BlockBuilder onSave={save} onExit={exit} />; break;
      case "c7_crypto": view = <CryptoCoaster resp={resp} existing={resp.c7_crypto} onSave={save} onExit={exit} />; break;
      case "c8_listen": view = <ListenAudio intro={<Brief91 k={act} />} src={audioScamCall} title="The Call from “the Bank”" subtitle="Tomás receives a phone call. Listen for the tricks." script={LISTEN_SCAM} questions={LQ_SCAM} onSave={save} onExit={exit} />; break;
      case "c8_shield": view = <ScamShield existing={resp.c8_shield} onSave={save} onExit={exit} />; break;
      case "c8_fair": view = <ProductFair resp={resp} studentName={name} existing={resp.c8_fair} onSave={save} onExit={exit} />; break;
      case "c8_boss": view = <BossProducts onSave={save} onExit={exit} />; break;
      default: view = null;
    }
    return <div className={WRAP}>{view}</div>;
  }

  if (week) {
    const w = G9P2_WEEKS.find((x) => x.n === week);
    const wDone = w.acts.filter((a) => checklist[a.key]).length;
    const next = G9P2_WEEKS[G9P2_WEEKS.indexOf(w) + 1];
    return (
      <div className={WRAP}>
        <button className="s1-back" onClick={() => setWeek(null)}><ArrowLeft size={18} strokeWidth={2.4} /> Back to Period 2</button>
        <div className="s1-hero p1-week-hero g7-hero g8-hero g91-hero g92-hero">
          <span className="s1-tag">{w.e} GRADE 9 · PERIOD 2 · CLASS {w.g}</span>
          <h1>{w.title}</h1>
          <p>{w.blurb}</p>
          <div className="s1-progress"><div className="bar"><i style={{ width: `${(wDone / w.acts.length) * 100}%` }} /></div><span className="pill">{wDone}/{w.acts.length}</span></div>
        </div>
        <SeasonPanel resp={resp} compact />
        <div className="s1-quest">
          {w.acts.map((a) => (
            <div key={a.key} className={`act-card ${checklist[a.key] ? "done" : ""} ${PAGE_ACTS92.includes(a.key) ? "g8-page-act" : ""} ${a.title.startsWith("Starter") ? "g8-starter-act" : ""} ${a.key.endsWith("_rush") ? "g8-rush-act" : ""} ${a.key.endsWith("_read") || a.key.endsWith("_video") || a.key.endsWith("_listen") ? "g73-learn-act" : ""}`}>
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
      <div className="s1-hero p1-hero g7-hero g8-hero g91-hero g92-hero">
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> ADMIN PREVIEW · GRADE {GRADE} · PERIOD 2</span>
        <h1>The Product Lab 🧪</h1>
        <p>How can we compare modern financial products, understand their costs and risks, and protect our money in a digital world?</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pctDone}%` }} /></div><span className="pill">{pctDone}%</span></div>
        <div className="p1-hero-chips"><span><Coins size={14} /> {coinsTotal} coins</span><span><Check size={14} /> {doneCount}/{TOTAL_ACTS92} activities</span><span>🧪 Season 02</span><span>🧾 Advisor Pages 06–10</span><span>🏆 Financial Product Advisor</span></div>
      </div>
      <div className="g8-howyear"><b>🧭 This period:</b><span>Season 02 of the Financial District. Your citizen from Period 1 continues — with the balance you finished with. Now the district needs more than accounts: cards, leasing, funds, pensions, digital wallets and crypto. Every product you choose changes YOUR cash, debt and investments. Five missions become Advisor Pages 06–10, and at the Product Fair you advise a secret client.</span></div>
      <SeasonPanel resp={resp} studentName={name} />
      {checklist.c8_fair && <button type="button" className="p3-card-link" onClick={() => setAct("c8_fair")}><Award size={18} /> See my Product Advisor Guide <ChevronRight size={16} /></button>}
      <div className="p1-passport">
        <div className="p1-passport-head"><b>🧪 Lab Pass</b><span>Finish a class to get its stamp</span></div>
        <div className="p1-stamps">{G9P2_WEEKS.map((w) => <button key={w.n} type="button" className={`p1-stamp ${weekDone(w) ? "done" : ""}`} onClick={() => setWeek(w.n)} title={w.title}><em>{w.e}</em><small>{w.g}</small></button>)}</div>
      </div>
      <div className="p1-weeks">
        {G9P2_WEEKS.map((w) => {
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