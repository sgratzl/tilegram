import type { Point, Shape } from './shapes/interfaces';
import PointyTopHexagonShape from './shapes/PointyTopHexagonShape';

const shape: Shape = new PointyTopHexagonShape();
const TILE_OFFSET = 1;

const TILE_EDGE_SIZE = 20;

export function tileCenterPoint(position: Point): Point {
  const gridUnit = shape.getGridUnit();
  const size = shape.getTileSize(TILE_EDGE_SIZE);
  return {
    x: size.width * ((position.x + TILE_OFFSET) * gridUnit.width + shape.getDrawOffsetX(position.y)),
    y: size.height * ((position.y + TILE_OFFSET) * gridUnit.height + shape.getDrawOffsetY(position.x)),
  };
}

export function getPointsAround(center: Point): [number, number][] {
  const size = shape.getTileSize(TILE_EDGE_SIZE);
  return shape.getPointsAround(center, size);
}
