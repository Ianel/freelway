class Storage {
    constructor() {
        this.key = CFG.storageKey;
    }

    save(data) {
        try {
            localStorage.setItem(this.key, JSON.stringify(data));
        } catch (e) {
            console.warn('LocalStorage save failed:', e);
        }
    }

    load() {
        try {
            const raw = localStorage.getItem(this.key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.warn('LocalStorage load failed:', e);
            return null;
        }
    }

    clear() {
        try {
            localStorage.removeItem(this.key);
        } catch (e) {
            console.warn('LocalStorage clear failed:', e);
        }
    }
}