export class Header {
    constructor(callbacks = {}) {
        this.callbacks = callbacks;
        this.alwaysOnTopBtn = document.getElementById('alwaysOnTopBtn');
        this.themeBtn = document.getElementById('themeBtn');
        this.minimizeBtn = document.getElementById('minimizeBtn');
        this.closeBtn = document.getElementById('closeBtn');
        
        // Revolving text elements
        this.brandTitle = document.getElementById('brandTitle');
        
        this.revolveInterval = null;
        this.revolveIndex = 0;

        this.attachHandlers();
        
        if (this.brandTitle) {
            this.startRevolvingText();
        }
    }

    attachHandlers() {

        if (this.minimizeBtn) {
            this.minimizeBtn.addEventListener('click', () => window.electronAPI.minimizeWindow());
        }

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => window.electronAPI.closeWindow());
        }

        if (this.alwaysOnTopBtn) {
            this.alwaysOnTopBtn.addEventListener('click', async () => {
                const newState = await window.electronAPI.toggleAlwaysOnTop();
                this.updateAlwaysOnTopButton(newState);
            });
        }

        if (this.themeBtn) {
            this.themeBtn.addEventListener('click', () => {
                if (this.callbacks.onThemeToggle) this.callbacks.onThemeToggle();
            });
        }
    }
    
    startRevolvingText() {
        this.revolveIndex = 0;
        this.updateRevolvingText();
        this.revolveInterval = setInterval(() => {
            this.revolveIndex = (this.revolveIndex + 1) % 4;
            this.updateRevolvingText();
        }, 3000);
    }
    
    updateRevolvingText() {
        this.brandTitle.style.opacity = '0';
        
        setTimeout(() => {
            switch(this.revolveIndex) {
                case 0:
                    this.brandTitle.innerText = "flost8";
                    break;
                case 1:
                    const dateOpts = { month: 'long', day: 'numeric', year: 'numeric' };
                    this.brandTitle.innerText = new Date().toLocaleDateString(undefined, dateOpts);
                    break;
                case 2:
                    const timeOpts = { hour: 'numeric', minute: '2-digit' };
                    this.brandTitle.innerText = new Date().toLocaleTimeString(undefined, timeOpts);
                    break;
                case 3:
                    const count = this.callbacks.getTaskCount ? this.callbacks.getTaskCount() : 0;
                    this.brandTitle.innerText = `${count} pending`;
                    break;
            }
            
            this.brandTitle.style.opacity = '1';
        }, 150);
    }

    updateAlwaysOnTopButton(isAlwaysOnTop) {
        if (!this.alwaysOnTopBtn) return;
        
        if (isAlwaysOnTop) {
            this.alwaysOnTopBtn.title = 'Always On Top (Enabled)';
            this.alwaysOnTopBtn.classList.add('bg-blue-500/20', 'text-blue-500');
        } else {
            this.alwaysOnTopBtn.title = 'Always On Top (Disabled)';
            this.alwaysOnTopBtn.classList.remove('bg-blue-500/20', 'text-blue-500');
        }
    }

    applyTheme(theme) {
        const html = document.documentElement;
        const app = document.getElementById('app');

        if (theme === 'dark') {
            html.classList.add('dark');
            app.classList.remove('glass-light');
            app.classList.add('glass-dark');
        } else {
            html.classList.remove('dark');
            app.classList.remove('glass-dark');
            app.classList.add('glass-light');
        }
    }
}
