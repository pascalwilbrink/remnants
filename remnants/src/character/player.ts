import { CollisionSystem } from "../physics/collision.system";
import { AnimationConfig } from "../system/animation.manager";
import { InputManager } from "../system/input.manager";
import { MovementBounds } from "../system/movement.controller";
import { Character } from "./character";

export class Player extends Character {
    private _inputManager: InputManager;
    private _isJumping: boolean = false;
    private _jumpCooldown: number = 0;

    constructor(x: number = 0, y: number = 0, inputManager: InputManager) {
        super(x, y, 1);
        this._inputManager = inputManager;
    }

    getAnimationConfig(): AnimationConfig {
        return {
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
    }

    update(bounds: MovementBounds, otherCharacters: Character[]) {
        this.updateJumpCooldown();
        this.handleInput(bounds, otherCharacters);
    }

    private updateJumpCooldown() {
        if (this._jumpCooldown > 0) {
            this._jumpCooldown--;
        }
    }

    private handleInput(bounds: MovementBounds, otherCharacters: Character[]) {
        let dx = 0;
        let dy = 0;
        const isRunning = this._inputManager.isPressed('shift');

        // Movement input
        if (this._inputManager.isPressed('arrowleft') || this._inputManager.isPressed('a')) dx = -1;
        if (this._inputManager.isPressed('arrowright') || this._inputManager.isPressed('d')) dx = 1;
        if (this._inputManager.isPressed('arrowup') || this._inputManager.isPressed('w')) dy = -1;
        if (this._inputManager.isPressed('arrowdown') || this._inputManager.isPressed('s')) dy = 1;

        // Jump input
        if (this._inputManager.isPressed(' ') && !this._isJumping && this._jumpCooldown <= 0) {
            this.jump();
        }

        // Move with collision detection
        if (dx !== 0 || dy !== 0) {
            this.moveWithCollision(dx, dy, bounds, otherCharacters, isRunning ? 1.5 : 1);
        }

        // Update animation
        this.updateAnimation(dx, dy, isRunning);
    }

    private moveWithCollision(dx: number, dy: number, bounds: MovementBounds, otherCharacters: Character[], speedMultiplier: number) {
        const newX = this.position.x + dx * this.position.speed * speedMultiplier;
        const newY = this.position.y + dy * this.position.speed * speedMultiplier;
        
        const collidingCharacter = CollisionSystem.wouldCollideAtPosition(this, newX, newY, otherCharacters);
        
        if (!collidingCharacter) {
            this._movementController.move(dx, dy, bounds, speedMultiplier);
        } else {
            // Try axis-separated movement
            const collisionX = CollisionSystem.wouldCollideAtPosition(this, newX, this.position.y, otherCharacters);
            const collisionY = CollisionSystem.wouldCollideAtPosition(this, this.position.x, newY, otherCharacters);
            
            if (!collisionX) {
                this._movementController.move(dx, 0, bounds, speedMultiplier);
            }
            if (!collisionY) {
                this._movementController.move(0, dy, bounds, speedMultiplier);
            }
        }
    }

    private updateAnimation(dx: number, dy: number, isRunning: boolean) {
        if (this._isJumping) {
            this._animationManager.playAnimation(
                this._animationManager.getAnimationName('jump', this.position.direction)
            );
        } else if (dx !== 0 || dy !== 0) {
            const animationType = isRunning ? 'run' : 'walk';
            this._animationManager.playAnimation(
                this._animationManager.getAnimationName(animationType, this.position.direction)
            );
        } else {
            this._animationManager.playAnimation(
                this._animationManager.getAnimationName('idle', this.position.direction)
            );
        }
    }

    private jump() {
        this._isJumping = true;
        this._jumpCooldown = 60;
        
        setTimeout(() => {
            this._isJumping = false;
        }, 500);
    }
}