import { AnimatedSprite, Assets, Spritesheet, Texture } from 'pixi.js';
import { Game } from '../app';
import { Character } from './character';
import { CollisionSystem } from '../physics/collision.system';

export class NPC extends Character {
    private _animatedSprite: AnimatedSprite;
    private _spritesheet?: Spritesheet;

    private _wanderDirection: { x: number, y: number } = { x: 0, y: 0 };
    private _wanderTimer: number = 0;
    private _wanderDuration: number = 0;
    private _pauseTimer: number = 0;
    private _pauseDuration: number = 0;
    private _isWandering: boolean = false;
    private _isPaused: boolean = false;
    private _direction: 'left' | 'right' | 'up' | 'down' = 'down';
    private _stuckTimer: number = 0; // Track how long NPC has been stuck
    private _maxStuckTime: number = 60; // Max frames before changing direction when stuck
    
    // Wander behavior settings
    private _minWanderTime: number = 60;  // Minimum frames to wander (1 second at 60fps)
    private _maxWanderTime: number = 180; // Maximum frames to wander (3 seconds at 60fps)
    private _minPauseTime: number = 30;   // Minimum frames to pause (0.5 seconds)
    private _maxPauseTime: number = 120;  // Maximum frames to pause (2 seconds)
    private _wanderRadius: number = 200;  // Maximum distance from spawn point
    private _spawnPoint: { x: number, y: number };

    // Animation names (same as Player)
    private _animations = {
        idle_up: 'idle_up',
        idle_left: 'idle_left', 
        idle_down: 'idle_down',
        idle_right: 'idle_right',
        walk_up: 'walk_up',
        walk_left: 'walk_left',
        walk_down: 'walk_down',
        walk_right: 'walk_right',
        run_up: 'run_up',
        run_left: 'run_left',
        run_down: 'run_down', 
        run_right: 'run_right'
    };

    constructor(x = 0, y = 0, color = 0x9b59b6) {
        super(x, y, color);
        this._spawnPoint = { x, y };
        this._speed = .5; // NPCs move slower than player
        
        // Create with a placeholder texture initially
        this._animatedSprite = new AnimatedSprite([Texture.EMPTY]);
        this._animatedSprite.x = x;
        this._animatedSprite.y = y;
        this._animatedSprite.anchor.set(0.5); // Center the sprite
                
        this.createFallbackSprite();
        this.startNewBehavior();        
    }

    // Override the sprite getter to return our AnimatedSprite
    get sprite() {
        return this._animatedSprite;
    }

    async loadSpritesheet(spritesheetPath: string, jsonPath?: string) {
        try {
            let spritesheet: Spritesheet;
            
            if (jsonPath) {
                // Load spritesheet with separate JSON file
                await Assets.load([spritesheetPath, jsonPath]);
                const texture = Assets.get(spritesheetPath);
                const data = Assets.get(jsonPath);
                spritesheet = new Spritesheet(texture, data.data);
            } else {
                // Use the embedded spritesheet data - you need to pass the spritesheet data here
                const texture = await Assets.load(spritesheetPath);
                // You'll need to import your spritesheet data and pass it here
                // spritesheet = new Spritesheet(texture, spritesheetData);
                throw new Error('Spritesheet data not provided - please pass jsonPath or import spritesheet data');
            }
            
            await spritesheet.parse();
            this._spritesheet = spritesheet;

            // Replace the current sprite while preserving position and parent
            this.replaceWithAnimatedSprite();
            
        } catch (error) {
            console.error('Failed to load spritesheet:', error);
            // Keep using fallback sprite
        }
    }

    private replaceWithAnimatedSprite() {
        if (!this._spritesheet) return;

        // Store current state
        const currentPosition = { x: this._animatedSprite.x, y: this._animatedSprite.y };
        const parent = this._animatedSprite.parent;
        
        // Remove old sprite from parent if it exists
        if (parent) {
            parent.removeChild(this._animatedSprite);
        }
        
        // Destroy old sprite
        this._animatedSprite.destroy();

        // Create new AnimatedSprite with idle_down animation
        this._animatedSprite = new AnimatedSprite(this._spritesheet.animations.idle_down);
        this._animatedSprite.x = currentPosition.x;
        this._animatedSprite.y = currentPosition.y;
        this._animatedSprite.anchor.set(0.5);
        this._animatedSprite.animationSpeed = 0.05;
        this._animatedSprite.play();
        
        // Re-add to parent if it existed
        if (parent) {
            parent.addChild(this._animatedSprite);
        }
    }

    private createFallbackSprite() {
        // Create a simple colored rectangle as fallback
        const canvas = document.createElement('canvas');
        canvas.width = 64; // Updated to match new sprite size
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(16, 8, 32, 24);
        
        const texture = Texture.from(canvas);
        this._animatedSprite.textures = [texture];
    }

    private playAnimation(animationName: string) {
        if (!this._spritesheet || !this._spritesheet.animations[animationName]) {
            // Don't warn if spritesheet isn't loaded yet
            if (this._spritesheet) {
                console.warn(`Animation ${animationName} not found`);
            }
            return;
        }
        
        const newTextures = this._spritesheet.animations[animationName];
        
        // Only change animation if it's different from current
        if (this._animatedSprite.textures !== newTextures) {
            this._animatedSprite.textures = newTextures;
            
            // Set different speeds for different animation types
            if (animationName.startsWith('idle')) {
                this._animatedSprite.animationSpeed = 0.05;
            } else if (animationName.startsWith('walk')) {
                this._animatedSprite.animationSpeed = 0.1;
            } else if (animationName.startsWith('run')) {
                this._animatedSprite.animationSpeed = 0.15;
            }
            
            this._animatedSprite.gotoAndPlay(0);
        }
    }

    private updateDirection(dx: number, dy: number) {
        // Update direction based on movement (same logic as Player)
        if (dx !== 0 || dy !== 0) {
            // Prioritize horizontal movement for animation
            if (Math.abs(dx) > Math.abs(dy)) {
                this._direction = dx > 0 ? 'right' : 'left';
            } else {
                this._direction = dy > 0 ? 'down' : 'up';
            }
        }
    }

    private startNewBehavior() {
        // Reset stuck timer when starting new behavior
        this._stuckTimer = 0;
        
        // Randomly choose to wander or pause
        if (Math.random() < 0.7) { // 70% chance to wander
            this.startWandering();
        } else { // 30% chance to pause
            this.startPausing();
        }
    }

    private startWandering() {
        this._isWandering = true;
        this._isPaused = false;
        this._wanderTimer = 0;
        this._wanderDuration = this.randomBetween(this._minWanderTime, this._maxWanderTime);
        
        // Choose a random direction
        const angle = Math.random() * Math.PI * 2;
        this._wanderDirection = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
        
        // Update direction and start walk animation
        this.updateDirection(this._wanderDirection.x, this._wanderDirection.y);
        this.playAnimation(`walk_${this._direction}`);
    }

    private startPausing() {
        this._isWandering = false;
        this._isPaused = true;
        this._pauseTimer = 0;
        this._pauseDuration = this.randomBetween(this._minPauseTime, this._maxPauseTime);
        this._wanderDirection = { x: 0, y: 0 };
        
        // Play idle animation
        this.playAnimation(`idle_${this._direction}`);
    }

    private randomBetween(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private adjustDirectionTowardsBounds(game: Game) {
        const bounds = game.getGameBounds();
        const margin = 50;
        
        // Steer away from screen edges
        if (this.sprite.x < margin) {
            this._wanderDirection.x = Math.abs(this._wanderDirection.x);
        } else if (this.sprite.x > bounds.width - margin) {
            this._wanderDirection.x = -Math.abs(this._wanderDirection.x);
        }
        
        if (this.sprite.y < margin) {
            this._wanderDirection.y = Math.abs(this._wanderDirection.y);
        } else if (this.sprite.y > bounds.height - margin) {
            this._wanderDirection.y = -Math.abs(this._wanderDirection.y);
        }
        
        // Steer toward spawn point if too far away
        const distanceFromSpawn = Math.sqrt(
            Math.pow(this.sprite.x - this._spawnPoint.x, 2) + 
            Math.pow(this.sprite.y - this._spawnPoint.y, 2)
        );
        
        if (distanceFromSpawn > this._wanderRadius * 0.8) {
            const dirToSpawn = {
                x: this._spawnPoint.x - this.sprite.x,
                y: this._spawnPoint.y - this.sprite.y
            };
            
            // Normalize direction to spawn
            const length = Math.sqrt(dirToSpawn.x * dirToSpawn.x + dirToSpawn.y * dirToSpawn.y);
            if (length > 0) {
                dirToSpawn.x /= length;
                dirToSpawn.y /= length;
                
                // Blend current direction with direction to spawn
                this._wanderDirection.x = this._wanderDirection.x * 0.3 + dirToSpawn.x * 0.7;
                this._wanderDirection.y = this._wanderDirection.y * 0.3 + dirToSpawn.y * 0.7;
            }
        }
    }

    private updateWandering(game: Game) {
        this._wanderTimer++;
        
        // Store previous position to check if stuck
        const prevX = this.sprite.x;
        const prevY = this.sprite.y;
        
        // Store previous direction to check for changes
        const prevDirection = { ...this._wanderDirection };
        
        // Occasionally change direction slightly for more natural movement
        if (this._wanderTimer % 30 === 0) { // Every 0.5 seconds
            const randomTurn = (Math.random() - 0.5) * 0.5; // Small random turn
            const currentAngle = Math.atan2(this._wanderDirection.y, this._wanderDirection.x);
            const newAngle = currentAngle + randomTurn;
            
            this._wanderDirection.x = Math.cos(newAngle);
            this._wanderDirection.y = Math.sin(newAngle);
        }
        
        // Adjust direction if approaching boundaries
        this.adjustDirectionTowardsBounds(game);
        
        // Update animation direction if wanderDirection changed significantly
        if (Math.abs(this._wanderDirection.x - prevDirection.x) > 0.1 || 
            Math.abs(this._wanderDirection.y - prevDirection.y) > 0.1) {
            this.updateDirection(this._wanderDirection.x, this._wanderDirection.y);
            this.playAnimation(`walk_${this._direction}`);
        }
        
        // Move in the current direction
        this.move(this._wanderDirection.x, this._wanderDirection.y, game);
        
        // Check if NPC got stuck (didn't move)
        const distanceMoved = Math.sqrt(
            Math.pow(this.sprite.x - prevX, 2) + 
            Math.pow(this.sprite.y - prevY, 2)
        );
        
        if (distanceMoved < 0.1) { // Barely moved
            this._stuckTimer++;
            
            // If stuck for too long, choose a new random direction
            if (this._stuckTimer >= this._maxStuckTime) {
                const angle = Math.random() * Math.PI * 2;
                this._wanderDirection = {
                    x: Math.cos(angle),
                    y: Math.sin(angle)
                };
                this._stuckTimer = 0;
                this.updateDirection(this._wanderDirection.x, this._wanderDirection.y);
                this.playAnimation(`walk_${this._direction}`);
            }
        } else {
            this._stuckTimer = 0; // Reset stuck timer if moving
        }
        
        // Check if wander duration is complete
        if (this._wanderTimer >= this._wanderDuration) {
            this.startNewBehavior();
        }
    }

    private updatePausing() {
        this._pauseTimer++;
        
        // Check if pause duration is complete
        if (this._pauseTimer >= this._pauseDuration) {
            this.startNewBehavior();
        }
    }

    // Override the move method to respect NPC speed and collision detection
    move(dx: number, dy: number, game: Game) {
        const newX = this.sprite.x + dx * this._speed;
        const newY = this.sprite.y + dy * this._speed;
        
        const bounds = game.getGameBounds();
        const margin = 25; // Half the sprite size
        
        // Clamp to screen bounds
        const clampedX = Math.max(margin, Math.min(bounds.width - margin, newX));
        const clampedY = Math.max(margin, Math.min(bounds.height - margin, newY));
        
        // Get all other characters (including player and other NPCs)
        const otherCharacters = [game.player, ...(game.scene?.getCharacters() || [])];
        
        // Check for collision with other characters
        const collidingCharacter = CollisionSystem.wouldCollideAtPosition(this, clampedX, clampedY, otherCharacters);
        
        if (!collidingCharacter) {
            // No collision, move normally
            this.sprite.x = clampedX;
            this.sprite.y = clampedY;
        } else {
            // Collision detected, try moving along individual axes
            
            // Try moving only horizontally
            const collisionX = CollisionSystem.wouldCollideAtPosition(this, clampedX, this.sprite.y, otherCharacters);
            if (!collisionX) {
                this.sprite.x = clampedX;
            }
            
            // Try moving only vertically
            const collisionY = CollisionSystem.wouldCollideAtPosition(this, this.sprite.x, clampedY, otherCharacters);
            if (!collisionY) {
                this.sprite.y = clampedY;
            }
            
            // If both axes would cause collision, try to "push away" from the colliding character
            if (collisionX && collisionY) {
                const resolution = CollisionSystem.getCollisionResolution(this, collidingCharacter);
                const pushDistance = 2; // Small push distance
                
                const pushX = this.sprite.x + resolution.x * pushDistance;
                const pushY = this.sprite.y + resolution.y * pushDistance;
                
                // Make sure push doesn't go out of bounds
                const boundedPushX = Math.max(margin, Math.min(bounds.width - margin, pushX));
                const boundedPushY = Math.max(margin, Math.min(bounds.height - margin, pushY));
                
                // Only apply push if it doesn't cause new collisions
                if (!CollisionSystem.wouldCollideAtPosition(this, boundedPushX, boundedPushY, otherCharacters)) {
                    this.sprite.x = boundedPushX;
                    this.sprite.y = boundedPushY;
                }
            }
        }
    }

    // Override update method with NPC behavior
    update(game: Game) {
        if (this._isWandering) {
            this.updateWandering(game);
        } else if (this._isPaused) {
            this.updatePausing();
        }
        
        // Don't call super.update() to avoid the floating behavior
    }

    // Methods to customize NPC behavior
    setWanderRadius(radius: number) {
        this._wanderRadius = radius;
    }

    setWanderSpeed(speed: number) {
        this._speed = speed;
    }

    setWanderTiming(minWander: number, maxWander: number, minPause: number, maxPause: number) {
        this._minWanderTime = minWander;
        this._maxWanderTime = maxWander;
        this._minPauseTime = minPause;
        this._maxPauseTime = maxPause;
    }

    // Get current behavior state (useful for debugging)
    getBehaviorState() {
        return {
            isWandering: this._isWandering,
            isPaused: this._isPaused,
            wanderTimer: this._wanderTimer,
            wanderDuration: this._wanderDuration,
            pauseTimer: this._pauseTimer,
            pauseDuration: this._pauseDuration,
            direction: this._wanderDirection,
            facingDirection: this._direction,
            stuckTimer: this._stuckTimer
        };
    }
}