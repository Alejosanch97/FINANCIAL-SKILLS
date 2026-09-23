import React, { useState, useEffect } from "react";
import "../Styles/home.css";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, TrendingDown, CreditCard, Sprout, Compass, Landmark,
  Hourglass, Flag, Target, BookOpen, PlayCircle, PenLine, Brain,
  Lightbulb, Headphones, Mic, Coins, Flame, Zap, Droplets, Calculator,
  LineChart, Check, ArrowRight, ArrowUpRight,
} from "lucide-react";

// 👇 PEGA AQUÍ LA URL DE TU IMPLEMENTACIÓN DE APPS SCRIPT (deploy /exec)
const API_URL = 'https://script.google.com/macros/s/AKfycbxVvo-GCJRlEFophVZzt4epwpZqFcx-Wn4qQQYJzx3HreajStxjhDpjcUTApphE24Sg/exec';

// Fetch con reintentos + timeout: absorbe el "arranque frío" de Apps Script
// (la primera llamada tras un rato inactivo suele tardar o fallar).
async function fetchConReintento(url, options, { intentos = 2, timeoutMs = 8000 } = {}) {
  let ultimoError;
  for (let i = 0; i < intentos; i++) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: ctrl.signal });
      clearTimeout(id);
      return await res.json();
    } catch (e) {
      clearTimeout(id);
      ultimoError = e;
      if (i < intentos - 1) await new Promise((r) => setTimeout(r, 1200 * (i + 1))); // 1.2s, 2.4s…
    }
  }
  throw ultimoError;
}

/* ---------- Marca ---------- */
const Logo = ({ dark }) => (
  <div className={`ff-logo ${dark ? "on-dark" : ""}`}>
    <span className="ff-mark"><TrendingUp size={18} strokeWidth={2.6} /></span>
    <span className="ff-word">Fin<b>Fluent</b></span>
  </div>
);

/* ---------- Ticker de vocabulario financiero (borde de la sección hero) ---------- */
const TICKER = [
  "Inflation", "Compound interest", "Budgeting", "Credit score", "ROI",
  "Savings rate", "Diversification", "CDT", "NPV & IRR", "Stablecoins",
];

/* ---------- Datos del recorrido (6 semanas) ---------- */
const JOURNEY = [
  {
    n: 1, title: "Money Mindset", Icon: Compass,
    text: "Where does your money stand today? Build your first budget and discover how inflation quietly changes what your money can buy.",
    topics: ["Budgeting 50/30/20", "Inflation", "Saving goals"],
    step: "You finish with: your money snapshot.",
  },
  {
    n: 2, title: "Smart Saving", Icon: Landmark,
    text: "Learn how savings accounts really work, how to split money into pockets for each goal, and what a CDT is.",
    topics: ["Savings accounts", "Pockets", "CDTs"],
    step: "You finish with: a real savings account.",
  },
  {
    n: 3, title: "Money Over Time", Icon: Hourglass,
    text: "The heart of finance: how interest grows, the difference between simple and compound, and what your money is worth today vs. tomorrow.",
    topics: ["Simple vs compound interest", "Present & future value", "Rates"],
    step: "You finish with: your savings growth projection.",
  },
  {
    n: 4, title: "Credit & Debt", Icon: CreditCard,
    text: "How loans and credit cards work, what you really pay in interest, and how an amortization table shows where your money goes.",
    topics: ["How credit works", "True cost of a loan", "Amortization"],
    step: "You finish with: the real cost of a loan, calculated.",
  },
  {
    n: 5, title: "Investing 101", Icon: TrendingUp,
    text: "How to judge if an investment is worth it — risk vs. return, funds, and simple indicators like NPV and IRR, plus a look at Tyba.",
    topics: ["Risk vs return", "Funds & Tyba", "NPV & IRR"],
    step: "You finish with: two investments compared.",
  },
  {
    n: 6, title: "Go Live", Icon: Flag,
    text: "Real and digital dollars, the basics of stablecoins and crypto, and how to build a simple, safe plan of your own.",
    topics: ["Dollars & stablecoins", "Crypto basics", "Your portfolio plan"],
    step: "You finish with: your own investment plan.",
  },
];

const REALITY = [
  { Icon: TrendingDown, title: "Your money shrinks", text: "With inflation, the same bill buys less every year. Doing nothing is not \"safe\" — it's a slow loss." },
  { Icon: CreditCard, title: "Debt costs more than it looks", text: "Loans and cards hide their real price in the interest. We show you how to see it before you sign." },
  { Icon: Sprout, title: "Safe investing grows money", text: "Put money to work the right way and it multiplies over time — without gambling or luck." },
];

const FLOW = [
  { n: 1, Icon: Target, title: "Warm-up quiz", text: "A quick check of what you already know before you start." },
  { n: 2, Icon: BookOpen, title: "Readings", text: "Short English texts, chosen so the finance idea is clear." },
  { n: 3, Icon: PlayCircle, title: "Videos", text: "Watch, listen and mark as done to lock in the concept." },
  { n: 4, Icon: PenLine, title: "Practice", text: "Speaking, writing and listening around real money situations." },
  { n: 5, Icon: Brain, title: "Knowledge check", text: "Prove you understood the readings and earn your XP." },
  { n: 6, Icon: Lightbulb, title: "What I learned", text: "Reflect, connect it to your life, and set your next goal." },
];

const SKILLS = [
  { letter: "R", Icon: BookOpen, title: "Reading", text: "Finance texts chosen so the meaning is clear, not overwhelming." },
  { letter: "L", Icon: Headphones, title: "Listening", text: "Short videos and audio that explain money ideas in plain English." },
  { letter: "S", Icon: Mic, title: "Speaking", text: "Explain money decisions out loud and build real confidence." },
  { letter: "W", Icon: PenLine, title: "Writing", text: "Reflect, plan and write about money using new vocabulary." },
];

const COIN_ITEMS = [
  { Icon: Coins, title: "Earn XP", text: "Finish quizzes, readings and tasks to collect coins." },
  { Icon: Flame, title: "Keep a streak", text: "Show up regularly and watch your streak grow." },
  { Icon: Zap, title: "Level up", text: "Enough XP moves you to the next level." },
  { Icon: Droplets, title: "Fluency Meter", text: "The big \"F\" fills up as you complete the course." },
];

const GOALS = [
  { Icon: Landmark, title: "A savings account", text: "Understand accounts, pockets and CDTs — and set one up for a real goal." },
  { Icon: Calculator, title: "The money math", text: "Interest, value over time, amortization and indicators like NPV and IRR." },
  { Icon: LineChart, title: "Your first investment", text: "Explore funds, dollars and digital assets — build your own simple plan." },
];

export const Home = ({ onLoginSuccess }) => {
  const [view, setView] = useState("landing");
  const [credentials, setCredentials] = useState({ user_key: '', pass: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeWeek, setActiveWeek] = useState(1);
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await fetchConReintento(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'login',
          user_key: credentials.user_key,
          password: credentials.pass,
          sheet: "User"
        })
      });
      if (result.status === 'success') {
        localStorage.setItem("userFIN", JSON.stringify(result));
        if (onLoginSuccess) onLoginSuccess(result);
        navigate("/dashboard");
      } else {
        setError(result.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Couldn't reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const week = JOURNEY.find((w) => w.n === activeWeek);

  /* =============================== LOGIN =============================== */
  if (view === "login") {
    return (
      <div className="fin-login-screen">
        <aside className="login-visual">
          <Logo dark />
          <div className="lv-copy">
            <h2>Your money brain,<br />level by level.</h2>
            <p>Learn real finance through English and finish the course with your own savings account and first investment.</p>
            <div className="lv-chips">
              <span><Landmark size={13} strokeWidth={2.4} /> Saving</span>
              <span><TrendingUp size={13} strokeWidth={2.4} /> Investing</span>
              <span><Mic size={13} strokeWidth={2.4} /> 4 skills</span>
            </div>
          </div>
          <div className="lv-foot">6 weeks · Financial English for teens</div>
        </aside>

        <div className="login-panel">
          <div className="login-box">
            <button className="btn-back-home" onClick={() => setView("landing")}>← Back home</button>
            <h1>Welcome back</h1>
            <p className="login-sub">Sign in to continue your streak.</p>
            <form onSubmit={handleSubmit}>
              <div className="fin-field">
                <label>Student key</label>
                <input type="text" name="user_key" placeholder="e.g. STU-001"
                  value={credentials.user_key} onChange={handleInputChange} required />
              </div>
              <div className="fin-field">
                <label>Password</label>
                <input type="password" name="pass" placeholder="••••••••"
                  value={credentials.pass} onChange={handleInputChange} required />
              </div>
              {error && <div className="login-error">{error}</div>}
              <button type="submit" className="btn-login-submit" disabled={loading}>
                {loading ? "Signing in…" : "Start learning"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* =============================== LANDING =============================== */
  return (
    <div className="fin-home">
      <nav className="fin-nav">
        <Logo />
        <div className="fin-nav-links">
          <a href="#reality">Why it matters</a>
          <a href="#journey">The journey</a>
          <a href="#method">Method</a>
          <a href="#coins">Rewards</a>
        </div>
        <button className="btn-login-nav" onClick={() => setView("login")}>Log in</button>
      </nav>

      {/* HERO */}
      <section className="blk blk-ink">
        <div className="blk-inner hero-inner">
          <div className="hero-copy">
            <span className="hero-badge"><span className="dot"></span> Financial Skills</span>
            <h1>Turn money into a game<br />you actually <span className="hl">win</span>.</h1>
            <p className="hero-lead">
              Learn how money really works — saving, investing and the language of finance —
              one week at a time. Finish with a real savings account and your first investment.
            </p>
            <div className="hero-cta-row">
              <button className="btn-primary" onClick={() => setView("login")}>Play week 1</button>
              <a href="#journey" className="btn-ghost">See the journey <ArrowRight size={16} strokeWidth={2.4} /></a>
            </div>
          </div>

          <div className="hero-hud">
            <div className="hud-top">
              <span className="hud-tag">Level 1</span>
              <span className="hud-tag hud-tag-gold"><Coins size={13} strokeWidth={2.6} /> 240 XP</span>
            </div>
            <h3>Money Mindset</h3>
            <div className="hud-bar"><i style={{ width: "68%" }} /></div>
            <div className="hud-bar-label"><span>Progress</span><span>68%</span></div>
            <ul className="hud-tasks">
              <li className="done"><Check size={13} strokeWidth={3} /> Warm-up quiz</li>
              <li className="done"><Check size={13} strokeWidth={3} /> Reading: Inflation</li>
              <li>What I learned</li>
            </ul>
            <div className="hud-foot"><Flame size={14} strokeWidth={2.4} /> 5-day streak</div>
          </div>
        </div>

        <div className="ticker" role="presentation">
          <div className="ticker-track">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i}>{t}<i /></span>
            ))}
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section className="blk blk-paper" id="reality">
        <div className="blk-inner reality-inner">
          <div className="reality-head">
            <span className="sec-eyebrow">Money in real life</span>
            <h2>The one subject school forgets to teach</h2>
            <p className="sec-lead">
              Everyone uses money every single day — yet almost no one learns how it truly works.
              Prices go up, savings lose value, credit costs more than it looks, and a smart, safe
              investment can grow your money while you sleep.
            </p>
          </div>
          <div className="reality-list">
            {REALITY.map((r) => (
              <div className="reality-row" key={r.title}>
                <span className="reality-ico"><r.Icon size={20} strokeWidth={2.2} /></span>
                <div>
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE JOURNEY — interactive level select */}
      <section className="blk blk-ink2" id="journey">
        <div className="blk-inner">
          <div className="sec-center">
            <span className="sec-eyebrow eyebrow-on-dark">The 6-week journey</span>
            <h2 className="on-dark">Every week, a real money skill</h2>
            <p className="sec-lead on-dark-lead">
              Each week builds on the one before. Pick a week to see what's inside.
            </p>
          </div>

          <div className="level-select">
            <div className="level-rail">
              {JOURNEY.map((w) => (
                <button
                  key={w.n}
                  className={`level-node ${activeWeek === w.n ? "active" : ""} ${w.n < activeWeek ? "past" : ""}`}
                  onClick={() => setActiveWeek(w.n)}
                  aria-pressed={activeWeek === w.n}
                >
                  <span className="level-node-ico"><w.Icon size={17} strokeWidth={2.2} /></span>
                  <span className="level-node-label">Week {w.n}</span>
                </button>
              ))}
            </div>

            <div className="level-panel" key={week.n}>
              <span className="level-panel-tag">Week {week.n} of 6</span>
              <div className="level-panel-head">
                <span className="level-panel-ico"><week.Icon size={26} strokeWidth={2.1} /></span>
                <h3>{week.title}</h3>
              </div>
              <p>{week.text}</p>
              <div className="level-panel-topics">
                {week.topics.map((t, k) => <span key={k}>{t}</span>)}
              </div>
              <span className="level-panel-step"><ArrowUpRight size={15} strokeWidth={2.4} /> {week.step}</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW A WEEK FLOWS */}
      <section className="blk blk-paper">
        <div className="blk-inner sec-center">
          <span className="sec-eyebrow">How a week flows</span>
          <h2>The same rhythm, every week</h2>
          <p className="sec-lead">Predictable steps so you can focus on learning, not on figuring out what to do next.</p>
          <div className="flow-row">
            {FLOW.map((f, i) => (
              <React.Fragment key={f.n}>
                <div className="flow-step">
                  <span className="fs-n">{f.n}</span>
                  <span className="fs-ico"><f.Icon size={18} strokeWidth={2.2} /></span>
                  <h4>{f.title}</h4>
                  <p>{f.text}</p>
                </div>
                {i < FLOW.length - 1 && <span className="flow-arrow"><ArrowRight size={16} strokeWidth={2.2} /></span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* METHOD · CLIL */}
      <section className="blk blk-paper2" id="method">
        <div className="blk-inner method-inner">
          <div className="method-copy">
            <span className="clil-badge">Our method: CLIL</span>
            <h2>Finance and English, learned together</h2>
            <p>
              We use <strong>CLIL (Content and Language Integrated Learning)</strong>: students
              learn real financial content <em>through</em> carefully chosen English texts. You're
              not studying English on one side and finance on the other — you build both at the
              same time, which is how real fluency happens.
            </p>
            <p>
              Every week trains all <strong>four skills</strong>, using texts written to be
              understandable at the student's level, so the finance idea always comes through clearly.
            </p>
          </div>
          <div className="skills-row">
            {SKILLS.map((s) => (
              <div className="skill-card" data-letter={s.letter} key={s.title}>
                <span className="skill-ico"><s.Icon size={17} strokeWidth={2.2} /></span>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COINS / XP */}
      <section className="blk blk-ink" id="coins">
        <div className="blk-inner sec-center">
          <span className="sec-eyebrow eyebrow-on-dark">Rewards</span>
          <h2 className="on-dark">Coins, XP and your Fluency Meter</h2>
          <p className="sec-lead on-dark-lead">
            Learning feels like a game because it works like one. Every action you complete moves you forward.
          </p>

          <div className="xp-showcase">
            <div className="xp-showcase-top">
              <span>Level 4</span>
              <span>320 / 500 XP</span>
            </div>
            <div className="xp-showcase-bar"><i style={{ width: "64%" }} /></div>
          </div>

          <div className="coins-strip">
            {COIN_ITEMS.map((c) => (
              <div className="coin-item" key={c.title}>
                <span className="coin-ico"><c.Icon size={19} strokeWidth={2.2} /></span>
                <h4>{c.title}</h4>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
          <p className="grades-note">Your grade comes from three places: <b>behavior</b>, <b>quizzes &amp; readings</b>, and your <b>"What I learned"</b> reflections.</p>
        </div>
      </section>

      {/* FOR FAMILIES / STUDENTS */}
      <section className="blk blk-split">
        <div className="aud-half parents">
          <span className="aud-tag">For families</span>
          <h3>What your child gains</h3>
          <ul className="aud-list">
            <li><span className="tick"><Check size={13} strokeWidth={3} /></span> Real financial skills they'll use for life, plus English at the same time.</li>
            <li><span className="tick"><Check size={13} strokeWidth={3} /></span> Safe, guided activities — big financial steps are done with an adult's help.</li>
            <li><span className="tick"><Check size={13} strokeWidth={3} /></span> Visible progress you can follow: levels, weeks completed and a final plan.</li>
          </ul>
        </div>
        <div className="aud-half students">
          <span className="aud-tag">For students</span>
          <h3>Why you'll want to finish</h3>
          <ul className="aud-list">
            <li><span className="tick"><Check size={13} strokeWidth={3} /></span> You end with a real savings account and your first investment.</li>
            <li><span className="tick"><Check size={13} strokeWidth={3} /></span> You'll talk about money in English with real confidence.</li>
            <li><span className="tick"><Check size={13} strokeWidth={3} /></span> It's a game — but the money, the skills and the wins are real.</li>
          </ul>
        </div>
      </section>

      {/* OUTCOMES */}
      <section className="blk blk-paper">
        <div className="blk-inner sec-center">
          <span className="sec-eyebrow">What you'll walk away with</span>
          <h2>Not just theory — real results</h2>
          <div className="goal-row">
            {GOALS.map((g) => (
              <div className="goal-col" key={g.title}>
                <span className="goal-ico"><g.Icon size={22} strokeWidth={2.1} /></span>
                <h3>{g.title}</h3>
                <p>{g.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="blk blk-ink">
        <div className="blk-inner cta-inner">
          <h2>Ready to level up<br />your money?</h2>
          <p>Log in, start week 1 and keep your streak alive. Your future self will thank you.</p>
          <button className="btn-primary" onClick={() => setView("login")}>Start now</button>
        </div>
      </section>

      <footer className="fin-footer">FinFluent · Financial English for teens</footer>
    </div>
  );
};