/**
 * Primary geometry reference:
 * http://www.redblobgames.com/grids/hexagons/#coordinates
 */
import type { Point, Dimension, Shape } from './interfaces';

export default class PointyTopHexagonShape implements Shape {
  /** Return tile maximum dimensions, point-to-point, given edge */
  getTileSize(tileEdge: number): Dimension {
    return {
      width: Math.sqrt(3.0) * tileEdge,
      height: 2.0 * tileEdge,
    };
  }

  /** Determine edge length given unit */
  getTileEdgeFromGridUnit({ width, height }: Dimension): number {
    return Math.min(width / Math.sqrt(3.0), (height / 3.0) * 2.0);
  }

  getTileEdgeFromArea(area: number): number {
    return Math.sqrt((area * 2) / (Math.sqrt(3) * 3));
  }

  getGridUnit(): Dimension {
    return {
      width: 1.0,
      height: 0.75,
    };
  }

  getUnitOffsetX(y: number): number {
    return y % 2 === 0 ? 0 : 1;
  }

  getUnitOffsetY(): number {
    return 0.0;
  }

  getDrawOffsetX(y: number): number {
    return y % 2 === 0 ? 0.5 : 0;
  }

  getDrawOffsetY(): number {
    return 0.0;
  }

  getPointsAround(center: Point, tileSize: Dimension): [number, number][] {
    return [
      // upper left
      [center.x - tileSize.width * 0.5, center.y - tileSize.height * 0.25],
      // top
      [center.x, center.y - tileSize.height * 0.5],
      // upper right
      [center.x + tileSize.width * 0.5, center.y - tileSize.height * 0.25],
      // lower right
      [center.x + tileSize.width * 0.5, center.y + tileSize.height * 0.25],
      // bottom
      [center.x, center.y + tileSize.height * 0.5],
      // lower left
      [center.x - tileSize.width * 0.5, center.y + tileSize.height * 0.25],
    ];
  }
}
