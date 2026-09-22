export const initialStore = () => {
  return {
    message: null,
    semanas: {},   // { [Semana]: fila_de_progreso }  ← lo que lee el dashboard / Fluency Meter
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    // OPTIMISTA: mete/actualiza la fila de una semana al instante
    case 'save_progreso':
      return {
        ...store,
        semanas: { ...store.semanas, [action.payload.Semana]: action.payload },
      };

    // ROLLBACK: si el fetch falla, restauramos la fila anterior (o la quitamos si no existía)
    case 'rollback_progreso': {
      const next = { ...store.semanas };
      if (action.payload.prev) next[action.payload.Semana] = action.payload.prev;
      else delete next[action.payload.Semana];
      return { ...store, semanas: next };
    }

    // Sembrar todas las semanas de una (al cargar el dashboard la primera vez)
    case 'set_semanas':
      return { ...store, semanas: action.payload };

    default:
      return store;   // no lanzamos error: en optimistic UI un throw te tumba la pantalla
  }
}