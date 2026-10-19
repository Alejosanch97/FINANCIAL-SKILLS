import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft, BookOpen, Video, Check, X, Coins, Trophy, Sparkles, Clock, ChevronRight, Lightbulb, Play,
  PenLine, Star, Users, Lock, Store, Scale, RefreshCw, Award, Puzzle, Mic, Target, Calculator,
  ShieldCheck, Plus, Minus, Trash2, Search, Swords, Rocket, Download, Printer, ShoppingCart, Globe,
  TrendingUp, TrendingDown, Headphones, Compass, BarChart3, LineChart as LineIcon, Flame, Map as MapIcon,
  Landmark, CreditCard, Smartphone, Briefcase, PiggyBank, Wallet, QrCode, Bell, KeyRound, Mail,
  FileText, Handshake, Zap, Eye, Unlock, AlertTriangle, Fingerprint, Calendar, Gauge, Home, Umbrella,
  Snowflake, Layers, Palette, Database, Shield, Send, Leaf, Bitcoin, Crown, Newspaper, Gift, Activity, Pause,
} from "lucide-react";
import "../Styles/semana1.css";   // botones, quiz, reward, monedas (misma gamificación)
import "../Styles/periodo1.css";  // piezas del Periodo 1 (6°)
import "../Styles/periodo2.css";  // piezas del Periodo 2 (6°)
import "../Styles/periodo3.css";  // piezas del Periodo 3 (6°)
import "../Styles/periodo4.css";  // piezas del Periodo 4 (6°) · radar antes/después
import "../Styles/septimo1.css";  // 7° · Periodo 1 (gráficas, tarjetas…)
import "../Styles/septimo2.css";  // 7° · Periodo 2 (teléfono, opciones, medidores…)
import "../Styles/septimo3.css";  // 7° · Periodo 3 (plan, tablas, negocio…)
import "../Styles/septimo4.css";  // estilos nuevos de 7° · Periodo 4
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   GRADO 7 · PERIODO 4 · BUILDING MY FINANCIAL FUTURE (A2+)
   Clases 33–42 · 7 bloques. El periodo COMPENDIO: usa todo lo del año.
   Hilo del periodo: el FINANCIAL FUTURE PORTFOLIO (6 piezas + portafolio
   final). En la clase 41 se arma solo con datos de los periodos 1, 2, 3 y 4.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "7P4", Grado = "7".
   ===================================================================== */

const PERIOD_KEY = "7P4";
const GRADE = "7";

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

function WordField({ value, onChange, placeholder, min, max = 120, rows = 4 }) {
  const w = countWords(value);
  const ok = w >= min && w <= max;
  const state = w === 0 ? "" : ok ? "ok" : w > max ? "over" : "low";
  return (
    <>
      <textarea className="start-input" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      <p className={`word-count ${state}`}>
        {w} words · min {min} · max {max} {ok ? "✓" : w < min ? `— write ${min - w} more` : "— too long, trim it"}
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
      <div className="quiz-track"><i style={{ width: `${((current + (answered ? 1 : 0)) / deck.length) * 100}%` }} /></div>
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
          <span><b>{answers[current] === q.correct ? "Correct! " : "Not quite. "}</b>{q.feedback}</span>
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
  const lefts = useMemo(() => shuffleArr(pairs.map((p, i) => ({ t: p.a, i }))), [pairs]);
  const rights = useMemo(() => shuffleArr(pairs.map((p, i) => ({ t: p.b, i }))), [pairs]);
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
  const list = useMemo(() => shuffleArr(items), [items]);
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
  const cards = useMemo(() => shuffleArr(items.map((t, i) => ({ id: i, t }))), [items]);
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
  const orders = useMemo(() => rounds.map((x) => (Array.isArray(x.options) ? shuffleArr(x.options.map((_, k) => k)) : null)), [rounds]);
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
   PIEZAS QUE VIENEN DEL PERIODO 3
   ===================================================================== */
// Cuota fija de un crédito: P · r / (1 − (1 + r)^−n)
const pmt = (P, r, n) => (r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n)));
const pct = (v, d = 0) => `${Number(v).toFixed(d)}%`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));



/* ---------- MI NEGOCIO (del Periodo 3) ---------- */
const BIZ_TEMPLATES = [
  { id: "cupcake", e: "🧁", n: "Cupcake Lab", unit: "cupcake", price: 6000, varCost: 2500, fixed: 900000, units: 450,
    items: [{ l: "Professional oven", v: 1800000, must: true }, { l: "Mixer", v: 600000, must: true }, { l: "Molds and tools", v: 250000, must: true }, { l: "Packaging stock", v: 300000 }, { l: "Instagram ads", v: 200000 }, { l: "Food permit", v: 150000, must: true }] },
  { id: "cases", e: "📱", n: "Phone Case Studio", unit: "case", price: 25000, varCost: 9000, fixed: 700000, units: 90,
    items: [{ l: "Heat press machine", v: 1600000, must: true }, { l: "Initial stock of cases", v: 800000, must: true }, { l: "Online store", v: 400000 }, { l: "Ads on social media", v: 300000 }, { l: "Design software", v: 250000 }, { l: "Business registration", v: 150000, must: true }] },
  { id: "eco", e: "🌱", n: "EcoBottle", unit: "bottle", price: 30000, varCost: 14000, fixed: 600000, units: 70,
    items: [{ l: "First 100 bottles", v: 1400000, must: true }, { l: "Laser engraver", v: 1200000 }, { l: "Market stand", v: 350000, must: true }, { l: "Eco packaging", v: 200000 }, { l: "Ads + flyers", v: 250000 }, { l: "Business registration", v: 150000, must: true }] },
  { id: "gaming", e: "🎮", n: "Gaming Corner", unit: "hour", price: 5000, varCost: 1000, fixed: 1500000, units: 520,
    items: [{ l: "3 game consoles", v: 4500000, must: true }, { l: "3 TVs", v: 2700000, must: true }, { l: "Gaming chairs", v: 900000 }, { l: "Games library", v: 800000, must: true }, { l: "Snack fridge", v: 600000 }, { l: "Local permit", v: 200000, must: true }] },
  { id: "bike", e: "🚲", n: "Bike Fix Station", unit: "repair", price: 20000, varCost: 6000, fixed: 500000, units: 60,
    items: [{ l: "Professional tool kit", v: 900000, must: true }, { l: "Repair stand", v: 450000, must: true }, { l: "Spare parts stock", v: 600000, must: true }, { l: "Mobile cart", v: 700000 }, { l: "Signs and flyers", v: 120000 }, { l: "Business registration", v: 150000, must: true }] },
];
const DEFAULT_BIZ = (() => { const t = BIZ_TEMPLATES[0]; const it = t.items.filter((x) => x.must); return { tpl: t.id, e: t.e, name: "My Cupcake Lab", unit: t.unit, price: t.price, varCost: t.varCost, fixed: t.fixed, units: t.units, items: it.map((x) => x.l), equipment: it.reduce((a, x) => a + x.v, 0), capital: it.reduce((a, x) => a + x.v, 0) + t.fixed }; })();
const getBiz = (resp) => resp?.c27_startup?.biz || DEFAULT_BIZ;
const bizProfit = (b, units = b.units) => units * (b.price - b.varCost) - b.fixed;
const breakEven = (b) => (b.price > b.varCost ? Math.ceil(b.fixed / (b.price - b.varCost)) : Infinity);

/* ---------- Teléfono con color propio (app del estudiante) ---------- */
function AppPhone({ color = "#0b7a50", name = "My App", logo = "🏦", children }) {
  return (
    <div className="g72-phone g73-appphone" style={{ "--ac": color }}>
      <div className="g72-phone-status"><span>9:41</span><i /><span>📶 🔋</span></div>
      <div className="g73-app-top"><em>{logo}</em><b>{name || "My App"}</b></div>
      <div className="g72-phone-screen">{children}</div>
    </div>
  );
}

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
   MINI LESSONS DEL PERIODO 4 (lectura corta y estructurada) + QUIZ 8 de 12
   ===================================================================== */

/* ---------- LESSON 33 · Long-term planning ---------- */
const READ_L33 = [
  { sub: "Meet Camila (13) — and Camila (30)" },
  { p: "Camila closes her eyes and imagines herself at 30. She has a job she likes, her own apartment and money in the bank. Then she asks: “What do I need to do TODAY to get there?” That question is the start of long-term planning." },
  { h: "1 · What is financial independence?" },
  { p: "Financial independence means your income pays for your life: your needs, your goals and your emergencies, without depending on other people and without debts you can't pay. It does NOT mean being a millionaire. It means having choices." },
  { box: "Financial independence = my income covers my life + I have savings for surprises + I control my debts." },
  { h: "2 · Three stations: 18 · 25 · 30" },
  { node: <MiniTable head={["Age", "Typical life", "Money priority"]} rows={[["🎓 18", "University or technical studies, first part-time job", "Study costs + a small emergency fund"], ["💼 25", "First full-time salary, maybe living alone", "Emergency fund (3–6 months) + start investing"], ["🏡 30", "Bigger goals: apartment, business, family", "Down payment, business capital, long-term investing"]]} /> },
  { h: "3 · SMART goals for the long term" },
  { p: "You learned SMART goals in Period 3: Specific, Measurable, Achievable, Relevant and Time-bound. Long-term goals are SMART too — they just have more months. More months = a smaller monthly number." },
  { node: <MiniCase e="🎯" who="A SMART goal for age 18" lines={["❌ “I want a computer for university.”", "✅ “I will save $3,600,000 for a laptop in 60 months (age 13 → 18), saving $60,000 a month.”"]} /> },
  { h: "4 · The snowball budget" },
  { p: "Your income grows with age, so your savings can grow too. If you save a little at 13, more at 18 and more at 25 — and the money earns compound interest — the snowball becomes huge." },
  { node: <MiniTable head={["Stage", "Saves per month", "Money at the end (8% a year)"]} rows={[["13 → 18", "$50,000", "≈ $3.7 million"], ["18 → 25", "$200,000", "≈ $28.8 million"], ["25 → 30", "$500,000", "≈ $79.7 million"]]} foot={["Snowball", "Small → big", "Time + interest"]} /> },
  { h: "5 · DOFA (SWOT): choose your path with information" },
  { p: "A DOFA analysis — SWOT in English — helps you choose a career. Strengths and Weaknesses are INSIDE you. Opportunities and Threats are OUTSIDE, in the world." },
  { node: <MiniTable head={["Letter", "Question", "Camila's example"]} rows={[["💪 S · Strengths", "What am I good at?", "Drawing, patience, English"], ["🧩 W · Weaknesses", "What do I need to improve?", "Math, speaking in public"], ["🚀 O · Opportunities", "What is growing in the world?", "Digital design, online stores"], ["⛈️ T · Threats", "What can stop me?", "AI tools, many competitors"]]} /> },
  { h: "6 · You are your best investment" },
  { p: "Studying, learning English and building skills increase your future income. Economists call this human capital. Every course you finish is like an investment that pays you for many years." },
  { node: <Mistakes items={["Thinking “the future is far away, I'll plan later”.", "Choosing a career only because a friend chose it.", "Making goals with no amount and no date.", "Forgetting that prices go up every year (inflation)."]} /> },
];
const GLOSS_L33 = { "financial independence": "Independencia financiera.", "long-term": "Largo plazo.", "milestone": "Meta o hito importante.", "down payment": "Cuota inicial.", "human capital": "Capital humano (tus habilidades).", "SWOT": "DOFA (Debilidades, Oportunidades, Fortalezas, Amenazas)." };
const Q_L33 = [
  { q: "Financial independence means…", options: ["your income pays for your life", "you never need to work at all", "you have a million dollars"], correct: 0, feedback: "It means choices, not being rich." },
  { q: "Camila wants $3,600,000 in 60 months. She must save per month…", options: ["$60,000", "$36,000", "$600,000"], correct: 0, feedback: "3,600,000 ÷ 60." },
  { q: "At 25, a typical money priority is…", options: ["an emergency fund + investing", "a luxury car with a big loan", "spending the whole first salary"], correct: 0, feedback: "Protect first, then grow." },
  { q: "In a DOFA (SWOT), “I'm good at English” is a…", options: ["Strength", "Opportunity", "Threat"], correct: 0, feedback: "Strengths are inside you." },
  { q: "“Online stores are growing fast” is a…", options: ["Opportunity", "Strength", "Weakness inside you"], correct: 0, feedback: "Opportunities are outside, in the world." },
  { q: "“I get nervous when I speak in public” is a…", options: ["Weakness", "Threat", "Opportunity"], correct: 0, feedback: "Something inside you to improve." },
  { q: "“Many new competitors” for a business is a…", options: ["Threat", "Strength", "Weakness"], correct: 0, feedback: "An outside danger." },
  { q: "More months for the same goal means…", options: ["a smaller monthly saving", "a bigger monthly saving", "the same monthly saving"], correct: 0, feedback: "Time makes goals easier." },
  { q: "Why is the budget called a “snowball”?", options: ["savings + interest keep growing", "your money melts when it gets hot", "you can only save money in December"], correct: 0, feedback: "It gets bigger as it rolls." },
  { q: "Human capital means…", options: ["your skills and knowledge", "the money in a big bank", "the capital city of a country"], correct: 0, feedback: "Skills increase future income." },
  { q: "Which goal is SMART?", options: ["Save $6M for a down payment by 30", "Have a lot of money when I'm older", "Buy something nice in the future"], correct: 0, feedback: "Amount + date + what." },
  { q: "A common planning mistake is…", options: ["thinking “I'll plan later”", "saving a little every month", "writing goals with dates"], correct: 0, feedback: "The best time to start is today." },
];

/* ---------- LESSON 34 · Saving vs. investing ---------- */
const READ_L34 = [
  { sub: "Two ways to use the money you don't spend" },
  { p: "Tomás has $1,000,000. His cousin keeps hers in a savings pocket. His uncle buys stocks. His friend talks about crypto all day. Who is right? It depends on WHEN you need the money and HOW MUCH risk you can accept." },
  { h: "1 · Saving vs. investing" },
  { p: "Saving means keeping money safe and available, usually in a bank, with low interest. Investing means putting money to work to make it grow more — but the value can go down too." },
  { box: "Saving protects your money. Investing grows your money. Risk is the price of growth." },
  { h: "2 · The investment menu (game numbers)" },
  { node: <MiniTable head={["Tool", "Risk", "Typical return / year", "Liquidity"]} rows={[["🐷 Savings pocket", "Very low", "≈ 8%", "Any day"], ["🔒 CDT (term deposit)", "Very low", "≈ 10% fixed", "Only at the end"], ["📜 Bonds", "Low", "≈ 10%", "Medium"], ["🧺 Investment fund", "Medium", "≈ 11% (it varies)", "Some days"], ["📈 Stocks / ETF", "High", "≈ 14% (big ups and downs)", "Market days"], ["💵 Dollars", "Medium", "≈ 4% (depends on the exchange rate)", "Any day"], ["🪙 Crypto", "Very high", "−80% to +200%", "24/7"]]} /> },
  { p: "These numbers are simplified for our game. In real life returns change every year and nobody can promise them." },
  { h: "3 · Three questions before you invest" },
  { olist: ["When do I need this money? (time horizon)", "How much can it go down without hurting me? (risk)", "How fast can I get it back? (liquidity)"] },
  { node: <MiniTable head={["I need it in…", "Better option"]} rows={[["Any moment (emergencies)", "Savings pocket"], ["1 to 3 years", "CDT or bonds"], ["5+ years", "Funds and stocks (diversified)"]]} /> },
  { h: "4 · Compound interest is still the engine" },
  { node: <MiniCase e="⛄" who="$1,000,000 at 10% a year" lines={["Year 1: $1,100,000", "Year 2: $1,210,000", "Year 3: $1,331,000 — interest earns interest"]} /> },
  { h: "5 · Beat inflation" },
  { p: "If prices go up 6% a year and your money earns 4%, you are LOSING buying power. Your real return is about 4% − 6% = −2%. A good investment beats inflation over time." },
  { node: <Mistakes items={["Investing the emergency fund in crypto.", "Choosing an investment only because a friend or influencer said so.", "Believing in “guaranteed” high returns.", "Forgetting that money in a CDT is locked until the end."]} /> },
];
const GLOSS_L34 = { "investing": "Invertir.", "return": "Rentabilidad.", "liquidity": "Liquidez (qué tan rápido recuperas el dinero).", "time horizon": "Horizonte de tiempo.", "CDT": "Certificado de Depósito a Término.", "stocks": "Acciones.", "bonds": "Bonos.", "real return": "Rentabilidad real (después de inflación)." };
const Q_L34 = [
  { q: "Saving is mainly about…", options: ["keeping money safe", "making money grow fast", "taking big risks"], correct: 0, feedback: "Saving protects." },
  { q: "Higher possible return usually means…", options: ["higher risk", "lower risk", "zero risk"], correct: 0, feedback: "Risk is the price of growth." },
  { q: "Liquidity means…", options: ["how fast you can get your money", "how much interest you receive", "how many people use the bank"], correct: 0, feedback: "Fast access = liquid." },
  { q: "Money in a CDT is…", options: ["locked until the end of the term", "available any day of the month", "invested in crypto by the bank"], correct: 0, feedback: "A term deposit has a fixed term." },
  { q: "The best place for your emergency fund is…", options: ["a savings pocket", "a new crypto coin", "a single company stock"], correct: 0, feedback: "Emergencies need liquid, safe money." },
  { q: "For a goal in 10 years, a good option is…", options: ["a diversified fund", "only cash at home", "a game skin"], correct: 0, feedback: "Long horizon → you can invest." },
  { q: "$1,000,000 at 10% a year for 2 years (compound) becomes…", options: ["$1,210,000", "$1,200,000", "$1,100,000"], correct: 0, feedback: "1,000,000 × 1.1 × 1.1." },
  { q: "Return 4%, inflation 6%. Your real return is about…", options: ["−2%", "+10%", "+2%"], correct: 0, feedback: "4 − 6 = −2." },
  { q: "Which tool has the BIGGEST ups and downs?", options: ["Crypto", "CDT", "Savings pocket"], correct: 0, feedback: "Crypto is very volatile." },
  { q: "An influencer promises “30% a month, guaranteed”. It is…", options: ["a red flag", "a great deal", "a normal CDT"], correct: 0, feedback: "Nobody can guarantee high returns." },
  { q: "Stocks are…", options: ["small parts of a company", "loans you give to a friend", "insurance for your phone"], correct: 0, feedback: "You own a piece of the company." },
  { q: "A bond is…", options: ["a loan you give to a company or government", "a small piece of a company that you own", "a type of digital coin on the blockchain"], correct: 0, feedback: "They pay you interest." },
];

/* ---------- LESSON 35 · Risk & diversification + graph vocabulary ---------- */
const READ_L35 = [
  { sub: "Two cousins, one bad year" },
  { p: "Nico and Sara each invested $5,000,000. Nico put everything in ONE company: TechNova. Sara spread her money in 5 different places. Then the news arrived: “TechNova scandal — stock falls 80%”." },
  { node: <MiniTable head={["", "Nico 🎰", "Sara 🧺"]} rows={[["Strategy", "100% TechNova", "5 different investments"], ["The bad news", "−80% on everything", "−80% on only 1 of 5 parts"], ["End of the year", "$1,000,000", "$4,750,000"]]} /> },
  { h: "1 · Diversification" },
  { p: "Diversification means spreading your money across different investments: different types (CDT, funds, stocks), different sectors (food, technology, energy) and different countries. When one falls, the others can hold you up." },
  { box: "Don't put all your eggs in one basket. If the basket falls, you lose everything." },
  { h: "2 · Volatility and risk" },
  { p: "Volatility is how much a price goes up and down. A CDT is a calm lake. Crypto is a stormy ocean. Volatile investments can win a lot — and lose a lot — very fast." },
  { h: "3 · Five rules of risk management" },
  { olist: ["Emergency fund FIRST, investments second.", "Never invest money you will need soon.", "Never invest borrowed money (credit card, loans).", "Diversify: no single investment should be too big.", "Think long-term and don't panic when prices fall."] },
  { h: "4 · Review: debt and inflation" },
  { p: "A credit card can charge about 2.5% a MONTH — around 30% a year. If you have card debt, paying it is like a guaranteed 30% return. Pay expensive debt before investing. And remember: real return = return − inflation." },
  { h: "5 · How to talk about graphs" },
  { node: <MiniTable head={["Word", "Meaning", "Example"]} rows={[["📈 rise / increase", "go up", "The fund rose steadily."], ["📉 fall / drop", "go down", "Crypto dropped sharply in year 3."], ["⛰️ peak", "the highest point", "Stocks reached a peak in year 2."], ["🕳️ dip / low point", "a small fall", "There was a dip in year 4."], ["〰️ fluctuate", "go up and down", "Crypto fluctuated a lot."], ["➖ remain steady", "stay almost the same", "The CDT remained steady."], ["🔁 recover", "go back up after a fall", "The fund recovered in year 5."]]} /> },
  { p: "Use adverbs to show speed: sharply / dramatically (fast and big) vs. gradually / slightly (slow and small)." },
  { node: <Mistakes items={["Putting all your money in one stock or one coin.", "Selling everything in panic when prices fall.", "Investing with credit card money.", "Saying “the graph goes up” without numbers or years."]} /> },
];
const GLOSS_L35 = { "diversification": "Diversificación.", "volatility": "Volatilidad.", "portfolio": "Portafolio.", "sector": "Sector (tipo de industria).", "fluctuate": "Fluctuar (subir y bajar).", "peak": "Pico (punto más alto).", "recover": "Recuperarse.", "sharply": "Bruscamente." };
const Q_L35 = [
  { q: "Diversification means…", options: ["spreading money across investments", "putting all money in the best stock", "keeping all your money at home"], correct: 0, feedback: "Different types, sectors and countries." },
  { q: "Nico had 100% in TechNova. It fell 80%. From $5,000,000 he has…", options: ["$1,000,000", "$4,000,000", "$4,200,000"], correct: 0, feedback: "20% of 5,000,000." },
  { q: "Volatility is…", options: ["how much a price goes up and down", "the fixed interest rate of a CDT", "the number of company shares you own"], correct: 0, feedback: "Calm lake vs. stormy ocean." },
  { q: "What should come FIRST?", options: ["An emergency fund", "A crypto investment", "A single stock"], correct: 0, feedback: "Protect, then grow." },
  { q: "You have card debt at 30% a year. A fund pays 10%. Best move?", options: ["Pay the card first", "Invest in the fund first", "Use the card to invest"], correct: 0, feedback: "Paying expensive debt is a great “return”." },
  { q: "“Prices went up and down many times.” The best verb is…", options: ["fluctuated", "remained steady", "peaked"], correct: 0, feedback: "Fluctuate = up and down." },
  { q: "The highest point of a graph is the…", options: ["peak", "dip", "trend"], correct: 0, feedback: "Peak = top." },
  { q: "“The CDT line stays almost flat.” It…", options: ["remained steady", "dropped sharply", "fluctuated a lot"], correct: 0, feedback: "Steady = almost no change." },
  { q: "“Fell a lot, very fast” =", options: ["dropped sharply", "rose gradually", "recovered slightly"], correct: 0, feedback: "Sharply = big and fast." },
  { q: "A price falls and then goes back up. It…", options: ["recovered", "peaked", "remained steady"], correct: 0, feedback: "Recover = go back up after a fall." },
  { q: "Prices fall 20%. The smart long-term investor usually…", options: ["stays calm and keeps the plan", "sells everything in panic", "borrows money to buy crypto"], correct: 0, feedback: "Panic selling locks in the loss." },
  { q: "Return 9%, inflation 5%. Real return ≈", options: ["4%", "14%", "45%"], correct: 0, feedback: "9 − 5 = 4." },
];

/* ---------- LESSON 37 · FinTech, crypto & cybersecurity ---------- */
const READ_L37 = [
  { sub: "Your phone is a bank, a broker and a wallet" },
  { p: "FinTech means finance + technology: digital wallets, online banks, apps to invest from your phone and instant transfers with a QR code. In Colombia, millions of people pay and save with their phones. FinTech makes money faster and cheaper — but also attracts scammers." },
  { h: "1 · What is crypto?" },
  { p: "A cryptocurrency is digital money that lives on a blockchain: a giant shared record book copied on thousands of computers. Nobody can secretly change it. Bitcoin, the first one, appeared in 2009." },
  { h: "2 · Why do people find crypto interesting?" },
  { list: ["No bank in the middle: you can send money to anyone, anywhere.", "It works 24 hours a day, 7 days a week.", "Bitcoin has a limited supply: only 21 million will ever exist.", "Some people use it to learn about new technology."] },
  { h: "3 · The risks (very important)" },
  { node: <MiniTable head={["Risk", "What it means"]} rows={[["🎢 Volatility", "A coin can rise 50% or fall 70% in weeks."], ["🏛️ Not legal money", "In Colombia, crypto is not official money. The peso is."], ["🛟 No protection", "Bank deposits have deposit insurance. Crypto doesn't."], ["🔑 Lost keys", "If you lose your secret key, your coins are lost forever."], ["🎭 Scams", "Fake coins, fake apps and fake “gurus” are everywhere."]]} /> },
  { h: "4 · Famous crypto scams" },
  { node: <MiniTable head={["Scam", "How it works"]} rows={[["📣 Pump and dump", "A group makes a small coin go up with hype… then sells everything. The price crashes."], ["🧶 Rug pull", "The creators of a new token disappear with the money."], ["🔺 Pyramid / Ponzi", "Old investors are paid with new investors' money — until it collapses."], ["🎁 Giveaway scam", "“Send 1 coin and receive 2 back.” You receive nothing."]]} /> },
  { box: "Guaranteed high returns + urgency + “tell your friends” = SCAM." },
  { h: "5 · Cybersecurity: your digital shield" },
  { list: ["Strong, different passwords + two-factor authentication (2FA).", "Never share your PIN, codes or seed phrase (secret recovery words).", "Download apps only from official stores. Check the company is authorized by the Superintendencia Financiera.", "Phishing = fake messages that copy real companies. Don't click strange links."] },
  { node: <Mistakes items={["Investing money you need in a coin you don't understand.", "Trusting screenshots of “profits” on social media.", "Sharing your seed phrase with “support”.", "Using the same password for everything."]} /> },
];
const GLOSS_L37 = { "FinTech": "Tecnología financiera.", "blockchain": "Cadena de bloques (registro compartido).", "cryptocurrency": "Criptomoneda.", "seed phrase": "Frase semilla (palabras secretas de recuperación).", "phishing": "Suplantación para robar datos.", "rug pull": "Estafa en la que los creadores huyen con el dinero.", "two-factor authentication": "Verificación en dos pasos (2FA)." };
const Q_L37 = [
  { q: "FinTech means…", options: ["finance + technology", "a type of crypto coin", "a bank only for companies"], correct: 0, feedback: "Digital financial services." },
  { q: "A blockchain is…", options: ["a shared record book on many computers", "a secret bank account in another country", "a password manager on your phone"], correct: 0, feedback: "Copied on thousands of computers." },
  { q: "How many Bitcoins will ever exist?", options: ["21 million", "21 billion", "No limit"], correct: 0, feedback: "Limited supply." },
  { q: "In Colombia, crypto is…", options: ["not official money", "the official money", "protected like a bank deposit"], correct: 0, feedback: "The peso is official money." },
  { q: "If you lose your crypto secret key…", options: ["your coins can be lost forever", "the bank sends you a new one", "nothing happens at all"], correct: 0, feedback: "No key, no coins." },
  { q: "A group creates hype, the price rises, then they sell. That's a…", options: ["pump and dump", "term deposit", "dividend"], correct: 0, feedback: "Hype → sell → crash." },
  { q: "The creators of a new token disappear with the money. That's a…", options: ["rug pull", "green bond", "family budget"], correct: 0, feedback: "They “pull the rug”." },
  { q: "“Send 1 coin and get 2 back!” is…", options: ["a giveaway scam", "a real promotion", "an interest payment"], correct: 0, feedback: "You receive nothing." },
  { q: "Your seed phrase should be shared with…", options: ["nobody", "app support only", "your best friend"], correct: 0, feedback: "Real support never asks for it." },
  { q: "2FA means…", options: ["a second step to log in", "two free accounts", "two passwords that match"], correct: 0, feedback: "Password + code." },
  { q: "Phishing is…", options: ["a fake message to steal data", "a safe way to invest online", "a fishing game app for phones"], correct: 0, feedback: "Don't click strange links." },
  { q: "Which is a big red flag?", options: ["Guaranteed returns + urgency", "An app in the official store", "A company that is authorized"], correct: 0, feedback: "Nobody can guarantee high returns." },
];

/* ---------- LESSON 38 · Ethical & sustainable finance ---------- */
const READ_L38 = [
  { sub: "Your money votes" },
  { p: "Every time you buy, save or invest, your money supports someone. If you buy from a company that pollutes a river, your money helps it continue. If you invest in clean energy, your money helps it grow. Ethical finance asks: “Is my money doing good — or harm?”" },
  { h: "1 · ESG: three letters investors check" },
  { node: <MiniTable head={["Letter", "Question", "Example"]} rows={[["🌱 E · Environmental", "How does it treat the planet?", "Clean energy, less plastic, no deforestation"], ["🤝 S · Social", "How does it treat people?", "Fair salaries, safe work, no child labor"], ["⚖️ G · Governance", "Is it honest and well managed?", "Transparent reports, no corruption"]]} /> },
  { h: "2 · The 17 Sustainable Development Goals (SDGs)" },
  { p: "In 2015, the United Nations agreed on 17 goals to make the world better by 2030. In Spanish they are the ODS. Money is a powerful tool to reach them." },
  { node: <MiniTable head={["SDG", "Goal", "Finance can help by…"]} rows={[["1 🏠", "No poverty", "Microcredit for small businesses"], ["5 ⚧", "Gender equality", "Funding women entrepreneurs"], ["7 ☀️", "Clean energy", "Investing in solar and wind"], ["8 💼", "Decent work", "Companies with fair jobs"], ["12 ♻️", "Responsible consumption", "Buying less, reusing, recycling"], ["13 🌍", "Climate action", "Green bonds for clean projects"]]} /> },
  { h: "3 · Impact investing and green bonds" },
  { p: "Impact investing looks for TWO results: a financial return AND a measurable good impact. Green bonds are loans for environmental projects. In 2021, Colombia's government issued its first green bonds to fund clean projects." },
  { h: "4 · Greenwashing: when “green” is only paint" },
  { p: "Greenwashing is when a company pretends to be eco-friendly to sell more, but has no real evidence." },
  { node: <MiniTable head={["🚩 Red flag", "✅ Real evidence"]} rows={[["Vague words: “natural”, “eco”, “green”", "Numbers: “−40% CO₂ since 2020”"], ["Green leaves on the logo", "Independent certification"], ["One small good action hides a big harm", "A complete report, good and bad"], ["No data you can check", "Data you can verify"]]} /> },
  { box: "Ask for evidence: numbers, certifications and complete reports." },
  { node: <Mistakes items={["Believing a green label without evidence.", "Thinking ethical choices are only for big companies.", "Forgetting the S and the G: people and honesty matter too.", "Thinking impact means no profit."]} /> },
];
const GLOSS_L38 = { "ethical finance": "Finanzas éticas.", "ESG": "Ambiental, Social y Gobernanza.", "Sustainable Development Goals": "Objetivos de Desarrollo Sostenible (ODS).", "impact investing": "Inversión de impacto.", "green bonds": "Bonos verdes.", "greenwashing": "Lavado verde (fingir ser ecológico).", "certification": "Certificación." };
const Q_L38 = [
  { q: "ESG stands for…", options: ["Environmental, Social, Governance", "Energy, Savings, Growth, Economy", "Economy, Stocks, Gold and Dollars"], correct: 0, feedback: "Planet, people, honesty." },
  { q: "Fair salaries and safe work are part of the…", options: ["S (Social)", "E (Environmental)", "G (Governance)"], correct: 0, feedback: "How it treats people." },
  { q: "Transparent reports and no corruption are part of the…", options: ["G (Governance)", "S (Social)", "E (Environmental)"], correct: 0, feedback: "Honest management." },
  { q: "How many SDGs are there?", options: ["17", "7", "71"], correct: 0, feedback: "17 goals for 2030." },
  { q: "SDG 7 is about…", options: ["clean energy", "no poverty", "quality education"], correct: 0, feedback: "Affordable and clean energy." },
  { q: "SDG 13 is about…", options: ["climate action", "gender equality", "decent work"], correct: 0, feedback: "Fighting climate change." },
  { q: "Impact investing looks for…", options: ["return AND good impact", "only the highest return", "only donations, no return"], correct: 0, feedback: "Two results." },
  { q: "Green bonds are…", options: ["loans for environmental projects", "paper money printed in green", "coupons to buy organic food"], correct: 0, feedback: "Money for clean projects." },
  { q: "Greenwashing is…", options: ["pretending to be green", "washing money in a bank", "recycling paper at school"], correct: 0, feedback: "Green paint, no evidence." },
  { q: "Which is REAL evidence?", options: ["“−40% CO₂ since 2020, certified”", "“100% natural and eco vibes”", "A logo with green leaves"], correct: 0, feedback: "Numbers + certification." },
  { q: "A company plants 10 trees but pollutes a river every day. This is…", options: ["greenwashing", "impact investing", "good governance"], correct: 0, feedback: "A small action hides a big harm." },
  { q: "“Your money votes” means…", options: ["your purchases support companies", "you can vote in elections with dollars", "banks choose the president of a country"], correct: 0, feedback: "Where money goes, things grow." },
];

/* ---------- LESSON 39 · Growing a sustainable business ---------- */
const READ_L39 = [
  { sub: "From startup to scale-up" },
  { p: "In Period 3 you created a startup and convinced a bank. Now your business works… and customers want MORE. Growing is exciting, but many businesses die while they grow. Why? Because growth needs cash before it brings profit." },
  { h: "1 · Scaling" },
  { p: "To scale means to sell much more without costs growing at the same speed. A new machine, a second location or online sales can multiply your income — if the numbers make sense." },
  { h: "2 · Profit is not cash" },
  { p: "Cash flow is the money that really enters and leaves your account each month. A big customer may pay in 60 days, but your workers and suppliers want money today. A profitable business can go broke if it runs out of cash." },
  { box: "Rule of survival: never let your cash go below zero. Keep a cash cushion." },
  { h: "3 · How to finance growth (review)" },
  { node: <MiniTable head={["Source", "Cost", "Use it for…"]} rows={[["♻️ Reinvested profit", "Free, but slow", "Small, safe steps"], ["🏦 Bank loan", "Interest (≈1.5–2% a month)", "Machines, equipment"], ["💳 Credit card", "Very expensive (≈2.5–3% a month)", "Only tiny, short-term needs"], ["🤝 Investor", "A part of your company (equity)", "Big growth with high risk"], ["🌐 Crowdfunding", "Rewards or pre-sales", "Products with fans"], ["🏛️ Fondo Emprender (SENA)", "Seed capital with conditions", "New projects that create jobs"]]} /> },
  { h: "4 · Two numbers that decide" },
  { node: <MiniCase e="🧮" who="ROI and payback" lines={["ROI = (gain − cost) ÷ cost", "A $2,000,000 oven adds $250,000 profit a month", "Payback: 2,000,000 ÷ 250,000 = 8 months"]} /> },
  { node: <MiniCase e="🍰" who="Dilution" lines={["You own 100% of your company", "An investor gives $3,000,000 for 25%", "Now you own 75% — and the company is worth $12,000,000"]} /> },
  { h: "5 · Leadership: people, planet, profit" },
  { p: "A good leader shares the vision, delegates tasks, pays fair salaries, listens to the team and makes ethical decisions. Sustainable businesses care about three P's: People, Planet and Profit." },
  { node: <Mistakes items={["Growing too fast with expensive debt.", "Using a credit card to buy machines.", "Giving away too much of your company too early.", "Forgetting the team: tired people make mistakes."]} /> },
];
const GLOSS_L39 = { "scale": "Escalar (crecer mucho).", "cash flow": "Flujo de caja.", "reinvest": "Reinvertir.", "ROI": "Retorno sobre la inversión.", "payback": "Tiempo de recuperación.", "dilution": "Dilución (tener un % menor de la empresa).", "delegate": "Delegar." };
const Q_L39 = [
  { q: "To scale a business means…", options: ["sell more without costs growing as fast", "close the business for a few months to rest", "raise all your prices every single week"], correct: 0, feedback: "Grow income faster than costs." },
  { q: "Cash flow is…", options: ["money that really enters and leaves", "the profit you expect next year", "the value of your brand"], correct: 0, feedback: "Real money, real dates." },
  { q: "A profitable business can go broke if…", options: ["it runs out of cash", "it has too many customers", "it pays its taxes"], correct: 0, feedback: "Cash below zero = trouble." },
  { q: "The cheapest way to finance growth is…", options: ["reinvested profit", "a credit card with high interest", "a quick payday loan"], correct: 0, feedback: "No interest, no equity." },
  { q: "To buy a $5,000,000 machine, the best option is usually…", options: ["a bank loan", "a credit card", "a pyramid scheme"], correct: 0, feedback: "Cards are too expensive for machines." },
  { q: "An investor usually wants…", options: ["a part of your company", "a fixed monthly salary", "your personal phone"], correct: 0, feedback: "Equity." },
  { q: "An oven costs $2,000,000 and adds $250,000 profit a month. Payback?", options: ["8 months", "4 months", "12 months"], correct: 0, feedback: "2,000,000 ÷ 250,000." },
  { q: "You give 25% to an investor. You now own…", options: ["75%", "25%", "100%"], correct: 0, feedback: "100 − 25." },
  { q: "An investor pays $3,000,000 for 25%. The company is worth…", options: ["$12,000,000", "$3,000,000", "$7,500,000"], correct: 0, feedback: "3,000,000 ÷ 0.25." },
  { q: "The three P's of a sustainable business are…", options: ["People, Planet, Profit", "Price, Product, Place", "Pay, Push, Promote"], correct: 0, feedback: "Triple bottom line." },
  { q: "A good leader…", options: ["delegates and listens", "does every task alone", "never explains the plan"], correct: 0, feedback: "Teams grow businesses." },
  { q: "A big client will pay in 60 days. You should…", options: ["keep a cash cushion", "spend all your cash now", "close the business"], correct: 0, feedback: "Protect your cash flow." },
];

/* =====================================================================
   ROUNDS (problemas con visual) DEL PERIODO 4
   ===================================================================== */
const FUTURE_ROUNDS = [
  { tag: "1 · A GOAL FOR 18", q: "You are 13. You want a $3,600,000 laptop for university at 18 (60 months). How much per month?", visual: <MiniCase e="💻" who="Goal at 18" lines={["Laptop: $3,600,000", "Time: 5 years = 60 months"]} />, answer: 60000, money: true, hint: "Amount ÷ months", explain: "$60,000 a month." },
  { tag: "2 · EMERGENCY FUND AT 25", q: "At 25 your needs cost $2,000,000 a month. What is a 3-month emergency fund?", visual: <MiniCase e="🛟" who="Life at 25" lines={["Needs: $2,000,000 a month", "Goal: 3 months"]} />, answer: 6000000, money: true, hint: "2,000,000 × 3", explain: "$6,000,000." },
  { tag: "3 · FIRST SALARY", q: "Your first salary is $2,400,000. You save 20% (pay yourself first). How much do you save?", visual: <MiniCase e="💼" who="Salary at 25" lines={["Salary: $2,400,000", "Save first: 20%"]} />, answer: 480000, money: true, hint: "2,400,000 × 0.20", explain: "$480,000 every month." },
  { tag: "4 · SMART OR NOT?", q: "Which long-term goal is SMART?", options: ["Save $9,000,000 for a down payment by age 30, saving $150,000 a month", "Have my own apartment someday when I am older and have a good job", "Save as much money as possible for a big house in the future, maybe"], correct: 0, explain: "It has what, how much, how and when." },
  { tag: "5 · DOFA", q: "Laura says: “I'm very good at solving problems with code.” In her DOFA, this is a…", visual: <MiniCase e="👩‍💻" who="Laura, 14" lines={["Loves programming", "Wins the school robotics fair"]} />, options: ["Strength", "Opportunity", "Threat", "Weakness"], correct: 0, explain: "It's inside her: a strength." },
  { tag: "6 · DOFA", q: "“Colombia needs many software developers.” In Laura's DOFA, this is an…", options: ["Opportunity", "Strength", "Weakness", "A personal threat"], correct: 0, explain: "It's outside, in the world: an opportunity." },
  { tag: "7 · SNOWBALL", q: "$1,000,000 earns 10% a year (compound) for 2 years. How much do you have?", visual: <MiniTable head={["Year", "Money"]} rows={[["0", "$1,000,000"], ["1", "$1,100,000"], ["2", "?"]]} />, answer: 1210000, money: true, hint: "1,100,000 × 1.10", explain: "$1,210,000 — interest on interest." },
  { tag: "8 · INFLATION", q: "Rent is $800,000 and prices go up 5% a year. What is the rent next year?", visual: <MiniCase e="🏠" who="Rent at 25" lines={["Today: $800,000", "Inflation: 5% a year"]} />, answer: 840000, money: true, hint: "800,000 × 1.05", explain: "$840,000. Plan for higher prices!" },
];

const DEBT_ROUNDS = [
  { tag: "1 · REAL RETURN", q: "A fund earned 11% and inflation was 5%. What is the real return (approx.)?", visual: <MiniCase e="📈" who="Fund vs. prices" lines={["Fund: +11%", "Inflation: +5%"]} />, answer: 6, unit: "%", hint: "Return − inflation", explain: "About 6% real growth." },
  { tag: "2 · REAL RETURN", q: "A savings account pays 4% and inflation is 6%. Real return?", visual: <MiniCase e="🐷" who="Savings vs. prices" lines={["Savings: +4%", "Inflation: +6%"]} />, answer: -2, unit: "%", hint: "4 − 6 (it can be negative!)", explain: "−2%: you lose buying power." },
  { tag: "3 · INVEST OR PAY DEBT?", q: "Juan has $1,000,000 of card debt at 2.5% a month (≈30% a year). A fund pays 10% a year. What should he do with his $1,000,000?", options: ["Pay the card debt first", "Invest in the fund and keep the debt", "Use the card to buy crypto"], correct: 0, explain: "Paying a 30% debt is better than earning 10%." },
  { tag: "4 · A PORTFOLIO", q: "A $10,000,000 portfolio: 50% CDT, 30% fund, 20% stocks. How much is in stocks?", visual: <StackBar parts={[{ label: "CDT", value: 5000000, color: "#0b7a50" }, { label: "Fund", value: 3000000, color: "#16b074" }, { label: "Stocks", value: 2000000, color: "#f5b23e" }]} />, answer: 2000000, money: true, hint: "10,000,000 × 0.20", explain: "$2,000,000." },
  { tag: "5 · A BAD YEAR", q: "Stocks fall 20%. The $2,000,000 in stocks becomes…", answer: 1600000, money: true, hint: "2,000,000 × 0.80", explain: "$1,600,000." },
  { tag: "6 · DIVERSIFICATION WORKS", q: "Same year: CDT +10% ($5,000,000 → $5,500,000), fund +5% ($3,000,000 → $3,150,000), stocks −20% ($1,600,000). Total portfolio?", visual: <MiniTable head={["Part", "End of year"]} rows={[["CDT", "$5,500,000"], ["Fund", "$3,150,000"], ["Stocks", "$1,600,000"]]} foot={["Total", "?"]} />, answer: 10250000, money: true, hint: "Add the three parts", explain: "$10,250,000 — the portfolio still grew!" },
  { tag: "7 · ALL IN ONE", q: "Nico put $10,000,000 in ONE stock. It fell 60%. How much does he have?", answer: 4000000, money: true, hint: "10,000,000 × 0.40", explain: "$4,000,000. One basket, big loss." },
  { tag: "8 · THE RECOVERY TRAP", q: "An investment falls 50% (from $100 to $50). What % must it rise to get back to $100?", visual: <BarChart bars={[{ label: "Start", value: 100, color: "#16b074" }, { label: "After −50%", value: 50, color: "#ff6b57" }, { label: "Back?", value: 100, color: "#f5b23e" }]} money={false} height={170} />, answer: 100, unit: "%", hint: "From 50 to 100 is double…", explain: "+100%! Big losses are very hard to recover." },
];

const GROWTH_ROUNDS = [
  { tag: "1 · MONTHLY PROFIT", q: "Price $7,000, cost per unit $3,000, 600 units a month, fixed costs $1,200,000. Monthly profit?", visual: <MiniTable head={["Item", "Value"]} rows={[["Profit per unit", "$7,000 − $3,000"], ["Units", "600"], ["Fixed costs", "$1,200,000"]]} />, answer: 1200000, money: true, hint: "4,000 × 600 − 1,200,000", explain: "$1,200,000 a month." },
  { tag: "2 · BANK LOAN", q: "A $6,000,000 loan at 2% a month for 12 months has an installment of $567,358. How much do you pay in TOTAL?", answer: 6808296, tol: 60, money: true, hint: "567,358 × 12", explain: "≈ $6,808,296 — about $808,000 of interest." },
  { tag: "3 · VALUATION", q: "An investor offers $3,000,000 for 25% of your company. How much is the whole company worth?", answer: 12000000, money: true, hint: "3,000,000 ÷ 0.25", explain: "$12,000,000." },
  { tag: "4 · DILUTION", q: "You own 100%. You give 25% to the investor and later 10% (of the total) to a crowdfunding group. What % do you own?", answer: 65, unit: "%", hint: "100 − 25 − 10", explain: "65% — you still control the company." },
  { tag: "5 · PAYBACK", q: "A new machine costs $2,400,000 and adds $300,000 profit a month. How many months to pay it back?", answer: 8, unit: "months", hint: "2,400,000 ÷ 300,000", explain: "8 months. After that, it's pure gain." },
  { tag: "6 · ROI", q: "You spend $1,000,000 on ads and get $1,400,000 extra profit. What is the ROI?", answer: 40, unit: "%", hint: "(1,400,000 − 1,000,000) ÷ 1,000,000", explain: "40% return on the investment." },
  { tag: "7 · CARD OR BANK?", q: "You need $5,000,000 for an oven. Bank: 1.6% a month. Credit card: 2.9% a month. What do you choose?", options: ["The bank loan", "The credit card", "Half and half"], correct: 0, explain: "Credit cards are too expensive for big, long-term purchases." },
  { tag: "8 · CASH FLOW", q: "A supermarket orders $8,000,000 of products but will pay in 60 days. You have $1,000,000 in cash and need $5,000,000 to produce. What is the smart move?", options: ["Negotiate a 30% advance payment first", "Accept and hope your cash is enough", "Pay suppliers with your credit card limit"], correct: 0, explain: "An advance protects your cash flow." },
];

/* =====================================================================
   FINANCIAL FUTURE PORTFOLIO · 6 piezas + portafolio final
   ===================================================================== */
const PORT_PIECES = [
  { n: "01", key: "c33_route", t: "My life route", e: "🛣️" },
  { n: "02", key: "c34_lab", t: "Saving vs. investing", e: "🧪" },
  { n: "03", key: "c35_strategy", t: "My risk strategy", e: "🛡️" },
  { n: "04", key: "c37_rules", t: "Safe digital tools", e: "🔐" },
  { n: "05", key: "c38_pledge", t: "Global commitment", e: "🌍" },
  { n: "06", key: "c39_scale", t: "Entrepreneur project", e: "🚀" },
];
function PortfolioPanel({ resp, compact, studentName }) {
  const r = resp || {};
  const done = PORT_PIECES.filter((p) => r[p.key]).length;
  return (
    <div className={`g74-port ${compact ? "compact" : ""}`}>
      <div className="g74-port-head">
        <b>🗂️ Financial Future Portfolio{studentName && !compact ? ` · ${studentName.split(" ")[0]}` : ""}</b>
        <span>{done}/6 pieces{r.c41_portfolio ? " · 🏆 complete" : ""}</span>
      </div>
      <div className="g74-pieces">
        {PORT_PIECES.map((p) => (
          <div key={p.n} className={`g74-piece ${r[p.key] ? "done" : ""}`}>
            <small>{p.n}</small><em>{r[p.key] ? p.e : "🧩"}</em><span>{p.t}</span>
          </div>
        ))}
        <div className={`g74-piece final ${r.c41_portfolio ? "done" : ""}`}><small>★</small><em>{r.c41_portfolio ? "🏆" : "🔒"}</em><span>Complete portfolio</span></div>
      </div>
    </div>
  );
}
function PieceBadge({ n }) {
  const p = PORT_PIECES.find((x) => x.n === n);
  return <div className="g74-piecebadge"><span>🗂️ PORTFOLIO PIECE {p.n}</span><b>{p.e} {p.t}</b></div>;
}

/* =====================================================================
   BLOQUE 1 · CLASE 33 · LONG-TERM PLANNING
   ===================================================================== */
const SWOT_Q = [
  { k: "s", l: "Strengths", sp: "Fortalezas", e: "💪", in: true, q: "What am I good at?", chips: [["math", "I'm good at math"], ["art", "I'm creative / I draw"], ["help", "I like helping people"], ["tech", "I'm good with technology"], ["eng", "I speak English well"], ["lead", "I'm a natural leader"], ["sport", "I'm good at sports"], ["patient", "I'm patient and organized"], ["sell", "I'm good at selling"], ["nature", "I love nature and science"]] },
  { k: "w", l: "Weaknesses", sp: "Debilidades", e: "🧩", in: true, q: "What do I need to improve?", chips: [["dist", "I get distracted easily"], ["shy", "I'm shy in public"], ["mathw", "Math is hard for me"], ["late", "I leave things for later"], ["spend", "I spend money fast"], ["engw", "My English needs practice"], ["team", "Teamwork is hard for me"]] },
  { k: "o", l: "Opportunities", sp: "Oportunidades", e: "🚀", in: false, q: "What is growing in the world?", chips: [["dig", "Digital jobs are growing"], ["glob", "English opens global jobs"], ["green", "The world needs clean energy"], ["tour", "Tourism in Colombia is growing"], ["shops", "Online stores are everywhere"], ["schol", "Scholarships and student credit"], ["health", "Health jobs are needed"]] },
  { k: "t", l: "Threats", sp: "Amenazas", e: "⛈️", in: false, q: "What could stop me?", chips: [["ai", "AI can do simple tasks"], ["cost", "University is expensive"], ["comp", "Many competitors"], ["infl", "Prices go up (inflation)"], ["few", "Few jobs in my city"], ["fake", "Fake “get rich fast” promises"]] },
];
const CAREERS = [
  { id: "dev", e: "💻", n: "Software developer", tags: ["math", "tech"], study: 4, s25: 3500000, s30: 6500000 },
  { id: "ux", e: "🎨", n: "Graphic / UX designer", tags: ["art", "tech"], study: 4, s25: 2600000, s30: 4800000 },
  { id: "health", e: "🩺", n: "Health professional", tags: ["help", "patient", "nature"], study: 5, s25: 2800000, s30: 5500000 },
  { id: "teach", e: "📚", n: "Teacher", tags: ["help", "eng", "lead"], study: 4, s25: 2400000, s30: 3800000 },
  { id: "entre", e: "🚀", n: "Entrepreneur", tags: ["sell", "lead", "art"], study: 3, s25: 1800000, s30: 7000000, note: "very variable" },
  { id: "energy", e: "☀️", n: "Renewable energy engineer", tags: ["nature", "math", "tech"], study: 5, s25: 3200000, s30: 6000000 },
  { id: "chef", e: "🍳", n: "Chef / food business", tags: ["art", "patient", "sell"], study: 2, s25: 1900000, s30: 3500000 },
  { id: "tour", e: "🧭", n: "Bilingual tourism guide", tags: ["eng", "nature", "help"], study: 2, s25: 2000000, s30: 3600000 },
  { id: "fin", e: "📊", n: "Financial analyst", tags: ["math", "patient"], study: 5, s25: 2900000, s30: 5200000 },
  { id: "coach", e: "🏃", n: "Sports coach / physio", tags: ["sport", "help", "lead"], study: 4, s25: 2200000, s30: 3800000 },
  { id: "mkt", e: "📱", n: "Digital marketer", tags: ["sell", "tech", "art"], study: 3, s25: 2500000, s30: 4700000 },
];
const DEFAULT_CAREER = CAREERS[1];
const getCareer = (resp) => resp?.c33_swot?.career || DEFAULT_CAREER;

function SwotLab({ existing, onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [pick, setPick] = useState(existing?.picks || { s: [], w: [], o: [], t: [] });
  const [own, setOwn] = useState(existing?.own || { s: "", w: "", o: "", t: "" });
  const [career, setCareer] = useState(existing?.career?.id || null);
  const [txt, setTxt] = useState(existing?.sentences || { a: "", b: "", c: "" });
  const [st, finish] = useFinish(onSave);
  const toggle = (k, id) => setPick({ ...pick, [k]: pick[k].includes(id) ? pick[k].filter((x) => x !== id) : [...pick[k], id] });
  const count = (k) => pick[k].length + (countWords(own[k]) >= 2 ? 1 : 0);
  const swotOk = SWOT_Q.every((q) => count(q.k) >= 2);
  const ranked = useMemo(() => CAREERS.map((c) => ({ ...c, fit: c.tags.filter((t) => pick.s.includes(t)).length + (c.tags.includes("eng") && pick.o.includes("glob") ? 0.5 : 0) + (c.tags.includes("tech") && pick.o.includes("dig") ? 0.5 : 0) + (c.id === "energy" && pick.o.includes("green") ? 1 : 0) + (c.id === "tour" && pick.o.includes("tour") ? 1 : 0) + (c.id === "health" && pick.o.includes("health") ? 1 : 0) })).sort((a, b) => b.fit - a.fit), [pick]);
  const chosen = CAREERS.find((c) => c.id === career);
  const lbl = (q, id) => q.chips.find((c) => c[0] === id)?.[1];
  const FR = [{ k: "a", f: "My biggest strength is" }, { k: "b", f: "To improve my weakness, I will" }, { k: "c", f: `I would like to be a ${chosen ? chosen.n.toLowerCase() : "…"} because` }];
  const ready = chosen && FR.every((f) => countWords(txt[f.k]) >= 4);
  if (st.done) return <Reward title="Your DOFA is ready! 🧭" subtitle="Now you know where you are — and where you can go." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Compass size={22} strokeWidth={2.1} />} title="Future Me · DOFA Lab 🧭" subtitle="Explore yourself and the world. Then find careers that fit you." onExit={onExit}>
      <div className="g72-steps">{["1 · My DOFA", "2 · Career match", "3 · My path"].map((s, i) => <span key={s} className={stage === i ? "on" : stage > i ? "done" : ""}>{s}</span>)}</div>
      {stage === 0 && (
        <>
          <HowTo>Tap <i>at least 2 ideas</i> in each box (or write your own). <b>S</b> and <b>W</b> are <i>inside you</i>. <b>O</b> and <b>T</b> are <i>outside, in the world</i>.</HowTo>
          <div className="g74-swot">
            {SWOT_Q.map((q) => (
              <div key={q.k} className={`g74-swot-box ${q.k} ${count(q.k) >= 2 ? "ok" : ""}`}>
                <header><em>{q.e}</em><div><b>{q.l}</b><small>{q.sp} · {q.in ? "inside me" : "outside"} · {q.q}</small></div><span>{count(q.k)}/2+</span></header>
                <div className="g74-chips">{q.chips.map(([id, l]) => <button key={id} type="button" className={pick[q.k].includes(id) ? "on" : ""} onClick={() => toggle(q.k, id)}>{l}</button>)}</div>
                <input className="start-input" value={own[q.k]} onChange={(e) => setOwn({ ...own, [q.k]: e.target.value })} placeholder="Or write your own idea…" />
              </div>
            ))}
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!swotOk} onClick={() => setStage(1)}>{swotOk ? "Find my career matches" : "Complete the 4 boxes"} <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 1 && (
        <>
          <HowTo>The cards are ordered by <i>how well they match your strengths</i>. Tap one to see the numbers. Choose the path you like most — it's not forever, it's a plan!</HowTo>
          <div className="g74-careers">
            {ranked.map((c, i) => (
              <button key={c.id} type="button" className={`g74-career ${career === c.id ? "on" : ""}`} onClick={() => setCareer(c.id)}>
                {i < 3 && c.fit > 0 && <i className="g74-match">⭐ Top match</i>}
                <em>{c.e}</em><b>{c.n}</b>
                <div className="g74-fit">{[0, 1, 2, 3].map((k) => <span key={k} className={k < Math.round(c.fit) ? "on" : ""} />)}</div>
                <small>📚 {c.study} years of study</small>
                <small>💼 At 25: <b>{cop(c.s25)}</b>/month</small>
                <small>📈 At 30: <b>{cop(c.s30)}</b>/month{c.note ? ` (${c.note})` : ""}</small>
              </button>
            ))}
          </div>
          <p className="start-tip p1-center">Game numbers: approximate salaries to practice planning.</p>
          <div className="start-foot"><button className="s1-btn ghost" onClick={() => setStage(0)}>Back</button><button className="s1-btn primary big" disabled={!career} onClick={() => setStage(2)}>Write my path <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 2 && chosen && (
        <>
          <div className="g74-swot-sum">
            {SWOT_Q.map((q) => <div key={q.k} className={q.k}><b>{q.e} {q.l}</b>{pick[q.k].map((id) => <span key={id}>{lbl(q, id)}</span>)}{countWords(own[q.k]) >= 2 && <span>{own[q.k]}</span>}</div>)}
          </div>
          <div className="g74-chosen"><em>{chosen.e}</em><div><b>{chosen.n}</b><small>{chosen.study} years of study · {cop(chosen.s25)} at 25 · {cop(chosen.s30)} at 30</small></div></div>
          <div className="start-block">
            <h3><PenLine size={18} /> My path (min 4 words each)</h3>
            {FR.map((f) => <div key={f.k} className="p3-sentence edit"><span>{f.f}</span><input className="start-input" value={txt[f.k]} onChange={(e) => setTxt({ ...txt, [f.k]: e.target.value })} placeholder="Write your answer here…" /></div>)}
          </div>
          <div className="start-foot"><button className="s1-btn ghost" onClick={() => setStage(1)}>Back</button><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { picks: pick, own, career: { id: chosen.id, n: chosen.n, e: chosen.e, s25: chosen.s25, s30: chosen.s30, study: chosen.study }, sentences: txt })}>Save my DOFA <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- LIFE ROADMAP BUILDER (Pieza 01) ---------- */
const MILESTONES = {
  18: [["laptop", "💻", "Laptop for university", 3600000], ["sem", "🎓", "First semester", 4500000], ["moto", "🛵", "A motorbike", 6000000], ["trip", "✈️", "Graduation trip", 2500000], ["eng", "🗣️", "English course abroad", 5000000], ["fund", "🛟", "My first emergency fund", 1500000]],
  25: [["fund6", "🛟", "Emergency fund (6 months)", 9000000], ["master", "🎓", "Specialization / master's", 15000000], ["car", "🚗", "A used car", 30000000], ["abroad", "🌎", "Trip abroad", 8000000], ["biz", "🚀", "Start my business", 12000000], ["move", "🏠", "Move out (deposit + furniture)", 5000000]],
  30: [["home", "🏡", "Apartment down payment", 40000000], ["grow", "📈", "Grow my business", 25000000], ["family", "👨‍👩‍👧", "Family fund", 15000000], ["invest", "💼", "Investment portfolio", 30000000], ["year", "🌍", "A year living abroad", 20000000]],
};
const AGES_RT = [18, 25, 30];
// Saldo mes a mes desde los 13 hasta los 30, retirando cada meta en su edad
function roadmapSim(plan, goals) {
  const st = [[13, 18, plan.inc1, plan.s1], [18, 25, plan.inc2, plan.s2], [25, 30, plan.inc3, plan.s3]];
  let v = 0; const byAge = { 13: 0 }; const res = {};
  st.forEach(([a, b, inc, s]) => {
    const m = (inc * s) / 100;
    for (let i = 0; i < (b - a) * 12; i++) { v = v * (1 + plan.rate / 100 / 12) + m; if ((i + 1) % 12 === 0) byAge[a + (i + 1) / 12] = Math.round(v); }
    const g = goals[b];
    if (g) { res[b] = { before: Math.round(v), ok: v >= g.amount, short: Math.max(0, Math.round(g.amount - v)) }; v = Math.max(0, v - g.amount); byAge[b] = Math.round(v); }
  });
  return { byAge, res, final: Math.round(v) };
}
function LifeRoadmap({ resp, existing, onSave, onExit }) {
  const career = getCareer(resp);
  const p3goals = resp?.__p3?.c23_smart?.goals || [];
  const [stage, setStage] = useState(0);
  const [tab, setTab] = useState(18);
  const [goals, setGoals] = useState(existing?.goals || {});
  const [plan, setPlan] = useState(existing?.plan || { inc1: 150000, s1: 20, inc2: Math.round(career.s25 * 0.45 / 50000) * 50000, s2: 15, inc3: career.s25, s3: 20, rate: 8 });
  const [why, setWhy] = useState(existing?.why || { 18: "", 25: "", 30: "" });
  const [st, finish] = useFinish(onSave);
  const setG = (age, m) => setGoals({ ...goals, [age]: { id: m[0], e: m[1], l: m[2], amount: m[3] } });
  const sim = roadmapSim(plan, goals);
  const allGoals = AGES_RT.every((a) => goals[a]);
  const allOk = allGoals && AGES_RT.every((a) => sim.res[a]?.ok);
  const P = (k) => (v) => setPlan({ ...plan, [k]: v });
  const monthly = [plan.inc1 * plan.s1 / 100, plan.inc2 * plan.s2 / 100, plan.inc3 * plan.s3 / 100];
  const smart = (a) => { const g = goals[a]; if (!g) return ""; const months = (a - (a === 18 ? 13 : a === 25 ? 18 : 25)) * 12; return `I will save ${cop(g.amount)} for ${g.l.toLowerCase()} by age ${a} (${months} months), saving about ${cop(Math.ceil(g.amount / months / 1000) * 1000)} a month.`; };
  const ages = Array.from({ length: 18 }, (_, i) => 13 + i);
  const ready = allOk && AGES_RT.every((a) => countWords(why[a]) >= 3);
  if (st.done) return <Reward title="Your Life Roadmap is ready! 🛣️" subtitle="Piece 01 of your Financial Future Portfolio." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<MapIcon size={22} strokeWidth={2.1} />} title="Life Roadmap Builder 🛣️" subtitle="Three stations: 18 · 25 · 30. Choose your goals and build the snowball that pays for them." onExit={onExit}>
      <PieceBadge n="01" />
      <div className="g72-steps">{["1 · My goals", "2 · Snowball budget", "3 · SMART route"].map((s, i) => <span key={s} className={stage === i ? "on" : stage > i ? "done" : ""}>{s}</span>)}</div>
      {stage === 0 && (
        <>
          <HowTo>Choose <i>one big goal</i> for each station. You can change the amount. Your career from the DOFA Lab: <b>{career.e} {career.n}</b>.</HowTo>
          {p3goals.length > 0 && <div className="g74-remind"><b>📒 Your SMART goals from Period 3:</b>{p3goals.map((g, k) => <span key={k}>🎯 {g.what} · {cop(g.amount)}</span>)}</div>}
          <div className="g74-road">
            {AGES_RT.map((a) => <button key={a} type="button" className={`g74-station ${tab === a ? "on" : ""} ${goals[a] ? "ok" : ""}`} onClick={() => setTab(a)}><small>STATION</small><b>{a}</b><em>{goals[a]?.e || "❔"}</em></button>)}
          </div>
          <div className="g72-opts">
            {MILESTONES[tab].map((m) => <button key={m[0]} type="button" className={`g72-opt ${goals[tab]?.id === m[0] ? "on" : ""}`} onClick={() => setG(tab, m)}><em>{m[1]}</em><span>{m[2]}<br /><small>{cop(m[3])}</small></span></button>)}
          </div>
          {goals[tab] && <div className="g74-amount"><span>{goals[tab].e} Amount for age {tab}:</span><MoneyInput value={goals[tab].amount} onChange={(v) => setGoals({ ...goals, [tab]: { ...goals[tab], amount: num(v) } })} /></div>}
          <div className="start-foot">
            {tab !== 30 && goals[tab] && <button className="s1-btn ghost" onClick={() => setTab(tab === 18 ? 25 : 30)}>Next station <ChevronRight size={16} /></button>}
            <button className="s1-btn primary big" disabled={!allGoals} onClick={() => setStage(1)}>{allGoals ? "Build my snowball budget" : `${AGES_RT.filter((a) => goals[a]).length}/3 goals`} <ChevronRight size={18} /></button>
          </div>
        </>
      )}
      {stage === 1 && (
        <>
          <HowTo>Move the sliders: your <i>income</i> and the <i>% you save</i> in each stage of life. At 18, 25 and 30 you <b>use</b> the money for your goal. Mission: <b>all 3 stations green ✅</b>. Tip: saving a little EARLY helps a lot.</HowTo>
          <div className="g74-stages">
            {[["🎒 13 → 18", "Allowance + small jobs", "inc1", "s1", 50000, 600000, 25000], ["🎓 18 → 25", "Study + part-time job", "inc2", "s2", 400000, 3000000, 50000], [`${career.e} 25 → 30`, `${career.n}`, "inc3", "s3", 1000000, 8000000, 100000]].map(([t, d, ki, ks, mn, mx, stp], k) => (
              <div key={ki} className="g74-stage">
                <header><b>{t}</b><small>{d}</small><span>Saves {cop(monthly[k])}/month</span></header>
                {Ctl({ l: "💰 Income / month", v: plan[ki], set: P(ki), mn, mx, stp, fmt: cop })}
                {Ctl({ l: "🐷 % I save", v: plan[ks], set: P(ks), mn: 0, mx: 60, stp: 5, fmt: (x) => `${x}%` })}
              </div>
            ))}
            <div className="g73-toggle2">{[[8, "🐷 Savings pocket · 8%"], [11, "🧺 Diversified fund · 11%"]].map(([r, l]) => <button key={r} type="button" className={plan.rate === r ? "on" : ""} onClick={() => setPlan({ ...plan, rate: r })}>{l}</button>)}</div>
          </div>
          <div className="g74-checks3">
            {AGES_RT.map((a) => { const r = sim.res[a]; return (
              <div key={a} className={r?.ok ? "ok" : "no"}><em>{goals[a].e}</em><b>Age {a} · {goals[a].l}</b><small>Goal {cop(goals[a].amount)} · I'll have {cop(r?.before || 0)}</small><span>{r?.ok ? "✅ Reached!" : `❌ Short by ${cop(r?.short || 0)}`}</span></div>
            ); })}
          </div>
          <LineChart labels={ages.filter((a) => a % 2 === 1 || AGES_RT.includes(a)).map(String)} series={[{ name: "My savings", values: ages.filter((a) => a % 2 === 1 || AGES_RT.includes(a)).map((a) => sim.byAge[a] ?? null), color: "#16b074" }]} />
          <p className="start-tip p1-center">📉 The line drops at 18, 25 and 30 because you <b>use</b> the money for your goals. Money left at 30: <b>{cop(sim.final)}</b>.</p>
          <div className="start-foot"><button className="s1-btn ghost" onClick={() => setStage(0)}>Change goals</button><button className="s1-btn primary big" disabled={!allOk} onClick={() => setStage(2)}>{allOk ? "Write my SMART route" : "Make all 3 stations ✅"} <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 2 && (
        <>
          <div className="g74-route">
            {AGES_RT.map((a) => (
              <div key={a} className="g74-route-stop">
                <span className="g74-route-age">{a}</span>
                <div>
                  <b>{goals[a].e} {goals[a].l}</b>
                  <p className="g74-smart">🎯 {smart(a)}</p>
                  <div className="p3-sentence edit"><span>This matters to me because</span><input className="start-input" value={why[a]} onChange={(e) => setWhy({ ...why, [a]: e.target.value })} placeholder="Write your answer here…" /></div>
                </div>
              </div>
            ))}
          </div>
          <div className="start-foot"><button className="s1-btn ghost" onClick={() => setStage(1)}>Back</button><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(40, { goals, plan, why, monthly, final: sim.final, byAge: sim.byAge, smart: AGES_RT.map(smart) })}>Save Piece 01 <span className="coin-tag"><Coins size={15} /> +40</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   BLOQUE 2 · CLASE 34 · SAVING VS. INVESTING
   ===================================================================== */
// Números de juego (simplificados): r = rentabilidad típica anual, vol = cuánto sube y baja
const TOOLS = [
  { id: "pocket", e: "🐷", n: "Savings pocket", r: 8, vol: 0, risk: 1, liq: "Any day", d: "A digital pocket in your bank or wallet app. Safe and always available." },
  { id: "cdt", e: "🔒", n: "CDT · 12 months", r: 10, vol: 0, risk: 1, liq: "Only at the end", d: "A term deposit: the bank pays a FIXED rate, but your money is locked." },
  { id: "bonds", e: "📜", n: "Bonds", r: 10, vol: 4, risk: 2, liq: "Medium", d: "You lend money to a government or company. It pays you interest." },
  { id: "fund", e: "🧺", n: "Investment fund", r: 11, vol: 9, risk: 3, liq: "Some days", d: "Many people's money together, invested in many things by experts." },
  { id: "stocks", e: "📈", n: "Stocks / ETF", r: 14, vol: 22, risk: 4, liq: "Market days", d: "Small pieces of companies. They grow over years, with big ups and downs." },
  { id: "usd", e: "💵", n: "Dollars", r: 4, vol: 12, risk: 3, liq: "Any day", d: "You buy dollars. You win if the dollar goes up against the peso — or lose if it goes down." },
  { id: "crypto", e: "🪙", n: "Crypto", r: 25, vol: 70, risk: 5, liq: "24 / 7", d: "Digital coins. They can rise a lot — or fall 70%. No deposit protection." },
];
const toolById = (id) => TOOLS.find((t) => t.id === id);
const chilis = (n) => "🌶️".repeat(n);
const tasteYear = (t) => [["😱 Bad year", Math.max(-85, t.r - t.vol * 1.4)], ["🙂 Normal year", t.r], ["🤩 Great year", t.r + t.vol * 1.4]];

const MENU_ROUNDS = [
  { tag: "CLIENT 1 · 🛟", q: "Daniela needs money for EMERGENCIES. It must be available any day. What do you serve her?", options: ["🐷 Savings pocket", "🔒 CDT · 12 months", "🪙 Crypto"], correct: 0, explain: "Emergencies need safe, liquid money." },
  { tag: "CLIENT 2 · 🎓", q: "Pedro will pay his university in EXACTLY 12 months. He wants a fixed, safe return.", options: ["🔒 CDT · 12 months", "📈 Stocks / ETF fund", "💵 Dollars in cash"], correct: 0, explain: "A CDT has a fixed rate and a fixed date — perfect for a known date." },
  { tag: "CLIENT 3 · 👵", q: "Grandma Rosa wants her savings to grow for 15 years. She accepts some ups and downs.", options: ["🧺 A diversified fund", "🐷 Only a savings pocket", "🪙 All in one new coin"], correct: 0, explain: "Long horizon + diversification." },
  { tag: "CLIENT 4 · ✈️", q: "Lucas will travel to the USA next year and will pay in dollars there.", options: ["💵 Buy dollars little by little", "🪙 Buy crypto and hope it rises", "📈 Buy one company's stock now"], correct: 0, explain: "Buying dollars little by little reduces exchange-rate risk." },
  { tag: "CLIENT 5 · 🎢", q: "Sofi (25) already has her emergency fund. She wants to try crypto with “money she can lose”. How much?", options: ["A small part, like 5%", "Her full emergency fund", "A loan from her card"], correct: 0, explain: "Only a small part you can afford to lose." },
  { tag: "CLIENT 6 · 🏛️", q: "Mr. Gómez wants low risk, a bit more than a savings account, and to lend to the government.", options: ["📜 Bonds", "🪙 Crypto", "📈 Stocks / ETF"], correct: 0, explain: "Government bonds: low risk, regular interest." },
];

function InvestMenu({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [tasted, setTasted] = useState({});
  const [open, setOpen] = useState(null);
  const [st, finish] = useFinish(onSave);
  const n = Object.keys(tasted).length;
  const t = open && toolById(open);
  if (st.done) return <Reward title="Master chef of investing! 🍽️" subtitle="Every tool has its flavor: risk, return and liquidity." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Briefcase size={22} strokeWidth={2.1} />} title="The Investment Menu 🍽️" subtitle="Taste each investment with $1,000,000. Then serve 6 clients." onExit={onExit}>
      {stage === 0 ? (
        <>
          <HowTo>Tap a dish to <i>taste</i> it: you invest $1,000,000 for one year and see a bad, a normal and a great year. 🌶️ = risk. Taste <b>at least 5 dishes</b>.</HowTo>
          <div className="g74-menu">
            <header><small>CREAR INVESTMENT RESTAURANT</small><b>Today's Menu</b><span>Game numbers · per year</span></header>
            {TOOLS.map((x) => (
              <button key={x.id} type="button" className={`g74-dish ${open === x.id ? "on" : ""} ${tasted[x.id] ? "tasted" : ""}`} onClick={() => { setOpen(x.id); setTasted({ ...tasted, [x.id]: true }); }}>
                <em>{x.e}</em><div><b>{x.n}</b><small>{x.d}</small></div>
                <span className="g74-dish-tags"><i>{chilis(x.risk)}</i><i>≈ {x.r}%</i><i>💧 {x.liq}</i></span>
              </button>
            ))}
          </div>
          {t && (
            <div className="g74-plates">
              <b>{t.e} {t.n} · $1,000,000 after one year:</b>
              <div>
                {tasteYear(t).map(([l, r]) => { const v = 1000000 * (1 + r / 100); return (
                  <div key={l} className={`g74-plate ${v < 1000000 ? "down" : v > 1000000 ? "up" : ""}`}><small>{l}</small><b>{cop(v)}</b><span>{r > 0 ? "+" : ""}{Math.round(r)}%</span></div>
                ); })}
              </div>
              <p>{t.vol === 0 ? "😌 Calm: the three years are the same. Low risk, low surprise." : t.vol >= 50 ? "🎢 Huge difference between the bad and the great year: VERY risky." : t.vol >= 15 ? "⚠️ Big difference: it can win a lot, but it can lose too." : "🙂 Small difference: medium-low risk."}</p>
            </div>
          )}
          <div className="start-foot"><button className="s1-btn primary big" disabled={n < 5} onClick={() => setStage(1)}>{n < 5 ? `${n}/5 dishes tasted` : "Serve the 6 clients"} <ChevronRight size={18} /></button></div>
        </>
      ) : (
        <RoundsRunner rounds={MENU_ROUNDS} doneLabel="Close the restaurant" onDone={(r) => finish(r.firstTry * 4 + 10, { tasted: Object.keys(tasted), firstTry: r.firstTry })} />
      )}
    </ActShell>
  );
}

/* ---------- GOAL INVESTING LAB (Pieza 02) ---------- */
const DEFAULT_ROUTE_GOAL = { age: 25, e: "🛟", l: "Emergency fund (6 months)", amount: 9000000 };
function goalOptions(resp) {
  const g = resp?.c33_route?.goals;
  if (!g) return [DEFAULT_ROUTE_GOAL, { age: 18, e: "💻", l: "Laptop for university", amount: 3600000 }, { age: 30, e: "🏡", l: "Apartment down payment", amount: 40000000 }];
  return [18, 25, 30].filter((a) => g[a]).map((a) => ({ age: a, e: g[a].e, l: g[a].l, amount: g[a].amount }));
}
const portStats = (alloc) => {
  const w = (id) => (alloc[id] || 0) / 100;
  const r = TOOLS.reduce((a, t) => a + w(t.id) * t.r, 0);
  const risk = Math.sqrt(TOOLS.reduce((a, t) => a + Math.pow(w(t.id) * t.vol, 2), 0));
  return { r, risk };
};
const growPath = (monthly, years, rate) => { const out = [0]; let v = 0; for (let y = 1; y <= years; y++) { for (let m = 0; m < 12; m++) v = v * (1 + rate / 100 / 12) + monthly; out.push(Math.round(v)); } return out; };

function GoalLab({ resp, existing, onSave, onExit }) {
  const opts = goalOptions(resp);
  const [gi, setGi] = useState(existing?.goalIdx ?? 0);
  const goal = opts[Math.min(gi, opts.length - 1)];
  const years = goal.age - 13;
  const [monthly, setMonthly] = useState(existing?.monthly || Math.ceil((goal.amount / (years * 12)) * 0.55 / 10000) * 10000);
  const [alloc, setAlloc] = useState(existing?.alloc || { pocket: 100 });
  const [infl, setInfl] = useState(false);
  const [why, setWhy] = useState(existing?.why || "");
  const [st, finish] = useFinish(onSave);
  const sum = TOOLS.reduce((a, t) => a + (alloc[t.id] || 0), 0);
  const left = 100 - sum;
  const setA = (id, v) => { const others = sum - (alloc[id] || 0); setAlloc({ ...alloc, [id]: clamp(v, 0, 100 - others) }); };
  const { r, risk } = portStats(alloc);
  const good = growPath(monthly, years, r + risk / 2), mid = growPath(monthly, years, r), bad = growPath(monthly, years, Math.max(-30, r - risk));
  const target = infl ? Math.round(goal.amount * Math.pow(1.05, years)) : goal.amount;
  const end = mid[mid.length - 1], endBad = bad[bad.length - 1];
  const okMid = end >= target, okBad = endBad >= target;
  const warn = [];
  if ((alloc.crypto || 0) > 20) warn.push("🪙 More than 20% in crypto: a crash could destroy your goal.");
  if (years <= 5 && (alloc.stocks || 0) + (alloc.crypto || 0) > 50) warn.push("⏳ Your goal is close (5 years or less). Too much risk for so little time.");
  if ((alloc.cdt || 0) > 0 && goal.age === 18) warn.push("🔒 Remember: CDT money is locked until the end of each term.");
  if ((alloc.pocket || 0) === 100 && years >= 12) warn.push("🐷 100% in a pocket for so many years: safe, but inflation eats part of the growth.");
  if (Object.values(alloc).filter((v) => v > 0).length === 1 && !alloc.pocket) warn.push("🧺 All your money is in ONE place. Consider diversifying.");
  const labels = Array.from({ length: years + 1 }, (_, y) => String(13 + y));
  const every = (a) => a.filter((_, k) => k % Math.ceil(years / 9) === 0 || k === a.length - 1);
  const used = TOOLS.filter((t) => (alloc[t.id] || 0) > 0).length;
  const ready = sum === 100 && used >= 2 && okMid && countWords(why) >= 12;
  if (st.done) return <Reward title="Investment plan saved! 🧪" subtitle="Piece 02 of your Financial Future Portfolio." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Activity size={22} strokeWidth={2.1} />} title="Goal Investing Lab 🧪" subtitle="Which mix of saving and investing reaches YOUR goal?" onExit={onExit}>
      <PieceBadge n="02" />
      <HowTo>1) Choose a goal from your roadmap. 2) Choose how much you put every month. 3) Split it between the tools (total = 100%). The chart shows a <i>bad</i>, a <i>normal</i> and a <i>good</i> future. Mission: reach the goal in the <b>normal</b> future — and try to reach it in the bad one too!</HowTo>
      <div className="g73-tabs">{opts.map((o, k) => <button key={o.age} type="button" className={gi === k ? "on" : ""} onClick={() => { setGi(k); setMonthly(Math.ceil((o.amount / ((o.age - 13) * 12)) * 0.55 / 10000) * 10000); }}><em>{o.e}</em><b>Age {o.age}</b><small>{o.l} · {cop(o.amount)}</small></button>)}</div>
      <div className="g72-machine">
        {Ctl({ l: "💰 Every month", v: monthly, set: setMonthly, mn: 10000, mx: 1000000, stp: 10000, fmt: cop })}
      </div>
      <div className="g74-alloc">
        <header><b>My mix</b><span className={left === 0 ? "ok" : ""}>{left === 0 ? "✅ 100% assigned" : `${left}% left to assign`}</span></header>
        {TOOLS.map((t) => (
          <div key={t.id} className="g74-alloc-row">
            <span><em>{t.e}</em> {t.n} <small>{chilis(t.risk)} ≈{t.r}%</small></span>
            <input type="range" min="0" max="100" step="5" value={alloc[t.id] || 0} onChange={(e) => setA(t.id, Number(e.target.value))} />
            <b>{alloc[t.id] || 0}%</b>
          </div>
        ))}
      </div>
      <div className="g72-meters">
        <Meter value={Math.round(clamp(r * 4, 0, 100))} color="#16b074" label={`📈 Expected return ${r.toFixed(1)}%`} />
        <Meter value={Math.round(clamp(risk * 2.2, 0, 100))} color="#ff6b57" label={`🎢 Risk level`} />
      </div>
      <div className="g73-toggle2"><button type="button" className={!infl ? "on" : ""} onClick={() => setInfl(false)}>🎯 Goal in today's prices</button><button type="button" className={infl ? "on" : ""} onClick={() => setInfl(true)}>🎈 Goal with 5% inflation</button></div>
      <LineChart labels={every(labels)} series={[{ name: "Goal", values: every(labels.map(() => target)), color: "#f5b23e" }, { name: "Bad", values: every(bad), color: "#ff6b57" }, { name: "Good", values: every(good), color: "#0b7a50" }, { name: "Normal", values: every(mid), color: "#16b074" }]} />
      <ChartLegend series={[{ name: "Good future", color: "#0b7a50" }, { name: "Normal future", color: "#16b074" }, { name: "Bad future", color: "#ff6b57" }, { name: `Goal ${cop(target)}`, color: "#f5b23e" }]} />
      <div className="g74-checks3 two">
        <div className={okMid ? "ok" : "no"}><em>🙂</em><b>Normal future</b><small>{cop(end)} at age {goal.age}</small><span>{okMid ? "✅ Goal reached" : `❌ Short by ${cop(target - end)}`}</span></div>
        <div className={okBad ? "ok" : "no"}><em>😱</em><b>Bad future</b><small>{cop(endBad)} at age {goal.age}</small><span>{okBad ? "🛡️ Safe even in a bad future!" : `⚠️ Short by ${cop(target - endBad)}`}</span></div>
      </div>
      {warn.map((w) => <div key={w} className="p1-hint">{w}</div>)}
      {sum === 100 && used < 2 && <div className="p1-hint">🧪 Experiment! Use <b>at least 2 tools</b> in your mix and watch how the three futures change.</div>}
      {sum === 100 && used >= 2 && okMid && (
        <div className="start-block">
          <h3><PenLine size={18} /> Why did you choose this mix? (min 12 words)</h3>
          <Starters items={["I chose this mix because", "My goal is in … years, so", "I don't want to risk", "To beat inflation,"]} onPick={appendStarter(setWhy)} />
          <WordField value={why} onChange={setWhy} min={12} max={80} rows={3} placeholder="Write your answer here…" />
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(40, { goal, goalIdx: gi, monthly, alloc, rate: +r.toFixed(1), risk: +risk.toFixed(1), end, endBad, safeBad: okBad, inflation: infl, why })}>{sum !== 100 ? "Assign 100%" : used < 2 ? "Use at least 2 tools" : !okMid ? "Reach the goal first" : "Save Piece 02"} <span className="coin-tag"><Coins size={15} /> +40</span></button></div>
    </ActShell>
  );
}

/* ---------- RISK LADDER (ordenar de menor a mayor riesgo) ---------- */
function RiskLadder({ onSave, onExit }) {
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Risk ladder climbed! 🪜" subtitle="Low risk → low surprise. High risk → big surprise." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Layers size={22} strokeWidth={2.1} />} title="The Risk Ladder 🪜" subtitle="Order the tools from the LOWEST to the HIGHEST risk." onExit={onExit}>
      <HowTo>Tap a card, then tap a step of the ladder. Step 1 = the safest. Step 5 = the riskiest. Then press <i>Check my order</i>.</HowTo>
      <OrderGame items={["🐷 Savings pocket", "📜 Government bonds", "🧺 Diversified fund", "📈 One company's stock", "🪙 A brand-new crypto coin"]} labels={["1 · Safest", "2", "3", "4", "5 · Riskiest"]} onDone={(r) => finish(Math.max(10, 24 - r.errors * 3), { errors: r.errors })} />
    </ActShell>
  );
}

/* =====================================================================
   BLOQUE 3 · CLASES 35–36 · RISK MANAGEMENT & DIVERSIFICATION
   ===================================================================== */
const SIM_ASSETS = [
  { id: "cdt", e: "🔒", n: "CDT", c: "#0b7a50" },
  { id: "bonds", e: "📜", n: "Bonds", c: "#3c9d6e" },
  { id: "fund", e: "🧺", n: "Diversified fund", c: "#16b074" },
  { id: "col", e: "🇨🇴", n: "Colombian stocks", c: "#c9902a" },
  { id: "glob", e: "🌎", n: "Global ETF", c: "#f5b23e" },
  { id: "usd", e: "💵", n: "Dollars", c: "#7a8b80" },
  { id: "crypto", e: "🪙", n: "Crypto", c: "#e07a2f" },
  { id: "tech", e: "🎰", n: "TechNova (1 company)", c: "#ff6b57" },
];
// % de cambio de cada activo en cada noticia (números de juego)
const NEWS = {
  calm: { e: "🌤️", h: "A calm, normal year", d: "No big surprises. Companies grow a little.", fx: { cdt: 7, bonds: 8, fund: 12, col: 13, glob: 14, usd: -3, crypto: 20, tech: 15 } },
  crisis: { e: "🦠", h: "Global health crisis!", d: "Shops close around the world. Investors are scared. The dollar goes up.", fx: { cdt: 7, bonds: 6, fund: -6, col: -22, glob: -15, usd: 18, crypto: -40, tech: -30 } },
  recover: { e: "🔁", h: "Markets recover", d: "The crisis ends. Companies sell again. Prices go back up.", fx: { cdt: 7, bonds: 9, fund: 20, col: 25, glob: 26, usd: -8, crypto: 40, tech: 25 } },
  scandal: { e: "🚨", h: "TechNova scandal: the CEO lied about sales", d: "The police investigate. Nobody wants TechNova shares.", fx: { cdt: 7, bonds: 8, fund: 9, col: 7, glob: 11, usd: 0, crypto: 5, tech: -85 } },
  hype: { e: "📣", h: "Influencer hype: everybody buys crypto", d: "Crypto is on every TV show. Prices fly.", fx: { cdt: 7, bonds: 7, fund: 10, col: 6, glob: 12, usd: 0, crypto: 150, tech: 20 } },
  boom: { e: "🚀", h: "Tech boom!", d: "New apps and AI tools sell like crazy.", fx: { cdt: 7, bonds: 7, fund: 16, col: 10, glob: 26, usd: -5, crypto: 80, tech: 60 } },
  winter: { e: "🧊", h: "Crypto winter: a big exchange collapses", d: "Millions of people can't get their coins back.", fx: { cdt: 7, bonds: 8, fund: 9, col: 8, glob: 11, usd: 2, crypto: -70, tech: 5 } },
  infl: { e: "🎈", h: "High inflation: interest rates go up", d: "Prices rise fast. The central bank raises rates. Stocks suffer.", fx: { cdt: 11, bonds: -4, fund: 3, col: -10, glob: -6, usd: 10, crypto: -15, tech: -12 } },
  coffee: { e: "☕", h: "Coffee and oil prices rise", d: "Colombia exports more. Colombian companies win. The dollar falls.", fx: { cdt: 7, bonds: 8, fund: 13, col: 28, glob: 8, usd: -12, crypto: 10, tech: 8 } },
};
const SCRIPTS = [["calm", "crisis", "recover", "scandal", "winter"], ["boom", "winter", "infl", "scandal", "recover"], ["hype", "scandal", "crisis", "recover", "coffee"]];
const BOTS = [
  { id: "nico", e: "🎰", n: "All-in Nico", d: "100% TechNova", c: "#ff6b57", mix: { tech: 100 } },
  { id: "kim", e: "🪙", n: "Crypto Kim", d: "100% crypto", c: "#e07a2f", mix: { crypto: 100 } },
  { id: "sam", e: "🔒", n: "Safe Sam", d: "100% CDT", c: "#0b7a50", mix: { cdt: 100 } },
  { id: "bal", e: "🧺", n: "Balanced Bea", d: "Diversified in 7 places", c: "#f5b23e", mix: { cdt: 15, bonds: 15, fund: 25, col: 10, glob: 25, usd: 5, crypto: 5 } },
];
const SIM_START = 10000000;
// Avanza un portafolio (valores por activo) con una noticia
const stepHold = (hold, fx) => Object.fromEntries(Object.entries(hold).map(([k, v]) => [k, v * (1 + (fx[k] || 0) / 100)]));
const holdFrom = (mix, amount) => Object.fromEntries(Object.entries(mix).filter(([, p]) => p > 0).map(([k, p]) => [k, (amount * p) / 100]));
const holdTotal = (h) => Object.values(h).reduce((a, v) => a + v, 0);
function runBot(mix, script) { let h = holdFrom(mix, SIM_START); const out = [SIM_START]; script.forEach((k) => { h = stepHold(h, NEWS[k].fx); out.push(Math.round(holdTotal(h))); }); return out; }
const SIM_LABELS = ["Start", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];

function MarketSim({ existing, onSave, onExit }) {
  const [stage, setStage] = useState(0); // 0 build · 1 play · 2 results
  const [mix, setMix] = useState(existing?.mix || {});
  const [script, setScript] = useState(() => Math.floor(Math.random() * SCRIPTS.length));
  const [year, setYear] = useState(0);
  const [hold, setHold] = useState(null);
  const [mine, setMine] = useState([SIM_START]);
  const [ask, setAsk] = useState(false);
  const [panic, setPanic] = useState(null);
  const [st, finish] = useFinish(onSave);
  const sum = SIM_ASSETS.reduce((a, x) => a + (mix[x.id] || 0), 0);
  const setM = (id, v) => { const others = sum - (mix[id] || 0); setMix({ ...mix, [id]: clamp(v, 0, 100 - others) }); };
  const sc = SCRIPTS[script];
  const bots = useMemo(() => BOTS.map((b) => ({ ...b, vals: runBot(b.mix, sc) })), [script]); // eslint-disable-line react-hooks/exhaustive-deps
  const start = () => { setHold(holdFrom(mix, SIM_START)); setMine([SIM_START]); setYear(0); setPanic(null); setAsk(false); setStage(1); };
  const nextYear = () => {
    const ev = NEWS[sc[year]];
    const h = stepHold(hold, ev.fx); const v = Math.round(holdTotal(h));
    setHold(h); setMine([...mine, v]); setYear(year + 1);
    if (panic === null && v < mine[mine.length - 1] * 0.95 && year < 4) setAsk(true);
  };
  const decide = (sell) => { setPanic(sell); setAsk(false); if (sell) setHold({ cdt: holdTotal(hold) }); };
  const again = () => { setScript((script + 1) % SCRIPTS.length); setStage(0); };
  const cur = mine[mine.length - 1];
  const ev = year > 0 ? NEWS[sc[year - 1]] : null;
  const all = [{ id: "you", e: "😎", n: "You", c: "#072a1e", vals: mine }, ...bots];
  const shownSeries = all.map((s) => ({ name: s.n, color: s.c, values: SIM_LABELS.map((_, i) => (i <= year ? s.vals[i] : null)) }));
  const used = SIM_ASSETS.filter((x) => (mix[x.id] || 0) > 0).length;
  if (st.done) return <Reward title="You survived the 5-year storm! 🌪️" subtitle="Now you know why diversification matters." coins={st.coins} saving={st.saving} onExit={onExit} gold />;

  if (stage === 0) return (
    <ActShell icon={<Activity size={22} strokeWidth={2.1} />} title="The 5-Year Storm 🌪️" subtitle="Invest $10,000,000 (game money). Then 5 years of real-style news hit the market." onExit={onExit}>
      <HowTo>Split your <b>$10,000,000</b> between the 8 options (total 100%). Then you will live <i>5 years of news</i>: crises, booms, scandals… You compete against 4 investors. Who ends with more money? Who loses everything?</HowTo>
      <div className="g74-rivals">{BOTS.map((b) => <div key={b.id} style={{ "--cc": b.c }}><em>{b.e}</em><b>{b.n}</b><small>{b.d}</small></div>)}</div>
      <div className="g74-alloc">
        <header><b>😎 My portfolio</b><span className={sum === 100 ? "ok" : ""}>{sum === 100 ? "✅ 100% invested" : `${100 - sum}% left`}</span></header>
        {SIM_ASSETS.map((x) => (
          <div key={x.id} className="g74-alloc-row">
            <span><em>{x.e}</em> {x.n}</span>
            <input type="range" min="0" max="100" step="5" value={mix[x.id] || 0} onChange={(e) => setM(x.id, Number(e.target.value))} />
            <b>{mix[x.id] || 0}% <small>{cop((SIM_START * (mix[x.id] || 0)) / 100)}</small></b>
          </div>
        ))}
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={sum !== 100} onClick={start}><Play size={16} /> Start the 5 years</button></div>
    </ActShell>
  );

  if (stage === 1) return (
    <ActShell icon={<Newspaper size={22} strokeWidth={2.1} />} title={`The 5-Year Storm · ${year === 0 ? "Ready?" : `Year ${year}`}`} subtitle="Read the news. Watch what happens to each portfolio." onExit={onExit}>
      <div className="g74-years">{SIM_LABELS.slice(1).map((l, i) => <span key={l} className={i < year ? "done" : i === year ? "on" : ""}>{l}</span>)}</div>
      {ev ? (
        <div className="g74-news" key={year}>
          <small>📰 BREAKING NEWS · YEAR {year}</small>
          <h3>{ev.e} {ev.h}</h3><p>{ev.d}</p>
          <div className="g74-fx">{SIM_ASSETS.map((x) => <span key={x.id} className={ev.fx[x.id] > 0 ? "up" : ev.fx[x.id] < 0 ? "down" : ""}>{x.e} {ev.fx[x.id] > 0 ? "+" : ""}{ev.fx[x.id]}%</span>)}</div>
        </div>
      ) : <div className="g74-news calm"><small>📰 MARKET OPEN</small><h3>🔔 Your money is invested. Good luck!</h3><p>Press “Next year” to read the first news.</p></div>}
      <div className="g74-board">
        {all.map((s) => { const v = s.vals[year], prev = s.vals[Math.max(0, year - 1)]; const ch = pctChange(prev, v); return (
          <div key={s.id} className={`g74-board-row ${s.id === "you" ? "me" : ""}`} style={{ "--cc": s.c }}>
            <em>{s.e}</em><b>{s.n}</b><span>{cop(v)}</span>
            <i className={year === 0 ? "" : ch >= 0 ? "up" : "down"}>{year === 0 ? "—" : fmtPct(ch, 0)}</i>
          </div>
        ); })}
      </div>
      <LineChart labels={SIM_LABELS} series={shownSeries} yMin={0} />
      <ChartLegend series={all.map((s) => ({ name: s.n, color: s.c }))} />
      {ask ? (
        <div className="g74-panic">
          <b>😰 Your portfolio fell to {cop(cur)}. Your friends are selling. What do you do?</b>
          <div className="g72-opts">
            <button type="button" className="g72-opt" onClick={() => decide(false)}><em>🧘</em><span>Stay calm and keep my plan</span></button>
            <button type="button" className="g72-opt" onClick={() => decide(true)}><em>🏃</em><span>Sell everything and move to a CDT</span></button>
          </div>
        </div>
      ) : (
        <div className="start-foot">
          {year < 5 ? <button className="s1-btn primary big" onClick={nextYear}><Newspaper size={16} /> {year === 0 ? "Read the first news" : "Next year"}</button>
            : <button className="s1-btn primary big" onClick={() => setStage(2)}>See the final results <Trophy size={16} /></button>}
        </div>
      )}
      {panic === true && <p className="start-tip p1-center">🏃 You sold in panic and moved everything to a CDT.</p>}
    </ActShell>
  );

  const rank = [...all].sort((a, b) => b.vals[5] - a.vals[5]);
  const myPos = rank.findIndex((s) => s.id === "you") + 1;
  const worst = (vals) => Math.min(...vals.slice(1).map((v, i) => pctChange(vals[i], v)));
  const lessons = [];
  if (mix.tech >= 50 || mix.crypto >= 50) lessons.push("🥚 You put most of your eggs in one basket — and the basket fell.");
  if (used >= 4) lessons.push("🧺 Diversification badge: you used 4 or more investments.");
  if (panic === true) lessons.push("🏃 Panic seller: you sold during the fall and missed the recovery.");
  if (panic === false) lessons.push("🧘 Diamond calm: you kept your plan during the fall.");
  return (
    <ActShell icon={<Trophy size={22} strokeWidth={2.1} />} title="The 5-Year Storm · Results 🏁" subtitle="Compare the five strategies. Which one would you choose for your future?" onExit={onExit}>
      <div className="g74-podium">
        {rank.map((s, i) => (
          <div key={s.id} className={`${s.id === "you" ? "me" : ""}`} style={{ "--cc": s.c }}>
            <span className="pos">{["🥇", "🥈", "🥉", "4", "5"][i]}</span><em>{s.e}</em><b>{s.n}</b>
            <strong>{cop(s.vals[5])}</strong><small>{fmtPct(pctChange(SIM_START, s.vals[5]), 0)} total · worst year {fmtPct(worst(s.vals), 0)}</small>
          </div>
        ))}
      </div>
      <LineChart labels={SIM_LABELS} series={all.map((s) => ({ name: s.n, color: s.c, values: s.vals }))} yMin={0} />
      <ChartLegend series={all.map((s) => ({ name: s.n, color: s.c }))} />
      <div className="g74-news calm"><small>📰 THE 5 YEARS</small><p>{sc.map((k, i) => `Y${i + 1} ${NEWS[k].e} ${NEWS[k].h}`).join(" · ")}</p></div>
      {lessons.map((l) => <div key={l} className="p1-hint">{l}</div>)}
      <div className="p3-card-actions"><button className="s1-btn ghost" onClick={again}><RefreshCw size={16} /> Play again with new news</button></div>
      <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(myPos <= 2 ? 40 : 30, { mix, script: sc, series: Object.fromEntries(all.map((s) => [s.id, s.vals])), final: mine[5], rank: myPos, panic, used })}>Save my results <span className="coin-tag"><Coins size={15} /> +{myPos <= 2 ? 40 : 30}</span></button></div>
    </ActShell>
  );
}

/* ---------- GRAPH TALK (vocabulario de gráficas) ---------- */
const miniChart = (series) => <LineChart labels={["Y0", "Y1", "Y2", "Y3", "Y4"]} series={series} height={170} money={false} />;
const one = (v, c = "#16b074") => miniChart([{ name: "A", values: v, color: c }]);
const GRAPH_ROUNDS = [
  { tag: "GRAPH 1", q: "Which sentence describes this graph?", visual: one([100, 120, 140, 160, 180]), options: ["It rose steadily.", "It fell sharply.", "It fluctuated a lot."], correct: 0, explain: "Up, up, up — at the same speed: it rose steadily." },
  { tag: "GRAPH 2", q: "What happened in year 2?", visual: one([100, 105, 60, 62, 65], "#ff6b57"), options: ["It dropped sharply.", "It rose gradually.", "It remained steady."], correct: 0, explain: "From 105 to 60 in one year: a sharp drop." },
  { tag: "GRAPH 3", q: "Which sentence describes this graph?", visual: one([100, 140, 80, 150, 90], "#e07a2f"), options: ["It fluctuated a lot.", "It remained steady.", "It rose steadily."], correct: 0, explain: "Up, down, up, down: it fluctuated." },
  { tag: "GRAPH 4", q: "Which sentence describes this graph?", visual: one([100, 101, 100, 102, 101], "#0b7a50"), options: ["It remained steady.", "It peaked in year 3.", "It dropped sharply."], correct: 0, explain: "Almost flat: it remained steady." },
  { tag: "GRAPH 5", q: "Where is the peak?", visual: one([100, 130, 170, 120, 110], "#f5b23e"), options: ["It peaked in year 2.", "It peaked in year 4.", "Its low point was year 2."], correct: 0, explain: "The highest point (170) is in year 2." },
  { tag: "GRAPH 6", q: "Which sentence describes this graph?", visual: one([100, 70, 80, 95, 105]), options: ["It fell, then recovered.", "It rose, then it fell.", "It never changed at all."], correct: 0, explain: "It fell to 70 and went back up to 105." },
  { tag: "GRAPH 7", q: "Which sentence describes this graph?", visual: one([100, 98, 96, 94, 92], "#ff6b57"), options: ["It decreased gradually.", "It dropped sharply.", "It increased gradually."], correct: 0, explain: "Down a little every year: gradually." },
  { tag: "GRAPH 8", q: "Compare line A (green) and line B (orange).", visual: <>{miniChart([{ name: "A", values: [100, 110, 120, 130, 140], color: "#16b074" }, { name: "B", values: [100, 140, 70, 160, 90], color: "#e07a2f" }])}<ChartLegend series={[{ name: "A", color: "#16b074" }, { name: "B", color: "#e07a2f" }]} /></>, options: ["A is less volatile than B.", "B is less volatile than A.", "A and B are equally steady."], correct: 0, explain: "B goes up and down a lot: B is more volatile." },
];

/* ---------- ANALYZE THE GRAPH (lectura + writing) ---------- */
const GRAPH_WORDS = [["rise", /\b(rise|rises|rose|risen|rising|increase[ds]?|increasing)\b/i], ["fall / drop", /\b(fall|falls|fell|fallen|drop|drops|dropped|decrease[ds]?|decreasing)\b/i], ["peak", /\bpeak(s|ed)?\b/i], ["dip / low point", /\b(dip|dips|dipped|low point|lowest)\b/i], ["fluctuate", /\bfluctuat(e|es|ed|ing)\b/i], ["steady", /\bstead(y|ily)\b/i], ["sharply / dramatically", /\b(sharply|dramatically)\b/i], ["gradually / slightly", /\b(gradually|slightly)\b/i], ["recover", /\brecover(s|ed|y)?\b/i], ["diversified", /\bdiversif(ied|y|ication)\b/i], ["risk", /\brisk(y|s)?\b/i]];
const defaultSim = () => { const sc = SCRIPTS[0]; const you = runBot({ cdt: 20, fund: 30, glob: 20, col: 10, usd: 10, crypto: 10 }, sc); return { script: sc, series: { you, ...Object.fromEntries(BOTS.map((b) => [b.id, runBot(b.mix, sc)])) } }; };
function GraphWriter({ resp, existing, onSave, onExit }) {
  const sim = resp?.c35_sim?.series ? resp.c35_sim : defaultSim();
  const all = [{ id: "you", e: "😎", n: "My portfolio", c: "#072a1e" }, ...BOTS].map((s) => ({ ...s, vals: sim.series[s.id] }));
  const [stage, setStage] = useState(0);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const rounds = useMemo(() => {
    const names = all.map((s) => `${s.e} ${s.n}`);
    const fin = all.map((s) => s.vals[5]);
    const hi = fin.indexOf(Math.max(...fin)), lo = fin.indexOf(Math.min(...fin));
    const nico = all.find((s) => s.id === "nico").vals;
    const ch = nico.slice(1).map((v, i) => pctChange(nico[i], v));
    const worstY = ch.indexOf(Math.min(...ch));
    const you = all[0].vals;
    return [
      { tag: "READ THE GRAPH 1", q: "Which strategy ended with the MOST money?", options: names, correct: hi, explain: `${names[hi]}: ${cop(fin[hi])}.` },
      { tag: "READ THE GRAPH 2", q: "Which strategy ended with the LEAST money?", options: names, correct: lo, explain: `${names[lo]}: ${cop(fin[lo])}.` },
      { tag: "READ THE GRAPH 3", q: "In which year did 🎰 All-in Nico drop most sharply?", options: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"], correct: worstY, explain: `Year ${worstY + 1}: ${fmtPct(ch[worstY], 0)}.` },
      { tag: "READ THE GRAPH 4", q: "Which line remained the most steady?", options: names, correct: names.findIndex((x) => x.includes("Safe Sam")), explain: "The CDT line rises gradually with no drops." },
      { tag: "READ THE GRAPH 5", q: "By how many % did YOUR portfolio change in 5 years? (round to a whole number)", answer: Math.round(pctChange(you[0], you[5])), tol: 1, unit: "%", hint: "(final − 10,000,000) ÷ 10,000,000 × 100", explain: `From ${cop(you[0])} to ${cop(you[5])}.` },
    ];
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const hits = GRAPH_WORDS.filter(([, re]) => re.test(text)).map(([w]) => w);
  const w = countWords(text);
  const ready = hits.length >= 5 && w >= 60 && w <= 170;
  if (st.done) return <Reward title="Graph analyst! 📊" subtitle="You explained a graph like a real investor." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<LineIcon size={22} strokeWidth={2.1} />} title="Analyze the Graph ✍️" subtitle={resp?.c35_sim ? "These are YOUR results from the 5-Year Storm." : "Example results (play the 5-Year Storm to use your own)."} onExit={onExit}>
      <div className="g74-graphbox">
        <LineChart labels={SIM_LABELS} series={all.map((s) => ({ name: s.n, color: s.c, values: s.vals }))} yMin={0} />
        <ChartLegend series={all.map((s) => ({ name: s.n, color: s.c }))} />
        <small>📰 {sim.script.map((k, i) => `Y${i + 1} ${NEWS[k].e} ${NEWS[k].h}`).join(" · ")}</small>
      </div>
      {stage === 0 ? (
        <RoundsRunner rounds={rounds} doneLabel="Now write my analysis" onDone={() => setStage(1)} />
      ) : (
        <div className="start-block">
          <h3><span className="step-n">✦</span> Write a graph analysis (60–170 words)</h3>
          <p className="start-tip">Describe what happened, use numbers and years, compare the strategies and give your conclusion. Use at least <b>5 graph words</b> — they light up when you use them!</p>
          <div className="g74-wordbank">{GRAPH_WORDS.map(([wd]) => <span key={wd} className={hits.includes(wd) ? "on" : ""}>{hits.includes(wd) ? "✓ " : ""}{wd}</span>)}</div>
          <Starters items={["The graph shows", "In year", "The highest point was", "All-in Nico's portfolio", "The diversified portfolio", "In conclusion,"]} onPick={appendStarter(setText)} />
          <WordField value={text} onChange={setText} min={60} max={170} rows={8} placeholder="Write your analysis here…" />
          <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(35, { text, words: w, vocab: hits })}>{hits.length < 5 ? `${hits.length}/5 graph words` : "Send my analysis"} <span className="coin-tag"><Coins size={15} /> +35</span></button></div>
        </div>
      )}
    </ActShell>
  );
}

/* ---------- MY RISK STRATEGY (Pieza 03) ---------- */
const RISK_Q4 = [
  { q: "Your investments fall 20% in one month. You…", o: [["Sell everything — I can't sleep", 0], ["Wait and check my plan", 1], ["Buy a little more, it's cheaper", 2]] },
  { q: "When will you need this money?", o: [["In less than 2 years", 0], ["In 3 to 7 years", 1], ["In more than 8 years", 2]] },
  { q: "Which sentence sounds like you?", o: [["I prefer small but sure gains", 0], ["I accept some ups and downs", 1], ["I accept big ups and downs to win more", 2]] },
];
const PROFILES4 = {
  Conservative: { e: "🛡️", d: "You protect your money first.", mix: { safe: 50, bonds: 25, fund: 15, stocks: 5, usd: 5, crypto: 0 } },
  Moderate: { e: "⚖️", d: "You balance safety and growth.", mix: { safe: 25, bonds: 20, fund: 25, stocks: 15, usd: 10, crypto: 5 } },
  Bold: { e: "🚀", d: "You accept risk for more growth — with rules!", mix: { safe: 15, bonds: 10, fund: 25, stocks: 30, usd: 10, crypto: 10 } },
};
const MIX5 = [["safe", "🐷 Pocket / CDT", "#0b7a50"], ["bonds", "📜 Bonds", "#3c9d6e"], ["fund", "🧺 Funds / ETF", "#16b074"], ["stocks", "📈 Stocks", "#f5b23e"], ["usd", "💵 Dollars", "#7a8b80"], ["crypto", "🪙 Crypto", "#e07a2f"]];
const RULES4 = [
  { id: "ef", t: "Emergency fund first, investments second", good: true },
  { id: "c10", t: "Never more than 10% in crypto", good: true, check: (m) => (m.crypto || 0) <= 10 },
  { id: "noborrow", t: "Never invest borrowed money", good: true },
  { id: "debt", t: "Pay expensive card debt before investing", good: true },
  { id: "div4", t: "Use at least 4 different investments", good: true, check: (m) => Object.values(m).filter((v) => v > 0).length >= 4 },
  { id: "calm", t: "Don't panic-sell in a crisis", good: true },
  { id: "infl", t: "Check my return vs. inflation every year", good: true },
  { id: "know", t: "Never invest in something I don't understand", good: true },
  { id: "influ", t: "Follow the tips of famous influencers", good: false, why: "Influencers are not financial advisors — many are paid to promote." },
  { id: "allbest", t: "Put everything in the stock that rose most this year", good: false, why: "That is putting all your eggs in one basket (remember Nico!)." },
];
function RiskStrategy({ resp, existing, onSave, onExit }) {
  const p3 = resp?.__p3?.c28_risk?.profile;
  const [ans, setAns] = useState(existing?.answers || {});
  const [rules, setRules] = useState(existing?.ruleIds || []);
  const [mix, setMix] = useState(existing?.mix || null);
  const [sentence, setSentence] = useState(existing?.sentence || "");
  const [st, finish] = useFinish(onSave);
  const answered = RISK_Q4.every((_, i) => ans[i] != null);
  const score = RISK_Q4.reduce((a, _, i) => a + (ans[i] ?? 0), 0);
  const profile = score <= 2 ? "Conservative" : score <= 4 ? "Moderate" : "Bold";
  const P = PROFILES4[profile];
  const m = mix || P.mix;
  const sum = MIX5.reduce((a, [k]) => a + (m[k] || 0), 0);
  const setK = (k, v) => { const others = sum - (m[k] || 0); setMix({ ...m, [k]: clamp(v, 0, 100 - others) }); };
  const badRules = rules.map((id) => RULES4.find((r) => r.id === id)).filter((r) => !r.good);
  const broken = rules.map((id) => RULES4.find((r) => r.id === id)).filter((r) => r.check && !r.check(m));
  const goodN = rules.filter((id) => RULES4.find((r) => r.id === id).good).length;
  const ready = answered && goodN >= 4 && badRules.length === 0 && sum === 100 && broken.length === 0 && countWords(sentence) >= 10;
  if (st.done) return <Reward title="Your risk strategy is ready! 🛡️" subtitle="Piece 03 of your Financial Future Portfolio." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<ShieldCheck size={22} strokeWidth={2.1} />} title="My Risk Strategy 🛡️" subtitle="Your profile + your rules + your mix. Everything must match!" onExit={onExit}>
      <PieceBadge n="03" />
      <div className="start-block">
        <h3><span className="step-n">1</span> My risk profile today {p3 && <small className="g74-was">· In Period 3 you were: {p3}</small>}</h3>
        {RISK_Q4.map((q, i) => (
          <div key={i} className="g73-rq"><b>{q.q}</b><div className="g72-opts">{q.o.map(([l, s]) => <button key={l} type="button" className={`g72-opt ${ans[i] === s ? "on" : ""}`} onClick={() => { setAns({ ...ans, [i]: s }); setMix(null); }}><span>{l}</span></button>)}</div></div>
        ))}
        {answered && <div className="g74-profile"><em>{P.e}</em><div><b>{profile}</b><span>{P.d}</span></div></div>}
      </div>
      {answered && (
        <>
          <div className="start-block">
            <h3><span className="step-n">2</span> My rules (choose 4 or more good ones)</h3>
            <div className="g74-rules">{RULES4.map((r) => <button key={r.id} type="button" className={`${rules.includes(r.id) ? (r.good ? "on" : "bad") : ""}`} onClick={() => setRules(rules.includes(r.id) ? rules.filter((x) => x !== r.id) : [...rules, r.id])}>{rules.includes(r.id) ? (r.good ? "✅ " : "🚩 ") : ""}{r.t}</button>)}</div>
            {badRules.map((r) => <div key={r.id} className="p1-banner bad"><span>🚩 <b>{r.t}</b> is a dangerous rule. {r.why}</span></div>)}
          </div>
          <div className="start-block">
            <h3><span className="step-n">3</span> My mix (suggested for a {profile} investor — you can change it)</h3>
            <div className="g74-alloc flat">
              {MIX5.map(([k, l]) => <div key={k} className="g74-alloc-row"><span>{l}</span><input type="range" min="0" max="100" step="5" value={m[k] || 0} onChange={(e) => setK(k, Number(e.target.value))} /><b>{m[k] || 0}%</b></div>)}
            </div>
            <PctBar parts={MIX5.map(([k, l, c]) => ({ label: l, value: m[k] || 0, color: c }))} />
            <p className={`word-count ${sum === 100 ? "ok" : ""}`}>{sum === 100 ? "✓ 100%" : `${100 - sum}% left`}</p>
            {broken.map((r) => <div key={r.id} className="p1-banner bad"><span>⚠️ Your mix breaks your own rule: <b>{r.t}</b>.</span></div>)}
          </div>
          <div className="start-block">
            <h3><span className="step-n">4</span> My strategy in one or two sentences (min 10 words)</h3>
            <Starters items={["My strategy is to", "Because I am a", "I will never", "When the market falls, I will"]} onPick={appendStarter(setSentence)} />
            <WordField value={sentence} onChange={setSentence} min={10} max={60} rows={3} placeholder="Write your answer here…" />
          </div>
        </>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(35, { answers: ans, profile, p3profile: p3 || null, ruleIds: rules, rules: rules.map((id) => RULES4.find((r) => r.id === id).t), mix: m, sentence })}>Save Piece 03 <span className="coin-tag"><Coins size={15} /> +35</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   BLOQUE 4 · CLASE 37 · FINTECH, CRYPTO & CYBERSECURITY
   ===================================================================== */
// Generador aleatorio con semilla (para que cada partida sea distinta pero estable)
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const gauss = (r) => { const u = Math.max(1e-9, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const COINS = [
  { id: "bcr", e: "₿", n: "BitCrear", t: "BCR", p0: 250000, vol: 0.035, drift: 0.004, c: "#f5b23e", d: "The first and biggest coin of the market. Limited supply." },
  { id: "elf", e: "🍃", n: "EtherLeaf", t: "ELF", p0: 12000, vol: 0.055, drift: 0.004, c: "#16b074", d: "A blockchain where people build apps and games." },
  { id: "scop", e: "🪙", n: "StableCOP", t: "SCOP", p0: 1000, vol: 0.001, drift: 0, c: "#0b7a50", d: "A stablecoin: 1 SCOP ≈ $1,000 pesos. Calm, but it doesn't grow." },
  { id: "taco", e: "🌮", n: "DogeTaco", t: "TACO", p0: 50, vol: 0.09, drift: 0, c: "#e07a2f", d: "A meme coin. It moves with jokes and influencers." },
  { id: "moon", e: "🌙", n: "MoonRocket", t: "MOON", p0: 200, vol: 0.08, drift: 0.01, c: "#ff6b57", d: "A brand-new token. Anonymous creators. “1000% guaranteed”." },
];
const EX_DAYS = 30;
const EX_FEE = 0.005;
// Eventos del mercado: día → noticia + efecto (%)
const EX_EVENTS = {
  4: { e: "📣", h: "A famous influencer posts: “TACO to the moon! 🚀🌮”", fx: { taco: 0.7 } },
  5: { e: "🔥", h: "DogeTaco is trending. Everybody is buying!", fx: { taco: 0.45 } },
  7: { e: "📉", h: "The influencer SOLD all his TACO. Pump and dump!", fx: { taco: -0.45 } },
  8: { e: "📉", h: "DogeTaco keeps falling…", fx: { taco: -0.3 } },
  10: { e: "🏪", h: "A big store chain now accepts BitCrear payments", fx: { bcr: 0.15, elf: 0.06 } },
  12: { e: "🌙", h: "MoonRocket ads everywhere: “1000% guaranteed!”", fx: { moon: 0.35 } },
  14: { e: "🌙", h: "MoonRocket +40%! “Don't miss it!”", fx: { moon: 0.4 } },
  16: { e: "🌙", h: "MoonRocket breaks a new record!", fx: { moon: 0.3 } },
  18: { e: "🧶", h: "RUG PULL! MoonRocket's creators disappeared with the money", fx: { moon: -0.985 }, dead: "moon" },
  21: { e: "🔓", h: "Rumor: an exchange was hacked. Panic in the market!", fx: { bcr: -0.14, elf: -0.18, taco: -0.2 } },
  25: { e: "📈", h: "Calm returns. Big investors buy BitCrear and EtherLeaf", fx: { bcr: 0.09, elf: 0.12 } },
  28: { e: "🎮", h: "A popular game launches on EtherLeaf", fx: { elf: 0.1 } },
};
const EX_SCAMS = {
  6: { from: "🎁 Elon_Crear_Official ✔️", msg: "GIVEAWAY! Send me $200,000 in coins and I'll send you $400,000 back in 5 minutes! Only today!", cost: 200000 },
  15: { from: "🛠️ Exchange Support", msg: "Your wallet will be blocked. To verify it, reply with your 12 secret seed-phrase words.", cost: "all" },
  23: { from: "👤 Unknown investor", msg: "Join my VIP group: 5% profit EVERY DAY, guaranteed. Pay $150,000 to enter.", cost: 150000 },
};
function makePrices(seed) {
  const r = rng(seed); const P = {};
  COINS.forEach((c) => {
    const arr = [c.p0]; let dead = false;
    for (let d = 1; d <= EX_DAYS; d++) {
      const ev = EX_EVENTS[d];
      if (dead) { arr.push(arr[d - 1] * (1 + gauss(r) * 0.05)); continue; }
      let ch = c.drift + gauss(r) * c.vol;
      if (ev?.fx?.[c.id] != null) ch = ev.fx[c.id] + gauss(r) * c.vol * 0.3;
      if (c.id === "scop") ch = gauss(r) * 0.001;
      arr.push(Math.max(c.id === "moon" ? 0.5 : 1, arr[d - 1] * (1 + ch)));
      if (ev?.dead === c.id) dead = true;
    }
    P[c.id] = arr;
  });
  return P;
}
const WORDS = ["river", "mango", "tiger", "cloud", "pizza", "rocket", "violet", "candle", "anchor", "jungle", "silver", "piano", "orbit", "lemon", "castle", "forest"];
const pwScore = (p) => [p.length >= 10, /[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
const fmtP = (v) => (v >= 1000 ? cop(v) : `$${v < 10 ? v.toFixed(2) : v.toFixed(1)}`);

function CryptoExchange({ onSave, onExit }) {
  const [stage, setStage] = useState(0); // 0 wallet · 1 trade · 2 results
  const [pw, setPw] = useState(""); const [tfa, setTfa] = useState(false);
  const seedWords = useMemo(() => shuffleArr(WORDS).slice(0, 6), []);
  const [seedStep, setSeedStep] = useState(0); // 0 show · 1 verify · 2 done
  const pool = useMemo(() => shuffleArr(seedWords), [seedWords]);
  const [typed, setTyped] = useState([]);
  const [supportAns, setSupportAns] = useState(null);
  const [seed] = useState(() => Math.floor(Math.random() * 1e9));
  const prices = useMemo(() => makePrices(seed), [seed]);
  const [day, setDay] = useState(0);
  const [cash, setCash] = useState(1000000);
  const [hold, setHold] = useState({});
  const [sel, setSel] = useState("bcr");
  const [amt, setAmt] = useState("");
  const [log, setLog] = useState([]);
  const [auto, setAuto] = useState(false);
  const [scam, setScam] = useState(null);
  const [scams, setScams] = useState({ blocked: 0, fell: 0 });
  const [flags, setFlags] = useState({});
  const [st, finish] = useFinish(onSave);
  const price = (id, d = day) => prices[id][d];
  const value = cash + COINS.reduce((a, c) => a + (hold[c.id] || 0) * price(c.id), 0);
  const dead = (id) => id === "moon" && day >= 18;
  const seedOk = typed.length === 6 && typed.every((w, i) => w === seedWords[i]);
  const walletOk = pwScore(pw) === 4 && tfa && seedStep === 2 && supportAns !== null;

  const advance = () => {
    if (day >= EX_DAYS || scam) return;
    const d = day + 1; setDay(d);
    if (EX_SCAMS[d]) { setScam({ ...EX_SCAMS[d], day: d }); setAuto(false); }
    if (d === 18 && (hold.moon || 0) > 0) setFlags((f) => ({ ...f, rug: true }));
    if (d >= EX_DAYS) setAuto(false);
  };
  useEffect(() => {
    if (!auto) return undefined;
    const t = setTimeout(advance, 1100);
    return () => clearTimeout(t);
  });

  const trade = (side, money) => {
    const p = price(sel); const c = COINS.find((x) => x.id === sel);
    if (dead(sel)) return;
    if (side === "buy") {
      const m = Math.min(money, cash); if (m <= 0) return;
      const units = (m * (1 - EX_FEE)) / p;
      setCash(cash - m); setHold({ ...hold, [sel]: (hold[sel] || 0) + units });
      if (sel === "taco" && day >= 4 && day <= 6) setFlags((f) => ({ ...f, hype: true }));
      if (sel === "moon" && day >= 12) setFlags((f) => ({ ...f, fomo: true }));
      setLog([{ d: day, t: `🟢 Bought ${c.t} for ${cop(m)}` }, ...log].slice(0, 8));
    } else {
      const have = (hold[sel] || 0) * p; const m = Math.min(money, have); if (m <= 0) return;
      const units = m / p;
      setCash(cash + m * (1 - EX_FEE)); setHold({ ...hold, [sel]: Math.max(0, (hold[sel] || 0) - units) });
      setLog([{ d: day, t: `🔴 Sold ${c.t} for ${cop(m)}` }, ...log].slice(0, 8));
    }
    setAmt("");
  };
  const answerScam = (send) => {
    if (send) {
      const loss = scam.cost === "all" ? value : Math.min(scam.cost, cash);
      if (scam.cost === "all") { setCash(0); setHold({}); } else setCash(cash - loss);
      setScams({ ...scams, fell: scams.fell + 1 });
      setLog([{ d: day, t: `💀 Scammed: −${cop(loss)}` }, ...log].slice(0, 8));
    } else setScams({ ...scams, blocked: scams.blocked + 1 });
    setScam({ ...scam, answered: send ? "fell" : "blocked" });
  };

  if (st.done) return <Reward title="Crypto trader graduated! 🚀" subtitle="You saw why crypto is exciting — and why it's dangerous." coins={st.coins} saving={st.saving} onExit={onExit} gold />;

  if (stage === 0) return (
    <ActShell icon={<Bitcoin size={22} strokeWidth={2.1} />} title="CREAR Crypto Exchange 🚀" subtitle="First, protect your wallet. Hackers love beginners." onExit={onExit}>
      <HowTo>Before trading you need a <b>safe wallet</b>: 1) a strong password, 2) two-factor authentication, 3) your secret seed phrase. You receive <b>$1,000,000 game pesos</b> to trade for 30 days.</HowTo>
      <div className="g74-wallet">
        <div className={`g74-wstep ${pwScore(pw) === 4 ? "ok" : ""}`}>
          <b>🔑 1 · Create a strong password</b>
          <input className="start-input" type="text" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Type a new password…" />
          <div className="g74-pw"><i style={{ width: `${pwScore(pw) * 25}%`, background: ["#ff6b57", "#ff6b57", "#f5b23e", "#f5b23e", "#16b074"][pwScore(pw)] }} /></div>
          <small>{[["10+ characters", pw.length >= 10], ["A capital letter", /[A-Z]/.test(pw)], ["A number", /[0-9]/.test(pw)], ["A symbol (!@#…)", /[^A-Za-z0-9]/.test(pw)]].map(([l, ok]) => <span key={l} className={ok ? "ok" : ""}>{ok ? "✓" : "○"} {l}</span>)}</small>
        </div>
        <div className={`g74-wstep ${tfa ? "ok" : ""}`}>
          <b>📲 2 · Two-factor authentication</b>
          <label className="g74-switch"><input type="checkbox" checked={tfa} onChange={(e) => setTfa(e.target.checked)} /><span /> {tfa ? "2FA is ON: password + code on your phone" : "Turn on 2FA"}</label>
        </div>
        <div className={`g74-wstep ${seedStep === 2 ? "ok" : ""}`}>
          <b>🌱 3 · Your secret seed phrase</b>
          {seedStep === 0 && (<><p>These 6 words can recover your wallet. <b>Write them on paper</b>. Never share them. Never take a screenshot.</p><div className="g74-seed">{seedWords.map((w, i) => <span key={w}><i>{i + 1}</i>{w}</span>)}</div><button className="s1-btn ghost" onClick={() => setSeedStep(1)}>I wrote them down — hide them</button></>)}
          {seedStep === 1 && (<><p>Tap the words in the correct order.</p><div className="g74-seed slots">{seedWords.map((_, i) => <span key={i} className={typed[i] ? (typed[i] === seedWords[i] ? "ok" : "no") : ""}><i>{i + 1}</i>{typed[i] || "…"}</span>)}</div>
            <div className="g74-chips">{pool.map((w) => <button key={w} type="button" disabled={typed.includes(w)} onClick={() => setTyped([...typed, w])}>{w}</button>)}</div>
            <div className="p3-card-actions"><button className="s1-btn ghost" onClick={() => setTyped([])}><RefreshCw size={15} /> Clear</button><button className="s1-btn ghost" onClick={() => { setTyped([]); setSeedStep(0); }}>Show them again</button>{seedOk && <button className="s1-btn primary" onClick={() => setSeedStep(2)}>Confirm <Check size={15} /></button>}</div></>)}
          {seedStep === 2 && <p>✅ Seed phrase saved. Only YOU know it.</p>}
        </div>
        {seedStep === 2 && (
          <div className={`g74-dm ${supportAns === "no" ? "ok" : supportAns === "yes" ? "bad" : ""}`}>
            <small>💬 New message · “CREAR Exchange Support”</small>
            <p>Welcome! To finish your registration, please send us your 6 seed-phrase words. 🙂</p>
            {supportAns === null ? (
              <div className="p3-card-actions"><button className="s1-btn ghost" onClick={() => setSupportAns("yes")}>Send the words</button><button className="s1-btn primary" onClick={() => setSupportAns("no")}><ShieldCheck size={15} /> Block & report</button></div>
            ) : supportAns === "no" ? <b>🛡️ Perfect! Real support NEVER asks for your seed phrase. That was a scammer.</b>
              : <b>💀 Oops! A scammer just emptied your wallet… Luckily this was practice. Remember: NEVER share your seed phrase.</b>}
          </div>
        )}
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!walletOk} onClick={() => setStage(1)}>{walletOk ? "Open the exchange" : "Complete the 3 security steps"} <ChevronRight size={18} /></button></div>
    </ActShell>
  );

  const c = COINS.find((x) => x.id === sel);
  const ev = EX_EVENTS[day];
  const hist = prices[sel].slice(0, day + 1);
  const from = Math.max(0, day - 14);
  const pnl = value - 1000000;

  if (stage === 2) {
    const holdBcr = 1000000 * (1 - EX_FEE) / prices.bcr[0] * prices.bcr[EX_DAYS];
    const n = COINS.filter((x) => (hold[x.id] || 0) * price(x.id) > 1000).length;
    const badges = [
      scams.blocked > 0 && scams.fell === 0 && supportAns === "no" ? ["🛡️", "Scam dodger", "You blocked every scam."] : null,
      scams.fell > 0 || supportAns === "yes" ? ["💀", "Scam victim", "You sent money or secrets to a scammer."] : null,
      flags.rug ? ["🧶", "Rug pulled", "You held MoonRocket when the creators ran away."] : null,
      flags.hype ? ["📣", "Bought the hype", "You bought DogeTaco during the influencer pump."] : null,
      flags.fomo && !flags.rug ? ["🏃", "Lucky escape", "You bought MoonRocket but got out before the rug pull."] : null,
      n >= 3 ? ["🧺", "Diversified", "You ended with 3 or more different assets."] : null,
      pnl > 0 ? ["📈", "In profit", `You ended with ${cop(value)}.`] : ["📉", "In loss", `You ended with ${cop(value)}.`],
    ].filter(Boolean);
    return (
      <ActShell icon={<Trophy size={22} strokeWidth={2.1} />} title="30 days later… 🏁" subtitle="Your results at the CREAR Crypto Exchange." onExit={onExit}>
        <div className="g73-score"><small>FINAL VALUE</small><b className={pnl >= 0 ? "good" : "bad"}>{cop(value)}</b><span>{pnl >= 0 ? "+" : ""}{cop(pnl)} ({fmtPct(pctChange(1000000, value), 1)}) · {log.length ? "" : "no trades · "}{scams.blocked} scams blocked</span></div>
        <div className="g74-badges">{badges.map(([e, t, d]) => <div key={t}><em>{e}</em><b>{t}</b><small>{d}</small></div>)}</div>
        <div className="g74-compare"><span>If you had bought only <b>₿ BitCrear</b> on day 1 and waited: <b>{cop(holdBcr)}</b></span><span>If you had kept your money in a <b>🐷 savings pocket</b> (8% a year): <b>{cop(1000000 * Math.pow(1.08, 30 / 365))}</b></span></div>
        <LineChart labels={Array.from({ length: 11 }, (_, i) => `D${i * 3}`)} series={COINS.filter((x) => x.id !== "scop").map((x) => ({ name: x.t, color: x.c, values: Array.from({ length: 11 }, (_, i) => Math.round((prices[x.id][i * 3] / x.p0) * 100)) }))} money={false} unit="" />
        <ChartLegend series={COINS.filter((x) => x.id !== "scop").map((x) => ({ name: `${x.e} ${x.t} (start = 100)`, color: x.c }))} />
        <div className="g73-mission big"><b>💡 Why crypto is exciting — and dangerous</b><span>Crypto never sleeps, anyone can join and some coins grew a lot. But in only 30 days you saw a pump and dump, a rug pull, a hack rumor and 3 scams. Rule: only a small % of money you can afford to lose, never your emergency fund.</span></div>
        <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(pnl >= 0 ? 40 : 32, { final: Math.round(value), pnl: Math.round(pnl), trades: log.length, scams, support: supportAns, badges: badges.map((b) => b[1]) })}>Save my results <span className="coin-tag"><Coins size={15} /> +{pnl >= 0 ? 40 : 32}</span></button></div>
      </ActShell>
    );
  }

  return (
    <div className="p1-act g74-exchange">
      <div className="g74-ex-top">
        <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Exit</button>
        <div><small>DAY</small><b>{day}/{EX_DAYS}</b></div>
        <div><small>CASH</small><b>{cop(cash)}</b></div>
        <div><small>TOTAL</small><b>{cop(value)}</b></div>
        <div className={pnl >= 0 ? "up" : "down"}><small>P&amp;L</small><b>{pnl >= 0 ? "+" : ""}{fmtPct(pctChange(1000000, value), 1)}</b></div>
      </div>
      <div className={`g74-ticker ${ev ? "hot" : ""}`}>{ev ? <><em>{ev.e}</em> <b>BREAKING:</b> {ev.h}</> : <><em>📡</em> Markets open 24/7. Fee per trade: 0.5%. Prices are game data.</>}</div>
      <div className="g74-ex-grid">
        <div className="g74-coins">
          {COINS.map((x) => { const p = price(x.id), prev = price(x.id, Math.max(0, day - 1)); const ch = pctChange(prev, p); return (
            <button key={x.id} type="button" className={`g74-coin ${sel === x.id ? "on" : ""} ${dead(x.id) ? "dead" : ""}`} onClick={() => setSel(x.id)} style={{ "--cc": x.c }}>
              <em>{x.e}</em><div><b>{x.t}</b><small>{x.n}</small></div>
              <Sparkline values={prices[x.id].slice(from, day + 1)} color={x.c} />
              <div className="g74-coin-p"><b>{fmtP(p)}</b><i className={day === 0 ? "" : ch >= 0 ? "up" : "down"}>{day === 0 ? "—" : fmtPct(ch, 1)}</i></div>
              {(hold[x.id] || 0) * p > 1 && <span className="g74-own">You own {cop((hold[x.id] || 0) * p)}</span>}
            </button>
          ); })}
        </div>
        <div className="g74-trade">
          <header><em>{c.e}</em><div><b>{c.n} · {c.t}</b><small>{c.d}</small></div><strong>{fmtP(price(sel))}</strong></header>
          {hist.length > 1 ? <LineChart labels={hist.map((_, i) => String(i)).slice(from)} series={[{ name: c.t, values: hist.slice(from).map((v) => +v.toFixed(v < 10 ? 2 : 0)), color: c.c }]} height={190} money={price(sel) >= 1000} /> : <p className="start-tip p1-center">📈 The chart appears after day 1.</p>}
          {dead(sel) ? <div className="p1-banner bad"><span>🧶 Trading stopped. The creators took the money. MOON is worth almost nothing.</span></div> : (
            <>
              <div className="g74-amt"><MoneyInput value={amt} onChange={setAmt} placeholder="Amount" />{[0.1, 0.25, 0.5, 1].map((f) => <button key={f} type="button" onClick={() => setAmt(String(Math.floor(cash * f)))}>{f === 1 ? "ALL" : `${f * 100}%`}</button>)}</div>
              <div className="g74-bs">
                <button className="buy" disabled={!num(amt) || num(amt) > cash + 1 || !!scam} onClick={() => trade("buy", num(amt))}>Buy {c.t}</button>
                <button className="sell" disabled={!(hold[sel] > 0) || !!scam} onClick={() => trade("sell", num(amt) || (hold[sel] || 0) * price(sel))}>{num(amt) ? `Sell ${cop(num(amt))}` : "Sell all"}</button>
              </div>
            </>
          )}
          <div className="g74-log">{log.length === 0 ? <small>No trades yet.</small> : log.map((l, i) => <small key={i}>D{l.d} · {l.t}</small>)}</div>
        </div>
      </div>
      {scam && (
        <div className={`g74-dm big ${scam.answered === "blocked" ? "ok" : scam.answered === "fell" ? "bad" : ""}`}>
          <small>💬 New message · {scam.from}</small>
          <p>{scam.msg}</p>
          {!scam.answered ? (
            <div className="p3-card-actions"><button className="s1-btn ghost" onClick={() => answerScam(true)}>{scam.cost === "all" ? "Send my words" : `Send ${cop(scam.cost)}`}</button><button className="s1-btn primary" onClick={() => answerScam(false)}><ShieldCheck size={15} /> Block &amp; report</button></div>
          ) : (
            <>
              <b>{scam.answered === "blocked" ? "🛡️ Blocked! Guaranteed returns, urgency and secret words = SCAM." : "💀 It was a scam. The money is gone forever — crypto transfers can't be reversed."}</b>
              <div className="p3-card-actions"><button className="s1-btn primary" onClick={() => setScam(null)}>Continue trading</button></div>
            </>
          )}
        </div>
      )}
      <div className="g74-ex-ctrl">
        {day < EX_DAYS ? (
          <>
            <button className="s1-btn ghost" disabled={!!scam} onClick={() => setAuto(!auto)}>{auto ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Auto-play</>}</button>
            <button className="s1-btn primary big" disabled={!!scam || auto} onClick={advance}>Next day <ChevronRight size={18} /></button>
          </>
        ) : <button className="s1-btn primary big" onClick={() => setStage(2)}>Close the market — see results <Trophy size={16} /></button>}
      </div>
    </div>
  );
}

/* ---------- FINTECH OR FAKE? ---------- */
const FAKE_CARDS = [
  { e: "👑", kind: "Instagram ad", from: "CryptoKing Academy", lines: ["Earn 5% EVERY DAY — guaranteed! 💸", "Only 24 hours left!", "Bring 3 friends and earn double."], fake: true, flags: ["Guaranteed high returns", "Urgency: “only 24 hours”", "Pay for bringing friends = pyramid"] },
  { e: "🏦", kind: "Official app", from: "Your bank's app · official store · 4.6★", lines: ["Protect your account:", "Activate two-factor authentication (2FA)."], fake: false, flags: ["Official app store", "It ADDS security, it doesn't ask for secrets"] },
  { e: "📩", kind: "SMS", from: "CREAR Bankk", lines: ["Your account is BLOCKED.", "Enter your password here: crear-bank-secure.info"], fake: true, flags: ["Strange name (two k's)", "Asks for your password", "Fake link that copies the bank"] },
  { e: "🧺", kind: "Investment app", from: "FondoFácil · authorized by the Superintendencia Financiera", lines: ["Fund return last year: 9.8%", "“Past returns do not guarantee future results.”"], fake: false, flags: ["Authorized company", "Honest warning about risk", "Realistic return"] },
  { e: "🏎️", kind: "TikTok video", from: "@richkid_trader", lines: ["I made $50 MILLION in one month with my robot 🤖", "Send me a DM to get it!"], fake: true, flags: ["Unrealistic profits", "Luxury photos as “proof”", "Contact by private message"] },
  { e: "📱", kind: "Digital wallet", from: "Wallet app · official store", lines: ["Pay with a QR code.", "Enter your PIN only inside the app."], fake: false, flags: ["PIN only inside the official app", "Normal QR payment"] },
  { e: "🐶", kind: "Website", from: "MOONDOG token presale", lines: ["The team is anonymous for “security”.", "10,000% return! Buy before it lists!"], fake: true, flags: ["Anonymous creators", "Impossible return", "Rug-pull style presale"] },
  { e: "🪪", kind: "Crypto exchange", from: "Registered exchange", lines: ["To open your account, upload your ID (KYC).", "⚠️ Crypto is volatile. You can lose money."], fake: false, flags: ["Checks your identity (KYC)", "Warns you about the risk"] },
  { e: "📞", kind: "Phone call", from: "“Bank security team”", lines: ["We detected a fraud!", "Tell me the code we just sent to your phone to cancel it."], fake: true, flags: ["Asks for your code", "Creates fear and urgency", "Banks never ask for codes"] },
  { e: "🐷", kind: "Digital bank", from: "Savings pocket", lines: ["Pocket rate: 8% a year.", "Deposits protected by deposit insurance."], fake: false, flags: ["Realistic rate", "Protected deposits"] },
  { e: "🎁", kind: "Website", from: "Official BitCrear Giveaway", lines: ["Send 0.1 BCR and receive 0.2 BCR back!", "Thousands already won!"], fake: true, flags: ["“Send to receive double”", "Nobody gives free money", "Fake “winners”"] },
  { e: "💬", kind: "WhatsApp", from: "Unknown number · “It's me, your cousin!”", lines: ["I changed my number.", "I urgently need $300,000. I'll pay you tomorrow!"], fake: true, flags: ["New unknown number", "Urgent money request", "Call your cousin to check"] },
  { e: "📷", kind: "App permission", from: "Wallet app", lines: ["Allow camera access?", "Only to scan QR codes for payments."], fake: false, flags: ["The permission matches the function", "It explains why"] },
];
function FintechOrFake({ onSave, onExit }) {
  const deck = useMemo(() => shuffleArr(FAKE_CARDS), []);
  const [i, setI] = useState(0);
  const [ans, setAns] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [st, finish] = useFinish(onSave);
  const c = deck[i];
  const answer = (fake) => { if (ans !== null) return; const ok = fake === c.fake; setAns({ fake, ok }); if (ok) { setScore(score + 1); setStreak(streak + 1); setBest(Math.max(best, streak + 1)); } else setStreak(0); };
  const next = () => { if (i === deck.length - 1) { finish(score * 3 + 6, { score, total: deck.length, best }); return; } setI(i + 1); setAns(null); };
  if (st.done) return <Reward title={`Fraud detective! 🕵️ ${score}/${deck.length}`} subtitle={`Best streak: ${best} 🔥`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="FinTech or Fake? 🕵️" subtitle="Read each screen. Is it a real FinTech service — or a scam?" onExit={onExit}>
      <HowTo>Look for <b>red flags</b>: guaranteed returns, urgency, asking for secrets, strange links, anonymous creators. Look for <b>green signs</b>: official stores, authorized companies, honest risk warnings.</HowTo>
      <div className="p1-match-stats"><span>Card <b>{i + 1}/{deck.length}</b> · Score <b>{score}</b></span><span>Streak <b>{streak}</b> 🔥</span></div>
      <div className={`g74-fcard ${ans ? (ans.fake ? "left" : "right") : ""}`} key={i}>
        <small>{c.kind}</small>
        <header><em>{c.e}</em><b>{c.from}</b></header>
        {c.lines.map((l) => <p key={l}>{l}</p>)}
        {ans && <div className={`g74-stamp ${c.fake ? "fake" : "legit"}`}>{c.fake ? "🚩 FAKE" : "✅ LEGIT"}</div>}
      </div>
      {!ans ? (
        <div className="g74-swipe"><button type="button" className="fake" onClick={() => answer(true)}>🚩 Fake</button><button type="button" className="legit" onClick={() => answer(false)}>✅ Legit</button></div>
      ) : (
        <>
          <div className={`g72-conseq ${ans.ok ? "f2" : "f0"}`}><b>{ans.ok ? "✅ Correct!" : "❌ Not this time."} It is {c.fake ? "a SCAM" : "a real service"}.</b>{c.flags.map((f) => <span key={f}>{c.fake ? "🚩" : "✅"} {f}</span>)}</div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{i === deck.length - 1 ? "See my score" : "Next card"} <ChevronRight size={18} /></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- MY SAFE DIGITAL TOOLKIT (Pieza 04) ---------- */
const DIG_TOOLS = [["wallet", "📱", "Digital wallet for payments"], ["pocket", "🐷", "Savings pockets"], ["budget", "📊", "Budget app"], ["fund", "🧺", "Investment fund app"], ["qr", "🔳", "QR payments"], ["crypto", "🪙", "A small crypto wallet"], ["bank", "🏦", "My bank's official app"]];
const HABITS = [
  { id: "2fa", t: "Turn on 2FA in every money app", good: true }, { id: "pw", t: "Different strong password for each app", good: true },
  { id: "store", t: "Download apps only from official stores", good: true }, { id: "seed", t: "Keep my seed phrase on paper, never online", good: true },
  { id: "link", t: "Never click links in strange messages", good: true }, { id: "auth", t: "Check that the company is authorized", good: true },
  { id: "wifi", t: "No money apps on public Wi-Fi", good: true }, { id: "call", t: "Call the person or bank to verify urgent requests", good: true },
  { id: "share", t: "Share my codes only with friendly support agents", good: false, why: "Real support NEVER asks for your codes, PIN or seed phrase." },
  { id: "same", t: "Use one easy password so I don't forget it", good: false, why: "If one app is hacked, ALL your accounts are in danger." },
];
const FLAG_OPTS = ["Guaranteed high returns", "Urgency (“only today!”)", "Pay to bring friends", "Asking for codes or seed phrases", "Anonymous creators", "Strange links or names", "Unrealistic luxury “proof”"];
function SafeToolkit({ resp, existing, onSave, onExit }) {
  const ex = resp?.c37_exchange;
  const [tools, setTools] = useState(existing?.toolIds || []);
  const [habits, setHabits] = useState(existing?.habitIds || []);
  const [cryptoMax, setCryptoMax] = useState(existing?.cryptoMax ?? 5);
  const [flags, setFlags] = useState(existing?.flags || []);
  const [promise, setPromise] = useState(existing?.promise || "");
  const [st, finish] = useFinish(onSave);
  const tg = (arr, set, id) => set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  const bad = habits.map((id) => HABITS.find((h) => h.id === id)).filter((h) => !h.good);
  const goodN = habits.length - bad.length;
  const ready = tools.length >= 3 && goodN >= 4 && bad.length === 0 && flags.length >= 3 && countWords(promise) >= 6;
  if (st.done) return <Reward title="Digital shield activated! 🔐" subtitle="Piece 04 of your Financial Future Portfolio." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Lock size={22} strokeWidth={2.1} />} title="My Safe Digital Toolkit 🔐" subtitle="Which digital tools will you use — and how will you protect them?" onExit={onExit}>
      <PieceBadge n="04" />
      {ex && <div className="g74-remind"><b>🚀 Your Crypto Exchange results:</b><span>Final {cop(ex.final)} ({ex.pnl >= 0 ? "+" : ""}{cop(ex.pnl)})</span>{(ex.badges || []).map((b) => <span key={b}>{b}</span>)}</div>}
      <div className="start-block">
        <h3><span className="step-n">1</span> My digital tools (choose 3+)</h3>
        <div className="g72-opts">{DIG_TOOLS.map(([id, e, l]) => <button key={id} type="button" className={`g72-opt ${tools.includes(id) ? "on" : ""}`} onClick={() => tg(tools, setTools, id)}><em>{e}</em><span>{l}</span></button>)}</div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> My security habits (choose 4+ good ones)</h3>
        <div className="g74-rules">{HABITS.map((h) => <button key={h.id} type="button" className={habits.includes(h.id) ? (h.good ? "on" : "bad") : ""} onClick={() => tg(habits, setHabits, h.id)}>{habits.includes(h.id) ? (h.good ? "✅ " : "🚩 ") : ""}{h.t}</button>)}</div>
        {bad.map((h) => <div key={h.id} className="p1-banner bad"><span>🚩 <b>{h.t}</b>: {h.why}</span></div>)}
      </div>
      <div className="start-block">
        <h3><span className="step-n">3</span> My crypto rule</h3>
        {Ctl({ l: "🪙 Max % of my investments", v: cryptoMax, set: setCryptoMax, mn: 0, mx: 30, stp: 1, fmt: (x) => `${x}%` })}
        <p className={`start-tip ${cryptoMax > 10 ? "neg" : ""}`}>{cryptoMax === 0 ? "No crypto for me — totally valid!" : cryptoMax <= 10 ? `✅ Only ${cryptoMax}%, and only money I can afford to lose — after my emergency fund.` : "⚠️ More than 10% is very risky. Remember the rug pull!"}</p>
      </div>
      <div className="start-block">
        <h3><span className="step-n">4</span> Red flags I will never ignore (choose 3+)</h3>
        <div className="g74-chips">{FLAG_OPTS.map((f) => <button key={f} type="button" className={flags.includes(f) ? "on" : ""} onClick={() => tg(flags, setFlags, f)}>🚩 {f}</button>)}</div>
        <div className="p3-sentence edit"><span>If someone promises me guaranteed returns, I will</span><input className="start-input" value={promise} onChange={(e) => setPromise(e.target.value)} placeholder="Write your answer here…" /></div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready || cryptoMax > 10} onClick={() => finish(30, { toolIds: tools, habitIds: habits, tools: tools.map((id) => DIG_TOOLS.find((t) => t[0] === id)[2]), habits: habits.map((id) => HABITS.find((h) => h.id === id).t), cryptoMax, flags, promise })}>{cryptoMax > 10 ? "Lower your crypto %" : "Save Piece 04"} <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   BLOQUE 5 · CLASE 38 · ETHICAL & SUSTAINABLE FINANCE · SDGs (ODS)
   ===================================================================== */
const SDGS = [
  [1, "🏠", "No poverty"], [2, "🍲", "Zero hunger"], [3, "❤️", "Good health"], [4, "📚", "Quality education"], [5, "⚧", "Gender equality"], [6, "💧", "Clean water"],
  [7, "☀️", "Clean energy"], [8, "💼", "Decent work"], [9, "🏗️", "Innovation"], [10, "🤝", "Less inequality"], [11, "🏙️", "Sustainable cities"], [12, "♻️", "Responsible consumption"],
  [13, "🌍", "Climate action"], [14, "🐠", "Life below water"], [15, "🌳", "Life on land"], [16, "🕊️", "Peace & justice"], [17, "🔗", "Partnerships"],
];
const sdg = (n) => SDGS.find((s) => s[0] === n);
function SdgWheel({ lit = [], size = "md" }) {
  return <div className={`g74-sdgs ${size}`}>{SDGS.map(([n, e, l]) => <span key={n} className={lit.includes(n) ? "on" : ""} title={`SDG ${n} · ${l}`}><i>{n}</i>{e}</span>)}</div>;
}

const GREEN_CARDS = [
  { e: "💧", co: "EcoFresh Water", claim: "“Natural & eco-friendly bottles 🌿”", ev: ["Bottles: 100% NEW plastic", "No recycling program", "No certification of any kind"], green: false, why: "Vague words (“natural”, “eco”) with zero evidence." },
  { e: "☀️", co: "SolCaribe Energy", claim: "“We install solar panels in schools in La Guajira.”", ev: ["1,200 panels installed (public report)", "Independent audit every year", "−900 tons of CO₂ a year"], green: true, why: "Numbers, a public report and an independent audit." },
  { e: "👕", co: "FastFashion Mega", claim: "“Discover our new GREEN collection 🌱”", ev: ["The green collection = 2% of its clothes", "No reports about workers or water use", "1 billion garments made every year"], green: false, why: "A tiny green action hides a huge impact." },
  { e: "☕", co: "Café Montaña Cooperative", claim: "“Fair trade coffee from Colombian farmers.”", ev: ["Fair Trade certification", "Pays farmers 20% above market price", "Reforests 50 hectares a year"], green: true, why: "Certified, with clear social and environmental numbers." },
  { e: "🛢️", co: "PetroMax Oil", claim: "TV ad with forests and birds: “We love the planet.”", ev: ["99% of its investment is in new oil wells", "Plants 1,000 trees a year", "2 oil spills last year"], green: false, why: "Green images, but the business does the opposite." },
  { e: "🚲", co: "BiciRuta App", claim: "“Every trip helps your city breathe.”", ev: ["2 million trips → 1,800 t of CO₂ avoided", "Old bikes are repaired and reused", "Publishes a yearly impact report"], green: true, why: "Measurable impact and transparent reports." },
  { e: "🏦", co: "GreenBank “Eco Account”", claim: "“Save money and save the planet!”", ev: ["Only the card is made of recycled plastic", "The bank finances new coal mines", "No data about its loans"], green: false, why: "A recycled card doesn't change where the money goes." },
  { e: "🪑", co: "ReciPlast Startup", claim: "“We turn plastic bottles into school desks.”", ev: ["300 tons of plastic processed (verified)", "Recyclers hired with fair contracts", "Desks donated to 40 schools"], green: true, why: "Verified numbers + good social impact (the S in ESG)." },
  { e: "🍔", co: "Burger Planet", claim: "“The world's first CARBON NEUTRAL burger!”", ev: ["Buys cheap carbon credits, no reduction plan", "No independent verification", "Meat production grew 30%"], green: false, why: "Paying to “cancel” pollution without reducing it." },
  { e: "🚌", co: "City Metro Green Bond", claim: "“A green bond to buy electric buses.”", ev: ["Money can ONLY be used for electric buses", "Independent external review", "Annual impact report for investors"], green: true, why: "A green bond with clear rules and reports." },
];
function GreenOrGreenwash({ onSave, onExit }) {
  const deck = useMemo(() => shuffleArr(GREEN_CARDS), []);
  const [i, setI] = useState(0);
  const [seen, setSeen] = useState(false);
  const [ans, setAns] = useState(null);
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState(0);
  const [st, finish] = useFinish(onSave);
  const c = deck[i];
  const answer = (green) => { if (ans !== null) return; const ok = green === c.green; setAns({ green, ok }); if (ok) setScore(score + 1); };
  const next = () => { if (i === deck.length - 1) { finish(score * 3 + checked + 4, { score, total: deck.length, checked }); return; } setI(i + 1); setAns(null); setSeen(false); };
  if (st.done) return <Reward title={`Greenwashing hunter! 🌱 ${score}/${deck.length}`} subtitle="You ask for evidence, not just green leaves." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Leaf size={22} strokeWidth={2.1} />} title="Green or Greenwashing? 🌱" subtitle="10 companies say they are green. Which ones can prove it?" onExit={onExit}>
      <HowTo>Read the claim. Tap <i>🔍 Check the evidence</i> (detectives get +1 coin). Then decide: <b>🌱 Real green</b> or <b>🎭 Greenwashing</b>. Remember: real green = numbers + certification + complete reports.</HowTo>
      <div className="p1-match-stats"><span>Company <b>{i + 1}/{deck.length}</b> · Score <b>{score}</b></span><span>🔍 Evidence checked: <b>{checked}</b></span></div>
      <div className="g74-gcard" key={i}>
        <header><em>{c.e}</em><b>{c.co}</b></header>
        <p className="claim">{c.claim}</p>
        {!seen ? <button type="button" className="s1-btn ghost" onClick={() => { setSeen(true); setChecked(checked + 1); }}><Search size={15} /> Check the evidence</button>
          : <div className="g74-evidence">{c.ev.map((x) => <span key={x}>📋 {x}</span>)}</div>}
        {ans && <div className={`g74-stamp ${c.green ? "legit" : "fake"}`}>{c.green ? "🌱 REAL GREEN" : "🎭 GREENWASHING"}</div>}
      </div>
      {!ans ? (
        <div className="g74-swipe"><button type="button" className="fake" onClick={() => answer(false)}>🎭 Greenwashing</button><button type="button" className="legit" onClick={() => answer(true)}>🌱 Real green</button></div>
      ) : (
        <>
          {!seen && <div className="g74-evidence after">{c.ev.map((x) => <span key={x}>📋 {x}</span>)}</div>}
          <div className={`g72-conseq ${ans.ok ? "f2" : "f0"}`}><b>{ans.ok ? "✅ Correct!" : "❌ Not this time."}</b><span>{c.why}</span></div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{i === deck.length - 1 ? "See my score" : "Next company"} <ChevronRight size={18} /></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- SDG IMPACT FUND ---------- */
const IMPACT_CO = [
  { id: "sun", e: "🌞", n: "SunSchool", d: "Solar panels for rural schools.", sdg: [7, 4, 13], r: 9, risk: 2, imp: 5, out: "4,000 students now study with light and internet." },
  { id: "agro", e: "👩‍🌾", n: "MujerAgro", d: "Microcredits for women farmers.", sdg: [1, 5, 8], r: 7, risk: 3, imp: 5, out: "1,200 women started or grew their farms." },
  { id: "reci", e: "♻️", n: "ReciPlast", d: "School desks made from recycled plastic.", sdg: [12, 13, 4], r: 10, risk: 3, imp: 4, out: "500 tons of plastic out of rivers and streets." },
  { id: "bus", e: "🚌", n: "E-Bus Cali", d: "Leasing electric buses to the city.", sdg: [11, 13, 7], r: 11, risk: 2, imp: 4, out: "60 electric buses: cleaner air for 300,000 people." },
  { id: "agua", e: "💧", n: "AguaPura", d: "Water filters for rural communities.", sdg: [6, 3], r: 6, risk: 2, imp: 5, out: "25,000 people drink clean water." },
  { id: "tutor", e: "🤖", n: "AI Tutor", d: "Cheap online English classes with AI.", sdg: [4, 10], r: 15, risk: 4, imp: 3, out: "80,000 students practice English for free." },
  { id: "rampa", e: "♿", n: "Rampa", d: "Accessibility app for people with disabilities.", sdg: [10, 11], r: 8, risk: 3, imp: 4, out: "9,000 users move around the city more easily." },
  { id: "cheap", e: "🔆", n: "CheapSolar Ltd", d: "The cheapest solar panels in the market.", sdg: [7, 13], r: 18, risk: 3, imp: 4, trap: "Factory audit: workers under 16, no safety rules. The CEO refuses to publish reports.", out: "SCANDAL: child labor discovered. Stores stop selling. The company closes." },
  { id: "oil", e: "🛢️", n: "QuickOil Fracking", d: "New oil wells with fracking.", sdg: [8], r: 20, risk: 4, imp: 1, trap: "Neighbors report polluted water. No environmental license yet.", out: "Big profits… and polluted rivers. Communities protest." },
];
const FUND_TOTAL = 100000000;
function SdgFund({ onSave, onExit }) {
  const [sel, setSel] = useState([]);
  const [dd, setDd] = useState({});
  const [stage, setStage] = useState(0);
  const [res] = useState(() => Object.fromEntries(IMPACT_CO.map((c) => [c.id, c.id === "cheap" ? -100 : Math.round(c.r + (Math.random() - 0.5) * c.risk * 4)])));
  const [st, finish] = useFinish(onSave);
  const picks = IMPACT_CO.filter((c) => sel.includes(c.id));
  const each = FUND_TOTAL / 4;
  const avgR = picks.length ? picks.reduce((a, c) => a + c.r, 0) / picks.length : 0;
  const imp = picks.reduce((a, c) => a + c.imp, 0);
  const goals = [...new Set(picks.flatMap((c) => c.sdg))];
  const risky = picks.filter((c) => c.risk >= 4).length;
  const missions = [["4 companies chosen", picks.length === 4], ["Average return ≥ 8%", avgR >= 8], ["Impact ≥ 16 / 20", imp >= 16], ["5+ different SDGs", goals.length >= 5], ["Max 1 high-risk company", risky <= 1]];
  const ok = missions.every((m) => m[1]);
  const toggle = (id) => setSel(sel.includes(id) ? sel.filter((x) => x !== id) : sel.length < 4 ? [...sel, id] : sel);
  const final = picks.reduce((a, c) => a + each * Math.pow(1 + res[c.id] / 100, c.id === "cheap" ? 1 : 3), 0);
  const trapped = picks.filter((c) => c.trap);
  if (st.done) return <Reward title="Impact investor! 🌍" subtitle="Money with a purpose: return + real impact." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title="SDG Impact Fund 🌍" subtitle="You manage $100,000,000. Choose 4 companies. Make money AND change the world." onExit={onExit}>
      {stage === 0 ? (
        <>
          <HowTo>Each company gets <b>$25,000,000</b>. Complete the 5 missions. Tip: open the <i>🔍 Due diligence</i> of each company before you invest — some hide bad secrets!</HowTo>
          <div className="g73-checklist">{missions.map(([l, v]) => <span key={l} className={v ? "ok" : ""}>{v ? "✅" : "○"} {l}</span>)}</div>
          <div className="g72-meters">
            <Meter value={Math.round(clamp(avgR * 5, 0, 100))} color="#16b074" label={`📈 Avg. return ${avgR.toFixed(1)}%`} />
            <Meter value={Math.round((imp / 20) * 100)} color="#f5b23e" label={`🌍 Impact ${imp}/20`} />
          </div>
          <SdgWheel lit={goals} />
          <div className="g74-impact">
            {IMPACT_CO.map((c) => (
              <div key={c.id} className={`g74-ico ${sel.includes(c.id) ? "on" : ""}`}>
                <header><em>{c.e}</em><div><b>{c.n}</b><small>{c.d}</small></div></header>
                <div className="g74-ico-sdg">{c.sdg.map((n) => <span key={n}>{sdg(n)[1]} {n}</span>)}</div>
                <div className="g74-ico-nums"><span>📈 {c.r}%</span><span>{chilis(c.risk)}</span><span>🌍 {"★".repeat(c.imp)}{"☆".repeat(5 - c.imp)}</span></div>
                {dd[c.id] ? <p className={`g74-dd ${c.trap ? "bad" : ""}`}>{c.trap ? `🚩 ${c.trap}` : "✅ Clean audit. Transparent reports. Fair contracts."}</p>
                  : <button type="button" className="p1-link" onClick={() => setDd({ ...dd, [c.id]: true })}><Search size={14} /> Due diligence</button>}
                <button type="button" className={`s1-btn ${sel.includes(c.id) ? "primary" : "ghost"}`} disabled={!sel.includes(c.id) && sel.length >= 4} onClick={() => toggle(c.id)}>{sel.includes(c.id) ? <><Check size={15} /> Invested</> : "Invest $25M"}</button>
              </div>
            ))}
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => setStage(1)}>{ok ? "Launch my fund — jump 3 years" : "Complete the 5 missions"} <Rocket size={16} /></button></div>
        </>
      ) : (
        <>
          <div className="g73-score"><small>MY FUND AFTER 3 YEARS</small><b className={final >= FUND_TOTAL ? "good" : "bad"}>{cop(final)}</b><span>{fmtPct(pctChange(FUND_TOTAL, final), 1)} · {goals.length} SDGs supported</span></div>
          <div className="g74-impact results">
            {picks.map((c) => (
              <div key={c.id} className={`g74-ico ${c.trap ? "trap" : "on"}`}>
                <header><em>{c.e}</em><div><b>{c.n}</b><small>{c.id === "cheap" ? "−100%" : `${res[c.id] > 0 ? "+" : ""}${res[c.id]}% a year`}</small></div></header>
                <p>{c.trap ? "🚨 " : "🌍 "}{c.out}</p>
              </div>
            ))}
          </div>
          <SdgWheel lit={goals.filter((n) => !trapped.some((t) => t.sdg.includes(n) && !picks.some((p) => !p.trap && p.sdg.includes(n))))} />
          {trapped.length > 0 ? <div className="p1-banner bad"><span>🚩 You invested in <b>{trapped.map((t) => t.n).join(" and ")}</b>. The due diligence showed the danger. Ethics is also a RISK: bad companies can collapse.</span></div>
            : <div className="p1-banner good"><span>🌟 Clean portfolio: you checked ESG risks. Ethical companies are often safer in the long term.</span></div>}
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(trapped.length ? 26 : 38, { picks: picks.map((c) => c.n), sdgs: goals, final: Math.round(final), impact: imp, trapped: trapped.map((t) => t.n), diligence: Object.keys(dd).length })}>Publish my impact report <span className="coin-tag"><Coins size={15} /> +{trapped.length ? 26 : 38}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- MY GLOBAL COMMITMENT (Pieza 05) ---------- */
const GREEN_HABITS = ["Buy from local businesses", "Carry a reusable bottle and bag", "Repair before buying new", "Avoid fast fashion", "Use the bus, bike or walk", "Compare ESG before investing", "Volunteer in my community", "Turn off lights and save water", "Recycle at home and at school"];
const ESG_RULES = ["I will check E, S and G before investing.", "I will never invest in companies with child labor.", "I will ask for evidence, not green slogans.", "I will put part of my investments in impact funds or green bonds."];
function GlobalPledge({ resp, existing, onSave, onExit }) {
  const [goals, setGoals] = useState(existing?.sdgs || []);
  const [habits, setHabits] = useState(existing?.habits || []);
  const [rule, setRule] = useState(existing?.ruleIdx ?? null);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const tg = (arr, set, v, max) => set(arr.includes(v) ? arr.filter((x) => x !== v) : arr.length < max ? [...arr, v] : arr);
  const ready = goals.length === 3 && habits.length >= 3 && rule !== null && countWords(text) >= 25;
  if (st.done) return <Reward title="Global citizen! 🌍" subtitle="Piece 05 of your Financial Future Portfolio." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title="My Global Commitment 🤝" subtitle="Your money votes. What world do you want to vote for?" onExit={onExit}>
      <PieceBadge n="05" />
      <div className="start-block">
        <h3><span className="step-n">1</span> My 3 SDGs (the goals I care about most)</h3>
        <div className="g74-sdgs pick">{SDGS.map(([n, e, l]) => <button key={n} type="button" className={goals.includes(n) ? "on" : ""} onClick={() => tg(goals, setGoals, n, 3)}><i>{n}</i>{e}<small>{l}</small></button>)}</div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> My habits as a consumer (choose 3+)</h3>
        <div className="g74-chips">{GREEN_HABITS.map((h) => <button key={h} type="button" className={habits.includes(h) ? "on" : ""} onClick={() => tg(habits, setHabits, h, 9)}>{h}</button>)}</div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">3</span> My rule as an investor</h3>
        <div className="g72-opts">{ESG_RULES.map((r, k) => <button key={r} type="button" className={`g72-opt ${rule === k ? "on" : ""}`} onClick={() => setRule(k)}><em>⚖️</em><span>{r}</span></button>)}</div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">4</span> My pledge (25–90 words)</h3>
        <p className="start-tip">Explain your 3 SDGs, one habit and how you will use your money to help.</p>
        <Starters items={["I care about SDG", "because", "As a consumer, I will", "As a future investor,", "My money will"]} onPick={appendStarter(setText)} />
        <WordField value={text} onChange={setText} min={25} max={90} rows={5} placeholder="Write your pledge here…" />
      </div>
      {goals.length > 0 && <div className="g74-pledge-card"><small>MY GLOBAL COMMITMENT</small><div>{goals.map((n) => <span key={n}>{sdg(n)[1]} SDG {n} · {sdg(n)[2]}</span>)}</div></div>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { sdgs: goals, habits, ruleIdx: rule, rule: ESG_RULES[rule], text })}>Save Piece 05 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   BLOQUE 6 · CLASES 39–40 · GROWING A SUSTAINABLE BUSINESS & LEADERSHIP
   ===================================================================== */
const GROW_MOVES = [
  { id: "machine", e: "🛠️", n: "A new machine", d: "+40% production capacity, −5% cost per unit.", cost: (b) => b.fixed * 2.5, crowd: false, apply: (g) => ({ ...g, cap: g.cap * 1.4, vc: g.vc * 0.95 }) },
  { id: "ads", e: "📣", n: "Marketing campaign", d: "+20% customers.", cost: (b) => b.fixed * 0.8, crowd: true, apply: (g) => ({ ...g, demand: g.demand * 1.2 }) },
  { id: "hire", e: "👩‍🍳", n: "Hire 2 people", d: "+50% capacity, fixed costs +35%, team ❤️ +10.", cost: () => 0, crowd: false, apply: (g, b) => ({ ...g, cap: g.cap * 1.5, fixed: g.fixed + b.fixed * 0.35, morale: Math.min(100, g.morale + 10) }) },
  { id: "store2", e: "🏪", n: "Second location", d: "+60% customers and capacity, fixed costs +60%.", cost: (b) => b.fixed * 4, crowd: false, once: true, apply: (g, b) => ({ ...g, cap: g.cap * 1.6, demand: g.demand * 1.6, fixed: g.fixed + b.fixed * 0.6 }) },
  { id: "online", e: "🌐", n: "Online store", d: "+25% customers from all the city.", cost: (b) => b.fixed * 1.2, crowd: true, once: true, apply: (g) => ({ ...g, demand: g.demand * 1.25 }) },
  { id: "eco", e: "🌱", n: "Eco packaging", d: "Cost per unit +4%, planet 🌍 +25, +6% customers.", cost: (b) => b.fixed * 0.5, crowd: true, once: true, apply: (g) => ({ ...g, vc: g.vc * 1.04, eco: Math.min(100, g.eco + 25), demand: g.demand * 1.06 }) },
];
const FUNDS4 = [
  { id: "cash", e: "💵", n: "My cash", d: "Free, but your cushion gets smaller." },
  { id: "bank", e: "🏦", n: "Bank loan", d: "1.8% a month · 12 months. The bank checks your capacity to pay." },
  { id: "card", e: "💳", n: "Credit card", d: "2.9% a month · 6 months. Fast… and very expensive." },
  { id: "investor", e: "🤝", n: "Investor", d: "No installments — but you give part of your company." },
  { id: "crowd", e: "🌐", n: "Crowdfunding pre-sales", d: "Fans pay before. You deliver products (≈40% of the money in costs)." },
];
const SCALE_EVENTS = [
  { id: "order", e: "📦", h: "A supermarket wants a BIG order!", d: "+50% sales for 2 months… but they pay 60 days later.", ch: [["Negotiate a 30% advance", (g) => ({ ...g, boost: 1.5, advance: 0.3 })], ["Accept and wait for the money", (g) => ({ ...g, boost: 1.5, advance: 0 })], ["Say no — too risky for my cash", (g) => g]] },
  { id: "supplier", e: "🧈", h: "Your main supplier raises prices 15%", d: "Your cost per unit goes up.", ch: [["Find a new local supplier (+5% only)", (g) => ({ ...g, vc: g.vc * 1.05 })], ["Accept the new price", (g) => ({ ...g, vc: g.vc * 1.15 })], ["Raise my price 10%", (g) => ({ ...g, vc: g.vc * 1.15, price: g.price * 1.1, demand: g.demand * 0.9 })]] },
  { id: "viral", e: "🔥", h: "A customer's video about you goes viral!", d: "+30% customers want your product.", ch: [["Great! Thank the customer publicly", (g) => ({ ...g, demand: g.demand * 1.3, rep: Math.min(100, g.rep + 10) })]] },
  { id: "rival", e: "🏁", h: "A competitor opens next door", d: "You could lose 20% of your customers.", ch: [["Improve quality and service", (g, b) => ({ ...g, cash: g.cash - b.fixed * 0.4, demand: g.demand * 0.95, rep: Math.min(100, g.rep + 10) })], ["Lower my price 10%", (g) => ({ ...g, price: g.price * 0.9, demand: g.demand * 0.98 })], ["Do nothing", (g) => ({ ...g, demand: g.demand * 0.8 })]] },
  { id: "tired", e: "😮‍💨", h: "Your team is exhausted", d: "Too many orders and long days. Mistakes are increasing.", ch: [["Rotate shifts and give a day off", (g) => ({ ...g, morale: Math.min(100, g.morale + 20), cap: g.cap * 0.97 })], ["Pay an overtime bonus", (g, b) => ({ ...g, cash: g.cash - b.fixed * 0.3, morale: Math.min(100, g.morale + 10) })], ["Ignore it, business is business", (g) => ({ ...g, morale: Math.max(0, g.morale - 30) })]] },
  { id: "broken", e: "⚡", h: "A power cut damaged your equipment", d: "The repair is urgent.", ch: [["Pay with my cash", (g, b) => ({ ...g, cash: g.cash - b.fixed * 0.6 })], ["Pay with the credit card (6 months)", (g, b) => ({ ...g, debts: [...g.debts, { n: "💳 Repair", inst: pmt(b.fixed * 0.6, 0.029, 6), left: 6 }] })]] },
  { id: "award", e: "🏅", h: "City Green Business Award", d: "Only businesses with 🌍 planet ≥ 60 can win.", ch: [["Apply for the award", (g) => (g.eco >= 60 ? { ...g, demand: g.demand * 1.15, rep: Math.min(100, g.rep + 15), note: "🏅 You WON! +15% customers." } : { ...g, note: "😕 Not enough eco actions. Try eco packaging!" })]] },
  { id: "tax", e: "🧾", h: "Tax time!", d: "You pay 10% of the profit of the last two months.", ch: [["Pay my taxes on time", (g) => ({ ...g, cash: g.cash - Math.max(0, g.lastProfit) * 0.1, rep: Math.min(100, g.rep + 5) })]] },
];
const valuation = (g) => Math.max(0, Math.round((g.demandSold * (g.price - g.vc) - g.fixed) * 24));
function scaleStart(b, p3) {
  const debt = p3?.c28_pitch?.inst ? [{ n: "🏦 Period 3 loan", inst: p3.c28_pitch.inst, left: Math.max(1, (p3.c28_pitch.term || 12) - 6) }] : [];
  return { m: 0, cash: Math.round(b.fixed * 1.5), demand: b.units, cap: b.units * 1.1, price: b.price, vc: b.varCost, fixed: b.fixed, debts: debt, own: p3?.c27_fund?.ownership || 100, morale: 70, eco: 35, rep: 50, boost: 1, advance: 0, pendingIn: 0, lastProfit: 0, demandSold: b.units, hist: [{ m: 0, cash: Math.round(b.fixed * 1.5), profit: 0 }], broke: null, moves: [], used: {} };
}
function run2(g0) {
  let g = { ...g0, debts: g0.debts.map((d) => ({ ...d })) }; let prof2 = 0;
  for (let k = 0; k < 2; k++) {
    const dem = g.demand * (g.boost || 1);
    const sold = Math.min(dem, g.cap) * (g.morale < 40 ? 0.88 : 1);
    const extra = Math.max(0, sold - Math.min(g.demand, g.cap));
    const revNow = (sold - extra) * g.price + extra * g.price * (g.advance || 0);
    const late = extra * g.price * (1 - (g.advance || 0));
    const inst = g.debts.reduce((a, d) => a + d.inst, 0);
    const profit = sold * (g.price - g.vc) - g.fixed;
    g.cash = g.cash + revNow - sold * g.vc - g.fixed - inst + (k === 0 ? g.pendingIn : 0);
    g.pendingIn = k === 0 ? 0 : g.pendingIn;
    g.pendingIn += late;
    g.debts = g.debts.map((d) => ({ ...d, left: d.left - 1 })).filter((d) => d.left > 0);
    g.demand *= 1.03; g.m += 1; g.demandSold = sold; prof2 += profit;
    g.hist = [...g.hist, { m: g.m, cash: Math.round(g.cash), profit: Math.round(profit) }];
    if (g.cash < 0 && !g.broke) g.broke = { m: g.m, why: inst > profit ? "Your debt installments were bigger than your profit." : late > 0 ? "Customers paid late and you ran out of cash." : "Your costs were bigger than your cash." };
  }
  return { ...g, boost: 1, advance: 0, lastProfit: prof2 };
}

function ScaleUp({ resp, existing, onSave, onExit }) {
  const p3 = resp?.__p3 || {};
  const b = getBiz(p3);
  const [g, setG] = useState(() => scaleStart(b, p3));
  const [phase, setPhase] = useState("intro"); // intro · event · move · result · final
  const [evs] = useState(() => { const pool = shuffleArr(SCALE_EVENTS.filter((e) => e.id !== "tax" && e.id !== "award")); return [pool[0], pool[1], SCALE_EVENTS.find((e) => e.id === "award"), pool[2], SCALE_EVENTS.find((e) => e.id === "tax"), pool[3]]; });
  const [offer, setOffer] = useState([]);
  const [move, setMove] = useState(null);
  const [fund, setFund] = useState(null);
  const [note, setNote] = useState("");
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const turn = g.m / 2;
  const ev = evs[turn];
  const monthProfit = g.demandSold * (g.price - g.vc) - g.fixed;
  const val = valuation(g);
  const debtLeft = g.debts.reduce((a, d) => a + d.inst * d.left, 0);
  const mv = GROW_MOVES.find((x) => x.id === move);
  const cost = mv ? Math.round(mv.cost(b)) : 0;
  const bankInst = pmt(cost, 0.018, 12), cardInst = pmt(cost, 0.029, 6);
  const valNow = Math.max(val, cost * 4, b.capital * 2);
  const eq = Math.ceil((cost / valNow) * 100);
  const fundOk = (f) => {
    if (cost === 0) return f === "cash";
    if (f === "cash") return g.cash >= cost;
    if (f === "bank") return bankInst + g.debts.reduce((a, d) => a + d.inst, 0) <= Math.max(0, monthProfit) * 0.4;
    if (f === "investor") return g.own - eq >= 51;
    if (f === "crowd") return mv?.crowd;
    return true;
  };
  const fundWhy = (f) => (f === "cash" ? "Not enough cash." : f === "bank" ? "🏦 The bank says NO: installments would be more than 40% of your profit." : f === "investor" ? "You would lose control (less than 51%)." : f === "crowd" ? "Fans only pre-pay for products they can see (ads, online, eco)." : "");
  const newTurn = (gg) => { setOffer(shuffleArr(GROW_MOVES.filter((x) => !(x.once && gg.used[x.id]))).slice(0, 3).map((x) => x.id)); setMove(null); setFund(null); };
  const chooseEvent = (fn) => { const gg = fn(g, b); setNote(gg.note || ""); const rest = { ...gg }; delete rest.note; setG(rest); newTurn(rest); setPhase("move"); };
  const runTurn = () => {
    let gg = { ...g, used: { ...g.used } };
    if (mv) {
      gg = mv.apply(gg, b); gg.used[mv.id] = true;
      if (fund === "cash") gg.cash -= cost;
      if (fund === "bank") gg.debts = [...gg.debts, { n: `🏦 ${mv.n}`, inst: bankInst, left: 12 }];
      if (fund === "card") gg.debts = [...gg.debts, { n: `💳 ${mv.n}`, inst: cardInst, left: 6 }];
      if (fund === "investor") gg.own -= eq;
      if (fund === "crowd") gg.debts = [...gg.debts, { n: `🌐 Rewards · ${mv.n}`, inst: (cost * 0.4) / 2, left: 2 }];
      gg.moves = [...gg.moves, { m: g.m, move: mv.n, e: mv.e, fund: FUNDS4.find((f) => f.id === fund)?.n || "—", cost }];
    } else gg.moves = [...gg.moves, { m: g.m, move: "Kept the cash", e: "💤", fund: "—", cost: 0 }];
    const out = run2(gg);
    setG(out); setPhase(out.broke ? "broke" : "result");
  };
  const restart = () => { const s = scaleStart(b, p3); setG(s); setPhase("intro"); setNote(""); };
  const labels = g.hist.map((h) => `M${h.m}`);
  const chart = <LineChart labels={labels} series={[{ name: "Cash", values: g.hist.map((h) => h.cash), color: "#16b074" }, { name: "Monthly profit", values: g.hist.map((h) => (h.m === 0 ? null : h.profit)), color: "#f5b23e" }]} />;
  const dash = (
    <div className="g74-dash">
      <div><small>📅 Month</small><b>{g.m}/12</b></div>
      <div className={g.cash < b.fixed * 0.5 ? "warn" : ""}><small>💵 Cash</small><b>{cop(g.cash)}</b></div>
      <div><small>📈 Profit / month</small><b>{cop(monthProfit)}</b></div>
      <div><small>💳 Debt left</small><b>{cop(debtLeft)}</b></div>
      <div><small>🍰 I own</small><b>{g.own}%</b></div>
      <div><small>❤️ Team</small><b>{g.morale}</b></div>
      <div><small>🌍 Planet</small><b>{g.eco}</b></div>
    </div>
  );
  if (st.done) return <Reward title="Scale-up complete! 🚀" subtitle="Piece 06 of your Financial Future Portfolio." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Rocket size={22} strokeWidth={2.1} />} title={`Scale Up! ${b.e} ${b.name}`} subtitle="12 months to grow your Period 3 business — without going broke." onExit={onExit}>
      <PieceBadge n="06" />
      {phase === "intro" && (
        <>
          <div className="g73-startcard"><em>{b.e}</em><div><b>{b.name}</b><small>Price {cop(b.price)} · cost {cop(b.varCost)} per {b.unit} · fixed {cop(b.fixed)}/month · ≈{b.units} {b.unit}s a month</small></div></div>
          <HowTo>You play <b>6 turns of 2 months</b>. Each turn: 1) something happens, 2) you choose a growth move and how to <i>finance</i> it (cash, bank, card, investor, crowdfunding). Your customers grow 3% a month — but your <b>capacity</b> is limited! Mission: reach month 12 with <b>cash above $0</b>. The bigger your company and your % of it, the better.</HowTo>
          {g.debts.length > 0 && <div className="g74-remind"><b>📒 From Period 3:</b><span>Your bank loan installment {cop(g.debts[0].inst)}/month continues.</span>{g.own < 100 && <span>You own {g.own}% (investors).</span>}</div>}
          {dash}
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => setPhase("event")}>Start month 1 <ChevronRight size={18} /></button></div>
        </>
      )}
      {phase === "event" && ev && (
        <>
          {dash}
          <div className="g74-news"><small>📰 MONTHS {g.m + 1}–{g.m + 2}</small><h3>{ev.e} {ev.h}</h3><p>{ev.d}</p></div>
          <div className="g72-opts">{ev.ch.map(([l, fn]) => <button key={l} type="button" className="g72-opt" onClick={() => chooseEvent(fn)}><span>{l}</span></button>)}</div>
        </>
      )}
      {phase === "move" && (
        <>
          {dash}
          {note && <div className="p1-hint">{note}</div>}
          <div className="start-block">
            <h3><span className="step-n">1</span> Choose a growth move</h3>
            <div className="g74-moves">
              {offer.map((id) => { const x = GROW_MOVES.find((y) => y.id === id); const c = Math.round(x.cost(b)); return (
                <button key={id} type="button" className={`g74-move ${move === id ? "on" : ""}`} onClick={() => { setMove(id); setFund(c === 0 ? "cash" : null); }}><em>{x.e}</em><b>{x.n}</b><small>{x.d}</small><span>{c ? cop(c) : "No upfront cost"}</span></button>
              ); })}
              <button type="button" className={`g74-move ${move === null && fund === "none" ? "on" : ""}`} onClick={() => { setMove(null); setFund("none"); }}><em>💤</em><b>Keep my cash</b><small>No growth this turn. Safer, but slower.</small><span>$0</span></button>
            </div>
          </div>
          {mv && cost > 0 && (
            <div className="start-block">
              <h3><span className="step-n">2</span> How do you finance {cop(cost)}?</h3>
              <div className="g74-funds">
                {FUNDS4.map((f) => { const ok = fundOk(f.id); const extra = f.id === "bank" ? `${cop(bankInst)}/month × 12` : f.id === "card" ? `${cop(cardInst)}/month × 6` : f.id === "investor" ? `You give ${eq}%` : f.id === "crowd" ? `≈${cop(cost * 0.4)} in rewards` : `Cash after: ${cop(g.cash - cost)}`; return (
                  <button key={f.id} type="button" disabled={!ok} className={`g74-fund ${fund === f.id ? "on" : ""} ${f.id === "card" ? "danger" : ""}`} onClick={() => setFund(f.id)}>
                    <em>{f.e}</em><b>{f.n}</b><small>{ok ? f.d : fundWhy(f.id)}</small><span>{extra}</span>
                  </button>
                ); })}
              </div>
              {fund === "card" && <div className="p1-hint">💳 Careful: the card is the most expensive money. Use it only for small, short needs.</div>}
              {fund === "cash" && g.cash - cost < b.fixed && <div className="p1-hint">⚠️ Your cash cushion will be smaller than one month of fixed costs.</div>}
            </div>
          )}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!(fund === "none" || (mv && fund))} onClick={runTurn}><Play size={16} /> Run months {g.m + 1}–{g.m + 2}</button></div>
        </>
      )}
      {phase === "result" && (
        <>
          {dash}
          {chart}
          <ChartLegend series={[{ name: "Cash", color: "#16b074" }, { name: "Monthly profit", color: "#f5b23e" }]} />
          {g.pendingIn > 0 && <p className="start-tip p1-center">⏳ The supermarket still owes you {cop(g.pendingIn)} (it arrives next month).</p>}
          <div className="start-foot">{g.m < 12 ? <button className="s1-btn primary big" onClick={() => setPhase("event")}>Next 2 months <ChevronRight size={18} /></button> : <button className="s1-btn primary big" onClick={() => setPhase("final")}>See my year <Trophy size={16} /></button>}</div>
        </>
      )}
      {phase === "broke" && (
        <>
          <div className="g74-broke"><em>💥</em><b>You went broke in month {g.broke.m}!</b><span>{g.broke.why}</span><small>Growing is not enough: you need CASH every month. Try another financing mix or keep a bigger cushion.</small></div>
          {chart}
          <div className="start-foot"><button className="s1-btn primary big" onClick={restart}><RefreshCw size={16} /> Try again</button></div>
        </>
      )}
      {phase === "final" && (
        <>
          {(() => { const p0 = g.hist[1]?.profit || 0, p1 = g.hist[g.hist.length - 1]?.profit || 0; return <div className={`p1-banner ${p1 > p0 * 1.15 ? "good" : "bad"}`}><span>📈 Your monthly profit went from <b>{cop(p0)}</b> to <b>{cop(p1)}</b> ({fmtPct(pctChange(p0, p1), 0)}). {p1 > p0 * 1.15 ? "You really scaled up!" : "Your business didn't grow much. Next time, try a growth move with smart financing."}</span></div>; })()}
          <div className="g73-score"><small>{b.e} {b.name.toUpperCase()} · 12 MONTHS LATER</small><b className="good">{cop(Math.round(g.cash + (val * g.own) / 100))}</b><span>Your cash + your {g.own}% of a company worth {cop(val)}</span></div>
          {chart}
          <div className="g74-movelog">{g.moves.map((x, k) => <span key={k}><i>M{x.m + 1}–{x.m + 2}</i>{x.e} {x.move}{x.fund !== "—" ? ` · ${x.fund}` : ""}</span>)}</div>
          <div className="start-block">
            <h3><PenLine size={18} /> How did you finance your growth? What did you learn? (min 25 words)</h3>
            <Starters items={["I financed my growth with", "The best decision was", "I avoided", "My business grew because", "Next time I will"]} onPick={appendStarter(setText)} />
            <WordField value={text} onChange={setText} min={25} max={120} rows={5} placeholder="Write your reflection here…" />
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={countWords(text) < 25} onClick={() => finish(45, { biz: { name: b.name, e: b.e, unit: b.unit }, cash: Math.round(g.cash), valuation: val, own: g.own, morale: g.morale, eco: g.eco, moves: g.moves, debtLeft: Math.round(debtLeft), profit: Math.round(monthProfit), hist: g.hist, text })}>Save Piece 06 <span className="coin-tag"><Coins size={15} /> +45</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* ---------- THE LEADER'S DILEMMAS ---------- */
const DILEMMAS = [
  { e: "🔥", s: "An employee made a big mistake: a whole order was ruined.", o: [["Talk privately, find the cause and train the team", 2, { team: 10, profit: -5 }], ["Shout at the employee in front of everybody", 0, { team: -20 }], ["Ignore it and hope it doesn't happen again", 1, { profit: -10 }]] },
  { e: "🧒", s: "A supplier offers a 30% cheaper ingredient. You discover the farm uses child labor.", o: [["Say no and keep the fair supplier", 2, { planet: 10, team: 5, profit: -5 }], ["Accept it — nobody will know", 0, { profit: 15, planet: -20 }], ["Accept it and donate a little money to a school", 0, { profit: 10, planet: -10 }]] },
  { e: "💰", s: "Great month! You have $2,000,000 of extra profit.", o: [["Bonus for the team + reinvest + emergency fund", 2, { team: 15, profit: 5 }], ["Buy myself a new phone and celebrate", 0, { team: -10 }], ["Reinvest everything in the business", 1, { profit: 10 }]] },
  { e: "😮‍💨", s: "Your team has worked 12-hour days for three weeks.", o: [["Rotate shifts and hire one more person", 2, { team: 20, profit: -5 }], ["Pay extra and keep the same rhythm", 1, { team: 5, profit: -5 }], ["“That's business.” Nothing changes", 0, { team: -25 }]] },
  { e: "🧾", s: "A big client asks for a fake invoice to pay less tax.", o: [["Refuse politely and explain why", 2, { team: 5 }], ["Accept — you don't want to lose the client", 0, { profit: 5, team: -10 }], ["Offer a small discount instead", 1, { profit: -5 }]] },
  { e: "💡", s: "You must decide about a new product.", o: [["Ask the team and some customers, then decide", 2, { team: 10, profit: 5 }], ["Decide alone, quickly", 1, {}], ["Copy a competitor's product exactly", 0, { profit: 5, team: -5 }]] },
  { e: "📦", s: "Plastic packaging is cheaper. Compostable packaging costs $200 more per unit.", o: [["Change little by little and tell customers the truth", 2, { planet: 20, profit: -5 }], ["Keep plastic but write “eco” on the label", 0, { planet: -15 }], ["Keep plastic for now", 1, {}]] },
];
function LeaderLab({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [m, setM] = useState({ team: 60, planet: 50, profit: 60 });
  const [score, setScore] = useState(0);
  const [st, finish] = useFinish(onSave);
  const d = DILEMMAS[i];
  const order = useMemo(() => DILEMMAS.map((x) => shuffleArr(x.o.map((_, k) => k))), []);
  const choose = (k) => { if (pick !== null) return; setPick(k); const [, f, fx] = d.o[k]; setScore(score + f); setM({ team: clamp(m.team + (fx.team || 0), 0, 100), planet: clamp(m.planet + (fx.planet || 0), 0, 100), profit: clamp(m.profit + (fx.profit || 0), 0, 100) }); };
  const max = DILEMMAS.length * 2;
  const style = score >= max - 2 ? ["👑", "Inspiring Leader", "People, planet and profit — you balance all three."] : score >= max / 2 ? ["🧭", "Growing Leader", "Good instincts. Listen more and think long-term."] : ["🎯", "Boss, not yet a leader", "Profit today can cost your team and your reputation tomorrow."];
  const next = () => { if (i === DILEMMAS.length - 1) { finish(score * 2 + 6, { score, max, style: style[1], meters: m }); return; } setI(i + 1); setPick(null); };
  if (st.done) return <Reward title={`${style[0]} ${style[1]}`} subtitle={style[2]} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Crown size={22} strokeWidth={2.1} />} title="The Leader's Dilemmas 👑" subtitle="7 hard decisions. A good leader cares about People, Planet and Profit." onExit={onExit}>
      <div className="g72-meters">
        <Meter value={m.team} color="#ff6b57" label="❤️ People" />
        <Meter value={m.planet} color="#16b074" label="🌍 Planet" />
        <Meter value={m.profit} color="#f5b23e" label="💰 Profit" />
      </div>
      <div className="g74-news"><small>DILEMMA {i + 1}/{DILEMMAS.length}</small><h3>{d.e} {d.s}</h3></div>
      <div className="g72-opts">{order[i].map((k) => { const [l, f] = d.o[k]; return <button key={k} type="button" disabled={pick !== null} className={`g72-opt ${pick === k ? (f === 2 ? "good" : f === 1 ? "on" : "bad") : pick !== null && f === 2 ? "good" : ""}`} onClick={() => choose(k)}><span>{l}</span></button>; })}</div>
      {pick !== null && (
        <>
          <div className={`g72-conseq f${d.o[pick][1]}`}><b>{d.o[pick][1] === 2 ? "👑 Leader move!" : d.o[pick][1] === 1 ? "🤔 OK, but not the best." : "⚠️ Risky decision."}</b><span>{Object.entries(d.o[pick][2]).map(([k, v]) => `${k === "team" ? "❤️ People" : k === "planet" ? "🌍 Planet" : "💰 Profit"} ${v > 0 ? "+" : ""}${v}`).join(" · ") || "No big change."}</span></div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{i === DILEMMAS.length - 1 ? "See my leader style" : "Next dilemma"} <ChevronRight size={18} /></button></div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   BLOQUE 7 · CLASES 41–42 · FUTURE SHOWCASE + CIERRE DEL AÑO
   ===================================================================== */
/* ---------- MY MONEY RADAR 2.0 (las MISMAS 10 preguntas del Periodo 1) ---------- */
const RADAR_DIMS = [
  { k: "mm", l: "Money Management", short: "Money" },
  { k: "ent", l: "Entrepreneurship", short: "Business" },
  { k: "wb", l: "Financial Wellbeing", short: "Wellbeing" },
  { k: "dig", l: "Digital Economy", short: "Digital" },
  { k: "glo", l: "Global Citizenship", short: "Global" },
];
const RADAR_Q = [
  { d: "mm", q: "A notebook cost $8,000 last year. Today the same notebook costs $9,000. What happened?", o: ["I don't know.", "The notebook is better now.", "The price went up, so my money buys a little less.", "Money is worth more now."], s: [0, 1, 3, 0] },
  { d: "mm", q: "You receive $50,000 for your birthday. What do you do first?", o: ["I spend it all today.", "I buy what I want and save what is left.", "I make a plan: needs, savings and a little for wants.", "I keep it and never use it."], s: [0, 1, 3, 1] },
  { d: "ent", q: "Your friend sells cookies for $1,000, but each cookie costs $1,200 to make. What do you tell her?", o: ["Great business!", "Sell more cookies!", "You lose money on each cookie. Change the price or the cost.", "Give them away for free."], s: [0, 0, 3, 0] },
  { d: "ent", q: "Many students want a healthy snack at school, but nobody sells it. What can an entrepreneur see?", o: ["A problem nobody can solve.", "An opportunity to offer something useful.", "Nothing interesting.", "A reason to raise all prices."], s: [0, 3, 0, 1] },
  { d: "wb", q: "Before buying something you want, what do you usually do?", o: ["I buy it immediately.", "Sometimes I wait a little.", "I compare prices and ask: Do I really need it?", "I ask someone to buy it for me."], s: [0, 1, 3, 0] },
  { d: "wb", q: "Prices go up, but your family's money must last the whole month. What helps most?", o: ["Buying the same things without thinking.", "Making a list, comparing prices and choosing cheaper options.", "Buying a lot today because prices will go up.", "Stopping buying food."], s: [0, 3, 1, 0] },
  { d: "dig", q: "An online store sells a phone 50% cheaper than all the others. It only has 5-star reviews from yesterday. What do you do?", o: ["Buy it fast!", "Buy just one to try.", "Check the seller, the reviews and other stores first.", "Send my card number to ask questions."], s: [0, 1, 3, 0] },
  { d: "dig", q: "What is the safest way to buy something online?", o: ["Send my PIN by WhatsApp to the seller.", "Use a trusted store and pay with an adult's help.", "Pay in any link I receive.", "Use my parents' card without telling them."], s: [0, 3, 0, 0] },
  { d: "glo", q: "A burger costs 5 dollars in the USA and 20,000 pesos in Colombia. How can you compare the prices?", o: ["You can't compare them.", "Count the zeros.", "Convert both prices to the same currency.", "The bigger number is always more expensive."], s: [0, 1, 3, 0] },
  { d: "glo", q: "Why is it important to be a responsible consumer?", o: ["It isn't important.", "Only to save money.", "Because it is a school rule.", "Because my choices affect my money, other people and the planet."], s: [0, 1, 1, 3] },
];
// Preguntas extra de fin de año (miden lo nuevo: inversión, riesgo, ética)
const RADAR_Q2 = [
  { d: "mm", q: "You have $1,000,000 for a goal in 10 years. What do you do?", o: ["Keep it under my bed.", "Put it all in one new crypto coin.", "Diversify between safe and growth investments.", "Spend it now, 10 years is too far."], s: [0, 0, 3, 0] },
  { d: "ent", q: "Your business grows and needs a $5,000,000 machine. How do you pay?", o: ["With my credit card, it's faster.", "I compare a bank loan, my profits and investors first.", "I borrow from a “gota a gota” lender.", "I don't grow. Ever."], s: [0, 3, 0, 1] },
  { d: "wb", q: "Prices fall 20% in your investments. What do you do?", o: ["Sell everything immediately.", "Stay calm and check my long-term plan.", "Borrow money to buy more crypto.", "Never invest again."], s: [0, 3, 0, 1] },
  { d: "dig", q: "Someone on Instagram promises “5% profit every day, guaranteed”. You…", o: ["Invest a little to test it.", "Send it to my friends.", "Recognize the red flags and block it.", "Ask for their bank account."], s: [1, 0, 3, 0] },
  { d: "glo", q: "A company says it is “eco-friendly” but shows no data. You…", o: ["Believe it — the logo is green.", "Ask for numbers and certifications.", "Buy more of its products.", "Don't care at all."], s: [0, 3, 0, 0] },
];
const RADAR_ALL = [...RADAR_Q, ...RADAR_Q2];
function radarProfile2(avg) {
  if (avg <= 30) return { l: "Future Starter 🌱", d: "You are starting. Choose one money habit and practice it every month." };
  if (avg <= 55) return { l: "Future Explorer 🔎", d: "You know important ideas. Now use them in real decisions." };
  if (avg <= 80) return { l: "Future Planner 📊", d: "You think before you decide and explain your choices with numbers." };
  return { l: "Future Builder ⭐", d: "You make smart, ethical money decisions. Help others do the same!" };
}
function MoneyRadar2({ resp, existing, onSave, onExit }) {
  const before = resp?.__p1?.c1_radar?.scores || null;
  const [cur, setCur] = useState(0);
  const [ans, setAns] = useState({});
  const [done, setDone] = useState(!!existing?.scores);
  const [saving, setSaving] = useState(false);
  const scoresOf = (qs) => { const o = {}; RADAR_DIMS.forEach((d) => { const list = qs.map((q, i) => ({ q, i })).filter((x) => x.q.d === d.k); o[d.k] = Math.round((list.reduce((a, x) => a + (ans[x.i] != null ? x.q.s[ans[x.i]] : 0), 0) / (list.length * 3)) * 100); }); return o; };
  const scores = useMemo(() => scoresOf(RADAR_ALL), [ans]); // eslint-disable-line react-hooks/exhaustive-deps
  const comparable = useMemo(() => scoresOf(RADAR_Q), [ans]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = existing?.scores && !Object.keys(ans).length ? existing.scores : scores;
  const avg = Math.round(Object.values(shown).reduce((a, v) => a + v, 0) / RADAR_DIMS.length);
  const prof = radarProfile2(avg);
  const q = RADAR_ALL[cur];
  const answered = ans[cur] != null;
  const finish = () => {
    setSaving(true); setDone(true);
    const bAvg = before ? Math.round(Object.values(before).reduce((a, v) => a + v, 0) / 5) : null;
    Promise.resolve(onSave({ answers: ans, scores, same10: comparable, average: avg, profile: prof.l, before, beforeAvg: bAvg, growth: bAvg == null ? null : avg - bAvg, xp: 25 })).finally(() => setSaving(false));
  };
  if (done) {
    const bAvg = before ? Math.round(Object.values(before).reduce((a, v) => a + v, 0) / 5) : null;
    const grow = before ? RADAR_DIMS.map((d) => ({ ...d, g: shown[d.k] - (before[d.k] || 0) })).sort((a, b) => b.g - a.g) : null;
    return (
      <div className="s1-quiz diag-result g74-radar2">
        <div className="diag-badge"><Compass size={30} strokeWidth={2.1} /></div>
        <h2>My Money Radar 2.0 · How much did I grow?</h2>
        <p className="diag-sub">{before ? "Gray dashed line = you in Period 1. Green = you today." : "You didn't do the radar in Period 1, so this is your first photo."}</p>
        <div className="g7-radar-wrap"><RadarN labels={RADAR_DIMS.map((d) => d.short)} values={RADAR_DIMS.map((d) => shown[d.k])} before={before ? RADAR_DIMS.map((d) => before[d.k] || 0) : undefined} /></div>
        {before && <div className="p2-legend p1-center"><span><i style={{ background: "#9aa8a0" }} />Period 1 · {bAvg}%</span><span><i style={{ background: "#16b074" }} />Today · {avg}%</span></div>}
        <div className="diag-bars">
          {RADAR_DIMS.map((d) => (
            <div key={d.k} className="diag-bar g74-growbar"><span className="diag-bar-l">{d.l}</span>
              <div className="diag-bar-track">{before && <s style={{ width: `${before[d.k] || 0}%` }} />}<i style={{ width: `${shown[d.k]}%` }} /></div>
              <span className="diag-bar-v">{shown[d.k]}%{before && <small className={shown[d.k] - before[d.k] >= 0 ? "pos" : "neg"}> {shown[d.k] - before[d.k] >= 0 ? "+" : ""}{shown[d.k] - before[d.k]}</small>}</span>
            </div>
          ))}
        </div>
        {before && <div className="g73-score"><small>MY GROWTH THIS YEAR</small><b className={avg - bAvg >= 0 ? "good" : "bad"}>{avg - bAvg >= 0 ? "+" : ""}{avg - bAvg} points</b><span>From {bAvg}% to {avg}%</span></div>}
        <div className="diag-risk"><span className="diag-risk-tag">{prof.l}</span><p>{prof.d}</p></div>
        {grow && <div className="p1-diag-cards"><div className="p1-diag-card good"><b>🚀 You grew most in: {grow[0].l}</b><span>{grow[0].g >= 0 ? "+" : ""}{grow[0].g} points since Period 1.</span></div><div className="p1-diag-card next"><b>🎯 Keep practicing: {grow[4].l}</b><span>Your next challenge for 8th grade.</span></div></div>}
        <button className="s1-btn primary" onClick={onExit}>Continue <ChevronRight size={18} /></button>
        {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing your progress…</span>}
      </div>
    );
  }
  return (
    <div className="s1-quiz">
      <div className="quiz-top"><h2>🧭 My Money Radar 2.0</h2><span className="quiz-count">{cur + 1} / {RADAR_ALL.length}</span></div>
      <div className="quiz-track"><i style={{ width: `${((cur + (answered ? 1 : 0)) / RADAR_ALL.length) * 100}%` }} /></div>
      {cur === 0 && <p className="start-tip">The same 10 situations from the beginning of the year + 5 new ones. Answer honestly — then compare yourself with Period 1!</p>}
      <span className="diag-dim">{RADAR_DIMS.find((d) => d.k === q.d).l}{cur >= RADAR_Q.length ? " · NEW" : ""}</span>
      <p className="quiz-q">{q.q}</p>
      <div className="quiz-options">
        {q.o.map((o, k) => <button key={k} type="button" className={`quiz-opt ${ans[cur] === k ? "correct" : ""}`} onClick={() => setAns({ ...ans, [cur]: k })}><span className="opt-key">{"ABCD"[k]}</span><span className="opt-text">{o}</span></button>)}
      </div>
      <div className="quiz-nav">
        <button className="s1-btn ghost" onClick={() => (cur > 0 ? setCur(cur - 1) : onExit())}>{cur > 0 ? "Back" : "Exit"}</button>
        <button className="s1-btn primary" disabled={!answered} onClick={() => (cur < RADAR_ALL.length - 1 ? setCur(cur + 1) : finish())}>{cur < RADAR_ALL.length - 1 ? "Next" : "See my growth"} <ChevronRight size={18} /></button>
      </div>
    </div>
  );
}

/* ---------- YEAR WRAPPED (estilo “wrapped”) ---------- */
const loadHtml2Canvas = () => (window.html2canvas ? Promise.resolve(window.html2canvas) : new Promise((res, rej) => {
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  s.onload = () => res(window.html2canvas); s.onerror = rej;
  document.body.appendChild(s);
}));
const downloadPNG = async (id, file) => { try { const h2c = await loadHtml2Canvas(); const cv = await h2c(document.getElementById(id), { scale: 2, backgroundColor: null, useCORS: true }); const a = document.createElement("a"); a.href = cv.toDataURL("image/png"); a.download = file; a.click(); } catch (e) { /* sin imagen */ } };
function yearData(resp, rows, pointsNow) {
  const p1 = resp.__p1 || {}, p2 = resp.__p2 || {}, p3 = resp.__p3 || {};
  const pts = [rowPoints(rows["7P1"]), rowPoints(rows["7P2"]), rowPoints(rows["7P3"]), pointsNow];
  const acts = ["7P1", "7P2", "7P3"].map((k) => Object.values(parseJSON(rows[k]?.Checklist_JSON)).filter(Boolean).length);
  const biz = getBiz(p3);
  return { p1, p2, p3, pts, acts, coins: pts.reduce((a, v) => a + v, 0), biz, career: getCareer(resp), radar: resp.c41_radar, p1radar: p1.c1_radar };
}
function YearWrapped({ resp, rows, pointsNow, actsNow, studentName, onSave, onExit }) {
  const D = yearData(resp, rows, pointsNow);
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [st, finish] = useFinish(onSave);
  const first = (studentName || "Student").split(" ")[0];
  const totalActs = D.acts.reduce((a, v) => a + v, 0) + actsNow;
  const sim = resp.c35_sim, ex = resp.c37_exchange, lead = resp.c40_lead, scale = resp.c39_scale, pledge = resp.c38_pledge, risk = resp.c35_strategy;
  const persona = risk?.profile === "Conservative" ? ["🛡️", "The Careful Guardian", "You protect first and grow step by step."] : risk?.profile === "Bold" ? ["🚀", "The Brave Builder", "You accept risk — with rules and a plan."] : ["⚖️", "The Balanced Strategist", "Safety and growth, in the right mix."];
  const maxPts = Math.max(...D.pts, 1);
  const slides = [
    { k: "intro", c: "forest", node: <><small>GRADE 7 · 2026</small><h2>{first}, this was your year in money 🎁</h2><p>4 periods. Prices, banks, plans and your future. Ready?</p><em className="g74-big">✨</em></> },
    { k: "coins", c: "gold", node: <><small>THIS YEAR YOU EARNED</small><h2 className="g74-mega">{D.coins.toLocaleString("en-US")}</h2><p>FinFluent coins 🪙</p><div className="g74-wbars">{D.pts.map((v, k) => <div key={k}><i style={{ height: `${Math.max(6, (v / maxPts) * 100)}%` }} /><span>P{k + 1}</span><b>{v}</b></div>)}</div></> },
    { k: "acts", c: "green", node: <><small>YOU COMPLETED</small><h2 className="g74-mega">{totalActs}</h2><p>activities: readings, games, simulators, writing and presentations.</p><div className="g74-wchips">{["📈 Market Detective", "🏦 Junior Advisor", "📒 Financial Planner", "🗂️ Future Builder"].map((x, k) => <span key={x} className={(k < 3 ? D.acts[k] : actsNow) > 0 ? "on" : ""}>{x}</span>)}</div></> },
    { k: "p1", c: "coral", node: <><small>PERIOD 1 · WHY DO PRICES CHANGE?</small><h2>You became a Market Detective 🔎</h2><p>{D.p1.c10_report ? `You tracked prices for ${D.p1.c10_report.records || "many"} weeks and published your Consumer Market Report.` : "You learned inflation, supply and demand and how to read graphs."}</p>{D.p1radar && <p className="g74-quote">Your first radar: <b>{D.p1radar.profile}</b></p>}</> },
    { k: "p2", c: "mint", node: <><small>PERIOD 2 · HOW BANKS WORK</small><h2>You advised real-life clients 🏦</h2><p>{D.p2.c20_portfolio ? "You published a Banking Advisory Portfolio with your best recommendations." : "You compared banks, interest, credit and digital safety."}</p>{firstText(D.p2.c20_portfolio?.conclusions) && <p className="g74-quote">“{firstText(D.p2.c20_portfolio.conclusions)}”</p>}</> },
    { k: "p3", c: "gold", node: <><small>PERIOD 3 · SMART BANKING</small><h2>You created {D.biz.e} {D.biz.name}</h2><p>{D.p3.c28_pitch ? `The bank approved your loan of ${cop(D.p3.c28_pitch.amount)}.` : "You planned a budget, SMART goals, credit rules and a business."}{D.p3.c29_design?.app ? ` And you designed your own app: ${D.p3.c29_design.app.logo} ${D.p3.c29_design.app.name}.` : ""}</p></> },
    { k: "p4", c: "forest", node: <><small>PERIOD 4 · MY FINANCIAL FUTURE</small><h2>You looked into the future 🔮</h2><div className="g74-wlist">
      <span>🧭 Career: <b>{D.career.e} {D.career.n}</b></span>
      {sim && <span>🌪️ 5-Year Storm: <b>#{sim.rank}</b> of 5 · {cop(sim.final)}</span>}
      {ex && <span>🚀 Crypto Exchange: <b>{ex.pnl >= 0 ? "+" : ""}{cop(ex.pnl)}</b></span>}
      {scale && <span>📈 Scale Up: <b>{scale.biz?.e} {cop(scale.cash)}</b> cash · you own {scale.own}%</span>}
      {pledge && <span>🌍 Your SDGs: <b>{pledge.sdgs.join(" · ")}</b></span>}
      {lead && <span>👑 Leader style: <b>{lead.style}</b></span>}
    </div></> },
    { k: "radar", c: "green", node: D.radar?.growth != null ? <><small>MY MONEY RADAR</small><h2 className="g74-mega">{D.radar.growth >= 0 ? "+" : ""}{D.radar.growth}</h2><p>points of growth since Period 1 ({D.radar.beforeAvg}% → {D.radar.average}%)</p><p className="g74-quote">Today you are: <b>{D.radar.profile}</b></p></> : <><small>MY MONEY RADAR</small><h2>🔒 Locked</h2><p>Do “My Money Radar 2.0” to see how much you grew.</p></> },
    { k: "persona", c: "coral", node: <><small>YOUR MONEY PERSONALITY</small><em className="g74-big">{persona[0]}</em><h2>{persona[1]}</h2><p>{persona[2]}</p></> },
    { k: "outro", c: "forest", node: <><small>2026 → 2030 → 2043</small><h2>Your future starts with the next peso you save. 💚</h2><p>See you in 8th grade, {first}!</p></> },
  ];
  const s = slides[i];
  const last = i === slides.length - 1;
  if (st.done) return <Reward title="That's a wrap! 🎁" subtitle="What a year of money skills." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <div className="p1-act g74-wrapped-wrap">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className={`g74-wrapped c-${s.c}`} id="g74-wrapped" key={s.k}>
        <div className="g74-wprog">{slides.map((x, k) => <i key={x.k} className={k < i ? "done" : k === i ? "on" : ""} />)}</div>
        <div className="g74-wbody">{s.node}</div>
        <div className="g74-wfoot"><span>FinFluent · Instituto CREAR</span><span>{i + 1}/{slides.length}</span></div>
        <button type="button" className="g74-wtap left" aria-label="Previous" onClick={() => setI(Math.max(0, i - 1))} />
        <button type="button" className="g74-wtap right" aria-label="Next" onClick={() => setI(Math.min(slides.length - 1, i + 1))} />
      </div>
      <div className="p3-card-actions">
        <button className="s1-btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}><ArrowLeft size={16} /> Back</button>
        <button className="s1-btn ghost" disabled={busy} onClick={async () => { setBusy(true); await downloadPNG("g74-wrapped", `Year_Wrapped_${i + 1}_${first}.png`); setBusy(false); }}><Download size={16} /> {busy ? "Creating…" : "Save this slide"}</button>
        {!last ? <button className="s1-btn primary" onClick={() => setI(i + 1)}>Next <ChevronRight size={16} /></button>
          : <button className="s1-btn primary" onClick={() => finish(25, { coins: D.coins, acts: totalActs, persona: persona[1] })}>Finish my Wrapped <span className="coin-tag"><Coins size={15} /> +25</span></button>}
      </div>
    </div>
  );
}

/* ---------- FINANCIAL FUTURE PORTFOLIO (el proyecto final) ---------- */
function FuturePortfolio({ resp, studentName, existing, onSave, onExit }) {
  const r = resp || {};
  const p1 = r.__p1 || {}, p2 = r.__p2 || {}, p3 = r.__p3 || {};
  const [letter, setLetter] = useState(existing?.letter || "");
  const [busy, setBusy] = useState(false);
  const [st, finish] = useFinish(onSave);
  const pieces = PORT_PIECES.filter((p) => r[p.key]).length;
  const ready = pieces >= 4 && countWords(letter) >= 40;
  const route = r.c33_route, lab = r.c34_lab, strat = r.c35_strategy, tk = r.c37_rules, pl = r.c38_pledge, sc = r.c39_scale, swot = r.c33_swot, radar = r.c41_radar;
  const career = getCareer(r);
  const print = () => { document.body.classList.add("g74-printing"); const off = () => { document.body.classList.remove("g74-printing"); window.removeEventListener("afterprint", off); }; window.addEventListener("afterprint", off); setTimeout(() => window.print(), 50); };
  const Sec = ({ n, children }) => { const p = PORT_PIECES.find((x) => x.n === n); const has = r[p.key]; return <section className={`g74-fp ${has ? "" : "empty"}`}><h4><span>{p.n}</span>{p.e} {p.t}</h4>{has ? children : <p className="g74-fp-empty">Not completed yet.</p>}</section>; };
  const b3 = p3.c22_remix, biz = getBiz(p3);
  if (st.done) return <Reward title="My Financial Future Portfolio is complete! 🏆" subtitle="A whole year of financial skills in one project." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Award size={22} strokeWidth={2.1} />} title="My Financial Future Portfolio 🗂️" subtitle="It builds itself with your whole year. Write your letter and present it!" onExit={onExit}>
      <div className="g74-final" id="g74-final">
        <header>
          <small>FINANCIAL FUTURE PORTFOLIO · GRADE 7 · INSTITUTO CREAR · 2026</small>
          <h2>Building My Financial Future</h2>
          <p>By <b>{studentName}</b> · {career.e} Future {career.n.toLowerCase()}{strat ? ` · ${strat.profile} investor` : ""}</p>
        </header>
        <section className="g74-journey">
          <h4>🧭 My year in 4 periods</h4>
          <div className="g74-journey-grid">
            <div><small>PERIOD 1 · Prices</small><b>📈 Market Detective</b><span>{firstText(p1.c10_report?.conclusions) || "Inflation, supply & demand, graphs."}</span></div>
            <div><small>PERIOD 2 · Banks</small><b>🏦 Junior Advisor</b><span>{firstText(p2.c20_portfolio?.conclusions) || "Banks, interest, credit, digital safety."}</span></div>
            <div><small>PERIOD 3 · Planning</small><b>📒 Financial Planner</b><span>{b3 ? `${b3.ruleName} budget · ${biz.e} ${biz.name}` : `${biz.e} ${biz.name}`}{p3.c31_plan?.promises?.a ? ` · “${p3.c31_plan.promises.a}”` : ""}</span></div>
            <div><small>PERIOD 4 · Future</small><b>🗂️ Future Builder</b><span>{radar?.growth != null ? `Radar: ${radar.beforeAvg}% → ${radar.average}% (+${radar.growth})` : "Investing, risk, crypto, ethics, growth."}</span></div>
          </div>
          {radar?.before && <div className="g74-fp-radar"><RadarN labels={RADAR_DIMS.map((d) => d.short)} values={RADAR_DIMS.map((d) => radar.scores[d.k])} before={RADAR_DIMS.map((d) => radar.before[d.k] || 0)} /></div>}
        </section>
        <div className="g74-fp-grid">
          <Sec n="01">{route && <>{[18, 25, 30].map((a) => route.goals[a] && <p key={a}><b>{a}</b> · {route.goals[a].e} {route.goals[a].l} · {cop(route.goals[a].amount)}</p>)}{swot && <p>💪 {SWOT_Q[0].chips.filter((c) => swot.picks.s.includes(c[0])).map((c) => c[1]).slice(0, 2).join(" · ")}</p>}</>}</Sec>
          <Sec n="02">{lab && <><p>🎯 {lab.goal.e} {lab.goal.l} at {lab.goal.age} · {cop(lab.monthly)}/month</p><p>{Object.entries(lab.alloc).filter(([, v]) => v > 0).map(([k, v]) => `${toolById(k)?.e} ${v}%`).join(" · ")}</p><p>📈 ≈{lab.rate}% a year {lab.safeBad ? "· 🛡️ safe even in a bad future" : ""}</p></>}</Sec>
          <Sec n="03">{strat && <><p>{PROFILES4[strat.profile]?.e} <b>{strat.profile}</b></p><PctBar parts={MIX5.map(([k, l, c]) => ({ label: l, value: strat.mix[k] || 0, color: c }))} /><ul>{strat.rules.slice(0, 4).map((x) => <li key={x}>{x}</li>)}</ul></>}</Sec>
          <Sec n="04">{tk && <><p>🧰 {tk.tools.slice(0, 4).join(" · ")}</p><p>🪙 Max crypto: <b>{tk.cryptoMax}%</b></p><ul>{tk.habits.slice(0, 3).map((x) => <li key={x}>{x}</li>)}</ul></>}</Sec>
          <Sec n="05">{pl && <><div className="g74-fp-sdg">{pl.sdgs.map((n) => <span key={n}>{sdg(n)[1]} {n} · {sdg(n)[2]}</span>)}</div><i>“{pl.text.split(" ").slice(0, 28).join(" ")}{countWords(pl.text) > 28 ? "…" : ""}”</i></>}</Sec>
          <Sec n="06">{sc && <><p>{sc.biz.e} <b>{sc.biz.name}</b> · 12 months</p><p>💵 Cash {cop(sc.cash)} · 🍰 I own {sc.own}% · company ≈ {cop(sc.valuation)}</p><p>{sc.moves.filter((m) => m.cost > 0 || m.move !== "Kept the cash").map((m) => m.e).join(" ")}</p></>}</Sec>
          <section className="g74-fp letter"><h4><span>★</span>💌 Letter to my 30-year-old self</h4><p>{letter || "…"}</p></section>
        </div>
        <footer>💡 Concepts of the year: inflation · supply & demand · interest · credit · budget · SMART goals · compound interest · break-even · investing · diversification · crypto risks · ESG & SDGs · cash flow · leadership</footer>
      </div>
      <div className="start-block">
        <h3><PenLine size={18} /> 💌 Letter to my 30-year-old self (40–150 words)</h3>
        <p className="start-tip">Tell your future self what you learned this year, what you promise to do with your money and how you imagine your life at 30.</p>
        <Starters items={["Dear 30-year-old me,", "This year I learned that", "I promise to", "I hope you", "With love, 13-year-old me"]} onPick={appendStarter(setLetter)} />
        <WordField value={letter} onChange={setLetter} min={40} max={150} rows={7} placeholder="Write your letter here…" />
      </div>
      {pieces < 4 && <div className="p1-banner bad"><span>You need at least 4 of the 6 pieces. You have {pieces}.</span></div>}
      <div className="p3-card-actions">
        <button className="s1-btn ghost" disabled={busy} onClick={async () => { setBusy(true); await downloadPNG("g74-final", `Financial_Future_Portfolio_${(studentName || "student").replace(/\s+/g, "_")}.png`); setBusy(false); }}><Download size={17} /> {busy ? "Creating…" : "Download PNG"}</button>
        <button className="s1-btn ghost" onClick={print}><Printer size={17} /> Print / PDF</button>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(60, { letter, pieces })}>Publish my portfolio <span className="coin-tag"><Coins size={15} /> +60</span></button></div>
    </ActShell>
  );
}

/* ---------- FUTURE SHOWCASE ---------- */
const SHOW4 = ["I showed my life route (18 · 25 · 30) and my career.", "I explained my investment mix with numbers.", "I described my 5-Year Storm graph with graph words.", "I explained one crypto risk and one security rule.", "I presented my SDGs and my Scale Up results.", "I read part of my letter to my future self."];
function FutureShowcase({ onSave, onExit }) {
  const [checks, setChecks] = useState([]);
  const [peer, setPeer] = useState("");
  const [stars, setStars] = useState({ clear: 0, numbers: 0, english: 0, creative: 0 });
  const [c1, setC1] = useState(""); const [c2, setC2] = useState("");
  const [st, finish] = useFinish(onSave);
  const ready = checks.length >= 5 && peer.trim() && Object.values(stars).every((x) => x > 0) && countWords(c1) >= 3 && countWords(c2) >= 3;
  if (st.done) return <Reward title="Future Showcase done! 🎤" subtitle="You presented your financial future in English." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Mic size={22} strokeWidth={2.1} />} title="Future Showcase 🎤" subtitle="Present your portfolio (3–4 minutes). Then give your tablet to a classmate." onExit={onExit}>
      <div className="start-block">
        <h3><span className="step-n">1</span> My presentation checklist (5 of 6 or more)</h3>
        {SHOW4.map((s) => <label key={s} className="perm-check p1-check"><input type="checkbox" checked={checks.includes(s)} onChange={() => setChecks(checks.includes(s) ? checks.filter((x) => x !== s) : [...checks, s])} /><span>{s}</span></label>)}
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> 🔁 Classmate's feedback</h3>
        <input className="start-input p3-gap" value={peer} onChange={(e) => setPeer(e.target.value)} placeholder="Classmate's name" />
        {[["clear", "The presentation was clear"], ["numbers", "They used numbers and graphs"], ["english", "They spoke in English"], ["creative", "The portfolio was creative"]].map(([k, l]) => (
          <div key={k} className="p3-rub"><div><b>{l}</b></div><span /><div className="p3-stars">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={stars[k] >= n ? "on" : ""} onClick={() => setStars({ ...stars, [k]: n })}>★</button>)}</div></div>
        ))}
        <div className="p3-sentence edit"><span>⭐ The best part was</span><input className="start-input" value={c1} onChange={(e) => setC1(e.target.value)} placeholder="Write it here…" /></div>
        <div className="p3-sentence edit"><span>💡 One idea to improve:</span><input className="start-input" value={c2} onChange={(e) => setC2(e.target.value)} placeholder="Write it here…" /></div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(25, { checks, peer, stars, comments: [c1, c2] })}>Save feedback <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
    </ActShell>
  );
}

/* ---------- BOSS BATTLE DEL AÑO (20 de 36) ---------- */
const BOSS_YEAR = [
  // Periodo 1
  { q: "[P1] Inflation is…", options: ["a general increase in prices over time", "one product becoming cheaper over time", "a type of bank that lends money"], correct: 0, feedback: "General + over time." },
  { q: "[P1] Demand goes up and supply stays the same. The price usually…", options: ["goes up", "goes down", "stays the same"], correct: 0, feedback: "More buyers → higher price." },
  { q: "[P1] A price goes from $4,000 to $5,000. The percent increase is…", options: ["25%", "20%", "1,000%"], correct: 0, feedback: "1,000 ÷ 4,000 × 100." },
  { q: "[P1] Prices rise and your money stays the same. Your purchasing power…", options: ["goes down", "goes up", "doesn't change"], correct: 0, feedback: "Same money, smaller cart." },
  { q: "[P1] Shrinkflation is…", options: ["less product for the same price", "more product for less money", "a discount"], correct: 0, feedback: "Smaller size, same price." },
  { q: "[P1] 1 USD = 4,000 COP. 5 USD = ?", options: ["20,000 COP", "9,000 COP", "800 COP"], correct: 0, feedback: "5 × 4,000." },
  { q: "[P1] Opportunity cost is…", options: ["the next best thing you give up", "the price you pay for a ticket", "a discount you get at a store"], correct: 0, feedback: "What you give up." },
  { q: "[P1] Scarcity means…", options: ["there is not enough for everyone's wants", "there are too many products in stores", "everything in the market is free"], correct: 0, feedback: "Not enough." },
  // Periodo 2
  { q: "[P2] A bank pays you ___ for using your money.", options: ["interest", "a penalty", "a fee"], correct: 0, feedback: "Interest!" },
  { q: "[P2] Simple interest: $200,000 × 5% × 1 year =", options: ["$10,000", "$1,000", "$20,000"], correct: 0, feedback: "200,000 × 0.05." },
  { q: "[P2] Paying with a debit card uses…", options: ["money in your own account", "money borrowed from the issuer", "the store's own money"], correct: 0, feedback: "Debit = your money." },
  { q: "[P2] A text says: “Confirm your PIN here”. This is…", options: ["smishing", "a normal bank message", "vishing"], correct: 0, feedback: "SMS scam = smishing." },
  { q: "[P2] Fogafín protects…", options: ["eligible deposits, up to a limit", "every product, with no limit at all", "only credit card purchases"], correct: 0, feedback: "Deposit insurance." },
  { q: "[P2] Does the highest interest rate always win?", options: ["No — check fees and conditions", "Yes — always choose the biggest rate", "Yes — fees don't matter at all"], correct: 0, feedback: "Remember the Savings Race!" },
  { q: "[P2] A daily lender who threatens people is…", options: ["dangerous — look for help", "a safe and fast option", "the same as a bank loan"], correct: 0, feedback: "Never safe." },
  // Periodo 3
  { q: "[P3] Income $300,000 with the 50/30/20 rule. Savings =", options: ["$60,000", "$90,000", "$150,000"], correct: 0, feedback: "20% of 300,000." },
  { q: "[P3] Compound interest is…", options: ["interest that also earns interest", "interest that is always zero percent", "interest you pay only once a year"], correct: 0, feedback: "The snowball!" },
  { q: "[P3] Paying only the minimum on a card…", options: ["costs a lot more interest", "is the cheapest option", "deletes your debt faster"], correct: 0, feedback: "The debt trap!" },
  { q: "[P3] Break-even = Fixed costs ÷ …", options: ["(price − cost per unit)", "(price + cost per unit)", "(number of customers)"], correct: 0, feedback: "Profit per unit." },
  { q: "[P3] An insurance premium is…", options: ["what you pay for the insurance", "what the insurance pays you", "a prize for paying on time"], correct: 0, feedback: "You pay the premium." },
  { q: "[P3] Habeas Data gives you the right to…", options: ["know and correct your data", "see other people's data", "never share any data"], correct: 0, feedback: "Ley 1581 de 2012." },
  { q: "[P3] Which goal is SMART?", options: ["Save $200,000 for a bike in 5 months", "Save some money for a new bike soon", "Have a lot of bikes in the future"], correct: 0, feedback: "What + how much + when." },
  // Periodo 4
  { q: "[P4] Diversification means…", options: ["spreading money across investments", "putting all money in the best stock", "keeping all your money at home"], correct: 0, feedback: "Don't put all your eggs in one basket." },
  { q: "[P4] Higher possible return usually means…", options: ["higher risk", "lower risk", "zero risk"], correct: 0, feedback: "Risk is the price of growth." },
  { q: "[P4] The best place for your emergency fund is…", options: ["a savings pocket", "a new crypto coin", "a single company stock"], correct: 0, feedback: "Safe and liquid." },
  { q: "[P4] Return 4%, inflation 6%. Real return ≈", options: ["−2%", "+10%", "+2%"], correct: 0, feedback: "4 − 6." },
  { q: "[P4] The creators of a token disappear with the money. That's a…", options: ["rug pull", "bond", "dividend"], correct: 0, feedback: "They pull the rug." },
  { q: "[P4] Your seed phrase should be shared with…", options: ["nobody", "app support only", "your best friend"], correct: 0, feedback: "Never." },
  { q: "[P4] “The price went up and down many times.” It…", options: ["fluctuated", "remained steady", "peaked once"], correct: 0, feedback: "Fluctuate = up and down." },
  { q: "[P4] An investment falls 50%. To recover, it must rise…", options: ["100%", "50%", "150%"], correct: 0, feedback: "From 50 back to 100 = double." },
  { q: "[P4] ESG stands for…", options: ["Environmental, Social, Governance", "Energy, Savings, Growth, Economy", "Economy, Stocks, Gold and Dollars"], correct: 0, feedback: "Planet, people, honesty." },
  { q: "[P4] Greenwashing is…", options: ["pretending to be green", "washing money in a bank", "recycling paper at school"], correct: 0, feedback: "Green paint, no evidence." },
  { q: "[P4] How many SDGs are there?", options: ["17", "7", "71"], correct: 0, feedback: "17 goals for 2030." },
  { q: "[P4] A profitable business can go broke if…", options: ["it runs out of cash", "it has too many customers", "it pays its taxes"], correct: 0, feedback: "Cash flow!" },
  { q: "[P4] An investor pays $3,000,000 for 25%. The company is worth…", options: ["$12,000,000", "$3,000,000", "$7,500,000"], correct: 0, feedback: "3,000,000 ÷ 0.25." },
  { q: "[P4] In a DOFA, “online stores are growing” is an…", options: ["Opportunity", "Strength", "Weakness inside you"], correct: 0, feedback: "Outside, in the world." },
];

/* ---------- SELF-CHECK DEL AÑO ---------- */
const RUBRIC74 = [
  { id: "plan", t: "I can plan my long-term financial life", d: "Life route, SMART goals, DOFA." },
  { id: "invest", t: "I can explain saving vs. investing", d: "Risk, return, liquidity, compound interest." },
  { id: "risk", t: "I can diversify and describe investment graphs", d: "Graph vocabulary + numbers." },
  { id: "digital", t: "I can use FinTech safely and detect crypto scams", d: "2FA, seed phrase, red flags." },
  { id: "ethics", t: "I can make ethical and sustainable money decisions", d: "ESG, SDGs, greenwashing." },
  { id: "biz", t: "I can grow a business without going broke", d: "Cash flow, financing, leadership." },
];
const STAR_L = ["", "Starting", "Developing", "Good", "Excellent"];
function SelfCheck74({ existing, onSave, onExit }) {
  const [stars, setStars] = useState(existing?.stars || {});
  const [change, setChange] = useState(existing?.change || "");
  const [advice, setAdvice] = useState(existing?.advice || "");
  const [st, finish] = useFinish(onSave);
  const all = RUBRIC74.every((r) => stars[r.id]);
  const score = Math.round(RUBRIC74.reduce((a, r) => a + (stars[r.id] || 0), 0) / (RUBRIC74.length * 4) * 100);
  if (st.done) return <Reward title="7th grade complete! 🎓" subtitle="You are ready to build your financial future." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Star size={22} strokeWidth={2.1} />} title="My Self-Check · Grade 7" subtitle="The last activity of the year. Be honest!" onExit={onExit}>
      <div className="p3-rubric">
        {RUBRIC74.map((r) => (
          <div key={r.id} className="p3-rub">
            <div><b>{r.t}</b><small>{r.d}</small></div><span />
            <div className="p3-stars">{[1, 2, 3, 4].map((n) => <button key={n} type="button" className={(stars[r.id] || 0) >= n ? "on" : ""} onClick={() => setStars({ ...stars, [r.id]: n })}>★</button>)}<small>{STAR_L[stars[r.id] || 0]}</small></div>
          </div>
        ))}
      </div>
      <div className="p3-score"><small>My self-check</small><b>{score}%</b><div className="p3-mini-bar"><i style={{ width: `${score}%` }} /></div></div>
      <div className="start-block">
        <label className="p3-lbl">🔁 The biggest change in how I use money this year is…<input className="start-input" value={change} onChange={(e) => setChange(e.target.value)} placeholder="Write your answer here…" /></label>
        <label className="p3-lbl">💌 My advice for next year's 7th graders is…<input className="start-input" value={advice} onChange={(e) => setAdvice(e.target.value)} placeholder="Write your answer here…" /></label>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!all || countWords(change) < 4 || countWords(advice) < 4} onClick={() => finish(25, { stars, score, change, advice })}>Send my self-check <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   ESTRUCTURA DEL PERIODO (7 bloques · clases 33–42)
   ===================================================================== */
const G7P4_WEEKS = [
  { n: 33, g: "33", title: "My life route: 18 · 25 · 30", blurb: "Discover yourself with a DOFA, learn financial independence and build your life roadmap.", e: "🛣️", skills: ["Planning", "Writing"], acts: [
    { key: "c33_swot", title: "Future Me · DOFA Lab 🧭", desc: "Strengths, weaknesses, opportunities, threats → your career match.", icon: <Compass size={22} />, coins: 30, bucket: "aprendi" },
    { key: "c33_learn", title: "Mini Lesson: Your Future Self 📘", desc: "Financial independence · 3 stations · snowball · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes", topics: ["Independence", "SMART", "Snowball", "DOFA"] },
    { key: "c33_future", title: "Future Math 🧮", desc: "8 problems: goals, salaries, compound interest, inflation.", icon: <Calculator size={22} />, coins: 30, bucket: "quizzes" },
    { key: "c33_route", title: "Life Roadmap Builder 🛣️ · Piece 01", desc: "3 goals + a snowball budget that pays for all of them.", icon: <MapIcon size={22} />, coins: 40, bucket: "aprendi" },
  ] },
  { n: 34, g: "34", title: "Saving vs. investing", blurb: "Taste every investment, learn risk vs. return and test a real mix for YOUR goal.", e: "🧪", skills: ["Math", "Reading"], acts: [
    { key: "c34_menu", title: "The Investment Menu 🍽️", desc: "Taste 7 investments with $1,000,000. Serve 6 clients.", icon: <Briefcase size={22} />, coins: 34, bucket: "aprendi" },
    { key: "c34_learn", title: "Mini Lesson: Saving vs. Investing 📘", desc: "CDT · funds · stocks · bonds · dollars · crypto · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes", topics: ["Risk", "Return", "Liquidity", "Real return"] },
    { key: "c34_ladder", title: "The Risk Ladder 🪜", desc: "Order 5 investments from safest to riskiest.", icon: <Layers size={22} />, coins: 24, bucket: "quizzes" },
    { key: "c34_lab", title: "Goal Investing Lab 🧪 · Piece 02", desc: "Mix tools and see 3 futures for your goal.", icon: <Activity size={22} />, coins: 40, bucket: "aprendi" },
  ] },
  { n: 35, g: "35–36", title: "Risk & diversification", blurb: "Live 5 years of news. Then learn why it happened, read the graph and write like an analyst.", e: "🌪️", skills: ["Math", "Writing"], acts: [
    { key: "c35_sim", title: "The 5-Year Storm 🌪️", desc: "Invest $10M. Crises, booms, scandals. Beat 4 rivals!", icon: <Newspaper size={22} />, coins: 40, bucket: "aprendi" },
    { key: "c35_learn", title: "Mini Lesson: Don't Put All Your Eggs in One Basket 📘", desc: "Diversification · volatility · graph words · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes", topics: ["Diversify", "Volatility", "Debt", "Graph words"] },
    { key: "c35_vocab", title: "Graph Talk 📈", desc: "8 graphs: choose the perfect sentence.", icon: <LineIcon size={22} />, coins: 30, bucket: "quizzes" },
    { key: "c35_write", title: "Analyze the Graph ✍️", desc: "Read YOUR storm graph. Write a real analysis.", icon: <PenLine size={22} />, coins: 35, bucket: "aprendi" },
    { key: "c35_debt", title: "Invest or Pay Debt? 🤔", desc: "8 problems: real return, debt, diversification.", icon: <Calculator size={22} />, coins: 30, bucket: "quizzes" },
    { key: "c35_strategy", title: "My Risk Strategy 🛡️ · Piece 03", desc: "Profile + rules + mix. Everything must match.", icon: <ShieldCheck size={22} />, coins: 35, bucket: "aprendi" },
  ] },
  { n: 37, g: "37", title: "FinTech, crypto & cybersecurity", blurb: "Trade in a live crypto market full of hype and scams. Then become a fraud detective.", e: "🚀", skills: ["Digital", "Reading"], acts: [
    { key: "c37_exchange", title: "CREAR Crypto Exchange 🚀", desc: "Secure your wallet. Trade 5 coins for 30 days.", icon: <Bitcoin size={22} />, coins: 40, bucket: "aprendi" },
    { key: "c37_learn", title: "Mini Lesson: FinTech, Crypto and Cybersecurity 📘", desc: "Blockchain · why crypto is exciting · scams · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes", topics: ["Blockchain", "Rug pull", "2FA", "Seed phrase"] },
    { key: "c37_fake", title: "FinTech or Fake? 🕵️", desc: "13 screens: real service or scam?", icon: <Search size={22} />, coins: 45, bucket: "quizzes" },
    { key: "c37_rules", title: "My Safe Digital Toolkit 🔐 · Piece 04", desc: "My tools, my habits, my crypto rule.", icon: <Lock size={22} />, coins: 30, bucket: "aprendi" },
  ] },
  { n: 38, g: "38", title: "Ethical & sustainable finance", blurb: "Hunt greenwashing, run an SDG Impact Fund and make your global commitment.", e: "🌍", skills: ["Reading", "Global"], acts: [
    { key: "c38_green", title: "Green or Greenwashing? 🌱", desc: "10 companies say they are green. Check the evidence!", icon: <Leaf size={22} />, coins: 44, bucket: "quizzes" },
    { key: "c38_learn", title: "Mini Lesson: Money that Does Good 📘", desc: "ESG · the 17 SDGs · green bonds · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes", topics: ["ESG", "SDGs / ODS", "Impact", "Greenwashing"] },
    { key: "c38_sdg", title: "SDG Impact Fund 🌍", desc: "Invest $100M in 4 companies: return + impact.", icon: <Globe size={22} />, coins: 38, bucket: "aprendi" },
    { key: "c38_pledge", title: "My Global Commitment 🤝 · Piece 05", desc: "3 SDGs, my habits, my investor rule.", icon: <Handshake size={22} />, coins: 30, bucket: "aprendi" },
  ] },
  { n: 39, g: "39–40", title: "Scale Up! Business & leadership", blurb: "Your Period 3 business is back. Grow it for 12 months without going broke — and lead your team.", e: "📈", skills: ["Business", "Math"], acts: [
    { key: "c39_learn", title: "Mini Lesson: Growing a Sustainable Business 📘", desc: "Scaling · cash flow · financing growth · leadership · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes", topics: ["Cash flow", "ROI", "Dilution", "3 P's"] },
    { key: "c39_growth", title: "Growth Math 🧮", desc: "8 problems: profit, loans, valuation, payback, ROI.", icon: <Calculator size={22} />, coins: 30, bucket: "quizzes" },
    { key: "c39_scale", title: "Scale Up! 🚀 · Piece 06", desc: "12 months · events · loans, cards, investors.", icon: <Rocket size={22} />, coins: 45, bucket: "aprendi" },
    { key: "c40_lead", title: "The Leader's Dilemmas 👑", desc: "7 decisions: people, planet, profit.", icon: <Crown size={22} />, coins: 34, bucket: "comportamiento" },
  ] },
  { n: 41, g: "41–42", title: "Future Showcase + year closing", blurb: "See how much you grew, your Year Wrapped, your complete portfolio and the Boss of the year.", e: "🏆", skills: ["Speaking", "Review"], acts: [
    { key: "c41_radar", title: "My Money Radar 2.0 🧭", desc: "The same radar from Period 1. How much did you grow?", icon: <Compass size={22} />, coins: 25, bucket: "comportamiento" },
    { key: "c41_wrapped", title: "My Year Wrapped 🎁", desc: "Your 2026 in money — story by story.", icon: <Gift size={22} />, coins: 25, bucket: "comportamiento" },
    { key: "c41_portfolio", title: "Financial Future Portfolio 🗂️", desc: "Builds itself with your whole year + a letter to your future self.", icon: <Award size={22} />, coins: 60, bucket: "aprendi" },
    { key: "c41_present", title: "Future Showcase 🎤", desc: "Present and get feedback.", icon: <Mic size={22} />, coins: 25, bucket: "comportamiento" },
    { key: "c41_boss", title: "Boss Battle of the Year ⚔️", desc: "20 questions from the 4 periods (70% to pass).", icon: <Swords size={22} />, coins: 90, bucket: "quizzes" },
    { key: "c41_self", title: "My Self-Check · Grade 7", desc: "The last stamp of the year.", icon: <Star size={22} />, coins: 25, bucket: "comportamiento" },
  ] },
];
const ALL_ACTS = G7P4_WEEKS.flatMap((w) => w.acts);
const TOTAL_ACTS = ALL_ACTS.length;
const PIECE_ACTS = [...PORT_PIECES.map((p) => p.key), "c41_portfolio"];
const PERIOD_NAMES = [["7P1", "📈", "Why do prices change?"], ["7P2", "🏦", "How banks work"], ["7P3", "📒", "Smart Banking"]];

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Periodo4G7 = ({ userData, API_URL, existingRow, onBack }) => {
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
    setPoints({
      comportamiento: parseFloat(existingRow.Puntos_Comportamiento || 0),
      quizzes: parseFloat(existingRow.Puntos_Quizzes || 0),
      aprendi: parseFloat(existingRow.Puntos_Aprendi || 0),
    });
    force((x) => x + 1);
  }, [existingRow]); // eslint-disable-line react-hooks/exhaustive-deps

  // Datos de los periodos 1, 2 y 3 (para conectar todo el año)
  const rows = { "7P1": store.semanas?.["7P1"], "7P2": store.semanas?.["7P2"], "7P3": store.semanas?.["7P3"] };
  const past = { __p1: parseJSON(rows["7P1"]?.Respuestas_JSON), __p2: parseJSON(rows["7P2"]?.Respuestas_JSON), __p3: parseJSON(rows["7P3"]?.Respuestas_JSON) };

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
      Puntos_Comportamiento: nextPoints.comportamiento,
      Puntos_Quizzes: nextPoints.quizzes,
      Puntos_Aprendi: nextPoints.aprendi,
      Checklist_JSON: JSON.stringify(nextChecklist),
      Respuestas_JSON: JSON.stringify(respRef.current),
    };
    const prev = store.semanas?.[PERIOD_KEY];
    dispatch({ type: "save_progreso", payload: row }); // OPTIMISTA
    fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "save_progreso", data: row }) })
      .catch((e) => { console.error("Error guardando 7° Periodo 4:", e); dispatch({ type: "rollback_progreso", payload: { Semana: PERIOD_KEY, prev } }); });
  };

  const complete = (key, bucket, xp, respPatch, pass = true) => {
    const already = !!checklist[key];
    const nextChecklist = { ...checklist, [key]: already || pass };
    const nextPoints = already ? points : { ...points, [bucket]: points[bucket] + (xp || 0) };
    setChecklist(nextChecklist); setPoints(nextPoints);
    persist(nextChecklist, nextPoints, respPatch);
    return Promise.resolve();
  };

  const WRAP = "s1 p1 p2 p3 p4 g7 g72 g73 g74";

  /* ---------- ACTIVIDAD ABIERTA ---------- */
  if (act) {
    const def = ALL_ACTS.find((a) => a.key === act);
    const resp = { ...(respRef.current || {}), ...past };
    const exit = () => setAct(null);
    const save = (r) => complete(act, def.bucket, r.xp, { [act]: { ...r, at: nowISO() } }, r.passed !== false);
    const lesson = (tag, title, subtitle, sections, glossary, questions, emoji) => (
      <ReadThen tag={tag} title={title} subtitle={subtitle} minutes={7} sections={sections} glossary={glossary} onExit={exit} finishLabel="I read it — start the quiz (8 questions)">
        <QuizRunner title={`${title} · check`} emoji={emoji} questions={questions} pickCount={8} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
      </ReadThen>
    );
    const rounds = (title, subtitle, rds, icon, done, intro) => <NumberRounds icon={icon} title={title} subtitle={subtitle} intro={intro} rounds={rds} coinsPer={3} bonus={6} doneTitle={done} onSave={save} onExit={exit} />;
    let view = null;
    switch (act) {
      case "c33_swot": view = <SwotLab existing={resp.c33_swot} onSave={save} onExit={exit} />; break;
      case "c33_learn": view = lesson("MINI LESSON · A2+ · THE FUTURE", "Your Future Self", "What do you need to do TODAY to be the person you want at 30?", READ_L33, GLOSS_L33, Q_L33, "🛣️"); break;
      case "c33_future": view = rounds("Future Math 🧮", "Goals, salaries and the snowball — with real-life numbers.", FUTURE_ROUNDS, <Calculator size={22} />, "Future planner! 🧮"); break;
      case "c33_route": view = <LifeRoadmap resp={resp} existing={resp.c33_route} onSave={save} onExit={exit} />; break;

      case "c34_menu": view = <InvestMenu onSave={save} onExit={exit} />; break;
      case "c34_learn": view = lesson("MINI LESSON · A2+ · INVESTING", "Saving vs. Investing", "Protect your money or make it grow? (Or both!)", READ_L34, GLOSS_L34, Q_L34, "🧪"); break;
      case "c34_ladder": view = <RiskLadder onSave={save} onExit={exit} />; break;
      case "c34_lab": view = <GoalLab resp={resp} existing={resp.c34_lab} onSave={save} onExit={exit} />; break;

      case "c35_sim": view = <MarketSim existing={resp.c35_sim} onSave={save} onExit={exit} />; break;
      case "c35_learn": view = lesson("MINI LESSON · A2+ · RISK", "Don't Put All Your Eggs in One Basket", "Why did Nico lose 80% and Sara only 5%?", READ_L35, GLOSS_L35, Q_L35, "🧺"); break;
      case "c35_vocab": view = rounds("Graph Talk 📈", "Look at each graph. Choose the sentence that describes it best.", GRAPH_ROUNDS, <LineIcon size={22} />, "Graph talker! 📈", <HowTo>Read the line from left to right. Ask: Does it go up or down? Fast (<i>sharply</i>) or slow (<i>gradually</i>)? Where is the highest point (<i>peak</i>)? Tap any point to see its value.</HowTo>); break;
      case "c35_write": view = <GraphWriter resp={resp} existing={resp.c35_write} onSave={save} onExit={exit} />; break;
      case "c35_debt": view = rounds("Invest or Pay Debt? 🤔", "Real return, debt and diversification with numbers.", DEBT_ROUNDS, <Calculator size={22} />, "Risk manager! 🛡️"); break;
      case "c35_strategy": view = <RiskStrategy resp={resp} existing={resp.c35_strategy} onSave={save} onExit={exit} />; break;

      case "c37_exchange": view = <CryptoExchange onSave={save} onExit={exit} />; break;
      case "c37_learn": view = lesson("MINI LESSON · A2+ · DIGITAL MONEY", "FinTech, Crypto and Cybersecurity", "Exciting, fast — and full of traps", READ_L37, GLOSS_L37, Q_L37, "🚀"); break;
      case "c37_fake": view = <FintechOrFake onSave={save} onExit={exit} />; break;
      case "c37_rules": view = <SafeToolkit resp={resp} existing={resp.c37_rules} onSave={save} onExit={exit} />; break;

      case "c38_green": view = <GreenOrGreenwash onSave={save} onExit={exit} />; break;
      case "c38_learn": view = lesson("MINI LESSON · A2+ · ETHICS", "Money that Does Good", "Your money votes. ESG, the SDGs and greenwashing.", READ_L38, GLOSS_L38, Q_L38, "🌍"); break;
      case "c38_sdg": view = <SdgFund onSave={save} onExit={exit} />; break;
      case "c38_pledge": view = <GlobalPledge resp={resp} existing={resp.c38_pledge} onSave={save} onExit={exit} />; break;

      case "c39_learn": view = lesson("MINI LESSON · A2+ · GROWTH", "Growing a Sustainable Business", "From startup to scale-up — without going broke", READ_L39, GLOSS_L39, Q_L39, "📈"); break;
      case "c39_growth": view = rounds("Growth Math 🧮", "The numbers every growing business needs.", GROWTH_ROUNDS, <Calculator size={22} />, "Growth hacker! 📈"); break;
      case "c39_scale": view = <ScaleUp resp={resp} existing={resp.c39_scale} onSave={save} onExit={exit} />; break;
      case "c40_lead": view = <LeaderLab onSave={save} onExit={exit} />; break;

      case "c41_radar": view = <MoneyRadar2 resp={resp} existing={resp.c41_radar} onSave={save} onExit={exit} />; break;
      case "c41_wrapped": view = <YearWrapped resp={resp} rows={rows} pointsNow={coinsTotal} actsNow={doneCount} studentName={name} onSave={save} onExit={exit} />; break;
      case "c41_portfolio": view = <FuturePortfolio resp={resp} studentName={name} existing={resp.c41_portfolio} onSave={save} onExit={exit} />; break;
      case "c41_present": view = <FutureShowcase onSave={save} onExit={exit} />; break;
      case "c41_boss": view = <QuizRunner title="Boss Battle of the Year" emoji="⚔️" questions={BOSS_YEAR} pickCount={20} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />; break;
      case "c41_self": view = <SelfCheck74 existing={resp.c41_self} onSave={save} onExit={exit} />; break;
      default: view = null;
    }
    return <div className={WRAP}>{view}</div>;
  }

  /* ---------- BLOQUE ABIERTO ---------- */
  if (week) {
    const w = G7P4_WEEKS.find((x) => x.n === week);
    const wDone = w.acts.filter((a) => checklist[a.key]).length;
    const idx = G7P4_WEEKS.indexOf(w);
    const next = G7P4_WEEKS[idx + 1];
    return (
      <div className={WRAP}>
        <button className="s1-back" onClick={() => setWeek(null)}><ArrowLeft size={18} strokeWidth={2.4} /> Back to Period 4</button>
        <div className="s1-hero p1-week-hero g7-hero g74-hero">
          <span className="s1-tag">{w.e} GRADE 7 · PERIOD 4 · CLASS {w.g}</span>
          <h1>{w.title}</h1>
          <p>{w.blurb}</p>
          <div className="s1-progress"><div className="bar"><i style={{ width: `${(wDone / w.acts.length) * 100}%` }} /></div><span className="pill">{wDone}/{w.acts.length}</span></div>
        </div>
        <PortfolioPanel resp={respRef.current} compact />
        <div className="s1-quest">
          {w.acts.map((a) => (
            <div key={a.key} className={`act-card ${checklist[a.key] ? "done" : ""} ${PIECE_ACTS.includes(a.key) ? "g74-piece-act" : ""} ${a.key.endsWith("_learn") ? "g73-learn-act" : ""}`}>
              <div className="act-ico">{checklist[a.key] ? <Check size={22} strokeWidth={3} /> : a.icon}</div>
              <div className="act-main">
                <h3>{a.title}</h3><p>{a.desc}</p>
                {a.topics && <div className="act-topics">{a.topics.map((t) => <span key={t}>{t}</span>)}</div>}
              </div>
              {checklist[a.key]
                ? <button className="act-cta done" onClick={() => setAct(a.key)}>Done ✓</button>
                : <button className="act-cta play" onClick={() => setAct(a.key)}><Play size={16} strokeWidth={2.6} /> Start <span className="coin-tag"><Coins size={14} /> +{a.coins}</span></button>}
            </div>
          ))}
        </div>
        {next && wDone === w.acts.length && (
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => setWeek(next.n)}>Go to class {next.g}: {next.title} <ChevronRight size={18} /></button></div>
        )}
      </div>
    );
  }

  /* ---------- VISTA DEL PERIODO ---------- */
  return (
    <div className={WRAP}>
      <button className="s1-back" onClick={onBack}><ArrowLeft size={18} strokeWidth={2.4} /> Back to overview</button>
      <div className="s1-hero p1-hero g7-hero g74-hero">
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> ADMIN PREVIEW · GRADE {GRADE} · PERIOD 4</span>
        <h1>Building My Financial Future</h1>
        <p>How can smart financial planning help us build a secure future?</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pctDone}%` }} /></div><span className="pill">{pctDone}%</span></div>
        <div className="p1-hero-chips">
          <span><Coins size={14} /> {coinsTotal} coins</span>
          <span><Check size={14} /> {doneCount}/{TOTAL_ACTS} activities</span>
          <span>🗂️ Future Builder</span>
          <span>🎯 SDG 4 · SDG 8 · SDG 12 · SDG 13</span>
        </div>
      </div>

      <div className="g74-year">
        <b>🧭 Your year so far</b>
        <div>
          {PERIOD_NAMES.map(([k, e, t], i) => { const p = Math.round(parseFloat(rows[k]?.Porcentaje || 0)); return (
            <span key={k} className={p >= 100 ? "done" : p > 0 ? "half" : ""}><em>{e}</em><small>PERIOD {i + 1}</small><b>{t}</b><i style={{ "--p": `${Math.min(100, p)}%` }}>{rows[k] ? `${p}%` : "—"}</i></span>
          ); })}
          <span className="now"><em>🗂️</em><small>PERIOD 4</small><b>My Financial Future</b><i style={{ "--p": `${pctDone}%` }}>{pctDone}%</i></span>
        </div>
      </div>

      <PortfolioPanel resp={respRef.current} studentName={name} />
      {checklist.c41_portfolio && <button type="button" className="p3-card-link" onClick={() => setAct("c41_portfolio")}><Award size={18} /> See my Financial Future Portfolio <ChevronRight size={16} /></button>}

      <div className="p1-passport">
        <div className="p1-passport-head"><b>🗂️ Future Builder Passport</b><span>Finish a block to get its stamp</span></div>
        <div className="p1-stamps">
          {G7P4_WEEKS.map((w) => (
            <button key={w.n} type="button" className={`p1-stamp ${weekDone(w) ? "done" : ""}`} onClick={() => setWeek(w.n)} title={w.title}>
              <em>{w.e}</em><small>{w.g}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="p1-weeks">
        {G7P4_WEEKS.map((w) => {
          const d = w.acts.filter((a) => checklist[a.key]).length;
          const full = d === w.acts.length;
          return (
            <button key={w.n} type="button" className={`p1-week-card ${full ? "done" : ""}`} onClick={() => setWeek(w.n)}>
              <div className="p1-week-top"><span className="p1-week-n">Class {w.g}</span><em>{full ? "✅" : w.e}</em></div>
              <h3>{w.title}</h3>
              <p>{w.blurb}</p>
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