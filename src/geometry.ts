import type { Feature } from 'geojson';
import type { TileGroup } from './interfaces';
import { PointyTopHexagonShape } from './shapes';
import type { Dimension, Index, Point, Shape } from './shapes/interfaces';

const TILE_OFFSET = 1;

export class Geometry {
  constructor(public readonly shape: Shape = new PointyTopHexagonShape(), public tileEdge = 20) {}

  tileCenterPoint(index: Index): Point {
    const gridUnit = this.shape.getGridUnit();
    const size = this.shape.getTileSize(this.tileEdge);
    return {
      x: size.width * ((index.i + TILE_OFFSET) * gridUnit.width + this.shape.getDrawOffsetX(index.j)),
      y: size.height * ((index.j + TILE_OFFSET) * gridUnit.height + this.shape.getDrawOffsetY(index.i)),
    };
  }

  getPointsAround(center: Point): [number, number][] {
    const size = this.shape.getTileSize(this.tileEdge);
    return this.shape.getPointsAround(center, size);
  }

  setTileEdge(tileEdge: number) {
    this.tileEdge = tileEdge;
  }

  setTileEdgeFromArea(area: number) {
    const tileEdge = this.shape.getTileEdgeFromArea(area);
    this.setTileEdge(tileEdge);
  }

  forEachTilePosition(canvas: Dimension, cb: (index: Index) => void) {
    const tileCounts = this.getTileCounts(canvas);
    for (let i = TILE_OFFSET - 2; i < tileCounts.width + 3; i++) {
      for (let j = TILE_OFFSET - 2; j < tileCounts.height + 3; j++) {
        cb({ i, j });
      }
    }
  }

  getTileCounts(canvas: Dimension): Dimension {
    const tileSize = this.shape.getTileSize(this.tileEdge);
    const gridUnit = this.shape.getGridUnit();
    return {
      width: Math.floor(canvas.width / (tileSize.width * gridUnit.width) - TILE_OFFSET * 2),
      height: Math.floor(canvas.height / (tileSize.height * gridUnit.height) - TILE_OFFSET * 2),
    };
  }

  assignTiles(canvas: Dimension, getTileGroupAtPoint: (p: Point) => Feature | undefined | null): TileGroup[] {
    const tileGroups = new Map<Feature, TileGroup>();
    this.forEachTilePosition(canvas, (index) => {
      const point = this.tileCenterPoint(index);
      const feature = getTileGroupAtPoint(point);
      if (!feature) {
        return;
      }
      const v = tileGroups.get(feature);
      if (v) {
        v.tiles.push(index);
      } else {
        tileGroups.set(feature, { feature, tiles: [index] });
      }
    });
    return Array.from(tileGroups.values());
  }
}
