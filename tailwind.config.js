/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/renderer/**/*.{html,js}"],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                glass: {
                    light: 'rgba(255, 255, 255, 0.7)',
                    dark: 'rgba(20, 20, 25, 0.7)',
                    border: 'rgba(255, 255, 255, 0.1)',
                }
            },
            backdropBlur: {
                xs: '2px',
                xl: '24px',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'wiggle': 'wiggle 0.3s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                }
            }
        }
    },
    plugins: [],
}
