import { Location } from "./location";

export class LocationManager {

    private locations: Map<string, Location> = new Map();
    public currentLocation: Location | null = null;
  
    constructor() {
    }

    async loadFromFile(path: string): Promise<void> {
        const response = await fetch(path);
        const data: Location[] = await response.json();
    
        data.forEach(location => {
          this.locations.set(location.id, location);
        });
    
        // Optionally set a default starting location
        this.currentLocation = this.getLocation('kadesh')!;
      }
    
      getLocation(id: string): Location | undefined {
        return this.locations.get(id);
      }
    
      getAllLocations(): Location[] {
        return Array.from(this.locations.values());
      }
    
      setCurrentLocation(id: string): void {
        const loc = this.getLocation(id);
        if (loc) this.currentLocation = loc;
      }

      travelTo(locationId: string): boolean {
        const targetLocation = this.locations.get(locationId);
        
        if (!targetLocation) {
            console.warn(`Location with id '${locationId}' not found`);
            return false;
        }

        // Check if location is unlocked
        if (!this.isLocationUnlocked(targetLocation)) {
            console.warn(`Location '${targetLocation.name}' is not yet unlocked`);
            return false;
        }

        // Set new current location
        this.currentLocation = targetLocation;
        
        // Trigger scene update (this would typically emit an event or call a callback)
        this.onLocationChanged(targetLocation);
        
        return true;
    }

    private isLocationUnlocked(location: Location): boolean {
        // Implementation depends on your unlock system
        // Could check game state, completed quests, etc.
        return true; // For now, all locations are unlocked
    }

    private onLocationChanged(newLocation: Location): void {
        // This might emit an event that the scene listens to
        // Or directly call scene.setupScene() if you have that reference
        console.log(`Traveled to: ${newLocation.name}`);
    }
}
