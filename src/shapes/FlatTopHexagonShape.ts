/**
 * Primary geometry reference:
 * http://www.redblobgames.com/grids/hexagons/#coordinates
 */

import type { Dimension, Shape, Point } from './interfaces';

export class FlatTopHexagonShape implements Shape {
  /** Return tile maximum dimensions, point-to-point, given edge */
  getTileSize(tileEdge: number): Dimension {
    return {
      width: 2.0 * tileEdge,
      height: Math.sqrt(3.0) * tileEdge,
    };
  }

  /** Determine edge length given unit */
  getTileEdgeFromGridUnit({ width, height }: Dimension): number {
    return Math.min((width / 3.0) * 2.0, height / Math.sqrt(3.0));
  }

  getTileEdgeFromArea(area: number): number {
    return Math.sqrt((area * 2) / (Math.sqrt(3) * 3));
  }

  getGridUnit(): Dimension {
    return {
      width: 0.75,
      height: 1.0,
    };
  }

  getUnitOffsetX(): number {
    return 0.0;
  }

  getUnitOffsetY(x: number): number {
    return x % 2 === 0 ? 0 : 1;
  }

  getDrawOffsetX(): number {
    return 0.0;
  }

  getDrawOffsetY(x: number): number {
    return x % 2 === 0 ? 0.5 : 0;
  }

  getPointsAround(center: Point, tileSize: Dimension): [number, number][] {
    return [
      // upper left
      [center.x - tileSize.width * 0.25, center.y - tileSize.height * 0.5],
      // upper right
      [center.x + tileSize.width * 0.25, center.y - tileSize.height * 0.5],
      // right
      [center.x + tileSize.width * 0.5, center.y],
      // lower right
      [center.x + tileSize.width * 0.25, center.y + tileSize.height * 0.5],
      // lower left
      [center.x - tileSize.width * 0.25, center.y + tileSize.height * 0.5],
      // left
      [center.x - tileSize.width * 0.5, center.y],
    ];
  }
}
