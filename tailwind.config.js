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
        'cyber-black': '#0c0c0c',
        'cyber-dark': '#121212',
        'cyber-gray': '#0c1a12',
        'cyber-green': '#00ff41', // Bright terminal green seen in leaderboard
        'cyber-green-dark': '#00b342',
        'cyber-blue': '#0ff0fc',
        'cyber-blue-dark': '#0a84ff',
        'cyber-purple': '#d57eeb',
        'cyber-pink': '#ff206e', // Alternative accent 
        'cyber-orange': '#ff3c00',
        'cyber-yellow': '#ffcc00',
        'cyber-white': '#e5e5e5',
        'terminal-green': '#0cff8d', // Slightly more blue-tinted green
        'usd-green': '#2cca73', // For USD amounts
      },
      animation: {
        'glow': 'glow 1.5s ease-in-out infinite alternate',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'cyber-spin': 'spin 10s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'flicker': 'flicker 3s linear infinite',
        'glitch': 'glitch 1s linear infinite',
        'glitch-text': 'glitch-text 0.4s ease-in-out',
        'cryptographic': 'cryptographic 10s linear infinite',
        'binary-shift': 'binary-shift 20s linear infinite',
        'terminal-cursor': 'terminal_blink 1s step-end infinite',
        'matrix-code': 'matrix 20s linear infinite',
        'matrix-rain': 'matrix-rain 20s linear infinite',
        'scanline': 'scanline 2s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // New animations for loading screen
        'spin-slow': 'spin 8s linear infinite',
        'spin-reverse-slow': 'spin 6s linear infinite reverse',
        'typing': 'typing 3s steps(40, end)',
        'typing-delay-1': 'typing 3s 1s steps(40, end)',
        'typing-delay-2': 'typing 3s 2s steps(40, end)',
        'blink-code': 'blink-code 1.5s infinite',
        // Scale-in animation for loader
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in-delayed': 'scale-in 0.5s 0.1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-scale-in': 'fade-scale-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-delayed': 'fade-in 0.4s 0.2s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out forwards',
        'slide-down': 'slide-down 0.3s ease-out forwards',
        'glitch-in': 'glitch-in 0.5s ease-out forwards',
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
        'glitch-text': {
          '0%': { 
            'text-shadow': '-2px 0 #ff206e, 2px 0 #0ff0fc',
            'transform': 'translate(0)'
          },
          '20%': { 
            'text-shadow': '-1px 0 #ff206e, 1px 0 #0ff0fc',
            'transform': 'translate(-2px, 1px)'
          },
          '40%': { 
            'text-shadow': '1px 0 #00ff41, -1px 0 #d57eeb',
            'transform': 'translate(2px, 0)'
          },
          '60%': { 
            'text-shadow': '2px 0 #00ff41, -1px 0 #d57eeb',
            'transform': 'translate(0)'
          },
          '80%': { 
            'text-shadow': '0 0 #00ff41, 0 0 #ffffff',
            'transform': 'translate(-1px, 1px)'
          },
          '100%': { 
            'text-shadow': '0 0 #00ff41, 0 0 #ffffff',
            'transform': 'translate(0)'
          },
        },
        cryptographic: {
          '0%': { 'background-position': '0% 0%' },
          '100%': { 'background-position': '100% 0%' },
        },
        'binary-shift': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        terminal_blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        matrix: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'matrix-rain': {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        scanline: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        // New keyframes for loading screen
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' }
        },
        'blink-code': {
          '0%, 100%': { 'box-shadow': '0 0 15px rgba(0, 255, 65, 0.7)' },
          '50%': { 'box-shadow': '0 0 5px rgba(0, 255, 65, 0.3)' }
        },
        // Scale-in animation keyframes
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'fade-scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '30%': { opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'glitch-in': {
          '0%': { 
            transform: 'translate(-5px, 0)', 
            opacity: '0',
            filter: 'blur(2px)'
          },
          '25%': { 
            transform: 'translate(5px, 0)', 
            opacity: '0.5',
            filter: 'blur(0)'
          },
          '50%': { 
            transform: 'translate(-2px, 0)', 
            opacity: '0.7',
            filter: 'blur(1px)'
          },
          '75%': { 
            transform: 'translate(2px, 0)', 
            opacity: '0.9',
            filter: 'blur(0)'
          },
          '100%': { 
            transform: 'translate(0)', 
            opacity: '1',
            filter: 'blur(0)'
          }
        }
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(0, 255, 65, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.05) 1px, transparent 1px)', 
        'binary-pattern': 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ctext x=\'0\' y=\'15\' fill=\'rgba(0,255,65,0.07)\' font-size=\'10\' font-family=\'monospace\'%3E10101010101010%3C/text%3E%3C/svg%3E")',
        'hash-pattern': 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ctext x=\'0\' y=\'15\' fill=\'rgba(0,255,65,0.05)\' font-size=\'8\' font-family=\'monospace\'%3Ea1b2c3d4e5f6a7b8%3C/text%3E%3C/svg%3E")',
        'terminal-gradient': 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,20,10,0.9) 100%)',
        'leaderboard-border': 'linear-gradient(90deg, rgba(0,255,65,0.1) 0%, rgba(0,255,65,0.3) 10%, rgba(0,255,65,0.3) 90%, rgba(0,255,65,0.1) 100%)',
        'cyberpunk-radial': 'radial-gradient(circle at center, rgba(0,255,65,0.2) 0%, transparent 70%)',
        'scanlines': 'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)',
      },
      boxShadow: {
        'neon-green': '0 0 5px rgba(0, 255, 65, 0.5)',
        'neon-blue': '0 0 5px rgba(15, 240, 252, 0.5)',
        'neon-pink': '0 0 5px #ff3e84, 0 0 10px #ff3e84',
        'neon-purple': '0 0 5px rgba(213, 126, 235, 0.5)',
        'terminal': '0 0 10px rgba(0, 255, 65, 0.3), inset 0 0 2px rgba(0, 255, 65, 0.5)',
        'leaderboard': '0 0 15px rgba(0, 0, 0, 0.7), 0 0 5px rgba(0, 255, 65, 0.3)',
        'pulse-green': '0 0 5px rgba(0, 255, 65, 0.7), 0 0 15px rgba(0, 255, 65, 0.5)',
      },
      borderWidth: {
        '1': '1px',
      },
      textShadow: {
        'glow-green': '0 0 5px #00ff41, 0 0 10px #00ff41',
        'glow-purple': '0 0 5px #d57eeb, 0 0 10px #d57eeb',
        'glow-blue': '0 0 5px #0ff0fc, 0 0 10px #0ff0fc',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-glow-green': {
          'text-shadow': '0 0 5px rgba(0, 255, 65, 0.5), 0 0 10px rgba(0, 255, 65, 0.3)'
        },
        '.text-glow-purple': {
          'text-shadow': '0 0 5px rgba(213, 126, 235, 0.5), 0 0 10px rgba(213, 126, 235, 0.3)'
        },
        '.text-glow-blue': {
          'text-shadow': '0 0 5px rgba(15, 240, 252, 0.5), 0 0 10px rgba(15, 240, 252, 0.3)'
        },
        '.glow-text-green': {
          'text-shadow': '0 0 5px #00ff41, 0 0 10px #00ff41'
        }
      }
      addUtilities(newUtilities)
    }
  ],
};
