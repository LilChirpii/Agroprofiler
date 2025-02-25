import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useContext } from "react";
const ThemeContext = createContext({
    theme: "light",
    toggleTheme: () => { },
});
export const ThemeProvider = ({ children: any }) => {
    const [theme, setTheme] = useState("light");
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };
    return (_jsx(ThemeContext.Provider, { value: { theme, toggleTheme }, children: children }));
};
export const useTheme = () => useContext(ThemeContext);
