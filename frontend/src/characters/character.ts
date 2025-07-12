import Phaser from 'phaser';

export abstract class Character extends Phaser.Physics.Arcade.Sprite {
    protected speed: number = 100;
    protected health: number = 100;
    protected direction: Phaser.Math.Vector2;
    protected movementTimer: number = 0;
    protected movementDuration: number = 2000; // 2 seconds

    protected key: string;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, key: string) {
        super(scene, x, y, texture);
        
        this.key = key;
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.direction = new Phaser.Math.Vector2(0, 0);
        this.setCollideWorldBounds(true);
    }

    public update(time: number, delta: number): void {
        this.handleMovement(time, delta);
    }

    protected abstract handleMovement(time: number, delta: number): void;

    public getHealth(): number {
        return this.health;
    }

    public takeDamage(damage: number): void {
        this.health -= damage;
        if (this.health <= 0) {
            this.onDeath();
        }
    }

    protected onDeath(): void {
        this.destroy();
    }
}
