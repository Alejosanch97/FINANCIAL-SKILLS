import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft, BookOpen, Video, Check, X, Coins, Trophy, Sparkles, Clock, ChevronRight, Lightbulb, Play,
  PenLine, Star, Users, Lock, Store, Scale, RefreshCw, Award, Puzzle, Mic, Target, Calculator,
  ShieldCheck, Plus, Minus, Trash2, Search, Swords, Rocket, Download, Printer, ShoppingCart, Globe,
  TrendingUp, TrendingDown, Headphones, Compass, BarChart3, LineChart as LineIcon, Flame, Map as MapIcon,
} from "lucide-react";
import "../Styles/semana1.css";   // botones, quiz, reward, monedas (misma gamificación)
import "../Styles/periodo1.css";  // piezas del Periodo 1 (6°)
import "../Styles/periodo2.css";  // piezas del Periodo 2 (6°)
import "../Styles/periodo3.css";  // piezas del Periodo 3 (6°)
import "../Styles/periodo4.css";  // piezas del Periodo 4 (6°)
import "../Styles/septimo1.css";  // estilos nuevos de 7° · Periodo 1
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   GRADO 7 · PERIODO 1 · WHY DO PRICES CHANGE?  (A2+)
   10 clases. Hilo del periodo: el PRICE TRACKER. Cada semana el estudiante
   registra el precio de 3 productos; en la clase 10 su Consumer Market
   Report se arma solo con gráficas y conclusiones.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "7P1", Grado = "7".
   ===================================================================== */

const PERIOD_KEY = "7P1";
const GRADE = "7";

const VIDEO_SUPPLY = "https://res.cloudinary.com/y9r84vgz/video/upload/v1792340726/videoplayback_9.mp4";
const VIDEO_INFLATION = "https://res.cloudinary.com/y9r84vgz/video/upload/v1792341430/videoplayback_10.mp4";
const AUDIO_PRICE_NEWS = ""; // 🎧 PEGA AQUÍ la URL de tu mp3 "Price News" (Clase 7)
const IMG_TICKET = [
  "https://i.pinimg.com/736x/c7/37/5e/c7375e3bb98a203463af394b28e6b71c.jpg",
  "https://i.pinimg.com/736x/f1/94/0c/f1940cfa3980083e870d9e252e190f01.jpg",
  "https://i.pinimg.com/736x/52/e2/14/52e214bc120fc8bfe98af539b86b082a.jpg",
  "https://i.pinimg.com/736x/f3/52/24/f35224a3c5d5b5e4b8da6ff001e5728a.jpg",
];
const IMG_SHRINK = "https://i.pinimg.com/236x/fe/3e/fe/fe3efed51619c4011ad1ea25c75b2843.jpg";

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


/* =====================================================================
   PIEZAS DE 7° · gráficas, radar, tracker
   ===================================================================== */
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

/* ---------- RADAR DE N PUNTAS ---------- */
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

/* =====================================================================
   PRICE TRACKER · el hilo de todo el periodo
   ===================================================================== */
// Precios del "CREAR Supermarket" (datos de juego) por semana de registro: C1 … C9
const TRK_PRODUCTS = [
  { id: "milk", e: "🥛", n: "Milk (1 liter)", p: [4200, 4200, 4250, 4250, 4300, 4300, 4350, 4400, 4400] },
  { id: "rice", e: "🍚", n: "Rice (1 kg)", p: [4500, 4500, 4500, 4600, 4600, 4600, 4650, 4650, 4700] },
  { id: "eggs", e: "🥚", n: "Eggs (12)", p: [7200, 7400, 7600, 7500, 7800, 8000, 7900, 8200, 8400] },
  { id: "bread", e: "🍞", n: "Sliced bread", p: [6500, 6500, 6600, 6600, 6700, 6800, 6800, 6900, 7000] },
  { id: "arepas", e: "🫓", n: "Arepas (pack of 5)", p: [4500, 4500, 4600, 4600, 4700, 4700, 4800, 4800, 4900] },
  { id: "banana", e: "🍌", n: "Bananas (1 kg)", p: [3000, 3200, 2900, 3100, 3300, 3000, 3200, 3400, 3300] },
  { id: "coffee", e: "☕", n: "Coffee (250 g)", p: [12000, 12200, 12500, 12800, 13000, 13300, 13500, 13800, 14000] },
  { id: "soda", e: "🥤", n: "Soda (1.5 liters)", p: [5000, 5000, 5100, 5200, 5200, 5300, 5300, 5400, 5500] },
  { id: "tp", e: "🧻", n: "Toilet paper (4 rolls)", p: [6000, 6000, 6200, 6200, 6400, 6500, 6500, 6700, 6800] },
  { id: "notebook", e: "📓", n: "School notebook", p: [5000, 5000, 5000, 5000, 5500, 5500, 5500, 5500, 5500] },
  { id: "choco", e: "🍫", n: "Chocolate bar", p: [3500, 3500, 3500, 3500, 3500, 3500, 3500, 3500, 3500] },
];
const TRK_KEYS = ["c1_tracker", "c2_trk", "c3_trk", "c4_trk", "c5_trk", "c6_trk", "c7_trk", "c8_trk", "c9_trk"];
const TRK_LABELS = ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9"];
const SOURCES = [{ id: "store", l: "🏪 A store" }, { id: "online", l: "🌐 Online" }, { id: "home", l: "🏠 I asked at home" }, { id: "crear", l: "🏫 CREAR Supermarket" }];
const prodOf = (id) => TRK_PRODUCTS.find((p) => p.id === id) || TRK_PRODUCTS[0];
const DEFAULT_TRK = ["milk", "eggs", "bread"];

/* Lee todos los registros y arma la serie de cada producto */
function trackerData(resp) {
  const r = resp || {};
  const chosen = r.c1_tracker?.products?.length ? r.c1_tracker.products : DEFAULT_TRK;
  const series = chosen.map((pid, si) => ({
    id: pid, name: prodOf(pid).n, e: prodOf(pid).e, color: COLORS[si],
    values: TRK_KEYS.map((k) => { const v = r[k]?.entries?.[pid]?.price; return v ? Number(v) : null; }),
  }));
  const records = TRK_KEYS.filter((k) => r[k]?.entries).length;
  const stats = series.map((s) => {
    const v = s.values.map((a, i) => ({ a, i })).filter((o) => o.a != null);
    const first = v[0], last = v[v.length - 1];
    return { ...s, first: first?.a, last: last?.a, firstLabel: first ? TRK_LABELS[first.i] : "", lastLabel: last ? TRK_LABELS[last.i] : "", change: first && last ? pctChange(first.a, last.a) : 0, count: v.length };
  });
  return { chosen, series, stats, records, predictions: r.c1_tracker?.predictions || {} };
}

/* Panel del tracker (menú del periodo y actividades) */
function TrackerPanel({ resp, compact }) {
  const d = trackerData(resp);
  return (
    <div className={`g7-trk-panel ${compact ? "compact" : ""}`}>
      <div className="g7-trk-head"><b>🔎 My Price Tracker</b><span>{d.records}/9 records</span></div>
      <div className="g7-trk-rows">
        {d.stats.map((s) => (
          <div key={s.id} className="g7-trk-row">
            <em>{s.e}</em>
            <span>{s.name}<small>{s.last ? cop(s.last) : "No data yet"}</small></span>
            <Sparkline values={s.values} color={s.color} />
            <b className={s.change > 0 ? "up" : s.change < 0 ? "down" : ""}>{s.count > 1 ? fmtPct(s.change) : "—"}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Registro semanal (Clases 2–9): siempre la misma pantalla + una mini-tarea */
function TrackerCheck({ week, resp, existing, extra, onSave, onExit }) {
  const d = trackerData(resp);
  const idx = week; // posición en TRK_KEYS
  const [entries, setEntries] = useState(() => {
    if (existing?.entries) return existing.entries;
    const o = {}; d.chosen.forEach((pid) => { o[pid] = { price: String(prodOf(pid).p[idx]), src: "crear" }; }); return o;
  });
  const [xv, setXv] = useState(existing?.extra ?? extra?.initial ?? "");
  const [st, finish] = useFinish(onSave);
  const prevOf = (pid) => { for (let k = idx - 1; k >= 0; k--) { const v = resp?.[TRK_KEYS[k]]?.entries?.[pid]?.price; if (v) return { v: Number(v), label: TRK_LABELS[k] }; } return null; };
  const set = (pid, k, v) => setEntries({ ...entries, [pid]: { ...entries[pid], [k]: v } });
  const ok = d.chosen.every((pid) => num(entries[pid]?.price) > 0) && (!extra || extra.valid(xv));
  if (st.done) return <Reward title={`Tracker #${week} saved! 📈`} subtitle="Your Market Report is growing." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<LineIcon size={22} strokeWidth={2.1} />} title={`Price Tracker #${week}`} subtitle="Write today's price for your 3 products. Real price or CREAR Supermarket price." onExit={onExit}>
      {!resp?.c1_tracker && <div className="p1-banner">⚠️ You didn't choose products in Class 1, so we gave you: milk, eggs and bread.</div>}
      <div className="g7-trk-table">
        {d.chosen.map((pid) => {
          const p = prodOf(pid), prev = prevOf(pid), now = num(entries[pid]?.price);
          const ch = prev && now ? pctChange(prev.v, now) : null;
          return (
            <div key={pid} className="g7-trk-line">
              <div className="g7-trk-prod"><em>{p.e}</em><b>{p.n}</b><small>🏫 CREAR Supermarket today: {cop(p.p[idx])}</small></div>
              <div className="g7-trk-prev"><small>Last record {prev ? `(${prev.label})` : ""}</small><b>{prev ? cop(prev.v) : "—"}</b></div>
              <div className="g7-trk-new"><small>Today</small><MoneyInput value={entries[pid]?.price || ""} onChange={(v) => set(pid, "price", v)} /></div>
              <div className={`g7-trk-ch ${ch > 0 ? "up" : ch < 0 ? "down" : ""}`}>{ch == null ? "" : ch === 0 ? "= same" : ch > 0 ? `▲ ${fmtPct(ch)}` : `▼ ${fmtPct(ch)}`}</div>
              <div className="g7-trk-src">{SOURCES.map((s) => <button key={s.id} type="button" className={entries[pid]?.src === s.id ? "on" : ""} onClick={() => set(pid, "src", s.id)}>{s.l}</button>)}</div>
            </div>
          );
        })}
      </div>
      {extra && (
        <div className="start-block">
          <h3><Sparkles size={18} /> {extra.title}</h3>
          {extra.render(xv, setXv, entries)}
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(10, { week, entries, extra: xv })}>Save tracker #{week} <span className="coin-tag"><Coins size={15} /> +10</span></button></div>
    </ActShell>
  );
}

/* Audio + quiz (Listening) */
function AudioQuiz({ src, title, questions, pickCount, onSave, onExit }) {
  return (
    <div className="p1-act">
      <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
      <div className="g7-audio">
        <Headphones size={26} />
        <div><b>🎙️ Price News · Listening</b>{src ? <audio src={src} controls preload="metadata" /> : <p className="goal-warn">The teacher will play the audio. (Admin: paste the mp3 URL in AUDIO_PRICE_NEWS.)</p>}</div>
      </div>
      <p className="video-hint">🎧 Listen to the whole show. Then answer {pickCount} questions — you need 70% to pass.</p>
      <QuizRunner title={title} emoji="🎧" questions={questions} pickCount={pickCount} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={onSave} onExit={onExit} />
    </div>
  );
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
   CLASE 1 · WELCOME TO 7TH
   ===================================================================== */
const RADAR_DIMS = [
  { k: "mm", l: "Money Management", short: "Money" },
  { k: "ent", l: "Entrepreneurship", short: "Business" },
  { k: "wb", l: "Financial Wellbeing", short: "Wellbeing" },
  { k: "dig", l: "Digital Economy", short: "Digital" },
  { k: "glo", l: "Global Citizenship", short: "Global" },
];
// s = puntos de cada opción (0–3)
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
function radarProfile(avg) {
  if (avg <= 30) return { l: "Market Rookie 🧭", d: "You are starting your 7th-grade adventure. This period you will learn how markets and prices really work." };
  if (avg <= 55) return { l: "Market Explorer 🔎", d: "You know some important ideas. Now you will learn to analyze prices with numbers and graphs." };
  if (avg <= 80) return { l: "Market Analyst 📊", d: "You think before you buy! This year you will explain your decisions with evidence." };
  return { l: "Market Expert ⭐", d: "Excellent starting point! Your challenge: explain your ideas in English and help others." };
}
const RADAR_TIPS = {
  mm: "This period: inflation and purchasing power will help you plan your money.",
  ent: "This period: you will see how entrepreneurs react when prices change.",
  wb: "This period: you will compare prices and make smart decisions for your family.",
  dig: "This period: you will compare prices online and detect fake reviews.",
  glo: "This period: you will compare prices around the world with the Big Mac Index.",
};
function MoneyRadar7({ existing, onSave, onExit }) {
  const [cur, setCur] = useState(0);
  const [ans, setAns] = useState(existing?.answers || {});
  const [done, setDone] = useState(!!existing?.scores);
  const [saving, setSaving] = useState(false);
  const scores = useMemo(() => {
    const o = {};
    RADAR_DIMS.forEach((d) => {
      const qs = RADAR_Q.map((q, i) => ({ q, i })).filter((x) => x.q.d === d.k);
      const pts = qs.reduce((a, x) => a + (ans[x.i] != null ? x.q.s[ans[x.i]] : 0), 0);
      o[d.k] = Math.round((pts / (qs.length * 3)) * 100);
    });
    return o;
  }, [ans]);
  const shown = existing?.scores && !Object.keys(ans).length ? existing.scores : scores;
  const avg = Math.round(Object.values(shown).reduce((a, v) => a + v, 0) / RADAR_DIMS.length);
  const prof = radarProfile(avg);
  const q = RADAR_Q[cur];
  const answered = ans[cur] != null;
  const finish = () => {
    setSaving(true); setDone(true);
    Promise.resolve(onSave({ answers: ans, scores, average: avg, profile: prof.l, xp: 15 })).finally(() => setSaving(false));
  };
  if (done) {
    const sorted = RADAR_DIMS.map((d) => ({ ...d, v: shown[d.k] })).sort((a, b) => b.v - a.v);
    return (
      <div className="s1-quiz diag-result">
        <div className="diag-badge"><Compass size={30} strokeWidth={2.1} /></div>
        <h2>My Money Radar · 7th grade</h2>
        <p className="diag-sub">This is not a test. It's a photo of you today. At the end of the year you will do it again and compare.</p>
        <div className="g7-radar-wrap"><RadarN labels={RADAR_DIMS.map((d) => d.short)} values={RADAR_DIMS.map((d) => shown[d.k])} /></div>
        <div className="diag-bars">
          {RADAR_DIMS.map((d) => (
            <div key={d.k} className="diag-bar"><span className="diag-bar-l">{d.l}</span><div className="diag-bar-track"><i style={{ width: `${shown[d.k]}%` }} /></div><span className="diag-bar-v">{shown[d.k]}%</span></div>
          ))}
        </div>
        <div className="diag-risk"><span className="diag-risk-tag">{prof.l}</span><p>{prof.d}</p></div>
        <div className="p1-diag-cards">
          <div className="p1-diag-card good"><b>💪 Your strongest pillar: {sorted[0].l}</b><span>You scored {sorted[0].v}%.</span></div>
          <div className="p1-diag-card next"><b>🎯 Your next step: {sorted[4].l}</b><span>{RADAR_TIPS[sorted[4].k]}</span></div>
        </div>
        <button className="s1-btn primary" onClick={onExit}>Continue <ChevronRight size={18} /></button>
        {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing your progress…</span>}
      </div>
    );
  }
  return (
    <div className="s1-quiz">
      <div className="quiz-top"><h2>🧭 My Money Radar</h2><span className="quiz-count">{cur + 1} / {RADAR_Q.length}</span></div>
      <div className="quiz-track"><i style={{ width: `${((cur + (answered ? 1 : 0)) / RADAR_Q.length) * 100}%` }} /></div>
      <span className="diag-dim">{RADAR_DIMS.find((d) => d.k === q.d).l}</span>
      <p className="quiz-q">{q.q}</p>
      <div className="quiz-options">
        {q.o.map((o, k) => <button key={k} type="button" className={`quiz-opt ${ans[cur] === k ? "correct" : ""}`} onClick={() => setAns({ ...ans, [cur]: k })}><span className="opt-key">{"ABCD"[k]}</span><span className="opt-text">{o}</span></button>)}
      </div>
      <div className="quiz-nav">
        <button className="s1-btn ghost" onClick={() => (cur > 0 ? setCur(cur - 1) : onExit())}>{cur > 0 ? "Back" : "Exit"}</button>
        <button className="s1-btn primary" disabled={!answered} onClick={() => (cur < RADAR_Q.length - 1 ? setCur(cur + 1) : finish())}>{cur < RADAR_Q.length - 1 ? "Next" : "See my radar"} <ChevronRight size={18} /></button>
      </div>
    </div>
  );
}

const BASICS = [
  { e: "💵", t: "Money", d: "A tool we use to exchange things, to measure value and to save for later.", ex: "Before money, people used barter: eggs for shoes." },
  { e: "↔️", t: "Income & expenses", d: "Income is money that comes in. Expenses are money that goes out.", ex: "Income − expenses = what you can save." },
  { e: "⚖️", t: "Needs & wants", d: "Needs are things we must have to live well. Wants are nice to have.", ex: "Food is a need. A video game is a want." },
  { e: "📋", t: "Budget", d: "A plan for how to use your money before you spend it.", ex: "Plan: needs first, then savings, then wants." },
  { e: "🚀", t: "Cost, price & profit", d: "Cost: what a business spends. Price: what the customer pays. Profit: price − cost.", ex: "Cost $3,000, price $4,000 → profit $1,000." },
  { e: "📱", t: "Digital payments", d: "Paying with cards, QR codes or digital wallets. Your PIN is always secret.", ex: "Never share your PIN or passwords." },
];
const BASICS_PAIRS = [
  { a: "💵 Money", b: "A tool to exchange, measure value and save" },
  { a: "↔️ Income", b: "Money that comes in" },
  { a: "⚖️ A need", b: "Something we must have to live well" },
  { a: "📋 Budget", b: "A plan for your money" },
  { a: "🚀 Profit", b: "Price minus cost" },
  { a: "📱 PIN", b: "A secret code — never share it" },
];
function BasicsPack({ onSave, onExit }) {
  const [opened, setOpened] = useState({});
  const [stage, setStage] = useState("cards");
  const [round, setRound] = useState(0);
  const [st, finish] = useFinish(onSave);
  const all = BASICS.every((_, i) => opened[i]);
  if (st.done) return <Reward title="Starter Pack unlocked! 🎒" subtitle="You have the basics for 7th grade." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Sparkles size={22} strokeWidth={2.1} />} title="Money Basics · The 7th-Grade Starter Pack" subtitle="6 ideas every 7th grader needs this year. Open all the cards, then match them." onExit={onExit}>
      <div className="p3-stepper"><span className="on"><b>1</b>Open the cards</span><span className={stage === "match" ? "on" : ""}><b>2</b>Match</span></div>
      {stage === "cards" ? (
        <>
          <div className="g7-concepts">
            {BASICS.map((c, i) => (
              <button key={c.t} type="button" className={`g7-concept ${opened[i] ? "open" : ""}`} onClick={() => setOpened({ ...opened, [i]: true })}>
                <em>{c.e}</em><b>{c.t}</b>
                {opened[i] ? <><p>{c.d}</p><small>💡 {c.ex}</small></> : <small className="g7-tap">Tap to open</small>}
              </button>
            ))}
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!all} onClick={() => setStage("match")}>{all ? "Let's match!" : `Open all the cards (${Object.keys(opened).length}/6)`} <ChevronRight size={18} /></button></div>
        </>
      ) : (
        <div className="start-block"><MatchPairs key={round} pairs={BASICS_PAIRS} leftLabel="Idea" rightLabel="Meaning" onRestart={() => setRound((r) => r + 1)} onDone={(r) => finish(8 + r.firstTry * 2, r)} /></div>
      )}
    </ActShell>
  );
}

const PREDICT = [{ id: "up", l: "📈 Up" }, { id: "same", l: "➖ Same" }, { id: "down", l: "📉 Down" }];
function TrackerLaunch({ existing, onSave, onExit }) {
  const [sel, setSel] = useState(existing?.products || []);
  const [entries, setEntries] = useState(existing?.entries || {});
  const [pred, setPred] = useState(existing?.predictions || {});
  const [st, finish] = useFinish(onSave);
  const tog = (id) => {
    if (sel.includes(id)) { setSel(sel.filter((x) => x !== id)); return; }
    if (sel.length >= 3) return;
    setSel([...sel, id]);
    if (!entries[id]) setEntries({ ...entries, [id]: { price: String(prodOf(id).p[0]), src: "crear" } });
  };
  const set = (id, k, v) => setEntries({ ...entries, [id]: { ...entries[id], [k]: v } });
  const ready = sel.length === 3 && sel.every((id) => num(entries[id]?.price) > 0 && pred[id]);
  if (st.done) return <Reward title="Mission launched! 🔎" subtitle="Every week you will record these 3 prices." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Price Tracker · Mission Launch" subtitle="You are a Market Detective. Choose 3 products and watch their prices for 9 weeks." onExit={onExit}>
      <div className="p4-def"><b>🔎 How the mission works</b><p>Every class you will write the price of your 3 products. You can use a <b>real price</b> (a store, online or asking at home) or the <b>CREAR Supermarket</b> price. In Class 10, your <b>Consumer Market Report</b> will build itself with graphs!</p></div>
      <div className="start-block">
        <h3><span className="step-n">1</span> Choose 3 products ({sel.length}/3)</h3>
        <div className="g7-prod-grid">
          {TRK_PRODUCTS.map((p) => (
            <button key={p.id} type="button" className={sel.includes(p.id) ? "on" : ""} onClick={() => tog(p.id)}>
              <em>{p.e}</em><b>{p.n}</b><small>{cop(p.p[0])}</small>
            </button>
          ))}
        </div>
      </div>
      {sel.length > 0 && (
        <div className="start-block">
          <h3><span className="step-n">2</span> Today's price + your prediction</h3>
          <div className="g7-trk-table">
            {sel.map((id) => {
              const p = prodOf(id);
              return (
                <div key={id} className="g7-trk-line launch">
                  <div className="g7-trk-prod"><em>{p.e}</em><b>{p.n}</b></div>
                  <div className="g7-trk-new"><small>Price today</small><MoneyInput value={entries[id]?.price || ""} onChange={(v) => set(id, "price", v)} /></div>
                  <div className="g7-trk-src">{SOURCES.map((s) => <button key={s.id} type="button" className={entries[id]?.src === s.id ? "on" : ""} onClick={() => set(id, "src", s.id)}>{s.l}</button>)}</div>
                  <div className="g7-predict"><small>In 9 weeks the price will go…</small>{PREDICT.map((o) => <button key={o.id} type="button" className={pred[id] === o.id ? "on" : ""} onClick={() => setPred({ ...pred, [id]: o.id })}>{o.l}</button>)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(15, { products: sel, entries, predictions: pred })}>Launch my mission <span className="coin-tag"><Coins size={15} /> +15</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 2 · WHAT IS A PRICE? (The Arepa Business Challenge)
   ===================================================================== */
const READ_C2 = [
  { h: "Doña Rosa's Arepa Stand: The Price Puzzle" },
  { p: "Every morning at six o'clock, Doña Rosa opens her little arepa stand near a school in Bogotá. The smell of warm corn and melted cheese attracts students, parents, teachers, and workers. Her arepas are delicious, and many customers come back every day. But this Monday, Doña Rosa has a problem." },
  { say: "“Everything is more expensive!” she says. “The corn costs more, the cheese costs more, and I must pay for gas and rent. How much should I charge for each arepa?”" },
  { p: "Her grandson Mateo wants to help. “Grandma, why don't you sell each arepa for just $2,000? Everyone will buy one!” Doña Rosa smiles. “Maybe, Mateo. But we need to do the math first.”" },
  { sub: "Mission 1 · Find the real cost" },
  { p: "Doña Rosa plans to make 20 cheese arepas. She writes down all her expenses." },
  { node: (
    <div className="g7-notebook">
      <b>📒 Doña Rosa's cost notebook · 20 arepas</b>
      {[["🌽 Corn", 18000], ["🧀 Cheese", 16000], ["🧂 Butter and salt", 4000], ["🔥 Gas", 5000], ["🏠 Part of the rent", 7000], ["👩‍🍳 Doña Rosa's work", 10000]].map(([l, v]) => <div key={l}><span>{l}</span><span>{cop(v)}</span></div>)}
      <div className="tot"><span>Total cost</span><span>{cop(60000)}</span></div>
    </div>
  ) },
  { p: "Mateo looks surprised. “Wait! We must pay for your work too?” “Of course!” says Doña Rosa. “I spend time buying ingredients, cooking, and cleaning. My time is important. A business must consider all its costs, including the work people do.”" },
  { p: "They divide the total cost by 20: $60,000 ÷ 20 = $3,000 per arepa. “This is our cost per unit,” says Doña Rosa." },
  { sub: "Mission 2 · Choose the price" },
  { p: "Mateo has another idea. “Let's sell them for $3,000!” “Then we pay our costs, but we do not make a profit,” explains Doña Rosa. She writes three possible prices on a board." },
  { node: (
    <div className="g7-options3">
      <div className="bad"><small>Option A</small><b>$2,500</b><p>20 sold = $50,000. Costs are $60,000 → she <b>loses $10,000</b>.</p></div>
      <div className="good"><small>Option B</small><b>$4,000</b><p>20 sold = $80,000. $80,000 − $60,000 = <b>$20,000 profit</b>.</p></div>
      <div className="warn"><small>Option C</small><b>$7,000</b><p>More money per arepa, but <b>many customers may buy somewhere else</b>.</p></div>
    </div>
  ) },
  { p: "“Profit is the money left after we subtract our costs from the money we receive,” says Doña Rosa. “But we must also think about our customers. A good price covers the costs, makes a profit, and makes sense to the customers.”" },
  { sub: "Mission 3 · Is price the same as value?" },
  { p: "At lunchtime, a student buys an arepa for $4,000. “Good price! It's warm, delicious, and it keeps me full until the afternoon.” Another student says, “Four thousand pesos? I already ate!”" },
  { p: "The price is the amount of money a customer pays. The value is how useful or important the product feels to that customer. The product and its price are the same, but the value can be different for each person. A bottle of water at home seems ordinary; after a long walk on a hot day, it feels extremely valuable." },
  { sub: "Mission 4 · The surprise challenge" },
  { p: "At the end of the day, Doña Rosa sells 15 of her 20 arepas for $4,000 each. Mateo calculates: 15 × $4,000 = $60,000. “Great! We earned $60,000!”" },
  { p: "“Careful,” Doña Rosa replies. “That is our revenue, not our profit. We spent $60,000 to make all 20 arepas. So today our result is $0. The 5 arepas we didn't sell cost us $15,000 to make!” Mateo understands: selling a product does not automatically mean a business makes a profit." },
  { list: ["Cost: what the business spends to make a product.", "Price: what the customer pays.", "Revenue: the money the business receives from sales.", "Profit: revenue minus costs.", "Value: how useful or important the product is to the customer."] },
  { box: "Cost is what a business spends. Price is what a customer pays. Profit is what remains after costs. Value is what the product means to the customer." },
];
const GLOSS_C2 = { "cost per unit": "Costo por unidad.", "revenue": "Ingresos por ventas.", "profit": "Ganancia.", "value": "Valor — qué tan útil o importante es para ti.", "charge": "Cobrar." };
const Q_C2 = [
  { q: "Why does Doña Rosa include the cost of her work?", options: ["Her time and work are a real part of the business.", "Customers pay her extra for every minute she works.", "She wants the arepas to look more expensive."], correct: 0, feedback: "Her time is a real cost of the business." },
  { q: "What is the cost of making one arepa?", options: ["$3,000", "$2,000", "$4,000"], correct: 0, feedback: "$60,000 ÷ 20 = $3,000." },
  { q: "She sells all 20 arepas for $4,000 each. What is her profit?", options: ["$20,000", "$60,000", "$80,000"], correct: 0, feedback: "$80,000 − $60,000 = $20,000." },
  { q: "Why can the same arepa have a different value for two students?", options: ["One student may be hungry and the other may not.", "The price of the arepa changes for every student.", "The ingredients change each time she cooks them."], correct: 0, feedback: "Value depends on the person and the situation." },
  { q: "She sells 15 arepas for $4,000. $60,000 is her…", options: ["revenue", "profit", "cost per unit"], correct: 0, feedback: "Revenue = money from sales. Profit = revenue − costs." },
];

const RECIPE = [
  { id: "corn", e: "🌽", l: "Corn", v: 18000, ok: true }, { id: "cheese", e: "🧀", l: "Cheese", v: 16000, ok: true },
  { id: "butter", e: "🧂", l: "Butter and salt", v: 4000, ok: true }, { id: "choco", e: "🍫", l: "Chocolate", v: 9000, ok: false },
  { id: "ham", e: "🥓", l: "Ham", v: 12000, ok: false },
];
const BIZ = [
  { id: "gas", e: "🔥", l: "Gas", v: 5000, ok: true }, { id: "rent", e: "🏠", l: "Part of the rent", v: 7000, ok: true },
  { id: "work", e: "👩‍🍳", l: "Doña Rosa's work", v: 10000, ok: true }, { id: "tv", e: "📺", l: "A new TV for her house", v: 20000, ok: false },
  { id: "netflix", e: "🎬", l: "Her movie subscription", v: 8000, ok: false },
];
const SALES = { 2500: 20, 3000: 20, 3500: 19, 4000: 18, 4500: 15, 5000: 12, 6000: 7, 7000: 4 };
const PB_REASONS = ["it covers all my costs", "customers think it is fair", "I make a profit", "it is similar to other stands"];
function PriceBuilder({ onSave, onExit }) {
  const [lvl, setLvl] = useState(1);
  const [rec, setRec] = useState([]);
  const [biz, setBiz] = useState([]);
  const [msg, setMsg] = useState(null);
  const [tot, setTot] = useState(""); const [unit, setUnit] = useState("");
  const [price, setPrice] = useState(null);
  const [log, setLog] = useState([]);
  const [why, setWhy] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [st, finish] = useFinish(onSave);
  const tog = (arr, set, id) => set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  const checkSet = (list, chosen, next) => {
    const right = list.filter((x) => x.ok).every((x) => chosen.includes(x.id)) && chosen.every((id) => list.find((x) => x.id === id).ok);
    if (right) { setMsg({ good: true, t: "Correct! ✅" }); setTimeout(() => { setMsg(null); setLvl(next); }, 700); }
    else { setMistakes((m) => m + 1); setMsg({ good: false, t: chosen.some((id) => !list.find((x) => x.id === id).ok) ? "Something here is NOT a cost of making arepas. 🤔" : "You are missing something. A business must count ALL its costs!" }); }
  };
  const totalOk = num(tot) === 60000, unitOk = num(unit) === 3000;
  const sold = price ? SALES[price] : 0;
  const revenue = price * sold, profit = revenue - 60000;
  const tryPrice = (p) => { setPrice(p); if (!log.find((x) => x.p === p)) setLog([...log, { p, sold: SALES[p], rev: p * SALES[p], prof: p * SALES[p] - 60000 }]); };
  const ready = price && profit > 0 && countWords(why) >= 3;
  const coins = Math.max(18, 30 - mistakes * 2);
  if (st.done) return <Reward title="Arepa boss! 🫓" subtitle={`Price $${price.toLocaleString("en-US")} · profit ${cop(profit)}.`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  const Card = ({ x, on, onClick }) => <button type="button" className={`g7-costcard ${on ? "on" : ""}`} onClick={onClick}><em>{x.e}</em><b>{x.l}</b><small>{cop(x.v)}</small></button>;
  return (
    <ActShell icon={<Calculator size={22} strokeWidth={2.1} />} title="Price Builder · Build the Perfect Arepa" subtitle="Help Doña Rosa: find the costs, then choose the best price for 20 arepas." onExit={onExit}>
      <div className="p3-stepper">{["Recipe", "Business costs", "Cost per arepa", "Set the price"].map((s, k) => <span key={s} className={lvl >= k + 1 ? "on" : ""}><b>{k + 1}</b>{s}</span>)}</div>
      {lvl === 1 && (
        <div className="start-block">
          <h3>🧀 Level 1 · Which ingredients go in a CHEESE arepa? (for 20)</h3>
          <div className="g7-costgrid">{RECIPE.map((x) => <Card key={x.id} x={x} on={rec.includes(x.id)} onClick={() => tog(rec, setRec, x.id)} />)}</div>
          {msg && <div className={`p1-banner ${msg.good ? "good" : "bad"}`}>{msg.t}</div>}
          <div className="start-foot"><button className="s1-btn primary" disabled={!rec.length} onClick={() => checkSet(RECIPE, rec, 2)}>Check the recipe <Check size={16} /></button></div>
        </div>
      )}
      {lvl === 2 && (
        <div className="start-block">
          <h3>🏪 Level 2 · Which are costs of the BUSINESS?</h3>
          <p className="start-tip">Making arepas costs more than the ingredients! But personal things are not business costs.</p>
          <div className="g7-costgrid">{BIZ.map((x) => <Card key={x.id} x={x} on={biz.includes(x.id)} onClick={() => tog(biz, setBiz, x.id)} />)}</div>
          {msg && <div className={`p1-banner ${msg.good ? "good" : "bad"}`}>{msg.t}</div>}
          <div className="start-foot"><button className="s1-btn primary" disabled={!biz.length} onClick={() => checkSet(BIZ, biz, 3)}>Check the costs <Check size={16} /></button></div>
        </div>
      )}
      {lvl === 3 && (
        <div className="start-block">
          <h3>🧮 Level 3 · Do the math</h3>
          <div className="g7-receipt">{[...RECIPE, ...BIZ].filter((x) => x.ok).map((x) => <div key={x.id}><span>{x.e} {x.l}</span><b>{cop(x.v)}</b></div>)}</div>
          <div className="p4-calc"><span>Total cost of 20 arepas =</span><MoneyInput value={tot} onChange={setTot} /><b className={tot === "" ? "" : totalOk ? "ok" : "no"}>{tot === "" ? "" : totalOk ? "✓" : "Add again"}</b></div>
          {totalOk && <div className="p4-calc"><span>Cost per arepa = {cop(60000)} ÷ 20 =</span><MoneyInput value={unit} onChange={setUnit} /><b className={unit === "" ? "" : unitOk ? "ok" : "no"}>{unit === "" ? "" : unitOk ? "✓" : "Divide by 20"}</b></div>}
          {totalOk && unitOk && <div className="start-foot"><button className="s1-btn primary" onClick={() => setLvl(4)}>Choose the price <ChevronRight size={16} /></button></div>}
        </div>
      )}
      {lvl === 4 && (
        <div className="start-block">
          <h3>💰 Level 4 · Set the price (cost per arepa: {cop(3000)})</h3>
          <p className="start-tip">Try different prices. Watch the customers! <i>(A simple model, not a real prediction.)</i></p>
          <div className="g7-pricebtns">{Object.keys(SALES).map(Number).map((p) => <button key={p} type="button" className={price === p ? "on" : ""} onClick={() => tryPrice(p)}>{cop(p)}</button>)}</div>
          {price && (
            <>
              <div className="g7-crowd">{Array.from({ length: 20 }, (_, i) => <span key={i} className={i < sold ? "buy" : ""}>{i < sold ? "🧒" : "🚶"}</span>)}</div>
              <div className="p3-fin">
                <div><small>Customers</small><b>{sold}/20</b></div>
                <div><small>Revenue</small><b>{cop(revenue)}</b></div>
                <div className={profit > 0 ? "win big" : profit < 0 ? "loss big" : "big"}><small>Profit (− {cop(60000)})</small><b>{cop(profit)}</b></div>
              </div>
            </>
          )}
          {log.length > 1 && (
            <div className="g7-logtable"><div className="h"><span>Price</span><span>Sold</span><span>Revenue</span><span>Profit</span></div>{log.sort((a, b) => a.p - b.p).map((x) => <div key={x.p} className={x.prof > 0 ? "win" : x.prof < 0 ? "loss" : ""}><span>{cop(x.p)}</span><span>{x.sold}</span><span>{cop(x.rev)}</span><span>{cop(x.prof)}</span></div>)}</div>
          )}
          {price && profit <= 0 && <div className="p1-banner bad">With this price Doña Rosa doesn't make a profit. Try another one!</div>}
          {price && profit > 0 && (
            <>
              <h3 className="p2-mt"><PenLine size={18} /> Explain your price</h3>
              <div className="p1-starters">{PB_REASONS.map((r) => <button key={r} type="button" className="p1-chip" onClick={() => setWhy(why ? `${why}, and ${r}` : r)}>{r}</button>)}</div>
              <div className="p3-sentence edit"><span>I chose {cop(price)} because</span><input className="start-input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="it covers my costs and customers think it is fair." /></div>
            </>
          )}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(coins, { price, sold, profit, why, tried: log.length, mistakes })}>Save my price <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </div>
      )}
    </ActShell>
  );
}

const VALUE_BUCKETS = [{ id: "low", l: "Low value", e: "🔽" }, { id: "high", l: "High value", e: "🔼" }, { id: "dep", l: "It depends", e: "🤔" }];
const VALUE_CARDS = [
  { e: "💧", t: "A bottle of water when you have cold water in your fridge.", ok: ["low"], why: "You don't need it right now." },
  { e: "🥵", t: "The same bottle of water on a very hot hike, with no water left.", ok: ["high"], why: "You really need it!" },
  { e: "👕", t: "A basic T-shirt for $30,000.", ok: ["dep", "low"], why: "It depends on the quality and if you need it." },
  { e: "🏀", t: "A jersey signed by a famous basketball player.", ok: ["high", "dep"], why: "For a fan it is very special." },
  { e: "☂️", t: "An umbrella on a sunny day.", ok: ["low"], why: "You don't need it today." },
  { e: "🌧️", t: "The same umbrella in a heavy storm.", ok: ["high"], why: "Now it's very useful!" },
  { e: "🎫", t: "A concert ticket of a band you don't know.", ok: ["low", "dep"], why: "Value depends on what you like." },
];
const VALUE_FRAMES = ["A product is more valuable when", "The price is higher because", "I would pay more for a product if"];
function PriceOrValue({ onSave, onExit }) {
  const [ch, setCh] = useState({});
  const [frame, setFrame] = useState(0);
  const [txt, setTxt] = useState("");
  const [st, finish] = useFinish(onSave);
  const done = Object.keys(ch).length === VALUE_CARDS.length;
  const good = VALUE_CARDS.filter((c, i) => c.ok.includes(ch[i])).length;
  if (st.done) return <Reward title="Value detective! 💎" subtitle="Same product, different value." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Scale size={22} strokeWidth={2.1} />} title="Price or Value? Same Product, Different Story" subtitle="How valuable is it for YOU in this situation? Some cards have more than one good answer." onExit={onExit}>
      <div className="g7-value-list">
        {VALUE_CARDS.map((c, i) => {
          const picked = ch[i];
          return (
            <div key={i} className={`g7-value ${picked ? (c.ok.includes(picked) ? "ok" : "no") : ""}`}>
              <em>{c.e}</em><p>{c.t}</p>
              <div className="g7-vbtns">{VALUE_BUCKETS.map((b) => <button key={b.id} type="button" disabled={!!picked} className={picked === b.id ? "on" : ""} onClick={() => setCh({ ...ch, [i]: b.id })}>{b.e} {b.l}</button>)}</div>
              {picked && <small>{c.ok.includes(picked) ? "✓ " : "Hmm… "}{c.why}</small>}
            </div>
          );
        })}
      </div>
      {done && (
        <div className="start-block">
          <h3><PenLine size={18} /> Complete one sentence</h3>
          <div className="p1-starters">{VALUE_FRAMES.map((f, k) => <button key={f} type="button" className={`p1-chip ${frame === k ? "on" : ""}`} onClick={() => setFrame(k)}>{f}…</button>)}</div>
          <div className="p3-sentence edit"><span>{VALUE_FRAMES[frame]}</span><input className="start-input" value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="I really need it." /></div>
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!done || countWords(txt) < 3} onClick={() => finish(8 + good * 2, { good, sentence: `${VALUE_FRAMES[frame]} ${txt}` })}>Finish <span className="coin-tag"><Coins size={15} /> +{8 + good * 2}</span></button></div>
    </ActShell>
  );
}

const AREPA_BOSS = [
  { t: "Round 1 · Costs go up!", s: "The cost of 20 arepas goes from $60,000 to $70,000. Customers still expect to pay about $4,000.", o: ["Keep the same price and ignore the higher costs.", "Review the costs, consider a small price change and explain the value to customers.", "Charge any price — customers must buy her arepas."], ok: 1, fb: "Smart businesses check costs and talk honestly to customers." },
  { t: "Round 2 · The competition", s: "A new stand sells a similar arepa for $3,500. What can Doña Rosa do BESIDES lowering her price?", o: ["Make her arepa special: more cheese, faster service, a free juice on Fridays.", "Say bad things about the other stand.", "Close her stand forever."], ok: 0, fb: "Add value: quality and service make customers come back." },
  { t: "Round 3 · The waste problem", s: "She makes 20 arepas, but only 12 sell. What should she do tomorrow?", o: ["Make 40 arepas.", "Count her daily sales and make a number closer to what she sells.", "Throw away the 8 arepas and don't think about it."], ok: 1, fb: "Planning production reduces waste and costs." },
  { t: "Round 4 · The special customer", s: "A customer says, “Your arepa is expensive, but I love the quality.” How can she explain the price?", o: ["“My arepas cure all diseases!”", "“I use fresh corn and real cheese, and I make them every morning.”", "“Pay or go away.”"], ok: 1, fb: "Explain the real value — never false promises." },
];
function ArepaBoss({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);
  const [st, finish] = useFinish(onSave);
  const r = AREPA_BOSS[i];
  if (st.done) return <Reward title="Business saved! 🛡️" subtitle={`${score}/${AREPA_BOSS.length} smart decisions.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Swords size={22} strokeWidth={2.1} />} title="Arepa Boss Battle ⚔️" subtitle="Every round brings a new problem. Can you save Doña Rosa's business?" onExit={onExit}>
      <div className="p2-hud"><span>Round <b>{i + 1}/{AREPA_BOSS.length}</b></span><span>Smart decisions <b>{score}</b></span></div>
      <div className="p3-oops hot"><em>🫓</em><small>{r.t.toUpperCase()}</small><p>{r.s}</p></div>
      <ChoiceCard options={r.o} good={[r.ok]} picked={pick} onAnswer={(k) => { setPick(k); if (k === r.ok) setScore((s) => s + 1); }} feedback={r.fb} />
      {pick !== null && <div className="start-foot"><button className="s1-btn primary big" onClick={() => { if (i < AREPA_BOSS.length - 1) { setI(i + 1); setPick(null); } else finish(6 + score * 4, { score }); }}>{i < AREPA_BOSS.length - 1 ? "Next round" : "Finish"} <ChevronRight size={18} /></button></div>}
    </ActShell>
  );
}

/* =====================================================================
   CLASE 3 · SUPPLY & DEMAND
   ===================================================================== */
const Q_C3 = [
  { q: "Where do the eight kids go on their day trip at the beginning of the video?", options: ["To the zoo", "To a fun fair", "To a traditional candy store", "To an economics museum"], correct: 1, feedback: "They go to a fun fair." },
  { q: "How many of the eight kids want the big strawberry candy at Vendor A's booth?", options: ["Four kids", "Two kids", "Six kids", "Eight kids"], correct: 2, feedback: "Six kids want it." },
  { q: "How many strawberry candies does Vendor A have at first?", options: ["Six candies", "Four candies", "Ten candies", "Five candies"], correct: 1, feedback: "Only four candies." },
  { q: "How does the video define the four candies that Vendor A has?", options: ["Demand", "Price", "Value", "Supply"], correct: 3, feedback: "What a seller has available = supply." },
  { q: "How does the video define the fact that six kids really want the candies?", options: ["Demand", "Scarcity", "Supply", "Consumption"], correct: 0, feedback: "What people want to buy = demand." },
  { q: "In the first scenario, how was demand compared to supply?", options: ["Supply was higher than demand", "Demand was higher than supply", "Supply and demand were equal", "There was no relationship"], correct: 1, feedback: "6 kids, 4 candies → demand > supply." },
  { q: "What did Vendor A do with the price when demand was higher than supply?", options: ["Kept the price exactly the same", "Cut the price in half to $2.50", "Doubled the price ($5 → $10)", "Gave the candies away for free"], correct: 2, feedback: "He doubled the price." },
  { q: "Why did Vendor A increase the price?", options: ["The candies were about to expire soon", "It was a hot sell and kids would pay more", "The fair managers forced him to do it", "He wanted to donate the extra money"], correct: 1, feedback: "High demand = he could charge more." },
  { q: "What did Vendor B announce when she appeared?", options: ["She had six strawberry candies at $5 each", "She bought all of Vendor A's candies", "She lowered her price to $2", "She stopped selling sweets"], correct: 0, feedback: "Six more candies at $5." },
  { q: "After Vendor B joined, what happened to supply compared to demand?", options: ["Supply became higher than demand", "Demand increased to ten kids", "All candies sold out immediately", "The price rose to $20"], correct: 0, feedback: "10 candies, 6 kids → supply > demand." },
  { q: "What did Vendor A learn after Vendor B arrived?", options: ["To close his booth and go home early", "To raise the price even more, to $15", "To cut the price from $10 to $5", "To hide the candies from the kids"], correct: 2, feedback: "More supply → lower price." },
  { q: "According to the video, what concept helps us understand our buying behavior?", options: ["Supply and demand", "Savings and investment", "Mass production", "International trade"], correct: 0, feedback: "Supply and demand!" },
];

/* Lemonade Market: 5 días (mapa de misiones) con decisiones de precio y oferta */
const PRICE_F = { 1000: 1.4, 1500: 1.2, 2000: 1, 2500: 0.8, 3000: 0.6, 3500: 0.4 };
const LEMON_DAYS = [
  { id: "d1", e: "☀️", name: "Day 1 · Normal Saturday", badge: "First sale", news: "A normal sunny Saturday in the park. About 24 people want lemonade at $2,000.", base: 24, cost: 600, maxCups: 40,
    q: { t: "Your first day! What is SUPPLY in your stand?", o: ["The cups of lemonade you prepare", "The people who want lemonade", "The price of one cup"], ok: 0, fb: "Supply = what the seller has available." } },
  { id: "d2", e: "🔥", name: "Day 2 · Heatwave!", badge: "Heat master", news: "🌡️ 34°C! Everyone is thirsty. Demand is much higher today: about 40 people at $2,000.", base: 40, cost: 600, maxCups: 40,
    q: { t: "Why did more people want lemonade today?", o: ["Demand went up because of the heat", "Supply went down", "Lemons are free today"], ok: 0, fb: "Hot weather → demand goes up → you can sell more or charge more." } },
  { id: "d3", e: "🌧️", name: "Day 3 · Rainy day", badge: "Rain survivor", news: "☔ It's raining all day. Only about 10 people want cold lemonade at $2,000.", base: 10, cost: 600, maxCups: 40,
    q: { t: "What is the smartest plan on a rainy day?", o: ["Make fewer cups and maybe lower the price", "Make 40 cups and raise the price", "Do the same as the heatwave day"], ok: 0, fb: "Low demand → prepare less and attract customers with a good price." } },
  { id: "d4", e: "🍋", name: "Day 4 · A competitor arrives", badge: "Competition pro", news: "🧃 Another stand opens next to you and sells lemonade at $1,500! There is more SUPPLY in the park.", base: 26, cost: 600, maxCups: 40, rival: 1500,
    q: { t: "What happened in the market when the second stand arrived?", o: ["Supply went up, so prices go down", "Demand went down to zero", "Supply went down"], ok: 0, fb: "More sellers = more supply → competition pushes prices down." } },
  { id: "d5", e: "🍋❌", name: "Day 5 · Lemon shortage", badge: "Shortage hero", news: "🚚 A storm stopped the lemon trucks. Lemons are scarce and expensive: each cup now costs you $900, and you can make only 20 cups. About 30 people want lemonade.", base: 30, cost: 900, maxCups: 20,
    q: { t: "Why can sellers charge more during a shortage?", o: ["Supply is low and demand is still high", "People don't like lemonade anymore", "The government said so"], ok: 0, fb: "Low supply + high demand → higher prices." } },
];
function LemonDay({ day, onDone }) {
  const [cups, setCups] = useState(null);
  const [price, setPrice] = useState(null);
  const [res, setRes] = useState(null);
  const [pick, setPick] = useState(null);
  const cupOpts = [10, 20, 30, 40].filter((c) => c <= day.maxCups);
  const open = () => {
    let f = PRICE_F[price];
    if (day.rival) f *= price > day.rival ? 0.45 : price === day.rival ? 0.85 : 1.15;
    const demand = Math.round(day.base * f);
    const sold = Math.min(cups, demand);
    const revenue = sold * price, cost = cups * day.cost;
    setRes({ demand, sold, left: cups - sold, revenue, cost, profit: revenue - cost, missed: Math.max(0, demand - cups) });
  };
  return (
    <div className="start-block">
      <div className="g7-news"><em>{day.e}</em><div><small>📰 MARKET NEWS</small><p>{day.news}</p><small>Cost per cup: {cop(day.cost)} · Max cups: {day.maxCups}</small></div></div>
      {!res && (
        <>
          <h3><span className="step-n">1</span> How many cups will you prepare? (your supply)</h3>
          <div className="g7-pricebtns">{cupOpts.map((c) => <button key={c} type="button" className={cups === c ? "on" : ""} onClick={() => setCups(c)}>🥤 {c}</button>)}</div>
          <h3 className="p2-mt"><span className="step-n">2</span> Choose your price</h3>
          <div className="g7-pricebtns">{Object.keys(PRICE_F).map(Number).map((p) => <button key={p} type="button" className={price === p ? "on" : ""} onClick={() => setPrice(p)}>{cop(p)}</button>)}</div>
          {cups && price && <p className="start-tip">Your costs today: {cups} × {cop(day.cost)} = <b>{cop(cups * day.cost)}</b></p>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!cups || !price} onClick={open}>🍋 Open the stand!</button></div>
        </>
      )}
      {res && (
        <>
          <div className="g7-crowd">{Array.from({ length: Math.min(40, res.demand) }, (_, i) => <span key={i} className={i < res.sold ? "buy" : "miss"}>{i < res.sold ? "😋" : "😞"}</span>)}</div>
          <div className="p3-fin">
            <div><small>People who wanted it</small><b>{res.demand}</b></div>
            <div><small>Cups sold</small><b>{res.sold}/{cups}</b></div>
            <div><small>Revenue</small><b>{cop(res.revenue)}</b></div>
            <div><small>Costs</small><b>{cop(res.cost)}</b></div>
            <div><small>Cups left (waste)</small><b>{res.left}</b></div>
            <div className={res.profit > 0 ? "win big" : res.profit < 0 ? "loss big" : "big"}><small>Profit</small><b>{cop(res.profit)}</b></div>
          </div>
          {res.missed > 0 && <div className="p1-banner">😞 {res.missed} customers left without lemonade! Your supply was too low — or your price could be higher.</div>}
          {res.left > 5 && <div className="p1-banner bad">🗑️ {res.left} cups were wasted. You prepared more than the demand.</div>}
          <div className="start-block">
            <h3><Lightbulb size={18} /> {day.q.t}</h3>
            <ChoiceCard options={day.q.o} good={[day.q.ok]} picked={pick} onAnswer={setPick} feedback={day.q.fb} />
          </div>
          {pick !== null && <div className="start-foot"><button className="s1-btn primary big" onClick={() => onDone({ ok: true, cups, price, ...res, concept: pick === day.q.ok })}>Close the day 🏁</button></div>}
        </>
      )}
    </div>
  );
}
const LEMON_ROOMS = LEMON_DAYS.map((d) => ({ id: d.id, e: d.e, name: d.name, badge: d.badge, brief: "Decide your supply (cups) and your price. Then open the stand!", render: (done) => <LemonDay day={d} onDone={done} /> }));

const SHIFT_CARDS = [
  { e: "🔥", t: "A very hot day. Product: lemonade.", ch: "dU", pr: "up" },
  { e: "📱", t: "A famous YouTuber recommends a snack.", ch: "dU", pr: "up" },
  { e: "🌧️", t: "Heavy rain all week. Product: ice cream.", ch: "dD", pr: "down" },
  { e: "🌪️", t: "A storm destroys many banana farms.", ch: "sD", pr: "up" },
  { e: "🏬", t: "Many new stores start selling phone cases.", ch: "sU", pr: "down" },
  { e: "🎄", t: "After Christmas, nobody wants Christmas trees.", ch: "dD", pr: "down" },
  { e: "🥭", t: "An amazing mango harvest: millions of mangoes!", ch: "sU", pr: "down" },
  { e: "👕", t: "A school event: everybody needs a white T-shirt.", ch: "dU", pr: "up" },
];
const SHIFT_OPTS = [{ id: "dU", l: "Demand ⬆" }, { id: "dD", l: "Demand ⬇" }, { id: "sU", l: "Supply ⬆" }, { id: "sD", l: "Supply ⬇" }];
function ShiftIt({ onSave, onExit }) {
  const deck = useMemo(() => shuffleArr(SHIFT_CARDS), []);
  const [i, setI] = useState(0);
  const [a1, setA1] = useState(null);
  const [a2, setA2] = useState(null);
  const [score, setScore] = useState(0);
  const [st, finish] = useFinish(onSave);
  const c = deck[i];
  const pick2 = (v) => { setA2(v); setScore((s) => s + (a1 === c.ch ? 1 : 0) + (v === c.pr ? 1 : 0)); };
  const next = () => { if (i < deck.length - 1) { setI(i + 1); setA1(null); setA2(null); } else finish(6 + score * 2, { score, total: deck.length * 2 }); };
  if (st.done) return <Reward title="Market master! ⚖️" subtitle={`${score}/${deck.length * 2} points.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<TrendingUp size={22} strokeWidth={2.1} />} title="Shift It! ⚖️" subtitle="What changes: supply or demand? And what happens to the price?" onExit={onExit}>
      <div className="p2-hud"><span>Card <b>{i + 1}/{deck.length}</b></span><span>Points <b>{score}</b></span></div>
      <div className="p3-oops"><em>{c.e}</em><small>MARKET EVENT</small><p>{c.t}</p></div>
      <div className="start-block">
        <h3><span className="step-n">1</span> What changes?</h3>
        <div className="g7-shift">{SHIFT_OPTS.map((o) => <button key={o.id} type="button" disabled={a1 !== null} onClick={() => setA1(o.id)} className={a1 === null ? "" : o.id === c.ch ? "ok" : a1 === o.id ? "no" : ""}>{o.l}</button>)}</div>
        {a1 !== null && (
          <>
            <h3 className="p2-mt"><span className="step-n">2</span> So the price will probably go…</h3>
            <div className="g7-shift">{[["up", "📈 Up"], ["down", "📉 Down"]].map(([id, l]) => <button key={id} type="button" disabled={a2 !== null} onClick={() => pick2(id)} className={a2 === null ? "" : id === c.pr ? "ok" : a2 === id ? "no" : ""}>{l}</button>)}</div>
          </>
        )}
        {a2 !== null && <div className="p1-banner good">{SHIFT_OPTS.find((o) => o.id === c.ch).l} → price {c.pr === "up" ? "goes up 📈" : "goes down 📉"}.</div>}
      </div>
      {a2 !== null && <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{i < deck.length - 1 ? "Next card" : "Finish"} <ChevronRight size={18} /></button></div>}
    </ActShell>
  );
}

/* =====================================================================
   CLASE 4 · SCARCITY, CHOICE & OPPORTUNITY COST
   ===================================================================== */
const imgBlock = (src) => ({ node: <img className="p2-hero-img g7-story-img" src={src} alt="" loading="lazy" /> });
const READ_C4 = [
  { h: "The Last Ticket" },
  { sub: "Part 1 · The Dream" },
  imgBlock(IMG_TICKET[0]),
  { p: "Leo was thirteen years old, and he loved music. His favorite band, The Rockets, was coming to his city for one night only. Leo had been waiting for this concert for months." },
  { p: "He had saved 80,000 Colombian pesos from his birthday money and small jobs at home. The ticket cost 70,000 pesos. He could finally go! But there was one problem. His best friend, Mateo, wanted to go too. Mateo had only saved 50,000 pesos." },
  { say: "“Don't worry,” Leo said. “We will find a way!”" },
  { sub: "Part 2 · The Problem" },
  imgBlock(IMG_TICKET[1]),
  { p: "On Saturday morning, Leo and Mateo went to the ticket office. They were surprised to see a huge line. Five hundred fans wanted tickets, but the concert had only ten tickets left." },
  { p: "One ticket was still 70,000 pesos at the official ticket office. However, a man nearby was selling a ticket for 120,000 pesos. “Why is his ticket so expensive?” Mateo asked. “Because there are very few tickets and many people want them,” Leo answered." },
  { box: "This is called scarcity: there is not enough of something to satisfy everyone's wants." },
  { sub: "Part 3 · Three Possible Futures" },
  imgBlock(IMG_TICKET[2]),
  { p: "Leo sat on a bench and thought about his options." },
  { list: ["Choice A: Buy the ticket now. He sees his favorite band, but Mateo might feel sad.", "Choice B: Wait and help Mateo save. They might go together to another concert, but Leo could lose this chance.", "Choice C: Buy the expensive ticket for 120,000 pesos. But he would need to borrow money."] },
  { p: "“Every choice gives me something,” Leo thought, “but every choice also means giving up something else.” His sister had taught him a useful idea: opportunity cost is the next best thing you give up when you make a choice." },
  { sub: "Part 4 · The Surprise" },
  imgBlock(IMG_TICKET[3]),
  { p: "Suddenly, Mateo had an idea. “What if we don't buy tickets today? We can save our money and watch the band at their next concert. We can also use some money for pizza and a movie today!” They decided to save their money for a future concert. It was not an easy choice, but they made it together." },
  { say: "That evening, Leo wrote in his notebook: “Money is limited. Time is limited. Resources are limited. I cannot choose everything, so I must choose what matters most to me.”" },
  { sub: "🧻 Real life: Why did everyone want toilet paper?" },
  { p: "In 2020, during COVID-19, many families bought extra toilet paper at the same time. Shelves became empty because demand grew faster than supply. Scarcity does not always mean a product disappears forever — sometimes there is just not enough at a particular time or place." },
  { box: "Scarcity means we cannot have everything. Choice means deciding what matters most. Opportunity cost is the next best thing we give up." },
];
const GLOSS_C4 = { "scarcity": "Escasez — no hay suficiente para todos.", "opportunity cost": "Costo de oportunidad — lo mejor que dejas de lado al elegir.", "sell out": "Agotarse.", "borrow": "Pedir prestado.", "resources": "Recursos." };
const Q_C4 = [
  { q: "Why was the man's ticket so expensive?", options: ["Very few tickets were left and many people wanted them.", "His ticket had the best seats right next to the stage.", "The band asked him to sell it at a higher price."], correct: 0, feedback: "Scarcity + high demand → higher price." },
  { q: "What is scarcity?", options: ["Not enough of something to satisfy everyone's wants.", "A product that is very cheap and easy to find.", "When a store has too many products on its shelves."], correct: 0, feedback: "Not enough for everyone." },
  { q: "What is opportunity cost?", options: ["The next best thing you give up when you choose.", "The full price you pay for a concert ticket.", "The money you borrow from a friend or a bank."], correct: 0, feedback: "What you give up." },
  { q: "If Leo buys the official ticket, what could be his opportunity cost?", options: ["Saving that money for a weekend trip with Mateo.", "The 500 fans waiting in the line for tickets.", "The band's next album that comes out next year."], correct: 0, feedback: "He gives up another use of his money." },
  { q: "What did Leo learn?", options: ["Resources are limited, so we choose what matters most.", "It is always smart to buy the most expensive option.", "Concerts are a waste of money, so he will never go."], correct: 0, feedback: "Choose what matters most." },
];

const ISLAND = [
  { id: "water", e: "💧", l: "Water", d: "Clean water for 3 days.", c: 3 },
  { id: "food", e: "🥥", l: "Food", d: "Food to keep your energy.", c: 3 },
  { id: "shelter", e: "⛺", l: "Shelter", d: "Protection from rain.", c: 4 },
  { id: "light", e: "🔦", l: "Flashlight", d: "Light at night.", c: 2 },
  { id: "game", e: "🎲", l: "Game", d: "Fun in your free time.", c: 1 },
  { id: "aid", e: "🩹", l: "First-aid kit", d: "Help for small injuries.", c: 3 },
];
const ISLAND_DAYS = [
  { e: "☀️", t: "Day 1 · The hot afternoon", s: "The sun is very strong. You need to drink and eat.", need: [["water", 2, "No water: you are very thirsty. −2 ❤️"], ["food", 1, "No food: you feel weak. −1 ❤️"]] },
  { e: "⛈️", t: "Day 2 · The storm", s: "A big storm arrives in the afternoon.", need: [["shelter", 2, "No shelter: you are wet and cold all night. −2 ❤️"]] },
  { e: "🌙", t: "Day 3 · The dark night", s: "It's very dark, and you cut your hand on a rock.", need: [["light", 1, "No flashlight: you can't see anything. −1 ❤️"], ["aid", 1, "No first-aid kit: the cut hurts. −1 ❤️"]] },
];
function ScarcityIsland({ onSave, onExit }) {
  const [sel, setSel] = useState([]);
  const [stage, setStage] = useState("pick");
  const [day, setDay] = useState(0);
  const [why, setWhy] = useState("");
  const [change, setChange] = useState("");
  const [st, finish] = useFinish(onSave);
  const used = sel.reduce((a, id) => a + ISLAND.find((x) => x.id === id).c, 0);
  const left = 10 - used;
  const tog = (it) => { if (sel.includes(it.id)) setSel(sel.filter((x) => x !== it.id)); else if (it.c <= left) setSel([...sel, it.id]); };
  const lossesOf = (d) => ISLAND_DAYS[d].need.filter(([id]) => !sel.includes(id));
  const hearts = Math.max(0, 5 - ISLAND_DAYS.slice(0, day + 1).reduce((a, _, k) => a + lossesOf(k).reduce((s, n) => s + n[1], 0), 0));
  const finalHearts = Math.max(0, 5 - ISLAND_DAYS.reduce((a, _, k) => a + lossesOf(k).reduce((s, n) => s + n[1], 0), 0));
  const coins = 12 + finalHearts * 2 + (sel.includes("game") && finalHearts < 3 ? 0 : 2);
  if (st.done) return <Reward title={finalHearts > 0 ? "You survived! 🏝️" : "Island lesson learned 🏝️"} subtitle={`You finished with ${finalHearts}/5 ❤️.`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<MapIcon size={22} strokeWidth={2.1} />} title="Scarcity Island 🏝️" subtitle="Survive 3 days. You have only 10 tokens — you can't take everything!" onExit={onExit}>
      <div className="p3-stepper">{["Pack", "Day 1", "Day 2", "Day 3", "Reflect"].map((s, k) => <span key={s} className={(stage === "pick" ? 0 : stage === "days" ? day + 1 : 4) >= k ? "on" : ""}><b>{k + 1}</b>{s}</span>)}</div>
      {stage === "pick" && (
        <>
          <div className="g7-tokens">{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < used ? "used" : ""}>🪙</i>)}<b>{left} tokens left</b></div>
          <div className="g7-island">
            {ISLAND.map((it) => (
              <button key={it.id} type="button" className={`${sel.includes(it.id) ? "on" : ""} ${!sel.includes(it.id) && it.c > left ? "off" : ""}`} onClick={() => tog(it)}>
                <em>{it.e}</em><b>{it.l}</b><small>{it.d}</small><span>{it.c} 🪙</span>
              </button>
            ))}
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!sel.length} onClick={() => { setStage("days"); setDay(0); }}>Start the adventure 🏝️ <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === "days" && (
        <div className="start-block">
          <div className="g7-hearts">{Array.from({ length: 5 }, (_, i) => <span key={i}>{i < hearts ? "❤️" : "🖤"}</span>)}</div>
          <div className="p3-oops"><em>{ISLAND_DAYS[day].e}</em><small>{ISLAND_DAYS[day].t.toUpperCase()}</small><p>{ISLAND_DAYS[day].s}</p></div>
          {ISLAND_DAYS[day].need.map(([id, , bad]) => sel.includes(id)
            ? <div key={id} className="p1-banner good">✅ You have the {ISLAND.find((x) => x.id === id).l.toLowerCase()}! Great choice.</div>
            : <div key={id} className="p1-banner bad">{bad}</div>)}
          {day === 0 && sel.includes("game") && <div className="p1-banner">🎲 The game makes you happy, but it doesn't help you survive.</div>}
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => (day < 2 ? setDay(day + 1) : setStage("reflect"))}>{day < 2 ? "Next day" : "End of the adventure"} <ChevronRight size={18} /></button></div>
        </div>
      )}
      {stage === "reflect" && (
        <div className="start-block">
          <div className="g7-hearts">{Array.from({ length: 5 }, (_, i) => <span key={i}>{i < finalHearts ? "❤️" : "🖤"}</span>)}</div>
          <p className="start-tip">You took: {sel.map((id) => ISLAND.find((x) => x.id === id).e).join(" ")} · You left behind: {ISLAND.filter((x) => !sel.includes(x.id)).map((x) => x.e).join(" ")}</p>
          <p className="start-tip">💡 There is no perfect answer. A smart choice puts NEEDS first.</p>
          <label className="p3-lbl">My most important choice:<input className="start-input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="I chose water because I need it to survive." /></label>
          <label className="p3-lbl">My opportunity cost (what I gave up):<input className="start-input" value={change} onChange={(e) => setChange(e.target.value)} placeholder="I gave up the flashlight, so the night was difficult." /></label>
          <div className="start-foot"><button className="s1-btn primary big" disabled={countWords(why) < 5 || countWords(change) < 5} onClick={() => finish(coins, { items: sel, hearts: finalHearts, why, change })}>Save <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </div>
      )}
    </ActShell>
  );
}

const OPP_CARDS = [
  { e: "🎬", s: "Friday afternoon. You have $25,000.", a: "Go to the movies with friends", b: "Save money for new shoes" },
  { e: "⏰", s: "Saturday morning. You have 2 free hours.", a: "Play video games", b: "Study for Monday's test" },
  { e: "🎂", s: "Your grandma gives you $40,000.", a: "Buy a new video game now", b: "Save for a bicycle" },
  { e: "🍕", s: "Lunch time. You have $10,000.", a: "Buy pizza with friends", b: "Bring lunch from home and keep the money" },
  { e: "🎧", s: "You saved $60,000.", a: "Buy headphones today", b: "Wait for a sale next month", twist: "Surprise! Now you have only $30,000. The headphones cost $60,000. What do you choose now?", ta: "Buy cheaper headphones today", tb: "Keep saving for the good ones" },
];
const OPP_REASONS = ["it is more important for me", "I need it now", "it helps my future", "I can wait", "it is cheaper"];
function OppCostCards({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [twistPick, setTwistPick] = useState(null);
  const [reason, setReason] = useState("");
  const [log, setLog] = useState([]);
  const [st, finish] = useFinish(onSave);
  const c = OPP_CARDS[i];
  const chosen = pick === "a" ? c.a : c.b, given = pick === "a" ? c.b : c.a;
  const needTwist = !!c.twist && pick && twistPick === null;
  const next = () => {
    const nl = [...log, { s: c.s, chose: chosen, gaveUp: given, reason, twist: twistPick }];
    if (i < OPP_CARDS.length - 1) { setLog(nl); setI(i + 1); setPick(null); setTwistPick(null); setReason(""); }
    else finish(20, { decisions: nl });
  };
  if (st.done) return <Reward title="Choice champion! 🃏" subtitle="Every choice has an opportunity cost." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Scale size={22} strokeWidth={2.1} />} title="Opportunity Cost Cards 🃏" subtitle="Choose one. Then discover what you give up." onExit={onExit}>
      <div className="p2-hud"><span>Decision <b>{i + 1}/{OPP_CARDS.length}</b></span></div>
      <div className="p3-oops"><em>{c.e}</em><small>CHOOSE ONE</small><p>{c.s}</p></div>
      <div className="g7-opp">
        {[["a", c.a], ["b", c.b]].map(([k, l]) => <button key={k} type="button" disabled={!!pick} className={pick === k ? "on" : pick ? "off" : ""} onClick={() => setPick(k)}>{l}</button>)}
      </div>
      {pick && (
        <div className="g7-oppcost"><b>If I choose</b> {chosen.toLowerCase()}, <b>I give up</b> {given.toLowerCase()}.<small>👆 That is your opportunity cost.</small></div>
      )}
      {pick && c.twist && (
        <div className="start-block">
          <div className="p1-banner">🔄 {c.twist}</div>
          <div className="g7-opp">{[["a", c.ta], ["b", c.tb]].map(([k, l]) => <button key={k} type="button" disabled={twistPick !== null} className={twistPick === k ? "on" : twistPick ? "off" : ""} onClick={() => setTwistPick(k)}>{l}</button>)}</div>
          {twistPick && <p className="start-tip">💡 When your resources change, your best choice can change too!</p>}
        </div>
      )}
      {pick && !needTwist && (
        <div className="start-block">
          <h3><PenLine size={18} /> I chose this because…</h3>
          <div className="p1-starters">{OPP_REASONS.map((r) => <button key={r} type="button" className={`p1-chip ${reason === r ? "on" : ""}`} onClick={() => setReason(r)}>{r}</button>)}</div>
          <input className="start-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="…or write your own reason" />
          <div className="start-foot"><button className="s1-btn primary big" disabled={countWords(reason) < 2} onClick={next}>{i < OPP_CARDS.length - 1 ? "Next decision" : "Finish"} <ChevronRight size={18} /></button></div>
        </div>
      )}
    </ActShell>
  );
}

const DJ_DECISIONS = ["Save money or buy a snack", "Play or study", "Buy something now or wait", "My own decision"];
const DECISION_JOURNAL = {
  title: "My Decision Journal",
  initial: { d: "", chose: "", why: "", gave: "" },
  valid: (v) => v && v.d && countWords(v.chose) >= 1 && countWords(v.why) >= 3 && countWords(v.gave) >= 2,
  render: (v, set) => (
    <>
      <span className="terms-label">1. A decision I made this week:</span>
      <div className="p1-starters">{DJ_DECISIONS.map((d) => <button key={d} type="button" className={`p1-chip ${v.d === d ? "on" : ""}`} onClick={() => set({ ...v, d })}>{d}</button>)}</div>
      <label className="p3-lbl">2. What did I choose?<input className="start-input" value={v.chose} onChange={(e) => set({ ...v, chose: e.target.value })} placeholder="I saved my money." /></label>
      <label className="p3-lbl">3. Why did I choose it?<input className="start-input" value={v.why} onChange={(e) => set({ ...v, why: e.target.value })} placeholder="Because I want to buy a book." /></label>
      <label className="p3-lbl">4. What did I give up? (my opportunity cost)<input className="start-input" value={v.gave} onChange={(e) => set({ ...v, gave: e.target.value })} placeholder="A snack at break." /></label>
    </>
  ),
};

/* =====================================================================
   CLASE 5 · INFLATION (Grandpa's Empanada)
   ===================================================================== */
const READ_C5 = [
  { h: "Grandpa's Empanada: The Mystery of the Missing Money" },
  { sub: "Part 1 · A very special empanada" },
  { p: "On Sunday afternoon, Tomás visited his grandfather, Don Carlos. On the table, there was a plate of hot, golden empanadas. “Grandpa, how much did an empanada cost when you were a boy?” Don Carlos smiled. “When I was your age, an empanada cost only 50 pesos!”" },
  { p: "Tomás almost dropped his juice. “Fifty pesos? Today, an empanada can cost 3,000 pesos or more!” “Wait! Does that mean money becomes weaker as we get older?” “Sometimes, yes,” Grandpa answered. “And today, you are going to discover why.”" },
  { sub: "Part 2 · The family price machine" },
  { node: <div className="g7-timeline3"><div><small>Grandpa's childhood</small><b>$50</b></div><i>→</i><div><small>Dad's childhood</small><b>$500</b></div><i>→</i><div className="now"><small>Today</small><b>$3,000</b></div></div> },
  { p: "“Why does the same food cost more now?” Tomás asked. “Think about the people who make empanadas,” Grandpa said. “They need corn flour, potatoes, meat, oil, gas and a place to cook. If the ingredients, gas and rent become more expensive, making an empanada costs more. A business may increase its price to cover those higher costs.”" },
  { sub: "Part 3 · The hungry crowd" },
  { p: "“Imagine that I have only 20 empanadas, but 100 hungry people want to buy them. What might happen?” “They could sell out quickly!” Tomás said. “Correct. When many people want to buy something and there is not enough, sellers may charge more. This is another reason prices can rise.”" },
  { sub: "Part 4 · The mystery of the missing money" },
  { p: "Grandpa gave Tomás 10,000 pesos. “An empanada costs 2,000 pesos. How many can you buy?” “Five!” “Now the price rises to 2,500 pesos. How many?” Tomás counted again. “Only four!”" },
  { say: "“You still have 10,000 pesos, but you can buy fewer empanadas. Your money has lost some of its purchasing power.”" },
  { box: "Inflation is a general increase in the prices of goods and services over time. When prices rise, each peso usually buys less than before." },
  { sub: "Part 5 · When prices go crazy" },
  { p: "Grandpa opened a history book. “Sometimes inflation becomes extremely high. In Zimbabwe, the country issued a banknote worth 100 trillion Zimbabwean dollars during a period of hyperinflation. Venezuela has also experienced severe hyperinflation. Families found it difficult to plan because prices changed very quickly.”" },
  { p: "Hyperinflation is an extremely rapid and severe rise in prices. A very big number on a banknote does not mean the money can buy many things." },
  { say: "“Next time you see a price, ask yourself: Is it more expensive because it costs more to produce, because demand is high, or because prices across the economy have increased?”" },
];
const GLOSS_C5 = { "inflation": "Inflación — aumento general de los precios con el tiempo.", "purchasing power": "Poder adquisitivo — cuánto puedes comprar con tu dinero.", "hyperinflation": "Hiperinflación — precios que suben extremadamente rápido.", "goods and services": "Bienes y servicios.", "banknote": "Billete." };
const Q_C5 = [
  { q: "Why can an empanada become more expensive to produce?", options: ["Ingredients, gas and rent cost more.", "Money becomes physically smaller.", "Customers stop eating."], correct: 0, feedback: "Higher production costs → higher price." },
  { q: "What can happen when 100 people want only 20 empanadas?", options: ["There isn't enough, so sellers may charge more.", "Every customer can get ten empanadas each.", "The empanadas become free for all the people."], correct: 0, feedback: "High demand, low supply." },
  { q: "Tomás has $10,000. The empanada goes from $2,000 to $2,500. What changes?", options: ["He can buy fewer empanadas.", "He can buy more empanadas.", "His money is worth double."], correct: 0, feedback: "5 → 4 empanadas: less purchasing power." },
  { q: "What is inflation?", options: ["A general increase in prices over time.", "One product becoming expensive one day.", "A shop selling everything for less money."], correct: 0, feedback: "General + over time." },
  { q: "What is hyperinflation?", options: ["Prices rising extremely fast.", "Prices falling a little every day.", "A store running out of empanadas."], correct: 0, feedback: "Zimbabwe, Venezuela…" },
];
const Q_C5V = [
  { q: "Where did the child go with their dad at the beginning of the video?", options: ["To a museum", "To a fun fair", "To a grocery store", "To a toy factory"], correct: 1, feedback: "A fun fair." },
  { q: "What did the dad look shocked about when he paid for the first treat?", options: ["They ran out of tickets for the rides", "How much the treat's price had risen", "The treat store was already closed", "He forgot his wallet at home"], correct: 1, feedback: "The price had gone up!" },
  { q: "What comparison did the dad use to explain inflation?", options: ["A balloon getting bigger", "A car speeding up", "A tree growing taller", "A rocket launching"], correct: 0, feedback: "Like a balloon being blown up." },
  { q: "According to the video, what is inflation?", options: ["When the money in circulation decreases", "When the price of items increases", "When businesses stop producing toys", "When stores give items away"], correct: 1, feedback: "Prices get bigger." },
  { q: "What kinds of things change in price because of inflation?", options: ["Only food and drinks at the fair", "Only luxury cars and big houses", "Food, toys, clothes, bikes — everything", "Nothing changes; prices stay the same"], correct: 2, feedback: "Everything!" },
  { q: "Why can inflation be bad for people who produce things (like cars)?", options: ["The cars break down more easily", "Cars become too heavy to drive", "Fewer people can afford to buy them", "Factories run out of electricity"], correct: 2, feedback: "Fewer buyers." },
  { q: "What happens to the value of your money with inflation?", options: ["It gains value over time", "It loses value: it buys less", "It turns into digital money", "Nothing happens to it"], correct: 1, feedback: "The same money buys less." },
  { q: "If inflation is 7 percent, what does it mean for your money?", options: ["It is worth 7% more than before", "You get a 7% raise at work", "It is worth 7% less than before", "You must pay a 7% tax on it"], correct: 2, feedback: "7% less purchasing power." },
  { q: "What happens to mom's grocery budget when prices go up?", options: ["She gets fewer items for her budget", "She gets some extra items for free", "She stops buying groceries at all", "She gets double the food for less"], correct: 0, feedback: "Fewer items for the same money." },
  { q: "What is one reason why inflation happens?", options: ["New laws ban low prices in stores", "People want more than what is available", "People stop using money to buy things", "The weather changes the toy stores"], correct: 1, feedback: "Demand higher than supply." },
  { q: "What example did the dad use for rising production costs?", options: ["Building a smartphone", "Making bread", "Sewing a jacket", "Making a bicycle wheel"], correct: 1, feedback: "A loaf of bread." },
  { q: "At the end, what did the child joke had NOT inflated?", options: ["Their school grades", "Their red balloon", "Their pocket money", "Their own height"], correct: 2, feedback: "Pocket money! 😄" },
];

const ERAS = [
  { y: 1990, e: "📼", n: "The past" }, { y: 2005, e: "📟", n: "The middle" }, { y: 2026, e: "📱", n: "Today" },
];
// Datos de juego (no son precios históricos oficiales)
const TM_PRODUCTS = [
  { e: "🥟", n: "Empanada", p: [300, 1000, 3000] },
  { e: "🍞", n: "Bread roll", p: [100, 300, 700] },
  { e: "🥛", n: "Milk (1 L)", p: [400, 1500, 4200] },
  { e: "📓", n: "Notebook", p: [800, 2500, 5000] },
  { e: "🚌", n: "Bus fare", p: [250, 1200, 3200] },
];
function TimeMachine({ onSave, onExit }) {
  const [era, setEra] = useState(0);
  const [step, setStep] = useState("guess");
  const [guess, setGuess] = useState(null);
  const [ans, setAns] = useState("");
  const [score, setScore] = useState(0);
  const [st, finish] = useFinish(onSave);
  const gp = TM_PRODUCTS[era === 0 ? 0 : era === 1 ? 4 : 2];
  const opts = useMemo(() => shuffleArr([gp.p[era], Math.round(gp.p[era] * 2.5 / 50) * 50, Math.max(50, Math.round(gp.p[era] * 0.3 / 50) * 50)]), [era]); // eslint-disable-line react-hooks/exhaustive-deps
  const emp = TM_PRODUCTS[0].p[era];
  const howMany = Math.floor(10000 / emp);
  const ok = num(ans) === howMany;
  const nextEra = () => { if (era < 2) { setEra(era + 1); setStep("guess"); setGuess(null); setAns(""); } else setStep("final"); };
  if (st.done) return <Reward title="Time traveler! ⏳" subtitle="Same $10,000, very different shopping." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Clock size={22} strokeWidth={2.1} />} title="Price Time Machine ⏳" subtitle="Travel to 1990, 2005 and 2026. What can $10,000 buy?" onExit={onExit}>
      <div className="g7-eras">{ERAS.map((e, k) => <span key={e.y} className={k === era && step !== "final" ? "cur" : k < era || step === "final" ? "on" : ""}><em>{e.e}</em><b>{e.y}</b><small>{e.n}</small></span>)}</div>
      <p className="start-tip p1-center">🎮 Game data: prices are examples to learn the idea, not official history.</p>
      {step === "guess" && (
        <div className="start-block">
          <h3>🔮 Welcome to {ERAS[era].y}! Guess: how much is a {gp.n.toLowerCase()} {gp.e}?</h3>
          <div className="g7-pricebtns">{opts.map((o) => <button key={o} type="button" disabled={guess !== null} className={guess === null ? "" : o === gp.p[era] ? "ok" : guess === o ? "no" : ""} onClick={() => { setGuess(o); if (o === gp.p[era]) setScore((s) => s + 1); }}>{cop(o)}</button>)}</div>
          {guess !== null && (
            <>
              <div className="g7-eraprices">{TM_PRODUCTS.map((p) => <div key={p.n}><em>{p.e}</em><span>{p.n}</span><b>{cop(p.p[era])}</b></div>)}</div>
              <div className="start-foot"><button className="s1-btn primary" onClick={() => setStep("money")}>The $10,000 challenge <ChevronRight size={16} /></button></div>
            </>
          )}
        </div>
      )}
      {step === "money" && (
        <div className="start-block">
          <h3>💵 In {ERAS[era].y} an empanada costs {cop(emp)}. How many empanadas can you buy with {cop(10000)}?</h3>
          <div className="p4-calc"><span>{cop(10000)} ÷ {cop(emp)} =</span><input className="start-input p2-num" type="number" value={ans} onChange={(e) => setAns(e.target.value)} placeholder="?" /><span>empanadas</span><b className={ans === "" ? "" : ok ? "ok" : "no"}>{ans === "" ? "" : ok ? "✓" : "Try again (whole empanadas!)"}</b></div>
          {ok && <div className="g7-emps">{Array.from({ length: Math.min(howMany, 40) }, (_, i) => <span key={i}>🥟</span>)}{howMany > 40 && <b>+{howMany - 40}</b>}</div>}
          {ok && <div className="start-foot"><button className="s1-btn primary big" onClick={() => { setScore((s) => s + 1); nextEra(); }}>{era < 2 ? `Travel to ${ERAS[era + 1].y} ⏩` : "See the results"} <ChevronRight size={18} /></button></div>}
        </div>
      )}
      {step === "final" && (
        <div className="start-block">
          <h3><BarChart3 size={18} /> Same $10,000 · how many empanadas?</h3>
          <BarChart bars={ERAS.map((e, k) => ({ label: String(e.y), value: Math.floor(10000 / TM_PRODUCTS[0].p[k]), color: COLORS[k] }))} money={false} unit=" 🥟" />
          <LineChart labels={ERAS.map((e) => String(e.y))} series={TM_PRODUCTS.slice(0, 3).map((p, i) => ({ name: p.n, values: p.p, color: COLORS[i] }))} />
          <ChartLegend series={TM_PRODUCTS.slice(0, 3).map((p, i) => ({ name: p.n, color: COLORS[i] }))} />
          <div className="p1-banner good">Prices went up, so the same money buys less: that is lost purchasing power. 💸</div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(12 + score * 3, { score })}>Finish <span className="coin-tag"><Coins size={15} /> +{12 + score * 3}</span></button></div>
        </div>
      )}
    </ActShell>
  );
}

const CAUSES = [
  { id: "cost", label: "Production costs", icon: "🏭", color: "#e0563f" },
  { id: "demand", label: "Demand > supply", icon: "👥", color: "#0b7a50" },
  { id: "general", label: "General price increase", icon: "🎈", color: "#16b074" },
];
const CAUSE_ITEMS = [
  { label: "The price of flour, oil and gas increases. Making each empanada costs more.", answer: "cost" },
  { label: "A famous singer visits the school. Everybody wants the same snack, but the shop has only ten.", answer: "demand" },
  { label: "Over the year, food, transport, rent and clothes all cost a little more.", answer: "general", why: "Many prices rising together = inflation." },
  { label: "Fuel becomes expensive, so transporting fruit to the city costs more.", answer: "cost" },
  { label: "Tickets for the final match sell out in five minutes.", answer: "demand" },
  { label: "The family basket costs 7% more than last year.", answer: "general" },
];
const CAUSES_INTRO = <div className="p4-def"><b>🕵️ Be careful!</b><p>One expensive product does NOT always mean inflation. A product can be expensive because of <b>costs</b> or <b>demand</b>. Inflation is when <b>many prices rise together over time</b>.</p></div>;
/* Tracker #4: ¿cuál de mis productos subió más desde la Clase 1? */
function TrackerFour({ resp, existing, onSave, onExit }) {
  const d = trackerData(resp);
  const extra = {
    title: "Which of your products went up the most since Class 1?",
    initial: "",
    valid: (v) => !!v,
    render: (v, set, entries) => {
      const ch = d.chosen.map((id) => ({ id, c: pctChange(Number(resp?.c1_tracker?.entries?.[id]?.price || prodOf(id).p[0]), num(entries?.[id]?.price)) }));
      const best = ch.slice().sort((a, b) => b.c - a.c)[0];
      return (
        <>
          <div className="g7-opp">{d.chosen.map((id) => <button key={id} type="button" className={v === id ? (id === best.id ? "on" : "off") : ""} onClick={() => set(id)}>{prodOf(id).e} {prodOf(id).n}</button>)}</div>
          {v && <div className={`p1-banner ${v === best.id ? "good" : "bad"}`}>{v === best.id ? "Correct! " : "Look again! "}{ch.map((x) => `${prodOf(x.id).e} ${fmtPct(x.c)}`).join(" · ")}</div>}
        </>
      );
    },
  };
  return <TrackerCheck week={4} resp={resp} existing={existing} extra={extra} onSave={onSave} onExit={onExit} />;
}

/* =====================================================================
   CLASE 6 · PURCHASING POWER (Same Money, Smaller Cart)
   ===================================================================== */
const PP_CARDS = [
  { e: "💪", t: "Purchasing power", d: "How many goods and services your money can buy.", ex: "With $10,000 you buy 5 empanadas at $2,000. If the price is $2,500, you buy only 4. Your purchasing power went down." },
  { e: "🧺", t: "Family basket (canasta familiar)", d: "The group of products a family buys every month: food, transport, cleaning products…", ex: "Economists watch the price of this basket to measure inflation." },
  { e: "📈", t: "Inflation rate", d: "How much prices increased, in percent (%), in a period of time.", ex: "“Inflation was 7%” = the basket costs about 7% more than one year ago." },
  { e: "🧮", t: "Percent change", d: "(New price − old price) ÷ old price × 100", ex: "$2,000 → $2,500: (500 ÷ 2,000) × 100 = 25%." },
  { e: "🛒", t: "Same money, smaller cart", d: "If prices go up and your money stays the same, your cart gets smaller.", ex: "That's why families compare prices and choose cheaper options." },
];
const PP_CHECK = [
  { tag: "CHECK", q: "Purchasing power means…", options: ["how much your money can buy", "how strong you are", "the price of one product"], correct: 0, explain: "Money's buying power." },
  { tag: "CHECK", q: "Prices go up 10% and your money stays the same. Your purchasing power…", options: ["goes down", "goes up", "stays the same"], correct: 0, explain: "You can buy less." },
  { tag: "CHECK", q: "A notebook goes from $4,000 to $5,000. What is the percent change?", options: ["25%", "1,000%", "20%"], correct: 0, explain: "1,000 ÷ 4,000 × 100 = 25%." },
];
function SameMoneyLearn({ onSave, onExit }) {
  const [opened, setOpened] = useState({});
  const [stage, setStage] = useState("cards");
  const [st, finish] = useFinish(onSave);
  const all = PP_CARDS.every((_, i) => opened[i]);
  if (st.done) return <Reward title="Concepts unlocked! 🔓" subtitle="Now let's go shopping." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Lightbulb size={22} strokeWidth={2.1} />} title="Same Money, Smaller Cart 🛒" subtitle="5 key ideas. Open every card, then check your understanding." onExit={onExit}>
      {stage === "cards" ? (
        <>
          <div className="g7-concepts">
            {PP_CARDS.map((c, i) => (
              <button key={c.t} type="button" className={`g7-concept ${opened[i] ? "open" : ""}`} onClick={() => setOpened({ ...opened, [i]: true })}>
                <em>{c.e}</em><b>{c.t}</b>{opened[i] ? <><p>{c.d}</p><small>💡 {c.ex}</small></> : <small className="g7-tap">Tap to open</small>}
              </button>
            ))}
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!all} onClick={() => setStage("check")}>{all ? "Check my understanding" : `Open all the cards (${Object.keys(opened).length}/5)`} <ChevronRight size={18} /></button></div>
        </>
      ) : <RoundsRunner rounds={PP_CHECK} onDone={(r) => finish(8 + r.firstTry * 3, r)} />}
    </ActShell>
  );
}

// Datos de juego: mismo producto, 2020 vs 2026
const CART = [
  { id: "rice", e: "🍚", n: "Rice (2 kg)", a: 6000, b: 9000, k: "need" },
  { id: "eggs", e: "🥚", n: "Eggs (12)", a: 5000, b: 8000, k: "need" },
  { id: "milk", e: "🥛", n: "Milk (2 L)", a: 5000, b: 8400, k: "need" },
  { id: "bread", e: "🍞", n: "Bread", a: 4000, b: 6500, k: "need" },
  { id: "chicken", e: "🍗", n: "Chicken (1 kg)", a: 9000, b: 14000, k: "need" },
  { id: "arepas", e: "🫓", n: "Arepas", a: 3000, b: 4800, k: "need" },
  { id: "banana", e: "🍌", n: "Bananas", a: 2500, b: 3300, k: "need" },
  { id: "tomato", e: "🍅", n: "Tomatoes", a: 2000, b: 3500, k: "need" },
  { id: "soda", e: "🥤", n: "Soda", a: 3000, b: 5000, k: "want" },
  { id: "choco", e: "🍫", n: "Chocolate", a: 1500, b: 3500, k: "want" },
  { id: "cookies", e: "🍪", n: "Cookies", a: 2500, b: 4000, k: "want" },
];
const BUDGET = 50000;
function CartChallenge({ onSave, onExit }) {
  const [stage, setStage] = useState("2020");
  const [cart, setCart] = useState([]);
  const [cart26, setCart26] = useState([]);
  const [why, setWhy] = useState("");
  const [st, finish] = useFinish(onSave);
  const sum = (ids, k) => ids.reduce((a, id) => a + CART.find((x) => x.id === id)[k], 0);
  const t20 = sum(cart, "a"), sameCart26 = sum(cart, "b"), t26 = sum(cart26, "b");
  const tog20 = (id) => { if (cart.includes(id)) setCart(cart.filter((x) => x !== id)); else if (t20 + CART.find((x) => x.id === id).a <= BUDGET) setCart([...cart, id]); };
  const tog26 = (id) => { if (cart26.includes(id)) setCart26(cart26.filter((x) => x !== id)); else if (t26 + CART.find((x) => x.id === id).b <= BUDGET) setCart26([...cart26, id]); };
  const removed = cart.filter((id) => !cart26.includes(id));
  const incr = pctChange(t20, sameCart26);
  if (st.done) return <Reward title="Cart challenge complete! 🛒" subtitle={`${cart.length} products in 2020 → ${cart26.length} in 2026.`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  const Row = ({ it, on, year, onClick, dis }) => (
    <button type="button" className={`g7-cartitem ${on ? "on" : ""} ${dis ? "off" : ""}`} onClick={onClick}>
      <em>{it.e}</em><b>{it.n}</b><span className={`p4-tag ${it.k}`}>{it.k === "need" ? "Need" : "Want"}</span>
      <strong>{cop(year === "a" ? it.a : it.b)}</strong>{year === "b" && <small className="g7-was">was {cop(it.a)}</small>}
    </button>
  );
  return (
    <ActShell icon={<ShoppingCart size={22} strokeWidth={2.1} />} title="Cart Challenge · Same $50,000" subtitle="Fill the family cart in 2020. Then go back with the same money in 2026." onExit={onExit}>
      <div className="p3-stepper">{["2020", "2026", "Results"].map((s, k) => <span key={s} className={["2020", "2026", "results"].indexOf(stage) >= k ? "on" : ""}><b>{k + 1}</b>{s}</span>)}</div>
      <p className="start-tip p1-center">🎮 Game data: example prices to understand purchasing power.</p>
      {stage === "2020" && (
        <>
          <div className="g7-budget"><span>📅 2020 · Budget {cop(BUDGET)}</span><div className="p3-mini-bar"><i style={{ width: `${(t20 / BUDGET) * 100}%` }} /></div><b>{cop(t20)} · left {cop(BUDGET - t20)}</b></div>
          <div className="g7-cart">{CART.map((it) => <Row key={it.id} it={it} year="a" on={cart.includes(it.id)} dis={!cart.includes(it.id) && t20 + it.a > BUDGET} onClick={() => tog20(it.id)} />)}</div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={cart.length < 6} onClick={() => { setCart26(cart); setStage("2026"); }}>{cart.length < 6 ? `Add at least 6 products (${cart.length})` : "Travel to 2026 ⏩"}</button></div>
        </>
      )}
      {stage === "2026" && (
        <>
          <div className="p1-banner bad">😱 Your same cart now costs <b>{cop(sameCart26)}</b> — that's <b>{fmtPct(incr)}</b>! You still have only {cop(BUDGET)}. Remove products until you are in budget.</div>
          <div className={`g7-budget ${t26 > BUDGET ? "over" : ""}`}><span>📅 2026 · Budget {cop(BUDGET)}</span><div className="p3-mini-bar"><i style={{ width: `${Math.min(100, (t26 / BUDGET) * 100)}%` }} /></div><b>{cop(t26)} {t26 > BUDGET ? `· ${cop(t26 - BUDGET)} over!` : `· left ${cop(BUDGET - t26)}`}</b></div>
          <div className="g7-cart">{CART.filter((it) => cart.includes(it.id)).map((it) => <Row key={it.id} it={it} year="b" on={cart26.includes(it.id)} onClick={() => tog26(it.id)} />)}</div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={t26 > BUDGET} onClick={() => setStage("results")}>{t26 > BUDGET ? "Remove products first" : "See my results"} <ChevronRight size={18} /></button></div>
        </>
      )}
      {stage === "results" && (
        <div className="start-block">
          <div className="p3-fin">
            <div><small>2020 cart</small><b>{cart.length} products</b></div>
            <div className="loss"><small>2026 cart</small><b>{cart26.length} products</b></div>
            <div className="loss big"><small>Same cart price change</small><b>{fmtPct(incr)}</b></div>
          </div>
          <BarChart bars={[{ label: "2020", value: t20, color: COLORS[0] }, { label: "Same cart 2026", value: sameCart26, color: COLORS[3] }, { label: "Budget", value: BUDGET, color: COLORS[2] }]} />
          <p className="start-tip">🗑️ You removed: {removed.map((id) => CART.find((x) => x.id === id).e + " " + CART.find((x) => x.id === id).n).join(", ") || "nothing"}</p>
          <div className="g7-frames">
            <p>In 2020 I could buy <b>{cart.length}</b> products. In 2026 I can buy only <b>{cart26.length}</b> products with the same {cop(BUDGET)}.</p>
          </div>
          <div className="p3-sentence edit"><span>Products left the cart because</span><input className="start-input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="prices went up and my money stayed the same, so I lost purchasing power." /></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={countWords(why) < 6} onClick={() => finish(30, { cart, cart26, t20, sameCart26, incr, why })}>Save my results <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
        </div>
      )}
    </ActShell>
  );
}

const PERCENT_INTRO = (
  <div className="start-explain g7-formula-box">
    <h3>🧮 How to calculate the percent change</h3>
    <div className="g7-steps3">
      <div><b>1</b><span>Find the difference</span><small>New − old<br />$2,500 − $2,000 = <b>$500</b></small></div>
      <div><b>2</b><span>Divide by the OLD price</span><small>$500 ÷ $2,000 = <b>0.25</b></small></div>
      <div><b>3</b><span>Multiply by 100</span><small>0.25 × 100 = <b>25%</b></small></div>
    </div>
    <p>If the new price is <b>lower</b>, the answer is negative: the price went down. Example: $5,000 → $4,500 = <b>−10%</b>.</p>
  </div>
);
const PERCENT_ROUNDS = [
  { q: "A notebook went from $5,000 to $6,000. What is the percent increase?", answer: 20, unit: "%", hint: "Difference = $1,000. Then 1,000 ÷ 5,000 × 100.", explain: "1,000 ÷ 5,000 = 0.2 → 20%." },
  { q: "The bus fare went from $2,500 to $3,000. What is the percent increase?", answer: 20, unit: "%", hint: "Difference = $500. 500 ÷ 2,500 × 100.", explain: "500 ÷ 2,500 = 0.2 → 20%." },
  { q: "An arepa went from $4,000 to $5,000. What is the percent increase?", answer: 25, unit: "%", hint: "1,000 ÷ 4,000 × 100.", explain: "0.25 → 25%." },
  { q: "A liter of milk went from $4,000 to $4,200. What is the percent increase?", answer: 5, unit: "%", hint: "200 ÷ 4,000 × 100.", explain: "0.05 → 5%. A small increase." },
  { q: "Bread went from $5,000 to $4,500. What is the percent change? (Use − if it went down.)", answer: -10, unit: "%", hint: "Difference = −500. −500 ÷ 5,000 × 100.", explain: "−0.1 → −10%. The price went DOWN." },
  { q: "A movie ticket went from $20,000 to $25,000. What is the percent increase?", answer: 25, unit: "%", hint: "5,000 ÷ 20,000 × 100.", explain: "0.25 → 25%." },
];

/* Tracker #5: % de cambio automático + el estudiante calcula uno */
function TrackerFive({ resp, existing, onSave, onExit }) {
  const d = trackerData(resp);
  const pid = d.chosen[0];
  const first = Number(resp?.c1_tracker?.entries?.[pid]?.price || prodOf(pid).p[0]);
  const extra = {
    title: `Your turn: calculate the % change of ${prodOf(pid).e} ${prodOf(pid).n} since Class 1`,
    initial: "",
    valid: (v) => v !== "" && v != null,
    render: (v, set, entries) => {
      const now = num(entries?.[pid]?.price);
      const real = pctChange(first, now);
      const ok = v !== "" && Math.abs(num(v) - real) <= 0.6;
      return (
        <>
          <p className="start-tip">Class 1: <b>{cop(first)}</b> → Today: <b>{cop(now)}</b>. (New − old) ÷ old × 100</p>
          <div className="p4-calc"><span>% change =</span><input className="start-input p2-num" type="number" step="0.1" value={v} onChange={(e) => set(e.target.value)} placeholder="%" /><b className={v === "" ? "" : ok ? "ok" : "no"}>{v === "" ? "" : ok ? `✓ ${fmtPct(real)}` : "Check your math (1 decimal is OK)"}</b></div>
          <div className="g7-pctlist">{d.chosen.map((id) => { const f = Number(resp?.c1_tracker?.entries?.[id]?.price || prodOf(id).p[0]); const n2 = num(entries?.[id]?.price); const c = pctChange(f, n2); return <span key={id} className={c > 0 ? "up" : c < 0 ? "down" : ""}>{prodOf(id).e} {cop(f)} → {cop(n2)} <b>{fmtPct(c)}</b></span>; })}</div>
        </>
      );
    },
  };
  return <TrackerCheck week={5} resp={resp} existing={existing} extra={extra} onSave={onSave} onExit={onExit} />;
}

/* =====================================================================
   CLASE 7 · READING PRICE GRAPHS & TRENDS
   ===================================================================== */
const Q_C7 = [
  { q: "Who is the host of the show “Price News”?", options: ["Maria", "Tomás", "Alex", "A local farmer"], correct: 2, feedback: "Alex is the host." },
  { q: "By how much did the price of a dozen eggs increase in the news example?", options: ["2 percent", "5 percent", "10 percent", "15 percent"], correct: 1, feedback: "5 percent." },
  { q: "A family goes to the supermarket with 20,000 pesos and prices have increased. What can happen?", options: ["They can buy double the food with it", "They may need to buy fewer or cheaper things", "They receive free products from the store", "Their money doubles in their pocket"], correct: 1, feedback: "Fewer things or cheaper products." },
  { q: "According to Maria, why can food prices go up?", options: ["Store owners want to close their shops early", "Costs like transport, fuel and materials go up", "Nobody wants to buy food anymore", "The shelves in the stores are too full"], correct: 1, feedback: "Production costs go up." },
  { q: "What is the definition of “inflation” in the audio?", options: ["Prices decrease little by little over time", "A general increase in prices over time", "A special discount in supermarkets", "Money that you save in a bank account"], correct: 1, feedback: "General increase over time." },
  { q: "Which of these is a “service” according to the script?", options: ["Bread", "A haircut", "Clothes", "A notebook"], correct: 1, feedback: "A haircut is a service." },
  { q: "In Tomás's example, how many empanadas could he buy when the price rose from 2,000 to 2,500 pesos?", options: ["Five", "Six", "Three", "Four"], correct: 3, feedback: "10,000 ÷ 2,500 = 4." },
  { q: "What phrase describes when your money buys fewer things because prices went up?", options: ["Loss of purchasing power", "High interest rates", "Foreign exchange rate", "Increase in savings"], correct: 0, feedback: "Loss of purchasing power." },
  { q: "Which country issued a 100 trillion-dollar banknote during hyperinflation?", options: ["Colombia", "Zimbabwe", "The United States", "Japan"], correct: 1, feedback: "Zimbabwe." },
  { q: "What does “hyperinflation” mean according to the audio?", options: ["Prices stay the same for many years", "Prices rise extremely quickly", "Prices drop all the way to zero", "People stop using credit cards"], correct: 1, feedback: "Extremely fast price increases." },
  { q: "What is the second tip from the financial expert?", options: ["Compare prices before buying anything", "Make a budget of your money and needs", "Always buy the most expensive products", "Spend your money on wants first"], correct: 1, feedback: "Make a budget." },
  { q: "Why is saving money not just about buying the cheapest product?", options: ["Expensive products are always worse", "Quality, size and how long it lasts matter too", "Cheap products are not allowed in stores", "Stores change their prices every hour"], correct: 1, feedback: "Quality, size and duration matter." },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const GW = [
  { w: "rise / increase / go up", v: [2, 3, 4, 5, 6, 7], ex: "The price rose from $2,000 to $7,000." },
  { w: "fall / drop / decrease / go down", v: [7, 6, 5, 4, 3, 2], ex: "The price dropped in June." },
  { w: "stay the same / remain stable", v: [4, 4, 4, 4, 4, 4], ex: "The price remained stable all year." },
  { w: "reach a peak", v: [2, 4, 7, 4, 3, 2], ex: "The price reached a peak in March." },
  { w: "fluctuate", v: [3, 6, 2, 6, 3, 5], ex: "The price of bananas fluctuated: up, down, up." },
  { w: "sharply (very fast)", v: [2, 2, 2, 7, 7, 7], ex: "The price increased sharply in April." },
  { w: "slightly (a little)", v: [4, 4.2, 4.4, 4.5, 4.7, 4.8], ex: "The price went up slightly." },
  { w: "gradually (slowly, step by step)", v: [2, 3, 3.8, 4.6, 5.3, 6], ex: "Prices increased gradually over six months." },
];
const mini = (v) => <div className="g7-minichart"><LineChart labels={MONTHS} series={[{ name: "", values: v.map((x) => x * 1000), color: "#16b074" }]} height={170} /></div>;
const GW_ROUNDS = [
  { tag: "TREND MATCH", q: "Which sentence describes this graph?", visual: mini([2, 3, 4, 5, 6, 7]), options: ["The price rose steadily.", "The price dropped.", "The price stayed the same."], correct: 0, explain: "Up, up, up: it rose." },
  { tag: "TREND MATCH", q: "Which sentence describes this graph?", visual: mini([6, 6, 6, 6, 6, 6]), options: ["The price fluctuated.", "The price remained stable.", "The price reached a peak."], correct: 1, explain: "A flat line = stable." },
  { tag: "TREND MATCH", q: "Which sentence describes this graph?", visual: mini([2, 3, 7, 4, 3, 2]), options: ["The price reached a peak in March.", "The price dropped in January.", "The price increased every month."], correct: 0, explain: "The highest point is the peak." },
  { tag: "TREND MATCH", q: "Which sentence describes this graph?", visual: mini([3, 6, 2, 6, 3, 5]), options: ["The price fluctuated.", "The price rose gradually.", "The price stayed the same."], correct: 0, explain: "Up and down = fluctuate." },
  { tag: "SHARP OR SLIGHT?", q: "How did the price change between March and April?", visual: mini([2, 2, 2, 7, 7, 7]), options: ["It increased sharply.", "It increased slightly.", "It decreased gradually."], correct: 0, explain: "A big jump = sharply." },
  { tag: "SHARP OR SLIGHT?", q: "How did the price change?", visual: mini([5, 4.9, 4.8, 4.7, 4.6, 4.5]), options: ["It dropped sharply.", "It dropped slightly.", "It rose gradually."], correct: 1, explain: "A small change = slightly." },
  { tag: "VOCABULARY", q: "“The price went down” means the same as…", options: ["The price dropped.", "The price peaked.", "The price remained stable."], correct: 0, explain: "go down = drop = fall = decrease." },
  { tag: "VOCABULARY", q: "Which word means “slowly, step by step”?", options: ["gradually", "sharply", "suddenly"], correct: 0, explain: "Gradually = little by little." },
];
function GraphWords({ onSave, onExit }) {
  const [opened, setOpened] = useState({});
  const [stage, setStage] = useState("learn");
  const [st, finish] = useFinish(onSave);
  const all = GW.every((_, i) => opened[i]);
  if (st.done) return <Reward title="Graph talker! 📈" subtitle="Now you have the words to describe any graph." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<TrendingUp size={22} strokeWidth={2.1} />} title="Graph Words 📈📉" subtitle="Learn the words to describe graphs. Then match them." onExit={onExit}>
      <div className="p3-stepper"><span className="on"><b>1</b>Learn</span><span className={stage === "play" ? "on" : ""}><b>2</b>Trend match</span></div>
      {stage === "learn" ? (
        <>
          <div className="g7-gwords">
            {GW.map((g, i) => (
              <button key={g.w} type="button" className={`g7-gword ${opened[i] ? "open" : ""}`} onClick={() => setOpened({ ...opened, [i]: true })}>
                <Sparkline values={g.v} color={i % 2 ? "#e0563f" : "#16b074"} />
                <b>{g.w}</b>{opened[i] ? <small>“{g.ex}”</small> : <small className="g7-tap">Tap for an example</small>}
              </button>
            ))}
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!all} onClick={() => setStage("play")}>{all ? "Let's play!" : `Open all the words (${Object.keys(opened).length}/${GW.length})`} <ChevronRight size={18} /></button></div>
        </>
      ) : <RoundsRunner rounds={GW_ROUNDS} onDone={(r) => finish(8 + r.firstTry * 2, r)} />}
    </ActShell>
  );
}

const GD_ROUNDS = [
  { tag: "GRAPH 1 · LINE", q: "Egg prices (12 eggs). In which month did the price reach a peak?", visual: <LineChart labels={MONTHS} series={[{ name: "Eggs", values: [7000, 7200, 7800, 8600, 8200, 8000] }]} />, options: ["January", "April", "June"], correct: 1, explain: "$8,600 in April is the highest point." },
  { tag: "GRAPH 1 · LINE", q: "How much did the price of eggs increase from January to April?", visual: <LineChart labels={MONTHS} series={[{ name: "Eggs", values: [7000, 7200, 7800, 8600, 8200, 8000] }]} />, answer: 1600, money: true, hint: "$8,600 − $7,000", explain: "$1,600 more." },
  { tag: "GRAPH 2 · BARS", q: "Price of one arepa in 4 stores. Which store is the cheapest?", visual: <BarChart bars={[{ label: "Store A", value: 4500 }, { label: "Store B", value: 3800 }, { label: "Store C", value: 5000 }, { label: "Store D", value: 4200 }]} />, options: ["Store A", "Store B", "Store D"], correct: 1, explain: "Store B: $3,800." },
  { tag: "GRAPH 2 · BARS", q: "What is the difference between the most expensive and the cheapest store?", visual: <BarChart bars={[{ label: "Store A", value: 4500 }, { label: "Store B", value: 3800 }, { label: "Store C", value: 5000 }, { label: "Store D", value: 4200 }]} />, answer: 1200, money: true, hint: "$5,000 − $3,800", explain: "$1,200." },
  { tag: "GRAPH 3 · TWO LINES", q: "Milk 🟢 and bread 🟠. Which statement is TRUE?", visual: <><LineChart labels={MONTHS} series={[{ name: "Milk", values: [4000, 4000, 4100, 4100, 4200, 4200] }, { name: "Bread", values: [5000, 5500, 6000, 6500, 7000, 7500] }]} /><ChartLegend series={[{ name: "Milk" }, { name: "Bread" }]} /></>, options: ["Bread increased sharply; milk increased slightly.", "Milk increased sharply; bread stayed the same.", "Both prices dropped."], correct: 0, explain: "Bread +$2,500, milk +$200." },
  { tag: "GRAPH 4 · TREND", q: "Banana prices. How can you describe this trend?", visual: <LineChart labels={MONTHS} series={[{ name: "Bananas", values: [3000, 3600, 2800, 3500, 2900, 3400] }]} />, options: ["The price fluctuated.", "The price remained stable.", "The price rose gradually."], correct: 0, explain: "Up, down, up, down: it fluctuated." },
  { tag: "GRAPH 5 · PERCENT", q: "Coffee went from $10,000 in January to $12,000 in June. What is the percent increase?", visual: <LineChart labels={MONTHS} series={[{ name: "Coffee", values: [10000, 10400, 10800, 11200, 11600, 12000] }]} />, answer: 20, unit: "%", hint: "2,000 ÷ 10,000 × 100", explain: "20%: a gradual increase." },
  { tag: "GRAPH 6 · CAREFUL!", q: "This graph starts at $9,000 (not at zero). Did the price double?", visual: <LineChart labels={MONTHS} series={[{ name: "Juice", values: [9000, 9100, 9300, 9500, 9800, 10000] }]} yMin={9000} yMax={10100} />, options: ["No. It rose only about 11%. Look at the axis.", "Yes. The line is twice as high, so it doubled.", "No. The line shows that the price went down."], correct: 0, explain: "Always read the numbers on the axis! Graphs can look bigger than they are." },
];

/* Plot It! — el estudiante coloca los puntos y la gráfica se construye */
function PointSetter({ labels, values, setValues, max = 6000, step = 500, kind = "line", target }) {
  return (
    <div className="g7-plot">
      {kind === "line"
        ? <LineChart labels={labels} series={[{ name: "You", values, color: "#f5b23e" }, ...(target ? [{ name: "Target", values: target, color: "#16b07455" }] : [])]} yMin={0} yMax={max} />
        : <BarChart bars={labels.map((l, i) => ({ label: l, value: values[i], color: COLORS[i] }))} max={max} />}
      <div className="g7-sliders">
        {labels.map((l, i) => (
          <label key={l}><span>{l}</span>
            <button type="button" onClick={() => setValues(values.map((v, k) => (k === i ? Math.max(0, v - step) : v)))}><Minus size={14} /></button>
            <input type="range" min="0" max={max} step={step} value={values[i]} onChange={(e) => setValues(values.map((v, k) => (k === i ? Number(e.target.value) : v)))} />
            <button type="button" onClick={() => setValues(values.map((v, k) => (k === i ? Math.min(max, v + step) : v)))}><Plus size={14} /></button>
            <b>{cop(values[i])}</b>
          </label>
        ))}
      </div>
    </div>
  );
}
const PLOT_L1 = [2000, 2500, 3500, 3000, 4000, 4500];
const PLOT_L2 = [3500, 5000, 2500, 4000];
const STORES = ["Store A", "Store B", "Store C", "Store D"];
function PlotIt({ onSave, onExit }) {
  const [lvl, setLvl] = useState(1);
  const [v1, setV1] = useState([0, 0, 0, 0, 0, 0]);
  const [v2, setV2] = useState([0, 0, 0, 0]);
  const [v3, setV3] = useState([0, 0, 0, 0, 0, 0]);
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState(null);
  const [st, finish] = useFinish(onSave);
  const eq = (a, b) => a.every((x, i) => x === b[i]);
  // Nivel 3: "Starts at $2,000, rises sharply to $5,000 in March, drops slightly in April and stays the same until June."
  const l3ok = v3[0] === 2000 && v3[2] === 5000 && v3[1] < v3[2] && v3[2] - v3[1] >= 1500 && v3[3] < v3[2] && v3[2] - v3[3] <= 1000 && v3[3] === v3[4] && v3[4] === v3[5];
  const check = () => {
    const ok = lvl === 1 ? eq(v1, PLOT_L1) : lvl === 2 ? eq(v2, PLOT_L2) : l3ok;
    if (ok) { setMsg({ good: true, t: "🎉 Perfect graph!" }); }
    else { setTries((t) => t + 1); setMsg({ good: false, t: lvl === 3 ? "Read the story again: start $2,000 · sharp rise to $5,000 in March · small drop in April · then the same." : "Some points don't match the table. Check every month!" }); }
  };
  const next = () => { setMsg(null); if (lvl < 3) setLvl(lvl + 1); else finish(Math.max(15, 30 - tries * 2), { tries }); };
  if (st.done) return <Reward title="Graph builder! 📊" subtitle="You can turn data into graphs." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<BarChart3 size={22} strokeWidth={2.1} />} title="Plot It! Build the graph 📊" subtitle="Move the points and watch the graph appear." onExit={onExit}>
      <div className="p3-stepper">{["Line graph", "Bar graph", "Draw the story"].map((s, k) => <span key={s} className={lvl >= k + 1 ? "on" : ""}><b>{k + 1}</b>{s}</span>)}</div>
      {lvl === 1 && (
        <div className="start-block">
          <h3>📈 Level 1 · Banana prices (1 kg). Build the line graph.</h3>
          <div className="g7-datatable">{MONTHS.map((m, i) => <span key={m}><small>{m}</small><b>{cop(PLOT_L1[i])}</b></span>)}</div>
          <PointSetter labels={MONTHS} values={v1} setValues={setV1} />
        </div>
      )}
      {lvl === 2 && (
        <div className="start-block">
          <h3>📊 Level 2 · Price of a juice in 4 stores. Build the bar graph.</h3>
          <div className="g7-datatable">{STORES.map((m, i) => <span key={m}><small>{m}</small><b>{cop(PLOT_L2[i])}</b></span>)}</div>
          <PointSetter labels={STORES} values={v2} setValues={setV2} kind="bar" />
        </div>
      )}
      {lvl === 3 && (
        <div className="start-block">
          <h3>✍️ Level 3 · Draw the story</h3>
          <div className="g7-story">“The price of coffee <b>started at $2,000</b> in January. It <b>rose sharply</b> and <b>reached a peak of $5,000 in March</b>. In April, it <b>dropped slightly</b>, and then it <b>stayed the same</b> until June.”</div>
          <PointSetter labels={MONTHS} values={v3} setValues={setV3} />
        </div>
      )}
      {msg && <div className={`p1-banner ${msg.good ? "good" : "bad"}`}>{msg.t}</div>}
      <div className="start-foot">
        {!msg?.good ? <button className="s1-btn primary big" onClick={check}>Check my graph <Check size={17} /></button>
          : <button className="s1-btn primary big" onClick={next}>{lvl < 3 ? "Next level" : "Finish"} <ChevronRight size={18} /></button>}
      </div>
    </ActShell>
  );
}

const TREND_WORDS = /\b(rose|rise|rises|risen|increase[sd]?|increasing|went up|go(es)? up|fell|fall|falls|fallen|drop(ped|s)?|decrease[sd]?|decreasing|went down|go(es)? down|stayed the same|stay(s)? the same|remain(ed|s)? stable|stable|peak(ed)?|fluctuat(e|ed|es)|sharply|slightly|gradually)\b/gi;
const WG_FRAMES = ["The graph shows the price of … from … to …", "In …, the price was …", "Then, the price rose / dropped …", "The price reached a peak in …", "Overall, the price …", "I think this happened because …"];
function GraphWriter({ resp, existing, onSave, onExit }) {
  const d = trackerData(resp);
  const useMine = d.records >= 3;
  const series = useMine ? d.series.map((s) => ({ ...s, values: s.values })) : [{ name: "Coffee (250 g)", values: [10000, 10500, 11000, 12500, 12000, 12000], color: COLORS[0] }];
  const labels = useMine ? TRK_LABELS : MONTHS;
  const [text, setText] = useState(existing?.text || "");
  const [showEx, setShowEx] = useState(false);
  const [st, finish] = useFinish(onSave);
  const w = countWords(text);
  const found = [...new Set((text.match(TREND_WORDS) || []).map((x) => x.toLowerCase()))];
  const ok = w >= 35 && w <= 120 && found.length >= 2;
  if (st.done) return <Reward title="Graph reporter! 📰" subtitle={`You used ${found.length} graph words.`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<PenLine size={22} strokeWidth={2.1} />} title="Writing: Describe the graph ✍️" subtitle={useMine ? "Describe YOUR Price Tracker graph." : "Describe the coffee graph."} onExit={onExit}>
      <div className="start-block">
        <LineChart labels={labels} series={series} />
        <ChartLegend series={series} />
      </div>
      <div className="start-block g7-model">
        <h3><Lightbulb size={18} /> Example</h3>
        <button type="button" className="p1-link" onClick={() => setShowEx(!showEx)}>{showEx ? "Hide the example" : "Show me an example paragraph"}</button>
        {showEx && <p>The graph shows the price of eggs from January to June. In January, the price was $7,000. Then, it <mark>rose gradually</mark> and <mark>reached a peak</mark> of $8,600 in April. After that, it <mark>dropped slightly</mark> to $8,000 in June. <mark>Overall</mark>, the price <mark>increased</mark> by $1,000. I think this happened because transport costs went up.</p>}
      </div>
      <div className="start-block">
        <h3><PenLine size={18} /> My description (35–120 words · use 2+ graph words)</h3>
        <Starters items={WG_FRAMES} onPick={appendStarter(setText)} />
        <textarea className="start-input" rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="The graph shows…" />
        <p className={`word-count ${ok ? "ok" : ""}`}>{w} words · graph words: {found.length ? found.join(", ") : "none yet"} {ok ? "✓" : ""}</p>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ok} onClick={() => finish(25, { text, words: w, graphWords: found })}>Send my description <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
    </ActShell>
  );
}

/* Tracker #6: mi gráfica en vivo + una frase */
function TrackerSix({ resp, existing, onSave, onExit }) {
  const d = trackerData(resp);
  const extra = {
    title: "My tracker graph — write one sentence with a graph word",
    initial: "",
    valid: (v) => countWords(v) >= 6 && (v.match(TREND_WORDS) || []).length >= 1,
    render: (v, set, entries) => {
      const series = d.series.map((s) => ({ ...s, values: s.values.map((x, i) => (i === 6 ? num(entries?.[s.id]?.price) || null : x)) }));
      return (
        <>
          <LineChart labels={TRK_LABELS} series={series} />
          <ChartLegend series={series} />
          <div className="p3-sentence edit"><span>The price of</span><input className="start-input" value={v} onChange={(e) => set(e.target.value)} placeholder="eggs rose gradually from C1 to C7." /></div>
        </>
      );
    },
  };
  return <TrackerCheck week={6} resp={resp} existing={existing} extra={extra} onSave={onSave} onExit={onExit} />;
}

/* =====================================================================
   CLASE 8 · PRICES AROUND THE WORLD (Big Mac Index)
   ===================================================================== */
const WRATES = [
  { code: "USD", flag: "🇺🇸", n: "US dollar", sym: "US$", per: 1, cop: 4000 },
  { code: "GBP", flag: "🇬🇧", n: "British pound", sym: "£", per: 1, cop: 5200 },
  { code: "EUR", flag: "🇪🇺", n: "Euro", sym: "€", per: 1, cop: 4400 },
  { code: "JPY", flag: "🇯🇵", n: "Japanese yen", sym: "¥", per: 100, cop: 2700 },
];
function WorldRates() {
  return (
    <div className="p2-rates">
      <b>🏦 Classroom exchange rates</b>
      <div>{WRATES.map((r) => <span key={r.code}>{r.flag} {r.per} {r.code} = <b>{cop(r.cop)}</b></span>)}</div>
      <small>Fixed numbers for class. Real exchange rates change every day.</small>
    </div>
  );
}
const READ_C8 = [
  { h: "The Big Mac Index: One Burger, Five Countries" },
  { sub: "1 · A burger can travel the world!" },
  { p: "Imagine that you are hungry in Bogotá. You buy a Big Mac, a famous hamburger sold by McDonald's. Now imagine buying the same hamburger in New York, London, Paris, and Tokyo. Is the price the same in every country? Probably not!" },
  { p: "Countries use different currencies. In Colombia, people use Colombian pesos (COP). In the United States, US dollars (USD). In the United Kingdom, British pounds (GBP). In many European countries, euros (EUR). In Japan, Japanese yen (JPY). But how can we compare prices when the numbers use different currencies?" },
  { sub: "2 · Meet the Big Mac Index" },
  { p: "The Big Mac Index is a simple way to compare the price of a Big Mac in different countries. The idea is easy: look at the price of the same product in different places. Then, convert the prices into one common currency." },
  { p: "The difference in price may be related to local wages, rent, ingredients, transport, taxes, and other business costs. Exchange rates also affect how prices compare. The Big Mac Index was created by The Economist magazine in 1986. It is a useful starting point, but it is not a perfect measure." },
  { sub: "3 · Five countries, one hamburger" },
  { node: (
    <div className="g7-burgers">
      {[["🇨🇴", "Colombia", "20,000 COP"], ["🇺🇸", "United States", "5 USD"], ["🇬🇧", "United Kingdom", "4 GBP"], ["🇫🇷", "France", "5 EUR"], ["🇯🇵", "Japan", "750 JPY"]].map(([f, c, p]) => <div key={c}><em>{f}</em><small>{c}</small><b>🍔 {p}</b></div>)}
    </div>
  ) },
  { p: "These are fictional classroom prices. Is 750 yen more or less than 20,000 pesos? Is 4 pounds cheaper than 5 dollars? We need to convert the prices into the same currency. If 1 USD = 4,000 COP, then 5 USD = 20,000 COP." },
  { box: "An exchange rate tells us how much one currency is worth in another currency." },
  { sub: "4 · Is the most expensive burger in the most expensive country?" },
  { p: "Not necessarily! A Big Mac is only one product. A country may have an expensive hamburger but cheaper public transport. The Big Mac Index does not tell us the price of everything, and a higher price does not automatically mean that people earn more money or have a better quality of life." },
];
const GLOSS_C8 = { "currency": "Moneda de un país.", "exchange rate": "Tasa de cambio.", "convert": "Convertir.", "wages": "Salarios.", "cost of living": "Costo de vida." };
const TFN = [
  { id: "t", label: "True", icon: "✅", color: "#16b074" },
  { id: "f", label: "False", icon: "❌", color: "#ff6b57" },
  { id: "n", label: "Not enough info", icon: "🤔", color: "#f59e0b" },
];
const TFN_ITEMS = [
  { label: "Every country uses the same currency.", answer: "f" },
  { label: "A Big Mac can help us compare prices between countries.", answer: "t" },
  { label: "The country with the most expensive burger has the richest people.", answer: "n", why: "One burger can't tell us how rich people are." },
  { label: "The price of one burger tells us the complete cost of living.", answer: "f", why: "It's only ONE product." },
  { label: "To compare prices, we convert them into the same currency.", answer: "t" },
  { label: "Burgers in Japan taste better than in Colombia.", answer: "n", why: "The text doesn't say anything about taste!" },
];

const TOUR = [
  { id: "co", flag: "🇨🇴", n: "Colombia", local: 20000, code: "COP", sym: "COP", copV: 20000 },
  { id: "us", flag: "🇺🇸", n: "United States", local: 5, code: "USD", copV: 20000 },
  { id: "uk", flag: "🇬🇧", n: "United Kingdom", local: 4, code: "GBP", copV: 20800 },
  { id: "fr", flag: "🇫🇷", n: "France", local: 5, code: "EUR", copV: 22000 },
  { id: "jp", flag: "🇯🇵", n: "Japan", local: 750, code: "JPY", copV: 20250 },
];
const CUR_OPTS = ["COP", "USD", "GBP", "EUR", "JPY"];
function WorldTour7({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [cur, setCur] = useState(null);
  const [val, setVal] = useState("");
  const [stamps, setStamps] = useState([]);
  const [stage, setStage] = useState("tour");
  const [order, setOrder] = useState([]);
  const [rankMsg, setRankMsg] = useState(null);
  const [errs, setErrs] = useState(0);
  const [st, finish] = useFinish(onSave);
  const c = TOUR[i];
  const r = WRATES.find((x) => x.code === c.code);
  const curOk = cur === c.code;
  const valOk = num(val) === c.copV;
  const stamp = () => { setStamps([...stamps, c.id]); setCur(null); setVal(""); if (i < TOUR.length - 1) setI(i + 1); else setStage("rank"); };
  const tapRank = (id) => { if (order.includes(id)) setOrder(order.filter((x) => x !== id)); else setOrder([...order, id]); setRankMsg(null); };
  const checkRank = () => {
    const vals = order.map((id) => TOUR.find((x) => x.id === id).copV);
    const ok = vals.every((v, k) => k === 0 || v >= vals[k - 1]);
    if (ok) setRankMsg({ good: true }); else { setErrs((e) => e + 1); setRankMsg({ good: false }); }
  };
  if (st.done) return <Reward title="World Price Detective! 🌍" subtitle="5 stamps in your passport." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title="World Price Tour 🍔🌍" subtitle="Visit 5 countries, identify the currency and convert the burger price to COP." onExit={onExit}>
      <div className="p4-passport">
        <div className="p4-passport-cover"><b>🌍 WORLD PRICE PASSPORT</b><small>Market Detective · 7th grade</small></div>
        <div className="p4-stamps">{TOUR.map((x) => <span key={x.id} className={stamps.includes(x.id) ? "on" : ""}><em>{x.flag}</em><small>{x.n}</small></span>)}</div>
      </div>
      {stage === "tour" && (
        <div className="start-block">
          <div className="p4-stop"><em>{c.flag}</em><div><small>STOP {i + 1} · {c.n.toUpperCase()}</small><p>A Big Mac costs <b>{c.local.toLocaleString("en-US")}</b> here. 🍔</p></div></div>
          <h3><span className="step-n">1</span> Which currency do they use?</h3>
          <div className="g7-shift">{CUR_OPTS.map((o) => <button key={o} type="button" onClick={() => setCur(o)} className={cur === o ? (o === c.code ? "ok" : "no") : ""}>{o}</button>)}</div>
          {curOk && c.code === "COP" && (
            <div className="start-foot"><button className="s1-btn primary big" onClick={() => { setVal(String(c.copV)); setTimeout(stamp, 0); }}>We are home: no conversion needed! Stamp 🛂</button></div>
          )}
          {curOk && c.code !== "COP" && (
            <>
              <h3 className="p2-mt"><span className="step-n">2</span> Convert to Colombian pesos</h3>
              <WorldRates />
              <div className="p4-calc"><span>{c.local.toLocaleString("en-US")} {c.code} {r.per === 100 ? `÷ 100 × ${cop(r.cop)}` : `× ${cop(r.cop)}`} =</span><MoneyInput value={val} onChange={setVal} /><b className={val === "" ? "" : valOk ? "ok" : "no"}>{val === "" ? "" : valOk ? "✓" : "Try again"}</b></div>
              {c.code === "JPY" && <p className="start-tip">💡 Japan: first divide by 100 (750 ÷ 100 = 7.5), then multiply by $2,700.</p>}
              {valOk && <div className="start-foot"><button className="s1-btn primary big" onClick={stamp}>Stamp my passport 🛂 <ChevronRight size={18} /></button></div>}
            </>
          )}
        </div>
      )}
      {stage === "rank" && (
        <div className="start-block">
          <h3>🏁 Rank the burgers from the CHEAPEST to the MOST EXPENSIVE (in COP)</h3>
          <div className="g7-rank">{TOUR.map((x) => <button key={x.id} type="button" className={order.includes(x.id) ? "on" : ""} onClick={() => tapRank(x.id)}>{order.includes(x.id) && <i>{order.indexOf(x.id) + 1}</i>}<em>{x.flag}</em><b>{cop(x.copV)}</b></button>)}</div>
          {rankMsg && <div className={`p1-banner ${rankMsg.good ? "good" : "bad"}`}>{rankMsg.good ? "Perfect ranking! Colombia and the USA tie at $20,000. France is the most expensive: $22,000." : "Not yet. Tap to remove and try again."}</div>}
          {!rankMsg?.good
            ? <div className="start-foot"><button className="s1-btn primary big" disabled={order.length < TOUR.length} onClick={checkRank}>Check my ranking</button></div>
            : <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(Math.max(16, 30 - errs * 3), { errs })}>Finish the tour <span className="coin-tag"><Coins size={15} /> +{Math.max(16, 30 - errs * 3)}</span></button></div>}
        </div>
      )}
    </ActShell>
  );
}

const CUR_MATCH = [
  { a: "💵 USD", b: "🇺🇸 United States" },
  { a: "💶 EUR", b: "🇪🇺 France and many European countries" },
  { a: "💷 GBP", b: "🇬🇧 United Kingdom" },
  { a: "💴 JPY", b: "🇯🇵 Japan" },
  { a: "🪙 COP", b: "🇨🇴 Colombia" },
];
const EXCHANGE_ROUNDS = [
  { tag: "EXCHANGE MACHINE", q: "2 USD → COP", answer: 8000, money: true, hint: "2 × $4,000", explain: "$8,000 COP." },
  { tag: "EXCHANGE MACHINE", q: "3 GBP → COP", answer: 15600, money: true, hint: "3 × $5,200", explain: "$15,600 COP." },
  { tag: "EXCHANGE MACHINE", q: "4 EUR → COP", answer: 17600, money: true, hint: "4 × $4,400", explain: "$17,600 COP." },
  { tag: "EXCHANGE MACHINE", q: "200 JPY → COP", answer: 5400, money: true, hint: "200 ÷ 100 = 2. Then 2 × $2,700", explain: "$5,400 COP." },
  { tag: "REVERSE MACHINE", q: "You have $20,000 COP. How many US dollars is that?", answer: 5, unit: "USD", hint: "Divide: 20,000 ÷ 4,000", explain: "5 USD. COP → other currency: DIVIDE." },
  { tag: "REVERSE MACHINE", q: "You have $22,000 COP. How many euros is that?", answer: 5, unit: "EUR", hint: "22,000 ÷ 4,400", explain: "5 EUR." },
];
function CurrencyQuest({ onSave, onExit }) {
  const [stage, setStage] = useState("match");
  const [first, setFirst] = useState(0);
  const [round, setRound] = useState(0);
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Currency expert! 💱" subtitle="Dollars, euros, pounds and yen — no problem!" coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Coins size={22} strokeWidth={2.1} />} title="Currency Quest 💱" subtitle={stage === "match" ? "Match each currency with its country." : "The Exchange Machine: convert!"} onExit={onExit}>
      <div className="p3-stepper"><span className="on"><b>1</b>Currency match</span><span className={stage === "machine" ? "on" : ""}><b>2</b>Exchange machine</span></div>
      {stage === "match"
        ? <div className="start-block"><p className="start-tip">💡 The euro is not only from France: many European countries use it!</p><MatchPairs key={round} pairs={CUR_MATCH} leftLabel="Currency" rightLabel="Country" onRestart={() => setRound((r) => r + 1)} onDone={(r) => { setFirst(r.firstTry); setStage("machine"); }} /></div>
        : <><WorldRates /><RoundsRunner rounds={EXCHANGE_ROUNDS} onDone={(r) => finish(8 + first * 2 + r.firstTry * 2, { match: first, machine: r.firstTry })} /></>}
    </ActShell>
  );
}

const WORLD_DISCOVERY = {
  title: "My World Price Discovery",
  initial: { a: "", b: "", c: "", d: "", r: "" },
  valid: (v) => v && v.a && v.b && v.c && v.d && countWords(v.r) >= 4,
  render: (v, set) => {
    const Sel = ({ k, q, opts }) => (
      <div className="g7-blank"><span>{q}</span><div>{opts.map((o) => <button key={o} type="button" className={v[k] === o ? "on" : ""} onClick={() => set({ ...v, [k]: o })}>{o}</button>)}</div></div>
    );
    return (
      <>
        {Sel({ k: "a", q: "1. The Big Mac Index compares the price of a ___ in different countries.", opts: ["burger", "car", "house"] })}
        {Sel({ k: "b", q: "2. The currency used in Japan is the ___.", opts: ["yen", "euro", "pound"] })}
        {Sel({ k: "c", q: "3. After conversion, the most expensive classroom burger is in ___.", opts: ["France", "Colombia", "Japan"] })}
        {Sel({ k: "d", q: "4. One thing the Big Mac Index cannot tell us is ___.", opts: ["the complete cost of living", "the price of a burger", "the currency"] })}
        <div className="p3-sentence edit"><span>Today I learned that prices around the world</span><input className="start-input" value={v.r} onChange={(e) => set({ ...v, r: e.target.value })} placeholder="are different, and we must convert them to compare." /></div>
      </>
    );
  },
};

/* =====================================================================
   CLASE 9 · SMART CONSUMERS IN A CHANGING MARKET
   ===================================================================== */
const READ_C9 = [
  { node: <div className="g7-paper-head"><small>CONSUMER ALERT · SPECIAL REPORT</small><b>THE SMART SHOPPER TIMES</b></div> },
  { h: "The Shrinking Chocolate Bar — Same Price, Less Chocolate?" },
  { node: <p className="g7-byline">By Laura Gómez, Consumer News Reporter · BOGOTÁ, COLOMBIA</p> },
  { node: <img className="p2-hero-img g7-shrink-img" src={IMG_SHRINK} alt="" loading="lazy" /> },
  { p: "Have you ever bought your favorite chocolate bar and felt that it looked smaller than before? You are not alone. Today, The Smart Shopper Times investigates a market practice called shrinkflation." },
  { sub: "What is shrinkflation?" },
  { p: "Shrinkflation happens when a product becomes smaller or contains less product, but its price stays the same or does not fall enough. Last month, a chocolate bar weighed 100 grams and cost $5,000. This month, the same bar weighs only 80 grams, but it still costs $5,000. (This example is fictional.) It is different from inflation, which means that prices generally increase across goods and services over time." },
  { sub: "The price tag does not tell the whole story" },
  { node: (
    <div className="g7-unit2">
      <div><b>🍫 Chocolate A</b><span>$5,000 · 100 g</span><strong>$5,000 ÷ 100 = $50 per gram</strong></div>
      <div className="bad"><b>🍫 Chocolate B</b><span>$5,000 · 80 g</span><strong>$5,000 ÷ 80 = $62.50 per gram</strong></div>
    </div>
  ) },
  { p: "Smart consumers check the unit price: the cost of one gram, one kilogram or one liter. Chocolate B has a higher price per gram. But the cheapest product is not always the best choice: quality, ingredients, expiration dates and your needs are also important." },
  { sub: "🇨🇴 What about our rights in Colombia?" },
  { p: "Law 1480 of 2011, known as the Consumer Statute (Estatuto del Consumidor), protects consumers. Consumers have the right to receive clear and truthful information about products, such as the price, the quantity and the characteristics. A smaller product is not automatically illegal; the important question is whether the information is clear or misleading." },
  { p: "The Superintendencia de Industria y Comercio (SIC) helps protect consumer rights. If you think a business gave you misleading information: keep your receipt, take a picture of the label, contact the business, and if necessary, ask the SIC how to make a complaint." },
  { sub: "📱 Can you trust every online review?" },
  { p: "Some reviews may be fake, copied, paid for, or written by people who never used the product. Look for details. Are there many reviews with almost identical words? Were many five-star reviews published on the same day? One suspicious review doesn't prove anything, but several warning signs mean you should investigate." },
  { sub: "🚀 A challenge for young entrepreneurs" },
  { p: "When ingredients, packaging and transport become more expensive, a small business can increase the price, find another reliable supplier, reduce packaging costs, create a smaller product with clear information, or develop a new product. Successful entrepreneurs think about costs, quality and customer trust." },
  { box: "A smart consumer compares, investigates, and makes informed decisions." },
];
const GLOSS_C9 = { "shrinkflation": "Reduflación — menos producto por el mismo precio.", "unit price": "Precio por unidad (por gramo, por litro).", "misleading": "Engañoso.", "complaint": "Queja / reclamo.", "supplier": "Proveedor." };
const Q_C9 = [
  { q: "What is shrinkflation?", options: ["Less product for the same price.", "A general increase in all prices.", "A big discount on a bigger package."], correct: 0, feedback: "Smaller size, same price." },
  { q: "Chocolate A: $5,000 for 100 g. Chocolate B: $5,000 for 80 g. Which has the LOWER price per gram?", options: ["Chocolate A ($50 per gram)", "Chocolate B ($62.50 per gram)", "Both cost the same per gram"], correct: 0, feedback: "A gives you more chocolate for your money." },
  { q: "Which law protects consumers in Colombia?", options: ["Law 1480 of 2011", "Law 1014 of 2006", "Law 100 of 1993"], correct: 0, feedback: "The Consumer Statute." },
  { q: "What is a warning sign of a suspicious review?", options: ["Many reviews with almost identical words.", "A review with specific details and a photo.", "A review that gives the product 3 stars."], correct: 0, feedback: "Repeated wording is a red flag." },
];

const UNIT_ROUNDS = [
  { tag: "UNIT PRICE LAB", q: "🍪 Cookies: $6,000 for 200 g. What is the price per gram?", answer: 30, money: true, hint: "6,000 ÷ 200", explain: "$30 per gram." },
  { tag: "UNIT PRICE LAB", q: "🍪 Other cookies: $4,500 for 120 g. What is the price per gram?", answer: 37.5, tol: 0.5, money: true, hint: "4,500 ÷ 120", explain: "$37.50 per gram — more expensive per gram!" },
  { tag: "UNIT PRICE LAB", q: "🥤 Juice: $7,200 for 1.5 liters. What is the price per liter?", answer: 4800, money: true, hint: "7,200 ÷ 1.5", explain: "$4,800 per liter." },
];
const BEST_BUY = [
  { id: "a", e: "🍫", n: "Chocolate A", p: 4000, g: 100, note: "Normal quality. Expires next year." },
  { id: "b", e: "🍫", n: "Chocolate B", p: 3600, g: 60, note: "Same quality as A." },
  { id: "c", e: "🍫", n: "Chocolate C", p: 3000, g: 100, note: "⚠️ Expires TOMORROW." },
];
function ShrinkHunt({ onSave, onExit }) {
  const [lvl, setLvl] = useState(1);
  const [now, setNow] = useState(false);
  const [spot, setSpot] = useState(null);
  const [unitFirst, setUnitFirst] = useState(0);
  const [buy, setBuy] = useState(null);
  const [why, setWhy] = useState("");
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Supermarket detective! 🔍" subtitle="You don't look only at the price tag." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Shrinkflation Hunt 🔍" subtitle="Investigate the supermarket. Are you getting the same value for your money?" onExit={onExit}>
      <div className="p3-stepper">{["Spot the shrink", "Unit price lab", "The best buy"].map((s, k) => <span key={s} className={lvl >= k + 1 ? "on" : ""}><b>{k + 1}</b>{s}</span>)}</div>
      {lvl === 1 && (
        <div className="start-block">
          <h3>🔎 Challenge 1 · Spot the shrink</h3>
          <div className="g7-toggle"><button type="button" className={!now ? "on" : ""} onClick={() => setNow(false)}>📅 Before</button><button type="button" className={now ? "on" : ""} onClick={() => setNow(true)}>📅 Now</button></div>
          <div className={`g7-shrinkbar ${now ? "now" : ""}`}><div className="bar"><span>🍫</span></div><b>{now ? "80 g" : "100 g"}</b><strong>{cop(5000)}</strong></div>
          <p className="start-tip">🎮 Example data. Switch between Before and Now.</p>
          <h3>What changed?</h3>
          <ChoiceCard options={["The price went up.", "The size went down, but the price stayed the same.", "Nothing changed."]} good={[1]} picked={spot} onAnswer={setSpot} feedback="That's shrinkflation: 20 g less for the same $5,000." />
          {spot !== null && <div className="start-foot"><button className="s1-btn primary" onClick={() => setLvl(2)}>Next challenge <ChevronRight size={16} /></button></div>}
        </div>
      )}
      {lvl === 2 && <><p className="start-tip">💡 Price per gram = price ÷ grams.</p><RoundsRunner rounds={UNIT_ROUNDS} doneLabel="Next challenge" onDone={(r) => { setUnitFirst(r.firstTry); setLvl(3); }} /></>}
      {lvl === 3 && (
        <div className="start-block">
          <h3>🛒 Challenge 3 · The best buy. Which one would you buy?</h3>
          <div className="g7-bestbuy">
            {BEST_BUY.map((b) => (
              <button key={b.id} type="button" className={buy === b.id ? "on" : ""} onClick={() => setBuy(b.id)}>
                <em>{b.e}</em><b>{b.n}</b><span>{cop(b.p)} · {b.g} g</span><strong>{cop(b.p / b.g)} / g</strong><small>{b.note}</small>
              </button>
            ))}
          </div>
          {buy && <div className={`p1-banner ${buy === "a" ? "good" : "bad"}`}>{buy === "a" ? "Smart! Good price per gram AND a good expiration date." : buy === "b" ? "B is cheaper, but it costs $60 per gram — you get less chocolate." : "C is the cheapest per gram… but it expires tomorrow! Do you need it today?"}</div>}
          {buy && <div className="p3-sentence edit"><span>I would buy {BEST_BUY.find((b) => b.id === buy).n} because</span><input className="start-input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="it has a good price per gram and it lasts longer." /></div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={!buy || countWords(why) < 4} onClick={() => finish(12 + unitFirst * 3 + (buy === "a" ? 4 : buy === "c" ? 2 : 0), { spot, unitFirst, buy, why })}>Finish the hunt</button></div>
        </div>
      )}
    </ActShell>
  );
}

const CLUES = ["Specific details", "Repeated wording", "Balanced (good + bad)", "Many reviews the same day", "Verified purchase"];
const REVIEWS = [
  { r: "“Amazing!!! Best chocolate ever!!! Buy it now!!!”", stars: 5, meta: "No details · posted today", ok: ["sus", "nei"], clues: [], fb: "Only emotion, no details. It needs more evidence." },
  { r: "“The chocolate tastes good, but the package is smaller than I expected. It weighs 80 g.”", stars: 3, meta: "Verified purchase", ok: ["trust"], clues: ["Specific details", "Balanced (good + bad)", "Verified purchase"], fb: "Specific + balanced + verified = more trustworthy." },
  { r: "“Great product!”", stars: 5, meta: "Same text on 30 accounts · all on May 3", ok: ["sus"], clues: ["Repeated wording", "Many reviews the same day"], fb: "A suspicious pattern: identical words, same day." },
  { r: "“I bought it for my brother's birthday. He liked the taste, but it melted a little in the bag.”", stars: 4, meta: "Verified purchase", ok: ["trust"], clues: ["Specific details", "Balanced (good + bad)", "Verified purchase"], fb: "Real details from a real experience." },
  { r: "“Bad.”", stars: 1, meta: "No details", ok: ["nei"], clues: [], fb: "A bad review is not automatically fake — but it gives no information." },
];
const VERDICTS = [{ id: "trust", l: "👍 More trustworthy" }, { id: "sus", l: "🚩 Suspicious" }, { id: "nei", l: "🤔 Not enough information" }];
function ReviewDetective({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [clues, setClues] = useState([]);
  const [verdict, setVerdict] = useState(null);
  const [score, setScore] = useState(0);
  const [st, finish] = useFinish(onSave);
  const r = REVIEWS[i];
  const tog = (c) => { if (!verdict) setClues(clues.includes(c) ? clues.filter((x) => x !== c) : [...clues, c]); };
  const decide = (v) => { setVerdict(v); if (r.ok.includes(v)) setScore((s) => s + 1); };
  const next = () => { if (i < REVIEWS.length - 1) { setI(i + 1); setClues([]); setVerdict(null); } else finish(8 + score * 3, { score }); };
  if (st.done) return <Reward title="Review detective! 🕵️" subtitle={`${score}/${REVIEWS.length} good verdicts.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Star size={22} strokeWidth={2.1} />} title="Fake or Real Review? 🕵️" subtitle="Collect clues, then give your verdict. Never accuse without evidence!" onExit={onExit}>
      <div className="p2-hud"><span>Review <b>{i + 1}/{REVIEWS.length}</b></span><span>Good verdicts <b>{score}</b></span></div>
      <div className="g7-review"><div>{"★".repeat(r.stars)}<span>{"★".repeat(5 - r.stars)}</span></div><p>{r.r}</p><small>{r.meta}</small></div>
      <div className="start-block">
        <h3><span className="step-n">1</span> Evidence board: which clues do you see?</h3>
        <div className="p1-starters">{CLUES.map((c) => <button key={c} type="button" className={`p1-chip ${clues.includes(c) ? "on" : ""}`} onClick={() => tog(c)}>{c}</button>)}</div>
        <h3 className="p2-mt"><span className="step-n">2</span> Your verdict</h3>
        <div className="g7-shift">{VERDICTS.map((v) => <button key={v.id} type="button" disabled={!!verdict} onClick={() => decide(v.id)} className={verdict ? (r.ok.includes(v.id) ? "ok" : verdict === v.id ? "no" : "") : ""}>{v.l}</button>)}</div>
        {verdict && <div className={`p1-banner ${r.ok.includes(verdict) ? "good" : "bad"}`}>{r.fb}{r.clues.length > 0 && <> Clues: <b>{r.clues.join(", ")}</b>.</>}</div>}
      </div>
      {verdict && <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{i < REVIEWS.length - 1 ? "Next review" : "Finish"} <ChevronRight size={18} /></button></div>}
    </ActShell>
  );
}

const CRISIS = [
  { e: "📈", t: "Costs go up!", s: "Mia sells chocolate bars for $4,000. Ingredients and packaging cost more. If she keeps the same price, she earns less.", o: [
    { l: "Increase the price a little and explain why", d: [8, -4, 0] },
    { l: "Find a reliable, cheaper supplier", d: [6, 0, -3] },
    { l: "Make the bar smaller and HIDE it", d: [10, -25, -5] },
    { l: "Make a smaller bar with clear weight and price", d: [6, 2, 0] }] },
  { e: "🏪", t: "A new competitor", s: "A new shop sells a similar chocolate for $3,500.", o: [
    { l: "Use cheaper, low-quality cacao", d: [8, -10, -20] },
    { l: "Add value: better packaging, a loyalty card", d: [-3, 10, 5] },
    { l: "Lower the price to $3,000 for everything", d: [-15, 5, 0] }] },
  { e: "💬", t: "Customer complaint", s: "A customer says the bar is smaller than the label says.", o: [
    { l: "Ignore the message", d: [0, -20, 0] },
    { l: "Check the label, apologize and fix the information", d: [-2, 15, 5] },
    { l: "Answer: “It's your problem.”", d: [0, -25, 0] }] },
];
const METERS = [{ k: 0, l: "💰 Profit" }, { k: 1, l: "🤝 Customer trust" }, { k: 2, l: "⭐ Product quality" }];
function CrisisRoom({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [m, setM] = useState([60, 60, 60]);
  const [pick, setPick] = useState(null);
  const [log, setLog] = useState([]);
  const [because, setBecause] = useState("");
  const [st, finish] = useFinish(onSave);
  const done = i >= CRISIS.length;
  const c = CRISIS[i];
  const choose = (k) => { if (pick !== null) return; setPick(k); const d = c.o[k].d; setM(m.map((v, j) => Math.max(0, Math.min(100, v + d[j])))); setLog([...log, c.o[k].l]); };
  const balanced = m.every((v) => v >= 45);
  const coins = 10 + (balanced ? 12 : 4);
  if (st.done) return <Reward title="Crisis solved! 🧯" subtitle="Profit, trust AND quality matter." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Flame size={22} strokeWidth={2.1} />} title="Your Business vs. Inflation 🧯" subtitle="You run Mia's Chocolate Shop. Keep profit, trust and quality healthy!" onExit={onExit}>
      <div className="g7-meters">{METERS.map((x) => <div key={x.k}><span>{x.l}</span><div className="bar"><i style={{ width: `${m[x.k]}%`, background: m[x.k] < 40 ? "var(--coral)" : m[x.k] < 60 ? "var(--gold)" : "var(--green)" }} /></div><b>{m[x.k]}</b></div>)}</div>
      {!done ? (
        <div className="start-block">
          <div className="p3-oops hot"><em>{c.e}</em><small>EVENT {i + 1}/{CRISIS.length} · {c.t.toUpperCase()}</small><p>{c.s}</p></div>
          <div className="quiz-options">{c.o.map((o, k) => <button key={k} type="button" disabled={pick !== null} className={`quiz-opt ${pick === k ? "correct" : ""}`} onClick={() => choose(k)}><span className="opt-key">{"ABCD"[k]}</span><span className="opt-text">{o.l}</span></button>)}</div>
          {pick !== null && <div className="g7-deltas">{c.o[pick].d.map((d, j) => <span key={j} className={d > 0 ? "up" : d < 0 ? "down" : ""}>{METERS[j].l} {d > 0 ? `+${d}` : d}</span>)}</div>}
          {pick !== null && <div className="start-foot"><button className="s1-btn primary big" onClick={() => { setI(i + 1); setPick(null); }}>{i < CRISIS.length - 1 ? "Next event" : "See my results"} <ChevronRight size={18} /></button></div>}
        </div>
      ) : (
        <div className="start-block">
          <div className={`p1-banner ${balanced ? "good" : "bad"}`}>{balanced ? "🏆 Great balance! Your shop is healthy." : "⚠️ One of your meters is low. A business needs profit, trust AND quality."}</div>
          <p className="start-tip">Your decisions: {log.join(" → ")}</p>
          <div className="p3-sentence edit"><span>My best decision was</span><input className="start-input" value={because} onChange={(e) => setBecause(e.target.value)} placeholder="to find a cheaper supplier because the quality stayed good." /></div>
          <p className="start-tip">Use <b>because</b> in your sentence.</p>
          <div className="start-foot"><button className="s1-btn primary big" disabled={countWords(because) < 6 || !/because/i.test(because)} onClick={() => finish(coins, { meters: m, decisions: log, because })}>Save my plan <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </div>
      )}
    </ActShell>
  );
}

const SMART_REPORT = {
  title: "Smart Consumer Report",
  initial: { a: "", b: "", c: "", d: "", rule: "" },
  valid: (v) => v && v.a && v.b && v.c && v.d && countWords(v.rule) >= 4,
  render: (v, set) => {
    const Sel = ({ k, q, opts }) => <div className="g7-blank"><span>{q}</span><div>{opts.map((o) => <button key={o} type="button" className={v[k] === o ? "on" : ""} onClick={() => set({ ...v, [k]: o })}>{o}</button>)}</div></div>;
    return (
      <>
        {Sel({ k: "a", q: "1. Shrinkflation: a product has ___ product, but the price stays the same.", opts: ["less", "more", "better"] })}
        {Sel({ k: "b", q: "2. A: $4,000 for 100 g. B: $3,600 for 60 g. Lower price per gram:", opts: ["A", "B"] })}
        {Sel({ k: "c", q: "3. In Colombia, Law 1480 of 2011 protects ___.", opts: ["consumers", "banks", "farmers"] })}
        {Sel({ k: "d", q: "4. A warning sign of a suspicious review:", opts: ["identical words on many accounts", "specific details", "a verified purchase"] })}
        <div className="p3-sentence edit"><span>My smart consumer rule: Before I buy something, I will</span><input className="start-input" value={v.rule} onChange={(e) => set({ ...v, rule: e.target.value })} placeholder="check the price per gram." /></div>
      </>
    );
  },
};

/* =====================================================================
   CLASE 10 · MARKET REPORT FAIR
   ===================================================================== */
const loadHtml2Canvas = () => (window.html2canvas ? Promise.resolve(window.html2canvas) : new Promise((res, rej) => {
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  s.onload = () => res(window.html2canvas); s.onerror = rej;
  document.body.appendChild(s);
}));
const CONCLUSION_FRAMES = [
  { k: "c1", f: "The price of my products", ph: "increased because production costs and demand changed." },
  { k: "c2", f: "Inflation affects families because", ph: "the same money buys fewer things." },
  { k: "c3", f: "As a smart consumer, I recommend", ph: "comparing the price per gram and making a list." },
  { k: "c4", f: "An entrepreneur could respond by", ph: "finding a cheaper supplier and keeping the quality." },
];
function MarketReport({ resp, studentName, existing, onSave, onExit }) {
  const d = trackerData(resp);
  const [txt, setTxt] = useState(existing?.conclusions || { c1: "", c2: "", c3: "", c4: "" });
  const [busy, setBusy] = useState("");
  const [st, finish] = useFinish(onSave);
  const top = d.stats.slice().sort((a, b) => b.change - a.change)[0];
  const predOk = (s) => { const p = d.predictions[s.id]; if (!p || s.count < 2) return null; const real = s.change > 0.5 ? "up" : s.change < -0.5 ? "down" : "same"; return p === real; };
  const ready = CONCLUSION_FRAMES.every((f) => countWords(txt[f.k]) >= 4) && d.records >= 2;
  const png = async () => {
    setBusy("png");
    try { const h2c = await loadHtml2Canvas(); const c = await h2c(document.getElementById("g7-report"), { scale: 2, backgroundColor: "#ffffff", useCORS: true }); const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = `Market_Report_${(studentName || "student").replace(/\s+/g, "_")}.png`; a.click(); }
    catch (e) { /* sin imagen */ }
    setBusy("");
  };
  const print = () => { document.body.classList.add("g7-printing"); const off = () => { document.body.classList.remove("g7-printing"); window.removeEventListener("afterprint", off); }; window.addEventListener("afterprint", off); setTimeout(() => window.print(), 50); };
  if (st.done) return <Reward title="Market Report published! 📰" subtitle="You are a real Market Detective." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Award size={22} strokeWidth={2.1} />} title="My Consumer Market Report" subtitle="Your report builds itself with your Price Tracker. Complete your conclusions." onExit={onExit}>
      {d.records < 2 && <div className="p1-banner bad">You need at least 2 tracker records to build your report. Complete the trackers of Classes 1–9.</div>}
      <div className="g7-report" id="g7-report">
        <header><small>CONSUMER MARKET REPORT · GRADE 7 · INSTITUTO CREAR</small><h2>Why Do Prices Change?</h2><p>Market Detective: <b>{studentName}</b> · {d.records}/9 price records</p></header>
        <section className="g7-report-chart">
          <h4>📈 My prices over time</h4>
          <LineChart labels={TRK_LABELS} series={d.series} />
          <ChartLegend series={d.series} />
        </section>
        <section className="g7-report-table">
          <div className="h"><span>Product</span><span>First</span><span>Last</span><span>% change</span><span>My prediction</span></div>
          {d.stats.map((s) => {
            const ok = predOk(s);
            return <div key={s.id}><span>{s.e} {s.name}</span><span>{s.first ? cop(s.first) : "—"}</span><span>{s.last ? cop(s.last) : "—"}</span><span className={s.change > 0 ? "up" : s.change < 0 ? "down" : ""}>{s.count > 1 ? fmtPct(s.change) : "—"}</span><span>{d.predictions[s.id] ? `${PREDICT.find((x) => x.id === d.predictions[s.id])?.l} ${ok == null ? "" : ok ? "✅" : "❌"}` : "—"}</span></div>;
          })}
        </section>
        {top && top.count > 1 && <div className="g7-report-hl">🏆 Biggest change: <b>{top.e} {top.name}</b> ({fmtPct(top.change)})</div>}
        <section className="g7-report-concl">
          <h4>🧠 My conclusions</h4>
          {CONCLUSION_FRAMES.map((f) => <p key={f.k}><b>{f.f}</b> {txt[f.k] || "…"}</p>)}
        </section>
        <footer>🔎 Concepts used: price · supply & demand · scarcity · inflation · purchasing power · shrinkflation</footer>
      </div>
      <div className="start-block">
        <h3><PenLine size={18} /> Complete my conclusions</h3>
        {CONCLUSION_FRAMES.map((f) => <div key={f.k} className="p3-sentence edit"><span>{f.f}</span><input className="start-input" value={txt[f.k]} onChange={(e) => setTxt({ ...txt, [f.k]: e.target.value })} placeholder={f.ph} /></div>)}
      </div>
      <div className="p3-card-actions">
        <button className="s1-btn ghost" disabled={!!busy} onClick={png}><Download size={17} /> {busy ? "Creating…" : "Download PNG"}</button>
        <button className="s1-btn ghost" onClick={print}><Printer size={17} /> Print / PDF</button>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(50, { conclusions: txt, records: d.records })}>Publish my report <span className="coin-tag"><Coins size={15} /> +50</span></button></div>
    </ActShell>
  );
}

const PRESENT_STEPS = ["I said my name and my 3 products.", "I showed my graph and described one trend (rise / drop / stable).", "I explained one % change.", "I said one recommendation for consumers.", "I spoke in English and answered one question."];
function PresentFeedback({ onSave, onExit }) {
  const [checks, setChecks] = useState([]);
  const [peer, setPeer] = useState("");
  const [stars, setStars] = useState({ clear: 0, graph: 0, english: 0 });
  const [comment, setComment] = useState("");
  const [st, finish] = useFinish(onSave);
  const ready = checks.length === PRESENT_STEPS.length && peer.trim() && Object.values(stars).every((v) => v > 0) && countWords(comment) >= 4;
  if (st.done) return <Reward title="Great presentation! 🎤" subtitle="Your classmate gave you feedback." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Mic size={22} strokeWidth={2.1} />} title="Market Report Fair 🎤" subtitle="Present your report to a partner. Then give them your tablet for feedback." onExit={onExit}>
      <div className="start-block">
        <h3><span className="step-n">1</span> My presentation checklist</h3>
        {PRESENT_STEPS.map((s) => <label key={s} className="perm-check p1-check"><input type="checkbox" checked={checks.includes(s)} onChange={() => setChecks(checks.includes(s) ? checks.filter((x) => x !== s) : [...checks, s])} /><span>{s}</span></label>)}
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> 🔁 Partner's feedback (your partner writes here)</h3>
        <input className="start-input p3-gap" value={peer} onChange={(e) => setPeer(e.target.value)} placeholder="Partner's name" />
        {[["clear", "The presentation was clear"], ["graph", "The graph was easy to understand"], ["english", "They spoke in English"]].map(([k, l]) => (
          <div key={k} className="p3-rub"><div><b>{l}</b></div><span /><div className="p3-stars">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={stars[k] >= n ? "on" : ""} onClick={() => setStars({ ...stars, [k]: n })}>★</button>)}</div></div>
        ))}
        <Starters items={["I liked your graph because…", "Your conclusion was…", "Next time you could…"]} onPick={appendStarter(setComment)} />
        <input className="start-input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="I liked your graph because it was clear." />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(20, { checks, peer, stars, comment })}>Save feedback <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}

const BOSS_7P1 = [
  { q: "Price is…", options: ["what a customer pays", "what a business spends", "how useful a product is"], correct: 0, feedback: "Price = what the customer pays." },
  { q: "Revenue $80,000, costs $60,000. Profit?", options: ["$20,000", "$140,000", "$60,000"], correct: 0, feedback: "Revenue − costs." },
  { q: "A bottle of water on a hot hike feels more valuable because…", options: ["value depends on the situation", "the price of water changes", "water is always free outside"], correct: 0, feedback: "Perceived value." },
  { q: "Supply is…", options: ["how much of a product is available", "how much people want a product", "the price of a product"], correct: 0, feedback: "Available quantity." },
  { q: "Demand goes up and supply stays the same. The price usually…", options: ["goes up", "goes down", "stays the same"], correct: 0, feedback: "More buyers → higher price." },
  { q: "A great mango harvest (more supply). The price of mangoes usually…", options: ["goes down", "goes up", "stays the same"], correct: 0, feedback: "More supply → lower price." },
  { q: "Scarcity means…", options: ["there is not enough for everyone's wants", "there are too many products in stores", "everything in the market is free"], correct: 0, feedback: "Not enough." },
  { q: "Opportunity cost is…", options: ["the next best thing you give up", "the price you pay for a ticket", "a discount you get at a store"], correct: 0, feedback: "What you give up." },
  { q: "Inflation is…", options: ["a general increase in prices over time", "one product becoming cheaper over time", "a type of bank that lends money"], correct: 0, feedback: "General + over time." },
  { q: "Hyperinflation means prices…", options: ["rise extremely fast", "stay the same for years", "fall all the way to zero"], correct: 0, feedback: "Zimbabwe, Venezuela." },
  { q: "Prices rise and your money stays the same. Your purchasing power…", options: ["goes down", "goes up", "doesn't change"], correct: 0, feedback: "Same money, smaller cart." },
  { q: "A price goes from $4,000 to $5,000. The percent increase is…", options: ["25%", "20%", "1,000%"], correct: 0, feedback: "1,000 ÷ 4,000 × 100." },
  { q: "“The price increased sharply” means it went up…", options: ["very fast / a lot", "slowly / a little", "up and then down"], correct: 0, feedback: "Sharply = a big change." },
  { q: "A line that goes up and down many times shows prices that…", options: ["fluctuate", "remain stable", "reach a peak once"], correct: 0, feedback: "Fluctuate." },
  { q: "To compare a burger in the USA and in Colombia, you must…", options: ["convert prices to the same currency", "count the zeros in each price", "compare the colors of the bills"], correct: 0, feedback: "Same currency." },
  { q: "1 USD = 4,000 COP. 5 USD = ?", options: ["20,000 COP", "9,000 COP", "800 COP"], correct: 0, feedback: "5 × 4,000." },
  { q: "Shrinkflation is…", options: ["less product for the same price", "more product for less money", "a discount"], correct: 0, feedback: "Smaller size, same price." },
  { q: "In Colombia, consumers are protected by…", options: ["Law 1480 of 2011 and the SIC", "the store owners and their rules", "the mall's security guards"], correct: 0, feedback: "Estatuto del Consumidor + SIC." },
];
const RUBRIC7 = [
  { id: "concepts", t: "I can explain price, supply, demand and inflation", d: "With my own words and examples." },
  { id: "numbers", t: "I can calculate percent change and price per gram", d: "I show my steps." },
  { id: "graphs", t: "I can read and describe graphs", d: "Rise, drop, peak, stable, fluctuate…" },
  { id: "tracker", t: "I completed my Price Tracker", d: "I recorded prices every week." },
  { id: "consumer", t: "I make smarter consumer decisions", d: "I compare, investigate and think before buying." },
];
const STAR_L = ["", "Starting", "Developing", "Good", "Excellent"];
function SelfCheck7({ existing, onSave, onExit }) {
  const [stars, setStars] = useState(existing?.stars || {});
  const [proud, setProud] = useState(existing?.proud || "");
  const [next, setNext] = useState(existing?.next || "");
  const [st, finish] = useFinish(onSave);
  const all = RUBRIC7.every((r) => stars[r.id]);
  const score = Math.round(RUBRIC7.reduce((a, r) => a + (stars[r.id] || 0), 0) / (RUBRIC7.length * 4) * 100);
  if (st.done) return <Reward title="Period 1 complete! 🏆" subtitle="You understand why prices change." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Star size={22} strokeWidth={2.1} />} title="My Self-Check · Period 1" subtitle="Be honest. How did you do as a Market Detective?" onExit={onExit}>
      <div className="p3-rubric">
        {RUBRIC7.map((r) => (
          <div key={r.id} className="p3-rub">
            <div><b>{r.t}</b><small>{r.d}</small></div><span />
            <div className="p3-stars">{[1, 2, 3, 4].map((n) => <button key={n} type="button" className={(stars[r.id] || 0) >= n ? "on" : ""} onClick={() => setStars({ ...stars, [r.id]: n })}>★</button>)}<small>{STAR_L[stars[r.id] || 0]}</small></div>
          </div>
        ))}
      </div>
      <div className="p3-score"><small>My self-check</small><b>{score}%</b><div className="p3-mini-bar"><i style={{ width: `${score}%` }} /></div></div>
      <div className="start-block">
        <label className="p3-lbl">🌟 I am proud of…<input className="start-input" value={proud} onChange={(e) => setProud(e.target.value)} placeholder="my Price Tracker graph because…" /></label>
        <label className="p3-lbl">🚀 Next period I want to improve…<input className="start-input" value={next} onChange={(e) => setNext(e.target.value)} placeholder="my writing about graphs." /></label>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!all || countWords(proud) < 4 || countWords(next) < 3} onClick={() => finish(20, { stars, score, proud, next })}>Send my self-check <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   ESTRUCTURA DEL PERIODO (10 clases)
   ===================================================================== */
const G7P1_WEEKS = [
  { n: 1, g: "1", title: "Welcome to 7th", blurb: "Your Money Radar, the basics, and a mission.", e: "🧭", skills: ["Reading", "Writing"], acts: [
    { key: "c1_radar", title: "My Money Radar 🧭", desc: "10 situations · 5 pillars. Where am I today?", icon: <Compass size={22} />, coins: 15, bucket: "comportamiento", topics: ["Money", "Business", "Wellbeing", "Digital", "Global"] },
    { key: "c1_basics", title: "Money Basics · Starter Pack", desc: "6 ideas every 7th grader needs.", icon: <Sparkles size={22} />, coins: 20, bucket: "quizzes" },
    { key: "c1_tracker", title: "Price Tracker · Mission Launch 🔎", desc: "Choose 3 products and predict their prices.", icon: <Search size={22} />, coins: 15, bucket: "aprendi" },
  ] },
  { n: 2, g: "2", title: "What is a price?", blurb: "The Arepa Business Challenge.", e: "🫓", skills: ["Reading", "Writing"], acts: [
    { key: "c2_read", title: "Reading: Doña Rosa's Arepa Stand", desc: "The price puzzle + 5 questions.", icon: <BookOpen size={22} />, coins: 30, bucket: "quizzes", topics: ["Cost", "Price", "Profit", "Value"] },
    { key: "c2_builder", title: "Price Builder 🫓", desc: "Find the costs and choose the best price.", icon: <Calculator size={22} />, coins: 30, bucket: "aprendi" },
    { key: "c2_value", title: "Price or Value?", desc: "Same product, different story.", icon: <Scale size={22} />, coins: 22, bucket: "quizzes" },
    { key: "c2_boss", title: "Arepa Boss Battle ⚔️", desc: "4 problems. Save the business!", icon: <Swords size={22} />, coins: 22, bucket: "quizzes" },
    { key: "c2_trk", title: "Price Tracker #1", desc: "Record + is it fair or expensive?", icon: <LineIcon size={22} />, coins: 10, bucket: "aprendi" },
  ] },
  { n: 3, g: "3", title: "Supply & demand", blurb: "The candy fair and your lemonade stand.", e: "🍋", skills: ["Listening", "Speaking"], acts: [
    { key: "c3_video", title: "Video: Supply & Demand at the Fair", desc: "Watch + 8 random questions (70%).", icon: <Video size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c3_lemon", title: "Lemonade Market 🍋", desc: "5 days, 5 decisions: supply & price.", icon: <MapIcon size={22} />, coins: 40, bucket: "aprendi", topics: ["Heatwave", "Rain", "Competitor", "Shortage"] },
    { key: "c3_shift", title: "Shift It! ⚖️", desc: "Supply or demand? Price up or down?", icon: <TrendingUp size={22} />, coins: 22, bucket: "quizzes" },
    { key: "c3_trk", title: "Price Tracker #2", desc: "Record + supply or demand?", icon: <LineIcon size={22} />, coins: 10, bucket: "aprendi" },
  ] },
  { n: 4, g: "4", title: "Scarcity & choice", blurb: "The Last Ticket and Scarcity Island.", e: "🏝️", skills: ["Reading", "Writing"], acts: [
    { key: "c4_read", title: "Reading: The Last Ticket", desc: "A story about scarcity + 5 questions.", icon: <BookOpen size={22} />, coins: 30, bucket: "quizzes" },
    { key: "c4_island", title: "Scarcity Island 🏝️", desc: "10 tokens, 3 days. Survive!", icon: <MapIcon size={22} />, coins: 24, bucket: "aprendi" },
    { key: "c4_cards", title: "Opportunity Cost Cards 🃏", desc: "If I choose…, I give up…", icon: <Scale size={22} />, coins: 20, bucket: "aprendi" },
    { key: "c4_trk", title: "Price Tracker #3", desc: "Record + my Decision Journal.", icon: <LineIcon size={22} />, coins: 10, bucket: "aprendi" },
  ] },
  { n: 5, g: "5", title: "Inflation", blurb: "Grandpa's Empanada and the Price Time Machine.", e: "🎈", skills: ["Reading", "Listening"], acts: [
    { key: "c5_read", title: "Reading: Grandpa's Empanada", desc: "Unlock Grandpa's notebook.", icon: <BookOpen size={22} />, coins: 30, bucket: "quizzes", topics: ["Inflation", "Purchasing power", "Hyperinflation"] },
    { key: "c5_video", title: "Video: What is inflation?", desc: "Watch + 8 random questions (70%).", icon: <Video size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c5_machine", title: "Price Time Machine ⏳", desc: "1990 · 2005 · 2026 with $10,000.", icon: <Clock size={22} />, coins: 30, bucket: "aprendi" },
    { key: "c5_detective", title: "Inflation Detective 🕵️", desc: "Why did the price rise?", icon: <Search size={22} />, coins: 22, bucket: "quizzes" },
    { key: "c5_trk", title: "Price Tracker #4", desc: "Record + which rose the most?", icon: <LineIcon size={22} />, coins: 10, bucket: "aprendi" },
  ] },
  { n: 6, g: "6", title: "Purchasing power", blurb: "Same money, smaller cart.", e: "🛒", skills: ["Reading", "Writing"], acts: [
    { key: "c6_learn", title: "Same Money, Smaller Cart 🛒", desc: "5 key ideas + quick check.", icon: <Lightbulb size={22} />, coins: 17, bucket: "quizzes" },
    { key: "c6_cart", title: "Cart Challenge · $50,000", desc: "2020 vs 2026: what leaves your cart?", icon: <ShoppingCart size={22} />, coins: 30, bucket: "aprendi" },
    { key: "c6_percent", title: "Percent Power 🧮", desc: "6 problems of percent change.", icon: <Calculator size={22} />, coins: 24, bucket: "quizzes" },
    { key: "c6_trk", title: "Price Tracker #5", desc: "Record + calculate YOUR % change.", icon: <LineIcon size={22} />, coins: 10, bucket: "aprendi" },
  ] },
  { n: 7, g: "7", title: "Reading price graphs", blurb: "Price News, graph words and Plot It!", e: "📈", skills: ["Listening", "Writing"], acts: [
    { key: "c7_listen", title: "Listening: Price News 🎙️", desc: "Listen + 8 random questions (70%).", icon: <Headphones size={22} />, coins: 42, bucket: "quizzes" },
    { key: "c7_words", title: "Graph Words 📈📉", desc: "Rise, drop, peak, fluctuate…", icon: <TrendingUp size={22} />, coins: 24, bucket: "quizzes" },
    { key: "c7_detective", title: "Graph Detective 🔍", desc: "8 graphs to analyze.", icon: <Search size={22} />, coins: 30, bucket: "quizzes" },
    { key: "c7_plot", title: "Plot It! 📊", desc: "Build line and bar graphs.", icon: <BarChart3 size={22} />, coins: 30, bucket: "aprendi" },
    { key: "c7_write", title: "Writing: Describe the graph ✍️", desc: "Example + language frames.", icon: <PenLine size={22} />, coins: 25, bucket: "aprendi" },
    { key: "c7_trk", title: "Price Tracker #6", desc: "Record + my tracker graph.", icon: <LineIcon size={22} />, coins: 10, bucket: "aprendi" },
  ] },
  { n: 8, g: "8", title: "Prices around the world", blurb: "The Big Mac Index and your world passport.", e: "🍔", skills: ["Reading", "Speaking"], acts: [
    { key: "c8_read", title: "Reading: The Big Mac Index", desc: "Read + True, False or Not enough info?", icon: <BookOpen size={22} />, coins: 20, bucket: "quizzes" },
    { key: "c8_tour", title: "World Price Tour 🍔🌍", desc: "5 countries, 5 conversions, 1 ranking.", icon: <Globe size={22} />, coins: 30, bucket: "aprendi" },
    { key: "c8_currency", title: "Currency Quest 💱", desc: "Currency match + exchange machine.", icon: <Coins size={22} />, coins: 30, bucket: "quizzes" },
    { key: "c8_trk", title: "Price Tracker #7", desc: "Record + my world discovery.", icon: <LineIcon size={22} />, coins: 10, bucket: "aprendi" },
  ] },
  { n: 9, g: "9", title: "Smart consumers", blurb: "Shrinkflation, rights, reviews and business.", e: "🍫", skills: ["Reading", "Writing"], acts: [
    { key: "c9_read", title: "Reading: The Shrinking Chocolate Bar", desc: "A newspaper report + 4 questions.", icon: <BookOpen size={22} />, coins: 26, bucket: "quizzes", topics: ["Shrinkflation", "Ley 1480", "SIC", "Reviews"] },
    { key: "c9_hunt", title: "Shrinkflation Hunt 🔍", desc: "Spot it, calculate it, choose well.", icon: <Search size={22} />, coins: 25, bucket: "aprendi" },
    { key: "c9_reviews", title: "Fake or Real Review? 🕵️", desc: "Evidence board + verdict.", icon: <Star size={22} />, coins: 23, bucket: "quizzes" },
    { key: "c9_crisis", title: "Your Business vs. Inflation 🧯", desc: "Profit, trust and quality.", icon: <Flame size={22} />, coins: 22, bucket: "aprendi" },
    { key: "c9_trk", title: "Price Tracker #8", desc: "Last record + Smart Consumer Report.", icon: <LineIcon size={22} />, coins: 10, bucket: "aprendi" },
  ] },
  { n: 10, g: "10", title: "Market Report Fair", blurb: "Your report, your presentation, the Boss.", e: "🏆", skills: ["Speaking", "Writing"], acts: [
    { key: "c10_report", title: "My Consumer Market Report 📰", desc: "It builds itself with your tracker!", icon: <Award size={22} />, coins: 50, bucket: "aprendi" },
    { key: "c10_present", title: "Present + partner feedback 🎤", desc: "Checklist and stars.", icon: <Mic size={22} />, coins: 20, bucket: "comportamiento" },
    { key: "c10_boss", title: "Boss Battle · Period 1 ⚔️", desc: "12 questions from the whole period.", icon: <Swords size={22} />, coins: 58, bucket: "quizzes" },
    { key: "c10_self", title: "My Self-Check", desc: "How did I do?", icon: <Star size={22} />, coins: 20, bucket: "comportamiento" },
  ] },
];
const ALL_ACTS = G7P1_WEEKS.flatMap((w) => w.acts);
const TOTAL_ACTS = ALL_ACTS.length;

const TRK_EXTRA_FAIR = {
  title: "Is one of your prices fair or expensive? Why?",
  initial: "",
  valid: (v) => countWords(v) >= 5,
  render: (v, set) => <div className="p3-sentence edit"><span>I think the price of</span><input className="start-input" value={v} onChange={(e) => set(e.target.value)} placeholder="eggs is expensive because it went up." /></div>,
};
const TRK_EXTRA_SD = {
  title: "Did supply or demand change for one of your products?",
  initial: { c: "", s: "" },
  valid: (v) => v && v.c,
  render: (v, set) => (
    <>
      <div className="p1-starters">{["Demand went up", "Demand went down", "Supply went up", "Supply went down", "I don't know yet"].map((o) => <button key={o} type="button" className={`p1-chip ${v.c === o ? "on" : ""}`} onClick={() => set({ ...v, c: o })}>{o}</button>)}</div>
      <input className="start-input" value={v.s} onChange={(e) => set({ ...v, s: e.target.value })} placeholder="(Optional) Why? Example: eggs are scarce this week." />
    </>
  ),
};

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Periodo1G7 = ({ userData, API_URL, existingRow, onBack }) => {
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
      .catch((e) => { console.error("Error guardando 7° Periodo 1:", e); dispatch({ type: "rollback_progreso", payload: { Semana: PERIOD_KEY, prev } }); });
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
    const trk = (week2, extra) => <TrackerCheck week={week2} resp={resp} existing={resp[act]} extra={extra} onSave={save} onExit={exit} />;
    let view = null;

    switch (act) {
      case "c1_radar": view = <MoneyRadar7 existing={resp.c1_radar} onSave={save} onExit={exit} />; break;
      case "c1_basics": view = <BasicsPack onSave={save} onExit={exit} />; break;
      case "c1_tracker": view = <TrackerLaunch existing={resp.c1_tracker} onSave={save} onExit={exit} />; break;

      case "c2_read": view = (
        <ReadThen tag="READING · A2+ · PRICES" title="Doña Rosa's Arepa Stand" subtitle="The Price Puzzle" minutes={8} sections={READ_C2} glossary={GLOSS_C2} onExit={exit} finishLabel="I read it — check my understanding">
          <QuizRunner title="Arepa check" emoji="🫓" questions={Q_C2} pickCount={5} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "c2_builder": view = <PriceBuilder onSave={save} onExit={exit} />; break;
      case "c2_value": view = <PriceOrValue onSave={save} onExit={exit} />; break;
      case "c2_boss": view = <ArepaBoss onSave={save} onExit={exit} />; break;
      case "c2_trk": view = trk(1, TRK_EXTRA_FAIR); break;

      case "c3_video": view = <VideoQuiz src={VIDEO_SUPPLY} title="Video check: supply & demand" questions={Q_C3} pickCount={8} onSave={save} onExit={exit} />; break;
      case "c3_lemon": view = <QuestMap icon={<MapIcon size={22} />} title="Lemonade Market 🍋" subtitle="Run your lemonade stand for 5 days. Every day the market changes!" rooms={LEMON_ROOMS} studentName={name} coins={40} existing={resp.c3_lemon} diploma={{ e: "🍋", small: "Lemonade Market", title: "Lemonade Tycoon" }} onSave={save} onExit={exit} />; break;
      case "c3_shift": view = <ShiftIt onSave={save} onExit={exit} />; break;
      case "c3_trk": view = trk(2, TRK_EXTRA_SD); break;

      case "c4_read": view = (
        <ReadThen tag="READING · A2+ · SCARCITY" title="The Last Ticket" subtitle="A choice that changed everything" minutes={7} sections={READ_C4} glossary={GLOSS_C4} onExit={exit} finishLabel="I read it — check my understanding">
          <QuizRunner title="Story check" emoji="🎫" questions={Q_C4} pickCount={5} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "c4_island": view = <ScarcityIsland onSave={save} onExit={exit} />; break;
      case "c4_cards": view = <OppCostCards onSave={save} onExit={exit} />; break;
      case "c4_trk": view = trk(3, DECISION_JOURNAL); break;

      case "c5_read": view = (
        <ReadThen tag="READING · A2+ · INFLATION" title="Grandpa's Empanada" subtitle="The mystery of the missing money" minutes={8} sections={READ_C5} glossary={GLOSS_C5} onExit={exit} finishLabel="I read it — unlock Grandpa's notebook">
          <QuizRunner title="Grandpa's Notebook" emoji="📒" questions={Q_C5} pickCount={5} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "c5_video": view = <VideoQuiz src={VIDEO_INFLATION} title="Video check: inflation" questions={Q_C5V} pickCount={8} onSave={save} onExit={exit} />; break;
      case "c5_machine": view = <TimeMachine onSave={save} onExit={exit} />; break;
      case "c5_detective": view = <SortActivity icon={<Search size={22} />} title="Inflation Detective 🕵️" subtitle="Why did the price rise? Connect each case with its cause." intro={CAUSES_INTRO} buckets={CAUSES} items={CAUSE_ITEMS} per={3} bonus={4} doneTitle="Inflation Detective! 🕵️" onSave={save} onExit={exit} />; break;
      case "c5_trk": view = <TrackerFour resp={resp} existing={resp.c5_trk} onSave={save} onExit={exit} />; break;

      case "c6_learn": view = <SameMoneyLearn onSave={save} onExit={exit} />; break;
      case "c6_cart": view = <CartChallenge onSave={save} onExit={exit} />; break;
      case "c6_percent": view = <NumberRounds icon={<Calculator size={22} />} title="Percent Power 🧮" subtitle="How much did the price change, in percent?" intro={PERCENT_INTRO} rounds={PERCENT_ROUNDS} coinsPer={3} bonus={6} doneTitle="Percent pro! 🧮" onSave={save} onExit={exit} />; break;
      case "c6_trk": view = <TrackerFive resp={resp} existing={resp.c6_trk} onSave={save} onExit={exit} />; break;

      case "c7_listen": view = <AudioQuiz src={AUDIO_PRICE_NEWS} title="Price News check" questions={Q_C7} pickCount={8} onSave={save} onExit={exit} />; break;
      case "c7_words": view = <GraphWords onSave={save} onExit={exit} />; break;
      case "c7_detective": view = <NumberRounds icon={<Search size={22} />} title="Graph Detective 🔍" subtitle="Read each graph carefully. Look at the axis!" rounds={GD_ROUNDS} coinsPer={3} bonus={6} doneTitle="Graph detective! 🔍" onSave={save} onExit={exit} />; break;
      case "c7_plot": view = <PlotIt onSave={save} onExit={exit} />; break;
      case "c7_write": view = <GraphWriter resp={resp} existing={resp.c7_write} onSave={save} onExit={exit} />; break;
      case "c7_trk": view = <TrackerSix resp={resp} existing={resp.c7_trk} onSave={save} onExit={exit} />; break;

      case "c8_read": view = (
        <ReadThen tag="READING · A2+ · GLOBAL PRICES" title="The Big Mac Index" subtitle="One burger, five countries" minutes={7} sections={READ_C8} glossary={GLOSS_C8} onExit={exit} finishLabel="I read it — let's investigate!">
          <SortActivity icon={<Globe size={22} />} title="True, False or Not Enough Info?" subtitle="Careful: some sentences say more than the data can tell us!" buckets={TFN} items={TFN_ITEMS} per={3} bonus={2} doneTitle="Burger detective! 🍔" onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "c8_tour": view = <WorldTour7 onSave={save} onExit={exit} />; break;
      case "c8_currency": view = <CurrencyQuest onSave={save} onExit={exit} />; break;
      case "c8_trk": view = trk(7, WORLD_DISCOVERY); break;

      case "c9_read": view = (
        <ReadThen tag="NEWSPAPER · A2+ · SMART CONSUMERS" title="The Smart Shopper Times" subtitle="Are you getting the same value for your money?" minutes={7} sections={READ_C9} glossary={GLOSS_C9} onExit={exit} finishLabel="I read it — check my understanding">
          <QuizRunner title="Consumer check" emoji="🍫" questions={Q_C9} pickCount={4} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "c9_hunt": view = <ShrinkHunt onSave={save} onExit={exit} />; break;
      case "c9_reviews": view = <ReviewDetective onSave={save} onExit={exit} />; break;
      case "c9_crisis": view = <CrisisRoom onSave={save} onExit={exit} />; break;
      case "c9_trk": view = trk(8, SMART_REPORT); break;

      case "c10_report": view = <MarketReport resp={resp} studentName={name} existing={resp.c10_report} onSave={save} onExit={exit} />; break;
      case "c10_present": view = <PresentFeedback onSave={save} onExit={exit} />; break;
      case "c10_boss": view = <QuizRunner title="Boss Battle · Period 1" emoji="⚔️" questions={BOSS_7P1} pickCount={12} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />; break;
      case "c10_self": view = <SelfCheck7 existing={resp.c10_self} onSave={save} onExit={exit} />; break;
      default: view = null;
    }
    return <div className="s1 p1 p2 p3 p4 g7">{view}</div>;
  }

  /* ---------- SEMANA ABIERTA ---------- */
  if (week) {
    const w = G7P1_WEEKS.find((x) => x.n === week);
    const wDone = w.acts.filter((a) => checklist[a.key]).length;
    const next = G7P1_WEEKS.find((x) => x.n === w.n + 1);
    return (
      <div className="s1 p1 p2 p3 p4 g7">
        <button className="s1-back" onClick={() => setWeek(null)}><ArrowLeft size={18} strokeWidth={2.4} /> Back to Period 1</button>
        <div className="s1-hero p1-week-hero g7-hero">
          <span className="s1-tag">{w.e} GRADE 7 · PERIOD 1 · CLASS {w.g}</span>
          <h1>{w.title}</h1>
          <p>{w.blurb}</p>
          <div className="s1-progress"><div className="bar"><i style={{ width: `${(wDone / w.acts.length) * 100}%` }} /></div><span className="pill">{wDone}/{w.acts.length}</span></div>
        </div>
        {w.n > 1 && <TrackerPanel resp={respRef.current} compact />}
        <div className="s1-quest">
          {w.acts.map((a) => (
            <div key={a.key} className={`act-card ${checklist[a.key] ? "done" : ""} ${a.key.endsWith("_trk") || a.key === "c1_tracker" ? "g7-trk-act" : ""}`}>
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
    <div className="s1 p1 p2 p3 p4 g7">
      <button className="s1-back" onClick={onBack}><ArrowLeft size={18} strokeWidth={2.4} /> Back to overview</button>

      <div className="s1-hero p1-hero g7-hero">
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> ADMIN PREVIEW · GRADE {GRADE} · PERIOD 1</span>
        <h1>Why Do Prices Change?</h1>
        <p>Why do prices change, and how can understanding inflation help us become smarter consumers?</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pct}%` }} /></div><span className="pill">{pct}%</span></div>
        <div className="p1-hero-chips">
          <span><Coins size={14} /> {coinsTotal} coins</span>
          <span><Check size={14} /> {doneCount}/{TOTAL_ACTS} activities</span>
          <span>🔎 Market Detective</span>
          <span>🎯 SDG 8 · SDG 12</span>
        </div>
      </div>

      <TrackerPanel resp={respRef.current} />
      {checklist.c10_report && <button type="button" className="p3-card-link" onClick={() => setAct("c10_report")}><Award size={18} /> See my Consumer Market Report <ChevronRight size={16} /></button>}

      <div className="p1-passport">
        <div className="p1-passport-head"><b>🔎 Market Detective Passport</b><span>Finish a class to get its stamp</span></div>
        <div className="p1-stamps">
          {G7P1_WEEKS.map((w) => (
            <button key={w.n} type="button" className={`p1-stamp ${weekDone(w) ? "done" : ""}`} onClick={() => setWeek(w.n)} title={w.title}>
              <em>{w.e}</em><small>{w.g}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="p1-weeks">
        {G7P1_WEEKS.map((w) => {
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