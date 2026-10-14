import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft, BookOpen, Video, Check, X, Coins, Trophy, Sparkles, Clock, ChevronRight, Lightbulb, Play,
  PenLine, Star, Users, Lock, Store, Scale, RefreshCw, Award, Puzzle, Mic, Target, Calculator,
  ShieldCheck, ShieldAlert, Plus, Minus, Trash2, Search, Swords, Rocket, Palette, Download, Printer,
  Wallet, ShoppingCart, Smartphone, Globe, Megaphone, Bot, Truck, Receipt, KeyRound, Compass, Gift,
  Map as MapIcon,
} from "lucide-react";
import "../Styles/semana1.css";   // botones, quiz, reward, monedas (misma gamificación)
import "../Styles/periodo1.css";  // piezas del Periodo 1
import "../Styles/periodo2.css";  // piezas del Periodo 2
import "../Styles/periodo3.css";  // logo, marca, empresa (Periodo 3)
import "../Styles/periodo4.css";  // estilos nuevos del Periodo 4
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   PERIODO 4 · MY COMPANY GOES GLOBAL  (Grado 6 · A2)
   7 clases (33–42). La empresa del Periodo 3 abre su TIENDA ONLINE:
   cada clase agrega una pieza y al final la tienda se publica en el
   Global Business Showcase, donde los compañeros compran y dejan reseñas.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "P4".
   Lee (solo lectura) las filas "P3" (empresa) y "P1" (self-check inicial).
   ===================================================================== */

const PERIOD_KEY = "P4";
const GRADE = "6";

const VIDEO_ECOMMERCE = "https://res.cloudinary.com/y9r84vgz/video/upload/v1791998437/videoplayback_8.mp4";
const VIDEO_CURRENCIES = "https://res.cloudinary.com/y9r84vgz/video/upload/v1791908442/videoplayback_5.mp4"; // 🔁 cambia aquí si tienes otro video de monedas
const WALLET_START = 100000;

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
   SISTEMA DE MARCA (logo hecho con datos: icono + forma + colores + letra)
   ===================================================================== */
const LOGO_ICONS = ["🌱", "♻️", "📚", "✏️", "🎨", "🍎", "🧁", "🐶", "⚡", "💡", "🚀", "🌎", "🎧", "⚽", "👕", "🧸", "💧", "☀️", "🛹", "🧩", "🔧", "🎁", "❤️", "⭐"];
const LOGO_SHAPES = [
  { id: "circle", label: "Circle" }, { id: "rounded", label: "Rounded" }, { id: "hex", label: "Hexagon" },
  { id: "shield", label: "Shield" }, { id: "leaf", label: "Leaf" }, { id: "none", label: "No shape" },
];
const PALETTES = [
  { id: "forest", name: "Forest", c: ["#0b7a50", "#bdeed7", "#f5b23e"] },
  { id: "ocean", name: "Ocean", c: ["#1d4ed8", "#bfdbfe", "#f59e0b"] },
  { id: "sunset", name: "Sunset", c: ["#e0563f", "#ffe1c7", "#7c2d12"] },
  { id: "candy", name: "Candy", c: ["#db2777", "#fbcfe8", "#7c3aed"] },
  { id: "earth", name: "Earth", c: ["#7c4a1e", "#efe2cc", "#3f6212"] },
  { id: "night", name: "Night", c: ["#111827", "#c7d2fe", "#facc15"] },
  { id: "lemon", name: "Lemon", c: ["#a16207", "#fef08a", "#166534"] },
  { id: "mint", name: "Mint", c: ["#0f766e", "#ccfbf1", "#f43f5e"] },
];
const FONTS = [
  { id: "bold", label: "Bold & modern", css: "'Bricolage Grotesque', system-ui, sans-serif", w: 800 },
  { id: "classic", label: "Classic", css: "Georgia, 'Times New Roman', serif", w: 700 },
  { id: "fun", label: "Playful", css: "'Trebuchet MS', 'Comic Sans MS', cursive", w: 700 },
  { id: "tech", label: "Tech", css: "'Courier New', ui-monospace, monospace", w: 700 },
];
const DEFAULT_BRAND = { name: "My Company", icon: "🚀", shape: "circle", palette: "forest", font: "bold", slogan: "" };
const palOf = (id) => PALETTES.find((p) => p.id === id) || PALETTES[0];
const fontOf = (id) => FONTS.find((f) => f.id === id) || FONTS[0];

function LogoMark({ brand, size = 96, showName = true, row = false, light = false }) {
  const b = { ...DEFAULT_BRAND, ...(brand || {}) };
  const pal = palOf(b.palette).c;
  const f = fontOf(b.font);
  const mark = b.shape === "none"
    ? <span className="p3-mark none" style={{ width: size, height: size, fontSize: size * 0.62 }}>{b.icon}</span>
    : <span className={`p3-mark ${b.shape}`} style={{ width: size, height: size, fontSize: size * 0.5, background: `linear-gradient(145deg, ${pal[0]}, ${pal[0]}dd)`, boxShadow: `0 0 0 ${Math.max(3, size * 0.05)}px ${pal[1]}` }}>{b.icon}</span>;
  return (
    <div className={`p3-logo ${row ? "row" : ""}`}>
      {mark}
      {showName && (
        <div className="p3-logo-text">
          <b style={{ fontFamily: f.css, fontWeight: f.w, color: light ? "#fff" : pal[0], fontSize: Math.max(14, size * (row ? 0.32 : 0.24)) }}>{b.name || "My Company"}</b>
          {b.slogan && <small style={{ color: light ? "rgba(255,255,255,.85)" : pal[2] === "#facc15" ? "#a16207" : pal[2] }}>{b.slogan}</small>}
        </div>
      )}
    </div>
  );
}

/* =====================================================================
   COMPANY BUILDER · arma la empresa con todo lo que el estudiante creó
   ===================================================================== */
function buildCompany(resp, studentName) {
  const r = resp || {};
  const p = r.w22_profile || {}, pb = r.w23_card || {}, cs = r.w24_survey || {}, cc = r.w25_concept || {};
  const br = r.w29_logo || {}, mv = r.w29_mission || {}, org = r.w28_org || {}, fi = r.w28_finance || {};
  const et = r.w30_ethics || {}, pr = r.w31_proto || {}, pi = r.w31_pitch || {};
  const name = br.name || cc.name || "My Company";
  return {
    founder: studentName, alias: p.alias, avatar: p.avatar || "🧑‍🚀", skills: p.skills || [], firstIdea: p.idea,
    problem: pb.problem || cc.problem, who: pb.who, where: pb.where, why: pb.why,
    customer: cc.customer || pb.who, questions: cs.questions || [], learned: cs.learned || [], change: cs.change,
    type: cc.type, idea: cc.idea, value: cc.value,
    name, brand: br.icon ? br : { ...DEFAULT_BRAND, name }, slogan: br.slogan,
    mission: mv.mission, vision: mv.vision, values: mv.values || [],
    org: org.people || null,
    finance: fi.price ? fi : null,
    rule: et.rule,
    prototype: pr.what ? pr : null,
    pitch: pi.parts ? pi : null,
    parts: [
      { id: "profile", n: "01", label: "Entrepreneur profile", done: !!p.idea },
      { id: "problem", n: "02", label: "Problem & customer", done: !!pb.problem && !!cs.questions },
      { id: "solution", n: "03", label: "Solution & value", done: !!cc.value },
      { id: "brand", n: "04", label: "Brand identity", done: !!br.icon && !!mv.mission },
      { id: "org", n: "05", label: "Organization chart", done: !!org.people },
      { id: "money", n: "06", label: "Business finances", done: !!fi.price },
      { id: "proto", n: "07", label: "Prototype & pitch", done: !!pr.what && !!pi.parts },
      { id: "card", n: "08", label: "Final company card", done: !!r.w32_card },
    ],
  };
}

/* Tarjeta "en construcción" de la empresa (se ve en el menú y en varias actividades) */
function StartupMini({ company, compact }) {
  const done = company.parts.filter((p) => p.done).length;
  return (
    <div className={`p3-mini ${compact ? "compact" : ""}`}>
      <LogoMark brand={company.brand} size={compact ? 54 : 78} row />
      <div className="p3-mini-info">
        <small>MY STARTUP · {done}/8 parts built</small>
        <div className="p3-mini-bar"><i style={{ width: `${(done / 8) * 100}%` }} /></div>
        {!compact && (
          <div className="p3-parts">
            {company.parts.map((p) => <span key={p.id} className={p.done ? "on" : ""} title={p.label}><b>{p.n}</b>{p.label}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================================
   PIEZAS DEL PERIODO 4
   ===================================================================== */
const RATES = [
  { code: "USD", sym: "US$", name: "US dollar", flag: "🇺🇸", rate: 4000, dec: 2 },
  { code: "GBP", sym: "£", name: "British pound", flag: "🇬🇧", rate: 5000, dec: 2 },
  { code: "EUR", sym: "€", name: "Euro", flag: "🇪🇺", rate: 4500, dec: 2 },
  { code: "JPY", sym: "¥", name: "Japanese yen", flag: "🇯🇵", rate: 27, dec: 0 },
  { code: "MXN", sym: "MX$", name: "Mexican peso", flag: "🇲🇽", rate: 220, dec: 0 },
];
const fx = (copAmount, code) => {
  const r = RATES.find((x) => x.code === code);
  if (!r) return cop(copAmount);
  const v = Number(copAmount || 0) / r.rate;
  return `${r.sym}${v.toLocaleString("en-US", { minimumFractionDigits: r.dec, maximumFractionDigits: r.dec })}`;
};
function RatesCard() {
  return (
    <div className="p2-rates">
      <b>🏦 Class exchange rates</b>
      <div>{RATES.map((r) => <span key={r.code}>{r.flag} 1 {r.sym} = <b>{cop(r.rate)}</b> COP</span>)}</div>
      <small>Rounded numbers for class. Real rates change every day.</small>
    </div>
  );
}

function QRow({ n, q, children }) {
  return <div className="p3-qrow"><span className="step-n">{n}</span><div><b>{q}</b>{children}</div></div>;
}

/* Juego de opciones simple (una pregunta, varias respuestas posibles correctas) */
function ChoiceCard({ q, options, good, onAnswer, picked, feedback }) {
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

/* =====================================================================
   CLASE 33 · MONEY AND TECHNOLOGY TODAY (repaso del año)
   ===================================================================== */
const READ_W33 = [
  { h: "From Shells to Phones: The Story of Money" },
  { p: "Have you ever paid for something with a phone? Today, people can buy food, clothes, and even plane tickets without using cash. But money was very different thousands of years ago. Its story shows how people use new ideas and technology to solve problems." },
  { sub: "1 · Before coins: Bartering" },
  { p: "Long ago, people did not have coins or banknotes. They exchanged goods and services directly. This system was called bartering. For example, a farmer could exchange eggs for shoes." },
  { p: "However, bartering was not always easy. Imagine that you have eggs, but you need a book. The person with the book may not want eggs. People needed a more convenient way to exchange things." },
  { sub: "2 · Objects, shells, and metal coins" },
  { p: "Different societies used objects such as shells, salt, and other valuable goods as money. Later, people began using metal coins. Coins were easier to count and carry than many goods. They also helped people agree on the value of products." },
  { sub: "3 · Paper money and banks" },
  { p: "Instead of carrying many heavy coins, people could carry lighter banknotes. Banks also helped people keep their money safe, save for the future, and make payments." },
  { sub: "4 · Cards and digital payments" },
  { p: "A debit card usually uses money from your bank account. A credit card allows you to borrow money and pay it back later, according to the card's terms. Today, many shops accept contactless payments: you tap a card or a phone near a payment terminal." },
  { sub: "5 · Money in your phone" },
  { p: "Digital wallets allow people to make payments using a smartphone. Some banking apps also let people check their balance, transfer money, pay bills, and save toward a goal." },
  { say: "Sara wants to buy a bicycle. She uses her banking app to check how much money she has saved. She compares prices online. Technology helps her organize her money, but Sara must still control her spending." },
  { sub: "6 · Is digital money always better?" },
  { p: "Digital payments can be fast and convenient. However, they also have risks. A person may receive a fake message asking for a password or a bank code. That is why people should use strong passwords, protect their PINs, check transactions, and use official banking apps." },
  { p: "Not everyone has a smartphone, a bank account, or a reliable internet connection. Cash is still useful in many situations." },
  { sub: "7 · The future of money" },
  { p: "The important question is not only “How can I pay?” but also “Is this payment safe, useful, and right for me?”" },
  { box: "Technology changes the way we use money, but responsible financial decisions are always important." },
];
const GLOSS_W33 = {
  "bartering": "Trueque — cambiar cosas sin usar dinero.",
  "banknotes": "Billetes.",
  "debit card": "Tarjeta débito — usa el dinero de tu cuenta.",
  "credit card": "Tarjeta de crédito — dinero prestado que pagas después.",
  "contactless": "Sin contacto — acercas la tarjeta o el celular.",
  "digital wallets": "Billeteras digitales (Nequi, Daviplata…).",
  "balance": "Saldo — el dinero que tienes.",
};
const Q_W33 = [
  { q: "Why was bartering sometimes difficult?", options: ["Both people needed to want what the other person offered.", "People did not have any products.", "Coins were too expensive."], correct: 0, feedback: "Eggs for a book? Only if the other person wants eggs!" },
  { q: "What was one benefit of paper money?", options: ["It was easier to carry than many heavy coins.", "It never lost its value.", "People did not need banks."], correct: 0, feedback: "Lighter than heavy coins." },
  { q: "What does a debit card usually use?", options: ["Money from your bank account.", "Money borrowed from a friend.", "Only digital coins."], correct: 0, feedback: "Debit = your own money." },
  { q: "What can a banking app help people do?", options: ["Check balances and transfer money.", "Guarantee that they will become rich.", "Remove every financial risk."], correct: 0, feedback: "Check, transfer, pay, save." },
  { q: "Why should people protect their PIN?", options: ["It helps protect access to their money.", "It is public information.", "It makes online shopping free."], correct: 0, feedback: "Your PIN is a key to your money." },
  { q: "Why is cash still useful?", options: ["Some people and businesses cannot use digital payments.", "Everyone prefers cash.", "Cash always costs less."], correct: 0, feedback: "Not everyone has a phone or internet." },
];

const TIMELINE = [
  "🔄 Bartering: exchanging goods directly",
  "🐚 Shells, salt and other objects",
  "🪙 Metal coins",
  "💵 Paper money and banknotes",
  "💳 Debit and credit cards",
  "📶 Contactless payments",
  "📱 Digital wallets and banking apps",
];
const TL_LABELS = ["Long ago", "Then", "Later", "Next", "20th century", "Today", "Today + 📱"];
const BENEFITS = [
  { a: "🔄 Bartering", b: "Exchange goods directly" },
  { a: "🪙 Coins", b: "Count and compare value more easily" },
  { a: "💵 Banknotes", b: "Carry money more easily" },
  { a: "🏦 Banking apps", b: "Check balances and transfer money" },
  { a: "📱 Digital wallets", b: "Pay using a phone" },
];
function TimelineBuilder({ onSave, onExit }) {
  const [stage, setStage] = useState("order");
  const [errs, setErrs] = useState(0);
  const [round, setRound] = useState(0);
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Money historian! 📜" subtitle="From shells to phones — you know the whole story." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Clock size={22} strokeWidth={2.1} />} title="G5 · Timeline Builder" subtitle={stage === "order" ? "Put the history of money in order. Tap a card, then tap its place." : "Bonus! Match each invention with its benefit."} onExit={onExit}>
      <div className="p3-stepper"><span className="on"><b>1</b>Order</span><span className={stage === "match" ? "on" : ""}><b>2</b>Benefits</span></div>
      {stage === "order"
        ? <OrderGame items={TIMELINE} labels={TL_LABELS} onDone={(r) => { setErrs(r.errors); setStage("match"); }} />
        : <div className="start-block"><MatchPairs key={round} pairs={BENEFITS} leftLabel="Invention" rightLabel="Benefit" onRestart={() => setRound((x) => x + 1)} onDone={(r) => finish(Math.max(12, 30 - errs * 2) + r.firstTry * 2, { orderErrors: errs, matchFirstTry: r.firstTry })} /></div>}
    </ActShell>
  );
}

const PAY = [
  { id: "cash", e: "💵", l: "Cash" }, { id: "debit", e: "💳", l: "Debit card" }, { id: "credit", e: "🏦", l: "Credit card" },
  { id: "wallet", e: "📱", l: "Digital wallet" }, { id: "app", e: "📊", l: "Banking app" },
];
const CASH_MISSIONS = [
  { s: "You are buying fruit at a small market that only accepts cash.", good: ["cash"], why: "The market only accepts cash!" },
  { s: "You want to buy something online from a trusted store.", good: ["debit", "wallet", "credit"], why: "Online stores need a digital payment. Cash doesn't work online." },
  { s: "You want to pay quickly at a shop with contactless payments.", good: ["wallet", "debit", "credit"], why: "Tap your card or phone — fast!" },
  { s: "Your phone has no battery, and you need to buy lunch.", good: ["cash", "debit"], why: "No battery = no digital wallet. Cash or a card works." },
  { s: "You want to check how much money you have saved.", good: ["app"], why: "A banking app shows your balance. It's not for paying here." },
];
const REASONS = ["it is fast", "it is safe", "it is the only option", "I can check my money", "it works without a phone"];
function CashOrClick({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [reason, setReason] = useState("");
  const [log, setLog] = useState([]);
  const [st, finish] = useFinish(onSave);
  const m = CASH_MISSIONS[i];
  const ok = pick && m.good.includes(pick);
  const score = log.filter((x) => x.ok).length;
  const next = () => {
    const entry = { mission: m.s, choice: pick, ok, sentence: `I chose ${PAY.find((p) => p.id === pick).l.toLowerCase()} because ${reason}.` };
    const nl = [...log, entry];
    if (i < CASH_MISSIONS.length - 1) { setLog(nl); setI(i + 1); setPick(null); setReason(""); }
    else finish(10 + nl.filter((x) => x.ok).length * 4, { answers: nl });
  };
  if (st.done) return <Reward title="Payment pro! 💳" subtitle="Cash or click — you know when to use each one." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Smartphone size={22} strokeWidth={2.1} />} title="Cash or Click? 💵📱" subtitle="Choose the best payment method for each mission. Then say why." onExit={onExit}>
      <div className="p2-hud"><span>Mission <b>{i + 1}/{CASH_MISSIONS.length}</b></span><span>Smart choices <b>{score}</b></span></div>
      <div className="p3-oops"><em>🛍️</em><small>MISSION</small><p>{m.s}</p></div>
      <div className="p4-paygrid">
        {PAY.map((p) => (
          <button key={p.id} type="button" disabled={!!pick} onClick={() => setPick(p.id)}
            className={`${pick === p.id ? (m.good.includes(p.id) ? "ok" : "no") : ""} ${pick && m.good.includes(p.id) && pick !== p.id ? "hint" : ""}`}>
            <em>{p.e}</em><b>{p.l}</b>
          </button>
        ))}
      </div>
      {pick && (
        <>
          <div className={`p1-banner ${ok ? "good" : "bad"}`}>{ok ? "Good choice! " : "Hmm… "}{m.why}</div>
          <div className="start-block">
            <h3><PenLine size={18} /> I chose {PAY.find((p) => p.id === pick).l.toLowerCase()} because…</h3>
            <div className="p1-starters">{REASONS.map((r) => <button key={r} type="button" className={`p1-chip ${reason === r ? "on" : ""}`} onClick={() => setReason(r)}>{r}</button>)}</div>
            <input className="start-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="…or write your own reason" />
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={countWords(reason) < 2} onClick={next}>{i < CASH_MISSIONS.length - 1 ? "Next mission" : "Finish"} <ChevronRight size={18} /></button></div>
        </>
      )}
    </ActShell>
  );
}

const WB_ROWS = [
  { l: "In the past, people used…", o: ["bartering", "shells and coins", "paper money"] },
  { l: "Today, people use…", o: ["bank cards", "digital wallets", "banking apps"] },
  { l: "Technology helps people…", o: ["pay faster", "check their balance", "compare prices"] },
  { l: "One risk is…", o: ["online scams", "sharing private information", "losing a phone"] },
  { l: "To stay safe, I should…", o: ["never share my PIN", "use official banking apps", "check my transactions"] },
];
function TechWriter({ existing, onSave, onExit }) {
  const [sel, setSel] = useState(existing?.sel || WB_ROWS.map(() => null));
  const [text, setText] = useState(existing?.text || "");
  const [touched, setTouched] = useState(!!existing?.text);
  const [st, finish] = useFinish(onSave);
  const all = sel.every((s) => s !== null);
  const draft = all ? `Technology changed money because people moved from ${WB_ROWS[0].o[sel[0]]} to ${WB_ROWS[1].o[sel[1]]}. Today, technology helps people ${WB_ROWS[2].o[sel[2]]}. However, there are risks, such as ${WB_ROWS[3].o[sel[3]]}. To protect my money, I should ${WB_ROWS[4].o[sel[4]]}.` : "";
  useEffect(() => { if (all && !touched) setText(draft); }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps
  const w = countWords(text);
  const own = touched && w >= countWords(draft) + 6;
  if (st.done) return <Reward title="Great writing! ✍️" subtitle="You connected the past, the present and the future of money." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<PenLine size={22} strokeWidth={2.1} />} title="Writing: Technology changed money because…" subtitle="Build your draft with the chips. Then add ONE idea of your own." onExit={onExit}>
      <div className="start-block">
        {WB_ROWS.map((r, i) => (
          <div key={r.l} className="p3-tiles">
            <small>{i + 1}. {r.l}</small>
            {r.o.map((o, k) => <button key={o} type="button" className={sel[i] === k ? "on" : ""} onClick={() => { setSel(sel.map((x, j) => (j === i ? k : x))); setTouched(false); }}>{o}</button>)}
          </div>
        ))}
      </div>
      {all && (
        <div className="start-block">
          <h3><Sparkles size={18} /> My draft — make it yours!</h3>
          <p className="start-tip">Add one more sentence with your own idea. Example: “I use… / My family pays with… / In the future…”</p>
          <textarea className="start-input" rows={6} value={text} onChange={(e) => { setText(e.target.value); setTouched(true); }} />
          <p className={`word-count ${own ? "ok" : ""}`}>{w} words · {own ? "✓ Your idea is in!" : "Add your own sentence (6+ more words)"}</p>
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!own} onClick={() => finish(25, { sel, text, words: w })}>Send my writing <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 34 · E-COMMERCE: HOW AN ONLINE STORE WORKS
   ===================================================================== */
const Q_W34 = [
  { q: "What is the video about?", options: ["How to save money in a bank", "How online shopping works", "How to build an entrepreneurship fair", "How to use a piggy bank"], correct: 1, feedback: "How online shopping works." },
  { q: "Which devices can you use to do online shopping from home?", options: ["Only a television", "A computer, tablet, or phone", "Only a landline phone", "A radio and a camera"], correct: 1, feedback: "Computer, tablet or phone." },
  { q: "Which examples of online shopping websites or apps are mentioned in the video?", options: ["Netflix and YouTube", "Amazon or Walmart", "Google and Yahoo", "Spotify and Instagram"], correct: 1, feedback: "Amazon or Walmart." },
  { q: "What is the very first step in online shopping?", options: ["Add to cart", "Checkout", "Search for what you want", "Pay with a gift card"], correct: 2, feedback: "First, you search." },
  { q: "What example item does the video use when searching in the online store?", options: ["A toy dinosaur", "A skateboard", "A Lego set", "Slime ingredients"], correct: 2, feedback: "A Lego set." },
  { q: "What information can you see when you click on an item?", options: ["The price, size, and what's inside", "The delivery driver's name", "The factory phone number", "The weather forecast"], correct: 0, feedback: "Price, size and what's inside." },
  { q: "What is clicking the “Add to Cart” button like?", options: ["Writing a letter", "Putting a toy in your shopping basket", "Opening a bank account", "Returning a package"], correct: 1, feedback: "Like a shopping basket." },
  { q: "What do you need to add during checkout so the store knows where to send the package?", options: ["Your favorite color", "Your address", "Your school name", "Your phone number"], correct: 1, feedback: "Your address." },
  { q: "What methods can you choose to pay when online shopping?", options: ["Coins and paper money only", "Credit card, gift card, etc.", "Trading cards", "Slime and ice cream"], correct: 1, feedback: "Credit card, gift card…" },
  { q: "Who finds the item from the shelf in the warehouse behind the scenes?", options: ["A teacher or a friend", "A warehouse robot or worker", "A delivery driver", "The president of the company"], correct: 1, feedback: "A robot or a worker." },
  { q: "How can the package travel to reach your home?", options: ["Through roads, planes, or ships", "By riding a bicycle only", "By walking across the street", "Through the internet cables"], correct: 0, feedback: "Roads, planes or ships." },
  { q: "What is rule number one for kids regarding online shopping?", options: ["Always shop online alone", "Always ask a grown-up for help", "Share your card info with friends", "Never wait for delivery"], correct: 1, feedback: "Ask a grown-up!" },
  { q: "Why should you check reviews before buying something online?", options: ["To make sure you're getting the right thing", "To find out who made the delivery truck", "To get free shipping instantly", "To change the price of the item"], correct: 0, feedback: "Reviews help you choose well." },
  { q: "What personal information should you never share without permission?", options: ["Your favorite movie", "Your address or card info", "Your favorite color", "Your pet's name"], correct: 1, feedback: "Address and card info are private." },
];
const ORDER_STEPS = [
  "🔎 Search for what you want",
  "👆 Click the item: price, size, what's inside",
  "⭐ Check the reviews",
  "🛒 Add to cart",
  "📦 Checkout: write your address",
  "💳 Pay (with a grown-up's help)",
  "🤖 A robot or worker finds it in the warehouse",
  "🚚 It travels by road, plane or ship",
  "🏠 The package arrives at your home!",
];
const ORDER_LABELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
function OnlineOrderGame({ onSave, onExit }) {
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Order delivered! 📦" subtitle="You know the journey of an online order." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Truck size={22} strokeWidth={2.1} />} title="G5 · How an online order travels" subtitle="Put the 9 steps of an online purchase in order." onExit={onExit}>
      <OrderGame items={ORDER_STEPS} labels={ORDER_LABELS} onDone={(r) => finish(Math.max(10, 28 - r.errors * 2), r)} />
    </ActShell>
  );
}

/* Constructor de tienda online (Parte 01 de la tienda global) */
const PRODUCT_EMOJIS = ["📓", "🎒", "🧁", "🍎", "🧃", "👕", "🧸", "🎨", "♻️", "📚", "🐶", "💡", "🎧", "⚽", "🧩", "🕯️", "🌱", "🎁", "🧴", "✏️", "📱", "🛹", "🍫", "☕"];
const blankProduct = () => ({ e: "🎁", name: "", price: "", desc: "", type: "product" });
function StoreBuilder({ company, existing, onSave, onExit }) {
  const hasBrand = !!company.brand?.icon && company.name !== "My Company";
  const [brand, setBrand] = useState(existing?.brand || (hasBrand ? null : { ...DEFAULT_BRAND, name: company.name !== "My Company" ? company.name : "" }));
  const [products, setProducts] = useState(() => existing?.products || [
    { ...blankProduct(), name: company.idea ? company.idea.split(/[.,]/)[0].slice(0, 40) : "", price: company.finance?.price ? String(company.finance.price) : "", type: company.type || "product", desc: company.value || "" },
    blankProduct(), blankProduct(),
  ]);
  const [tagline, setTagline] = useState(existing?.tagline || company.slogan || "");
  const [open, setOpen] = useState(0);
  const [st, finish] = useFinish(onSave);
  const b = brand || company.brand;
  const storeName = (brand ? brand.name : company.name) || "";
  const setP = (i, k, v) => setProducts(products.map((p, j) => (j === i ? { ...p, [k]: v } : p)));
  const pOk = (p) => p.name.trim() && num(p.price) > 0 && countWords(p.desc) >= 4;
  const okCount = products.filter(pOk).length;
  const ready = storeName.trim() && okCount >= 3 && countWords(tagline) >= 2;
  if (st.done) return <Reward title="Your store is open! 🛍️" subtitle="Part 01 · Store & products saved." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Store size={22} strokeWidth={2.1} />} title="Part 01 · Open my online store" subtitle="Your company from Period 3 goes online! Add 3 products or services." onExit={onExit}>
      {hasBrand && !brand ? (
        <div className="p1-banner good"><LogoMark brand={company.brand} size={42} row /> <span>We brought your brand from Period 3!</span></div>
      ) : (
        <div className="start-block">
          <h3><Palette size={18} /> My store brand</h3>
          {!hasBrand && <p className="start-tip">We couldn't find your Period 3 company, so create a quick brand here.</p>}
          <input className="start-input p3-gap" value={brand?.name || ""} maxLength={22} onChange={(e) => setBrand({ ...b, name: e.target.value })} placeholder="Store name" />
          <div className="p3-icons">{LOGO_ICONS.slice(0, 16).map((ic) => <button key={ic} type="button" className={b.icon === ic ? "on" : ""} onClick={() => setBrand({ ...b, icon: ic })}>{ic}</button>)}</div>
          <div className="p3-palettes p2-mt">{PALETTES.map((p) => <button key={p.id} type="button" className={b.palette === p.id ? "on" : ""} onClick={() => setBrand({ ...b, palette: p.id })}><span>{p.c.map((c) => <i key={c} style={{ background: c }} />)}</span><small>{p.name}</small></button>)}</div>
        </div>
      )}
      <div className="start-block">
        <h3><Sparkles size={18} /> Store tagline</h3>
        <input className="start-input" value={tagline} maxLength={50} onChange={(e) => setTagline(e.target.value)} placeholder="Smart kits for smart students" />
      </div>
      <div className="start-block">
        <h3><ShoppingCart size={18} /> My products or services <span className={`p2-count ${okCount >= 3 ? "ok" : ""}`}>{okCount}/3</span></h3>
        <div className="p4-ptabs">{products.map((p, i) => <button key={i} type="button" className={`${open === i ? "on" : ""} ${pOk(p) ? "ok" : ""}`} onClick={() => setOpen(i)}>{p.e} {p.name || `Product ${i + 1}`} {pOk(p) && "✓"}</button>)}</div>
        {products.map((p, i) => open === i && (
          <div key={i} className="p4-pedit">
            <div className="p4-emojis">{PRODUCT_EMOJIS.map((e) => <button key={e} type="button" className={p.e === e ? "on" : ""} onClick={() => setP(i, "e", e)}>{e}</button>)}</div>
            <div className="p2-grid2">
              <label className="p3-lbl">Name<input className="start-input" value={p.name} maxLength={40} onChange={(e) => setP(i, "name", e.target.value)} placeholder="Recycled notebook" /></label>
              <label className="p3-lbl">Price (COP)<MoneyInput value={p.price} onChange={(v) => setP(i, "price", v)} placeholder="8000" /></label>
            </div>
            <div className="p3-toggle2 p3-gap">
              {[["product", "📦 Product"], ["service", "🤝 Service"]].map(([id, l]) => <button key={id} type="button" className={p.type === id ? "on" : ""} onClick={() => setP(i, "type", id)}><b>{l}</b></button>)}
            </div>
            <label className="p3-lbl">Short description (4+ words)<input className="start-input" value={p.desc} maxLength={90} onChange={(e) => setP(i, "desc", e.target.value)} placeholder="A colorful notebook made with recycled paper." /></label>
          </div>
        ))}
      </div>
      <p className="terms-label">👀 Live preview</p>
      <GlobalStore store={{ brand: b, name: storeName, tagline, products: products.filter(pOk).map((p, i) => ({ ...p, id: "p" + i, price: num(p.price) })) }} compact />
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(40, { brand, tagline, products: products.map((p, i) => ({ ...p, id: "p" + i, price: num(p.price) })) })}>Open my store <span className="coin-tag"><Coins size={15} /> +40</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 35–36 · DIGITAL WALLETS & SAFE SHOPPING
   ===================================================================== */
const READ_W35 = [
  { h: "Lina Checks Her App" },
  { p: "Lina is thirteen years old. She likes colorful notebooks, bubble tea, stickers, and video games. She receives COP $100,000 for her weekly expenses. She keeps her money in a digital wallet and uses a banking app to check her balance." },
  { p: "On Monday morning, Lina opens her app. Her balance is COP $100,000. She wants to buy a new notebook for $12,000, a pack of stickers for $5,000, and a bubble tea for $10,000." },
  { node: <div className="p3-formula"><span><small>Notebook</small><b>$12,000</b></span><i>+</i><span><small>Stickers</small><b>$5,000</b></span><i>+</i><span><small>Bubble tea</small><b>$10,000</b></span><i>=</i><span className="win"><small>Total</small><b>$27,000</b></span></div> },
  { p: "After these purchases, Lina will have $73,000 left. She is happy, but she remembers that she also wants to save money for new headphones that cost $80,000." },
  { p: "On Tuesday, Lina sees a special offer online: a cute backpack for $45,000. She really wants it, but she does not need a new backpack because her old one is still in good condition. If she buys it, she will have only $28,000 left. She decides to wait and think." },
  { say: "She asks herself, “Do I need it, or do I just want it?”" },
  { p: "On Wednesday, Lina receives a message: “Congratulations! You won $200,000! Click here and enter your banking password to receive your prize.” Lina thinks this message is suspicious. She does not click the link or share her password. She deletes the message and checks her account using the official app." },
  { p: "On Friday, Lina reviews her transactions. She sees what she bought and how much she spent. She decides to save $20,000 and keep some money for unexpected expenses." },
  { list: ["Check your balance before buying.", "Think before spending.", "Protect your personal information."] },
  { box: "A digital wallet is useful, but it cannot make financial decisions for you. You are in control of your money!" },
];
const GLOSS_W35 = {
  "balance": "Saldo — el dinero que tienes en tu cuenta.",
  "transactions": "Movimientos — compras, pagos, transferencias.",
  "expenses": "Gastos.",
  "digital wallet": "Billetera digital.",
  "suspicious": "Sospechoso — puede ser peligroso o deshonesto.",
  "save": "Ahorrar — guardar para después.",
};
const Q_W35 = [
  { q: "How much money does Lina have after Monday?", options: ["$73,000", "$27,000", "$100,000"], correct: 0, feedback: "100,000 − 27,000 = 73,000." },
  { q: "Why doesn't Lina buy the backpack?", options: ["She wants it, but she doesn't need it.", "The store is closed.", "She doesn't like backpacks."], correct: 0, feedback: "Need or want?" },
  { q: "What does Lina do with the prize message?", options: ["She deletes it and checks the official app.", "She sends her password.", "She clicks the link."], correct: 0, feedback: "Suspicious = don't click!" },
  { q: "What is a transaction?", options: ["An action with money, like a payment.", "A type of phone.", "A password."], correct: 0, feedback: "Payments, purchases, transfers." },
  { q: "What is Lina's big lesson?", options: ["You are in control of your money.", "The app decides for you.", "Spend all your money fast."], correct: 0, feedback: "The wallet doesn't decide — you do!" },
];

const SHOP_ITEMS = [
  { id: "notebook", e: "📓", n: "School notebook", p: 12000, k: "need" },
  { id: "pencils", e: "✏️", n: "Pencil set", p: 8000, k: "need" },
  { id: "lunch", e: "🥪", n: "Healthy lunch", p: 9000, k: "need" },
  { id: "bus", e: "🚌", n: "Bus card top-up", p: 10000, k: "need" },
  { id: "stickers", e: "🎨", n: "Sticker pack", p: 5000, k: "want" },
  { id: "tea", e: "🧋", n: "Bubble tea", p: 10000, k: "want" },
  { id: "game", e: "🎮", n: "Game coins", p: 15000, k: "want" },
  { id: "backpack", e: "🎒", n: "Cool backpack", p: 45000, k: "want" },
  { id: "headphones", e: "🎧", n: "Gaming headphones", p: 80000, k: "want" },
];
const SURPRISES = [
  { id: "calc", e: "🧮", t: "School emergency", s: "Your calculator breaks. You need it for your math test. A new one costs $18,000.", o: [
    { l: "Buy a new calculator", cost: 18000, good: true, fb: "Good! It's a real need. Your savings protected you." },
    { l: "Don't buy it and fail the test", cost: 0, good: false, fb: "That's a real need. Sometimes spending is the right decision." }] },
  { id: "offer", e: "⏰", t: "Limited-time offer", s: "Your favorite drink costs $15,000. The offer ends in five minutes!", o: [
    { l: "Buy it now — hurry!", cost: 15000, good: false, fb: "Time pressure is a trick to make you buy fast." },
    { l: "Wait. I don't need it.", cost: 0, good: true, fb: "Smart! A countdown is not a good reason to buy." }] },
  { id: "prize", e: "🎁", t: "Suspicious payment", s: "A message says you must pay $5,000 to unlock a $200,000 prize.", o: [
    { l: "Pay the $5,000", cost: 5000, good: false, fb: "That's a scam! Real prizes don't ask you to pay." },
    { l: "Don't pay. Check the official app and tell an adult.", cost: 0, good: true, fb: "Exactly! Verify first, never pay to 'unlock' a prize." }] },
  { id: "gift", e: "🎂", t: "Friend's birthday", s: "It's your best friend's birthday tomorrow. A gift costs $10,000.", o: [
    { l: "Buy a small gift", cost: 10000, good: true, fb: "Sharing is part of a good budget, if you planned it." },
    { l: "Make a handmade card", cost: 0, good: true, fb: "Creative and free! Great choice." }] },
  { id: "double", e: "🔁", t: "Strange transaction", s: "Your app shows a $7,000 payment you don't remember.", o: [
    { l: "Ignore it", cost: 7000, good: false, fb: "Always check! Report strange transactions." },
    { l: "Check the history and report it with an adult", cost: 0, good: true, fb: "Exactly — check and report through the official channel." }] },
];
function WalletChallenge({ existing, onSave, onExit }) {
  const [stage, setStage] = useState("shop");
  const [cart, setCart] = useState([]);
  const [tab, setTab] = useState("shop");
  const [sawHistory, setSawHistory] = useState(false);
  const [msg, setMsg] = useState("");
  const cards = useMemo(() => sample(SURPRISES, 3), []);
  const [ci, setCi] = useState(0);
  const [cpick, setCpick] = useState(null);
  const [cardLog, setCardLog] = useState([]);
  const [skip, setSkip] = useState(existing?.skip || "");
  const [st, finish] = useFinish(onSave);
  const tx = [...cart.map((id, k) => { const it = SHOP_ITEMS.find((x) => x.id === id); return { k, e: it.e, n: it.n, amt: it.p, kind: it.k }; }),
    ...cardLog.filter((c) => c.cost > 0).map((c, k) => ({ k: "c" + k, e: c.e, n: c.t, amt: c.cost, kind: "surprise" }))];
  const spent = tx.reduce((a, t) => a + t.amt, 0);
  const bal = WALLET_START - spent;
  const buy = (it) => { if (it.p > bal) { setMsg(`❌ Insufficient balance! You have ${cop(bal)}.`); return; } setCart([...cart, it.id]); setMsg(`✅ Payment approved: ${it.n} −${cop(it.p)}`); };
  const unbuy = (k) => setCart(cart.filter((_, j) => j !== k));
  const needs = cart.filter((id) => SHOP_ITEMS.find((x) => x.id === id).k === "need").length;
  const wants = cart.length - needs;
  const missions = [
    { t: "Buy at least one thing you NEED", ok: needs >= 1 },
    { t: "Buy one thing you WANT", ok: wants >= 1 },
    { t: `Keep at least ${cop(20000)} in your wallet`, ok: bal >= 20000 },
    { t: "Open your transaction history", ok: sawHistory },
  ];
  const mOk = missions.every((m) => m.ok);
  const card = cards[ci];
  const choose = (o) => {
    if (cpick) return;
    const cost = o.cost > bal ? 0 : o.cost;
    setCpick(o); setCardLog([...cardLog, { e: card.e, t: card.t, choice: o.l, cost, good: o.good, broke: o.cost > bal }]);
  };
  const goodCards = cardLog.filter((c) => c.good).length;
  const coins = 25 + goodCards * 5 + (bal >= 20000 ? 5 : 0);
  if (st.done) return <Reward title="Wallet master! 📱" subtitle={`You finished with ${cop(bal)} in your wallet.`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;

  const phone = (
    <div className="p4-phone">
      <div className="p4-phone-top"><span>9:41</span><b>MyWallet</b><span>📶 🔋</span></div>
      <div className="p4-balance"><small>Available balance</small><b className={bal < 20000 ? "low" : ""}>{cop(bal)}</b><div className="p3-mini-bar"><i style={{ width: `${(bal / WALLET_START) * 100}%` }} /></div></div>
      {stage === "shop" && (
        <div className="p4-phone-tabs">
          <button type="button" className={tab === "shop" ? "on" : ""} onClick={() => setTab("shop")}>🛍️ Shop</button>
          <button type="button" className={tab === "hist" ? "on" : ""} onClick={() => { setTab("hist"); setSawHistory(true); }}>🧾 History</button>
        </div>
      )}
      {(tab === "hist" || stage !== "shop") && (
        <div className="p4-tx">
          {tx.length === 0 && <p className="start-tip">No transactions yet.</p>}
          {tx.map((t, i) => (
            <div key={i} className={`p4-tx-row ${t.kind}`}>
              <em>{t.e}</em><span>{t.n}<small>{t.kind === "surprise" ? "Surprise" : t.kind === "need" ? "Need" : "Want"}</small></span><b>−{cop(t.amt)}</b>
              {stage === "shop" && t.kind !== "surprise" && <button type="button" onClick={() => unbuy(t.k)} aria-label="Return"><X size={14} /></button>}
            </div>
          ))}
          <div className="p4-tx-total"><span>Total spent</span><b>{cop(spent)}</b></div>
        </div>
      )}
    </div>
  );

  return (
    <ActShell icon={<Wallet size={22} strokeWidth={2.1} />} title="Digital Wallet Challenge 📱" subtitle="You have $100,000 in your app. Shop smart — not the most, the BEST!" onExit={onExit}>
      <div className="p3-stepper">{["Shop", "Surprise!", "Report"].map((s, k) => <span key={s} className={["shop", "surprise", "report"].indexOf(stage) >= k ? "on" : ""}><b>{k + 1}</b>{s}</span>)}</div>
      <div className="p4-wallet">
        {phone}
        <div className="p4-wallet-main">
          {stage === "shop" && (
            <>
              <div className="p4-missions">{missions.map((m) => <span key={m.t} className={m.ok ? "on" : ""}>{m.ok ? "✅" : "⬜"} {m.t}</span>)}</div>
              {msg && <div className={`p1-banner ${msg.startsWith("✅") ? "good" : "bad"}`}>{msg}</div>}
              <div className="p4-items">
                {SHOP_ITEMS.map((it) => (
                  <div key={it.id} className="p4-item">
                    <em>{it.e}</em><b>{it.n}</b><span className={`p4-tag ${it.k}`}>{it.k === "need" ? "Need" : "Want"}</span>
                    <strong>{cop(it.p)}</strong>
                    <button type="button" className="s1-btn primary" onClick={() => buy(it)}>Buy</button>
                  </div>
                ))}
              </div>
              <div className="start-foot"><button className="s1-btn primary big" disabled={!mOk} onClick={() => setStage("surprise")}>Next round: Surprise! <ChevronRight size={18} /></button></div>
            </>
          )}
          {stage === "surprise" && card && (
            <div className="start-block">
              <div className="p2-hud"><span>Card <b>{ci + 1}/3</b></span><span>Smart decisions <b>{goodCards}</b></span></div>
              <div className="p3-oops hot"><em>{card.e}</em><small>SURPRISE CARD · {card.t.toUpperCase()}</small><p>{card.s}</p></div>
              <div className="quiz-options">
                {card.o.map((o, k) => (
                  <button key={k} type="button" disabled={!!cpick} onClick={() => choose(o)} className={`quiz-opt ${cpick === o ? (o.good ? "correct" : "wrong") : ""}`}>
                    <span className="opt-key">{"AB"[k]}</span><span className="opt-text">{o.l} {o.cost > 0 && <b>(−{cop(o.cost)})</b>}</span>
                  </button>
                ))}
              </div>
              {cpick && <div className={`p1-banner ${cpick.good ? "good" : "bad"}`}>{cardLog[cardLog.length - 1]?.broke ? "You don't have enough money for that! " : ""}{cpick.fb}</div>}
              {cpick && <div className="start-foot"><button className="s1-btn primary big" onClick={() => { if (ci < 2) { setCi(ci + 1); setCpick(null); } else setStage("report"); }}>{ci < 2 ? "Next card" : "See my report"} <ChevronRight size={18} /></button></div>}
            </div>
          )}
          {stage === "report" && (
            <div className="p4-report">
              <small>DIGITAL WALLET REPORT</small>
              <div className="p3-fin">
                <div><small>Start</small><b>{cop(WALLET_START)}</b></div>
                <div className="loss"><small>Spent</small><b>{cop(spent)}</b></div>
                <div className={bal >= 20000 ? "win big" : "loss big"}><small>Final balance</small><b>{cop(bal)}</b></div>
              </div>
              <p>🛍️ Needs: <b>{needs}</b> · Wants: <b>{wants}</b> · Smart surprise decisions: <b>{goodCards}/3</b></p>
              <label className="p3-lbl">One thing I decided NOT to buy, and why:
                <input className="start-input" value={skip} onChange={(e) => setSkip(e.target.value)} placeholder="I didn't buy the backpack because I don't need it." />
              </label>
              <div className="start-foot"><button className="s1-btn primary big" disabled={countWords(skip) < 6} onClick={() => finish(coins, { bought: cart, cards: cardLog, spent, balance: bal, skip })}>Save my report <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
            </div>
          )}
        </div>
      </div>
    </ActShell>
  );
}

const TxTable = ({ rows, start = 100000 }) => (
  <div className="p4-txtable">
    <div className="p4-txtable-head"><span>🧾 Lina's transaction history</span><small>Starting balance: {cop(start)}</small></div>
    {rows.map((r, i) => <div key={i} className={r.flag ? "flag" : ""}><span>{r.e} {r.n}</span><small>{r.d}</small><b>−{cop(r.a)}</b></div>)}
  </div>
);
const TX1 = [{ e: "📓", n: "Notebook", d: "Mon 8:10", a: 12000 }, { e: "🎨", n: "Stickers", d: "Mon 8:12", a: 5000 }, { e: "🧋", n: "Bubble tea", d: "Mon 3:30", a: 10000 }, { e: "🍿", n: "Popcorn", d: "Tue 5:00", a: 8000 }];
const TX2 = [{ e: "🧋", n: "Bubble tea", d: "Wed 3:30", a: 10000 }, { e: "🧋", n: "Bubble tea", d: "Wed 3:30", a: 10000 }, { e: "🚌", n: "Bus card", d: "Thu 7:00", a: 6000 }, { e: "🎮", n: "GameZone", d: "Thu 11:48 pm", a: 15000 }];
const DETECTIVE_ROUNDS = [
  { tag: "MISSION 1", q: "How much did Lina spend in total?", visual: <TxTable rows={TX1} />, answer: 35000, money: true, hint: "12,000 + 5,000 + 10,000 + 8,000", explain: "$35,000 in total." },
  { tag: "MISSION 2", q: "How much money does Lina have left?", visual: <TxTable rows={TX1} />, answer: 65000, money: true, hint: "100,000 − 35,000", explain: "$65,000 left." },
  { tag: "MISSION 3", q: "What was her most expensive purchase?", visual: <TxTable rows={TX1} />, options: ["📓 Notebook", "🧋 Bubble tea", "🍿 Popcorn"], correct: 0, explain: "The notebook: $12,000." },
  { tag: "MISSION 4 · NEW WEEK", q: "Look carefully. Which transaction is DUPLICATED (charged twice)?", visual: <TxTable rows={TX2} />, options: ["🧋 Bubble tea", "🚌 Bus card", "🎮 GameZone"], correct: 0, explain: "Two bubble teas at the same minute — it may be a double charge." },
  { tag: "MISSION 5", q: "Lina never played GameZone. What should she do?", visual: <TxTable rows={TX2} />, options: ["Tell a trusted adult and report it in the official app.", "Pay it again.", "Ignore it."], correct: 0, explain: "Strange transactions are reported — through official channels." },
  { tag: "MISSION 6", q: "Lina had $65,000. She saves $20,000. How much can she still spend?", answer: 45000, money: true, hint: "65,000 − 20,000", explain: "$45,000 for the rest of the week." },
];

/* Scam Detective: 1) lee el mensaje · 2) ¿scam o seguro? · 3) encuentra las señales · 4) ¿qué haces? */
const SCAMS = [
  { from: "+57 300 000 0000", time: "9:41 am",
    parts: ["URGENT!", "Your bank account will close today.", "Click this link: bank-secure.xyz", "and send us your PIN", "to protect your money!"],
    flags: { 0: "It creates PRESSURE so you act fast.", 1: "A scary message to make you panic.", 2: "A STRANGE LINK that is not the official bank page.", 3: "A bank NEVER asks for your PIN." }, scam: true,
    o: ["Click the link fast.", "Don't click. Don't share. Check the official bank app.", "Send only half of the PIN."], ok: 1 },
  { from: "PRIZES 🎉", time: "11:02 am",
    parts: ["Congratulations!", "You won $200,000!", "Click here", "and enter your banking password", "to receive your prize."],
    flags: { 1: "A PRIZE you never played for.", 2: "A link to click.", 3: "It asks for your PASSWORD." }, scam: true,
    o: ["Enter the password — it's a prize!", "Share it with my friends.", "Delete it and tell a trusted adult."], ok: 2 },
  { from: "Unknown number", time: "6:15 pm",
    parts: ["Hi, it's your cousin.", "I lost my phone.", "Please send me $50,000 now", "to this new number.", "Don't tell anyone!"],
    flags: { 2: "It asks for MONEY fast.", 3: "A NEW number you don't know.", 4: "It asks you to keep a SECRET." }, scam: true,
    o: ["Call my cousin's real number or ask a parent first.", "Send the money quickly.", "Keep it a secret."], ok: 0 },
  { from: "🏦 Official banking app", time: "8:10 am",
    parts: ["You paid $12,000 at Papelería Sol.", "Date: Monday 8:10 am.", "If you don't recognize it, report it in this app."],
    flags: {}, scam: false,
    o: ["This is a normal notification. I check if I made that payment.", "It's a scam, I must delete my account.", "Reply with my PIN."], ok: 0 },
];
function ScamDetective({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [step, setStep] = useState("read");
  const [verdict, setVerdict] = useState(null);
  const [marked, setMarked] = useState([]);
  const [checked, setChecked] = useState(false);
  const [pick, setPick] = useState(null);
  const [pts, setPts] = useState(0);
  const [st, finish] = useFinish(onSave);
  const m = SCAMS[i];
  const flagIdx = Object.keys(m.flags).map(Number);
  const full = m.parts.join(" ");
  const steps = m.scam ? ["Read", "Scam or safe?", "Red flags", "What do you do?"] : ["Read", "Scam or safe?", "What do you do?"];
  const stepKey = m.scam ? ["read", "verdict", "flags", "action"] : ["read", "verdict", "action"];
  const sIdx = stepKey.indexOf(step);

  const sayVerdict = (isScam) => { setVerdict(isScam); if (isScam === m.scam) setPts((p) => p + 2); };
  const tog = (k) => { if (!checked) setMarked((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k])); };
  const checkFlags = () => { setChecked(true); const right = marked.filter((k) => flagIdx.includes(k)).length; setPts((p) => p + right); };
  const answer = (k) => { setPick(k); if (k === m.ok) setPts((p) => p + 2); };
  const next = () => {
    if (i < SCAMS.length - 1) { setI(i + 1); setStep("read"); setVerdict(null); setMarked([]); setChecked(false); setPick(null); }
    else finish(10 + pts * 2, { points: pts });
  };
  if (st.done) return <Reward title="Scam detective! 🕵️" subtitle={`You earned ${pts} detective points.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<ShieldAlert size={22} strokeWidth={2.1} />} title="G10 · Scam Detective 🕵️" subtitle="Read each message on the phone. Is it a scam? Find the red flags and decide what to do." onExit={onExit}>
      {i === 0 && step === "read" && (
        <div className="p4-def"><b>🚩 What is a scam?</b><p>A <b>scam</b> is a trick to steal your money or your personal information. Scammers create <b>pressure</b> (“URGENT!”), promise <b>prizes</b>, send <b>strange links</b>, or ask for your <b>PIN or password</b>. These are called <b>red flags</b> 🚩.</p></div>
      )}
      <div className="p2-hud"><span>Message <b>{i + 1}/{SCAMS.length}</b></span><span>🕵️ Points <b>{pts}</b></span></div>
      <div className="p3-stepper">{steps.map((s, k) => <span key={s} className={k <= sIdx ? "on" : ""}><b>{k + 1}</b>{s}</span>)}</div>

      <div className="p4-scam-phone">
        <div className="p4-scam-head"><span>💬 {m.from}</span><small>{m.time}</small></div>
        <div className="p4-scam-bubble">{full}</div>
      </div>

      {step === "read" && (
        <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStep("verdict")}>I read the message <ChevronRight size={18} /></button></div>
      )}

      {step === "verdict" && (
        <div className="start-block">
          <h3><span className="step-n">2</span> Is this message a SCAM or SAFE?</h3>
          <div className="p4-verdict">
            <button type="button" disabled={verdict !== null} className={verdict === true ? (m.scam ? "ok" : "no") : ""} onClick={() => sayVerdict(true)}>🚨<b>SCAM</b><small>It's a trick</small></button>
            <button type="button" disabled={verdict !== null} className={verdict === false ? (!m.scam ? "ok" : "no") : ""} onClick={() => sayVerdict(false)}>✅<b>SAFE</b><small>It's a normal message</small></button>
          </div>
          {verdict !== null && (
            <div className={`p1-banner ${verdict === m.scam ? "good" : "bad"}`}>
              {verdict === m.scam ? "Correct! " : "Not quite. "}
              {m.scam ? "This message IS a scam. Now let's find its red flags." : "This message is SAFE: it comes from the official app and it doesn't ask for your PIN, password or money."}
            </div>
          )}
          {verdict !== null && <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStep(m.scam ? "flags" : "action")}>Continue <ChevronRight size={18} /></button></div>}
        </div>
      )}

      {step === "flags" && (
        <div className="start-block">
          <h3><span className="step-n">3</span> Tap the parts that are RED FLAGS 🚩</h3>
          <p className="start-tip">💡 This message has <b>{flagIdx.length}</b> red flags. Tap a sentence to mark it. Tap again to remove it.</p>
          <div className="p4-flaglist">
            {m.parts.map((t, k) => {
              const isFlag = flagIdx.includes(k), on = marked.includes(k);
              const res = !checked ? "" : isFlag && on ? "hit" : isFlag ? "miss" : on ? "bad" : "safe";
              return (
                <button key={k} type="button" className={`${on ? "on" : ""} ${res}`} onClick={() => tog(k)} disabled={checked}>
                  <span className="p4-flag-ico">{checked ? (isFlag ? "🚩" : "✔️") : on ? "🚩" : "⬜"}</span>
                  <span className="p4-flag-txt">“{t}”{checked && isFlag && <small>{m.flags[k]}</small>}{checked && !isFlag && on && <small>This part is not dangerous.</small>}</span>
                </button>
              );
            })}
          </div>
          {!checked
            ? <div className="start-foot"><button className="s1-btn primary big" disabled={marked.length === 0} onClick={checkFlags}>Check my red flags <Search size={17} /></button></div>
            : <>
                <div className="p1-banner good">You found <b>{marked.filter((k) => flagIdx.includes(k)).length}/{flagIdx.length}</b> red flags. 🟨 Yellow = red flags you missed. Read why each one is dangerous.</div>
                <div className="start-foot"><button className="s1-btn primary big" onClick={() => setStep("action")}>Continue <ChevronRight size={18} /></button></div>
              </>}
        </div>
      )}

      {step === "action" && (
        <div className="start-block">
          <h3><span className="step-n">{m.scam ? 4 : 3}</span> What should you do?</h3>
          <ChoiceCard options={m.o} good={[m.ok]} picked={pick} onAnswer={answer} feedback={pick === null ? null : pick === m.ok ? "Exactly! That's the safe answer." : `The safest answer is: “${m.o[m.ok]}”`} />
          {pick !== null && <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{i < SCAMS.length - 1 ? "Next message" : "Finish"} <ChevronRight size={18} /></button></div>}
        </div>
      )}
    </ActShell>
  );
}

const LOCKS = [
  { q: "The app asks you to create a password. Which is the safest choice?", o: ["123456", "My name and birthday", "A long, unique password like Blue-Taco-Rocket-27!"], ok: 2, clue: "🔑 Clue 1: long + unique = strong." },
  { q: "A classmate asks for your PIN to “help” you pay faster.", o: ["Give it — they are my friend.", "Never share it. My PIN is only mine.", "Write it on the phone case."], ok: 1, clue: "🔑 Clue 2: a PIN is a secret. Always." },
  { q: "Where should you check your balance?", o: ["In the official banking app.", "In a link from a message.", "On a free app from an unknown website."], ok: 0, clue: "🔑 Clue 3: official app only." },
  { q: "You lose your phone. What do you do first?", o: ["Wait a week.", "Buy a new phone.", "Tell an adult and block the wallet with the bank."], ok: 2, clue: "🔑 Clue 4: act fast and block it." },
];
function EscapeRoom({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [bad, setBad] = useState(null);
  const [tries, setTries] = useState(0);
  const [open, setOpen] = useState(false);
  const [st, finish] = useFinish(onSave);
  const L = LOCKS[i];
  const pick = (k) => {
    if (open) return;
    if (k === L.ok) setOpen(true);
    else { setBad(k); setTries((t) => t + 1); setTimeout(() => setBad(null), 600); }
  };
  const next = () => { if (i < LOCKS.length - 1) { setI(i + 1); setOpen(false); } else finish(Math.max(12, 30 - tries * 3), { tries }); };
  if (st.done) return <Reward title="You escaped! 🔓" subtitle="Your digital wallet is safe." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<KeyRound size={22} strokeWidth={2.1} />} title="Security Escape Room 🔐" subtitle="Open 4 locks to protect the digital wallet." onExit={onExit}>
      <div className="p4-locks">{LOCKS.map((_, k) => <span key={k} className={k < i || (k === i && open) ? "on" : k === i ? "cur" : ""}>{k < i || (k === i && open) ? "🔓" : "🔒"}</span>)}</div>
      <div className={`p4-vault ${open ? "open" : ""} ${bad !== null ? "p1-shake" : ""}`}>
        <small>LOCK {i + 1} / {LOCKS.length}</small>
        <p>{L.q}</p>
      </div>
      <div className="quiz-options">
        {L.o.map((o, k) => <button key={k} type="button" disabled={open} onClick={() => pick(k)} className={`quiz-opt ${open && k === L.ok ? "correct" : ""} ${bad === k ? "wrong" : ""}`}><span className="opt-key">{"ABC"[k]}</span><span className="opt-text">{o}</span></button>)}
      </div>
      {open && <div className="p1-banner good">{L.clue}</div>}
      {open && <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{i < LOCKS.length - 1 ? "Next lock" : "Escape!"} <ChevronRight size={18} /></button></div>}
    </ActShell>
  );
}

/* Parte 02: Safe Shop badge (3 reglas + métodos de pago de MI tienda) */
const RULE_CHIPS_W35 = ["Always check your balance before buying.", "Never share your PIN or password.", "Check your transactions regularly.", "Use the official banking app.", "Think before you buy.", "Save some money for emergencies.", "Ask a trusted adult if a transaction looks suspicious."];
const STORE_PAY = [{ id: "wallet", e: "📱", l: "Digital wallet" }, { id: "debit", e: "💳", l: "Debit card" }, { id: "qr", e: "🔳", l: "QR code" }, { id: "cash", e: "💵", l: "Cash on delivery" }];
function SafeShopRules({ store, existing, onSave, onExit }) {
  const [rules, setRules] = useState(existing?.rules || ["", "", ""]);
  const [because, setBecause] = useState(existing?.because || "");
  const [pays, setPays] = useState(existing?.payments || []);
  const [st, finish] = useFinish(onSave);
  const addChip = (c) => { const k = rules.findIndex((r) => !r.trim()); if (k >= 0 && !rules.includes(c)) setRules(rules.map((r, j) => (j === k ? c : r))); };
  const ready = rules.every((r) => countWords(r) >= 4) && countWords(because) >= 4 && pays.length >= 2;
  if (st.done) return <Reward title="Safe Shop badge unlocked! 🛡️" subtitle="Part 02 · Your store is safe for customers." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<ShieldCheck size={22} strokeWidth={2.1} />} title="Part 02 · My 3 Rules for a Smart Digital Wallet" subtitle="Your rules become the SAFE SHOP badge of your online store." onExit={onExit}>
      <div className="start-block">
        <h3><span className="step-n">1</span> My 3 rules</h3>
        <div className="p1-starters">{RULE_CHIPS_W35.map((c) => <button key={c} type="button" className={`p1-chip ${rules.includes(c) ? "on" : ""}`} onClick={() => addChip(c)}>{c}</button>)}</div>
        {rules.map((r, k) => (
          <div key={k} className="p3-person"><span>Rule {k + 1}</span><input className="start-input" value={r} onChange={(e) => setRules(rules.map((x, j) => (j === k ? e.target.value : x)))} placeholder="Always / Never / Remember to…" />{r && <button type="button" className="p1-chip" onClick={() => setRules(rules.map((x, j) => (j === k ? "" : x)))}>✕</button>}</div>
        ))}
        <h3 className="p2-mt"><span className="step-n">2</span> Why is one rule important?</h3>
        <div className="p3-sentence edit"><span>{rules.find((r) => r.trim()) ? rules.find((r) => r.trim()).replace(/\.$/, "") : "My rule"} because</span><input className="start-input" value={because} onChange={(e) => setBecause(e.target.value)} placeholder="it helps me control my spending." /></div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">3</span> How can customers pay in MY store? (2+)</h3>
        <div className="p4-paygrid">{STORE_PAY.map((p) => <button key={p.id} type="button" className={pays.includes(p.id) ? "ok" : ""} onClick={() => setPays((a) => (a.includes(p.id) ? a.filter((x) => x !== p.id) : [...a, p.id]))}><em>{p.e}</em><b>{p.l}</b></button>)}</div>
      </div>
      <SafeBadge rules={rules} payments={pays} brand={store.brand} />
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { rules, because, payments: pays })}>Save my badge <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}
function SafeBadge({ rules, payments, brand }) {
  const pal = palOf(brand?.palette).c;
  return (
    <div className="p4-badge" style={{ "--c0": pal[0], "--c1": pal[1] }}>
      <div className="p4-badge-seal"><ShieldCheck size={30} /><b>SAFE SHOP</b></div>
      <div>
        <small>MY 3 RULES FOR A SMART DIGITAL WALLET</small>
        <ol>{rules.map((r, k) => <li key={k}>{r || "…"}</li>)}</ol>
        <div className="p4-badge-pay">{STORE_PAY.filter((p) => payments.includes(p.id)).map((p) => <span key={p.id}>{p.e} {p.l}</span>)}</div>
      </div>
    </div>
  );
}

/* =====================================================================
   CLASE 37 · GLOBAL MARKETS: WHERE DO THINGS COME FROM?
   ===================================================================== */
const READ_W37 = [
  { h: "The Journey of a Chocolate Bar" },
  { p: "Have you ever eaten a chocolate bar? It looks small and simple, but its journey can be long. Some chocolate bars travel thousands of kilometers before they arrive at a supermarket." },
  { sub: "🌱 1 · From the farm to the factory" },
  { p: "The journey begins with cocoa. Cocoa comes from cacao trees, which grow in hot and humid tropical regions. Countries such as Côte d'Ivoire and Ghana are important cocoa producers." },
  { p: "Farmers collect cacao pods and remove the cocoa beans. The beans are fermented, dried, and prepared for transport. Chocolate can also contain sugar, milk, and cocoa butter. Some of these ingredients may come from different countries." },
  { sub: "🏭 2 · Making the chocolate" },
  { p: "Next, the cocoa beans travel to a factory. Workers clean, roast, and process the beans. Machines help turn them into chocolate. Imagine that cocoa from Côte d'Ivoire travels to a factory in Belgium. The factory makes chocolate bars and puts them in wrappers." },
  { say: "This is an example of global trade: countries buy, sell, and exchange products and materials." },
  { sub: "🚢 3 · Traveling around the world" },
  { p: "Trucks, ships, trains, or planes transport products from factories to distribution centers and shops. Imagine that our chocolate bars travel by ship to Colombia. Then, trucks take them to a warehouse. Finally, a delivery truck brings them to a supermarket in Bogotá." },
  { p: "Every stage needs people, energy, transport, and money. Businesses must consider these costs when they decide how much to charge for a product." },
  { sub: "🌍 4 · Why does global trade matter?" },
  { p: "Global trade allows people to buy products that may not be available in their own country. However, transport can cause pollution, and businesses must think about working conditions, fair prices for farmers, and the environment." },
  { sub: "🤔 5 · Think like a global consumer" },
  { list: ["Where did its ingredients come from?", "Where was it made?", "How did it travel to my country?", "Who helped produce and deliver it?"] },
  { box: "A product can have ingredients from one country, be manufactured in another, and be sold in many different countries." },
];
const GLOSS_W37 = {
  "raw material": "Materia prima.",
  "global trade": "Comercio internacional.",
  "factory": "Fábrica.",
  "warehouse": "Bodega.",
  "consumer": "Consumidor.",
  "harvested": "Cosechado.",
};
const Q_W37 = [
  { q: "Where does cocoa grow?", options: ["In hot and humid tropical regions.", "In very cold countries.", "In factories."], correct: 0, feedback: "Tropical regions like Côte d'Ivoire and Ghana." },
  { q: "In the example, where is the chocolate bar made?", options: ["In a factory in Belgium.", "In a farm in Ghana.", "In a supermarket in Bogotá."], correct: 0, feedback: "Grown in one place, made in another." },
  { q: "What is global trade?", options: ["Countries buy, sell and exchange products.", "Only one country makes everything.", "A type of chocolate."], correct: 0, feedback: "The world is connected by trade." },
  { q: "Why does transport affect the price?", options: ["Every stage needs people, energy and money.", "Ships are free.", "It doesn't affect the price."], correct: 0, feedback: "Every stage costs money." },
];

const PASSPORT_STOPS = [
  { id: "ci", flag: "🇨🇮", name: "Côte d'Ivoire", task: "Collect the cocoa beans! Which one is the RAW MATERIAL?", o: ["🫘 Cocoa beans", "🍫 Chocolate bar", "📄 Wrapper"], ok: 0, learn: "A raw material is what a product is made FROM." },
  { id: "be", flag: "🇧🇪", name: "Belgium", task: "You visit a chocolate factory. What does it make from the beans?", o: ["🌳 Cacao trees", "🍫 A finished product: chocolate bars", "🚢 Ships"], ok: 1, learn: "Raw material → factory → finished product." },
  { id: "sea", flag: "🚢", name: "International shipping", task: "Belgium → Colombia. 10,000 chocolate bars. How do you send them?", o: ["🚢 Ship: cheap, slow, less pollution per bar", "✈️ Plane: very fast, very expensive, more pollution", "🚚 Truck: drive across the ocean"], ok: 0, learn: "Ships carry big loads across oceans at a low cost. A truck can't cross the ocean!" },
  { id: "co", flag: "🇨🇴", name: "Colombia", task: "The ship arrives in Cartagena. How does the chocolate reach the customer?", o: ["Port → warehouse → truck → supermarket → customer", "Port → customer's house directly by ship", "Port → factory in Belgium again"], ok: 0, learn: "Distribution center → shop → customer." },
];
const COUNTRY_MATCH = [
  { a: "🫘 Cocoa beans", b: "🇨🇮 Côte d'Ivoire" },
  { a: "☕ Coffee", b: "🇨🇴 Colombia" },
  { a: "🫒 Olive oil", b: "🇪🇸 Spain" },
  { a: "📱 Smartphones", b: "🇰🇷 South Korea" },
  { a: "🍫 Swiss chocolate", b: "🇨🇭 Switzerland" },
];
function WorldTour({ onSave, onExit }) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [stamps, setStamps] = useState([]);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState("tour");
  const [round, setRound] = useState(0);
  const [st, finish] = useFinish(onSave);
  const s = PASSPORT_STOPS[i];
  const answer = (k) => { setPick(k); if (k === s.ok) setScore((x) => x + 1); };
  const next = () => { setStamps([...stamps, s.id]); setPick(null); if (i < PASSPORT_STOPS.length - 1) setI(i + 1); else setStage("match"); };
  if (st.done) return <Reward title="World traveler! 🌍" subtitle="Your passport is full of stamps." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title="G9 · World Tour Passport 🛂" subtitle="Follow the chocolate around the world. Every stop gives you a stamp." onExit={onExit}>
      <div className="p4-passport">
        <div className="p4-passport-cover"><b>🌍 GLOBAL PASSPORT</b><small>FinFluent · Grade 6</small></div>
        <div className="p4-stamps">
          {PASSPORT_STOPS.map((x) => <span key={x.id} className={stamps.includes(x.id) ? "on" : ""}><em>{x.flag}</em><small>{x.name}</small></span>)}
          <span className={stage === "match" && round >= 0 && stamps.length === 4 ? "" : ""}><em>{stage === "match" ? "🧩" : "❔"}</em><small>Match</small></span>
        </div>
      </div>
      {stage === "tour" && (
        <div className="start-block">
          <div className="p4-stop"><em>{s.flag}</em><div><small>STOP {i + 1} · {s.name.toUpperCase()}</small><p>{s.task}</p></div></div>
          <ChoiceCard options={s.o} good={[s.ok]} picked={pick} onAnswer={answer} feedback={s.learn} />
          {pick !== null && <div className="start-foot"><button className="s1-btn primary big" onClick={next}>Stamp my passport 🛂 <ChevronRight size={18} /></button></div>}
        </div>
      )}
      {stage === "match" && (
        <div className="start-block">
          <h3><Puzzle size={18} /> Last stop: match each product with a country known for it</h3>
          <p className="start-tip">These are famous examples — many products come from several countries!</p>
          <MatchPairs key={round} pairs={COUNTRY_MATCH} leftLabel="Product" rightLabel="Country" onRestart={() => setRound((r) => r + 1)} onDone={(r) => finish(12 + score * 3 + r.firstTry * 2, { stops: score, match: r.firstTry })} />
        </div>
      )}
    </ActShell>
  );
}

const CHAIN = ["🌱 The cocoa beans are harvested.", "🏭 The factory makes the chocolate bar.", "🚢 The chocolate travels to Colombia.", "🛒 The supermarket sells the chocolate."];
const DETECT_ROUNDS = [
  { tag: "MYSTERY PRODUCT · 👕", q: "A T-shirt. What is it made from?", options: ["Cotton", "Cocoa", "Plastic bottles only"], correct: 0, explain: "Cotton → textile factory → clothing shop." },
  { tag: "MYSTERY PRODUCT · ☕", q: "Coffee. Put the journey in order: which comes FIRST?", options: ["Coffee farm", "Packaging", "Store"], correct: 0, explain: "Farm → processing → packaging → store." },
  { tag: "MYSTERY PRODUCT · 📱", q: "A smartphone. What does it need?", options: ["Minerals and electronic components", "Only wood", "Cocoa beans"], correct: 0, explain: "Minerals and components → assembly → distribution → customer." },
  { tag: "MYSTERY PRODUCT · 👟", q: "Sneakers travel from a factory in Vietnam to Colombia. What is the most common transport?", options: ["Ship", "Bicycle", "Train across the ocean"], correct: 0, explain: "Materials → shoe factory → shipping → retail store." },
  { tag: "WHAT COULD GO WRONG?", q: "Bad weather destroys many cacao pods. Which stage has the problem?", options: ["The farm", "The supermarket", "The customer"], correct: 0, explain: "Farms depend on the weather." },
  { tag: "WHAT COULD GO WRONG?", q: "A ship arrives 3 weeks late. What happens at the supermarket?", options: ["It can run out of stock.", "Prices go to zero.", "Nothing at all."], correct: 0, explain: "Late transport = empty shelves." },
];
function SupplyChain({ onSave, onExit }) {
  const [stage, setStage] = useState("order");
  const [errs, setErrs] = useState(0);
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Supply chain expert! 🔗" subtitle="You follow products from farm to customer." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Truck size={22} strokeWidth={2.1} />} title="Build the Supply Chain + Product Detective" subtitle={stage === "order" ? "Put the chocolate journey in order." : "Solve the mystery products and the problems."} onExit={onExit}>
      <div className="p3-stepper"><span className="on"><b>1</b>Supply chain</span><span className={stage === "detective" ? "on" : ""}><b>2</b>Detective</span></div>
      {stage === "order"
        ? <OrderGame items={CHAIN} labels={["Farm", "Factory", "Transport", "Shop"]} onDone={(r) => { setErrs(r.errors); setStage("detective"); }} />
        : <RoundsRunner rounds={DETECT_ROUNDS} doneLabel="Finish" onDone={(r) => finish(Math.max(6, 12 - errs * 2) + r.firstTry * 3, { orderErrors: errs, firstTry: r.firstTry })} />}
    </ActShell>
  );
}

/* Parte 03: el viaje de MI producto */
const TRANSPORTS = [{ id: "ship", e: "🚢", l: "ship" }, { id: "truck", e: "🚚", l: "truck" }, { id: "plane", e: "✈️", l: "plane" }, { id: "train", e: "🚆", l: "train" }];
const SAMPLE_PRODUCTS = [{ e: "🍫", name: "Chocolate bar" }, { e: "👕", name: "T-shirt" }, { e: "📱", name: "Smartphone" }, { e: "👟", name: "Sneakers" }];
function ProductJourney({ store, existing, onSave, onExit }) {
  const own = (store.products || []).map((p) => ({ e: p.e, name: p.name }));
  const choices = [...own, ...SAMPLE_PRODUCTS];
  const ex = existing || {};
  const [prod, setProd] = useState(ex.product || choices[0] || SAMPLE_PRODUCTS[0]);
  const [raw, setRaw] = useState(ex.raw || "");
  const [origin, setOrigin] = useState(ex.origin || "");
  const [made, setMade] = useState(ex.made || "");
  const [tr, setTr] = useState(ex.transport || "");
  const [dest, setDest] = useState(ex.dest || "a store in Bogotá");
  const [risk, setRisk] = useState(ex.risk || "");
  const [st, finish] = useFinish(onSave);
  const T = TRANSPORTS.find((t) => t.id === tr);
  const steps = [
    { e: "🌱", t: `First, the ${raw || "raw material"} comes from ${origin || "___"}.` },
    { e: "🏭", t: `Next, the product is made in ${made || "___"}.` },
    { e: T?.e || "🚚", t: `Then, it travels by ${T?.l || "___"} to Colombia.` },
    { e: "🛒", t: `Finally, customers can buy it at ${dest || "___"}.` },
  ];
  const ready = raw.trim() && origin.trim() && made.trim() && tr && dest.trim();
  if (st.done) return <Reward title="Journey mapped! 🗺️" subtitle="Part 03 · Your product's journey is in your store." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<MapIcon size={22} strokeWidth={2.1} />} title="Part 03 · The Four-Step Product Journey" subtitle="Where does YOUR product come from? It will appear in your store as “Our journey”." onExit={onExit}>
      <div className="start-block">
        <h3><span className="step-n">1</span> Choose a product</h3>
        <div className="p1-starters">{choices.map((c) => <button key={c.name} type="button" className={`p1-chip ${prod.name === c.name ? "on" : ""}`} onClick={() => setProd(c)}>{c.e} {c.name}</button>)}</div>
      </div>
      <div className="start-block p3-qcard">
        <QRow n="2" q="Raw material: what is it made from?"><input className="start-input" value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="recycled paper / cotton / cocoa" /></QRow>
        <QRow n="3" q="Country of origin of the material"><input className="start-input" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Colombia / Brazil / Ghana" /></QRow>
        <QRow n="4" q="Country (or city) where it is made"><input className="start-input" value={made} onChange={(e) => setMade(e.target.value)} placeholder="Medellín, Colombia" /></QRow>
        <QRow n="5" q="Transport">
          <div className="p1-starters">{TRANSPORTS.map((t) => <button key={t.id} type="button" className={`p1-chip ${tr === t.id ? "on" : ""}`} onClick={() => setTr(t.id)}>{t.e} {t.l}</button>)}</div>
        </QRow>
        <QRow n="6" q="Final destination"><input className="start-input" value={dest} onChange={(e) => setDest(e.target.value)} placeholder="a store in Bogotá" /></QRow>
        <QRow n="⭐" q="Challenge (optional): One challenge in this journey is…"><input className="start-input" value={risk} onChange={(e) => setRisk(e.target.value)} placeholder="pollution / high transport costs / bad weather" /></QRow>
      </div>
      <div className="p4-journey">
        <small>THE JOURNEY OF {prod.e} {prod.name.toUpperCase()}</small>
        <div className="p4-journey-row">{steps.map((s, k) => <div key={k}><em>{s.e}</em><p>{s.t}</p></div>)}</div>
        {risk && <p className="p4-journey-risk">⚠️ One challenge in this journey is {risk}.</p>}
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { product: prod, raw, origin, made, transport: tr, dest, risk, steps: steps.map((s) => s.t) })}>Save my journey <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 38 · WORLD CURRENCIES FOR AN INTERNATIONAL CUSTOMER
   ===================================================================== */
const CONVERT_INTRO = (
  <div className="start-explain">
    <h3><Globe size={18} strokeWidth={2.3} /> Two ways to convert</h3>
    <p>🇨🇴 → 🌍 <b>COP to another currency: DIVIDE.</b> $20,000 COP ÷ 4,000 = <b>US$5</b>.</p>
    <p>🌍 → 🇨🇴 <b>Another currency to COP: MULTIPLY.</b> US$5 × 4,000 = <b>$20,000 COP</b>.</p>
    <RatesCard />
  </div>
);
const CONVERT_ROUNDS = [
  { q: "🇺🇸 A customer in New York wants your $20,000 COP notebook. How much is it in US dollars?", answer: 5, unit: "US$", hint: "20,000 ÷ 4,000", explain: "US$5." },
  { q: "🇬🇧 Your $40,000 COP T-shirt for a customer in London. How many pounds?", answer: 8, unit: "£", hint: "40,000 ÷ 5,000", explain: "£8." },
  { q: "🇪🇸 Your $9,000 COP cupcake box for Madrid. How many euros?", answer: 2, unit: "€", hint: "9,000 ÷ 4,500", explain: "€2." },
  { q: "🇯🇵 Your $27,000 COP bracelet for Tokyo. How many yen?", answer: 1000, unit: "¥", hint: "27,000 ÷ 27", explain: "¥1,000." },
  { q: "🇺🇸 A US customer pays US$12. How much is it in COP?", answer: 48000, money: true, hint: "12 × 4,000", explain: "$48,000 COP." },
  { q: "🇲🇽 A Mexican customer pays MX$100. How much is it in COP?", answer: 22000, money: true, hint: "100 × 220", explain: "$22,000 COP." },
  { q: "Which currency is used in the United Kingdom?", options: ["The pound (£)", "The dollar (US$)", "The euro (€)"], correct: 0, explain: "The British pound." },
  { q: "Which English-speaking countries use a DOLLAR?", options: ["USA, Canada and Australia", "The UK and Ireland", "Spain and Mexico"], correct: 0, explain: "US dollar, Canadian dollar, Australian dollar. Ireland uses the euro!" },
];

/* Parte 04: precios internacionales de MI producto */
function WorldPrices({ store, existing, onSave, onExit }) {
  const prods = (store.products || []).filter((p) => p.price > 0);
  const [pid, setPid] = useState(existing?.pid || prods[0]?.id || "");
  const [ans, setAns] = useState(existing?.ans || { USD: "", EUR: "" });
  const [markets, setMarkets] = useState(existing?.markets || []);
  const [lines, setLines] = useState(existing?.lines || ["", ""]);
  const [st, finish] = useFinish(onSave);
  const p = prods.find((x) => x.id === pid) || prods[0];
  const price = p?.price || 0;
  const real = (code) => price / RATES.find((r) => r.code === code).rate;
  const ok = (code) => ans[code] !== "" && Math.abs(num(ans[code]) - real(code)) <= Math.max(0.05, real(code) * 0.02);
  const togM = (c) => setMarkets((a) => (a.includes(c) ? a.filter((x) => x !== c) : [...a, c]));
  const ready = p && ok("USD") && ok("EUR") && markets.length >= 2 && lines.every((l) => countWords(l) >= 4);
  if (st.done) return <Reward title="Ready for the world! 💱" subtitle="Part 04 · World prices added to your store." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  if (!p) return (
    <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title="Part 04 · World prices" subtitle="" onExit={onExit}>
      <div className="p1-banner bad">First open your online store (Class 34 · Part 01) with at least one product.</div>
    </ActShell>
  );
  return (
    <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title="Part 04 · My product's world prices" subtitle="An international customer wants to buy! Convert your price." onExit={onExit}>
      <RatesCard />
      <div className="start-block">
        <h3><span className="step-n">1</span> Choose your product</h3>
        <div className="p1-starters">{prods.map((x) => <button key={x.id} type="button" className={`p1-chip ${pid === x.id ? "on" : ""}`} onClick={() => { setPid(x.id); setAns({ USD: "", EUR: "" }); }}>{x.e} {x.name} · {cop(x.price)}</button>)}</div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> Calculate (divide!)</h3>
        {["USD", "EUR"].map((c) => {
          const r = RATES.find((x) => x.code === c);
          return (
            <div key={c} className="p4-calc">
              <span>{r.flag} {cop(price)} ÷ {r.rate.toLocaleString("en-US")} =</span>
              <input className="start-input p2-num" type="number" step="0.01" value={ans[c]} onChange={(e) => setAns({ ...ans, [c]: e.target.value })} placeholder={r.sym} />
              <b className={ans[c] === "" ? "" : ok(c) ? "ok" : "no"}>{ans[c] === "" ? "" : ok(c) ? "✓" : "Try again"}</b>
            </div>
          );
        })}
        <p className="start-tip">💡 You can use decimals: 2.5 = two and a half.</p>
      </div>
      <div className="start-block">
        <h3><span className="step-n">3</span> Where do you want to sell? (2+ countries)</h3>
        <div className="p4-pricetags">
          {RATES.map((r) => (
            <button key={r.code} type="button" className={markets.includes(r.code) ? "on" : ""} onClick={() => togM(r.code)}>
              <em>{r.flag}</em><b>{fx(price, r.code)}</b><small>{r.name}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">4</span> Speaking: “Our product costs ___ in ___.”</h3>
        {lines.map((l, k) => {
          const r = RATES.find((x) => x.code === markets[k]);
          return <input key={k} className="start-input p3-gap" value={l} onChange={(e) => setLines(lines.map((x, j) => (j === k ? e.target.value : x)))} placeholder={r ? `Our ${p.name} costs ${fx(price, r.code)} in ${r.name === "Euro" ? "Spain" : r.flag}…` : "Our product costs … in …"} />;
        })}
        <div className="p1-starters">{markets.slice(0, 2).map((c, k) => { const r = RATES.find((x) => x.code === c); const s = `Our ${p.name} costs ${fx(price, c)} (${r.name}s).`; return <button key={c} type="button" className="p1-chip" onClick={() => setLines(lines.map((x, j) => (j === k ? s : x)))}>{s}</button>; })}</div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(35, { pid, ans, markets, lines })}>Save my world prices <span className="coin-tag"><Coins size={15} /> +35</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 39–40 · DIGITAL MARKETING + RESPONSIBLE AI
   ===================================================================== */
const READ_W39 = [
  { h: "A Good Digital Ad" },
  { p: "Every day, we see many ads on phones, tablets, and computers. A digital ad is a message that helps people discover a product or a service. Businesses use ads on social media, websites, videos, and apps." },
  { sub: "What makes a good digital ad?" },
  { list: [
    "It is CLEAR: people understand what you sell in 3 seconds.",
    "It talks to the RIGHT CUSTOMER: an ad for students is different from an ad for parents.",
    "It shows the VALUE: why is your product useful?",
    "It is HONEST: the price and the promises are true.",
    "It has a CALL TO ACTION: “Buy now”, “Visit our store”, “Try it today”.",
  ] },
  { p: "A good ad uses few words, a strong image, and the colors of the brand. People remember ads that are simple." },
  { sub: "⚠️ Be careful with dishonest ads" },
  { p: "Some ads say things that are not true: “The best product in the world!”, “100% free!”, or “Only 2 left!” when it is not true. Some use fake reviews. These ads break the trust of customers. A responsible business never lies to sell more." },
  { sub: "🤖 Ads and Artificial Intelligence" },
  { p: "Today, people can use AI tools to get ideas, check grammar, or create images. AI can help us learn, but we must use it responsibly: we check the information, we write in our own words, and we never use AI to create fake reviews or to copy other people's work." },
  { box: "A good ad is clear, honest, and made for a real customer." },
];
const GLOSS_W39 = { "ad": "Anuncio.", "call to action": "Llamado a la acción (Compra ya, Visítanos).", "honest": "Honesto.", "fake reviews": "Reseñas falsas.", "trust": "Confianza." };
const ADS_SORT = [
  { id: "good", label: "Good ad", icon: "✅", color: "#16b074" },
  { id: "bad", label: "Dishonest / bad", icon: "🚫", color: "#ff6b57" },
];
const ADS_ITEMS = [
  { label: "“Recycled notebooks for students. $8,000. Visit our store!”", answer: "good" },
  { label: "“THE BEST NOTEBOOK IN THE UNIVERSE!!! 100% FREE!!!” (it costs $8,000)", answer: "bad", why: "The price is not true." },
  { label: "“★★★★★ ‘Amazing!’ — My Mom, My Cousin, My Dog”", answer: "bad", why: "Fake reviews break trust." },
  { label: "“Fresh fruit cups for your break. Try one today!”", answer: "good" },
  { label: "“Only 1 left!!! Buy NOW!!!” (they have 300)", answer: "bad", why: "False pressure is dishonest." },
  { label: "“Dog walks for busy families. Safe and happy pets 🐶”", answer: "good" },
  { label: "A long ad with 200 words and no picture", answer: "bad", why: "Not clear: too many words." },
  { label: "“Learn math with friendly tutors. First class: $5,000.”", answer: "good" },
];
const Q_W39 = [
  { q: "A good digital ad is…", options: ["clear, honest and made for a real customer.", "long and full of words.", "full of fake reviews."], correct: 0, feedback: "Clear + honest + right customer." },
  { q: "What is a “call to action”?", options: ["A phrase like “Buy now” or “Visit our store”.", "A phone call to the bank.", "The price of the product."], correct: 0, feedback: "It tells people what to do next." },
];

const AI_SORT = [
  { id: "ok", label: "Responsible use", icon: "🤖✅", color: "#16b074" },
  { id: "no", label: "Not responsible", icon: "🚫", color: "#ff6b57" },
];
const AI_ITEMS = [
  { label: "Ask AI to explain a word I don't understand.", answer: "ok" },
  { label: "Ask AI to write my whole ad and say I wrote it.", answer: "no", why: "Be honest: your work must be yours." },
  { label: "Use AI to check my grammar, then rewrite in my own words.", answer: "ok" },
  { label: "Ask AI to create 20 fake 5-star reviews.", answer: "no", why: "Fake reviews lie to customers." },
  { label: "Write my home address and my card number in an AI chat.", answer: "no", why: "Never share personal information." },
  { label: "Ask AI for 5 slogan ideas, then create my own.", answer: "ok" },
  { label: "Copy a famous logo with AI and use it as mine.", answer: "no", why: "Copying is not responsible." },
  { label: "Check if the AI's information is true in another source.", answer: "ok" },
];
const READ_AI = [
  { h: "AI: a helper, not a cheater" },
  { p: "Artificial Intelligence (AI) is a technology that can answer questions, write texts and create images. It is a powerful tool for learning." },
  { list: ["✅ Use it to understand, practice and get ideas.", "✅ Check the information — AI can make mistakes.", "✅ Write your final work in your own words.", "🚫 Never share personal information.", "🚫 Never create fake reviews, fake news or copies."] },
  { box: "Responsible AI: I use it to learn more, not to think less." },
];

/* Perfil del cliente (para el anuncio) */
const PERSONA_AV = ["🧒", "👧", "🧑", "👩", "👨", "🧓", "👩‍🏫", "🧑‍🎓"];
const LIKES = ["Sports", "Music", "Video games", "Art", "Animals", "Reading", "Healthy food", "The planet", "Fashion", "Technology"];
const CHANNELS = [{ id: "ig", l: "📸 Instagram" }, { id: "yt", l: "▶️ YouTube" }, { id: "wa", l: "💬 WhatsApp" }, { id: "tt", l: "🎵 TikTok" }, { id: "board", l: "📌 School board" }, { id: "fair", l: "🎪 School fair" }];
function CustomerProfile({ company, existing, onSave, onExit }) {
  const ex = existing || {};
  const [av, setAv] = useState(ex.av || "🧑‍🎓");
  const [nm, setNm] = useState(ex.name || "");
  const [age, setAge] = useState(ex.age || "");
  const [likes, setLikes] = useState(ex.likes || []);
  const [problem, setProblem] = useState(ex.problem || company.problem || "");
  const [ch, setCh] = useState(ex.channels || []);
  const [st, finish] = useFinish(onSave);
  const tog = (set, arr, v, max) => set(arr.includes(v) ? arr.filter((x) => x !== v) : arr.length < max ? [...arr, v] : arr);
  const ready = nm.trim() && num(age) > 0 && likes.length >= 2 && countWords(problem) >= 4 && ch.length >= 1;
  if (st.done) return <Reward title="Customer profile ready! 🎯" subtitle="Now your ad knows who it talks to." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Target size={22} strokeWidth={2.1} />} title="My customer profile" subtitle="Who will see your ad? Create your ideal customer." onExit={onExit}>
      <div className="p4-persona-wrap">
        <div className="start-block">
          <div className="p1-starters">{PERSONA_AV.map((a) => <button key={a} type="button" className={`p1-chip big ${av === a ? "on" : ""}`} onClick={() => setAv(a)}>{a}</button>)}</div>
          <div className="p2-grid2">
            <label className="p3-lbl">Name<input className="start-input" value={nm} onChange={(e) => setNm(e.target.value)} placeholder="Sofía" /></label>
            <label className="p3-lbl">Age<input className="start-input" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="12" /></label>
          </div>
          <span className="terms-label">Likes (2–3):</span>
          <div className="p1-starters">{LIKES.map((l) => <button key={l} type="button" className={`p1-chip ${likes.includes(l) ? "on" : ""}`} onClick={() => tog(setLikes, likes, l, 3)}>{l}</button>)}</div>
          <label className="p3-lbl p2-mt">Problem or need<input className="start-input" value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="She forgets her materials at home." /></label>
          <span className="terms-label">Where does this customer see ads?</span>
          <div className="p1-starters">{CHANNELS.map((c) => <button key={c.id} type="button" className={`p1-chip ${ch.includes(c.id) ? "on" : ""}`} onClick={() => tog(setCh, ch, c.id, 3)}>{c.l}</button>)}</div>
        </div>
        <div className="p4-persona">
          <em>{av}</em>
          <b>{nm || "Customer name"}{age ? `, ${age}` : ""}</b>
          <small>MY IDEAL CUSTOMER</small>
          <div className="p3-info-tags">{likes.map((l) => <i key={l}>{l}</i>)}</div>
          <p>⚠️ {problem || "…"}</p>
          <p>📣 {ch.map((c) => CHANNELS.find((x) => x.id === c).l).join(" · ") || "…"}</p>
        </div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(25, { av, name: nm, age: num(age), likes, problem, channels: ch })}>Save my customer <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
    </ActShell>
  );
}

/* Parte 05: Ad Maker */
const AD_TEMPLATES = [{ id: "bold", l: "Bold" }, { id: "card", l: "Product card" }, { id: "split", l: "Split" }];
const CTAS = ["Buy now", "Visit our store", "Try it today", "Order online", "Get yours"];
const AD_STICKERS = ["✨", "🔥", "🌱", "💚", "⭐", "🎉", "♻️", "🚀"];
const HONESTY = ["The price in my ad is the real price.", "I don't promise things that are not true.", "I didn't copy another brand's logo or ad.", "My reviews are real (or I don't show reviews)."];
function AdPoster({ ad, brand, product, name }) {
  const pal = palOf(brand?.palette).c;
  const f = fontOf(brand?.font);
  return (
    <div className={`p4-ad ${ad.tpl}`} style={{ "--c0": pal[0], "--c1": pal[1], "--c2": pal[2] }}>
      <div className="p4-ad-top"><LogoMark brand={{ ...brand, name, slogan: "" }} size={30} row light={ad.tpl !== "card"} /><span className="p4-ad-stk">{ad.sticker}</span></div>
      <div className="p4-ad-prod"><em>{product?.e || "🎁"}</em></div>
      <h3 style={{ fontFamily: f.css }}>{ad.headline || "Your headline here"}</h3>
      <p>{ad.text || "One or two short sentences about your product."}</p>
      {product && <div className="p4-ad-price">{product.name} · <b>{cop(product.price)}</b></div>}
      <span className="p4-ad-cta">{ad.cta || "Buy now"} →</span>
    </div>
  );
}
function AdMaker({ store, customer, existing, onSave, onExit }) {
  const prods = store.products || [];
  const [ad, setAd] = useState(existing || { tpl: "bold", headline: "", text: "", cta: "Visit our store", sticker: "✨", pid: prods[0]?.id || "", checks: [] });
  const [st, finish] = useFinish(onSave);
  const set = (k, v) => setAd((a) => ({ ...a, [k]: v }));
  const product = prods.find((p) => p.id === ad.pid);
  const hw = countWords(ad.headline);
  const ready = hw >= 2 && hw <= 7 && countWords(ad.text) >= 6 && countWords(ad.text) <= 30 && ad.checks.length === HONESTY.length;
  if (st.done) return <Reward title="Your ad is live! 📣" subtitle="Part 05 · Your digital ad is on your store." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Megaphone size={22} strokeWidth={2.1} />} title="Part 05 · Ad Maker 📣" subtitle="Create a digital poster for your store. Clear, honest, for YOUR customer." onExit={onExit}>
      {customer?.name && <div className="p1-banner"><Target size={16} /> Your customer: <b>{customer.av} {customer.name}, {customer.age}</b> — likes {customer.likes?.join(", ")}.</div>}
      <div className="p3-studio">
        <div className="p3-studio-tools">
          <div className="start-block">
            <h3><span className="step-n">1</span> Template & product</h3>
            <div className="p3-mock-tabs">{AD_TEMPLATES.map((t) => <button key={t.id} type="button" className={ad.tpl === t.id ? "on" : ""} onClick={() => set("tpl", t.id)}>{t.l}</button>)}</div>
            <div className="p1-starters">{prods.map((p) => <button key={p.id} type="button" className={`p1-chip ${ad.pid === p.id ? "on" : ""}`} onClick={() => set("pid", p.id)}>{p.e} {p.name}</button>)}</div>
          </div>
          <div className="start-block">
            <h3><span className="step-n">2</span> Headline (2–7 words)</h3>
            <input className="start-input" value={ad.headline} maxLength={50} onChange={(e) => set("headline", e.target.value)} placeholder="Never forget your kit again!" />
            <h3 className="p2-mt"><span className="step-n">3</span> Text (1–2 short sentences)</h3>
            <textarea className="start-input" rows={2} value={ad.text} onChange={(e) => set("text", e.target.value)} placeholder="Daily school kits for busy students. Pencils, ruler and eraser in one small bag." />
            <p className={`word-count ${countWords(ad.text) >= 6 && countWords(ad.text) <= 30 ? "ok" : ""}`}>{countWords(ad.text)} words · 6–30</p>
          </div>
          <div className="start-block">
            <h3><span className="step-n">4</span> Call to action + sticker</h3>
            <div className="p1-starters">{CTAS.map((c) => <button key={c} type="button" className={`p1-chip ${ad.cta === c ? "on" : ""}`} onClick={() => set("cta", c)}>{c}</button>)}</div>
            <div className="p3-icons">{AD_STICKERS.map((s) => <button key={s} type="button" className={ad.sticker === s ? "on" : ""} onClick={() => set("sticker", s)}>{s}</button>)}</div>
          </div>
          <div className="start-block">
            <h3><span className="step-n">5</span> ✅ Honesty checklist</h3>
            {HONESTY.map((h) => (
              <label key={h} className="perm-check p1-check"><input type="checkbox" checked={ad.checks.includes(h)} onChange={() => set("checks", ad.checks.includes(h) ? ad.checks.filter((x) => x !== h) : [...ad.checks, h])} /><span>{h}</span></label>
            ))}
          </div>
        </div>
        <div className="p3-studio-preview">
          <AdPoster ad={ad} brand={store.brand} product={product} name={store.name} />
        </div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(40, ad)}>Publish my ad <span className="coin-tag"><Coins size={15} /> +40</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   LA TIENDA GLOBAL · se arma sola con todas las piezas del periodo
   ===================================================================== */
function buildStore(r4, company) {
  const r = r4 || {};
  const s = r.w34_store || {};
  const brand = s.brand?.icon ? s.brand : company.brand;
  const name = (s.brand?.name || "").trim() || company.name;
  const products = (s.products || []).filter((p) => p.name && num(p.price) > 0).map((p) => ({ ...p, price: num(p.price) }));
  const safe = r.w35_rules || null;
  const journey = r.w37_journey || null;
  const prices = r.w38_prices || null;
  const ad = r.w39_ad || null;
  return {
    name, brand, tagline: s.tagline || company.slogan || "", products,
    rules: safe?.rules || [], payments: safe?.payments || [],
    journey, markets: prices?.markets || [], ad, customer: r.w39_customer || null,
    mission: company.mission, value: company.value, founder: company.founder, problem: company.problem,
    parts: [
      { id: "store", n: "01", label: "Store & products", act: "w34_store", done: products.length >= 1 },
      { id: "safe", n: "02", label: "Safe Shop badge", act: "w35_rules", done: !!safe },
      { id: "journey", n: "03", label: "Product journey", act: "w37_journey", done: !!journey },
      { id: "prices", n: "04", label: "World prices", act: "w38_prices", done: !!prices },
      { id: "ad", n: "05", label: "Digital ad", act: "w39_ad", done: !!ad },
      { id: "launch", n: "06", label: "Global launch", act: "w41_store", done: !!r.w41_store },
    ],
  };
}
const publicStore = (s) => ({ name: s.name, brand: s.brand, tagline: s.tagline, products: s.products, rules: s.rules, payments: s.payments, journey: s.journey, markets: s.markets, ad: s.ad, mission: s.mission, value: s.value, founder: s.founder });

function Stars({ n, size = "1rem" }) {
  return <span className="p4-stars" style={{ fontSize: size }}>{[1, 2, 3, 4, 5].map((k) => <i key={k} className={k <= Math.round(n || 0) ? "on" : ""}>★</i>)}</span>;
}

function GlobalStore({ store, compact, mode = "preview", reviews, onCheckout, id }) {
  const [cur, setCur] = useState("COP");
  const [cart, setCart] = useState({});
  const pal = palOf(store.brand?.palette).c;
  const f = fontOf(store.brand?.font);
  const products = store.products || [];
  const price = (p) => (cur === "COP" ? cop(p) : fx(p, cur));
  const items = Object.entries(cart).filter(([, q]) => q > 0).map(([pid, q]) => ({ ...products.find((p) => p.id === pid), qty: q })).filter((x) => x.id);
  const totalCOP = items.reduce((a, x) => a + x.price * x.qty, 0);
  const count = items.reduce((a, x) => a + x.qty, 0);
  const add = (pid, d) => setCart((c) => ({ ...c, [pid]: Math.max(0, (c[pid] || 0) + d) }));
  const curs = ["COP", ...(store.markets || [])];
  const product0 = products.find((p) => p.id === store.ad?.pid) || products[0];
  const avg = reviews?.length ? reviews.reduce((a, r) => a + Number(r.stars || 0), 0) / reviews.length : 0;
  return (
    <div className={`p4-site ${compact ? "compact" : ""}`} id={id} style={{ "--c0": pal[0], "--c1": pal[1], "--c2": pal[2], "--c1s": tint(pal[1], 0.4) }}>
      <div className="p4-browser"><i /><i /><i /><span>🔒 www.{(store.name || "mystore").toLowerCase().replace(/[^a-z0-9]+/g, "")}.shop</span></div>
      <header className="p4-site-nav">
        <LogoMark brand={{ ...store.brand, name: store.name, slogan: "" }} size={compact ? 32 : 40} row light />
        <nav><span>Shop</span>{store.journey && <span>Our journey</span>}{!!store.rules?.length && <span>Safe shop</span>}{reviews && <span>Reviews</span>}</nav>
        <span className="p4-cart-ico"><ShoppingCart size={18} />{count > 0 && <b>{count}</b>}</span>
      </header>

      <section className="p4-site-hero">
        <div>
          <small>{store.founder ? `By ${store.founder}` : "Online store"}</small>
          <h2 style={{ fontFamily: f.css }}>{store.ad?.headline || store.name || "My store"}</h2>
          <p>{store.ad?.text || store.tagline || store.value || ""}</p>
          {reviews?.length > 0 && <div className="p4-site-rating"><Stars n={avg} /> <b>{avg.toFixed(1)}</b> · {reviews.length} review{reviews.length > 1 ? "s" : ""}</div>}
        </div>
        {store.ad ? <AdPoster ad={store.ad} brand={store.brand} product={product0} name={store.name} /> : <div className="p4-site-hero-art">{product0?.e || store.brand?.icon || "🛍️"}</div>}
      </section>

      {curs.length > 1 && (
        <div className="p4-curbar"><span>🌍 Show prices in:</span>{curs.map((c) => { const r = RATES.find((x) => x.code === c); return <button key={c} type="button" className={cur === c ? "on" : ""} onClick={() => setCur(c)}>{r ? `${r.flag} ${c}` : "🇨🇴 COP"}</button>; })}</div>
      )}

      <section className="p4-products">
        {products.length === 0 && <p className="start-tip">Your products will appear here.</p>}
        {products.map((p) => (
          <div key={p.id} className="p4-product">
            <div className="p4-product-img">{p.e}</div>
            <span className={`p4-ptype ${p.type}`}>{p.type === "service" ? "Service" : "Product"}</span>
            <b>{p.name}</b>
            <p>{p.desc}</p>
            <div className="p4-product-foot">
              <strong>{price(p.price)}</strong>
              {cart[p.id] > 0
                ? <span className="p4-qty"><button type="button" onClick={() => add(p.id, -1)}><Minus size={14} /></button><b>{cart[p.id]}</b><button type="button" onClick={() => add(p.id, 1)}><Plus size={14} /></button></span>
                : <button type="button" className="p4-add" onClick={() => add(p.id, 1)}><Plus size={14} /> Add to cart</button>}
            </div>
          </div>
        ))}
      </section>

      {count > 0 && (
        <section className="p4-cart">
          <h4><ShoppingCart size={16} /> My cart</h4>
          {items.map((x) => <div key={x.id}><span>{x.e} {x.qty} × {x.name}</span><b>{price(x.price * x.qty)}</b></div>)}
          <div className="p4-cart-total"><span>Total</span><b>{cop(totalCOP)}{cur !== "COP" && <small> ≈ {fx(totalCOP, cur)}</small>}</b></div>
          {mode === "shop"
            ? <button type="button" className="s1-btn primary big" onClick={() => onCheckout && onCheckout(items, totalCOP)}>Checkout <ChevronRight size={17} /></button>
            : <small className="p4-cart-note">👀 Preview: this is how your customers will shop.</small>}
        </section>
      )}

      {store.journey && (
        <section className="p4-site-sec">
          <h4>🗺️ Our product's journey</h4>
          <div className="p4-journey-row">{(store.journey.steps || []).map((t, k) => <div key={k}><em>{["🌱", "🏭", TRANSPORTS.find((x) => x.id === store.journey.transport)?.e || "🚚", "🛒"][k]}</em><p>{t}</p></div>)}</div>
        </section>
      )}

      <div className="p4-site-split">
        {!!store.rules?.length && (
          <section className="p4-site-sec safe">
            <h4><ShieldCheck size={16} /> Safe Shop</h4>
            <ul>{store.rules.map((r, k) => <li key={k}>{r}</li>)}</ul>
            <div className="p4-badge-pay">{STORE_PAY.filter((p) => (store.payments || []).includes(p.id)).map((p) => <span key={p.id}>{p.e} {p.l}</span>)}</div>
          </section>
        )}
        {(store.mission || store.value) && (
          <section className="p4-site-sec">
            <h4>💚 About us</h4>
            {store.value && <p><b>{store.value}</b></p>}
            {store.mission && <p>{store.mission}</p>}
          </section>
        )}
      </div>

      {reviews?.length > 0 && (
        <section className="p4-site-sec">
          <h4>⭐ Customer reviews</h4>
          <div className="p4-reviews">{reviews.slice(0, 6).map((r, k) => <div key={k}><Stars n={r.stars} /><p>“{r.text}”</p><small>— {String(r.name || "Classmate").split(" ")[0]}</small></div>)}</div>
        </section>
      )}
      <footer className="p4-site-foot">© {store.name} · Made in Colombia 🇨🇴 · Global Business Showcase · Instituto CREAR</footer>
    </div>
  );
}

const tint = (hex, k) => {
  const h = String(hex || "#bdeed7").replace("#", "");
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return "#" + c.map((v) => Math.round(v * k + 255 * (1 - k)).toString(16).padStart(2, "0")).join("");
};
const loadHtml2Canvas = () => (window.html2canvas ? Promise.resolve(window.html2canvas) : new Promise((res, rej) => {
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  s.onload = () => res(window.html2canvas); s.onerror = rej;
  document.body.appendChild(s);
}));
const downloadNode = async (elId, fileName) => {
  const h2c = await loadHtml2Canvas();
  const canvas = await h2c(document.getElementById(elId), { scale: 2, backgroundColor: "#ffffff", useCORS: true });
  const a = document.createElement("a"); a.href = canvas.toDataURL("image/png"); a.download = fileName; a.click();
};

/* =====================================================================
   CLASE 41–42 · GLOBAL BUSINESS SHOWCASE
   ===================================================================== */
function StoreLaunch({ store, userData, API_URL, onSave, onExit, onJump }) {
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(null);
  const [live, setLive] = useState(false);
  const [st, finish] = useFinish(onSave);
  const parts = store.parts.slice(0, 5);
  const missing = parts.filter((p) => !p.done);
  const minimum = store.products.length >= 1;
  const publish = async () => {
    setBusy("pub"); setMsg(null);
    try {
      const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "global_publish", user_key: userData.Student_Key, nombre: userData.Nombre_Completo, grado: GRADE, store: publicStore(store) }) });
      const d = await res.json();
      if (d.status === "error") { setMsg({ type: "bad", text: d.message }); return; }
      setLive(true); setMsg({ type: "good", text: "🚀 Your store is LIVE in the Global Business Showcase!" });
    } catch (e) { setMsg({ type: "bad", text: "Connection problem. Try again." }); }
    finally { setBusy(""); }
  };
  const png = async () => {
    setBusy("png");
    try { await downloadNode("p4-final-store", `${(store.name || "store").replace(/[^\w-]+/g, "_")}_online_store.png`); }
    catch (e) { setMsg({ type: "bad", text: "I couldn't create the image. Try again." }); }
    finally { setBusy(""); }
  };
  if (st.done) return <Reward title="Your company is GLOBAL! 🌍🚀" subtitle="Part 06 · Your store is open for the whole class." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Rocket size={22} strokeWidth={2.1} />} title="Part 06 · Launch my Global Store" subtitle="Your online store built itself with everything you created this period." onExit={onExit}>
      <div className="p3-check">
        <div className="p3-check-head"><b>Store builder</b><span>{parts.filter((p) => p.done).length}/5 parts</span></div>
        <div className="p3-parts">{parts.map((p) => <span key={p.id} className={p.done ? "on" : ""}><b>{p.done ? "✓" : p.n}</b>{p.label}</span>)}</div>
        {missing.length > 0 && (
          <div className="p2-missing"><b>You can still add:</b>
            {missing.map((p) => <span key={p.id}>• {p.label} <button type="button" className="p1-link" onClick={() => onJump(p.act)}>Go build it →</button></span>)}
          </div>
        )}
      </div>
      {!minimum ? <div className="p1-banner bad">First open your store with at least one product (Class 34 · Part 01).</div> : <GlobalStore store={store} id="p4-final-store" />}
      <div className="p3-card-actions">
        <button className="s1-btn ghost" disabled={!!busy || !minimum} onClick={png}><Download size={17} /> {busy === "png" ? "Creating image…" : "Download PNG"}</button>
        <button className="s1-btn ghost" disabled={!!busy || !minimum} onClick={publish}><Rocket size={17} /> {busy === "pub" ? "Launching…" : live ? "Update my live store" : "Launch my store"}</button>
      </div>
      {msg && <div className={`p1-banner ${msg.type === "good" ? "good" : "bad"}`}>{msg.text}</div>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!live} onClick={() => finish(50, { launchedAt: nowISO(), parts: parts.filter((p) => p.done).length })}>{live ? "My store is live!" : "Launch your store first"} <span className="coin-tag"><Coins size={15} /> +50</span></button></div>
    </ActShell>
  );
}

const REVIEW_STARTERS = ["I like your… because…", "Your store is clear and…", "You could improve…", "My favorite product is…"];
function ShowcaseMarket({ userData, API_URL, onSave, onExit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [open, setOpen] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [method, setMethod] = useState("");
  const [pin, setPin] = useState("");
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("shop");
  const [st, finish] = useFinish(onSave);
  const post = async (action, extra = {}) => {
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action, user_key: userData.Student_Key, nombre: userData.Nombre_Completo, grado: GRADE, ...extra }) });
    return res.json();
  };
  const load = async () => {
    setLoading(true); setMsg(null);
    try { const d = await post("global_list"); if (d.status === "error") setMsg({ type: "bad", text: d.message }); else setData(d); }
    catch (e) { setMsg({ type: "bad", text: "Connection problem. Try again." }); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stores = data?.stores || [];
  const others = stores.filter((s) => s.key !== userData.Student_Key);
  const mine = stores.find((s) => s.key === userData.Student_Key);
  const balance = data?.balance ?? WALLET_START;
  const visited = new Set((data?.orders || []).map((o) => o.store));
  const need = Math.max(1, Math.min(3, others.length));
  const shop = others.find((s) => s.key === open);
  const pay = async () => {
    setBusy(true); setMsg(null);
    try {
      const d = await post("global_order", { store_key: open, items: checkout.items.map((x) => ({ id: x.id, qty: x.qty })), method, stars, review });
      if (d.status === "error") { setMsg({ type: "bad", text: d.message }); return; }
      setData(d); setCheckout(null); setOpen(null); setMethod(""); setPin(""); setStars(0); setReview("");
      setMsg({ type: "good", text: "✅ Payment approved! Thank you for your review." });
    } catch (e) { setMsg({ type: "bad", text: "Connection problem. Try again." }); }
    finally { setBusy(false); }
  };
  const coins = 20 + Math.min(visited.size, 5) * 5;
  if (st.done) return <Reward title="Global shopper! 🛍️🌍" subtitle={`You shopped in ${visited.size} stores and helped them with reviews.`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;

  if (shop && checkout) {
    const s = shop.store || {};
    const methods = STORE_PAY.filter((p) => (s.payments || ["wallet", "debit"]).includes(p.id));
    const ok = method && /^\d{4}$/.test(pin) && stars > 0 && countWords(review) >= 5 && checkout.total <= balance;
    return (
      <ActShell icon={<Receipt size={22} strokeWidth={2.1} />} title={`Checkout · ${s.name}`} subtitle="Pay safely and leave a peer review." onExit={() => setCheckout(null)}>
        <div className="p4-checkout">
          <div className="p4-receipt">
            <small>ORDER SUMMARY</small>
            {checkout.items.map((x) => <div key={x.id}><span>{x.e} {x.qty} × {x.name}</span><b>{cop(x.price * x.qty)}</b></div>)}
            <div className="p4-cart-total"><span>Total</span><b>{cop(checkout.total)}</b></div>
            <div className={`p4-cart-total ${checkout.total > balance ? "bad" : ""}`}><span>My wallet</span><b>{cop(balance)}</b></div>
            {checkout.total > balance && <p className="goal-warn">Insufficient balance! Remove something.</p>}
          </div>
          <div className="start-block">
            <h3><span className="step-n">1</span> Payment method</h3>
            <div className="p4-paygrid">{methods.map((p) => <button key={p.id} type="button" className={method === p.id ? "ok" : ""} onClick={() => setMethod(p.id)}><em>{p.e}</em><b>{p.l}</b></button>)}</div>
            <h3 className="p2-mt"><span className="step-n">2</span> Your secret 4-digit PIN 🤫</h3>
            <input className="start-input p4-pin" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••" />
            <p className="start-tip">🛡️ Cover the screen! It's a class game: invent any 4 numbers — never use a real PIN.</p>
          </div>
          <div className="start-block">
            <h3><span className="step-n">3</span> ⭐ Peer review</h3>
            <div className="p3-stars">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={stars >= n ? "on" : ""} onClick={() => setStars(n)}>★</button>)}</div>
            <Starters items={REVIEW_STARTERS} onPick={appendStarter(setReview)} />
            <textarea className="start-input" rows={2} value={review} maxLength={200} onChange={(e) => setReview(e.target.value)} placeholder="I like your store because it is clear. You could improve…" />
          </div>
        </div>
        {msg && <div className={`p1-banner ${msg.type === "good" ? "good" : "bad"}`}>{msg.text}</div>}
        <div className="start-foot"><button className="s1-btn primary big" disabled={!ok || busy} onClick={pay}>{busy ? "Processing…" : `Pay ${cop(checkout.total)}`} 🔒</button></div>
      </ActShell>
    );
  }
  if (shop) {
    return (
      <ActShell icon={<Store size={22} strokeWidth={2.1} />} title={shop.store?.name || "Store"} subtitle="Add products to your cart, then checkout." onExit={() => setOpen(null)}>
        <div className="p2-hud"><span>📱 My wallet <b>{cop(balance)}</b></span></div>
        <GlobalStore store={shop.store || {}} mode="shop" reviews={shop.reviews} onCheckout={(items, total) => setCheckout({ items, total })} />
      </ActShell>
    );
  }
  return (
    <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title="Global Business Showcase 🌍" subtitle="Visit your classmates' online stores, buy with your wallet and leave star reviews." onExit={onExit}>
      <div className="p2-hud">
        <span>📱 Wallet <b>{cop(balance)}</b></span><span>🛍️ Stores visited <b>{visited.size}/{need}+</b></span>
        <button type="button" className="p1-link" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>
      {!mine && !loading && <div className="p1-banner">⚠️ Your store is not live yet. Go to <b>Part 06 · Launch my Global Store</b>.</div>}
      <div className="p3-mock-tabs">
        <button type="button" className={tab === "shop" ? "on" : ""} onClick={() => setTab("shop")}>🛍️ Stores</button>
        <button type="button" className={tab === "mine" ? "on" : ""} onClick={() => setTab("mine")}>📊 My store</button>
      </div>
      {msg && <div className={`p1-banner ${msg.type === "good" ? "good" : "bad"}`}>{msg.text}</div>}
      {loading && <p className="start-tip p1-center">Loading the Showcase…</p>}
      {!loading && tab === "shop" && (others.length === 0 ? <p className="start-tip p1-center">No other stores yet. Ask your classmates to launch theirs and press Refresh.</p> : (
        <div className="p3-stands">
          {others.map((s) => {
            const st2 = s.store || {};
            const pal = palOf(st2.brand?.palette).c;
            return (
              <button key={s.key} type="button" className={`p3-stand ${visited.has(s.key) ? "visited" : ""}`} onClick={() => setOpen(s.key)} style={{ "--c0": pal[0], "--c1": pal[1] }}>
                <div className="p3-stand-roof" />
                <LogoMark brand={{ ...(st2.brand || DEFAULT_BRAND), name: st2.name, slogan: st2.tagline }} size={54} />
                <div className="p4-stand-prods">{(st2.products || []).slice(0, 3).map((p) => <span key={p.id}>{p.e}</span>)}</div>
                {s.reviews?.length > 0 && <Stars n={s.stars} />}
                <small>{visited.has(s.key) ? "✅ You bought here" : "Visit store →"}</small>
              </button>
            );
          })}
        </div>
      ))}
      {!loading && tab === "mine" && (mine ? (
        <div className="start-block">
          <div className="p3-fin">
            <div className="win"><small>Sales</small><b>{cop(mine.sales || 0)}</b></div>
            <div><small>Orders</small><b>{mine.count || 0}</b></div>
            <div className="big"><small>Rating</small><b>{mine.reviews?.length ? `${Number(mine.stars).toFixed(1)} ★` : "—"}</b></div>
          </div>
          <div className="p4-reviews">{(mine.reviews || []).map((r, k) => <div key={k}><Stars n={r.stars} /><p>“{r.text}”</p><small>— {String(r.name || "").split(" ")[0]}</small></div>)}</div>
          {!mine.reviews?.length && <p className="start-tip">No reviews yet. Invite your classmates to visit your store!</p>}
        </div>
      ) : <p className="start-tip">Launch your store to see your sales here.</p>)}
      <div className="start-foot"><button className="s1-btn primary big" disabled={visited.size < need} onClick={() => finish(coins, { visited: visited.size, balance })}>Finish the Showcase <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
    </ActShell>
  );
}

const BOSS_YEAR = [
  { q: "Before money existed, people exchanged goods directly. This is called…", options: ["bartering", "saving", "investing"], correct: 0, feedback: "Period 1 · Bartering." },
  { q: "Which is a NEED?", options: ["Healthy lunch", "Game coins", "Gaming headphones"], correct: 0, feedback: "Needs come first." },
  { q: "You earn $40,000 and spend $28,000. How much can you save?", options: ["$12,000", "$68,000", "$28,000"], correct: 0, feedback: "Period 2 · Income − expenses." },
  { q: "A budget is…", options: ["a plan for how to use your money.", "a type of bank.", "a credit card."], correct: 0, feedback: "Plan before you spend." },
  { q: "“Do I need it, or do I just want it?” helps you…", options: ["think before spending.", "spend faster.", "share your PIN."], correct: 0, feedback: "Lina's question!" },
  { q: "An entrepreneur…", options: ["creates value by solving a problem.", "only buys things.", "never makes mistakes."], correct: 0, feedback: "Period 3 · Entrepreneurship." },
  { q: "Cost $5,000, price $8,000. Profit per unit?", options: ["$3,000", "$13,000", "−$3,000"], correct: 0, feedback: "Price − cost." },
  { q: "Who manages the budget of a company?", options: ["CFO", "CEO", "Customer Service"], correct: 0, feedback: "Chief Financial Officer." },
  { q: "What is the FIRST step in online shopping?", options: ["Search for what you want", "Checkout", "Pay"], correct: 0, feedback: "Period 4 · E-commerce." },
  { q: "During checkout, the store needs…", options: ["your address to send the package.", "your PIN in a message.", "your favorite color."], correct: 0, feedback: "Address, then payment." },
  { q: "Your balance is…", options: ["the money you have in your account.", "a type of scam.", "the price of a product."], correct: 0, feedback: "Check it before buying!" },
  { q: "“URGENT! Send your PIN to win $200,000!” is…", options: ["a scam.", "a normal bank message.", "a good offer."], correct: 0, feedback: "Pressure + prize + PIN = 🚩" },
  { q: "Cocoa grows in Côte d'Ivoire and chocolate is made in Belgium. This is…", options: ["global trade.", "bartering.", "a budget."], correct: 0, feedback: "Countries buy, sell and exchange." },
  { q: "$20,000 COP and 1 US$ = $4,000 COP. How many US dollars?", options: ["US$5", "US$80,000", "US$50"], correct: 0, feedback: "Divide: 20,000 ÷ 4,000." },
  { q: "A good digital ad is…", options: ["clear, honest and for a real customer.", "long and full of fake reviews.", "a copy of a famous ad."], correct: 0, feedback: "Clear + honest." },
  { q: "Responsible AI means…", options: ["I use it to learn and I write in my own words.", "AI does all my homework.", "I share my personal data with it."], correct: 0, feedback: "Learn more, not think less." },
];

/* ---- Self-check del año: el MISMO del Periodo 1 + radar antes vs. después ---- */
const DIMS6 = { ideas: "Money ideas", habits: "Habits", saving: "Saving", trading: "Trading" };
const DIAG6 = [
  { dim: "ideas", q: "Can you explain what money is?", options: ["Not really.", "A little, with help.", "Yes, with simple words.", "Yes, and I can give an example."] },
  { dim: "ideas", q: "Do you know how people traded before money existed?", options: ["I have no idea.", "I think they traded things, but I'm not sure.", "Yes, they used barter.", "Yes, and I can explain why it was difficult."] },
  { dim: "habits", q: "When you get money (a gift or your allowance), what do you usually do?", options: ["I spend it all very fast.", "I spend most of it.", "I keep some for later.", "I save first, then I spend a little."] },
  { dim: "habits", q: "Before you buy something, do you ask: “Do I need it or do I want it?”", options: ["Never.", "Sometimes.", "Often.", "Always."] },
  { dim: "saving", q: "Are you saving money for something special?", options: ["No.", "I want something, but I don't save for it.", "Yes, but I don't have a plan.", "Yes, and I know how much I need and when."] },
  { dim: "saving", q: "Where do you keep your money?", options: ["I don't keep money.", "In my pocket or my bag.", "In a piggy bank or a safe place.", "In a safe place, and I count it."] },
  { dim: "trading", q: "A friend wants your new notebook for his old pencil. What do you do?", options: ["I say yes fast.", "I say no and walk away.", "I think about what each thing is worth.", "I compare and I make a better offer."] },
  { dim: "trading", q: "Can one object be worth more to one person than to another person?", options: ["No, a thing is always worth the same.", "I'm not sure.", "Yes, I think so.", "Yes, and I can give an example."] },
];
function RadarCompare({ before, after }) {
  const keys = Object.keys(DIMS6);
  const size = 280, c = size / 2, r = size / 2 - 48, n = keys.length;
  const ang = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, rad) => [c + rad * Math.cos(ang(i)), c + rad * Math.sin(ang(i))];
  const shape = (sc) => keys.map((k, i) => pt(i, r * (Math.max(sc?.[k] || 0, 4) / 100)).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="p4-radar">
      {[0.25, 0.5, 0.75, 1].map((f2, k) => <polygon key={k} points={keys.map((_, i) => pt(i, r * f2).join(",")).join(" ")} className="g" />)}
      {keys.map((_, i) => { const [x, y] = pt(i, r); return <line key={i} x1={c} y1={c} x2={x} y2={y} className="g" />; })}
      {before && <polygon points={shape(before)} className="before" />}
      <polygon points={shape(after)} className="after" />
      {keys.map((k, i) => { const [x, y] = pt(i, r + 24); return <text key={k} x={x} y={y} textAnchor="middle" dominantBaseline="middle">{DIMS6[k]}</text>; })}
    </svg>
  );
}
const JOURNAL = [
  { k: "learned", l: "📚 This year I learned…", ph: "how to make a budget and protect my PIN." },
  { k: "favorite", l: "🏆 My favorite project was…", ph: "my company because I designed my own logo." },
  { k: "next", l: "🚀 Next year I want to…", ph: "save money for a bicycle." },
];
function YearCheck({ before, existing, onSave, onExit }) {
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState(existing?.answers || {});
  const [stage, setStage] = useState(existing?.scores ? "result" : "quiz");
  const [jr, setJr] = useState(existing?.journal || { learned: "", favorite: "", next: "" });
  const [st, finish] = useFinish(onSave);
  const q = DIAG6[cur];
  const scores = useMemo(() => {
    const acc = {}, cnt = {};
    DIAG6.forEach((d, i) => { acc[d.dim] = (acc[d.dim] || 0) + (answers[i] ?? 0); cnt[d.dim] = (cnt[d.dim] || 0) + 3; });
    const out = {}; Object.keys(DIMS6).forEach((k) => { out[k] = cnt[k] ? Math.round((acc[k] / cnt[k]) * 100) : 0; }); return out;
  }, [answers]);
  const avg = (s) => (s ? Math.round(Object.values(s).reduce((a, v) => a + v, 0) / Object.keys(DIMS6).length) : null);
  const a0 = avg(before), a1 = avg(scores);
  const ready = JOURNAL.every((j) => countWords(jr[j.k]) >= 4);
  if (st.done) return <Reward title="Look how much you grew! 📈" subtitle={a0 != null ? `From ${a0}% to ${a1}%.` : `Your score: ${a1}%.`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  if (stage === "quiz") {
    const answered = answers[cur] !== undefined;
    return (
      <div className="s1-quiz">
        <div className="quiz-top"><h2>🧭 My money self-check · end of year</h2><span className="quiz-count">{cur + 1} / {DIAG6.length}</span></div>
        <div className="quiz-track"><i style={{ width: `${((cur + (answered ? 1 : 0)) / DIAG6.length) * 100}%` }} /></div>
        <span className="diag-dim">{DIMS6[q.dim]}</span>
        <p className="quiz-q">{q.q}</p>
        <div className="quiz-options">
          {q.options.map((o, k) => <button key={k} type="button" className={`quiz-opt ${answers[cur] === k ? "correct" : ""}`} onClick={() => setAnswers({ ...answers, [cur]: k })}><span className="opt-key">{"ABCD"[k]}</span><span className="opt-text">{o}</span></button>)}
        </div>
        <div className="quiz-nav">
          <button className="s1-btn ghost" onClick={onExit}>Exit</button>
          <button className="s1-btn primary" disabled={!answered} onClick={() => (cur < DIAG6.length - 1 ? setCur(cur + 1) : setStage("result"))}>{cur < DIAG6.length - 1 ? "Next" : "See my growth"} <ChevronRight size={18} /></button>
        </div>
      </div>
    );
  }
  return (
    <ActShell icon={<Compass size={22} strokeWidth={2.1} />} title="My growth this year 📈" subtitle="The same self-check from the first class — now, at the end of the year." onExit={onExit}>
      <div className="p4-growth">
        <div className="p4-growth-radar">
          <RadarCompare before={before} after={scores} />
          <div className="p4-legend">{before && <span><i className="before" /> First class</span>}<span><i className="after" /> Today</span></div>
        </div>
        <div className="p4-growth-bars">
          {Object.keys(DIMS6).map((k) => (
            <div key={k} className="p4-gbar">
              <span>{DIMS6[k]}</span>
              <div>{before && <i className="before" style={{ width: `${before[k] || 0}%` }} />}<i className="after" style={{ width: `${scores[k]}%` }} /></div>
              <b>{before ? `${before[k] || 0}% → ${scores[k]}%` : `${scores[k]}%`}</b>
            </div>
          ))}
          <div className="p3-score"><small>{a0 != null ? "From the first class to today" : "My score today"}</small><b>{a0 != null ? `${a0}% → ${a1}%` : `${a1}%`}</b>{a0 != null && <small>{a1 - a0 >= 0 ? `+${a1 - a0} points of growth 🚀` : "Keep practicing — you know more than you think!"}</small>}</div>
          {!before && <p className="start-tip">We couldn't find your first self-check (Period 1). This is your photo today.</p>}
        </div>
      </div>
      <div className="start-block">
        <h3><BookOpen size={18} /> My Digital Learning Journal (3 short sentences)</h3>
        {JOURNAL.map((j) => <label key={j.k} className="p3-lbl">{j.l}<input className="start-input" value={jr[j.k]} onChange={(e) => setJr({ ...jr, [j.k]: e.target.value })} placeholder={j.ph} /></label>)}
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { answers, scores, average: a1, before, beforeAvg: a0, journal: jr })}>Save my growth <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* ---- Year Wrapped: resumen animado del año ---- */
const FAV = ["🔄 The CREAR Market", "🛍️ The CREAR Shop", "🚀 My company", "🎨 The Logo Lab", "🎪 The Fair", "📱 The Wallet Challenge", "🌍 The Global Showcase"];
function YearWrapped({ userData, API_URL, periods, company, store, growth, existing, onSave, onExit }) {
  const [i, setI] = useState(0);
  const [fav, setFav] = useState(existing?.favorite || "");
  const [mine, setMine] = useState(null);
  const [busy, setBusy] = useState(false);
  const [st, finish] = useFinish(onSave);
  useEffect(() => {
    let alive = true;
    fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "global_list", user_key: userData.Student_Key, nombre: userData.Nombre_Completo, grado: GRADE }) })
      .then((r) => r.json()).then((d) => { if (alive && d?.stores) setMine(d.stores.find((s) => s.key === userData.Student_Key) || null); }).catch(() => {});
    return () => { alive = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const first = (userData?.Nombre_Completo || "Student").split(" ")[0];
  const totalCoins = periods.reduce((a, p) => a + p.coins, 0);
  const maxC = Math.max(1, ...periods.map((p) => p.coins));
  const slides = [
    <div key="0" className="p4-wr s0"><small>FINFLUENT · GRADE 6</small><h2>{first}, this was your money year 🎉</h2><div className="p4-wr-big">🪙 {totalCoins.toLocaleString("en-US")}</div><p>coins earned in 4 periods</p></div>,
    <div key="1" className="p4-wr s1w"><small>YOUR COINS, PERIOD BY PERIOD</small><div className="p4-wr-bars">{periods.map((p) => <div key={p.k}><i style={{ height: `${(p.coins / maxC) * 100}%` }}><b>{p.coins}</b></i><span>{p.e}<small>{p.label}</small></span></div>)}</div></div>,
    <div key="2" className="p4-wr s2"><small>YOU BUILT A COMPANY</small><div className="p4-wr-logo"><LogoMark brand={company.brand} size={96} /></div><p>{company.value || "From a problem to a real idea."}</p></div>,
    <div key="3" className="p4-wr s3"><small>…AND IT WENT GLOBAL 🌍</small><h2>{store.products.length} product{store.products.length === 1 ? "" : "s"} online</h2><p>{store.markets.length ? `Prices in ${store.markets.join(" · ")}` : "Ready for the world"}</p>{mine && <div className="p4-wr-stats"><span><b>{cop(mine.sales || 0)}</b>sales</span><span><b>{mine.count || 0}</b>orders</span><span><b>{mine.reviews?.length ? Number(mine.stars).toFixed(1) + "★" : "—"}</b>rating</span></div>}</div>,
    <div key="4" className="p4-wr s4"><small>YOU GREW 📈</small>{growth?.before ? <h2>{growth.beforeAvg}% → {growth.average}%</h2> : <h2>{growth?.average != null ? `${growth.average}%` : "Do the self-check!"}</h2>}<p>{growth?.before ? "From your first class to today." : "Complete “My growth this year” to see it here."}</p></div>,
    <div key="5" className="p4-wr s5"><small>YOUR FAVORITE MOMENT</small><div className="p1-starters">{FAV.map((x) => <button key={x} type="button" className={`p1-chip ${fav === x ? "on" : ""}`} onClick={() => setFav(x)}>{x}</button>)}</div><h3>{fav ? `${fav} ❤️` : "Choose one!"}</h3></div>,
  ];
  const card = (
    <div className="p4-yearcard" id="p4-yearcard">
      <small>MY FINFLUENT YEAR · INSTITUTO CREAR · GRADE 6</small>
      <h2>{userData?.Nombre_Completo}</h2>
      <div className="p4-yearcard-row">
        <span><b>🪙 {totalCoins.toLocaleString("en-US")}</b>coins</span>
        <span><LogoMark brand={{ ...company.brand, slogan: "" }} size={40} row /></span>
        <span><b>{store.products.length}</b>products online</span>
        <span><b>{growth?.before ? `+${(growth.average || 0) - (growth.beforeAvg || 0)}` : growth?.average ?? "—"}</b>{growth?.before ? "growth points" : "self-check %"}</span>
      </div>
      {fav && <p>❤️ Favorite moment: <b>{fav}</b></p>}
    </div>
  );
  if (st.done) return <Reward title="What a year! 🏆" subtitle="Thank you for learning with FinFluent." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Gift size={22} strokeWidth={2.1} />} title="My FinFluent Year · Wrapped 🎁" subtitle="Your whole year in 6 slides." onExit={onExit}>
      <div className="p4-wr-wrap">
        <div className="p4-wr-dots">{slides.map((_, k) => <i key={k} className={k <= i ? "on" : ""} />)}</div>
        {slides[i]}
        <div className="p4-wr-nav">
          <button type="button" className="s1-btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}><ArrowLeft size={16} /> Back</button>
          {i < slides.length - 1 && <button type="button" className="s1-btn primary" onClick={() => setI(i + 1)}>Next <ChevronRight size={16} /></button>}
        </div>
      </div>
      {i === slides.length - 1 && (
        <>
          {card}
          <div className="p3-card-actions"><button className="s1-btn ghost" disabled={busy} onClick={async () => { setBusy(true); try { await downloadNode("p4-yearcard", `FinFluent_Year_${first}.png`); } catch (e) { /* sin imagen */ } setBusy(false); }}><Download size={17} /> {busy ? "Creating…" : "Download my year card"}</button></div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!fav} onClick={() => finish(30, { favorite: fav, totalCoins })}>Close my year 🎉 <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   ESTRUCTURA DEL PERIODO (7 clases · 33 a 42)
   ===================================================================== */
const P4_WEEKS = [
  { n: 1, g: "33", title: "Money & technology today", blurb: "From shells to phones — the story of the year.", e: "📱", skills: ["Reading", "Writing"], acts: [
    { key: "w33_read", title: "Reading: From Shells to Phones", desc: "The story of money + 6 questions.", icon: <BookOpen size={22} />, coins: 34, bucket: "quizzes", topics: ["Bartering", "Cards", "Digital wallets"] },
    { key: "w33_timeline", title: "G5 · Timeline Builder", desc: "Order the history of money + benefits.", icon: <Clock size={22} />, coins: 40, bucket: "quizzes" },
    { key: "w33_cash", title: "Cash or Click?", desc: "5 missions: which payment is best?", icon: <Smartphone size={22} />, coins: 30, bucket: "quizzes" },
    { key: "w33_write", title: "Writing: Technology changed money because…", desc: "Build your draft + add your own idea.", icon: <PenLine size={22} />, coins: 25, bucket: "aprendi" },
  ] },
  { n: 2, g: "34", title: "E-commerce", blurb: "How an online store works — then open YOURS.", e: "🛒", skills: ["Listening", "Speaking"], acts: [
    { key: "w34_video", title: "Video: How online shopping works", desc: "Watch + 10 questions (70% to pass).", icon: <Video size={22} />, coins: 50, bucket: "quizzes" },
    { key: "w34_steps", title: "G5 · How an online order travels", desc: "Put 9 steps in order.", icon: <Truck size={22} />, coins: 28, bucket: "quizzes" },
    { key: "w34_speak", title: "Speaking: Explain the steps", desc: "First… Next… Then… Finally…", icon: <Mic size={22} />, coins: 20, bucket: "aprendi" },
    { key: "w34_store", title: "Part 01 · Open my online store", desc: "Your Period 3 company goes online!", icon: <Store size={22} />, coins: 40, bucket: "aprendi", topics: ["Brand", "3 products", "Prices"] },
  ] },
  { n: 3, g: "35–36", title: "Digital wallets & safe shopping", blurb: "Control your spending in an app — and stop the scammers.", e: "💳", skills: ["Reading", "Speaking"], acts: [
    { key: "w35_read", title: "Reading: Lina Checks Her App", desc: "Balance, transactions, expenses.", icon: <BookOpen size={22} />, coins: 30, bucket: "quizzes" },
    { key: "w35_wallet", title: "Digital Wallet Challenge 📱", desc: "$100,000 · shop · surprise cards · report.", icon: <Wallet size={22} />, coins: 45, bucket: "aprendi", topics: ["Shop", "Surprise!", "Report"] },
    { key: "w35_detective", title: "Transaction Detective 🧾", desc: "Where did Lina's money go?", icon: <Search size={22} />, coins: 24, bucket: "quizzes" },
    { key: "w35_scam", title: "G10 · Scam Detective 🕵️", desc: "Find the red flags 🚩", icon: <ShieldAlert size={22} />, coins: 40, bucket: "quizzes" },
    { key: "w35_escape", title: "Security Escape Room 🔐", desc: "Open 4 locks.", icon: <KeyRound size={22} />, coins: 30, bucket: "quizzes" },
    { key: "w35_rules", title: "Part 02 · Safe Shop badge", desc: "My 3 rules + how customers pay.", icon: <ShieldCheck size={22} />, coins: 30, bucket: "aprendi" },
  ] },
  { n: 4, g: "37", title: "Global markets", blurb: "Where do things come from? The journey of a chocolate bar.", e: "🌍", skills: ["Reading", "Writing"], acts: [
    { key: "w37_read", title: "Reading: The Journey of a Chocolate Bar", desc: "Farm → factory → ship → shop.", icon: <BookOpen size={22} />, coins: 26, bucket: "quizzes" },
    { key: "w37_tour", title: "G9 · World Tour Passport 🛂", desc: "4 stops + product ↔ country.", icon: <Globe size={22} />, coins: 34, bucket: "quizzes" },
    { key: "w37_chain", title: "Supply Chain + Product Detective", desc: "Order the chain, solve the mysteries.", icon: <Truck size={22} />, coins: 30, bucket: "quizzes" },
    { key: "w37_journey", title: "Part 03 · My product's journey", desc: "4 steps for YOUR product.", icon: <MapIcon size={22} />, coins: 30, bucket: "aprendi" },
  ] },
  { n: 5, g: "38", title: "World currencies", blurb: "Sell to an international customer.", e: "💱", skills: ["Listening", "Speaking"], acts: [
    { key: "w38_video", title: "Video: Currencies of the world", desc: "Dollars, pounds, euros…", icon: <Video size={22} />, coins: 10, bucket: "comportamiento" },
    { key: "w38_convert", title: "Currency Converter Challenge", desc: "Divide and multiply like a banker.", icon: <Calculator size={22} />, coins: 30, bucket: "quizzes" },
    { key: "w38_prices", title: "Part 04 · My world prices", desc: "“Our product costs ___ in ___.”", icon: <Globe size={22} />, coins: 35, bucket: "aprendi" },
  ] },
  { n: 6, g: "39–40", title: "Digital marketing & AI", blurb: "A good digital ad + responsible AI.", e: "📣", skills: ["Reading", "Writing"], acts: [
    { key: "w39_read", title: "Reading: A Good Digital Ad", desc: "Read + good ad or dishonest ad?", icon: <BookOpen size={22} />, coins: 20, bucket: "quizzes" },
    { key: "w39_ai", title: "Responsible AI 🤖", desc: "A helper, not a cheater.", icon: <Bot size={22} />, coins: 20, bucket: "comportamiento" },
    { key: "w39_customer", title: "My customer profile", desc: "Who will see your ad?", icon: <Target size={22} />, coins: 25, bucket: "aprendi" },
    { key: "w39_ad", title: "Part 05 · Ad Maker", desc: "Your digital poster.", icon: <Megaphone size={22} />, coins: 40, bucket: "aprendi" },
  ] },
  { n: 7, g: "41–42", title: "Global Business Showcase", blurb: "Launch, shop, review — and see how much you grew.", e: "🏆", skills: ["Speaking", "Listening"], acts: [
    { key: "w41_store", title: "Part 06 · Launch my Global Store", desc: "Your store builds itself!", icon: <Rocket size={22} />, coins: 50, bucket: "aprendi" },
    { key: "w41_market", title: "Global Business Showcase 🌍", desc: "Shop with your wallet + star reviews.", icon: <Store size={22} />, coins: 45, bucket: "comportamiento" },
    { key: "w42_boss", title: "Final Boss Battle ⚔️", desc: "12 questions from the WHOLE year.", icon: <Swords size={22} />, coins: 58, bucket: "quizzes" },
    { key: "w42_growth", title: "My growth this year 📈", desc: "Same self-check as class 1 + radar.", icon: <Compass size={22} />, coins: 30, bucket: "comportamiento" },
    { key: "w42_wrapped", title: "My FinFluent Year · Wrapped 🎁", desc: "Your year in 6 slides.", icon: <Gift size={22} />, coins: 30, bucket: "comportamiento" },
  ] },
];
const ALL_ACTS = P4_WEEKS.flatMap((w) => w.acts);
const TOTAL_ACTS = ALL_ACTS.length;

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Periodo4 = ({ userData, API_URL, existingRow, onBack }) => {
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

  // Lo que el estudiante construyó antes (solo lectura)
  const name = userData?.Nombre_Completo || "Student";
  const p3resp = parse(store.semanas?.P3?.Respuestas_JSON);
  const p1resp = parse(store.semanas?.P1?.Respuestas_JSON);
  const company = buildCompany(p3resp, name);
  const gstore = buildStore(respRef.current, company);
  const rowCoins = (r) => Math.round(parseFloat(r?.Puntos_Comportamiento || 0) + parseFloat(r?.Puntos_Quizzes || 0) + parseFloat(r?.Puntos_Aprendi || 0));

  const doneCount = ALL_ACTS.filter((a) => checklist[a.key]).length;
  const pct = Math.round((doneCount / TOTAL_ACTS) * 100);
  const weekDone = (w) => w.acts.every((a) => checklist[a.key]);
  const coinsTotal = Math.round(points.comportamiento + points.quizzes + points.aprendi);
  const periods = [
    { k: "P1", e: "🪙", label: "P1 · Money", coins: rowCoins(store.semanas?.P1) },
    { k: "P2", e: "🐖", label: "P2 · My plan", coins: rowCoins(store.semanas?.P2) },
    { k: "P3", e: "🚀", label: "P3 · My company", coins: rowCoins(store.semanas?.P3) },
    { k: "P4", e: "🌍", label: "P4 · Global", coins: coinsTotal },
  ];

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
      .catch((e) => { console.error("Error guardando Periodo 4:", e); dispatch({ type: "rollback_progreso", payload: { Semana: PERIOD_KEY, prev } }); });
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
    let view = null;

    switch (act) {
      case "w33_read": view = (
        <ReadThen tag="READING · A2 · MONEY & TECHNOLOGY" title="From Shells to Phones" subtitle="The story of money" minutes={6} sections={READ_W33} glossary={GLOSS_W33} onExit={exit} finishLabel="I read it — check my understanding">
          <QuizRunner title="Reading check" emoji="📱" questions={Q_W33} pickCount={6} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "w33_timeline": view = <TimelineBuilder onSave={save} onExit={exit} />; break;
      case "w33_cash": view = <CashOrClick onSave={save} onExit={exit} />; break;
      case "w33_write": view = <TechWriter existing={resp.w33_write} onSave={save} onExit={exit} />; break;

      case "w34_video": view = <VideoQuiz src={VIDEO_ECOMMERCE} title="Video check: online shopping" questions={Q_W34} pickCount={10} onSave={save} onExit={exit} />; break;
      case "w34_steps": view = <OnlineOrderGame onSave={save} onExit={exit} />; break;
      case "w34_speak": view = <FrameWriter title="Speaking: How does online shopping work?" subtitle="Complete the sentences. Then explain the steps to a partner." frames={[
        { frame: "First, you", ph: "search for what you want." },
        { frame: "Next, you", ph: "add the item to your cart." },
        { frame: "Then, you", ph: "write your address and pay with a grown-up." },
        { frame: "Finally,", ph: "the package travels to your home." },
        { frame: "Rule number one is", ph: "always ask a grown-up for help." },
      ]} existing={resp.w34_speak} onSave={save} onExit={exit} />; break;
      case "w34_store": view = <StoreBuilder company={company} existing={resp.w34_store} onSave={save} onExit={exit} />; break;

      case "w35_read": view = (
        <ReadThen tag="READING · A2 · DIGITAL WALLETS" title="Lina Checks Her App" subtitle="Check, think, protect" minutes={5} sections={READ_W35} glossary={GLOSS_W35} onExit={exit} finishLabel="I read it — check my understanding">
          <QuizRunner title="Lina's app check" emoji="📱" questions={Q_W35} pickCount={5} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "w35_wallet": view = <WalletChallenge existing={resp.w35_wallet} onSave={save} onExit={exit} />; break;
      case "w35_detective": view = <NumberRounds icon={<Search size={22} />} title="Transaction Detective 🧾" subtitle="Read Lina's history. Where did the money go?" rounds={DETECTIVE_ROUNDS} coinsPer={3} bonus={6} doneTitle="Money detective! 🔍" onSave={save} onExit={exit} />; break;
      case "w35_scam": view = <ScamDetective onSave={save} onExit={exit} />; break;
      case "w35_escape": view = <EscapeRoom onSave={save} onExit={exit} />; break;
      case "w35_rules": view = <SafeShopRules store={gstore} existing={resp.w35_rules} onSave={save} onExit={exit} />; break;

      case "w37_read": view = (
        <ReadThen tag="READING · A2 · GLOBAL MARKETS" title="The Journey of a Chocolate Bar" subtitle="From the farm to your hand" minutes={6} sections={READ_W37} glossary={GLOSS_W37} onExit={exit} finishLabel="I read it — check my understanding">
          <QuizRunner title="Chocolate check" emoji="🍫" questions={Q_W37} pickCount={4} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "w37_tour": view = <WorldTour onSave={save} onExit={exit} />; break;
      case "w37_chain": view = <SupplyChain onSave={save} onExit={exit} />; break;
      case "w37_journey": view = <ProductJourney store={gstore} existing={resp.w37_journey} onSave={save} onExit={exit} />; break;

      case "w38_video": view = <MediaCheck src={VIDEO_CURRENCIES} icon={<Video size={22} />} title="Currencies of the world" subtitle="Listen for: dollar, pound, euro…" tip="🎧 Which English-speaking countries use a dollar? Which one uses the pound?" coins={10} doneLabel="I watched it!" onSave={save} onExit={exit} />; break;
      case "w38_convert": view = <NumberRounds icon={<Calculator size={22} />} title="Currency Converter Challenge" subtitle="An international customer wants to buy. Convert!" intro={CONVERT_INTRO} rounds={CONVERT_ROUNDS} coinsPer={3} bonus={6} doneTitle="Banker brain! 💱" onSave={save} onExit={exit} />; break;
      case "w38_prices": view = <WorldPrices store={gstore} existing={resp.w38_prices} onSave={save} onExit={exit} />; break;

      case "w39_read": view = (
        <ReadThen tag="READING · A2 · DIGITAL MARKETING" title="A Good Digital Ad" subtitle="Clear, honest, for a real customer" minutes={4} sections={READ_W39} glossary={GLOSS_W39} onExit={exit} finishLabel="I read it — let's judge some ads!">
          <SortActivity icon={<Megaphone size={22} />} title="Good ad or dishonest ad?" subtitle="Would a responsible business publish this?" buckets={ADS_SORT} items={ADS_ITEMS} per={2} bonus={4} doneTitle="Ad judge! 📣" onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "w39_ai": view = (
        <ReadThen tag="MINI LESSON · A2 · RESPONSIBLE AI" title="AI: a helper, not a cheater" subtitle="Learn more, not think less" minutes={2} sections={READ_AI} onExit={exit} finishLabel="I understand — let's sort!">
          <SortActivity icon={<Bot size={22} />} title="Responsible AI or not?" subtitle="Sort 8 ways of using AI." buckets={AI_SORT} items={AI_ITEMS} per={2} bonus={4} doneTitle="Responsible AI user! 🤖" onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "w39_customer": view = <CustomerProfile company={company} existing={resp.w39_customer} onSave={save} onExit={exit} />; break;
      case "w39_ad": view = gstore.products.length
        ? <AdMaker store={gstore} customer={resp.w39_customer} existing={resp.w39_ad} onSave={save} onExit={exit} />
        : <ActShell icon={<Megaphone size={22} />} title="Part 05 · Ad Maker" onExit={exit}><div className="p1-banner bad">First open your online store (Class 34 · Part 01).</div></ActShell>; break;

      case "w41_store": view = <StoreLaunch store={gstore} userData={userData} API_URL={API_URL} onSave={save} onExit={exit} onJump={(k) => setAct(k)} />; break;
      case "w41_market": view = <ShowcaseMarket userData={userData} API_URL={API_URL} onSave={save} onExit={exit} />; break;
      case "w42_boss": view = <QuizRunner title="Final Boss Battle · The whole year" emoji="⚔️" questions={BOSS_YEAR} pickCount={12} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />; break;
      case "w42_growth": view = <YearCheck before={p1resp.w1_diag?.scores || null} existing={resp.w42_growth} onSave={save} onExit={exit} />; break;
      case "w42_wrapped": view = <YearWrapped userData={userData} API_URL={API_URL} periods={periods} company={company} store={gstore} growth={resp.w42_growth} existing={resp.w42_wrapped} onSave={save} onExit={exit} />; break;
      default: view = null;
    }
    return <div className="s1 p1 p2 p3 p4">{view}</div>;
  }

  /* ---------- SEMANA ABIERTA ---------- */
  if (week) {
    const w = P4_WEEKS.find((x) => x.n === week);
    const wDone = w.acts.filter((a) => checklist[a.key]).length;
    const next = P4_WEEKS.find((x) => x.n === w.n + 1);
    return (
      <div className="s1 p1 p2 p3 p4">
        <button className="s1-back" onClick={() => setWeek(null)}><ArrowLeft size={18} strokeWidth={2.4} /> Back to Period 4</button>
        <div className="s1-hero p1-week-hero p4-hero">
          <span className="s1-tag">{w.e} PERIOD 4 · CLASS {w.g}</span>
          <h1>{w.title}</h1>
          <p>{w.blurb}</p>
          <div className="s1-progress"><div className="bar"><i style={{ width: `${(wDone / w.acts.length) * 100}%` }} /></div><span className="pill">{wDone}/{w.acts.length}</span></div>
        </div>
        <StoreMini store={gstore} compact />
        <div className="s1-quest">
          {w.acts.map((a) => (
            <div key={a.key} className={`act-card ${checklist[a.key] ? "done" : ""} ${a.title.startsWith("Part 0") ? "p3-part-act" : ""}`}>
              <div className="act-ico">{checklist[a.key] ? <Check size={22} strokeWidth={3} /> : a.icon}</div>
              <div className="act-main">
                <h3>{a.title}</h3><p>{a.desc}</p>
                {a.topics && <div className="act-topics">{a.topics.map((t) => <span key={t}>{t}</span>)}</div>}
              </div>
              {checklist[a.key]
                ? <button className="act-cta done" onClick={() => setAct(a.key)}>{a.title.startsWith("Part 0") ? "Edit ✏️" : "Done ✓"}</button>
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
    <div className="s1 p1 p2 p3 p4">
      <button className="s1-back" onClick={onBack}><ArrowLeft size={18} strokeWidth={2.4} /> Back to overview</button>

      <div className="s1-hero p1-hero p4-hero">
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> ADMIN PREVIEW · GRADE {GRADE} · PERIOD 4</span>
        <h1>My Company Goes Global</h1>
        <p>How can technology help my business grow — safely, honestly and around the world?</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pct}%` }} /></div><span className="pill">{pct}%</span></div>
        <div className="p1-hero-chips">
          <span><Coins size={14} /> {coinsTotal} coins</span>
          <span><Check size={14} /> {doneCount}/{TOTAL_ACTS} activities</span>
          <span>🌍 Pay · Protect · Trade · Launch</span>
          <span>🎯 SDG 8 · SDG 9 · SDG 12</span>
        </div>
      </div>

      <StoreMini store={gstore} />
      {checklist.w41_store && (
        <button type="button" className="p3-card-link" onClick={() => setAct("w41_store")}><Store size={18} /> See my Global Store <ChevronRight size={16} /></button>
      )}

      <div className="p1-passport">
        <div className="p1-passport-head"><b>🌍 Global Passport</b><span>Finish a class to get its stamp</span></div>
        <div className="p1-stamps">
          {P4_WEEKS.map((w) => (
            <button key={w.n} type="button" className={`p1-stamp ${weekDone(w) ? "done" : ""}`} onClick={() => setWeek(w.n)} title={w.title}>
              <em>{w.e}</em><small>{w.g}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="p1-weeks">
        {P4_WEEKS.map((w) => {
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

/* Panel "Mi tienda en construcción" */
function StoreMini({ store, compact }) {
  const done = store.parts.filter((p) => p.done).length;
  return (
    <div className={`p3-mini ${compact ? "compact" : ""}`}>
      <LogoMark brand={{ ...store.brand, name: store.name, slogan: store.tagline }} size={compact ? 54 : 78} row />
      <div className="p3-mini-info">
        <small>MY GLOBAL STORE · {done}/6 parts built</small>
        <div className="p3-mini-bar"><i style={{ width: `${(done / 6) * 100}%` }} /></div>
        {!compact && <div className="p3-parts">{store.parts.map((p) => <span key={p.id} className={p.done ? "on" : ""}><b>{p.n}</b>{p.label}</span>)}</div>}
      </div>
    </div>
  );
}