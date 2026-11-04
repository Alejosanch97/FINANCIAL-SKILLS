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
import "../Styles/noveno1.css";   // 9° · Periodo 1 · Financial District
import useGlobalReducer from "../hooks/useGlobalReducer";
import audioWelcomeDistrict from "../assets/img/listening9.mp3"; // 🎧 Listening clase 1

/* =====================================================================
   GRADO 9 · PERIODO 1 · CHOOSING THE RIGHT FINANCIAL PATH (B1–B1+)
   Clases 1–8 · Pregunta guía: How can banking services, financial products
   and responsible decisions help young people build a secure financial future?
   Hilo: FINANCIAL DISTRICT · Season 01 — un distrito simulado (todo en código):
   el District Bank y tu cuenta empiezan IGUAL para todos y cambian con TUS decisiones.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "9P1", Grado = "9".
   ===================================================================== */
const PERIOD_KEY = "9P1";
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
  const p = PAGES91.find((x) => x.n === n);
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
   PERIODO 1 · 9° · VIDEOS (10–12 preguntas → 8 al azar) + LECTURAS B1–B1+ (12 → 8)
   Opciones: correcta (nunca la más larga) · parecida pero errada (la más larga)
             · trampa corta (errada) · nada que ver
   ===================================================================== */
const VID_RUN = "https://res.cloudinary.com/y9r84vgz/video/upload/v1793471993/videoplayback_30.mp4";
const VID_CB = "https://res.cloudinary.com/y9r84vgz/video/upload/v1793472207/videoplayback_31.mp4";
const VID_MONEY = "https://res.cloudinary.com/y9r84vgz/video/upload/v1793472518/videoplayback_32.mp4";
const VID_BANK1 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1793472646/videoplayback_33.mp4";
const VID_GRAMEEN = "https://res.cloudinary.com/y9r84vgz/video/upload/v1793472787/videoplayback_34.mp4";

/* ---------- v33 · Banking 1 (clase 2) ---------- */
const VQ_BANK1 = [
  { q: "What problem does a bank solve in a community, according to the video?", options: ["It connects savers with entrepreneurs who need money", "It prints gold coins and new paper money so that the whole village becomes richer immediately", "It collects taxes", "It sells farm animals"], correct: 0, feedback: "The bank is an intermediary: idle savings → loans for productive projects." },
  { q: "What does the speaker say about gold and paper money?", options: ["Both are claims on future goods and services", "Gold is real wealth that feeds people, while paper money is completely useless in every economy", "Paper money is backed by gold", "Gold is illegal"], correct: 0, feedback: "Gold is just a shiny, scarce medium of exchange — like paper money." },
  { q: "Why does the new bank look like a Greek or Roman temple?", options: ["To look safe and trustworthy", "Because the government has strict rules that force every bank to use that exact building style", "To store food", "For tourists"], correct: 0, feedback: "A solid building builds confidence: people feel their savings are safe." },
  { q: "How are customer deposits classified on the bank's balance sheet?", options: ["As liabilities — the bank owes that money", "As assets, because the cash is physically inside the bank's vault and belongs to the bank", "As profit", "As taxes"], correct: 0, feedback: "Deposits are liabilities: customers can ask for them back." },
  { q: "The village deposits $10,000,000 and the bank keeps a 10% reserve. How much cash stays in reserve?", options: ["$1,000,000", "$9,000,000, because the bank keeps the biggest part of the money safe in the vault", "$10,000,000", "$500,000"], correct: 0, feedback: "10% of $10,000,000 = $1,000,000." },
  { q: "What happens to the other $9,000,000?", options: ["It is lent to borrowers and becomes an asset", "It is kept in a second vault so the bank can return all the money on the same day", "It is burned", "It is given away"], correct: 0, feedback: "Loans are assets: borrowers owe that money to the bank." },
  { q: "How does the bank get its main income?", options: ["By charging interest on loans", "By charging every depositor a big monthly storage fee for keeping cash inside the temple", "By collecting taxes", "By selling the building"], correct: 0, feedback: "Interest income comes from borrowers." },
  { q: "The bank charges 10% on $9,000,000 in loans. What is the interest income?", options: ["$900,000", "$1,000,000, because the bank charges 10% on all the money that people deposited", "$500,000", "$90,000"], correct: 0, feedback: "10% × $9,000,000 = $900,000." },
  { q: "The bank pays 5% on $10,000,000 in deposits. What is the interest expense?", options: ["$500,000", "$450,000, because the bank only pays interest on the money that it lends to borrowers", "$900,000", "$50,000"], correct: 0, feedback: "5% × $10,000,000 = $500,000." },
  { q: "Income $900,000 − interest expense $500,000 − salaries $100,000. What is the net profit?", options: ["$300,000", "$400,000, because salaries are not part of the bank's costs and must not be subtracted", "$900,000", "$100,000"], correct: 0, feedback: "Spread $400,000 − salaries $100,000 = $300,000." },
  { q: "Why do savers AND entrepreneurs benefit from the bank?", options: ["Savers get interest; entrepreneurs get capital", "Savers never pay any taxes and entrepreneurs never have to repay the money they borrow", "Only the bank wins", "Nobody benefits"], correct: 0, feedback: "Safety + interest for savers; money for productive projects for entrepreneurs." },
  { q: "The bank funds irrigation ditches and factories that produce more. What idea is this?", options: ["Investment makes the economic pie bigger", "Printing extra paper money creates inflation, so prices go up for every family in the village", "A zero-sum game", "A tax"], correct: 0, feedback: "Real investment creates growth: “the pie is getting bigger”." },
];

/* ---------- v30 · Bank Runs (clase 3) ---------- */
const VQ_RUN = [
  { q: "Which practice lets banks keep only part of their deposits as cash?", options: ["Fractional reserve banking", "A full-reserve system where banks must keep every single peso of every deposit in the vault", "Deposit insurance", "The stock market"], correct: 0, feedback: "Banks keep a fraction and lend the rest." },
  { q: "Why can a panic destroy a bank that is solvent (healthy)?", options: ["Its assets (loans) are not liquid", "Because all of its loans are bad and none of its borrowers will ever repay any money", "High taxes", "Bad weather"], correct: 0, feedback: "Loans can't become cash immediately → a liquidity problem." },
  { q: "What guarantees customer deposits up to a legal limit?", options: ["Government deposit insurance", "A central bank promise to pay every customer of every bank all of their money forever", "A credit card", "A big vault"], correct: 0, feedback: "Deposit insurance (in Colombia: Fogafín) protects eligible deposits up to a limit." },
  { q: "What do we call fear that spreads to many banks at the same time?", options: ["A systemic panic", "A normal busy day when many people go to the bank to pay their monthly bills on time", "Inflation", "A holiday"], correct: 0, feedback: "Withdrawals cascade from one bank to the next." },
  { q: "A bank must sell long-term loans very fast during a panic. What usually happens?", options: ["It sells them at a discount (a fire sale)", "It sells them for more than their full value because many investors want them during a crisis", "Nothing changes", "It prints money"], correct: 0, feedback: "Selling fast = selling cheap → losses." },
  { q: "What does the central bank's discount window do in a liquidity crisis?", options: ["It works as the lender of last resort", "It gives every bank free money that never has to be returned, even if the bank is broke", "It closes banks", "It sells stocks"], correct: 0, feedback: "It lends cash to solvent banks, usually against good collateral." },
  { q: "Why does missing information make bank runs more likely?", options: ["People don't know if the bank's assets are healthy", "Because managers always hide secret dividend payments from customers in their monthly reports", "The bank is closed", "Interest is too low"], correct: 0, feedback: "Uncertainty → fear → “withdraw first, ask later”." },
  { q: "What is it when a bank's liabilities are bigger than its assets?", options: ["Insolvency", "Temporary illiquidity, a short problem that disappears as soon as the bank gets some cash", "A profit", "A reserve"], correct: 0, feedback: "Insolvent = it owes more than it owns. Illiquid = no cash now, but enough assets." },
  { q: "How do mobile apps change bank runs compared with the old lines in the street?", options: ["People can withdraw much faster", "Apps eliminate all risk because nobody can withdraw money from a phone during a crisis", "Nothing changes", "Runs are impossible"], correct: 0, feedback: "A digital run can happen in hours, not days." },
  { q: "Why might authorities pause withdrawals or trading for a short time in extreme panic?", options: ["To prevent destructive fire sales", "To hide fraud from customers and permanently cancel all the debts that the bank must pay", "To earn interest", "To print coins"], correct: 0, feedback: "A pause can stop panic selling — but it can also increase fear if it's not explained." },
];

/* ---------- v31 · Central Banking (clase 4) ---------- */
const VQ_CB = [
  { q: "Who receives financial services from a central bank?", options: ["The government and banks", "Individual citizens and retail stores, who can open savings accounts there like at any bank", "Hedge funds", "Tourists"], correct: 0, feedback: "The central bank is the bank of the government and of the banks." },
  { q: "What is monetary policy?", options: ["Influencing money supply and credit", "Setting income tax rates and deciding how the government will spend its budget every year", "Fixing prices", "Printing books"], correct: 0, feedback: "Rates and money supply influence credit and inflation." },
  { q: "What are the two goals (the dual mandate) of the Federal Reserve?", options: ["Stable prices and maximum employment", "Zero national debt and high stock prices, so that investors and the government are always happy", "Low taxes", "Cheap cars"], correct: 0, feedback: "Price stability + full employment. (Banco de la República focuses on low, stable inflation.)" },
  { q: "Why should a central bank be independent from politicians?", options: ["It reduces inflation and political manipulation", "So that politicians can lower interest rates right before an election to look good to voters", "It pays no taxes", "It closes banks"], correct: 0, feedback: "Short-term political pressure can create long-term inflation." },
  { q: "What happened in the U.S. when there was no central bank?", options: ["Booms, busts and frequent bank runs", "The economy was so stable that markets could not grow at all for more than a hundred years", "Prices were fixed", "There was no money"], correct: 0, feedback: "Without a lender of last resort, panics were common." },
  { q: "What was the problem when thousands of private banks printed their own money?", options: ["No single trusted currency", "Every note had exactly the same value everywhere, so trade became too easy and fast", "Coins disappeared", "Too much gold"], correct: 0, feedback: "People didn't know which notes were worth what." },
  { q: "What does the central bank do when banks suddenly lose a lot of cash?", options: ["It acts as the lender of last resort", "It buys every failing bank with shares and becomes the owner of all of their customers", "It closes every account", "It bans loans"], correct: 0, feedback: "Emergency liquidity for solvent banks." },
  { q: "In what year was the Federal Reserve created?", options: ["1913", "1791, together with the first bank of the United States and the first national coins", "2008", "1933"], correct: 0, feedback: "The Fed was established in 1913." },
  { q: "Which job does a central bank do for the financial system?", options: ["Distributes currency and clears payments", "Approves every individual mortgage and car loan that families ask for at their local bank", "Pays company salaries", "Checks tax returns"], correct: 0, feedback: "Cash distribution + payment systems." },
  { q: "How does bank supervision help the public?", options: ["It keeps the financial system stable", "It guarantees that nobody will ever lose money when they invest in the stock market", "It sets bank profits", "It removes interest"], correct: 0, feedback: "Stability — not zero risk. (In Colombia, the Superfinanciera supervises banks.)" },
];

/* ---------- v32 · How Banks Make Money (clase 6) ---------- */
const VQ_MONEY = [
  { q: "What do most people believe about the money they deposit in a bank?", options: ["That it just sits there, safe and untouched", "That it is invested immediately in the stock market and grows by itself every single day", "That it is burned", "That it is free"], correct: 0, feedback: "In reality, banks lend most of it." },
  { q: "What is the system called where banks keep a fraction and lend the rest?", options: ["Fractional reserve banking", "Fixed collateral lending, where every loan must be backed by gold kept inside the vault", "Crowdfunding", "Tax collection"], correct: 0, feedback: "Fractional reserve banking." },
  { q: "A customer deposits $1,000 and the bank keeps 10%. How much does it lend?", options: ["$900", "$1,000, because a bank can always lend the full deposit if the customer agrees", "$100", "$90"], correct: 0, feedback: "$1,000 − $100 reserve = $900." },
  { q: "Where do banks get most of their profit?", options: ["Loans and the interest rate spread", "Monthly fees that customers pay to keep their cash inside digital wallets and mobile apps", "Crypto trading", "Government gifts"], correct: 0, feedback: "Spread = lending rate − deposit rate." },
  { q: "Why do banks push credit cards and personal loans so much?", options: ["They bring high interest and fees", "Because the law forces every bank to give each customer at least one credit card a year", "They lower risk", "They stop inflation"], correct: 0, feedback: "High interest (sometimes very high) + late fees + annual fees." },
  { q: "What can happen if you pay only the minimum on a credit card?", options: ["You can stay in debt for years", "The bank forgives the rest of the balance after six months if you always pay the minimum", "Your score goes to the top", "Interest goes to zero"], correct: 0, feedback: "The minimum mostly covers interest, not the principal." },
  { q: "Which is a hidden fee banks often charge?", options: ["Overdraft and ATM fees", "Positive bonus charges that the bank adds to your account when you save more than usual", "Deposit gifts", "Free transfers"], correct: 0, feedback: "Small fees add up to big amounts." },
  { q: "According to the video, who benefits most from this banking model?", options: ["The banks", "The everyday savers, who receive most of the profit that banks make with their deposits", "Students", "Tourists"], correct: 0, feedback: "The video argues savers get the “crumbs”. Think critically: banks also have costs and risks." },
  { q: "What strategy does the video recommend to protect your money?", options: ["High-yield savings and better tools", "Keeping all your cash at home inside a mattress so that no bank can ever use your money", "Avoid all banks", "Borrow the maximum"], correct: 0, feedback: "Compare rates and costs; don't leave money idle in a low-interest account." },
  { q: "What happens to the money supply when the lending cycle repeats across banks?", options: ["It grows through new deposits and loans", "It stays exactly equal to the original cash, because banks cannot create any new money", "It disappears", "It turns into dollars"], correct: 0, feedback: "Loans become new deposits that are partly lent again." },
  { q: "Why do savers lose out in a low-interest savings account?", options: ["They earn very little while the bank earns more", "Because the bank takes half of every deposit each month as a penalty for saving", "Savings are illegal", "Banks close on Sundays"], correct: 0, feedback: "If inflation is higher than your interest, your money loses value." },
  { q: "What fee appears when you spend more than you have in your account?", options: ["An overdraft fee", "A portfolio maintenance fee for managing your investments in international markets", "An exchange fee", "No fee"], correct: 0, feedback: "Overdraft = borrowing from the bank → fees and interest." },
];

/* ---------- v34 · Grameen Bank (clase 8) ---------- */
const VQ_GRAMEEN = [
  { q: "What crisis made Professor Yunus feel his economics theories were useless?", options: ["A terrible famine in Bangladesh", "A sudden crash of the national stock market that destroyed the savings of rich families", "A war", "A flood of tourists"], correct: 0, feedback: "People were dying of hunger while he taught elegant theories." },
  { q: "What simple mission did Yunus set for himself?", options: ["To be useful to another person, even for a day", "To write a new and famous textbook about the economy of the whole world in one year", "To build a campus", "To become rich"], correct: 0, feedback: "Start small: be useful to one human being." },
  { q: "What shocked Yunus when he visited the village?", options: ["Loan sharks charging abusive rates", "Commercial banks were secretly charging villagers high fees for their savings accounts", "Expensive phones", "High taxes"], correct: 0, feedback: "People were trapped by moneylenders." },
  { q: "How many people were trapped, and how much did they owe in total?", options: ["42 people owing $27 in total", "420 people owing $2,700 in total, which was a very large amount of money for the village", "12 people, $500", "100 people, $10,000"], correct: 0, feedback: "A tiny amount — but enough to trap 42 families." },
  { q: "How did Yunus first help those 42 people?", options: ["He paid the $27 himself", "He asked the national government for a big emergency grant for the whole village", "He sued the lenders", "He did nothing"], correct: 0, feedback: "He paid from his own pocket — then looked for a bigger solution." },
  { q: "What did the banks say when Yunus asked them to lend to poor people?", options: ["That it was impossible", "They agreed immediately and offered millions of dollars in loans without any conditions", "They asked for a party", "They hired him"], correct: 0, feedback: "“Banks cannot lend to poor people” — no collateral, no credit history." },
  { q: "How did Yunus finally convince the bank to lend?", options: ["He became the guarantor and signed himself", "He threatened to sue the bank in the supreme court and won the case after many years", "He printed money", "He bought the bank"], correct: 0, feedback: "He guaranteed the loans — and the borrowers repaid." },
  { q: "In what year did Grameen become an independent bank?", options: ["1983", "1976, the same year that Professor Yunus visited the village for the first time", "2012", "1995"], correct: 0, feedback: "Grameen Bank was formally established in 1983." },
  { q: "What innovation did Yunus help create?", options: ["Microcredit: small loans without collateral", "High-frequency crypto trading for people who want to become rich in a few days", "Credit cards", "Online banking"], correct: 0, feedback: "Small loans for productive activities, often with group support." },
  { q: "What is Yunus's philosophy about big problems?", options: ["Take a local problem in your hand and solve it", "Wait until the government writes new laws, because individuals can never change anything", "Never help others", "Theories are perfect"], correct: 0, feedback: "Global problems are huge — but you can start locally." },
];

/* ---------- LISTENING · Welcome to the Financial District (clase 1) ---------- */
const LISTEN_1 = [
  { who: "Ms. Rivera", t: "Good morning, and welcome to the Financial District! My name is Ms. Rivera, and I am the district guide. From today, you are not just students. You are new citizens of this district — and your decisions matter." },
  { who: "Ms. Rivera", t: "Our district stands on five pillars. The first is Money Management: planning your income, your expenses and your savings. The second is Entrepreneurship: creating value with a business idea. The third is Financial Wellbeing: making decisions that protect your peace of mind." },
  { who: "Ms. Rivera", t: "The fourth pillar is the Digital Economy: using apps, cards and transfers safely. And the fifth is Global Citizenship: understanding that money decisions affect other people and other communities, not only you." },
  { who: "Ms. Rivera", t: "Now, the rules. Rule number one: everybody starts from zero, with exactly the same conditions. Every citizen receives a District ID and an account with two million pesos at the District Bank. Nobody is richer at the start." },
  { who: "Ms. Rivera", t: "The District Bank is the heart of our district. Right now, people have deposited one hundred million pesos. But the bank only keeps twenty million in cash in its vault. Seventy million are lent to families and businesses, and ten million are in other assets." },
  { who: "Tomás", t: "Wait — so if everybody wants their money back on the same day, the bank doesn't have it?" },
  { who: "Ms. Rivera", t: "Excellent question, Tomás! That is exactly why trust is so important. Today, the trust level of the bank is eighty percent. If trust falls, people get nervous. In class three you will see what happens when a rumor spreads." },
  { who: "Ms. Rivera", t: "Rule number two: your decisions change YOUR district. If you choose a bad account, you will pay more fees. If you manage the bank badly, the bank can lose cash and trust. The same game, different stories." },
  { who: "Ms. Rivera", t: "Rule number three: credit is not extra income. It is money you borrow today and must repay tomorrow, usually with an additional cost. Please remember that sentence — you will need it in the Loan Committee." },
  { who: "Ms. Rivera", t: "Finally, your goal. Every important mission gives you an Advisor Page: a piece of evidence about a real financial decision. After five pages, you will present your advice at the Advisor Fair. If you do it well, you will become a Certified Financial Advisor. Good luck, citizens!" },
];
const LQ_1 = [
  { q: "Who is Ms. Rivera?", options: ["The district guide", "The manager of the central bank, who decides the interest rates for every bank in the country", "A new student", "A loan shark"], correct: 0, feedback: "“I am the district guide.”" },
  { q: "How many pillars does the district stand on?", options: ["Five", "Seven, because each class of the period has its own pillar to discover", "Two", "Ten"], correct: 0, feedback: "Money Management, Entrepreneurship, Wellbeing, Digital Economy, Global Citizenship." },
  { q: "Which pillar is about using apps, cards and transfers safely?", options: ["Digital Economy", "Global Citizenship, because the internet connects people from all the countries of the world", "Wellbeing", "Sports"], correct: 0, feedback: "The fourth pillar." },
  { q: "What does Global Citizenship mean in the listening?", options: ["Money decisions also affect other people", "Every citizen of the district must travel to other countries and change money in foreign banks", "Speaking many languages", "Having a passport"], correct: 0, feedback: "Your decisions affect other communities too." },
  { q: "How much money does every citizen receive at the start?", options: ["$2,000,000", "$20,000,000, the same amount of cash that the District Bank keeps in its vault", "$100,000,000", "Nothing"], correct: 0, feedback: "Two million pesos — the same for everybody." },
  { q: "How much have people deposited in the District Bank?", options: ["$100,000,000", "$70,000,000, because that is the money the bank has given to families and businesses", "$10,000,000", "$2,000,000"], correct: 0, feedback: "Deposits: one hundred million." },
  { q: "How much cash does the bank keep in the vault?", options: ["$20,000,000", "All the $100,000,000, because a good bank always keeps every deposit as cash", "$70,000,000", "$0"], correct: 0, feedback: "Only twenty million in cash." },
  { q: "What worries Tomás?", options: ["The bank can't pay everybody on the same day", "That the bank will charge him a very high monthly fee for keeping his two million pesos", "Losing his ID", "The weather"], correct: 0, feedback: "Most of the money is lent, so not everyone can withdraw at once." },
  { q: "What is the trust level of the bank today?", options: ["80%", "100%, because nobody in the district has ever heard a rumor about the bank", "20%", "50%"], correct: 0, feedback: "Trust: eighty percent." },
  { q: "What does rule number two say?", options: ["Your decisions change your district", "Everybody must make exactly the same decisions so that all the districts end in the same way", "Never use a bank", "Always borrow"], correct: 0, feedback: "Same game, different stories." },
  { q: "According to rule number three, what is credit?", options: ["Money you borrow and must repay", "Extra income that the bank gives you as a prize when you have a good monthly salary", "A gift", "A tax"], correct: 0, feedback: "Credit is not extra income — it has a cost." },
  { q: "What do you need to become a Certified Financial Advisor?", options: ["Five Advisor Pages and the Advisor Fair", "The highest balance in the district at the end of the period and the most coins of the class", "A bank job", "Nothing"], correct: 0, feedback: "Evidence + presenting your advice." },
];

/* ---------- READING 1 · Two Accounts, Two Lives (clase 5) ---------- */
const READ_R1 = [
  { sub: "The story of Daniel and Laura" },
  { p: "Daniel and Laura are two young professionals who live in the Financial District. They have different jobs, different routines, and different ways of managing money. However, they have one thing in common: they both need a bank account." },
  { p: "Daniel works as a graphic designer. He receives a monthly salary, pays for transportation, buys groceries, and saves part of his income for a trip. He does not make many large payments. Most of his transactions are small and predictable." },
  { p: "Laura, on the other hand, owns a small clothing business. She receives payments from customers, pays suppliers, buys materials, and sometimes needs to make large transactions. Her business has good months and difficult months, so she needs to organize her money carefully." },
  { p: "At first, both of them believe that every bank account works in the same way. Their financial advisor, Mr. Torres, explains that this is not true. Banks offer different types of accounts because people have different financial needs." },
  { sub: "Daniel's decision: a savings account" },
  { p: "Daniel chooses a savings account. This type of account is commonly used to keep money, receive income, make payments, and save for future goals. A savings account may pay interest. This means the bank can give the customer a small amount of money for keeping funds in the account. However, the interest rate is not always high, and the amount earned depends on the balance and the conditions of the account." },
  { p: "Daniel likes that he can use a debit card to pay in shops and withdraw cash from ATMs. He can also check his balance through a mobile application. But Mr. Torres gives him an important warning: convenience does not always mean that a service is free. Some accounts may charge a monthly management fee, ATM withdrawal fees, or fees for certain transfers." },
  { p: "Daniel checks the account conditions before opening it. He discovers that one account has no monthly management fee, while another offers a higher interest rate but charges for some transactions. He calculates how often he uses his card and how much money he usually keeps in the account. He realizes that a higher interest rate is not automatically the best option. If he pays too many fees, those costs may cancel out the interest he earns." },
  { sub: "Laura's decision: a current account" },
  { p: "Laura needs a different solution. Her business receives payments from customers and makes regular payments to suppliers. She wants to manage many transactions and keep her business finances separate from her personal money. Her advisor explains that a current account is designed to support frequent payments and money movements. Depending on the bank and the product, it may offer services such as transfers, payment management, and check-related services." },
  { p: "In some countries, current accounts are commonly associated with checks. A check is a written instruction that tells a bank to pay a specific amount of money to another person or business. Today, many businesses use electronic transfers instead, but checks are still used in some financial systems." },
  { p: "Laura asks about overdrafts. Mr. Torres explains that an overdraft happens when a bank allows a customer to spend more money than the available balance in the account. For example, Laura has $500,000 in her account but makes a payment of $600,000. If her bank has approved an overdraft facility, the bank may cover the extra $100,000. However, this is not free money. The bank may charge interest, fees, or both." },
  { p: "Laura decides that an overdraft should not be her normal way of paying suppliers. It may help in an emergency, but using it frequently can become expensive." },
  { sub: "The hidden cost of a bank account" },
  { p: "Before making their final decisions, Daniel and Laura compare the costs of their accounts. They learn about four important concepts. 1) Management fee: some banks charge customers a regular fee for maintaining or managing an account. 2) Transaction fees: a bank may charge for certain transfers, withdrawals, or other operations. 3) Overdraft: it allows a customer to use more money than the available balance when the bank has authorized it. It can create debt and additional costs." },
  { box: "4) Financial transaction tax: in Colombia, the 4×1,000 tax applies to certain financial transactions. When the tax applies, $4 is charged for every $1,000 of the taxable transaction. Some transactions or accounts may qualify for exemptions — customers should check the current conditions." },
  { p: "Daniel discovers that the best account for him is the one that helps him save and make everyday payments without unnecessary costs. Laura chooses an account that supports her business operations and helps her organize payments. She also decides to keep an emergency reserve instead of depending on an overdraft." },
  { sub: "One important lesson" },
  { p: "At the end of the week, Daniel and Laura meet again with Mr. Torres. Daniel says, “I thought the best account was the one with the highest interest rate. Now I understand that I also need to consider fees and how I use my money.” Laura adds, “I thought an overdraft was extra money. Now I know it is a form of borrowing, and I need to use it carefully.”" },
  { p: "Mr. Torres smiles. “A bank account is not just a place to keep money. It is a financial tool. The right tool depends on your habits, your goals, and your responsibilities.” The best financial product is not necessarily the most popular or the one with the most features. It is the one that fits your needs and that you understand before using it." },
];
const GLOSS_R1 = { "savings account": "Cuenta de ahorros.", "current account": "Cuenta corriente (muchas transacciones).", "debit card": "Tarjeta débito (usa tu propio dinero).", "management fee": "Cuota de manejo.", "transaction": "Operación con dinero.", "overdraft": "Sobregiro (gastar más de lo que tienes, con permiso del banco).", "check": "Cheque.", "emergency reserve": "Reserva para emergencias.", "supplier": "Proveedor." };
const Q_R1 = [
  { q: "Why does Daniel choose a savings account?", options: ["To save and make everyday payments", "Because it lets him spend more money than he has whenever he needs to pay suppliers", "Because it has checks", "His friend told him"], correct: 0, feedback: "Salary, small payments and a saving goal." },
  { q: "Why is a higher interest rate not always the best option?", options: ["Fees can cancel out the interest", "Because a higher interest rate always means that the bank will close the account sooner", "Interest is illegal", "It is always the best"], correct: 0, feedback: "Compare interest AND fees with your real use." },
  { q: "What makes Laura's needs different from Daniel's?", options: ["Her business makes many large payments", "She earns a fixed salary and saves for a trip, so she needs a higher interest rate than Daniel", "She has no money", "She lives far away"], correct: 0, feedback: "Frequent, large transactions and variable months." },
  { q: "What is an overdraft?", options: ["Spending more than your balance, with the bank's permission", "A gift from the bank when you spend more than your balance, so you never have to pay it back", "A savings goal", "A type of check"], correct: 0, feedback: "It's a form of borrowing — with interest and fees." },
  { q: "Laura has $500,000 and pays $600,000 with an overdraft. How much does the bank cover?", options: ["$100,000", "$600,000, because the bank pays the whole payment and Laura keeps her own balance", "$500,000", "$0"], correct: 0, feedback: "$600,000 − $500,000 = $100,000 (borrowed)." },
  { q: "What is the difference between a management fee and a transaction fee?", options: ["A regular fee vs. a fee for each operation", "A management fee is paid only once in your life, and a transaction fee is a tax for the government", "They are the same", "Both are interest"], correct: 0, feedback: "Regular charge for the account vs. a charge for specific operations." },
  { q: "A taxable transaction is $200,000. How much is the 4×1,000 tax?", options: ["$800", "$8,000, because the tax is four pesos for every one hundred pesos of the transaction", "$4,000", "$80"], correct: 0, feedback: "200 × $4 = $800." },
  { q: "Why does Laura keep an emergency reserve?", options: ["To avoid depending on an overdraft", "Because the law says that every business must keep half of its income in cash at home", "To buy a car", "To pay taxes"], correct: 0, feedback: "Overdrafts in emergencies only — they get expensive." },
  { q: "What does Mr. Torres say a bank account is?", options: ["A financial tool", "A safe place where money grows automatically, without any cost, for as long as you keep it", "A loan", "A business"], correct: 0, feedback: "The right tool depends on your habits and goals." },
  { q: "What is a check?", options: ["A written order to pay someone", "A digital app that shows your balance and your transactions on your phone every day", "A bank fee", "A receipt"], correct: 0, feedback: "A written instruction to the bank to pay a specific amount." },
  { q: "Which account would you recommend to someone with a salary and few transactions?", options: ["A savings account with low costs", "A current account with an overdraft, because it is always the best option for every person", "No account", "Five accounts"], correct: 0, feedback: "Simple needs → a simple, low-cost account." },
  { q: "What is the main message of the reading?", options: ["The best account fits your needs", "The most popular account with the most features is always the best choice for everyone", "Never use banks", "All accounts are equal"], correct: 0, feedback: "Understand it before you use it." },
];

/* ---------- READING 2 · The Loan Committee (clase 7) ---------- */
const READ_R2 = [
  { sub: "Three people, three financial decisions" },
  { p: "Every Friday, the Financial District Bank organizes a meeting called the Loan Committee. Its members review credit applications and decide whether a loan is appropriate for each applicant. The committee does not simply ask, “Does this person want money?” It asks a more important question: “Can this person repay the money without putting their financial stability at risk?” Today, three people are waiting for an answer." },
  { sub: "Case 1: Camila — the first car" },
  { p: "Camila is 24 years old and works as a laboratory assistant. She earns $3,000,000 per month. Her salary is stable, and she has worked at the same company for two years. She wants to buy a used car because public transportation takes almost two hours every day. The car costs $35,000,000. Camila has saved $10,000,000, so she wants to borrow the remaining $25,000,000." },
  { box: "Camila's monthly expenses: rent and utilities $900,000 · food $450,000 · transportation $250,000 · family support $300,000 · other expenses $300,000." },
  { p: "Camila has never missed a loan payment. However, she has a small credit card balance that she pays every month. The bank offers her a vehicle loan. The car may serve as collateral, depending on the contract and local rules. Collateral is an asset that may be used as security for a loan. The committee likes Camila's stable income and savings. However, it needs to calculate whether the monthly payment will fit her budget. Camila says, “I need the car, but I do not want to spend all my salary paying for it.”" },
  { sub: "Case 2: Andrés — the growing bakery" },
  { p: "Andrés owns a small bakery. His business has been operating for three years, and he has regular customers. Recently, a local supermarket offered to buy his bread every week. This opportunity could increase his sales, but Andrés needs a larger oven and additional ingredients. The equipment and initial materials will cost $12,000,000. He expects the supermarket agreement to generate more income, but the agreement is not yet signed." },
  { p: "Andrés has a good sales record, but his income changes from month to month. Some customers pay immediately, while others pay after 30 days. This creates a cash-flow problem. Cash flow is the movement of money into and out of a business. A business can be profitable on paper but still have difficulty paying its bills if customers pay late." },
  { p: "One committee member asks, “What happens if the supermarket does not sign the agreement?” Andrés pauses. He has not considered that possibility carefully. The committee does not reject his idea. Instead, it asks him to prepare a second financial plan based on lower sales." },
  { sub: "Case 3: Valentina — the credit card problem" },
  { p: "Valentina is 27 years old and works in a marketing agency. She earns $2,800,000 per month. Last year, she received her first credit card. At the beginning, she used it only for small purchases. Later, she started using it for clothes, restaurants, subscriptions, and online shopping. She usually paid only the minimum amount. Now, her credit card balance is $4,500,000. She has also missed two payments." },
  { p: "A credit card is a revolving credit product: the customer can use available credit, repay part or all of the balance, and use the credit again. However, unpaid balances may generate interest and additional charges. Paying only the minimum can make a debt last longer and increase its total cost. Valentina wants a new personal loan to pay for a vacation. A member asks, “Would another loan solve her financial problem, or would it create a bigger one?”" },
  { sub: "How does the committee evaluate a loan?" },
  { box: "Five elements: 1) Income — how much, and is it stable? 2) Expenses — rent, food, transport, family. 3) Capacity to pay — what is left after expenses and existing debts? 4) Credit history — were past debts paid on time? 5) Purpose and repayment plan — is there a clear reason and a realistic plan?" },
  { p: "Different loans have different conditions: a personal loan (personal expenses), a vehicle loan (to buy a vehicle), a business loan (equipment, inventory or expansion), a mortgage loan (long-term credit to buy property) and a credit card (a revolving credit line up to a limit). A low monthly payment does not necessarily mean that a loan is cheap. A longer repayment period can reduce the monthly payment but increase the total amount paid." },
  { sub: "The final decision" },
  { p: "Camila may continue with her application, but she must compare the monthly payment with her budget. Andrés needs a more realistic business plan, including a scenario where sales are lower. Valentina should not take a new loan for a vacation at this moment; her priority is to manage her existing debt. The chair closes the meeting: “Credit is not extra income. It is money you borrow today and must repay in the future, usually with an additional cost.”" },
];
const GLOSS_R2 = { "loan": "Préstamo.", "borrower": "Quien recibe el préstamo.", "lender": "Quien presta.", "collateral": "Garantía.", "credit history": "Historial crediticio.", "capacity to pay": "Capacidad de pago.", "cash flow": "Flujo de caja.", "minimum payment": "Pago mínimo.", "revolving credit": "Crédito rotativo.", "repayment period": "Plazo." };
const Q_R2 = [
  { q: "What is the committee's most important question?", options: ["Can this person repay without risk?", "Does this person want money, and how fast can the bank give it to them this Friday?", "Is the person famous?", "How old is the person?"], correct: 0, feedback: "Capacity to repay without losing stability." },
  { q: "Why does Camila want a vehicle loan?", options: ["Public transport takes almost two hours a day", "Because she wants a new sports car to go on a long vacation with her family next month", "Her car broke", "To start a business"], correct: 0, feedback: "Time and comfort — a clear purpose." },
  { q: "Camila's car costs $35,000,000 and she saved $10,000,000. How much does she want to borrow?", options: ["$25,000,000", "$35,000,000, because people should never use their savings when they buy a car", "$10,000,000", "$45,000,000"], correct: 0, feedback: "$35M − $10M = $25M." },
  { q: "Camila's expenses add up to $2,200,000. How much is left from her $3,000,000 salary?", options: ["$800,000", "$2,200,000, because expenses are not part of the capacity to pay of a borrower", "$300,000", "$1,000,000"], correct: 0, feedback: "That $800,000 is her room for a loan payment — and for emergencies." },
  { q: "What is collateral?", options: ["An asset that secures a loan", "The interest that a bank pays to a customer who keeps money in a savings account", "A credit card", "A salary"], correct: 0, feedback: "The car may serve as collateral." },
  { q: "Why does Andrés have a cash-flow problem?", options: ["Some customers pay after 30 days", "Because his bakery never sells any bread and has no regular customers at all", "His oven is new", "He has no bank"], correct: 0, feedback: "Profitable on paper ≠ cash today." },
  { q: "Why must Andrés prepare a second plan?", options: ["The supermarket deal is not signed yet", "Because the committee rejected his idea forever and he needs to open a different business", "He is too young", "He has too much money"], correct: 0, feedback: "A plan with lower sales protects him and the bank." },
  { q: "What is revolving credit?", options: ["Credit you can use again after repaying", "A loan that you receive only once in your life and that must be repaid the next day", "A savings account", "A gift card"], correct: 0, feedback: "Like a credit card: use, repay, use again (up to a limit)." },
  { q: "Why is paying only the minimum expensive?", options: ["The debt lasts longer and costs more", "Because the bank immediately closes your account and keeps all the money in your savings", "It is not expensive", "The bank pays you"], correct: 0, feedback: "Interest keeps growing on the unpaid balance." },
  { q: "Why should Valentina not get a vacation loan now?", options: ["She already struggles with her debt", "Because vacations are always bad and people should never travel when they have a salary", "She earns too much", "She is too old"], correct: 0, feedback: "First a budget and a repayment strategy." },
  { q: "What can a longer repayment period do?", options: ["Lower the payment but raise the total cost", "Lower the monthly payment and also the total amount you pay at the end of the loan", "Remove interest", "Nothing"], correct: 0, feedback: "A low monthly payment doesn't mean a cheap loan." },
  { q: "What does the chair say about credit?", options: ["It is not extra income", "It is extra income that you can spend freely because the bank trusts you", "It is free", "It is a tax"], correct: 0, feedback: "Borrow today, repay tomorrow — with a cost." },
];

/* ---------- MY MONEY RADAR 9 · punto de partida (todos desde cero) ---------- */
const RADAR_DIMS = [
  { k: "mm", l: "Money Management", short: "Money" },
  { k: "ent", l: "Entrepreneurship", short: "Business" },
  { k: "wb", l: "Financial Wellbeing", short: "Wellbeing" },
  { k: "dig", l: "Digital Economy", short: "Digital" },
  { k: "glo", l: "Global Citizenship", short: "Global" },
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
function radarProfile9(avg) {
  if (avg <= 30) return { l: "New Citizen 🌱", d: "You are starting your journey in the district. Every mission will give you new tools." };
  if (avg <= 55) return { l: "District Explorer 🔎", d: "You know some ideas. Now practice them with numbers and real decisions." };
  if (avg <= 80) return { l: "Smart Planner 📐", d: "Strong start! You compare, you plan and you think about risks." };
  return { l: "Future Advisor ⭐", d: "Excellent start! You already think like a financial advisor." };
}

/* ---------- BOSS ---------- */
const BOSS_MISSIONS91 = [
  { tag: "MISSION 1 · BANKING", q: "A bank receives $50,000,000 in deposits and keeps a 15% reserve. How much can it lend?", answer: 42500000, money: true, hint: "Reserve = 15% × 50,000,000. Loans = deposits − reserve.", explain: "$50,000,000 − $7,500,000 = $42,500,000." },
  { tag: "MISSION 2 · BANK RUN", q: "A healthy bank has enough assets, but a rumor makes many people withdraw today. What is its problem?", options: ["A liquidity problem: not enough cash today", "A solvency problem: the bank owes more than everything it owns, so it is already broke", "No problem", "A tax problem"], correct: 0, hint: "Healthy assets… but not in cash.", explain: "Illiquid ≠ insolvent. A lender of last resort can help a solvent bank." },
  { tag: "MISSION 3 · ACCOUNTS", q: "Account X: fee $8,000, free ATM. Account Y: fee $0, ATM $3,000. You withdraw 4 times a month. Which costs less, and how much do you save per month?", options: ["X — I save $4,000", "Y — I save $8,000, because an account without a monthly fee is always the cheapest one", "They cost the same", "Y — I save $4,000"], correct: 0, hint: "Y: 4 × 3,000 = ? Compare with 8,000.", explain: "Y costs $12,000; X costs $8,000 → X saves $4,000." },
  { tag: "MISSION 4 · INTEREST", q: "A bank pays 4% on deposits and charges 17% on loans. What is the spread in percentage points?", answer: 13, unit: "points", hint: "Lending rate − deposit rate.", explain: "17 − 4 = 13 points. But it is not all profit: costs and risks!" },
  { tag: "MISSION 5 · CREDIT", q: "Paula earns $2,500,000. Her expenses are $1,900,000 and she already pays $300,000 for a phone. The new loan payment is $450,000. What should the committee do?", options: ["Offer a smaller loan or ask her to wait", "Approve it, because her salary is higher than the payment and a stable salary is all that matters", "Approve two loans", "Ignore her expenses"], correct: 0, hint: "Capacity = 2,500,000 − 1,900,000 − 300,000 = ?", explain: "She has only $300,000 free. A $450,000 payment does not fit." },
];
const BOSS_Q91 = [
  { q: "Why are deposits a liability for a bank?", options: ["The bank must return them", "Because the bank owns the deposits forever and can use them for anything it wants", "They are profit", "They are taxes"], correct: 0, feedback: "Customers can ask for them back." },
  { q: "What is a fire sale?", options: ["Selling assets fast and cheap", "A special sale where the bank offers its customers loans with zero interest for one day", "A bank holiday", "A new account"], correct: 0, feedback: "Fast = cheap = losses." },
  { q: "Which Colombian institution protects eligible deposits up to a limit?", options: ["Fogafín", "The Superfinanciera, which pays all the money of every customer when a bank closes", "Banco de la República", "The DIAN"], correct: 0, feedback: "Fogafín = deposit insurance." },
  { q: "What does Banco de la República do?", options: ["Keeps inflation low and stable", "It approves the personal loans and credit cards of every citizen in the country", "Collects taxes", "Sells cars"], correct: 0, feedback: "Colombia's central bank: monetary policy, currency, lender of last resort." },
  { q: "If the central bank raises its policy rate, loans usually become…", options: ["more expensive", "cheaper, because banks have more money to lend when the central bank raises rates", "free", "illegal"], correct: 0, feedback: "Higher rates → more expensive credit → less spending → lower inflation." },
  { q: "What is the interest rate spread?", options: ["Lending rate − deposit rate", "The total profit of the bank after paying salaries, taxes and every other cost", "A fee", "A tax"], correct: 0, feedback: "The spread must also cover costs and risks." },
  { q: "What is an overdraft?", options: ["Borrowing beyond your balance", "Extra money that the bank adds to your account as a gift when you are a good customer", "A savings plan", "A transfer"], correct: 0, feedback: "It costs interest and fees." },
  { q: "What is capacity to pay?", options: ["Money left after expenses and debts", "The total salary of a person before paying rent, food, transport and other debts", "The loan amount", "The interest rate"], correct: 0, feedback: "Income − expenses − existing debts." },
  { q: "Why does a longer loan term cost more in total?", options: ["You pay interest for more months", "Because the bank adds a penalty for every year, even if you pay all the installments on time", "It doesn't", "Taxes go up"], correct: 0, feedback: "Lower payment, higher total." },
  { q: "What did Grameen Bank show?", options: ["Poor people can repay small loans", "That banks should never lend money to anybody who does not have a house as collateral", "Loans are bad", "Only rich people save"], correct: 0, feedback: "Microcredit can work — with careful design." },
  { q: "Why are loan sharks (“gota a gota”) dangerous?", options: ["Very high rates and threats", "Because they offer low, fixed interest rates with clear contracts supervised by the government", "They are slow", "They are banks"], correct: 0, feedback: "Abusive rates, no protection — avoid them." },
  { q: "What is credit history?", options: ["A record of how you paid past debts", "A list of all the products that you have bought with your debit card in your life", "Your salary", "Your savings"], correct: 0, feedback: "It helps lenders evaluate risk — it's not the whole story." },
];

/* =====================================================================
   CLASE 1 · WELCOME TO THE FINANCIAL DISTRICT
   ===================================================================== */
const START_1 = {
  cards: [
    { e: "🏦", t: "Bank", d: "A business that keeps people's money and lends part of it to others.", ex: "The District Bank." },
    { e: "💰", t: "Deposit", d: "Money you put into a bank account.", ex: "You deposit $2,000,000." },
    { e: "📝", t: "Loan", d: "Money borrowed that must be repaid, usually with interest.", ex: "A loan for a car." },
    { e: "📈", t: "Interest", d: "Money earned on savings — or paid for borrowing.", ex: "5% a year on your savings." },
    { e: "📊", t: "Balance", d: "The amount of money in an account right now.", ex: "Your balance: $2,000,000." },
    { e: "🤝", t: "Trust", d: "Believing that the bank will return your money when you ask for it.", ex: "Trust today: 80%." },
    { e: "🧾", t: "Financial advisor", d: "A person who helps others make informed money decisions.", ex: "Your role this period!" },
    { e: "🏛️", t: "Pillar", d: "One of the five big areas of financial education.", ex: "Money Management, Entrepreneurship…" },
  ],
  pairs: [{ a: "Deposit", b: "Money you put into the bank" }, { a: "Loan", b: "Money you must repay" }, { a: "Interest", b: "The price of money" }, { a: "Balance", b: "Money in the account now" }, { a: "Trust", b: "Believing the bank will pay" }, { a: "Financial advisor", b: "Helps people decide well" }],
};

/* ---------- RADAR 9 · punto de partida ---------- */
/* =====================================================================
   GUÍA DE ACTIVIDAD · propósito + pasos + cómo se gana (rúbrica)
   Cada actividad del periodo abre con esta tarjeta (se puede ocultar).
   ===================================================================== */
const B_STARTER = (words) => ({ goal: `Learn the key words of today's class (${words}) before the big game.`, steps: ["Open every card: read the meaning and the example.", "Match each word with its meaning.", "Answer the quick rounds — a mistake shows you the right answer."], win: [["Open all the cards and finish the matches", "+20 🪙"], ["Mistakes are OK: they help you learn", ""]], tip: "These words appear in the video, the game and your Advisor Page of today." });
const B_RUSH = (what) => ({ goal: what, steps: ["Read the boxes before you start.", "A card appears: tap the right box as fast as you can.", "If you make a mistake, read WHY — then keep going.", "At the end, check your mistakes. You can play again."], win: [["At least 8 cards answered and 70% correct", "to win"], ["Combo 🔥 (correct answers in a row)", "more points"], ["Coins depend on your accuracy", "up to +24 🪙"]] });
const B_VIDEO = (goal, next) => ({ goal, steps: ["Watch the whole video (you can pause or watch it twice).", "Write down numbers and key words you hear.", "Answer 8 random questions."], win: [["70% or more", "to pass"], ["Each correct answer", "+4 🪙"], ["Finishing", "+10 🪙"]], tip: next });
const B_READ = (goal, next) => ({ goal, steps: ["Read the text. Tap the key words to see their meaning.", "Pay attention to the numbers and the people's decisions.", "Answer 8 questions about the text."], win: [["70% or more", "to pass"], ["Each correct answer", "+4 🪙"], ["Finishing", "+10 🪙"]], tip: next });
const B91 = {
  c1_radar: { goal: "Take a photo of what you know about money TODAY. At the end of the year you will compare yourself with this radar.", steps: ["Read each situation.", "Choose what YOU would really do — not what sounds nice.", "See your radar: 5 pillars, your strongest one and your challenge."], win: [["No right or wrong answers — be honest", ""], ["Completing your radar", "+25 🪙"]] },
  c1_starter: B_STARTER("bank, deposit, loan, interest, balance, trust"),
  c1_listen: { goal: "Understand the 5 pillars and the rules of the Financial District from Ms. Rivera, the district guide.", steps: ["Press Play and listen to the whole audio (you can choose Slow).", "Open the transcript to check what you didn't understand.", "Answer 8 questions."], win: [["70% or more", "to pass"], ["Each correct answer", "+4 🪙"], ["Finishing", "+10 🪙"]] },
  c1_id: { goal: "Become a citizen of the district. Everybody starts with the SAME account — your job and your decisions will make the difference all year.", steps: ["Choose your avatar and your citizen name.", "Choose a job: each one has a salary and money habits.", "Meet the District Bank: read its balance sheet and answer 3 questions.", "Download your District ID."], win: [["Each bank question right on the first try", "+2 🪙"], ["Printing your District ID", "+24 🪙"]], tip: "Your citizen continues in Periods 2, 3 and 4 — choose a name you like!" },
  c2_starter: B_STARTER("asset, liability, reserve, interest income and expense"),
  c2_video: B_VIDEO("See how a village bank uses the savers' deposits to give loans — and how it earns money.", "In the next activity you will rebuild THIS bank with its numbers."),
  c2_rush: B_RUSH("Recognize in seconds what a bank OWNS (asset), what it OWES (liability) and what is not on the balance sheet."),
  c2_builder: { goal: "Decide how much cash YOUR bank keeps in the vault. It's the first big decision of your bank — in Class 3 a rumor will test it.", steps: ["Rebuild the village bank from the video (5 calculations).", "Move the reserve bar ◀ ▶ and watch what changes: cash, loans and profit.", "Run the busy-day test: can your vault pay customers on 3 busy days?", "Explain your decision with a reason and a number."], win: [["Video calculations right on the first try", "+2 🪙 each"], ["Each busy day your vault can pay", "+2 🪙 each"], ["Explanation: 10–50 words with “because” and a number", "required"], ["Opening your bank", "+20 🪙"]], tip: "There is no perfect reserve: more cash = safer but less profit. Less cash = more profit but more risk." },
  c3_starter: B_STARTER("liquidity, solvency, fire sale, deposit insurance"),
  c3_video: B_VIDEO("Understand why a HEALTHY bank can fall when everybody wants their money at the same time.", "Next: the Bank Run Simulator — with YOUR bank and YOUR reserve from Class 2."),
  c3_run: { goal: "Live a bank run twice: first as a customer who receives a rumor, then as the manager of YOUR District Bank (with the reserve you chose in Class 2).", steps: ["Part A: decide what you do when the rumor arrives.", "Part B: 5 events hit your bank. Choose a response for each one.", "After each decision, watch the TRUST bar and your CASH.", "See the results: did your bank survive?"], win: [["Each good decision", "+4 🪙"], ["Keep trust high and never run out of cash", "your bank survives"], ["Saving your results", "+20 🪙"]], tip: "Fear moves faster than facts. Calm, clear information protects a bank." },
  c3_report: { goal: "Write the official report of YOUR crisis. This is Advisor Page 01 — you will use it at the Advisor Fair.", steps: ["Choose 1–2 causes of the crisis and explain them.", "Read how your bank responded in each event.", "Write your lesson using the word liquidity or solvency."], win: [["Cause: 10–50 words with a reason", "required"], ["Lesson: 12–60 words with “liquidity” or “solvency” and a contrast", "required"], ["Advisor Page 01 saved", "+26 🪙"]] },
  c4_starter: B_STARTER("policy rate, inflation, independence, supervisor"),
  c4_video: B_VIDEO("Discover why a country needs a central bank and what it does when prices go up.", "Next: you sit at the Central Bank Desk and decide the policy rate."),
  c4_rush: B_RUSH("Learn who does what: the central bank, the supervisor (Superfinanciera), deposit insurance (Fogafín) or your own bank."),
  c4_desk: { goal: "You are the central bank. Bring inflation down WITHOUT destroying jobs. Your rate will change the Interest Lab in Class 6.", steps: ["Move the policy rate bar ◀ ▶ and watch inflation and jobs change.", "Find a balance: inflation 5% or less AND jobs 60 or more.", "Announce your decision (you can try again if it's not balanced).", "Solve 3 missions of a real central bank."], win: [["Balanced decision (inflation ≤ 5% and jobs ≥ 60)", "+6 🪙"], ["Each mission right on the first try", "+4 🪙"], ["Closing the board meeting", "+20 🪙"]], tip: "Higher rate → loans cost more → people spend less → prices calm down. Too high → companies stop hiring." },
  c5_starter: B_STARTER("savings, current account, fees, overdraft, 4×1,000"),
  c5_read: B_READ("Compare two people, two accounts — and the hidden costs of each one.", "Next: the Account Detective uses the same accounts."),
  c5_detective: { goal: "Find the CHEAPEST account for each client. The best account is not always the one with more interest — fees hide in the details.", steps: ["Read how each client uses money (balance, transfers, ATM).", "Compare accounts A, B and C in the table.", "Choose one account for each client, then reveal the real monthly cost.", "Surprise round — then choose the account for YOUR job."], win: [["Each client with the cheapest account", "+3 🪙"], ["Surprise round right", "+3 🪙"], ["The best account for you", "+3 🪙"], ["Opening your account", "+18 🪙"]] },
  c5_page: { goal: "Advise Daniel and Laura like a real banker. This is Advisor Page 02.", steps: ["For each client choose the type of account.", "Choose 2 features that help them and 1 risk to avoid.", "Write why (8–40 words with a reason)."], win: [["Each recommendation complete: type, 2 features, 1 risk, reason", "required"], ["Each client with the right account", "+3 🪙"], ["Advisor Page 02 saved", "+20 🪙"]] },
  c6_starter: B_STARTER("deposit rate, lending rate, spread, risk premium"),
  c6_video: B_VIDEO("Learn how banks earn money: they pay savers a little and charge borrowers more.", "Next: you set the rates of YOUR bank in the Interest Rate Machine."),
  c6_machine: { goal: "Set the rates of YOUR bank. Savers want a HIGH deposit rate, borrowers want a LOW lending rate — and your bank needs profit.", steps: ["Move the two bars and watch savers 😃, borrowers 😃 and profit.", "Complete 3 missions (press Check for each one).", "Decide what to do with a risky borrower.", "Compare two banks for two clients."], win: [["Each mission completed", "+4 🪙"], ["Risky borrower right on the first try", "+3 🪙"], ["Each two-bank answer right on the first try", "+2 🪙"], ["Saving your rates", "+18 🪙"]], tip: "Spread = lending rate − deposit rate. A huge spread scares clients; a tiny one kills profit." },
  c6_page: { goal: "Explain YOUR pricing strategy like a bank manager. This is Advisor Page 03.", steps: ["Check your rates from the Interest Machine.", "Choose who your bank wants to help most.", "Write your strategy: 20–70 words."], win: [["Use a reason, 2 numbers and a risk", "required"], ["Advisor Page 03 saved", "+26 🪙"]] },
  c7_read: B_READ("Meet Camila, Andrés and Valentina: three people who ask for a loan.", "Next: YOU sit on the Loan Committee and decide their loans."),
  c7_committee: { goal: "Sit on the loan committee. Decide 3 loans with EVIDENCE — then see what happens 6 months later.", steps: ["Open a folder and read at least 4 documents (more evidence = more points).", "Calculate the capacity to pay: income − expenses − debts.", "Decide: approve, smaller loan, ask for more information or reject — and write why with a number.", "Fast-forward 6 months and see the consequences."], win: [["Best decision", "10 pts"], ["Acceptable decision", "6 pts"], ["Weak decision", "2 pts"], ["Each document you open (max 6 per folder)", "+1 pt"], ["Coins = 14 + half of your points (max 48)", "up to +38 🪙"]], tip: "A good banker doesn't say NO to everybody — and doesn't say YES to everybody." },
  c7_credit: { goal: "Help Mateo build a healthy credit profile in 12 months. Every month is a decision.", steps: ["Read Mateo's situation each month.", "Choose what he does — watch his Credit Health and his debt.", "After 12 months, answer the final question."], win: [["Each good month", "+1 🪙"], ["Final question right", "+4 🪙"], ["Saving Mateo's profile", "+16 🪙"]] },
  c7_page: { goal: "Write the committee report for ONE applicant. This is Advisor Page 04.", steps: ["Choose one applicant from the committee.", "Mark their strengths and their risks.", "Write what they need and your advice (15–60 words)."], win: [["At least 1 strength, 1 risk and what they need", "required"], ["Advice with a reason and a number", "required"], ["Advisor Page 04 saved", "+26 🪙"]] },
  c8_video: B_VIDEO("Meet Muhammad Yunus: the banker who lent small amounts to people that banks ignored.", "Next: the Microfinance Mission — you help 3 entrepreneurs."),
  c8_micro: { goal: "Help 3 entrepreneurs that normal banks reject. Choose the right financing, survive a crisis and create your impact card. This is Advisor Page 05.", steps: ["Read each entrepreneur's story and choose a way to finance them.", "Crisis round: help each one with a problem.", "Create your impact card and explain your decision."], win: [["Each entrepreneur well financed", "+3 🪙"], ["Each good crisis decision", "+2 🪙"], ["Bonus: all with group loans", "+2 🪙"], ["Impact card: 2 impacts + 12–50 words with a reason", "required"]] },
  c8_guide: { goal: "The final project: use your Advisor Pages to help a SECRET client and present your advice in English.", steps: ["Read your secret client's situation.", "Choose the best product and an alternative.", "Choose a pillar and write your advice (25–80 words).", "Press Present and speak to a classmate (2–3 minutes).", "Your classmate scores you with the rubric (100 points)."], win: [["Understands the client's needs", "20 pts"], ["Uses financial concepts correctly", "25 pts"], ["Compares alternatives", "20 pts"], ["Identifies risks", "20 pts"], ["Communicates the recommendation", "15 pts"], ["You need at least 3 Advisor Pages", "required"]] },
  c8_boss: { goal: "Show everything you learned in Period 1: banks, crises, central bank, accounts, interest and loans.", steps: ["Part 1: 5 missions with numbers (a hint appears after a mistake).", "Part 2: 10 questions."], win: [["70% or more in Part 2", "to pass"], ["Each mission right on the first try", "+4 🪙"], ["Each correct question", "+4 🪙"]] },
};
function Brief91({ k }) {
  const b = B91[k];
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
/* Medidor con el valor REAL y una marca de meta */
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

function Radar9({ existing, onSave, onExit }) {
  const [cur, setCur] = useState(0);
  const [ans, setAns] = useState({});
  const [phase, setPhase] = useState(existing?.scores ? "done" : "quiz");
  const [saving, setSaving] = useState(false);
  const scores = useMemo(() => { const o = {}; RADAR_DIMS.forEach((d) => { const list = RADAR9_Q.map((q, i) => ({ q, i })).filter((x) => x.q.d === d.k); o[d.k] = Math.round((list.reduce((a, x) => a + (ans[x.i] != null ? x.q.s[ans[x.i]] : 0), 0) / (list.length * 3)) * 100); }); return o; }, [ans]);
  const shown = existing?.scores && !Object.keys(ans).length ? existing.scores : scores;
  const avg = Math.round(Object.values(shown).reduce((a, v) => a + v, 0) / RADAR_DIMS.length);
  const prof = radarProfile9(avg);
  const q = RADAR9_Q[cur];
  const answered = ans[cur] != null;
  const save = () => { setSaving(true); setPhase("done"); Promise.resolve(onSave({ answers: ans, scores, average: avg, profile: prof.l, xp: 25 })).finally(() => setSaving(false)); };
  if (phase === "done") {
    const sorted = RADAR_DIMS.map((d) => ({ ...d, v: shown[d.k] })).sort((a, b) => b.v - a.v);
    return (
      <div className="s1-quiz diag-result g74-radar2">
        <div className="diag-badge"><Compass size={30} strokeWidth={2.1} /></div>
        <h2>My Money Radar 9 · My starting point</h2>
        <p className="diag-sub">This is your photo on day 1 of 9th grade. Everybody starts from zero this year — at the end of the year you will compare yourself with this radar.</p>
        <div className="g7-radar-wrap"><RadarN labels={RADAR_DIMS.map((d) => d.short)} values={RADAR_DIMS.map((d) => shown[d.k])} /></div>
        <div className="diag-bars">{RADAR_DIMS.map((d) => <div key={d.k} className="diag-bar"><span className="diag-bar-l">{d.l}</span><div className="diag-bar-track"><i style={{ width: `${shown[d.k]}%` }} /></div><span className="diag-bar-v">{shown[d.k]}%</span></div>)}</div>
        <div className="diag-risk"><span className="diag-risk-tag">{prof.l}</span><p>{prof.d} Average: <b>{avg}%</b>.</p></div>
        <div className="p1-diag-cards"><div className="p1-diag-card good"><b>💪 My strongest pillar: {sorted[0].l}</b><span>Use it to help your classmates.</span></div><div className="p1-diag-card next"><b>🎯 My challenge: {sorted[4].l}</b><span>The district missions will train it.</span></div></div>
        <button className="s1-btn primary" onClick={onExit}>Continue <ChevronRight size={18} /></button>
        {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing your progress…</span>}
      </div>
    );
  }
  return (
    <div className="s1-quiz">
      <div className="quiz-top"><h2>🧭 My Money Radar 9</h2><span className="quiz-count">{cur + 1} / {RADAR9_Q.length}</span></div>
      <div className="quiz-track"><i style={{ width: `${((cur + (answered ? 1 : 0)) / RADAR9_Q.length) * 100}%` }} /></div>
      {cur === 0 && <Brief91 k="c1_radar" />}
      {false && <p className="start-tip">10 situations, 5 pillars. There are no grades here: answer honestly — this is your starting point for the year.</p>}
      <span className="diag-dim">{RADAR_DIMS.find((d) => d.k === q.d).l}</span>
      <p className="quiz-q">{q.q}</p>
      <div className="quiz-options">{q.o.map((o, k) => <button key={k} type="button" className={`quiz-opt ${ans[cur] === k ? "correct" : ""}`} onClick={() => setAns({ ...ans, [cur]: k })}><span className="opt-key">{"ABCD"[k]}</span><span className="opt-text">{o}</span></button>)}</div>
      <div className="quiz-nav">
        <button className="s1-btn ghost" onClick={() => (cur > 0 ? setCur(cur - 1) : onExit())}>{cur > 0 ? "Back" : "Exit"}</button>
        <button className="s1-btn primary" disabled={!answered} onClick={() => (cur < RADAR9_Q.length - 1 ? setCur(cur + 1) : save())}>{cur < RADAR9_Q.length - 1 ? "Next" : "See my radar 🧭"} <ChevronRight size={18} /></button>
      </div>
    </div>
  );
}

/* ---------- MY DISTRICT ID · todos empiezan igual ---------- */
const BANKCHECK_1 = [
  { q: "The District Bank has $100,000,000 in deposits but only $20,000,000 in cash. Where is most of the money?", options: ["Lent to families and businesses", "Hidden in a second secret vault, because banks never use the money that people deposit", "Lost", "In the central bank"], correct: 0, explain: "$70,000,000 are loans. That's how banks work." },
  { q: "Can ALL the citizens withdraw ALL their money on the same day?", options: ["No — the bank has only $20,000,000 in cash", "Yes, because a bank always has all the deposits in cash for the moment customers need them", "Yes, on Mondays", "Only the rich"], correct: 0, explain: "That's why trust (80% today) is so important." },
  { q: "You and your classmate both start with $2,000,000. What will make your stories different?", options: ["Our decisions", "The color of our avatar and the job card, because the richest job always wins the game", "Luck only", "Nothing"], correct: 0, explain: "Same start, different decisions → different districts." },
];
function DistrictID({ studentName, existing, onSave, onExit }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(existing?.name || (studentName || "").split(" ")[0] || "");
  const [avatar, setAvatar] = useState(existing?.avatar || "");
  const [job, setJob] = useState(existing?.job || "");
  const [okQ, setOkQ] = useState({});
  const [st, finish] = useFinish(onSave);
  const J = JOBS91.find((j) => j.id === job);
  const nOk = Object.keys(okQ).length;
  if (st.done) return <Reward title="Welcome, citizen! 🏙️" subtitle={`${avatar} ${name} · ${J.n} · balance ${cop(D0.me)}`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<BadgeCheck size={22} strokeWidth={2.1} />} title="My District ID 🪪" subtitle="Become a citizen of the Financial District. Everybody starts with the same account and the same bank." onExit={onExit}>
      <Brief91 k="c1_id" />
      <Steps91 labels={["1 · Who are you?", "2 · Your job", "3 · Meet the bank", "4 · Your ID"]} at={step} />
      {step === 0 && (
        <div className="start-block">
          <h3>🧑 Choose your avatar and your citizen name</h3>
          <div className="g91-avatars">{AVATARS91.map((a) => <button key={a} type="button" className={avatar === a ? "on" : ""} onClick={() => setAvatar(a)}>{a}</button>)}</div>
          <input className="start-input p3-gap" value={name} maxLength={18} onChange={(e) => setName(e.target.value)} placeholder="Your citizen name" />
          <div className="start-foot"><button className="s1-btn primary big" disabled={!avatar || name.trim().length < 2} onClick={() => setStep(1)}>Next: my job <ChevronRight size={18} /></button></div>
        </div>
      )}
      {step === 1 && (
        <div className="start-block">
          <h3>💼 Pick a job card</h3>
          <p className="start-tip">Your job gives you an income for the simulations (salary or business sales). It does NOT change your starting balance: everybody starts with {cop(D0.me)}.</p>
          <div className="g91-jobs">{JOBS91.map((j) => <button key={j.id} type="button" className={job === j.id ? "on" : ""} onClick={() => setJob(j.id)}><em>{j.e}</em><b>{j.n}</b><span>{cop(j.income)}/month</span><small>{j.d}</small></button>)}</div>
          <div className="start-foot"><button className="s1-btn ghost" onClick={() => setStep(0)}>Back</button><button className="s1-btn primary big" disabled={!job} onClick={() => setStep(2)}>Next: meet the District Bank <ChevronRight size={18} /></button></div>
        </div>
      )}
      {step === 2 && (
        <>
          <div className="g91-bankcard">
            <header><em>🏦</em><div><small>THE SAME FOR EVERY CITIZEN</small><b>District Bank · balance sheet</b></div><i>🤝 Trust {D0.trust}%</i></header>
            <div className="g91-bs">
              <div><small>ASSETS · what the bank owns</small><p><span>💵 Cash in the vault</span><b>{cop(D0.cash)}</b></p><p><span>📝 Loans to people</span><b>{cop(D0.loans)}</b></p><p><span>🏢 Other assets</span><b>{cop(D0.other)}</b></p></div>
              <div><small>LIABILITIES · what the bank owes</small><p><span>💰 Deposits of citizens</span><b>{cop(D0.deposits)}</b></p><p className="me"><span>🙋 Your deposit</span><b>{cop(D0.me)}</b></p></div>
            </div>
          </div>
          {BANKCHECK_1.map((b, k) => <PickOne key={k} tag={`QUESTION ${k + 1}/3`} q={b.q} options={b.options} correct={b.correct} explain={b.explain} onRight={(w) => setOkQ((o) => ({ ...o, [k]: w }))} />)}
          <div className="start-foot"><button className="s1-btn ghost" onClick={() => setStep(1)}>Back</button><button className="s1-btn primary big" disabled={nOk < 3} onClick={() => setStep(3)}>{nOk < 3 ? `Answer the 3 questions (${nOk}/3)` : "Print my District ID"} <ChevronRight size={18} /></button></div>
        </>
      )}
      {step === 3 && J && (
        <>
          <div className="g91-idcard" id="g91-idcard">
            <div className="g91-id-top"><small>🏙️ FINANCIAL DISTRICT · CITIZEN ID · SEASON 01</small><span>9th GRADE</span></div>
            <div className="g91-id-main"><em>{avatar}</em><div><b>{name}</b><span>{J.e} {J.n} · {cop(J.income)}/month</span><span>🏦 Client of the District Bank</span></div></div>
            <div className="g91-id-bal"><small>STARTING BALANCE</small><b>{cop(D0.me)}</b><span>Same as every citizen · decisions start now</span></div>
          </div>
          <div className="start-foot"><button className="s1-btn ghost" onClick={() => downloadPNG("g91-idcard", `District_ID_${name}.png`)}><Download size={16} /> Download PNG</button><button className="s1-btn primary big" onClick={() => finish(24 + Object.values(okQ).filter((w) => w === 0).length * 2, { name: name.trim(), avatar, job })}>Activate my ID <span className="coin-tag"><Coins size={15} /> +{24 + Object.values(okQ).filter((w) => w === 0).length * 2}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   CLASE 2 · HOW A BANK WORKS
   ===================================================================== */
const START_2 = {
  cards: [
    { e: "🔁", t: "Intermediary", d: "Someone in the middle who connects two groups.", ex: "The bank connects savers and borrowers." },
    { e: "🟢", t: "Asset", d: "Something the bank OWNS or that people owe to the bank.", ex: "Cash, loans." },
    { e: "🔴", t: "Liability", d: "Something the bank OWES to other people.", ex: "Customer deposits." },
    { e: "🧮", t: "Balance sheet", d: "A table with what a business owns (assets) and owes (liabilities).", ex: "Assets = liabilities + equity." },
    { e: "🛡️", t: "Reserve", d: "The part of the deposits that the bank keeps as cash.", ex: "A 10% reserve." },
    { e: "📥", t: "Interest income", d: "Interest the bank RECEIVES from borrowers.", ex: "10% on loans." },
    { e: "📤", t: "Interest expense", d: "Interest the bank PAYS to savers.", ex: "5% on deposits." },
    { e: "💹", t: "Net profit", d: "What is left after ALL the costs.", ex: "Income − expenses − salaries." },
  ],
  pairs: [{ a: "Asset", b: "The bank owns it" }, { a: "Liability", b: "The bank owes it" }, { a: "Reserve", b: "Deposits kept as cash" }, { a: "Interest income", b: "Paid by borrowers" }, { a: "Interest expense", b: "Paid to savers" }, { a: "Net profit", b: "Left after all costs" }],
};
const RUSH_2 = {
  buckets: [{ id: "asset", e: "🟢", l: "Asset", d: "The bank owns it", c: "#16b074" }, { id: "liab", e: "🔴", l: "Liability", d: "The bank owes it", c: "#ff6b57" }, { id: "none", e: "⚪", l: "Not on the balance sheet", d: "An event, not a thing", c: "#f5b23e" }],
  items: [
    { e: "💵", t: "Cash in the vault", b: "asset", why: "The bank owns its cash." }, { e: "📝", t: "A $9,000,000 loan to a farmer", b: "asset", why: "The farmer owes it to the bank." },
    { e: "🏢", t: "The bank's building", b: "asset", why: "The bank owns it." }, { e: "🚗", t: "Car loans to 30 families", b: "asset", why: "Loans = money owed TO the bank." },
    { e: "💰", t: "Your savings deposit", b: "liab", why: "The bank must return it to you." }, { e: "🏪", t: "A shop's account balance", b: "liab", why: "Deposits are owed to customers." },
    { e: "🏛️", t: "A loan the bank received from the central bank", b: "liab", why: "The bank must repay it." }, { e: "👵", t: "Grandma's CDT", b: "liab", why: "A term deposit is still a deposit." },
    { e: "📣", t: "A rumor on social media", b: "none", why: "Not an asset or a liability — but it can cause a run!" }, { e: "🎉", t: "The bank's anniversary party", b: "none", why: "An event, not something owned or owed." },
    { e: "🌧️", t: "A rainy day", b: "none", why: "Nothing to do with the balance sheet." }, { e: "👔", t: "The manager's smile", b: "none", why: "Nice, but not on the balance sheet." },
  ],
};

/* ---------- VILLAGE BANK BUILDER ---------- */
const VILLAGE2 = [
  { tag: "VIDEO CHECK 1 · RESERVE", q: "The village deposits $10,000,000. The banker keeps a 10% reserve in cash. How much is the reserve?", answer: 1000000, money: true, hint: "10% = divide by 10.", explain: "$1,000,000 stays in the vault." },
  { tag: "VIDEO CHECK 2 · LOANS", q: "How much money can the bank lend?", answer: 9000000, money: true, hint: "Deposits − reserve.", explain: "$9,000,000 → loans (assets)." },
  { tag: "VIDEO CHECK 3 · INCOME", q: "The bank charges 10% interest per year on the $9,000,000 in loans. What is the interest income?", answer: 900000, money: true, hint: "10% of 9,000,000.", explain: "$900,000 comes from borrowers." },
  { tag: "VIDEO CHECK 4 · EXPENSE", q: "The bank pays 5% per year on the $10,000,000 in deposits. What is the interest expense?", answer: 500000, money: true, hint: "5% of 10,000,000 (ALL the deposits).", explain: "$500,000 goes to savers." },
  { tag: "VIDEO CHECK 5 · PROFIT", q: "Salaries cost $100,000. What is the bank's net profit?", answer: 300000, money: true, hint: "900,000 − 500,000 − 100,000.", explain: "$300,000. The spread ($400,000) is not all profit!" },
];
const DAYS2 = [{ e: "🛒", t: "Normal Monday", w: 6000000 }, { e: "🎄", t: "December bonus day", w: 12000000 }, { e: "🏗️", t: "A big company pays its suppliers", w: 18000000 }];
const bankCalc2 = (r) => { const cash = D0.deposits * r / 100; const loans = D0.deposits - D0.other - cash; const inc = loans * 0.12; const exp = D0.deposits * 0.04; const costs = 1500000; return { cash, loans, inc, exp, costs, profit: inc - exp - costs, safe: DAYS2.filter((d) => cash >= d.w).length }; };
function BankBuilder({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [first, setFirst] = useState(0);
  const [r, setR] = useState(20);
  const [tested, setTested] = useState(false);
  const [why, setWhy] = useState("");
  const [st, finish] = useFinish(onSave);
  const C = bankCalc2(r);
  const best = bankCalc2(5).profit;
  const base20 = bankCalc2(20);
  if (st.done) return <Reward title="Bank built! 🏦" subtitle={`Reserve ${r}% · profit ${cop(C.profit)} · safe on ${C.safe}/3 busy days`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Building2 size={22} strokeWidth={2.1} />} title="Village Bank Builder 🏦" subtitle="First rebuild the bank from the video. Then decide the reserve of YOUR District Bank." onExit={onExit}>
      <Brief91 k="c2_builder" />
      <Steps91 labels={["1 · The video bank", "2 · My District Bank"]} at={stage} />
      {stage === 0 ? (
        <>
          <Mission e="🏛️" title="Rebuild the village bank">Use the numbers of the video. Write only numbers (no dots or commas).</Mission>
          <RoundsRunner rounds={VILLAGE2} doneLabel="Now: my District Bank" onDone={(x) => { setFirst(x.firstTry); setStage(1); }} />
        </>
      ) : (
        <>
          <Mission e="🎚️" title="Step 2 · How much cash do you keep in the vault?">Your bank has {cop(D0.deposits)} of savers' deposits. The RESERVE is the part you keep as cash. The rest becomes loans that pay interest. Loans pay 12% a year · deposits cost 4% · salaries {cop(1500000)}.</Mission>
          <div className="g91-slidehelp">
            <div><b>◀ LESS cash</b><span>More money for loans → <strong>more profit</strong></span><span>But on a busy day the vault can be empty → <strong>more risk</strong></span></div>
            <em>🎚️</em>
            <div><b>MORE cash ▶</b><span>The vault can pay busy days → <strong>safer</strong></span><span>But cash in the vault earns nothing → <strong>less profit</strong></span></div>
          </div>
          <div className="start-block">
            <h3>🎚️ Move the bar and watch what happens</h3>
            <p className="start-tip">Use − and + (or drag the bar). Every 5% = {cop(D0.deposits * 0.05)} moves between the vault and loans.</p>
            <Ctl l="🛡️ Reserve (cash)" v={r} set={(v) => { setR(v); setTested(false); }} mn={5} mx={40} stp={5} fmt={(v) => `${v}%`} />
            {r !== 20 && <div className="g91-mini g91-delta"><span>Compared with 20%:</span><span className={C.cash > base20.cash ? "pos" : "neg"}>💵 Cash <b>{C.cash > base20.cash ? "+" : "−"}{cop(Math.abs(C.cash - base20.cash))}</b></span><span className={C.loans > base20.loans ? "pos" : "neg"}>📝 Loans <b>{C.loans > base20.loans ? "+" : "−"}{cop(Math.abs(C.loans - base20.loans))}</b></span><span className={C.profit > base20.profit ? "pos" : "neg"}>💹 Profit <b>{C.profit > base20.profit ? "+" : "−"}{cop(Math.abs(C.profit - base20.profit))}</b></span></div>}
            <div className="g91-bs g91-bs-live">
              <div><small>ASSETS</small><p><span>💵 Cash</span><b>{cop(C.cash)}</b></p><p><span>📝 Loans</span><b>{cop(C.loans)}</b></p><p><span>🏢 Other</span><b>{cop(D0.other)}</b></p></div>
              <div><small>ONE YEAR</small><p><span>📥 Interest income (12% × loans)</span><b>{cop(C.inc)}</b></p><p><span>📤 Interest expense (4% × deposits)</span><b>−{cop(C.exp)}</b></p><p><span>👔 Salaries</span><b>−{cop(C.costs)}</b></p><p className="me"><span>💹 Net profit</span><b>{cop(C.profit)}</b></p></div>
            </div>
            <div className="g91-meters">
              <Gauge91 label="💹 Profit per year" value={C.profit} max={best} fmt={cop} target={bankCalc2(20).profit} targetLabel="20%" />
              <Gauge91 label="🛡️ Cash in the vault" value={C.cash} max={D0.deposits * 0.4} fmt={cop} target={DAYS2[2].w} targetLabel="biggest busy day" good={C.cash >= DAYS2[2].w} />
            </div>
          </div>
          <div className="start-block">
            <h3>🧪 Step 3 · Busy-day test</h3>
            <p className="start-tip">On these 3 days, customers withdraw a lot of cash. Is the cash in YOUR vault ({cop(C.cash)}) enough? Press <b>Run the test</b>. You can change the bar and test again.</p>
            <div className="g91-days">{DAYS2.map((d) => { const ok = C.cash >= d.w; return <div key={d.t} className={tested ? (ok ? "ok" : "no") : ""}><em>{d.e}</em><b>{d.t}</b><span>Withdrawals: {cop(d.w)}</span>{tested && <i>{ok ? "✅ Paid" : `❌ Missing ${cop(d.w - C.cash)}`}</i>}</div>; })}</div>
            <div className="p3-card-actions"><button className="s1-btn primary" onClick={() => setTested(true)}><Zap size={16} /> Run the test</button></div>
            {tested && <div className={`p1-banner ${C.safe === 3 ? "good" : "bad"}`}><span>{C.safe === 3 ? `Safe on all 3 days — but your profit is ${cop(C.profit)}. Safety has a price.` : C.safe === 0 ? "Your bank can't pay even a normal Monday! Very profitable… and very dangerous." : `Safe on ${C.safe}/3 days. A bank with less cash earns more — and risks more.`}</span></div>}
          </div>
          {tested && (
            <div className="start-block">
              <h3>✍️ Step 4 · Explain your decision</h3>
              <WordField value={why} onChange={setWhy} min={10} max={50} rows={3} placeholder="I keep … in cash because …" goals={[W_REASON, W_NUMBERS(1)]} />
              <Starters items={["I keep a reserve of", "because", "This is safer, but", "My profit is"]} onPick={appendStarter(setWhy)} />
              <p className="start-tip">⚠️ This reserve will be the cash of YOUR District Bank in Class 3… when the rumor arrives.</p>
            </div>
          )}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!tested || !goalsOk(why, 10, 50, [W_REASON, W_NUMBERS(1)])} onClick={() => finish(20 + first * 2 + C.safe * 2, { reserve: r, profit: C.profit, safe: C.safe, firstTry: first, why })}>Open my District Bank <span className="coin-tag"><Coins size={15} /> +{20 + first * 2 + C.safe * 2}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   CLASE 3 · BANK RUN!
   ===================================================================== */
const START_3 = {
  cards: [
    { e: "🏃", t: "Bank run", d: "When many depositors try to withdraw their money at the same time.", ex: "Long lines… or a crashed app." },
    { e: "💧", t: "Liquidity", d: "Having enough CASH right now to pay what you must pay today.", ex: "Cash in the vault." },
    { e: "⚖️", t: "Solvency", d: "Owning more than you owe: assets ≥ liabilities.", ex: "Healthy loans + cash > deposits." },
    { e: "🔥", t: "Fire sale", d: "Selling assets very fast — and very cheap — because you need cash.", ex: "$10M of loans sold for $7M." },
    { e: "🛟", t: "Deposit insurance", d: "Protection for eligible deposits up to a legal limit if a bank fails.", ex: "In Colombia: Fogafín." },
    { e: "🏛️", t: "Lender of last resort", d: "The central bank lends cash to SOLVENT banks in a liquidity crisis.", ex: "Banco de la República." },
    { e: "📣", t: "Rumor", d: "Information that spreads fast but is not confirmed.", ex: "“The bank is broke!”" },
    { e: "🧊", t: "Illiquid", d: "Valuable, but hard to turn into cash quickly.", ex: "A 10-year house loan." },
  ],
  pairs: [{ a: "Bank run", b: "Everyone withdraws at once" }, { a: "Liquidity", b: "Cash to pay today" }, { a: "Solvency", b: "Assets bigger than liabilities" }, { a: "Fire sale", b: "Selling fast and cheap" }, { a: "Deposit insurance", b: "Protects deposits up to a limit" }, { a: "Lender of last resort", b: "Central bank emergency cash" }],
};

/* ---------- BANK RUN SIMULATOR ---------- */
const RUN_A = {
  story: "9:47 p.m. Your phone buzzes in the family group: “🚨 DISTRICT BANK IS BROKE!!! Take your money out NOW before it's too late!!!” — forwarded 2,300 times. No source. No name.",
  options: [
    { t: "Withdraw my $2,000,000 tonight in the app, before everybody else does it", k: "out", note: "You are safe for now… but if everybody does the same, a healthy bank can fall. Your cash at home earns no interest — and can be lost or stolen." },
    { t: "Look for official information before deciding", k: "wait", note: "Smart. Rumors have no source. You check the bank's official channels and the Superfinanciera." },
    { t: "Forward it to all my contacts", k: "share", note: "You just made the rumor stronger. This is how bank runs start!" },
  ],
};
const sim3 = (s, p) => ({ ...s, ...p });
const RUN_EVENTS = [
  { e: "🏠", t: "A big withdrawal", story: () => "Mr. Ríos withdraws $5,000,000 to buy a house. A normal day — but people are watching.", opts: [
    { t: "Pay him normally and wish him luck", q: "good", f: (s) => sim3(s, { cash: s.cash - 5e6, deposits: s.deposits - 5e6, trust: s.trust + 2 }), note: "Paying normally shows the bank is fine." },
    { t: "Ask him to come back next week", q: "bad", f: (s) => sim3(s, { trust: s.trust - 12 }), note: "He tells everybody the bank didn't pay. Trust falls!" },
    { t: "Sell $10,000,000 of loans quickly to get extra cash", q: "bad", f: (s) => sim3(s, { cash: s.cash + 8e6 - 5e6, loans: s.loans - 10e6, deposits: s.deposits - 5e6, losses: s.losses + 2e6 }), note: "A fire sale you didn't need: you lost $2,000,000 of your capital cushion." },
  ] },
  { e: "📣", t: "The rumor", story: () => "The message “DISTRICT BANK IS BROKE” is everywhere. Trust falls 15 points. What do you do?", pre: (s) => sim3(s, { trust: s.trust - 15 }), opts: [
    { t: "Publish clear facts: our cash, our loans and how deposit insurance works", q: "good", f: (s) => sim3(s, { trust: s.trust + 12 }), note: "Clear information fights fear." },
    { t: "Stay silent and wait", q: "bad", f: (s) => sim3(s, { trust: s.trust - 10 }), note: "Silence feeds the rumor." },
    { t: "Freeze ALL withdrawals immediately so nobody can take money out until the rumor stops", q: "bad", f: (s) => sim3(s, { trust: s.trust - 30, frozen: true }), note: "Panic! “If they freeze it, it must be true!”" },
    { t: "Post a funny meme about the rumor", q: "ok", f: (s) => sim3(s, { trust: s.trust - 4 }), note: "Not serious enough. Customers want facts." },
  ] },
  { e: "🏃", t: "The withdrawal wave", story: (s) => `Customers ask for ${cop(s.deposits * runPct(s.trust))} today (${Math.round(runPct(s.trust) * 100)}% of deposits — the lower the trust, the bigger the wave). You have ${cop(s.cash)} in cash.`, opts: [
    { t: "Review our liquidity and pay with the cash we have", q: "check", f: (s) => { const w = s.deposits * runPct(s.trust); if (s.cash >= w) return sim3(s, { cash: s.cash - w, deposits: s.deposits - w, trust: s.trust + 4 }); return sim3(s, { deposits: s.deposits - s.cash, cash: 0, trust: s.trust - 25, unpaid: w - s.cash }); }, note: "" },
    { t: "Ask the central bank for an emergency loan, using healthy loans as collateral", q: "good", f: (s) => { const w = s.deposits * runPct(s.trust); const need = Math.max(0, w - s.cash) + 5e6; return sim3(s, { cash: s.cash + need - w, cb: s.cb + need, deposits: s.deposits - w, trust: s.trust + 3 }); }, note: "Lender of last resort: you get cash, but now you owe the central bank." },
    { t: "Sell loans fast (fire sale: every $10,000,000 of loans → $8,000,000 cash)", q: "ok", f: (s) => { const w = s.deposits * runPct(s.trust); const need = Math.max(0, w - s.cash); const lots = Math.ceil(need / 8e6); return sim3(s, { loans: s.loans - lots * 10e6, cash: s.cash + lots * 8e6 - w, deposits: s.deposits - w, losses: s.losses + lots * 2e6 }); }, note: "You paid everyone — but selling cheap destroyed value." },
    { t: "Freeze ALL withdrawals until the panic is over, without explaining anything to customers", q: "bad", f: (s) => sim3(s, { trust: s.trust - 30, frozen: true }), note: "Nobody gets money. Fear explodes." },
  ] },
  { e: "🏛️", t: "The central bank speaks", story: (s) => `Banco de la República announces it will lend to SOLVENT banks that have good collateral. ${s.cb ? `You already owe it ${cop(s.cb)}.` : "You haven't asked for help yet."}`, opts: [
    { t: "Show our healthy loans and keep a liquidity line ready", q: "good", f: (s) => sim3(s, { cash: s.cash + (s.cb ? 0 : 10e6), cb: s.cb + (s.cb ? 0 : 10e6), trust: s.trust + 6, frozen: false }), note: "Customers see the bank has support — and healthy assets." },
    { t: "Ask the central bank to pay all our losses for free, because helping banks is its job", q: "bad", f: (s) => sim3(s, { trust: s.trust - 5 }), note: "Denied. The lender of last resort LENDS to solvent banks — it doesn't give gifts." },
    { t: "Refuse: we don't need anybody", q: "ok", f: (s) => sim3(s, { trust: s.trust - (s.cash < 5e6 ? 8 : 0) }), note: "Risky pride — especially with little cash." },
  ] },
  { e: "🛟", t: "“Is my money insured?”", story: () => "Hundreds of customers write: “If the bank fails, do I lose everything?” What do you answer?", opts: [
    { t: "Fogafín protects eligible deposits up to a legal limit — we explain what is covered", q: "good", f: (s) => sim3(s, { trust: s.trust + 12 }), note: "Honest and precise. Trust grows." },
    { t: "“Don't worry: every peso of every customer is 100% guaranteed forever, with no limits at all!”", q: "bad", f: (s) => sim3(s, { trust: s.trust - 10 }), note: "False promise. When people read the real rules, trust falls." },
    { t: "Say nothing", q: "bad", f: (s) => sim3(s, { trust: s.trust - 6 }), note: "Silence = fear." },
    { t: "“Insurance means banks can never fail”", q: "bad", f: (s) => sim3(s, { trust: s.trust - 8 }), note: "Wrong. Insurance protects depositors; banks can still fail." },
  ] },
];
const runPct = (trust) => (trust >= 70 ? 0.12 : trust >= 50 ? 0.22 : 0.32);
const clampT = (s) => ({ ...s, trust: Math.max(0, Math.min(100, Math.round(s.trust))) });
function BankRun({ resp, onSave, onExit }) {
  const D = districtOf(resp);
  const cushion = Math.max(0, Math.round(resp?.c2_builder?.profit ?? bankCalc2(20).profit));
  const start = { cash: D.cash, loans: D.loans, other: D0.other + cushion, deposits: D0.deposits, trust: D0.trust, cb: 0, losses: 0, unpaid: 0, frozen: false };
  const [phase, setPhase] = useState("a");
  const [a, setA] = useState(null);
  const [ev, setEv] = useState(0);
  const [s, setS] = useState(start);
  const [log, setLog] = useState([]);
  const [picked, setPicked] = useState(null);
  const [orders] = useState(() => RUN_EVENTS.map((x) => shuffleArr(x.opts.map((_, k) => k))));
  const [aOrder] = useState(() => shuffleArr([0, 1, 2]));
  const [st, finish] = useFinish(onSave);
  const E = RUN_EVENTS[ev];
  const view = picked ? picked.after : (E?.pre && phase === "b" ? clampT(E.pre(s)) : s);
  const assets = view.cash + view.loans + view.other, liab = view.deposits + view.cb;
  const choose = (k) => {
    const base = E.pre ? clampT(E.pre(s)) : s;
    const o = E.opts[k];
    const after = clampT(o.f(base));
    let q = o.q, note = o.note;
    if (q === "check") { q = after.unpaid ? "bad" : "good"; note = after.unpaid ? `Not enough cash! ${cop(after.unpaid)} of withdrawals were NOT paid. A liquidity crisis.` : "You had enough cash — your reserve saved you."; }
    setPicked({ k, q, note, after });
  };
  const next = () => {
    const nl = [...log, { ev: E.t, choice: E.opts[picked.k].t, q: picked.q }];
    setLog(nl); setS(picked.after); setPicked(null);
    if (ev < RUN_EVENTS.length - 1) setEv(ev + 1); else setPhase("end");
  };
  if (st.done) return <Reward title={s.survived ? "Your bank survived! 🏦" : "Crisis over 🚨"} subtitle={`Trust ${s.trust}% · cash ${cop(s.cash)} · losses ${cop(s.losses)}`} coins={st.coins} saving={st.saving} onExit={onExit} gold={s.survived} />;
  if (phase === "a") return (
    <ActShell icon={<Siren91 />} title="Bank Run Simulator 🚨" subtitle="Part A: you are a depositor. Part B: you are the manager of YOUR District Bank." onExit={onExit}>
      <Brief91 k="c3_run" />
      <Steps91 labels={["A · Depositor", "B · Manager (5 events)", "Results"]} at={0} />
      <div className="g91-phone"><small>📱 Family group · 9:47 p.m.</small><p>{RUN_A.story}</p></div>
      <div className="quiz-options">{aOrder.map((k, pos) => <button key={k} type="button" disabled={a !== null} className={`quiz-opt ${a === k ? (RUN_A.options[k].k === "wait" ? "correct" : "wrong") : ""}`} onClick={() => setA(k)}><span className="opt-key">{"ABC"[pos]}</span><span className="opt-text">{RUN_A.options[k].t}</span></button>)}</div>
      {a !== null && <div className={`p1-banner ${RUN_A.options[a].k === "wait" ? "good" : "bad"}`}><span>{RUN_A.options[a].note}</span></div>}
      {a !== null && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setPhase("b")}>Now you are the MANAGER <ChevronRight size={18} /></button></div>}
    </ActShell>
  );
  if (phase === "end") {
    const solvent = assets >= liab, liquid = !s.unpaid && s.cash >= 0;
    const survived = solvent && liquid && s.trust >= 40;
    const good = log.filter((x) => x.q === "good").length;
    const out = { ...s, solvent, survived };
    return (
      <ActShell icon={<Siren91 />} title="Crisis results 📊" subtitle="Did your bank survive the bank run?" onExit={onExit}>
        <div className={`g91-verdict ${survived ? "ok" : "no"}`}><em>{survived ? "🏦" : "🚨"}</em><div><b>{survived ? "Your bank survived the run!" : !solvent ? "Your bank became INSOLVENT" : !liquid ? "Your bank ran out of cash (illiquid)" : "Your bank lost the trust of its customers"}</b><span>{good}/5 strong decisions · trust {s.trust}% · losses {cop(s.losses)}</span></div></div>
        <div className="g91-two">
          <div className={`g91-check ${liquid ? "ok" : "no"}`}><b>💧 Liquidity</b><span>{liquid ? `Cash left: ${cop(s.cash)}. Everyone who asked was paid.` : `${cop(s.unpaid)} of withdrawals were not paid.`}</span></div>
          <div className={`g91-check ${solvent ? "ok" : "no"}`}><b>⚖️ Solvency</b><span>Assets {cop(assets)} vs. liabilities {cop(liab)} → {solvent ? "assets ≥ liabilities ✅" : "it owes more than it owns ❌"}</span></div>
        </div>
        <div className="g91-timeline">{log.map((x, k) => <div key={k} className={x.q}><small>{RUN_EVENTS[k].e} {x.ev}</small><span>{x.choice}</span></div>)}</div>
        <div className="p1-banner good"><Lightbulb size={18} /><span><b>Key lesson:</b> a bank can be solvent (healthy loans) and still fail if it is not liquid (no cash today). Fire sales turn a liquidity problem into a solvency problem. Trust is the bank's most valuable asset.</span></div>
        <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(20 + good * 4, { ...out, withdrew: RUN_A.options[a].k === "out", depositor: RUN_A.options[a].k, choices: log, good })}>Save my crisis results <span className="coin-tag"><Coins size={15} /> +{20 + good * 4}</span></button></div>
      </ActShell>
    );
  }
  return (
    <ActShell icon={<Siren91 />} title={`Event ${ev + 1}/5 · ${E.e} ${E.t}`} subtitle="You are the manager of the District Bank. Watch your trust and your cash." onExit={onExit}>
      <Steps91 labels={["A · Depositor", "B · Manager (5 events)", "Results"]} at={1} />
      <div className="g91-meters">
        <Bar91 label="🤝 Trust" value={view.trust} color={view.trust >= 60 ? "#16b074" : view.trust >= 40 ? "#f5b23e" : "#ff6b57"} />
        <Bar91 label="💧 Cash / deposits" value={view.deposits ? (view.cash / view.deposits) * 100 : 0} color="#0b7a50" />
        <div className="g91-mini"><span>💵 Cash <b>{cop(view.cash)}</b></span><span>📝 Loans <b>{cop(view.loans)}</b></span><span>💰 Deposits <b>{cop(view.deposits)}</b></span><span className={assets - liab < 0 ? "neg" : ""}>🧱 Capital (assets − liabilities) <b>{cop(assets - liab)}</b></span>{view.cb > 0 && <span>🏛️ Owe central bank <b>{cop(view.cb)}</b></span>}{view.losses > 0 && <span className="neg">🔥 Losses <b>{cop(view.losses)}</b></span>}</div>
      </div>
      <div className="g83-event"><em>{E.e}</em><div><b>{E.t}</b><span>{E.story(E.pre ? clampT(E.pre(s)) : s)}</span></div></div>
      <div className="quiz-options">{orders[ev].map((k, pos) => <button key={k} type="button" disabled={!!picked} className={`quiz-opt ${picked?.k === k ? (picked.q === "good" ? "correct" : picked.q === "bad" ? "wrong" : "") : ""}`} onClick={() => choose(k)}><span className="opt-key">{"ABCD"[pos]}</span><span className="opt-text">{E.opts[k].t}</span></button>)}</div>
      {picked && <div className={`p1-banner ${picked.q === "good" ? "good" : "bad"}`}><span><b>{picked.q === "good" ? "Strong decision. " : picked.q === "ok" ? "Hmm… " : "Ouch. "}</b>{picked.note}</span></div>}
      {picked && <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{ev < RUN_EVENTS.length - 1 ? "Next event" : "See the results"} <ChevronRight size={18} /></button></div>}
    </ActShell>
  );
}
function Siren91() { return <ShieldAlert size={22} strokeWidth={2.1} />; }

/* ---------- ADVISOR PAGE 01 · My Bank Crisis Report ---------- */
const CAUSES3 = ["A rumor without a source", "A low cash reserve", "Customers' fear", "My decisions as manager", "Freezing withdrawals"];
function CrisisReport({ resp, existing, onSave, onExit }) {
  const run = resp?.c3_run;
  const [causes, setCauses] = useState(existing?.causes || []);
  const [cause, setCause] = useState(existing?.cause || "");
  const [learn, setLearn] = useState(existing?.learn || "");
  const [st, finish] = useFinish(onSave);
  const G1 = [W_REASON], G2 = [W_CONTRAST];
  const ok = causes.length >= 1 && goalsOk(cause, 10, 50, G1) && goalsOk(learn, 12, 60, G2) && /liquid|solven/i.test(learn);
  if (st.done) return <Reward title="Advisor page 01 saved! 🧾" subtitle="My Bank Crisis Report is in your portfolio." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<FileText size={22} strokeWidth={2.1} />} title="My Bank Crisis Report 🚨" subtitle="Advisor Page 01 · What caused the crisis, how your bank responded, what you learned." onExit={onExit}>
      <Brief91 k="c3_report" />
      <PBadge n="01" />
      {!run ? <div className="p1-banner bad"><span>Play the Bank Run Simulator first — your report uses your real results.</span></div> : (
        <>
          <div className="g84-results g91-results">
            <div><small>RESULT</small><b>{run.survived ? "Survived ✅" : "Failed 🚨"}</b></div>
            <div><small>TRUST</small><b>{run.trust}%</b></div>
            <div><small>CASH LEFT</small><b>{cop(run.cash)}</b></div>
            <div><small>FIRE-SALE LOSSES</small><b>{cop(run.losses)}</b></div>
          </div>
          <div className="start-block">
            <h3>1 · What caused the crisis? <small>(choose 1–2)</small></h3>
            <div className="g84-chips">{CAUSES3.map((c) => <button key={c} type="button" className={causes.includes(c) ? "on" : ""} onClick={() => setCauses(causes.includes(c) ? causes.filter((x) => x !== c) : causes.length < 2 ? [...causes, c] : causes)}>{c}</button>)}</div>
            <WordField value={cause} onChange={setCause} min={10} max={50} rows={3} placeholder="The crisis started … because …" goals={G1} />
          </div>
          <div className="start-block">
            <h3>2 · How did my bank respond?</h3>
            <div className="g91-timeline">{(run.choices || []).map((x, k) => <div key={k} className={x.q}><small>{x.ev}</small><span>{x.choice}</span></div>)}</div>
          </div>
          <div className="start-block">
            <h3>3 · What did I learn about liquidity and solvency?</h3>
            <WordField value={learn} onChange={setLearn} min={12} max={60} rows={3} placeholder="A bank can be … but …" goals={[...G2, { l: "Use liquidity or solvency", re: /liquid|solven/i, ex: "liquidity · solvent · insolvent" }]} />
            <Starters items={["A bank can be solvent but", "Liquidity means", "However,", "Trust is important because"]} onPick={appendStarter(setLearn)} />
          </div>
        </>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!run || !ok} onClick={() => finish(26, { causes, cause, learn, survived: run.survived, trust: run.trust })}>Save Advisor Page 01 <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 4 · THE CENTRAL BANK
   ===================================================================== */
const START_4 = {
  cards: [
    { e: "🏛️", t: "Central bank", d: "The bank of the government and of the banks. It manages the currency and monetary policy.", ex: "Banco de la República (Colombia), the Fed (USA)." },
    { e: "🎚️", t: "Policy rate", d: "The interest rate the central bank uses to influence all the other rates.", ex: "If it goes up, loans get more expensive." },
    { e: "🎈", t: "Inflation", d: "When prices go up in general and money buys less.", ex: "A $5,000 snack costs $5,500." },
    { e: "🎯", t: "Inflation target", d: "The level of inflation the central bank wants to reach.", ex: "Colombia: 3%." },
    { e: "🧭", t: "Monetary policy", d: "Actions to influence money and credit (rates, liquidity).", ex: "Raising rates to cool prices." },
    { e: "🗽", t: "Independence", d: "Decisions free from political pressure.", ex: "No rate cuts just before elections." },
    { e: "🔍", t: "Supervisor", d: "An institution that checks that banks follow the rules.", ex: "Superintendencia Financiera." },
    { e: "💵", t: "Currency", d: "The official money of a country.", ex: "The Colombian peso." },
  ],
  pairs: [{ a: "Central bank", b: "Bank of the government and the banks" }, { a: "Policy rate", b: "Influences all the other rates" }, { a: "Inflation", b: "Prices go up, money buys less" }, { a: "Independence", b: "Free from political pressure" }, { a: "Supervisor", b: "Checks that banks follow rules" }, { a: "Currency", b: "The official money" }],
};
const RUSH_4 = {
  buckets: [{ id: "br", e: "🏛️", l: "Banco de la República", d: "Central bank", c: "#0b7a50" }, { id: "sf", e: "🔍", l: "Superfinanciera", d: "Supervisor", c: "#f5b23e" }, { id: "fg", e: "🛟", l: "Fogafín", d: "Deposit insurance", c: "#ff6b57" }, { id: "cb", e: "🏦", l: "Commercial bank", d: "Your bank", c: "#e07a2f" }],
  items: [
    { e: "🎚️", t: "Raises the policy rate to fight inflation", b: "br", why: "Monetary policy = central bank." }, { e: "💵", t: "Issues the official currency (pesos)", b: "br", why: "Only the central bank issues money." },
    { e: "🆘", t: "Lends emergency cash to a solvent bank", b: "br", why: "Lender of last resort." }, { e: "🔍", t: "Inspects whether a bank follows the rules", b: "sf", why: "Supervision." },
    { e: "📢", t: "Receives complaints about abusive bank practices", b: "sf", why: "It protects financial consumers." }, { e: "🚫", t: "Can order a bank to stop a risky practice", b: "sf", why: "The supervisor enforces rules." },
    { e: "🛟", t: "Pays insured deposits up to a limit if a bank fails", b: "fg", why: "Deposit insurance." }, { e: "🧾", t: "Collects an insurance premium from banks", b: "fg", why: "Banks pay to be insured." },
    { e: "📝", t: "Gives a car loan to Camila", b: "cb", why: "Retail loans = commercial banks." }, { e: "💳", t: "Opens your savings account", b: "cb", why: "Your bank, not the central bank." },
    { e: "🏧", t: "Charges you an ATM fee", b: "cb", why: "Fees are set by commercial banks." }, { e: "📈", t: "Pays you interest on your CDT", b: "cb", why: "Your bank pays the interest." },
  ],
};

/* ---------- CENTRAL BANK DESK · 4 misiones ---------- */
const inflNext = (rate) => Math.max(1, +(9 - (rate - 6) * 0.9).toFixed(1));
const jobsNext = (rate) => Math.max(10, Math.min(100, Math.round(100 - Math.max(0, rate - 8) * 10)));
const DESK_M = [
  { k: "lolr", e: "🆘", t: "Lender of last resort", q: "Two banks call you at 2 a.m. asking for emergency cash. Bank Norte: healthy loans, but a rumor made people withdraw. Bank Sur: half of its loans will never be repaid; it owes more than it owns. Who gets emergency LOANS?", options: ["Bank Norte — it is solvent but illiquid", "Both banks, because the central bank must save every bank, even if it owes more than it owns", "Only Bank Sur", "Nobody"], correct: 0, explain: "The lender of last resort helps SOLVENT banks with good collateral. An insolvent bank needs a different solution (resolution), and Fogafín protects its depositors." },
  { k: "indep", e: "🗳️", t: "Independence", q: "Two months before elections, a politician calls: “Cut the rate to 2%! People want cheap credit now.” Inflation is still 7%.", options: ["Decide with the data, not with politics", "Cut it to 2%, because cheap credit makes people happy and inflation will disappear by itself", "Cut it to 0%", "Resign"], correct: 0, explain: "Independence protects long-term stability. Cheap credit with high inflation = even higher prices." },
  { k: "money", e: "💵", t: "One trusted currency", q: "Imagine 3,000 private banks printing their own notes, each with a different value. What problem does a central bank solve?", options: ["One currency that everyone trusts", "It makes every private note worth exactly the same, so people need even more different notes", "No more coins", "Free money"], correct: 0, explain: "Before the Fed (1913), people didn't know which notes were worth what." },
];
function CentralDesk({ onSave, onExit }) {
  const [rate, setRate] = useState(9);
  const [locked, setLocked] = useState(false);
  const [m, setM] = useState({});
  const [st, finish] = useFinish(onSave);
  const inf = inflNext(rate), jobs = jobsNext(rate);
  const good = inf <= 5 && jobs >= 60;
  const nM = Object.keys(m).length;
  const first = Object.values(m).filter((w) => w === 0).length;
  if (st.done) return <Reward title="Central banker! 🏛️" subtitle={`Policy rate ${rate}% · inflation next year ${inf}%`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Landmark size={22} strokeWidth={2.1} />} title="Central Bank Desk 🏛️" subtitle="You are on the board of the central bank. 4 missions — and your policy rate will change the Interest Lab in Class 6." onExit={onExit}>
      <Brief91 k="c4_desk" />
      <Mission e="🎚️" title="Mission 1 · Prices are rising 9% a year — the target is 3%">The policy rate is the interest rate the central bank uses to calm or push the economy. Today it is 9%. Move it and watch two things: <b>inflation next year</b> and <b>jobs</b>.</Mission>
      <div className="g91-chain">
        <div><span>🎚️ Rate ↑</span><i>→</i><span>💳 Loans cost more</span><i>→</i><span>🛍️ People spend less</span><i>→</i><span className="pos">🎈 Inflation ↓</span></div>
        <div className="warn"><span>⚠️ Rate TOO high</span><i>→</i><span>🏭 Companies stop investing</span><i>→</i><span className="neg">👷 Jobs ↓</span></div>
      </div>
      <div className="start-block">
        <h3>🎚️ Move the policy rate and find the balance</h3>
        <div className="g91-goal2"><span className={inf <= 5 ? "ok" : ""}>{inf <= 5 ? "✅" : "⬜"} Inflation next year: 5% or less</span><span className={jobs >= 60 ? "ok" : ""}>{jobs >= 60 ? "✅" : "⬜"} Jobs index: 60 or more</span></div>
        <Ctl l="🎚️ Policy rate" v={rate} set={(v) => { if (!locked) setRate(v); }} mn={4} mx={16} stp={0.5} fmt={(v) => `${v}%`} />
        <div className="g91-meters">
          <Gauge91 label="🎈 Inflation next year" value={inf} max={12} target={5} targetLabel="max 5%" good={inf <= 5} />
          <Gauge91 label="👷 Jobs index (100 = everybody keeps their job)" value={jobs} max={100} unit="/100" target={60} targetLabel="min 60" good={jobs >= 60} />
          <p className="g91-note">{rate === 9 ? `Starting point: with a 9% rate, inflation next year would be ${inf}% — still above the goal. Move the bar!` : rate > 9 ? `Higher rate (${rate}%): inflation next year ${inf}% (it was ${inflNext(9)}% at 9%)${jobs < 100 ? `, but the jobs index falls to ${jobs}/100` : " and jobs are still safe"}.` : `Lower rate (${rate}%): loans get cheaper, people spend more — inflation goes UP to ${inf}%.`}</p>
        </div>
        {!locked ? <div className="p3-card-actions"><button className="s1-btn primary" onClick={() => setLocked(true)}><Gavel size={16} /> Announce the decision</button></div>
          : <div className={`p1-banner ${good ? "good" : "bad"}`}><span>{good ? `Great balance: inflation falls to ${inf}% and most people keep their jobs.` : inf > 5 ? `Inflation stays high (${inf}%). Prices keep eating salaries.` : `Inflation falls, but the jobs index is only ${jobs}. Too strong!`} {!good && <button type="button" className="p1-chip" onClick={() => setLocked(false)}>Try another rate</button>}</span></div>}
      </div>
      {locked && DESK_M.map((d, k) => <PickOne key={d.k} tag={`MISSION ${k + 2} · ${d.e} ${d.t.toUpperCase()}`} q={d.q} options={d.options} correct={d.correct} explain={d.explain} onRight={(w) => setM((o) => ({ ...o, [d.k]: w }))} />)}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!locked || nM < 3} onClick={() => finish(20 + (good ? 6 : 0) + first * 4, { policy: rate, inflation: inf, jobs, balanced: good, firstTry: first })}>{!locked ? "Announce your rate first" : nM < 3 ? `Finish the missions (${nM}/3)` : "Close the board meeting"} <span className="coin-tag"><Coins size={15} /> +{20 + (good ? 6 : 0) + first * 4}</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 5 · TWO ACCOUNTS, TWO LIVES
   ===================================================================== */
const START_5 = {
  cards: [
    { e: "🐷", t: "Savings account", d: "An account to keep money, receive income, pay and save. It may pay interest.", ex: "Daniel's account." },
    { e: "🔄", t: "Current account", d: "An account designed for many payments and transfers.", ex: "Laura's business account." },
    { e: "💳", t: "Debit card", d: "A card that uses YOUR money from the account.", ex: "Pay at a shop." },
    { e: "🧾", t: "Management fee", d: "A regular charge (often monthly) for keeping the account.", ex: "$8,000 a month." },
    { e: "🏧", t: "Transaction fee", d: "A charge for some operations: ATM withdrawals, transfers…", ex: "$3,000 per withdrawal." },
    { e: "➖", t: "Overdraft", d: "Spending more than your balance with the bank's permission. It's borrowing!", ex: "Balance $500,000, payment $600,000." },
    { e: "🇨🇴", t: "4×1,000", d: "A Colombian tax: $4 for every $1,000 of certain transactions (some are exempt).", ex: "$200,000 → $800." },
    { e: "🆘", t: "Emergency reserve", d: "Money kept for unexpected situations.", ex: "Better than an overdraft." },
  ],
  pairs: [{ a: "Savings account", b: "Keep money and save" }, { a: "Current account", b: "Many payments and transfers" }, { a: "Management fee", b: "Regular charge for the account" }, { a: "Transaction fee", b: "Charge per operation" }, { a: "Overdraft", b: "Spending more than your balance" }, { a: "4×1,000", b: "$4 for every $1,000" }],
};

/* ---------- ACCOUNT DETECTIVE ---------- */
const XFER5 = 2000;
const ACC5 = [
  { id: "A", e: "🟢", n: "Account A", fee: 0, rate: 2, free: 5, atm: 3000, od: false },
  { id: "B", e: "🟡", n: "Account B", fee: 8000, rate: 5, free: Infinity, atm: 0, od: true },
  { id: "C", e: "🟠", n: "Account C", fee: 3000, rate: 3, free: 10, atm: 1000, od: false },
];
const accCost5 = (a, u) => Math.round(a.fee + a.atm * u.atm + Math.max(0, u.tr - a.free) * XFER5 - (u.bal * a.rate) / 1200);
const bestAcc5 = (u) => ACC5.reduce((b, a) => (accCost5(a, u) < accCost5(b, u) ? a : b), ACC5[0]).id;
const CLIENTS5 = [
  { id: "daniel", e: "🎨", n: "Daniel", d: "Graphic designer. Gets a salary, pays with his debit card, saves for a trip.", u: { bal: 1500000, tr: 3, atm: 0 } },
  { id: "laura", e: "👗", n: "Laura", d: "Clothing business. Pays suppliers all the time. Sometimes needs an overdraft.", u: { bal: 2000000, tr: 30, atm: 2 } },
  { id: "samuel", e: "🛵", n: "Samuel", d: "Delivery driver. Takes out cash several times a month. Keeps little money.", u: { bal: 300000, tr: 7, atm: 4 } },
  { id: "isabella", e: "💼", n: "Isabella", d: "Has big savings and wants interest. Almost never moves her money.", u: { bal: 8000000, tr: 1, atm: 1 } },
];
const SURPRISE5 = { id: "daniel2", e: "🎨", n: "Daniel (new job!)", d: "Now Daniel is a freelancer: he pays many people and withdraws cash for clients.", u: { bal: 1500000, tr: 12, atm: 2 } };
const MYUSE5 = { barista: { bal: 2000000, tr: 4, atm: 6 }, designer: { bal: 2000000, tr: 6, atm: 1 }, nurse: { bal: 2000000, tr: 3, atm: 3 }, baker: { bal: 2000000, tr: 25, atm: 2 } };
function AccTable({ hi }) {
  const row = (l, f) => <div><span>{l}</span>{ACC5.map((a) => <span key={a.id} className={hi === a.id ? "on" : ""}>{f(a)}</span>)}</div>;
  return (
    <div className="g84-wtable g91-acc">
      <div className="h"><span>Fictional account</span>{ACC5.map((a) => <span key={a.id} className={hi === a.id ? "on" : ""}>{a.e} {a.n}</span>)}</div>
      {row("Monthly fee", (a) => cop(a.fee))}{row("Interest (per year)", (a) => `${a.rate}%`)}{row("Free transfers", (a) => (a.free === Infinity ? "Unlimited" : a.free))}{row("ATM withdrawal", (a) => cop(a.atm))}{row("Overdraft", (a) => (a.od ? "Yes" : "No"))}
      <div className="foot"><span>Extra transfers (after the free ones): {cop(XFER5)} each</span></div>
    </div>
  );
}
function UseChips({ u }) {
  return <div className="g91-use"><span>💰 Balance {cop(u.bal)}</span><span>🔄 {u.tr} transfers/month</span><span>🏧 {u.atm} ATM/month</span></div>;
}
function CostLine({ u, best }) {
  return <div className="g91-costs">{ACC5.map((a) => { const c = accCost5(a, u); return <span key={a.id} className={a.id === best ? "on" : ""}>{a.e} {a.id}: <b>{c <= 0 ? `earns ${cop(-c)}` : `costs ${cop(c)}`}</b></span>; })}</div>;
}
function AccountDetective({ resp, onSave, onExit }) {
  const D = districtOf(resp);
  const myJob = D.profile?.job?.id || "designer";
  const myU = MYUSE5[myJob];
  const [stage, setStage] = useState(0);
  const [pick, setPick] = useState({});
  const [checked, setChecked] = useState(false);
  const [sp, setSp] = useState(null);
  const [mine, setMine] = useState(null);
  const [st, finish] = useFinish(onSave);
  const right = CLIENTS5.filter((c) => pick[c.id] === bestAcc5(c.u)).length;
  const spBest = bestAcc5(SURPRISE5.u);
  const mineA = ACC5.find((a) => a.id === mine);
  const mineCost = mineA ? accCost5(mineA, myU) * 3 : 0;
  if (st.done) return <Reward title="Case closed, detective! 🔎" subtitle={`${right}/4 clients · my account: ${mineA.n}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Account Detective 🔎" subtitle="Find the best account for each client — then for YOU. Hidden costs are everywhere!" onExit={onExit}>
      <Brief91 k="c5_detective" />
      <Steps91 labels={["1 · Four clients", "2 · Surprise round", "3 · My account"]} at={stage} />
      <AccTable hi={stage === 2 ? mine : null} />
      <p className="start-tip">💡 Monthly cost = fee + ATM withdrawals + extra transfers − interest earned in one month (balance × rate ÷ 12).</p>
      {stage === 0 && (
        <>
          {CLIENTS5.map((c) => { const b = bestAcc5(c.u); return (
            <div key={c.id} className={`start-block g91-client ${checked ? (pick[c.id] === b ? "ok" : "no") : ""}`}>
              <header><em>{c.e}</em><div><b>{c.n}</b><span>{c.d}</span></div></header>
              <UseChips u={c.u} />
              <Tri value={pick[c.id]} onPick={(v) => !checked && setPick({ ...pick, [c.id]: v })} disabled={checked} opts={ACC5.map((a) => [a.id, `${a.e} ${a.id}`])} />
              {checked && <><CostLine u={c.u} best={b} /><p className="g91-note">{pick[c.id] === b ? "✅ Correct!" : `❌ The best is ${b}.`} {c.id === "laura" ? "Only B has an overdraft and unlimited transfers." : c.id === "isabella" ? "With a big balance, the interest matters more than the fee." : c.id === "samuel" ? "The ATM fees are the hidden cost here." : "No fee + no ATM use = A wins."}</p></>}
            </div>
          ); })}
          <div className="start-foot">{!checked ? <button className="s1-btn primary big" disabled={CLIENTS5.some((c) => !pick[c.id])} onClick={() => setChecked(true)}>Reveal the real costs <Search size={17} /></button> : <button className="s1-btn primary big" onClick={() => setStage(1)}>Surprise round! <ChevronRight size={18} /></button>}</div>
        </>
      )}
      {stage === 1 && (
        <div className={`start-block g91-client ${sp ? (sp === spBest ? "ok" : "no") : ""}`}>
          <div className="g83-event"><em>⚡</em><div><b>SURPRISE ROUND</b><span>{SURPRISE5.d} Is {pick.daniel ? `Account ${pick.daniel}` : "the same account"} still the best?</span></div></div>
          <header><em>{SURPRISE5.e}</em><div><b>{SURPRISE5.n}</b></div></header>
          <UseChips u={SURPRISE5.u} />
          <Tri value={sp} onPick={(v) => !sp && setSp(v)} disabled={!!sp} opts={ACC5.map((a) => [a.id, `${a.e} ${a.id}`])} />
          {sp && <><CostLine u={SURPRISE5.u} best={spBest} /><p className="g91-note">{sp === spBest ? "✅ Yes! Needs change → the best account changes." : `❌ Now ${spBest} is the best. Same person, new habits, new account.`}</p></>}
          {sp && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(2)}>Now: MY account <ChevronRight size={18} /></button></div>}
        </div>
      )}
      {stage === 2 && (
        <div className="start-block g91-client">
          <header><em>{D.profile?.avatar || "🙋"}</em><div><b>{D.profile ? `${D.profile.name} · ${D.profile.job.n}` : "You"}</b><span>Your habits in the district this season:</span></div></header>
          <UseChips u={myU} />
          <Tri value={mine} onPick={setMine} opts={ACC5.map((a) => [a.id, `${a.e} ${a.id}`])} />
          {mineA && <><CostLine u={myU} best={bestAcc5(myU)} /><div className={`p1-banner ${mine === bestAcc5(myU) ? "good" : "bad"}`}><span>In 3 months, {mineA.n} {mineCost <= 0 ? <>gives you <b>{cop(-mineCost)}</b></> : <>costs you <b>{cop(mineCost)}</b></>}. {mine === bestAcc5(myU) ? "The best choice for your habits!" : `Account ${bestAcc5(myU)} would be better for you — you can still choose.`} This changes your balance in the district.</span></div></>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!mine} onClick={() => finish(18 + right * 3 + (sp === spBest ? 3 : 0) + (mine === bestAcc5(myU) ? 3 : 0), { picks: pick, right, surprise: sp, mine, mineName: mineA.n, mineCost, best: bestAcc5(myU) })}>Open my account <span className="coin-tag"><Coins size={15} /> +{18 + right * 3 + (sp === spBest ? 3 : 0) + (mine === bestAcc5(myU) ? 3 : 0)}</span></button></div>
        </div>
      )}
    </ActShell>
  );
}

/* ---------- ADVISOR PAGE 02 · The right account ---------- */
const FEAT5 = ["No monthly fee", "Debit card", "Mobile app", "Interest on savings", "Many free transfers", "Overdraft facility", "Separate business money", "Low ATM fees"];
const RISK5 = ["ATM fees add up", "Management fee", "Overdraft interest", "Extra transfer fees", "4×1,000 tax", "Low interest rate"];
function AccountPage({ resp, existing, onSave, onExit }) {
  const det = resp?.c5_detective;
  const init = (k) => existing?.[k] || { type: "", feats: [], risk: "", why: "" };
  const [rec, setRec] = useState({ daniel: init("daniel"), laura: init("laura") });
  const [st, finish] = useFinish(onSave);
  const set = (who, patch) => setRec({ ...rec, [who]: { ...rec[who], ...patch } });
  const okOne = (r) => r.type && r.feats.length === 2 && r.risk && goalsOk(r.why, 8, 40, [W_REASON]);
  const right = (rec.daniel.type === "savings" ? 1 : 0) + (rec.laura.type === "current" ? 1 : 0);
  if (st.done) return <Reward title="Advisor page 02 saved! 🧾" subtitle="The right account — for Daniel, for Laura and for you." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<CreditCard size={22} strokeWidth={2.1} />} title="The Right Account 💳" subtitle="Advisor Page 02 · Write a short recommendation for Daniel and Laura." onExit={onExit}>
      <Brief91 k="c5_page" />
      <PBadge n="02" />
      {[["daniel", "🎨 Daniel", "Has $1,500,000, makes frequent small payments and saves for a trip."], ["laura", "👗 Laura", "Has a clothing business and pays suppliers regularly."]].map(([k, n, d]) => { const r = rec[k]; return (
        <div key={k} className={`start-block g91-client ${okOne(r) ? "ok" : ""}`}>
          <header><em>{n.split(" ")[0]}</em><div><b>{n.split(" ")[1]}</b><span>{d}</span></div></header>
          <small className="g91-lbl">1 · Type of account</small>
          <Tri value={r.type} onPick={(v) => set(k, { type: v })} opts={[["savings", "🐷 Savings account"], ["current", "🔄 Current account"]]} />
          <small className="g91-lbl">2 · Two features to look for ({r.feats.length}/2)</small>
          <div className="g84-chips">{FEAT5.map((f) => <button key={f} type="button" className={r.feats.includes(f) ? "on" : ""} onClick={() => set(k, { feats: r.feats.includes(f) ? r.feats.filter((x) => x !== f) : r.feats.length < 2 ? [...r.feats, f] : r.feats })}>{f}</button>)}</div>
          <small className="g91-lbl">3 · One cost or risk to check</small>
          <div className="g84-chips">{RISK5.map((f) => <button key={f} type="button" className={r.risk === f ? "on" : ""} onClick={() => set(k, { risk: f })}>{f}</button>)}</div>
          <small className="g91-lbl">4 · Why does it fit?</small>
          <WordField value={r.why} onChange={(v) => set(k, { why: v })} min={8} max={40} rows={2} placeholder="This account fits because…" goals={[W_REASON]} />
        </div>
      ); })}
      {det && <div className="g84-results g91-results"><div><small>MY ACCOUNT</small><b>{det.mineName}</b></div><div><small>3 MONTHS</small><b>{det.mineCost <= 0 ? `+${cop(-det.mineCost)}` : `−${cop(det.mineCost)}`}</b></div><div><small>DETECTIVE</small><b>{det.right}/4</b></div></div>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!okOne(rec.daniel) || !okOne(rec.laura)} onClick={() => finish(20 + right * 3, { ...rec, right })}>Save Advisor Page 02 <span className="coin-tag"><Coins size={15} /> +{20 + right * 3}</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 6 · THE PRICE OF MONEY
   ===================================================================== */
const START_6 = {
  cards: [
    { e: "📥", t: "Deposit rate", d: "The interest rate a bank PAYS for your savings.", ex: "5% a year." },
    { e: "📤", t: "Lending rate", d: "The interest rate a bank CHARGES for a loan.", ex: "18% a year." },
    { e: "↔️", t: "Spread", d: "Lending rate − deposit rate (in percentage points).", ex: "18% − 5% = 13 points." },
    { e: "🎯", t: "Percentage point", d: "The difference between two percentages.", ex: "From 5% to 7% = +2 points." },
    { e: "⚠️", t: "Risk premium", d: "Extra interest charged to riskier borrowers.", ex: "Missed payments → higher rate." },
    { e: "🔁", t: "Fractional reserve", d: "Banks keep a part of deposits and lend the rest.", ex: "Keep 10%, lend 90%." },
    { e: "🏷️", t: "Hidden fee", d: "A cost that is easy to miss.", ex: "Overdraft, ATM, annual fee." },
    { e: "🚀", t: "High-yield account", d: "A savings product that pays more interest than usual.", ex: "Compare before you save!" },
  ],
  pairs: [{ a: "Deposit rate", b: "The bank pays it to savers" }, { a: "Lending rate", b: "Borrowers pay it to the bank" }, { a: "Spread", b: "Lending rate minus deposit rate" }, { a: "Risk premium", b: "Extra rate for risky borrowers" }, { a: "Hidden fee", b: "A cost that is easy to miss" }, { a: "Percentage point", b: "Difference between two percentages" }],
};

/* ---------- THE INTEREST RATE MACHINE ---------- */
const machine6 = (dep, lend, policy = 9) => {
  let depMult = Math.max(0.6, Math.min(1.4, 0.6 + 0.08 * dep));
  if (dep < Math.min(8, policy - 4)) depMult *= 0.8;
  const deposits = 100e6 * depMult;
  const demand = 90e6 * Math.max(0.3, Math.min(1.5, 1.9 - 0.05 * lend));
  const loans = Math.min(demand, deposits * 0.8);
  const def = 0.02 + Math.max(0, lend - 18) * 0.005;
  const inc = loans * lend / 100, exp = deposits * dep / 100, bad = loans * def, costs = 3e6;
  return { deposits, demand, loans, inc, exp, bad, costs, profit: inc - exp - bad - costs, def, savers: Math.round(((depMult - 0.6) / 0.8) * 100) };
};
const dMin6 = (P) => Math.min(8, Math.max(1, P - 4));
const MISS6 = (P) => [
  { e: "🏛️", t: `The central bank sets the policy rate at ${P}%`, goal: `Your deposit rate must be at least ${dMin6(P)}% (or savers leave) and your lending rate at least ${P + 5}% — with profit above $0.`, ok: (d, l, M) => d >= dMin6(P) && l >= P + 5 && M.profit > 0 },
  { e: "🧲", t: "Attract more savers", goal: "Reach $115,000,000 in deposits — and keep a positive profit.", ok: (d, l, M) => M.deposits >= 115e6 && M.profit > 0 },
  { e: "🏁", t: "A competitive loan", goal: "Another bank offers loans at 15%. Set your lending rate at 15% or less — and keep a positive profit.", ok: (d, l, M) => l <= 15 && M.profit > 0 },
];
const RISKY6 = { q: "Carlos missed 3 payments last year and asks for a loan. Your normal lending rate is 16%. What do you do?", options: ["Add a risk premium — or offer a smaller loan", "Give him a lower rate than everybody else, because people with problems need the cheapest money", "Lend him double", "Ignore his history"], correct: 0, explain: "Higher risk → higher rate (risk premium) or a smaller amount. That's why good credit history saves you money!" };
const TWOBANK6 = [
  { tag: "TWO BANKS · CLIENT 1", q: "Bank Norte pays 6% a year but charges a $12,000 monthly fee. Bank Sur pays 4% and has no fee. Sara keeps $2,000,000. Which bank is better for Sara?", options: ["Bank Sur", "Bank Norte, because a higher interest rate is always the best option for every saver", "They are equal", "Neither"], correct: 0, hint: "Interest per month = 2,000,000 × rate ÷ 12. Then subtract the fee.", explain: "Norte: $10,000 − $12,000 = −$2,000. Sur: +$6,667." },
  { tag: "TWO BANKS · CLIENT 2", q: "Tomás keeps $20,000,000. Which bank is better for him?", options: ["Bank Norte", "Bank Sur, because a bank with no monthly fee is always cheaper for every type of client", "They are equal", "Neither"], correct: 0, hint: "20,000,000 × 6% ÷ 12 = ? minus 12,000.", explain: "Norte: $100,000 − $12,000 = $88,000. Sur: $66,667. Big balances → interest wins." },
  { tag: "TWO BANKS · YOUR TURN", q: "How much does Tomás earn per month with Bank Norte AFTER the fee?", answer: 88000, money: true, hint: "100,000 − 12,000", explain: "$88,000 per month." },
];
function InterestMachine({ resp, onSave, onExit }) {
  const P = resp?.c4_desk?.policy ?? D0.policy;
  const [dep, setDep] = useState(5);
  const [lend, setLend] = useState(18);
  const [mi, setMi] = useState(0);
  const [done, setDone] = useState([]);
  const [msg, setMsg] = useState(null);
  const [riskOk, setRiskOk] = useState(null);
  const [two, setTwo] = useState(null);
  const [st, finish] = useFinish(onSave);
  const M = machine6(dep, lend, P);
  const MS = MISS6(P);
  const cur = MS[mi];
  const check = () => { if (cur.ok(dep, lend, M)) { setDone([...done, { k: mi, dep, lend }]); setMsg({ ok: true, t: "Mission complete! ✅" }); } else setMsg({ ok: false, t: "Not yet — look at the goal and move the controls." }); };
  const nextM = () => { setMsg(null); setMi(mi + 1); };
  const allM = done.length >= MS.length;
  const coins = 18 + done.length * 4 + (riskOk === 0 ? 3 : 0) + (two ? two.firstTry * 2 : 0);
  if (st.done) return <Reward title="Pricing expert! 📈" subtitle={`Deposit ${dep}% · lending ${lend}% · spread ${(lend - dep).toFixed(1)} points`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Percent size={22} strokeWidth={2.1} />} title="The Interest Rate Machine 📈" subtitle={`You set the rates of YOUR District Bank. Policy rate (your Class 4 decision): ${P}%.`} onExit={onExit}>
      <Brief91 k="c6_machine" />
      <Steps91 labels={["1 · 3 missions", "2 · Risky borrower", "3 · Two banks"]} at={!allM ? 0 : riskOk === null ? 1 : 2} />
      <div className="start-block g91-machine">
        <Ctl l="📥 Deposit rate" v={dep} set={(v) => { setDep(v); setMsg(null); }} mn={1} mx={10} stp={0.5} fmt={(v) => `${v}%`} />
        <Ctl l="📤 Lending rate" v={lend} set={(v) => { setLend(v); setMsg(null); }} mn={8} mx={30} stp={0.5} fmt={(v) => `${v}%`} />
        <div className="g91-spread"><span>Spread</span><b>{(lend - dep).toFixed(1)} points</b><small>{lend}% − {dep}%</small></div>
        <div className="g91-mini"><span>💰 Deposits <b>{cop(M.deposits)}</b></span><span>📝 Loans <b>{cop(M.loans)}</b></span><span>📥 Interest income <b>{cop(M.inc)}</b></span><span>📤 Paid to savers <b>−{cop(M.exp)}</b></span><span>⚠️ Bad loans ({(M.def * 100).toFixed(1)}%) <b>−{cop(M.bad)}</b></span><span>👔 Costs <b>−{cop(M.costs)}</b></span><span className={M.profit >= 0 ? "pos" : "neg"}>💹 Profit <b>{cop(M.profit)}</b></span></div>
        <div className="g91-moods"><div><em>{M.savers >= 60 ? "😃" : M.savers >= 30 ? "🙂" : "😒"}</em><b>Savers</b><span>{M.savers >= 60 ? "“Great rate, I'll save here!”" : M.savers >= 30 ? "“It's OK…”" : "“I'm moving my money!”"}</span></div><div><em>{lend <= 15 ? "😃" : lend <= 20 ? "🙂" : "😠"}</em><b>Borrowers</b><span>{lend <= 15 ? "“Cheap credit, let's borrow!”" : lend <= 20 ? "“Expensive, but OK.”" : "“Too expensive — only risky people borrow now.”"}</span></div></div>
      </div>
      {!allM && (
        <div className="start-block">
          <div className="g83-event"><em>{cur.e}</em><div><b>Mission {mi + 1}/3 · {cur.t}</b><span>{cur.goal}</span></div></div>
          {msg && <div className={`p1-banner ${msg.ok ? "good" : "bad"}`}><span>{msg.t}</span></div>}
          <div className="p3-card-actions">{msg?.ok ? (mi < MS.length - 1 ? <button className="s1-btn primary" onClick={nextM}>Next mission <ChevronRight size={16} /></button> : null) : <button className="s1-btn primary" onClick={check}><Check size={16} /> Check mission</button>}</div>
        </div>
      )}
      {allM && <PickOne tag="⚠️ RISKY BORROWER" q={RISKY6.q} options={RISKY6.options} correct={RISKY6.correct} explain={RISKY6.explain} onRight={(w) => setRiskOk(w)} />}
      {allM && riskOk !== null && !two && <RoundsRunner rounds={TWOBANK6} doneLabel="Finish the challenge" onDone={setTwo} />}
      {two && <div className="p1-banner good"><Lightbulb size={18} /><span><b>Final rates of your District Bank:</b> deposits {dep}% · loans {lend}%. Adjust them now if you want — they will be saved. Your own balance earns your deposit rate for one year!</span></div>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!two} onClick={() => finish(coins, { dep, lend, spread: +(lend - dep).toFixed(1), profit: Math.round(M.profit), deposits: Math.round(M.deposits), policy: P, missions: done.length, risk: riskOk, twoBank: two?.firstTry })}>Save my rates <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
    </ActShell>
  );
}

/* ---------- ADVISOR PAGE 03 · My Bank Pricing Strategy ---------- */
function PricingPage({ resp, existing, onSave, onExit }) {
  const im = resp?.c6_machine;
  const [text, setText] = useState(existing?.text || "");
  const [who, setWho] = useState(existing?.who || "");
  const [st, finish] = useFinish(onSave);
  const G = [W_REASON, W_NUMBERS(2), W_RISK];
  if (st.done) return <Reward title="Advisor page 03 saved! 🧾" subtitle="My Bank Pricing Strategy." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<TrendingUp size={22} strokeWidth={2.1} />} title="My Bank Pricing Strategy 📈" subtitle="Advisor Page 03 · Your rates, your spread and your reasons." onExit={onExit}>
      <Brief91 k="c6_page" />
      <PBadge n="03" />
      {!im ? <div className="p1-banner bad"><span>Play the Interest Rate Machine first — this page uses your rates.</span></div> : (
        <>
          <div className="g84-results g91-results"><div><small>DEPOSIT RATE</small><b>{im.dep}%</b></div><div><small>LENDING RATE</small><b>{im.lend}%</b></div><div><small>SPREAD</small><b>{im.spread} pts</b></div><div><small>PROFIT / YEAR</small><b>{cop(im.profit)}</b></div></div>
          <div className="start-block">
            <h3>🎯 Who do my rates help most?</h3>
            <Tri value={who} onPick={setWho} opts={[["savers", "📥 Savers"], ["borrowers", "📤 Borrowers"], ["balance", "⚖️ A balance"]]} />
          </div>
          <div className="start-block">
            <h3>✍️ Explain your strategy</h3>
            <WordField value={text} onChange={setText} min={20} max={70} rows={4} placeholder="My deposit rate is …% because … My lending rate is …% because … One risk is …" goals={G} />
            <Starters items={["My deposit rate is", "because", "My spread is", "One risk is", "However,"]} onPick={appendStarter(setText)} />
            <p className="start-tip">💡 Remember: the spread is NOT all profit. It must pay savers, bad loans and salaries.</p>
          </div>
        </>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!im || !who || !goalsOk(text, 20, 70, G)} onClick={() => finish(26, { who, text, dep: im.dep, lend: im.lend, spread: im.spread })}>Save Advisor Page 03 <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 7 · THE LOAN COMMITTEE (juego estrella)
   ===================================================================== */
const DEC7 = [["approve", "✅ Approve"], ["smaller", "🔽 Offer a smaller loan"], ["info", "📂 Request more information"], ["reject", "⏸️ Not now — wait"]];
const FOLDERS7 = [
  { id: "camila", e: "🚗", n: "Camila, 24", ask: "Vehicle loan · $25,000,000", income: 3000000, exp: 2200000, debt: 0, amount: 25e6, rate: 0.015, months: 48, small: 15e6,
    docs: [
      { k: "income", e: "💵", t: "Income", lines: ["Laboratory assistant · same company for 2 years", "Salary: $3,000,000 per month (stable)"] },
      { k: "exp", e: "🧾", t: "Expenses", lines: ["Rent & utilities $900,000 · food $450,000", "Transport $250,000 · family $300,000 · other $300,000", "TOTAL: $2,200,000 per month"] },
      { k: "hist", e: "📜", t: "Credit history", lines: ["Never missed a loan payment", "Small credit card balance — paid in full every month"] },
      { k: "purpose", e: "🎯", t: "Purpose", lines: ["Used car: $35,000,000 · she saved $10,000,000", "Public transport takes almost 2 hours a day"] },
      { k: "debts", e: "📎", t: "Existing debts", lines: ["No fixed debt payments", "Credit card paid in full (no interest)"] },
      { k: "plan", e: "🗓️", t: "Repayment plan", lines: ["48 months · 1.5% per month", "Option: a cheaper car → borrow $15,000,000"] },
    ],
    best: "smaller", ok: "info",
    out: {
      approve: { q: "risky", t: "Month 5: the car needs a $600,000 repair. After the payment, Camila has only about $66,000 free each month — she misses a payment.", risk: 5e6 },
      smaller: { q: "good", t: "Camila buys a cheaper car. Her payment is about $441,000 — she still has room for emergencies and never misses a payment." },
      info: { q: "ok", t: "Camila brings a budget with the payment. Good — but the committee still has to decide the amount. A smaller loan was the clearest answer." },
      reject: { q: "bad", t: "Camila keeps losing 2 hours a day. The bank loses a responsible client with stable income and good history." },
    } },
  { id: "andres", e: "🥖", n: "Andrés, bakery owner", ask: "Business loan · $12,000,000", income: 1200000, exp: 0, debt: 0, amount: 12e6, rate: 0.02, months: 24, small: 6e6, business: true, low: 300000,
    docs: [
      { k: "income", e: "💵", t: "Sales", lines: ["Bakery open for 3 years · regular customers", "Sales: $5,000,000 to $8,000,000 per month (they change)", "Average profit: $1,200,000 · a bad month: $300,000"] },
      { k: "exp", e: "🧾", t: "Cash flow", lines: ["Some customers pay immediately…", "…others pay after 30 days → cash-flow problem"] },
      { k: "hist", e: "📜", t: "Credit history", lines: ["One small business loan, paid on time"] },
      { k: "purpose", e: "🎯", t: "Purpose", lines: ["Bigger oven + ingredients: $12,000,000", "A supermarket wants his bread every week (+$2,000,000 sales)"] },
      { k: "debts", e: "📎", t: "Existing debts", lines: ["No current loans"] },
      { k: "plan", e: "🗓️", t: "Repayment plan", lines: ["24 months · 2% per month", "⚠️ The supermarket agreement is NOT signed yet", "No plan B if sales are lower"] },
    ],
    best: "info", ok: "smaller",
    out: {
      approve: { q: "risky", t: "Three months later, the supermarket does not sign. Sales stay the same and, in a bad month, Andrés can't pay $634,000. The loan is in trouble.", risk: 12e6 },
      smaller: { q: "ok", t: "$6,000,000 for ingredients only: the payment fits most months. But without a plan B, the oven decision is still a guess." },
      info: { q: "good", t: "Andrés prepares a second plan with lower sales. The supermarket signs two weeks later — and the committee approves with real evidence." },
      reject: { q: "bad", t: "Andrés loses the opportunity. His business was healthy — it only needed a realistic plan." },
    } },
  { id: "valentina", e: "💳", n: "Valentina, 27", ask: "Personal loan · $5,000,000 for a vacation", income: 2800000, exp: 2000000, debt: 450000, amount: 5e6, rate: 0.022, months: 24, small: 2.5e6,
    docs: [
      { k: "income", e: "💵", t: "Income", lines: ["Marketing agency · salary $2,800,000 per month"] },
      { k: "exp", e: "🧾", t: "Expenses", lines: ["Rent, food, transport, subscriptions: $2,000,000 per month"] },
      { k: "hist", e: "📜", t: "Credit history", lines: ["❌ Missed 2 credit card payments", "Usually pays only the minimum"] },
      { k: "purpose", e: "🎯", t: "Purpose", lines: ["A vacation · not urgent, not productive"] },
      { k: "debts", e: "📎", t: "Existing debts", lines: ["Credit card balance: $4,500,000", "Minimum payment: $450,000 per month"] },
      { k: "plan", e: "🗓️", t: "Repayment plan", lines: ["24 months · 2.2% per month", "No budget, no plan for the card debt"] },
    ],
    best: "reject", ok: "info",
    out: {
      approve: { q: "risky", t: "After the trip, Valentina has two debts. She misses more payments and her debt keeps growing. Another loan created a bigger problem.", risk: 5e6 },
      smaller: { q: "risky", t: "A smaller loan is still a new debt for a vacation. Her card debt keeps growing.", risk: 2.5e6 },
      info: { q: "ok", t: "Her documents confirm the problem: first she must pay the card. Asking was OK — but the answer was clear: not now." },
      reject: { q: "good", t: "The committee helps Valentina build a repayment plan for her card. In 8 months her debt is much lower — then a trip is possible." },
    } },
];
const capOf7 = (f) => (f.business ? f.income : f.income - f.exp - f.debt);
function LoanCommittee({ onSave, onExit }) {
  const [ci, setCi] = useState(0);
  const [open, setOpen] = useState({});
  const [cap, setCap] = useState("");
  const [capOk, setCapOk] = useState({});
  const [dec, setDec] = useState({});
  const [why, setWhy] = useState({});
  const [shown, setShown] = useState({});
  const [st, finish] = useFinish(onSave);
  const F = FOLDERS7[ci];
  const opened = (open[F.id] || []).length;
  const pay = Math.round(pmt(F.amount, F.rate, F.months));
  const paySmall = Math.round(pmt(F.small, F.rate, F.months));
  const capV = capOf7(F);
  const d = dec[F.id];
  const O = d ? F.out[d] : null;
  const G = [W_REASON, W_NUMBERS(1)];
  const scoreOf = (f) => { const x = dec[f.id]; return (x === f.best ? 10 : x === f.ok ? 6 : 2) + Math.min(6, (open[f.id] || []).length) ; };
  const total = FOLDERS7.reduce((a, f) => a + (dec[f.id] ? scoreOf(f) : 0), 0);
  const checkCap = () => { if (Math.abs(num(cap) - capV) <= 1000) setCapOk({ ...capOk, [F.id]: true }); else setCapOk({ ...capOk, [F.id]: "no" }); };
  const save = () => {
    const lent = FOLDERS7.reduce((a, f) => a + (dec[f.id] === "approve" ? f.amount : dec[f.id] === "smaller" ? f.small : 0), 0);
    const bad = FOLDERS7.reduce((a, f) => a + (f.out[dec[f.id]]?.risk || 0), 0);
    const good = FOLDERS7.filter((f) => dec[f.id] === f.best).length;
    const approved = FOLDERS7.filter((f) => ["approve", "smaller"].includes(dec[f.id])).length;
    finish(14 + Math.round(total / 2), { decisions: dec, reasons: why, docs: Object.fromEntries(FOLDERS7.map((f) => [f.id, (open[f.id] || []).length])), lent, bad, good, approved, trustDelta: good * 3 - (bad > 0 ? 6 : 0), score: total });
  };
  if (st.done) return <Reward title="Committee closed! 🏦" subtitle={`${FOLDERS7.filter((f) => dec[f.id] === f.best).length}/3 best decisions · evidence score ${total}/48`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Gavel size={22} strokeWidth={2.1} />} title="The Loan Committee 🏦" subtitle="Open the folders, calculate the capacity to pay, decide — and live the consequences. Evidence wins points, not just the answer." onExit={onExit}>
      <Brief91 k="c7_committee" />
      <div className="g91-folders">{FOLDERS7.map((f, k) => <button key={f.id} type="button" className={`${k === ci ? "on" : ""} ${shown[f.id] ? "done" : ""}`} disabled={k > 0 && !shown[FOLDERS7[k - 1].id]} onClick={() => { setCi(k); setCap(""); }}><em>{shown[f.id] ? "✅" : f.e}</em><b>{f.n}</b><small>{f.ask}</small></button>)}</div>
      <div className="start-block">
        <h3>📂 Folder: {F.n} <span className="g84-count">{opened}/6 documents</span></h3>
        <p className="start-tip">Open at least 4 documents before you decide. Every document you read = more evidence points.</p>
        <div className="g91-docs">{F.docs.map((doc) => { const on = (open[F.id] || []).includes(doc.k); return (
          <button key={doc.k} type="button" className={on ? "on" : ""} onClick={() => !on && setOpen({ ...open, [F.id]: [...(open[F.id] || []), doc.k] })}>
            <em>{doc.e}</em><b>{doc.t}</b>{on ? <div>{doc.lines.map((l) => <p key={l}>{l}</p>)}</div> : <small>Tap to open</small>}
          </button>
        ); })}</div>
      </div>
      {opened >= 4 && (
        <div className="start-block">
          <h3>🧮 Capacity to pay</h3>
          <p className="quiz-q">{F.business ? "How much money is left for a loan payment in an AVERAGE month? (look at the Sales document)" : "Income − expenses − existing debt payments = ?"}</p>
          <div className="p2-answer-row"><span className="p2-unit">$</span><input className="start-input p2-num" type="number" inputMode="numeric" value={cap} disabled={capOk[F.id] === true} onChange={(e) => setCap(e.target.value)} placeholder="Your answer" /><button className="s1-btn primary" disabled={!cap || capOk[F.id] === true} onClick={checkCap}>Check <Check size={16} /></button></div>
          {capOk[F.id] === "no" && <div className="p1-hint">💡 {F.business ? "Average profit per month." : `${cop(F.income)} − ${cop(F.exp)}${F.debt ? ` − ${cop(F.debt)}` : ""}`}</div>}
          {capOk[F.id] === true && (
            <div className="g91-capbox">
              <div><small>FREE MONEY / MONTH</small><b>{cop(capV)}</b>{F.business && <span>bad month: {cop(F.low)}</span>}</div>
              <div className={pay > capV * 0.6 ? "no" : "ok"}><small>PAYMENT · FULL LOAN</small><b>{cop(pay)}</b><span>{Math.round((pay / capV) * 100)}% of the free money</span></div>
              <div className={paySmall > capV * 0.6 ? "no" : "ok"}><small>PAYMENT · SMALLER ({cop(F.small)})</small><b>{cop(paySmall)}</b><span>{Math.round((paySmall / capV) * 100)}% of the free money</span></div>
            </div>
          )}
        </div>
      )}
      {capOk[F.id] === true && (
        <div className="start-block">
          <h3>⚖️ Your decision</h3>
          <Tri value={d} onPick={(v) => !shown[F.id] && setDec({ ...dec, [F.id]: v })} disabled={!!shown[F.id]} opts={DEC7} />
          <WordField value={why[F.id] || ""} onChange={(v) => !shown[F.id] && setWhy({ ...why, [F.id]: v })} min={10} max={45} rows={2} placeholder="I decide this because… (use one number from the folder)" goals={G} />
          {!shown[F.id] ? <div className="p3-card-actions"><button className="s1-btn primary" disabled={!d || !goalsOk(why[F.id], 10, 45, G)} onClick={() => setShown({ ...shown, [F.id]: true })}><Hourglass size={16} /> Fast-forward 6 months</button></div> : (
            <div className={`g91-outcome ${O.q}`}><small>⏩ 6 MONTHS LATER</small><b>{O.q === "good" ? "Responsible decision ✅" : O.q === "ok" ? "Not bad — but not the best 🤔" : O.q === "risky" ? "The risk became real ⚠️" : "A missed opportunity ❌"}</b><p>{O.t}</p><span>Evidence score: {scoreOf(F)}/16 · best decision: {DEC7.find(([k]) => k === F.best)[1]}</span></div>
          )}
        </div>
      )}
      <div className="start-foot">
        {shown[F.id] && ci < FOLDERS7.length - 1 && <button className="s1-btn primary big" onClick={() => { setCi(ci + 1); setCap(""); }}>Next folder <ChevronRight size={18} /></button>}
        {FOLDERS7.every((f) => shown[f.id]) && <button className="s1-btn primary big" onClick={save}>Close the committee <span className="coin-tag"><Coins size={15} /> +{14 + Math.round(total / 2)}</span></button>}
      </div>
    </ActShell>
  );
}

/* ---------- BUILD YOUR CREDIT PROFILE · 12 meses (indicador ficticio) ---------- */
const MONTHS7 = [
  { t: "Mateo (22) gets his first credit card. Limit: $2,000,000.", a: ["Use it for one small purchase and pay it all", 6, 0], b: ["Buy sneakers for $1,500,000 right away", -4, 1500000] },
  { t: "The first bill arrives.", a: ["Pay the full balance on time", 8, "clear"], b: ["Pay only the minimum", -5, 0] },
  { t: "A friend's birthday trip costs $800,000.", a: ["Use savings — or skip it this time", 3, 0], b: ["Put it all on the card", -4, 800000] },
  { t: "Three stores offer him cards in one week.", a: ["Say “no, thanks”", 4, 0], b: ["Apply for all three", -8, 0] },
  { t: "His phone breaks: repair $300,000.", a: ["Use his emergency savings", 4, 0], b: ["Take a cash advance on the card (very expensive)", -6, 330000] },
  { t: "The payment date is in exam week.", a: ["Set an automatic payment", 5, 0], b: ["Forget it — late payment + fee", -10, 40000] },
  { t: "He receives a $600,000 bonus.", a: ["Use it to reduce his debt", 8, -600000], b: ["Spend it on a party", -2, 0] },
  { t: "The bank raises his limit to $4,000,000.", a: ["Keep using only a small part", 4, 0], b: ["Use most of the new limit", -8, 1500000] },
  { t: "Subscriptions add up to $120,000 a month.", a: ["Cancel the two he doesn't use", 3, 0], b: ["Keep them all on the card", -2, 120000] },
  { t: "“PRE-APPROVED! $3,000,000 for a gaming PC!”", a: ["Check his capacity and say no", 5, 0], b: ["Accept — it's pre-approved!", -8, 3000000] },
  { t: "A letter: one payment is late.", a: ["Call the bank and make a payment plan", 4, 0], b: ["Ignore the letters", -10, 60000] },
  { t: "December: last bill of the year.", a: ["Pay on time again", 6, 0], b: ["Pay the minimum again", -4, 0] },
];
function CreditHealth({ onSave, onExit }) {
  const [m, setM] = useState(0);
  const [h, setH] = useState([50]);
  const [debt, setDebt] = useState([0]);
  const [log, setLog] = useState([]);
  const [orders] = useState(() => MONTHS7.map(() => (Math.random() < 0.5 ? ["a", "b"] : ["b", "a"])));
  const [pickEnd, setPickEnd] = useState(null);
  const [st, finish] = useFinish(onSave);
  const H = h[h.length - 1], DB = debt[debt.length - 1];
  const choose = (k) => {
    const o = MONTHS7[m][k];
    let nd = DB * 1.025;
    if (o[2] === "clear") nd = 0; else nd = Math.max(0, nd + o[2]);
    const nh = Math.max(0, Math.min(100, H + o[1] - (nd > 2500000 ? 3 : 0)));
    setH([...h, nh]); setDebt([...debt, Math.round(nd)]); setLog([...log, { m: m + 1, k, t: o[0], d: o[1] }]); setM(m + 1);
  };
  const goodN = log.filter((x) => x.k === "a").length;
  const level = H >= 80 ? ["Excellent", "#16b074"] : H >= 60 ? ["Good", "#0b7a50"] : H >= 40 ? ["Fair", "#f5b23e"] : ["At risk", "#ff6b57"];
  if (st.done) return <Reward title="Credit profile built! 📊" subtitle={`Credit Health ${H}/100 · debt ${cop(DB)}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Activity size={22} strokeWidth={2.1} />} title="Build Your Credit Profile 📊" subtitle="12 months in Mateo's life. Each decision changes his Credit Health (a fictional, educational indicator) and his debt." onExit={onExit}>
      <Brief91 k="c7_credit" />
      <div className="g91-meters">
        <Bar91 label={`❤️ Credit Health · ${level[0]}`} value={H} color={level[1]} suffix="" />
        <div className="g91-mini"><span>📅 Month <b>{Math.min(m + 1, 12)}/12</b></span><span>💳 Debt <b>{cop(DB)}</b></span><span>✅ Good decisions <b>{goodN}</b></span></div>
      </div>
      {m < 12 ? (
        <div className="start-block">
          <div className="g83-event"><em>📅</em><div><b>Month {m + 1}</b><span>{MONTHS7[m].t}</span></div></div>
          <div className="quiz-options">{orders[m].map((k, pos) => <button key={k} type="button" className="quiz-opt" onClick={() => choose(k)}><span className="opt-key">{"AB"[pos]}</span><span className="opt-text">{MONTHS7[m][k][0]}</span></button>)}</div>
          {log.length > 0 && <p className={`g91-note ${log[log.length - 1].d >= 0 ? "pos" : "neg"}`}>Last month: {log[log.length - 1].t} → Credit Health {log[log.length - 1].d >= 0 ? "+" : ""}{log[log.length - 1].d}</p>}
        </div>
      ) : (
        <>
          <div className="start-block">
            <h3>📈 Mateo's year</h3>
            <LineChart series={[{ name: "Credit Health", color: "#16b074", values: h }]} labels={h.map((_, i) => (i === 0 ? "Start" : `M${i}`))} money={false} yMin={0} yMax={100} />
            <div className="g91-timeline">{log.map((x) => <div key={x.m} className={x.k === "a" ? "good" : "bad"}><small>Month {x.m} · {x.d >= 0 ? "+" : ""}{x.d}</small><span>{x.t}</span></div>)}</div>
          </div>
          <PickOne tag="REFLECTION" q="Which habit helped Mateo's Credit Health the most?" options={["Paying the full balance on time", "Applying for many cards and using all the credit limit so the bank sees he is active", "Paying the minimum", "Ignoring letters"]} correct={0} explain="Paying on time and in full is the strongest habit. Remember: real credit scores differ by country and lender — this indicator is only educational." onRight={setPickEnd} />
        </>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={m < 12 || pickEnd === null} onClick={() => finish(16 + goodN + (pickEnd === 0 ? 4 : 0), { health: H, debt: DB, good: goodN, path: log.map((x) => x.k).join("") })}>Save Mateo's profile <span className="coin-tag"><Coins size={15} /> +{16 + goodN + (pickEnd === 0 ? 4 : 0)}</span></button></div>
    </ActShell>
  );
}

/* ---------- ADVISOR PAGE 04 · Loan Decision Report ---------- */
const STR7 = ["Stable income", "Good credit history", "Has savings", "Clear purpose", "Productive purpose", "Regular customers"];
const RISKS7 = ["Payment uses most of the free money", "Unstable income", "Missed payments", "Existing debt", "Agreement not signed", "No plan B", "Not a productive purpose"];
function LoanReport({ resp, existing, onSave, onExit }) {
  const lc = resp?.c7_committee;
  const [who, setWho] = useState(existing?.who || "");
  const [str, setStr] = useState(existing?.strengths || []);
  const [risks, setRisks] = useState(existing?.risks || []);
  const [need, setNeed] = useState(existing?.need || "");
  const [advice, setAdvice] = useState(existing?.advice || "");
  const [st, finish] = useFinish(onSave);
  const F = FOLDERS7.find((f) => f.id === who);
  const tog = (arr, set, v, max) => set(arr.includes(v) ? arr.filter((x) => x !== v) : arr.length < max ? [...arr, v] : arr);
  const G = [W_ADVICE, W_REASON];
  const ok = F && str.length >= 1 && risks.length >= 1 && countWords(need) >= 4 && goalsOk(advice, 15, 60, G);
  if (st.done) return <Reward title="Advisor page 04 saved! 🧾" subtitle={`Loan Decision Report · ${F.n}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<FileText size={22} strokeWidth={2.1} />} title="Loan Decision Report 📝" subtitle="Advisor Page 04 · Choose one applicant and explain your decision like a committee member." onExit={onExit}>
      <Brief91 k="c7_page" />
      <PBadge n="04" />
      {!lc && <div className="p1-banner bad"><span>Do the Loan Committee first — your report uses your decisions.</span></div>}
      <div className="g91-folders">{FOLDERS7.map((f) => <button key={f.id} type="button" className={who === f.id ? "on" : ""} disabled={!lc} onClick={() => setWho(f.id)}><em>{f.e}</em><b>{f.n}</b><small>{lc ? `My decision: ${DEC7.find(([k]) => k === lc.decisions[f.id])?.[1] || "—"}` : f.ask}</small></button>)}</div>
      {F && (
        <>
          <div className="start-block"><h3>1 · Strengths (1–2)</h3><div className="g84-chips">{STR7.map((x) => <button key={x} type="button" className={str.includes(x) ? "on" : ""} onClick={() => tog(str, setStr, x, 2)}>{x}</button>)}</div></div>
          <div className="start-block"><h3>2 · Main risks (1–2)</h3><div className="g84-chips">{RISKS7.map((x) => <button key={x} type="button" className={risks.includes(x) ? "on" : ""} onClick={() => tog(risks, setRisks, x, 2)}>{x}</button>)}</div></div>
          <div className="start-block"><h3>3 · Capacity to pay</h3><div className="g84-results g91-results"><div><small>FREE MONEY</small><b>{cop(capOf7(F))}</b></div><div><small>FULL PAYMENT</small><b>{cop(Math.round(pmt(F.amount, F.rate, F.months)))}</b></div><div><small>MY DECISION</small><b>{DEC7.find(([k]) => k === lc.decisions[F.id])?.[1]}</b></div></div></div>
          <div className="start-block"><h3>4 · Information I still need</h3><input className="start-input" value={need} onChange={(e) => setNeed(e.target.value)} placeholder="Write one question for the applicant…" /></div>
          <div className="start-block"><h3>5 · My recommendation + one piece of advice</h3><WordField value={advice} onChange={setAdvice} min={15} max={60} rows={3} placeholder="I recommend … because … The applicant should …" goals={G} /><Starters items={["I recommend", "because", "The applicant should", "Before borrowing,"]} onPick={appendStarter(setAdvice)} /></div>
        </>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(26, { who, strengths: str, risks, need, advice, decision: lc.decisions[who] })}>Save Advisor Page 04 <span className="coin-tag"><Coins size={15} /> +26</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 8 · BANKING FOR EVERYONE + ADVISOR FAIR
   ===================================================================== */
const ENT8 = [
  { id: "amina", e: "🧵", n: "Amina", need: "a sewing machine", cost: 1200000, extra: 400000, free: 150000, story: "Amina sews by hand at home. With a machine she could make 4 times more clothes.", crisis: { e: "🤒", t: "Amina gets sick for 3 weeks — she can't sew." } },
  { id: "carlos", e: "🍉", n: "Carlos", need: "a bigger fruit cart and more stock", cost: 2000000, extra: 500000, free: 200000, story: "Carlos sells fruit near the bus station. Every afternoon he runs out of fruit.", crisis: { e: "🌧️", t: "Two weeks of rain: sales fall 30%." } },
  { id: "beatriz", e: "🥐", n: "Beatriz", need: "a small oven for her home bakery", cost: 3000000, extra: 600000, free: 250000, story: "Beatriz bakes in a borrowed oven. Neighbors and a school want her bread.", crisis: { e: "🌾", t: "The price of flour goes up 25%." } },
];
const FIN8 = [
  { id: "group", e: "🤝", n: "Microcredit (group loan)", rate: 0.025, d: "5 neighbors meet every week and support each other. No collateral. 2.5% per month." },
  { id: "shark", e: "🦈", n: "“Gota a gota” lender", rate: 0.2, d: "Cash today, no papers… 20% per month, daily collectors, threats." },
  { id: "bank", e: "🏦", n: "Traditional bank loan", rate: 0.018, d: "1.8% per month — but it asks for collateral and credit history." },
  { id: "save", e: "🐷", n: "Savings group (save first)", rate: 0, d: "No debt. Save the free money every month until you can buy it." },
];
const CRISIS8 = [
  { t: "Talk to the group or lender early and agree a temporary plan", q: "good" },
  { t: "Use a small emergency fund and cut other costs", q: "good" },
  { t: "Borrow from a “gota a gota” to pay this month and solve the problem quickly", q: "bad" },
  { t: "Hide and stop paying", q: "bad" },
];
const IMPACT8 = ["More family income", "A new job for a neighbor", "Products the community needs", "Women's economic independence", "Money stays in the neighborhood", "First credit history"];
function MicroMission({ existing, onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [plans, setPlans] = useState({});
  const [cur, setCur] = useState(0);
  const [fin, setFin] = useState(null);
  const [term, setTerm] = useState(12);
  const [bankNo, setBankNo] = useState(false);
  const [crisis, setCrisis] = useState({});
  const [cOrder] = useState(() => ENT8.map(() => shuffleArr([0, 1, 2, 3])));
  const [who, setWho] = useState("");
  const [imp, setImp] = useState([]);
  const [text, setText] = useState(existing?.card?.text || "");
  const [st, finish] = useFinish(onSave);
  const E = ENT8[cur];
  const cap = E.extra + E.free;
  const F = FIN8.find((f) => f.id === fin);
  const pay = F && F.rate ? Math.round(pmt(E.cost, F.rate, term)) : 0;
  const months = Math.ceil(E.cost / E.free);
  const helped = Object.values(plans).filter((p) => p.fin !== "shark").length;
  const goodC = Object.values(crisis).filter((k) => CRISIS8[k].q === "good").length;
  const W = ENT8.find((x) => x.id === who);
  const P = W ? plans[W.id] : null;
  const confirm = () => { setPlans({ ...plans, [E.id]: { fin, term: fin === "save" ? months : term, pay, total: fin === "save" ? E.cost : pay * term } }); setFin(null); setBankNo(false); setTerm(12); if (cur < ENT8.length - 1) setCur(cur + 1); else setStage(1); };
  const coins = 16 + helped * 3 + goodC * 2 + (Object.values(plans).every((p) => p.fin === "group") ? 2 : 0);
  if (st.done) return <Reward title="Impact created! 🤝" subtitle={`${helped}/3 entrepreneurs financed responsibly · Advisor Page 05 saved`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Handshake size={22} strokeWidth={2.1} />} title="Microfinance Mission 🤝" subtitle="Advisor Page 05 · Start small, grow smart. Help 3 entrepreneurs who can't get a normal bank loan." onExit={onExit}>
      <Brief91 k="c8_micro" />
      <PBadge n="05" />
      <Steps91 labels={["1 · Finance 3 projects", "2 · Crisis round", "3 · Impact card"]} at={stage} />
      {stage === 0 && (
        <>
          <div className="g91-ent"><em>{E.e}</em><div><b>{E.n} · needs {E.need}</b><span>{E.story}</span><div className="g91-use"><span>💰 Cost {cop(E.cost)}</span><span>📈 Extra profit with it {cop(E.extra)}/month</span><span>🪙 Free money today {cop(E.free)}/month</span></div></div><i>{cur + 1}/3</i></div>
          <div className="g91-fins">{FIN8.map((f) => <button key={f.id} type="button" className={`${fin === f.id ? "on" : ""} ${f.id === "bank" && bankNo ? "no" : ""}`} disabled={f.id === "bank" && bankNo} onClick={() => { if (f.id === "bank") { setBankNo(true); setFin(null); } else setFin(f.id); }}><em>{f.e}</em><b>{f.n}</b><small>{f.d}</small></button>)}</div>
          {bankNo && <div className="p1-banner bad"><span>🏦 “Sorry — no collateral, no credit history.” Just like the banks told Professor Yunus. Choose another option.</span></div>}
          {F && F.id !== "save" && (
            <div className="start-block">
              <Tri value={term} onPick={setTerm} opts={[[6, "6 months"], [12, "12 months"]]} />
              <div className="g91-capbox">
                <div><small>CAPACITY / MONTH</small><b>{cop(cap)}</b><span>extra profit + free money</span></div>
                <div className={pay > cap * 0.5 ? "no" : "ok"}><small>PAYMENT / MONTH</small><b>{cop(pay)}</b><span>{Math.round((pay / cap) * 100)}% of capacity</span></div>
                <div className={F.id === "shark" ? "no" : "ok"}><small>TOTAL REPAID</small><b>{cop(pay * term)}</b><span>cost of credit {cop(pay * term - E.cost)}</span></div>
              </div>
              {F.id === "shark" && <div className="p1-banner bad"><span>⚠️ {E.n} would pay {cop(pay * term - E.cost)} just in interest — and face threats if she/he is late. This is the trap Yunus found in the village.</span></div>}
              {F.id === "group" && pay > cap * 0.5 && <div className="p1-hint">💡 The payment uses more than half of the capacity. A longer term may be safer.</div>}
            </div>
          )}
          {F && F.id === "save" && <div className="p1-banner good"><span>🐷 No debt! Saving {cop(E.free)} a month, {E.n} can buy it in <b>{months} months</b>. Safe — but the opportunity waits.</span></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!F} onClick={confirm}>{cur < ENT8.length - 1 ? `Confirm and go to ${ENT8[cur + 1].n}` : "Confirm — crisis round!"} <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 1 && (
        <>
          <Mission e="⚡" title="Crisis round">Real life is not a spreadsheet. Help each entrepreneur adapt.</Mission>
          {ENT8.map((x, i) => (
            <div key={x.id} className="start-block">
              <div className="g83-event"><em>{x.crisis.e}</em><div><b>{x.n} · {FIN8.find((f) => f.id === plans[x.id]?.fin)?.n}</b><span>{x.crisis.t}{plans[x.id]?.fin === "shark" ? " The collector arrives every morning…" : ""}</span></div></div>
              <div className="quiz-options">{cOrder[i].map((k, pos) => <button key={k} type="button" disabled={crisis[x.id] != null} className={`quiz-opt ${crisis[x.id] === k ? (CRISIS8[k].q === "good" ? "correct" : "wrong") : ""}`} onClick={() => setCrisis({ ...crisis, [x.id]: k })}><span className="opt-key">{"ABCD"[pos]}</span><span className="opt-text">{CRISIS8[k].t}</span></button>)}</div>
              {crisis[x.id] != null && <p className={`g91-note ${CRISIS8[crisis[x.id]].q === "good" ? "pos" : "neg"}`}>{CRISIS8[crisis[x.id]].q === "good" ? "✅ Responsible: the project survives the bad month." : "❌ This turns a bad month into a debt trap."}</p>}
            </div>
          ))}
          <div className="start-foot"><button className="s1-btn primary big" disabled={Object.keys(crisis).length < 3} onClick={() => setStage(2)}>Create my impact card <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 2 && (
        <>
          <div className="start-block"><h3>Choose ONE entrepreneur for your card</h3><Tri value={who} onPick={setWho} opts={ENT8.map((x) => [x.id, `${x.e} ${x.n}`])} /></div>
          {W && (
            <>
              <div className="start-block"><h3>🌍 Impact (choose 2)</h3><div className="g84-chips">{IMPACT8.map((x) => <button key={x} type="button" className={imp.includes(x) ? "on" : ""} onClick={() => setImp(imp.includes(x) ? imp.filter((y) => y !== x) : imp.length < 2 ? [...imp, x] : imp)}>{x}</button>)}</div>
                <WordField value={text} onChange={setText} min={12} max={50} rows={3} placeholder={`This project can help the community because…`} goals={[W_REASON]} />
              </div>
              <div className="g91-impact" id="g91-impact">
                <header><em>{W.e}</em><div><small>🤝 MICROFINANCE IMPACT CARD · ADVISOR PAGE 05</small><b>{W.n} · {W.need}</b></div></header>
                <div className="g91-impact-grid">
                  <div><small>INVESTMENT</small><b>{cop(W.cost)}</b></div>
                  <div><small>FINANCING</small><b>{FIN8.find((f) => f.id === P.fin)?.n}</b></div>
                  <div><small>PAYMENT / CAPACITY</small><b>{P.fin === "save" ? `${P.term} months saving` : `${cop(P.pay)} / ${cop(W.extra + W.free)}`}</b></div>
                  <div><small>RISK</small><b>{W.crisis.t}</b></div>
                </div>
                <p>🌍 {imp.join(" · ") || "Choose 2 impacts"}</p>
                {text && <p className="g91-impact-say">“{text.trim()}”</p>}
              </div>
            </>
          )}
          <div className="start-foot"><button className="s1-btn ghost" disabled={!W} onClick={() => downloadPNG("g91-impact", "Impact_Card.png")}><Download size={16} /> PNG</button><button className="s1-btn primary big" disabled={!W || imp.length < 2 || !goalsOk(text, 12, 50, [W_REASON])} onClick={() => finish(coins, { plans, crisis, helped, goodCrisis: goodC, card: { who, impacts: imp, text } })}>Save Advisor Page 05 <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- ADVISOR FAIR · Financial Decision Guide + cliente secreto ---------- */
const CLIENTS8 = [
  { id: "juliana", e: "🎓", n: "Juliana, 23", d: "First job: $2,600,000 a month. Wants to save $6,000,000 for a course in 18 months. Uses her card many times a day.", prods: ["A low-fee savings account + automatic monthly saving", "A personal loan to pay the course today and repay it later with her salary", "A current account with an overdraft", "Keep cash at home"], best: 0, pillar: "mm" },
  { id: "perez", e: "🏠", n: "The Pérez family", d: "Need $8,000,000 to fix their roof before the rainy season. Income $4,200,000, expenses $3,300,000. Always paid on time.", prods: ["A loan with a payment that fits their $900,000 free money", "A “gota a gota” lender, because it is faster and asks for no papers at all", "Three credit cards", "Wait two years without a plan"], best: 0, pillar: "wb" },
  { id: "luis", e: "🏪", n: "Don Luis, small shop", d: "Needs a $5,000,000 fridge to sell cold drinks. Customers pay in cash. No business records.", prods: ["Start recording sales, then ask for a microcredit or business loan", "A big personal loan right now, without any records, because the fridge is urgent", "Take all the money from the family savings", "Ignore the idea"], best: 0, pillar: "ent" },
  { id: "rosa", e: "👵", n: "Rosa, 45", d: "Has never used a bank. Gets paid in cash and keeps it under the mattress. Afraid of “hidden fees”.", prods: ["A simple low-cost account and learning to use it safely", "An investment in crypto, because it can multiply her savings very quickly", "A credit card with a high limit", "Keep everything under the mattress"], best: 0, pillar: "glo" },
  { id: "kevin", e: "💳", n: "Kevin, 26", d: "Credit card debt: $3,000,000. Pays only the minimum. Gets “pre-approved loan” messages every day.", prods: ["A repayment plan: pay more than the minimum, stop new debt", "A new loan for a new phone, because new debt can help him feel better", "Ignore the debt", "Click on the “pre-approved” links"], best: 0, pillar: "dig" },
];
const PILLARS8 = [["mm", "💰 Money Management"], ["ent", "🚀 Entrepreneurship"], ["wb", "🧘 Financial Wellbeing"], ["dig", "📱 Digital Economy"], ["glo", "🌍 Global Citizenship"]];
const RUB8 = [["needs", "Understands the client's needs", 20], ["concepts", "Uses financial concepts correctly", 25], ["compare", "Compares alternatives", 20], ["risks", "Identifies risks", 20], ["comm", "Communicates the recommendation", 15]];
function AdvisorFair({ resp, studentName, existing, onSave, onExit }) {
  const r = resp || {};
  const D = districtOf(r);
  const [cid] = useState(() => existing?.client || CLIENTS8[Math.floor(Math.random() * CLIENTS8.length)].id);
  const C = CLIENTS8.find((c) => c.id === cid);
  const [order] = useState(() => shuffleArr(C.prods.map((_, k) => k)));
  const [prod, setProd] = useState(existing?.prod ?? null);
  const [alt, setAlt] = useState(existing?.alt ?? null);
  const [pillar, setPillar] = useState(existing?.pillar || "");
  const [text, setText] = useState(existing?.text || "");
  const [slide, setSlide] = useState(null);
  const [peer, setPeer] = useState(existing?.peer || "");
  const [stars, setStars] = useState(existing?.rubric || {});
  const [st, finish] = useFinish(onSave);
  const pages = PAGES91.filter((p) => r[p.key]).length;
  const G = [W_RECOMMEND, W_REASON, W_RISK];
  const total = Math.round(RUB8.reduce((a, [k, , mx]) => a + ((stars[k] || 0) / 5) * mx, 0));
  const first = (studentName || D.profile?.name || "Advisor").split(" ")[0];
  const ready = pages >= 3 && prod != null && alt != null && alt !== prod && pillar && goalsOk(text, 25, 80, G) && peer.trim().length >= 2 && RUB8.every(([k]) => stars[k]);
  const lines = [
    { e: "👋", t: "Hello", s: [`Hello! I'm ${first}, a financial advisor from the Financial District.`, `Today I want to help ${C.n}.`] },
    { e: "🔎", t: "The client's needs", s: [dot(C.d)] },
    { e: "✅", t: "My recommendation", s: prod != null ? [`I recommend this option: ${lowFirst(C.prods[prod])}.`, dot(text)] : [] },
    { e: "⚖️", t: "Alternatives", s: alt != null ? [`I compared it with another option: ${lowFirst(C.prods[alt])}.`, alt === C.best ? "" : "I don't recommend it, because it is riskier or more expensive for this client."].filter(Boolean) : [] },
    { e: "🏛️", t: "The pillar", s: pillar ? [`The most important pillar for this client is ${PILLARS8.find(([k]) => k === pillar)[1].slice(3)}.`] : [] },
    { e: "🧾", t: "My evidence", s: [r.c3_run ? `In my bank crisis, my bank ${r.c3_run.survived ? "survived" : "failed"} — I learned that trust and liquidity matter.` : "", r.c7_committee ? `In the Loan Committee I made ${r.c7_committee.good}/3 best decisions: credit is not extra income.` : "", r.c8_micro ? `In the Microfinance Mission I helped ${r.c8_micro.helped} entrepreneurs without loan sharks.` : ""].filter(Boolean) },
  ];
  const slides = [
    { k: "cover", node: <div className="g8-slide-cover"><small>FINANCIAL DISTRICT · ADVISOR FAIR · GRADE 9</small><h2>{C.e} Advice for {C.n}</h2><p className="g8-fp-sayline">🎤 {lines[0].s.join(" ")}</p></div> },
    ...lines.slice(1).map((l) => ({ k: l.t, node: <section className="g8-fp big"><h4><span>{l.e}</span>{l.t}</h4><div className="g8-fp-say"><small>🎤 I SAY</small>{l.s.map((t, k) => <p key={k}>{t}</p>)}</div></section> })),
    { k: "end", node: <div className="g8-slide-cover"><h2>“Credit is not extra income.”</h2><p className="g8-fp-sayline">🎤 Thank you! Do you have any questions?</p></div> },
  ];
  if (st.done) return <Reward title="Certified Financial Advisor! 🏆" subtitle={`${C.n} · peer score ${total}/100`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Award size={22} strokeWidth={2.1} />} title="Advisor Fair · Financial Advisor Battle 🏆" subtitle="You receive a SECRET client. Prepare your advice, present it in English, and a classmate scores you (100 points)." onExit={onExit}>
      <Brief91 k="c8_guide" />
      <HowTo>1) Read your secret client. 2) Choose the best option and compare it with one alternative. 3) Write your recommendation. 4) Press <b>Present</b> (about 2 minutes). 5) Give your tablet to the classmate who listened — they score you with the rubric.</HowTo>
      <div className="g91-portfolio">{PAGES91.map((p) => <span key={p.n} className={r[p.key] ? "on" : ""}><em>{r[p.key] ? p.e : "🔒"}</em><small>PAGE {p.n}</small><b>{p.t}</b></span>)}</div>
      {pages < 3 && <div className="p1-banner bad"><span>You need at least 3 of the 5 Advisor Pages to join the fair. You have {pages}.</span></div>}
      <div className="g91-secret"><small>🤫 YOUR SECRET CLIENT</small><div><em>{C.e}</em><div><b>{C.n}</b><span>{C.d}</span></div></div></div>
      <div className="start-block">
        <h3>1 · The best option for this client</h3>
        <div className="quiz-options">{order.map((k, pos) => <button key={k} type="button" className={`quiz-opt ${prod === k ? (k === C.best ? "correct" : "wrong") : ""}`} onClick={() => setProd(k)}><span className="opt-key">{"ABCD"[pos]}</span><span className="opt-text">{C.prods[k]}</span></button>)}</div>
        {prod != null && prod !== C.best && <div className="p1-hint">💡 Think again: is it safe, affordable and does it fit the client's needs?</div>}
      </div>
      <div className="start-block">
        <h3>2 · Compare with one alternative</h3>
        <div className="g84-chips">{order.filter((k) => k !== prod).map((k) => <button key={k} type="button" className={alt === k ? "on" : ""} onClick={() => setAlt(k)}>{C.prods[k]}</button>)}</div>
      </div>
      <div className="start-block">
        <h3>3 · The most important pillar</h3>
        <div className="g84-chips">{PILLARS8.map(([k, l]) => <button key={k} type="button" className={pillar === k ? "on" : ""} onClick={() => setPillar(k)}>{l}</button>)}</div>
      </div>
      <div className="start-block">
        <h3>4 · My recommendation</h3>
        <WordField value={text} onChange={setText} min={25} max={80} rows={4} placeholder="I recommend … because … One risk is … The client should …" goals={G} />
        <Starters items={["I recommend", "because", "One risk is", "Compared with", "The client should"]} onPick={appendStarter(setText)} />
      </div>
      <div className="g8-final g91-final" id="g8-final">
        <header><small>FINANCIAL DISTRICT · FINANCIAL DECISION GUIDE · INSTITUTO CREAR</small><h2>{C.e} {C.n}</h2><p>Advisor: <b>{studentName}</b> · {pages}/5 advisor pages</p></header>
        <div className="g8-fp-list">{lines.map((l, k) => <section key={l.t} className={`g8-fp ${l.s.length ? "" : "empty"}`}><h4><span>{l.e}</span>{k + 1}. {l.t}</h4>{l.s.length ? <div className="g8-fp-say"><small>🎤 I SAY</small>{l.s.map((t, j) => <p key={j}>{t}</p>)}</div> : <p className="g8-fp-empty">Complete this part above.</p>}</section>)}</div>
      </div>
      <div className="p3-card-actions"><button className="s1-btn primary" disabled={prod == null || !text} onClick={() => setSlide(0)}><Mic size={17} /> Present</button><button className="s1-btn ghost" onClick={() => downloadPNG("g8-final", `Advisor_${first}.png`)}><Download size={17} /> Download PNG</button></div>
      <div className="start-block g84-investor">
        <h3>🧑‍⚖️ Advisor Battle rubric · for the classmate who listened</h3>
        <input className="start-input p3-gap" value={peer} onChange={(e) => setPeer(e.target.value)} placeholder="Evaluator's name (your classmate)" />
        {RUB8.map(([k, l, mx]) => <div key={k} className="p3-rub"><div><b>{l}</b><small> · {mx} pts</small></div><span>{stars[k] ? `${Math.round((stars[k] / 5) * mx)}/${mx}` : ""}</span><div className="p3-stars">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={stars[k] >= n ? "on" : ""} onClick={() => setStars({ ...stars, [k]: n })}>★</button>)}</div></div>)}
        <div className="g91-total"><span>TOTAL</span><b>{total}/100</b></div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(50, { client: cid, prod, alt, best: prod === C.best, pillar, text, peer: peer.trim(), rubric: stars, total, pages })}>Get my certificate 🏆 <span className="coin-tag"><Coins size={15} /> +50</span></button></div>
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

/* ---------- BOSS · District Boss ---------- */
function BossDistrict({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [mis, setMis] = useState(0);
  return stage === 0 ? (
    <ActShell icon={<Swords size={22} strokeWidth={2.1} />} title="District Boss · Part 1 ⚔️" subtitle="5 applied missions from the whole period. You can try again after a hint." onExit={onExit}>
      <Brief91 k="c8_boss" />
      <RoundsRunner rounds={BOSS_MISSIONS91} doneLabel="Part 2: 10 questions" onDone={(x) => { setMis(x.firstTry); setStage(1); }} />
    </ActShell>
  ) : (
    <QuizRunner title={`District Boss · Part 2 (missions: ${mis}/5 ⭐)`} emoji="⚔️" questions={BOSS_Q91} pickCount={10} passThreshold={70} xpPerCorrect={4} xpComplete={10 + Math.round(mis * 4)} onSave={(x) => onSave({ ...x, missions: mis })} onExit={onExit} />
  );
}

/* =====================================================================
   ESTRUCTURA DEL PERIODO 1 · 9° (clases 1–8 · 4 actividades cortas por clase)
   ===================================================================== */
const A = (key, title, desc, icon, coins, bucket) => ({ key, title, desc, icon, coins, bucket });
const G9P1_WEEKS = [
  { n: 1, g: "1", title: "Welcome to the Financial District", blurb: "Your starting radar, a welcome podcast — and your District ID.", e: "🏙️", skills: ["Radar", "Listening"], acts: [
    A("c1_radar", "My Money Radar 9 🧭", "10 situations · your starting point for 9th grade.", <Compass size={22} />, 25, "comportamiento"),
    A("c1_starter", "Starter: District Words 🧱", "Bank, deposit, loan, interest, balance, trust.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c1_listen", "Listening: Welcome to the District 🎧", "Ms. Rivera explains the 5 pillars and the rules · 8 questions.", <Headphones size={22} />, 42, "quizzes"),
    A("c1_id", "My District ID 🪪", "Avatar, job — and the same account for everybody: $2,000,000.", <BadgeCheck size={22} />, 30, "aprendi"),
  ] },
  { n: 2, g: "2", title: "How a Bank Works", blurb: "Savers, borrowers and a bank in the middle — build one yourself.", e: "🏦", skills: ["Video", "Builder"], acts: [
    A("c2_starter", "Starter: Bank Words 🧱", "Asset, liability, reserve, interest income and expense.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c2_video", "Video: Money, Banking & Capital 🎬", "The village bank · 8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c2_rush", "Asset or Liability? Rush ⚡", "12 items · 3 boxes · 60 seconds.", <Zap size={22} />, 24, "aprendi"),
    A("c2_builder", "Village Bank Builder 🏦", "Rebuild the video bank — then choose YOUR reserve.", <Building2 size={22} />, 36, "aprendi"),
  ] },
  { n: 3, g: "3", title: "Bank Run!", blurb: "A rumor hits the District Bank. Can you keep trust and cash alive?", e: "🚨", skills: ["Video", "Simulator"], acts: [
    A("c3_starter", "Starter: Crisis Words 🧱", "Liquidity, solvency, fire sale, deposit insurance.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c3_video", "Video: Bank Runs 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c3_run", "Bank Run Simulator 🚨", "Depositor + manager · 5 events · trust and cash bars.", <ShieldAlert size={22} />, 40, "aprendi"),
    A("c3_report", "My Bank Crisis Report 🧾 · Page 01", "Cause, response and lesson.", <FileText size={22} />, 26, "aprendi"),
  ] },
  { n: 4, g: "4", title: "The Central Bank", blurb: "The bank of the banks: inflation, emergencies and one trusted currency.", e: "🏛️", skills: ["Video", "Missions"], acts: [
    A("c4_starter", "Starter: Central Bank Words 🧱", "Policy rate, inflation, independence, supervisor.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c4_video", "Video: Central Banking 🎬", "The Fed and why it exists · 8 questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c4_rush", "Who Does It? Rush ⚡", "Banco de la República · Superfinanciera · Fogafín · your bank.", <Zap size={22} />, 24, "aprendi"),
    A("c4_desk", "Central Bank Desk 🏛️", "Set the policy rate + 3 missions.", <Landmark size={22} />, 34, "aprendi"),
  ] },
  { n: 5, g: "5", title: "Two Accounts, Two Lives", blurb: "Daniel, Laura and the hidden costs of a bank account.", e: "💳", skills: ["Reading", "Detective"], acts: [
    A("c5_starter", "Starter: Account Words 🧱", "Savings, current, fees, overdraft, 4×1,000.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c5_read", "Reading: Two Accounts, Two Lives 📖", "Daniel and Laura · quiz (8 of 12).", <BookOpen size={22} />, 42, "quizzes"),
    A("c5_detective", "Account Detective 🔎", "4 clients + a surprise round + YOUR account.", <Search size={22} />, 36, "aprendi"),
    A("c5_page", "The Right Account 💳 · Page 02", "Recommendations for Daniel and Laura.", <CreditCard size={22} />, 26, "aprendi"),
  ] },
  { n: 6, g: "6", title: "The Price of Money", blurb: "Deposit rate, lending rate, spread — set the prices of your bank.", e: "📈", skills: ["Video", "Machine"], acts: [
    A("c6_starter", "Starter: Interest Words 🧱", "Deposit rate, lending rate, spread, risk premium.", <Lightbulb size={22} />, 20, "quizzes"),
    A("c6_video", "Video: How Banks Make Money 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c6_machine", "The Interest Rate Machine 📈", "3 missions + risky borrower + two banks.", <Percent size={22} />, 36, "aprendi"),
    A("c6_page", "My Pricing Strategy 📈 · Page 03", "Your rates and your reasons.", <TrendingUp size={22} />, 26, "aprendi"),
  ] },
  { n: 7, g: "7", title: "The Loan Committee", blurb: "Three folders, one question: can they repay without risk?", e: "📝", skills: ["Reading", "Committee"], acts: [
    A("c7_read", "Reading: The Loan Committee 📖", "Camila, Andrés and Valentina · quiz (8 of 12).", <BookOpen size={22} />, 42, "quizzes"),
    A("c7_committee", "The Loan Committee 🏦", "Open the folders · capacity to pay · decide · 6 months later.", <Gavel size={22} />, 40, "aprendi"),
    A("c7_credit", "Build Your Credit Profile 📊", "12 months in Mateo's life.", <Activity size={22} />, 32, "aprendi"),
    A("c7_page", "Loan Decision Report 📝 · Page 04", "Strengths, risks, capacity, recommendation.", <FileText size={22} />, 26, "aprendi"),
  ] },
  { n: 8, g: "8", title: "Banking for Everyone + Advisor Fair", blurb: "Microfinance, your secret client — and the District Boss.", e: "🤝", skills: ["Video", "Speaking"], acts: [
    A("c8_video", "Video: Muhammad Yunus & Grameen 🎬", "8 random questions (70%).", <Video size={22} />, 42, "quizzes"),
    A("c8_micro", "Microfinance Mission 🤝 · Page 05", "3 entrepreneurs · crisis round · impact card.", <Handshake size={22} />, 34, "aprendi"),
    A("c8_guide", "Advisor Fair 🏆", "Secret client · present · peer rubric (100 pts).", <Award size={22} />, 50, "aprendi"),
    A("c8_boss", "District Boss ⚔️", "5 missions + 10 questions (70%).", <Swords size={22} />, 70, "quizzes"),
  ] },
];
const ALL_ACTS91 = G9P1_WEEKS.flatMap((w) => w.acts);
const TOTAL_ACTS91 = ALL_ACTS91.length;
const PAGE_ACTS91 = [...PAGES91.map((p) => p.key), "c8_guide"];

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Periodo1G9 = ({ userData, API_URL, existingRow, onBack }) => {
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
  const resp = respRef.current || {};
  const doneCount = ALL_ACTS91.filter((a) => checklist[a.key]).length;
  const pctDone = Math.round((doneCount / TOTAL_ACTS91) * 100);
  const weekDone = (w) => w.acts.every((a) => checklist[a.key]);
  const coinsTotal = Math.round(points.comportamiento + points.quizzes + points.aprendi);

  const persist = (nextChecklist, nextPoints, respPatch) => {
    respRef.current = { ...respRef.current, ...respPatch };
    const done = ALL_ACTS91.filter((a) => nextChecklist[a.key]).length;
    const row = {
      Student_Key: userData.Student_Key, Semana: PERIOD_KEY, Grado: GRADE,
      Estado: done >= TOTAL_ACTS91 ? "completed" : "in_progress",
      Porcentaje: Math.round((done / TOTAL_ACTS91) * 100),
      Puntos_Comportamiento: nextPoints.comportamiento, Puntos_Quizzes: nextPoints.quizzes, Puntos_Aprendi: nextPoints.aprendi,
      Checklist_JSON: JSON.stringify(nextChecklist), Respuestas_JSON: JSON.stringify(respRef.current),
    };
    const prev = store.semanas?.[PERIOD_KEY];
    dispatch({ type: "save_progreso", payload: row }); // OPTIMISTA
    fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "save_progreso", data: row }) })
      .catch((e) => { console.error("Error guardando 9° Periodo 1:", e); dispatch({ type: "rollback_progreso", payload: { Semana: PERIOD_KEY, prev } }); });
  };
  const complete = (key, bucket, xp, respPatch, pass = true) => {
    const already = !!checklist[key];
    const nextChecklist = { ...checklist, [key]: already || pass };
    const nextPoints = already ? points : { ...points, [bucket]: points[bucket] + (xp || 0) };
    setChecklist(nextChecklist); setPoints(nextPoints);
    persist(nextChecklist, nextPoints, respPatch);
    return Promise.resolve();
  };
  const WRAP = "s1 p1 p2 p3 p4 g7 g72 g73 g74 g8 g82 g83 g84 g9 g91";

  if (act) {
    const def = ALL_ACTS91.find((a) => a.key === act);
    const exit = () => setAct(null);
    const save = (r) => complete(act, def.bucket, r.xp, { [act]: { ...r, at: nowISO() } }, r.passed !== false);
    const reading = (tag, title, subtitle, sections, glossary, questions, emoji) => (
      <ReadThen tag={tag} title={title} subtitle={subtitle} minutes={8} sections={[{ node: <Brief91 key="b" k={act} /> }, ...sections]} glossary={glossary} onExit={exit} finishLabel="I read it — start the quiz (8 questions)">
        <QuizRunner title={`${title} · check`} emoji={emoji} questions={questions} pickCount={8} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
      </ReadThen>
    );
    const video = (src, title, qs) => <VideoQuiz intro={<Brief91 k={act} />} src={src} title={title} questions={qs} pickCount={8} onSave={save} onExit={exit} />;
    const starter = (title, subtitle, data, coins = 20) => <StarterPack intro={<Brief91 k={act} />} title={title} subtitle={subtitle} cards={data.cards} pairs={data.pairs} rounds={data.rounds} coins={coins} onSave={save} onExit={exit} />;
    const rush = (title, subtitle, data, doneTitle, seconds = 60) => <SpeedSort intro={<Brief91 k={act} />} title={title} subtitle={subtitle} buckets={data.buckets} items={data.items} seconds={seconds} doneTitle={doneTitle} onSave={save} onExit={exit} />;
    let view = null;
    switch (act) {
      case "c1_radar": view = <Radar9 existing={resp.c1_radar} onSave={save} onExit={exit} />; break;
      case "c1_starter": view = starter("Starter: District Words 🧱", "The words every citizen needs.", START_1); break;
      case "c1_listen": view = <ListenAudio intro={<Brief91 k="c1_listen" />} src={audioWelcomeDistrict} title="Welcome to the Financial District" subtitle="Ms. Rivera, the district guide, welcomes the new citizens." script={LISTEN_1} questions={LQ_1} onSave={save} onExit={exit} />; break;
      case "c1_id": view = <DistrictID studentName={name} existing={resp.c1_id} onSave={save} onExit={exit} />; break;
      case "c2_starter": view = starter("Starter: Bank Words 🧱", "What a bank owns, what it owes, how it earns.", START_2); break;
      case "c2_video": view = video(VID_BANK1, "Money, Banking & Capital Markets", VQ_BANK1); break;
      case "c2_rush": view = rush("Asset or Liability? Rush ⚡", "Does the bank own it, owe it — or neither?", RUSH_2, "Balance-sheet pro! 🧮"); break;
      case "c2_builder": view = <BankBuilder onSave={save} onExit={exit} />; break;
      case "c3_starter": view = starter("Starter: Crisis Words 🧱", "Liquid is not the same as solvent.", START_3); break;
      case "c3_video": view = video(VID_RUN, "Bank Runs", VQ_RUN); break;
      case "c3_run": view = <BankRun resp={resp} onSave={save} onExit={exit} />; break;
      case "c3_report": view = <CrisisReport resp={resp} existing={resp.c3_report} onSave={save} onExit={exit} />; break;
      case "c4_starter": view = starter("Starter: Central Bank Words 🧱", "The bank of the banks.", START_4); break;
      case "c4_video": view = video(VID_CB, "Central Banking & the Fed", VQ_CB); break;
      case "c4_rush": view = rush("Who Does It? Rush ⚡", "Central bank, supervisor, deposit insurance or your bank?", RUSH_4, "Institution expert! 🏛️", 75); break;
      case "c4_desk": view = <CentralDesk onSave={save} onExit={exit} />; break;
      case "c5_starter": view = starter("Starter: Account Words 🧱", "Every account has a price.", START_5); break;
      case "c5_read": view = reading("READING · B1+ · STORY", "Two Accounts, Two Lives", "The story of Daniel and Laura.", READ_R1, GLOSS_R1, Q_R1, "💳"); break;
      case "c5_detective": view = <AccountDetective resp={resp} onSave={save} onExit={exit} />; break;
      case "c5_page": view = <AccountPage resp={resp} existing={resp.c5_page} onSave={save} onExit={exit} />; break;
      case "c6_starter": view = starter("Starter: Interest Words 🧱", "Money has a price: interest.", START_6); break;
      case "c6_video": view = video(VID_MONEY, "How Banks Make Money", VQ_MONEY); break;
      case "c6_machine": view = <InterestMachine resp={resp} onSave={save} onExit={exit} />; break;
      case "c6_page": view = <PricingPage resp={resp} existing={resp.c6_page} onSave={save} onExit={exit} />; break;
      case "c7_read": view = reading("READING · B1+ · CASE STUDY", "The Loan Committee", "Three people, three financial decisions.", READ_R2, GLOSS_R2, Q_R2, "📝"); break;
      case "c7_committee": view = <LoanCommittee onSave={save} onExit={exit} />; break;
      case "c7_credit": view = <CreditHealth onSave={save} onExit={exit} />; break;
      case "c7_page": view = <LoanReport resp={resp} existing={resp.c7_page} onSave={save} onExit={exit} />; break;
      case "c8_video": view = video(VID_GRAMEEN, "Microcredit & Grameen Bank", VQ_GRAMEEN); break;
      case "c8_micro": view = <MicroMission existing={resp.c8_micro} onSave={save} onExit={exit} />; break;
      case "c8_guide": view = <AdvisorFair resp={resp} studentName={name} existing={resp.c8_guide} onSave={save} onExit={exit} />; break;
      case "c8_boss": view = <BossDistrict onSave={save} onExit={exit} />; break;
      default: view = null;
    }
    return <div className={WRAP}>{view}</div>;
  }

  if (week) {
    const w = G9P1_WEEKS.find((x) => x.n === week);
    const wDone = w.acts.filter((a) => checklist[a.key]).length;
    const next = G9P1_WEEKS[G9P1_WEEKS.indexOf(w) + 1];
    return (
      <div className={WRAP}>
        <button className="s1-back" onClick={() => setWeek(null)}><ArrowLeft size={18} strokeWidth={2.4} /> Back to Period 1</button>
        <div className="s1-hero p1-week-hero g7-hero g8-hero g91-hero">
          <span className="s1-tag">{w.e} GRADE 9 · PERIOD 1 · CLASS {w.g}</span>
          <h1>{w.title}</h1>
          <p>{w.blurb}</p>
          <div className="s1-progress"><div className="bar"><i style={{ width: `${(wDone / w.acts.length) * 100}%` }} /></div><span className="pill">{wDone}/{w.acts.length}</span></div>
        </div>
        <DistrictPanel resp={resp} compact />
        <div className="s1-quest">
          {w.acts.map((a) => (
            <div key={a.key} className={`act-card ${checklist[a.key] ? "done" : ""} ${PAGE_ACTS91.includes(a.key) ? "g8-page-act" : ""} ${a.title.startsWith("Starter") ? "g8-starter-act" : ""} ${a.key.endsWith("_rush") ? "g8-rush-act" : ""} ${a.key.endsWith("_read") || a.key.endsWith("_video") || a.key.endsWith("_listen") ? "g73-learn-act" : ""}`}>
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
      <div className="s1-hero p1-hero g7-hero g8-hero g91-hero">
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> ADMIN PREVIEW · GRADE {GRADE} · PERIOD 1</span>
        <h1>The Financial District 🏙️</h1>
        <p>How can banking services, financial products and responsible decisions help young people build a secure financial future?</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pctDone}%` }} /></div><span className="pill">{pctDone}%</span></div>
        <div className="p1-hero-chips"><span><Coins size={14} /> {coinsTotal} coins</span><span><Check size={14} /> {doneCount}/{TOTAL_ACTS91} activities</span><span>🏦 District Bank</span><span>🧾 5 Advisor Pages</span><span>🏆 Certified Financial Advisor</span></div>
      </div>
      <div className="g8-howyear"><b>🧭 This period:</b><span>You are a new citizen of the Financial District. Everybody starts from zero: the same account ({cop(D0.me)}) and the same District Bank. In 8 classes you learn how banks work, survive a bank run, set interest rates, choose accounts, sit on the Loan Committee and finance small entrepreneurs. Every decision changes YOUR district — and five missions become Advisor Pages for the final Advisor Fair.</span></div>
      <DistrictPanel resp={resp} studentName={name} />
      {checklist.c8_guide && <button type="button" className="p3-card-link" onClick={() => setAct("c8_guide")}><Award size={18} /> See my Financial Decision Guide <ChevronRight size={16} /></button>}
      <div className="p1-passport">
        <div className="p1-passport-head"><b>🪪 District Pass</b><span>Finish a class to get its stamp</span></div>
        <div className="p1-stamps">{G9P1_WEEKS.map((w) => <button key={w.n} type="button" className={`p1-stamp ${weekDone(w) ? "done" : ""}`} onClick={() => setWeek(w.n)} title={w.title}><em>{w.e}</em><small>{w.g}</small></button>)}</div>
      </div>
      <div className="p1-weeks">
        {G9P1_WEEKS.map((w) => {
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