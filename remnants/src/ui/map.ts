// src/ui/map.ts
import { Container, Graphics, Text, Application } from 'pixi.js';
import { Game } from '../app';

interface Region {
    id: string;
    label: string;
    x: number;
    y: number;
    color: number;
}

interface Connection {
    from: string;
    to: string;
}

export class MapOverlay {
    private container: Container;
    private background!: Graphics;
    private mapContainer: Container;
    private isVisible: boolean = false;
    private game: Game;
    
    private regions: Region[] = [
        { id: "kadesh", label: "Kadesh", x: 500, y: 400, color: 0xcccccc },
        { id: "scrap_haven", label: "Scrap Haven", x: 420, y: 480, color: 0xcccccc },
        { id: "shatterdust_pub", label: "Shatterdust Pub", x: 550, y: 480, color: 0xcccccc },
        { id: "forgotten_port", label: "Forgotten Port", x: 650, y: 550, color: 0xcccccc },
        { id: "relay_tower", label: "Relay Tower", x: 250, y: 300, color: 0x66ccff },
        { id: "resistance_camp", label: "Resistance Camp", x: 200, y: 400, color: 0x66ccff },
        { id: "fortress_yard", label: "Fortress Yard", x: 100, y: 450, color: 0x66ccff },
        { id: "broadcast_tower", label: "Broadcast Tower", x: 150, y: 550, color: 0x66ccff },
        { id: "neural_spire", label: "Neural Spire", x: 750, y: 300, color: 0xcc99ff },
        { id: "neurolab", label: "NeuroLoom Lab", x: 850, y: 250, color: 0xcc99ff },
        { id: "tower_synex", label: "Tower Synex", x: 850, y: 350, color: 0xcc99ff },
        { id: "ai_hub", label: "AI Council", x: 900, y: 200, color: 0xcc99ff },
        { id: "comms_array", label: "Comms Array", x: 400, y: 300, color: 0xff9999 },
        { id: "graveyard", label: "Graveyard", x: 350, y: 200, color: 0xff9999 },
        { id: "blacksite", label: "Blacksite", x: 200, y: 100, color: 0xffee88 },
        { id: "first_core", label: "First AI Core", x: 500, y: 100, color: 0xffee88 },
        { id: "battle_zone", label: "Battle Zone", x: 500, y: 250, color: 0xff4444 },
    ];

    private connections: [string, string][] = [
        ["kadesh", "scrap_haven"],
        ["kadesh", "shatterdust_pub"],
        ["kadesh", "comms_array"],
        ["kadesh", "relay_tower"],
        ["kadesh", "neural_spire"],
        ["kadesh", "resistance_camp"],
        ["kadesh", "forgotten_port"],
        ["relay_tower", "resistance_camp"],
        ["resistance_camp", "fortress_yard"],
        ["resistance_camp", "broadcast_tower"],
        ["neural_spire", "neurolab"],
        ["neural_spire", "tower_synex"],
        ["neural_spire", "ai_hub"],
        ["comms_array", "graveyard"],
        ["graveyard", "blacksite"],
        ["blacksite", "first_core"],
        ["resistance_camp", "battle_zone"],
        ["neural_spire", "battle_zone"],
        ["kadesh", "battle_zone"]
    ];

    private regionMap: { [key: string]: { x: number; y: number } } = {};

    constructor(game: Game) {
        this.game = game;
        this.container = new Container();
        this.mapContainer = new Container();
        

    }

    public init() {
        this.createBackground();
        this.createMap();
        this.setupInteraction();
        
        this.container.addChild(this.background);
        this.container.addChild(this.mapContainer);
        
        // Initially hidden
        this.container.visible = false;
        this.container.zIndex = 1000; // Ensure it's on top
        
        // Add to stage
        this.game.app.stage.addChild(this.container);
    }

    private createBackground() {
        this.background = new Graphics();
        const bounds = this.game.getGameBounds();
        
        // Semi-transparent dark background
        this.background.beginFill(0x000000, 0.8);
        this.background.drawRect(0, 0, bounds.width, bounds.height);
        this.background.endFill();
        
        // Map panel background
        const panelX = bounds.width * 0.1;
        const panelY = bounds.height * 0.1;
        const panelWidth = bounds.width * 0.8;
        const panelHeight = bounds.height * 0.8;
        
        // Cybernetic-style border
        this.background.lineStyle(3, 0x00ffff, 1);
        this.background.beginFill(0x001122, 0.95);
        this.background.drawRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);
        this.background.endFill();
        
        // Add corner details for cybernetic feel
        this.background.lineStyle(2, 0x00ffff, 0.7);
        // Top left corner
        this.background.moveTo(panelX + 20, panelY);
        this.background.lineTo(panelX, panelY);
        this.background.lineTo(panelX, panelY + 20);
        
        // Top right corner
        this.background.moveTo(panelX + panelWidth - 20, panelY);
        this.background.lineTo(panelX + panelWidth, panelY);
        this.background.lineTo(panelX + panelWidth, panelY + 20);
        
        // Bottom left corner
        this.background.moveTo(panelX, panelY + panelHeight - 20);
        this.background.lineTo(panelX, panelY + panelHeight);
        this.background.lineTo(panelX + 20, panelY + panelHeight);
        
        // Bottom right corner
        this.background.moveTo(panelX + panelWidth - 20, panelY + panelHeight);
        this.background.lineTo(panelX + panelWidth, panelY + panelHeight);
        this.background.lineTo(panelX + panelWidth, panelY + panelHeight - 20);

        // Title
        const title = new Text('NEURAL MAP INTERFACE', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0x00ffff,
            fontWeight: 'bold'
        });
        title.x = bounds.width / 2 - title.width / 2;
        title.y = panelY + 20;
        this.background.addChild(title);

        // Instructions
        const instructions = new Text('Press X to close', {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xaaaaaa
        });
        instructions.x = bounds.width / 2 - instructions.width / 2;
        instructions.y = panelY + panelHeight - 40;
        this.background.addChild(instructions);
    }

    private createMap() {
        const bounds = this.game.getGameBounds();
        const mapScale = 0.6; // Scale down the map to fit in panel
        const offsetX = bounds.width * 0.2; // Center the map
        const offsetY = bounds.height * 0.25;

        // First, draw connections (lines)
        this.connections.forEach(([from, to]) => {
            const fromRegion = this.regions.find(r => r.id === from);
            const toRegion = this.regions.find(r => r.id === to);
            
            if (fromRegion && toRegion) {
                const line = new Graphics();
                line.lineStyle(2, 0x888888, 0.7);
                line.moveTo(
                    fromRegion.x * mapScale + offsetX, 
                    fromRegion.y * mapScale + offsetY
                );
                line.lineTo(
                    toRegion.x * mapScale + offsetX, 
                    toRegion.y * mapScale + offsetY
                );
                this.mapContainer.addChild(line);
            }
        });

        // Then, draw regions (circles and labels)
        this.regions.forEach(region => {
            const scaledX = region.x * mapScale + offsetX;
            const scaledY = region.y * mapScale + offsetY;
            
            // Store scaled coordinates
            this.regionMap[region.id] = { x: scaledX, y: scaledY };
            
            // Create region circle with glow effect
            const circle = new Graphics();
            
            // Outer glow
            circle.beginFill(region.color, 0.3);
            circle.drawCircle(0, 0, 16);
            circle.endFill();
            
            // Main circle
            circle.beginFill(region.color, 0.9);
            circle.drawCircle(0, 0, 12);
            circle.endFill();
            
            // Inner highlight
            circle.beginFill(0xffffff, 0.6);
            circle.drawCircle(-2, -2, 4);
            circle.endFill();
            
            circle.x = scaledX;
            circle.y = scaledY;
            
            // Make regions interactive
            circle.interactive = true;
            circle.cursor = 'pointer';
            circle.on('pointerover', () => {
                circle.tint = 0xffff00; // Highlight on hover
            });
            circle.on('pointerout', () => {
                circle.tint = 0xffffff; // Remove highlight
            });
            circle.on('pointerdown', () => {
                console.log(`Selected region: ${region.label}`);
                // Add your region selection logic here
            });
            
            this.mapContainer.addChild(circle);
            
            // Create label
            const label = new Text(region.label, {
                fontFamily: 'Arial',
                fontSize: 10,
                fill: 0xffffff,
                stroke: 0x000000,
                fontWeight: '600'                
            });
            label.x = scaledX + 14;
            label.y = scaledY - 6;
            this.mapContainer.addChild(label);
        });

        // Add current location indicator (assuming player starts at Kadesh)
        this.addPlayerLocationIndicator("kadesh");
    }

    private addPlayerLocationIndicator(regionId: string) {
        const region = this.regionMap[regionId];
        if (!region) return;

        const indicator = new Graphics();
        
        // Pulsing animation circle
        indicator.lineStyle(3, 0x00ff00, 1);
        indicator.drawCircle(0, 0, 20);
        indicator.x = region.x;
        indicator.y = region.y;
        
        // Add pulsing animation
        let scale = 1;
        let growing = true;
        const pulse = () => {
            if (growing) {
                scale += 0.02;
                if (scale >= 1.3) growing = false;
            } else {
                scale -= 0.02;
                if (scale <= 1) growing = true;
            }
            indicator.scale.set(scale);
        };
        
        // Add to ticker for animation
        this.game.app.ticker.add(pulse);
        
        this.mapContainer.addChild(indicator);
    }

    private setupInteraction() {
        // Make background clickable to close
        this.background.interactive = true;
        this.background.on('pointerdown', (event) => {
            // Only close if clicking on the background itself, not the map elements
            const localPos = this.background.toLocal(event.global);
            const bounds = this.game.getGameBounds();
            const panelX = bounds.width * 0.1;
            const panelY = bounds.height * 0.1;
            const panelWidth = bounds.width * 0.8;
            const panelHeight = bounds.height * 0.8;
            
            // If clicking outside the panel area, close the map
            if (localPos.x < panelX || localPos.x > panelX + panelWidth ||
                localPos.y < panelY || localPos.y > panelY + panelHeight) {
                this.hide();
            }
        });
    }

    public toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    public show() {
        this.container.visible = true;
        this.isVisible = true;
        
        // Add entrance animation
        this.container.alpha = 0;
        this.container.scale.set(0.8);
        
        const animateIn = () => {
            this.container.alpha += 0.1;
            this.container.scale.x += 0.02;
            this.container.scale.y += 0.02;
            
            if (this.container.alpha >= 1) {
                this.container.alpha = 1;
                this.container.scale.set(1);
                this.game.app.ticker.remove(animateIn);
            }
        };
        
        this.game.app.ticker.add(animateIn);
    }

    public hide() {
        // Add exit animation
        const animateOut = () => {
            this.container.alpha -= 0.15;
            this.container.scale.x -= 0.03;
            this.container.scale.y -= 0.03;
            
            if (this.container.alpha <= 0) {
                this.container.visible = false;
                this.isVisible = false;
                this.container.alpha = 1;
                this.container.scale.set(1);
                this.game.app.ticker.remove(animateOut);
            }
        };
        
        this.game.app.ticker.add(animateOut);
    }

    public destroy() {
        this.game.app.stage.removeChild(this.container);
        this.container.destroy();
    }
}