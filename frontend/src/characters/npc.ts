import Phaser from 'phaser';
import { Character } from './character';
import { v4 } from 'uuid';

export class NPC extends Character {
    private wanderRadius: number;
    private startPosition: Phaser.Math.Vector2;
    private targetPosition: Phaser.Math.Vector2;
    private isMoving: boolean = false;
    private isPaused: boolean = false;
    private pausedVelocity: Phaser.Math.Vector2;

    private lastDirection: string = 'up';
    private id: string;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string = 'npc', key: string = 'npc', wanderRadius: number = 100) {
        super(scene, x, y, texture, key);
        
        this.id = v4();
        // Set the display size (scale up your 16x18 sprite)
        this.setDisplaySize(32, 36);

        // Adjust the physics body to match the sprite size
        this.body!.setSize(16, 18);
        
        // Create animations when the player is instantiated
        this.createAnimations();

        // Start with idle animation
        this.play(`npc-${this.id}-idle`);

        this.wanderRadius = wanderRadius;
        this.startPosition = new Phaser.Math.Vector2(x, y);
        this.targetPosition = new Phaser.Math.Vector2(x, y);
     //   this.setTint(0xff0000); // Red tint for NPCs
        this.speed = 50;
        
        this.pausedVelocity = new Phaser.Math.Vector2(0, 0);

        this.chooseNewTarget();
    }
    
    setSpeed(speed: number) {
        this.speed = speed;
    }

    getInteractionMessage() {
        return Promise.resolve(`Hello Wanderer`)
    }

    protected handleMovement(time: number, delta: number): void {
        if (this.isPaused) {
            this.setVelocity(0, 0);
            this.playIdleAnimation();
            return;
        }

        this.movementTimer += delta;

        if (this.movementTimer >= this.movementDuration) {
            this.chooseNewTarget();
            this.movementTimer = 0;
        }

        if (this.isMoving) {
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                this.targetPosition.x, this.targetPosition.y
            );

            if (distance > 5) {
                this.scene.physics.moveToObject(this, this.targetPosition, this.speed);
                this.updateMovementAnimation();
            } else {
                this.setVelocity(0, 0);
                this.playIdleAnimation();
                this.isMoving = false;
            }
        }
    }

    private updateMovementAnimation(): void {
        const velocityX = this.body!.velocity.x;
        const velocityY = this.body!.velocity.y;

        // Determine direction based on velocity
        if (Math.abs(velocityX) > Math.abs(velocityY)) {
            // Moving horizontally
            if (velocityX > 0) {
                this.lastDirection = 'right';
                this.play(`npc-${this.id}-walk-right`, true);
            } else {
                this.lastDirection = 'left';
                this.play(`npc-${this.id}-walk-left`, true);
            }
        } else {
            // Moving vertically
            if (velocityY > 0) {
                this.lastDirection = 'down';
                this.play(`npc-${this.id}-walk-down`, true);
            } else {
                this.lastDirection = 'up';
                this.play(`npc-${this.id}-walk-up`, true);
            }
        }
    }

    private playIdleAnimation(): void {
        // Play idle animation if not already playing
        if (!this.anims.isPlaying || this.anims.currentAnim?.key !== `npc-${this.id}-idle`) {
            this.play(`npc-${this.id}-idle`);
        }
    }

    private createAnimations(): void {
        const walkLeft: string = `npc-${this.id}-walk-left`;
        const walkRight: string = `npc-${this.id}-walk-right`;
        const walkUp: string = `npc-${this.id}-walk-up`;
        const walkDown: string = `npc-${this.id}-walk-down`;
        const idle: string = `npc-${this.id}-idle`;

        // Only create animations if they don't already exist
        if (!this.scene.anims.exists(walkLeft)) {
            this.scene.anims.create({
                key: walkLeft,
                frames: this.scene.anims.generateFrameNumbers(this.key, { start: 9, end: 11 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists(walkRight)) {
            this.scene.anims.create({
                key: walkRight,
                frames: this.scene.anims.generateFrameNumbers(this.key, { start: 6, end: 8 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists(idle)) {
            this.scene.anims.create({
                key: idle,
                frames: [{ key: this.key, frame: 0 }],
                frameRate: 1
            });
        }

        if (!this.scene.anims.exists(walkUp)) {
            this.scene.anims.create({
                key: walkUp,
                frames: this.scene.anims.generateFrameNumbers(this.key, { start: 3, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists(walkDown)) {
            this.scene.anims.create({
                key: walkDown,
                frames: this.scene.anims.generateFrameNumbers(this.key, { start: 0, end: 2 }),
                frameRate: 10,
                repeat: -1
            });
        }
    }

    private chooseNewTarget(): void {
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const distance = Phaser.Math.FloatBetween(20, this.wanderRadius);
        
        this.targetPosition.x = this.startPosition.x + Math.cos(angle) * distance;
        this.targetPosition.y = this.startPosition.y + Math.sin(angle) * distance;
        
        // Keep within world bounds
        this.targetPosition.x = Phaser.Math.Clamp(this.targetPosition.x, 32, 768);
        this.targetPosition.y = Phaser.Math.Clamp(this.targetPosition.y, 32, 568);
        
        this.isMoving = true;
    }

    public onInteract(): void {
        console.log('NPC says: Hello, adventurer!');
        this.setTint(0xffff00); // Yellow when interacted with
        
        // Reset tint after 1 second
        this.scene.time.delayedCall(1000, () => {
            this.setTint(0xff0000);
        });
    }

    public pauseMovement(): void {
        this.isPaused = true;
        // Store current velocity in case we want to resume smoothly
        this.pausedVelocity.x = this.body!.velocity.x;
        this.pausedVelocity.y = this.body!.velocity.y;
        this.setVelocity(0, 0);
    }


    public resumeMovement(): void {
        this.isPaused = false;
        // Optionally restore velocity, but for wandering NPCs it's better to just let them continue their pattern
    }

    public isPausedMovement(): boolean {
        return this.isPaused;
    }

}