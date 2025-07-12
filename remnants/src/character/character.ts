import { Sprite }  from 'pixi.js';
import { Game } from '../app';

export class Character {
    protected _sprite: Sprite;
    protected _speed: number;
    protected _color: number;

    protected _width: number = 50;
    protected _height: number = 50;

    constructor(x = 0, y = 0, color = 0x3498db) {
        this._sprite = new Sprite();
        this._speed = 3;
        this._color = color;
        
        this.createSprite();
    //    this.setPosition(x, y);
    }
    
    get sprite(): Sprite {
        return this._sprite;
    }

    get speed(): number {
        return this._speed;
    }

    get color(): number {
        return this._color;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }


    createSprite() {
      
    }
    
    setPosition(x: number, y: number) {
        this.sprite.x = x;
        this.sprite.y = y;
    }
    
    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }
    
    move(dx: number, dy: number, game: Game) {
        const newX = this.sprite.x + dx * this.speed;
        const newY = this.sprite.y + dy * this.speed;
        
        // Keep character within bounds
        const bounds = game.getGameBounds();
        this.sprite.x = Math.max(25, Math.min(bounds.width - 25, newX));
        this.sprite.y = Math.max(25, Math.min(bounds.height - 25, newY));
    }
    
    update(game: Game) {
        this.sprite.y += Math.sin(Date.now() * 0.002 + this.sprite.x * 0.01) * 0.5;
    }
    
    destroy() {
        if (this.sprite.parent) {
            this.sprite.parent.removeChild(this.sprite);
        }
        this.sprite.destroy();
    }
}