import { topology } from 'topojson-server';
import type { Feature, FeatureCollection } from 'geojson';
import type { Topology } from 'topojson-specification';
import type { Index } from './shapes/interfaces';
import type { Geometry } from './geometry';
import type { TileGroup } from './interfaces';
import { geoPath } from 'd3-geo';

function toHexagonPoints(geometry: Geometry, tile: Index, maxTileJ?: number) {
  const center = geometry.tileCenterPoint({
    i: tile.i,
    j: maxTileJ != null ? maxTileJ - tile.j - (maxTileJ % 2) : tile.j,
  });
  const hexagonPoints = geometry.getPointsAround(center);
  hexagonPoints.push(hexagonPoints[0]); // loop
  return hexagonPoints;
}

export function toGeoJSON(tileGroups: readonly TileGroup[], geometry: Geometry): FeatureCollection {
  const maxTileJ = tileGroups.reduce(
    (max, g) => g.tiles.reduce((acc, v) => Math.max(acc, v.j), max),
    Number.NEGATIVE_INFINITY
  );

  const features = tileGroups.map((group) => {
    const tilesCoordinates = group.tiles.map((tile) => toHexagonPoints(geometry, tile, maxTileJ));
    const geo =
      tilesCoordinates.length === 1
        ? {
            type: 'Polygon' as const,
            coordinates: tilesCoordinates,
          }
        : { type: 'MultiPolygon' as const, coordinates: tilesCoordinates.map((t) => [t]) };

    const f: Feature = {
      ...group.feature,
      type: 'Feature',
      geometry: geo,
    };
    return f;
  });
  return {
    type: 'FeatureCollection',
    features,
  };
}

export function toTopoJSON(tileGroups: readonly TileGroup[], geometry: Geometry, objectName = 'tiles'): Topology {
  const geo = toGeoJSON(tileGroups, geometry);

  const topo = topology({ [objectName]: geo }, 1e10);
  // topo.properties = {
  //   tileramMetricPerTile: metricPerTile,
  //   tilegramTileSize: {width: 1, height: 1}
  // }
  return topo;
}

export function toSVG(tileGroups: readonly TileGroup[], geometry: Geometry, width: number, height: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
${tileGroups
  .map(
    (group) => ` <g data-id="${group.feature.id}">
    <title>${group.feature.properties?.name}</title>
  ${group.tiles.map((tile) => `  <polygon points="${toHexagonPoints(geometry, tile).join(',')}" />`).join('\n')}
</g>`
  )
  .join('\n')}
</svg>`;
}

export function toTransformedSVG(features: FeatureCollection, width: number, height: number) {
  const path = geoPath().projection(null);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
${features.features.map((f) => `<path d="${path(f)}" />`).join('\n')}
</svg>`;
}
