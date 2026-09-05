import { createContext, useContext, useEffect, useState } from "react";

const THEMES = [
  { id: "forest", label: "Forest", swatch: "#2D5F3F" },
  { id: "ocean", label: "Ocean", swatch: "#1E5A8A" },
  { id: "sunset", label: "Sunset", swatch: "#C2410C" },
  { id: "lavender", label: "Lavender", swatch: "#6B46A6" },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem("theme") || "forest",
  );

  useEffect(() => {
    if (theme === "forest") {
      document.documentElement.removeAttribute("data-theme"); // forest is the default @theme block, no override needed
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const setTheme = (newTheme) => {
    localStorage.setItem("theme", newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
