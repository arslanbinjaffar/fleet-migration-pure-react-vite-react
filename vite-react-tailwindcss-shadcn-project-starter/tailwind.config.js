/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
    theme: {
    	extend: {
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			// Custom theme colors
    			theme: {
    				bg: 'var(--color-bg)',
    				text: 'var(--color-text)',
    				primary: 'var(--color-primary)',
    				secondary: 'var(--color-secondary)',
    				accent: 'var(--color-accent)',
    				success: 'var(--color-success)',
    				warning: 'var(--color-warning)',
    				error: 'var(--color-error)',
    				info: 'var(--color-info)',
    				muted: 'var(--color-muted)',
    				border: 'var(--color-border)',
    				input: 'var(--color-input)',
    				card: 'var(--color-card)',
    				shadow: 'var(--color-shadow)'
    			},
    			// Login specific colors
    			'login-bg': 'var(--login-bg)',
    			'login-card': 'var(--login-card)',
    			'form-border': 'var(--form-border)',
    			'form-focus': 'var(--form-focus)'
    		},
    		backgroundImage: {
    			'gradient-rainbow': 'linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-middle)), hsl(var(--gradient-end)))',
    			'gradient-login': 'linear-gradient(135deg, hsl(var(--gradient-start)) 0%, hsl(var(--gradient-middle)) 50%, hsl(var(--gradient-end)) 100%)'
    		}
    	}
    },
    plugins: [require("tailwindcss-animate")],
  }
  