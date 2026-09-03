"use client";

import * as React from "react";

const THEME_KEY = "theme-pref";

function getInitialTheme(): "light" | "dark" {
	if (typeof window === "undefined") return "light";
	try {
		const saved = window.localStorage.getItem(THEME_KEY);
		if (saved === "dark" || saved === "light") return saved;
	} catch {}
	return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
	const [theme, setTheme] = React.useState<"light" | "dark">("light");
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setTheme(getInitialTheme());
		setMounted(true);
	}, []);

	const onClick = React.useCallback(() => {
		const root = document.documentElement;
		const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
		root.setAttribute("data-theme", next);
		try {
			window.localStorage.setItem(THEME_KEY, next);
		} catch {}
		setTheme(next);
	}, []);

	return (
		<button
			type="button"
			className="theme-toggle"
			aria-label="Toggle dark mode"
			aria-pressed={mounted ? theme === "dark" : undefined}
			data-theme-toggle
			onClick={onClick}
		>
			<svg
				className="icon-sun"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<circle cx="12" cy="12" r="4" />
				<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
			</svg>
			<svg
				className="icon-moon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
			</svg>
		</button>
	);
}
