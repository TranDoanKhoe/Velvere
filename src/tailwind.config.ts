import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                velvere: ['Didot', 'serif'],
            },
        },
    },
    plugins: [],
};

export default config;
