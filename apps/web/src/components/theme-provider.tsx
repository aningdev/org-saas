import { ScriptOnce } from "@tanstack/solid-router";
import { createContext, createEffect, createSignal, useContext, type ParentProps } from "solid-js";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = ParentProps<{
  defaultTheme?: Theme;
  storageKey?: string;
}>;

type ThemeProviderState = {
  theme: () => Theme;
  setTheme: (theme: Theme) => void;
};

const THEME_STORAGE_EVENT = "theme-storage-change";

function getStoredTheme(storageKey: string, defaultTheme: Theme): Theme {
  const stored = localStorage.getItem(storageKey);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : defaultTheme;
}

function getThemeScript(storageKey: string, defaultTheme: Theme) {
  const key = JSON.stringify(storageKey);
  const fallback = JSON.stringify(defaultTheme);

  return `(function(){try{var t=localStorage.getItem(${key});if(t!=='light'&&t!=='dark'&&t!=='system'){t=${fallback}}var d=matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='system'?(d?'dark':'light'):t;var e=document.documentElement;e.classList.add(r);e.style.colorScheme=r}catch(e){}})();`;
}

const ThemeProviderContext = createContext<ThemeProviderState>();

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");

  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

export function ThemeProvider(props: ThemeProviderProps) {
  const storageKey = () => props.storageKey ?? "theme";
  const defaultTheme = () => props.defaultTheme ?? "system";

  const [theme, setThemeSignal] = createSignal<Theme>(
    typeof window === "undefined" ? defaultTheme() : getStoredTheme(storageKey(), defaultTheme()),
  );

  createEffect(
    () => theme(),
    (current) => {
      applyTheme(current);
    },
  );

  createEffect(
    () => theme(),
    (current) => {
      if (current !== "system") return;

      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => applyTheme("system");
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
  );

  createEffect(
    () => ({ key: storageKey(), fallback: defaultTheme() }),
    ({ key, fallback }) => {
      const onStorage = () => {
        setThemeSignal(getStoredTheme(key, fallback));
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener(THEME_STORAGE_EVENT, onStorage);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(THEME_STORAGE_EVENT, onStorage);
      };
    },
  );

  const setTheme = (next: Theme) => {
    localStorage.setItem(storageKey(), next);
    setThemeSignal(next);
    window.dispatchEvent(new Event(THEME_STORAGE_EVENT));
  };

  return (
    <ThemeProviderContext value={{ theme, setTheme }}>
      <ScriptOnce>{getThemeScript(storageKey(), defaultTheme())}</ScriptOnce>
      {props.children}
    </ThemeProviderContext>
  );
}

export function useTheme() {
  return useContext(ThemeProviderContext);
}
