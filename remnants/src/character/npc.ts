import { CollisionSystem } from "../physics/collision.system";
import { AnimationConfig } from "../system/animation.manager";
import { MovementBounds } from "../system/movement.controller";
import { NpcBehaviour } from "../system/npc.behaviour";
import { Character } from "./character";

export class NPC extends Character {
    private _aiBehavior: NpcBehaviour;

    constructor(x: number = 0, y: number = 0) {
        super(x, y, 0.5);
        this._aiBehavior = new NpcBehaviour(x, y);
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
            run_right: 'run_right'
        };
    }

    update(bounds: MovementBounds, otherCharacters: Character[]) {
        const aiDirection = this._aiBehavior.update(this.position, bounds);
        
        if (aiDirection.x !== 0 || aiDirection.y !== 0) {
            this.moveWithCollision(aiDirection.x, aiDirection.y, bounds, otherCharacters);
            this._animationManager.playAnimation(
                this._animationManager.getAnimationName('walk', this.position.direction)
            );
        } else {
            this._animationManager.playAnimation(
                this._animationManager.getAnimationName('idle', this.position.direction)
            );
        }
    }

    private moveWithCollision(dx: number, dy: number, bounds: MovementBounds, otherCharacters: Character[]) {
        const newX = this.position.x + dx * this.position.speed;
        const newY = this.position.y + dy * this.position.speed;
        
        const collidingCharacter = CollisionSystem.wouldCollideAtPosition(this, newX, newY, otherCharacters);
        
        if (!collidingCharacter) {
            this._movementController.move(dx, dy, bounds);
        } else {
            // Try axis-separated movement
            const collisionX = CollisionSystem.wouldCollideAtPosition(this, newX, this.position.y, otherCharacters);
            const collisionY = CollisionSystem.wouldCollideAtPosition(this, this.position.x, newY, otherCharacters);
            
            if (!collisionX) this._movementController.move(dx, 0, bounds);
            if (!collisionY) this._movementController.move(0, dy, bounds);
        }
    }

    // Configuration methods
    setWanderRadius(radius: number) { this._aiBehavior.setWanderRadius(radius); }
    setWanderTiming(minWander: number, maxWander: number, minPause: number, maxPause: number) {
        this._aiBehavior.setWanderTiming(minWander, maxWander, minPause, maxPause);
    }
}
