import { Application } from "pixi.js";

import { Scene } from "./scene/scene";
import { Player } from "./character/player";
import { initDevtools } from "@pixi/devtools";

export  class Game {

    private _app: Application;

    private _scene?: Scene;

    private _player: Player;

    private _isLoaded: boolean = false;

    constructor() {
        this._app = new Application();
        this._player = new Player(100, 100);
    }
    
    get app(): Application {
        return this._app;
    }

    get scene(): Scene | undefined {
        return this._scene;
    }

    get player(): Player {
        return this._player;
    }

    dev(): Game {
        initDevtools({ app: this.app });
  
        return this;
    }

    setScene(scene: Scene): Game {
        this._scene = scene;

        return this;
    }

    async init() {
        await this._app.init({
            width: 800,
            height: 600,
            backgroundColor: 0x1abc9c,
            antialias: true,
        });

        await this._player.loadSpritesheet('/assets/player/spritesheet.png', '/assets/player/spritesheet.json');
        
        document.getElementById('game-container')!.appendChild(this._app.canvas);
        
        this._app.stage.addChild(this._player.sprite);

        this._isLoaded = true;

        this.setupGameLoop();
    }
    
    setupGameLoop() {
        this.app.ticker.add((ticker) => {
            this.update();
        });
    }
    
    update() {
        if (this.scene && this._isLoaded) {
            this.scene!.update();
        }
    }
    

    getGameBounds() {
        return {
            width: this.app.screen.width,
            height: this.app.screen.height
        };
    }
    
    destroy() {
        if (this.scene) {
            this.scene!.destroy();
        }
        this.app.destroy();
    }
}
