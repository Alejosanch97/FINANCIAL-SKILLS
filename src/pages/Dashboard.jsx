import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass, Landmark, Hourglass, CreditCard, TrendingUp, Flag,
  Rocket, Lock, Check, Flame, Coins, CalendarCheck, Zap, LogOut,
  Menu, X, RefreshCw, Lightbulb, ChevronLeft, ChevronRight,
  LayoutDashboard, Sun, Plane, CalendarDays, Trophy,
} from "lucide-react";
import "../Styles/dashboard.css";
import { Semana1 } from "./Semana1";
import { Semana2 } from "./Semana2";
import { Semana3 } from "./Semana3";
import { Semana4 } from "./Semana4";
import useGlobalReducer from "../hooks/useGlobalReducer"; // ajusta la ruta si tu proyecto la tiene distinta

// 👇 PEGA AQUÍ LA MISMA URL DE APPS SCRIPT QUE EN Home.jsx
const API_URL = 'https://script.google.com/macros/s/AKfycbxVvo-GCJRlEFophVZzt4epwpZqFcx-Wn4qQQYJzx3HreajStxjhDpjcUTApphE24Sg/exec';

/* =====================================================================
   DATOS
   ===================================================================== */

// --- Las 6 semanas del curso ---
// unlocked ya NO es fijo: se calcula por progreso (ver unlockedWeeks abajo).
const WEEKS = [
  { n: 1, title: "Money Mindset",   blurb: "Understand how you think about money and where you stand today.", Icon: Compass    },
  { n: 2, title: "Smart Saving",    blurb: "Compare savings accounts, pockets and CDTs.",                     Icon: Landmark   },
  { n: 3, title: "Money Over Time", blurb: "See how interest makes money grow, or shrink, over time.",        Icon: Hourglass  },
  { n: 4, title: "Credit & Debt",   blurb: "Find out what credit really costs you.",                          Icon: CreditCard },
  { n: 5, title: "Investing 101",   blurb: "Evaluate investment options and choose with confidence.",         Icon: TrendingUp },
  { n: 6, title: "Go Live",         blurb: "Handle dollars and crypto, then build your own plan.",            Icon: Flag       },
];

// 🔧 MODO PRUEBA: pon true para ver y abrir TODAS las semanas sin condiciones.
const TEST_MODE_ALL_WEEKS = true;

// --- Calendario real del curso (ajusta las fechas si cambian) ---
// La semana del 4 al 10 de octubre es de vacaciones: no arranca semana nueva esa semana,
// por eso hay un salto directo de la Semana 1 a la Semana 2 después del descanso.
const WEEK_SCHEDULE = [
  { n: 1, start: "2026-09-28", end: "2026-10-02" },
  { n: 2, start: "2026-10-12", end: "2026-10-16", vacationBefore: true },
  { n: 3, start: "2026-10-19", end: "2026-10-23" },
  { n: 4, start: "2026-10-26", end: "2026-10-30" },
  { n: 5, start: "2026-11-02", end: "2026-11-06" },
  { n: 6, start: "2026-11-09", end: "2026-11-13" },
];

// --- 20 tips financieros ---
const FINANCIAL_TIPS = [
  "Pay yourself first: automatically move a slice of every paycheck into savings before you spend anything.",
  "Track every expense for one month — most people underestimate their spending by 20% or more.",
  "Build an emergency fund covering 3 to 6 months of expenses before chasing higher returns.",
  "Compound interest rewards time more than timing — starting small and early beats waiting to invest a lot later.",
  "Avoid carrying a credit card balance; interest charges can erase months of savings in weeks.",
  "Use the 50/30/20 rule as a starting budget: 50% needs, 30% wants, 20% savings and debt payoff.",
  "Review your subscriptions every few months — forgotten ones quietly drain your budget.",
  "A high-yield savings account earns far more than a regular checking account for the same safety.",
  "Diversify your investments so one bad company or sector can't sink your whole portfolio.",
  "Know the difference between a need and a want before every purchase over your comfort threshold.",
  "Check your credit report at least once a year to catch errors or fraud early.",
  "Negotiate recurring bills like insurance and internet — loyalty rarely pays, but asking often does.",
  "Set specific savings goals with deadlines; 'save more' is vaguer and easier to abandon than 'save $500 by December'.",
  "Understand the fees on any investment account — a 1% annual fee can cost you tens of thousands over decades.",
  "Pay off your highest-interest debt first (the avalanche method) to minimize what you pay in interest overall.",
  "An emergency fund isn't for a sale — it's for job loss, medical bills, or urgent repairs.",
  "Automating your savings removes the willpower problem; you can't spend what you never see.",
  "A good credit score can save you thousands in lower interest rates on loans and mortgages.",
  "Inflation quietly reduces your money's value — cash sitting idle for years loses purchasing power.",
  "Investing isn't gambling: it's about time in the market, not timing the market.",
];

/* =====================================================================
   HELPERS
   ===================================================================== */

/* ---------- fechas ---------- */
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const diffDays = (a, b) => Math.round((startOfDay(a) - startOfDay(b)) / 86400000);
const fmtDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function getScheduleStatus(schedule) {
  const today = new Date();
  for (let i = 0; i < schedule.length; i++) {
    const w = schedule[i];
    const start = new Date(`${w.start}T00:00:00`);
    const end = new Date(`${w.end}T00:00:00`);
    if (today < start) return { phase: "upcoming", week: w, index: i, daysUntil: diffDays(start, today) };
    if (today >= start && today <= end) return { phase: "active", week: w, index: i, daysLeft: diffDays(end, today) + 1 };
  }
  return { phase: "done" };
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 19 ? "Good afternoon" : "Good evening";
};
const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s);
const isCompleted = (row) => !!row && String(row.Estado || "").toLowerCase() === "completed";

/* ---------- hooks ---------- */
const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function useMedia(query) {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return matches;
}

// Anima un número hasta su destino (el cohete "vuela" hacia su posición)
function useTween(target, ms = 1500) {
  const [value, setValue] = useState(0);
  const current = useRef(0);
  useEffect(() => {
    if (prefersReducedMotion()) { current.current = target; setValue(target); return; }
    const from = current.current;
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      current.current = from + (target - from) * eased;
      setValue(current.current);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

/* ---------- geometría de la ruta de vuelo ---------- */
// Dos composiciones: ancha (desktop) y compacta (móvil). Ambas escalan de forma uniforme.
const CHART = {
  wide:    { w: 1000, h: 340, pts: [[26, 296], [160, 270], [290, 286], [420, 212], [560, 226], [690, 140], [790, 124], [930, 46]] },
  compact: { w: 600,  h: 480, pts: [[30, 436], [120, 392], [200, 410], [290, 318], [380, 332], [450, 214], [510, 196], [562, 70]] },
};

// Catmull-Rom → Bézier: curva suave que pasa por todos los puntos
function smoothPath(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

// Silueta de montañas (crestas alternadas subiendo hacia la derecha)
function ridge(w, h, n, amp, left, right, seed) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const x = (i * w) / n;
    const base = h * (left + (right - left) * (i / n));
    const peak = i % 2 ? 0 : amp * (0.7 + 0.3 * Math.sin(i * 2.3 + seed));
    pts.push(`${x.toFixed(1)},${(base - peak).toFixed(1)}`);
  }
  return `M0,${h} L${pts.join(" L")} L${w},${h} Z`;
}

// Textura guilloche (las líneas entrelazadas de los billetes)
const GUILLOCHE = Array.from({ length: 18 }, (_, i) => {
  const pts = [];
  for (let x = 0; x <= 800; x += 10) {
    const y = 100 + 46 * Math.sin(x / 38 + i * 0.36) * Math.cos(x / 210 + i * 0.5);
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return "M" + pts.join(" L");
});

/* =====================================================================
   GROWTH TRACK (la pieza memorable)
   ===================================================================== */
function GrowthTrack({ fraction, pct, weekStates, done, level, celebrate }) {
  const compact = useMedia("(max-width: 640px)");
  const cfg = compact ? CHART.compact : CHART.wide;
  const pathRef = useRef(null);
  const [geo, setGeo] = useState(null);
  const f = useTween(fraction);

  const d = useMemo(() => smoothPath(cfg.pts), [cfg]);
  const last = cfg.pts[cfg.pts.length - 1];
  const first = cfg.pts[0];
  const area = useMemo(() => `${d} L${last[0]},${cfg.h} L${first[0]},${cfg.h} Z`, [d, cfg, last, first]);
  const ridges = useMemo(() => [
    ridge(cfg.w, cfg.h, 9, cfg.h * 0.18, 0.7, 0.36, 0.4),
    ridge(cfg.w, cfg.h, 13, cfg.h * 0.12, 0.9, 0.64, 1.9),
  ], [cfg]);

  // Mide la curva y ubica los 7 puntos (inicio + 6 semanas) equidistantes sobre ella
  useLayoutEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const L = p.getTotalLength();
    setGeo({
      L,
      nodes: Array.from({ length: 7 }, (_, k) => {
        const pt = p.getPointAtLength((L * k) / 6);
        return { x: pt.x, y: pt.y };
      }),
    });
  }, [d]);

  // Posición y ángulo del cohete = tangente exacta de la curva
  let rocket = null;
  if (geo && pathRef.current) {
    const p = pathRef.current;
    const at = Math.min(Math.max(f, 0), 1) * geo.L;
    const a = p.getPointAtLength(Math.max(0, at - 8));
    const b = p.getPointAtLength(Math.min(geo.L, at + 8));
    const c = p.getPointAtLength(at);
    rocket = { x: c.x, y: c.y, angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
  }

  const currentIdx = weekStates.findIndex((s) => !s.done);
  const nextWeek = currentIdx >= 0 ? WEEKS[currentIdx] : null;
  const headline = done >= WEEKS.length ? "You reached the summit" : done === 0 ? "Ready for takeoff" : `${done} of ${WEEKS.length} weeks done`;
  const subline = nextWeek ? `Next stop: Week ${nextWeek.n}, ${nextWeek.title}.` : "All six weeks complete. Time to put your plan to work.";
  const px = (x) => `${(x / cfg.w) * 100}%`;
  const py = (y) => `${(y / cfg.h) * 100}%`;

  return (
    <section className="growth-card" aria-label="Course progress">
      {/* fondo: guilloche + resplandor en la cima */}
      <svg className="growth-guilloche" viewBox="0 0 800 200" preserveAspectRatio="none" aria-hidden="true">
        {GUILLOCHE.map((dd, i) => <path key={i} d={dd} />)}
      </svg>
      <span className="growth-sun" aria-hidden="true" />

      <div className="growth-head">
        <div>
          <h2>{headline}</h2>
          <p>{subline}</p>
        </div>
        <div className="growth-chips">
          <span className="growth-chip"><Zap size={14} strokeWidth={2.4} /> Level {level}</span>
          <span className="growth-chip">{pct}% of the route</span>
        </div>
      </div>

      <div
        className="flight"
        style={{ aspectRatio: `${cfg.w} / ${cfg.h}` }}
        role="img"
        aria-label={`${done} of ${WEEKS.length} weeks completed, ${pct}% of the course`}
      >
        <svg className="flight-svg" viewBox={`0 0 ${cfg.w} ${cfg.h}`} aria-hidden="true">
          <defs>
            <linearGradient id="flightStroke" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#f5b23e" />
              <stop offset="1" stopColor="#8ff0c2" />
            </linearGradient>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#16b074" stopOpacity=".42" />
              <stop offset="1" stopColor="#16b074" stopOpacity="0" />
            </linearGradient>
            <clipPath id="traveled">
              <rect x="0" y="0" width={rocket ? rocket.x : 0} height={cfg.h} />
            </clipPath>
          </defs>

          {[0.25, 0.5, 0.75].map((t) => (
            <line key={t} className="flight-grid" x1="0" x2={cfg.w} y1={cfg.h * t} y2={cfg.h * t} />
          ))}
          <path className="ridge-back" d={ridges[0]} />
          <path className="ridge-front" d={ridges[1]} />
          <path d={area} fill="url(#areaFill)" clipPath="url(#traveled)" />
          <path ref={pathRef} className="flight-base" d={d} />
          {geo && (
            <path
              className="flight-done"
              d={d}
              stroke="url(#flightStroke)"
              strokeDasharray={`${f * geo.L} ${geo.L + 2}`}
            />
          )}
        </svg>

        {celebrate && (
          <div className="growth-toast" role="status">
            <Trophy size={16} strokeWidth={2.4} /> Week complete. Nice work.
          </div>
        )}

        {geo && (
          <>
            {/* punto de partida */}
            <div className="fnode start" style={{ left: px(geo.nodes[0].x), top: py(geo.nodes[0].y) }}>
              <span className="fnode-dot small" />
              <span className="fnode-label start-label">Start</span>
            </div>

            {/* las 6 semanas */}
            {WEEKS.map((w, i) => {
              const pt = geo.nodes[i + 1];
              const st = weekStates[i];
              const isCurrent = i === currentIdx;
              const xr = pt.x / cfg.w;
              const align = xr > 0.85 ? "end" : xr < 0.12 ? "begin" : "";
              const NodeIcon = w.Icon;
              return (
                <div
                  key={w.n}
                  className={`fnode ${st.done ? "done" : ""} ${isCurrent ? "current" : ""} ${align}`}
                  style={{ left: px(pt.x), top: py(pt.y) }}
                >
                  <span className="fnode-dot">
                    {st.done ? <Check size={17} strokeWidth={3} /> : <NodeIcon size={16} strokeWidth={2.2} />}
                  </span>
                  <span className="fnode-label"><b>Week {w.n}</b>{w.title}</span>
                </div>
              );
            })}

            {/* cohete */}
            {rocket && (
              <div className="rocket" style={{ left: px(rocket.x), top: py(rocket.y) }}>
                <span className="rocket-trail" style={{ transform: `rotate(${rocket.angle}deg)` }}><i /></span>
                {celebrate && <span className="rocket-burst" />}
                <span className="rocket-badge">
                  <Rocket size={24} strokeWidth={2.2} style={{ transform: `rotate(${rocket.angle + 45}deg)` }} />
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* =====================================================================
   LEDGER (stats en una sola tira tipo recibo)
   ===================================================================== */
function Ledger({ stats }) {
  const weeksLeft = WEEKS.length - stats.done;
  return (
    <div className="ledger-wrap">
      <div className="ledger">
        <div className="ledger-item xp">
          <span className="ledger-ico"><Coins size={20} strokeWidth={2.2} /></span>
          <div className="ledger-body">
            <b className="ledger-num">{stats.xp}</b>
            <span className="ledger-label">XP earned</span>
            <span
              className="ledger-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={stats.levelPct}
              aria-label={`Progress to level ${stats.level + 1}`}
            >
              <i style={{ width: `${stats.levelPct}%` }} />
            </span>
            <span className="ledger-sub">{stats.xpToNext} XP to level {stats.level + 1}</span>
          </div>
        </div>

        <div className="ledger-item streak">
          <span className="ledger-ico"><Flame size={20} strokeWidth={2.2} /></span>
          <div className="ledger-body">
            <b className="ledger-num">{stats.streak}</b>
            <span className="ledger-label">day streak</span>
            <span className="ledger-sub">{stats.streak > 0 ? "Play today to keep it going" : "Play today to start one"}</span>
          </div>
        </div>

        <div className="ledger-item weeks">
          <span className="ledger-ico"><CalendarCheck size={20} strokeWidth={2.2} /></span>
          <div className="ledger-body">
            <b className="ledger-num">{stats.done}<small>/{WEEKS.length}</small></b>
            <span className="ledger-label">weeks completed</span>
            <span className="ledger-sub">{weeksLeft === 0 ? "Every week done" : `${weeksLeft} to go`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   STATUS TICKET (boarding pass de la semana)
   ===================================================================== */
function StatusTicket({ schedule, getWeekRow, onOpenWeek, isWeekUnlocked }) {
  let m;

  if (schedule.phase === "done") {
    m = {
      Icon: Flag,
      title: "Course complete",
      text: "You finished all 6 weeks of FinFluent. Your money skills are ready to use.",
      stub: { Icon: Trophy, label: "All weeks done" },
    };
  } else {
    const w = schedule.week;
    const meta = WEEKS.find((x) => x.n === w.n);
    const range = `${fmtDate(w.start)} to ${fmtDate(w.end)}`;

    if (schedule.phase === "upcoming") {
      m = w.vacationBefore
        ? { Icon: Sun,   title: "Enjoy your break",              text: `Classes are paused. Week ${w.n}, ${meta.title}, opens on ${fmtDate(w.start)}.` }
        : { Icon: Plane, title: `Week ${w.n} opens ${fmtDate(w.start)}`, text: `${meta.title}: ${meta.blurb}` };
      m.dates = range;
      m.stub = { num: schedule.daysUntil, label: schedule.daysUntil === 1 ? "day to go" : "days to go" };
      if (isWeekUnlocked(w.n)) m.cta = { label: `Play week ${w.n} now`, week: w.n };
    } else {
      const row = getWeekRow(w.n);
      if (isCompleted(row)) {
        const next = WEEK_SCHEDULE[schedule.index + 1];
        const nextMeta = next && WEEKS.find((x) => x.n === next.n);
        m = {
          Icon: Trophy,
          title: `Week ${w.n} complete`,
          text: next ? `Week ${next.n}, ${nextMeta.title}, opens on ${fmtDate(next.start)}.` : "You've wrapped up the whole schedule.",
          stub: { Icon: Check, label: "Done" },
        };
      } else {
        const started = row && parseFloat(row.Porcentaje || 0) > 0;
        m = {
          Icon: CalendarDays,
          title: `Week ${w.n} is open`,
          text: `${meta.title} closes on ${fmtDate(w.end)}.`,
          dates: range,
          stub: { num: schedule.daysLeft, label: schedule.daysLeft === 1 ? "day left" : "days left" },
          cta: { label: `${started ? "Continue" : "Start"} week ${w.n}`, week: w.n },
        };
      }
    }
  }

  const TicketIcon = m.Icon;
  const StubIcon = m.stub.Icon;

  return (
    <div className="ticket-wrap">
      <article className="ticket">
        <div className="ticket-main">
          <span className="ticket-ico"><TicketIcon size={22} strokeWidth={2.1} /></span>
          <h3>{m.title}</h3>
          <p>{m.text}</p>
          {m.dates && <span className="ticket-dates"><CalendarDays size={15} strokeWidth={2.2} /> {m.dates}</span>}
          {m.cta && (
            <button className="btn-status-cta" onClick={() => onOpenWeek(m.cta.week)}>
              {m.cta.label}
            </button>
          )}
        </div>
        <div className="ticket-stub">
          {StubIcon ? <StubIcon className="stub-icon" size={34} strokeWidth={2.2} /> : <b className="stub-num">{m.stub.num}</b>}
          <span className="stub-label">{m.stub.label}</span>
          <span className="barcode" aria-hidden="true" />
        </div>
      </article>
    </div>
  );
}

/* =====================================================================
   TIP NOTE (index card)
   ===================================================================== */
function TipNote({ index, onPrev, onNext, onPause }) {
  return (
    <aside
      className="note"
      onMouseEnter={() => onPause(true)}
      onMouseLeave={() => onPause(false)}
      onFocus={() => onPause(true)}
      onBlur={() => onPause(false)}
    >
      <div className="note-head">
        <h3><Lightbulb size={18} strokeWidth={2.2} /> Money tip</h3>
        <span className="note-count">{index + 1} of {FINANCIAL_TIPS.length}</span>
      </div>
      <p key={index} className="note-text">{FINANCIAL_TIPS[index]}</p>
      <div className="note-nav">
        <button onClick={onPrev} aria-label="Previous tip"><ChevronLeft size={18} strokeWidth={2.4} /></button>
        <button onClick={onNext} aria-label="Next tip"><ChevronRight size={18} strokeWidth={2.4} /></button>
      </div>
    </aside>
  );
}

/* =====================================================================
   DASHBOARD
   ===================================================================== */
export const Dashboard = ({ onLogout }) => {
  const { store, dispatch } = useGlobalReducer();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");   // overview | week1..week6
  const [isLoading, setIsLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [tipIndex, setTipIndex] = useState(() => new Date().getDate() % FINANCIAL_TIPS.length);
  const [tipPaused, setTipPaused] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const prevDoneRef = useRef(null);
  const navigate = useNavigate();

  /* ---------- carga inicial ---------- */
  useEffect(() => {
    const saved = localStorage.getItem("userFIN");
    if (!saved) { navigate("/"); return; }
    let data;
    try { data = JSON.parse(saved); } catch { localStorage.removeItem("userFIN"); navigate("/"); return; }
    setUserData(data);                 // pinta el dashboard YA
    loadProgreso(data.Student_Key);    // los progresos llegan por detrás (no bloquea)
  }, [navigate]);

  const loadProgreso = async (key) => {
    if (!key) { setIsLoading(false); return; } // sin key no pedimos nada (evita el error del GET)
    setIsLoading(true);
    try {
      const url = `${API_URL}?sheet=Progreso_Semanas&user_key=${encodeURIComponent(key)}`;
      const res = await fetch(url);
      const data = await res.json();
      const rows = Array.isArray(data) ? data : []; // si vino {status:'error'}, lo ignoramos
      const bySemana = {};
      rows.forEach((row) => { if (row && row.Semana != null) bySemana[row.Semana] = row; });
      dispatch({ type: "set_semanas", payload: bySemana });
    } catch (e) {
      console.error("Error cargando progreso:", e);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- métricas derivadas ---------- */
  const stats = useMemo(() => {
    const rows = Object.values(store.semanas || {});
    // Sumamos los 3 componentes en vez de depender de "Puntos_Total": ese campo
    // no existe en la fila optimista que arma Semana1, así que si lo usamos aquí
    // el XP "cae a 0" un instante hasta el próximo refetch real.
    const xpRaw = rows.reduce(
      (s, r) => s + parseFloat(r.Puntos_Comportamiento || 0) + parseFloat(r.Puntos_Quizzes || 0) + parseFloat(r.Puntos_Aprendi || 0),
      0
    );
    const xp = Math.round(xpRaw) || 0;
    const done = rows.filter(isCompleted).length;
    // % global = promedio del % de las 6 semanas (se recalcula al terminar una actividad)
    const raw = rows.reduce((s, r) => s + parseFloat(r.Porcentaje || 0), 0) / WEEKS.length;
    const overallRaw = Math.max(0, Math.min(100, Number.isFinite(raw) ? raw : 0));
    const level = Math.floor(xp / 100) + 1;
    const streak = parseInt(userData?.Racha_Dias || 0) || 0;
    return {
      xp, done, level, streak,
      overallRaw,
      overall: Math.round(overallRaw),
      levelPct: xp % 100,
      xpToNext: 100 - (xp % 100),
    };
  }, [store.semanas, userData]);

  const getWeekRow = (n) => store.semanas?.[n];

  // Semana N desbloqueada si: es la 1, o la N-1 está completada, o modo prueba.
  const isWeekUnlocked = (n) => {
    if (TEST_MODE_ALL_WEEKS || n === 1) return true;
    return isCompleted(getWeekRow(n - 1));
  };

  /* ---------- celebración al completar una semana ---------- */
  useEffect(() => {
    if (prevDoneRef.current !== null && stats.done > prevDoneRef.current) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 3200);
      prevDoneRef.current = stats.done;
      return () => clearTimeout(t);
    }
    prevDoneRef.current = stats.done;
  }, [stats.done]);

  /* ---------- rotación automática de tips (se pausa al interactuar) ---------- */
  useEffect(() => {
    if (tipPaused) return;
    const id = setInterval(() => setTipIndex((i) => (i + 1) % FINANCIAL_TIPS.length), 10000);
    return () => clearInterval(id);
  }, [tipPaused]);
  const nextTip = () => setTipIndex((i) => (i + 1) % FINANCIAL_TIPS.length);
  const prevTip = () => setTipIndex((i) => (i - 1 + FINANCIAL_TIPS.length) % FINANCIAL_TIPS.length);

  /* ---------- acciones ---------- */
  const handleLogout = () => {
    localStorage.removeItem("userFIN");
    if (onLogout) onLogout();
    navigate("/");
  };
  const goWeek = (w) => {
    if (!isWeekUnlocked(w.n)) return;
    setActiveTab(`week${w.n}`);
    setNavOpen(false);
  };
  const openWeekNumber = (n) => {
    const w = WEEKS.find((x) => x.n === n);
    if (w) goWeek(w);
  };

  if (!userData) {
    return (
      <div className="fin-loading">
        <div>
          <div className="spin"></div>
          <p>Loading your progress…</p>
        </div>
      </div>
    );
  }

  // 🔧 MODO PRUEBA: ignoramos las fechas reales y tratamos la semana en curso como "activa".
  // Para volver al calendario real, borra este bloque y deja solo la línea de abajo.
  const schedule = TEST_MODE_ALL_WEEKS
    ? { phase: "active", week: WEEK_SCHEDULE[0], index: 0, daysLeft: 5 }
    : getScheduleStatus(WEEK_SCHEDULE);
  const weekStates = WEEKS.map((w) => ({ n: w.n, done: isCompleted(getWeekRow(w.n)), unlocked: isWeekUnlocked(w.n) }));
  const firstName = userData.Nombre_Completo?.split(" ")[0] || "there";
  const role = capitalize(String(userData.Rol || "Student"));

  return (
    <div className={`fin-dash ${navOpen ? "nav-open" : ""}`}>
      {/* barra superior móvil */}
      <div className="fin-mobile-top">
        <div className="fin-brand-min">
          <span className="logo-chip"><TrendingUp size={17} strokeWidth={2.6} /></span>
          Fin<b>Fluent</b>
        </div>
        <button className="fin-burger" onClick={() => setNavOpen(!navOpen)} aria-label={navOpen ? "Close menu" : "Open menu"}>
          {navOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {navOpen && <div className="fin-overlay" onClick={() => setNavOpen(false)}></div>}

      {/* ---------------- SIDEBAR ---------------- */}
      <aside className="fin-side">
        <button className="fin-side-brand" onClick={() => setActiveTab("overview")}>
          <span className="logo-chip"><TrendingUp size={20} strokeWidth={2.6} /></span>
          <span>Fin<b>Fluent</b></span>
        </button>

        <div className="fin-user">
          <div className="fin-avatar">{userData.Nombre_Completo?.charAt(0) || "S"}</div>
          <div className="fin-user-info">
            <h4>{userData.Nombre_Completo}</h4>
            <div className="fin-user-chips">
              <span className="fin-chip lvl"><Zap size={12} strokeWidth={2.6} /> Level {stats.level}</span>
              <span className="fin-chip">{role}</span>
            </div>
          </div>
        </div>

        <button
          className={`fin-nav-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
          aria-current={activeTab === "overview" ? "page" : undefined}
        >
          <span className="nav-ico"><LayoutDashboard size={18} strokeWidth={2.2} /></span>
          Overview
        </button>

        <div className="fin-nav-label">Your route</div>
        <nav className="fin-route" aria-label="Course weeks">
          {WEEKS.map((w) => {
            const st = weekStates[w.n - 1];
            const active = activeTab === `week${w.n}`;
            const locked = !st.unlocked;
            return (
              <button
                key={w.n}
                className={`fin-nav-btn is-week ${active ? "active" : ""} ${st.done ? "done" : ""} ${locked ? "locked" : ""}`}
                onClick={() => goWeek(w)}
                aria-current={active ? "page" : undefined}
                aria-disabled={locked || undefined}
                title={locked ? "Unlocks after the previous week" : undefined}
              >
                <span className="wk-mark">
                  {locked ? <Lock size={13} strokeWidth={2.4} /> : st.done ? <Check size={15} strokeWidth={3} /> : w.n}
                </span>
                <span className="wk-name">{w.title}</span>
              </button>
            );
          })}
        </nav>

        <div className="fin-side-foot">
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={17} strokeWidth={2.2} /> Log out
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN ---------------- */}
      <main className="fin-main">

        {/* ===== OVERVIEW ===== */}
        {activeTab === "overview" && (
          <>
            <header className="fin-header">
              <div>
                <h1>{greeting()}, {firstName}</h1>
                <p>Here's where your money skills stand today.</p>
              </div>
              <button className="btn-sync" onClick={() => loadProgreso(userData.Student_Key)} disabled={isLoading}>
                <RefreshCw size={16} strokeWidth={2.4} className={isLoading ? "spin-icon" : ""} />
                {isLoading ? "Syncing" : "Sync"}
              </button>
            </header>

            <div className="overview-stack">
              <GrowthTrack
                fraction={stats.overallRaw / 100}
                pct={stats.overall}
                weekStates={weekStates}
                done={stats.done}
                level={stats.level}
                celebrate={celebrate}
              />

              <Ledger stats={stats} />

              <div className="insight-grid">
                <StatusTicket schedule={schedule} getWeekRow={getWeekRow} onOpenWeek={openWeekNumber} isWeekUnlocked={isWeekUnlocked} />
                <TipNote index={tipIndex} onPrev={prevTip} onNext={nextTip} onPause={setTipPaused} />
              </div>
            </div>
          </>
        )}

        {/* ===== SEMANA 1 ===== */}
        {activeTab === "week1" && (
          <Semana1
            userData={userData}
            API_URL={API_URL}
            existingRow={store.semanas?.[1]}
            onBack={() => setActiveTab("overview")}
          />
        )}

        {/* ===== SEMANA 2 ===== */}
        {activeTab === "week2" && (
          <Semana2
            userData={userData}
            API_URL={API_URL}
            existingRow={store.semanas?.[2]}
            onBack={() => setActiveTab("overview")}
          />
        )}

        {/* ===== SEMANA 3 ===== */}
        {activeTab === "week3" && (
          <Semana3
            userData={userData}
            API_URL={API_URL}
            existingRow={store.semanas?.[3]}
            onBack={() => setActiveTab("overview")}
          />
        )}

        {/* ===== SEMANA 4 ===== */}
        {activeTab === "week4" && (
          <Semana4
            userData={userData}
            API_URL={API_URL}
            existingRow={store.semanas?.[4]}
            onBack={() => setActiveTab("overview")}
          />
        )}

        {/* ===== SEMANAS 5–6 (próximamente) ===== */}
        {["week5", "week6"].includes(activeTab) && (
          <div className="soon-panel">
            <div className="soon-inner">
              <div className="soon-lock"><Lock size={28} strokeWidth={2.2} /></div>
              <h2>Coming soon</h2>
              <p>This week unlocks once you complete the previous one. Keep building your streak in Week 1.</p>
              <button className="btn-back" onClick={() => setActiveTab("week1")}>Go to Week 1</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};