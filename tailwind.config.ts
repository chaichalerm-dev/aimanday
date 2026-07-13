import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/contexts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Prompt covers Thai + Latin — fallback to system sans
        sans: ['var(--font-prompt)', 'Prompt', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Slightly larger base for Thai readability
        base: ['15px', { lineHeight: '1.75' }],
        sm:   ['13.5px', { lineHeight: '1.7' }],
        xs:   ['12px',   { lineHeight: '1.6' }],
      },
      lineHeight: {
        // Thai stacked characters (tone marks, vowels) need generous line height
        thai: '1.8',
      },
    },
  },
  plugins: [],
};

export default config;
