import { createContext, useContext } from "react";

/** Jumps to the top of the page, through Lenis when smooth scroll is on. */
export const ScrollTopContext = createContext<() => void>(() => window.scrollTo(0, 0));

export function useScrollToTop() {
  return useContext(ScrollTopContext);
}
