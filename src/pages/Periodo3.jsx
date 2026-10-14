import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft, BookOpen, Video, Check, X, Coins, Trophy, Sparkles, Clock, ChevronRight, Lightbulb, Play,
  PenLine, KeyRound, Star, Users, Lock, Store, Scale, RefreshCw, Award, Puzzle, Mic, Target, Calculator,
  ShieldCheck, Plus, Trash2, Search, Swords, Rocket, MessageCircle, Palette, Building2, Hammer, Download,
  Printer, Shuffle, Timer, Briefcase, Heart, Megaphone, Wrench, Map as MapIcon,
} from "lucide-react";
import "../Styles/semana1.css";   // botones, quiz, reward, monedas (misma gamificación)
import "../Styles/periodo1.css";  // piezas del Periodo 1 (match, sort, postal…)
import "../Styles/periodo2.css";  // piezas del Periodo 2 (dinero, stats, juegos…)
import "../Styles/periodo3.css";  // estilos nuevos del Periodo 3
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   PERIODO 3 · YOUNG ENTREPRENEURS LAB  (Grado 6 · A2)
   8 clases de construcción (22–32). Cada estudiante construye SU empresa:
   cada misión guarda una pieza y la tarjeta final se arma sola.
   Todo se guarda en UNA fila de Progreso_Semanas: Semana = "P3".
   ===================================================================== */

const PERIOD_KEY = "P3";
const GRADE = "6";

const VIDEO_ENTREPRENEUR = "https://res.cloudinary.com/y9r84vgz/video/upload/v1791994337/videoplayback_7.mp4";
const IMG_LOGOS = "https://i.pinimg.com/736x/69/b3/4f/69b34f9db06c6bd990f34d33781854ce.jpg";

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

/* Rueda tipo tragamonedas para generar combinaciones */
function SlotReels({ reels, values, spinning }) {
  return (
    <div className="p3-slots">
      {reels.map((r, i) => (
        <div key={r.label} className={`p3-reel ${spinning ? "spin" : ""}`}>
          <small>{r.label}</small>
          <b>{spinning ? r.items[(Date.now() / 90 + i * 3) % r.items.length | 0] : values[i] || "?"}</b>
        </div>
      ))}
    </div>
  );
}
function useSpinner(reels) {
  const [values, setValues] = useState(reels.map(() => ""));
  const [spinning, setSpinning] = useState(false);
  const [, tick] = useState(0);
  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    const id = setInterval(() => tick((x) => x + 1), 80);
    setTimeout(() => {
      clearInterval(id);
      setValues(reels.map((r) => r.items[Math.floor(Math.random() * r.items.length)]));
      setSpinning(false);
    }, 1200);
  };
  return { values, setValues, spinning, spin };
}

/* =====================================================================
   CLASE 22 · MEET THE ENTREPRENEUR
   ===================================================================== */
const READ_C1 = [
  { h: "What Is an Entrepreneur?" },
  { p: "An entrepreneur is a person who creates a business or develops an idea to solve a problem. Entrepreneurs look for opportunities and find new ways to help people." },
  { p: "A good entrepreneur can be creative, curious, brave, responsible, and persistent. They listen to others, make plans, and learn from mistakes." },
  { p: "An entrepreneur does not need to have a lot of money to start. A student can begin with a simple idea, such as making reusable bags, designing school notebooks, or offering a tutoring service." },
  { sub: "🇨🇴 Entrepreneurship in Colombia" },
  { p: "In Colombia, Law 1014 of 2006 promotes a culture of entrepreneurship. It encourages people to develop entrepreneurial skills and turn ideas into opportunities. Schools can teach students to think like entrepreneurs — just like you are doing now!" },
  { box: "Remember: an entrepreneur does not only sell products. An entrepreneur creates value for people." },
];
const GLOSS_C1 = {
  "entrepreneur": "Emprendedor/a — persona que crea un negocio o una idea para resolver un problema.",
  "opportunity": "Oportunidad.",
  "persistent": "Persistente — no se rinde.",
  "value": "Valor — algo útil o importante para las personas.",
  "law": "Ley.",
};
const Q_C1 = [
  { q: "What is an entrepreneur?", options: ["A person who creates a business or an idea to solve a problem.", "A person who only buys things.", "A person who works in a bank."], correct: 0, feedback: "Entrepreneurs solve problems with ideas." },
  { q: "Do you need a lot of money to start?", options: ["No, you can start with a simple idea.", "Yes, always.", "Only if you are an adult."], correct: 0, feedback: "A student can start with a simple idea." },
  { q: "Which law promotes entrepreneurship in Colombia?", options: ["Law 1014 of 2006", "Law 100 of 1993", "Law 2000 of 2020"], correct: 0, feedback: "Law 1014 of 2006 — culture of entrepreneurship." },
  { q: "An entrepreneur creates…", options: ["value for people.", "problems for people.", "only money."], correct: 0, feedback: "Value first!" },
];

function VideoNotes({ onSave, onExit }) {
  const [heard, setHeard] = useState(false);
  const [notes, setNotes] = useState(["", "", ""]);
  const [st, finish] = useFinish(onSave);
  const track = (e) => { const m = e.currentTarget; if (m.duration && m.currentTime / m.duration > 0.9) setHeard(true); };
  const frames = ["The entrepreneur's idea is…", "The problem they solve is…", "One skill they have is…"];
  const ready = heard && notes.every((n) => countWords(n) >= 2);
  if (st.done) return <Reward title="Great listening! 🎬" subtitle="You met a real young entrepreneur." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Video size={22} strokeWidth={2.1} />} title="Meet a young entrepreneur" subtitle="Watch the video. Then write 3 quick notes." onExit={onExit}>
      <div className="video-frame"><video src={VIDEO_ENTREPRENEUR} controls playsInline preload="metadata" controlsList="nodownload" onEnded={() => setHeard(true)} onTimeUpdate={track} /></div>
      <p className="video-hint">🎧 You can watch it twice. Listen for: idea · problem · skills.</p>
      {frames.map((f, i) => (
        <div key={f} className="start-block p1-nego">
          <div className="p1-nego-row">
            <span className="p1-frame">{f}</span>
            <input className="start-input" value={notes[i]} onChange={(e) => setNotes(notes.map((n, k) => (k === i ? e.target.value : n)))} placeholder="Write 2+ words" />
          </div>
        </div>
      ))}
      {!heard && <p className="start-tip p1-center">Finish the video to unlock the button.</p>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(20, { notes })}>Save my notes <span className="coin-tag"><Coins size={15} /> +20</span></button></div>
    </ActShell>
  );
}

const DNA = [
  { a: "🎨 Creative", b: "Lina makes bracelets with old plastic bottles." },
  { a: "🤝 Responsible", b: "Tomás delivers every order on time." },
  { a: "🔁 Persistent", b: "Sara's cake fails, so she tries a new recipe." },
  { a: "🦁 Brave", b: "Pablo presents his idea to 100 people." },
  { a: "🔎 Curious", b: "Mía asks her classmates what they need." },
  { a: "👂 Good listener", b: "Juan changes his design after hearing customers." },
];
function EntrepreneurDNA({ onSave, onExit }) {
  const [st, finish] = useFinish(onSave);
  const [round, setRound] = useState(0);
  if (st.done) return <Reward title="Entrepreneur DNA unlocked! 🧬" subtitle="You know the skills of an entrepreneur." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Sparkles size={22} strokeWidth={2.1} />} title="Entrepreneur DNA 🧬" subtitle="Match each skill with a person who shows it." onExit={onExit}>
      <div className="start-block">
        <MatchPairs key={round} pairs={DNA} leftLabel="Skills" rightLabel="Situations" onRestart={() => setRound((r) => r + 1)} onDone={(r) => finish(r.firstTry * 3 + 4, r)} />
      </div>
    </ActShell>
  );
}

const IDEA_REELS = [
  { label: "Problem", items: ["Students lose their pencils", "Too much plastic at school", "Kids are bored at break", "Dogs need walks", "Old clothes nobody uses", "Students need help with math", "No healthy snacks", "Messy backpacks"] },
  { label: "Customer", items: ["school students", "busy families", "teachers", "pet owners", "little kids", "neighbors", "sports teams"] },
  { label: "Skill", items: ["creative", "curious", "brave", "responsible", "persistent", "good listener"] },
];
function IdeaSpinner({ onSave, onExit }) {
  const { values, spinning, spin } = useSpinner(IDEA_REELS);
  const [left, setLeft] = useState(null);
  const [idea, setIdea] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [best, setBest] = useState(null);
  const [st, finish] = useFinish(onSave);
  useEffect(() => {
    if (left === null || left <= 0) return;
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);
  const doSpin = () => { spin(); setIdea(""); setTimeout(() => setLeft(30), 1250); };
  const keep = () => { if (countWords(idea) < 6) return; setIdeas([...ideas, { combo: values, idea }]); setIdea(""); setLeft(null); };
  const ready = ideas.length >= 2 && best !== null;
  if (st.done) return <Reward title="Idea machine! 💡" subtitle={`You created ${ideas.length} business ideas.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Shuffle size={22} strokeWidth={2.1} />} title="The Idea Machine 🎰" subtitle="Spin! Problem + customer + skill. You have 30 seconds for an idea." onExit={onExit}>
      <SlotReels reels={IDEA_REELS} values={values} spinning={spinning} />
      <div className="p1-center"><button className="s1-btn primary big p3-spin-btn" disabled={spinning || ideas.length >= 3} onClick={doSpin}>🎰 {values[0] ? "Spin again" : "Spin the machine"}</button></div>
      {values[0] && !spinning && left !== null && (
        <div className="start-block">
          <div className="p2-hud"><span className={left <= 10 ? "p2-hot" : ""}>⏱️ <b>{Math.max(0, left)}s</b></span><span>Ideas <b>{ideas.length}/3</b></span></div>
          <p className="start-tip"><b>{values[0]}</b> · for <b>{values[1]}</b> · you are <b>{values[2]}</b>. What business can you create?</p>
          <Starters items={["My business idea is…", "I can help … by …", "I will sell / offer…"]} onPick={appendStarter(setIdea)} />
          <WordField value={idea} onChange={setIdea} min={6} max={40} rows={2} placeholder="My business idea is…" />
          <div className="start-foot"><button className="s1-btn primary" disabled={countWords(idea) < 6} onClick={keep}>Keep this idea 💡</button></div>
        </div>
      )}
      {ideas.length > 0 && (
        <div className="start-block">
          <h3><Lightbulb size={18} /> My ideas — choose your favorite ⭐</h3>
          {ideas.map((it, i) => (
            <button key={i} type="button" className={`p3-idea ${best === i ? "on" : ""}`} onClick={() => setBest(i)}>
              <small>{it.combo.join(" · ")}</small><span>{it.idea}</span>{best === i && <b>⭐ Favorite</b>}
            </button>
          ))}
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(25, { ideas, best: ideas[best] })}>Save my ideas <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
    </ActShell>
  );
}

const AVATARS = ["🧑‍🚀", "🦸", "🧑‍💻", "🧑‍🎨", "🧑‍🔬", "🧑‍🍳", "🦊", "🐯", "🦉", "🐼"];
const SKILLS = ["Creative", "Curious", "Brave", "Responsible", "Persistent", "Good listener", "Organized", "Friendly", "Leader"];
function ProfileCard({ studentName, spinner, existing, onSave, onExit }) {
  const [alias, setAlias] = useState(existing?.alias || "");
  const [avatar, setAvatar] = useState(existing?.avatar || "🧑‍🚀");
  const [skills, setSkills] = useState(existing?.skills || []);
  const [problem, setProblem] = useState(existing?.problem || "");
  const [idea, setIdea] = useState(existing?.idea || spinner?.best?.idea || "");
  const [st, finish] = useFinish(onSave);
  const toggle = (s) => setSkills((x) => (x.includes(s) ? x.filter((y) => y !== s) : x.length < 3 ? [...x, s] : x));
  const ready = alias.trim() && skills.length === 3 && countWords(problem) >= 4 && countWords(idea) >= 5;
  if (st.done) return <Reward title="Entrepreneur card ready! 🪪" subtitle="Part 01 of your startup is built." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Rocket size={22} strokeWidth={2.1} />} title="My Entrepreneur Profile" subtitle="Part 01 of your startup. Who are you as an entrepreneur?" onExit={onExit}>
      <div className="start-block">
        <h3><span className="step-n">1</span> My entrepreneur name and avatar</h3>
        <div className="p1-starters">{AVATARS.map((a) => <button key={a} type="button" className={`p1-chip big ${avatar === a ? "on" : ""}`} onClick={() => setAvatar(a)}>{a}</button>)}</div>
        <input className="start-input" value={alias} maxLength={30} onChange={(e) => setAlias(e.target.value)} placeholder={`e.g. ${studentName.split(" ")[0]} the Inventor`} />
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> My 3 entrepreneurial skills ({skills.length}/3)</h3>
        <div className="p1-starters">{SKILLS.map((s) => <button key={s} type="button" className={`p1-chip ${skills.includes(s) ? "on" : ""}`} onClick={() => toggle(s)}>{s}</button>)}</div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">3</span> One problem I would like to solve</h3>
        <input className="start-input" value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Students forget their materials at home." />
        <h3 className="p2-mt"><span className="step-n">4</span> My first business idea</h3>
        {spinner?.best && <p className="start-tip">💡 From the Idea Machine: “{spinner.best.idea}”</p>}
        <WordField value={idea} onChange={setIdea} min={5} max={40} rows={2} placeholder="My first idea is…" />
      </div>
      <div className="p3-idcard">
        <div className="p3-idcard-top"><span>ENTREPRENEUR ID</span><span>CREAR LAB · GRADE 6</span></div>
        <div className="p3-idcard-body">
          <div className="p3-idcard-photo">{avatar}</div>
          <div>
            <h3>{alias || "Your entrepreneur name"}</h3>
            <small>{studentName}</small>
            <div className="p3-idcard-skills">{(skills.length ? skills : ["Skill", "Skill", "Skill"]).map((s, i) => <i key={i}>{s}</i>)}</div>
          </div>
        </div>
        <p><b>Problem:</b> {problem || "…"}</p>
        <p><b>First idea:</b> {idea || "…"}</p>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { alias, avatar, skills, problem, idea })}>Save my profile <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 23 · FIND A REAL PROBLEM
   ===================================================================== */
const READ_C2 = [
  { h: "Mia and the Broken Bottles" },
  { p: "Mia is a student who likes helping people. One day, she sees many plastic bottles near the school playground. Some bottles are on the floor, and others are in the trash." },
  { say: "Mia asks her classmates, “Why are there so many bottles here?”" },
  { say: "One student says, “Sometimes we cannot find a recycling bin.” Another student says, “We do not know where to put plastic bottles.”" },
  { p: "Mia sees an opportunity. She thinks about creating a recycling service for the school. Students can put their empty bottles in special containers. A small team can collect the bottles and take them to a recycling point." },
  { p: "Before she starts, Mia needs to ask more questions. Do students want to use the containers? Where should the containers go? Who can help?" },
  { p: "Mia learns that a business idea should begin with a real problem. A good entrepreneur observes, asks questions, and looks for a useful solution." },
  { box: "Can you find a problem in your school or neighborhood?" },
];
const GLOSS_C2 = { "opportunity": "Oportunidad.", "recycling": "Reciclaje.", "observes": "Observa.", "containers": "Contenedores / recipientes.", "playground": "Patio de juegos." };
const Q_C2 = [
  { q: "What problem does Mia see?", options: ["Many plastic bottles near the playground.", "Too many books in the library.", "No food in the cafeteria."], correct: 0, feedback: "Plastic bottles everywhere!" },
  { q: "Why are the bottles there?", options: ["Students can't find a recycling bin.", "Students love bottles.", "The teacher puts them there."], correct: 0, feedback: "There is no clear place to put them." },
  { q: "What is Mia's business idea?", options: ["A recycling service for the school.", "A bottle shop.", "A music band."], correct: 0, feedback: "A recycling service." },
  { q: "What should a business idea begin with?", options: ["A real problem.", "A lot of money.", "A famous logo."], correct: 0, feedback: "Observe → ask → solve." },
];

const ZONES = [
  { id: "cafe", e: "🍽️", name: "Cafeteria", x: 12, y: 16, problem: "There are no healthy snacks, and the lines are very long." },
  { id: "play", e: "🛝", name: "Playground", x: 56, y: 12, problem: "Many plastic bottles and wrappers are on the floor." },
  { id: "class", e: "🏫", name: "Classrooms", x: 34, y: 42, problem: "Students forget their school materials at home." },
  { id: "library", e: "📚", name: "Library", x: 76, y: 40, problem: "Students need help understanding math and English." },
  { id: "gate", e: "🚪", name: "School entrance", x: 10, y: 66, problem: "Parents wait a long time and kids get bored." },
  { id: "park", e: "🌳", name: "Park", x: 46, y: 72, problem: "Dogs need walks, but families are very busy." },
  { id: "street", e: "🏘️", name: "Neighborhood", x: 80, y: 74, problem: "People have old clothes and toys they don't use." },
  { id: "bus", e: "🚌", name: "Bus stop", x: 62, y: 46, problem: "It rains a lot and there is no place to wait dry." },
];
function ProblemMap({ onSave, onExit }) {
  const [open, setOpen] = useState(null);
  const [found, setFound] = useState({});
  const [seen, setSeen] = useState({});
  const [st, finish] = useFinish(onSave);
  const count = Object.keys(found).length;
  const real = Object.values(seen).filter(Boolean).length;
  const ready = count >= 5 && real >= 1;
  if (st.done) return <Reward title="Problem hunter! 🔎" subtitle={`You discovered ${count} opportunities.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  const z = ZONES.find((x) => x.id === open);
  return (
    <ActShell icon={<MapIcon size={22} strokeWidth={2.1} />} title="Problem Hunt · Mission Map" subtitle="Tap the places on the map. Every problem is a business opportunity!" onExit={onExit}>
      <div className="p2-hud"><span>🔎 Problems found <b>{count}/8</b></span><span>👀 Seen in real life <b>{real}</b></span></div>
      <div className="p3-map">
        <div className="p3-map-road h" /><div className="p3-map-road v" />
        {ZONES.map((zz) => (
          <button key={zz.id} type="button" className={`p3-zone ${found[zz.id] ? "found" : ""} ${open === zz.id ? "open" : ""}`} style={{ left: `${zz.x}%`, top: `${zz.y}%` }} onClick={() => { setOpen(zz.id); setFound({ ...found, [zz.id]: true }); }}>
            <em>{zz.e}</em><small>{zz.name}</small>{found[zz.id] && <i>!</i>}
          </button>
        ))}
      </div>
      {z && (
        <div className="p3-problem-card">
          <small>{z.e} {z.name}</small>
          <p>{z.problem}</p>
          <div className="p3-yesno">
            <span>Have you seen this problem in real life?</span>
            <button type="button" className={seen[z.id] === true ? "on" : ""} onClick={() => setSeen({ ...seen, [z.id]: true })}>👀 Yes, I saw it</button>
            <button type="button" className={seen[z.id] === false ? "on no" : ""} onClick={() => setSeen({ ...seen, [z.id]: false })}>Not yet</button>
          </div>
        </div>
      )}
      <p className="start-tip p1-center">Find at least 5 problems and mark one you have really seen.</p>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(20 + real * 2, { found: Object.keys(found), seen })}>Finish the hunt <span className="coin-tag"><Coins size={15} /> +{20 + real * 2}</span></button></div>
    </ActShell>
  );
}

function QRow({ n, q, children }) {
  return <div className="p3-qrow"><span className="step-n">{n}</span><div><b>{q}</b>{children}</div></div>;
}
const VERIFY = ["👀 I observed it", "🗣️ I asked people", "👀🗣️ Both"];
function ProblemCard({ map, profile, existing, onSave, onExit }) {
  const [problem, setProblem] = useState(existing?.problem || profile?.problem || "");
  const [who, setWho] = useState(existing?.who || "");
  const [where, setWhere] = useState(existing?.where || "");
  const [why, setWhy] = useState(existing?.why || "");
  const [solution, setSolution] = useState(existing?.solution || "");
  const [verify, setVerify] = useState(existing?.verify || "");
  const [asked, setAsked] = useState(existing?.asked || "");
  const [st, finish] = useFinish(onSave);
  const seenZones = ZONES.filter((z) => map?.seen?.[z.id]);
  const ready = countWords(problem) >= 4 && who.trim() && where.trim() && countWords(why) >= 4 && countWords(solution) >= 4 && verify;
  if (st.done) return <Reward title="Problem Hunt Card saved! 🧾" subtitle="This is the base of your company." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="My Problem Hunt Card" subtitle="Part 02 · The real problem your company will solve." onExit={onExit}>
      {seenZones.length > 0 && <div className="p1-starters"><span className="terms-label">Problems you saw:</span>{seenZones.map((z) => <button key={z.id} type="button" className="p1-chip" onClick={() => setProblem(z.problem)}>{z.e} {z.name}</button>)}</div>}
      <div className="start-block p3-qcard">
        <QRow n="1" q="The problem: What is wrong?"><input className="start-input" value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Students forget their materials." /></QRow>
        <QRow n="2" q="Who has this problem?"><input className="start-input" value={who} onChange={(e) => setWho(e.target.value)} placeholder="6th grade students" /></QRow>
        <QRow n="3" q="Where does it happen?"><input className="start-input" value={where} onChange={(e) => setWhere(e.target.value)} placeholder="In the classrooms" /></QRow>
        <QRow n="4" q="Why is it important?"><input className="start-input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Because they can't work in class." /></QRow>
        <QRow n="5" q="My first solution: What could I do?"><input className="start-input" value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="Rent school kits for the day." /></QRow>
        <QRow n="6" q="How did you check it is real?">
          <div className="p1-starters">{VERIFY.map((v) => <button key={v} type="button" className={`p1-chip ${verify === v ? "on" : ""}`} onClick={() => setVerify(v)}>{v}</button>)}</div>
          <input className="start-input" value={asked} onChange={(e) => setAsked(e.target.value)} placeholder="Who did you talk to? (optional)" />
        </QRow>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { problem, who, where, why, solution, verify, asked })}>Save my card <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 24 · KNOW YOUR CUSTOMER
   ===================================================================== */
const READ_C3 = [
  { h: "Ask Before You Create" },
  { p: "A customer is a person who buys or uses a product or service. Before creating a business, entrepreneurs need to understand their customers." },
  { p: "They ask questions, listen carefully, and look for common needs. They do not assume that everyone likes the same things." },
  { p: "Good questions help us learn. For example: “What is difficult for you at school?” or “Would this product help you?”" },
  { box: "A smart entrepreneur listens before making decisions. The goal is not to convince people to like an idea. The goal is to discover what they really need." },
];
const GOOD_Q = [
  { id: "good", label: "Helpful question", icon: "✅", color: "#16b074" },
  { id: "bad", label: "Not helpful", icon: "🚫", color: "#ff6b57" },
];
const GOOD_Q_ITEMS = [
  { label: "“Do you like my idea?”", answer: "bad", why: "People say yes to be nice. You learn nothing." },
  { label: "“What is difficult for you at school?”", answer: "good" },
  { label: "“How much do you spend on snacks every week?”", answer: "good" },
  { label: "“My product is amazing, right?”", answer: "bad", why: "It pushes the person to agree." },
  { label: "“What do you do when you forget your materials?”", answer: "good" },
  { label: "“Would you buy it? Yes or yes?”", answer: "bad" },
  { label: "“What would make your break time better?”", answer: "good" },
  { label: "“Everybody needs this, don't you think?”", answer: "bad" },
];

const QUEST_QS = [
  { q: "What do you look for in a notebook?", useful: true, a: ["“A low price. I don't have much money.”", "“A colorful design with my favorite colors!”", "“Recycled paper. I care about the planet.”"] },
  { q: "How much do you usually pay for a notebook?", useful: true, a: ["“Around $5,000. I can't pay more.”", "“About $8,000 if it's pretty.”", "“$7,000, but it must be eco-friendly.”"] },
  { q: "What is the problem with your notebooks now?", useful: true, a: ["“They are too expensive.”", "“They are boring. All the same.”", "“They use a lot of new paper.”"] },
  { q: "Do you like my idea?", useful: false, a: ["“Yes!”", "“Sure, it's nice.”", "“Yes, cool.”"] },
  { q: "My notebooks are the best, right?", useful: false, a: ["“Ehh… I guess.”", "“If you say so.”", "“Maybe?”"] },
  { q: "Where do you buy school supplies?", useful: true, a: ["“At the cheap store near my house.”", "“At the mall, I like nice stores.”", "“At the eco-market on Saturdays.”"] },
];
const PERSONAS = [{ e: "🧒", name: "Customer A" }, { e: "👧", name: "Customer B" }, { e: "🧑", name: "Customer C" }];
function CustomerQuest({ onSave, onExit }) {
  const MAX = 3;
  const [asked, setAsked] = useState([]);
  const [need, setNeed] = useState(null);
  const [st, finish] = useFinish(onSave);
  const usefulN = asked.filter((i) => QUEST_QS[i].useful).length;
  const done = asked.length >= MAX;
  const NEEDS = ["A low price, a colorful design and recycled paper — different customers want different things.", "Everybody wants the same notebook.", "Nobody needs notebooks."];
  const coins = usefulN * 6 + (need === 0 ? 10 : 0);
  if (st.done) return <Reward title="Customer detective! 🕵️" subtitle={`${usefulN}/${MAX} useful questions.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<MessageCircle size={22} strokeWidth={2.1} />} title="Customer Quest" subtitle="Your idea: personalized notebooks. You can ask only 3 questions — choose well!" onExit={onExit}>
      <div className="p3-personas">{PERSONAS.map((p) => <div key={p.name}><em>{p.e}</em><b>{p.name}</b></div>)}</div>
      <div className="p2-hud"><span>Questions <b>{asked.length}/{MAX}</b></span><span>Useful <b>{usefulN}</b></span></div>
      {!done && (
        <div className="p3-qlist">
          {QUEST_QS.map((q, i) => <button key={i} type="button" disabled={asked.includes(i)} onClick={() => setAsked([...asked, i])}>❓ {q.q}</button>)}
        </div>
      )}
      {asked.map((i) => (
        <div key={i} className={`p3-interview ${QUEST_QS[i].useful ? "" : "weak"}`}>
          <b>❓ {QUEST_QS[i].q}</b>
          <div>{QUEST_QS[i].a.map((ans, k) => <p key={k}><em>{PERSONAS[k].e}</em> {ans}</p>)}</div>
          {!QUEST_QS[i].useful && <small>⚠️ This question didn't teach you much. People just say what you want to hear.</small>}
        </div>
      ))}
      {done && (
        <div className="start-block">
          <h3><Lightbulb size={18} /> What did you discover?</h3>
          <div className="quiz-options">
            {NEEDS.map((n, k) => (
              <button key={k} type="button" className={`quiz-opt ${need === k ? (k === 0 ? "correct" : "wrong") : ""}`} onClick={() => setNeed(k)}>
                <span className="opt-key">{"ABC"[k]}</span><span className="opt-text">{n}</span>
              </button>
            ))}
          </div>
          {need === 0 && <div className="p1-banner good">Exactly! Good questions show <b>real needs</b>. Maybe you need 2 types of notebooks.</div>}
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!done || need === null} onClick={() => finish(Math.max(10, coins), { asked, usefulN, need })}>Finish <span className="coin-tag"><Coins size={15} /> +{Math.max(10, coins)}</span></button></div>
    </ActShell>
  );
}

function CustomerSurvey({ problem, existing, onSave, onExit }) {
  const [qs, setQs] = useState(existing?.questions || ["", "", ""]);
  const [people, setPeople] = useState(existing?.people || [0, 1, 2].map(() => ({ name: "", a: ["", "", ""] })));
  const [learned, setLearned] = useState(existing?.learned || ["", ""]);
  const [change, setChange] = useState(existing?.change || "");
  const [st, finish] = useFinish(onSave);
  const banned = (q) => /like my idea|is (it|this) (good|cool|amazing)|right\?$/i.test(q.trim());
  const qOk = qs.map((q) => countWords(q) >= 4 && !banned(q));
  const peopleOk = people.every((p) => p.name.trim() && p.a.every((a) => countWords(a) >= 1));
  const ready = qOk.every(Boolean) && peopleOk && learned.every((l) => countWords(l) >= 4) && countWords(change) >= 4;
  if (st.done) return <Reward title="Customer Discovery Card saved! 📋" subtitle="Real answers from real people." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Users size={22} strokeWidth={2.1} />} title="Customer Discovery Card" subtitle="Interview 3 classmates about YOUR problem." onExit={onExit}>
      {problem && <div className="p1-banner"><Search size={16} /> Your problem: <b>{problem}</b></div>}
      <div className="start-block">
        <h3><span className="step-n">1</span> My 3 interview questions</h3>
        <p className="start-tip">Rule: you can't ask “Do you like my idea?”. Ask about needs, habits or problems.</p>
        {qs.map((q, i) => (
          <div key={i} className="p3-q-in">
            <input className="start-input" value={q} onChange={(e) => setQs(qs.map((x, k) => (k === i ? e.target.value : x)))} placeholder={["What is difficult for you when…?", "How often do you…?", "What do you do when…?"][i]} />
            {q && !qOk[i] && <small className="goal-warn">{banned(q) ? "That question doesn't help. Ask about needs!" : "Write 4+ words."}</small>}
          </div>
        ))}
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> Answers from 3 classmates</h3>
        <div className="p3-survey">
          {people.map((p, i) => (
            <div key={i} className="p3-survey-col">
              <input className="start-input" value={p.name} onChange={(e) => setPeople(people.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} placeholder={`Classmate ${i + 1} name`} />
              {p.a.map((a, j) => (
                <textarea key={j} className="start-input" rows={2} value={a} placeholder={`Answer to Q${j + 1}`}
                  onChange={(e) => setPeople(people.map((x, k) => (k === i ? { ...x, a: x.a.map((y, m) => (m === j ? e.target.value : y)) } : x)))} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">3</span> Two things I learned</h3>
        {learned.map((l, i) => <input key={i} className="start-input p3-gap" value={l} onChange={(e) => setLearned(learned.map((x, k) => (k === i ? e.target.value : x)))} placeholder={["Most people want…", "I was surprised that…"][i]} />)}
        <h3 className="p2-mt"><span className="step-n">4</span> One change I will make to my idea</h3>
        <input className="start-input" value={change} onChange={(e) => setChange(e.target.value)} placeholder="I will change… because…" />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(35, { questions: qs, people, learned, change })}>Save my discovery card <span className="coin-tag"><Coins size={15} /> +35</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 25–27 · DESIGN YOUR SOLUTION
   ===================================================================== */
const SIX_BIZ = [
  { e: "👜", n: "EcoBag", t: "product", d: "EcoBag sells reusable shopping bags. Customers use them instead of single-use plastic bags." },
  { e: "📘", n: "Study Buddy", t: "service", d: "Study Buddy offers tutoring for students who need help with school subjects." },
  { e: "🍓", n: "Fresh Box", t: "product", d: "Fresh Box sells fruit cups for students who want a fresh snack." },
  { e: "💻", n: "Tech Help", t: "service", d: "Tech Help helps people organize files and learn basic computer skills." },
  { e: "🐶", n: "Happy Paws", t: "service", d: "Happy Paws offers dog-walking services for busy families." },
  { e: "🎨", n: "Custom Art", t: "product", d: "Custom Art creates personalized cards, stickers, and small gifts." },
];
const READ_C4 = [
  { h: "Six Small Businesses" },
  { node: (
    <div className="p3-biz-grid">
      {SIX_BIZ.map((b, i) => (
        <div key={b.n} className="p3-biz">
          <em>{b.e}</em>
          <b>{i + 1}. {b.n}</b>
          <p>{b.d}</p>
        </div>
      ))}
    </div>
  ) },
  { p: "These businesses are different, but they all try to help customers." },
  { p: "A product is something you can touch, such as a bag, a notebook, or a snack. A service is an activity or help you offer, such as tutoring or dog walking." },
  { p: "A value proposition explains who you help and how you help them." },
  { say: "Example: “We help students organize their schoolwork with colorful, reusable planners.”" },
  { box: "A good idea is not only creative. It should also be useful to a real customer." },
];
const GLOSS_C4 = {
  "product": "Producto — algo que puedes tocar.",
  "service": "Servicio — una ayuda o actividad que ofreces.",
  "value proposition": "Propuesta de valor — a quién ayudas y cómo.",
  "reusable": "Reutilizable.",
  "tutoring": "Clases de refuerzo.",
};
const PS_BUCKETS = [
  { id: "product", label: "Product", icon: "📦", color: "#1d4ed8" },
  { id: "service", label: "Service", icon: "🤝", color: "#db2777" },
];
const PS_ITEMS = [
  { label: "Reusable shopping bags (EcoBag)", answer: "product" },
  { label: "Tutoring for students (Study Buddy)", answer: "service" },
  { label: "Fruit cups (Fresh Box)", answer: "product" },
  { label: "Teaching basic computer skills (Tech Help)", answer: "service" },
  { label: "Dog walking (Happy Paws)", answer: "service" },
  { label: "Personalized stickers (Custom Art)", answer: "product", why: "You can touch a sticker → product." },
  { label: "A haircut", answer: "service" },
  { label: "A notebook with your name", answer: "product" },
];

/* Startup Builder: tragamonedas + constructor de frases */
const BUILDER_REELS = [
  { label: "Customer", items: ["students", "families", "teachers", "pet owners"] },
  { label: "Problem", items: ["lack of time", "messy school materials", "too much waste", "difficulty learning"] },
  { label: "Solution", items: ["a product 📦", "a service 🤝"] },
];
const SB_TILES = {
  who: ["students", "busy families", "teachers", "pet owners"],
  to: ["reduce plastic waste", "learn math faster", "walk their dogs every day", "organize their schoolwork"],
  with: ["reusable bags", "fun tutoring classes", "a dog-walking service", "colorful planners"],
};
const SB_ROUNDS = [
  { biz: "👜 EcoBag", ans: ["busy families", "reduce plastic waste", "reusable bags"] },
  { biz: "📘 Study Buddy", ans: ["students", "learn math faster", "fun tutoring classes"] },
  { biz: "🐶 Happy Paws", ans: ["pet owners", "walk their dogs every day", "a dog-walking service"] },
];
function SentenceBuilder({ round, onDone }) {
  const [slots, setSlots] = useState([null, null, null]);
  const [checked, setChecked] = useState(false);
  const [tries, setTries] = useState(0);
  const keys = ["who", "to", "with"];
  const tiles = useMemo(() => keys.map((k) => shuffleArr(SB_TILES[k])), [round.biz]); // eslint-disable-line react-hooks/exhaustive-deps
  const ok = slots.map((s, i) => s === round.ans[i]);
  const all = ok.every(Boolean);
  const put = (i, t) => { setSlots(slots.map((s, k) => (k === i ? t : s))); setChecked(false); };
  return (
    <div className="start-block">
      <p className="start-tip">Build the value proposition for <b>{round.biz}</b>. Tap one tile in each row.</p>
      <div className="p3-sentence">
        <span>We help</span>
        <b className={checked ? (ok[0] ? "ok" : "no") : slots[0] ? "on" : ""}>{slots[0] || "___"}</b>
        <span>to</span>
        <b className={checked ? (ok[1] ? "ok" : "no") : slots[1] ? "on" : ""}>{slots[1] || "___"}</b>
        <span>with</span>
        <b className={checked ? (ok[2] ? "ok" : "no") : slots[2] ? "on" : ""}>{slots[2] || "___"}</b>.
      </div>
      {keys.map((k, i) => (
        <div key={k} className="p3-tiles">
          <small>{["WHO?", "TO DO WHAT?", "WITH WHAT?"][i]}</small>
          {tiles[i].map((t) => <button key={t} type="button" className={slots[i] === t ? "on" : ""} onClick={() => put(i, t)}>{t}</button>)}
        </div>
      ))}
      {checked && !all && <div className="p1-hint">💡 Read the business description again. The red parts don't match.</div>}
      {checked && all && <div className="p1-banner good"><Check size={18} /> Perfect value proposition!</div>}
      <div className="start-foot">
        {!(checked && all)
          ? <button className="s1-btn primary" disabled={slots.some((s) => !s)} onClick={() => { setChecked(true); setTries((t) => t + 1); }}>Check <Check size={16} /></button>
          : <button className="s1-btn primary" onClick={() => onDone(tries === 1)}>Next <ChevronRight size={16} /></button>}
      </div>
    </div>
  );
}
function StartupBuilder({ onSave, onExit }) {
  const { values, spinning, spin } = useSpinner(BUILDER_REELS);
  const [spins, setSpins] = useState(0);
  const [stage, setStage] = useState("slots");
  const [r, setR] = useState(0);
  const [first, setFirst] = useState(0);
  const [mine, setMine] = useState(["", "", ""]);
  const [st, finish] = useFinish(onSave);
  const doSpin = () => { if (spins < 2) { spin(); setSpins((s) => s + 1); } };
  const mineOk = mine.every((m) => countWords(m) >= 1);
  const coins = 10 + first * 4 + 8;
  if (st.done) return <Reward title="Startup built! 🏗️" subtitle="Now you can write a value proposition." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Shuffle size={22} strokeWidth={2.1} />} title="Startup Builder 🎰" subtitle="Spin a random startup. You can keep it or spin again ONE time." onExit={onExit}>
      {stage === "slots" && (
        <>
          <SlotReels reels={BUILDER_REELS} values={values} spinning={spinning} />
          <div className="p1-center p3-row-btns">
            <button className="s1-btn primary big p3-spin-btn" disabled={spinning || spins >= 2} onClick={doSpin}>🎰 {spins === 0 ? "Spin" : spins === 1 ? "Spin again (1 left)" : "No spins left"}</button>
            {spins > 0 && !spinning && <button className="s1-btn ghost big" onClick={() => setStage("build")}>Keep this startup <Check size={17} /></button>}
          </div>
          {spins > 0 && !spinning && <p className="start-tip p1-center">Your startup helps <b>{values[0]}</b> with <b>{values[1]}</b> using <b>{values[2]}</b>.</p>}
        </>
      )}
      {stage === "build" && (
        <>
          <div className="p2-hud"><span>Sentence <b>{r + 1}/{SB_ROUNDS.length}</b></span><span>First try ⭐ <b>{first}</b></span></div>
          <SentenceBuilder key={r} round={SB_ROUNDS[r]} onDone={(ft) => { if (ft) setFirst((f) => f + 1); if (r < SB_ROUNDS.length - 1) setR(r + 1); else setStage("mine"); }} />
        </>
      )}
      {stage === "mine" && (
        <div className="start-block">
          <h3><Rocket size={18} /> Now YOUR random startup</h3>
          <p className="start-tip">Customer: <b>{values[0]}</b> · Problem: <b>{values[1]}</b> · Solution: <b>{values[2]}</b></p>
          <div className="p3-sentence edit">
            <span>We help</span><input className="start-input" value={mine[0]} onChange={(e) => setMine([e.target.value, mine[1], mine[2]])} placeholder={values[0]} />
            <span>to</span><input className="start-input" value={mine[1]} onChange={(e) => setMine([mine[0], e.target.value, mine[2]])} placeholder="save time" />
            <span>with</span><input className="start-input" value={mine[2]} onChange={(e) => setMine([mine[0], mine[1], e.target.value])} placeholder="a smart organizer" />
          </div>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!mineOk} onClick={() => finish(coins, { combo: values, first, mine: `We help ${mine[0]} to ${mine[1]} with ${mine[2]}.` })}>Save <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </div>
      )}
    </ActShell>
  );
}

function ConceptCard({ problemCard, profile, existing, onSave, onExit }) {
  const ex = existing || {};
  const [name, setName] = useState(ex.name || "");
  const [idea, setIdea] = useState(ex.idea || profile?.idea || "");
  const [type, setType] = useState(ex.type || "");
  const [customer, setCustomer] = useState(ex.customer || problemCard?.who || "");
  const [problem, setProblem] = useState(ex.problem || problemCard?.problem || "");
  const [vp, setVp] = useState(ex.vp || ["", "", ""]);
  const [st, finish] = useFinish(onSave);
  const value = `We help ${vp[0] || "___"} to ${vp[1] || "___"} with ${vp[2] || "___"}.`;
  const ready = name.trim() && countWords(idea) >= 4 && type && customer.trim() && countWords(problem) >= 3 && vp.every((v) => countWords(v) >= 1);
  if (st.done) return <Reward title="Startup Concept Card saved! 🧠" subtitle="Part 03 · The official description of your company." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Lightbulb size={22} strokeWidth={2.1} />} title="My Startup Concept Card" subtitle="Part 03 · What will your business offer, and why will people choose it?" onExit={onExit}>
      <div className="start-block p3-qcard">
        <QRow n="1" q="Company name (you can change it later in Brand class)"><input className="start-input" value={name} maxLength={28} onChange={(e) => setName(e.target.value)} placeholder="Planet Planners" /></QRow>
        <QRow n="2" q="My company idea"><input className="start-input" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="We sell planners made with recycled paper." /></QRow>
        <QRow n="3" q="Product or service?">
          <div className="p3-toggle2">
            {[["product", "📦 Product", "You can touch it"], ["service", "🤝 Service", "You offer help or an activity"]].map(([id, l, s]) => (
              <button key={id} type="button" className={type === id ? "on" : ""} onClick={() => setType(id)}><b>{l}</b><small>{s}</small></button>
            ))}
          </div>
        </QRow>
        <QRow n="4" q="Target customer: who will buy or use it?"><input className="start-input" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="6th grade students" /></QRow>
        <QRow n="5" q="Customer problem"><input className="start-input" value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="They forget their homework." /></QRow>
        <QRow n="6" q="Value proposition">
          <div className="p3-sentence edit">
            <span>We help</span><input className="start-input" value={vp[0]} onChange={(e) => setVp([e.target.value, vp[1], vp[2]])} placeholder={customer || "students"} />
            <span>to</span><input className="start-input" value={vp[1]} onChange={(e) => setVp([vp[0], e.target.value, vp[2]])} placeholder="organize their homework" />
            <span>with</span><input className="start-input" value={vp[2]} onChange={(e) => setVp([vp[0], vp[1], e.target.value])} placeholder="colorful recycled planners" />
          </div>
        </QRow>
      </div>
      <div className="p3-concept">
        <small>STARTUP CONCEPT CARD</small>
        <h3>{name || "Company name"} <i>{type === "service" ? "🤝 Service" : type === "product" ? "📦 Product" : ""}</i></h3>
        <p>{idea || "…"}</p>
        <div className="p3-concept-row"><span>👥 <b>Customer</b>{customer || "…"}</span><span>⚠️ <b>Problem</b>{problem || "…"}</span></div>
        <blockquote>{value}</blockquote>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(35, { name, idea, type, customer, problem, vp, value })}>Save my concept <span className="coin-tag"><Coins size={15} /> +35</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 29 · BUILD YOUR BRAND
   ===================================================================== */
const READ_C5 = [
  { h: "Give Your Business an Identity" },
  { p: "A brand is the identity of a business. It helps people recognize a company and understand what it offers." },
  { p: "A logo is a symbol or design that represents a brand. A slogan is a short and memorable phrase. For example, a company that sells reusable bottles could use the slogan “Refill. Reuse. Repeat.”" },
  { p: "A mission explains why a business exists, who it helps, and what it does. A vision describes what the business hopes to achieve in the future." },
  { sub: "Example · Green Future 🌱" },
  { list: ["Mission: We help students reduce plastic waste with reusable products.", "Vision: We want schools to become cleaner and more sustainable places."] },
  { box: "A strong brand should be clear, easy to remember, and connected to the company's purpose. Your logo looks good when it also tells a story about your business." },
  { p: "Look at the logos in the picture. What shapes, colors and symbols do you see? Don't copy them — you will design your own identity!" },
];
const GLOSS_C5 = {
  "brand": "Marca — la identidad de una empresa.",
  "logo": "Logo — símbolo o diseño que representa la marca.",
  "slogan": "Eslogan — frase corta y fácil de recordar.",
  "mission": "Misión — por qué existe la empresa y a quién ayuda.",
  "vision": "Visión — lo que la empresa quiere lograr en el futuro.",
  "memorable": "Fácil de recordar.",
};
const Q_C5 = [
  { q: "What is a brand?", options: ["The identity of a business.", "The price of a product.", "A type of money."], correct: 0, feedback: "Brand = identity." },
  { q: "What is a slogan?", options: ["A short and memorable phrase.", "A long story about the company.", "The name of the CEO."], correct: 0, feedback: "Like “Refill. Reuse. Repeat.”" },
  { q: "“We help students reduce plastic waste…” is a…", options: ["mission", "vision", "logo"], correct: 0, feedback: "Mission = what we do today and who we help." },
  { q: "“We want schools to become cleaner…” is a…", options: ["vision", "mission", "price"], correct: 0, feedback: "Vision = the future." },
  { q: "A good logo…", options: ["is clear and tells a story about the business.", "has 20 colors and lots of words.", "is a copy of a famous logo."], correct: 0, feedback: "Clear + connected to the purpose." },
];

const STYLE_OPTS = ["natural 🌿", "sporty ⚡", "playful 🎈", "modern 🔷", "elegant ✨"];
const DETECTIVE = [
  { brand: { name: "Leafy", icon: "🌱", shape: "leaf", palette: "forest", font: "classic", slogan: "Grow green" }, correct: 0, explain: "Green colors + a leaf + soft shape = natural." },
  { brand: { name: "BOLT", icon: "⚡", shape: "shield", palette: "night", font: "bold", slogan: "Faster every day" }, correct: 1, explain: "A lightning bolt, a shield and strong colors feel sporty." },
  { brand: { name: "Bubbly", icon: "🧸", shape: "circle", palette: "candy", font: "fun", slogan: "Smile & play" }, correct: 2, explain: "Pink, round and a playful font = playful." },
  { brand: { name: "Pixel", icon: "💡", shape: "hex", palette: "ocean", font: "tech", slogan: "Smart ideas" }, correct: 3, explain: "Hexagon + tech font + blue = modern." },
  { brand: { name: "Aurora", icon: "⭐", shape: "none", palette: "night", font: "classic", slogan: "Simply special" }, correct: 4, explain: "A classic font, dark color and a simple star feel elegant." },
];
const DETECTIVE_ROUNDS = DETECTIVE.map((d) => ({
  tag: "LOGO DETECTIVE",
  q: "What style does this logo communicate?",
  visual: <div className="p3-logo-stage"><LogoMark brand={d.brand} size={92} /></div>,
  options: STYLE_OPTS, correct: d.correct, explain: d.explain,
}));

const BRAND_MATCH = [
  { company: "🐶 Happy Paws", about: "Dog walking for busy families. Friendly and safe.", opts: [
    { name: "Happy Paws", icon: "🐶", shape: "circle", palette: "sunset", font: "fun", slogan: "Happy dogs, happy families" },
    { name: "Happy Paws", icon: "🔧", shape: "hex", palette: "night", font: "tech", slogan: "Machines 24/7" },
    { name: "Happy Paws", icon: "🍎", shape: "leaf", palette: "lemon", font: "classic", slogan: "Fresh fruit daily" },
  ], correct: 0, why: ["It shows a dog and warm, friendly colors.", "A tool and a tech style don't talk about dogs.", "A fruit doesn't tell the story of dog walking."] },
  { company: "📘 Study Buddy", about: "Tutoring for students who need help with school.", opts: [
    { name: "Study Buddy", icon: "⚽", shape: "shield", palette: "sunset", font: "bold", slogan: "Win the game" },
    { name: "Study Buddy", icon: "📚", shape: "rounded", palette: "ocean", font: "bold", slogan: "Learn together" },
    { name: "Study Buddy", icon: "🧁", shape: "circle", palette: "candy", font: "fun", slogan: "Sweet treats" },
  ], correct: 1, why: ["Sport doesn't explain tutoring.", "Books + blue (trust) + “Learn together” = clear!", "Cupcakes are for a bakery."] },
  { company: "👜 EcoBag", about: "Reusable bags to reduce plastic waste.", opts: [
    { name: "EcoBag", icon: "🚀", shape: "hex", palette: "night", font: "tech", slogan: "To the moon" },
    { name: "EcoBag", icon: "🎧", shape: "circle", palette: "candy", font: "fun", slogan: "Music for all" },
    { name: "EcoBag", icon: "♻️", shape: "leaf", palette: "forest", font: "bold", slogan: "Reuse. Reduce. Repeat." },
  ], correct: 2, why: ["A rocket doesn't connect with the planet.", "Music isn't the purpose.", "Recycling symbol + green + leaf = eco purpose!"] },
];
function BrandMatch({ onSave, onExit }) {
  const [r, setR] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);
  const [st, finish] = useFinish(onSave);
  const R = BRAND_MATCH[r];
  const answered = pick !== null;
  const choose = (i) => { if (answered) return; setPick(i); if (i === R.correct) setScore((s) => s + 1); };
  const next = () => { if (r < BRAND_MATCH.length - 1) { setR(r + 1); setPick(null); } else finish(score * 6 + 6, { score }); };
  if (st.done) return <Reward title="Brand judge! 🧑‍⚖️" subtitle={`${st.coins >= 24 ? "Perfect eye for design." : "Good eye for design."}`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Palette size={22} strokeWidth={2.1} />} title="Brand Match ⚖️" subtitle="Which logo is the most coherent with the business and its customers?" onExit={onExit}>
      <div className="p2-hud"><span>Company <b>{r + 1}/{BRAND_MATCH.length}</b></span><span>Correct <b>{score}</b></span></div>
      <div className="p1-challenge"><span>Client</span><b>{R.company} — {R.about}</b></div>
      <div className="p3-brand-opts">
        {R.opts.map((b, i) => (
          <button key={i} type="button" disabled={answered} onClick={() => choose(i)}
            className={`p3-brand-opt ${answered && i === R.correct ? "ok" : ""} ${answered && pick === i && i !== R.correct ? "no" : ""}`}>
            <LogoMark brand={b} size={70} />
            {answered && <small>{R.why[i]}</small>}
          </button>
        ))}
      </div>
      {answered && <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{r < BRAND_MATCH.length - 1 ? "Next company" : "Finish"} <ChevronRight size={18} /></button></div>}
    </ActShell>
  );
}

/* Logo Maker: estudio de diseño con vista previa en productos */
function LogoStudio({ concept, existing, onSave, onExit }) {
  const [b, setB] = useState({ ...DEFAULT_BRAND, name: concept?.name || "", ...(existing || {}) });
  const [view, setView] = useState("card");
  const [st, finish] = useFinish(onSave);
  const set = (k, v) => setB((x) => ({ ...x, [k]: v }));
  const pal = palOf(b.palette).c;
  const ready = b.name.trim() && countWords(b.slogan) >= 2;
  const surprise = () => setB((x) => ({ ...x, icon: sample(LOGO_ICONS, 1)[0], shape: sample(LOGO_SHAPES, 1)[0].id, palette: sample(PALETTES, 1)[0].id, font: sample(FONTS, 1)[0].id }));
  if (st.done) return <Reward title="Your brand is born! 🎨" subtitle="Part 04 · Logo and slogan saved." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Palette size={22} strokeWidth={2.1} />} title="Logo Lab · Logo Maker" subtitle="Design YOUR brand: name, symbol, shape, colors, font and slogan." onExit={onExit}>
      <div className="p3-studio">
        <div className="p3-studio-tools">
          <div className="start-block">
            <h3><span className="step-n">1</span> Company name</h3>
            <input className="start-input" value={b.name} maxLength={22} onChange={(e) => set("name", e.target.value)} placeholder="Planet Planners" />
          </div>
          <div className="start-block">
            <h3><span className="step-n">2</span> Symbol</h3>
            <div className="p3-icons">{LOGO_ICONS.map((ic) => <button key={ic} type="button" className={b.icon === ic ? "on" : ""} onClick={() => set("icon", ic)}>{ic}</button>)}</div>
            <h3 className="p2-mt"><span className="step-n">3</span> Shape</h3>
            <div className="p1-starters">{LOGO_SHAPES.map((s) => <button key={s.id} type="button" className={`p1-chip ${b.shape === s.id ? "on" : ""}`} onClick={() => set("shape", s.id)}>{s.label}</button>)}</div>
          </div>
          <div className="start-block">
            <h3><span className="step-n">4</span> Colors</h3>
            <div className="p3-palettes">
              {PALETTES.map((p) => (
                <button key={p.id} type="button" className={b.palette === p.id ? "on" : ""} onClick={() => set("palette", p.id)} title={p.name}>
                  <span>{p.c.map((c) => <i key={c} style={{ background: c }} />)}</span><small>{p.name}</small>
                </button>
              ))}
            </div>
            <h3 className="p2-mt"><span className="step-n">5</span> Font</h3>
            <div className="p1-starters">{FONTS.map((f) => <button key={f.id} type="button" className={`p1-chip ${b.font === f.id ? "on" : ""}`} style={{ fontFamily: f.css }} onClick={() => set("font", f.id)}>{f.label}</button>)}</div>
          </div>
          <div className="start-block">
            <h3><span className="step-n">6</span> Slogan (short and memorable)</h3>
            <Starters items={["Learn. Play. Grow.", "Small ideas, big change", "Made with love", "Reuse. Reduce. Repeat."]} onPick={(s) => set("slogan", s)} />
            <input className="start-input" value={b.slogan} maxLength={40} onChange={(e) => set("slogan", e.target.value)} placeholder="Refill. Reuse. Repeat." />
          </div>
        </div>
        <div className="p3-studio-preview">
          <div className="p3-canvas" style={{ background: `radial-gradient(circle at 30% 20%, ${pal[1]}, #fff 70%)` }}>
            <LogoMark brand={b} size={110} />
          </div>
          <button type="button" className="s1-btn ghost p3-surprise" onClick={surprise}><Shuffle size={16} /> Surprise me</button>
          <div className="p3-mock-tabs">
            {[["card", "💳 Card"], ["sticker", "🏷️ Sticker"], ["bag", "🛍️ Bag"]].map(([id, l]) => <button key={id} type="button" className={view === id ? "on" : ""} onClick={() => setView(id)}>{l}</button>)}
          </div>
          <div className={`p3-mock ${view}`} style={{ "--c0": pal[0], "--c1": pal[1], "--c2": pal[2] }}>
            {view === "card" && <div className="p3-mock-card"><LogoMark brand={b} size={46} row light /><small>{concept?.idea || "Your business idea"}</small></div>}
            {view === "sticker" && <div className="p3-mock-sticker"><LogoMark brand={b} size={64} /></div>}
            {view === "bag" && <div className="p3-mock-bag"><i /><LogoMark brand={b} size={58} /></div>}
          </div>
        </div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(40, { name: b.name.trim(), icon: b.icon, shape: b.shape, palette: b.palette, font: b.font, slogan: b.slogan.trim() })}>Save my brand <span className="coin-tag"><Coins size={15} /> +40</span></button></div>
    </ActShell>
  );
}

const VALUE_CHIPS = ["Honesty", "Creativity", "Respect", "Teamwork", "Care for the planet", "Quality", "Kindness", "Responsibility"];
function MissionVision({ brand, concept, existing, onSave, onExit }) {
  const ex = existing || {};
  const [m, setM] = useState(ex.m || [concept?.customer || "", ""]);
  const [v, setV] = useState(ex.v || "");
  const [values, setValues] = useState(ex.values || []);
  const [st, finish] = useFinish(onSave);
  const mission = `We help ${m[0] || "___"} by ${m[1] || "___"}.`;
  const vision = `In the future, we want to ${v || "___"}.`;
  const tog = (x) => setValues((a) => (a.includes(x) ? a.filter((y) => y !== x) : a.length < 3 ? [...a, x] : a));
  const ready = countWords(m[0]) >= 1 && countWords(m[1]) >= 3 && countWords(v) >= 4 && values.length >= 2;
  if (st.done) return <Reward title="Mission & vision ready! 🧭" subtitle="Your brand now has a purpose." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Target size={22} strokeWidth={2.1} />} title="Mission, Vision & Values" subtitle="Why does your company exist? What future do you want?" onExit={onExit}>
      {brand?.icon && <div className="p1-center"><LogoMark brand={brand} size={64} row /></div>}
      <div className="start-block">
        <h3><span className="step-n">1</span> Mission — today</h3>
        <div className="p3-sentence edit">
          <span>We help</span><input className="start-input" value={m[0]} onChange={(e) => setM([e.target.value, m[1]])} placeholder="students" />
          <span>by</span><input className="start-input" value={m[1]} onChange={(e) => setM([m[0], e.target.value])} placeholder="making planners with recycled paper" />
        </div>
        <h3 className="p2-mt"><span className="step-n">2</span> Vision — the future</h3>
        <Starters items={["make schools cleaner", "help every student in Colombia", "open a store in my city", "reduce plastic in my neighborhood"]} onPick={(s) => setV(s)} />
        <div className="p3-sentence edit"><span>In the future, we want to</span><input className="start-input" value={v} onChange={(e) => setV(e.target.value)} placeholder="help 1,000 students to be organized" /></div>
        <h3 className="p2-mt"><span className="step-n">3</span> Our values (choose 2–3)</h3>
        <div className="p1-starters">{VALUE_CHIPS.map((x) => <button key={x} type="button" className={`p1-chip ${values.includes(x) ? "on" : ""}`} onClick={() => tog(x)}>{x}</button>)}</div>
      </div>
      <div className="p3-mv">
        <div><small>🎯 OUR MISSION</small><p>{mission}</p></div>
        <div><small>🔭 OUR VISION</small><p>{vision}</p></div>
        <div className="p3-mv-vals">{values.map((x) => <i key={x}>{x}</i>)}</div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { m, v, mission, vision, values })}>Save <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 28 · 30 · RUN YOUR COMPANY (organización + dinero + ética)
   ===================================================================== */
const READ_C6 = [
  { h: "The Team Behind a Business" },
  { p: "Every business needs people who understand their responsibilities. In a small business, one person can have more than one role." },
  { p: "The CEO, or Chief Executive Officer, leads the company and helps the team reach its goals. The CFO, or Chief Financial Officer, manages the budget, costs, and money." },
  { p: "The Marketing Manager helps people discover the business. The Product Manager plans how to create or improve the product. The Customer Service Manager listens to customers and helps solve their problems." },
  { p: "A company also needs a clear mission and vision. Its mission explains what it does today, while its vision describes what it wants to achieve in the future." },
  { sub: "💰 Cost, price and profit" },
  { p: "Money is important, too. The cost is the money needed to make or provide something. The price is the money the customer pays. Profit is the money left after subtracting costs from sales revenue." },
  { node: (
    <div className="p3-formula">
      <span><small>PRICE</small><b>$8,000</b></span><i>−</i><span><small>COST</small><b>$5,000</b></span><i>=</i><span className="win"><small>PROFIT</small><b>$3,000</b></span>
    </div>
  ) },
  { p: "For example, a student makes a notebook for $5,000 and sells it for $8,000. The profit is $3,000 per notebook, before any other business expenses." },
  { box: "A responsible business is also honest with customers, treats people fairly, and learns from its mistakes. Even if you work alone, you can plan these roles for your future company." },
];
const GLOSS_C6 = {
  "CEO": "Director/a ejecutivo — lidera la empresa.",
  "CFO": "Director/a financiero — maneja el presupuesto y el dinero.",
  "cost": "Costo — dinero para hacer el producto.",
  "price": "Precio — lo que paga el cliente.",
  "profit": "Ganancia — lo que queda después de restar los costos.",
  "revenue": "Ingresos por ventas.",
};
const Q_C6 = [
  { q: "Who leads the company?", options: ["The CEO", "The CFO", "The customer"], correct: 0, feedback: "CEO = Chief Executive Officer." },
  { q: "Who manages the budget and costs?", options: ["The CFO", "The Marketing Manager", "The Product Manager"], correct: 0, feedback: "CFO = Chief Financial Officer." },
  { q: "Who helps people discover the business?", options: ["The Marketing Manager", "The CFO", "Customer Service"], correct: 0, feedback: "Marketing = brand and promotion." },
  { q: "Cost $5,000, price $8,000. What is the profit?", options: ["$3,000", "$13,000", "$8,000"], correct: 0, feedback: "8,000 − 5,000 = 3,000." },
  { q: "A responsible business is…", options: ["honest with customers.", "secret about its prices.", "only interested in money."], correct: 0, feedback: "Honest, fair, and learns from mistakes." },
];

const ROLES = [
  { id: "ceo", e: "👑", t: "CEO", d: "Leads the company" },
  { id: "cfo", e: "💰", t: "CFO", d: "Money and budget" },
  { id: "mkt", e: "📣", t: "Marketing", d: "Brand and promotion" },
  { id: "prod", e: "🛠️", t: "Product", d: "Product or service" },
  { id: "cs", e: "💬", t: "Customer Service", d: "Customer needs" },
];
const ORG_SITUATIONS = {
  ceo: { q: "The team can't decide the main goal for this year. Who helps the team decide?", ok: "ceo" },
  cfo: { q: "The company has no money for materials. Who checks the budget?", ok: "cfo" },
  mkt: { q: "Customers do not know the brand. Who plans the promotion?", ok: "mkt" },
  prod: { q: "The product has a problem. Who reviews how it is made?", ok: "prod" },
  cs: { q: "A customer is angry because the order is late. Who listens and helps?", ok: "cs" },
};
function OrgChartGame({ studentName, existing, onSave, onExit }) {
  const order = ["ceo", "cfo", "mkt", "prod", "cs"];
  const [placed, setPlaced] = useState({});
  const [sel, setSel] = useState(null);
  const [bad, setBad] = useState(null);
  const [sit, setSit] = useState(null);
  const [sitWrong, setSitWrong] = useState([]);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState("build");
  const [people, setPeople] = useState(existing?.people || Object.fromEntries(order.map((k) => [k, k === "ceo" ? studentName : ""])));
  const [st, finish] = useFinish(onSave);
  const bank = useMemo(() => shuffleArr(ROLES), []);
  const tapSlot = (slot) => {
    if (placed[slot] || sel === null || sit) return;
    if (sel === slot) { setPlaced({ ...placed, [slot]: true }); setSel(null); setSit(slot); setSitWrong([]); }
    else { setBad(slot); setTimeout(() => setBad(null), 450); }
  };
  const answerSit = (id) => {
    if (id === ORG_SITUATIONS[sit].ok) {
      if (sitWrong.length === 0) setScore((s) => s + 1);
      setSit(null);
      if (Object.keys(placed).length === order.length) setStage("people");
    } else setSitWrong([...sitWrong, id]);
  };
  const slot = (id) => {
    const r = ROLES.find((x) => x.id === id);
    return (
      <button key={id} type="button" className={`p3-org-slot ${placed[id] ? "on" : ""} ${bad === id ? "p1-shake no" : ""}`} onClick={() => tapSlot(id)}>
        {placed[id] ? <><em>{r.e}</em><b>{r.t}</b><small>{stage === "people" ? (people[id] || "—") : r.d}</small></> : <><em>❔</em><small>{r.d}</small></>}
      </button>
    );
  };
  const ready = stage === "people" && people.ceo.trim() && order.every((k) => people[k].trim());
  if (st.done) return <Reward title="Org chart complete! 🏢" subtitle="Part 05 · Your company has a team." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Building2 size={22} strokeWidth={2.1} />} title="Build the Org Chart" subtitle={stage === "build" ? "Tap a role card, then tap the box with the right responsibility." : "Who does each job? You are the CEO!"} onExit={onExit}>
      {stage === "build" && (
        <div className="p3-org-bank">
          {bank.filter((r) => !placed[r.id]).map((r) => (
            <button key={r.id} type="button" className={sel === r.id ? "sel" : ""} disabled={!!sit} onClick={() => setSel(sel === r.id ? null : r.id)}><em>{r.e}</em>{r.t}</button>
          ))}
        </div>
      )}
      <div className="p3-org">
        <div className="p3-org-top">{slot("ceo")}</div>
        <div className="p3-org-line" />
        <div className="p3-org-row">{order.slice(1).map((id) => slot(id))}</div>
      </div>
      {sit && (
        <div className="p3-situation">
          <small>⚡ SITUATION</small>
          <p>{ORG_SITUATIONS[sit].q}</p>
          <div className="p3-org-bank">
            {ROLES.map((r) => <button key={r.id} type="button" disabled={sitWrong.includes(r.id)} className={sitWrong.includes(r.id) ? "no" : ""} onClick={() => answerSit(r.id)}><em>{r.e}</em>{r.t}</button>)}
          </div>
        </div>
      )}
      {stage === "people" && (
        <div className="start-block">
          <h3><Users size={18} /> Who is responsible?</h3>
          <p className="start-tip">You are the CEO. Write a classmate, a family member, or “Future hire” for the other roles.</p>
          {order.map((k) => {
            const r = ROLES.find((x) => x.id === k);
            return (
              <div key={k} className="p3-person">
                <span>{r.e} <b>{r.t}</b></span>
                <input className="start-input" value={people[k]} onChange={(e) => setPeople({ ...people, [k]: e.target.value })} placeholder="Future hire" />
                {k !== "ceo" && !people[k] && <button type="button" className="p1-chip" onClick={() => setPeople({ ...people, [k]: "Future hire" })}>Future hire</button>}
              </div>
            );
          })}
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(20 + score * 4, { score, people })}>Save my org chart <span className="coin-tag"><Coins size={15} /> +{20 + score * 4}</span></button></div>
    </ActShell>
  );
}

const SimTable = ({ cost, price, units, hide }) => (
  <div className="p3-sim">
    <span><small>Cost per unit</small><b>{cop(cost)}</b></span>
    <span><small>Selling price</small><b>{cop(price)}</b></span>
    {units && <span><small>Units sold</small><b>{units}</b></span>}
    {!hide && <span className={price - cost >= 0 ? "win" : "loss"}><small>Profit per unit</small><b>?</b></span>}
  </div>
);
const SIM_ROUNDS = [
  { tag: "ROUND 1 · NOTEBOOKS", q: "What is the profit per notebook?", visual: <SimTable cost={5000} price={8000} />, answer: 3000, money: true, hint: "Profit = price − cost.", explain: "8,000 − 5,000 = 3,000 per notebook. 🟢" },
  { tag: "ROUND 1 · NOTEBOOKS", q: "You sell 10 notebooks. What is your REVENUE (money from sales)?", visual: <SimTable cost={5000} price={8000} units={10} hide />, answer: 80000, money: true, hint: "Revenue = price × units.", explain: "10 × 8,000 = 80,000." },
  { tag: "ROUND 1 · NOTEBOOKS", q: "What are your total COSTS for 10 notebooks?", visual: <SimTable cost={5000} price={8000} units={10} hide />, answer: 50000, money: true, hint: "Costs = cost × units.", explain: "10 × 5,000 = 50,000." },
  { tag: "ROUND 1 · NOTEBOOKS", q: "So, what is your total PROFIT?", visual: <SimTable cost={5000} price={8000} units={10} hide />, answer: 30000, money: true, hint: "Revenue − costs.", explain: "80,000 − 50,000 = 30,000. 🎉" },
  { tag: "ROUND 2 · MATERIALS ARE MORE EXPENSIVE", q: "Paper is more expensive now. What is the profit per notebook?", visual: <SimTable cost={6000} price={8000} />, answer: 2000, money: true, hint: "8,000 − 6,000.", explain: "8,000 − 6,000 = 2,000. You still win, but less." },
  { tag: "ROUND 3 · BIG SALE!", q: "You sell each notebook for $4,000. What is the profit per notebook? (It can be negative!)", visual: <SimTable cost={5000} price={4000} />, answer: -1000, money: true, hint: "4,000 − 5,000 = ? Use the minus sign (−).", explain: "4,000 − 5,000 = −1,000. You LOSE money on every notebook! 🔴" },
  { tag: "ROUND 3 · DECISION", q: "You are losing $1,000 per notebook. What is the best decision?", options: ["Raise the price or find cheaper materials.", "Sell more notebooks at the same price.", "Close your eyes and continue."], correct: 0, explain: "Selling more at a loss = losing MORE money. Change the price or the cost!" },
  { tag: "VOCABULARY", q: "Revenue is…", options: ["all the money from sales.", "the money left after costs.", "the money to make the product."], correct: 0, explain: "Revenue = sales. Profit = revenue − costs." },
];

function FinanceCard({ concept, existing, onSave, onExit }) {
  const ex = existing || {};
  const [costs, setCosts] = useState(ex.costs || []);
  const [price, setPrice] = useState(ex.price ? String(ex.price) : "");
  const [units, setUnits] = useState(ex.units ? String(ex.units) : "");
  const [because, setBecause] = useState(ex.because || "");
  const [st, finish] = useFinish(onSave);
  const unitCost = total(costs);
  const p = num(price), u = num(units);
  const profitUnit = p - unitCost;
  const revenue = p * u, totalCost = unitCost * u, profit = revenue - totalCost;
  const ready = costs.length >= 2 && p > 0 && u > 0 && countWords(because) >= 4;
  const isService = concept?.type === "service";
  if (st.done) return <Reward title="CFO approved! 💼" subtitle="Part 06 · Your business finances are ready." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Calculator size={22} strokeWidth={2.1} />} title="My Business Finances" subtitle="You are the CFO now. Cost → price → profit." onExit={onExit}>
      {concept?.name && <div className="p1-banner"><Briefcase size={16} /> {concept.name}: <b>{concept.idea}</b></div>}
      <MoneyList title={`Cost of ONE ${isService ? "service (one session)" : "unit"}`} icon="🧾" tone="out" rows={costs} setRows={setCosts} min={2}
        suggestions={isService ? ["Transport", "Materials", "Snack", "Printing"] : ["Materials", "Packaging", "Stickers", "Paper", "Glue"]} namePh="What do you need?" />
      <div className="start-block">
        <h3><span className="step-n">2</span> Price and sales</h3>
        <div className="p2-grid2">
          <label className="p3-lbl">Selling price (one unit)<MoneyInput value={price} onChange={setPrice} placeholder="8000" /></label>
          <label className="p3-lbl">Units I can sell in one month<input className="start-input" type="number" min="0" value={units} onChange={(e) => setUnits(e.target.value)} placeholder="20" /></label>
        </div>
        {p > 0 && profitUnit <= 0 && <div className="p1-banner bad">⚠️ Your price is lower than (or equal to) your cost. You will lose money!</div>}
      </div>
      <div className="p3-fin">
        <div><small>Cost per unit</small><b>{cop(unitCost)}</b></div>
        <div><small>Price</small><b>{cop(p)}</b></div>
        <div className={profitUnit > 0 ? "win" : profitUnit < 0 ? "loss" : ""}><small>Profit per unit</small><b>{cop(profitUnit)}</b></div>
        <div><small>Revenue / month</small><b>{cop(revenue)}</b></div>
        <div><small>Costs / month</small><b>{cop(totalCost)}</b></div>
        <div className={profit > 0 ? "win big" : profit < 0 ? "loss big" : "big"}><small>Profit / month</small><b>{cop(profit)}</b></div>
      </div>
      {revenue > 0 && <StackBar parts={[{ label: "Costs", value: totalCost, color: "#ff6b57" }, { label: "Profit", value: Math.max(0, profit), color: "#16b074" }]} />}
      <div className="start-block">
        <h3><span className="step-n">3</span> Explain your price</h3>
        <div className="p3-sentence edit"><span>Our price is {cop(p)} because</span><input className="start-input" value={because} onChange={(e) => setBecause(e.target.value)} placeholder="it is fair for students and we can buy more materials." /></div>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(40, { costs, unitCost, price: p, units: u, revenue, totalCost, profit, profitUnit, because })}>Save my finances <span className="coin-tag"><Coins size={15} /> +40</span></button></div>
    </ActShell>
  );
}

const DILEMMAS = [
  { s: "Your cookies have a small problem: some are burnt. A customer wants to buy 5.", o: ["Tell the customer and sell only the good cookies.", "Hide the burnt ones in the bag.", "Sell them at a higher price."], ok: 0 },
  { s: "Another student copies your logo.", o: ["Talk to them respectfully and explain it is yours.", "Copy their logo too.", "Shout at them in class."], ok: 0 },
  { s: "Plastic bags are cheaper than paper bags for your packaging.", o: ["Think about the planet and look for a reusable option.", "Use 3 plastic bags for each product.", "Don't think about it."], ok: 0 },
  { s: "A customer says your product broke after one day.", o: ["Listen, say sorry and fix or change it.", "Say it was their fault.", "Ignore the message."], ok: 0 },
  { s: "Your friend wants to work in your company, but you can't pay much.", o: ["Be honest about the payment and agree together.", "Promise a lot of money you don't have.", "Give them all the work and no payment."], ok: 0 },
];
const RULE_CHIPS = ["We are always honest with our customers.", "We use materials that care for the planet.", "We treat our team fairly.", "We listen to complaints and fix our mistakes.", "We never copy other people's ideas."];
function EthicsLab({ existing, onSave, onExit }) {
  const deck = useMemo(() => DILEMMAS.map((d) => ({ ...d, order: shuffleArr([0, 1, 2]) })), []);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);
  const [rule, setRule] = useState(existing?.rule || "");
  const [st, finish] = useFinish(onSave);
  const d = deck[i];
  const done = i >= deck.length;
  const choose = (k) => { if (pick !== null) return; setPick(k); if (k === d.ok) setScore((s) => s + 1); };
  if (st.done) return <Reward title="Responsible business! 🤝" subtitle="Your company has a clear commitment." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<ShieldCheck size={22} strokeWidth={2.1} />} title="The Responsible Boss" subtitle="Hard decisions! What does a responsible business do?" onExit={onExit}>
      {!done ? (
        <div className="start-block">
          <div className="p2-hud"><span>Decision <b>{i + 1}/{deck.length}</b></span><span>Responsible ✅ <b>{score}</b></span></div>
          <p className="quiz-q">{d.s}</p>
          <div className="quiz-options">
            {d.order.map((k, pos) => (
              <button key={k} type="button" disabled={pick !== null} onClick={() => choose(k)}
                className={`quiz-opt ${pick !== null && k === d.ok ? "correct" : ""} ${pick === k && k !== d.ok ? "wrong" : ""}`}>
                <span className="opt-key">{"ABC"[pos]}</span><span className="opt-text">{d.o[k]}</span>
              </button>
            ))}
          </div>
          {pick !== null && <div className="start-foot"><button className="s1-btn primary" onClick={() => { setI(i + 1); setPick(null); }}>Next <ChevronRight size={16} /></button></div>}
        </div>
      ) : (
        <div className="start-block">
          <h3><Heart size={18} /> My responsible business rule</h3>
          <p className="start-tip">Choose one or write your own. It will appear on your final company card.</p>
          <div className="p1-starters">{RULE_CHIPS.map((r) => <button key={r} type="button" className={`p1-chip ${rule === r ? "on" : ""}`} onClick={() => setRule(r)}>{r}</button>)}</div>
          <input className="start-input" value={rule} onChange={(e) => setRule(e.target.value)} placeholder="We always…" />
          <div className="start-foot"><button className="s1-btn primary big" disabled={countWords(rule) < 4} onClick={() => finish(15 + score * 3, { score, rule })}>Save my rule <span className="coin-tag"><Coins size={15} /> +{15 + score * 3}</span></button></div>
        </div>
      )}
    </ActShell>
  );
}

/* =====================================================================
   CLASE 31 · PROTOTYPE & IMPROVE
   ===================================================================== */
const READ_C7 = [
  { h: "From Idea to Prototype" },
  { p: "A prototype is an early version of a product. It helps people see how an idea could work." },
  { p: "A prototype does not need to be perfect. You can use paper, cardboard, drawings, or a digital model." },
  { p: "After building it, ask other people to test it. Listen to their feedback. What do they like? What is confusing? What can you improve?" },
  { p: "Sometimes, an idea does not work as expected. This is not the end. Entrepreneurs learn from mistakes and try new solutions." },
  { node: <div className="p3-cycle">{["🔨 Build it", "🧪 Test it", "💡 Learn from it", "⬆️ Improve it"].map((x, i) => <span key={x}><b>{i + 1}</b>{x}</span>)}</div> },
];
const GLOSS_C7 = { "prototype": "Prototipo — primera versión de un producto.", "feedback": "Retroalimentación — opiniones para mejorar.", "improve": "Mejorar.", "cardboard": "Cartón." };
const OOPS = [
  { e: "🤷", s: "Customers do not understand your product.", r: [
    { t: "Ask them what is confusing and make the explanation simpler.", k: "investigate" },
    { t: "Say they are not smart enough.", k: "impulsive" },
    { t: "Do nothing. They will understand one day.", k: "ignore" }] },
  { e: "💥", s: "Your prototype breaks in front of the class.", r: [
    { t: "Throw it away and quit.", k: "impulsive" },
    { t: "Check which part broke and build it stronger.", k: "investigate" },
    { t: "Hide it and don't talk about it.", k: "ignore" }] },
  { e: "📈", s: "Your costs are higher than expected.", r: [
    { t: "Keep the same price and lose money.", k: "ignore" },
    { t: "Look for cheaper materials or review your price.", k: "investigate" },
    { t: "Triple the price right now.", k: "impulsive" }] },
  { e: "🔍", s: "A classmate says your logo is difficult to read.", r: [
    { t: "Get angry and change nothing.", k: "impulsive" },
    { t: "Ask 2 more people and test a clearer font.", k: "investigate" },
    { t: "Pretend you didn't hear.", k: "ignore" }] },
  { e: "😴", s: "Nobody comes to your stand in the first 5 minutes.", r: [
    { t: "Go home.", k: "impulsive" },
    { t: "Sit and wait on your phone.", k: "ignore" },
    { t: "Smile, invite people and show your prototype.", k: "investigate" }] },
  { e: "📝", s: "Your survey shows customers want a different color.", r: [
    { t: "Test a new color with a small group.", k: "investigate" },
    { t: "Ignore the survey — you like your color.", k: "ignore" },
    { t: "Change everything about your company.", k: "impulsive" }] },
];
const OOPS_FB = { investigate: "🔎 Great! You investigated and improved. That's a growth mindset.", impulsive: "😤 That's an impulsive reaction. Stop, breathe, and look for the cause.", ignore: "🙈 Ignoring the problem doesn't fix it. Listen and try a solution." };
function OopsLab({ onSave, onExit }) {
  const deck = useMemo(() => shuffleArr(OOPS).map((o) => ({ ...o, r: shuffleArr(o.r) })), []);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);
  const [st, finish] = useFinish(onSave);
  const c = deck[i];
  const choose = (k) => { if (pick) return; setPick(k); if (k === "investigate") setScore((s) => s + 1); };
  const next = () => { if (i < deck.length - 1) { setI(i + 1); setPick(null); } else finish(score * 4 + 6, { score, total: deck.length }); };
  if (st.done) return <Reward title="Growth mindset! 🌱" subtitle="Mistakes are part of every startup." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Wrench size={22} strokeWidth={2.1} />} title="Oops! Startup Lab 🧪" subtitle="Something went wrong! Choose the best reaction." onExit={onExit}>
      <div className="p2-hud"><span>Incident <b>{i + 1}/{deck.length}</b></span><span>🔎 Smart reactions <b>{score}</b></span></div>
      <div className="p3-oops"><em>{c.e}</em><small>INCIDENT CARD</small><p>{c.s}</p></div>
      <div className="quiz-options">
        {c.r.map((r, k) => (
          <button key={k} type="button" disabled={!!pick} onClick={() => choose(r.k)}
            className={`quiz-opt ${pick && r.k === "investigate" ? "correct" : ""} ${pick === r.k && r.k !== "investigate" ? "wrong" : ""}`}>
            <span className="opt-key">{"ABC"[k]}</span><span className="opt-text">{r.t}</span>
          </button>
        ))}
      </div>
      {pick && <div className={`p1-banner ${pick === "investigate" ? "good" : "bad"}`}>{OOPS_FB[pick]}</div>}
      {pick && <div className="start-foot"><button className="s1-btn primary big" onClick={next}>{i < deck.length - 1 ? "Next incident" : "Finish"} <ChevronRight size={18} /></button></div>}
    </ActShell>
  );
}

const PROTO_KINDS = {
  product: ["✏️ Drawing with labels", "📦 Cardboard model", "🎁 Packaging", "🧪 First version"],
  service: ["🗺️ Service journey", "🎬 Example session", "🙋 Demonstration", "📱 Simulated screen"],
};
const MATERIALS = ["Paper", "Cardboard", "Colors", "Scissors", "Glue", "Tape", "Recycled bottles", "Tablet", "Stickers", "Fabric"];
function PrototypeStudio({ concept, brand, existing, onSave, onExit }) {
  const ex = existing || {};
  const type = concept?.type === "service" ? "service" : "product";
  const [kind, setKind] = useState(ex.kind || "");
  const [what, setWhat] = useState(ex.what || "");
  const [mats, setMats] = useState(ex.materials || []);
  const [steps, setSteps] = useState(ex.steps || ["", "", ""]);
  const [peer, setPeer] = useState(ex.peer || "");
  const [fb, setFb] = useState(ex.feedback || ["", "", ""]);
  const [change, setChange] = useState(ex.change || "");
  const [st, finish] = useFinish(onSave);
  const togMat = (m) => setMats((a) => (a.includes(m) ? a.filter((x) => x !== m) : [...a, m]));
  const ok1 = kind && countWords(what) >= 6 && mats.length >= 2 && steps.every((s) => countWords(s) >= 2);
  const ok2 = peer.trim() && fb.every((f) => countWords(f) >= 2);
  const ready = ok1 && ok2 && countWords(change) >= 6;
  if (st.done) return <Reward title="Prototype tested & improved! 🔧" subtitle="Part 07 · Build. Test. Learn. Improve." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Hammer size={22} strokeWidth={2.1} />} title="Prototype Studio" subtitle={`Build a ${type === "service" ? "service" : "product"} prototype, test it with a classmate and improve it.`} onExit={onExit}>
      {brand?.icon && <div className="p1-center"><LogoMark brand={brand} size={52} row /></div>}
      <div className="p3-stepper">
        {["Build", "Test", "Improve"].map((s, k) => <span key={s} className={[ok1, ok2, ready][k] ? "on" : ""}><b>{k + 1}</b>{s}</span>)}
      </div>
      <div className="start-block">
        <h3><span className="step-n">1</span> 🔨 Build — my prototype</h3>
        <div className="p1-starters">{PROTO_KINDS[type].map((k) => <button key={k} type="button" className={`p1-chip ${kind === k ? "on" : ""}`} onClick={() => setKind(k)}>{k}</button>)}</div>
        <WordField value={what} onChange={setWhat} min={6} max={50} rows={2} placeholder="My prototype is a cardboard planner with three pockets and a recycled cover." />
        <span className="terms-label">Materials:</span>
        <div className="p1-starters">{MATERIALS.map((m) => <button key={m} type="button" className={`p1-chip ${mats.includes(m) ? "on" : ""}`} onClick={() => togMat(m)}>{m}</button>)}</div>
        <span className="terms-label">3 steps to make it:</span>
        {steps.map((s, k) => <input key={k} className="start-input p3-gap" value={s} onChange={(e) => setSteps(steps.map((x, j) => (j === k ? e.target.value : x)))} placeholder={["First, I cut…", "Then, I…", "Finally, I…"][k]} />)}
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> 🧪 Test — feedback from a classmate</h3>
        <input className="start-input p3-gap" value={peer} onChange={(e) => setPeer(e.target.value)} placeholder="Classmate's name" />
        {["👍 One thing I like…", "🤔 One thing I do not understand yet…", "💡 One suggestion to improve it…"].map((l, k) => (
          <label key={l} className="p3-lbl">{l}<input className="start-input" value={fb[k]} onChange={(e) => setFb(fb.map((x, j) => (j === k ? e.target.value : x)))} placeholder="Your classmate writes here" /></label>
        ))}
      </div>
      <div className="start-block">
        <h3><span className="step-n">3</span> ⬆️ Improve — my Entrepreneurial Journal</h3>
        <Starters items={["I changed … because…", "Now my prototype…", "My classmate said… so I…"]} onPick={appendStarter(setChange)} />
        <WordField value={change} onChange={setChange} min={6} max={50} rows={2} placeholder="I changed the cover because my classmate said it was difficult to open." />
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(45, { kind, what, materials: mats, steps, peer, feedback: fb, change })}>Save my prototype <span className="coin-tag"><Coins size={15} /> +45</span></button></div>
    </ActShell>
  );
}

/* Pitch: guion autollenado con la empresa + cronómetro de ensayo */
const PITCH_PARTS = [
  { k: "who", l: "1 · Who I am and my company", ph: "Hello! My name is … and my company is …" },
  { k: "problem", l: "2 · The problem I solve", ph: "Many students …" },
  { k: "customer", l: "3 · My customers", ph: "Our customers are …" },
  { k: "product", l: "4 · What my product or service does", ph: "We offer … It helps …" },
  { k: "mv", l: "5 · Mission and vision", ph: "Our mission is … In the future, we want to …" },
  { k: "how", l: "6 · How it works and why it is useful", ph: "Our price is … because … It is useful because …" },
];
function pitchSeed(c) {
  return {
    who: `Hello! My name is ${c.founder || "…"} and my company is ${c.name}.${c.slogan ? ` Our slogan is “${c.slogan}”.` : ""}`,
    problem: c.problem ? `The problem is: ${c.problem}` : "",
    customer: c.customer ? `Our customers are ${c.customer}.` : "",
    product: c.value ? `${c.idea ? c.idea + " " : ""}${c.value}` : (c.idea || ""),
    mv: c.mission ? `Our mission: ${c.mission} ${c.vision || ""}` : "",
    how: c.finance ? `Our price is ${cop(c.finance.price)} because ${c.finance.because || "…"}` : "",
  };
}
function PitchStudio({ company, existing, onSave, onExit }) {
  const [parts, setParts] = useState(() => ({ ...pitchSeed(company), ...(existing?.parts || {}) }));
  const [stage, setStage] = useState("write");
  const [t, setT] = useState(0);
  const [on, setOn] = useState(false);
  const [runs, setRuns] = useState(existing?.runs || []);
  const [st, finish] = useFinish(onSave);
  useEffect(() => { if (!on) return; const id = setInterval(() => setT((x) => x + 1), 1000); return () => clearInterval(id); }, [on]);
  const allOk = PITCH_PARTS.every((p) => countWords(parts[p.k]) >= 4);
  const stop = () => { setOn(false); if (t >= 10) setRuns((r) => [...r, t]); setT(0); };
  const good = runs.filter((r) => r >= 60 && r <= 90).length;
  const coins = 30 + (good > 0 ? 10 : 0);
  const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  if (st.done) return <Reward title="Pitch ready! 🎤" subtitle="You can present your company in English." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Megaphone size={22} strokeWidth={2.1} />} title="Pitch Studio 🎤" subtitle="60–90 seconds to convince the investors!" onExit={onExit}>
      <div className="p3-mock-tabs">
        <button type="button" className={stage === "write" ? "on" : ""} onClick={() => { setStage("write"); setOn(false); }}>✍️ Write my pitch</button>
        <button type="button" className={stage === "practice" ? "on" : ""} disabled={!allOk} onClick={() => setStage("practice")}>⏱️ Practice</button>
      </div>
      {stage === "write" && (
        <div className="start-block">
          <p className="start-tip">✨ We filled your pitch with everything you built. Read it, fix it and make it yours.</p>
          {PITCH_PARTS.map((p) => (
            <label key={p.k} className="p3-lbl">
              {p.l}
              <textarea className="start-input" rows={2} value={parts[p.k]} onChange={(e) => setParts({ ...parts, [p.k]: e.target.value })} placeholder={p.ph} />
            </label>
          ))}
          <div className="start-foot"><button className="s1-btn primary" disabled={!allOk} onClick={() => setStage("practice")}>Practice my pitch <ChevronRight size={16} /></button></div>
        </div>
      )}
      {stage === "practice" && (
        <>
          <div className={`p3-timer ${t >= 60 && t <= 90 ? "ok" : t > 90 ? "over" : ""}`}>
            <b>{mmss(t)}</b>
            <div className="p3-timer-bar"><i style={{ width: `${Math.min(100, (t / 90) * 100)}%` }} /><span style={{ left: `${(60 / 90) * 100}%` }} /></div>
            <small>Target: 1:00 – 1:30</small>
            {!on ? <button className="s1-btn primary big" onClick={() => { setT(0); setOn(true); }}><Play size={17} /> Start</button>
              : <button className="s1-btn primary big" onClick={stop}><Check size={17} /> Stop</button>}
          </div>
          <div className="p3-prompter">{PITCH_PARTS.map((p) => <p key={p.k}><small>{p.l}</small>{parts[p.k]}</p>)}</div>
          <div className="p2-hud"><span>Practice runs <b>{runs.length}/2</b></span>{runs.map((r, k) => <span key={k} className={r >= 60 && r <= 90 ? "" : "p2-hot"}>Run {k + 1}: <b>{mmss(r)}</b></span>)}</div>
          {runs.length > 0 && good === 0 && <p className="start-tip p1-center">{runs[runs.length - 1] < 60 ? "Too fast! Speak slower and add one detail." : "Too long! Make your sentences shorter."}</p>}
        </>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!allOk || runs.length < 2} onClick={() => finish(coins, { parts, runs })}>Save my pitch <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   CLASE 32 · YOUNG ENTREPRENEURS FAIR
   ===================================================================== */
const ORG_KEYS = ["cfo", "mkt", "prod", "cs"];

/* Mezcla un color con blanco (html2canvas no entiende color-mix) */
const tint = (hex, k) => {
  const h = String(hex || "#bdeed7").replace("#", "");
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return "#" + c.map((v) => Math.round(v * k + 255 * (1 - k)).toString(16).padStart(2, "0")).join("");
};

/* La infografía final: se arma sola con todo lo que el estudiante creó */
function CompanyInfographic({ company: c, id }) {
  const pal = palOf(c.brand?.palette).c;
  const f = c.finance;
  const orgRole = (k) => ROLES.find((r) => r.id === k);
  const empty = <i className="p3-info-empty">Not built yet</i>;
  return (
    <div className="p3-info" id={id} style={{ "--c0": pal[0], "--c1": pal[1], "--c2": pal[2], "--c1s": tint(pal[1], 0.35), "--c1m": tint(pal[1], 0.55) }}>
      <header className="p3-info-head">
        <div className="p3-info-logo"><LogoMark brand={{ ...c.brand, name: c.name, slogan: "" }} size={86} showName={false} /></div>
        <div>
          <small>MY COMPANY IDENTITY CARD</small>
          <h2 style={{ fontFamily: fontOf(c.brand?.font).css }}>{c.name}</h2>
          {c.slogan && <p>“{c.slogan}”</p>}
        </div>
        <div className="p3-info-founder"><em>{c.avatar}</em><b>{c.founder}</b><small>Founder & CEO{c.alias ? ` · ${c.alias}` : ""}</small></div>
      </header>

      <div className="p3-info-value"><small>💡 VALUE PROPOSITION</small><p>{c.value || empty}</p>{c.type && <span>{c.type === "service" ? "🤝 Service" : "📦 Product"}</span>}</div>

      <div className="p3-info-grid">
        <section><h4>⚠️ The problem</h4><p>{c.problem || empty}</p>{c.where && <small>📍 {c.where}</small>}</section>
        <section><h4>👥 Our customers</h4><p>{c.customer || empty}</p>{c.learned?.[0] && <small>🗣️ We learned: {c.learned[0]}</small>}</section>
        <section><h4>🎯 Mission</h4><p>{c.mission || empty}</p></section>
        <section><h4>🔭 Vision</h4><p>{c.vision || empty}</p>{c.values?.length > 0 && <div className="p3-info-tags">{c.values.map((v) => <i key={v}>{v}</i>)}</div>}</section>
      </div>

      <div className="p3-info-split">
        <section className="p3-info-org">
          <h4>🏢 Organization chart</h4>
          {c.org ? (
            <div className="p3-info-tree">
              <div className="ceo"><em>👑</em><b>CEO</b><small>{c.org.ceo}</small></div>
              <div className="kids">{ORG_KEYS.map((k) => <div key={k}><em>{orgRole(k).e}</em><b>{orgRole(k).t}</b><small>{c.org[k]}</small></div>)}</div>
            </div>
          ) : empty}
        </section>
        <section className="p3-info-money">
          <h4>💰 Business finances</h4>
          {f ? (
            <>
              <div className="p3-info-eq">
                <span><small>Price</small><b>{cop(f.price)}</b></span><i>−</i>
                <span><small>Cost</small><b>{cop(f.unitCost)}</b></span><i>=</i>
                <span className={f.profitUnit >= 0 ? "win" : "loss"}><small>Profit</small><b>{cop(f.profitUnit)}</b></span>
              </div>
              <p className="p3-info-month">{f.units} units / month → <b>{cop(f.profit)}</b> profit</p>
              {f.because && <small>“Our price is {cop(f.price)} because {f.because}”</small>}
            </>
          ) : empty}
        </section>
      </div>

      <div className="p3-info-split">
        <section><h4>🔧 Prototype</h4>{c.prototype ? <><p>{c.prototype.what}</p>{c.prototype.change && <small>⬆️ Improvement: {c.prototype.change}</small>}</> : empty}</section>
        <section className="p3-info-rule"><h4>🤝 Responsible commitment</h4><p>{c.rule || empty}</p></section>
      </div>

      <footer className="p3-info-foot">
        <span>{c.skills?.length ? `Skills: ${c.skills.join(" · ")}` : ""}</span>
        <span>🚀 Young Entrepreneurs Lab · Instituto CREAR · Grade 6</span>
      </footer>
    </div>
  );
}

const loadHtml2Canvas = () => (window.html2canvas ? Promise.resolve(window.html2canvas) : new Promise((res, rej) => {
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  s.onload = () => res(window.html2canvas); s.onerror = rej;
  document.body.appendChild(s);
}));

function IdentityCard({ company, userData, API_URL, onSave, onExit, onJump }) {
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(null);
  const [published, setPublished] = useState(false);
  const [st, finish] = useFinish(onSave);
  const built = company.parts.slice(0, 7).filter((p) => p.done).length;
  const missing = company.parts.slice(0, 7).filter((p) => !p.done);
  const minimum = !!company.problem && !!company.value && !!company.brand?.icon;
  const fileName = `${(company.name || "company").replace(/[^\w-]+/g, "_")}_identity_card.png`;

  const download = async () => {
    setBusy("png"); setMsg(null);
    try {
      const h2c = await loadHtml2Canvas();
      const el = document.getElementById("p3-final-card");
      const canvas = await h2c(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const a = document.createElement("a"); a.href = canvas.toDataURL("image/png"); a.download = fileName; a.click();
    } catch (e) { setMsg({ type: "bad", text: "I couldn't create the image. Try Print → Save as PDF." }); }
    finally { setBusy(""); }
  };
  const print = () => {
    document.body.classList.add("p3-printing");
    const off = () => { document.body.classList.remove("p3-printing"); window.removeEventListener("afterprint", off); };
    window.addEventListener("afterprint", off);
    setTimeout(() => window.print(), 50);
  };
  const publish = async () => {
    setBusy("pub"); setMsg(null);
    try {
      const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "fair_publish", user_key: userData.Student_Key, nombre: userData.Nombre_Completo, grado: GRADE, company: { ...company, parts: undefined } }) });
      const d = await res.json();
      if (d.status === "error") { setMsg({ type: "bad", text: d.message }); return false; }
      setPublished(true); setMsg({ type: "good", text: "Your stand is open at the Fair! 🎪" }); return true;
    } catch (e) { setMsg({ type: "bad", text: "Connection problem. Try again." }); return false; }
    finally { setBusy(""); }
  };
  if (st.done) return <Reward title="Your company is LIVE! 🚀" subtitle="Part 08 · Show your Identity Card to your teacher." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Award size={22} strokeWidth={2.1} />} title="My Company Identity Card" subtitle="This card builds itself with everything you created this period." onExit={onExit}>
      <div className="p3-check">
        <div className="p3-check-head"><b>Company builder</b><span>{built}/7 parts</span></div>
        <div className="p3-parts">
          {company.parts.slice(0, 7).map((p) => <span key={p.id} className={p.done ? "on" : ""}><b>{p.done ? "✓" : p.n}</b>{p.label}</span>)}
        </div>
        {missing.length > 0 && (
          <div className="p2-missing"><b>Missing parts (your card shows “Not built yet”):</b>
            {missing.map((p) => <span key={p.id}>• {p.label} {onJump && <button type="button" className="p1-link" onClick={() => onJump(p.id)}>Go build it →</button>}</span>)}
          </div>
        )}
      </div>
      <CompanyInfographic company={company} id="p3-final-card" />
      <div className="p3-card-actions">
        <button className="s1-btn ghost" disabled={!!busy} onClick={download}><Download size={17} /> {busy === "png" ? "Creating image…" : "Download PNG"}</button>
        <button className="s1-btn ghost" onClick={print}><Printer size={17} /> Print / PDF</button>
        <button className="s1-btn ghost" disabled={!!busy || !minimum} onClick={publish}><Store size={17} /> {published ? "Update my Fair stand" : busy === "pub" ? "Opening…" : "Open my stand at the Fair"}</button>
      </div>
      {msg && <div className={`p1-banner ${msg.type === "good" ? "good" : "bad"}`}>{msg.text}</div>}
      {!minimum && <p className="start-tip p1-center">To publish you need at least: a problem, a value proposition and a logo.</p>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!minimum || !published} onClick={() => finish(50, { built, publishedAt: nowISO() })}>
        {published ? "My card is ready!" : "Open your stand first"} <span className="coin-tag"><Coins size={15} /> +50</span></button></div>
    </ActShell>
  );
}

/* Investor Walk: feria en vivo con monedas virtuales */
const INVEST_CATS = [
  { id: "clarity", label: "Clarity", e: "🔍" }, { id: "useful", label: "Useful", e: "🛠️" },
  { id: "creative", label: "Creative", e: "🎨" }, { id: "responsible", label: "Responsible", e: "🤝" },
];
function FairWalk({ userData, API_URL, onSave, onExit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [open, setOpen] = useState(null);
  const [amt, setAmt] = useState(20);
  const [cat, setCat] = useState("useful");
  const [note, setNote] = useState({ problem: "", value: "" });
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("walk");
  const [st, finish] = useFinish(onSave);
  const post = async (action, extra = {}) => {
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action, user_key: userData.Student_Key, nombre: userData.Nombre_Completo, grado: GRADE, ...extra }) });
    return res.json();
  };
  const load = async () => {
    setLoading(true); setMsg(null);
    try { const d = await post("fair_list"); if (d.status === "error") setMsg({ type: "bad", text: d.message }); else setData(d); }
    catch (e) { setMsg({ type: "bad", text: "Connection problem. Try again." }); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const companies = data?.companies || [];
  const others = companies.filter((c) => c.key !== userData.Student_Key);
  const mineInv = data?.mine || [];
  const left = data?.left ?? 100;
  const visited = new Set(mineInv.map((m) => m.company));
  const comp = others.find((c) => c.key === open);
  const invest = async () => {
    if (countWords(note.problem) < 3 || countWords(note.value) < 3) return;
    setBusy(true); setMsg(null);
    try {
      const d = await post("fair_invest", { company_key: open, amount: amt, category: cat, note: `Problem: ${note.problem} | Value: ${note.value}` });
      if (d.status === "error") setMsg({ type: "bad", text: d.message });
      else { setData(d); setOpen(null); setNote({ problem: "", value: "" }); setMsg({ type: "good", text: `You invested ${amt} coins! 💸` }); }
    } catch (e) { setMsg({ type: "bad", text: "Connection problem. Try again." }); }
    finally { setBusy(false); }
  };
  const board = companies.slice().sort((a, b) => (b.total || 0) - (a.total || 0));
  const catWinner = (id) => companies.slice().sort((a, b) => (b.cats?.[id] || 0) - (a.cats?.[id] || 0))[0];
  const myStand = companies.find((c) => c.key === userData.Student_Key);
  const need = Math.max(1, Math.min(3, others.length));
  const coins = 20 + Math.min(visited.size, 5) * 4;

  if (st.done) return <Reward title="Super investor! 💼" subtitle={`You visited ${visited.size} companies.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  if (comp) {
    const c = comp.company || {};
    return (
      <ActShell icon={<Store size={22} strokeWidth={2.1} />} title={`Stand · ${c.name || "Company"}`} subtitle="Listen to the pitch. Then complete your investor card." onExit={() => setOpen(null)}>
        <CompanyInfographic company={{ ...c, brand: c.brand || DEFAULT_BRAND }} />
        <div className="start-block p3-investor">
          <h3><Briefcase size={18} /> My investor card</h3>
          <label className="p3-lbl">What problem does it solve?<input className="start-input" value={note.problem} onChange={(e) => setNote({ ...note, problem: e.target.value })} placeholder="It helps students who…" /></label>
          <label className="p3-lbl">What value does it offer?<input className="start-input" value={note.value} onChange={(e) => setNote({ ...note, value: e.target.value })} placeholder="It is useful because…" /></label>
          <span className="terms-label">Best category:</span>
          <div className="p1-starters">{INVEST_CATS.map((x) => <button key={x.id} type="button" className={`p1-chip ${cat === x.id ? "on" : ""}`} onClick={() => setCat(x.id)}>{x.e} {x.label}</button>)}</div>
          <span className="terms-label">Invest (you have {left} coins):</span>
          <div className="p3-invest">{[10, 20, 30, 50].map((a) => <button key={a} type="button" disabled={a > left} className={amt === a ? "on" : ""} onClick={() => setAmt(a)}>🪙 {a}</button>)}</div>
          {msg && <div className={`p1-banner ${msg.type === "good" ? "good" : "bad"}`}>{msg.text}</div>}
          <div className="start-foot"><button className="s1-btn primary big" disabled={busy || amt > left || countWords(note.problem) < 3 || countWords(note.value) < 3} onClick={invest}>{busy ? "Investing…" : `Invest ${amt} coins`} 💸</button></div>
        </div>
      </ActShell>
    );
  }
  return (
    <ActShell icon={<Store size={22} strokeWidth={2.1} />} title="The Investor Walk 🎪" subtitle="Visit the stands, listen to the pitches and invest your 100 coins." onExit={onExit}>
      <div className="p2-hud">
        <span>💰 Coins left <b>{left}/100</b></span><span>🏪 Stands visited <b>{visited.size}/{need}+</b></span>
        <button type="button" className="p1-link" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>
      {!myStand && !loading && <div className="p1-banner">⚠️ Your stand is not open yet. Go to <b>My Company Identity Card</b> and open it.</div>}
      <div className="p3-mock-tabs">
        <button type="button" className={tab === "walk" ? "on" : ""} onClick={() => setTab("walk")}>🏪 Stands</button>
        <button type="button" className={tab === "board" ? "on" : ""} onClick={() => setTab("board")}>🏆 Leaderboard</button>
      </div>
      {msg && <div className={`p1-banner ${msg.type === "good" ? "good" : "bad"}`}>{msg.text}</div>}
      {loading && <p className="start-tip p1-center">Loading the Fair…</p>}
      {!loading && tab === "walk" && (
        others.length === 0 ? <p className="start-tip p1-center">No other stands yet. Ask your classmates to open theirs and press Refresh.</p> : (
          <div className="p3-stands">
            {others.map((s) => {
              const c = s.company || {};
              const mine = mineInv.filter((m) => m.company === s.key).reduce((a, m) => a + Number(m.amount || 0), 0);
              return (
                <button key={s.key} type="button" className={`p3-stand ${mine ? "visited" : ""}`} onClick={() => setOpen(s.key)} style={{ "--c0": palOf(c.brand?.palette).c[0], "--c1": palOf(c.brand?.palette).c[1] }}>
                  <div className="p3-stand-roof" />
                  <LogoMark brand={{ ...(c.brand || DEFAULT_BRAND), name: c.name, slogan: c.slogan }} size={58} />
                  <p>{c.value || c.idea || "…"}</p>
                  <small>{mine ? `✅ You invested ${mine}` : "Visit stand →"}</small>
                </button>
              );
            })}
          </div>
        )
      )}
      {!loading && tab === "board" && (
        <div className="start-block">
          <div className="p3-cat-win">
            {INVEST_CATS.map((x) => { const w = catWinner(x.id); return <div key={x.id}><em>{x.e}</em><small>Most {x.label}</small><b>{w && w.cats?.[x.id] ? w.company?.name : "—"}</b></div>; })}
          </div>
          <div className="p3-board">
            {board.map((s, k) => (
              <div key={s.key} className={s.key === userData.Student_Key ? "me" : ""}>
                <span>{["🥇", "🥈", "🥉"][k] || k + 1}</span>
                <LogoMark brand={{ ...(s.company?.brand || DEFAULT_BRAND), name: s.company?.name }} size={30} row />
                <b>🪙 {s.total || 0}</b>
              </div>
            ))}
          </div>
          <p className="start-tip">Remember: coins show what people liked. Your grade comes from your work and your learning. 😉</p>
        </div>
      )}
      <div className="start-foot"><button className="s1-btn primary big" disabled={visited.size < need} onClick={() => finish(coins, { visited: visited.size, spent: 100 - left })}>Finish the walk <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
    </ActShell>
  );
}

/* Hot Seat: preguntas sorpresa de inversionistas */
const HOT_QS = [
  "What makes your business different?",
  "Who is your customer?",
  "Why is your price fair?",
  "What would you change if your business failed?",
  "How does your company help the community?",
  "What did you learn from your customers?",
];
function HotSeat({ company, existing, onSave, onExit }) {
  const deck = useMemo(() => sample(HOT_QS, 4), []);
  const [i, setI] = useState(-1);
  const [t, setT] = useState(45);
  const [ans, setAns] = useState(existing?.answers || {});
  const [said, setSaid] = useState(false);
  const [st, finish] = useFinish(onSave);
  useEffect(() => { if (i < 0 || i >= deck.length || t <= 0) return; const id = setTimeout(() => setT((x) => x - 1), 1000); return () => clearTimeout(id); }, [i, t, deck.length]);
  const q = deck[i];
  const cur = ans[q] || "";
  const next = () => { setI(i + 1); setT(45); };
  if (st.done) return <Reward title="You survived the Hot Seat! 🔥" subtitle="Investors love clear answers." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Mic size={22} strokeWidth={2.1} />} title="The Hot Seat 🔥" subtitle="Surprise questions from the investors. 45 seconds each!" onExit={onExit}>
      {i < 0 && (
        <div className="p3-hot-start">
          <LogoMark brand={company.brand} size={70} />
          <p>4 surprise questions. Answer in writing, then say your answer aloud to a partner.</p>
          <button className="s1-btn primary big" onClick={() => { setI(0); setT(45); }}><Play size={17} /> Sit in the Hot Seat</button>
        </div>
      )}
      {i >= 0 && i < deck.length && (
        <div className="start-block">
          <div className="p2-hud"><span>Question <b>{i + 1}/{deck.length}</b></span><span className={t <= 10 ? "p2-hot" : ""}>⏱️ <b>{t}s</b></span></div>
          <div className="p3-oops hot"><em>🎤</em><small>INVESTOR QUESTION</small><p>{q}</p></div>
          <WordField value={cur} onChange={(v) => setAns({ ...ans, [q]: v })} min={6} max={50} rows={3} placeholder="Our business is different because…" />
          {t <= 0 && <p className="start-tip">⏰ Time! Finish your sentence and continue.</p>}
          <div className="start-foot"><button className="s1-btn primary" disabled={countWords(cur) < 6} onClick={next}>{i < deck.length - 1 ? "Next question" : "Finish"} <ChevronRight size={16} /></button></div>
        </div>
      )}
      {i >= deck.length && (
        <div className="start-block">
          <h3><Check size={18} /> My answers</h3>
          {deck.map((qq) => <div key={qq} className="p3-interview"><b>🎤 {qq}</b><div><p>{ans[qq]}</p></div></div>)}
          <label className="perm-check p1-check"><input type="checkbox" checked={said} onChange={(e) => setSaid(e.target.checked)} /><span>🎤 I said my answers aloud to a partner.</span></label>
          <div className="start-foot"><button className="s1-btn primary big" disabled={!said} onClick={() => finish(30, { answers: Object.fromEntries(deck.map((qq) => [qq, ans[qq]])) })}>Save <span className="coin-tag"><Coins size={15} /> +30</span></button></div>
        </div>
      )}
    </ActShell>
  );
}

const BOSS_P3 = [
  { q: "An entrepreneur is a person who…", options: ["creates a business or idea to solve a problem.", "only spends money.", "never makes mistakes."], correct: 0, feedback: "Solve problems, create value." },
  { q: "Which law promotes entrepreneurship in Colombia?", options: ["Law 1014 of 2006", "Law 30 of 1992", "Law 115 of 1994"], correct: 0, feedback: "Law 1014 of 2006." },
  { q: "A good business idea begins with…", options: ["a real problem.", "a famous logo.", "a lot of money."], correct: 0, feedback: "Observe → ask → solve." },
  { q: "Which is the BEST interview question?", options: ["“What is difficult for you at school?”", "“Do you like my idea?”", "“My product is amazing, right?”"], correct: 0, feedback: "Ask about needs." },
  { q: "Dog walking is a…", options: ["service", "product", "logo"], correct: 0, feedback: "You offer help → service." },
  { q: "“We help students organize their homework with planners” is a…", options: ["value proposition", "price", "vision"], correct: 0, feedback: "Who you help + how." },
  { q: "A slogan is…", options: ["a short and memorable phrase.", "the company's budget.", "the name of a customer."], correct: 0, feedback: "Refill. Reuse. Repeat." },
  { q: "“In the future, we want cleaner schools.” This is the…", options: ["vision", "mission", "cost"], correct: 0, feedback: "Vision = future." },
  { q: "Who manages the money and budget?", options: ["CFO", "CEO", "Marketing"], correct: 0, feedback: "Chief Financial Officer." },
  { q: "Who leads the company?", options: ["CEO", "Customer Service", "Product"], correct: 0, feedback: "Chief Executive Officer." },
  { q: "Cost $6,000, price $8,000. Profit per unit?", options: ["$2,000", "$14,000", "−$2,000"], correct: 0, feedback: "8,000 − 6,000." },
  { q: "You sell 10 units at $8,000. What is the revenue?", options: ["$80,000", "$8,000", "$30,000"], correct: 0, feedback: "10 × 8,000." },
  { q: "Cost $5,000, price $4,000. What happens?", options: ["You lose $1,000 per unit.", "You win $1,000 per unit.", "Nothing."], correct: 0, feedback: "Price < cost = loss." },
  { q: "A prototype is…", options: ["an early version of a product.", "the final perfect product.", "a type of money."], correct: 0, feedback: "Build, test, improve." },
  { q: "Your prototype breaks. The best reaction is…", options: ["find the cause and build it stronger.", "quit.", "hide it."], correct: 0, feedback: "Learn from mistakes!" },
  { q: "A responsible business…", options: ["is honest with customers and treats people fairly.", "hides problems.", "copies other logos."], correct: 0, feedback: "Honest, fair, learns." },
];

const RUBRIC = [
  { id: "research", w: 20, t: "Problem research & customer validation", d: "I found a real problem and asked real people." },
  { id: "solution", w: 20, t: "Quality & usefulness of my solution", d: "My product or service really helps my customers." },
  { id: "identity", w: 20, t: "Identity, mission, vision & organization", d: "My brand, mission, vision and org chart are clear." },
  { id: "money", w: 15, t: "Money understanding & responsible decisions", d: "I calculated cost, price and profit, and I have a responsible rule." },
  { id: "present", w: 25, t: "Final card & oral presentation in English", d: "I presented my company clearly in English." },
];
const STAR_LABEL = ["", "Starting", "Developing", "Good", "Excellent"];
function SelfCheck({ company, existing, onSave, onExit }) {
  const [stars, setStars] = useState(existing?.stars || {});
  const [proud, setProud] = useState(existing?.proud || "");
  const [next, setNext] = useState(existing?.next || "");
  const [st, finish] = useFinish(onSave);
  const all = RUBRIC.every((r) => stars[r.id]);
  const score = Math.round(RUBRIC.reduce((a, r) => a + ((stars[r.id] || 0) / 4) * r.w, 0));
  const ready = all && countWords(proud) >= 5 && countWords(next) >= 5;
  if (st.done) return <Reward title="Period 3 complete! 🏆" subtitle="You are a Young Entrepreneur." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Star size={22} strokeWidth={2.1} />} title="My Self-Evaluation" subtitle="Be honest. How did you do as an entrepreneur?" onExit={onExit}>
      <div className="p3-rubric">
        {RUBRIC.map((r) => (
          <div key={r.id} className="p3-rub">
            <div><b>{r.t}</b><small>{r.d}</small></div>
            <span className="p3-w">{r.w}%</span>
            <div className="p3-stars">
              {[1, 2, 3, 4].map((n) => <button key={n} type="button" className={(stars[r.id] || 0) >= n ? "on" : ""} onClick={() => setStars({ ...stars, [r.id]: n })} aria-label={`${n} stars`}>★</button>)}
              <small>{STAR_LABEL[stars[r.id] || 0]}</small>
            </div>
          </div>
        ))}
      </div>
      <div className="p3-score"><small>My self-evaluation</small><b>{score}%</b><div className="p3-mini-bar"><i style={{ width: `${score}%` }} /></div></div>
      <div className="start-block">
        <label className="p3-lbl">🌟 I am proud of…<input className="start-input" value={proud} onChange={(e) => setProud(e.target.value)} placeholder={`my logo for ${company.name} because…`} /></label>
        <label className="p3-lbl">🚀 Next time, I will…<input className="start-input" value={next} onChange={(e) => setNext(e.target.value)} placeholder="ask more customers before I…" /></label>
      </div>
      <div className="start-foot"><button className="s1-btn primary big" disabled={!ready} onClick={() => finish(25, { stars, score, proud, next })}>Send my self-evaluation <span className="coin-tag"><Coins size={15} /> +25</span></button></div>
    </ActShell>
  );
}

/* =====================================================================
   ESTRUCTURA DEL PERIODO (8 clases · 22 a 32)
   bucket = dónde suman los puntos: comportamiento | quizzes | aprendi
   ===================================================================== */
const P3_WEEKS = [
  { n: 1, g: "22", title: "Meet the entrepreneur", blurb: "What is an entrepreneur? Build your profile.", e: "💡", skills: ["Listening", "Reading"], acts: [
    { key: "w22_video", title: "Video: A young entrepreneur", desc: "Watch and write 3 quick notes.", icon: <Video size={22} />, coins: 20, bucket: "comportamiento" },
    { key: "w22_read", title: "Reading: What Is an Entrepreneur?", desc: "Law 1014 of 2006 + 4 questions.", icon: <BookOpen size={22} />, coins: 26, bucket: "quizzes", topics: ["Entrepreneur", "Value", "Law 1014"] },
    { key: "w22_dna", title: "Entrepreneur DNA 🧬", desc: "Match skills with real situations.", icon: <Sparkles size={22} />, coins: 22, bucket: "quizzes" },
    { key: "w22_spin", title: "The Idea Machine 🎰", desc: "Spin, think fast, create ideas.", icon: <Shuffle size={22} />, coins: 25, bucket: "aprendi" },
    { key: "w22_profile", title: "Part 01 · My Entrepreneur Profile", desc: "Your entrepreneur ID card.", icon: <Rocket size={22} />, coins: 30, bucket: "aprendi" },
  ] },
  { n: 2, g: "23", title: "Find a real problem", blurb: "Mia and the Broken Bottles — go problem hunting!", e: "🔎", skills: ["Reading", "Writing"], acts: [
    { key: "w23_read", title: "Reading: Mia and the Broken Bottles", desc: "Read the story + 4 questions.", icon: <BookOpen size={22} />, coins: 26, bucket: "quizzes" },
    { key: "w23_map", title: "Problem Hunt · Mission Map", desc: "Find 5+ problems around school.", icon: <MapIcon size={22} />, coins: 30, bucket: "quizzes" },
    { key: "w23_card", title: "Part 02 · My Problem Hunt Card", desc: "What, who, where, why — and is it real?", icon: <Search size={22} />, coins: 30, bucket: "aprendi" },
  ] },
  { n: 3, g: "24", title: "Know your customer", blurb: "Ask before you create. Interview real people.", e: "🗣️", skills: ["Speaking", "Listening"], acts: [
    { key: "w24_learn", title: "Ask Before You Create", desc: "Mini lesson + good or bad questions?", icon: <BookOpen size={22} />, coins: 20, bucket: "quizzes" },
    { key: "w24_quest", title: "Customer Quest 🕵️", desc: "Only 3 questions. Choose well!", icon: <MessageCircle size={22} />, coins: 28, bucket: "quizzes" },
    { key: "w24_survey", title: "Customer Discovery Card", desc: "Interview 3 classmates about your problem.", icon: <Users size={22} />, coins: 35, bucket: "aprendi" },
  ] },
  { n: 4, g: "25–27", title: "Design your solution", blurb: "Product or service? Your value proposition.", e: "🛠️", skills: ["Reading", "Writing"], acts: [
    { key: "w25_read", title: "Reading: Six Small Businesses", desc: "Read + product or service?", icon: <BookOpen size={22} />, coins: 20, bucket: "quizzes", topics: ["Product", "Service", "Value proposition"] },
    { key: "w25_builder", title: "Startup Builder 🎰", desc: "Random startup + “We help ___ to ___ with ___”.", icon: <Shuffle size={22} />, coins: 30, bucket: "quizzes" },
    { key: "w25_concept", title: "Part 03 · Startup Concept Card", desc: "The official description of your company.", icon: <Lightbulb size={22} />, coins: 35, bucket: "aprendi" },
  ] },
  { n: 5, g: "29", title: "Build your brand", blurb: "Logo Lab: detective, match and maker.", e: "🎨", skills: ["Reading", "Writing"], acts: [
    { key: "w29_read", title: "Reading: Give Your Business an Identity", desc: "Brand, logo, slogan, mission, vision.", icon: <BookOpen size={22} />, coins: 26, bucket: "quizzes" },
    { key: "w29_detective", title: "Logo Detective 🕵️", desc: "Natural, sporty, playful, modern or elegant?", icon: <Search size={22} />, coins: 21, bucket: "quizzes" },
    { key: "w29_match", title: "Brand Match ⚖️", desc: "Choose the most coherent logo.", icon: <Scale size={22} />, coins: 24, bucket: "quizzes" },
    { key: "w29_logo", title: "Part 04 · Logo Maker", desc: "Design your logo + mockups.", icon: <Palette size={22} />, coins: 40, bucket: "aprendi", topics: ["Name", "Symbol", "Colors", "Slogan"] },
    { key: "w29_mission", title: "Mission, Vision & Values", desc: "We help ___ by ___.", icon: <Target size={22} />, coins: 30, bucket: "aprendi" },
  ] },
  { n: 6, g: "28 · 30", title: "Run your company", blurb: "Your team, your money, your values.", e: "🏢", skills: ["Reading", "Speaking"], acts: [
    { key: "w28_read", title: "Reading: The Team Behind a Business", desc: "CEO, CFO, cost, price, profit.", icon: <BookOpen size={22} />, coins: 26, bucket: "quizzes" },
    { key: "w28_org", title: "Part 05 · Build the Org Chart", desc: "Roles + situations + your team.", icon: <Building2 size={22} />, coins: 40, bucket: "aprendi" },
    { key: "w28_sim", title: "Mini Business Simulator", desc: "3 rounds: win or lose money?", icon: <Calculator size={22} />, coins: 30, bucket: "quizzes" },
    { key: "w28_finance", title: "Part 06 · My Business Finances", desc: "Cost, price, units and profit.", icon: <Coins size={22} />, coins: 40, bucket: "aprendi" },
    { key: "w30_ethics", title: "The Responsible Boss", desc: "5 hard decisions + your rule.", icon: <ShieldCheck size={22} />, coins: 30, bucket: "comportamiento" },
  ] },
  { n: 7, g: "31", title: "Prototype & improve", blurb: "Build it. Test it. Learn. Improve.", e: "🔧", skills: ["Writing", "Speaking"], acts: [
    { key: "w31_learn", title: "Oops! Startup Lab 🧪", desc: "Mini lesson + 6 incident cards.", icon: <Wrench size={22} />, coins: 30, bucket: "quizzes" },
    { key: "w31_proto", title: "Part 07 · Prototype Studio", desc: "Build, get feedback, improve.", icon: <Hammer size={22} />, coins: 45, bucket: "aprendi" },
    { key: "w31_pitch", title: "Pitch Studio 🎤", desc: "Your pitch writes itself — practice it!", icon: <Megaphone size={22} />, coins: 40, bucket: "aprendi" },
  ] },
  { n: 8, g: "32", title: "Young Entrepreneurs Fair", blurb: "Your Identity Card, the Fair and the Boss.", e: "🏆", skills: ["Speaking", "Listening"], acts: [
    { key: "w32_card", title: "Part 08 · My Company Identity Card", desc: "Your infographic builds itself!", icon: <Award size={22} />, coins: 50, bucket: "aprendi" },
    { key: "w32_fair", title: "The Investor Walk 🎪", desc: "Visit stands and invest 100 coins.", icon: <Store size={22} />, coins: 40, bucket: "comportamiento" },
    { key: "w32_hotseat", title: "The Hot Seat 🔥", desc: "Surprise investor questions.", icon: <Mic size={22} />, coins: 30, bucket: "aprendi" },
    { key: "w32_boss", title: "Boss Battle P3 ⚔️", desc: "12 questions from the whole period.", icon: <Swords size={22} />, coins: 58, bucket: "quizzes" },
    { key: "w32_self", title: "My Self-Evaluation", desc: "Rubric 20 · 20 · 20 · 15 · 25.", icon: <Star size={22} />, coins: 25, bucket: "comportamiento" },
  ] },
];
const ALL_ACTS = P3_WEEKS.flatMap((w) => w.acts);
const TOTAL_ACTS = ALL_ACTS.length;
/* Para el botón “Go build it →” de la tarjeta final */
const PART_ACT = { profile: "w22_profile", problem: "w23_card", solution: "w25_concept", brand: "w29_logo", org: "w28_org", money: "w28_finance", proto: "w31_proto" };

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Periodo3 = ({ userData, API_URL, existingRow, onBack }) => {
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

  // El dashboard primero trae la fila "light" (sin JSON) y luego la completa
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
  const company = buildCompany(respRef.current, name);
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
      .catch((e) => { console.error("Error guardando Periodo 3:", e); dispatch({ type: "rollback_progreso", payload: { Semana: PERIOD_KEY, prev } }); });
  };

  // Las piezas de la empresa se pueden mejorar: si ya estaba hecha, se actualiza la respuesta sin sumar monedas otra vez
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
    const jump = (partId) => { if (PART_ACT[partId]) setAct(PART_ACT[partId]); };
    let view = null;

    switch (act) {
      case "w22_video": view = <VideoNotes onSave={save} onExit={exit} />; break;
      case "w22_read": view = (
        <ReadThen tag="READING · A2 · ENTREPRENEURSHIP" title="What Is an Entrepreneur?" subtitle="Ideas that solve problems" minutes={4} sections={READ_C1} glossary={GLOSS_C1} onExit={exit} finishLabel="I read it — check my understanding">
          <QuizRunner title="Entrepreneur check" emoji="💡" questions={Q_C1} pickCount={4} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "w22_dna": view = <EntrepreneurDNA onSave={save} onExit={exit} />; break;
      case "w22_spin": view = <IdeaSpinner onSave={save} onExit={exit} />; break;
      case "w22_profile": view = <ProfileCard studentName={name} spinner={resp.w22_spin} existing={resp.w22_profile} onSave={save} onExit={exit} />; break;

      case "w23_read": view = (
        <ReadThen tag="READING · A2 · REAL PROBLEMS" title="Mia and the Broken Bottles" subtitle="Every problem is an opportunity" minutes={4} sections={READ_C2} glossary={GLOSS_C2} onExit={exit} finishLabel="I read it — check my understanding">
          <QuizRunner title="Story check" emoji="🍶" questions={Q_C2} pickCount={4} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "w23_map": view = <ProblemMap onSave={save} onExit={exit} />; break;
      case "w23_card": view = <ProblemCard map={resp.w23_map} profile={resp.w22_profile} existing={resp.w23_card} onSave={save} onExit={exit} />; break;

      case "w24_learn": view = (
        <ReadThen tag="MINI LESSON · A2" title="Ask Before You Create" subtitle="Listen to your customers" minutes={2} sections={READ_C3} onExit={exit} finishLabel="I understand — let's sort!">
          <SortActivity icon={<MessageCircle size={22} />} title="Helpful question or not?" subtitle="Which questions help you discover real needs?" buckets={GOOD_Q} items={GOOD_Q_ITEMS} per={2} bonus={4} doneTitle="Question expert! ❓" onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "w24_quest": view = <CustomerQuest onSave={save} onExit={exit} />; break;
      case "w24_survey": view = <CustomerSurvey problem={resp.w23_card?.problem} existing={resp.w24_survey} onSave={save} onExit={exit} />; break;

      case "w25_read": view = (
        <ReadThen tag="READING · A2 · DESIGN" title="Six Small Businesses" subtitle="Different businesses, one goal: help customers" minutes={4} sections={READ_C4} glossary={GLOSS_C4} onExit={exit} finishLabel="I read it — let's sort!">
          <SortActivity icon={<Briefcase size={22} />} title="Product or service?" subtitle="Can you touch it, or is it help you offer?" buckets={PS_BUCKETS} items={PS_ITEMS} per={2} bonus={4} doneTitle="Product & service pro! 📦" onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "w25_builder": view = <StartupBuilder onSave={save} onExit={exit} />; break;
      case "w25_concept": view = <ConceptCard problemCard={resp.w23_card} profile={resp.w22_profile} existing={resp.w25_concept} onSave={save} onExit={exit} />; break;

      case "w29_read": view = (
        <ReadThen tag="READING · A2 · BRAND IDENTITY" title="Give Your Business an Identity" subtitle="How can people recognize and remember my business?" minutes={4} img={IMG_LOGOS} sections={READ_C5} glossary={GLOSS_C5} onExit={exit} finishLabel="I read it — check my understanding">
          <QuizRunner title="Brand check" emoji="🎨" questions={Q_C5} pickCount={5} passThreshold={70} xpPerCorrect={4} xpComplete={6} onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "w29_detective": view = <NumberRounds icon={<Search size={22} />} title="Logo Detective 🕵️" subtitle="Look at the shape, the colors, the symbol and the font." rounds={DETECTIVE_ROUNDS} coinsPer={3} bonus={6} doneTitle="Logo detective! 🔍" onSave={save} onExit={exit} />; break;
      case "w29_match": view = <BrandMatch onSave={save} onExit={exit} />; break;
      case "w29_logo": view = <LogoStudio concept={resp.w25_concept} existing={resp.w29_logo} onSave={save} onExit={exit} />; break;
      case "w29_mission": view = <MissionVision brand={resp.w29_logo} concept={resp.w25_concept} existing={resp.w29_mission} onSave={save} onExit={exit} />; break;

      case "w28_read": view = (
        <ReadThen tag="READING · A2 · BUSINESS" title="The Team Behind a Business" subtitle="Roles, money and responsibility" minutes={5} sections={READ_C6} glossary={GLOSS_C6} onExit={exit} finishLabel="I read it — check my understanding">
          <QuizRunner title="Team & money check" emoji="🏢" questions={Q_C6} pickCount={5} passThreshold={70} xpPerCorrect={4} xpComplete={6} onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "w28_org": view = <OrgChartGame studentName={name} existing={resp.w28_org} onSave={save} onExit={exit} />; break;
      case "w28_sim": view = <NumberRounds icon={<Calculator size={22} />} title="Mini Business Simulator" subtitle="Revenue, costs and profit. Do you win or lose?" rounds={SIM_ROUNDS} coinsPer={3} bonus={6} doneTitle="Business brain! 🧠" onSave={save} onExit={exit} />; break;
      case "w28_finance": view = <FinanceCard concept={resp.w25_concept} existing={resp.w28_finance} onSave={save} onExit={exit} />; break;
      case "w30_ethics": view = <EthicsLab existing={resp.w30_ethics} onSave={save} onExit={exit} />; break;

      case "w31_learn": view = (
        <ReadThen tag="MINI LESSON · A2" title="From Idea to Prototype" subtitle="Build it. Test it. Learn from it. Improve it." minutes={2} sections={READ_C7} glossary={GLOSS_C7} onExit={exit} finishLabel="I understand — open the lab!">
          <OopsLab onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "w31_proto": view = <PrototypeStudio concept={resp.w25_concept} brand={resp.w29_logo} existing={resp.w31_proto} onSave={save} onExit={exit} />; break;
      case "w31_pitch": view = <PitchStudio company={company} existing={resp.w31_pitch} onSave={save} onExit={exit} />; break;

      case "w32_card": view = <IdentityCard company={company} userData={userData} API_URL={API_URL} onSave={save} onExit={exit} onJump={jump} />; break;
      case "w32_fair": view = <FairWalk userData={userData} API_URL={API_URL} onSave={save} onExit={exit} />; break;
      case "w32_hotseat": view = <HotSeat company={company} existing={resp.w32_hotseat} onSave={save} onExit={exit} />; break;
      case "w32_boss": view = <QuizRunner title="Boss Battle · Period 3" emoji="⚔️" questions={BOSS_P3} pickCount={12} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />; break;
      case "w32_self": view = <SelfCheck company={company} existing={resp.w32_self} onSave={save} onExit={exit} />; break;
      default: view = null;
    }
    return <div className="s1 p1 p2 p3">{view}</div>;
  }

  /* ---------- SEMANA ABIERTA ---------- */
  if (week) {
    const w = P3_WEEKS.find((x) => x.n === week);
    const wDone = w.acts.filter((a) => checklist[a.key]).length;
    const next = P3_WEEKS.find((x) => x.n === w.n + 1);
    return (
      <div className="s1 p1 p2 p3">
        <button className="s1-back" onClick={() => setWeek(null)}><ArrowLeft size={18} strokeWidth={2.4} /> Back to Period 3</button>
        <div className="s1-hero p1-week-hero p3-hero">
          <span className="s1-tag">{w.e} PERIOD 3 · CLASS {w.g}</span>
          <h1>{w.title}</h1>
          <p>{w.blurb}</p>
          <div className="s1-progress"><div className="bar"><i style={{ width: `${(wDone / w.acts.length) * 100}%` }} /></div><span className="pill">{wDone}/{w.acts.length}</span></div>
        </div>
        <StartupMini company={company} compact />
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
    <div className="s1 p1 p2 p3">
      <button className="s1-back" onClick={onBack}><ArrowLeft size={18} strokeWidth={2.4} /> Back to overview</button>

      <div className="s1-hero p1-hero p3-hero">
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> ADMIN PREVIEW · GRADE {GRADE} · PERIOD 3</span>
        <h1>Young Entrepreneurs Lab</h1>
        <p>How can I create a business idea that solves a real problem and helps my community?</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pct}%` }} /></div><span className="pill">{pct}%</span></div>
        <div className="p1-hero-chips">
          <span><Coins size={14} /> {coinsTotal} coins</span>
          <span><Check size={14} /> {doneCount}/{TOTAL_ACTS} activities</span>
          <span>🚀 Create · Build · Organize · Launch</span>
          <span>🎯 SDG 8 · SDG 9 · SDG 12</span>
        </div>
      </div>

      <StartupMini company={company} />
      {checklist.w32_card && (
        <button type="button" className="p3-card-link" onClick={() => setAct("w32_card")}><Award size={18} /> See my Company Identity Card <ChevronRight size={16} /></button>
      )}

      <div className="p1-passport">
        <div className="p1-passport-head"><b>🚀 Founder's Passport</b><span>Finish a class to get its stamp</span></div>
        <div className="p1-stamps">
          {P3_WEEKS.map((w) => (
            <button key={w.n} type="button" className={`p1-stamp ${weekDone(w) ? "done" : ""}`} onClick={() => setWeek(w.n)} title={w.title}>
              <em>{w.e}</em><small>{w.g}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="p1-weeks">
        {P3_WEEKS.map((w) => {
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