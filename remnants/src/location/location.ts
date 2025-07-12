export type Faction = 'neutral' | 'human' | 'enhanced' | 'contested' | 'special';

export interface Portal {
  /** ID of the location this portal leads to */
  target: string;

  /** Position of the portal inside the current location (in local coordinates) */
  x: number;
  y: number;
}

export interface Location {
  /** Unique location ID */
  id: string;

  /** Display name of the location */
  name: string;

  /** Faction alignment */
  faction: Faction;

  /** Scene size in pixels */
  width: number;
  height: number;

  /** When this location becomes available */
  unlockedBy: string;

  /** List of portals (gateways to other locations) */
  portals: Portal[];
}
