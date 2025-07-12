import { MovementBounds } from "./movement.controller";

export interface NpcState {
    isWandering: boolean;
    isPaused: boolean;
    wanderDirection: { x: number; y: number };
    wanderTimer: number;
    wanderDuration: number;
    pauseTimer: number;
    pauseDuration: number;
    stuckTimer: number;
}


export class NpcBehaviour {
    private _state: NpcState;
    private _spawnPoint: { x: number; y: number };
    
    // Configurable parameters
    private _wanderRadius: number = 200;
    private _minWanderTime: number = 60;
    private _maxWanderTime: number = 180;
    private _minPauseTime: number = 30;
    private _maxPauseTime: number = 120;
    private _maxStuckTime: number = 60;

    constructor(spawnX: number, spawnY: number) {
        this._spawnPoint = { x: spawnX, y: spawnY };
        this._state = {
            isWandering: false,
            isPaused: false,
            wanderDirection: { x: 0, y: 0 },
            wanderTimer: 0,
            wanderDuration: 0,
            pauseTimer: 0,
            pauseDuration: 0,
            stuckTimer: 0
        };
        this.startNewBehavior();
    }

    get state(): Readonly<NpcState> {
        return this._state;
    }

    update(currentPosition: { x: number; y: number }, bounds: MovementBounds): { x: number; y: number } {
        if (this._state.isWandering) {
            return this.updateWandering(currentPosition, bounds);
        } else if (this._state.isPaused) {
            this.updatePausing();
        }
        return { x: 0, y: 0 };
    }

    private updateWandering(currentPosition: { x: number; y: number }, bounds: MovementBounds): { x: number; y: number } {
        this._state.wanderTimer++;
        
        // Occasionally change direction
        if (this._state.wanderTimer % 30 === 0) {
            const randomTurn = (Math.random() - 0.5) * 0.5;
            const currentAngle = Math.atan2(this._state.wanderDirection.y, this._state.wanderDirection.x);
            const newAngle = currentAngle + randomTurn;
            
            this._state.wanderDirection.x = Math.cos(newAngle);
            this._state.wanderDirection.y = Math.sin(newAngle);
        }
        
        // Adjust direction for boundaries and spawn point
        this.adjustDirectionTowardsBounds(currentPosition, bounds);
        
        // Check if wander duration is complete
        if (this._state.wanderTimer >= this._state.wanderDuration) {
            this.startNewBehavior();
            return { x: 0, y: 0 };
        }
        
        return this._state.wanderDirection;
    }

    private updatePausing() {
        this._state.pauseTimer++;
        
        if (this._state.pauseTimer >= this._state.pauseDuration) {
            this.startNewBehavior();
        }
    }

    private adjustDirectionTowardsBounds(currentPosition: { x: number; y: number }, bounds: MovementBounds) {
        const margin = 50;
        
        // Steer away from screen edges
        if (currentPosition.x < margin) {
            this._state.wanderDirection.x = Math.abs(this._state.wanderDirection.x);
        } else if (currentPosition.x > bounds.width - margin) {
            this._state.wanderDirection.x = -Math.abs(this._state.wanderDirection.x);
        }
        
        if (currentPosition.y < margin) {
            this._state.wanderDirection.y = Math.abs(this._state.wanderDirection.y);
        } else if (currentPosition.y > bounds.height - margin) {
            this._state.wanderDirection.y = -Math.abs(this._state.wanderDirection.y);
        }
        
        // Steer toward spawn point if too far away
        const distanceFromSpawn = Math.sqrt(
            Math.pow(currentPosition.x - this._spawnPoint.x, 2) + 
            Math.pow(currentPosition.y - this._spawnPoint.y, 2)
        );
        
        if (distanceFromSpawn > this._wanderRadius * 0.8) {
            const dirToSpawn = {
                x: this._spawnPoint.x - currentPosition.x,
                y: this._spawnPoint.y - currentPosition.y
            };
            
            const length = Math.sqrt(dirToSpawn.x * dirToSpawn.x + dirToSpawn.y * dirToSpawn.y);
            if (length > 0) {
                dirToSpawn.x /= length;
                dirToSpawn.y /= length;
                
                this._state.wanderDirection.x = this._state.wanderDirection.x * 0.3 + dirToSpawn.x * 0.7;
                this._state.wanderDirection.y = this._state.wanderDirection.y * 0.3 + dirToSpawn.y * 0.7;
            }
        }
    }

    private startNewBehavior() {
        this._state.stuckTimer = 0;
        
        if (Math.random() < 0.7) {
            this.startWandering();
        } else {
            this.startPausing();
        }
    }

    private startWandering() {
        this._state.isWandering = true;
        this._state.isPaused = false;
        this._state.wanderTimer = 0;
        this._state.wanderDuration = this.randomBetween(this._minWanderTime, this._maxWanderTime);
        
        const angle = Math.random() * Math.PI * 2;
        this._state.wanderDirection = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }

    private startPausing() {
        this._state.isWandering = false;
        this._state.isPaused = true;
        this._state.pauseTimer = 0;
        this._state.pauseDuration = this.randomBetween(this._minPauseTime, this._maxPauseTime);
        this._state.wanderDirection = { x: 0, y: 0 };
    }

    private randomBetween(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Configuration methods
    setWanderRadius(radius: number) { this._wanderRadius = radius; }
    setWanderTiming(minWander: number, maxWander: number, minPause: number, maxPause: number) {
        this._minWanderTime = minWander;
        this._maxWanderTime = maxWander;
        this._minPauseTime = minPause;
        this._maxPauseTime = maxPause;
    }
}
