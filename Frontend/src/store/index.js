import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      usuario: null,
      token: null,
      
      setUsuario: (usuario, token) => {
        const currentToken = token || get().token;
        set({ usuario, token: currentToken });
      },
      
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        set({ usuario: null, token: null });
      },
      
      isAutenticado: () => {
        const state = get();
        return state.token && state.usuario;
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

export const useServiciosStore = create((set) => ({
  servicios: [],
  loading: false,
  error: null,
  
  setServicios: (servicios) => set({ servicios }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  agregarServicio: (servicio) =>
    set((state) => ({ servicios: [...state.servicios, servicio] })),
  
  eliminarServicio: (id) =>
    set((state) => ({
      servicios: state.servicios.filter((s) => s._id !== id),
    })),
}));

export const useRecordatoriosStore = create((set) => ({
  recordatorios: [],
  loading: false,
  error: null,
  filtroEstado: 'activo', // activo, completado, vencido, todos
  
  setRecordatorios: (recordatorios) => set({ recordatorios }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setFiltroEstado: (filtro) => set({ filtroEstado: filtro }),
  
  agregarRecordatorio: (recordatorio) =>
    set((state) => ({ recordatorios: [...state.recordatorios, recordatorio] })),
  
  actualizarRecordatorio: (id, datos) =>
    set((state) => ({
      recordatorios: state.recordatorios.map((r) =>
        r._id === id ? { ...r, ...datos } : r
      ),
    })),
  
  eliminarRecordatorio: (id) =>
    set((state) => ({
      recordatorios: state.recordatorios.filter((r) => r._id !== id),
    })),
  
  obtenerRecordatoriosFiltrados: () => {
    const state = useRecordatoriosStore.getState();
    if (state.filtroEstado === 'todos') {
      return state.recordatorios;
    }
    return state.recordatorios.filter((r) => r.estado === state.filtroEstado);
  },
}));

export const useConsejosStore = create((set) => ({
  consejos: [],
  analisisCompleto: null,
  loading: false,
  error: null,
  ultimaActualizacion: null,
  
  setConsejos: (consejos) => set({ consejos }),
  
  setAnalisisCompleto: (analisis) => set({ analisisCompleto: analisis }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setUltimaActualizacion: (fecha) => set({ ultimaActualizacion: fecha }),
  
  agregarConsejo: (consejo) =>
    set((state) => ({ consejos: [...state.consejos, consejo] })),
  
  limpiarConsejos: () => set({ consejos: [], analisisCompleto: null }),
}));


export const useConsultasStore = create((set) => ({
  resultado: null,
  loading: false,
  error: null,
  
  setResultado: (resultado) => set({ resultado }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  limpiar: () => set({ resultado: null, error: null }),
}));
