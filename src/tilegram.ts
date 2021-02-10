import { geoAlbersUsa, geoBounds, geoContains, geoMercator, geoPath, GeoProjection } from 'd3-geo';
import type { Feature, FeatureCollection } from 'geojson';
import { cartogram } from 'topogram/index.js';
import type { GeometryCollection, Topology } from 'topojson-specification';
import { toGeoJSON, toSVG, toTopoJSON } from './exporter';
import { Geometry } from './geometry';
import type { TileGroup } from './interfaces';
import type { Point } from './shapes';
// import './shims';

export interface TilegramTopoplogyOptions {
  canvasWidth: number;
  canvasHeight: number;
  projection: GeoProjection;
  iterations: number;
  tileScaleFactor: number;
}

export interface TileGramResult {
  tiles: TileGroup[];
  toTopoJSON(): Topology;
  toGeoJSON(): FeatureCollection;
  toSVG(): string;
}

export function tilegramTopology(
  topology: Topology,
  objectId: string,
  valueFn: (f: Feature) => number,
  options: Partial<TilegramTopoplogyOptions> = {}
): TileGramResult {
  const canvas = { width: options.canvasWidth ?? 800, height: options.canvasHeight ?? 600 };
  const projection =
    options.projection ??
    geoAlbersUsa()
      .scale(canvas.width)
      .translate([canvas.width * 0.5, canvas.height * 0.5]);
  const transformed = loadTransformedProjectedTopology(topology, valueFn, {
    objectId,
    iterations: options.iterations,
    projection,
  });
  const accValues = transformed.features.reduce((acc, d) => acc + valueFn(d), 0);
  const geo = new Geometry();
  const area = computeArea(transformed);
  const idealHexArea = (area * (options.tileScaleFactor ?? 1)) / accValues;
  geo.setTileEdgeFromArea(idealHexArea);
  const lookup = createContainsPointLookup(transformed);
  const tiles = geo.assignTiles(canvas, lookup);
  return {
    tiles,
    toTopoJSON: () => toTopoJSON(tiles, geo, objectId),
    toGeoJSON: () => toGeoJSON(tiles, geo),
    toSVG: () => toSVG(tiles, geo, canvas.width, canvas.height),
  };
}

export function loadTransformedProjectedTopology(
  topology: Topology,
  valueFn: (d: Feature) => number,
  {
    objectId = 'states',
    projection = geoMercator(),
    iterations = 8,
  }: {
    objectId?: string;
    projection?: GeoProjection;
    iterations?: number;
  }
): FeatureCollection {
  const c = cartogram();
  c.iterations(iterations);
  c.value(valueFn);
  c.projection(projection);
  c.properties((d) => d.properties ?? {});
  const r = c(topology, (topology.objects[objectId] as GeometryCollection).geometries);
  return {
    type: 'FeatureCollection',
    features: r.features,
  };
}

export function computeArea(collection: FeatureCollection) {
  const path = geoPath();
  const featureAreas = collection.features.map((feature) => {
    const featureArea = path.area(feature);
    if (Number.isNaN(featureArea)) {
      return 0;
    }
    return featureArea;
  });
  return featureAreas.reduce((a, b) => a + b);
}

// /** Find feature that contains given point */
// export function getFeatureAtPoint(collection: FeatureCollection, point: Point) {
//   const pointDimensions = [point.x, point.y];

//   collection.features.find((d) => {});
//   // for each feature: check if point is within bounds, then within path
//   return this._stateFeatures.features.find((feature, featureIndex) => {
//     const bounds = this._projectedStates[featureIndex].bounds;
//     if (!checkWithinBounds(pointDimensions, bounds || this._generalBounds)) {
//       return false;
//     }
//     const matchingPath = this._projectedStates[featureIndex].paths.find((path) => inside(pointDimensions, path[0]));
//     return matchingPath != null;
//   });
// }

function inBounds(bounds: [[number, number], [number, number]], { x, y }: Point) {
  // [[left, bottom], [right, top]]
  if (x < bounds[0][0] || x > bounds[1][0] || y < bounds[0][1] || y > bounds[1][1]) {
    return false;
  }
  return true;
}

export function createContainsPointLookup(collection: FeatureCollection) {
  const bounds = geoBounds(collection);
  const boundsPerFeature = collection.features.map((feature) => geoBounds(feature));
  return (point: Point): Feature | undefined | null => {
    const p: [number, number] = [point.x, point.y];
    if (!inBounds(bounds, point)) {
      return null;
    }
    return collection.features.find((d, i) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return inBounds(boundsPerFeature[i], point) && geoContains(d as any, p);
    });
  };
}
