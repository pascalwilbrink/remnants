import Phaser from 'phaser';
import { Character } from './character';

export class Player extends Character {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private lastDirection: string = 'down';

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player', 'player');
        
        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.speed = 150;

        // Set the display size (scale up your 16x18 sprite)
        this.setDisplaySize(32, 36);
        
        // Adjust the physics body to match the sprite size
        this.body!.setSize(16, 18);
        
        // Create animations when the player is instantiated
        this.createAnimations();

        // Start with idle animation
        this.play('idle');
    }

    private createAnimations(): void {
        // Only create animations if they don't already exist
        if (!this.scene.anims.exists('walk-left')) {
            this.scene.anims.create({
                key: 'walk-left',
                frames: this.scene.anims.generateFrameNumbers(this.key, { start: 9, end: 11 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists('walk-right')) {
            this.scene.anims.create({
                key: 'walk-right',
                frames: this.scene.anims.generateFrameNumbers(this.key, { start: 6, end: 8 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists('idle')) {
            this.scene.anims.create({
                key: 'idle',
                frames: [{ key: this.key, frame: 0 }],
                frameRate: 1
            });
        }

        if (!this.scene.anims.exists('walk-up')) {
            this.scene.anims.create({
                key: 'walk-up',
                frames: this.scene.anims.generateFrameNumbers(this.key, { start: 3, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists('walk-down')) {
            this.scene.anims.create({
                key: 'walk-down',
                frames: this.scene.anims.generateFrameNumbers(this.key, { start: 0, end: 2 }),
                frameRate: 10,
                repeat: -1
            });
        }
    }

    protected handleMovement(time: number, delta: number): void {
        let velocityX = 0;
        let velocityY = 0;
        let isMoving = false;

        if (this.cursors.left.isDown) {
            velocityX = -this.speed;
            isMoving = true;
            this.lastDirection = 'left';
            this.play('walk-left', true);
        } else if (this.cursors.right.isDown) {
            velocityX = this.speed;
            isMoving = true;
            this.lastDirection = 'right';
            this.play('walk-right', true);
        }

        if (this.cursors.up.isDown) {
            velocityY = -this.speed;
            isMoving = true;
            this.lastDirection = 'up';
            this.play('walk-up', true);
        } else if (this.cursors.down.isDown) {
            velocityY = this.speed;
            isMoving = true;
            this.lastDirection = 'down';
            this.play('walk-down', true);
        }

        // Handle diagonal movement priority
        if (this.cursors.up.isDown && (this.cursors.left.isDown || this.cursors.right.isDown)) {
            this.play('walk-up', true);
        } else if (this.cursors.down.isDown && (this.cursors.left.isDown || this.cursors.right.isDown)) {
            this.play('walk-down', true);
        }

        // If not moving, play idle animation
        if (!isMoving) {
            this.play('idle', true);
        }

        this.setVelocity(velocityX, velocityY);
    }

    public interactWith(target: Character): void {
        console.log('Player interacting with:', target.constructor.name);
    }
}