import { Container, FederatedPointerEvent, Graphics, Text, TextStyle } from "pixi.js";
import { Game } from "../app";
import { Character } from "../character/character";
import { LocationManager } from "../location/location.manager";
import { Location, Portal } from "../location/location";

export class Scene {
    protected game: Game;
    protected container: Container;
    protected characters: Character[] = [];

    private locationTitleText: Text | null = null;

    private portals: Graphics[] = [];

    constructor(game: Game, private locationManager: LocationManager) {
        this.game = game;
        this.container = new Container();
        game.app.stage.addChild(this.container);
    }

    public init() {
        this.setupScene();
    }

    setupScene(): void {
        const currentLocation = this.locationManager.currentLocation;

        console.log('current location: ', currentLocation);
        if (currentLocation) {
            this.characters.forEach((character) => character.destroy());
            this.characters = [];

            // Clean up existing portals
            this.clearPortals();
            
            // Setup location title
            this.setupLocationTitle(currentLocation);
               
            // Setup portals
            this.setupPortals(currentLocation);
        }

    }


    private setupLocationTitle(location: Location) {
        // Remove existing title if any
        if (this.locationTitleText) {
            this.container.removeChild(this.locationTitleText);
            this.locationTitleText.destroy();
        }

        // Create text style
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fontWeight: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            dropShadow: true,
            
        });

        // Create text object
        this.locationTitleText = new Text(location.name, style);
        
        // Position in bottom right corner
        this.positionLocationTitle();
        
        // Add to container
        this.container.addChild(this.locationTitleText);
    }

    private positionLocationTitle() {
        if (!this.locationTitleText) return;

        const bounds = this.game.getGameBounds();
        const padding = 20; // Distance from edges
        
        // Position in bottom right
        this.locationTitleText.x = bounds.width - this.locationTitleText.width - padding;
        this.locationTitleText.y = bounds.height - this.locationTitleText.height - padding;
    }

    private setupPortals(location: Location) {
        location.portals.forEach(portal => {
            this.createPortal(portal);
        });
    }

    private createPortal(portal: Portal) {
        const portalGraphic = new Graphics();
        
        // Draw portal circle
        portalGraphic.beginFill(0x00AAFF, 0.7); // Blue with transparency
        portalGraphic.lineStyle(3, 0x0088CC, 1); // Darker blue border
        portalGraphic.drawCircle(0, 0, 30); // 30px radius
        portalGraphic.endFill();
        
        // Add inner glow effect
        portalGraphic.beginFill(0x66CCFF, 0.4);
        portalGraphic.drawCircle(0, 0, 20);
        portalGraphic.endFill();
        
        // Position the portal
        portalGraphic.x = portal.x;
        portalGraphic.y = portal.y;
        
        // Make interactive
        portalGraphic.eventMode = 'static';
        portalGraphic.cursor = 'pointer';
        
        // Add hover effects
        portalGraphic.on('pointerover', () => {
            portalGraphic.scale.set(1.1);
            portalGraphic.alpha = 1;
        });
        
        portalGraphic.on('pointerout', () => {
            portalGraphic.scale.set(1);
            portalGraphic.alpha = 0.8;
        });
        
        // Handle portal activation
        portalGraphic.on('pointerdown', (event: FederatedPointerEvent) => {
            this.onPortalClick(portal, event);
        });
        
        // Store portal data for reference
        (portalGraphic as any).portalData = portal;
        
        // Set initial alpha
        portalGraphic.alpha = 0.8;
        
        // Add to scene and tracking array
        this.container.addChild(portalGraphic);
        this.portals.push(portalGraphic);
    }

    private onPortalClick(portal: Portal, event: FederatedPointerEvent) {
        // Check if player is close enough to use portal
        const playerPos = this.game.player.getPosition();
        const distance = Math.sqrt(
            Math.pow(playerPos.x - portal.x, 2) + 
            Math.pow(playerPos.y - portal.y, 2)
        );
        
        const interactionRange = 60; // pixels
        
        if (distance <= interactionRange) {
            // Travel to target location
            this.locationManager.travelTo(portal.target);
            this.setupScene();
        } else {
            // Optionally show message that player is too far
            console.log(`Player too far from portal (distance: ${distance.toFixed(1)}px, range: ${interactionRange}px)`);
        }
    }

    private clearPortals() {
        this.portals.forEach(portal => {
            this.container.removeChild(portal);
            portal.destroy();
        });
        this.portals = [];
    }

    update() {
        const bounds = this.game.getGameBounds();
        const allCharacters = [this.game.player, ...this.characters];

        // Update player
        this.game.player.update(bounds, this.characters);

        // Update all NPCs
        this.characters.forEach(character => {
            const otherCharacters = allCharacters.filter(c => c !== character);
            character.update(bounds, otherCharacters);
        });
    }

    addCharacter(character: Character) {
        this.characters.push(character);
        this.container.addChild(character.sprite);
    }

    removeCharacter(character: Character) {
        const index = this.characters.indexOf(character);
        if (index > -1) {
            this.characters.splice(index, 1);
            this.container.removeChild(character.sprite);
            character.destroy();
        }
    }

    getCharacters(): Character[] {
        return [...this.characters];
    }

    destroy() {
        this.characters.forEach(character => character.destroy());
        this.characters = [];
        this.game.app.stage.removeChild(this.container);
        this.container.destroy();
    }

    
}