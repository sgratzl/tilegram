export interface Dimension {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  /** Return tile maximum dimensions, point-to-point, given edge */
  getTileSize(tileEdge: number): Dimension;

  /** Determine edge length given unit */
  getTileEdgeFromGridUnit({ width, height }: Dimension): number;
  getTileEdgeFromArea(area: number): number;

  getGridUnit(): Dimension;

  getUnitOffsetX(y: number): number;
  getUnitOffsetY(x: number): number;
  getDrawOffsetX(y: number): number;
  getDrawOffsetY(x: number): number;

  getPointsAround(center: Point, tileSize: Dimension): [number, number][];
}
