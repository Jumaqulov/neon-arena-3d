"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { BOOKING, SEATS, type ZoneId } from "@/lib/data";

/**
 * Home booking state, shared by the zone cards ("Band qilish" pre-selects a zone) and the
 * #booking section (seat map + form). Pure client state — nothing is sent anywhere.
 */
export interface BookingState {
  zone: ZoneId;
  seat: string | null;
  hours: number;
  players: number;
  /** yyyy-mm-dd from <input type="date">, "" when not chosen */
  date: string;
  time: string;
  confirmed: boolean;
}

type Action =
  | { type: "zone"; zone: ZoneId }
  | { type: "seat"; id: string }
  | { type: "hours"; delta: 1 | -1 }
  | { type: "players"; delta: 1 | -1 }
  | { type: "date"; value: string }
  | { type: "time"; value: string }
  | { type: "confirm" }
  | { type: "reset" };

const INITIAL: BookingState = {
  zone: "standart",
  seat: BOOKING.defaultSeat,
  hours: BOOKING.hours.default,
  players: BOOKING.players.default,
  date: "",
  time: BOOKING.defaultTime,
  confirmed: false,
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function reducer(s: BookingState, a: Action): BookingState {
  switch (a.type) {
    case "zone": {
      // keep the chosen seat only if it belongs to the new zone
      const keep = SEATS.some((d) => d.id === s.seat && d.zone === a.zone) ? s.seat : null;
      return { ...s, zone: a.zone, seat: keep, confirmed: false };
    }
    case "seat": {
      const def = SEATS.find((d) => d.id === a.id);
      if (!def || def.occupied) return s;
      if (s.seat === a.id) return { ...s, seat: null };
      return { ...s, seat: a.id, zone: def.zone };
    }
    case "hours":
      return { ...s, hours: clamp(s.hours + a.delta, BOOKING.hours.min, BOOKING.hours.max) };
    case "players":
      return { ...s, players: clamp(s.players + a.delta, BOOKING.players.min, BOOKING.players.max) };
    case "date":
      return { ...s, date: a.value };
    case "time":
      return { ...s, time: a.value };
    case "confirm":
      return s.seat ? { ...s, confirmed: true } : s;
    case "reset":
      return { ...INITIAL, seat: null };
    default:
      return s;
  }
}

export interface BookingActions {
  pickZone: (zone: ZoneId) => void;
  pickSeat: (id: string) => void;
  changeHours: (delta: 1 | -1) => void;
  changePlayers: (delta: 1 | -1) => void;
  setDate: (value: string) => void;
  setTime: (value: string) => void;
  confirm: () => void;
  reset: () => void;
}

interface BookingContextValue extends BookingActions {
  state: BookingState;
}

const BookingStateContext = createContext<BookingState | null>(null);
/** actions never change identity, so action-only consumers (zone cards) never re-render */
const BookingActionsContext = createContext<BookingActions | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const actions = useMemo<BookingActions>(
    () => ({
      pickZone: (zone) => dispatch({ type: "zone", zone }),
      pickSeat: (id) => dispatch({ type: "seat", id }),
      changeHours: (delta) => dispatch({ type: "hours", delta }),
      changePlayers: (delta) => dispatch({ type: "players", delta }),
      setDate: (value) => dispatch({ type: "date", value }),
      setTime: (value) => dispatch({ type: "time", value }),
      confirm: () => dispatch({ type: "confirm" }),
      reset: () => dispatch({ type: "reset" }),
    }),
    [],
  );

  return (
    <BookingActionsContext.Provider value={actions}>
      <BookingStateContext.Provider value={state}>{children}</BookingStateContext.Provider>
    </BookingActionsContext.Provider>
  );
}

export function useBookingActions(): BookingActions {
  const actions = useContext(BookingActionsContext);
  if (!actions) throw new Error("useBookingActions must be used inside <BookingProvider>");
  return actions;
}

export function useBooking(): BookingContextValue {
  const state = useContext(BookingStateContext);
  const actions = useBookingActions();
  if (!state) throw new Error("useBooking must be used inside <BookingProvider>");
  return { state, ...actions };
}
