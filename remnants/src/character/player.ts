import { AnimatedSprite, Assets, Spritesheet, Texture } from 'pixi.js';
import { Game } from '../app';
import { Character } from './character';
import { CollisionSystem } from '../physics/collision.system';

export class Player extends Character {
    private _animatedSprite: AnimatedSprite;
    private _keys: { [key: string]: boolean } = {};
    private _isMoving: boolean = false;
    private _direction: 'left' | 'right' | 'up' | 'down' = 'down'; // Remove 'idle' from type
    private _spritesheet?: Spritesheet;
    private _initialPosition: { x: number, y: number };
    private _isJumping: boolean = false;
    private _jumpCooldown: number = 0;

    // Updated animation names to match the new spritesheet structure
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
        run_right: 'run_right',
        jump_up: 'jump_up',
        jump_left: 'jump_left',
        jump_down: 'jump_down',
        jump_right: 'jump_right'
    };

    constructor(x = 0, y = 0) {
        super(x, y, 0);
        
        // Store initial position for when spritesheet loads
        this._initialPosition = { x, y };
        
        // Create with a placeholder texture initially
        this._animatedSprite = new AnimatedSprite([Texture.EMPTY]);
        this._animatedSprite.x = x;
        this._animatedSprite.y = y;
        this._animatedSprite.anchor.set(0.5); // Center the sprite
        
        this.setupKeyboardControls();
        this.createFallbackSprite();
        this._speed = 1;
    }

    // Override the sprite getter to return our AnimatedSprite
    get sprite() {
        return this._animatedSprite;
    }

    // Override setPosition to work with AnimatedSprite
    setPosition(x: number, y: number) {
        this._animatedSprite.x = x;
        this._animatedSprite.y = y;
        this._initialPosition = { x, y };
    }

    // Override getPosition to work with AnimatedSprite
    getPosition() {
        return { x: this._animatedSprite.x, y: this._animatedSprite.y };
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

    private setupKeyboardControls() {
        window.addEventListener('keydown', (event) => {
            this._keys[event.key.toLowerCase()] = true;
            event.preventDefault();
        });

        window.addEventListener('keyup', (event) => {
            this._keys[event.key.toLowerCase()] = false;
            event.preventDefault();
        });
    }

    private updateMovement(game: Game) {
        let dx = 0;
        let dy = 0;
        let isRunning = this._keys['shift']; // Hold shift to run

        // Check keyboard input
        if (this._keys['arrowleft'] || this._keys['a']) {
            dx = -1;
        }
        if (this._keys['arrowright'] || this._keys['d']) {
            dx = 1;
        }
        if (this._keys['arrowup'] || this._keys['w']) {
            dy = -1;
        }
        if (this._keys['arrowdown'] || this._keys['s']) {
            dy = 1;
        }

        // Update movement state
        this._isMoving = dx !== 0 || dy !== 0;
        
        // Update direction and animation
        if (this._isMoving && !this._isJumping) {
            // Prioritize horizontal movement for animation
            if (dx !== 0) {
                this._direction = dx > 0 ? 'right' : 'left';
            } else {
                this._direction = dy > 0 ? 'down' : 'up';
            }
            
            // Choose animation based on whether running or walking
            const animationType = isRunning ? 'run' : 'walk';
            this.playAnimation(`${animationType}_${this._direction}`);
        } else if (!this._isJumping) {
            // Keep current direction for idle animation
            this.playAnimation(`idle_${this._direction}`);
        }

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        // Move the player (faster when running)
        if (this._isMoving) {
            const currentSpeed = isRunning ? this._speed * 1.5 : this._speed;
            this.move(dx, dy, game, currentSpeed);
        }
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
            } else if (animationName.startsWith('jump')) {
                this._animatedSprite.animationSpeed = 0.2;
            }
            
            this._animatedSprite.gotoAndPlay(0);
        }
    }

    // Override the move method to work with AnimatedSprite
    public move(dx: number, dy: number, game: Game, speed: number = this._speed) {
        const newX = this._animatedSprite.x + dx * speed;
        const newY = this._animatedSprite.y + dy * speed;
        
        const bounds = game.getGameBounds();
        const halfWidth = this._animatedSprite.width / 2;
        const halfHeight = this._animatedSprite.height / 2;
        
     // Clamp to screen bounds
     const clampedX = Math.max(halfWidth, Math.min(bounds.width - halfWidth, newX));
     const clampedY = Math.max(halfHeight, Math.min(bounds.height - halfHeight, newY));
     
     // Check for collision with other characters
     const otherCharacters = game.scene?.getCharacters() || [];
     const collidingCharacter = CollisionSystem.wouldCollideAtPosition(this, clampedX, clampedY, otherCharacters);
     
     if (!collidingCharacter) {
         // No collision, move normally
         this._animatedSprite.x = clampedX;
         this._animatedSprite.y = clampedY;
     } else {
         // Collision detected, try moving along individual axes
         
         // Try moving only horizontally
         const collisionX = CollisionSystem.wouldCollideAtPosition(this, clampedX, this._animatedSprite.y, otherCharacters);
         if (!collisionX) {
             this._animatedSprite.x = clampedX;
         }
         
         // Try moving only vertically
         const collisionY = CollisionSystem.wouldCollideAtPosition(this, this._animatedSprite.x, clampedY, otherCharacters);
         if (!collisionY) {
             this._animatedSprite.y = clampedY;
         }
         
         // If both axes would cause collision, don't move at all
         // This allows the player to "slide" along NPCs rather than getting completely stuck
     }
    }

    // Add jump functionality with cooldown
    jump() {
        if (this._jumpCooldown <= 0) {
            this._isJumping = true;
            this._jumpCooldown = 60; // 60 frames cooldown (about 1 second at 60fps)
            this.playAnimation(`jump_${this._direction}`);
            
            // Reset jump state after animation duration
            setTimeout(() => {
                this._isJumping = false;
            }, 500); // 500ms jump duration
        }
    }

    // Override update method
    update(game: Game) {
        // Update jump cooldown
        if (this._jumpCooldown > 0) {
            this._jumpCooldown--;
        }
        
        this.updateMovement(game);
        
        // Handle jump input - only if not already jumping
        if (this._keys[' '] && !this._isJumping) { // Spacebar for jump
            this.jump();
        }
        
        // Don't call super.update() as it has unwanted behavior
    }

    // Override destroy method to clean up properly
    destroy() {
        // Remove event listeners
        window.removeEventListener('keydown', this.setupKeyboardControls);
        window.removeEventListener('keyup', this.setupKeyboardControls);
        
        // Remove and destroy animated sprite
        if (this._animatedSprite.parent) {
            this._animatedSprite.parent.removeChild(this._animatedSprite);
        }
        this._animatedSprite.destroy();
        
        // Don't call super.destroy() since we're handling our own sprite
    }
}