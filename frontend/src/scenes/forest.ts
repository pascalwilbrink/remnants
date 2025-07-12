import Phaser from 'phaser';
import { BaseScene } from './base-scene';
import { NPC } from '../characters/npc';

export class ForestScene extends BaseScene {
    constructor() {
        super('ForestScene');
    }

    protected getPlayerSpawnPoint(): { x: number, y: number } {
        return { x: 400, y: 300 }; // Center of the forest, away from the town portal
    }


    protected createWorld(): void {
        // Create a forest background
        this.add.rectangle(400, 300, 800, 600, 0x228B22); // Forest green background
        
        // Add some trees
        for (let i = 0; i < 10; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(50, 550);
            this.add.circle(x, y, 20, 0x006400); // Dark green trees
        }
        
        this.npcs = this.add.group();
        this.scenePortals = this.add.group();
    }

    protected createNPCs(): void {
        // Create forest creatures
        const forestCreature1 = new NPC(this, 200, 200, 'npc', 'npc', 120);
        const forestCreature2 = new NPC(this, 600, 400, 'npc', 'npc', 100);
        const forestCreature3 = new NPC(this, 400, 150, 'npc', 'npc', 80);
        
        // Make forest creatures move faster
        forestCreature1.setSpeed(75);
        forestCreature2.setSpeed(75); 
        forestCreature3.setSpeed(75);
        
        this.npcs.add(forestCreature1);
        this.npcs.add(forestCreature2);
        this.npcs.add(forestCreature3);
    }

    protected createPortals(): void {
        // Portal back to town
        const townPortal = this.physics.add.sprite(100, 100, 'portal');
        townPortal.setData('sceneKey', 'TownScene');
        townPortal.setDisplaySize(32, 32);
        townPortal.setTint(0x8B4513);
        this.scenePortals.add(townPortal);
        
        // Add portal label
        this.add.text(70, 60, 'Town', {
            fontSize: '16px',
            color: '#ffffff'
        });
    }
}