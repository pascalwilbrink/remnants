import { AnimatedSprite, Spritesheet } from 'pixi.js';

export interface AnimationConfig {
    idle_up: string;
    idle_left: string;
    idle_down: string;
    idle_right: string;
    walk_up: string;
    walk_left: string;
    walk_down: string;
    walk_right: string;
    run_up: string;
    run_left: string;
    run_down: string;
    run_right: string;
    jump_up?: string;
    jump_left?: string;
    jump_down?: string;
    jump_right?: string;
}

export class AnimationManager {
    private _spritesheet?: Spritesheet;
    private _currentAnimation: string = '';
    private _animationConfig: AnimationConfig;

    constructor(
        private sprite: AnimatedSprite,
        animationConfig: AnimationConfig
    ) {
        this._animationConfig = animationConfig;
    }

    setSpritesheet(spritesheet: Spritesheet) {
        this._spritesheet = spritesheet;
    }

    playAnimation(animationName: string) {
        if (!this._spritesheet?.animations[animationName] || this._currentAnimation === animationName) {
            return;
        }

        const newTextures = this._spritesheet.animations[animationName];
        this.sprite.textures = newTextures;
        
        // Set animation speed based on type
        if (animationName.startsWith('idle')) {
            this.sprite.animationSpeed = 0.05;
        } else if (animationName.startsWith('walk')) {
            this.sprite.animationSpeed = 0.1;
        } else if (animationName.startsWith('run')) {
            this.sprite.animationSpeed = 0.15;
        } else if (animationName.startsWith('jump')) {
            this.sprite.animationSpeed = 0.2;
        }
        
        this.sprite.gotoAndPlay(0);
        this._currentAnimation = animationName;
    }

    getAnimationName(type: 'idle' | 'walk' | 'run' | 'jump', direction: 'up' | 'down' | 'left' | 'right'): string {
        const key = `${type}_${direction}` as keyof AnimationConfig;
        return this._animationConfig[key] || this._animationConfig.idle_down;
    }
}