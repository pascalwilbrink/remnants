import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    public preload(): void {
        // We'll create the sprites in the create method instead
        this.load.spritesheet('player', 'assets/player.png', { frameWidth: 16, frameHeight: 18});
    }

    public create(): void {
        this.createSprites();
        this.scene.start('TownScene');
    }


    private createSprites(): void {

        // Create portal sprite (blue circle)
        const portalGraphics = this.add.graphics();
        portalGraphics.fillStyle(0x0000ff);
        portalGraphics.fillCircle(16, 16, 16);
        portalGraphics.generateTexture('portal', 32, 32);
        portalGraphics.destroy();
    }


}
