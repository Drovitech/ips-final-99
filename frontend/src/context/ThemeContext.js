import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  // Cargar preferencia guardada
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const initial = saved === "true";
    setDarkMode(initial);
  }, []);

  // Aplicar clase al body + guardar
  useEffect(() => {
    if (darkMode) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");

    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const value = useMemo(
    () => ({
      darkMode,
      setDarkMode,
      toggleDarkMode: () => setDarkMode((v) => !v),
    }),
    [darkMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
}