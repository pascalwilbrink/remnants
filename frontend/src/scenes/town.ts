import { BaseScene } from './base-scene';
import { NPC } from '../characters/npc';

export class TownScene extends BaseScene {
    constructor() {
        super('TownScene');
    }

    protected getPlayerSpawnPoint(): { x: number, y: number } {
        return { x: 150, y: 150 }; // Safe spawn point away from portals
    }

    public preload() {
        this.load.spritesheet('npc', 'assets/player.png', { frameWidth: 16, frameHeight: 18});
        this.load.spritesheet('npc1', 'assets/npc_11.png', { frameWidth: 16, frameHeight: 18});
    }

    protected createWorld(): void {
        // Create a simple town background
        this.add.rectangle(400, 300, 800, 600, 0x8B4513); // Brown background
        
        // Add some town elements
        this.add.rectangle(200, 200, 100, 80, 0x654321); // House 1
        this.add.rectangle(600, 200, 100, 80, 0x654321); // House 2
        this.add.rectangle(400, 400, 150, 100, 0x654321); // Town hall
        
        this.npcs = this.add.group();
        this.scenePortals = this.add.group();
    }

    protected createNPCs(): void {
        // Create town NPCs
        const townfolk1 = new NPC(this, 300, 300, 'npc1', 'npc1', 80);
        const townfolk2 = new NPC(this, 500, 250, 'npc', 'npc', 60);
        const townfolk3 = new NPC(this, 150, 400, 'npc', 'npc', 100);
        
        this.npcs.add(townfolk1);
        this.npcs.add(townfolk2);
        this.npcs.add(townfolk3);
    }

    protected createPortals(): void {
        // Portal to forest
        const forestPortal = this.physics.add.sprite(700, 500, 'portal');

        forestPortal.setData('sceneKey', 'ForestScene');
        forestPortal.setTint(0x00ff00);

        forestPortal.setDisplaySize(32, 32);
        this.scenePortals.add(forestPortal);

        this.scenePortals.add(forestPortal);
        
        // Add portal label
        this.add.text(670, 460, 'Forest', {
            fontSize: '16px',
            color: '#ffffff'
        });
    }
}