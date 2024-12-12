import React, { createContext, useState, useContext } from "react";

const ThemeContext = createContext({
    theme: "light",
    toggleTheme: () => {},
});

export const ThemeProvider: React.FC = ({ children: any }) => {
    const [theme, setTheme] = useState("light");

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
