import { useEffect, useState } from 'react';

const useDarkMode = () => {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        const root = document.documentElement;

        if (isDark) {
            root.classList.add('dark');
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleDarkMode = () => setIsDark(!isDark);

    return [isDark, toggleDarkMode];
};

export default useDarkMode;
