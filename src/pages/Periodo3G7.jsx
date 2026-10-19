import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft, BookOpen, Video, Check, X, Coins, Trophy, Sparkles, Clock, ChevronRight, Lightbulb, Play,
  PenLine, Star, Users, Lock, Store, Scale, RefreshCw, Award, Puzzle, Mic, Target, Calculator,
  ShieldCheck, Plus, Minus, Trash2, Search, Swords, Rocket, Download, Printer, ShoppingCart, Globe,
  TrendingUp, TrendingDown, Headphones, Compass, BarChart3, LineChart as LineIcon, Flame, Map as MapIcon,
  Landmark, CreditCard, Smartphone, Briefcase, PiggyBank, Wallet, QrCode, Bell, KeyRound, Mail,
  FileText, Handshake, Zap, Eye, Unlock, AlertTriangle, Fingerprint, Calendar, Gauge, Home, Umbrella,
  Snowflake, Layers, Palette, Database, Shield, Send,
} from "lucide-react";
import "../Styles/semana1.css";   // botones, quiz, reward, monedas (misma gamificación)
import "../Styles/periodo1.css";  // piezas del Periodo 1 (6°)
import "../Styles/periodo2.css";  // piezas del Periodo 2 (6°)
import "../Styles/periodo3.css";  // piezas del Periodo 3 (6°)
import "../Styles/periodo4.css";  // piezas del Periodo 4 (6°)
import "../Styles/septimo1.css";  // 7° · Periodo 1 (gráficas, tarjetas…)
import "../Styles/septimo2.css";  // 7° · Periodo 2 (teléfono, opciones, medidores…)
import "../Styles/septimo3.css";  // estilos nuevos de 7° · Periodo 3
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   GRADO 7 · PERIODO 3 · SMART BANKING: MY PERSONAL FINANCIAL PLAN (A2+)
   Clases 22–32 · 8 bloques. Poco texto: definiciones cortas y mucho HACER.
   Hilo del periodo: el PERSONAL FINANCIAL PLAN (8 páginas). Cada bloque
   llena una página; en la clase 31 el plan completo se arma solo.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "7P3", Grado = "7".
   ===================================================================== */

const PERIOD_KEY = "7P3";
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
   PIEZAS DEL PERIODO 3
   ===================================================================== */
// Cuota fija de un crédito: P · r / (1 − (1 + r)^−n)
const pmt = (P, r, n) => (r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n)));
const pct = (v, d = 0) => `${Number(v).toFixed(d)}%`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- KEY IDEAS: definiciones cortas + chequeo rápido ---------- */
function KeyIdeas({ icon, title, subtitle, cards, checks, coins = 20, onSave, onExit }) {
  const [open, setOpen] = useState({});
  const [stage, setStage] = useState("cards");
  const [st, finish] = useFinish(onSave);
  const all = cards.every((_, i) => open[i]);
  if (st.done) return <Reward title="Key ideas unlocked! 💡" subtitle="Now you are ready to DO." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={icon || <Lightbulb size={22} strokeWidth={2.1} />} title={title} subtitle={subtitle} onExit={onExit}>
      {stage === "cards" ? (
        <>
          <p className="start-tip">Tap every card. Each one is a short definition you will use today.</p>
          <div className="g73-ideas">
            {cards.map((c, i) => (
              <button key={c.t} type="button" className={`g73-idea ${open[i] ? "open" : ""}`} onClick={() => setOpen({ ...open, [i]: true })}>
                <em>{c.e}</em><b>{c.t}</b>
                {open[i] ? <><p>{c.d}</p>{c.ex && <small>💡 {c.ex}</small>}</> : <i>Tap to learn</i>}
              </button>
            ))}
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!all} onClick={() => setStage("check")}>{all ? "Quick check" : `${Object.keys(open).length}/${cards.length} cards`} <ChevronRight size={18} /></button></div>
        </>
      ) : (
        <RoundsRunner rounds={checks} doneLabel="Unlock" onDone={(r) => finish(Math.round(coins * 0.5) + r.firstTry * 2, { firstTry: r.firstTry })} />
      )}
    </ActShell>
  );
}

/* ---------- PERSONAL FINANCIAL PLAN: las 8 páginas ---------- */
const PLAN_PAGES = [
  { n: "01", key: "c22_remix", t: "My budget", e: "💰" },
  { n: "02", key: "c23_smart", t: "My goals", e: "🎯" },
  { n: "03", key: "c24_rules", t: "My credit rules", e: "💳" },
  { n: "04", key: "c25_plan", t: "Family & emergency plan", e: "🏠" },
  { n: "05", key: "c27_fund", t: "How I fund my business", e: "🚀" },
  { n: "06", key: "c28_pitch", t: "Risks + break-even", e: "⚖️" },
  { n: "07", key: "c29_design", t: "My digital tools", e: "📱" },
  { n: "08", key: "c31_plan", t: "My complete plan", e: "🏆" },
];
function PlanPanel({ resp, compact, studentName }) {
  const r = resp || {};
  const done = PLAN_PAGES.filter((p) => r[p.key]).length;
  return (
    <div className={`g73-plan ${compact ? "compact" : ""}`}>
      <div className="g73-plan-head">
        <b>📒 My Personal Financial Plan{studentName && !compact ? ` · ${studentName.split(" ")[0]}` : ""}</b>
        <span>{done}/8 pages</span>
      </div>
      <div className="g73-pages">
        {PLAN_PAGES.map((p) => (
          <div key={p.n} className={`g73-page ${r[p.key] ? "done" : ""}`}>
            <small>{p.n}</small><em>{r[p.key] ? p.e : "📄"}</em><span>{p.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function PageBadge({ n }) {
  const p = PLAN_PAGES.find((x) => x.n === n);
  return <div className="g73-pagebadge"><span>📒 PLAN PAGE {p.n}</span><b>{p.e} {p.t}</b></div>;
}

/* ---------- MI NEGOCIO (Startup Studio) ---------- */
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
   MINI LESSONS (lectura corta y estructurada) + QUIZ 8 de 12
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

/* ---------- LESSON 22 · How to save money ---------- */
const READ_L22 = [
  { sub: "Meet Mateo" },
  { p: "Mateo is 13. Every month he receives $200,000: $120,000 allowance, $60,000 from selling bracelets and about $20,000 in gifts. At the end of every month he has… $0. Where does the money go? He needs a budget and a saving method." },
  { h: "1 · Income, needs and wants" },
  { p: "Income is all the money that comes in. A need is something you must pay to live and study (transport, school lunch, materials). A want is nice, but not necessary (games, cinema, new sneakers). When money is short, needs go first." },
  { box: "Needs first. Wants second. Savings ALWAYS — not “if there is something left”." },
  { h: "2 · Method A: the 50 / 30 / 20 rule" },
  { p: "You divide your income into three parts: 50% for needs, 30% for wants and 20% for savings. It is a balanced method for most months." },
  { node: <MiniTable head={["Mateo · $200,000", "%", "Amount"]} rows={[["🏠 Needs", "50%", "$100,000"], ["🎉 Wants", "30%", "$60,000"], ["🐷 Savings", "20%", "$40,000"]]} /> },
  { h: "3 · Method B: the 70 / 20 / 10 rule" },
  { p: "When needs are expensive (high rent, long transport), 50% is not enough. Then you use 70% for needs, 20% for wants and 10% for savings. You still save — just a little less." },
  { node: <MiniTable head={["Mateo · $200,000", "%", "Amount"]} rows={[["🏠 Needs", "70%", "$140,000"], ["🎉 Wants", "20%", "$40,000"], ["🐷 Savings", "10%", "$20,000"]]} /> },
  { h: "4 · Method C: pay yourself first" },
  { p: "The SAME day you receive money, you move a fixed part to savings (for example 30%). Then you live with the rest. It works because you can't spend money you don't see. It is the best method for people who always end the month with $0." },
  { node: <MiniCase e="🐷" who="Pay yourself first · 30%" lines={["Day 1: Mateo receives $200,000", "Same day: $60,000 → savings account", "He lives the month with $140,000"]} /> },
  { h: "5 · The emergency fund" },
  { p: "An emergency fund is money saved ONLY for real surprises: a medical visit, a broken phone you need for school, a lost bus card. A good goal is 3 months of your needs. Concert tickets or a sale at the mall are NOT emergencies." },
  { node: <MiniCase e="🛟" who="Mateo's emergency fund goal" lines={["Needs: $100,000 per month", "Goal: $100,000 × 3 = $300,000"]} /> },
  { h: "6 · Small leaks sink big ships" },
  { p: "Small daily expenses look harmless, but they add up. A $4,000 snack every school day (22 days) = $88,000 a month — almost half of Mateo's income!" },
  { node: <Mistakes items={["Saving only what is left at the end of the month (usually $0).", "Using the emergency fund for wants.", "Not writing down small expenses.", "Choosing a method and never checking it again."]} /> },
];
const GLOSS_L22 = { "income": "Ingreso.", "budget": "Presupuesto.", "need": "Necesidad.", "want": "Gusto / deseo.", "emergency fund": "Fondo de emergencia.", "pay yourself first": "Págate primero (ahorra primero)." };
const Q_L22 = [
  { q: "Mateo receives $200,000. With 50/30/20, how much goes to wants?", options: ["$60,000", "$40,000", "$100,000"], correct: 0, feedback: "30% of $200,000 = $60,000." },
  { q: "With the 70/20/10 rule, Mateo saves…", options: ["$20,000", "$40,000", "$14,000"], correct: 0, feedback: "10% of $200,000." },
  { q: "When is 70/20/10 better than 50/30/20?", options: ["When needs are very expensive", "When you want more video games", "When you have no needs at all"], correct: 0, feedback: "Expensive needs → 70% for needs." },
  { q: "“Pay yourself first” works because…", options: ["you can't spend money you don't see", "the bank pays you a big prize for it", "you spend first and then save the rest"], correct: 0, feedback: "Savings leave on day 1." },
  { q: "Who needs “pay yourself first” the most?", options: ["Someone who always ends the month with $0", "Someone who never spends any of their money", "Someone who has no income at all this year"], correct: 0, feedback: "Saving first fixes the $0 problem." },
  { q: "Which one is a NEED for a student?", options: ["The bus pass to go to school", "A new skin in a video game", "Cinema tickets with friends"], correct: 0, feedback: "Transport to study is a need." },
  { q: "Which one is an emergency?", options: ["A medical visit you didn't expect", "Sneakers that are 30% off today", "A concert that sells out soon"], correct: 0, feedback: "Health is a real surprise; sales are wants." },
  { q: "Your needs cost $150,000 a month. A 3-month emergency fund is…", options: ["$450,000", "$150,000", "$300,000"], correct: 0, feedback: "$150,000 × 3." },
  { q: "A $5,000 snack every school day (20 days) costs per month…", options: ["$100,000", "$25,000", "$50,000"], correct: 0, feedback: "$5,000 × 20." },
  { q: "What is the most common saving mistake?", options: ["Saving only what is left at the end", "Saving the same day money arrives", "Writing down every small expense"], correct: 0, feedback: "Usually nothing is left!" },
  { q: "Income $300,000 with pay-yourself-first at 30%. You live with…", options: ["$210,000", "$90,000", "$270,000"], correct: 0, feedback: "$300,000 − $90,000." },
  { q: "Needs first, wants second, savings…", options: ["always", "only if there is money left", "never, it's for adults"], correct: 0, feedback: "Savings always!" },
];

const MethodCard = ({ e, who, lines }) => <MiniCase e={e} who={who} lines={lines} />;
const METHOD_ROUNDS = [
  { tag: "CASE 1 · 50/30/20", q: "Valentina earns $300,000 a month. With the 50/30/20 rule, how much can she spend on WANTS?", visual: <MethodCard e="👩" who="Valentina, 15" lines={["Income: $300,000 a month", "Method: 50 / 30 / 20"]} />, answer: 90000, money: true, hint: "Wants = 30% → 300,000 × 0.30", explain: "$90,000 for wants." },
  { tag: "CASE 2 · 70/20/10", q: "Same income, but her transport is very expensive, so she uses 70/20/10. How much does she SAVE?", visual: <MethodCard e="🚌" who="Valentina, 15" lines={["Income: $300,000", "Method: 70 / 20 / 10"]} />, answer: 30000, money: true, hint: "Savings = 10%", explain: "$30,000. Less than with 50/30/20, but she still saves." },
  { tag: "CASE 3 · PAY YOURSELF FIRST", q: "Tomás receives $240,000 and saves 25% the same day. How much does he save?", visual: <MethodCard e="👦" who="Tomás, 14" lines={["Income: $240,000", "Day 1: saves 25%"]} />, answer: 60000, money: true, hint: "240,000 × 0.25", explain: "$60,000 saved before spending anything." },
  { tag: "CASE 4 · CHOOSE THE METHOD", q: "Juan's needs cost $210,000 of his $300,000. Which method fits him?", visual: <MethodCard e="🧑" who="Juan, 16" lines={["Income: $300,000", "Needs: $210,000 (70%)"]} />, options: ["70 / 20 / 10", "50 / 30 / 20", "Spend first, save what is left"], correct: 0, explain: "His needs are 70% of his income." },
  { tag: "CASE 5 · CHOOSE THE METHOD", q: "Sara always says: “I'll save what is left.” But at the end of every month she has $0. What should she do?", visual: <MethodCard e="👧" who="Sara, 13" lines={["Income: $150,000", "Savings every month: $0 😩"]} />, options: ["Pay herself first", "Keep saving what is left", "Ask for a credit card"], correct: 0, explain: "Savings must leave on day 1." },
  { tag: "CASE 6 · SMALL LEAKS", q: "Leo buys a $4,000 drink every school day (22 days). How much is that per month?", visual: <MethodCard e="🥤" who="Leo's small leak" lines={["$4,000 per day", "22 school days"]} />, answer: 88000, money: true, hint: "4,000 × 22", explain: "$88,000 a month — that's a lot of money!" },
  { tag: "CASE 7 · EMERGENCY FUND", q: "Ana's needs cost $180,000 a month. What is her 3-month emergency fund goal?", visual: <MethodCard e="🛟" who="Ana, 15" lines={["Needs: $180,000 per month", "Goal: 3 months"]} />, answer: 540000, money: true, hint: "180,000 × 3", explain: "$540,000." },
  { tag: "CASE 8 · EMERGENCY FUND", q: "Leo used his emergency fund to buy concert tickets. Then his phone broke. What was the problem?", visual: <MethodCard e="🎟️" who="Leo's decision" lines={["Emergency fund: $300,000 → $0", "Phone repair: $180,000 😱"]} />, options: ["He used the fund for a want", "He saved too much money", "He chose the wrong phone"], correct: 0, explain: "The fund is ONLY for real emergencies." },
];

/* ---------- LESSON 23 · SMART goals + compound interest ---------- */
const READ_L23 = [
  { sub: "Why most goals fail" },
  { p: "“I want to save money” is a wish, not a goal. It has no amount, no date and no plan. A SMART goal is clear enough to act on." },
  { node: <MiniTable head={["Letter", "Question", "Example"]} rows={[["S · Specific", "What exactly?", "A used mountain bike"], ["M · Measurable", "How much?", "$450,000"], ["A · Achievable", "Can I do it with my income?", "$50,000 a month — yes"], ["R · Relevant", "Why does it matter to me?", "To ride to school"], ["T · Time-bound", "When?", "In 9 months"]]} /> },
  { node: <MiniCase e="🔧" who="From wish to SMART goal" lines={["❌ “I want a bike.”", "✅ “I will save $450,000 for a used mountain bike in 9 months, saving $50,000 a month, so I can ride to school.”"]} /> },
  { h: "The monthly number" },
  { p: "To know if a goal is achievable, divide: amount ÷ months. $450,000 ÷ 9 = $50,000 a month. If your budget can't save that, give more time or choose a smaller amount." },
  { h: "Simple vs. compound interest" },
  { p: "Simple interest is calculated only on the original money. Compound interest is calculated on the original money AND on the interest you already earned. Your money grows like a snowball." },
  { node: <MiniTable head={["$100,000 at 10%", "Simple", "Compound"]} rows={[["Year 1", "$110,000", "$110,000"], ["Year 2", "$120,000", "$121,000"], ["Year 3", "$130,000", "$133,100"], ["Year 10", "$200,000", "$259,374"]]} /> },
  { box: "Compound interest = interest on interest. The longer you wait, the bigger the snowball." },
  { h: "The Rule of 72" },
  { p: "A quick trick: 72 ÷ interest rate = years to DOUBLE your money (approximately). At 6% → 72 ÷ 6 = 12 years. At 8% → 9 years." },
  { h: "Time is your superpower" },
  { p: "Starting early matters more than saving a lot later. A person who saves from 12 to 25 can end with more money than a person who saves from 25 to 60 — because the money has more time to grow." },
  { node: <Mistakes items={["Goals without a number or a date.", "Goals that don't fit your budget.", "Thinking “I'm too young to save.”", "Choosing only the highest rate and ignoring fees."]} /> },
];
const GLOSS_L23 = { "goal": "Meta.", "achievable": "Alcanzable.", "deadline": "Fecha límite.", "compound interest": "Interés compuesto.", "simple interest": "Interés simple.", "Rule of 72": "Regla del 72." };
const Q_L23 = [
  { q: "Which goal is SMART?", options: ["Save $120,000 for a helmet in 4 months", "Save more money soon, maybe this year", "Be rich someday with a lot of money"], correct: 0, feedback: "What + how much + when." },
  { q: "“Save $50,000 for a gift.” Which letter is missing?", options: ["T — Time-bound", "M — Measurable", "S — Specific"], correct: 0, feedback: "No deadline." },
  { q: "$450,000 in 9 months. How much per month?", options: ["$50,000", "$45,000", "$90,000"], correct: 0, feedback: "450,000 ÷ 9." },
  { q: "Your budget saves $30,000 a month, but your goal needs $60,000 a month. You…", options: ["give more time or lower the amount", "keep the goal and hope for the best", "use a credit card to finish faster"], correct: 0, feedback: "Make it achievable." },
  { q: "Compound interest means…", options: ["interest that also earns interest", "interest that is always the same", "interest you pay only once"], correct: 0, feedback: "The snowball." },
  { q: "$100,000 at 10% COMPOUND for 2 years =", options: ["$121,000", "$120,000", "$110,000"], correct: 0, feedback: "110,000 + 11,000." },
  { q: "$100,000 at 10% SIMPLE for 2 years =", options: ["$120,000", "$121,000", "$200,000"], correct: 0, feedback: "10,000 each year." },
  { q: "Rule of 72: at 6% a year, money doubles in about…", options: ["12 years", "6 years", "72 years"], correct: 0, feedback: "72 ÷ 6 = 12." },
  { q: "Rule of 72: at 9% a year, money doubles in about…", options: ["8 years", "9 years", "18 years"], correct: 0, feedback: "72 ÷ 9 = 8." },
  { q: "Why can someone who saves from 12 to 25 win?", options: ["The money has more time to grow", "Young people get higher rates", "Banks give gifts to kids"], correct: 0, feedback: "Time!" },
  { q: "“R · Relevant” asks…", options: ["why the goal matters to me", "how much money I need for it", "when I will finish the goal"], correct: 0, feedback: "Relevant = the reason." },
  { q: "The best moment to start saving is…", options: ["as early as possible", "when you are 40", "when you have a lot of money"], correct: 0, feedback: "Start early." },
];
const GrowthCard = ({ rows }) => <MiniTable head={["Year", "Money at the end"]} rows={rows} />;
const COMPOUND_ROUNDS = [
  { tag: "STEP 1", q: "You save $100,000 at 10% compound interest. How much do you have after YEAR 1?", visual: <GrowthCard rows={[["Year 0", "$100,000"], ["Year 1", "?"]]} />, answer: 110000, money: true, hint: "100,000 + 10% of 100,000", explain: "$110,000." },
  { tag: "STEP 2", q: "Now the 10% is calculated on $110,000. How much after YEAR 2?", visual: <GrowthCard rows={[["Year 0", "$100,000"], ["Year 1", "$110,000"], ["Year 2", "?"]]} />, answer: 121000, money: true, hint: "110,000 + 11,000", explain: "$121,000 — $1,000 more than simple interest!" },
  { tag: "STEP 3", q: "And after YEAR 3?", visual: <GrowthCard rows={[["Year 1", "$110,000"], ["Year 2", "$121,000"], ["Year 3", "?"]]} />, answer: 133100, money: true, hint: "121,000 + 12,100", explain: "$133,100." },
  { tag: "COMPARE", q: "With SIMPLE interest (10% only on the $100,000), how much after 3 years?", visual: <GrowthCard rows={[["Year 1", "$110,000"], ["Year 2", "$120,000"], ["Year 3", "?"]]} />, answer: 130000, money: true, hint: "100,000 + 3 × 10,000", explain: "$130,000. Compound gave $3,100 more." },
  { tag: "RULE OF 72", q: "At 6% a year, in about how many YEARS does money double?", answer: 12, unit: "years", hint: "72 ÷ 6", explain: "About 12 years." },
  { tag: "RULE OF 72", q: "At 8% a year, in about how many YEARS does money double?", answer: 9, unit: "years", hint: "72 ÷ 8", explain: "About 9 years." },
  { tag: "MONTHLY NUMBER", q: "Goal: $360,000 in 8 months. How much must you save per month?", answer: 45000, money: true, hint: "360,000 ÷ 8", explain: "$45,000 a month." },
  { tag: "THINK", q: "Ana saves $50,000 a month from 12 to 20. Leo saves the same from 30 to 38. At 60, who probably has more?", options: ["Ana — her money grows for more years", "Leo — he is older and earns more", "Both have exactly the same"], correct: 0, explain: "Same money in, but Ana's grows 10 years longer." },
];

/* ---------- LESSON 24 · How a credit card really works ---------- */
const CC_EX = [1, 6, 12, 36].map((n) => { const p = n === 1 ? 600000 : Math.round(pmt(600000, 0.02, n)); return [n === 1 ? "1 (pay all)" : String(n), cop(p), cop(n === 1 ? 600000 : p * n), cop(n === 1 ? 0 : p * n - 600000)]; });
const READ_L24 = [
  { sub: "A credit card is a loan in your pocket" },
  { p: "When you pay with a credit card, the money is NOT yours. The bank (the card issuer) pays the store, and you must pay the bank later. The credit limit (cupo) is the maximum you can borrow." },
  { h: "The monthly cycle" },
  { node: <div className="g73-cycle">{[["🛍️", "You buy", "Day 3"], ["✂️", "Cut-off date", "Day 15"], ["📄", "Statement arrives", "Day 16"], ["📅", "Payment due date", "Day 30"]].map(([e, t, d], k) => <div key={t}><em>{e}</em><b>{t}</b><small>{d}</small>{k < 3 && <i>→</i>}</div>)}</div> },
  { p: "The cut-off date (fecha de corte) is the day the bank adds up all your purchases. Then you receive the statement (extracto) and you have about 15 days to pay. TIP: a purchase made the day AFTER the cut-off goes to next month's statement, so you get more days to pay." },
  { h: "Installments (cuotas) cost money" },
  { p: "You can divide a purchase into installments. More installments = smaller monthly payment, but MORE interest. Example: $600,000 headphones at 2% a month:" },
  { node: <MiniTable head={["Installments", "Per month", "Total paid", "Interest"]} rows={CC_EX} /> },
  { box: "In 36 installments you pay almost $250,000 extra for the same headphones!" },
  { h: "The minimum payment trap" },
  { p: "The statement shows a minimum payment: the smallest amount you can pay without being late. It looks easy, but if you only pay the minimum, the debt stays for years and the interest grows. Paying the FULL statement on time is the cheapest way." },
  { h: "Interest, fees and your credit history" },
  { p: "Interest can be monthly (2%) or yearly (E.A., about 27% for 2% a month). Many cards also have a monthly fee (cuota de manejo). If you pay late, the bank charges more and reports it to credit bureaus like Datacrédito. A bad history makes future loans harder and more expensive. In Colombia you can check your own report for free." },
  { node: <Mistakes items={["Thinking the credit limit is extra money.", "Using 36 installments for small things.", "Paying only the minimum.", "Paying late “just one day”.", "Using more than 30% of the limit all the time."]} /> },
];
const GLOSS_L24 = { "credit limit": "Cupo.", "card issuer": "Emisor (banco).", "cut-off date": "Fecha de corte.", "statement": "Extracto.", "installments": "Cuotas.", "minimum payment": "Pago mínimo.", "credit bureaus": "Centrales de riesgo." };
const Q_L24 = [
  { q: "When you pay with a credit card, the money comes from…", options: ["the bank — you must pay it back", "your own savings account, always", "the store, as a gift for you"], correct: 0, feedback: "It's a loan." },
  { q: "The cut-off date is…", options: ["the day the bank adds up your purchases", "the last day to pay your monthly bill", "the day you receive your new card"], correct: 0, feedback: "Fecha de corte." },
  { q: "Cut-off on the 15th, 15 days to pay. The due date is the…", options: ["30th", "15th", "1st"], correct: 0, feedback: "15 + 15." },
  { q: "To get MORE days to pay, buy…", options: ["the day after the cut-off", "the day before the cut-off", "on the payment due date"], correct: 0, feedback: "It goes to next month's statement." },
  { q: "More installments for the same purchase means…", options: ["more interest in total", "less interest in total", "no change in interest"], correct: 0, feedback: "More months borrowing." },
  { q: "$600,000 in 1 installment, paid in full on time. Interest?", options: ["$0", "$12,000", "$247,000"], correct: 0, feedback: "Paid in full = no interest in this example." },
  { q: "Paying only the minimum…", options: ["keeps the debt for a long time", "is the cheapest option of all", "deletes the interest you owe"], correct: 0, feedback: "The minimum trap." },
  { q: "2% a month is about … a year (E.A.).", options: ["27%", "2%", "12%"], correct: 0, feedback: "Compound: (1.02^12 − 1) ≈ 27%." },
  { q: "A late payment can be reported to…", options: ["Datacrédito (a credit bureau)", "your school principal", "the store where you bought"], correct: 0, feedback: "Credit bureaus." },
  { q: "A healthy credit card usage is…", options: ["under 30% of the limit", "always 100% of the limit", "more than the limit"], correct: 0, feedback: "Keep it low." },
  { q: "The “cuota de manejo” is…", options: ["a monthly fee for the card", "the interest of one purchase", "a discount for paying early"], correct: 0, feedback: "A fee." },
  { q: "The credit limit is…", options: ["the maximum you can borrow", "extra money that is yours", "the minimum you must spend"], correct: 0, feedback: "Borrowed, not yours." },
];
const STATEMENT_NODE = (
  <div className="g73-statement big">
    <header><b>📄 CREAR BANK · Credit card statement</b><span>Card •••• 4471 · Joven Card</span></header>
    <div><span>Cut-off date</span><b>March 15</b></div>
    <div><span>Payment due date</span><b>March 30</b></div>
    <div><span>Credit limit</span><b>$1,000,000</b></div>
    <div><span>🎧 Headphones (installment 3 of 6)</span><b>$107,115</b></div>
    <div><span>📚 School books (1 installment)</span><b>$180,000</b></div>
    <div><span>🍕 Pizza (1 installment)</span><b>$60,000</b></div>
    <div><span>Card fee</span><b>$12,000</b></div>
    <div><span>Interest rate</span><b>2.0% monthly · 26.8% E.A.</b></div>
    <div className="tot"><span>TOTAL to pay this month</span><b>$359,115</b></div>
    <div><span>Minimum payment</span><b>$145,000</b></div>
    <div><span>Total debt (including future installments)</span><b>about $680,000</b></div>
  </div>
);
const STATEMENT_ROUNDS = [
  { tag: "READ THE STATEMENT", q: "What is the LAST day to pay without being late?", visual: STATEMENT_NODE, options: ["March 30", "March 15", "April 15"], correct: 0, explain: "The payment due date." },
  { tag: "READ THE STATEMENT", q: "Which purchase was divided into installments?", visual: STATEMENT_NODE, options: ["The headphones", "The school books", "The pizza"], correct: 0, explain: "Installment 3 of 6." },
  { tag: "READ THE STATEMENT", q: "How many headphone installments are still left AFTER this one?", visual: STATEMENT_NODE, answer: 3, unit: "installments", hint: "3 of 6 → 6 − 3", explain: "3 more installments." },
  { tag: "READ THE STATEMENT", q: "How much must Sofía pay this month to pay her statement in FULL?", visual: STATEMENT_NODE, answer: 359115, money: true, hint: "Look at “TOTAL to pay this month”.", explain: "$359,115 — then she pays no interest on the 1-installment purchases." },
  { tag: "READ THE STATEMENT", q: "What % of her limit is she using with the total debt?", visual: STATEMENT_NODE, answer: 68, unit: "%", hint: "680,000 ÷ 1,000,000 × 100", explain: "68% — too high! Healthy is under 30%." },
  { tag: "READ THE STATEMENT", q: "If Sofía pays only the minimum ($145,000), what happens?", visual: STATEMENT_NODE, options: ["The rest generates interest", "Her debt disappears", "The bank gives her a prize"], correct: 0, explain: "The unpaid part costs interest." },
  { tag: "READ THE STATEMENT", q: "Which cost does she pay even if she buys nothing?", visual: STATEMENT_NODE, options: ["The card fee", "The pizza", "The school books"], correct: 0, explain: "The monthly fee (cuota de manejo)." },
];

/* ---------- LESSON 25 · Planning a family budget ---------- */
const READ_L25 = [
  { sub: "The Gómez family has a meeting" },
  { p: "Every January, the Gómez family sits at the table with their bills. Mom is a nurse, Dad is a driver, and they have two kids. Their income is $3,800,000. This year, prices are higher. They need to update their plan." },
  { h: "1 · Fixed and variable expenses" },
  { p: "Fixed expenses are the same every month: rent, school fees, internet. Variable expenses change: food, electricity, transport. Variable expenses are where families can save — for example, turning off lights or cooking at home." },
  { h: "2 · Update the budget with inflation" },
  { p: "Inflation means prices go up. Each expense can go up a different %. To calculate the new price: old price × (1 + %)." },
  { node: <MiniTable head={["Expense", "Last year", "Inflation", "This year"]} rows={[["🏠 Rent", "$1,100,000", "+5%", "$1,155,000"], ["🛒 Food", "$900,000", "+9%", "$981,000"], ["💡 Utilities", "$260,000", "+10%", "$286,000"]]} foot={["Total", "$2,260,000", "", "$2,422,000"]} /> },
  { p: "These 3 expenses now cost $162,000 more every month. If the income doesn't change, the family must cut something or find more income." },
  { h: "3 · Unexpected expenses and insurance" },
  { p: "Unexpected expenses are surprises: the fridge breaks, a motorbike accident, a medical exam. Insurance helps: you pay a small amount every month (the premium), and if something bad happens, the insurance pays a big part (the coverage). Often you pay a small part yourself (the deductible)." },
  { node: <MiniCase e="☂️" who="Home insurance example" lines={["Premium: $45,000 per month", "The fridge breaks: $900,000", "Insurance pays 70% → $630,000", "The family pays $270,000"]} /> },
  { p: "In Colombia, health insurance (EPS) is for everyone, and SOAT is mandatory for every car or motorbike." },
  { h: "4 · The family emergency fund" },
  { p: "A family should save 3 to 6 months of its needs. If the family needs $3,000,000 a month, the goal is $9,000,000 to $18,000,000. It is built little by little, every month." },
  { node: <Mistakes items={["Using last year's budget with this year's prices.", "Paying daily food with a credit card.", "Not having any insurance for big risks.", "Borrowing from informal lenders in an emergency."]} /> },
];
const GLOSS_L25 = { "fixed expenses": "Gastos fijos.", "variable expenses": "Gastos variables.", "inflation": "Inflación.", "premium": "Prima (lo que pagas por el seguro).", "coverage": "Cobertura.", "deductible": "Deducible.", "unexpected expenses": "Imprevistos." };
const Q_L25 = [
  { q: "Which one is a FIXED expense?", options: ["Monthly rent", "Electricity", "Food at the supermarket"], correct: 0, feedback: "The same every month." },
  { q: "Which one is a VARIABLE expense?", options: ["Electricity", "Monthly rent", "School fee"], correct: 0, feedback: "It changes." },
  { q: "Food cost $800,000. Inflation was 10%. New cost?", options: ["$880,000", "$810,000", "$1,600,000"], correct: 0, feedback: "800,000 × 1.10." },
  { q: "Rent $1,000,000 goes up 5%. New rent?", options: ["$1,050,000", "$1,005,000", "$1,500,000"], correct: 0, feedback: "1,000,000 × 1.05." },
  { q: "The insurance premium is…", options: ["what you pay every month", "what the insurance pays you", "the price of the fridge"], correct: 0, feedback: "Premium = your payment." },
  { q: "The coverage is…", options: ["the part the insurance pays", "the money you pay each month", "a discount at the store"], correct: 0, feedback: "Coverage = what they pay." },
  { q: "The fridge costs $900,000. Insurance pays 70%. The family pays…", options: ["$270,000", "$630,000", "$900,000"], correct: 0, feedback: "30% of 900,000." },
  { q: "In Colombia, which insurance is mandatory for motorbikes?", options: ["SOAT", "Phone insurance", "Travel insurance"], correct: 0, feedback: "SOAT." },
  { q: "A family needs $3,000,000 a month. A 3-month emergency fund is…", options: ["$9,000,000", "$3,000,000", "$6,000,000"], correct: 0, feedback: "× 3." },
  { q: "Prices go up but income doesn't. The best first step is…", options: ["update the budget and cut some wants", "pay the food with a credit card", "borrow from an informal lender fast"], correct: 0, feedback: "Plan first." },
  { q: "Where can families usually save more?", options: ["Variable expenses", "Fixed rent", "Mandatory health insurance"], correct: 0, feedback: "Lights, food, transport…" },
  { q: "An unexpected expense is…", options: ["a cost you didn't plan", "your monthly rent payment", "a gift that you receive"], correct: 0, feedback: "A surprise." },
];
const InflCard = ({ hl }) => (
  <MiniTable head={["Gómez family", "Last year", "Inflation"]} rows={[["🏠 Rent", "$1,100,000", "+5%"], ["🛒 Food", "$900,000", "+9%"], ["💡 Utilities", "$260,000", "+10%"]].map((r) => (hl && r[0].includes(hl) ? r.map((c) => <b key={c}>{c}</b>) : r))} />
);
const INSURE_ROUNDS = [
  { tag: "IS IT WORTH IT?", q: "Phone insurance costs $15,000 a month. How much is it in ONE year?", visual: <MiniCase e="📱" who="Phone insurance" lines={["Premium: $15,000 / month", "Phone price: $900,000", "Covers 80% if stolen"]} />, answer: 180000, money: true, hint: "15,000 × 12", explain: "$180,000 a year." },
  { tag: "IS IT WORTH IT?", q: "The phone is stolen. Insurance pays 80% of $900,000. How much does the insurance pay?", visual: <MiniCase e="📱" who="Phone stolen" lines={["Phone: $900,000", "Coverage: 80%"]} />, answer: 720000, money: true, hint: "900,000 × 0.8", explain: "$720,000 — much more than one year of premiums." },
  { tag: "IS IT WORTH IT?", q: "Insurance for a $50,000 umbrella costs $10,000 a month. Is it worth it?", visual: <MiniCase e="☂️" who="Umbrella insurance" lines={["Umbrella: $50,000", "Premium: $10,000 / month = $120,000 / year"]} />, options: ["No — the premium costs more than the thing", "Yes — always insure everything you have", "Yes — umbrellas are very expensive things"], correct: 0, explain: "Insure BIG risks, not small things." },
  { tag: "MANDATORY OR OPTIONAL?", q: "Dad has a motorbike. Which insurance MUST he have by law?", options: ["SOAT", "Phone insurance", "Travel insurance"], correct: 0, explain: "SOAT is mandatory for every vehicle." },
  { tag: "DEDUCTIBLE", q: "A $1,200,000 repair. The insurance has a $200,000 deductible (you pay it) and pays the rest. How much does the insurance pay?", answer: 1000000, money: true, hint: "1,200,000 − 200,000", explain: "$1,000,000." },
  { tag: "THINK", q: "Which risk is MOST important to insure for a family?", options: ["A big risk they can't pay alone", "A small thing that costs $20,000", "A risk that never happens to anyone"], correct: 0, explain: "Insurance is for big costs that could break the budget." },
];

/* ---------- LESSON 27 · How to fund a business ---------- */
const READ_L27 = [
  { sub: "You have an idea. Now you need money." },
  { p: "Every business needs capital to start: equipment, materials, a permit… and money to survive the first months, when sales are still low (working capital). Capital = start-up costs + working capital." },
  { node: <MiniCase e="🧁" who="Cupcake Lab · capital" lines={["Oven + mixer + tools + permit: $2,800,000", "First month of fixed costs: $900,000", "CAPITAL NEEDED: $3,700,000"]} /> },
  { h: "Where can the money come from?" },
  { node: <MiniTable head={["Source", "✅ Good", "⚠️ Careful"]} rows={[["🐷 Own savings", "No interest, no partners", "You can lose it"], ["👨‍👩‍👧 Family", "Usually 0% interest", "Relationships can suffer"], ["🏦 Bank loan", "Big amounts", "Interest + needs history"], ["🌱 Microcredit", "Small, easy requirements", "Higher interest"], ["🙌 Crowdfunding", "No repayment, fans help", "Fees + rewards + work"], ["🦄 Investor", "No repayment, advice", "You give part of the company"], ["🏛️ Seed capital", "May not be repaid", "Strict requirements, 18+"]]} /> },
  { h: "Debt vs. equity" },
  { p: "Debt means you borrow and repay with interest (bank, microcredit, family). Equity means someone gives you money for a PART of your company (investor). Example: an investor gives $2,000,000 for 20%. You don't repay, but 20% of the profits and decisions are theirs." },
  { box: "Debt = you repay + interest. Equity = you share the company." },
  { h: "Fondo Emprender" },
  { p: "In Colombia, the SENA's Fondo Emprender gives seed capital to approved business plans of eligible people (18+, with specific requirements). If the business meets its goals, the money may not need to be repaid." },
  { h: "How to choose" },
  { list: ["Small amount + you have savings → own savings.", "Steady sales history → bank loan.", "Small income activity, no history → microcredit.", "Many fans who like rewards → crowdfunding.", "Fast growth, big amount, OK to share → investor."] },
  { p: "Many entrepreneurs combine sources (a funding mix). The key question: can the business pay the monthly debt even in a slow month?" },
  { node: <Mistakes items={["Forgetting the working capital.", "Taking too much debt for the first months.", "Giving away most of the company for little money.", "Using personal credit cards for the business."]} /> },
];
const GLOSS_L27 = { "capital": "Capital.", "working capital": "Capital de trabajo.", "debt": "Deuda.", "equity": "Participación en la empresa.", "crowdfunding": "Financiación colectiva.", "seed capital": "Capital semilla.", "funding mix": "Mezcla de financiación." };
const Q_L27 = [
  { q: "Capital = start-up costs + …", options: ["working capital", "your favorite toys", "the price of one unit"], correct: 0, feedback: "Money for the first months." },
  { q: "Equipment $2,000,000 + first month $600,000. Capital?", options: ["$2,600,000", "$2,000,000", "$1,400,000"], correct: 0, feedback: "Add them." },
  { q: "Debt means…", options: ["you repay the money with interest", "you share part of your company", "you never repay anything at all"], correct: 0, feedback: "Borrow + repay." },
  { q: "Equity means…", options: ["someone gets part of your company", "you pay interest every single month", "you receive a gift from the government"], correct: 0, feedback: "Shared ownership." },
  { q: "An investor gives $2,000,000 for 20%. You keep…", options: ["80% of the company", "20% of the company", "100% of the company"], correct: 0, feedback: "100 − 20." },
  { q: "A business with 5 years of steady sales needs a big amount. Best source?", options: ["A bank loan", "A crowdfunding party", "A piggy bank"], correct: 0, feedback: "History → bank." },
  { q: "Students making a film have many fans who love posters. Best source?", options: ["Crowdfunding with rewards", "A big loan from a bank", "An informal daily lender"], correct: 0, feedback: "Fans + rewards." },
  { q: "Fondo Emprender is…", options: ["seed capital from the SENA", "a credit card for teens", "a crowdfunding website"], correct: 0, feedback: "Public seed capital." },
  { q: "Who can usually apply to Fondo Emprender?", options: ["Eligible people 18+ with requirements", "Any 12-year-old with a cool new idea", "Only big international companies"], correct: 0, feedback: "Strict requirements." },
  { q: "The main risk of crowdfunding is…", options: ["fees, rewards and lots of work", "a very high monthly interest", "losing your whole company fast"], correct: 0, feedback: "It's not free money." },
  { q: "The key question before taking debt is…", options: ["Can I pay it in a slow month?", "Which bank has the coolest logo?", "How fast can I spend it?"], correct: 0, feedback: "Capacity to pay." },
  { q: "A common mistake is…", options: ["forgetting the working capital", "making a clear business plan", "comparing several funding sources"], correct: 0, feedback: "The first months are slow!" },
];

/* ---------- LESSON 28 · Risk and break-even ---------- */
const READ_L28 = [
  { sub: "Every business is a bet — a smart bet needs numbers" },
  { h: "1 · Risk and return" },
  { p: "Risk is the possibility of losing money. Return is what you can win. They go together: a bigger possible return usually means a bigger risk. People have different risk profiles: conservative 🐢 (protect first), moderate 🦊 (balance) and bold 🦅 (big opportunities). No profile is bad — but short goals need low risk." },
  { box: "If someone promises a huge return, guaranteed and fast → it's probably a scam." },
  { h: "2 · Investment or expense?" },
  { p: "An investment helps you make money in the future (an oven, a course, a website). An expense is used and gone (this month's electricity, a party)." },
  { h: "3 · The break-even point" },
  { p: "The break-even point is the number of units you must sell so that sales = total costs. Profit = $0. Below it you lose money; above it you win." },
  { node: <MiniCase e="🧁" who="Worked example · Cupcake Lab" lines={["Fixed costs: $900,000 a month (rent, internet, salary)", "Price: $6,000 · Cost per cupcake: $2,500", "Step 1 → Each cupcake leaves: 6,000 − 2,500 = $3,500", "Step 2 → 900,000 ÷ 3,500 = 257.1", "Step 3 → Round UP: 258 cupcakes a month"]} /> },
  { box: "Break-even = Fixed costs ÷ (Price − Cost per unit). Always round UP." },
  { p: "On a graph, the sales line starts at $0. The total-cost line starts at the fixed costs. Where the two lines cross = break-even." },
  { h: "4 · How to LOWER the break-even" },
  { list: ["Raise the price (but customers may buy less).", "Lower the cost per unit (a cheaper supplier).", "Lower the fixed costs (a smaller place)."] },
  { h: "5 · The risk map" },
  { p: "List what can go wrong. For each risk, think: how probable is it? How big is the impact? Then plan how to reduce it (mitigation): insurance, a second supplier, an emergency fund, strong passwords…" },
  { node: <Mistakes items={["Forgetting fixed costs when you calculate profit.", "Rounding the break-even DOWN.", "Believing “guaranteed” huge returns.", "Having no plan B."]} /> },
];
const GLOSS_L28 = { "risk": "Riesgo.", "return": "Rentabilidad / ganancia.", "break-even point": "Punto de equilibrio.", "fixed costs": "Costos fijos.", "cost per unit": "Costo por unidad.", "mitigation": "Mitigación (reducir el riesgo)." };
const Q_L28 = [
  { q: "Risk and return usually…", options: ["go together — more return, more risk", "go in opposite directions always", "have nothing to do with each other"], correct: 0, feedback: "Bigger return = bigger risk." },
  { q: "“Invest $200,000, get $1,000,000 in a week, guaranteed!” This is…", options: ["probably a scam", "a great safe idea", "a normal bank product"], correct: 0, feedback: "Too good to be true." },
  { q: "Which one is an INVESTMENT for a bakery?", options: ["A new oven", "A birthday party", "A taxi to the mall"], correct: 0, feedback: "It produces future money." },
  { q: "At the break-even point, profit is…", options: ["$0", "very big", "always negative"], correct: 0, feedback: "Sales = costs." },
  { q: "Break-even = Fixed costs ÷ …", options: ["(price − cost per unit)", "(price + cost per unit)", "the number of customers"], correct: 0, feedback: "Profit per unit." },
  { q: "Fixed $600,000, price $5,000, cost $2,000. Break-even?", options: ["200 units", "120 units", "300 units"], correct: 0, feedback: "600,000 ÷ 3,000." },
  { q: "Fixed $900,000, price $6,000, cost $2,500. Break-even?", options: ["258 units", "257 units", "150 units"], correct: 0, feedback: "257.1 → round UP." },
  { q: "If you RAISE the price, the break-even…", options: ["goes down", "goes up", "doesn't change"], correct: 0, feedback: "More profit per unit." },
  { q: "If a competitor forces you to LOWER the price, the break-even…", options: ["goes up", "goes down", "disappears"], correct: 0, feedback: "Less profit per unit → sell more." },
  { q: "On the graph, break-even is where…", options: ["the sales and cost lines cross", "the red cost line starts", "the green sales line is highest"], correct: 0, feedback: "The crossing point." },
  { q: "A good mitigation for “the equipment breaks” is…", options: ["insurance + a maintenance fund", "hoping it never happens", "buying a new one with a card"], correct: 0, feedback: "Plan B." },
  { q: "For a goal in 3 months, you should choose…", options: ["low risk", "very high risk", "a crypto your friend loves"], correct: 0, feedback: "Short goals → low risk." },
];

/* ---------- LESSON 29 · Digital money tools and your data ---------- */
const READ_L29 = [
  { sub: "Your phone is a bank — protect it like one" },
  { h: "1 · Paying with QR" },
  { olist: ["Open your OFFICIAL app (not a link).", "Scan the code.", "Check the name of the person or store.", "Check the amount.", "Confirm — and save the receipt."] },
  { h: "2 · Budgeting apps" },
  { p: "A budgeting app records your income and expenses automatically and shows your goals. It helps you see small leaks. But it needs your data — so choose apps carefully." },
  { h: "3 · Personal data and sensitive data" },
  { p: "Personal data is information about you: name, ID number, phone, address, income. Sensitive data is extra private: health, religion, political ideas, biometric data (fingerprint, face). A money app should ask only for what it really needs. This is called data minimization." },
  { node: <MiniTable head={["Data", "Does a money app need it?"]} rows={[["Name + ID number", "✅ Yes, to open an account"], ["Email / phone", "✅ Yes, to log in and send alerts"], ["Income", "🤝 Only to request a loan"], ["Location", "🤝 Only to find ATMs, with permission"], ["Religion", "🚫 Never"], ["Your social media passwords", "🚫 Never"]]} /> },
  { h: "4 · Habeas Data (Ley 1581 de 2012)" },
  { p: "In Colombia, the law protects your personal data. You have the right to KNOW what data a company has, to UPDATE and CORRECT it, and to ask them to stop using it. Companies need your authorization (permission) and must protect your data." },
  { h: "5 · How apps protect money" },
  { list: ["🔐 Encryption: data is coded, so stolen data can't be read.", "🛡️ 2FA: a second step to log in.", "👆 Biometrics: fingerprint or face.", "🔔 Alerts: a message for every movement.", "🔒 Card lock: block the card from the app."] },
  { h: "6 · How a digital bank lends money" },
  { p: "A responsible lender checks: the purpose of the loan, the person's income, their current debts and their credit history. A common rule: all debt payments should be 40% of income or less. Lending to someone who can't pay is bad for the person AND for the bank." },
  { node: <Mistakes items={["Accepting every app permission without reading.", "Paying a QR without checking the name.", "Using the same password in every app.", "Lending money only because the person seems nice."]} /> },
];
const GLOSS_L29 = { "personal data": "Datos personales.", "sensitive data": "Datos sensibles.", "data minimization": "Minimización de datos.", "authorization": "Autorización.", "encryption": "Cifrado.", "credit history": "Historial crediticio." };
const Q_L29 = [
  { q: "Before confirming a QR payment, you check…", options: ["the name and the amount", "the color of the code", "your phone's battery"], correct: 0, feedback: "Name + amount." },
  { q: "To pay with QR, you should open…", options: ["your official app", "a link from a message", "any app the store says"], correct: 0, feedback: "Official app only." },
  { q: "Which one is SENSITIVE data?", options: ["Your religion", "Your email address", "Your home city"], correct: 0, feedback: "Extra private." },
  { q: "Data minimization means…", options: ["asking only for the data you need", "collecting as much data as possible", "deleting the app every day"], correct: 0, feedback: "Only what's needed." },
  { q: "Habeas Data gives you the right to…", options: ["know, update and correct your data", "see other people's personal data", "never share any data at all"], correct: 0, feedback: "Ley 1581 de 2012." },
  { q: "A budget app asks for your contact list. You…", options: ["deny it — it isn't needed", "accept — it's always fine", "accept and add your password"], correct: 0, feedback: "Not needed." },
  { q: "Encryption means…", options: ["data is coded so others can't read it", "data is deleted every single night", "data is shared with every user"], correct: 0, feedback: "Coded data." },
  { q: "Which feature stops a thief who has your password?", options: ["2FA", "Money tips", "A dark theme"], correct: 0, feedback: "A second step." },
  { q: "A common lending rule: total debt payments should be…", options: ["40% of income or less", "100% of income", "more than the income"], correct: 0, feedback: "Capacity to pay." },
  { q: "A responsible lender checks…", options: ["purpose, income, debts and history", "only if the person seems very nice", "only the age of the person"], correct: 0, feedback: "Evidence, not feelings." },
  { q: "When does a money app need your income?", options: ["Only to request a loan", "Always, to log in", "Never, under any situation"], correct: 0, feedback: "Only for that service." },
  { q: "Using the same password in every app is…", options: ["dangerous", "the safest option", "required by law"], correct: 0, feedback: "One leak opens everything." },
];

/* =====================================================================
   BLOQUE 1 · CLASE 22 · SAVING STRATEGIES → PLAN PAGE 01
   ===================================================================== */

const SAMPLE_MONEY = {
  income: [{ name: "Allowance", amount: 120000 }, { name: "Selling bracelets", amount: 60000 }, { name: "Birthday money (average)", amount: 20000 }],
  expenses: [{ name: "Bus pass", amount: 50000, kind: "need" }, { name: "School snacks", amount: 30000, kind: "need" }, { name: "Phone data plan", amount: 20000, kind: "need" }, { name: "Video games", amount: 30000, kind: "want" }, { name: "Cinema and snacks", amount: 25000, kind: "want" }, { name: "Sneakers fund", amount: 25000, kind: "want" }],
};
const getMoney = (resp) => (resp?.c22_money?.income?.length ? resp.c22_money : SAMPLE_MONEY);
const KINDS = [{ id: "need", label: "Need", color: "#0b7a50" }, { id: "want", label: "Want", color: "#e07a2f" }];

function MoneyMap({ existing, onSave, onExit }) {
  const [inc, setInc] = useState(existing?.income || []);
  const [exp, setExp] = useState(existing?.expenses || []);
  const [st, finish] = useFinish(onSave);
  const tIn = total(inc), needs = total(exp.filter((e) => e.kind === "need")), wants = total(exp.filter((e) => e.kind === "want"));
  const left = tIn - needs - wants;
  const ok = inc.length >= 1 && exp.filter((e) => e.kind === "need").length >= 2 && exp.filter((e) => e.kind === "want").length >= 2 && tIn > 0;
  if (st.done) return <Reward title="Money map ready! 🗺️" subtitle="Now you know where your money goes." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<MapIcon size={22} strokeWidth={2.1} />} title="My Money Map 🗺️" subtitle="Write YOUR monthly money: what comes in and what goes out." onExit={onExit}>
      <div className="g72-howto">
        <b>How it works</b>
        <span>1️⃣ Add your income (allowance, gifts, small jobs…). Use real or approximate numbers.</span>
        <span>2️⃣ Add at least 2 needs and 2 wants.</span>
        <span>3️⃣ Look at the map: is there money left to save?</span>
        <span>🙈 Don't want to use your real numbers? <button type="button" className="p1-link g73-inline" onClick={() => { setInc(SAMPLE_MONEY.income); setExp(SAMPLE_MONEY.expenses); }}>Use Mateo's example month</button></span>
      </div>
      <MoneyList title="Money that comes in" icon="💵" tone="in" rows={inc} setRows={setInc} min={1} suggestions={["Allowance", "Gifts", "Selling things", "Helping at home", "Small jobs"]} namePh="Income source" />
      <MoneyList title="Money that goes out" icon="🧾" tone="out" rows={exp} setRows={setExp} min={4} kinds={KINDS} suggestions={["Bus pass", "Snacks", "Phone data", "Games", "Cinema", "Clothes", "Gifts"]} namePh="Expense" />
      {tIn > 0 && (
        <div className="start-block">
          <h3>🗺️ My money map</h3>
          <StackBar parts={[{ label: "Needs", value: needs, color: "#0b7a50" }, { label: "Wants", value: wants, color: "#e07a2f" }, { label: left >= 0 ? "Left to save" : "Missing!", value: Math.abs(left), color: left >= 0 ? "#f5b23e" : "#ff6b57" }]} max={Math.max(tIn, needs + wants)} />
          <div className={`g72-conseq ${left > 0 ? "f2" : left === 0 ? "f1" : "f0"}`}><b>{left > 0 ? `✅ ${cop(left)} left every month` : left === 0 ? "🙂 Nothing left to save" : `⚠️ You spend ${cop(-left)} more than you receive!`}</b><span>{left > 0 ? "In the next activity you'll decide how to organize it with a budget rule." : "You will fix this in the Budget Remix."}</span></div>
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(20, { income: inc, expenses: exp })}>Save my money map <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}

const RULES = [
  { id: "503020", n: "50 / 30 / 20", e: "📊", needs: 50, wants: 30, save: 20, d: "Balanced: needs, wants and savings." },
  { id: "702010", n: "70 / 20 / 10", e: "🧱", needs: 70, wants: 20, save: 10, d: "For months when needs are expensive." },
  { id: "pyf", n: "Pay yourself first (30%)", e: "🐷", needs: 50, wants: 20, save: 30, d: "Save 30% FIRST. Live with the rest." },
];
function BudgetRemix({ resp, existing, onSave, onExit }) {
  const m = getMoney(resp);
  const income = total(m.income);
  const needs = total(m.expenses.filter((e) => e.kind === "need"));
  const wantsList = m.expenses.filter((e) => e.kind === "want");
  const [tab, setTab] = useState(0);
  const [keep, setKeep] = useState({ 0: wantsList.map(() => true), 1: wantsList.map(() => true), 2: wantsList.map(() => true) });
  const [fav, setFav] = useState(existing?.rule || null);
  const [why, setWhy] = useState("");
  const [st, finish] = useFinish(onSave);
  const calc = (k) => {
    const R = RULES[k];
    const needsLim = Math.round((income * R.needs) / 100);
    const extraNeeds = Math.max(0, needs - needsLim);
    const wantsLim = Math.max(0, Math.round((income * R.wants) / 100) - extraNeeds);
    const wantsKept = wantsList.reduce((a, w, i) => a + (keep[k][i] ? w.amount : 0), 0);
    const save = Math.round((income * R.save) / 100);
    return { R, needsLim, extraNeeds, wantsLim, wantsKept, save, ok: wantsKept <= wantsLim && needs <= needsLim + Math.round((income * R.wants) / 100) };
  };
  const C = calc(tab);
  const done = [0, 1, 2].map((k) => calc(k).ok);
  if (st.done) return <Reward title="Budget DJ! 🎧" subtitle="Same money, three remixes — you chose yours." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Layers size={22} strokeWidth={2.1} />} title="Budget Remix 🎧" subtitle={`Same income (${cop(income)}), 3 different rules. Make each budget fit!`} onExit={onExit}>
      <PageBadge n="01" />
      <div className="g72-howto">
        <b>How it works</b>
        <span>1️⃣ Choose a rule (tab). The rule says how much you can use for needs, wants and savings.</span>
        <span>2️⃣ Your needs stay. If the wants don't fit, turn OFF some wants until the bar is green.</span>
        <span>3️⃣ Balance the 3 rules, compare them and choose YOUR favorite.</span>
      </div>
      <div className="g73-tabs">
        {RULES.map((r, k) => <button key={r.id} type="button" className={`${tab === k ? "on" : ""} ${done[k] ? "ok" : ""}`} onClick={() => setTab(k)}><em>{r.e}</em><b>{r.n}</b><small>{done[k] ? "✅ balanced" : r.d}</small></button>)}
      </div>
      <div className="g73-buckets">
        <div className="need"><small>🏠 Needs · {C.R.needs}%</small><b>{cop(C.needsLim)}</b><span>Your needs: {cop(needs)} {needs > C.needsLim ? `(+${cop(C.extraNeeds)} taken from wants)` : "✅"}</span></div>
        <div className="want"><small>🎉 Wants · {C.R.wants}%</small><b>{cop(C.wantsLim)}</b><span>Kept: {cop(C.wantsKept)} {C.wantsKept <= C.wantsLim ? "✅" : "⚠️ too much"}</span></div>
        <div className="save"><small>🐷 Savings · {C.R.save}%</small><b>{cop(C.save)}</b><span>In 6 months: {cop(C.save * 6)}</span></div>
      </div>
      <div className="start-block">
        <h3>🎉 My wants this month — keep or cut?</h3>
        <div className="g73-wants">
          {wantsList.map((w, i) => (
            <button key={i} type="button" className={`g73-want ${keep[tab][i] ? "on" : "off"}`} onClick={() => setKeep({ ...keep, [tab]: keep[tab].map((x, j) => (j === i ? !x : x)) })}>
              <span>{keep[tab][i] ? "✅" : "✂️"}</span><b>{w.name}</b><i>{cop(w.amount)}</i>
            </button>
          ))}
        </div>
        <div className="g72-meter"><span>Wants used</span><div className="bar"><i style={{ width: `${clamp(C.wantsLim ? (C.wantsKept / C.wantsLim) * 100 : 100, 0, 100)}%`, background: C.wantsKept <= C.wantsLim ? "var(--green)" : "var(--coral)" }} /></div><b>{cop(C.wantsKept)} / {cop(C.wantsLim)}</b></div>
      </div>
      {done.every(Boolean) && (
        <>
          <div className="start-block">
            <h3>📊 Compare the 3 remixes</h3>
            <BarChart bars={RULES.map((r, k) => ({ label: r.n.split(" (")[0], value: calc(k).save * 6, color: ["#16b074", "#f5b23e", "#0b7a50"][k] }))} />
            <p className="start-tip p1-center">Savings after 6 months with each rule.</p>
          </div>
          <div className="start-block">
            <h3>⭐ My favorite rule</h3>
            <div className="g72-opts">{RULES.map((r) => <button key={r.id} type="button" className={`g72-opt ${fav === r.id ? "on" : ""}`} onClick={() => setFav(r.id)}><em>{r.e}</em><span>{r.n}</span></button>)}</div>
            <div className="p3-sentence edit"><span>I choose this rule because</span><input className="start-input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Write your reason here…" /></div>
          </div>
        </>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!done.every(Boolean) || !fav || countWords(why) < 5} onClick={() => { const k = RULES.findIndex((r) => r.id === fav); const c = calc(k); finish(30, { rule: fav, ruleName: RULES[k].n, income, needs, wants: c.wantsKept, save: c.save, cut: wantsList.filter((_, i) => !keep[k][i]).map((w) => w.name), why }); }}>Save Plan Page 01 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

const SURPRISES = [
  { e: "📱", t: "Your phone screen breaks.", v: 180000, emergency: true },
  { e: "🚌", t: "You lose your bus card.", v: 25000, emergency: true },
  { e: "🎟️", t: "Concert tickets are on sale today!", v: 150000, emergency: false },
  { e: "🩺", t: "You need a medical appointment.", v: 90000, emergency: true },
  { e: "🎁", t: "Your friend's birthday party is on Saturday.", v: 40000, emergency: false },
  { e: "🔌", t: "Your laptop charger stops working (you need it for school).", v: 70000, emergency: true },
  { e: "👟", t: "Your favorite sneakers are 30% off.", v: 120000, emergency: false },
  { e: "🐶", t: "Your dog needs the vet.", v: 120000, emergency: true },
];
function EmergencyWheel({ resp, onSave, onExit }) {
  const m = getMoney(resp);
  const needs = total(m.expenses.filter((e) => e.kind === "need"));
  const [goal, setGoal] = useState(""); const [goalOk, setGoalOk] = useState(false); const [goalBad, setGoalBad] = useState(false);
  const [fund, setFund] = useState(300000);
  const [wants, setWants] = useState(total(m.expenses.filter((e) => e.kind === "want")));
  const [leoDebt, setLeoDebt] = useState(0);
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [used, setUsed] = useState([]);
  const [cur, setCur] = useState(null);
  const [isEm, setIsEm] = useState(null);
  const [paid, setPaid] = useState(null);
  const [score, setScore] = useState(0);
  const [st, finish] = useFinish(onSave);
  const spin = () => {
    const free = SURPRISES.map((_, i) => i).filter((i) => !used.includes(i));
    const k = free[Math.floor(Math.random() * free.length)];
    setSpinning(true); setCur(null); setIsEm(null); setPaid(null);
    setRot((r) => r + 1440 + (360 - k * 45) - (r % 360));
    setTimeout(() => { setSpinning(false); setCur(k); setUsed((u) => [...u, k]); }, 1600);
  };
  const S = cur !== null ? SURPRISES[cur] : null;
  const pay = (how) => {
    setPaid(how);
    let good = false;
    if (how === "fund") { if (fund >= S.v) setFund(fund - S.v); else { setWants(Math.max(0, wants - (S.v - fund))); setFund(0); } good = S.emergency; }
    if (how === "wants") { setWants(Math.max(0, wants - S.v)); good = true; }
    if (how === "skip") good = !S.emergency;
    if (S.emergency) setLeoDebt((d) => Math.round((d + S.v) * 1.05));
    if (good && isEm === S.emergency) setScore((x) => x + 1);
  };
  const rounds = used.length;
  if (st.done) return <Reward title="Emergency ready! 🛟" subtitle="Your fund protects your plan." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Umbrella size={22} strokeWidth={2.1} />} title="The Surprise Wheel 🎡" subtitle="Life brings surprises. Is it an emergency? How do you pay it?" onExit={onExit}>
      {!goalOk ? (
        <div className="start-block">
          <h3><span className="step-n">1</span> Calculate your emergency fund goal</h3>
          <p className="start-tip">Your monthly needs (from your Money Map): <b>{cop(needs)}</b>. A good goal is <b>3 months</b> of needs.</p>
          <div className="p2-answer-row"><span className="p2-unit">$</span><input className="start-input p2-num" type="number" value={goal} onChange={(e) => { setGoal(e.target.value); setGoalBad(false); }} placeholder="Your goal" /><button className="s1-btn primary" disabled={!goal} onClick={() => (num(goal) === needs * 3 ? setGoalOk(true) : setGoalBad(true))}><Check size={16} /></button></div>
          {goalBad && <div className="p1-hint">💡 {cop(needs)} × 3 = ?</div>}
        </div>
      ) : (
        <>
          <div className="p1-banner good"><span>🛟 Your emergency fund goal: <b>{cop(needs * 3)}</b>. Today you have {cop(300000)} saved. Spin 4 times!</span></div>
          <div className="g73-vs">
            <div><small>🙋 YOU (with a fund)</small><span>🛟 Fund <b>{cop(fund)}</b></span><span>🎉 Wants budget <b>{cop(wants)}</b></span></div>
            <div className="leo"><small>😬 LEO (no fund)</small><span>💳 Debt <b>{cop(leoDebt)}</b></span><span>Every emergency → borrows at 5%</span></div>
          </div>
          <div className="g73-wheelwrap">
            <div className="g73-wheel" style={{ transform: `rotate(${rot}deg)`, transition: spinning ? "transform 1.6s cubic-bezier(.2,.8,.2,1)" : "none" }}>
              {SURPRISES.map((s, i) => <span key={i} style={{ transform: `rotate(${i * 45}deg) translateY(-118px) rotate(-${i * 45}deg)` }} className={used.includes(i) ? "used" : ""}>{s.e}</span>)}
            </div>
            <i className="g73-pointer">▼</i>
            {(cur === null || paid !== null) && rounds < 4 && <button type="button" className="s1-btn primary big g73-spin" disabled={spinning} onClick={spin}><RefreshCw size={16} /> {spinning ? "Spinning…" : `Spin (${rounds}/4)`}</button>}
          </div>
          {S && (
            <div className="start-block">
              <div className="g72-scene-card">{S.e} {S.t} <b>{cop(S.v)}</b></div>
              <h3>Is this an emergency?</h3>
              <div className="p1-starters">{[[true, "🚨 Yes, emergency"], [false, "🙂 No, it's a want"]].map(([v, l]) => <button key={l} type="button" disabled={isEm !== null} className={`p1-chip ${isEm === v ? "on" : ""} ${isEm !== null ? (v === S.emergency ? "ok" : isEm === v ? "no" : "") : ""}`} onClick={() => setIsEm(v)}>{l}</button>)}</div>
              {isEm !== null && paid === null && (
                <>
                  <h3>How do you pay it?</h3>
                  <div className="g72-opts">
                    <button type="button" className="g72-opt" onClick={() => pay("fund")}><em>🛟</em><span>Emergency fund</span></button>
                    <button type="button" className="g72-opt" onClick={() => pay("wants")}><em>🎉</em><span>Use my wants budget</span></button>
                    <button type="button" className="g72-opt" onClick={() => pay("skip")}><em>🙅</em><span>Don't buy it / wait</span></button>
                  </div>
                </>
              )}
              {paid !== null && <div className={`g72-conseq ${(S.emergency && paid !== "skip") || (!S.emergency && paid !== "fund") ? "f2" : "f0"}`}><b>{S.emergency ? (paid === "fund" ? "✅ That's what the fund is for!" : paid === "wants" ? "✅ OK — you protected your fund." : "⚠️ You can't ignore a real emergency.") : (paid === "fund" ? "⚠️ The fund is ONLY for emergencies!" : "✅ Smart: a want can wait or come from wants.")}</b><span>{S.emergency ? `Leo had no fund: he borrowed and now owes ${cop(leoDebt)}.` : "Leo can wait too — this is not an emergency."}</span></div>}
            </div>
          )}
          {rounds === 4 && paid !== null && <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(15 + score * 3, { goal: needs * 3, score, fundLeft: fund, leoDebt })}>Finish <span className="coin-tag"><Coins size={15} /> +27</span></button></div>}
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   BLOQUE 2 · CLASE 23 · SMART GOALS + COMPOUND INTEREST → PAGE 02
   ===================================================================== */

const VAGUE = [
  { g: "I want to save money.", miss: ["S", "M", "T"], opts: ["Save $90,000 for a school trip in 3 months", "Save a lot of money for many things", "Save money when I have some"], c: 0 },
  { g: "I will buy a new phone for $3,000,000 next month.", miss: ["A"], opts: ["Buy a $3,000,000 phone in 30 days with my allowance", "Save $600,000 for a good used phone in 10 months", "Ask everybody for money to buy it next week"], c: 1 },
  { g: "Save $200,000 someday.", miss: ["S", "T"], opts: ["Save $200,000 for a guitar in 8 months", "Save $200,000 someday, maybe next year", "Save for something, someday in the future"], c: 0 },
  { g: "Save $150,000 in 5 months for… something.", miss: ["S", "R"], opts: ["Save $150,000 in 5 months for many things", "Save $150,000 in 5 months for a bike to ride to school", "Save $150,000 in 5 months, just because"], c: 1 },
  { g: "I will save $10,000,000 for a car in 2 months.", miss: ["A"], opts: ["Save $10,000,000 for a car in 2 months, with my allowance", "Save $600,000 in 12 months to start a car fund", "Ask my friends to give me a car next week"], c: 1 },
  { g: "Save $80,000 for a gift for Mom.", miss: ["T"], opts: ["Save $80,000 for Mom's birthday gift by May 10th", "Save $80,000 for Mom's gift someday in the future", "Save some money for a gift for somebody"], c: 0 },
];
function SmartGoals({ resp, existing, onSave, onExit }) {
  const cap = resp?.c22_remix?.save || 40000;
  const [stage, setStage] = useState(0);
  const [i, setI] = useState(0);
  const [miss, setMiss] = useState([]);
  const [chk, setChk] = useState(false);
  const [pick, setPick] = useState(null);
  const [fixScore, setFixScore] = useState(0);
  const blank = { what: "", amount: "", months: 6, why: "" };
  const [goals, setGoals] = useState(existing?.goals || [{ ...blank, months: 6 }, { ...blank, months: 24 }]);
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="SMART goals ready! 🎯" subtitle="Plan Page 02 is in your plan." coins={st.coins} saving={st.saving} onExit={onExit} />;
  const V = VAGUE[i];
  const missOk = chk && miss.length === V.miss.length && V.miss.every((x) => miss.includes(x));
  const monthly = (g) => (num(g.amount) > 0 && g.months > 0 ? Math.ceil(num(g.amount) / g.months / 1000) * 1000 : 0);
  const totalMonthly = goals.reduce((a, g) => a + monthly(g), 0);
  const smart = (g, k) => ({ S: countWords(g.what) >= 3, M: num(g.amount) > 0, A: num(g.amount) > 0 && totalMonthly <= cap, R: countWords(g.why) >= 4, T: k === 0 ? g.months <= 12 : g.months > 12 });
  const allSmart = goals.every((g, k) => Object.values(smart(g, k)).every(Boolean));
  const setG = (k, patch) => setGoals(goals.map((g, j) => (j === k ? { ...g, ...patch } : g)));
  return (
    <ActShell icon={<Target size={22} strokeWidth={2.1} />} title="SMART Goal Studio 🎯" subtitle={stage === 0 ? "Part 1 · Fix 6 vague goals." : "Part 2 · Build YOUR 2 SMART goals."} onExit={onExit}>
      <PageBadge n="02" />
      <div className="g72-steps"><span className={stage === 0 ? "on" : "done"}>{stage ? "✓" : 1} Goal Fixer</span><span className={stage === 1 ? "on" : ""}>2 My goals</span></div>
      {stage === 0 ? (
        <>
          <div className="p1-match-stats"><span>Goal <b>{i + 1}/{VAGUE.length}</b></span><span>Fixed: <b>{fixScore}</b> 🔧</span></div>
          <div className="g72-scene-card">“{V.g}”</div>
          <div className="start-block">
            <h3><span className="step-n">1</span> Which letters are missing? (choose all)</h3>
            <div className="g73-letters">{["S", "M", "A", "R", "T"].map((L) => <button key={L} type="button" className={`${miss.includes(L) ? "on" : ""} ${chk ? (V.miss.includes(L) ? "ok" : miss.includes(L) ? "no" : "") : ""}`} onClick={() => { setChk(false); setMiss(miss.includes(L) ? miss.filter((x) => x !== L) : [...miss, L]); }}>{L}</button>)}</div>
            {!missOk && <div className="start-foot"><button className="s1-btn ghost" disabled={!miss.length} onClick={() => setChk(true)}>Check letters</button></div>}
            {chk && !missOk && <div className="p1-hint">💡 Read the SMART cards again: what? how much? possible? why? when?</div>}
          </div>
          {missOk && (
            <div className="start-block">
              <h3><span className="step-n">2</span> Choose the SMART version</h3>
              <div className="quiz-options">{V.opts.map((o, k) => <button key={k} type="button" disabled={pick !== null} className={`quiz-opt ${pick === null ? "" : k === V.c ? "correct" : pick === k ? "wrong" : ""}`} onClick={() => { setPick(k); if (k === V.c) setFixScore(fixScore + 1); }}><span className="opt-key">{"ABC"[k]}</span><span className="opt-text">{o}</span></button>)}</div>
            </div>
          )}
          {pick !== null && <div className="start-foot"><button className="s1-btn primary big" onClick={() => { if (i === VAGUE.length - 1) setStage(1); else { setI(i + 1); setMiss([]); setChk(false); setPick(null); } }}>{i === VAGUE.length - 1 ? "Now build MY goals" : "Next goal"} <ChevronRight size={18} /></button></div>}
        </>
      ) : (
        <>
          <div className="p1-banner"><span>🐷 From Plan Page 01, you can save <b>{cop(cap)}</b> a month. Both goals together must fit!</span></div>
          {goals.map((g, k) => {
            const s = smart(g, k);
            return (
              <div key={k} className="start-block g73-goal">
                <h3>{k === 0 ? "⚡ Short-term goal (12 months or less)" : "🏔️ Long-term goal (more than 12 months)"}</h3>
                <label className="p3-lbl">🎯 What exactly?<input className="start-input" value={g.what} onChange={(e) => setG(k, { what: e.target.value })} placeholder="Write your goal here…" /></label>
                <label className="p3-lbl">📏 How much money?<input className="start-input" type="number" value={g.amount} onChange={(e) => setG(k, { amount: e.target.value })} placeholder="$" /></label>
                <label className="g72-ctrl"><span>⏰ Months</span><button type="button" onClick={() => setG(k, { months: Math.max(1, g.months - 1) })}><Minus size={14} /></button><input type="range" min={1} max={60} value={g.months} onChange={(e) => setG(k, { months: Number(e.target.value) })} /><button type="button" onClick={() => setG(k, { months: Math.min(60, g.months + 1) })}><Plus size={14} /></button><b>{g.months} mo</b></label>
                <label className="p3-lbl">❤️ Why does it matter to me?<input className="start-input" value={g.why} onChange={(e) => setG(k, { why: e.target.value })} placeholder="Write your reason here…" /></label>
                <div className="g73-smartbar">{Object.entries(s).map(([L, ok]) => <span key={L} className={ok ? "ok" : ""}>{L}</span>)}<b>Save {cop(monthly(g))}/month</b></div>
              </div>
            );
          })}
          <div className={`g72-conseq ${totalMonthly <= cap ? "f2" : "f0"}`}><b>{totalMonthly <= cap ? "✅ Achievable!" : "⚠️ Not achievable yet"}</b><span>Both goals need {cop(totalMonthly)} a month. You can save {cop(cap)}. {totalMonthly > cap ? "Give more time or choose a smaller amount." : ""}</span></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!allSmart} onClick={() => finish(30, { goals: goals.map((g) => ({ ...g, amount: num(g.amount), monthly: monthly(g) })), fixScore, cap })}>Save Plan Page 02 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* Snowball: Ana empieza a los 12, Leo a los 25 */
function fvSeries({ start, stop, monthly, rate, compound }) {
  const rm = Math.pow(1 + rate / 100, 1 / 12) - 1;
  let bal = 0, paid = 0, simpleInt = 0; const pts = [];
  for (let age = 12; age <= 60; age++) {
    for (let mth = 0; mth < 12; mth++) {
      if (age >= start && age < stop) { bal += monthly; paid += monthly; }
      if (compound) bal *= 1 + rm; else simpleInt += paid * (rate / 100 / 12);
    }
    pts.push(Math.round(compound ? bal : paid + simpleInt));
  }
  return { pts, paid };
}
const AGES = Array.from({ length: 49 }, (_, i) => 12 + i);
function Snowball({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [pred, setPred] = useState(null);
  const [shown, setShown] = useState(false);
  const [start, setStart] = useState(18); const [stop, setStop] = useState(60); const [monthly, setMonthly] = useState(50000); const [rate, setRate] = useState(7); const [compound, setCompound] = useState(true);
  const [ch, setCh] = useState({});
  const [st, finish] = useFinish(onSave);
  const ana = fvSeries({ start: 12, stop: 25, monthly: 50000, rate: 7, compound: true });
  const leo = fvSeries({ start: 25, stop: 60, monthly: 50000, rate: 7, compound: true });
  const me = fvSeries({ start, stop: Math.max(stop, start + 1), monthly, rate, compound });
  const final = me.pts[me.pts.length - 1];
  useEffect(() => {
    if (stage !== 1) return;
    const n = { ...ch };
    if (final >= 100000000) n.a = true;
    if (!compound) n.b = true;
    if (start <= 13 && compound) n.c = true;
    if (JSON.stringify(n) !== JSON.stringify(ch)) setCh(n);
  }, [final, compound, start, stage]); // eslint-disable-line react-hooks/exhaustive-deps
  const every5 = (arr) => arr.filter((_, k) => k % 6 === 0 || k === arr.length - 1);
  const ball = (v) => clamp(30 + Math.sqrt(v / 1000000) * 9, 30, 140);
  if (st.done) return <Reward title="Snowball master! ⛄" subtitle="Time + compound interest = magic." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Snowflake size={22} strokeWidth={2.1} />} title="Snowball Simulator ⛄" subtitle={stage === 0 ? "Ana vs. Leo: who has more money at 60?" : "Your turn: control the snowball."} onExit={onExit}>
      {stage === 0 ? (
        <>
          <div className="g73-race2">
            <div><em>👧</em><b>Ana</b><span>Saves $50,000 a month from age <b>12 to 25</b>. Then she STOPS.</span><small>She puts in {cop(ana.paid)}</small></div>
            <div><em>👦</em><b>Leo</b><span>Saves $50,000 a month from age <b>25 to 60</b>.</span><small>He puts in {cop(leo.paid)}</small></div>
          </div>
          <p className="start-tip p1-center">Both earn 7% compound interest per year (a simplified example).</p>
          {!shown && (
            <div className="start-block">
              <h3>🔮 Your prediction: who has more money at 60?</h3>
              <div className="g72-opts">{[["ana", "👧 Ana"], ["leo", "👦 Leo"], ["same", "🤝 The same"]].map(([v, l]) => <button key={v} type="button" className={`g72-opt ${pred === v ? "on" : ""}`} onClick={() => setPred(v)}><span>{l}</span></button>)}</div>
              <div className="start-foot"><button className="s1-btn primary big" disabled={!pred} onClick={() => setShown(true)}><Play size={16} /> Roll the snowballs!</button></div>
            </div>
          )}
          {shown && (
            <>
              <div className="g73-balls">
                <div><span style={{ fontSize: ball(ana.pts[48]) }}>⛄</span><b>Ana: {cop(ana.pts[48])}</b></div>
                <div><span style={{ fontSize: ball(leo.pts[48]) }}>⛄</span><b>Leo: {cop(leo.pts[48])}</b></div>
              </div>
              <LineChart labels={every5(AGES).map(String)} series={[{ name: "Ana", values: every5(ana.pts), color: "#16b074" }, { name: "Leo", values: every5(leo.pts), color: "#f5b23e" }]} />
              <ChartLegend series={[{ name: "Ana (12→25)", color: "#16b074" }, { name: "Leo (25→60)", color: "#f5b23e" }]} />
              <div className={`g72-conseq ${pred === "ana" ? "f2" : "f0"}`}><b>{pred === "ana" ? "✅ You predicted it!" : "😮 Surprise!"}</b><span>Ana put in only {cop(ana.paid)} — Leo put in {cop(leo.paid)}. But Ana's money had MORE TIME to grow. That is the snowball effect.</span></div>
              <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage(1)}>Now control your own snowball <ChevronRight size={18} /></button></div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="g72-machine">
            {[["🎂 Start age", start, setStart, 12, 40, 1, (v) => `${v} yrs`], ["🛑 Stop age", stop, setStop, 13, 60, 1, (v) => `${v} yrs`], ["💰 Per month", monthly, setMonthly, 10000, 200000, 10000, cop], ["📈 Rate / year", rate, setRate, 2, 10, 1, (v) => `${v}%`]].map(([l, v, set, mn, mx, stp, fmt]) => (
              <label key={l} className="g72-ctrl"><span>{l}</span><button type="button" onClick={() => set(Math.max(mn, v - stp))}><Minus size={14} /></button><input type="range" min={mn} max={mx} step={stp} value={v} onChange={(e) => set(Number(e.target.value))} /><button type="button" onClick={() => set(Math.min(mx, v + stp))}><Plus size={14} /></button><b>{fmt(v)}</b></label>
            ))}
            <div className="g73-toggle2"><button type="button" className={compound ? "on" : ""} onClick={() => setCompound(true)}>⛄ Compound</button><button type="button" className={!compound ? "on" : ""} onClick={() => setCompound(false)}>📏 Simple</button></div>
            <div className="g72-machine-out"><div><small>I put in</small><b>{cop(me.paid)}</b></div><div><small>Money at 60</small><b>{cop(final)}</b></div></div>
          </div>
          <div className="g73-balls one"><div><span style={{ fontSize: ball(final) }}>⛄</span><b>Interest earned: {cop(Math.max(0, final - me.paid))}</b></div></div>
          <LineChart labels={every5(AGES).map(String)} series={[{ name: "My money", values: every5(me.pts), color: compound ? "#16b074" : "#e07a2f" }]} />
          <div className="start-block">
            <h3><Target size={18} /> Challenges ({Object.keys(ch).length}/3)</h3>
            <ul className="g72-needs">
              <li className={ch.a ? "ok" : ""}>{ch.a ? "✅" : "⬜"} Reach $100,000,000 or more at 60.</li>
              <li className={ch.b ? "ok" : ""}>{ch.b ? "✅" : "⬜"} Switch to SIMPLE interest and see the difference.</li>
              <li className={ch.c ? "ok" : ""}>{ch.c ? "✅" : "⬜"} Start at 12 or 13 with compound interest — like Ana!</li>
            </ul>
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={Object.keys(ch).length < 3} onClick={() => finish(28, { prediction: pred, start, monthly, rate, final })}>Save my snowball <span className="coin-tag"><Coins size={15} /> +28</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   BLOQUE 3 · CLASE 24 · CREDIT CARDS & DEBT → PAGE 03
   ===================================================================== */

const CARDS = [
  { id: "joven", n: "Joven Card", e: "🟩", limit: 1000000, fee: 12000, rate: 2.0, d: "Small limit, small fee." },
  { id: "gold", n: "Gold Card", e: "🟨", limit: 4000000, fee: 39000, rate: 2.2, d: "Big limit, big fee." },
  { id: "store", n: "MegaStore Card", e: "🟧", limit: 1500000, fee: 0, rate: 2.7, d: "No fee… but a higher rate." },
];
const CATALOG = [
  { id: "head", e: "🎧", l: "Headphones", v: 280000 },
  { id: "shoes", e: "👟", l: "Sneakers", v: 350000 },
  { id: "books", e: "📚", l: "School books", v: 180000 },
  { id: "pizza", e: "🍕", l: "Pizza night", v: 60000 },
  { id: "phone", e: "📱", l: "New phone", v: 900000 },
  { id: "console", e: "🎮", l: "Game console", v: 1600000 },
];
const INSTALLMENTS = [1, 3, 6, 12, 24, 36];
const itemInterest = (v, n, rate) => (n === 1 ? 0 : Math.round(pmt(v, rate / 100, n) * n - v));
const daysToPay = (day, cut) => (day <= cut ? cut + 15 - day : cut + 30 + 15 - day);

function CreditCardSim({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [card, setCard] = useState(null);
  const [cut, setCut] = useState(null);
  const [day, setDay] = useState(10);
  const [bestFound, setBestFound] = useState(false);
  const [cart, setCart] = useState([]);
  const [declined, setDeclined] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [st, finish] = useFinish(onSave);
  const C = CARDS.find((c) => c.id === card);
  const used = cart.reduce((a, x) => a + x.v, 0);
  const usage = C ? Math.round((used / C.limit) * 100) : 0;
  const add = (it) => {
    if (cart.find((x) => x.id === it.id)) { setCart(cart.filter((x) => x.id !== it.id)); return; }
    if (used + it.v > C.limit) { setDeclined(it.l); return; }
    setDeclined(null); setCart([...cart, { ...it, n: 1 }]);
  };
  const setN = (id, n) => setCart(cart.map((x) => (x.id === id ? { ...x, n } : x)));
  const results = () => {
    if (!C) return {};
    const fees = C.fee * 12;
    const full = cart.reduce((a, x) => a + (x.n > 1 ? Math.round(x.v * C.rate / 100) : 0), 0) + fees;
    const inst = cart.reduce((a, x) => a + itemInterest(x.v, x.n, C.rate), 0) + fees;
    const late = inst + 3 * 45000 + Math.round(used * 0.05);
    let score = 650 + (usage <= 30 ? 30 : usage > 70 ? -30 : 0);
    return { full, inst, late, scores: { full: score + 80, inst: score + 40, late: score - 160 }, months: Math.max(1, ...cart.map((x) => x.n)) };
  };
  const R = results();
  if (st.done) return <Reward title="Credit card pro! 💳" subtitle="Now you know how the bank makes money — and how to avoid it." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  const steps = ["Choose card", "Dates", "Shopping", "Statement"];
  return (
    <ActShell icon={<CreditCard size={22} strokeWidth={2.1} />} title="My First Credit Card 💳" subtitle="A simulation (in real life you must be 18+). Choose, buy, pay — and see the real cost." onExit={onExit}>
      <div className="g72-steps">{steps.map((s, k) => <span key={s} className={k === stage ? "on" : k < stage ? "done" : ""}>{k < stage ? "✓" : k + 1} {s}</span>)}</div>

      {stage === 0 && (
        <>
          <div className="g73-cards3">
            {CARDS.map((c) => (
              <button key={c.id} type="button" className={`g73-cc ${c.id} ${card === c.id ? "on" : ""}`} onClick={() => setCard(c.id)}>
                <small>CREAR BANK</small><b>{c.n}</b>
                <span>Limit {cop(c.limit)}</span><span>Fee {cop(c.fee)}/month</span><span>Rate {c.rate}% / month</span>
                <i>{c.d}</i>
              </button>
            ))}
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!card} onClick={() => setStage(1)}>Apply for this card <ChevronRight size={18} /></button></div>
        </>
      )}

      {stage === 1 && (
        <>
          <div className="start-block">
            <h3><span className="step-n">1</span> Choose your cut-off date</h3>
            <div className="p1-starters">{[5, 15, 25].map((d) => <button key={d} type="button" className={`p1-chip ${cut === d ? "on" : ""}`} onClick={() => { setCut(d); setBestFound(false); }}>✂️ Day {d}</button>)}</div>
            {cut && <p className="start-tip">Payment due: <b>{cut + 15 > 30 ? `day ${cut + 15 - 30} of next month` : `day ${cut + 15}`}</b> (15 days after the cut-off).</p>}
          </div>
          {cut && (
            <div className="start-block">
              <h3><span className="step-n">2</span> Challenge: on which day should you buy to get the MOST days to pay?</h3>
              <div className="g73-cal">
                {Array.from({ length: 30 }, (_, k) => k + 1).map((d) => <button key={d} type="button" className={`${d === cut ? "cut" : ""} ${d === day ? "buy" : ""}`} onClick={() => { setDay(d); if (daysToPay(d, cut) === 44) setBestFound(true); }}>{d}{d === cut && <small>✂️</small>}</button>)}
              </div>
              <div className="g72-machine-out"><div><small>You buy on day</small><b>{day}</b></div><div><small>Days until you must pay</small><b>{daysToPay(day, cut)}</b></div></div>
              {bestFound ? <div className="p1-banner good"><span>✅ The day AFTER the cut-off gives you about 44 days to pay! The purchase goes into next month's statement.</span></div> : <p className="start-tip">💡 Tap different days. Watch the days to pay.</p>}
            </div>
          )}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!bestFound} onClick={() => setStage(2)}>Go shopping <ChevronRight size={18} /></button></div>
        </>
      )}

      {stage === 2 && C && (
        <>
          <div className="g73-usage">
            <div><small>{C.e} {C.n}</small><b>{cop(used)} / {cop(C.limit)}</b></div>
            <div className="bar"><i style={{ width: `${clamp(usage, 0, 100)}%`, background: usage <= 30 ? "var(--green)" : usage <= 70 ? "var(--gold)" : "var(--coral)" }} /></div>
            <span>Usage {usage}% · {usage <= 30 ? "✅ healthy (under 30%)" : usage <= 70 ? "⚠️ getting high" : "🚨 too high — hurts your credit history"}</span>
          </div>
          <div className="g73-catalog">{CATALOG.map((it) => <button key={it.id} type="button" className={`g73-item ${cart.find((x) => x.id === it.id) ? "on" : ""}`} onClick={() => add(it)}><em>{it.e}</em><b>{it.l}</b><span>{cop(it.v)}</span></button>)}</div>
          {declined && <div className="g72-alert"><AlertTriangle size={18} /> <span><b>DECLINED:</b> {declined} is over your credit limit.</span></div>}
          {cart.length > 0 && (
            <div className="start-block">
              <h3>🧩 How many installments for each purchase?</h3>
              {cart.map((x) => (
                <div key={x.id} className="g73-instrow">
                  <span>{x.e} {x.l} · {cop(x.v)}</span>
                  <div className="p1-starters">{INSTALLMENTS.map((n) => <button key={n} type="button" className={`p1-chip ${x.n === n ? "on" : ""}`} onClick={() => setN(x.id, n)}>{n}</button>)}</div>
                  <small>{x.n === 1 ? "Pay all next month: $0 interest if you pay on time" : `${cop(Math.round(pmt(x.v, C.rate / 100, x.n)))} × ${x.n} months · interest ${cop(itemInterest(x.v, x.n, C.rate))}`}</small>
                </div>
              ))}
            </div>
          )}
          <div className="start-foot"><button className="s1-btn primary big" disabled={cart.length < 2} onClick={() => setStage(3)}>Get my statement <ChevronRight size={18} /></button></div>
        </>
      )}

      {stage === 3 && C && (
        <>
          <div className="g73-statement">
            <header><b>📄 CREAR BANK · Statement</b><span>Cut-off day {cut} · Pay by {cut + 15 > 30 ? `day ${cut + 15 - 30}` : `day ${cut + 15}`}</span></header>
            {cart.map((x) => <div key={x.id}><span>{x.e} {x.l} ({x.n} inst.)</span><b>{cop(x.n === 1 ? x.v : Math.round(pmt(x.v, C.rate / 100, x.n)))}</b></div>)}
            <div><span>Card fee</span><b>{cop(C.fee)}</b></div>
            <div className="tot"><span>Total debt</span><b>{cop(used)}</b></div>
          </div>
          <div className="start-block">
            <h3>How will you pay during the next months?</h3>
            <div className="g72-opts">
              {[["full", "💯", "Pay the WHOLE debt now"], ["inst", "📆", "Pay my installments on time every month"], ["late", "😬", "Pay late / miss some payments"]].map(([id, e, l]) => <button key={id} type="button" className={`g72-opt ${strategy === id ? "on" : ""}`} onClick={() => setStrategy(id)}><em>{e}</em><span>{l}</span></button>)}
            </div>
          </div>
          {strategy && (
            <>
              <BarChart bars={[{ label: "Pay all now", value: R.full, color: "#16b074" }, { label: "Installments", value: R.inst, color: "#f5b23e" }, { label: "Late", value: R.late, color: "#ff6b57" }]} />
              <p className="start-tip p1-center">Extra cost in one year (interest + fees + late charges).</p>
              <div className="g73-score">
                <small>📊 Credit health (Datacrédito style)</small>
                <b className={R.scores[strategy] >= 700 ? "good" : R.scores[strategy] < 600 ? "bad" : ""}>{R.scores[strategy]}</b>
                <div className="bar"><i style={{ width: `${clamp(((R.scores[strategy] - 300) / 600) * 100, 0, 100)}%` }} /></div>
                <span>{strategy === "full" ? "Excellent: on time + no debt." : strategy === "inst" ? "Good: on time. But you pay interest." : "🚨 Late payments are reported. Future loans will be harder and more expensive."}</span>
              </div>
              <div className={`g72-conseq ${strategy === "late" ? "f0" : strategy === "full" ? "f2" : "f1"}`}><b>{strategy === "full" ? "✅ The cheapest option" : strategy === "inst" ? "🙂 OK, but more expensive" : "⚠️ The most expensive option"}</b><span>You pay {cop(R[strategy])} extra in one year. {strategy === "inst" ? `Your debt lasts ${R.months} months.` : ""}</span></div>
              <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(35, { card: C.n, cut, usage, cart: cart.map((x) => ({ l: x.l, v: x.v, n: x.n })), strategy, extra: R[strategy], score: R.scores[strategy] })}>Save my results <span className="coin-tag"><Coins size={15} /> +35</span></button></div>
            </>
          )}
        </>
      )}
    </ActShell>
  );
}

/* Debt Trap: el pago mínimo */
const DT_BAL = 1500000, DT_RATE = 0.024;
function payOff(fixed) {
  let b = DT_BAL, m = 0, interest = 0; const pts = [b];
  while (b > 0 && m < 600) {
    const i = Math.round(b * DT_RATE); interest += i; b += i;
    const pay = fixed === "min" ? Math.max(25000, i + Math.round(b * 0.02)) : fixed;
    b = Math.max(0, b - pay); m++; if (m <= 48) pts.push(b);
  }
  return { months: b > 0 ? null : m, interest, pts };
}
const PAYERS = [{ id: "min", e: "🐌", n: "Minimum Mike", d: "Pays only the minimum", v: "min", color: "#ff6b57" }, { id: "sara", e: "🚶‍♀️", n: "Steady Sara", d: "Pays $120,000 a month", v: 120000, color: "#f5b23e" }, { id: "sam", e: "🚀", n: "Smart Sam", d: "Pays $250,000 a month", v: 250000, color: "#16b074" }];
function DebtTrap({ onSave, onExit }) {
  const [pred, setPred] = useState(null);
  const [shown, setShown] = useState(false);
  const [mine, setMine] = useState(80000);
  const [ch, setCh] = useState({});
  const [q, setQ] = useState(null);
  const [st, finish] = useFinish(onSave);
  const res = PAYERS.map((p) => ({ ...p, ...payOff(p.v) }));
  const me = payOff(mine);
  useEffect(() => { const n = { ...ch }; if (me.months && me.months <= 12) n.a = true; if (me.interest < 120000) n.b = true; if (JSON.stringify(n) !== JSON.stringify(ch)) setCh(n); }, [mine]); // eslint-disable-line react-hooks/exhaustive-deps
  const diff = res[0].interest - res[2].interest;
  const qOpts = useMemo(() => shuffleArr([diff, Math.round(diff / 3), Math.round(diff * 1.8)]), [diff]);
  const fmtM = (m) => (m ? (m >= 24 ? `${m} months (${(m / 12).toFixed(1)} years)` : `${m} months`) : "50+ years");
  if (st.done) return <Reward title="Debt trap escaped! 🪤" subtitle="The minimum payment is the bank's best friend — not yours." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<AlertTriangle size={22} strokeWidth={2.1} />} title="The Debt Trap Game 🪤" subtitle={`Three friends owe ${cop(DT_BAL)} on a card at 2.4% a month. Who escapes first?`} onExit={onExit}>
      <div className="g72-racers">{PAYERS.map((p) => <button key={p.id} type="button" disabled={shown} className={`g72-racer ${pred === p.id ? "on" : ""}`} style={{ "--cc": p.color }} onClick={() => setPred(p.id)}><em>{p.e}</em><b>{p.n}</b><small>{p.d}</small></button>)}</div>
      {!shown && <div className="start-foot"><button className="s1-btn primary big" disabled={!pred} onClick={() => setShown(true)}>🔮 Who pays the LEAST interest? Show me!</button></div>}
      {shown && (
        <>
          <div className="g73-table">
            <div className="h"><span>Friend</span><span>Time to pay</span><span>Total interest</span></div>
            {res.map((p) => <div key={p.id}><span>{p.e} {p.n}</span><span>{fmtM(p.months)}</span><span className={p.id === "min" ? "neg" : ""}>{cop(p.interest)}</span></div>)}
          </div>
          <LineChart labels={res[0].pts.map((_, k) => (k % 6 === 0 ? `M${k}` : ""))} series={res.map((p) => ({ name: p.n, values: p.pts.concat(Array(49 - p.pts.length).fill(0)).slice(0, 49), color: p.color }))} yMin={0} />
          <ChartLegend series={res.map((p) => ({ name: p.n, color: p.color }))} />
          <div className="start-block">
            <h3>How much MORE interest does Mike pay than Sam?</h3>
            <div className="p1-starters">{qOpts.map((o) => <button key={o} type="button" disabled={q === diff} className={`p1-chip ${q === o ? (o === diff ? "ok" : "no") : ""}`} onClick={() => setQ(o)}>{cop(o)}</button>)}</div>
          </div>
          <div className="start-block">
            <h3>🎮 Your turn: choose YOUR fixed monthly payment</h3>
            <label className="g72-ctrl"><span>💵 Pay per month</span><button type="button" onClick={() => setMine(Math.max(40000, mine - 10000))}><Minus size={14} /></button><input type="range" min={40000} max={400000} step={10000} value={mine} onChange={(e) => setMine(Number(e.target.value))} /><button type="button" onClick={() => setMine(Math.min(400000, mine + 10000))}><Plus size={14} /></button><b>{cop(mine)}</b></label>
            <div className="g72-machine-out"><div><small>Time to escape</small><b className={me.months ? "" : "neg"}>{fmtM(me.months)}</b></div><div><small>Total interest</small><b>{cop(me.interest)}</b></div></div>
            <ul className="g72-needs">
              <li className={ch.a ? "ok" : ""}>{ch.a ? "✅" : "⬜"} Escape the debt in 12 months or less.</li>
              <li className={ch.b ? "ok" : ""}>{ch.b ? "✅" : "⬜"} Pay less than $120,000 in total interest.</li>
            </ul>
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={Object.keys(ch).length < 2 || q !== diff} onClick={() => finish(25, { prediction: pred, mine, months: me.months, interest: me.interest })}>Escape! <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
        </>
      )}
    </ActShell>
  );
}

const CREDIT_RULES = [
  { id: "full", l: "Pay the FULL statement before the due date", good: true },
  { id: "after", l: "Buy big things right after the cut-off date", good: true },
  { id: "few", l: "Use 1–3 installments — never 36 for small things", good: true },
  { id: "30", l: "Keep my usage under 30% of the limit", good: true },
  { id: "nomin", l: "Never pay only the minimum", good: true },
  { id: "check", l: "Check my credit history once a year", good: true },
  { id: "busy", l: "Pay only the minimum when I'm busy", good: false, why: "The minimum is the most expensive way to pay." },
  { id: "afford", l: "Use the card for things I can't afford", good: false, why: "A card is borrowed money, not extra money." },
  { id: "lend", l: "Lend my card to my friends", good: false, why: "You are responsible for every purchase." },
  { id: "new", l: "Get a new card to pay the old one", good: false, why: "That is the cycle of debt." },
];
function CreditRules({ resp, existing, onSave, onExit }) {
  const opts = useMemo(() => shuffleArr(CREDIT_RULES), []);
  const [sel, setSel] = useState(existing?.ids || []);
  const [lesson, setLesson] = useState(existing?.lesson || "");
  const [st, finish] = useFinish(onSave);
  const bad = sel.map((id) => CREDIT_RULES.find((r) => r.id === id)).filter((r) => !r.good);
  const sim = resp?.c24_card;
  if (st.done) return <Reward title="Plan Page 03 saved! 💳" subtitle="Your credit rules will protect your future." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<ShieldCheck size={22} strokeWidth={2.1} />} title="My Credit Rules 💳" subtitle="Choose the 4 rules you promise to follow when you have a card." onExit={onExit}>
      <PageBadge n="03" />
      {sim && <div className="p1-banner"><span>📄 In your simulator you chose <b>{sim.card}</b> and paid {cop(sim.extra)} extra in one year (credit health {sim.score}).</span></div>}
      <div className="g72-opts">{opts.map((r) => <button key={r.id} type="button" className={`g72-opt ${sel.includes(r.id) ? "on" : ""}`} onClick={() => setSel(sel.includes(r.id) ? sel.filter((x) => x !== r.id) : sel.length < 4 ? [...sel, r.id] : sel)}><em>{sel.includes(r.id) ? "☑️" : "⬜"}</em><span>{r.l}</span></button>)}</div>
      {bad.length > 0 && <div className="g72-conseq f0"><b>⚠️ Consequence card</b><span>{bad.map((r) => `“${r.l}”: ${r.why}`).join(" ")}</span></div>}
      <div className="start-block">
        <div className="p3-sentence edit"><span>The most important lesson from the simulator was</span><input className="start-input" value={lesson} onChange={(e) => setLesson(e.target.value)} placeholder="Write your answer here…" /></div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={sel.length !== 4 || bad.length > 0 || countWords(lesson) < 5} onClick={() => finish(20, { ids: sel, rules: sel.map((id) => CREDIT_RULES.find((r) => r.id === id).l), lesson })}>Save Plan Page 03 <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   BLOQUE 4 · CLASES 25–26 · FAMILY FINANCIAL PLANNING → PAGE 04
   ===================================================================== */

const INFL = { rent: 5, food: 9, transport: 7, utilities: 10, education: 6, health: 8 };
const CAT_L = { rent: "🏠 Rent", food: "🛒 Food", transport: "🚌 Transport", utilities: "💡 Utilities", education: "📚 Education", health: "💊 Health" };
const FAMILIES = [
  { id: "gomez", e: "👨‍👩‍👧‍👦", n: "The Gómez family", d: "Mom (nurse) + Dad (driver, has a motorbike) + 2 kids", income: 3800000, base: { rent: 1100000, food: 900000, transport: 320000, utilities: 260000, education: 250000, health: 120000 } },
  { id: "perez", e: "👩‍👧‍👦", n: "The Pérez family", d: "Mom (hairdresser, her income changes) + 2 kids", income: 2600000, base: { rent: 850000, food: 700000, transport: 200000, utilities: 210000, education: 180000, health: 90000 } },
  { id: "ruiz", e: "👴👫", n: "The Ruiz family", d: "A couple + Grandpa (he needs medicines)", income: 5200000, base: { rent: 1500000, food: 1000000, transport: 400000, utilities: 300000, education: 150000, health: 450000 } },
];
const INSURANCES = [{ id: "home", e: "🏠", l: "Home insurance", v: 45000 }, { id: "accident", e: "🛵", l: "Accident insurance", v: 35000 }, { id: "phone", e: "📱", l: "Phone insurance", v: 15000 }];
const LIFE_CARDS = [
  { id: "fridge", e: "🧊", t: "The fridge breaks.", v: -900000, ins: "home", cover: 0.7 },
  { id: "doctor", e: "🩺", t: "A medical exam that the EPS doesn't cover.", v: -250000 },
  { id: "trip", e: "🚌", t: "The kids' school trip.", v: -120000, want: true },
  { id: "power", e: "💡", t: "The electricity bill is much higher this month.", v: -80000 },
  { id: "bonus", e: "🎉", t: "Extra job this weekend!", v: 300000 },
  { id: "moto", e: "🛵", t: "Motorbike accident: big repairs.", v: -1200000, ins: "accident", cover: 0.8 },
  { id: "phone", e: "📱", t: "Mom's phone is stolen.", v: -700000, ins: "phone", cover: 0.8 },
  { id: "prices", e: "🛒", t: "Food prices go up again.", v: -100000 },
];
const newCost = (v, k) => Math.round(v * (1 + INFL[k] / 100));

function FamilyLife({ onSave, onExit }) {
  const [stage, setStage] = useState(0);
  const [fam, setFam] = useState(null);
  const [fun, setFun] = useState(200000);
  const [save, setSave] = useState(150000);
  const [ins, setIns] = useState([]);
  const [deck, setDeck] = useState([]);
  const [w, setW] = useState(0);
  const [fund, setFund] = useState(500000);
  const [funLeft, setFunLeft] = useState(0);
  const [debt, setDebt] = useState(0);
  const [stress, setStress] = useState(1);
  const [choice, setChoice] = useState(null);
  const [log, setLog] = useState([]);
  const [st, finish] = useFinish(onSave);
  const F = FAMILIES.find((f) => f.id === fam);
  const needs = F ? Object.entries(F.base).reduce((a, [k, v]) => a + newCost(v, k), 0) : 0;
  const insCost = ins.reduce((a, id) => a + INSURANCES.find((x) => x.id === id).v, 0);
  const spent = needs + fun + save + insCost;
  const balance = F ? F.income - spent : 0;
  const start = () => {
    const insurable = shuffleArr(LIFE_CARDS.filter((c) => c.ins))[0];
    const others = shuffleArr(LIFE_CARDS.filter((c) => !c.ins && c.id !== "bonus")).slice(0, 2);
    setDeck(shuffleArr([insurable, LIFE_CARDS.find((c) => c.id === "bonus"), ...others]));
    setFund(500000 + save); setFunLeft(fun); setW(0); setStage(2);
  };
  const card = deck[w];
  const covered = card && card.ins && ins.includes(card.ins) ? Math.round(-card.v * card.cover) : 0;
  const cost = card ? Math.max(0, -card.v - covered) : 0;
  const decide = (how) => {
    setChoice(how);
    let note = "";
    if (card.v > 0) {
      if (how === "save") { setFund(fund + card.v); note = "Saved in the emergency fund."; } else { setStress(Math.max(0, stress - 1)); note = "A nice family dinner 🍝."; }
    } else if (how === "fund") {
      if (fund >= cost) { setFund(fund - cost); note = "Paid with the emergency fund."; } else { const rest = cost - fund; setFund(0); setDebt(debt + Math.round(rest * Math.pow(1.023, 3))); setStress(stress + 1); note = `The fund wasn't enough: ${cop(rest)} went to the credit card.`; }
    } else if (how === "fun") {
      if (funLeft >= cost) { setFunLeft(funLeft - cost); note = "No fun this month — but no debt."; } else { const rest = cost - funLeft; setFunLeft(0); setDebt(debt + Math.round(rest * Math.pow(1.023, 3))); setStress(stress + 1); note = `Not enough fun money: ${cop(rest)} went to the card.`; }
    } else if (how === "card") { setDebt(debt + Math.round(cost * Math.pow(1.023, 3))); setStress(stress + 1); note = "Paid with the card: interest for 3 months."; }
    else if (how === "lender") { setDebt(debt + Math.round(cost * 1.6)); setStress(stress + 3); note = "The informal lender charges 20% a month and threatens… 😱"; }
    else if (how === "skip") { note = "The kids stay home this time."; setStress(stress + (card.want ? 0 : 2)); }
    setLog([...log, { card: card.id, how, covered, note }]);
  };
  const next = () => { setChoice(null); if (w === 3) setStage(3); else setW(w + 1); };
  const faces = ["😀", "🙂", "😐", "😟", "😫", "🤯"];
  if (st.done) return <Reward title="Family plan survivor! 🏠" subtitle="Budget + insurance + emergency fund = calm." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Home size={22} strokeWidth={2.1} />} title="Family Life Cards 🃏" subtitle="Plan a family budget with this year's prices. Then live one month full of surprises!" onExit={onExit}>
      <div className="g72-steps">{["Choose family", "Budget", "4 weeks", "Report"].map((s, k) => <span key={s} className={k === stage ? "on" : k < stage ? "done" : ""}>{k < stage ? "✓" : k + 1} {s}</span>)}</div>

      {stage === 0 && (
        <>
          <div className="g73-fams">{FAMILIES.map((f) => <button key={f.id} type="button" className={`g73-fam ${fam === f.id ? "on" : ""}`} onClick={() => setFam(f.id)}><em>{f.e}</em><b>{f.n}</b><span>{f.d}</span><strong>{cop(f.income)} / month</strong></button>)}</div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!fam} onClick={() => setStage(1)}>Plan their budget <ChevronRight size={18} /></button></div>
        </>
      )}

      {stage === 1 && F && (
        <>
          <div className="start-block">
            <h3>🎈 Needs with this year's prices (inflation)</h3>
            <div className="g73-table">
              <div className="h"><span>Need</span><span>Last year</span><span>This year</span></div>
              {Object.entries(F.base).map(([k, v]) => <div key={k}><span>{CAT_L[k]} <small>+{INFL[k]}%</small></span><span>{cop(v)}</span><span><b>{cop(newCost(v, k))}</b></span></div>)}
              <div className="tot"><span>Total needs</span><span /><span><b>{cop(needs)}</b></span></div>
            </div>
          </div>
          <div className="start-block">
            <h3>🎛️ Decide the rest</h3>
            {[["🎉 Fun & wants", fun, setFun, 0, 800000], ["🛟 Emergency savings", save, setSave, 0, 1000000]].map(([l, v, set, mn, mx]) => (
              <label key={l} className="g72-ctrl"><span>{l}</span><button type="button" onClick={() => set(Math.max(mn, v - 25000))}><Minus size={14} /></button><input type="range" min={mn} max={mx} step={25000} value={v} onChange={(e) => set(Number(e.target.value))} /><button type="button" onClick={() => set(Math.min(mx, v + 25000))}><Plus size={14} /></button><b>{cop(v)}</b></label>
            ))}
            <h3>☂️ Insurance (optional)</h3>
            <div className="g72-opts">{INSURANCES.map((x) => <button key={x.id} type="button" className={`g72-opt ${ins.includes(x.id) ? "on" : ""}`} onClick={() => setIns(ins.includes(x.id) ? ins.filter((y) => y !== x.id) : [...ins, x.id])}><em>{x.e}</em><span>{x.l} · {cop(x.v)}/month</span></button>)}</div>
          </div>
          <StackBar parts={[{ label: "Needs", value: needs, color: "#0b7a50" }, { label: "Fun", value: fun, color: "#e07a2f" }, { label: "Savings", value: save, color: "#f5b23e" }, { label: "Insurance", value: insCost, color: "#16b074" }]} max={Math.max(F.income, spent)} />
          <div className={`g72-conseq ${balance >= 0 ? "f2" : "f0"}`}><b>{balance >= 0 ? `✅ Balanced: ${cop(balance)} free` : `⚠️ ${cop(-balance)} over the income!`}</b><span>Income {cop(F.income)} · Planned {cop(spent)}. The family already has {cop(500000)} in the emergency fund.</span></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={balance < 0} onClick={start}>Start the month 🃏</button></div>
        </>
      )}

      {stage === 2 && card && (
        <>
          <div className="g73-meters3">
            <div><small>🛟 Emergency fund</small><b>{cop(fund)}</b></div>
            <div><small>🎉 Fun money left</small><b>{cop(funLeft)}</b></div>
            <div className={debt > 0 ? "bad" : ""}><small>💳 Debt</small><b>{cop(debt)}</b></div>
            <div><small>Stress</small><b className="face">{faces[clamp(stress, 0, 5)]}</b></div>
          </div>
          <div className="g73-lifecard" key={card.id}>
            <small>WEEK {w + 1} / 4 · LIFE CARD</small>
            <em>{card.e}</em>
            <b>{card.t}</b>
            <strong className={card.v > 0 ? "pos" : "neg"}>{card.v > 0 ? "+" : "−"}{cop(Math.abs(card.v))}</strong>
            {card.ins && <span className={ins.includes(card.ins) ? "ok" : ""}>{ins.includes(card.ins) ? `☂️ Your insurance pays ${cop(covered)}! You pay ${cop(cost)}.` : `☂️ No ${INSURANCES.find((x) => x.id === card.ins).l.toLowerCase()} — you pay everything.`}</span>}
          </div>
          {choice === null ? (
            <div className="g72-opts">
              {card.v > 0 ? (
                <>
                  <button type="button" className="g72-opt" onClick={() => decide("save")}><em>🛟</em><span>Save it in the emergency fund</span></button>
                  <button type="button" className="g72-opt" onClick={() => decide("enjoy")}><em>🍝</em><span>Celebrate with a family dinner</span></button>
                </>
              ) : (
                <>
                  <button type="button" className="g72-opt" onClick={() => decide("fund")}><em>🛟</em><span>Emergency fund</span></button>
                  <button type="button" className="g72-opt" onClick={() => decide("fun")}><em>🎉</em><span>Cut the fun money</span></button>
                  <button type="button" className="g72-opt" onClick={() => decide("card")}><em>💳</em><span>Credit card (2.3% a month)</span></button>
                  <button type="button" className="g72-opt" onClick={() => decide("lender")}><em>💀</em><span>Informal lender (“fast money”)</span></button>
                  {card.want && <button type="button" className="g72-opt" onClick={() => decide("skip")}><em>🙅</em><span>Skip it this time</span></button>}
                </>
              )}
            </div>
          ) : (
            <>
              <div className={`g72-conseq ${choice === "lender" ? "f0" : choice === "card" ? "f1" : "f2"}`}><b>{choice === "lender" ? "⚠️ Dangerous choice" : choice === "card" ? "🙂 It works, but it costs interest" : "✅ Good decision"}</b><span>{log[log.length - 1]?.note}</span></div>
              <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{w === 3 ? "See the report" : "Next week"} <ChevronRight size={18} /></button></div>
            </>
          )}
        </>
      )}

      {stage === 3 && F && (
        <>
          <div className="g73-report">
            <header><em>{F.e}</em><div><b>{F.n} · end of the month</b><small>Your decisions, week by week</small></div></header>
            <div className="g73-meters3">
              <div><small>🛟 Emergency fund</small><b>{cop(fund)}</b></div>
              <div className={debt > 0 ? "bad" : ""}><small>💳 Debt</small><b>{cop(debt)}</b></div>
              <div><small>☂️ Insurance paid</small><b>{cop(log.reduce((a, l) => a + l.covered, 0))}</b></div>
              <div><small>Stress</small><b className="face">{faces[clamp(stress, 0, 5)]}</b></div>
            </div>
            {log.map((l, k) => { const c = LIFE_CARDS.find((x) => x.id === l.card); return <div key={k} className="g73-logline"><span>W{k + 1} {c.e} {c.t}</span><small>{l.note}</small></div>; })}
          </div>
          <div className={`g72-conseq ${debt === 0 ? "f2" : debt < 500000 ? "f1" : "f0"}`}><b>{debt === 0 ? "✅ No debt at the end of the month!" : "⚠️ The family ended with debt"}</b><span>{debt === 0 ? "The emergency fund and the budget protected the family." : "Lesson: a bigger emergency fund and the right insurance reduce debt and stress."}</span></div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(30 + (debt === 0 ? 10 : 0), { family: F.n, needs, fund, debt, stress, insurances: ins })}>Finish the month <span className="coin-tag"><Coins size={15} /> +40</span></button></div>
        </>
      )}
    </ActShell>
  );
}

const INFL_ROUNDS = [
  { tag: "THE GÓMEZ FAMILY · RENT", q: "Rent was $1,100,000. It goes up 5%. What is the NEW rent?", visual: <InflCard hl="Rent" />, answer: 1155000, money: true, hint: "1,100,000 × 1.05  (or 1,100,000 + 55,000)", explain: "$1,155,000." },
  { tag: "THE GÓMEZ FAMILY · FOOD", q: "Food was $900,000. Food inflation is 9%. What is the NEW cost?", visual: <InflCard hl="Food" />, answer: 981000, money: true, hint: "900,000 × 1.09  (or 900,000 + 81,000)", explain: "$981,000." },
  { tag: "THE GÓMEZ FAMILY · UTILITIES", q: "Utilities were $260,000. They go up 10%. What is the NEW cost?", visual: <InflCard hl="Utilities" />, answer: 286000, money: true, hint: "260,000 + 26,000", explain: "$286,000." },
  { tag: "THE GÓMEZ FAMILY · TOTAL", q: "How much MORE do the 3 expenses cost now, in total, every month?", visual: <MiniTable head={["Expense", "Last year", "This year"]} rows={[["🏠 Rent", "$1,100,000", "$1,155,000"], ["🛒 Food", "$900,000", "$981,000"], ["💡 Utilities", "$260,000", "$286,000"]]} foot={["Total", "$2,260,000", "?"]} />, answer: 162000, money: true, hint: "New total (1,155,000 + 981,000 + 286,000) − old total (2,260,000)", explain: "$2,422,000 − $2,260,000 = $162,000 more every month." },
  { tag: "THE GÓMEZ FAMILY · IN ONE YEAR", q: "That is $162,000 more every month. How much more in ONE YEAR?", visual: <MiniCase e="📆" who="Extra cost" lines={["$162,000 every month", "12 months"]} />, answer: 1944000, money: true, hint: "162,000 × 12", explain: "$1,944,000 a year — almost a whole month of rent and food!" },
  { tag: "THE GÓMEZ FAMILY · DECIDE", q: "Their income ($3,800,000) didn't change. What is the smartest FIRST step?", visual: <MiniCase e="👨‍👩‍👧‍👦" who="The Gómez family" lines={["Income: $3,800,000 (the same)", "Expenses: +$162,000 a month"]} />, options: ["Update the budget and cut some wants", "Pay the food with a credit card", "Stop paying the electricity bill"], correct: 0, explain: "Plan first — debt for daily needs is a trap." },
  { tag: "THE PÉREZ FAMILY · NEW CASE", q: "The Pérez family spends $700,000 on food. Food inflation is 9%. NEW cost?", visual: <MiniCase e="👩‍👧‍👦" who="The Pérez family" lines={["Food last year: $700,000", "Inflation: +9%"]} />, answer: 763000, money: true, hint: "700,000 × 1.09", explain: "$763,000." },
  { tag: "THE PÉREZ FAMILY · CUT", q: "To pay the extra $63,000 for food, which cut makes MORE sense?", visual: <MiniCase e="✂️" who="Options to cut" lines={["Streaming services: $45,000", "Eating out: $80,000", "School transport: $120,000"]} />, options: ["Eat out less (a want)", "Stop school transport (a need)", "Cancel health insurance"], correct: 0, explain: "Cut wants, protect needs." },
];

const EMERG_STEPS = ["Stay calm and check what happened.", "Check if an insurance covers it.", "Use the emergency fund (not a loan).", "Refill the fund in the next months."];
const INS_LIST = [{ id: "eps", l: "🏥 Health (EPS)", must: true }, { id: "soat", l: "🛵 SOAT (if we have a car or motorbike)" }, { id: "home", l: "🏠 Home insurance" }, { id: "life", l: "❤️ Life / accident insurance" }, { id: "phone", l: "📱 Phone insurance" }, { id: "travel", l: "✈️ Travel insurance" }];
function FamilyPlan({ resp, existing, onSave, onExit }) {
  const fl = resp?.c25_family;
  const [needs, setNeeds] = useState(existing?.needs || fl?.needs || 3000000);
  const [months, setMonths] = useState(existing?.months || 3);
  const [ins, setIns] = useState(existing?.insurances || ["eps"]);
  const [why, setWhy] = useState(existing?.why || "");
  const [ordered, setOrdered] = useState(false);
  const [st, finish] = useFinish(onSave);
  const target = needs * months;
  const monthly = Math.ceil(target / 24 / 1000) * 1000;
  if (st.done) return <Reward title="Plan Page 04 saved! 🏠" subtitle="Your family plan is ready for surprises." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Umbrella size={22} strokeWidth={2.1} />} title="My Family & Emergency Plan 🏠" subtitle="Use what you learned in Family Life Cards to design an emergency plan." onExit={onExit}>
      <PageBadge n="04" />
      <div className="start-block">
        <h3><span className="step-n">1</span> Emergency fund goal</h3>
        {fl && <p className="start-tip">In the game, {fl.family} needed {cop(fl.needs)} a month. You can use this number or estimate another family.</p>}
        <label className="g72-ctrl"><span>🧾 Monthly needs</span><button type="button" onClick={() => setNeeds(Math.max(500000, needs - 100000))}><Minus size={14} /></button><input type="range" min={500000} max={8000000} step={100000} value={needs} onChange={(e) => setNeeds(Number(e.target.value))} /><button type="button" onClick={() => setNeeds(Math.min(8000000, needs + 100000))}><Plus size={14} /></button><b>{cop(needs)}</b></label>
        <div className="p1-starters">{[3, 6].map((m) => <button key={m} type="button" className={`p1-chip ${months === m ? "on" : ""}`} onClick={() => setMonths(m)}>{m} months</button>)}</div>
        <div className="g72-machine-out"><div><small>Emergency fund goal</small><b>{cop(target)}</b></div><div><small>To build it in 2 years</small><b>{cop(monthly)}/month</b></div></div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> Insurance for this family</h3>
        <div className="g72-opts">{INS_LIST.map((x) => <button key={x.id} type="button" className={`g72-opt ${ins.includes(x.id) ? "on" : ""}`} onClick={() => !x.must && setIns(ins.includes(x.id) ? ins.filter((y) => y !== x.id) : [...ins, x.id])}><em>{ins.includes(x.id) ? "☑️" : "⬜"}</em><span>{x.l}{x.must ? " · mandatory" : ""}</span></button>)}</div>
        <div className="p3-sentence edit"><span>The most important insurance for this family is … because</span><input className="start-input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Write your answer here…" /></div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">3</span> Our emergency steps (put them in order)</h3>
        {ordered ? <div className="p1-banner good"><span>✅ Steps in order: {EMERG_STEPS.map((s, k) => `${k + 1}. ${s}`).join(" ")}</span></div> : <OrderGame items={EMERG_STEPS} labels={["1", "2", "3", "4"]} onDone={() => setOrdered(true)} />}
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ordered || ins.length < 2 || countWords(why) < 5} onClick={() => finish(25, { needs, months, target, monthly, insurances: ins.map((id) => INS_LIST.find((x) => x.id === id).l), why })}>Save Plan Page 04 <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   BLOQUE 5 · CLASE 27 · FINANCING A BUSINESS → PAGE 05
   ===================================================================== */

const LOGOS = ["🧁", "📱", "🌱", "🎮", "🚲", "⭐", "🔥", "💡", "🦊", "🚀"];
function StartupStudio({ existing, onSave, onExit }) {
  const ex = existing?.biz;
  const [stage, setStage] = useState(0);
  const [tplId, setTplId] = useState(ex?.tpl || null);
  const T = BIZ_TEMPLATES.find((t) => t.id === tplId);
  const [name, setName] = useState(ex?.name || "");
  const [logo, setLogo] = useState(ex?.e || "⭐");
  const [price, setPrice] = useState(ex?.price || 0);
  const [opt, setOpt] = useState(ex ? ex.items : []);
  const [st, finish] = useFinish(onSave);
  const pickTpl = (t) => { setTplId(t.id); setPrice(t.price); setOpt(t.items.filter((x) => x.must).map((x) => x.l)); setLogo(t.e); };
  const extras = T ? T.items.filter((x) => !x.must && opt.includes(x.l)).length : 0;
  const units = T ? Math.round(T.units * Math.pow(price / T.price, -1.6) * (1 + 0.1 * extras)) : 0;
  const equipment = T ? T.items.filter((x) => opt.includes(x.l)).reduce((a, x) => a + x.v, 0) : 0;
  const capital = T ? equipment + T.fixed : 0;
  const biz = T ? { tpl: T.id, e: logo, name: name || T.n, unit: T.unit, price, varCost: T.varCost, fixed: T.fixed, units, items: opt, equipment, capital } : null;
  const profit = biz ? bizProfit(biz) : 0;
  const be = biz ? breakEven(biz) : 0;
  if (st.done) return <Reward title="Startup created! 🚀" subtitle="Your business will travel with you all period." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Rocket size={22} strokeWidth={2.1} />} title="Startup Studio 🚀" subtitle="Create YOUR business: idea, brand, price and the things you need to start." onExit={onExit}>
      <div className="g72-steps">{["Idea", "Brand", "Price", "Shopping list"].map((s, k) => <span key={s} className={k === stage ? "on" : k < stage ? "done" : ""}>{k < stage ? "✓" : k + 1} {s}</span>)}</div>
      {biz && stage > 0 && (
        <div className="g73-startcard">
          <em>{logo}</em>
          <div><b>{biz.name}</b><small>{T.n} · {cop(price)} per {T.unit}</small></div>
          <div className="nums"><span>Capital<b>{cop(capital)}</b></span><span>Profit / month<b className={profit < 0 ? "neg" : ""}>{cop(profit)}</b></span><span>Break-even<b>{be} {T.unit}s</b></span></div>
        </div>
      )}
      {stage === 0 && (
        <>
          <div className="g73-tpls">{BIZ_TEMPLATES.map((t) => <button key={t.id} type="button" className={`g73-tpl ${tplId === t.id ? "on" : ""}`} onClick={() => pickTpl(t)}><em>{t.e}</em><b>{t.n}</b><span>Sells at {cop(t.price)} per {t.unit}</span><small>Cost per {t.unit}: {cop(t.varCost)} · Fixed: {cop(t.fixed)}/month</small></button>)}</div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!T} onClick={() => setStage(1)}>I choose this idea <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 1 && T && (
        <>
          <div className="start-block">
            <h3><span className="step-n">1</span> Name your business</h3>
            <input className="start-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Business name" />
            <h3><span className="step-n">2</span> Choose a logo</h3>
            <div className="p1-starters">{LOGOS.map((l) => <button key={l} type="button" className={`p1-chip big ${logo === l ? "on" : ""}`} onClick={() => setLogo(l)}>{l}</button>)}</div>
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={name.trim().length < 3} onClick={() => setStage(2)}>Next: price <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 2 && T && (
        <>
          <div className="g72-howto"><b>Price game</b><span>💡 A higher price = more profit per {T.unit}, but FEWER customers. A lower price = more customers, but less profit each. Find a good balance!</span></div>
          <div className="g72-machine">
            <label className="g72-ctrl"><span>🏷️ Price</span><button type="button" onClick={() => setPrice(Math.max(Math.round(T.price * 0.6), price - Math.round(T.price * 0.05)))}><Minus size={14} /></button><input type="range" min={Math.round(T.price * 0.6)} max={Math.round(T.price * 1.6)} step={Math.round(T.price * 0.05)} value={price} onChange={(e) => setPrice(Number(e.target.value))} /><button type="button" onClick={() => setPrice(Math.min(Math.round(T.price * 1.6), price + Math.round(T.price * 0.05)))}><Plus size={14} /></button><b>{cop(price)}</b></label>
            <div className="g72-machine-out"><div><small>Customers buy</small><b>{units} {T.unit}s / month</b></div><div><small>Monthly profit</small><b className={profit < 0 ? "neg" : ""}>{cop(profit)}</b></div></div>
          </div>
          {price <= T.varCost && <div className="g72-conseq f0"><b>⚠️ You lose money on every {T.unit}!</b><span>The price must be higher than the cost per {T.unit} ({cop(T.varCost)}).</span></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={profit <= 0} onClick={() => setStage(3)}>Next: shopping list <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 3 && T && (
        <>
          <div className="start-block">
            <h3>🛒 What do you need to start? (🔒 = required)</h3>
            <div className="g72-opts">{T.items.map((x) => <button key={x.l} type="button" disabled={x.must} className={`g72-opt ${opt.includes(x.l) ? "on" : ""}`} onClick={() => setOpt(opt.includes(x.l) ? opt.filter((y) => y !== x.l) : [...opt, x.l])}><em>{x.must ? "🔒" : opt.includes(x.l) ? "☑️" : "⬜"}</em><span>{x.l} · {cop(x.v)}{!x.must && " · +10% customers"}</span></button>)}</div>
          </div>
          <div className="g73-table">
            <div><span>🧰 Equipment and start-up costs</span><span /><span><b>{cop(equipment)}</b></span></div>
            <div><span>📆 First month of fixed costs (working capital)</span><span /><span><b>{cop(T.fixed)}</b></span></div>
            <div className="tot"><span>💰 CAPITAL I NEED</span><span /><span><b>{cop(capital)}</b></span></div>
          </div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(30, { biz })}>Launch my startup <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
        </>
      )}
    </ActShell>
  );
}

const SOURCES_B = [
  { id: "savings", label: "Own savings", icon: "🐷", color: "#16b074" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧", color: "#e07a2f" },
  { id: "bank", label: "Bank loan", icon: "🏦", color: "#0b7a50" },
  { id: "micro", label: "Microcredit", icon: "🌱", color: "#5a9e3a" },
  { id: "crowd", label: "Crowdfunding", icon: "🙌", color: "#c9902a" },
  { id: "investor", label: "Investor", icon: "🦄", color: "#ff6b57" },
  { id: "seed", label: "Seed capital", icon: "🏛️", color: "#8a5a00" },
];
const MATCH_CASES = [
  { label: "Laura needs $150,000 for her first bracelet materials. She has $200,000 saved.", answer: "savings", why: "She already has the money — no interest, no partners." },
  { label: "A tech startup needs $80,000,000 to grow fast. The founders accept sharing ownership.", answer: "investor", why: "Big amount + growth + sharing ownership = investor." },
  { label: "Don Jorge's bakery (5 years, steady sales) needs $8,000,000 for a new oven.", answer: "bank", why: "A history of sales makes a bank loan possible." },
  { label: "Students want to make a short film. Their fans would love posters and tickets as rewards.", answer: "crowd", why: "Many fans + rewards = crowdfunding." },
  { label: "Rosa, a seamstress with a small but steady income, needs $1,200,000 for a sewing machine.", answer: "micro", why: "A small loan for an income activity = microcredit." },
  { label: "A 19-year-old SENA graduate has an approved plan for a green packaging company.", answer: "seed", why: "Eligible + approved plan → Fondo Emprender seed capital." },
  { label: "Your cousin needs $300,000. Grandma offers to lend it, with no interest, for 6 months.", answer: "family", why: "Family money, with clear dates to repay." },
  { label: "A food truck with 2 years of good sales needs $12,000,000 for a second truck.", answer: "bank", why: "A sales history + a big amount = bank loan." },
  { label: "An app with 500,000 new users a month needs $200,000,000 to grow in other countries.", answer: "investor", why: "Very fast growth and a huge amount = investors." },
  { label: "A street vendor of arepas needs $800,000 for a new grill. She has no credit history.", answer: "micro", why: "Small amount, no history = microcredit." },
];

/* Funding Fair: arma tu mezcla de financiación y simula 12 meses */
const FUNDERS = [
  { id: "savings", e: "🐷", n: "My savings", max: 600000, step: 50000, d: "No interest. Risk: you can lose it.", kind: "own" },
  { id: "family", e: "👨‍👩‍👧", n: "Family loan", max: 1500000, step: 50000, d: "0% · repay in 12 months.", kind: "debt", rate: 0, n2: 12 },
  { id: "bank", e: "🏦", n: "Bank loan", max: 8000000, step: 100000, d: "2% a month · 24 months · an adult co-signs.", kind: "debt", rate: 0.02, n2: 24 },
  { id: "micro", e: "🌱", n: "Microcredit", max: 2500000, step: 100000, d: "2.8% a month · 12 months · easy requirements.", kind: "debt", rate: 0.028, n2: 12 },
  { id: "crowd", e: "🙌", n: "Crowdfunding", max: 2000000, step: 100000, d: "No repayment, but 20% goes to fees + rewards. Needs a campaign video.", kind: "crowd" },
  { id: "investor", e: "🦄", n: "Angel investor", max: 5000000, step: 500000, d: "No repayment. Each $1,000,000 = 10% of your company.", kind: "equity" },
];
const SALES_CURVE = [0.55, 0.7, 0.8, 0.9, 1, 1.05, 0.85, 1, 1.1, 1.15, 1.2, 1.25];
function FundingFair({ resp, existing, onSave, onExit }) {
  const biz = getBiz(resp);
  const [mix, setMix] = useState(existing?.mix || { savings: 0, family: 0, bank: 0, micro: 0, crowd: 0, investor: 0 });
  const [video, setVideo] = useState(false);
  const [sim, setSim] = useState(false);
  const [why, setWhy] = useState(existing?.why || "");
  const [st, finish] = useFinish(onSave);
  const crowdNet = Math.round(mix.crowd * 0.8);
  const raised = mix.savings + mix.family + mix.bank + mix.micro + crowdNet + mix.investor;
  const covered = raised >= biz.capital;
  const pay = (id) => { const f = FUNDERS.find((x) => x.id === id); return mix[id] > 0 ? Math.round(pmt(mix[id], f.rate, f.n2)) : 0; };
  const monthlyDebt = (m) => (m <= 12 ? pay("family") + pay("micro") : 0) + (m <= 24 ? pay("bank") : 0);
  const debtCost = ["family", "bank", "micro"].reduce((a, id) => { const f = FUNDERS.find((x) => x.id === id); return a + (mix[id] > 0 ? pay(id) * f.n2 - mix[id] : 0); }, 0) + (mix.crowd - crowdNet);
  const ownership = Math.max(0, 100 - Math.round(mix.investor / 100000));
  const profit = bizProfit(biz);
  const risk = profit > 0 ? Math.round((monthlyDebt(1) / profit) * 100) : 100;
  let cash = raised - biz.capital, minCash = cash; const cashPts = [cash];
  SALES_CURVE.forEach((f, k) => { cash += Math.round(biz.units * f) * (biz.price - biz.varCost) - biz.fixed - monthlyDebt(k + 1); cashPts.push(cash); minCash = Math.min(minCash, cash); });
  if (st.done) return <Reward title="Funding plan ready! 💰" subtitle="Plan Page 05 is in your plan." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Handshake size={22} strokeWidth={2.1} />} title="The Funding Fair 🎪" subtitle={`Visit the funders and raise ${cop(biz.capital)} for ${biz.name}. Every source has a price!`} onExit={onExit}>
      <PageBadge n="05" />
      <div className="g73-startcard small"><em>{biz.e}</em><div><b>{biz.name}</b><small>Capital needed: {cop(biz.capital)} · Profit/month: {cop(profit)}</small></div></div>
      <div className="g73-funders">
        {FUNDERS.map((f) => (
          <div key={f.id} className={`g73-funder ${mix[f.id] > 0 ? "on" : ""}`}>
            <div className="top"><em>{f.e}</em><div><b>{f.n}</b><small>{f.d}</small></div></div>
            <label className="g72-ctrl"><span>Amount</span><button type="button" onClick={() => { setSim(false); setMix({ ...mix, [f.id]: Math.max(0, mix[f.id] - f.step) }); }}><Minus size={14} /></button><input type="range" min={0} max={f.max} step={f.step} value={mix[f.id]} onChange={(e) => { setSim(false); setMix({ ...mix, [f.id]: Number(e.target.value) }); }} /><button type="button" onClick={() => { setSim(false); setMix({ ...mix, [f.id]: Math.min(f.max, mix[f.id] + f.step) }); }}><Plus size={14} /></button><b>{cop(mix[f.id])}</b></label>
            {f.kind === "debt" && mix[f.id] > 0 && <span className="cost">💸 {cop(pay(f.id))}/month for {f.n2} months</span>}
            {f.kind === "equity" && mix[f.id] > 0 && <span className="cost">🦄 You give {Math.round(mix[f.id] / 100000)}% of your company</span>}
            {f.kind === "crowd" && mix[f.id] > 0 && <><span className="cost">🙌 You receive {cop(crowdNet)} after fees and rewards</span><label className="perm-check p1-check"><input type="checkbox" checked={video} onChange={(e) => setVideo(e.target.checked)} /><span>I will make a campaign video</span></label></>}
          </div>
        ))}
        <div className="g73-funder off"><div className="top"><em>🏛️</em><div><b>Seed capital · Fondo Emprender</b><small>🔒 Not for you yet: for eligible people 18+ with SENA requirements and an approved plan. Remember it for the future!</small></div></div></div>
      </div>
      <div className="g73-meters3">
        <div className={covered ? "" : "bad"}><small>Raised / needed</small><b>{cop(raised)} / {cop(biz.capital)}</b></div>
        <div><small>💸 Debt payment / month</small><b>{cop(monthlyDebt(1))}</b></div>
        <div><small>🦄 You own</small><b>{ownership}%</b></div>
        <div className={risk > 50 ? "bad" : ""}><small>⚖️ Debt vs. profit</small><b>{risk}%</b></div>
      </div>
      <p className="start-tip">💡 Tip: the first months are slow (sales start at 55%). Raise a little EXTRA as a cash cushion — and remember that every peso of debt has a monthly payment.</p>
      {mix.crowd > 0 && !video && <div className="p1-hint">💡 Crowdfunding needs a campaign video. Check the box!</div>}
      {covered && (!mix.crowd || video) && !sim && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setSim(true)}><Play size={16} /> Simulate my first 12 months</button></div>}
      {sim && (
        <>
          <LineChart labels={["Start", ...SALES_CURVE.map((_, k) => `M${k + 1}`)]} series={[{ name: "Cash", values: cashPts, color: minCash < 0 ? "#ff6b57" : "#16b074" }]} />
          <div className={`g72-conseq ${minCash >= 0 ? (ownership >= 60 ? "f2" : "f1") : "f0"}`}>
            <b>{minCash < 0 ? "⚠️ Cash crisis!" : ownership < 60 ? "🙂 The business survives… but is it still yours?" : "✅ Your business survives the first year!"}</b>
            <span>{minCash < 0 ? `In a slow month your cash goes down to ${cop(minCash)}. The debt payments are too high for the first months. Try less debt, more savings or an investor.` : `Lowest cash: ${cop(minCash)}. Cost of the money: ${cop(debtCost)}. You own ${ownership}% of ${biz.name}.`}</span>
          </div>
          <div className="start-block"><div className="p3-sentence edit"><span>I chose this funding mix because</span><input className="start-input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Write your reason here…" /></div></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={minCash < 0 || countWords(why) < 5} onClick={() => finish(35, { mix, raised, monthlyDebt: monthlyDebt(1), ownership, debtCost, minCash, why, biz: biz.name })}>Save Plan Page 05 <span className="coin-tag"><Coins size={15} /> +35</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   BLOQUE 6 · CLASE 28 · RISK & BUSINESS PLAN → PAGE 06
   ===================================================================== */
const RISK_QS = [
  { q: "You win $500,000. You…", o: ["save all of it", "save half and test a small idea", "put everything in a new crypto your friend loves"] },
  { q: "Choose a prize:", o: ["$50,000 for sure", "it depends on my mood", "a 50% chance of $150,000"] },
  { q: "Your savings go down 20% in one month. You…", o: ["take the money out immediately", "wait and learn why it happened", "put in even more money"] },
  { q: "For a school project, you prefer…", o: ["a safe topic I know well", "a safe topic with a creative twist", "a totally new, crazy idea"] },
  { q: "Your goal is in 6 months. You keep the money…", o: ["in a savings account", "half in savings, half in a CDT", "in something that can grow a lot (or fall)"] },
  { q: "Starting a business, you would…", o: ["keep my job and start very small", "start small and grow step by step", "put all my money in on day one"] },
  { q: "When you lose a game, you…", o: ["stop playing for a while", "think about what went wrong", "play again immediately, double or nothing"] },
];
const PROFILES = [
  { id: "con", e: "🐢", n: "Conservative", min: 7, d: "You protect your money first. Great for short goals and emergency funds. Risk: your money may grow slowly." },
  { id: "mod", e: "🦊", n: "Moderate", min: 12, d: "You balance safety and growth. You take some risks, but you think first." },
  { id: "bold", e: "🦅", n: "Bold", min: 17, d: "You like big opportunities. Great energy for business! Risk: you can lose a lot — always have a plan B." },
];
const INV_BUCKETS = [{ id: "inv", label: "Investment", icon: "📈", color: "#16b074" }, { id: "exp", label: "Expense", icon: "💨", color: "#e07a2f" }];
const INV_ITEMS = [
  { label: "A new oven that will work for 10 years", answer: "inv", why: "It helps you make money in the future." },
  { label: "A course to make better products", answer: "inv", why: "Your skills produce more money later." },
  { label: "A website for online sales", answer: "inv", why: "It brings future sales." },
  { label: "This month's electricity bill", answer: "exp", why: "It is used and gone." },
  { label: "A party for your birthday", answer: "exp", why: "Fun, but it doesn't produce money." },
  { label: "A taxi to the mall", answer: "exp", why: "Used once and gone." },
];
function RiskProfile({ existing, onSave, onExit }) {
  const [ans, setAns] = useState(existing?.answers || {});
  const [stage, setStage] = useState(0);
  const [scam, setScam] = useState(null);
  const [sortR, setSortR] = useState(null);
  const [st, finish] = useFinish(onSave);
  const score = Object.values(ans).reduce((a, v) => a + v + 1, 0);
  const prof = PROFILES.slice().reverse().find((p) => score >= p.min) || PROFILES[0];
  const deg = clamp(((score - 7) / 14) * 180, 0, 180);
  if (st.done) return <Reward title={`Profile: ${prof.n} ${prof.e}`} subtitle="Know yourself — then choose the right risks." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Gauge size={22} strokeWidth={2.1} />} title="How Risky Are You? 🎢" subtitle="7 situations. There are no wrong answers — be honest!" onExit={onExit}>
      <div className="g72-steps">{["My profile", "Scam check", "Invest or spend?"].map((s, k) => <span key={s} className={k === stage ? "on" : k < stage ? "done" : ""}>{k < stage ? "✓" : k + 1} {s}</span>)}</div>
      {stage === 0 && (
        <>
          {RISK_QS.map((r, i) => (
            <div key={i} className="start-block g73-rq">
              <h3><span className="step-n">{i + 1}</span> {r.q}</h3>
              <div className="p1-starters">{r.o.map((o, k) => <button key={k} type="button" className={`p1-chip ${ans[i] === k ? "on" : ""}`} onClick={() => setAns({ ...ans, [i]: k })}>{o}</button>)}</div>
            </div>
          ))}
          {Object.keys(ans).length === RISK_QS.length && (
            <div className="g73-gauge">
              <div className="dial"><i style={{ transform: `rotate(${deg - 90}deg)` }} /><span className="l">🐢</span><span className="m">🦊</span><span className="r">🦅</span></div>
              <b>{prof.e} {prof.n} · {score} points</b>
              <p>{prof.d}</p>
              <small>⚖️ Remember: more possible return = more risk. Short goals → low risk.</small>
            </div>
          )}
          <div className="start-foot"><button className="s1-btn primary big" disabled={Object.keys(ans).length < RISK_QS.length} onClick={() => setStage(1)}>Next <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 1 && (
        <>
          <div className="g72-scene-card">💬 “Invest $200,000 today and get $1,000,000 next week! 100% guaranteed!”</div>
          <div className="quiz-options">{["It's OK for bold people like me", "It's a scam alert — too good to be true", "Invest only half, to be careful"].map((o, k) => <button key={k} type="button" disabled={scam === 1} className={`quiz-opt ${scam === k ? (k === 1 ? "correct" : "wrong") : ""}`} onClick={() => setScam(k)}><span className="opt-key">{"ABC"[k]}</span><span className="opt-text">{o}</span></button>)}</div>
          {scam !== null && <div className={`p1-banner ${scam === 1 ? "good" : "bad"}`}><span>{scam === 1 ? "✅ Right!" : "⚠️ Careful!"} Being bold is NOT the same as believing promises. “Guaranteed” + huge return + hurry = scam, for every profile.</span></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={scam !== 1} onClick={() => setStage(2)}>Next <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === 2 && (
        <>
          <p className="start-tip">An <b>investment</b> helps you make money in the future. An <b>expense</b> is used and gone.</p>
          {sortR === null ? <SortBuckets buckets={INV_BUCKETS} items={INV_ITEMS} doneLabel="Finish" onDone={(r) => setSortR(r)} /> : (
            <>
              <div className="p1-banner good"><span>✅ {sortR.correct}/{sortR.total} correct.</span></div>
              <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(15 + sortR.correct, { answers: ans, score, profile: prof.n })}>Save my profile <span className="coin-tag"><Coins size={15} /> +21</span></button></div>
            </>
          )}
        </>
      )}
    </ActShell>
  );
}

const RISKS = [
  { id: "sales", e: "📉", t: "Sales are lower than expected", m: ["Start small and test the product first", "Spend more on parties for the team", "Ignore it and wait"], c: 0 },
  { id: "supplier", e: "🏭", t: "The supplier raises prices", m: ["Have a second supplier ready", "Stop selling forever", "Borrow from a gota a gota"], c: 0 },
  { id: "broken", e: "🔧", t: "The main equipment breaks", m: ["Buy a second one with a credit card", "Insurance + a small maintenance fund", "Hope it never happens"], c: 1 },
  { id: "comp", e: "🏪", t: "A competitor opens nearby", m: ["Copy their logo", "Lower the price below the cost", "Improve quality and customer service"], c: 2 },
  { id: "hack", e: "🔓", t: "The business Instagram is hacked", m: ["Strong password + 2FA", "Share the password with the team", "Use the same password everywhere"], c: 0 },
  { id: "sick", e: "🤒", t: "The owner gets sick for 2 weeks", m: ["Close and never open again", "Train a helper + emergency fund", "Work while sick"], c: 1 },
];
function BreakEvenLab({ resp, onSave, onExit }) {
  const biz0 = getBiz(resp);
  const [price, setPrice] = useState(biz0.price);
  const [vc, setVc] = useState(biz0.varCost);
  const [fixed, setFixed] = useState(biz0.fixed);
  const [units, setUnits] = useState(0);
  const [okBE, setOkBE] = useState(false);
  const [lowered, setLowered] = useState(false);
  const [war, setWar] = useState(null);
  const [stage, setStage] = useState(0);
  const [place, setPlace] = useState({});
  const [mit, setMit] = useState({});
  const [st, finish] = useFinish(onSave);
  const be0 = breakEven(biz0);
  const b = okBE ? { ...biz0, price, varCost: vc, fixed } : biz0;
  const be = breakEven(b);
  useEffect(() => { if (okBE && be <= Math.floor(be0 * 0.8)) setLowered(true); }, [be, okBE, be0]);
  useEffect(() => { if (!okBE && units === be0) setOkBE(true); }, [units, okBE, be0]);
  const maxU = Math.round(Math.max(biz0.units, isFinite(be0) ? be0 * 1.6 : biz0.units));
  const steps = 8;
  const xs = Array.from({ length: steps + 1 }, (_, k) => Math.round((maxU * k) / steps));
  const allRisks = RISKS.every((r) => place[r.id]?.p && place[r.id]?.i && mit[r.id] !== undefined);
  const mitOk = RISKS.filter((r) => mit[r.id] === r.c).length;
  const sales = units * b.price, costs = b.fixed + units * b.varCost, prof = sales - costs;
  if (st.done) return <Reward title="Break-even pro! ⚖️" subtitle="You know when your business starts to win." coins={st.coins} saving={st.saving} onExit={onExit} />;
  const Ctl = ({ l, v, set, mn, mx, stp, fmt = cop }) => (
    <label className="g72-ctrl"><span>{l}</span><button type="button" onClick={() => set(Math.max(mn, v - stp))}><Minus size={14} /></button><input type="range" min={mn} max={mx} step={stp} value={v} onChange={(e) => set(Number(e.target.value))} /><button type="button" onClick={() => set(Math.min(mx, v + stp))}><Plus size={14} /></button><b>{fmt(v)}</b></label>
  );
  return (
    <ActShell icon={<Scale size={22} strokeWidth={2.1} />} title="Break-even Lab + Risk Map ⚖️" subtitle={`${biz0.e} ${biz0.name}: when do you stop losing and start winning?`} onExit={onExit}>
      <div className="g72-steps"><span className={stage === 0 ? "on" : "done"}>{stage ? "✓" : 1} Break-even</span><span className={stage === 1 ? "on" : ""}>2 Risk map</span></div>
      {stage === 0 ? (
        <>
          <div className="g72-howto">
            <b>How it works</b>
            <span>📈 <b>Green line</b> = the money from your sales. It starts at $0 and grows with every {biz0.unit}.</span>
            <span>📉 <b>Red line</b> = your total costs. It starts at your fixed costs ({cop(biz0.fixed)}) and grows a little with every {biz0.unit}.</span>
            <span>🎯 Where the lines CROSS = the <b>break-even point</b>: profit is $0. Before it you lose money; after it you win.</span>
          </div>
          <div className="g73-mission big">
            <b>{okBE ? "✅" : "1️⃣"} Mission 1 · Find the crossing point</b>
            <span>Move the <b>units sold</b> slider. Find the FIRST number of {biz0.unit}s where the profit stops being negative.</span>
            {Ctl({ l: `📦 ${biz0.unit}s sold`, v: units, set: (v) => !okBE && setUnits(v), mn: 0, mx: maxU, stp: 1, fmt: (v) => String(v) })}
            <div className="g73-be3">
              <div><small>💵 Sales</small><b>{cop(sales)}</b><span>{units} × {cop(b.price)}</span></div>
              <div><small>🧾 Total costs</small><b>{cop(costs)}</b><span>{cop(b.fixed)} + {units} × {cop(b.varCost)}</span></div>
              <div className={prof >= 0 ? "ok" : "bad"}><small>{prof >= 0 ? "😀 Profit" : "😟 Loss"}</small><b>{cop(prof)}</b><span>Sales − costs</span></div>
            </div>
            {!okBE && units > be0 && <div className="p1-hint">💡 Profit is positive — but is this the FIRST {biz0.unit}? Go back a little.</div>}
            {okBE && <div className="g72-conseq f2"><b>🎯 You found it: {be0} {biz0.unit}s!</b><span>Check it with the formula: {cop(biz0.fixed)} ÷ ({cop(biz0.price)} − {cop(biz0.varCost)}) = {(biz0.fixed / (biz0.price - biz0.varCost)).toFixed(1)} → round UP = <b>{be0}</b>. Each {biz0.unit} leaves {cop(biz0.price - biz0.varCost)} to pay the fixed costs.</span></div>}
          </div>
          <LineChart labels={xs.map(String)} series={[{ name: "Sales", values: xs.map((u) => u * b.price), color: "#16b074" }, { name: "Total costs", values: xs.map((u) => b.fixed + u * b.varCost), color: "#ff6b57" }]} yMin={0} />
          <ChartLegend series={[{ name: `Sales (x = ${biz0.unit}s sold)`, color: "#16b074" }, { name: "Total costs", color: "#ff6b57" }]} />
          {okBE && (
            <div className="g73-mission big">
              <b>{lowered ? "✅" : "2️⃣"} Mission 2 · Make your business safer</b>
              <span>Change the price, the cost or the fixed costs to LOWER the break-even to <b>{Math.floor(be0 * 0.8)} {biz0.unit}s or less</b>. Tip: a cheaper supplier, a smaller place or a slightly higher price.</span>
              {Ctl({ l: "🏷️ Price", v: price, set: setPrice, mn: Math.round(biz0.price * 0.5), mx: Math.round(biz0.price * 1.8), stp: Math.max(100, Math.round(biz0.price * 0.05 / 100) * 100) })}
              {Ctl({ l: "🧾 Cost / unit", v: vc, set: setVc, mn: Math.round(biz0.varCost * 0.5), mx: Math.round(biz0.varCost * 1.5), stp: Math.max(100, Math.round(biz0.varCost * 0.05 / 100) * 100) })}
              {Ctl({ l: "🏠 Fixed / month", v: fixed, set: setFixed, mn: Math.round(biz0.fixed * 0.5), mx: Math.round(biz0.fixed * 1.5), stp: 50000 })}
              <div className="g72-machine-out"><div><small>New break-even</small><b>{isFinite(be) ? `${be} ${biz0.unit}s` : "Impossible!"}</b></div><div><small>Before</small><b>{be0} {biz0.unit}s</b></div></div>
            </div>
          )}
          {lowered && (
            <div className="g73-mission big">
              <b>{war === 1 ? "✅" : "3️⃣"} Mission 3 · Price war</b>
              <span>A competitor opens next door and you must LOWER your price. What happens to your break-even?</span>
              <div className="p1-starters">{["it goes down", "it goes up", "it stays the same"].map((o, k) => <button key={o} type="button" disabled={war === 1} className={`p1-chip ${war === k ? (k === 1 ? "ok" : "no") : ""}`} onClick={() => setWar(k)}>{o}</button>)}</div>
              {war !== null && <div className={`p1-banner ${war === 1 ? "good" : "bad"}`}><span>{war === 1 ? "✅ Right! Each unit leaves less money, so you must sell MORE to cover the same fixed costs." : "Think: a lower price leaves less money per unit… Try again!"}</span></div>}
            </div>
          )}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!okBE || !lowered || war !== 1} onClick={() => setStage(1)}>Next: risk map <ChevronRight size={18} /></button></div>
        </>
      ) : (
        <>
          <p className="start-tip">For each risk: how <b>probable</b> is it? How big is the <b>impact</b>? Then choose the best way to reduce it.</p>
          <div className="g73-matrix">
            {[["high", "low"], ["high", "high"], ["low", "low"], ["low", "high"]].map(([p, i]) => (
              <div key={p + i} className={`cell p${p} i${i}`}><small>{p === "high" ? "Probable" : "Not probable"} · {i === "high" ? "Big impact" : "Small impact"}</small><div>{RISKS.filter((r) => place[r.id]?.p === p && place[r.id]?.i === i).map((r) => <span key={r.id}>{r.e}</span>)}</div></div>
            ))}
          </div>
          {RISKS.map((r) => (
            <div key={r.id} className="start-block g73-riskrow">
              <h3>{r.e} {r.t}</h3>
              <div className="g73-pi">
                <div className="p1-starters"><span className="terms-label">Probability:</span>{["low", "high"].map((v) => <button key={v} type="button" className={`p1-chip ${place[r.id]?.p === v ? "on" : ""}`} onClick={() => setPlace({ ...place, [r.id]: { ...place[r.id], p: v } })}>{v}</button>)}</div>
                <div className="p1-starters"><span className="terms-label">Impact:</span>{["low", "high"].map((v) => <button key={v} type="button" className={`p1-chip ${place[r.id]?.i === v ? "on" : ""}`} onClick={() => setPlace({ ...place, [r.id]: { ...place[r.id], i: v } })}>{v}</button>)}</div>
              </div>
              <div className="p1-starters">{r.m.map((o, k) => <button key={k} type="button" className={`p1-chip ${mit[r.id] === k ? (k === r.c ? "ok" : "no") : ""}`} onClick={() => setMit({ ...mit, [r.id]: k })}>{o}</button>)}</div>
            </div>
          ))}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!allRisks || mitOk < RISKS.length} onClick={() => finish(30, { be: be0, newBE: be, price, varCost: vc, fixed, risks: RISKS.map((r) => ({ t: r.t, ...place[r.id], m: r.m[r.c] })) })}>{allRisks && mitOk < RISKS.length ? "Fix the red mitigations" : "Save my lab"} <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* Bank Pitch: pide un préstamo y el banco decide */
const PURPOSES = [{ id: "equip", l: "🧰 Equipment" }, { id: "work", l: "📦 Materials and first months" }, { id: "mkt", l: "📣 Marketing" }, { id: "trip", l: "🏖️ A trip to celebrate" }];
const MITIG = ["A business emergency fund", "Insurance for the equipment", "A second way to sell (online + market)", "A helper trained to replace me"];
const PITCH_Q = [{ k: "a", f: "My business solves this problem:" }, { k: "b", f: "Customers will buy because" }, { k: "c", f: "I will repay the loan with" }];
function BankPitch({ resp, existing, onSave, onExit }) {
  const biz = getBiz(resp);
  const be = breakEven(biz);
  const [amount, setAmount] = useState(Math.round((biz.capital * 0.6) / 100000) * 100000);
  const [term, setTerm] = useState(24);
  const [purpose, setPurpose] = useState(null);
  const [own, setOwn] = useState(10);
  const [mits, setMits] = useState([]);
  const [txt, setTxt] = useState({ a: "", b: "", c: "" });
  const [verdict, setVerdict] = useState(null);
  const [tries, setTries] = useState(0);
  const [st, finish] = useFinish(onSave);
  const rate = 0.02;
  const inst = Math.round(pmt(amount, rate, term));
  const profit = bizProfit(biz);
  const crit = [
    { t: "Productive purpose", ok: purpose && purpose !== "trip", why: "Banks lend for things that help the business make money — not for a trip." },
    { t: "Capacity to pay", ok: profit > 0 && inst <= profit * 0.4, why: `The installment (${cop(inst)}) must be 40% or less of your monthly profit (${cop(profit)}). Ask for less or choose a longer term.` },
    { t: "Realistic sales", ok: biz.units >= be * 1.2, why: `You expect ${biz.units} ${biz.unit}s, and your break-even is ${be}. The bank wants 20% more than break-even. Go back to Startup Studio and adjust your price.` },
    { t: "Owner contribution", ok: own >= 20, why: "Put in at least 20% of your own money. The bank wants to see that you also take a risk." },
    { t: "Risk plan", ok: mits.length >= 2, why: "Show at least 2 ways to reduce risks." },
    { t: "Clear pitch", ok: PITCH_Q.every((q) => countWords(txt[q.k]) >= 4), why: "Answer the 3 pitch questions (4+ words each)." },
  ];
  const fails = crit.filter((c) => !c.ok);
  const decide = () => { setTries(tries + 1); setVerdict(fails.length === 0 ? "approve" : fails.length === 1 && crit[0].ok ? "cond" : "reject"); };
  if (st.done) return <Reward title="Loan approved! 🏦" subtitle="Plan Page 06 is in your plan." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Landmark size={22} strokeWidth={2.1} />} title="The Bank Pitch 🏦" subtitle={`Ask CREAR Bank for a loan for ${biz.name}. The bank will decide!`} onExit={onExit}>
      <PageBadge n="06" />
      <div className="g73-startcard small"><em>{biz.e}</em><div><b>{biz.name}</b><small>Profit/month {cop(profit)} · Break-even {be} {biz.unit}s · Expected {biz.units}</small></div></div>
      <div className="g73-loanform">
        <div className="start-block">
          <h3><span className="step-n">1</span> Loan request</h3>
          <label className="g72-ctrl"><span>💰 Amount</span><button type="button" onClick={() => { setVerdict(null); setAmount(Math.max(500000, amount - 100000)); }}><Minus size={14} /></button><input type="range" min={500000} max={Math.max(1000000, Math.round(biz.capital * 1.2 / 100000) * 100000)} step={100000} value={amount} onChange={(e) => { setVerdict(null); setAmount(Number(e.target.value)); }} /><button type="button" onClick={() => { setVerdict(null); setAmount(amount + 100000); }}><Plus size={14} /></button><b>{cop(amount)}</b></label>
          <div className="p1-starters"><span className="terms-label">Term:</span>{[6, 12, 24, 36].map((t) => <button key={t} type="button" className={`p1-chip ${term === t ? "on" : ""}`} onClick={() => { setVerdict(null); setTerm(t); }}>{t} months</button>)}</div>
          <p className="start-tip">Installment at 2% a month: <b>{cop(inst)}</b> · Total to repay: <b>{cop(inst * term)}</b></p>
          <div className="p1-starters"><span className="terms-label">Purpose:</span>{PURPOSES.map((p) => <button key={p.id} type="button" className={`p1-chip ${purpose === p.id ? "on" : ""}`} onClick={() => { setVerdict(null); setPurpose(p.id); }}>{p.l}</button>)}</div>
          <label className="g72-ctrl"><span>🐷 My own money</span><button type="button" onClick={() => { setVerdict(null); setOwn(Math.max(0, own - 5)); }}><Minus size={14} /></button><input type="range" min={0} max={60} step={5} value={own} onChange={(e) => { setVerdict(null); setOwn(Number(e.target.value)); }} /><button type="button" onClick={() => { setVerdict(null); setOwn(Math.min(60, own + 5)); }}><Plus size={14} /></button><b>{own}%</b></label>
        </div>
        <div className="start-block">
          <h3><span className="step-n">2</span> My risk plan</h3>
          <div className="g72-opts">{MITIG.map((m) => <button key={m} type="button" className={`g72-opt ${mits.includes(m) ? "on" : ""}`} onClick={() => { setVerdict(null); setMits(mits.includes(m) ? mits.filter((x) => x !== m) : [...mits, m]); }}><em>{mits.includes(m) ? "☑️" : "⬜"}</em><span>{m}</span></button>)}</div>
          <h3><span className="step-n">3</span> My pitch</h3>
          {PITCH_Q.map((q) => <div key={q.k} className="p3-sentence edit"><span>{q.f}</span><input className="start-input" value={txt[q.k]} onChange={(e) => { setVerdict(null); setTxt({ ...txt, [q.k]: e.target.value }); }} placeholder="Write your answer here…" /></div>)}
        </div>
      </div>
      {!verdict && <div className="start-foot"><button className="s1-btn primary big" onClick={decide}><Send size={16} /> Send to the bank</button></div>}
      {verdict && (
        <>
          <div className={`g72-stamp ${verdict === "approve" ? "approve" : verdict === "cond" ? "info" : "reject"}`}>{verdict === "approve" ? "APPROVED" : verdict === "cond" ? "CONDITIONAL" : "REJECTED"}</div>
          <div className="g73-crit">{crit.map((c) => <div key={c.t} className={c.ok ? "ok" : "no"}><b>{c.ok ? "✅" : "❌"} {c.t}</b>{!c.ok && <span>{c.why}</span>}</div>)}</div>
          {verdict !== "approve" && <div className="p1-banner"><span>🏦 “Fix the red points and send your request again. Many real entrepreneurs hear ‘no’ before ‘yes’!”</span></div>}
          {verdict === "approve" && <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(25 + Math.max(0, 15 - (tries - 1) * 5), { amount, term, inst, purpose, own, mits, pitch: txt, tries, be, decision: "approved" })}>Save Plan Page 06 <span className="coin-tag"><Coins size={15} /> +40</span></button></div>}
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   BLOQUE 7 · CLASES 29–30 · DIGITAL TOOLS: MY MONEY APP → PAGE 07
   ===================================================================== */

const DATA_BUCKETS = [{ id: "need", label: "Needed", icon: "✅", color: "#16b074" }, { id: "perm", label: "Only with permission", icon: "🤝", color: "#c9902a" }, { id: "never", label: "Never ask", icon: "🚫", color: "#ff6b57" }];
const DATA_ITEMS = [
  { label: "Full name", answer: "need", why: "To know who the client is." },
  { label: "Email or phone to log in", answer: "need", why: "To access the account and send alerts." },
  { label: "ID number to open an account", answer: "need", why: "Financial apps must verify identity." },
  { label: "Monthly income — only to request a loan", answer: "perm", why: "Only for that service, with permission." },
  { label: "Location — only to find ATMs nearby", answer: "perm", why: "Only when the user wants that feature." },
  { label: "Camera — only to scan QR codes", answer: "perm", why: "Only when scanning." },
  { label: "Religion or political party", answer: "never", why: "Sensitive data a money app doesn't need." },
  { label: "Your social media passwords", answer: "never", why: "Nobody should ask for this." },
  { label: "Your full contact list", answer: "never", why: "A money app doesn't need it." },
  { label: "Your PIN, in the support chat", answer: "never", why: "Real support never asks for your PIN." },
];

const APP_COLORS = ["#0b7a50", "#16b074", "#c9902a", "#e07a2f", "#ff6b57", "#0c3d2c"];
const APP_LOGOS = ["🏦", "🐷", "🚀", "🦊", "💎", "🌱", "⚡", "🦉"];
const APP_FEATS = [
  { id: "budget", e: "📊", l: "Budget tracker", c: 15 },
  { id: "pockets", e: "🐷", l: "Savings pockets", c: 10 },
  { id: "qr", e: "📷", l: "QR payments", c: 15 },
  { id: "loans", e: "💸", l: "Small loans", c: 20 },
  { id: "tips", e: "💡", l: "Money tips", c: 5 },
  { id: "alerts", e: "🔔", l: "Alerts for every movement", c: 10, sec: true },
  { id: "tfa", e: "🛡️", l: "2FA login", c: 15, sec: true },
  { id: "bio", e: "👆", l: "Fingerprint / face login", c: 15, sec: true },
  { id: "enc", e: "🔐", l: "Data encryption", c: 20, sec: true },
  { id: "lock", e: "🔒", l: "Card lock button", c: 10, sec: true },
];
const SIGNUP = [
  { id: "name", l: "Full name", ok: "need" }, { id: "mail", l: "Email / phone", ok: "need" }, { id: "idn", l: "ID number (to open an account)", ok: "opt" },
  { id: "income", l: "Income (only for loans)", ok: "opt" }, { id: "religion", l: "Religion", ok: "never" }, { id: "contacts", l: "Contact list", ok: "never" }, { id: "social", l: "Instagram password", ok: "never" },
];
const DEFAULT_APP = { name: "CREAR Wallet", logo: "🏦", color: "#0b7a50", features: ["budget", "pockets", "alerts", "tfa", "enc"], data: ["name", "mail", "idn"] };
const getApp = (resp) => resp?.c29_design?.app || DEFAULT_APP;

function AppDesigner({ existing, onSave, onExit }) {
  const ex = existing?.app;
  const [name, setName] = useState(ex?.name || "");
  const [logo, setLogo] = useState(ex?.logo || "🏦");
  const [color, setColor] = useState(ex?.color || APP_COLORS[0]);
  const [feats, setFeats] = useState(ex?.features || []);
  const [data, setData] = useState(ex?.data || ["name", "mail"]);
  const [slogan, setSlogan] = useState(ex?.slogan || "");
  const [st, finish] = useFinish(onSave);
  const sec = feats.filter((id) => APP_FEATS.find((f) => f.id === id).sec).length;
  const badData = data.filter((id) => SIGNUP.find((s) => s.id === id).ok === "never");
  const toggleF = (f) => setFeats(feats.includes(f.id) ? feats.filter((x) => x !== f.id) : [...feats, f.id]);
  const toggleD = (s) => { if (s.ok === "need") return; setData(data.includes(s.id) ? data.filter((x) => x !== s.id) : [...data, s.id]); };
  const checks = [
    { t: "Your app has a name", ok: name.trim().length >= 2 },
    { t: "Your app has a slogan", ok: slogan.trim().length >= 3 },
    { t: "At least 3 features", ok: feats.length >= 3 },
    { t: "The sign-up form doesn't ask for forbidden data", ok: badData.length === 0 },
  ];
  const ok = checks.every((c) => c.ok);
  if (st.done) return <Reward title="App launched! 📱" subtitle="Plan Page 07 is in your plan." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Palette size={22} strokeWidth={2.1} />} title="My Money App 📱" subtitle="Design the digital bank YOU would use. Choose ANY features you want!" onExit={onExit}>
      <PageBadge n="07" />
      <div className="g72-howto">
        <b>How it works</b>
        <span>1️⃣ Give your app a name, a slogan, a logo and a color.</span>
        <span>2️⃣ Choose the features you like (as many as you want). 🛡️ = security feature.</span>
        <span>3️⃣ Decide which data your sign-up form asks for. Careful: some data must NEVER be asked!</span>
        <span>⚠️ In the next activity, hackers will attack your app. Only the 🛡️ features you choose will protect your users!</span>
      </div>
      <div className="g73-studio">
        <div>
          <div className="start-block">
            <h3><span className="step-n">1</span> Brand</h3>
            <input className="start-input p3-gap" value={name} onChange={(e) => setName(e.target.value)} placeholder="App name" />
            <input className="start-input p3-gap" value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="Slogan" />
            <div className="p1-starters">{APP_LOGOS.map((l) => <button key={l} type="button" className={`p1-chip big ${logo === l ? "on" : ""}`} onClick={() => setLogo(l)}>{l}</button>)}</div>
            <div className="g73-swatches">{APP_COLORS.map((c) => <button key={c} type="button" className={color === c ? "on" : ""} style={{ background: c }} onClick={() => setColor(c)} aria-label={c} />)}</div>
          </div>
          <div className="start-block">
            <h3><span className="step-n">2</span> Features ({feats.length} chosen · {sec} 🛡️)</h3>
            <div className="g72-opts">{APP_FEATS.map((f) => <button key={f.id} type="button" className={`g72-opt ${feats.includes(f.id) ? "on" : ""}`} onClick={() => toggleF(f)}><em>{f.e}</em><span>{f.l}{f.sec ? " · 🛡️" : ""}</span></button>)}</div>
            {sec < 2 && feats.length > 0 && <p className="start-tip">💡 You have {sec} security feature(s). You can continue — but your app may be weak against hackers.</p>}
          </div>
          <div className="start-block">
            <h3><span className="step-n">3</span> Sign-up form: which data will you ask?</h3>
            <div className="g72-opts">{SIGNUP.map((s) => <button key={s.id} type="button" className={`g72-opt ${data.includes(s.id) ? "on" : ""} ${data.includes(s.id) && s.ok === "never" ? "bad" : ""}`} onClick={() => toggleD(s)}><em>{s.ok === "need" ? "🔒" : data.includes(s.id) ? "☑️" : "⬜"}</em><span>{s.l}{s.ok === "need" ? " · always needed" : ""}</span></button>)}</div>
            {badData.length > 0 && <div className="g72-conseq f0"><b>⚠️ Data minimization!</b><span>A money app must NOT ask for: {badData.map((id) => SIGNUP.find((s) => s.id === id).l).join(", ")}. Tap them again to remove them.</span></div>}
          </div>
        </div>
        <div className="g73-preview">
          <AppPhone color={color} name={name} logo={logo}>
            <div className="g73-app-hello"><small>{slogan || "Your slogan here"}</small><b>Hi! Your balance</b><strong>$250,000</strong></div>
            <div className="g73-app-tiles">{feats.length ? feats.map((id) => { const f = APP_FEATS.find((x) => x.id === id); return <span key={id}><em>{f.e}</em>{f.l}</span>; }) : <i>Choose features →</i>}</div>
            <div className="g73-app-form"><small>Sign up</small>{data.map((id) => <span key={id} className={SIGNUP.find((s) => s.id === id).ok === "never" ? "bad" : ""}>{SIGNUP.find((s) => s.id === id).l}</span>)}</div>
          </AppPhone>
        </div>
      </div>
      <div className="g73-checklist">{checks.map((c) => <span key={c.t} className={c.ok ? "ok" : ""}>{c.ok ? "✅" : "⬜"} {c.t}</span>)}</div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(35, { app: { name, logo, color, features: feats, data, slogan } })}>{ok ? "Launch my app" : `${checks.filter((c) => c.ok).length}/4 ready`} <span className="coin-tag"><Coins size={15} /> +35</span></button></div>
    </ActShell>
  );
}

const APPLICANTS = [
  { id: 1, e: "🧁", n: "Valentina, 24", p: "An oven for her bakery", inc: 2400000, debt: 200000, hist: "good", amt: 3000000, term: 12, safe: true },
  { id: 2, e: "🎮", n: "Andrés, 19", p: "A new gaming PC", inc: 900000, debt: 300000, hist: "late", amt: 4000000, term: 12, safe: false },
  { id: 3, e: "🥘", n: "Doña Luz, 52", p: "Tables for her restaurant", inc: 3200000, debt: 400000, hist: "good", amt: 2000000, term: 12, safe: true },
  { id: 4, e: "🏍️", n: "Kevin, 30", p: "A motorbike for delivery work", inc: 1800000, debt: 150000, hist: "none", amt: 2500000, term: 24, safe: true },
  { id: 5, e: "✈️", n: "Paula, 27", p: "A vacation in Cancún", inc: 2000000, debt: 900000, hist: "good", amt: 5000000, term: 12, safe: false },
  { id: 6, e: "💻", n: "Mateo, 22", p: "A laptop for freelance design", inc: 1500000, debt: 0, hist: "none", amt: 1800000, term: 12, safe: true },
  { id: 7, e: "🏪", n: "Mr. Ortiz, 45", p: "More stock for his shop", inc: 4500000, debt: 2800000, hist: "late", amt: 6000000, term: 12, safe: false },
  { id: 8, e: "🎓", n: "Sara, 20", p: "A course to become a barista", inc: 1300000, debt: 100000, hist: "none", amt: 1200000, term: 12, safe: true },
  { id: 9, e: "📱", n: "Brayan, 23", p: "The newest phone to show his friends", inc: 1600000, debt: 600000, hist: "late", amt: 4500000, term: 12, safe: false },
];
const HIST = { good: "✅ Always pays on time", none: "🆕 No credit history yet", late: "⚠️ Late payments reported" };
const RATES = [{ r: 1.6, l: "1.6% · cheap" }, { r: 2.2, l: "2.2% · fair" }, { r: 3.5, l: "3.5% · very high" }];
const ATTACKS = [
  { id: "phish", e: "🎣", t: "A phishing wave: fake emails ask your users for their passwords.", def: ["tfa", "alerts"], ok: "2FA/alerts stopped the criminals!", bad: "Some accounts were stolen. Users are angry." },
  { id: "leak", e: "💾", t: "Hackers steal a copy of your database.", def: ["enc"], ok: "The data was encrypted — the hackers can't read it!", bad: "Personal data was exposed. You must inform the users and the authorities." },
  { id: "phone", e: "📱", t: "A user's phone is stolen with the app open.", def: ["bio", "lock"], ok: "Biometric login / card lock protected the money!", bad: "The thief made payments from the app." },
];
function RunFintech({ resp, onSave, onExit }) {
  const app = getApp(resp);
  const [i, setI] = useState(0);
  const [rate, setRate] = useState(2.2);
  const [dec, setDec] = useState({});
  const [stage, setStage] = useState("loans");
  const [atk, setAtk] = useState(0);
  const [st, finish] = useFinish(onSave);
  const A = APPLICANTS[i];
  const inst = Math.round(pmt(A.amt, rate / 100, A.term));
  const ratio = Math.round(((A.debt + inst) / A.inc) * 100);
  const decide = (approve) => {
    setDec({ ...dec, [A.id]: { approve, rate } });
    if (i < APPLICANTS.length - 1) { setI(i + 1); setRate(2.2); } else setStage("results");
  };
  const outcome = (a) => {
    const d = dec[a.id]; if (!d) return null;
    if (!d.approve) return a.safe ? { profit: 0, txt: "Rejected a good client. No profit — they went to another bank.", good: false } : { profit: 0, txt: "Good call: this loan would not be repaid.", good: true };
    if (d.rate > 3) return { profit: 0, txt: "Rate above the legal limit (usury)! The loan is illegal. 🚨", good: false, illegal: true };
    if (!a.safe) return { profit: -Math.round(a.amt * 0.6), txt: "The client stopped paying. You lost money.", good: false };
    return { profit: Math.round(pmt(a.amt, d.rate / 100, a.term) * a.term - a.amt), txt: d.rate < 2 ? "Paid on time. Low rate = happy client, smaller profit." : "Paid on time. Fair rate, fair profit.", good: true };
  };
  const outs = APPLICANTS.map((a) => ({ a, o: outcome(a) }));
  const profit = outs.reduce((s, x) => s + (x.o?.profit || 0), 0);
  const goodDec = outs.filter((x) => x.o?.good).length;
  const defended = ATTACKS.filter((t) => t.def.some((f) => app.features.includes(f))).length;
  const trust = clamp(40 + goodDec * 6 + defended * 10 - outs.filter((x) => x.o?.illegal).length * 15, 0, 100);
  if (st.done) return <Reward title={`${app.name} is a success! 🏦`} subtitle="You lent responsibly and protected your users." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Database size={22} strokeWidth={2.1} />} title={`Run ${app.name} ${app.logo}`} subtitle="Your app is live! Virtual users ask for loans. Then the hackers arrive…" onExit={onExit}>
      <div className="g72-steps">{["Loan requests", "Results", "Cyber attacks", "Bank report"].map((s, k) => <span key={s} className={["loans", "results", "attacks", "report"].indexOf(stage) === k ? "on" : ["loans", "results", "attacks", "report"].indexOf(stage) > k ? "done" : ""}>{s}</span>)}</div>
      {stage === "loans" && (
        <>
          {i === 0 && (
            <div className="g72-howto">
              <b>How to decide like a responsible lender</b>
              <span>1️⃣ <b>Purpose:</b> does the money help the person earn money or improve their life (work, study)? Or is it a luxury?</span>
              <span>2️⃣ <b>Debt / income:</b> current payments + the new installment should be <b>40% of income or less</b>.</span>
              <span>3️⃣ <b>History:</b> late payments are a warning. “No history” is not bad — everybody starts somewhere.</span>
              <span>4️⃣ <b>Rate:</b> fair rates keep good clients. Rates above the legal limit (usury) are illegal.</span>
            </div>
          )}
          <div className="p1-match-stats"><span>Request <b>{i + 1}/{APPLICANTS.length}</b></span><span>📏 Rule: total debt payments ≤ 40% of income · legal limit ≈ 2.9% a month</span></div>
          <div className="g73-applicant" style={{ "--ac": app.color }}>
            <div className="top"><em>{A.e}</em><div><b>{A.n}</b><small>Wants {cop(A.amt)} for {A.term} months · {A.p}</small></div></div>
            <div className="g73-appstats">
              <span><small>Income / month</small><b>{cop(A.inc)}</b></span>
              <span><small>Current debt payments</small><b>{cop(A.debt)}</b></span>
              <span><small>New installment</small><b>{cop(inst)}</b></span>
              <span className={ratio > 40 ? "bad" : "ok"}><small>Debt / income</small><b>{ratio}%</b></span>
              <span className="wide"><small>Credit history</small><b>{HIST[A.hist]}</b></span>
            </div>
          </div>
          <div className="p1-starters"><span className="terms-label">Interest rate:</span>{RATES.map((r) => <button key={r.r} type="button" className={`p1-chip ${rate === r.r ? "on" : ""}`} onClick={() => setRate(r.r)}>{r.l}</button>)}</div>
          {rate > 3 && <div className="p1-hint">⚠️ This rate is above the legal limit (tasa de usura) in this game!</div>}
          <div className="g72-decide g73-dec">
            <button type="button" className="g72-stamp-btn approve" onClick={() => decide(true)}><em>✅</em>Approve</button>
            <button type="button" className="g72-stamp-btn reject" onClick={() => decide(false)}><em>❌</em>Reject</button>
          </div>
        </>
      )}
      {stage === "results" && (
        <>
          <div className="g73-table">
            <div className="h"><span>Client</span><span>Decision</span><span>What happened</span></div>
            {outs.map(({ a, o }) => <div key={a.id} className={o.good ? "" : "bad"}><span>{a.e} {a.n}</span><span>{dec[a.id].approve ? `✅ ${dec[a.id].rate}%` : "❌"}</span><span><small>{o.txt}</small> <b className={o.profit < 0 ? "neg" : ""}>{o.profit ? cop(o.profit) : ""}</b></span></div>)}
          </div>
          <div className={`g72-conseq ${profit > 0 ? "f2" : "f0"}`}><b>{profit > 0 ? `✅ Profit: ${cop(profit)}` : `⚠️ Loss: ${cop(profit)}`}</b><span>{goodDec}/{APPLICANTS.length} good decisions. A responsible lender checks the purpose, the debt/income ratio and the history.</span></div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStage("attacks")}>⚠️ Something is happening… <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === "attacks" && (
        <>
          {ATTACKS.slice(0, atk + 1).map((t) => { const okD = t.def.some((f) => app.features.includes(f)); return (
            <div key={t.id} className={`g73-attack ${okD ? "ok" : "bad"}`}><em>{t.e}</em><div><b>{t.t}</b><span>{okD ? `🛡️ ${t.ok}` : `💥 ${t.bad}`}</span></div></div>
          ); })}
          <div className="start-foot">{atk < ATTACKS.length - 1 ? <button className="s1-btn primary big" onClick={() => setAtk(atk + 1)}>Next attack <ChevronRight size={18} /></button> : <button className="s1-btn primary big" onClick={() => setStage("report")}>See my bank report <ChevronRight size={18} /></button>}</div>
        </>
      )}
      {stage === "report" && (
        <>
          <div className="g73-bankreport" style={{ "--ac": app.color }}>
            <header><em>{app.logo}</em><div><b>{app.name} · Year 1 report</b><small>{app.slogan || "Your digital bank"}</small></div></header>
            <div className="g73-meters3">
              <div className={profit < 0 ? "bad" : ""}><small>💰 Profit</small><b>{cop(profit)}</b></div>
              <div><small>✅ Good decisions</small><b>{goodDec}/{APPLICANTS.length}</b></div>
              <div><small>🛡️ Attacks stopped</small><b>{defended}/3</b></div>
              <div><small>🤝 User trust</small><b>{trust}%</b></div>
            </div>
            {defended < 3 && <p className="start-tip">💡 Next time, add the security features that were missing in your design.</p>}
          </div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(20 + goodDec * 2 + defended * 1, { profit, goodDec, defended, trust })}>Close the year <span className="coin-tag"><Coins size={15} /> +37</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   BLOQUE 8 · CLASES 31–32 · FINANCIAL PLAN SHOWCASE → PAGE 08
   ===================================================================== */
const loadHtml2Canvas = () => (window.html2canvas ? Promise.resolve(window.html2canvas) : new Promise((res, rej) => {
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  s.onload = () => res(window.html2canvas); s.onerror = rej;
  document.body.appendChild(s);
}));
const PROMISES = [{ k: "a", f: "In one year, I will" }, { k: "b", f: "My most important money rule is" }, { k: "c", f: "For me, financial wellbeing means" }];
function FinalPlan({ resp, studentName, existing, onSave, onExit }) {
  const r = resp || {};
  const [txt, setTxt] = useState(existing?.promises || { a: "", b: "", c: "" });
  const [busy, setBusy] = useState(false);
  const [st, finish] = useFinish(onSave);
  const pages = PLAN_PAGES.slice(0, 7).filter((p) => r[p.key]).length;
  const ready = pages >= 5 && PROMISES.every((p) => countWords(txt[p.k]) >= 4);
  const b = r.c22_remix, g = r.c23_smart, c = r.c24_rules, f = r.c25_plan, fu = r.c27_fund, pi = r.c28_pitch, ap = r.c29_design?.app, biz = getBiz(r), be = r.c28_breakeven, risk = r.c28_risk;
  const png = async () => { setBusy(true); try { const h2c = await loadHtml2Canvas(); const cv = await h2c(document.getElementById("g73-final"), { scale: 2, backgroundColor: "#ffffff", useCORS: true }); const a = document.createElement("a"); a.href = cv.toDataURL("image/png"); a.download = `Financial_Plan_${(studentName || "student").replace(/\s+/g, "_")}.png`; a.click(); } catch (e) { /* sin imagen */ } setBusy(false); };
  const print = () => { document.body.classList.add("g73-printing"); const off = () => { document.body.classList.remove("g73-printing"); window.removeEventListener("afterprint", off); }; window.addEventListener("afterprint", off); setTimeout(() => window.print(), 50); };
  const Sec = ({ n, children }) => { const p = PLAN_PAGES.find((x) => x.n === n); const has = r[p.key]; return <section className={`g73-fp ${has ? "" : "empty"}`}><h4><span>{p.n}</span>{p.e} {p.t}</h4>{has ? children : <p className="g73-fp-empty">Not completed yet.</p>}</section>; };
  if (st.done) return <Reward title="My Financial Plan is complete! 🏆" subtitle="Saving + banks + responsible credit = wellbeing." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Award size={22} strokeWidth={2.1} />} title="My Personal Financial Plan 📒" subtitle="It builds itself with your pages 01–07. Add your promises and present it!" onExit={onExit}>
      <PageBadge n="08" />
      <div className="g73-finalplan" id="g73-final">
        <header><small>PERSONAL FINANCIAL PLAN · GRADE 7 · INSTITUTO CREAR</small><h2>Smart Banking: My Plan</h2><p>By <b>{studentName}</b>{risk ? ` · Risk profile: ${risk.profile}` : ""}</p></header>
        <div className="g73-fp-grid">
          <Sec n="01">{b && <><p><b>{b.ruleName}</b> · Income {cop(b.income)}</p><StackBar parts={[{ label: "Needs", value: b.needs, color: "#0b7a50" }, { label: "Wants", value: b.wants, color: "#e07a2f" }, { label: "Savings", value: b.save, color: "#f5b23e" }]} max={b.income} /><i>“{b.why}”</i></>}</Sec>
          <Sec n="02">{g && g.goals.map((x, k) => <p key={k}>{k === 0 ? "⚡" : "🏔️"} <b>{x.what}</b> · {cop(x.amount)} in {x.months} months ({cop(x.monthly)}/month)</p>)}</Sec>
          <Sec n="03">{c && <><ul>{c.rules.map((x) => <li key={x}>{x}</li>)}</ul><i>“{c.lesson}”</i></>}</Sec>
          <Sec n="04">{f && <><p>🛟 Emergency fund: <b>{cop(f.target)}</b> ({f.months} months of needs)</p><p>☂️ {f.insurances.join(" · ")}</p></>}</Sec>
          <Sec n="05">{fu && <><p>{biz.e} <b>{biz.name}</b> · capital {cop(biz.capital)}</p><p>{Object.entries(fu.mix).filter(([, v]) => v > 0).map(([k, v]) => `${FUNDERS.find((x) => x.id === k)?.e} ${cop(v)}`).join(" · ")}</p><p>Ownership {fu.ownership}% · debt {cop(fu.monthlyDebt)}/month</p></>}</Sec>
          <Sec n="06">{pi && <><p>⚖️ Break-even: <b>{(be?.be || pi.be)} {biz.unit}s</b></p><p>🏦 Loan APPROVED: {cop(pi.amount)} · {pi.term} months · {cop(pi.inst)}/month</p><p>🛡️ {pi.mits.join(" · ")}</p></>}</Sec>
          <Sec n="07">{ap && <><p><span className="g73-fp-app" style={{ background: ap.color }}>{ap.logo}</span> <b>{ap.name}</b> — {ap.slogan}</p><p>{ap.features.map((id) => APP_FEATS.find((x) => x.id === id)?.e).join(" ")}</p></>}</Sec>
          <section className="g73-fp promise"><h4><span>08</span>🏆 My promises</h4>{PROMISES.map((p) => <p key={p.k}><b>{p.f}</b> {txt[p.k] || "…"}</p>)}</section>
        </div>
        <footer>💡 Concepts: 50/30/20 · pay yourself first · SMART goals · compound interest · credit cards · insurance · funding · break-even · risk · data protection</footer>
      </div>
      <div className="start-block">
        <h3><PenLine size={18} /> My promises</h3>
        {PROMISES.map((p) => <div key={p.k} className="p3-sentence edit"><span>{p.f}</span><input className="start-input" value={txt[p.k]} onChange={(e) => setTxt({ ...txt, [p.k]: e.target.value })} placeholder="Write your answer here…" /></div>)}
      </div>
      {pages < 5 && <div className="p1-banner bad"><span>You need at least 5 of the first 7 pages. You have {pages}.</span></div>}
      <div className="p3-card-actions">
        <button className="s1-btn ghost" disabled={busy} onClick={png}><Download size={17} /> {busy ? "Creating…" : "Download PNG"}</button>
        <button className="s1-btn ghost" onClick={print}><Printer size={17} /> Print / PDF</button>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(50, { promises: txt, pages })}>Publish my plan <span className="coin-tag"><Coins size={15} /> +50</span></button></div>
    </ActShell>
  );
}

const SHOW_STEPS = ["I showed my budget and my favorite rule.", "I explained one SMART goal with numbers.", "I explained one credit rule.", "I presented my business: funding + break-even.", "I showed my app and how it protects data."];
function ShowcaseFair({ onSave, onExit }) {
  const [checks, setChecks] = useState([]);
  const [peer, setPeer] = useState("");
  const [stars, setStars] = useState({ clear: 0, numbers: 0, english: 0 });
  const [c1, setC1] = useState(""); const [c2, setC2] = useState("");
  const [st, finish] = useFinish(onSave);
  const ready = checks.length === SHOW_STEPS.length && peer.trim() && Object.values(stars).every((x) => x > 0) && countWords(c1) >= 3 && countWords(c2) >= 3;
  if (st.done) return <Reward title="Showcase done! 🎤" subtitle="You presented a real financial plan." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Mic size={22} strokeWidth={2.1} />} title="Financial Plan Showcase 🎤" subtitle="Present your plan. Then give your tablet to a classmate for feedback." onExit={onExit}>
      <div className="start-block">
        <h3><span className="step-n">1</span> My presentation checklist</h3>
        {SHOW_STEPS.map((s) => <label key={s} className="perm-check p1-check"><input type="checkbox" checked={checks.includes(s)} onChange={() => setChecks(checks.includes(s) ? checks.filter((x) => x !== s) : [...checks, s])} /><span>{s}</span></label>)}
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> 🔁 Classmate's feedback</h3>
        <input className="start-input p3-gap" value={peer} onChange={(e) => setPeer(e.target.value)} placeholder="Classmate's name" />
        {[["clear", "The plan was clear"], ["numbers", "They used numbers and evidence"], ["english", "They spoke in English"]].map(([k, l]) => (
          <div key={k} className="p3-rub"><div><b>{l}</b></div><span /><div className="p3-stars">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={stars[k] >= n ? "on" : ""} onClick={() => setStars({ ...stars, [k]: n })}>★</button>)}</div></div>
        ))}
        <div className="p3-sentence edit"><span>⭐ The best part of the plan was</span><input className="start-input" value={c1} onChange={(e) => setC1(e.target.value)} placeholder="Write it here…" /></div>
        <div className="p3-sentence edit"><span>💡 One idea to improve it:</span><input className="start-input" value={c2} onChange={(e) => setC2(e.target.value)} placeholder="Write it here…" /></div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(20, { checks, peer, stars, comments: [c1, c2] })}>Save feedback <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}

const BOSS_7P3 = [
  { q: "Income $300,000 with the 50/30/20 rule. Savings =", options: ["$60,000", "$90,000", "$150,000"], correct: 0, feedback: "20% of 300,000." },
  { q: "“Pay yourself first” means…", options: ["save first, spend the rest", "spend first, save the rest", "pay all your bills first"], correct: 0, feedback: "Savings come first." },
  { q: "An emergency fund is for…", options: ["real surprises, like a medical visit", "sales and big discounts at the mall", "birthday parties and gifts for friends"], correct: 0, feedback: "Only emergencies." },
  { q: "Which goal is SMART?", options: ["Save $200,000 for a bike in 5 months", "Save some money for a new bike soon", "Have a lot of bikes in the future"], correct: 0, feedback: "What + how much + when." },
  { q: "Compound interest is…", options: ["interest that also earns interest", "interest that is always zero percent", "interest you pay only once a year"], correct: 0, feedback: "The snowball!" },
  { q: "Who usually wins: start saving at 12 or at 25?", options: ["At 12 — more time to grow", "At 25 — more money each month", "Both always end the same"], correct: 0, feedback: "Time is the secret." },
  { q: "The cut-off date is…", options: ["the day the bank adds up your purchases", "the last day to pay your monthly bill", "the day you receive your new card"], correct: 0, feedback: "Fecha de corte." },
  { q: "Paying only the minimum on a card…", options: ["costs a lot more interest", "is the cheapest option", "deletes your debt faster"], correct: 0, feedback: "The debt trap!" },
  { q: "Late card payments can…", options: ["hurt your credit history", "improve your credit history", "give you a lower rate"], correct: 0, feedback: "Reported to Datacrédito." },
  { q: "An insurance premium is…", options: ["what you pay for the insurance", "what the insurance pays you", "a prize for paying on time"], correct: 0, feedback: "You pay the premium." },
  { q: "Food was $900,000 and goes up 10%. New cost?", options: ["$990,000", "$910,000", "$1,800,000"], correct: 0, feedback: "900,000 × 1.10." },
  { q: "An investor gives you money in exchange for…", options: ["a part of your company", "interest every month", "nothing at all"], correct: 0, feedback: "Equity." },
  { q: "Crowdfunding is…", options: ["many people giving small amounts", "one bank giving you a big loan", "selling your company to a friend"], correct: 0, feedback: "The crowd funds you." },
  { q: "Break-even = Fixed costs ÷ …", options: ["(price − cost per unit)", "(price + cost per unit)", "(number of customers)"], correct: 0, feedback: "Profit per unit." },
  { q: "Fixed $600,000, price $5,000, cost $2,000. Break-even?", options: ["200 units", "120 units", "300 units"], correct: 0, feedback: "600,000 ÷ 3,000." },
  { q: "A bank checks if the installment is…", options: ["affordable with your income", "the biggest possible amount", "paid in cash at the branch"], correct: 0, feedback: "Capacity to pay." },
  { q: "Habeas Data gives you the right to…", options: ["know and correct your data", "see other people's data", "never share any data"], correct: 0, feedback: "Ley 1581 de 2012." },
  { q: "A budget app asks for your contact list. You…", options: ["deny it — it isn't needed", "accept — it's always fine", "send your password too"], correct: 0, feedback: "Data minimization." },  { q: "A $4,000 snack every school day (20 days) costs per month…", options: ["$80,000", "$20,000", "$40,000"], correct: 0, feedback: "4,000 × 20." },
  { q: "Rule of 72: at 8% a year, money doubles in about…", options: ["9 years", "8 years", "72 years"], correct: 0, feedback: "72 ÷ 8." },
  { q: "Debt = you repay with interest. Equity = …", options: ["you share part of your company", "you pay a lower interest rate", "you never repay or share anything"], correct: 0, feedback: "Shared ownership." },
  { q: "A responsible lender checks that debt payments are…", options: ["40% of income or less", "more than the whole income", "exactly 100% of the income"], correct: 0, feedback: "Capacity to pay." },
];
const RUBRIC73 = [
  { id: "budget", t: "I can make a budget and save first", d: "50/30/20, pay yourself first, emergency fund." },
  { id: "goals", t: "I can write SMART goals and understand compound interest", d: "Numbers + time." },
  { id: "credit", t: "I understand credit cards and the minimum-payment trap", d: "Cut-off, due date, installments, history." },
  { id: "business", t: "I can fund a business and calculate break-even", d: "Sources, risk, bank pitch." },
  { id: "digital", t: "I can use digital tools and protect my data", d: "QR, apps, Habeas Data, security." },
];
const STAR_L = ["", "Starting", "Developing", "Good", "Excellent"];
function SelfCheck73({ existing, onSave, onExit }) {
  const [stars, setStars] = useState(existing?.stars || {});
  const [proud, setProud] = useState(existing?.proud || "");
  const [habit, setHabit] = useState(existing?.habit || "");
  const [st, finish] = useFinish(onSave);
  const all = RUBRIC73.every((r) => stars[r.id]);
  const score = Math.round(RUBRIC73.reduce((a, r) => a + (stars[r.id] || 0), 0) / (RUBRIC73.length * 4) * 100);
  if (st.done) return <Reward title="Period 3 complete! 🏆" subtitle="You have a real financial plan for your life." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Star size={22} strokeWidth={2.1} />} title="My Self-Check · Period 3" subtitle="Be honest. How strong is your financial plan?" onExit={onExit}>
      <div className="p3-rubric">
        {RUBRIC73.map((r) => (
          <div key={r.id} className="p3-rub">
            <div><b>{r.t}</b><small>{r.d}</small></div><span />
            <div className="p3-stars">{[1, 2, 3, 4].map((n) => <button key={n} type="button" className={(stars[r.id] || 0) >= n ? "on" : ""} onClick={() => setStars({ ...stars, [r.id]: n })}>★</button>)}<small>{STAR_L[stars[r.id] || 0]}</small></div>
          </div>
        ))}
      </div>
      <div className="p3-score"><small>My self-check</small><b>{score}%</b><div className="p3-mini-bar"><i style={{ width: `${score}%` }} /></div></div>
      <div className="start-block">
        <label className="p3-lbl">🌟 The activity that taught me the most was…<input className="start-input" value={proud} onChange={(e) => setProud(e.target.value)} placeholder="Write your answer here…" /></label>
        <label className="p3-lbl">🔁 One money habit I will start this month is…<input className="start-input" value={habit} onChange={(e) => setHabit(e.target.value)} placeholder="Write your answer here…" /></label>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!all || countWords(proud) < 3 || countWords(habit) < 3} onClick={() => finish(20, { stars, score, proud, habit })}>Send my self-check <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   ESTRUCTURA DEL PERIODO (8 bloques · clases 22–32)
   ===================================================================== */
const G7P3_WEEKS = [
  { n: 22, g: "22", title: "Saving strategies", blurb: "3 saving methods, your money map, the Budget Remix and the Surprise Wheel.", e: "💰", skills: ["Reading", "Math"], acts: [
    { key: "c22_learn", title: "Mini Lesson: How to Save Money 📘", desc: "Mateo's $0 problem · 3 methods · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes", topics: ["50/30/20", "70/20/10", "Pay yourself first", "Emergency fund"] },
    { key: "c22_methods", title: "Saving Methods Lab 🧪", desc: "8 cases: calculate and choose the right method.", icon: <Calculator size={22} />, coins: 30, bucket: "quizzes" },
    { key: "c22_money", title: "My Money Map 🗺️", desc: "Your income, needs and wants.", icon: <MapIcon size={22} />, coins: 20, bucket: "aprendi" },
    { key: "c22_remix", title: "Budget Remix 🎧 · Page 01", desc: "Same income, 3 rules. Choose yours.", icon: <Layers size={22} />, coins: 30, bucket: "aprendi" },
    { key: "c22_shock", title: "The Surprise Wheel 🎡", desc: "Emergency or want? Spin 4 times!", icon: <Umbrella size={22} />, coins: 27, bucket: "aprendi" },
  ] },
  { n: 23, g: "23", title: "SMART goals + compound interest", blurb: "Start with a surprise: Ana vs. Leo. Then learn why — and build your goals.", e: "🎯", skills: ["Math", "Writing"], acts: [
    { key: "c23_snowball", title: "Snowball Simulator ⛄", desc: "Ana (12) vs. Leo (25). Who wins? Then your turn.", icon: <Snowflake size={22} />, coins: 28, bucket: "aprendi" },
    { key: "c23_learn", title: "Mini Lesson: Goals that Work + The Snowball 📘", desc: "SMART · compound interest · Rule of 72 · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes", topics: ["SMART", "Compound", "Rule of 72"] },
    { key: "c23_compound", title: "Compound Interest Workshop 🧮", desc: "Build the snowball year by year: 8 problems.", icon: <Calculator size={22} />, coins: 30, bucket: "quizzes" },
    { key: "c23_smart", title: "SMART Goal Studio 🎯 · Page 02", desc: "Fix 6 vague goals + build your 2 SMART goals.", icon: <Target size={22} />, coins: 30, bucket: "aprendi" },
  ] },
  { n: 24, g: "24", title: "Credit cards & debt", blurb: "How a card really works, a real statement, your first card and the debt trap.", e: "💳", skills: ["Reading", "Math"], acts: [
    { key: "c24_learn", title: "Mini Lesson: How a Credit Card Really Works 📘", desc: "The monthly cycle · installments · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes", topics: ["Cut-off", "Due date", "Installments", "Datacrédito"] },
    { key: "c24_statement", title: "Read the Statement 📄", desc: "A real-looking statement and 7 questions.", icon: <FileText size={22} />, coins: 27, bucket: "quizzes" },
    { key: "c24_card", title: "My First Credit Card 💳", desc: "Choose, set dates, buy, pay — see the real cost.", icon: <CreditCard size={22} />, coins: 35, bucket: "aprendi" },
    { key: "c24_trap", title: "The Debt Trap Game 🪤", desc: "What if you only pay the minimum?", icon: <AlertTriangle size={22} />, coins: 25, bucket: "aprendi" },
    { key: "c24_rules", title: "My Credit Rules · Page 03", desc: "4 rules for my future card.", icon: <ShieldCheck size={22} />, coins: 20, bucket: "aprendi" },
  ] },
  { n: 25, g: "25–26", title: "Family financial planning", blurb: "Live a month as a family first. Then learn the tools: inflation and insurance.", e: "🏠", skills: ["Math", "Reading"], acts: [
    { key: "c25_family", title: "Family Life Cards 🃏", desc: "Plan a budget. Live a month of surprises.", icon: <Home size={22} />, coins: 40, bucket: "aprendi" },
    { key: "c25_learn", title: "Mini Lesson: Planning a Family Budget 📘", desc: "Fixed vs. variable · inflation · insurance · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes", topics: ["Inflation", "Premium", "Coverage", "SOAT"] },
    { key: "c25_inflation", title: "Inflation-proof Budget 🎈", desc: "2 families, new prices: 8 problems.", icon: <Calculator size={22} />, coins: 30, bucket: "quizzes" },
    { key: "c25_insure", title: "Insurance: Worth It? ☂️", desc: "6 cases: premium, coverage, deductible.", icon: <Umbrella size={22} />, coins: 24, bucket: "quizzes" },
    { key: "c25_plan", title: "Family & Emergency Plan · Page 04", desc: "Fund goal, insurance, emergency steps.", icon: <ShieldCheck size={22} />, coins: 25, bucket: "aprendi" },
  ] },
  { n: 27, g: "27", title: "Financing a business", blurb: "Create your startup first. Then learn where the money comes from — and raise it.", e: "🚀", skills: ["Business", "Reading"], acts: [
    { key: "c27_startup", title: "Startup Studio 🚀", desc: "Idea, brand, price and capital.", icon: <Rocket size={22} />, coins: 30, bucket: "aprendi" },
    { key: "c27_learn", title: "Mini Lesson: How to Fund a Business 📘", desc: "7 sources · debt vs. equity · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes", topics: ["Capital", "Debt", "Equity", "Fondo Emprender"] },
    { key: "c27_match", title: "Funding Match 🧩", desc: "10 businesses: which source fits each one?", icon: <Puzzle size={22} />, coins: 34, bucket: "quizzes" },
    { key: "c27_fund", title: "The Funding Fair 🎪 · Page 05", desc: "Build your funding mix. Survive 12 months.", icon: <Handshake size={22} />, coins: 35, bucket: "aprendi" },
  ] },
  { n: 28, g: "28", title: "Risk & business plan", blurb: "Discover your risk profile, learn break-even and convince the bank.", e: "⚖️", skills: ["Math", "Speaking"], acts: [
    { key: "c28_risk", title: "How Risky Are You? 🎢", desc: "Your risk profile + invest or spend?", icon: <Gauge size={22} />, coins: 21, bucket: "comportamiento" },
    { key: "c28_learn", title: "Mini Lesson: Risk and Break-even 📘", desc: "A worked example step by step · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes", topics: ["Risk", "Return", "Break-even", "Mitigation"] },
    { key: "c28_breakeven", title: "Break-even Lab + Risk Map ⚖️", desc: "Find the crossing point. Make it safer.", icon: <Scale size={22} />, coins: 30, bucket: "aprendi" },
    { key: "c28_pitch", title: "The Bank Pitch 🏦 · Page 06", desc: "Ask for a loan. The bank decides!", icon: <Landmark size={22} />, coins: 40, bucket: "aprendi" },
  ] },
  { n: 29, g: "29–30", title: "Digital tools: My Money App", blurb: "Learn how digital money and data work. Then build and run your own digital bank.", e: "📱", skills: ["Reading", "Digital"], acts: [
    { key: "c29_learn", title: "Mini Lesson: Digital Money and Your Data 📘", desc: "QR · Habeas Data · how fintechs lend · quiz (8 of 12).", icon: <BookOpen size={22} />, coins: 42, bucket: "quizzes", topics: ["QR", "Habeas Data", "Encryption", "40% rule"] },
    { key: "c29_data", title: "Data Shield 🛡️", desc: "Needed, with permission or never?", icon: <Shield size={22} />, coins: 24, bucket: "quizzes" },
    { key: "c29_design", title: "My Money App 📱 · Page 07", desc: "Brand, features, safe sign-up.", icon: <Palette size={22} />, coins: 35, bucket: "aprendi" },
    { key: "c29_bank", title: "Run Your Digital Bank 🏦", desc: "9 loan requests. Then the hackers arrive.", icon: <Database size={22} />, coins: 40, bucket: "aprendi" },
  ] },
  { n: 31, g: "31–32", title: "Financial Plan Showcase", blurb: "Your complete plan, your presentation, the Boss.", e: "🏆", skills: ["Speaking", "Review"], acts: [
    { key: "c31_plan", title: "My Personal Financial Plan 📒 · Page 08", desc: "It builds itself with your 7 pages!", icon: <Award size={22} />, coins: 50, bucket: "aprendi" },
    { key: "c31_present", title: "Showcase + feedback 🎤", desc: "Present and get feedback.", icon: <Mic size={22} />, coins: 20, bucket: "comportamiento" },
    { key: "c31_boss", title: "Boss Battle · Period 3 ⚔️", desc: "15 questions from the whole period (70% to pass).", icon: <Swords size={22} />, coins: 70, bucket: "quizzes" },
    { key: "c31_self", title: "My Self-Check", desc: "How strong is my plan?", icon: <Star size={22} />, coins: 20, bucket: "comportamiento" },
  ] },
];
const ALL_ACTS = G7P3_WEEKS.flatMap((w) => w.acts);
const TOTAL_ACTS = ALL_ACTS.length;
const PAGE_ACTS = PLAN_PAGES.map((p) => p.key);

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Periodo3G7 = ({ userData, API_URL, existingRow, onBack }) => {
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
      .catch((e) => { console.error("Error guardando 7° Periodo 3:", e); dispatch({ type: "rollback_progreso", payload: { Semana: PERIOD_KEY, prev } }); });
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
    const lesson = (tag, title, subtitle, sections, glossary, questions, emoji) => (
      <ReadThen tag={tag} title={title} subtitle={subtitle} minutes={7} sections={sections} glossary={glossary} onExit={exit} finishLabel="I read it — start the quiz (8 questions)">
        <QuizRunner title={`${title} · check`} emoji={emoji} questions={questions} pickCount={8} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
      </ReadThen>
    );
    const rounds = (title, subtitle, rds, icon, done) => <NumberRounds icon={icon} title={title} subtitle={subtitle} rounds={rds} coinsPer={3} bonus={6} doneTitle={done} onSave={save} onExit={exit} />;
    let view = null;
    switch (act) {
      case "c22_learn": view = lesson("MINI LESSON · A2+ · SAVING", "How to Save Money", "Mateo always ends the month with $0. Let's fix it!", READ_L22, GLOSS_L22, Q_L22, "💰"); break;
      case "c22_methods": view = rounds("Saving Methods Lab 🧪", "8 real cases. Calculate, then choose the best method.", METHOD_ROUNDS, <Calculator size={22} />, "Method master! 🧪"); break;
      case "c22_money": view = <MoneyMap existing={resp.c22_money} onSave={save} onExit={exit} />; break;
      case "c22_remix": view = <BudgetRemix resp={resp} existing={resp.c22_remix} onSave={save} onExit={exit} />; break;
      case "c22_shock": view = <EmergencyWheel resp={resp} onSave={save} onExit={exit} />; break;

      case "c23_learn": view = lesson("MINI LESSON · A2+ · GOALS", "Goals that Work + The Snowball", "Why did Ana win? The math behind the snowball.", READ_L23, GLOSS_L23, Q_L23, "🎯"); break;
      case "c23_compound": view = rounds("Compound Interest Workshop 🧮", "Build the snowball year by year.", COMPOUND_ROUNDS, <Calculator size={22} />, "Snowball engineer! ⛄"); break;
      case "c23_smart": view = <SmartGoals resp={resp} existing={resp.c23_smart} onSave={save} onExit={exit} />; break;
      case "c23_snowball": view = <Snowball onSave={save} onExit={exit} />; break;

      case "c24_learn": view = lesson("MINI LESSON · A2+ · CREDIT", "How a Credit Card Really Works", "A loan in your pocket", READ_L24, GLOSS_L24, Q_L24, "💳"); break;
      case "c24_statement": view = rounds("Read the Statement 📄", "Sofía's credit card statement. Read it like an expert.", STATEMENT_ROUNDS, <FileText size={22} />, "Statement reader! 📄"); break;
      case "c24_card": view = <CreditCardSim onSave={save} onExit={exit} />; break;
      case "c24_trap": view = <DebtTrap onSave={save} onExit={exit} />; break;
      case "c24_rules": view = <CreditRules resp={resp} existing={resp.c24_rules} onSave={save} onExit={exit} />; break;

      case "c25_learn": view = lesson("MINI LESSON · A2+ · FAMILY MONEY", "Planning a Family Budget", "The Gómez family meeting", READ_L25, GLOSS_L25, Q_L25, "🏠"); break;
      case "c25_insure": view = rounds("Insurance: Worth It? ☂️", "Premium, coverage and deductible in 6 real cases.", INSURE_ROUNDS, <Umbrella size={22} />, "Insurance expert! ☂️"); break;
      case "c25_family": view = <FamilyLife onSave={save} onExit={exit} />; break;
      case "c25_inflation": view = <NumberRounds icon={<Calculator size={22} />} title="Inflation-proof Budget 🎈" subtitle="Same budget, new prices. Look at the table in each problem." rounds={INFL_ROUNDS} coinsPer={3} bonus={6} doneTitle="Inflation fighter! 🎈" onSave={save} onExit={exit} />; break;
      case "c25_plan": view = <FamilyPlan resp={resp} existing={resp.c25_plan} onSave={save} onExit={exit} />; break;

      case "c27_learn": view = lesson("MINI LESSON · A2+ · FUNDING", "How to Fund a Business", "You have an idea. Now you need money.", READ_L27, GLOSS_L27, Q_L27, "🚀"); break;
      case "c28_learn": view = lesson("MINI LESSON · A2+ · RISK", "Risk and Break-even", "A smart bet needs numbers", READ_L28, GLOSS_L28, Q_L28, "⚖️"); break;
      case "c27_startup": view = <StartupStudio existing={resp.c27_startup} onSave={save} onExit={exit} />; break;
      case "c27_match": view = <SortActivity icon={<Puzzle size={22} />} title="Funding Match 🧩" subtitle="Which funding source fits each business best?" buckets={SOURCES_B} items={MATCH_CASES} per={3} bonus={4} doneTitle="Funding expert! 🧩" intro={<div className="g72-howto"><b>How it works</b><span>Read each business. Tap the funding source that fits it BEST. Think: How much money? Is there a sales history? Do they have fans? Do they accept sharing the company?</span></div>} onSave={save} onExit={exit} />; break;
      case "c27_fund": view = <FundingFair resp={resp} existing={resp.c27_fund} onSave={save} onExit={exit} />; break;

      case "c28_risk": view = <RiskProfile existing={resp.c28_risk} onSave={save} onExit={exit} />; break;
      case "c28_breakeven": view = <BreakEvenLab resp={resp} onSave={save} onExit={exit} />; break;
      case "c28_pitch": view = <BankPitch resp={resp} existing={resp.c28_pitch} onSave={save} onExit={exit} />; break;

      case "c29_learn": view = lesson("MINI LESSON · A2+ · DIGITAL", "Digital Money and Your Data", "Your phone is a bank — protect it like one", READ_L29, GLOSS_L29, Q_L29, "📱"); break;
      case "c29_data": view = <SortActivity icon={<Shield size={22} />} title="Data Shield 🛡️" subtitle="Your app wants data. Which data is needed, only with permission, or never?" buckets={DATA_BUCKETS} items={DATA_ITEMS} per={2} bonus={4} doneTitle="Data protector! 🛡️" onSave={save} onExit={exit} />; break;
      case "c29_design": view = <AppDesigner existing={resp.c29_design} onSave={save} onExit={exit} />; break;
      case "c29_bank": view = <RunFintech resp={resp} onSave={save} onExit={exit} />; break;

      case "c31_plan": view = <FinalPlan resp={resp} studentName={name} existing={resp.c31_plan} onSave={save} onExit={exit} />; break;
      case "c31_present": view = <ShowcaseFair onSave={save} onExit={exit} />; break;
      case "c31_boss": view = <QuizRunner title="Boss Battle · Period 3" emoji="⚔️" questions={BOSS_7P3} pickCount={15} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />; break;
      case "c31_self": view = <SelfCheck73 existing={resp.c31_self} onSave={save} onExit={exit} />; break;
      default: view = null;
    }
    return <div className="s1 p1 p2 p3 p4 g7 g72 g73">{view}</div>;
  }

  /* ---------- BLOQUE ABIERTO ---------- */
  if (week) {
    const w = G7P3_WEEKS.find((x) => x.n === week);
    const wDone = w.acts.filter((a) => checklist[a.key]).length;
    const idx = G7P3_WEEKS.indexOf(w);
    const next = G7P3_WEEKS[idx + 1];
    return (
      <div className="s1 p1 p2 p3 p4 g7 g72 g73">
        <button className="s1-back" onClick={() => setWeek(null)}><ArrowLeft size={18} strokeWidth={2.4} /> Back to Period 3</button>
        <div className="s1-hero p1-week-hero g7-hero g73-hero">
          <span className="s1-tag">{w.e} GRADE 7 · PERIOD 3 · CLASS {w.g}</span>
          <h1>{w.title}</h1>
          <p>{w.blurb}</p>
          <div className="s1-progress"><div className="bar"><i style={{ width: `${(wDone / w.acts.length) * 100}%` }} /></div><span className="pill">{wDone}/{w.acts.length}</span></div>
        </div>
        <PlanPanel resp={respRef.current} compact />
        <div className="s1-quest">
          {w.acts.map((a) => (
            <div key={a.key} className={`act-card ${checklist[a.key] ? "done" : ""} ${PAGE_ACTS.includes(a.key) ? "g73-page-act" : ""} ${a.key.endsWith("_learn") ? "g73-learn-act" : ""}`}>
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
    <div className="s1 p1 p2 p3 p4 g7 g72 g73">
      <button className="s1-back" onClick={onBack}><ArrowLeft size={18} strokeWidth={2.4} /> Back to overview</button>
      <div className="s1-hero p1-hero g7-hero g73-hero">
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> ADMIN PREVIEW · GRADE {GRADE} · PERIOD 3</span>
        <h1>Smart Banking: My Personal Financial Plan</h1>
        <p>How can saving, banks and responsible credit help me achieve financial wellbeing?</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pctDone}%` }} /></div><span className="pill">{pctDone}%</span></div>
        <div className="p1-hero-chips">
          <span><Coins size={14} /> {coinsTotal} coins</span>
          <span><Check size={14} /> {doneCount}/{TOTAL_ACTS} activities</span>
          <span>📒 Financial Planner</span>
          <span>🎯 SDG 1 · SDG 4 · SDG 8</span>
        </div>
      </div>

      <PlanPanel resp={respRef.current} studentName={name} />
      {checklist.c31_plan && <button type="button" className="p3-card-link" onClick={() => setAct("c31_plan")}><Award size={18} /> See my Personal Financial Plan <ChevronRight size={16} /></button>}

      <div className="p1-passport">
        <div className="p1-passport-head"><b>📒 Financial Planner Passport</b><span>Finish a block to get its stamp</span></div>
        <div className="p1-stamps">
          {G7P3_WEEKS.map((w) => (
            <button key={w.n} type="button" className={`p1-stamp ${weekDone(w) ? "done" : ""}`} onClick={() => setWeek(w.n)} title={w.title}>
              <em>{w.e}</em><small>{w.g}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="p1-weeks">
        {G7P3_WEEKS.map((w) => {
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