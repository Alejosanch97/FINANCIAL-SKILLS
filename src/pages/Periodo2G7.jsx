import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft, BookOpen, Video, Check, X, Coins, Trophy, Sparkles, Clock, ChevronRight, Lightbulb, Play,
  PenLine, Star, Users, Lock, Store, Scale, RefreshCw, Award, Puzzle, Mic, Target, Calculator,
  ShieldCheck, Plus, Minus, Trash2, Search, Swords, Rocket, Download, Printer, ShoppingCart, Globe,
  TrendingUp, TrendingDown, Headphones, Compass, BarChart3, LineChart as LineIcon, Flame, Map as MapIcon,
  Landmark, CreditCard, Smartphone, Briefcase, PiggyBank, Wallet, Send, QrCode, Bell, KeyRound, Mail,
  MessageSquare, Phone as PhoneIcon, FileText, Handshake, Zap, Eye, Unlock, AlertTriangle, Fingerprint,
} from "lucide-react";
import "../Styles/semana1.css";   // botones, quiz, reward, monedas (misma gamificación)
import "../Styles/periodo1.css";  // piezas del Periodo 1 (6°)
import "../Styles/periodo2.css";  // piezas del Periodo 2 (6°)
import "../Styles/periodo3.css";  // piezas del Periodo 3 (6°)
import "../Styles/periodo4.css";  // piezas del Periodo 4 (6°)
import "../Styles/septimo1.css";  // estilos de 7° · Periodo 1 (gráficas, tarjetas…)
import "../Styles/septimo2.css";  // estilos nuevos de 7° · Periodo 2 (banca)
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   GRADO 7 · PERIODO 2 · HOW BANKS WORK: JUNIOR FINANCIAL ADVISORS (A2+)
   Clases 11–21. Hilo del periodo: el ADVISORY PORTFOLIO. El estudiante es
   Junior Financial Advisor de 3 clientes (Sofía, la familia Rodríguez y
   Camila). Cada clase agrega una recomendación (Advisor Note) a la carpeta;
   en la clase 20 el portfolio se arma solo para la feria de asesores.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "7P2", Grado = "7".
   ===================================================================== */

const PERIOD_KEY = "7P2";
const GRADE = "7";

const VIDEO_BANK = "https://res.cloudinary.com/y9r84vgz/video/upload/v1792352473/videoplayback_11.mp4";     // Clase 11 · What is a Bank?
const VIDEO_INTEREST = "https://res.cloudinary.com/y9r84vgz/video/upload/v1792352535/videoplayback_12.mp4"; // Clase 13 · Jenny & Michael (interest)
const VIDEO_FRAUD = "https://res.cloudinary.com/y9r84vgz/video/upload/v1792352749/videoplayback_13.mp4";    // Clase 17 · Account takeover fraud

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
            {r.options.map((o, k) => (
              <button key={k} type="button" disabled={closed || wrong.includes(k)} onClick={() => check(k)}
                className={`quiz-opt ${closed && k === r.correct ? "correct" : ""} ${wrong.includes(k) ? "wrong" : ""}`}>
                <span className="opt-key">{String.fromCharCode(65 + k)}</span><span className="opt-text">{o}</span>
                {closed && k === r.correct && <Check size={18} strokeWidth={3} className="opt-tick" />}
              </button>
            ))}
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

/* =====================================================================
   ADVISORY PORTFOLIO · el hilo de todo el periodo
   ===================================================================== */
const CLIENTS = [
  {
    id: "sofia", e: "🎒", name: "Sofía", tag: "Student · 14 years old", color: "#16b074",
    money: "$40,000 allowance + about $60,000 from her bracelets every month",
    goal: "New headphones · $240,000 in 6 months",
    problem: "She keeps all her money in a piggy bank under her bed.",
    detail: "She spends money too easily when she sees it. She saves only small amounts and wants to see her progress.",
    short: "Headphones $240,000",
  },
  {
    id: "rodriguez", e: "👨‍👩‍👧", name: "The Rodríguez Family", tag: "Family · parents, 2 kids + grandma", color: "#f5b23e",
    money: "$4,200,000 family income every month",
    goal: "An emergency fund + money to repair the roof",
    problem: "They pay almost everything in cash. Grandma has never had a bank account.",
    detail: "Only about $300,000 is free each month. The roof leaks and the rainy season starts in 2 months. Grandma lives 40 minutes from a bank branch.",
    short: "Emergency fund + roof",
  },
  {
    id: "camila", e: "🧁", name: "Camila", tag: "Entrepreneur · 24 years old", color: "#ff6b57",
    money: "She sells desserts on Instagram and gets paid with a digital wallet",
    goal: "An industrial oven · $3,000,000",
    problem: "She mixes her business money with her personal money.",
    detail: "She has more orders than she can bake. She pays suppliers about 20 times a month, and some customers send fake payment screenshots.",
    short: "Industrial oven $3,000,000",
  },
];
const clientById = (id) => CLIENTS.find((c) => c.id === id);

// Notas que alimentan el portfolio (en orden)
const NOTE_KEYS = [
  { key: "c12_note", label: "Recommended account", e: "🏦" },
  { key: "c13_note", label: "Savings plan", e: "🐷" },
  { key: "c15_note", label: "Loan: yes or no?", e: "📝" },
  { key: "c16_note", label: "Digital tools", e: "📱" },
  { key: "c17_guide", label: "Security guide", e: "🛡️" },
  { key: "c18_path", label: "Business funding plan", e: "🧁" },
  { key: "c19_access", label: "Access plan + ethics", e: "🌍" },
];
const FIT_TXT = ["Risky", "Could work", "Great fit"];

function portfolioData(resp) {
  const r = resp || {};
  return CLIENTS.map((c) => {
    const notes = NOTE_KEYS.map((nk) => ({ ...nk, rec: r[nk.key]?.notes?.[c.id] || null })).filter((n) => n.rec);
    const fits = notes.map((n) => Number(n.rec.fit ?? 1));
    const trust = fits.length ? Math.round((fits.reduce((a, b) => a + b, 0) / (fits.length * 2)) * 100) : 0;
    const diag = r.c11_clients?.diag?.[c.id] || null;
    return { ...c, notes, trust, diag };
  });
}

function Meter({ value, color, label }) {
  return (
    <div className="g72-meter">
      {label && <span>{label}</span>}
      <div className="bar"><i style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color || "var(--green)" }} /></div>
      <b>{value}%</b>
    </div>
  );
}

/* Panel del portfolio (menú y páginas de clase) */
function PortfolioPanel({ resp, compact, studentName }) {
  const data = portfolioData(resp);
  const total = data.reduce((a, c) => a + c.notes.length, 0);
  return (
    <div className={`g72-folio ${compact ? "compact" : ""}`}>
      <div className="g72-folio-head">
        <b>📁 My Advisory Portfolio{studentName && !compact ? ` · Junior Advisor ${studentName.split(" ")[0]}` : ""}</b>
        <span>{total} notes</span>
      </div>
      <div className="g72-folio-clients">
        {data.map((c) => (
          <div key={c.id} className="g72-folio-client" style={{ "--cc": c.color }}>
            <em>{c.e}</em>
            <div>
              <b>{c.name}</b>
              <small>🎯 {c.short}</small>
              {!compact && <Meter value={c.trust} color={c.color} label="🤝 Trust" />}
            </div>
            <i>{c.notes.length}/{NOTE_KEYS.filter((n) => n.key !== "c18_path" || c.id === "camila").filter((n) => n.key !== "c19_access" || c.id === "rodriguez").length}</i>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientCard({ c, small }) {
  return (
    <div className={`g72-client ${small ? "small" : ""}`} style={{ "--cc": c.color }}>
      <div className="g72-client-top"><em>{c.e}</em><div><b>{c.name}</b><small>{c.tag}</small></div></div>
      {!small && (
        <ul>
          <li><span>💰</span>{c.money}</li>
          <li><span>🎯</span>{c.goal}</li>
          <li><span>⚠️</span>{c.problem}</li>
          <li className="g72-detail"><span>📌</span>{c.detail}</li>
        </ul>
      )}
    </div>
  );
}

/* ---------- ADVISOR NOTE (misma pantalla cada clase) ----------
   spec = { n, label, question, clients?, options:[{id,e,l,fit:{sofia,rodriguez,camila}|number,note,warn}],
            multi?, extra?: { q, options:[{id,l}] }, frame } */
const fitOf = (o, cid) => (typeof o.fit === "number" ? o.fit : o.fit?.[cid] ?? 1);
// 1 opción: su fit. Varias: 0 si alguna es peligrosa; 2 si casi todas son específicas para ese cliente; si no, 1.
const groupFit = (opts, cid, need) => {
  const f = opts.map((o) => fitOf(o, cid));
  if (need === 1) return f[0];
  if (f.includes(0)) return 0;
  return f.filter((x) => x === 2).length >= need - 1 ? 2 : 1;
};
function AdvisorNote({ spec, coins = 15, existing, onSave, onExit }) {
  const ids = spec.clients || CLIENTS.map((c) => c.id);
  const [notes, setNotes] = useState(() => Object.fromEntries(Object.entries(existing?.notes || {}).map(([k, x]) => [k, { picks: x.ids || [], why: x.why || "", extra: x.extraId || "" }])));
  const [cur, setCur] = useState(ids[0]);
  const [st, finish] = useFinish(onSave);
  const c = clientById(cur);
  const n = notes[cur] || { picks: [], why: "", extra: "" };
  const need = spec.multi || 1;
  const opts = useMemo(() => shuffleArr(spec.options), [spec]);
  const picksObj = n.picks.map((id) => spec.options.find((o) => o.id === id)).filter(Boolean);
  const fit = picksObj.length === need ? groupFit(picksObj, cur, need) : null;
  const clientOk = (cid) => { const x = notes[cid]; return x && x.picks.length === need && countWords(x.why) >= 4 && (!spec.extra || x.extra); };
  const allOk = ids.every(clientOk);
  const set = (patch) => setNotes({ ...notes, [cur]: { ...n, ...patch } });
  const toggle = (id) => {
    if (need === 1) return set({ picks: [id] });
    set({ picks: n.picks.includes(id) ? n.picks.filter((x) => x !== id) : n.picks.length < need ? [...n.picks, id] : n.picks });
  };
  const pickLabel = picksObj.map((o) => o.l).join(" + ");

  const save = () => {
    const out = {};
    ids.forEach((cid) => {
      const x = notes[cid];
      const po = x.picks.map((id) => spec.options.find((o) => o.id === id));
      out[cid] = { picks: po.map((o) => o.l), ids: x.picks, extraId: x.extra || "", why: x.why, extra: x.extra ? spec.extra.options.find((o) => o.id === x.extra)?.l : "", fit: groupFit(po, cid, need) };
    });
    const trust = ids.reduce((a, cid) => a + out[cid].fit, 0);
    finish(coins + trust, { notes: out });
  };

  if (st.done) return <Reward title={`Advisor Note #${spec.n} saved! 📁`} subtitle="Your clients trust you more every class." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Briefcase size={22} strokeWidth={2.1} />} title={`Advisor Note #${spec.n} · ${spec.label}`} subtitle="Listen to each client, choose your recommendation and explain it." onExit={onExit}>
      <div className="g72-note-tabs">
        {ids.map((cid) => {
          const cc = clientById(cid);
          return (
            <button key={cid} type="button" className={`g72-note-tab ${cid === cur ? "on" : ""} ${clientOk(cid) ? "ok" : ""}`} style={{ "--cc": cc.color }} onClick={() => setCur(cid)}>
              <em>{cc.e}</em><span>{cc.name}</span>{clientOk(cid) && <Check size={15} strokeWidth={3} />}
            </button>
          );
        })}
      </div>
      <ClientCard c={c} />
      <div className="start-block">
        <h3><span className="step-n">1</span> {typeof spec.question === "function" ? spec.question(c) : spec.question}</h3>
        {need > 1 && <p className="start-tip">Choose exactly {need}. ({n.picks.length}/{need})</p>}
        <div className="g72-opts">
          {opts.map((o) => (
            <button key={o.id} type="button" className={`g72-opt ${n.picks.includes(o.id) ? "on" : ""}`} onClick={() => toggle(o.id)}>
              <em>{o.e}</em><span>{o.l}</span>
            </button>
          ))}
        </div>
        {fit != null && (
          <div className={`g72-conseq f${fit}`}>
            <b>{fit === 2 ? "✅ Great fit for " + c.name.split(" ")[0] + "!" : fit === 1 ? "🙂 It could work…" : "⚠️ Consequence card"}</b>
            <span>{(fit === 0 ? picksObj.filter((o) => fitOf(o, cur) === 0).map((o) => o.warnFor?.[cur] || o.warn) : picksObj.map((o) => o.noteFor?.[cur] || o.note)).filter(Boolean).join(" ")}</span>
            {fit === 0 && <small>You can change your recommendation. A good advisor reviews the decision.</small>}
            {fit === 1 && <small>💡 Read the 📌 detail of {c.name.startsWith("The") ? "the family" : c.name} again. Is there a more specific option?</small>}
          </div>
        )}
      </div>
      {spec.extra && (
        <div className="start-block">
          <h3><span className="step-n">2</span> {spec.extra.q}</h3>
          <div className="p1-starters">
            {spec.extra.options.map((o) => <button key={o.id} type="button" className={`p1-chip ${n.extra === o.id ? "on" : ""}`} onClick={() => set({ extra: o.id })}>{o.l}</button>)}
          </div>
        </div>
      )}
      <div className="start-block">
        <h3><span className="step-n">{spec.extra ? 3 : 2}</span> Explain it to {c.name.split(" ")[0] === "The" ? "the family" : c.name}</h3>
        <div className="p3-sentence edit">
          <span>{spec.frame || "I recommend"} <b>{pickLabel || "…"}</b> because</span>
          <input className="start-input" value={n.why} onChange={(e) => set({ why: e.target.value })} placeholder="Write your reason here…" />
        </div>
        <p className={`word-count ${countWords(n.why) >= 4 ? "ok" : ""}`}>{countWords(n.why) >= 4 ? "✓ Clear reason" : "Write at least 4 words."}</p>
      </div>
      {ids.length > 1 && !allOk && clientOk(cur) && (
        <div className="start-foot"><button className="s1-btn ghost" onClick={() => setCur(ids.find((x) => !clientOk(x)))}>Next client <ChevronRight size={17} /></button></div>
      )}
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!allOk} onClick={save}>
          {allOk ? "Add to my portfolio" : `Complete ${ids.filter(clientOk).length}/${ids.length} clients`} <span className="coin-tag"><Coins size={15} /> +{coins}</span>
        </button>
      </div>
    </ActShell>
  );
}

/* ---------- PIEZAS VISUALES ---------- */
function PhoneFrame({ children, title = "CREAR Bank", dark }) {
  return (
    <div className={`g72-phone ${dark ? "dark" : ""}`}>
      <div className="g72-phone-status"><span>9:41</span><i /><span>📶 🔋</span></div>
      {title && <div className="g72-phone-title">{title}</div>}
      <div className="g72-phone-screen">{children}</div>
    </div>
  );
}

/* Historia con decisiones: cada escena tiene opciones con consecuencia */
function StoryDecisions({ icon, title, subtitle, scenes, coins = 20, onSave, onExit }) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [log, setLog] = useState([]);
  const [end, setEnd] = useState(false);
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Story complete! 📖" subtitle="Every decision has a consequence." coins={st.coins} saving={st.saving} onExit={onExit} />;
  const s = scenes[i];
  const score = log.reduce((a, x) => a + x, 0);
  if (end) {
    return (
      <ActShell icon={icon} title={title} subtitle="Your decisions, step by step." onExit={onExit}>
        <div className="g72-story-end">
          <em>{score >= scenes.length * 1.5 ? "🏆" : score >= scenes.length ? "🙂" : "🤔"}</em>
          <b>Smart decisions: {log.filter((x) => x === 2).length}/{scenes.length}</b>
          <p>{score >= scenes.length * 1.5 ? "Sofía's money now has a plan — not just a place to sleep!" : "Good start! A real advisor compares options before deciding."}</p>
        </div>
        <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(coins, { score, smart: log.filter((x) => x === 2).length })}>Finish the story <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
      </ActShell>
    );
  }
  const ch = pick != null ? s.choices[pick] : null;
  return (
    <ActShell icon={icon} title={title} subtitle={subtitle} onExit={onExit}>
      <div className="g72-scene-dots">{scenes.map((_, k) => <span key={k} className={k < i ? "seen" : k === i ? "on" : ""} />)}</div>
      <div className="g72-scene">
        <div className="g72-scene-art">{s.e}</div>
        <div className="g72-scene-txt">
          <small>Scene {i + 1} · {s.title}</small>
          <p>{s.text}</p>
        </div>
      </div>
      <div className="g72-choices">
        {s.choices.map((c, k) => (
          <button key={k} type="button" disabled={pick != null} className={`g72-choice ${pick === k ? `on s${c.score}` : ""}`} onClick={() => { setPick(k); setLog([...log, c.score]); }}>
            <span>{"ABC"[k]}</span>{c.l}
          </button>
        ))}
      </div>
      {ch && (
        <div className={`g72-conseq f${ch.score}`}>
          <b>{ch.score === 2 ? "✅ Smart move!" : ch.score === 1 ? "🙂 Not bad, but…" : "⚠️ Consequence"}</b>
          <span>{ch.result}</span>
        </div>
      )}
      {ch && (
        <div className="start-foot">
          <button className="s1-btn primary big" onClick={() => { if (i === scenes.length - 1) setEnd(true); else { setI(i + 1); setPick(null); } }}>
            {i === scenes.length - 1 ? "See my results" : "Next scene"} <ChevronRight size={18} />
          </button>
        </div>
      )}
    </ActShell>
  );
}

/* Tarjeta de pista que se abre (evidence board) */
function ClueCard({ e, t, v, open, onOpen, tone }) {
  return (
    <button type="button" className={`g72-clue ${open ? "open" : ""} ${tone || ""}`} onClick={onOpen}>
      <em>{e}</em><small>{t}</small>
      {open ? <b>{v}</b> : <i>Tap to open</i>}
    </button>
  );
}

/* =====================================================================
   CLASE 11 · WHY DO BANKS EXIST?
   ===================================================================== */
const Q_C11V = [
  { q: "According to the video, what do banks basically do every day?", options: ["They print banknotes and coins", "They buy and sell clothes", "They build new houses", "They borrow and lend money"], correct: 3, feedback: "Banks borrow money (deposits) and lend money (loans)." },
  { q: "What is the payment the bank gives you for letting it use your money?", options: ["A tax", "Interest", "A fine", "A bonus"], correct: 1, feedback: "Interest = the bank pays you for using your money." },
  { q: "You open an account and deposit $10. What do you agree to do?", options: ["Let the bank borrow it for its business", "Spend it right away at the store next door", "Keep it hidden under the bed at home", "Give all the money to a charity group"], correct: 0, feedback: "The bank borrows your money to do banking business." },
  { q: "In the video's example, what interest does the bank pay per year for the $10?", options: ["1 percent", "5 percent", "2 percent", "7 percent"], correct: 2, feedback: "2% per year." },
  { q: "How much extra money does the bank give you every year for your $10?", options: ["10 cents", "20 cents", "50 cents", "70 cents"], correct: 1, feedback: "2% of $10 = 20 cents." },
  { q: "Who does the bank lend the $10 (and other money) to in the example?", options: ["A young couple buying their first house", "A school buying new books for kids", "A farmer who wants to buy some cows", "The government of another country"], correct: 0, feedback: "A young couple buying their first house." },
  { q: "What must people who get a loan from the bank do?", options: ["Keep the money for free forever", "Pay it all back plus fixed interest", "Work for the bank for free", "Pay back only half of the money"], correct: 1, feedback: "They repay everything + interest." },
  { q: "What interest does the couple pay the bank for the house loan?", options: ["2 percent", "3 percent", "5 percent", "7 percent"], correct: 3, feedback: "7% — more than the 2% the bank pays depositors." },
  { q: "How much does the depositor get back after 1 year (money + interest)?", options: ["$10.00", "$10.20", "$10.50", "$10.70"], correct: 1, feedback: "$10 + 20 cents = $10.20." },
  { q: "What was the bank's profit in the video's example?", options: ["20 cents", "30 cents", "50 cents", "70 cents"], correct: 2, feedback: "70 cents (from the couple) − 20 cents (to the depositor) = 50 cents." },
  { q: "According to the video, why can we trust a bank with our money?", options: ["It is kept in safe places, and banks manage billions", "The president watches every account personally", "The money never leaves the bank building at all", "Banks are magic places that cannot lose money"], correct: 0, feedback: "Safe places + banks manage billions of dollars." },
  { q: "At the end, who does the video suggest you ask if you have more questions?", options: ["Your teachers", "Your parents", "The police", "The bank manager"], correct: 1, feedback: "Ask your parents!" },
];

const PIGGY_SCENES = [
  { e: "🐷", title: "The piggy bank", text: "Sofía has $100,000 in a piggy bank under her bed. Her goal: headphones for $240,000 in six months. What should she do with her money today?",
    choices: [
      { l: "Spend it now on snacks and games.", score: 0, result: "The goal moves further away. Money without a plan disappears fast." },
      { l: "Keep everything at home. She can see it every day!", score: 1, result: "It feels safe, but money at home can be lost, stolen or spent too easily." },
      { l: "Keep a little at home and look for a safer place.", score: 2, result: "Great! A plan starts with a safe place for the money." },
    ] },
  { e: "💔", title: "Missing coins", text: "One afternoon Sofía opens the piggy bank. $20,000 is missing! Her little brother ‘borrowed’ it for a video game.",
    choices: [
      { l: "Stop saving. It's impossible at home.", score: 0, result: "Giving up is not a plan. Her goal needs a better system." },
      { l: "Ask an adult to help her compare savings options.", score: 2, result: "Smart! Advice helps people make informed decisions." },
      { l: "Hide the piggy bank in a better place.", score: 1, result: "Maybe safer… but the money still earns nothing and can still disappear." },
    ] },
  { e: "🏦", title: "What does a bank do?", text: "Her teacher says: “A bank keeps deposits, helps with payments and lends money.” Sofía is worried: “Will the bank give MY money to other people?”",
    choices: [
      { l: "It lends deposits and pays me interest.", score: 2, result: "Exactly! Your money works, and you can still get it back." },
      { l: "Yes — the bank keeps my money forever.", score: 0, result: "No. The bank uses deposits to lend, but customers can get their money back under the account rules." },
      { l: "Banks only print money for the country.", score: 0, result: "That's the job of the central bank (Banco de la República), not a normal bank." },
    ] },
  { e: "🔍", title: "Two accounts", text: "Account A: 3% interest per year, but a $9,000 monthly fee. Account B: 1% interest, no fee. Sofía has $100,000. Which one?",
    choices: [
      { l: "Account A — the biggest rate always wins!", score: 0, result: "3% of $100,000 = $3,000 a year… but the fees are $108,000 a year! The rate is not everything." },
      { l: "First compare fees, access, interest and safety.", score: 2, result: "That's how a real advisor thinks: compare ALL the conditions." },
      { l: "Account B — no fee, small interest.", score: 1, result: "Good choice here! But always check access and protection too." },
    ] },
  { e: "🛡️", title: "Is it 100% safe?", text: "Sofía asks: “If I save in a bank, is it completely risk-free?” Her teacher talks about Fogafín, Colombia's deposit insurance.",
    choices: [
      { l: "Yes, every product is guaranteed forever.", score: 0, result: "Not exactly. Not every product or institution is covered — customers must check the conditions." },
      { l: "Eligible deposits are protected up to a limit.", score: 2, result: "Correct! Fogafín protects eligible deposits up to the applicable limit, automatically and for free." },
      { l: "No, money in a bank is never protected.", score: 0, result: "False. Colombia has deposit insurance (Fogafín) for eligible deposits." },
    ] },
];

const READ_C11 = [
  { p: "Sofía has a goal. She wants to buy new headphones for $240,000 COP in six months. Every month, she receives $40,000 COP from her family. She also sells handmade bracelets and earns about $60,000 COP a month." },
  { p: "Sofía has a piggy bank under her bed. She puts all her money inside it. She thinks, “My money is safe here. I can see it every day!”" },
  { p: "One afternoon, Sofía opens the piggy bank. Some coins are missing. She is worried. She also learns that money at home can be lost, stolen, or spent too easily. She needs a better plan." },
  { h: "What does a bank do?" },
  { p: "Her teacher explains that banks help people manage money. A bank can keep deposits, help customers make payments, and lend money to people or businesses. When a bank lends money, it may charge interest. When a customer saves money in certain accounts, the bank may pay interest." },
  { h: "Not only banks" },
  { p: "But banks are not the only financial institutions. A cooperative is an organization owned by its members. Some cooperatives offer savings and credit services to their members. A fintech is a company that uses technology to offer financial services. Some fintech services let people manage money or make payments with a phone." },
  { p: "Colombia also has a central bank: Banco de la República. It has a very different job from an ordinary bank. It issues Colombia's legal money and works to support monetary and financial stability. It is not a normal savings bank where a student opens an everyday personal account." },
  { h: "Is my money protected?" },
  { p: "Sofía asks, “If I save my money in a bank, is it completely risk-free?”" },
  { p: "Her teacher explains that Colombia has a deposit insurance system called Fogafín. It protects eligible deposits at covered financial institutions if one of those institutions is placed into compulsory liquidation, up to the applicable limit. The protection is automatic and free for eligible deposits. However, not every financial product or institution is covered, so customers should check the conditions." },
  { p: "Sofía decides to compare savings options. She wants to understand fees, access to her money, interest, and security before choosing." },
  { h: "Two new clients" },
  { p: "She also meets two new clients: the Rodríguez family and Camila, a young entrepreneur. The family wants an emergency fund and money for roof repairs. Camila sells desserts online and wants to buy an industrial oven." },
  { p: "Their situations are different. A student saving for headphones, a family preparing for an emergency, and a business owner planning to grow may need different financial services. A good financial advisor does not recommend the same product to everyone. First, the advisor listens, asks questions, and understands the client's goal." },
  { box: "Sofía writes in her notebook: “My money needs a plan, not just a place to sleep.”" },
  { p: "Now, you are the Junior Advisor. Your first mission is to discover what each client needs and help them make an informed decision." },
];
const GLOSS_C11 = { "deposit": "Depósito — dinero que pones en una cuenta.", "interest": "Interés.", "lend": "Prestar.", "cooperative": "Cooperativa — de sus miembros.", "fintech": "Empresa de tecnología financiera.", "central bank": "Banco central (Banco de la República).", "Fogafín": "Seguro de depósitos de Colombia.", "deposit insurance": "Seguro de depósitos.", "financial institutions": "Instituciones financieras." };

const INST = [
  { id: "bank", label: "Bank", icon: "🏦", color: "#0b7a50" },
  { id: "coop", label: "Cooperative", icon: "🤝", color: "#e07a2f" },
  { id: "fintech", label: "Fintech", icon: "📱", color: "#16b074" },
  { id: "central", label: "Central Bank", icon: "🏛️", color: "#c9902a" },
];
const INST_ITEMS = [
  { label: "It is owned by its members. They save together and can get credit.", answer: "coop", why: "Members own a cooperative." },
  { label: "It uses an app to offer payments and money services, with no big branches.", answer: "fintech", why: "Technology + financial services = fintech." },
  { label: "It issues Colombia's legal money and supports monetary stability.", answer: "central", why: "That's Banco de la República." },
  { label: "It keeps deposits, offers accounts and lends money to people and businesses.", answer: "bank", why: "Deposits + accounts + loans = a bank." },
  { label: "A student can't open an everyday savings account here.", answer: "central", why: "The central bank is not a normal savings bank." },
  { label: "The members vote and share the benefits.", answer: "coop", why: "In a cooperative, members decide together." },
  { label: "You open a digital account in 5 minutes with your phone.", answer: "fintech", why: "Phone-first services are typical of fintechs." },
  { label: "It has branches and ATMs, and it gives home loans.", answer: "bank", why: "Branches, ATMs and loans: a bank." },
];

/* Meet your clients: emparejar problema y meta + carnet + diagnóstico */
function MeetClients({ studentName, existing, onSave, onExit }) {
  const [step, setStep] = useState(0);
  const probs = useMemo(() => shuffleArr(CLIENTS.map((c) => ({ id: c.id, t: c.problem }))), []);
  const goals = useMemo(() => shuffleArr(CLIENTS.map((c) => ({ id: c.id, t: c.goal }))), []);
  const [m, setM] = useState({});
  const [checked, setChecked] = useState(false);
  const [avatar, setAvatar] = useState(existing?.avatar || "🧑‍💼");
  const [sign, setSign] = useState(existing?.sign || "");
  const [diag, setDiag] = useState(existing?.diag || { sofia: { p: "", g: "" }, rodriguez: { p: "", g: "" }, camila: { p: "", g: "" } });
  const [st, finish] = useFinish(onSave);
  const allPicked = CLIENTS.every((c) => m[c.id + "p"] && m[c.id + "g"]);
  const allOk = CLIENTS.every((c) => m[c.id + "p"] === c.id && m[c.id + "g"] === c.id);
  const diagOk = CLIENTS.every((c) => countWords(diag[c.id].p) >= 3 && countWords(diag[c.id].g) >= 3);
  if (st.done) return <Reward title="Welcome, Junior Advisor! 💼" subtitle="Your 3 clients are waiting for your advice." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Users size={22} strokeWidth={2.1} />} title="Meet Your Clients 💼" subtitle="Step 1: understand · Step 2: your ID · Step 3: first diagnosis" onExit={onExit}>
      <div className="g72-steps">{["Understand", "My ID", "Diagnosis"].map((s, k) => <span key={s} className={k === step ? "on" : k < step ? "done" : ""}>{k < step ? "✓" : k + 1} {s}</span>)}</div>
      {step === 0 && (
        <>
          <p className="start-tip">Read each client's money situation. Then choose their <b>problem</b> and their <b>goal</b>.</p>
          {CLIENTS.map((c) => (
            <div key={c.id} className="start-block g72-meet" style={{ "--cc": c.color }}>
              <div className="g72-client-top"><em>{c.e}</em><div><b>{c.name}</b><small>{c.tag} · 💰 {c.money}</small></div></div>
              {[["p", "⚠️ Problem", probs], ["g", "🎯 Goal", goals]].map(([k, l, list]) => (
                <div key={k} className="g72-meet-row">
                  <span>{l}</span>
                  <div className="p1-starters">
                    {list.map((o) => {
                      const on = m[c.id + k] === o.id;
                      const cls = checked && on ? (o.id === c.id ? "ok" : "no") : "";
                      return <button key={o.id} type="button" className={`p1-chip ${on ? "on" : ""} ${cls}`} onClick={() => { setM({ ...m, [c.id + k]: o.id }); setChecked(false); }}>{o.t}</button>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
          {checked && !allOk && <div className="p1-banner bad">Some answers don't match. Read the money situation again and try once more.</div>}
          <div className="start-foot">
            {checked && allOk
              ? <button className="s1-btn primary big" onClick={() => setStep(1)}>Perfect! Get my Advisor ID <ChevronRight size={18} /></button>
              : <button className="s1-btn primary big" disabled={!allPicked} onClick={() => setChecked(true)}>Check <Check size={17} /></button>}
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <div className="g72-idcard">
            <div className="g72-id-top"><span>🏦 CREAR FINANCIAL ADVISORS</span><small>JUNIOR ADVISOR · GRADE 7</small></div>
            <div className="g72-id-body">
              <div className="g72-id-photo">{avatar}</div>
              <div>
                <b>{studentName}</b>
                <small>Clients: Sofía · The Rodríguez Family · Camila</small>
                <small>Valid: Period 2 · Classes 11–21</small>
                <i className="g72-sign">{sign || "signature"}</i>
              </div>
            </div>
            <div className="g72-id-chip" />
          </div>
          <div className="start-block">
            <h3><span className="step-n">1</span> Choose your photo</h3>
            <div className="p1-starters">{["🧑‍💼", "👩‍💼", "👨‍💼", "🦊", "🐼", "🦁", "🤖", "🦉"].map((a) => <button key={a} type="button" className={`p1-chip big ${avatar === a ? "on" : ""}`} onClick={() => setAvatar(a)}>{a}</button>)}</div>
            <h3><span className="step-n">2</span> Sign your contract</h3>
            <p className="start-tip">“I promise to listen to my clients, compare options and give honest advice.”</p>
            <input className="start-input" value={sign} onChange={(e) => setSign(e.target.value)} placeholder="Type your name to sign" />
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={sign.trim().length < 3} onClick={() => setStep(2)}>Sign and continue <ChevronRight size={18} /></button></div>
        </>
      )}
      {step === 2 && (
        <>
          <p className="start-tip">📁 Your first portfolio note: write the problem and the goal of each client with your own words.</p>
          {CLIENTS.map((c) => {
            const pr = c.id === "rodriguez" ? "Their" : "Her";
            const d = diag[c.id];
            const upd = (k, v) => setDiag({ ...diag, [c.id]: { ...d, [k]: v } });
            return (
              <div key={c.id} className="start-block">
                <ClientCard c={c} small />
                <div className="p3-sentence edit"><span>{pr} problem is</span><input className="start-input" value={d.p} onChange={(e) => upd("p", e.target.value)} placeholder="Write the problem with your own words…" /></div>
                <div className="p3-sentence edit"><span>{pr} goal is</span><input className="start-input" value={d.g} onChange={(e) => upd("g", e.target.value)} placeholder="Write the goal with your own words…" /></div>
              </div>
            );
          })}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!diagOk} onClick={() => finish(20, { avatar, sign, diag })}>Open my portfolio <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   CLASE 12 · BANK ACCOUNTS
   ===================================================================== */
const READ_C12 = [
  { sub: "Three people, three different needs" },
  { p: "The Rodríguez family has an important goal. They want to repair the roof of their house and save money for emergencies. Their income is $4,200,000 COP per month, but they must pay for food, transport, housing, education, and other needs." },
  { p: "The family usually pays in cash. Their grandmother has never had a bank account. She is interested in learning, but she wants a service that is easy to understand and use. The family has only about $300,000 COP free each month. The roof leaks, and the rainy season starts in two months, so they want to keep the roof money separate from the emergency money. Grandma would also like a card to pay at the store near her home without carrying cash." },
  { p: "Camila has a different problem. She sells desserts online and receives payments through a digital wallet. She needs to keep business money separate from personal money. She also needs to know how much she earns and how much she spends. She pays her suppliers about 20 times a month. Many accounts with no fee include only 3 free transfers; after that, each transfer can cost about $3,000 COP." },
  { p: "Sofía wants to save for her headphones. She needs to put money aside and check her progress. She saves about $40,000 COP a month. She knows she spends too easily when the money is in her hand, so she prefers not to have a card yet. A goal tracker in an app could help her stay motivated." },
  { box: "Can one account solve all three problems? Not always. Read each client's needs carefully — you will design a different account for each one." },
  { h: "🐷 Savings account" },
  { p: "A savings account lets a customer keep money and usually make deposits and withdrawals. Depending on the product, it may pay interest. Customers should check the fees, withdrawal conditions, and minimum balance rules." },
  { h: "🧾 Checking account" },
  { p: "A checking account is often used for frequent payments and money management. Some checking accounts offer a debit card or other payment services. The available features and costs depend on the financial institution and product." },
  { h: "🔒 CDT" },
  { p: "A CDT, or Certificado de Depósito a Término, is different. A person deposits money for an agreed period. In return, the product offers an interest rate under specific conditions. Usually, the customer cannot freely withdraw the money before the agreed date without restrictions or costs. A CDT may be useful for money that a person does not need immediately, but it is not a good place for all their emergency savings." },
  { h: "💸 Fees and the 4×1,000" },
  { p: "There may also be fees. A management fee is a cost for maintaining or using a financial product. Some products have no monthly management fee, while others charge one. Customers should read the conditions before choosing." },
  { p: "Colombia also has a financial transaction tax commonly called 4×1,000. In simple terms, it is a tax of four pesos for every thousand pesos of a taxable financial transaction. Its application depends on the rules and exemptions. Not every movement is automatically charged, so customers should check the conditions that apply to their account and transaction." },
  { p: "The Rodríguez family may need easy access to emergency money. Camila may benefit from a separate business account or another suitable way to organize her transactions. Sofía may choose a savings product that fits her goal and allows her to monitor her progress." },
  { sub: "A smart customer asks questions before opening an account:" },
  { list: ["Can I withdraw my money when I need it?", "Is there a monthly fee?", "Does the product pay interest?", "What costs apply to transfers or withdrawals?", "Is the product protected under the applicable deposit insurance rules?"] },
  { box: "The best account is not always the one with the biggest number or the most attractive advertisement. It is the one that fits the customer's needs, costs, and plans." },
];
const GLOSS_C12 = { "savings account": "Cuenta de ahorros.", "checking account": "Cuenta corriente.", "CDT": "Certificado de Depósito a Término.", "management fee": "Cuota de manejo.", "withdrawals": "Retiros.", "withdraw": "Retirar.", "minimum balance": "Saldo mínimo.", "4×1,000": "Gravamen a los movimientos financieros." };
const Q_C12 = [
  { q: "What is a CDT good for?", options: ["Money you will not need for some time", "Money you need for daily payments", "Money you want to spend this weekend"], correct: 0, feedback: "A CDT locks money for an agreed period." },
  { q: "What is a management fee?", options: ["A cost for keeping or using a financial product", "Extra money the bank pays you every month", "A gift you receive when you open an account"], correct: 0, feedback: "A fee is a cost, not a gift." },
  { q: "In simple terms, the 4×1,000 is…", options: ["a tax of 4 pesos for every 1,000 pesos in some transactions", "4 pesos of interest for every 1,000 pesos you save", "a discount of 4 pesos for every 1,000 pesos you spend"], correct: 0, feedback: "It's a tax on taxable financial transactions — check the exemptions." },
  { q: "Why is a CDT not good for ALL the family's emergency money?", options: ["They can't freely withdraw it before the date", "It never pays any interest to the customer", "Only businesses are allowed to open one"], correct: 0, feedback: "Emergencies need easy access." },
  { q: "Which question should a smart customer ask before opening an account?", options: ["Is there a monthly fee?", "What color is the debit card?", "Is the advertisement funny?"], correct: 0, feedback: "Always ask about fees, access, interest and protection." },
];

const ACCOUNTS = [
  { id: "savings", e: "🐷", l: "Savings account" },
  { id: "checking", e: "🧾", l: "Checking account" },
  { id: "cdt", e: "🔒", l: "CDT" },
  { id: "wallet", e: "📱", l: "Digital wallet" },
];
const MATCH_PROFILES = [
  { e: "🚚", who: "Don Pedro", t: "He gets his salary every month and pays many bills and suppliers.", a: "checking", reasons: ["He makes many payments every month", "He wants to lock his money for a year", "It is the account for students"], r: 0 },
  { e: "✈️", who: "Lucía, 15", t: "She wants to save $20,000 every month for a school trip.", a: "savings", reasons: ["She needs to pay many suppliers", "She can deposit and check her progress", "She needs a big credit limit"], r: 1 },
  { e: "👵", who: "Mrs. Gómez", t: "She has $5,000,000 that she will not need for one year.", a: "cdt", reasons: ["She needs that money every day", "It has no conditions at all", "Money she doesn't need now can earn more"], r: 2 },
  { e: "🥟", who: "Andrés", t: "He sells empanadas at a fair, and his customers pay with their phones.", a: "wallet", reasons: ["He can receive payments by phone", "He wants to lock the money for months", "He wants to pay bills with paper checks"], r: 0 },
  { e: "🏠", who: "The Rodríguez family", t: "They want an emergency fund they can use on any day.", a: "savings", reasons: ["The money is locked until next year", "They can take it out when they need it", "It gives them a free credit card"], r: 1 },
  { e: "🏭", who: "A small company", t: "It pays salaries and many suppliers every week.", a: "checking", reasons: ["It is designed only for children", "It locks the money for six months", "It is useful for frequent payments"], r: 2 },
];
function AccountMatchmaker({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [acc, setAcc] = useState(null);
  const [rsn, setRsn] = useState(null);
  const [log, setLog] = useState([]);
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Account Matchmaker! 💘" subtitle="The right account for the right person." coins={st.coins} saving={st.saving} onExit={onExit} />;
  const p = MATCH_PROFILES[i];
  const done = acc !== null && rsn !== null;
  const okA = acc === p.a, okR = rsn === p.r;
  const next = () => {
    const nl = [...log, { a: okA, r: okR }];
    if (i === MATCH_PROFILES.length - 1) { const pts = nl.reduce((s, x) => s + (x.a ? 3 : 0) + (x.r ? 1 : 0), 0); finish(pts + 2, { score: pts, log: nl }); return; }
    setLog(nl); setI(i + 1); setAcc(null); setRsn(null);
  };
  return (
    <ActShell icon={<Handshake size={22} strokeWidth={2.1} />} title="Account Matchmaker 💘" subtitle="Find the best account for each person. A good reason gives a bonus!" onExit={onExit}>
      <div className="p1-match-stats"><span>Person <b>{i + 1}/{MATCH_PROFILES.length}</b></span><span>Matches: <b>{log.filter((x) => x.a).length}</b> 💘</span></div>
      <div className="g72-profile"><em>{p.e}</em><div><b>{p.who}</b><p>{p.t}</p></div></div>
      <div className="start-block">
        <h3><span className="step-n">1</span> Which account?</h3>
        <div className="g72-opts four">
          {ACCOUNTS.map((a) => {
            const cls = acc === null ? "" : a.id === p.a ? "good" : acc === a.id ? "bad" : "";
            return <button key={a.id} type="button" disabled={acc !== null} className={`g72-opt ${acc === a.id ? "on" : ""} ${cls}`} onClick={() => setAcc(a.id)}><em>{a.e}</em><span>{a.l}</span></button>;
          })}
        </div>
      </div>
      {acc !== null && (
        <div className="start-block">
          <h3><span className="step-n">2</span> Why? (bonus)</h3>
          <div className="quiz-options">
            {p.reasons.map((r, k) => (
              <button key={k} type="button" disabled={rsn !== null} className={`quiz-opt ${rsn === null ? "" : k === p.r ? "correct" : rsn === k ? "wrong" : ""}`} onClick={() => setRsn(k)}>
                <span className="opt-key">{"ABC"[k]}</span><span className="opt-text">{r}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {done && <div className={`p1-banner ${okA ? "good" : "bad"}`}>{okA ? "💘 Perfect match!" : `Better match: ${ACCOUNTS.find((a) => a.id === p.a).l}.`} {okR ? "+1 bonus for a great reason." : ""}</div>}
      {done && <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{i === MATCH_PROFILES.length - 1 ? "Finish" : "Next person"} <ChevronRight size={18} /></button></div>}
    </ActShell>
  );
}

/* Fee Detective: 12 recibos */
function FeeDetective({ onSave, onExit }) {
  const [opened, setOpened] = useState([]);
  const [ans, setAns] = useState("");
  const [tries, setTries] = useState(0);
  const [okAnnual, setOkAnnual] = useState(false);
  const [pick, setPick] = useState(null);
  const [st, finish] = useFinish(onSave);
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const sum = opened.length * 15000;
  if (st.done) return <Reward title="Fee Detective! 🕵️" subtitle="Small fees become big costs." coins={st.coins} saving={st.saving} onExit={onExit} />;
  const check = () => { if (num(ans) === 180000) setOkAnnual(true); else setTries(tries + 1); };
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Fee Detective 🕵️" subtitle="Two accounts look the same… but are they?" onExit={onExit}>
      <div className="g72-twoacc">
        {[["Cuenta PLUS ✨", "2% interest", "Debit card", "Mobile app", "Management fee: see receipts"], ["Cuenta SMART 🌱", "2% interest", "Debit card", "Mobile app", "Management fee: $0"]].map(([n, ...f], k) => (
          <div key={n} className={`g72-accard ${k === 0 ? "plus" : ""}`}><b>{n}</b>{f.map((x) => <span key={x}>{x.startsWith("Management") ? <small>{x}</small> : <>✓ {x}</>}</span>)}</div>
        ))}
      </div>
      <div className="start-block">
        <h3><span className="step-n">1</span> Open the 12 monthly receipts of Cuenta PLUS</h3>
        <div className="g72-receipts">
          {MONTHS.map((mn, k) => (
            <button key={mn} type="button" className={`g72-receipt ${opened.includes(k) ? "open" : ""}`} onClick={() => !opened.includes(k) && setOpened([...opened, k])}>
              {opened.includes(k) ? <><small>{mn}</small><b>−$15,000</b><i>management fee</i></> : <><em>✉️</em><small>{mn}</small></>}
            </button>
          ))}
        </div>
        <div className="g72-total">Fees found: <b>{cop(sum)}</b> <span>({opened.length}/12 receipts)</span></div>
      </div>
      {opened.length === 12 && (
        <div className="start-block">
          <h3><span className="step-n">2</span> How much does Cuenta PLUS cost in one year?</h3>
          <div className="p2-answer-row"><span className="p2-unit">$</span><input className="start-input p2-num" type="number" value={ans} disabled={okAnnual} onChange={(e) => setAns(e.target.value)} placeholder="Your answer" /><button className="s1-btn primary" disabled={!ans || okAnnual} onClick={check}>Check <Check size={16} /></button></div>
          {!okAnnual && tries > 0 && <div className="p1-hint">💡 $15,000 × 12 months = ?</div>}
          {okAnnual && <div className="p1-banner good"><Check size={18} /> <span><b>$180,000 a year!</b> Sofía's $100,000 at 2% earns only $2,000 in interest.</span></div>}
        </div>
      )}
      {okAnnual && (
        <div className="start-block">
          <h3><span className="step-n">3</span> Which account is better for Sofía?</h3>
          <div className="g72-opts">
            {["Cuenta PLUS ✨", "Cuenta SMART 🌱"].map((o, k) => <button key={o} type="button" disabled={pick !== null} className={`g72-opt ${pick === k ? "on" : ""} ${pick !== null ? (k === 1 ? "good" : pick === k ? "bad" : "") : ""}`} onClick={() => setPick(k)}><span>{o}</span></button>)}
          </div>
          {pick !== null && <div className={`p1-banner ${pick === 1 ? "good" : "bad"}`}>{pick === 1 ? "Correct! Same features, no fee." : "Careful! The fees ($180,000) are much bigger than the interest ($2,000)."} Always read the conditions.</div>}
        </div>
      )}
      {pick !== null && <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(pick === 1 ? 20 : 14, { annual: 180000, pick: pick === 1 ? "smart" : "plus", tries })}>Close the case <span className="coin-tag"><Coins size={15} /> +20</span></button></div>}
    </ActShell>
  );
}

/* Build your account: diseñar una cuenta para cada cliente */
const FEATURES = [
  { k: "type", l: "Account type", o: [{ v: "savings", l: "🐷 Savings" }, { v: "checking", l: "🧾 Checking" }, { v: "cdt", l: "🔒 CDT" }, { v: "business", l: "💼 Business" }] },
  { k: "plan", l: "Fee plan", o: [{ v: "free", l: "$0 · 3 free transfers a month" }, { v: "pro", l: "$12,000 · unlimited transfers + QR" }] },
  { k: "card", l: "Debit card", o: [{ v: true, l: "💳 Yes" }, { v: false, l: "🚫 No card" }] },
  { k: "pockets", l: "Savings pockets", o: [{ v: 1, l: "1 pocket" }, { v: 2, l: "2 pockets" }] },
  { k: "tracker", l: "Goal tracker in the app", o: [{ v: true, l: "🎯 On" }, { v: false, l: "Off" }] },
];
const TYPE_INFO = { savings: { rate: "1% per year", access: "🔓 Anytime" }, checking: { rate: "0%", access: "🔓 Anytime" }, cdt: { rate: "4% per year", access: "🔒 Locked 6 months" }, business: { rate: "0.5% per year", access: "🔓 Anytime" } };
const NEEDS = {
  sofia: [
    { t: "A savings account (she is saving for a goal)", ok: (d) => d.type === "savings", why: "Sofía doesn't pay bills or run a business. She needs to SAVE and still add money every month (a CDT locks it)." },
    { t: "No monthly fee", ok: (d) => d.plan === "free", why: "She saves $40,000 a month. A $12,000 fee would eat 30% of her savings!" },
    { t: "No card (less impulse spending)", ok: (d) => d.card === false, why: "Read her 📌 detail: she spends too easily when the money is in her hand." },
    { t: "Goal tracker on", ok: (d) => d.tracker === true, why: "She wants to SEE her progress to $240,000." },
  ],
  rodriguez: [
    { t: "Money available any day (emergencies)", ok: (d) => d.type === "savings" || d.type === "checking", why: "An emergency fund can't be locked in a CDT, and the family has no business." },
    { t: "No monthly fee", ok: (d) => d.plan === "free", why: "Only $300,000 is free each month. Every peso counts." },
    { t: "2 pockets: emergency + roof", ok: (d) => d.pockets === 2, why: "If everything is together, the roof money can disappear in an emergency — or the opposite." },
    { t: "A card for Grandma", ok: (d) => d.card === true, why: "Grandma can pay at the correspondent near home without carrying cash." },
  ],
  camila: [
    { t: "A business account (separate from personal)", ok: (d) => d.type === "business", why: "Her main problem is mixing business money with personal money." },
    { t: "Unlimited transfers", ok: (d) => d.plan === "pro", why: "20 supplier payments a month × $3,000 per extra transfer = $51,000. The $12,000 plan is cheaper!" },
    { t: "A card to pay suppliers", ok: (d) => d.card === true, why: "She buys flour and chocolate every week." },
  ],
};
function BuildAccount({ onSave, onExit }) {
  const blank = { type: null, plan: null, card: null, pockets: null, tracker: null, name: "" };
  const [designs, setDesigns] = useState({ sofia: { ...blank }, rodriguez: { ...blank }, camila: { ...blank } });
  const [cur, setCur] = useState("sofia");
  const [tested, setTested] = useState({});
  const [tries, setTries] = useState({});
  const [st, finish] = useFinish(onSave);
  const d = designs[cur];
  const complete = (x) => FEATURES.every((f) => x[f.k] !== null) && x.name.trim().length >= 2;
  const passes = (cid) => NEEDS[cid].every((n) => n.ok(designs[cid]));
  const setF = (k, v) => { setDesigns({ ...designs, [cur]: { ...d, [k]: v } }); setTested({ ...tested, [cur]: false }); };
  const sameAs = CLIENTS.filter((c) => c.id !== cur && tested[c.id] && passes(c.id) && FEATURES.every((f) => designs[c.id][f.k] === d[f.k]));
  const allPass = CLIENTS.every((c) => tested[c.id] && passes(c.id));
  if (st.done) return <Reward title="Account designer! 🛠️" subtitle="Three clients, three different accounts." coins={st.coins} saving={st.saving} onExit={onExit} />;
  const c = clientById(cur);
  const info = d.type ? TYPE_INFO[d.type] : null;
  return (
    <ActShell icon={<Puzzle size={22} strokeWidth={2.1} />} title="Build Your Account 🛠️" subtitle="Each client has different needs. Design a fictional account for each one, then test it!" onExit={onExit}>
      <div className="g72-howto">
        <b>How it works</b>
        <span>1️⃣ Read the client's 📌 detail (from the reading).</span>
        <span>2️⃣ Choose the 5 features of the account.</span>
        <span>3️⃣ Tap <i>Test the account</i>. If a need fails, read why and change it.</span>
        <span>⚠️ One account can't fit everyone — the 3 designs will be different!</span>
      </div>
      <div className="g72-note-tabs">
        {CLIENTS.map((cc) => <button key={cc.id} type="button" style={{ "--cc": cc.color }} className={`g72-note-tab ${cur === cc.id ? "on" : ""} ${tested[cc.id] && passes(cc.id) ? "ok" : ""}`} onClick={() => setCur(cc.id)}><em>{cc.e}</em><span>{cc.name}</span>{tested[cc.id] && passes(cc.id) && <Check size={15} strokeWidth={3} />}</button>)}
      </div>
      <ClientCard c={c} />
      <div className="g72-build">
        <div className="start-block">
          <h3><span className="step-n">1</span> Design the account for {c.name}</h3>
          <input className="start-input p3-gap" value={d.name} onChange={(e) => setF("name", e.target.value)} placeholder="Give your account a name" />
          {FEATURES.map((f) => (
            <div key={f.k} className="g72-feat"><span>{f.l}</span><div className="p1-starters">{f.o.map((o) => <button key={String(o.v)} type="button" className={`p1-chip ${d[f.k] === o.v ? "on" : ""}`} onClick={() => setF(f.k, o.v)}>{o.l}</button>)}</div></div>
          ))}
        </div>
        <div className="g72-bankcard" style={{ "--cc": c.color }}>
          <small>CREAR BANK</small>
          <b>{d.name || "My account"}</b>
          <div>{d.type ? FEATURES[0].o.find((o) => o.v === d.type).l : "Type: —"} {info && `· ${info.access}`}</div>
          <div>{d.plan === null ? "Fee: —" : d.plan === "free" ? "Fee: $0 · 3 transfers" : "Fee: $12,000 · unlimited"}</div>
          <div>{info ? `Interest: ${info.rate}` : "Interest: —"}{d.card ? " · 💳" : ""}{d.pockets ? ` · ${d.pockets} pocket${d.pockets > 1 ? "s" : ""}` : ""}{d.tracker ? " · 🎯" : ""}</div>
          <span>{c.e} for {c.name}</span>
        </div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> Test it with {c.name}'s needs</h3>
        <ul className="g72-needs">
          {NEEDS[cur].map((n) => {
            const ok = n.ok(d);
            return <li key={n.t} className={tested[cur] ? (ok ? "ok" : "no") : ""}>{tested[cur] ? (ok ? "✅" : "❌") : "⬜"} {n.t}{tested[cur] && !ok && <small><br />💡 {n.why}</small>}</li>;
          })}
        </ul>
        {tested[cur] && passes(cur) && <div className="p1-banner good">🎉 This account works for {c.name}!{sameAs.length === 0 && Object.keys(tested).length > 1 ? " And it's different from the others — that's real advice." : ""}</div>}
        <div className="start-foot"><button className="s1-btn ghost" disabled={!complete(d)} onClick={() => { setTested({ ...tested, [cur]: true }); setTries({ ...tries, [cur]: (tries[cur] || 0) + 1 }); }}><Zap size={16} /> Test the account</button></div>
      </div>
      {tested[cur] && passes(cur) && !allPass && <div className="start-foot"><button className="s1-btn ghost" onClick={() => setCur(CLIENTS.find((x) => !(tested[x.id] && passes(x.id))).id)}>Next client <ChevronRight size={17} /></button></div>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!allPass} onClick={() => { const first = CLIENTS.filter((x) => tries[x.id] === 1).length; finish(14 + first * 2, { designs, firstTry: first }); }}>{allPass ? "Save my 3 accounts" : `${CLIENTS.filter((x) => tested[x.id] && passes(x.id)).length}/3 accounts pass`} <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}

const NOTE_C12 = {
  n: 1, label: "Recommended account", question: (c) => `Which account do you recommend for ${c.name}? Read the 📌 detail!`,
  options: [
    { id: "goal", e: "🐷", l: "A savings account with no fee, no card and a goal tracker", fit: { sofia: 2, rodriguez: 1, camila: 0 }, note: "", noteFor: { sofia: "No card = less impulse spending. The tracker shows her progress to $240,000.", rodriguez: "It works for saving, but the family needs two separate pockets and a card for Grandma." }, warn: "Camila needs a card and many transfers for her suppliers." },
    { id: "pockets", e: "🏠", l: "A savings account with 2 pockets (emergency + roof) and a debit card", fit: { sofia: 1, rodriguez: 2, camila: 0 }, note: "", noteFor: { rodriguez: "The emergency money and the roof money stay separate, and Grandma can pay without carrying cash.", sofia: "It could work, but a card makes it easy for Sofía to spend her savings." }, warn: "Camila's problem is mixing business and personal money — pockets for a family don't solve it." },
    { id: "business", e: "💼", l: "A business account with unlimited transfers and QR payments", fit: { sofia: 0, rodriguez: 0, camila: 2 }, note: "", noteFor: { camila: "Business money stays separate, and 20 supplier payments a month cost less with unlimited transfers." }, warn: "This client doesn't have a business — the $12,000 monthly fee would be a waste." },
    { id: "cdt", e: "🔒", l: "A CDT with all the money locked for 6 months", fit: { sofia: 0, rodriguez: 0, camila: 0 }, note: "", warn: "", warnFor: { sofia: "She needs to add money every month and see her progress — a CDT locks everything.", rodriguez: "The roof leaks in 2 months and emergencies can happen any day. Locked money is a problem!", camila: "She needs money every week to buy ingredients." } },
    { id: "checking", e: "🧾", l: "A personal checking account for everything", fit: { sofia: 0, rodriguez: 1, camila: 1 }, note: "", noteFor: { rodriguez: "Useful for paying bills, but it doesn't separate the emergency money from the roof money.", camila: "Better than cash, but if it's personal, she keeps mixing business and personal money." }, warn: "Too many features and costs for a student saving small amounts." },
    { id: "cash", e: "💵", l: "Keep using cash at home", fit: 0, note: "", warn: "Cash at home can be lost, stolen or spent too easily. No interest and no records." },
  ],
};

/* =====================================================================
   CLASE 13 · INTEREST I EARN
   ===================================================================== */
const Q_C13V = [
  { q: "What does Jenny want to buy at the beginning, but she has no money?", options: ["A bicycle", "An ice cream", "A soda", "A bus ticket"], correct: 1, feedback: "An ice cream! 🍦" },
  { q: "Who lends Jenny the money at the beginning of the story?", options: ["Her brother Michael", "Her mom at home", "A friend from school", "The bank near home"], correct: 0, feedback: "Her brother Michael." },
  { q: "Why didn't Michael want to lend Jenny money at first?", options: ["He didn't like ice cream at all", "He was in a hurry to leave", "He didn't trust her to pay him back", "The bank told him not to do it"], correct: 2, feedback: "He wasn't sure she would pay him back." },
  { q: "What does Jenny offer Michael to convince him?", options: ["To pay it all back plus an extra amount", "To work for him for free for a week", "To wash his bicycle every Saturday", "To give him her phone as a guarantee"], correct: 0, feedback: "Money back + an extra amount = interest." },
  { q: "What does the video call the original amount of money that is borrowed?", options: ["The interest", "The profit", "The principal", "The tax"], correct: 2, feedback: "The principal." },
  { q: "How is interest usually expressed to compare different loans?", options: ["As a fixed number of dollars", "As a percentage", "As an exact weight", "As a fraction of time"], correct: 1, feedback: "As a percentage (%)." },
  { q: "How do you calculate the interest rate?", options: ["Multiply the principal by the time", "Subtract the principal from the total", "Interest ÷ principal, written as a %", "Add the ice cream to the bicycle"], correct: 2, feedback: "Interest ÷ principal × 100." },
  { q: "What interest rate does Michael charge Jenny for the ice cream?", options: ["2 percent", "5 percent", "10 percent", "20 percent"], correct: 1, feedback: "5%." },
  { q: "What more expensive thing does Jenny want after the ice cream?", options: ["A new phone", "A skateboard", "A bicycle", "A laptop"], correct: 2, feedback: "A bicycle 🚲." },
  { q: "How do they calculate the interest for the bicycle loan?", options: ["Bicycle price × the interest rate (5%)", "Divide the bicycle price by two", "Add up the days of the month", "Subtract the cost of the ice cream"], correct: 0, feedback: "Price × 5%." },
  { q: "Jenny wants to keep the money 6 more months. What does Michael think?", options: ["Double the time means double the interest", "He should forgive the whole debt", "He shouldn't charge anything extra", "He should cut the interest rate in half"], correct: 0, feedback: "Twice the time → twice the interest." },
  { q: "What is the name of this simple method of adding the interest for each period?", options: ["Compound interest", "Simple interest", "Fixed annual rate", "Bank loan"], correct: 1, feedback: "Simple interest." },
];

const READ_C13 = [
  { p: "Sofía wants to buy headphones that cost $240,000 COP. She receives $40,000 COP each month and earns about $60,000 COP from selling bracelets. She decides to save $30,000 COP every month from her bracelet business." },
  { p: "At first, Sofía thinks saving is easy. She puts the money in her piggy bank and waits. But her friend Mateo tells her about interest. “Interest is extra money you may earn when you save in certain financial products,” Mateo explains. “It can help your savings grow.”" },
  { p: "Sofía visits a fictional bank website. She finds a savings product with a simple annual interest rate of 4%. She also sees another product with a higher rate, but it charges a monthly fee. She needs to compare the options." },
  { h: "Simple interest" },
  { p: "Simple interest is calculated using the original amount of money. A basic formula is:" },
  { box: "Interest = Principal × Annual Rate × Time in Years" },
  { p: "Imagine that Sofía saves $100,000 COP for one year at a simple annual rate of 4%. Her interest is $4,000 COP. At the end of the year, she has $104,000 COP, if there are no fees or other changes." },
  { h: "The fee surprise" },
  { p: "Now imagine that a different product pays 5% simple annual interest but charges a fee of $1,000 COP every month. The interest rate is higher, but the fees add up to $12,000 COP in one year. In this simplified example, the fees are greater than the interest earned on $100,000 COP." },
  { p: "This is why Sofía should not choose a savings product only because it has the highest rate. She must also understand the time period, fees, conditions, and how often interest is calculated. Real accounts may use different interest methods, and their exact results depend on the product's rules." },
  { h: "Remember inflation" },
  { p: "Sofía also remembers a lesson about inflation. If prices rise by 5% in a year and her savings earn only 3%, her money may buy less than before, even though the account balance has increased. The exact change in purchasing power depends on inflation and the return after costs." },
  { p: "She creates a savings plan. Every month, she records the amount she saves, the interest she earns, and how much remains before she reaches her goal." },
  { box: "Saving is not only about putting money away. It is about choosing a suitable product and understanding how the money grows." },
  { p: "Now, the Junior Advisor must help Sofía compare the options and decide which plan fits her goal." },
];
const GLOSS_C13 = { "interest": "Interés.", "principal": "Capital — el dinero original.", "annual rate": "Tasa anual.", "simple interest": "Interés simple.", "fee": "Comisión / cuota.", "purchasing power": "Poder adquisitivo.", "savings plan": "Plan de ahorro." };

/* Interest Machine: 3 controles y 3 retos */
const IM_CHALLENGES = [
  { t: "Find Sofía's interest: $100,000 at 4% for 1 year.", ok: (p, r, y) => p === 100000 && r === 4 && y === 1, ans: "$4,000" },
  { t: "Make the machine produce exactly $8,000 of interest.", ok: (p, r, y) => p * r * y === 800000, ans: "e.g. $100,000 × 4% × 2 years" },
  { t: "Make $200,000 grow to $230,000.", ok: (p, r, y) => p === 200000 && p * r * y === 3000000, ans: "e.g. 5% × 3 years or 3% × 5 years" },
];
function InterestMachine({ onSave, onExit }) {
  const [p, setP] = useState(100000);
  const [r, setR] = useState(3);
  const [y, setY] = useState(1);
  const [done, setDone] = useState({});
  const [st, finish] = useFinish(onSave);
  const interest = Math.round((p * r * y) / 100);
  useEffect(() => {
    const n = { ...done }; let ch = false;
    IM_CHALLENGES.forEach((c, k) => { if (!n[k] && c.ok(p, r, y)) { n[k] = true; ch = true; } });
    if (ch) setDone(n);
  }, [p, r, y]); // eslint-disable-line react-hooks/exhaustive-deps
  const count = Object.keys(done).length;
  if (st.done) return <Reward title="Interest engineer! ⚙️" subtitle="Principal × rate × time — you control it!" coins={st.coins} saving={st.saving} onExit={onExit} />;
  const Ctrl = ({ l, v, set, min, max, step, fmt }) => (
    <label className="g72-ctrl">
      <span>{l}</span>
      <button type="button" onClick={() => set(Math.max(min, v - step))}><Minus size={14} /></button>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(Number(e.target.value))} />
      <button type="button" onClick={() => set(Math.min(max, v + step))}><Plus size={14} /></button>
      <b>{fmt(v)}</b>
    </label>
  );
  return (
    <ActShell icon={<Calculator size={22} strokeWidth={2.1} />} title="Interest Machine ⚙️" subtitle="Change one control and watch the interest change. Complete 3 challenges." onExit={onExit}>
      <div className="g72-machine">
        {Ctrl({ l: "💰 Principal", v: p, set: setP, min: 10000, max: 1000000, step: 10000, fmt: cop })}
        {Ctrl({ l: "📈 Rate / year", v: r, set: setR, min: 1, max: 10, step: 1, fmt: (v) => `${v}%` })}
        {Ctrl({ l: "⏳ Years", v: y, set: setY, min: 1, max: 5, step: 1, fmt: (v) => `${v} yr` })}
        <div className="g72-formula">
          <span>{cop(p)}</span><i>×</i><span>{r}%</span><i>×</i><span>{y}</span><i>=</i><b>{cop(interest)}</b>
        </div>
        <div className="g72-machine-out"><div><small>Interest earned</small><b>{cop(interest)}</b></div><div><small>Total at the end</small><b>{cop(p + interest)}</b></div></div>
      </div>
      <BarChart bars={[{ label: "Principal", value: p, color: "#0b7a50" }, { label: "Interest", value: interest, color: "#f5b23e" }, { label: "Total", value: p + interest, color: "#16b074" }]} />
      <div className="start-block">
        <h3><Target size={18} /> Challenges ({count}/3)</h3>
        <ul className="g72-needs">{IM_CHALLENGES.map((c, k) => <li key={k} className={done[k] ? "ok" : ""}>{done[k] ? "✅" : "⬜"} {c.t} {done[k] && <small> ({c.ans})</small>}</li>)}</ul>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={count < 3} onClick={() => finish(25, { challenges: count })}>Save my machine results <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
    </ActShell>
  );
}

/* Savings Race: 3 productos compiten (2 rondas) */
const RACERS = [
  { id: "turbo", e: "🚀", n: "Bank Turbo", d: "5% per year · $1,000 fee every month", rate: 5, fee: 1000, color: "#ff6b57" },
  { id: "calm", e: "🐢", n: "Bank Calm", d: "3% per year · no fee", rate: 3, fee: 0, color: "#16b074" },
  { id: "piggy", e: "🐷", n: "Piggy bank", d: "0% · no fee", rate: 0, fee: 0, color: "#f5b23e" },
];
const RACE_ROUNDS = [{ p: 100000, t: "Sofía saves $100,000 for 12 months." }, { p: 1000000, t: "Now the Rodríguez family saves $1,000,000 for 12 months." }];
const raceValue = (rc, p, m) => Math.round(p + p * (rc.rate / 100) * (m / 12) - rc.fee * m);
function SavingsRace({ onSave, onExit }) {
  const [round, setRound] = useState(0);
  const [pred, setPred] = useState(null);
  const [month, setMonth] = useState(0);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);
  const [infl, setInfl] = useState(null);
  const [st, finish] = useFinish(onSave);
  const R = RACE_ROUNDS[round];
  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => setMonth((m) => { if (m >= 12) { setRunning(false); return 12; } return m + 1; }), 260);
    return () => clearInterval(t);
  }, [running]);
  const finals = RACERS.map((rc) => ({ ...rc, v: raceValue(rc, R.p, 12) }));
  const winner = finals.slice().sort((a, b) => b.v - a.v)[0];
  const ended = month === 12 && !running;
  const lo = R.p * 0.9, hi = R.p * 1.06;
  const pos = (v) => Math.max(3, Math.min(97, ((v - lo) / (hi - lo)) * 100));
  if (st.done) return <Reward title="Race analyst! 🏁" subtitle="The highest rate doesn't always win." coins={st.coins} saving={st.saving} onExit={onExit} />;
  const nextRound = () => { setLog([...log, pred === winner.id]); setRound(1); setPred(null); setMonth(0); };
  return (
    <ActShell icon={<Flame size={22} strokeWidth={2.1} />} title="Savings Race 🏁" subtitle="Predict the winner. Then watch 12 months in a few seconds!" onExit={onExit}>
      <div className="p1-challenge"><span>Round {round + 1}/2</span><b>{R.t}</b></div>
      <div className="g72-racers">
        {RACERS.map((rc) => (
          <button key={rc.id} type="button" disabled={month > 0} className={`g72-racer ${pred === rc.id ? "on" : ""}`} style={{ "--cc": rc.color }} onClick={() => setPred(rc.id)}>
            <em>{rc.e}</em><b>{rc.n}</b><small>{rc.d}</small>
          </button>
        ))}
      </div>
      <div className="g72-track">
        <div className="g72-track-head"><span>Month <b>{month}</b>/12</span><span>Start: {cop(R.p)}</span></div>
        {RACERS.map((rc) => {
          const v = raceValue(rc, R.p, month);
          return (
            <div key={rc.id} className="g72-lane">
              <span className="g72-lane-n">{rc.e} {rc.n}</span>
              <div className="g72-lane-road"><i className="start" style={{ left: `${pos(R.p)}%` }} /><b style={{ left: `${pos(v)}%`, background: rc.color }}>{rc.e}</b></div>
              <span className={`g72-lane-v ${v < R.p ? "neg" : ""}`}>{cop(v)}</span>
            </div>
          );
        })}
      </div>
      {month === 0 && <div className="start-foot"><button className="s1-btn primary big" disabled={!pred} onClick={() => setRunning(true)}><Play size={16} /> Start the race</button></div>}
      {ended && (
        <>
          <div className={`p1-banner ${pred === winner.id ? "good" : "bad"}`}><span>🏆 Winner: <b>{winner.e} {winner.n}</b> with {cop(winner.v)}. {pred === winner.id ? "Your prediction was right!" : "Your prediction was different."}</span></div>
          <div className="g72-explain">
            {round === 0
              ? <>🚀 Turbo: $100,000 × 5% = <b>$5,000</b> interest − <b>$12,000</b> fees = <b className="neg">−$7,000</b>. The fees ate the interest!</>
              : <>🚀 Turbo: $1,000,000 × 5% = <b>$50,000</b> − $12,000 fees = <b>+$38,000</b>. 🐢 Calm: <b>+$30,000</b>. With more money, the fee matters less.</>}
          </div>
          {round === 0 && <div className="start-foot"><button className="s1-btn primary big" onClick={nextRound}>Round 2 <ChevronRight size={18} /></button></div>}
          {round === 1 && (
            <div className="start-block">
              <h3><span className="step-n">?</span> Inflation check: prices rise 5% this year. Bank Calm pays 3%. Did Sofía's purchasing power grow?</h3>
              <div className="quiz-options">
                {["Yes — her balance is bigger, so she can buy more", "No — prices grew faster than her savings", "It's impossible to know anything about it"].map((o, k) => (
                  <button key={k} type="button" disabled={infl !== null} className={`quiz-opt ${infl === null ? "" : k === 1 ? "correct" : infl === k ? "wrong" : ""}`} onClick={() => setInfl(k)}><span className="opt-key">{"ABC"[k]}</span><span className="opt-text">{o}</span></button>
                ))}
              </div>
              {infl !== null && <div className="p1-banner good">5% inflation &gt; 3% interest → her money buys a little less. Remember Period 1!</div>}
            </div>
          )}
          {round === 1 && infl !== null && <div className="start-foot"><button className="s1-btn primary big" onClick={() => { const l = [...log, pred === winner.id]; finish(15 + l.filter(Boolean).length * 4 + (infl === 1 ? 2 : 0), { predictions: l, inflation: infl === 1 }); }}>Finish the race <span className="coin-tag"><Coins size={15} /> +25</span></button></div>}
        </>
      )}
    </ActShell>
  );
}

/* Goal Builder: cuánto ahorrar y en cuántos meses */
const GOAL_LEVELS = [
  { cid: "sofia", goal: 240000, goalName: "headphones", min: 10000, sliderMax: 100000, step: 5000, safe: 60000, deadline: 6, rate: 4,
    income: ["Allowance", 40000, "Bracelet sales", 60000], needs: ["Transport + snacks (she needs this)", 40000],
    tip: "Sofía can't save ALL her money: she needs $40,000 every month for transport and snacks." },
  { cid: "rodriguez", goal: 1500000, goalName: "emergency fund", min: 50000, sliderMax: 500000, step: 25000, safe: 300000, deadline: 6, rate: 4,
    income: ["Family salaries", 4200000], needs: ["Food, rent, transport, school…", 3900000],
    tip: "The family spends $3,900,000 on needs. They can't save more than what is free." },
  { cid: "camila", goal: 3000000, goalName: "oven fund", min: 50000, sliderMax: 400000, step: 25000, safe: 300000, deadline: 12, rate: 4,
    income: ["Money left in the business each month", 400000], needs: ["Safety cushion for slow months", 100000],
    tip: "Sales change every month. Camila must keep $100,000 as a cushion for slow months." },
];
function monthsTo(goal, monthly, rate, withInt) {
  let bal = 0, m = 0; const series = [0];
  while (bal < goal && m < 36) { m++; bal += monthly; if (withInt) bal += Math.round((bal * rate) / 100 / 12); series.push(bal); }
  return { months: bal >= goal ? m : null, series };
}
function GoalBuilder({ onSave, onExit }) {
  const [lv, setLv] = useState(0);
  const [vals, setVals] = useState({ sofia: 20000, rodriguez: 100000, camila: 100000 });
  const [withInt, setWithInt] = useState(false);
  const [why, setWhy] = useState({ sofia: "", rodriguez: "", camila: "" });
  const [plans, setPlans] = useState({});
  const [st, finish] = useFinish(onSave);
  const L = GOAL_LEVELS[lv];
  const c = clientById(L.cid);
  const v = vals[L.cid];
  const res = monthsTo(L.goal, v, L.rate, withInt);
  const onTime = res.months !== null && res.months <= L.deadline;
  const realistic = v <= L.safe;
  const ok = onTime && realistic;
  const shown = res.series.slice(0, Math.max(7, Math.min(res.series.length, 13)));
  const inc = []; for (let k = 0; k < L.income.length; k += 2) inc.push([L.income[k], L.income[k + 1]]);
  const totalInc = inc.reduce((a2, x) => a2 + x[1], 0);
  if (st.done) return <Reward title="Goal builder! 🎯" subtitle="Three clients, three realistic plans." coins={st.coins} saving={st.saving} onExit={onExit} />;
  const lock = () => {
    const np = { ...plans, [L.cid]: { monthly: v, months: res.months, interest: withInt, why: why[L.cid] } };
    setPlans(np);
    if (lv < GOAL_LEVELS.length - 1) { setLv(lv + 1); setWithInt(false); } else finish(25, { plans: np });
  };
  return (
    <ActShell icon={<Target size={22} strokeWidth={2.1} />} title="Goal Builder 🎯" subtitle="Find a monthly amount that reaches the goal ON TIME and is REALISTIC for each client." onExit={onExit}>
      <div className="g72-howto">
        <b>How it works</b>
        <span>1️⃣ Look at the client's monthly money: what comes in and what they really need.</span>
        <span>2️⃣ Move the slider to choose how much to save every month.</span>
        <span>3️⃣ The graph shows the savings growing month by month until the goal line.</span>
        <span>✅ Your plan is good only if it is <b>on time</b> (before the deadline) AND <b>realistic</b> (the client can still pay their needs).</span>
      </div>
      <div className="g72-steps">{GOAL_LEVELS.map((g, k) => <span key={g.cid} className={k === lv ? "on" : k < lv ? "done" : ""}>{k < lv ? "✓" : k + 1} {clientById(g.cid).name}</span>)}</div>
      <ClientCard c={c} small />
      <div className="g72-budget2">
        <div><small>💵 Comes in every month</small>{inc.map(([l, x]) => <span key={l}>{l}<b>{cop(x)}</b></span>)}</div>
        <div><small>🧾 Needs (can't be saved)</small><span>{L.needs[0]}<b>−{cop(L.needs[1])}</b></span></div>
        <div className="max"><small>🐷 The most they can save</small><b>{cop(totalInc - L.needs[1])}</b></div>
      </div>
      <div className="p1-banner"><span>🎯 Goal: <b>{cop(L.goal)}</b> for the {L.goalName} · ⏰ Deadline: <b>{L.deadline} months</b>. {L.tip}</span></div>
      <div className="g72-machine">
        <label className="g72-ctrl">
          <span>💰 Save per month</span>
          <button type="button" onClick={() => setVals({ ...vals, [L.cid]: Math.max(L.min, v - L.step) })}><Minus size={14} /></button>
          <input type="range" min={L.min} max={L.sliderMax} step={L.step} value={v} onChange={(e) => setVals({ ...vals, [L.cid]: Number(e.target.value) })} />
          <button type="button" onClick={() => setVals({ ...vals, [L.cid]: Math.min(L.sliderMax, v + L.step) })}><Plus size={14} /></button>
          <b>{cop(v)}</b>
        </label>
        <label className="perm-check p1-check"><input type="checkbox" checked={withInt} onChange={(e) => setWithInt(e.target.checked)} /><span>Add {L.rate}% simple interest per year (savings account)</span></label>
        <div className="g72-machine-out">
          <div><small>Months to reach {cop(L.goal)}</small><b className={onTime ? "" : "neg"}>{res.months ?? "36+"}</b></div>
          <div><small>Left for needs</small><b className={realistic ? "" : "neg"}>{cop(totalInc - v)}</b></div>
        </div>
      </div>
      <div className={`g72-conseq ${ok ? "f2" : "f0"}`}>
        <b>{ok ? "✅ Realistic and on time!" : !realistic ? "⚠️ Not realistic" : "⏳ Too slow"}</b>
        <span>{ok ? `${cop(v)} × ${res.months} months reaches the goal, and ${c.name.startsWith("The") ? "they" : "she"} can still pay the needs.` : !realistic ? `Saving ${cop(v)} leaves only ${cop(totalInc - v)} — less than the ${cop(L.needs[1])} needed. Save a little less.` : `With ${cop(v)} a month, the goal takes ${res.months ?? "more than 36"} months. The deadline is ${L.deadline}. Save a little more.`}</span>
      </div>
      <LineChart labels={shown.map((_, k) => `M${k}`)} series={[{ name: "Savings", values: shown, color: c.color }, { name: "Goal", values: shown.map(() => L.goal), color: "#0b7a5066" }]} yMin={0} />
      {withInt && <p className="start-tip">💡 With small amounts, interest helps only a little. The monthly habit is the real engine!</p>}
      {ok && (
        <div className="start-block">
          <div className="p3-sentence edit"><span>This plan works for {c.name} because</span><input className="start-input" value={why[L.cid]} onChange={(e) => setWhy({ ...why, [L.cid]: e.target.value })} placeholder="Write your reason here…" /></div>
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok || countWords(why[L.cid]) < 4} onClick={lock}>Lock {c.name.startsWith("The") ? "the family's" : `${c.name}'s`} plan <ChevronRight size={18} /></button></div>
    </ActShell>
  );
}

const NOTE_C13 = {
  n: 2, label: "Savings plan", question: (c) => `What savings plan do you recommend for ${c.name}?`,
  options: [
    { id: "fixed", e: "📅", l: "Save $40,000 from the bracelets every month for 6 months", fit: { sofia: 2, rodriguez: 0, camila: 0 }, note: "", noteFor: { sofia: "$40,000 × 6 = $240,000 — and she still has $60,000 for her life." }, warn: "", warnFor: { rodriguez: "$40,000 a month is far too slow for a $1,500,000 emergency fund.", camila: "Camila's income changes with her sales — a fixed amount from bracelets doesn't fit her." } },
    { id: "emergency", e: "🛟", l: "Save $250,000 a month: emergency pocket first, then the roof pocket", fit: { sofia: 0, rodriguez: 2, camila: 1 }, note: "", noteFor: { rodriguez: "Emergencies first! $250,000 fits in the $300,000 they have free.", camila: "Having an emergency fund is smart, but her main goal is the oven, from her sales." }, warn: "Sofía only earns $100,000 a month — she can't save $250,000." },
    { id: "percent", e: "💼", l: "Save 15% of every sale in the business account (oven fund)", fit: { sofia: 1, rodriguez: 0, camila: 2 }, note: "", noteFor: { camila: "When sales go up, the oven fund grows faster. When sales go down, she still saves something.", sofia: "It could work with her bracelet sales, but a fixed monthly amount is easier to track for her goal." }, warn: "The family has a salary, not sales — a percent of sales doesn't apply." },
    { id: "cdt", e: "🔒", l: "Put all the savings in a CDT for one year", fit: 0, note: "", warn: "", warnFor: { sofia: "Her goal is in 6 months — the money would be locked for a year.", rodriguez: "An emergency fund must be available any day.", camila: "She needs the money for ingredients and the oven sooner." } },
    { id: "turbo", e: "🚀", l: "Choose the account with the highest rate, without checking the fees", fit: 0, note: "", warn: "Fees can eat the interest — remember the Savings Race!" },
    { id: "piggy", e: "🐷", l: "Keep saving in the piggy bank at home", fit: 0, note: "", warn: "Money at home earns nothing and can disappear — that already happened to Sofía!" },
  ],
};

/* =====================================================================
   CLASE 14 · CREDIT VS. DEBIT
   ===================================================================== */
const WARM_C14 = [
  { tag: "6th GRADE BASICS", q: "At the bakery, Sofía holds her card near the machine and pays $6,000. How does she pay?", options: ["She taps the card", "She scans a QR code", "She types her PIN"], correct: 0, explain: "Contactless = tap." },
  { tag: "6th GRADE BASICS", q: "The fruit seller shows a black-and-white square. Camila uses her phone camera to pay. How?", options: ["She taps the card", "She scans a QR code", "She types her PIN"], correct: 1, explain: "A QR code is scanned with the phone." },
  { tag: "6th GRADE BASICS", q: "At the ATM, Mr. Rodríguez takes out cash. The machine asks for a secret 4-digit number. What is it?", options: ["His card number", "His QR code", "His PIN"], correct: 2, explain: "PIN = Personal Identification Number." },
  { tag: "6th GRADE BASICS", q: "A message asks Grandma to send her PIN to “win a prize”. What should she do?", options: ["Send it quickly to win", "Never share her PIN", "Share only half of it"], correct: 1, explain: "Your PIN is secret. Always." },
];

const READ_C14 = [
  { sub: "The story of two cards" },
  { p: "On Saturday, Sofía visits a shopping center with her friend. She wants to buy a pair of shoes, but she also wants to save money for her headphones." },
  { p: "At a store, Sofía sees two cards. One says DEBIT. The other says CREDIT. Her friend asks, “Are they the same?” “No,” says the store assistant. “They can both help you pay, but the money comes from different places.”" },
  { h: "💳 Debit card" },
  { p: "A debit card is connected to an account. When you pay with it, the money usually comes from the available money in that account. If Sofía has $100,000 COP in her account and buys something for $30,000 COP, her balance usually becomes $70,000 COP, assuming there are no other transactions or fees." },
  { h: "💳 Credit card" },
  { p: "A credit card works differently. The card issuer gives the customer access to a credit limit. The customer can use that credit to pay for purchases and must repay the amount according to the agreement." },
  { p: "Imagine that Sofía uses a credit card to buy a jacket for $150,000 COP. The jacket is not free. She has borrowed money through the card and now owes the amount charged. Depending on the card conditions, she may have to pay interest, fees, or other charges." },
  { p: "Some credit cards offer a period in which purchases do not generate interest if the customer pays the full statement on time and meets the conditions. However, customers must read their agreement carefully. Paying only part of the bill can make the purchase more expensive." },
  { p: "A debit card can also have fees or limits. It is not automatically free, and the customer must still protect the card and account information." },
  { h: "So, which is better?" },
  { p: "Sofía asks, “So, is debit always better than credit?” Her teacher explains that the answer depends on the person, the product, and the situation. A debit card can help someone spend money already available in an account. A credit card may be useful for some purchases or emergencies, but only when the customer understands the cost and can repay the debt." },
  { box: "The important difference is not the plastic card. It is where the money comes from and what the customer must do next." },
  { p: "Sofía decides not to buy the shoes immediately. She checks her savings goal first. She knows that a payment can be easy today and still affect her budget tomorrow." },
  { p: "Now, your mission is to follow the money. When someone pays with debit, where does the money come from? When someone pays with credit, who must be repaid?" },
];
const GLOSS_C14 = { "debit card": "Tarjeta débito.", "credit card": "Tarjeta de crédito.", "credit limit": "Cupo de crédito.", "card issuer": "Emisor de la tarjeta.", "statement": "Extracto.", "balance": "Saldo.", "repay": "Pagar de vuelta.", "owes": "Debe." };
const Q_C14 = [
  { q: "When Sofía pays with a debit card, where does the money come from?", options: ["From the money in her own account", "From a credit limit the bank gives her", "From the store's own bank account"], correct: 0, feedback: "Debit = your own available money." },
  { q: "Sofía buys a $150,000 jacket with a credit card. What happens?", options: ["She borrowed money and now owes $150,000", "The jacket is free because she used a card", "The store pays for the jacket for her"], correct: 0, feedback: "Credit = borrowed money you must repay." },
  { q: "What can make a credit card purchase more expensive?", options: ["Paying only part of the bill", "Paying the full bill on time", "Checking the statement every month"], correct: 0, feedback: "Paying only part can add interest." },
  { q: "Is a debit card always free?", options: ["No — it can have fees or limits", "Yes — debit cards never cost money", "Yes — but only for students"], correct: 0, feedback: "Always check fees and limits." },
  { q: "What is the important difference between debit and credit?", options: ["Where the money comes from", "The color of the plastic", "The size of the card"], correct: 0, feedback: "Follow the money!" },
];

const LIGHTNING = [
  { t: "Sofía pays $30,000. Her account balance goes from $100,000 to $70,000.", a: "debit" },
  { t: "Mr. Rodríguez buys a fridge. Next month a bill arrives and he must repay the card issuer.", a: "credit" },
  { t: "Camila pays for flour with money she already has in her account.", a: "debit" },
  { t: "Laura uses her credit limit to buy a plane ticket.", a: "credit" },
  { t: "Mateo's purchase is rejected because his account has only $5,000.", a: "debit" },
  { t: "Ana pays only part of her monthly statement and is charged interest.", a: "credit" },
  { t: "The money comes out of Grandma's savings account immediately.", a: "debit" },
  { t: "Pablo spends $200,000 that he doesn't have yet. Now he owes it.", a: "credit" },
  { t: "Sofía checks her app: the purchase reduced her available balance.", a: "debit" },
  { t: "The issuer gives Don Pedro a $2,000,000 limit to use and repay.", a: "credit" },
];
const PATH = {
  debit: [{ e: "🏦", t: "Your account" }, { e: "➡️", t: "" }, { e: "🏬", t: "Store" }, { e: "✅", t: "Paid with YOUR money" }],
  credit: [{ e: "🏛️", t: "Card issuer" }, { e: "➡️", t: "" }, { e: "🏬", t: "Store" }, { e: "🧾", t: "YOU owe the issuer" }],
};
function LightningCards({ onSave, onExit }) {
  const deck = useMemo(() => shuffleArr(LIGHTNING), []);
  const [i, setI] = useState(-1);
  const [pick, setPick] = useState(null);
  const [time, setTime] = useState(8);
  const [log, setLog] = useState([]);
  const [st, finish] = useFinish(onSave);
  useEffect(() => {
    if (i < 0 || pick !== null) return undefined;
    const t = setInterval(() => setTime((x) => (x > 0 ? x - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [i, pick]);
  if (st.done) return <Reward title="Lightning champion! ⚡" subtitle="You can follow the money." coins={st.coins} saving={st.saving} onExit={onExit} />;
  const c = deck[i];
  const answer = (a) => { if (pick !== null) return; setPick(a); setLog([...log, { ok: a === c.a, fast: time > 0 }]); };
  const correct = log.filter((x) => x.ok).length;
  const fast = log.filter((x) => x.ok && x.fast).length;
  return (
    <ActShell icon={<Zap size={22} strokeWidth={2.1} />} title="Debit or Credit? ⚡" subtitle="10 lightning cards. Answer before the timer ends for a bonus!" onExit={onExit}>
      {i < 0 ? (
        <div className="g72-cards-intro">
          <div className="g72-plastic debit"><small>CREAR BANK</small><b>DEBIT</b><span>Money from YOUR account</span></div>
          <div className="g72-plastic credit"><small>CREAR BANK</small><b>CREDIT</b><span>Borrowed money · repay it</span></div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => setI(0)}><Play size={16} /> Start the lightning round</button></div>
        </div>
      ) : (
        <>
          <div className="p1-match-stats"><span>Card <b>{i + 1}/10</b></span><span className={`g72-timer ${time <= 3 ? "low" : ""}`}>⏱️ {time}s</span><span>Correct: <b>{correct}</b> · Fast: <b>{fast}</b>⚡</span></div>
          <div className="g72-scene-card">{c.t}</div>
          <div className="g72-dropzone">
            {["debit", "credit"].map((a) => (
              <button key={a} type="button" disabled={pick !== null} className={`g72-plastic ${a} ${pick === a ? (a === c.a ? "good" : "bad") : pick !== null && a === c.a ? "good" : ""}`} onClick={() => answer(a)}>
                <small>CREAR BANK</small><b>{a.toUpperCase()}</b><span>{a === "debit" ? "Tap if it's my money" : "Tap if it's borrowed"}</span>
              </button>
            ))}
          </div>
          {pick !== null && (
            <>
              <div className="g72-path">
                {PATH[c.a].map((n, k) => <span key={k} className={n.t ? "node" : "arrow"} style={{ animationDelay: `${k * 0.18}s` }}><em>{n.e}</em>{n.t && <small>{n.t}</small>}</span>)}
              </div>
              <div className={`p1-banner ${pick === c.a ? "good" : "bad"}`}>{pick === c.a ? "✅ Correct!" : `❌ It's ${c.a.toUpperCase()}.`} {c.a === "debit" ? "The money came from the person's own account." : "The issuer paid — the person must repay."}</div>
              <div className="start-foot"><button className="s1-btn primary big" onClick={() => { if (i === 9) finish(correct * 2 + fast, { correct, fast }); else { setI(i + 1); setPick(null); setTime(8); } }}>{i === 9 ? "Finish" : "Next card"} <ChevronRight size={18} /></button></div>
            </>
          )}
        </>
      )}
    </ActShell>
  );
}

const PATH_DEBIT = ["Sofía taps her debit card at the store.", "The money leaves her account.", "The store receives the payment.", "Her available balance is lower."];
const PATH_CREDIT = ["Sofía pays with her credit card.", "The card issuer pays the store.", "The store receives the payment.", "Sofía now owes the issuer.", "A statement arrives with the amount.", "Sofía repays — on time and in full costs less."];
function FollowMoney({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [errs, setErrs] = useState(0);
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Money tracker! 🧭" subtitle="You followed the money step by step." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Compass size={22} strokeWidth={2.1} />} title="Follow the Money 🧭" subtitle={stage === 0 ? "Path 1 · DEBIT: put the steps in order." : "Path 2 · CREDIT: this path is longer!"} onExit={onExit}>
      <div className="g72-steps"><span className={stage === 0 ? "on" : "done"}>{stage > 0 ? "✓" : 1} Debit path</span><span className={stage === 1 ? "on" : ""}>2 Credit path</span></div>
      {stage === 0
        ? <OrderGame key="d" items={PATH_DEBIT} labels={["Step 1", "Step 2", "Step 3", "Step 4"]} onDone={(r) => { setErrs(r.errors); setStage(1); }} />
        : <OrderGame key="c" items={PATH_CREDIT} labels={["Step 1", "Step 2", "Step 3", "Step 4", "Step 5", "Step 6"]} onDone={(r) => finish(Math.max(10, 20 - (errs + r.errors) * 2), { errors: errs + r.errors })} />}
    </ActShell>
  );
}

/* =====================================================================
   CLASE 15 · RESPONSIBLE BORROWING
   ===================================================================== */
const READ_C15 = [
  { sub: "Can a small payment hide a big cost?" },
  { p: "Camila has a small dessert business. She sells cakes, brownies, and cookies through Instagram. Her customers like her products, and before buying her big oven, she wants a professional mixer." },
  { p: "The mixer costs $1,000,000 COP. Camila does not have enough money today, so she looks at three offers." },
  { list: ["🏦 The first offer is from a fictional bank. It allows her to pay in twelve monthly installments. The bank provides information about the interest rate, fees, and total cost.", "🏬 The second offer comes from a store. It says, “Take it today! No down payment!” Camila feels excited, but she notices that the advertisement does not show the full cost clearly. She must ask for the payment schedule and all charges before signing.", "💀 The third offer comes from a person who lends money every day. The person promises fast cash but asks for very high payments and threatens customers who cannot pay. This is a dangerous situation."] },
  { box: "The smallest payment is not always the cheapest loan." },
  { h: "Principal, interest and total cost" },
  { p: "A loan is money that someone borrows and must repay under agreed conditions. The principal is the amount borrowed. Interest is the cost of borrowing money. Fees and other charges can also increase the total cost." },
  { p: "Suppose Camila borrows $1,000,000 COP. In a simple classroom example, she repays $100,000 COP every month for twelve months. Her total payments are $1,200,000 COP. The extra $200,000 COP is the difference between the total paid and the original amount borrowed. To know the exact cost of a real loan, she must also check whether the payment includes all interest, fees, insurance, and other charges." },
  { h: "Good debt? Bad debt?" },
  { p: "Some debt can support a useful plan. For example, a business loan may help Camila buy equipment that increases production and income. But a loan is not automatically “good debt.” If sales are uncertain or the payments are too high, the debt can become a problem." },
  { p: "Borrowing money for something that is not necessary, without a plan to repay it, can create financial stress. A person may need to borrow more money to pay the first loan. This can create a cycle of debt." },
  { h: "⚠️ Gota a gota" },
  { p: "Camila also hears about gota a gota, an informal lending practice in Colombia that can involve extremely costly conditions, threats, harassment, or violence. It is not a safe substitute for a regulated loan. A person who faces threats should seek help from trusted adults or appropriate authorities instead of confronting the lender alone." },
  { p: "In Colombia, the Superintendencia Financiera de Colombia publishes information about interest rates and the legal usury limit for relevant credit operations. The limit changes over time and depends on the applicable rules. A customer should check current official information instead of relying on a number from an old advertisement." },
  { p: "Camila compares the offers. She checks the total repayment amount, the installment, the due dates, the interest, the fees, and her expected business income. She also asks herself whether she can make the payments during a slow month." },
  { box: "A responsible borrower does not ask only, “Can I get the money today?” The better question is, “Can I repay this loan safely, and is the purchase worth the total cost?”" },
  { p: "Your mission is to become Camila's loan advisor. Compare the offers, calculate the total cost, and explain which option is safer — or whether she should wait and save first." },
];
const GLOSS_C15 = { "loan": "Préstamo.", "principal": "Capital prestado.", "installments": "Cuotas.", "installment": "Cuota.", "down payment": "Cuota inicial.", "total cost": "Costo total.", "usury limit": "Tasa de usura.", "cycle of debt": "Ciclo de deuda.", "gota a gota": "Préstamo informal peligroso." };
const Q_C15 = [
  { q: "What is the principal of a loan?", options: ["The amount of money you borrow", "The extra cost of borrowing money", "The date when you must pay back"], correct: 0, feedback: "Principal = the amount borrowed." },
  { q: "Camila borrows $1,000,000 and pays $100,000 for 12 months. What is the extra cost?", options: ["$200,000", "$100,000", "$1,200,000"], correct: 0, feedback: "$1,200,000 − $1,000,000 = $200,000." },
  { q: "Why is the smallest payment not always the cheapest loan?", options: ["You may pay for more months and more in total", "Small payments are always illegal in Colombia", "Banks never offer small monthly payments"], correct: 0, feedback: "Always calculate the TOTAL." },
  { q: "What should a person do if a lender threatens them?", options: ["Look for help from trusted adults or authorities", "Go and confront the lender alone, at night", "Borrow more money from another lender fast"], correct: 0, feedback: "Never alone — ask for help." },
  { q: "What is the better question for a responsible borrower?", options: ["Can I repay it safely, and is it worth it?", "Can I get the money today, no matter what?", "Which loan has the nicest advertisement?"], correct: 0, feedback: "Safe repayment + worth the total cost." },
];

const OFFERS = [
  { id: "bank", e: "🏦", n: "CREAR Bank Loan", ad: "12 monthly installments. All costs shown.", rows: [["Installment", "$100,000 / month"], ["Number of payments", "12"], ["Extra charges", "Included in the installment"]], total: 1200000, color: "#16b074" },
  { id: "store", e: "🏬", n: "MegaStore Credit", ad: "Take it today! NO down payment! 🎉", rows: [["Installment", "$80,000 / month"], ["Number of payments", "18"], ["Extra charges", "Mandatory insurance: $60,000 (small print!)"]], total: 1500000, color: "#f5b23e" },
  { id: "daily", e: "💀", n: "‘Fast Cash’ daily lender", ad: "Money in 1 hour! No papers, no questions!", rows: [["Installment", "$60,000 every DAY"], ["Number of payments", "30 days"], ["Extra charges", "Threats if you are late"]], total: 1800000, color: "#ff6b57" },
];
function LoanLab({ onSave, onExit }) {
  const [open, setOpen] = useState({});
  const [tot, setTot] = useState({});
  const [okT, setOkT] = useState({});
  const [miss, setMiss] = useState({});
  const [rank, setRank] = useState([]);
  const [hidden, setHidden] = useState(null);
  const [dec, setDec] = useState(null);
  const [st, finish] = useFinish(onSave);
  const allTot = OFFERS.every((o) => okT[o.id]);
  const rankOk = rank.join() === "bank,store,daily";
  if (st.done) return <Reward title="Loan Lab scientist! 🧪" subtitle="You found the real price of each loan." coins={st.coins} saving={st.saving} onExit={onExit} />;
  const checkT = (o) => { if (num(tot[o.id]) === o.total) setOkT({ ...okT, [o.id]: true }); else setMiss({ ...miss, [o.id]: (miss[o.id] || 0) + 1 }); };
  return (
    <ActShell icon={<Puzzle size={22} strokeWidth={2.1} />} title="Loan Lab 🧪" subtitle="Camila needs $1,000,000 for a mixer. Open each offer and find the TOTAL cost." onExit={onExit}>
      <div className="g72-offers">
        {OFFERS.map((o) => (
          <div key={o.id} className={`g72-offer ${okT[o.id] ? "ok" : ""}`} style={{ "--cc": o.color }}>
            <div className="g72-offer-ad"><em>{o.e}</em><b>{o.n}</b><span>“{o.ad}”</span></div>
            {!open[o.id]
              ? <button type="button" className="s1-btn ghost" onClick={() => setOpen({ ...open, [o.id]: true })}><FileText size={16} /> Open the contract</button>
              : (
                <>
                  <div className="g72-offer-rows">{o.rows.map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}</div>
                  <div className="p2-answer-row"><span className="p2-unit">$</span><input className="start-input p2-num" type="number" value={tot[o.id] || ""} disabled={okT[o.id]} onChange={(e) => setTot({ ...tot, [o.id]: e.target.value })} placeholder="Total paid" /><button className="s1-btn primary" disabled={!tot[o.id] || okT[o.id]} onClick={() => checkT(o)}><Check size={16} /></button></div>
                  {okT[o.id] && <div className="g72-offer-total">Total: <b>{cop(o.total)}</b> · extra cost <b>{cop(o.total - 1000000)}</b></div>}
                  {!okT[o.id] && miss[o.id] > 0 && <div className="p1-hint">💡 Installment × number of payments{o.id === "store" ? " + the insurance" : ""}.</div>}
                </>
              )}
          </div>
        ))}
      </div>
      {allTot && (
        <div className="start-block">
          <h3><span className="step-n">2</span> Rank the offers: cheapest → most expensive</h3>
          <div className="g72-opts">
            {OFFERS.map((o) => <button key={o.id} type="button" className={`g72-opt ${rank.includes(o.id) ? "on" : ""}`} onClick={() => setRank(rank.includes(o.id) ? rank.filter((x) => x !== o.id) : [...rank, o.id])}><em>{rank.includes(o.id) ? rank.indexOf(o.id) + 1 : o.e}</em><span>{o.n}</span></button>)}
          </div>
          {rank.length === 3 && <div className={`p1-banner ${rankOk ? "good" : "bad"}`}>{rankOk ? "✅ Correct ranking! The ‘no down payment’ offer was NOT the cheapest." : "Not yet — compare the totals and tap again to reorder."}</div>}
        </div>
      )}
      {rankOk && (
        <div className="start-block">
          <h3><span className="step-n">3</span> Which charge was hidden in the MegaStore ad?</h3>
          <div className="p1-starters">{["The installment", "The mandatory insurance", "The number of months"].map((h, k) => <button key={h} type="button" className={`p1-chip ${hidden === k ? "on" : ""} ${hidden !== null ? (k === 1 ? "ok" : hidden === k ? "no" : "") : ""}`} disabled={hidden !== null} onClick={() => setHidden(k)}>{h}</button>)}</div>
        </div>
      )}
      {hidden !== null && (
        <div className="start-block">
          <h3><span className="step-n">4</span> Your advice for Camila</h3>
          <div className="g72-opts">
            {[["🏦", "Take the bank loan (if the payments are safe)", 2], ["🐷", "Wait and save first", 2], ["💀", "Take the fast daily lender", 0]].map(([e, l, f], k) => <button key={k} type="button" className={`g72-opt ${dec === k ? "on" : ""}`} onClick={() => setDec(k)}><em>{e}</em><span>{l}</span></button>)}
          </div>
          {dec !== null && <div className={`g72-conseq f${dec === 2 ? 0 : 2}`}><b>{dec === 2 ? "⚠️ Consequence card" : "✅ Responsible choice"}</b><span>{dec === 2 ? "Daily lenders can be extremely costly and dangerous. Camila would pay $1,800,000 — and face threats." : "Both options are responsible. The bank loan costs $200,000 extra; saving costs time, not interest."}</span></div>}
        </div>
      )}
      {dec !== null && dec !== 2 && <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(30, { totals: OFFERS.map((o) => o.total), decision: dec === 0 ? "bank" : "save", hiddenOk: hidden === 1 })}>Save my lab report <span className="coin-tag"><Coins size={15} /> +30</span></button></div>}
    </ActShell>
  );
}

const TRAPS = [
  { what: "📱 A new phone", a: { inst: 45000, n: 6, extra: 0 }, b: { inst: 20000, n: 18, extra: 0 } },
  { what: "🛵 A delivery motorbike for Camila", a: { inst: 95000, n: 12, extra: 0 }, b: { inst: 60000, n: 24, extra: 0 } },
  { what: "🔥 The industrial oven", a: { inst: 150000, n: 20, extra: 0 }, b: { inst: 270000, n: 10, extra: 450000 } },
];
const trapTotal = (x) => x.inst * x.n + x.extra;
function InstallmentTrap({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState({});
  const [pick, setPick] = useState(null);
  const [log, setLog] = useState([]);
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Trap detector! 🪤" subtitle="A small installment can hide a big total." coins={st.coins} saving={st.saving} onExit={onExit} />;
  const T = TRAPS[i];
  const best = trapTotal(T.a) <= trapTotal(T.b) ? "a" : "b";
  const both = open.a && open.b;
  return (
    <ActShell icon={<AlertTriangle size={22} strokeWidth={2.1} />} title="Installment Trap 🪤" subtitle="Open both contracts. Which one is cheaper in TOTAL?" onExit={onExit}>
      <div className="p1-match-stats"><span>Case <b>{i + 1}/3</b></span><span>Traps avoided: <b>{log.filter(Boolean).length}</b></span></div>
      <div className="p1-challenge"><span>Buying</span><b>{T.what}</b></div>
      <div className="g72-twoacc">
        {["a", "b"].map((k) => {
          const x = T[k];
          return (
            <div key={k} className={`g72-contract ${open[k] ? "open" : ""} ${pick === k ? (k === best ? "good" : "bad") : ""}`}>
              <small>Loan {k.toUpperCase()}</small>
              <b>{cop(x.inst)}<i>/month</i></b>
              {open[k]
                ? <div className="g72-contract-fine"><span>{x.n} payments</span>{x.extra > 0 && <span>+ {cop(x.extra)} opening fee</span>}<strong>Total: {cop(trapTotal(x))}</strong></div>
                : <button type="button" className="s1-btn ghost" onClick={() => setOpen({ ...open, [k]: true })}><Eye size={15} /> Read the small print</button>}
              {both && pick === null && <button type="button" className="s1-btn primary" onClick={() => { setPick(k); setLog([...log, k === best]); }}>This is cheaper</button>}
            </div>
          );
        })}
      </div>
      {pick !== null && <div className={`p1-banner ${pick === best ? "good" : "bad"}`}>{pick === best ? "✅ Trap avoided!" : "🪤 Trapped!"} Loan {best.toUpperCase()} costs {cop(Math.abs(trapTotal(T.a) - trapTotal(T.b)))} less in total.</div>}
      {pick !== null && <div className="start-foot"><button className="s1-btn primary big" onClick={() => { if (i === 2) finish(8 + log.filter(Boolean).length * 4, { avoided: log.filter(Boolean).length }); else { setI(i + 1); setOpen({}); setPick(null); } }}>{i === 2 ? "Finish" : "Next case"} <ChevronRight size={18} /></button></div>}
    </ActShell>
  );
}

/* Debt Escape Room: 4 puertas */
function DoorTotal({ onDone }) {
  const [v, setV] = useState(""); const [ok, setOk] = useState(false); const [bad, setBad] = useState(false);
  return (
    <div className="start-block">
      <p className="quiz-q">Camila borrows <b>$2,000,000</b> and pays <b>$210,000</b> every month for <b>12 months</b>. What is the total she pays?</p>
      <div className="p2-answer-row"><span className="p2-unit">$</span><input className="start-input p2-num" type="number" value={v} disabled={ok} onChange={(e) => { setV(e.target.value); setBad(false); }} placeholder="Total" /><button className="s1-btn primary" disabled={!v || ok} onClick={() => (num(v) === 2520000 ? setOk(true) : setBad(true))}><Unlock size={16} /> Unlock</button></div>
      {bad && <div className="p1-hint">💡 $210,000 × 12 = ?</div>}
      {ok && <><div className="p1-banner good">🔓 $2,520,000! The extra cost is $520,000.</div><div className="start-foot"><button className="s1-btn primary big" onClick={() => onDone({ ok: true })}>Next door <ChevronRight size={18} /></button></div></>}
    </div>
  );
}
function DoorInstallment({ onDone }) {
  const [p, setP] = useState(null);
  const opts = [["$90,000", true], ["$280,000", false], ["$350,000", false]];
  return (
    <div className="start-block">
      <p className="quiz-q">In a slow month, Camila's business makes <b>$300,000</b> of profit. She also needs <b>$150,000</b> for ingredients for the next month. Which installment can she pay <b>safely</b>?</p>
      <div className="g72-opts">{opts.map(([l, g], k) => <button key={l} type="button" disabled={p !== null && opts[p][1]} className={`g72-opt ${p === k ? (g ? "good" : "bad") : ""}`} onClick={() => setP(k)}><em>💵</em><span>{l} / month</span></button>)}</div>
      {p !== null && <div className={`p1-banner ${opts[p][1] ? "good" : "bad"}`}>{opts[p][1] ? "🔓 Correct! $300,000 − $150,000 = $150,000 free. $90,000 leaves a safety cushion." : "Impossible in a slow month! $300,000 − $150,000 = only $150,000 free. Try again."}</div>}
      {p !== null && opts[p][1] && <div className="start-foot"><button className="s1-btn primary big" onClick={() => onDone({ ok: true })}>Next door <ChevronRight size={18} /></button></div>}
    </div>
  );
}
const FLAGS = [["😠 Threats if you pay late", true], ["📄 A clear written contract", false], ["🙈 “No papers, no questions”", true], ["🏛️ Supervised by the Superfinanciera", false], ["📆 Huge payments every single day", true], ["📊 Official interest information", false]];
function DoorFlags({ onDone }) {
  const [sel, setSel] = useState([]); const [chk, setChk] = useState(false);
  const ok = chk && sel.length === 3 && sel.every((k) => FLAGS[k][1]);
  return (
    <div className="start-block">
      <p className="quiz-q">Choose the <b>3 danger signals</b> of an abusive informal lender.</p>
      <div className="g72-opts">{FLAGS.map(([l, g], k) => <button key={l} type="button" className={`g72-opt ${sel.includes(k) ? "on" : ""} ${chk && sel.includes(k) ? (g ? "good" : "bad") : ""}`} onClick={() => { setChk(false); setSel(sel.includes(k) ? sel.filter((x) => x !== k) : sel.length < 3 ? [...sel, k] : sel); }}><span>{l}</span></button>)}</div>
      {chk && !ok && <div className="p1-banner bad">Not all of them are danger signals. Change the red ones.</div>}
      {ok && <div className="p1-banner good">🔓 Correct! If someone threatens you, talk to a trusted adult or the authorities.</div>}
      <div className="start-foot">{ok ? <button className="s1-btn primary big" onClick={() => onDone({ ok: true })}>Next door <ChevronRight size={18} /></button> : <button className="s1-btn primary big" disabled={sel.length !== 3} onClick={() => setChk(true)}>Check <Check size={16} /></button>}</div>
    </div>
  );
}
const DECISIONS = [
  { label: "A loan for an oven, with a plan based on real orders", answer: "good", why: "Equipment that increases income + a repayment plan." },
  { label: "A loan for a luxury trip, without a plan to repay", answer: "risky", why: "Not necessary and no plan → financial stress." },
  { label: "Borrowing from someone who threatens customers", answer: "risky", why: "Dangerous! Look for help, never accept threats." },
  { label: "Waiting and saving first", answer: "good", why: "No interest — just patience." },
  { label: "A new loan to pay the first loan", answer: "risky", why: "This can start a cycle of debt." },
  { label: "Comparing 3 offers and the total cost", answer: "good", why: "That's what responsible borrowers do." },
];
const DEC_BUCKETS = [{ id: "good", label: "Good decision", icon: "✅", color: "#16b074" }, { id: "risky", label: "Risky decision", icon: "⚠️", color: "#ff6b57" }];
const DEBT_ROOMS = [
  { id: "total", e: "🧮", name: "The Total Cost Lock", badge: "Total Finder", brief: "Find the real price of the loan.", render: (done) => <DoorTotal onDone={done} /> },
  { id: "inst", e: "💵", name: "The Impossible Installment", badge: "Budget Guard", brief: "Choose a payment that is safe in a slow month.", render: (done) => <DoorInstallment onDone={done} /> },
  { id: "flags", e: "🚩", name: "The Danger Signals", badge: "Red Flag Spotter", brief: "Detect a dangerous lender.", render: (done) => <DoorFlags onDone={done} /> },
  { id: "board", e: "🧭", name: "Good or Risky?", badge: "Decision Pro", brief: "Sort the borrowing decisions.", render: (done) => <SortBuckets buckets={DEC_BUCKETS} items={DECISIONS} doneLabel="Open the final door" onDone={(r) => done(r)} /> },
];

const NOTE_C15 = {
  n: 3, label: "Loan: yes or no?", question: (c) => `Should ${c.name} borrow money now? Think about the 📌 detail.`,
  options: [
    { id: "save", e: "🐷", l: "No loan: keep saving and wait", fit: { sofia: 2, rodriguez: 0, camila: 1 }, note: "", noteFor: { sofia: "Headphones are a want, not an emergency. Saving costs no interest.", camila: "Safe, but she is losing orders every week. Maybe a responsible loan makes sense." }, warn: "", warnFor: { rodriguez: "The rainy season starts in 2 months. A leaking roof can damage the house and cost much more." } },
    { id: "roof", e: "🏠", l: "A small regulated loan only for the roof, with an installment under $300,000", fit: { sofia: 0, rodriguez: 2, camila: 0 }, note: "", noteFor: { rodriguez: "Urgent need + an installment that fits their free money + a supervised lender." }, warn: "", warnFor: { sofia: "Sofía has no roof to repair — and a 14-year-old shouldn't take debt for headphones.", camila: "Camila doesn't need a roof loan." } },
    { id: "equip", e: "🧁", l: "A business loan for equipment that increases sales, after checking the total cost", fit: { sofia: 0, rodriguez: 0, camila: 2 }, note: "", noteFor: { camila: "More orders than she can bake = the equipment can pay for itself, if the installment is safe." }, warn: "This client doesn't have a business that can produce more income." },
    { id: "store", e: "🏬", l: "The ‘no down payment’ store offer, without asking for the total", fit: 0, note: "", warn: "Hidden charges can make it much more expensive. Always ask for the total!" },
    { id: "daily", e: "💀", l: "A daily lender (gota a gota)", fit: 0, note: "", warn: "Dangerous: extremely costly and can involve threats. Never a safe option." },
    { id: "card", e: "💳", l: "A credit card, paying only part of the bill each month", fit: 0, note: "", warn: "Paying only part of the bill makes everything much more expensive." },
  ],
};

/* =====================================================================
   CLASE 16 · DIGITAL BANKING
   ===================================================================== */
const READ_C16 = [
  { sub: "Can a phone help you manage money?" },
  { p: "Camila starts her day early. She prepares brownies and cookies for her customers. One customer orders a birthday cake and asks to pay through a digital wallet." },
  { p: "Camila checks her phone. She opens her financial app and looks at the balance. The balance shows how much money is available in the account or wallet at that moment, according to the service's rules and pending transactions." },
  { p: "The customer sends the payment. Camila does not assume that a message or screenshot is enough. She checks her own app to confirm that the money arrived." },
  { h: "📷 QR codes and transfers" },
  { p: "Later, Camila buys flour and chocolate. The shop offers payment with a QR code. A QR code is a square pattern that a phone can scan to open information or start a payment process. Before confirming, Camila checks the recipient's name and the amount." },
  { p: "At lunchtime, she transfers money to a supplier. A transfer moves money from one account or service to another. The time it takes and the costs depend on the services involved." },
  { h: "🔎 The transaction history" },
  { p: "In the afternoon, Camila reviews her transaction history. It shows payments, transfers, and other movements recorded by the service. She notices a small payment that she does not recognize." },
  { p: "Camila does not ignore it. She checks the details, saves the transaction information, and contacts the service through its official channel. She does not share her PIN or password with anyone who calls or messages her." },
  { h: "Easy… but careful" },
  { p: "Digital banking can make everyday tasks easier. People may be able to pay bills, transfer money, check a balance, and review transactions without visiting a physical branch. Digital services can also help small businesses receive payments and keep records." },
  { p: "However, a phone is not magic. A wrong recipient, a fake message, a stolen password, or an unsafe connection can create problems. Customers should use strong passwords, protect their devices, check transaction details, and keep their apps updated." },
  { p: "Digital wallets and traditional bank accounts are not exactly the same. Their features, limits, fees, and protections can differ. A customer should read the conditions and understand what service they are using." },
  { p: "Camila decides to separate her business money from her personal money. She records each sale and each business expense. At the end of the week, she can see how much money came in, how much went out, and what remains. Her phone is now more than a way to receive payments. It is a tool to help her organize her business." },
  { box: "The most important rule remains: check before you confirm, and never share your secret security information." },
  { p: "Your mission is to use a fictional banking app, solve five tasks, and help Camila manage her digital money safely." },
];
const GLOSS_C16 = { "digital wallet": "Billetera digital.", "balance": "Saldo.", "pending transactions": "Movimientos pendientes.", "QR code": "Código QR.", "transfer": "Transferencia.", "transaction history": "Historial de movimientos.", "official channel": "Canal oficial.", "recipient": "Destinatario." };
const Q_C16 = [
  { q: "Why does Camila check her own app after a customer pays?", options: ["A screenshot is not enough proof of payment", "Her phone needs to be charged very often", "The customer asked her to delete the app"], correct: 0, feedback: "Always confirm in your own app." },
  { q: "What should Camila check before confirming a QR payment?", options: ["The recipient's name and the amount", "The color of the QR code square", "The time on her phone's clock"], correct: 0, feedback: "Name + amount!" },
  { q: "What did Camila do with the payment she didn't recognize?", options: ["Checked it and used the official channel", "Ignored it because it was a small amount", "Called the number from a strange message"], correct: 0, feedback: "Official channels only." },
  { q: "What does the transaction history show?", options: ["Payments, transfers and other movements", "Only the money she will earn next month", "The passwords of all her customers"], correct: 0, feedback: "Every movement is recorded." },
  { q: "What is the most important rule of digital banking?", options: ["Check first, and never share secret codes", "Always pay with the fastest app available", "Delete your history every single night"], correct: 0, feedback: "Check before you confirm!" },
];

/* ---------- CREAR BANK SIMULATOR (5 misiones encadenadas) ---------- */
const APP_MISSIONS = [
  { e: "💰", t: "Balance Mission", d: "Find how much money Camila can use RIGHT NOW." },
  { e: "📤", t: "Transfer Mission", d: "Send $85,000 to the supplier Harinas del Valle (verified ✓)." },
  { e: "📷", t: "QR Mission", d: "Pay the invoice of Chocolates Ruiz: $45,000. Check before you confirm!" },
  { e: "🔎", t: "Transaction Detective", d: "Compare the app history with Camila's notebook. Find the movement she doesn't recognize." },
  { e: "🔒", t: "Emergency Lock", d: "Something is wrong. Protect the account!" },
];
const CONTACTS = [{ id: "ok", n: "Harinas del Valle", v: true, s: "Supplier · ✓ verified" }, { id: "fake1", n: "Harinas del Vale", v: false, s: "New contact" }, { id: "fake2", n: "Harina Valle Express", v: false, s: "New contact" }, { id: "mom", n: "Mamá", v: true, s: "Family" }];
const HISTORY = [
  { id: 1, d: "Sale · birthday cake (Ana)", a: 95000 },
  { id: 2, d: "Harinas del Valle", a: -85000 },
  { id: 3, d: "Sale · 12 brownies (Luis)", a: 48000 },
  { id: 4, d: "XJ-PLAY*SUBS 4471", a: -19900, bad: true },
  { id: 5, d: "Packaging · Empaques Sol", a: -32000 },
  { id: 6, d: "Sale · cookies (Marta)", a: 30000 },
];
const NOTEBOOK = ["+ Cake Ana $95,000", "− Flour $85,000", "+ Brownies Luis $48,000", "− Boxes $32,000", "+ Cookies Marta $30,000"];
function BankApp({ onSave, onExit }) {
  const [m, setM] = useState(0);
  const [first, setFirst] = useState({});
  const [fails, setFails] = useState({});
  const [msg, setMsg] = useState(null);
  const [st, finish] = useFinish(onSave);
  // estado de misiones
  const [bal, setBal] = useState("");
  const [contact, setContact] = useState(null);
  const [amt, setAmt] = useState("");
  const [review, setReview] = useState(false);
  const [qr, setQr] = useState(0); // 0 sin escanear, 1 QR malo, 2 QR bueno
  const [scan, setScan] = useState(false);
  const [locked, setLocked] = useState(false);
  const [confirmLock, setConfirmLock] = useState(false);
  const [sms, setSms] = useState(null);
  const fail = (text) => { setFails({ ...fails, [m]: (fails[m] || 0) + 1 }); setMsg({ ok: false, text }); };
  const win = (text) => { setFirst({ ...first, [m]: !fails[m] }); setMsg({ ok: true, text }); };
  const next = () => { setMsg(null); setM(m + 1); };
  const missionDone = msg && msg.ok;
  if (st.done) return <Reward title="Digital banking pro! 📱" subtitle="You completed the 5 missions safely." coins={st.coins} saving={st.saving} onExit={onExit} gold />;

  let screen = null;
  if (m === 0) screen = (
    <>
      <div className="g72-app-card"><small>Camila's account</small><b>{cop(485000)}</b><span>Total balance</span></div>
      <div className="g72-app-row warn"><span>⏳ Pending payment (packaging)</span><b>−{cop(30000)}</b></div>
      <div className="g72-app-row"><span>Available now</span><b>?</b></div>
      <div className="g72-app-grid">{["📤 Transfer", "📷 Pay QR", "🧾 History", "💳 Card"].map((b) => <span key={b}>{b}</span>)}</div>
    </>
  );
  if (m === 1) screen = !review ? (
    <>
      <div className="g72-app-h">📤 Transfer · choose a contact</div>
      {CONTACTS.map((c) => <button key={c.id} type="button" className={`g72-app-contact ${contact === c.id ? "on" : ""}`} onClick={() => setContact(c.id)}><span>{c.v ? "✅" : "👤"}</span><div><b>{c.n}</b><small>{c.s}</small></div></button>)}
      <input className="g72-app-input" type="number" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder="Amount $" />
      <button type="button" className="g72-app-btn" disabled={!contact || !amt} onClick={() => setReview(true)}>Continue</button>
    </>
  ) : (
    <>
      <div className="g72-app-h">Review your transfer</div>
      <div className="g72-app-review"><small>To</small><b>{CONTACTS.find((c) => c.id === contact).n}</b><small>Amount</small><b>{cop(num(amt))}</b></div>
      <button type="button" className="g72-app-btn" onClick={() => { if (contact === "ok" && num(amt) === 85000) win("Transfer sent to the verified supplier. ✅ You checked the name and the amount."); else { fail(contact !== "ok" ? "Careful! That is not the verified supplier. A look-alike name can steal your money." : "The amount is wrong. The invoice says $85,000."); setReview(false); } }}>Confirm transfer</button>
      <button type="button" className="g72-app-btn ghost" onClick={() => setReview(false)}>Edit</button>
    </>
  );
  if (m === 2) screen = (
    <>
      <div className="g72-app-h">📷 Pay with QR</div>
      <div className="g72-invoice"><small>🧾 Invoice · Chocolates Ruiz</small><b>{cop(45000)}</b></div>
      {qr === 0 && <button type="button" className={`g72-qrbox ${scan ? "scanning" : ""}`} onClick={() => { setScan(true); setTimeout(() => { setScan(false); setQr(1); }, 900); }}><QrCode size={64} /><span>{scan ? "Scanning…" : "Tap to scan"}</span></button>}
      {qr > 0 && (
        <>
          <div className="g72-app-review"><small>Pay to</small><b>Chocolates Ruiz</b><small>Amount</small><b className={qr === 1 ? "neg" : ""}>{cop(qr === 1 ? 54000 : 45000)}</b></div>
          <button type="button" className="g72-app-btn" onClick={() => { if (qr === 1) fail("Stop! The QR says $54,000 but the invoice says $45,000. Never confirm a wrong amount."); else win("Paid $45,000 — the amount matches the invoice. ✅"); }}>Confirm payment</button>
          <button type="button" className="g72-app-btn ghost" onClick={() => { if (qr === 1) { setMsg({ ok: null, text: "Good catch! You cancelled. The shop gives you the correct QR code…" }); setQr(2); } else fail("This QR is correct now — you can confirm."); }}>Cancel</button>
        </>
      )}
    </>
  );
  if (m === 3) screen = (
    <>
      <div className="g72-app-h">🧾 History · today</div>
      {HISTORY.map((h) => <button key={h.id} type="button" className="g72-app-hist" onClick={() => (h.bad ? win("Found it! ‘XJ-PLAY*SUBS’ is not in Camila's notebook. She saves the details and contacts the bank through the official channel.") : fail("That movement is in Camila's notebook. Compare again!"))}><span>{h.d}</span><b className={h.a < 0 ? "neg" : "pos"}>{h.a < 0 ? "−" : "+"}{cop(Math.abs(h.a))}</b></button>)}
    </>
  );
  if (m === 4) screen = (
    <>
      <div className="g72-app-h">💳 My card</div>
      <div className={`g72-app-plastic ${locked ? "locked" : ""}`}><small>CREAR BANK · DEBIT</small><b>•••• 4471</b><span>{locked ? "🔒 LOCKED" : "Active"}</span></div>
      {!locked && !confirmLock && <button type="button" className="g72-app-btn danger" onClick={() => setConfirmLock(true)}><Lock size={15} /> Lock my card</button>}
      {confirmLock && !locked && <div className="g72-app-review"><b>Lock the card now?</b><small>Nobody can use it until you unlock it in the app.</small><button type="button" className="g72-app-btn danger" onClick={() => { setLocked(true); setConfirmLock(false); setTimeout(() => setSms(true), 500); }}>Yes, lock it</button></div>}
      {locked && sms && (
        <div className="g72-app-sms"><small>💬 SMS · +57 300 000 0000</small><p>CREAR BANK: your card was locked by error. Reply with your PIN and the code we sent to unlock it.</p>
          <div className="g72-app-two"><button type="button" className="g72-app-btn ghost" onClick={() => fail("Never send your PIN or codes! The real bank never asks for them by SMS.")}>Reply with PIN</button><button type="button" className="g72-app-btn" onClick={() => win("Perfect! You ignored the fake SMS and kept the card locked. Camila calls the official number on the back of her card.")}>Ignore & report</button></div>
        </div>
      )}
    </>
  );

  const score = Object.values(first).filter(Boolean).length;
  return (
    <ActShell icon={<Smartphone size={22} strokeWidth={2.1} />} title="CREAR Bank Simulator 📱" subtitle="A fictional app with fake money. Complete 5 chained missions." onExit={onExit}>
      <div className="g72-missions">{APP_MISSIONS.map((x, k) => <span key={k} className={k === m ? "on" : k < m ? "done" : ""}>{k < m ? (first[k] ? "⭐" : "✓") : x.e}<small>{x.t}</small></span>)}</div>
      {m < 5 && <div className="p1-challenge"><span>Mission {m + 1} · {APP_MISSIONS[m].t}</span><b>{APP_MISSIONS[m].d}</b></div>}
      {m < 5 ? (
        <div className="g72-app-wrap">
          <PhoneFrame title={locked ? "CREAR Bank · 🔒" : "CREAR Bank"}>{screen}</PhoneFrame>
          <div className="g72-app-side">
            {m === 0 && (
              <div className="start-block">
                <h3>How much can Camila use right now?</h3>
                <div className="p2-answer-row"><span className="p2-unit">$</span><input className="start-input p2-num" type="number" value={bal} disabled={missionDone} onChange={(e) => setBal(e.target.value)} placeholder="Available" /><button className="s1-btn primary" disabled={!bal || missionDone} onClick={() => (num(bal) === 455000 ? win("Correct! $485,000 − $30,000 pending = $455,000 available.") : fail("Look at the pending payment. Total − pending = available."))}><Check size={16} /></button></div>
              </div>
            )}
            {m === 3 && <div className="g72-notebook2"><b>📒 Camila's notebook</b>{NOTEBOOK.map((l) => <span key={l}>{l}</span>)}</div>}
            {m === 4 && !locked && <div className="g72-alert"><Bell size={18} /> <span><b>Alert:</b> a purchase of $250,000 in another city is being attempted with Camila's card.</span></div>}
            {msg && <div className={`p1-banner ${msg.ok ? "good" : msg.ok === null ? "" : "bad"}`}>{msg.text}</div>}
            {missionDone && <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{m === 4 ? "See my results" : "Next mission"} <ChevronRight size={18} /></button></div>}
          </div>
        </div>
      ) : (
        <>
          <div className="g72-story-end"><em>📱</em><b>Missions completed: 5/5 · First try: {score}/5 ⭐</b><p>Camila's digital money is safer thanks to you.</p></div>
          <ul className="g72-needs">{APP_MISSIONS.map((x, k) => <li key={k} className="ok">{first[k] ? "⭐" : "✅"} {x.t}{fails[k] ? <small> · {fails[k]} mistake(s) — and you fixed them</small> : ""}</li>)}</ul>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(20 + score * 3, { firstTry: score, fails })}>Save my results <span className="coin-tag"><Coins size={15} /> +35</span></button></div>
        </>
      )}
    </ActShell>
  );
}

const WALLET_BUCKETS = [{ id: "wallet", label: "Digital wallet", icon: "👛", color: "#16b074" }, { id: "bank", label: "Bank account", icon: "🏦", color: "#0b7a50" }, { id: "both", label: "Both", icon: "🤝", color: "#c9902a" }];
const WALLET_ITEMS = [
  { label: "You can often open it in minutes from your phone.", answer: "wallet", why: "Wallets are designed for quick phone sign-up." },
  { label: "You must protect your password and never share codes.", answer: "both", why: "Security rules apply to every service." },
  { label: "It can offer other products like CDTs and loans.", answer: "bank", why: "Banks offer a wider list of products." },
  { label: "You should check the fees, limits and conditions.", answer: "both", why: "Always read the conditions." },
  { label: "It has branches where you can get help in person.", answer: "bank", why: "Physical branches belong to banks." },
  { label: "It shows a history of your transactions.", answer: "both", why: "Both keep records of movements." },
  { label: "It is often designed for small, everyday payments.", answer: "wallet", why: "Many wallets focus on everyday transfers and payments." },
  { label: "It can help a small business receive payments by QR.", answer: "both", why: "Both can offer QR payments." },
];

const NOTE_C16 = {
  n: 4, label: "Digital tools", question: (c) => `Which digital tool do you recommend for ${c.name}?`,
  options: [
    { id: "tracker", e: "🎯", l: "The bank's official app with a goal tracker", fit: { sofia: 2, rodriguez: 1, camila: 1 }, note: "", noteFor: { sofia: "She can see her progress every week — and she doesn't need cash in her hand.", rodriguez: "Good for the parents, but Grandma needs help close to home.", camila: "Useful, but her main need is to receive and confirm payments." }, warn: "" },
    { id: "corr", e: "🏪", l: "A banking correspondent near home + a family member who helps Grandma", fit: { sofia: 0, rodriguez: 2, camila: 0 }, note: "", noteFor: { rodriguez: "Grandma can pay and withdraw 5 minutes from home — no 40-minute trip, with support." }, warn: "This client uses a phone every day and doesn't need in-person help." },
    { id: "qr", e: "👛", l: "A digital wallet with QR for sales + checking every payment in her own app", fit: { sofia: 1, rodriguez: 0, camila: 2 }, note: "", noteFor: { camila: "Customers pay by QR, and she confirms in her app — fake screenshots don't work anymore!", sofia: "Useful for bracelet sales, but her main need is to save and track her goal." }, warn: "Grandma has a simple phone — a QR wallet alone is too hard for her." },
    { id: "alerts", e: "🔔", l: "Text alerts for every movement", fit: 1, note: "A great safety habit for everyone — but which tool solves THIS client's main need?", warn: "" },
    { id: "share", e: "🔑", l: "Share the app password with a friend who helps", fit: 0, note: "", warn: "Never share passwords or codes — not even to get help." },
  ],
};

/* =====================================================================
   CLASE 17 · CYBERSECURITY IN BANKING
   ===================================================================== */
const Q_C17V = [
  { q: "What does the report call this scam that is stealing money all over the country?", options: ["ATM fraud", "Account takeover fraud", "Identity theft by phone", "Fake banknotes"], correct: 1, feedback: "Account takeover fraud." },
  { q: "Who is the consumer investigator who presents the report in Plymouth?", options: ["Wayne", "Jason", "Hank Winchester", "A Secret Service agent"], correct: 2, feedback: "Hank Winchester." },
  { q: "How much money was stolen from Alyssa and Wayne's checking account overnight?", options: ["$1,000", "$5,000", "$10,000", "$500"], correct: 1, feedback: "$5,000." },
  { q: "According to the Secret Service agents, what kind of case is this?", options: ["A mistake in the bank's system", "A classic case of identity theft", "A joke by family members", "A problem with international payments"], correct: 1, feedback: "A classic identity theft case." },
  { q: "Where were the withdrawals made with Wayne's debit card and PIN?", options: ["Outside the country", "Online, on the internet", "Inside a Chase Bank branch", "At a local gas station"], correct: 2, feedback: "Inside a bank branch!" },
  { q: "How many minutes apart were the two withdrawals at the bank?", options: ["Two minutes", "Four minutes", "Ten minutes", "Thirty minutes"], correct: 1, feedback: "Four minutes." },
  { q: "What big clue did the bank find about how the scammers got the information?", options: ["Someone ordered a new card sent overnight", "They found the card lying in the street", "The bank lost a public database online", "Wayne shared his PIN on social media"], correct: 0, feedback: "A new card was ordered and sent overnight." },
  { q: "What did Alyssa and Wayne say about the new ATM card?", options: ["They used it to buy groceries last week", "They never asked for it or got the mail", "They kept it in a safe box at home", "They gave it as a gift to a friend"], correct: 1, feedback: "They never requested it." },
  { q: "What saved the couple from losing all their money in a few days?", options: ["Calling the police right away", "Signing up for the bank's text alerts", "Freezing their account for a year", "Changing banks the day before"], correct: 1, feedback: "Text alerts! 🔔" },
  { q: "According to the Secret Service, what should you do every month?", options: ["Cut up all your credit cards", "Check your bank statements", "Change your phone number", "Visit the bank branch every week"], correct: 1, feedback: "Monitor your statements." },
  { q: "Which computer habits help prevent this fraud?", options: ["Strong passwords, antivirus, firewall", "Turning off the computer every night", "Never connecting printers or USBs", "Using the internet only at dawn"], correct: 0, feedback: "Strong passwords + antivirus + firewall." },
  { q: "When traveling, what does the Secret Service warn about internet networks?", options: ["Don't use public hotel or café Wi-Fi", "Never turn off your phone while traveling", "Use only credit cards, not cash", "Change your password every hour"], correct: 0, feedback: "Hackers can steal data on public Wi-Fi." },
];

const READ_C17 = [
  { sub: "Special report: Protect your money online" },
  { p: "On Monday morning, Sofía receives an email on her phone. The message says:" },
  { say: "“URGENT! Your bank account will close today. Click this link and enter your password to keep your money safe.”" },
  { p: "Sofía feels nervous. The message uses the bank's logo and looks official. But something is wrong: the sender's email address looks strange, and the link does not match the bank's official website." },
  { p: "Her teacher explains that this may be phishing. Phishing is a type of scam in which criminals use fake emails, websites, or messages to trick people into sharing information or sending money." },
  { p: "Later, Sofía receives a text message. It says:" },
  { say: "“Your payment is blocked. Click here to confirm your PIN.”" },
  { p: "This time, the scam arrives by SMS or text message. It may be an example of smishing, which uses text messages to trick people." },
  { p: "That afternoon, a person calls Sofía. The caller says, “I am from your bank. Tell me your password and the code you just received. I need them to protect your account.”" },
  { p: "Sofía remembers the warning. She does not share the information. The caller may be using vishing, a scam that uses voice calls to trick people." },
  { p: "The three attacks use different channels, but the goal can be similar: to steal personal information, access an account, or take money. A message or caller should not be trusted only because it uses a logo, knows a name, or sounds professional. Criminals can copy logos and invent stories to create fear or urgency." },
  { h: "Sofía's five rules" },
  { olist: ["Protect your password and PIN. Do not share them in an email, message, phone call, or chat.", "Never share a one-time security code. A criminal may use that code to enter an account or approve an action.", "Check the sender and the website. If a message looks suspicious, do not use its link. Open the official app or type the official address yourself.", "Use two-factor authentication (2FA) when available. This adds another step to verify your identity. Keep that second method private, too.", "Act quickly if something is wrong. Contact the financial service using an official channel and follow its instructions to secure or block your account or card."] },
  { p: "Sofía reports the suspicious messages to a trusted adult and deletes them after preserving the necessary information. She does not reply or try to investigate the callers herself. The next day, she helps her family identify another suspicious message. This time, they notice the urgent language, the strange link, and the request for secret information." },
  { box: "The golden rule: stop, check, and protect your information before you act." },
  { p: "Now, your mission is to enter the Cyber Bank Escape Room. Find the clues, protect the account, and help Sofía become a Cyber Safety Champion." },
];
const GLOSS_C17 = { "phishing": "Engaño por correo o páginas falsas.", "smishing": "Engaño por SMS.", "vishing": "Engaño por llamada.", "two-factor authentication": "Verificación en dos pasos (2FA).", "one-time security code": "Código de un solo uso.", "official channel": "Canal oficial.", "urgency": "Urgencia." };
const Q_C17 = [
  { q: "Phishing uses…", options: ["fake emails or websites", "fake text messages (SMS)", "fake phone calls"], correct: 0, feedback: "Phishing = fake emails or websites." },
  { q: "Smishing uses…", options: ["fake emails or websites", "fake text messages (SMS)", "fake phone calls"], correct: 1, feedback: "SMS + phishing = smishing." },
  { q: "Vishing uses…", options: ["fake emails or websites", "fake text messages (SMS)", "fake phone calls"], correct: 2, feedback: "Voice + phishing = vishing." },
  { q: "What does 2FA do?", options: ["Adds a second step to verify your identity", "Deletes all your old passwords forever", "Gives you a second bank account for free"], correct: 0, feedback: "Two locks are better than one." },
  { q: "A message looks suspicious. What should you do?", options: ["Open the official app, not the link", "Click the link fast to check if it's real", "Reply to the message and ask if it's real"], correct: 0, feedback: "Stop, check, protect." },
];

/* ----- Escape Room: 5 cuartos ----- */
const EMAIL_SPOTS = [
  { id: "from", t: "From: security@crear-bank-alerts.co", bad: true, why: "Strange sender address." },
  { id: "logo", t: "🏦 CREAR BANK (logo)", bad: false, why: "Logos can be copied — not a clue by itself." },
  { id: "subj", t: "URGENT!!! Your account will close TODAY", bad: true, why: "Urgency and fear." },
  { id: "hi", t: "Hello, valued customer,", bad: false, why: "A greeting alone is not a clue." },
  { id: "link", t: "👉 http://crear-bank.secure-login.xyz", bad: true, why: "The link doesn't match the official website." },
  { id: "pass", t: "Enter your password and PIN to keep your money safe.", bad: true, why: "Banks never ask for your password or PIN." },
  { id: "foot", t: "© CREAR Bank · All rights reserved", bad: false, why: "Anyone can write this." },
];
function RoomEmail({ onDone }) {
  const [found, setFound] = useState([]);
  const [wrong, setWrong] = useState(null);
  const code = "SAFE".split("");
  const tap = (s) => { if (found.includes(s.id)) return; if (s.bad) { setFound([...found, s.id]); setWrong(null); } else setWrong(s); };
  const n = found.length;
  return (
    <div className="start-block">
      <p className="quiz-q">Tap the <b>4 suspicious parts</b> of this email. Each one gives you a letter of the code.</p>
      <div className="g72-email">
        {EMAIL_SPOTS.map((s) => <button key={s.id} type="button" className={`g72-spot ${s.id} ${found.includes(s.id) ? "found" : ""} ${wrong?.id === s.id ? "miss" : ""}`} onClick={() => tap(s)}>{s.t}{found.includes(s.id) && <small>🚩 {s.why}</small>}</button>)}
      </div>
      {wrong && <div className="p1-hint">💡 {wrong.why}</div>}
      <div className="g72-code">{code.map((l, k) => <span key={k} className={k < n ? "on" : ""}>{k < n ? l : "?"}</span>)}</div>
      {n === 4 && <><div className="p1-banner good">🔓 Code: SAFE! You found all the phishing clues.</div><div className="start-foot"><button className="s1-btn primary big" onClick={() => onDone({ ok: true })}>Open the door <ChevronRight size={18} /></button></div></>}
    </div>
  );
}
const SMS_LIST = [
  { t: "CREAR Bank: Your payment is BLOCKED. Confirm your PIN here: bit.ly/crb-pin", a: "scam" },
  { t: "CREAR Bank: You received a transfer of $48,000. Check it in your official app. We never ask for your PIN.", a: "safe" },
  { t: "Congrats!! You won $2,000,000 🎁 Pay $50,000 to claim your prize: wa.me/57300xxxx", a: "scam" },
];
function RoomSms({ onDone }) {
  const [ans, setAns] = useState({});
  const [why, setWhy] = useState(null);
  const all = SMS_LIST.every((_, k) => ans[k] === SMS_LIST[k].a);
  return (
    <div className="start-block">
      <p className="quiz-q">Read the 3 text messages. Is each one <b>safe</b> or <b>smishing</b>?</p>
      <PhoneFrame title="💬 Messages">
        {SMS_LIST.map((s, k) => (
          <div key={k} className={`g72-sms ${ans[k] ? (ans[k] === s.a ? "ok" : "no") : ""}`}>
            <p>{s.t}</p>
            <div>{[["safe", "✅ Safe"], ["scam", "🚩 Smishing"]].map(([v, l]) => <button key={v} type="button" className={ans[k] === v ? "on" : ""} onClick={() => setAns({ ...ans, [k]: v })}>{l}</button>)}</div>
          </div>
        ))}
      </PhoneFrame>
      {Object.keys(ans).length === 3 && !all && <div className="p1-banner bad">One or more answers are wrong (red). Look for urgency, prizes and requests for your PIN.</div>}
      {all && (
        <>
          <h3>Why shouldn't you open a suspicious link?</h3>
          <div className="quiz-options">{["It can steal your data or install malware", "It makes your phone slower for a day", "Links are always illegal in Colombia"].map((o, k) => <button key={k} type="button" disabled={why === 0} className={`quiz-opt ${why === k ? (k === 0 ? "correct" : "wrong") : ""}`} onClick={() => setWhy(k)}><span className="opt-key">{"ABC"[k]}</span><span className="opt-text">{o}</span></button>)}</div>
        </>
      )}
      {why === 0 && <div className="start-foot"><button className="s1-btn primary big" onClick={() => onDone({ ok: true })}>Open the door <ChevronRight size={18} /></button></div>}
    </div>
  );
}
const CALL_LINES = [
  { t: "Hello, I'm calling from your bank's security department.", fear: false },
  { t: "Your account will be emptied in 10 minutes!", fear: true },
  { t: "I can see that your name is Sofía.", fear: false },
  { t: "Don't hang up, or you will lose everything.", fear: true },
  { t: "Tell me the code you just received — quickly!", fear: true },
  { t: "Thank you for being our customer.", fear: false },
];
function RoomCall({ onDone }) {
  const [sel, setSel] = useState([]);
  const [chk, setChk] = useState(false);
  const [resp, setResp] = useState(null);
  const ok = chk && sel.length === 3 && sel.every((k) => CALL_LINES[k].fear);
  return (
    <div className="start-block">
      <p className="quiz-q">📞 Read the call transcript. Select the <b>3 phrases</b> that use fear or pressure.</p>
      <div className="g72-call">
        <div className="g72-call-head"><PhoneIcon size={18} /> Unknown caller · 00:42</div>
        {CALL_LINES.map((l, k) => <button key={k} type="button" className={`g72-line ${sel.includes(k) ? "on" : ""} ${chk && sel.includes(k) ? (l.fear ? "ok" : "no") : ""}`} onClick={() => { setChk(false); setSel(sel.includes(k) ? sel.filter((x) => x !== k) : sel.length < 3 ? [...sel, k] : sel); }}><span>🕵️</span>{l.t}</button>)}
      </div>
      {!ok && <div className="start-foot"><button className="s1-btn primary" disabled={sel.length !== 3} onClick={() => setChk(true)}>Check <Check size={16} /></button></div>}
      {chk && !ok && <div className="p1-banner bad">Some phrases are not pressure. Knowing a name or saying “hello” doesn't prove anything — but it isn't fear either.</div>}
      {ok && (
        <>
          <h3>What is Sofía's safest answer?</h3>
          <div className="quiz-options">{["Hang up and call the official number myself", "Give the code, but not the password", "Ask him to call again tomorrow"].map((o, k) => <button key={k} type="button" disabled={resp === 0} className={`quiz-opt ${resp === k ? (k === 0 ? "correct" : "wrong") : ""}`} onClick={() => setResp(k)}><span className="opt-key">{"ABC"[k]}</span><span className="opt-text">{o}</span></button>)}</div>
        </>
      )}
      {resp === 0 && <div className="start-foot"><button className="s1-btn primary big" onClick={() => onDone({ ok: true })}>Open the door <ChevronRight size={18} /></button></div>}
    </div>
  );
}
const PW_RULES = [
  { t: "12 characters or more", ok: (p) => p.length >= 12 },
  { t: "Uppercase and lowercase letters", ok: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { t: "At least one number", ok: (p) => /\d/.test(p) },
  { t: "At least one symbol (! ? - _ #)", ok: (p) => /[^A-Za-z0-9]/.test(p) },
  { t: "No names, birthdays or ‘1234’ / ‘password’", ok: (p) => p.length > 0 && !/(sofia|camila|rodriguez|password|contrase|1234|qwerty|(19|20)\d{2})/i.test(p) },
];
function RoomPassword({ onDone }) {
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [once, setOnce] = useState(false);
  const score = PW_RULES.filter((r) => r.ok(p)).length;
  const lvl = ["Very weak", "Weak", "Weak", "OK", "Strong", "Super strong 💪"][score];
  return (
    <div className="start-block">
      <p className="quiz-q">🔨 Forge a <b>fictional</b> strong password (never use a real one here!). Tip: a long phrase like <i>Purple-Arepa-Moon-58!</i></p>
      <div className="p2-answer-row"><input className="start-input" type={show ? "text" : "password"} value={p} onChange={(e) => setP(e.target.value)} placeholder="Fictional password" autoComplete="off" /><button type="button" className="s1-btn ghost" onClick={() => setShow(!show)}><Eye size={16} /></button></div>
      <div className={`g72-pwmeter s${score}`}><i style={{ width: `${score * 20}%` }} /><span>{lvl}</span></div>
      <ul className="g72-needs">{PW_RULES.map((r) => <li key={r.t} className={r.ok(p) ? "ok" : ""}>{r.ok(p) ? "✅" : "⬜"} {r.t}</li>)}</ul>
      <label className="perm-check p1-check"><input type="checkbox" checked={once} onChange={(e) => setOnce(e.target.checked)} /><span>I will not repeat the same password in different accounts.</span></label>
      {score === 5 && once && <div className="start-foot"><button className="s1-btn primary big" onClick={() => onDone({ ok: true })}>Lock it in <ChevronRight size={18} /></button></div>}
    </div>
  );
}
function RoomTwoFA({ onDone }) {
  const [on, setOn] = useState(false);
  const [method, setMethod] = useState(null);
  const [ans, setAns] = useState(null);
  return (
    <div className="start-block">
      <p className="quiz-q">🔐 Add a second lock to Sofía's (fictional) account.</p>
      <PhoneFrame title="⚙️ Security settings">
        <div className="g72-app-row"><span>Two-factor authentication (2FA)</span><button type="button" className={`g72-switch ${on ? "on" : ""}`} onClick={() => setOn(!on)}><i /></button></div>
        {on && <div className="g72-app-h">Choose your second step</div>}
        {on && ["💬 Code by SMS", "📲 Authenticator app"].map((m2, k) => <button key={m2} type="button" className={`g72-app-contact ${method === k ? "on" : ""}`} onClick={() => setMethod(k)}><span>{m2.slice(0, 2)}</span><div><b>{m2.slice(3)}</b></div></button>)}
        {method !== null && <div className="g72-app-review"><small>Your security code</small><b className="g72-otp">481 205</b><small>Valid for 60 seconds</small></div>}
      </PhoneFrame>
      {method !== null && (
        <>
          <h3>A caller says: “I'm from the bank. Read me the code on your screen.” What do you do?</h3>
          <div className="quiz-options">{["Never share it — not with anyone", "Read it only if he sounds professional", "Share only the first three numbers"].map((o, k) => <button key={k} type="button" disabled={ans === 0} className={`quiz-opt ${ans === k ? (k === 0 ? "correct" : "wrong") : ""}`} onClick={() => setAns(k)}><span className="opt-key">{"ABC"[k]}</span><span className="opt-text">{o}</span></button>)}</div>
        </>
      )}
      {ans === 0 && <div className="start-foot"><button className="s1-btn primary big" onClick={() => onDone({ ok: true })}>Escape! 🏁</button></div>}
    </div>
  );
}
const CYBER_ROOMS = [
  { id: "email", e: "📧", name: "The Email Trap", badge: "Phishing Hunter", brief: "Inspect the sender, the link and the language.", render: (done) => <RoomEmail onDone={done} /> },
  { id: "sms", e: "💬", name: "The SMS Trap", badge: "Smishing Shield", brief: "Classify 3 text messages.", render: (done) => <RoomSms onDone={done} /> },
  { id: "call", e: "📞", name: "The Fake Caller", badge: "Vishing Blocker", brief: "Detect pressure and choose a safe answer.", render: (done) => <RoomCall onDone={done} /> },
  { id: "pw", e: "🔨", name: "Password Forge", badge: "Password Smith", brief: "Build a super strong (fictional) password.", render: (done) => <RoomPassword onDone={done} /> },
  { id: "2fa", e: "🔐", name: "The Second Lock", badge: "2FA Guardian", brief: "Turn on 2FA and protect the code.", render: (done) => <RoomTwoFA onDone={done} /> },
];

const NOTE_C17 = {
  n: 5, label: "Security guide", multi: 3, question: (c) => `Choose 3 security rules for ${c.name}'s guide. At least 2 must fit THIS client's risks.`,
  options: [
    { id: "pin", e: "🔑", l: "Never share your PIN, password or codes", fit: 1, note: "Essential for everybody.", warn: "" },
    { id: "2fa", e: "🛡️", l: "Turn on 2FA and text alerts", fit: 1, note: "Alerts saved the couple in the video.", warn: "" },
    { id: "game", e: "🎮", l: "Don't click ‘free prize’ links in games or social media", fit: { sofia: 2, rodriguez: 1, camila: 1 }, note: "", noteFor: { sofia: "Teenagers get many fake prizes in games and social media." }, warn: "" },
    { id: "wifi", e: "📶", l: "No banking apps on the school's or the mall's public Wi-Fi", fit: { sofia: 2, rodriguez: 1, camila: 1 }, note: "", noteFor: { sofia: "She uses her phone at school and in malls." }, warn: "" },
    { id: "call", e: "📞", l: "Hang up on calls that ask for codes and call the bank yourself", fit: { sofia: 1, rodriguez: 2, camila: 1 }, note: "", noteFor: { rodriguez: "Criminals often call older people pretending to be the bank." }, warn: "" },
    { id: "cover", e: "🧾", l: "At the correspondent: cover the PIN and keep the receipt", fit: { sofia: 1, rodriguez: 2, camila: 1 }, note: "", noteFor: { rodriguez: "Grandma will use the correspondent near home." }, warn: "" },
    { id: "screen", e: "📲", l: "Confirm every sale in your own app — never trust screenshots", fit: { sofia: 1, rodriguez: 1, camila: 2 }, note: "", noteFor: { camila: "Some customers send fake payment screenshots!" }, warn: "" },
    { id: "supplier", e: "🏭", l: "If a supplier says “I have a new account”, confirm by phone first", fit: { sofia: 1, rodriguez: 1, camila: 2 }, note: "", noteFor: { camila: "She pays suppliers 20 times a month — a classic scam target." }, warn: "" },
    { id: "bday", e: "🎂", l: "Use your birthday as your password (easy to remember)", fit: 0, note: "", warn: "Birthdays are easy to guess. Use a long phrase instead." },
    { id: "cousin", e: "👪", l: "Give your PIN to a cousin in case you forget it", fit: 0, note: "", warn: "A PIN is secret — even from family." },
  ],
  extra: { q: "Emergency action: if something is wrong, the client should…", options: [{ id: "lock", l: "🔒 Lock the card in the app and call the official number" }, { id: "back", l: "📞 Call the number on the back of the card" }, { id: "adult", l: "👨‍👩‍👧 Tell a trusted adult and use the official channel" }] },
  frame: "My 3 rules are",
};

/* =====================================================================
   CLASE 18 · BANKS FOR ENTREPRENEURS
   ===================================================================== */
const READ_C18 = [
  { sub: "How small loans can create opportunities" },
  { p: "Camila has a dream. She wants to grow her dessert business and buy an industrial oven. Her current oven is small, so she can only prepare a limited number of cakes each day. She thinks, “If I buy a bigger oven, I can prepare more orders. More orders may help me earn more money.”" },
  { p: "But there is a problem. The oven costs $3,000,000 COP, and Camila does not have enough savings. She starts to learn about business accounts, savings plans, and loans for entrepreneurs." },
  { h: "🌱 Microcredit" },
  { p: "One option is microcredit. Microcredit is a small loan designed to help people or small businesses pay for activities that can create income. It may help a person buy tools, materials, or equipment. However, microcredit is still debt. The borrower must repay it under the agreed conditions." },
  { h: "🇧🇩 The Bank of the Poor" },
  { p: "A famous story about microcredit began in Bangladesh. Muhammad Yunus, an economics professor, became interested in people who could not easily access traditional bank loans. A well-known early example describes a small amount of money lent to a group of craft workers who needed money to buy materials." },
  { p: "Yunus later founded the Grameen Bank, which became known for lending to people who often had limited access to traditional banking. Its work helped bring global attention to microfinance and financial inclusion." },
  { p: "The idea is simple to understand: a small amount of money can help a person start or improve an economic activity. But the result depends on the person's plan, the market, the cost of the loan, and many other conditions. A loan does not guarantee success." },
  { h: "📋 A business needs a plan" },
  { olist: ["Calculate the costs: flour, chocolate, packaging, transport, electricity and other expenses.", "Estimate the sales: How many cakes each week? How much will customers pay? Are the orders regular or seasonal?", "Check the loan conditions: interest rate, installment, total amount to repay — and what happens if sales are lower than expected."] },
  { p: "A bank or lender may also ask about collateral, which is an asset used as security for a loan under the agreement. The exact requirements depend on the product and lender." },
  { p: "Camila also learns to separate her business money from her personal money. If she uses all her sales to pay for personal shopping, she may not have enough money to buy ingredients or pay her loan." },
  { p: "A responsible lender should explain the conditions clearly, and a responsible borrower should understand the costs before accepting the loan. Camila compares three businesses: one has steady sales and a clear plan; another has many expenses and uncertain income; the third wants a loan but cannot explain how it will use the money." },
  { box: "A lender should consider whether the business can repay the loan, not only whether the owner has an exciting idea." },
  { p: "Camila decides to prepare a business budget before borrowing. She wants the oven to help her business grow, not become a problem she cannot manage. Your mission is to become a loan officer. Review each business, study its numbers, and decide whether the business is ready for financing — or should save, improve its plan, or seek advice first." },
];
const GLOSS_C18 = { "microcredit": "Microcrédito.", "entrepreneurs": "Emprendedores.", "collateral": "Garantía.", "borrower": "Quien pide prestado.", "lender": "Quien presta.", "business budget": "Presupuesto del negocio.", "financial inclusion": "Inclusión financiera.", "equipment": "Equipos." };
const Q_C18 = [
  { q: "What is microcredit?", options: ["A small loan for an activity that creates income", "A free gift of money that you never repay", "A savings account designed for young children"], correct: 0, feedback: "Small loan → income activity. Still debt!" },
  { q: "Who founded the Grameen Bank?", options: ["Muhammad Yunus", "Camila's teacher", "The Banco de la República"], correct: 0, feedback: "Muhammad Yunus, in Bangladesh." },
  { q: "Is microcredit a guarantee of success?", options: ["No — it is still debt and depends on the plan", "Yes — small loans always create success", "Yes — because the interest is always zero"], correct: 0, feedback: "A loan doesn't guarantee success." },
  { q: "What is collateral?", options: ["An asset used as security for a loan", "The monthly payment of a loan", "A type of digital wallet for businesses"], correct: 0, feedback: "Collateral = security for the lender." },
  { q: "What does Camila decide to do before borrowing?", options: ["Prepare a business budget", "Buy the oven with a credit card", "Close her Instagram store"], correct: 0, feedback: "Budget first!" },
];

const BUSINESSES = [
  { id: "bakery", e: "🥐", n: "Panadería Doña Inés", req: "$4,000,000 for a second oven", answer: "approve",
    clues: [["💰", "Income", "$6,000,000 / month"], ["🧾", "Expenses", "$4,800,000 / month"], ["📦", "Orders", "Steady for 3 years"], ["🐷", "Savings", "$1,500,000"], ["📅", "Installment", "$390,000 / month"], ["📋", "Plan", "Clear: 2 new cafés want her bread"]],
    out: { approve: "6 months later: sales grew 20% and every installment was paid on time. 🎉", info: "She brought more documents and was approved later — but she lost two weeks of new orders.", reject: "She went to another bank and got the loan. Your bank lost a good client." } },
  { id: "gamer", e: "🎮", n: "GameZone Café (opens next month)", req: "$15,000,000 to open", answer: "info",
    clues: [["💰", "Income", "Unknown — not open yet"], ["🧾", "Expenses", "About $3,000,000 / month"], ["📦", "Orders", "None yet"], ["🐷", "Savings", "$0"], ["📅", "Installment", "$1,400,000 / month"], ["📋", "Plan", "Big idea, but no written budget"]],
    out: { approve: "6 months later: the café had few customers and could not pay $1,400,000 a month. The debt became a big problem. 😟", info: "Good call! The owner wrote a budget, started smaller and saved first. A smaller loan was possible later.", reject: "Fair, but the idea had potential. With more information, you could help them improve the plan." } },
  { id: "mega", e: "🕶️", n: "“Mega Ideas” Store", req: "$8,000,000 — “I'll see what I buy”", answer: "reject",
    clues: [["💰", "Income", "Irregular — some months $0"], ["🧾", "Expenses", "Doesn't know"], ["📦", "Orders", "No clients yet"], ["🐷", "Savings", "None"], ["📅", "Installment", "$720,000 / month"], ["📋", "Plan", "Can't explain how to use the money"]],
    out: { approve: "6 months later: the money was spent on many things and no payments were made. 😬", info: "The owner couldn't answer basic questions. Asking was fine, but the case was clear.", reject: "Correct. Without a plan or income, a loan would create a problem for everybody." } },
  { id: "sew", e: "🧵", n: "Costurera Rosa (microcredit)", req: "$1,200,000 for a sewing machine", answer: "approve",
    clues: [["💰", "Income", "$1,800,000 / month"], ["🧾", "Expenses", "$1,200,000 / month"], ["📦", "Orders", "A school uniform contract"], ["🐷", "Savings", "$300,000"], ["📅", "Installment", "$115,000 / month"], ["📋", "Plan", "The machine doubles her production"]],
    out: { approve: "6 months later: she finished the uniform contract and paid every installment. A microcredit success! 🧵", info: "She already had everything you needed — the delay made her lose time with the contract.", reject: "She had income, a contract and a small installment. This was a good microcredit case." } },
];
const DECIDE = [{ id: "approve", e: "✅", l: "Approve" }, { id: "info", e: "❓", l: "Ask for more info" }, { id: "reject", e: "❌", l: "Reject" }];
function LoanOfficer({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState({});
  const [dec, setDec] = useState(null);
  const [log, setLog] = useState([]);
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Loan officer of the month! 🏅" subtitle="You decided with evidence, not with emotions." coins={st.coins} saving={st.saving} onExit={onExit} />;
  const B = BUSINESSES[i];
  const nOpen = Object.keys(open).length;
  return (
    <ActShell icon={<Briefcase size={22} strokeWidth={2.1} />} title="Loan Officer Simulator 🏦" subtitle="Open at least 4 clue cards. Then decide. Then jump 6 months into the future!" onExit={onExit}>
      <div className="p1-match-stats"><span>Business <b>{i + 1}/4</b></span><span>Good decisions: <b>{log.filter(Boolean).length}</b></span></div>
      <div className="g72-desk">
        <div className="g72-desk-head"><em>{B.e}</em><div><b>{B.n}</b><small>Requests: {B.req}</small></div></div>
        <div className="g72-clues">{B.clues.map(([e, t, v], k) => <ClueCard key={k} e={e} t={t} v={v} open={!!open[k]} onOpen={() => setOpen({ ...open, [k]: true })} />)}</div>
      </div>
      {dec === null ? (
        <div className="g72-decide">
          {DECIDE.map((d) => <button key={d.id} type="button" disabled={nOpen < 4} className={`g72-stamp-btn ${d.id}`} onClick={() => { setDec(d.id); setLog([...log, d.id === B.answer]); }}><em>{d.e}</em>{d.l}</button>)}
          {nOpen < 4 && <p className="start-tip">Open {4 - nOpen} more clue card(s) first.</p>}
        </div>
      ) : (
        <>
          <div className={`g72-stamp ${dec}`}>{DECIDE.find((d) => d.id === dec).l.toUpperCase()}</div>
          <div className="g72-timejump"><b>⏩ 6-month time jump</b><p>{B.out[dec]}</p></div>
          <div className={`p1-banner ${dec === B.answer ? "good" : "bad"}`}>{dec === B.answer ? "✅ Great decision!" : `The best decision was: ${DECIDE.find((d) => d.id === B.answer).l}.`} Compare the free money each month with the installment.</div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => { if (i === 3) finish(10 + log.filter(Boolean).length * 5, { good: log.filter(Boolean).length, decisions: log }); else { setI(i + 1); setOpen({}); setDec(null); } }}>{i === 3 ? "Close the office" : "Next business"} <ChevronRight size={18} /></button></div>
        </>
      )}
    </ActShell>
  );
}

const BUDGET_ITEMS = [
  { label: "Flour and sugar · $380,000", v: 380000, answer: "biz" },
  { label: "Chocolate and butter · $420,000", v: 420000, answer: "biz" },
  { label: "Boxes and packaging · $160,000", v: 160000, answer: "biz" },
  { label: "Delivery transport · $140,000", v: 140000, answer: "biz" },
  { label: "Electricity for the oven · $100,000", v: 100000, answer: "biz" },
  { label: "Concert ticket for Camila · $180,000", v: 180000, answer: "me" },
  { label: "New sneakers for Camila · $250,000", v: 250000, answer: "me" },
];
const BUDGET_BUCKETS = [{ id: "biz", label: "Business cost", icon: "🧁", color: "#16b074" }, { id: "me", label: "Personal (from her salary)", icon: "🙋‍♀️", color: "#ff6b57" }];
function BusinessBudget({ onSave, onExit }) {
  const [step, setStep] = useState(0);
  const [costs, setCosts] = useState(""); const [okC, setOkC] = useState(false); const [badC, setBadC] = useState(false);
  const [profit, setProfit] = useState(""); const [okP, setOkP] = useState(false); const [badP, setBadP] = useState(false);
  const [canPay, setCanPay] = useState(null);
  const [sortScore, setSortScore] = useState(0);
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Budget builder! 📊" subtitle="Camila now knows if she can pay the oven." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Calculator size={22} strokeWidth={2.1} />} title="Business Budget Builder 📊" subtitle="Camila sells $2,400,000 a month. Can she pay a $180,000 installment for the oven?" onExit={onExit}>
      <div className="g72-steps">{["Separate", "Costs", "Profit", "Decision"].map((s, k) => <span key={s} className={k === step ? "on" : k < step ? "done" : ""}>{k < step ? "✓" : k + 1} {s}</span>)}</div>
      {step === 0 && (
        <>
          <p className="start-tip">Camila mixes her money. Separate business costs from personal spending.</p>
          <SortBuckets buckets={BUDGET_BUCKETS} items={BUDGET_ITEMS} doneLabel="Continue" onDone={(r) => { setSortScore(r.correct); setStep(1); }} />
        </>
      )}
      {step >= 1 && (
        <div className="g72-ledger">
          <div><span>💵 Monthly sales</span><b>{cop(2400000)}</b></div>
          {BUDGET_ITEMS.filter((x) => x.answer === "biz").map((x) => <div key={x.label}><span>− {x.label.split(" · ")[0]}</span><b>{cop(x.v)}</b></div>)}
          {okC && <div className="tot"><span>Business costs</span><b>{cop(1200000)}</b></div>}
          {okP && <div className="tot"><span>Business profit</span><b>{cop(1200000)}</b></div>}
          {okP && <div><span>− Camila's salary for herself</span><b>{cop(800000)}</b></div>}
          {okP && <div className="tot good"><span>Left in the business</span><b>{cop(400000)}</b></div>}
        </div>
      )}
      {step === 1 && (
        <div className="start-block">
          <h3>Total business costs?</h3>
          <div className="p2-answer-row"><span className="p2-unit">$</span><input className="start-input p2-num" type="number" value={costs} onChange={(e) => { setCosts(e.target.value); setBadC(false); }} disabled={okC} /><button className="s1-btn primary" disabled={!costs || okC} onClick={() => (num(costs) === 1200000 ? setOkC(true) : setBadC(true))}><Check size={16} /></button></div>
          {badC && <div className="p1-hint">💡 Add only the 5 business costs (not the concert or sneakers).</div>}
          {okC && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStep(2)}>Next <ChevronRight size={18} /></button></div>}
        </div>
      )}
      {step === 2 && (
        <div className="start-block">
          <h3>Business profit = sales − business costs?</h3>
          <div className="p2-answer-row"><span className="p2-unit">$</span><input className="start-input p2-num" type="number" value={profit} onChange={(e) => { setProfit(e.target.value); setBadP(false); }} disabled={okP} /><button className="s1-btn primary" disabled={!profit || okP} onClick={() => (num(profit) === 1200000 ? setOkP(true) : setBadP(true))}><Check size={16} /></button></div>
          {badP && <div className="p1-hint">💡 $2,400,000 − $1,200,000 = ?</div>}
          {okP && <div className="p1-banner good">Camila pays herself a salary of $800,000 (for her concert and sneakers!). $400,000 stays in the business.</div>}
          {okP && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStep(3)}>Next <ChevronRight size={18} /></button></div>}
        </div>
      )}
      {step === 3 && (
        <div className="start-block">
          <h3>$400,000 stays in the business. Can Camila pay a $180,000 installment?</h3>
          <div className="g72-opts">{[["✅", "Yes, and she still has a $220,000 cushion"], ["❌", "No, it's impossible"], ["🤷", "Only if she stops buying flour"]].map(([e, l], k) => <button key={k} type="button" disabled={canPay === 0} className={`g72-opt ${canPay === k ? (k === 0 ? "good" : "bad") : ""}`} onClick={() => setCanPay(k)}><em>{e}</em><span>{l}</span></button>)}</div>
          {canPay === 0 && <div className="p1-banner good">Correct — if she keeps business and personal money separate! In a slow month, the cushion protects her.</div>}
          {canPay === 0 && <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(15 + sortScore + 3, { sortScore, canPay: true })}>Save the budget <span className="coin-tag"><Coins size={15} /> +25</span></button></div>}
        </div>
      )}
    </ActShell>
  );
}

const NOTE_C18 = {
  n: 6, label: "Business funding plan", clients: ["camila"], question: "How should Camila pay for the $3,000,000 oven?",
  options: [
    { id: "save", e: "🐷", l: "Save part of the profit every month, then buy", fit: 2, note: "No debt — the oven just arrives later.", warn: "" },
    { id: "micro", e: "🌱", l: "A microcredit with a budget and a safe installment", fit: 2, note: "The oven can increase production — if the installment is safe.", warn: "" },
    { id: "mix", e: "🔀", l: "Save half first, then ask for a smaller loan", fit: 2, note: "Less debt, less interest, faster than saving everything.", warn: "" },
    { id: "card", e: "💳", l: "A personal credit card, paying only the minimum", fit: 0, note: "", warn: "Mixing personal credit with the business + minimum payments = very expensive." },
    { id: "daily", e: "💀", l: "Fast cash from a daily lender", fit: 0, note: "", warn: "Dangerous and extremely costly. Never a safe option." },
  ],
};

/* =====================================================================
   CLASE 19 · BANKING AROUND THE WORLD
   ===================================================================== */
const READ_C19 = [
  { sub: "Special report on financial inclusion" },
  { p: "Imagine that you receive money for your work, but you have no bank account. You cannot easily keep your money in a financial account, send a transfer, or use some digital payment services. You may need to travel a long distance to reach a financial institution. For many people, access to financial services is not easy." },
  { p: "The World Bank's Global Findex Database 2021 reported that about 1.4 billion adults around the world did not have a financial account. This is a historical figure from 2021, not a current count for every country. It shows that financial inclusion has been an important global challenge." },
  { box: "Financial inclusion means that people and businesses can access and use suitable financial services — payments, savings and credit — that are useful, safe, affordable and understandable." },
  { h: "🇰🇪 Kenya · M-Pesa" },
  { p: "In Kenya, one important example is M-Pesa, a mobile money service. It allows users to make certain financial transactions using mobile technology. Services like mobile money can help people send and receive money without always needing a traditional bank branch. However, users still need to understand fees, protect their accounts, and have access to a suitable phone and network." },
  { h: "🇧🇩 Bangladesh · Grameen Bank" },
  { p: "In Bangladesh, the Grameen Bank became known for microcredit and its work with people who often had limited access to traditional bank loans. However, a loan is not the right solution for everyone. Borrowers need clear conditions and a realistic repayment plan." },
  { h: "🇪🇺 Europe · Ethical banks" },
  { p: "In some European countries, people can also find banks and financial organizations that emphasize ethical or social goals. These institutions may consider how their activities affect communities and the environment. The word ethical does not automatically mean that every product is better or cheaper. Customers should still compare fees, risks, services, and the institution's real practices." },
  { h: "🇨🇴 Colombia · Correspondents and wallets" },
  { p: "Colombia has its own examples of financial access. People can use bank branches, authorized banking correspondents, and different digital financial services. A banking correspondent is an authorized business or service point that can perform certain financial operations for a financial institution. Depending on the service, a person may be able to make payments, deposits, or withdrawals at a nearby location." },
  { p: "Digital wallets can also help people send or receive money. But a wallet, a bank account, and a credit product may have different conditions and protections. Users should understand which service they have and what it offers." },
  { h: "⚖️ Your rights" },
  { p: "In Colombia, Law 1328 of 2009 establishes rules for protecting financial consumers in their relationships with supervised financial institutions. It includes principles such as clear and timely information, respectful service, and the right to submit questions, requests, complaints, or claims." },
  { p: "Customers should read the conditions of a product, check the fees, keep important documents, and contact the institution through official channels if something goes wrong. They can also seek help from the institution's Defensor del Consumidor Financiero, where applicable, or contact the appropriate authority." },
  { p: "The Rodríguez family is learning about these options. The grandmother wants a service she can understand and use safely. Someone without reliable internet may need a different solution from someone who uses a phone every day. Someone who needs emergency money should consider access and costs before locking savings away." },
  { box: "Financial inclusion means more than giving people a product. It means helping them make informed decisions and access services that work for their lives." },
];
const GLOSS_C19 = { "financial inclusion": "Inclusión financiera.", "mobile money": "Dinero móvil.", "banking correspondent": "Corresponsal bancario.", "ethical": "Ético.", "financial consumers": "Consumidores financieros.", "complaints": "Quejas.", "Defensor del Consumidor Financiero": "Defensor del cliente de la entidad.", "affordable": "Asequible." };
const Q_C19 = [
  { q: "What is financial inclusion?", options: ["Access to useful, safe financial services", "Giving everyone a credit card with no rules", "Banks that only work in the biggest cities"], correct: 0, feedback: "Useful, safe, affordable, understandable." },
  { q: "About how many adults had no financial account (Global Findex 2021)?", options: ["About 1.4 billion", "About 14 million", "About 140,000"], correct: 0, feedback: "About 1.4 billion adults (2021)." },
  { q: "What is M-Pesa?", options: ["A mobile money service in Kenya", "A bank for farmers in Bangladesh", "A Colombian law for consumers"], correct: 0, feedback: "Mobile money in Kenya." },
  { q: "What is a banking correspondent?", options: ["An authorized shop that offers bank services", "A person who writes long letters to banks", "A fake bank office that steals your money"], correct: 0, feedback: "Bank services in your neighborhood." },
  { q: "Which law protects financial consumers in Colombia?", options: ["Law 1328 of 2009", "Law 1480 of 2011", "Law 100 of 1993"], correct: 0, feedback: "Law 1328 (financial consumers). Law 1480 is the general Consumer Statute you saw in Period 1." },
];

const TOUR = [
  { id: "ke", flag: "🇰🇪", place: "Kenya", svc: "M-Pesa · mobile money", story: "Wanjiru lives far from a bank branch. She sells vegetables, and her son in Nairobi sends her money through her phone.",
    ben: ["Send and receive money without a branch", "Get free money from the phone company", "Never pay any fees for anything"], b: 0,
    risk: ["She must understand the fees and protect her PIN", "Phones can't send money to other cities", "Vegetables become much more expensive"], r: 0 },
  { id: "bd", flag: "🇧🇩", place: "Bangladesh", svc: "Grameen Bank · microcredit", story: "A group of women gets small loans to buy materials for their crafts and sell them at the market.",
    ben: ["Big loans for international companies", "Small loans for people without bank access", "Loans that never need to be repaid"], b: 1,
    risk: ["Microcredit is illegal in every country", "Crafts can never be sold at markets", "A loan needs a realistic repayment plan"], r: 2 },
  { id: "eu", flag: "🇪🇺", place: "Europe", svc: "Ethical bank", story: "Lukas chooses a bank that finances solar energy and community projects in his city.",
    ben: ["It is always the cheapest bank in town", "It considers its impact on people and nature", "It doesn't need to follow any rules"], b: 1,
    risk: ["He should still compare fees, risks and practices", "Ethical banks never return any deposits", "It only accepts payments in cash"], r: 0 },
  { id: "co", flag: "🇨🇴", place: "Colombia", svc: "Banking correspondent", story: "In a small town, Doña Luz pays bills and withdraws money at the neighborhood store, an authorized banking correspondent.",
    ben: ["The store owner keeps her PIN for her", "Financial services close to her home", "She never needs an account or an ID"], b: 1,
    risk: ["Stores can't handle any money at all", "Correspondents only work at midnight", "Check it is authorized and keep the receipt"], r: 2 },
];
function WorldBankTour({ onSave, onExit }) {
  const [open, setOpen] = useState(null);
  const [stamps, setStamps] = useState({});
  const [b, setB] = useState(null); const [r, setR] = useState(null);
  const [tries, setTries] = useState(0);
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="World banking explorer! 🌍" subtitle="4 stamps in your passport." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  const T = TOUR.find((x) => x.id === open);
  const count = Object.keys(stamps).length;
  if (T) {
    const ok = b === T.b && r === T.r;
    return (
      <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title={`${T.flag} ${T.place}`} subtitle={T.svc} onExit={() => { setOpen(null); setB(null); setR(null); }}>
        <div className="g72-scene"><div className="g72-scene-art">{T.flag}</div><div className="g72-scene-txt"><small>{T.svc}</small><p>{T.story}</p></div></div>
        <div className="start-block"><h3>👍 One benefit</h3><div className="quiz-options">{T.ben.map((o, k) => <button key={k} type="button" className={`quiz-opt ${b === k ? "sel-on" : ""}`} onClick={() => setB(k)}><span className="opt-key">{"ABC"[k]}</span><span className="opt-text">{o}</span></button>)}</div></div>
        <div className="start-block"><h3>⚠️ One risk to consider</h3><div className="quiz-options">{T.risk.map((o, k) => <button key={k} type="button" className={`quiz-opt ${r === k ? "sel-on" : ""}`} onClick={() => setR(k)}><span className="opt-key">{"ABC"[k]}</span><span className="opt-text">{o}</span></button>)}</div></div>
        {tries > 0 && !ok && <div className="p1-banner bad">The benefit or the risk doesn't fit. Read the story again.</div>}
        <div className="start-foot"><button className="s1-btn primary big" disabled={b === null || r === null} onClick={() => { if (ok) { setStamps({ ...stamps, [T.id]: tries === 0 }); setOpen(null); setB(null); setR(null); setTries(0); } else setTries(tries + 1); }}>Stamp my passport 🛂</button></div>
      </ActShell>
    );
  }
  return (
    <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title="World Banking Tour 🌍" subtitle="Visit 4 places. Connect each service with a benefit AND a risk." onExit={onExit}>
      <div className="g72-worldmap">
        {TOUR.map((t) => <button key={t.id} type="button" className={`g72-pin ${t.id} ${stamps[t.id] !== undefined ? "done" : ""}`} onClick={() => setOpen(t.id)}><em>{t.flag}</em><b>{t.place}</b><small>{stamps[t.id] !== undefined ? "🛂 Stamped" : t.svc}</small></button>)}
      </div>
      <div className="g72-passport2">{TOUR.map((t) => <span key={t.id} className={stamps[t.id] !== undefined ? "on" : ""}>{stamps[t.id] !== undefined ? t.flag : "?"}</span>)}</div>
      {count === 4 && <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(14 + Object.values(stamps).filter(Boolean).length * 4, { stamps })}>Finish the tour <span className="coin-tag"><Coins size={15} /> +30</span></button></div>}
    </ActShell>
  );
}

const RIGHTS = [
  { e: "🧾", t: "The bank charges Mr. Rodríguez a $9,000 fee that nobody explained.", probs: ["Unclear information about fees", "A scam by text message", "A loan that he asked for"], p: 0, steps: ["Post his account number online", "Ask the bank for clear information", "Stop paying all his family bills"], s: 1 },
  { e: "👵", t: "Grandma sees a $120,000 withdrawal that she didn't make.", probs: ["A service she understands well", "A charge she doesn't recognize", "A gift from her bank"], p: 1, steps: ["Report it officially and lock the card", "Wait a few months to see what happens", "Tell the neighbors her PIN to get help"], s: 0 },
  { e: "📨", t: "Camila sent a complaint 3 weeks ago, and nobody answered.", probs: ["A complaint without an answer", "Too many answers from the bank", "A problem with her oven"], p: 0, steps: ["Close her business forever", "Send the same email every hour", "Go to the Defensor del Consumidor Financiero"], s: 2 },
  { e: "📄", t: "Sofía doesn't understand the conditions of her savings account.", probs: ["A fraud by phone call", "A service she doesn't understand", "A loan she can't pay"], p: 1, steps: ["Ask questions: clear information is her right", "Sign without reading anything", "Close the account without asking"], s: 0 },
];
const COMPLAINT_STEPS = ["Read the conditions and keep your documents.", "Contact the institution through its official channel.", "Save the number of your complaint (radicado).", "No solution? Go to the Defensor del Consumidor Financiero.", "You can also contact the Superintendencia Financiera."];
function MyRights({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [p, setP] = useState(null); const [s, setS] = useState(null);
  const [log, setLog] = useState([]);
  const [stage, setStage] = useState("cases");
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Rights defender! ⚖️" subtitle="Clients have rights — and now you know them." coins={st.coins} saving={st.saving} onExit={onExit} />;
  if (stage === "order") {
    return (
      <ActShell icon={<Scale size={22} strokeWidth={2.1} />} title="The complaint path ⚖️" subtitle="Put the steps to ask for help in order." onExit={onExit}>
        <OrderGame items={COMPLAINT_STEPS} labels={["1", "2", "3", "4", "5"]} onDone={(r) => finish(10 + log.filter(Boolean).length * 3 + Math.max(0, 3 - r.errors), { cases: log, errors: r.errors })} />
      </ActShell>
    );
  }
  const C = RIGHTS[i];
  const done = p !== null && s !== null;
  return (
    <ActShell icon={<Scale size={22} strokeWidth={2.1} />} title="My Rights as a Client ⚖️" subtitle="Build the case file: identify the problem and the right first step." onExit={onExit}>
      <div className="p1-match-stats"><span>Case <b>{i + 1}/4</b></span><span>Correct files: <b>{log.filter(Boolean).length}</b></span></div>
      <div className="g72-casefile"><small>📁 CASE FILE #{i + 1}</small><p><span>{C.e}</span>{C.t}</p></div>
      <div className="start-block"><h3><span className="step-n">1</span> What is the problem?</h3><div className="p1-starters">{C.probs.map((o, k) => <button key={k} type="button" disabled={p !== null} className={`p1-chip ${p === k ? "on" : ""} ${p !== null ? (k === C.p ? "ok" : p === k ? "no" : "") : ""}`} onClick={() => setP(k)}>{o}</button>)}</div></div>
      {p !== null && <div className="start-block"><h3><span className="step-n">2</span> What is the right first step?</h3><div className="p1-starters">{C.steps.map((o, k) => <button key={k} type="button" disabled={s !== null} className={`p1-chip ${s === k ? "on" : ""} ${s !== null ? (k === C.s ? "ok" : s === k ? "no" : "") : ""}`} onClick={() => setS(k)}>{o}</button>)}</div></div>}
      {done && <div className={`p1-banner ${p === C.p && s === C.s ? "good" : "bad"}`}>{p === C.p && s === C.s ? "✅ Perfect case file!" : `Correct file: “${C.probs[C.p]}” → “${C.steps[C.s]}”.`}</div>}
      {done && <div className="start-foot"><button className="s1-btn primary big" onClick={() => { const l = [...log, p === C.p && s === C.s]; setLog(l); if (i === 3) setStage("order"); else { setI(i + 1); setP(null); setS(null); } }}>{i === 3 ? "Last step: the complaint path" : "Next case"} <ChevronRight size={18} /></button></div>}
    </ActShell>
  );
}

const ACCESS = [
  { id: "corr", e: "🏪", l: "Banking correspondent near home", s: { ease: 2, access: 3, cost: 2, safety: 2, support: 1 } },
  { id: "wallet", e: "👛", l: "Digital wallet, with family help", s: { ease: 2, access: 3, cost: 3, safety: 2, support: 2 } },
  { id: "branch", e: "🏦", l: "Savings account + branch visit with family", s: { ease: 1, access: 1, cost: 2, safety: 3, support: 3 } },
  { id: "cdt", e: "🔒", l: "A CDT for all her money", s: { ease: 1, access: 0, cost: 2, safety: 3, support: 1 } },
  { id: "cash", e: "💵", l: "Keep cash under the mattress", s: { ease: 3, access: 2, cost: 3, safety: 0, support: 0 } },
  { id: "lender", e: "💀", l: "An informal lender when she needs money", s: { ease: 3, access: 3, cost: 0, safety: 0, support: 0 } },
];
const CRIT = [["ease", "😊 Easy to use"], ["access", "📍 Access"], ["cost", "💸 Low cost"], ["safety", "🛡️ Safety"], ["support", "🤝 Support"]];
const PLEDGES = ["I will give honest advice, even when it is not the most popular option.", "I will explain costs and risks clearly.", "I will respect my client's decision.", "I will protect my clients' private information."];
function AccessPlan({ existing, onSave, onExit }) {
  const [picks, setPicks] = useState([]);
  const [why, setWhy] = useState("");
  const [pl, setPl] = useState([]);
  const [promise, setPromise] = useState("");
  const [step, setStep] = useState(0);
  const [st, finish] = useFinish(onSave);
  const sel = picks.map((id) => ACCESS.find((a) => a.id === id));
  const score = {};
  CRIT.forEach(([k]) => {
    if (!sel.length) { score[k] = 0; return; }
    const vals = sel.map((a) => a.s[k]);
    score[k] = k === "safety" ? Math.min(...vals) : k === "cost" ? Math.round(vals.reduce((x, y) => x + y, 0) / vals.length) : Math.max(...vals);
  });
  const good = sel.length > 0 && CRIT.every(([k]) => score[k] >= 2);
  if (st.done) return <Reward title="Ethical advisor! 🌍" subtitle="Grandma Rodríguez has a plan that works for her life." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  const g = clientById("rodriguez");
  return (
    <ActShell icon={<Handshake size={22} strokeWidth={2.1} />} title="Design a Financial Access Plan 🌍" subtitle="For Grandma Rodríguez: combine 1–3 services. Then sign your ethics pledge." onExit={onExit}>
      <div className="g72-steps"><span className={step === 0 ? "on" : "done"}>{step > 0 ? "✓" : 1} Access plan</span><span className={step === 1 ? "on" : ""}>2 Ethics pledge</span></div>
      {step === 0 && (
        <>
          <div className="g72-profile"><em>👵</em><div><b>Grandma Rodríguez · {g.name}</b><p>She has never had an account. She has a simple phone, lives 40 minutes from a branch, and the family wants her to be safe and independent.</p></div></div>
          <div className="g72-opts">{ACCESS.map((a) => <button key={a.id} type="button" className={`g72-opt ${picks.includes(a.id) ? "on" : ""}`} onClick={() => setPicks(picks.includes(a.id) ? picks.filter((x) => x !== a.id) : picks.length < 3 ? [...picks, a.id] : picks)}><em>{a.e}</em><span>{a.l}</span></button>)}</div>
          <div className="g72-meters">{CRIT.map(([k, l]) => <Meter key={k} label={l} value={Math.round((score[k] / 3) * 100)} color={score[k] >= 2 ? "var(--green)" : "var(--coral)"} />)}</div>
          {sel.length > 0 && !good && <div className="g72-conseq f0"><b>⚠️ Consequence card</b><span>{score.safety < 2 ? "Her money is not safe with this plan." : score.access < 2 ? "She can't reach her money easily." : score.support < 2 ? "Nobody helps her learn — she may feel lost." : score.ease < 2 ? "It's too hard for her to use alone." : "It is too expensive."} Try another combination.</span></div>}
          {good && <div className="g72-conseq f2"><b>✅ This plan works for Grandma!</b><span>Every meter is green. Now explain your plan.</span></div>}
          {good && (
            <div className="start-block">
              <div className="p3-sentence edit"><span>I recommend <b>{sel.map((a) => a.l).join(" + ")}</b> because</span><input className="start-input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Write your reason here…" /></div>
            </div>
          )}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!good || countWords(why) < 5} onClick={() => setStep(1)}>Next: ethics pledge <ChevronRight size={18} /></button></div>
        </>
      )}
      {step === 1 && (
        <>
          <div className="g72-pledge">
            <small>🤝 JUNIOR ADVISOR · ETHICS PLEDGE</small>
            {PLEDGES.map((t) => <label key={t} className="perm-check p1-check"><input type="checkbox" checked={pl.includes(t)} onChange={() => setPl(pl.includes(t) ? pl.filter((x) => x !== t) : [...pl, t])} /><span>{t}</span></label>)}
            <div className="p3-sentence edit"><span>As an ethical advisor, I promise to</span><input className="start-input" value={promise} onChange={(e) => setPromise(e.target.value)} placeholder="Write your promise here…" /></div>
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={pl.length < PLEDGES.length || countWords(promise) < 4} onClick={() => finish(25, { picks, why, pledge: promise, notes: { rodriguez: { picks: sel.map((a) => a.l), why, fit: 2, extra: `Pledge: ${promise}` } } })}>Sign and add to my portfolio <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   CLASES 20–21 · BANKING ADVISORY CHALLENGE
   ===================================================================== */
const loadHtml2Canvas = () => (window.html2canvas ? Promise.resolve(window.html2canvas) : new Promise((res, rej) => {
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  s.onload = () => res(window.html2canvas); s.onerror = rej;
  document.body.appendChild(s);
}));

const FOLIO_PARTS = [
  { t: "Client profiles and financial goals", keys: ["c11_clients"] },
  { t: "Recommended account and explanation", keys: ["c12_note"] },
  { t: "Savings plan and interest calculation", keys: ["c13_note", "c13_goal"] },
  { t: "Borrowing recommendation", keys: ["c15_note"] },
  { t: "Digital banking and cybersecurity guide", keys: ["c16_note", "c17_guide"] },
  { t: "Business financing plan for Camila", keys: ["c18_path"] },
  { t: "Ethical recommendation", keys: ["c19_access"] },
];
function AdvisoryPortfolio({ resp, studentName, existing, onSave, onExit }) {
  const data = portfolioData(resp);
  const [concl, setConcl] = useState(existing?.conclusions || { sofia: "", rodriguez: "", camila: "" });
  const [busy, setBusy] = useState(false);
  const [st, finish] = useFinish(onSave);
  const parts = FOLIO_PARTS.map((p) => ({ ...p, ok: p.keys.every((k) => resp?.[k]) }));
  const ready = parts.filter((p) => p.ok).length;
  const plans = resp?.c13_goal?.plans || {};
  const avatar = resp?.c11_clients?.avatar || "🧑‍💼";
  const canPublish = ready >= 4 && CLIENTS.every((c) => countWords(concl[c.id]) >= 5);
  const png = async () => {
    setBusy(true);
    try { const h2c = await loadHtml2Canvas(); const c = await h2c(document.getElementById("g72-portfolio"), { scale: 2, backgroundColor: "#ffffff", useCORS: true }); const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = `Advisory_Portfolio_${(studentName || "student").replace(/\s+/g, "_")}.png`; a.click(); }
    catch (e) { /* sin imagen */ }
    setBusy(false);
  };
  const print = () => { document.body.classList.add("g72-printing"); const off = () => { document.body.classList.remove("g72-printing"); window.removeEventListener("afterprint", off); }; window.addEventListener("afterprint", off); setTimeout(() => window.print(), 50); };
  if (st.done) return <Reward title="Portfolio published! 📁" subtitle="You are ready for the Advisor Fair." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Award size={22} strokeWidth={2.1} />} title="My Advisory Portfolio 📁" subtitle="It builds itself with your Advisor Notes. Add your final advice for each client." onExit={onExit}>
      <div className="g72-checklist">
        <b>Junior Financial Advisor Portfolio · {ready} of 7 components ready</b>
        {parts.map((p) => <span key={p.t} className={p.ok ? "ok" : ""}>{p.ok ? "☑" : "☐"} {p.t}</span>)}
      </div>
      <div className="g72-portfolio" id="g72-portfolio">
        <header>
          <div className="g72-pf-avatar">{avatar}</div>
          <div><small>BANKING ADVISORY PORTFOLIO · GRADE 7 · INSTITUTO CREAR</small><h2>How Banks Work</h2><p>Junior Financial Advisor: <b>{studentName}</b></p></div>
        </header>
        {data.map((c) => (
          <section key={c.id} className="g72-pf-client" style={{ "--cc": c.color }}>
            <div className="g72-pf-head"><em>{c.e}</em><div><b>{c.name}</b><small>{c.tag}</small></div><Meter value={c.trust} color={c.color} label="🤝 Trust" /></div>
            <div className="g72-pf-diag">
              <span><b>⚠️ Problem:</b> {c.diag?.p || c.problem}</span>
              <span><b>🎯 Goal:</b> {c.diag?.g || c.goal}</span>
              {plans[c.id] && <span><b>🐷 Savings plan:</b> {cop(plans[c.id].monthly)} per month → goal in {plans[c.id].months} months</span>}
            </div>
            <div className="g72-pf-recs">
              {c.notes.length === 0 && <p className="g72-pf-empty">No recommendations yet.</p>}
              {c.notes.map((n) => (
                <div key={n.key} className={`g72-pf-rec f${n.rec.fit}`}>
                  <small>{n.e} {n.label}</small>
                  <b>{(n.rec.picks || []).join(" + ")}</b>
                  {n.rec.extra && <i>{n.rec.extra}</i>}
                  <span>“…because {n.rec.why}”</span>
                </div>
              ))}
            </div>
            <div className="g72-pf-final"><b>🗣️ My final advice:</b> {concl[c.id] || "…"}</div>
          </section>
        ))}
        <footer>🏦 Concepts: banks · accounts · CDT · interest · debit & credit · total cost of a loan · digital banking · cybersecurity · microcredit · financial inclusion</footer>
      </div>
      <div className="start-block">
        <h3><PenLine size={18} /> My final advice for each client</h3>
        {CLIENTS.map((c) => <div key={c.id} className="p3-sentence edit"><span>{c.e} My final advice for {c.name} is</span><input className="start-input" value={concl[c.id]} onChange={(e) => setConcl({ ...concl, [c.id]: e.target.value })} placeholder="Write your final advice here…" /></div>)}
      </div>
      {ready < 4 && <div className="p1-banner bad">You need at least 4 of 7 components. Complete more Advisor Notes in classes 11–19.</div>}
      <div className="p3-card-actions">
        <button className="s1-btn ghost" disabled={busy} onClick={png}><Download size={17} /> {busy ? "Creating…" : "Download PNG"}</button>
        <button className="s1-btn ghost" onClick={print}><Printer size={17} /> Print / PDF</button>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!canPublish} onClick={() => finish(50, { conclusions: concl, components: ready })}>Publish my portfolio <span className="coin-tag"><Coins size={15} /> +50</span></button></div>
    </ActShell>
  );
}

const PITCH_FRAMES = [
  { k: "a", f: "My client is", ph: "Camila, a young entrepreneur who sells desserts." },
  { k: "b", f: "Her / their goal is", ph: "to buy an industrial oven for $3,000,000." },
  { k: "c", f: "I recommend", ph: "a separate business account and saving half first." },
  { k: "d", f: "This is a safe choice because", ph: "the installment is small and she has a cushion." },
];
const CLIENT_QS = ["Why do you recommend this account?", "What happens if I cannot repay the loan?", "How long will it take to reach my goal?", "Is my money really safe in a bank?", "What should I do if I get a strange SMS?", "A daily lender is faster. Why not use one?", "Why can't I just keep my money at home?", "How much will this cost me in one year?"];
function PitchPractice({ onSave, onExit }) {
  const [v, setV] = useState({ a: "", b: "", c: "", d: "" });
  const deck = useMemo(() => shuffleArr(CLIENT_QS), []);
  const [q, setQ] = useState(-1);
  const [answered, setAnswered] = useState(0);
  const [st, finish] = useFinish(onSave);
  const framesOk = PITCH_FRAMES.every((f) => countWords(v[f.k]) >= 3);
  if (st.done) return <Reward title="Pitch ready! 🎤" subtitle="You can defend your recommendations." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Mic size={22} strokeWidth={2.1} />} title="Pitch Practice 🎤" subtitle="Write your pitch. Then your partner plays the client and asks tough questions!" onExit={onExit}>
      <div className="start-block">
        <h3><span className="step-n">1</span> My 30-second pitch</h3>
        {PITCH_FRAMES.map((f) => <div key={f.k} className="p3-sentence edit"><span>{f.f}</span><input className="start-input" value={v[f.k]} onChange={(e) => setV({ ...v, [f.k]: e.target.value })} placeholder="Write your answer here…" /></div>)}
      </div>
      {framesOk && (
        <div className="start-block">
          <h3><span className="step-n">2</span> 🎭 Client role-play · your partner reads the card aloud</h3>
          {q < 0 ? <button className="s1-btn primary" onClick={() => setQ(0)}><Play size={16} /> Deal a client card</button> : (
            <>
              <div className="g72-qcard"><small>🙋 The client asks…</small><b>“{deck[q % deck.length]}”</b></div>
              <div className="g72-app-two">
                <button className="s1-btn ghost" onClick={() => setQ(q + 1)}><RefreshCw size={15} /> Skip</button>
                <button className="s1-btn primary" onClick={() => { setAnswered(answered + 1); setQ(q + 1); }}><Check size={15} /> I answered in English</button>
              </div>
              <p className="start-tip p1-center">Answered: <b>{answered}</b>/4</p>
            </>
          )}
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!framesOk || answered < 4} onClick={() => finish(20, { pitch: v, answered })}>I'm ready for the fair <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}

const PRESENT_STEPS2 = ["I introduced myself as a Junior Financial Advisor.", "I presented my 3 clients and their goals.", "I explained at least 2 recommendations with “because”.", "I used a number (interest, total cost, months…).", "I answered a question from a visitor."];
const FAIR_STARS = [["clear", "The recommendation was clear"], ["evidence", "They used numbers or evidence"], ["english", "They spoke in English"]];
function AdvisorFair({ mode, onSave, onExit }) {
  const visit = mode === "visit";
  const [checks, setChecks] = useState([]);
  const [peer, setPeer] = useState("");
  const [stars, setStars] = useState({ clear: 0, evidence: 0, english: 0 });
  const [c1, setC1] = useState(""); const [c2, setC2] = useState(""); const [c3, setC3] = useState("");
  const [hire, setHire] = useState(null);
  const [st, finish] = useFinish(onSave);
  const ready = (visit || checks.length === PRESENT_STEPS2.length) && peer.trim() && Object.values(stars).every((x) => x > 0) && countWords(c1) >= 3 && countWords(c2) >= 3 && countWords(c3) >= 3 && (!visit || hire !== null);
  const coins = visit ? 15 : 20;
  if (st.done) return <Reward title={visit ? "Great visitor! 🧐" : "Great presentation! 🎤"} subtitle={visit ? "Your feedback helps another advisor improve." : "Your classmate gave you feedback."} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={visit ? <Eye size={22} strokeWidth={2.1} /> : <Mic size={22} strokeWidth={2.1} />} title={visit ? "Advisor Fair · I am the visitor 🧐" : "Advisor Fair · I present 🎤"} subtitle={visit ? "Visit a classmate's stand. Evaluate their advice with the rubric." : "Present your portfolio. Then give your tablet to a visitor for feedback."} onExit={onExit}>
      {!visit && (
        <div className="start-block">
          <h3><span className="step-n">1</span> My presentation checklist</h3>
          {PRESENT_STEPS2.map((s) => <label key={s} className="perm-check p1-check"><input type="checkbox" checked={checks.includes(s)} onChange={() => setChecks(checks.includes(s) ? checks.filter((x) => x !== s) : [...checks, s])} /><span>{s}</span></label>)}
        </div>
      )}
      <div className="start-block">
        <h3><span className="step-n">{visit ? 1 : 2}</span> {visit ? "The advisor I visited" : "🔁 Visitor's feedback (the visitor writes here)"}</h3>
        <input className="start-input p3-gap" value={peer} onChange={(e) => setPeer(e.target.value)} placeholder={visit ? "Advisor's name" : "Visitor's name"} />
        {FAIR_STARS.map(([k, l]) => (
          <div key={k} className="p3-rub"><div><b>{l}</b></div><span /><div className="p3-stars">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={stars[k] >= n ? "on" : ""} onClick={() => setStars({ ...stars, [k]: n })}>★</button>)}</div></div>
        ))}
        <div className="p3-sentence edit"><span>✅ One clear recommendation was</span><input className="start-input" value={c1} onChange={(e) => setC1(e.target.value)} placeholder="Write it here…" /></div>
        <div className="p3-sentence edit"><span>❓ My question is</span><input className="start-input" value={c2} onChange={(e) => setC2(e.target.value)} placeholder="Write your question here…" /></div>
        <div className="p3-sentence edit"><span>💡 One suggestion:</span><input className="start-input" value={c3} onChange={(e) => setC3(e.target.value)} placeholder="Write your suggestion here…" /></div>
        {visit && (
          <>
            <h3>Would you hire this advisor? 🤝</h3>
            <div className="p1-starters">{["🤩 Yes, definitely!", "🙂 Yes, with small changes", "🤔 Not yet"].map((o, k) => <button key={o} type="button" className={`p1-chip ${hire === k ? "on" : ""}`} onClick={() => setHire(k)}>{o}</button>)}</div>
          </>
        )}
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(coins, { checks, peer, stars, comments: [c1, c2, c3], hire })}>Save feedback <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
    </ActShell>
  );
}

const BOSS_7P2 = [
  { q: "A bank pays you ___ for using your money.", options: ["interest", "a penalty", "a fee"], correct: 0, feedback: "Interest!" },
  { q: "Banco de la República is…", options: ["Colombia's central bank", "a normal savings bank", "a new fintech app"], correct: 0, feedback: "It issues Colombia's legal money." },
  { q: "A cooperative is owned by…", options: ["its members", "the government", "one rich person"], correct: 0, feedback: "Members own it." },
  { q: "Fogafín protects…", options: ["eligible deposits, up to a limit", "every product, with no limit at all", "only credit card purchases"], correct: 0, feedback: "Eligible deposits, up to the applicable limit." },
  { q: "Money you won't need for many months could go in a…", options: ["CDT", "wallet for daily payments", "piggy bank at home"], correct: 0, feedback: "A CDT, for money you don't need now." },
  { q: "A $15,000 monthly fee costs per year…", options: ["$180,000", "$150,000", "$15,000"], correct: 0, feedback: "$15,000 × 12." },
  { q: "Simple interest: $200,000 × 5% × 1 year =", options: ["$10,000", "$1,000", "$20,000"], correct: 0, feedback: "200,000 × 0.05 = 10,000." },
  { q: "Does the highest interest rate always win?", options: ["No — check fees and conditions", "Yes — always choose the biggest rate", "Yes — fees don't matter at all"], correct: 0, feedback: "Remember the Savings Race!" },
  { q: "Paying with a debit card uses…", options: ["money in your own account", "money borrowed from the issuer", "the store's own money"], correct: 0, feedback: "Debit = your money." },
  { q: "With a credit card, you…", options: ["borrow money and must repay it", "spend money that is a free gift", "never pay any interest or fees"], correct: 0, feedback: "Credit = borrowed money." },
  { q: "12 payments of $100,000 for a $1,000,000 loan. The extra cost is…", options: ["$200,000", "$100,000", "$1,200,000"], correct: 0, feedback: "$1,200,000 − $1,000,000." },
  { q: "A daily lender who threatens people is…", options: ["dangerous — look for help", "a safe and fast option", "the same as a bank loan"], correct: 0, feedback: "Never safe. Ask a trusted adult or the authorities." },
  { q: "Before confirming a QR payment, check…", options: ["the name and the amount", "the color of the code", "the time of the day"], correct: 0, feedback: "Name + amount." },
  { q: "A text says: “Confirm your PIN here”. This is…", options: ["smishing", "a normal bank message", "vishing"], correct: 0, feedback: "SMS scam = smishing." },
  { q: "2FA means…", options: ["a second step to verify you", "two free bank accounts", "two passwords for friends"], correct: 0, feedback: "Two-factor authentication." },
  { q: "Microcredit is…", options: ["a small loan for an income activity", "free money you never have to repay", "a special type of savings account"], correct: 0, feedback: "Still debt — needs a plan." },
  { q: "A banking correspondent is…", options: ["an authorized shop with bank services", "a lawyer who works for a big bank", "a fake bank office on the street"], correct: 0, feedback: "Bank services in your neighborhood." },
  { q: "Law 1328 of 2009 protects…", options: ["financial consumers", "only bank owners", "only big companies"], correct: 0, feedback: "Clear information + the right to complain." },
];
const RUBRIC72 = [
  { id: "banks", t: "I can explain what banks, cooperatives and fintechs do", d: "And the job of Banco de la República." },
  { id: "numbers", t: "I can calculate simple interest and the total cost of a loan", d: "I compare fees, rates and totals." },
  { id: "credit", t: "I understand debit, credit and responsible borrowing", d: "I know the danger of gota a gota." },
  { id: "safety", t: "I can protect money online", d: "Phishing, smishing, vishing, 2FA." },
  { id: "advisor", t: "I gave clear, honest advice to my 3 clients", d: "With “because” and evidence." },
];
const STAR_L = ["", "Starting", "Developing", "Good", "Excellent"];
function SelfCheck72({ existing, onSave, onExit }) {
  const [stars, setStars] = useState(existing?.stars || {});
  const [proud, setProud] = useState(existing?.proud || "");
  const [diff, setDiff] = useState(existing?.diff || "");
  const [st, finish] = useFinish(onSave);
  const all = RUBRIC72.every((r) => stars[r.id]);
  const score = Math.round(RUBRIC72.reduce((a, r) => a + (stars[r.id] || 0), 0) / (RUBRIC72.length * 4) * 100);
  if (st.done) return <Reward title="Period 2 complete! 🏆" subtitle="You are a real Junior Financial Advisor." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Star size={22} strokeWidth={2.1} />} title="My Self-Check · Period 2" subtitle="Be honest. How did you do as a Junior Advisor?" onExit={onExit}>
      <div className="p3-rubric">
        {RUBRIC72.map((r) => (
          <div key={r.id} className="p3-rub">
            <div><b>{r.t}</b><small>{r.d}</small></div><span />
            <div className="p3-stars">{[1, 2, 3, 4].map((n) => <button key={n} type="button" className={(stars[r.id] || 0) >= n ? "on" : ""} onClick={() => setStars({ ...stars, [r.id]: n })}>★</button>)}<small>{STAR_L[stars[r.id] || 0]}</small></div>
          </div>
        ))}
      </div>
      <div className="p3-score"><small>My self-check</small><b>{score}%</b><div className="p3-mini-bar"><i style={{ width: `${score}%` }} /></div></div>
      <div className="start-block">
        <label className="p3-lbl">🌟 My best decision as an advisor was…<input className="start-input" value={proud} onChange={(e) => setProud(e.target.value)} placeholder="Write your answer here…" /></label>
        <label className="p3-lbl">🔁 Next time I would do differently…<input className="start-input" value={diff} onChange={(e) => setDiff(e.target.value)} placeholder="Write your answer here…" /></label>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!all || countWords(proud) < 4 || countWords(diff) < 3} onClick={() => finish(20, { stars, score, proud, diff })}>Send my self-check <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   ESTRUCTURA DEL PERIODO (clases 11–21)
   ===================================================================== */
const G7P2_WEEKS = [
  { n: 11, g: "11", title: "Why do banks exist?", blurb: "From the piggy bank to the bank. Meet your 3 clients.", e: "🏦", skills: ["Listening", "Reading"], acts: [
    { key: "c11_video", title: "Video: What is a Bank?", desc: "Watch + 8 random questions (70%).", icon: <Video size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c11_story", title: "From Piggy Bank to Bank 🐷", desc: "A story with 5 decisions and consequences.", icon: <PiggyBank size={22} />, coins: 20, bucket: "aprendi" },
    { key: "c11_read", title: "Reading: Where Does Your Money Sleep?", desc: "Read + Who's Who? (bank, coop, fintech, central bank).", icon: <BookOpen size={22} />, coins: 22, bucket: "quizzes", topics: ["Bank", "Cooperative", "Fintech", "Fogafín"] },
    { key: "c11_clients", title: "Meet Your Clients 💼", desc: "Your Advisor ID + first diagnosis.", icon: <Users size={22} />, coins: 20, bucket: "aprendi" },
  ] },
  { n: 12, g: "12", title: "Bank accounts", blurb: "Savings, checking, CDT… and the hidden fees.", e: "🐷", skills: ["Reading", "Writing"], acts: [
    { key: "c12_read", title: "Reading: Choosing the Right Account", desc: "Read + 5 questions.", icon: <BookOpen size={22} />, coins: 30, bucket: "quizzes", topics: ["Savings", "Checking", "CDT", "4×1,000"] },
    { key: "c12_match", title: "Account Matchmaker 💘", desc: "6 people, 6 perfect accounts.", icon: <Handshake size={22} />, coins: 26, bucket: "aprendi" },
    { key: "c12_fee", title: "Fee Detective 🕵️", desc: "Open 12 receipts and find the real cost.", icon: <Search size={22} />, coins: 20, bucket: "quizzes" },
    { key: "c12_build", title: "Build Your Account 🛠️", desc: "Design and test an account for each client.", icon: <Puzzle size={22} />, coins: 20, bucket: "aprendi" },
    { key: "c12_note", title: "Advisor Note #1 · Account 📁", desc: "Recommend an account to each client.", icon: <Briefcase size={22} />, coins: 15, bucket: "aprendi" },
  ] },
  { n: 13, g: "13", title: "Interest I earn", blurb: "Jenny's loans, the Interest Machine and the Savings Race.", e: "📈", skills: ["Listening", "Math"], acts: [
    { key: "c13_video", title: "Video: Jenny, Michael & Interest", desc: "Watch + 8 random questions (70%).", icon: <Video size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c13_read", title: "Reading + Interest Machine ⚙️", desc: "Can your money grow? 3 challenges.", icon: <Calculator size={22} />, coins: 25, bucket: "aprendi", topics: ["Principal", "Rate", "Time", "Fees"] },
    { key: "c13_race", title: "Savings Race 🏁", desc: "Predict the winner. Watch 12 months fly!", icon: <Flame size={22} />, coins: 25, bucket: "aprendi" },
    { key: "c13_goal", title: "Goal Builder 🎯", desc: "A realistic savings plan for each of your 3 clients.", icon: <Target size={22} />, coins: 25, bucket: "aprendi" },
    { key: "c13_note", title: "Advisor Note #2 · Savings plan 📁", desc: "A plan for each client.", icon: <Briefcase size={22} />, coins: 15, bucket: "aprendi" },
  ] },
  { n: 14, g: "14", title: "Credit vs. debit", blurb: "Whose money is it? Follow the money!", e: "💳", skills: ["Reading", "Speaking"], acts: [
    { key: "c14_warm", title: "Warm-up: Tap, QR or PIN?", desc: "4 quick 6th-grade basics.", icon: <Smartphone size={22} />, coins: 16, bucket: "quizzes" },
    { key: "c14_read", title: "Reading: Whose Money Is It?", desc: "The story of two cards + 5 questions.", icon: <BookOpen size={22} />, coins: 30, bucket: "quizzes" },
    { key: "c14_lightning", title: "Debit or Credit? ⚡", desc: "10 lightning cards with a timer.", icon: <Zap size={22} />, coins: 30, bucket: "quizzes" },
    { key: "c14_follow", title: "Follow the Money 🧭", desc: "Order the debit and credit paths.", icon: <Compass size={22} />, coins: 20, bucket: "aprendi" },
  ] },
  { n: 15, g: "15", title: "Responsible borrowing", blurb: "The real price of a loan — and the danger of gota a gota.", e: "📝", skills: ["Reading", "Math"], acts: [
    { key: "c15_read", title: "Reading: The Real Price of a Loan", desc: "Read + 5 questions.", icon: <BookOpen size={22} />, coins: 30, bucket: "quizzes", topics: ["Principal", "Total cost", "Usury", "Gota a gota"] },
    { key: "c15_lab", title: "Loan Lab 🧪", desc: "3 offers. Find the total cost.", icon: <Puzzle size={22} />, coins: 30, bucket: "aprendi" },
    { key: "c15_trap", title: "Installment Trap 🪤", desc: "Small installment, big total?", icon: <AlertTriangle size={22} />, coins: 20, bucket: "quizzes" },
    { key: "c15_escape", title: "Debt Escape Room 🚪", desc: "4 doors to escape the debt trap.", icon: <Lock size={22} />, coins: 30, bucket: "aprendi" },
    { key: "c15_note", title: "Advisor Note #3 · Loan yes or no? 📁", desc: "Should each client borrow?", icon: <Briefcase size={22} />, coins: 15, bucket: "aprendi" },
  ] },
  { n: 16, g: "16", title: "Digital banking", blurb: "A day without cash and the CREAR Bank Simulator.", e: "📱", skills: ["Reading", "Digital"], acts: [
    { key: "c16_read", title: "Reading: A Day Without Cash", desc: "Read + 5 questions.", icon: <BookOpen size={22} />, coins: 30, bucket: "quizzes" },
    { key: "c16_app", title: "CREAR Bank Simulator 📱", desc: "5 missions in a fictional banking app.", icon: <Smartphone size={22} />, coins: 35, bucket: "aprendi", topics: ["Balance", "Transfer", "QR", "History", "Lock"] },
    { key: "c16_wallet", title: "Wallet or Bank? 👛🏦", desc: "Sort the features.", icon: <Wallet size={22} />, coins: 20, bucket: "quizzes" },
    { key: "c16_note", title: "Advisor Note #4 · Digital tools 📁", desc: "The right digital tool for each client.", icon: <Briefcase size={22} />, coins: 15, bucket: "aprendi" },
  ] },
  { n: 17, g: "17", title: "Cybersecurity in banking", blurb: "Phishing, smishing, vishing — and the Cyber Escape Room.", e: "🛡️", skills: ["Listening", "Reading"], acts: [
    { key: "c17_video", title: "Video: Account Takeover Fraud", desc: "Watch + 8 random questions (70%).", icon: <Video size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c17_read", title: "Reading: Three Messages, One Mistake", desc: "Read + 5 questions.", icon: <BookOpen size={22} />, coins: 30, bucket: "quizzes", topics: ["Phishing", "Smishing", "Vishing", "2FA"] },
    { key: "c17_escape", title: "Cyber Bank Escape Room 🔐", desc: "5 rooms. Become a Cyber Safety Champion.", icon: <ShieldCheck size={22} />, coins: 40, bucket: "aprendi" },
    { key: "c17_guide", title: "Advisor Note #5 · Security guide 📁", desc: "3 rules + 1 emergency action per client.", icon: <Briefcase size={22} />, coins: 15, bucket: "aprendi" },
  ] },
  { n: 18, g: "18", title: "Banks for entrepreneurs", blurb: "The Bank of the Poor and your loan office.", e: "🧁", skills: ["Reading", "Math"], acts: [
    { key: "c18_read", title: "Reading: The Bank of the Poor", desc: "Microcredit + 5 questions.", icon: <BookOpen size={22} />, coins: 30, bucket: "quizzes", topics: ["Microcredit", "Grameen", "Collateral"] },
    { key: "c18_officer", title: "Loan Officer Simulator 🏦", desc: "4 businesses. Approve, reject or ask?", icon: <Briefcase size={22} />, coins: 30, bucket: "aprendi" },
    { key: "c18_budget", title: "Business Budget Builder 📊", desc: "Can Camila pay the oven?", icon: <Calculator size={22} />, coins: 25, bucket: "aprendi" },
    { key: "c18_path", title: "Advisor Note #6 · Camila's plan 📁", desc: "The best way to pay for the oven.", icon: <Briefcase size={22} />, coins: 15, bucket: "aprendi" },
  ] },
  { n: 19, g: "19", title: "Banking around the world", blurb: "Financial inclusion, your rights and an ethical plan.", e: "🌍", skills: ["Reading", "Speaking"], acts: [
    { key: "c19_read", title: "Reading: Banking Around the World", desc: "Read + 5 questions.", icon: <BookOpen size={22} />, coins: 30, bucket: "quizzes", topics: ["M-Pesa", "Grameen", "Ethical banks", "Law 1328"] },
    { key: "c19_tour", title: "World Banking Tour 🌍", desc: "4 countries, 4 stamps.", icon: <Globe size={22} />, coins: 30, bucket: "aprendi" },
    { key: "c19_rights", title: "My Rights as a Client ⚖️", desc: "4 case files + the complaint path.", icon: <Scale size={22} />, coins: 25, bucket: "quizzes" },
    { key: "c19_access", title: "Advisor Note #7 · Access plan + ethics 📁", desc: "A plan for Grandma + your pledge.", icon: <Handshake size={22} />, coins: 25, bucket: "aprendi" },
  ] },
  { n: 20, g: "20", title: "Build your portfolio", blurb: "Your portfolio builds itself. Practice your pitch.", e: "📁", skills: ["Writing", "Speaking"], acts: [
    { key: "c20_portfolio", title: "My Advisory Portfolio 📁", desc: "It builds itself with your notes!", icon: <Award size={22} />, coins: 50, bucket: "aprendi" },
    { key: "c20_pitch", title: "Pitch Practice 🎤", desc: "Your pitch + client role-play cards.", icon: <Mic size={22} />, coins: 20, bucket: "comportamiento" },
    { key: "c20_fair", title: "Advisor Fair · Part 1 🎪", desc: "Present and get feedback.", icon: <Users size={22} />, coins: 20, bucket: "comportamiento" },
  ] },
  { n: 21, g: "21", title: "Advisor Fair & Boss", blurb: "Visit, evaluate, fight the Boss.", e: "🏆", skills: ["Speaking", "Review"], acts: [
    { key: "c21_fair", title: "Advisor Fair · Part 2 🧐", desc: "Visit a stand and evaluate it.", icon: <Eye size={22} />, coins: 15, bucket: "comportamiento" },
    { key: "c21_boss", title: "Boss Battle · Period 2 ⚔️", desc: "12 questions from the whole period.", icon: <Swords size={22} />, coins: 58, bucket: "quizzes" },
    { key: "c21_self", title: "My Self-Check", desc: "How did I do as an advisor?", icon: <Star size={22} />, coins: 20, bucket: "comportamiento" },
  ] },
];
const ALL_ACTS = G7P2_WEEKS.flatMap((w) => w.acts);
const TOTAL_ACTS = ALL_ACTS.length;
const NOTE_ACTS = ["c11_clients", "c12_note", "c13_note", "c15_note", "c16_note", "c17_guide", "c18_path", "c19_access"];

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Periodo2G7 = ({ userData, API_URL, existingRow, onBack }) => {
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

  const [week, setWeek] = useState(null);
  const [act, setAct] = useState(null);
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [week, act]);

  const name = userData?.Nombre_Completo || "Student";
  const doneCount = ALL_ACTS.filter((a) => checklist[a.key]).length;
  const pct = Math.round((doneCount / TOTAL_ACTS) * 100);
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
      .catch((e) => { console.error("Error guardando 7° Periodo 2:", e); dispatch({ type: "rollback_progreso", payload: { Semana: PERIOD_KEY, prev } }); });
  };

  const complete = (key, bucket, xp, respPatch, pass = true) => {
    const already = !!checklist[key];
    const nextChecklist = { ...checklist, [key]: already || pass };
    const nextPoints = already ? points : { ...points, [bucket]: points[bucket] + (xp || 0) };
    setChecklist(nextChecklist); setPoints(nextPoints);
    persist(nextChecklist, nextPoints, respPatch);
    return Promise.resolve();
  };

  /* ---------- ACTIVIDAD ABIERTA ---------- */
  if (act) {
    const def = ALL_ACTS.find((a) => a.key === act);
    const resp = respRef.current || {};
    const exit = () => setAct(null);
    const save = (r) => complete(act, def.bucket, r.xp, { [act]: { ...r, at: nowISO() } }, r.passed !== false);
    const note = (spec) => <AdvisorNote spec={spec} coins={def.coins} existing={resp[act]} onSave={save} onExit={exit} />;
    const readQuiz = (props, questions, title, emoji) => (
      <ReadThen {...props} onExit={exit} finishLabel="I read it — check my understanding">
        <QuizRunner title={title} emoji={emoji} questions={questions} pickCount={5} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
      </ReadThen>
    );
    let view = null;

    switch (act) {
      case "c11_video": view = <VideoQuiz src={VIDEO_BANK} title="Video check: What is a bank?" questions={Q_C11V} pickCount={8} onSave={save} onExit={exit} />; break;
      case "c11_story": view = <StoryDecisions icon={<PiggyBank size={22} />} title="From Piggy Bank to Bank 🐷" subtitle="Help Sofía decide. Every choice has a consequence." scenes={PIGGY_SCENES} coins={20} onSave={save} onExit={exit} />; break;
      case "c11_read": view = (
        <ReadThen tag="THE JUNIOR ADVISOR TIMES · A2+" title="Where Does Your Money Sleep?" subtitle="By Laura Gómez · Money & Banking News" minutes={7} sections={READ_C11} glossary={GLOSS_C11} onExit={exit} finishLabel="I read it — play Who's Who?">
          <SortActivity icon={<Landmark size={22} />} title="Who's Who? 🏦🤝📱🏛️" subtitle="Read each case. Which institution is it?" buckets={INST} items={INST_ITEMS} per={2} bonus={6} doneTitle="Institution expert! 🏛️" onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "c11_clients": view = <MeetClients studentName={name} existing={resp.c11_clients} onSave={save} onExit={exit} />; break;

      case "c12_read": view = readQuiz({ tag: "MONEY SMART · A2+", title: "Choosing the Right Account", subtitle: "Three people, three different needs", minutes: 8, sections: READ_C12, glossary: GLOSS_C12 }, Q_C12, "Account check", "🐷"); break;
      case "c12_match": view = <AccountMatchmaker onSave={save} onExit={exit} />; break;
      case "c12_fee": view = <FeeDetective onSave={save} onExit={exit} />; break;
      case "c12_build": view = <BuildAccount onSave={save} onExit={exit} />; break;
      case "c12_note": view = note(NOTE_C12); break;

      case "c13_video": view = <VideoQuiz src={VIDEO_INTEREST} title="Video check: interest" questions={Q_C13V} pickCount={8} onSave={save} onExit={exit} />; break;
      case "c13_read": view = (
        <ReadThen tag="THE SAVINGS CHALLENGE · A2+" title="Can Your Money Grow?" subtitle="Sofía discovers interest" minutes={7} sections={READ_C13} glossary={GLOSS_C13} onExit={exit} finishLabel="I read it — start the Interest Machine">
          <InterestMachine onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "c13_race": view = <SavingsRace onSave={save} onExit={exit} />; break;
      case "c13_goal": view = <GoalBuilder onSave={save} onExit={exit} />; break;
      case "c13_note": view = note(NOTE_C13); break;

      case "c14_warm": view = <NumberRounds icon={<Smartphone size={22} />} title="Warm-up: Tap, QR or PIN? 📲" subtitle="Basic knowledge from 6th grade." rounds={WARM_C14} coinsPer={3} bonus={4} doneTitle="Payment basics! 📲" onSave={save} onExit={exit} />; break;
      case "c14_read": view = readQuiz({ tag: "MONEY IN MOTION · A2+", title: "Whose Money Is It?", subtitle: "The story of two cards", minutes: 6, sections: READ_C14, glossary: GLOSS_C14 }, Q_C14, "Card check", "💳"); break;
      case "c14_lightning": view = <LightningCards onSave={save} onExit={exit} />; break;
      case "c14_follow": view = <FollowMoney onSave={save} onExit={exit} />; break;

      case "c15_read": view = readQuiz({ tag: "THE MONEY INVESTIGATORS · A2+", title: "The Real Price of a Loan", subtitle: "Can a small payment hide a big cost?", minutes: 8, sections: READ_C15, glossary: GLOSS_C15 }, Q_C15, "Loan check", "📝"); break;
      case "c15_lab": view = <LoanLab onSave={save} onExit={exit} />; break;
      case "c15_trap": view = <InstallmentTrap onSave={save} onExit={exit} />; break;
      case "c15_escape": view = <QuestMap icon={<Lock size={22} />} title="Debt Escape Room 🚪" subtitle="Open 4 doors to escape the debt trap." rooms={DEBT_ROOMS} studentName={name} coins={30} existing={resp.c15_escape} diploma={{ e: "🚪", small: "Debt Escape Room", title: "Responsible Borrower" }} onSave={save} onExit={exit} />; break;
      case "c15_note": view = note(NOTE_C15); break;

      case "c16_read": view = readQuiz({ tag: "DIGITAL MONEY DAILY · A2+", title: "A Day Without Cash", subtitle: "Can a phone help you manage money?", minutes: 7, sections: READ_C16, glossary: GLOSS_C16 }, Q_C16, "Digital check", "📱"); break;
      case "c16_app": view = <BankApp onSave={save} onExit={exit} />; break;
      case "c16_wallet": view = <SortActivity icon={<Wallet size={22} />} title="Wallet or Bank? 👛🏦" subtitle="Some features belong to both!" buckets={WALLET_BUCKETS} items={WALLET_ITEMS} per={2} bonus={4} doneTitle="Digital expert! 👛" onSave={save} onExit={exit} />; break;
      case "c16_note": view = note(NOTE_C16); break;

      case "c17_video": view = <VideoQuiz src={VIDEO_FRAUD} title="Video check: account takeover fraud" questions={Q_C17V} pickCount={8} onSave={save} onExit={exit} />; break;
      case "c17_read": view = readQuiz({ tag: "CYBER BANK NEWS · A2+", title: "Three Messages, One Dangerous Mistake", subtitle: "Special report: protect your money online", minutes: 7, sections: READ_C17, glossary: GLOSS_C17 }, Q_C17, "Cyber check", "🛡️"); break;
      case "c17_escape": view = <QuestMap icon={<ShieldCheck size={22} />} title="Cyber Bank Escape Room 🔐" subtitle="5 rooms. Find the clues and protect the account." rooms={CYBER_ROOMS} studentName={name} coins={40} existing={resp.c17_escape} diploma={{ e: "🛡️", small: "Cyber Bank Escape Room", title: "Cyber Safety Champion" }} onSave={save} onExit={exit} />; break;
      case "c17_guide": view = note(NOTE_C17); break;

      case "c18_read": view = readQuiz({ tag: "BUSINESS STORIES · A2+", title: "The Bank of the Poor", subtitle: "How small loans can create opportunities", minutes: 8, sections: READ_C18, glossary: GLOSS_C18 }, Q_C18, "Microcredit check", "🌱"); break;
      case "c18_officer": view = <LoanOfficer onSave={save} onExit={exit} />; break;
      case "c18_budget": view = <BusinessBudget onSave={save} onExit={exit} />; break;
      case "c18_path": view = note(NOTE_C18); break;

      case "c19_read": view = readQuiz({ tag: "WORLD MONEY REPORT · A2+", title: "Banking Around the World", subtitle: "Who can access financial services?", minutes: 8, sections: READ_C19, glossary: GLOSS_C19 }, Q_C19, "World check", "🌍"); break;
      case "c19_tour": view = <WorldBankTour onSave={save} onExit={exit} />; break;
      case "c19_rights": view = <MyRights onSave={save} onExit={exit} />; break;
      case "c19_access": view = <AccessPlan existing={resp.c19_access} onSave={save} onExit={exit} />; break;

      case "c20_portfolio": view = <AdvisoryPortfolio resp={resp} studentName={name} existing={resp.c20_portfolio} onSave={save} onExit={exit} />; break;
      case "c20_pitch": view = <PitchPractice onSave={save} onExit={exit} />; break;
      case "c20_fair": view = <AdvisorFair mode="present" onSave={save} onExit={exit} />; break;
      case "c21_fair": view = <AdvisorFair mode="visit" onSave={save} onExit={exit} />; break;
      case "c21_boss": view = <QuizRunner title="Boss Battle · Period 2" emoji="⚔️" questions={BOSS_7P2} pickCount={12} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />; break;
      case "c21_self": view = <SelfCheck72 existing={resp.c21_self} onSave={save} onExit={exit} />; break;
      default: view = null;
    }
    return <div className="s1 p1 p2 p3 p4 g7 g72">{view}</div>;
  }

  /* ---------- SEMANA ABIERTA ---------- */
  if (week) {
    const w = G7P2_WEEKS.find((x) => x.n === week);
    const wDone = w.acts.filter((a) => checklist[a.key]).length;
    const next = G7P2_WEEKS.find((x) => x.n === w.n + 1);
    return (
      <div className="s1 p1 p2 p3 p4 g7 g72">
        <button className="s1-back" onClick={() => setWeek(null)}><ArrowLeft size={18} strokeWidth={2.4} /> Back to Period 2</button>
        <div className="s1-hero p1-week-hero g7-hero g72-hero">
          <span className="s1-tag">{w.e} GRADE 7 · PERIOD 2 · CLASS {w.g}</span>
          <h1>{w.title}</h1>
          <p>{w.blurb}</p>
          <div className="s1-progress"><div className="bar"><i style={{ width: `${(wDone / w.acts.length) * 100}%` }} /></div><span className="pill">{wDone}/{w.acts.length}</span></div>
        </div>
        {w.n > 11 && <PortfolioPanel resp={respRef.current} compact />}
        <div className="s1-quest">
          {w.acts.map((a) => (
            <div key={a.key} className={`act-card ${checklist[a.key] ? "done" : ""} ${NOTE_ACTS.includes(a.key) ? "g72-note-act" : ""}`}>
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
    <div className="s1 p1 p2 p3 p4 g7 g72">
      <button className="s1-back" onClick={onBack}><ArrowLeft size={18} strokeWidth={2.4} /> Back to overview</button>

      <div className="s1-hero p1-hero g7-hero g72-hero">
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> ADMIN PREVIEW · GRADE {GRADE} · PERIOD 2</span>
        <h1>How Banks Work: Junior Financial Advisors</h1>
        <p>How can banks and responsible financial decisions help people achieve their goals?</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pct}%` }} /></div><span className="pill">{pct}%</span></div>
        <div className="p1-hero-chips">
          <span><Coins size={14} /> {coinsTotal} coins</span>
          <span><Check size={14} /> {doneCount}/{TOTAL_ACTS} activities</span>
          <span>💼 Junior Financial Advisor</span>
          <span>🎯 SDG 1 · SDG 8 · SDG 10</span>
        </div>
      </div>

      <PortfolioPanel resp={respRef.current} studentName={name} />
      {checklist.c20_portfolio && <button type="button" className="p3-card-link" onClick={() => setAct("c20_portfolio")}><Award size={18} /> See my Advisory Portfolio <ChevronRight size={16} /></button>}

      <div className="p1-passport">
        <div className="p1-passport-head"><b>💼 Junior Advisor Passport</b><span>Finish a class to get its stamp</span></div>
        <div className="p1-stamps">
          {G7P2_WEEKS.map((w) => (
            <button key={w.n} type="button" className={`p1-stamp ${weekDone(w) ? "done" : ""}`} onClick={() => setWeek(w.n)} title={w.title}>
              <em>{w.e}</em><small>{w.g}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="p1-weeks">
        {G7P2_WEEKS.map((w) => {
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