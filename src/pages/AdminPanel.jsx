import React, { useEffect, useMemo, useState } from "react";
import {
  Users, UserX, TrendingUp, Trophy, RefreshCw, Search, Download,
  ArrowLeft, ChevronRight, Check, X, AlertTriangle, FileText,
} from "lucide-react";
import "../Styles/admin.css";

/* =====================================================================
   ADMIN PANEL · control de todos los estudiantes
   Lee User + Progreso_Semanas (con Respuestas_JSON) en una sola llamada.
   ===================================================================== */

const WEEKS = [1, 2, 3, 4, 5, 6];
const WEEK_TITLES = { 1: "Money Mindset", 2: "Smart Saving", 3: "Money Over Time", 4: "Credit & Debt", 5: "Investing 101", 6: "Go Live" };

const STATUS = {
  never: { label: "Nunca entró" },
  idle: { label: "Entró sin avanzar" },
  active: { label: "En progreso" },
  finished: { label: "Terminó el curso" },
};

const ACTIVITY_LABELS = {
  warmup: "Self-check", diagnostic: "Self-check (diagnóstico)", reading: "Lectura", video: "Video quiz",
  sort: "Saving or Spending", check: "Reading check", start: "Starting point (presupuesto)",
  banks: "Bank scout", permission: "Hablar con la familia", instruments: "Simulador CDT vs bolsillo",
  plan: "Plan de ahorro", timevalue: "Today vs Tomorrow", interest: "Simple vs Compuesto",
  pvfv: "Valor Presente / Futuro", rates: "Rate match", growth: "Proyección / Crecimiento",
  final: "Examen final", cost: "Costo real del crédito", amort: "Tabla de amortización",
  extra: "Abono a capital", research: "Investigación de tasas", npvtir: "VPN y TIR",
  bcpri: "B/C y Payback", risk: "Riesgo vs retorno", explore: "Explorar Tyba",
  stablecoin: "Dólares digitales", match: "Asset match", portfolio: "Portafolio", feedback: "Feedback del curso",
};

const FIELD_LABELS = {
  reflection: "Reflexión", why: "Por qué", summary: "Resumen", analysis: "Análisis", notes: "Notas",
  inflationText: "Análisis de inflación", opinion: "Opinión", rateNote: "Nota sobre la tasa",
  goal: "Meta", goalAmount: "Monto meta", goalMonths: "Meses", goalMonthly: "Ahorro mensual para la meta",
  income: "Ingreso", expenses: "Gastos", needs: "Necesidades", wants: "Deseos", capacity: "Capacidad de ahorro",
  savePct: "% de ahorro", correct: "Correctas", total: "Total", scores: "Puntajes", banks: "Bancos",
  fav: "Banco elegido", pro: "Ventaja", con: "Desventaja", name: "Nombre", status: "Respuesta",
  signed: "Trae formulario firmado", amount: "Monto", days: "Días", cajaRate: "Tasa caja (% E.A.)",
  cdtRate: "Tasa CDT (% E.A.)", inflation: "Inflación (%)", cajaInt: "Interés caja", cdtInt: "Interés CDT",
  instrument: "Instrumento", monthly: "Monto mensual", rate: "Tasa", years: "Años", invested: "Valor final",
  earned: "Ganado por interés", lender: "Entidad", platform: "Plataforma", cdtRate_: "Tasa CDT",
  fundReturn: "Retorno del fondo (%)", choice: "Elección", horizon: "Horizonte", alloc: "Distribución (%)",
  rateCourse: "Nota al curso (1-5)", rateUI: "Nota a la interfaz (1-5)", favorite: "Semana favorita",
  before: "Antes (Semana 1)", done: "Completado", xp: "XP", knowledge: "Conocimiento", habits: "Hábitos",
  planning: "Planeación", risk: "Riesgo", type: "Tipo", fixed: "Renta fija", funds: "Fondos",
  dollars: "Dólares digitales", growth: "Crecimiento",
};
const HIDDEN_FIELDS = ["at", "answers", "choices", "order"];

/* ---------------- helpers ---------------- */
const num = (v) => parseFloat(v || 0) || 0;
const parseJSON = (s) => {
  if (!s) return {};
  if (typeof s === "object") return s;
  try { return JSON.parse(s); } catch { return {}; }
};
const isDone = (row) => !!row && String(row.Estado || "").toLowerCase() === "completed";
const rowXP = (row) => (row ? num(row.Puntos_Comportamiento) + num(row.Puntos_Quizzes) + num(row.Puntos_Aprendi) : 0);
const activityLabel = (k) => ACTIVITY_LABELS[k] || k;
const humanize = (k) => FIELD_LABELS[k] || String(k).replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
const countWords = (s) => (String(s).trim() ? String(s).trim().split(/\s+/).length : 0);

function fmtDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(d)) return String(v);
  return d.toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function timeAgo(v) {
  if (!v) return "Nunca";
  const d = new Date(v);
  if (isNaN(d)) return String(v);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "Hoy";
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

function extractQuizzes(weeks) {
  const out = [];
  WEEKS.forEach((n) => {
    const resp = parseJSON(weeks[n]?.Respuestas_JSON);
    Object.entries(resp).forEach(([k, v]) => {
      if (v && typeof v.correct === "number" && v.total) {
        out.push({ week: n, key: k, correct: v.correct, total: v.total, pct: Math.round((v.correct / v.total) * 100) });
      }
    });
  });
  return out;
}

function buildStudents(data) {
  if (!data) return [];
  const byKey = {};
  data.progreso.forEach((r) => {
    const k = String(r.Student_Key || "").trim();
    if (!k || r.Semana === "" || r.Semana == null) return;
    if (!byKey[k]) byKey[k] = {};
    byKey[k][Number(r.Semana)] = r;
  });
  return data.users
    .filter((u) => u.Student_Key && String(u.Rol || "").toUpperCase() !== "ADMIN")
    .map((u) => {
      const key = String(u.Student_Key).trim();
      const weeks = byKey[key] || {};
      const overall = Math.round(WEEKS.reduce((a, n) => a + num(weeks[n]?.Porcentaje), 0) / WEEKS.length);
      const done = WEEKS.filter((n) => isDone(weeks[n])).length;
      const xp = Math.round(WEEKS.reduce((a, n) => a + rowXP(weeks[n]), 0));
      const started = Object.keys(weeks).length > 0;
      const status = done === WEEKS.length ? "finished" : started ? "active" : u.Fecha_Ultimo_Login ? "idle" : "never";
      return {
        key, name: String(u.Nombre_Completo || key), email: String(u.Email || ""),
        lastLogin: u.Fecha_Ultimo_Login || null, weeks, overall, done, xp, status,
        quizzes: extractQuizzes(weeks),
      };
    });
}

/* ---------------- piezas pequeñas ---------------- */
function PctPill({ row }) {
  const p = Math.round(num(row?.Porcentaje));
  const cls = !row || p === 0 ? "zero" : isDone(row) ? "done" : "partial";
  return (
    <span className={`adm-pill ${cls}`}>
      {cls === "done" && <Check size={12} strokeWidth={3} />}{p}%
    </span>
  );
}

function ValueView({ value }) {
  if (value === null || value === undefined || value === "") return <span className="adm-muted">—</span>;
  if (typeof value === "boolean") return <span>{value ? "Sí" : "No"}</span>;
  if (typeof value === "number") return <span className="adm-num">{value.toLocaleString("es-CO")}</span>;
  if (typeof value === "string") {
    if (value.length > 60) {
      return <p className="adm-text">{value}<small>{countWords(value)} palabras</small></p>;
    }
    return <span>{value}</span>;
  }
  if (Array.isArray(value)) {
    if (!value.length) return <span className="adm-muted">—</span>;
    return <div className="adm-list">{value.map((v, i) => <div key={i} className="adm-list-item"><ValueView value={v} /></div>)}</div>;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value).filter(([k]) => !HIDDEN_FIELDS.includes(k));
    if (!entries.length) return <span className="adm-muted">Completado</span>;
    return (
      <dl className="adm-dl">
        {entries.map(([k, v]) => (
          <React.Fragment key={k}>
            <dt>{humanize(k)}</dt>
            <dd><ValueView value={v} /></dd>
          </React.Fragment>
        ))}
      </dl>
    );
  }
  return <span>{String(value)}</span>;
}

/* =====================================================================
   DETALLE DE UN ESTUDIANTE
   ===================================================================== */
function StudentDetail({ s, onBack }) {
  const [week, setWeek] = useState(() => WEEKS.find((n) => s.weeks[n]) || 1);
  const row = s.weeks[week];
  const resp = parseJSON(row?.Respuestas_JSON);
  const checklist = parseJSON(row?.Checklist_JSON);
  const entries = Object.entries(resp).sort((a, b) => String(a[1]?.at || "").localeCompare(String(b[1]?.at || "")));

  return (
    <div className="adm">
      <button className="adm-back" onClick={onBack}><ArrowLeft size={18} strokeWidth={2.4} /> Volver a la lista</button>

      <header className="adm-student">
        <div className="adm-avatar">{s.name.charAt(0)}</div>
        <div className="adm-student-info">
          <h1>{s.name}</h1>
          <p>{s.key} · {s.email || "sin email"} · Último ingreso: {fmtDate(s.lastLogin)}</p>
          <span className={`adm-status ${s.status}`}>{STATUS[s.status].label}</span>
        </div>
        <div className="adm-student-kpis">
          <span><b>{s.overall}%</b>Progreso</span>
          <span><b>{s.done}/6</b>Semanas</span>
          <span><b>{s.xp}</b>XP</span>
        </div>
      </header>

      {s.quizzes.length > 0 && (
        <section className="adm-card">
          <h3 className="adm-card-title">Notas de quizzes y juegos</h3>
          <div className="adm-quiz-grid">
            {s.quizzes.map((q) => (
              <div key={q.week + q.key} className={`adm-quiz ${q.pct >= 80 ? "ok" : "low"}`}>
                <small>S{q.week} · {activityLabel(q.key)}</small>
                <b>{q.correct}/{q.total}</b>
                <span>{q.pct}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="adm-tabs">
        {WEEKS.map((n) => (
          <button key={n} className={`adm-tab ${week === n ? "on" : ""}`} onClick={() => setWeek(n)}>
            Semana {n} <PctPill row={s.weeks[n]} />
          </button>
        ))}
      </div>

      {!row ? (
        <div className="adm-empty"><FileText size={28} strokeWidth={2} /> No ha empezado la Semana {week} ({WEEK_TITLES[week]}).</div>
      ) : (
        <>
          <section className="adm-card">
            <div className="adm-week-summary">
              <div><small>Estado</small><b>{isDone(row) ? "Completada" : "En curso"}</b></div>
              <div><small>Avance</small><b>{Math.round(num(row.Porcentaje))}%</b></div>
              <div><small>Comportamiento</small><b>{num(row.Puntos_Comportamiento)}</b></div>
              <div><small>Quizzes</small><b>{num(row.Puntos_Quizzes)}</b></div>
              <div><small>What I learned</small><b>{num(row.Puntos_Aprendi)}</b></div>
              <div><small>Total</small><b>{num(row.Puntos_Total) || rowXP(row)}</b></div>
              <div><small>Última actualización</small><b className="sm">{fmtDate(row.Fecha_Actualizacion)}</b></div>
            </div>
            {Object.keys(checklist).length > 0 && (
              <div className="adm-chips">
                {Object.entries(checklist).map(([k, v]) => (
                  <span key={k} className={`adm-chip ${v ? "ok" : "no"}`}>
                    {v ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />} {activityLabel(k)}
                  </span>
                ))}
              </div>
            )}
          </section>

          {entries.length === 0 ? (
            <div className="adm-empty">Aún no hay respuestas guardadas en esta semana.</div>
          ) : entries.map(([k, v]) => {
            const hasScore = v && typeof v.correct === "number" && v.total;
            const pct = hasScore ? Math.round((v.correct / v.total) * 100) : null;
            return (
              <section key={k} className="adm-card adm-resp">
                <div className="adm-resp-head">
                  <h3>{activityLabel(k)}</h3>
                  <div className="adm-resp-meta">
                    {hasScore && <span className={`adm-score ${pct >= 80 ? "ok" : "low"}`}>{v.correct}/{v.total} · {pct}%</span>}
                    {v?.at && <small>{fmtDate(v.at)}</small>}
                  </div>
                </div>
                <ValueView value={v} />
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}

/* =====================================================================
   PANEL PRINCIPAL
   ===================================================================== */
export const AdminPanel = ({ userData, API_URL }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedKey, setSelectedKey] = useState(null);

  const load = async () => {
    if (!userData?.admin_token) {
      setError("Tu sesión no tiene permiso de admin. Cierra sesión y vuelve a entrar.");
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "admin_overview", token: userData.admin_token }),
      });
      const json = await res.json();
      if (json.status !== "success") throw new Error(json.message || "No se pudo cargar la información.");
      setData({ users: json.users || [], progreso: json.progreso || [] });
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e.message || "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const students = useMemo(() => buildStudents(data), [data]);

  const stats = useMemo(() => {
    const total = students.length || 1;
    return {
      total: students.length,
      never: students.filter((s) => s.status === "never").length,
      avg: Math.round(students.reduce((a, s) => a + s.overall, 0) / total),
      finished: students.filter((s) => s.status === "finished").length,
      perWeek: WEEKS.map((n) => ({
        n,
        done: students.filter((s) => isDone(s.weeks[n])).length,
        started: students.filter((s) => num(s.weeks[n]?.Porcentaje) > 0).length,
      })),
    };
  }, [students]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = students.filter((s) => !q || s.name.toLowerCase().includes(q) || s.key.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    if (STATUS[filter]) arr = arr.filter((s) => s.status === filter);
    else if (filter.startsWith("done-")) { const n = Number(filter.split("-")[1]); arr = arr.filter((s) => isDone(s.weeks[n])); }
    else if (filter.startsWith("pend-")) { const n = Number(filter.split("-")[1]); arr = arr.filter((s) => !isDone(s.weeks[n])); }

    const sorted = [...arr];
    if (sortBy === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (sortBy === "progress") sorted.sort((a, b) => b.overall - a.overall);
    if (sortBy === "xp") sorted.sort((a, b) => b.xp - a.xp);
    if (sortBy === "login") sorted.sort((a, b) => (b.lastLogin ? new Date(b.lastLogin) : 0) - (a.lastLogin ? new Date(a.lastLogin) : 0));
    return sorted;
  }, [students, query, filter, sortBy]);

  /* ---------- CSV para subir notas (se abre bien en Excel en español) ---------- */
  const exportCSV = () => {
    const quizCols = [];
    const seen = new Set();
    list.forEach((s) => s.quizzes.forEach((q) => {
      const id = `${q.week}|${q.key}`;
      if (!seen.has(id)) { seen.add(id); quizCols.push({ week: q.week, key: q.key }); }
    }));
    quizCols.sort((a, b) => a.week - b.week);

    const header = [
      "Student_Key", "Nombre", "Email", "Estado", "Último ingreso", "Progreso global %", "Semanas completas", "XP total",
      ...WEEKS.flatMap((n) => [`S${n} %`, `S${n} XP`]),
      ...quizCols.map((c) => `S${c.week} ${activityLabel(c.key)} (%)`),
    ];
    const rows = list.map((s) => [
      s.key, s.name, s.email, STATUS[s.status].label, s.lastLogin ? fmtDate(s.lastLogin) : "Nunca",
      s.overall, s.done, s.xp,
      ...WEEKS.flatMap((n) => [Math.round(num(s.weeks[n]?.Porcentaje)), rowXP(s.weeks[n])]),
      ...quizCols.map((c) => {
        const q = s.quizzes.find((x) => x.week === c.week && x.key === c.key);
        return q ? q.pct : "";
      }),
    ]);
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = "\uFEFF" + [header, ...rows].map((r) => r.map(esc).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `FinFluent_notas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selected = students.find((s) => s.key === selectedKey);
  if (selected) return <StudentDetail s={selected} onBack={() => setSelectedKey(null)} />;

  return (
    <div className="adm">
      <header className="adm-head">
        <div>
          <h1>Admin panel</h1>
          <p>{updatedAt ? `Actualizado ${updatedAt.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}` : "Cargando estudiantes…"}</p>
        </div>
        <div className="adm-actions">
          <button className="adm-btn" onClick={load} disabled={loading}>
            <RefreshCw size={16} strokeWidth={2.4} className={loading ? "spin-icon" : ""} /> {loading ? "Cargando" : "Refrescar"}
          </button>
          <button className="adm-btn primary" onClick={exportCSV} disabled={!list.length}>
            <Download size={16} strokeWidth={2.4} /> Descargar notas (CSV)
          </button>
        </div>
      </header>

      {error && <div className="adm-error"><AlertTriangle size={18} strokeWidth={2.4} /> {error}</div>}

      {data && (
        <>
          <div className="adm-stats">
            <div className="adm-stat"><span className="adm-stat-ico forest"><Users size={20} /></span><div><b>{stats.total}</b><span>Estudiantes</span></div></div>
            <div className="adm-stat clickable" onClick={() => setFilter(filter === "never" ? "all" : "never")}><span className="adm-stat-ico coral"><UserX size={20} /></span><div><b>{stats.never}</b><span>Nunca entraron</span></div></div>
            <div className="adm-stat"><span className="adm-stat-ico gold"><TrendingUp size={20} /></span><div><b>{stats.avg}%</b><span>Progreso promedio</span></div></div>
            <div className="adm-stat clickable" onClick={() => setFilter(filter === "finished" ? "all" : "finished")}><span className="adm-stat-ico green"><Trophy size={20} /></span><div><b>{stats.finished}</b><span>Terminaron el curso</span></div></div>
          </div>

          <div className="adm-weeks">
            {stats.perWeek.map((w) => (
              <button key={w.n} className={`adm-week ${filter === `done-${w.n}` ? "on" : ""}`}
                onClick={() => setFilter(filter === `done-${w.n}` ? "all" : `done-${w.n}`)}>
                <small>Semana {w.n}</small>
                <b>{WEEK_TITLES[w.n]}</b>
                <div className="adm-week-bar"><i style={{ width: `${stats.total ? (w.done / stats.total) * 100 : 0}%` }} /></div>
                <em>{w.done}/{stats.total} completaron · {w.started} empezaron</em>
              </button>
            ))}
          </div>

          <div className="adm-toolbar">
            <label className="adm-search">
              <Search size={16} strokeWidth={2.4} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, key o email" />
            </label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Todos</option>
              <optgroup label="Estado">
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </optgroup>
              <optgroup label="Completaron">
                {WEEKS.map((n) => <option key={n} value={`done-${n}`}>Completaron Semana {n}</option>)}
              </optgroup>
              <optgroup label="Les falta">
                {WEEKS.map((n) => <option key={n} value={`pend-${n}`}>No han terminado Semana {n}</option>)}
              </optgroup>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Orden: nombre</option>
              <option value="progress">Orden: más avance</option>
              <option value="xp">Orden: más XP</option>
              <option value="login">Orden: ingreso reciente</option>
            </select>
            <span className="adm-count">{list.length} de {students.length}</span>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Estado</th>
                  <th>Último ingreso</th>
                  {WEEKS.map((n) => <th key={n} className="c">S{n}</th>)}
                  <th className="c">Global</th>
                  <th className="c">XP</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.key} onClick={() => setSelectedKey(s.key)}>
                    <td>
                      <div className="adm-name"><b>{s.name}</b><small>{s.key}</small></div>
                    </td>
                    <td><span className={`adm-status ${s.status}`}>{STATUS[s.status].label}</span></td>
                    <td className="adm-login">{timeAgo(s.lastLogin)}</td>
                    {WEEKS.map((n) => <td key={n} className="c"><PctPill row={s.weeks[n]} /></td>)}
                    <td className="c">
                      <div className="adm-global"><div className="adm-global-bar"><i style={{ width: `${s.overall}%` }} /></div><b>{s.overall}%</b></div>
                    </td>
                    <td className="c adm-num">{s.xp}</td>
                    <td className="c"><ChevronRight size={18} strokeWidth={2.4} className="adm-chev" /></td>
                  </tr>
                ))}
                {!list.length && (
                  <tr className="no-hover"><td colSpan={12} className="adm-empty-row">Ningún estudiante coincide con el filtro.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};