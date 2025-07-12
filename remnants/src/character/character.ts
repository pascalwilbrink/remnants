import { AnimatedSprite, Assets, Spritesheet, Texture } from 'pixi.js';
import { MovementBounds, MovementController } from '../system/movement.controller';
import { AnimationConfig, AnimationManager } from '../system/animation.manager';

export abstract class Character {
    protected _sprite: AnimatedSprite;
    protected _movementController: MovementController;
    protected _animationManager: AnimationManager;

    constructor(x: number = 0, y: number = 0, speed: number = 1) {
        this._sprite = new AnimatedSprite([Texture.EMPTY]);
        this._sprite.anchor.set(0.5);
        
        this._movementController = new MovementController(this._sprite, x, y, speed);
        this._animationManager = new AnimationManager(this._sprite, this.getAnimationConfig());
        
        this.createFallbackSprite();
    }

    get sprite(): AnimatedSprite { return this._sprite; }
    get position() { return this._movementController.state; }
    get animationManager() { return this._animationManager; }
    get movementController() { return this._movementController; }

    abstract getAnimationConfig(): AnimationConfig;
    abstract update(bounds: MovementBounds, otherCharacters: Character[]): void;

    protected createFallbackSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(16, 8, 32, 24);
        
        const texture = Texture.from(canvas);
        this._sprite.textures = [texture];
    }

    getPosition(): { x: number; y: number } {
        return { x: this.sprite.x, y: this.sprite.y };
    }
    
    async loadSpritesheet(spritesheetPath: string, jsonPath: string) {
        try {
            const [texture, data] = await Promise.all([
                Assets.load(spritesheetPath),
                Assets.load(jsonPath)
            ]);
            
            const spritesheet = new Spritesheet(texture, data.data);
            await spritesheet.parse();
            
            this._animationManager.setSpritesheet(spritesheet);
            
            // Replace sprite textures with idle animation
            if (spritesheet.animations.idle_down) {
                this._sprite.textures = spritesheet.animations.idle_down;
                this._sprite.play();
            }
            
        } catch (error) {
            console.error('Failed to load spritesheet:', error);
        }
    }

    destroy() {
        if (this._sprite.parent) {
            this._sprite.parent.removeChild(this._sprite);
        }
        this._sprite.destroy();
    }
}