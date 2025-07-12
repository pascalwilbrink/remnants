import { AnimatedSprite } from 'pixi.js';

export interface MovementBounds {
    width: number;
    height: number;
}

export interface MovementState {
    x: number;
    y: number;
    isMoving: boolean;
    direction: 'up' | 'down' | 'left' | 'right';
    speed: number;
}

export class MovementController {
    private _state: MovementState;

    constructor(
        private sprite: AnimatedSprite,
        initialX: number = 0,
        initialY: number = 0,
        speed: number = 1
    ) {
        this._state = {
            x: initialX,
            y: initialY,
            isMoving: false,
            direction: 'down',
            speed
        };
        this.updateSpritePosition();
    }

    get state(): Readonly<MovementState> {
        return this._state;
    }

    setPosition(x: number, y: number) {
        this._state.x = x;
        this._state.y = y;
        this.updateSpritePosition();
    }

    setSpeed(speed: number) {
        this._state.speed = speed;
    }

    move(dx: number, dy: number, bounds: MovementBounds, speedMultiplier: number = 1) {
        if (dx === 0 && dy === 0) {
            this._state.isMoving = false;
            return;
        }

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        // Update direction
        if (Math.abs(dx) > Math.abs(dy)) {
            this._state.direction = dx > 0 ? 'right' : 'left';
        } else {
            this._state.direction = dy > 0 ? 'down' : 'up';
        }

        // Calculate new position
        const speed = this._state.speed * speedMultiplier;
        const newX = this._state.x + dx * speed;
        const newY = this._state.y + dy * speed;

        // Apply bounds
        const halfWidth = this.sprite.width / 2;
        const halfHeight = this.sprite.height / 2;
        
        this._state.x = Math.max(halfWidth, Math.min(bounds.width - halfWidth, newX));
        this._state.y = Math.max(halfHeight, Math.min(bounds.height - halfHeight, newY));
        this._state.isMoving = true;

        this.updateSpritePosition();
    }

    private updateSpritePosition() {
        this.sprite.x = this._state.x;
        this.sprite.y = this._state.y;
    }
}