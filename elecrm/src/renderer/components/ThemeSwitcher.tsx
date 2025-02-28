import React, { useEffect, useState } from "react";
import SunIcon from "./SunIcon";
import MoonIcon from "./MoonIcon";

const getStoredTheme = () => localStorage.getItem("theme");
const setStoredTheme = (theme: string) => localStorage.setItem("theme", theme);

const getPreferredTheme = () => {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    return storedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (theme: string) => {
  document.documentElement.setAttribute("data-theme", theme);
};

const ThemeSwitcher = () => {
  const [theme, setThemeState] = useState<string>(getPreferredTheme());

  useEffect(() => {
    const storedTheme = getStoredTheme();
    if (storedTheme) {
      setThemeState(storedTheme);
      applyTheme(storedTheme);
    } else {
      applyTheme(theme);
    }

    // Listen for theme changes from shared state if in Electron
    if (window.electronAPI) {
      window.electronAPI.onSharedState((state) => {
        if (state.theme && state.theme !== theme) {
          setThemeState(state.theme);
          applyTheme(state.theme);
          setStoredTheme(state.theme);
        }
      });
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
    setStoredTheme(theme);
    
    // Update shared state if in Electron
    if (window.electronAPI) {
      window.electronAPI.updateSharedState({ theme });
    }
  }, [theme]);

  const toggleTheme = (newTheme: string) => {
    setThemeState(newTheme);
  };

  return (
    <div className="flex align-middle justify-center px-8 my-4">
      <button
        className={`mr-4 ${
          theme === "light" ? "text-titleBarBg" : "text-text"
        }`}
        onClick={() => toggleTheme("light")}
        style={{ background: "none" }} // Ensure the background is transparent
      >
        <SunIcon />
      </button>
      <button
        className={` ${theme === "dark" ? "text-titleBarBg" : "text-text"}`}
        onClick={() => toggleTheme("dark")}
        style={{ background: "none" }} // Ensure the background is transparent
      >
        <MoonIcon />
      </button>
    </div>
  );
};

export default ThemeSwitcher;
