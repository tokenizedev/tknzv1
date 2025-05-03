/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'cyber': ['SAIBA-45', 'sans-serif'],
        'cyber-outline': ['SAIBA-45-Outline', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'code': ['Consolas', 'Monaco', 'monospace'],
        'terminal': ['VT323', 'Consolas', 'Monaco', 'monospace'],
      },
      colors: {
        // Terminal-inspired cypherpunk color palette matching the leaderboard
        'cyber-black': '#000000',
        'cyber-dark': '#040f09',
        'cyber-gray': '#0c1a12',
        'cyber-green': '#00ff41', // Bright terminal green seen in leaderboard
        'cyber-green-dark': '#00b342',
        'cyber-blue': '#00d0ff',
        'cyber-blue-dark': '#0a84ff',
        'cyber-purple': '#ff00ff', // Pink/purple accent color
        'cyber-pink': '#ff3e84', // Alternative accent 
        'cyber-orange': '#ff3c00',
        'cyber-yellow': '#ffcc00',
        'cyber-white': '#e5e5e5',
        'terminal-green': '#0cff8d', // Slightly more blue-tinted green
        'usd-green': '#54d168', // For USD amounts
      },
      animation: {
        'glow': 'glow 1.5s ease-in-out infinite alternate',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'cyber-spin': 'spin 10s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'flicker': 'flicker 3s linear infinite',
        'glitch': 'glitch 1s linear infinite',
        'cryptographic': 'cryptographic 10s linear infinite',
        'binary-shift': 'binary-shift 20s linear infinite',
        'terminal-cursor': 'terminal-cursor 1s step-end infinite',
      },
      keyframes: {
        glow: {
          '0%': { 'text-shadow': '0 0 5px #00ff41, 0 0 10px #00ff41' },
          '100%': { 'text-shadow': '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': { opacity: '1' },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': { opacity: '0.5' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '33%': { transform: 'translate(-5px, 2px)' },
          '66%': { transform: 'translate(5px, -2px)' },
        },
        cryptographic: {
          '0%': { 'background-position': '0% 0%' },
          '100%': { 'background-position': '100% 0%' },
        },
        'binary-shift': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'terminal-cursor': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(0, 255, 65, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.05) 1px, transparent 1px)', 
        'binary-pattern': 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ctext x=\'0\' y=\'15\' fill=\'rgba(0,255,65,0.07)\' font-size=\'10\' font-family=\'monospace\'%3E10101010101010%3C/text%3E%3C/svg%3E")',
        'hash-pattern': 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ctext x=\'0\' y=\'15\' fill=\'rgba(0,255,65,0.05)\' font-size=\'8\' font-family=\'monospace\'%3Ea1b2c3d4e5f6a7b8%3C/text%3E%3C/svg%3E")',
        'terminal-gradient': 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,20,10,0.9) 100%)',
        'leaderboard-border': 'linear-gradient(90deg, rgba(0,255,65,0.1) 0%, rgba(0,255,65,0.3) 10%, rgba(0,255,65,0.3) 90%, rgba(0,255,65,0.1) 100%)',
      },
      boxShadow: {
        'neon-green': '0 0 5px #00ff41, 0 0 10px #00ff41',
        'neon-blue': '0 0 5px #00d0ff, 0 0 10px #00d0ff',
        'neon-pink': '0 0 5px #ff3e84, 0 0 10px #ff3e84',
        'neon-purple': '0 0 5px #ff00ff, 0 0 10px #ff00ff',
        'terminal': '0 0 0 1px #00ff41, 0 0 10px rgba(0, 255, 65, 0.4) inset',
        'leaderboard': '0 0 20px rgba(0, 255, 65, 0.3), 0 0 10px rgba(255, 0, 255, 0.1) inset',
      },
      borderWidth: {
        '1': '1px',
      },
    },
  },
  plugins: [],
};
