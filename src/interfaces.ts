import type { Feature } from 'geojson';
import type { Index } from './shapes';

export interface TileGroup {
  feature: Feature;
  tiles: Index[];
}
