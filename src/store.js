import { mergeRows } from "./progressSync";

export const initialStore = () => {
  return {
    message: null,
    semanas: {},   // { [Semana]: fila_de_progreso }
    sync: {},      // { [Semana]: "saving" | "saved" | "offline" }
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    // MERGE: una fila nueva NUNCA borra lo que ya estaba (checklist, respuestas, puntos)
    case 'save_progreso': {
      const sem = action.payload.Semana;
      return {
        ...store,
        semanas: { ...store.semanas, [sem]: mergeRows(store.semanas[sem], action.payload) },
      };
    }

    // Lo usan todavía los Periodos
    case 'rollback_progreso': {
      const next = { ...store.semanas };
      if (action.payload.prev) next[action.payload.Semana] = action.payload.prev;
      else delete next[action.payload.Semana];
      return { ...store, semanas: next };
    }

    // Antes REEMPLAZABA todo con filas "light" (sin JSON) → ahora une
    case 'set_semanas': {
      const next = { ...store.semanas };
      Object.entries(action.payload || {}).forEach(([sem, row]) => {
        next[sem] = mergeRows(row, next[sem]);
      });
      return { ...store, semanas: next };
    }

    case 'sync_status':
      return { ...store, sync: { ...store.sync, [action.payload.semana]: action.payload.status } };

    default:
      return store;
  }
}