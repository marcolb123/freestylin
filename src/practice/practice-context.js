import { createContext, useContext } from 'react';

// Two contexts on purpose.
//
// The beat changes up to 32 times a second at fast tempos with sixteenths. If
// it shared a context with the controls, every consumer would re-render on
// every click. Splitting it means only the count display pays that cost.
//
// Component-free module so the provider file exports only a component and
// React Fast Refresh keeps working — same reason as auth-context.js.

/** Controls and settings. Changes only when the dancer changes something. */
export const PracticeContext = createContext(null);

/** The current tick index, or null when stopped. Changes on every click. */
export const PracticeBeatContext = createContext(null);

export const usePractice = () => useContext(PracticeContext);
export const usePracticeBeat = () => useContext(PracticeBeatContext);
