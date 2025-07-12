import Phaser from 'phaser';
import { Player } from '../characters/player';
import { NPC } from '../characters/npc';
import { TextBox } from '../ui/textbox';

export abstract class BaseScene extends Phaser.Scene {
    protected player!: Player;
    protected npcs!: Phaser.GameObjects.Group;
    protected scenePortals!: Phaser.GameObjects.Group;
    protected textBox!: TextBox;

    constructor(key: string) {
        super({ key });
    }

    public create(): void {
        this.createWorld();
        this.createPlayer();
        this.createNPCs();
        this.createPortals();
        this.setupInteractions();
        this.setupUI();
    }

    protected abstract createWorld(): void;
    protected abstract createNPCs(): void;
    protected abstract createPortals(): void;
    protected abstract getPlayerSpawnPoint(): { x: number, y: number };


    protected createPlayer(): void {
        const spawnPoint = this.getPlayerSpawnPoint();
        this.player = new Player(this, spawnPoint.x, spawnPoint.y);
    }

    protected setupInteractions(): void {
        // Player-NPC interaction
        this.physics.add.overlap(this.player, this.npcs, (player, npc) => {
            if (this.input.keyboard!.checkDown(this.input.keyboard!.addKey('SPACE'), 100)) {
                (npc as NPC).getInteractionMessage()
                    .then((message) => {
                        this.textBox.showInteractionPrompt(npc, `${message} (Press SPACE)`);
                    });

                (npc as NPC).onInteract();
            }
        });

        this.physics.world.on('worldstep', () => {
            let isOverlappingNPC = false;
            this.npcs.children.entries.forEach(npc => {
                if (this.physics.overlap(this.player, npc)) {
                    isOverlappingNPC = true;
                }
            });
            
            // If not overlapping with any NPC and we have an NPC as current interactable, hide prompt
            if (!isOverlappingNPC && this.textBox.getCurrentInteractable() && this.npcs.children.entries.includes(this.textBox.getCurrentInteractable())) {
                this.textBox.hideInteractionPrompt();
            }
        });

        // Player-Portal interaction
        this.physics.add.overlap(this.player, this.scenePortals, (player, portal) => {
            console.log('portal: ', portal);

            const portalData = (portal as Phaser.Types.Physics.Arcade.GameObjectWithBody).getData('sceneKey');
            if (portalData) {
                this.scene.start(portalData);
            }
        });
    }

    protected setupUI(): void {
        // Scene title
        this.add.text(10, 10, this.scene.key, {
            fontSize: '24px',
            color: '#ffffff'
        });

        // Instructions
        this.add.text(10, 550, 'Arrow keys to move, SPACE to interact', {
            fontSize: '16px',
            color: '#ffffff'
        });

        this.textBox = new TextBox(this);

        this.textBox.displayMessage('Welcome to the game!', 3000);
    }

    public displayMessage(message: string, duration: number = 3000): void {
        this.textBox.displayMessage(message, duration);
    }

    public clearMessage(): void {
        this.textBox.clear();
    }

    public update(time: number, delta: number): void {
        this.player.update(time, delta);
        
        this.npcs.children.entries.forEach(npc => {
            (npc as NPC).update(time, delta);
        });
    }
}
