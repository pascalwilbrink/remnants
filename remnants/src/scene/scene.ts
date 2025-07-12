import { Container, Application, Graphics } from "pixi.js";
import { Character } from "../character/character";
import { Player } from "../character/player";
import { Game } from "../app";

export abstract class Scene {

    private game: Game;
    private app: Application;
    private container: Container;

    private characters: Character[];

    private player: Player;

    private keys: any = {};

    constructor(game: Game) {
        this.game = game;
        this.app = game.app;
        this.player = game.player;

        this.container = new Container();
        this.app.stage.addChild(this.container);

        this.characters = [];
        
        this.setupScene();
        this.setupInput();
    }
    
    abstract setupScene(): void;
    
    setupInput() {
        this.keys = {};
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    handleInput() {

    }
    
    update() {
        this.handleInput();
        
        this.player.update(this.game);
        
        // Update all characters
        this.characters.forEach(character => {
            character.update(this.game);
        });
    }
    
    getCharacters() {
        return this.characters;
    }

    // Add method to add characters to both array and display
    addCharacter(character: Character) {
        this.characters.push(character);
        this.container.addChild(character.sprite);
    }
    
    // Add method to remove characters
    removeCharacter(character: Character) {
        const index = this.characters.indexOf(character);
        if (index > -1) {
            this.characters.splice(index, 1);
            this.container.removeChild(character.sprite);
        }
    }
    
    destroy() {
        this.characters.forEach(character => character.destroy());
        this.characters = [];
        this.app.stage.removeChild(this.container);
        this.container.destroy();
    }
}