import { Application } from "pixi.js";
import { initDevtools } from "@pixi/devtools";
import { MovementBounds } from "./system/movement.controller";
import { InputManager } from "./system/input.manager";
import { Scene } from "./scene/scene";
import { Player } from "./character/player";
import { LocationManager } from "./location/location.manager";
import { MapOverlay } from "./ui/map";

export class Game {
    private _app: Application;
    private _inputManager: InputManager;
    private scene: Scene;
    private _player: Player;
    private _isLoaded: boolean = false;

    private locationManager: LocationManager;

    private mapOverlay: MapOverlay;

    private keys: any = {};

    constructor() {
        this._app = new Application();
        this._inputManager = new InputManager();
        this._player = new Player(100, 100, this._inputManager);

        this.locationManager = new LocationManager();
        this.scene = new Scene(this, this.locationManager);
        this.mapOverlay = new MapOverlay(this);
    }

    get app(): Application { return this._app; }
    get player(): Player { return this._player; }
    get inputManager(): InputManager { return this._inputManager; }

    dev(): Game {
        initDevtools({ app: this.app });
        return this;
    }

    async init() {
        await this._app.init({
            width: 800,
            height: 600,
            backgroundColor: 0x1abc9c,
            antialias: true,
        });
        

        
        await this.mapOverlay.init();
        await this.locationManager.loadFromFile('/assets/locations.json');
        await this._player.loadSpritesheet('/assets/player/spritesheet.png', '/assets/player/spritesheet.json');
        
        await this.scene.init();
        document.getElementById('game-container')!.appendChild(this._app.canvas);
        this._app.stage.addChild(this._player.sprite);

        this._isLoaded = true;
        this.setupGameLoop();
        this.handleInput();
    }

    private setupGameLoop() {
        this.app.ticker.add(() => {
            if (this.scene && this._isLoaded) {
                this.scene.update();
            }
        });
    }

    private handleInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Handle map toggle
            if (e.key.toLowerCase() === 'x') {
                this.mapOverlay.toggle();
                // Update player's map state
             //   this.player.setMapOpen(this.mapOverlay.isVisible);
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    getGameBounds(): MovementBounds {
        return {
            width: this.app.screen.width,
            height: this.app.screen.height
        };
    }

    destroy() {
        this.scene?.destroy();
        this._inputManager.destroy();
        this._player.destroy();
        this._app.destroy();
    }
}