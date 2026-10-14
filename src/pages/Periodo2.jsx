import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft, BookOpen, Video, Check, X, Coins, Trophy, Sparkles, Clock, GraduationCap,
  ChevronRight, Lightbulb, Play, PenLine, Headphones, KeyRound, Star, Users, Lock,
  Store, Globe, Scale, RefreshCw, Award, Puzzle, Mic, Target, PiggyBank, Wallet, Calculator,
  ShoppingCart, CreditCard, ShieldCheck, ShieldAlert, Hourglass, Plus, Trash2,
  TrendingUp, Receipt, Plane, Tag, Search, Swords, Mail, Map as MapIcon,
} from "lucide-react";
import "../Styles/semana1.css";   // botones, quiz, reward, monedas (misma gamificación)
import "../Styles/periodo1.css";  // piezas reutilizadas del Periodo 1 (match, sort, museo, postal…)
import "../Styles/periodo2.css";  // estilos nuevos del Periodo 2
import useGlobalReducer from "../hooks/useGlobalReducer";

/* =====================================================================
   PERIODO 2 · MY FIRST FINANCIAL PLAN  (Grado 6 · A2)
   10 semanas de clase (11–21) · todo se guarda en UNA fila de Progreso_Semanas:
   Semana = "P2" · Checklist_JSON = { w11_s1: true, … } · Respuestas_JSON = { … }
   ===================================================================== */

const PERIOD_KEY = "P2";
const GRADE = "6";

const IMG_SOFI = "https://i.pinimg.com/736x/2a/ed/b0/2aedb0dd55fcddea527bcbd5e26d51e8.jpg";
const IMG_SHOPS = "https://i.pinimg.com/736x/81/06/b9/8106b93c488e92fbe989c212fa807d1d.jpg";
const IMG_PIN = "https://i.pinimg.com/736x/ef/08/94/ef0894434148c1e873a523d0b57bf3e5.jpg";
const VIDEO_BUDGET = "https://res.cloudinary.com/y9r84vgz/video/upload/v1791982974/videoplayback_6.mp4";

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
            if (b.box) return <div key={i} className="p1-callout">{render(b.box)}</div>;
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
  const ready = vals.every((v) => countWords(v) >= 2) && said;
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
        </div>
      ))}
      <label className="perm-check p1-check">
        <input type="checkbox" checked={said} onChange={(e) => setSaid(e.target.checked)} />
        <span>🎤 I said my sentences aloud to a partner.</span>
      </label>
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
   SEMANA 11 · WHY DO WE SAVE?  (Sofi saves for a bike · 4 pantallas)
   ===================================================================== */
const GLOSS_W11 = {
  "saving": "Ahorrar — guardar dinero para el futuro.",
  "spending": "Gastar — usar dinero para comprar cosas.",
  "goal": "Meta — algo que quieres lograr o comprar.",
  "budget": "Presupuesto — un plan para tu dinero.",
  "pocket money": "Mesada — dinero que te da tu familia.",
  "unexpected": "Inesperado — algo que no planeaste.",
  "patience": "Paciencia — saber esperar con calma.",
  "expense": "Gasto — dinero que pagas por algo.",
};

const READ_W11_A = [
  { h: "Part 1. What Is Saving?" },
  { p: "Have you ever wanted to buy something special, but you did not have enough money? Maybe you wanted a new bicycle, a video game, a pair of shoes, or a gift for someone you love. What can you do when you want something, but you do not have enough money today?" },
  { p: "One possible answer is saving." },
  { p: "Saving means keeping some of your money for the future instead of spending all of it today. When you save money, you prepare for something you want or need. You can save a little money every day, every week, or every month. Over time, your money grows, and you can use it to reach your goal." },
  { p: "For example, imagine that you receive $10,000 as pocket money. You can spend all the money on snacks, or you can spend $6,000 and save the other $4,000. If you do this every week, you will have money for something more important in the future." },
  { p: "Saving is not only about having a lot of money. It is about making good decisions with the money you have." },
  { h: "Part 2. Why Do We Save?" },
  { p: "There are many reasons to save money. Let's look at three important ones." },
  { sub: "1. To reach a goal" },
  { p: "Sometimes, we want to buy something that costs more money than we have today. Saving helps us reach that goal." },
  { p: "For example, a bicycle costs $300,000. If you save $30,000 every week, you can reach your goal in ten weeks. You do not need to buy the bicycle today. You need a plan, time, and patience." },
  { sub: "2. To be ready for unexpected situations" },
  { p: "Sometimes, life does not go as planned. You may need money to repair something, replace a broken school item, or pay for an unexpected expense." },
  { p: "When you have savings, you are better prepared for these situations. You do not need to spend all your money or immediately ask someone else for help." },
  { sub: "3. To make better financial decisions" },
  { p: "Saving helps you think before you spend. When you have a goal, you begin to ask yourself important questions:" },
  { list: ["Do I really need this?", "Is this purchase important to me?", "Can I spend less today and save more for later?", "How much money do I need to reach my goal?"] },
  { p: "These questions help you become more responsible with money. Saving does not mean that you can never buy things you enjoy. It means learning to balance what you want today with what you want in the future." },
];

const READ_W11_B = [
  { h: "Part 3. Sofi Saves for a Bike" },
  { p: "Sofi is a twelve-year-old student who loves riding bicycles. Every morning, she sees children riding their bikes to the park. She wants to have her own bicycle, but there is one problem: she does not have enough money to buy one." },
  { p: "One Saturday, Sofi visits a bicycle shop with her father. She sees a beautiful blue bicycle. It has a comfortable seat, strong wheels, and a small basket at the front. Sofi loves it!" },
  { say: "“How much does this bicycle cost?” she asks." },
  { say: "“It costs $360,000,” her father answers." },
  { p: "Sofi checks her wallet. She has only $40,000. She feels a little disappointed because she cannot buy the bicycle today." },
  { say: "Her father smiles and says, “You do not need to buy everything immediately. You can make a plan and save your money.”" },
  { p: "That night, Sofi thinks about her goal. She decides to save $40,000 every week. She also decides to spend less money on snacks and small things she does not really need." },
  { box: "First, Sofi writes down her goal: I want to save $360,000 to buy my blue bicycle." },
  { p: "Next, she makes a simple budget. A budget is a plan that shows how much money you receive, how much you spend, and how much you save." },
  { p: "Sofi receives $50,000 every week from her family for her personal expenses. She decides to use $10,000 for small expenses and save $40,000." },
  { p: "She already has $40,000 in her wallet. At the end of the first week, she has $80,000. At the end of the second week, she has $120,000. After five weeks, she has $240,000." },
  { p: "Sometimes, Sofi wants to buy candy or a new toy. She remembers her bicycle and asks herself, “Do I want this small thing more than I want my bicycle?”" },
  { p: "Sometimes, she buys a small treat. Other times, she decides to keep her money. She learns that saving requires decisions, but it does not mean she cannot enjoy her life." },
  { p: "After eight weeks, Sofi has $360,000. She is very excited! She goes to the shop with her father and buys the blue bicycle." },
  { p: "When she rides her new bicycle for the first time, she feels proud. She understands that her money did not disappear. She used it carefully to reach an important goal." },
  { box: "Sofi learns a valuable lesson: saving money is easier when you have a clear goal and a good plan." },
];

const READ_W11_C = [
  { h: "Part 4. Your Turn: The Saving Challenge" },
  { p: "Now it is your turn to become a smart saver!" },
  { p: "Imagine that you want to buy something special. It could be a bicycle, a pair of headphones, a book, a sports item, or something else that is important to you." },
  { p: "But before you buy it, you need to understand your money. Your challenge is to create a personal budget and discover how saving can help you reach your goal." },
  { olist: [
    "First, choose your goal. What do you want to buy, and how much does it cost?",
    "Second, think about your income. Where does your money come from? Do you receive pocket money, money for helping at home, or money as a gift?",
    "Third, plan your expenses. What do you need to pay for? What things do you enjoy buying? Which expenses can you reduce?",
    "Finally, decide how much money you can save every week. Calculate how long it will take to reach your goal.",
  ] },
  { p: "Remember, a good budget does not mean spending nothing. It means giving your money a purpose." },
  { p: "Your goal is not simply to spend less money. Your goal is to learn how to make better decisions, organize your money, and understand the value of saving." },
  { box: "Are you ready to create your budget, start saving, and reach your goal? Your financial journey starts today!" },
];

const VOCAB_W11 = [
  { a: "Saving", b: "Keeping money for the future instead of spending it all." },
  { a: "Spending", b: "Using money to buy things." },
  { a: "Goal", b: "Something you want to get or achieve." },
  { a: "Budget", b: "A plan for the money you receive, spend and save." },
  { a: "Pocket money", b: "Money your family gives you for small expenses." },
  { a: "Expense", b: "Money you pay for something." },
  { a: "Patience", b: "Being able to wait calmly." },
  { a: "Unexpected", b: "Something you did not plan." },
];

function SavingWords({ onSave, onExit }) {
  const [st, finish] = useFinish(onSave);
  const [round, setRound] = useState(0);
  if (st.done) return <Reward title="Saving words unlocked! 🧠" subtitle="You know the key words of this period." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ReadThen tag="READING · A2 · SCREEN 1 OF 4" title="Sofi Saves for a Bike" subtitle="Part 1 & 2 · What is saving? Why do we save?" minutes={5} img={IMG_SOFI} sections={READ_W11_A} glossary={GLOSS_W11} onExit={onExit}>
      <ActShell icon={<Puzzle size={22} strokeWidth={2.1} />} title="Match the saving words" subtitle="Tap a word, then tap its meaning." onExit={onExit}>
        <div className="start-block">
          <MatchPairs key={round} pairs={VOCAB_W11} onRestart={() => setRound((r) => r + 1)} onDone={(r) => finish(r.firstTry * 2 + 8, r)} />
        </div>
      </ActShell>
    </ReadThen>
  );
}

const SOFI_EVENTS = [
  "Sofi sees a beautiful blue bicycle at the shop.",
  "The bicycle costs $360,000, but she has only $40,000.",
  "Her father says: “You can make a plan and save your money.”",
  "Sofi writes her goal and makes a simple budget.",
  "Every week she receives $50,000 and saves $40,000.",
  "Sometimes she says “no” to candy and toys.",
  "After eight weeks, she has $360,000 and buys the bike!",
];
const SOFI_LABELS = ["First", "Then", "Next", "After that", "Every week", "Sometimes", "Finally"];

function SavingsGrowth({ start, perWeek, weeks, goal, emoji = "🚲" }) {
  const vals = Array.from({ length: weeks + 1 }, (_, w) => start + perWeek * w);
  const max = Math.max(goal, vals[vals.length - 1]);
  return (
    <div className="p2-growth">
      <div className="p2-growth-goal" style={{ bottom: `${(goal / max) * 100}%` }}><span>{emoji} Goal {cop(goal)}</span></div>
      <div className="p2-growth-bars">
        {vals.map((v, w) => (
          <div key={w} className={`p2-growth-bar ${v >= goal ? "goal" : ""}`} style={{ height: `${(v / max) * 100}%`, animationDelay: `${w * 0.08}s` }}>
            <b>{v >= 1000 ? `${Math.round(v / 1000)}k` : v}</b>
          </div>
        ))}
      </div>
      <div className="p2-growth-labels">{vals.map((_, w) => <span key={w}>{w === 0 ? "Start" : `W${w}`}</span>)}</div>
    </div>
  );
}

function SofiStory({ onSave, onExit }) {
  const [st, finish] = useFinish(onSave);
  const [res, setRes] = useState(null);
  if (st.done) return <Reward title="Story master! 🚲" subtitle="You followed Sofi's plan step by step." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ReadThen tag="READING · A2 · SCREEN 2 OF 4" title="Sofi's Story" subtitle="Part 3 · A goal, a plan and patience" minutes={4} img={IMG_SOFI} sections={READ_W11_B} glossary={GLOSS_W11} onExit={onExit}>
      <ActShell icon={<BookOpen size={22} strokeWidth={2.1} />} title="Put Sofi's story in order" subtitle="Tap an event, then tap its place on the line." onExit={onExit}>
        {!res ? <OrderGame items={SOFI_EVENTS} labels={SOFI_LABELS} onDone={setRes} /> : (
          <>
            <div className="p1-banner good"><Trophy size={18} /> Great! Now look at how Sofi's savings grew every week.</div>
            <div className="start-block">
              <h3><TrendingUp size={18} /> Sofi's savings tracker</h3>
              <p className="start-tip">She started with $40,000 and saved $40,000 every week.</p>
              <SavingsGrowth start={40000} perWeek={40000} weeks={8} goal={360000} />
            </div>
            <div className="start-foot">
              <button className="s1-btn primary big" onClick={() => finish(Math.max(10, 24 - res.errors * 2), res)}>Finish <span className="coin-tag"><Coins size={15} /> +{Math.max(10, 24 - res.errors * 2)}</span></button>
            </div>
          </>
        )}
      </ActShell>
    </ReadThen>
  );
}

const SAVE_SPEND = [
  { id: "save", label: "Saving", icon: "🐖", color: "#16b074" },
  { id: "spend", label: "Spending", icon: "🛍️", color: "#ff6b57" },
];
const SAVE_SPEND_ITEMS = [
  { e: "🍬", label: "Buying candy every day.", answer: "spend" },
  { e: "🐖", label: "Putting coins in a piggy bank.", answer: "save" },
  { e: "🎂", label: "Keeping your birthday money for a bike.", answer: "save" },
  { e: "🎮", label: "Buying a new skin for a video game.", answer: "spend" },
  { e: "📅", label: "Keeping $5,000 every week for your goal.", answer: "save" },
  { e: "🎬", label: "Paying for a movie ticket.", answer: "spend" },
  { e: "🙅", label: "Not buying a snack to keep money for your goal.", answer: "save", why: "You decide to keep the money — that's saving!" },
  { e: "⭐", label: "Buying stickers you don't need.", answer: "spend" },
];

const MINI_CATS = [
  { id: "snacks", e: "🍪", label: "Snacks", color: "#f5b23e" },
  { id: "transport", e: "🚌", label: "Transport", color: "#5b8def" },
  { id: "fun", e: "🎮", label: "Fun", color: "#ff6b57" },
  { id: "share", e: "🎁", label: "Share / gifts", color: "#9b5de5" },
  { id: "save", e: "🐖", label: "Savings", color: "#16b074" },
];
function MiniBudget({ existing, onSave, onExit }) {
  const INCOME = 40000, STEP = 2000;
  const [vals, setVals] = useState(existing?.vals || { snacks: 0, transport: 0, fun: 0, share: 0, save: 0 });
  const [why, setWhy] = useState(existing?.why || "");
  const [st, finish] = useFinish(onSave);
  const used = Object.values(vals).reduce((a, b) => a + b, 0);
  const left = INCOME - used;
  const bump = (id, d) => setVals((v) => {
    const usedNow = Object.values(v).reduce((a, b) => a + b, 0);
    if (d > 0 && usedNow + d > INCOME) return v;
    return { ...v, [id]: Math.max(0, v[id] + d) };
  });
  const ok = left === 0 && vals.save >= 4000 && countWords(why) >= 8;
  if (st.done) return <Reward title="Your first mini budget! 📋" subtitle="Every peso has a job now." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Wallet size={22} strokeWidth={2.1} />} title="Screen 3 · Build a mini budget" subtitle="Give every peso a job: spend some, save some." onExit={onExit}>
      <div className="start-explain">
        <h3><Lightbulb size={18} strokeWidth={2.3} /> Sofi's budget</h3>
        <p>Sofi receives <b>$50,000</b> every week. She spends <b>$10,000</b> and saves <b>$40,000</b>.</p>
        <StackBar parts={[{ label: "Spend", value: 10000, color: "#f5b23e" }, { label: "Save", value: 40000, color: "#16b074" }]} />
      </div>
      <div className="start-block">
        <h3><span className="step-n">1</span> Your turn: you receive {cop(INCOME)} this week</h3>
        <p className="start-tip">Use + and − to plan your money. Save at least <b>$4,000</b> (10%). Plan <b>all</b> your money.</p>
        <div className="p2-mini">
          {MINI_CATS.map((c) => (
            <div key={c.id} className="p2-mini-row" style={{ "--c": c.color }}>
              <span className="p2-mini-label"><em>{c.e}</em>{c.label}</span>
              <div className="p2-stepper">
                <button type="button" onClick={() => bump(c.id, -STEP)} disabled={vals[c.id] === 0}>−</button>
                <b>{cop(vals[c.id])}</b>
                <button type="button" onClick={() => bump(c.id, STEP)} disabled={left < STEP}>+</button>
              </div>
            </div>
          ))}
        </div>
        <StackBar max={INCOME} parts={MINI_CATS.map((c) => ({ label: c.label, value: vals[c.id], color: c.color }))} />
        <div className={`p2-left ${left === 0 ? "ok" : ""}`}>{left === 0 ? "✅ Every peso has a job!" : `Money left to plan: ${cop(left)}`}</div>
        {vals.save > 0 && vals.save < 4000 && <p className="goal-warn">Try to save at least $4,000.</p>}
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> Why do you save this money?</h3>
        <Starters items={[`I save ${cop(vals.save)} because…`, "I want to buy…", "My savings are for…"]} onPick={appendStarter(setWhy)} />
        <WordField value={why} onChange={setWhy} min={8} max={40} rows={2} placeholder="I save … because …" />
      </div>
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!ok} onClick={() => finish(20, { vals, why })}>Save my mini budget <span className="coin-tag"><Coins size={15} /> +20</span></button>
      </div>
    </ActShell>
  );
}

const GOAL_CHIPS = [["🚲", "A bicycle"], ["🎧", "Headphones"], ["📚", "A book"], ["⚽", "A football"], ["👟", "New shoes"], ["🎁", "A gift"], ["🎮", "A video game"]];

function GoalDots({ weeks, emoji }) {
  if (!Number.isFinite(weeks) || weeks <= 0) return null;
  const n = Math.min(weeks, 30);
  return (
    <div className="p2-dots">
      {Array.from({ length: n }, (_, i) => <span key={i} style={{ animationDelay: `${i * 0.04}s` }}>{i === n - 1 ? emoji : "🪙"}</span>)}
      {weeks > 30 && <b>… +{weeks - 30}</b>}
    </div>
  );
}

function SavingChallenge({ existing, onSave, onExit }) {
  const [goal, setGoal] = useState(existing?.goal || "");
  const [emoji, setEmoji] = useState(existing?.emoji || "🎯");
  const [cost, setCost] = useState(existing?.cost || "");
  const [per, setPer] = useState(existing?.per || "");
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const weeks = ceilDiv(num(cost), num(per));
  const ready = goal.trim() && num(cost) > 0 && num(per) > 0 && countWords(text) >= 15;
  if (st.done) return <Reward title="Saving challenge accepted! 🎯" subtitle={`${emoji} ${goal}: ${weeks} weeks to go.`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ReadThen tag="READING · A2 · SCREEN 4 OF 4" title="The Saving Challenge" subtitle="Part 4 · Your turn!" minutes={2} sections={READ_W11_C} glossary={GLOSS_W11} onExit={onExit}>
      <ActShell icon={<Target size={22} strokeWidth={2.1} />} title="Screen 4 · My saving challenge" subtitle="Choose a goal and calculate your time." onExit={onExit}>
        <div className="start-block">
          <h3><span className="step-n">1</span> Choose your goal</h3>
          <div className="p1-starters">
            {GOAL_CHIPS.map(([e, n]) => <button key={n} type="button" className={`p1-chip ${goal === n ? "on" : ""}`} onClick={() => { setGoal(n); setEmoji(e); }}>{e} {n}</button>)}
          </div>
          <input className="start-input" value={goal} onChange={(e) => { setGoal(e.target.value); setEmoji("🎯"); }} placeholder="…or write your own goal" />
        </div>
        <div className="start-block">
          <h3><span className="step-n">2</span> Do the math</h3>
          <div className="p2-grid2">
            <label className="p2-field"><span>How much does it cost?</span><MoneyInput value={cost} onChange={setCost} placeholder="e.g. 120000" /></label>
            <label className="p2-field"><span>How much can you save every week?</span><MoneyInput value={per} onChange={setPer} placeholder="e.g. 10000" /></label>
          </div>
          {Number.isFinite(weeks) && num(cost) > 0 && (
            <div className="p2-result">
              <span>{emoji} {goal || "Your goal"}</span>
              <b>{weeks} {weeks === 1 ? "week" : "weeks"}</b>
              <small>{cop(cost)} ÷ {cop(per)} per week</small>
              <GoalDots weeks={weeks} emoji={emoji} />
            </div>
          )}
          {weeks > 52 && Number.isFinite(weeks) && <p className="goal-warn">That's more than one year! Can you save more, or choose a cheaper goal?</p>}
        </div>
        <div className="start-block">
          <h3><span className="step-n">3</span> Write: “I want to save for… because…”</h3>
          <Starters items={[`I want to save for ${goal ? goal.toLowerCase() : "…"} because…`, "It is important to me because…", `I will save ${cop(per || 0)} every week.`, `I need ${Number.isFinite(weeks) ? weeks : "…"} weeks.`]} onPick={appendStarter(setText)} />
          <WordField value={text} onChange={setText} min={15} max={60} rows={4} placeholder="I want to save for … because …" />
        </div>
        <div className="start-foot">
          <button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { goal, emoji, cost: num(cost), per: num(per), weeks, text })}>Accept the challenge <span className="coin-tag"><Coins size={15} /> +30</span></button>
        </div>
      </ActShell>
    </ReadThen>
  );
}

/* =====================================================================
   SEMANA 12 · MY SAVING GOAL  (video + vocabulario + calculadora + metas)
   ===================================================================== */
const Q_VIDEO_W12 = [
  { q: "How much does the toy dinosaur cost?", options: ["$5", "$8", "$10", "$12"], correct: 1, feedback: "The toy dinosaur costs $8." },
  { q: "What did the child buy with the money grandpa gave for his birthday?", options: ["A skateboard", "Trading cards", "A comic book", "A toy dinosaur"], correct: 1, feedback: "He bought trading cards." },
  { q: "Where does the speaker put some money every week instead of spending it all?", options: ["In a drawer", "In a piggy bank", "Under the sofa", "In a school bag"], correct: 1, feedback: "In a piggy bank." },
  { q: "What is the woman saving up for to buy next?", options: ["A bicycle", "A skateboard", "A video game", "A slime stand"], correct: 1, feedback: "A skateboard." },
  { q: "What helps money grow little by little in the bank?", options: ["Magic", "Interest", "Allowance", "Taxes"], correct: 1, feedback: "Interest helps money grow in the bank." },
  { q: "If you put $10 in the bank and wait with patience, how much might you have after a while?", options: ["$10", "$10.50", "$11", "$15"], correct: 2, feedback: "About $11 — thanks to interest." },
  { q: "What event is happening next week at the school?", options: ["A science fair", "An entrepreneurship fair", "A sports day", "A music festival"], correct: 1, feedback: "An entrepreneurship fair." },
  { q: "What product does the child want to make and sell at the fair?", options: ["Lemonade", "Slime", "Cookies", "Ice cream"], correct: 1, feedback: "Slime!" },
  { q: "How much money does the child already have saved up for the fair?", options: ["$5", "$7", "$10", "$18"], correct: 2, feedback: "$10." },
  { q: "What is a budget?", options: ["A plan that helps you organize your money", "A list of toys you want to buy", "A game about shopping", "A type of bank account"], correct: 0, feedback: "A budget is a plan for your money." },
  { q: "What is “income”?", options: ["The money you spend on toys", "The money you earn or receive", "The money you borrow from friends", "The money you lose"], correct: 1, feedback: "Income is the money you earn or receive." },
  { q: "How much does it cost to buy the ingredients and supplies for the slime stand?", options: ["$1", "$5", "$6", "$12"], correct: 2, feedback: "The supplies cost $6." },
  { q: "If the child sells all 12 units of slime for $1.50 each, what is the expected total income?", options: ["$10", "$12", "$15", "$18"], correct: 3, feedback: "12 × $1.50 = $18." },
  { q: "What should you ask yourself before buying something?", options: ["Where is this made?", "Do I need this or is it just a whim?", "Can I buy two of these?", "Do my friends have this?"], correct: 1, feedback: "Do I need this, or is it just a whim?" },
];

const FLIP_W12 = [
  { a: "🎯 Goal", b: "Something you want to reach" },
  { a: "🐖 Saving", b: "Money you keep for later" },
  { a: "📋 Budget", b: "A plan for your money" },
  { a: "💵 Income", b: "Money you receive" },
  { a: "🧾 Expense", b: "Money you pay" },
  { a: "📈 Interest", b: "Extra money the bank pays you" },
  { a: "🪙 Allowance", b: "Money from your family every week" },
  { a: "⚡ Whim", b: "Wanting something fast, without thinking" },
];

function VocabFlip({ pairs, title, subtitle, back, onSave, onExit }) {
  const [st, finish] = useFinish(onSave);
  const [round, setRound] = useState(0);
  if (st.done) return <Reward title="Memory master! 🃏" subtitle="You found all the pairs." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Puzzle size={22} strokeWidth={2.1} />} title={title} subtitle={subtitle} onExit={onExit}>
      <div className="start-block">
        <FlipMemory key={round} pairs={pairs} back={back} onDone={(r) => finish(Math.max(10, 24 - r.errors), r)} />
        <button type="button" className="p1-link" onClick={() => setRound((x) => x + 1)}><RefreshCw size={14} /> Shuffle again</button>
      </div>
    </ActShell>
  );
}

const INCOME_IDEAS = ["Allowance", "Birthday money", "Helping at home", "Selling crafts", "Walking a dog"];
const EXPENSE_IDEAS = ["Snacks", "Bus", "Stickers", "Phone credit", "Gifts", "Games", "School supplies"];

function SavingsCalculator({ existing, onSave, onExit }) {
  const [ins, setIns] = useState(existing?.incomes || []);
  const [outs, setOuts] = useState(existing?.expenses || []);
  const [st, finish] = useFinish(onSave);
  const inT = total(ins), outT = total(outs), weekly = inT - outT;
  const ready = ins.length >= 1 && outs.length >= 3 && weekly > 0;
  if (st.done) return <Reward title="You know your saving power! 🧮" subtitle={`You can save ${cop(weekly)} every week.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Calculator size={22} strokeWidth={2.1} />} title="Weekly Savings Calculator" subtitle="Money in − money out = money you can save." onExit={onExit}>
      <div className="start-explain">
        <h3><Lightbulb size={18} strokeWidth={2.3} /> How it works</h3>
        <p>Write the money you <b>receive</b> every week (income) and the money you <b>spend</b> every week (expenses). Add at least <b>1 income</b> and <b>3 expenses</b>.</p>
      </div>
      <MoneyList title="My weekly income" icon="💵" tone="in" rows={ins} setRows={setIns} suggestions={INCOME_IDEAS} min={1} namePh="e.g. Allowance" />
      <MoneyList title="My weekly expenses" icon="🧾" tone="out" rows={outs} setRows={setOuts} suggestions={EXPENSE_IDEAS} min={3} namePh="e.g. Snacks" />
      {ins.length > 0 && (
        <div className={`p2-result ${weekly <= 0 ? "bad" : ""}`}>
          <span>{weekly > 0 ? "🐖 You can save" : "⚠️ You spend more than you receive"}</span>
          <b>{cop(weekly)}</b>
          <small>every week · {cop(inT)} in − {cop(outT)} out</small>
          {weekly > 0 && (
            <div className="p2-proj">
              {[4, 8, 12].map((w) => <span key={w}><small>{w} weeks</small><b>{cop(weekly * w)}</b></span>)}
            </div>
          )}
        </div>
      )}
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!ready} onClick={() => finish(25, { incomes: ins, expenses: outs, weekly })}>Save my calculator <span className="coin-tag"><Coins size={15} /> +25</span></button>
      </div>
    </ActShell>
  );
}

function GoalSentence({ calc, existing, onSave, onExit }) {
  const [item, setItem] = useState(existing?.item || "");
  const [cost, setCost] = useState(existing?.cost || "");
  const [per, setPer] = useState(existing?.per || (calc?.weekly > 0 ? calc.weekly : ""));
  const [weeks, setWeeks] = useState(existing?.weeks || "");
  const [checked, setChecked] = useState(null);
  const [said, setSaid] = useState(false);
  const [st, finish] = useFinish(onSave);
  const correct = ceilDiv(num(cost), num(per));
  const reset = (fn) => (v) => { fn(v); setChecked(null); };
  const ready = item.trim() && num(cost) > 0 && num(per) > 0 && checked === true && said;
  if (st.done) return <Reward title="Goal set! 🎯" subtitle={`${item}: ${correct} weeks.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Target size={22} strokeWidth={2.1} />} title="Complete my goal" subtitle="Fill the sentences and calculate the weeks yourself." onExit={onExit}>
      {calc?.weekly > 0 && <div className="p1-banner"><Lightbulb size={16} /> Your calculator says you can save <b>{cop(calc.weekly)}</b> every week.</div>}
      <div className="p2-fill">
        <p>My goal is to buy <input value={item} onChange={(e) => reset(setItem)(e.target.value)} placeholder="new headphones" />.</p>
        <p>It costs <span className="p2-inline-money">$<input type="number" min="0" value={cost} onChange={(e) => reset(setCost)(e.target.value)} placeholder="60000" /></span>.</p>
        <p>I can save <span className="p2-inline-money">$<input type="number" min="0" value={per} onChange={(e) => reset(setPer)(e.target.value)} placeholder="10000" /></span> every week.</p>
        <p>I need <input className="p2-small" type="number" min="0" value={weeks} onChange={(e) => reset(setWeeks)(e.target.value)} placeholder="?" /> weeks.</p>
      </div>
      <div className="start-foot p2-left-foot">
        <button className="s1-btn primary" disabled={!item.trim() || !num(cost) || !num(per) || weeks === ""} onClick={() => setChecked(num(weeks) === correct)}>Check my weeks <Check size={16} /></button>
      </div>
      {checked === false && <div className="p1-hint">💡 Divide: {cop(cost)} ÷ {cop(per)}. If the answer has decimals, round UP (you need one more week).</div>}
      {checked === true && (
        <>
          <div className="p2-goal-card">
            <span className="p2-goal-emoji">🎯</span>
            <p>My goal is to buy <b>{item}</b>. It costs <b>{cop(cost)}</b>. I can save <b>{cop(per)}</b> every week. I need <b>{correct} weeks</b>.</p>
            <GoalDots weeks={correct} emoji="🎯" />
          </div>
          <div className="start-block">
            <h3><Mic size={18} /> Speak!</h3>
            <p className="start-tip">Read your goal aloud to a partner: <i>“My goal is ___. I need ___ weeks.”</i> Then listen to your partner's goal.</p>
            <label className="perm-check p1-check">
              <input type="checkbox" checked={said} onChange={(e) => setSaid(e.target.checked)} />
              <span>I said my goal aloud and listened to my partner.</span>
            </label>
          </div>
        </>
      )}
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!ready} onClick={() => finish(20, { item, cost: num(cost), per: num(per), weeks: correct })}>Save my goal <span className="coin-tag"><Coins size={15} /> +20</span></button>
      </div>
    </ActShell>
  );
}

const GOAL_MATH = [
  { q: "Ana wants headphones. They cost $60,000. She saves $10,000 every week. How many weeks does she need?", answer: 6, unit: "weeks", hint: "Divide the price by the money she saves every week.", explain: "$60,000 ÷ $10,000 = 6 weeks." },
  { q: "Leo wants a ball for $45,000. He saves $10,000 every week. Can he buy it in 4 weeks?", options: ["Yes, he can.", "No, he can't."], correct: 1, hint: "How much does he have after 4 weeks? 4 × $10,000…", explain: "4 × $10,000 = $40,000. That is less than $45,000." },
  { q: "Mia needs $80,000 in 8 weeks. How much must she save every week?", answer: 10000, money: true, hint: "Divide $80,000 into 8 equal parts.", explain: "$80,000 ÷ 8 = $10,000 every week." },
  { q: "Tom has $20,000. He saves $5,000 every week. How much does he have after 6 weeks?", answer: 50000, money: true, hint: "Start with $20,000 and add 6 × $5,000.", explain: "$20,000 + $30,000 = $50,000." },
  { q: "A book costs $36,000. Sara saves $4,000 a week. How many weeks does she need?", answer: 9, unit: "weeks", hint: "$36,000 ÷ $4,000", explain: "$36,000 ÷ $4,000 = 9 weeks." },
  { q: "Juan saves $7,000 a week for 5 weeks. Is that enough for a $30,000 game?", options: ["Yes, it's enough.", "No, it's not enough."], correct: 0, hint: "Multiply 5 × $7,000.", explain: "5 × $7,000 = $35,000. That's more than $30,000!" },
  { q: "Valentina receives $25,000 a week and spends $15,000. How much does she save every week?", answer: 10000, money: true, hint: "Income − expenses.", explain: "$25,000 − $15,000 = $10,000." },
  { q: "Valentina wants shoes for $70,000. She saves $10,000 a week. How many weeks?", answer: 7, unit: "weeks", hint: "$70,000 ÷ $10,000", explain: "7 weeks." },
];

/* =====================================================================
   SEMANA 13 · INCOME & EXPENSES  (explicación, juegos, tesoro y diario)
   ===================================================================== */
const READ_W13 = [
  { h: "Money In, Money Out" },
  { p: "Every day, money moves. Some money comes to you, and some money goes away from you." },
  { sub: "💵 Income = money IN" },
  { p: "Income is the money you receive. It comes IN to your pocket, your wallet or your bank account." },
  { list: ["Your weekly pocket money", "A birthday gift of money", "Money for helping a neighbor", "Your mom's or dad's salary"] },
  { sub: "🧾 Expense = money OUT" },
  { p: "An expense is the money you pay. It goes OUT of your pocket." },
  { list: ["A snack at school", "A bus ticket", "A notebook", "The family's electricity bill"] },
  { sub: "⚖️ Balance = income − expenses" },
  { p: "If you receive $20,000 and you spend $12,000, your balance is $8,000. You can save it!" },
  { box: "Income comes IN ⬇️ · Expenses go OUT ⬆️ · The difference is your balance." },
];
const GLOSS_W13 = {
  "income": "Ingreso — dinero que recibes.",
  "expense": "Gasto — dinero que pagas.",
  "balance": "Saldo — lo que queda: ingresos − gastos.",
  "salary": "Salario — dinero que recibe un adulto por su trabajo.",
};

const FLOW_CARDS = [
  { e: "🎂", t: "Grandma gives you $20,000 for your birthday.", type: "in" },
  { e: "🍕", t: "You buy a pizza slice.", type: "out" },
  { e: "🧹", t: "You help your aunt clean and she pays you.", type: "in" },
  { e: "🚌", t: "You pay for the bus.", type: "out" },
  { e: "💼", t: "Your dad receives his salary.", type: "in" },
  { e: "💡", t: "The family pays the electricity bill.", type: "out" },
  { e: "🎨", t: "You sell a drawing to a classmate.", type: "in" },
  { e: "📓", t: "You buy a new notebook.", type: "out" },
  { e: "🪙", t: "Your weekly pocket money arrives.", type: "in" },
  { e: "🎬", t: "You buy a cinema ticket.", type: "out" },
  { e: "🏆", t: "You win $10,000 in a school contest.", type: "in" },
  { e: "📱", t: "Your mom pays for phone credit.", type: "out" },
];

function MoneyFlow({ onSave, onExit }) {
  const deck = useMemo(() => shuffleArr(FLOW_CARDS), []);
  const [i, setI] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [fb, setFb] = useState(null);
  const [st, finish] = useFinish(onSave);
  const c = deck[i];
  const over = i >= deck.length;
  const pick = (t) => {
    if (fb || over) return;
    const ok = t === c.type;
    setFb({ ok, type: c.type });
    if (ok) { const n = streak + 1; setStreak(n); setBest((b) => Math.max(b, n)); setCorrect((x) => x + 1); } else setStreak(0);
    setTimeout(() => { setFb(null); setI((x) => x + 1); }, ok ? 650 : 1400);
  };
  const coins = correct * 2 + best;
  if (st.done) return <Reward title="Money flow expert! 💸" subtitle={`${correct}/12 correct · best streak ${best} 🔥`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<TrendingUp size={22} strokeWidth={2.1} />} title="Money In or Money Out?" subtitle="Is it an income or an expense? Be fast and build a streak!" onExit={onExit}>
      <div className="p2-hud">
        <span>Card <b>{Math.min(i + 1, deck.length)}/{deck.length}</b></span>
        <span>🔥 Streak <b>{streak}</b></span>
        <span>✅ <b>{correct}</b></span>
      </div>
      {!over ? (
        <>
          <div className={`p2-flow-card ${fb ? (fb.ok ? "ok" : "bad") : ""}`} key={i}>
            <em>{c.e}</em>
            <p>{c.t}</p>
            {fb && <b>{fb.ok ? "Correct!" : "Oops!"} It's {fb.type === "in" ? "an INCOME (money in)" : "an EXPENSE (money out)"}.</b>}
          </div>
          <div className="p2-flow-btns">
            <button type="button" className="in" onClick={() => pick("in")} disabled={!!fb}>⬇️ Money IN<small>income</small></button>
            <button type="button" className="out" onClick={() => pick("out")} disabled={!!fb}>⬆️ Money OUT<small>expense</small></button>
          </div>
        </>
      ) : (
        <>
          <div className="p2-result"><span>Game over!</span><b>{correct} / {deck.length}</b><small>Best streak: {best} 🔥</small></div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(coins, { correct, best })}>Collect coins <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

const MONEY_LEFT = [
  { q: "Leo receives $20,000. He spends $8,000 on snacks and $5,000 on the bus. How much money is left?", answer: 7000, money: true, hint: "Add the expenses first: $8,000 + $5,000. Then subtract.", explain: "$20,000 − $13,000 = $7,000." },
  { q: "Mom earns $1,200,000. Rent is $600,000 and food is $400,000. How much is left?", answer: 200000, money: true, hint: "$600,000 + $400,000 = $1,000,000.", explain: "$1,200,000 − $1,000,000 = $200,000." },
  { q: "Sofi's income is $50,000. Her expenses are $10,000. How much can she save?", answer: 40000, money: true, hint: "Income − expenses.", explain: "$50,000 − $10,000 = $40,000." },
  { q: "Which one is an INCOME for Daniel?", options: ["He buys a pizza.", "His grandma gives him $10,000.", "He pays for the bus."], correct: 1, hint: "Income = money that comes IN.", explain: "A gift of money comes IN." },
  { q: "Emma's income is $30,000 and her expenses are $34,000. What happens?", options: ["She saves $4,000.", "She spends more than she receives.", "She has $64,000."], correct: 1, hint: "Compare: is $34,000 bigger or smaller than $30,000?", explain: "Her expenses are bigger than her income: −$4,000!" },
  { q: "Pedro sells 5 bracelets for $3,000 each. What is his income?", answer: 15000, money: true, hint: "5 × $3,000", explain: "5 × $3,000 = $15,000." },
];

const FREQ = [
  { id: "week", label: "weekly", color: "#16b074" },
  { id: "month", label: "monthly", color: "#5b8def" },
  { id: "once", label: "one time", color: "#c98a14" },
];
const MY_INCOME_IDEAS = ["Pocket money", "Birthday gift", "Helping at home", "Selling crafts", "Walking a dog", "Prize"];
const FAMILY_INCOME_IDEAS = ["Mom's salary", "Dad's salary", "Grandma's pension", "Family business", "Selling food", "Renting a room"];

function IncomeWriter({ existing, onSave, onExit }) {
  const [mine, setMine] = useState(existing?.mine || []);
  const [family, setFamily] = useState(existing?.family || []);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const ready = mine.length >= 2 && family.length >= 2 && countWords(text) >= 15;
  if (st.done) return <Reward title="Income list ready! 💵" subtitle="You know where money comes from." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<PenLine size={22} strokeWidth={2.1} />} title="Where does money come from?" subtitle="Write possible incomes: yours and your family's." onExit={onExit}>
      <div className="p1-banner"><Lightbulb size={16} /> You can use <b>example numbers</b>. You don't need to write real salaries.</div>
      <MoneyList title="My possible incomes" icon="🧒" tone="in" rows={mine} setRows={setMine} suggestions={MY_INCOME_IDEAS} min={2} kinds={FREQ} namePh="e.g. Pocket money" />
      <MoneyList title="My family's possible incomes" icon="👨‍👩‍👧" tone="in" rows={family} setRows={setFamily} suggestions={FAMILY_INCOME_IDEAS} min={2} kinds={FREQ} namePh="e.g. Mom's salary" />
      <div className="start-block">
        <h3><span className="step-n">✦</span> Write about your incomes</h3>
        <Starters items={["My main income is…", "I receive it every…", "My family's money comes from…", "I can earn more money by…"]} onPick={appendStarter(setText)} />
        <WordField value={text} onChange={setText} min={15} max={60} rows={3} placeholder="My main income is …" />
      </div>
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!ready} onClick={() => finish(25, { mine, family, text })}>Save my incomes <span className="coin-tag"><Coins size={15} /> +25</span></button>
      </div>
    </ActShell>
  );
}

/* ---- Tesoro: The Lost Money Diary (4 islas) ---- */
const T_FIND = [
  { t: "💼 Salary", in: true }, { t: "🍔 Burger", in: false }, { t: "🎁 Birthday money", in: true }, { t: "🚕 Taxi", in: false },
  { t: "🧺 Selling cookies", in: true }, { t: "💡 Light bill", in: false }, { t: "🪙 Pocket money", in: true },
  { t: "🎟️ Concert ticket", in: false }, { t: "🏆 Contest prize", in: true }, { t: "👕 New T-shirt", in: false },
];
function IslandFind({ onDone }) {
  const items = useMemo(() => shuffleArr(T_FIND), []);
  const [sel, setSel] = useState({});
  const [checked, setChecked] = useState(false);
  const [errors, setErrors] = useState(0);
  const allOk = items.every((it) => !!sel[it.t] === it.in);
  const check = () => { setChecked(true); if (!allOk) setErrors((e) => e + 1); };
  return (
    <div className="start-block">
      <p className="start-tip">Tap <b>all the incomes</b> (money IN). There are 5.</p>
      <div className="p2-pick-grid">
        {items.map((it) => {
          const on = !!sel[it.t];
          const mark = checked ? (on === it.in ? (on ? "right" : "") : "wrong") : "";
          return <button key={it.t} type="button" className={`p1-chip big-text ${on ? "on" : ""} ${mark}`} onClick={() => { setChecked(false); setSel({ ...sel, [it.t]: !on }); }}>{it.t}</button>;
        })}
      </div>
      {checked && !allOk && <div className="p1-hint">💡 Some cards are not correct (marked in red). Income = money that comes IN.</div>}
      <div className="start-foot">
        {checked && allOk ? <button className="s1-btn primary big" onClick={() => onDone({ errors })}>Island complete! <ChevronRight size={18} /></button>
          : <button className="s1-btn primary big" onClick={check}>Check <Check size={16} /></button>}
      </div>
    </div>
  );
}

const DIARY_LEO = [
  ["Mon", "🪙 Pocket money", 15000], ["Tue", "🍪 Snack", -4000], ["Wed", "👵 Helping grandma", 10000],
  ["Thu", "🚌 Bus", -6000], ["Fri", "🎨 Sold a drawing", 5000], ["Sat", "🎬 Cinema", -8000],
];
const DiaryLeo = (
  <table className="p2-table p2-mini-diary">
    <thead><tr><th>Day</th><th>Movement</th><th>In</th><th>Out</th></tr></thead>
    <tbody>{DIARY_LEO.map(([d, t, v]) => <tr key={d}><td>{d}</td><td>{t}</td><td className="in">{v > 0 ? cop(v) : ""}</td><td className="out">{v < 0 ? cop(-v) : ""}</td></tr>)}</tbody>
  </table>
);
const T_COUNT = [
  { q: "Leo's diary: what is his TOTAL income this week?", visual: DiaryLeo, answer: 30000, money: true, hint: "Add only the IN column.", explain: "$15,000 + $10,000 + $5,000 = $30,000." },
  { q: "What are his TOTAL expenses?", visual: DiaryLeo, answer: 18000, money: true, hint: "Add only the OUT column.", explain: "$4,000 + $6,000 + $8,000 = $18,000." },
  { q: "What is his balance (income − expenses)?", visual: DiaryLeo, answer: 12000, money: true, hint: "$30,000 − $18,000", explain: "Leo can save $12,000!" },
];

const T_FIX = [
  { t: "🪙 Pocket money", label: "IN", wrong: false }, { t: "🚌 Bus ticket", label: "IN", wrong: true },
  { t: "🍪 Cookies at school", label: "OUT", wrong: false }, { t: "🎂 Birthday gift of money", label: "OUT", wrong: true },
  { t: "🧹 Money for helping at home", label: "IN", wrong: false }, { t: "📓 Notebook", label: "OUT", wrong: false },
];
function IslandFix({ onDone }) {
  const [sel, setSel] = useState({});
  const [checked, setChecked] = useState(false);
  const [errors, setErrors] = useState(0);
  const allOk = T_FIX.every((it) => !!sel[it.t] === it.wrong);
  return (
    <div className="start-block">
      <p className="start-tip">Somebody made <b>2 mistakes</b> in this diary. Tap the lines with the wrong label.</p>
      <div className="p2-fix-list">
        {T_FIX.map((it) => {
          const on = !!sel[it.t];
          const mark = checked ? (on === it.wrong ? (on ? "right" : "") : "wrong") : "";
          return (
            <button key={it.t} type="button" className={`p2-fix ${on ? "on" : ""} ${mark}`} onClick={() => { setChecked(false); setSel({ ...sel, [it.t]: !on }); }}>
              <span>{it.t}</span><b className={it.label === "IN" ? "in" : "out"}>{it.label}</b>
            </button>
          );
        })}
      </div>
      {checked && !allOk && <div className="p1-hint">💡 Think: does this money come IN or go OUT?</div>}
      <div className="start-foot">
        {checked && allOk ? <button className="s1-btn primary big" onClick={() => onDone({ errors })}>Diary fixed! <ChevronRight size={18} /></button>
          : <button className="s1-btn primary big" onClick={() => { setChecked(true); if (!allOk) setErrors((e) => e + 1); }}>Check <Check size={16} /></button>}
      </div>
    </div>
  );
}

const T_LOCKS = [
  { left: "💵 Income", right: "Money that comes in" },
  { left: "🧾 Expense", right: "Money that goes out" },
  { left: "⚖️ Balance", right: "Income minus expenses" },
  { left: "🐖 Saving", right: "Money you keep for later" },
  { left: "📋 Budget", right: "A plan for your money" },
];
function ChestLocks({ locks, onDone, title = "The treasure is yours!" }) {
  const options = useMemo(() => shuffleArr(locks.map((t) => t.right)), [locks]);
  const [ans, setAns] = useState({});
  const [ok, setOk] = useState({});
  const [errors, setErrors] = useState(0);
  const [open, setOpen] = useState(false);
  const unlocked = Object.values(ok).filter(Boolean).length;
  const check = () => {
    const r = {}; let wrong = 0;
    locks.forEach((t, i) => { r[i] = ans[i] === t.right; if (!r[i]) wrong++; });
    setOk(r);
    if (wrong) setErrors((e) => e + 1);
    else { setOpen(true); setTimeout(() => onDone({ errors }), 1600); }
  };
  return (
    <>
      <div className={`p1-chest ${open ? "open" : ""}`}>
        <span className="p1-chest-ico">{open ? "💰" : "🧰"}</span>
        <div className="p1-locks">{locks.map((_, i) => <span key={i} className={ok[i] ? "on" : ""}>{ok[i] ? "🔓" : "🔒"}</span>)}</div>
        <b>{open ? title : `${unlocked}/${locks.length} locks open`}</b>
      </div>
      <div className="p1-connect">
        {locks.map((t, i) => (
          <div key={i} className={`p1-connect-row ${ok[i] === true ? "ok" : ok[i] === false ? "no" : ""}`}>
            <b>{t.left}</b>
            <select className="start-input" value={ans[i] || ""} onChange={(e) => setAns({ ...ans, [i]: e.target.value })} disabled={ok[i] === true}>
              <option value="">Choose…</option>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>
      {!open && <div className="start-foot"><button className="s1-btn primary big" disabled={Object.keys(ans).length < locks.length} onClick={check}>Open the locks <KeyRound size={17} /></button></div>}
    </>
  );
}

const TREASURE_ROOMS = [
  { id: "find", name: "Island of Incomes", e: "🏝️", badge: "Income Hunter", brief: "Find all the incomes hidden on the island.", render: (done) => <IslandFind onDone={done} /> },
  { id: "count", name: "Counting Cave", e: "🪙", badge: "Coin Counter", brief: "Count the money in Leo's diary.", render: (done) => <RoundsRunner rounds={T_COUNT} onDone={done} doneLabel="Cave complete!" /> },
  { id: "fix", name: "Broken Diary Bay", e: "📔", badge: "Diary Fixer", brief: "Find the 2 mistakes in the diary.", render: (done) => <IslandFix onDone={done} /> },
  { id: "chest", name: "Treasure Chest", e: "🧰", badge: "Money Master", brief: "Open the 5 locks of the treasure chest.", render: (done) => <ChestLocks locks={T_LOCKS} onDone={done} /> },
];

/* ---- Money Diary (diario de la semana) ---- */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function MoneyDiary({ incomes, studentName, existing, onSave, onExit }) {
  const [rows, setRows] = useState(existing?.rows || []);
  const [day, setDay] = useState("Mon");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("out");
  const [amt, setAmt] = useState("");
  const [note, setNote] = useState(existing?.note || "");
  const [st, finish] = useFinish(onSave);
  const add = () => {
    if (!desc.trim() || num(amt) <= 0) return;
    setRows([...rows, { day, desc: desc.trim(), type, amount: num(amt) }]);
    setDesc(""); setAmt("");
  };
  const sorted = [...rows].map((r, i) => ({ ...r, i })).sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.i - b.i);
  let bal = 0;
  const withBal = sorted.map((r) => { bal += r.type === "in" ? r.amount : -r.amount; return { ...r, bal }; });
  const inT = rows.filter((r) => r.type === "in").reduce((a, r) => a + r.amount, 0);
  const outT = rows.filter((r) => r.type === "out").reduce((a, r) => a + r.amount, 0);
  const nIn = rows.filter((r) => r.type === "in").length, nOut = rows.length - nIn;
  const ready = rows.length >= 5 && nIn >= 1 && nOut >= 2 && countWords(note) >= 10;
  const mine = incomes?.mine || [], family = incomes?.family || [];
  if (st.done) return <Reward title="Money Diary complete! 📔" subtitle={`Balance this week: ${cop(inT - outT)}`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<BookOpen size={22} strokeWidth={2.1} />} title="My Money Diary" subtitle="Write your money movements for one week (5 or more)." onExit={onExit}>
      {(mine.length > 0 || family.length > 0) && (
        <div className="p2-incomes-board">
          <div><h4>🧒 My incomes</h4>{mine.map((m, k) => (
            <button key={k} type="button" className="p2-income-pill" onClick={() => { setDesc(m.name); setType("in"); setAmt(String(m.amount)); }}>
              {m.name} · {cop(m.amount)} <small>+ add</small>
            </button>))}{mine.length === 0 && <small className="start-tip">Write them in “Where does money come from?”</small>}</div>
          <div><h4>👨‍👩‍👧 My family's incomes</h4>{family.map((m, k) => <span key={k} className="p2-income-pill static">{m.name} · {cop(m.amount)} <small>{FREQ.find((f) => f.id === m.kind)?.label}</small></span>)}</div>
        </div>
      )}
      <div className="start-block">
        <h3><Plus size={18} /> Add a movement</h3>
        <div className="exp-add">
          <select className="start-input sm" value={day} onChange={(e) => setDay(e.target.value)}>{DAYS.map((d) => <option key={d}>{d}</option>)}</select>
          <input className="start-input" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What? (e.g. Snack at school)" />
          <div className="type-toggle">
            <button type="button" className={type === "in" ? "on" : ""} style={type === "in" ? { background: "#16b074", color: "#fff" } : undefined} onClick={() => setType("in")}>IN</button>
            <button type="button" className={type === "out" ? "on" : ""} style={type === "out" ? { background: "#ff6b57", color: "#fff" } : undefined} onClick={() => setType("out")}>OUT</button>
          </div>
          <input className="start-input sm" type="number" min="0" value={amt} onChange={(e) => setAmt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} placeholder="$" />
          <button type="button" className="exp-add-btn" onClick={add} aria-label="Add"><Plus size={18} /></button>
        </div>
        <p className="start-tip p2-hint-line">You need 5+ movements: at least 1 IN and 2 OUT. ({rows.length}/5)</p>
      </div>
      <div className="p2-diary">
        <div className="p2-diary-head"><b>📔 {studentName}'s Money Diary</b><span>Week of money</span></div>
        <table className="p2-table">
          <thead><tr><th>Day</th><th>Movement</th><th>In</th><th>Out</th><th>Balance</th><th /></tr></thead>
          <tbody>
            {withBal.length === 0 && <tr><td colSpan={6} className="p2-empty">Your movements will appear here…</td></tr>}
            {withBal.map((r) => (
              <tr key={r.i}>
                <td>{r.day}</td><td>{r.desc}</td>
                <td className="in">{r.type === "in" ? cop(r.amount) : ""}</td>
                <td className="out">{r.type === "out" ? cop(r.amount) : ""}</td>
                <td className={r.bal < 0 ? "out" : ""}><b>{cop(r.bal)}</b></td>
                <td><button type="button" className="exp-del" onClick={() => setRows(rows.filter((_, x) => x !== r.i))} aria-label="Delete"><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && <tfoot><tr><td colSpan={2}>Total</td><td className="in">{cop(inT)}</td><td className="out">{cop(outT)}</td><td><b>{cop(inT - outT)}</b></td><td /></tr></tfoot>}
        </table>
      </div>
      <div className="start-block">
        <h3><span className="step-n">✦</span> My balance this week</h3>
        <Starters items={[`This week my balance was ${cop(inT - outT)} because…`, "My biggest expense was…", "Next week I want to…"]} onPick={appendStarter(setNote)} />
        <WordField value={note} onChange={setNote} min={10} max={50} rows={2} placeholder="This week my balance was …" />
      </div>
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!ready} onClick={() => finish(25, { rows, note, totals: { in: inT, out: outT, balance: inT - outT } })}>Close my diary <span className="coin-tag"><Coins size={15} /> +25</span></button>
      </div>
    </ActShell>
  );
}

/* =====================================================================
   SEMANA 14 · MY FIRST BUDGET  (video otra vez + Budget Studio + explicar)
   ===================================================================== */
const KINDS = [
  { id: "need", label: "Need", color: "#0b7a50" },
  { id: "want", label: "Want", color: "#c98a14" },
  { id: "share", label: "Share", color: "#9b5de5" },
];
const GOAL_EMOJIS = ["🚲", "🎧", "🎮", "⚽", "👟", "📚", "🎁", "🛹", "📱", "✈️"];
const BUDGET_INCOME_IDEAS = ["Pocket money", "Helping at home", "Birthday money", "Selling crafts", "Grandma's gift"];
const BUDGET_EXPENSE_IDEAS = ["Snacks", "Bus", "School supplies", "Phone credit", "Games", "Gifts", "Cinema", "Donation"];

function BudgetCard({ b, name }) {
  const per = b.period === "month" ? "month" : "week";
  const kinds = KINDS.map((k) => ({ label: k.label + "s", value: total(b.expenses.filter((e) => e.kind === k.id)), color: k.color }));
  const parts = [...kinds, { label: "Savings", value: Math.max(0, b.totals.save), color: "#16b074" }];
  const tips = [];
  const needs = kinds[0].value, wants = kinds[1].value, share = kinds[2].value;
  if (b.totals.rate >= 20) tips.push(`⭐ Super saver! You save ${b.totals.rate}% of your income.`);
  else if (b.totals.rate >= 10) tips.push(`👍 Good! You save ${b.totals.rate}%. Can you reach 20%?`);
  else if (b.totals.rate > 0) tips.push(`💡 You save only ${b.totals.rate}%. Can you cut one want?`);
  if (wants > needs && wants > 0) tips.push("⚠️ Your wants are bigger than your needs.");
  if (share > 0) tips.push("💜 You share with others. Nice!");
  const biggest = [...b.expenses].sort((x, y) => y.amount - x.amount)[0];
  if (biggest) tips.push(`🔎 Your biggest expense is ${biggest.name} (${cop(biggest.amount)}).`);
  const time = b.time;
  return (
    <div className="p2-budget-card">
      <div className="p2-bc-head">
        <div><small>{name ? `${name}'s budget` : "My budget"}</small><h3>Every {per}</h3></div>
        <span className="p2-bc-goal">{b.goal.emoji} {b.goal.name || "My goal"}</span>
      </div>
      <div className="p2-stats">
        <div className="in"><small>Income</small><b>{cop(b.totals.income)}</b></div>
        <div className="out"><small>Expenses</small><b>{cop(b.totals.expenses)}</b></div>
        <div className={`save ${b.totals.save <= 0 ? "neg" : ""}`}><small>Savings</small><b>{cop(b.totals.save)}</b></div>
      </div>
      <StackBar parts={parts} max={b.totals.income || 1} />
      {b.goal.cost > 0 && (
        <div className="p2-track">
          <GoalDots weeks={time} emoji={b.goal.emoji} />
          <p>{time && Number.isFinite(time) ? <>You will reach <b>{b.goal.name}</b> ({cop(b.goal.cost)}) in <b>{time} {per}{time === 1 ? "" : "s"}</b>.</> : "Save something every " + per + " to reach your goal!"}</p>
        </div>
      )}
      {tips.length > 0 && <ul className="p2-tips">{tips.map((t) => <li key={t}>{t}</li>)}</ul>}
    </div>
  );
}

function BudgetStudio({ title = "Budget Studio", subtitle, seed, studentName, minIncomes = 2, minExpenses = 5, coins = 45, onSave, onExit }) {
  const [period, setPeriod] = useState(seed?.period || "week");
  const [ins, setIns] = useState(seed?.incomes || []);
  const [outs, setOuts] = useState(seed?.expenses || []);
  const [goalName, setGoalName] = useState(seed?.goal?.name || "");
  const [goalCost, setGoalCost] = useState(seed?.goal?.cost || "");
  const [goalEmoji, setGoalEmoji] = useState(seed?.goal?.emoji || "🎯");
  const [st, finish] = useFinish(onSave);
  const inT = total(ins), outT = total(outs), save = inT - outT;
  const time = save > 0 && num(goalCost) > 0 ? Math.ceil(num(goalCost) / save) : null;
  const rate = inT > 0 ? Math.round((save / inT) * 100) : 0;
  const budget = { period, incomes: ins, expenses: outs, goal: { name: goalName.trim(), cost: num(goalCost), emoji: goalEmoji }, totals: { income: inT, expenses: outT, save, rate }, time };
  const missing = [];
  if (ins.length < minIncomes) missing.push(`Add ${minIncomes - ins.length} more income(s).`);
  if (outs.length < minExpenses) missing.push(`Add ${minExpenses - outs.length} more expense(s).`);
  if (!goalName.trim() || num(goalCost) <= 0) missing.push("Write your goal and its price.");
  if (ins.length && save <= 0) missing.push("Your income must be bigger than your expenses.");
  if (st.done) return <Reward title="Budget complete! 📊" subtitle={`You save ${cop(save)} every ${period}.`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Calculator size={22} strokeWidth={2.1} />} title={title} subtitle={subtitle || "Incomes, expenses, a goal — and a beautiful plan."} onExit={onExit}>
      <div className="start-block">
        <h3><span className="step-n">1</span> My budget is for…</h3>
        <div className="p2-seg">
          <button type="button" className={period === "week" ? "on" : ""} onClick={() => setPeriod("week")}>📅 Every week</button>
          <button type="button" className={period === "month" ? "on" : ""} onClick={() => setPeriod("month")}>🗓️ Every month</button>
        </div>
      </div>
      <MoneyList title={`My incomes (every ${period})`} icon="💵" tone="in" rows={ins} setRows={setIns} suggestions={BUDGET_INCOME_IDEAS} min={minIncomes} namePh="e.g. Pocket money" />
      <MoneyList title={`My expenses (every ${period})`} icon="🧾" tone="out" rows={outs} setRows={setOuts} suggestions={BUDGET_EXPENSE_IDEAS} min={minExpenses} kinds={KINDS} namePh="e.g. Snacks" />
      <div className="start-block">
        <h3><span className="step-n">2</span> My goal</h3>
        <div className="p1-starters">{GOAL_EMOJIS.map((e) => <button key={e} type="button" className={`p1-chip big ${goalEmoji === e ? "on" : ""}`} onClick={() => setGoalEmoji(e)}>{e}</button>)}</div>
        <div className="p2-grid2">
          <label className="p2-field"><span>What do you want to buy?</span><input className="start-input" value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="e.g. A skateboard" /></label>
          <label className="p2-field"><span>How much does it cost?</span><MoneyInput value={goalCost} onChange={setGoalCost} placeholder="e.g. 180000" /></label>
        </div>
      </div>
      {(ins.length > 0 || outs.length > 0) && <BudgetCard b={budget} name={studentName} />}
      {missing.length > 0 && <div className="p2-missing"><b>To finish:</b>{missing.map((m) => <span key={m}>• {m}</span>)}</div>}
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={missing.length > 0} onClick={() => finish(coins, budget)}>Save my budget <span className="coin-tag"><Coins size={15} /> +{coins}</span></button>
      </div>
    </ActShell>
  );
}

function BudgetExplain({ budget, studentName, existing, onSave, onExit }) {
  if (!budget) {
    return (
      <ActShell icon={<Mic size={22} />} title="Explain my budget" onExit={onExit}>
        <div className="p1-banner bad">First build your budget in <b>Budget Studio</b>. Then come back here.</div>
      </ActShell>
    );
  }
  const per = budget.period === "month" ? "month" : "week";
  const biggest = [...budget.expenses].sort((a, b) => b.amount - a.amount)[0];
  const frames = [
    { frame: `My income is ${cop(budget.totals.income)} every ${per}. It comes from`, ph: budget.incomes.map((i) => i.name.toLowerCase()).join(" and ") + "." },
    { frame: "My biggest expenses are", ph: biggest ? `${biggest.name.toLowerCase()}. It costs ${cop(biggest.amount)}.` : "…" },
    { frame: `I save ${cop(budget.totals.save)} every ${per} because`, ph: "I want to buy my goal." },
    { frame: `My goal is ${budget.goal.name.toLowerCase()}. I will reach it in`, ph: `${budget.time} ${per}s.` },
    { frame: "One expense I can reduce and why", ph: "snacks, because…" },
  ];
  return (
    <FrameWriter icon={<Mic size={22} strokeWidth={2.1} />} title="Explain my budget to a friend" subtitle="Complete the language frames, then say them aloud." frames={frames} existing={existing}
      top={<BudgetCard b={budget} name={studentName} />} coins={20} onSave={onSave} onExit={onExit} />
  );
}

/* =====================================================================
   SEMANA 15 · SMART SPENDING  (Two stores, one snack + Smart Shopper)
   ===================================================================== */
const READ_W15 = [
  { h: "Part 1. A Simple Shopping Mission" },
  { p: "Daniel and Emma are classmates. After school, they want to buy a snack and a drink before going to the park. They have $12,000 each, and they want to save some money for the weekend." },
  { p: "First, they visit Fresh Market. Daniel sees a bag of chips for $4,000 and a bottle of juice for $5,000." },
  { say: "“That is $9,000 for both products,” Daniel says. “We can buy them and keep $3,000.”" },
  { say: "Emma agrees, but she has an idea. “Wait! There is another store across the street. Let's compare the prices before we buy anything.”" },
  { say: "Daniel looks surprised. “Why? The prices are not so expensive!”" },
  { say: "“Maybe,” Emma answers. “But a smart shopper does not buy the first thing they see. A smart shopper compares prices.”" },
  { p: "They walk to Value Shop. The same brand of chips costs $3,200, and the same bottle of juice costs $4,500." },
  { say: "“Look!” Emma says. “The chips are $800 cheaper here, and the juice is $500 cheaper. We can save $1,300!”" },
  { say: "Daniel smiles. “You are right. Comparing prices helps us make better decisions.”" },
  { p: "They decide to buy both products at Value Shop. They spend $7,700 and keep $4,300." },
  { h: "Part 2. What Is Smart Spending?" },
  { p: "Smart spending means using your money carefully. It does not always mean buying the cheapest product. It means comparing your options and choosing the one that gives you the best value for your money." },
  { p: "Imagine two pairs of headphones. One costs $40,000, but it breaks after one week. The other costs $55,000 and works for two years. The second pair may be a better choice because it lasts longer." },
  { p: "Before you buy something, ask yourself three questions:" },
  { list: ["How much does it cost?", "Is there a discount?", "Is the product good quality?"] },
  { h: "Part 3. Discounts: Is It Really a Good Deal?" },
  { p: "A discount is a reduction in the original price of a product. Stores often use discounts to attract customers." },
  { p: "For example, a backpack costs $50,000. The store offers a 20% discount. First, calculate 20% of $50,000: $10,000. Next, subtract the discount from the original price: $50,000 − $10,000 = $40,000. The final price is $40,000. You save $10,000." },
  { p: "But be careful! A discount does not always mean the product is cheaper than the same product in another store." },
  { p: "Imagine that Store A sells a T-shirt for $60,000 with a 20% discount. The final price is $48,000. Store B sells the same T-shirt for $45,000 without a discount. Which store is cheaper? Store B! Even though Store A offers a discount, its final price is still higher." },
  { box: "Remember: compare the final prices, not only the discount percentages." },
  { h: "Part 4. Prices Go Up!" },
  { p: "Have you noticed that some products cost more today than they did last year? When the price of a product goes up, we say that the price increases. For example, a sandwich costs $8,000 in January. In June, the same sandwich costs $9,000. The price has increased by $1,000." },
  { p: "Why do prices go up? Sometimes, the ingredients cost more. Sometimes, transportation, electricity, rent, or packaging becomes more expensive. Stores may need to charge more to cover these costs." },
  { p: "When prices go up, the same amount of money buys fewer things. That is why comparing prices and planning your spending are important." },
  { h: "Part 5. The Smart Shopper Challenge" },
  { p: "On Friday, Daniel and Emma want to buy snacks for a class movie afternoon. They have a budget of $30,000. They find three options:" },
  { list: ["Store A sells six juice boxes for $12,000.", "Store B sells six juice boxes for $10,800.", "Store C sells six juice boxes for $11,000, but it offers an extra 10% discount."] },
  { p: "Emma thinks Store C is the cheapest because it has an extra discount. Daniel wants to calculate the final prices before choosing. Who is right?" },
  { box: "Think before you buy. Compare before you choose. Be a Smart Shopper!" },
];
const GLOSS_W15 = {
  "smart shopper": "Comprador inteligente — compara antes de comprar.",
  "discount": "Descuento — una rebaja en el precio.",
  "final price": "Precio final — lo que realmente pagas.",
  "compare": "Comparar — mirar dos o más opciones.",
  "increase": "Aumentar — subir.",
  "quality": "Calidad — qué tan bueno es un producto.",
};

const priceTag = (e, name, price, off) => (
  <div className="p2-tag"><em>{e}</em><b>{name}</b><s>{cop(price)}</s><span className="p2-off">{off}% OFF</span></div>
);
const PRICE_TABLE = (
  <table className="p2-table">
    <thead><tr><th>Product</th><th>January</th><th>June</th></tr></thead>
    <tbody>
      <tr><td>🥪 Sandwich</td><td>$8,000</td><td>$9,000</td></tr>
      <tr><td>🧃 Juice</td><td>$3,000</td><td>$3,500</td></tr>
      <tr><td>🍪 Cookies</td><td>$4,000</td><td>$5,500</td></tr>
      <tr><td>🥛 Yogurt</td><td>$2,500</td><td>$3,000</td></tr>
    </tbody>
  </table>
);

const M_DETECTIVE = [
  { q: "You have $15,000. You need chips and juice. Which store is cheaper?", visual: <div className="p2-stores"><StoreCard name="A · Fresh Market" rows={[["🥔 Chips", 4000], ["🧃 Juice", 5000]]} total={9000} /><StoreCard name="B · Value Shop" rows={[["🥔 Chips", 3200], ["🧃 Juice", 4500]]} total={7700} /></div>, options: ["Store A", "Store B"], correct: 1, hint: "Look at the TOTAL of each store.", explain: "$7,700 is less than $9,000." },
  { q: "How much money do you save at Store B?", options: ["$500", "$1,300", "$2,300"], correct: 1, hint: "Total A − total B.", explain: "$9,000 − $7,700 = $1,300." },
  { q: "Now you need a notebook and a pen. Which store is cheaper for both?", visual: <div className="p2-stores"><StoreCard name="A" rows={[["📓 Notebook", 6500], ["🖊️ Pen", 2000]]} total={8500} /><StoreCard name="B" rows={[["📓 Notebook", 5800], ["🖊️ Pen", 2500]]} total={8300} /></div>, options: ["Store A", "Store B"], correct: 1, hint: "The pen is cheaper at A… but what about the total?", explain: "Store B: $8,300 < $8,500. Always compare the total!" },
  { q: "How much do you save at Store B?", answer: 200, money: true, hint: "$8,500 − $8,300", explain: "$200." },
];
const M_DISCOUNT = [
  { q: "What is the final price?", visual: priceTag("🎒", "Backpack", 50000, 20), answer: 40000, money: true, hint: "10% is one tenth: $5,000. So 20% is $10,000. Now subtract.", explain: "$50,000 − $10,000 = $40,000." },
  { q: "What is the final price?", visual: priceTag("👕", "T-shirt", 40000, 25), answer: 30000, money: true, hint: "25% is one quarter (÷ 4): $10,000.", explain: "$40,000 − $10,000 = $30,000." },
  { q: "What is the final price?", visual: priceTag("🎧", "Headphones", 80000, 10), answer: 72000, money: true, hint: "10% means one tenth of the original price.", explain: "$80,000 − $8,000 = $72,000." },
  { q: "What is the final price?", visual: priceTag("👟", "Sneakers", 120000, 30), answer: 84000, money: true, hint: "10% = $12,000. 30% = 3 × $12,000 = $36,000.", explain: "$120,000 − $36,000 = $84,000." },
];
const M_FAKE = [
  { q: "Same T-shirt, two stores. Which one has the better price?", visual: <div className="p2-stores"><StoreCard name="Store A" badge="20% OFF" strike={60000} total={48000} final /><StoreCard name="Store B" badge="NO DISCOUNT" total={45000} final /></div>, options: ["Store A — it has a discount.", "Store B — the final price is lower."], correct: 1, hint: "Compare the FINAL prices, not the discount.", explain: "$45,000 < $48,000. The discount was a trap!" },
  { q: "Same shoes. Which store is cheaper now?", visual: <div className="p2-stores"><StoreCard name="Store A" badge="50% OFF" strike={30000} total={15000} final /><StoreCard name="Store B" badge="NO DISCOUNT" total={18000} final /></div>, options: ["Store A", "Store B"], correct: 0, hint: "Look at the final prices again.", explain: "This time the discount wins: $15,000 < $18,000." },
  { q: "Three offers for the same bike helmet. Which is the best?", visual: <div className="p2-stores three"><StoreCard name="A" badge="30% OFF" strike={100000} total={70000} final /><StoreCard name="B" badge="10% OFF" strike={80000} total={72000} final /><StoreCard name="C" badge="NO DISCOUNT" total={75000} final /></div>, options: ["Store A", "Store B", "Store C"], correct: 0, hint: "Find the smallest final price.", explain: "Store A: $70,000." },
  { q: "Choose the best sentence about the helmet:", options: ["I chose Store A because the final price is $70,000.", "I chose Store C because it has no discount.", "I chose Store B because 10% is a small number."], correct: 0, explain: "Great sentence: “I chose ___ because the final price is ___.”" },
];
const M_PRICES = [
  { q: "How much did the cookies increase?", visual: PRICE_TABLE, answer: 1500, money: true, hint: "New price − old price.", explain: "$5,500 − $4,000 = $1,500." },
  { q: "Which product increased the most in pesos?", visual: PRICE_TABLE, options: ["Sandwich", "Juice", "Cookies", "Yogurt"], correct: 2, hint: "Calculate June − January for each product.", explain: "Cookies: +$1,500." },
  { q: "In January, a sandwich and a juice cost $11,000. How much do they cost in June?", visual: PRICE_TABLE, answer: 12500, money: true, hint: "$9,000 + $3,500", explain: "$12,500 — the same snack costs $1,500 more!" },
  { q: "Why can prices go up?", options: ["Ingredients, transport or electricity cost more.", "Stores are angry.", "Money disappears from banks."], correct: 0, explain: "When costs go up, stores charge more." },
];

const LEAGUE_ROOMS = [
  { id: "detective", name: "Price Detective", e: "🔎", badge: "Price Detective", brief: "Compare two stores and find the cheaper one.", render: (done) => <RoundsRunner rounds={M_DETECTIVE} onDone={done} doneLabel="Mission complete!" /> },
  { id: "discount", name: "Discount Master", e: "💸", badge: "Discount Master", brief: "The sale is on! Calculate the final prices.", render: (done) => <RoundsRunner rounds={M_DISCOUNT} onDone={done} doneLabel="Mission complete!" /> },
  { id: "fake", name: "Fake Sale?", e: "🕵️", badge: "Sale Detective", brief: "Big discount… or real deal? Compare final prices.", render: (done) => <RoundsRunner rounds={M_FAKE} onDone={done} doneLabel="Mission complete!" /> },
  { id: "prices", name: "Prices Go Up!", e: "📈", badge: "Price Analyst", brief: "Find the price increases from January to June.", render: (done) => <RoundsRunner rounds={M_PRICES} onDone={done} doneLabel="Mission complete!" /> },
];

const HUNT_PRODUCTS = ["🥔 A bag of chips", "🍪 A pack of cookies", "💧 A bottle of water", "🧃 A six-pack of juice", "📓 A school notebook", "🎧 Cheap headphones"];
function PriceHunter({ existing, onSave, onExit }) {
  const [product, setProduct] = useState(existing?.product || "");
  const [stores, setStores] = useState(existing?.stores || [0, 1, 2].map(() => ({ name: "", size: "", price: "", disc: "" })));
  const [verdict, setVerdict] = useState(existing?.verdict || "");
  const [st, finish] = useFinish(onSave);
  const set = (i, k, v) => setStores(stores.map((s, x) => (x === i ? { ...s, [k]: v } : s)));
  const finals = stores.map((s) => Math.round(num(s.price) * (1 - Math.min(90, num(s.disc)) / 100)));
  const filled = stores.every((s) => s.name.trim() && num(s.price) > 0);
  const best = filled ? finals.indexOf(Math.min(...finals)) : -1;
  const saved = filled ? Math.max(...finals) - Math.min(...finals) : 0;
  const ready = product && filled && countWords(verdict) >= 15;
  if (st.done) return <Reward title="Real-life price hunter! 🌐" subtitle={`Best option: ${stores[best]?.name}. You save ${cop(saved)}.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Search size={22} strokeWidth={2.1} />} title="Real-Life Price Hunter" subtitle="Find the same product in 3 real stores and compare." onExit={onExit}>
      <div className="start-explain">
        <h3><Lightbulb size={18} strokeWidth={2.3} /> Golden rule</h3>
        <p>Compare the <b>same product</b>, the <b>same brand</b> and the <b>same size</b>. With an adult, search online (for example Éxito, Jumbo or Olímpica) or visit stores near your home. Prices change every day!</p>
      </div>
      <div className="start-block">
        <h3><span className="step-n">1</span> Choose your product</h3>
        <div className="p1-starters">{HUNT_PRODUCTS.map((p) => <button key={p} type="button" className={`p1-chip ${product === p ? "on" : ""}`} onClick={() => setProduct(p)}>{p}</button>)}</div>
      </div>
      <div className="p2-hunt">
        {stores.map((s, i) => (
          <div key={i} className={`p2-hunt-col ${best === i ? "best" : ""}`}>
            <b>Store {"ABC"[i]} {best === i && "🏆"}</b>
            <input className="start-input" value={s.name} onChange={(e) => set(i, "name", e.target.value)} placeholder="Store name" />
            <input className="start-input" value={s.size} onChange={(e) => set(i, "size", e.target.value)} placeholder="Size (e.g. 300 ml)" />
            <MoneyInput value={s.price} onChange={(v) => set(i, "price", v)} placeholder="Price" />
            <div className="p2-money"><span>%</span><input type="number" min="0" max="90" value={s.disc} onChange={(e) => set(i, "disc", e.target.value)} placeholder="Discount (0 if none)" /></div>
            <div className="p2-final">Final price<b>{num(s.price) > 0 ? cop(finals[i]) : "—"}</b></div>
          </div>
        ))}
      </div>
      {filled && <div className="p1-banner good"><Trophy size={18} /> Best store: <b>{stores[best].name}</b> · you save <b>{cop(saved)}</b> compared to the most expensive store.</div>}
      <div className="start-block">
        <h3><span className="step-n">2</span> My verdict</h3>
        <Starters items={[`The best store is ${filled ? stores[best].name : "…"} because…`, "The final price is…", "I save…", "I compared the same size:"]} onPick={appendStarter(setVerdict)} />
        <WordField value={verdict} onChange={setVerdict} min={15} max={70} rows={3} placeholder="The best store is … because …" />
      </div>
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { product, stores, finals, best, saved, verdict })}>Send my research <span className="coin-tag"><Coins size={15} /> +30</span></button>
      </div>
    </ActShell>
  );
}

const BATTLE = [
  { id: "juice", e: "🧃", name: "Six juice boxes", prices: { A: 12000, B: 10800, C: 9900 }, note: { C: "$11,000 − 10%" } },
  { id: "chips", e: "🥔", name: "Chips", prices: { A: 4000, B: 3500 } },
  { id: "cookies", e: "🍪", name: "Cookies", prices: { A: 5000, B: 4500 } },
  { id: "popcorn", e: "🍿", name: "Popcorn", prices: { A: 6000, B: 4800 } },
];
function ShoppingBattle({ onSave, onExit }) {
  const BUDGET = 30000, RESERVE = 2000;
  const [warm, setWarm] = useState(null);
  const [picks, setPicks] = useState({});
  const [st, finish] = useFinish(onSave);
  const setPick = (id, patch) => setPicks((p) => ({ ...p, [id]: { store: null, qty: 0, ...p[id], ...patch } }));
  const lines = BATTLE.map((p) => { const pk = picks[p.id] || {}; const price = pk.store ? p.prices[pk.store] : 0; const maxP = Math.max(...Object.values(p.prices)); return { ...p, store: pk.store, qty: pk.qty || 0, cost: price * (pk.qty || 0), worst: maxP * (pk.qty || 0) }; });
  const spent = lines.reduce((a, l) => a + (l.store ? l.cost : 0), 0);
  const worst = lines.reduce((a, l) => a + (l.store ? l.worst : 0), 0);
  const kinds = lines.filter((l) => l.store && l.qty > 0).length;
  const left = BUDGET - spent;
  const rules = [
    { ok: spent <= BUDGET && spent > 0, t: `Spend ${cop(BUDGET)} or less` },
    { ok: kinds >= 2, t: "Buy at least 2 different products" },
    { ok: left >= RESERVE, t: `Keep at least ${cop(RESERVE)} for the weekend` },
  ];
  const allOk = rules.every((r) => r.ok);
  const coins = allOk ? 40 : 25;
  if (st.done) return <Reward title="Shopping Battle won! 🏆" subtitle={`You spent ${cop(spent)} and saved ${cop(worst - spent)}.`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<ShoppingCart size={22} strokeWidth={2.1} />} title="The $30,000 Shopping Battle" subtitle="Organize the class movie afternoon. Make the best purchase!" onExit={onExit}>
      <div className="start-block">
        <h3><span className="step-n">1</span> Reading challenge: who is right?</h3>
        <p className="start-tip">Store C sells six juice boxes for $11,000 with an extra 10% discount. What is the final price?</p>
        <div className="quiz-options">
          {["$9,900", "$10,000", "$10,800"].map((o, k) => (
            <button key={o} type="button" className={`quiz-opt ${warm !== null && k === 0 ? "correct" : ""} ${warm === k && k !== 0 ? "wrong" : ""}`} disabled={warm === 0} onClick={() => setWarm(k)}>
              <span className="opt-key">{"ABC"[k]}</span><span className="opt-text">{o}</span>
            </button>
          ))}
        </div>
        {warm === 0 && <div className="p1-banner good"><Check size={18} /> Yes! 10% of $11,000 = $1,100 → $9,900. Emma was right — and Daniel was smart to calculate!</div>}
        {warm !== null && warm !== 0 && <div className="p1-hint">💡 10% of $11,000 is $1,100. Subtract it.</div>}
      </div>
      {warm === 0 && (
        <>
          <div className="start-block">
            <h3><span className="step-n">2</span> Build your shopping list</h3>
            <div className="p2-battle">
              {lines.map((l) => (
                <div key={l.id} className="p2-battle-row">
                  <span className="p2-battle-name"><em>{l.e}</em>{l.name}</span>
                  <div className="p2-battle-stores">
                    {Object.entries(l.prices).map(([s, p]) => (
                      <button key={s} type="button" className={`p2-pill ${l.store === s ? "on" : ""}`} onClick={() => setPick(l.id, { store: l.store === s ? null : s, qty: l.qty || 1 })}>
                        {s}: {cop(p)}{l.note?.[s] && <small>{l.note[s]}</small>}
                      </button>
                    ))}
                  </div>
                  <div className="p2-stepper sm">
                    <button type="button" onClick={() => setPick(l.id, { qty: Math.max(0, l.qty - 1) })} disabled={!l.store || l.qty === 0}>−</button>
                    <b>{l.qty}</b>
                    <button type="button" onClick={() => setPick(l.id, { qty: Math.min(3, l.qty + 1) })} disabled={!l.store || l.qty >= 3}>+</button>
                  </div>
                  <span className="p2-battle-cost">{l.store ? cop(l.cost) : "—"}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p2-stats">
            <div className="out"><small>Total spent</small><b>{cop(spent)}</b></div>
            <div className="save"><small>Money saved*</small><b>{cop(Math.max(0, worst - spent))}</b></div>
            <div className={left < 0 ? "out" : "in"}><small>Money left</small><b>{cop(left)}</b></div>
          </div>
          <p className="start-tip p2-hint-line">* Saved = what you pay vs. buying the same things at the most expensive store.</p>
          <ul className="p2-rules">{rules.map((r) => <li key={r.t} className={r.ok ? "ok" : "no"}>{r.ok ? "✅" : "⬜"} {r.t}</li>)}</ul>
          <div className="start-foot">
            <button className="s1-btn primary big" disabled={spent === 0 || spent > BUDGET} onClick={() => finish(coins, { picks, spent, saved: worst - spent, left, allOk })}>Finish my shopping <span className="coin-tag"><Coins size={15} /> +{coins}</span></button>
          </div>
        </>
      )}
    </ActShell>
  );
}

const REASONS = ["It is cheaper.", "It has a real discount.", "It offers better value (quality).", "It is within my budget."];
function SmartReport({ existing, onSave, onExit }) {
  const [product, setProduct] = useState(existing?.product || "");
  const [store, setStore] = useState(existing?.store || "");
  const [reason, setReason] = useState(existing?.reason || "");
  const [price, setPrice] = useState(existing?.price || "");
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const w = countWords(text);
  const ready = product && store && reason && num(price) > 0 && w >= 40 && w <= 100;
  const template = `I want to buy ${product ? product.toLowerCase() : "…"}. I compared prices in different stores. I chose Store ${store || "…"} because ${reason ? reason.charAt(0).toLowerCase() + reason.slice(1) : "…"} The final price is ${cop(price || 0)}. I saved money because I compared before buying. A smart shopper checks the final price, not only the discount. Next time, I will…`;
  if (st.done) return <Reward title="Smart Shopper report sent! 📝" subtitle={`You wrote ${w} words.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Receipt size={22} strokeWidth={2.1} />} title="My Smart Shopper Report" subtitle="Explain a buying decision in English (5–7 sentences)." onExit={onExit}>
      <div className="start-block">
        <div className="p2-grid2">
          <label className="p2-field"><span>Product</span>
            <select className="start-input" value={product} onChange={(e) => setProduct(e.target.value)}><option value="">Choose…</option>{["Chips", "Juice", "Headphones", "A backpack", "A T-shirt", "Sneakers"].map((p) => <option key={p}>{p}</option>)}</select>
          </label>
          <label className="p2-field"><span>Store selected</span>
            <div className="p2-seg">{["A", "B", "C"].map((s) => <button key={s} type="button" className={store === s ? "on" : ""} onClick={() => setStore(s)}>Store {s}</button>)}</div>
          </label>
          <label className="p2-field"><span>My main reason</span>
            <select className="start-input" value={reason} onChange={(e) => setReason(e.target.value)}><option value="">Choose…</option>{REASONS.map((r) => <option key={r}>{r}</option>)}</select>
          </label>
          <label className="p2-field"><span>Final price</span><MoneyInput value={price} onChange={setPrice} /></label>
        </div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">✦</span> Write your explanation</h3>
        <button type="button" className="p1-link" disabled={!product || !store || !reason} onClick={() => setText(template)}><Sparkles size={14} /> Use the template (then change it with your own words)</button>
        <Starters items={["I chose Store … because…", "The final price is…", "It is cheaper than…", "I saved…"]} onPick={appendStarter(setText)} />
        <WordField value={text} onChange={setText} min={40} max={100} rows={6} placeholder="I want to buy … I chose Store … because …" />
      </div>
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!ready} onClick={() => finish(25, { product, store, reason, price: num(price), text })}>Send my report <span className="coin-tag"><Coins size={15} /> +25</span></button>
      </div>
    </ActShell>
  );
}

/* =====================================================================
   SEMANA 16 · WAIT OR BUY NOW?  (sin video: explicación + juegos)
   ===================================================================== */
const READ_W16 = [
  { h: "Buy Now or Wait?" },
  { p: "Imagine you have $10,000. You see candy for $3,000. You want it now! But you also want a skateboard that costs $60,000." },
  { p: "If you buy the candy now, it takes more time to buy the skateboard. If you wait, your savings grow faster." },
  { sub: "🍡 The marshmallow experiment" },
  { p: "Scientists gave children one marshmallow. They said: “You can eat it now, or you can wait 15 minutes and get two marshmallows.” Some children ate it immediately. Other children waited and got two." },
  { p: "Waiting for something better later is called delayed gratification. It is not easy, but it helps you reach bigger goals." },
  { sub: "Tips to wait" },
  { list: ["Write your goal and put it where you can see it.", "Ask yourself: Do I need it now, or can I wait?", "Wait 24 hours before you buy something you want.", "Count how many weeks you need to reach your goal."] },
  { box: "Waiting is a superpower: a small “no” today, a big “yes” tomorrow!" },
];
const GLOSS_W16 = {
  "delayed gratification": "Gratificación aplazada — esperar para obtener algo mejor después.",
  "immediately": "Inmediatamente — ya, en este momento.",
  "marshmallow": "Masmelo / malvavisco.",
};
const Q_W16 = [
  { q: "What is delayed gratification?", options: ["Waiting for something better later.", "Buying everything now.", "Never buying anything."], correct: 0, feedback: "Waiting now → something better later." },
  { q: "In the experiment, the children who waited got…", options: ["two marshmallows.", "no marshmallows.", "one candy."], correct: 0, feedback: "They got two marshmallows!" },
  { q: "A good question before you buy is…", options: ["“Do I need it now, or can I wait?”", "“Is it red?”", "“Is it on TV?”"], correct: 0, feedback: "Stop and think before buying." },
  { q: "If you buy candy every day, your savings grow…", options: ["more slowly.", "faster.", "the same."], correct: 0, feedback: "Small expenses every day slow down your savings." },
];

const TEMPTATIONS = [
  { e: "🍬", n: "Candy", p: 3000 }, { e: "🎮", n: "A game skin", p: 8000 }, { e: "🧋", n: "Bubble tea", p: 6000 }, { e: "✨", n: "Stickers", p: 4000 },
  { e: "🍔", n: "A burger", p: 9000 }, { e: "🎧", n: "Cheap earbuds", p: 10000 }, { e: "🍦", n: "Ice cream", p: 3000 }, { e: "🃏", n: "Trading cards", p: 5000 },
];
function WaitGame({ onSave, onExit }) {
  const GOAL = 60000, INCOME = 10000, WEEKS = 8;
  const deck = useMemo(() => shuffleArr(TEMPTATIONS), []);
  const [week, setWeek] = useState(0);
  const [saved, setSaved] = useState(0);
  const [bought, setBought] = useState([]);
  const [last, setLast] = useState(null);
  const [reachedWeek, setReachedWeek] = useState(null);
  const [st, finish] = useFinish(onSave);
  const t = deck[week];
  const over = week >= WEEKS;
  const pct = Math.min(100, (saved / GOAL) * 100);
  const reached = saved >= GOAL;
  const choose = (buy) => {
    const add = buy ? INCOME - t.p : INCOME;
    const ns = saved + add;
    setSaved(ns);
    if (buy) setBought((b) => [...b, t]);
    if (ns >= GOAL && reachedWeek === null) setReachedWeek(week + 1);
    setLast({ buy, t });
    setWeek((w) => w + 1);
  };
  const coins = reached ? 30 : 20;
  if (st.done) return <Reward title={reached ? "Patience pays! 🛹" : "Good try! ⏳"} subtitle={reached ? `You reached your goal in week ${reachedWeek}.` : `You saved ${cop(saved)}.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Hourglass size={22} strokeWidth={2.1} />} title="Wait or Buy?" subtitle="8 weeks · +$10,000 every week · goal: a $60,000 skateboard 🛹" onExit={onExit}>
      <div className="p2-wait">
        <div className="p2-jar-wrap">
          <div className="p2-jar"><i style={{ height: `${pct}%` }} /><span>{Math.round(pct)}%</span></div>
          <b>{cop(saved)}</b><small>of {cop(GOAL)}</small>
        </div>
        <div className="p2-wait-main">
          <div className="p2-hud"><span>Week <b>{Math.min(week + 1, WEEKS)}/{WEEKS}</b></span><span>Income <b>+{cop(INCOME)}</b></span><span>Treats <b>{bought.length}</b></span></div>
          {last && <div className={`p1-banner ${last.buy ? "" : "good"}`}>{last.buy ? `You bought ${last.t.e} ${last.t.n}. You saved ${cop(INCOME - last.t.p)} this week.` : `You waited! You saved all ${cop(INCOME)}.`}</div>}
          {reached && reachedWeek && <div className="p1-banner good"><Trophy size={18} /> 🎉 You can buy the skateboard! You reached your goal in week {reachedWeek}.</div>}
          {!over ? (
            <div className="p2-temptation">
              <small>This week you see…</small>
              <em>{t.e}</em>
              <b>{t.n} — {cop(t.p)}</b>
              <div className="p2-flow-btns">
                <button type="button" className="out" onClick={() => choose(true)}>🛍️ Buy it now<small>save only {cop(INCOME - t.p)}</small></button>
                <button type="button" className="in" onClick={() => choose(false)}>⏳ Wait<small>save {cop(INCOME)}</small></button>
              </div>
            </div>
          ) : (
            <div className="p2-result">
              <span>{reached ? "🛹 Goal reached!" : `You need ${cop(GOAL - saved)} more`}</span>
              <b>{cop(saved)}</b>
              <small>Treats: {bought.length ? bought.map((b) => b.e).join(" ") : "none"} · You could buy treats for up to $20,000 and still reach the goal. Balance is the key!</small>
            </div>
          )}
        </div>
      </div>
      {over && <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(coins, { saved, bought: bought.map((b) => b.n), reachedWeek })}>Collect coins <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>}
    </ActShell>
  );
}

const WAIT_MATH = [
  { q: "A game costs $48,000. You save $8,000 a week. How many weeks must you wait?", answer: 6, unit: "weeks", hint: "$48,000 ÷ $8,000", explain: "6 weeks." },
  { q: "You want shoes for $90,000. You already have $30,000. You save $15,000 a week. How many weeks?", answer: 4, unit: "weeks", hint: "First: $90,000 − $30,000 = $60,000. Then ÷ $15,000.", explain: "$60,000 ÷ $15,000 = 4 weeks." },
  { q: "You buy candy for $3,000 every week. How much do you spend in 8 weeks?", answer: 24000, money: true, hint: "8 × $3,000", explain: "$24,000 — almost a new book!" },
  { q: "You save $12,000 a week. After how many weeks can you buy a $60,000 skateboard?", answer: 5, unit: "weeks", hint: "$60,000 ÷ $12,000", explain: "5 weeks." },
  { q: "Paula has $20,000. Headphones cost $50,000. She saves $6,000 a week. How many weeks?", answer: 5, unit: "weeks", hint: "$50,000 − $20,000 = $30,000. Then ÷ $6,000.", explain: "$30,000 ÷ $6,000 = 5 weeks." },
  { q: "If you wait 2 weeks, a $50,000 jacket has 20% OFF. How much do you pay if you wait?", answer: 40000, money: true, hint: "20% of $50,000 = $10,000.", explain: "$40,000 — waiting saved you $10,000!" },
];

const NOW_LATER = [
  { id: "now", label: "Buy now", icon: "⏱️", color: "#ff6b57" },
  { id: "wait", label: "Wait", icon: "⏳", color: "#16b074" },
];
const NOW_LATER_ITEMS = [
  { e: "👟", label: "Your school shoes are broken.", answer: "now", why: "You need them for school." },
  { e: "🎮", label: "A new skin for your favorite game.", answer: "wait", why: "It's a want. You can wait." },
  { e: "💊", label: "Medicine when you are sick.", answer: "now", why: "Health comes first." },
  { e: "📱", label: "The newest phone, but yours works well.", answer: "wait", why: "Your phone works — wait and save." },
  { e: "📓", label: "A notebook for tomorrow's class.", answer: "now", why: "You need it tomorrow." },
  { e: "🧢", label: "A cap because your friend has one.", answer: "wait", why: "That's a whim. Think before buying." },
  { e: "🎁", label: "A gift for Mom — her birthday is today!", answer: "now", why: "The date is today." },
  { e: "🧸", label: "A toy that will be on sale next month.", answer: "wait", why: "Waiting = paying less!" },
];

/* =====================================================================
   SEMANA 17 · FAMILY BUDGET + PRICES AROUND THE WORLD
   ===================================================================== */
const FAMILY = {
  name: "The Gómez family",
  incomes: [["💼 Dad's salary", 2800000], ["💼 Mom's salary", 2400000]],
  expenses: [["🏠 Rent", 1500000], ["🛒 Food", 1300000], ["🎒 School", 600000], ["🚌 Transport", 450000], ["💡 Water, light & internet", 350000], ["🎉 Fun", 300000]],
};
const FAMILY_IN = FAMILY.incomes.reduce((a, [, v]) => a + v, 0);
const FAMILY_OUT = FAMILY.expenses.reduce((a, [, v]) => a + v, 0);
const FAMILY_SAVE = FAMILY_IN - FAMILY_OUT;

function FamilyCard({ showTotals }) {
  return (
    <div className="p2-family">
      <div className="p2-family-head"><span>👨‍👩‍👧‍👦</span><div><b>{FAMILY.name}</b><small>Monthly budget</small></div></div>
      <div className="p2-family-cols">
        <div><h4 className="in">Income</h4>{FAMILY.incomes.map(([n, v]) => <p key={n}><span>{n}</span><b>{cop(v)}</b></p>)}{showTotals && <p className="tot"><span>Total</span><b>{cop(FAMILY_IN)}</b></p>}</div>
        <div><h4 className="out">Expenses</h4>{FAMILY.expenses.map(([n, v]) => <p key={n}><span>{n}</span><b>{cop(v)}</b></p>)}{showTotals && <p className="tot"><span>Total</span><b>{cop(FAMILY_OUT)}</b></p>}</div>
      </div>
      {showTotals && <div className="p2-family-save">🐖 Savings every month: <b>{cop(FAMILY_SAVE)}</b></div>}
    </div>
  );
}

const FAMILY_ROUNDS = [
  { q: "What is the family's TOTAL income every month?", answer: FAMILY_IN, money: true, hint: "Add Dad's and Mom's salaries.", explain: "$2,800,000 + $2,400,000 = $5,200,000." },
  { q: "What are the family's TOTAL expenses every month?", answer: FAMILY_OUT, money: true, hint: "Add the six expenses.", explain: "Total expenses: $4,500,000." },
  { q: "How much can the family save every month?", answer: FAMILY_SAVE, money: true, hint: "Income − expenses.", explain: "$5,200,000 − $4,500,000 = $700,000." },
  { q: "What is the family's biggest expense?", options: ["Rent", "Food", "School", "Transport"], correct: 0, explain: "Rent: $1,500,000." },
  { q: "The family wants a trip that costs $2,100,000. How many months do they need to save?", answer: 3, unit: "months", hint: "$2,100,000 ÷ $700,000", explain: "3 months." },
  { q: "They go out for pizza: 4 pizzas × $35,000. How much do they pay?", answer: 140000, money: true, hint: "4 × $35,000", explain: "$140,000." },
];

const RATES = [
  { code: "USD", sym: "US$", name: "US dollar", flag: "🇺🇸", rate: 4000 },
  { code: "GBP", sym: "£", name: "British pound", flag: "🇬🇧", rate: 5000 },
  { code: "EUR", sym: "€", name: "Euro", flag: "🇪🇺", rate: 4500 },
  { code: "JPY", sym: "¥", name: "Japanese yen", flag: "🇯🇵", rate: 27 },
  { code: "MXN", sym: "MX$", name: "Mexican peso", flag: "🇲🇽", rate: 220 },
];
const rateOf = (code) => (code === "COP" ? 1 : RATES.find((r) => r.code === code)?.rate || 0);

function RatesCard() {
  return (
    <div className="p2-rates">
      <b>🏦 Class exchange rates</b>
      <div>{RATES.map((r) => <span key={r.code}>{r.flag} 1 {r.sym} = <b>{cop(r.rate)}</b> COP</span>)}</div>
      <small>Rounded numbers for class. Real rates change every day.</small>
    </div>
  );
}

const CONVERT_ROUNDS = [
  { q: "🇺🇸 A pizza in New York costs US$15. How much is it in Colombian pesos?", answer: 60000, money: true, hint: "15 × $4,000", explain: "15 × $4,000 = $60,000 COP." },
  { q: "🇬🇧 A cinema ticket in London costs £10. How much in COP?", answer: 50000, money: true, hint: "10 × $5,000", explain: "$50,000 COP." },
  { q: "🇪🇸 An ice cream in Madrid costs €3. How much in COP?", answer: 13500, money: true, hint: "3 × $4,500", explain: "$13,500 COP." },
  { q: "🇯🇵 A bus ride in Tokyo costs ¥200. How much in COP?", answer: 5400, money: true, hint: "200 × $27", explain: "$5,400 COP." },
  { q: "🇲🇽 A burger in Mexico City costs MX$100. How much in COP?", answer: 22000, money: true, hint: "100 × $220", explain: "$22,000 COP." },
  { q: "A pizza costs $35,000 in Bogotá and $60,000 in New York. How much MORE expensive is New York?", answer: 25000, money: true, hint: "$60,000 − $35,000", explain: "New York is $25,000 more expensive." },
];
const CONVERT_INTRO = (
  <div className="start-explain">
    <h3><Globe size={18} strokeWidth={2.3} /> How to convert</h3>
    <p>Multiply the price by the rate. Example: a pizza in London costs <b>£12</b>. 12 × $5,000 = <b>$60,000 COP</b>.</p>
    <RatesCard />
  </div>
);

const CITIES = [
  { id: "bog", city: "Bogotá", flag: "🇨🇴", cur: "COP" },
  { id: "nyc", city: "New York", flag: "🇺🇸", cur: "USD" },
  { id: "lon", city: "London", flag: "🇬🇧", cur: "GBP" },
  { id: "mad", city: "Madrid", flag: "🇪🇸", cur: "EUR" },
  { id: "tok", city: "Tokyo", flag: "🇯🇵", cur: "JPY" },
];
const LIVING = {
  pizza: { e: "🍕", n: "a pizza", prices: { bog: 35000, nyc: 15, lon: 13, mad: 10, tok: 1500 } },
  cinema: { e: "🎬", n: "a cinema ticket", prices: { bog: 18000, nyc: 16, lon: 12, mad: 9, tok: 1900 } },
  icecream: { e: "🍦", n: "an ice cream", prices: { bog: 8000, nyc: 5, lon: 3, mad: 3, tok: 400 } },
  bus: { e: "🚌", n: "a bus ride", prices: { bog: 3200, nyc: 3, lon: 2, mad: 2, tok: 210 } },
};
const symOf = (cur) => (cur === "COP" ? "$" : RATES.find((r) => r.code === cur)?.sym);

function CostCompare({ onSave, onExit }) {
  const [item, setItem] = useState("pizza");
  const [ans, setAns] = useState({});
  const [checked, setChecked] = useState(false);
  const [pickMax, setPickMax] = useState(null);
  const [text, setText] = useState("");
  const [st, finish] = useFinish(onSave);
  const it = LIVING[item];
  const copOf = (c) => it.prices[c.id] * rateOf(c.cur);
  const okRow = (c) => c.cur === "COP" || Math.abs(num(ans[c.id]) - copOf(c)) <= 100;
  const allOk = CITIES.every(okRow);
  const ranking = [...CITIES].sort((a, b) => copOf(b) - copOf(a));
  const maxV = copOf(ranking[0]);
  const ready = allOk && checked && pickMax === ranking[0].id && countWords(text) >= 20;
  const changeItem = (k) => { setItem(k); setAns({}); setChecked(false); setPickMax(null); };
  if (st.done) return <Reward title="World traveler! 🌍" subtitle={`The most expensive place for ${it.n}: ${ranking[0].city}.`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Globe size={22} strokeWidth={2.1} />} title="Cost of Living Explorer" subtitle="Is a pizza in Bogotá the same as a pizza in London?" onExit={onExit}>
      <div className="start-block">
        <h3><span className="step-n">1</span> Choose a product</h3>
        <div className="p1-starters">{Object.entries(LIVING).map(([k, v]) => <button key={k} type="button" className={`p1-chip ${item === k ? "on" : ""}`} onClick={() => changeItem(k)}>{v.e} {v.n}</button>)}</div>
        <RatesCard />
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> Convert every price to COP</h3>
        <p className="start-tip">Example prices for class. Multiply each price by the rate.</p>
        <div className="p2-cities">
          {CITIES.map((c) => (
            <div key={c.id} className={`p2-city ${checked ? (okRow(c) ? "ok" : "no") : ""}`}>
              <span className="p2-city-name">{c.flag} {c.city}</span>
              <span className="p2-city-local">{it.e} {symOf(c.cur)}{it.prices[c.id].toLocaleString("en-US")} {c.cur !== "COP" && <small>× {cop(rateOf(c.cur))}</small>}</span>
              {c.cur === "COP" ? <b className="p2-city-cop">{cop(it.prices[c.id])}</b> : <MoneyInput value={ans[c.id] || ""} onChange={(v) => { setAns({ ...ans, [c.id]: v }); setChecked(false); }} placeholder="COP" />}
            </div>
          ))}
        </div>
        {checked && !allOk && <div className="p1-hint">💡 Check the red rows. Price × rate.</div>}
        {!(checked && allOk) && <div className="start-foot"><button className="s1-btn primary" onClick={() => setChecked(true)}>Check my conversions <Check size={16} /></button></div>}
      </div>
      {checked && allOk && (
        <>
          <div className="start-block">
            <h3><span className="step-n">3</span> Compare</h3>
            <div className="p2-bars">
              {ranking.map((c) => (
                <div key={c.id} className="p2-bar-row">
                  <span>{c.flag} {c.city}</span>
                  <div className="p2-bar-track"><i style={{ width: `${(copOf(c) / maxV) * 100}%` }} /></div>
                  <b>{cop(copOf(c))}</b>
                </div>
              ))}
            </div>
            <p className="quiz-q p2-q-sm">Which city is the most expensive for {it.n}?</p>
            <div className="p1-starters">{CITIES.map((c) => (
              <button key={c.id} type="button" className={`p1-chip ${pickMax === c.id ? (c.id === ranking[0].id ? "on" : "wrong") : ""}`} onClick={() => setPickMax(c.id)}>{c.flag} {c.city}</button>
            ))}</div>
            {pickMax && pickMax !== ranking[0].id && <p className="goal-warn">Look at the longest bar!</p>}
          </div>
          <div className="start-block">
            <h3><span className="step-n">4</span> Write: compare two prices</h3>
            <Starters items={[`${it.n.charAt(0).toUpperCase() + it.n.slice(1)} in ${ranking[0].city} costs ${cop(copOf(ranking[0]))},`, `but in Bogotá it costs ${cop(it.prices.bog)}.`, `${ranking[0].city} is more expensive than…`, "I think it is different because…"]} onPick={appendStarter(setText)} />
            <WordField value={text} onChange={setText} min={20} max={70} rows={3} placeholder="A pizza in … costs … but in … it costs …" />
          </div>
        </>
      )}
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!ready} onClick={() => finish(35, { item, ranking: ranking.map((c) => c.city), text })}>Finish <span className="coin-tag"><Coins size={15} /> +35</span></button>
      </div>
    </ActShell>
  );
}

const TRIP_ACTS = ["🎬 Go to the cinema", "🍕 Eat pizza", "🎢 Visit a theme park", "🏛️ Visit a museum", "⚽ Watch a football game", "🦁 Visit a zoo"];
function FamilyTrip({ existing, onSave, onExit }) {
  const [act, setAct] = useState(existing?.act || "");
  const [rows, setRows] = useState(existing?.rows || [0, 1, 2].map(() => ({ place: "", price: "", cur: "USD" })));
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  const set = (i, k, v) => setRows(rows.map((r, x) => (x === i ? { ...r, [k]: v } : r)));
  const conv = rows.map((r) => num(r.price) * rateOf(r.cur));
  const filled = rows.every((r) => r.place.trim() && num(r.price) > 0);
  const ready = act && filled && countWords(text) >= 20;
  if (st.done) return <Reward title="Family trip researched! ✈️" subtitle="You compared real prices around the world." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Plane size={22} strokeWidth={2.1} />} title="Family Fun Around the World" subtitle="Can the Gómez family pay for this activity in other countries?" onExit={onExit}>
      <FamilyCard showTotals />
      <div className="start-block">
        <h3><span className="step-n">1</span> Choose a family activity</h3>
        <div className="p1-starters">{TRIP_ACTS.map((a) => <button key={a} type="button" className={`p1-chip ${act === a ? "on" : ""}`} onClick={() => setAct(a)}>{a}</button>)}</div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> Research the price in 3 countries</h3>
        <p className="start-tip">With an adult, search online: <i>“{act ? act.slice(3).toLowerCase() : "cinema ticket"} price in London”</i>. Write the price for <b>1 person</b> in the local currency.</p>
        <RatesCard />
        <div className="p2-trip">
          {rows.map((r, i) => (
            <div key={i} className="p2-trip-row">
              <input className="start-input" value={r.place} onChange={(e) => set(i, "place", e.target.value)} placeholder="City, country" />
              <select className="start-input" value={r.cur} onChange={(e) => set(i, "cur", e.target.value)}>
                {RATES.map((x) => <option key={x.code} value={x.code}>{x.flag} {x.code}</option>)}
                <option value="COP">🇨🇴 COP</option>
              </select>
              <input className="start-input" type="number" min="0" value={r.price} onChange={(e) => set(i, "price", e.target.value)} placeholder={`Price in ${r.cur}`} />
              <div className="p2-trip-res">
                <span>1 person: <b>{num(r.price) > 0 ? cop(conv[i]) : "—"}</b></span>
                <span>Family of 4: <b>{num(r.price) > 0 ? cop(conv[i] * 4) : "—"}</b></span>
                {num(r.price) > 0 && <em className={conv[i] * 4 <= FAMILY_SAVE ? "ok" : "no"}>{conv[i] * 4 <= FAMILY_SAVE ? "✅ They can pay with one month of savings" : "❌ More than one month of savings"}</em>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">3</span> Compare two prices</h3>
        <Starters items={["In … it costs …, but in … it costs …", "… is more expensive than …", "The Gómez family can / can't…", "I was surprised because…"]} onPick={appendStarter(setText)} />
        <WordField value={text} onChange={setText} min={20} max={70} rows={3} placeholder="In London it costs … but in Bogotá …" />
      </div>
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!ready} onClick={() => finish(30, { act, rows, text })}>Send my research <span className="coin-tag"><Coins size={15} /> +30</span></button>
      </div>
    </ActShell>
  );
}

/* =====================================================================
   SEMANA 18 · DIGITAL PAYMENTS  (explicación + CREAR Shop con PIN)
   Necesita el bloque de Apps Script "shop_*" (hojas Shop_Players y Shop_Orders).
   ===================================================================== */
const READ_W18 = [
  { h: "How Do We Pay Today?" },
  { p: "Long ago, people paid with coins and banknotes. Today, we have new ways to pay. They are fast, but we must use them carefully." },
  { sub: "💳 Card" },
  { p: "A debit card is connected to a bank account. You insert or tap the card in a machine, and you type your secret PIN." },
  { sub: "🔳 QR code" },
  { p: "A QR code is a black and white square. You scan it with your phone camera, and you confirm the payment in your bank app." },
  { sub: "📲 Digital wallet" },
  { p: "A digital wallet is an app on your phone. Your money is in the app, and you can pay or send money with a phone number." },
  { box: "Every method needs a secret: your PIN or password. Never share it!" },
];
const PAY_BUCKETS = [
  { id: "card", label: "Card", icon: "💳", color: "#5b8def" },
  { id: "qr", label: "QR", icon: "🔳", color: "#0b7a50" },
  { id: "wallet", label: "Wallet", icon: "📲", color: "#9b5de5" },
];
const PAY_ITEMS = [
  { label: "I put my card in the machine and type my PIN.", answer: "card" },
  { label: "I scan a black and white square with my phone camera.", answer: "qr" },
  { label: "I open an app and send money to my friend's phone number.", answer: "wallet" },
  { label: "The cashier says: “Insert or tap, please.”", answer: "card" },
  { label: "The store has a small poster with a code at the counter.", answer: "qr" },
  { label: "My money is in an app, not in my pocket.", answer: "wallet" },
];

const METHODS = [
  { id: "card", e: "💳", name: "Card", say: "Can I pay by card?", step: "Insert or tap your card. Then type your PIN." },
  { id: "qr", e: "🔳", name: "QR code", say: "Can I pay with a QR code?", step: "Scan the shop's QR code. Then confirm with your PIN." },
  { id: "wallet", e: "📲", name: "Digital wallet", say: "I'll pay with my digital wallet.", step: "Open your wallet app and confirm with your PIN." },
];
const WEAK_PINS = ["0000", "1111", "1234", "2222", "4321", "9999", "1212", "6789"];

function PinPad({ value, onChange, onSubmit, label = "Type your secret PIN", busy, submitLabel }) {
  const press = (d) => { if (value.length < 4) onChange(value + d); };
  return (
    <div className="p2-pinpad">
      <span className="p2-pin-label">🔒 {label}</span>
      <div className="p2-pin-dots">{[0, 1, 2, 3].map((i) => <i key={i} className={i < value.length ? "on" : ""} />)}</div>
      <div className="p2-pin-keys">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"].map((k) => (
          <button key={k} type="button" disabled={busy || (k === "✓" && value.length < 4)} className={k === "✓" ? "ok" : k === "⌫" ? "del" : ""}
            onClick={() => (k === "⌫" ? onChange(value.slice(0, -1)) : k === "✓" ? onSubmit() : press(k))}>{k === "✓" && submitLabel ? submitLabel : k}</button>
        ))}
      </div>
      <small>🙈 Cover the keypad. Never share your PIN!</small>
    </div>
  );
}

function QrArt({ seed = "CREAR" }) {
  const N = 13;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rnd = () => { h = (h * 1103515245 + 12345) >>> 0; return (h >>> 16) & 1; };
  const F = 5;
  const finder = (r, c) => {
    for (const [r0, c0] of [[0, 0], [0, N - F], [N - F, 0]]) {
      if (r >= r0 && r < r0 + F && c >= c0 && c < c0 + F) {
        const lr = r - r0, lc = c - c0;
        return lr === 0 || lr === F - 1 || lc === 0 || lc === F - 1 || (lr === 2 && lc === 2) ? 1 : 0;
      }
    }
    return null;
  };
  const cells = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const f = finder(r, c); cells.push(f === null ? rnd() : f); }
  return <div className="p2-qr">{cells.map((v, i) => <i key={i} className={v ? "on" : ""} />)}</div>;
}

function ShopGame({ userData, API_URL, onSave, onExit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [role, setRole] = useState(null);
  const [shopName, setShopName] = useState(`${String(userData?.Nombre_Completo || "My").split(" ")[0]}'s Shop`);
  const [newPin, setNewPin] = useState("");
  const [mode, setMode] = useState("home");
  const [code, setCode] = useState("");
  const [shop, setShop] = useState(null);
  const [cart, setCart] = useState({});
  const [method, setMethod] = useState(null);
  const [pin, setPin] = useState("");
  const [scanned, setScanned] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [st, finish] = useFinish(onSave);

  const post = async (action, extra = {}) => {
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action, user_key: userData.Student_Key, nombre: userData.Nombre_Completo, grado: GRADE, ...extra }) });
    return res.json();
  };
  const run = async (action, extra) => {
    setBusy(true); setMsg(null);
    try {
      const d = await post(action, extra);
      if (d.status === "error") { setMsg({ type: "bad", text: d.message }); return null; }
      if ("me" in d) setData(d);
      return d;
    } catch (e) { setMsg({ type: "bad", text: "Connection problem. Try again." }); return null; }
    finally { setBusy(false); setLoading(false); }
  };
  useEffect(() => { run("shop_state"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const me = data?.me;
  // El vendedor ve sus ventas casi en vivo (cada 5 s)
  useEffect(() => {
    if (me?.role !== "seller") return;
    const id = setInterval(async () => { try { const d = await post("shop_state"); if (d && "me" in d) setData(d); } catch (e) { /* reintenta */ } }, 5000);
    return () => clearInterval(id);
  }, [me?.role]); // eslint-disable-line react-hooks/exhaustive-deps

  const join = async () => {
    if (role === "buyer") {
      if (newPin.length !== 4) return;
      if (WEAK_PINS.includes(newPin)) { setMsg({ type: "bad", text: "That PIN is too easy to guess! Choose a stronger one." }); setNewPin(""); return; }
    }
    await run("shop_join", { role, shop_name: shopName.trim() || "My Shop", pin: newPin });
    setNewPin("");
  };
  const leave = async () => {
    if (!window.confirm("Change role? Your shop or wallet will start again.")) return;
    const d = await run("shop_leave");
    if (d) { setRole(null); setMode("home"); setShop(null); setCart({}); }
  };
  const openShop = async () => { const d = await run("shop_open", { code }); if (d?.shop) { setShop(d.shop); setCart({}); setMode("shop"); } };
  const cartItems = shop ? shop.products.filter((p) => cart[p.id] > 0).map((p) => ({ ...p, qty: cart[p.id] })) : [];
  const cartTotal = cartItems.reduce((a, p) => a + p.p * p.qty, 0);
  const setQty = (id, d) => setCart((c) => ({ ...c, [id]: Math.max(0, Math.min(5, (c[id] || 0) + d)) }));
  const pay = async () => {
    const d = await run("shop_pay", { code: shop.code, items: cartItems.map((p) => ({ id: p.id, qty: p.qty })), method, pin });
    setPin("");
    if (d?.receipt) { setReceipt(d.receipt); setMode("receipt"); setScanned(false); }
  };
  const backHome = () => { setMode("home"); setShop(null); setCart({}); setMethod(null); setReceipt(null); setCode(""); setScanned(false); };

  const isSeller = me?.role === "seller";
  const salesN = me?.salesCount || 0;
  const buysN = me?.purchases || 0;
  const canFinish = isSeller ? salesN >= 1 : buysN >= 2;
  const coins = 25 + Math.min(isSeller ? salesN : buysN, 5) * 3;
  if (st.done) return <Reward title={isSeller ? "Shop closed! 🏪" : "Smart buyer! 🛍️"} subtitle={isSeller ? `You sold ${cop(me?.salesTotal || 0)} in ${salesN} sales.` : `You made ${buysN} purchases and kept ${cop(me?.balance || 0)}.`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;

  const Board = () => (data?.board?.length > 0 ? (
    <div className="start-block">
      <h3><Trophy size={18} /> Top shops <button type="button" className="p1-link" onClick={() => run("shop_state")}><RefreshCw size={13} /> refresh</button></h3>
      <div className="p1-board">
        {data.board.slice(0, 10).map((b, i) => (
          <div key={i} className={`p1-board-row ${b.me ? "me" : ""}`}>
            <span className="p1-board-n">{i + 1}</span>
            <span className="p1-board-name">🏪 {b.shop} · {b.name}{b.me ? " (you)" : ""}</span>
            <span>{cop(b.sales)}</span>
            <span>{b.count} 🧾</span>
          </div>
        ))}
      </div>
    </div>
  ) : null);

  return (
    <ActShell icon={<Store size={22} strokeWidth={2.1} />} title="The CREAR Shop" subtitle="Sellers open shops. Buyers walk around, buy and pay with card, QR or wallet." onExit={onExit}>
      {msg && <div className={`p1-banner ${msg.type === "good" ? "good" : "bad"}`}>{msg.text}</div>}
      {loading ? <p className="start-tip p1-center">Opening the shops…</p> : !me ? (
        <>
          <div className="p2-roles">
            <button type="button" className={`p2-role ${role === "seller" ? "on" : ""}`} onClick={() => setRole("seller")}><em>🏪</em><b>I'm a seller</b><small>You get a shop with 5 products and a shop code.</small></button>
            <button type="button" className={`p2-role ${role === "buyer" ? "on" : ""}`} onClick={() => setRole("buyer")}><em>🛍️</em><b>I'm a buyer</b><small>You get {cop(50000)} and a secret PIN to pay.</small></button>
          </div>
          {role === "seller" && (
            <div className="start-block">
              <h3><Store size={18} /> Name your shop</h3>
              <input className="start-input" value={shopName} maxLength={28} onChange={(e) => setShopName(e.target.value)} />
              <div className="start-foot"><button className="s1-btn primary big" disabled={busy || !shopName.trim()} onClick={join}>Open my shop 🏪</button></div>
            </div>
          )}
          {role === "buyer" && (
            <div className="start-block p1-center">
              <h3><KeyRound size={18} /> Create your secret PIN</h3>
              <p className="start-tip">4 numbers. Don't use 1234 or your birthday. <b>Never tell anyone!</b></p>
              <PinPad value={newPin} onChange={setNewPin} onSubmit={join} busy={busy} label="Create a 4-digit PIN" />
            </div>
          )}
        </>
      ) : isSeller ? (
        <>
          <div className="p2-shop-sign">
            <small>WELCOME TO</small>
            <h3>🏪 {me.shopName}</h3>
            <span>Shop code — show it to your buyers:</span>
            <div className="p1-code">{me.shopCode}</div>
            <QrArt seed={me.shopCode} />
          </div>
          <div className="p2-stats">
            <div className="in"><small>Sales</small><b>{cop(me.salesTotal || 0)}</b></div>
            <div className="save"><small>Orders</small><b>{salesN}</b></div>
            <div><small>Products</small><b>{me.products?.length || 0}</b></div>
          </div>
          <div className="p2-products">{(me.products || []).map((p) => <div key={p.id} className="p2-product"><em>{p.e}</em><b>{p.n}</b><span>{cop(p.p)}</span></div>)}</div>
          <div className="p1-frames">
            <b>Seller frames:</b>
            <span>“Welcome to {me.shopName}! What would you like?”</span>
            <span>“The {me.products?.[0]?.n.toLowerCase() || "pencil"} is {cop(me.products?.[0]?.p || 2000)}.”</span>
            <span>“How would you like to pay? Card, QR or digital wallet?”</span>
            <span>“Here is your receipt. Thank you!”</span>
          </div>
          {me.history?.length > 0 && (
            <div className="start-block">
              <h3><Receipt size={18} /> Last sales <span className="p2-live"><span className="s1-sync-dot" /> live</span></h3>
              {[...me.history].reverse().slice(0, 6).map((h, i) => (
                <div key={i} className="p2-sale"><span>{METHODS.find((m) => m.id === h.method)?.e} {h.with}</span><small>{h.items}</small><b>+{cop(h.total)}</b></div>
              ))}
            </div>
          )}
          <Board />
          <div className="start-foot p2-split-foot">
            <button type="button" className="p1-link" onClick={leave}>Change role</button>
            <button className="s1-btn primary big" disabled={!canFinish} onClick={() => finish(coins, { role: "seller", sales: me.salesTotal, count: salesN })}>{canFinish ? "Close my shop" : "Make at least 1 sale"} <span className="coin-tag"><Coins size={15} /> +{coins}</span></button>
          </div>
        </>
      ) : (
        <>
          <div className="p2-walletcard">
            <div><small>My CREAR wallet</small><b>{cop(me.balance)}</b></div>
            <div><small>Spent</small><b>{cop(me.spent || 0)}</b></div>
            <div><small>Purchases</small><b>{buysN}</b></div>
          </div>

          {mode === "home" && (
            <div className="start-block p1-center">
              <h3><Search size={18} /> Visit a shop</h3>
              <p className="start-tip">Walk to a seller. Ask: <i>“Hello! Can I see your products?”</i> and type the shop code.</p>
              <input className="start-input p1-code-input" maxLength={4} value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="CODE" />
              <button className="s1-btn primary big" disabled={code.length !== 4 || busy} onClick={openShop}>Enter the shop</button>
            </div>
          )}

          {mode === "shop" && shop && (
            <div className="start-block">
              <h3>🏪 {shop.name} <small className="p2-muted">· {shop.seller}</small></h3>
              <div className="p2-products">
                {shop.products.map((p) => (
                  <div key={p.id} className={`p2-product ${cart[p.id] ? "in-cart" : ""}`}>
                    <em>{p.e}</em><b>{p.n}</b><span>{cop(p.p)}</span>
                    <div className="p2-stepper sm">
                      <button type="button" onClick={() => setQty(p.id, -1)} disabled={!cart[p.id]}>−</button>
                      <b>{cart[p.id] || 0}</b>
                      <button type="button" onClick={() => setQty(p.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p2-cart"><span><ShoppingCart size={16} /> Total</span><b>{cop(cartTotal)}</b></div>
              {cartTotal > me.balance && <p className="goal-warn">You don't have enough money. Remove something.</p>}
              <div className="p1-frames"><b>Buyer frames:</b><span>“How much is the …?”</span><span>“I'll take two …, please.”</span></div>
              <div className="p2-split-foot">
                <button className="s1-btn ghost" onClick={backHome}>Leave the shop</button>
                <button className="s1-btn primary big" disabled={cartTotal === 0 || cartTotal > me.balance} onClick={() => setMode("method")}>Pay {cop(cartTotal)}</button>
              </div>
            </div>
          )}

          {mode === "method" && (
            <div className="start-block">
              <h3><CreditCard size={18} /> How do you want to pay?</h3>
              <div className="p2-methods">
                {METHODS.map((m) => (
                  <button key={m.id} type="button" className="p2-method" onClick={() => { setMethod(m.id); setMode("pay"); setScanned(false); }}>
                    <em>{m.e}</em><b>{m.name}</b><small>“{m.say}”</small>
                  </button>
                ))}
              </div>
              <button className="s1-btn ghost" onClick={() => setMode("shop")}>Back to the products</button>
            </div>
          )}

          {mode === "pay" && method && (
            <div className="start-block p1-center">
              <h3>{METHODS.find((m) => m.id === method).e} Pay {cop(cartTotal)} with {METHODS.find((m) => m.id === method).name}</h3>
              <p className="start-tip">{METHODS.find((m) => m.id === method).step}</p>
              {method === "card" && <div className="p2-cardart"><span className="chip" /><b>CREAR BANK</b><small>•••• •••• •••• {String(userData?.Student_Key || "0000").slice(-4).padStart(4, "0")}</small><em>{String(userData?.Nombre_Completo || "").toUpperCase()}</em></div>}
              {method === "qr" && (
                <div className="p2-scan">
                  <div className={`p2-scan-frame ${scanned ? "done" : ""}`}><QrArt seed={shop.code} /><i /></div>
                  {!scanned && <button className="s1-btn primary" onClick={() => setTimeout(() => setScanned(true), 900)}>📷 Scan the QR code</button>}
                  {scanned && <div className="p1-banner good">✅ QR scanned: {shop.name} · {cop(cartTotal)}</div>}
                </div>
              )}
              {method === "wallet" && <div className="p2-phone"><small>CREAR Wallet</small><b>{cop(cartTotal)}</b><span>to {shop.name}</span></div>}
              {(method !== "qr" || scanned) && <PinPad value={pin} onChange={setPin} onSubmit={pay} busy={busy} label="Type your PIN to pay" />}
              <button className="s1-btn ghost" onClick={() => { setMode("method"); setPin(""); }}>Change payment method</button>
            </div>
          )}

          {mode === "receipt" && receipt && (
            <div className="p2-receipt">
              <b>🧾 RECEIPT</b>
              <small>{receipt.shop} · {receipt.seller}</small>
              {receipt.items.map((it) => <p key={it.id}><span>{it.qty} × {it.e} {it.n}</span><span>{cop(it.p * it.qty)}</span></p>)}
              <p className="tot"><span>TOTAL</span><span>{cop(receipt.total)}</span></p>
              <p><span>Paid with</span><span>{METHODS.find((m) => m.id === receipt.method)?.e} {METHODS.find((m) => m.id === receipt.method)?.name}</span></p>
              <p><span>Balance left</span><span>{cop(receipt.balance)}</span></p>
              <em>Thank you! ✨</em>
              <button className="s1-btn primary" onClick={backHome}>Back to the market</button>
            </div>
          )}

          {me.history?.length > 0 && mode === "home" && (
            <div className="start-block">
              <h3><Receipt size={18} /> My purchases</h3>
              {[...me.history].reverse().slice(0, 6).map((h, i) => <div key={i} className="p2-sale"><span>{METHODS.find((m) => m.id === h.method)?.e} {h.with}</span><small>{h.items}</small><b>−{cop(h.total)}</b></div>)}
            </div>
          )}
          <Board />
          <div className="start-foot p2-split-foot">
            <button type="button" className="p1-link" onClick={leave}>Change role</button>
            <button className="s1-btn primary big" disabled={!canFinish} onClick={() => finish(coins, { role: "buyer", purchases: buysN, spent: me.spent, balance: me.balance })}>{canFinish ? "Finish shopping" : "Make at least 2 purchases"} <span className="coin-tag"><Coins size={15} /> +{coins}</span></button>
          </div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   SEMANA 19 · NEVER SHARE YOUR PIN
   ===================================================================== */
const READ_W19 = [
  { h: "1. Your Money, Your Responsibility" },
  { p: "Today, many people use debit cards, mobile banking, and digital wallets to manage their money. These tools are useful, but we must use them carefully." },
  { p: "Keeping your money safe means protecting your bank account, your cards, and your personal information. A small mistake can put your money at risk." },
  { h: "2. Never Share Your PIN" },
  { p: "A PIN is a Personal Identification Number. It is a secret number that helps protect your bank card or account." },
  { p: "Imagine that your friend asks you for your bank card PIN. You trust your friend, but should you share it?" },
  { p: "No! Never share your PIN with friends or strangers. Keep it secret, even when someone says they want to help you." },
  { p: "Also, do not write your PIN on your card or share it in a message." },
  { h: "3. Protect Your Passwords and Personal Information" },
  { p: "Your passwords help protect your online accounts. Use strong passwords and do not share them with other people." },
  { p: "Your personal information is also important. Your full name, address, phone number, bank details, and verification codes can be used by other people to access your accounts or pretend to be you." },
  { p: "Be careful with messages that ask you to click a link or give your password. A message may look real, but it could be a scam." },
  { say: "For example, you receive a message saying, “Your bank account is blocked! Click here and enter your password.”" },
  { p: "Stop and think before you act. Do not click suspicious links. Contact your bank using its official website or phone number." },
  { h: "4. Three Rules to Remember" },
  { olist: ["Keep it secret: Never share your PIN, password, or verification codes.", "Think before you click: Do not open suspicious links or messages.", "Ask for help safely: If something looks wrong, contact your bank through an official channel."] },
  { box: "Remember: protecting your money starts with protecting your information. Your mission: can you identify what is safe and what is risky?" },
];
const GLOSS_W19 = {
  "PIN": "Clave de 4 números — Personal Identification Number.",
  "password": "Contraseña.",
  "scam": "Estafa — un engaño para robar dinero o información.",
  "verification code": "Código de verificación — el banco lo envía para confirmar que eres tú.",
  "personal information": "Información personal — nombre, dirección, teléfono, datos del banco.",
  "suspicious": "Sospechoso.",
  "official": "Oficial — el canal real del banco.",
};
const SCANNER = [
  { a: "PIN", b: "A secret number that protects your card." },
  { a: "Password", b: "A secret word or code for your online account." },
  { a: "Scam", b: "A trick to steal your money or information." },
  { a: "Personal information", b: "Your name, address, phone number and bank details." },
  { a: "Verification code", b: "A short code the bank sends to check it's really you." },
  { a: "Official channel", b: "The real website or phone number of your bank." },
];
const RISK_BUCKETS = [
  { id: "safe", label: "Safe", icon: "🟢", color: "#16b074" },
  { id: "risky", label: "Risky", icon: "🔴", color: "#ff6b57" },
];
const RISK_ITEMS = [
  { label: "Your friend asks for your bank PIN.", answer: "risky", why: "Never share your PIN — not even with friends." },
  { label: "You cover the keypad when you type your PIN.", answer: "safe" },
  { label: "A message says you won a prize. Click the link!", answer: "risky", why: "Prizes you didn't ask for are a classic scam." },
  { label: "You call your bank using the number on its official website.", answer: "safe" },
  { label: "You use the password “1234” for everything.", answer: "risky", why: "Easy passwords are easy to guess." },
  { label: "You write your PIN on your card.", answer: "risky" },
  { label: "You create a strong password with letters, numbers and symbols.", answer: "safe" },
  { label: "A “bank worker” calls and asks for your verification code.", answer: "risky", why: "Real banks never ask for your codes." },
  { label: "You log out after using the bank app on a shared computer.", answer: "safe" },
  { label: "You tell your parents when a message looks strange.", answer: "safe" },
];

const SCAM_MSGS = [
  { from: "BANK ALERT", icon: "🏦", text: "Your account is blocked! Click this link now and send your password and verification code to unlock your money.", link: "bit.ly/unl0ck-acc0unt", signs: [["Urgent message", true], ["Asks for your password", true], ["Asks for a verification code", true], ["Uses a link to unlock the account", true], ["It uses the word “money”", false]] },
  { from: "+57 300 000 0000", icon: "🎁", text: "🎉 Congratulations! You won a new phone! Pay $5,000 for shipping and send your card number TODAY.", signs: [["A prize you did not ask for", true], ["Asks for your card number", true], ["Asks you to pay first", true], ["Says you must act TODAY", true], ["It has an emoji", false]] },
  { from: "Unknown number", icon: "👤", text: "Hi, it's your cousin. This is my new number. I need money fast! Send $50,000 to this account and don't tell anyone.", signs: [["A new or unknown number", true], ["Asks for money fast", true], ["Asks you to keep a secret", true], ["Says “hi”", false]] },
  { from: "Your Bank · official app", icon: "✅", text: "Your monthly statement is ready. Open the official bank app to see it. We will never ask for your PIN or password.", signs: [["Asks for your PIN", false], ["Urgent message", false], ["Suspicious link", false], ["This message looks safe", true]] },
];
function StopScammer({ onSave, onExit }) {
  const TIME = 40;
  const [i, setI] = useState(0);
  const [sel, setSel] = useState({});
  const [scanned, setScanned] = useState(false);
  const [left, setLeft] = useState(TIME);
  const [score, setScore] = useState(0);
  const [max, setMax] = useState(0);
  const [st, finish] = useFinish(onSave);
  const over = i >= SCAM_MSGS.length;
  const m = SCAM_MSGS[i];
  const scan = () => {
    if (scanned || !m) return;
    setScanned(true);
    let s = 0;
    m.signs.forEach(([t, isSign]) => { if (sel[t] && isSign) s += 1; if (sel[t] && !isSign) s -= 1; });
    setScore((x) => x + Math.max(0, s));
    setMax((x) => x + m.signs.filter(([, b]) => b).length);
  };
  useEffect(() => {
    if (over || scanned) return;
    if (left <= 0) { scan(); return; }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [left, scanned, over]); // eslint-disable-line react-hooks/exhaustive-deps
  const next = () => { setI((x) => x + 1); setSel({}); setScanned(false); setLeft(TIME); };
  const coins = score * 2 + 6;
  if (st.done) return <Reward title="Scam stopper! 🕵️" subtitle={`You found ${score} of ${max} warning signs.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<ShieldAlert size={22} strokeWidth={2.1} />} title="Stop the Scammer!" subtitle="Read the message. Select ALL the warning signs before time runs out." onExit={onExit}>
      {!over ? (
        <>
          <div className="p2-hud"><span>Message <b>{i + 1}/{SCAM_MSGS.length}</b></span><span className={left <= 10 ? "p2-hot" : ""}>⏱️ <b>{left}s</b></span><span>Score <b>{score}</b></span></div>
          <div className="p2-phone-msg">
            <div className="p2-msg-top"><span>{m.icon}</span><b>{m.from}</b><small>New message</small></div>
            <div className="p2-msg-bubble">{m.text}{m.link && <u>{m.link}</u>}</div>
          </div>
          <div className="p2-signs">
            {m.signs.map(([t, isSign]) => {
              const on = !!sel[t];
              const mark = scanned ? (isSign ? (on ? "right" : "missed") : on ? "wrong" : "") : "";
              return <button key={t} type="button" disabled={scanned} className={`p2-sign ${on ? "on" : ""} ${mark}`} onClick={() => setSel({ ...sel, [t]: !on })}>{on ? "☑" : "☐"} {t}</button>;
            })}
          </div>
          {scanned && <div className={`p1-banner ${m.signs.every(([t, s]) => !!sel[t] === s) ? "good" : ""}`}>{m.icon === "✅" ? "This one is a real message: it sends you to the official app and does NOT ask for secrets." : "Green = warning signs you found. Orange = signs you missed."}</div>}
          <div className="start-foot">
            {!scanned ? <button className="s1-btn primary big" onClick={scan}>🔍 Scan message</button>
              : <button className="s1-btn primary big" onClick={next}>{i === SCAM_MSGS.length - 1 ? "See my score" : "Next message"} <ChevronRight size={18} /></button>}
          </div>
        </>
      ) : (
        <>
          <div className="p2-result"><span>🕵️ Scam Detector score</span><b>{score} / {max}</b><small>Every sign you find protects your money.</small></div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(coins, { score, max })}>Collect coins <span className="coin-tag"><Coins size={15} /> +{coins}</span></button></div>
        </>
      )}
    </ActShell>
  );
}

function SecurityRules({ existing, onSave, onExit }) {
  const [rules, setRules] = useState(existing?.rules || ["", "", ""]);
  const [meta, setMeta] = useState(existing?.meta || "");
  const [st, finish] = useFinish(onSave);
  const all = rules.join(" ").toLowerCase();
  const checks = [
    { ok: rules.every((r) => countWords(r) >= 4), t: "Three clear rules (4+ words each)" },
    { ok: rules.every((r) => /\b(never|don'?t|do not|protect|check|keep|think|ask|use|cover|call|log out|create)\b/i.test(r)), t: "Each rule uses never, don't or an action verb (protect, check, keep…)" },
    { ok: /\b(pin|password|code)s?\b/.test(all), t: "One rule about your PIN, password or codes" },
    { ok: /\b(message|link|click|sms|text|call|email)s?\b/.test(all), t: "One rule about messages or links" },
    { ok: countWords(meta) >= 10, t: "Answer the final question (10+ words)" },
  ];
  const ready = checks.every((c) => c.ok);
  if (st.done) return <Reward title="Security rules ready! 🔐" subtitle="You are a smart and responsible digital user." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<ShieldCheck size={22} strokeWidth={2.1} />} title="My Three Security Rules" subtitle="Write three rules in English to protect your money and information." onExit={onExit}>
      {rules.map((r, i) => (
        <div key={i} className="start-block p1-nego">
          <div className="p1-nego-row">
            <span className="p1-frame">Rule {i + 1}</span>
            <input className="start-input" value={r} onChange={(e) => setRules(rules.map((x, k) => (k === i ? e.target.value : x)))} placeholder={["Never share your PIN with anyone.", "Don't click on suspicious links.", "Check with your bank on the official app."][i]} />
          </div>
        </div>
      ))}
      <div className="start-block">
        <h3><Lightbulb size={18} /> What is one thing you will do differently to protect your money online?</h3>
        <WordField value={meta} onChange={setMeta} min={10} max={50} rows={2} placeholder="From now on, I will…" />
      </div>
      <ul className="p2-rules">{checks.map((c) => <li key={c.t} className={c.ok ? "ok" : "no"}>{c.ok ? "✅" : "⬜"} {c.t}</li>)}</ul>
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!ready} onClick={() => finish(25, { rules, meta })}>Save my rules <span className="coin-tag"><Coins size={15} /> +25</span></button>
      </div>
    </ActShell>
  );
}

function ScannerMatch({ onSave, onExit }) {
  const [st, finish] = useFinish(onSave);
  const [round, setRound] = useState(0);
  if (st.done) return <Reward title="Security Scanner complete! 🔐" subtitle="You know the safety words." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<ShieldCheck size={22} strokeWidth={2.1} />} title="Security Scanner 🔐" subtitle="Tap a word, then its definition." onExit={onExit}>
      <div className="start-block">
        <MatchPairs key={round} pairs={SCANNER} leftLabel="Security words" rightLabel="Definitions" onRestart={() => setRound((r) => r + 1)} onDone={(r) => finish(r.firstTry * 3 + 2, r)} />
      </div>
    </ActShell>
  );
}

/* =====================================================================
   SEMANAS 20–21 · MY FIRST FINANCIAL PLAN  (proyecto final)
   ===================================================================== */
const SITUATIONS = [
  { id: "bday", e: "🎂", t: "Your grandma gives you $30,000 for your birthday.", choices: [{ label: "Save it all", fx: { extra: 30000 } }, { label: "Save half, spend half", fx: { extra: 15000 } }] },
  { id: "broken", e: "🎧", t: "Your headphones break. A repair costs $15,000.", choices: [{ label: "Pay the repair with my savings", fx: { extra: -15000 } }, { label: "Find a cheaper repair ($8,000)", fx: { extra: -8000 } }] },
  { id: "prices", e: "📈", t: "Prices go up! Your snacks cost $2,000 more every week.", choices: [{ label: "Pay more for the same snacks", fx: { weekly: -2000 } }, { label: "Bring snacks from home", fx: { weekly: 0 } }] },
  { id: "job", e: "🚗", t: "Your uncle pays you $5,000 every week to help wash his car.", choices: [{ label: "Yes! I'll help every week", fx: { weekly: 5000 } }, { label: "No, thank you", fx: { weekly: 0 } }] },
  { id: "sale", e: "🏷️", t: "Your goal is on sale: 20% OFF next month!", choices: [{ label: "Wait for the sale", fx: { mult: 0.8 } }, { label: "Don't wait", fx: { mult: 1 } }] },
  { id: "party", e: "🎉", t: "Your best friend's birthday party: you need a gift.", choices: [{ label: "Buy a gift ($10,000)", fx: { extra: -10000 } }, { label: "Make a handmade gift ($2,000)", fx: { extra: -2000 } }] },
  { id: "scam", e: "📩", t: "A message says: “Send $20,000 and we will double your money!”", choices: [{ label: "Send the money", fx: { extra: -20000 }, lesson: "Oh no! It was a scam — the money is gone." }, { label: "Delete it and tell an adult", fx: { extra: 0 }, safe: true, lesson: "Smart! That was a scam." }] },
  { id: "trip", e: "🚌", t: "The school trip costs $25,000.", choices: [{ label: "Pay it all with my savings", fx: { extra: -25000 } }, { label: "Ask my family to share the cost", fx: { extra: -12000 } }] },
  { id: "cap", e: "🧢", t: "You see a cool cap for $18,000. You want it NOW!", choices: [{ label: "Buy it now", fx: { extra: -18000 } }, { label: "Wait 24 hours and think", fx: { extra: 0 } }] },
  { id: "cousin", e: "📚", t: "Your cousin pays you $10,000 for help with homework.", choices: [{ label: "Save it", fx: { extra: 10000 } }, { label: "Spend it on candy", fx: { extra: 0 } }] },
  { id: "phone", e: "📱", t: "Your phone credit costs $3,000 more every week.", choices: [{ label: "Keep the same plan", fx: { weekly: -3000 } }, { label: "Use Wi-Fi at home and school", fx: { weekly: -1000 } }] },
  { id: "found", e: "🪙", t: "You sell your old toys at a garage sale for $12,000.", choices: [{ label: "Put it in my savings", fx: { extra: 12000 } }, { label: "Buy new toys", fx: { extra: 0 } }] },
];

function SituationCards({ budget, existing, onSave, onExit }) {
  const deck = useMemo(() => sample(SITUATIONS, 4), []);
  const [picks, setPicks] = useState([]);
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  if (!budget) {
    return (
      <ActShell icon={<Sparkles size={22} />} title="Situation Cards" onExit={onExit}>
        <div className="p1-banner bad">First build your budget in <b>Final Budget Studio</b>. Then come back here.</div>
      </ActShell>
    );
  }
  const per = budget.period === "month" ? "month" : "week";
  const base = { weekly: budget.totals.save, goal: budget.goal.cost };
  const fx = picks.reduce((a, p) => ({ extra: a.extra + (p.fx.extra || 0), weekly: a.weekly + (p.fx.weekly || 0), mult: a.mult * (p.fx.mult || 1) }), { extra: 0, weekly: 0, mult: 1 });
  const weeklyNow = base.weekly + fx.weekly;
  const goalNow = Math.round(base.goal * fx.mult);
  const timeBefore = ceilDiv(base.goal, base.weekly);
  const need = Math.max(0, goalNow - fx.extra);
  const timeAfter = need === 0 ? 0 : ceilDiv(need, weeklyNow);
  const show = (t) => (Number.isFinite(t) ? `${t} ${per}${t === 1 ? "" : "s"}` : "never 😟");
  const card = deck[picks.length];
  const over = picks.length >= deck.length;
  const safeBonus = picks.some((p) => p.safe) ? 5 : 0;
  const coins = 30 + safeBonus;
  if (st.done) return <Reward title="You survived real life! 🃏" subtitle={`Your goal now takes ${show(timeAfter)}.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Sparkles size={22} strokeWidth={2.1} />} title="Situation Cards" subtitle="Real life changes your budget. Draw 4 cards and decide!" onExit={onExit}>
      <div className="p2-compare">
        <div><small>Before</small><b>{show(timeBefore)}</b><span>save {cop(base.weekly)}/{per}</span></div>
        <span className="p2-arrow">➜</span>
        <div className={Number.isFinite(timeAfter) && timeAfter <= timeBefore ? "good" : "bad"}><small>Now</small><b>{show(timeAfter)}</b><span>save {cop(weeklyNow)}/{per} · extra {cop(fx.extra)}</span></div>
      </div>
      <p className="start-tip p1-center">{budget.goal.emoji} Goal: <b>{budget.goal.name}</b> · {cop(goalNow)}{fx.mult !== 1 && <> (was {cop(base.goal)})</>}</p>
      {!over ? (
        <div className="p2-sit-card" key={card.id}>
          <small>Card {picks.length + 1} of {deck.length}</small>
          <em>{card.e}</em>
          <p>{card.t}</p>
          <div className="p2-sit-choices">
            {card.choices.map((c) => <button key={c.label} type="button" onClick={() => setPicks([...picks, { id: card.id, e: card.e, t: card.t, ...c }])}>{c.label}</button>)}
          </div>
        </div>
      ) : (
        <div className="start-block">
          <h3><span className="step-n">✦</span> Which card changed your budget the most?</h3>
          <Starters items={["The card that changed my budget the most was… because…", "I decided to…", "Now I need… to reach my goal."]} onPick={appendStarter(setText)} />
          <WordField value={text} onChange={setText} min={10} max={50} rows={2} placeholder="The card that changed my budget the most was …" />
        </div>
      )}
      {picks.length > 0 && (
        <div className="p2-sit-history">
          {picks.map((p, k) => {
            const v = p.fx.extra ? `${p.fx.extra > 0 ? "+" : ""}${cop(p.fx.extra)} once` : p.fx.weekly ? `${p.fx.weekly > 0 ? "+" : ""}${cop(p.fx.weekly)} every ${per}` : p.fx.mult && p.fx.mult !== 1 ? "goal −20%" : "no change";
            return <div key={k}><span>{p.e} {p.label}</span><b className={(p.fx.extra || p.fx.weekly || 0) < 0 ? "out" : "in"}>{v}</b>{p.lesson && <small>{p.lesson}</small>}</div>;
          })}
        </div>
      )}
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!over || countWords(text) < 10} onClick={() => finish(coins, { cards: picks.map((p) => ({ id: p.id, choice: p.label })), timeBefore, timeAfter: Number.isFinite(timeAfter) ? timeAfter : null, weeklyNow, goalNow, extra: fx.extra, text })}>Save my decisions <span className="coin-tag"><Coins size={15} /> +{coins}</span></button>
      </div>
    </ActShell>
  );
}

const PLAN_THEMES = [
  { id: "mint", a: "#e3f7ee", b: "#16b074" }, { id: "sun", a: "#fff4d6", b: "#f5b23e" },
  { id: "sky", a: "#e5efff", b: "#5b8def" }, { id: "berry", a: "#f3e8ff", b: "#9b5de5" },
];
const SHOP_TIPS = ["Compare final prices, not only discounts.", "Wait 24 hours before buying a want.", "Ask: do I need it or is it a whim?", "Check the price in two stores."];

function MyPlan({ budget, events, rules, studentName, existing, onSave, onExit }) {
  const [theme, setTheme] = useState(existing?.theme || "mint");
  const [tip, setTip] = useState(existing?.tip || "");
  const [text, setText] = useState(existing?.text || "");
  const [st, finish] = useFinish(onSave);
  if (!budget) {
    return (
      <ActShell icon={<Mail size={22} />} title="My Financial Plan" onExit={onExit}>
        <div className="p1-banner bad">First build your budget in <b>Final Budget Studio</b>. Then come back here.</div>
      </ActShell>
    );
  }
  const th = PLAN_THEMES.find((t) => t.id === theme);
  const per = budget.period === "month" ? "month" : "week";
  const time = events?.timeAfter ?? budget.time;
  const w = countWords(text);
  const ready = tip && w >= 40 && w <= 90;
  const kinds = KINDS.map((k) => ({ ...k, value: total(budget.expenses.filter((e) => e.kind === k.id)) }));
  if (st.done) return <Reward title="My First Financial Plan is ready! 🏆" subtitle="Now present it to your class." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Mail size={22} strokeWidth={2.1} />} title="My First Financial Plan" subtitle="All your learning in one beautiful plan. You will present it!" onExit={onExit}>
      <div className="start-block">
        <h3><span className="step-n">1</span> Design</h3>
        <div className="p1-starters">{PLAN_THEMES.map((t) => <button key={t.id} type="button" className={`p1-swatch ${theme === t.id ? "on" : ""}`} style={{ background: `linear-gradient(135deg, ${t.a}, ${t.b})` }} onClick={() => setTheme(t.id)} aria-label={t.id} />)}</div>
        <h3 className="p2-mt"><span className="step-n">2</span> My smart shopper tip</h3>
        <div className="p1-starters">{SHOP_TIPS.map((s) => <button key={s} type="button" className={`p1-chip ${tip === s ? "on" : ""}`} onClick={() => setTip(s)}>{s}</button>)}</div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">3</span> Answer the big question (40–90 words)</h3>
        <p className="start-tip"><b>How can saving, budgeting and responsible spending help me reach my goals?</b> Remember Sofi: “Your financial journey starts today!”</p>
        <Starters items={["Saving helps me…", "My budget shows that…", `I will reach my ${budget.goal.name.toLowerCase()} in ${Number.isFinite(time) ? time : "…"} ${per}s.`, "When something unexpected happens, I…", "To protect my money, I…"]} onPick={appendStarter(setText)} />
        <WordField value={text} onChange={setText} min={40} max={90} rows={6} placeholder="Saving helps me …" />
      </div>

      <div className="p2-plan" style={{ "--pa": th.a, "--pb": th.b }}>
        <div className="p2-plan-head">
          <div><small>MY FIRST FINANCIAL PLAN</small><h3>{studentName}</h3></div>
          <span className="p2-plan-goal">{budget.goal.emoji}<b>{budget.goal.name}</b><small>{cop(budget.goal.cost)}</small></span>
        </div>
        <div className="p2-stats">
          <div className="in"><small>Income / {per}</small><b>{cop(budget.totals.income)}</b></div>
          <div className="out"><small>Expenses / {per}</small><b>{cop(budget.totals.expenses)}</b></div>
          <div className="save"><small>Savings / {per}</small><b>{cop(budget.totals.save)}</b></div>
        </div>
        <div className="p2-plan-grid">
          <div>
            <h4>💵 Incomes</h4>
            {budget.incomes.map((i, k) => <p key={k}><span>{i.name}</span><b>{cop(i.amount)}</b></p>)}
            <h4>🧾 Expenses</h4>
            {budget.expenses.map((e, k) => <p key={k}><span><i style={{ background: KINDS.find((x) => x.id === e.kind)?.color }} />{e.name}</span><b>{cop(e.amount)}</b></p>)}
          </div>
          <div>
            <h4>📊 My money</h4>
            <StackBar parts={[...kinds.map((k) => ({ label: k.label + "s", value: k.value, color: k.color })), { label: "Savings", value: Math.max(0, budget.totals.save), color: "#16b074" }]} max={budget.totals.income || 1} />
            <div className="p2-meter"><span>I save <b>{budget.totals.rate}%</b> of my income</span><div><i style={{ width: `${Math.min(100, Math.max(0, budget.totals.rate))}%` }} /></div></div>
            <h4>🎯 Time to my goal</h4>
            <p className="p2-plan-big">{Number.isFinite(time) ? `${time} ${per}${time === 1 ? "" : "s"}` : "—"}</p>
            {events && <small className="p2-muted">After my situation cards (before: {Number.isFinite(events.timeBefore) ? events.timeBefore : "—"} {per}s)</small>}
            {rules?.rules?.[0] && <><h4>🔐 My security rule</h4><p className="p2-quote">“{rules.rules[0]}”</p></>}
            {tip && <><h4>🛒 Smart shopper tip</h4><p className="p2-quote">“{tip}”</p></>}
          </div>
        </div>
        {text && <div className="p2-plan-text">💡 {text}</div>}
      </div>

      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!ready} onClick={() => finish(45, { theme, tip, text, words: w })}>Save my plan <span className="coin-tag"><Coins size={15} /> +45</span></button>
      </div>
    </ActShell>
  );
}

const BOSS_P2 = [
  { q: "What is saving?", options: ["Keeping money for the future.", "Spending all your money.", "Borrowing money."], correct: 0, feedback: "Saving = keeping money for later." },
  { q: "What is a budget?", options: ["A plan for your money.", "A type of bank.", "A list of toys."], correct: 0, feedback: "A budget is a plan." },
  { q: "What is income?", options: ["Money you receive.", "Money you spend.", "Money you lose."], correct: 0, feedback: "Income = money in." },
  { q: "Which one is an expense?", options: ["Paying for the bus.", "Your pocket money.", "A birthday gift of money."], correct: 0, feedback: "Paying = money out." },
  { q: "Sofi saves $40,000 a week. How long does she need to save $200,000?", options: ["5 weeks", "4 weeks", "8 weeks"], correct: 0, feedback: "$200,000 ÷ $40,000 = 5." },
  { q: "A $50,000 backpack has 20% OFF. What is the final price?", options: ["$40,000", "$30,000", "$48,000"], correct: 0, feedback: "20% of $50,000 = $10,000." },
  { q: "Store A: $60,000 with 20% OFF. Store B: $45,000. Which is cheaper?", options: ["Store B", "Store A", "They are the same"], correct: 0, feedback: "$45,000 < $48,000." },
  { q: "“Delayed gratification” means…", options: ["waiting for something better later.", "buying everything now.", "never spending."], correct: 0, feedback: "Wait now, win later." },
  { q: "£10 at the class rate (1 GBP = $5,000) is…", options: ["$50,000", "$15,000", "$5,000"], correct: 0, feedback: "10 × $5,000." },
  { q: "Which payment uses a black and white square?", options: ["QR code", "Card", "Cash"], correct: 0, feedback: "You scan a QR code." },
  { q: "Your friend asks for your PIN. What do you do?", options: ["Never share it.", "Share it.", "Write it on a paper for them."], correct: 0, feedback: "Your PIN is secret." },
  { q: "A message says “Click now to unlock your account!” It is probably…", options: ["a scam.", "a gift.", "a normal message."], correct: 0, feedback: "Urgent + link = warning signs." },
  { q: "Income $30,000, expenses $22,000. How much can you save?", options: ["$8,000", "$52,000", "$12,000"], correct: 0, feedback: "$30,000 − $22,000." },
  { q: "When prices go up, the same money buys…", options: ["fewer things.", "more things.", "always the same."], correct: 0, feedback: "Higher prices → fewer things." },
  { q: "The best question before buying is…", options: ["“Do I need this or is it a whim?”", "“Do my friends have it?”", "“Is it shiny?”"], correct: 0, feedback: "Need or whim?" },
  { q: "A smart shopper compares…", options: ["final prices.", "only the discount %.", "the colors of the store."], correct: 0, feedback: "Final prices!" },
];

const ST_CHECKS = ["I presented my Financial Plan to the class.", "I used money words (income, expense, budget, saving…).", "I answered a question from a classmate or my teacher."];
const ST_CRITERIA = ["I spoke clearly in English.", "I explained my budget and my goal.", "I listened to my classmates."];
function ShowTell({ existing, onSave, onExit }) {
  const [checks, setChecks] = useState(existing?.checks || [false, false, false]);
  const [stars, setStars] = useState(existing?.stars || [0, 0, 0]);
  const [improve, setImprove] = useState(existing?.improve || "");
  const [st, finish] = useFinish(onSave);
  const ready = checks[0] && stars.every((s) => s > 0) && countWords(improve) >= 6;
  if (st.done) return <Reward title="Period 2 complete! 🏆" subtitle="Your financial journey has started!" coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Award size={22} strokeWidth={2.1} />} title="Presentation & self-check" subtitle="After your presentation, check your work honestly." onExit={onExit}>
      <div className="start-block">
        <h3><span className="step-n">1</span> What did I do?</h3>
        {ST_CHECKS.map((c, i) => (
          <label key={i} className="perm-check p1-check">
            <input type="checkbox" checked={checks[i]} onChange={(e) => setChecks(checks.map((x, k) => (k === i ? e.target.checked : x)))} />
            <span>{c}</span>
          </label>
        ))}
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> How did I do?</h3>
        {ST_CRITERIA.map((c, i) => (
          <div key={i} className="p1-stars-row">
            <span>{c}</span>
            <div className="p1-stars">{[1, 2, 3].map((n) => (
              <button key={n} type="button" className={stars[i] >= n ? "on" : ""} onClick={() => setStars(stars.map((s, k) => (k === i ? n : s)))} aria-label={`${n} stars`}>
                <Star size={22} strokeWidth={2} />
              </button>
            ))}</div>
          </div>
        ))}
      </div>
      <div className="start-block">
        <h3><span className="step-n">3</span> Next time I want to improve…</h3>
        <WordField value={improve} onChange={setImprove} min={6} max={40} rows={2} placeholder="Next time I want to…" />
      </div>
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!ready} onClick={() => finish(20, { checks, stars, improve })}>Finish Period 2 <span className="coin-tag"><Coins size={15} /> +20</span></button>
      </div>
    </ActShell>
  );
}

/* =====================================================================
   ESTRUCTURA DEL PERIODO (10 semanas de clase · 11 a 21)
   bucket = dónde suman los puntos: comportamiento | quizzes | aprendi
   ===================================================================== */
const P2_WEEKS = [
  { n: 1, g: "11", title: "Why do we save?", blurb: "Sofi saves for a bike — project launch.", e: "🚲", skills: ["Reading", "Writing"], acts: [
    { key: "w11_s1", title: "Screen 1 · What is saving?", desc: "Read Parts 1–2 and match the saving words.", icon: <BookOpen size={22} />, coins: 24, bucket: "quizzes", topics: ["Saving", "Goal", "Budget"] },
    { key: "w11_s2", title: "Screen 2 · Sofi's story", desc: "Read Part 3 and put the story in order.", icon: <BookOpen size={22} />, coins: 24, bucket: "quizzes" },
    { key: "w11_sort", title: "Saving or Spending?", desc: "Sort 8 situations.", icon: <PiggyBank size={22} />, coins: 20, bucket: "quizzes" },
    { key: "w11_s3", title: "Screen 3 · Build a mini budget", desc: "Plan $40,000: spend some, save some.", icon: <Wallet size={22} />, coins: 20, bucket: "aprendi" },
    { key: "w11_s4", title: "Screen 4 · My saving challenge", desc: "Choose a goal, do the math and write why.", icon: <Target size={22} />, coins: 30, bucket: "aprendi" },
  ] },
  { n: 2, g: "12", title: "My saving goal", blurb: "Goals, saving and budgets — video + math.", e: "🎯", skills: ["Listening", "Speaking"], acts: [
    { key: "w12_video", title: "Video: Goals, saving & budget", desc: "Watch, then answer 10 questions (70% to pass).", icon: <Video size={22} />, coins: 50, bucket: "quizzes" },
    { key: "w12_flip", title: "Flip & Match", desc: "Find the pairs of money words.", icon: <Puzzle size={22} />, coins: 24, bucket: "quizzes" },
    { key: "w12_calc", title: "Weekly Savings Calculator", desc: "Incomes − expenses = savings.", icon: <Calculator size={22} />, coins: 25, bucket: "aprendi" },
    { key: "w12_goal", title: "Complete my goal", desc: "Fill the sentences and calculate the weeks.", icon: <Target size={22} />, coins: 20, bucket: "aprendi" },
    { key: "w12_math", title: "Goal Math Challenge", desc: "8 problems: can they reach their goal?", icon: <Calculator size={22} />, coins: 30, bucket: "quizzes" },
  ] },
  { n: 3, g: "13", title: "Income & expenses", blurb: "Money in, money out — and a treasure!", e: "💵", skills: ["Reading", "Writing"], acts: [
    { key: "w13_flow", title: "Money In or Money Out?", desc: "Short explanation + a fast streak game.", icon: <TrendingUp size={22} />, coins: 30, bucket: "quizzes" },
    { key: "w13_left", title: "How much is left?", desc: "6 balance problems.", icon: <Calculator size={22} />, coins: 24, bucket: "quizzes" },
    { key: "w13_incomes", title: "Where does money come from?", desc: "Write your incomes and your family's.", icon: <PenLine size={22} />, coins: 25, bucket: "aprendi" },
    { key: "w13_treasure", title: "The Lost Money Diary", desc: "4 islands, 4 badges, 1 treasure.", icon: <MapIcon size={22} />, coins: 60, bucket: "quizzes", topics: ["Find", "Count", "Fix", "Unlock"] },
    { key: "w13_diary", title: "My Money Diary", desc: "Write 5+ movements for one week.", icon: <BookOpen size={22} />, coins: 25, bucket: "aprendi" },
  ] },
  { n: 4, g: "14", title: "My first budget", blurb: "Build a real, beautiful budget.", e: "📋", skills: ["Listening", "Speaking"], acts: [
    { key: "w14_video", title: "Watch the video again", desc: "Remember: goal, saving, budget, income.", icon: <Video size={22} />, coins: 10, bucket: "comportamiento" },
    { key: "w14_budget", title: "Budget Studio", desc: "2+ incomes, 5+ expenses and a goal.", icon: <Calculator size={22} />, coins: 45, bucket: "aprendi", topics: ["Needs", "Wants", "Share", "Save"] },
    { key: "w14_explain", title: "Explain my budget", desc: "Language frames to tell a friend.", icon: <Mic size={22} />, coins: 20, bucket: "aprendi" },
  ] },
  { n: 5, g: "15", title: "Smart spending", blurb: "Two stores, one snack — the Smart Shopper League.", e: "🛒", skills: ["Reading", "Writing"], acts: [
    { key: "w15_read", title: "Reading: Two Stores, One Snack", desc: "Compare prices, discounts and price increases.", icon: <BookOpen size={22} />, coins: 20, bucket: "comportamiento" },
    { key: "w15_league", title: "The Smart Shopping League", desc: "4 missions: detective, discounts, fake sales, prices.", icon: <Tag size={22} />, coins: 60, bucket: "quizzes" },
    { key: "w15_hunter", title: "Real-Life Price Hunter", desc: "Find a product in 3 real stores.", icon: <Search size={22} />, coins: 30, bucket: "aprendi" },
    { key: "w15_battle", title: "The $30,000 Shopping Battle", desc: "Best purchase for the class movie afternoon.", icon: <ShoppingCart size={22} />, coins: 40, bucket: "quizzes" },
    { key: "w15_report", title: "My Smart Shopper Report", desc: "“I chose ___ because…” (5–7 sentences).", icon: <Receipt size={22} />, coins: 25, bucket: "aprendi" },
  ] },
  { n: 6, g: "16", title: "Wait or buy now?", blurb: "Delayed gratification: a small no, a big yes.", e: "⏳", skills: ["Reading", "Speaking"], acts: [
    { key: "w16_learn", title: "Buy now or wait?", desc: "Short explanation + 4 questions.", icon: <BookOpen size={22} />, coins: 22, bucket: "quizzes" },
    { key: "w16_jar", title: "Wait or Buy? (Savings Jar)", desc: "8 weeks of temptations. Can you reach the goal?", icon: <PiggyBank size={22} />, coins: 30, bucket: "quizzes" },
    { key: "w16_calc", title: "How long must I wait?", desc: "6 waiting problems.", icon: <Hourglass size={22} />, coins: 24, bucket: "quizzes" },
    { key: "w16_decide", title: "Now or later?", desc: "Decide: buy now or wait.", icon: <Scale size={22} />, coins: 20, bucket: "quizzes" },
    { key: "w16_speak", title: "Speaking: I can wait because…", desc: "3 sentences to say to a partner.", icon: <Mic size={22} />, coins: 20, bucket: "aprendi" },
  ] },
  { n: 7, g: "17", title: "Family & world prices", blurb: "A family budget and the cost of living abroad.", e: "🌍", skills: ["Reading", "Writing"], acts: [
    { key: "w17_family", title: "The Gómez Family Budget", desc: "Read a real family budget and do the math.", icon: <Users size={22} />, coins: 24, bucket: "quizzes" },
    { key: "w17_convert", title: "Currency Converter", desc: "Convert prices from other countries to COP.", icon: <Globe size={22} />, coins: 24, bucket: "quizzes" },
    { key: "w17_compare", title: "Cost of Living Explorer", desc: "Pizza in Bogotá vs London vs Tokyo…", icon: <Globe size={22} />, coins: 35, bucket: "aprendi" },
    { key: "w17_research", title: "Family Fun Around the World", desc: "Research real prices in 3 countries.", icon: <Plane size={22} />, coins: 30, bucket: "aprendi" },
  ] },
  { n: 8, g: "18", title: "Digital payments", blurb: "Card, QR or wallet? Open the CREAR Shop!", e: "💳", skills: ["Listening", "Speaking"], acts: [
    { key: "w18_learn", title: "How do we pay today?", desc: "Short explanation + which method is it?", icon: <CreditCard size={22} />, coins: 18, bucket: "quizzes" },
    { key: "w18_shop", title: "The CREAR Shop", desc: "Sellers and buyers · pay with your secret PIN.", icon: <Store size={22} />, coins: 40, bucket: "aprendi", topics: ["Shop code", "Card · QR · Wallet", "PIN"] },
    { key: "w18_reflect", title: "Writing: I pay with ___ because…", desc: "Explain your favorite payment method.", icon: <PenLine size={22} />, coins: 20, bucket: "aprendi" },
  ] },
  { n: 9, g: "19", title: "Protect my money", blurb: "Never share your PIN — spot the scams.", e: "🔐", skills: ["Reading", "Writing"], acts: [
    { key: "w19_read", title: "Reading: Never Share Your PIN", desc: "Protect your money and personal information.", icon: <BookOpen size={22} />, coins: 20, bucket: "comportamiento" },
    { key: "w19_scanner", title: "Security Scanner", desc: "Match the security words.", icon: <Puzzle size={22} />, coins: 20, bucket: "quizzes" },
    { key: "w19_risky", title: "Safe or Risky?", desc: "10 situations.", icon: <ShieldAlert size={22} />, coins: 24, bucket: "quizzes" },
    { key: "w19_scam", title: "Stop the Scammer!", desc: "Find the warning signs before time runs out.", icon: <ShieldAlert size={22} />, coins: 30, bucket: "quizzes" },
    { key: "w19_rules", title: "My Three Security Rules", desc: "Write 3 rules + one reflection.", icon: <ShieldCheck size={22} />, coins: 25, bucket: "aprendi" },
  ] },
  { n: 10, g: "20–21", title: "My Financial Plan", blurb: "Final project: budget, real life and presentation.", e: "🏆", skills: ["Writing", "Speaking"], acts: [
    { key: "w20_studio", title: "Final Budget Studio", desc: "Your best budget (it starts from your Week 14 budget).", icon: <Calculator size={22} />, coins: 40, bucket: "aprendi" },
    { key: "w20_events", title: "Situation Cards", desc: "Real life happens! Draw 4 cards and decide.", icon: <Sparkles size={22} />, coins: 35, bucket: "quizzes" },
    { key: "w20_plan", title: "My First Financial Plan", desc: "Your plan as a beautiful card to present.", icon: <Mail size={22} />, coins: 45, bucket: "aprendi" },
    { key: "w20_boss", title: "Boss Battle P2", desc: "12 questions from the whole period.", icon: <Swords size={22} />, coins: 58, bucket: "quizzes" },
    { key: "w20_present", title: "Presentation & self-check", desc: "Present your plan and check your work.", icon: <Award size={22} />, coins: 20, bucket: "comportamiento" },
  ] },
];
const ALL_ACTS = P2_WEEKS.flatMap((w) => w.acts);
const TOTAL_ACTS = ALL_ACTS.length;

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Periodo2 = ({ userData, API_URL, existingRow, onBack }) => {
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
      .catch((e) => { console.error("Error guardando Periodo 2:", e); dispatch({ type: "rollback_progreso", payload: { Semana: PERIOD_KEY, prev } }); });
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
    const readDone = (coins) => () => { complete(act, def.bucket, coins, { [act]: { read: true, at: nowISO() } }); exit(); };
    const name = userData?.Nombre_Completo || "Student";
    const finalBudget = resp.w20_studio && resp.w20_studio.goal ? resp.w20_studio : null;
    let view = null;

    switch (act) {
      case "w11_s1": view = <SavingWords onSave={save} onExit={exit} />; break;
      case "w11_s2": view = <SofiStory onSave={save} onExit={exit} />; break;
      case "w11_sort": view = <SortActivity icon={<PiggyBank size={22} />} title="Saving or Spending?" subtitle="Is the person saving money or spending money?" buckets={SAVE_SPEND} items={SAVE_SPEND_ITEMS} doneTitle="Saving expert! 🐖" onSave={save} onExit={exit} />; break;
      case "w11_s3": view = <MiniBudget existing={resp.w11_s3} onSave={save} onExit={exit} />; break;
      case "w11_s4": view = <SavingChallenge existing={resp.w11_s4} onSave={save} onExit={exit} />; break;

      case "w12_video": view = <VideoQuiz src={VIDEO_BUDGET} title="Video check" questions={Q_VIDEO_W12} pickCount={10} onSave={save} onExit={exit} />; break;
      case "w12_flip": view = <VocabFlip pairs={FLIP_W12} title="Flip & Match" subtitle="Flip two cards. Find each word and its meaning." back="🎯" onSave={save} onExit={exit} />; break;
      case "w12_calc": view = <SavingsCalculator existing={resp.w12_calc} onSave={save} onExit={exit} />; break;
      case "w12_goal": view = <GoalSentence calc={resp.w12_calc} existing={resp.w12_goal} onSave={save} onExit={exit} />; break;
      case "w12_math": view = <NumberRounds icon={<Calculator size={22} />} title="Goal Math Challenge" subtitle="Can they reach their goals? Think, calculate, answer." rounds={GOAL_MATH} onSave={save} onExit={exit} />; break;

      case "w13_flow": view = (
        <ReadThen tag="MINI LESSON · A2" title="Income & Expenses" subtitle="Money in, money out" minutes={2} sections={READ_W13} glossary={GLOSS_W13} onExit={exit} finishLabel="I understand — let's play!">
          <MoneyFlow onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "w13_left": view = <NumberRounds icon={<Calculator size={22} />} title="How much is left?" subtitle="Income − expenses = balance." rounds={MONEY_LEFT} onSave={save} onExit={exit} />; break;
      case "w13_incomes": view = <IncomeWriter existing={resp.w13_incomes} onSave={save} onExit={exit} />; break;
      case "w13_treasure": view = <QuestMap icon={<MapIcon size={22} />} title="The Lost Money Diary" subtitle="Leo lost his money diary on a treasure map! Visit 4 islands to get it back." rooms={TREASURE_ROOMS} studentName={name} coins={60} existing={resp.w13_treasure} diploma={{ e: "🏴‍☠️", small: "The Lost Money Diary", title: "Income & Expense Explorer" }} onSave={save} onExit={exit} />; break;
      case "w13_diary": view = <MoneyDiary incomes={resp.w13_incomes} studentName={name.split(" ")[0]} existing={resp.w13_diary} onSave={save} onExit={exit} />; break;

      case "w14_video": view = <MediaCheck src={VIDEO_BUDGET} icon={<Video size={22} />} title="Watch the video again" subtitle="Listen for: goal, saving, budget, income." tip="🎧 This time, write down 3 money words you hear." coins={10} doneLabel="I watched it again!" onSave={save} onExit={exit} />; break;
      case "w14_budget": view = <BudgetStudio title="Budget Studio" seed={resp.w14_budget} studentName={name.split(" ")[0]} onSave={save} onExit={exit} />; break;
      case "w14_explain": view = <BudgetExplain budget={resp.w14_budget?.goal ? resp.w14_budget : null} studentName={name.split(" ")[0]} existing={resp.w14_explain} onSave={save} onExit={exit} />; break;

      case "w15_read": view = <Reader tag="READING · A2 · SMART SPENDING" title="Two Stores, One Snack" subtitle="Compare before you choose!" minutes={7} img={IMG_SHOPS} sections={READ_W15} glossary={GLOSS_W15} done={!!checklist.w15_read} coins={20} onFinish={readDone(20)} onExit={exit} />; break;
      case "w15_league": view = <QuestMap icon={<Tag size={22} />} title="The Smart Shopping League" subtitle="Complete 4 missions and become an expert shopper." rooms={LEAGUE_ROOMS} studentName={name} coins={60} existing={resp.w15_league} diploma={{ e: "🛒", small: "The Smart Shopping League", title: "Smart Shopper Expert" }} onSave={save} onExit={exit} />; break;
      case "w15_hunter": view = <PriceHunter existing={resp.w15_hunter} onSave={save} onExit={exit} />; break;
      case "w15_battle": view = <ShoppingBattle onSave={save} onExit={exit} />; break;
      case "w15_report": view = <SmartReport existing={resp.w15_report} onSave={save} onExit={exit} />; break;

      case "w16_learn": view = (
        <ReadThen tag="MINI LESSON · A2" title="Buy Now or Wait?" subtitle="The power of patience" minutes={3} sections={READ_W16} glossary={GLOSS_W16} onExit={exit} finishLabel="I read it — check my understanding">
          <QuizRunner title="Quick check" emoji="⏳" questions={Q_W16} pickCount={4} passThreshold={70} xpPerCorrect={4} xpComplete={6} onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "w16_jar": view = <WaitGame onSave={save} onExit={exit} />; break;
      case "w16_calc": view = <NumberRounds icon={<Hourglass size={22} />} title="How long must I wait?" subtitle="Patience + math." rounds={WAIT_MATH} onSave={save} onExit={exit} />; break;
      case "w16_decide": view = <SortActivity icon={<Scale size={22} />} title="Now or later?" subtitle="Do you need it now, or can you wait?" buckets={NOW_LATER} items={NOW_LATER_ITEMS} doneTitle="Wise decisions! ⏳" onSave={save} onExit={exit} />; break;
      case "w16_speak": view = <FrameWriter title="Speaking: I can wait because…" subtitle="Complete the sentences. Then say them to a partner." frames={[
        { frame: "I can wait because", ph: "I want to buy something bigger." },
        { frame: "I will save my money for", ph: "a new bicycle." },
        { frame: "Waiting helps me", ph: "reach my goal faster." },
      ]} existing={resp.w16_speak} onSave={save} onExit={exit} />; break;

      case "w17_family": view = <NumberRounds icon={<Users size={22} />} title="The Gómez Family Budget" subtitle="Read the family budget and answer." intro={<FamilyCard />} rounds={FAMILY_ROUNDS} onSave={save} onExit={exit} />; break;
      case "w17_convert": view = <NumberRounds icon={<Globe size={22} />} title="Currency Converter" subtitle="From dollars, pounds, euros… to Colombian pesos." intro={CONVERT_INTRO} rounds={CONVERT_ROUNDS} onSave={save} onExit={exit} />; break;
      case "w17_compare": view = <CostCompare onSave={save} onExit={exit} />; break;
      case "w17_research": view = <FamilyTrip existing={resp.w17_research} onSave={save} onExit={exit} />; break;

      case "w18_learn": view = (
        <ReadThen tag="MINI LESSON · A2" title="How Do We Pay Today?" subtitle="Card, QR code or digital wallet" minutes={2} sections={READ_W18} onExit={exit} finishLabel="I understand — let's sort!">
          <SortActivity icon={<CreditCard size={22} />} title="Which payment is it?" subtitle="Card, QR or digital wallet?" buckets={PAY_BUCKETS} items={PAY_ITEMS} per={3} bonus={0} doneTitle="Payment pro! 💳" onSave={save} onExit={exit} />
        </ReadThen>
      ); break;
      case "w18_shop": view = <ShopGame userData={userData} API_URL={API_URL} onSave={save} onExit={exit} />; break;
      case "w18_reflect": view = <WritingTask icon={<PenLine size={22} />} title="I pay with ___ because…" subtitle="Which payment method do you prefer? Why?" prompt="I pay with ___ because ___."
        tip="Use what you did in the CREAR Shop. 20 to 60 words."
        starters={["I pay with … because…", "It is fast / safe because…", "I don't like … because…", "I always protect my PIN by…"]}
        example="I pay with a digital wallet because it is fast and I don't need cash. In the CREAR Shop, I paid with a QR code too. It was easy, but I had to type my PIN. I always cover the keypad because my PIN is secret."
        min={20} max={60} coins={20} existing={resp.w18_reflect} onSave={save} onExit={exit} />; break;

      case "w19_read": view = <Reader tag="READING · A2 · DIGITAL SAFETY" title="Never Share Your PIN" subtitle="Protect your money and personal information" minutes={4} img={IMG_PIN} sections={READ_W19} glossary={GLOSS_W19} done={!!checklist.w19_read} coins={20} onFinish={readDone(20)} onExit={exit} />; break;
      case "w19_scanner": view = <ScannerMatch onSave={save} onExit={exit} />; break;
      case "w19_risky": view = <SortActivity icon={<ShieldAlert size={22} />} title="Safe or Risky?" subtitle="Read each situation. Is it safe or risky?" buckets={RISK_BUCKETS} items={RISK_ITEMS} doneTitle="Safety expert! 🚦" onSave={save} onExit={exit} />; break;
      case "w19_scam": view = <StopScammer onSave={save} onExit={exit} />; break;
      case "w19_rules": view = <SecurityRules existing={resp.w19_rules} onSave={save} onExit={exit} />; break;

      case "w20_studio": view = <BudgetStudio title="Final Budget Studio" subtitle="Your best budget. Start from your Week 14 budget and improve it." seed={resp.w20_studio || resp.w14_budget} studentName={name.split(" ")[0]} coins={40} onSave={save} onExit={exit} />; break;
      case "w20_events": view = <SituationCards budget={finalBudget} existing={resp.w20_events} onSave={save} onExit={exit} />; break;
      case "w20_plan": view = <MyPlan budget={finalBudget} events={resp.w20_events} rules={resp.w19_rules} studentName={name} existing={resp.w20_plan} onSave={save} onExit={exit} />; break;
      case "w20_boss": view = <QuizRunner title="Boss Battle · Period 2" emoji="⚔️" questions={BOSS_P2} pickCount={12} passThreshold={70} xpPerCorrect={4} xpComplete={10} onSave={save} onExit={exit} />; break;
      case "w20_present": view = <ShowTell existing={resp.w20_present} onSave={save} onExit={exit} />; break;
      default: view = null;
    }
    return <div className="s1 p1 p2">{view}</div>;
  }

  /* ---------- SEMANA ABIERTA ---------- */
  if (week) {
    const w = P2_WEEKS.find((x) => x.n === week);
    const wDone = w.acts.filter((a) => checklist[a.key]).length;
    const next = P2_WEEKS.find((x) => x.n === w.n + 1);
    return (
      <div className="s1 p1 p2">
        <button className="s1-back" onClick={() => setWeek(null)}><ArrowLeft size={18} strokeWidth={2.4} /> Back to Period 2</button>
        <div className="s1-hero p1-week-hero">
          <span className="s1-tag">{w.e} PERIOD 2 · CLASS {w.g}</span>
          <h1>{w.title}</h1>
          <p>{w.blurb}</p>
          <div className="s1-progress"><div className="bar"><i style={{ width: `${(wDone / w.acts.length) * 100}%` }} /></div><span className="pill">{wDone}/{w.acts.length}</span></div>
        </div>
        <div className="s1-quest">
          {w.acts.map((a) => (
            <div key={a.key} className={`act-card ${checklist[a.key] ? "done" : ""}`}>
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
    <div className="s1 p1 p2">
      <button className="s1-back" onClick={onBack}><ArrowLeft size={18} strokeWidth={2.4} /> Back to overview</button>

      <div className="s1-hero p1-hero">
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> ADMIN PREVIEW · GRADE {GRADE} · PERIOD 2</span>
        <h1>My First Financial Plan</h1>
        <p>How can saving, budgeting, and responsible spending help us achieve our personal goals?</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pct}%` }} /></div><span className="pill">{pct}%</span></div>
        <div className="p1-hero-chips">
          <span><Coins size={14} /> {coinsTotal} coins</span>
          <span><Check size={14} /> {doneCount}/{TOTAL_ACTS} activities</span>
          <span>🎯 SDG 1 · SDG 8 · SDG 12</span>
        </div>
      </div>

      <div className="p1-passport">
        <div className="p1-passport-head"><b>🐖 Saver's Passport</b><span>Finish a class to get its stamp</span></div>
        <div className="p1-stamps">
          {P2_WEEKS.map((w) => (
            <button key={w.n} type="button" className={`p1-stamp ${weekDone(w) ? "done" : ""}`} onClick={() => setWeek(w.n)} title={w.title}>
              <em>{w.e}</em><small>{w.g}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="p1-weeks">
        {P2_WEEKS.map((w) => {
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