declare module 'topogram/index.js' {
  import type { GeoPath, GeoProjection } from 'd3-geo';
  import type { Feature } from 'geojson';
  import type { Topology, GeometryObject } from 'topojson-specification';

  export interface Cartogram {
    (topology: Topology, geometries: GeometryObject[]): { features: Feature[]; arcs: number[][][] };
    path: GeoPath;
    iterations(): number;
    iterations(v: number): Cartogram;
    value(): (d: Feature) => number;
    value(v: number | ((d: Feature) => number)): Cartogram;
    projection(): GeoProjection;
    projection(v: GeoProjection): Cartogram;
    properties(): (geom: GeometryObject, topology: Topology) => Record<string, unknown>;
    properties(v: (geom: GeometryObject, topology: Topology) => Record<string, unknown>): Cartogram;

    feature(topology: Topology, geom: GeometryObject): Feature;
    features(topo: Topology, geometries: GeometryObject[]): Feature[];

    transformer(tf: {
      scale: [number, number];
      translate: [number, number];
    }): (c: [number, number]) => [number, number];
  }

  export function cartogram(): Cartogram;
}
