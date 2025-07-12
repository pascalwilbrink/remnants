import { NPC } from "../character/npc";
import { Scene } from "./scene";

export class Village extends Scene {
    async setupScene() {
        const npc1: NPC = new NPC(300, 100, 0);
        const npc2: NPC = new NPC(200, 200, 0);

        await npc1.loadSpritesheet('/assets/npc/npc1.png', '/assets/player/spritesheet.json');
        await npc2.loadSpritesheet('/assets/npc/npc2.png', '/assets/player/spritesheet.json');


        this.addCharacter(npc1);
        this.addCharacter(npc2);
    }
    
}