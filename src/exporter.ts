import { topology } from 'topojson-server';
import type { Feature, FeatureCollection } from 'geojson';
import type { Topology } from 'topojson-specification';
import type { Point } from './shapes/interfaces';
import { tileCenterPoint, getPointsAround } from './geometry';

interface TileGroup {
  id: string;
  tiles: Tile[];
  properties: Record<string, unknown>;
  value: number;
}

interface Tile {
  position: Point;
}

function toHexagonPoints(tile: Tile, maxTileY?: number) {
  const center = tileCenterPoint({
    x: tile.position.x,
    y: maxTileY != null ? maxTileY - tile.position.y - (maxTileY % 2) : tile.position.y,
  });
  const hexagonPoints = getPointsAround(center);
  hexagonPoints.push(hexagonPoints[0]); // loop
  return hexagonPoints;
}

export function toGeoJSON(tileGroups: readonly TileGroup[]): FeatureCollection {
  const maxTileY = tileGroups.reduce(
    (max, g) => g.tiles.reduce((acc, v) => Math.max(acc, v.position.y), max),
    Number.NEGATIVE_INFINITY
  );

  const features = tileGroups.map((group) => {
    const tilesCoordinates = group.tiles.map((tile) => toHexagonPoints(tile, maxTileY));
    const geometry =
      tilesCoordinates.length === 1
        ? {
            type: 'Polygon' as const,
            coordinates: tilesCoordinates,
          }
        : { type: 'MultiPolygon' as const, coordinates: tilesCoordinates.map((t) => [t]) };

    const f: Feature = {
      type: 'Feature',
      geometry,
      id: group.id,
      properties: group.properties,
    };
    return f;
  });
  return {
    type: 'FeatureCollection',
    features,
  };
}

export function toTopoJSON(tileGroups: readonly TileGroup[], objectName = 'tiles'): Topology {
  const geo = toGeoJSON(tileGroups);

  const topo = topology({ [objectName]: geo }, 1e10);
  // topo.properties = {
  //   tileramMetricPerTile: metricPerTile,
  //   tilegramTileSize: {width: 1, height: 1}
  // }
  return topo;
}

export function toSVG(tileGroups: readonly TileGroup[], width: number, height: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg'" width="${width}" height="${height}">
${tileGroups
  .map(
    (group) => ` <g data-id="${group.id}">
  ${group.tiles.map((tile) => `  <polygon points="${toHexagonPoints(tile).join(',')}" />`).join('\n')}
</g>`
  )
  .join('\n')}
</svg>`;
}
