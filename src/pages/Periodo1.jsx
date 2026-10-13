import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft, BookOpen, Video, Check, X, Coins, Trophy, Sparkles, Clock, GraduationCap,
  ChevronRight, ChevronLeft, Lightbulb, Play, Compass, PenLine, Headphones, History,
  Landmark, Gift, KeyRound, Mail, Star, Users, Lock, Store, Globe, Scale, RefreshCw,
  Award, Puzzle, Link2, Mic,
} from "lucide-react";
import "../Styles/semana1.css";   // botones, quiz, reward, monedas, radar… (misma gamificación)
import "../Styles/periodo1.css";  // estilos nuevos del Periodo 1
import useGlobalReducer from "../hooks/useGlobalReducer";
// ⚠️ Guarda tu mp3 en src/assets con este nombre exacto (o cambia la ruta):
import colombianMoneyAudio from "../assets/img/listening.mp3";

/* =====================================================================
   PERIODO 1 · FROM BARTER TO MONEY  (Grado 6 · A2)
   9 semanas · todo se guarda en UNA fila de Progreso_Semanas:
   Semana = "P1"  ·  Checklist_JSON = { w1_diag: true, … }
   Respuestas_JSON = { w1_diag: {...}, w1_vocab: {...}, … }
   ===================================================================== */

const PERIOD_KEY = "P1";
const GRADE = "6";
const DIAG_FORM = "G6_START"; // Grado 6 · inicio. En el periodo 4 se repite como "G6_END".

const VIDEO_MONEY = "https://res.cloudinary.com/y9r84vgz/video/upload/v1791905975/videoplayback_4.mp4";
const VIDEO_WORLD = "https://res.cloudinary.com/y9r84vgz/video/upload/v1791908442/videoplayback_5.mp4";

const IMG_RIVERTOWN = [
  "https://i.pinimg.com/736x/d8/78/65/d878658d8b65897c5cf6bd30d228dcce.jpg",
  "https://i.pinimg.com/736x/a7/9e/be/a79ebe8e6c84f408b8f1eeab72cc6b1f.jpg",
  "https://i.pinimg.com/736x/c7/c8/a6/c7c8a64de3d3c15057330dcbaa27b17c.jpg",
  "https://i.pinimg.com/736x/39/6d/e7/396de7476c682178c4238346ba2cda18.jpg",
  "https://i.pinimg.com/736x/aa/1f/4e/aa1f4e881a24c5b6bcbf245f493fec50.jpg",
  "https://i.pinimg.com/736x/37/20/14/3720148c0196a1237722f364b54c90e7.jpg",
];
const IMG_COLOMBIA = [
  "https://i.pinimg.com/736x/c0/7c/91/c07c91a517bc31337db2977f316d336d.jpg",
  "https://i.pinimg.com/1200x/ad/f4/e1/adf4e1f23a817b52d4f5fc877cac5740.jpg",
];

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
const cop = (n) => "$" + Number(n || 0).toLocaleString("es-CO");
const nowISO = () => new Date().toISOString();
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const appendStarter = (setter) => (s) => setter((t) => (t.trim() ? t.trim() + " " : "") + s + " ");

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

/* ---------- QUIZ (mismo motor de Semana 1) ---------- */
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

/* ---------- READER (lectura con glosario) ---------- */
function Reader({ tag, title, subtitle, minutes, sections, glossary, done, coins, onFinish, onExit }) {
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
        <div className="reader-meta"><Clock size={15} strokeWidth={2.3} /> ~{minutes} min read</div>
      </div>
      <article className="s1-reader">
        <span className="reader-tag">{tag}</span>
        <h1>{title}</h1>
        <p className="reader-sub">{subtitle}</p>
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
            return <p key={i}>{render(b.p)}</p>;
          })}
        </div>
        <div className="reader-finish">
          {done ? <span className="reader-done"><Check size={18} strokeWidth={3} /> You've read this</span>
            : <button className="s1-btn primary big" onClick={onFinish}><Check size={18} strokeWidth={2.6} /> I've finished reading <span className="coin-tag"><Coins size={15} /> +{coins}</span></button>}
        </div>
      </article>
    </div>
  );
}

/* ---------- STORYBOOK (cuento con imágenes, página por página) ---------- */
function StoryBook({ title, pages, done, coins, onFinish, onExit }) {
  const [i, setI] = useState(0);
  const p = pages[i];
  const last = i === pages.length - 1;
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [i]);
  return (
    <div>
      <div className="reader-bar">
        <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
        <div className="reader-meta"><BookOpen size={15} strokeWidth={2.3} /> Page {i + 1} / {pages.length}</div>
      </div>
      <article className="p1-story">
        <div className="p1-story-img"><img src={p.img} alt="" loading="lazy" /></div>
        <div className="p1-story-text">
          {i === 0 && <span className="reader-tag">STORY · A2</span>}
          {i === 0 && <h1>{title}</h1>}
          <h2>{p.title}</h2>
          {p.text.map((t, k) => (t.startsWith("“") ? <p key={k} className="p1-say">{t}</p> : <p key={k}>{t}</p>))}
          {p.magic && <div className="p1-magic"><Sparkles size={18} strokeWidth={2.3} /> <span>{p.magic}</span></div>}
        </div>
      </article>
      <div className="p1-story-nav">
        <button className="s1-btn ghost" onClick={() => setI(i - 1)} disabled={i === 0}><ChevronLeft size={18} strokeWidth={2.4} /> Back</button>
        <div className="p1-dots">{pages.map((_, k) => <span key={k} className={k === i ? "on" : k < i ? "seen" : ""} />)}</div>
        {!last ? <button className="s1-btn primary" onClick={() => setI(i + 1)}>Next page <ChevronRight size={18} strokeWidth={2.4} /></button>
          : done ? <span className="reader-done"><Check size={18} strokeWidth={3} /> Read</span>
            : <button className="s1-btn primary" onClick={onFinish}>The end! <span className="coin-tag"><Coins size={14} /> +{coins}</span></button>}
      </div>
    </div>
  );
}

/* ---------- MATCH PAIRS (tocar palabra + definición) ---------- */
function MatchPairs({ pairs, leftLabel = "Words", rightLabel = "Definitions", onDone, onRestart }) {
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
        <span>Pairs: <b>{count}/{pairs.length}</b> · Attempts with errors: <b>{errors}</b></span>
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

/* ---------- SORT BUCKETS (clasificar en 2 o 3 cajas) ---------- */
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
        <button className="s1-btn primary" disabled={!all}
          onClick={() => onDone({ correct, total: list.length, choices: list.map((it, i) => ({ item: it.label, picked: ch[i], ok: ch[i] === it.answer })) })}>
          {doneLabel} <ChevronRight size={18} strokeWidth={2.4} />
        </button>
      </div>
    </>
  );
}

/* ---------- WRITING TASK ---------- */
function WritingTask({ icon, title, subtitle, prompt, tip, starters, example, min, max, coins, existing, onSave, onExit }) {
  const [text, setText] = useState(existing?.text || "");
  const [showEx, setShowEx] = useState(false);
  const [st, finish] = useFinish(onSave);
  const w = countWords(text);
  const ok = w >= min && w <= max;
  if (st.done) return <Reward title="Great writing! ✍️" subtitle={`You wrote ${w} words in English.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={icon || <PenLine size={22} strokeWidth={2.1} />} title={title} subtitle={subtitle} onExit={onExit}>
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

/* ---------- MEDIA (video o audio que hay que ver/escuchar) ---------- */
function MediaCheck({ kind = "video", src, images, icon, title, subtitle, tip, coins, doneLabel, onSave, onExit }) {
  const [heard, setHeard] = useState(false);
  const [st, finish] = useFinish(onSave);
  const track = (e) => { const m = e.currentTarget; if (m.duration && m.currentTime / m.duration > 0.9) setHeard(true); };
  if (st.done) return <Reward title={kind === "audio" ? "Great listening! 🎧" : "Video complete! 🎬"} subtitle="Your ears are getting stronger in English." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={icon} title={title} subtitle={subtitle} onExit={onExit}>
      {images && <div className="p1-img-row">{images.map((src2) => <img key={src2} src={src2} alt="" loading="lazy" />)}</div>}
      {kind === "audio" ? (
        <div className="p1-audio"><Headphones size={22} strokeWidth={2.2} /><audio src={src} controls preload="metadata" onEnded={() => setHeard(true)} onTimeUpdate={track} /></div>
      ) : (
        <div className="video-frame"><video src={src} controls playsInline preload="metadata" controlsList="nodownload" onEnded={() => setHeard(true)} onTimeUpdate={track} /></div>
      )}
      {tip && <p className="video-hint">{tip}</p>}
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!heard} onClick={() => finish(coins, { completed: true })}>
          {heard ? doneLabel : `Finish the ${kind} first`} <span className="coin-tag"><Coins size={15} /> +{coins}</span>
        </button>
      </div>
    </ActShell>
  );
}

/* =====================================================================
   SEMANA 1 · WHAT IS MONEY?
   ===================================================================== */

/* ---- Self-check grado 6 (balance inicial · se repite al final del año) ---- */
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
const DIM_TIPS = {
  ideas: "This period you will discover what money is and where it comes from.",
  habits: "You will practice one big question: Do I need it or do I want it?",
  saving: "You will see how money helps you save for the future.",
  trading: "In the CREAR Market you will practice trading and talking about value.",
};
function profile6(avg) {
  if (avg <= 33) return { label: "Money Explorer 🧭", desc: "You are starting your money adventure. That's perfect — this period is your map!" };
  if (avg <= 66) return { label: "Money Builder 🧱", desc: "You already know some important ideas. Now you will build stronger habits." };
  return { label: "Money Master ⭐", desc: "You know a lot already! This period you will explain your ideas in English and help others." };
}

function Radar({ data }) {
  const size = 260, c = size / 2, r = size / 2 - 44, n = data.length;
  const ang = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, rad) => [c + rad * Math.cos(ang(i)), c + rad * Math.sin(ang(i))];
  const ring = (f) => data.map((_, i) => pt(i, r * f).join(",")).join(" ");
  const shape = data.map((d, i) => pt(i, r * (Math.max(d.value, 4) / 100)).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="radar">
      {[0.25, 0.5, 0.75, 1].map((f, k) => <polygon key={k} points={ring(f)} className="radar-grid" />)}
      {data.map((_, i) => { const [x, y] = pt(i, r); return <line key={i} x1={c} y1={c} x2={x} y2={y} className="radar-axis" />; })}
      <polygon points={shape} className="radar-shape" />
      {data.map((d, i) => { const [x, y] = pt(i, r * (Math.max(d.value, 4) / 100)); return <circle key={i} cx={x} cy={y} r="3.5" className="radar-dot" />; })}
      {data.map((d, i) => { const [x, y] = pt(i, r + 22); return <text key={i} x={x} y={y} className="radar-label" textAnchor="middle" dominantBaseline="middle">{d.label}</text>; })}
    </svg>
  );
}

function Diagnostic({ existing, onSave, onExit }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(existing?.answers || {});
  const [done, setDone] = useState(!!existing?.scores);
  const [saving, setSaving] = useState(false);
  const q = DIAG6[current];
  const answered = answers[current] !== undefined;
  const isLast = current === DIAG6.length - 1;

  const scores = useMemo(() => {
    const acc = {}, cnt = {};
    DIAG6.forEach((d, i) => { acc[d.dim] = (acc[d.dim] || 0) + (answers[i] ?? 0); cnt[d.dim] = (cnt[d.dim] || 0) + 3; });
    const out = {};
    Object.keys(DIMS6).forEach((k) => { out[k] = cnt[k] ? Math.round((acc[k] / cnt[k]) * 100) : 0; });
    return out;
  }, [answers]);
  const avg = Math.round(Object.values(scores).reduce((a, v) => a + v, 0) / Object.keys(DIMS6).length);
  const prof = profile6(avg);

  const finish = () => {
    setSaving(true); setDone(true);
    Promise.resolve(onSave({ form: DIAG_FORM, answers, scores, average: avg, profile: prof.label, xp: 10 })).finally(() => setSaving(false));
  };

  if (done) {
    const radarData = Object.keys(DIMS6).map((k) => ({ key: k, label: DIMS6[k], value: scores[k] }));
    const best = [...radarData].sort((a, b) => b.value - a.value)[0];
    const focus = [...radarData].sort((a, b) => a.value - b.value)[0];
    return (
      <div className="s1-quiz diag-result">
        <div className="diag-badge"><Compass size={30} strokeWidth={2.1} /></div>
        <h2>Your money starting point</h2>
        <p className="diag-sub">This is not a test. It's a photo of you today. At the end of the year you will take it again and see how much you grew!</p>
        <Radar data={radarData} />
        <div className="diag-bars">
          {radarData.map((d) => (
            <div key={d.label} className="diag-bar">
              <span className="diag-bar-l">{d.label}</span>
              <div className="diag-bar-track"><i style={{ width: `${d.value}%` }} /></div>
              <span className="diag-bar-v">{d.value}%</span>
            </div>
          ))}
        </div>
        <div className="diag-risk">
          <span className="diag-risk-tag">{prof.label}</span>
          <p>{prof.desc}</p>
        </div>
        <div className="p1-diag-cards">
          <div className="p1-diag-card good"><b>💪 Your superpower: {best.label}</b><span>You scored {best.value}% here. Keep using it!</span></div>
          <div className="p1-diag-card next"><b>🎯 Your next step: {focus.label}</b><span>{DIM_TIPS[focus.key]}</span></div>
        </div>
        <p className="reward-note"><Coins size={14} /> +10 coins for your self-check</p>
        <button className="s1-btn primary" onClick={onExit}>Continue <ChevronRight size={18} strokeWidth={2.4} /></button>
        {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing your snapshot…</span>}
      </div>
    );
  }

  return (
    <div className="s1-quiz">
      <div className="quiz-top"><h2>🧭 My money self-check</h2><span className="quiz-count">{current + 1} / {DIAG6.length}</span></div>
      <div className="quiz-track"><i style={{ width: `${(current / DIAG6.length) * 100}%` }} /></div>
      <span className="diag-dim">{DIMS6[q.dim]}</span>
      <p className="quiz-q">{q.q}</p>
      <p className="start-tip">There are no wrong answers. Choose what is true for you.</p>
      <div className="quiz-options">
        {q.options.map((t, i) => (
          <button key={i} className={`quiz-opt ${answers[current] === i ? "chosen" : ""}`} onClick={() => setAnswers({ ...answers, [current]: i })}>
            <span className="opt-key">{String.fromCharCode(65 + i)}</span>
            <span className="opt-text">{t}</span>
          </button>
        ))}
      </div>
      <div className="quiz-nav">
        <button className="s1-btn ghost" onClick={() => (current > 0 ? setCurrent(current - 1) : onExit())}>{current > 0 ? "Back" : "Exit"}</button>
        <button className="s1-btn primary" onClick={() => (isLast ? finish() : setCurrent(current + 1))} disabled={!answered}>
          {isLast ? "See my snapshot" : "Next"} <ChevronRight size={18} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

/* ---- Money Vocabulary Memory ---- */
const VOCAB = [
  { a: "Bartering", b: "Exchanging goods without using money." },
  { a: "Money", b: "Something people accept as payment." },
  { a: "Goods", b: "Things people buy, sell, or exchange." },
  { a: "Value", b: "How useful or important something is." },
  { a: "Currency", b: "The money used in a country." },
  { a: "Exchange", b: "To give something and receive something else." },
  { a: "Price", b: "The amount of money you pay for something." },
  { a: "Save", b: "To keep money for the future." },
  { a: "Demand", b: "How much people want a product." },
  { a: "Scarcity", b: "When something is limited or difficult to find." },
];

function VocabMemory({ existing, onSave, onExit }) {
  const [stage, setStage] = useState("match");
  const [round, setRound] = useState(0);
  const [result, setResult] = useState(null);
  const [picked, setPicked] = useState(existing?.words || []);
  const [sentence, setSentence] = useState(existing?.sentence || "");
  const [showKey, setShowKey] = useState(false);
  const [st, finish] = useFinish(onSave);

  const togglePick = (w) => setPicked((p) => (p.includes(w) ? p.filter((x) => x !== w) : p.length < 2 ? [...p, w] : p));
  const usesBoth = picked.length === 2 && picked.every((w) => sentence.toLowerCase().includes(w.toLowerCase()));
  const ok = usesBoth && countWords(sentence) >= 6 && countWords(sentence) <= 30;

  if (st.done) return <Reward title="Vocabulary unlocked! 🧠" subtitle={`You matched ${result?.firstTry ?? 10} pairs on the first try.`} coins={st.coins} saving={st.saving} onExit={onExit} />;

  return (
    <ActShell icon={<Puzzle size={22} strokeWidth={2.1} />} title="Money Vocabulary Memory" subtitle="Match each word with its meaning — in English, no translations!" onExit={onExit}>
      {stage === "match" ? (
        <div className="start-block">
          <p className="start-tip">Tap one <b>word</b> and then its <b>definition</b>. When you finish, read the pairs aloud.</p>
          <MatchPairs key={round} pairs={VOCAB} onDone={(r) => { setResult(r); setStage("say"); }} onRestart={() => setRound((x) => x + 1)} />
        </div>
      ) : (
        <>
          <div className="start-block">
            <h3><Mic size={18} strokeWidth={2.3} /> Now say it!</h3>
            <p className="start-tip">You matched all 10 pairs with <b>{result.errors}</b> mistakes. Choose <b>two words</b>, say a sentence aloud with both, then write it.</p>
            <div className="p1-starters">
              {VOCAB.map((v) => (
                <button key={v.a} type="button" className={`p1-chip ${picked.includes(v.a) ? "on" : ""}`} onClick={() => togglePick(v.a)}>{v.a}</button>
              ))}
            </div>
            <WordField value={sentence} onChange={setSentence} min={6} max={30} rows={3}
              placeholder={picked.length === 2 ? `Example: People used ${picked[0].toLowerCase()} and ${picked[1].toLowerCase()}…` : "First choose two words above."} />
            {picked.length === 2 && countWords(sentence) >= 3 && !usesBoth && <p className="goal-warn">Use both words: {picked.join(" + ")}.</p>}
            <button type="button" className="p1-link" onClick={() => setShowKey(!showKey)}><KeyRound size={14} /> {showKey ? "Hide" : "Show"} answer key</button>
            {showKey && <ul className="p1-key">{VOCAB.map((v) => <li key={v.a}><b>{v.a}</b> — {v.b}</li>)}</ul>}
          </div>
          <div className="start-foot">
            <button className="s1-btn primary big" disabled={!ok} onClick={() => finish(result.firstTry * 2 + 5, { errors: result.errors, firstTry: result.firstTry, words: picked, sentence })}>
              Finish <span className="coin-tag"><Coins size={15} /> +{result.firstTry * 2 + 5}</span>
            </button>
          </div>
        </>
      )}
    </ActShell>
  );
}

/* ---- Pre-reading: Predict the Story ---- */
const PREDICT_BUCKETS = [
  { id: "things", label: "Things we exchange", icon: "📦", color: "#0b7a50" },
  { id: "money", label: "Money words", icon: "🪙", color: "#c98a14" },
  { id: "actions", label: "Actions in a market", icon: "🤝", color: "#e0563f" },
];
const PREDICT_ITEMS = [
  { label: "pencil", answer: "things" },
  { label: "coins", answer: "money" },
  { label: "bartering", answer: "actions", why: "Bartering is an action: you trade things without money." },
  { label: "bread", answer: "things" },
  { label: "dollars", answer: "money", why: "The dollar is the money of the United States." },
  { label: "exchange", answer: "actions" },
  { label: "paper clip", answer: "things" },
  { label: "pounds", answer: "money", why: "The pound is the money of the United Kingdom." },
  { label: "save", answer: "actions" },
  { label: "negotiate", answer: "actions", why: "To negotiate is to talk to make a good deal." },
  { label: "price", answer: "money", why: "A price is the amount of money you pay." },
  { label: "goods", answer: "things", why: "Goods are things people buy, sell or exchange." },
];
const PREDICT_Q = [
  { q: "What problems can people have when they barter?", starters: ["I think people have problems because…", "When people barter, it is difficult to…"] },
  { q: "Why do people use money?", starters: ["People need money because…", "Money helps people to…"] },
  { q: "What do you think will happen to the red paper clip?", starters: ["I predict that the paper clip will…", "I think the story is about…"] },
];

function PredictStory({ existing, onSave, onExit }) {
  const [stage, setStage] = useState("sort");
  const [sortRes, setSortRes] = useState(null);
  const [preds, setPreds] = useState(existing?.predictions || ["", "", ""]);
  const [st, finish] = useFinish(onSave);
  const setPred = (i) => (v) => setPreds((p) => p.map((x, k) => (k === i ? (typeof v === "function" ? v(x) : v) : x)));
  const ready = preds.every((p) => countWords(p) >= 5);
  if (st.done) return <Reward title="Great predictions! 🔮" subtitle="Now read the story and check your ideas." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Lightbulb size={22} strokeWidth={2.1} />} title="Predict the Story" subtitle="Before reading: sort the words, then guess what will happen." onExit={onExit}>
      {stage === "sort" ? (
        <>
          <div className="start-explain"><h3><Lightbulb size={18} strokeWidth={2.3} /> Sort the words!</h3><p>Put each word in the correct group. Don't look at the story yet.</p></div>
          <SortBuckets buckets={PREDICT_BUCKETS} items={PREDICT_ITEMS} doneLabel="Next: predict" onDone={(r) => { setSortRes(r); setStage("predict"); window.scrollTo({ top: 0 }); }} />
        </>
      ) : (
        <>
          <div className="p1-banner">You sorted <b>{sortRes.correct}/{sortRes.total}</b> words correctly. Now, predict! It's OK if your guess is different from the story.</div>
          {PREDICT_Q.map((pq, i) => (
            <div key={i} className="start-block">
              <h3><span className="step-n">{i + 1}</span> {pq.q}</h3>
              <Starters items={pq.starters} onPick={appendStarter(setPred(i))} />
              <WordField value={preds[i]} onChange={setPred(i)} min={5} max={40} rows={2} placeholder="Write your idea in English…" />
            </div>
          ))}
          <div className="start-foot">
            <button className="s1-btn primary big" disabled={!ready} onClick={() => finish(sortRes.correct + 10, { sort: sortRes, predictions: preds })}>
              Save my predictions <span className="coin-tag"><Coins size={15} /> +{sortRes.correct + 10}</span>
            </button>
          </div>
        </>
      )}
    </ActShell>
  );
}

/* ---- Reading 1: The Red Paper Clip (texto base del proyecto) ---- */
const GLOSSARY_W1 = {
  "bartering": "Trueque — cambiar cosas sin usar dinero.",
  "double coincidence of wants": "Doble coincidencia de deseos — las dos personas quieren lo que tiene la otra, al mismo tiempo.",
  "goods": "Bienes — cosas que se compran, venden o intercambian.",
  "medium of exchange": "Medio de intercambio — el dinero sirve para comprar y vender.",
  "unit of account": "Unidad de cuenta — el dinero sirve para comparar precios.",
  "store of value": "Depósito de valor — el dinero se puede guardar para el futuro.",
  "currency exchange": "Cambio de moneda — cambiar un tipo de dinero por otro.",
  "negotiate": "Negociar — hablar para llegar a un buen acuerdo.",
  "scarcity": "Escasez — cuando algo es difícil de encontrar.",
};
const READING_W1 = [
  { h: "1. A World Without Money" },
  { p: "Imagine a world without money." },
  { p: "There are no coins, no banknotes, and no credit cards. You cannot go to a shop and pay for a sandwich with money because money does not exist!" },
  { p: "How can you get the things you need?" },
  { p: "Long ago, people had to find other ways to buy and sell things. One of these ways was called bartering." },
  { p: "Bartering is when people exchange goods or services for other goods or services. For example, a farmer can give a basket of apples to a fisherman. In exchange, the fisherman can give the farmer some fish." },
  { p: "Both people get something they want, and nobody uses money." },
  { p: "Sounds easy, right? But there is a problem." },
  { p: "Imagine that you are a farmer. You have ten apples, and you want a pair of shoes. You go to the shoemaker and say:" },
  { say: "“Hello! I have some delicious apples. Can you give me a pair of shoes for them?”" },
  { p: "The shoemaker looks at the apples and answers:" },
  { say: "“Sorry! I don't need apples. I need a new shirt.”" },
  { p: "Now you have a problem. You need shoes, but the shoemaker does not want your apples. You must find another person who has a shirt and wants apples. Then, perhaps, you can exchange the shirt for shoes." },
  { p: "This takes time!" },
  { p: "People call this problem the double coincidence of wants. It means that two people must want what the other person has at the same time." },
  { p: "Bartering can work well, but it is not always easy. People need a better way to exchange things." },
  { h: "2. The Village Market" },
  { p: "One morning, a young girl named Emma visits a market in an old village. Her family grows vegetables, and Emma has a basket of carrots to exchange." },
  { p: "At the market, she sees a boy named Daniel. He has fresh bread." },
  { say: "“Good morning, Daniel!” says Emma. “I have carrots. Would you like to exchange them for some bread?”" },
  { say: "Daniel smiles. “Yes! I need carrots for my family. How many carrots can you give me for two pieces of bread?”" },
  { p: "Emma thinks for a moment." },
  { say: "“Five carrots?”" },
  { say: "“That's too many,” Daniel says. “What about three carrots?”" },
  { say: "“Okay! Three carrots for two pieces of bread.”" },
  { p: "They exchange their goods and are both happy." },
  { p: "A few minutes later, Emma sees a woman with a beautiful pencil. Emma wants the pencil because she likes drawing." },
  { say: "“Can I exchange some carrots for your pencil?” Emma asks." },
  { p: "The woman shakes her head." },
  { say: "“No, thank you. I already have many carrots. I need a small bag of rice.”" },
  { p: "Emma looks around the market. Nobody has rice." },
  { p: "She feels frustrated. She has something useful, but she cannot get what she wants." },
  { p: "On her way home, Emma thinks about the problem." },
  { say: "“Why is it so difficult to exchange things?” she asks her father." },
  { say: "Her father answers, “Because people do not always want what you have. We need something that many people accept in exchange for goods.”" },
  { say: "“But what could that be?” Emma asks." },
  { say: "Her father smiles. “That is a very important question. People have been trying to solve this problem for thousands of years.”" },
  { h: "3. From Bartering to Money" },
  { p: "Over time, people found different ways to make exchanges easier." },
  { p: "In some places, people used useful goods such as salt, grain, tea, or animals. Other communities used shells or other objects that people accepted as valuable." },
  { p: "These things helped people exchange goods without always needing to find someone who wanted exactly what they had." },
  { p: "Later, many societies began to use metal objects as money. Metal was useful because it could be divided into smaller pieces and carried from one place to another. People made coins with different values." },
  { p: "Coins made buying and selling easier. A farmer could sell vegetables for coins and then use those coins to buy shoes, bread, or tools." },
  { p: "The farmer did not need to find a shoemaker who wanted vegetables. The farmer only needed to find a shoemaker who accepted the coins." },
  { p: "Many years later, people began to use paper money. Today, we also use bank cards, mobile phones, and digital payments." },
  { p: "Money has changed over time, but its main purpose is still similar: it helps people exchange goods and services." },
  { p: "Money is more than coins and banknotes. It is something people accept as payment because they trust that other people will also accept it." },
  { h: "4. Why Is Money Useful?" },
  { p: "Money has three important functions." },
  { p: "First, money is a medium of exchange. This means we can use it to buy and sell things. We can pay for food, clothes, books, transport, and many other things." },
  { p: "Second, money is a unit of account. It helps us compare prices. Imagine that a sandwich costs 8 coins and a juice costs 4 coins. We can understand that the sandwich costs twice as much as the juice." },
  { p: "Third, money is a store of value. This means we can save money and use it in the future. For example, if you receive 20 coins today and spend only 5, you can keep the other 15 coins for another day." },
  { p: "However, money does not have unlimited value. Prices can change over time. If the price of bread increases, the same amount of money may buy less bread than before." },
  { p: "That is why saving money and making good financial decisions are important." },
  { p: "Money also helps people plan. If Emma wants to buy a book that costs 30 coins, she can save 10 coins every week. After three weeks, she will have enough money to buy the book." },
  { p: "A clear goal can help people manage their money better." },
  { h: "5. The Great Red Paper Clip Challenge" },
  { p: "Now, imagine that your teacher gives your team one simple object: a red paper clip." },
  { p: "You look at it and think, “What can we do with this? It is small, simple, and not very expensive.”" },
  { p: "But your teacher has an exciting story to tell." },
  { p: "In 2005, a Canadian blogger named Kyle MacDonald started a project with one red paper clip. He wanted to exchange it for something better. He made a series of trades, exchanging one object for another, usually more valuable, object. After many exchanges, he received a house." },
  { p: "His story became famous because it showed how negotiation, creativity, and finding the right trading partner can lead to surprising results." },
  { p: "Now, your team has a similar mission." },
  { p: "Your goal is to trade your starting object for something more valuable. You must talk to other teams, make offers, and decide which exchanges are good for you." },
  { p: "But there is one important rule: you must explain why your final object is valuable." },
  { p: "Is it useful? Is it rare? Do many people want it? Is it difficult to find? Does it have a special purpose?" },
  { p: "Remember, value is not always the same as price. Something can be useful to one person but not very useful to another. The value of an object can depend on what people need and how much they want it." },
  { h: "6. Three Rounds, Three Stages of Money" },
  { p: "Your classroom will become a market. There will be three rounds, and each round will teach you something about money." },
  { sub: "Round 1: Bartering" },
  { p: "You can only exchange one object for another object. You cannot use coins or banknotes." },
  { p: "Your team has a pencil, for example, and wants a notebook. You must find another team that wants your pencil and is willing to give you a notebook." },
  { say: "“I have a pencil. Do you want to exchange it for your notebook?”" },
  { say: "“Sorry, I don't need a pencil. I need a ruler.”" },
  { p: "You must keep negotiating until you find a good exchange. This round can be difficult because you need to find someone who wants what you have." },
  { sub: "Round 2: Money Arrives" },
  { p: "Your teacher introduces a new system: CREAR coins! Now, you can sell your object for CREAR coins and use those coins to buy something else." },
  { p: "For example, you sell your pencil for 5 CREAR coins. Later, you see a notebook that costs 5 CREAR coins. You can buy the notebook without finding someone who wants to exchange it directly for your pencil." },
  { p: "Money makes the process easier because many people accept the same form of payment. But you still need to make good decisions. If your object is useful and many people want it, you may be able to negotiate a better price." },
  { sub: "Round 3: International Trade" },
  { p: "Your market becomes bigger. Some sellers now accept only US dollars, and others accept only British pounds." },
  { p: "You have CREAR coins, but the seller wants dollars. What can you do? You need to exchange one type of money for another. This process is called currency exchange." },
  { p: "Different countries use different currencies. For example, the United States uses the US dollar, and the United Kingdom uses the British pound." },
  { p: "Imagine that a seller asks for 2 dollars for a special object. You must discover how many CREAR coins you need to exchange for those dollars, using the exchange rate given by your teacher." },
  { p: "International trade can give people access to more products, but it can also be more complicated because currencies have different values." },
  { h: "7. What Makes Something Valuable?" },
  { p: "At the end of the market, your teacher will look at the object your team has obtained. The team with the most expensive-looking object does not automatically win. Your team must also explain why your final object is valuable." },
  { p: "Imagine that one team has a simple notebook. Another team has a beautiful toy. Which object is more valuable?" },
  { p: "There is no answer without more information. A student who needs a notebook for school may value it more than the toy. A collector may be willing to pay more for the toy because it is rare." },
  { p: "Value can depend on usefulness, scarcity, demand, and personal needs." },
  { p: "During the market, you must listen carefully, speak English, and think before making an exchange. You can use these expressions:" },
  { list: ["“I give you my pencil for your notebook.”", "“What can you offer me?”", "“I am interested in your object.”", "“Can you give me a better price?”", "“This object is valuable because it is useful.”", "“This object is valuable because many people want it.”", "“I don't want to exchange it because I need it.”", "“Let me think about your offer.”"] },
  { p: "Good traders do not only look for expensive objects. They also ask questions, compare offers, and make decisions." },
  { h: "8. The Final Question" },
  { p: "At the end of the challenge, imagine that your team has exchanged a paper clip for a pencil, the pencil for a notebook, and the notebook for a more valuable object." },
  { p: "You look at your final object and feel proud. Your team has learned to negotiate, cooperate, and think creatively." },
  { p: "But your teacher asks one last question: “What did you learn about money?”" },
  { p: "Perhaps you will say that money makes exchanges easier. Perhaps you will explain that people need to agree on the value of goods. Or perhaps you will say that a good decision is not always about getting the most expensive object." },
  { p: "All these ideas are important." },
  { p: "Money is a tool that helps people exchange, compare prices, and save for the future. But money alone does not make every decision good. We must understand what we need, what we can afford, and why something is valuable." },
  { p: "Your red paper clip may be small, but it can begin a big adventure." },
  { box: "Your mission is simple: trade wisely, speak English, and explain the value of what you receive. Are you ready to enter the CREAR market?" },
];
const W1_CHECK = [
  { q: "What is bartering?", options: ["Exchanging goods without using money.", "Paying with a bank card.", "Saving coins in a piggy bank."], correct: 0, feedback: "Bartering = trading things for other things, with no money." },
  { q: "Why can't the farmer get the shoes?", options: ["The shoemaker needs a shirt, not apples.", "The farmer has no apples.", "The shoes are too expensive."], correct: 0, feedback: "The shoemaker doesn't need apples — he needs a shirt." },
  { q: "What does Emma give Daniel for two pieces of bread?", options: ["Five carrots.", "Three carrots.", "A pencil."], correct: 1, feedback: "They agree: three carrots for two pieces of bread." },
  { q: "Why can't Emma get the pencil?", options: ["The woman needs rice, not carrots.", "Emma doesn't like drawing.", "The pencil is broken."], correct: 0, feedback: "The woman already has carrots. She needs rice." },
  { q: "Before coins, what did some people use as money?", options: ["Salt, grain and shells.", "Phones and cards.", "Paper and computers."], correct: 0, feedback: "People used useful goods like salt, grain, tea, animals and shells." },
  { q: "Money as a “unit of account” helps us…", options: ["compare prices.", "travel faster.", "make shells."], correct: 0, feedback: "A sandwich of 8 coins costs twice a juice of 4 coins — we compare prices." },
  { q: "What did Kyle MacDonald start his project with?", options: ["A house.", "A red paper clip.", "A bicycle."], correct: 1, feedback: "He started with one red paper clip and traded it many times." },
  { q: "In Round 2 of the CREAR market, what can you use?", options: ["Only objects.", "CREAR coins.", "Only US dollars."], correct: 1, feedback: "Round 2: money arrives — CREAR coins!" },
  { q: "Which idea is TRUE about value?", options: ["Value is always the same as price.", "Value can be different for different people.", "Only expensive things have value."], correct: 1, feedback: "A notebook can be worth more to a student than a toy." },
];

/* =====================================================================
   SEMANA 2 · LIFE BEFORE MONEY (video + Barter Talk)
   ===================================================================== */
const W2_VIDEO_Q = [
  { q: "What did people do before money was invented?", options: ["They used credit cards.", "They used the barter system.", "They used metal coins."], correct: 1, feedback: "Before money, people used the barter system." },
  { q: "What does “barter” mean?", options: ["To trade goods or services for other goods or services.", "To borrow money from a bank.", "To make paper money."], correct: 0, feedback: "Barter = trading goods or services for other goods or services." },
  { q: "In the video, what did a farmer trade a sack of wheat for?", options: ["A bottle of milk.", "A pair of shoes.", "A bicycle."], correct: 1, feedback: "The farmer traded wheat for a pair of shoes." },
  { q: "What is another barter example in the video?", options: ["A loaf of bread for a bottle of milk.", "Gold coins for a toy.", "A toy for a computer."], correct: 0, feedback: "Bread for milk is another barter example." },
  { q: "How long did people use the barter system?", options: ["For a few weeks.", "For centuries.", "Only for one year."], correct: 1, feedback: "Barter was used for centuries." },
  { q: "Did the barter system work well in most cases?", options: ["No, it never worked.", "Yes, it worked well in most cases.", "Only in modern times."], correct: 1, feedback: "It worked well in most cases — but it had limits." },
  { q: "What was one limitation of the barter system?", options: ["Not all goods or services were easy to trade.", "It used digital phones.", "It needed too much paper."], correct: 0, feedback: "Some goods and services were not easy to trade." },
  { q: "What was another problem with bartering?", options: ["There was no easy way to know the value of goods.", "Everyone had too much gold.", "People traveled too fast."], correct: 0, feedback: "It was hard to know how much things were worth." },
  { q: "Why did societies need a better way to exchange?", options: ["Societies got more complex and people traveled.", "People stopped buying food.", "There were no farmers."], correct: 0, feedback: "More complex societies and travel needed a better medium of exchange." },
  { q: "Around when did cultures start using cowry shells, beads and stones as money?", options: ["Around 1200 BCE.", "Around 600 CE.", "Around 2023 CE."], correct: 0, feedback: "Around 1200 BCE." },
  { q: "Why were shells, beads and stones good for trading?", options: ["They were heavy and hard to find.", "They were small, portable and had a consistent value.", "You could eat them."], correct: 1, feedback: "Small, easy to carry and with a stable value." },
  { q: "When did metal coins first appear?", options: ["Around 600 BCE.", "Around 1200 BCE.", "Around 1800 CE."], correct: 0, feedback: "The first metal coins appeared around 600 BCE." },
  { q: "Where did the first metal coins appear?", options: ["In China.", "In Lydia (modern-day Turkey).", "In Rome."], correct: 1, feedback: "In Lydia — today's Turkey." },
  { q: "What were the first metal coins made of?", options: ["Plastic and wood.", "A mix of gold and silver.", "Cotton and linen."], correct: 1, feedback: "A mixture of gold and silver." },
  { q: "What was a problem with metal coins?", options: ["They were too heavy to carry.", "They melted in the sun.", "They were too big to hold."], correct: 0, feedback: "Many coins are heavy to carry." },
  { q: "Who started printing paper money around 618 CE?", options: ["The Romans.", "The Chinese.", "The Greeks."], correct: 1, feedback: "The Chinese started printing paper money." },
];

const TALK = [
  { sit: "🍎 ➜ 👟  Offer your apples for the shoemaker's shoes.", words: ["I", "give", "you", "my", "apples", "for", "your", "shoes."] },
  { sit: "🍞  Ask the baker if he wants to trade his bread.", words: ["Do", "you", "want", "to", "trade", "your", "bread?"] },
  { sit: "✏️  You don't need a pencil. Say no politely.", words: ["Sorry,", "I", "don't", "need", "a", "pencil."] },
  { sit: "📏  Say what you really need.", words: ["I", "need", "a", "ruler,", "not", "a", "pencil."] },
  { sit: "🤝  You like the offer. Say yes!", words: ["Deal!", "Let's", "make", "a", "trade."] },
];

function BarterTalk({ onSave, onExit }) {
  const [idx, setIdx] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [shake, setShake] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const [missedThis, setMissedThis] = useState(false);
  const [solved, setSolved] = useState(false);
  const [st, finish] = useFinish(onSave);
  const item = TALK[idx];
  const bank = useMemo(() => shuffleArr(TALK[idx].words.map((w, i) => ({ w, id: i }))), [idx]);
  const available = bank.filter((t) => !placed.some((p) => p.id === t.id));

  const check = () => {
    if (placed.map((p) => p.w).join(" ") === item.words.join(" ")) {
      setSolved(true); if (!missedThis) setFirstTry((f) => f + 1);
    } else { setMissedThis(true); setShake(true); setTimeout(() => setShake(false), 600); }
  };
  const next = () => {
    if (idx === TALK.length - 1) { finish(firstTry * 4, { firstTry, total: TALK.length }); return; }
    setIdx(idx + 1); setPlaced([]); setSolved(false); setMissedThis(false);
  };

  if (st.done) return <Reward title="You can barter in English! 🤝" subtitle={`${firstTry} / ${TALK.length} sentences right on the first try.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Users size={22} strokeWidth={2.1} />} title="Barter Talk" subtitle="Build what a trader says. Then say it aloud with a partner!" onExit={onExit}>
      <div className="start-block">
        <div className="p1-match-stats"><span>Sentence <b>{idx + 1}/{TALK.length}</b></span><span>First try: <b>{firstTry}</b></span></div>
        <p className="p1-situation">{item.sit}</p>
        <div className={`p1-slots ${shake ? "p1-shake bad" : ""} ${solved ? "ok" : ""}`}>
          {placed.length === 0 && <span className="p1-slots-ph">Tap the words in order…</span>}
          {placed.map((t) => <button key={t.id} type="button" className="p1-token placed" disabled={solved} onClick={() => setPlaced(placed.filter((p) => p.id !== t.id))}>{t.w}</button>)}
        </div>
        <div className="p1-bank">
          {available.map((t) => <button key={t.id} type="button" className="p1-token" disabled={solved} onClick={() => setPlaced([...placed, t])}>{t.w}</button>)}
        </div>
        {solved && <div className="p1-banner good"><Mic size={16} /> Correct! Now say it aloud to your partner: <b>“{item.words.join(" ")}”</b></div>}
      </div>
      <div className="start-foot">
        {!solved
          ? <button className="s1-btn primary big" disabled={available.length > 0} onClick={check}>Check <Check size={17} strokeWidth={2.6} /></button>
          : <button className="s1-btn primary big" onClick={next}>{idx === TALK.length - 1 ? "Finish" : "Next sentence"} <ChevronRight size={18} strokeWidth={2.4} /></button>}
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

/* =====================================================================
   SEMANA 3 · WHY BARTER IS HARD
   ===================================================================== */
const GLOSSARY_W3 = {
  "double coincidence of wants": "Doble coincidencia de deseos — los dos deben querer lo que tiene el otro, al mismo tiempo.",
  "bartering": "Trueque — cambiar cosas sin dinero.",
  "chain plan": "Plan en cadena — una ruta de varios cambios para llegar a lo que quieres.",
  "spoil": "Dañarse — cuando la comida se pone mala.",
  "negotiate": "Negociar — hablar para llegar a un acuerdo.",
};
const READING_W3 = [
  { h: "Section 1: What is a Double Coincidence of Wants?" },
  { p: "Imagine a world with no coins, no banknotes, and no bank cards. When you want something, you cannot pay with money. You must trade something you already have. This system of trading goods and services without money is called bartering." },
  { p: "Bartering sounds simple, but in real life, it can be very difficult. Why? Because of a big problem called the double coincidence of wants." },
  { p: "A double coincidence of wants means two important things must happen at the exact same time:" },
  { list: ["You must have something the other person wants.", "The other person must have something you want."] },
  { p: "If both conditions are not met, you cannot make a trade!" },
  { p: "For example, imagine you are a baker. You have fresh bread, and you need a pair of shoes. You go to a shoemaker and ask:" },
  { say: "“Can I give you three loaves of bread for a pair of shoes?”" },
  { p: "The shoemaker smiles and says:" },
  { say: "“Thank you, but I don't need bread today. My family already has plenty of food. I need a new jacket.”" },
  { p: "Now you have a big problem. You have bread, but the shoemaker doesn't want it. You cannot get your shoes through a direct trade." },
  { h: "Section 2: Level 2 Barter — The Chain Market" },
  { p: "When a direct trade is impossible, you cannot give up! You must enter Level 2: The Chain Market." },
  { p: "In a chain market, you do not make a direct trade. Instead, you create a chain plan of 3 trades (a step-by-step trading route) to finally get the object you really want." },
  { p: "Let's follow the baker's plan:" },
  { p: "Step 1: The baker talks to a tailor who makes jackets. The tailor says: “I love fresh bread! I will give you a warm jacket for five loaves of bread.” The baker trades his bread for the jacket." },
  { p: "Step 2: The baker takes the jacket and goes back to the shoemaker. Remember, the shoemaker needed a jacket! The baker offers the jacket in exchange for the shoes." },
  { p: "Step 3: The shoemaker is happy to receive the jacket and gives the baker the pair of shoes!" },
  { p: "By making two or three smart trades in a chain, the baker finally gets his shoes — even though the shoemaker never wanted bread!" },
  { h: "Section 3: Why Barter is Difficult" },
  { p: "As you can see, bartering requires strategy, time, and patience. Barter is difficult because:" },
  { list: [
    "It takes a lot of time: you cannot buy what you need immediately. You must walk around, talk to many people, and negotiate every step.",
    "Finding a match is hard: it is rare to find someone who has exactly what you need AND wants exactly what you have.",
    "Valuing items is tricky: how many apples equal one coat? Without money, it is difficult to calculate fair prices.",
    "Some items spoil or break: if you have milk, fish, or fruit, you must trade them very quickly before they go bad.",
  ] },
  { box: "In your classroom market today, you will practice creating your own 3-step barter chain. Start with one item, trade it for a second item, and finally trade that for the item you truly want!" },
];
const W3_QUIZ = [
  { q: "What is a “double coincidence of wants”?", options: ["When two people want to buy the same item with money.", "When two people each have what the other person wants, at the same time.", "When one person buys two items at the market."], correct: 1, feedback: "Both people must want what the other has — at the same time." },
  { q: "Why did the shoemaker refuse to trade with the baker at first?", options: ["He did not like the baker.", "He wanted a jacket, not bread.", "The baker had no money."], correct: 1, feedback: "The shoemaker needed a jacket." },
  { q: "How did the baker finally get the shoes?", options: ["He waited until the shoemaker was hungry.", "He traded bread for a jacket, then the jacket for shoes.", "He paid with CREAR coins."], correct: 1, feedback: "Bread → jacket → shoes: a chain of trades!" },
  { q: "Which is NOT a reason why barter is difficult?", options: ["It takes a lot of time.", "It is easy to know the exact value of everything.", "Some goods, like fruit or milk, spoil quickly."], correct: 1, feedback: "Knowing the value is actually HARD in barter." },
  { q: "What is a chain plan?", options: ["A list of things to buy with money.", "A step-by-step route of trades to get what you want.", "A bank account for children."], correct: 1, feedback: "A chain plan is a trading route of 2 or 3 steps." },
  { q: "Why must you trade fish or milk very quickly?", options: ["Because they are too expensive.", "Because they can spoil.", "Because nobody likes them."], correct: 1, feedback: "Fresh food goes bad fast." },
];

/* ---- Chain Market (puzzle de trueque en cadena) ---- */
const ITEMS = {
  bread: { e: "🍞", l: "bread" }, shoes: { e: "👟", l: "shoes" }, jacket: { e: "🧥", l: "a jacket" }, fish: { e: "🐟", l: "fish" },
  apples: { e: "🍎", l: "apples" }, carrots: { e: "🥕", l: "carrots" }, pencil: { e: "✏️", l: "a pencil" }, rice: { e: "🍚", l: "rice" },
  cheese: { e: "🧀", l: "cheese" }, clip: { e: "📎", l: "a paper clip" }, pen: { e: "🖊️", l: "a pen" }, ruler: { e: "📏", l: "a ruler" },
  notebook: { e: "📓", l: "a notebook" }, ball: { e: "⚽", l: "a ball" },
};
const CHAIN_LEVELS = [
  { have: "bread", want: "shoes", traders: [
    { name: "Shoemaker", face: "👨‍🔧", has: "shoes", wants: "jacket" },
    { name: "Tailor", face: "🧵", has: "jacket", wants: "bread" },
    { name: "Fisher", face: "🎣", has: "fish", wants: "apples" },
  ] },
  { have: "carrots", want: "pencil", traders: [
    { name: "Artist", face: "👩‍🎨", has: "pencil", wants: "rice" },
    { name: "Rice farmer", face: "👨‍🌾", has: "rice", wants: "cheese" },
    { name: "Cheese maker", face: "🧑‍🍳", has: "cheese", wants: "carrots" },
    { name: "Baker", face: "🥖", has: "bread", wants: "fish" },
  ] },
  { have: "clip", want: "notebook", traders: [
    { name: "Ana", face: "👧", has: "notebook", wants: "ruler" },
    { name: "Ben", face: "👦", has: "ruler", wants: "pen" },
    { name: "Sofi", face: "👩", has: "pen", wants: "clip" },
    { name: "Leo", face: "🧒", has: "ball", wants: "notebook" },
  ] },
];

function ChainMarket({ onSave, onExit }) {
  const [lvl, setLvl] = useState(0);
  const level = CHAIN_LEVELS[lvl];
  const traders = useMemo(() => shuffleArr(CHAIN_LEVELS[lvl].traders), [lvl]);
  const [current, setCurrent] = useState(level.have);
  const [path, setPath] = useState([level.have]);
  const [used, setUsed] = useState({});
  const [bubble, setBubble] = useState(null);
  const [fails, setFails] = useState(0);
  const [st, finish] = useFinish(onSave);
  const won = current === level.want;

  const tryTrade = (t) => {
    if (won || used[t.name]) return;
    if (t.wants === current) {
      setBubble({ who: t.name, ok: true, text: `“Thank you! I wanted ${ITEMS[current].l}. Here is ${ITEMS[t.has].l}.”` });
      setCurrent(t.has); setPath((p) => [...p, t.has]); setUsed({ ...used, [t.name]: true });
    } else {
      setFails((f) => f + 1);
      setBubble({ who: t.name, ok: false, text: `“Sorry, I don't need ${ITEMS[current].l}. I need ${ITEMS[t.wants].l}.”` });
    }
  };
  const nextLevel = () => {
    if (lvl === CHAIN_LEVELS.length - 1) { const coins = Math.max(15, 30 - fails); finish(coins, { levels: CHAIN_LEVELS.length, fails }); return; }
    const n = lvl + 1; setLvl(n); setCurrent(CHAIN_LEVELS[n].have); setPath([CHAIN_LEVELS[n].have]); setUsed({}); setBubble(null);
  };
  const reset = () => { setCurrent(level.have); setPath([level.have]); setUsed({}); setBubble(null); };

  if (st.done) return <Reward title="Chain master! 🔗" subtitle={`You solved ${CHAIN_LEVELS.length} chain markets.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Link2 size={22} strokeWidth={2.1} />} title="The Chain Market" subtitle="Nobody wants your item? Make a chain of trades!" onExit={onExit}>
      <div className="p1-chain-goal">
        <div><span>Level {lvl + 1}/{CHAIN_LEVELS.length}</span><b>You have <em>{ITEMS[current].e}</em></b></div>
        <ChevronRight size={22} />
        <div><span>Your goal</span><b>You want <em>{ITEMS[level.want].e}</em> {ITEMS[level.want].l}</b></div>
      </div>
      <div className="p1-path">{path.map((p, i) => <React.Fragment key={i}>{i > 0 && <span className="p1-path-arrow">→</span>}<span className="p1-path-item">{ITEMS[p].e}</span></React.Fragment>)}</div>
      {bubble && <div className={`p1-bubble ${bubble.ok ? "good" : "bad"}`}><b>{bubble.who}:</b> {bubble.text}</div>}
      <div className="p1-traders">
        {traders.map((t) => (
          <div key={t.name} className={`p1-trader ${used[t.name] ? "used" : ""}`}>
            <span className="p1-trader-face">{t.face}</span>
            <b>{t.name}</b>
            <span>Has: <em>{ITEMS[t.has].e}</em> {ITEMS[t.has].l}</span>
            <span className="p1-wants">Wants: <em>{ITEMS[t.wants].e}</em></span>
            <button className="s1-btn primary" disabled={won || used[t.name]} onClick={() => tryTrade(t)}>
              {used[t.name] ? "Traded ✓" : `Offer ${ITEMS[current].e}`}
            </button>
          </div>
        ))}
      </div>
      {won ? (
        <div className="p1-banner good"><Trophy size={18} /> You got {ITEMS[level.want].l} in {path.length - 1} trades!
          <button className="s1-btn primary" onClick={nextLevel}>{lvl === CHAIN_LEVELS.length - 1 ? "Finish" : "Next level"} <ChevronRight size={18} /></button>
        </div>
      ) : (
        <button type="button" className="p1-link" onClick={reset}><RefreshCw size={14} /> Start this level again</button>
      )}
    </ActShell>
  );
}

/* =====================================================================
   SEMANA 4 · HISTORY OF MONEY (timeline)
   ===================================================================== */
const TIMELINE = [
  { id: "barter", date: "Long, long ago", e: "🤝", event: "People use barter: they trade goods for goods." },
  { id: "shells", date: "About 1200 BCE", e: "🐚", event: "People use shells, beads and stones as money." },
  { id: "coins", date: "About 600 BCE", e: "🪙", event: "The first metal coins appear in Lydia (Turkey)." },
  { id: "paper", date: "About 618 CE", e: "💵", event: "China starts printing paper money." },
  { id: "cards", date: "1950s", e: "💳", event: "People start paying with bank cards." },
  { id: "digital", date: "Today", e: "📱", event: "We pay with phones and digital money." },
];

function TimelineGame({ onSave, onExit }) {
  const cards = useMemo(() => shuffleArr(TIMELINE), []);
  const [sel, setSel] = useState(null);
  const [slots, setSlots] = useState({});
  const [locked, setLocked] = useState({});
  const [errors, setErrors] = useState(0);
  const [msg, setMsg] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [st, finish] = useFinish(onSave);
  const placed = Object.values(slots);
  const bank = cards.filter((c) => !placed.includes(c.id));
  const allLocked = TIMELINE.every((t) => locked[t.id]);

  const tapSlot = (sid) => {
    if (locked[sid]) return;
    if (!sel) { if (slots[sid]) { const s = { ...slots }; delete s[sid]; setSlots(s); } return; }
    const s = { ...slots };
    Object.keys(s).forEach((k) => { if (s[k] === sel) delete s[k]; });
    s[sid] = sel; setSlots(s); setSel(null);
  };
  const check = () => {
    const s = { ...slots }, lk = { ...locked }; let wrong = 0;
    TIMELINE.forEach((t) => { if (s[t.id] === t.id) lk[t.id] = true; else { if (s[t.id]) wrong++; delete s[t.id]; } });
    setSlots(s); setLocked(lk);
    if (wrong) { setErrors((e) => e + wrong); setMsg(`${wrong} card(s) are in the wrong place. They went back — try again!`); }
    else if (TIMELINE.every((t) => lk[t.id])) setMsg("🎉 Perfect timeline! You know the history of money.");
    else setMsg("Good! Now place the other cards.");
  };

  if (st.done) return <Reward title="Time traveler! ⏳" subtitle={`You built the history of money with ${errors} mistakes.`} coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<History size={22} strokeWidth={2.1} />} title="The Money Timeline" subtitle="Put the history of money in order. Tap a card, then tap its place on the line." onExit={onExit}>
      <button type="button" className="p1-link" onClick={() => setShowVideo(!showVideo)}><Video size={14} /> {showVideo ? "Hide" : "Watch again"} the video</button>
      {showVideo && <div className="video-frame"><video src={VIDEO_MONEY} controls playsInline preload="metadata" /></div>}
      <div className="p1-tl">
        {TIMELINE.map((t) => {
          const card = TIMELINE.find((c) => c.id === slots[t.id]);
          return (
            <button key={t.id} type="button" className={`p1-tl-slot ${locked[t.id] ? "ok" : ""} ${card ? "filled" : ""}`} onClick={() => tapSlot(t.id)}>
              <span className="p1-tl-dot" />
              <span className="p1-tl-date">{t.date}</span>
              {card ? <span className="p1-tl-card"><em>{card.e}</em> {card.event}</span> : <span className="p1-tl-empty">{sel ? "Tap to place here" : "Empty"}</span>}
            </button>
          );
        })}
      </div>
      {bank.length > 0 && (
        <div className="p1-tl-bank">
          {bank.map((c) => (
            <button key={c.id} type="button" className={`p1-tl-pick ${sel === c.id ? "sel" : ""}`} onClick={() => setSel(sel === c.id ? null : c.id)}>
              <em>{c.e}</em> {c.event}
            </button>
          ))}
        </div>
      )}
      {msg && <div className={`p1-banner ${allLocked ? "good" : ""}`}>{msg}</div>}
      <div className="start-foot">
        {!allLocked
          ? <button className="s1-btn primary big" disabled={placed.length === 0} onClick={check}>Check my timeline <Check size={17} strokeWidth={2.6} /></button>
          : <button className="s1-btn primary big" onClick={() => finish(Math.max(10, 22 - errors * 2), { errors })}>Finish <span className="coin-tag"><Coins size={15} /> +{Math.max(10, 22 - errors * 2)}</span></button>}
      </div>
    </ActShell>
  );
}

/* =====================================================================
   SEMANA 5 · THREE JOBS OF MONEY (cuento Rivertown)
   ===================================================================== */
const RIVERTOWN = [
  { img: IMG_RIVERTOWN[0], title: "Welcome to Rivertown", text: [
    "Once upon a time, in a busy little village called Rivertown, lived three best friends: Leo the Carpenter, Mia the Painter, and Sam the Baker.",
    "Rivertown was a special place, but trading things was always chaotic.",
  ] },
  { img: IMG_RIVERTOWN[1], title: "Leo's heavy chair", text: [
    "One day, Leo needed a new loaf of bread. He went to Sam's bakery with a big wooden chair on his back.",
    "“Sam! Can I trade this heavy chair for two loaves of bread?” Leo asked, sweating.",
    "Sam shook his head. “Leo, I love your chairs, but my bakery is already full of chairs! I don't need more.”",
    "Leo sat on the floor, exhausted. “Bartering is so hard!” he cried.",
  ] },
  { img: IMG_RIVERTOWN[2], title: "The Mayor's golden coins", text: [
    "Just then, the Mayor of Rivertown arrived at the market. She was holding a bag of shiny golden coins.",
    "“Don't worry, everyone!” the Mayor announced. “Today, we are starting a new system. We are going to use money! Money has three magical jobs that will make our lives easy.”",
  ], magic: "Job 1: Medium of Exchange · Job 2: Unit of Account · Job 3: Store of Value" },
  { img: IMG_RIVERTOWN[3], title: "Job 1: Medium of Exchange", text: [
    "The Mayor gave Leo five golden coins for a small wooden stool. Now Leo had coins in his pocket instead of heavy chairs. He walked over to Sam's bakery.",
    "“Hello, Sam! I would like to buy two loaves of bread, please,” Leo said. He gave Sam two golden coins.",
    "Sam smiled and accepted the coins. “Thank you, Leo! Here is your fresh bread.”",
    "Leo didn't need to find a jacket or a chair that Sam wanted. He used money!",
  ], magic: "Money is a Medium of Exchange: it lets us buy and sell things easily, without trading objects directly." },
  { img: IMG_RIVERTOWN[4], title: "Job 2: Unit of Account", text: [
    "Later that afternoon, Mia the Painter went to the market. She saw two paintbrushes: one small and one very big.",
    "Before money, nobody knew which brush was worth more. Was a big brush worth three apples or two fish? It was confusing!",
    "Now the shopkeeper put price tags on everything: 🖌️ Small brush: 3 coins · 🖌️ Big brush: 6 coins.",
    "“Ah! Now I understand!” Mia said. “The big brush costs twice as much as the small brush, because 6 is double 3.”",
  ], magic: "Money is a Unit of Account: it helps us measure and compare the value of different things." },
  { img: IMG_RIVERTOWN[5], title: "Job 3: Store of Value", text: [
    "At the end of the week, Sam the Baker had 20 golden coins from selling bread. He didn't need to buy anything that day.",
    "If Sam kept 20 loaves of bread, the bread would go bad in three days. But golden coins do not spoil!",
    "Sam put 15 coins in a small wooden box under his bed. “Next month, I can buy a new oven!” he thought.",
    "From that day on, the people of Rivertown traded quickly, compared prices easily, and saved for their dreams — thanks to the three magic jobs of money!",
  ], magic: "Money is a Store of Value: you can save it today and use it in the future." },
];
const JOBS_BUCKETS = [
  { id: "exchange", label: "Medium of Exchange", icon: "🛒", color: "#0b7a50" },
  { id: "account", label: "Unit of Account", icon: "🏷️", color: "#c98a14" },
  { id: "store", label: "Store of Value", icon: "🐖", color: "#e0563f" },
];
const JOBS_ITEMS = [
  { e: "🏷️", label: "Lucas sees a coat for 40 coins and a hat for 10 coins. The coat is four times more expensive.", answer: "account", why: "He is comparing prices." },
  { e: "🍎", label: "Maria gives 2 coins to the farmer and gets a bag of apples.", answer: "exchange", why: "She uses money to buy something." },
  { e: "🐖", label: "David puts 5 coins in his piggy bank every Friday to buy a bicycle next year.", answer: "store", why: "He keeps money for the future." },
  { e: "🥖", label: "Sam accepts money for his bread instead of asking for shoes.", answer: "exchange", why: "Money makes the trade easy." },
  { e: "🧃", label: "A juice costs 4 coins and a sandwich costs 8 coins. The sandwich costs double.", answer: "account", why: "We measure and compare value." },
  { e: "🎁", label: "Mia keeps 10 coins in a box for her mom's birthday next month.", answer: "store", why: "She saves money for later." },
  { e: "🖌️", label: "Leo pays 3 coins for a paintbrush.", answer: "exchange", why: "He buys something with money." },
  { e: "📋", label: "The menu says: soup 5 coins, salad 6 coins. Ana chooses the cheaper one.", answer: "account", why: "She compares prices to decide." },
];

function ThreeJobsSort({ onSave, onExit }) {
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="You know the 3 jobs! 🪄" subtitle="Exchange · Account · Store." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Scale size={22} strokeWidth={2.1} />} title="Sort It! The 3 Jobs of Money" subtitle="Read each situation. Which job of money is it?" onExit={onExit}>
      <div className="p1-jobs">
        {JOBS_BUCKETS.map((b) => <div key={b.id} className="p1-job" style={{ "--job": b.color }}><em>{b.icon}</em><b>{b.label}</b></div>)}
      </div>
      <SortBuckets buckets={JOBS_BUCKETS} items={JOBS_ITEMS} onDone={(r) => finish(r.correct * 3, r)} />
    </ActShell>
  );
}

/* =====================================================================
   SEMANA 6 · COLOMBIAN MONEY MUSEUM (5 minijuegos) + WORLD CURRENCIES
   ⚠️ Revisa estos datos contra tu audio y corrige lo que haga falta.
   ===================================================================== */
const BILLS = [
  { id: "b2", kind: "bill", value: 2000, person: "Débora Arango", color: "#3a86c8", fact: "Débora Arango was a brave Colombian painter." },
  { id: "b5", kind: "bill", value: 5000, person: "José Asunción Silva", color: "#8d6e3f", fact: "José Asunción Silva was a famous Colombian poet." },
  { id: "b10", kind: "bill", value: 10000, person: "Virginia Gutiérrez", color: "#d1495b", fact: "The $10,000 banknote shows the Amazon rainforest." },
  { id: "b20", kind: "bill", value: 20000, person: "Alfonso López Michelsen", color: "#e07a2f", fact: "Alfonso López Michelsen was a president of Colombia." },
  { id: "b50", kind: "bill", value: 50000, person: "Gabriel García Márquez", color: "#7b4fa8", fact: "Gabriel García Márquez won the Nobel Prize in Literature." },
  { id: "b100", kind: "bill", value: 100000, person: "Carlos Lleras Restrepo", color: "#2f9e6b", fact: "Carlos Lleras Restrepo was a president of Colombia." },
];
const COINS_CO = [
  { id: "c50", kind: "coin", value: 50, animal: "spectacled bear", fact: "The spectacled bear lives in the Andes mountains." },
  { id: "c100", kind: "coin", value: 100, animal: "frailejón", fact: "The frailejón is a special plant of the páramo." },
  { id: "c200", kind: "coin", value: 200, animal: "macaw", fact: "Macaws are big, colorful birds." },
  { id: "c500", kind: "coin", value: 500, animal: "glass frog", fact: "You can see inside the body of a glass frog!" },
  { id: "c1000", kind: "coin", value: 1000, animal: "sea turtle", fact: "The loggerhead sea turtle swims in the Caribbean Sea." },
];
const ROOMS = [
  { id: "explore", name: "Explore the Museum", e: "🔎", badge: "Banknote Detective" },
  { id: "flip", name: "Flip & Discover", e: "🃏", badge: "Memory Keeper" },
  { id: "build", name: "Build the Banknote", e: "🧩", badge: "Biodiversity Expert" },
  { id: "rush", name: "Money Rush", e: "🛒", badge: "Smart Shopper" },
  { id: "treasure", name: "Unlock the Treasure", e: "🗝️", badge: "Money Master" },
];

function MoneyCard({ m, onClick, cls = "" }) {
  return m.kind === "bill" ? (
    <button type="button" className={`p1-bill ${cls}`} style={{ "--bill": m.color }} onClick={onClick}>
      <span className="p1-bill-co">COLOMBIA</span><b>{cop(m.value)}</b><span className="p1-bill-pesos">PESOS</span>
    </button>
  ) : (
    <button type="button" className={`p1-coin ${cls}`} onClick={onClick}><b>{m.value}</b><span>pesos</span></button>
  );
}
function RoomShell({ room, onExit, children }) {
  return (
    <div className="p1-roomview">
      <div className="reader-bar">
        <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Museum map</button>
        <span className="p1-room-tag">{room.e} {room.name}</span>
      </div>
      {children}
    </div>
  );
}
const secondsSince = (t) => Math.round((Date.now() - t) / 1000);

/* Sala 1 · buscar objetos */
const EXPLORE = [
  { q: "Find the banknote with the highest value.", a: "b100", h1: "Look at the numbers. Which is the biggest?", h2: "It has five zeros: 100,000." },
  { q: "Find the banknote with the famous Colombian writer.", a: "b50", h1: "He wrote “One Hundred Years of Solitude”.", h2: "It's Gabriel García Márquez — the $50,000 banknote." },
  { q: "Find the coin with the glass frog.", a: "c500", h1: "It's a coin, not a banknote.", h2: "The glass frog is on the $500 coin." },
  { q: "Find the banknote with the Amazon rainforest.", a: "b10", h1: "This banknote is red.", h2: "It's the $10,000 banknote." },
  { q: "Find the coin with the spectacled bear.", a: "c50", h1: "It's the coin with the smallest value.", h2: "The spectacled bear is on the $50 coin." },
];
function RoomExplore({ room, onDone, onExit }) {
  const all = useMemo(() => shuffleArr([...BILLS, ...COINS_CO]), []);
  const [step, setStep] = useState(0);
  const [hint, setHint] = useState(0);
  const [errors, setErrors] = useState(0);
  const [hints, setHints] = useState(0);
  const [found, setFound] = useState(null);
  const [wrong, setWrong] = useState(null);
  const t0 = useRef(Date.now());
  const ch = EXPLORE[step];
  const tap = (m) => {
    if (found) return;
    if (m.id === ch.a) { setFound(m); return; }
    setErrors((e) => e + 1); setWrong(m.id); setTimeout(() => setWrong(null), 500);
    if (hint < 2) { setHint((h) => h + 1); setHints((x) => x + 1); }
  };
  const next = () => {
    if (step === EXPLORE.length - 1) { onDone({ errors, hints, seconds: secondsSince(t0.current) }); return; }
    setStep(step + 1); setHint(0); setFound(null);
  };
  return (
    <RoomShell room={room} onExit={onExit}>
      <div className="p1-challenge"><span>Clue {step + 1}/{EXPLORE.length}</span><b>{ch.q}</b></div>
      {hint > 0 && !found && <div className="p1-hint">💡 {hint === 1 ? ch.h1 : ch.h2}</div>}
      <div className="p1-museum-wall">
        {all.map((m) => <MoneyCard key={m.id} m={m} onClick={() => tap(m)} cls={`${found?.id === m.id ? "glow" : ""} ${wrong === m.id ? "p1-shake" : ""} ${found && found.id !== m.id ? "dim" : ""}`} />)}
      </div>
      {found && (
        <div className="p1-banner good"><Sparkles size={18} /> {found.fact}
          <button className="s1-btn primary" onClick={next}>{step === EXPLORE.length - 1 ? "Finish room" : "Next clue"} <ChevronRight size={18} /></button>
        </div>
      )}
    </RoomShell>
  );
}

/* Sala 2 · memoria */
const FLIP_PAIRS = ["b2", "b5", "b50", "b100"].map((id) => BILLS.find((b) => b.id === id));
function RoomFlip({ room, onDone, onExit }) {
  const cards = useMemo(() => shuffleArr(FLIP_PAIRS.flatMap((b) => [
    { key: b.id + "-v", pid: b.id, text: cop(b.value), sub: "banknote", color: b.color },
    { key: b.id + "-p", pid: b.id, text: b.person, sub: "person", color: b.color },
  ])), []);
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState({});
  const [errors, setErrors] = useState(0);
  const [fact, setFact] = useState("");
  const busy = useRef(false);
  const t0 = useRef(Date.now());
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
        setFact(BILLS.find((x) => x.id === cards[a].pid).fact);
        if (Object.keys(m).length === FLIP_PAIRS.length) setTimeout(() => onDone({ errors, hints: 0, seconds: secondsSince(t0.current) }), 1400);
      }, 450);
    } else {
      setErrors((e) => e + 1);
      setTimeout(() => { setOpen([]); busy.current = false; }, 950);
    }
  };
  return (
    <RoomShell room={room} onExit={onExit}>
      <div className="p1-challenge"><span>Pairs {Object.keys(matched).length}/{FLIP_PAIRS.length}</span><b>Find each banknote and its famous person.</b></div>
      <div className="p1-flip">
        {cards.map((c, i) => {
          const isOpen = open.includes(i) || matched[c.pid];
          return (
            <button key={c.key} type="button" className={`p1-fcard ${isOpen ? "open" : ""} ${matched[c.pid] ? "matched" : ""}`} style={{ "--bill": c.color }} onClick={() => flip(i)}>
              <span className="p1-fback">🏛️</span>
              <span className="p1-ffront"><b>{c.text}</b><small>{c.sub}</small></span>
            </button>
          );
        })}
      </div>
      {fact && <div className="p1-banner good"><Sparkles size={18} /> Fun fact: {fact}</div>}
    </RoomShell>
  );
}

/* Sala 3 · armar el billete */
const BUILD_SLOTS = [{ id: "person", label: "Person" }, { id: "region", label: "Region" }, { id: "flower", label: "Plant" }, { id: "animal", label: "Animal" }];
const BUILD_PIECES = [
  { t: "Virginia Gutiérrez", slot: "person", ok: true }, { t: "Débora Arango", slot: "person" },
  { t: "Amazon", slot: "region", ok: true }, { t: "Andes", slot: "region" },
  { t: "Victoria regia (giant water lily)", slot: "flower", ok: true }, { t: "Frailejón", slot: "flower" },
  { t: "Tree frog", slot: "animal", ok: true }, { t: "Spectacled bear", slot: "animal" },
];
function RoomBuild({ room, onDone, onExit }) {
  const pieces = useMemo(() => shuffleArr(BUILD_PIECES.map((p, i) => ({ ...p, id: i }))), []);
  const [sel, setSel] = useState(null);
  const [slots, setSlots] = useState({});
  const [locked, setLocked] = useState({});
  const [errors, setErrors] = useState(0);
  const [msg, setMsg] = useState("");
  const t0 = useRef(Date.now());
  const placedIds = Object.values(slots);
  const full = BUILD_SLOTS.every((s) => slots[s.id] !== undefined);
  const tapSlot = (sid) => {
    if (locked[sid]) return;
    if (sel === null) { if (slots[sid] !== undefined) { const s = { ...slots }; delete s[sid]; setSlots(s); } return; }
    const s = { ...slots };
    Object.keys(s).forEach((k) => { if (s[k] === sel) delete s[k]; });
    s[sid] = sel; setSlots(s); setSel(null);
  };
  const check = () => {
    const s = { ...slots }, lk = { ...locked }; let wrong = 0;
    BUILD_SLOTS.forEach((sl) => {
      const p = pieces.find((x) => x.id === s[sl.id]);
      if (p && p.ok && p.slot === sl.id) lk[sl.id] = true; else { wrong++; delete s[sl.id]; }
    });
    setSlots(s); setLocked(lk);
    if (wrong) { setErrors((e) => e + 1); setMsg(`${wrong} piece(s) are not correct. Think about the audio and try again!`); }
    else { setMsg("🎉 Perfect! You rebuilt the $10,000 banknote."); setTimeout(() => onDone({ errors, hints: 0, seconds: secondsSince(t0.current) }), 1500); }
  };
  return (
    <RoomShell room={room} onExit={onExit}>
      <div className="p1-challenge"><span>Rebuild it!</span><b>Put the correct pieces on the $10,000 banknote.</b></div>
      <div className="p1-build-note" style={{ "--bill": "#d1495b" }}>
        <span className="p1-bill-co">COLOMBIA · $10,000</span>
        <div className="p1-bslots">
          {BUILD_SLOTS.map((sl) => {
            const p = pieces.find((x) => x.id === slots[sl.id]);
            return (
              <button key={sl.id} type="button" className={`p1-bslot ${locked[sl.id] ? "ok" : ""} ${p ? "filled" : ""}`} onClick={() => tapSlot(sl.id)}>
                <small>{sl.label}</small><b>{p ? p.t : sel !== null ? "Tap to place" : "?"}</b>
              </button>
            );
          })}
        </div>
      </div>
      <div className="p1-bank">
        {pieces.filter((p) => !placedIds.includes(p.id)).map((p) => (
          <button key={p.id} type="button" className={`p1-token ${sel === p.id ? "sel" : ""}`} onClick={() => setSel(sel === p.id ? null : p.id)}>{p.t}</button>
        ))}
      </div>
      {msg && <div className="p1-banner">{msg}</div>}
      <div className="start-foot"><button className="s1-btn primary big" disabled={!full} onClick={check}>Check banknote <Check size={17} /></button></div>
    </RoomShell>
  );
}

/* Sala 4 · mercado: pagar exacto, cambio y decidir */
const START_WALLET = [5000, 2000, 2000, 1000, 1000, 500, 500];
function RoomRush({ room, onDone, onExit }) {
  const [wallet, setWallet] = useState(() => START_WALLET.map((v, i) => ({ v, id: i })));
  const [tray, setTray] = useState([]);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState(0);
  const [msg, setMsg] = useState("");
  const t0 = useRef(Date.now());
  const nextId = useRef(100);
  const total = wallet.reduce((a, t) => a + t.v, 0);
  const trayTotal = tray.reduce((a, t) => a + t.v, 0);
  const sortDesc = (arr) => [...arr].sort((a, b) => b.v - a.v);

  const toTray = (t) => { if (step !== 0) return; setWallet((w) => w.filter((x) => x.id !== t.id)); setTray((tr) => [...tr, t]); };
  const toWallet = (t) => { setTray((tr) => tr.filter((x) => x.id !== t.id)); setWallet((w) => sortDesc([...w, t])); };
  const pay = () => {
    if (trayTotal === 3000) { setTray([]); setMsg("✅ Great! You paid the exact price: $3,000."); setStep(1); }
    else { setErrors((e) => e + 1); setMsg(`The water costs $3,000. On the counter you have ${cop(trayTotal)}.`); }
  };
  const change = (v) => {
    if (v === 1000) {
      setWallet((w) => sortDesc([...w.filter((x) => x.v !== 5000), { v: 1000, id: nextId.current++ }]));
      setMsg("✅ Correct! $5,000 − $4,000 = $1,000 change."); setStep(2);
    } else { setErrors((e) => e + 1); setMsg("Not quite. Think: $5,000 − $4,000 = ?"); }
  };
  const decide = (c) => {
    if (c === "save") { setMsg("✅ Smart! You have " + cop(total) + ". The book costs $8,000, so you save and buy it later."); setStep(3); }
    else { setErrors((e) => e + 1); setMsg(`Look at your wallet: you have ${cop(total)}. The book costs $8,000. Can you buy it now?`); }
  };
  const SHOP = [{ e: "💧", n: "Water", p: 3000 }, { e: "🥪", n: "Sandwich", p: 4000 }, { e: "📘", n: "Book", p: 8000 }];

  return (
    <RoomShell room={room} onExit={onExit}>
      <div className="p1-shop">{SHOP.map((s, i) => <div key={s.n} className={`p1-shop-item ${i === Math.min(step, 2) ? "on" : ""} ${i < step ? "done" : ""}`}><em>{s.e}</em><b>{s.n}</b><span>{cop(s.p)}</span></div>)}</div>
      <div className="p1-challenge">
        <span>Step {Math.min(step + 1, 3)}/3</span>
        <b>{step === 0 ? "Buy the water. Tap your money to put the EXACT price on the counter." : step === 1 ? "You buy the sandwich ($4,000) with your $5,000 bill. How much change do you get?" : step === 2 ? "You want the book ($8,000). Save your money or spend it now?" : "Shopping done!"}</b>
      </div>
      {step === 0 && (
        <div className="p1-counter">
          <span>Counter: <b>{cop(trayTotal)}</b></span>
          <div className="p1-money-row">{tray.map((t) => <span key={t.id} className={`p1-tokmoney ${t.v >= 2000 ? "bill" : "coin"}`} onClick={() => toWallet(t)}>{cop(t.v)}</span>)}</div>
          <button className="s1-btn primary" disabled={tray.length === 0} onClick={pay}>Pay</button>
        </div>
      )}
      {step === 1 && <div className="p1-options">{[500, 1000, 2000].map((v) => <button key={v} className="s1-btn ghost" onClick={() => change(v)}>{cop(v)}</button>)}</div>}
      {step === 2 && (
        <div className="p1-options">
          <button className="s1-btn ghost" onClick={() => decide("spend")}>🛍️ Buy it now</button>
          <button className="s1-btn ghost" onClick={() => decide("save")}>🐖 Save and buy it later</button>
        </div>
      )}
      <div className="p1-wallet">
        <span>My wallet: <b>{cop(total)}</b></span>
        <div className="p1-money-row">{wallet.map((t) => <span key={t.id} className={`p1-tokmoney ${t.v >= 2000 ? "bill" : "coin"}`} onClick={() => toTray(t)}>{cop(t.v)}</span>)}</div>
      </div>
      {msg && <div className={`p1-banner ${msg.startsWith("✅") ? "good" : ""}`}>{msg}</div>}
      {step === 3 && <div className="start-foot"><button className="s1-btn primary big" onClick={() => onDone({ errors, hints: 0, seconds: secondsSince(t0.current) })}>Finish room <ChevronRight size={18} /></button></div>}
    </RoomShell>
  );
}

/* Sala 5 · el tesoro */
const TREASURE = [
  { left: "👨‍💼 Gabriel García Márquez", right: "$50,000 banknote" },
  { left: "🐸 Glass frog", right: "$500 coin" },
  { left: "🌳 Amazon rainforest", right: "$10,000 banknote" },
  { left: "💧 Water for $3,000", right: "A $2,000 bill + a $1,000 coin" },
  { left: "🐖 Saving coins every week", right: "To buy a book in the future" },
];
function RoomTreasure({ room, onDone, onExit }) {
  const options = useMemo(() => shuffleArr(TREASURE.map((t) => t.right)), []);
  const [ans, setAns] = useState({});
  const [ok, setOk] = useState({});
  const [errors, setErrors] = useState(0);
  const [open, setOpen] = useState(false);
  const t0 = useRef(Date.now());
  const unlocked = Object.values(ok).filter(Boolean).length;
  const check = () => {
    const r = {}; let wrong = 0;
    TREASURE.forEach((t, i) => { r[i] = ans[i] === t.right; if (!r[i]) wrong++; });
    setOk(r);
    if (wrong) setErrors((e) => e + 1);
    else { setOpen(true); setTimeout(() => onDone({ errors, hints: 0, seconds: secondsSince(t0.current) }), 1800); }
  };
  return (
    <RoomShell room={room} onExit={onExit}>
      <div className={`p1-chest ${open ? "open" : ""}`}>
        <span className="p1-chest-ico">{open ? "💰" : "🧰"}</span>
        <div className="p1-locks">{TREASURE.map((_, i) => <span key={i} className={ok[i] ? "on" : ""}>{ok[i] ? "🔓" : "🔒"}</span>)}</div>
        <b>{open ? "The treasure is yours!" : `${unlocked}/5 locks open`}</b>
      </div>
      <div className="p1-connect">
        {TREASURE.map((t, i) => (
          <div key={i} className={`p1-connect-row ${ok[i] === true ? "ok" : ok[i] === false ? "no" : ""}`}>
            <b>{t.left}</b>
            <select className="start-input" value={ans[i] || ""} onChange={(e) => setAns({ ...ans, [i]: e.target.value })} disabled={ok[i] === true}>
              <option value="">Choose…</option>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>
      {!open && <div className="start-foot"><button className="s1-btn primary big" disabled={Object.keys(ans).length < TREASURE.length} onClick={check}>Open the locks <KeyRound size={17} /></button></div>}
    </RoomShell>
  );
}

function MuseumAdventure({ studentName, existing, onSave, onExit }) {
  const [rooms, setRooms] = useState(existing?.rooms || {});
  const [open, setOpen] = useState(null);
  const [st, finish] = useFinish(onSave);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [open]);
  const doneCount = ROOMS.filter((r) => rooms[r.id]).length;
  const roomDone = (id) => (stats) => { setRooms((r) => ({ ...r, [id]: stats })); setOpen(null); };
  const props = (id) => ({ room: ROOMS.find((r) => r.id === id), onDone: roomDone(id), onExit: () => setOpen(null) });

  if (st.done) return <Reward title="Colombian Money Expert! 🏛️" subtitle="You recovered the museum's treasure." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  if (open === "explore") return <RoomExplore {...props("explore")} />;
  if (open === "flip") return <RoomFlip {...props("flip")} />;
  if (open === "build") return <RoomBuild {...props("build")} />;
  if (open === "rush") return <RoomRush {...props("rush")} />;
  if (open === "treasure") return <RoomTreasure {...props("treasure")} />;

  const totalErrors = Object.values(rooms).reduce((a, r) => a + (r.errors || 0), 0);
  return (
    <ActShell icon={<Landmark size={22} strokeWidth={2.1} />} title="The Colombian Money Museum" subtitle="The museum lost the key to its treasure! Explore 5 rooms to get it back." onExit={onExit}>
      <div className="p1-museum-map">
        {ROOMS.map((r, i) => {
          const done = !!rooms[r.id];
          const locked = i > 0 && !rooms[ROOMS[i - 1].id];
          return (
            <button key={r.id} type="button" className={`p1-room ${done ? "done" : ""} ${locked ? "locked" : ""}`} disabled={locked} onClick={() => setOpen(r.id)}>
              <span className="p1-room-n">{i + 1}</span>
              <em>{locked ? "🔒" : r.e}</em>
              <b>{r.name}</b>
              <small>{done ? `🏅 ${r.badge}` : locked ? "Locked" : "Open the room"}</small>
            </button>
          );
        })}
      </div>
      {doneCount === ROOMS.length ? (
        <>
          <div className="p1-diploma">
            <span>🏛️</span>
            <small>Colombian Money Museum</small>
            <h3>Colombian Money Expert</h3>
            <p>Awarded to <b>{studentName}</b></p>
            <div className="p1-diploma-badges">{ROOMS.map((r) => <i key={r.id}>{r.e} {r.badge}</i>)}</div>
          </div>
          <div className="start-foot"><button className="s1-btn primary big" onClick={() => finish(70, { rooms, totalErrors })}>Claim my diploma <span className="coin-tag"><Coins size={15} /> +70</span></button></div>
        </>
      ) : <p className="start-tip p1-center">{doneCount}/5 rooms complete · Each room gives you a badge.</p>}
    </ActShell>
  );
}

/* =====================================================================
   SEMANA 7 · WHAT IS VALUE? (needs vs wants + frases para negociar)
   ===================================================================== */
const NW_BUCKETS = [
  { id: "need", label: "Need", icon: "✅", color: "#0b7a50" },
  { id: "want", label: "Want", icon: "⭐", color: "#c98a14" },
];
const NW_ITEMS = [
  { e: "🍎", label: "Food for lunch", answer: "need", why: "You need food to live and be healthy." },
  { e: "💧", label: "Clean water", answer: "need", why: "Everybody needs water every day." },
  { e: "🎮", label: "A new video game", answer: "want", why: "It's fun, but you can live without it." },
  { e: "🧥", label: "A warm jacket when it is cold", answer: "need", why: "It protects you from the cold." },
  { e: "🍬", label: "Candy", answer: "want", why: "It's nice, but it isn't necessary." },
  { e: "💊", label: "Medicine when you are sick", answer: "need", why: "You need it to get better." },
  { e: "👟", label: "Shoes for school", answer: "need", why: "You need shoes to walk to school." },
  { e: "🧢", label: "A cap of your favorite team", answer: "want", why: "It's cool, but you don't need it." },
  { e: "🏠", label: "A safe home", answer: "need", why: "Everybody needs a safe place to live." },
  { e: "📱", label: "A phone case with stickers", answer: "want", why: "Your phone works without it." },
  { e: "🚌", label: "A bus ticket to go to school", answer: "need", why: "You need it to get to school." },
  { e: "🎟️", label: "A concert ticket", answer: "want", why: "It's fun, but it isn't necessary." },
];
function NeedsWants({ onSave, onExit }) {
  const [st, finish] = useFinish(onSave);
  if (st.done) return <Reward title="Needs & wants: clear! ✅⭐" subtitle="You are thinking like a smart trader." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Scale size={22} strokeWidth={2.1} />} title="Need or Want?" subtitle="Read the idea, then sort the examples." onExit={onExit}>
      <div className="p1-nw">
        <div className="p1-nw-card need"><em>✅</em><b>A NEED</b><p>Something you must have to live, be safe and be healthy.</p></div>
        <div className="p1-nw-card want"><em>⭐</em><b>A WANT</b><p>Something nice to have, but you can live without it.</p></div>
      </div>
      <div className="p1-banner"><Lightbulb size={16} /> Value is different for different people: a notebook can be worth more to a student than a toy!</div>
      <SortBuckets buckets={NW_BUCKETS} items={NW_ITEMS} onDone={(r) => finish(r.correct * 2 + 6, r)} />
    </ActShell>
  );
}

const NEGO = [
  { frame: "I give you my", ph: "pencil for your notebook." },
  { frame: "This object is valuable because", ph: "it is useful at school." },
  { frame: "Can you give me", ph: "a better offer?" },
];
function NegotiationPrep({ existing, onSave, onExit }) {
  const [vals, setVals] = useState(existing?.parts || ["", "", ""]);
  const [st, finish] = useFinish(onSave);
  const ready = vals.every((v) => countWords(v) >= 3);
  if (st.done) return <Reward title="Ready to negotiate! 🗣️" subtitle="Use these sentences in the CREAR Market." coins={st.coins} saving={st.saving} onExit={onExit} />;
  return (
    <ActShell icon={<Mic size={22} strokeWidth={2.1} />} title="My Trader Sentences" subtitle="Complete 3 sentences. You will use them in the CREAR Market next week!" onExit={onExit}>
      {NEGO.map((n, i) => (
        <div key={i} className="start-block p1-nego">
          <h3><span className="step-n">{i + 1}</span> {n.frame}…</h3>
          <div className="p1-nego-row">
            <span className="p1-frame">{n.frame}</span>
            <input className="start-input" value={vals[i]} placeholder={n.ph} onChange={(e) => setVals(vals.map((v, k) => (k === i ? e.target.value : v)))} />
          </div>
          <p className={`word-count ${countWords(vals[i]) >= 3 ? "ok" : ""}`}>{countWords(vals[i])} words · min 3</p>
        </div>
      ))}
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!ready} onClick={() => finish(20, { parts: vals, sentences: NEGO.map((n, i) => `${n.frame} ${vals[i].trim()}`) })}>
          Save my sentences <span className="coin-tag"><Coins size={15} /> +20</span>
        </button>
      </div>
    </ActShell>
  );
}

/* =====================================================================
   SEMANA 8 · CREAR MARKET (trueque digital con códigos)
   Necesita el bloque de Apps Script "trade_*" (hojas Trading y Trade_Codes).
   ===================================================================== */
const MARKET_OBJECTS = {
  clip: { name: "Red paper clip", e: "📎", value: 1, traits: ["Small", "Common", "Easy to carry"] },
  pencil: { name: "Pencil", e: "✏️", value: 3, traits: ["Useful at school", "Common"] },
  notebook: { name: "Notebook", e: "📓", value: 8, traits: ["Useful at school"] },
  bottle: { name: "Water bottle", e: "🥤", value: 12, traits: ["Useful every day"] },
  ball: { name: "Football", e: "⚽", value: 20, traits: ["Fun", "Popular"] },
  book: { name: "Adventure book", e: "📚", value: 25, traits: ["Interesting", "Useful"] },
  headphones: { name: "Headphones", e: "🎧", value: 35, traits: ["Popular", "Fun"] },
  skateboard: { name: "Skateboard", e: "🛹", value: 50, traits: ["Fun", "Hard to find"] },
  bike: { name: "Bicycle", e: "🚲", value: 120, traits: ["Useful", "Popular", "Fast"] },
  tablet: { name: "Tablet", e: "📱", value: 200, traits: ["Rare", "Popular", "Expensive"] },
};
const obj = (id) => MARKET_OBJECTS[id] || { name: id, e: "❓", value: 0, traits: [] };

function ObjectCard({ id, big, label }) {
  const o = obj(id);
  return (
    <div className={`p1-objcard ${big ? "big" : ""}`}>
      {label && <small>{label}</small>}
      <em>{o.e}</em>
      <b>{o.name}</b>
      <span className="coin-tag"><Coins size={13} /> {o.value} CREAR coins</span>
      <div className="p1-traits">{o.traits.map((t) => <i key={t}>{t}</i>)}</div>
    </div>
  );
}

function TradingFloor({ userData, API_URL, onSave, onExit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [mode, setMode] = useState("home"); // home | offer | redeem | preview
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState(null);
  const [revealing, setRevealing] = useState(null);
  const [st, finish] = useFinish(onSave);
  const waiting = useRef(null);

  const post = async (action, extra = {}) => {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action, user_key: userData.Student_Key, nombre: userData.Nombre_Completo, grado: GRADE, ...extra }),
    });
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

  useEffect(() => { run("trade_state"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const myCode = data?.myCode;
  // Mientras espero a que alguien use mi código, reviso cada 4 s
  useEffect(() => {
    if (mode !== "offer" || !myCode || myCode.status !== "open") return;
    const id = setInterval(async () => { try { const d = await post("trade_state"); if (d && "me" in d) setData(d); } catch (e) { /* reintenta */ } }, 4000);
    return () => clearInterval(id);
  }, [mode, myCode?.code, myCode?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mode === "offer" && waiting.current && myCode?.code === waiting.current && myCode?.status === "used") {
      waiting.current = null; setMode("home");
      setMsg({ type: "good", text: "🎉 Trade complete! Look at your new object." });
    }
  }, [myCode, mode]);

  const pickBox = async (i) => {
    setRevealing(i);
    const d = await run("trade_pick", { box: i });
    if (!d) { setRevealing(null); return; }
    if (d.me) setMsg({ type: "good", text: `🎁 Surprise! Your first object is a ${obj(d.me.object).name}. Now trade it up!` });
  };
  const makeOffer = async () => { const d = await run("trade_offer"); if (d?.myCode) { waiting.current = d.myCode.code; setMode("offer"); } };
  const cancelOffer = async () => { await run("trade_cancel"); waiting.current = null; setMode("home"); };
  const lookCode = async () => { const d = await run("trade_preview", { code }); if (d?.preview) { setPreview(d.preview); setMode("preview"); } };
  const acceptTrade = async () => {
    const d = await run("trade_accept", { code });
    if (d?.me) {
      const t = d.traded;
      setMsg({ type: "good", text: t ? `🤝 You gave your ${obj(t.gave).name} and got a ${obj(t.got).name} from ${t.with}!` : "🤝 Trade complete!" });
      setMode("home"); setCode(""); setPreview(null);
    }
  };

  const me = data?.me;
  const trades = me?.trades || 0;
  const coins = 15 + Math.min(trades, 5) * 5;

  if (st.done) return <Reward title="Market closed! 🏪" subtitle={`You made ${trades} trades and finished with a ${obj(me?.object).name}.`} coins={st.coins} saving={st.saving} onExit={onExit} gold />;

  return (
    <ActShell icon={<Store size={22} strokeWidth={2.1} />} title="The CREAR Market" subtitle="Trade up! Start with one object and try to finish with something more valuable." onExit={onExit}>
      {msg && <div className={`p1-banner ${msg.type === "good" ? "good" : "bad"}`}>{msg.text}</div>}
      {loading ? <p className="start-tip p1-center">Opening the market…</p> : !me ? (
        <div className="start-block">
          <h3><Gift size={18} strokeWidth={2.3} /> Choose your mystery box</h3>
          <p className="start-tip">You can choose only ONE box. Inside there is your first object. Good luck!</p>
          <div className="p1-boxes">
            {Array.from({ length: 10 }, (_, i) => (
              <button key={i} type="button" className={`p1-box ${revealing === i ? "opening" : ""}`} disabled={busy} onClick={() => pickBox(i)}>🎁<small>Box {i + 1}</small></button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="p1-market-top">
            <ObjectCard id={me.object} big label="My object now" />
            <div className="p1-market-stats">
              <div><b>{trades}</b><span>trades</span></div>
              <div><b>{me.partners?.length || 0}</b><span>partners</span></div>
              <div><b>{obj(me.object).value - obj(me.start).value >= 0 ? "+" : ""}{obj(me.object).value - obj(me.start).value}</b><span>coins vs. start {obj(me.start).e}</span></div>
            </div>
          </div>

          {mode === "home" && (
            <div className="p1-options">
              <button className="s1-btn primary big" disabled={busy} onClick={makeOffer}><KeyRound size={17} /> Offer a trade (get a code)</button>
              <button className="s1-btn ghost big" disabled={busy} onClick={() => { setMode("redeem"); setMsg(null); }}><Link2 size={17} /> I have a code</button>
            </div>
          )}

          {mode === "offer" && myCode && (
            <div className="start-block p1-center">
              <p className="start-tip">Show this code to your partner. They type it on their tablet.</p>
              <div className="p1-code">{myCode.code}</div>
              <p className="p1-waiting"><span className="s1-sync-dot" /> Waiting for your partner…</p>
              <div className="p1-frames">
                <b>Say it in English:</b>
                <span>“Hi! I have a {obj(me.object).name.toLowerCase()}. Do you want to trade?”</span>
                <span>“My {obj(me.object).name.toLowerCase()} is valuable because it is {obj(me.object).traits[0]?.toLowerCase()}.”</span>
                <span>“What can you offer me?”</span>
              </div>
              <button className="s1-btn ghost" onClick={cancelOffer} disabled={busy}>Cancel offer</button>
            </div>
          )}

          {mode === "redeem" && (
            <div className="start-block p1-center">
              <h3><Link2 size={18} /> Type your partner's code</h3>
              <input className="start-input p1-code-input" maxLength={4} value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="ABCD" />
              <div className="p1-options">
                <button className="s1-btn ghost" onClick={() => setMode("home")}>Back</button>
                <button className="s1-btn primary" disabled={code.length !== 4 || busy} onClick={lookCode}>See the offer</button>
              </div>
            </div>
          )}

          {mode === "preview" && preview && (
            <div className="start-block">
              <h3><Users size={18} /> Offer from {preview.partner}</h3>
              <div className="p1-offer-vs">
                <ObjectCard id={preview.myObject} label="You give" />
                <span className="p1-vs">⇄</span>
                <ObjectCard id={preview.theirObject} label="You get" />
              </div>
              <div className="p1-frames">
                <b>Talk before you decide:</b>
                <span>“I give you my {obj(preview.myObject).name.toLowerCase()} for your {obj(preview.theirObject).name.toLowerCase()}.”</span>
                <span>“This {obj(preview.theirObject).name.toLowerCase()} is valuable because…”</span>
                <span>“Let me think about your offer.”</span>
              </div>
              <div className="p1-options">
                <button className="s1-btn ghost" onClick={() => { setMode("home"); setPreview(null); setCode(""); }}>No, thanks</button>
                <button className="s1-btn primary big" disabled={busy} onClick={acceptTrade}>Deal! Trade <Check size={17} /></button>
              </div>
            </div>
          )}

          {me.history?.length > 0 && (
            <div className="start-block">
              <h3><History size={18} /> My trading path</h3>
              <div className="p1-path">
                <span className="p1-path-item">{obj(me.start).e}</span>
                {me.history.map((h, i) => <React.Fragment key={i}><span className="p1-path-arrow">→</span><span className="p1-path-item" title={`with ${h.with}`}>{obj(h.got).e}</span></React.Fragment>)}
              </div>
            </div>
          )}

          {data?.board?.length > 0 && (
            <div className="start-block">
              <h3><Trophy size={18} /> Market board <button type="button" className="p1-link" onClick={() => run("trade_state")}><RefreshCw size={13} /> refresh</button></h3>
              <div className="p1-board">
                {data.board.slice(0, 15).map((b, i) => (
                  <div key={i} className={`p1-board-row ${b.me ? "me" : ""}`}>
                    <span className="p1-board-n">{i + 1}</span>
                    <span className="p1-board-name">{b.name}{b.me ? " (you)" : ""}</span>
                    <span>{obj(b.object).e} {obj(b.object).value}</span>
                    <span>{b.trades} 🔁</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="start-foot">
            <button className="s1-btn primary big" disabled={trades < 1} onClick={() => finish(coins, { start: me.start, final: me.object, trades, partners: me.partners, history: me.history })}>
              {trades < 1 ? "Make at least 1 trade" : "Close my market"} <span className="coin-tag"><Coins size={15} /> +{coins}</span>
            </button>
          </div>
        </>
      )}
    </ActShell>
  );
}

/* =====================================================================
   SEMANA 9 · SHOW & TELL (postal + presentación)
   ===================================================================== */
const PC_TOPICS = ["Bartering", "The history of money", "The three jobs of money", "Colombian money", "Needs and wants", "My CREAR Market story"];
const PC_STAMPS = ["🪙", "📎", "🐚", "💵", "🌎", "🛒"];
const PC_THEMES = [
  { id: "sun", a: "#fff4d6", b: "#f5b23e" }, { id: "sea", a: "#e3f7ee", b: "#16b074" },
  { id: "sky", a: "#e5efff", b: "#5b8def" }, { id: "rose", a: "#ffe9e4", b: "#ff6b57" },
];
const PC_STARTERS = ["Dear class,", "This period I learned that…", "Before money, people…", "Money has three jobs:…", "A need is… and a want is…", "In the CREAR Market, I traded…", "My favorite part was…"];

function PostcardMaker({ studentName, existing, onSave, onExit }) {
  const [topic, setTopic] = useState(existing?.topic || "");
  const [stamp, setStamp] = useState(existing?.stamp || "🪙");
  const [theme, setTheme] = useState(existing?.theme || "sun");
  const [title, setTitle] = useState(existing?.title || "Greetings from the CREAR Market!");
  const [message, setMessage] = useState(existing?.message || "");
  const [big, setBig] = useState(existing?.big || "");
  const [st, finish] = useFinish(onSave);
  const th = PC_THEMES.find((t) => t.id === theme);
  const mw = countWords(message);
  const ready = topic && title.trim() && mw >= 40 && mw <= 90 && countWords(big) >= 12;

  if (st.done) return <Reward title="Your postcard is ready! 💌" subtitle="Now present it to your class." coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Mail size={22} strokeWidth={2.1} />} title="My Money Postcard" subtitle="Show what you learned this period. You will present it in class!" onExit={onExit}>
      <div className="start-block">
        <h3><span className="step-n">1</span> Choose your topic</h3>
        <div className="p1-starters">{PC_TOPICS.map((t) => <button key={t} type="button" className={`p1-chip ${topic === t ? "on" : ""}`} onClick={() => setTopic(t)}>{t}</button>)}</div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">2</span> Design it</h3>
        <input className="start-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Postcard title" />
        <div className="p1-design">
          <div className="p1-starters">{PC_STAMPS.map((s) => <button key={s} type="button" className={`p1-chip big ${stamp === s ? "on" : ""}`} onClick={() => setStamp(s)}>{s}</button>)}</div>
          <div className="p1-starters">{PC_THEMES.map((t) => <button key={t.id} type="button" className={`p1-swatch ${theme === t.id ? "on" : ""}`} style={{ background: `linear-gradient(135deg, ${t.a}, ${t.b})` }} onClick={() => setTheme(t.id)} aria-label={t.id} />)}</div>
        </div>
      </div>
      <div className="start-block">
        <h3><span className="step-n">3</span> Write your message (40–90 words)</h3>
        <Starters items={PC_STARTERS} onPick={appendStarter(setMessage)} />
        <WordField value={message} onChange={setMessage} min={40} max={90} rows={6} placeholder="Dear class, this period I learned that…" />
      </div>
      <div className="start-block">
        <h3><span className="step-n">4</span> The big question: What did you learn about money?</h3>
        <p className="start-tip">Remember the last part of our first reading, “The Final Question”.</p>
        <WordField value={big} onChange={setBig} min={12} max={50} rows={3} placeholder="I learned that money…" />
      </div>

      <div className="p1-postcard" style={{ "--pc-a": th.a, "--pc-b": th.b }}>
        <div className="p1-pc-left">
          <h3>{title || "Your title"}</h3>
          <span className="p1-pc-topic">{topic || "Choose a topic"}</span>
          <p>{message || "Your message will appear here…"}</p>
          {big && <p className="p1-pc-big">💡 {big}</p>}
        </div>
        <div className="p1-pc-right">
          <span className="p1-pc-stamp">{stamp}</span>
          <div className="p1-pc-lines"><i>To: My class</i><i>CREAR Market</i><i>From: {studentName}</i></div>
        </div>
      </div>

      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!ready} onClick={() => finish(40, { topic, stamp, theme, title, message, big, words: mw })}>
          Send my postcard <span className="coin-tag"><Coins size={15} /> +40</span>
        </button>
      </div>
    </ActShell>
  );
}

const ST_CHECKS = ["I presented my postcard to the class.", "I used at least 3 money words (barter, value, currency…).", "I answered a question from a classmate or my teacher."];
const ST_CRITERIA = ["I spoke clearly in English.", "I explained my topic well.", "I listened to my classmates."];
function ShowTell({ existing, onSave, onExit }) {
  const [checks, setChecks] = useState(existing?.checks || [false, false, false]);
  const [stars, setStars] = useState(existing?.stars || [0, 0, 0]);
  const [improve, setImprove] = useState(existing?.improve || "");
  const [st, finish] = useFinish(onSave);
  const ready = checks[0] && stars.every((s) => s > 0) && countWords(improve) >= 6;
  if (st.done) return <Reward title="Period 1 complete! 🏆" subtitle="From barter to money — you did it!" coins={st.coins} saving={st.saving} onExit={onExit} gold />;
  return (
    <ActShell icon={<Award size={22} strokeWidth={2.1} />} title="Show & Tell" subtitle="After your presentation, check your work honestly." onExit={onExit}>
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
        <WordField value={improve} onChange={setImprove} min={6} max={40} rows={2} placeholder="Next time I want to speak more slowly…" />
      </div>
      <div className="start-foot">
        <button className="s1-btn primary big" disabled={!ready} onClick={() => finish(20, { checks, stars, improve })}>
          Finish Period 1 <span className="coin-tag"><Coins size={15} /> +20</span>
        </button>
      </div>
    </ActShell>
  );
}

/* =====================================================================
   ESTRUCTURA DEL PERIODO (9 semanas · actividades)
   bucket = dónde suman los puntos: comportamiento | quizzes | aprendi
   ===================================================================== */
const P1_WEEKS = [
  { n: 1, title: "What is money?", blurb: "Launch the Red Paper Clip Challenge.", e: "📎", skills: ["Reading", "Writing"], acts: [
    { key: "w1_read", title: "Reading: The Red Paper Clip", desc: "The story of money — and our big challenge.", icon: <BookOpen size={22} />, coins: 20, bucket: "comportamiento", topics: ["Barter", "3 jobs of money", "Value"] },
    { key: "w1_diag", title: "My money self-check", desc: "A snapshot of where you are today. No wrong answers!", icon: <Compass size={22} />, coins: 10, bucket: "comportamiento", topics: ["Money ideas", "Habits", "Saving", "Trading"] },
    { key: "w1_vocab", title: "Money Vocabulary Memory", desc: "Match 10 money words with their meanings.", icon: <Puzzle size={22} />, coins: 25, bucket: "quizzes" },
    { key: "w1_predict", title: "Predict the Story", desc: "Sort the words and guess what will happen.", icon: <Lightbulb size={22} />, coins: 22, bucket: "aprendi" },
    { key: "w1_check", title: "Reading check", desc: "6 questions about the story — pass with 70%.", icon: <GraduationCap size={22} />, coins: 24, bucket: "quizzes" },
  ] },
  { n: 2, title: "Life before money", blurb: "Barter and the first forms of money.", e: "🤝", skills: ["Listening", "Speaking"], acts: [
    { key: "w2_video", title: "Video: Before money", desc: "Watch, then answer 8 questions (70% to pass).", icon: <Video size={22} />, coins: 42, bucket: "quizzes" },
    { key: "w2_talk", title: "Barter Talk", desc: "Build trader sentences and say them aloud.", icon: <Users size={22} />, coins: 20, bucket: "aprendi" },
  ] },
  { n: 3, title: "Why barter is hard", blurb: "The double coincidence of wants.", e: "🔗", skills: ["Reading", "Writing"], acts: [
    { key: "w3_read", title: "Reading: The Chain of Barter", desc: "The baker, the shoemaker and the tailor.", icon: <BookOpen size={22} />, coins: 20, bucket: "comportamiento" },
    { key: "w3_quiz", title: "Mini-quiz", desc: "Test your understanding.", icon: <GraduationCap size={22} />, coins: 24, bucket: "quizzes" },
    { key: "w3_chain", title: "The Chain Market", desc: "Solve 3 barter puzzles with a chain of trades.", icon: <Link2 size={22} />, coins: 30, bucket: "quizzes" },
    { key: "w3_write", title: "Writing: Barter is difficult because…", desc: "30–50 words with ideas from the reading.", icon: <PenLine size={22} />, coins: 20, bucket: "aprendi" },
  ] },
  { n: 4, title: "History of money", blurb: "From shells to phones.", e: "⏳", skills: ["Listening", "Writing"], acts: [
    { key: "w4_timeline", title: "The Money Timeline", desc: "Put the history of money in order.", icon: <History size={22} />, coins: 22, bucket: "quizzes" },
    { key: "w4_story", title: "Tell the story of money", desc: "Use First, Then, Later and Today.", icon: <PenLine size={22} />, coins: 25, bucket: "aprendi" },
  ] },
  { n: 5, title: "Three jobs of money", blurb: "The Magic Coins of Rivertown.", e: "🪄", skills: ["Reading", "Writing"], acts: [
    { key: "w5_story", title: "Story: The Magic Coins of Rivertown", desc: "An illustrated story about the 3 jobs of money.", icon: <BookOpen size={22} />, coins: 20, bucket: "comportamiento" },
    { key: "w5_sort", title: "Sort It! The 3 jobs", desc: "Which job of money is it?", icon: <Scale size={22} />, coins: 24, bucket: "quizzes" },
    { key: "w5_write", title: "Writing: In the market, money helps us to…", desc: "30–50 words with your own examples.", icon: <PenLine size={22} />, coins: 20, bucket: "aprendi" },
  ] },
  { n: 6, title: "Colombian & world money", blurb: "The Colombian Money Museum.", e: "🏛️", skills: ["Listening"], acts: [
    { key: "w6_listen", title: "Listening: Colombian money", desc: "Listen carefully — you will need it in the museum!", icon: <Headphones size={22} />, coins: 15, bucket: "comportamiento" },
    { key: "w6_museum", title: "The Colombian Money Museum", desc: "5 rooms, 5 games, 1 treasure.", icon: <Landmark size={22} />, coins: 70, bucket: "quizzes", topics: ["Explore", "Memory", "Build", "Market", "Treasure"] },
    { key: "w6_world", title: "Video: World currencies", desc: "Just watch and enjoy.", icon: <Globe size={22} />, coins: 10, bucket: "comportamiento" },
  ] },
  { n: 7, title: "What is value?", blurb: "Needs, wants and getting ready to trade.", e: "⚖️", skills: ["Reading", "Speaking"], acts: [
    { key: "w7_needs", title: "Need or Want?", desc: "A short idea + 12 examples to sort.", icon: <Scale size={22} />, coins: 30, bucket: "quizzes" },
    { key: "w7_frames", title: "My Trader Sentences", desc: "3 sentences to negotiate in the market.", icon: <Mic size={22} />, coins: 20, bucket: "aprendi" },
  ] },
  { n: 8, title: "The CREAR Market", blurb: "Trade up with your classmates!", e: "🏪", skills: ["Speaking", "Listening"], acts: [
    { key: "w8_market", title: "The CREAR Market", desc: "Open a mystery box and trade with codes.", icon: <Store size={22} />, coins: 40, bucket: "aprendi", topics: ["Mystery box", "Trade codes", "Market board"] },
  ] },
  { n: 9, title: "Show & Tell", blurb: "Your postcard and final presentation.", e: "💌", skills: ["Writing", "Speaking"], acts: [
    { key: "w9_postcard", title: "My Money Postcard", desc: "Design a postcard about what you learned.", icon: <Mail size={22} />, coins: 40, bucket: "aprendi" },
    { key: "w9_present", title: "Show & Tell", desc: "Present it and check your work.", icon: <Award size={22} />, coins: 20, bucket: "comportamiento" },
  ] },
];
const ALL_ACTS = P1_WEEKS.flatMap((w) => w.acts);
const TOTAL_ACTS = ALL_ACTS.length;

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Periodo1 = ({ userData, API_URL, existingRow, onBack }) => {
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

  // El dashboard primero trae la fila "light" (sin JSON) y luego la completa:
  // nos hidratamos cuando llega la versión con Checklist_JSON.
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
      .catch((e) => { console.error("Error guardando Periodo 1:", e); dispatch({ type: "rollback_progreso", payload: { Semana: PERIOD_KEY, prev } }); });
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
    let view = null;

    switch (act) {
      case "w1_diag": view = <Diagnostic existing={resp.w1_diag} onSave={save} onExit={exit} />; break;
      case "w1_vocab": view = <VocabMemory existing={resp.w1_vocab} onSave={save} onExit={exit} />; break;
      case "w1_predict": view = <PredictStory existing={resp.w1_predict} onSave={save} onExit={exit} />; break;
      case "w1_read": view = <Reader tag="READING · A2 · PROJECT STORY" title="What Is Money?" subtitle="The Story of a Red Paper Clip" minutes={12} sections={READING_W1} glossary={GLOSSARY_W1} done={!!checklist.w1_read} coins={20} onFinish={readDone(20)} onExit={exit} />; break;
      case "w1_check": view = <QuizRunner title="Reading check" emoji="📎" questions={W1_CHECK} pickCount={6} passThreshold={70} xpPerCorrect={4} xpComplete={0} onSave={save} onExit={exit} />; break;
      case "w2_video": view = <VideoQuiz src={VIDEO_MONEY} title="Video check" questions={W2_VIDEO_Q} pickCount={8} onSave={save} onExit={exit} />; break;
      case "w2_talk": view = <BarterTalk onSave={save} onExit={exit} />; break;
      case "w3_read": view = <Reader tag="READING · A2" title="The Chain of Barter" subtitle="The double coincidence of wants" minutes={6} sections={READING_W3} glossary={GLOSSARY_W3} done={!!checklist.w3_read} coins={20} onFinish={readDone(20)} onExit={exit} />; break;
      case "w3_quiz": view = <QuizRunner title="Mini-quiz" emoji="🧠" questions={W3_QUIZ} pickCount={6} passThreshold={70} xpPerCorrect={4} xpComplete={0} onSave={save} onExit={exit} />; break;
      case "w3_chain": view = <ChainMarket onSave={save} onExit={exit} />; break;
      case "w3_write": view = <WritingTask title="Barter is difficult because…" subtitle="Use ideas from the reading. 30 to 50 words." prompt="Barter is difficult because…"
        starters={["Barter is difficult because…", "For example, if I have…", "I need a chain of trades because…", "Also, it is hard to know…"]}
        example="Barter is difficult because you need a double coincidence of wants. For example, if I have a pencil and want a ruler, but the owner of the ruler wants an eraser, I cannot trade directly. I need to spend a lot of time finding a chain of trades."
        min={30} max={50} coins={20} existing={resp.w3_write} onSave={save} onExit={exit} />; break;
      case "w4_timeline": view = <TimelineGame onSave={save} onExit={exit} />; break;
      case "w4_story": view = <WritingTask icon={<History size={22} />} title="Tell the Story of Money" subtitle="Use your timeline. Tell the history of money with your own words." prompt="The story of money"
        tip="Use the four time words: First, Then, Later, Today. 40 to 70 words."
        starters={["First, people used barter…", "Then, people used shells…", "Later, metal coins…", "After that, China…", "Today, we pay with…"]}
        example="First, people used barter to trade goods. Then, they used shells, beads and stones because they were small. Later, the first metal coins appeared in Lydia, but they were heavy. After that, China printed paper money. Today, we pay with cards and phones."
        min={40} max={70} coins={25} existing={resp.w4_story} onSave={save} onExit={exit} />; break;
      case "w5_story": view = <StoryBook title="The Magic Coins of Rivertown" pages={RIVERTOWN} done={!!checklist.w5_story} coins={20} onFinish={readDone(20)} onExit={exit} />; break;
      case "w5_sort": view = <ThreeJobsSort onSave={save} onExit={exit} />; break;
      case "w5_write": view = <WritingTask title="In the market, money helps us to…" subtitle="Write your own examples of the 3 jobs. 30 to 50 words." prompt="In the market, money helps us to…"
        starters={["In the market, money helps us to…", "First, it helps us buy…", "Second, it helps us compare…", "Finally, it lets us save…"]}
        example="In the market, money helps us to trade easily. First, it helps us buy bread without trading heavy objects. Second, it helps us compare if shoes are more expensive than hats. Finally, it lets us save coins for next year!"
        min={30} max={50} coins={20} existing={resp.w5_write} onSave={save} onExit={exit} />; break;
      case "w6_listen": view = <MediaCheck kind="audio" src={colombianMoneyAudio} images={IMG_COLOMBIA} icon={<Headphones size={22} />} title="Listening: Colombian Money" subtitle="Listen carefully: the museum games use this information!" tip="🎧 Listen to the whole audio. You can listen twice." coins={15} doneLabel="I listened!" onSave={save} onExit={exit} />; break;
      case "w6_museum": view = <MuseumAdventure studentName={name} existing={resp.w6_museum} onSave={save} onExit={exit} />; break;
      case "w6_world": view = <MediaCheck kind="video" src={VIDEO_WORLD} icon={<Globe size={22} />} title="World Currencies" subtitle="Different countries, different money. Just watch and enjoy!" tip="🌎 Which currency do you like the most?" coins={10} doneLabel="I watched it!" onSave={save} onExit={exit} />; break;
      case "w7_needs": view = <NeedsWants onSave={save} onExit={exit} />; break;
      case "w7_frames": view = <NegotiationPrep existing={resp.w7_frames} onSave={save} onExit={exit} />; break;
      case "w8_market": view = <TradingFloor userData={userData} API_URL={API_URL} onSave={save} onExit={exit} />; break;
      case "w9_postcard": view = <PostcardMaker studentName={name} existing={resp.w9_postcard} onSave={save} onExit={exit} />; break;
      case "w9_present": view = <ShowTell existing={resp.w9_present} onSave={save} onExit={exit} />; break;
      default: view = null;
    }
    return <div className="s1 p1">{view}</div>;
  }

  /* ---------- SEMANA ABIERTA ---------- */
  if (week) {
    const w = P1_WEEKS.find((x) => x.n === week);
    const wDone = w.acts.filter((a) => checklist[a.key]).length;
    return (
      <div className="s1 p1">
        <button className="s1-back" onClick={() => setWeek(null)}><ArrowLeft size={18} strokeWidth={2.4} /> Back to Period 1</button>
        <div className="s1-hero p1-week-hero">
          <span className="s1-tag">{w.e} PERIOD 1 · WEEK {w.n}</span>
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
        {(() => {
          const next = P1_WEEKS.find((x) => x.n === w.n + 1);
          return next && wDone === w.acts.length ? (
            <div className="start-foot"><button className="s1-btn primary big" onClick={() => setWeek(next.n)}>Go to week {next.n}: {next.title} <ChevronRight size={18} /></button></div>
          ) : null;
        })()}
      </div>
    );
  }

  /* ---------- VISTA DEL PERIODO ---------- */
  return (
    <div className="s1 p1">
      <button className="s1-back" onClick={onBack}><ArrowLeft size={18} strokeWidth={2.4} /> Back to overview</button>

      <div className="s1-hero p1-hero">
        <span className="s1-tag"><Lock size={13} strokeWidth={2.6} /> ADMIN PREVIEW · GRADE {GRADE} · PERIOD 1</span>
        <h1>From Barter to Money</h1>
        <p>How did money change the way people exchange goods, and why is it important in our daily lives?</p>
        <div className="s1-progress"><div className="bar"><i style={{ width: `${pct}%` }} /></div><span className="pill">{pct}%</span></div>
        <div className="p1-hero-chips">
          <span><Coins size={14} /> {coinsTotal} coins</span>
          <span><Check size={14} /> {doneCount}/{TOTAL_ACTS} activities</span>
          <span>🎯 SDG 1 · SDG 8</span>
        </div>
      </div>

      <div className="p1-passport">
        <div className="p1-passport-head"><b>🛂 Trader's Passport</b><span>Finish a week to get its stamp</span></div>
        <div className="p1-stamps">
          {P1_WEEKS.map((w) => (
            <button key={w.n} type="button" className={`p1-stamp ${weekDone(w) ? "done" : ""}`} onClick={() => setWeek(w.n)} title={w.title}>
              <em>{w.e}</em><small>W{w.n}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="p1-weeks">
        {P1_WEEKS.map((w) => {
          const d = w.acts.filter((a) => checklist[a.key]).length;
          const full = d === w.acts.length;
          return (
            <button key={w.n} type="button" className={`p1-week-card ${full ? "done" : ""}`} onClick={() => setWeek(w.n)}>
              <div className="p1-week-top"><span className="p1-week-n">Week {w.n}</span><em>{full ? "✅" : w.e}</em></div>
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