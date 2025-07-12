export class InputManager {
    private _keys: { [key: string]: boolean } = {};
    private _listeners: Map<string, Array<(pressed: boolean) => void>> = new Map();

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners() {
        window.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            if (!this._keys[key]) {
                this._keys[key] = true;
                this.notifyListeners(key, true);
            }
            event.preventDefault();
        });

        window.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();
            this._keys[key] = false;
            this.notifyListeners(key, false);
            event.preventDefault();
        });
    }

    isPressed(key: string): boolean {
        return this._keys[key.toLowerCase()] || false;
    }

    onKeyChange(key: string, callback: (pressed: boolean) => void) {
        if (!this._listeners.has(key)) {
            this._listeners.set(key, []);
        }
        this._listeners.get(key)!.push(callback);
    }

    private notifyListeners(key: string, pressed: boolean) {
        const callbacks = this._listeners.get(key);
        if (callbacks) {
            callbacks.forEach(callback => callback(pressed));
        }
    }

    destroy() {
        // Remove event listeners
        this._listeners.clear();
    }
}