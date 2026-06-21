export class Header {
    constructor(callbacks = {}) {
        this.callbacks = callbacks;
        this.alwaysOnTopBtn = document.getElementById('alwaysOnTopBtn');
        this.themeBtn = document.getElementById('themeBtn');
        this.minimizeBtn = document.getElementById('minimizeBtn');
        this.closeBtn = document.getElementById('closeBtn');

        this.attachHandlers();
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
