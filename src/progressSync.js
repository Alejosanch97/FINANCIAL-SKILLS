/* =====================================================================
   GUARDADO A PRUEBA DE PÉRDIDAS
   - mergeRows: une dos versiones de una semana sin perder nada
   - localStorage: copia local de todo el progreso + cola de pendientes
   - cola por semana: envía en orden, reintenta si falla
   ===================================================================== */

export const WEEK_TOTALS = { 1: 6, 2: 6, 3: 8, 4: 7, 5: 7, 6: 7 };

const num = (v) => parseFloat(v || 0) || 0;
const parseJ = (s) => {
  if (!s) return {};
  if (typeof s === "object") return s;
  try { return JSON.parse(s); } catch { return {}; }
};

export function mergeRows(oldRow, newRow) {
  if (!oldRow) return newRow;
  if (!newRow) return oldRow;
  const out = { ...oldRow, ...newRow };

  const c1 = parseJ(oldRow.Checklist_JSON), c2 = parseJ(newRow.Checklist_JSON);
  const chk = { ...c1 };
  Object.keys(c2).forEach((k) => { chk[k] = !!(c1[k] || c2[k]); });
  if (oldRow.Checklist_JSON || newRow.Checklist_JSON) out.Checklist_JSON = JSON.stringify(chk);

  if (oldRow.Respuestas_JSON || newRow.Respuestas_JSON) {
    out.Respuestas_JSON = JSON.stringify({ ...parseJ(oldRow.Respuestas_JSON), ...parseJ(newRow.Respuestas_JSON) });
  }

  ["Puntos_Comportamiento", "Puntos_Quizzes", "Puntos_Aprendi"].forEach((k) => {
    out[k] = Math.max(num(oldRow[k]), num(newRow[k]));
  });

  const total = WEEK_TOTALS[String(out.Semana)];
  const done = Object.values(chk).filter(Boolean).length;
  const pctChk = total ? Math.round((done / total) * 100) : 0;
  out.Porcentaje = Math.min(100, Math.max(num(oldRow.Porcentaje), num(newRow.Porcentaje), pctChk));

  const wasDone = [oldRow.Estado, newRow.Estado].some((e) => String(e || "").toLowerCase() === "completed");
  out.Estado = wasDone || out.Porcentaje >= 100 ? "completed" : (newRow.Estado || oldRow.Estado || "in_progress");
  return out;
}

/* ---------- localStorage ---------- */
const CACHE = (k) => `finProgress_${k}`;
const PENDING = (k) => `finPending_${k}`;
const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; } };
const write = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.warn("localStorage lleno:", e); } };

export const loadCache = (studentKey) => read(CACHE(studentKey));
export const saveCache = (studentKey, semanas) => write(CACHE(studentKey), semanas || {});
export const hasPending = (studentKey) => Object.keys(read(PENDING(studentKey))).length > 0;

/* ---------- cola de envío ---------- */
let _api = null, _dispatch = null, _student = null;
const inFlight = {}, retryTimer = {}, attempts = {};

const setStatus = (semana, status) =>
  _dispatch && _dispatch({ type: "sync_status", payload: { semana: String(semana), status } });

export function queueSave(API_URL, row, dispatch) {
  if (API_URL) _api = API_URL;
  if (dispatch) _dispatch = dispatch;
  const key = String(row.Student_Key);
  const sem = String(row.Semana);
  _student = key;

  // 1) Store al instante (el reducer hace merge)
  _dispatch && _dispatch({ type: "save_progreso", payload: row });

  // 2) Copia local inmediata (si cierran la pestaña, no se pierde)
  const cache = read(CACHE(key));
  cache[sem] = mergeRows(cache[sem], row);
  write(CACHE(key), cache);

  // 3) A la cola de pendientes y enviamos
  const pending = read(PENDING(key));
  pending[sem] = mergeRows(pending[sem], { ...row, _v: Date.now() });
  write(PENDING(key), pending);

  setStatus(sem, "saving");
  send(key, sem);
}

async function send(studentKey, sem) {
  if (inFlight[sem] || !_api) return;
  const row = read(PENDING(studentKey))[sem];
  if (!row) { setStatus(sem, "saved"); return; }

  inFlight[sem] = true;
  clearTimeout(retryTimer[sem]);
  const { _v, rowId, ...data } = row;

  try {
    const res = await fetch(_api, { method: "POST", body: JSON.stringify({ action: "save_progreso", data }) });
    const json = await res.json();
    if (json.status !== "success") throw new Error(json.message || "save failed");

    const now = read(PENDING(studentKey));
    if (now[sem] && now[sem]._v === _v) { delete now[sem]; write(PENDING(studentKey), now); }
    attempts[sem] = 0;
    inFlight[sem] = false;

    if (read(PENDING(studentKey))[sem]) send(studentKey, sem); // llegó algo nuevo mientras enviábamos
    else setStatus(sem, "saved");
  } catch (e) {
    console.warn(`Semana ${sem}: no se pudo subir, reintento…`, e);
    inFlight[sem] = false;
    attempts[sem] = (attempts[sem] || 0) + 1;
    setStatus(sem, "offline");
    retryTimer[sem] = setTimeout(() => send(studentKey, sem), Math.min(60000, 3000 * attempts[sem]));
  }
}

/* Reenvía lo que quedó pendiente (al abrir el dashboard o al volver internet) */
export function flushPending(API_URL, studentKey, dispatch) {
  _api = API_URL; _dispatch = dispatch; _student = String(studentKey);
  const p = read(PENDING(_student));
  Object.keys(p).forEach((sem) => { setStatus(sem, "saving"); send(_student, sem); });
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => { if (_student && _api) flushPending(_api, _student, _dispatch); });
}