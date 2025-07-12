// collision.ts - Collision detection utilities
import { Character } from '../character/character';

export class CollisionSystem {
    /**
     * Check if two circular hitboxes overlap
     */
    static checkCircularCollision(
        x1: number, y1: number, radius1: number,
        x2: number, y2: number, radius2: number
    ): boolean {
        const dx = x1 - x2;
        const dy = y1 - y2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (radius1 + radius2);
    }

    /**
     * Check if two rectangular hitboxes overlap
     */
    static checkRectangularCollision(
        x1: number, y1: number, width1: number, height1: number,
        x2: number, y2: number, width2: number, height2: number
    ): boolean {
        return x1 < x2 + width2 &&
               x1 + width1 > x2 &&
               y1 < y2 + height2 &&
               y1 + height1 > y2;
    }

    /**
     * Check collision between two characters using circular collision
     */
    static checkCharacterCollision(char1: Character, char2: Character): boolean {
        const radius1 = Math.min(char1.sprite.width, char1.sprite.height) / 2;
        const radius2 = Math.min(char2.sprite.width, char2.sprite.height) / 2;
        
        return this.checkCircularCollision(
            char1.sprite.x, char1.sprite.y, radius1,
            char2.sprite.x, char2.sprite.y, radius2
        );
    }

    /**
     * Get collision resolution vector - returns the direction the first character should move to resolve collision
     */
    static getCollisionResolution(char1: Character, char2: Character): { x: number, y: number } {
        const dx = char1.sprite.x - char2.sprite.x;
        const dy = char1.sprite.y - char2.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) {
            // If characters are at exact same position, push in random direction
            const angle = Math.random() * Math.PI * 2;
            return { x: Math.cos(angle), y: Math.sin(angle) };
        }
        
        // Normalize the direction vector
        return { x: dx / distance, y: dy / distance };
    }

    /**
     * Check if a character would collide with any other characters at a given position
     */
    static wouldCollideAtPosition(
        character: Character, 
        newX: number, 
        newY: number, 
        otherCharacters: Character[]
    ): Character | null {
        const radius = Math.min(character.sprite.width, character.sprite.height) / 2;
        
        for (const other of otherCharacters) {
            if (other === character) continue;
            
            const otherRadius = Math.min(other.sprite.width, other.sprite.height) / 2;
            
            if (this.checkCircularCollision(newX, newY, radius, other.sprite.x, other.sprite.y, otherRadius)) {
                return other;
            }
        }
        
        return null;
    }
}