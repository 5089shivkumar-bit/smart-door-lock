export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#2563eb',
                secondary: '#3b82f6',
                accent: '#6366f1',
                dark: {
                    DEFAULT: '#0f172a',
                    lighter: '#1e293b',
                    border: '#334155'
                }
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'scan': 'scan 2s linear infinite',
            },
            keyframes: {
                scan: {
                    '0%': { top: '0%' },
                    '100%': { top: '100%' }
                }
            }
        },
    },
    plugins: [],
}
