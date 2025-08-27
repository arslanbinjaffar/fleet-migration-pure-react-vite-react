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
			// Fleet Management specific colors
			fleet: {
				primary: 'var(--fleet-primary)',
				secondary: 'var(--fleet-secondary)',
				accent: 'var(--fleet-accent)',
				'card-bg': 'var(--fleet-card-bg)',
				'card-border': 'var(--fleet-card-border)',
				'status-active': 'var(--fleet-status-active)',
				'status-inactive': 'var(--fleet-status-inactive)',
				'status-maintenance': 'var(--fleet-status-maintenance)',
				'attachment-bg': 'var(--fleet-attachment-bg)',
				'attachment-border': 'var(--fleet-attachment-border)',
				'sticker-bg': 'var(--fleet-sticker-bg)',
				'sticker-border': 'var(--fleet-sticker-border)',
				'form-section-bg': 'var(--fleet-form-section-bg)',
				'form-section-border': 'var(--fleet-form-section-border)',
				'hover-bg': 'var(--fleet-hover-bg)',
				'selected-bg': 'var(--fleet-selected-bg)',
				'grid-border': 'var(--fleet-grid-border)',
				'table-header-bg': 'var(--fleet-table-header-bg)',
				'pagination-bg': 'var(--fleet-pagination-bg)',
				'filter-bg': 'var(--fleet-filter-bg)',
				'export-bg': 'var(--fleet-export-bg)',
				'danger-bg': 'var(--fleet-danger-bg)',
				'danger-border': 'var(--fleet-danger-border)',
				'success-bg': 'var(--fleet-success-bg)',
				'success-border': 'var(--fleet-success-border)',
				'warning-bg': 'var(--fleet-warning-bg)',
				'warning-border': 'var(--fleet-warning-border)',
				'info-bg': 'var(--fleet-info-bg)',
				'info-border': 'var(--fleet-info-border)'
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
  