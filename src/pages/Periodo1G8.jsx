import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft, BookOpen, Video, Check, X, Coins, Trophy, Sparkles, Clock, ChevronRight, Lightbulb, Play,
  PenLine, Star, Users, Lock, Store, Scale, RefreshCw, Award, Puzzle, Mic, Target, Calculator,
  ShieldCheck, Plus, Minus, Trash2, Search, Swords, Rocket, Download, Printer, ShoppingCart, Globe,
  TrendingUp, TrendingDown, Headphones, Compass, BarChart3, LineChart as LineIcon, Flame, Map as MapIcon,
  Landmark, CreditCard, Smartphone, Briefcase, PiggyBank, Wallet, QrCode, Bell, KeyRound, Mail,
  FileText, Handshake, Zap, Eye, Unlock, AlertTriangle, Fingerprint, Calendar, Gauge, Home, Umbrella,
  Snowflake, Layers, Palette, Database, Shield, Send, Leaf, Crown, Newspaper, Gift, Activity, Pause, Receipt, Building2,
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
import "../Styles/octavo1.css";   // estilos nuevos de 8° · Periodo 1
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   GRADO 8 · PERIODO 1 · MY MONEY BLUEPRINT (B1)
   Personal Financial Planning & Budgeting · Clases 1–10
   Octavo empieza DESDE CERO: cada clase abre con un Starter (definiciones
   + juego fácil) y luego sube al nivel B1 (lectura, video, simulador).
   Hilo del periodo: FINANCIAL CITY + el MONEY BLUEPRINT (9 páginas + final).
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "8P1", Grado = "8".
   ===================================================================== */

const PERIOD_KEY = "8P1";
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
const BP_PAGES = [
  { n: "01", key: "c1_snapshot", t: "Money snapshot", e: "📸" },
  { n: "02", key: "c2_income", t: "Income map", e: "🗺️" },
  { n: "03", key: "c3_statement", t: "Expense profile", e: "🧾" },
  { n: "04", key: "c4_battle", t: "Balanced budget", e: "⚖️" },
  { n: "05", key: "c5_scanner", t: "Verified transaction", e: "🔍" },
  { n: "06", key: "c6_books", t: "Profit & loss report", e: "📒" },
  { n: "07", key: "c7_autopsy", t: "Spending dashboard", e: "📊" },
  { n: "08", key: "c8_sim", t: "Country comparison", e: "🌍" },
  { n: "09", key: "c9_rules", t: "Digital safety checklist", e: "🔐" },
];
function BlueprintPanel({ resp, compact, studentName }) {
  const r = resp || {};
  const done = BP_PAGES.filter((p) => r[p.key]).length;
  return (
    <div className={`g8-bp ${compact ? "compact" : ""}`}>
      <div className="g8-bp-head">
        <b>📐 My Money Blueprint{studentName && !compact ? ` · ${studentName.split(" ")[0]}` : ""}</b>
        <span>{done}/9 pages{r.c10_blueprint ? " · 🏆 complete" : ""}</span>
      </div>
      <div className="g8-bp-pages">
        {BP_PAGES.map((p) => (
          <div key={p.n} className={`g8-bp-page ${r[p.key] ? "done" : ""}`}><small>{p.n}</small><em>{r[p.key] ? p.e : "▫️"}</em><span>{p.t}</span></div>
        ))}
        <div className={`g8-bp-page final ${r.c10_blueprint ? "done" : ""}`}><small>10</small><em>{r.c10_blueprint ? "🏆" : "🔒"}</em><span>Final Blueprint</span></div>
      </div>
    </div>
  );
}
function BPBadge({ n }) {
  const p = BP_PAGES.find((x) => x.n === n);
  return <div className="g8-bpbadge"><span>📐 BLUEPRINT PAGE {p.n}</span><b>{p.e} {p.t}</b></div>;
}

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
   LECTURAS B1 (9) + 12 PREGUNTAS CADA UNA (se sortean 8)
   Estilo de opciones: la correcta · la que se parece pero no es ·
   la trampa (corta, “casi”) · la que no tiene nada que ver.
   ===================================================================== */

/* ---------- CLASE 1 · The Missing Money ---------- */
const READ_1 = [
  { sub: "A story about a first paycheck" },
  { p: "On Monday morning, Valentina received her first payment from her aunt's arepa business. She had worked during the weekend, taking orders, serving customers and cleaning tables. Her aunt paid her $400,000 Colombian pesos for her work." },
  { p: "Valentina felt proud. She had earned the money herself, and she immediately started making plans. She wanted new headphones, a jacket and a birthday present for her best friend. She also needed to pay for transportation and lunch during the following weeks." },
  { say: "“I have enough money for everything!” she told her friend Mateo." },
  { h: "One week, six purchases" },
  { node: <MiniTable head={["Day", "Purchase", "Amount"]} rows={[["Tuesday", "🎧 Headphones", "$120,000"], ["Wednesday", "🍔 Food with friends", "$35,000"], ["Thursday", "🧥 Jacket (on sale)", "$110,000"], ["Friday", "🚌 Transportation", "$20,000"], ["Friday", "🥤 Snacks and drinks", "$25,000"], ["Weekend", "🎬 Entertainment", "$40,000"]]} foot={["Total", "", "$350,000"]} /> },
  { p: "On Sunday night, Valentina opened her wallet and checked her banking app. She had only $50,000 left — and there were still three weeks in the month." },
  { say: "“Where did all my money go?” she asked." },
  { p: "Mateo looked at her list of purchases. “You know how much you earned, but did you decide how much you could spend?”" },
  { h: "The real mistake" },
  { p: "Valentina realized that she had confused having money with being able to afford everything she wanted. She had not planned for the whole month, and she had not separated her needs from her wants." },
  { p: "That night, she created her first financial plan. She wrote down her income, listed her expenses, chose a saving goal and decided how much she could spend each week." },
  { box: "Financial planning is not about having lots of money. It is about making informed decisions with the money you have." },
  { node: <MiniCase e="📝" who="Valentina's new plan" lines={["1. Write down my income", "2. List my needs first (bus, lunch)", "3. Choose a saving goal", "4. Decide a weekly spending limit"]} /> },
];
const GLOSS_1 = { "income": "Ingreso (dinero que recibes).", "expense": "Gasto.", "afford": "Poder pagar algo sin problemas.", "financial plan": "Plan financiero.", "saving goal": "Meta de ahorro.", "paycheck": "Pago por un trabajo." };
const Q_1 = [
  { q: "How much did Valentina earn for her weekend of work?", options: ["$400,000", "$450,000, because her aunt added a bonus for working hard", "$50,000", "Ten arepas"], correct: 0, feedback: "Her aunt paid her $400,000." },
  { q: "How much money did she have left on Sunday night?", options: ["$50,000", "$150,000, after paying for the bus and lunch", "$0", "Two jackets"], correct: 0, feedback: "Only $50,000 was left." },
  { q: "What did she buy on Thursday?", options: ["A jacket that was on sale", "A birthday present for her best friend, which was on sale", "Headphones", "A bicycle"], correct: 0, feedback: "Thursday: a jacket for $110,000." },
  { q: "What was Valentina's real mistake?", options: ["She didn't plan for the whole month", "She worked too many hours at her aunt's arepa business", "She spent money", "She lost her wallet"], correct: 0, feedback: "Spending is normal — the problem was no plan." },
  { q: "“She had confused having money with being able to afford everything.” This means she…", options: ["thought she could buy everything she wanted", "thought her aunt would pay her again the following weekend", "had no money", "wanted to be rich"], correct: 0, feedback: "Having money ≠ affording everything." },
  { q: "Which purchase was the most expensive?", options: ["The headphones", "The jacket, because it was the most expensive thing in the store", "Snacks", "The bus"], correct: 0, feedback: "Headphones: $120,000." },
  { q: "Which expenses were NEEDS?", options: ["Transportation and lunch", "The jacket and the headphones, because she used them every day", "Snacks", "Movies"], correct: 0, feedback: "She needs the bus and lunch to go to school." },
  { q: "According to the text, financial planning is about…", options: ["making informed decisions with the money you have", "having lots of money in the bank before you decide anything", "never spending", "working weekends"], correct: 0, feedback: "That is the main idea." },
  { q: "What did Valentina do on Sunday night?", options: ["She created her first financial plan", "She asked her aunt for an advance on next month's payment", "She cried", "She sold her jacket"], correct: 0, feedback: "She wrote her income, expenses, a goal and a weekly limit." },
  { q: "How much did she spend in total during the week?", options: ["$350,000", "$300,000, without counting the snacks and drinks", "$400,000", "$50,000"], correct: 0, feedback: "400,000 − 50,000 = 350,000." },
  { q: "Who asked, “Did you decide how much you could spend?”", options: ["Mateo, her friend", "Her aunt, the owner of the arepa business", "The bank", "Her teacher"], correct: 0, feedback: "Mateo asked the key question." },
  { q: "Which step is NOT part of Valentina's new plan?", options: ["Spending first and saving what is left", "Choosing a saving goal before spending her weekly money", "Listing needs", "Writing her income"], correct: 0, feedback: "Her new plan saves on purpose." },
];

/* ---------- CLASE 2 · The Journey of a Cup of Coffee ---------- */
const READ_2 = [
  { sub: "An economic report" },
  { p: "Every morning, thousands of people in Colombia buy coffee. Some drink it at home, while others visit a café before work or school. A simple cup of coffee connects farmers, factory workers, drivers, shop owners and customers." },
  { h: "Step 1 · The farm (primary sector)" },
  { p: "The journey begins on a farm. Farmers grow coffee plants, collect the coffee cherries and prepare the beans. They depend on land, water, tools and their own work. This activity belongs to the primary sector because it obtains products from nature." },
  { h: "Step 2 · The factory (secondary sector)" },
  { p: "Next, the beans travel to a processing plant. Workers clean, roast and package them. Machines and energy transform the raw product into something that is ready to sell. This is the secondary sector, which includes manufacturing and construction." },
  { h: "Step 3 · The café (tertiary sector)" },
  { p: "Finally, the coffee reaches a supermarket or café. Employees prepare drinks, serve customers and receive payments. These activities belong to the tertiary sector, which provides services and sells products." },
  { node: <MiniTable head={["Sector", "What it does", "Coffee example"]} rows={[["🌱 Primary", "Takes products from nature", "Coffee farm"], ["🏭 Secondary", "Transforms raw materials", "Roasting plant"], ["🛍️ Tertiary", "Sells and gives services", "Café, supermarket"], ["🔬 Quaternary", "Creates knowledge", "Lab that improves seeds"], ["👔 Quinary", "Makes top decisions", "CEO of a coffee company"]]} /> },
  { h: "Money travels too" },
  { p: "Money moves between these people and businesses. A café pays suppliers for coffee beans, employees receive salaries, and customers pay for their drinks. Each person or company has different sources of income and different expenses." },
  { p: "However, earning money does not always mean making a profit. A café might sell many cups of coffee but still lose money if rent, salaries, ingredients and electricity cost too much." },
  { box: "When a customer buys a cup of coffee, the payment supports a much longer economic journey than most people imagine." },
  { h: "Sources of income" },
  { node: <MiniTable head={["Type", "Meaning", "Example"]} rows={[["💼 Active income", "You work to earn it", "Salary, tips, selling arepas"], ["🌙 Passive income", "It arrives with little daily work", "Rent from an apartment, interest"], ["🎁 Allowance / gifts", "Money given to you", "Weekly allowance, birthday money"]]} /> },
];
const GLOSS_2 = { "primary sector": "Sector primario (de la naturaleza).", "secondary sector": "Sector secundario (transforma).", "tertiary sector": "Sector terciario (servicios).", "raw product": "Materia prima.", "supplier": "Proveedor.", "profit": "Ganancia.", "source of income": "Fuente de ingreso." };
const Q_2 = [
  { q: "Why is a coffee farm in the primary sector?", options: ["It obtains products from nature", "It transforms products from nature into packages for supermarkets", "It sells coffee", "It is the first business"], correct: 0, feedback: "Primary = from nature." },
  { q: "What happens in the secondary sector?", options: ["Raw products are transformed", "Raw products are collected directly from the land by farmers", "Drinks are served", "People study"], correct: 0, feedback: "Clean, roast, package = transform." },
  { q: "A barista who serves coffee works in the…", options: ["tertiary sector", "secondary sector, because coffee is a product", "primary sector", "quinary sector"], correct: 0, feedback: "Serving = a service." },
  { q: "According to the report, a café can sell many cups and still…", options: ["lose money", "close at night because there are no customers left", "win", "grow coffee"], correct: 0, feedback: "If costs are too high, it loses money." },
  { q: "Which of these is an EXPENSE for a café?", options: ["Rent and electricity", "The money customers pay for their drinks every day", "Profit", "Tips"], correct: 0, feedback: "Customer payments are income, not expenses." },
  { q: "Who pays the supplier of coffee beans?", options: ["The café", "The customer, directly to the farmer", "The government", "Nobody"], correct: 0, feedback: "The café buys beans from suppliers." },
  { q: "What connects farmers, factory workers and shop owners?", options: ["The journey of the coffee and the money", "The same salary that all of them receive every month", "The bus", "Coffee shops"], correct: 0, feedback: "Products and money travel through many hands." },
  { q: "A lab that improves coffee seeds is in the…", options: ["quaternary sector (knowledge)", "primary sector, because it works with plants and seeds", "tertiary sector", "it has no sector"], correct: 0, feedback: "Research = quaternary." },
  { q: "Which is ACTIVE income?", options: ["Money from selling arepas", "Money from renting an apartment you own", "A gift", "A loan"], correct: 0, feedback: "You work to earn it." },
  { q: "Rent that you receive every month from an apartment is…", options: ["passive income", "active income, because you receive it every month", "an expense", "a salary"], correct: 0, feedback: "It arrives with little daily work." },
  { q: "“Earning money does not always mean making a profit.” Why?", options: ["Costs can be bigger than income", "Customers sometimes forget to pay the café for their coffee", "Profit is illegal", "Money disappears"], correct: 0, feedback: "Profit = income − costs." },
  { q: "What is the main idea of the report?", options: ["Many jobs and sectors depend on one another", "Coffee is the most expensive drink in Colombian cafés", "Farmers are rich", "Cafés are bad"], correct: 0, feedback: "One payment supports a long journey." },
];

/* ---------- CLASE 3 · The Shopping Trap (chat + diario) ---------- */
const READ_3 = [
  { sub: "A group chat and a diary" },
  { node: <ChatThread title="Friday, 6:42 p.m. — Group chat" msgs={[{ who: "Mia", t: "Guys, look at these sneakers! They are 40% off 👟🔥" }, { who: "Daniel", t: "My old sneakers are still fine, but those look amazing.", me: true }, { who: "Sofia", t: "I want them too. The sale ends tonight! ⏰" }, { who: "Daniel", t: "I only have $150,000 left until next Friday. I need bus money and lunch.", me: true }, { who: "Mia", t: "Just buy them now. You can save money next week 😉" }]} /> },
  { h: "Daniel's diary · Saturday" },
  { p: "On Saturday, Daniel checked his expenses. He paid $50,000 for transportation, $60,000 for lunches and $30,000 for his phone plan. He also wanted to buy a birthday gift for his cousin." },
  { p: "Daniel started to understand the difference between a need and a want. Transportation and lunch were important expenses. The sneakers were a want because his old pair still worked." },
  { h: "Fixed or variable?" },
  { p: "He also discovered another difference. His phone plan cost the same amount every month, so it was a fixed expense. His spending on snacks changed from week to week, making it a variable expense." },
  { node: <MiniTable head={["", "Need", "Want"]} rows={[["Fixed (same every month)", "📱 Phone plan for school", "🎬 Streaming subscription"], ["Variable (it changes)", "🚌 Bus, 🍱 lunch", "🍫 Snacks, 👟 sneakers"]]} /> },
  { p: "That afternoon, Daniel found another problem. He had bought small snacks almost every day without paying much attention to their total cost. Each purchase seemed cheap, but together they used a large part of his money." },
  { h: "Three questions before spending" },
  { list: ["Do I need it?", "Can I afford it?", "Is there something more important I should pay for first?"] },
  { p: "Daniel did not decide that buying things was always bad. He decided not to buy the sneakers that weekend and created a list of the money he would need before his next payment." },
  { box: "The next time a sale appeared on his phone, he would make the decision — instead of letting the countdown make it for him." },
];
const GLOSS_3 = { "need": "Necesidad.", "want": "Deseo / gusto.", "fixed expense": "Gasto fijo (igual cada mes).", "variable expense": "Gasto variable (cambia).", "countdown": "Cuenta regresiva.", "afford": "Poder pagar." };
const Q_3 = [
  { q: "Why did Mia say “Just buy them now”?", options: ["Because the sale ended that night", "Because Daniel had extra money saved from his last birthday", "Because they were free", "Because Daniel lost his shoes"], correct: 0, feedback: "Urgency: the countdown." },
  { q: "Why were the sneakers a WANT?", options: ["His old pair still worked", "They were 40% off and the sale ended that same night", "They were expensive", "Mia told him"], correct: 0, feedback: "He didn't need new ones." },
  { q: "His phone plan is a fixed expense because…", options: ["it costs the same every month", "he uses it every day to talk to his friends and family", "it is cheap", "it is a want"], correct: 0, feedback: "Fixed = same amount." },
  { q: "His spending on snacks is…", options: ["variable", "fixed, because he buys snacks almost every day", "a need", "income"], correct: 0, feedback: "It changes week to week." },
  { q: "How much money did Daniel have until next Friday?", options: ["$150,000", "$140,000, after paying the phone plan", "$40,000", "Nothing"], correct: 0, feedback: "He said $150,000." },
  { q: "How much did he pay for transportation + lunches + phone?", options: ["$140,000", "$150,000, including the birthday gift for his cousin", "$110,000", "$60,000"], correct: 0, feedback: "50,000 + 60,000 + 30,000." },
  { q: "What was the “small” problem Daniel found?", options: ["Many cheap snacks added up to a lot", "He paid too much for his phone plan every single month", "He lost money", "He had no lunch"], correct: 0, feedback: "Small purchases add up." },
  { q: "Which is one of Daniel's three questions?", options: ["Can I afford it?", "Can my friends afford it before the sale ends?", "Is it cool?", "What color is it?"], correct: 0, feedback: "Need it? Afford it? Something more important?" },
  { q: "What did Daniel decide about buying things?", options: ["Buying is fine if you decide carefully", "Buying things is always bad and he should never spend money", "Buy everything on sale", "Ask Mia"], correct: 0, feedback: "Not always bad — just decide." },
  { q: "“Letting the countdown make the decision” means…", options: ["buying because of time pressure", "waiting until the sale is over to compare the prices calmly", "using a clock", "never buying"], correct: 0, feedback: "Urgency is a sales trick." },
  { q: "A streaming subscription is a…", options: ["fixed want", "variable need, because the price can change every year", "fixed need", "variable want"], correct: 0, feedback: "Same price monthly, but not necessary." },
  { q: "What did Daniel do instead of buying the sneakers?", options: ["He listed the money he would need", "He borrowed money from Sofia to buy them next week", "He bought two pairs", "He cancelled his phone"], correct: 0, feedback: "He made a list before his next payment." },
];

/* ---------- CLASE 4 · The Budget That Broke on Tuesday ---------- */
const READ_4 = [
  { sub: "A decision case" },
  { p: "Andrés received $600,000 for a month of helping at his uncle's store. He wanted to save for a new bicycle, but he also had transportation costs, lunches and a school trip coming soon." },
  { p: "On Sunday, Andrés made his first budget. He planned to spend $250,000 on needs, $150,000 on wants and save $200,000. His plan added up to $600,000, so he felt confident." },
  { node: <MiniTable head={["Andrés' first budget", "Amount", "%"]} rows={[["🏠 Needs", "$250,000", "42%"], ["🎉 Wants", "$150,000", "25%"], ["🐷 Savings", "$200,000", "33%"]]} foot={["Total", "$600,000", "100%"]} /> },
  { h: "Tuesday: the surprise" },
  { p: "On Tuesday, however, his bicycle broke. The repair cost $80,000, and he needed the bicycle to travel to school. He had not included emergency expenses in his budget." },
  { p: "Andrés had three choices. He could take the money from his savings, reduce his spending on wants, or ask his family for help. Each choice had a different consequence." },
  { h: "Two budgeting methods" },
  { p: "His friend Laura explained the 50/30/20 rule. It is a guideline that divides income into needs (50%), wants (30%) and savings or debt payments (20%). However, the percentages are not a law. Someone with high transportation costs or a low income may need a different plan." },
  { p: "Laura also showed him a zero-based budget. In this method, every peso is assigned a purpose. The money can go to expenses, savings or other planned uses, but the final balance should equal zero. This does NOT mean spending all the money." },
  { node: <MiniTable head={["Method", "How it works", "Andrés' $600,000"]} rows={[["50 / 30 / 20", "Percentages", "$300,000 · $180,000 · $120,000"], ["Zero-based", "Every peso has a job", "Income − all planned uses = $0"]]} /> },
  { h: "The new plan" },
  { p: "Andrés changed his plan. He reduced his entertainment budget, paid for the repair and kept a smaller amount for savings. He also created an emergency category for the next month." },
  { box: "A good budget is not a perfect prediction. It is a plan that can change when circumstances change." },
];
const GLOSS_4 = { "budget": "Presupuesto.", "50/30/20 rule": "Regla 50/30/20.", "zero-based budget": "Presupuesto base cero.", "emergency": "Emergencia / imprevisto.", "guideline": "Guía (no es una ley).", "balance": "Saldo." };
const Q_4 = [
  { q: "How much did Andrés receive for his month of work?", options: ["$600,000", "$680,000, including the money for the bicycle repair", "$200,000", "$80,000"], correct: 0, feedback: "$600,000 from his uncle's store." },
  { q: "What was missing in his first budget?", options: ["An emergency category", "A category for wants, like games and entertainment with friends", "Savings", "Income"], correct: 0, feedback: "He didn't plan for surprises." },
  { q: "How much did the bicycle repair cost?", options: ["$80,000", "$800,000, the price of a new bicycle", "$8,000", "$200,000"], correct: 0, feedback: "The repair was $80,000." },
  { q: "With 50/30/20 and $600,000, savings would be…", options: ["$120,000", "$180,000, which is thirty percent of the income", "$200,000", "$60,000"], correct: 0, feedback: "20% of 600,000." },
  { q: "According to Laura, the 50/30/20 percentages are…", options: ["a guideline, not a law", "a law that every family must follow exactly every month", "wrong", "only for adults"], correct: 0, feedback: "You can adapt them." },
  { q: "In a zero-based budget, the final balance should be…", options: ["zero, because every peso has a job", "zero, because you must spend all your money before the end of the month", "positive", "negative"], correct: 0, feedback: "Zero ≠ spending everything. Savings is also a job!" },
  { q: "Which was NOT one of Andrés' three choices?", options: ["Buying a new bicycle with a loan", "Asking his family for help with part of the repair", "Using savings", "Reducing wants"], correct: 0, feedback: "The three choices: savings, wants, family." },
  { q: "What did Andrés finally do?", options: ["Cut entertainment and paid the repair", "Took all his savings and cancelled his saving goal forever", "Nothing", "Sold his bicycle"], correct: 0, feedback: "He adjusted the plan." },
  { q: "His first budget was balanced, but…", options: ["it was not ready for real life", "it was not balanced mathematically because it added up to more than $600,000", "it had no savings", "it was perfect"], correct: 0, feedback: "Math ✓, real life ✗." },
  { q: "What percentage of his first budget was savings?", options: ["About 33%", "About 25%, the same as his wants", "50%", "20%"], correct: 0, feedback: "200,000 ÷ 600,000 ≈ 33%." },
  { q: "Who might need a different plan than 50/30/20?", options: ["Someone with very high transport costs", "Someone who wants to save more money for a bicycle", "Everybody", "Nobody"], correct: 0, feedback: "High needs → adapt the percentages." },
  { q: "The main lesson of the story is that a good budget…", options: ["can change when life changes", "must never change once you write it on Sunday", "is impossible", "needs no savings"], correct: 0, feedback: "Flexible plans survive surprises." },
];

/* ---------- CLASE 5 · The Supermarket Mystery ---------- */
const DOC_CAMILA = { kind: "tirilla", store: "SUPERMERCADO EL ROBLE", sub: "Calle 45 #12-30 · Bogotá", label: "RECEIPT", lines: [{ t: "Notebooks x3", v: "$18,000" }, { t: "Markers (pack)", v: "$12,000" }, { t: "Folder", v: "$5,000" }, { t: "Glue stick", v: "$5,000" }, { t: "TOTAL", v: "$40,000", kind: "tot" }], foot: "Thank you for your purchase!" };
const READ_5 = [
  { sub: "An investigation file" },
  { p: "Camila went to a supermarket to buy supplies for a school project. She selected notebooks for $18,000, markers for $12,000 and a folder for $5,000. At the checkout, the cashier gave her a receipt showing a total of $40,000." },
  { node: <ReceiptDoc doc={DOC_CAMILA} /> },
  { p: "Camila checked the numbers. The products added up to $35,000, not $40,000. She wondered if the supermarket had charged her incorrectly." },
  { h: "Receipt, invoice or voucher?" },
  { node: <MiniTable head={["Document", "What it proves"]} rows={[["🧾 Receipt", "That you paid. It shows products, prices and the amount paid."], ["📄 Invoice (factura)", "A sale. It identifies the seller, the buyer, taxes and ID numbers (NIT)."], ["💳 Voucher / payment proof", "That a card or transfer payment was approved."]]} /> },
  { p: "Camila asked for help instead of immediately accusing the cashier. They checked the receipt together and discovered an extra item that she had not purchased: a glue stick for $5,000." },
  { h: "What about taxes?" },
  { p: "They also reviewed the tax information. In Colombia, IVA means Impuesto sobre el Valor Agregado, or value-added tax (VAT). The standard rate is generally 19%, although some goods and services have different treatment. A customer should not assume that every item has the same tax rate." },
  { node: <MiniCase e="🧮" who="Example: an item with 19% IVA" lines={["Price before tax: $10,000", "IVA 19%: $1,900", "Total: $11,900"]} /> },
  { p: "The cashier corrected the transaction and gave Camila an updated receipt. She kept the document because it proved what she had paid." },
  { box: "A careful customer reads the details before accepting a charge, and a responsible business keeps accurate records." },
];
const GLOSS_5 = { "receipt": "Recibo / tirilla.", "invoice": "Factura.", "voucher": "Comprobante (de pago con tarjeta).", "VAT": "IVA (impuesto al valor agregado).", "subtotal": "Subtotal (antes de impuestos).", "checkout": "Caja / pago.", "charge": "Cobro." };
const Q_5 = [
  { q: "How much should Camila have paid?", options: ["$35,000", "$40,000, the total on the receipt", "$45,000", "$18,000"], correct: 0, feedback: "18,000 + 12,000 + 5,000." },
  { q: "What was the error on the receipt?", options: ["An extra item she didn't buy", "The price of the notebooks was wrong by $5,000", "No date", "A wrong name"], correct: 0, feedback: "A glue stick for $5,000." },
  { q: "What did Camila do first?", options: ["She asked for help to check it", "She accused the cashier of stealing in front of everybody", "She left", "She paid again"], correct: 0, feedback: "Respectful and careful." },
  { q: "A receipt proves that…", options: ["you paid for something", "the seller paid taxes to the government last year", "you are rich", "the product is good"], correct: 0, feedback: "Proof of payment." },
  { q: "Which document identifies the seller, the buyer and taxes?", options: ["An invoice (factura)", "A receipt, because it shows the prices of the products", "A menu", "A voucher"], correct: 0, feedback: "Invoices have more legal details." },
  { q: "What does IVA mean?", options: ["Value-added tax", "Interest on savings accounts paid by banks", "A discount", "A store name"], correct: 0, feedback: "Impuesto sobre el Valor Agregado." },
  { q: "The standard IVA rate in Colombia is generally…", options: ["19%", "19% for every single product in every store", "10%", "50%"], correct: 0, feedback: "Generally 19% — but not every item." },
  { q: "An item costs $10,000 before a 19% tax. The total is…", options: ["$11,900", "$10,190, adding nineteen pesos per thousand", "$19,000", "$10,000"], correct: 0, feedback: "10,000 × 1.19." },
  { q: "Why should a customer not apply 19% to every item?", options: ["Some goods have a different tax treatment", "Because supermarkets never charge taxes on school supplies at all", "Taxes are optional", "It's too hard"], correct: 0, feedback: "Rates can be different." },
  { q: "Why did Camila keep the new receipt?", options: ["It proved what she had paid", "She wanted to collect receipts as a hobby for her project", "To throw it later", "To get points"], correct: 0, feedback: "Documents are evidence." },
  { q: "A voucher from a card machine proves that…", options: ["a card payment was approved", "the products are in good condition and have a guarantee", "you have cash", "the store is open"], correct: 0, feedback: "Card payment proof." },
  { q: "What changed in Camila's habits?", options: ["She checks receipts before putting them away", "She only buys in small shops without receipts", "She never buys", "She pays in cash only"], correct: 0, feedback: "Read the details first." },
];

/* ---------- CLASE 6 · The Busy Shop with No Profit ---------- */
const READ_6 = [
  { sub: "An interview + a ledger" },
  { p: "Every Saturday, Aunt Rosa's arepa stand was full of customers. People bought cheese arepas, butter arepas and hot chocolate. The business looked successful, but at the end of the month, Rosa could never explain exactly how much money she had earned." },
  { node: <ChatThread title="Valentina interviews Aunt Rosa" msgs={[{ who: "Valentina", t: "Tía, how do you know if the business makes money?", me: true }, { who: "Rosa", t: "I count the cash in the box every night. If there is money, we are fine!" }, { who: "Valentina", t: "And do you write down what you spend?", me: true }, { who: "Rosa", t: "Sometimes… the cheese, yes. The gas, the bags, the taxi to the market… I forget." }]} /> },
  { h: "The ledger" },
  { p: "Valentina created a simple ledger, a record of money coming in and going out. Every time the shop made a sale, she recorded the revenue. When the business paid for ingredients or other costs, she recorded the expense." },
  { node: <MiniTable head={["Date", "Description", "In (revenue)", "Out (expense)"]} rows={[["Mar 2", "Sales of the day", "$180,000", ""], ["Mar 2", "Cheese and flour", "", "$70,000"], ["Mar 3", "Cooking gas", "", "$45,000"], ["Mar 3", "Sales of the day", "$150,000", ""]]} /> },
  { p: "After a month, the records showed $2,400,000 in revenue and $1,650,000 in expenses. The difference was $750,000." },
  { node: <MiniCase e="📒" who="Profit or loss?" lines={["Revenue − Expenses = Profit", "$2,400,000 − $1,650,000 = $750,000 ✅", "If expenses > revenue → LOSS ❌"]} /> },
  { h: "The surprising discovery" },
  { p: "Valentina also discovered that a high-sales day was not always the most profitable day. On one Saturday, the shop sold many arepas but used more expensive ingredients and hired extra help. Another day had fewer customers but lower costs." },
  { p: "The records helped Rosa make better decisions. She could estimate how much money she needed for next month's supplies, identify expensive products and decide whether prices needed to change." },
  { box: "Counting the cash in the box is not enough. A ledger explains the real financial situation of a business." },
];
const GLOSS_6 = { "ledger": "Libro de cuentas.", "revenue": "Ingresos por ventas.", "profit": "Ganancia.", "loss": "Pérdida.", "supplies": "Insumos.", "record": "Registro." };
const Q_6 = [
  { q: "How did Rosa check her business before the ledger?", options: ["She counted the cash in the box", "She wrote every expense in a notebook every night", "Her bank told her", "She didn't check"], correct: 0, feedback: "Only the cash — not enough." },
  { q: "Which expenses did Rosa often forget?", options: ["Gas, bags and transport", "Cheese and flour, the main ingredients of the arepas", "Rent", "Salaries"], correct: 0, feedback: "Small costs she didn't write down." },
  { q: "A ledger is…", options: ["a record of money in and out", "a list of the customers who buy arepas every Saturday", "a bank", "a recipe book"], correct: 0, feedback: "In and out, with dates." },
  { q: "What was the monthly revenue?", options: ["$2,400,000", "$1,650,000, the money that came in", "$750,000", "$180,000"], correct: 0, feedback: "Revenue = money from sales." },
  { q: "What was the monthly profit?", options: ["$750,000", "$2,400,000, because that was all the money that came in", "$1,650,000", "$0"], correct: 0, feedback: "2,400,000 − 1,650,000." },
  { q: "If expenses are bigger than revenue, the business has a…", options: ["loss", "profit, because it has more activity and customers", "ledger", "discount"], correct: 0, feedback: "Loss = negative result." },
  { q: "Why wasn't the busiest Saturday the most profitable?", options: ["Costs were higher that day", "Many customers didn't pay for their arepas that Saturday", "It rained", "Rosa closed early"], correct: 0, feedback: "Expensive ingredients + extra help." },
  { q: "“Cooking gas” in the ledger goes in the column…", options: ["Out (expense)", "In (revenue), because it helps the business make arepas", "Profit", "Date"], correct: 0, feedback: "Money that leaves = expense." },
  { q: "What could Rosa do thanks to the records?", options: ["Estimate next month's supplies", "Stop paying for gas and transport for the rest of the year", "Close the shop", "Get a loan"], correct: 0, feedback: "Plan, compare products, adjust prices." },
  { q: "Who created the ledger?", options: ["Valentina", "Rosa, after an interview with her niece", "The bank", "A customer"], correct: 0, feedback: "Valentina helped her aunt." },
  { q: "Revenue $180,000 and expenses $70,000 on one day. Profit?", options: ["$110,000", "$250,000, adding both numbers", "$70,000", "$180,000"], correct: 0, feedback: "180,000 − 70,000." },
  { q: "What is the main lesson?", options: ["A ledger shows the real situation", "A busy business is always a profitable business", "Cash is useless", "Arepas are cheap"], correct: 0, feedback: "Records > counting cash." },
];

/* ---------- CLASE 7 · Small Purchases, Big Surprises ---------- */
const READ_7 = [
  { sub: "A data investigation" },
  { p: "Mateo believed that he was good at managing money. He rarely bought expensive clothes or electronic devices, and he usually chose inexpensive snacks. However, he often reached the end of the week with less money than he expected." },
  { p: "One day, he decided to track every purchase for seven days. He recorded transportation, lunch, snacks, drinks, games and online purchases. At first, the process seemed unnecessary because most transactions were small." },
  { h: "The results" },
  { node: <HBars rows={[{ e: "🍫", l: "Snacks", v: 30000, c: "#ff6b57" }, { e: "🛒", l: "Online purchases", v: 18000, c: "#e07a2f" }, { e: "🥤", l: "Drinks", v: 12000, c: "#f5b23e" }, { e: "🎮", l: "Games", v: 8000, c: "#16b074" }]} /> },
  { p: "The results surprised him. He spent $6,000 on snacks each school day. Over five school days, that was $30,000. He also spent $12,000 on drinks during the week and $18,000 on unplanned online purchases." },
  { p: "Mateo realized that his problem was not one huge purchase. It was a pattern of small expenses that he barely noticed. People sometimes call this a money leak." },
  { node: <MiniCase e="💧" who="The leak over time" lines={["$6,000 a day × 5 days = $30,000 a week", "$30,000 × 4 weeks = $120,000 a month", "$120,000 × 10 school months = $1,200,000 a year!"]} /> },
  { h: "Changing the habit" },
  { p: "The chart did not tell him that every snack was a mistake. Instead, it helped him see where he could make a change without giving up everything he enjoyed." },
  { p: "Mateo decided to bring snacks from home three days a week and to wait 24 hours before making non-essential online purchases. A month later, he compared his new records with the old ones. He had reduced unnecessary spending and saved money for a goal he actually cared about." },
  { box: "Spending becomes easier to control when we measure it, recognize patterns and choose what matters most." },
];
const GLOSS_7 = { "track": "Registrar / hacer seguimiento.", "money leak": "Fuga de dinero (gasto hormiga).", "pattern": "Patrón.", "impulse": "Impulso.", "non-essential": "No esencial.", "category": "Categoría." };
const Q_7 = [
  { q: "Why did Mateo think he was good with money?", options: ["He rarely bought expensive things", "He tracked every purchase in a notebook every day", "He had a lot of money", "His parents said so"], correct: 0, feedback: "No big purchases… but many small ones." },
  { q: "How long did he track his purchases?", options: ["Seven days", "A whole month, from the first day to the last", "One day", "A year"], correct: 0, feedback: "One week." },
  { q: "How much did he spend on snacks in five school days?", options: ["$30,000", "$6,000, because each snack was cheap", "$12,000", "$18,000"], correct: 0, feedback: "6,000 × 5." },
  { q: "What was his biggest category?", options: ["Snacks", "Online purchases, because they were more expensive per transaction", "Drinks", "Games"], correct: 0, feedback: "Snacks: $30,000." },
  { q: "A money leak is…", options: ["many small expenses you barely notice", "one huge purchase that you regret for a long time", "a broken wallet", "a bank error"], correct: 0, feedback: "Small + frequent." },
  { q: "$30,000 a week for 4 weeks is…", options: ["$120,000", "$34,000, adding four thousand pesos", "$300,000", "$7,500"], correct: 0, feedback: "30,000 × 4." },
  { q: "What did the chart help Mateo do?", options: ["See where he could change", "Prove that every snack was a mistake and stop eating snacks", "Get a loan", "Win a game"], correct: 0, feedback: "It shows patterns, not guilt." },
  { q: "What is Mateo's 24-hour rule?", options: ["Wait a day before non-essential online buys", "Buy everything online within 24 hours before prices go up", "Sleep 24 hours", "Shop once a day"], correct: 0, feedback: "Waiting stops impulse buying." },
  { q: "How many days a week will he bring snacks from home?", options: ["Three", "Five, every school day of the week", "None", "Seven"], correct: 0, feedback: "Three days a week." },
  { q: "Online purchases were less frequent but…", options: ["more expensive per transaction", "less expensive than snacks per transaction", "free", "weekly"], correct: 0, feedback: "Fewer, but bigger." },
  { q: "Which word means “regular repetition of something”?", options: ["pattern", "purchase, because you repeat it every day", "leak", "goal"], correct: 0, feedback: "A pattern repeats." },
  { q: "The main idea is that spending is easier to control when we…", options: ["measure it", "stop buying anything that we enjoy", "use cash", "ask friends"], correct: 0, feedback: "Measure → recognize → choose." },
];

/* ---------- CLASE 8 · Five Families, Five Budgets ---------- */
const FAMILIES = [
  { id: "bog", flag: "🇨🇴", city: "Bogotá", fam: "Torres", cur: "COP", income: 4500000, rate: 4000, size: 4, parts: { housing: 1350000, food: 1215000, transport: 540000, education: 450000, other: 495000, savings: 450000 }, note: "Saving for a better computer for the children." },
  { id: "mad", flag: "🇪🇸", city: "Madrid", fam: "García", cur: "EUR", income: 3200, rate: 0.92, size: 3, parts: { housing: 1150, food: 520, transport: 160, education: 180, other: 790, savings: 400 }, note: "A big part goes to housing." },
  { id: "tok", flag: "🇯🇵", city: "Tokyo", fam: "Sato", cur: "JPY", income: 450000, rate: 150, size: 3, parts: { housing: 120000, food: 90000, transport: 25000, education: 45000, other: 110000, savings: 60000 }, note: "They compare apartment size and commute time." },
  { id: "nai", flag: "🇰🇪", city: "Nairobi", fam: "Otieno", cur: "KES", income: 90000, rate: 130, size: 5, parts: { housing: 20000, food: 36000, transport: 10000, education: 13500, other: 7500, savings: 3000 }, note: "Food and school costs come first." },
  { id: "chi", flag: "🇺🇸", city: "Chicago", fam: "Johnson", cur: "USD", income: 6500, rate: 1, size: 4, parts: { housing: 1950, food: 910, transport: 780, education: 260, other: 1300, savings: 1300 }, note: "Insurance and savings are in the monthly plan." },
];
const CAT8 = [["housing", "🏠", "Housing", "#0b7a50"], ["food", "🍲", "Food", "#16b074"], ["transport", "🚌", "Transport", "#f5b23e"], ["education", "📚", "Education", "#e07a2f"], ["other", "🧩", "Other", "#c9902a"], ["savings", "🐷", "Savings", "#ff6b57"]];
const READ_8 = [
  { sub: "An international data magazine · fictional families" },
  { p: "Families around the world need food, housing, transportation and other services. However, their budgets can look very different. The amount they spend depends on income, local prices, family size, access to services and personal circumstances." },
  { p: "Consider five fictional families. In Bogotá, the Torres family carefully plans transportation and food costs while saving for a better computer for their children. In Madrid, the García family spends a large part of its budget on housing. In Tokyo, the Sato family compares apartment sizes and commuting costs before choosing where to live." },
  { p: "In Nairobi, the Otieno family gives special attention to food, school costs and transportation. In Chicago, the Johnson family includes housing, insurance, transport and savings in its monthly plan." },
  { node: <MiniTable head={["Family", "Housing", "Food", "Savings"]} rows={FAMILIES.map((f) => [`${f.flag} ${f.fam}`, `${Math.round((f.parts.housing / f.income) * 100)}%`, `${Math.round((f.parts.food / f.income) * 100)}%`, `${Math.round((f.parts.savings / f.income) * 100)}%`])} /> },
  { p: "These examples do not represent every family in those cities. They show how location and circumstances can influence spending decisions." },
  { h: "Cost of living" },
  { p: "Economists use the term cost of living to describe the cost of goods and services needed in a particular place. A home that is affordable in one city may be very expensive in another. Even when two families earn the same amount in different currencies, they may not be able to buy the same things." },
  { h: "Percentages vs. amounts" },
  { p: "It is also important to compare percentages, not only amounts. A family that spends 40% of its income on food may have less money available for other needs than a family that spends 14%. However, the percentage alone does not explain everything. We also need to know the family's income and local prices." },
  { box: "A responsible analysis asks questions, checks the evidence and considers the context before reaching a conclusion — without judging people too quickly." },
];
const GLOSS_8 = { "cost of living": "Costo de vida.", "household": "Hogar.", "currency": "Moneda.", "exchange rate": "Tasa de cambio.", "commute": "Trayecto al trabajo o colegio.", "share": "Porción / porcentaje." };
const Q_8 = [
  { q: "What does “cost of living” mean?", options: ["The cost of basic goods and services in a place", "The salary that a family earns every month in a city", "The price of a house", "A bank fee"], correct: 0, feedback: "It changes from place to place." },
  { q: "Which family spends the highest % on food?", options: ["The Otieno family (Nairobi)", "The Johnson family, because they spend the most dollars on food", "The Sato family", "The García family"], correct: 0, feedback: "Food is 40% of their budget." },
  { q: "Why are these families “fictional”?", options: ["They don't represent every family of a city", "Because nobody in those cities has a budget for food or housing", "They are famous", "They are rich"], correct: 0, feedback: "Examples, not stereotypes." },
  { q: "The García family in Madrid spends a large part on…", options: ["housing", "education, because Madrid has many universities", "food", "savings"], correct: 0, feedback: "About 36% on housing." },
  { q: "Why compare percentages and not only amounts?", options: ["Incomes and currencies are different", "Because percentages are always bigger than the amounts in pesos", "It's easier", "Amounts are secret"], correct: 0, feedback: "% shows the share of the budget." },
  { q: "What does the Sato family compare before choosing a home?", options: ["Apartment size and commute costs", "The price of sushi in restaurants near the apartment", "Schools only", "Weather"], correct: 0, feedback: "Size + commuting." },
  { q: "Two families earn the same number in different currencies. They…", options: ["may not be able to buy the same things", "can always buy exactly the same things in both countries", "are equal", "pay no taxes"], correct: 0, feedback: "Prices and currencies differ." },
  { q: "What do the Torres family save for?", options: ["A better computer for the children", "A trip to Madrid to visit the García family", "A car", "A house"], correct: 0, feedback: "A computer for the children." },
  { q: "A family spends 40% on food. That means…", options: ["less money is left for other needs", "the family eats more than other families in the world", "they are rich", "they save 40%"], correct: 0, feedback: "A big share leaves less for the rest." },
  { q: "Which family includes insurance in its plan?", options: ["The Johnson family", "The Otieno family, because they have five members", "The Torres family", "None"], correct: 0, feedback: "Chicago: housing, insurance, transport, savings." },
  { q: "A responsible analysis…", options: ["checks the evidence and the context", "judges people quickly by the percentage they spend", "uses only amounts", "ignores income"], correct: 0, feedback: "Ask questions before concluding." },
  { q: "Which factor does NOT change a family's budget, according to the text?", options: ["Their favorite color", "Family size and the local prices of the city", "Income", "Access to services"], correct: 0, feedback: "Income, prices, size, services, circumstances." },
];

/* ---------- CLASE 9 · The App That Wanted Too Much ---------- */
const READ_9 = [
  { sub: "Reviews + privacy" },
  { p: "Sara wanted to understand where her money went, so she searched for a budgeting app. She found three options." },
  { node: <MiniTable head={["App", "Price", "What it does", "Permissions"]} rows={[["📒 SimpleBudget", "Free", "You record expenses manually", "None extra"], ["🤖 AutoTrack", "$12,900 / month", "Automatic tracking", "Your bank account (read-only)"], ["🌈 CoinRainbow", "Free", "Colorful charts + rewards", "Contacts, photos, location"]]} /> },
  { p: "Sara liked CoinRainbow because it looked exciting. Before installing it, she read the reviews and checked its privacy information." },
  { h: "What she learned" },
  { p: "An expense tracker records purchases and helps users understand their spending. Some apps let people enter transactions themselves, while others connect to financial accounts. These options do not have the same risks or requirements." },
  { p: "Sara also learned that a strong password should be difficult to guess and should not be reused across important accounts. When available, two-factor authentication (2FA) adds another verification step beyond the password." },
  { h: "Mixed reviews" },
  { node: <ChatThread title="CoinRainbow · reviews" msgs={[{ who: "⭐⭐⭐⭐⭐ User482", t: "Best app ever!!! Amazing!!!" }, { who: "⭐⭐⭐⭐⭐ User483", t: "Best app ever!!! So amazing!!!" }, { who: "⭐⭐ Laura M.", t: "Nice charts, but they charged a subscription I never accepted." }, { who: "⭐ Julián P.", t: "Too many notifications. Why does it need my photos?" }]} /> },
  { p: "The reviews were mixed. Sara discovered that a high rating did not guarantee that an app was safe or appropriate for her needs. Some five-star reviews looked suspiciously similar." },
  { p: "She compared cost, features, permissions, privacy policy and cancellation process. SimpleBudget offered enough tools for her goal, and it did not request unnecessary permissions. Sara chose it and decided to review her records every Sunday." },
  { box: "The safest choice is not always the app with the most features. It is the one whose benefits, costs and data practices we understand." },
];
const GLOSS_9 = { "expense tracker": "App para registrar gastos.", "permissions": "Permisos (acceso a datos del celular).", "privacy policy": "Política de privacidad.", "two-factor authentication": "Verificación en dos pasos (2FA).", "subscription": "Suscripción (pago repetido).", "review": "Reseña." };
const Q_9 = [
  { q: "Why did Sara first like CoinRainbow?", options: ["It looked exciting", "It was the only app that was completely free", "Her friend used it", "It had no ads"], correct: 0, feedback: "Charts and rewards." },
  { q: "Which app asked for contacts, photos and location?", options: ["CoinRainbow", "AutoTrack, because it connects to the bank", "SimpleBudget", "None"], correct: 0, feedback: "Too many permissions for a budget app." },
  { q: "What did Sara do BEFORE installing the app?", options: ["Read reviews and privacy information", "Gave the app her bank password to test it", "Paid for it", "Asked her bank"], correct: 0, feedback: "Investigate first." },
  { q: "A strong password should be…", options: ["hard to guess and not reused", "easy to remember and the same in every account", "your birthday", "shared with friends"], correct: 0, feedback: "Unique + hard to guess." },
  { q: "Two-factor authentication adds…", options: ["another verification step", "a second password that your friends also know", "more charts", "a subscription"], correct: 0, feedback: "Password + code." },
  { q: "What was suspicious about some five-star reviews?", options: ["They were almost identical", "They were written by Laura and Julián with real problems", "They were long", "They were in Spanish"], correct: 0, feedback: "Copy-paste reviews can be fake." },
  { q: "What problem did Laura M. report?", options: ["A subscription she didn't accept", "Too many notifications on her phone every day", "No charts", "The app was slow"], correct: 0, feedback: "Unclear subscription charges." },
  { q: "Which app did Sara choose?", options: ["SimpleBudget", "AutoTrack, because automatic tracking is safer", "CoinRainbow", "No app"], correct: 0, feedback: "Enough tools, no extra permissions." },
  { q: "A high rating guarantees that an app is…", options: ["nothing — it guarantees nothing", "safe and appropriate for every user who downloads it", "free", "popular"], correct: 0, feedback: "Ratings are not proof." },
  { q: "What will Sara do every Sunday?", options: ["Review her records", "Change her password and delete the app", "Buy something", "Write reviews"], correct: 0, feedback: "A weekly money check." },
  { q: "AutoTrack costs $12,900 a month. In a year that is…", options: ["$154,800", "$129,000, about ten months of payments", "$12,900", "$1,290"], correct: 0, feedback: "12,900 × 12." },
  { q: "The safest app is the one…", options: ["whose costs and data practices you understand", "that has the most features and the most colorful charts", "with most stars", "that is newest"], correct: 0, feedback: "Understand before you trust." },
];

/* =====================================================================
   VIDEOS (Cloudinary) · preguntas del profe (se sortean 8 de 14)
   ===================================================================== */
const VID_1 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1792591230/videoplayback_14.mp4";
const VID_2 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1792598540/videoplayback_19.mp4";
const VID_3 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1792591371/videoplayback_16.mp4";
const VID_4 = "https://res.cloudinary.com/y9r84vgz/video/upload/v1792591468/videoplayback_17.mp4";
const VQ_1 = [
  { q: "At what age did Igor Curic get his first banking card?", options: ["14", "16 years old, right before he started driving", "He was 12 when his father opened a junior savings account for him", "18"], correct: 0, feedback: "Watch again at 00:33." },
  { q: "How did Igor's father link the first banking card?", options: ["He linked it directly to his own account", "He linked it to a separate prepaid account with a strict $50 monthly limit", "He set it up", "He didn't link it"], correct: 0, feedback: "Watch again at 00:34." },
  { q: "What joke did Igor's sister make when their mother had a headache?", options: ["She suggested buying expensive things to feel better", "She told her to buy expensive medicine at the pharmacy", "She laughed", "She told her to drink water and rest in a dark room"], correct: 0, feedback: "Watch again at 00:57." },
  { q: "What classic school topic does the speaker mention instead of taxes and budgeting?", options: ["The mitochondria is the powerhouse of the cell", "The mitochondria is the brain that controls the whole cell", "Chemistry", "Physics explains gravity"], correct: 0, feedback: "Watch again at 01:50." },
  { q: "What modern teen money slang does Igor mention jokingly to his dad?", options: ["HODLing his Bored Apes NFTs to the moon and pancake swapping for USDT", "Investing in Bitcoin and Ethereum with traditional brokerage platforms", "Buying stocks", "Saving cash"], correct: 0, feedback: "Watch again at 02:25." },
  { q: "What is the name of the card built to help parents answer tough money questions?", options: ["Nikki card", "The Nikki credit card that lets teens borrow money from the bank", "TeenCard", "FutureBank"], correct: 0, feedback: "Watch again at 02:59." },
  { q: "According to parents interviewed in the talk, what do teenagers often believe about money?", options: ["It comes out of thin air", "It is earned through hard work and long hours at a job", "They save it", "They hate it"], correct: 0, feedback: "Watch again at 03:05." },
  { q: "What job did Igor have when he was younger?", options: ["Stocking shelves in a store", "Stocking shelves at a car factory on weekends", "Babysitting", "Software developer"], correct: 0, feedback: "Watch again at 03:56." },
  { q: "What modern jobs does Igor say teenagers might have today?", options: ["Instagram influencer, YouTube streamer or TikTok dancing star", "Instagram influencer, YouTube streamer or professional video game tester", "Bloggers", "Corporate office workers"], correct: 0, feedback: "Watch again at 04:01." },
  { q: "What is one main goal of the Nikki card for families?", options: ["To bring teens and parents together to talk about money", "To automate all teen spending without any parental supervision", "To make money", "To replace schools"], correct: 0, feedback: "Watch again at 04:22." },
  { q: "What concepts does the Nikki card start with for younger teens?", options: ["How to spend, how to save and how to budget", "Advanced cryptocurrency trading and stock market options", "Budgeting", "Paying taxes"], correct: 0, feedback: "Watch again at 03:47." },
  { q: "What does Igor say teenagers are lacking when they get their first card?", options: ["The necessary money skills", "Pocket money and a stable income source", "Trust", "Phones"], correct: 0, feedback: "Watch again at 01:40." },
  { q: "What will teens face after turning 18, according to Igor?", options: ["Leaving home and maybe making bad decisions like big debts", "Graduating from university with honors and getting a high-paying career", "Buying a house", "Buying a car"], correct: 0, feedback: "Watch again at 03:18." },
  { q: "How does Igor summarize his final thought about teenagers?", options: ["They will soon be adults who need money skills", "They will become the future leaders and executives of big companies", "They will change the world", "They play sports"], correct: 0, feedback: "Watch again at 04:40." },
];
const VQ_2 = [
  { q: "What does the primary sector of the economy deal with directly?", options: ["Raw materials, like mining, fishing and farming", "Manufacturing consumer electronics and automobiles in big factories", "Only banking and money", "Selling clothes online"], correct: 0, feedback: "Watch again at 00:13." },
  { q: "In what type of economies do most jobs traditionally belong to the primary sector?", options: ["Developing economies", "Highly advanced post-industrial digital economies", "Developed nations", "Outer space colonies"], correct: 0, feedback: "Watch again at 00:25." },
  { q: "How is the secondary sector defined in the video?", options: ["Using raw materials to create something new", "Giving direct health services and retail shopping experiences to customers", "Collecting raw materials", "Government leadership"], correct: 0, feedback: "Watch again at 00:38." },
  { q: "US manufacturing jobs: the 1950s compared to today?", options: ["Up to 30% then; less than 9% today", "About 10% then, and it has grown to more than 50% of all jobs today", "Exactly 50% in both years", "Zero percent"], correct: 0, feedback: "Watch again at 00:59." },
  { q: "Why is US manufacturing OUTPUT going up even with fewer jobs?", options: ["Automation, and plants close to the biggest market", "Because millions of new manual factory workers are hired every single month", "Cheaper workers in other countries", "Lower taxes"], correct: 0, feedback: "Watch again at 01:18." },
  { q: "Which Chinese city grew from 30,000 to 20 million people as a special economic zone?", options: ["Shenzhen", "Shanghai, the old port city on the east coast of China", "Beijing", "Tokyo"], correct: 0, feedback: "Watch again at 01:48." },
  { q: "What is another common name for the tertiary sector?", options: ["The service sector", "The resource gathering and extraction sector", "The factory sector", "The agricultural sector"], correct: 0, feedback: "Watch again at 02:15." },
  { q: "Which is a tertiary activity that works almost completely online?", options: ["Online banks and Fiverr freelancers", "Traditional coal mining and farming corporations with a lot of land", "Car factories", "Steel mills"], correct: 0, feedback: "Watch again at 02:35." },
  { q: "What services define the quaternary sector?", options: ["Research, education and information", "Making high-level government laws and big executive decisions for companies", "Building houses", "Heavy farming"], correct: 0, feedback: "Watch again at 03:02." },
  { q: "Which research division of Bell Telephone is the quaternary example?", options: ["Bell Labs", "NASA's space research center in Houston, Texas", "Silicon Valley Tech Corp", "A coal mine"], correct: 0, feedback: "Watch again at 03:09. They invented the transistor, the laser and cell phones." },
  { q: "Why do companies cluster in cities like San Francisco and Boston?", options: ["Universities create ideas that attract skilled workers", "Because rent prices are free in those specific big cities for all companies", "Good weather", "Cheap oil"], correct: 0, feedback: "Watch again at 03:41 (The New Geography of Jobs)." },
  { q: "Who belongs to the quinary sector?", options: ["People who make big decisions, like CEOs", "Teachers and university researchers who share knowledge with students", "Factory workers", "Farmers"], correct: 0, feedback: "Watch again at 04:19." },
  { q: "What nickname is sometimes given to quinary-sector jobs?", options: ["Gold collar jobs", "Green collar jobs in the environmental and recycling industries", "Blue collar jobs", "No-collar jobs"], correct: 0, feedback: "Watch again at 04:29." },
  { q: "Ocean Spray: turning cranberries into juice in a factory is which sector?", options: ["Secondary — value is added", "Primary, because it involves natural fruit plants that grow on a farm", "Tertiary — selling", "Quaternary research"], correct: 0, feedback: "Watch again at 04:52." },
];
const VQ_3 = [
  { q: "What is the breakdown of the 50/30/20 rule?", options: ["50% needs, 30% leisure, 20% savings", "50% savings, 30% needs and 20% leisure spending", "50/50", "Taxes"], correct: 0, feedback: "Watch again at 00:48." },
  { q: "Which book made the 50/30/20 rule popular, according to the video?", options: ["All Your Worth, by Senator Elizabeth Warren", "The Ultimate Money Plan, by Senator Bernie Sanders", "The Total Money Makeover", "Rich Dad Poor Dad"], correct: 0, feedback: "Watch again at 00:33." },
  { q: "Which expenses go in the 50% necessities category?", options: ["Rent, car payments, gas, utilities and groceries", "Luxury flights, spa days and dinners at expensive restaurants", "Vacations", "Gym memberships"], correct: 0, feedback: "Watch again at 00:54." },
  { q: "How much of your salary goes to savings with this rule?", options: ["20 percent", "Twenty percent, but only after paying all leisure expenses first", "30 percent", "Zero percent"], correct: 0, feedback: "Watch again at 01:03." },
  { q: "Which accounts are examples for the savings part?", options: ["Retirement accounts, emergency funds or investments", "Regular checking accounts used only for electricity and water bills", "Checking accounts", "Credit cards"], correct: 0, feedback: "Watch again at 01:03." },
  { q: "What percentage is for leisure spending?", options: ["30 percent", "Thirty percent, used only for wine, restaurants and travel", "20 percent", "50 percent"], correct: 0, feedback: "Watch again at 01:35." },
  { q: "Which is included in the 30% leisure category?", options: ["Gym, donations, therapy, hobbies, restaurants", "Monthly rent for your house and your basic utility bills", "Rent", "Student loan minimums"], correct: 0, feedback: "Watch again at 01:50." },
  { q: "What should you do if needs are more than 50% of your pay?", options: ["Get a side hustle, ask for a raise or audit costs", "Stop saving completely and cancel every retirement account", "Spend more", "Buy a new car"], correct: 0, feedback: "Watch again at 02:12." },
  { q: "Why does the rule adapt to any location?", options: ["It uses percentages, not fixed amounts", "Because rent prices are the same everywhere in the country", "It is fixed", "It changes daily"], correct: 0, feedback: "Watch again at 02:33." },
  { q: "What does the speaker say about the famous $5 latte?", options: ["Society blames lattes but doesn't teach investing", "People should never spend money on coffee under any circumstance", "Coffee is bad", "Lattes cost too much"], correct: 0, feedback: "Watch again at 02:56." },
  { q: "Who is this rule best for?", options: ["People who prioritize saving and have little debt", "People with huge credit card debt and no income at all", "People with no job", "Millionaires"], correct: 0, feedback: "Watch again at 03:20." },
  { q: "How can you adjust the rule if you have big debt payments?", options: ["Save 30% and cut leisure to 20%", "You can never change the percentages under any circumstance", "Stop eating", "Ignore the debt"], correct: 0, feedback: "Watch again at 03:41." },
  { q: "With a $5,000 net salary, how much goes to savings (20%)?", options: ["$1,000", "$1,500, which is thirty percent of the salary", "$2,500", "$500"], correct: 0, feedback: "Watch again at 04:10." },
  { q: "How does the speaker suggest tracking monthly expenses?", options: ["With an Excel spreadsheet that calculates them", "Writing everything on paper napkins every single morning", "Mental math", "Guessing"], correct: 0, feedback: "Watch again at 05:14." },
];
const VQ_4 = [
  { q: "What monthly budget is the baseline in the video?", options: ["$1,500 per month", "$1,500 per week, as a baseline for families", "$2,000 per month", "$500 per month"], correct: 0, feedback: "Watch again at 00:39." },
  { q: "What is the main source of price data?", options: ["nomads.com (what people really spend)", "Official tourism reports from international banking institutions", "Wikipedia", "Social media comments"], correct: 0, feedback: "Watch again at 00:23." },
  { q: "Why do expats usually spend more than locals?", options: ["Central rent, western food, visas and insurance", "They are legally required to pay double taxes on everything", "Taxes", "Plane tickets only"], correct: 0, feedback: "Watch again at 00:48." },
  { q: "How much do expats spend per month in Chiang Mai?", options: ["$1,594", "$1,494, just under the baseline budget", "$598", "$3,000"], correct: 0, feedback: "Watch again at 02:50." },
  { q: "Which European city has locals at $1,816 and expats at $3,334?", options: ["Lisbon, Portugal", "Madrid, Spain, where locals are already over the budget", "Sofia, Bulgaria", "Tokyo, Japan"], correct: 0, feedback: "Watch again at 01:31." },
  { q: "Which Latin American city has locals at $1,200 and expats at $2,281?", options: ["Buenos Aires", "Santiago de Chile, with central rent around $771", "Medellín", "Madrid"], correct: 0, feedback: "Watch again at 01:42." },
  { q: "Which country, where Cuenca is, uses the US dollar?", options: ["Ecuador", "Peru, which officially uses the US dollar", "Colombia", "Argentina"], correct: 0, feedback: "Watch again at 04:02." },
  { q: "Which city is number one for cost of living in the 2026 Global Retirement Index?", options: ["Galle, Sri Lanka", "Phuket, Thailand, with low expat living averages", "Hanoi, Vietnam", "Bangkok, Thailand"], correct: 0, feedback: "Watch again at 04:49." },
  { q: "On a $1,500 budget in Galle (expats spend $763), how much is left?", options: ["$737", "$837, more than half of the budget", "$51", "$1,200"], correct: 0, feedback: "1,500 − 763. Watch again at 04:49." },
  { q: "What happens if the budget goes up to $2,000?", options: ["Four more cities open up", "All European cities suddenly become affordable instantly", "Nothing changes", "You can buy a house"], correct: 0, feedback: "Watch again at 05:10." },
  { q: "About how much is a cheap local meal in Chiang Mai?", options: ["About $2", "Roughly twelve US dollars for a street meal", "About $10", "$25"], correct: 0, feedback: "Watch again at 05:38." },
  { q: "What are the four steps to calculate your own living number?", options: ["Rent, food style, everyday costs, extras like visas", "Guess your expenses from random social media posts", "Taxes", "Ask a bank"], correct: 0, feedback: "Watch again at 06:25." },
  { q: "How much more do expats spend than locals, in general?", options: ["Between 1.5 and 2.7 times more", "Exactly the same amount as locals, down to the penny", "Double", "Ten times less"], correct: 0, feedback: "Watch again at 07:10." },
  { q: "On $1,500, which regions' favorite cities mostly don't work?", options: ["Europe and Latin America", "Southeast Asia and Africa mostly don't fit this tight budget", "Southeast Asia", "Antarctica"], correct: 0, feedback: "Watch again at 07:17." },
];

/* =====================================================================
   CLASE 1 · THE MISSING MONEY
   ===================================================================== */
const RADAR_DIMS = [
  { k: "mm", l: "Money Management", short: "Money" },
  { k: "ent", l: "Entrepreneurship", short: "Business" },
  { k: "wb", l: "Financial Wellbeing", short: "Wellbeing" },
  { k: "dig", l: "Digital Economy", short: "Digital" },
  { k: "glo", l: "Global Citizenship", short: "Global" },
];
// s = puntos (0–3) de cada opción
const RADAR8_Q = [
  { d: "mm", q: "You receive $200,000 for your birthday. What do you do first?", o: ["I spend it this weekend.", "I keep it in my drawer and decide later.", "I write a plan: needs, a saving goal and a little for fun.", "I give it to a friend to keep it safe."], s: [0, 1, 3, 0] },
  { d: "mm", q: "What is a budget?", o: ["A list of things I want to buy.", "A plan for my income, expenses and savings.", "The money in my bank account.", "A type of credit card."], s: [1, 3, 1, 0] },
  { d: "ent", q: "A shop sells many products every day. Does that mean it makes a profit?", o: ["Yes, always.", "It depends: we must subtract all the costs.", "No, shops never make profit.", "Only if the owner is happy."], s: [0, 3, 0, 0] },
  { d: "ent", q: "A friend sells bracelets but never writes down what she spends on materials. What can happen?", o: ["Nothing — she has cash in her pocket.", "She may think she earns money when she doesn't.", "She will pay more taxes.", "Her bracelets will break."], s: [0, 3, 1, 0] },
  { d: "wb", q: "A pair of sneakers is 40% off but the sale ends tonight. You don't need them. What do you do?", o: ["Buy them — it's a great deal!", "Ask a friend to lend me money.", "Ask: do I need it, can I afford it, is there something more important?", "Buy two pairs."], s: [0, 0, 3, 0] },
  { d: "wb", q: "You buy a $5,000 snack every school day. Is that important for your money?", o: ["No, it's a very small amount.", "Maybe: small expenses can add up to a lot every month.", "Only if I buy two.", "Snacks are free at school."], s: [0, 3, 0, 0] },
  { d: "dig", q: "A budgeting app asks for your contacts, photos and location. What do you do?", o: ["Accept everything — apps need it.", "Check if the app really needs that information before installing.", "Send my password to support.", "Install it on my parents' phone."], s: [0, 3, 0, 0] },
  { d: "dig", q: "Which password is the safest for a money app?", o: ["123456", "My birthday", "A long, unique password + a verification code (2FA)", "The same password I use everywhere"], s: [0, 0, 3, 0] },
  { d: "glo", q: "A family in another country spends 40% of its income on food. What can you conclude?", o: ["They eat too much.", "Probably less money is left for other needs — but we need more context.", "They are rich.", "Nothing at all."], s: [0, 3, 0, 1] },
  { d: "glo", q: "Why do the same $1,500 buy more in some cities than in others?", o: ["Because the cost of living is different.", "Because money is fake in some countries.", "Because of the weather.", "It's impossible."], s: [3, 0, 0, 0] },
];
function radarProfile8(avg) {
  if (avg <= 30) return { l: "Money Rookie 🌱", d: "You are starting from zero — perfect! This period you will build your first real financial plan." };
  if (avg <= 55) return { l: "Money Explorer 🔎", d: "You know some ideas. Now you will organize them in a budget and a ledger." };
  if (avg <= 80) return { l: "Money Planner 📐", d: "Good instincts! This period you will prove them with numbers and documents." };
  return { l: "Money Strategist ⭐", d: "Excellent start! Your challenge: explain your decisions in English and help your team." };
}
function MoneyRadar8({ existing, onSave, onExit }) {
  const [cur, setCur] = useState(0);
  const [ans, setAns] = useState(existing?.answers || {});
  const [done, setDone] = useState(!!existing?.scores);
  const [saving, setSaving] = useState(false);
  const scores = useMemo(() => {
    const o = {};
    RADAR_DIMS.forEach((d) => {
      const qs = RADAR8_Q.map((q, i) => ({ q, i })).filter((x) => x.q.d === d.k);
      o[d.k] = Math.round((qs.reduce((a, x) => a + (ans[x.i] != null ? x.q.s[ans[x.i]] : 0), 0) / (qs.length * 3)) * 100);
    });
    return o;
  }, [ans]);
  const shown = existing?.scores && !Object.keys(ans).length ? existing.scores : scores;
  const avg = Math.round(Object.values(shown).reduce((a, v) => a + v, 0) / RADAR_DIMS.length);
  const prof = radarProfile8(avg);
  const q = RADAR8_Q[cur];
  const answered = ans[cur] != null;
  const finish = () => { setSaving(true); setDone(true); Promise.resolve(onSave({ answers: ans, scores, average: avg, profile: prof.l, xp: 15 })).finally(() => setSaving(false)); };
  if (done) {
    const sorted = RADAR_DIMS.map((d) => ({ ...d, v: shown[d.k] })).sort((a, b) => b.v - a.v);
    return (
      <div className="s1-quiz diag-result">
        <div className="diag-badge"><Compass size={30} strokeWidth={2.1} /></div>
        <h2>My Money Radar · 8th grade</h2>
        <p className="diag-sub">This is not a test. It's a photo of you today. At the end of the year you will do it again and compare.</p>
        <div className="g7-radar-wrap"><RadarN labels={RADAR_DIMS.map((d) => d.short)} values={RADAR_DIMS.map((d) => shown[d.k])} /></div>
        <div className="diag-bars">{RADAR_DIMS.map((d) => <div key={d.k} className="diag-bar"><span className="diag-bar-l">{d.l}</span><div className="diag-bar-track"><i style={{ width: `${shown[d.k]}%` }} /></div><span className="diag-bar-v">{shown[d.k]}%</span></div>)}</div>
        <div className="diag-risk"><span className="diag-risk-tag">{prof.l}</span><p>{prof.d}</p></div>
        <div className="p1-diag-cards">
          <div className="p1-diag-card good"><b>💪 Your strongest pillar: {sorted[0].l}</b><span>You scored {sorted[0].v}%.</span></div>
          <div className="p1-diag-card next"><b>🎯 Your next step: {sorted[4].l}</b><span>This period will help you a lot here.</span></div>
        </div>
        <button className="s1-btn primary" onClick={onExit}>Continue <ChevronRight size={18} /></button>
        {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing your progress…</span>}
      </div>
    );
  }
  return (
    <div className="s1-quiz">
      <div className="quiz-top"><h2>🧭 My Money Radar</h2><span className="quiz-count">{cur + 1} / {RADAR8_Q.length}</span></div>
      <div className="quiz-track"><i style={{ width: `${((cur + (answered ? 1 : 0)) / RADAR8_Q.length) * 100}%` }} /></div>
      {cur === 0 && <p className="start-tip">10 real situations · 5 pillars. There are no wrong people — only honest answers. 😉</p>}
      <span className="diag-dim">{RADAR_DIMS.find((d) => d.k === q.d).l}</span>
      <p className="quiz-q">{q.q}</p>
      <div className="quiz-options">{q.o.map((o, k) => <button key={k} type="button" className={`quiz-opt ${ans[cur] === k ? "correct" : ""}`} onClick={() => setAns({ ...ans, [cur]: k })}><span className="opt-key">{"ABCD"[k]}</span><span className="opt-text">{o}</span></button>)}</div>
      <div className="quiz-nav">
        <button className="s1-btn ghost" onClick={() => (cur > 0 ? setCur(cur - 1) : onExit())}>{cur > 0 ? "Back" : "Exit"}</button>
        <button className="s1-btn primary" disabled={!answered} onClick={() => (cur < RADAR8_Q.length - 1 ? setCur(cur + 1) : finish())}>{cur < RADAR8_Q.length - 1 ? "Next" : "See my radar"} <ChevronRight size={18} /></button>
      </div>
    </div>
  );
}

const START_1 = {
  cards: [
    { e: "💵", t: "Income", d: "Money that comes IN: salary, allowance, sales, gifts.", ex: "Valentina's income: $400,000." },
    { e: "💸", t: "Expense", d: "Money that goes OUT when you pay for something.", ex: "Bus, lunch, a jacket." },
    { e: "✅", t: "Need", d: "Something you must have to live, study or work.", ex: "Transport to school." },
    { e: "🎁", t: "Want", d: "Something nice to have, but not necessary.", ex: "New headphones." },
    { e: "🐷", t: "Saving goal", d: "Money you keep for something in the future, with an amount and a date.", ex: "$300,000 for a bike in 6 months." },
    { e: "📋", t: "Budget", d: "A plan that says how you will use your income BEFORE you spend it.", ex: "Needs → savings → wants." },
    { e: "🗺️", t: "Financial plan", d: "Your goals + your budget + your rules. It guides your money decisions.", ex: "“I save 20% first.”" },
  ],
  pairs: [{ a: "Income", b: "Money that comes in" }, { a: "Expense", b: "Money that goes out" }, { a: "Need", b: "You must have it" }, { a: "Want", b: "Nice, but not necessary" }, { a: "Budget", b: "A plan before spending" }, { a: "Saving goal", b: "Money for the future" }],
};

/* ---------- WHERE DID IT GO? (juego principal clase 1) ---------- */
const WEEK1 = [
  { id: "head", d: "Tuesday", e: "🎧", t: "Headphones", v: 120000, need: false },
  { id: "food", d: "Wednesday", e: "🍔", t: "Food with friends", v: 35000, need: false },
  { id: "jacket", d: "Thursday", e: "🧥", t: "Jacket on sale", v: 110000, need: false },
  { id: "bus", d: "Fri · AM", e: "🚌", t: "Transportation", v: 20000, need: true },
  { id: "snack", d: "Fri · PM", e: "🥤", t: "Snacks and drinks", v: 25000, need: false },
  { id: "fun", d: "Weekend", e: "🎬", t: "Entertainment", v: 40000, need: false },
];
const AUDIT1 = [
  { tag: "AUDIT 1", q: "How much did Valentina earn?", options: ["$400,000", "$350,000", "$450,000"], correct: 0, explain: "Her aunt paid her $400,000." },
  { tag: "AUDIT 2", q: "How much did she spend in one week?", visual: <MiniCase e="🧮" who="Add the 6 purchases" lines={["120,000 + 35,000 + 110,000", "+ 20,000 + 25,000 + 40,000"]} />, answer: 350000, money: true, hint: "Add the six amounts.", explain: "$350,000 — in only ONE week." },
  { tag: "AUDIT 3", q: "Which purchase was a NEED?", options: ["🚌 Transportation", "🧥 The jacket on sale", "🎧 Headphones"], correct: 0, explain: "She needs the bus to go to school and work." },
  { tag: "AUDIT 4", q: "What was her biggest mistake?", options: ["No plan for the month", "Working too many hours for her aunt", "Buying the bus ticket on Monday"], correct: 0, explain: "She spent the month's money in one week." },
];
function WhereDidItGo({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const deck = useMemo(() => shuffleArr(WEEK1), []);
  const [placed, setPlaced] = useState([]);
  const [shake, setShake] = useState(null);
  const [skip, setSkip] = useState({});
  const [txt, setTxt] = useState("");
  const [st, finish] = useFinish(onSave);
  const bal = 400000 - placed.reduce((a, id) => a + WEEK1.find((w) => w.id === id).v, 0);
  const tap = (w) => { const next = WEEK1[placed.length]; if (next.id === w.id || (next.d === w.d && !placed.includes(w.id))) setPlaced([...placed, w.id]); else { setShake(w.id); setTimeout(() => setShake(null), 450); } };
  const whatIf = 400000 - WEEK1.filter((w) => !skip[w.id]).reduce((a, w) => a + w.v, 0);
  const goalOk = whatIf >= 200000;
  const G1 = [W_REASON, W_ADVICE];
  if (st.done) return <Reward title="Money found! 🔎" subtitle="You know exactly where Valentina's money went." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Where Did It Go? 🔎" subtitle="Valentina had $400,000 on Monday. On Sunday: $50,000. Rebuild her week." onExit={onExit}>
      <div className="g72-steps">{["1 · Rebuild the week", "2 · Audit", "3 · What if?", "4 · Diagnosis"].map((s, i) => <span key={s} className={stage === i ? "on" : stage > i ? "done" : ""}>{s}</span>)}</div>
      {stage === 0 && (
        <>
          <HowTo>Tap the purchases <b>in order</b>, from Tuesday to the weekend. Watch her wallet go down after each purchase.</HowTo>
          <div className="g8-wallet"><small>💳 VALENTINA'S BALANCE</small><b className={bal < 100000 ? "low" : ""}>{cop(bal)}</b><i><s style={{ width: `${(bal / 400000) * 100}%` }} /></i></div>
          <div className="g8-timeline">{WEEK1.map((w, i) => { const p = placed[i] && WEEK1.find((x) => x.id === placed[i]); return <div key={i} className={`g8-tl ${p ? "ok" : ""}`}><small>{w.d}</small>{p ? <b>{p.e} {p.t} <i>−{cop(p.v)}</i></b> : <span>?</span>}</div>; })}</div>
          <div className="g8-buycards">{deck.filter((w) => !placed.includes(w.id)).map((w) => <button key={w.id} type="button" className={`g8-buy ${shake === w.id ? "p1-shake bad" : ""}`} onClick={() => tap(w)}><em>{w.e}</em><b>{w.t}</b><span>{cop(w.v)}</span></button>)}</div>
          {placed.length === WEEK1.length && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(1)}>Start the audit <ChevronRight size={18} /></button></div>}
        </>
      )}
      {stage === 1 && <RoundsRunner rounds={AUDIT1} doneLabel="Next: What if?" onDone={() => setStage(2)} />}
      {stage === 2 && (
        <>
          <HowTo>Go back in time! Tap purchases to <b>remove</b> them. Mission: Valentina needs at least <b>$200,000</b> for the other three weeks. Needs (🚌) can't be removed.</HowTo>
          <div className="g8-whatif">{WEEK1.map((w) => <button key={w.id} type="button" disabled={w.need} className={`g8-buy ${skip[w.id] ? "off" : ""} ${w.need ? "need" : ""}`} onClick={() => setSkip({ ...skip, [w.id]: !skip[w.id] })}><em>{w.e}</em><b>{w.t}</b><span>{skip[w.id] ? "Not bought ✂️" : cop(w.v)}</span>{w.need && <small>NEED</small>}</button>)}</div>
          <div className={`g8-wallet ${goalOk ? "good" : ""}`}><small>MONEY LEFT FOR 3 MORE WEEKS</small><b>{cop(whatIf)}</b><i><s style={{ width: `${(whatIf / 400000) * 100}%` }} /></i><span>{goalOk ? "✅ She can survive the month!" : `❌ ${cop(200000 - whatIf)} short of the $200,000 goal`}</span></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!goalOk} onClick={() => setStage(3)}>See the diagnosis <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 3 && (
        <>
          <div className="g8-diag">
            <div><small>Income</small><b>{cop(400000)}</b></div><div><small>Spent in 1 week</small><b className="neg">{cop(350000)}</b></div><div><small>Left</small><b>{cop(50000)}</b></div><div className="wide"><small>Mistake</small><b>No plan for the month · wants before needs</b></div>
          </div>
          <div className="start-block">
            <h3><PenLine size={18} /> Write 3 sentences: her mistake + your advice</h3>
            <Starters items={["Valentina's mistake was", "because", "She should", "Next month, she should"]} onPick={appendStarter(setTxt)} />
            <WordField value={txt} onChange={setTxt} min={20} max={90} rows={4} goals={G1} placeholder="Write your answer here…" />
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(txt, 20, 90, G1)} onClick={() => finish(30, { removed: Object.keys(skip).filter((k) => skip[k]), left: whatIf, text: txt })}>Save my diagnosis <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- BLUEPRINT 01 · MONEY SNAPSHOT ---------- */
const SNAP_IN = [["allowance", "💵", "Allowance"], ["gifts", "🎁", "Gifts"], ["jobs", "🧺", "Small jobs / sales"]];
const SNAP_OUT = [["transport", "🚌", "Transport", true], ["food", "🍱", "Food & snacks", true], ["phone", "📱", "Phone / internet", true], ["fun", "🎮", "Fun & games", false], ["clothes", "👕", "Clothes & style", false], ["other", "🧩", "Other", false]];
function MoneySnapshot({ existing, onSave, onExit }) {
  const [inc, setInc] = useState(existing?.inc || {});
  const [out, setOut] = useState(existing?.out || {});
  const [goal, setGoal] = useState(existing?.goal || "");
  const [change, setChange] = useState(existing?.change || "");
  const [st, finish] = useFinish(onSave);
  const tIn = SNAP_IN.reduce((a, [k]) => a + num(inc[k]), 0);
  const tOut = SNAP_OUT.reduce((a, [k]) => a + num(out[k]), 0);
  const needs = SNAP_OUT.filter((x) => x[3]).reduce((a, [k]) => a + num(out[k]), 0);
  const left = tIn - tOut;
  const filled = SNAP_OUT.filter(([k]) => num(out[k]) > 0).length;
  const mood = tIn === 0 ? ["🤔", "Add your income first"] : left < 0 ? ["🔥", "Spender: more out than in!"] : left < tIn * 0.1 ? ["😅", "Tight: almost nothing left"] : left < tIn * 0.3 ? ["🙂", "Balanced, with a little extra"] : ["🐷", "Saver: a lot left — plan it!"];
  const ready = tIn > 0 && filled >= 3 && countWords(goal) >= 3 && countWords(change) >= 4;
  if (st.done) return <Reward title="Snapshot saved! 📸" subtitle="Blueprint page 01 is ready." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Wallet size={22} strokeWidth={2.1} />} title="My Money Snapshot 📸" subtitle="A photo of YOUR money today. Real or approximate numbers — nobody judges." onExit={onExit}>
      <BPBadge n="01" />
      <HowTo>Write how much money you usually receive and spend in <b>one month</b>. If you don't receive money, imagine a realistic situation (for example, $150,000 a month).</HowTo>
      <div className="g8-two">
        <div className="start-block g8-col in"><h3>⬇️ Money IN</h3>{SNAP_IN.map(([k, e, l]) => <div key={k} className="g8-row"><span>{e} {l}</span><MoneyInput value={inc[k] || ""} onChange={(v) => setInc({ ...inc, [k]: v })} /></div>)}<div className="g8-row tot"><span>Total in</span><b>{cop(tIn)}</b></div></div>
        <div className="start-block g8-col out"><h3>⬆️ Money OUT</h3>{SNAP_OUT.map(([k, e, l, n]) => <div key={k} className="g8-row"><span>{e} {l} <small>{n ? "need" : "want"}</small></span><MoneyInput value={out[k] || ""} onChange={(v) => setOut({ ...out, [k]: v })} /></div>)}<div className="g8-row tot"><span>Total out</span><b>{cop(tOut)}</b></div></div>
      </div>
      {tIn > 0 && (
        <div className="g8-snap">
          <em>{mood[0]}</em>
          <div><small>MY MONEY TODAY</small><b>{mood[1]}</b><span>In {cop(tIn)} · Out {cop(tOut)} · Left <b className={left < 0 ? "neg" : "pos"}>{cop(left)}</b></span></div>
          <StackBar parts={[{ label: "Needs", value: needs, color: "#0b7a50" }, { label: "Wants", value: tOut - needs, color: "#e07a2f" }, { label: "Left", value: Math.max(0, left), color: "#f5b23e" }]} max={Math.max(tIn, tOut)} />
        </div>
      )}
      <div className="start-block">
        <div className="p3-sentence edit"><span>🎯 Something I want to save for:</span><input className="start-input" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Write your answer here…" /></div>
        <div className="p3-sentence edit"><span>🔁 One money habit I want to change is</span><input className="start-input" value={change} onChange={(e) => setChange(e.target.value)} placeholder="Write your answer here…" /></div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(25, { inc, out, tIn, tOut, needs, left, mood: mood[1], goal, change })}>Save page 01 <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 2 · THE CITY THAT MAKES MONEY
   ===================================================================== */
const START_2 = {
  cards: [
    { e: "🏙️", t: "Economic sector", d: "A group of jobs that do a similar type of work in the economy.", ex: "Farming, factories, services." },
    { e: "🌱", t: "Primary sector", d: "Takes products directly from nature.", ex: "Coffee farm, fishing, mining." },
    { e: "🏭", t: "Secondary sector", d: "Transforms raw materials into products.", ex: "Roasting coffee, making clothes, building houses." },
    { e: "🛍️", t: "Tertiary sector", d: "Gives services and sells products.", ex: "Café, hospital, bus driver, bank." },
    { e: "🔬", t: "Quaternary sector", d: "Creates and shares knowledge and information.", ex: "Researchers, programmers, data analysts." },
    { e: "👔", t: "Quinary sector", d: "Top decision makers who set rules for others.", ex: "CEOs, ministers, the president." },
    { e: "💼", t: "Source of income", d: "Where your money comes from. Active = you work for it. Passive = it arrives with little daily work.", ex: "Salary (active), rent (passive)." },
  ],
  rounds: [
    { tag: "QUICK 1", q: "🐟 A fisherman in Tumaco works in the…", options: ["Primary sector", "Secondary sector", "Tertiary sector"], correct: 0, explain: "He takes fish from nature." },
    { tag: "QUICK 2", q: "👕 A factory that makes T-shirts in Medellín is in the…", options: ["Secondary sector", "Primary sector", "Quinary sector"], correct: 0, explain: "It transforms cotton into clothes." },
    { tag: "QUICK 3", q: "🩺 A nurse at a hospital works in the…", options: ["Tertiary sector", "Secondary sector", "Primary sector"], correct: 0, explain: "She gives a service." },
    { tag: "QUICK 4", q: "💻 A scientist who studies new medicines works in the…", options: ["Quaternary sector", "Tertiary sector", "Primary sector"], correct: 0, explain: "Research = knowledge." },
    { tag: "QUICK 5", q: "💼 A salary from a job is…", options: ["Active income", "Passive income", "An expense"], correct: 0, explain: "You work to earn it." },
  ],
};

/* ---------- ECONOMIC CITY BUILDER ---------- */
const BUILDINGS = [
  { id: "coffeefarm", e: "☕", n: "Coffee farm", s: 1, chain: "coffee" }, { id: "roaster", e: "🔥", n: "Coffee roaster", s: 2, chain: "coffee" }, { id: "cafe", e: "🏪", n: "Café", s: 3, chain: "coffee" },
  { id: "wheat", e: "🌾", n: "Wheat farm", s: 1, chain: "bread" }, { id: "bakeryfac", e: "🏭", n: "Bread factory", s: 2, chain: "bread" }, { id: "market", e: "🛒", n: "Supermarket", s: 3, chain: "bread" },
  { id: "cotton", e: "☁️", n: "Cotton field", s: 1, chain: "clothes" }, { id: "textile", e: "🧵", n: "Textile factory", s: 2, chain: "clothes" }, { id: "store", e: "👕", n: "Clothing store", s: 3, chain: "clothes" },
  { id: "forest", e: "🌲", n: "Tree plantation", s: 1, chain: "wood" }, { id: "furniture", e: "🪑", n: "Furniture workshop", s: 2, chain: "wood" }, { id: "homestore", e: "🛋️", n: "Home store", s: 3, chain: "wood" },
  { id: "lab", e: "🔬", n: "Research lab", s: 4, chain: "bonus" }, { id: "hall", e: "🏛️", n: "City hall", s: 5, chain: "bonus" },
];
const CHAINS = [
  { id: "coffee", e: "☕", n: "Coffee", income: 120 }, { id: "bread", e: "🍞", n: "Bread", income: 100 },
  { id: "clothes", e: "👕", n: "Clothes", income: 140 }, { id: "wood", e: "🪑", n: "Furniture", income: 160 },
];
const SECT = { 1: ["🌱", "Grow", "Primary"], 2: ["🏭", "Transform", "Secondary"], 3: ["🛍️", "Sell & serve", "Tertiary"], 4: ["🔬", "Know", "Quaternary"], 5: ["👔", "Decide", "Quinary"] };
function EconomicCity({ onSave, onExit }) {
  const [grid, setGrid] = useState({}); // `${chain}-${sector}` -> building id
  const [sel, setSel] = useState(null);
  const [alert, setAlert] = useState("");
  const [day, setDay] = useState(0);
  const [errors, setErrors] = useState(0);
  const [st, finish] = useFinish(onSave);
  const palette = useMemo(() => shuffleArr(BUILDINGS), []);
  const used = Object.values(grid);
  const complete = (c) => [1, 2, 3].every((s) => grid[`${c}-${s}`]);
  const fullChains = CHAINS.filter((c) => complete(c.id));
  const bonus = grid["bonus-4"] && grid["bonus-5"];
  const daily = fullChains.reduce((a, c) => a + c.income, 0) * (bonus ? 1.25 : 1);
  const place = (chain, s) => {
    if (!sel) return;
    const b = BUILDINGS.find((x) => x.id === sel);
    if (chain === "bonus") {
      if (b.s !== s) { setErrors(errors + 1); setAlert(`❌ ${b.e} ${b.n} is not ${SECT[s][2].toLowerCase()} — try again!`); return; }
    } else {
      if (b.s !== s) { setErrors(errors + 1); setAlert(`❌ A ${b.n.toLowerCase()} can't do “${SECT[s][1]}”. It belongs to the ${SECT[b.s][2].toLowerCase()} sector.`); return; }
      if (b.chain !== chain) { setErrors(errors + 1); setAlert(`⛓️ Broken chain! A ${b.n.toLowerCase()} doesn't work with ${CHAINS.find((c) => c.id === chain).n.toLowerCase()}.`); return; }
    }
    setGrid({ ...grid, [`${chain}-${s}`]: sel }); setSel(null); setAlert("");
  };
  if (st.done) return <Reward title="Your city is alive! 🏙️" subtitle="Money travels through all the sectors." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Building2 size={22} strokeWidth={2.1} />} title="Economic City Builder 🏙️" subtitle="Build 4 complete value chains. Then watch the money travel!" onExit={onExit}>
      <HowTo>1) Tap a building in the box. 2) Tap the empty lot where it belongs: <b>Grow</b> (primary) → <b>Transform</b> (secondary) → <b>Sell</b> (tertiary). A chain only makes money when it is complete. Bonus: add a 🔬 lab and a 🏛️ city hall (+25% income).</HowTo>
      <div className="g8-citystats"><span>🏗️ Chains: <b>{fullChains.length}/4</b></span><span>💰 City income: <b>{Math.round(daily)} coins/day</b></span><span>❌ Mistakes: <b>{errors}</b></span></div>
      <div className="g8-city">
        <div className="g8-city-head"><span />{[1, 2, 3].map((s) => <span key={s}>{SECT[s][0]} {SECT[s][1]}<small>{SECT[s][2]}</small></span>)}</div>
        {CHAINS.map((c) => (
          <div key={c.id} className={`g8-city-row ${complete(c.id) ? "live" : ""}`}>
            <b>{c.e} {c.n}</b>
            {[1, 2, 3].map((s) => { const bid = grid[`${c.id}-${s}`]; const bb = BUILDINGS.find((x) => x.id === bid); return (
              <button key={s} type="button" className={`g8-lot ${bb ? "built" : ""} ${sel && !bb ? "ready" : ""}`} onClick={() => !bb && place(c.id, s)}>{bb ? <><em>{bb.e}</em><small>{bb.n}</small></> : <i>+</i>}</button>
            ); })}
            {complete(c.id) && <span className="g8-flow">💵 → → →</span>}
          </div>
        ))}
        <div className={`g8-city-row bonus ${bonus ? "live" : ""}`}>
          <b>⭐ Bonus</b>
          {[4, 5].map((s) => { const bid = grid[`bonus-${s}`]; const bb = BUILDINGS.find((x) => x.id === bid); return (
            <button key={s} type="button" className={`g8-lot ${bb ? "built" : ""} ${sel && !bb ? "ready" : ""}`} onClick={() => !bb && place("bonus", s)}>{bb ? <><em>{bb.e}</em><small>{bb.n}</small></> : <i>{SECT[s][0]} {SECT[s][2]}</i>}</button>
          ); })}
        </div>
      </div>
      {alert && <div className="p1-banner bad"><span>{alert}</span></div>}
      <div className="g8-palette">
        <small>🧰 BUILDING BOX — tap one</small>
        <div>{palette.filter((b) => !used.includes(b.id)).map((b) => <button key={b.id} type="button" className={sel === b.id ? "on" : ""} onClick={() => setSel(sel === b.id ? null : b.id)}><em>{b.e}</em>{b.n}</button>)}</div>
      </div>
      {fullChains.length === 4 && (
        <div className="start-block g8-moneytrip">
          <h3>💵 Follow the money · Day {day}</h3>
          <div className="g8-trip">{["👩 Customer", "🏪 Café", "🔥 Roaster", "☕ Farmer"].map((x, i) => <span key={x} className={day > i ? "on" : ""}>{x}{i < 3 && <i>→</i>}</span>)}</div>
          <p className="start-tip">{["Press the button to open the city for one day.", "A customer pays $6,000 for a coffee at the café (tertiary).", "The café pays the roaster for coffee bags (secondary).", "The roaster pays the farmer for the beans (primary). One payment fed three sectors! 🎉"][Math.min(day, 3)]}</p>
          {day < 3 ? <button className="s1-btn ghost" onClick={() => setDay(day + 1)}><Play size={15} /> Next step</button> : null}
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={fullChains.length < 4 || day < 3} onClick={() => finish(Math.max(20, 36 - errors * 2) + (bonus ? 4 : 0), { chains: fullChains.length, bonus: !!bonus, errors })}>{fullChains.length < 4 ? `${fullChains.length}/4 chains` : day < 3 ? "Follow the money first" : "Save my city"} <span className="coin-tag"><Coins size={15} /> +{Math.max(20, 36 - errors * 2) + (bonus ? 4 : 0)}</span></button></div>
    </ActShell>
  );
}

/* ---------- SECTOR SORT ---------- */
const SECTOR_B = [{ id: "p1", label: "Primary", icon: "🌱", color: "#16b074" }, { id: "p2", label: "Secondary", icon: "🏭", color: "#c9902a" }, { id: "p3", label: "Tertiary", icon: "🛍️", color: "#e07a2f" }, { id: "p4", label: "Quaternary", icon: "🔬", color: "#0b7a50" }, { id: "p5", label: "Quinary", icon: "👔", color: "#ff6b57" }];
const SECTOR_ITEMS = [
  { e: "☕", label: "Coffee picker in Quindío", answer: "p1" }, { e: "🐄", label: "Cattle farmer in Córdoba", answer: "p1" }, { e: "⛏️", label: "Emerald miner in Boyacá", answer: "p1" }, { e: "🎣", label: "Fisherman in Tumaco", answer: "p1" },
  { e: "🍫", label: "Chocolate factory worker", answer: "p2", why: "Cacao → chocolate bars: transformation." }, { e: "🏗️", label: "Construction worker building a hospital", answer: "p2", why: "Construction belongs to the secondary sector." }, { e: "👗", label: "Seamstress in a clothing factory", answer: "p2" }, { e: "🚗", label: "Car assembly line worker", answer: "p2" },
  { e: "🚌", label: "TransMilenio bus driver", answer: "p3" }, { e: "🩺", label: "Nurse in a clinic", answer: "p3" }, { e: "🛒", label: "Supermarket cashier", answer: "p3" }, { e: "🧭", label: "Tourist guide in Cartagena", answer: "p3" },
  { e: "🧬", label: "Scientist improving coffee seeds", answer: "p4", why: "Research and knowledge = quaternary." }, { e: "💻", label: "Data analyst for an online store", answer: "p4" }, { e: "📰", label: "Journalist who researches economic news", answer: "p4" },
  { e: "🏛️", label: "Minister of Finance", answer: "p5", why: "Top-level decisions for the whole country." }, { e: "👔", label: "CEO of a big bank", answer: "p5" }, { e: "🎓", label: "Rector who sets rules for a university", answer: "p5" },
];

/* ---------- BLUEPRINT 02 · INCOME MAP ---------- */
const INCOME_ROUNDS = [
  { tag: "INCOME 1", q: "Laura receives $80,000 every week from her parents.", options: ["Allowance (gift)", "Active income", "Passive income"], correct: 0, explain: "It's given to her, not earned." },
  { tag: "INCOME 2", q: "Tomás sells bracelets at school on Fridays.", options: ["Active income", "Passive income", "Allowance"], correct: 0, explain: "He works to earn it." },
  { tag: "INCOME 3", q: "Mrs. Ruiz rents a small apartment and receives $900,000 a month.", options: ["Passive income", "Active income", "An expense"], correct: 0, explain: "It arrives with little daily work." },
  { tag: "INCOME 4", q: "A bank pays you interest on your savings.", options: ["Passive income", "Active income", "A salary"], correct: 0, explain: "Your money works for you." },
  { tag: "INCOME 5", q: "Sara walks her neighbor's dogs and earns $15,000 per walk.", options: ["Active income", "Passive income", "Allowance"], correct: 0, explain: "She works for it." },
  { tag: "INCOME 6", q: "A YouTube video you made last year still earns a little money every month.", options: ["Passive income", "Active income", "An expense"], correct: 0, explain: "Work once, income keeps arriving." },
];
const MY_SOURCES = [["allow", "💵", "Allowance", "gift"], ["gift", "🎁", "Birthday & gifts", "gift"], ["sell", "🧺", "Selling things", "active"], ["help", "🧹", "Helping family / neighbors", "active"], ["tutor", "📚", "Tutoring", "active"], ["content", "🎥", "Content online", "passive"], ["interest", "🐷", "Interest from savings", "passive"]];
const DREAM_JOBS = [["☕", "Coffee grower", 1], ["🏗️", "Engineer in construction", 2], ["🍫", "Chocolate maker", 2], ["🩺", "Doctor", 3], ["🎨", "Graphic designer", 3], ["🧭", "Tourism guide", 3], ["💻", "Programmer", 4], ["🧬", "Scientist", 4], ["👔", "CEO of my own company", 5], ["🏛️", "Politician / minister", 5]];
function IncomeMap({ existing, onSave, onExit }) {
  const [stage, setStage] = useState(existing ? 1 : 0);
  const [amt, setAmt] = useState(existing?.amounts || {});
  const [dream, setDream] = useState(existing?.dream ?? null);
  const [why, setWhy] = useState(existing?.why || "");
  const [st, finish] = useFinish(onSave);
  const active = MY_SOURCES.filter(([k]) => num(amt[k]) > 0);
  const totalBy = (t) => active.filter((x) => x[3] === t).reduce((a, [k]) => a + num(amt[k]), 0);
  const tot = active.reduce((a, [k]) => a + num(amt[k]), 0);
  const ready = active.length >= 2 && dream !== null && goalsOk(why, 8, 60, [W_REASON]);
  if (st.done) return <Reward title="Income map ready! 🗺️" subtitle="Blueprint page 02 is ready." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<MapIcon size={22} strokeWidth={2.1} />} title="My Income Map 🗺️" subtitle="Where does your money come from today — and tomorrow?" onExit={onExit}>
      <BPBadge n="02" />
      {stage === 0 ? (
        <>
          <HowTo>First, 6 quick cases: is it <b>active</b> income, <b>passive</b> income or a <b>gift/allowance</b>?</HowTo>
          <RoundsRunner rounds={INCOME_ROUNDS} doneLabel="Now build MY map" onDone={() => setStage(1)} />
        </>
      ) : (
        <>
          <div className="start-block">
            <h3><span className="step-n">1</span> My income today (one month · approximate)</h3>
            {MY_SOURCES.map(([k, e, l, t]) => <div key={k} className="g8-row"><span>{e} {l} <small className={`g8-tag ${t}`}>{t}</small></span><MoneyInput value={amt[k] || ""} onChange={(v) => setAmt({ ...amt, [k]: v })} /></div>)}
            {tot > 0 && <StackBar parts={[{ label: "Active", value: totalBy("active"), color: "#16b074" }, { label: "Passive", value: totalBy("passive"), color: "#0b7a50" }, { label: "Gifts / allowance", value: totalBy("gift"), color: "#f5b23e" }]} />}
          </div>
          <div className="start-block">
            <h3><span className="step-n">2</span> My future income: a job I would like</h3>
            <div className="g72-opts">{DREAM_JOBS.map(([e, n, s], i) => <button key={n} type="button" className={`g72-opt ${dream === i ? "on" : ""}`} onClick={() => setDream(i)}><em>{e}</em><span>{n}<br /><small>{SECT[s][0]} {SECT[s][2]}</small></span></button>)}</div>
            <p className="start-tip">Write 2 sentences: the sector of that job and why you like it.</p>
            <WordField value={why} onChange={setWhy} min={8} max={60} rows={3} goals={[W_REASON]} placeholder="Write your answer here…" />
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(25, { amounts: amt, total: tot, active: totalBy("active"), passive: totalBy("passive"), gifts: totalBy("gift"), dream, dreamJob: DREAM_JOBS[dream][1], sector: SECT[DREAM_JOBS[dream][2]][2], why })}>{active.length < 2 ? "Add 2+ sources" : "Save page 02"} <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   CLASE 3 · THE SHOPPING TRAP
   ===================================================================== */
const START_3 = {
  cards: [
    { e: "✅", t: "Need", d: "Something you must pay to live, study or work.", ex: "Bus to school, lunch." },
    { e: "🎁", t: "Want", d: "Nice to have, but you can live without it.", ex: "New sneakers when your old ones work." },
    { e: "📌", t: "Fixed expense", d: "Costs the same amount every month.", ex: "Phone plan, a subscription." },
    { e: "🎢", t: "Variable expense", d: "The amount changes from week to week.", ex: "Snacks, gifts, taxis." },
    { e: "🏦", t: "Bank statement", d: "A list of all the money that came in and went out of an account, with dates.", ex: "“Mar 3 · Bus card · −$20,000”." },
    { e: "⚖️", t: "Balance", d: "The money that is left in an account after each movement.", ex: "Income − expenses." },
  ],
  rounds: [
    { tag: "QUICK 1", q: "🚌 A monthly bus card to go to school (same price every month) is…", options: ["Fixed need", "Variable want", "Fixed want"], correct: 0, explain: "Same price + necessary." },
    { tag: "QUICK 2", q: "🍫 Snacks after school (some weeks more, some weeks less) are…", options: ["Variable want", "Fixed need, because you buy them often", "Fixed want"], correct: 0, explain: "The amount changes and you can live without them." },
    { tag: "QUICK 3", q: "🎬 A streaming subscription is…", options: ["Fixed want", "Variable need", "Fixed need"], correct: 0, explain: "Same price, but not necessary." },
    { tag: "QUICK 4", q: "🍱 Lunch at school (it changes with the menu) is…", options: ["Variable need", "Fixed want", "Variable want"], correct: 0, explain: "Necessary, and the amount changes." },
    { tag: "QUICK 5", q: "On a bank statement, the BALANCE is…", options: ["the money left after each movement", "the biggest purchase of the month", "the name of the bank"], correct: 0, explain: "It updates after every movement." },
  ],
};

/* ---------- EXPENSE DETECTIVE ---------- */
const DANIEL_TX = [
  { d: "Mar 1", t: "Allowance from parents", v: 400000, in: true },
  { d: "Mar 1", t: "Phone plan · ClaroMóvil", v: 30000, need: ["need"], fix: ["fixed"] },
  { d: "Mar 2", t: "Bus card top-up", v: 25000, need: ["need"], fix: ["variable"] },
  { d: "Mar 2", t: "Streaming · StreamFlix", v: 17000, need: ["want"], fix: ["fixed"] },
  { d: "Mar 3", t: "School lunch", v: 12000, need: ["need"], fix: ["variable"] },
  { d: "Mar 3", t: "Snack · Tienda Don Pepe", v: 5000, need: ["want"], fix: ["variable"] },
  { d: "Mar 4", t: "School lunch", v: 12000, need: ["need"], fix: ["variable"] },
  { d: "Mar 4", t: "Snack · Tienda Don Pepe", v: 6000, need: ["want"], fix: ["variable"] },
  { d: "Mar 5", t: "Game skin · PlayZone", v: 28000, need: ["want"], fix: ["variable"] },
  { d: "Mar 6", t: "Notebook for math class", v: 8000, need: ["need"], fix: ["variable"] },
  { d: "Mar 7", t: "Cinema with friends", v: 22000, need: ["want"], fix: ["variable"] },
  { d: "Mar 8", t: "Birthday gift for cousin", v: 35000, need: ["want", "need"], fix: ["variable"], note: "A gift can be important for your family — both answers are OK if you explain it." },
  { d: "Mar 9", t: "Bus card top-up", v: 25000, need: ["need"], fix: ["variable"] },
  { d: "Mar 10", t: "Snack · Tienda Don Pepe", v: 6000, need: ["want"], fix: ["variable"] },
  { d: "Mar 11", t: "Phone case (latest model)", v: 45000, need: ["want"], fix: ["variable"], note: "A phone can be necessary for school — but a new fancy case is a want." },
  { d: "Mar 12", t: "School lunch", v: 12000, need: ["need"], fix: ["variable"] },
  { d: "Mar 13", t: "Music app · Tunely", v: 9900, need: ["want"], fix: ["fixed"] },
  { d: "Mar 14", t: "Sneakers 40% OFF · ShoeMania", v: 120000, need: ["want"], fix: ["variable"] },
  { d: "Mar 15", t: "Snack · Tienda Don Pepe", v: 7000, need: ["want"], fix: ["variable"] },
  { d: "Mar 16", t: "Bus card top-up", v: 25000, need: ["need"], fix: ["variable"] },
  { d: "Mar 17", t: "Drinks with friends", v: 15000, need: ["want"], fix: ["variable"] },
  { d: "Mar 18", t: "School lunch", v: 12000, need: ["need"], fix: ["variable"] },
  { d: "Mar 19", t: "Gym for teens · monthly", v: 40000, need: ["want", "need"], fix: ["fixed"], note: "Exercise is healthy, but you can also exercise for free — both answers OK." },
  { d: "Mar 20", t: "Snack · Tienda Don Pepe", v: 6000, need: ["want"], fix: ["variable"] },
  { d: "Mar 21", t: "Online store · random gadgets", v: 18000, need: ["want"], fix: ["variable"] },
];
const PATTERN_Q = [
  { tag: "PATTERN 1", q: "Which expense repeats the most?", options: ["🍫 Snacks at Don Pepe", "🎬 Cinema tickets with his friends", "📓 Notebooks for school"], correct: 0, explain: "Small, frequent — a money leak." },
  { tag: "PATTERN 2", q: "What made Daniel's balance go negative?", options: ["The sneakers on sale", "The bus card he recharged twice", "His monthly phone plan"], correct: 0, explain: "$120,000 for a want." },
  { tag: "PATTERN 3", q: "How many FIXED wants (subscriptions) does Daniel pay?", options: ["Two or three", "None, because subscriptions are needs", "Ten — one for every week of the month"], correct: 0, explain: "Subscriptions are easy to forget!" },
  { tag: "RECOMMEND", q: "What is the BEST change for Daniel next month?", options: ["Skip impulse buys, cut one subscription", "Stop taking the bus and walk 10 km to school", "Stop eating lunch on school days"], correct: 0, explain: "Cut wants, protect needs." },
];
function ExpenseDetective({ onSave, onExit }) {
  const [ans, setAns] = useState({});
  const [open, setOpen] = useState(1);
  const [stage, setStage] = useState(0);
  const [rec, setRec] = useState("");
  const [st, finish] = useFinish(onSave);
  const tx = DANIEL_TX;
  let run = 0; const balances = tx.map((x) => (run += x.in ? x.v : -x.v));
  const outs = tx.map((x, i) => ({ ...x, i })).filter((x) => !x.in);
  const doneN = outs.filter((x) => ans[x.i]?.n && ans[x.i]?.f).length;
  const okN = outs.filter((x) => x.need.includes(ans[x.i]?.n) && x.fix.includes(ans[x.i]?.f)).length;
  const sumQ = (n, f) => outs.filter((x) => ans[x.i]?.n === n && ans[x.i]?.f === f).reduce((a, x) => a + x.v, 0);
  const firstNeg = balances.findIndex((b) => b < 0);
  const set = (i, k, v) => { const a = { ...ans, [i]: { ...ans[i], [k]: v } }; setAns(a); if (a[i].n && a[i].f) { const nxt = outs.find((x) => x.i > i && !(a[x.i]?.n && a[x.i]?.f)); setOpen(nxt ? nxt.i : null); } };
  if (st.done) return <Reward title="Case closed, detective! 🕵️" subtitle={`${okN}/${outs.length} transactions classified correctly.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Expense Detective 🕵️" subtitle="Daniel's bank statement for March. Investigate every movement." onExit={onExit}>
      {stage === 0 ? (
        <>
          <HowTo>Open each movement. Decide: <b>Need or Want?</b> and <b>Fixed or Variable?</b> The panel adds the money automatically. Watch the <b>balance</b> column — when does Daniel run out of money?</HowTo>
          <div className="g8-quad">
            {[["need", "fixed", "✅📌 Fixed needs"], ["need", "variable", "✅🎢 Variable needs"], ["want", "fixed", "🎁📌 Fixed wants"], ["want", "variable", "🎁🎢 Variable wants"]].map(([n, f, l]) => <div key={l} className={`${n} ${f}`}><small>{l}</small><b>{cop(sumQ(n, f))}</b></div>)}
          </div>
          <div className="g8-statement">
            <header><b>🏦 CREAR Bank · Account statement</b><span>Daniel R. · March</span></header>
            <div className="g8-st-h"><span>Date</span><span>Description</span><span>Amount</span><span>Balance</span></div>
            {tx.map((x, i) => (
              <div key={i}>
                <button type="button" className={`g8-st-row ${x.in ? "in" : ""} ${balances[i] < 0 ? "neg" : ""} ${ans[i]?.n && ans[i]?.f ? "done" : ""} ${open === i ? "open" : ""}`} onClick={() => !x.in && setOpen(open === i ? null : i)}>
                  <span>{x.d}</span><span>{x.t}{ans[i]?.n && <i className="g8-chiptag">{ans[i].n === "need" ? "✅" : "🎁"}{ans[i].f === "fixed" ? "📌" : ans[i].f ? "🎢" : ""}</i>}</span><b>{x.in ? "+" : "−"}{cop(x.v)}</b><b>{cop(balances[i])}</b>
                </button>
                {open === i && !x.in && (
                  <div className="g8-st-case">
                    <div className="type-toggle">{["need", "want"].map((v) => <button key={v} type="button" className={ans[i]?.n === v ? "on" : ""} onClick={() => set(i, "n", v)}>{v === "need" ? "✅ Need" : "🎁 Want"}</button>)}</div>
                    <div className="type-toggle">{["fixed", "variable"].map((v) => <button key={v} type="button" className={ans[i]?.f === v ? "on" : ""} onClick={() => set(i, "f", v)}>{v === "fixed" ? "📌 Fixed" : "🎢 Variable"}</button>)}</div>
                    {x.note && <small>💡 {x.note}</small>}
                  </div>
                )}
              </div>
            ))}
          </div>
          {firstNeg >= 0 && <div className="p1-banner bad"><span>🚨 <b>Overdraft alert!</b> On {tx[firstNeg].d} Daniel's balance went below $0 ({tx[firstNeg].t}).</span></div>}
          <div className="start-foot"><span className="sort-count">{doneN}/{outs.length} classified</span><button className="s1-btn primary big" disabled={doneN < outs.length} onClick={() => setStage(1)}>Check my answers <ChevronRight size={18} /></button></div>
        </>
      ) : stage === 1 ? (
        <>
          <div className="g73-score"><small>CORRECT CLASSIFICATIONS</small><b className={okN >= 18 ? "good" : ""}>{okN}/{outs.length}</b><span>Wrong ones are marked in the statement below.</span></div>
          <div className="g8-wronglist">{outs.filter((x) => !(x.need.includes(ans[x.i]?.n) && x.fix.includes(ans[x.i]?.f))).map((x) => <span key={x.i}>✗ {x.t}: <b>{x.need.join(" / ")} · {x.fix.join(" / ")}</b></span>)}</div>
          <RoundsRunner rounds={PATTERN_Q} doneLabel="Write my recommendation" onDone={() => setStage(2)} />
        </>
      ) : (
        <>
          <div className="start-block">
            <h3><PenLine size={18} /> Your audit: 3 conclusions for Daniel (min 30 words)</h3>
            <Starters items={["First, Daniel spends too much on", "Second, his balance went negative because", "Finally, he should"]} onPick={appendStarter(setRec)} />
            <WordField value={rec} onChange={setRec} min={30} max={110} rows={5} goals={[W_NUMBERS(1), W_ADVICE]} placeholder="Write your audit here…" />
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(rec, 30, 110, [W_NUMBERS(1), W_ADVICE])} onClick={() => finish(okN + 12, { correct: okN, total: outs.length, text: rec })}>Close the case <span className="coin-tag"><Coins size={15} /> +{okN + 12}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- BLUEPRINT 03 · CREATE MY STATEMENT ---------- */
const TX_POOL = [["🚌", "Bus card top-up", 25000, "need", "variable"], ["🍱", "Lunch", 12000, "need", "variable"], ["📱", "Phone plan", 30000, "need", "fixed"], ["🎬", "Streaming", 17000, "want", "fixed"], ["🎵", "Music app", 9900, "want", "fixed"], ["🍫", "Snack", 5000, "want", "variable"], ["🥤", "Drink", 4000, "want", "variable"], ["🎮", "Game credits", 20000, "want", "variable"], ["📓", "School supplies", 15000, "need", "variable"], ["👕", "T-shirt", 45000, "want", "variable"], ["🎁", "Gift for a friend", 30000, "want", "variable"], ["✂️", "Haircut", 18000, "need", "variable"], ["🏋️", "Sports class", 40000, "need", "fixed"], ["🍕", "Pizza with friends", 25000, "want", "variable"], ["🚕", "Taxi / ride app", 14000, "want", "variable"], ["🐷", "Transfer to savings", 30000, "save", "fixed"]];
function MyStatement({ existing, onSave, onExit }) {
  const [income, setIncome] = useState(existing?.income || 300000);
  const [rows, setRows] = useState(existing?.rows || []);
  const [concl, setConcl] = useState(existing?.concl || { a: "", b: "", c: "" });
  const [st, finish] = useFinish(onSave);
  const add = (p) => setRows([...rows, { e: p[0], t: p[1], v: p[2], n: p[3], f: p[4], day: Math.min(30, rows.length * 3 + 2) }]);
  const upd = (i, k, v) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const sorted = rows.map((r, i) => ({ ...r, i })).sort((a, b) => a.day - b.day);
  let bal = num(income); const withBal = sorted.map((r) => ({ ...r, bal: (bal -= num(r.v)) }));
  const by = (n) => rows.filter((r) => r.n === n).reduce((a, r) => a + num(r.v), 0);
  const fixedN = rows.filter((r) => r.f === "fixed").length, varN = rows.filter((r) => r.f === "variable").length;
  const FR = [{ k: "a", f: "My biggest category is" }, { k: "b", f: "My fixed expenses are" }, { k: "c", f: "One change I can make is" }];
  const ready = rows.length >= 8 && fixedN >= 2 && varN >= 2 && FR.every((x) => countWords(concl[x.k]) >= 4);
  if (st.done) return <Reward title="Statement created! 🧾" subtitle="Blueprint page 03 is ready." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<FileText size={22} strokeWidth={2.1} />} title="Create My Statement 🧾" subtitle="Now YOU are the bank. Build a realistic month statement for yourself." onExit={onExit}>
      <BPBadge n="03" />
      <HowTo>1) Write your monthly income. 2) Tap cards to add movements (8 or more). 3) Change the day and the amount if you want. The statement orders them by date and calculates the <b>balance</b>. Include at least 2 fixed and 2 variable expenses.</HowTo>
      <div className="g8-row big"><span>💵 My monthly income (day 1)</span><MoneyInput value={income} onChange={setIncome} /></div>
      <div className="g8-txpool">{TX_POOL.map((p) => <button key={p[1]} type="button" onClick={() => add(p)}><em>{p[0]}</em>{p[1]}<small>{cop(p[2])}</small></button>)}</div>
      <div className="g8-statement mine">
        <header><b>🏦 My Bank · Account statement</b><span>{rows.length} movements</span></header>
        <div className="g8-st-h five"><span>Day</span><span>Description</span><span>Type</span><span>Amount</span><span>Balance</span></div>
        <div className="g8-st-row in five"><span>1</span><span>Income</span><span>—</span><b>+{cop(num(income))}</b><b>{cop(num(income))}</b></div>
        {withBal.map((r) => (
          <div key={r.i} className={`g8-st-row five edit ${r.bal < 0 ? "neg" : ""}`}>
            <span><input type="number" min="1" max="30" value={r.day} onChange={(e) => upd(r.i, "day", clamp(Number(e.target.value) || 1, 1, 30))} /></span>
            <span>{r.e} {r.t}</span>
            <span className="g8-mini"><button type="button" className={r.f === "fixed" ? "on" : ""} onClick={() => upd(r.i, "f", r.f === "fixed" ? "variable" : "fixed")}>{r.f === "fixed" ? "📌 fixed" : "🎢 variable"}</button></span>
            <b><input type="number" min="0" value={r.v} onChange={(e) => upd(r.i, "v", num(e.target.value))} /></b>
            <b>{cop(r.bal)} <button type="button" className="exp-del" onClick={() => setRows(rows.filter((_, j) => j !== r.i))} aria-label="Delete"><Trash2 size={13} /></button></b>
          </div>
        ))}
      </div>
      {rows.length > 0 && <HBars rows={[{ e: "✅", l: "Needs", v: by("need"), c: "#0b7a50" }, { e: "🎁", l: "Wants", v: by("want"), c: "#e07a2f" }, { e: "🐷", l: "Savings", v: by("save"), c: "#f5b23e" }]} />}
      <div className="g73-checklist">{[["8+ movements", rows.length >= 8], ["2+ fixed", fixedN >= 2], ["2+ variable", varN >= 2], ["Balance never below $0", withBal.every((r) => r.bal >= 0)]].map(([l, ok]) => <span key={l} className={ok ? "ok" : ""}>{ok ? "✅" : "○"} {l}</span>)}</div>
      <div className="start-block"><h3><PenLine size={18} /> My 3 conclusions</h3>{FR.map((x) => <div key={x.k} className="p3-sentence edit"><span>{x.f}</span><input className="start-input" value={concl[x.k]} onChange={(e) => setConcl({ ...concl, [x.k]: e.target.value })} placeholder="Write your answer here…" /></div>)}</div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { income: num(income), rows, needs: by("need"), wants: by("want"), save: by("save"), concl, final: withBal.length ? withBal[withBal.length - 1].bal : num(income) })}>Save page 03 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 4 · BUDGET UNDER PRESSURE
   ===================================================================== */
function FirstBudget({ onSave, onExit }) {
  const [j, setJ] = useState({ needs: 0, wants: 0, save: 0 });
  const [checked, setChecked] = useState(false);
  const [st, finish] = useFinish(onSave);
  const tot = j.needs + j.wants + j.save;
  const left = 100000 - tot;
  const set = (k) => (v) => { setChecked(false); setJ({ ...j, [k]: Math.min(v, j[k] + left) }); };
  const ok = left === 0 && j.save >= 10000 && j.needs >= 40000;
  const JARS = [["needs", "🏠", "Needs", "#0b7a50", 50000], ["wants", "🎉", "Wants", "#e07a2f", 30000], ["save", "🐷", "Savings", "#f5b23e", 20000]];
  if (st.done) return <Reward title="Your first budget! 🫙" subtitle="Every peso has a job." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<PiggyBank size={22} strokeWidth={2.1} />} title="My First Budget 🫙 · Starter" subtitle="Never made a budget? Start here: $100,000 and three jars." onExit={onExit}>
      <div className="g7-concepts g8-three">
        {[["📋", "Budget", "A plan for your money BEFORE you spend it."], ["🧮", "50 / 30 / 20", "50% needs · 30% wants · 20% savings. A guideline, not a law."], ["0️⃣", "Zero-based", "Every peso gets a job (savings is a job too!). Income − plan = $0."]].map(([e, t, d]) => <div key={t} className="g7-concept open"><em>{e}</em><b>{t}</b><p>{d}</p></div>)}
      </div>
      <HowTo>Move the sliders to fill the three jars. Mission: use <b>all $100,000</b>, at least <b>$40,000 for needs</b> and at least <b>$10,000 for savings</b>.</HowTo>
      <div className="g8-jars">
        {JARS.map(([k, e, l, c, tgt]) => (
          <div key={k} className="g8-jar" style={{ "--jc": c }}>
            <div className="g8-jar-glass"><i style={{ height: `${(j[k] / 100000) * 100}%` }} /><b>{cop(j[k])}</b></div>
            <span>{e} {l}</span><small>50/30/20 says: {cop(tgt)}</small>
            <input type="range" min="0" max="100000" step="5000" value={j[k]} onChange={(e2) => set(k)(Number(e2.target.value))} />
          </div>
        ))}
      </div>
      <div className={`g8-left ${left === 0 ? "ok" : ""}`}>{left === 0 ? "✅ Every peso has a job!" : `💵 ${cop(left)} without a job`}</div>
      {checked && <div className={`g72-conseq ${ok ? "f2" : "f0"}`}><b>{ok ? "✅ Balanced budget!" : "Not yet…"}</b><span>{ok ? (j.needs === 50000 && j.wants === 30000 ? "You used exactly 50/30/20. 👏" : "Different from 50/30/20 — and that's OK if you can explain it.") : left !== 0 ? "Give a job to all the money." : j.needs < 40000 ? "Needs first! Put at least $40,000 there." : "Savings ALWAYS — at least $10,000."}</span></div>}
      <div className="start-foot">
        {!ok || !checked ? <button className="s1-btn primary big" onClick={() => setChecked(true)}>Check my budget <Check size={16} /></button>
          : <button className="s1-btn primary big" onClick={() => finish(18, { jars: j })}>Finish <span className="coin-tag"><Coins size={15} /> +18</span></button>}
      </div>
    </ActShell>
  );
}

const BUDGET_MATH = [
  { tag: "1 · 50/30/20", q: "Income $800,000. With 50/30/20, how much for NEEDS?", answer: 400000, money: true, hint: "50% = half", explain: "$400,000." },
  { tag: "2 · 50/30/20", q: "Same income ($800,000). How much for WANTS?", answer: 240000, money: true, hint: "800,000 × 0.30", explain: "$240,000." },
  { tag: "3 · 50/30/20", q: "Same income. How much for SAVINGS?", answer: 160000, money: true, hint: "800,000 × 0.20", explain: "$160,000." },
  { tag: "4 · ZERO-BASED", q: "Income $500,000. Planned: needs $260,000, wants $120,000, savings $90,000. How much still has NO job?", visual: <MiniTable head={["Plan", "Amount"]} rows={[["Needs", "$260,000"], ["Wants", "$120,000"], ["Savings", "$90,000"]]} foot={["Income", "$500,000"]} />, answer: 30000, money: true, hint: "500,000 − (260,000 + 120,000 + 90,000)", explain: "$30,000 — give it a job (savings or emergency)!" },
  { tag: "5 · PERCENT", q: "Andrés saves $200,000 of $600,000. What % is that? (whole number)", answer: 33, tol: 1, unit: "%", hint: "200,000 ÷ 600,000 × 100", explain: "About 33%." },
  { tag: "6 · SURPRISE", q: "A $80,000 repair arrives. Andrés had $150,000 for wants. If he pays it ALL from wants, how much is left for wants?", answer: 70000, money: true, hint: "150,000 − 80,000", explain: "$70,000." },
  { tag: "7 · CHOOSE", q: "Juliana's needs are 70% of her income because her bus is very expensive. What should she do?", options: ["Adapt the percentages (70/20/10)", "Keep 50/30/20 and stop taking the bus", "Stop saving forever because the rule failed"], correct: 0, explain: "50/30/20 is a guideline — adapt it." },
  { tag: "8 · CHOOSE", q: "A zero-based budget ends with $0. That means…", options: ["Every peso has a planned job", "You spent all your money on things you wanted", "You have no savings at all this month"], correct: 0, explain: "Savings is a job too!" },
];

const BB_CATS = [
  { k: "transport", e: "🚌", l: "Transport", g: "need", min: 60000 },
  { k: "lunch", e: "🍱", l: "Lunches", g: "need", min: 120000 },
  { k: "phone", e: "📱", l: "Phone plan", g: "need", min: 30000 },
  { k: "trip", e: "🎒", l: "School trip", g: "need", min: 0 },
  { k: "fun", e: "🎮", l: "Fun & games", g: "want", min: 0 },
  { k: "clothes", e: "👕", l: "Clothes", g: "want", min: 0 },
  { k: "gifts", e: "🎁", l: "Gifts", g: "want", min: 0 },
  { k: "bike", e: "🚲", l: "Bike goal", g: "save", min: 0 },
  { k: "emerg", e: "🛟", l: "Emergency fund", g: "save", min: 0 },
];
const SURPRISES = [
  { id: "repair", e: "🔧", h: "Your bicycle broke!", d: "You need it to go to school. Repair: $80,000.", add: 80000, cut: 0 },
  { id: "screen", e: "📱", h: "Your phone screen cracked", d: "You need it for homework. Repair: $90,000.", add: 90000, cut: 0 },
  { id: "income", e: "📉", h: "Your uncle can only pay $520,000", d: "The store had a bad month. Your income goes down $80,000.", add: 0, cut: 80000 },
  { id: "doctor", e: "🦷", h: "Emergency dentist visit", d: "A tooth hurts. Part not covered: $70,000.", add: 70000, cut: 0 },
];
const groupOf = (b, g) => BB_CATS.filter((c) => c.g === g).reduce((a, c) => a + (b[c.k] || 0), 0);
function BudgetBattle({ existing, onSave, onExit }) {
  const INC = 600000;
  const [mode, setMode] = useState("503020");
  const [round, setRound] = useState(0); // 0 plan · 1 surprise · 2 rebuild · 3 explain
  const [b1, setB1] = useState(existing?.before || Object.fromEntries(BB_CATS.map((c) => [c.k, c.min])));
  const [b2, setB2] = useState(null);
  const [ev] = useState(() => SURPRISES[Math.floor(Math.random() * SURPRISES.length)]);
  const [txt, setTxt] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const cur = round >= 2 ? b2 : b1;
  const income = round >= 2 ? INC - ev.cut : INC;
  const extra = round >= 2 ? ev.add : 0;
  const spent = BB_CATS.reduce((a, c) => a + (cur[c.k] || 0), 0) + extra;
  const left = income - spent;
  const setV = (k, v) => { const c = BB_CATS.find((x) => x.k === k); const val = Math.max(c.min, v); (round >= 2 ? setB2 : setB1)({ ...cur, [k]: val }); };
  const needs = groupOf(cur, "need") + extra, wants = groupOf(cur, "want"), save = groupOf(cur, "save");
  const balanced = left === 0;
  const valid = balanced && save > 0;
  const tgt = { need: income * 0.5, want: income * 0.3, save: income * 0.2 };
  const Bars = ({ b, inc, ex }) => <PctBar parts={[{ label: "Needs", value: Math.round(((groupOf(b, "need") + (ex || 0)) / inc) * 100), color: "#0b7a50" }, { label: "Wants", value: Math.round((groupOf(b, "want") / inc) * 100), color: "#e07a2f" }, { label: "Savings", value: Math.round((groupOf(b, "save") / inc) * 100), color: "#f5b23e" }]} />;
  if (st.done) return <Reward title="Budget survived! ⚖️" subtitle="Blueprint page 04 is ready." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  const editor = (
    <>
      <div className="g73-toggle2"><button type="button" className={mode === "503020" ? "on" : ""} onClick={() => setMode("503020")}>📊 50 / 30 / 20 guide</button><button type="button" className={mode === "zero" ? "on" : ""} onClick={() => setMode("zero")}>0️⃣ Zero-based check</button></div>
      <div className="g8-bb">
        {["need", "want", "save"].map((g) => (
          <div key={g} className={`g8-bb-group ${g}`}>
            <header><b>{g === "need" ? "🏠 Needs" : g === "want" ? "🎉 Wants" : "🐷 Savings"}</b>{mode === "503020" && <small>Guide: {cop(tgt[g])} · You: {cop(g === "need" ? needs : g === "want" ? wants : save)}</small>}</header>
            {g === "need" && extra > 0 && <div className="g8-row ev"><span>{ev.e} {ev.h}</span><b>{cop(extra)}</b></div>}
            {BB_CATS.filter((c) => c.g === g).map((c) => <React.Fragment key={c.k}>{Ctl({ l: `${c.e} ${c.l}${c.min ? ` (min ${cop(c.min)})` : ""}`, v: cur[c.k] || 0, set: (v) => setV(c.k, v), mn: c.min, mx: 400000, stp: 10000, fmt: cop })}</React.Fragment>)}
          </div>
        ))}
      </div>
      <div className={`g8-left ${balanced ? "ok" : left < 0 ? "bad" : ""}`}>{balanced ? "✅ Balanced: every peso has a job" : left > 0 ? `💵 ${cop(left)} without a job` : `🚨 ${cop(-left)} over your income!`}</div>
    </>
  );
  return (
    <ActShell icon={<Scale size={22} strokeWidth={2.1} />} title="Budget Battle ⚖️" subtitle="Plan $600,000. Survive a surprise. Rebuild." onExit={onExit}>
      <BPBadge n="04" />
      <div className="g72-steps">{["1 · Plan it", "2 · Surprise!", "3 · Rebuild", "4 · Explain"].map((s, i) => <span key={s} className={round === i ? "on" : round > i ? "done" : ""}>{s}</span>)}</div>
      {round === 0 && (
        <>
          <Mission e="🛠️" title="You work one month at your uncle's store: $600,000.">You want a 🚲 bike, but you also have transport, lunches, a phone plan and a 🎒 school trip. Build a budget where every peso has a job and savings is more than $0.</Mission>
          {editor}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!valid} onClick={() => { setB2({ ...b1 }); setRound(1); }}>Lock my plan <Lock size={16} /></button></div>
        </>
      )}
      {round === 1 && (
        <>
          <div className="g74-news"><small>📰 TUESDAY · SURPRISE EVENT</small><h3>{ev.e} {ev.h}</h3><p>{ev.d}</p></div>
          <div className="g8-diag"><div><small>Your plan</small><b>{cop(INC)}</b></div><div><small>The problem</small><b className="neg">{ev.add ? `+${cop(ev.add)} expense` : `−${cop(ev.cut)} income`}</b></div><div className="wide"><small>Question</small><b>Where will the money come from: savings, wants or family?</b></div></div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => setRound(2)}>Rebuild my budget <RefreshCw size={16} /></button></div>
        </>
      )}
      {round === 2 && (
        <>
          <HowTo>The surprise is now in your needs (or your income went down). Change the sliders until the budget is balanced again. Needs can't go below their minimum!</HowTo>
          {editor}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!valid} onClick={() => setRound(3)}>My budget survived! <ChevronRight size={18} /></button></div>
        </>
      )}
      {round === 3 && (
        <>
          <div className="g8-two">
            <div className="start-block"><h3>📋 Before</h3><Bars b={b1} inc={INC} /></div>
            <div className="start-block"><h3>🛠️ After the surprise</h3><Bars b={b2} inc={INC - ev.cut} ex={ev.add} /></div>
          </div>
          <div className="g8-changes">{BB_CATS.filter((c) => b1[c.k] !== b2[c.k]).map((c) => <span key={c.k} className={b2[c.k] < b1[c.k] ? "down" : "up"}>{c.e} {c.l}: {cop(b1[c.k])} → {cop(b2[c.k])}</span>)}</div>
          <div className="start-block">
            <h3><PenLine size={18} /> What did you sacrifice and why? (min 25 words)</h3>
            <Starters items={["To pay for the surprise, I reduced", "because", "I kept", "Next month I will add an emergency category so that"]} onPick={appendStarter(setTxt)} />
            <WordField value={txt} onChange={setTxt} min={25} max={100} rows={4} goals={[W_REASON]} placeholder="Write your answer here…" />
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(txt, 25, 100, [W_REASON])} onClick={() => finish(35, { mode, before: b1, after: b2, event: ev.h, eventAdd: ev.add, eventCut: ev.cut, text: txt })}>Save page 04 <span className="coin-tag"><Coins size={15} /> +35</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   CLASE 5 · THE CASE OF THE FAKE RECEIPT
   ===================================================================== */
const START_5 = {
  cards: [
    { e: "🧾", t: "Receipt", d: "Proof that you paid: products, prices, total.", ex: "The paper from the supermarket." },
    { e: "📄", t: "Invoice (factura)", d: "A sale document with the seller's and buyer's data, taxes and ID numbers.", ex: "Factura electrónica with a NIT." },
    { e: "💳", t: "Voucher", d: "Proof that a card payment was approved.", ex: "The small paper from the card machine." },
    { e: "➕", t: "Subtotal", d: "The price of the products BEFORE taxes.", ex: "Subtotal $100,000." },
    { e: "🏛️", t: "VAT / IVA", d: "Value-added tax. In Colombia it is generally 19%, but some items are different.", ex: "$100,000 + 19% = $119,000." },
    { e: "🔢", t: "NIT", d: "The tax ID number of a company in Colombia.", ex: "NIT 900.123.456-7." },
  ],
  rounds: [
    { tag: "QUICK 1", q: "The small paper from the card machine that says “APPROVED” is a…", options: ["Voucher", "Invoice", "Menu"], correct: 0, explain: "Card payment proof." },
    { tag: "QUICK 2", q: "A document with the store's NIT, your name and the IVA is an…", options: ["Invoice", "Voucher", "Advertisement"], correct: 0, explain: "Invoices have legal and tax details." },
    { tag: "QUICK 3", q: "Subtotal $50,000 + IVA 19%. The total is…", options: ["$59,500", "$50,019", "$69,000"], correct: 0, explain: "50,000 × 1.19 = 59,500." },
    { tag: "QUICK 4", q: "Why should you keep receipts?", options: ["They prove what you paid", "Stores collect them at the end of the year", "They are pretty"], correct: 0, explain: "Evidence for returns and complaints." },
  ],
};
const DOCS5 = [
  { kind: "tirilla", store: "SUPERMERCADO LA COSECHA", sub: "Your list: 1 milk, 1 bread, 1 eggs, 1 rice", label: "RECEIPT", lines: [{ t: "Milk 1L", v: "$4,800" }, { t: "Sliced bread", v: "$6,500" }, { t: "Milk 1L", v: "$4,800" }, { t: "Eggs x12", v: "$8,200" }, { t: "Rice 1kg", v: "$4,600" }, { t: "TOTAL", v: "$28,900", kind: "tot" }], bad: 2, why: "Duplicate charge! The milk appears twice, but you bought only one.", fix: "Total should be $24,100." },
  { kind: "tirilla", store: "PAPELERÍA EL LÁPIZ", sub: "Calle 10 #5-20", label: "RECEIPT", lines: [{ t: "Drawing pad", v: "$12,000" }, { t: "Colored pencils", v: "$8,500" }, { t: "Eraser + sharpener", v: "$3,500" }, { t: "TOTAL", v: "$27,000", kind: "tot" }], bad: 3, why: "Wrong sum! 12,000 + 8,500 + 3,500 = $24,000, not $27,000.", fix: "Total should be $24,000." },
  { kind: "factura", store: "TECNOMUNDO S.A.S.", sub: "NIT 900.456.123-1 · Factura electrónica FE-2231", label: "INVOICE", meta: [["Buyer", "Camila R."], ["Date", "12/03/2026"]], lines: [{ t: "Headphones BT-200 (taxed 19%)", v: "$100,000" }, { t: "Subtotal", v: "$100,000", kind: "sub" }, { t: "IVA 19%", v: "$9,500", kind: "tax" }, { t: "TOTAL", v: "$109,500", kind: "tot" }], bad: 2, why: "Wrong tax! 19% of $100,000 is $19,000, not $9,500.", fix: "IVA $19,000 · Total $119,000. (Here the store charged LESS — but the invoice is still wrong and must be corrected.)" },
  { kind: "voucher", store: "DATÁFONO · CREAR PAY", sub: "Your purchase at Zapatería Paso Firme: $58,000", label: "CARD VOUCHER", lines: [{ t: "Card", v: "**** 4821" }, { t: "Type", v: "DEBIT" }, { t: "AMOUNT", v: "$85,000", kind: "tot" }, { t: "Status", v: "APPROVED" }], bad: 2, why: "The numbers are switched! The purchase was $58,000 but the voucher charged $85,000.", fix: "Ask for a refund of $27,000." },
  { kind: "tirilla", store: "PANADERÍA SAN JOSÉ", sub: "Paid in cash", label: "RECEIPT", lines: [{ t: "6 pandebonos", v: "$9,000" }, { t: "Hot chocolate x3", v: "$4,500" }, { t: "TOTAL", v: "$13,500", kind: "tot" }, { t: "Cash received", v: "$20,000" }, { t: "Change", v: "$5,500" }], bad: 4, why: "Wrong change! 20,000 − 13,500 = $6,500, not $5,500.", fix: "You should receive $1,000 more." },
  { kind: "factura", store: "DROGUERÍA SALUD TOTAL", sub: "NIT 830.222.555-4 · Factura electrónica FE-9910", label: "INVOICE", meta: [["Buyer", "Andrés M."], ["Date", "31/02/2026"]], lines: [{ t: "Vitamins (taxed 19%)", v: "$20,000" }, { t: "IVA 19%", v: "$3,800", kind: "tax" }, { t: "TOTAL", v: "$23,800", kind: "tot" }], badMeta: true, bad: -1, why: "Impossible date! February never has 31 days. The invoice is not valid — ask for a new one.", fix: "Ask for a corrected invoice with the real date." },
];
function ReceiptScanner({ existing, onSave, onExit }) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [calc, setCalc] = useState(false);
  const [sum, setSum] = useState([]);
  const [res, setRes] = useState([]);
  const [shown, setShown] = useState(false);
  const [letter, setLetter] = useState(existing?.letter || { a: "", b: "", c: "" });
  const [st, finish] = useFinish(onSave);
  const d = DOCS5[i];
  const val = (s) => num(String(s).replace(/,/g, ""));
  const onLine = (k) => { if (shown) return; if (calc) setSum([...sum, val(d.lines[k].v)]); else setPick(k); };
  const check = () => { const ok = d.badMeta ? pick === "meta" : pick === d.bad; setRes([...res, ok]); setShown(true); };
  const next = () => { setI(i + 1); setPick(null); setShown(false); setSum([]); setCalc(false); };
  const score = res.filter(Boolean).length;
  const FR = [{ k: "a", f: "Good afternoon. On March 12 I bought" }, { k: "b", f: "However, the receipt shows" }, { k: "c", f: "Could you please" }];
  if (st.done) return <Reward title="Receipt Scanner master! 🔍" subtitle="Blueprint page 05 is ready." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Receipt Scanner 🔍" subtitle="6 documents. Each one has ONE error. Find it." onExit={onExit}>
      <BPBadge n="05" />
      {i < DOCS5.length ? (
        <>
          <div className="p1-match-stats"><span>Document <b>{i + 1}/{DOCS5.length}</b></span><span>Found: <b>{score}</b> 🔍</span></div>
          <HowTo>Tap the line with the error (or the <b>date box</b>). Use the 🧮 calculator: turn it on and tap lines to add them.</HowTo>
          <div className="g8-scan">
            <div>
              <ReceiptDoc doc={d} onLine={onLine} picked={pick} reveal={shown} />
              {d.meta && <button type="button" className={`g8-metapick ${pick === "meta" ? "on" : ""} ${shown && d.badMeta ? "bad" : ""}`} disabled={shown} onClick={() => !calc && setPick("meta")}>📅 The error is in the date / buyer data</button>}
            </div>
            <div className="g8-calc">
              <button type="button" className={`s1-btn ${calc ? "primary" : "ghost"}`} onClick={() => setCalc(!calc)}><Calculator size={15} /> Calculator {calc ? "ON" : "OFF"}</button>
              <div className="g8-calc-screen"><small>{sum.length ? sum.map((x) => x.toLocaleString("en-US")).join(" + ") : "Tap lines to add"}</small><b>{cop(sum.reduce((a, x) => a + x, 0))}</b></div>
              <button type="button" className="p1-link" onClick={() => setSum([])}><RefreshCw size={13} /> Clear</button>
            </div>
          </div>
          {shown && <div className={`g72-conseq ${res[res.length - 1] ? "f2" : "f0"}`}><b>{res[res.length - 1] ? "✅ Error found!" : "❌ Not that one."}</b><span>{d.why}</span><small>🛠️ {d.fix}</small></div>}
          <div className="start-foot">{!shown ? <button className="s1-btn primary big" disabled={pick === null} onClick={check}>This is the error <Check size={16} /></button> : <button className="s1-btn primary big" onClick={next}>{i === DOCS5.length - 1 ? "Write the complaint" : "Next document"} <ChevronRight size={18} /></button>}</div>
        </>
      ) : (
        <>
          <Mission e="✉️" title="Final case: write a respectful complaint">Choose one of the documents and write a polite message to the store. Explain what you bought, what is wrong and what you want them to do.</Mission>
          <div className="start-block">{FR.map((x) => <div key={x.k} className="p3-sentence edit"><span>{x.f}</span><input className="start-input" value={letter[x.k]} onChange={(e) => setLetter({ ...letter, [x.k]: e.target.value })} placeholder="Write your answer here…" /></div>)}<p className="start-tip">💡 Polite words: please, could you, I would like, thank you.</p></div>
          <div className="g8-letter"><small>✉️ PREVIEW</small><p>{FR.map((x) => `${x.f} ${letter[x.k] || "…"}`).join(" ")} Thank you.</p></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!FR.every((x) => countWords(letter[x.k]) >= 4)} onClick={() => finish(score * 4 + 10, { found: score, total: DOCS5.length, letter })}>Save page 05 <span className="coin-tag"><Coins size={15} /> +{score * 4 + 10}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   CLASE 6 · IS THE AREPA BUSINESS MAKING MONEY?
   ===================================================================== */
const START_6 = {
  cards: [
    { e: "💰", t: "Revenue", d: "All the money that comes in from sales.", ex: "100 arepas × $4,000 = $400,000." },
    { e: "🧾", t: "Expense / cost", d: "Money the business pays to work.", ex: "Cheese, flour, gas, bags." },
    { e: "📈", t: "Profit", d: "Revenue − expenses, when the result is positive.", ex: "$400,000 − $250,000 = $150,000." },
    { e: "📉", t: "Loss", d: "When expenses are bigger than revenue.", ex: "$200,000 − $260,000 = −$60,000." },
    { e: "📒", t: "Ledger", d: "A record of every peso in and out, with dates.", ex: "Mar 2 · Sales · +$180,000." },
    { e: "📦", t: "Inventory", d: "The products or ingredients a business has ready to sell.", ex: "80 arepas prepared." },
  ],
  rounds: [
    { tag: "QUICK 1", q: "Revenue $300,000, expenses $180,000. Profit?", answer: 120000, money: true, hint: "300,000 − 180,000", explain: "$120,000." },
    { tag: "QUICK 2", q: "Revenue $150,000, expenses $190,000. The result is a…", options: ["Loss of $40,000", "Profit of $40,000", "Profit of $340,000"], correct: 0, explain: "Expenses > revenue." },
    { tag: "QUICK 3", q: "50 arepas sold at $4,000 each. Revenue?", answer: 200000, money: true, hint: "50 × 4,000", explain: "$200,000." },
    { tag: "QUICK 4", q: "“Cooking gas $45,000” goes in the ledger as…", options: ["An expense (out)", "Revenue (in), because the shop needs it to cook", "Profit"], correct: 0, explain: "Money that leaves." },
  ],
};

/* ---------- AREPA SHOP MANAGER · una semana ---------- */
const AREPA_DAYS = [
  { d: "Monday", e: "🌤️", hint: "A normal Monday. Usually 50–70 customers.", demand: 60 },
  { d: "Tuesday", e: "🌧️", hint: "Heavy rain all day. People stay home.", demand: 35 },
  { d: "Wednesday", e: "⚽", hint: "Football match nearby in the evening!", demand: 95 },
  { d: "Thursday", e: "🌤️", hint: "Normal day, a little slower than Monday.", demand: 55 },
  { d: "Friday", e: "🎉", hint: "Payday! Offices close early.", demand: 85 },
  { d: "Saturday", e: "☀️", hint: "Busiest day of the week. Families everywhere.", demand: 120 },
];
const AREPA_COST = 1500, GAS_DAY = 8000;
function ArepaWeek({ onSave, onExit }) {
  const [day, setDay] = useState(0);
  const [prep, setPrep] = useState(60);
  const [price, setPrice] = useState(4000);
  const [log, setLog] = useState([]);
  const [st, finish] = useFinish(onSave);
  const demandAt = (base, p) => Math.round(base * clamp(1 - (p - 4000) / 6000, 0.3, 1.4));
  const run = () => {
    const D = AREPA_DAYS[day]; const dem = demandAt(D.demand, price); const sold = Math.min(dem, prep);
    setLog([...log, { d: D.d, e: D.e, prep, price, dem, sold, waste: prep - sold, lost: Math.max(0, dem - prep), rev: sold * price, cost: prep * AREPA_COST, gas: GAS_DAY }]);
    setDay(day + 1);
  };
  const tRev = log.reduce((a, x) => a + x.rev, 0), tCost = log.reduce((a, x) => a + x.cost + x.gas, 0), profit = tRev - tCost;
  const waste = log.reduce((a, x) => a + x.waste, 0), lost = log.reduce((a, x) => a + x.lost, 0);
  if (st.done) return <Reward title="Shop manager! 🫓" subtitle="You ran Aunt Rosa's stand for a week." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Store size={22} strokeWidth={2.1} />} title="Arepa Shop Manager 🫓" subtitle="Run Aunt Rosa's stand for 6 days. Every peso goes to the ledger." onExit={onExit}>
      <HowTo>Each morning, read the forecast and decide <b>how many arepas to prepare</b> (each costs {cop(AREPA_COST)} to make) and the <b>price</b>. If you prepare too few, you lose customers. Too many? Leftovers go to waste. Gas costs {cop(GAS_DAY)} every day.</HowTo>
      {day < AREPA_DAYS.length ? (
        <div className="g8-arepa">
          <div className="g74-news"><small>📅 DAY {day + 1} · {AREPA_DAYS[day].d.toUpperCase()}</small><h3>{AREPA_DAYS[day].e} {AREPA_DAYS[day].hint}</h3></div>
          <div className="g72-machine">
            {Ctl({ l: "🫓 Arepas to prepare", v: prep, set: setPrep, mn: 10, mx: 160, stp: 5, fmt: (x) => `${x}` })}
            {Ctl({ l: "🏷️ Price per arepa", v: price, set: setPrice, mn: 2500, mx: 7000, stp: 500, fmt: cop })}
            <div className="g72-machine-out"><div><small>Cost today</small><b>{cop(prep * AREPA_COST + GAS_DAY)}</b></div><div><small>If you sell all</small><b>{cop(prep * price)}</b></div></div>
          </div>
          <p className="start-tip">💡 Higher prices = fewer customers. Lower prices = more customers but less money per arepa.</p>
          <div className="start-foot"><button className="s1-btn primary big" onClick={run}><Play size={16} /> Open the stand</button></div>
        </div>
      ) : (
        <div className={`g73-score`}><small>WEEK RESULT</small><b className={profit >= 0 ? "good" : "bad"}>{profit >= 0 ? "PROFIT " : "LOSS "}{cop(profit)}</b><span>Revenue {cop(tRev)} − Expenses {cop(tCost)} · 🗑️ {waste} wasted · 😞 {lost} customers lost</span></div>
      )}
      {log.length > 0 && (
        <div className="g8-ledger">
          <header>📒 Ledger · Aunt Rosa's arepas</header>
          <div className="g8-lg-h"><span>Day</span><span>Sold / made</span><span>In</span><span>Out</span><span>Result</span></div>
          {log.map((x) => <div key={x.d} className="g8-lg-r"><span>{x.e} {x.d}</span><span>{x.sold}/{x.prep}{x.waste ? ` · 🗑️${x.waste}` : ""}{x.lost ? ` · 😞${x.lost}` : ""}</span><b className="pos">+{cop(x.rev)}</b><b className="neg">−{cop(x.cost + x.gas)}</b><b className={x.rev - x.cost - x.gas >= 0 ? "pos" : "neg"}>{cop(x.rev - x.cost - x.gas)}</b></div>)}
          <div className="g8-lg-r tot"><span>TOTAL</span><span /><b>+{cop(tRev)}</b><b>−{cop(tCost)}</b><b>{cop(profit)}</b></div>
        </div>
      )}
      {day >= AREPA_DAYS.length && (
        <>
          <div className="g72-meters"><Meter value={Math.round(clamp(100 - (waste / Math.max(1, log.reduce((a, x) => a + x.prep, 0))) * 100, 0, 100))} color="#16b074" label="♻️ No waste" /><Meter value={Math.round(clamp(100 - (lost / Math.max(1, log.reduce((a, x) => a + x.dem, 0))) * 100, 0, 100))} color="#f5b23e" label="😊 Customers served" /></div>
          <div className="p1-hint">{profit < 0 ? "📉 Busy is not the same as profitable. Look at the ledger: which days lost money?" : waste > 60 ? "🗑️ Good profit, but too much waste. Prepare closer to the forecast." : "📈 Great management: you used the forecast to prepare the right amount."}</div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(profit > 0 ? 30 : 22, { profit, revenue: tRev, expenses: tCost, waste, lost, log })}>Save my week <span className="coin-tag"><Coins size={15} /> +{profit > 0 ? 30 : 22}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- BLUEPRINT 06 · BALANCE THE BOOKS + IMPROVE ---------- */
const ROSA_NOTES = [
  { t: "Sales week 1", v: 610000, in: true }, { t: "Cheese (5 kg)", v: 160000 }, { t: "Sales week 2", v: 540000, in: true }, { t: "Flour (25 kg)", v: 95000 },
  { t: "Sales week 3", v: 580000, in: true }, { t: "Butter + milk", v: 70000 }, { t: "Hot chocolate powder", v: 60000 }, { t: "Sales week 4", v: 670000, in: true },
  { t: "Helper (Saturdays)", v: 320000 }, { t: "Market stand rent", v: 400000 },
];
const FORGOT = [{ k: "gas", t: "Cooking gas (4 tanks)", v: 180000, real: true }, { k: "bags", t: "Bags and napkins", v: 75000, real: true }, { k: "taxi", t: "Taxis to the market", v: 90000, real: true }, { k: "tv", t: "A new TV for the house", v: 900000, real: false }];
const PRODUCTS6 = [
  { k: "cheese", e: "🧀", n: "Cheese arepa", price: 4500, cost: 2100, units: 420 },
  { k: "butter", e: "🧈", n: "Butter arepa", price: 3000, cost: 1400, units: 260 },
  { k: "stuffed", e: "🥩", n: "Stuffed arepa (meat)", price: 7000, cost: 6200, units: 150 },
  { k: "choco", e: "☕", n: "Hot chocolate", price: 2500, cost: 700, units: 300 },
];
function BalanceBooks({ existing, onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [cls, setCls] = useState({});
  const [found, setFound] = useState({});
  const [guess, setGuess] = useState("");
  const [guessOk, setGuessOk] = useState(null);
  const [dec, setDec] = useState(existing?.decisions || {});
  const [stPrice, setStPrice] = useState(7000);
  const [rec, setRec] = useState(existing?.rec || "");
  const [st, finish] = useFinish(onSave);
  const notes = useMemo(() => shuffleArr(ROSA_NOTES.map((n, i) => ({ ...n, i }))), []);
  const allCls = notes.every((n) => cls[n.i]);
  const clsOk = notes.filter((n) => cls[n.i] === (n.in ? "in" : "out")).length;
  const rev = ROSA_NOTES.filter((n) => n.in).reduce((a, n) => a + n.v, 0);
  const exp = ROSA_NOTES.filter((n) => !n.in).reduce((a, n) => a + n.v, 0) + FORGOT.filter((f) => f.real && found[f.k]).reduce((a, f) => a + f.v, 0);
  const realFound = FORGOT.filter((f) => f.real).every((f) => found[f.k]) && !found.tv;
  const profit = rev - exp;
  const pp = PRODUCTS6.map((p) => ({ ...p, price: p.k === "stuffed" ? stPrice : p.price })).map((p) => ({ ...p, unitP: p.price - p.cost, total: (p.price - p.cost) * (p.k === "stuffed" ? Math.round(p.units * clamp(1 - (stPrice - 7000) / 8000, 0.4, 1.2)) : p.units) }));
  const newProfit = profit - PRODUCTS6.reduce((a, p) => a + (p.price - p.cost) * p.units, 0) + pp.filter((p) => dec[p.k] !== "remove").reduce((a, p) => a + p.total, 0);
  const decided = PRODUCTS6.every((p) => dec[p.k]);
  if (st.done) return <Reward title="Books balanced! 📒" subtitle="Blueprint page 06 is ready." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<FileText size={22} strokeWidth={2.1} />} title="Balance the Books 📒" subtitle="Aunt Rosa's loose papers for one month. Is the business really making money?" onExit={onExit}>
      <BPBadge n="06" />
      <div className="g72-steps">{["1 · Sort the papers", "2 · Find what's missing", "3 · Calculate", "4 · Improve"].map((s, i) => <span key={s} className={stage === i ? "on" : stage > i ? "done" : ""}>{s}</span>)}</div>
      {stage === 0 && (
        <>
          <HowTo>Each paper is money that came <b>in</b> (revenue) or went <b>out</b> (expense). Classify them all.</HowTo>
          <div className="g8-papers">{notes.map((n) => <div key={n.i} className={`g8-paper ${cls[n.i] || ""}`}><b>{n.t}</b><span>{cop(n.v)}</span><div className="type-toggle">{[["in", "⬇️ In"], ["out", "⬆️ Out"]].map(([v, l]) => <button key={v} type="button" className={cls[n.i] === v ? "on" : ""} onClick={() => setCls({ ...cls, [n.i]: v })}>{l}</button>)}</div></div>)}</div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!allCls || clsOk < notes.length} onClick={() => setStage(1)}>{allCls && clsOk < notes.length ? `${notes.length - clsOk} paper(s) in the wrong column` : "Next"} <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 1 && (
        <>
          <ChatThread title="Valentina asks Aunt Rosa" msgs={[{ who: "Valentina", t: "Tía, is anything missing? What else did you pay this month?", me: true }, { who: "Rosa", t: "Hmm… the gas tanks, of course. And the bags and napkins. Oh, and I took taxis to the market… I also bought a TV for the house, but that's for me." }]} />
          <HowTo>Add ONLY the expenses of the <b>business</b>. Personal expenses don't go in the business ledger!</HowTo>
          <div className="g72-opts">{FORGOT.map((f) => <button key={f.k} type="button" className={`g72-opt ${found[f.k] ? "on" : ""}`} onClick={() => setFound({ ...found, [f.k]: !found[f.k] })}><span>{f.t}<br /><small>{cop(f.v)}</small></span></button>)}</div>
          {found.tv && <div className="p1-banner bad"><span>📺 The TV is a <b>personal</b> expense. Mixing personal and business money hides the real result!</span></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!realFound} onClick={() => setStage(2)}>Add them to the ledger <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 2 && (
        <>
          <div className="g8-two">
            <div className="start-block"><h3>⬇️ Revenue</h3>{ROSA_NOTES.filter((n) => n.in).map((n) => <div key={n.t} className="g8-row"><span>{n.t}</span><b>{cop(n.v)}</b></div>)}<div className="g8-row tot"><span>Total</span><b>{cop(rev)}</b></div></div>
            <div className="start-block"><h3>⬆️ Expenses</h3>{ROSA_NOTES.filter((n) => !n.in).concat(FORGOT.filter((f) => f.real)).map((n) => <div key={n.t} className="g8-row"><span>{n.t}</span><b>{cop(n.v)}</b></div>)}<div className="g8-row tot"><span>Total</span><b>?</b></div></div>
          </div>
          <div className="start-block">
            <h3>🧮 What was the PROFIT this month?</h3>
            <div className="p2-answer-row"><span className="p2-unit">$</span><input className="start-input p2-num" type="number" value={guess} onChange={(e) => { setGuess(e.target.value); setGuessOk(null); }} placeholder="Your answer" /><button className="s1-btn primary" disabled={!guess} onClick={() => setGuessOk(Math.abs(num(guess) - profit) <= 1000)}>Check</button></div>
            {guessOk === false && <div className="p1-hint">💡 Add all the expenses (including the 3 forgotten ones). Then: revenue − expenses.</div>}
            {guessOk && <div className="p1-banner good"><span>✅ Revenue {cop(rev)} − Expenses {cop(exp)} = <b>{cop(profit)}</b>. Without the forgotten expenses, Rosa thought she earned {cop(profit + 345000)}!</span></div>}
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!guessOk} onClick={() => setStage(3)}>Improve the business <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 3 && (
        <>
          <HowTo>Compare the products. For each one decide: <b>keep</b>, <b>improve</b> (change price) or <b>remove</b>. Tip: look at the profit per unit, not only how many you sell.</HowTo>
          <div className="g8-prod">
            <div className="g8-prod-h"><span>Product</span><span>Price</span><span>Cost</span><span>Profit / unit</span><span>Sold</span><span>Gross profit</span><span>Decision</span></div>
            {pp.map((p) => (
              <div key={p.k} className="g8-prod-r">
                <span>{p.e} {p.n}</span><span>{cop(p.price)}</span><span>{cop(p.cost)}</span><b className={p.unitP < 1000 ? "neg" : "pos"}>{cop(p.unitP)}</b><span>{p.units}</span><b>{cop(p.total)}</b>
                <div className="type-toggle">{[["keep", "Keep"], ["improve", "Improve"], ["remove", "Remove"]].map(([v, l]) => <button key={v} type="button" className={dec[p.k] === v ? "on" : ""} onClick={() => setDec({ ...dec, [p.k]: v })}>{l}</button>)}</div>
              </div>
            ))}
          </div>
          {dec.stuffed === "improve" && <div className="g72-machine">{Ctl({ l: "🥩 New price for the stuffed arepa", v: stPrice, set: setStPrice, mn: 7000, mx: 11000, stp: 500, fmt: cop })}<p className="start-tip">Higher price = more profit per unit, but fewer customers.</p></div>}
          <div className="g73-score"><small>NEW MONTHLY PROFIT (estimate)</small><b className={newProfit > profit ? "good" : ""}>{cop(newProfit)}</b><span>Before: {cop(profit)}</span></div>
          <div className="start-block">
            <h3><PenLine size={18} /> My recommendation for Aunt Rosa (min 30 words)</h3>
            <Starters items={["Aunt Rosa, your real profit is", "The most profitable product is", "I recommend", "because", "Also, you should write down"]} onPick={appendStarter(setRec)} />
            <WordField value={rec} onChange={setRec} min={30} max={110} rows={5} goals={[W_NUMBERS(1), W_ADVICE]} placeholder="Write your recommendation here…" />
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!decided || !goalsOk(rec, 30, 110, [W_NUMBERS(1), W_ADVICE])} onClick={() => finish(35, { revenue: rev, expenses: exp, profit, newProfit, decisions: dec, stuffedPrice: stPrice, rec })}>Save page 06 <span className="coin-tag"><Coins size={15} /> +35</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   CLASE 7 · THE INVISIBLE MONEY LEAK
   ===================================================================== */
const START_7 = {
  cards: [
    { e: "💧", t: "Money leak", d: "Small expenses you barely notice that add up to a lot.", ex: "A $5,000 snack every day." },
    { e: "📝", t: "Track", d: "Write down every purchase for some days to see the truth.", ex: "A 7-day spending log." },
    { e: "🔁", t: "Pattern", d: "Something that repeats again and again.", ex: "Snacks every afternoon." },
    { e: "⚡", t: "Impulse buying", d: "Buying fast, without planning, because of an emotion or an offer.", ex: "“Only 2 hours left!”" },
    { e: "📊", t: "Category", d: "A group of similar expenses.", ex: "Food, transport, games." },
    { e: "⏳", t: "24-hour rule", d: "Wait one day before a non-essential purchase. Often, the wish disappears.", ex: "Add it to the cart, decide tomorrow." },
  ],
  rounds: [
    { tag: "QUICK 1", q: "$4,000 every school day for 20 days =", answer: 80000, money: true, hint: "4,000 × 20", explain: "$80,000 a month!" },
    { tag: "QUICK 2", q: "$15,000 a week for 4 weeks =", answer: 60000, money: true, hint: "15,000 × 4", explain: "$60,000." },
    { tag: "QUICK 3", q: "“I saw an offer and bought it in 2 minutes.” This is…", options: ["Impulse buying", "A budget", "A fixed expense"], correct: 0, explain: "Fast + emotion = impulse." },
    { tag: "QUICK 4", q: "The best first step to stop a money leak is…", options: ["Track your expenses", "Buy cheaper snacks only", "Ignore small purchases"], correct: 0, explain: "You can't fix what you don't measure." },
  ],
};
const LEAK_TX = (() => {
  const t = []; const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  [0, 1].forEach((w) => days.forEach((d, i) => {
    const day = `W${w + 1} ${d}`; const school = i < 5;
    if (school) { t.push({ day, c: "transport", v: 5200 }); t.push({ day, c: "snacks", v: 6000 }); if (i % 2 === 0) t.push({ day, c: "drinks", v: 4000 }); }
    if (i === 2 || i === 5) t.push({ day, c: "online", v: w === 0 ? 19000 : 27000 });
    if (i === 5) t.push({ day, c: "games", v: 12000 });
    if (i === 6) t.push({ day, c: "drinks", v: 6000 });
  }));
  return t;
})();
const LEAK_CATS = [["snacks", "🍫", "Snacks", "#ff6b57"], ["online", "🛒", "Online buys", "#e07a2f"], ["transport", "🚌", "Transport", "#0b7a50"], ["drinks", "🥤", "Drinks", "#f5b23e"], ["games", "🎮", "Games", "#16b074"]];
const GRAPH8 = [["largest / highest", /\b(largest|highest|biggest)\b/i], ["increase(d)", /\bincreas(e|ed|es|ing)\b/i], ["decrease(d)", /\bdecreas(e|ed|es|ing)\b/i], ["compared with", /\bcompared (with|to)\b/i], ["as a result", /\bas a result\b/i], ["per week / month", /\bper (week|month|day)\b/i], ["more / less than", /\b(more|less|fewer) than\b/i], ["the most / the least", /\bthe (most|least)\b/i], ["every day / week", /\bevery (day|week|month)\b/i]];
const G_DATA = { l: "Use 3 data expressions", test: (t) => countHits(GRAPH8, t) >= 3, ex: "the largest · compared with · per week · more than" };
function SpendingAutopsy({ existing, onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [view, setView] = useState("week");
  const [home, setHome] = useState(0);
  const [rule24, setRule24] = useState(false);
  const [bottle, setBottle] = useState(false);
  const [txt, setTxt] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const byCat = (c) => LEAK_TX.filter((x) => x.c === c).reduce((a, x) => a + x.v, 0) / 2; // por semana
  const mult = view === "day" ? 1 / 7 : view === "week" ? 1 : 4.3;
  const bars = LEAK_CATS.map(([k, e, l, c]) => ({ label: `${e} ${l}`, value: Math.round(byCat(k) * mult), color: c }));
  const weekTot = LEAK_CATS.reduce((a, [k]) => a + byCat(k), 0);
  const saveWeek = home * 6000 + (rule24 ? byCat("online") * 0.6 : 0) + (bottle ? byCat("drinks") * 0.7 : 0);
  const days = [...new Set(LEAK_TX.map((x) => x.day))];
  const hits = countHits(GRAPH8, txt);
  const G7 = [G_DATA, W_NUMBERS(2)];
  const ranked = [...LEAK_CATS].sort((a, b) => byCat(b[0]) - byCat(a[0]));
  const top = ranked[0], second = ranked[1];
  const ROUNDS7 = [
    { tag: "READ THE DATA 1", q: "Look at the TALLEST bar. Which category costs Mateo the most per week?", options: [`${top[1]} ${top[2]}`, `${second[1]} ${second[2]}`, "🚌 Transport"], correct: 0, explain: `${top[2]}: ${cop(byCat(top[0]))} a week — the tallest bar. ${second[2]} is second: ${cop(byCat(second[0]))}.` },
    { tag: "READ THE DATA 2", q: "Now look at the DAY LOG under the chart. Which expense appears almost EVERY school day?", options: ["🍫 Snacks", "🛒 Online buys", "🎮 Games"], correct: 0, explain: "Snacks appear Monday to Friday — 10 times in 2 weeks. Online buys appear only 4 times." },
    { tag: "READ THE DATA 3", q: "Online buys are the biggest category, but how often do they happen?", options: ["Only twice a week, but each one is big", "Every day after school, like the snacks", "Once a month"], correct: 0, explain: "Few purchases × big amounts. That is an IMPULSE problem, not a daily habit." },
    { tag: "READ THE DATA 4", q: "Snacks cost about how much in a MONTH? (weekly snacks × 4.3)", answer: Math.round(byCat("snacks") * 4.3), tol: 2000, money: true, hint: `${cop(byCat("snacks"))} × 4.3`, explain: "Small daily amounts become a big monthly number." },
    { tag: "DIAGNOSIS", q: "So Mateo has TWO problems. Which pair is correct?", options: ["Online buys = impulse · Snacks = daily leak", "Transport = leak · Games = impulse", "There is no problem — every bar is small"], correct: 0, explain: "Different problems need different fixes: the 24-hour rule for impulse buys, a plan (snacks from home) for the daily leak." },
  ];
  if (st.done) return <Reward title="Leak found and fixed! 📊" subtitle="Blueprint page 07 is ready." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<BarChart3 size={22} strokeWidth={2.1} />} title="Spending Autopsy 📊" subtitle="Two weeks of Mateo's real purchases. Find the leak with data." onExit={onExit}>
      <BPBadge n="07" />
      <div className="g72-steps">{["1 · Explore the data", "2 · Read the chart", "3 · Fix a habit", "4 · Report"].map((s, i) => <span key={s} className={stage === i ? "on" : stage > i ? "done" : ""}>{s}</span>)}</div>
      {stage <= 1 && (
        <>
          <div className="g73-toggle2">{[["day", "Per day"], ["week", "Per week"], ["month", "Per month"]].map(([k, l]) => <button key={k} type="button" className={view === k ? "on" : ""} onClick={() => setView(k)}>{l}</button>)}</div>
          {stage === 0 && <HowTo><b>How to read this chart:</b> each bar is one <b>category</b>. A taller bar = more money. The number on top is the total. Use the buttons to see the money <b>per day, per week or per month</b>. Then check the <b>day log</b> below: it shows HOW OFTEN each purchase happens.</HowTo>}
          <BarChart bars={bars} height={230} />
          <p className="start-tip p1-center">Total per {view}: <b>{cop(weekTot * mult)}</b></p>
          {stage <= 1 && <h4 className="g8-subh">🗓️ Day log · 2 weeks of purchases</h4>}
          {stage === 1 && <div className="g8-daylog">{days.map((d) => <div key={d}><b>{d}</b>{LEAK_TX.filter((x) => x.day === d).map((x, k) => { const c = LEAK_CATS.find((y) => y[0] === x.c); return <span key={k} style={{ "--cc": c[3] }}>{c[1]} {cop(x.v)}</span>; })}</div>)}</div>}
          {stage === 0 && (
            <>
              <div className="g8-daylog">{days.map((d) => <div key={d}><b>{d}</b>{LEAK_TX.filter((x) => x.day === d).map((x, k) => { const c = LEAK_CATS.find((y) => y[0] === x.c); return <span key={k} style={{ "--cc": c[3] }}>{c[1]} {cop(x.v)}</span>; })}</div>)}</div>
              <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(1)}>Read the chart <ChevronRight size={18} /></button></div>
            </>
          )}
          {stage === 1 && <RoundsRunner rounds={ROUNDS7} doneLabel="Fix a habit" onDone={() => setStage(2)} />}
        </>
      )}
      {stage === 2 && (
        <>
          <HowTo>Change Mateo's habits — <b>without</b> giving up everything he enjoys. See how much he keeps in <b>4 weeks</b>.</HowTo>
          <div className="g72-machine">
            {Ctl({ l: "🍎 Bring snacks from home (days/week)", v: home, set: setHome, mn: 0, mx: 5, stp: 1, fmt: (x) => `${x} days` })}
            <div className="g73-toggle2"><button type="button" className={rule24 ? "on" : ""} onClick={() => setRule24(!rule24)}>⏳ 24-hour rule for online buys {rule24 ? "✓" : ""}</button><button type="button" className={bottle ? "on" : ""} onClick={() => setBottle(!bottle)}>🧴 Reusable water bottle {bottle ? "✓" : ""}</button></div>
          </div>
          <div className="g8-proj"><div><small>Saved per week</small><b>{cop(saveWeek)}</b></div><div><small>In 4 weeks</small><b className="pos">{cop(saveWeek * 4)}</b></div><div><small>In a school year (40 weeks)</small><b>{cop(saveWeek * 40)}</b></div></div>
          <BarChart bars={[{ label: "Before (4 wks)", value: Math.round(weekTot * 4), color: "#ff6b57" }, { label: "After (4 wks)", value: Math.round((weekTot - saveWeek) * 4), color: "#16b074" }]} height={190} />
          <div className="start-foot"><button className="s1-btn primary big" disabled={saveWeek <= 0} onClick={() => setStage(3)}>Write my report <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 3 && (
        <>
        <div className="start-block g8-datapanel">
          <h3>📊 Mateo's data (use it in your report)</h3>
          <div className="g73-toggle2">{[["day", "Per day"], ["week", "Per week"], ["month", "Per month"]].map(([k, l]) => <button key={k} type="button" className={view === k ? "on" : ""} onClick={() => setView(k)}>{l}</button>)}</div>
          <BarChart bars={bars} height={200} />
          <p className="start-tip p1-center">Total per {view}: <b>{cop(weekTot * mult)}</b> · 🍫 Snacks happen every school day · 🛒 Online buys happen twice a week</p>
          <div className="g8-proj"><div><small>Your plan saves per week</small><b>{cop(saveWeek)}</b></div><div><small>In 4 weeks</small><b className="pos">{cop(saveWeek * 4)}</b></div><div><small>In a school year</small><b>{cop(saveWeek * 40)}</b></div></div>
        </div>
        <div className="start-block">
          <h3><PenLine size={18} /> Data report: 50–90 words</h3>
          <p className="start-tip">Describe the chart (biggest category, most frequent expense) and your solution. The data expressions light up when you use them.</p>
          <WordBank words={GRAPH8} text={txt} need={3} />
          <Starters items={["The largest category is", "compared with", "per week", "If Mateo", "As a result,"]} onPick={appendStarter(setTxt)} />
          <WordField value={txt} onChange={setTxt} min={50} max={90} rows={6} goals={G7} placeholder="Write your report here…" />
          <div className="start-foot"><button className="s1-btn primary big" disabled={!goalsOk(txt, 50, 90, G7)} onClick={() => finish(35, { home, rule24, bottle, saveWeek, save4: saveWeek * 4, text: txt, words: hits })}>Save page 07 <span className="coin-tag"><Coins size={15} /> +35</span></button></div>
        </div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- MY 7-DAY TRACKER ---------- */
const DAYS7 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MYCATS = [["food", "🍫", "Snacks & food"], ["transport", "🚌", "Transport"], ["fun", "🎮", "Fun & games"], ["online", "🛒", "Online"], ["school", "📓", "School"], ["other", "🧩", "Other"]];
function MyTracker({ existing, onSave, onExit }) {
  const [items, setItems] = useState(existing?.items || []);
  const [d, setD] = useState("Mon");
  const [c, setC] = useState("food");
  const [v, setV] = useState("");
  const [what, setWhat] = useState("");
  const [insight, setInsight] = useState(existing?.insight || "");
  const [st, finish] = useFinish(onSave);
  const add = () => { if (num(v) <= 0) return; setItems([...items, { d, c, v: num(v), what: what.trim() || MYCATS.find((x) => x[0] === c)[2] }]); setV(""); setWhat(""); };
  const daysUsed = new Set(items.map((x) => x.d)).size;
  const rows = MYCATS.map(([k, e, l]) => ({ e, l, v: items.filter((x) => x.c === k).reduce((a, x) => a + x.v, 0) })).filter((r) => r.v > 0).sort((a, b) => b.v - a.v);
  const tot = items.reduce((a, x) => a + x.v, 0);
  const ready = items.length >= 7 && daysUsed >= 3 && countWords(insight) >= 10;
  if (st.done) return <Reward title="Tracker saved! 📝" subtitle="You measured your own money." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<PenLine size={22} strokeWidth={2.1} />} title="My 7-Day Tracker 📝" subtitle="Record YOUR real purchases (or a typical week). Find your own leak." onExit={onExit}>
      <HowTo>Add at least <b>7 purchases</b> on <b>3 or more days</b>. Small ones count too! The chart updates automatically.</HowTo>
      <div className="start-block g8-tracker-add">
        <div className="type-toggle wrap">{DAYS7.map((x) => <button key={x} type="button" className={d === x ? "on" : ""} onClick={() => setD(x)}>{x}</button>)}</div>
        <div className="type-toggle wrap">{MYCATS.map(([k, e, l]) => <button key={k} type="button" className={c === k ? "on" : ""} onClick={() => setC(k)}>{e} {l}</button>)}</div>
        <div className="exp-add"><input className="start-input" value={what} onChange={(e) => setWhat(e.target.value)} placeholder="What? (optional)" /><input className="start-input sm" type="number" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} placeholder="$" /><button type="button" className="exp-add-btn" onClick={add}><Plus size={18} /></button></div>
      </div>
      <div className="g8-week7">{DAYS7.map((x) => <div key={x}><b>{x}</b>{items.map((it, i) => ({ ...it, i })).filter((it) => it.d === x).map((it) => <span key={it.i}>{MYCATS.find((m) => m[0] === it.c)[1]} {cop(it.v)}<button type="button" onClick={() => setItems(items.filter((_, j) => j !== it.i))}>×</button></span>)}</div>)}</div>
      {rows.length > 0 && <><HBars rows={rows} /><p className="start-tip p1-center">Total: <b>{cop(tot)}</b> · Biggest: <b>{rows[0].e} {rows[0].l}</b> ({Math.round((rows[0].v / tot) * 100)}%)</p></>}
      <div className="start-block"><div className="p3-sentence edit"><span>💡 My discovery:</span><input className="start-input" value={insight} onChange={(e) => setInsight(e.target.value)} placeholder="Write your answer here…" /></div></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(25, { items, total: tot, top: rows[0]?.l, insight })}>{items.length < 7 ? `${items.length}/7 purchases` : daysUsed < 3 ? "Use 3+ days" : "Save my tracker"} <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 8 · FIVE FAMILIES, FIVE BUDGETS
   ===================================================================== */
const START_8 = {
  cards: [
    { e: "🏠", t: "Household", d: "All the people who live in one home and share expenses.", ex: "A family of 4." },
    { e: "🌍", t: "Cost of living", d: "How much basic goods and services cost in a place.", ex: "Rent in Tokyo vs. rent in Bogotá." },
    { e: "💱", t: "Currency", d: "The type of money of a country.", ex: "COP, USD, EUR, JPY." },
    { e: "🔄", t: "Exchange rate", d: "How much of one currency you need to buy another.", ex: "1 USD = 4,000 COP (game rate)." },
    { e: "📊", t: "Percentage vs. amount", d: "% shows the SHARE of a budget. The amount shows the real money.", ex: "40% of $100 = $40." },
  ],
  rounds: [
    { tag: "QUICK 1", q: "1 USD = 4,000 COP. How many COP is 50 USD?", answer: 200000, money: true, hint: "50 × 4,000", explain: "$200,000 COP." },
    { tag: "QUICK 2", q: "A family earns $2,000 and spends $500 on food. What % is food?", answer: 25, unit: "%", hint: "500 ÷ 2,000 × 100", explain: "25%." },
    { tag: "QUICK 3", q: "Family A spends 40% of $300. Family B spends 15% of $3,000. Who spends MORE money on food?", options: ["Family B ($450)", "Family A ($120)", "The same"], correct: 0, explain: "A higher % is not always more money!" },
    { tag: "QUICK 4", q: "“The cost of living is high in this city” means…", options: ["Basic things are expensive there", "People earn a lot of money there every month", "Life is long there"], correct: 0, explain: "Prices of goods and services." },
  ],
};
const usd = (f, v) => v / f.rate;
const fmtLocal = (f, v) => `${f.cur} ${Math.round(v).toLocaleString("en-US")}`;
function HouseholdSim({ existing, onSave, onExit }) {
  const [fi, setFi] = useState(0);
  const [visited, setVisited] = useState({ 0: true });
  const [mode, setMode] = useState("pct");
  const [stage, setStage] = useState(0);
  const [evFam] = useState(() => Math.floor(Math.random() * FAMILIES.length));
  const [adj, setAdj] = useState(null);
  const [pickA, setPickA] = useState(existing?.a ?? null);
  const [pickB, setPickB] = useState(existing?.b ?? null);
  const [txt, setTxt] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const f = FAMILIES[fi];
  const pctOf = (fam, k, parts) => Math.round(((parts || fam.parts)[k] / fam.income) * 100);
  const E = FAMILIES[evFam];
  const rise = Math.round(E.parts.housing * 0.15);
  const A = adj || { ...E.parts, housing: E.parts.housing + rise };
  const sumA = Object.values(A).reduce((a, v) => a + v, 0);
  const ROUNDS8 = [
    { tag: "% vs AMOUNT 1", q: "Who spends the HIGHEST % of income on food?", options: ["🇰🇪 Otieno", "🇺🇸 Johnson", "🇯🇵 Sato"], correct: 0, explain: "Otieno: 40%. Johnson: 14%." },
    { tag: "% vs AMOUNT 2", q: "Who spends MORE US DOLLARS on food per month?", visual: <MiniTable head={["Family", "Food (local)", "Rate", "≈ USD"]} rows={[["🇰🇪 Otieno", "KES 36,000", "130 KES = 1 USD", "?"], ["🇺🇸 Johnson", "USD 910", "1", "910"]]} />, options: ["🇺🇸 Johnson (≈ $910)", "🇰🇪 Otieno (≈ $277)", "They spend the same"], correct: 0, explain: "36,000 ÷ 130 ≈ $277. Higher % ≠ more dollars!" },
    { tag: "% vs AMOUNT 3", q: "The Torres family earns COP 4,500,000. At 4,000 COP per dollar, that is about…", answer: 1125, tol: 5, unit: "USD", hint: "4,500,000 ÷ 4,000", explain: "≈ 1,125 USD." },
    { tag: "CONTEXT", q: "Why can't we say the Otieno family “manages money badly” because they spend 40% on food?", options: ["Income, prices and size are different", "Because 40% is the perfect amount for food in every country", "Because food is cheap"], correct: 0, explain: "Context before conclusions." },
  ];
  const fams = (k) => FAMILIES.map((x) => ({ label: `${x.flag} ${x.fam}`, value: pctOf(x, k), color: CAT8.find((c) => c[0] === k)[3] }));
  const G8 = [W_NUMBERS(2), W_CONTRAST];
  const cmpOk = pickA !== null && pickB !== null && pickA !== pickB && goalsOk(txt, 30, 110, G8);
  if (st.done) return <Reward title="Global budget analyst! 🌍" subtitle="Blueprint page 08 is ready." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title="Household Budget Simulator 🌍" subtitle="Visit 5 fictional homes around the world. Compare % and real money." onExit={onExit}>
      <BPBadge n="08" />
      <div className="g72-steps">{["1 · Visit the homes", "2 · % vs. amount", "3 · Surprise", "4 · Compare"].map((s, i) => <span key={s} className={stage === i ? "on" : stage > i ? "done" : ""}>{s}</span>)}</div>
      {stage === 0 && (
        <>
          <HowTo>Visit all 5 homes. Switch between <b>% of income</b> and <b>amount in USD</b> (game exchange rates). These are fictional families — not statistics of a country.</HowTo>
          <div className="g8-homes">{FAMILIES.map((x, i) => <button key={x.id} type="button" className={`${fi === i ? "on" : ""} ${visited[i] ? "seen" : ""}`} onClick={() => { setFi(i); setVisited({ ...visited, [i]: true }); }}><em>{x.flag}</em><b>{x.city}</b><small>{x.fam} · {x.size} people</small></button>)}</div>
          <div className="g8-home">
            <header><em>{f.flag}</em><div><b>The {f.fam} family · {f.city}</b><small>{f.note}</small></div><span>{fmtLocal(f, f.income)}<small>≈ USD {Math.round(usd(f, f.income)).toLocaleString("en-US")} · rate {f.rate} {f.cur} = 1 USD</small></span></header>
            <div className="g73-toggle2"><button type="button" className={mode === "pct" ? "on" : ""} onClick={() => setMode("pct")}>% of income</button><button type="button" className={mode === "usd" ? "on" : ""} onClick={() => setMode("usd")}>Amount (USD)</button></div>
            <HBars rows={CAT8.map(([k, e, l, c]) => ({ e, l, c, v: mode === "pct" ? pctOf(f, k) : Math.round(usd(f, f.parts[k])) }))} money={false} max={mode === "pct" ? 50 : undefined} />
            <small className="g8-unit">{mode === "pct" ? "Numbers = % of income" : "Numbers = US dollars per month"}</small>
          </div>
          <BarChart bars={fams("food")} money={false} unit="%" height={190} />
          <p className="start-tip p1-center">🍲 Food as % of income in the 5 homes</p>
          <div className="start-foot"><button className="s1-btn primary big" disabled={Object.keys(visited).length < 5} onClick={() => setStage(1)}>{Object.keys(visited).length < 5 ? `${Object.keys(visited).length}/5 homes visited` : "Next"} <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 1 && (
        <>
          <div className="start-block g8-datapanel">
            <h3>📊 The data you need</h3>
            <BarChart bars={fams("food")} money={false} unit="%" height={170} />
            <p className="start-tip p1-center">🍲 Food as % of income</p>
            <MiniTable head={["Family", "Income (local)", "Rate", "Food %"]} rows={FAMILIES.map((x) => [`${x.flag} ${x.fam}`, fmtLocal(x, x.income), `${x.rate} ${x.cur} = 1 USD`, `${pctOf(x, "food")}%`])} />
            <button type="button" className="p1-link" onClick={() => setStage(0)}><ArrowLeft size={14} /> Visit the homes again</button>
          </div>
          <RoundsRunner rounds={ROUNDS8} doneLabel="Next: surprise!" onDone={() => setStage(2)} />
        </>
      )}
      {stage === 2 && (
        <>
          <div className="g74-news"><small>📰 SURPRISE · {E.flag} {E.city.toUpperCase()}</small><h3>🏠 The {E.fam} family's rent goes up 15%!</h3><p>Housing: {fmtLocal(E, E.parts.housing)} → {fmtLocal(E, E.parts.housing + rise)}. Their income stays the same. Help them rebalance.</p></div>
          <HowTo>Reduce other categories until the total equals the income again. Food can't go below 90% of the original.</HowTo>
          <div className="g72-machine">{CAT8.filter(([k]) => k !== "housing").map(([k, e, l]) => <React.Fragment key={k}>{Ctl({ l: `${e} ${l}`, v: A[k], set: (val) => setAdj({ ...A, [k]: k === "food" ? Math.max(Math.round(E.parts.food * 0.9), val) : val }), mn: 0, mx: E.parts[k] * 1.5, stp: Math.max(1, Math.round(E.income / 200)), fmt: (x) => fmtLocal(E, x) })}</React.Fragment>)}</div>
          <div className={`g8-left ${Math.abs(sumA - E.income) <= E.income / 200 ? "ok" : sumA > E.income ? "bad" : ""}`}>{Math.abs(sumA - E.income) <= E.income / 200 ? "✅ Balanced again!" : sumA > E.income ? `🚨 ${fmtLocal(E, sumA - E.income)} over the income` : `💵 ${fmtLocal(E, E.income - sumA)} without a job`}</div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={Math.abs(sumA - E.income) > E.income / 200} onClick={() => setStage(3)}>Next <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 3 && (
        <>
          <div className="start-block">
            <h3><span className="step-n">1</span> Choose two homes to compare</h3>
            <div className="g8-homes small">{FAMILIES.map((x, i) => <button key={x.id} type="button" className={pickA === i || pickB === i ? "on" : ""} onClick={() => (pickA === i ? setPickA(null) : pickB === i ? setPickB(null) : pickA === null ? setPickA(i) : setPickB(i))}><em>{x.flag}</em><b>{x.fam}</b></button>)}</div>
            {pickA !== null && pickB !== null && <MiniTable head={["", `${FAMILIES[pickA].flag} ${FAMILIES[pickA].fam}`, `${FAMILIES[pickB].flag} ${FAMILIES[pickB].fam}`]} rows={CAT8.map(([k, e, l]) => [`${e} ${l}`, `${pctOf(FAMILIES[pickA], k)}% · $${Math.round(usd(FAMILIES[pickA], FAMILIES[pickA].parts[k]))}`, `${pctOf(FAMILIES[pickB], k)}% · $${Math.round(usd(FAMILIES[pickB], FAMILIES[pickB].parts[k]))}`])} />}
          </div>
          <div className="start-block">
            <h3><PenLine size={18} /> Compare the two families</h3>
            <Starters items={["The", "family spends", "% of its income on", "while the", "However,", "This difference could be because"]} onPick={appendStarter(setTxt)} />
            <WordField value={txt} onChange={setTxt} min={30} max={110} rows={5} goals={G8} placeholder="Write your comparison here…" />
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!cmpOk} onClick={() => finish(35, { a: pickA, b: pickB, famA: FAMILIES[pickA].fam, famB: FAMILIES[pickB].fam, event: E.fam, adjusted: A, text: txt })}>Save page 08 <span className="coin-tag"><Coins size={15} /> +35</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- LIVE ON $1,500 (inspirado en el video) ---------- */
const CITIES8 = [
  { id: "bog", flag: "🇨🇴", n: "Bogotá", rent: [700, 450, 300], food: [180, 280, 450], daily: 120, extra: 160 },
  { id: "mde", flag: "🇨🇴", n: "Medellín", rent: [800, 500, 330], food: [190, 300, 470], daily: 110, extra: 160 },
  { id: "lis", flag: "🇵🇹", n: "Lisbon", rent: [1500, 1000, 650], food: [320, 450, 650], daily: 180, extra: 220 },
  { id: "bue", flag: "🇦🇷", n: "Buenos Aires", rent: [770, 520, 380], food: [230, 340, 520], daily: 130, extra: 180 },
  { id: "cnx", flag: "🇹🇭", n: "Chiang Mai", rent: [500, 330, 220], food: [140, 230, 400], daily: 90, extra: 200 },
  { id: "tok", flag: "🇯🇵", n: "Tokyo", rent: [1600, 1000, 700], food: [380, 500, 750], daily: 200, extra: 200 },
];
function LiveOn1500({ onSave, onExit }) {
  const [ci, setCi] = useState(0);
  const [rent, setRent] = useState(1);
  const [food, setFood] = useState(1);
  const [gym, setGym] = useState(false);
  const [results, setResults] = useState({});
  const [st, finish] = useFinish(onSave);
  const c = CITIES8[ci];
  const steps = [["🏠 Rent", c.rent[rent]], ["🍲 Food style", c.food[food]], ["🚌 Everyday costs", c.daily + (gym ? 40 : 0)], ["🛂 What locals don't pay", c.extra]];
  const tot = steps.reduce((a, s) => a + s[1], 0);
  const fits = tot <= 1500;
  const save = () => setResults({ ...results, [c.id]: { tot, fits } });
  const ok = Object.values(results).filter((r) => r.fits).length >= 2 && Object.values(results).some((r) => !r.fits);
  if (st.done) return <Reward title="World budget explorer! ✈️" subtitle="Same $1,500 — very different lives." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<MapIcon size={22} strokeWidth={2.1} />} title="Live on $1,500 ✈️" subtitle="Remember the video? Calculate YOUR number in 6 cities." onExit={onExit}>
      <HowTo>Use the 4 steps from the video: <b>rent → food style → everyday costs → what locals don't pay</b> (insurance, visas, flights). Mission: find <b>2 cities</b> where you can live on $1,500 and <b>1 city</b> where you can't. <i>Game numbers in USD, approximate.</i></HowTo>
      <div className="g8-homes">{CITIES8.map((x, i) => <button key={x.id} type="button" className={`${ci === i ? "on" : ""} ${results[x.id] ? (results[x.id].fits ? "fit" : "nofit") : ""}`} onClick={() => setCi(i)}><em>{x.flag}</em><b>{x.n}</b><small>{results[x.id] ? `$${results[x.id].tot} ${results[x.id].fits ? "✅" : "❌"}` : "—"}</small></button>)}</div>
      <div className="g8-two">
        <div className="start-block">
          <h3>🏠 1 · Rent</h3>
          <div className="g8-pick">{[["🏙️", "City center"], ["🏘️", "Outside center"], ["🛏️", "Shared room"]].map(([e, l], k) => <button key={l} type="button" className={rent === k ? "on" : ""} aria-pressed={rent === k} onClick={() => setRent(k)}><em>{e}</em><b>{l}</b><small>${c.rent[k]}</small>{rent === k && <i>✓</i>}</button>)}</div>
          <h3>🍲 2 · Food style</h3>
          <div className="g8-pick">{[["🥘", "Local food"], ["🍱", "Mixed"], ["🍔", "Western food"]].map(([e, l], k) => <button key={l} type="button" className={food === k ? "on" : ""} aria-pressed={food === k} onClick={() => setFood(k)}><em>{e}</em><b>{l}</b><small>${c.food[k]}</small>{food === k && <i>✓</i>}</button>)}</div>
          <h3>🚌 3 · Extras</h3>
          <div className="g8-pick one"><button type="button" className={gym ? "on" : ""} aria-pressed={gym} onClick={() => setGym(!gym)}><em>🏋️</em><b>{gym ? "Gym added" : "Add a gym"}</b><small>+$40</small>{gym && <i>✓</i>}</button></div>
          {results[c.id] && <p className="start-tip">💾 Saved: ${results[c.id].tot} {results[c.id].fits ? "✅" : "❌"} — change options and save again if you want.</p>}
        </div>
        <div className={`g8-receipt total ${fits ? "ok" : "no"}`}>
          <header><b>{c.flag} {c.n}</b><small>My living number</small></header>
          <div className="g8-rlines">{steps.map(([l, v]) => <div key={l} className="g8-rline"><span>{l}</span><b>${v}</b></div>)}<div className="g8-rline tot"><span>TOTAL</span><b>${tot}</b></div></div>
          <footer>{fits ? `✅ It fits! $${1500 - tot} left` : `❌ $${tot - 1500} over the budget`}</footer>
        </div>
      </div>
      <div className="start-foot"><button className="s1-btn ghost" onClick={save}><Check size={15} /> Save {c.n}</button><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(24, { results })}>{ok ? "Finish" : "2 ✅ cities + 1 ❌ city"} <span className="coin-tag"><Coins size={15} /> +24</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 9 · WOULD YOU TRUST THIS APP?
   ===================================================================== */
const START_9 = {
  cards: [
    { e: "📱", t: "Expense tracker", d: "An app that records your purchases and shows where your money goes.", ex: "You type: “Snack $5,000”." },
    { e: "🔓", t: "Permissions", d: "Access an app asks for: camera, contacts, location…", ex: "A budget app doesn't need your photos." },
    { e: "📜", t: "Privacy policy", d: "The document that explains what an app does with your data.", ex: "“We share data with partners.” 🚩" },
    { e: "🔁", t: "Subscription", d: "A payment that repeats every month or year until you cancel.", ex: "$9,900 every month." },
    { e: "🔐", t: "2FA", d: "Two-factor authentication: password + a code.", ex: "A code by SMS or app." },
    { e: "⭐", t: "Fake reviews", d: "Reviews that look copied or paid. Many identical 5-star reviews = 🚩.", ex: "“Best app ever!!!” x50" },
  ],
  rounds: [
    { tag: "QUICK 1", q: "A budget app asks for your location 24/7. This permission is…", options: ["Not necessary 🚩", "Necessary", "Required by law"], correct: 0, explain: "A budget doesn't need where you are." },
    { tag: "QUICK 2", q: "Which password is strongest?", options: ["Tr!p-Mango-2026#", "mariagomez2010birthday", "123456"], correct: 0, explain: "Long + symbols + not personal." },
    { tag: "QUICK 3", q: "Ten reviews say exactly “Best app ever!!!”. You think…", options: ["They may be fake", "The app is perfect", "Nothing"], correct: 0, explain: "Identical reviews are a red flag." },
    { tag: "QUICK 4", q: "$7,900 a month subscription. Per year it costs…", options: ["$94,800", "$79,000", "$7,900"], correct: 0, explain: "7,900 × 12." },
  ],
};
const APPS9 = [
  { id: "simple", e: "📒", n: "SimpleBudget", price: 0, stars: 4.3, does: "Record expenses manually · weekly chart · goals", cancel: "Delete the app anytime.",
    perms: [["📷 Camera", false], ["📇 Contacts", false], ["🔔 Notifications", true]], reviews: [["⭐⭐⭐⭐ Ana", "Simple and useful. No ads.", false], ["⭐⭐⭐⭐ Leo", "I wish it had more colors, but it works.", false], ["⭐⭐⭐ Juan", "You must write everything by hand.", false]], privacy: "Your data stays on your phone. We don't sell data." },
  { id: "auto", e: "🤖", n: "AutoTrack", price: 12900, stars: 4.5, does: "Connects to a bank account and tracks automatically", cancel: "Cancel in Settings › Subscription.",
    perms: [["🏦 Bank account (read-only)", true], ["🔔 Notifications", true], ["📍 Location always", false]], reviews: [["⭐⭐⭐⭐⭐ Carla", "Great for my parents' business.", false], ["⭐⭐⭐⭐ Tom", "Expensive but powerful.", false], ["⭐⭐ Sofi", "Too much for a teenager.", false]], privacy: "We use bank data only to show your charts. Encrypted." },
  { id: "rainbow", e: "🌈", n: "CoinRainbow", price: 0, stars: 4.9, does: "Colorful charts + rewards + games", cancel: "Email support to cancel the “premium trial”.",
    perms: [["📇 Contacts", false], ["🖼️ Photos", false], ["📍 Location always", false], ["🎤 Microphone", false]], reviews: [["⭐⭐⭐⭐⭐ User482", "Best app ever!!! Amazing!!!", true], ["⭐⭐⭐⭐⭐ User483", "Best app ever!!! So amazing!!!", true], ["⭐ Laura M.", "They charged a subscription I never accepted.", false]], privacy: "We may share your information with our partners for marketing." },
  { id: "piggy", e: "🐷", n: "PiggyPal Pro", price: 7900, stars: 4.1, does: "Savings goals + reminders + family sharing", cancel: "Call a phone number Monday–Friday, 8–9 a.m. only.",
    perms: [["🔔 Notifications", true], ["📇 Contacts", false]], reviews: [["⭐⭐⭐⭐ Mia", "Nice goals feature.", false], ["⭐ Pablo", "Impossible to cancel! I paid 3 extra months.", false], ["⭐⭐⭐⭐⭐ BestDeal_99", "Download now!!! Click my link for gifts!!!", true]], privacy: "Data is kept for 10 years after you leave." },
];
function AppLab({ onSave, onExit }) {
  const [ai, setAi] = useState(0);
  const [flagsP, setFlagsP] = useState({});
  const [flagsR, setFlagsR] = useState({});
  const [seen, setSeen] = useState({ 0: true });
  const [choice, setChoice] = useState(null);
  const [why, setWhy] = useState("");
  const [st, finish] = useFinish(onSave);
  const a = APPS9[ai];
  const permTotal = APPS9.reduce((s, x) => s + x.perms.filter((p) => !p[1]).length, 0);
  const revTotal = APPS9.reduce((s, x) => s + x.reviews.filter((r) => r[2]).length, 0);
  const pOk = APPS9.reduce((s, x) => s + x.perms.filter((p, k) => !p[1] && flagsP[`${x.id}-${k}`]).length, 0);
  const pBad = APPS9.reduce((s, x) => s + x.perms.filter((p, k) => p[1] && flagsP[`${x.id}-${k}`]).length, 0);
  const rOk = APPS9.reduce((s, x) => s + x.reviews.filter((r, k) => r[2] && flagsR[`${x.id}-${k}`]).length, 0);
  const allSeen = Object.keys(seen).length === APPS9.length;
  const GA = [W_REASON];
  const ready = allSeen && choice && goalsOk(why, 12, 70, GA);
  if (st.done) return <Reward title="Security lab complete! 🔬" subtitle={`You found ${pOk}/${permTotal} risky permissions and ${rOk}/${revTotal} fake reviews.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Shield size={22} strokeWidth={2.1} />} title="App Security Lab 🔬" subtitle="Your client: Sara, 13. She wants to track her allowance. Investigate 4 apps." onExit={onExit}>
      <HowTo>Open each app. 1) Tap the <b>permissions</b> that are NOT necessary for a budget app 🚩. 2) Tap the <b>reviews that look fake</b>. 3) Read the privacy and cancellation info. Then choose the best app for Sara.</HowTo>
      <div className="p1-match-stats"><span>🚩 Permissions found: <b>{pOk}/{permTotal}</b>{pBad ? ` · ${pBad} wrong` : ""}</span><span>🕵️ Fake reviews: <b>{rOk}/{revTotal}</b></span></div>
      <div className="g8-apps">{APPS9.map((x, i) => <button key={x.id} type="button" className={`${ai === i ? "on" : ""} ${seen[i] ? "seen" : ""}`} onClick={() => { setAi(i); setSeen({ ...seen, [i]: true }); }}><em>{x.e}</em><b>{x.n}</b><small>{"★".repeat(Math.round(x.stars))} {x.stars}</small></button>)}</div>
      <div className="g8-appcard">
        <header><em>{a.e}</em><div><b>{a.n}</b><small>{a.does}</small></div><span>{a.price ? `${cop(a.price)}/month` : "FREE"}<small>{a.price ? `= ${cop(a.price * 12)} a year` : ""}</small></span></header>
        <div className="g8-appsec"><small>🔓 PERMISSIONS — tap the unnecessary ones</small><div className="g74-chips">{a.perms.map((p, k) => { const key = `${a.id}-${k}`; const on = flagsP[key]; return <button key={key} type="button" className={on ? (p[1] ? "bad" : "on") : ""} onClick={() => setFlagsP({ ...flagsP, [key]: !on })}>{on ? (p[1] ? "⚠️ " : "🚩 ") : ""}{p[0]}</button>; })}</div></div>
        <div className="g8-appsec"><small>⭐ REVIEWS — tap the suspicious ones</small>{a.reviews.map((r, k) => { const key = `${a.id}-${k}`; const on = flagsR[key]; return <button key={key} type="button" className={`g8-review ${on ? (r[2] ? "on" : "bad") : ""}`} onClick={() => setFlagsR({ ...flagsR, [key]: !on })}><b>{r[0]}</b><span>{r[1]}</span>{on && <i>{r[2] ? "🕵️ Fake!" : "Looks real"}</i>}</button>; })}</div>
        <div className="g8-appsec two"><div><small>📜 PRIVACY</small><p>{a.privacy}</p></div><div><small>❌ HOW TO CANCEL</small><p>{a.cancel}</p></div></div>
      </div>
      {allSeen && (
        <div className="start-block">
          <h3><span className="step-n">✦</span> Which app do you recommend for Sara?</h3>
          <div className="g72-opts">{APPS9.map((x) => <button key={x.id} type="button" className={`g72-opt ${choice === x.id ? "on" : ""}`} onClick={() => setChoice(x.id)}><em>{x.e}</em><span>{x.n}</span></button>)}</div>
          {choice && choice !== "simple" && <div className="p1-hint">{choice === "rainbow" ? "🌈 Too many permissions, fake reviews and data shared with partners…" : choice === "piggy" ? "🐷 Look at the cancellation process and the 10-year data policy…" : "🤖 It's safe, but is a paid bank-connected app necessary for a 13-year-old's allowance?"} You can still choose it — but justify it well!</div>}
          <WordField value={why} onChange={setWhy} min={12} max={70} rows={3} goals={GA} placeholder="Write your answer here…" />
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(pOk * 2 + rOk * 2 + (choice === "simple" ? 10 : 6) - pBad, { choice, why, permFound: pOk, fakeFound: rOk, wrong: pBad })}>{allSeen ? "Send my recommendation" : `${Object.keys(seen).length}/4 apps opened`} <span className="coin-tag"><Coins size={15} /> +{pOk * 2 + rOk * 2 + 8}</span></button></div>
    </ActShell>
  );
}

/* ---------- BLUEPRINT 09 · SAFE SETUP + RULES + REVIEW ---------- */
const pwScore8 = (p) => [p.length >= 12, /[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
const SAFE_RULES = [
  { id: "2fa", t: "Turn on 2FA in every money app", good: true }, { id: "unique", t: "Use a different strong password for each app", good: true },
  { id: "perm", t: "Deny permissions the app doesn't need", good: true }, { id: "read", t: "Read the privacy policy and how to cancel", good: true },
  { id: "codes", t: "Never share passwords or verification codes", good: true }, { id: "official", t: "Download apps only from official stores", good: true },
  { id: "review", t: "Check reviews — and look for fake ones", good: true }, { id: "stars", t: "Trust any app with 4.5 stars or more", good: false, why: "Ratings can be fake. Stars are not proof of safety." },
  { id: "share", t: "Share my code with support if they call me", good: false, why: "Real support NEVER asks for your codes." },
];
const REVIEW_W = [["because", /\bbecause\b/i], ["although", /\balthough\b/i], ["however", /\bhowever\b/i]];
function SafeSetup({ resp, existing, onSave, onExit }) {
  const lab = resp?.c9_lab;
  const [user, setUser] = useState("");
  const [pw, setPw] = useState("");
  const [tfa, setTfa] = useState(false);
  const [perm, setPerm] = useState({ notif: true, contacts: true, photos: true, location: true });
  const [rules, setRules] = useState(existing?.ruleIds || []);
  const [review, setReview] = useState(existing?.review || "");
  const [stars, setStars] = useState(existing?.stars || 0);
  const [st, finish] = useFinish(onSave);
  const realName = /\b(juan|maria|maría|valentina|daniel|sara|camila|andres|andrés)\b/i.test(user) || /\d{4}/.test(user);
  const permOk = perm.notif !== undefined && !perm.contacts && !perm.photos && !perm.location;
  const setupOk = user.trim().length >= 4 && !realName && pwScore8(pw) === 4 && tfa && permOk;
  const bad = rules.map((id) => SAFE_RULES.find((r) => r.id === id)).filter((r) => !r.good);
  const goodN = rules.length - bad.length;
  const GR = [W_REASON, W_CONTRAST];
  const ready = setupOk && goodN >= 4 && bad.length === 0 && stars > 0 && goalsOk(review, 25, 100, GR);
  const PW_L = ["Very weak", "Weak", "OK", "Good", "Strong"];
  if (st.done) return <Reward title="Digital shield on! 🔐" subtitle="Blueprint page 09 is ready." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Lock size={22} strokeWidth={2.1} />} title="Safe Setup + My Rules 🔐" subtitle="Create a FICTIONAL account safely, choose your rules and write an app review." onExit={onExit}>
      <BPBadge n="09" />
      <div className="p1-banner bad"><span>⚠️ Practice only: never type your real passwords, your full name or bank information here.</span></div>
      <div className="g8-two">
        <div className="start-block g8-setup">
          <h3><span className="step-n">1</span> Create a practice account</h3>
          <label className="p3-lbl">👤 Username (not your real name)<input className="start-input" value={user} onChange={(e) => setUser(e.target.value)} placeholder="e.g. BlueFox_finance" /></label>
          {realName && <small className="neg">🚩 Don't use your real name or birth year.</small>}
          <label className="p3-lbl">🔑 Practice password (12+ characters, A, 1, #)<input className="start-input" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Invent a practice password" /></label>
          <div className="g74-pw"><i style={{ width: `${pwScore8(pw) * 25}%`, background: ["#ff6b57", "#ff6b57", "#f5b23e", "#f5b23e", "#16b074"][pwScore8(pw)] }} /></div>
          <label className="g74-switch"><input type="checkbox" checked={tfa} onChange={(e) => setTfa(e.target.checked)} /><span /> Two-factor authentication {tfa ? "ON ✅" : "OFF"}</label>
          <small>🔓 Permissions requested by the app:</small>
          {[["notif", "🔔 Notifications (reminders)"], ["contacts", "📇 Contacts"], ["photos", "🖼️ Photos"], ["location", "📍 Location always"]].map(([k, l]) => <label key={k} className="g74-switch"><input type="checkbox" checked={perm[k]} onChange={(e) => setPerm({ ...perm, [k]: e.target.checked })} /><span /> {l}</label>)}
        </div>
        <div className={`g8-phone ${setupOk ? "ok" : ""}`}>
          <div className="g8-phone-bar"><span>9:41</span><i /><span>📶 🔋</span></div>
          <div className="g8-phone-app">
            <header><em>📒</em><div><b>SimpleBudget</b><small>Practice account</small></div></header>
            <div className="g8-ph-user"><span className="av">{(user.trim()[0] || "?").toUpperCase()}</span><div><b>{user || "Username"}</b><small>{pw ? "•".repeat(Math.min(pw.length, 14)) : "No password yet"}</small></div></div>
            <div className="g8-ph-meter"><i style={{ width: `${pwScore8(pw) * 25}%`, background: ["#ff6b57", "#ff6b57", "#f5b23e", "#f5b23e", "#16b074"][pwScore8(pw)] }} /></div>
            <small className="g8-ph-pw">Password: <b>{PW_L[pwScore8(pw)]}</b></small>
            <ul className="g8-ph-list">
              <li className={tfa ? "ok" : "no"}><span>🔐 2FA</span><b>{tfa ? "ON" : "OFF"}</b></li>
              {[["notif", "🔔 Notifications"], ["contacts", "📇 Contacts"], ["photos", "🖼️ Photos"], ["location", "📍 Location"]].map(([k, l]) => { const good = k === "notif" || !perm[k]; return <li key={k} className={good ? "ok" : "no"}><span>{l}</span><b>{perm[k] ? "Allowed" : "Denied"}</b></li>; })}
            </ul>
            <div className="g8-ph-status">{setupOk ? "🛡️ ACCOUNT SECURE" : "⚠️ NOT SECURE YET"}</div>
          </div>
        </div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> My digital money rules (choose 4+ good ones)</h3>
        <div className="g74-rules">{SAFE_RULES.map((r) => <button key={r.id} type="button" className={rules.includes(r.id) ? (r.good ? "on" : "bad") : ""} onClick={() => setRules(rules.includes(r.id) ? rules.filter((x) => x !== r.id) : [...rules, r.id])}>{rules.includes(r.id) ? (r.good ? "✅ " : "🚩 ") : ""}{r.t}</button>)}</div>
        {bad.map((r) => <div key={r.id} className="p1-banner bad"><span>🚩 <b>{r.t}</b> — {r.why}</span></div>)}
      </div>
      <div className="start-block">
        <h3><span className="step-n">3</span> Write an app review{lab?.choice ? ` of ${APPS9.find((x) => x.id === lab.choice)?.n}` : ""} </h3>
        <div className="p3-stars">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={stars >= n ? "on" : ""} onClick={() => setStars(n)}>★</button>)}</div>
        <WordField value={review} onChange={setReview} min={25} max={100} rows={4} goals={GR} placeholder="Write your review here…" />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { setup: { user, tfa, permOk }, ruleIds: rules, rules: rules.map((id) => SAFE_RULES.find((r) => r.id === id).t), stars, review })}>Save page 09 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

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

const RUSH_NEED = {
  buckets: [{ id: "need", e: "✅", l: "Need", d: "You must have it to live, study or work.", c: "#0b7a50" }, { id: "want", e: "🎁", l: "Want", d: "Nice to have, but you can live without it.", c: "#e07a2f" }],
  items: [
    { e: "🚌", t: "Bus ticket to go to school", b: "need", why: "Without it you can't get to school." }, { e: "🍱", t: "Lunch on school days", b: "need", why: "Food is a basic need." },
    { e: "🎮", t: "A new skin for your game character", b: "want", why: "Fun, but your life doesn't change without it." }, { e: "📓", t: "Notebook for math class", b: "need", why: "You need it to study." },
    { e: "🎤", t: "Concert ticket", b: "want", why: "A great experience — but a want." }, { e: "🪥", t: "Toothpaste", b: "need", why: "Health and hygiene are needs." },
    { e: "👟", t: "A third pair of sneakers", b: "want", why: "You already have shoes. Extra pairs are wants." }, { e: "🩺", t: "A doctor visit when you are sick", b: "need", why: "Health is a need." },
    { e: "🧋", t: "Bubble tea after school", b: "want", why: "A treat, not a need." }, { e: "📱", t: "Phone plan you use for homework and family", b: "need", why: "For many students it is necessary to study and communicate." },
    { e: "🧢", t: "Designer cap with a famous logo", b: "want", why: "You pay extra for the brand — a want." }, { e: "🧥", t: "A winter jacket when yours is broken", b: "need", why: "Protection from the cold is a need." },
    { e: "📺", t: "A second streaming subscription", b: "want", why: "Entertainment = want." }, { e: "🚲", t: "Bike repair — you ride it to school", b: "need", why: "It's your transport to school." },
    { e: "🍿", t: "Extra-large popcorn at the cinema", b: "want", why: "A treat." }, { e: "💡", t: "Electricity bill at home", b: "need", why: "A home needs electricity." },
  ],
};
const RUSH_FIXED = {
  buckets: [{ id: "fixed", e: "📌", l: "Fixed", d: "Same amount every month.", c: "#0b7a50" }, { id: "var", e: "🎢", l: "Variable", d: "The amount changes month to month.", c: "#f5b23e" }],
  items: [
    { e: "🏠", t: "Rent: $1,200,000 every month", b: "fixed", why: "The contract says the same amount." }, { e: "📱", t: "Phone plan: $30,000 every month", b: "fixed", why: "Same price every month." },
    { e: "🍫", t: "Snacks after school", b: "var", why: "Some weeks more, some weeks less." }, { e: "🏋️", t: "Gym membership", b: "fixed", why: "A monthly fee that doesn't change." },
    { e: "🚕", t: "Taxi rides", b: "var", why: "It depends on how many trips you take." }, { e: "📺", t: "Streaming subscription $17,000", b: "fixed", why: "Subscriptions repeat with the same price." },
    { e: "💡", t: "Electricity bill (depends on use)", b: "var", why: "More use = higher bill." }, { e: "🎓", t: "School fees", b: "fixed", why: "The same each month." },
    { e: "🎁", t: "Birthday gifts", b: "var", why: "Some months you have many birthdays, some months none." }, { e: "🎵", t: "Music app $9,900/month", b: "fixed", why: "A subscription — same price." },
    { e: "🛒", t: "Groceries", b: "var", why: "The amount changes every week." }, { e: "🌐", t: "Internet plan", b: "fixed", why: "Same monthly price." },
    { e: "👕", t: "Clothes", b: "var", why: "You don't buy the same every month." }, { e: "🚌", t: "Bus card top-ups (depends on trips)", b: "var", why: "More trips = more money." },
  ],
};
const RUSH_DOCS = {
  buckets: [{ id: "rec", e: "🧾", l: "Receipt", d: "Simple proof that you paid in a store.", c: "#0b7a50" }, { id: "inv", e: "📄", l: "Invoice", d: "Formal document: NIT, buyer data, subtotal, IVA.", c: "#e07a2f" }, { id: "vou", e: "💳", l: "Voucher", d: "Card payment slip from the dataphone.", c: "#f5b23e" }],
  items: [
    { e: "🛒", t: "Supermarket paper with your products and the total", b: "rec", why: "A simple proof of payment = receipt." }, { e: "🏢", t: "Document with NIT, buyer's name, subtotal and IVA 19%", b: "inv", why: "Buyer data + taxes = invoice." },
    { e: "✅", t: "Slip that says “APPROVED · card **** 4821”", b: "vou", why: "Card + approval = voucher." }, { e: "🥖", t: "Bakery paper: “2 breads $3,000 · paid”", b: "rec", why: "Simple proof that you paid." },
    { e: "🧑‍💼", t: "A company needs a document to report the purchase to the tax office", b: "inv", why: "Companies need invoices for taxes." }, { e: "🔢", t: "Dataphone printout with an authorization code", b: "vou", why: "Authorization codes appear on vouchers." },
    { e: "📧", t: "Electronic document by email with a CUFE code", b: "inv", why: "Electronic invoices in Colombia have a CUFE." }, { e: "✍️", t: "Small paper from the card machine that you sign", b: "vou", why: "You sign the voucher of a card payment." },
    { e: "🏪", t: "Corner-store ticket: total and “Thank you!”", b: "rec", why: "Simple proof = receipt." }, { e: "🗂️", t: "“Invoice FE-2041 · payment in 30 days”", b: "inv", why: "Invoice number + payment terms." },
    { e: "💳", t: "Slip showing only the last 4 digits of the card", b: "vou", why: "Vouchers hide the card number, except 4 digits." }, { e: "✏️", t: "Proof that you paid cash at the stationery shop", b: "rec", why: "Cash + simple proof = receipt." },
  ],
};
const RUSH_BIZ = {
  buckets: [{ id: "rev", e: "⬇️", l: "Revenue", d: "Money the business RECEIVES.", c: "#0b7a50" }, { id: "exp", e: "⬆️", l: "Business expense", d: "Money the business PAYS to work.", c: "#ff6b57" }, { id: "per", e: "🏠", l: "Personal", d: "Not the business! Keep it out of the ledger.", c: "#f5b23e" }],
  items: [
    { e: "🫓", t: "Sold 40 arepas today", b: "rev", why: "Sales = revenue." }, { e: "🧀", t: "Bought 5 kg of cheese", b: "exp", why: "An ingredient = business expense." },
    { e: "🔥", t: "Gas for the stove", b: "exp", why: "The stand needs gas to cook." }, { e: "📺", t: "Aunt Rosa's Netflix", b: "per", why: "Personal entertainment — not the business." },
    { e: "🎉", t: "Catering order for a birthday party", b: "rev", why: "The business sold a service." }, { e: "👩‍🍳", t: "Helper's salary on Saturdays", b: "exp", why: "Paying workers is a business expense." },
    { e: "🖥️", t: "A new TV for the living room", b: "per", why: "For the house, not for the stand." }, { e: "🏪", t: "Market stand rent", b: "exp", why: "The place where you sell = expense." },
    { e: "☕", t: "Sold coffee to the neighbors", b: "rev", why: "Sales = revenue." }, { e: "🍝", t: "Family dinner at a restaurant", b: "per", why: "Personal spending." },
    { e: "🛍️", t: "Napkins and bags", b: "exp", why: "Packaging is a business cost." }, { e: "📲", t: "Delivery order by WhatsApp", b: "rev", why: "A sale is revenue." },
    { e: "👞", t: "School shoes for her son", b: "per", why: "Family need, not a business cost." }, { e: "💡", t: "Electricity of the shop", b: "exp", why: "The shop uses electricity to work." },
  ],
};
const RUSH_LEAK = {
  buckets: [{ id: "leak", e: "💧", l: "Money leak", d: "Small, frequent, unplanned. It adds up!", c: "#ff6b57" }, { id: "plan", e: "✅", l: "Planned / necessary", d: "In the budget or truly needed.", c: "#0b7a50" }],
  items: [
    { e: "🥤", t: "A $4,000 soda every afternoon", b: "leak", why: "$4,000 × 20 days = $80,000 a month!" }, { e: "🚌", t: "Monthly bus pass", b: "plan", why: "Necessary and planned." },
    { e: "🪙", t: "In-app coins “just $1,900”… many times", b: "leak", why: "Tiny amounts, many times = leak." }, { e: "🎁", t: "A birthday gift you saved for", b: "plan", why: "You planned it." },
    { e: "🛵", t: "Delivery fee because you didn't want to walk", b: "leak", why: "Unnecessary and frequent." }, { e: "📚", t: "School supplies list for the term", b: "plan", why: "Necessary and planned." },
    { e: "🔁", t: "A free trial that became a paid subscription you forgot", b: "leak", why: "Forgotten subscriptions are classic leaks." }, { e: "🧺", t: "Weekly groceries with a list", b: "plan", why: "A list = a plan." },
    { e: "⚡", t: "Impulse buy from an “Only 2 hours left!” ad", b: "leak", why: "Pressure + no plan = impulse." }, { e: "📱", t: "Phone plan you use for homework", b: "plan", why: "Necessary and in the budget." },
    { e: "☕", t: "Coffee every morning on the way", b: "leak", why: "Small daily habit = big monthly number." }, { e: "💇", t: "Haircut once a month, in the budget", b: "plan", why: "Planned." },
  ],
};
const RUSH_SAFE = {
  buckets: [{ id: "safe", e: "🛡️", l: "Safe", d: "Good digital money practice.", c: "#0b7a50" }, { id: "flag", e: "🚩", l: "Red flag", d: "Danger! Stop and check.", c: "#ff6b57" }],
  items: [
    { e: "📍", t: "A budget app wants your location 24/7", b: "flag", why: "A budget doesn't need where you are." }, { e: "💬", t: "SMS: “Your account is blocked. Send us your code.”", b: "flag", why: "Real banks never ask for codes." },
    { e: "🔐", t: "The login asks for a 2FA code you just requested", b: "safe", why: "You started it — that's 2FA working." }, { e: "🏪", t: "App from the official store with a clear privacy policy", b: "safe", why: "Official store + clear policy = good signs." },
    { e: "📞", t: "“Support” calls and asks for your password", b: "flag", why: "Support never asks for passwords." }, { e: "⭐", t: "50 identical 5-star reviews", b: "flag", why: "Copy-paste reviews are probably fake." },
    { e: "🗑️", t: "You can delete your data in Settings", b: "safe", why: "You control your data." }, { e: "🔗", t: "Link: bancoo-crear-login.xyz", b: "flag", why: "Strange spelling + strange domain = phishing." },
    { e: "🔔", t: "App asks for notifications to remind you to save", b: "safe", why: "That permission makes sense." }, { e: "📇", t: "A free app “needs” your contacts to work", b: "flag", why: "Why would a budget need your contacts?" },
    { e: "🔑", t: "Strong unique password + 2FA", b: "safe", why: "The best combination." }, { e: "☎️", t: "Cancel only by phone, Mon–Fri 8–9 a.m.", b: "flag", why: "Hard cancellation = a trap." },
  ],
};

/* =====================================================================
   CLASE 10 · THE MONEY BLUEPRINT CHALLENGE
   ===================================================================== */
const BOSS1_ITEMS = [["🚌", "Bus card", 70000, "need"], ["🍱", "Lunches", 150000, "need"], ["📱", "Phone plan", 30000, "need"], ["🎬", "Streaming", 17000, "want"], ["🎮", "Game credits", 40000, "want"], ["👕", "New hoodie", 60000, "want"], ["🎁", "Gift for a friend", 25000, "want"]];
const BOSS2_ROWS = [["Mon", "Juice sales", 120000, "in"], ["Mon", "Fruit from the market", 140000, "out"], ["Wed", "Juice sales", 95000, "in"], ["Wed", "Cups and straws", 25000, "out"], ["Thu", "Netflix for my house", 17000, "personal"], ["Fri", "Taxi to the market", 18000, "out"], ["Sat", "Juice sales", 210000, "in"]];
function CityBoss({ onSave, onExit }) {
  const [ch, setCh] = useState(0);
  const [cls, setCls] = useState({});
  const [sav, setSav] = useState("");
  const [e1, setE1] = useState("");
  const [bad, setBad] = useState(null);
  const [prof, setProf] = useState("");
  const [e2, setE2] = useState("");
  const [app, setApp] = useState(null);
  const [e3, setE3] = useState("");
  const [score, setScore] = useState({});
  const [st, finish] = useFinish(onSave);
  const spend = BOSS1_ITEMS.reduce((a, x) => a + x[2], 0);
  const c1ok = BOSS1_ITEMS.every((x, i) => cls[i] === x[3]) && num(sav) === 500000 - spend;
  const rev = BOSS2_ROWS.filter((r) => r[3] === "in").reduce((a, r) => a + r[2], 0);
  const exp = BOSS2_ROWS.filter((r) => r[3] === "out").reduce((a, r) => a + r[2], 0);
  const c2ok = bad === 4 && num(prof) === rev - exp;
  const c3ok = app === "simple";
  const next = (k, ok) => { setScore({ ...score, [k]: ok }); setCh(ch + 1); };
  const total = Object.values(score).filter(Boolean).length;
  if (st.done) return <Reward title={`Financial City saved! 🏙️ ${total}/3`} subtitle="You are the city's new financial advisor." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Swords size={22} strokeWidth={2.1} />} title="Financial City Boss 🏙️⚔️" subtitle="Three problems in the city. Solve them with numbers AND explain in English." onExit={onExit}>
      <div className="g72-steps">{["1 · Personal", "2 · Business", "3 · Digital", "🏆 Result"].map((s, i) => <span key={s} className={ch === i ? "on" : ch > i ? "done" : ""}>{s}</span>)}</div>
      {ch === 0 && (
        <>
          <Mission e="🧑" title="Lucas (14) has $500,000 a month and no plan.">Classify his expenses. Then make a zero-based budget: how much can he SAVE so every peso has a job?</Mission>
          <div className="g8-papers">{BOSS1_ITEMS.map((x, i) => <div key={i} className={`g8-paper ${cls[i] ? (cls[i] === "need" ? "in" : "out") : ""}`}><b>{x[0]} {x[1]}</b><span>{cop(x[2])}</span><div className="type-toggle">{["need", "want"].map((v) => <button key={v} type="button" className={cls[i] === v ? "on" : ""} onClick={() => setCls({ ...cls, [i]: v })}>{v === "need" ? "✅ Need" : "🎁 Want"}</button>)}</div></div>)}</div>
          <div className="g8-row big"><span>🐷 Savings (so the budget = $0)</span><MoneyInput value={sav} onChange={setSav} /></div>
          <div className="p3-sentence edit"><span>✍️ My advice for Lucas:</span><input className="start-input" value={e1} onChange={(e) => setE1(e.target.value)} placeholder="Write your answer here…" /></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={Object.keys(cls).length < BOSS1_ITEMS.length || !sav || countWords(e1) < 10} onClick={() => next("personal", c1ok)}>Submit challenge 1 <ChevronRight size={18} /></button></div>
        </>
      )}
      {ch === 1 && (
        <>
          <Mission e="🧃" title="The juice stand doesn't know its profit.">One line in the ledger should NOT be there. Tap it. Then calculate the real weekly profit.</Mission>
          <div className="g8-ledger">
            <div className="g8-lg-h four"><span>Day</span><span>Description</span><span>In</span><span>Out</span></div>
            {BOSS2_ROWS.map((r, i) => <button key={i} type="button" className={`g8-lg-r four ${bad === i ? "picked" : ""}`} onClick={() => setBad(i)}><span>{r[0]}</span><span>{r[1]}</span><b className="pos">{r[3] === "in" ? `+${cop(r[2])}` : ""}</b><b className="neg">{r[3] !== "in" ? `−${cop(r[2])}` : ""}</b></button>)}
          </div>
          <div className="g8-row big"><span>📈 Real weekly profit</span><MoneyInput value={prof} onChange={setProf} /></div>
          <div className="p3-sentence edit"><span>✍️ Explain your correction:</span><input className="start-input" value={e2} onChange={(e) => setE2(e.target.value)} placeholder="Write your answer here…" /></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={bad === null || !prof || countWords(e2) < 10} onClick={() => next("business", c2ok)}>Submit challenge 2 <ChevronRight size={18} /></button></div>
        </>
      )}
      {ch === 2 && (
        <>
          <Mission e="📱" title="Your little brother (11) wants a budgeting app.">Choose the safest app for him and explain why.</Mission>
          <div className="g72-opts">{APPS9.slice(0, 3).map((x) => <button key={x.id} type="button" className={`g72-opt ${app === x.id ? "on" : ""}`} onClick={() => setApp(x.id)}><em>{x.e}</em><span><b>{x.n}</b><br /><small>{x.price ? `${cop(x.price)}/month` : "Free"} · {x.perms.map((p) => p[0].split(" ")[0]).join(" ")}</small></span></button>)}</div>
          <div className="p3-sentence edit"><span>✍️ I choose it because</span><input className="start-input" value={e3} onChange={(e) => setE3(e.target.value)} placeholder="Write your answer here…" /></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!app || countWords(e3) < 10} onClick={() => next("digital", c3ok)}>Submit challenge 3 <ChevronRight size={18} /></button></div>
        </>
      )}
      {ch === 3 && (
        <>
          <div className="g73-score"><small>CHALLENGES SOLVED</small><b className={total === 3 ? "good" : ""}>{total}/3</b><span>{total === 3 ? "Perfect! Financial City is in good hands." : "Check the answers below — learning from mistakes is part of the job."}</span></div>
          <div className="g8-answers">
            <div className={score.personal ? "ok" : "no"}><b>1 · Personal</b><span>Needs: bus, lunches, phone. Savings = 500,000 − {spend.toLocaleString("en-US")} = <b>{cop(500000 - spend)}</b> ({Math.round(((500000 - spend) / 500000) * 100)}%).</span></div>
            <div className={score.business ? "ok" : "no"}><b>2 · Business</b><span>“Netflix for my house” is personal. Profit = {cop(rev)} − {cop(exp)} = <b>{cop(rev - exp)}</b>.</span></div>
            <div className={score.digital ? "ok" : "no"}><b>3 · Digital</b><span>📒 SimpleBudget: free, no unnecessary permissions, data stays on the phone, easy to cancel.</span></div>
          </div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(20 + total * 10, { score, texts: [e1, e2, e3] })}>Claim my reward <span className="coin-tag"><Coins size={15} /> +{20 + total * 10}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- MONEY BLUEPRINT FINAL ---------- */
const loadHtml2Canvas = () => (window.html2canvas ? Promise.resolve(window.html2canvas) : new Promise((res, rej) => {
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  s.onload = () => res(window.html2canvas); s.onerror = rej;
  document.body.appendChild(s);
}));
function FinalBlueprint({ resp, studentName, existing, onSave, onExit }) {
  const r = resp || {};
  const [habit, setHabit] = useState(existing?.habit || "");
  const [because, setBecause] = useState(existing?.because || "");
  const [busy, setBusy] = useState(false);
  const [st, finish] = useFinish(onSave);
  const pages = BP_PAGES.filter((p) => r[p.key]).length;
  const ready = pages >= 6 && countWords(habit) >= 3 && countWords(because) >= 5;
  const png = async () => { setBusy(true); try { const h2c = await loadHtml2Canvas(); const cv = await h2c(document.getElementById("g8-final"), { scale: 2, backgroundColor: "#ffffff", useCORS: true }); const a = document.createElement("a"); a.href = cv.toDataURL("image/png"); a.download = `Money_Blueprint_${(studentName || "student").replace(/\s+/g, "_")}.png`; a.click(); } catch (e) { /* sin imagen */ } setBusy(false); };
  const print = () => { document.body.classList.add("g8-printing"); const off = () => { document.body.classList.remove("g8-printing"); window.removeEventListener("afterprint", off); }; window.addEventListener("afterprint", off); setTimeout(() => window.print(), 50); };
  const Sec = ({ n, children }) => { const p = BP_PAGES.find((x) => x.n === n); const has = r[p.key]; return <section className={`g8-fp ${has ? "" : "empty"}`}><h4><span>{p.n}</span>{p.e} {p.t}</h4>{has ? children : <p className="g8-fp-empty">Not completed yet.</p>}</section>; };
  const s1 = r.c1_snapshot, s2 = r.c2_income, s3 = r.c3_statement, s4 = r.c4_battle, s5 = r.c5_scanner, s6 = r.c6_books, s7 = r.c7_autopsy, s8 = r.c8_sim, s9 = r.c9_rules, radar = r.c1_radar;
  if (st.done) return <Reward title="My Money Blueprint is complete! 🏆" subtitle="Your first real financial plan — in English." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Award size={22} strokeWidth={2.1} />} title="My Money Blueprint 📐" subtitle="It builds itself with your 9 pages. Add your habit and present it!" onExit={onExit}>
      <div className="g8-final" id="g8-final">
        <header><small>MONEY BLUEPRINT · GRADE 8 · INSTITUTO CREAR</small><h2>My Personal Financial Plan</h2><p>By <b>{studentName}</b>{radar ? ` · Radar: ${radar.profile}` : ""}</p></header>
        <div className="g8-fp-grid">
          <Sec n="01">{s1 && <><p>In {cop(s1.tIn)} · Out {cop(s1.tOut)} · Left <b>{cop(s1.left)}</b></p><p>{s1.mood}</p><i>🎯 {s1.goal}</i></>}</Sec>
          <Sec n="02">{s2 && <><p>💼 Active {cop(s2.active)} · 🌙 Passive {cop(s2.passive)} · 🎁 Gifts {cop(s2.gifts)}</p><p>Future job: <b>{s2.dreamJob}</b> ({s2.sector})</p></>}</Sec>
          <Sec n="03">{s3 && <><p>{s3.rows.length} movements · Income {cop(s3.income)}</p><StackBar parts={[{ label: "Needs", value: s3.needs, color: "#0b7a50" }, { label: "Wants", value: s3.wants, color: "#e07a2f" }, { label: "Savings", value: s3.save, color: "#f5b23e" }]} /></>}</Sec>
          <Sec n="04">{s4 && <><p>Surprise: <b>{s4.event}</b></p><p>🐷 Savings after: {cop(groupOf(s4.after, "save"))}</p><i>“{s4.text.split(" ").slice(0, 22).join(" ")}…”</i></>}</Sec>
          <Sec n="05">{s5 && <><p>🔍 Errors found: <b>{s5.found}/{s5.total}</b></p><i>✉️ “However, the receipt shows {s5.letter?.b}”</i></>}</Sec>
          <Sec n="06">{s6 && <><p>Revenue {cop(s6.revenue)} − Expenses {cop(s6.expenses)}</p><p>📈 Real profit: <b>{cop(s6.profit)}</b> → plan: {cop(s6.newProfit)}</p></>}</Sec>
          <Sec n="07">{s7 && <><p>💧 Leak fixed: saves <b>{cop(s7.save4)}</b> in 4 weeks</p><i>“{s7.text.split(" ").slice(0, 20).join(" ")}…”</i></>}</Sec>
          <Sec n="08">{s8 && <><p>🌍 Compared: <b>{s8.famA}</b> vs. <b>{s8.famB}</b></p><i>“{s8.text.split(" ").slice(0, 22).join(" ")}…”</i></>}</Sec>
          <Sec n="09">{s9 && <><ul>{s9.rules.slice(0, 4).map((x) => <li key={x}>{x}</li>)}</ul></>}</Sec>
          <section className="g8-fp habit"><h4><span>10</span>🔁 My habit</h4><p><b>One financial habit I want to improve is</b> {habit || "…"} <b>because</b> {because || "…"}</p></section>
        </div>
        <footer>💡 Concepts: income · expenses · needs & wants · fixed & variable · 50/30/20 · zero-based budget · receipts & invoices · IVA · ledger · profit & loss · money leaks · cost of living · app safety</footer>
      </div>
      <div className="start-block">
        <h3><PenLine size={18} /> My habit</h3>
        <div className="p3-sentence edit"><span>One financial habit I want to improve is</span><input className="start-input" value={habit} onChange={(e) => setHabit(e.target.value)} placeholder="Write your answer here…" /></div>
        <div className="p3-sentence edit"><span>because</span><input className="start-input" value={because} onChange={(e) => setBecause(e.target.value)} placeholder="Write your answer here…" /></div>
      </div>
      {pages < 6 && <div className="p1-banner bad"><span>You need at least 6 of the 9 pages. You have {pages}.</span></div>}
      <div className="p3-card-actions"><button className="s1-btn ghost" disabled={busy} onClick={png}><Download size={17} /> {busy ? "Creating…" : "Download PNG"}</button><button className="s1-btn ghost" onClick={print}><Printer size={17} /> Print / PDF</button></div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(50, { habit, because, pages })}>Publish my Blueprint <span className="coin-tag"><Coins size={15} /> +50</span></button></div>
    </ActShell>
  );
}

const SHOW8 = ["I showed my money snapshot and my income map.", "I explained my budget before and after the surprise.", "I showed one error I found in a receipt.", "I explained the real profit of Aunt Rosa's business.", "I described my spending chart with data words.", "I shared my digital safety rules and my habit."];
function Showcase8({ onSave, onExit }) {
  const [checks, setChecks] = useState([]);
  const [peer, setPeer] = useState("");
  const [stars, setStars] = useState({ clear: 0, numbers: 0, english: 0 });
  const [c1, setC1] = useState(""); const [c2, setC2] = useState("");
  const [st, finish] = useFinish(onSave);
  const ready = checks.length >= 5 && peer.trim() && Object.values(stars).every((x) => x > 0) && countWords(c1) >= 3 && countWords(c2) >= 3;
  if (st.done) return <Reward title="Showcase done! 🎤" subtitle="You presented a real financial plan in English." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Mic size={22} strokeWidth={2.1} />} title="Blueprint Showcase 🎤" subtitle="Present your Blueprint (3 minutes). Then give your tablet to a classmate." onExit={onExit}>
      <div className="start-block"><h3><span className="step-n">1</span> My presentation checklist (5+)</h3>{SHOW8.map((s) => <label key={s} className="perm-check p1-check"><input type="checkbox" checked={checks.includes(s)} onChange={() => setChecks(checks.includes(s) ? checks.filter((x) => x !== s) : [...checks, s])} /><span>{s}</span></label>)}</div>
      <div className="start-block">
        <h3><span className="step-n">2</span> 🔁 Classmate's feedback</h3>
        <input className="start-input p3-gap" value={peer} onChange={(e) => setPeer(e.target.value)} placeholder="Classmate's name" />
        {[["clear", "The plan was clear"], ["numbers", "They used numbers as evidence"], ["english", "They spoke in English"]].map(([k, l]) => <div key={k} className="p3-rub"><div><b>{l}</b></div><span /><div className="p3-stars">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={stars[k] >= n ? "on" : ""} onClick={() => setStars({ ...stars, [k]: n })}>★</button>)}</div></div>)}
        <div className="p3-sentence edit"><span>⭐ The best part was</span><input className="start-input" value={c1} onChange={(e) => setC1(e.target.value)} placeholder="Write it here…" /></div>
        <div className="p3-sentence edit"><span>💡 One idea to improve:</span><input className="start-input" value={c2} onChange={(e) => setC2(e.target.value)} placeholder="Write it here…" /></div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(20, { checks, peer, stars, comments: [c1, c2] })}>Save feedback <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}

const BOSS_8P1 = [
  { q: "Income is…", options: ["money that comes in", "money you plan to spend next month on your needs", "an expense", "a bank"], correct: 0, feedback: "Salary, allowance, sales, gifts." },
  { q: "Which is a NEED for a student?", options: ["Transport to school", "A new phone case because the old one is boring", "Game skins", "Cinema"], correct: 0, feedback: "Needed to study." },
  { q: "A phone plan that costs the same every month is a…", options: ["fixed expense", "variable expense, because you use more data some months", "want", "income"], correct: 0, feedback: "Same amount = fixed." },
  { q: "With 50/30/20 and $400,000, savings are…", options: ["$80,000", "$120,000, which is thirty percent of the income", "$200,000", "$40,000"], correct: 0, feedback: "20% of 400,000." },
  { q: "In a zero-based budget, $0 at the end means…", options: ["every peso has a job", "you spent all your money on things you wanted", "no savings", "you are broke"], correct: 0, feedback: "Savings is a job too." },
  { q: "A good budget is…", options: ["a plan that can change", "a perfect prediction that never changes during the month", "only for adults", "a law"], correct: 0, feedback: "Flexible plans survive surprises." },
  { q: "A coffee farm is in the…", options: ["primary sector", "secondary sector, because coffee is later transformed", "tertiary sector", "quinary sector"], correct: 0, feedback: "From nature." },
  { q: "A factory that makes chocolate is in the…", options: ["secondary sector", "primary sector, because cacao grows on trees", "tertiary sector", "quaternary sector"], correct: 0, feedback: "Transformation." },
  { q: "Rent you receive from an apartment is…", options: ["passive income", "active income, because you receive it every month", "an expense", "a gift"], correct: 0, feedback: "Little daily work." },
  { q: "A receipt proves that…", options: ["you paid", "the product will never break and has a guarantee", "you are rich", "the store is legal"], correct: 0, feedback: "Proof of payment." },
  { q: "Subtotal $200,000 + IVA 19%. Total?", options: ["$238,000", "$219,000, adding nineteen thousand pesos", "$380,000", "$200,019"], correct: 0, feedback: "200,000 × 1.19." },
  { q: "The same product appears twice on your receipt. This is a…", options: ["duplicate charge", "discount that the store gives to loyal customers", "tax", "voucher"], correct: 0, feedback: "Ask for a correction." },
  { q: "A ledger is…", options: ["a record of money in and out", "a list of all the customers that visit a business", "a loan", "a recipe"], correct: 0, feedback: "With dates and amounts." },
  { q: "Revenue $900,000 − expenses $1,000,000 =", options: ["a loss of $100,000", "a profit of $100,000, because there were many sales", "$1,900,000", "$0"], correct: 0, feedback: "Expenses > revenue = loss." },
  { q: "A personal TV bought with the shop's money should…", options: ["not go in the business ledger", "go in the business ledger as a normal expense of the shop", "be revenue", "be hidden"], correct: 0, feedback: "Separate personal and business money." },
  { q: "A busy day is always the most profitable day.", options: ["False — costs matter", "True, because more customers always means more profit", "True", "Only on Saturdays"], correct: 0, feedback: "Check revenue AND costs." },
  { q: "A money leak is…", options: ["many small expenses that add up", "one big purchase that you plan for months", "a broken wallet", "a bank fee"], correct: 0, feedback: "Small + frequent." },
  { q: "$5,000 a day for 20 school days =", options: ["$100,000", "$25,000, adding five thousand pesos per week", "$50,000", "$1,000,000"], correct: 0, feedback: "5,000 × 20." },
  { q: "The 24-hour rule helps you avoid…", options: ["impulse buying", "paying your phone plan on the right date every month", "saving", "studying"], correct: 0, feedback: "Wait before non-essential buys." },
  { q: "“Cost of living” means…", options: ["how much basic things cost in a place", "the salary that people earn in a city every month", "a tax", "a bank account"], correct: 0, feedback: "It changes by city." },
  { q: "A family spends 40% of $300 on food. Another spends 15% of $3,000. Who spends more dollars?", options: ["The second family ($450)", "The first family, because 40% is a bigger percentage", "The same", "Nobody"], correct: 0, feedback: "% ≠ amount." },
  { q: "A budget app asks for your photos and location. You…", options: ["deny them — they aren't needed", "accept everything because the app has 4.9 stars", "send your password", "give your contacts"], correct: 0, feedback: "Only necessary permissions." },
  { q: "2FA means…", options: ["password + a second verification", "two passwords that you share with your best friend", "two apps", "two banks"], correct: 0, feedback: "A second step." },
  { q: "Ten identical 5-star reviews are probably…", options: ["fake", "real, because many people love the same app", "illegal", "ads"], correct: 0, feedback: "Copy-paste = red flag." },
];
const RUBRIC8 = [
  { id: "plan", t: "I can explain income, expenses, needs and wants", d: "And why planning matters.", acts: ["c1_basics", "c1_rush", "c1_game", "c1_snapshot", "c2_income", "c3_detective"],
    check: { q: "Income $500,000 · needs $300,000 · wants $150,000. How much is left?", options: ["$50,000", "$150,000", "$800,000"], tip: "Income − needs − wants. Review: Class 1 · Where Did It Go?" } },
  { id: "budget", t: "I can build and adjust a budget", d: "50/30/20 and zero-based.", acts: ["c4_first", "c4_video", "c4_math", "c4_battle"],
    check: { q: "50/30/20 with $600,000. How much goes to SAVINGS?", options: ["$120,000", "$180,000", "$300,000"], tip: "20% of 600,000. Review: Class 4 · Budget Math." } },
  { id: "docs", t: "I can read receipts and invoices and find errors", d: "Subtotal, IVA, total.", acts: ["c5_docs", "c5_rush", "c5_read", "c5_scanner"],
    check: { q: "Subtotal $100,000 + IVA 19% =", options: ["$119,000", "$100,019", "$190,000"], tip: "100,000 × 1.19. Review: Class 5 · Receipt Scanner." } },
  { id: "books", t: "I can keep a ledger and calculate profit or loss", d: "Revenue − expenses.", acts: ["c6_basics", "c6_rush", "c6_week", "c6_books"],
    check: { q: "Revenue $2,000,000 − expenses $2,300,000 =", options: ["A loss of $300,000", "A profit of $300,000", "$4,300,000"], tip: "Expenses bigger than revenue = loss. Review: Class 6 · Balance the Books." } },
  { id: "habits", t: "I can analyze spending data and fix a money leak", d: "Charts + data words.", acts: ["c7_rush", "c7_read", "c7_autopsy", "c7_mine"],
    check: { q: "$3,000 a day × 20 school days =", options: ["$60,000", "$23,000", "$6,000"], tip: "Small × many times. Review: Class 7 · Spending Autopsy." } },
  { id: "global", t: "I can compare budgets and cost of living", d: "% vs. amount, exchange rates.", acts: ["c8_starter", "c8_video", "c8_city", "c8_sim"],
    check: { q: "Family A spends 40% of $300. Family B spends 15% of $3,000. Who spends MORE dollars?", options: ["Family B", "Family A", "The same"], tip: "40% of 300 = 120 · 15% of 3,000 = 450. Review: Class 8 · Household Simulator." } },
  { id: "digital", t: "I can choose and use money apps safely", d: "Permissions, 2FA, reviews.", acts: ["c9_starter", "c9_rush", "c9_lab", "c9_rules"],
    check: { q: "A budget app asks for your contacts. You…", options: ["Deny it — it isn't necessary", "Accept — apps need everything", "Send your password too"], tip: "Only necessary permissions. Review: Class 9 · App Security Lab." } },
];
const STAR_L = ["", "Starting", "Developing", "Good", "Excellent"];
const HOW_L = [["read", "📖 Reading"], ["video", "🎬 Video"], ["game", "🎮 Game"], ["write", "✍️ Writing"], ["sim", "🧮 Simulator"]];
function SelfCheck8({ existing, checklist, onSave, onExit }) {
  const [stars, setStars] = useState(existing?.stars || {});
  const [how, setHow] = useState(existing?.how || {});
  const [prove, setProve] = useState({});
  const [goal, setGoal] = useState(existing?.goal || 0);
  const [proud, setProud] = useState(existing?.proud || "");
  const [next, setNext] = useState(existing?.next || "");
  const [st, finish] = useFinish(onSave);
  const orders = useMemo(() => RUBRIC8.map((r) => shuffleArr(r.check.options.map((_, k) => k))), []);
  const ck = checklist || {};
  const actT = (k) => ALL_ACTS.find((a) => a.key === k)?.title.replace(/ · Page \d+/, "") || k;
  const proved = RUBRIC8.filter((r) => prove[r.id] === 0).length;
  const all = RUBRIC8.every((r) => stars[r.id] && how[r.id] && prove[r.id] !== undefined);
  const score = Math.round(RUBRIC8.reduce((a, r) => a + (stars[r.id] || 0), 0) / (RUBRIC8.length * 4) * 100);
  if (st.done) return <Reward title="Period 1 complete! 🏆" subtitle={`Prove-it challenges: ${proved}/${RUBRIC8.length}`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Star size={22} strokeWidth={2.1} />} title="My Self-Check · Period 1" subtitle="For each skill: prove it, say how you learned it, then rate yourself." onExit={onExit}>
      <HowTo>Seven skills. For each one: 1) <b>Prove it</b> with a quick question. 2) Look at <b>where you practiced it</b> (✓ = done). 3) Choose <b>how you learned it best</b>. 4) Give yourself <b>stars</b> — be honest!</HowTo>
      <div className="g8-skills">
        {RUBRIC8.map((r, ri) => {
          const p = prove[r.id];
          const doneActs = r.acts.filter((k) => ck[k]).length;
          return (
            <div key={r.id} className={`g8-skill ${stars[r.id] && how[r.id] && p !== undefined ? "done" : ""}`}>
              <header><span>{ri + 1}</span><div><b>{r.t}</b><small>{r.d}</small></div><i>{doneActs}/{r.acts.length} practiced</i></header>
              <div className="g8-skill-acts">{r.acts.map((k) => <span key={k} className={ck[k] ? "ok" : ""}>{ck[k] ? "✓" : "○"} {actT(k)}</span>)}</div>
              <div className="g8-skill-prove">
                <small>🎯 PROVE IT</small><b>{r.check.q}</b>
                <div>{orders[ri].map((k) => <button key={k} type="button" disabled={p !== undefined} className={p === undefined ? "" : k === 0 ? "ok" : k === p ? "no" : ""} onClick={() => setProve({ ...prove, [r.id]: k })}>{r.check.options[k]}</button>)}</div>
                {p !== undefined && <p className={p === 0 ? "ok" : "no"}>{p === 0 ? "✅ Correct!" : "❌ Not this time."} {r.check.tip}</p>}
              </div>
              <div className="g8-skill-row">
                <div><small>HOW DID YOU LEARN IT BEST?</small><div className="g74-chips">{HOW_L.map(([k, l]) => <button key={k} type="button" className={how[r.id] === k ? "on" : ""} onClick={() => setHow({ ...how, [r.id]: k })}>{l}</button>)}</div></div>
                <div><small>MY LEVEL</small><div className="p3-stars">{[1, 2, 3, 4].map((n) => <button key={n} type="button" className={(stars[r.id] || 0) >= n ? "on" : ""} onClick={() => setStars({ ...stars, [r.id]: n })}>★</button>)}<small>{STAR_L[stars[r.id] || 0]}</small></div></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p3-score"><small>My self-check</small><b>{score}%</b><div className="p3-mini-bar"><i style={{ width: `${score}%` }} /></div></div>
      <div className="start-block">
        <h3>🧭 Did the activities help you reach the goal?</h3>
        <p className="start-tip">Goal: <i>“Create a personal financial plan to make smarter money decisions.”</i></p>
        <div className="g8-goalscale">{[["😕", "Not really"], ["🙂", "A little"], ["😀", "Yes"], ["🤩", "Totally!"]].map(([e, l], k) => <button key={l} type="button" className={goal === k + 1 ? "on" : ""} onClick={() => setGoal(k + 1)}><em>{e}</em>{l}</button>)}</div>
        <label className="p3-lbl">🌟 The activity that taught me the most was…<input className="start-input" value={proud} onChange={(e) => setProud(e.target.value)} placeholder="Write your answer here…" /></label>
        <label className="p3-lbl">🎯 Next period I want to improve…<input className="start-input" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Write your answer here…" /></label>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!all || !goal || countWords(proud) < 3 || countWords(next) < 3} onClick={() => finish(20, { stars, how, proved, score, goal, proud, next })}>{all ? "Send my self-check" : "Complete the 7 skills"} <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   ESTRUCTURA DEL PERIODO (10 clases) · Financial City
   ===================================================================== */
const G8P1_WEEKS = [
  { n: 1, g: "1", title: "The Missing Money", blurb: "Your Money Radar, the basics and a story: $400,000 gone in one week.", e: "🧭", skills: ["Reading", "Listening"], acts: [
    { key: "c1_radar", title: "My Money Radar 🧭", desc: "10 situations · 5 pillars. Where am I today?", icon: <Compass size={22} />, coins: 15, bucket: "comportamiento", topics: ["Money", "Business", "Wellbeing", "Digital", "Global"] },
    { key: "c1_basics", title: "Starter: Money Words 🧱", desc: "7 key words from zero + match game.", icon: <Lightbulb size={22} />, coins: 20, bucket: "quizzes" },
    { key: "c1_rush", title: "Need or Want? Speed Rush ⚡", desc: "16 cards · 60 seconds · build a combo!", icon: <Zap size={22} />, coins: 24, bucket: "aprendi" },
    { key: "c1_video", title: "Video: Teens and Money 🎬", desc: "Igor's talk · 8 random questions (70%).", icon: <Video size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c1_read", title: "Reading: The Missing Money 📖", desc: "Valentina's first paycheck · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c1_game", title: "Where Did It Go? 🔎", desc: "Rebuild her week, audit it, go back in time.", icon: <Search size={22} />, coins: 30, bucket: "aprendi" },
    { key: "c1_snapshot", title: "My Money Snapshot 📸 · Page 01", desc: "A photo of YOUR money today.", icon: <Wallet size={22} />, coins: 25, bucket: "aprendi" },
  ] },
  { n: 2, g: "2", title: "The City That Makes Money", blurb: "Economic sectors and sources of income. Build a city where money travels.", e: "🏙️", skills: ["Listening", "Reading"], acts: [
    { key: "c2_starter", title: "Starter: Sectors & Income 🧱", desc: "From primary to quinary + quick game.", icon: <Lightbulb size={22} />, coins: 20, bucket: "quizzes" },
    { key: "c2_video", title: "Video: Economic Sectors 🎬", desc: "5 sectors explained · 8 random questions (70%).", icon: <Video size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c2_read", title: "Reading: The Journey of a Cup of Coffee ☕", desc: "An economic report · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c2_city", title: "Economic City Builder 🏙️", desc: "Build 4 value chains. Follow the money.", icon: <Building2 size={22} />, coins: 40, bucket: "aprendi" },
    { key: "c2_sort", title: "Sector Sort: Colombia at Work 🇨🇴", desc: "18 real jobs · 5 sectors.", icon: <Puzzle size={22} />, coins: 40, bucket: "quizzes" },
    { key: "c2_income", title: "My Income Map 🗺️ · Page 02", desc: "Active, passive, gifts — today and tomorrow.", icon: <MapIcon size={22} />, coins: 25, bucket: "aprendi" },
  ] },
  { n: 3, g: "3", title: "The Shopping Trap", blurb: "Needs vs. wants, fixed vs. variable. Read a statement — then create yours.", e: "🛍️", skills: ["Reading", "Math"], acts: [
    { key: "c3_starter", title: "Starter: Need, Want, Fixed, Variable 🧱", desc: "6 key words + quick game.", icon: <Lightbulb size={22} />, coins: 20, bucket: "quizzes" },
    { key: "c3_rush", title: "Fixed or Variable? Rush ⚡", desc: "14 expenses · beat the clock.", icon: <Zap size={22} />, coins: 24, bucket: "aprendi" },
    { key: "c3_detective", title: "Expense Detective 🕵️", desc: "Daniel's bank statement: 24 movements to investigate.", icon: <Search size={22} />, coins: 36, bucket: "aprendi" },
    { key: "c3_read", title: "Reading: The Weekend Sale 💬", desc: "A group chat + a diary · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c3_statement", title: "Create My Statement 🧾 · Page 03", desc: "Be the bank: build your month.", icon: <FileText size={22} />, coins: 30, bucket: "aprendi" },
  ] },
  { n: 4, g: "4", title: "Budget Under Pressure", blurb: "From your first 3-jar budget to a budget that survives a surprise.", e: "⚖️", skills: ["Math", "Listening"], acts: [
    { key: "c4_first", title: "Starter: My First Budget 🫙", desc: "$100,000 and three jars.", icon: <PiggyBank size={22} />, coins: 18, bucket: "quizzes" },
    { key: "c4_video", title: "Video: The 50/30/20 Rule 🎬", desc: "8 random questions (70%).", icon: <Video size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c4_math", title: "Budget Math 🧮", desc: "8 problems: 50/30/20, zero-based, %.", icon: <Calculator size={22} />, coins: 30, bucket: "quizzes" },
    { key: "c4_read", title: "Reading: The Budget That Broke on Tuesday 📖", desc: "A decision case · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c4_battle", title: "Budget Battle ⚖️ · Page 04", desc: "Plan · surprise · rebuild · explain.", icon: <Scale size={22} />, coins: 35, bucket: "aprendi" },
  ] },
  { n: 5, g: "5", title: "The Case of the Fake Receipt", blurb: "Receipts, invoices, vouchers and IVA. Six documents, six errors.", e: "🧾", skills: ["Reading", "Writing"], acts: [
    { key: "c5_docs", title: "Starter: Financial Documents 🧱", desc: "Receipt, invoice, voucher, IVA, NIT.", icon: <Lightbulb size={22} />, coins: 20, bucket: "quizzes" },
    { key: "c5_rush", title: "Receipt, Invoice or Voucher? ⚡", desc: "12 documents · 3 boxes · 60 seconds.", icon: <Zap size={22} />, coins: 24, bucket: "aprendi" },
    { key: "c5_read", title: "Reading: The Supermarket Mystery 📖", desc: "An investigation file · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c5_scanner", title: "Receipt Scanner 🔍 · Page 05", desc: "Find 6 errors + write a complaint.", icon: <Receipt size={22} />, coins: 34, bucket: "aprendi" },
  ] },
  { n: 6, g: "6", title: "Is the Arepa Business Making Money?", blurb: "Run the stand, keep the ledger, find the real profit.", e: "🫓", skills: ["Business", "Math"], acts: [
    { key: "c6_basics", title: "Starter: Revenue, Profit, Loss 🧱", desc: "6 key words + quick math.", icon: <Lightbulb size={22} />, coins: 20, bucket: "quizzes" },
    { key: "c6_rush", title: "Revenue, Expense or Personal? ⚡", desc: "Keep Aunt Rosa's ledger clean.", icon: <Zap size={22} />, coins: 24, bucket: "aprendi" },
    { key: "c6_read", title: "Reading: The Busy Shop with No Profit 📖", desc: "Interview + ledger · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c6_week", title: "Arepa Shop Manager 🫓", desc: "6 days: forecast, prepare, sell, record.", icon: <Store size={22} />, coins: 30, bucket: "aprendi" },
    { key: "c6_books", title: "Balance the Books 📒 · Page 06", desc: "Sort, find the missing costs, improve.", icon: <FileText size={22} />, coins: 35, bucket: "aprendi" },
  ] },
  { n: 7, g: "7", title: "The Invisible Money Leak", blurb: "Small purchases, big surprises. Find leaks with real data.", e: "💧", skills: ["Math", "Writing"], acts: [
    { key: "c7_starter", title: "Starter: Leaks & Habits 🧱", desc: "6 key words + quick math.", icon: <Lightbulb size={22} />, coins: 20, bucket: "quizzes" },
    { key: "c7_rush", title: "Leak or Plan? Rush ⚡", desc: "Spot the money leaks fast.", icon: <Zap size={22} />, coins: 24, bucket: "aprendi" },
    { key: "c7_read", title: "Reading: Small Purchases, Big Surprises 📖", desc: "A data investigation · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c7_autopsy", title: "Spending Autopsy 📊 · Page 07", desc: "Charts, habits and a data report.", icon: <BarChart3 size={22} />, coins: 35, bucket: "aprendi" },
    { key: "c7_mine", title: "My 7-Day Tracker 📝", desc: "Your own purchases, your own chart.", icon: <PenLine size={22} />, coins: 25, bucket: "aprendi" },
  ] },
  { n: 8, g: "8", title: "Five Families, Five Budgets", blurb: "Household budgets and cost of living around the world.", e: "🌍", skills: ["Listening", "Global"], acts: [
    { key: "c8_starter", title: "Starter: Cost of Living 🧱", desc: "Currency, exchange rate, % vs. amount.", icon: <Lightbulb size={22} />, coins: 20, bucket: "quizzes" },
    { key: "c8_video", title: "Video: Living on $1,500 🎬", desc: "Cities around the world · 8 random questions (70%).", icon: <Video size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c8_city", title: "Live on $1,500 ✈️", desc: "Calculate your living number in 6 cities.", icon: <MapIcon size={22} />, coins: 24, bucket: "aprendi" },
    { key: "c8_read", title: "Reading: Five Families, Five Budgets 📖", desc: "A data magazine · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c8_sim", title: "Household Budget Simulator 🌍 · Page 08", desc: "5 homes · a surprise · compare two.", icon: <Globe size={22} />, coins: 35, bucket: "aprendi" },
  ] },
  { n: 9, g: "9", title: "Would You Trust This App?", blurb: "Budgeting apps, permissions, fake reviews and a safe setup.", e: "📱", skills: ["Digital", "Writing"], acts: [
    { key: "c9_starter", title: "Starter: App Safety Words 🧱", desc: "Permissions, privacy, 2FA, subscriptions.", icon: <Lightbulb size={22} />, coins: 20, bucket: "quizzes" },
    { key: "c9_rush", title: "Safe or Red Flag? 🚩 Rush", desc: "12 situations · protect your money.", icon: <Zap size={22} />, coins: 24, bucket: "aprendi" },
    { key: "c9_lab", title: "App Security Lab 🔬", desc: "Investigate 4 apps for Sara.", icon: <Shield size={22} />, coins: 30, bucket: "aprendi" },
    { key: "c9_read", title: "Reading: The App That Wanted Too Much 📖", desc: "Reviews + privacy · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c9_rules", title: "Safe Setup + My Rules 🔐 · Page 09", desc: "Practice account, rules and a review.", icon: <Lock size={22} />, coins: 30, bucket: "aprendi" },
  ] },
  { n: 10, g: "10", title: "The Money Blueprint Challenge", blurb: "Save Financial City, publish your Blueprint, beat the Boss.", e: "🏆", skills: ["Speaking", "Review"], acts: [
    { key: "c10_boss", title: "Financial City Boss 🏙️⚔️", desc: "3 challenges: personal, business, digital.", icon: <Swords size={22} />, coins: 50, bucket: "aprendi" },
    { key: "c10_blueprint", title: "My Money Blueprint 📐", desc: "It builds itself with your 9 pages!", icon: <Award size={22} />, coins: 50, bucket: "aprendi" },
    { key: "c10_present", title: "Blueprint Showcase 🎤", desc: "Present and get feedback.", icon: <Mic size={22} />, coins: 20, bucket: "comportamiento" },
    { key: "c10_quiz", title: "Boss Battle · Period 1 ⚔️", desc: "15 questions from the whole period (70%).", icon: <Trophy size={22} />, coins: 70, bucket: "quizzes" },
    { key: "c10_self", title: "My Self-Check", desc: "Prove 7 skills + how you learned them.", icon: <Star size={22} />, coins: 20, bucket: "comportamiento" },
  ] },
];
const ALL_ACTS = G8P1_WEEKS.flatMap((w) => w.acts);
const TOTAL_ACTS = ALL_ACTS.length;
const PAGE_ACTS = [...BP_PAGES.map((p) => p.key), "c10_blueprint"];

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Periodo1G8 = ({ userData, API_URL, existingRow, onBack }) => {
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
  const doneCount = ALL_ACTS.filter((a) => checklist[a.key]).length;
  const pctDone = Math.round((doneCount / TOTAL_ACTS) * 100);
  const weekDone = (w) => w.acts.every((a) => checklist[a.key]);
  const coinsTotal = Math.round(points.comportamiento + points.quizzes + points.aprendi);

  const persist = (nextChecklist, nextPoints, respPatch) => {
    respRef.current = { ...respRef.current, ...respPatch };
    const done = ALL_ACTS.filter((a) => nextChecklist[a.key]).length;
    const row = {
      Student_Key: userData.Student_Key, Semana: PERIOD_KEY, Grado: GRADE,
      Estado: done >= TOTAL_ACTS ? "completed" : "in_progress",
      Porcentaje: Math.round((done / TOTAL_ACTS) * 100),
      Puntos_Comportamiento: nextPoints.comportamiento, Puntos_Quizzes: nextPoints.quizzes, Puntos_Aprendi: nextPoints.aprendi,
      Checklist_JSON: JSON.stringify(nextChecklist), Respuestas_JSON: JSON.stringify(respRef.current),
    };
    const prev = store.semanas?.[PERIOD_KEY];
    dispatch({ type: "save_progreso", payload: row }); // OPTIMISTA
    fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "save_progreso", data: row }) })
      .catch((e) => { console.error("Error guardando 8° Periodo 1:", e); dispatch({ type: "rollback_progreso", payload: { Semana: PERIOD_KEY, prev } }); });
  };
  const complete = (key, bucket, xp, respPatch, pass = true) => {
    const already = !!checklist[key];
    const nextChecklist = { ...checklist, [key]: already || pass };
    const nextPoints = already ? points : { ...points, [bucket]: points[bucket] + (xp || 0) };
    setChecklist(nextChecklist); setPoints(nextPoints);
    persist(nextChecklist, nextPoints, respPatch);
    return Promise.resolve();
  };
  const WRAP = "s1 p1 p2 p3 p4 g7 g72 g73 g74 g8";

  if (act) {
    const def = ALL_ACTS.find((a) => a.key === act);
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
      case "c1_radar": view = <MoneyRadar8 existing={resp.c1_radar} onSave={save} onExit={exit} />; break;
      case "c1_basics": view = starter("Starter: Money Words 🧱", "Never studied finance? No problem. Start here.", START_1); break;
      case "c1_rush": view = <SpeedSort title="Need or Want? Speed Rush ⚡" subtitle="Is it a NEED or a WANT? Decide fast!" buckets={RUSH_NEED.buckets} items={RUSH_NEED.items} doneTitle="Need-or-Want champion! ⚡" onSave={save} onExit={exit} />; break;
      case "c3_rush": view = <SpeedSort title="Fixed or Variable? Rush ⚡" subtitle="Does the amount stay the same every month?" buckets={RUSH_FIXED.buckets} items={RUSH_FIXED.items} doneTitle="Expense expert! ⚡" onSave={save} onExit={exit} />; break;
      case "c5_rush": view = <SpeedSort title="Receipt, Invoice or Voucher? ⚡" subtitle="Which document is it?" buckets={RUSH_DOCS.buckets} items={RUSH_DOCS.items} seconds={75} doneTitle="Document detective! 🧾" onSave={save} onExit={exit} />; break;
      case "c6_rush": view = <SpeedSort title="Revenue, Expense or Personal? ⚡" subtitle="Keep the business money and the family money separate." buckets={RUSH_BIZ.buckets} items={RUSH_BIZ.items} seconds={75} doneTitle="Clean ledger! 📒" onSave={save} onExit={exit} />; break;
      case "c7_rush": view = <SpeedSort title="Leak or Plan? Rush ⚡" subtitle="Small and frequent… or planned and necessary?" buckets={RUSH_LEAK.buckets} items={RUSH_LEAK.items} doneTitle="Leak hunter! 💧" onSave={save} onExit={exit} />; break;
      case "c9_rush": view = <SpeedSort title="Safe or Red Flag? 🚩 Rush" subtitle="Protect your money online." buckets={RUSH_SAFE.buckets} items={RUSH_SAFE.items} doneTitle="Digital shield! 🛡️" onSave={save} onExit={exit} />; break;
      case "c1_video": view = video(VID_1, "Teens and Money", VQ_1); break;
      case "c1_read": view = reading("READING · B1 · STORY", "The Missing Money", "How can someone earn money and still have nothing left?", READ_1, GLOSS_1, Q_1, "💸"); break;
      case "c1_game": view = <WhereDidItGo onSave={save} onExit={exit} />; break;
      case "c1_snapshot": view = <MoneySnapshot existing={resp.c1_snapshot} onSave={save} onExit={exit} />; break;

      case "c2_starter": view = starter("Starter: Sectors & Income 🧱", "Who makes what? Where does money come from?", START_2); break;
      case "c2_video": view = video(VID_2, "Economic Sectors", VQ_2); break;
      case "c2_read": view = reading("READING · B1 · ECONOMIC REPORT", "The Journey of a Cup of Coffee", "Does money appear when we buy — or does it travel through many hands?", READ_2, GLOSS_2, Q_2, "☕"); break;
      case "c2_city": view = <EconomicCity onSave={save} onExit={exit} />; break;
      case "c2_sort": view = <SortActivity icon={<Puzzle size={22} />} title="Sector Sort: Colombia at Work 🇨🇴" subtitle="18 real jobs. Which sector does each one belong to?" buckets={SECTOR_B} items={SECTOR_ITEMS} per={2} bonus={4} doneTitle="Sector expert! 🇨🇴" intro={<HowTo>Ask: Does it come from <b>nature</b> (primary)? Does it <b>transform</b> (secondary)? Is it a <b>service</b> (tertiary)? Does it create <b>knowledge</b> (quaternary)? Does it <b>decide</b> for many people (quinary)?</HowTo>} onSave={save} onExit={exit} />; break;
      case "c2_income": view = <IncomeMap existing={resp.c2_income} onSave={save} onExit={exit} />; break;

      case "c3_starter": view = starter("Starter: Need, Want, Fixed, Variable 🧱", "Four words that organize ALL your expenses.", START_3); break;
      case "c3_read": view = reading("READING · B1 · CHAT + DIARY", "The Weekend Sale", "If something is cheap, does that mean you need it?", READ_3, GLOSS_3, Q_3, "👟"); break;
      case "c3_detective": view = <ExpenseDetective onSave={save} onExit={exit} />; break;
      case "c3_statement": view = <MyStatement existing={resp.c3_statement} onSave={save} onExit={exit} />; break;

      case "c4_first": view = <FirstBudget onSave={save} onExit={exit} />; break;
      case "c4_video": view = video(VID_3, "The 50/30/20 Rule", VQ_3); break;
      case "c4_read": view = reading("READING · B1 · DECISION CASE", "The Budget That Broke on Tuesday", "Can a budget survive an unexpected expense?", READ_4, GLOSS_4, Q_4, "🚲"); break;
      case "c4_math": view = <NumberRounds icon={<Calculator size={22} />} title="Budget Math 🧮" subtitle="50/30/20, zero-based and percentages." rounds={BUDGET_MATH} coinsPer={3} bonus={6} doneTitle="Budget mathematician! 🧮" onSave={save} onExit={exit} />; break;
      case "c4_battle": view = <BudgetBattle existing={resp.c4_battle} onSave={save} onExit={exit} />; break;

      case "c5_docs": view = starter("Starter: Financial Documents 🧱", "The papers that prove where your money went.", START_5); break;
      case "c5_read": view = reading("READING · B1 · INVESTIGATION FILE", "The Supermarket Mystery", "What if the receipt says you paid more than you should have?", READ_5, GLOSS_5, Q_5, "🧾"); break;
      case "c5_scanner": view = <ReceiptScanner existing={resp.c5_scanner} onSave={save} onExit={exit} />; break;

      case "c6_basics": view = starter("Starter: Revenue, Profit, Loss 🧱", "The words every business owner needs.", START_6); break;
      case "c6_read": view = reading("READING · B1 · INTERVIEW + LEDGER", "The Busy Shop with No Profit", "A shop can be full of customers and still lose money. How?", READ_6, GLOSS_6, Q_6, "🫓"); break;
      case "c6_week": view = <ArepaWeek onSave={save} onExit={exit} />; break;
      case "c6_books": view = <BalanceBooks existing={resp.c6_books} onSave={save} onExit={exit} />; break;

      case "c7_starter": view = starter("Starter: Leaks & Habits 🧱", "Why small money matters.", START_7); break;
      case "c7_read": view = reading("READING · B1 · DATA INVESTIGATION", "Small Purchases, Big Surprises", "Can five thousand pesos really change your financial future?", READ_7, GLOSS_7, Q_7, "💧"); break;
      case "c7_autopsy": view = <SpendingAutopsy existing={resp.c7_autopsy} onSave={save} onExit={exit} />; break;
      case "c7_mine": view = <MyTracker existing={resp.c7_mine} onSave={save} onExit={exit} />; break;

      case "c8_starter": view = starter("Starter: Cost of Living 🧱", "Same money, different worlds.", START_8); break;
      case "c8_video": view = video(VID_4, "Living on $1,500", VQ_4); break;
      case "c8_read": view = reading("READING · B1 · DATA MAGAZINE", "Five Families, Five Budgets", "Do families with different incomes spend money in the same way?", READ_8, GLOSS_8, Q_8, "🌍"); break;
      case "c8_sim": view = <HouseholdSim existing={resp.c8_sim} onSave={save} onExit={exit} />; break;
      case "c8_city": view = <LiveOn1500 onSave={save} onExit={exit} />; break;

      case "c9_starter": view = starter("Starter: App Safety Words 🧱", "Before you download any money app.", START_9); break;
      case "c9_read": view = reading("READING · B1 · REVIEWS + PRIVACY", "The App That Wanted Too Much", "If an app helps you save money, should you automatically trust it?", READ_9, GLOSS_9, Q_9, "📱"); break;
      case "c9_lab": view = <AppLab onSave={save} onExit={exit} />; break;
      case "c9_rules": view = <SafeSetup resp={resp} existing={resp.c9_rules} onSave={save} onExit={exit} />; break;

      case "c10_boss": view = <CityBoss onSave={save} onExit={exit} />; break;
      case "c10_blueprint": view = <FinalBlueprint resp={resp} studentName={name} existing={resp.c10_blueprint} onSave={save} onExit={exit} />; break;
      case "c10_present": view = <Showcase8 onSave={save} onExit={exit} />; break;
      case "c10_quiz": view = <QuizRunner title="Boss Battle · Period 1" emoji="⚔️" questions={BOSS_8P1} pickCount={15} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />; break;
      case "c10_self": view = <SelfCheck8 existing={resp.c10_self} checklist={checklist} onSave={save} onExit={exit} />; break;
      default: view = null;
    }
    return <div className={WRAP}>{view}</div>;
  }

  if (week) {
    const w = G8P1_WEEKS.find((x) => x.n === week);
    const wDone = w.acts.filter((a) => checklist[a.key]).length;
    const next = G8P1_WEEKS[G8P1_WEEKS.indexOf(w) + 1];
    return (
      <div className={WRAP}>
        <button className="s1-back" onClick={() => setWeek(null)}><ArrowLeft size={18} strokeWidth={2.4} /> Back to Period 1</button>
        <div className="s1-hero p1-week-hero g7-hero g8-hero">
          <span className="s1-tag">{w.e} GRADE 8 · PERIOD 1 · CLASS {w.g}</span>
          <h1>{w.title}</h1>
          <p>{w.blurb}</p>
          <div className="s1-progress"><div className="bar"><i style={{ width: `${(wDone / w.acts.length) * 100}%` }} /></div><span className="pill">{wDone}/{w.acts.length}</span></div>
        </div>
        <BlueprintPanel resp={respRef.current} compact />
        <div className="s1-quest">
          {w.acts.map((a) => (
            <div key={a.key} className={`act-card ${checklist[a.key] ? "done" : ""} ${PAGE_ACTS.includes(a.key) ? "g8-page-act" : ""} ${a.title.startsWith("Starter") ? "g8-starter-act" : ""} ${a.key.endsWith("_rush") ? "g8-rush-act" : ""} ${a.key.endsWith("_read") || a.key.endsWith("_video") ? "g73-learn-act" : ""}`}>
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
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> ADMIN PREVIEW · GRADE {GRADE} · PERIOD 1</span>
        <h1>My Money Blueprint</h1>
        <p>How can a personal financial plan help us make smarter financial decisions?</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pctDone}%` }} /></div><span className="pill">{pctDone}%</span></div>
        <div className="p1-hero-chips"><span><Coins size={14} /> {coinsTotal} coins</span><span><Check size={14} /> {doneCount}/{TOTAL_ACTS} activities</span><span>🏙️ Financial City</span><span>🎯 SDG 8 · SDG 12</span></div>
      </div>
      <div className="g8-howyear"><b>🧱 New to finance?</b><span>Every class starts with a <b>Starter</b> (yellow cards): key words from zero + a quick game. Then you level up to B1 readings, videos and simulators.</span></div>
      <BlueprintPanel resp={respRef.current} studentName={name} />
      {checklist.c10_blueprint && <button type="button" className="p3-card-link" onClick={() => setAct("c10_blueprint")}><Award size={18} /> See my Money Blueprint <ChevronRight size={16} /></button>}
      <div className="p1-passport">
        <div className="p1-passport-head"><b>🏙️ Financial City Passport</b><span>Finish a class to get its stamp</span></div>
        <div className="p1-stamps">{G8P1_WEEKS.map((w) => <button key={w.n} type="button" className={`p1-stamp ${weekDone(w) ? "done" : ""}`} onClick={() => setWeek(w.n)} title={w.title}><em>{w.e}</em><small>{w.g}</small></button>)}</div>
      </div>
      <div className="p1-weeks">
        {G8P1_WEEKS.map((w) => {
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