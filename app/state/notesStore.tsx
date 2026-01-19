import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { Alert } from "react-native";
import { fetchSeedNotes } from "../api/notesApi";

export type NoteLocation = {
  latitude: number;
  longitude: number;
};

export type Note = {
  id: string;
  title: string;
  description: string;
  createdAt: string; // ISO
  location?: NoteLocation;
  photoUri?: string;
  synced?: boolean; // whether POST/PATCH succeeded
};

type State = {
  notes: Note[];
  isLoading: boolean;
  lastError?: string;
};

type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: Note[] }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "UPSERT"; payload: Note }
  | { type: "REMOVE"; payload: { id: string } };

const initialState: State = {
  notes: [],
  isLoading: true,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, isLoading: true, lastError: undefined };
    case "LOAD_SUCCESS":
      return { ...state, isLoading: false, notes: action.payload, lastError: undefined };
    case "LOAD_ERROR":
      return { ...state, isLoading: false, lastError: action.payload };
    case "UPSERT": {
      const exists = state.notes.some((n) => n.id === action.payload.id);
      const next = exists
        ? state.notes.map((n) => (n.id === action.payload.id ? action.payload : n))
        : [action.payload, ...state.notes];
      return { ...state, notes: next };
    }
    case "REMOVE":
      return { ...state, notes: state.notes.filter((n) => n.id !== action.payload.id) };
    default:
      return state;
  }
}

type NotesContextValue = {
  state: State;
  upsert: (note: Note) => void;
  remove: (id: string) => void;
  reload: () => Promise<void>;
  getById: (id: string) => Note | undefined;
};

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const reload = async () => {
    dispatch({ type: "LOAD_START" });
    try {
      const seed = await fetchSeedNotes();
      dispatch({ type: "LOAD_SUCCESS", payload: seed });
    } catch (e) {
      const msg = "Nie udało się pobrać notatek z API. Sprawdź internet.";
      dispatch({ type: "LOAD_ERROR", payload: msg });
      Alert.alert("Błąd", msg);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<NotesContextValue>(
    () => ({
      state,
      upsert: (note) => dispatch({ type: "UPSERT", payload: note }),
      remove: (id) => dispatch({ type: "REMOVE", payload: { id } }),
      reload,
      getById: (id) => state.notes.find((n) => n.id === id),
    }),
    [state]
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within NotesProvider");
  return ctx;
}
